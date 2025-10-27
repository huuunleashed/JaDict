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
const selectedText = urlParams.get('text');

// --- 2. Send request to background script ---
const contentDiv = document.getElementById('content');
const container = document.getElementById('container');
const resizeHandle = document.getElementById('resize-handle');

const MIN_WIDTH = 320;
const MAX_WIDTH = 1280;
const MIN_HEIGHT = 220;
const MAX_HEIGHT = 800;

const COPY_ICONS = {
  copy: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 3h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1V5a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 3v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  success: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 12.5 9.5 17.5 19.5 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  error: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

if (container) {
  const initialWidth = clamp(container.offsetWidth, MIN_WIDTH, MAX_WIDTH);
  container.style.width = `${initialWidth}px`;
}

let resizeMessageFrame = null;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function setCopyIcon(button, state) {
  const icon = COPY_ICONS[state] || COPY_ICONS.copy;
  button.classList.remove('copied', 'error');
  button.innerHTML = icon;

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
  if (!selectedText) {
    sendResizeMessage();
    return;
  }

  try {
    const response = await API.runtime.sendMessage({
      type: "LOOKUP",
      text: selectedText
    });

    if (response && response.status === "success") {
      contentDiv.innerHTML = response.data;
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

    // Get the translation/content to copy
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const textToCopy = getTranslationText(section);
      
      if (!textToCopy) {
        return;
      }

      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        setCopyIcon(copyBtn, 'error');
        setTimeout(() => {
          setCopyIcon(copyBtn, 'copy');
        }, 1500);
        return;
      }

      navigator.clipboard.writeText(textToCopy)
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
    });

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
  
  // Get translation
  const translation = section.querySelector('.ai-translation');
  if (translation) {
    const text = translation.textContent.replace(/^Bản dịch:\s*/, '').trim();
    if (text) parts.push(text);
  }
  
  return parts.join('\n');
}

requestLookup();

// --- 3. NEW: Send resize message to the parent page ---
function sendResizeMessage() {
  if (!container) {
    return;
  }
  const width = Math.ceil(container.offsetWidth);
  const height = Math.ceil(container.offsetHeight);
  
  // Post a message to the parent window (content.js)
  // This securely tells the parent page what size the iframe needs to be
  window.parent.postMessage(
    {
      type: 'QUICK_DICT_RESIZE',
      width,
      height
    },
    '*' // '*' is fine, content.js will validate the message type
  );
}
