# OpenDoc AI - Technical Specification v0.2 (SPEC-0.2.md)

## 1. Tổng quan dự án (Project Overview)
Bản cập nhật này tập trung vào việc tối ưu hóa tài nguyên (Rate Limiting), mở rộng khả năng quản trị máy chủ (VPS CLI) và cung cấp các chỉ số đo lường hiệu quả (Analytics).

---

## 2. Các tính năng chính (Core Features)

### 2.1. Giới hạn lưu lượng Gemini AI (Rate Limiting)
*   **Yêu cầu:** Thiết lập giới hạn số lần gọi API Gemini cho mỗi người dùng trong một khoảng thời gian nhất định (ví dụ: 10 lần/giờ hoặc 50 lần/ngày).
*   **Mục tiêu:** Kiểm soát chi phí API và ngăn chặn việc lạm dụng tài nguyên.
*   **Kỹ thuật:** 
    *   Sử dụng middleware hoặc một service trung gian để kiểm tra quota trước khi gọi `gemini.ts`.
    *   Lưu trữ số lượt sử dụng trong bảng `user_usage` tại Supabase.
    *   Phản hồi lỗi `429 Too Many Requests` kèm thông báo thân thiện khi vượt hạn mức.

### 2.2. Dashboard mở rộng (Enhanced Dashboard)

#### 2.2.1. Màn hình Linux CLI (VPS Terminal)
*   **Yêu cầu:** Tích hợp một cửa sổ dòng lệnh (CLI) trực tiếp trên trình duyệt, cho phép quản trị trực tiếp VPS đang chạy Docker.
*   **Kỹ thuật (Docker-native):**
    *   **Frontend:** Sử dụng `xterm.js` để render terminal. Kết nối tới backend qua `socket.io-client`.
    *   **Backend (Custom Node.js Server):** Vì ứng dụng chạy bằng Docker (`node server.js`), ta sẽ tích hợp `socket.io` vào server này. 
    *   **SSH Bridge:** Khi nhận kết nối từ socket, backend sử dụng thư viện `ssh2` để mở một phiên SSH tới chính host VPS (thông qua IP nội bộ của Docker bridge hoặc Public IP).
    *   **Bảo mật:** 
        *   Sử dụng SSH Key (Private Key) được lưu trong biến môi trường hoặc bảng `user_configs`.
        *   Middleware xác thực người dùng trước khi cho phép mở socket.
        *   Giới hạn quyền của user SSH (nên dùng một user non-root để bảo mật).

#### 2.2.2. Quản lý API Keys
*   **Yêu cầu:** Giao diện tập trung để quản lý các khóa bí mật.
    *   **Supabase Keys:** Cho phép xem/cập nhật URL và Anon Key.
    *   **Gemini AI Keys:** Cho phép cập nhật API Key.
    *   **Tính năng Check Connection:** Một nút "Kiểm tra kết nối" bên cạnh Gemini Key để verify key còn hoạt động hay không thông qua một request thử nghiệm (e.g., gọi `listModels`).

#### 2.2.3. Chỉ số đo lường (Analytics & Usage Tracking)
*   **Yêu cầu:** Hiển thị 2 thông số chính:
    1.  **Số lượt truy cập (Total Visits):** Tổng số lần người dùng vào dashboard.
    2.  **Số lượt sử dụng AI (AI Generations):** Tổng số tài liệu README đã được tạo thành công.
*   **Kỹ thuật (Supabase Triggers):**
    *   **Visits:** Sử dụng trigger `after_insert` trên bảng `user_sessions` (hoặc log truy cập) để tăng biến count trong bảng `analytics`.
    *   **AI Usage:** Sử dụng trigger `after_insert` trên bảng `projects` để tự động tăng số lượng `ai_generation_count` mỗi khi một dự án mới được lưu.

### 2.3. Quyền truy cập Admin (Admin Access Control)
*   **Yêu cầu:** Chỉ tài khoản được cấp quyền Admin mới có thể truy cập vào đường dẫn `/dashboard`. Người dùng thông thường khi truy cập sẽ bị điều hướng về trang chủ hoặc thông báo lỗi.
*   **Kỹ thuật:**
    *   **Phân quyền:** Sử dụng `app_metadata` trong Supabase Auth hoặc thêm cột `is_admin` vào bảng `profiles`.
    *   **Bảo vệ Route:** Cập nhật Middleware và Server Component của trang Dashboard để kiểm tra quyền admin trước khi render.
    *   **Điều hướng:** Nếu không phải admin, thực hiện `redirect('/')`.

---

## 3. Đặc tả kỹ thuật bổ sung (Additional Technical Specs)

### 3.1. UI/UX Strategy (Sử dụng ui-ux-pro-max)
*   **CLI UI:** Sử dụng font Mono (Geist Mono), nền đen sâu, màu chữ xanh lá truyền thống (`#00FF00`) hoặc trắng để tạo cảm giác terminal thực thụ.
*   **API Management:** Sử dụng các input dạng password (ẩn giá trị mặc định) và nút "Show/Hide". Trạng thái "Check Connection" cần có loading spinner và thông báo Success/Error rõ ràng.
*   **Analytics Dashboard:** Sử dụng các "Stat Cards" với icon minh họa và số liệu lớn, rõ ràng.

### 3.2. Database Schema (Đề xuất)
*   Bảng `user_configs`: Lưu `api_keys`, `vps_ssh_info`.
*   Bảng `analytics`: `visit_count`, `ai_generation_count`, `last_updated`.

---

## 4. Tiêu chí nghiệm thu v0.2 (Acceptance Criteria v0.2)
- [ ] Người dùng không thể gọi AI quá giới hạn đã định cấu hình.
- [ ] Terminal kết nối và thực thi lệnh được trên VPS DigitalOcean.
- [ ] Nút "Check Connection" phản hồi đúng trạng thái của API Key.
- [ ] Số lượt truy cập và số lượt dùng AI tự động cập nhật chính xác nhờ Trigger.
- [ ] Giao diện nhất quán với Dark Mode và các tiêu chuẩn của `SPEC-1.1.md`.

---
*Tài liệu này được soạn thảo dựa trên yêu cầu nâng cấp hệ thống và quản trị máy chủ.*
