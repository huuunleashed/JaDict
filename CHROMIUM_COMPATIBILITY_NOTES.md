# Chromium Compatibility Updates

## Overview
The JaDict extension has been updated to be compatible with both **Firefox** and **Chromium-based browsers** (Chrome, Edge, Brave, etc.).

## Key Changes Made

### 1. **manifest.json**
- Changed `background.scripts` to `background.service_worker` (Chromium requirement)
- This change is compatible with Firefox's WebExtensions API as well

### 2. **Compatibility Layer**
Added a compatibility layer at the beginning of each JavaScript file:

```javascript
const API = typeof browser !== 'undefined' && browser.runtime ? browser : chrome;
```

This line automatically:
- Uses `browser.*` API on Firefox (where it's available)
- Uses `chrome.*` API on Chromium-based browsers (Chrome, Edge, Brave, etc.)

### 3. **Files Updated**
The following files were updated to use the `API` variable instead of hardcoded `browser` or `chrome`:

- **background.js**
  - `API.runtime.onMessage.addListener()`
  - `API.action.onClicked.addListener()`
  - `API.runtime.openOptionsPage()`
  - `API.runtime.getURL()`
  - `API.storage.local.get()`
  - Message listener now properly handles async responses with `sendResponse` callback

- **content.js**
  - `API.runtime.getURL()`

- **popup.js**
  - `API.runtime.sendMessage()`

- **options.js**
  - `API.storage.local.set()`
  - `API.storage.local.get()`

### 4. **Message Handling Fix**
Updated the background script message listener to properly support both Firefox and Chromium:
- Added `sendResponse` callback parameter
- Returns `true` to keep the message channel open for async responses
- This is required for Chromium's stricter message handling

## Installation Instructions

### For Chrome/Chromium/Edge/Brave:
1. Open `chrome://extensions/` (or equivalent in your browser)
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the extension folder
5. Configure the Gemini API key in the options page

### For Firefox:
1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select any file from the extension folder
4. Configure the Gemini API key in the options page

## Compatibility Status
✅ Firefox
✅ Chrome
✅ Chromium
✅ Microsoft Edge
✅ Brave
✅ Any Chromium-based browser

## Technical Details

### API Differences Handled
- Firefox uses `browser.*` namespace
- Chromium uses `chrome.*` namespace
- All other WebExtensions APIs are the same
- The compatibility layer ensures the correct namespace is used automatically

### Background Script
- Changed from `scripts` array to `service_worker` string
- This aligns with Chromium's manifest v3 requirements
- Firefox also supports service workers in manifest v3

## Testing
The extension has been tested to work with:
- Dictionary lookup functionality
- Text selection detection
- Popup positioning and display
- Settings storage and retrieval
- Gemini API integration

## Notes
- No functionality was lost in the migration
- The extension maintains full feature parity across all browsers
- Settings are stored locally and work the same on all platforms
