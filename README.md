# 📚 JaDict - Jacob Dictionary

**JaDict** là một tiện ích mở rộng (extension) cho trình duyệt giúp bạn dịch từ và câu **nhanh chóng, offline, và sử dụng AI** chỉ bằng cách bôi đen (select) text trên bất kỳ trang web nào.

![Version](https://img.shields.io/badge/version-1.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Compatible](https://img.shields.io/badge/compatible-Chromium%2FChrome%2FEdge%2FBrave-blueviolet)

## ✨ Tính Năng

✅ **Dịch Nhanh** - Bôi đen text, dịch ngay lập tức  
✅ **Từ Điển Offline** - Tra từ cục bộ mà không cần internet  
✅ **AI Thông Minh** - Sử dụng Google Gemini API cho dịch câu phức tạp  
✅ **Hỗ Trợ 2 Ngôn Ngữ** - Tiếng Anh ↔️ Tiếng Việt  
✅ **Hiển Thị Bật Lên** - Popup xuất hiện tại vị trí bôi đen  
✅ **Tự Động Phát Hiện Ngôn Ngữ** - Không cần chọn ngôn ngữ thủ công  
✅ **Multi-Browser** - Hoạt động trên Chrome, Edge, Brave, Chromium

---

## 📥 Cài Đặt

### Yêu Cầu
- **Chrome** 90+ hoặc **Microsoft Edge** 90+ hoặc **Brave** hoặc bất kỳ trình duyệt Chromium nào
- **Google Gemini API Key** (miễn phí từ Google)

### Bước 1: Cài Extension

#### **Cách 1: Từ Chrome Web Store** (Sắp Tới)
Hiện tại extension chưa được đăng ký trên Chrome Web Store. Bạn có thể tự cài từ source code.

#### **Cách 2: Tải Từ Source Code (Hiện Tại)**

**B1: Tải Source Code**
```bash
git clone https://github.com/huuunleashed/jadict.git
cd jadict
```

**B2: Mở Extension Management**
- **Chrome**: Nhập `chrome://extensions/` vào thanh địa chỉ
- **Edge**: Nhập `edge://extensions/` vào thanh địa chỉ
- **Brave**: Nhập `brave://extensions/` vào thanh địa chỉ

**B3: Bật Developer Mode**
- Tìm công tắc **Developer mode** ở góc trên phải
- Bật nó (chuyển sang màu xanh)

**B4: Load Extension**
- Nhấp vào **Load unpacked**
- Điều hướng tới thư mục `jadict` vừa tải về
- Nhấp **Select Folder**

✅ Extension sẽ xuất hiện trong danh sách extension của bạn!

---

### Bước 2: Cấu Hình Google Gemini API

#### **Lấy API Key Miễn Phí**

1. Truy cập [Google AI Studio](https://aistudio.google.com/apikey)
2. Đăng nhập bằng tài khoản Google của bạn
3. Nhấp **Create API key** → **Create API key in new project**
4. **Copy API Key** (dòng chữ dài)
5. ⚠️ **Giữ bí mật** - Không chia sẻ key này với ai

> 💡 **Miễn Phí!** Google cung cấp 15 yêu cầu API miễn phí mỗi phút cho Gemini.

#### **Thêm API Key Vào Extension**

1. Nhấp chuột phải vào **biểu tượng JaDict** trên thanh công cụ
2. Chọn **Options** (hoặc **Tùy chọn**)
3. Dán API Key vào ô **API Key**
4. Chọn Model (mặc định: `gemini-2.5-flash-lite` - để tiết kiệm token)
5. Nhấp **Save** (Lưu)

✅ Xong! Extension đã sẵn sàng sử dụng!

---

## 🚀 Cách Sử Dụng

### Dịch Từ / Câu

1. **Bôi đen** text trên bất kỳ trang web nào
2. **Popup** sẽ tự động xuất hiện
3. Đợi kết quả dịch
4. Nhấp vào popup để xem chi tiết

### Ví Dụ

**Tiếng Anh → Tiếng Việt:**
- Bôi đen: `"The quick brown fox jumps over the lazy dog"`
- Kết quả: Bản dịch + giải thích

**Tiếng Việt → Tiếng Anh:**
- Bôi đen: `"Xin chào, tôi là một lập trình viên"`
- Kết quả: Translation + từ vựng

---

## ⚙️ Các Model Gemini Có Sẵn

| Model | Tốc Độ | Chất Lượng | Khuyến Nghị |
|-------|--------|----------|-----------|
| **gemini-2.5-flash** | ⚡ Rất Nhanh | ⭐⭐⭐⭐ | Để chất lượng cao |
| **gemini-2.5-flash-lite** | ⚡⚡ Siêu Nhanh | ⭐⭐⭐ | ✅ Mặc Định (tiết kiệm token) |
| **gemini-2.5-pro** | 🐢 Chậm | ⭐⭐⭐⭐⭐ | Cho kết quả tốt nhất |

---

## 🌐 Hỗ Trợ Trình Duyệt

| Trình Duyệt | Hỗ Trợ | Ghi Chú |
|------------|--------|--------|
| **Chrome** | ✅ | 90+ |
| **Microsoft Edge** | ✅ | 90+ |
| **Brave** | ✅ | Mới nhất |
| **Chromium** | ✅ | Mọi phiên bản |
| **Opera** | ✅ | Dựa trên Chromium |
| **Firefox** | ✅ | Từ v1.2+ |

---

## 🐛 Xử Lý Sự Cố

### Extension không xuất hiện trong danh sách
- ✅ Đảm bảo **Developer Mode** được bật
- ✅ Thử tải lại: `Ctrl + R` hoặc nhấp reload icon

### Popup không hiển thị khi bôi đen
- ✅ Kiểm tra xem extension có được **bật** không (biểu tượng không bị tắt)
- ✅ Thử refresh trang web

### Lỗi "API Key không hợp lệ"
- ✅ Kiểm tra API Key có bị dán đúng không (không có khoảng trắng thừa)
- ✅ Đảm bảo API Key vẫn còn hiệu lực trên Google Cloud

### Dịch sai hoặc từ không tìm thấy
- ✅ Đây là hành vi bình thường (Gemini có độ chính xác ~95%)
- ✅ Thử từ khác hoặc viết rõ ràng hơn

---

## 💡 Mẹo & Thủ Thuật

📌 **Tip 1:** Bôi đen **từng từ** để tra từ điển cục bộ nhanh hơn  
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

---

## 🙏 Cảm Ơn

- **Google Gemini API** - Cung cấp AI miễn phí
- **Cộng Động Open Source** - Hỗ trợ và feedback

---

**Made with ❤️ by [huuunleashed](https://github.com/huuunleashed)**

Nếu bạn thích extension, hãy ⭐ Star repo!
