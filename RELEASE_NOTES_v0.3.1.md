# 🐛 JaDict v0.3.1 - Critical Bugfixes

## 📦 Download

**Chromium (Chrome, Edge, Brave, Opera):**
- Download: `jadict-chrome.zip` (from dist folder)
- Cài đặt: Giải nén → `chrome://extensions/` → Load unpacked

**Firefox/Zen Browser:**
- Download: `jadict-firefox.xpi` (from dist folder)
- Cài đặt: Kéo thả file `.xpi` vào Firefox

---

## 🐛 Critical Bugfixes

### 🔴 **Extension Không Kết Nối Được với API** (Critical)
- **Vấn đề:** Firefox báo lỗi "Could not establish connection. Receiving end does not exist"
- **Vấn đề:** Chrome popup loading vô tận (spinner quay mãi)
- **Nguyên nhân:** 
  - `popup.js` gửi message không đúng cách, thiếu error handling
  - `background.js` gọi function `refreshExtensionSettingsCache()` không tồn tại → crash
  - Firefox manifest thiếu `settings.js` trong background scripts
- **Giải pháp:**
  - Cải thiện message handling với Promise wrapper và `runtime.lastError` check
  - Xóa function call lỗi
  - Thêm `settings.js` vào background scripts array (Firefox)
  - Thêm `dictionary.json` vào web accessible resources

### 🎨 **UI/UX Improvements**

#### ✨ Divider Giữa Các Nghĩa
- **Vấn đề:** Giao diện chật chội khi có nhiều nghĩa khác nhau
- **Giải pháp:** 
  - Thêm divider (đường kẻ dashed) giữa mỗi nghĩa
  - Border 2px dashed, margin 16px, opacity 100%
  - Class `sense-divider` được thêm vào sanitizer whitelist
- **Hiệu quả:** Dễ phân biệt các nghĩa, giao diện thoáng hơn

#### 📝 Hiển Thị "Từ Trái Nghĩa" (Antonyms)
- **Vấn đề:** Gemini không trả về antonyms trong response
- **Nguyên nhân:** Schema không bắt buộc, prompt không đủ chi tiết
- **Giải pháp:**
  - Bắt buộc `synonyms` và `antonyms` trong JSON schema
  - Cải thiện prompt với hướng dẫn chi tiết cách tìm antonyms
  - Cung cấp examples cụ thể cho 3 loại từ (adjective, verb, noun)
- **Kết quả:** Antonyms giờ hiển thị đầy đủ cho hầu hết các từ

---

## 🔧 Technical Changes

### Files Modified:
1. **`popup.js`**
   - Cải thiện `requestLookup()` với Promise wrapper
   - Check `API.runtime.lastError` properly
   - Thêm `'sense-divider'` vào `ALLOWED_CLASSES`

2. **`background.js`**
   - Xóa call `refreshExtensionSettingsCache()` không tồn tại
   - Thêm debug logging (có thể remove sau)
   - Schema: Bắt buộc `synonyms` và `antonyms` fields
   - Prompt: Cải thiện với SCHEMA REQUIREMENTS và HOW TO FIND ANTONYMS sections

3. **`popup.css`**
   - Thêm `.sense-divider` styling (2px dashed, margin 16px)

4. **`manifest.json`** (Chrome/Chromium)
   - Version: 0.3.0 → 0.3.1
   - Thêm `dictionary.json` vào web_accessible_resources

5. **`manifest.firefox.json`** (Firefox)
   - Version: 0.3.0 → 0.3.1
   - Thêm `settings.js` vào background scripts array
   - Thêm `dictionary.json` vào web_accessible_resources

6. **`package.json`**
   - Version: 0.3.0 → 0.3.1

7. **`CHANGELOG.md`**
   - Thêm entry cho v0.3.1 với bugfixes

---

## 📊 Statistics

- **7 files modified**
- **~150 lines changed**
- **3 critical bugs fixed**
- **2 UI improvements added**

---

## 📝 Upgrade Notes

### Từ v0.3.0 → v0.3.1:

**Chrome/Edge/Brave:**
1. Mở `chrome://extensions/`
2. Tìm JaDict → Click **Remove**
3. Download `jadict-chrome.zip` mới
4. Giải nén và load unpacked
5. Settings (API key, theme, blacklist) sẽ được giữ nguyên

**Firefox:**
1. Mở `about:addons`
2. Tìm JaDict → Click **Remove**
3. Download `jadict-firefox.xpi` mới
4. Kéo thả vào Firefox để cài đặt
5. Settings sẽ tự động migrate

**Lưu ý:**
- Extension giờ hoạt động ổn định trên cả Chrome và Firefox
- Divider giúp UI rõ ràng hơn khi tra từ có nhiều nghĩa
- Antonyms giờ hiển thị đầy đủ (nếu từ có antonyms)

---

## 🐛 Known Issues

Không có bug nghiêm trọng nào trong v0.3.1.

**Minor:**
- Debug logs vẫn còn trong console (sẽ remove ở version sau nếu cần)

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

**Full Changelog**: https://github.com/huuunleashed/JaDict/compare/v0.3.0...v0.3.1
