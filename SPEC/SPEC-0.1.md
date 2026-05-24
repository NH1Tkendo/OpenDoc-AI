# OpenDoc AI - Technical Specification v1.1 (SPEC-1.1.md)

## 1. Tổng quan dự án (Project Overview)
OpenDoc AI là nền tảng SaaS hỗ trợ lập trình viên tự động hóa quy trình viết tài liệu `README.md` chuyên nghiệp bằng cách phân tích trực tiếp mã nguồn từ GitHub thông qua AI (Gemini).

*   **Tầm nhìn:** Biến mọi dự án cá nhân thành dự án mã nguồn mở chuẩn mực trong vài giây.
*   **Giá trị cốt lõi:** Tiết kiệm thời gian, Zero-setup, Góc nhìn kiến trúc tổng thể (Macro view).

---

## 2. Các thay đổi và bổ sung trong phiên bản 1.1 (Version 1.1 Updates)

### 2.1. Chế độ tối mặc định (Default Dark Mode)
*   **Yêu cầu:** Ứng dụng sẽ được đặt ở chế độ tối (Dark Mode) theo mặc định.
*   **UI/UX Pro Max Guideline:** Sử dụng hệ màu tối với độ tương phản văn bản >= 4.5:1. Các bề mặt (surfaces/cards) cần có sự phân cấp rõ ràng thông qua elevation hoặc opacity (scrim 40-60% black cho modal).
*   **Kỹ thuật:** Cấu hình Tailwind CSS để ưu tiên `class="dark"` hoặc thiết lập `defaultTheme: 'dark'` trong các thư viện UI (Shadcn/UI).

### 2.2. Cải thiện Workflow (Workflow Enhancement)
*   **Yêu cầu:** Sau khi người dùng nhấn nút "Hoàn thành" (Complete) trong Workspace Editor, hệ thống sẽ tự động điều hướng người dùng quay lại trang Dashboard thay vì ở lại trang hiện tại.
*   **Mục tiêu:** Giảm bớt thao tác thừa cho người dùng sau khi đã hoàn tất mục tiêu chính là tạo tài liệu.
*   **Kỹ thuật:** Sử dụng `router.push('/dashboard')` trong Next.js sau khi action lưu trạng thái "completed" thành công.

### 2.3. Cải thiện Project Card (Card Clickability)
*   **Yêu cầu:** Toàn bộ diện tích của `project-card` sẽ có khả năng tương tác (clickable). Khi bấm vào bất kỳ vị trí nào trên card, người dùng đều được dẫn vào dự án đó.
*   **Hiện trạng:** Chỉ bấm được vào nửa dưới card.
*   **UI/UX Pro Max Guideline:** Đảm bảo toàn bộ card có phản hồi khi nhấn (pressed feedback như ripple hoặc opacity shift). Sử dụng `Pressable` hoặc `Link` bọc toàn bộ component card.
*   **Kỹ thuật:** Thay đổi cấu trúc DOM của `ProjectCard` component để `Link` bọc bên ngoài toàn bộ nội dung card.

### 2.4. Nút lùi trong Workspace Editor (Back Navigation)
*   **Yêu cầu:** Thêm một nút "Quay lại" (Back button) rõ ràng trong giao diện Workspace Editor để người dùng có thể quay lại trang Dashboard bất cứ lúc nào.
*   **UI/UX Pro Max Guideline:** Nút lùi cần đặt ở vị trí dễ thấy (thường là góc trên bên trái hoặc trong thanh toolbar). Sử dụng icon chuẩn (chevron-left) kèm label "Dashboard" hoặc "Back".
*   **Kỹ thuật:** Thêm component nút trong `WorkspaceEditor`, sử dụng `useRouter` của Next.js để thực hiện `router.back()` hoặc `router.push('/dashboard')`.

---

## 3. Đặc tả kỹ thuật bổ sung (Additional Technical Specs)

### 3.1. UI/UX Strategy (Sử dụng ui-ux-pro-max)
*   **Theme:** Dark-first strategy. Sử dụng các token màu desaturated cho dark mode để tránh mỏi mắt.
*   **Interactions:** Micro-interactions (150-300ms) cho các trạng thái hover/press trên card và nút.
*   **Navigation:** Đảm bảo stack integrity khi quay lại dashboard, duy trì scroll position nếu có thể.

### 3.2. Cập nhật Database/API (nếu cần)
*   Không có thay đổi về Schema trong bản này. Chỉ thay đổi logic điều hướng và thuộc tính hiển thị UI.

---

## 4. Tiêu chí nghiệm thu v1.1 (Acceptance Criteria v1.1)
- [ ] Giao diện mặc định khi tải trang là Dark Mode.
- [ ] Bấm "Hoàn thành" trong editor dẫn về Dashboard thành công.
- [ ] Project Card clickable 100% diện tích bề mặt.
- [ ] Workspace Editor có nút "Quay lại Dashboard" hoạt động đúng.
- [ ] Tất cả các thay đổi UI tuân thủ tiêu chuẩn của `ui-ux-pro-max`.

---
*Tài liệu này được kế thừa từ SPEC.md và bổ sung các yêu cầu cho phiên bản 1.1.*
