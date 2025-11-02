"use strict";

/**
 * JaDict v0.4 - Action Popup (Minimal Version for Testing)
 * This is a minimal version to test the new UI
 * Full features will be added incrementally
 */

(function initActionPopup() {
  // ============================================
  // API Compatibility Layer
  // ============================================
  const API = (() => {
    if (typeof browser !== "undefined" && browser.runtime) {
      return browser;
    }
    if (typeof chrome !== "undefined" && chrome.runtime) {
      return chrome;
    }
    console.error("JaDict: No extension API available");
    return null;
  })();

  if (!API || !window.JA_SETTINGS) {
    console.error("JaDict: Missing API or settings");
    return;
  }

  const { loadExtensionSettings, saveExtensionSettings } = window.JA_SETTINGS;
  const HistoryAPI = window.JA_HISTORY || null;

  // ============================================
  // DOM Elements
  // ============================================

  const themeToggle = document.getElementById("theme-toggle");
  const globalToggle = document.getElementById("global-toggle");

  const searchModeToggle = document.getElementById("search-mode-toggle");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const searchHint = document.getElementById("search-hint");
  if (searchHint && !searchHint.dataset.defaultContent) {
    searchHint.dataset.defaultContent = searchHint.innerHTML;
  }

  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  const clearRecentButton = document.getElementById("clear-recent");
  const recentSearches = document.getElementById("recent-searches");

  const clearChatButton = document.getElementById("clear-chat");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const chatSendButton = document.getElementById("chat-send");

  const clearHistoryButton = document.getElementById("clear-history");
  const historyList = document.getElementById("history-list");
  const filterButtons = document.querySelectorAll(".filter-button");
  const exportHistoryButton = document.getElementById("export-history");
  const historySearchInput = document.getElementById("history-search");

  const openSettingsButton = document.getElementById("open-settings");
  const openGuideButton = document.getElementById("open-guide");
  const modelToggle = document.getElementById("model-toggle");
  const modelSelector = document.querySelector(".model-selector");
  const modelMenu = document.getElementById("model-menu");
  let modelMenuItems = modelMenu ? Array.from(modelMenu.querySelectorAll("[data-model-id]")) : [];

  // ============================================
  // State (ensure defaults before settings load)
  // ============================================

  let currentTab = "dictionary";
  let currentTheme = "light";
  let isExtensionEnabled = true;
  let searchMode = "translate";
  let activeTabId = null;
  let activeTabUrl = null;

  const chatState = {
    messages: [],
    streamingId: null
  };

  const chatDomMap = new Map();
  const chatStreams = new Map();

  const GEMINI_MODEL_OPTIONS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro"
  ];
  const GEMINI_MODEL_SET = new Set(GEMINI_MODEL_OPTIONS);
  const GEMINI_DEFAULT_MODEL = "gemini-2.5-flash-lite";
  const GEMINI_MODEL_LABELS = {
    "gemini-2.5-flash": "Flash",
    "gemini-2.5-flash-lite": "Flash Lite",
    "gemini-2.5-pro": "Pro"
  };

  let currentModelId = GEMINI_DEFAULT_MODEL;
  let isModelToggleBusy = false;
  let geminiModelListenerAttached = false;
  let isModelMenuOpen = false;
  let modelMenuEventsAttached = false;
  
  function detectTranslationSearchIntent(query) {
    const normalized = query.trim();
    if (!normalized) {
      return "dictionary";
    }

    const newlineCount = (normalized.match(/\n/g) || []).length;
    const wordCount = normalized.split(/\s+/).filter(Boolean).length;
    const lengthScore = normalized.length;

    if (newlineCount >= 1 || wordCount >= 10 || lengthScore >= 140) {
      return "translation";
    }

    if (/[.!?]/.test(normalized) && wordCount >= 6) {
      return "translation";
    }

    if (/^(dịch|hãy dịch|translate|dịch sang)\b/i.test(normalized)) {
      return "translation";
    }

    return "dictionary";
  }

  function determineLookupType(query) {
    const normalized = query.trim();
    const wordCount = normalized.split(/\s+/).filter(Boolean).length;
    return wordCount <= 2 ? "word" : "phrase";
  }
  let chatPort = null;
  let isChatStreaming = false;

  const historyState = {
    filter: "all",
    search: "",
    entries: []
  };
  const historyEntryMap = new Map();
  let historySearchTimer = null;

  // ============================================
  // Theme Management
  // ============================================
  
  function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.dataset.theme = theme;
    
    // Update theme toggle button state
    if (themeToggle) {
      themeToggle.setAttribute("data-theme", theme);
    }
  }

  function toggleTheme() {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // Save to storage
    saveExtensionSettings({ theme: newTheme }).catch((error) => {
      console.error("Failed to save theme:", error);
    });
  }

  // ============================================
  // Tab Management
  // ============================================
  
  function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === tabName;
      button.classList.toggle("active", isActive);
    });
    
    // Update tab contents
    tabContents.forEach((content) => {
      const isActive = content.dataset.tabContent === tabName;
      content.classList.toggle("active", isActive);
    });
    
    console.log(`Switched to tab: ${tabName}`);

    if (tabName === "history") {
      loadHistoryEntries({ silent: true });
    } else if (tabName === "chatbot") {
      scrollChatToBottom();
    }
  }

  // ============================================
  // Search Functionality (Placeholder)
  // ============================================
  
  function handleSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
      showNotification("Vui lòng nhập từ hoặc câu cần tìm", "warning");
      return;
    }

    if (searchMode === "chat") {
      console.log(`Search routed to chat: ${query}`);
      switchTab("chatbot");
      if (chatInput) {
        chatInput.value = query;
      }
      handleChatSend(query);
      searchInput.value = "";
      return;
    }

    console.log(`Search query: ${query}`);

    const intent = detectTranslationSearchIntent(query);
    if (intent === "translation") {
      performTextTranslation(query);
      return;
    }

    const lookupType = determineLookupType(query);
    performDictionaryLookup(query, lookupType);
  }
  
  /**
   * Detect the type of search query
   * @param {string} query - The search query
   * @returns {string} - "word", "phrase", "sentence", or "chatbot"
   */
  function detectQueryType(query) {
    // Trim and normalize
    const normalized = query.trim();
    
    // Question patterns (trigger chatbot)
    const questionPatterns = [
      /^(what|who|where|when|why|how|can|could|would|should|is|are|does|do|did)\s+/i,
      /^(cái gì|ai|ở đâu|khi nào|tại sao|như thế nào|có thể|nên|là)\s+/i,
      /\?$/,  // Ends with question mark
    ];
    
    for (const pattern of questionPatterns) {
      if (pattern.test(normalized)) {
        return "chatbot";
      }
    }
    
    // Sentence indicators (trigger chatbot for translation/explanation)
    const sentenceIndicators = [
      /^(translate|dịch|explain|giải thích|what does|nghĩa là gì)/i,
      /[.!?]$/,  // Ends with punctuation
      /\s+(is|are|was|were|will|shall|can|could|would|should|may|might|must)\s+/i,
    ];
    
    for (const indicator of sentenceIndicators) {
      if (indicator.test(normalized)) {
        return "chatbot";
      }
    }
    
    // Count words
    const wordCount = normalized.split(/\s+/).length;
    
    // Single word or very short (1-2 words) - dictionary
    if (wordCount <= 2) {
      return "word";
    }
    
    // 3-5 words without question/sentence patterns - phrase lookup
    if (wordCount <= 5) {
      return "phrase";
    }
    
    // Long text - chatbot
    return "chatbot";
  }
  
  /**
   * Perform dictionary lookup
   * @param {string} query - The word/phrase to look up
   * @param {string} type - The query type (word/phrase)
   */
  async function performDictionaryLookup(query, type) {
    try {
      showNotification(`Đang tra cứu: "${query}"...`, "info");
      
      // Send message to background script
      const response = await API.runtime.sendMessage({
        type: "DICTIONARY_LOOKUP",
        query: query,
        queryType: type
      });
      
      if (response.success) {
        // Open search popup with results
        openSearchPopup(response.data, query, "dictionary");
        
        // Add to recent searches
        addToRecentSearches(query, response.data);

        // Persist to history
        recordLookupHistory(query, response.data, { mode: "dictionary" });
      } else {
        showNotification(`Lỗi: ${response.error}`, "error");
      }
    } catch (error) {
      console.error("Dictionary lookup error:", error);
      showNotification("Không thể tra cứu. Vui lòng thử lại.", "error");
    }
  }

  async function performTextTranslation(text) {
    const query = text.trim();
    if (!query) {
      showNotification("Không có nội dung để dịch", "warning");
      return;
    }

    try {
      const snippet = truncateText(query, 40);
      showNotification(`Đang dịch: "${snippet}"`, "info");

      const response = await API.runtime.sendMessage({
        type: "TRANSLATE_TEXT",
        text: query
      });

      if (response?.success) {
        openSearchPopup(response.data, query, "dictionary");
        addToRecentSearches(query, response.data);
        recordLookupHistory(query, response.data, {
          mode: "translation",
          sourceLang: response.data?.detectedLang || null,
          targetLang: response.data?.targetLang || null
        });
      } else {
        const errorMessage = response?.error || "Không thể dịch đoạn văn.";
        showNotification(errorMessage, "error");
      }
    } catch (error) {
      console.error("Translation error:", error);
      showNotification("Không thể dịch đoạn văn. Vui lòng thử lại.", "error");
    }
  }

  function toggleSearchMode() {
    searchMode = searchMode === "translate" ? "chat" : "translate";
    updateSearchModeUI();
    if (searchMode === "chat") {
      switchTab("chatbot");
      if (chatInput) {
        chatInput.focus();
      }
    } else if (searchInput) {
      searchInput.focus();
    }
  }

  function updateSearchModeUI() {
    if (searchModeToggle) {
      const isChat = searchMode === "chat";
      searchModeToggle.dataset.mode = searchMode;
      searchModeToggle.classList.toggle("active", isChat);
      searchModeToggle.textContent = isChat ? "Hỏi AI" : "Dịch đoạn";
      searchModeToggle.title = isChat
        ? "Bấm để chuyển sang chế độ dịch đoạn"
        : "Bấm để chuyển sang chế độ Hỏi AI";
      searchModeToggle.setAttribute("aria-pressed", isChat ? "true" : "false");
      searchModeToggle.setAttribute("aria-label", isChat ? "Đang ở chế độ Hỏi AI" : "Đang ở chế độ dịch đoạn");
    }

    if (searchInput) {
      searchInput.placeholder = searchMode === "chat"
        ? "Nhập câu hỏi cho trợ lý AI..."
        : "Dán đoạn văn hoặc từ cần tra cứu...";
    }

    if (searchHint) {
      const hintContent = searchMode === "chat"
        ? '<span class="hint-text">Ví dụ: "Giải thích cấu trúc câu điều kiện loại 2"</span>'
        : '<span class="hint-text">Ví dụ: Dán đoạn tiếng Anh để dịch sang tiếng Việt</span>';
      searchHint.innerHTML = hintContent;
      searchHint.dataset.defaultContent = hintContent;
    }
  }

  // ============================================
  // Gemini Model Toggle
  // ============================================

  function formatModelLabel(modelId) {
    return GEMINI_MODEL_LABELS[modelId] || modelId;
  }

  function refreshModelMenuItems() {
    if (!modelMenu) {
      modelMenuItems = [];
      return;
    }
    modelMenuItems = Array.from(modelMenu.querySelectorAll("[data-model-id]"));
  }

  function updateModelToggleUI() {
    const label = formatModelLabel(currentModelId);

    if (modelToggle) {
      modelToggle.textContent = `Model: ${label}`;
      modelToggle.dataset.modelId = currentModelId;
      modelToggle.disabled = isModelToggleBusy;
      modelToggle.title = `Model Gemini hiện tại: ${label}`;
      modelToggle.setAttribute("aria-label", `Chọn model Gemini (hiện tại: ${label})`);
      modelToggle.setAttribute("aria-expanded", isModelMenuOpen ? "true" : "false");
      modelToggle.classList.toggle("is-open", isModelMenuOpen);
    }

    refreshModelMenuItems();

    if (modelMenuItems.length > 0) {
      modelMenuItems.forEach((item) => {
        const modelId = item.dataset.modelId;
        const isActive = modelId === currentModelId;
        item.classList.toggle("active", isActive);
        item.setAttribute("aria-checked", isActive ? "true" : "false");
        item.tabIndex = -1;
        item.disabled = isModelToggleBusy;
      });
    }

    if (modelMenu) {
      modelMenu.classList.toggle("is-loading", isModelToggleBusy);
    }
  }

  function attachModelMenuGlobalEvents() {
    if (modelMenuEventsAttached) {
      return;
    }

    document.addEventListener("mousedown", handleDocumentPointerDown);
    document.addEventListener("keydown", handleDocumentKeydown, true);
    modelMenuEventsAttached = true;
  }

  function handleDocumentPointerDown(event) {
    if (!isModelMenuOpen) {
      return;
    }

    if (modelSelector && modelSelector.contains(event.target)) {
      return;
    }

    closeModelMenu();
  }

  function handleDocumentKeydown(event) {
    if (!isModelMenuOpen) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeModelMenu({ focusToggle: true });
    }
  }

  function focusModelMenuSibling(currentItem, direction) {
    if (!currentItem || modelMenuItems.length === 0) {
      return;
    }

    const currentIndex = modelMenuItems.indexOf(currentItem);
    if (currentIndex === -1) {
      return;
    }

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) {
      nextIndex = modelMenuItems.length - 1;
    } else if (nextIndex >= modelMenuItems.length) {
      nextIndex = 0;
    }

    const target = modelMenuItems[nextIndex];
    if (target && typeof target.focus === "function") {
      target.focus();
    }
  }

  function focusActiveModelMenuItem() {
    if (!isModelMenuOpen || !modelMenu) {
      return;
    }

    requestAnimationFrame(() => {
      const activeItem = modelMenu.querySelector(".model-menu-item.active");
      if (activeItem && typeof activeItem.focus === "function") {
        activeItem.focus();
      }
    });
  }

  function openModelMenu() {
    if (!modelMenu || isModelMenuOpen || isModelToggleBusy) {
      return;
    }

    isModelMenuOpen = true;
    modelMenu.hidden = false;
    updateModelToggleUI();
    attachModelMenuGlobalEvents();

    requestAnimationFrame(() => {
      const activeItem = modelMenu.querySelector(".model-menu-item.active");
      const focusTarget = activeItem || modelMenuItems[0];
      if (focusTarget && typeof focusTarget.focus === "function") {
        focusTarget.focus();
      }
    });
  }

  function closeModelMenu(options = {}) {
    if (!modelMenu || !isModelMenuOpen) {
      return;
    }

    isModelMenuOpen = false;
    modelMenu.hidden = true;
    updateModelToggleUI();

    if (options.focusToggle && modelToggle && typeof modelToggle.focus === "function") {
      modelToggle.focus();
    }
  }

  function toggleModelMenu() {
    if (isModelMenuOpen) {
      closeModelMenu();
    } else {
      openModelMenu();
    }
  }

  function handleModelMenuItemKeydown(event) {
    if (!modelMenuItems.length) {
      return;
    }

    const item = event.currentTarget;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusModelMenuSibling(item, +1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusModelMenuSibling(item, -1);
        break;
      case "Home":
        event.preventDefault();
        modelMenuItems[0]?.focus();
        break;
      case "End":
        event.preventDefault();
        modelMenuItems[modelMenuItems.length - 1]?.focus();
        break;
      case " ":
      case "Enter":
        event.preventDefault();
        handleModelMenuSelection(item.dataset.modelId).catch((error) => {
          console.error("JaDict: Model toggle lỗi", error);
        });
        break;
      case "Escape":
        event.preventDefault();
        closeModelMenu({ focusToggle: true });
        break;
      default:
        break;
    }
  }

  async function handleModelMenuSelection(modelId) {
    if (!modelId || !GEMINI_MODEL_SET.has(modelId)) {
      return;
    }

    if (modelId === currentModelId) {
      closeModelMenu({ focusToggle: false });
      return;
    }

    if (isModelToggleBusy) {
      return;
    }

    isModelToggleBusy = true;
    updateModelToggleUI();

    const label = formatModelLabel(modelId);

    try {
      await persistGeminiModel(modelId);
      updateModelToggleUI();
      showNotification(`Đã chuyển sang model ${label}`, "info");
      closeModelMenu({ focusToggle: true });
    } catch (error) {
      console.error("JaDict: Không đổi được model", error);
      showNotification(error?.message || "Không đổi được model Gemini", "error");
    } finally {
      isModelToggleBusy = false;
      updateModelToggleUI();
      if (isModelMenuOpen) {
        focusActiveModelMenuItem();
      }
    }
  }

  async function persistGeminiModel(modelId) {
    if (!GEMINI_MODEL_SET.has(modelId)) {
      throw new Error("Model Gemini không hợp lệ");
    }

    if (!API?.storage?.local) {
      currentModelId = modelId;
      return;
    }

    try {
      await API.storage.local.set({ geminiModel: modelId });
      currentModelId = modelId;
    } catch (error) {
      console.error("JaDict: Không lưu được model", error);
      throw new Error("Không lưu được model Gemini");
    }
  }

  async function loadStoredGeminiModel() {
    if (!API?.storage?.local) {
      currentModelId = GEMINI_DEFAULT_MODEL;
      return currentModelId;
    }

    try {
      const stored = await API.storage.local.get(["geminiModel"]);
      const modelId = stored?.geminiModel;
      if (modelId && GEMINI_MODEL_SET.has(modelId)) {
        currentModelId = modelId;
        return modelId;
      }

      currentModelId = GEMINI_DEFAULT_MODEL;
      return currentModelId;
    } catch (error) {
      console.warn("JaDict: Không đọc được model đã chọn", error);
      currentModelId = GEMINI_DEFAULT_MODEL;
      return currentModelId;
    }
  }

  function attachGeminiModelStorageListener() {
    if (geminiModelListenerAttached || !API?.storage?.onChanged) {
      return;
    }

    API.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local" || !changes?.geminiModel) {
        return;
      }

      const newValue = changes.geminiModel.newValue;
      if (!newValue || !GEMINI_MODEL_SET.has(newValue)) {
        return;
      }

      currentModelId = newValue;
      updateModelToggleUI();
      if (isModelMenuOpen) {
        focusActiveModelMenuItem();
      }
    });

    geminiModelListenerAttached = true;
  }

  async function initializeModelToggle() {
    if (!modelToggle) {
      return;
    }

    attachModelMenuGlobalEvents();
    refreshModelMenuItems();

    modelMenuItems.forEach((item) => {
      item.addEventListener("click", (event) => {
        const selectedId = event.currentTarget?.dataset?.modelId;
        handleModelMenuSelection(selectedId).catch((error) => {
          console.error("JaDict: Model toggle lỗi", error);
        });
      });

      item.addEventListener("keydown", handleModelMenuItemKeydown);
    });

    await loadStoredGeminiModel();
    updateModelToggleUI();
    attachGeminiModelStorageListener();
  }
  
  /**
   * Open search popup window
   * @param {Object} data - The search result data
   * @param {string} query - The original query
   * @param {string} mode - "dictionary" or "chatbot"
   */
  function openSearchPopup(data, query, mode) {
    // Store data in chrome.storage for popup to access
    const popupData = {
      mode: mode,
      query: query,
      data: data,
      timestamp: Date.now()
    };
    
    API.storage.local.set({ searchPopupData: popupData }, () => {
      // Open popup window
      const width = 500;
      const height = 600;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;
      
      API.windows.create({
        url: API.runtime.getURL("search-popup.html"),
        type: "popup",
        width: width,
        height: height,
        left: Math.round(left),
        top: Math.round(top)
      });
    });
  }
  
  /**
   * Add query to recent searches
   * @param {string} query - The search query
   * @param {Object} result - The search result
   */
  function addToRecentSearches(query, result) {
    API.storage.local.get(["recentSearches"], (items) => {
      let recent = items.recentSearches || [];
      
      // Remove existing entry for the same query (case-insensitive)
      recent = recent.filter(item => 
        item.query.toLowerCase() !== query.toLowerCase()
      );
      
      // Add new search at the top
      recent.unshift({
        query: query,
        result: result,
        timestamp: Date.now()
      });
      
      // Keep only last 10
      recent = recent.slice(0, 10);
      
      API.storage.local.set({ recentSearches: recent }, () => {
        // Update UI
        displayRecentSearches();
      });
    });
  }
  
  /**
   * Display recent searches in Dictionary tab
   */
  function displayRecentSearches() {
    API.storage.local.get(["recentSearches"], (items) => {
      const recent = items.recentSearches || [];
      
      if (recent.length === 0) {
        recentSearches.innerHTML = `
          <div class="empty-state">
            <span class="empty-icon">🔍</span>
            <p class="empty-text">Chưa có tìm kiếm nào</p>
            <p class="empty-subtext">Bắt đầu bằng cách tìm kiếm một từ ở trên</p>
          </div>
        `;
        return;
      }
      
      recentSearches.innerHTML = recent.map((item, index) => `
        <div class="search-item" data-query="${escapeHtml(item.query)}">
          <div class="search-item-content">
            <span class="search-query">${escapeHtml(item.query)}</span>
            <span class="search-time">${formatTime(item.timestamp)}</span>
          </div>
          <button class="search-item-delete" data-index="${index}" title="Xóa">×</button>
        </div>
      `).join("");
      
      // Add click handlers
      recentSearches.querySelectorAll(".search-item").forEach(item => {
        item.addEventListener("click", (e) => {
          if (!e.target.classList.contains("search-item-delete")) {
            const query = item.dataset.query;
            searchInput.value = query;
            handleSearch();
          }
        });
      });
      
      // Add delete handlers
      recentSearches.querySelectorAll(".search-item-delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const index = parseInt(btn.dataset.index);
          deleteRecentSearch(index);
        });
      });
    });
  }
  
  /**
   * Delete a recent search
   * @param {number} index - Index of search to delete
   */
  function deleteRecentSearch(index) {
    API.storage.local.get(["recentSearches"], (items) => {
      let recent = items.recentSearches || [];
      recent.splice(index, 1);
      API.storage.local.set({ recentSearches: recent }, () => {
        displayRecentSearches();
      });
    });
  }
  
  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} - Escaped text
   */
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function escapeAttribute(value) {
    if (value === null || value === undefined) {
      return "";
    }
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  
  /**
   * Format timestamp to relative time
   * @param {number} timestamp - Unix timestamp
   * @returns {string} - Formatted time
   */
  function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    
    return new Date(timestamp).toLocaleDateString("vi-VN");
  }

  // ============================================
  // Chat Functionality (Streaming Gemini)
  // ============================================

  const CHAT_EMPTY_STATE_HTML = `
    <div class="empty-state">
      <span class="empty-icon">💬</span>
      <p class="empty-text">Bắt đầu cuộc trò chuyện</p>
      <p class="empty-subtext">Hỏi tôi bất cứ điều gì bằng tiếng Anh hoặc tiếng Việt!</p>
    </div>
  `;

  function createChatMessage(role, content, options = {}) {
    return {
      id: options.id || `${role}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      role,
      content: typeof content === "string" ? content : "",
      timestamp: typeof options.timestamp === "number" ? options.timestamp : Date.now(),
      streaming: options.streaming === true
    };
  }

  function renderChatMessages() {
    if (!chatMessages) {
      return;
    }

    chatDomMap.clear();

    if (!Array.isArray(chatState.messages) || chatState.messages.length === 0) {
      chatMessages.innerHTML = CHAT_EMPTY_STATE_HTML;
      return;
    }

    const fragment = document.createDocumentFragment();
    chatMessages.innerHTML = "";

    chatState.messages.forEach((message) => {
      const element = createChatMessageElement(message);
      chatDomMap.set(message.id, element);
      fragment.appendChild(element);
    });

    chatMessages.appendChild(fragment);
    scrollChatToBottom();
  }

  function createChatMessageElement(message) {
    const container = document.createElement("div");
    container.className = `chat-message ${message.role}`;
    container.dataset.messageId = message.id;

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.textContent = message.role === "user" ? "👤" : "🤖";

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    if (message.streaming) {
      bubble.classList.add("streaming");
    }
    bubble.innerHTML = formatChatHtml(message.content, { streaming: message.streaming });

    container.appendChild(avatar);
    container.appendChild(bubble);
    return container;
  }

  function formatChatHtml(text, options = {}) {
    if (!text) {
      return options.streaming
        ? '<span class="chat-placeholder">Đang trả lời...</span>'
        : '<span class="chat-placeholder">(Không có nội dung)</span>';
    }
    return renderMarkdownSafe(text);
  }

  function renderMarkdownSafe(text) {
    if (!text) {
      return "";
    }

    const codePattern = /```([a-z0-9+-]*)?\n([\s\S]*?)```/gi;
    let lastIndex = 0;
    let match;
    const segments = [];

    while ((match = codePattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
      }
      segments.push({ type: "code", language: match[1] || "", value: match[2] || "" });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      segments.push({ type: "text", value: text.slice(lastIndex) });
    }

    return segments.map((segment) => {
      if (segment.type === "code") {
        return renderCodeBlock(segment.language, segment.value);
      }
      return renderInlineMarkdown(segment.value);
    }).join("");
  }

  function renderCodeBlock(language, code) {
    const safeCode = escapeHtml(code || "");
    const langAttr = language ? ` data-lang="${escapeAttribute(language.toLowerCase())}"` : "";
    return `<pre><code${langAttr}>${safeCode}</code></pre>`;
  }

  function renderInlineMarkdown(text) {
    if (!text) {
      return "";
    }

    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const htmlParts = [];
    let paragraphBuffer = [];
    let inUnordered = false;
    let inOrdered = false;

    const closeLists = () => {
      if (inUnordered) {
        htmlParts.push("</ul>");
        inUnordered = false;
      }
      if (inOrdered) {
        htmlParts.push("</ol>");
        inOrdered = false;
      }
    };

    const flushParagraph = () => {
      if (paragraphBuffer.length === 0) {
        return;
      }
      const paragraphText = paragraphBuffer.join("\n");
      const rendered = renderInlineSpans(paragraphText).replace(/\n/g, "<br>");
      htmlParts.push(`<p>${rendered}</p>`);
      paragraphBuffer = [];
    };

    for (const rawLine of lines) {
      const line = rawLine; // preserve indentation for code-like formatting inside paragraphs
      const trimmed = line.trim();

      const unorderedMatch = trimmed.match(/^[-*+]\s+(.*)$/);
      const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);

      if (unorderedMatch) {
        flushParagraph();
        if (!inUnordered) {
          closeLists();
          htmlParts.push('<ul class="chat-list">');
          inUnordered = true;
        }
        htmlParts.push(`<li>${renderInlineSpans(unorderedMatch[1])}</li>`);
        continue;
      }

      if (orderedMatch) {
        flushParagraph();
        if (!inOrdered) {
          closeLists();
          htmlParts.push('<ol class="chat-list chat-list--ordered">');
          inOrdered = true;
        }
        htmlParts.push(`<li>${renderInlineSpans(orderedMatch[1])}</li>`);
        continue;
      }

      if (!trimmed) {
        flushParagraph();
        closeLists();
        continue;
      }

      paragraphBuffer.push(line);
    }

    flushParagraph();
    closeLists();

    return htmlParts.join("");
  }

  function renderInlineSpans(text) {
    if (!text) {
      return "";
    }

    let safe = escapeHtml(text);

    // Extract inline code first to protect from other formatting
    const inlineCodes = [];
    safe = safe.replace(/`([^`]+?)`/g, (match, code) => {
      const index = inlineCodes.length;
      inlineCodes.push(code);
      return `§§INLINE_CODE_${index}§§`;
    });

    safe = safe.replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, (match, label, url) => {
      const safeUrl = escapeAttribute(url);
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    });

  safe = safe.replace(/(\*\*|__)(.+?)\1/g, (match, _wrapper, content) => `<strong>${content}</strong>`);
  safe = safe.replace(/(^|[\s.,!?;:])\*(?!\s)([^*]+?)(?<!\s)\*(?=[\s.,!?;:]|$)/g, (match, prefix, content) => `${prefix}<em>${content}</em>`);
  safe = safe.replace(/(^|[\s.,!?;:])_(?!\s)([^_]+?)(?<!\s)_(?=[\s.,!?;:]|$)/g, (match, prefix, content) => `${prefix}<em>${content}</em>`);

    safe = safe.replace(/§§INLINE_CODE_(\d+)§§/g, (match, index) => {
      const code = inlineCodes[Number(index)] || "";
      return `<code>${escapeHtml(code)}</code>`;
    });

    return safe;
  }

  function scrollChatToBottom() {
    if (!chatMessages) {
      return;
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function ensureChatPort() {
    if (chatPort) {
      return chatPort;
    }
    if (!API?.runtime?.connect) {
      return null;
    }

    try {
      chatPort = API.runtime.connect({ name: "chatbot" });
    } catch (error) {
      console.error("JaDict: Không thể mở kênh chat", error);
      chatPort = null;
      return null;
    }

    if (!chatPort) {
      return null;
    }

    chatPort.onMessage.addListener(onChatPortMessage);
    chatPort.onDisconnect.addListener(() => {
      chatPort = null;
      chatStreams.clear();
      chatState.streamingId = null;
      if (isChatStreaming && chatSendButton) {
        chatSendButton.disabled = false;
      }
      isChatStreaming = false;
    });

    return chatPort;
  }

  function onChatPortMessage(message) {
    if (!message || !message.type) {
      return;
    }

    const streamId = message.streamId;

    switch (message.type) {
      case "start":
        chatState.streamingId = streamId;
        break;
      case "update":
        handleChatPortUpdate(streamId, message.text || "");
        break;
      case "done":
        finalizeChatPortStream(message);
        break;
      case "error":
        handleChatPortError(streamId, message.error || "Đã xảy ra lỗi khi gọi Gemini.");
        break;
      default:
        break;
    }
  }

  function handleChatPortUpdate(streamId, text) {
    const messageId = chatStreams.get(streamId);
    if (!messageId) {
      return;
    }
    updateChatMessageContent(messageId, text, { streaming: true });
    scrollChatToBottom();
  }

  function finalizeChatPortStream(payload) {
    const streamId = payload.streamId;
    const messageId = chatStreams.get(streamId);

    if (messageId) {
      updateChatMessageContent(messageId, payload.text || "", { streaming: false });
      chatStreams.delete(streamId);
    }

    chatState.streamingId = null;
    isChatStreaming = false;

    if (chatSendButton) {
      chatSendButton.disabled = false;
    }

    if (Array.isArray(payload.messages)) {
      syncChatContextFromStoredMessages(payload.messages);
    }

    if (currentTab === "history") {
      loadHistoryEntries({ silent: true });
    }
  }

  function handleChatPortError(streamId, errorText) {
    const messageId = chatStreams.get(streamId);
    if (messageId) {
      updateChatMessageContent(messageId, errorText || "Đã xảy ra lỗi.", { streaming: false });
      chatStreams.delete(streamId);
    }

    chatState.streamingId = null;
    isChatStreaming = false;

    if (chatSendButton) {
      chatSendButton.disabled = false;
    }

    if (errorText) {
      showNotification(errorText, "error");
    }
  }

  function updateChatMessageContent(messageId, text, options = {}) {
    const message = chatState.messages.find((item) => item.id === messageId);
    if (message) {
      message.content = typeof text === "string" ? text : "";
      message.streaming = options.streaming === true;
    }

    const element = chatDomMap.get(messageId);
    if (!element) {
      return;
    }

    const bubble = element.querySelector(".chat-bubble");
    if (!bubble) {
      return;
    }

    bubble.innerHTML = formatChatHtml(text, { streaming: options.streaming === true });
    bubble.classList.toggle("streaming", options.streaming === true);
  }

  function syncChatContextFromStoredMessages(storedMessages) {
    chatState.messages = convertStoredChatMessages(storedMessages);
    renderChatMessages();
  }

  function convertStoredChatMessages(stored) {
    if (!Array.isArray(stored)) {
      return [];
    }
    return stored.map((item, index) => createChatMessage(
      item?.role === "assistant" ? "assistant" : "user",
      typeof item?.content === "string" ? item.content : "",
      {
        id: item?.id || `stored_${index}_${item?.timestamp || Date.now()}`,
        timestamp: typeof item?.timestamp === "number" ? item.timestamp : Date.now(),
        streaming: false
      }
    ));
  }

  function detectChatIntent(message) {
    if (!message) {
      return "general";
    }

    const normalized = message.trim();
    if (!normalized) {
      return "general";
    }

    const lowered = normalized.toLowerCase();
    const translationTriggers = [
      /^(hãy\s+)?dịch\b/,
      /^vui lòng\s+dịch\b/,
      /^translate\b/,
      /dịch\s+sang\s+tiếng/,
      /dịch\s+ra\s+tiếng/,
      /can you translate/i,
      /please translate/i
    ];

    if (translationTriggers.some((pattern) => pattern.test(lowered))) {
      return "translation";
    }

    const newlineCount = (normalized.match(/\n/g) || []).length;
    const wordCount = normalized.split(/\s+/).filter(Boolean).length;

    if (newlineCount >= 1 || wordCount >= 25) {
      return "translation";
    }

    if (!/[?]/.test(normalized) && wordCount >= 15) {
      return "translation";
    }

    return "general";
  }

  async function handleChatSend(messageOverride) {
    if (!chatInput || !chatMessages) {
      return;
    }

    const messageSource = typeof messageOverride === "string"
      ? messageOverride
      : chatInput.value;

    const message = messageSource.trim();
    if (!message || isChatStreaming) {
      return;
    }

    const tabId = Number.isFinite(activeTabId) ? activeTabId : await refreshActiveTab();
    if (!Number.isFinite(tabId)) {
      showNotification("Không xác định được tab hiện hành", "error");
      return;
    }

    const timestamp = Date.now();
    const userMessage = createChatMessage("user", message, { timestamp });
    chatState.messages.push(userMessage);
    renderChatMessages();

    chatInput.value = "";
    chatInput.style.height = "40px";

    const streamId = `stream_${timestamp}_${Math.random().toString(16).slice(2)}`;
    const assistantMessage = createChatMessage("assistant", "", { streaming: true });
    chatState.messages.push(assistantMessage);
    chatStreams.set(streamId, assistantMessage.id);
    chatState.streamingId = streamId;
    isChatStreaming = true;

    if (chatSendButton) {
      chatSendButton.disabled = true;
    }

    renderChatMessages();

    const port = ensureChatPort();
    if (!port) {
      handleChatPortError(streamId, "Không thể kết nối tới trợ lý AI.");
      return;
    }

    const intent = detectChatIntent(message);

    try {
      port.postMessage({
        type: "chat",
        streamId,
        message,
        tabId,
        intent
      });
    } catch (error) {
      console.error("JaDict: Không gửi được yêu cầu chat", error);
      handleChatPortError(streamId, "Không thể gửi tin nhắn. Vui lòng thử lại.");
    }
  }

  async function clearChat() {
    chatStreams.clear();
    chatState.messages = [];
    chatState.streamingId = null;
    isChatStreaming = false;

    if (chatSendButton) {
      chatSendButton.disabled = false;
    }

    renderChatMessages();

    if (Number.isFinite(activeTabId) && API?.runtime?.sendMessage) {
      try {
        await API.runtime.sendMessage({ type: "CLEAR_CHAT_CONTEXT", tabId: activeTabId });
      } catch (error) {
        console.warn("JaDict: Không xóa được lịch sử chat", error);
      }
    }

    showNotification("Đã xóa cuộc trò chuyện", "info");
  }

  async function loadChatContextForTab(tabId) {
    if (!Number.isFinite(tabId) || !API?.runtime?.sendMessage) {
      renderChatMessages();
      return;
    }

    try {
      const response = await API.runtime.sendMessage({
        type: "GET_CHAT_CONTEXT",
        tabId
      });

      if (response?.success) {
        syncChatContextFromStoredMessages(response.messages);
      } else {
        chatState.messages = [];
        renderChatMessages();
      }
    } catch (error) {
      console.warn("JaDict: Không tải được lịch sử chat", error);
      chatState.messages = [];
      renderChatMessages();
    }
  }

  // ============================================
  // History Functionality
  // ============================================

  async function initHistoryModule() {
    if (!HistoryAPI || typeof HistoryAPI.init !== "function") {
      return false;
    }

    try {
      const result = await HistoryAPI.init();
      return Boolean(result);
    } catch (error) {
      console.warn("JaDict: Không khởi tạo được lịch sử", error);
      return false;
    }
  }

  async function loadHistoryEntries(options = {}) {
    const { silent = false } = options;

    if (!historyList) {
      return;
    }

    if (!HistoryAPI || typeof HistoryAPI.getEntries !== "function") {
      historyState.entries = [];
      historyEntryMap.clear();
      renderHistoryList();
      if (!silent) {
        showNotification("Lịch sử chưa khả dụng trong môi trường này", "warning");
      }
      return;
    }

    try {
      const entries = await HistoryAPI.getEntries({
        type: historyState.filter,
        search: historyState.search,
        limit: 200,
        direction: "desc"
      });

      historyState.entries = Array.isArray(entries) ? entries : [];
      historyEntryMap.clear();
      historyState.entries.forEach((entry) => {
        if (entry?.id) {
          historyEntryMap.set(entry.id, entry);
        }
      });

      renderHistoryList();
    } catch (error) {
      console.error("JaDict: Không tải được lịch sử", error);
      if (!silent) {
        showNotification("Không thể tải lịch sử", "error");
      }
    }
  }

  function renderHistoryList() {
    if (!historyList) {
      return;
    }

    if (!HistoryAPI || typeof HistoryAPI.getEntries !== "function") {
      historyList.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📜</span>
          <p class="empty-text">Lịch sử chưa khả dụng</p>
          <p class="empty-subtext">Trình duyệt này không hỗ trợ IndexedDB</p>
        </div>
      `;
      return;
    }

    if (!historyState.entries || historyState.entries.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📜</span>
          <p class="empty-text">Chưa có lịch sử</p>
          <p class="empty-subtext">Các tra cứu và trò chuyện của bạn sẽ xuất hiện ở đây</p>
        </div>
      `;
      return;
    }

    const groups = groupHistoryEntries(historyState.entries);
    const html = groups.map((group) => {
      const itemsHtml = group.items.map(renderHistoryItem).join("");
      return `
        <div class="history-group">
          <div class="history-group-title">${escapeHtml(group.label)}</div>
          ${itemsHtml}
        </div>
      `;
    }).join("");

    historyList.innerHTML = html;
  }

  function groupHistoryEntries(entries) {
    const groups = new Map();

    entries.forEach((entry) => {
      const key = formatDateKey(entry?.timestamp);
      if (!groups.has(key)) {
        groups.set(key, {
          label: formatHistoryGroupLabel(entry?.timestamp),
          items: []
        });
      }
      groups.get(key).items.push(entry);
    });

    return Array.from(groups.values());
  }

  function renderHistoryItem(entry) {
    const icon = entry?.type === "chat" ? "🤖" : "📚";
    const queryText = entry?.query ? escapeHtml(entry.query) : "(Không có tiêu đề)";
    const snippet = createHistorySnippet(entry);
    const typeLabel = entry?.type === "chat"
      ? "Trò chuyện"
      : entry?.metadata?.mode === "translation"
        ? "Dịch đoạn"
        : "Tra cứu";
    const directionLabel = entry?.metadata?.mode === "translation"
      ? formatTranslationDirection(entry.metadata)
      : "";

    const snippetHtml = snippet ? `<div class="history-snippet">${escapeHtml(snippet)}</div>` : "";

    return `
      <div class="history-item" data-entry-id="${escapeHtml(entry?.id || "")}">
        <div class="history-icon">${icon}</div>
        <div class="history-content">
          <div class="history-query">${queryText}</div>
          ${snippetHtml}
          <div class="history-meta">
            <span class="history-type">${typeLabel}${directionLabel ? ` · ${directionLabel}` : ""}</span>
            <span>${formatHistoryTime(entry?.timestamp)}</span>
          </div>
        </div>
      </div>
    `;
  }

  function createHistorySnippet(entry) {
    if (!entry) {
      return "";
    }

    if (entry.type === "chat") {
      const responseText = typeof entry.response === "string" ? entry.response : "";
      return truncateText(collapseWhitespace(responseText), 160);
    }

    if (entry.type === "lookup") {
      const response = entry.response;
      let html = "";
      if (typeof response === "string") {
        html = response;
      } else if (response && typeof response.html === "string") {
        html = response.html;
      }

      if (html) {
        const text = collapseWhitespace(stripHtml(html));
        if (text) {
          return truncateText(text, 160);
        }
      }

      if (response && typeof response.translation === "string") {
        return truncateText(collapseWhitespace(response.translation), 160);
      }
    }

    return "";
  }

  function formatTranslationDirection(metadata) {
    if (!metadata) {
      return "";
    }

    const labelFor = (value) => {
      if (!value) {
        return "";
      }
      const lower = String(value).toLowerCase();
      if (lower.startsWith("vi")) {
        return "VI";
      }
      if (lower.startsWith("en")) {
        return "EN";
      }
      return lower.slice(0, 2).toUpperCase();
    };

    const source = labelFor(metadata.sourceLang);
    const target = labelFor(metadata.targetLang);

    if (!source || !target) {
      return "";
    }

    return `${source} → ${target}`;
  }

  function truncateText(text, maxLength) {
    if (typeof text !== "string") {
      return "";
    }
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength - 1)}…`;
  }

  function recordLookupHistory(query, result, extraMetadata = {}) {
    if (!HistoryAPI || typeof HistoryAPI.addEntry !== "function") {
      return;
    }

    const metadata = {
      detectedLang: result?.detectedLang || result?.aiData?.detectedLang || null,
      ...extraMetadata
    };

    const payload = {
      type: "lookup",
      query,
      response: result,
      timestamp: Date.now(),
      tabId: activeTabId,
      url: activeTabUrl || null,
      metadata
    };

    HistoryAPI.addEntry(payload)
      .then(() => {
        if (currentTab === "history") {
          loadHistoryEntries({ silent: true });
        }
      })
      .catch((error) => {
        console.warn("JaDict: Không lưu được lịch sử tra cứu", error);
      });
  }

  function handleHistoryListClick(event) {
    const item = event.target.closest(".history-item");
    if (!item) {
      return;
    }

    const entryId = item.dataset.entryId;
    if (!entryId) {
      return;
    }

    const entry = historyEntryMap.get(entryId);
    if (!entry) {
      return;
    }

    if (entry.type === "lookup") {
      handleHistoryLookupEntry(entry);
    } else if (entry.type === "chat") {
      handleHistoryChatEntry(entry);
    }
  }

  function handleHistoryLookupEntry(entry) {
    const response = entry?.response || {};
    const data = typeof response === "object" && response !== null ? response : { html: String(response || "") };
    openSearchPopup(data, entry?.query || "", "dictionary");
  }

  function handleHistoryChatEntry(entry) {
    const question = entry?.query || "";
    const answer = typeof entry?.response === "string" ? entry.response : "";
    const html = `
      <div class="dict-section">
        <div class="dict-heading">Trò chuyện</div>
        <div class="dict-body">
          <p><strong>Câu hỏi:</strong> ${escapeHtml(question)}</p>
          <p><strong>Trả lời:</strong></p>
          <p>${escapeHtml(answer).replace(/\n/g, "<br>")}</p>
        </div>
      </div>
    `;

    openSearchPopup({ html }, question, "dictionary");
  }

  function formatDateKey(timestamp) {
    const date = new Date(typeof timestamp === "number" ? timestamp : Date.now());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatHistoryGroupLabel(timestamp) {
    const date = new Date(typeof timestamp === "number" ? timestamp : Date.now());
    if (Number.isNaN(date.getTime())) {
      return "Không rõ";
    }

    const todayKey = formatDateKey(Date.now());
    const targetKey = formatDateKey(date.getTime());

    if (targetKey === todayKey) {
      return "Hôm nay";
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (targetKey === formatDateKey(yesterday.getTime())) {
      return "Hôm qua";
    }

    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined
    });
  }

  function formatHistoryTime(timestamp) {
    const date = new Date(typeof timestamp === "number" ? timestamp : Date.now());
    if (Number.isNaN(date.getTime())) {
      return "--:--";
    }
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  }

  function stripHtml(input) {
    if (typeof input !== "string") {
      return "";
    }
    const div = document.createElement("div");
    div.innerHTML = input;
    return div.textContent || div.innerText || "";
  }

  function collapseWhitespace(text) {
    if (typeof text !== "string") {
      return "";
    }
    return text.replace(/\s+/g, " ").trim();
  }

  // ============================================
  // Utility Functions
  // ============================================
  
  async function refreshActiveTab() {
    if (!API?.tabs?.query) {
      activeTabId = null;
      activeTabUrl = null;
      return null;
    }

    return new Promise((resolve) => {
      try {
        API.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (API.runtime?.lastError) {
            console.warn("JaDict: Không đọc được tab hiện hành", API.runtime.lastError);
            activeTabId = null;
            activeTabUrl = null;
            resolve(null);
            return;
          }

          const tab = Array.isArray(tabs) && tabs.length > 0 ? tabs[0] : null;
          activeTabId = Number.isFinite(tab?.id) ? tab.id : null;
          activeTabUrl = typeof tab?.url === "string" ? tab.url : null;
          resolve(activeTabId);
        });
      } catch (error) {
        console.warn("JaDict: Không lấy được tab hiện hành", error);
        activeTabId = null;
        activeTabUrl = null;
        resolve(null);
      }
    });
  }

  function showNotification(message, type = "info") {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // TODO: Implement actual notification UI
    // For now, just log to console
    
    // Hide search hint temporarily and show message
    if (searchHint) {
      const defaultContent = searchHint.dataset.defaultContent || searchHint.innerHTML;
      searchHint.innerHTML = `
        <span class="hint-icon">${type === "warning" ? "⚠️" : type === "error" ? "❌" : "ℹ️"}</span>
        <span class="hint-text">${message}</span>
      `;
      
      setTimeout(() => {
        const fallback = searchHint.dataset.defaultContent || defaultContent;
        searchHint.innerHTML = fallback;
      }, 3000);
    }
  }

  // ============================================
  // Event Listeners
  // ============================================
  
  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  // Global on/off toggle
  if (globalToggle) {
    globalToggle.addEventListener("change", async (event) => {
      isExtensionEnabled = event.target.checked;
      console.log(`Extension ${isExtensionEnabled ? "enabled" : "disabled"}`);
      
      try {
        await saveExtensionSettings({ extensionEnabled: isExtensionEnabled });
      } catch (error) {
        console.error("Failed to save extension state:", error);
      }
    });
  }

  // Tab switching
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.dataset.tab;
      switchTab(tabName);
    });
  });

  // Search
  if (searchModeToggle) {
    searchModeToggle.addEventListener("click", () => {
      toggleSearchMode();
      if (searchMode === "translate" && searchInput) {
        searchInput.focus();
      }
    });
  }

  if (searchButton) {
    searchButton.addEventListener("click", handleSearch);
  }

  if (searchInput) {
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleSearch();
      }
    });
  }

  // Chat
  if (chatSendButton) {
    chatSendButton.addEventListener("click", () => handleChatSend());
  }

  if (chatInput) {
    // Auto-resize textarea
    chatInput.addEventListener("input", () => {
      chatInput.style.height = "40px"; // Reset to min-height
      const newHeight = Math.min(chatInput.scrollHeight, 120); // Max 120px
      chatInput.style.height = newHeight + "px";
    });
    
    // Send on Enter, new line on Shift+Enter
    chatInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        handleChatSend();
      }
    });
  }

  if (clearChatButton) {
    clearChatButton.addEventListener("click", clearChat);
  }

  // Clear buttons
  if (clearRecentButton) {
    clearRecentButton.addEventListener("click", () => {
      API.storage.local.set({ recentSearches: [] }, () => {
        displayRecentSearches();
        showNotification("Đã xóa lịch sử tìm kiếm", "info");
      });
    });
  }

  if (clearHistoryButton) {
    clearHistoryButton.addEventListener("click", async () => {
      if (!HistoryAPI || typeof HistoryAPI.clearAll !== "function") {
        showNotification("Lịch sử chưa khả dụng", "warning");
        return;
      }

      const confirmed = window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử?");
      if (!confirmed) {
        return;
      }

      try {
        await HistoryAPI.clearAll();
        historyState.entries = [];
        historyEntryMap.clear();
        renderHistoryList();
        showNotification("Đã xóa lịch sử", "info");
      } catch (error) {
        console.error("JaDict: Không xóa được lịch sử", error);
        showNotification("Không thể xóa lịch sử", "error");
      }
    });
  }

  // History filters
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const filter = button.dataset.filter || "all";
      if (historyState.filter === filter) {
        return;
      }

      historyState.filter = filter;
      loadHistoryEntries();
    });
  });

  if (exportHistoryButton) {
    exportHistoryButton.addEventListener("click", async () => {
      if (!HistoryAPI || typeof HistoryAPI.exportEntries !== "function") {
        showNotification("Lịch sử chưa khả dụng", "warning");
        return;
      }

      try {
        const entries = await HistoryAPI.exportEntries();
        if (!Array.isArray(entries) || entries.length === 0) {
          showNotification("Không có dữ liệu để xuất", "info");
          return;
        }

        const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        link.href = url;
        link.download = `jadict-history-${timestamp}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showNotification(`Đã xuất ${entries.length} mục lịch sử`, "info");
      } catch (error) {
        console.error("JaDict: Không xuất được lịch sử", error);
        showNotification("Không thể xuất lịch sử", "error");
      }
    });
  }

  if (historySearchInput) {
    historySearchInput.addEventListener("input", () => {
      const value = historySearchInput.value.trim();
      historyState.search = value;

      if (historySearchTimer) {
        clearTimeout(historySearchTimer);
      }

      historySearchTimer = setTimeout(() => {
        loadHistoryEntries();
      }, 250);
    });
  }

  if (historyList) {
    historyList.addEventListener("click", handleHistoryListClick);
  }

  // Footer buttons
  if (openSettingsButton) {
    openSettingsButton.addEventListener("click", () => {
      API.runtime.openOptionsPage().catch((error) => {
        console.error("Failed to open settings:", error);
      });
    });
  }

  if (openGuideButton) {
    openGuideButton.addEventListener("click", () => {
      const optionsUrl = API.runtime.getURL("options.html#guide");
      API.tabs.create({ url: optionsUrl }).catch((error) => {
        console.error("Failed to open guide:", error);
      });
    });
  }

  if (modelToggle) {
    modelToggle.addEventListener("click", (event) => {
      event.preventDefault();
      toggleModelMenu();
    });

    modelToggle.addEventListener("keydown", (event) => {
      const openKeys = [" ", "Enter", "ArrowDown", "ArrowUp"];
      if (openKeys.includes(event.key)) {
        event.preventDefault();
        openModelMenu();
      } else if (event.key === "Escape" && isModelMenuOpen) {
        event.preventDefault();
        closeModelMenu({ focusToggle: false });
      }
    });
  }

  // ============================================
  // Initialization
  // ============================================
  
  async function initialize() {
    console.log("JaDict v0.4 - Initializing action popup...");

    renderChatMessages();
    renderHistoryList();
    updateSearchModeUI();
    
    try {
      // Load settings
      const settings = await loadExtensionSettings();
      
      // Set theme
      const theme = settings.theme || "light";
      setTheme(theme);
      
      // Set extension enabled state
      isExtensionEnabled = settings.extensionEnabled !== false;
      if (globalToggle) {
        globalToggle.checked = isExtensionEnabled;
      }
      
      // Load recent searches
      displayRecentSearches();
      
      console.log("JaDict v0.4 - Initialization complete");
      console.log("Settings:", settings);
      
    } catch (error) {
      console.error("Failed to initialize:", error);
    }

    await initializeModelToggle();

    await initHistoryModule();
    await loadHistoryEntries({ silent: true });

    const tabId = await refreshActiveTab();
    if (Number.isFinite(tabId)) {
      await loadChatContextForTab(tabId);
    } else {
      renderChatMessages();
    }
  }

  // Run initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initialize().catch((error) => {
        console.error("JaDict: initialization failed", error);
      });
    }, { once: true });
  } else {
    initialize().catch((error) => {
      console.error("JaDict: initialization failed", error);
    });
  }

})();
