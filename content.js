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

// --- 1. Listen for text selection ---

document.addEventListener('mouseup', (e) => {
  // We don't want to trigger when clicking *inside* our own popup
  if (e.target.id === POPUP_ID) {
    return;
  }

  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  // If text is selected, create the popup
  if (selectedText.length > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    createPopup(selectedText, rect);
  } else {
    // If no text is selected, remove any existing popup
    removePopup();
  }
});

// --- 2. Remove popup when clicking elsewhere ---

document.addEventListener('mousedown', (e) => {
  // Don't remove popup if the click is on the selection itself
  // or inside the popup.
  const popup = document.getElementById(POPUP_ID);
  if (popup && !popup.contains(e.target) && window.getSelection().toString().trim().length === 0) {
    removePopup();
  }
});


// --- 3. Create and Position the Popup ---

function createPopup(text, rect) {
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

  // Pass the selected text to the iframe via a URL parameter
  try {
    const popupURL = new URL(API.runtime.getURL('popup.html'));
    popupURL.searchParams.append('text', text);
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
}

// --- 4. NEW (and CORRECTED): Listen for resize message from the iframe ---
window.addEventListener('message', (event) => {
  const iframe = document.getElementById(POPUP_ID);

  // --- THIS IS THE CORRECTED SECURITY CHECK ---
  // 1. Make sure the iframe exists
  // 2. Make sure the message is from that specific iframe
  // 3. Make sure the message has the correct type
  if (
    !iframe || 
    event.source !== iframe.contentWindow || 
    !event.data || 
    event.data.type !== 'QUICK_DICT_RESIZE'
  ) {
    // This is not our message, ignore it
    return;
  }
  
  // We trust this message because we checked its source and type
  const { width, height } = event.data;

  if (iframe) {
    iframe.style.width = `${Math.ceil(width) + 1}px`;
    iframe.style.height = `${Math.ceil(height) + 1}px`;
    iframe.style.opacity = '1';

    // Now that we have the *real* size, re-run position logic
    // to check for edge-of-screen collisions
    const selection = window.getSelection();
    if(selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      positionPopup(iframe, rect);
    }
  }
}, false);

