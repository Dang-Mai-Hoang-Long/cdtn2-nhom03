# Nhật ký lỗi (Bug Log) — Nền tảng kết nối và đặt dịch vụ sửa chữa tại nhà

Nhóm 03 · Track SE · Học phần Chuyên đề Tốt nghiệp 2, HK1 2026-2027. Kế hoạch kiểm thử: [test-plan.md](test-plan.md) · Kết quả đầy đủ: [test-report.md](test-report.md) (lần 1 ở §1–§7, kiểm thử lại sau sửa lỗi ở §8) · Ảnh minh chứng: [screenshots/](screenshots/) (trước khi sửa) và [screenshots/sau-sua-loi/](screenshots/sau-sua-loi/) (sau khi sửa)

Hai phần: **Phần A — năm bug do test case phát hiện** (BUG-01…BUG-05), mỗi bug đủ **bảy dòng** (mã và mức độ · phát hiện bởi test case nào · triệu chứng · cách tái lập · nguyên nhân thật · cách sửa · link commit và xác nhận);
**Phần B — lệch so với tiêu chí chấp nhận, ghi nhận và hạn chế khác** (DEV, UI, TD, OBS), định dạng ngắn, không tính là bug đã chốt. Nhật ký này khác [project-notes.md](project-notes.md), vốn ghi các **quyết định thiết kế**.

**Trạng thái hiện tại (2026-11-20): cả 5 bug đã ĐÓNG.** Nhánh `fix-bug` (mỗi bug một commit sửa, riêng BUG-05 hai commit, kèm 11 test hồi quy) đã được gộp vào `main` tại commit [76b2752](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/76b2752). Bản `main@76b2752` được kiểm thử lại độc lập ngày 2026-11-20 (13:36–13:46, giờ Việt Nam), kết quả ở từng bug và ở [test-report.md](test-report.md) §8:

- `npm test`: **115/115 pass** ở cả hai lần chạy (trước khi sửa: 104/104; thêm 11 test hồi quy `BUG-01`…`BUG-05`).
- 129 bước bổ sung trên server thật: **124 PASS + 1 FAIL + 4 quan sát** (trước khi sửa: 109 + 16 + 4). 15 bước FAIL chuyển sang PASS; phản hồi HTTP 500 còn **0** (trước khi sửa: 15). Hai lần chạy cho cùng kết quả từng bước.
- Các lệnh tái lập ở Phần A, cùng một bộ lệnh chạy trên mã cũ (tag `v0.2` = `2ba0157`) và mã mới (`main`): **19 phản hồi 500 → 0**; lỗi ghi trong log (stderr) của server **19 mục → 0** (mỗi mục kèm stack trace).
- Bước FAIL duy nhất còn lại là S-03-3 (token cũ vẫn dùng được sau khi đăng xuất, **DEV-01**): quyết định thiết kế đã chấp nhận, không thuộc 5 bug này.
- Ảnh chụp lại TC-24, TC-26, TC-27, TC-28, `npm test` và ảnh tổng kết nằm ở [screenshots/sau-sua-loi/](screenshots/sau-sua-loi/). Ảnh `-fail.png` ở [screenshots/](screenshots/) **giữ lại** làm bằng chứng của trạng thái trước khi sửa.

Các mục DEV, UI, TD, OBS chưa nằm trong phạm vi sửa lỗi ([project-notes.md](project-notes.md), mục "Quyết định khi sửa lỗi ở Sprint 4") nên vẫn như cũ, trừ ghi chú cập nhật ở OBS-04 và OBS-05 (Phần B).

**Cập nhật 2026-11-26:** đợt kiểm bảo mật và chạy Docker tìm thêm 5 bug (**BUG-06…BUG-10**, Phần A bổ sung bên dưới), đã sửa và chạy lại; các mục DEV, UI, TD, OBS đều có quyết định chốt (bảng đầu Phần B). Kết quả: [checklist-bao-mat.md](checklist-bao-mat.md), [test-report.md](test-report.md) §9.

Mức độ đo bằng **tác động tới người dùng** (cùng thang với [test-plan.md](test-plan.md) §1): **Critical** = mất hoặc lộ dữ liệu, vượt quyền, hoặc chặn luồng chính của tính năng Must have · **Major** = tính năng Must have hỏng với dữ liệu thực tế và không có cách vòng · **Minor** = chỉ xảy ra với dữ liệu hiếm hoặc cố ý, hoặc có cách vòng; không lộ dữ liệu.

| Bug | Mức độ | Phát hiện bởi | Trạng thái | Commit sửa |
|---|---|---|---|---|
| BUG-01 — đăng ký với số điện thoại có nhiều dấu cách (chuỗi dài hơn 20 ký tự) bị lỗi 500 | Minor | TC-24 | Đã đóng 2026-11-20 | [caa7c2d](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/caa7c2d) |
| BUG-02 — giá đề xuất 0,04 gây lỗi 500 | Minor | TC-26 | Đã đóng 2026-11-20 | [6c1ffd2](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/6c1ffd2) |
| BUG-03 — mã định danh vượt 2147483647 gây lỗi 500 ở 15 endpoint | Minor | TC-27 | Đã đóng 2026-11-20 | [d49d654](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/d49d654) |
| BUG-04 — `page` quá lớn gây lỗi 500 | Minor | TC-27 | Đã đóng 2026-11-20 | [ae3e017](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/ae3e017) |
| BUG-05 — thân yêu cầu lớn hơn 100 KB trả 500 thay vì 413 | Minor | TC-28 | Đã đóng 2026-11-20 | [438a449](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/438a449), [2f05954](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/2f05954) |

Cả năm lỗi cùng một họ: lỗi của CSDL (mã PostgreSQL 22001, 22003, 23514) hoặc của thư viện đọc thân yêu cầu không được ánh xạ sang mã 4xx, nên `xuLyLoi` ([src/utils/error-handler.js](../src/utils/error-handler.js)) trả `500 INTERNAL_ERROR`. Thân phản hồi 500 chỉ có thông điệp chung, **không lộ stack trace** (kiểm tra cả 15 phản hồi 500 ở lần chạy bổ sung). Nhóm sửa **tại nguyên nhân của từng lỗi** (validator, hàm đọc mã số, hàm phân trang, xử lý lỗi), không thêm lớp ánh xạ chung mã lỗi PostgreSQL sang 4xx vì lớp đó sẽ che các lỗi máy chủ thật ([project-notes.md](project-notes.md)).

---

# Chuẩn bị chung để tái lập (Phần A)

Các lệnh dưới đây chạy trên Windows PowerShell 5.1 ngày 2026-11-20 với dữ liệu mẫu của dự án. Cùng một bộ lệnh cho kết quả khác nhau ở hai phiên bản mã nên mỗi bug ghi cả hai kết quả.

1. Chọn phiên bản mã. **Mã cũ có lỗi:** tag `v0.2` (commit `2ba0157`, bản đã kiểm thử ở lần 1). **Mã đã sửa:** nhánh `main` từ commit `76b2752`. Nên dùng một bản sao riêng để không đổi nhánh đang làm việc, ví dụ `git worktree add ../cdtn2-v0.2 v0.2` rồi `npm install` trong thư mục đó.
2. Dựng CSDL và dữ liệu mẫu theo README (`npm run migrate`, rồi `npm run seed`), sau đó chạy backend ở cổng 3000: `npm start`.
3. Mở một cửa sổ PowerShell khác (cần `curl.exe`, có sẵn trên Windows 10 trở lên) và dán khối sau để có hai hàm trợ giúp và ba token (tài khoản demo, mật khẩu `Demo@123` — xem [seeds/README.md](../seeds/README.md)). Hàm `Goi` in một dòng `HTTP <mã>  <mã lỗi nghiệp vụ>`.

```powershell
function Goi([string]$PhuongThuc, [string]$Url, [string]$Token = "", [string]$Body = "") {
  $h = @()
  if ($Token) { $h = @("-H", "Authorization: Bearer $Token") }
  if ($Body) { $kq = @($Body | curl.exe -s -X $PhuongThuc $Url @h -H "Content-Type: application/json" --data-binary "@-" -w "`n%{http_code}") }
  else { $kq = @(curl.exe -s -X $PhuongThuc $Url @h -w "`n%{http_code}") }
  $trangThai = $kq[-1]
  $noiDung = ($kq[0..($kq.Count - 2)] -join "") | ConvertFrom-Json
  $chiTiet = "success=" + $noiDung.success
  if ($noiDung.code) { $chiTiet = $noiDung.code }
  "HTTP $trangThai  $chiTiet"
}
function LayToken([string]$Email) {
  $b = '{"email":"' + $Email + '","password":"Demo@123"}'
  ($b | curl.exe -s -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" --data-binary "@-" | ConvertFrom-Json).data.token
}
$khach = LayToken "khach1@demo.vn"; $ktv = LayToken "ktv1@demo.vn"; $admin = LayToken "admin@demo.vn"
```

Các lệnh đối chứng tạo dữ liệu thật trong CSDL đang dùng (tài khoản, đề xuất). Muốn chạy lại từ đầu, hoặc đổi sang phiên bản mã khác để so sánh: `npm run seed:reset` (xóa toàn bộ dữ liệu ứng dụng rồi tạo lại).

---

# Phần A — Bug phát hiện bởi test case

## BUG-01 — Đăng ký với số điện thoại có nhiều dấu cách bị lỗi 500

1. **Mã và mức độ:** BUG-01 · **MINOR** — chỉ xảy ra khi chuỗi số điện thoại (tính cả dấu cách, `.`, `-`) dài hơn 20 ký tự, tức dữ liệu hiếm; bỏ bớt dấu cách là đăng ký được, không lộ hay làm sai dữ liệu. Tuy vậy người dùng chỉ thấy "Lỗi hệ thống, vui lòng thử lại sau" (giao diện hiện thông điệp chung vì lỗi 500 không có `details`, [RegisterPage.jsx:31](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/2ba0157/frontend/src/pages/shared/RegisterPage.jsx#L31)) nên không biết phải sửa gì.
2. **Phát hiện bởi:** TC-24 — bước bổ sung S-24-12 và S-24-13 ([TC-24-fail.png](screenshots/TC-24-fail.png)).
3. **Triệu chứng:** `POST /api/auth/register` với `phone` = `"+0  9 0 1 2 3 4 5 6 7"` (10 chữ số, 21 ký tự) hoặc `"0 9 0 1 2 3 4 5 6 7 8 9"` (12 chữ số, 23 ký tự) trả `500 INTERNAL_ERROR` "Lỗi hệ thống, vui lòng thử lại sau"; mong đợi `201` hoặc `400 VALIDATION_ERROR`. Chuỗi đúng 20 ký tự (`"+0 9 0 1 2 3 4 5 6 7"`) vẫn `201` (S-24-11), nên lỗi nằm đúng ở ranh giới của cột.
4. **Cách tái lập:** (đã chạy phần "Chuẩn bị chung")

```powershell
Goi POST http://localhost:3000/api/auth/register "" '{"email":"bien01@example.com","password":"matkhau123","fullName":"Bien","phone":"+0  9 0 1 2 3 4 5 6 7","role":"CUSTOMER"}'
Goi POST http://localhost:3000/api/auth/register "" '{"email":"bien02@example.com","password":"matkhau123","fullName":"Bien","phone":"+0 9 0 1 2 3 4 5 6 7","role":"CUSTOMER"}'
```

   Kết quả trên **mã cũ** (`2ba0157`): lệnh đầu `HTTP 500  INTERNAL_ERROR`; lệnh thứ hai (đối chứng, đúng 20 ký tự) `HTTP 201  success=True`. Trên **mã mới** (`76b2752`): lệnh đầu `HTTP 400  VALIDATION_ERROR`; lệnh thứ hai vẫn `HTTP 201  success=True`.
5. **Nguyên nhân:** validator chỉ kiểm 9–15 chữ số **sau khi bỏ** khoảng trắng, `.`, `-` ([auth.validator.js:26-29](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/2ba0157/src/validators/auth.validator.js#L26-L29)), nhưng chuỗi thô đã `trim` được lưu nguyên vào cột `users.phone VARCHAR(20)` ([auth.service.js:27](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/2ba0157/src/services/auth.service.js#L27), [001_khoi_tao_csdl.sql:9](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/2ba0157/migrations/001_khoi_tao_csdl.sql#L9)). PostgreSQL từ chối: `value too long for type character varying(20)` (mã 22001). Khối `catch` của `dangKy` chỉ xử lý lỗi trùng email (mã 23505) rồi ném lại các lỗi khác, nên `xuLyLoi` đổi thành 500.
6. **Cách sửa:** `kiemTraDangKy` kiểm thêm độ dài của chuỗi đã `trim` (tính cả dấu cách) không quá 20 ký tự, khớp cột `users.phone`, và trả `400 VALIDATION_ERROR` kèm `details` cho trường `phone` ([hằng số tại dòng 7, kiểm tra tại dòng 31-32](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/validators/auth.validator.js#L31-L32)). Nhóm chọn kiểm độ dài thay vì lưu bản chuẩn hóa (chỉ chữ số và dấu `+`) để không đổi dữ liệu người dùng nhập.
7. **Link commit và xác nhận:** https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/caa7c2d — **ĐÃ ĐÓNG 2026-11-20** sau khi kiểm thử lại trên `main@76b2752`:
   - Lệnh ở dòng 4: lệnh đầu `HTTP 400  VALIDATION_ERROR` (trước: `500`), lệnh đối chứng `HTTP 201  success=True`; log server không còn dòng lỗi (trước: `value too long for type character varying(20)`).
   - Test hồi quy suite `BUG-01` (`tests/auth.test.js`): `node --test --test-concurrency=1 --test-name-pattern="BUG-01" tests/auth.test.js` → 2/2 pass (20 ký tự → `201`; 21 và 23 ký tự → `400`, `details` đúng trường `phone`).
   - TC-24: 13/13 bước bổ sung PASS; S-24-12 và S-24-13 chuyển từ `500` sang `400`. Ảnh sau khi sửa: [TC-24-pass.png](screenshots/sau-sua-loi/TC-24-pass.png); ảnh trước khi sửa: [TC-24-fail.png](screenshots/TC-24-fail.png).

## BUG-02 — Giá đề xuất 0,04 gây lỗi 500

1. **Mã và mức độ:** BUG-02 · **MINOR** — chỉ xảy ra với giá nhỏ hơn 0,05 (vô nghĩa với tiền VND), thường do nhập có chủ đích; không lộ hay làm sai dữ liệu đã lưu. Liên quan OBS-05: cùng cột làm tròn thầm lặng giá có nhiều hơn một chữ số thập phân.
2. **Phát hiện bởi:** TC-26 — bước bổ sung S-26-3 ([TC-26-fail.png](screenshots/TC-26-fail.png)).
3. **Triệu chứng:** `POST /api/proposals` với `price` = `0.04` trả `500 INTERNAL_ERROR`; mong đợi `201` hoặc `400 VALIDATION_ERROR`. Đối chứng ở mã cũ: `0.1` → `201` (S-26-5); `0.05` → `201` nhưng giá lưu là `0.1` (S-26-4).
4. **Cách tái lập:** (tin có mã 2 là "Máy giặt không vắt được", Chờ đề xuất, chưa có đề xuất nào — theo [seeds/README.md](../seeds/README.md))

```powershell
Goi POST http://localhost:3000/api/proposals $ktv '{"requestId":2,"price":0.04,"description":"Bien gia"}'
Goi POST http://localhost:3000/api/proposals $ktv '{"requestId":2,"price":0.1,"description":"Bien gia"}'
```

   Kết quả trên **mã cũ**: lệnh đầu `HTTP 500  INTERNAL_ERROR`; lệnh thứ hai (đối chứng) `HTTP 201  success=True`. Trên **mã mới**: lệnh đầu `HTTP 400  VALIDATION_ERROR`; lệnh thứ hai vẫn `HTTP 201  success=True` (chạy lại lần hai sẽ báo `ALREADY_PROPOSED` — dùng `npm run seed:reset` để dọn).
5. **Nguyên nhân:** validator chỉ yêu cầu `price` là số hữu hạn lớn hơn 0 ([proposal.validator.js:11-13](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/2ba0157/src/validators/proposal.validator.js#L11-L13)), nhưng cột `proposal.price` là `DECIMAL(15,1) NOT NULL CHECK (price > 0)` ([001_khoi_tao_csdl.sql:34](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/2ba0157/migrations/001_khoi_tao_csdl.sql#L34)): 0,04 bị làm tròn thành 0,0 nên vi phạm ràng buộc — `new row for relation "proposal" violates check constraint "proposal_price_check"` (mã 23514). `guiDeXuat` chỉ bắt mã 23505 nên lỗi lọt ra thành 500.
6. **Cách sửa:** đặt giá tối thiểu 0,1 (`GIA_TOI_THIEU`, khớp độ chính xác `DECIMAL(15,1)`) trong `kiemTraTruongDeXuat`, trả `400 VALIDATION_ERROR` ở trường `price` với thông điệp "Giá đề xuất tối thiểu 0,1" ([hằng số tại dòng 5, kiểm tra tại dòng 16-17](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/validators/proposal.validator.js#L16-L17)). Validator này dùng chung cho gửi đề xuất (`POST`) và sửa đề xuất (`PATCH`) nên cả hai được sửa cùng lúc. Chưa đổi cách xử lý giá có nhiều chữ số thập phân nên **OBS-05 còn mở một phần** (Phần B).
7. **Link commit và xác nhận:** https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/6c1ffd2 — **ĐÃ ĐÓNG 2026-11-20** sau khi kiểm thử lại trên `main@76b2752`:
   - Lệnh ở dòng 4: lệnh đầu `HTTP 400  VALIDATION_ERROR` (trước: `500`), lệnh đối chứng `HTTP 201  success=True`; log server không còn dòng lỗi (trước: `violates check constraint "proposal_price_check"`).
   - Test hồi quy suite `BUG-02` (`tests/proposal.test.js`): `node --test --test-concurrency=1 --test-name-pattern="BUG-02" tests/proposal.test.js` → 2/2 pass (`POST` giá 0,04 → `400`, 0,1 → `201`; `PATCH` giá 0,04 → `400` và giá đã lưu giữ nguyên 350000).
   - TC-26: 21/21 bước bổ sung PASS; S-26-3 chuyển từ `500` sang `400`. Ảnh sau khi sửa: [TC-26-pass.png](screenshots/sau-sua-loi/TC-26-pass.png); ảnh trước khi sửa: [TC-26-fail.png](screenshots/TC-26-fail.png).
   - Quan sát thêm: S-26-4 (`0.05`) trước đây trả `201` và lưu thành `0.1`, nay trả `400`; S-26-6 (`350000.55`) vẫn trả `201` và lưu `350000.6` (OBS-05).

## BUG-03 — Mã định danh vượt phạm vi `int4` gây lỗi 500 ở 15 endpoint

1. **Mã và mức độ:** BUG-03 · **MINOR** — mã từ 2147483648 trở lên không thể tồn tại trong dữ liệu thật; chỉ gặp khi tự sửa URL hoặc thân yêu cầu; không lộ dữ liệu. Nhưng lỗi lặp lại ở 15 endpoint và sinh nhiều dòng lỗi trong log server, che mất lỗi thật.
2. **Phát hiện bởi:** TC-27 — bước bổ sung S-27-2…S-27-11, tức 10 endpoint ([TC-27-fail.png](screenshots/TC-27-fail.png)). Khi sửa, nhóm rà soát mọi endpoint nhận mã và tìm thêm **5 endpoint** cùng lỗi; cả 5 đã được xác nhận trả 500 trên mã cũ bằng các lệnh ở dòng 4 (ngày 2026-11-20).
3. **Triệu chứng:** với mã `2147483648` cả 15 endpoint trong bảng ở dòng 4 trả `500 INTERNAL_ERROR`; mong đợi `404 *_NOT_FOUND`. Mã `2147483647` (lớn nhất của `int4`) trả `404 REQUEST_NOT_FOUND` đúng (S-27-1).
4. **Cách tái lập:** (đã chạy phần "Chuẩn bị chung")

```powershell
Goi GET http://localhost:3000/api/requests/2147483647 $khach
Goi GET http://localhost:3000/api/requests/2147483648 $khach
Goi PATCH http://localhost:3000/api/requests/2147483648 $khach '{"title":"Tieu de moi"}'
Goi PATCH http://localhost:3000/api/requests/2147483648/close $khach
Goi PATCH http://localhost:3000/api/requests/2147483648/complete $khach
Goi GET http://localhost:3000/api/proposals/2147483648 $khach
Goi PATCH http://localhost:3000/api/proposals/2147483648 $ktv '{"price":1000}'
Goi PATCH http://localhost:3000/api/proposals/2147483648/close $ktv
Goi PATCH http://localhost:3000/api/proposals/2147483648/accept $khach
Goi GET http://localhost:3000/api/proposals/request/2147483648 $khach
Goi POST http://localhost:3000/api/proposals $ktv '{"requestId":2147483648,"price":1000,"description":"x"}'
Goi POST http://localhost:3000/api/reviews $khach '{"requestId":2147483648,"rating":5}'
Goi GET http://localhost:3000/api/reviews/user/2147483648 $khach
Goi PATCH http://localhost:3000/api/admin/users/2147483648/lock $admin
Goi PATCH http://localhost:3000/api/admin/users/2147483648/unlock $admin
Goi PATCH http://localhost:3000/api/notifications/2147483648/read $ktv
```

   Mỗi lệnh in một dòng, theo đúng thứ tự trong khối. Kết quả (16 lệnh: 1 đối chứng và 15 endpoint):

| # | Endpoint (mã `{id}` = 2147483648) | Vai trò gọi | Bước TC-27 | Mã cũ `2ba0157` | Mã mới `76b2752` |
|---:|---|---|---|---|---|
| 0 | GET /api/requests/2147483647 — đối chứng, mã lớn nhất của `int4` | khách hàng | đối chứng | `404 REQUEST_NOT_FOUND` | `404 REQUEST_NOT_FOUND` |
| 1 | GET /api/requests/{id} | khách hàng | S-27-2 | `500 INTERNAL_ERROR` | `404 REQUEST_NOT_FOUND` |
| 2 | PATCH /api/requests/{id} | khách hàng | — | `500 INTERNAL_ERROR` | `404 REQUEST_NOT_FOUND` |
| 3 | PATCH /api/requests/{id}/close | khách hàng | S-27-9 | `500 INTERNAL_ERROR` | `404 REQUEST_NOT_FOUND` |
| 4 | PATCH /api/requests/{id}/complete | khách hàng | — | `500 INTERNAL_ERROR` | `404 REQUEST_NOT_FOUND` |
| 5 | GET /api/proposals/{id} | khách hàng | S-27-3 | `500 INTERNAL_ERROR` | `404 PROPOSAL_NOT_FOUND` |
| 6 | PATCH /api/proposals/{id} | kỹ thuật viên | — | `500 INTERNAL_ERROR` | `404 PROPOSAL_NOT_FOUND` |
| 7 | PATCH /api/proposals/{id}/close (rút đề xuất) | kỹ thuật viên | — | `500 INTERNAL_ERROR` | `404 PROPOSAL_NOT_FOUND` |
| 8 | PATCH /api/proposals/{id}/accept | khách hàng | S-27-4 | `500 INTERNAL_ERROR` | `404 PROPOSAL_NOT_FOUND` |
| 9 | GET /api/proposals/request/{id} | khách hàng | S-27-5 | `500 INTERNAL_ERROR` | `404 REQUEST_NOT_FOUND` |
| 10 | POST /api/proposals (`requestId` trong thân) | kỹ thuật viên | S-27-10 | `500 INTERNAL_ERROR` | `404 REQUEST_NOT_FOUND` |
| 11 | POST /api/reviews (`requestId` trong thân) | khách hàng | S-27-11 | `500 INTERNAL_ERROR` | `404 REQUEST_NOT_FOUND` |
| 12 | GET /api/reviews/user/{id} | khách hàng | S-27-8 | `500 INTERNAL_ERROR` | `404 USER_NOT_FOUND` |
| 13 | PATCH /api/admin/users/{id}/lock | quản trị viên | S-27-6 | `500 INTERNAL_ERROR` | `404 USER_NOT_FOUND` |
| 14 | PATCH /api/admin/users/{id}/unlock | quản trị viên | — | `500 INTERNAL_ERROR` | `404 USER_NOT_FOUND` |
| 15 | PATCH /api/notifications/{id}/read | kỹ thuật viên | S-27-7 | `500 INTERNAL_ERROR` | `404 NOTIFICATION_NOT_FOUND` |

   Cột "Bước TC-27" ghi bước bổ sung đã phát hiện endpoint đó ở lần kiểm thử 1; dấu "—" là 5 endpoint do nhóm sửa lỗi rà soát thêm.
5. **Nguyên nhân:** `docMaSo` chỉ kiểm `Number.isInteger(so) && so > 0` ([request.service.js:7-11](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/2ba0157/src/services/request.service.js#L7-L11)), tức cho qua mọi số nguyên dương, rồi đưa thẳng vào `WHERE id = $1` trên cột `INT` (`int4`). Các service khác dùng lại hàm này (`proposal.service.js` dòng 49 và 85, `review.service.js` dòng 47) nên cùng bị lỗi; `admin.service.js` ([dòng 13-14](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/2ba0157/src/services/admin.service.js#L13-L14)) và `notification.service.js` ([dòng 29-30](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/2ba0157/src/services/notification.service.js#L29-L30)) tự kiểm tra theo cách tương tự; hai validator của thân yêu cầu ([proposal.validator.js:31](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/2ba0157/src/validators/proposal.validator.js#L31), [review.validator.js:5](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/2ba0157/src/validators/review.validator.js#L5)) chỉ yêu cầu `requestId` là số nguyên dương. PostgreSQL: `value "2147483648" is out of range for type integer` (mã 22003).
6. **Cách sửa:** gom thành một hàm đọc mã số dùng chung `docMaSo` trong tệp mới [src/utils/ma-so.js](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/utils/ma-so.js#L6-L10): mã không hợp lệ hoặc lớn hơn `ID_TOI_DA = 2147483647` ([constants.js:25-26](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/utils/constants.js#L25-L26)) được coi là không tồn tại và trả `404`, thay cho các đoạn kiểm tra sao chép ở `request.service.js`, `admin.service.js` ([dòng 14](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/services/admin.service.js#L14)) và `notification.service.js` ([dòng 30](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/services/notification.service.js#L30)). Hai thân yêu cầu (`POST /api/proposals`, `POST /api/reviews`) cũng đi qua hàm này nên trả `404 REQUEST_NOT_FOUND`, không phải `400`.
7. **Link commit và xác nhận:** https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/d49d654 — **ĐÃ ĐÓNG 2026-11-20** sau khi kiểm thử lại trên `main@76b2752`:
   - Lệnh ở dòng 4: 15/15 endpoint trả `404` đúng mã `*_NOT_FOUND` như bảng trên (trước: 15/15 trả `500`); log server không còn dòng lỗi (trước: 15 dòng `value "2147483648" is out of range for type integer`).
   - Test hồi quy suite `BUG-03` (`tests/ma-so.test.js`) gọi cả 15 endpoint với mã 2147483648 và 2147483647: `node --test --test-concurrency=1 --test-name-pattern="BUG-0[34]" tests/ma-so.test.js tests/request.test.js` → 4/4 pass (2 test của BUG-03 và 2 test của BUG-04).
   - TC-27: 21 PASS, 0 FAIL, 1 quan sát (S-27-16, OBS-04). S-27-2…S-27-11 chuyển từ `500` sang `404`. Ảnh sau khi sửa: [TC-27-pass.png](screenshots/sau-sua-loi/TC-27-pass.png); ảnh trước khi sửa: [TC-27-fail.png](screenshots/TC-27-fail.png).

## BUG-04 — Tham số `page` quá lớn gây lỗi 500

1. **Mã và mức độ:** BUG-04 · **MINOR** — chỉ xảy ra khi tự gõ `page` rất lớn (từ khoảng 10¹⁸ trở lên); không lộ hay làm sai dữ liệu.
2. **Phát hiện bởi:** TC-27 — bước bổ sung S-27-22 ([TC-27-fail.png](screenshots/TC-27-fail.png)).
3. **Triệu chứng:** `GET /api/requests/my?page=9999999999999999999&size=10` trả `500 INTERNAL_ERROR`; mong đợi `200` với danh sách rỗng hoặc `400`. Đối chiếu: `page=999` → `200`, danh sách rỗng (S-27-21). Hàm đọc phân trang dùng chung cho các API danh sách khác (tin, tài khoản, đề xuất, thông báo, đánh giá) nhưng ở lần kiểm thử 1 mới thử trên API này.
4. **Cách tái lập:** (đã chạy phần "Chuẩn bị chung")

```powershell
Goi GET "http://localhost:3000/api/requests/my?page=999&size=10" $khach
Goi GET "http://localhost:3000/api/requests/my?page=9999999999999999999&size=10" $khach
```

   Kết quả trên **mã cũ**: lệnh đầu (đối chứng) `HTTP 200  success=True`; lệnh sau `HTTP 500  INTERNAL_ERROR`. Trên **mã mới**: cả hai lệnh `HTTP 200  success=True`.
5. **Nguyên nhân:** `docThamSoPhanTrang` tính `viTriBatDau = (trang − 1) × kichThuoc` mà không giới hạn trên ([response.js:10-17](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/2ba0157/src/utils/response.js#L10-L17)); giá trị khoảng 10²⁰ làm `OFFSET` tràn kiểu `bigint` — `value "100000000000000000000" is out of range for type bigint` (mã 22003).
6. **Cách sửa:** `docThamSoPhanTrang` kẹp `page` trong khoảng 1 đến `trangToiDa` = 1.000.000 ([response.js:11-12](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/utils/response.js#L11-L12), [constants.js:28](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/utils/constants.js#L28)). `page` quá lớn trả `200` với danh sách rỗng và `meta.page` là 1.000.000; `page` hợp lệ không đổi hành vi.
7. **Link commit và xác nhận:** https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/ae3e017 — **ĐÃ ĐÓNG 2026-11-20** sau khi kiểm thử lại trên `main@76b2752`:
   - Lệnh ở dòng 4: cả hai lệnh `HTTP 200  success=True` (trước: lệnh sau `500`); log server không còn dòng lỗi (trước: `out of range for type bigint`).
   - Test hồi quy suite `BUG-04` (`tests/request.test.js`) kiểm cả bốn API danh sách dùng chung (tin của tôi, tin Chờ đề xuất cho kỹ thuật viên, thông báo, tài khoản của quản trị viên): `page` cực lớn → `200`, `data` rỗng, `meta.page` = 1000000; `page` = 1000000 và 999 vẫn đúng. Chạy cùng lệnh với BUG-03 ở trên (4/4 pass).
   - TC-27: S-27-22 chuyển từ `500` sang `200`. Ảnh sau khi sửa: [TC-27-pass.png](screenshots/sau-sua-loi/TC-27-pass.png); ảnh trước khi sửa: [TC-27-fail.png](screenshots/TC-27-fail.png). Lần kiểm thử lại bằng lệnh và bước bổ sung chỉ gọi `GET /api/requests/my`; ba API còn lại được kiểm bằng test hồi quy.

## BUG-05 — Thân yêu cầu lớn hơn 100 KB trả 500 thay vì 413

1. **Mã và mức độ:** BUG-05 · **MINOR** — mô tả dài hơn 100 KB không thực tế với người dùng bình thường; không lộ hay làm sai dữ liệu. Lỗi nằm ở tầng đọc thân yêu cầu nên áp dụng cho mọi API nhận JSON.
2. **Phát hiện bởi:** TC-28 — bước bổ sung S-28-7 ([TC-28-fail.png](screenshots/TC-28-fail.png)).
3. **Triệu chứng:** `POST /api/requests` với `description` dài 150.000 ký tự trả `500 INTERNAL_ERROR`; mong đợi `413` hoặc `400`. Đối chứng: thân 50.000 ký tự vẫn `201` (S-25-7). Lỗi xảy ra ở bước đọc thân, trước cả bước xác thực.
4. **Cách tái lập:** (đã chạy phần "Chuẩn bị chung")

```powershell
$lon = '{"title":"Tin lon","description":"' + ('a' * 150000) + '","category":"Dien lanh","location":"Quan 7","preferredTime":"2026-12-05T09:00:00Z"}'
Goi POST http://localhost:3000/api/requests $khach $lon
```

   Kết quả trên **mã cũ**: `HTTP 500  INTERNAL_ERROR`. Trên **mã mới**: `HTTP 400  VALIDATION_ERROR`.
5. **Nguyên nhân:** `app.use(express.json())` ([app.js:10](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/2ba0157/src/app.js#L10)) dùng giới hạn mặc định 100 KB; thân lớn hơn làm thư viện ném `PayloadTooLargeError: request entity too large` (`type: 'entity.too.large'`, mã 413). `xuLyLoi` chỉ ánh xạ `entity.parse.failed` ([error-handler.js:27-28](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/2ba0157/src/utils/error-handler.js#L27-L28)); mọi lỗi khác đều thành 500 ([dòng 29-31](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/2ba0157/src/utils/error-handler.js#L29-L31)).
6. **Cách sửa:** `xuLyLoi` ánh xạ `entity.too.large` sang `400 VALIDATION_ERROR` với thông điệp "Dữ liệu gửi lên quá lớn (tối đa 100 KB)" ([error-handler.js:29-31](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/utils/error-handler.js#L29-L31)). Commit thứ hai mở rộng cho mọi lỗi đọc thân yêu cầu khác của body-parser có mã 4xx — kiểm tra thêm thấy `charset=latin1` và `Content-Encoding` không hỗ trợ cũng trả 500 — sang `400 VALIDATION_ERROR` ([dòng 32-34](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/utils/error-handler.js#L32-L34)). Nhóm dùng `400` (đã có trong [api-contract.md](api-contract.md)) thay vì thêm mã `413`, nên không phải sửa API contract.
7. **Link commit và xác nhận:** https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/438a449 và https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/2f05954 — **ĐÃ ĐÓNG 2026-11-20** sau khi kiểm thử lại trên `main@76b2752`:
   - Lệnh ở dòng 4: `HTTP 400  VALIDATION_ERROR` (trước: `500`); log server không còn dòng lỗi (trước: `PayloadTooLargeError: request entity too large`).
   - Test hồi quy suite `BUG-05` (`tests/request.test.js`): `node --test --test-concurrency=1 --test-name-pattern="BUG-05" tests/request.test.js` → 3/3 pass (150.000 ký tự → `400` đúng thông điệp; lỗi áp dụng cả cho đăng ký, còn 50.000 ký tự vẫn `201`; `charset=latin1` và `Content-Encoding` lạ → `400`).
   - TC-28: 9/9 bước bổ sung PASS; S-28-7 chuyển từ `500` sang `400`. Ảnh sau khi sửa: [TC-28-pass.png](screenshots/sau-sua-loi/TC-28-pass.png); ảnh trước khi sửa: [TC-28-fail.png](screenshots/TC-28-fail.png).

---

# Phần A (bổ sung 2026-11-26) — Bug phát hiện khi kiểm thử bảo mật và chạy Docker

Năm bug dưới đây do đợt kiểm bảo mật ngày 26/11/2026 phát hiện trên bản `a9466b7` ([checklist-bao-mat.md](checklist-bao-mat.md)). Cách tái lập dùng `docker compose` hoặc `node scripts/kiem-tra-bao-mat.js`; ảnh chụp trước và sau khi sửa nằm trong báo cáo `BaoCaoKiemThu.docx`, Mục 5. Mỗi bug một commit riêng; link commit ở dòng 7 của từng bug.

## BUG-06 — Dừng CSDL làm tiến trình API thoát

- **Mã và mức độ:** BUG-06 · **Major** — dịch vụ chết khi CSDL khởi động lại hoặc mất kết nối, chặn mọi chức năng cho tới khi bật lại thủ công.
- **Phát hiện bởi:** TC-35 (bước "tắt CSDL rồi gọi API" của đề), chạy trên Docker.
- **Triệu chứng:** `docker compose stop db` thì container `api` chuyển `Exited (1)`; gọi API sau đó không kết nối được (curl `000`) thay vì nhận `500 INTERNAL_ERROR` gọn.
- **Cách tái lập:** `cp .env.example .env`; `docker compose up -d --build`; `docker compose stop db`; `curl.exe -s -o NUL -w "%{http_code}" -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{\"email\":\"khach1@demo.vn\",\"password\":\"Demo@123\"}'`; `docker compose ps -a`. Nhật ký `api`: `Unhandled 'error' event … Emitted 'error' event on BoundPool instance`.
- **Nguyên nhân gốc:** [src/db.js](../src/db.js) tạo `Pool` mà không lắng nghe sự kiện `error`. Kết nối rảnh bị PostgreSQL cắt (`terminating connection due to administrator command`) phát `error` lên pool; không có trình lắng nghe thì Node coi là ngoại lệ chưa bắt và thoát tiến trình.
- **Cách sửa:** thêm `pool.on('error', …)` chỉ ghi thông điệp lỗi (không ghi chuỗi kết nối); pool tự tạo kết nối mới ở lần truy vấn sau.
- **Commit và xác nhận:** [8edee39](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/8edee39) · chạy lại: `api` vẫn `healthy` khi `db` dừng, đăng nhập trả `500 INTERNAL_ERROR` rồi `200` ngay khi `db` bật lại; `npm test` 157/157.

## BUG-07 — Token ký thuật toán khác HS256 vẫn được chấp nhận

- **Mã và mức độ:** BUG-07 · **Minor** — cần biết khóa mới giả được token nên chưa vượt quyền được, nhưng trái yêu cầu "chỉ định rõ thuật toán" của đề.
- **Phát hiện bởi:** TC-38 (A07) và A6 mục 3.
- **Triệu chứng:** token HS512 ký đúng khóa gọi `GET /api/auth/me` nhận `200`.
- **Cách tái lập:** `node -e "console.log(require('jsonwebtoken').sign({userId:2,role:'CUSTOMER'}, process.env.JWT_SECRET, {algorithm:'HS512'}))"` rồi gửi token đó trong tiêu đề `Authorization: Bearer`.
- **Nguyên nhân gốc:** `jwt.verify(token, secret)` ở [auth.middleware.js](../src/middlewares/auth.middleware.js) không truyền `algorithms`, nên chấp nhận mọi thuật toán HMAC.
- **Cách sửa:** `jwt.verify(…, { algorithms: ['HS256'] })` và `jwt.sign(…, { algorithm: 'HS256' })` ([auth.service.js](../src/services/auth.service.js)).
- **Commit và xác nhận:** [c0e6cbf](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/c0e6cbf) · chạy lại TC-38: token HS512 → `401`; token HS256 đăng nhập thường vẫn `200`; `npm test` 157/157.

## BUG-08 — Khóa JWT ngắn vẫn được chấp nhận

- **Mã và mức độ:** BUG-08 · **Minor** — khóa ngắn dễ bị dò hàng loạt.
- **Phát hiện bởi:** A6 mục 2 ("`JWT_SECRET` dài ít nhất 32 ký tự, hệ thống dừng khi thiếu").
- **Triệu chứng:** backend khởi động bình thường với `JWT_SECRET=ngan`.
- **Cách tái lập:** `node -e "process.env.JWT_SECRET='ngan'; require('./src/config/env')"` không báo lỗi.
- **Nguyên nhân gốc:** [src/config/env.js](../src/config/env.js) chỉ kiểm khóa có tồn tại, không kiểm độ dài.
- **Cách sửa:** từ chối khóa ngắn hơn 32 ký tự (mức 256 bit của RFC 7518 cho HS256) kèm lệnh tạo khóa mới.
- **Commit và xác nhận:** [e7ac722](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/e7ac722) · chạy lại: khóa `ngan` → `Error: JWT_SECRET quá ngắn`, khóa rỗng → `Thiếu biến môi trường JWT_SECRET`, khóa mẫu 41 ký tự nạp được; `npm test` 157/157.

## BUG-09 — Phản hồi HTTP lộ thông tin không cần thiết

- **Mã và mức độ:** BUG-09 · **Minor** — lộ tên framework và phản chiếu lại chuỗi truy vấn của người gọi.
- **Phát hiện bởi:** TC-35 (A02) và TC-38 (token trong URL).
- **Triệu chứng:** mọi phản hồi có `X-Powered-By: Express`; `GET /api/auth/me?token=abc.def.ghi` trả `"path":"/api/auth/me?token=abc.def.ghi"`, tức token đặt nhầm vào URL bị trả ngược trong thân phản hồi (và dễ đi vào nhật ký của proxy).
- **Cách tái lập:** `curl.exe -s -i http://localhost:3000/api/health` (xem tiêu đề); `curl.exe -s "http://localhost:3000/api/auth/me?token=abc.def.ghi"`.
- **Nguyên nhân gốc:** [src/app.js](../src/app.js) để Express bật `X-Powered-By` mặc định; [error-handler.js](../src/utils/error-handler.js) ghi `req.originalUrl` nguyên chuỗi truy vấn vào trường `path`.
- **Cách sửa:** `app.disable('x-powered-by')`; `path: req.originalUrl.split('?')[0]`.
- **Commit và xác nhận:** [796953d](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/796953d) · chạy lại: không còn `X-Powered-By`; `path` = `/api/auth/me`; hai test cũ kiểm `path` vẫn PASS, `npm test` 157/157.

## BUG-10 — Bí mật ghi cứng trong `docker-compose.yml`, `.env.example` để trống

- **Mã và mức độ:** BUG-10 · **Major** — nếu triển khai nguyên trạng, ai biết khóa mặc định công khai trong repo đều ký được token quản trị viên.
- **Phát hiện bởi:** mục 1 của checklist (rà secret trong repo và lịch sử) và phép thử máy trắng của Week 8 (`cp .env.example .env` rồi `docker compose up -d --build`).
- **Triệu chứng:** `docker-compose.yml` ghi cứng `POSTGRES_PASSWORD: nhom03` và `JWT_SECRET: ${JWT_SECRET:-khoa-jwt-chi-dung-khi-phat-trien-bang-docker}`; `.env.example` để trống mọi giá trị nên cài tay phải tự điền; dữ liệu mẫu phải chạy thêm một lệnh thứ ba.
- **Cách tái lập:** `git log -p --all | Select-String "khoa-jwt-chi-dung|POSTGRES_PASSWORD: nhom03"` (ảnh M1).
- **Nguyên nhân gốc:** cấu hình phát triển được viết thẳng vào tệp compose cho tiện chạy.
- **Cách sửa:** compose đọc `DB_PASSWORD` và `JWT_SECRET` từ `.env` và dừng, báo rõ, nếu thiếu; `.env.example` có giá trị mẫu chạy được; `api` tự nạp dữ liệu mẫu nếu CSDL còn trống (`npm run seed -- --neu-chua-co`, khởi động lại thì bỏ qua); thêm healthcheck cho `web`.
- **Commit và xác nhận:** [0684afd](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/commit/0684afd) · chạy lại trên bản sao sạch: `cp .env.example .env` rồi `docker compose up -d --build` mất 64 giây, cả `db`, `api`, `web` `healthy`, 247 tài khoản/1050 tin tự nạp, khởi động lại `api` không lỗi, `npm test` 157/157 trong container PostgreSQL 16.16. Khóa mặc định cũ không còn được dùng ở đâu.

---

# Phần B — Lệch so với tiêu chí, ghi nhận và hạn chế khác

Không phải bug đã chốt. **DEV** = hành vi khác tiêu chí chấp nhận trong `ProductBacklog_Nhom03.xlsx`; **UI** = phát hiện khi rà soát mã giao diện (đã xác minh trên trình duyệt ngày 26/11/2026); **TD** = chất lượng của chính bộ test; **OBS** = ghi nhận, không tính là FAIL. Mỗi mục gồm: **Mức độ · Phát hiện bởi · Triệu chứng · Nguyên nhân gốc · Cách xử lý · File ảnh hưởng**. Ngày 26/11/2026 mỗi mục đã có quyết định chốt (bảng ngay dưới); các liên kết mã nguồn dưới đây gắn với commit `76b2752` nên không lệch dòng khi mã thay đổi về sau.

**Quyết định chốt ngày 2026-11-26.** Mỗi mục có một quyết định kèm lý do; nội dung từng mục bên dưới giữ nguyên như lúc ghi ngày 20/11/2026 (liên kết mã nguồn vẫn gắn với `76b2752`). Mọi mục chỉ thuộc loại ghi nhận hoặc chấp nhận có lý do, không còn mục nào để ngỏ.

| Mục | Quyết định | Lý do và minh chứng |
|---|---|---|
| DEV-01 | Chấp nhận; sửa tiêu chí US03 thành "đăng xuất xóa phiên ở phía người dùng, token hết hạn sau 1 ngày" | Thu hồi token cần thêm trạng thái phía máy chủ ở mọi lần xác thực. Rủi ro đã giảm: hạn token cấu hình được (`JWT_EXPIRES_IN`), khóa tài khoản có hiệu lực ngay (TC-38), giao diện xóa token (TC-45). TC-03: FAIL theo tiêu chí gốc, PASS theo tiêu chí đã cập nhật |
| DEV-02 | Chấp nhận; sửa tiêu chí US15 thành "chủ tin hoặc kỹ thuật viên đã gửi đề xuất đó" | Chuông thông báo cần mở đề xuất. Người khác vẫn bị `403` (TC-34: kỹ thuật viên B xem đề xuất của A). TC-15: PASS theo tiêu chí đã cập nhật |
| DEV-03 | Giữ `WITHDRAWN`; tiêu chí US23 đổi theo | Tên đã dùng ở API, CSDL, giao diện; [api-contract.md](api-contract.md) đã liệt kê đủ tập trạng thái đề xuất |
| UI-01 | Xác minh trên trình duyệt và giữ chuyển hướng im lặng | TC-41 (Chrome 158, bản Docker): sai vai trò và chưa đăng nhập đều được chuyển thẳng về màn chính của vai trò hoặc `#/login`, không hiện nội dung bị cấm. Màn bị cấm không có lối đi trên thanh điều hướng của vai trò đó; quyền thật do backend chặn (`403`, TC-34 và bước gọi thẳng API trong TC-41) |
| TD-01 | Ghi nhận hạn chế đã biết | `npm test` luôn chạy cả bộ theo thứ tự cố định nên ổn định (157/157 ở mọi lần chạy ngày 26/11); chỉ người chạy riêng một suite phải kèm suite tiền đề |
| OBS-01 | Giới hạn đặt ở reverse proxy, không đặt trong ứng dụng | Khóa theo email cho kẻ tấn công khóa nạn nhân; giới hạn theo IP trong ứng dụng sai sau proxy và gộp người dùng chung NAT. Nginx `limit_req` đã chạy thử: 12 lần sai → `401` ×6 rồi `429` ×6 ([deployment-guide.md](deployment-guide.md) mục 8) |
| OBS-02 | Giữ | Ô chọn ngày của giao diện đã chặn ngày quá khứ (`min` = hôm nay); API chấp nhận vì dữ liệu mẫu cố ý có tin quá hạn và US06 không yêu cầu |
| OBS-03 | Giữ | Chỉ ảnh hưởng độ chính xác bộ lọc; `%` trả đúng những tin mà người gọi vốn được xem, không lộ gì thêm. Chuỗi SQL ở bộ lọc cho 0 bản ghi (TC-37) |
| OBS-04 | Giữ | `0x1`, `1.0` vẫn đi qua kiểm tra chủ sở hữu (TC-34) nên không vượt quyền, chỉ là nhiều cách viết cho một mã |
| OBS-05 | Giữ; ghi rõ vào API docs | Cột giá là `DECIMAL(15,1)`; tiền VND không có phần thập phân và ô nhập giá của giao diện dùng bàn phím số (ví dụ 450000). Báo cáo Mục 6 ghi trong ghi chú của `POST /api/proposals` |
| OBS-06 | Đã thống nhất tài liệu | [api-contract.md](api-contract.md) nay ghi `page` bắt đầu từ 1 |

## DEV-01. Token cũ vẫn dùng được sau khi đăng xuất

- **Mức độ:** Chấp nhận — quyết định thiết kế đã ghi trong [project-notes.md](project-notes.md) (Sprint 2, "Đăng xuất (US03)"). Rủi ro: token bị lộ vẫn dùng được đến khi hết hạn (mặc định 1 ngày).
- **Phát hiện bởi:** TC-03 bước B3 — S-03-3 ([TC-03-fail.png](screenshots/TC-03-fail.png)); làm TC-03 FAIL. Chạy lại ngày 2026-11-20 trên `main@76b2752`: S-03-3 vẫn FAIL (bước FAIL duy nhất của 129 bước).
- **Triệu chứng:** tiêu chí US03 viết "Hệ thống kết thúc phiên". Sau `POST /api/auth/logout`, gọi lại `GET /api/auth/me` bằng chính token đó vẫn trả `200`.
- **Nguyên nhân gốc:** JWT không lưu phiên ở server; `dangXuat` chỉ trả thành công ([auth.controller.js:22-25](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/controllers/auth.controller.js#L22-L25)) và middleware chỉ kiểm chữ ký, hạn dùng, người dùng còn tồn tại và chưa bị khóa ([auth.middleware.js](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/middlewares/auth.middleware.js)). Giao diện xóa token ở trình duyệt.
- **Cách xử lý:** chấp nhận và sửa tiêu chí US03 trong backlog; nếu muốn đúng tiêu chí thì thêm danh sách thu hồi token hoặc cột `tokenVersion` trong bảng `users`.
- **File ảnh hưởng:** `src/controllers/auth.controller.js`, `src/middlewares/auth.middleware.js`, tiêu chí US03 trong [product-backlog-nhom03.md](product-backlog-nhom03.md).

## DEV-02. Kỹ thuật viên đã gửi đề xuất cũng xem được chi tiết đề xuất

- **Mức độ:** Chấp nhận — quyết định thiết kế đã ghi trong [project-notes.md](project-notes.md) (giao diện Sprint 3, "US15"): chuông thông báo cần mở đề xuất để lấy mã tin.
- **Phát hiện bởi:** TC-15 bước B3 ([TC-15-fail.png](screenshots/TC-15-fail.png)); làm TC-15 FAIL (kết luận do đối chiếu tiêu chí, test tự động vẫn PASS).
- **Triệu chứng:** tiêu chí US15 "Chỉ chủ tin mới được xem". Thực tế kỹ thuật viên gửi đề xuất gọi `GET /api/proposals/{id}` nhận `200`; khách hàng khác và kỹ thuật viên không liên quan nhận `403 NOT_OWNER` (đúng).
- **Nguyên nhân gốc:** `layChiTietDeXuat` cho phép cả chủ tin lẫn người gửi đề xuất ([proposal.service.js:88-96](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/services/proposal.service.js#L88-L96)).
- **Cách xử lý:** chấp nhận và sửa tiêu chí thành "chủ tin hoặc kỹ thuật viên đã gửi đề xuất".
- **File ảnh hưởng:** `src/services/proposal.service.js`, tiêu chí US15 trong [product-backlog-nhom03.md](product-backlog-nhom03.md).

## DEV-03. Trạng thái đề xuất đã rút là `WITHDRAWN`, tiêu chí ghi `DA_RUT`

- **Mức độ:** Ghi nhận — chỉ lệch tên giá trị, cùng ngữ nghĩa; TC-23 vẫn PASS.
- **Phát hiện bởi:** TC-23 bước B1.
- **Triệu chứng:** tiêu chí US23 "cập nhật trạng thái đề xuất thành DA_RUT"; API và CSDL trả `WITHDRAWN`.
- **Nguyên nhân gốc:** `DA_RUT` là tên hằng số nội bộ của mã nguồn, giá trị là `'WITHDRAWN'` ([constants.js:18](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/utils/constants.js#L18)); [api-contract.md](api-contract.md) chưa liệt kê tập trạng thái của đề xuất.
- **Cách xử lý:** cập nhật tiêu chí US23 và api-contract cho thống nhất.
- **File ảnh hưởng:** `src/utils/constants.js` (không cần sửa), tiêu chí US23, `docs/api-contract.md`.

## UI-01. Người sai vai trò bị chuyển hướng im lặng, không hiện thông báo "không có quyền"

- **Mức độ:** Minor (dự kiến) — **chưa xác minh trên trình duyệt**, chỉ thấy khi rà soát mã.
- **Phát hiện bởi:** TC-04 bước B2, phần giao diện ([báo cáo §5](test-report.md), dòng US04-S2).
- **Triệu chứng:** tiêu chí US04 "Hệ thống từ chối và hiển thị thông báo không có quyền". Khách hàng hoặc kỹ thuật viên vào trang quản lý tài khoản bị đưa về trang chính của vai trò mình mà không có thông báo nào. API vẫn trả `403 FORBIDDEN` đúng.
- **Nguyên nhân gốc:** `TuyenDuocBaoVe` chỉ gọi `chuyenDenManHinh(...)` rồi hiển thị `null` ([ProtectedRoute.jsx:6-19](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/frontend/src/components/ProtectedRoute.jsx#L6-L19)).
- **Cách xử lý:** mở trình duyệt, đăng nhập bằng tài khoản khách hàng rồi vào `#/admin/users` để xác nhận; nếu đúng thì hiện thông báo trước khi chuyển hướng.
- **File ảnh hưởng:** `frontend/src/components/ProtectedRoute.jsx`.

## TD-01. Ba suite test phụ thuộc thứ tự chạy

- **Mức độ:** Không phải lỗi sản phẩm — chất lượng bộ test; chạy cả bộ vẫn xanh (115/115 sau khi sửa lỗi).
- **Phát hiện bởi:** chạy riêng từng suite (lần chạy 6 trong [báo cáo §1](test-report.md), chi tiết §4.4).
- **Triệu chứng:** chạy riêng suite `US02`, `US07` hoặc `US10` thì mỗi suite lỗi một test (`401 !== 200`; `length >= 1`; `length > 0`). Chạy cả file hoặc kèm suite tiền đề thì PASS.
- **Nguyên nhân gốc:** test `US02` đăng nhập bằng tài khoản do suite `US01` đăng ký ([auth.test.js:69](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/tests/auth.test.js#L69); trước khi thêm suite `BUG-01` là dòng 53); test `US07` cần tin do suite `US06` tạo ([request.test.js:56](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/tests/request.test.js#L56)); test `US10` cần tin Chờ đề xuất do các test trước tạo ([request.test.js:116](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/tests/request.test.js#L116)).
- **Cách xử lý:** mỗi test tự dựng dữ liệu cần dùng (ví dụ `taoTin`) bên trong `it`.
- **File ảnh hưởng:** `tests/auth.test.js`, `tests/request.test.js`.

## OBS-01. Không giới hạn số lần đăng nhập sai

- **Mức độ:** Ghi nhận — rủi ro dò mật khẩu (OWASP A07), không nằm trong tiêu chí chấp nhận.
- **Phát hiện bởi:** TC-29 bước B5 — S-29-12 ([TC-29-pass.png](screenshots/TC-29-pass.png)).
- **Triệu chứng:** 25 lần đăng nhập sai liên tiếp đều `401`, sau đó đăng nhập đúng `200`; không bị chặn hay làm chậm.
- **Nguyên nhân gốc:** `POST /api/auth/login` không có cơ chế giới hạn tốc độ ([auth.routes.js:10](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/routes/auth.routes.js#L10)).
- **Cách xử lý:** thêm giới hạn số lần thử theo email hoặc địa chỉ IP.
- **File ảnh hưởng:** `src/routes/auth.routes.js`.

## OBS-02. Thời gian mong muốn trong quá khứ vẫn được chấp nhận

- **Mức độ:** Ghi nhận — tiêu chí US06 không nói về trường hợp này.
- **Phát hiện bởi:** TC-25 — S-25-12 ([TC-25-pass.png](screenshots/TC-25-pass.png)).
- **Triệu chứng:** `POST /api/requests` với `preferredTime` = `2020-01-01T00:00:00Z` trả `201`.
- **Nguyên nhân gốc:** validator chỉ kiểm chuỗi có phân tích được thành ngày hay không, không so với thời điểm hiện tại ([request.validator.js:25-31](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/validators/request.validator.js#L25-L31)).
- **Cách xử lý:** làm rõ yêu cầu; nếu cần thì từ chối thời gian trong quá khứ.
- **File ảnh hưởng:** `src/validators/request.validator.js`.

## OBS-03. Ký tự `%` và `_` trong bộ lọc hoạt động như ký tự đại diện

- **Mức độ:** Ghi nhận — chỉ ảnh hưởng độ chính xác của bộ lọc, không lộ dữ liệu ngoài quyền.
- **Phát hiện bởi:** TC-31 — S-31-8 ([TC-31-pass.png](screenshots/TC-31-pass.png)).
- **Triệu chứng:** `location=%` trả toàn bộ tin Chờ đề xuất (24/24, không lọc); `location=Qu_n 7` vẫn khớp (22 tin) vì `_` đại diện cho một ký tự bất kỳ. Chuỗi SQL như `' OR '1'='1` không gây lỗi hay rò dữ liệu (câu lệnh có tham số hóa).
- **Nguyên nhân gốc:** giá trị lọc được chèn vào mẫu `ILIKE` mà không thoát `%` và `_` ([request.repository.js:48](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/repositories/request.repository.js#L48), [user.repository.js:44](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/repositories/user.repository.js#L44)).
- **Cách xử lý:** thoát `%`, `_`, `\` trước khi ghép vào mẫu `ILIKE`.
- **File ảnh hưởng:** `src/repositories/request.repository.js`, `src/repositories/user.repository.js`.

## OBS-04. Mã tin viết dạng hex hoặc thập phân vẫn được chấp nhận

- **Mức độ:** Ghi nhận — vẫn qua kiểm tra chủ sở hữu nên không vượt quyền.
- **Phát hiện bởi:** TC-27 — S-27-16 ([TC-27-fail.png](screenshots/TC-27-fail.png)). Chạy lại ngày 2026-11-20 trên `main@76b2752`: S-27-16 vẫn là quan sát, hex và thập phân đều `200` ([TC-27-pass.png](screenshots/sau-sua-loi/TC-27-pass.png)).
- **Triệu chứng:** `GET /api/requests/0x1` và `GET /api/requests/1.0` trả đúng tin mã 1 thay vì `404`.
- **Nguyên nhân gốc:** `docMaSo` dùng `Number()` nên chấp nhận chuỗi hex, thập phân và dạng khoa học. Ở mã cũ hàm nằm ở `request.service.js:8`; sau khi sửa BUG-03 hàm chuyển sang [ma-so.js:7](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/utils/ma-so.js#L7) và vẫn dùng `Number()`, nên hành vi này không đổi.
- **Cách xử lý:** chỉ chấp nhận chuỗi gồm toàn chữ số trong `docMaSo`.
- **File ảnh hưởng:** `src/utils/ma-so.js`.

## OBS-05. Giá đề xuất có nhiều hơn một chữ số thập phân bị làm tròn thầm lặng

- **Mức độ:** Ghi nhận — giá trả về khác giá người dùng gửi. **Đã thu hẹp sau khi sửa BUG-02**, vẫn còn mở một phần.
- **Phát hiện bởi:** TC-26 — S-26-4 và S-26-6 ([TC-26-fail.png](screenshots/TC-26-fail.png)).
- **Triệu chứng:** ở mã cũ, gửi `0.05` được lưu `0.1` và gửi `350000.55` được lưu `350000.6`, phản hồi `201` không báo gì. Sau khi sửa BUG-02 (chạy lại ngày 2026-11-20): `0.05` nay bị từ chối `400` (nhỏ hơn giá tối thiểu 0,1); `350000.55` **vẫn** trả `201` và lưu `350000.6` ([TC-26-pass.png](screenshots/sau-sua-loi/TC-26-pass.png)).
- **Nguyên nhân gốc:** cột `proposal.price` là `DECIMAL(15,1)` ([001_khoi_tao_csdl.sql:34](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/migrations/001_khoi_tao_csdl.sql#L34)) còn validator không kiểm số chữ số thập phân ([proposal.validator.js:13-20](https://github.com/Dang-Mai-Hoang-Long/cdtn2-nhom03/blob/76b2752/src/validators/proposal.validator.js#L13-L20)).
- **Cách xử lý:** yêu cầu số nguyên VND hoặc báo lỗi khi có nhiều hơn một chữ số thập phân.
- **File ảnh hưởng:** `src/validators/proposal.validator.js`, `migrations/001_khoi_tao_csdl.sql`.

## OBS-06. Tài liệu ghi `page` mặc định 0, mã dùng 1

- **Mức độ:** Ghi nhận — lệch tài liệu, đã ghi trong [project-notes.md](project-notes.md).
- **Phát hiện bởi:** TC-27 — S-27-17 ([TC-27-fail.png](screenshots/TC-27-fail.png)): `page=0` được hiểu là trang 1.
- **Triệu chứng:** [api-contract.md](api-contract.md) §2.6 ghi mặc định `page=0`, API thực tế bắt đầu từ `page=1`.
- **Nguyên nhân gốc:** `PHAN_TRANG_MAC_DINH.trang` = 1 theo ví dụ `meta` của api-contract.
- **Cách xử lý:** thống nhất lại tài liệu.
- **File ảnh hưởng:** `docs/api-contract.md`.
