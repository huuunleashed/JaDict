# JaDict v0.2 - Release Notes for Firefox Add-ons

## Version 0.2 - Major UI/UX Update

### What's New

**🎛️ Action Popup**
Quick access to extension controls by clicking the toolbar icon. Toggle JaDict on/off globally or per-site, switch themes, and manage Gemini API settings without opening the full options page.

**🌓 Light/Dark Theme**
Choose between light and dark themes that sync across all extension UI components (lookup popup, action popup, and options page). Perfect for reducing eye strain during night reading.

**📑 Enhanced Options Page**
Redesigned with 3 organized tabs:
- Settings: Global toggles, theme selection, API configuration, result customization
- Guide: Quick start instructions and usage tips
- Donate: Support information

**🚫 Site Blacklist**
Manage a list of domains where JaDict won't activate. Add sites through the options page or quickly disable per-site via the action popup.

**🎚️ Customizable Results**
Control the number of synonyms and antonyms displayed (0-20, default: 5) to optimize popup space and reduce information overload.

**⚙️ Quick Settings Access**
Every lookup popup now includes a "Settings" button for instant access to the full options page.

### Technical Improvements

- Centralized settings management with `settings.js` module
- Real-time theme synchronization using storage listeners
- CSS variables for efficient theme switching
- Added `tabs` permission for per-site controls
- Improved manifest v2 compatibility

### Bug Fixes

- Fixed encoding issues in Vietnamese text
- Improved popup positioning and resize behavior
- Enhanced storage reliability

### Documentation

- Comprehensive README with FAQ section
- Detailed feature documentation
- Updated CHANGELOG with version history

---

## 📋 Notes for Reviewer

**Build Instructions:**
This extension can be fully built from source code using the following commands:
```bash
git clone https://github.com/huuunleashed/JaDict.git
cd JaDict
npm install
npm run build:firefox
```

The build process is documented in README.md and creates `dist/jadict-firefox.xpi`.

**Source Code:**
- All source files are available at: https://github.com/huuunleashed/JaDict
- No minification or obfuscation is used
- No external libraries - pure vanilla JavaScript
- File `scripts/build.js` contains the build script using `adm-zip` for packaging

**Key Changes in v0.2:**
1. Added `action.html`, `action.js`, `action.css` - New action popup UI
2. Added `settings.js` - Shared settings module for all contexts
3. Updated `manifest.json` - Version 0.2, added action popup and tabs permission
4. Updated `content.js` - Added blacklist logic and theme parameter passing
5. Updated `popup.html/js/css` - Added theme support and settings button
6. Redesigned `options.html/js/css` - Complete 3-tab layout

**Permissions Justification:**
- `storage`: Save user settings (API key, theme, blacklist)
- `unlimitedStorage`: Store offline dictionary data (~2MB JSON)
- `clipboardWrite`: Copy translation results to clipboard
- `tabs`: Get current tab hostname for per-site blacklist feature
- `<all_urls>`: Inject content script for text selection on any webpage

**Privacy:**
- No data collection or analytics
- API key stored locally in browser storage
- No external requests except to user's own Gemini API
- No tracking, no telemetry

**Testing:**
Tested on:
- Firefox 133+ (Manifest V2)
- Zen Browser (latest)
- Windows 11, macOS 14, Ubuntu 24.04

---

**Full changelog**: https://github.com/huuunleashed/JaDict/blob/main/CHANGELOG.md
**Source code**: https://github.com/huuunleashed/JaDict
**Report issues**: https://github.com/huuunleashed/JaDict/issues
