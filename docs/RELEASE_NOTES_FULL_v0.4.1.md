# 🚀 JaDict v0.4.1 - Stability & Firefox/Zen Browser Compatibility

**Release Date:** November 3, 2025

## 🎯 Overview

This release focuses on **stability improvements** and **Firefox/Zen Browser compatibility**, fixing critical bugs with the settings button and popup behavior.

---

## 🐛 Major Bug Fixes

### ✅ Firefox/Zen Browser: Settings Button Not Clickable

**Problem:** The "Cài đặt tổng" (Settings) button in the lookup popup was unresponsive in Firefox-based browsers.

**Solution:**
- 📡 Implemented **PostMessage communication pattern** to bypass iframe restrictions
  - `popup.js (iframe)` → `content.js` → `background.js` → opens options page
- 🎯 **Multi-event strategy**: `click`, `mouseup`, `touchend` with capture phase
- 🎨 **Enhanced CSS**: `pointer-events: auto !important`, larger hit area (100px × 32px)
- 🔄 **Triple fallback chain**: PostMessage → openOptionsPage() → tabs.create()

### ✅ Popup Auto-Showing with Spinner

**Problem:** Popup sometimes appeared spontaneously with a spinning loader, without any text selection.

**Solution:**
- ⏱️ **Debounce mechanism** (50ms) for `mouseup` event to prevent race conditions
- ✔️ **Enhanced selection validation**: 
  - Check `selection.isCollapsed`, `rangeCount > 0`, `rect dimensions > 0`
  - Track `lastSelectedText` to prevent duplicates
- 🛡️ **Better text validation**: Trim and validate before lookup
- ⏰ **Timeout protection**: 10-second timeout for lookup requests

---

## 🔒 Security & Stability Improvements

### Content.js
- ✨ **Origin validation** in postMessage handler
- 🔍 **Enhanced message validation** (type, structure, dimensions)
- 🧹 **Proper cleanup** of debounce timers and state

### Popup.js
- 🛡️ **Dimension validation** with `isFinite()` checks
- 🔍 **Better error handling** with try-catch blocks
- 📝 **Detailed logging** for debugging

### Background.js
- 🎯 **OPEN_OPTIONS_PAGE handler** for cross-context communication
- 🔄 **Fallback mechanism** for opening options page

---

## 🎨 UI/UX Improvements

- ⚙️ Added settings icon to button: "⚙️ Cài đặt tổng"
- 👆 **Visual feedback** on pointer interactions (scale animation)
- ♿ **Keyboard support** (Enter/Space keys)
- 🎯 **Better button states**: hover, active, focus-visible

---

## 📁 Files Changed

**Core Files (12 modified):**
- `popup.js`, `content.js`, `background.js`
- `popup.css`, `content.css`, `popup.html`
- `manifest.json`, `manifest.firefox.json`, `package.json`
- `action.js`, `search-popup.js`

**Documentation (4 new/updated):**
- `docs/RELEASE_NOTES_v0.4.1.md` - Comprehensive release notes
- `docs/TESTING_GUIDE_v0.4.1.md` - Detailed testing checklist
- `docs/ZEN_BROWSER_FIX.md` - Technical notes for Zen Browser fix
- `docs/CHANGELOG.md` - Updated changelog

---

## 📦 Installation

### Chrome/Edge
1. Download `jadict-chrome.zip` from Assets below
2. Extract the zip file
3. Go to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the extracted folder

### Firefox/Zen Browser
1. Download `jadict-firefox.zip` from Assets below
2. Extract the zip file
3. Go to `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on"
5. Select `manifest.json` from the extracted folder

---

## 🧪 Testing

All major test scenarios have been validated:
- ✅ Firefox/Zen Browser settings button functionality
- ✅ No spontaneous popup appearances
- ✅ Proper selection handling with rapid changes
- ✅ Click inside popup doesn't close it
- ✅ Copy button functionality
- ✅ Resize handle functionality
- ✅ Theme switching
- ✅ Extension enable/disable

See [TESTING_GUIDE_v0.4.1.md](./docs/TESTING_GUIDE_v0.4.1.md) for detailed test cases.

---

## 🔧 Technical Details

### PostMessage Communication Flow
```
User clicks "Settings" button
    ↓
Popup.js sends postMessage('QUICK_DICT_OPEN_SETTINGS')
    ↓
Content.js receives and forwards to Background.js
    ↓
Background.js opens options page
    ↓
Success!
```

### Debounce Mechanism
```javascript
// 50ms debounce prevents race conditions
selectionDebounceTimer = setTimeout(() => {
  if (selection.isCollapsed) return;
  if (selectedText === lastSelectedText) return;
  createPopup(selectedText, rect);
}, 50);
```

---

## 📝 Known Issues

None! All reported issues have been fixed in this release.

---

## 🙏 Acknowledgments

Thanks to all users who reported issues and helped test the fixes, especially for identifying the Zen Browser compatibility issue.

---

## 📖 Documentation

- [Full Changelog](./docs/CHANGELOG.md)
- [Release Notes](./docs/RELEASE_NOTES_v0.4.1.md)
- [Testing Guide](./docs/TESTING_GUIDE_v0.4.1.md)
- [Zen Browser Fix Technical Notes](./docs/ZEN_BROWSER_FIX.md)

---

**Full Changelog:** [v0.4.0...v0.4.1](https://github.com/huuunleashed/JaDict/compare/v0.4.0...v0.4.1)
