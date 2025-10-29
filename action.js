"use strict";

(function initActionPopup() {
  const API = (() => {
    if (typeof browser !== "undefined" && browser.runtime) {
      return browser;
    }
    if (typeof chrome !== "undefined" && chrome.runtime) {
      return chrome;
    }
    console.error("JaDict: No extension API in action popup");
    return null;
  })();

  if (!API || !window.JA_SETTINGS) {
    return;
  }

  const { loadExtensionSettings, saveExtensionSettings, isSiteBlocked } = window.JA_SETTINGS;

  const globalToggle = document.getElementById("global-toggle");
  const siteToggle = document.getElementById("site-toggle");
  const siteDomainEl = document.getElementById("site-domain");
  const themeSelect = document.getElementById("theme-select");
  const apiKeyInput = document.getElementById("api-key");
  const modelSelect = document.getElementById("model-select");
  const saveButton = document.getElementById("save-credentials");
  const statusMessage = document.getElementById("status-message");
  const openOptionsButton = document.getElementById("open-options");

  let currentHostname = null;
  let busy = false;

  function setTheme(theme) {
    const root = document.documentElement;
    root.dataset.theme = theme;
  }

  async function withStatus(action) {
    if (busy) {
      return;
    }
    busy = true;
    saveButton.disabled = true;
    statusMessage.textContent = "";
    statusMessage.className = "status-message";

    try {
      await action();
      statusMessage.textContent = "Đã lưu";
      statusMessage.classList.add("success");
    } catch (error) {
      console.error("JaDict action popup error", error);
      statusMessage.textContent = error?.message || "Không lưu được";
      statusMessage.classList.add("error");
    } finally {
      busy = false;
      saveButton.disabled = false;
    }
  }

  function tabsQuery(queryInfo) {
    return new Promise((resolve, reject) => {
      try {
        const result = API.tabs.query(queryInfo, (tabs) => {
          const err = API.runtime.lastError;
          if (err) {
            reject(new Error(err.message));
            return;
          }
          resolve(tabs || []);
        });
        if (result && typeof result.then === "function") {
          result.then(resolve, reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async function loadGeminiSettings() {
    const stored = await API.storage.local.get(["geminiApiKey", "geminiModel"]);
    const apiKey = stored?.geminiApiKey || "";
    const model = stored?.geminiModel;
    return { apiKey, model };
  }

  async function saveGeminiSettings({ apiKey, model }) {
    const allowedModels = new Set([
      "gemini-2.5-flash",
      "gemini-2.5-flash-lite",
      "gemini-2.5-pro"
    ]);

    const payload = { geminiApiKey: apiKey.trim() };
    if (allowedModels.has(model)) {
      payload.geminiModel = model;
    }

    await API.storage.local.set(payload);
  }

  function updateSiteToggleState(settings) {
    if (!currentHostname) {
      siteToggle.disabled = true;
      siteToggle.checked = false;
      siteDomainEl.textContent = "";
      return;
    }

    siteToggle.disabled = false;
    const blocked = isSiteBlocked(settings, currentHostname);
    siteToggle.checked = !blocked;
    siteDomainEl.textContent = currentHostname;
  }

  async function refreshUI() {
    const [settings, gemini, tabs] = await Promise.all([
      loadExtensionSettings(),
      loadGeminiSettings(),
      tabsQuery({ active: true, currentWindow: true })
    ]);

    const activeTab = tabs[0];
    currentHostname = null;
    if (activeTab && activeTab.url) {
      try {
        const url = new URL(activeTab.url);
        currentHostname = url.hostname;
      } catch (error) {
        currentHostname = null;
      }
    }

    globalToggle.checked = settings.extensionEnabled;
    updateSiteToggleState(settings);

    const theme = settings.theme === "dark" ? "dark" : "light";
    themeSelect.value = theme;
    setTheme(theme);

    apiKeyInput.value = gemini.apiKey;
    if (gemini.model) {
      modelSelect.value = gemini.model;
    } else {
      modelSelect.value = "gemini-2.5-flash-lite";
    }
  }

  globalToggle.addEventListener("change", async (event) => {
    const enabled = event.target.checked;
    try {
      await saveExtensionSettings({ extensionEnabled: enabled });
    } catch (error) {
      console.error("Không lưu được trạng thái toàn bộ", error);
    }
  });

  siteToggle.addEventListener("change", async (event) => {
    if (!currentHostname) {
      return;
    }

    const enableSite = event.target.checked;

    try {
      const settings = await loadExtensionSettings();
      const blockedSet = new Set(settings.blockedSites);
      if (enableSite) {
        blockedSet.delete(currentHostname.toLowerCase());
      } else {
        blockedSet.add(currentHostname.toLowerCase());
      }

      const updated = await saveExtensionSettings({ blockedSites: Array.from(blockedSet) });
      updateSiteToggleState(updated);
    } catch (error) {
      console.error("Không cập nhật được trạng thái trang", error);
    }
  });

  themeSelect.addEventListener("change", async (event) => {
    const theme = event.target.value === "dark" ? "dark" : "light";
    setTheme(theme);
    try {
      await saveExtensionSettings({ theme });
    } catch (error) {
      console.error("Không lưu được theme", error);
    }
  });

  saveButton.addEventListener("click", async () => {
    await withStatus(async () => {
      const apiKey = apiKeyInput.value;
      const model = modelSelect.value;
      if (!apiKey.trim()) {
        throw new Error("Nhập API key trước");
      }
      await saveGeminiSettings({ apiKey, model });
    });
  });

  openOptionsButton.addEventListener("click", () => {
    API.runtime.openOptionsPage().catch((error) => {
      console.error("Không mở được trang cài đặt", error);
    });
  });

  function init() {
    refreshUI().catch((error) => {
      console.error("Không tải được dữ liệu action popup", error);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
