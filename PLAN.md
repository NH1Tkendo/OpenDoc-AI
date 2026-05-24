# Kế hoạch thực hiện v0.2 (PLAN.md)

Kế hoạch này chi tiết hóa các bước triển khai kỹ thuật cho phiên bản 0.2, đảm bảo tính ổn định và bảo mật cho hệ thống OpenDoc AI chạy trên Docker/VPS.

---

## Giai đoạn 1: Nền tảng Database & Analytics (Hệ thống ổn định)
*Mục tiêu: Thiết lập cơ sở dữ liệu và các cơ chế thống kê tự động.*

1.  [ ] **Thi công Database:** Chạy các script SQL trong `SETUP.md` trên Supabase.
2.  [ ] **Phân quyền Admin:**
    *   Thiết lập flag `is_admin` cho tài khoản admin trong Supabase.
    *   Cập nhật Middleware để chặn người dùng không phải admin truy cập `/dashboard`.
3.  [ ] **Tích hợp Analytics API:** 
    *   Tạo API route để gọi hàm `increment_visit_count()` mỗi khi Dashboard được render.
    *   Thử nghiệm trigger `on_project_created` bằng cách tạo project giả.
4.  [ ] **UI Analytics:** Thiết kế các Stat Cards trên Dashboard để hiển thị `visit_count` và `ai_generation_count`.

---

## Giai đoạn 2: Quản lý API & Rate Limiting (Tối ưu tài nguyên)
*Mục tiêu: Cho phép người dùng cấu hình key cá nhân và bảo vệ tài nguyên AI.*

1.  [ ] **Trang Quản lý Cấu hình:** 
    *   Tạo form nhập Gemini Key, Supabase Keys.
    *   Tính năng "Check Connection": Gọi thử API Gemini `listModels()` để xác thực key.
2.  [ ] **Logic Rate Limiting:**
    *   Viết logic kiểm tra bảng `user_usage` trước khi gọi Gemini AI.
    *   Cập nhật `usage_count` sau mỗi lần tạo tài liệu thành công.
    *   Trả về thông báo lỗi thân thiện khi vượt quá hạn mức.

---

## Giai đoạn 3: VPS CLI Integration (Nâng cao quản trị)
*Mục tiêu: Nhúng Terminal trực tiếp vào Dashboard.*

1.  [ ] **Cấu trúc lại Docker Server:**
    *   Tạo file `server-custom.js` để tích hợp `Socket.io` vào Next.js standalone server.
    *   Cập nhật `Dockerfile` để chạy bằng server tùy chỉnh này.
2.  [ ] **Backend SSH Bridge:**
    *   Sử dụng `ssh2` để thiết lập kết nối từ server tới Host VPS.
    *   Pipe luồng dữ liệu (stdin/stdout) qua WebSockets.
3.  [ ] **Frontend Terminal UI:**
    *   Cài đặt và cấu hình `xterm.js`.
    *   Xử lý việc co dãn (Fit addon) và màu sắc theo chuẩn Dark Mode.

---

## Giai đoạn 4: Kiểm thử & Triển khai
*Mục tiêu: Đảm bảo mọi thứ hoạt động trơn tru trên VPS thực tế.*

1.  [ ] **E2E Testing:** Kiểm tra luồng từ lúc nhập API Key -> Tạo README -> Xem Analytics.
2.  [ ] **Security Audit:** Đảm bảo SSH Key không bị lộ qua console log hoặc API response. Kiểm tra quyền của user SSH.
3.  [ ] **Re-deploy Docker:** Cập nhật image Docker trên DigitalOcean và khởi chạy phiên bản mới.

---
**Ghi chú:** Ưu tiên thực hiện Giai đoạn 1 và 2 trước để có nền tảng quản lý tốt, Giai đoạn 3 là tính năng phức tạp nhất sẽ thực hiện sau khi hệ thống database đã ổn định.
