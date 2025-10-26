// --- 0. Compatibility Layer for Firefox and Chromium ---
// Use Chrome API on Chromium, Firefox API on Firefox
const API = typeof browser !== 'undefined' && browser.runtime ? browser : chrome;

// This script runs *inside* the iframe

// --- 1. Get the selected text from the URL ---
const urlParams = new URLSearchParams(window.location.search);
const selectedText = urlParams.get('text');

// --- 2. Send request to background script ---
const contentDiv = document.getElementById('content');
const container = document.getElementById('container');

let resizeAnimationFrame = null;

if (typeof ResizeObserver !== 'undefined' && container) {
  const resizeObserver = new ResizeObserver(() => {
    if (resizeAnimationFrame) {
      cancelAnimationFrame(resizeAnimationFrame);
    }
    resizeAnimationFrame = requestAnimationFrame(() => {
      resizeAnimationFrame = null;
      sendResizeMessage();
    });
  });

  resizeObserver.observe(container);
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
    } else {
      const message = response?.data || 'Lỗi chưa xác định';
      contentDiv.textContent = `Lỗi: ${message}`;
    }
  } catch (error) {
    const message = error?.message || error;
    contentDiv.textContent = `Lỗi: ${message}`;
  } finally {
    // After content is set, tell the parent page to resize
    sendResizeMessage();
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
