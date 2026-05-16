# Kế hoạch triển khai OpenDoc AI v1.1 (Implementation Plan)

Dựa trên bản đặc tả `SPEC-1.1.md` và hiện trạng của dự án, bản kế hoạch này chi tiết hóa các bước thực hiện để đạt được các mục tiêu của phiên bản 1.1.

## 1. Chế độ tối mặc định (Default Dark Mode)

### Mục tiêu
- Ứng dụng luôn khởi đầu ở chế độ Dark Mode.
- Giao diện đồng nhất và tuân thủ các quy tắc về độ tương phản.

### Các bước thực hiện
- [ ] **Bước 1.1: Cài đặt và cấu hình `next-themes`**
    - Kiểm tra `opendoc-ai/package.json` đã có `next-themes` (đã có v0.4.6).
    - Tạo/Cập nhật `opendoc-ai/components/theme-provider.tsx` (nếu chưa có).
- [ ] **Bước 1.2: Cập nhật Root Layout**
    - File: `opendoc-ai/app/layout.tsx`.
    - Bao bọc `children` bằng `ThemeProvider` với `defaultTheme="dark"` và `attribute="class"`.
- [ ] **Bước 1.3: Cập nhật Workspace Editor**
    - File: `opendoc-ai/components/workspace-editor.tsx`.
    - Xóa `data-color-mode="light"` cứng trong thẻ `div` bọc `MDEditor`.
    - Sử dụng hook `useTheme` từ `next-themes` để đồng bộ `MDEditor` với theme hệ thống.

---

## 2. Cải thiện Workflow (Dashboard Redirection)

### Mục tiêu
- Sau khi nhấn "Hoàn thành", người dùng được dẫn về trang Dashboard.

### Các bước thực hiện
- [ ] **Bước 2.1: Cập nhật logic trong `WorkspaceEditor`**
    - File: `opendoc-ai/components/workspace-editor.tsx`.
    - Import `useRouter` từ `next/navigation`.
    - Cập nhật hàm `handleSave`: Sau khi `saveDocument` thành công với `status === 'completed'`, sử dụng `router.push('/dashboard')`.
    - (Tùy chọn) Thêm thông báo toast thay vì `alert()` để chuyên nghiệp hơn.

---

## 3. Tối ưu Project Card (Full Clickability)

### Mục tiêu
- Toàn bộ diện tích thẻ dự án đều có thể click để vào workspace.

### Các bước thực hiện
- [ ] **Bước 3.1: Chỉnh sửa component `ProjectCard`**
    - File: `opendoc-ai/components/project-card.tsx`.
    - Kiểm tra và đảm bảo thẻ `Link` bọc toàn bộ nội dung hoặc có `z-index` phù hợp để phủ toàn bộ card.
    - Đảm bảo nút "External Link" (mở GitHub) vẫn hoạt động độc lập (sử dụng `e.stopPropagation()` - đã có).
    - Cập nhật hiệu ứng hover để người dùng nhận biết toàn bộ vùng là clickable.

---

## 4. Nút lùi trong Workspace Editor (Back Navigation)

### Mục tiêu
- Thêm nút quay lại Dashboard dễ thấy trong trình soạn thảo.

### Các bước thực hiện
- [ ] **Bước 4.1: Cập nhật Header của `WorkspaceEditor`**
    - File: `opendoc-ai/components/workspace-editor.tsx`.
    - Thêm một `Button` mới ở góc trái header (trước tên dự án).
    - Sử dụng icon `Icons.ChevronLeft` (hoặc `ArrowLeft`).
    - Gán sự kiện `onClick={() => router.push('/dashboard')}`.
    - Đảm bảo styling phù hợp với giao diện hiện tại.

---

## 5. Kiểm tra và Nghiệm thu (Testing & Verification)

### Các bước thực hiện
- [ ] **Bước 5.1: Kiểm tra giao diện**
    - Mở ứng dụng lần đầu (hoặc ở chế độ ẩn danh) để xác nhận Dark Mode.
    - Kiểm tra màu sắc văn bản và các bề mặt (cards, sidebar).
- [ ] **Bước 5.2: Kiểm tra chức năng**
    - Click vào các vùng khác nhau trên Project Card.
    - Nhấn "Hoàn thành" trong Workspace và kiểm tra việc chuyển trang.
    - Nhấn nút "Quay lại" từ Workspace.
- [ ] **Bước 5.3: Chạy test suite**
    - Chạy `npm run lint`.
    - Chạy `npm test`.
    - Chạy Playwright E2E tests để đảm bảo không có regression.

---
*Kế hoạch này sẽ được thực hiện tuần tự để đảm bảo tính ổn định của ứng dụng.*
