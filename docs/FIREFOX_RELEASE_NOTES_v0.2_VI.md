# JaDict v0.2 - Release Notes (Tiếng Việt)

## Phiên bản 0.2 - Cập nhật UI/UX lớn

### Tính năng mới

**🎛️ Action Popup**
Click vào biểu tượng extension để mở popup quản lý nhanh. Bật/tắt JaDict toàn bộ hoặc theo từng trang, đổi theme, quản lý API key Gemini mà không cần mở trang cài đặt.

**🌓 Giao diện Sáng/Tối**
Chọn theme sáng hoặc tối, tự động đồng bộ trên tất cả các phần của extension (popup tra từ, action popup, trang options). Giảm mỏi mắt khi đọc ban đêm.

**📑 Trang Options nâng cấp**
Thiết kế lại với 3 tab rõ ràng:
- Cài đặt: Toggle toàn cục, chọn theme, cấu hình API, tùy chỉnh kết quả
- Hướng dẫn: 4 bước sử dụng nhanh và mẹo hữu ích
- Ủng hộ: Thông tin tác giả và tài khoản MoMo

**🚫 Danh sách chặn trang web**
Quản lý danh sách các trang web không muốn JaDict hoạt động. Thêm qua trang options hoặc tắt nhanh theo từng trang qua action popup.

**🎚️ Giới hạn từ gợi ý**
Tùy chỉnh số từ đồng nghĩa và trái nghĩa hiển thị (0-20, mặc định: 5) để tối ưu không gian popup và giảm thông tin dư thừa.

**⚙️ Nút cài đặt nhanh**
Mỗi popup tra từ có nút "Cài đặt tổng" để truy cập nhanh trang options đầy đủ.

### Cải tiến kỹ thuật

- Module `settings.js` quản lý cấu hình tập trung
- Đồng bộ theme real-time qua storage listeners
- CSS variables cho việc chuyển theme hiệu quả
- Thêm permission `tabs` để kiểm soát theo trang
- Tối ưu manifest v2 cho Firefox

### Sửa lỗi

- Sửa lỗi encoding với văn bản tiếng Việt
- Cải thiện vị trí và resize popup
- Tăng độ tin cậy của storage

### Tài liệu

- README đầy đủ với phần FAQ
- Documentation chi tiết cho từng tính năng
- CHANGELOG cập nhật lịch sử phiên bản

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

**Changelog đầy đủ**: https://github.com/huuunleashed/JaDict/blob/main/CHANGELOG.md
**Mã nguồn**: https://github.com/huuunleashed/JaDict
**Báo lỗi**: https://github.com/huuunleashed/JaDict/issues
