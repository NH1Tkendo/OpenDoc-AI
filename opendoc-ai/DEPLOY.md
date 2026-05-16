# Hướng dẫn triển khai OpenDoc-AI lên VPS

Tài liệu này hướng dẫn chi tiết các bước để triển khai ứng dụng OpenDoc-AI lên máy chủ ảo (VPS) sử dụng Docker, Cloudflare và Nginx làm Reverse Proxy.

---

## 1. Chuẩn bị ứng dụng (Application Changes)

Trước khi deploy, ứng dụng đã được cấu hình các thay đổi sau:

- **Next.js Standalone Mode**: Đã thêm `output: 'standalone'` vào `next.config.ts`. Điều này giúp giảm kích thước Docker image đáng kể bằng cách chỉ bao gồm các file cần thiết để chạy ứng dụng.
- **Dockerfile**: Đã tạo file `Dockerfile` tối ưu hóa đa giai đoạn (multi-stage build).
- **Docker Compose**: Đã tạo file `docker-compose.yml` để quản lý container dễ dàng.

### Các biến môi trường cần thiết
Bạn cần tạo file `.env.production` trên VPS với các giá trị sau:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
PAT=your_github_personal_access_token
```

---

## 2. Thiết lập Cloudflare

1. **Trỏ Domain**: Truy cập Cloudflare DNS, thêm bản ghi `A` trỏ tên miền của bạn (ví dụ: `app.opendocai.com`) về IP của VPS. Đảm bảo bật biểu tượng đám mây (Proxy status: Proxied).
2. **SSL/TLS**:
   - Vào mục **SSL/TLS -> Overview**, chọn chế độ **Full** hoặc **Full (Strict)**.
   - (Tùy chọn) Vào **Edge Certificates**, bật **Always Use HTTPS**.

---

## 3. Thiết lập VPS

Kết nối SSH vào VPS của bạn và cài đặt Docker:

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Cài đặt Docker Compose
sudo apt install docker-compose-plugin -y
```

---

## 4. Triển khai bằng Docker

Có 2 cách chính để đưa code lên VPS:

### Cách A: Build trực tiếp trên VPS (Đơn giản nhất cho dự án nhỏ)
1. Clone code từ GitHub về VPS.
2. Tạo file `.env.production` như đã hướng dẫn ở mục 1.
3. Chạy lệnh:
   ```bash
   docker compose up -d --build
   ```

### Cách B: Docker Registry (Khuyên dùng cho CI/CD)
1. Build và đẩy image lên Docker Hub/GitHub Registry từ máy local:
   ```bash
   docker build -t your-username/opendoc-ai .
   docker push your-username/opendoc-ai
   ```
2. Trên VPS, tạo file `docker-compose.yml` trỏ đến image này và chạy:
   ```bash
   docker compose up -d
   ```

---

## 5. Cấu hình Nginx làm Reverse Proxy

Nginx sẽ nhận request từ Cloudflare và chuyển tiếp vào container Docker đang chạy ở cổng 3000.

1. Cài đặt Nginx:
   ```bash
   sudo apt install nginx -y
   ```
2. Tạo file cấu hình mới: `/etc/nginx/sites-available/opendocai`
   ```nginx
   server {
       listen 80;
       server_name your-domain.com; # Thay bằng domain của bạn

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           
           # Quan trọng để lấy đúng IP người dùng từ Cloudflare
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
3. Kích hoạt cấu hình:
   ```bash
   sudo ln -s /etc/nginx/sites-available/opendocai /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## 6. Bảo mật & Bảo trì

- **Firewall**: Chỉ mở các cổng cần thiết (22 cho SSH, 80 và 443 cho Nginx).
  ```bash
  sudo ufw allow 22
  sudo ufw allow 'Nginx Full'
  sudo ufw enable
  ```
- **Logs**: Xem log của ứng dụng:
  ```bash
  docker compose logs -f app
  ```
- **Cập nhật**: Khi có code mới:
  ```bash
  git pull
  docker compose up -d --build
  ```

Chúc bạn triển khai thành công!
