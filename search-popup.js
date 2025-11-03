(function () {
  "use strict";

  const API = typeof browser !== "undefined" ? browser : chrome;

  const content = document.getElementById("content");
  const settingsButton = document.getElementById("settings-button");
  const resizeHandle = document.getElementById("resize-handle");

  let currentMode = "dictionary";
  let currentQuery = "";
  let currentData = null;
  let currentHtml = "";

  let isPointerResizing = false;
  let pointerId = null;
  let startWidth = 0;
  let startHeight = 0;
  let startX = 0;
  let startY = 0;
  let frameExtraWidth = 0;
  let frameExtraHeight = 0;

  const MIN_WIDTH = 320;
  const MAX_WIDTH = 1280;
  const MIN_HEIGHT = 220;
  const MAX_HEIGHT = 900;

  const ALLOWED_TAGS = new Set([
    "DIV",
    "SPAN",
    "B",
    "I",
    "UL",
    "LI",
    "P",
    "STRONG",
    "EM"
  ]);

  const ALLOWED_ATTRS = {
    DIV: new Set(["class"]),
    SPAN: new Set(["class"]),
    UL: new Set(["class"]),
    LI: new Set(["class"])
  };

  const ALLOWED_CLASSES = new Set([
    "ai-section",
    "ai-heading",
    "ai-translation",
    "ai-label",
    "ai-entry",
    "ai-sense",
    "ai-note",
    "ai-pos",
    "collapsible-section",
    "collapsible-header",
    "collapsible-content",
    "collapsed",
    "expanded",
    "collapse-icon",
    "ai-bullets",
    "dict-section",
    "dict-heading",
    "dict-body",
    "sense-divider"
  ]);

  const SVG_NS = "http://www.w3.org/2000/svg";
  const COPY_ICON_DEFS = {
    copy: [
      {
        tag: "path",
        attrs: {
          d: "M9 3h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1V5a2 2 0 0 1 2-2Z",
          stroke: "currentColor",
          "stroke-width": "1.8",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      },
      {
        tag: "path",
        attrs: {
          d: "M9 3v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V3",
          stroke: "currentColor",
          "stroke-width": "1.8",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      }
    ],
    success: [
      {
        tag: "path",
        attrs: {
          d: "M4.5 12.5 9.5 17.5 19.5 7.5",
          stroke: "currentColor",
          "stroke-width": "2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      }
    ],
    error: [
      {
        tag: "path",
        attrs: {
          d: "M5 5l14 14M19 5L5 19",
          stroke: "currentColor",
          "stroke-width": "2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round"
        }
      }
    ]
  };
  const COPY_ICON_CACHE = new Map();

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function applyTheme(theme) {
    const value = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = value;
  }

  async function syncThemeFromStorage() {
    if (!API?.storage?.local) {
      return;
    }

    try {
      const stored = await API.storage.local.get("extensionSettings");
      const theme = stored?.extensionSettings?.theme === "dark" ? "dark" : "light";
      applyTheme(theme);
    } catch (error) {
      console.warn("JaDict: Không đọc được theme lưu", error);
    }
  }

  applyTheme("light");
  syncThemeFromStorage();

  if (API?.storage?.onChanged) {
    API.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local" || !changes.extensionSettings) {
        return;
      }
      const themeValue = changes.extensionSettings.newValue?.theme;
      applyTheme(themeValue);
    });
  }

  if (settingsButton) {
    settingsButton.addEventListener("click", () => {
      if (!API?.runtime?.openOptionsPage) {
        return;
      }
      API.runtime.openOptionsPage().catch((error) => {
        console.error("JaDict: Không mở được trang cài đặt", error);
      });
    });
  }

  function renderSanitizedHtml(target, html) {
    if (!target) {
      return;
    }

    const fragment = sanitizeHtmlToFragment(html);
    target.replaceChildren(fragment);
  }

  function sanitizeHtmlToFragment(html) {
    const fragment = document.createDocumentFragment();

    if (typeof html !== "string") {
      return fragment;
    }

    const parser = new DOMParser();
    const parsed = parser.parseFromString(html, "text/html");

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
      return document.createTextNode(node.textContent || "");
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toUpperCase();
      if (!ALLOWED_TAGS.has(tagName)) {
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

        if (attrName === "class") {
          const filteredClasses = value
            .split(/\s+/)
            .filter((cls) => ALLOWED_CLASSES.has(cls));
          if (filteredClasses.length > 0) {
            cleanElement.setAttribute("class", filteredClasses.join(" "));
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

  function createSvgFromDef(defKey) {
    const definition = COPY_ICON_DEFS[defKey] || COPY_ICON_DEFS.copy;
    if (COPY_ICON_CACHE.has(defKey)) {
      return COPY_ICON_CACHE.get(defKey).cloneNode(true);
    }

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("aria-hidden", "true");

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

  function setCopyIcon(button, state) {
    const icon = createSvgFromDef(state);
    button.classList.remove("copied", "error");
    button.replaceChildren(icon);

    if (state === "success") {
      button.classList.add("copied");
    } else if (state === "error") {
      button.classList.add("error");
    }
  }

  function addCopyButtons() {
    const sections = content.querySelectorAll(".ai-section, .dict-section");

    sections.forEach((section) => {
      if (!section.classList.contains("ai-section")) {
        return;
      }

      const translationBlock = section.querySelector(".ai-translation");
      if (!translationBlock) {
        return;
      }

      if (section.querySelector(".copy-button")) {
        return;
      }

      const heading = section.querySelector(".ai-heading");
      if (!heading) {
        return;
      }

      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "copy-button";
      copyBtn.title = "Copy dịch";
      setCopyIcon(copyBtn, "copy");
      copyBtn.style.touchAction = "manipulation";

      copyBtn.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          const textToCopy = getTranslationText(section);

          if (!textToCopy) {
            setCopyIcon(copyBtn, "error");
            setTimeout(() => setCopyIcon(copyBtn, "copy"), 1500);
            return false;
          }

          copyToClipboard(textToCopy)
            .then(() => {
              setCopyIcon(copyBtn, "success");
              setTimeout(() => setCopyIcon(copyBtn, "copy"), 1500);
            })
            .catch(() => {
              setCopyIcon(copyBtn, "error");
              setTimeout(() => setCopyIcon(copyBtn, "copy"), 1500);
            });

          return false;
        },
        { passive: false }
      );

      heading.appendChild(copyBtn);
    });
  }

  function addCollapsibleHandlers() {
    const collapsibleHeaders = content.querySelectorAll(".collapsible-header");

    collapsibleHeaders.forEach((header) => {
      const newHeader = header.cloneNode(true);
      header.parentNode.replaceChild(newHeader, header);

      newHeader.addEventListener("click", (e) => {
        e.stopPropagation();
        const sectionContent = newHeader.nextElementSibling;

        if (!sectionContent || !sectionContent.classList.contains("collapsible-content")) {
          return;
        }

        const isExpanded = sectionContent.classList.contains("expanded");

        if (isExpanded) {
          sectionContent.classList.remove("expanded");
          sectionContent.classList.add("collapsed");
          newHeader.classList.remove("expanded");
        } else {
          sectionContent.classList.remove("collapsed");
          sectionContent.classList.add("expanded");
          newHeader.classList.add("expanded");
        }
      });
    });
  }

  function getTranslationText(section) {
    const parts = [];
    const translation = section.querySelector(".ai-translation");
    if (translation) {
      const text = translation.textContent.replace(/^Bản dịch:\s*/, "").trim();
      if (text) {
        parts.push(text);
      }
    }

    return parts.join("\n").trim();
  }

  function copyToClipboard(text) {
    return new Promise((resolve, reject) => {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(text).then(resolve).catch(() => {
          fallbackCopy(text) ? resolve() : reject(new Error("Copy failed"));
        });
      } else {
        fallbackCopy(text) ? resolve() : reject(new Error("Copy failed"));
      }
    });
  }

  function fallbackCopy(text) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      textArea.style.opacity = "0";
      textArea.style.pointerEvents = "none";
      textArea.style.zIndex = "-9999";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      return successful;
    } catch (error) {
      console.error("Fallback copy failed:", error);
      return false;
    }
  }

  function startPointerResize(event) {
    if (!resizeHandle) {
      return;
    }

    if (typeof event.button === "number" && event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    isPointerResizing = true;
    pointerId = event.pointerId;
    startX = event.screenX;
    startY = event.screenY;
    startWidth = Number.isFinite(window.innerWidth) ? window.innerWidth : 0;
    startHeight = Number.isFinite(window.innerHeight) ? window.innerHeight : 0;
    frameExtraWidth = Number.isFinite(window.outerWidth - window.innerWidth)
      ? window.outerWidth - window.innerWidth
      : 0;
    frameExtraHeight = Number.isFinite(window.outerHeight - window.innerHeight)
      ? window.outerHeight - window.innerHeight
      : 0;

    try {
      if (typeof resizeHandle.setPointerCapture === "function") {
        resizeHandle.setPointerCapture(pointerId);
      }
    } catch (error) {
      // Ignore pointer capture failures
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", stopPointerResize);
    window.addEventListener("pointercancel", stopPointerResize);
  }

  function handlePointerMove(event) {
    if (!isPointerResizing || event.pointerId !== pointerId) {
      return;
    }

    event.preventDefault();

    const deltaX = event.screenX - startX;
    const deltaY = event.screenY - startY;

    const targetWidth = clamp(startWidth + deltaX, MIN_WIDTH, MAX_WIDTH);
    const targetHeight = clamp(startHeight + deltaY, MIN_HEIGHT, MAX_HEIGHT);

    const outerWidth = Math.round(targetWidth + frameExtraWidth);
    const outerHeight = Math.round(targetHeight + frameExtraHeight);

    try {
      if (typeof window.resizeTo === "function") {
        window.resizeTo(outerWidth, outerHeight);
      }
    } catch (error) {
      console.warn("JaDict: Không thể resize cửa sổ:", error);
      stopPointerResize(event);
    }
  }

  function stopPointerResize(event) {
    if (!isPointerResizing) {
      return;
    }

    isPointerResizing = false;
    const capturedPointer = pointerId;
    pointerId = null;

    try {
      if (
        resizeHandle &&
        typeof resizeHandle.releasePointerCapture === "function" &&
        capturedPointer !== null
      ) {
        resizeHandle.releasePointerCapture(capturedPointer);
      }
    } catch (error) {
      // Ignore release errors
    }

    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopPointerResize);
    window.removeEventListener("pointercancel", stopPointerResize);
  }

  function renderDictionary() {
    if (!currentHtml && currentData) {
      currentHtml = buildFallbackHtml(currentData);
    }

    if (!currentHtml) {
      showError("Không có dữ liệu từ điển.");
      return;
    }

    renderSanitizedHtml(content, currentHtml);
    addCopyButtons();
    addCollapsibleHandlers();
  }

  function buildFallbackHtml(data) {
    if (!data || !Array.isArray(data.definitions)) {
      return "";
    }

    const items = data.definitions
      .filter((item) => item && typeof item.definition === "string" && item.definition.trim().length > 0)
      .map((item, index) => {
        const parts = [];
        parts.push('<div class="ai-entry">');
        if (item.partOfSpeech) {
          parts.push(`<span class="ai-pos">${escapeHtml(item.partOfSpeech)}</span>`);
        }
        parts.push(`<div class="ai-sense"><span class="ai-label">Nghĩa ${index + 1}:</span> ${escapeHtml(item.definition)}</div>`);
        if (item.example) {
          parts.push(`<div class="ai-note">${escapeHtml(item.example)}</div>`);
        }
        parts.push('</div>');
        return parts.join('');
      });

    if (items.length === 0) {
      return "";
    }

    const heading = escapeHtml(currentQuery || data.word || "Kết quả");
    return `<div class="ai-section"><div class="ai-heading"><b>${heading}</b></div>${items.join("")}</div>`;
  }

  function renderChatbot() {
    if (!content) {
      return;
    }

    const container = document.createElement("div");
    container.className = "search-chat-container";

    const messagesWrapper = document.createElement("div");
    messagesWrapper.className = "search-chat-messages";
    messagesWrapper.id = "chat-msgs";

    const footer = document.createElement("div");
    footer.className = "search-chat-footer";

    const footerRow = document.createElement("div");
    footerRow.className = "search-chat-row";

    const chatInput = document.createElement("textarea");
    chatInput.className = "search-chat-input";
    chatInput.id = "chat-input";
    chatInput.placeholder = "Nhập tin nhắn...";
    chatInput.rows = 1;

    const chatSend = document.createElement("button");
    chatSend.className = "search-chat-btn";
    chatSend.id = "chat-send";
    chatSend.textContent = "Gửi";

    footerRow.appendChild(chatInput);
    footerRow.appendChild(chatSend);
    footer.appendChild(footerRow);

    container.appendChild(messagesWrapper);
    container.appendChild(footer);

    content.replaceChildren(container);

    const chatMsgs = messagesWrapper;

    if (currentQuery) {
      addMsg(chatMsgs, "user", currentQuery);
    }
    if (currentData && currentData.response) {
      addMsg(chatMsgs, "bot", currentData.response);
    }

    const sendMessage = async () => {
      const msg = chatInput.value.trim();
      if (!msg) {
        return;
      }

      addMsg(chatMsgs, "user", msg);
      chatInput.value = "";
      chatSend.disabled = true;

      try {
        const response = await API.runtime.sendMessage({
          type: "CHATBOT_MESSAGE",
          message: msg,
          context: []
        });

        if (response.success) {
          addMsg(chatMsgs, "bot", response.data.response);
        } else {
          addMsg(chatMsgs, "bot", "Xin lỗi, đã xảy ra lỗi: " + response.error);
        }
      } catch (error) {
        addMsg(chatMsgs, "bot", "Xin lỗi, không thể kết nối.");
      } finally {
        chatSend.disabled = false;
      }
    };

    chatSend.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    });
  }

  function addMsg(container, role, text) {
    const div = document.createElement("div");
    div.className = `search-chat-msg ${role}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function showError(message) {
    if (!content) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.style.textAlign = "center";
    wrapper.style.padding = "40px 20px";
    wrapper.style.color = "var(--secondary-text)";

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    wrapper.appendChild(paragraph);
    content.replaceChildren(wrapper);
  }

  function escapeHtml(text) {
    if (typeof text !== "string") {
      return "";
    }
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  async function initialize() {
    try {
      const result = await new Promise((resolve) => {
        API.storage.local.get(["searchPopupData"], resolve);
      });

      const popupData = result.searchPopupData;

      if (!popupData) {
        showError("Không tìm thấy dữ liệu. Vui lòng thử lại.");
        return;
      }

      currentMode = popupData.mode || "dictionary";
      currentQuery = popupData.query || "";
      currentData = popupData.data || null;
      currentHtml = popupData.html || popupData.data?.html || "";

      if (currentMode === "dictionary") {
        renderDictionary();
      } else if (currentMode === "chatbot") {
        renderChatbot();
      } else {
        showError("Chế độ không hợp lệ.");
      }

      API.storage.local.remove(["searchPopupData"]);
    } catch (error) {
      console.error("Initialization error:", error);
      showError("Không thể tải dữ liệu: " + error.message);
    }
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      window.close();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }

  if (resizeHandle) {
    resizeHandle.addEventListener("pointerdown", startPointerResize);
  }
})();
