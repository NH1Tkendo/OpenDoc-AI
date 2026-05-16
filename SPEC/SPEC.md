# OpenDoc AI - Technical Specification (SPEC.md)

## 1. Tổng quan dự án (Project Overview)
OpenDoc AI là nền tảng SaaS hỗ trợ lập trình viên tự động hóa quy trình viết tài liệu `README.md` chuyên nghiệp bằng cách phân tích trực tiếp mã nguồn từ GitHub thông qua AI (Gemini).

*   **Tầm nhìn:** Biến mọi dự án cá nhân thành dự án mã nguồn mở chuẩn mực trong vài giây.
*   **Giá trị cốt lõi:** Tiết kiệm thời gian, Zero-setup, Góc nhìn kiến trúc tổng thể (Macro view).

---

## 2. Logic nghiệp vụ & Luồng người dùng (Business Logic & User Flow)

### 2.1. Luồng trải nghiệm chính
1.  **Xác thực:** Người dùng đăng nhập qua GitHub OAuth.
2.  **Nhập liệu:** Dán link repository GitHub (Public).
3.  **Xử lý (Data Pipeline):**
    *   Hệ thống bóc tách `owner` và `repo` từ URL.
    *   Quét cấu trúc thư mục qua GitHub Trees API. **Sử dụng GitHub Personal Access Token (PAT) cấu hình ngầm trên backend để mở rộng giới hạn API lên 5.000 requests/giờ.**
    *   Lọc bỏ thư mục rác (node_modules, .git, etc.).
    *   Nhận diện các tệp "điểm neo" (package.json, Dockerfile, v.v.).
    *   Tải nội dung tệp song song.
4.  **Sinh tài liệu (AI Engine):** AI phân tích ngữ cảnh và sinh Markdown theo cấu trúc chuẩn.
5.  **Biên tập & Hoàn thiện:** Người dùng chỉnh sửa trên Split-pane Editor và xem Preview thời gian thực.
6.  **Lưu trữ/Xuất bản:** Lưu nháp (Draft) hoặc đánh dấu hoàn thành (Completed) vào Database, hoặc Copy/Download tài liệu.

### 2.2. Các Module chức năng chính
*   **Module 1: Auth & Profile:** Quản lý phiên và đồng bộ avatar/username từ GitHub.
*   **Module 2: Crawler Engine:** Xử lý logic lọc tệp thông minh (Smart Filtering) để tối ưu token AI.
*   **Module 3: AI Orchestrator:** Quản lý System Prompt, xử lý stream kết quả từ Gemini.
*   **Module 4: Editor Workspace:** 
    *   **Cột trái:** Khung soạn thảo Markdown và **thanh Sidebar nhỏ hiển thị cây thư mục dự án vừa quét**.
    *   **Cột phải:** Khung Preview HTML theo thời gian thực.
    *   Lưu trữ trạng thái tài liệu (Draft/Completed) liên kết với dự án.

---

## 3. Đặc tả kỹ thuật (Technical Specifications)

### 3.1. Tech Stack
*   **Frontend:** Next.js 14+ (App Router), Tailwind CSS, Shadcn/UI, **`@uiw/react-md-editor` (hoặc `monaco-editor`)**.
*   **Backend:** Next.js Route Handlers.
*   **Database & Auth:** Supabase (PostgreSQL, GoTrue) và RLS (Row Level Security).
*   **AI:** Google Gemini API.
*   **Integration:** GitHub REST API.

### 3.2. Cấu trúc dữ liệu (Database Schema)
*   **Table `profiles`:** `id (uuid)`, `username`, `avatar_url`, `updated_at`.
*   **Table `projects`:** `id`, `user_id`, `repo_url`, `repo_name`, `description`.
*   **Table `documents`:** `id`, `project_id`, `content (text)`, `status (draft/completed)`, `created_at`.

---

## 4. Chiến lược AI (AI Strategy)

### 4.1. System Prompt
AI sẽ được đóng vai (Role-playing) là "Senior Technical Writer".
*   **Input:** Cấu trúc thư mục + Nội dung các tệp cấu hình quan trọng.
*   **Output:** Markdown gồm: Badges, Tech Stack, Architecture, Installation, Usage, Contributing.

### 4.2. Tối ưu hóa ngữ cảnh (Context Optimization)
*   Chỉ gửi nội dung các tệp có giá trị kiến trúc cao (config files, main entry points).
*   Sử dụng Mock Data mode (chuyển đổi JSON/Markdown tĩnh) để phát triển UI mà không tốn API quota.

---

## 5. Lộ trình triển khai (Roadmap - 7 Ngày)

*   **Ngày 1-2:** Setup base (Next.js + Supabase), UI Split-pane cơ bản.
*   **Ngày 3-4:** Xây dựng Pipeline kết nối GitHub API và logic lọc tệp.
*   **Ngày 5-6:** Tích hợp Gemini API, tinh chỉnh Prompt và xử lý Markdown stream.
*   **Ngày 7:** Kiểm thử luồng cuối (E2E), tối ưu hóa trải nghiệm người dùng và Deploy Vercel.

---

## 6. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Đăng nhập thành công bằng GitHub.
- [ ] Phân tích đúng cấu trúc bất kỳ repo public nào (vượt rate limit nhờ PAT).
- [ ] AI sinh ra Markdown có cấu trúc đầy đủ và chính xác.
- [ ] Giao diện Split-pane có Sidebar cây thư mục và Preview thời gian thực.
- [ ] Hỗ trợ lưu trạng thái tài liệu (Draft/Completed) và Copy/Download README.md.