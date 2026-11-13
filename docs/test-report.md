# Test Report — Nền tảng kết nối và đặt dịch vụ sửa chữa tại nhà (23 user story)

Nhóm 03: Đặng Mai Hoàng Long · 2374802013303 — Lê Tấn Phong · 2374802010384 — Nguyễn Quốc Huy · 2374802010185 · Track SE
Kế hoạch kiểm thử: [test-plan.md](test-plan.md) · Product Backlog: [product-backlog-nhom03.md](product-backlog-nhom03.md) (`ProductBacklog_Nhom03.xlsx`) · API: [api-contract.md](api-contract.md) · Quyết định thiết kế: [project-notes.md](project-notes.md) · Ảnh chụp: [screenshots/](screenshots/)
Ngày kiểm: 2026-11-13 · Phiên bản được kiểm: `cdtn2-nhom03-main` (không phải kho git) = `cdtn2-nhom03-main.zip`, SHA-256 `441ABD159AE4FEA8E704BDF7B98F799A4666EB7408531C6EC27E87BBECB011DC`
Môi trường: Windows 11 Pro · Node.js v24.22.0 · PostgreSQL 18.6 (README ghi 16 — xem §7) · chi tiết ở [test-plan.md](test-plan.md) §4.

## 1. Tổng hợp

| Lần chạy | Ngày giờ (UTC+7) | Phạm vi và lệnh | Số mục chạy | PASS | FAIL | Mục FAIL | Minh chứng |
|---|---|---|---:|---:|---:|---|---|
| 1 | 2026-11-13 18:01 | Toàn bộ bộ test tự động, ghi kết quả từng test ra file: `node --test --test-concurrency=1 --test-reporter=spec --test-reporter-destination=<thư mục kết quả>/run1-spec.txt --test-reporter=junit --test-reporter-destination=<thư mục kết quả>/run1-junit.xml "tests/**/*.test.js"` | 104 test | **104** | 0 | — | §4.1 |
| 2 | 2026-11-13 18:02 | `npm test` (lệnh dùng để ghi tài liệu) | 104 test | **104** | 0 | — | §4.1 |
| 3 | 2026-11-13 18:10 | Build giao diện: `npm --prefix frontend ci` rồi `npm --prefix frontend run build` | 1 lệnh build | thành công | — | — | §4.3 |
| 4 | 2026-11-13 18:14 | Kiểm tra bổ sung trên server thật (CSDL tạo mới) | 129 bước | 109 | 16 | `S-03-3`, `S-24-12`, `S-24-13`, `S-26-3`, `S-27-2…S-27-11`, `S-27-22`, `S-28-7` (4 bước khác chỉ ghi nhận quan sát) | §4.2 |
| 5 | 2026-11-13 18:14 | Như lần 4, CSDL tạo mới lại — **cùng kết quả từng bước** | 129 bước | 109 | 16 | giống lần 4 | §4.2 |
| 6 | 2026-11-13 18:17 | Chạy riêng từng suite: 27 lần `node --test --test-concurrency=1 --test-name-pattern="<suite>" tests/<file>.test.js` | 104 test | 101 | 3 | suite `US02`, `US07`, `US10` — **TD-01** (phụ thuộc thứ tự); chạy cả file hoặc kèm suite tiền đề thì PASS | §4.4 |
| 7 | 2026-11-13 19:07–19:13 | **Chụp ảnh từng test case**: mỗi TC chạy trong một cửa sổ terminal riêng rồi chụp chính cửa sổ đó (runner tạm theo TC, ngoài repo): chạy đúng lệnh `node --test …` của TC ở §2 và/hoặc các bước bổ sung của TC đó trên CSDL mới | 33 TC | 27 | 6 | TC-03, TC-15, TC-24, TC-26, TC-27, TC-28 — **khớp từng TC với kết luận ở §2** | §4.5 |
| 8 | 2026-11-13 19:12 | Hai lần chạy để chụp ảnh tổng kết: `npm test` đầy đủ (`npm-test-pass.png`) và toàn bộ bước bổ sung ở chế độ tổng kết (`bo-sung-tong-ket.png`) | 104 test; 129 bước | 104; 109 | 0; 16 | bước bổ sung: cùng 16 bước FAIL như lần 4 | §4.5 |

Kết quả theo test case (33 TC, bảng ở §2): **27 PASS · 6 FAIL**.

| Loại | Số TC | PASS | FAIL | TC FAIL |
|---|---:|---:|---:|---|
| luồng đúng | 24 | 22 | 2 | TC-03 (DEV-01), TC-15 (DEV-02) — lệch có chủ đích |
| giá trị biên | 4 | 1 | 3 | TC-24 (BUG-01), TC-26 (BUG-02), TC-27 (BUG-03, BUG-04) |
| dữ liệu sai | 1 | 0 | 1 | TC-28 (BUG-05) |
| bảo mật | 3 | 3 | 0 | — |
| tái lập | 1 | 1 | 0 | — |
| **Tổng** | **33** | **27** | **6** | |

Theo ưu tiên: Cao 22 TC (20 PASS, 2 FAIL = TC-03, TC-15) · Trung bình 10 TC (6 PASS, 4 FAIL = TC-24, TC-26, TC-27, TC-28) · Thấp 1 TC (PASS). Theo tầng: tự động thuần 14 TC · tự động + bổ sung 10 TC · chỉ bổ sung 9 TC (khớp [test-plan.md](test-plan.md) §2).
Cả năm loại test đều có (luồng đúng, giá trị biên, dữ liệu sai, bảo mật, tái lập). Không có lỗi Critical hay Major; có **5 lỗi Minor đang mở** (BUG-01…BUG-05, §3) và **15 phản hồi HTTP 500** ở bước bổ sung, **không phản hồi nào lộ stack trace**.

**Lệnh chạy** (đã chạy thật ở các lần trên):
- Cả bộ tự động bằng **một lệnh**: `npm test` → 104 test (cần PostgreSQL đang chạy và `.env` theo README mục 3).
- Chạy riêng nhóm test của một TC: `node --test --test-concurrency=1 --test-name-pattern="<mẫu>" tests/<file>.test.js` (mẫu và file của từng TC ở §2). **Không dùng** `npm test -- --test-name-pattern=...` — lệnh này vẫn chạy cả 104 test (đã thử, lọc không có tác dụng).
- Các bước bổ sung `S-xx` không nằm trong `npm test`; chạy lại bằng Postman/curl theo cột "Dữ liệu thử" ở §2.

## 2. Test case (8 cột)

Cột 7–8 ghi kết quả của lần chạy 2 (`npm test`) và lần chạy 5 (bước bổ sung); lần chạy 7 (chụp ảnh từng TC, §4.5) cho **cùng kết luận ở cả 33 TC**. Bước không có nhãn là test tự động trong `npm test`; bước có nhãn *(S-xx)* là bước bổ sung trên server thật. Kết quả mong đợi (cột 5) lấy từ **tiêu chí chấp nhận trong `ProductBacklog_Nhom03.xlsx`** (AC1, AC2… là thứ tự kịch bản trong user story) và từ [api-contract.md](api-contract.md), không lấy từ mã nguồn. Phần giao diện chỉ được rà soát mã (`file:dòng`), **chưa chạy trên trình duyệt** nên không tính PASS.

Tiền điều kiện chung của các bước `npm test` ("Dữ liệu chung"): mỗi file test gọi `datLaiCoSoDuLieu()` (`tests/helpers.js`) — xóa và dựng lại lược đồ `suachua_test` từ `migrations/`; tài khoản tạo bằng `taoTaiKhoan()` (mật khẩu `matkhau123`, SĐT `0901234567`) và đăng nhập thật để lấy JWT; tin mẫu `{"title":"Sửa máy lạnh không lạnh","description":"Máy lạnh chạy nhưng không làm lạnh","category":"Điện lạnh","location":"Quận 7, TP.HCM","preferredTime":"2026-11-05T09:00:00Z"}`; gọi API bằng `supertest` vào PostgreSQL thật.
Tiền điều kiện chung của các bước *(S-xx)*: CSDL `suachua_dev` mới tạo → `npm run migrate` → quản trị viên tạo bằng `npm run create-admin` (`admin.live@example.com`) → `node src/server.js` ở cổng 3100; tài khoản tự đăng ký qua `POST /api/auth/register` (mật khẩu `matkhau123`); mỗi lần chạy bắt đầu từ CSDL trống.

| Mã TC | Tiền điều kiện | Các bước | Dữ liệu thử | Kết quả mong đợi | Ưu tiên | Kết quả thực tế | PASS/FAIL |
|---|---|---|---|---|---|---|---|
| **TC-01** [luồng đúng] US01 · FR01 · BR01 | Dữ liệu chung; chưa có tài khoản `minh.anh@example.com`. | B1 (AC1): `POST /api/auth/register` đủ thông tin.<br>B2 (AC2): thiếu trường bắt buộc.<br>B3 (AC3): trùng email (khác hoa/thường).<br>B4: vai trò `ADMIN` (BR01).<br>B5 *(S-01-4)*: hai yêu cầu cùng email gửi song song. | B1 `{"email":"Minh.Anh@Example.com","password":"matkhau123","fullName":"Nguyễn Minh Anh","phone":"0901234567","role":"CUSTOMER"}`.<br>B2 `{"email":"a@b.com"}`.<br>B3 email `minh.anh@example.com`.<br>B4 như B1, `role`=`ADMIN`.<br>B5 hai `POST` cùng một email mới. | B1 tạo tài khoản mới, báo đăng ký thành công. B2 báo lỗi yêu cầu nhập đủ thông tin, không tạo tài khoản. B3 thông báo "Email đã tồn tại". B4 không cho tự đăng ký quản trị viên. B5 chỉ một tài khoản được tạo. | Cao | B1 `201` "Đăng ký thành công", email chuẩn hóa thành `minh.anh@example.com`, có `token`, không có `passwordHash`.<br>B2 `400 VALIDATION_ERROR`, `details` nêu `fullName`, `password`, `phone`, `role`; `path`=`/api/auth/register`.<br>B3 `409 EMAIL_ALREADY_EXISTS` "Email đã tồn tại".<br>B4 `400`, chỉ trường `role`.<br>B5 một `201`, một `409 EMAIL_ALREADY_EXISTS`.<br>Giao diện (rà soát mã): chuyển đến đăng nhập kèm thông báo — `RegisterPage.jsx:21-27`. | **PASS** |
| **TC-02** [luồng đúng] US02 · FR02 · BR01, BR02 | Dữ liệu chung; tài khoản `minh.anh@example.com` (tạo ở US01 — **TD-01**); 1 kỹ thuật viên bị khóa. | B1 (AC1): `POST /api/auth/login` đúng email và mật khẩu.<br>B2 (AC2): sai mật khẩu; email không tồn tại.<br>B3 (AC3): tài khoản bị khóa, nhập đúng. | B1 `{"email":"minh.anh@example.com","password":"matkhau123"}`.<br>B2 `{"email":"minh.anh@example.com","password":"sai"}` và `{"email":"khong@co.com","password":"matkhau123"}`.<br>B3 kỹ thuật viên `isLocked=true`, mật khẩu `matkhau123`. | B1 xác thực thành công, trả đủ thông tin để chuyển đến trang chủ theo vai trò. B2 thông báo "Email hoặc mật khẩu không đúng". B3 thông báo "Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên". | Cao | B1 `200`, có `token`, `user.role`=`CUSTOMER`, `isLocked`=false, không có `passwordHash`.<br>B2 cả hai trường hợp `401 UNAUTHORIZED` cùng thông báo "Email hoặc mật khẩu không đúng" (không lộ email nào có trong hệ thống).<br>B3 `403 ACCOUNT_LOCKED` "Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên".<br>Giao diện (rà soát mã): chuyển theo vai trò — `LoginPage.jsx:34-36`, `screenRoutes.js:32`. | **PASS** |
| **TC-03** [luồng đúng] US03 · FR03 | Dữ liệu chung; khách hàng (B1–B3) và kỹ thuật viên (B4) đã đăng nhập (có token). | B1 (AC1): `POST /api/auth/logout` có token *(S-03-1)*.<br>B2: `POST /api/auth/logout` không token.<br>B3 *(S-03-3)* (AC1 "kết thúc phiên"): dùng lại **chính token đó** gọi `GET /api/auth/me` sau khi đăng xuất.<br>B4: `GET /api/auth/me` với token hợp lệ, token sai, token của tài khoản vừa bị khóa. | Header `Authorization: Bearer <token>`.<br>B4 token sai `abc.def.ghi`. | B1 `200` "Đăng xuất thành công"; hệ thống kết thúc phiên (xóa thông tin đăng nhập, về trang đăng nhập). B2 `401`. **B3 token cũ phải bị từ chối `401`** vì phiên đã kết thúc. B4 `/me` đúng người dùng; token sai `401`; tài khoản bị khóa `403 ACCOUNT_LOCKED`. | Cao | B1 `200` "Đăng xuất thành công".<br>B2 `401 UNAUTHORIZED`.<br>**B3 `200` — token cũ vẫn trả thông tin người dùng**: JWT không lưu phiên ở server nên đăng xuất không vô hiệu hóa token (**DEV-01**).<br>B4 `/me` trả đúng `id`, `role`=`TECHNICIAN`, `createdAt`; token sai `401`; sau khi bị khóa `403 ACCOUNT_LOCKED`.<br>Giao diện (rà soát mã): xóa phiên và về trang đăng nhập — `AppLayout.jsx:14-22`. | **FAIL** (B3 — DEV-01) |
| **TC-04** [luồng đúng] US04 · FR04 · BR01 | Dữ liệu chung; 1 quản trị viên, 1 khách hàng "Nguyễn Minh Anh", 1 kỹ thuật viên "Trần Quốc Huy". | B1 (AC1): quản trị viên `GET /api/admin/users`.<br>B2 (AC2): khách hàng và kỹ thuật viên gọi cùng API.<br>B3: lọc theo từ khóa, vai trò, trạng thái.<br>B4 *(S-04-0, S-04-1)*: trên server thật, quản trị viên tạo bằng CLI đăng nhập, kiểm tra từng dòng danh sách. | B1 `GET /api/admin/users`.<br>B3 `?q=quốc huy`, `?role=CUSTOMER`, `?status=LOCKED`. | B1 danh sách tài khoản có họ tên, email, vai trò, trạng thái (hoạt động/khóa). B2 hệ thống từ chối và báo không có quyền. | Cao | B1 `200`; chỉ có `CUSTOMER` và `TECHNICIAN` (không có `ADMIN`), không có `passwordHash`, `meta.summary`=`{active:2, locked:0}`; trên server thật 6/6 dòng đủ `fullName`, `email`, `role`, `isLocked`.<br>B2 `403 FORBIDDEN` cho cả khách hàng và kỹ thuật viên.<br>B3 lọc đúng theo tên, vai trò, trạng thái.<br>Giao diện (rà soát mã): bảng đủ cột — `UserTable.jsx:8-11`; **lệch UI-01**: người sai vai trò bị chuyển hướng im lặng, không hiện thông báo không có quyền (`ProtectedRoute.jsx:6-19`) — chưa xác minh trên trình duyệt. | **PASS** (phần API); UI-01 chờ xác minh |
| **TC-05** [luồng đúng] US05 · FR05 · BR02 | Dữ liệu chung; 1 quản trị viên, 1 khách hàng, 1 kỹ thuật viên. | B1 (AC1): `PATCH /api/admin/users/{id}/lock`, rồi đăng nhập và gọi API bằng token cũ.<br>B2 (AC2): `PATCH .../unlock`, rồi đăng nhập lại.<br>B3: khóa quản trị viên; id không tồn tại; kỹ thuật viên gọi khóa. | B1, B2 id của khách hàng.<br>B3 id quản trị viên (kể cả chính mình), id `999999`. | B1 trạng thái "Bị khóa", người dùng không đăng nhập được nữa. B2 trạng thái "Hoạt động", đăng nhập bình thường. B3 từ chối. | Cao | B1 `200` "Khóa tài khoản thành công", `isLocked`=true; đăng nhập → `ACCOUNT_LOCKED`; token cũ gọi `/api/auth/me` → `ACCOUNT_LOCKED`.<br>B2 `200` "Mở khóa tài khoản thành công", `isLocked`=false, đăng nhập `200`.<br>B3 khóa quản trị viên `403`; `999999` → `404 USER_NOT_FOUND`; kỹ thuật viên gọi `403`.<br>Giao diện (rà soát mã): hộp xác nhận và thông báo thành công — `UserManagementPage.jsx:44-61`. | **PASS** |
| **TC-06** [luồng đúng] US06 · FR06 · BR05 | Dữ liệu chung; khách hàng đã đăng nhập. | B1 (AC1): `POST /api/requests` đủ thông tin.<br>B2 (AC2): thiếu trường bắt buộc, rồi đếm lại số tin của khách *(S-06-3)*.<br>B3: kỹ thuật viên, quản trị viên, chưa đăng nhập đăng tin. | B1 tin mẫu.<br>B2 `{"description":"abc"}` (test tự động); `{"title":"Chỉ có tiêu đề"}` (S-06-3).<br>B3 cùng tin mẫu. | B1 tạo tin trạng thái "Chờ đề xuất", báo thành công, chuyển đến danh sách tin. B2 báo lỗi tại các trường còn thiếu và không tạo tin. | Cao | B1 `201` "Tạo tin thành công", `status`=`WAITING_PROPOSAL`, `customerId`=người gọi, `selectedProposalId`=null, `preferredTime`=`2026-11-05T09:00:00.000Z`.<br>B2 `400 VALIDATION_ERROR`, `details`: `category`, `location`, `preferredTime`, `title` (test) / `description`, `category`, `location`, `preferredTime` (S-06-3); số tin của khách trước/sau = 2/2 (không tạo tin).<br>B3 kỹ thuật viên, quản trị viên `403 FORBIDDEN`; chưa đăng nhập `401`.<br>Giao diện (rà soát mã): `RequestForm.jsx:113-114` (thông báo + về "Tin của tôi"), `:117-119` (lỗi theo trường). | **PASS** |
| **TC-07** [luồng đúng] US07 · FR07 · BR03 | Dữ liệu chung; khách hàng A có tin, khách hàng B có tin, khách hàng C chưa có tin; chạy sau US06 (**TD-01**). | B1 (AC1): `GET /api/requests/my` (A).<br>B2 (AC2): khách hàng chưa có tin *(S-07-3, CSDL trống)*.<br>B3: phân trang; kỹ thuật viên gọi. | B3 `?page=2&size=2` với 3 tin "Tin 1…Tin 3". | B1 danh sách tin do chính khách hàng đăng, có mô tả ngắn, ngày tạo, trạng thái. B2 danh sách rỗng (giao diện hiện "Bạn chưa có tin sửa chữa nào"). | Cao | B1 `200`; mọi tin có `customerId`=người gọi (không lẫn tin của B); có `title`, `description`, `createdAt`, `status`, `proposalCount`=0; `meta` gồm `page`, `size`, `totalElements`, `totalPages` *(S-07-4: 2/2 tin đủ trường)*.<br>B2 `200`, `data`=[], `totalElements`=0.<br>B3 `{page:2,size:2,totalElements:3,totalPages:2}`, 1 dòng "Tin 1"; kỹ thuật viên gọi `403`.<br>Giao diện (rà soát mã): `MyRequestsPage.jsx:62` (thông báo rỗng), `:63-73` (cột). | **PASS** |
| **TC-08** [luồng đúng] US08 · FR08 · BR03 | Dữ liệu chung; khách hàng A có 1 tin; khách hàng B. | B1 (AC1): `GET /api/requests/{id}` bởi chủ tin *(S-08-3 kiểm đủ trường)*.<br>B2 (AC2): bởi khách hàng B.<br>B3: mã không tồn tại / không hợp lệ. | B3 `999999`, `abc`. | B1 hiển thị đầy đủ mô tả, loại dịch vụ, địa điểm, thời gian, trạng thái (danh sách đề xuất lấy từ API đề xuất — TC-14). B2 hệ thống từ chối và báo không có quyền. | Cao | B1 `200`; có `description`, `category`=`Điện lạnh`, `location`=`Quận 7, TP.HCM`, `preferredTime`, `status`=`WAITING_PROPOSAL`; `customer.fullName` và `customer.phone` của chính mình.<br>B2 `403 NOT_OWNER`.<br>B3 `404 REQUEST_NOT_FOUND` cho cả hai mã.<br>Giao diện (rà soát mã): `RequestDetailPage.jsx` (khách) `:84-92`, lỗi hiển thị `:75`. | **PASS** |
| **TC-09** [luồng đúng] US09 · FR09 · BR03, BR06 | Dữ liệu chung; khách hàng A, khách hàng B, kỹ thuật viên. | B1 (AC1): `PATCH /api/requests/{id}/close` tin Chờ đề xuất, rồi kỹ thuật viên xem danh sách và gửi đề xuất.<br>B2 (AC2): đóng tin đã `SELECTED`.<br>B3: đóng lần hai; người khác đóng. | B1 tin "Tin sẽ đóng".<br>B2 tin chuyển `SELECTED`. | B1 tin "Đã đóng", không còn nhận đề xuất mới, báo thành công. B2 từ chối với thông báo "Không thể đóng tin đã chọn kỹ thuật viên". | Cao | B1 `200` "Đóng tin thành công", `status`=`CLOSED`; kỹ thuật viên không còn thấy tin trong danh sách; gửi đề xuất → `REQUEST_NOT_WAITING`.<br>B2 `400 REQUEST_ALREADY_SELECTED` "Không thể đóng tin đã chọn kỹ thuật viên".<br>B3 đóng lần hai `INVALID_STATUS_TRANSITION`; người khác `403 NOT_OWNER`.<br>Giao diện (rà soát mã): `RequestDetailPage.jsx` (khách) `:55-73`; nút "Đóng tin" chỉ hiện khi Chờ đề xuất `:87`. | **PASS** |
| **TC-10** [luồng đúng] US10 · FR10 · BR04, BR15 | Dữ liệu chung; có 1 tin `SELECTED`; chạy sau US06–US08 (**TD-01**). | B1 (AC1): kỹ thuật viên `GET /api/requests?size=100` *(S-10-4 kiểm đủ trường)*.<br>B2 (AC2) *(S-10-3)*: CSDL không có tin Chờ đề xuất.<br>B3: khách hàng gọi API này. | B1 `GET /api/requests?size=100`.<br>B2 `GET /api/requests` trên CSDL trống. | B1 chỉ các tin "Chờ đề xuất" kèm loại dịch vụ, khu vực, mô tả ngắn. B2 danh sách rỗng (giao diện hiện "Hiện không có tin sửa chữa nào"). | Cao | B1 `200`; mọi tin `WAITING_PROPOSAL`, không có tin `SELECTED`, không có trường `customer` (không lộ liên hệ); mỗi dòng có `category`, `location`, `title`, `description` (S-10-4: 2/2 tin).<br>B2 `200`, `data`=[], `totalElements`=0.<br>B3 khách hàng `403`.<br>Giao diện (rà soát mã): `RequestSearchPage.jsx:54` (thông báo rỗng), `:56-57` (thẻ tin). | **PASS** |
| **TC-11** [luồng đúng] US11 · FR11 | Dữ liệu chung; có tin `Điện nước` ở `Thủ Đức` và tin `Điện lạnh` ở `Quận 7`. | B1 (AC1): `GET /api/requests` kèm `category` và/hoặc `location` *(S-11-3, S-11-4)*.<br>B2 (AC2): bộ lọc không khớp tin nào *(S-11-5)*. | B1 `?category=Điện nước&location=thủ đức`; `?category=Điện nước`; `?location=quận 7`.<br>B2 `?category=Loại không tồn tại&location=Hà Nội`. | B1 chỉ hiện các tin thỏa tiêu chí đã chọn. B2 danh sách rỗng (giao diện hiện "Không tìm thấy tin phù hợp"). | Cao | B1 `200`, đúng 1 tin `category`=`Điện nước` (khu vực khớp không phân biệt hoa thường và chữ `Đ/đ`); chỉ theo loại → 1 tin đúng loại; chỉ theo khu vực `quận 7` (gõ một phần) → có tin "Quận 7, TP.HCM", không có tin "Thủ Đức".<br>B2 `200`, `data`=[], `totalElements`=0.<br>Giao diện (rà soát mã): `RequestSearchPage.jsx:20,29,44-45`, `:54`. | **PASS** |
| **TC-12** [luồng đúng] US12 · FR12 · BR04, BR15 | Dữ liệu chung; khách hàng có 1 tin Chờ đề xuất và 1 tin `CLOSED`. | B1 (AC1): kỹ thuật viên `GET /api/requests/{id}`.<br>B2 (AC2): tin không còn Chờ đề xuất.<br>B3: quản trị viên gọi. | B1 tin Chờ đề xuất.<br>B2 tin `CLOSED`. | B1 đủ thông tin tin, **chưa** hiện liên hệ chi tiết của khách hàng. B2 vẫn xem được nhưng không có nút "Gửi đề xuất". | Cao | B1 `200`; `customer.fullName`, **không có** `customer.phone`; `canPropose`=true, `hasProposed`=false, `myProposalStatus`=null.<br>B2 `200`, `status`=`CLOSED`, `canPropose`=false.<br>B3 quản trị viên `403`.<br>Giao diện (rà soát mã): `RequestDetailPage.jsx` (kỹ thuật viên) `:24-26` — nút "Gửi đề xuất" chỉ hiện khi `canPropose`; `:56` ghi chú về số điện thoại. | **PASS** |
| **TC-13** [luồng đúng] US13 · FR13 · BR07, BR08 | Dữ liệu chung; khách hàng có tin Chờ đề xuất; 2 kỹ thuật viên. | B1 (AC1): `POST /api/proposals`.<br>B2 (AC2): gửi lần hai cùng tin.<br>B3 (AC3): tin không còn Chờ đề xuất.<br>B4: hai yêu cầu song song.<br>B5: dữ liệu sai.<br>B6: tin không tồn tại; khách hàng gửi. | B1 `{"requestId":<id>,"price":350000,"description":"Có thể đến trong ngày mai","estimatedDuration":"2-3 giờ"}`.<br>B3 tin `CLOSED`.<br>B5 `price`=`0`, `description`=`" "`.<br>B6 `requestId`=`999999`. | B1 lưu đề xuất, báo thành công. B2 từ chối "Bạn đã gửi đề xuất cho tin này". B3 từ chối với thông báo phù hợp. B4 chỉ một đề xuất hiệu lực. | Cao | B1 `201` "Gửi đề xuất thành công", `status`=`PENDING`, `price`=350000, `technicianId`=người gọi.<br>B2 `409 ALREADY_PROPOSED` "Bạn đã gửi đề xuất cho tin này".<br>B3 `400 REQUEST_NOT_WAITING`.<br>B4 `[201, 409]`.<br>B5 `400 VALIDATION_ERROR`, `details`: `description`, `price`.<br>B6 `404 REQUEST_NOT_FOUND`; khách hàng gửi `403`.<br>Giao diện (rà soát mã): `ProposalCreatePage.jsx:22-26`, `:34`, `:39`. | **PASS** |
| **TC-14** [luồng đúng] US14 · FR14 · BR09 | Dữ liệu chung; tin có 2 đề xuất (KTV "Trần Văn A" 300000, "Lê Văn B" 400000); tin khác chưa có đề xuất. | B1 (AC1): chủ tin `GET /api/proposals/request/{requestId}`.<br>B2 (AC2): tin chưa có đề xuất.<br>B3: khách hàng khác, kỹ thuật viên gọi. | `GET /api/proposals/request/{id}`. | B1 danh sách đề xuất có tên kỹ thuật viên, giá, nội dung tóm tắt, thời gian gửi. B2 danh sách rỗng (giao diện hiện "Chưa có đề xuất nào"). | Cao | B1 `200`; 2 đề xuất theo thứ tự gửi, `technician.fullName`=`Trần Văn A`, `Lê Văn B`, `price`=300000, 400000, có `createdAt`.<br>B2 `data`=[].<br>B3 khách hàng khác `403 NOT_OWNER`; kỹ thuật viên `403`.<br>Giao diện (rà soát mã): `ProposalList.jsx:8`, `:11-14`. | **PASS** |
| **TC-15** [luồng đúng] US15 · FR15 · BR09 | Dữ liệu chung; đề xuất 300000 của "Trần Văn A" cho tin của khách hàng A; khách hàng B; kỹ thuật viên B. | B1 (AC1): chủ tin `GET /api/proposals/{id}`.<br>B2 (AC2): khách hàng khác và kỹ thuật viên khác (không liên quan) xem.<br>B3 (AC2 đọc nguyên văn "chỉ chủ tin mới được xem"): kỹ thuật viên **đã gửi** đề xuất xem.<br>B4: đề xuất không tồn tại. | `GET /api/proposals/{id}`; B4 `999999`. | B1 đủ giá, mô tả chi tiết, thông tin kỹ thuật viên. **B2 và B3 từ chối truy cập** (không phải chủ tin). | Cao | B1 `200`, `price`=300000, `technician.fullName`=`Trần Văn A`, `request.id`.<br>B2 `403 NOT_OWNER` (khách hàng B và kỹ thuật viên B).<br>**B3 `200`** — kỹ thuật viên gửi đề xuất cũng xem được: mở rộng có chủ đích để chuông thông báo mở được đề xuất (**DEV-02**).<br>B4 `404 PROPOSAL_NOT_FOUND`.<br>Giao diện (rà soát mã): `ProposalReviewPage.jsx:51-66`, lỗi hiển thị `:47`. | **FAIL** (B3 — DEV-02) |
| **TC-16** [luồng đúng] US16 · FR16 · BR09, BR10, BR12, BR15, BR16 | Dữ liệu chung; tin có 2 đề xuất `PENDING` của 2 kỹ thuật viên; khách hàng B. | B1 (AC1): chủ tin `PATCH /api/proposals/{id}/accept`.<br>B2 (AC2): chấp nhận đề xuất khác của cùng tin.<br>B3: xem số điện thoại khách (BR15).<br>B4: hai chấp nhận song song.<br>B5: không phải chủ tin.<br>B6: đề xuất không tồn tại.<br>B7: đăng tin → đề xuất → chọn → hoàn thành. | `PATCH /api/proposals/{id}/accept`; B6 `999999`. | B1 tin "Đã chọn kỹ thuật viên", đề xuất được đánh dấu chọn, các đề xuất khác không còn chọn được, tạo thông báo cho kỹ thuật viên được chọn. B2 từ chối "Tin đã chọn kỹ thuật viên". | Cao | B1 `200` "Chấp nhận đề xuất thành công", `status`=`ACCEPTED`; đề xuất còn lại `REJECTED`; tin `SELECTED` với `selected_proposal_id` đúng; 1 thông báo `PROPOSAL_ACCEPTED` (`is_read`=false) cho kỹ thuật viên được chọn.<br>B2 `409 PROPOSAL_ALREADY_ACCEPTED` "Tin đã chọn kỹ thuật viên".<br>B3 kỹ thuật viên được chọn thấy `customer.phone`=`0901234567`, người khác thì không; `myProposalStatus`=`ACCEPTED`/`REJECTED`.<br>B4 `[200, 409]`, đúng 1 đề xuất `ACCEPTED`.<br>B5 `403 NOT_OWNER`. B6 `404 PROPOSAL_NOT_FOUND`. B7 `COMPLETED`, `selectedProposalId` đúng.<br>Giao diện (rà soát mã): `RequestDetailPage.jsx` (khách) `:40-53`, `ProposalReviewPage.jsx:33-39`. | **PASS** |
| **TC-17** [luồng đúng] US17 · FR17 · BR11, BR12 | Dữ liệu chung; khách hàng A và B; tin ở các trạng thái Chờ đề xuất / Đã chọn. | B1 (AC1): chủ tin `PATCH /api/requests/{id}/complete` khi `SELECTED`; thử lần hai.<br>B2 (AC2): người không phải chủ tin.<br>B3 (AC3): tin Chờ đề xuất. | `PATCH /api/requests/{id}/complete`. | B1 trạng thái "Hoàn thành", báo thành công. B2 từ chối, báo không có quyền. B3 từ chối vì sai trình tự trạng thái. | Cao | B1 `200`, `status`=`COMPLETED`; lần hai `INVALID_STATUS_TRANSITION`.<br>B2 `403 NOT_OWNER`.<br>B3 `400 INVALID_STATUS_TRANSITION`.<br>Giao diện (rà soát mã): `RequestTrackingPage.jsx:28-40` (xác nhận + thông báo), `:62` (nút chỉ hiện khi `SELECTED`). | **PASS** |
| **TC-18** [luồng đúng] US18 · FR18 · BR13, BR14 | Dữ liệu chung; công việc đã `COMPLETED` (khách A, kỹ thuật viên được chọn) và một công việc chưa hoàn thành. | B1 (AC1): khách `POST /api/reviews`.<br>B2 (AC2): công việc chưa hoàn thành.<br>B3 (AC3): đánh giá lần hai.<br>B4: số sao ngoài 1–5.<br>B5 *(S-18-4)*: hai yêu cầu đánh giá song song. | B1 `{"requestId":<id>,"rating":5,"comment":"Rất tốt"}`; công việc thứ hai `rating`=4.<br>B4 `rating`=6. | B1 lưu đánh giá, báo thành công. B2 từ chối "Chỉ được đánh giá sau khi công việc hoàn thành". B3 từ chối "Bạn đã đánh giá rồi". | Trung bình | B1 `201` "Đánh giá thành công", `toUserId`=kỹ thuật viên được chọn, `fromUserId`=khách; điểm trung bình sau hai đánh giá 5 và 4 = `4.5`; chi tiết tin `hasReviewed`=true.<br>B2 `400 CANNOT_REVIEW_YET` "Chỉ được đánh giá sau khi công việc hoàn thành".<br>B3 `409 ALREADY_REVIEWED` "Bạn đã đánh giá rồi".<br>B4 `400`, `details` chỉ `rating`.<br>B5 `[201, 409 ALREADY_REVIEWED]`.<br>Giao diện (rà soát mã): `ReviewForm.jsx:23-24`, `:67`. | **PASS** |
| **TC-19** [luồng đúng] US19 · FR19 · BR13, BR14 | Dữ liệu chung; công việc `COMPLETED` (khách "Khách Hàng A", kỹ thuật viên được chọn, kỹ thuật viên khác, khách hàng khác). | B1 (AC1): kỹ thuật viên được chọn `POST /api/reviews`.<br>B2 (AC2): kỹ thuật viên không được chọn; khách hàng ngoài.<br>B3: công việc chưa hoàn thành.<br>B4: `GET /api/reviews/user/{userId}` (có trong API contract, ngoài backlog). | B1 `{"requestId":<id>,"rating":4,"comment":"Thân thiện"}`.<br>B4 `999999`. | B1 lưu đánh giá, báo thành công. B2 hệ thống từ chối. B3 từ chối. | Trung bình | B1 `201`, `toUserId`=khách hàng.<br>B2 `403 NOT_OWNER` cho cả hai.<br>B3 `400 CANNOT_REVIEW_YET`.<br>B4 `200`, có `fromUser.fullName`, `meta.user.fullName`=`Khách Hàng A`; `999999` → `404 USER_NOT_FOUND`.<br>Giao diện (rà soát mã): `ReviewForm.jsx:22-24`, `:67` (dùng chung với US18). | **PASS** |
| **TC-20** [luồng đúng] US20 · FR20 · BR16 | Dữ liệu chung; 1 khách hàng, 2 kỹ thuật viên; kỹ thuật viên chính có 2 đề xuất sắp được chấp nhận. | B1 (AC1): khách chấp nhận đề xuất "Sửa máy giặt" rồi "Sửa tủ lạnh".<br>B2 (AC2): kỹ thuật viên `GET /api/notifications`, `GET /api/notifications/unread-count`, `PATCH /api/notifications/{id}/read`.<br>B3: đọc thông báo của người khác; id không tồn tại.<br>B4: người chưa có thông báo; chưa đăng nhập. | `PATCH /api/proposals/{id}/accept` ×2; B3 `999999`. | B1 tạo thông báo cho kỹ thuật viên với nội dung phù hợp (ví dụ: đề xuất cho tin … đã được chấp nhận). B2 danh sách thông báo theo thứ tự thời gian. | Thấp | B1 2 thông báo `PROPOSAL_ACCEPTED`, nội dung `Đề xuất của bạn cho tin "Sửa tủ lạnh" đã được chấp nhận`, `relatedId`=mã đề xuất.<br>B2 mới nhất trước ("Sửa tủ lạnh" rồi "Sửa máy giặt"), `meta.totalElements`=2, `unread-count`=`{count:2}`; đánh dấu đã đọc → `isRead`=true, số chưa đọc giảm 1.<br>B3 người khác `403 NOT_OWNER`; `999999` → `404 NOTIFICATION_NOT_FOUND`.<br>B4 `data`=[]; chưa đăng nhập `401`.<br>Giao diện (rà soát mã): `NotificationBell.jsx:59-70`. | **PASS** |
| **TC-21** [luồng đúng] US21 · FR21 · BR03, BR06 | Dữ liệu chung; khách hàng A, khách hàng B, kỹ thuật viên; tin ở các trạng thái. | B1 (AC1): `PATCH /api/requests/{id}` tin Chờ đề xuất.<br>B2 (AC2): dữ liệu không hợp lệ.<br>B3 (AC3): tin `SELECTED`, `COMPLETED`, `CLOSED`.<br>B4: không gửi trường nào hợp lệ.<br>B5: khách hàng khác; kỹ thuật viên. | B1 `{"title":"  Tiêu đề mới  ","preferredTime":"2026-12-01T03:00:00Z"}`.<br>B2 `{"title":" ","preferredTime":"abc"}`.<br>B4 `{"status":"COMPLETED"}`. | B1 cập nhật thông tin tin, báo chỉnh sửa thành công. B2 báo lỗi và không cập nhật dữ liệu. B3 từ chối và nêu lý do. | Trung bình | B1 `200` "Chỉnh sửa tin thành công", `title`="Tiêu đề mới" (đã bỏ khoảng trắng thừa), `preferredTime`=`2026-12-01T03:00:00.000Z`, mô tả giữ nguyên.<br>B2 `400`, `details`: `preferredTime`, `title`; tiêu đề trong CSDL không đổi.<br>B3 cả 3 trạng thái `409 REQUEST_NOT_EDITABLE`.<br>B4 `400 VALIDATION_ERROR` (không đổi `status` qua PATCH).<br>B5 khách hàng khác `403 NOT_OWNER`; kỹ thuật viên `403`.<br>Giao diện (rà soát mã): `RequestForm.jsx:109-110`, `:117-119`; `RequestEditPage.jsx:20-23`. | **PASS** |
| **TC-22** [luồng đúng] US22 · FR22 | Dữ liệu chung; đề xuất `PENDING` 300000 của kỹ thuật viên A; kỹ thuật viên B; khách hàng. | B1 (AC1): `PATCH /api/proposals/{id}`.<br>B2 (AC2): dữ liệu không hợp lệ.<br>B3 (AC3): đề xuất đã chấp nhận; đã rút; tin đã đóng.<br>B4: kỹ thuật viên khác sửa.<br>B5: `GET /api/proposals/my` (màn hình "Đề xuất của tôi"). | B1 `{"price":280000,"estimatedDuration":""}`.<br>B2 `{"price":-1,"description":""}`.<br>B3 giá `1`. | B1 cập nhật nội dung đề xuất, báo chỉnh sửa thành công. B2 báo lỗi, không cập nhật. B3 từ chối và nêu lý do. | Trung bình | B1 `200` "Chỉnh sửa đề xuất thành công", `price`=280000, `estimatedDuration`=null (chuỗi rỗng → null), mô tả giữ nguyên.<br>B2 `400`, `details`: `description`, `price`; giá trong CSDL vẫn 300000.<br>B3 đã chấp nhận `409 PROPOSAL_ALREADY_ACCEPTED`; đã rút `409 PROPOSAL_NOT_EDITABLE`; tin đã đóng `REQUEST_NOT_WAITING`.<br>B4 `403 NOT_OWNER`.<br>B5 `200`, chỉ đề xuất của mình kèm `request.title`, `meta.page`=1; khách hàng gọi `403`.<br>Giao diện (rà soát mã): `ProposalEditPage.jsx:11-17`, `:29-36`, `:43-45`; `ProposalForm.jsx:27-29`. | **PASS** |
| **TC-23** [luồng đúng] US23 · FR23 · BR08 | Dữ liệu chung; đề xuất `PENDING` của kỹ thuật viên A; khách hàng. | B1 (AC1): `PATCH /api/proposals/{id}/close`; khách xem danh sách và thử chấp nhận.<br>B2 (AC2): rút đề xuất đã chấp nhận.<br>B3 (AC3): rút lần hai.<br>B4: gửi đề xuất mới cho cùng tin sau khi rút. | `PATCH /api/proposals/{id}/close`; B4 `{"requestId":<id>,"price":250000,"description":"Đề xuất mới"}`. | B1 trạng thái đề xuất thành `DA_RUT`, báo rút thành công; khách không chọn được đề xuất đó; dữ liệu vẫn lưu. B2 từ chối, báo đề xuất đã được chấp nhận. B3 từ chối, báo trạng thái hiện tại. | Trung bình | B1 `200` "Rút đề xuất thành công", `status`=`WITHDRAWN` — tiêu chí ghi `DA_RUT` là tên hằng số nội bộ (`constants.js:18`), giá trị API/CSDL là `WITHDRAWN` (**DEV-03**: lệch tên, cùng ngữ nghĩa); khách thấy `WITHDRAWN` và chấp nhận → `INVALID_STATUS_TRANSITION`.<br>B2 `409 PROPOSAL_ALREADY_ACCEPTED`.<br>B3 `400 INVALID_STATUS_TRANSITION` "Không thể rút vì đề xuất đã rút".<br>B4 `201` (BR08).<br>Giao diện (rà soát mã): `MyProposalsPage.jsx:74`, `:81`, `:112` (nút "Rút đề xuất" chỉ khi `PENDING`). | **PASS** (DEV-03) |
| **TC-24** [biên] US01 · FR01 | Bước bổ sung *(S-24-1…S-24-13)*: server thật, CSDL trống. | B1: mật khẩu 5 và 6 ký tự.<br>B2: họ tên 100 và 101 ký tự.<br>B3: email 100 và 101 ký tự.<br>B4: SĐT 8, 9, 15, 16 chữ số.<br>B5: SĐT có dấu cách, chuỗi 20, 21, 23 ký tự (cột `phone` là `VARCHAR(20)`). | `POST /api/auth/register` với `{"email":"b.<mã>@example.com","password":"matkhau123","fullName":"Biên","phone":"0901234567","role":"CUSTOMER"}`, đổi một trường:<br>B1 `ppppp` / `pppppp`.<br>B2 `N`×100 / `N`×101.<br>B3 `e…e<mã>@example.com` dài 100 / 101.<br>B4 `09012345` / `090123456` / `090123456789012` / `0901234567890123`.<br>B5 `+0 9 0 1 2 3 4 5 6 7` (20), `+0  9 0 1 2 3 4 5 6 7` (21), `0 9 0 1 2 3 4 5 6 7 8 9` (23). | Phía hợp lệ `201`; phía vượt giới hạn `400 VALIDATION_ERROR`; **không bao giờ `500`** (ở B5: `201` hoặc `400`). | Trung bình | B1 5 → `400`; 6 → `201`. B2 100 → `201`; 101 → `400`. B3 100 → `201`; 101 → `400`. B4 8 → `400`; 9 → `201`; 15 → `201`; 16 → `400`.<br>B5 20 ký tự → `201`; **21 ký tự → `500 INTERNAL_ERROR`; 23 ký tự → `500`**: validator chấp nhận (10 và 12 chữ số sau khi bỏ dấu cách) nhưng cột chỉ chứa 20 ký tự — log server `value too long for type character varying(20)` → **BUG-01**.<br>11/13 bước PASS. | **FAIL** (BUG-01) |
| **TC-25** [biên] US06, US21 · FR06, FR21 · BR05 | Bước bổ sung *(S-25-1…S-25-13)*: khách hàng đã đăng nhập. | B1: `title` 200 và 201 ký tự.<br>B2: `category` 50 và 51.<br>B3: `location` 255 và 256.<br>B4: `description` 50.000 ký tự.<br>B5: `preferredTime` sai định dạng / rỗng / null / có múi giờ / quá khứ.<br>B6: `PATCH` `title` 201 ký tự. | `POST /api/requests` với tin mẫu, đổi một trường: `title` `a`×200 / ×201; `category` ×50 / ×51; `location` ×255 / ×256; `description` ×50000; `preferredTime` `abc`, `""`, `null`, `2026-12-05T09:00:00+07:00`, `2020-01-01T00:00:00Z`.<br>B6 `PATCH /api/requests/{id}` `{"title":<201 ký tự>}`. | ≤ giới hạn `201`; vượt giới hạn `400 VALIDATION_ERROR`; không `500`. | Trung bình | B1 200 → `201`; 201 → `400`. B2 50 → `201`; 51 → `400`. B3 255 → `201`; 256 → `400`. B4 `201`. B5 `abc`, rỗng, null → `400`; `+07:00` → `201`. B6 `400 VALIDATION_ERROR`.<br>12/12 bước có kết luận PASS.<br>Quan sát **OBS-02**: `preferredTime`=2020-01-01 (quá khứ) vẫn `201` — tiêu chí không yêu cầu từ chối. | **PASS** |
| **TC-26** [biên] US13, US22, US18, US19 · FR13, FR18, FR19, FR22 | Bước bổ sung *(S-26-1…S-26-21)*: kỹ thuật viên và khách hàng đã đăng nhập; mỗi lần gửi đề xuất dùng một tin mới; đánh giá dùng công việc đã hoàn thành. | B1: `price` 0, -1, 0.04, 0.05, 0.1, 350000.55, 9999999999999.9, 10¹³, chuỗi, null.<br>B2: `estimatedDuration` 50, 51, số 5.<br>B3: `rating` 0, 1, 5, 6, 4.5, chuỗi, thiếu.<br>B4: `comment` 1000 và 1001 ký tự. | `POST /api/proposals` `{"requestId":<tin mới>,"price":<giá trị>,"description":"Biên giá"}`; B2 `estimatedDuration` `a`×50 / ×51 / `5`.<br>B3, B4 `POST /api/reviews` `{"requestId":<việc đã hoàn thành>,"rating":<giá trị>}`; `{"rating":1,"comment":<1000 ký tự>}` (khách hàng); `{"rating":5}` (kỹ thuật viên); `{"rating":3,"comment":<1001 ký tự>}`. | Giá trị không hợp lệ `400 VALIDATION_ERROR`; hợp lệ `201`; **không bao giờ `500`**. | Trung bình | B1 0, -1, 10¹³, chuỗi, null → `400`; 0.1 và 9999999999999.9 → `201`; **0.04 → `500`** (log server `new row for relation "proposal" violates check constraint "proposal_price_check"`: cột `DECIMAL(15,1)` làm tròn 0.04 thành 0.0, vi phạm `price > 0`) → **BUG-02**; 0.05 → `201` nhưng lưu `0.1`; 350000.55 → `201` lưu `350000.6` (**OBS-05**: làm tròn thầm lặng).<br>B2 50 → `201`; 51 → `400`; số 5 → `400`.<br>B3 0, 6, 4.5, `"5"`, thiếu → `400`; 1 → `201`; 5 (kỹ thuật viên đánh giá khách) → `201`.<br>B4 1000 → `201`; 1001 → `400`.<br>20/21 bước PASS. | **FAIL** (BUG-02) |
| **TC-27** [biên] mọi API có `:id`, `page`, `size` | Bước bổ sung *(S-27-1…S-27-22)*: quản trị viên, khách hàng, kỹ thuật viên đã đăng nhập. | B1: mã 2147483647 và 2147483648 trên 10 endpoint.<br>B2: mã `0`, `-1`, `abc`, `1.5`.<br>B3: mã tin viết dạng hex / thập phân.<br>B4: `page`, `size` = 0, âm, 101, chữ, vượt trang cuối, 9999999999999999999. | B1 `GET /api/requests/{id}`, `GET /api/proposals/{id}`, `PATCH /api/proposals/{id}/accept`, `GET /api/proposals/request/{id}`, `PATCH /api/admin/users/{id}/lock`, `PATCH /api/notifications/{id}/read`, `GET /api/reviews/user/{id}`, `PATCH /api/requests/{id}/close`, thân `requestId` của `POST /api/proposals` và `POST /api/reviews`.<br>B3 `0x1`, `1.0`.<br>B4 `GET /api/requests/my?page=0&size=0`, `?page=-3&size=-5`, `?size=101`, `?page=abc&size=xyz`, `?page=999`, `?page=9999999999999999999&size=10`. | Mã không tồn tại hoặc không hợp lệ → `404`; `page`/`size` sai → `200` với `meta` hợp lệ (`page` ≥ 1, 1 ≤ `size` ≤ 100); **không bao giờ `500`**. | Trung bình | B1 2147483647 → `404 REQUEST_NOT_FOUND`; **2147483648 → `500` ở cả 10 endpoint** (log server `value "2147483648" is out of range for type integer`) → **BUG-03**.<br>B2 cả bốn → `404`.<br>B3 hex và thập phân vẫn truy cập được đúng tin (**OBS-04**).<br>B4 `page=0&size=0` → trang 1/size 10; `page=-3&size=-5` → trang 1/size 1; `size=101` → size 100; `page=abc&size=xyz` → mặc định; `page=999` → `200`, `data`=[]; **`page=9999999999999999999` → `500`** (log `value "100000000000000000000" is out of range for type bigint`) → **BUG-04**.<br>10/22 bước PASS, 11 FAIL, 1 quan sát. | **FAIL** (BUG-03, BUG-04) |
| **TC-28** [dữ liệu sai] mọi API nhận thân JSON | Bước bổ sung *(S-28-1…S-28-9)*. | B1: JSON hỏng; `Content-Type: text/plain`; thân `[]`; thân `null`.<br>B2: sai kiểu (email là object, mật khẩu/họ tên/SĐT là số, `role` là mảng; `requestId` là chuỗi).<br>B3: thân lớn hơn 100 KB.<br>B4: đường dẫn không có; `DELETE /api/requests/{id}`. | B1 `{"email":`; `email=a&password=b`; `[]`; `null`.<br>B2 `POST /api/auth/register` `{"email":{"a":1},"password":123456,"fullName":123,"phone":901234567,"role":["CUSTOMER"]}`; `POST /api/proposals` `{"requestId":"<id>","price":1000,"description":"x"}`.<br>B3 `POST /api/requests` với `description` 150.000 ký tự.<br>B4 `GET /api/khong-co-duong-dan`; `DELETE /api/requests/{id}`. | Lỗi dữ liệu → `400 VALIDATION_ERROR`; đường dẫn/phương thức không có → `404 NOT_FOUND` (theo api-contract §2.1.3); thân quá lớn → `413` hoặc `400`; không `500`; không stack trace. | Trung bình | B1 JSON hỏng `400 VALIDATION_ERROR` "Dữ liệu gửi lên không phải JSON hợp lệ"; `text/plain` `400`; `[]` `400`; `null` `400`.<br>B2 cả hai `400 VALIDATION_ERROR`.<br>**B3 `500 INTERNAL_ERROR`** (log server `PayloadTooLargeError: request entity too large`, `type: 'entity.too.large'`) → **BUG-05**.<br>B4 `404 NOT_FOUND`; tin sau `DELETE` vẫn còn.<br>Cả 15 phản hồi `500` của đợt kiểm tra chỉ có thông điệp chung "Lỗi hệ thống, vui lòng thử lại sau", **không lộ stack trace**.<br>8/9 bước PASS. | **FAIL** (BUG-05) |
| **TC-29** [bảo mật] OWASP A07 · BR02 | Bước bổ sung *(S-29-1…S-29-12)*: khách hàng, quản trị viên, `JWT_SECRET` của phiên chạy (dùng để ký token thử). | B1: 7 API cần đăng nhập, không header `Authorization`.<br>B2: kiểu `Basic`; `Bearer` rỗng.<br>B3: token giả; ký bằng khóa khác; hết hạn; `alg=none` tự xưng ADMIN; sửa payload `role`; `userId` không tồn tại.<br>B4: tài khoản vừa bị khóa dùng token cũ và đăng nhập; mở khóa dùng lại.<br>B5: 25 lần đăng nhập sai liên tiếp. | B1 `GET /api/auth/me`, `POST /api/auth/logout`, `GET /api/requests/my`, `GET /api/proposals/my`, `GET /api/notifications`, `GET /api/notifications/unread-count`, `GET /api/admin/users`.<br>B3 `abc.def.ghi`; `jwt.sign` bằng khóa khác; `expiresIn=-60`; token `alg:none`; payload sửa `role`=`ADMIN` giữ chữ ký cũ; `userId`=`99999999`.<br>B5 `{"email":<của khách>,"password":"sai<n>"}`. | B1–B3 `401 UNAUTHORIZED`; token `alg=none` không vào được API quản trị; B4 `403 ACCOUNT_LOCKED` ngay lập tức (BR02), mở khóa dùng lại được; B5 ghi nhận. | Cao | B1 7/7 `401`. B2 `401`. B3 6/6 `401` "Phiên đăng nhập không hợp lệ hoặc đã hết hạn".<br>B4 token cũ `403 ACCOUNT_LOCKED`, đăng nhập `403 ACCOUNT_LOCKED`; sau khi mở khóa token cũ `200`.<br>B5 25 lần sai → 25 × `401`, không bị khóa hay chặn; đăng nhập đúng sau đó `200` — **OBS-01** (không giới hạn số lần thử; tiêu chí không yêu cầu).<br>Token còn dùng được sau đăng xuất xem **TC-03 B3 / DEV-01**.<br>11/11 bước có kết luận PASS. | **PASS** (OBS-01) |
| **TC-30** [bảo mật] OWASP A01 · BR01 · NFR2 | Bước bổ sung *(S-30-1, S-30-2)*: 6 danh tính — chưa đăng nhập, khách chủ tin, khách khác, kỹ thuật viên đã gửi đề xuất, kỹ thuật viên khác, quản trị viên. | B1: gọi 22 endpoint (`/api/requests`, `/api/proposals`, `/api/reviews`, `/api/notifications`, `/api/admin`) với 88 cặp endpoint × danh tính; danh tính bị từ chối kiểm đúng mã, danh tính được phép kiểm không bị `401`/`403`.<br>B2: đọc lại tin sau khi người không có quyền thử đóng/sửa/hoàn thành. | Ví dụ: `PATCH /api/requests/{id}/close` bởi khách khác, kỹ thuật viên, quản trị viên; `PATCH /api/admin/users/{id}/lock` bởi khách hàng, kỹ thuật viên; `GET /api/proposals/{id}` bởi khách khác, kỹ thuật viên khác. | Chưa đăng nhập `401`; sai vai trò `403 FORBIDDEN`; không phải chủ sở hữu `403 NOT_OWNER`; đúng vai trò không bị chặn; tin không bị thay đổi bởi lần gọi bị từ chối. | Cao | B1 **88/88 ô đúng**.<br>B2 tin vẫn `WAITING_PROPOSAL`, tiêu đề không đổi.<br>2/2 bước PASS. | **PASS** |
| **TC-31** [bảo mật] OWASP A01, A03 · BR03, BR09, BR11 | Bước bổ sung *(S-31-1…S-31-10)*: khách hàng A và B, kỹ thuật viên A và B, quản trị viên. | B1: `POST /api/requests` kèm `customerId`, `status`, `id`, `createdAt` giả.<br>B2: `PATCH /api/requests/{id}` kèm `status`, `customerId`, `selectedProposalId`.<br>B3: `POST /api/proposals` kèm `technicianId`, `status`.<br>B4: `PATCH /api/proposals/{id}` chỉ có `status`.<br>B5: `POST /api/reviews` kèm `fromUserId`, `toUserId`.<br>B6: đăng ký kèm `isLocked`, `ratingAvg`, `id`, `createdAt`.<br>B7: chuỗi SQL và ký tự đại diện trong `category`, `location`, `q`.<br>B8: tiêu đề `<script>`.<br>B9: CORS với Origin lạ. | B1 `{...tin mẫu,"customerId":<B>,"status":"COMPLETED","selectedProposalId":1,"id":999999,"createdAt":"2000-01-01T00:00:00Z"}`.<br>B2 `{"title":"Đã sửa hợp lệ","status":"COMPLETED","customerId":<B>,"selectedProposalId":1}`.<br>B3 `{"requestId":<id>,"price":1000,"description":"x","technicianId":<KTV khác>,"status":"ACCEPTED"}`.<br>B4 `{"status":"ACCEPTED"}`.<br>B7 `' OR '1'='1`, `'; DROP TABLE users; --`, `%`, `_`, `\`.<br>B9 `Origin: http://ke-tan-cong.example`. | Trường nhạy cảm bị bỏ qua (chủ sở hữu và trạng thái do hệ thống quyết định); không `500`; không rò dữ liệu; CORS chỉ cho phép địa chỉ frontend. | Cao | B1 `201`, `customerId`=người gọi, `status`=`WAITING_PROPOSAL`, `id` do hệ thống cấp, `createdAt` là thời điểm tạo.<br>B2 `200`, chỉ `title` đổi; `status`, `customerId`, `selectedProposalId` giữ nguyên.<br>B3 `201`, `technicianId`=người gọi, `status`=`PENDING`.<br>B4 `400`; đề xuất vẫn `PENDING`.<br>B5 `201`, `fromUserId`=người gọi, `toUserId`=kỹ thuật viên được chọn.<br>B6 `201`; không bị khóa, `ratingAvg`=null, `id` và `createdAt` do hệ thống cấp.<br>B7 mọi lần `200`, không `500`; chuỗi SQL không trả thêm dòng; bảng `users` còn nguyên (14 tài khoản sau đó); **OBS-03**: `%` và `_` trong `location` hoạt động như ký tự đại diện `ILIKE` (`location=%` trả 24/24 tin).<br>B8 lưu và trả nguyên văn, `Content-Type: application/json`; `frontend/src` không dùng `dangerouslySetInnerHTML` (grep) nên React thoát ký tự.<br>B9 `Access-Control-Allow-Origin` luôn là `http://localhost:5173`, không phải `*` hay Origin lạ.<br>9/9 bước có kết luận PASS. | **PASS** (OBS-03) |
| **TC-32** [tái lập] | Test tự động: `suachua_test`. Bước bổ sung *(S-32-1…S-32-8)*: CSDL `suachua_taplap` trống. | B1: `npm run migrate` trên CSDL trống.<br>B2: `npm run migrate` lần hai.<br>B3: liệt kê bảng.<br>B4: `npm run seed`.<br>B5: `npm run seed` lần hai.<br>B6, B7: `npm run seed:reset` hai lần, so số bản ghi.<br>B8: `NODE_ENV=production npm run seed:reset`.<br>B9: `tests/seed.test.js` (9 test). | Thư mục `migrations/` (2 tệp) và `seeds/` của dự án. | Migration chạy đúng một lần mỗi tệp; seed lần hai từ chối; `seed:reset` cho số bản ghi giống hệt nhau; từ chối chạy ở production; dữ liệu mẫu tuân thủ BR01–BR16. | Cao | B1 2 dòng "Đã chạy migration 001_khoi_tao_csdl.sql", "…002_trang_thai_de_xuat_da_rut.sql".<br>B2 0 dòng, mã thoát 0.<br>B3 6 bảng: `notification`, `proposal`, `repair_request`, `review`, `schema_migrations`, `users`.<br>B4 "Đã tạo 7 tài khoản, 7 tin, 9 đề xuất, 3 đánh giá" (+3 thông báo).<br>B5 mã thoát 1, nhắc dùng `seed:reset`, dữ liệu không đổi.<br>B6, B7 mỗi lần: users 7, tin 7, đề xuất 9, đánh giá 3, thông báo 3, id nhỏ nhất 1 — giống hệt lần seed đầu.<br>B8 mã thoát 1, từ chối ở production.<br>B9 9/9 test PASS (bất biến BR01, BR02, BR08, BR10, BR12–BR14, BR16 trên dữ liệu mẫu). | **PASS** |
| **TC-33** [luồng đúng] hành trình đầy đủ US01–US20 | Bước bổ sung *(S-33-0, S-33-0b, S-33-1)*: server thật, CSDL trống. | B0: `GET /api/health`, `GET /`.<br>B1–B15: đăng ký khách + 2 kỹ thuật viên → đăng nhập → đăng tin → KTV A thấy tin trong danh sách → KTV A xem chi tiết (chưa có SĐT) → A và B gửi đề xuất → khách thấy 2 đề xuất → khách chấp nhận đề xuất A → A thấy SĐT còn B thì không → A có thông báo → khách xác nhận hoàn thành → khách đánh giá A → A đánh giá khách → xem đánh giá của A → điểm trung bình A → đăng xuất. | Khách `0911222333`; tin "E2E - Sửa tủ lạnh"; đề xuất A 300000, B 400000; đánh giá 5 sao và 4 sao. | Mỗi bước đúng theo các tiêu chí chấp nhận tương ứng; hành trình hai chiều chạy thông suốt. | Cao | B0 `/api/health` `200`; `/` `200` "Backend đang hoạt động".<br>B1–B15 **15/15 bước đúng**: tin `WAITING_PROPOSAL` → đề xuất A `ACCEPTED` → tin `COMPLETED`; KTV A thấy `customer.phone`, KTV B thì không; thông báo `PROPOSAL_ACCEPTED` chứa tên tin; 2 đánh giá `201`; `ratingAvg` của KTV A = 5; đăng xuất `200`. | **PASS** |

**Ánh xạ test case → test tự động** (mỗi trong 104 test thuộc đúng một TC; đường dẫn `tests/`; dấu `\|` trong mẫu là ký tự `|` của biểu thức chính quy):

| TC | File | Mẫu `--test-name-pattern` | Số test | Ghi chú |
|---|---|---|---:|---|
| TC-01 | `auth.test.js` | `US01` | 4 | |
| TC-02 | `auth.test.js` | `US0[12]` | 3 (+4) | cần suite US01 chạy trước (TD-01) nên mẫu chạy 7 test |
| TC-03 | `auth.test.js` | `US03` | 5 | |
| TC-04 | `admin.test.js` | `US04` | 3 | |
| TC-05 | `admin.test.js` | `US05` | 4 | |
| TC-06 | `request.test.js` | `US06` | 4 | |
| TC-07 | `request.test.js` | `US0[67]` | 4 (+4) | cần suite US06 chạy trước (TD-01) nên mẫu chạy 8 test |
| TC-08 | `request.test.js` | `US08` | 3 | |
| TC-09 | `request-sprint3.test.js` | `US09` | 4 | |
| TC-10 | `request.test.js` | `US(06\|10)` | 2 (+5) | test 1 và 3 của suite US10 (test 2 thuộc TC-11); cần US06 chạy trước (TD-01) nên mẫu chạy 7 test |
| TC-11 | `request.test.js` | `lọc theo loại dịch vụ và khu vực` | 1 | test 2 của suite US10 |
| TC-12 | `request.test.js` | `US12` | 3 | |
| TC-13 | `proposal.test.js` | `US13` | 7 | |
| TC-14 | `proposal.test.js` | `US14` | 3 | |
| TC-15 | `proposal-sprint3.test.js` | `US15` | 4 | |
| TC-16 | `proposal.test.js` | `US16` | 7 | |
| TC-17 | `request.test.js` | `US17` | 3 | |
| TC-18 | `review.test.js` | `US18` | 4 | |
| TC-19 | `review.test.js` | `US19\|Xem đánh giá của một người dùng` | 5 | 3 test US19 + 2 test xem đánh giá |
| TC-20 | `notification.test.js` | `US20` | 5 | |
| TC-21 | `request-sprint3.test.js` | `US21` | 5 | |
| TC-22 | `proposal-sprint3.test.js` | `US22\|Đề xuất của tôi` | 8 | 6 test US22 + 2 test "Đề xuất của tôi" |
| TC-23 | `proposal-sprint3.test.js` | `US23` | 4 | |
| TC-32 | `seed.test.js` | `Seed -` | 9 | |
| **Tổng** | 9 file | | **104** | TC-24…TC-31, TC-33 không có test tự động (chỉ bước bổ sung) |

## 3. Truy vết TC FAIL → Bug, lệch có chủ đích và ghi nhận khác

**Lỗi (BUG)** — nguyên nhân lấy từ log của server thật (`node src/server.js` in lỗi gốc ra stderr). Không sửa mã trong đợt kiểm thử này; tất cả đang **Mở**.

| Bug | TC (bước) | Tái hiện | Thực tế (mong đợi) | Nguyên nhân | Mức độ | Trạng thái | Đề xuất khắc phục |
|---|---|---|---|---|---|---|---|
| BUG-01 — đăng ký với số điện thoại có nhiều dấu cách bị lỗi 500 | TC-24 (S-24-12, S-24-13) | `POST /api/auth/register`, `phone`=`"+0  9 0 1 2 3 4 5 6 7"` (10 chữ số, 21 ký tự) hoặc `"0 9 0 1 2 3 4 5 6 7 8 9"` (12 chữ số, 23 ký tự) | `500 INTERNAL_ERROR` (mong đợi `201` hoặc `400 VALIDATION_ERROR`) | `value too long for type character varying(20)` (mã PG 22001). Validator chỉ kiểm 9–15 chữ số sau khi bỏ khoảng trắng, `.`, `-` (`src/validators/auth.validator.js:26-29`) nhưng chuỗi thô đã `trim` được lưu vào cột `users.phone VARCHAR(20)` (`src/services/auth.service.js:27`, `migrations/001_khoi_tao_csdl.sql:9`) | Minor | Mở | Kiểm tra độ dài chuỗi thô ≤ 20 trong validator, hoặc lưu bản chuẩn hóa (chỉ chữ số và dấu `+`) |
| BUG-02 — giá đề xuất 0,04 gây lỗi 500 | TC-26 (S-26-3) | `POST /api/proposals`, `price`=`0.04` | `500 INTERNAL_ERROR` (mong đợi `201` hoặc `400`) | `new row for relation "proposal" violates check constraint "proposal_price_check"` (23514). Validator chỉ yêu cầu `price > 0` (`src/validators/proposal.validator.js:12`) nhưng cột `price DECIMAL(15,1)` làm tròn 0,04 thành 0,0 nên vi phạm `CHECK (price > 0)` (`migrations/001_khoi_tao_csdl.sql:34`) | Minor | Mở | Đặt giá tối thiểu 0,1 (hoặc số nguyên VND) trong validator, hoặc đổi kiểu cột; xử lý kèm OBS-05 |
| BUG-03 — mã định danh vượt `int4` gây lỗi 500 ở 10 endpoint | TC-27 (S-27-2…S-27-11) | Ví dụ `GET /api/requests/2147483648`; cũng `GET /api/proposals/{id}`, `PATCH /api/proposals/{id}/accept`, `GET /api/proposals/request/{id}`, `PATCH /api/admin/users/{id}/lock`, `PATCH /api/notifications/{id}/read`, `GET /api/reviews/user/{id}`, `PATCH /api/requests/{id}/close`, `requestId` trong thân `POST /api/proposals` và `POST /api/reviews` | `500 INTERNAL_ERROR` (mong đợi `404` `*_NOT_FOUND`); mã 2147483647 trả `404` đúng | `value "2147483648" is out of range for type integer` (22003). `docMaSo` chỉ kiểm `Number.isInteger(so) && so > 0` (`src/services/request.service.js:7-11`) rồi truyền thẳng vào `WHERE id = $1` trên cột `INT`; `admin.service.js:13-14`, `notification.service.js:29-30` và validator `proposal.validator.js:31`, `review.validator.js:5` lặp lại cách kiểm tra này | Minor | Mở | Giới hạn mã ≤ 2147483647 ở `docMaSo` và các chỗ tự kiểm; hoặc ánh xạ lỗi PG 22003 thành `404`/`400` trong `xuLyLoi` |
| BUG-04 — `page` quá lớn gây lỗi 500 | TC-27 (S-27-22) | `GET /api/requests/my?page=9999999999999999999&size=10` | `500 INTERNAL_ERROR` (mong đợi `200` danh sách rỗng hoặc `400`) | `value "100000000000000000000" is out of range for type bigint` (22003). `docThamSoPhanTrang` tính `viTriBatDau = (trang − 1) × kichThuoc` không giới hạn trên (`src/utils/response.js:10-17`) | Minor | Mở | Giới hạn `page` tối đa (ví dụ 10⁶), hoặc ánh xạ 22003 thành `400` |
| BUG-05 — thân yêu cầu lớn hơn 100 KB trả 500 thay vì 413 | TC-28 (S-28-7) | `POST /api/requests`, `description` 150.000 ký tự | `500 INTERNAL_ERROR` (mong đợi `413` hoặc `400`) | `PayloadTooLargeError: request entity too large` (`type: 'entity.too.large'`) do `express.json()` giới hạn mặc định 100 KB (`src/app.js:10`); `xuLyLoi` chỉ ánh xạ `entity.parse.failed`, mọi lỗi khác → 500 (`src/utils/error-handler.js:27-31`) | Minor | Mở | Thêm nhánh `loi.type === 'entity.too.large'` → `413` trong `xuLyLoi` |

Cả 5 lỗi cùng một họ: lỗi của CSDL (22001, 22003, 23514) hoặc của thư viện đọc thân yêu cầu không được ánh xạ sang mã 4xx. Một nhánh ánh xạ chung trong `xuLyLoi` (PG nhóm `22xxx`/`23514` → 400, `entity.too.large` → 413) sẽ chặn cả 5, nhưng sửa tại validator vẫn tốt hơn vì cho thông báo theo từng trường.

**Lệch có chủ đích so với tiêu chí chấp nhận (DEV)** — nhóm đã ghi nhận quyết định trong [project-notes.md](project-notes.md); TC vẫn ghi theo tiêu chí gốc.

| Mã | TC (bước) | Tiêu chí (backlog) | Hành vi thực tế | Căn cứ | Trạng thái |
|---|---|---|---|---|---|
| DEV-01 | TC-03 (B3, S-03-3) | US03: "Hệ thống kết thúc phiên" | Token cũ vẫn dùng được sau đăng xuất (`GET /api/auth/me` → `200`) cho đến khi hết hạn (mặc định 1 ngày, `JWT_EXPIRES_IN`); chỉ giao diện xóa token | `project-notes.md` mục "Đăng xuất (US03)": "JWT không lưu phiên ở server" | Chấp nhận (đã ghi nhận). Rủi ro: token bị lộ vẫn dùng được; muốn đúng tiêu chí cần danh sách thu hồi hoặc `tokenVersion` trong CSDL, hoặc sửa tiêu chí |
| DEV-02 | TC-15 (B3) | US15: "Chỉ chủ tin mới được xem" (người không phải chủ tin bị từ chối) | Kỹ thuật viên đã gửi đề xuất cũng xem được chi tiết đề xuất (`200`) | `project-notes.md` mục giao diện Sprint 3, "US15": chuông thông báo cần mở đề xuất để lấy mã tin | Chấp nhận (đã ghi nhận); nên sửa tiêu chí thành "chủ tin hoặc kỹ thuật viên đã gửi đề xuất" |
| DEV-03 | TC-23 (B1) | US23: "cập nhật trạng thái đề xuất thành DA_RUT" | API và CSDL dùng giá trị `WITHDRAWN` (`TRANG_THAI_DE_XUAT.DA_RUT` = `'WITHDRAWN'`, `src/utils/constants.js:18`); [api-contract.md](api-contract.md) chưa liệt kê tập trạng thái đề xuất | Chỉ lệch tên giá trị, cùng ngữ nghĩa nên TC vẫn PASS | Cập nhật tiêu chí và api-contract cho thống nhất |

**Ghi nhận khác** (không tính FAIL):

| Mã | Nội dung |
|---|---|
| OBS-01 (TC-29) | Không có giới hạn số lần đăng nhập sai: 25 lần liên tiếp đều `401`, sau đó đăng nhập đúng `200`. Tiêu chí không yêu cầu; rủi ro dò mật khẩu (OWASP A07). Đề xuất giới hạn tốc độ. |
| OBS-02 (TC-25) | `preferredTime` trong quá khứ (2020-01-01) được chấp nhận (`201`). Tiêu chí US06 không nói về trường hợp này. |
| OBS-03 (TC-31) | `%` và `_` trong bộ lọc `location` và `q` của quản trị viên hoạt động như ký tự đại diện `ILIKE` (`src/repositories/request.repository.js:48`, `src/repositories/user.repository.js:44`): `location=%` trả toàn bộ 24/24 tin. Chỉ ảnh hưởng độ chính xác bộ lọc, không lộ dữ liệu ngoài quyền. |
| OBS-04 (TC-27) | Mã dạng hex hoặc thập phân (`0x1`, `1.0`) được chấp nhận vì `Number()` (`src/services/request.service.js:8`); vẫn qua kiểm tra chủ sở hữu nên không vượt quyền. |
| OBS-05 (TC-26) | Giá lưu bị làm tròn thầm lặng 1 chữ số thập phân do cột `DECIMAL(15,1)`: `0.05` → `0.1`, `350000.55` → `350000.6`. |
| OBS-06 (tài liệu) | [api-contract.md](api-contract.md) §2.6 ghi `page` mặc định 0, mã dùng 1 (đã ghi trong `project-notes.md`); TC-27 xác nhận `page=0` được hiểu là trang 1. |
| UI-01 (TC-04 B2) | **Rà soát mã, chưa xác minh trên trình duyệt.** Tiêu chí US04: người dùng thường truy cập trang quản lý tài khoản thì "từ chối và hiển thị thông báo không có quyền". `TuyenDuocBaoVe` (`frontend/src/components/ProtectedRoute.jsx:6-19`) chuyển hướng im lặng về trang chính của vai trò và không hiển thị thông báo nào; API vẫn trả `403 FORBIDDEN` đúng. Dự kiến Minor — cần mở trình duyệt đăng nhập bằng tài khoản khách hàng rồi vào `#/admin/users` để xác nhận. |
| TD-01 (chất lượng bộ test) | Ba suite phụ thuộc dữ liệu do suite đứng trước tạo ra nên chạy riêng thì lỗi: `US02` test 1 đăng nhập bằng `minh.anh@example.com` đăng ký ở `US01` (`401` thay vì `200`); `US07` test 1 cần tin do `US06` tạo; `US10` test 1 cần tin Chờ đề xuất do các test trước tạo (`assert.ok(length > 0)` sai). Chạy cả file (`auth.test.js` 12/12, `request.test.js` 20/20) hoặc kèm suite tiền đề (`US0[12]` 7/7, `US0[67]` 8/8, `US(06\|10)` 7/7) thì PASS. Không phải lỗi sản phẩm; đề xuất mỗi test tự dựng dữ liệu (`taoTin`) trong `it`. |

## 4. Minh chứng (trích log và ảnh chụp của các lần chạy thật)

### 4.1. `npm test` — lần chạy 2 (2026-11-13 18:02)

```text
✔ Seed - chạy lại và chốt chặn (377.1878ms)
ℹ tests 104
ℹ suites 27
ℹ pass 104
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 5110.8354
```

Lần chạy 1 (reporter `spec` + `junit`): `tests 104 · suites 27 · pass 104 · fail 0 · duration_ms 4955.7151`, mã thoát 0.

### 4.2. Bước bổ sung trên server thật — lần chạy 4 (2026-11-13 18:14)

Tổng kết: 129 bước = 109 PASS + 16 FAIL + 4 quan sát (`S-25-12`, `S-27-16`, `S-29-12`, `S-31-8`); 15 phản hồi HTTP 500, **0** phản hồi lộ stack trace; lần chạy 5 giống hệt từng bước. Nguyên văn 16 dòng `FAIL` trong log của lần chạy 4:

```text
FAIL     S-03-3     TC-03 B3 | Dùng lại token cũ gọi GET /api/auth/me SAU khi đăng xuất | thực tế: 200 (vẫn trả thông tin người dùng) | DEV-01: JWT không lưu phiên phía server (project-notes.md) — token còn hiệu lực đến khi hết hạn
FAIL     S-24-12    TC-24 B | SĐT 10 chữ số, chuỗi 21 ký tự (vượt cột VARCHAR(20) 1 ký tự) | thực tế: 500 INTERNAL_ERROR "Lỗi hệ thống, vui lòng thử lại sau"
FAIL     S-24-13    TC-24 B | SĐT 12 chữ số cách bằng dấu cách, chuỗi 23 ký tự | thực tế: 500 INTERNAL_ERROR "Lỗi hệ thống, vui lòng thử lại sau"
FAIL     S-26-3     TC-26 B | price = 0.04 (cột DECIMAL(15,1), làm tròn thành 0.0) | thực tế: 500 INTERNAL_ERROR "Lỗi hệ thống, vui lòng thử lại sau"
FAIL     S-27-2     TC-27 B | GET /api/requests/2147483648 (vượt int4) | thực tế: 500 INTERNAL_ERROR "Lỗi hệ thống, vui lòng thử lại sau"
FAIL     S-27-3     TC-27 B | GET /api/proposals/2147483648 | thực tế: 500 INTERNAL_ERROR "Lỗi hệ thống, vui lòng thử lại sau"
FAIL     S-27-4     TC-27 B | PATCH /api/proposals/2147483648/accept | thực tế: 500 INTERNAL_ERROR "Lỗi hệ thống, vui lòng thử lại sau"
FAIL     S-27-5     TC-27 B | GET /api/proposals/request/2147483648 | thực tế: 500 INTERNAL_ERROR "Lỗi hệ thống, vui lòng thử lại sau"
FAIL     S-27-6     TC-27 B | PATCH /api/admin/users/2147483648/lock | thực tế: 500 INTERNAL_ERROR "Lỗi hệ thống, vui lòng thử lại sau"
FAIL     S-27-7     TC-27 B | PATCH /api/notifications/2147483648/read | thực tế: 500 INTERNAL_ERROR "Lỗi hệ thống, vui lòng thử lại sau"
FAIL     S-27-8     TC-27 B | GET /api/reviews/user/2147483648 | thực tế: 500 INTERNAL_ERROR "Lỗi hệ thống, vui lòng thử lại sau"
FAIL     S-27-9     TC-27 B | PATCH /api/requests/2147483648/close | thực tế: 500 INTERNAL_ERROR "Lỗi hệ thống, vui lòng thử lại sau"
FAIL     S-27-10    TC-27 B | POST /api/proposals với requestId=2147483648 | thực tế: 500 INTERNAL_ERROR "Lỗi hệ thống, vui lòng thử lại sau"
FAIL     S-27-11    TC-27 B | POST /api/reviews với requestId=2147483648 | thực tế: 500 INTERNAL_ERROR "Lỗi hệ thống, vui lòng thử lại sau"
FAIL     S-27-22    TC-27 B | page=9999999999999999999 (vượt bigint) | thực tế: 500 INTERNAL_ERROR "Lỗi hệ thống, vui lòng thử lại sau"
FAIL     S-28-7     TC-28 B | Thân yêu cầu lớn hơn 100 KB (description 150.000 ký tự) | thực tế: 500 INTERNAL_ERROR "Lỗi hệ thống, vui lòng thử lại sau"
```

Lỗi gốc ở log của server (`stderr`, lần chạy 5) — thống kê theo thông điệp:

```text
     10 error: value "2147483648" is out of range for type integer
      2 error: value too long for type character varying(20)
      1 error: value "100000000000000000000" is out of range for type bigint
      1 error: new row for relation "proposal" violates check constraint "proposal_price_check"
      1 PayloadTooLargeError: request entity too large
```

Một số dòng `PASS` tiêu biểu của các bước tái lập, phân quyền và hành trình (nguyên văn, chọn 5 trong 109 dòng):

```text
PASS     S-32-1     TC-32 B1 | npm run migrate trên CSDL trống | thực tế: 2 dòng: > cdtn2-nhom03@1.0.0 migrate | > node src/migrate.js |  | Đã chạy migration 001_khoi_tao_csdl.sql | Đã chạy migration 002_trang_thai_de_xuat_da_rut.sql
PASS     S-32-2     TC-32 B2 | npm run migrate lần hai | thực tế: 0 dòng, mã thoát 0
PASS     S-32-6     TC-32 B6 | npm run seed:reset lần 1 | thực tế: users=7, tin=7, đề xuất=9, đánh giá=3, thông báo=3, id nhỏ nhất=1
PASS     S-30-1     TC-30 B1 | Ma trận phân quyền: 22 endpoint × danh tính (chưa đăng nhập, khách chủ tin, khách khác, KTV, KTV khác, quản trị viên) | thực tế: 88/88 ô đúng
PASS     S-33-1     TC-33 B1-B15 | Hành trình đầy đủ trên server thật: đăng nhập → đăng tin → KTV tìm & xem → 2 KTV gửi đề xuất → khách chọn → thông báo → hoàn thành → đánh giá hai chiều → xem đánh giá → đăng xuất | thực tế: 15/15 bước đúng
```

### 4.3. Build giao diện (2026-11-13 18:10)

```text
> vite build
vite v8.3.5 building client environment for production...
✓ 112 modules transformed.
dist/index.html                   0.47 kB │ gzip:   0.32 kB
dist/assets/index-DAMyJEFh.css   13.17 kB │ gzip:   3.48 kB
dist/assets/index-DvzDd4Ae.js   345.51 kB │ gzip: 104.56 kB
✓ built in 99ms
```

Việc build thành công chỉ chứng tỏ giao diện biên dịch được; không chứng tỏ hành vi trên trình duyệt.

### 4.4. Chạy riêng từng suite (lần chạy 6) — cơ sở của TD-01

```text
auth.test.js               US01 - Đăng ký                                    tests=4   pass=4   fail=0
auth.test.js               US02 - Đăng nhập                                  tests=3   pass=2   fail=1   ← TD-01
auth.test.js               US03 - Đăng xuất và /me                           tests=5   pass=5   fail=0
admin.test.js              US04 - Xem danh sách tài khoản                    tests=3   pass=3   fail=0
admin.test.js              US05 - Khóa / mở khóa tài khoản                   tests=4   pass=4   fail=0
request.test.js            US06 - Đăng tin sửa chữa                          tests=4   pass=4   fail=0
request.test.js            US07 - Danh sách tin của tôi                      tests=4   pass=3   fail=1   ← TD-01
request.test.js            US08 - Chi tiết tin của mình                      tests=3   pass=3   fail=0
request.test.js            US10 - Kỹ thuật viên xem danh sách tin            tests=3   pass=2   fail=1   ← TD-01
request.test.js            US12 - Kỹ thuật viên xem chi tiết tin             tests=3   pass=3   fail=0
request.test.js            US17 - Xác nhận hoàn thành                        tests=3   pass=3   fail=0
request-sprint3.test.js    US09 - Đóng tin sửa chữa                          tests=4   pass=4   fail=0
request-sprint3.test.js    US21 - Sửa tin sửa chữa                           tests=5   pass=5   fail=0
proposal.test.js           US13 - Gửi đề xuất                                tests=7   pass=7   fail=0
proposal.test.js           US14 - Xem đề xuất đã nhận                        tests=3   pass=3   fail=0
proposal.test.js           US16 - Chọn kỹ thuật viên                         tests=7   pass=7   fail=0
proposal-sprint3.test.js   US15 - Xem chi tiết đề xuất                       tests=4   pass=4   fail=0
proposal-sprint3.test.js   Đề xuất của tôi                                   tests=2   pass=2   fail=0
proposal-sprint3.test.js   US22 - Sửa đề xuất                                tests=6   pass=6   fail=0
proposal-sprint3.test.js   US23 - Rút đề xuất                                tests=4   pass=4   fail=0
review.test.js             US18 - Khách hàng đánh giá kỹ thuật viên          tests=4   pass=4   fail=0
review.test.js             US19 - Kỹ thuật viên đánh giá khách hàng          tests=3   pass=3   fail=0
review.test.js             Xem đánh giá của một người dùng                   tests=2   pass=2   fail=0
notification.test.js       US20 - Thông báo khi đề xuất được chấp nhận       tests=5   pass=5   fail=0
seed.test.js               Seed - tài khoản demo                             tests=2   pass=2   fail=0
seed.test.js               Seed - quy tắc nghiệp vụ của dữ liệu mẫu          tests=5   pass=5   fail=0
seed.test.js               Seed - chạy lại và chốt chặn                      tests=2   pass=2   fail=0
```

Ảnh chụp cửa sổ terminal của từng test case và của cả bộ nằm ở mục 4.5.

### 4.5. Ảnh chụp cửa sổ terminal từng test case (lần chạy 7) và ảnh tổng kết (lần chạy 8)

Thư mục [screenshots/](screenshots/) có **35 ảnh PNG**: 33 ảnh test case (`TC-xx-pass.png` hoặc `TC-xx-fail.png`, đúng kết luận ở §2) và 2 ảnh tổng kết (`npm-test-pass.png`, `bo-sung-tong-ket.png`). Đây là ảnh chụp thật, không qua chỉnh sửa.

**Cách chụp và giới hạn:**
- Mỗi test case chạy trong một cửa sổ terminal riêng; chính cửa sổ đó được chụp tự động ngay khi lệnh chạy xong (chỉ chụp cửa sổ chạy lệnh, không chụp toàn màn hình) rồi đóng lại. Việc chạy do một runner tạm theo từng TC thực hiện trên bản sao kiểm thử của dự án; **runner không nằm trong repo**.
- Mỗi ảnh gồm: tiêu đề cửa sổ (mã TC, loại, user story); banner (thời điểm, phiên bản `cdtn2-nhom03-main.zip` kèm SHA-256, Node, PostgreSQL); dòng `Lệnh:` rồi **output thật** của đúng lệnh đó; cuối cùng là dòng `KẾT LUẬN` tính từ mã thoát của lệnh, số liệu hiển thị trên màn hình và bản ghi của các bước bổ sung (không điền tay; riêng TC-15 xem bên dưới).
- Test tự động: lệnh trong ảnh là `node --test --test-concurrency=1 --test-name-pattern="<mẫu>" tests/<file>.test.js`, giống hệt bảng ánh xạ ở §2 nên chạy lại được ngay trong repo. TC-02, TC-07, TC-10 chạy kèm suite tiền đề vì TD-01 (có ghi chú trong banner).
- Bước bổ sung `S-xx`: runner chạy toàn bộ kịch bản bổ sung trên CSDL mới + server thật rồi chỉ in các bước của TC đó (mỗi bước hai dòng: mong đợi và thực tế). Cần script bổ sung, chưa có trong repo.
- Ảnh `-fail` hiện bước lệch bằng chữ đỏ. **TC-15** có thêm hai dòng màu tím "Đối chiếu tiêu chí (báo cáo §3, DEV-02 — đây KHÔNG phải output của test)": test tự động của TC-15 PASS (hệ thống cho phép `200`), kết luận FAIL là do đối chiếu với tiêu chí chấp nhận.
- `npm-test-pass.png` chỉ hiện phần cuối của output (cửa sổ cuộn) nhưng có đủ dòng tổng kết `tests 104 · suites 27 · pass 104 · fail 0`.
- TC-32 được chụp lại một lần (19:13) sau khi đổi dòng hiển thị của bước S-32-8 để hiện đủ thông điệp từ chối ở `production`; kết quả không đổi.
- Ảnh chụp trên bản sao ở thư mục tạm nên không hiện đường dẫn thư mục dự án; phiên bản được xác định bằng SHA-256 trong banner.
- Đây là ảnh **terminal**, không phải ảnh giao diện web; các mệnh đề giao diện vẫn chỉ được rà soát mã (§5).

| TC | Kết luận | Ảnh | Giờ chụp | Test tự động | Bước bổ sung |
|---|---|---|---|---|---|
| TC-01 | PASS | [TC-01-pass.png](screenshots/TC-01-pass.png) | 19:07:31 | 4/4 pass | 2 PASS |
| TC-02 | PASS | [TC-02-pass.png](screenshots/TC-02-pass.png) | 19:07:44 | 7/7 pass | — |
| TC-03 | FAIL | [TC-03-fail.png](screenshots/TC-03-fail.png) | 19:07:47 | 5/5 pass | 1 PASS · 1 FAIL (S-03-3) |
| TC-04 | PASS | [TC-04-pass.png](screenshots/TC-04-pass.png) | 19:08:00 | 3/3 pass | 2 PASS |
| TC-05 | PASS | [TC-05-pass.png](screenshots/TC-05-pass.png) | 19:08:12 | 4/4 pass | — |
| TC-06 | PASS | [TC-06-pass.png](screenshots/TC-06-pass.png) | 19:08:14 | 4/4 pass | 1 PASS |
| TC-07 | PASS | [TC-07-pass.png](screenshots/TC-07-pass.png) | 19:08:28 | 8/8 pass | 2 PASS |
| TC-08 | PASS | [TC-08-pass.png](screenshots/TC-08-pass.png) | 19:08:41 | 3/3 pass | 1 PASS |
| TC-09 | PASS | [TC-09-pass.png](screenshots/TC-09-pass.png) | 19:08:54 | 4/4 pass | — |
| TC-10 | PASS | [TC-10-pass.png](screenshots/TC-10-pass.png) | 19:08:56 | 7/7 pass | 2 PASS |
| TC-11 | PASS | [TC-11-pass.png](screenshots/TC-11-pass.png) | 19:09:09 | 1/1 pass | 3 PASS |
| TC-12 | PASS | [TC-12-pass.png](screenshots/TC-12-pass.png) | 19:09:22 | 3/3 pass | — |
| TC-13 | PASS | [TC-13-pass.png](screenshots/TC-13-pass.png) | 19:09:25 | 7/7 pass | — |
| TC-14 | PASS | [TC-14-pass.png](screenshots/TC-14-pass.png) | 19:09:27 | 3/3 pass | — |
| TC-15 | FAIL (đối chiếu tiêu chí, DEV-02) | [TC-15-fail.png](screenshots/TC-15-fail.png) | 19:09:30 | 4/4 pass | — |
| TC-16 | PASS | [TC-16-pass.png](screenshots/TC-16-pass.png) | 19:09:32 | 7/7 pass | — |
| TC-17 | PASS | [TC-17-pass.png](screenshots/TC-17-pass.png) | 19:09:35 | 3/3 pass | — |
| TC-18 | PASS | [TC-18-pass.png](screenshots/TC-18-pass.png) | 19:09:37 | 4/4 pass | 1 PASS |
| TC-19 | PASS | [TC-19-pass.png](screenshots/TC-19-pass.png) | 19:09:50 | 5/5 pass | — |
| TC-20 | PASS | [TC-20-pass.png](screenshots/TC-20-pass.png) | 19:09:53 | 5/5 pass | — |
| TC-21 | PASS | [TC-21-pass.png](screenshots/TC-21-pass.png) | 19:09:55 | 5/5 pass | — |
| TC-22 | PASS | [TC-22-pass.png](screenshots/TC-22-pass.png) | 19:09:57 | 8/8 pass | — |
| TC-23 | PASS | [TC-23-pass.png](screenshots/TC-23-pass.png) | 19:10:00 | 4/4 pass | — |
| TC-24 | FAIL | [TC-24-fail.png](screenshots/TC-24-fail.png) | 19:10:02 | — | 11 PASS · 2 FAIL (S-24-12, S-24-13) |
| TC-25 | PASS | [TC-25-pass.png](screenshots/TC-25-pass.png) | 19:10:14 | — | 12 PASS · 1 quan sát |
| TC-26 | FAIL | [TC-26-fail.png](screenshots/TC-26-fail.png) | 19:10:26 | — | 20 PASS · 1 FAIL (S-26-3) |
| TC-27 | FAIL | [TC-27-fail.png](screenshots/TC-27-fail.png) | 19:10:38 | — | 10 PASS · 11 FAIL (S-27-2…S-27-11, S-27-22) · 1 quan sát |
| TC-28 | FAIL | [TC-28-fail.png](screenshots/TC-28-fail.png) | 19:10:50 | — | 8 PASS · 1 FAIL (S-28-7) |
| TC-29 | PASS | [TC-29-pass.png](screenshots/TC-29-pass.png) | 19:11:03 | — | 11 PASS · 1 quan sát |
| TC-30 | PASS | [TC-30-pass.png](screenshots/TC-30-pass.png) | 19:11:14 | — | 2 PASS |
| TC-31 | PASS | [TC-31-pass.png](screenshots/TC-31-pass.png) | 19:11:26 | — | 9 PASS · 1 quan sát |
| TC-32 | PASS | [TC-32-pass.png](screenshots/TC-32-pass.png) | 19:13:14 | 9/9 pass | 8 PASS |
| TC-33 | PASS | [TC-33-pass.png](screenshots/TC-33-pass.png) | 19:11:52 | — | 3 PASS |

**Ảnh từng test case** (lần chạy 7):

**TC-01**

![TC-01](screenshots/TC-01-pass.png)

**TC-02**

![TC-02](screenshots/TC-02-pass.png)

**TC-03**

![TC-03](screenshots/TC-03-fail.png)

**TC-04**

![TC-04](screenshots/TC-04-pass.png)

**TC-05**

![TC-05](screenshots/TC-05-pass.png)

**TC-06**

![TC-06](screenshots/TC-06-pass.png)

**TC-07**

![TC-07](screenshots/TC-07-pass.png)

**TC-08**

![TC-08](screenshots/TC-08-pass.png)

**TC-09**

![TC-09](screenshots/TC-09-pass.png)

**TC-10**

![TC-10](screenshots/TC-10-pass.png)

**TC-11**

![TC-11](screenshots/TC-11-pass.png)

**TC-12**

![TC-12](screenshots/TC-12-pass.png)

**TC-13**

![TC-13](screenshots/TC-13-pass.png)

**TC-14**

![TC-14](screenshots/TC-14-pass.png)

**TC-15**

![TC-15](screenshots/TC-15-fail.png)

**TC-16**

![TC-16](screenshots/TC-16-pass.png)

**TC-17**

![TC-17](screenshots/TC-17-pass.png)

**TC-18**

![TC-18](screenshots/TC-18-pass.png)

**TC-19**

![TC-19](screenshots/TC-19-pass.png)

**TC-20**

![TC-20](screenshots/TC-20-pass.png)

**TC-21**

![TC-21](screenshots/TC-21-pass.png)

**TC-22**

![TC-22](screenshots/TC-22-pass.png)

**TC-23**

![TC-23](screenshots/TC-23-pass.png)

**TC-24**

![TC-24](screenshots/TC-24-fail.png)

**TC-25**

![TC-25](screenshots/TC-25-pass.png)

**TC-26**

![TC-26](screenshots/TC-26-fail.png)

**TC-27**

![TC-27](screenshots/TC-27-fail.png)

**TC-28**

![TC-28](screenshots/TC-28-fail.png)

**TC-29**

![TC-29](screenshots/TC-29-pass.png)

**TC-30**

![TC-30](screenshots/TC-30-pass.png)

**TC-31**

![TC-31](screenshots/TC-31-pass.png)

**TC-32**

![TC-32](screenshots/TC-32-pass.png)

**TC-33**

![TC-33](screenshots/TC-33-pass.png)

**Cả bộ bằng một lệnh `npm test` — 104/104 PASS** (lần chạy 8)

![npm test](screenshots/npm-test-pass.png)

**Tổng kết 129 bước bổ sung trên server thật — 109 PASS, 16 FAIL, 4 quan sát** (lần chạy 8)

![Tổng kết bước bổ sung](screenshots/bo-sung-tong-ket.png)

## 5. Ma trận phủ tiêu chí chấp nhận (23 user story, 53 kịch bản)

Mỗi dòng là một kịch bản Given/When/Then trong `ProductBacklog_Nhom03.xlsx` (S1, S2… theo thứ tự trong user story). Cột "Bằng chứng API" cho biết test tự động (`file › suite › tên test`) hoặc bước bổ sung `S-xx` đã chạy; cột cuối là **rà soát mã giao diện, chưa chạy trên trình duyệt**.

| Kịch bản | TC · bước | Bằng chứng API (đã chạy) | Kết quả API | Giao diện (rà soát mã — chưa chạy) |
|---|---|---|---|---|
| US01-S1 Đăng ký thành công | TC-01 B1 | `auth.test.js › US01 › đăng ký thành công, trả token và không lộ mật khẩu`; S-01-0 | PASS | Khớp: `RegisterPage.jsx:21-27`, `LoginPage.jsx:49` |
| US01-S2 Thiếu thông tin | TC-01 B2 | `auth.test.js › US01 › thiếu thông tin bắt buộc trả VALIDATION_ERROR kèm chi tiết từng trường` | PASS | Khớp: `RegisterPage.jsx:29-31` |
| US01-S3 Email đã tồn tại | TC-01 B3, B5 | `auth.test.js › US01 › email đã tồn tại (không phân biệt hoa thường)…`; S-01-4 | PASS | Khớp: `RegisterPage.jsx:31` |
| US02-S1 Đăng nhập thành công | TC-02 B1 | `auth.test.js › US02 › đăng nhập đúng trả token và thông tin người dùng có vai trò` | PASS | Khớp: `LoginPage.jsx:34-36`, `screenRoutes.js:32` |
| US02-S2 Sai thông tin | TC-02 B2 | `auth.test.js › US02 › sai mật khẩu hoặc email trả 401 với cùng một thông báo` | PASS | Khớp: `LoginPage.jsx:37-40,50` |
| US02-S3 Tài khoản bị khóa | TC-02 B3 | `auth.test.js › US02 › tài khoản bị khóa không đăng nhập được (BR02)` | PASS | Khớp: `LoginPage.jsx:37-40,50` |
| US03-S1 Đăng xuất thành công | TC-03 B1–B3 | `auth.test.js › US03 › đăng xuất thành công khi có token`, `đăng xuất cần đăng nhập`; S-03-1; S-03-3 | **FAIL (DEV-01)**: API `200` nhưng token cũ còn dùng được | Khớp: `AppLayout.jsx:14-22` |
| US04-S1 Xem danh sách thành công | TC-04 B1, B3, B4 | `admin.test.js › US04 › liệt kê khách hàng và kỹ thuật viên, không gồm quản trị viên, kèm thống kê`, `lọc theo từ khóa, vai trò và trạng thái`; S-04-1 | PASS | Khớp: `UserTable.jsx:8-11`, `UserManagementPage.jsx:79-85` |
| US04-S2 Người dùng thường không được truy cập | TC-04 B2 | `admin.test.js › US04 › khách hàng và kỹ thuật viên không truy cập được (BR01)` | PASS | **Lệch (UI-01)**: `ProtectedRoute.jsx:6-19` chuyển hướng im lặng, không có thông báo |
| US05-S1 Khóa tài khoản | TC-05 B1 | `admin.test.js › US05 › khóa thì người dùng không đăng nhập và không gọi API được; mở khóa thì dùng lại được` (phần khóa) | PASS | Khớp: `UserManagementPage.jsx:44-55` |
| US05-S2 Mở khóa tài khoản | TC-05 B2 | cùng test trên (phần mở khóa) | PASS | Khớp: `UserManagementPage.jsx:44-55` |
| US06-S1 Đăng tin thành công | TC-06 B1 | `request.test.js › US06 › khách hàng đăng tin thành công, trạng thái Chờ đề xuất` | PASS | Khớp: `RequestForm.jsx:113-114`, `MyRequestsPage.jsx:59` |
| US06-S2 Thiếu thông tin bắt buộc | TC-06 B2 | `request.test.js › US06 › thiếu thông tin bắt buộc thì không tạo tin (BR05)`; S-06-3 | PASS | Khớp: `RequestForm.jsx:117-119` |
| US07-S1 Xem danh sách thành công | TC-07 B1, B3 | `request.test.js › US07 › chỉ trả tin của chính khách hàng, kèm phân trang và số đề xuất (BR03)`, `phân trang theo page/size`; S-07-4 | PASS | Khớp: `MyRequestsPage.jsx:63-73` |
| US07-S2 Chưa có tin nào | TC-07 B2 | `request.test.js › US07 › khách hàng chưa có tin nhận danh sách rỗng`; S-07-3 | PASS | Khớp: `MyRequestsPage.jsx:62` |
| US08-S1 Xem chi tiết thành công | TC-08 B1 | `request.test.js › US08 › chủ tin xem đầy đủ, có cả số điện thoại của mình`; S-08-3 | PASS | Khớp: `RequestDetailPage.jsx` (khách) `:84-92` |
| US08-S2 Không được xem tin của người khác | TC-08 B2 | `request.test.js › US08 › khách hàng khác không xem được (BR03)` | PASS | Khớp: `RequestDetailPage.jsx` (khách) `:33-35,75` (hiện thông điệp lỗi của API) |
| US09-S1 Đóng tin thành công | TC-09 B1 | `request-sprint3.test.js › US09 › chủ tin đóng tin Chờ đề xuất; kỹ thuật viên không còn thấy và không gửi đề xuất được` | PASS | Khớp: `RequestDetailPage.jsx` (khách) `:55-73,87` |
| US09-S2 Không đóng được tin đã chọn kỹ thuật viên | TC-09 B2 | `request-sprint3.test.js › US09 › không đóng được tin đã chọn kỹ thuật viên (BR06)` | PASS | Khớp có điều kiện: nút "Đóng tin" bị ẩn khi không còn Chờ đề xuất (`RequestDetailPage.jsx` (khách) `:87`); thông báo của API hiện ở `:69,82` nếu trạng thái đổi giữa chừng |
| US10-S1 Xem danh sách thành công | TC-10 B1 | `request.test.js › US10 › chỉ liệt kê tin Chờ đề xuất (BR04)`; S-10-4 | PASS | Khớp: `RequestSearchPage.jsx:56-57` |
| US10-S2 Không có tin nào phù hợp | TC-10 B2 | S-10-3 (CSDL trống) | PASS | Khớp: `RequestSearchPage.jsx:54` |
| US11-S1 Lọc tin thành công | TC-11 B1 | `request.test.js › US10 › lọc theo loại dịch vụ và khu vực`; S-11-3; S-11-4 | PASS | Khớp: `RequestSearchPage.jsx:20,29,44-45` |
| US11-S2 Lọc không có kết quả | TC-11 B2 | S-11-5 | PASS | Khớp: `RequestSearchPage.jsx:54` |
| US12-S1 Xem chi tiết thành công | TC-12 B1 | `request.test.js › US12 › xem được thông tin nhưng không thấy số điện thoại khách (BR15)` | PASS | Khớp: `RequestDetailPage.jsx` (kỹ thuật viên) `:45-52,56` |
| US12-S2 Tin không còn nhận đề xuất | TC-12 B2 | `request.test.js › US12 › tin không còn Chờ đề xuất vẫn xem được nhưng không gửi đề xuất được (BR04)` | PASS | Khớp: `RequestDetailPage.jsx` (kỹ thuật viên) `:24-26` (nút "Gửi đề xuất" chỉ khi `canPropose`) |
| US13-S1 Gửi đề xuất thành công | TC-13 B1 | `proposal.test.js › US13 › gửi thành công, trạng thái PENDING` | PASS | Khớp: `ProposalCreatePage.jsx:22-26` |
| US13-S2 Đã có đề xuất | TC-13 B2, B4 | `proposal.test.js › US13 › gửi lần hai cho cùng tin trả 409 ALREADY_PROPOSED (BR08)`, `gửi song song hai lần thì chỉ một lần thành công (BR08)` | PASS | Khớp: `ProposalCreatePage.jsx:34` |
| US13-S3 Tin không còn nhận đề xuất | TC-13 B3 | `proposal.test.js › US13 › tin không còn Chờ đề xuất trả REQUEST_NOT_WAITING (BR07)` | PASS | Khớp: `ProposalCreatePage.jsx:34,39` |
| US14-S1 Xem danh sách đề xuất | TC-14 B1 | `proposal.test.js › US14 › chủ tin thấy danh sách đề xuất kèm tên kỹ thuật viên` | PASS | Khớp: `ProposalList.jsx:11-14` |
| US14-S2 Chưa có đề xuất nào | TC-14 B2 | `proposal.test.js › US14 › tin chưa có đề xuất trả danh sách rỗng` | PASS | Khớp: `ProposalList.jsx:8` |
| US15-S1 Xem chi tiết đề xuất | TC-15 B1 | `proposal-sprint3.test.js › US15 › chủ tin xem đầy đủ đề xuất kèm thông tin kỹ thuật viên` | PASS | Khớp: `ProposalReviewPage.jsx:51-66` |
| US15-S2 Chỉ chủ tin mới được xem | TC-15 B2, B3 | `proposal-sprint3.test.js › US15 › người không phải chủ tin bị từ chối (BR09)`, `kỹ thuật viên gửi đề xuất cũng xem được` | **Một phần**: người ngoài bị từ chối (PASS); kỹ thuật viên đã gửi đề xuất xem được (**DEV-02**) | Khớp: `ProposalReviewPage.jsx:47`; màn hình chỉ dành cho khách hàng |
| US16-S1 Chấp nhận đề xuất thành công | TC-16 B1, B3, B7 | `proposal.test.js › US16 › chấp nhận: đề xuất ACCEPTED, đề xuất khác REJECTED, tin SELECTED, tạo thông báo (BR10, BR12, BR16)`, `kỹ thuật viên được chọn thấy số điện thoại khách, người khác thì không (BR15)`, `luồng đầy đủ…` | PASS | Khớp: `RequestDetailPage.jsx` (khách) `:40-47`, `ProposalReviewPage.jsx:33-39` |
| US16-S2 Chỉ được chọn một kỹ thuật viên | TC-16 B2, B4 | `proposal.test.js › US16 › đã chọn rồi thì không chọn đề xuất khác được (BR10)`, `chấp nhận song song hai đề xuất thì chỉ một thành công` | PASS | Khớp: `RequestDetailPage.jsx` (khách) `:48-51`, `ProposalReviewPage.jsx:11-13,79` |
| US17-S1 Xác nhận hoàn thành thành công | TC-17 B1 | `request.test.js › US17 › chủ tin xác nhận khi tin Đã chọn kỹ thuật viên, lần hai bị từ chối` | PASS | Khớp: `RequestTrackingPage.jsx:28-40,62` |
| US17-S2 Không phải chủ tin | TC-17 B2 | `request.test.js › US17 › không phải chủ tin thì bị từ chối (BR11)` | PASS | Khớp: `RequestTrackingPage.jsx:36-38` (hiện lỗi API) |
| US17-S3 Tin chưa chọn kỹ thuật viên | TC-17 B3 | `request.test.js › US17 › tin còn Chờ đề xuất thì không xác nhận được (BR12)` | PASS | Khớp: nút chỉ hiện khi `SELECTED` (`RequestTrackingPage.jsx:62`); lỗi API hiện `:36-38` |
| US18-S1 Đánh giá thành công | TC-18 B1 | `review.test.js › US18 › đánh giá thành công, người nhận là kỹ thuật viên được chọn, cập nhật điểm trung bình` | PASS | Khớp: `ReviewForm.jsx:67` |
| US18-S2 Chưa hoàn thành | TC-18 B2 | `review.test.js › US18 › chưa hoàn thành thì không đánh giá được (BR13)` | PASS | Khớp: `ReviewForm.jsx:23` |
| US18-S3 Chỉ được đánh giá một lần | TC-18 B3, B5 | `review.test.js › US18 › chỉ được đánh giá một lần (BR14)`; S-18-4 | PASS | Khớp: `ReviewForm.jsx:24` |
| US19-S1 Đánh giá thành công | TC-19 B1 | `review.test.js › US19 › kỹ thuật viên được chọn đánh giá khách hàng` | PASS | Khớp: `ReviewForm.jsx:67` (dùng chung) |
| US19-S2 Chưa hoàn thành hoặc không phải người thực hiện | TC-19 B2, B3 | `review.test.js › US19 › kỹ thuật viên không được chọn hoặc người ngoài bị từ chối (BR13)`, `chưa hoàn thành thì kỹ thuật viên cũng không đánh giá được` | PASS | Khớp: `ReviewForm.jsx:22-24` (dùng chung) |
| US20-S1 Nhận thông báo khi được chọn | TC-20 B1 | `notification.test.js › US20 › kỹ thuật viên nhận thông báo có tên tin, mới nhất trước, đếm chưa đọc`; `proposal.test.js › US16 › chấp nhận…` (có hàng `notification`) | PASS | Khớp: `NotificationBell.jsx:64-69` |
| US20-S2 Xem danh sách thông báo | TC-20 B2 | `notification.test.js › US20 › kỹ thuật viên nhận thông báo có tên tin, mới nhất trước, đếm chưa đọc` (thứ tự), `đánh dấu đã đọc làm giảm số chưa đọc` | PASS | Khớp: `NotificationBell.jsx:59-70` |
| US21-S1 Chỉnh sửa thành công | TC-21 B1 | `request-sprint3.test.js › US21 › chủ tin sửa một phần thông tin khi tin còn Chờ đề xuất` | PASS | Khớp: `RequestForm.jsx:109-110` |
| US21-S2 Chỉnh sửa không hợp lệ | TC-21 B2, B4 | `request-sprint3.test.js › US21 › dữ liệu không hợp lệ thì báo lỗi và không cập nhật`, `không gửi trường nào thì báo lỗi`; S-25-13 | PASS | Khớp: `RequestForm.jsx:117-119` |
| US21-S3 Không thể chỉnh sửa | TC-21 B3 | `request-sprint3.test.js › US21 › tin đã chọn kỹ thuật viên hoặc đã đóng thì không sửa được` | PASS | Khớp: `RequestEditPage.jsx:20-23` |
| US22-S1 Chỉnh sửa đề xuất thành công | TC-22 B1 | `proposal-sprint3.test.js › US22 › sửa thành công khi đề xuất còn chờ xem xét` | PASS | Khớp: `ProposalEditPage.jsx:29-36` |
| US22-S2 Chỉnh sửa không hợp lệ | TC-22 B2 | `proposal-sprint3.test.js › US22 › dữ liệu không hợp lệ thì không cập nhật` | PASS | Khớp: `ProposalForm.jsx:27-29` |
| US22-S3 Không thể chỉnh sửa đề xuất | TC-22 B3 | `proposal-sprint3.test.js › US22 › đề xuất đã được chấp nhận thì không sửa được`, `đề xuất đã rút hoặc bị từ chối thì PROPOSAL_NOT_EDITABLE`, `tin đã đóng thì không sửa được đề xuất` | PASS | Khớp: `ProposalEditPage.jsx:11-17,43-45` |
| US23-S1 Rút đề xuất thành công | TC-23 B1, B4 | `proposal-sprint3.test.js › US23 › rút thành công; khách hàng thấy trạng thái đã rút và không chấp nhận được`, `sau khi rút có thể gửi đề xuất mới cho cùng tin (BR08)` | PASS (**DEV-03**: `WITHDRAWN` thay cho `DA_RUT`) | Khớp: `MyProposalsPage.jsx:74,81` |
| US23-S2 Không thể rút đề xuất đã chấp nhận | TC-23 B2 | `proposal-sprint3.test.js › US23 › không rút được đề xuất đã chấp nhận` | PASS | Khớp: nút "Rút đề xuất" chỉ hiện khi `PENDING` (`MyProposalsPage.jsx:112`) |
| US23-S3 Rút đề xuất không hợp lệ | TC-23 B3 | `proposal-sprint3.test.js › US23 › rút lần hai báo trạng thái hiện tại` | PASS | Khớp: `MyProposalsPage.jsx:22` (ghi chú trạng thái đã rút), `:82-84` (lỗi API) |

## 6. Đối chiếu tiêu chí thành công của kế hoạch

| # | Tiêu chí ([test-plan.md](test-plan.md) §3) | Kết quả | Kết luận |
|---|---|---|---|
| 1 | Phủ 23/23 US, 53/53 kịch bản có bằng chứng API; phần giao diện ghi rõ chưa chạy | 23/23 US có TC; 53/53 kịch bản có bước TC và bằng chứng API đã chạy (§5): 51 PASS, 1 FAIL (US03-S1, DEV-01), 1 một phần (US15-S2, DEV-02). Giao diện: rà soát mã 51 khớp, 1 khớp có điều kiện (US09-S2), 1 lệch (US04-S2, UI-01); **0 kịch bản chạy trên trình duyệt** | **Đạt** (phần API); giao diện chưa chạy |
| 2 | `npm test` xanh 100%, một lệnh, ổn định | 104/104 ở lần 1 và lần 2 (4,96 s và 5,11 s); bước bổ sung hai lần cho cùng kết quả từng bước. Chạy riêng 3 suite thì lỗi do phụ thuộc thứ tự (TD-01) | **Đạt** (chạy cả bộ); TD-01 ghi nhận |
| 3 | Mọi TC mức Cao PASS, trừ lệch có chủ đích đã ghi trong project-notes | 22 TC Cao: 20 PASS; 2 FAIL là TC-03 (DEV-01) và TC-15 (DEV-02), cả hai đã ghi trong `project-notes.md` | **Đạt** (có 2 ngoại lệ đã chấp nhận) |
| 4 | Không còn bug Critical/Major mở; bug Minor liệt kê kèm đề xuất | 0 Critical, 0 Major; 5 Minor mở (BUG-01…BUG-05) có tái hiện, nguyên nhân, đề xuất | **Đạt** |
| 5 | Biên/dữ liệu sai/bảo mật: đúng mã HTTP và mã lỗi, không có 500 với dữ liệu nhập được, không lộ stack trace | 15 phản hồi `500` ở 15 bước (BUG-01…BUG-05); **0/15** phản hồi lộ stack trace; các bước còn lại đúng mã HTTP và mã lỗi | **Không đạt** (do BUG-01…BUG-05) |
| 6 | Ma trận phân quyền đúng 100% | 88/88 ô đúng (TC-30) | **Đạt** |
| 7 | Tái lập: số bản ghi không đổi sau chạy lại migration / `seed:reset` | TC-32: 8/8 bước bổ sung và 9/9 test seed PASS; hai lần `seed:reset` cho cùng số bản ghi | **Đạt** |

## 7. Hạn chế và việc cần làm tiếp

1. **Giao diện chưa chạy trên trình duyệt.** Cột "Giao diện" ở §5 là rà soát mã; UI-01 (US04-S2) cần xác minh bằng cách đăng nhập tài khoản khách hàng rồi vào `#/admin/users`. Nên bổ sung vài luồng chính bằng công cụ kiểm thử trình duyệt (ví dụ Playwright).
2. **129 bước bổ sung là kịch bản tạm gọi HTTP, chưa nằm trong repo.** Muốn chạy lại thì dùng Postman/curl theo cột "Dữ liệu thử" ở §2. Nên chuyển thành file test trong `tests/` (đặc biệt 15 bước ứng với BUG-01…BUG-05) để làm test hồi quy sau khi sửa lỗi. Runner chụp ảnh từng TC (§4.5) cũng là script tạm ngoài repo; để giảng viên tự chạy lại và chụp lại bất kỳ TC nào bằng một lệnh, nên đưa runner vào repo dưới dạng `npm run tc -- TC-xx`.
3. **PostgreSQL 18.6 thay vì 16.** Tài liệu dự án ghi PostgreSQL 16; cụm tạm dùng 18.6 vì đó là bản có sẵn trên máy, Docker không chạy được. Mã dùng SQL chuẩn nên rủi ro thấp nhưng chưa được kiểm chứng trên PostgreSQL 16 hoặc bằng `docker compose exec api npm test`.
4. **Không có git** trong thư mục được giao nên phiên bản được xác định bằng SHA-256 của file zip; ngày kiểm 2026-11-13.
5. **Máy cá nhân, một cấu hình.** Thời gian chạy (~5 giây cho 104 test) chỉ để tham khảo, không phải số đo hiệu năng (NFR1 chủ ý không kiểm).
6. **Việc nên làm trước khi nộp:** (a) sửa BUG-01…BUG-05 rồi chạy lại `npm test` và các bước bổ sung; (b) chốt cách xử lý DEV-01, DEV-02, DEV-03 — sửa mã hoặc cập nhật tiêu chí trong backlog và [api-contract.md](api-contract.md); (c) sửa TD-01 để từng suite chạy độc lập; (d) sau khi sửa lỗi, chạy lại và chụp lại ảnh các TC đã đổi kết luận (ảnh mới có đuôi `-pass.png`, xóa ảnh `-fail.png` cũ; không đổi tên ảnh cũ); chụp thêm ảnh giao diện trên trình duyệt để xác minh UI-01.
