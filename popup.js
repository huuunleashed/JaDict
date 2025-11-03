let isPointerResizing = false;
let pointerId = null;
let startWidth = 0;
let startHeight = 0;
let startX = 0;
let startY = 0;
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

// This script runs *inside* the iframe

// --- 1. Get the selected text from the URL ---
const urlParams = new URLSearchParams(window.location.search);
const selectedText = urlParams.get('text') ? urlParams.get('text').trim() : '';

// --- 2. Send request to background script ---
const contentDiv = document.getElementById('content');
const container = document.getElementById('container');
const resizeHandle = document.getElementById('resize-handle');
const settingsButton = document.getElementById('settings-button');

const themeParam = urlParams.get('theme');
const initialTheme = themeParam === 'dark' ? 'dark' : 'light';

function applyTheme(theme) {
  const value = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = value;
}

applyTheme(initialTheme);

async function syncThemeFromStorage() {
  if (!API?.storage?.local) {
    return;
  }
  try {
    const stored = await API.storage.local.get('extensionSettings');
    const theme = stored?.extensionSettings?.theme === 'dark' ? 'dark' : 'light';
    applyTheme(theme);
  } catch (error) {
    // Ignore storage read errors inside popup
    console.warn('JaDict: Không đọc được theme lưu', error);
  }
}

syncThemeFromStorage();

if (API?.storage?.onChanged) {
  API.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes.extensionSettings) {
      return;
    }
    const themeValue = changes.extensionSettings.newValue?.theme;
    applyTheme(themeValue);
  });
}

if (settingsButton) {
  console.log('JaDict: Settings button found, attaching listeners');
  
  // Multi-strategy approach for opening settings
  const openSettings = (e) => {
    console.log('JaDict: openSettings called, event type:', e?.type);
    
    // Prevent default behavior and stop propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('JaDict: Attempting to open settings...');
    
    // Strategy 1: Try postMessage to parent page (works in sandboxed iframes)
    try {
      window.parent.postMessage(
        {
          type: 'QUICK_DICT_OPEN_SETTINGS'
        },
        '*'
      );
      console.log('JaDict: PostMessage sent to parent');
    } catch (error) {
      console.error('JaDict: PostMessage failed', error);
    }
    
    // Strategy 2: Try direct API call (fallback)
    if (API?.runtime?.openOptionsPage) {
      API.runtime.openOptionsPage().catch((error) => {
        console.error('JaDict: openOptionsPage failed', error);
        
        // Strategy 3: Try tabs.create
        if (API?.runtime?.getURL) {
          try {
            const optionsUrl = API.runtime.getURL('options.html');
            if (typeof browser !== 'undefined' && browser.tabs && browser.tabs.create) {
              browser.tabs.create({ url: optionsUrl });
            } else if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
              chrome.tabs.create({ url: optionsUrl });
            }
          } catch (fallbackError) {
            console.error('JaDict: All strategies failed', fallbackError);
          }
        }
      });
    }
  };
  
  // Add multiple event listeners for maximum compatibility
  settingsButton.addEventListener('click', openSettings, true); // Use capture phase
  settingsButton.addEventListener('mousedown', (e) => {
    e.stopPropagation();
  }, true);
  settingsButton.addEventListener('mouseup', openSettings, true); // Also try mouseup
  
  // Touch events for mobile/tablet
  settingsButton.addEventListener('touchend', openSettings, true);
  
  // Make button focusable and add keyboard support
  if (!settingsButton.hasAttribute('tabindex')) {
    settingsButton.setAttribute('tabindex', '0');
  }
  
  settingsButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openSettings(e);
    }
  });
  
  // Visual feedback on interaction
  settingsButton.addEventListener('pointerdown', () => {
    settingsButton.style.transform = 'scale(0.95)';
  });
  
  settingsButton.addEventListener('pointerup', () => {
    settingsButton.style.transform = '';
  });
  
  settingsButton.addEventListener('pointercancel', () => {
    settingsButton.style.transform = '';
  });
}

const MIN_WIDTH = 320;
const MAX_WIDTH = 1280;
const MIN_HEIGHT = 220;
const MAX_HEIGHT = 800;

const ALLOWED_TAGS = new Set([
  'DIV', 'SPAN', 'B', 'I', 'UL', 'LI', 'P', 'STRONG', 'EM'
]);

const ALLOWED_ATTRS = {
  DIV: new Set(['class']),
  SPAN: new Set(['class']),
  UL: new Set(['class']),
  LI: new Set(['class'])
};

const ALLOWED_CLASSES = new Set([
  'ai-section', 'ai-heading', 'ai-translation', 'ai-label', 'ai-entry',
  'ai-sense', 'ai-note', 'ai-pos', 'collapsible-section', 'collapsible-header',
  'collapsible-content', 'collapsed', 'expanded', 'collapse-icon', 'ai-bullets',
  'dict-section', 'dict-heading', 'dict-body', 'sense-divider'
]);

function renderSanitizedHtml(target, html) {
  if (!target) {
    return;
  }

  const fragment = sanitizeHtmlToFragment(html);
  target.replaceChildren(fragment);
}

function sanitizeHtmlToFragment(html) {
  const fragment = document.createDocumentFragment();

  if (typeof html !== 'string') {
    return fragment;
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, 'text/html');

  parsed.body.childNodes.forEach((node) => {
    const cleanNode = sanitizeNode(node);
    if (cleanNode) {
      fragment.appendChild(cleanNode);
    }
  });

  return fragment;
}

function sanitizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent || '');
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const tagName = node.tagName.toUpperCase();
    if (!ALLOWED_TAGS.has(tagName)) {
      // Skip disallowed tag but keep traversing children
      const fragment = document.createDocumentFragment();
      node.childNodes.forEach((child) => {
        const nested = sanitizeNode(child);
        if (nested) {
          fragment.appendChild(nested);
        }
      });
      return fragment;
    }

    const cleanElement = document.createElement(tagName.toLowerCase());
    const allowedAttributes = ALLOWED_ATTRS[tagName] || new Set();

    for (const { name, value } of Array.from(node.attributes)) {
      const attrName = name.toLowerCase();
      if (!allowedAttributes.has(attrName)) {
        continue;
      }

      if (attrName === 'class') {
        const filteredClasses = value
          .split(/\s+/)
          .filter((cls) => ALLOWED_CLASSES.has(cls));
        if (filteredClasses.length > 0) {
          cleanElement.setAttribute('class', filteredClasses.join(' '));
        }
        continue;
      }

      cleanElement.setAttribute(attrName, value);
    }

    node.childNodes.forEach((child) => {
      const sanitizedChild = sanitizeNode(child);
      if (sanitizedChild) {
        cleanElement.appendChild(sanitizedChild);
      }
    });

    return cleanElement;
  }

  return null;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const COPY_ICON_DEFS = {
  copy: [
    {
      tag: 'path',
      attrs: {
        d: 'M9 3h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1V5a2 2 0 0 1 2-2Z',
        stroke: 'currentColor',
        'stroke-width': '1.8',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }
    },
    {
      tag: 'path',
      attrs: {
        d: 'M9 3v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V3',
        stroke: 'currentColor',
        'stroke-width': '1.8',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }
    }
  ],
  success: [
    {
      tag: 'path',
      attrs: {
        d: 'M4.5 12.5 9.5 17.5 19.5 7.5',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }
    }
  ],
  error: [
    {
      tag: 'path',
      attrs: {
        d: 'M5 5l14 14M19 5L5 19',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round'
      }
    }
  ]
};
const COPY_ICON_CACHE = new Map();

function createSvgFromDef(defKey) {
  const definition = COPY_ICON_DEFS[defKey] || COPY_ICON_DEFS.copy;
  if (COPY_ICON_CACHE.has(defKey)) {
    return COPY_ICON_CACHE.get(defKey).cloneNode(true);
  }

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');

  definition.forEach((segment) => {
    const element = document.createElementNS(SVG_NS, segment.tag);
    Object.entries(segment.attrs).forEach(([attr, value]) => {
      element.setAttribute(attr, value);
    });
    svg.appendChild(element);
  });

  COPY_ICON_CACHE.set(defKey, svg);
  return svg.cloneNode(true);
}

if (container) {
  const initialWidth = clamp(container.offsetWidth, MIN_WIDTH, MAX_WIDTH);
  container.style.width = `${initialWidth}px`;
}

let resizeMessageFrame = null;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setCopyIcon(button, state) {
  const icon = createSvgFromDef(state);
  button.classList.remove('copied', 'error');
  button.replaceChildren(icon);

  if (state === 'success') {
    button.classList.add('copied');
  } else if (state === 'error') {
    button.classList.add('error');
  }
}

function scheduleResizeMessage() {
  if (resizeMessageFrame) {
    return;
  }

  resizeMessageFrame = requestAnimationFrame(() => {
    resizeMessageFrame = null;
    sendResizeMessage();
  });
}

function startPointerResize(event) {
  if (!container) {
    return;
  }

  if (typeof event.button === 'number' && event.button !== 0) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  
  isPointerResizing = true;
  pointerId = event.pointerId;
  startWidth = container.offsetWidth;
  startHeight = container.offsetHeight;
  startX = event.clientX;
  startY = event.clientY;

  // Set explicit dimensions
  container.style.width = `${startWidth}px`;
  container.style.height = `${startHeight}px`;

  try {
    if (resizeHandle && typeof resizeHandle.setPointerCapture === 'function') {
      resizeHandle.setPointerCapture(pointerId);
    }
  } catch (e) {
    // Ignore pointer capture errors
  }

  window.addEventListener('pointermove', handlePointerMove, { passive: false });
  window.addEventListener('pointerup', stopPointerResize, { once: true });
  window.addEventListener('pointercancel', stopPointerResize, { once: true });
}

function handlePointerMove(event) {
  if (!isPointerResizing || event.pointerId !== pointerId) {
    return;
  }

  event.preventDefault();

  const deltaX = event.clientX - startX;
  const deltaY = event.clientY - startY;

  const newWidth = clamp(startWidth + deltaX, MIN_WIDTH, MAX_WIDTH);
  const newHeight = clamp(startHeight + deltaY, MIN_HEIGHT, MAX_HEIGHT);

  container.style.width = `${Math.round(newWidth)}px`;
  container.style.height = `${Math.round(newHeight)}px`;

  scheduleResizeMessage();
}

function stopPointerResize(event) {
  if (!isPointerResizing) {
    return;
  }

  const currentPointerId = pointerId;
  
  isPointerResizing = false;
  pointerId = null;

  try {
    if (
      resizeHandle &&
      typeof resizeHandle.releasePointerCapture === 'function' &&
      currentPointerId !== null
    ) {
      resizeHandle.releasePointerCapture(currentPointerId);
    }
  } catch (e) {
    // Ignore pointer capture errors
  }

  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerup', stopPointerResize);
  window.removeEventListener('pointercancel', stopPointerResize);

  scheduleResizeMessage();
}

if (resizeHandle) {
  resizeHandle.addEventListener('pointerdown', startPointerResize);
}

if (typeof ResizeObserver !== 'undefined' && container) {
  const resizeObserver = new ResizeObserver(() => {
    if (isPointerResizing) {
      return; // Ignore observer updates while user is resizing
    }
    scheduleResizeMessage();
  });

  resizeObserver.observe(contentDiv);
  window.addEventListener('unload', () => resizeObserver.disconnect());
}

async function requestLookup() {
  // Safety check: only proceed if we have valid selected text
  if (!selectedText || selectedText.trim().length === 0) {
    contentDiv.textContent = 'Không có từ nào được chọn';
    resetContainerHeight();
    sendResizeMessage();
    return;
  }

  try {
    // Check if API is available
    if (!API || !API.runtime || !API.runtime.sendMessage) {
      throw new Error('Extension API không khả dụng');
    }

    const response = await new Promise((resolve, reject) => {
      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error('Timeout: Không nhận được phản hồi'));
      }, 10000); // 10 second timeout

      API.runtime.sendMessage(
        {
          type: "LOOKUP",
          text: selectedText
        },
        (response) => {
          clearTimeout(timeout);
          
          // Check for runtime errors
          if (API.runtime.lastError) {
            reject(new Error(API.runtime.lastError.message || 'Lỗi kết nối'));
            return;
          }
          resolve(response);
        }
      );
    });

    if (response && response.status === "success") {
      renderSanitizedHtml(contentDiv, response.data);
      addCopyButtons();
      addCollapsibleHandlers();
    } else {
      const message = response?.data || 'Lỗi chưa xác định';
      contentDiv.textContent = `Lỗi: ${message}`;
      resetContainerHeight();
    }
  } catch (error) {
    const message = error?.message || error;
    contentDiv.textContent = `Lỗi: ${message}`;
    console.error('JaDict lookup error:', error);
  } finally {
    resetContainerHeight();
    // After content is set, tell the parent page to resize
    sendResizeMessage();
  }
}

// --- Add Copy Buttons to Translation Results ---
function addCopyButtons() {
  const sections = contentDiv.querySelectorAll('.ai-section, .dict-section');
  
  sections.forEach((section) => {
    // Only add copy button to ai-section (dịch AI)
    if (!section.classList.contains('ai-section')) {
      return;
    }

    // Need a translation block to attach copy functionality
    const translationBlock = section.querySelector('.ai-translation');
    if (!translationBlock) {
      return;
    }

    // Check if button already exists
    if (section.querySelector('.copy-button')) {
      return;
    }

    const heading = section.querySelector('.ai-heading');
    if (!heading) return;

    // Create copy button with icon
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'copy-button';
    copyBtn.title = 'Copy dịch';
    setCopyIcon(copyBtn, 'copy');
    
    // Prevent any scroll behavior
    copyBtn.style.touchAction = 'manipulation';

    // Get the translation/content to copy
    copyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const textToCopy = getTranslationText(section);
      
      if (!textToCopy) {
        setCopyIcon(copyBtn, 'error');
        setTimeout(() => {
          setCopyIcon(copyBtn, 'copy');
        }, 1500);
        return;
      }

      // Use fallback copy method that works in iframes
      copyToClipboard(textToCopy)
        .then(() => {
          // Show feedback
          setCopyIcon(copyBtn, 'success');
          setTimeout(() => {
            setCopyIcon(copyBtn, 'copy');
          }, 1500);
        })
        .catch(() => {
          setCopyIcon(copyBtn, 'error');
          setTimeout(() => {
            setCopyIcon(copyBtn, 'copy');
          }, 1500);
        });
      
      return false;
    }, { passive: false });

    heading.appendChild(copyBtn);
  });
}

// --- Add Collapsible Section Handlers ---
function addCollapsibleHandlers() {
  const collapsibleHeaders = contentDiv.querySelectorAll('.collapsible-header');
  
  collapsibleHeaders.forEach((header) => {
    // Remove existing listener if any
    const newHeader = header.cloneNode(true);
    header.parentNode.replaceChild(newHeader, header);
    
    newHeader.addEventListener('click', (e) => {
      e.stopPropagation();
      const content = newHeader.nextElementSibling;
      
      if (!content || !content.classList.contains('collapsible-content')) {
        return;
      }
      
      const isExpanded = content.classList.contains('expanded');
      
      if (isExpanded) {
        // Collapse
        content.classList.remove('expanded');
        content.classList.add('collapsed');
        newHeader.classList.remove('expanded');
      } else {
        // Expand
        content.classList.remove('collapsed');
        content.classList.add('expanded');
        newHeader.classList.add('expanded');
      }
      
      resetContainerHeight();
      // Notify parent about size change
      scheduleResizeMessage();
    });
  });
}
function resetContainerHeight() {
  if (!container) {
    return;
  }

  if (isPointerResizing) {
    return;
  }
  
  if (container.style.height) {
    container.style.height = '';
  }
}

// --- Extract Translation Text ---
function getTranslationText(section) {
  const parts = [];
  
  // Get translation heading and content
  const translation = section.querySelector('.ai-translation');
  if (translation) {
    const text = translation.textContent.replace(/^Bản dịch:\s*/, '').trim();
    if (text) parts.push(text);
  }
  
  return parts.join('\n').trim();
}

// --- Copy to Clipboard with Fallback ---
function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    // Try modern Clipboard API first
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text)
        .then(resolve)
        .catch(() => {
          // Fallback to execCommand if Clipboard API fails
          fallbackCopy(text) ? resolve() : reject(new Error('Copy failed'));
        });
    } else {
      // Fallback for older browsers or iframe restrictions
      fallbackCopy(text) ? resolve() : reject(new Error('Copy failed'));
    }
  });
}

// --- Fallback Copy Method Using execCommand ---
function fallbackCopy(text) {
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Position outside viewport to avoid visual disruption
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    textArea.style.zIndex = '-9999';
    
    document.body.appendChild(textArea);
    
    // Select and copy text
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    
    // Clean up
    document.body.removeChild(textArea);
    
    return successful;
  } catch (error) {
    console.error('Fallback copy failed:', error);
    return false;
  }
}

requestLookup();

// --- 3. NEW: Send resize message to the parent page ---
function sendResizeMessage() {
  if (!container) {
    return;
  }
  
  const width = Math.ceil(container.offsetWidth);
  const height = Math.ceil(container.offsetHeight);
  
  // Validate dimensions before sending
  if (!isFinite(width) || !isFinite(height) || width <= 0 || height <= 0) {
    console.warn('JaDict: Invalid dimensions for resize', width, height);
    return;
  }
  
  // Post a message to the parent window (content.js)
  // This securely tells the parent page what size the iframe needs to be
  try {
    window.parent.postMessage(
      {
        type: 'QUICK_DICT_RESIZE',
        width,
        height
      },
      '*' // '*' is fine, content.js will validate the message type and origin
    );
  } catch (error) {
    console.error('JaDict: Failed to send resize message', error);
  }
}
