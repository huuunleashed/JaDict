# 🎉 JaDict v0.3 - Enhanced User Guide & Donation

## 📦 Download

**Chromium (Chrome, Edge, Brave, Opera):**
- Download: `jadict-chrome.zip` (from dist folder)
- Cài đặt: Giải nén → `chrome://extensions/` → Load unpacked

**Firefox/Zen Browser:**
- Download: `jadict-firefox.xpi` (from dist folder)
- Cài đặt: Kéo thả file `.xpi` vào Firefox

---

## ✨ Tính Năng Mới

### 📖 Hướng Dẫn API Key Chi Tiết
- **Tab Hướng dẫn được mở rộng** với section "Cấu hình Google Gemini API Key"
- **5 hình ảnh minh họa từng bước** từ README.md được tích hợp trực tiếp
- Hướng dẫn đầy đủ:
  - Bước 1: Tạo API Key miễn phí (3 sub-steps với screenshots)
  - Bước 2: Cấu hình Extension (4 sub-steps)
- **Notice boxes** với icon và màu phân biệt:
  - 🔒 Warning box (màu vàng) về bảo mật API key
  - 💰 Info box (màu xanh) về chi phí và quota
- **Code styling** cho API key format, URLs, và commands
- **Link trực tiếp** đến Google AI Studio: https://aistudio.google.com/apikey

### 💳 QR Code Donation
- **MoMo QR Code** được thêm vào tab Ủng hộ
- Hiển thị hình ảnh từ `logo/MoMo_QR.jpg`
- Text gợi ý: "Quét mã QR để ủng hộ qua MoMo"
- **Styling đặc biệt:**
  - Max-width 280px (desktop), 220px (mobile)
  - Border radius 12px với shadow
  - Hover effect: phóng to 1.05x với shadow tăng
  - Background trắng cố định (để QR code scan được trong dark mode)

### ❓ Nút Hướng Dẫn Nhanh (Quick Guide Button)
- **Nút "? Hướng dẫn"** mới trong action popup header
- Icon chấm hỏi `?` lớn và rõ ràng (18px, bold)
- **Vị trí:** Ngay đầu header, bên trái nút "Mở cài đặt tổng"
- **Styling nổi bật:**
  - Background màu accent (xanh dương) với text trắng
  - Box shadow để nổi bật
  - Hover effect: nút nâng lên với shadow tăng
- **Chức năng:** Click để mở tab mới với `options.html#guide`
- Giúp người dùng truy cập hướng dẫn nhanh chóng, không bị ẩn sâu

### 🔗 Hash Navigation (Deep Linking)
- **URL hash support** cho Options page
- Format: `options.html#guide`, `options.html#general`, `options.html#donate`
- **Auto-switch tab** khi mở URL với hash:
  - `options.html#guide` → tự động chuyển sang tab Hướng dẫn
  - `options.html#donate` → tự động chuyển sang tab Ủng hộ
- **JavaScript detection** trong `options.js`:
  - Đọc `window.location.hash`
  - Tìm tab button tương ứng
  - Trigger click để switch tab
- Hỗ trợ bookmarking và chia sẻ link trực tiếp đến tab cụ thể

---

## 💅 Cải Tiến UI/UX

### Options Page - Tab Hướng Dẫn
**Notice Boxes:**
- `.notice-warning` - Background vàng nhạt, border vàng, cho bảo mật
- `.notice-info` - Background xanh nhạt, border xanh, cho thông tin
- Responsive padding và margin
- Heading với màu tương ứng loại notice

**Typography & Styling:**
- `h3` - Font 20px, border-bottom accent, padding-bottom 8px
- `h4` - Font 16px, font-weight 600
- `code` - Background accent-soft, color accent, padding 2px 6px
- Links - Color accent với hover underline
- Lists - Nested lists với indent hợp lý

**Images:**
- `.guide-image` class cho tất cả screenshots
- Max-width 100%, height auto (responsive)
- Border radius 8px với border và shadow
- Margin 16px top/bottom
- Hiển thị đúng trong cả light và dark mode

### Action Popup Header
**Layout Redesign:**
- Header giờ có `border-bottom` để phân tách rõ ràng
- `.header-buttons` - Flexbox với gap 12px cho spacing đều
- Logo bên trái, buttons bên phải

**Button Styling:**
- Guide button: Primary style với icon + text
- Options button: Link style (text-only) với hover underline
- Tất cả buttons có transition smooth

### Dark Mode Enhancements
- QR code giữ background trắng (để scan được)
- Notice boxes có màu nền đậm hơn trong dark mode
- Guide images border color thích nghi theo theme
- Code blocks và links sử dụng CSS variables

---

## 🔧 Cải Tiến Kỹ Thuật

### Hash Navigation Implementation
```javascript
// options.js
const hash = window.location.hash.slice(1);
if (hash) {
  const targetButton = tabButtons.find(btn => btn.dataset.tabTarget === hash);
  if (targetButton) {
    targetButton.click();
  }
}
```

### Action Popup Guide Button
```javascript
// action.js
openGuideButton.addEventListener("click", () => {
  const optionsUrl = API.runtime.getURL("options.html#guide");
  API.tabs.create({ url: optionsUrl });
});
```

### CSS Architecture
- CSS variables cho tất cả colors và spacing
- Mobile-first responsive design
- Hover states với smooth transitions
- Dark mode overrides với `:root[data-theme="dark"]`

---

## 📚 Documentation Updates

### Options Page
- Tab Hướng dẫn tăng từ 2 cards lên 4 cards
- ~700 dòng HTML mới cho section API Key guide
- 5 images embedded từ GitHub CDN
- Notice boxes với 8 bullet points về bảo mật và chi phí

### CHANGELOG.md
- Thêm entry cho v0.3.0
- 4 items trong "Added" section
- 3 items trong "Improved" section

---

## 📊 File Changes

**Files mới:**
- `RELEASE_NOTES_v0.3.md` - Release notes cho v0.3

**Files cập nhật:**
- `manifest.json` - Version 0.3.0
- `manifest.firefox.json` - Version 0.3.0
- `package.json` - Version 0.3.0
- `action.html` - Thêm guide button
- `action.css` - Styling cho guide button và header
- `action.js` - Event listener cho guide button
- `options.html` - Thêm API key guide và QR code
- `options.css` - Styling cho guide images, notice boxes, QR code
- `options.js` - Hash navigation logic
- `CHANGELOG.md` - v0.3.0 changelog entry

**Files asset:**
- `logo/MoMo_QR.jpg` - QR code cho donation

**Thống kê:**
- 19 files changed
- 946 insertions(+), 28 deletions(-)
- 1 new release notes file

---

## 🐛 Known Issues

Không có bug nghiêm trọng nào được phát hiện trong v0.3.

---

## 📝 Upgrade Notes

Nếu bạn đang dùng v0.2.1:
1. Download bản v0.3.0 mới
2. Xóa extension v0.2.1 cũ (Settings sẽ được giữ lại)
3. Cài đặt v0.3.0 theo hướng dẫn
4. Tất cả settings (API key, theme, blacklist) sẽ tự động migrate
5. Thử click nút "? Hướng dẫn" trong action popup!

**Lưu ý đặc biệt:**
- Tab Hướng dẫn giờ có nội dung đầy đủ hơn rất nhiều
- QR code MoMo trong tab Ủng hộ giúp donate dễ dàng hơn
- Nút "? Hướng dẫn" giúp truy cập help nhanh chóng

---

## 💬 Support

- **Issues:** https://github.com/huuunleashed/JaDict/issues
- **Discussions:** https://github.com/huuunleashed/JaDict/discussions
- **Email:** huynhquochuu.huynh@gmail.com

---

## 🙏 Credits

Phát triển bởi **Huỳnh Quốc Hữu**

Ủng hộ qua MoMo: **0935725635**

Scan QR code trong tab Ủng hộ để donate nhanh! 💙

---

## 🔗 Links

- [GitHub Repository](https://github.com/huuunleashed/JaDict)
- [README.md](https://github.com/huuunleashed/JaDict/blob/main/README.md)
- [CHANGELOG.md](https://github.com/huuunleashed/JaDict/blob/main/CHANGELOG.md)

---

**Full Changelog**: https://github.com/huuunleashed/JaDict/compare/v0.2.1...v0.3.0
