// --- 0. Compatibility Layer for Firefox and Chromium ---
// Use Chrome API on Chromium, Firefox API on Firefox
const API = (() => {
  if (typeof browser !== 'undefined' && browser.runtime) {
    return browser;
  }
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    return chrome;
  }
  console.error('JaDict: No extension API available');
  return null;
})();

// This script runs on every page
const POPUP_ID = 'quick-dict-popup-iframe';
const CURRENT_HOSTNAME = typeof window !== 'undefined' && window.location?.hostname
  ? window.location.hostname.toLowerCase()
  : '';

const DEFAULT_EXTENSION_SETTINGS = {
  extensionEnabled: true,
  theme: 'light',
  blockedSites: []
};

let extensionSettings = { ...DEFAULT_EXTENSION_SETTINGS };
let pageEnabled = true;

function normalizeExtensionSettings(raw) {
  const normalized = { ...DEFAULT_EXTENSION_SETTINGS };

  if (raw && typeof raw === 'object') {
    if (typeof raw.extensionEnabled === 'boolean') {
      normalized.extensionEnabled = raw.extensionEnabled;
    }

    if (raw.theme === 'dark') {
      normalized.theme = 'dark';
    }

    if (Array.isArray(raw.blockedSites)) {
      normalized.blockedSites = raw.blockedSites
        .filter((site) => typeof site === 'string' && site.trim().length > 0)
        .map((site) => site.trim().toLowerCase());
    }
  }

  return normalized;
}

function updatePageEnabledState(settings) {
  const allowed = settings.extensionEnabled && (!CURRENT_HOSTNAME || !settings.blockedSites.includes(CURRENT_HOSTNAME));
  pageEnabled = allowed;
  if (!pageEnabled) {
    removePopup();
  }
}

async function loadInitialSettings() {
  if (!API?.storage?.local) {
    pageEnabled = true;
    return;
  }

  try {
    const stored = await API.storage.local.get('extensionSettings');
    extensionSettings = normalizeExtensionSettings(stored?.extensionSettings);
    updatePageEnabledState(extensionSettings);
  } catch (error) {
    console.error('JaDict: Không đọc được extensionSettings', error);
  }
}

if (API?.storage?.onChanged) {
  API.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes.extensionSettings) {
      return;
    }
    extensionSettings = normalizeExtensionSettings(changes.extensionSettings.newValue);
    updatePageEnabledState(extensionSettings);
  });
}

loadInitialSettings();

// --- 1. Listen for text selection ---

// Debounce timer to prevent multiple rapid triggers
let selectionDebounceTimer = null;
let lastSelectedText = '';

document.addEventListener('mouseup', (e) => {
  if (!pageEnabled) {
    removePopup();
    return;
  }

  // We don't want to trigger when clicking *inside* our own popup
  const popup = document.getElementById(POPUP_ID);
  if (popup && (e.target === popup || popup.contains(e.target))) {
    return;
  }

  // Clear any pending debounce timer
  if (selectionDebounceTimer) {
    clearTimeout(selectionDebounceTimer);
    selectionDebounceTimer = null;
  }

  // Debounce selection handling to avoid race conditions
  selectionDebounceTimer = setTimeout(() => {
    const selection = window.getSelection();
    
    // Additional validation: ensure selection exists and is not collapsed
    if (!selection || selection.isCollapsed) {
      // No selection, remove popup if it exists
      if (lastSelectedText) {
        removePopup();
        lastSelectedText = '';
      }
      return;
    }
    
    const selectedText = selection.toString().trim();

    // Ignore very short selections (likely accidental)
    if (selectedText.length === 0) {
      if (lastSelectedText) {
        removePopup();
        lastSelectedText = '';
      }
      return;
    }

    // Prevent duplicate popups for the same selection
    if (selectedText === lastSelectedText && document.getElementById(POPUP_ID)) {
      return;
    }

    // If text is selected, create the popup
    if (selectedText.length > 0 && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Validate that rect has valid dimensions
      if (rect.width > 0 && rect.height > 0) {
        lastSelectedText = selectedText;
        createPopup(selectedText, rect);
        
        // Save to recent searches history
        saveToHistory(selectedText);
      }
    }
  }, 50); // 50ms debounce delay
});

// --- 2. Remove popup when clicking elsewhere ---

document.addEventListener('mousedown', (e) => {
  if (!pageEnabled) {
    return;
  }

  // Don't remove popup if the click is on the selection itself
  // or inside the popup.
  const popup = document.getElementById(POPUP_ID);
  
  // Check if click is inside popup iframe or its contents
  if (popup) {
    // If click target is the iframe itself, don't remove
    if (e.target === popup) {
      return;
    }
    
    // If popup contains the target (inside iframe), don't remove
    if (popup.contains(e.target)) {
      return;
    }
    
    // Use a small delay to check selection after the click is processed
    setTimeout(() => {
      const selection = window.getSelection();
      // Check if selection is empty (user didn't just select text)
      if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
        removePopup();
        lastSelectedText = '';
      }
    }, 10);
  }
});


// --- 3. Create and Position the Popup ---

function createPopup(text, rect) {
  if (!pageEnabled) {
    return;
  }

  // Safety check: Make sure extension runtime is available
  if (!API || !API.runtime || !API.runtime.getURL) {
    console.error('JaDict: Extension runtime not available');
    return;
  }

  // Remove any old popup first
  removePopup();

  // Create an iframe for CSS isolation
  const iframe = document.createElement('iframe');
  iframe.id = POPUP_ID;
  iframe.allow = "clipboard-write"; // Grant clipboard permission

  // Pass the selected text to the iframe via a URL parameter
  try {
    const popupURL = new URL(API.runtime.getURL('popup.html'));
    popupURL.searchParams.append('text', text);
    popupURL.searchParams.append('theme', extensionSettings.theme === 'dark' ? 'dark' : 'light');
    iframe.src = popupURL.toString();
  } catch (error) {
    console.error('JaDict: Failed to create popup URL', error);
    return;
  }

  document.body.appendChild(iframe);

  // Set initial position (we'll correct it after it loads)
  positionPopup(iframe, rect);
}

function positionPopup(iframe, rect) {
  if (!iframe) return;

  // We get the iframe's *own* rendered size, which popup.js will send us
  const iframeRect = iframe.getBoundingClientRect();
  const padding = 10; // 10px padding from selection/screen edge

  // Calculate desired position (below the selection)
  let top = window.scrollY + rect.bottom + padding;
  let left = window.scrollX + rect.left;

  // --- Edge Detection Logic ---

  // 1. Check if it goes off-screen to the right
  if (left + iframeRect.width > window.innerWidth - padding) {
    left = window.innerWidth - iframeRect.width - padding;
  }

  // 2. Check if it goes off-screen to the left (less common)
  if (left < padding) {
    left = padding;
  }

  // 3. Check if it goes off-screen at the bottom
  if (top + iframeRect.height > window.innerHeight + window.scrollY - padding) {
    // If it does, flip it to be *above* the selection
    top = window.scrollY + rect.top - iframeRect.height - padding;
  }

  // 4. Check if it goes off-screen at the top (if flipped)
  if (top < window.scrollY + padding) {
    top = window.scrollY + padding; // Stick to top
  }

  // Apply the final calculated position
  iframe.style.top = `${top}px`;
  iframe.style.left = `${left}px`;
}

function removePopup() {
  const popup = document.getElementById(POPUP_ID);
  if (popup) {
    popup.remove();
  }
  lastSelectedText = '';
  
  // Clear any pending debounce timer
  if (selectionDebounceTimer) {
    clearTimeout(selectionDebounceTimer);
    selectionDebounceTimer = null;
  }
}

// --- 4. NEW (and CORRECTED): Listen for resize message from the iframe ---
window.addEventListener('message', (event) => {
  // Enhanced security: only process messages with our expected types
  if (!event.data || typeof event.data.type !== 'string') {
    return;
  }

  const iframe = document.getElementById(POPUP_ID);

  // --- THIS IS THE CORRECTED SECURITY CHECK ---
  // 1. Make sure the iframe exists
  // 2. Make sure the message is from that specific iframe
  // 3. Make sure the message has the correct type
  if (!iframe || event.source !== iframe.contentWindow) {
    // This is not our iframe's message, ignore it
    return;
  }
  
  // Additional check: only accept messages from our extension's origin
  if (API && API.runtime && API.runtime.getURL) {
    try {
      const expectedOrigin = new URL(API.runtime.getURL('')).origin;
      if (event.origin !== expectedOrigin) {
        return;
      }
    } catch (error) {
      // If we can't verify origin, proceed with caution
      console.warn('JaDict: Không thể xác minh origin của message', error);
    }
  }
  
  // Handle resize messages
  if (event.data.type === 'QUICK_DICT_RESIZE') {
    const { width, height } = event.data;

    // Validate dimensions
    if (typeof width !== 'number' || typeof height !== 'number' || 
        width <= 0 || height <= 0 || 
        !isFinite(width) || !isFinite(height)) {
      console.warn('JaDict: Invalid resize dimensions', width, height);
      return;
    }

    if (iframe) {
      iframe.style.width = `${Math.ceil(width) + 1}px`;
      iframe.style.height = `${Math.ceil(height) + 1}px`;
      iframe.style.opacity = '1';

      // Now that we have the *real* size, re-run position logic
      // to check for edge-of-screen collisions
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        positionPopup(iframe, rect);
      }
    }
  }
  
  // Handle click events from inside popup (to prevent scroll-to-top)
  if (event.data.type === 'POPUP_CLICK') {
    // Popup is being interacted with, prevent any page-level behavior
    event.preventDefault();
  }
  
  // Handle settings button click from popup iframe
  if (event.data.type === 'QUICK_DICT_OPEN_SETTINGS') {
    console.log('JaDict content.js: Received OPEN_SETTINGS message');
    
    if (!API || !API.runtime) {
      console.error('JaDict: API not available in content script');
      return;
    }
    
    // Try openOptionsPage first
    if (API.runtime.openOptionsPage) {
      API.runtime.openOptionsPage().then(() => {
        console.log('JaDict: Options page opened successfully');
      }).catch((error) => {
        console.error('JaDict: openOptionsPage failed', error);
        
        // Fallback: Send message to background script
        if (API.runtime.sendMessage) {
          API.runtime.sendMessage({
            type: 'OPEN_OPTIONS_PAGE'
          }).catch((bgError) => {
            console.error('JaDict: Background message failed', bgError);
          });
        }
      });
    } else if (API.runtime.sendMessage) {
      // If no openOptionsPage, ask background script
      API.runtime.sendMessage({
        type: 'OPEN_OPTIONS_PAGE'
      }).catch((error) => {
        console.error('JaDict: All methods failed', error);
      });
    }
  }
}, false);

// --- Save text selection to recent searches history ---
function saveToHistory(text) {
  if (!API || !API.storage) return;
  
  // Get current recent searches
  API.storage.local.get(['recentSearches'], (items) => {
    let recent = items.recentSearches || [];
    
    // Remove existing entry for the same query (case-insensitive)
    recent = recent.filter(item => 
      item.query.toLowerCase() !== text.toLowerCase()
    );
    
    // Add new entry at the top with placeholder result
    recent.unshift({
      query: text,
      result: {
        source: 'text-selection',
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
    
    // Keep only last 10
    recent = recent.slice(0, 10);
    
    // Save back to storage
    API.storage.local.set({ recentSearches: recent });
  });
}

