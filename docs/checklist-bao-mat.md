# Checklist bảo mật — Nền tảng kết nối và đặt dịch vụ sửa chữa tại nhà

Nhóm 03 · Track SE. Mọi mục dưới đây đã **chạy thật** ngày 26/11/2026 trên bản `a9466b7` cộng các sửa lỗi ở mục 4 (chưa commit khi chạy), bằng hai cách: lệnh gõ tay (ảnh chụp cửa sổ terminal thật nằm trong báo cáo `BaoCaoKiemThu.docx`, Mục 5) và script chạy lại được `node scripts/kiem-tra-bao-mat.js` (66 bước PASS/FAIL, cần CSDL phát triển đã nạp dữ liệu mẫu). Cùng các yêu cầu HTTP ở dạng chạy trực tiếp: [api-examples.http](api-examples.http). Kết quả theo test case: [test-report.md](test-report.md) §9; lỗi đã sửa: [bug-log.md](bug-log.md) BUG-06…BUG-10.

Trạng thái chỉ có hai giá trị: **ĐÃ LÀM** (kèm minh chứng) và **KHÔNG ÁP DỤNG** (kèm lý do). Mục nào lúc kiểm phát hiện lỗi thì ghi rõ lỗi đã sửa và kết quả chạy lại.

## 1. Bảy mục checklist Bài tập 3

| # | Mục (OWASP 2025) | Trạng thái | Minh chứng |
|---|---|---|---|
| 1 | Không có secret nào trong repo (A02) | ĐÃ LÀM | `git log --all --oneline -- .env` → 0 dòng; `-- ".env.*" ":!.env.example"` → 0 dòng; `git ls-files` chỉ có `.env.example`; `git check-ignore -v .env` → `.gitignore:2`. Quét lịch sử bằng lệnh của đề (`password\|secret\|api_key`): 119 dòng khớp, đều là giá trị mẫu trong test/tài liệu (`matkhau123`, `Demo@123`, `MAT_KHAU_DEMO`, tên trường `password`) **trừ hai giá trị cố định thật**: khóa JWT mặc định `khoa-jwt-chi-dung-khi-phat-trien-bang-docker` và mật khẩu CSDL `nhom03` trong `docker-compose.yml`. Cả hai là giá trị phát triển công khai, chưa từng dùng cho hệ thống nào chạy thật; đã gỡ khỏi bản hiện tại (BUG-10), khóa mặc định cũ không còn được dùng. Quét mẫu khóa thật (JWT, AKIA, ghp_, khóa PEM) trong toàn bộ lịch sử → 0 dòng. |
| 2 | Dữ liệu vào được kiểm ở tầng ứng dụng (A05) | ĐÃ LÀM | Ba lệnh grep của đề (ảnh M2): SQL ghép chuỗi → 8 dòng, đều chỉ ghép khung cố định (`WHERE`, `SET`, `FOR UPDATE`) và số thứ tự `$n`, giá trị đi qua tham số; chèn HTML thô → 0 dòng; gọi lệnh hệ thống → 0 dòng. Chạy thật (kiểm tra A05): `' OR 1=1 --` ở bộ lọc → 0 bản ghi; `'; DROP TABLE users; --` → bảng còn nguyên; tiêm vào email/mật khẩu đăng nhập → 401; thẻ `<script>` lưu nguyên văn và giao diện hiện thành chữ (kiểm tra giao diện XSS). Dữ liệu sai bị chặn ở validator: TC-24…TC-28 (400, không 500). |
| 3 | Kiểm soát truy cập theo chủ sở hữu (A01) | ĐÃ LÀM | kiểm tra A01, 18 bước: khách A xem/sửa/đóng tin của khách B → 403 `NOT_OWNER` và dữ liệu không đổi; xem/chấp nhận đề xuất không thuộc tin của mình → 403; kỹ thuật viên B sửa/rút/xem đề xuất của A → 403; đánh dấu đã đọc thông báo của người khác → 403; đánh giá công việc không tham gia → 403; khách gọi API quản trị, kỹ thuật viên đăng tin → 403; gửi kèm `role=ADMIN` khi sửa hồ sơ → bị bỏ qua; tự đăng ký quản trị viên → 400. |
| 4 | Mật khẩu băm (A04, A07) | ĐÃ LÀM | kiểm tra A04: 247/247 mật khẩu là bcrypt `$2b$10$…`, 0 dòng chứa mật khẩu đọc được; 9 phản hồi API (đăng nhập, `me`, hồ sơ, danh sách tài khoản…) không chứa mật khẩu hay chuỗi băm; tài khoản đăng ký mới có chuỗi băm khác tài khoản demo (muối riêng). Ghi nhận: 247 tài khoản demo **dùng chung một chuỗi băm** vì seed băm một lần; chỉ ảnh hưởng dữ liệu mẫu. |
| 5 | Thông báo lỗi không lộ cấu trúc bên trong (A10, A02) | ĐÃ LÀM | kiểm tra A02: JSON hỏng, thân rác, mã sai kiểu, đường dẫn lạ, thân hơn 100 KB, CSDL không kết nối được → mọi phản hồi gọn (400/404/500 `INTERNAL_ERROR`), không có vết ngăn xếp, tên bảng/cột, SQL hay chuỗi kết nối. Trên Docker: dừng container `db` → `api` vẫn `healthy`, trả `500 INTERNAL_ERROR`, bật `db` lại → 200 (trước khi sửa BUG-06, `api` thoát mã 1). |
| 6 | Nhật ký không ghi secret, dữ liệu cá nhân (A09) | ĐÃ LÀM | `docker compose logs api \| grep -iE "password\|token\|0[0-9]{9}"` → 0 dòng sau khi gửi đăng nhập sai, token giả, JSON hỏng, dừng CSDL (161 dòng nhật ký); script: 0 dòng khớp ở hai backend (bình thường và CSDL chết). Kiểm chặt hơn: mật khẩu demo `Demo@123` và email tài khoản demo chỉ xuất hiện ở bảng tóm tắt của lần nạp dữ liệu mẫu đầu tiên (đầu ra của `npm run seed`, dữ liệu mẫu công khai trong `seeds/README.md`), không phát sinh khi API chạy. Nhật ký lỗi 500 ghi vết ngăn xếp phía máy chủ (gồm đường dẫn thư mục) nhưng không ghi chuỗi kết nối. |
| 7 | Phụ thuộc ghim phiên bản, đã kiểm lỗ hổng (A03) | ĐÃ LÀM | `package-lock.json` và `frontend/package-lock.json` đã commit; lockfile v3, 147 gói, 0 gói thiếu `version`/`integrity`; `npm audit --omit=dev` → 0 lỗ hổng ở cả backend và giao diện; `package.json` dùng `^` nhưng lockfile ghim từng phiên bản và Docker dựng bằng `npm ci`. |

## 2. Checklist tự kiểm [SE] — Week 8, mục A6 (11 mục)

| # | Mục | Trạng thái | Minh chứng |
|---|---|---|---|
| 1 | Đã chạy ba lệnh grep ở mục A4 và ghi kết quả | ĐÃ LÀM | Mục 1, dòng 2 ở trên. |
| 2 | `JWT_SECRET` từ biến môi trường, ≥ 32 ký tự, dừng khi thiếu | ĐÃ LÀM | [src/config/env.js](../src/config/env.js): thiếu → `Thiếu biến môi trường JWT_SECRET`; ngắn hơn 32 → `JWT_SECRET quá ngắn`; giá trị mẫu 41 ký tự nạp được (ảnh A6). Trước khi sửa BUG-08, khóa 4 ký tự vẫn khởi động được. |
| 3 | Xác thực token chỉ định thuật toán, không dùng `decode` để phân quyền | ĐÃ LÀM | `jwt.verify(token, secret, { algorithms: ['HS256'] })` và `jwt.sign(…, { algorithm: 'HS256' })`; `jwt.decode` → 0 chỗ trong `src/`. Trước khi sửa BUG-07, token HS512 ký đúng khóa được chấp nhận (200); nay 401 (kiểm tra A07). |
| 4 | Payload token chỉ có id, vai trò, thời hạn | ĐÃ LÀM | Payload thật: `{"userId":2,"role":"CUSTOMER","iat":…,"exp":…}`, hạn 86400 giây (kiểm tra A07). |
| 5 | Kiểm soát truy cập theo chủ sở hữu, tự kiểm như A01 | ĐÃ LÀM | Mục 1, dòng 3 (kiểm tra A01). |
| 6 | CORS chỉ mở cho nguồn trong biến môi trường, không `*` kèm credentials | ĐÃ LÀM | `cors({ origin: CLIENT_URL })`: nguồn `http://evil.example` và preflight từ nguồn đó đều nhận `Access-Control-Allow-Origin: http://localhost:5173` (không phản chiếu nguồn lạ, không `*`) nên trình duyệt chặn (kiểm tra A02). |
| 7 | Cookie (nếu dùng) có HttpOnly, SameSite; Secure theo biến môi trường | KHÔNG ÁP DỤNG | Hệ thống không dùng cookie: `grep -rE "set-cookie\|res.cookie\|document.cookie" src frontend/src` → 0 dòng; token gửi qua tiêu đề `Authorization: Bearer`. |
| 8 | Không có secret, token, mật khẩu trong URL | ĐÃ LÀM | Token đặt trong `?token=` → 401 (chỉ nhận tiêu đề); giao diện không đưa token vào URL; sau BUG-09, phản hồi lỗi không còn trả ngược chuỗi truy vấn (`path` chỉ là đường dẫn). |
| 9 | Thông báo lỗi không chứa vết ngăn xếp, tên bảng, chuỗi kết nối | ĐÃ LÀM | Mục 1, dòng 5 (kiểm tra A02). |
| 10 | API docs đủ mọi endpoint, mỗi endpoint đủ bảy mục và ví dụ thật | ĐÃ LÀM | Báo cáo Mục 6: 29/29 endpoint (kể cả `GET /api/users/{id}` và `PATCH /api/users/me`), mỗi endpoint có bảy mục và một ví dụ thật chép từ lần gọi ngày 26/11/2026; tệp [api-examples.http](api-examples.http) có 60 yêu cầu kèm phản hồi thật, trong đó 35 phủ cả 29 endpoint và 25 là yêu cầu kiểm thử bảo mật. |
| 11 | Deployment Guide có mục bật HTTPS khi triển khai thật | ĐÃ LÀM | [deployment-guide.md](deployment-guide.md) mục 8: cấu hình Caddy kết thúc TLS (đã chạy thử `tls internal`: `https://localhost:8443/api/health` → 200, HTTP thường → 400) và nginx. |

## 3. Checklist tự kiểm [SE] — Week 7, mục A4 và A5

Năm mục OWASP:2025 của A4 được tự kiểm bằng tay (có tự động hóa bằng script) và ghi kết quả ở báo cáo Mục 5 và [test-report.md](test-report.md) §9.2: **A01** (18 bước), **A02** (11 bước), **A04** (11 bước), **A05** (8 bước), **A07** (16 bước), tất cả PASS. Đây là kết quả kiểm tra bổ sung, không tính thêm test case vào bộ 33 test case của báo cáo.

| # (A5) | Mục | Trạng thái | Minh chứng |
|---|---|---|---|
| 1 | Công cụ kiểm thử và một lệnh chạy cả bộ, ghi vào README | ĐÃ LÀM | `npm test` (node:test + supertest): 157/157, mục 5 của README; chạy cả trong container PostgreSQL 16.16. |
| 2 | Ít nhất một test cho mỗi quy tắc nghiệp vụ | ĐÃ LÀM | BR01…BR16 đều xuất hiện trong ít nhất một test của `tests/` (BR05 và BR11 một lần, nhiều nhất BR01 và BR08 bảy lần); ma trận US ↔ TC ở [test-plan.md](test-plan.md). |
| 3 | Ít nhất hai test giá trị biên | ĐÃ LÀM | 4 TC biên (TC-24…TC-27). |
| 4 | Ít nhất hai test dữ liệu sai, kiểm cả mã và nội dung | ĐÃ LÀM | TC-28 và các bước dữ liệu sai trong TC-24…TC-27, kiểm tra A05, kiểm tra A07. |
| 5 | Test dựng tiền điều kiện bằng code | ĐÃ LÀM | `datLaiCoSoDuLieu`, `taoTaiKhoan`, `taoTin` trong `tests/helpers.js`; hạn chế đã biết TD-01 (ba suite phụ thuộc suite đứng trước khi chạy riêng lẻ) ở [bug-log.md](bug-log.md). |
| 6 | Postman collection hoặc `.http` đã commit | ĐÃ LÀM | [api-examples.http](api-examples.http). |
| 7 | Tự kiểm năm mục OWASP | ĐÃ LÀM | năm kiểm tra A01, A02, A04, A05, A07. |
| 8 | Lỗi không lộ vết ngăn xếp, tên bảng, chuỗi kết nối | ĐÃ LÀM | Mục 1, dòng 5. |
| 9 | Mật khẩu trong CSDL là chuỗi băm | ĐÃ LÀM | Mục 1, dòng 4. |
| 10 | Có Bug Log thật với link commit mở được | ĐÃ LÀM | BUG-01…BUG-05: 6 commit, mở được không cần đăng nhập (HTTP 200 khi gọi không kèm thông tin xác thực, repo công khai); BUG-06…BUG-10 sau khi commit. |

## 4. Phát hiện và đã sửa trong đợt kiểm này

| Bug | Mức | Phát hiện bởi | Sửa |
|---|---|---|---|
| BUG-06 | Major | kiểm tra A02 (dừng `db` trong Docker) | `src/db.js`: bắt sự kiện `error` của pool. |
| BUG-07 | Minor | kiểm tra A07 (token HS512) | `auth.middleware.js`, `auth.service.js`: ghim HS256. |
| BUG-08 | Minor | A6 mục 2 | `src/config/env.js`: `JWT_SECRET` ≥ 32 ký tự. |
| BUG-09 | Minor | kiểm tra A02, kiểm tra A07 | `src/app.js` bỏ `X-Powered-By`; `error-handler.js` bỏ chuỗi truy vấn khỏi `path`. |
| BUG-10 | Major | M1 (rà secret) | `docker-compose.yml` đọc `DB_PASSWORD`/`JWT_SECRET` từ `.env`; `.env.example` có giá trị mẫu chạy được; nạp dữ liệu mẫu tự động. |

## 5. Quyết định giữ nguyên (có lý do)

- **Không giới hạn số lần đăng nhập trong ứng dụng (OBS-01).** Khóa theo email cho phép kẻ tấn công khóa người khác bằng cách gửi sai liên tục; giới hạn theo IP trong ứng dụng sai khi đứng sau proxy chưa cấu hình `trust proxy` và gộp mọi người dùng chung một địa chỉ NAT. Reverse proxy là nơi đằng nào cũng phải đặt để bật HTTPS và có sẵn `limit_req`: cấu hình nginx ở Deployment Guide mục 8 đã chạy thử, 12 lần đăng nhập sai liên tiếp → `401` ×6 rồi `429` ×6, đường dẫn khác không bị ảnh hưởng.
- **Đăng xuất không thu hồi token (DEV-01).** Thu hồi cần thêm trạng thái phía máy chủ ở mọi lần xác thực. Rủi ro đã giảm: token hạn 1 ngày (`JWT_EXPIRES_IN`), khóa tài khoản có hiệu lực ngay với token đang dùng (BR02, kiểm tra A07), giao diện xóa token khi đăng xuất (kiểm tra giao diện đăng xuất).
- **Token lưu ở `localStorage` của trình duyệt.** Nếu chuyển sang cookie HttpOnly thì phải thêm chống CSRF và cấu hình CORS có credentials. Rủi ro XSS đã được chặn ở gốc: React tự thoát ký tự, không có `innerHTML`/`dangerouslySetInnerHTML` (grep → 0), thẻ `<script>` hiện thành chữ trên cả bốn màn hình thử (kiểm tra giao diện XSS).
- **Không đặt tiêu đề bảo mật (HSTS, CSP) trong ứng dụng.** Đặt ở reverse proxy cùng nơi kết thúc HTTPS (Deployment Guide mục 8); backend không phục vụ HTML nên CSP của ứng dụng không có tác dụng.
- **Mật khẩu tối thiểu 6 ký tự** theo hợp đồng API (`api-contract.md`, bảng trường của `POST /api/auth/register`); mật khẩu quá ngắn bị từ chối 400 (kiểm tra A07). Băm bcrypt 10 vòng làm mỗi lần thử mất khoảng 50–70 ms trên một tiến trình.
- **Tài khoản demo dùng chung một chuỗi băm.** Chỉ có ở dữ liệu mẫu; tài khoản đăng ký thật có muối riêng (kiểm tra A04).
- **Docker chỉ cho phát triển và chấm bài:** giao diện chạy bằng máy chủ phát triển của Vite và `.env.example` chứa khóa mẫu công khai (Deployment Guide mục 7 và 8).
