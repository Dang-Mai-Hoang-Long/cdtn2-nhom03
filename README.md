# Thông tin dự án

Đề tài: NỀN TẢNG KẾT NỐI VÀ ĐẶT DỊCH VỤ SỬA CHỮA TẠI NHÀ

Nhóm 03:

1. Đặng Mai Hoàng Long - 2374802013303 - Track SE.
2. Lê Tấn Phong - 2374802010384 – Track SE
3. Nguyễn Quốc Huy - 2374802010185 – Track. SE

Học phần: Chuyên đề Tốt nghiệp 2, HK1 2026-2027

## 1. Mục tiêu

### 1.1. Mô tả:

Xây dựng một nền tảng web hai chiều (two-sided marketplace) kết nối khách hàng có nhu cầu sửa chữa với kỹ thuật viên cung cấp dịch vụ, cho phép đăng tin, tìm kiếm, gửi đề xuất sửa chữa, lựa chọn kỹ thuật viên, theo dõi trạng thái công việc và đánh giá sau khi hoàn thành.

### 1.2. Phạm vi

Trong phạm vi:

1. Đăng ký, đăng nhập, đăng xuất và phân quyền 3 vai trò: Khách hàng, Kỹ thuật viên, Quản trị viên.
2. Khách hàng đăng và quản lý tin sửa chữa (mô tả sự cố, thời gian, địa điểm).
3. Kỹ thuật viên tìm kiếm, lọc tin sửa chữa, gửi và quản lý đề xuất thực hiện công việc.
4. Khách hàng xem danh sách đề xuất và lựa chọn kỹ thuật viên phù hợp.
5. Theo dõi trạng thái tin sửa chữa (Chờ đề xuất, Đã chọn kỹ thuật viên, hoàn thành).
6. Đánh giá hai chiều sau khi công việc hoàn thành (khách hàng đánh giá kỹ thuật viên và ngược lại).
7. Quản trị viên quản lý tài khoản (xem danh sách, khóa/mở khóa)
8. Thông báo cơ bản khi có cập nhật tin sửa chữa.

Ngoài phạm vi:

9. Thanh toán/giao dịch tiền thật qua cổng thanh toán.
10. Ứng dụng di động native riêng biệt (ưu tiên web responsive).
11. Chat real-time nâng cao giữa hai bên (có thể để hướng phát triển).

## 2. Yêu cầu môi trường

- Node.js 20 trở lên (đã chạy thử với Node.js 22) và npm.
- PostgreSQL 16.

## 3. Hướng dẫn chạy

1. Tạo cơ sở dữ liệu (ví dụ bằng `psql` với quyền quản trị):

   ```sql
   CREATE USER nhom03 WITH PASSWORD 'nhom03' CREATEDB;
   CREATE DATABASE suachua_dev OWNER nhom03;
   CREATE DATABASE suachua_test OWNER nhom03;
   ```

2. Cài thư viện cho backend và frontend:

   ```bash
   npm install
   npm --prefix frontend install
   ```

3. Tạo file `.env` từ `.env.example`, sửa `DATABASE_URL`, `TEST_DATABASE_URL` và đặt `JWT_SECRET` là một chuỗi ngẫu nhiên.

4. Tạo bảng:

   ```bash
   npm run migrate
   ```

   Muốn có sẵn dữ liệu mẫu và tài khoản demo (mật khẩu `Demo@123`), chạy thêm `npm run seed`. Chi tiết ở `seeds/README.md`.

5. Chạy backend (cổng 3000) và frontend (cổng 5173) ở hai cửa sổ dòng lệnh:

   ```bash
   npm run dev
   npm run frontend
   ```

   Mở http://localhost:5173. Vite chuyển tiếp các yêu cầu `/api` sang backend.

Tài khoản quản trị viên không đăng ký được qua giao diện (BR01); tạo trực tiếp trong CSDL khi cần.

## 4. Cấu trúc thư mục

```
src/                    Backend Express (kiến trúc phân lớp)
  routes/               Khai báo endpoint theo docs/api-contract.md
  controllers/          Đọc request, gọi service, trả response chuẩn
  services/             Quy tắc nghiệp vụ BR01-BR16
  repositories/         Truy vấn SQL (driver pg), đổi snake_case -> camelCase
  middlewares/          xacThuc (JWT, BR02), phanQuyen (BR01), kiemTraDuLieu
  validators/           Kiểm tra dữ liệu đầu vào
  utils/                Hằng số, response chuẩn, xử lý lỗi
  db.js, migrate.js     Kết nối PostgreSQL và chạy migration
migrations/             File SQL thuần, chạy theo thứ tự tên
tests/                  Kiểm thử API (node:test + supertest)
frontend/src/
  api/                  Axios client và các hàm gọi API
  pages/                Màn hình theo vai trò (customer, technician, admin, shared)
  components/           Thành phần dùng chung
  navigation/, routes/  Định tuyến hash và chặn trang theo vai trò
docs/                   SRS, backlog, API contract, ERD, kiến trúc, quy ước đặt tên
```

## 5. Kiểm thử

```bash
npm test
```

Bộ kiểm thử xóa và tạo lại toàn bộ bảng trong `TEST_DATABASE_URL` mỗi lần chạy, vì vậy không trỏ biến này vào CSDL đang dùng.

## 6. Trạng thái hiện tại

Sprint 2 (12 user story) đã có backend, giao diện nối API và kiểm thử:

| US | Chức năng | API |
|---|---|---|
| US01-US03 | Đăng ký, đăng nhập, đăng xuất | `/api/auth/register`, `/login`, `/logout`, `/me` |
| US06, US07, US08 | Đăng tin, tin của tôi, chi tiết tin | `POST /api/requests`, `GET /api/requests/my`, `GET /api/requests/:id` |
| US10, US12 | Kỹ thuật viên xem danh sách và chi tiết tin | `GET /api/requests`, `GET /api/requests/:id` |
| US13, US14, US16 | Gửi đề xuất, xem đề xuất, chọn kỹ thuật viên | `POST /api/proposals`, `GET /api/proposals/request/:requestId`, `PATCH /api/proposals/:id/accept` |
| US17 | Xác nhận hoàn thành | `PATCH /api/requests/:id/complete` |

Các màn hình của Sprint 3 (06 chi tiết đề xuất, 08/14 đánh giá, 12 đề xuất của tôi, 16 quản lý tài khoản, thông báo) vẫn dùng dữ liệu minh họa.
