# 🚀 JaDict v0.4.1 - Giao diện tìm kiếm mới + Sửa lỗi ổn định

**Ngày phát hành:** 3 tháng 11, 2025

---

## 🎯 Tổng quan

Phiên bản v0.4.1 bao gồm **tất cả tính năng mới của v0.4.0** cùng với các **bản sửa lỗi quan trọng** về độ ổn định và khả năng tương thích với Firefox/Zen Browser.

---

## ✨ Tính năng mới (v0.4.0)

### 🔍 Giao diện tìm kiếm chính mới
- **Thanh tìm kiếm tích hợp** trong action popup
- **3 tab chính:**
  - 📖 **Dictionary (Từ điển):** Tra cứu từ song ngữ (Anh-Việt & Việt-Anh)
  - 💬 **Chatbot:** Trò chuyện với AI, hỏi đáp về ngôn ngữ
  - 📚 **History (Lịch sử):** Xem lại các tìm kiếm và hội thoại gần đây

### 💬 AI Chatbot với ngữ cảnh hội thoại
- Trò chuyện liên tục với AI, có nhớ ngữ cảnh
- Hỏi về ngữ pháp, cách dùng từ, giải thích câu phức tạp
- Xóa lịch sử hội thoại theo tab
- Tự động lưu ngữ cảnh để tiếp tục sau

### 📚 Hệ thống lưu lịch sử
- **Lịch sử tra cứu:** Tất cả từ đã tra gần đây
- **Lịch sử chatbot:** Các cuộc hội thoại đã lưu
- Tìm kiếm nhanh trong lịch sử
- Xóa từng mục hoặc xóa toàn bộ

### 📖 Từ điển song ngữ hoàn chỉnh
- **Anh → Việt:** Tra từ tiếng Anh
- **Việt → Anh:** Tra từ tiếng Việt (tự động detect)
- Hiển thị định nghĩa, ví dụ, từ đồng nghĩa/trái nghĩa
- Dịch câu với AI (nếu có API key)

### 🎨 UI/UX cải tiến
- **Toggle switches hiện đại** cho On/Off và Dark/Light mode
- **Tabs navigation** mượt mà với icons đẹp
- **Dark mode** được polish lại với màu sắc hài hòa hơn
- Footer hiển thị version number
- Responsive, hoạt động mượt trên mọi kích thước

### 📄 Hỗ trợ PDF (Cải thiện)
- Bôi đen text trong PDF và tra cứu ngay
- Hoạt động trên Chrome, Firefox, Edge

---

## 🐛 Sửa lỗi quan trọng (v0.4.1)

### ✅ Firefox/Zen Browser: Nút "Cài đặt tổng" không bấm được

**Vấn đề:** Nút "Cài đặt tổng" trong popup tra cứu không hoạt động khi click trên Firefox và Zen Browser.

**Giải pháp:**
- 📡 **PostMessage communication pattern** - Bypass iframe restrictions hoàn toàn
- 🎯 **Multi-event strategy** - Bắt sự kiện click, mouseup, touchend với capture phase
- 🎨 **CSS được cải thiện** - pointer-events: auto, vùng bấm lớn hơn (100px × 32px)
- 🔄 **3 cách fallback** - PostMessage → openOptionsPage() → tabs.create()
- ⚙️ **Icon mới** - Thêm icon bánh răng cho dễ nhận biết

### ✅ Popup tự hiện và quay mòng mòng

**Vấn đề:** Popup đôi khi tự xuất hiện với loader spinning mà không có lý do, xảy ra trên tất cả trình duyệt.

**Giải pháp:**
- ⏱️ **Debounce mechanism (50ms)** - Tránh trigger liên tục khi bôi đen nhanh
- ✔️ **Validation chặt chẽ hơn:**
  - Check `selection.isCollapsed` - đảm bảo có selection thật sự
  - Check `rangeCount > 0` và `rect dimensions > 0`
  - Kiểm tra độ dài text > 0 trước khi tra cứu
- 🔒 **Tránh duplicate popups:**
  - Track text đã chọn trước đó (`lastSelectedText`)
  - Skip nếu popup đã tồn tại với cùng text
- ⏰ **Timeout bảo vệ (10 giây)** - Tránh treo nếu API không response

### 🔒 Cải thiện bảo mật & ổn định

**Content.js:**
- ✨ **Origin validation** - Kiểm tra nguồn gốc message trong postMessage handler
- 🔍 **Validation message** - Kiểm tra type, structure, dimensions của message
- 🧹 **Cleanup tốt hơn** - Clear debounce timers đúng cách khi đóng popup

**Popup.js:**
- 🛡️ **Dimension validation** - Check `isFinite()` cho width/height
- 🔍 **Error handling tốt hơn** - Try-catch blocks với logging chi tiết
- 📝 **Error messages rõ ràng** - Thông báo lỗi dễ hiểu cho người dùng

**Background.js:**
- 🎯 **Handler mới** - `OPEN_OPTIONS_PAGE` handler cho cross-context communication
- 🔄 **Fallback chain** - Nhiều cách dự phòng để mở options page

---

## 🎨 Cải thiện giao diện

### Settings Button
- ⚙️ Icon bánh răng rõ ràng hơn
- 👆 Visual feedback khi bấm (scale animation)
- ♿ Hỗ trợ bàn phím (phím Enter/Space)
- 🎯 States tốt hơn: hover, active, focus-visible

### CSS Enhancements
- `pointer-events: auto !important` - Đảm bảo button luôn clickable
- `touch-action: manipulation` - Hỗ trợ touch devices tốt hơn
- Larger hit area cho button (min 100px × 32px)
- Firefox-specific fixes với `-moz-user-select`

---

## 📦 Cài đặt

### Chrome/Edge
1. Tải file `jadict-chrome.zip` từ Assets bên dưới
2. Giải nén file zip
3. Mở `chrome://extensions/`
4. Bật "Developer mode" (chế độ nhà phát triển)
5. Click "Load unpacked" và chọn thư mục đã giải nén

### Firefox/Zen Browser
1. Tải file `jadict-firefox.zip` từ Assets bên dưới
2. Giải nén file zip
3. Mở `about:debugging#/runtime/this-firefox`
4. Click "Load Temporary Add-on"
5. Chọn file `manifest.json` trong thư mục đã giải nén

---

## 🧪 Đã kiểm tra

Tất cả kịch bản test chính đã được xác nhận:
- ✅ Firefox/Zen Browser: Nút settings hoạt động
- ✅ Không có popup tự xuất hiện
- ✅ Bôi đen liên tục không gây lỗi
- ✅ Click trong popup không đóng popup
- ✅ Nút copy hoạt động
- ✅ Resize handle hoạt động
- ✅ Chuyển theme mượt mà
- ✅ Bật/tắt extension hoạt động
- ✅ Tab Dictionary, Chatbot, History đều hoạt động
- ✅ Lưu lịch sử tra cứu và chatbot

---

## 📁 Files thay đổi

### Core Files (12 files modified):
- `popup.js`, `content.js`, `background.js`
- `popup.css`, `content.css`, `popup.html`
- `action.js`, `action.html`, `action.css`
- `search-popup.js`, `search-popup.html`, `search-popup.css`
- `manifest.json`, `manifest.firefox.json`, `package.json`

### New Files (v0.4.0):
- `history.js` - Quản lý lịch sử tra cứu và chatbot
- `search-popup.html` - Giao diện search results
- `docs/ARCHITECTURE_v0.4.md` - Kiến trúc v0.4
- `docs/TESTING_GUIDE_v0.4.md` - Hướng dẫn test v0.4

### Documentation (v0.4.1):
- `docs/RELEASE_NOTES_v0.4.1.md` - Release notes chi tiết
- `docs/TESTING_GUIDE_v0.4.1.md` - Hướng dẫn test v0.4.1
- `docs/ZEN_BROWSER_FIX.md` - Technical notes về fix Zen Browser
- `docs/CHANGELOG.md` - Cập nhật changelog

---

## 🔧 Chi tiết kỹ thuật

### PostMessage Communication Flow
```
User click nút "Cài đặt"
    ↓
Popup.js gửi postMessage('QUICK_DICT_OPEN_SETTINGS')
    ↓
Content.js nhận và forward đến Background.js
    ↓
Background.js mở options page
    ↓
Thành công!
```

### Debounce Mechanism
```javascript
// Debounce 50ms để tránh race conditions
selectionDebounceTimer = setTimeout(() => {
  if (selection.isCollapsed) return;
  if (selectedText === lastSelectedText) return;
  createPopup(selectedText, rect);
}, 50);
```

### History Storage
```javascript
// Lưu vào localStorage với structure:
{
  recentSearches: [
    { query: "hello", result: {...}, timestamp: 1699... },
    ...
  ],
  chatContexts: {
    tabId: [
      { role: "user", content: "..." },
      { role: "assistant", content: "..." }
    ]
  }
}
```

---

## 📝 Known Issues

Không có! Tất cả issues đã được sửa trong phiên bản này.

---

## 🙏 Cảm ơn

Cảm ơn tất cả users đã báo cáo issues và giúp test các bản fix, đặc biệt là việc phát hiện vấn đề tương thích với Zen Browser.

---

## 📖 Tài liệu

- [Changelog đầy đủ](./docs/CHANGELOG.md)
- [Release Notes v0.4.1](./docs/RELEASE_NOTES_v0.4.1.md)
- [Testing Guide v0.4.1](./docs/TESTING_GUIDE_v0.4.1.md)
- [Zen Browser Fix - Technical Notes](./docs/ZEN_BROWSER_FIX.md)
- [Architecture v0.4](./docs/ARCHITECTURE_v0.4.md)

---

**Changelog:** [v0.3.1...v0.4.1](https://github.com/huuunleashed/JaDict/compare/v0.3.1...v0.4.1)
