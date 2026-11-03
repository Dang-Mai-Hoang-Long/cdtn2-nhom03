# Thiết kế nền móng dự án

## Ý định

Hoàn thiện bộ khung có thể cài đặt và khởi chạy cho nền tảng kết nối khách hàng với kỹ thuật viên sửa chữa tại nhà, dựa trên tài liệu SRS, API contract, ERD và sơ đồ kiến trúc hiện có. Mục đích là để nhóm có cấu trúc thống nhất bắt đầu triển khai chức năng sau này mà không phải dựng lại nền tảng.

## Mục tiêu

- Thiết lập ứng dụng backend Node.js + Express.js và frontend React + Vite theo kiến trúc phân lớp trong `docs/architecture-nhom03.drawio`.
- Giữ điểm mở rộng cho PostgreSQL 16 và các migration SQL thuần; chưa thêm ORM, driver DB hoặc công cụ migration khi chưa được chọn.
- Tạo cấu hình chạy cục bộ, ví dụ biến môi trường, bỏ qua file cục bộ/đầu ra build, và hướng dẫn cài đặt/chạy.
- Tạo thư mục và module khung cho các tính năng được nêu trong API contract, nhưng chưa triển khai nghiệp vụ.
- Lưu ghi nhớ ngắn về kiến trúc và các quyết định ổn định trong `docs/` để giảm việc đọc lại tài liệu.

## Ngoài mục tiêu

- Chưa triển khai xác thực JWT, phân quyền, CRUD, quy tắc nghiệp vụ, UI theo vai trò hay tích hợp thông báo.
- Chưa tạo dữ liệu mẫu, tài khoản quản trị mặc định, triển khai cloud/CI, thanh toán, chat hoặc ứng dụng mobile.
- Không tự thay đổi yêu cầu trong SRS/API contract hoặc thiết kế lại ERD.

## Ràng buộc

- Backend dùng Node.js và Express.js; frontend dùng React và Vite.
- Giao tiếp qua HTTP + JSON theo `docs/api-contract.md`.
- PostgreSQL 16 là lựa chọn đã chốt trước đó; ORM, driver DB và công cụ migration chưa được chọn.
- Cấu trúc backend phân lớp: routes/controllers → services → repositories → persistence.
- Tên JSON dùng camelCase; tên cột DB dùng snake_case theo API contract.
- Trường `images` đã được người dùng xác nhận bỏ khỏi API tạo tin sửa chữa; không đưa ảnh vào schema khởi đầu.
- Người dùng xác nhận nhiều tài khoản có thể dùng chung số điện thoại; trường `phone` là bắt buộc nhưng không duy nhất. ERD sẽ được chỉnh để phản ánh quyết định này.
- Vai trò và trạng thái phải giữ nguyên quy ước trong tài liệu: CUSTOMER / TECHNICIAN / ADMIN; WAITING_PROPOSAL / SELECTED / COMPLETED / CLOSED; trạng thái proposal và notification theo contract.
- Tài liệu hiện chưa quy định version Node.js tối thiểu; đề xuất dùng Node.js 20 LTS làm baseline.

## Các phương án đã cân nhắc

1. **Dựng nền móng kiến trúc (được chọn):** tạo cấu hình và các module khung cho backend, frontend, DB, migration và tài liệu. Ưu điểm là xác lập sớm các ranh giới và lệnh chạy; chưa đưa các giả định nghiệp vụ chưa thống nhất vào code.
2. **Triển khai ứng dụng theo từng lát chức năng:** dựng nền móng và triển khai lần lượt xác thực, tin sửa chữa, đề xuất cùng UI. Cách này sớm có luồng demo nhưng vượt phạm vi lượt hiện tại và đòi hỏi quyết định thêm về hành vi chưa được mô tả đầy đủ.

Người dùng chọn phương án 1 và chốt PostgreSQL 16. Lựa chọn ORM, driver DB và công cụ migration được hoãn; scaffold hiện không phụ thuộc ORM.

## Thiết kế đề xuất

- Giữ backend ở root `src/` như repo hiện tại; tổ chức `routes/`, `controllers/`, `services/`, `repositories/`, `middlewares/`, `validators/`, `config/` và `utils/` theo sơ đồ kiến trúc. Giữ `src/app.js`, `src/server.js`, `src/db.js` làm điểm ghép ứng dụng, khởi động HTTP và truy cập dữ liệu.
- Dùng `migrations/` ở root cho các migration SQL thuần sau này. Chưa tạo schema hoặc chọn thư viện DB/migration; quyết định đó được để lại cho giai đoạn triển khai dữ liệu. Các chi tiết ERD mơ hồ cần ghi thành câu hỏi, không âm thầm suy diễn.
- Frontend giữ tại `frontend/`, có `package.json` riêng và `src/` chia `api/`, `components/`, `pages/`, cùng entry point, router và stylesheet CSS thuần. Dùng Axios và React Router như kiến trúc đã nêu; không dùng Tailwind. Chỉ dựng app shell và placeholder trang, không tạo luồng nghiệp vụ.
- Root `package.json` quản lý backend và cung cấp script điều phối cài đặt/chạy backend + frontend; chọn cách chạy đơn giản, không ép npm workspaces nếu gây thay đổi cấu trúc package hiện có.
- Chuẩn bị `.env.example` với `DATABASE_URL`, `PORT`, `JWT_SECRET` và `CLIENT_URL`; không điền bí mật. Không đọc/ghi bí mật trong `.env` hiện tại. Thêm `/docs/project-notes.md` ghi nguồn sự thật (SRS/API/ERD/architecture), quyết định công nghệ, các quy tắc kiến trúc và các điểm còn cần làm rõ.
- Cập nhật README tiếng Việt với yêu cầu Node.js, PostgreSQL, bước cài dependency, cấu hình môi trường và chạy ứng dụng; chỉ mô tả quy trình migration khi công cụ được chốt.

## Giả định để người thực hiện xác nhận khi triển khai

- Cấu hình cơ bản chọn Node.js 20 LTS; nếu máy nhóm đang chuẩn hóa version khác, cập nhật `.nvmrc`/`engines`/README đồng bộ.
- Không cần Docker Compose trong nền móng ban đầu; PostgreSQL được cài hoặc chạy độc lập trên máy phát triển.
- Có thể thêm đúng các dependency cần cho skeleton (Express, React/Vite, Axios, React Router và công cụ chạy song song), nhưng không thêm ORM, framework nghiệp vụ lớn hoặc Tailwind.
- Chưa chọn PostgreSQL driver hay migration tool; giữ `src/db.js` và `migrations/` rỗng cho tới khi lựa chọn được xác nhận.
- ERD là nguồn dữ liệu chuẩn nếu API contract và ERD khác nhau; mọi xung đột sẽ ghi lại để người dùng quyết định thay vì tự sửa tài liệu nguồn.
- `phone` được API đăng ký yêu cầu; giữ `NOT NULL`, bỏ `UNIQUE` để hỗ trợ nhiều tài khoản/role dùng chung số điện thoại theo xác nhận của người dùng.
- API đăng ký/đăng nhập yêu cầu email và báo `EMAIL_ALREADY_EXISTS`, còn ERD hiện đánh dấu email nullable. Đề xuất cập nhật email thành bắt buộc và duy nhất để các tài khoản phân biệt bằng email; cần người dùng xác nhận sửa ERD theo hướng này.

## Tiêu chí hoàn tất

- Cấu trúc thư mục hiện diện và phản ánh kiến trúc.
- Có manifest/config cho backend và frontend; script cài đặt/khởi chạy được mô tả rõ.
- Có cấu trúc lưu SQL migration cho giai đoạn sau, nhưng chưa phụ thuộc ORM hoặc migration tool.
- Có ghi nhớ kiến trúc cùng danh sách mâu thuẫn/câu hỏi tài liệu.
- Không có chức năng nghiệp vụ được giả vờ là đã triển khai.
