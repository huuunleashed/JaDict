(() => {
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

  const SETTINGS = window.JA_SETTINGS;

  if (!API || !SETTINGS) {
    console.error('JaDict: Options page thiếu API hoặc module cài đặt');
    return;
  }

  const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
  const ALLOWED_MODELS = new Set([
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-pro'
  ]);

  let globalToggle;
  let themeSelect;
  let apiKeyInput;
  let modelSelect;
  let saveButton;
  let statusMessage;
  let blacklistForm;
  let blacklistInput;
  let blacklistList;
  let synonymLimitInput;
  let antonymLimitInput;

  let tabButtons = [];
  let tabPanels = [];

  let busy = false;

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light';
  }

  async function loadGeminiSettings() {
    const stored = await API.storage.local.get(['geminiApiKey', 'geminiModel']);
    return {
      apiKey: stored?.geminiApiKey || '',
      model: stored?.geminiModel && ALLOWED_MODELS.has(stored.geminiModel)
        ? stored.geminiModel
        : DEFAULT_MODEL
    };
  }

  async function saveGeminiSettings({ apiKey, model }) {
    if (!apiKey.trim()) {
      throw new Error('Nhập API key trước');
    }

    const payload = {
      geminiApiKey: apiKey.trim()
    };

    if (ALLOWED_MODELS.has(model)) {
      payload.geminiModel = model;
    }

    await API.storage.local.set(payload);
  }

  function renderBlacklist(items) {
    blacklistList.innerHTML = '';

    if (!items || items.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = 'Chưa có trang nào bị chặn.';
      blacklistList.appendChild(empty);
      return;
    }

    items.forEach((host) => {
      const li = document.createElement('li');
      li.className = 'blacklist-item';
      li.textContent = host;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'ghost';
      removeBtn.textContent = 'Bỏ';
      removeBtn.addEventListener('click', () => {
        removeFromBlacklist(host).catch((error) => {
          console.error('Không bỏ được trang khỏi danh sách', error);
        });
      });

      li.appendChild(removeBtn);
      blacklistList.appendChild(li);
    });
  }

  async function removeFromBlacklist(host) {
    const settings = await SETTINGS.loadExtensionSettings();
    const filtered = settings.blockedSites.filter((item) => item !== host);
    await SETTINGS.saveExtensionSettings({ blockedSites: filtered });
    renderBlacklist(filtered);
  }

  async function addToBlacklist(host) {
    const settings = await SETTINGS.loadExtensionSettings();
    const set = new Set(settings.blockedSites);
    set.add(host);
    const updated = await SETTINGS.saveExtensionSettings({ blockedSites: Array.from(set) });
    renderBlacklist(updated.blockedSites);
  }

  function clearStatus(delay = 2000) {
    if (delay <= 0) {
      statusMessage.textContent = '';
      statusMessage.className = 'status-message';
      return;
    }

    setTimeout(() => {
      statusMessage.textContent = '';
      statusMessage.className = 'status-message';
    }, delay);
  }

  async function withStatus(action) {
    if (busy) {
      return;
    }
    busy = true;
    saveButton.disabled = true;
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
    try {
      await action();
      statusMessage.textContent = 'Đã lưu';
      statusMessage.classList.add('success');
      clearStatus();
    } catch (error) {
      statusMessage.textContent = error?.message || 'Không lưu được';
      statusMessage.classList.add('error');
      clearStatus(4000);
    } finally {
      busy = false;
      saveButton.disabled = false;
    }
  }

  async function restoreOptions() {
    try {
      const [settings, gemini] = await Promise.all([
        SETTINGS.loadExtensionSettings(),
        loadGeminiSettings()
      ]);

      globalToggle.checked = settings.extensionEnabled;
      themeSelect.value = settings.theme === 'dark' ? 'dark' : 'light';
      setTheme(settings.theme);

      apiKeyInput.value = gemini.apiKey;
      modelSelect.value = gemini.model;

      renderBlacklist(settings.blockedSites);

      if (synonymLimitInput) {
        synonymLimitInput.value = Number.isInteger(settings.synonymLimit)
          ? settings.synonymLimit
          : 5;
      }

      if (antonymLimitInput) {
        antonymLimitInput.value = Number.isInteger(settings.antonymLimit)
          ? settings.antonymLimit
          : 5;
      }
    } catch (error) {
      console.error('JaDict: Không khôi phục được cài đặt', error);
      statusMessage.textContent = 'Không tải được cài đặt';
      statusMessage.classList.add('error');
    }
  }

  function handleTabClick(event) {
    const button = event.currentTarget;
    const target = button.dataset.tabTarget;
    if (!target) {
      return;
    }

    tabButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
    tabPanels.forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.tab === target);
    });
  }

  function normalizeHost(input) {
    const value = (input || '').trim().toLowerCase();
    if (!value) {
      return '';
    }

    try {
      const url = new URL(value.includes('://') ? value : `https://${value}`);
      return url.hostname;
    } catch (error) {
      return value.replace(/^\*+\.?/, '');
    }
  }

  function attachEventListeners() {
    if (Array.isArray(tabButtons)) {
      tabButtons.forEach((button) => button.addEventListener('click', handleTabClick));
    }

    globalToggle.addEventListener('change', async (event) => {
      const enabled = event.target.checked;
      try {
        await SETTINGS.saveExtensionSettings({ extensionEnabled: enabled });
      } catch (error) {
        console.error('Không lưu được trạng thái toàn bộ', error);
      }
    });

    themeSelect.addEventListener('change', async (event) => {
      const theme = event.target.value === 'dark' ? 'dark' : 'light';
      setTheme(theme);
      try {
        await SETTINGS.saveExtensionSettings({ theme });
      } catch (error) {
        console.error('Không lưu được theme', error);
      }
    });

    saveButton.addEventListener('click', async () => {
      await withStatus(async () => {
        await saveGeminiSettings({
          apiKey: apiKeyInput.value,
          model: modelSelect.value
        });
      });
    });

    blacklistForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const host = normalizeHost(blacklistInput.value);
      if (!host) {
        return;
      }

      blacklistInput.value = '';

      try {
        await addToBlacklist(host);
      } catch (error) {
        console.error('Không thêm được trang vào danh sách chặn', error);
      }
    });

    if (synonymLimitInput) {
      synonymLimitInput.addEventListener('change', async (event) => {
        const value = Number.parseInt(event.target.value, 10);
        try {
          await SETTINGS.saveExtensionSettings({ synonymLimit: value });
          const refreshed = await SETTINGS.loadExtensionSettings();
          synonymLimitInput.value = refreshed.synonymLimit;
        } catch (error) {
          console.error('Không lưu được giới hạn từ đồng nghĩa', error);
        }
      });
    }

    if (antonymLimitInput) {
      antonymLimitInput.addEventListener('change', async (event) => {
        const value = Number.parseInt(event.target.value, 10);
        try {
          await SETTINGS.saveExtensionSettings({ antonymLimit: value });
          const refreshed = await SETTINGS.loadExtensionSettings();
          antonymLimitInput.value = refreshed.antonymLimit;
        } catch (error) {
          console.error('Không lưu được giới hạn từ trái nghĩa', error);
        }
      });
    }
  }

  function init() {
    globalToggle = document.getElementById('global-toggle');
    themeSelect = document.getElementById('theme-select');
    apiKeyInput = document.getElementById('api-key');
    modelSelect = document.getElementById('model-select');
    saveButton = document.getElementById('save-credentials');
    statusMessage = document.getElementById('status-message');
    blacklistForm = document.getElementById('blacklist-form');
    blacklistInput = document.getElementById('blacklist-input');
    blacklistList = document.getElementById('blacklist-list');
    synonymLimitInput = document.getElementById('synonym-limit');
    antonymLimitInput = document.getElementById('antonym-limit');
    tabButtons = Array.from(document.querySelectorAll('.tab-button'));
    tabPanels = Array.from(document.querySelectorAll('.tab-panel'));

    const requiredElements = [
      globalToggle,
      themeSelect,
      apiKeyInput,
      modelSelect,
      saveButton,
      statusMessage,
      blacklistForm,
      blacklistInput,
      blacklistList
    ];

    if (requiredElements.some((el) => !el)) {
      console.error('JaDict: Thiếu phần tử giao diện cần thiết trên trang cài đặt');
      return;
    }

    attachEventListeners();

    restoreOptions().catch((error) => {
      console.error('JaDict: Lỗi khởi tạo trang cài đặt', error);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
