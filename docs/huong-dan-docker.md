# Chạy dự án bằng Docker

Cách nhanh nhất để một lập trình viên mới chạy được cả dự án: không cần cài Node.js hay PostgreSQL, chỉ cần Docker. Một lệnh dựng CSDL, backend và giao diện.

## 1. Yêu cầu

- Windows/macOS: Docker Desktop đang chạy. Linux: Docker Engine kèm Docker Compose v2.
- Các cổng `3000`, `5173` và `5433` còn trống trên máy (xem mục 7 nếu bị trùng).

## 2. Chạy

```powershell
git clone https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03
cd cdtn2-nhom03
git switch <tên nhánh đang làm việc>
cp .env.example .env        # PowerShell: Copy-Item .env.example .env (một lần)
docker compose up -d --build
```

Lần đầu mất vài phút vì phải tải image và cài thư viện. Khi thấy `Backend đang chạy tại ...` (dịch vụ `api`) và `VITE ... ready` (dịch vụ `web`), mở:

| Địa chỉ | Là gì |
| --- | --- |
| <http://localhost:5173> | Giao diện (dùng địa chỉ này) |
| <http://localhost:3000/api/health> | Kiểm tra API |

Một số lệnh hay dùng:

```powershell
docker compose up --build -d        # chạy nền
docker compose logs -f api          # xem log (api, web hoặc db)
docker compose ps                   # trạng thái các dịch vụ
docker compose stop                 # dừng, giữ nguyên dữ liệu
docker compose down                 # dừng và xóa container, vẫn giữ dữ liệu CSDL
docker compose down -v              # xóa luôn dữ liệu CSDL (làm lại từ đầu)
```

Dịch vụ `api` tự chạy `npm run migrate` rồi nạp dữ liệu mẫu nếu CSDL còn trống (`npm run seed -- --neu-chua-co`; đã có dữ liệu thì bỏ qua và khởi động bình thường) mỗi lần khởi động; dịch vụ `db` tự tạo thêm CSDL `suachua_test` ở lần đầu. Cả ba dịch vụ có healthcheck: `docker compose ps` phải báo `(healthy)` ở cả `db`, `api` và `web`.

Mật khẩu CSDL (`DB_PASSWORD`) và khóa ký token (`JWT_SECRET`, từ 32 ký tự) lấy từ file `.env`, không ghi cứng trong `docker-compose.yml`; thiếu thì `docker compose` dừng ngay và báo "Chưa có DB_PASSWORD, hãy chạy lệnh cp .env.example .env". Mật khẩu CSDL chỉ được đặt khi volume CSDL được tạo lần đầu: muốn đổi, chạy `docker compose down -v` rồi dựng lại.

## 3. Dữ liệu mẫu và tài khoản demo

Dữ liệu mẫu được nạp tự động ở lần chạy đầu tiên (247 tài khoản, 1050 tin, 2191 đề xuất, 566 đánh giá). Muốn làm lại hoặc chỉ nạp phần nhỏ, dùng thư mục `seeds/`:

```powershell
docker compose exec api npm run seed               # 50 tin viết tay + 1000 tin tự động; dừng nếu đã có tài khoản demo
docker compose exec api npm run seed:reset         # xóa toàn bộ dữ liệu rồi tạo lại
docker compose exec api npm run seed:thu-cong      # chỉ 50 tin viết tay (nhanh)
```

Danh sách tài khoản demo (mật khẩu chung `Demo@123`) ở `seeds/README.md`, ví dụ quản trị viên `admin@demo.vn`, khách hàng `khach1@demo.vn`, kỹ thuật viên `ktv1@demo.vn`; phần tự động thêm các tài khoản `auto.kh001@demo.vn`, `auto.ktv001@demo.vn`, ...

## 4. Chạy test

```powershell
docker compose exec api npm test
```

Test dùng CSDL `suachua_test` trong container, xóa và dựng lại bảng mỗi lần chạy, không đụng tới `suachua_dev`.

## 5. Dịch vụ và cổng

| Dịch vụ | Làm gì | Truy cập từ máy bạn |
| --- | --- | --- |
| `web` | Giao diện (Vite), chuyển tiếp `/api` sang `api` | `localhost:5173` |
| `api` | Backend Express | `localhost:3000` |
| `db` | PostgreSQL 16 | `127.0.0.1:5433`, user `nhom03`, mật khẩu `nhom03`, CSDL `suachua_dev` |

Mọi cổng chỉ mở ở `127.0.0.1` (máy khác trong mạng không vào được) vì mật khẩu CSDL chỉ dành cho phát triển. Cổng CSDL là `5433` để không đụng PostgreSQL cài sẵn trên máy (thường dùng `5432`); đổi bằng biến `DB_PORT`, ví dụ `DB_PORT=5434 docker compose up -d`. Muốn dùng khóa JWT riêng, đặt biến `JWT_SECRET` (Docker Compose tự đọc file `.env` ở thư mục gốc để thay biến); nếu không đặt thì dùng khóa mặc định dành cho phát triển trong `docker-compose.yml`.

## 6. Sửa mã khi chạy bằng Docker

Image chứa bản sao mã tại lúc build và **không tự nạp lại** khi bạn sửa file (nạp lại qua thư mục chia sẻ trên Windows không đáng tin). Có hai cách:

1. Sau khi sửa, build và chạy lại: `docker compose up --build -d`.
2. Khi đang code nhiều, chỉ chạy CSDL trong Docker còn mã chạy trực tiếp trên máy với nạp lại tự động:

   ```powershell
   docker compose up -d db
   ```

   Trong file `.env` (xem `docs/huong-dan-chay.md` mục 3.4) đặt:

   ```ini
   DATABASE_URL=postgres://nhom03:nhom03@localhost:5433/suachua_dev
   TEST_DATABASE_URL=postgres://nhom03:nhom03@localhost:5433/suachua_test
   ```

   rồi `npm install`, `npm --prefix frontend install`, `npm run migrate`, `npm run dev`.

## 7. Lỗi thường gặp

| Thông báo | Nguyên nhân và cách xử lý |
| --- | --- |
| `Chưa có DB_PASSWORD` hoặc `Chưa có JWT_SECRET` | Chưa có file `.env`. Chạy `cp .env.example .env` (PowerShell: `Copy-Item .env.example .env`). |
| `JWT_SECRET quá ngắn` trong `docker compose logs api` | `JWT_SECRET` trong `.env` ngắn hơn 32 ký tự. Tạo khóa mới: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `failed to connect to the docker API` | Docker Desktop chưa chạy. Mở nó và đợi báo đã sẵn sàng. |
| `additional privileges requested: pass "--allow=fs.read=Dockerfile"` khi build | Gặp khi chạy trong Git Bash trên Windows (đường dẫn kiểu `/d/...`). Chạy trong PowerShell hoặc CMD (terminal mặc định của VS Code), hoặc vào thư mục bằng đường dẫn kiểu Windows (`cd D:\duong\dan\cdtn2-nhom03`) rồi chạy lại. |
| `port is already allocated` hoặc `address already in use` | Cổng 3000, 5173 hoặc 5433 đang bị chương trình khác dùng (ví dụ `npm run dev` chạy trên máy). Tắt nó, hoặc đổi cổng CSDL bằng `DB_PORT`. |
| Giao diện báo lỗi mạng khi gọi `/api` | `api` chưa khỏe. Xem `docker compose ps` và `docker compose logs api`. |
| Sửa `migrations/` hay `seeds/` nhưng không thấy tác dụng | Image còn bản cũ. Chạy `docker compose up --build -d`. |
| Không có CSDL `suachua_test` | Script khởi tạo chỉ chạy khi volume CSDL còn trống. Chạy `docker compose exec db psql -U nhom03 -d suachua_dev -c "CREATE DATABASE suachua_test"` hoặc `docker compose down -v` rồi chạy lại. |

## 8. Lưu ý

Cấu hình này dành cho **phát triển**: `.env.example` chứa mật khẩu CSDL và khóa JWT mẫu công khai trong repo (mọi người cùng biết), giao diện chạy bằng máy chủ phát triển của Vite. Không dùng để triển khai thật; cách triển khai thật (HTTPS, khóa riêng, giới hạn đăng nhập) ở `docs/deployment-guide.md` mục 8. Đã kiểm tra: dừng container `db` thì `api` vẫn sống và trả `500 INTERNAL_ERROR` gọn, `db` bật lại thì đăng nhập được ngay (`docs/checklist-bao-mat.md`, mục 5).
