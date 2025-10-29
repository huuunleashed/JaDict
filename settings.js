"use strict";

// Shared settings utilities for JaDict UI contexts (background, action popup, options, etc.)
(function initializeSettingsModule(globalScope) {
  const API = (() => {
    if (typeof browser !== "undefined" && browser.runtime) {
      return browser;
    }
    if (typeof chrome !== "undefined" && chrome.runtime) {
      return chrome;
    }
    console.error("JaDict: No extension API available for settings module");
    return null;
  })();

  const DEFAULT_SETTINGS = Object.freeze({
    extensionEnabled: true,
    theme: "light",
    blockedSites: [],
    synonymLimit: 5,
    antonymLimit: 5
  });

  function cloneDefaultSettings() {
    return {
      extensionEnabled: DEFAULT_SETTINGS.extensionEnabled,
      theme: DEFAULT_SETTINGS.theme,
      blockedSites: [...DEFAULT_SETTINGS.blockedSites],
      synonymLimit: DEFAULT_SETTINGS.synonymLimit,
      antonymLimit: DEFAULT_SETTINGS.antonymLimit
    };
  }

  function normalizeLimit(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 20) {
      return parsed;
    }
    return fallback;
  }

  function normalizeSettings(raw) {
    const defaults = cloneDefaultSettings();
    if (!raw || typeof raw !== "object") {
      return defaults;
    }

    const normalized = { ...defaults };

    if (typeof raw.extensionEnabled === "boolean") {
      normalized.extensionEnabled = raw.extensionEnabled;
    }

    if (raw.theme === "light" || raw.theme === "dark") {
      normalized.theme = raw.theme;
    }

    if (Array.isArray(raw.blockedSites)) {
      normalized.blockedSites = raw.blockedSites
        .filter((site) => typeof site === "string" && site.trim().length > 0)
        .map((site) => site.trim().toLowerCase());
    }

    normalized.synonymLimit = normalizeLimit(raw.synonymLimit, defaults.synonymLimit);
    normalized.antonymLimit = normalizeLimit(raw.antonymLimit, defaults.antonymLimit);

    return normalized;
  }

  async function loadExtensionSettings() {
    if (!API) {
      return cloneDefaultSettings();
    }

    const stored = await API.storage.local.get("extensionSettings");
    return normalizeSettings(stored?.extensionSettings);
  }

  async function saveExtensionSettings(partialUpdate) {
    if (!API) {
      return cloneDefaultSettings();
    }

    const current = await loadExtensionSettings();
    const updated = { ...current, ...partialUpdate };

    if (!Array.isArray(updated.blockedSites)) {
      updated.blockedSites = [];
    }

    updated.blockedSites = updated.blockedSites
      .filter((site) => typeof site === "string" && site.trim().length > 0)
      .map((site) => site.trim().toLowerCase());

    updated.synonymLimit = normalizeLimit(updated.synonymLimit, DEFAULT_SETTINGS.synonymLimit);
    updated.antonymLimit = normalizeLimit(updated.antonymLimit, DEFAULT_SETTINGS.antonymLimit);

    await API.storage.local.set({ extensionSettings: updated });
    return updated;
  }

  function isSiteBlocked(settings, hostname) {
    if (!hostname || typeof hostname !== "string") {
      return false;
    }

    const normalizedHost = hostname.trim().toLowerCase();
    if (!normalizedHost) {
      return false;
    }

    return Array.isArray(settings?.blockedSites)
      ? settings.blockedSites.includes(normalizedHost)
      : false;
  }

  const exported = {
    DEFAULT_SETTINGS,
    cloneDefaultSettings,
    normalizeSettings,
    loadExtensionSettings,
    saveExtensionSettings,
    isSiteBlocked
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = exported;
  } else {
    globalScope.JA_SETTINGS = exported;
  }
})(typeof self !== "undefined" ? self : this);
