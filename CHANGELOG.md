# Changelog

Tất cả các thay đổi đáng chú ý của dự án này được ghi lại trong tệp này.

## [v0.3.1] - 2025-10-30

### Fixed
- **Critical: Extension không kết nối được với API** - Sửa lỗi "Could not establish connection. Receiving end does not exist" trên Firefox
- **Critical: Background script không load được** - Xóa function call `refreshExtensionSettingsCache()` không tồn tại
- **Firefox manifest** - Thêm `settings.js` vào background scripts array
- **Message handling** - Cải thiện error handling trong `popup.js` với Promise wrapper và `runtime.lastError` check
- **Web accessible resources** - Thêm `dictionary.json` vào manifest để background script có thể fetch

## [v0.3.0] - 2025-10-30

### Added
- **Hướng dẫn API Key trong Options** - Thêm hướng dẫn chi tiết cách tạo Google Gemini API key vào tab Hướng dẫn của trang Options với 5 hình ảnh minh họa từng bước
- **QR Code Donation** - Thêm QR code MoMo vào tab Ủng hộ để người dùng dễ dàng scan và ủng hộ
- **Nút Hướng Dẫn Nhanh** - Thêm nút "? Hướng dẫn" nổi bật trong action popup để truy cập nhanh tab Hướng dẫn trong Options
- **Hash Navigation** - Hỗ trợ deep linking với hash (options.html#guide) để mở trực tiếp tab cụ thể

### Improved
- **UX Options Page** - Cải thiện giao diện tab Hướng dẫn với notice boxes (warning/info), code styling, và hình ảnh responsive
- **Action Popup Header** - Thiết kế lại header với layout rõ ràng hơn, phân tách nút Hướng dẫn và Cài đặt tổng
- **Dark Mode Support** - Tất cả styling mới đều hỗ trợ đầy đủ dark/light mode với CSS variables

## [v0.2.1] - 2025-10-30

### Fixed
- Sửa lỗi icons không hiển thị trong Firefox (manifest.firefox.json bị thiếu icons section)
- Sửa lỗi action popup không hoạt động trong Firefox (thiếu web_accessible_resources)
- Khôi phục và tái tạo manifest.firefox.json với format đúng

## [v0.2] - 2025-10-29

### Added
- Action popup dưới biểu tượng extension với bật/tắt toàn cục, bật/tắt theo trang, chỉnh theme, nhập API key và chọn mô hình
- Popup tra cứu có nút mở nhanh trang cài đặt tổng và hỗ trợ theme sáng/tối
- Trang cài đặt tổng làm mới với 3 tab (Cài đặt, Hướng dẫn, Ủng hộ) và quản lý blacklist tên miền

### Changed
- Đồng bộ lưu trữ cấu hình (theme, trạng thái hoạt động, blacklist) cho background, popup và options
- Popup tra cứu áp dụng hệ màu tương thích theme

## [v0.1] - 2025-10-27

### 🎉 Tính Năng Mới
- ✨ **Nút Copy Kết Quả Dịch** - Thêm nút "📋 Copy" để copy nhanh chóng dịch AI (chỉ copy bản dịch, không copy thêm thông tin khác)
- 📋 **Feedback Khi Copy** - Nút sẽ hiển thị "✓ Copied!" khi copy thành công

### 🐛 Sửa Lỗi
- ❌ **Fix: Popup Giật Giật Khi Kéo Rộng** - Loại bỏ ResizeObserver gây reload liên tục, popup giờ ổn định hơn
- ❌ **Fix: Độ Rộng Popup Quá Hạn Chế** - Tăng max-width từ 520px → 700px để hiển thị tốt hơn trên màn hình rộng
- ❌ **Fix: Handle Kéo Popup Không Ổn** - Bỏ thuộc tính `resize: horizontal` gây giật, container giờ có kích thước tối ưu
- ❌ **Fix: Manifest Tương Thích** - Hỗ trợ cả `service_worker` (Chromium) và `scripts` (Firefox)

### 📐 Thay Đổi UI
- 🎨 Tăng kích thước popup: 320px → 420px (mặc định)
- 🎨 Tăng max-height: 360px → 500px
- 🎨 Thêm CSS cho nút Copy với hiệu ứng hover và feedback

### 🔄 Cải Thiện Hiệu Năng
- ⚡ Loại bỏ ResizeObserver không cần thiết (giúp popup hoạt động mượt mà hơn)
- ⚡ Giảm số lần render lại content

---

## [v0.0] - 2025-10-26

### 🎉 Tính Năng Ban Đầu
- ✅ Dịch từ/câu bằng cách bôi đen (selection)
- ✅ Tra cứu từ điển offline cục bộ
- ✅ Sử dụng Google Gemini AI cho dịch phức tạp
- ✅ Hỗ trợ tiếng Anh ↔️ Tiếng Việt
- ✅ Popup hiển thị tại vị trí bôi đen
- ✅ Tự động phát hiện ngôn ngữ
- ✅ Hỗ trợ đa trình duyệt (Chrome, Edge, Firefox, Zen)

### 🌟 Các Mô Hình Gemini Hỗ Trợ
- gemini-2.5-flash (tốc độ cao, chất lượng tốt)
- gemini-2.5-flash-lite (siêu nhanh, tiết kiệm token - mặc định)
- gemini-2.5-pro (chất lượng cao nhất)

---

## Quy Ước Commit

- `feat:` - Tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Cập nhật tài liệu
- `style:` - Thay đổi style/CSS
- `refactor:` - Refactor code
- `perf:` - Cải thiện hiệu năng
