# Changelog

Tất cả các thay đổi đáng chú ý của dự án này được ghi lại trong tệp này.

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
