# 🎉 JaDict v0.2 - Major UI/UX Update

## 📦 Download

**Chromium (Chrome, Edge, Brave, Opera):**
- Download: `jadict-chrome.zip` (from dist folder)
- Cài đặt: Giải nén → `chrome://extensions/` → Load unpacked

**Firefox/Zen Browser:**
- Download: `jadict-firefox.xpi` (from dist folder)
- Cài đặt: Kéo thả file `.xpi` vào Firefox

---

## ✨ Tính Năng Mới

### 🎛️ Action Popup
- Click icon extension để mở popup quản lý nhanh
- Bật/tắt JaDict toàn bộ hoặc theo từng trang web
- Chuyển theme sáng/tối ngay lập tức
- Nhập API key và chọn model Gemini trực tiếp
- Nút "Mở cài đặt tổng" để truy cập Options page

### 🌓 Theme System (Sáng/Tối)
- **Theme sáng:** Giao diện truyền thống với màu nền trắng, dễ đọc ban ngày
- **Theme tối:** Màu nền tối giảm mỏi mắt, tiết kiệm pin OLED
- Đồng bộ tự động giữa popup tra cứu, action popup và options page
- Chuyển theme ở bất kỳ đâu, áp dụng mọi nơi

### 📑 Options Page - 3 Tabs
**Tab Cài đặt:**
- Toggle bật/tắt extension toàn bộ
- Chọn theme (sáng/tối)
- Cấu hình Gemini API (key + model)
- **Tùy chỉnh kết quả:** Giới hạn số từ đồng nghĩa/trái nghĩa (0-20)
- **Danh sách chặn:** Quản lý blacklist domain

**Tab Hướng dẫn:**
- 4 bước sử dụng nhanh
- 3 mẹo hữu ích

**Tab Ủng hộ:**
- Thông tin tác giả và tài khoản MoMo

### 🚫 Blacklist Management
- Thêm domain vào blacklist để tắt JaDict trên trang cụ thể
- Quản lý danh sách với nút "Bỏ" cho từng domain
- Cách nhanh: Tắt toggle "Bật JaDict trên trang này" trong action popup

### 🎚️ Synonym/Antonym Limits
- Giới hạn số từ đồng nghĩa hiển thị (0-20, mặc định: 5)
- Giới hạn số từ trái nghĩa hiển thị (0-20, mặc định: 5)
- Set 0 để ẩn hoàn toàn, set 20 để hiển thị tối đa
- Giúp tối ưu không gian popup khi tra từ

### ⚙️ Settings Button in Popup
- Mỗi popup tra cứu có nút "Cài đặt tổng"
- Click để mở Options page ngay lập tức
- Không cần right-click icon extension

---

## 🔧 Cải Tiến Kỹ Thuật

### Shared Settings Module
- File `settings.js` quản lý cấu hình tập trung
- API đồng nhất cho background, action, options, popup
- Validation và normalization tự động
- Type-safe với JSDoc comments

### Theme Sync Architecture
- Theme được lưu trong `chrome.storage.local`
- `storage.onChanged` listener sync real-time
- CSS variables cho dark/light mode
- Popup nhận theme qua URL parameter

### Permission Updates
- Thêm `tabs` permission để lấy hostname hiện tại
- `web_accessible_resources` bao gồm tất cả CSS/JS cần thiết

---

## 📚 Documentation Updates

### README.md
- Thêm 4 categories trong "Tính năng nổi bật"
- Documentation đầy đủ cho action popup, options page, theme
- FAQ section với 8 câu hỏi thường gặp
- Cập nhật screenshots và examples
- Hướng dẫn blacklist và synonym/antonym limits

### CHANGELOG.md
- Thêm entry cho v0.2 với danh sách tính năng
- Format theo chuẩn Keep a Changelog

---

## 📊 File Changes

**Files mới:**
- `action.html` - Action popup UI
- `action.css` - Action popup styles
- `action.js` - Action popup logic
- `settings.js` - Shared settings module

**Files cập nhật:**
- `manifest.json` - Version 0.2, action popup, permissions
- `content.js` - Blacklist logic, theme parameter
- `popup.html/css/js` - Theme support, settings button
- `options.html/css/js` - Complete redesign với 3 tabs
- `package.json` - Version 0.2.0
- `README.md` - Comprehensive v0.2 docs
- `CHANGELOG.md` - v0.2 changelog entry

**Thống kê:**
- 15 files changed
- 1,923 insertions(+), 234 deletions(-)
- 4 new files created

---

## 🐛 Known Issues

Không có bug nghiêm trọng nào được phát hiện trong v0.2.

---

## 📝 Upgrade Notes

Nếu bạn đang dùng v0.1:
1. Download bản v0.2 mới
2. Xóa extension v0.1 cũ (Settings sẽ được giữ lại)
3. Cài đặt v0.2 theo hướng dẫn
4. API key và settings sẽ tự động migrate

---

## 💬 Support

- **Issues:** https://github.com/huuunleashed/JaDict/issues
- **Discussions:** https://github.com/huuunleashed/JaDict/discussions
- **Email:** (thêm email của bạn nếu có)

---

## 🙏 Credits

Phát triển bởi **Huỳnh Quốc Hữu**

Ủng hộ qua MoMo: **0935725635**

---

## 🔗 Links

- [GitHub Repository](https://github.com/huuunleashed/JaDict)
- [README.md](https://github.com/huuunleashed/JaDict/blob/main/README.md)
- [CHANGELOG.md](https://github.com/huuunleashed/JaDict/blob/main/CHANGELOG.md)

---

**Full Changelog**: https://github.com/huuunleashed/JaDict/compare/v0.1...v0.2
