# Test Plan — Nền tảng kết nối và đặt dịch vụ sửa chữa tại nhà (23 user story)

Nhóm 03: Đặng Mai Hoàng Long · 2374802013303 — Lê Tấn Phong · 2374802010384 — Nguyễn Quốc Huy · 2374802010185 · Track SE
Học phần: Chuyên đề Tốt nghiệp 2, HK1 2026-2027 · Báo cáo kết quả: [test-report.md](test-report.md)
Nguồn tính năng cần kiểm: `ProductBacklog_Nhom03.xlsx` (bản md cùng nội dung, đã đối chiếu từng ô: [product-backlog-nhom03.md](product-backlog-nhom03.md)) — 23 user story (17 Must · 5 Should · 1 Could; Sprint 2: 12 US, Sprint 3: 11 US) và 53 kịch bản chấp nhận Given/When/Then.
Phiên bản được kiểm: thư mục `cdtn2-nhom03-main` (không phải kho git; nội dung 127 file trùng khớp với `cdtn2-nhom03-main.zip`, SHA-256 `441ABD159AE4FEA8E704BDF7B98F799A4666EB7408531C6EC27E87BBECB011DC`) · ngày kiểm 2026-11-13.

## 1. Phạm vi kiểm thử và phần chủ ý KHÔNG kiểm

**Kiểm:** toàn bộ 23 user story của Product Backlog (US01–US23), tương ứng FR01–FR23 và 16 quy tắc nghiệp vụ BR01–BR16 trong [srs-nhom03.md](srs-nhom03.md), qua **API thật** (Express + PostgreSQL thật, không giả lập CSDL):
đăng ký / đăng nhập / đăng xuất và phân quyền 3 vai trò (US01–US03, BR01–BR02), quản trị tài khoản (US04–US05),
vòng đời tin sửa chữa Chờ đề xuất → Đã chọn kỹ thuật viên → Hoàn thành / Đã đóng (US06–US12, US17, US21; BR03–BR06, BR11–BR12),
đề xuất của kỹ thuật viên (US13–US16, US22–US23; BR07–BR10, BR15), đánh giá hai chiều (US18–US19; BR13–BR14), thông báo (US20; BR16).
Ngoài tiêu chí chấp nhận còn kiểm giá trị biên, dữ liệu sai, bảo mật (OWASP A01, A03, A07), tái lập (migration + seed chạy lại) và một hành trình đầy đủ hai chiều trên server thật.

**Chủ ý không kiểm (kèm lý do):**

| Phần không kiểm | Lý do |
|---|---|
| Giao diện React bằng test tự động / trên trình duyệt (hiển thị, chuyển hướng, nút ẩn–hiện, thông báo trên màn hình) | Môi trường kiểm thử không có công cụ điều khiển trình duyệt. Giao diện không chứa quy tắc nghiệp vụ (mọi quy tắc nằm ở `src/services/`, `src/validators/`) và hiển thị nguyên thông điệp lỗi của backend (`frontend/src/api/httpClient.js:29-33`), nên hợp đồng API (mã HTTP, mã lỗi, thông điệp) được kiểm đầy đủ. Các mệnh đề giao diện trong tiêu chí chấp nhận chỉ được **rà soát mã** (ghi `file:dòng`) và ghi riêng là "chưa chạy trên trình duyệt" — **không bao giờ tính PASS**. Có chạy `vite build` để chắc giao diện biên dịch được (không thay thế kiểm thử hành vi). |
| Hiệu năng (NFR1: 3 giây, 1000 tin, 100 người dùng đồng thời) | Không thuộc danh sách tính năng của Product Backlog; cần công cụ tải và máy đo chuẩn. Máy kiểm thử là máy cá nhân dùng chung với CSDL tạm nên số đo không có giá trị kết luận. |
| Khả dụng (NFR3: đăng tin trong 3 phút) | Cần người dùng thật thao tác theo kịch bản, không đo được bằng test tự động. |
| Docker (`Dockerfile`, `docker-compose.yml`) và triển khai | Docker Desktop không chạy trên máy kiểm thử (daemon tắt); đây là cấu hình phát triển, không thuộc danh sách tính năng. |
| Kiểm thử xâm nhập chuyên sâu (dò mật khẩu quy mô lớn, DoS, fuzzing, quét lỗ hổng) | Ngoài phạm vi. Chỉ kiểm các mẫu bảo mật cơ bản gắn với SRS: xác thực JWT, phân quyền theo vai trò và chủ sở hữu (BR01, BR03, BR09, BR11), giả mạo trường, chuỗi SQL trong tham số. |
| Mã lỗi `CONTACT_NOT_VISIBLE` | Có trong [api-contract.md](api-contract.md) §2.2 nhưng backend không dùng (BR15 được đáp ứng bằng cách không trả `phone`, đã ghi ở [project-notes.md](project-notes.md)); hành vi BR15 được kiểm ở TC-10, TC-12, TC-16. |
| Chức năng ngoài phạm vi theo SRS (thanh toán thật, ứng dụng native, chat real-time) | SRS §1.1.2 mục 9–11 (Won't have). |
| Tương thích trình duyệt / thiết bị, đa ngôn ngữ, khả năng truy cập | Thuộc giao diện; ngoài phạm vi. |

**Kỹ thuật chọn dữ liệu:** phân vùng tương đương —
vai trò (chưa đăng nhập / khách hàng / kỹ thuật viên / quản trị viên), quan hệ sở hữu (chủ tin / người khác), trạng thái tin (Chờ đề xuất / Đã chọn kỹ thuật viên / Hoàn thành / Đã đóng),
trạng thái đề xuất (PENDING / ACCEPTED / REJECTED / WITHDRAWN), token (không có / sai kiểu / giả / ký bằng khóa khác / hết hạn / payload bị sửa / userId không tồn tại / tài khoản bị khóa / hợp lệ) —
và giá trị biên hai phía mỗi ranh giới: mật khẩu 5/6 ký tự; họ tên và email 100/101; số điện thoại 8/9 và 15/16 chữ số, chuỗi 20/21 ký tự (cột `VARCHAR(20)`); tiêu đề 200/201; loại dịch vụ 50/51; địa điểm 255/256;
thời gian dự kiến 50/51; nhận xét 1000/1001; số sao 0/1/5/6; giá 0, 0,04, 0,05, 0,1 và 10¹³; mã định danh 2147483647/2147483648 (giới hạn `int4` của cột `id`); `page`/`size` 0, 1, 100, 101.

**Quy ước kết luận (đặt trước khi chạy):**

1. Kết quả mong đợi của TC theo user story lấy từ **tiêu chí chấp nhận (Given/When/Then) trong `ProductBacklog_Nhom03.xlsx`**, mã lỗi và mã HTTP lấy từ [api-contract.md](api-contract.md) — không lấy từ mã nguồn hay từ các câu `assert` có sẵn.
2. Với giá trị biên không có trong tiêu chí: giới hạn của validator và của cột CSDL, cộng nguyên tắc chung **"dữ liệu người dùng nhập được không bao giờ gây HTTP 500"**: phía vượt giới hạn phải là `400 VALIDATION_ERROR` (hoặc `404` với mã không tồn tại), phía hợp lệ phải thành công.
3. TC **PASS** khi mọi bước đúng mong đợi; **FAIL** khi có ít nhất một bước khác mong đợi — khi đó ghi bug (BUG-xx) hoặc lệch so với tiêu chí (DEV-xx: quyết định thiết kế mà nhóm đã ghi trong [project-notes.md](project-notes.md), hoặc lệch tên/tài liệu) ở mục 3 của báo cáo. Lệch **chỉ về tên giá trị/tài liệu mà cùng ngữ nghĩa** thì ghi DEV nhưng vẫn PASS.
4. Mức độ lỗi: **Critical** (mất hoặc lộ dữ liệu, vượt quyền, hoặc chặn luồng chính của tính năng Must have) · **Major** (tính năng Must have hỏng với dữ liệu thực tế, không có cách vòng) · **Minor** (chỉ xảy ra với dữ liệu hiếm hoặc cố ý, hoặc có cách vòng; không lộ dữ liệu).
5. Ưu tiên của TC theo MoSCoW của user story: Must have → **Cao**, Should have → **Trung bình**, Could have → **Thấp**; TC bảo mật, tái lập và hành trình đầy đủ → **Cao**; TC giá trị biên và dữ liệu sai → **Trung bình**.

## 2. Loại test và số lượng mỗi tầng

| Tầng | Số TC | Mã TC | Công cụ |
|---|---:|---|---|
| API tự động thuần (HTTP trong tiến trình, PostgreSQL thật) | 14 | TC-02, 05, 09, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23 | `node:test` + `supertest` (`npm test`) |
| API tự động + bước bổ sung trên server thật | 10 | TC-01, 03, 04, 06, 07, 08, 10, 11, 18, 32 | `npm test` + kịch bản tạm gọi HTTP bằng `fetch` + lệnh `npm run migrate / seed / seed:reset / create-admin` |
| Chỉ bước bổ sung trên server thật | 9 | TC-24, 25, 26, 27, 28, 29, 30, 31, 33 | kịch bản tạm gọi HTTP bằng `fetch` tới `node src/server.js` |
| **Tổng** | **33** | | |

Theo loại: luồng đúng 24 (TC-01…TC-23 — mỗi user story một TC, bước B1…Bn ứng với từng kịch bản chấp nhận cùng các bước phụ trợ; TC-33 hành trình đầy đủ) ·
giá trị biên 4 (TC-24…TC-27) · dữ liệu sai 1 (TC-28) · bảo mật 3 (TC-29 xác thực A07, TC-30 ma trận phân quyền A01, TC-31 giả mạo trường và chuỗi tấn công A01/A03) · tái lập 1 (TC-32).
Các bước dữ liệu sai, sai quyền, song song nằm ngay trong từng TC theo user story (B2, B3…); mức phủ theo **kịch bản chấp nhận** được đếm ở [test-report.md](test-report.md) §5.

Số lượng bước thực thi: `npm test` có **104 test tự động** (27 suite, 9 file) và **mỗi test thuộc đúng một TC** (bảng ánh xạ ở báo cáo §2); phần bổ sung có **129 bước `S-xx`** (125 bước có kết luận PASS/FAIL, 4 bước chỉ ghi nhận quan sát).
Các test hồi quy do nhóm viết sẵn không tách riêng: toàn bộ 104 test đều được tính vào TC.

Tầng API là tầng chính vì hầu hết quy tắc chỉ lộ ra khi đi qua cả validator, service, transaction/khóa dòng (`FOR UPDATE`) và bảng dịch mã lỗi sang HTTP; chạy trên PostgreSQL thật (mỗi file test dựng lại lược đồ, cả 104 test mất khoảng 5 giây) để bắt được cả ràng buộc CSDL và các trường hợp gửi song song (BR08, BR10, đăng ký trùng email, đánh giá trùng) mà CSDL giả không bắt được.
Dự án không có tầng unit thuần: các hàm kiểm tra (`src/validators/*.js`) được kiểm gián tiếp qua các bước biên (TC-24…TC-26). Giao diện chỉ được rà soát mã (xem mục 1).

## 3. Tiêu chí thành công đo được

1. **Phủ:** 23/23 user story có ít nhất một TC; 53/53 kịch bản chấp nhận có ít nhất một bước TC với bằng chứng thực thi ở tầng API; phần giao diện của tiêu chí được rà soát mã và ghi rõ "chưa chạy" (không tính vào PASS).
2. **Bộ tự động xanh và ổn định:** `npm test` PASS 100% ở lần chạy cuối, **chỉ bằng một lệnh**, và cho cùng kết quả ở lần chạy lặp lại (không test chập chờn).
3. **Ưu tiên Cao:** mọi TC mức Cao PASS, **ngoại trừ** các lệch có chủ đích đã ghi trước trong [project-notes.md](project-notes.md) (phải được liệt kê ở mục 3 của báo cáo với trạng thái "chấp nhận").
4. **Mức lỗi:** không còn bug Critical hoặc Major đang mở; mọi bug Minor còn mở phải được liệt kê kèm cách tái hiện, nguyên nhân và đề xuất khắc phục.
5. **Độ bền với dữ liệu vào:** ở mọi TC biên / dữ liệu sai / bảo mật — đúng mã HTTP **và** đúng mã lỗi nghiệp vụ theo [api-contract.md](api-contract.md); **không có phản hồi HTTP 500** với dữ liệu người dùng nhập được; thân phản hồi lỗi không chứa stack trace.
6. **Phân quyền:** ma trận endpoint × vai trò đúng 100% số ô (chưa đăng nhập → 401; sai vai trò hoặc không phải chủ sở hữu → 403).
7. **Tái lập:** chạy lại migration hoặc `seed:reset` — số bản ghi của mọi bảng không đổi; chạy lại migration không in thêm dòng nào.

## 4. Môi trường và dữ liệu thử

- **Phần mềm:** Windows 11 Pro; Node.js v24.22.0 (dự án yêu cầu ≥ 20) và npm 11.19.1; PostgreSQL **18.6** — README và [huong-dan-chay.md](huong-dan-chay.md) ghi PostgreSQL 16, nên đây là **một điểm khác phiên bản** (xem báo cáo §7). Docker không dùng (daemon không chạy).
- **Cách chạy:** trên bản sao của dự án ở thư mục tạm (`npm ci`: 147 gói, 0 lỗ hổng) để không thay đổi thư mục dự án. Không tạo file `.env`; biến môi trường đặt trực tiếp khi chạy: `TEST_DATABASE_URL`, `DATABASE_URL`, `JWT_SECRET` (chuỗi ngẫu nhiên 32 byte), `JWT_EXPIRES_IN=1d`, `CLIENT_URL=http://localhost:5173`.
- **CSDL:** cụm PostgreSQL tạm, riêng biệt (không đụng cụm có sẵn trên máy), mã hóa UTF8, locale `builtin` `C.UTF-8` để `ILIKE` gập được `Đ/đ` — đã kiểm `SELECT 'Thủ Đức' ILIKE '%thủ đức%'` trả `true` trước khi chạy test (nếu dùng locale `C` thông thường, bước lọc khu vực của TC-11 sẽ lỗi vì lý do môi trường chứ không phải lỗi sản phẩm). Dựng bằng các lệnh đã chạy:

  ```text
  initdb -D <thư mục> -U postgres -A scram-sha-256 --pwfile=<file> -E UTF8 --locale-provider=builtin --builtin-locale=C.UTF-8 --locale=C
  pg_ctl -D <thư mục> -o "-p 55432" -l <file log> -w start
  CREATE USER nhom03 WITH PASSWORD 'nhom03' CREATEDB;   -- đúng như README mục 3
  CREATE DATABASE suachua_dev OWNER nhom03;  CREATE DATABASE suachua_test OWNER nhom03;  CREATE DATABASE suachua_taplap OWNER nhom03;
  ```

  `suachua_test` dành cho `npm test` (bị xóa và dựng lại ở đầu mỗi file test); `suachua_dev` dành cho các bước bổ sung trên server thật (tạo mới trước mỗi lần chạy nên bước "chưa có tin nào" luôn đúng); `suachua_taplap` dành riêng cho TC-32.
- **Dữ liệu thử (`npm test`):** mỗi file test tự dựng dữ liệu bằng `datLaiCoSoDuLieu()` + `taoTaiKhoan()` (mật khẩu `matkhau123`, SĐT `0901234567`) + `taoTin()` (tin mẫu "Sửa máy lạnh không lạnh", loại `Điện lạnh`, địa điểm `Quận 7, TP.HCM`) — không phụ thuộc dữ liệu có sẵn. `tests/seed.test.js` chạy thư mục `seeds/` (7 tài khoản demo mật khẩu `Demo@123`, 7 tin, 9 đề xuất, 3 đánh giá, 3 thông báo).
- **Dữ liệu thử (bước bổ sung):** CSDL trống + 1 quản trị viên tạo bằng `npm run create-admin` (quản trị viên không đăng ký được qua giao diện — BR01) + các tài khoản tự đăng ký qua API; server thật `node src/server.js` ở cổng 3100. Mỗi bước ghi đủ phương thức, đường dẫn và thân yêu cầu trong cột "Dữ liệu thử" của báo cáo để chạy lại bằng Postman hoặc curl.
- **Lệnh chạy** (mọi lệnh dưới đây đã chạy thật):
  - Toàn bộ bộ test tự động, **một lệnh**: `npm test` → 104 test (cần PostgreSQL đang chạy và cấu hình `.env` theo README mục 3).
  - Chạy riêng nhóm test của một TC: `node --test --test-concurrency=1 --test-name-pattern="<mẫu>" tests/<file>.test.js` — mẫu và file của từng TC ở [test-report.md](test-report.md) §2. **Không dùng** `npm test -- --test-name-pattern=...`: tham số bị đưa vào test chứ không vào Node nên vẫn chạy cả 104 test (đã thử).
  - Lưu ý (TD-01): ba suite `US02`, `US07`, `US10` phụ thuộc dữ liệu do suite đứng trước tạo ra, nên TC-02, TC-07, TC-10 phải chạy kèm suite tiền đề hoặc chạy cả file (mẫu ghi sẵn ở báo cáo §2).
  - Build giao diện (smoke): `npm --prefix frontend ci` rồi `npm --prefix frontend run build`.
  - Bước bổ sung `S-xx`: không thuộc `npm test`; chạy lại bằng Postman/curl theo dữ liệu ghi trong báo cáo.
- **Minh chứng:** (1) trích log của các lần chạy thật ở [test-report.md](test-report.md) §4 (tổng kết `npm test`, các bước FAIL kèm log lỗi phía server, kết quả build, kết quả chạy riêng từng suite); (2) **ảnh chụp cửa sổ terminal** trong thư mục [screenshots/](screenshots/): mỗi test case một ảnh `TC-xx-pass.png` hoặc `TC-xx-fail.png` (đúng kết luận trong báo cáo), cùng `npm-test-pass.png` (cả bộ 104 test) và `bo-sung-tong-ket.png` (129 bước bổ sung). Ảnh là ảnh chụp thật, không chỉnh sửa, chụp từ bản sao kiểm thử bằng một runner tạm theo từng TC (không nằm trong repo): ảnh có tiêu đề cửa sổ, banner (thời điểm, phiên bản, Node, PostgreSQL), dòng `Lệnh:` và output thật của lệnh đó. Cách chụp và giới hạn xem [test-report.md](test-report.md) §4.5.

## 5. Ma trận truy vết

**User story → TC** (Ưu tiên theo quy ước mục 1; "TC bổ sung" là các TC chéo cùng chạm tới user story đó):

| US | Tính năng | MoSCoW → Ưu tiên | Sprint | FR | BR liên quan | TC chính | TC bổ sung |
|---|---|---|---|---|---|---|---|
| US01 | Đăng ký tài khoản | Must → Cao | 2 | FR01 | BR01 | TC-01 | TC-24, 28, 31, 33 |
| US02 | Đăng nhập | Must → Cao | 2 | FR02 | BR01, BR02 | TC-02 | TC-29, 33 |
| US03 | Đăng xuất | Must → Cao | 2 | FR03 | — | TC-03 | TC-29, 33 |
| US04 | Xem danh sách tài khoản | Must → Cao | 3 | FR04 | BR01 | TC-04 | TC-30, 31 |
| US05 | Khóa hoặc mở khóa tài khoản | Must → Cao | 3 | FR05 | BR02 | TC-05 | TC-29, 30 |
| US06 | Đăng tin yêu cầu sửa chữa | Must → Cao | 2 | FR06 | BR05 | TC-06 | TC-25, 28, 31, 33 |
| US07 | Xem danh sách tin của mình | Must → Cao | 2 | FR07 | BR03 | TC-07 | TC-27, 30 |
| US08 | Xem chi tiết tin của mình | Must → Cao | 2 | FR08 | BR03 | TC-08 | TC-27, 30 |
| US09 | Đóng tin sửa chữa | Must → Cao | 3 | FR09 | BR03, BR06 | TC-09 | TC-27, 30 |
| US10 | Xem danh sách tin (kỹ thuật viên) | Must → Cao | 2 | FR10 | BR04, BR15 | TC-10 | TC-27, 30, 33 |
| US11 | Lọc tin sửa chữa | Must → Cao | 3 | FR11 | — | TC-11 | TC-31 |
| US12 | Xem chi tiết tin (kỹ thuật viên) | Must → Cao | 2 | FR12 | BR04, BR15 | TC-12 | TC-30, 33 |
| US13 | Gửi đề xuất sửa chữa | Must → Cao | 2 | FR13 | BR07, BR08 | TC-13 | TC-26, 28, 30, 31, 33 |
| US14 | Xem các đề xuất đã nhận | Must → Cao | 2 | FR14 | BR09 | TC-14 | TC-30, 33 |
| US15 | Xem chi tiết đề xuất | Must → Cao | 3 | FR15 | BR09 | TC-15 | TC-27, 30 |
| US16 | Chọn kỹ thuật viên từ danh sách đề xuất | Must → Cao | 2 | FR16 | BR09, BR10, BR12, BR15, BR16 | TC-16 | TC-27, 30, 33 |
| US17 | Xác nhận công việc đã hoàn thành | Must → Cao | 2 | FR17 | BR11, BR12 | TC-17 | TC-30, 33 |
| US18 | Đánh giá kỹ thuật viên | Should → Trung bình | 3 | FR18 | BR13, BR14 | TC-18 | TC-26, 31, 33 |
| US19 | Đánh giá khách hàng | Should → Trung bình | 3 | FR19 | BR13, BR14 | TC-19 | TC-26, 33 |
| US20 | Nhận thông báo khi đề xuất được chấp nhận | Could → Thấp | 3 | FR20 | BR16 | TC-20 | TC-30, 33 |
| US21 | Sửa tin sửa chữa | Should → Trung bình | 3 | FR21 | BR03, BR06 | TC-21 | TC-25, 31 |
| US22 | Sửa đề xuất sửa chữa | Should → Trung bình | 3 | FR22 | NFR2 | TC-22 | TC-26, 30, 31 |
| US23 | Rút đề xuất sửa chữa | Should → Trung bình | 3 | FR23 | BR08 | TC-23 | TC-30 |

TC-32 (tái lập) phủ dữ liệu mẫu tạo qua các service nên đụng tới mọi bất biến BR01–BR16 trên dữ liệu seed; TC-28 (dữ liệu sai) áp dụng cho mọi API nhận thân JSON.

**Quy tắc nghiệp vụ → TC** (mỗi quy tắc đã hiện thực có ít nhất một TC luồng đúng và một TC từ chối):

| BR | Nội dung rút gọn | TC |
|---|---|---|
| BR01 | Chỉ làm đúng chức năng theo vai trò (không tự đăng ký quản trị viên) | TC-01, 04, 06, 12, 30 |
| BR02 | Tài khoản bị khóa không thao tác được | TC-02, 05, 29 |
| BR03 | Khách hàng chỉ xem/đóng tin của mình | TC-07, 08, 09, 30, 31 |
| BR04 | Kỹ thuật viên chỉ xem/gửi đề xuất cho tin Chờ đề xuất | TC-10, 12 |
| BR05 | Đủ thông tin bắt buộc khi đăng tin | TC-06, 25 |
| BR06 | Chỉ đóng/sửa tin khi chưa chọn kỹ thuật viên | TC-09, 21 |
| BR07 | Chỉ gửi đề xuất cho tin Chờ đề xuất | TC-13 |
| BR08 | Một đề xuất hiệu lực cho mỗi kỹ thuật viên và mỗi tin | TC-13, 23 |
| BR09 | Chỉ chủ tin xem danh sách đề xuất và chấp nhận | TC-14, 15, 16 |
| BR10 | Mỗi tin một kỹ thuật viên được chọn, đề xuất còn lại bị loại | TC-16 |
| BR11 | Chỉ chủ tin xác nhận hoàn thành | TC-17 |
| BR12 | Trình tự trạng thái Chờ đề xuất → Đã chọn → Hoàn thành | TC-09, 16, 17 |
| BR13 | Chỉ đánh giá sau khi Hoàn thành và đúng bên tham gia | TC-18, 19 |
| BR14 | Mỗi bên một đánh giá cho mỗi công việc | TC-18, 19 |
| BR15 | Số điện thoại khách hàng chỉ hiện cho kỹ thuật viên được chọn | TC-10, 12, 16 |
| BR16 | Tạo thông báo khi đề xuất được chấp nhận | TC-16, 20 |
