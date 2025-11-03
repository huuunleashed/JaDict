# 🚀 Hướng dẫn tạo GitHub Release cho v0.4.1

## ✅ Đã hoàn thành:
- [x] Code đã commit
- [x] Tag v0.4.1 đã tạo và push
- [x] Build files đã sẵn sàng trong `dist/`

## 📝 Bước tiếp theo: Tạo GitHub Release

### Cách 1: Qua GitHub Web Interface (Khuyên dùng)

1. **Mở GitHub Repository:**
   ```
   https://github.com/huuunleashed/JaDict/releases/new
   ```

2. **Điền thông tin:**
   - **Tag version:** Chọn `v0.4.1` từ dropdown
   - **Release title:** `v0.4.1 - Giao diện tìm kiếm mới + Sửa lỗi ổn định`
   - **Description:** Copy nội dung từ file `RELEASE_COMBINED_v0.4.1.md` (gộp v0.4.0 + v0.4.1)

3. **Upload Assets:**
   Kéo thả các file sau vào phần "Attach binaries":
   - `dist/jadict-chrome.zip` (cho Chrome/Edge)
   - `dist/jadict-firefox.zip` (cho Firefox/Zen Browser)
   - `dist/jadict-firefox.xpi` (Firefox Add-on format)

4. **Options:**
   - [ ] Set as pre-release (không tick)
   - [x] Set as the latest release (tick)
   - [ ] Create a discussion for this release (tùy chọn)

5. **Publish:**
   Click nút "Publish release"

---

### Cách 2: Dùng GitHub CLI (Nếu cài đặt)

```bash
# Install GitHub CLI first (nếu chưa có)
# Windows: winget install --id GitHub.cli

# Create release
gh release create v0.4.1 `
  --title "v0.4.1 - Giao diện tìm kiếm mới + Sửa lỗi ổn định" `
  --notes-file RELEASE_COMBINED_v0.4.1.md `
  dist/jadict-chrome.zip `
  dist/jadict-firefox.zip `
  dist/jadict-firefox.xpi
```

---

## 📋 Release Description (Copy vào GitHub)

⚠️ **LƯU Ý:** Vì chưa release v0.4.0, release này sẽ gộp cả v0.4.0 + v0.4.1

Xem nội dung đầy đủ trong file: `RELEASE_COMBINED_v0.4.1.md`

### 🎯 Điểm nổi bật:

**Tính năng mới (v0.4.0):**
- 🔍 Giao diện tìm kiếm mới với 3 tabs (Dictionary, Chatbot, History)
- 💬 AI Chatbot với ngữ cảnh hội thoại
- 📚 Hệ thống lưu lịch sử tra cứu và chat
- 📖 Từ điển song ngữ hoàn chỉnh (Anh-Việt & Việt-Anh)
- 🎨 UI/UX được cải tiến toàn diện

**Sửa lỗi (v0.4.1):**
- ✅ Firefox/Zen Browser: Nút settings không bấm được
- ✅ Popup tự hiện và quay mòng mòng
- 🔒 Cải thiện bảo mật & ổn định

Copy toàn bộ nội dung từ file `RELEASE_COMBINED_v0.4.1.md` vào phần description của GitHub Release.

---

## ✅ Checklist trước khi Publish

- [ ] Tag v0.4.1 đã tồn tại trên GitHub
- [ ] Files đã upload: chrome.zip, firefox.zip, firefox.xpi
- [ ] Release title và description đã điền
- [ ] "Set as latest release" đã tick
- [ ] Preview để check formatting

---

## 🔗 Quick Links

- Repository: https://github.com/huuunleashed/JaDict
- Create Release: https://github.com/huuunleashed/JaDict/releases/new
- Tags: https://github.com/huuunleashed/JaDict/tags
- Releases: https://github.com/huuunleashed/JaDict/releases

---

## 📝 Notes

- Release notes có thể edit sau khi publish
- Assets có thể thêm/xóa sau khi publish
- Users sẽ nhận notification về release mới (nếu watch repo)

