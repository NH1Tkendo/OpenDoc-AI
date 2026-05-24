# Hướng dẫn thiết lập v0.2 (SETUP.md)

Tài liệu này hướng dẫn các bước thiết lập thủ công trên **Supabase** và **DigitalOcean** để chuẩn bị cho các tính năng trong phiên bản 0.2.

---

## 1. Thiết lập trên Supabase (SQL Editor)

Hãy copy và chạy các câu lệnh SQL sau trong phần **SQL Editor** của Supabase để khởi tạo Database và Triggers.

### 1.1. Khởi tạo bảng dữ liệu
```sql
-- Bảng lưu cấu hình API và SSH của người dùng
CREATE TABLE IF NOT EXISTS public.user_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    gemini_api_key TEXT,
    supabase_url TEXT,
    supabase_anon_key TEXT,
    vps_ssh_host TEXT,
    vps_ssh_user TEXT,
    vps_ssh_key TEXT, -- Nên được mã hóa ở ứng dụng trước khi lưu
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Bảng lưu chỉ số thống kê (Analytics)
CREATE TABLE IF NOT EXISTS public.analytics (
    id SERIAL PRIMARY KEY,
    visit_count BIGINT DEFAULT 0,
    ai_generation_count BIGINT DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Khởi tạo dòng dữ liệu đầu tiên cho analytics nếu chưa có
INSERT INTO public.analytics (id, visit_count, ai_generation_count)
VALUES (1, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Bảng theo dõi hạn mức sử dụng AI (Rate Limiting)
CREATE TABLE IF NOT EXISTS public.user_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_count INT DEFAULT 0,
    last_reset TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 1.3. Phân quyền Admin
-- Thêm cột is_admin vào bảng profiles đã có sẵn
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Câu lệnh để tự cấp quyền Admin cho chính mình (Thay email của bạn vào)
-- UPDATE public.profiles SET is_admin = TRUE WHERE email = 'your-email@example.com';
```

### 1.2. Thiết lập Triggers cho Analytics
```sql
-- Hàm tăng số lượt truy cập (Cần gọi từ app khi user load dashboard)
CREATE OR REPLACE FUNCTION increment_visit_count()
RETURNS void AS $$
BEGIN
    UPDATE public.analytics
    SET visit_count = visit_count + 1,
        last_updated = now()
    WHERE id = 1;
END;
$$ LANGUAGE plpgsql;

-- Trigger tự động tăng số lượt dùng AI khi có dự án mới được tạo
CREATE OR REPLACE FUNCTION public.handle_new_ai_project()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.analytics
    SET ai_generation_count = ai_generation_count + 1,
        last_updated = now()
    WHERE id = 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_project_created
    AFTER INSERT ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_ai_project();
```

---

## 2. Thiết lập trên DigitalOcean (VPS)

### 2.1. Tạo User SSH bảo mật (Khuyến nghị)
Thay vì dùng `root`, hãy tạo một user riêng cho ứng dụng:
```bash
# Truy cập vào VPS qua SSH root trước
adduser opendoc_user
usermod -aG docker opendoc_user # Cho phép user này dùng docker
```

### 2.2. Cấu hình SSH Key
1. Tạo cặp khóa SSH trên máy của bạn (hoặc dùng khóa hiện có).
2. Thêm Public Key vào `/home/opendoc_user/.ssh/authorized_keys`.
3. Lưu Private Key để điền vào phần cấu hình trong Dashboard của app.

### 2.3. Cấu hình Môi trường Docker
Đảm bảo file `.env` trên VPS có đủ các biến mới (sau khi code xong):
*   `SSH_PRIVATE_KEY`: Khóa bí mật để app kết nối SSH.
*   `GEMINI_RATE_LIMIT`: Hạn mức (ví dụ: 10).

---

## 3. Kiểm tra kết nối
Sau khi hoàn thành các bước trên:
1. Vào Supabase Dashboard -> Table Editor để kiểm tra các bảng đã xuất hiện.
2. Thử tạo một project mới và xem `ai_generation_count` trong bảng `analytics` có tự tăng lên không.
