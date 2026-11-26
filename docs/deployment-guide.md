# Deployment Guide — Hướng dẫn cài đặt và triển khai

Chạy dự án trên máy mới trong khoảng 10 phút bằng **hai lệnh** (Docker) hoặc cài tay. **Đã chạy thử từng bước** ngày 26/11/2026 trên bản sao sạch của mã nguồn (Windows 11, Docker 29.9.2, PostgreSQL 16.16 trong container; `docker compose up -d --build` mất 64 giây ở lần dựng đầu), và ngày 20/11/2026 theo đường cài tay (Node.js 24, PostgreSQL 18.6). Kết quả kiểm tra: [checklist-bao-mat.md](checklist-bao-mat.md), [test-report.md](test-report.md) §9.

## 1. Yêu cầu

- **Đường Docker (khuyến nghị):** Docker Desktop (Windows/macOS) hoặc Docker Engine kèm Compose v2 (`docker compose version`), Git; các cổng `3000`, `5173`, `5433` còn trống. Không cần cài Node.js hay PostgreSQL.
- **Đường cài tay:** Windows, macOS hoặc Linux; Git; Node.js 20 trở lên (kèm npm); PostgreSQL 16; các cổng `3000`, `5173`, `5432` còn trống.

## 2. Các bước cài đặt

### 2.1. Bằng Docker (hai lệnh)

```bash
git clone https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03 && cd cdtn2-nhom03
cp .env.example .env                  # PowerShell: Copy-Item .env.example .env
docker compose up -d --build          # lần đầu khoảng 1 phút
```

Bảng và dữ liệu mẫu được dựng tự động (không cần lệnh thứ ba); mở http://localhost:5173. Ba dịch vụ `db` (PostgreSQL 16), `api`, `web` đều có healthcheck. Khởi động lại khi CSDL đã có dữ liệu thì bước nạp mẫu tự bỏ qua. Chi tiết: [huong-dan-docker.md](huong-dan-docker.md).

### 2.2. Cài tay

1. Lấy mã nguồn: `git clone https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03`, rồi `cd cdtn2-nhom03`.
2. Tạo người dùng và hai CSDL (chạy trong `psql` bằng tài khoản quản trị):

   ```sql
   CREATE USER nhom03 WITH PASSWORD 'nhom03' CREATEDB;
   CREATE DATABASE suachua_dev OWNER nhom03;
   CREATE DATABASE suachua_test OWNER nhom03;
   ```

3. Cài thư viện của backend và giao diện: `npm ci`, rồi `npm --prefix frontend ci`.
4. Tạo file `.env`: `cp .env.example .env` (PowerShell: `Copy-Item .env.example .env`). File mẫu đã có giá trị chạy được cho máy cá nhân, không cần sửa. File `.env` nằm trong `.gitignore`.
5. Dựng bảng và nạp dữ liệu mẫu: `npm run migrate`, rồi `npm run seed`.
6. Chạy backend (cổng 3000) và giao diện (cổng 5173) cùng lúc bằng `npm run dev` (chỉ chạy API: `npm start`), rồi mở http://localhost:5173.

## 3. Biến môi trường (`.env`)

`.env.example` có đủ mọi biến với giá trị mẫu chạy được. Các giá trị này **chỉ dành cho máy cá nhân**; triển khai thật phải đổi (mục 8).

| Tên | Ý nghĩa | Giá trị mẫu | Bắt buộc |
|---|---|---|---|
| `DATABASE_URL` | Chuỗi kết nối CSDL chạy ứng dụng (đường cài tay) | `postgres://nhom03:nhom03@localhost:5432/suachua_dev` | có |
| `JWT_SECRET` | Khóa ký token đăng nhập, **từ 32 ký tự trở lên** (ngắn hơn thì backend từ chối khởi động). Tạo khóa mới: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | `khoa-mau-chi-de-phat-trien-doi-truoc-khi-trien-khai-0123456789` | có |
| `TEST_DATABASE_URL` | CSDL riêng cho `npm test`, bị **xóa và dựng lại** mỗi lần chạy (không trỏ vào CSDL đang dùng) | `postgres://nhom03:nhom03@localhost:5432/suachua_test` | chỉ khi chạy test |
| `PORT` | Cổng backend | `3000` | không |
| `JWT_EXPIRES_IN` | Thời hạn token | `1d` | không |
| `CLIENT_URL` | Địa chỉ giao diện được CORS cho phép (chỉ địa chỉ này, không dùng `*`) | `http://localhost:5173` | không |
| `DB_PASSWORD` | Mật khẩu user `nhom03` của CSDL trong Docker (đặt khi volume CSDL được tạo lần đầu) | `nhom03` | chỉ khi dùng Docker |
| `DB_PORT` | Cổng CSDL Docker mở ra máy chủ | `5433` | không |

Thiếu `DATABASE_URL` hoặc `JWT_SECRET`, hoặc `JWT_SECRET` ngắn hơn 32 ký tự, thì backend dừng ngay khi khởi động; thiếu `DB_PASSWORD` hoặc `JWT_SECRET` thì `docker compose` dừng và báo "hãy chạy lệnh cp .env.example .env". Hai biến của giao diện đặt trong môi trường khi chạy hoặc build giao diện: `VITE_API_PROXY` (đích chuyển tiếp `/api` khi phát triển, mặc định `http://localhost:3000`) và `VITE_API_URL` (địa chỉ API khi build, mặc định `/api`).

## 4. Dữ liệu mẫu

`npm run seed` (Docker thì tự chạy ở lần đầu) tạo **247 tài khoản, 1050 tin sửa chữa, 2191 đề xuất, 566 đánh giá**: 17 tài khoản và 50 tin viết tay nhắm từng tình huống, cộng 230 tài khoản và 1000 tin tự động. Mật khẩu chung `Demo@123`; ba tài khoản chính: quản trị viên `admin@demo.vn`, khách hàng `khach1@demo.vn`, kỹ thuật viên `ktv1@demo.vn` (danh sách đầy đủ: [seeds/README.md](../seeds/README.md)). Đối chiếu: `docker compose exec db psql -U nhom03 -d suachua_dev -c "select count(*) from users"` phải ra 247. Chạy seed lần hai sẽ bị từ chối; muốn làm lại từ đầu dùng `npm run seed:reset` (xóa toàn bộ dữ liệu ứng dụng). Tạo thêm quản trị viên: `npm run create-admin -- <email> <mật khẩu> "<họ tên>" <số điện thoại>`.

## 5. Kiểm tra chạy được

Chạy lần lượt. PowerShell gõ `curl.exe` (`curl` là bí danh của `Invoke-WebRequest`, báo `missing mandatory parameters: Uri`); macOS/Linux gõ `curl` và đưa JSON ở dòng 4 qua `-d '<JSON>'`.

| # | Lệnh | Kết quả mong đợi |
|---|---|---|
| 1 | `docker compose ps` (chỉ đường Docker) | `db`, `api`, `web` đều `Up ... (healthy)` |
| 2 | `curl.exe http://localhost:3000/api/health` | `{"success":true,"data":{"status":"ok"},"message":"Thành công"}` — chỉ cho biết backend đã chạy, **không** kiểm tra CSDL |
| 3 | `curl.exe -i http://localhost:3000/api/requests/my` | `HTTP/1.1 401 Unauthorized`, `"code":"UNAUTHORIZED"` (API được bảo vệ) |
| 4 | `'{"email":"khach1@demo.vn","password":"Demo@123"}' \| curl.exe -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "@-"` | `"success":true`, có `token` và `"role":"CUSTOMER"` (kiểm tra được CSDL thật và dữ liệu mẫu) |
| 5 | `curl.exe http://localhost:5173/api/health` | giống dòng 2: giao diện chuyển tiếp `/api` sang backend |
| 6 | `npm test` (Docker: `docker compose exec api npm test`) | `tests 157`, `pass 157`, `fail 0` sau khoảng 10–20 giây |

## 6. Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
|---|---|---|
| `Chưa có DB_PASSWORD` hoặc `Chưa có JWT_SECRET` khi chạy `docker compose` | Chưa có file `.env` | `cp .env.example .env` rồi chạy lại |
| `JWT_SECRET quá ngắn (cần ít nhất 32 ký tự)` | Khóa trong `.env` ngắn hơn 32 ký tự | Tạo khóa mới bằng lệnh `node -e` ở mục 3 |
| `Thiếu biến môi trường DATABASE_URL` (hoặc `JWT_SECRET`) | Chưa có `.env` ở thư mục gốc, hoặc để trống giá trị | Tạo `.env` theo bước 4 rồi chạy lại |
| `password authentication failed for user "nhom03"` hoặc `database "..." does not exist` | Sai mật khẩu hoặc tên CSDL trong `DATABASE_URL`, hoặc chưa làm bước 2 | Sửa `.env` cho khớp, hoặc tạo lại người dùng và CSDL (bước 2). Docker: `docker compose down -v` rồi dựng lại nếu đã đổi `DB_PASSWORD` |
| `Error: listen EADDRINUSE: address already in use :::3000` hoặc `port is already allocated` | Cổng 3000/5173/5433 đang bị chương trình khác dùng (có thể là `npm run dev` chạy sẵn) | Tắt chương trình đó, hoặc đổi `PORT` / `DB_PORT` trong `.env` |
| `Đã có tài khoản demo trong CSDL. Chạy "npm run seed:reset"...` | Đã `seed` trước đó | Dùng `npm run seed:reset` (xóa toàn bộ dữ liệu ứng dụng) |
| Lọc khu vực không khớp chữ `Đ/đ` (ví dụ "Thủ Đức") | CSDL tạo với locale `C`: `ILIKE` không gập hoa/thường chữ Đ | Tạo CSDL với locale UTF-8 (đã kiểm chứng `C.UTF-8`) |
| Container `api` thoát ngay sau khi `db` dừng | (đã sửa BUG-06) bản cũ không bắt lỗi ngắt kết nối CSDL | Cập nhật mã; bản mới trả `500 INTERNAL_ERROR` rồi tự nối lại khi `db` chạy lại |

## 7. Docker

Ba dịch vụ `db` (PostgreSQL 16), `api` (backend, tự chạy `migrate` rồi nạp mẫu nếu CSDL trống), `web` (Vite chuyển tiếp `/api` sang `api`) trong [docker-compose.yml](../docker-compose.yml). Cổng mở ở `127.0.0.1` để máy khác trong mạng không vào được. Đã kiểm tra trên bản sao sạch (`git ls-files -co --exclude-standard` chép sang thư mục trống, `cp .env.example .env`, `docker compose up -d --build`): cả ba dịch vụ `healthy`, `npm test` 157/157 trong container, khởi động lại `api` không lỗi, dừng `db` thì `api` vẫn sống. Chỉ dùng để phát triển và chấm bài: giao diện chạy bằng máy chủ phát triển của Vite và `.env.example` chứa khóa mẫu công khai.

## 8. Triển khai thật

- **HTTPS (bắt buộc khi có người dùng thật):** backend chỉ nói HTTP; đặt sau reverse proxy kết thúc TLS. Cách đơn giản nhất là Caddy, tự xin và gia hạn chứng chỉ Let's Encrypt cho tên miền công khai. Cấu hình mẫu (đã chạy thử bằng `tls internal` trên máy: `curl.exe -k https://localhost:8443/api/health` trả 200; trên máy chủ thật thay `localhost:8443` bằng tên miền, bỏ dòng `tls internal`):

  ```
  tenmien.example.vn {
      handle /api/* {
          reverse_proxy localhost:3000
      }
      handle {
          root * /var/www/suachua      # nội dung frontend/dist
          try_files {path} /index.html
          file_server
      }
  }
  ```

  Sau khi bật HTTPS: đặt `CLIENT_URL=https://tenmien.example.vn` ở backend, mở cổng 443 (và 80 để Caddy xin chứng chỉ), **không** mở cổng 3000 ra ngoài; chuyển hướng HTTP sang HTTPS là mặc định của Caddy. Dùng nginx thì kết thúc TLS bằng `listen 443 ssl;`, `ssl_certificate`, `ssl_certificate_key` (chứng chỉ lấy bằng `certbot`) và `proxy_pass http://127.0.0.1:3000;` cho `/api/`.
- **Giới hạn số lần đăng nhập (chống dò mật khẩu):** backend không tự giới hạn (OBS-01, lý do ở [checklist-bao-mat.md](checklist-bao-mat.md) mục 6); đặt giới hạn ở reverse proxy. Cấu hình nginx mẫu đã chạy thử: 12 lần đăng nhập sai liên tiếp cho `401 ×6` rồi `429 ×6`, các đường dẫn khác không bị ảnh hưởng:

  ```
  limit_req_zone $binary_remote_addr zone=dang_nhap:10m rate=5r/m;
  location = /api/auth/login {
      limit_req zone=dang_nhap burst=5 nodelay;
      limit_req_status 429;
      proxy_pass http://127.0.0.1:3000;
      proxy_set_header X-Forwarded-For $remote_addr;
  }
  ```
- **Giao diện:** backend **không** phục vụ giao diện. Build bằng `npm --prefix frontend run build`, đưa `frontend/dist/` lên máy chủ web tĩnh và chuyển tiếp `/api` về backend (như cấu hình Caddy ở trên). Nếu tách hai địa chỉ: đặt `VITE_API_URL` lúc build và `CLIENT_URL` ở backend.
- **Bí mật:** tạo `JWT_SECRET` ngẫu nhiên mới (`randomBytes(32)`), mật khẩu CSDL mới; không dùng giá trị mẫu của `.env.example`; không commit `.env`; `NODE_ENV=production` (lệnh seed từ chối chạy); không dùng tài khoản demo và mật khẩu `Demo@123`, tạo quản trị viên bằng `npm run create-admin`. Nếu lỡ commit bí mật thật: đổi khóa trước, rồi mới gỡ khỏi repo.
- **CSDL:** tài khoản riêng cho ứng dụng, không mở cổng PostgreSQL ra ngoài, sao lưu định kỳ (`pg_dump`), chạy `npm run migrate` sau mỗi lần cập nhật mã.
- **Đăng nhập đồng thời:** băm mật khẩu bằng bcryptjs (JavaScript thuần) chiếm khoảng 47–67 ms CPU mỗi lần đăng nhập trên một tiến trình, tức khoảng 15–21 lượt/giây; 100 người bấm đăng nhập cùng một giây sẽ chờ tới 4,7–6,8 giây (đo ba lần, [test-report.md](test-report.md) §9.5), còn đến đều 10 lượt/giây thì tối đa 61–142 ms. Tải đăng nhập cao hơn thì chạy nhiều tiến trình `api` sau reverse proxy.
- **Theo dõi:** `/api/health` chỉ kiểm tra tiến trình; lỗi 500 ghi ra stderr (`docker compose logs api`), nhật ký không chứa mật khẩu, token hay số điện thoại (đã kiểm: [checklist-bao-mat.md](checklist-bao-mat.md) mục 1 và 6).
