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

// --- 1. Main Message Listener ---
// (API Key is no longer stored here)

const GEMINI_MODEL_OPTIONS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'];
const GEMINI_MODEL_SET = new Set(GEMINI_MODEL_OPTIONS);
const GEMINI_DEFAULT_MODEL = 'gemini-2.5-flash-lite';

// Listens for messages from popup.js
API.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type !== "LOOKUP") {
    return undefined;
  }

  handleLookup(request.text)
    .then(result => sendResponse({ status: "success", data: result }))
    .catch(error => {
      console.error("JaDict error:", error);
      sendResponse({ status: "error", data: error.message });
    });
  
  return true; // Keep the message channel open for async response
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


// --- 2. Smart Detection and Routing Logic ---

async function handleLookup(text) {
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

async function translateWithGemini(text, isWord = false, detectedLangOverride) {
  const detectedLang = detectedLangOverride || detectLanguage(text);
  let settings;

  try {
    settings = await getGeminiSettings();
  } catch (error) {
    console.error(error);
      return `Lỗi: ${error.message}`;
  }

  const { apiKey, modelId } = settings;

  try {
    if (isWord) {
      return await generateWordInsights({ apiKey, modelId, text, detectedLang });
    }

    return await generateSentenceInsights({ apiKey, modelId, text, detectedLang });

  } catch (structuredError) {
    console.error("Gọi Gemini dạng cấu trúc thất bại:", structuredError);

    try {
      return await generatePlainTranslation({ apiKey, modelId, text, detectedLang, isWord });
    } catch (fallbackError) {
        console.error("Gọi Gemini dự phòng thất bại:", fallbackError);
        return `Lỗi kết nối Gemini: ${fallbackError.message}`;
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

async function generateWordInsights({ apiKey, modelId, text, detectedLang }) {
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
                required: ['definition'],
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

  const systemPrompt = `You are a bilingual lexicographer. Analyse the following ${fromLang} term and produce a concise, structured entry for learners. Use the provided JSON schema. Definitions ("definition") and usage notes ("usageNotes") must always be written in Vietnamese, even when the original term is in ${fromLang}. Explanations, usage examples, synonyms, and antonyms should remain in ${fromLang}. Provide the best single-word or short-phrase translation in ${toLang}. Leave fields empty if you are unsure.`;

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
  return formatWordInsights({
    term: text,
    modelId,
    fromLang,
    toLang,
    data: parsed
  });
}

async function generateSentenceInsights({ apiKey, modelId, text, detectedLang }) {
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
  return formatSentenceInsights({
    modelId,
    fromLang,
    toLang,
    data: parsed
  });
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

function formatWordInsights({ term, modelId, fromLang, toLang, data }) {
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
        entry.senses.forEach((sense, index) => {
          if (!sense || typeof sense !== 'object') {
            return;
          }

          const senseNumber = index + 1;
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

          if (Array.isArray(sense.synonyms) && sense.synonyms.length > 0) {
            const synonymsText = sense.synonyms
              .filter((item) => typeof item === 'string' && item.trim().length > 0)
              .map((item) => escapeHtml(item))
              .join(', ');
            if (synonymsText) {
              sections.push(`<div class="ai-note"><span class="ai-label">Từ đồng nghĩa:</span> ${synonymsText}</div>`);
            }
          }

          if (Array.isArray(sense.antonyms) && sense.antonyms.length > 0) {
            const antonymsText = sense.antonyms
              .filter((item) => typeof item === 'string' && item.trim().length > 0)
              .map((item) => escapeHtml(item))
              .join(', ');
            if (antonymsText) {
              sections.push(`<div class="ai-note"><span class="ai-label">Trái nghĩa:</span> ${antonymsText}</div>`);
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


// --- 5. Lightweight Language Detection ---

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
