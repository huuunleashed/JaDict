# 📝 Hướng dẫn Giải quyết vấn đề Privacy Policy cho Chrome Web Store

## ❌ Vấn đề
Extension JaDict v0.3.0 bị từ chối với lỗi:
- **Violation:** Privacy policy link is broken or unavailable
- **Routing ID:** FZSL
- **Violation Reference:** Purple Nickel

## ✅ Giải pháp đã thực hiện

### 1. Đã thêm Privacy Policy URL vào manifest.json
```json
"privacy_policy": {
  "url": "https://raw.githubusercontent.com/huuunleashed/JaDict/main/docs/PRIVACY_POLICY.md"
}
```

### 2. Đã thêm homepage_url
```json
"homepage_url": "https://github.com/huuunleashed/JaDict"
```

### 3. File Privacy Policy có sẵn tại:
- **Markdown:** `docs/PRIVACY_POLICY.md`
- **Text:** `docs/PRIVACY_POLICY.txt`
- **URL công khai:** https://raw.githubusercontent.com/huuunleashed/JaDict/main/docs/PRIVACY_POLICY.md

---

## 🚀 Các bước Submit lại Extension (Version 0.4.1)

### Bước 1: Commit và Push thay đổi lên GitHub

```bash
# Thêm các file đã chỉnh sửa
git add manifest.json
git add manifest.firefox.json
git add docs/PRIVACY_POLICY.txt

# Commit với message rõ ràng
git commit -m "Add privacy policy URL to manifest for Chrome Web Store compliance (v0.4.1)"

# Push lên GitHub
git push origin main
```

### Bước 2: Xác nhận Privacy Policy URL hoạt động

Mở trình duyệt và kiểm tra URL này có hoạt động không:
- https://raw.githubusercontent.com/huuunleashed/JaDict/main/docs/PRIVACY_POLICY.md

URL này phải:
- ✅ Trả về nội dung Privacy Policy (không phải 404)
- ✅ Công khai (không cần đăng nhập)
- ✅ Định dạng text/plain hoặc text/markdown

### Bước 3: Build Extension cho Chrome

```bash
npm run build:chrome
```

File output: `dist/jadict-chrome-v0.4.1.zip`

### Bước 4: Submit lên Chrome Web Store

1. **Truy cập Chrome Web Store Developer Dashboard:**
   - https://chrome.google.com/webstore/devconsole
   - Đăng nhập với tài khoản đã đăng ký extension

2. **Chọn extension JaDict:**
   - Item ID: `kdlfloagfooabmlopkgknoefkoidpkha`

3. **Upload bản build mới:**
   - Click "Package" tab
   - Upload file `dist/jadict-chrome-v0.4.1.zip`

4. **Điền thông tin quan trọng:**
   
   **Privacy Practices Section:**
   - ✅ Tick vào: "This extension does NOT collect user data"
   - Hoặc tick các mục phù hợp nếu có thu thập dữ liệu
   
   **Privacy Policy URL:**
   - Điền: `https://raw.githubusercontent.com/huuunleashed/JaDict/main/docs/PRIVACY_POLICY.md`
   - Hoặc: `https://github.com/huuunleashed/JaDict/blob/main/docs/PRIVACY_POLICY.md`

5. **Giải trình về permissions:**
   
   Trong phần "Justification for permissions", giải thích:
   
   ```
   - storage, unlimitedStorage: Store offline dictionary database (~5MB) 
     and user preferences locally
   - clipboardWrite: Allow users to copy definitions to clipboard
   - tabs: Detect active tab for context menu integration
   - <all_urls>: Enable dictionary lookup on any webpage user visits
   
   All data is stored locally. No data is transmitted to external servers 
   except when users explicitly enable AI features using their own Google 
   Gemini API key.
   ```

6. **Submit for review:**
   - Review tất cả thông tin
   - Click "Submit for review"

---

## 📋 Checklist trước khi Submit

- [x] Version number đã tăng lên 0.4.1
- [x] Privacy Policy URL đã được thêm vào manifest.json
- [x] Privacy Policy file đã được push lên GitHub
- [x] Privacy Policy URL hoạt động và công khai
- [x] Extension đã được build thành công
- [ ] Đã test extension trên Chrome để đảm bảo hoạt động
- [ ] Đã điền đầy đủ thông tin Privacy Practices
- [ ] Đã giải trình permissions rõ ràng

---

## 🔍 Nếu vẫn bị từ chối

### Option 1: Sử dụng GitHub Pages (recommended)

GitHub Pages sẽ render markdown đẹp hơn và có thể dễ được chấp nhận hơn:

1. **Enable GitHub Pages:**
   - Vào Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/docs`
   - Save

2. **Privacy Policy URL sẽ là:**
   ```
   https://huuunleashed.github.io/JaDict/PRIVACY_POLICY
   ```

3. **Update lại manifest.json:**
   ```json
   "privacy_policy": {
     "url": "https://huuunleashed.github.io/JaDict/PRIVACY_POLICY"
   }
   ```

### Option 2: Tạo trang Privacy Policy riêng

Nếu bạn có website/domain riêng, host Privacy Policy ở đó sẽ professional hơn.

### Option 3: Appeal (Khiếu nại)

Nếu bạn tin rằng extension không vi phạm:
- Submit appeal form (link trong email từ chối)
- Giải thích rõ ràng về privacy practices
- Đính kèm link Privacy Policy

---

## 📞 Liên hệ Chrome Web Store Support

Nếu cần hỗ trợ thêm:
- **Forum:** https://groups.google.com/a/chromium.org/g/chromium-extensions
- **Support:** https://support.google.com/chrome_webstore/contact/dev_support

---

## 📊 Timeline dự kiến

- **Submit:** Ngay sau khi push lên GitHub
- **Review:** 1-3 ngày làm việc (có thể lâu hơn)
- **Publication:** Ngay sau khi được approve

---

## ✨ Tips để tránh bị từ chối

1. **Privacy Policy phải:**
   - Rõ ràng và dễ hiểu
   - Liệt kê tất cả permissions và lý do sử dụng
   - Giải thích cách xử lý dữ liệu người dùng
   - Có thông tin liên hệ

2. **Permissions phải:**
   - Tối thiểu hóa (chỉ xin những gì cần)
   - Được giải thích rõ ràng
   - Phù hợp với chức năng extension

3. **Manifest phải:**
   - Có privacy_policy URL
   - Có homepage_url
   - Description rõ ràng

4. **Extension phải:**
   - Hoạt động đúng như mô tả
   - Không có hidden features
   - Không inject ads hoặc tracking scripts

---

## 🎉 Sau khi được approve

1. Thông báo cho users về version mới
2. Update README.md với badge Chrome Web Store
3. Tạo release notes chi tiết
4. Monitor reviews và feedback

---

Chúc bạn thành công! 🚀
