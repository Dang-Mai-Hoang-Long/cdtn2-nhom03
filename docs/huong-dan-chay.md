# Hướng dẫn chạy dự án và quản lý cơ sở dữ liệu

Tài liệu cho các thành viên nhóm 03 dựng dự án trên máy của mình. Các lệnh viết cho **Windows PowerShell**; trên macOS/Linux dùng lệnh `psql` tương tự.

> **Tóm tắt**
>
> - CSDL **không** nằm trong git. Thứ nằm trong git là *cách dựng ra CSDL*: thư mục `migrations/`.
> - Mỗi người cài PostgreSQL 16 trên máy mình, rồi chạy `npm run migrate` để có cùng cấu trúc bảng (mục 3).
> - Muốn dùng chung dữ liệu mẫu thì xuất/nhập bằng một file `.sql` (mục 4).

## 1. CSDL được quản lý như thế nào

### 1.1. Nguyên tắc

- PostgreSQL 16, truy cập bằng thư viện `pg`, không dùng ORM. Cấu trúc bảng viết bằng SQL thuần trong `migrations/`.
- Dữ liệu (tài khoản, tin, đề xuất...) nằm trong PostgreSQL trên từng máy và **không** được commit lên git. "Lấy CSDL về" nghĩa là dựng lại cấu trúc bằng migration (mục 3), rồi nếu cần thì nhập thêm dữ liệu mẫu (mục 4).

### 1.2. Các thành phần

| Thành phần | Vai trò |
| --- | --- |
| `migrations/NNN_ten_mo_ta.sql` | Mỗi file là một thay đổi cấu trúc. Hiện có `001_khoi_tao_csdl.sql` (tạo toàn bộ bảng) và `002_trang_thai_de_xuat_da_rut.sql` (thêm trạng thái `WITHDRAWN` cho đề xuất). |
| `src/migrate.js` (`npm run migrate`) | Chạy các file `.sql` chưa chạy, theo thứ tự tên file. Mỗi file nằm trong một transaction (lỗi thì hoàn tác file đó và dừng). Tên file đã chạy được ghi vào bảng `schema_migrations`, nên mỗi file chỉ chạy đúng một lần trên mỗi CSDL. |
| `src/db.js` | Kết nối PostgreSQL (pool) và hàm chạy một nhóm lệnh trong transaction. |
| `src/config/env.js` | Đọc `.env`: dùng `DATABASE_URL` khi chạy bình thường, dùng `TEST_DATABASE_URL` khi chạy test (`NODE_ENV=test`). |
| `.env.example` và `.env` | `.env.example` là mẫu cấu hình (có trong git). `.env` là cấu hình thật của từng máy, **không** commit (đã nằm trong `.gitignore`). |
| `docs/erd-nhom03.drawio` | Sơ đồ ERD của CSDL. |

### 1.3. Các bảng

| Bảng | Nội dung | Ràng buộc đáng chú ý |
| --- | --- | --- |
| `users` | Tài khoản. `role`: `CUSTOMER`, `TECHNICIAN`, `ADMIN`; có `is_locked`, `rating_avg`. | `email` duy nhất. Đặt tên `users` vì `user` là từ khóa của PostgreSQL. |
| `repair_request` | Tin sửa chữa. `status`: `WAITING_PROPOSAL`, `SELECTED`, `COMPLETED`, `CLOSED`. | `selected_proposal_id` trỏ tới đề xuất được chọn. |
| `proposal` | Đề xuất của kỹ thuật viên. `status`: `PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`. | `price > 0`. Mỗi kỹ thuật viên chỉ có một đề xuất còn hiệu lực (`PENDING`/`ACCEPTED`) cho mỗi tin (BR08). Mỗi tin chỉ có một đề xuất `ACCEPTED` (BR10). |
| `review` | Đánh giá hai chiều, `rating` từ 1 đến 5. | `UNIQUE (request_id, from_user_id)`: mỗi người chỉ đánh giá một lần cho mỗi tin (BR14). |
| `notification` | Thông báo trong ứng dụng. | |
| `schema_migrations` | Danh sách migration đã chạy. Do `migrate.js` tự tạo, không sửa tay. | |

### 1.4. Hai CSDL: dev và test

- `suachua_dev`: CSDL bạn dùng khi chạy ứng dụng (`npm run dev`).
- `suachua_test`: mỗi lần `npm test` **xóa sạch** mọi bảng rồi dựng lại từ các migration. Không bao giờ trỏ `TEST_DATABASE_URL` vào CSDL có dữ liệu cần giữ.

## 2. Yêu cầu

Git, Node.js 20 trở lên (kèm npm), PostgreSQL 16.

## 3. Dựng CSDL và chạy dự án trên máy bạn

### 3.1. Cài PostgreSQL 16

Cài bằng một trong hai cách:

- Tải bộ cài tại <https://www.postgresql.org/download/windows/>.
- Hoặc chạy `winget install --id PostgreSQL.PostgreSQL.16 --source winget` (sẽ mở bộ cài, có thể hiện hộp thoại quyền quản trị).

Trong lúc cài: giữ cổng `5432`, **ghi nhớ mật khẩu** bạn đặt cho tài khoản `postgres`, và giữ thành phần *Command Line Tools* (để có `psql`).

Sau khi cài, `psql` thường chưa nằm trong `PATH`. Thêm cho cửa sổ PowerShell hiện tại (muốn lâu dài thì thêm `C:\Program Files\PostgreSQL\16\bin` vào biến môi trường `Path` của Windows):

```powershell
$env:Path += ';C:\Program Files\PostgreSQL\16\bin'
psql --version
```

### 3.2. Tạo user và hai CSDL

Mỗi lệnh sẽ hỏi mật khẩu của `postgres` (hoặc đặt tạm `$env:PGPASSWORD = '<mật khẩu postgres>'` để khỏi hỏi lại, rồi `Remove-Item Env:PGPASSWORD` khi xong):

```powershell
psql -h localhost -U postgres -c "CREATE USER nhom03 WITH PASSWORD 'nhom03' CREATEDB"
psql -h localhost -U postgres -c "CREATE DATABASE suachua_dev OWNER nhom03"
psql -h localhost -U postgres -c "CREATE DATABASE suachua_test OWNER nhom03"
```

`nhom03`/`nhom03` chỉ dành cho máy cá nhân. PostgreSQL cài mặc định chỉ nhận kết nối từ chính máy đó; đừng mở ra mạng với mật khẩu này.

### 3.3. Lấy mã nguồn và cài thư viện

```powershell
git clone https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03
cd cdtn2-nhom03
git switch <tên nhánh đang làm việc>
npm install
npm --prefix frontend install
```

### 3.4. Tạo file `.env`

```powershell
Copy-Item .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Mở `.env`, dán chuỗi vừa in ra làm giá trị `JWT_SECRET`. Nếu bạn làm đúng mục 3.2 thì `DATABASE_URL` và `TEST_DATABASE_URL` giữ nguyên. Mỗi người có thể dùng `JWT_SECRET` riêng; đổi giá trị thì các phiên đăng nhập cũ hết hiệu lực. Đừng commit `.env`.

### 3.5. Dựng bảng

```powershell
npm run migrate
```

Kết quả mong đợi:

```text
Đã chạy migration 001_khoi_tao_csdl.sql
Đã chạy migration 002_trang_thai_de_xuat_da_rut.sql
```

Kiểm tra lại: `psql -h localhost -U nhom03 -d suachua_dev -c "\dt"` phải liệt kê 6 bảng (`notification`, `proposal`, `repair_request`, `review`, `schema_migrations`, `users`). Chạy `npm run migrate` thêm lần nữa thì không còn dòng `Đã chạy migration` nào, vì mọi migration đã chạy.

### 3.6. Chạy ứng dụng

Mở hai cửa sổ PowerShell trong thư mục dự án:

```powershell
npm run dev        # backend, cổng 3000
npm run frontend   # frontend, cổng 5173
```

Mở <http://localhost:5173>. Kiểm tra backend: <http://localhost:3000/api/health> trả `"success":true`.

CSDL mới còn trống. Cách nhanh nhất là chạy `npm run seed` để có sẵn tài khoản demo và dữ liệu mẫu (danh sách tài khoản và mật khẩu ở `seeds/README.md`). Hoặc tự thử luồng chính:

1. Ở trang Đăng ký, tạo một tài khoản **Khách hàng** và một tài khoản **Kỹ thuật viên**. Phiên đăng nhập lưu trong trình duyệt, nên dùng thêm cửa sổ ẩn danh hoặc trình duyệt thứ hai để đăng nhập hai người cùng lúc.
2. Khách hàng: *Đăng tin* rồi xem ở *Tin của tôi*.
3. Kỹ thuật viên: *Tìm việc sửa chữa* → xem chi tiết → *Gửi đề xuất*.
4. Khách hàng: mở tin → *Chấp nhận đề xuất* → *Theo dõi* → *Xác nhận hoàn thành*.

### 3.7. Tạo tài khoản quản trị viên

Quản trị viên không đăng ký được qua giao diện (BR01), chỉ tạo bằng lệnh (dùng dấu `--` để npm chuyển tiếp tham số; mật khẩu tối thiểu 6 ký tự):

```powershell
npm run create-admin -- admin@example.com "<mật khẩu của bạn>" "Quản Trị Viên" 0900000000
```

### 3.8. Chạy test

```powershell
npm test
```

Test dùng `TEST_DATABASE_URL`, xóa và dựng lại bảng ở `suachua_test` mỗi lần chạy, không đụng tới `suachua_dev`. Tất cả test phải qua.

## 4. Dữ liệu mẫu và chia sẻ dữ liệu giữa các máy

### 4.0. Dữ liệu mẫu có sẵn trong dự án (khuyến nghị)

Thư mục `seeds/` tạo dữ liệu mẫu và tài khoản demo bằng chính các service của ứng dụng, nên mọi người có dữ liệu giống nhau mà không cần gửi file:

```powershell
npm run seed          # tạo dữ liệu mẫu; dừng nếu đã có tài khoản demo
npm run seed:reset    # xóa TOÀN BỘ dữ liệu ứng dụng rồi tạo lại
```

Danh sách tài khoản demo (mật khẩu chung `Demo@123`) và các tin mẫu ở `seeds/README.md`. Phần 4.1 trở đi dùng khi bạn muốn đồng nghiệp có đúng dữ liệu bạn đã tự nhập.

### 4.1. Người có dữ liệu: xuất ra file

```powershell
pg_dump -h localhost -U nhom03 -d suachua_dev --no-owner --no-privileges -f suachua_dev_mau.sql
```

Dùng tùy chọn `-f` để PostgreSQL tự ghi file. Đừng dùng `>` của PowerShell vì nó có thể làm hỏng bảng mã tiếng Việt. File xuất ra gồm cả cấu trúc bảng, dữ liệu và bảng `schema_migrations`.

### 4.2. Đồng nghiệp: nhập vào CSDL trống

Tắt backend (`Ctrl+C`) nếu đang chạy, vì CSDL đang có kết nối thì không xóa được. Nhập vào CSDL **trống** (đừng chạy `npm run migrate` trước khi nhập, nếu không sẽ báo `already exists`):

```powershell
psql -h localhost -U nhom03 -d postgres -c "DROP DATABASE IF EXISTS suachua_dev" -c "CREATE DATABASE suachua_dev OWNER nhom03"
psql -h localhost -U nhom03 -d suachua_dev -v ON_ERROR_STOP=1 -q -f suachua_dev_mau.sql
npm run migrate
```

Lệnh cuối chạy nốt các migration mới hơn file mẫu (nếu có); không có thì không in dòng `Đã chạy migration` nào. Khi nhập, các bảng chữ `set_config` và `setval` hiện ra là bình thường.

### 4.3. Lưu ý

- File mẫu chứa dữ liệu thật (email, số điện thoại, mật khẩu đã băm). **Không commit lên git**; gửi riêng cho đồng nghiệp và xóa sau khi dùng.
- Mật khẩu không khôi phục được từ bản băm: đồng nghiệp đăng nhập các tài khoản trong file bằng đúng email và mật khẩu mà người xuất đã dùng.
- Dùng cùng nhánh PostgreSQL 16. File xuất từ bản mới có dòng `\restrict`; nếu `psql` bản cũ báo `invalid command \restrict`, hãy cập nhật PostgreSQL 16 lên bản vá mới nhất, hoặc tạm xóa dòng `\restrict ...` đầu file và `\unrestrict ...` cuối file.

### 4.4. Vì sao không cho cả nhóm kết nối thẳng vào CSDL trên máy một người

- Mặc định PostgreSQL chỉ nhận kết nối từ chính máy đó, và mật khẩu `nhom03` quá yếu để mở ra mạng.
- Dùng chung một CSDL thì mọi người ghi đè dữ liệu của nhau, và `npm test` xóa sạch cả CSDL nếu ai đó trỏ nhầm vào.
- Nếu cần một CSDL chung để demo, dùng dịch vụ PostgreSQL trên đám mây (ví dụ Neon, Supabase) với mật khẩu mạnh và chỉ đặt vào `DATABASE_URL`. **Không đặt vào `TEST_DATABASE_URL`**.

## 5. Quy trình làm việc nhóm với CSDL

### 5.1. Sau khi `git pull`

Nếu có file mới trong `migrations/`, chạy `npm run migrate` để áp dụng. Chạy lại không có hại: file nào đã chạy sẽ bị bỏ qua.

### 5.2. Khi cần đổi cấu trúc CSDL

1. Tạo **file mới** trong `migrations/`, số kế tiếp gồm 3 chữ số, tên tiếng Việt không dấu như các file hiện có (ví dụ `003_them_cot_xyz.sql`). Chỉ viết phần thay đổi (`ALTER`, `CREATE`...).
2. Chạy `npm run migrate` để áp dụng, rồi `npm test` (test dựng lại CSDL từ đầu bằng chính các migration nên kiểm tra luôn file của bạn).
3. Cập nhật `docs/erd-nhom03.drawio` và `docs/api-contract.md` nếu thay đổi có ảnh hưởng.
4. Commit migration cùng đoạn mã dùng nó.

Hai quy tắc quan trọng, vì `migrate.js` nhận biết file theo **tên**:

- **Không sửa nội dung hay đổi tên** file migration đã được commit/merge. Máy đã chạy file đó sẽ không chạy lại bản sửa; còn file bị đổi tên sẽ bị coi là mới và chạy lần nữa (thường lỗi `already exists`).
- Luôn đặt số 3 chữ số (`003`, không phải `3`) để thứ tự theo tên khớp thứ tự theo số. Nếu hai nhánh cùng tạo `003_...`, người merge sau đổi file của mình sang số kế tiếp (chỉ khi file đó chưa ai chạy).

### 5.3. Đặt lại CSDL dev khi hỏng hoặc migration lỗi

Tắt backend trước, rồi:

```powershell
psql -h localhost -U nhom03 -d postgres -c "DROP DATABASE suachua_dev" -c "CREATE DATABASE suachua_dev OWNER nhom03"
npm run migrate
```

Việc này xóa mọi dữ liệu của `suachua_dev`. Cần dữ liệu mẫu thì nhập lại theo mục 4.2.

## 6. Xem dữ liệu bằng công cụ

Thông số kết nối cho pgAdmin, DBeaver hoặc extension PostgreSQL trong VS Code: host `localhost`, cổng `5432`, CSDL `suachua_dev`, user `nhom03`, mật khẩu `nhom03`.

Dùng `psql`:

```powershell
psql -h localhost -U nhom03 -d suachua_dev
```

Một số lệnh hay dùng bên trong `psql`: `\dt` (liệt kê bảng), `\d proposal` (cấu trúc một bảng), `SELECT id, email, role, is_locked FROM users;`, `SELECT * FROM schema_migrations;`, `\q` (thoát).

Khi cần nhập dữ liệu có dấu tiếng Việt, viết vào file `.sql` lưu bằng UTF-8 rồi chạy `psql -f` thay vì gõ trong tham số `-c`, hoặc dùng công cụ giao diện.

## 7. Lỗi thường gặp

| Thông báo | Nguyên nhân và cách xử lý |
| --- | --- |
| `psql` không được nhận diện | Chưa thêm thư mục `bin` của PostgreSQL vào `PATH` (mục 3.1). |
| `password authentication failed for user "nhom03"` | Chưa tạo user `nhom03` (mục 3.2) hoặc mật khẩu trong `.env` không khớp. |
| `database "suachua_dev" does not exist` | Chưa tạo CSDL (mục 3.2). |
| `ECONNREFUSED 127.0.0.1:5432` | Dịch vụ PostgreSQL chưa chạy hoặc đang dùng cổng khác. Mở *Services* của Windows và khởi động dịch vụ `postgresql-x64-16`; nếu đổi cổng thì sửa trong `.env`. |
| `Thiếu biến môi trường DATABASE_URL` hoặc `JWT_SECRET` | Chưa có `.env`, hoặc chạy lệnh ngoài thư mục gốc dự án (mục 3.4). |
| `relation "users" does not exist` | Chưa chạy `npm run migrate`, hoặc đã chạy nhưng trỏ vào CSDL khác. |
| `Migration 00X_... thất bại` | Xem nội dung lỗi phía sau. Thường do CSDL không còn đúng trạng thái; đặt lại theo mục 5.3. |
| `database is being accessed by other users` khi `DROP DATABASE` | Backend hoặc công cụ xem dữ liệu còn đang kết nối. Tắt chúng rồi chạy lại. |
| `relation "..." already exists` khi nhập file mẫu | CSDL đích chưa trống. Đặt lại theo mục 4.2 và đừng chạy `npm run migrate` trước khi nhập. |
| Frontend báo lỗi mạng khi gọi `/api` | Backend chưa chạy, hoặc `PORT` khác 3000: đặt biến `VITE_API_PROXY` trỏ tới địa chỉ backend khi chạy `npm run frontend`. |
| `Email đã tồn tại` khi tạo quản trị viên | Email đó đã có trong CSDL. Dùng email khác. |
