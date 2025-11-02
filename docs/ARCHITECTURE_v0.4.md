# JaDict v0.4 Architecture Plan

**Version:** 0.4.0  
**Date:** November 1, 2025  
**Status:** Planning → Implementation

---

## 🎯 Overview

JaDict v0.4 is a major update that transforms the extension from a simple lookup tool into a comprehensive AI-powered dictionary suite with:
- Interactive search interface with tabbed UI
- AI chatbot with conversation context
- Full-fledged dictionary (bidirectional)
- History tracking (chat + lookup)
- PDF support across all major browsers
- Revamped UI with modern switches

---

## 🏗️ Architecture Changes

### Current Structure (v0.3.1)
```
action.html (popup) → Settings UI
├── Global toggle
├── Site toggle
├── Theme selector
└── API key input

content.js → Text selection detection
└── Injects popup.html iframe

popup.html (iframe) → Definition display
└── Shows word definitions inline

background.js → Message handler
├── Dictionary lookup
├── Gemini API calls
└── Settings management
```

### New Structure (v0.4.0)
```
action.html (popup) → Main Interface
├── Search Bar (new)
├── Tab Navigation (Dictionary | Chatbot | History)
├── On/Off Switch (enhanced)
├── Dark/Light Toggle (enhanced)
└── Settings link

content.js (enhanced) → Multi-context support
├── Text selection detection (existing)
├── PDF text selection (new)
└── Context menu integration (new)

popup.html (iframe) → Dual Purpose
├── Text selection results (existing)
└── Search results from action.html (new)

background.js (enhanced)
├── Dictionary lookup (existing + bidirectional)
├── Gemini API: Definitions (existing)
├── Gemini API: Chat (new)
├── History management (new)
└── PDF detection (new)

search-popup.html (new) → Dedicated search results
├── Dictionary results
├── Chatbot conversations
└── History viewer

history.js (new) → History management
├── IndexedDB storage
├── Search functionality
└── Export/import
```

---

## 🔧 Component Details

### 1. **Enhanced action.html**

**Layout:**
```
┌────────────────────────────────────┐
│  JaDict          [🌙] [ON/OFF]   │  ← Header
├────────────────────────────────────┤
│  🔍 Search...                  [>] │  ← Search Bar
├────────────────────────────────────┤
│  [Dictionary] [Chatbot] [History] │  ← Tabs
├────────────────────────────────────┤
│                                    │
│    (Tab Content Here)              │
│                                    │
│                                    │
├────────────────────────────────────┤
│  ⚙️ Settings                       │  ← Footer
└────────────────────────────────────┘
```

**Features:**
- **Search Bar**: Instant search with enter/click
- **Tab 1 - Dictionary**: Quick lookup, recent searches
- **Tab 2 - Chatbot**: Conversation interface
- **Tab 3 - History**: Combined chat + lookup history
- **Header Switches**:
  - Dark/Light mode toggle (animated)
  - Global On/Off switch (disables all functionality)

**Files:**
- `action.html` (rewrite)
- `action.css` (redesign)
- `action.js` (expand)

---

### 2. **Search Result Popup**

**Two modes:**

**A) Dictionary Mode:**
```
┌──────────────────────────┐
│ hello                 [×]│
├──────────────────────────┤
│ /həˈloʊ/ (interjection) │
│                          │
│ 1. Used as a greeting... │
│    Example: "Hello!"     │
│                          │
│ Synonyms: hi, hey...     │
│ Antonyms: goodbye...     │
│                          │
│ [Copy] [Speak] [Save]    │
└──────────────────────────┘
```

**B) Chatbot Mode:**
```
┌──────────────────────────┐
│ Chatbot              [×] │
├──────────────────────────┤
│ 👤 What does "serendipity"│
│    mean?                 │
│                          │
│ 🤖 "Serendipity" is...   │
│    [Detailed response]   │
│                          │
│ 👤 ...                   │
├──────────────────────────┤
│ Type a message...    [>] │
└──────────────────────────┘
```

**Implementation:**
- Option 1: New HTML file (`search-popup.html`) opened via `window.open()` with controlled dimensions
- Option 2: Side panel API (Chrome 114+) for persistent interface
- Option 3: Expanded iframe with dynamic positioning

**Recommended: Option 1** - Maximum compatibility

**Files:**
- `search-popup.html` (new)
- `search-popup.css` (new)
- `search-popup.js` (new)

---

### 3. **AI Chatbot System**

**Context Retention:**
```javascript
// Per-tab conversation storage
{
  "chat_context": {
    "tabId_123": {
      "messages": [
        {"role": "user", "content": "..."},
        {"role": "model", "content": "..."}
      ],
      "timestamp": 1730419200000
    }
  }
}
```

**Features:**
- Streaming responses (SSE from Gemini)
- Context window management (limit to last 10 messages)
- Clear conversation button
- Export conversation as text/JSON

**API Integration:**
```javascript
// Gemini Chat API (different from generation API)
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent
{
  "contents": [
    {"role": "user", "parts": [{"text": "..."}]},
    {"role": "model", "parts": [{"text": "..."}]}
  ]
}
```

**Files:**
- `background.js` (add `handleChatMessage()`)
- `chatbot.js` (new, UI logic)

---

### 4. **Enhanced Dictionary**

**Bidirectional Support:**
- **EN → VI**: Existing logic
- **VI → EN**: New logic using Gemini prompt engineering

**Prompt for VI → EN:**
```
You are a Vietnamese-English translator. 
Input: Vietnamese word/phrase
Output: {
  "word": "original Vietnamese",
  "translations": ["English translation 1", "..."],
  "examples": [
    {"vi": "...", "en": "..."}
  ],
  "relatedWords": ["..."]
}
```

**Features:**
- Language auto-detection
- Phonetic transcription (IPA for EN, no tone marks for VI)
- Example sentences in both languages
- Related words/phrases

**Files:**
- `background.js` (add `handleVietnameseLookup()`)
- `dictionary.js` (new, shared dictionary logic)

---

### 5. **History System**

**Storage:**
- **IndexedDB** (for large history, 50MB+)
- **Structure:**
  ```javascript
  // ObjectStore: "history"
  {
    id: "uuid",
    type: "lookup" | "chat",
    query: "hello",
    response: {...},
    timestamp: 1730419200000,
    tabId: 123,
    url: "https://example.com"
  }
  ```

**Features:**
- Search history by query
- Filter by type (lookup/chat)
- Date range filter
- Clear all / Clear old (>30 days)
- Export as JSON/CSV

**UI:**
```
┌──────────────────────────┐
│ History             [🗑️] │
├──────────────────────────┤
│ 🔍 Search history...     │
│ [All] [Lookup] [Chat]    │
├──────────────────────────┤
│ Today                    │
│  • hello (lookup)  2:30pm│
│  • What is AI? (chat) 1pm│
│                          │
│ Yesterday                │
│  • serendipity (lookup)  │
│  • ...                   │
└──────────────────────────┘
```

**Files:**
- `history.js` (new)
- `history.html` (new, dedicated page)
- `history.css` (new)

---

### 6. **PDF Support**

**Challenge**: PDF rendering varies across browsers
- **Chrome/Edge**: Native PDF viewer (`chrome-extension://mhjfbmdgcfjbbpaeojofohoefgiehjai/`)
- **Firefox**: PDF.js viewer (`resource://pdf.js/`)

**Detection Strategy:**
```javascript
function isPDFContext(url) {
  return (
    url.includes('pdf') ||
    url.includes('chrome-extension://') && url.includes('.pdf') ||
    url.includes('resource://pdf.js') ||
    document.contentType === 'application/pdf'
  );
}
```

**Content Script Injection:**
```javascript
// manifest.json
"content_scripts": [
  {
    "matches": ["<all_urls>", "file:///*/*.pdf"],
    "match_about_blank": true,
    "all_frames": true,
    "js": ["content.js"],
    "run_at": "document_end"
  }
]
```

**PDF Text Selection:**
```javascript
// content.js
if (isPDFContext(window.location.href)) {
  // PDF.js text layer detection
  document.addEventListener('mouseup', (e) => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text) {
      // Show popup near cursor
      showLookupPopup(text, e.clientX, e.clientY);
    }
  });
}
```

**Files:**
- `content.js` (add PDF detection)
- `manifest.json` (add `match_about_blank`, `all_frames`)

---

### 7. **Revamped UI**

**Design System:**
```css
:root {
  /* Light mode */
  --color-primary: #4A90E2;
  --color-bg: #FFFFFF;
  --color-text: #333333;
  --color-border: #E0E0E0;
  
  /* Dark mode */
  --color-primary-dark: #6BB6FF;
  --color-bg-dark: #1E1E1E;
  --color-text-dark: #E0E0E0;
  --color-border-dark: #3C3C3C;
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-slow: 300ms ease;
}

/* Modern switch */
.toggle-switch {
  width: 48px;
  height: 24px;
  border-radius: 12px;
  background: var(--color-border);
  transition: background var(--transition-fast);
}

.toggle-switch.active {
  background: var(--color-primary);
}

.toggle-switch .thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  transform: translateX(2px);
  transition: transform var(--transition-fast);
}

.toggle-switch.active .thumb {
  transform: translateX(26px);
}
```

**Switch Components:**
1. **On/Off Switch** (in header)
   - Active: Blue background, white checkmark
   - Inactive: Gray background, white X

2. **Dark/Light Switch** (in header)
   - Icon-based: 🌙 (dark) / ☀️ (light)
   - Animated transition

**Files:**
- `action.css` (redesign)
- `popup.css` (update)
- `shared-ui.css` (new, shared components)

---

## 📊 Data Flow

### Search Flow:
```
User types in search bar
  ↓
action.js detects input
  ↓
Determines type (word/sentence/question)
  ↓
Sends message to background.js
  ↓
background.js routes to:
  • Dictionary lookup (if single word)
  • Chatbot (if question/conversation)
  ↓
API call to Gemini
  ↓
Response saved to history
  ↓
Result sent back to action.js
  ↓
Opens search-popup.html with result
  ↓
User interacts (copy, speak, continue chat)
```

### Text Selection Flow (existing + enhanced):
```
User selects text on webpage/PDF
  ↓
content.js detects selection
  ↓
Injects popup.html iframe
  ↓
popup.js requests lookup from background.js
  ↓
background.js returns definition
  ↓
popup.html displays result
  ↓
Saved to history
```

---

## 🔐 Permissions

### New Permissions (v0.4):
```json
{
  "permissions": [
    "storage",
    "unlimitedStorage",
    "clipboardWrite",
    "tabs",
    "sidePanel"  // NEW: For persistent sidebar (Chrome 114+)
  ],
  "host_permissions": [
    "<all_urls>",
    "file:///*"  // NEW: For PDF file access
  ]
}
```

**Justifications:**
- `sidePanel`: Optional, for persistent dictionary interface
- `file:///*`: Required for PDF files opened locally

---

## 🗂️ File Structure

### New Files:
```
JaDict/
├── action.html (rewritten)
├── action.css (redesigned)
├── action.js (expanded)
├── search-popup.html (NEW)
├── search-popup.css (NEW)
├── search-popup.js (NEW)
├── chatbot.js (NEW)
├── history.js (NEW)
├── history.html (NEW)
├── history.css (NEW)
├── dictionary.js (NEW - shared logic)
├── shared-ui.css (NEW - reusable components)
├── background.js (enhanced)
├── content.js (enhanced - PDF support)
├── popup.html (existing)
├── popup.css (updated)
├── popup.js (existing)
├── manifest.json (updated to 0.4.0)
└── package.json (updated to 0.4.0)
```

---

## 🧪 Testing Plan

### Manual Testing:
1. **Search Bar**
   - [ ] Single word lookup (EN → VI)
   - [ ] Single word lookup (VI → EN)
   - [ ] Sentence translation
   - [ ] Chat question

2. **Chatbot**
   - [ ] Send message, receive response
   - [ ] Context retention (follow-up questions)
   - [ ] Clear conversation
   - [ ] Streaming response display

3. **History**
   - [ ] View lookup history
   - [ ] View chat history
   - [ ] Search history
   - [ ] Clear history
   - [ ] Export history

4. **PDF Support**
   - [ ] Chrome: Local PDF file
   - [ ] Chrome: Online PDF
   - [ ] Firefox: Local PDF file
   - [ ] Firefox: Online PDF
   - [ ] Edge: Local PDF file

5. **UI Switches**
   - [ ] On/Off toggle (disables extension)
   - [ ] Dark/Light mode toggle
   - [ ] Theme persistence
   - [ ] Smooth animations

### Browser Testing:
- [ ] Chrome (latest)
- [ ] Edge (latest)
- [ ] Firefox (latest)
- [ ] Zen Browser (latest)

---

## 📈 Performance Considerations

### Optimization:
1. **History Storage**
   - Use IndexedDB (better for large datasets)
   - Implement pagination (50 items per page)
   - Auto-cleanup old entries (>90 days)

2. **Gemini API**
   - Debounce search input (500ms)
   - Cache recent lookups (5 minutes)
   - Rate limiting (max 10 requests/minute)

3. **Context Management**
   - Limit conversation history to last 10 messages
   - Clear old tab contexts (tab closed >1 hour)

---

## 🚀 Implementation Phases

### Phase 1: UI Foundation (Day 1-2)
- Redesign action.html with tabs
- Add search bar
- Create switches (On/Off, Dark/Light)
- Update CSS with new design system

### Phase 2: Dictionary Enhancement (Day 2-3)
- Implement bidirectional lookup (VI ↔ EN)
- Language auto-detection
- Search popup interface

### Phase 3: Chatbot (Day 3-4)
- Chat interface in action.html
- Context retention per tab
- Streaming responses
- Clear conversation

### Phase 4: History System (Day 4-5)
- IndexedDB setup
- History UI
- Search and filter
- Export functionality

### Phase 5: PDF Support (Day 5-6)
- PDF detection logic
- Content script injection
- Test across browsers

### Phase 6: Testing & Polish (Day 6-7)
- Cross-browser testing
- Bug fixes
- Performance optimization
- Documentation

---

## 📝 Migration Guide (v0.3.1 → v0.4.0)

### Breaking Changes:
- None (fully backward compatible)

### New Features:
- Search bar in action popup
- AI chatbot with context
- Bidirectional dictionary
- History tracking
- PDF support
- Enhanced UI with switches

### Settings Migration:
- Existing settings preserved
- New settings added with defaults:
  ```javascript
  {
    extensionEnabled: true,  // NEW
    chatContextLimit: 10,    // NEW
    historyRetentionDays: 90 // NEW
  }
  ```

---

## ✅ Success Metrics

- [ ] Search bar functional with instant results
- [ ] Chatbot maintains context across messages
- [ ] History stores and retrieves data correctly
- [ ] PDF support works in Chrome, Edge, Firefox, Zen
- [ ] On/Off switch disables all extension functionality
- [ ] Dark/Light mode transitions smoothly
- [ ] No performance degradation (<100ms response time)
- [ ] All tests pass

---

**Ready to implement!** 🚀
