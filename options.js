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

// This script runs on the options.html page

const saveButton = document.getElementById('save-button');
const apiKeyInput = document.getElementById('api-key');
const statusMessage = document.getElementById('status-message');
const modelSelect = document.getElementById('model-select');

const ALLOWED_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-pro'
]);

const DEFAULT_MODEL = 'gemini-2.5-flash-lite';

// --- 1. Save settings ---
function saveOptions() {
  const apiKey = apiKeyInput.value.trim();
  const selectedModel = modelSelect ? modelSelect.value : DEFAULT_MODEL;

  if (!apiKey) {
    statusMessage.textContent = 'Lỗi: Không được để trống mã API.';
    statusMessage.style.color = 'red';
    return;
  }
  const model = ALLOWED_MODELS.has(selectedModel) ? selectedModel : DEFAULT_MODEL;

  API.storage.local.set({
    geminiApiKey: apiKey,
    geminiModel: model
  })
  .then(() => {
    // Update status
    statusMessage.textContent = 'Đã lưu cài đặt!';
    statusMessage.style.color = 'green';
    setTimeout(() => {
      statusMessage.textContent = '';
    }, 2000);
  })
  .catch((err) => {
    statusMessage.textContent = `Lỗi khi lưu: ${err.message}`;
    statusMessage.style.color = 'red';
  });
}

// --- 2. Load settings when page opens ---
function restoreOptions() {
  API.storage.local.get(['geminiApiKey', 'geminiModel'])
    .then((result) => {
      if (result.geminiApiKey) {
        apiKeyInput.value = result.geminiApiKey;
      }
      if (modelSelect) {
        const storedModel = result.geminiModel;
        if (storedModel && ALLOWED_MODELS.has(storedModel)) {
          modelSelect.value = storedModel;
        } else {
          modelSelect.value = DEFAULT_MODEL;
        }
      }
    })
    .catch((err) => {
      statusMessage.textContent = `Lỗi khi tải: ${err.message}`;
      statusMessage.style.color = 'red';
    });
}

// --- 3. Add event listeners ---
document.addEventListener('DOMContentLoaded', restoreOptions);
saveButton.addEventListener('click', saveOptions);
