# 📚 JaDict - Jacob Dictionary

**JaDict** là extension trình duyệt thông minh giúp bạn tra từ và dịch câu nhanh chóng chỉ bằng cách bôi đen text trên bất kỳ trang web nào. Với khả năng tra từ **offline hoàn toàn** và tích hợp **Google Gemini AI** cho dịch thuật chất lượng cao, JaDict là công cụ đắc lực cho việc học ngoại ngữ và đọc tài liệu tiếng Anh.

![Version](https://img.shields.io/badge/version-0.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Compatible](https://img.shields.io/badge/compatible-Chromium%20|%20Chrome%20|%20Edge%20|%20Firefox-blueviolet)

---

## ✨ Tính Năng Nổi Bật

- ⚡ **Tra Từ Tức Thì** - Bôi đen text và xem kết quả ngay lập tức tại vị trí con trỏ
- 📖 **Từ Điển Offline** - Tra từ nhanh không cần kết nối internet, tiết kiệm băng thông
- 🤖 **AI-Powered Translation** - Dịch câu phức tạp với độ chính xác cao bằng Google Gemini API
- 🌍 **Song Ngữ Anh - Việt** - Tự động phát hiện ngôn ngữ và dịch hai chiều
- 📋 **Copy Nhanh** - Nút copy SVG tiện lợi để lưu kết quả dịch
- 📐 **Popup Linh Hoạt** - Tự do điều chỉnh kích thước popup từ 320×220px đến 1280×800px
- 🎨 **Giao Diện Hiện Đại** - Thiết kế đẹp mắt với gradient background và typography tối ưu
- 🔒 **Bảo Mật Tuyệt Đối** - API key lưu trữ cục bộ, dữ liệu của bạn không được gửi đi đâu cả
- 🌐 **Đa Nền Tảng** - Hoạt động mượt mà trên Chrome, Edge, Brave, Firefox và Zen Browser

---

## 📥 Hướng Dẫn Cài Đặt Chi Tiết

### 📋 Yêu Cầu Hệ Thống

#### Trình Duyệt Hỗ Trợ
- **Chromium-based:** Chrome 90+, Microsoft Edge 90+, Brave, Opera, Vivaldi
- **Firefox-based:** Firefox 109+, Zen Browser, LibreWolf
- **Hệ điều hành:** Windows, macOS, Linux

#### Tài Nguyên Yêu Cầu
- Dung lượng: ~2MB trên ổ cứng
- RAM: ~50MB khi đang chạy (rất nhẹ)
- Internet: Chỉ cần cho tính năng dịch AI (tra từ offline hoàn toàn không cần)

#### API Key (Bắt Buộc)
- **Google Gemini API Key** - Hoàn toàn miễn phí với 15 requests/phút

---

### 🔧 Phần 1: Cài Đặt Extension

#### **A. Trên Trình Duyệt Chromium (Chrome/Edge/Brave/Opera)**

**Bước 1: Tải Source Code**

Có hai cách để tải về:

**Cách 1 - Clone Repository (Khuyên dùng cho developer)**
```bash
git clone https://github.com/huuunleashed/jadict.git
cd jadict
```

**Cách 2 - Download ZIP (Dễ dàng cho người dùng thông thường)**
1. Truy cập https://github.com/huuunleashed/jadict
2. Click vào nút **Code** (màu xanh lá)
3. Chọn **Download ZIP**
4. Giải nén file ZIP vào thư mục bất kỳ (ví dụ: `C:\JaDict\`)

> 💡 **Lưu ý:** Đừng xóa thư mục sau khi cài đặt vì extension cần các file này để hoạt động!

**Bước 2: Load Extension Vào Trình Duyệt**

1. Mở trình duyệt và truy cập vào trang extensions:
   - **Chrome**: Nhập `chrome://extensions/` vào thanh địa chỉ
   - **Edge**: Nhập `edge://extensions/`
   - **Brave**: Nhập `brave://extensions/`
   - **Opera**: Nhập `opera://extensions/`

2. **Bật chế độ Developer Mode:**
   - Tìm toggle switch **Developer mode** ở góc trên bên phải
   - Click để bật (chuyển sang màu xanh)

3. **Load Extension:**
   - Click nút **Load unpacked** (hoặc "Tải tiện ích đã giải nén")
   - Điều hướng đến thư mục `jadict` vừa tải về
   - Click **Select Folder** (hoặc "Chọn thư mục")

4. **Xác nhận cài đặt thành công:**
   - Extension **JaDict (Jacob Dictionary)** xuất hiện trong danh sách
   - Icon JaDict hiển thị trên thanh công cụ trình duyệt
   - Trạng thái hiển thị: **Enabled** (Đã bật)

> 📦 **Muốn đóng gói để phát hành?** Cài Node.js ≥ 18, chạy `npm install` rồi `npm run build:chrome`. File `dist/jadict-chrome.zip` sẵn sàng để upload lên Chrome Web Store hoặc phân phối nội bộ.

---

#### **B. Trên Firefox / Zen Browser**

**Bước 1: Tạo gói build dành riêng cho Firefox**

1. Cài Node.js ≥ 18 (nếu chưa có).
2. Mở terminal tại thư mục dự án và chạy `npm install`.
3. Chạy `npm run build:firefox` để sinh:
   - Thư mục `dist/firefox/` chứa bản unpacked (manifest v2).
   - File `dist/jadict-firefox.zip` và bản sao `dist/jadict-firefox.xpi` sẵn sàng để gửi lên Mozilla.

**Bước 2: Ký và cài đặt vĩnh viễn**

1. Đăng nhập [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/).
2. Chọn **Submit a New Add-on** → upload file `dist/jadict-firefox.zip` (hoặc `.xpi`).
3. Đợi Mozilla ký. Tải file `.xpi` đã ký về máy.
4. Mở `about:addons` → biểu tượng bánh răng → **Install Add-on From File...** → chọn file `.xpi` đã ký → xác nhận cài đặt.

> 💡 **Cài nội bộ (unsigned):** trên Firefox Developer Edition/Nightly bạn có thể đặt `xpinstall.signatures.required = false` trong `about:config`, rồi kéo thả file `.xpi` để cài thủ công.

**Bước 3 (tùy chọn): Load tạm thời để debug**

1. Truy cập `about:debugging#/runtime/this-firefox`.
2. Chọn **Load Temporary Add-on...**.
3. Điều hướng tới thư mục `dist/firefox/` và chọn file `manifest.json` bên trong.
4. Extension xuất hiện trong danh sách **Temporary Extensions** cho đến khi bạn đóng trình duyệt.

---

### 🔑 Phần 2: Cấu Hình Google Gemini API Key

Để sử dụng tính năng dịch AI, bạn cần cung cấp một API key từ Google. Quá trình này **hoàn toàn miễn phí** và chỉ mất 2-3 phút.

#### **Bước 1: Tạo API Key Miễn Phí**

1. **Truy cập Google AI Studio:**
   - Mở link: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   - Đăng nhập bằng **tài khoản Google** của bạn (Gmail, Workspace, v.v.)

2. **Tạo API Key:**
   - Click nút **Create API key** (Tạo khóa API)
   - Chọn **Create API key in new project** (Tạo trong dự án mới)
   - Đợi 5-10 giây để Google xử lý

3. **Copy API Key:**
   - API key sẽ hiển thị dạng: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - Click vào icon **Copy** hoặc bôi đen và copy thủ công
   - Lưu key vào file text hoặc ghi chú an toàn

> 🔒 **Bảo Mật API Key:**
> - **KHÔNG BAO GIỜ** chia sẻ API key với người khác
> - **KHÔNG** commit key vào GitHub hoặc public repository
> - **KHÔNG** để key trong file config không được mã hóa
> - Nếu key bị lộ, hãy xóa và tạo key mới ngay lập tức

> 💰 **Về Chi Phí:**
> - Google cung cấp **hoàn toàn miễn phí** cho mô hình Gemini 2.5 Flash
> - Giới hạn: **15 requests/phút** và **1,500 requests/ngày**
> - Đủ cho nhu cầu tra từ cá nhân hàng ngày
> - Không cần cung cấp thông tin thanh toán

#### **Bước 2: Cấu Hình Extension**

1. **Mở Trang Options:**
   
   **Cách 1 - Qua Toolbar:**
   - Right-click vào icon **JaDict** trên thanh công cụ
   - Chọn **Options** (hoặc "Tùy chọn")
   
   **Cách 2 - Qua Trang Extensions:**
   - Truy cập `chrome://extensions/` (hoặc `edge://extensions/`)
   - Tìm **JaDict** trong danh sách
   - Click **Details** → **Extension options**

2. **Nhập Thông Tin:**
   
   **API Key:**
   - Paste API key vừa copy vào ô **"Gemini API Key"**
   - Kiểm tra không có khoảng trắng thừa ở đầu/cuối
   
   **Chọn Model:**
   - Mặc định: **gemini-2.5-flash-lite** (Khuyên dùng - nhanh và tiết kiệm)
   - Tùy chọn khác:
     - `gemini-2.5-flash` - Chất lượng cao hơn, chậm hơn
     - `gemini-2.5-pro` - Chất lượng tốt nhất, tiêu tốn nhiều quota

3. **Lưu Cài Đặt:**
   - Click nút **Save Settings** (Lưu cài đặt)
   - Chờ thông báo **"Đã lưu cài đặt!"** xuất hiện
   - Đóng trang Options

4. **Kiểm Tra Hoạt Động:**
   - Mở bất kỳ trang web nào
   - Bôi đen một từ tiếng Anh (ví dụ: "hello")
   - Popup xuất hiện với kết quả dịch
   - Nếu thấy kết quả từ AI → Cấu hình thành công! ✅

---

## 🚀 Hướng Dẫn Sử Dụng

### 📖 Cách Tra Từ Cơ Bản

JaDict được thiết kế để sử dụng đơn giản nhất có thể. Bạn chỉ cần 3 bước:

1. **Mở bất kỳ trang web nào** (tin tức, blog, Wikipedia, PDF viewer, v.v.)
2. **Bôi đen (select)** text bạn muốn tra - có thể là một từ, cụm từ hoặc cả câu
3. **Popup tự động xuất hiện** ngay vị trí chuột, hiển thị kết quả trong 1-2 giây

> 💡 **Mẹo:** Popup sẽ tự động đóng khi bạn click ra ngoài hoặc bôi đen text khác.

### 🎯 Các Trường Hợp Sử Dụng

#### **1. Tra Từ Đơn (Tiếng Anh → Tiếng Việt)**

Khi bạn bôi đen **một từ tiếng Anh**, JaDict sẽ:
- Tra trong **từ điển offline** trước (nhanh, không cần internet)
- Hiển thị nghĩa tiếng Việt, phiên âm (nếu có)
- Đồng thời gửi request đến **Gemini AI** để có thêm:
  - Định nghĩa chi tiết
  - Ví dụ câu sử dụng
  - Từ loại (noun, verb, adjective...)
  - Các nghĩa khác của từ

**Ví dụ:**
```
Bôi đen: "ubiquitous"

Kết quả hiển thị:
┌────────────────────────────────────────┐
│ 📖 Từ điển:                            │
│ có mặt khắp nơi, phổ biến rộng rãi     │
│                                        │
│ 🤖 AI (Gemini 2.5 Flash Lite):        │
│ (adj) có mặt ở khắp mọi nơi            │
│                                        │
│ Ví dụ: "Smartphones are ubiquitous    │
│ in modern society."                    │
└────────────────────────────────────────┘
```

#### **2. Dịch Câu (Tiếng Anh → Tiếng Việt)**

Khi bạn bôi đen **một câu hoàn chỉnh**, AI sẽ:
- Phân tích cấu trúc ngữ pháp
- Dịch toàn bộ câu với ngữ cảnh
- Giải thích các thành phần quan trọng

**Ví dụ:**
```
Bôi đen: "Despite the heavy rain, the match continued."

Kết quả:
┌────────────────────────────────────────┐
│ 🤖 Dịch:                               │
│ Mặc dù mưa lớn, trận đấu vẫn tiếp tục. │
│                                        │
│ Giải thích:                            │
│ - despite = mặc dù (preposition)       │
│ - heavy rain = mưa lớn                 │
│ - continued = tiếp tục (past tense)    │
└────────────────────────────────────────┘
```

#### **3. Dịch Ngược (Tiếng Việt → Tiếng Anh)**

JaDict **tự động phát hiện** ngôn ngữ. Khi bạn bôi đen tiếng Việt:

**Ví dụ:**
```
Bôi đen: "Tôi muốn học lập trình để trở thành developer"

Kết quả:
┌────────────────────────────────────────┐
│ 🤖 Translation:                        │
│ I want to learn programming to become  │
│ a developer                            │
│                                        │
│ Phân tích:                             │
│ - muốn = want to                       │
│ - học = learn                          │
│ - lập trình = programming              │
│ - trở thành = become                   │
└────────────────────────────────────────┘
```

### 🎨 Tính Năng Nâng Cao

#### **1. Copy Kết Quả Dịch**

Mỗi bản dịch AI đều có một **nút copy SVG** (icon 📋) bên cạnh:

- **Click vào icon** để copy toàn bộ text đã dịch vào clipboard
- Icon chuyển sang **màu xanh lá + tích (✓)** khi copy thành công
- Icon chuyển sang **màu đỏ + dấu X (✗)** nếu xảy ra lỗi
- Sau 2 giây, icon tự động trở về trạng thái ban đầu

> 💡 **Mẹo:** Chức năng này rất hữu ích khi bạn cần paste kết quả dịch vào email, document, hoặc chat.

#### **2. Resize Popup (Thay Đổi Kích Thước)**

Popup có thể được **kéo giãn tự do** để phù hợp với nội dung:

**Cách sử dụng:**
1. Di chuột tới **góc dưới bên phải** của popup
2. Con trỏ chuột chuyển thành **↔️ (resize cursor)**
3. Giữ chuột trái và **kéo** để thay đổi kích thước
4. Thả chuột khi đạt kích thước mong muốn

**Giới hạn kích thước:**
- **Chiều rộng:** 320px (tối thiểu) → 1280px (tối đa)
- **Chiều cao:** 220px (tối thiểu) → 800px (tối đa)

> 💡 **Khi nào cần resize?**
> - Dịch đoạn văn dài → kéo rộng để đọc dễ hơn
> - Màn hình nhỏ → thu nhỏ popup để không che khuất nội dung trang
> - Nhiều thông tin từ AI → kéo cao để xem hết mà không cần scroll

#### **3. Tự Động Đóng Popup**

Popup sẽ tự động biến mất trong các trường hợp sau:
- Bạn **click chuột** vào bất kỳ vị trí nào ngoài popup
- Bạn **bôi đen text mới** → popup cũ đóng, popup mới mở
- Bạn **scroll trang** (chỉ trên một số trình duyệt)
- Bạn **nhấn phím Esc** (nếu popup đang focus)

---

## ⚙️ Cấu Hình & Tùy Chỉnh

### 🎛️ Lựa Chọn Model AI

JaDict hỗ trợ **3 model Google Gemini** khác nhau. Bạn có thể thay đổi model trong **Options page** bất kỳ lúc nào.

| Model | Tốc Độ | Chất Lượng Dịch | Token/Request | Khuyên Dùng Cho |
|-------|--------|----------------|---------------|-----------------|
| **gemini-2.5-flash-lite** | ⚡⚡⚡ Siêu Nhanh (0.5-1s) | ⭐⭐⭐ Tốt | 100-200 | ✅ **Tra từ hàng ngày** (Mặc định) |
| **gemini-2.5-flash** | ⚡⚡ Rất Nhanh (1-2s) | ⭐⭐⭐⭐ Rất Tốt | 200-400 | Dịch câu phức tạp, văn bản chính thức |
| **gemini-2.5-pro** | ⚡ Trung Bình (2-4s) | ⭐⭐⭐⭐⭐ Xuất Sắc | 500-1000 | Dịch thuật chuyên môn, tài liệu kỹ thuật |

#### **Cách Chọn Model Phù Hợp:**

**Nên dùng `flash-lite` khi:**
- Tra từ đơn, cụm từ ngắn
- Cần tốc độ nhanh nhất
- Sử dụng thường xuyên (tiết kiệm quota)
- Đọc tin tức, mạng xã hội

**Nên dùng `flash` khi:**
- Dịch câu dài, đoạn văn
- Cần độ chính xác cao hơn
- Văn bản có ngữ cảnh phức tạp
- Đọc blog, bài báo chuyên ngành

**Nên dùng `pro` khi:**
- Dịch tài liệu quan trọng (hợp đồng, luận văn)
- Văn bản có thuật ngữ chuyên môn
- Cần giải thích chi tiết ngữ pháp
- Câu có cấu trúc phức tạp, nhiều mệnh đề

> 💡 **Khuyến nghị:** 
> - Bắt đầu với `flash-lite` cho nhu cầu thông thường
> - Chuyển sang `flash` nếu thấy chất lượng chưa đạt
> - Chỉ dùng `pro` khi thực sự cần thiết để tránh hết quota nhanh

### 📊 Giới Hạn API (Quota)

Google Gemini cung cấp **miễn phí** với giới hạn sau:

| Giới Hạn | Flash Lite | Flash | Pro |
|----------|------------|-------|-----|
| **Requests/phút** | 15 | 15 | 15 |
| **Requests/ngày** | 1,500 | 1,500 | 50 |
| **Tokens/phút** | 4M | 4M | 1M |

**Ví dụ thực tế:**
- Tra từ **1,500 lần/ngày** với `flash-lite` = ~100 từ/giờ (đủ dùng!)
- Dịch **50 câu/ngày** với `pro` = ~3-5 câu/giờ
- Hết quota → chờ đến ngày hôm sau để reset

---

## 🌐 Tương Thích Trình Duyệt

JaDict được phát triển và kiểm thử kỹ lưỡng trên nhiều trình duyệt khác nhau:

| Trình Duyệt | Trạng Thái | Phiên Bản Tối Thiểu | Ghi Chú |
|-------------|-----------|---------------------|---------|
| **Google Chrome** | ✅ Hoạt động hoàn hảo | 90+ | Stable, được test nhiều nhất |
| **Microsoft Edge** | ✅ Hoạt động hoàn hảo | 90+ | Khuyên dùng, tích hợp tốt với Windows |
| **Brave** | ✅ Hoạt động hoàn hảo | Latest | Chromium-based, privacy-focused |
| **Opera** | ✅ Hoạt động hoàn hảo | Latest | Chromium-based |
| **Vivaldi** | ✅ Hoạt động hoàn hảo | Latest | Chromium-based, advanced features |
| **Chromium** | ✅ Hoạt động hoàn hảo | Any | Open-source base |
| **Firefox** | ✅ Cần gói & ký | 109+ | Build `npm run build:firefox`, upload AMO để nhận `.xpi` đã ký |
| **Zen Browser** | ✅ Cần gói & ký | Latest | Cài file `.xpi` đã ký hoặc bật chế độ developer |
| **LibreWolf** | ✅ Cần gói & ký | Latest | Hỗ trợ cài `.xpi` đã ký / tắt signature bắt buộc |

**Giải thích trạng thái:**
- ✅ **Hoạt động hoàn hảo:** Cài đặt một lần, dùng vĩnh viễn
- ✅ **Cần gói & ký:** Cần build `dist/jadict-firefox.zip` và cài `.xpi` đã ký bởi Mozilla hoặc chế độ developer
- ⚠️ **Tạm thời:** Chỉ dành cho mục đích debug, bị gỡ khi đóng trình duyệt

> 💡 **Khuyến nghị:** Dùng trình duyệt **Chromium-based** (Chrome, Edge, Brave) để có trải nghiệm tốt nhất.

---

## 🐛 Xử Lý Sự Cố

### ❌ **Vấn Đề 1: Extension Không Xuất Hiện Sau Khi Load**

**Triệu chứng:**
- Load extension thành công nhưng không thấy icon trên toolbar
- Không thấy extension trong danh sách `chrome://extensions/`

**Nguyên nhân:**
- Chưa bật **Developer Mode**
- Extension bị disable tự động do lỗi manifest
- Thư mục extension không đúng cấu trúc

**Giải pháp:**

**Bước 1:** Kiểm tra Developer Mode
```
1. Truy cập chrome://extensions/ (hoặc edge://extensions/)
2. Tìm toggle "Developer mode" ở góc trên phải
3. Đảm bảo toggle đang ở trạng thái BẬT (màu xanh)
```

**Bước 2:** Reload Extension
```
1. Tìm extension "JaDict" trong danh sách
2. Click nút "Reload" (icon vòng tròn)
3. Kiểm tra phần "Errors" - nếu có lỗi, đọc message và fix
```

**Bước 3:** Kiểm tra thư mục
```
1. Đảm bảo thư mục có file manifest.json ở root
2. Cấu trúc cần có:
   jadict/
   ├── manifest.json
   ├── background.js
   ├── content.js
   ├── popup.html
   └── (các file khác)
```

---

### ❌ **Vấn Đề 2: Popup Không Hiển Thị Khi Bôi Đen Text**

**Triệu chứng:**
- Bôi đen text nhưng popup không xuất hiện
- Extension hoạt động trên trang này nhưng không hoạt động trên trang khác

**Nguyên nhân:**
- Extension chưa được cấp quyền truy cập trang web
- Trang web có Content Security Policy (CSP) nghiêm ngặt
- Xung đột với extension khác

**Giải pháp:**

**Bước 1:** Cấp quyền cho extension
```
1. Click icon JaDict trên toolbar
2. Tìm dòng "This can read and change site data"
3. Chọn "On all sites" (Trên tất cả các trang)
4. Refresh trang web (F5 hoặc Ctrl+R)
```

**Bước 2:** Kiểm tra trang đặc biệt
- Extension **KHÔNG thể** hoạt động trên:
  - `chrome://` pages (trang cài đặt Chrome)
  - `edge://` pages (trang cài đặt Edge)
  - Chrome Web Store
  - Một số trang ngân hàng có bảo mật cao

**Bước 3:** Test trên trang khác
```
1. Mở một trang đơn giản như Wikipedia hoặc BBC News
2. Thử bôi đen text
3. Nếu hoạt động → Vấn đề ở trang web cụ thể
4. Nếu không → Kiểm tra console (F12) xem có lỗi JavaScript
```

**Bước 4:** Tắt extension khác
```
1. Vào chrome://extensions/
2. Tạm thời tắt các extension khác (đặc biệt extension liên quan đến dịch thuật)
3. Test lại JaDict
4. Bật lại từng extension để tìm extension xung đột
```

---

### ❌ **Vấn Đề 3: Lỗi "API Key Không Hợp Lệ" hoặc "Failed to Fetch"**

**Triệu chứng:**
- Từ điển offline hoạt động bình thường
- Phần dịch AI hiển thị lỗi màu đỏ: "Lỗi: Failed to fetch" hoặc "Invalid API key"

**Nguyên nhân:**
- API key sai, hết hạn hoặc bị revoke
- API key có khoảng trắng thừa
- Vượt quá quota (15 requests/phút hoặc 1,500 requests/ngày)
- Vấn đề kết nối mạng

**Giải pháp:**

**Bước 1:** Kiểm tra API Key
```
1. Mở Options page
2. Copy API key ra Notepad
3. Kiểm tra:
   - Không có khoảng trắng ở đầu/cuối
   - Format: AIzaSy....... (bắt đầu bằng AIza)
   - Độ dài: ~39 ký tự
```

**Bước 2:** Tạo API key mới
```
1. Truy cập https://aistudio.google.com/apikey
2. Tìm API key cũ → Click "Disable" (nếu bị lộ)
3. Click "Create API key" → Tạo key mới
4. Copy key mới và paste vào Options
5. Click "Save Settings"
```

**Bước 3:** Kiểm tra quota
```
1. Vào https://aistudio.google.com/apikey
2. Click vào key đang dùng
3. Xem phần "Usage" - nếu hết quota:
   - Đợi 1 phút (nếu hết quota/phút)
   - Đợi đến 00:00 UTC (nếu hết quota/ngày)
   - Hoặc upgrade lên paid plan
```

**Bước 4:** Test kết nối
```
1. Mở DevTools (F12) → Tab Console
2. Bôi đen text để trigger API call
3. Xem error message chi tiết trong console
4. Các lỗi thường gặp:
   - "429 Too Many Requests" → Hết quota
   - "403 Forbidden" → API key sai hoặc không có quyền
   - "Network error" → Vấn đề internet/firewall
```

---

### ❌ **Vấn Đề 4: Kết Quả Dịch Sai hoặc Không Chính Xác**

**Triệu chứng:**
- AI dịch sai nghĩa
- Dịch thiếu hoặc thừa từ
- Giải thích ngữ pháp không đúng

**Nguyên nhân:**
- Model AI có giới hạn (độ chính xác ~90-95%)
- Text bôi đen bao gồm ký tự đặc biệt, emoji
- Câu quá dài, phức tạp
- Ngữ cảnh không rõ ràng

**Giải pháp:**

**Bước 1:** Thử model cao cấp hơn
```
1. Mở Options page
2. Chuyển từ "flash-lite" sang "flash" hoặc "pro"
3. Save settings và test lại
4. Model "pro" cho độ chính xác cao nhất
```

**Bước 2:** Bôi đen chính xác hơn
```
❌ Sai: "Hello, world!!!" (bao gồm dấu !!! thừa)
✅ Đúng: "Hello, world"

❌ Sai: Bôi đen cả đoạn văn 500 từ
✅ Đúng: Bôi đen từng câu riêng lẻ
```

**Bước 3:** Tra từng từ riêng
```
Nếu dịch câu: "I want to learn programming"
→ Thử tra riêng: "want", "learn", "programming"
→ Ghép nghĩa lại để hiểu đúng
```

**Bước 4:** Cross-check với công cụ khác
```
- Google Translate: translate.google.com
- Cambridge Dictionary: dictionary.cambridge.org
- DeepL: deepl.com
```

---

### ❌ **Vấn Đề 5: Resize Handle Bị Lỗi hoặc Không Kéo Được**

**Triệu chứng:**
- Handle resize không xuất hiện ở góc dưới phải
- Kéo handle nhưng popup không thay đổi kích thước
- Handle bị giật lag khi kéo

**Nguyên nhân:**
- CSS conflict với trang web hiện tại
- Browser zoom không phải 100%
- Lỗi JavaScript trong content script

**Giải pháp:**

**Bước 1:** Reload extension
```
1. Vào chrome://extensions/
2. Tìm JaDict → Click "Reload"
3. Refresh trang web (F5)
4. Test lại
```

**Bước 2:** Reset zoom
```
1. Nhấn Ctrl+0 (hoặc Cmd+0 trên Mac)
2. Đảm bảo zoom ở mức 100%
3. Test resize lại
```

**Bước 3:** Kiểm tra console
```
1. Bôi đen text để mở popup
2. Nhấn F12 → Tab Console
3. Xem có error message màu đỏ không
4. Nếu có lỗi, copy và report tại GitHub Issues
```

**Bước 4:** Test trên trang khác
```
1. Mở trang đơn giản (ví dụ: example.com)
2. Test resize handle
3. Nếu hoạt động → Vấn đề ở trang web cụ thể
4. Report lỗi kèm URL trang web bị lỗi
```

---

### 📧 **Vẫn Gặp Vấn Đề?**

Nếu các giải pháp trên không hiệu quả, hãy báo cáo lỗi:

1. **Tạo GitHub Issue:**
   - Truy cập: https://github.com/huuunleashed/jadict/issues
   - Click "New Issue"
   - Cung cấp thông tin:
     - Trình duyệt & phiên bản (ví dụ: Chrome 120.0)
     - Hệ điều hành (Windows 11, macOS Sonoma, Ubuntu 22.04...)
     - Mô tả chi tiết lỗi
     - Các bước tái hiện lỗi
     - Screenshot (nếu có)
     - Error message từ Console (F12)

2. **Liên hệ trực tiếp:**
   - Email: huynhquochuu.huynh@gmail.com
   - Telegram: @huu_unleashed

---

## 💡 Tips & Tricks

### 🎯 Sử Dụng Hiệu Quả

#### **1. Phân Biệt Khi Nào Tra Từ, Khi Nào Dịch Câu**

**Tra từ đơn (Nhanh - Dùng offline):**
```
Bôi đen: "beautiful"
→ Từ điển offline trả kết quả ngay lập tức
→ AI bổ sung thêm ví dụ, ngữ cảnh
→ Tiết kiệm quota API
```

**Dịch cụm từ/câu (Chính xác - Dùng AI):**
```
Bôi đen: "break the ice"
→ Từ điển offline không có (idiom)
→ AI dịch: "phá vỡ sự im lặng, tạo không khí thoải mái"
→ Kèm giải thích ngữ cảnh sử dụng
```

#### **2. Tối Ưu Hóa Việc Bôi Đen Text**

**✅ NÊN:**
- Bôi đen **chính xác** từ/câu cần dịch (không bao gồm dấu câu thừa)
- Bôi đen **câu hoàn chỉnh** để AI hiểu ngữ cảnh
- Bôi đen **từ gốc** (infinitive form) cho kết quả tốt hơn

**❌ KHÔNG NÊN:**
- Bôi đen quá nhiều text cùng lúc (> 100 từ)
- Bao gồm ký tự đặc biệt, emoji vô nghĩa
- Bôi đen text có nhiều ngôn ngữ lẫn lộn

#### **3. Sử Dụng Nút Copy Thông Minh**

- **Single Click:** Copy toàn bộ bản dịch AI
- **Watch for Color:** 🔵 Xanh dương → 🟢 Xanh lá (✓ thành công) → 🔴 Đỏ (✗ lỗi)
- **Use Case:** Copy để paste vào documents, notes, emails

#### **4. Resize Popup Theo Ngữ Cảnh**

- **Desktop:** Kéo rộng 800-1000px để đọc thoải mái
- **Laptop:** Giữ kích thước mặc định 320×220px
- **PDF Reader:** Resize 400×600px, đặt góc phải màn hình

#### **5. Tiết Kiệm Quota API**

**Chiến lược:**
1. Ưu tiên tra từ đơn → dùng offline (không tốn quota)
2. Chỉ dùng AI cho câu phức tạp
3. Dùng `flash-lite` cho tra từ hàng ngày
4. Chuyển sang `pro` chỉ khi cần (tài liệu quan trọng)

**Tính toán:**
- Quota miễn phí: 1,500 requests/ngày ≈ 100 requests/giờ
- Vượt quota → chờ đến 00:00 UTC (7:00 sáng giờ VN)

---

## � Bảo Mật & Quyền Riêng Tư

JaDict được thiết kế với nguyên tắc **Privacy-First**:

### ✅ Cam Kết Bảo Mật

| Vấn Đề | Giải Pháp JaDict |
|--------|------------------|
| **Thu thập dữ liệu** | ❌ KHÔNG thu thập bất kỳ thông tin cá nhân nào |
| **Theo dõi hành vi** | ❌ KHÔNG tracking, analytics, hoặc telemetry |
| **Lưu trữ từ tra cứu** | ❌ KHÔNG lưu lịch sử tra từ của bạn |
| **Chia sẻ dữ liệu** | ❌ KHÔNG gửi dữ liệu đến server của chúng tôi |
| **API Key** | ✅ Lưu trữ **cục bộ** trong browser storage |
| **Offline Dictionary** | ✅ Hoạt động hoàn toàn offline, không cần internet |
| **Open Source** | ✅ Code công khai, bất kỳ ai cũng có thể kiểm tra |

### 🔒 Dữ Liệu Được Gửi Đi Đâu?

**Khi tra từ offline:**
- ❌ Không có dữ liệu nào được gửi đi
- ✅ Tra cứu hoàn toàn trong bộ nhớ local

**Khi dùng AI (Google Gemini):**
- ✅ Chỉ gửi **text bạn bôi đen** đến Google Gemini API
- ✅ Kèm theo **API key của bạn** để xác thực
- ❌ KHÔNG gửi: URL trang web, lịch sử duyệt web, thông tin cá nhân

**Minh họa:**
```
Text bôi đen: "hello" → Google Gemini API → Trả về nghĩa
                ↑
          (Chỉ gửi text này)
```

### 🛡️ Quyền Extension Yêu Cầu

JaDict chỉ yêu cầu **các quyền tối thiểu** để hoạt động:

| Permission | Lý Do | Sử Dụng Để |
|-----------|-------|------------|
| `activeTab` | Đọc text bạn bôi đen | Hiển thị popup tra từ |
| `storage` | Lưu API key & settings | Ghi nhớ cấu hình của bạn |
| `host_permissions: <all_urls>` | Hoạt động trên mọi trang | Tra từ ở bất kỳ website nào |

> 💡 **Lưu ý:** Extension **KHÔNG** có quyền:
> - ❌ Đọc cookies/passwords
> - ❌ Sửa đổi nội dung trang web
> - ❌ Ghi file vào máy tính
> - ❌ Truy cập webcam/microphone

### � Xác Minh Bảo Mật

Bạn có thể tự kiểm tra code của JaDict:

1. **Xem source code:**
   ```bash
   # Clone repo và đọc code
   git clone https://github.com/huuunleashed/jadict.git
   cd jadict
   code .  # Mở bằng VS Code
   ```

2. **Kiểm tra network requests:**
   - Mở DevTools (F12) → Tab **Network**
   - Bôi đen text để tra từ
   - Chỉ thấy requests đến `generativelanguage.googleapis.com` (Google Gemini)

3. **Đọc manifest.json:**
   - File `manifest.json` liệt kê **TẤT CẢ** quyền extension yêu cầu
   - Không có permissions ẩn hoặc đáng ngờ

---

## �️ Phát Triển & Đóng Góp

### 🏗️ Kiến Trúc Kỹ Thuật

**Tech Stack:**
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Build:** Không dùng build tool (zero-dependency)
- **APIs:** 
  - Chrome Extension API (Manifest V3)
  - Google Gemini API (REST)

**Cấu trúc project:**
```
jadict/
├── manifest.json          # Extension manifest (config chính)
├── background.js          # Service worker (xử lý API calls)
├── content.js             # Content script (detect text selection)
├── content.css            # Popup styling
├── popup.html/js/css      # Extension popup (icon click)
├── options.html/js/css    # Settings page
├── loader.html/css        # Loading screen
├── dictionary.json        # Offline dictionary data (5000+ words)
└── README.md             # Documentation
```

**Luồng hoạt động:**
```
User bôi đen text
    ↓
content.js detect selection
    ↓
Tạo iframe popup
    ↓
background.js tra từ offline + gọi Gemini API
    ↓
Hiển thị kết quả trong popup
```

### 🤝 Hướng Dẫn Đóng Góp

Chúng tôi rất hoan nghênh mọi đóng góp! Dù bạn là developer hay người dùng thông thường.

#### **Cách 1: Báo Lỗi (Bug Report)**

1. Truy cập [GitHub Issues](https://github.com/huuunleashed/jadict/issues)
2. Click **New Issue** → Chọn template **Bug Report**
3. Điền đầy đủ thông tin:
   ```markdown
   **Mô tả lỗi:**
   (Mô tả chi tiết lỗi gặp phải)
   
   **Các bước tái hiện:**
   1. Mở trang ...
   2. Bôi đen text "..."
   3. Popup không hiển thị
   
   **Môi trường:**
   - Browser: Chrome 120.0.6099.224
   - OS: Windows 11
   - Extension version: 0.1
   
   **Screenshot:**
   (Đính kèm ảnh chụp màn hình)
   ```

#### **Cách 2: Đề Xuất Tính Năng (Feature Request)**

1. Tạo issue mới với template **Feature Request**
2. Mô tả tính năng mong muốn:
   ```markdown
   **Tính năng đề xuất:**
   Thêm chức năng lưu lịch sử tra từ
   
   **Lý do:**
   Muốn xem lại các từ đã tra để ôn tập
   
   **Đề xuất implementation:**
   - Lưu trong localStorage
   - Hiển thị trong popup
   - Có nút xóa lịch sử
   ```

#### **Cách 3: Đóng Góp Code**

**Prerequisites:**
- Biết JavaScript, HTML, CSS cơ bản
- Đã cài Git
- Có tài khoản GitHub

**Quy trình:**

```bash
# 1. Fork repo về tài khoản của bạn
# (Click nút "Fork" trên GitHub)

# 2. Clone về máy
git clone https://github.com/YOUR_USERNAME/jadict.git
cd jadict

# 3. Tạo branch mới
git checkout -b feature/ten-tinh-nang-cua-ban

# 4. Code và test kỹ
# (Load extension vào Chrome, test trên nhiều trang web)

# 5. Commit với message rõ ràng
git add .
git commit -m "Add: Thêm tính năng dark mode"

# 6. Push lên GitHub
git push origin feature/ten-tinh-nang-cua-ban

# 7. Tạo Pull Request
# Truy cập repo trên GitHub → Click "New Pull Request"
```

**Code Style:**
- Dùng **2 spaces** cho indentation
- **camelCase** cho biến/hàm JavaScript
- **kebab-case** cho CSS classes
- Comment code bằng **tiếng Anh** hoặc **tiếng Việt**
- Test kỹ trước khi submit PR

**Review Process:**
1. Maintainer sẽ review code trong 1-3 ngày
2. Nếu có thay đổi yêu cầu, bạn sẽ nhận được comment
3. Fix và push thêm commit vào cùng branch
4. Sau khi approve → Merge vào main branch
5. Tên bạn sẽ được thêm vào Contributors list 🎉

---

## � Giấy Phép (License)

JaDict được phát hành dưới **MIT License** - một trong những license open source tự do nhất.

### � Điều Khoản Ngắn Gọn

**Bạn được phép:**
- ✅ Sử dụng extension cho mục đích cá nhân hoặc thương mại
- ✅ Sửa đổi source code theo ý muốn
- ✅ Phân phối lại extension (miễn phí hoặc có phí)
- ✅ Nhúng vào dự án khác

**Điều kiện:**
- ⚠️ Phải giữ nguyên thông báo copyright và license
- ⚠️ Tác giả KHÔNG chịu trách nhiệm về bất kỳ thiệt hại nào

### 📝 License Text

```
MIT License

Copyright (c) 2024 huuunleashed

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## � Liên Hệ & Hỗ Trợ

### 🐛 Báo Lỗi & Yêu Cầu Tính Năng
- **GitHub Issues:** [github.com/huuunleashed/jadict/issues](https://github.com/huuunleashed/jadict/issues)
- **GitHub Discussions:** [github.com/huuunleashed/jadict/discussions](https://github.com/huuunleashed/jadict/discussions)

### 👨‍� Liên Hệ Developer
- **GitHub:** [@huuunleashed](https://github.com/huuunleashed)
- **Email:** huynhquochuu.huynh@gmail.com
- **Telegram:** [@huu_unleashed](https://t.me/huu_unleashed)

### 📚 Tài Nguyên Khác
- **Repository:** [github.com/huuunleashed/jadict](https://github.com/huuunleashed/jadict)
- **Documentation:** Xem file README này và [CHROMIUM_COMPATIBILITY_NOTES.md](CHROMIUM_COMPATIBILITY_NOTES.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)

---

## 🙏 Lời Cảm Ơn

JaDict không thể tồn tại nếu không có:

- **Google Gemini API** - Cung cấp AI translation miễn phí với chất lượng tuyệt vời
- **Cộng đồng Open Source** - Inspiration và feedback từ các extension tương tự
- **Beta Testers** - Những người dùng đầu tiên đã test và báo lỗi
- **Contributors** - Mọi người đã đóng góp code, ideas, và bug reports

**Cảm ơn tất cả những ai đã và đang ủng hộ JaDict! ❤️**

---

## ⭐ Hỗ Trợ Dự Án

Nếu bạn thấy JaDict hữu ích, hãy giúp chúng tôi lan tỏa:

- ⭐ **Star repository** trên GitHub - Giúp dự án dễ tìm thấy hơn
- 🐛 **Báo lỗi** - Mỗi bug report giúp extension tốt hơn
- 💬 **Chia sẻ** - Giới thiệu với bạn bè, đồng nghiệp
- 🤝 **Đóng góp code** - PR nào cũng được chào đón!
- 📝 **Viết review** - Chia sẻ trải nghiệm của bạn

---

<div align="center">

**Được tạo với ❤️ bởi [huuunleashed](https://github.com/huuunleashed)**

*Happy translating! 🚀*

---

![GitHub stars](https://img.shields.io/github/stars/huuunleashed/jadict?style=social)
![GitHub forks](https://img.shields.io/github/forks/huuunleashed/jadict?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/huuunleashed/jadict?style=social)

</div>
