# Release Notes v0.4.1 - Stability & Firefox Compatibility

**Ngày phát hành:** 3 tháng 11, 2025

## 🎯 Mục tiêu Release

Release này tập trung vào việc cải thiện **stability** và **compatibility** đặc biệt cho Firefox, đồng thời khắc phục bug popup tự hiện không mong muốn.

---

## 🐛 Bug Fixes

### 1. **Firefox: Nút "Cài đặt tổng" không bấm được** ✅

**Vấn đề:** 
- Trong Firefox, nút "Cài đặt tổng" trong popup tra cứu không phản hồi khi click
- Do Firefox có CSP (Content Security Policy) nghiêm ngặt hơn với iframe

**Giải pháp:**
- ✨ Thêm comprehensive event handlers với `preventDefault()` và `stopPropagation()`
- 🔄 Implement fallback mechanism với 3 phương pháp:
  1. `API.runtime.openOptionsPage()` (primary)
  2. `browser/chrome.tabs.create()` (fallback 1)
  3. `window.open()` (fallback 2)
- 🎨 Cải thiện CSS với:
  - `pointer-events: auto` để ensure clickability
  - `z-index: 10` để ensure proper stacking
  - `user-select: none` để tránh text selection issues
- ♿ Thêm keyboard support (Enter/Space keys) cho accessibility
- 🎯 Thêm `mousedown` handler để ensure button responsiveness

### 2. **Popup tự hiện và quay mòng mòng** ✅

**Vấn đề:** 
- Popup đôi khi tự xuất hiện và hiển thị loader spinning mà không có selection
- Xảy ra trên mọi trình duyệt (Chromium & Firefox)

**Nguyên nhân:**
- Race conditions trong event handling
- Thiếu validation cho selection state
- Message handling không đủ chặt chẽ

**Giải pháp:**
- ⏱️ **Debounce mechanism** (50ms) cho `mouseup` event để tránh rapid triggers
- ✔️ **Enhanced selection validation:**
  - Check `selection.isCollapsed` để ensure selection exists
  - Validate selection length > 0
  - Check `rangeCount > 0` và `rect dimensions > 0`
- 🔒 **Prevent duplicates:**
  - Thêm biến `lastSelectedText` để track previous selection
  - Skip nếu popup đã tồn tại với cùng text
- 🛡️ **Better text validation:**
  - Trim selectedText trong popup.js
  - Validate length trước khi lookup
  - Show proper error message nếu empty

### 3. **Enhanced Security & Stability** 🔒

**Content.js improvements:**
- ✨ **Origin validation** trong postMessage handler:
  - Check message source matches iframe contentWindow
  - Validate message origin matches extension origin
  - Validate message type và data structure
- ⏰ **Timeout protection:**
  - Thêm 10s timeout cho lookup requests
  - Prevent hanging khi background script không respond
- 🧹 **Cleanup improvements:**
  - Clear debounce timers khi removePopup()
  - Proper cleanup của lastSelectedText state

**Popup.js improvements:**
- 🛡️ **Dimension validation:**
  - Check `isFinite()` cho width/height
  - Validate dimensions > 0 trước khi resize
- 🔍 **Better error handling:**
  - Try-catch blocks với detailed logging
  - Proper error messages cho users
  - Fallback handling cho API failures

---

## 🎨 UI/UX Improvements

### CSS Enhancements
- ✨ **Settings button** (`popup.css`):
  - Added `:active` state với `transform: scale(0.98)` cho visual feedback
  - Added `:focus-visible` cho keyboard navigation
  - Better Firefox compatibility với `-moz-user-select`

- 🖼️ **Iframe styling** (`content.css`):
  - Added `pointer-events: auto` để ensure interactivity
  - Added `-moz-user-select: none` cho Firefox

---

## 🧪 Testing Recommendations

### Test trên Firefox:
1. ✅ Click nút "Cài đặt tổng" trong popup tra cứu
2. ✅ Verify options page mở được
3. ✅ Test keyboard navigation (Tab + Enter)

### Test trên cả Chromium & Firefox:
1. ✅ Bôi đen text nhiều lần nhanh chóng
2. ✅ Verify không có popup duplicates
3. ✅ Click vào vùng trống, verify popup đóng đúng
4. ✅ Test với các selection rất ngắn (1-2 ký tự)
5. ✅ Test với các trang web có nhiều JavaScript events

### Regression testing:
1. ✅ Copy button vẫn hoạt động
2. ✅ Resize handle vẫn hoạt động
3. ✅ Theme switching vẫn hoạt động
4. ✅ Collapsible sections vẫn hoạt động

---

## 📋 Technical Details

### Files Modified:
1. **content.js** - 5 major improvements
   - Debounce mechanism cho selection
   - Enhanced message validation
   - Better cleanup logic
   
2. **popup.js** - 3 major improvements
   - Settings button fallback mechanism
   - Text validation
   - Dimension validation

3. **popup.css** - 2 improvements
   - Firefox-specific fixes
   - Enhanced button states

4. **content.css** - 1 improvement
   - Iframe interactivity fix

### Version Updates:
- `manifest.json`: 0.4.0 → 0.4.1
- `manifest.firefox.json`: 0.4.0 → 0.4.1
- `package.json`: 0.4.0 → 0.4.1

---

## 🚀 Deployment

### Build & Test:
```bash
npm run build:all
```

### Load trong browsers:
- **Chrome/Edge:** Load unpacked từ `dist/jadict-chrome-0.4.1/`
- **Firefox:** Load temporary từ `dist/jadict-firefox-0.4.1/`

---

## 📝 Known Limitations

Hiện tại không có known limitations mới. Tất cả major bugs đã được khắc phục.

---

## 🙏 Credits

Developed by Jacob (huuunleashed)

---

**Full Changelog:** See [CHANGELOG.md](./CHANGELOG.md)
