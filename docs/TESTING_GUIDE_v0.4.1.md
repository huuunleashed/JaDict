# Testing Guide v0.4.1 - Stability & Firefox Compatibility

## 🎯 Testing Focus Areas

Release này tập trung vào 2 bug chính:
1. **Firefox: Nút "Cài đặt tổng" không bấm được**
2. **Popup tự hiện và quay mòng mòng**

---

## ✅ Pre-Testing Setup

### 1. Build Extension
```bash
npm run build:all
```

### 2. Load Extension

**Chrome/Edge:**
1. Mở `chrome://extensions/`
2. Bật "Developer mode"
3. Click "Load unpacked"
4. Chọn folder `dist/jadict-chrome-0.4.1/`

**Firefox:**
1. Mở `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Chọn file `dist/jadict-firefox-0.4.1/manifest.json`

---

## 🧪 Test Cases

### Test Group 1: Firefox Settings Button Fix

**Trình duyệt:** Firefox only

#### TC1.1: Basic Settings Button Click
- [ ] 1. Bôi đen bất kỳ text nào trên trang web
- [ ] 2. Popup tra cứu xuất hiện
- [ ] 3. Click nút "Cài đặt tổng"
- [ ] 4. **Expected:** Options page mở ra
- [ ] 5. **Expected:** Không có error trong console

#### TC1.2: Keyboard Navigation
- [ ] 1. Bôi đen text để hiện popup
- [ ] 2. Press Tab nhiều lần để focus vào nút "Cài đặt tổng"
- [ ] 3. **Expected:** Button có outline/focus state
- [ ] 4. Press Enter hoặc Space
- [ ] 5. **Expected:** Options page mở ra

#### TC1.3: Rapid Clicks
- [ ] 1. Bôi đen text để hiện popup
- [ ] 2. Click nút "Cài đặt tổng" nhiều lần nhanh chóng (5+ clicks)
- [ ] 3. **Expected:** Options page chỉ mở 1 lần
- [ ] 4. **Expected:** Không có duplicate tabs

#### TC1.4: Visual Feedback
- [ ] 1. Bôi đen text để hiện popup
- [ ] 2. Hover mouse lên nút "Cài đặt tổng"
- [ ] 3. **Expected:** Background color thay đổi (hover state)
- [ ] 4. Click và giữ nút
- [ ] 5. **Expected:** Button có hiệu ứng scale nhỏ lại (active state)

---

### Test Group 2: Popup Auto-Show Bug Fix

**Trình duyệt:** Chrome, Edge, Firefox (all)

#### TC2.1: Normal Selection
- [ ] 1. Mở bất kỳ trang web nào
- [ ] 2. Bôi đen một đoạn text
- [ ] 3. **Expected:** Popup xuất hiện với nội dung tra cứu
- [ ] 4. **Expected:** KHÔNG có loader spinning vô tận
- [ ] 5. Click vào vùng trống
- [ ] 6. **Expected:** Popup đóng lại

#### TC2.2: Rapid Selection Changes
- [ ] 1. Bôi đen text A
- [ ] 2. Ngay lập tức bôi đen text B (không đợi)
- [ ] 3. Ngay lập tức bôi đen text C
- [ ] 4. **Expected:** Chỉ có 1 popup cuối cùng (text C)
- [ ] 5. **Expected:** KHÔNG có multiple popups
- [ ] 6. **Expected:** KHÔNG có popup trống spinning

#### TC2.3: Empty/Accidental Selection
- [ ] 1. Click chuột vào text (nhưng không kéo)
- [ ] 2. **Expected:** KHÔNG có popup xuất hiện
- [ ] 3. Kéo chuột 1-2 pixels (selection rất ngắn)
- [ ] 4. **Expected:** KHÔNG có popup xuất hiện
- [ ] 5. Bôi đen text rồi Ctrl+A (Select All)
- [ ] 6. Click vào vùng trống
- [ ] 7. **Expected:** Popup đóng, KHÔNG tự xuất hiện lại

#### TC2.4: Click Inside Popup
- [ ] 1. Bôi đen text để hiện popup
- [ ] 2. Click vào bên trong popup (vào kết quả tra cứu)
- [ ] 3. **Expected:** Popup KHÔNG đóng
- [ ] 4. Click vào nút Copy
- [ ] 5. **Expected:** Popup KHÔNG đóng
- [ ] 6. Click vào collapsible header
- [ ] 7. **Expected:** Section expand/collapse, popup KHÔNG đóng

#### TC2.5: Selection During Popup Display
- [ ] 1. Bôi đen text A để hiện popup
- [ ] 2. Trong khi popup đang hiển thị, bôi đen text B khác
- [ ] 3. **Expected:** Popup cũ đóng, popup mới mở với text B
- [ ] 4. **Expected:** KHÔNG có 2 popups cùng lúc

#### TC2.6: Page Load Behavior
- [ ] 1. Load một trang web mới (refresh hoặc navigate)
- [ ] 2. Đợi 3-5 giây KHÔNG làm gì
- [ ] 3. **Expected:** KHÔNG có popup tự xuất hiện
- [ ] 4. Scroll trang lên xuống
- [ ] 5. **Expected:** KHÔNG có popup tự xuất hiện
- [ ] 6. Move mouse quanh (không click)
- [ ] 7. **Expected:** KHÔNG có popup tự xuất hiện

---

### Test Group 3: Regression Testing

**Trình duyệt:** Chrome, Edge, Firefox (all)

#### TC3.1: Copy Button
- [ ] 1. Bôi đen text để hiện popup với AI translation
- [ ] 2. Click nút Copy
- [ ] 3. **Expected:** Nút hiển thị checkmark (success)
- [ ] 4. Paste vào notepad/text editor
- [ ] 5. **Expected:** Chỉ có translation text (không có header/extra)

#### TC3.2: Resize Handle
- [ ] 1. Bôi đen text để hiện popup
- [ ] 2. Kéo resize handle ở góc dưới phải
- [ ] 3. **Expected:** Popup resize smooth
- [ ] 4. **Expected:** Content không bị crop
- [ ] 5. **Expected:** Buttons vẫn accessible

#### TC3.3: Theme Switching
- [ ] 1. Mở action popup (click icon extension)
- [ ] 2. Chuyển theme từ Light → Dark
- [ ] 3. Bôi đen text để hiện lookup popup
- [ ] 4. **Expected:** Popup hiển thị dark theme
- [ ] 5. Chuyển theme từ Dark → Light
- [ ] 6. **Expected:** Popup hiển thị light theme ngay lập tức

#### TC3.4: Collapsible Sections
- [ ] 1. Bôi đen text có nhiều definitions
- [ ] 2. Click vào collapsible headers
- [ ] 3. **Expected:** Sections expand/collapse
- [ ] 4. **Expected:** Icons rotate
- [ ] 5. **Expected:** Popup resize theo content

#### TC3.5: Extension Enable/Disable
- [ ] 1. Mở action popup
- [ ] 2. Tắt "Extension đang bật"
- [ ] 3. Bôi đen text
- [ ] 4. **Expected:** KHÔNG có popup xuất hiện
- [ ] 5. Bật lại "Extension đang bật"
- [ ] 6. Bôi đen text
- [ ] 7. **Expected:** Popup xuất hiện bình thường

#### TC3.6: Site Blocking
- [ ] 1. Mở action popup
- [ ] 2. Click "Tắt trên trang này"
- [ ] 3. Bôi đen text
- [ ] 4. **Expected:** KHÔNG có popup xuất hiện
- [ ] 5. Click "Bật trên trang này"
- [ ] 6. Bôi đen text
- [ ] 7. **Expected:** Popup xuất hiện bình thường

---

### Test Group 4: Edge Cases

**Trình duyệt:** Chrome, Edge, Firefox (all)

#### TC4.1: Very Long Text
- [ ] 1. Bôi đen một đoạn text rất dài (500+ characters)
- [ ] 2. **Expected:** Popup vẫn xuất hiện
- [ ] 3. **Expected:** Có scroll bar nếu cần
- [ ] 4. **Expected:** Performance vẫn tốt (< 1s response)

#### TC4.2: Special Characters
- [ ] 1. Bôi đen text có emojis: "hello 👋 world 🌍"
- [ ] 2. **Expected:** Popup hiển thị bình thường
- [ ] 3. Bôi đen text có dấu: "café, naïve"
- [ ] 4. **Expected:** Tra cứu chính xác

#### TC4.3: Multiple Tabs
- [ ] 1. Mở 3-4 tabs khác nhau
- [ ] 2. Trong mỗi tab, bôi đen text
- [ ] 3. **Expected:** Mỗi tab có popup riêng
- [ ] 4. **Expected:** Popups không conflict với nhau
- [ ] 5. Switch giữa các tabs
- [ ] 6. **Expected:** Popups vẫn đúng vị trí

#### TC4.4: Popup Position at Screen Edge
- [ ] 1. Scroll đến bottom của trang
- [ ] 2. Bôi đen text gần bottom edge
- [ ] 3. **Expected:** Popup flip lên trên (không bị cắt)
- [ ] 4. Bôi đen text gần right edge
- [ ] 5. **Expected:** Popup shift sang trái (không bị cắt)

#### TC4.5: Fast Network vs Slow Network
- [ ] 1. (Normal network) Bôi đen text
- [ ] 2. **Expected:** Kết quả load trong < 1s
- [ ] 3. (Throttle network to Slow 3G in DevTools)
- [ ] 4. Bôi đen text
- [ ] 5. **Expected:** Hiển thị loader spinning
- [ ] 6. **Expected:** Kết quả xuất hiện sau vài giây
- [ ] 7. **Expected:** Timeout message sau 10s nếu không load được

---

## 🐛 Bug Report Template

Nếu phát hiện bug, report theo format:

```
**Bug Title:** [Mô tả ngắn gọn]

**Browser:** Chrome/Firefox/Edge [version]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[Kết quả mong đợi]

**Actual Result:**
[Kết quả thực tế]

**Screenshots:**
[Đính kèm nếu có]

**Console Errors:**
[Copy console errors nếu có]
```

---

## ✅ Sign-off Criteria

Để release v0.4.1, cần pass:
- [ ] **100%** Test Group 1 (Firefox Settings Button)
- [ ] **100%** Test Group 2 (Popup Auto-Show Bug)
- [ ] **95%+** Test Group 3 (Regression Testing)
- [ ] **80%+** Test Group 4 (Edge Cases)

---

## 📝 Testing Notes

- Mỗi test case nên test ít nhất **2 lần** để ensure consistency
- Test trên **ít nhất 3 websites khác nhau** (e.g., Wikipedia, GitHub, News site)
- Check console log sau mỗi test group để ensure không có errors
- Document bất kỳ unexpected behavior nào, dù nhỏ

---

**Good luck testing! 🚀**
