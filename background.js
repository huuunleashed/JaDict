try {
  importScripts('settings.js', 'history.js');
} catch (error) {
  console.error('JaDict: Không thể tải settings hoặc history', error);
}

const SETTINGS = (typeof self !== 'undefined' && self.JA_SETTINGS) ? self.JA_SETTINGS : null;
const HISTORY = (typeof self !== 'undefined' && self.JA_HISTORY) ? self.JA_HISTORY : null;
let extensionSettingsCache = SETTINGS ? SETTINGS.cloneDefaultSettings() : {
  extensionEnabled: true,
  theme: 'light',
  blockedSites: [],
  synonymLimit: 5,
  antonymLimit: 5
};

const CHAT_CONTEXT_KEY = 'chatContexts';
let chatContextsCache = {};
let chatContextsLoaded = false;

async function loadChatContexts() {
  if (chatContextsLoaded) {
    return chatContextsCache;
  }

  if (!API?.storage?.local) {
    chatContextsCache = {};
    chatContextsLoaded = true;
    return chatContextsCache;
  }

  try {
    const stored = await API.storage.local.get([CHAT_CONTEXT_KEY]);
    chatContextsCache = stored[CHAT_CONTEXT_KEY] && typeof stored[CHAT_CONTEXT_KEY] === 'object'
      ? stored[CHAT_CONTEXT_KEY]
      : {};
  } catch (error) {
    console.error('JaDict: Không đọc được lịch sử trò chuyện', error);
    chatContextsCache = {};
  }

  chatContextsLoaded = true;
  return chatContextsCache;
}

async function persistChatContexts() {
  if (!API?.storage?.local) {
    return;
  }

  try {
    await API.storage.local.set({ [CHAT_CONTEXT_KEY]: chatContextsCache });
  } catch (error) {
    console.error('JaDict: Không lưu được lịch sử trò chuyện', error);
  }
}

async function getChatContext(tabId) {
  await loadChatContexts();
  const key = String(tabId);
  const context = chatContextsCache[key];
  if (!Array.isArray(context)) {
    return [];
  }
  return context;
}

async function setChatContext(tabId, messages) {
  await loadChatContexts();
  const key = String(tabId);
  chatContextsCache[key] = messages;
  await persistChatContexts();
}

async function clearChatContext(tabId) {
  await loadChatContexts();
  const key = String(tabId);
  delete chatContextsCache[key];
  await persistChatContexts();
}

function trimChatMessages(messages, maxLength = 20) {
  if (!Array.isArray(messages)) {
    return [];
  }
  if (messages.length <= maxLength) {
    return messages;
  }
  return messages.slice(messages.length - maxLength);
}

function buildChatSystemPrompts(options = {}) {
  const prompts = [
    {
      role: 'user',
      parts: [{
        text: 'Bạn là trợ lý ngôn ngữ Việt - Anh của JaDict. Luôn giao tiếp bằng tiếng Việt thân thiện, dễ hiểu. Khi người dùng cần dịch, hãy cung cấp bản dịch chính xác và có thể kèm ghi chú ngắn gọn bằng tiếng Việt. Với các câu hỏi chung, hãy giải thích rõ ràng bằng tiếng Việt và minh họa bằng ví dụ khi phù hợp.'
      }]
    },
    {
      role: 'model',
      parts: [{
        text: 'Xin chào! Tôi là trợ lý ngôn ngữ của JaDict. Tôi sẽ nói chuyện bằng tiếng Việt và giúp bạn dịch thuật, giải thích từ vựng, cũng như trả lời các câu hỏi về ngôn ngữ. Bạn muốn tôi hỗ trợ điều gì?'
      }]
    }
  ];

  if (options.intent === 'translation' && typeof options.translationGuidance === 'string' && options.translationGuidance.trim().length > 0) {
    prompts.push({
      role: 'user',
      parts: [{ text: options.translationGuidance }]
    });
    prompts.push({
      role: 'model',
      parts: [{ text: 'Tôi sẽ dịch chính xác và trình bày bản dịch bằng tiếng Việt, đồng thời nêu rõ ngôn ngữ đích nếu cần.' }]
    });
  }

  return prompts;
}

function buildGeminiContentsFromStoredMessages(storedMessages, userMessage, options = {}) {
  const contents = buildChatSystemPrompts(options);

  if (Array.isArray(storedMessages)) {
    storedMessages.forEach((msg) => {
      if (!msg || typeof msg.content !== 'string' || msg.content.trim().length === 0) {
        return;
      }
      const role = msg.role === 'assistant' ? 'model' : 'user';
      contents.push({
        role,
        parts: [{ text: msg.content }]
      });
    });
  }

  if (typeof userMessage === 'string' && userMessage.trim().length > 0) {
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });
  }

  return contents;
}

function buildTranslationGuidance(rawText) {
  const detectedLang = detectLanguage(rawText);
  const sourceLang = detectedLang === 'vi' ? 'vi' : 'en';
  const targetLang = sourceLang === 'vi' ? 'en' : 'vi';
  const sourceLabel = sourceLang === 'vi' ? 'tiếng Việt' : 'tiếng Anh';
  const targetLabel = targetLang === 'vi' ? 'tiếng Việt' : 'tiếng Anh';

  return {
    guidance: `Người dùng cần bạn dịch đoạn văn sắp tới từ ${sourceLabel} sang ${targetLabel}. Hãy đưa ra bản dịch chính xác, giữ nguyên ý và giọng điệu. Nếu cần, bổ sung ghi chú ngắn gọn bằng tiếng Việt.` ,
    sourceLang,
    targetLang
  };
}

async function requestGeminiChat({ apiKey, modelId, contents, generationConfig }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      generationConfig: generationConfig || CHAT_GENERATION_CONFIG
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part) => part?.text || '').join('').trim();

  if (!text) {
    throw new Error('Gemini không trả về nội dung trò chuyện.');
  }

  return text;
}

async function streamGeminiChat({ apiKey, modelId, contents, generationConfig, onChunk }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents,
      generationConfig: generationConfig || CHAT_GENERATION_CONFIG
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const reader = response.body && typeof response.body.getReader === 'function'
    ? response.body.getReader()
    : null;

  if (!reader) {
    // Streaming not supported, fallback to standard request
    return requestGeminiChat({ apiKey, modelId, contents, generationConfig });
  }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullText = '';
  let lastErrorMessage = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    let newlineIndex;

    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      const payloadText = trimmed.startsWith('data:') ? trimmed.slice(5).trim() : trimmed;
      if (!payloadText) {
        continue;
      }

      let payload;
      try {
        payload = JSON.parse(payloadText);
      } catch (error) {
        continue;
      }

      const payloadError = payload?.error;
      if (payloadError) {
        lastErrorMessage = payloadError?.message || 'Đã xảy ra lỗi khi gọi Gemini.';
        continue;
      }

      const parts = payload?.candidates?.[0]?.content?.parts;
      if (!Array.isArray(parts)) {
        continue;
      }

      const delta = parts.map((part) => (typeof part?.text === 'string' ? part.text : '')).join('');
      if (!delta) {
        continue;
      }

      fullText += delta;
      if (typeof onChunk === 'function') {
        onChunk(fullText);
      }
    }
  }

  if (buffer.trim().length > 0) {
    try {
      const payloadText = buffer.startsWith('data:') ? buffer.slice(5).trim() : buffer.trim();
      const payload = JSON.parse(payloadText);
      const payloadError = payload?.error;
      if (payloadError) {
        lastErrorMessage = payloadError?.message || 'Đã xảy ra lỗi khi gọi Gemini.';
      }
      const parts = payload?.candidates?.[0]?.content?.parts;
      if (Array.isArray(parts)) {
        const delta = parts.map((part) => (typeof part?.text === 'string' ? part.text : '')).join('');
        if (delta) {
          fullText += delta;
          if (typeof onChunk === 'function') {
            onChunk(fullText);
          }
        }
      }
    } catch (error) {
      // Ignore trailing parse errors
    }
  }

  if (!fullText) {
    if (lastErrorMessage) {
      throw new Error(lastErrorMessage);
    }

    const fallbackText = await requestGeminiChat({ apiKey, modelId, contents, generationConfig });
    if (typeof onChunk === 'function' && fallbackText) {
      onChunk(fallbackText);
    }
    return fallbackText;
  }

  return fullText;
}

if (HISTORY && typeof HISTORY.init === 'function') {
  HISTORY.init().catch((error) => {
    console.error('JaDict: Không khởi tạo được lịch sử', error);
  });
}

let settingsReady = SETTINGS
  ? SETTINGS.loadExtensionSettings()
      .then((loaded) => {
        extensionSettingsCache = loaded;
      })
      .catch((error) => {
        console.error('JaDict: Không tải được cài đặt extension ban đầu', error);
      })
  : Promise.resolve();

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

if (API?.storage?.onChanged && SETTINGS) {
  API.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') {
      return;
    }
    if (changes.extensionSettings) {
      extensionSettingsCache = SETTINGS.normalizeSettings(changes.extensionSettings.newValue);
    }
  });
}

// --- 1. Main Message Listener ---
// (API Key is no longer stored here)

const GEMINI_MODEL_OPTIONS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'];
const GEMINI_MODEL_SET = new Set(GEMINI_MODEL_OPTIONS);
const GEMINI_DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const CHAT_GENERATION_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 1024
};

// Listens for messages from popup.js and action.js
API.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('JaDict: Received message', request);
  
  // Route based on message type
  if (request.type === "LOOKUP") {
    // Legacy text selection lookup
    handleLookup(request.text, sender)
      .then(result => {
        console.log('JaDict: Lookup success');
        sendResponse({ status: "success", data: result });
      })
      .catch(error => {
        console.error("JaDict error:", error);
        sendResponse({ status: "error", data: error.message });
      });
    return true;
  }
  
  if (request.type === "DICTIONARY_LOOKUP") {
    // New dictionary lookup from action popup
    handleDictionaryLookup(request.query, request.queryType, sender)
      .then(result => {
        console.log('JaDict: Dictionary lookup success');
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        console.error("JaDict Dictionary error:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.type === "TRANSLATE_TEXT") {
    handleTranslateText(request.text, sender)
      .then((result) => {
        sendResponse({ success: true, data: result });
      })
      .catch((error) => {
        console.error('JaDict: Translation error', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  
  if (request.type === "CHATBOT_MESSAGE") {
    // Chatbot conversation
    handleChatMessage(request.message, request.context, sender)
      .then(result => {
        console.log('JaDict: Chatbot response success');
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        console.error("JaDict Chatbot error:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.type === "GET_CHAT_CONTEXT") {
    const tabId = request.tabId;
    if (typeof tabId === 'undefined' || tabId === null) {
      sendResponse({ success: false, error: 'Thiếu tabId' });
      return undefined;
    }
    getChatContext(tabId)
      .then((messages) => {
        sendResponse({ success: true, messages });
      })
      .catch((error) => {
        console.error('JaDict: Không đọc được lịch sử chat', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }

  if (request.type === "CLEAR_CHAT_CONTEXT") {
    const tabId = request.tabId;
    if (typeof tabId === 'undefined' || tabId === null) {
      sendResponse({ success: false, error: 'Thiếu tabId' });
      return undefined;
    }
    clearChatContext(tabId)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('JaDict: Không xóa được lịch sử chat', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  
  return undefined;
});

// Provide a toolbar entry point for the options page
const ACTION_API = API?.action || API?.browserAction;

if (ACTION_API && ACTION_API.onClicked) {
  ACTION_API.onClicked.addListener(() => {
    API.runtime.openOptionsPage().catch(err => {
      console.error("Không mở được trang cài đặt:", err);
    });
  });
}

if (API?.runtime?.onConnect) {
  API.runtime.onConnect.addListener((port) => {
    if (!port || port.name !== 'chatbot') {
      return;
    }

    port.onMessage.addListener((message) => {
      handleChatPortMessage(port, message).catch((error) => {
        console.error('JaDict: Lỗi xử lý chat streaming', error);
        try {
          port.postMessage({
            type: 'error',
            streamId: message?.streamId,
            error: error?.message || 'Đã xảy ra lỗi không xác định.'
          });
        } catch (postError) {
          console.error('JaDict: Không gửi được thông báo lỗi', postError);
        }
      });
    });
  });
}


// --- 2. Smart Detection and Routing Logic ---

async function handleLookup(text, sender) {
  if (settingsReady) {
    try {
      await settingsReady;
    } catch (error) {
      // Already logged
    }
  }

  if (!extensionSettingsCache.extensionEnabled) {
    return 'JaDict đang tắt. Mở lại trong action popup.';
  }

  if (SETTINGS && sender?.tab?.url) {
    try {
      const url = new URL(sender.tab.url);
      if (SETTINGS.isSiteBlocked(extensionSettingsCache, url.hostname)) {
        return 'JaDict đã bị tắt trên trang này.';
      }
    } catch (error) {
      // Ignore malformed URL
    }
  }

  const trimmedText = text.trim();

  if (!trimmedText) {
    return "Lỗi: Bạn chưa chọn nội dung nào.";
  }

  const detectedLang = detectLanguage(trimmedText);
  const wordCount = trimmedText.split(/\s+/).length;

  // --- "Intelligent Algorithm" ---
  // If it's more than 5 words OR contains sentence-ending punctuation,
  // we'll treat it as a sentence and use the API.
  if (wordCount > 5 || /[.?!]/.test(trimmedText)) {
    // This is a sentence, use Gemini
    return await translateWithGemini(trimmedText, false, detectedLang);
  } else {
    // This is a word or phrase, use local dictionary
    try {
      const dictionaryResult = await lookupLocal(trimmedText, detectedLang);
      if (dictionaryResult !== undefined) {
        return dictionaryResult;
      }
    } catch (dictionaryError) {
      console.error('Tra cứu từ điển cục bộ thất bại:', dictionaryError);
    }

    return await translateWithGemini(trimmedText, true, detectedLang);
  }
}


// --- 3. Tra cứu từ điển cục bộ ---

let cachedDictionary = null;

async function loadDictionary() {
  if (cachedDictionary) {
    return cachedDictionary;
  }

  const dictionaryUrl = API.runtime.getURL('dictionary.json');
  const response = await fetch(dictionaryUrl);
  if (!response.ok) {
    throw new Error('Không tải được tệp dictionary.json');
  }

  cachedDictionary = await response.json();
  return cachedDictionary;
}

function buildDictionarySection({ heading, body }) {
  return `<div class="dict-section"><div class="dict-heading">${heading}</div><div class="dict-body">${body}</div></div>`;
}

async function lookupLocal(text, detectedLang) {
  const normalizedText = text.toLowerCase();

  try {
    const dictionary = await loadDictionary();
    const sections = [];
    let hasDictionaryEntry = false;

    if (detectedLang === 'vi') {
      const viEn = dictionary?.vi_en?.[normalizedText];
      if (viEn) {
        const heading = `${escapeHtml(text)} - VI sang EN (Từ điển)`;
        sections.push(buildDictionarySection({
          heading,
          body: escapeHtml(viEn)
        }));
        hasDictionaryEntry = true;
      }
    } else {
      const enEn = dictionary?.en_en?.[normalizedText];
      if (enEn) {
        const heading = `${escapeHtml(text)} - EN sang EN (Từ điển)`;
        sections.push(buildDictionarySection({
          heading,
          body: escapeHtml(enEn)
        }));
        hasDictionaryEntry = true;
      }

      const enVi = dictionary?.en_vi?.[normalizedText];
      if (enVi) {
        const heading = `${escapeHtml(text)} - EN sang VI (Từ điển)`;
        sections.push(buildDictionarySection({
          heading,
          body: escapeHtml(enVi)
        }));
        hasDictionaryEntry = true;
      }
    }

    const aiSection = await translateWithGemini(text, true, detectedLang);
    if (aiSection) {
      sections.push(aiSection);
    }

    if (sections.length === 0) {
      return undefined;
    }

    if (!hasDictionaryEntry && sections.length === 1) {
      return sections[0];
    }

    return sections.join('');

  } catch (error) {
    throw error;
  }
}


// --- 4. Gemini API Translation (UPDATED) ---

async function translateWithGemini(text, isWord = false, detectedLangOverride, options = {}) {
  const detectedLang = detectedLangOverride || detectLanguage(text);
  const includeStructured = options.includeStructured === true;
  let settings;

  try {
    settings = await getGeminiSettings();
  } catch (error) {
    console.error(error);
    const errorMessage = `Lỗi: ${error.message}`;
    return includeStructured ? { html: errorMessage, structured: null } : errorMessage;
  }

  const { apiKey, modelId } = settings;
  const synonymLimit = Number.isInteger(extensionSettingsCache.synonymLimit)
    ? extensionSettingsCache.synonymLimit
    : 5;
  const antonymLimit = Number.isInteger(extensionSettingsCache.antonymLimit)
    ? extensionSettingsCache.antonymLimit
    : 5;
  const limits = { synonymLimit, antonymLimit };

  try {
    if (isWord) {
      const result = await generateWordInsights({ apiKey, modelId, text, detectedLang, limits });
      return includeStructured ? result : result.html;
    }

    const result = await generateSentenceInsights({ apiKey, modelId, text, detectedLang, limits });
    return includeStructured ? result : result.html;

  } catch (structuredError) {
    console.error("Gọi Gemini dạng cấu trúc thất bại:", structuredError);

    try {
      const fallbackHtml = await generatePlainTranslation({ apiKey, modelId, text, detectedLang, isWord });
      if (includeStructured) {
        return { html: fallbackHtml, structured: null };
      }
      return fallbackHtml;
    } catch (fallbackError) {
      console.error("Gọi Gemini dự phòng thất bại:", fallbackError);
      const errorMessage = `Lỗi kết nối Gemini: ${fallbackError.message}`;
      if (includeStructured) {
        return { html: errorMessage, structured: null };
      }
      return errorMessage;
    }
  }
}

async function getGeminiSettings() {
  let storage;
  try {
    storage = await API.storage.local.get(['geminiApiKey', 'geminiModel']);
  } catch (error) {
    throw new Error('Không đọc được dữ liệu trong trình duyệt.');
  }

  const apiKey = storage.geminiApiKey;
  if (!apiKey) {
    throw new Error('Thiếu mã API Gemini. Hãy mở trang Cài đặt của JaDict để nhập.');
  }

  const storedModel = storage.geminiModel;
  const modelId = storedModel && GEMINI_MODEL_SET.has(storedModel)
    ? storedModel
    : GEMINI_DEFAULT_MODEL;

  return { apiKey, modelId };
}

async function generateWordInsights({ apiKey, modelId, text, detectedLang, limits }) {
  const fromLang = detectedLang === 'vi' ? 'Vietnamese' : 'English';
  const toLang = detectedLang === 'vi' ? 'English' : 'Vietnamese';

  const schema = {
    type: 'object',
    required: ['translation', 'entries'],
    properties: {
      translation: { type: 'string' },
      entries: {
        type: 'array',
        items: {
          type: 'object',
          required: ['partOfSpeech', 'senses'],
          properties: {
            partOfSpeech: { type: 'string' },
            senses: {
              type: 'array',
              items: {
                type: 'object',
                required: ['definition', 'synonyms', 'antonyms'],
                properties: {
                  definition: { type: 'string' },
                  explanation: { type: 'string' },
                  synonyms: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  antonyms: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  usageExamples: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  usageNotes: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  const systemPrompt = `You are a bilingual lexicographer. Analyse the following ${fromLang} term and produce a concise, structured entry for learners. 

SCHEMA REQUIREMENTS (MANDATORY):
- Each "senses" object MUST contain these fields: "definition", "synonyms", "antonyms"
- "synonyms" and "antonyms" are REQUIRED arrays (can be empty [] but must exist)
- Definitions ("definition") and usage notes ("usageNotes") must be in Vietnamese
- Explanations, examples, synonyms, and antonyms must be in ${fromLang}

HOW TO FIND ANTONYMS:
1. For adjectives: opposite quality (hot↔cold, good↔bad, light↔dark, strong↔weak)
2. For verbs: opposite action (start↔stop, give↔take, rise↔fall, love↔hate)
3. For nouns: opposite concept (day↔night, friend↔enemy, success↔failure)
4. If truly no antonym exists, use empty array [] (rare cases only)

EXAMPLES:
- "happy" → synonyms: ["joyful", "glad"], antonyms: ["sad", "unhappy"]
- "caller" → synonyms: ["visitor", "guest"], antonyms: ["host", "receiver"]

Provide best translation in ${toLang}.`;

  const { text: rawJson } = await makeGeminiRequest({
    apiKey,
    modelId,
    systemPrompt,
    userText: text,
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  });

  const parsed = parseJsonSafe(rawJson);
  console.log('JaDict: Gemini raw response for word:', text, JSON.stringify(parsed, null, 2));
  const html = formatWordInsights({
    term: text,
    modelId,
    fromLang,
    toLang,
    data: parsed,
    limits
  });

  return {
    html,
    structured: {
      term: text,
      modelId,
      fromLang,
      toLang,
      limits,
      ...parsed
    }
  };
}

async function generateSentenceInsights({ apiKey, modelId, text, detectedLang, limits }) {
  const fromLang = detectedLang === 'vi' ? 'Vietnamese' : 'English';
  const toLang = detectedLang === 'vi' ? 'English' : 'Vietnamese';

  const schema = {
    type: 'object',
    required: ['translation', 'summary', 'keyPoints'],
    properties: {
      translation: { type: 'string' },
      summary: { type: 'string' },
      keyPoints: {
        type: 'array',
        items: { type: 'string' }
      }
    }
  };

  const systemPrompt = `You are a careful translator and explainer. Translate from ${fromLang} to ${toLang}, then summarise the main idea in simple ${toLang} and capture key bullet points for learners. Follow the JSON schema exactly.`;

  const { text: rawJson } = await makeGeminiRequest({
    apiKey,
    modelId,
    systemPrompt,
    userText: text,
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  });

  const parsed = parseJsonSafe(rawJson);
  const html = formatSentenceInsights({
    modelId,
    fromLang,
    toLang,
    data: parsed
  });

  return {
    html,
    structured: {
      modelId,
      fromLang,
      toLang,
      ...parsed
    }
  };
}

async function generatePlainTranslation({ apiKey, modelId, text, detectedLang, isWord }) {
  const fromLang = detectedLang === 'vi' ? 'Vietnamese' : 'English';
  const toLang = detectedLang === 'vi' ? 'English' : 'Vietnamese';

  const systemPrompt = `You are a translator. Translate the user input from ${fromLang} to ${toLang}. Provide only the translation text without additional commentary.`;

  const { text: translation } = await makeGeminiRequest({
    apiKey,
    modelId,
    systemPrompt,
    userText: text,
    generationConfig: {
      temperature: 0.2,
      topP: 0.8
    }
  });

  return formatFallbackTranslation({
    modelId,
    fromLang,
    toLang,
    translation,
    isWord
  });
}

async function makeGeminiRequest({ apiKey, modelId, systemPrompt, userText, generationConfig }) {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{
      parts: [{ text: userText }]
    }]
  };

  if (systemPrompt) {
    payload.systemInstruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  if (generationConfig) {
    payload.generationConfig = generationConfig;
  }

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
  const errorMessage = result?.error?.message || response.statusText;
  throw new Error(`Lỗi API Gemini: ${errorMessage}`);
  }

  const textResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error('Gemini không trả về nội dung');
  }

  return { text: textResponse, raw: result };
}

function parseJsonSafe(rawText) {
  if (!rawText) {
    throw new Error('Gemini trả về dữ liệu trống');
  }

  const cleaned = rawText
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  return JSON.parse(cleaned);
}

function formatWordInsights({ term, modelId, fromLang, toLang, data, limits }) {
  const synonymLimit = Number.isInteger(limits?.synonymLimit) ? Math.max(0, limits.synonymLimit) : 5;
  const antonymLimit = Number.isInteger(limits?.antonymLimit) ? Math.max(0, limits.antonymLimit) : 5;
  console.log('JaDict: formatWordInsights limits:', { synonymLimit, antonymLimit });
  if (!data || typeof data !== 'object') {
    throw new Error('Dữ liệu từ vựng từ Gemini không hợp lệ');
  }

  const sections = [];
  sections.push('<div class="ai-section">');
  sections.push(`<div class="ai-heading"><b>${escapeHtml(term)}</b> - ${escapeHtml(fromLang)} sang ${escapeHtml(toLang)} (${escapeHtml(modelId)})</div>`);

  if (data.translation) {
    sections.push(`<div class="ai-translation"><span class="ai-label">Bản dịch:</span> ${escapeHtml(data.translation)}</div>`);
  }

  if (Array.isArray(data.entries)) {
    data.entries.forEach((entry) => {
      if (!entry || typeof entry !== 'object') {
        return;
      }

      if (entry.partOfSpeech) {
  sections.push(`<div class="ai-entry"><span class="ai-pos">${escapeHtml(entry.partOfSpeech)}</span>`);
      } else {
        sections.push('<div class="ai-entry">');
      }

      if (Array.isArray(entry.senses)) {
        console.log('JaDict: Processing', entry.senses.length, 'senses');
        entry.senses.forEach((sense, index) => {
          if (!sense || typeof sense !== 'object') {
            return;
          }

          // Add divider between senses (except before first sense)
          if (index > 0) {
            console.log('JaDict: Adding divider before sense', index + 1);
            sections.push(`<div class="sense-divider"></div>`);
          }

          const senseNumber = index + 1;
          console.log('JaDict: Sense', senseNumber, '- synonyms:', sense.synonyms?.length, 'antonyms:', sense.antonyms?.length);
          sections.push(`<div class="ai-sense"><span class="ai-label">Nghĩa ${senseNumber}:</span> ${escapeHtml(sense.definition || '')}</div>`);

          if (sense.explanation) {
            sections.push(`<div class="collapsible-section">
              <div class="collapsible-header">
                <span class="ai-label">Giải thích ngắn</span>
                <span class="collapse-icon">▼</span>
              </div>
              <div class="collapsible-content collapsed">
                <div class="ai-note">${escapeHtml(sense.explanation)}</div>
              </div>
            </div>`);
          }

          if (Array.isArray(sense.usageExamples) && sense.usageExamples.length > 0) {
            sections.push(`<div class="collapsible-section">
              <div class="collapsible-header">
                <span class="ai-label">Ví dụ sử dụng</span>
                <span class="collapse-icon">▼</span>
              </div>
              <div class="collapsible-content collapsed">
                ${formatList(sense.usageExamples)}
              </div>
            </div>`);
          }

          if (Array.isArray(sense.usageNotes) && sense.usageNotes.length > 0) {
            sections.push(`<div class="collapsible-section">
              <div class="collapsible-header">
                <span class="ai-label">Lưu ý sử dụng</span>
                <span class="collapse-icon">▼</span>
              </div>
              <div class="collapsible-content collapsed">
                ${formatList(sense.usageNotes)}
              </div>
            </div>`);
          }

          if (Array.isArray(sense.synonyms) && sense.synonyms.length > 0 && synonymLimit !== 0) {
            const synonymItems = sense.synonyms
              .filter((item) => typeof item === 'string' && item.trim().length > 0)
              .map((item) => escapeHtml(item));
            const limitedSynonyms = synonymLimit > 0 ? synonymItems.slice(0, synonymLimit) : synonymItems;
            if (limitedSynonyms.length > 0) {
              sections.push(`<div class="ai-note"><span class="ai-label">Từ đồng nghĩa (${limitedSynonyms.length}):</span> ${limitedSynonyms.join(', ')}</div>`);
            }
          }

          if (Array.isArray(sense.antonyms) && sense.antonyms.length > 0 && antonymLimit !== 0) {
            const antonymItems = sense.antonyms
              .filter((item) => typeof item === 'string' && item.trim().length > 0)
              .map((item) => escapeHtml(item));
            const limitedAntonyms = antonymLimit > 0 ? antonymItems.slice(0, antonymLimit) : antonymItems;
            if (limitedAntonyms.length > 0) {
              sections.push(`<div class="ai-note"><span class="ai-label">Từ trái nghĩa (${limitedAntonyms.length}):</span> ${limitedAntonyms.join(', ')}</div>`);
            }
          } else {
            // Debug: log why antonyms not shown
            if (sense.antonyms) {
              console.log('JaDict: Antonyms data:', sense.antonyms, 'Limit:', antonymLimit);
            }
          }
        });
      }

      sections.push('</div>');
    });
  }

  sections.push('</div>');
  return sections.join('');
}

function formatSentenceInsights({ modelId, fromLang, toLang, data }) {
  if (!data || typeof data !== 'object') {
    throw new Error('Dữ liệu câu từ Gemini không hợp lệ');
  }

  const sections = [];
  sections.push('<div class="ai-section">');
  sections.push(`<div class="ai-heading"><b>${escapeHtml(fromLang)}</b> sang <b>${escapeHtml(toLang)}</b> (${escapeHtml(modelId)})</div>`);

  if (data.translation) {
    sections.push(`<div class="ai-translation"><span class="ai-label">Bản dịch:</span> ${escapeHtml(data.translation)}</div>`);
  }

  if (data.summary) {
    sections.push(`<div class="collapsible-section">
      <div class="collapsible-header">
        <span class="ai-label">Giải thích ngắn</span>
        <span class="collapse-icon">▼</span>
      </div>
      <div class="collapsible-content collapsed">
        <div class="ai-note">${escapeHtml(data.summary)}</div>
      </div>
    </div>`);
  }

  if (Array.isArray(data.keyPoints) && data.keyPoints.length > 0) {
    sections.push(`<div class="collapsible-section">
      <div class="collapsible-header">
        <span class="ai-label">Ý chính</span>
        <span class="collapse-icon">▼</span>
      </div>
      <div class="collapsible-content collapsed">
        ${formatList(data.keyPoints)}
      </div>
    </div>`);
  }

  sections.push('</div>');
  return sections.join('');
}

function formatFallbackTranslation({ modelId, fromLang, toLang, translation, isWord }) {
  const sections = [];
  sections.push('<div class="ai-section">');
  const heading = isWord ? `${fromLang} sang ${toLang} (AI, ${modelId})` : `${fromLang} sang ${toLang} (${modelId})`;
  sections.push(`<div class="ai-heading"><b>${escapeHtml(heading)}</b></div>`);
  sections.push(`<div class="ai-note">${escapeHtml(translation.trim())}</div>`);
  sections.push('</div>');
  return sections.join('');
}

function formatList(items) {
  const listItems = items
    .filter((item) => typeof item === 'string' && item.trim().length > 0)
    .map((item) => `<li>${escapeHtml(item)}</li>`);

  if (listItems.length === 0) {
    return '';
  }

  return `<ul class="ai-bullets">${listItems.join('')}</ul>`;
}

function escapeHtml(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}


// --- 5. New Dictionary Lookup Handler (v0.4) ---

/**
 * Handle dictionary lookup from action popup
 * @param {string} query - The word/phrase to look up
 * @param {string} queryType - "word" or "phrase"
 * @param {Object} sender - Message sender
 * @returns {Promise<Object>} - Dictionary result
 */
async function handleDictionaryLookup(query, queryType, sender) {
  if (settingsReady) {
    try {
      await settingsReady;
    } catch (error) {
      // Already logged
    }
  }

  if (!extensionSettingsCache.extensionEnabled) {
    throw new Error('JaDict đang tắt. Mở lại trong action popup.');
  }

  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    throw new Error("Vui lòng nhập từ cần tra cứu.");
  }

  const detectedLang = detectLanguage(trimmedQuery);
  const normalizedQuery = trimmedQuery.toLowerCase();

  const sections = [];
  const dictionaryEntries = [];
  const definitions = [];
  const examples = [];
  const relatedWords = new Set();

  try {
    const dictionary = await loadDictionary();

    if (dictionary) {
      if (detectedLang === 'vi') {
        const viEn = dictionary?.vi_en?.[normalizedQuery];
        if (viEn) {
          const heading = `${escapeHtml(trimmedQuery)} - VI sang EN (Từ điển)`;
          sections.push(buildDictionarySection({
            heading,
            body: escapeHtml(viEn)
          }));
          dictionaryEntries.push({
            type: 'vi_en',
            heading,
            body: viEn
          });
          if (viEn && typeof viEn === 'string') {
            definitions.push({
              partOfSpeech: null,
              definition: viEn,
              example: null,
              source: 'dictionary'
            });
          }
        }
      } else {
        const enEn = dictionary?.en_en?.[normalizedQuery];
        if (enEn) {
          const heading = `${escapeHtml(trimmedQuery)} - EN sang EN (Từ điển)`;
          sections.push(buildDictionarySection({
            heading,
            body: escapeHtml(enEn)
          }));
          dictionaryEntries.push({
            type: 'en_en',
            heading,
            body: enEn
          });
          if (enEn && typeof enEn === 'string') {
            definitions.push({
              partOfSpeech: null,
              definition: enEn,
              example: null,
              source: 'dictionary'
            });
          }
        }

        const enVi = dictionary?.en_vi?.[normalizedQuery];
        if (enVi) {
          const heading = `${escapeHtml(trimmedQuery)} - EN sang VI (Từ điển)`;
          sections.push(buildDictionarySection({
            heading,
            body: escapeHtml(enVi)
          }));
          dictionaryEntries.push({
            type: 'en_vi',
            heading,
            body: enVi
          });
          if (enVi && typeof enVi === 'string') {
            definitions.push({
              partOfSpeech: null,
              definition: enVi,
              example: null,
              source: 'dictionary'
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Local dictionary lookup failed:', error);
  }

  const aiResult = await translateWithGemini(trimmedQuery, true, detectedLang, { includeStructured: true });

  if (aiResult?.html) {
    sections.push(aiResult.html);
  }

  const aiData = aiResult?.structured || null;

  if (aiData && Array.isArray(aiData.entries)) {
    aiData.entries.forEach((entry) => {
      const partOfSpeech = entry?.partOfSpeech || null;
      if (!Array.isArray(entry?.senses)) {
        return;
      }

      entry.senses.forEach((sense) => {
        if (sense?.definition) {
          const synonyms = Array.isArray(sense.synonyms) ? sense.synonyms.filter((item) => typeof item === 'string' && item.trim().length > 0) : [];
          const antonyms = Array.isArray(sense.antonyms) ? sense.antonyms.filter((item) => typeof item === 'string' && item.trim().length > 0) : [];

          definitions.push({
            partOfSpeech,
            definition: sense.definition,
            example: Array.isArray(sense.usageExamples) && sense.usageExamples.length > 0
              ? sense.usageExamples[0]
              : null,
            explanation: sense.explanation || null,
            synonyms,
            antonyms,
            source: 'ai'
          });

          synonyms.forEach((item) => relatedWords.add(item));
          antonyms.forEach((item) => relatedWords.add(item));
        }

        if (Array.isArray(sense?.usageExamples)) {
          sense.usageExamples.forEach((exampleText) => {
            if (typeof exampleText === 'string' && exampleText.trim().length > 0) {
              examples.push({
                text: exampleText,
                translation: null
              });
            }
          });
        }
      });
    });
  }

  const html = sections.join('');

  if (!html) {
    throw new Error('Không có dữ liệu tra cứu.');
  }

  return {
    query: trimmedQuery,
    detectedLang,
    html,
    translation: aiData?.translation || null,
    definitions,
    examples,
    relatedWords: Array.from(relatedWords).slice(0, 20),
    dictionaryEntries,
    aiData
  };
}

async function handleTranslateText(text, sender) {
  if (settingsReady) {
    try {
      await settingsReady;
    } catch (error) {
      // Already logged
    }
  }

  if (!extensionSettingsCache.extensionEnabled) {
    throw new Error('JaDict đang tắt. Mở lại trong action popup.');
  }

  const rawText = typeof text === 'string' ? text : '';
  const trimmedText = rawText.trim();

  if (!trimmedText) {
    throw new Error('Vui lòng nhập đoạn văn cần dịch.');
  }

  const detectedLang = detectLanguage(trimmedText);
  const targetLang = detectedLang === 'vi' ? 'en' : 'vi';

  const aiResult = await translateWithGemini(trimmedText, false, detectedLang, { includeStructured: true });

  const html = typeof aiResult === 'string'
    ? aiResult
    : aiResult?.html || '';

  const structured = aiResult && typeof aiResult === 'object' ? aiResult.structured || null : null;

  if (!html) {
    throw new Error('Không nhận được bản dịch từ Gemini.');
  }

  return {
    type: 'translation',
    query: trimmedText,
    detectedLang,
    targetLang,
    html,
    translation: structured?.translation || null,
    summary: structured?.summary || null,
    aiData: structured
  };
}

// --- 6. Chatbot Message Handler (v0.4) ---

/**
 * Handle chatbot conversation message
 * @param {string} message - User message
 * @param {Array} context - Conversation context
 * @param {Object} sender - Message sender
 * @returns {Promise<Object>} - Response object
 */
async function handleChatMessage(message, context, sender) {
  if (settingsReady) {
    try {
      await settingsReady;
    } catch (error) {
      // Already logged
    }
  }

  if (!extensionSettingsCache.extensionEnabled) {
    throw new Error('JaDict đang tắt. Mở lại trong action popup.');
  }

  const apiKey = await getApiKey();
  
  if (!apiKey) {
    throw new Error('Chưa cấu hình API key. Vui lòng vào Cài đặt.');
  }

  const model = extensionSettingsCache.selectedModel && GEMINI_MODEL_SET.has(extensionSettingsCache.selectedModel)
    ? extensionSettingsCache.selectedModel
    : GEMINI_DEFAULT_MODEL;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  // Build conversation history
  const systemPrompts = buildChatSystemPrompts();
  const contents = [...systemPrompts];

  // Add conversation context if provided
  if (context && Array.isArray(context) && context.length > 0) {
    contents.push(...context);
  }

  // Add current user message
  contents.push({
    role: "user",
    parts: [{
      text: message
    }]
  });

  const requestBody = {
    contents: contents,
    generationConfig: CHAT_GENERATION_CONFIG
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
    throw new Error('Invalid response from Gemini API');
  }

  const responseText = data.candidates[0].content.parts[0].text;
  
  return {
    response: responseText,
    timestamp: Date.now()
  };
}

async function handleChatPortMessage(port, message) {
  if (!message || message.type !== 'chat') {
    return;
  }

  const streamId = typeof message.streamId === 'string' ? message.streamId : `stream_${Date.now()}`;
  const rawText = typeof message.message === 'string' ? message.message.trim() : '';
  const tabId = typeof message.tabId === 'number' ? message.tabId : parseInt(message.tabId, 10);

  if (!rawText) {
    port.postMessage({ type: 'error', streamId, error: 'Tin nhắn trống.' });
    return;
  }

  if (!Number.isFinite(tabId)) {
    port.postMessage({ type: 'error', streamId, error: 'Không xác định được tab hiện hành.' });
    return;
  }

  if (settingsReady) {
    try {
      await settingsReady;
    } catch (error) {
      // Already logged
    }
  }

  if (!extensionSettingsCache.extensionEnabled) {
    port.postMessage({ type: 'error', streamId, error: 'JaDict đang tắt. Bật lại trong popup.' });
    return;
  }

  let apiSettings;
  try {
    apiSettings = await getGeminiSettings();
  } catch (error) {
    port.postMessage({ type: 'error', streamId, error: error?.message || 'Chưa cấu hình API key.' });
    return;
  }

  const { apiKey, modelId } = apiSettings;

  const existingMessages = await getChatContext(tabId);
  const userMessage = {
    role: 'user',
    content: rawText,
    timestamp: Date.now()
  };

  const intent = message.intent === 'translation' ? 'translation' : 'general';
  const translationContext = intent === 'translation'
    ? buildTranslationGuidance(rawText)
    : null;

  const contents = buildGeminiContentsFromStoredMessages(existingMessages, rawText, {
    intent,
    translationGuidance: translationContext?.guidance
  });

  const generationConfig = { ...CHAT_GENERATION_CONFIG };
  if (intent === 'translation') {
    generationConfig.temperature = 0.3;
    generationConfig.topP = 0.8;
  }

  port.postMessage({ type: 'start', streamId });

  let assistantText = '';

  try {
    assistantText = await streamGeminiChat({
      apiKey,
      modelId,
      contents,
      generationConfig,
      onChunk: (text) => {
        port.postMessage({ type: 'update', streamId, text });
      }
    });
  } catch (error) {
    port.postMessage({ type: 'error', streamId, error: error?.message || 'Đã xảy ra lỗi khi gọi Gemini.' });
    return;
  }

  const assistantMessage = {
    role: 'assistant',
    content: assistantText,
    timestamp: Date.now()
  };

  const updatedMessages = trimChatMessages([...existingMessages, userMessage, assistantMessage], 20);
  await setChatContext(tabId, updatedMessages);

  if (HISTORY && typeof HISTORY.addEntry === 'function') {
    try {
      await HISTORY.addEntry({
        type: 'chat',
        query: rawText,
        response: assistantText,
        timestamp: assistantMessage.timestamp,
        tabId,
        metadata: {
          modelId,
          intent,
          sourceLang: translationContext?.sourceLang || null,
          targetLang: translationContext?.targetLang || null
        }
      });
    } catch (historyError) {
      console.warn('JaDict: Không lưu được lịch sử trò chuyện', historyError);
    }
  }

  port.postMessage({
    type: 'done',
    streamId,
    text: assistantText,
    messages: updatedMessages
  });
}

// --- 7. Helper function to get API key ---

async function getApiKey() {
  return new Promise((resolve) => {
    API.storage.local.get(['geminiApiKey'], (result) => {
      resolve(result.geminiApiKey || null);
    });
  });
}

// --- 8. Lightweight Language Detection ---

function detectLanguage(rawText) {
  if (!rawText) {
    return 'en';
  }

  const text = String(rawText);
  const lower = text.toLowerCase();

  const vietnameseAccentRegex = /[àáâãèéêìíòóôõùúăằắẳẵặẳặẵằặđĩũơưạảấầẩẫậắằẳẵặẹẻẽềềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳýỵỷỹđ]/;
  if (vietnameseAccentRegex.test(lower)) {
    return 'vi';
  }

  if (lower.includes('đ')) {
    return 'vi';
  }

  const cleaned = lower
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const tokens = cleaned.split(/[^a-z]+/).filter(Boolean);

  if (tokens.length === 0) {
    return 'en';
  }

  const vietnameseWords = new Set([
    'anh','chi','em','toi','ban','chung','khong','mot','nhung','nhu','thi','va','co','cho','cua','duoc','la','nay','kia','gi','nguoi','viet','nam','roi','noi','day','minh','cung','dang','da','se','voi','van','lam','nen','khi','neu','cung','nhat','trong','them','nhieu','ly','do'
  ]);

  const englishWords = new Set([
    'the','and','that','this','with','have','will','from','you','for','not','your','about','which','there','their','what','when','where','how','why','who','can','would','could','should','like','just','into','over','after','before','because','been','was','were','are','is','am','they','them','people','time','year','make','know'
  ]);

  let viScore = 0;
  let enScore = 0;

  for (const token of tokens) {
    if (vietnameseWords.has(token)) {
      viScore += 2;
    }
    if (englishWords.has(token)) {
      enScore += 2;
    }

    if (/^(ng|kh|nh|ph|tr|th)/.test(token) && token.length >= 4) {
      viScore += 1;
    }
    if (/(ing|ed|tion|able|ment)$/.test(token) && token.length >= 5) {
      enScore += 1;
    }
  }

  if (viScore === enScore) {
    // Tie-breaker: prefer Vietnamese if any token looks like Vietnamese syllable
    const vietnameseSyllablePattern = /^(?:[bcdghklmnpqrstvx]{0,2}[aeiouy]{1,3})$/;
    if (tokens.some(token => vietnameseSyllablePattern.test(token) && token.includes('ng'))) {
      viScore += 1;
    }
  }

  return viScore > enScore ? 'vi' : 'en';
}
