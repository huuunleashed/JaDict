# 📚 JaDict - Jacob Dictionary

**JaDict** là một extension (tiện ích mở rộng) trình duyệt cho phép bạn **tra từ** và **dịch câu** nhanh chóng chỉ bằng cách bôi đen text trên bất kỳ trang web nào. Extension hoạt động **offline cho tra từ** và sử dụng **Google Gemini AI** cho dịch câu phức tạp.

![Version](https://img.shields.io/badge/version-0.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Compatible](https://img.shields.io/badge/compatible-Chromium%20|%20Chrome%20|%20Edge%20|%20Firefox-blueviolet)

---

## ✨ Tính Năng Chính

### 🎯 Core Features
- ⚡ **Tra Từ Tức Thì** - Bôi đen text và nhận kết quả ngay lập tức
- 📖 **Từ Điển Offline** - Tra từ cục bộ không cần internet
- 🤖 **AI-Powered Translation** - Google Gemini API cho dịch câu phức tạp
- 🌍 **2 Ngôn Ngữ** - Tiếng Anh ↔️ Tiếng Việt (tự động phát hiện)
- 📋 **Copy Button** - Nút copy SVG tiện lợi cho kết quả dịch AI
- 📐 **Resizable Popup** - Kéo giãn popup từ 320px → 1280px (rộng) và 220px → 800px (cao)
- 🎨 **Modern UI** - Giao diện đẹp mắt với gradient background
- 🔒 **Privacy-First** - API key lưu cục bộ, không gửi đến server nào khác

### 🆕 Version 0.1 Features
- ✅ **Stable Resize Handle** - Handle resize tùy chỉnh mượt mà, không giật lag
- ✅ **Copy Translation Button** - Nút copy với icon SVG hiện đại, chỉ copy phần dịch AI
- ✅ **Cross-Browser Support** - Hoạt động trên cả Chromium (Chrome, Edge) và Firefox/Zen

---

## 📥 Hướng Dẫn Cài Đặt

### 📋 Yêu Cầu Hệ Thống
- **Chrome** 90+ / **Microsoft Edge** 90+ / **Brave** / **Chromium** (bất kỳ phiên bản)
- **Firefox** 109+ / **Zen Browser**
- **Google Gemini API Key** (miễn phí, xem hướng dẫn bên dưới)

---

### 🔧 Cài Đặt Trên Chromium/Chrome/Edge/Brave

#### **Bước 1: Tải Source Code**

**Tùy chọn A: Từ GitHub (Khuyên dùng)**
```bash
git clone https://github.com/huuunleashed/jadict.git
cd jadict
```

**Tùy chọn B: Tải ZIP**
1. Vào https://github.com/huuunleashed/jadict
2. Click nút **Code** → **Download ZIP**
3. Giải nén thư mục

#### **Bước 2: Load Extension**

1. Mở trình duyệt và vào:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`

2. **Bật Developer Mode** (góc trên phải, toggle switch)

3. Click **Load unpacked** (Tải extension đã giải nén)

4. Chọn thư mục `jadict` vừa tải về

5. ✅ Extension xuất hiện với tên **JaDict (Jacob Dictionary)**

---

### 🦊 Cài Đặt Trên Firefox/Zen Browser

#### **Bước 1: Tải Source Code** (giống phần trên)

#### **Bước 2: Load Temporary Extension**

1. Mở Firefox/Zen và vào: `about:debugging#/runtime/this-firefox`

2. Click **Load Temporary Add-on...**

3. Điều hướng tới thư mục `jadict`

4. Chọn file `manifest.json`

5. ✅ Extension xuất hiện trong danh sách

> ⚠️ **Lưu ý:** Trên Firefox, extension sẽ bị xóa khi đóng trình duyệt. Để cài vĩnh viễn, cần package thành `.xpi` file.

---

### 🔑 Bước 3: Cấu Hình Google Gemini API Key

#### **Lấy API Key Miễn Phí**

1. Truy cập: [Google AI Studio](https://aistudio.google.com/apikey)
2. Đăng nhập bằng **Google Account**
3. Click **Create API key** → Chọn **Create API key in new project**
4. **Copy API Key** (dạng: `AIza...`)
5. ⚠️ **Lưu ý bảo mật:** Không chia sẻ key này với bất kỳ ai

> 💡 **Hoàn Toàn Miễn Phí!**  
> Google cung cấp **15 requests/phút** miễn phí cho Gemini 2.5 Flash.

#### **Thêm API Key Vào Extension**

1. **Mở Options Page:**
   - Cách 1: Right-click icon JaDict trên toolbar → **Options**
   - Cách 2: Vào `chrome://extensions/` → tìm JaDict → Click **Details** → **Extension options**

2. **Cấu hình:**
   - Dán **API Key** vào ô đầu tiên
   - Chọn **Model**: `gemini-2.5-flash-lite` (mặc định, tiết kiệm token)
   - Click **Save Settings**

3. ✅ Thấy thông báo **"Đã lưu cài đặt!"** là thành công!

---

## 🚀 Cách Sử Dụng

### 📖 Tra Từ Cơ Bản

1. Truy cập **bất kỳ trang web nào**
2. **Bôi đen (select)** một từ hoặc câu
3. **Popup** sự xuất hiện tự động ngay vị trí bôi đen
4. Đợi 1-2 giây để nhận kết quả

### 🎯 Ví Dụ Sử Dụng

#### **Tra Từ Tiếng Anh → Tiếng Việt**
```
Select: "ubiquitous"
Kết quả:
├─ 📖 Từ điển offline: có mặt khắp nơi, phổ biến
└─ 🤖 AI: (adj) có mặt ở khắp mọi nơi, phổ biến rộng rãi
```

#### **Dịch Câu Tiếng Việt → Tiếng Anh**
```
Select: "Tôi muốn học lập trình"
Kết quả:
└─ 🤖 AI: "I want to learn programming"
   ├─ Từ vựng: muốn (want), học (learn), lập trình (programming)
   └─ Cấu trúc: Subject + want to + verb
```

### 🎨 Tính Năng Nâng Cao

#### **1. Copy Kết Quả Dịch**
- Mỗi bản dịch AI có **icon SVG màu xanh**
- Click icon để copy text
- Icon chuyển sang **màu xanh lá** (✓) khi thành công
- Icon chuyển sang **màu đỏ** (✗) nếu lỗi

#### **2. Resize Popup**
- Di chuột tới **góc dưới phải** của popup
- Khi con trỏ chuyển thành **↔️**, kéo để resize
- Kích thước: 
  - Rộng: 320px → 1280px
  - Cao: 220px → 800px

---

## ⚙️ Cấu Hình & Tùy Chỉnh

### 🎛️ Model Options

| Model | Tốc Độ | Chất Lượng | Token/Request | Khuyên Dùng |
|-------|--------|----------|---------------|-------------|
| **gemini-2.5-flash-lite** | ⚡⚡⚡ Siêu Nhanh | ⭐⭐⭐ Tốt | ~100-200 | ✅ **Mặc Định** |
| **gemini-2.5-flash** | ⚡⚡ Rất Nhanh | ⭐⭐⭐⭐ Rất Tốt | ~200-400 | Dịch chính xác hơn |
| **gemini-2.5-pro** | ⚡ Chậm | ⭐⭐⭐⭐⭐ Xuất Sắc | ~500-1000 | Câu phức tạp |

> 💡 **Khuyến nghị:** Dùng `flash-lite` cho tra từ hàng ngày, chuyển sang `pro` khi cần dịch văn bản chuyên môn.

---

## 🌐 Trình Duyệt Hỗ Trợ

| Browser | Status | Version | Notes |
|---------|--------|---------|-------|
| **Google Chrome** | ✅ Full Support | 90+ | Stable |
| **Microsoft Edge** | ✅ Full Support | 90+ | Khuyên dùng |
| **Brave** | ✅ Full Support | Latest | Stable |
| **Chromium** | ✅ Full Support | Any | Stable |
| **Opera** | ✅ Full Support | Latest | Chromium-based |
| **Firefox** | ✅ Full Support | 109+ | Temporary install only |
| **Zen Browser** | ✅ Full Support | Latest | Firefox-based |

---

## 🐛 Xử Lý Sự Cố (Troubleshooting)

### ❌ Extension không xuất hiện sau khi load

**Nguyên nhân:** Developer mode chưa được bật  
**Giải pháp:**
1. Vào `chrome://extensions/` hoặc `edge://extensions/`
2. Bật toggle **Developer Mode** (góc trên phải)
3. Click **Reload** extension

---

### ❌ Popup không hiển thị khi bôi đen text

**Nguyên nhân:** Extension chưa được cấp quyền trên trang web  
**Giải pháp:**
1. Click icon **JaDict** trên toolbar
2. Chọn **"This can read and change site data"** → **"On all sites"**
3. Refresh trang web (F5)

---

### ❌ Lỗi "API Key không hợp lệ" hoặc "Lỗi: Failed to fetch"

**Nguyên nhân:** API key sai hoặc hết hạn  
**Giải pháp:**
1. Kiểm tra API key không có **khoảng trắng thừa** ở đầu/cuối
2. Tạo API key mới tại [Google AI Studio](https://aistudio.google.com/apikey)
3. Copy key mới và paste lại vào Options

---

### ❌ Kết quả dịch sai hoặc không chính xác

**Nguyên nhân:** Model AI có độ chính xác ~95%, có thể sai với từ đặc biệt  
**Giải pháp:**
1. Thử chuyển sang model `gemini-2.5-pro` (chất lượng cao hơn)
2. Bôi đen rõ ràng hơn (không bao gồm dấu câu thừa)
3. Thử tra từng từ riêng lẻ

---

### ❌ Resize handle bị lỗi hoặc không kéo được

**Nguyên nhân:** Xung đột CSS với trang web  
**Giải pháp:**
1. Reload extension
2. Refresh trang web
3. Nếu vẫn lỗi, báo cáo tại [GitHub Issues](https://github.com/huuunleashed/jadict/issues)

---

## 💡 Tips & Tricks

### 🎯 Mẹo Sử Dụng Hiệu Quả

1. **Tra từ nhanh:** Bôi đen **1 từ đơn** → kết quả từ điển offline (nhanh hơn)
2. **Dịch câu:** Bôi đen **câu hoàn chỉnh** → sử dụng AI (chính xác hơn)
3. **Copy nhanh:** Click icon 📋 bên cạnh bản dịch AI thay vì copy thủ công
4. **Resize thông minh:** Kéo popup rộng ra khi dịch đoạn văn dài

### ⚡ Tiết Kiệm Token

- Dùng model `flash-lite` cho tra từ hàng ngày
- Chỉ chuyển sang `pro` khi cần dịch văn bản chuyên môn
- Tránh bôi đen đoạn text quá dài (> 500 từ)

---

## 🛠️ Phát Triển & Đóng Góp

### 🏗️ Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **APIs:** Chrome Extension API, Google Gemini API
- **Architecture:** Content Script + Background Service Worker + Popup IFrame

### 🤝 Đóng Góp (Contributing)

Chúng tôi rất hoan nghênh mọi đóng góp! Nếu bạn muốn cải thiện JaDict:

1. **Fork** repository
2. Tạo **feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit** changes: `git commit -m 'Add some AmazingFeature'`
4. **Push** to branch: `git push origin feature/AmazingFeature`
5. Mở **Pull Request**

### 📝 Báo Lỗi (Bug Reports)

Gặp lỗi? Hãy báo cáo tại: [GitHub Issues](https://github.com/huuunleashed/jadict/issues)

**Khi báo lỗi, vui lòng cung cấp:**
- Trình duyệt & phiên bản
- Mô tả lỗi chi tiết
- Các bước tái hiện lỗi
- Screenshot (nếu có)

---

## 📄 License

Dự án này được phát hành dưới **MIT License**.  
Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

```
MIT License

Copyright (c) 2024 huuunleashed

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 📞 Liên Hệ & Hỗ Trợ

- **GitHub:** [@huuunleashed](https://github.com/huuunleashed)
- **Repository:** [huuunleashed/jadict](https://github.com/huuunleashed/jadict)
- **Issues:** [GitHub Issues](https://github.com/huuunleashed/jadict/issues)

---

## 🎯 Roadmap

### 🔜 Phiên Bản Sắp Tới

- [ ] **v0.2**: Context menu (right-click để tra từ)
- [ ] **v0.3**: Lịch sử tra từ (History)
- [ ] **v0.4**: Từ điển offline mở rộng (50,000+ từ)
- [ ] **v0.5**: Text-to-Speech (phát âm)
- [ ] **v0.6**: Dark Mode
- [ ] **v0.7**: Xuất sang Chrome Web Store
- [ ] **v1.0**: Multi-language support (Nhật, Hàn, Trung)

---

## ⭐ Hỗ Trợ Dự Án

Nếu bạn thấy JaDict hữu ích, hãy:
- ⭐ **Star** repository trên GitHub
- 🐛 Báo lỗi và đóng góp code
- 📢 Chia sẻ với bạn bè

---

## 📊 Changelog

### Version 0.1 (2024-10-27)
✅ **Features:**
- Custom resize handle with smooth drag experience
- SVG-based copy button for AI translations
- Cross-browser compatibility (Chromium + Firefox)
- Improved API error handling
- Modern UI with gradient background

✅ **Bug Fixes:**
- Fixed duplicate resize handle issue
- Fixed popup not appearing on some websites
- Fixed API compatibility layer for Firefox
- Fixed manifest V3 compatibility

✅ **Performance:**
- Optimized resize logic with pointer events
- Reduced CSS conflicts with host pages
- Improved iframe loading speed

---

<div align="center">

**Made with ❤️ by [huuunleashed](https://github.com/huuunleashed)**

*Happy translating! 🚀*

</div>
4. **Resize thông minh:** Kéo popup rộng ra khi dịch đoạn văn dài

### ⚡ Tiết Kiệm Token

- Dùng model `flash-lite` cho tra từ hàng ngày
- Chỉ chuyển sang `pro` khi cần dịch văn bản chuyên môn
- Tránh bôi đen đoạn text quá dài (> 500 từ)

---
📌 **Tip 2:** Bôi đen **câu hoàn chỉnh** để dùng AI dịch  
📌 **Tip 3:** Mặc định dùng `gemini-2.5-flash-lite` để tiết kiệm quota API (1500 yêu cầu miễn phí/ngày)  
📌 **Tip 4:** Upgrade lên `gemini-2.5-flash` nếu cần chất lượng cao hơn  
📌 **Tip 5:** Extension hoạt động trên **mọi trang web** (bao gồm PDF viewer)

---

## 📋 Yêu Cầu Hệ Thống

- RAM: 50MB (rất nhỏ)
- Storage: 2MB
- Internet: Cần để sử dụng AI (tra từ offline không cần)

---

## 🔐 Bảo Mật & Riêng Tư

✅ **Không Theo Dõi** - Extension không gửi dữ liệu của bạn đến bất kỳ nơi nào  
✅ **API Key Riêng** - Bạn kiểm soát API Key của riêng mình  
✅ **Offline First** - Tra từ điển cục bộ không cần internet  
✅ **Open Source** - Code công khai, ai cũng có thể kiểm tra

---

## 📝 License

MIT License - Xem [LICENSE](LICENSE) để chi tiết

---

## 🤝 Đóng Góp

Hãy giúp cải thiện JaDict!

```bash
# 1. Fork repo
# 2. Tạo branch feature
git checkout -b feature/your-feature

# 3. Commit thay đổi
git commit -m "Add your feature"

# 4. Push và tạo Pull Request
git push origin feature/your-feature
```

---

## 📧 Liên Hệ & Hỗ Trợ

- 🐛 **Report Bug**: [GitHub Issues](https://github.com/huuunleashed/jadict/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/huuunleashed/jadict/discussions)
- 📧 **Email**: [huynhquochuu.huynh@gmail.com](mailto:huynhquochuu.huynh@gmail.com)
- 📱 **Telegram**: [@huu_unleashed](https://t.me/huu_unleashed)

---

## 🙏 Cảm Ơn

- **Google Gemini API** - Cung cấp AI miễn phí
- **Cộng Động Open Source** - Hỗ trợ và feedback

---

**Made with ❤️ by [huuunleashed](https://github.com/huuunleashed)**

Nếu bạn thích extension, hãy ⭐ Star repo!
