# Nhật ký lỗi (Bug Log) — Nền tảng kết nối và đặt dịch vụ sửa chữa tại nhà

Nhóm 03 · Track SE · Học phần Chuyên đề Tốt nghiệp 2, HK1 2026-2027. Kế hoạch kiểm thử: [test-plan.md](test-plan.md) · Kết quả đầy đủ: [test-report.md](test-report.md) · Ảnh minh chứng: [screenshots/](screenshots/)

Hai phần: **Phần A — năm bug do test case phát hiện** (BUG-01…BUG-05), mỗi bug đủ **bảy dòng** (mã và mức độ · phát hiện bởi test case nào · triệu chứng · cách tái lập · nguyên nhân thật · đề xuất sửa · trạng thái và xác nhận);
**Phần B — lệch so với tiêu chí chấp nhận, ghi nhận và hạn chế khác** (DEV, UI, TD, OBS), định dạng ngắn, không tính là bug đã chốt. Nhật ký này khác [project-notes.md](project-notes.md), vốn ghi các **quyết định thiết kế**.

**Trạng thái hiện tại: cả 5 bug đều đang MỞ.** Đợt kiểm thử chỉ phát hiện và ghi nhận, không sửa mã nguồn, nên chưa có commit sửa và mục "Đề xuất sửa" ở Phần A là **đề xuất chưa áp dụng, chưa kiểm chứng**. Khi sửa xong: điền link commit vào dòng 7, chạy lại test case tương ứng, **chụp lại** ảnh (ảnh mới có đuôi `-pass.png`, xóa ảnh `-fail.png` cũ) và đổi trạng thái trong bảng dưới.

Mức độ đo bằng **tác động tới người dùng** (cùng thang với [test-plan.md](test-plan.md) §1): **Critical** = mất hoặc lộ dữ liệu, vượt quyền, hoặc chặn luồng chính của tính năng Must have · **Major** = tính năng Must have hỏng với dữ liệu thực tế và không có cách vòng · **Minor** = chỉ xảy ra với dữ liệu hiếm hoặc cố ý, hoặc có cách vòng; không lộ dữ liệu.

| Bug | Mức độ | Phát hiện bởi | Trạng thái | Commit sửa |
|---|---|---|---|---|
| BUG-01 — đăng ký với số điện thoại có nhiều dấu cách (chuỗi dài hơn 20 ký tự) bị lỗi 500 | Minor | TC-24 | Mở | — |
| BUG-02 — giá đề xuất 0,04 gây lỗi 500 | Minor | TC-26 | Mở | — |
| BUG-03 — mã định danh vượt 2147483647 gây lỗi 500 ở 10 endpoint | Minor | TC-27 | Mở | — |
| BUG-04 — `page` quá lớn gây lỗi 500 | Minor | TC-27 | Mở | — |
| BUG-05 — thân yêu cầu lớn hơn 100 KB trả 500 thay vì 413 | Minor | TC-28 | Mở | — |

Cả năm lỗi cùng một họ: lỗi của CSDL (mã PostgreSQL 22001, 22003, 23514) hoặc của thư viện đọc thân yêu cầu không được ánh xạ sang mã 4xx, nên `xuLyLoi` ([src/utils/error-handler.js](../src/utils/error-handler.js)) trả `500 INTERNAL_ERROR`. Thân phản hồi 500 chỉ có thông điệp chung, **không lộ stack trace** (kiểm tra cả 15 phản hồi 500 ở lần chạy bổ sung).

---

# Chuẩn bị chung để tái lập (Phần A)

Các lệnh dưới đây đã chạy trên Windows PowerShell 5.1 ngày 2026-11-16, với dữ liệu mẫu của dự án; kết quả đúng như ghi ở từng bug.

1. Dựng CSDL và dữ liệu mẫu theo README mục 3 (`npm run migrate`, rồi `npm run seed`), sau đó chạy backend ở cổng 3000: `npm start`.
2. Mở một cửa sổ PowerShell khác (cần `curl.exe`, có sẵn trên Windows 10 trở lên) và dán khối sau để có hai hàm trợ giúp và ba token (tài khoản demo, mật khẩu `Demo@123` — xem [seeds/README.md](../seeds/README.md)). Hàm `Goi` in một dòng `HTTP <mã>  <mã lỗi nghiệp vụ>`.

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

Các lệnh đối chứng tạo dữ liệu thật trong CSDL đang dùng (tài khoản, đề xuất). Muốn chạy lại từ đầu: `npm run seed:reset` (xóa toàn bộ dữ liệu ứng dụng rồi tạo lại).

---

# Phần A — Bug phát hiện bởi test case

## BUG-01 — Đăng ký với số điện thoại có nhiều dấu cách bị lỗi 500

1. **Mã và mức độ:** BUG-01 · **MINOR** — chỉ xảy ra khi chuỗi số điện thoại (tính cả dấu cách, `.`, `-`) dài hơn 20 ký tự, tức dữ liệu hiếm; bỏ bớt dấu cách là đăng ký được, không lộ hay làm sai dữ liệu. Tuy vậy người dùng chỉ thấy "Lỗi hệ thống, vui lòng thử lại sau" (giao diện hiện thông điệp chung vì lỗi 500 không có `details`, [RegisterPage.jsx:31](../frontend/src/pages/shared/RegisterPage.jsx#L31)) nên không biết phải sửa gì.
2. **Phát hiện bởi:** TC-24 — bước bổ sung S-24-12 và S-24-13 ([TC-24-fail.png](screenshots/TC-24-fail.png)).
3. **Triệu chứng:** `POST /api/auth/register` với `phone` = `"+0  9 0 1 2 3 4 5 6 7"` (10 chữ số, 21 ký tự) hoặc `"0 9 0 1 2 3 4 5 6 7 8 9"` (12 chữ số, 23 ký tự) trả `500 INTERNAL_ERROR` "Lỗi hệ thống, vui lòng thử lại sau"; mong đợi `201` hoặc `400 VALIDATION_ERROR`. Chuỗi đúng 20 ký tự (`"+0 9 0 1 2 3 4 5 6 7"`) vẫn `201` (S-24-11), nên lỗi nằm đúng ở ranh giới của cột.
4. **Cách tái lập:** (đã chạy phần "Chuẩn bị chung")

```powershell
Goi POST http://localhost:3000/api/auth/register "" '{"email":"bien01@example.com","password":"matkhau123","fullName":"Bien","phone":"+0  9 0 1 2 3 4 5 6 7","role":"CUSTOMER"}'
Goi POST http://localhost:3000/api/auth/register "" '{"email":"bien02@example.com","password":"matkhau123","fullName":"Bien","phone":"+0 9 0 1 2 3 4 5 6 7","role":"CUSTOMER"}'
```

   Kết quả: lệnh đầu `HTTP 500  INTERNAL_ERROR`; lệnh thứ hai (đối chứng, đúng 20 ký tự) `HTTP 201  success=True`.
5. **Nguyên nhân:** validator chỉ kiểm 9–15 chữ số **sau khi bỏ** khoảng trắng, `.`, `-` ([auth.validator.js:26-29](../src/validators/auth.validator.js#L26-L29)), nhưng chuỗi thô đã `trim` được lưu nguyên vào cột `users.phone VARCHAR(20)` ([auth.service.js:27](../src/services/auth.service.js#L27), [001_khoi_tao_csdl.sql:9](../migrations/001_khoi_tao_csdl.sql#L9)). PostgreSQL từ chối: `value too long for type character varying(20)` (mã 22001). Khối `catch` của `dangKy` chỉ xử lý lỗi trùng email (mã 23505) rồi ném lại các lỗi khác, nên `xuLyLoi` đổi thành 500.
6. **Đề xuất sửa (chưa áp dụng, chưa kiểm chứng):** trong `kiemTraDangKy` kiểm thêm độ dài chuỗi thô sau `trim()` ≤ 20 và trả `400` kèm `details` cho trường `phone`; hoặc trong `auth.service.js` lưu bản chuẩn hóa (chỉ chữ số và dấu `+`) thay vì chuỗi thô. Thêm hai bước biên 20 và 21 ký tự vào test tự động.
7. **Trạng thái và xác nhận:** **MỞ** — chưa có commit sửa. Lỗi tái hiện ở cả hai lần chạy bổ sung (2026-11-13) và khi chụp ảnh, rồi lại bằng lệnh ở dòng 4 (2026-11-16); log server: `error: value too long for type character varying(20)`. Sau khi sửa, chạy lại TC-24: S-24-12 và S-24-13 phải là `201` hoặc `400`.

## BUG-02 — Giá đề xuất 0,04 gây lỗi 500

1. **Mã và mức độ:** BUG-02 · **MINOR** — chỉ xảy ra với giá nhỏ hơn 0,05 (vô nghĩa với tiền VND), thường do nhập có chủ đích; không lộ hay làm sai dữ liệu đã lưu. Liên quan OBS-05: cùng cột làm tròn thầm lặng giá có nhiều hơn một chữ số thập phân.
2. **Phát hiện bởi:** TC-26 — bước bổ sung S-26-3 ([TC-26-fail.png](screenshots/TC-26-fail.png)).
3. **Triệu chứng:** `POST /api/proposals` với `price` = `0.04` trả `500 INTERNAL_ERROR`; mong đợi `201` hoặc `400 VALIDATION_ERROR`. Đối chứng: `0.1` → `201` (S-26-5); `0.05` → `201` nhưng giá lưu là `0.1` (S-26-4).
4. **Cách tái lập:** (tin có mã 2 là "Máy giặt không vắt được", Chờ đề xuất, chưa có đề xuất nào — theo [seeds/README.md](../seeds/README.md))

```powershell
Goi POST http://localhost:3000/api/proposals $ktv '{"requestId":2,"price":0.04,"description":"Bien gia"}'
Goi POST http://localhost:3000/api/proposals $ktv '{"requestId":2,"price":0.1,"description":"Bien gia"}'
```

   Kết quả: lệnh đầu `HTTP 500  INTERNAL_ERROR`; lệnh thứ hai (đối chứng) `HTTP 201  success=True` (chạy lại lần hai sẽ báo `ALREADY_PROPOSED` — dùng `npm run seed:reset` để dọn).
5. **Nguyên nhân:** validator chỉ yêu cầu `price` là số hữu hạn lớn hơn 0 ([proposal.validator.js:11-13](../src/validators/proposal.validator.js#L11-L13)), nhưng cột `proposal.price` là `DECIMAL(15,1) NOT NULL CHECK (price > 0)` ([001_khoi_tao_csdl.sql:34](../migrations/001_khoi_tao_csdl.sql#L34)): 0,04 bị làm tròn thành 0,0 nên vi phạm ràng buộc — `new row for relation "proposal" violates check constraint "proposal_price_check"` (mã 23514). `guiDeXuat` chỉ bắt mã 23505 nên lỗi lọt ra thành 500.
6. **Đề xuất sửa (chưa áp dụng, chưa kiểm chứng):** đặt giá tối thiểu 0,1 (khớp độ chính xác của cột) hoặc yêu cầu số nguyên VND trong `kiemTraTruongDeXuat` (dùng chung cho gửi và sửa đề xuất); đồng thời cân nhắc báo lỗi khi có nhiều hơn một chữ số thập phân hoặc đổi kiểu cột bằng migration mới `003_...` (không sửa `001`), để không còn làm tròn thầm lặng (OBS-05).
7. **Trạng thái và xác nhận:** **MỞ** — chưa có commit sửa. Lỗi tái hiện ở hai lần chạy bổ sung (2026-11-13) và bằng lệnh ở dòng 4 (2026-11-16); log server: `new row for relation "proposal" violates check constraint "proposal_price_check"`. Sau khi sửa, chạy lại TC-26: S-26-3 phải là `201` hoặc `400`.

## BUG-03 — Mã định danh vượt phạm vi `int4` gây lỗi 500 ở 10 endpoint

1. **Mã và mức độ:** BUG-03 · **MINOR** — mã từ 2147483648 trở lên không thể tồn tại trong dữ liệu thật; chỉ gặp khi tự sửa URL hoặc thân yêu cầu; không lộ dữ liệu. Nhưng lỗi lặp lại ở 10 endpoint và sinh nhiều dòng lỗi trong log server, che mất lỗi thật.
2. **Phát hiện bởi:** TC-27 — bước bổ sung S-27-2…S-27-11 ([TC-27-fail.png](screenshots/TC-27-fail.png)).
3. **Triệu chứng:** với mã `2147483648` cả 10 endpoint sau trả `500 INTERNAL_ERROR`; mong đợi `404 *_NOT_FOUND`. Mã `2147483647` (lớn nhất của `int4`) trả `404 REQUEST_NOT_FOUND` đúng (S-27-1).

| Endpoint | Vai trò gọi |
|---|---|
| `GET /api/requests/{id}` | khách hàng hoặc kỹ thuật viên |
| `GET /api/proposals/{id}` | khách hàng hoặc kỹ thuật viên |
| `PATCH /api/proposals/{id}/accept` | khách hàng |
| `GET /api/proposals/request/{requestId}` | khách hàng |
| `PATCH /api/admin/users/{id}/lock` | quản trị viên |
| `PATCH /api/notifications/{id}/read` | mọi người dùng đã đăng nhập |
| `GET /api/reviews/user/{userId}` | mọi người dùng đã đăng nhập |
| `PATCH /api/requests/{id}/close` | khách hàng |
| `POST /api/proposals` (`requestId` trong thân) | kỹ thuật viên |
| `POST /api/reviews` (`requestId` trong thân) | khách hàng hoặc kỹ thuật viên |

4. **Cách tái lập:** (đã chạy phần "Chuẩn bị chung")

```powershell
Goi GET http://localhost:3000/api/requests/2147483647 $khach
Goi GET http://localhost:3000/api/requests/2147483648 $khach
Goi GET http://localhost:3000/api/proposals/2147483648 $khach
Goi PATCH http://localhost:3000/api/proposals/2147483648/accept $khach
Goi GET http://localhost:3000/api/proposals/request/2147483648 $khach
Goi PATCH http://localhost:3000/api/admin/users/2147483648/lock $admin
Goi PATCH http://localhost:3000/api/notifications/2147483648/read $ktv
Goi GET http://localhost:3000/api/reviews/user/2147483648 $khach
Goi PATCH http://localhost:3000/api/requests/2147483648/close $khach
Goi POST http://localhost:3000/api/proposals $ktv '{"requestId":2147483648,"price":1000,"description":"x"}'
Goi POST http://localhost:3000/api/reviews $khach '{"requestId":2147483648,"rating":5}'
```

   Kết quả: lệnh đầu (đối chứng, `2147483647`) `HTTP 404  REQUEST_NOT_FOUND`; 10 lệnh sau đều `HTTP 500  INTERNAL_ERROR`.
5. **Nguyên nhân:** `docMaSo` chỉ kiểm `Number.isInteger(so) && so > 0` ([request.service.js:7-11](../src/services/request.service.js#L7-L11)), tức cho qua mọi số nguyên dương, rồi đưa thẳng vào `WHERE id = $1` trên cột `INT` (`int4`). `admin.service.js` ([dòng 13-14](../src/services/admin.service.js#L13-L14)) và `notification.service.js` ([dòng 29-30](../src/services/notification.service.js#L29-L30)) tự kiểm tra theo cách tương tự; hai validator của thân yêu cầu ([proposal.validator.js:31](../src/validators/proposal.validator.js#L31), [review.validator.js:5](../src/validators/review.validator.js#L5)) chỉ yêu cầu `requestId` là số nguyên dương. PostgreSQL: `value "2147483648" is out of range for type integer` (mã 22003).
6. **Đề xuất sửa (chưa áp dụng, chưa kiểm chứng):** đặt hằng `ID_TOI_DA = 2147483647` và coi mã lớn hơn là không tìm thấy (`404`) trong `docMaSo` cùng các chỗ tự kiểm ở `admin.service.js`, `notification.service.js`; hai validator trả `400` khi `requestId` vượt giới hạn. Có thể bổ sung nhánh ánh xạ mã PostgreSQL 22003 trong `xuLyLoi` như lớp bảo vệ chung (xem BUG-04).
7. **Trạng thái và xác nhận:** **MỞ** — chưa có commit sửa. Lỗi tái hiện ở hai lần chạy bổ sung (2026-11-13) và bằng lệnh ở dòng 4 (2026-11-16); log server: `value "2147483648" is out of range for type integer` (10 dòng, mỗi endpoint một dòng). Sau khi sửa, chạy lại TC-27: S-27-2…S-27-11 phải là `404` (hoặc `400` với hai thân yêu cầu).

## BUG-04 — Tham số `page` quá lớn gây lỗi 500

1. **Mã và mức độ:** BUG-04 · **MINOR** — chỉ xảy ra khi tự gõ `page` rất lớn (từ khoảng 10¹⁸ trở lên); không lộ hay làm sai dữ liệu.
2. **Phát hiện bởi:** TC-27 — bước bổ sung S-27-22 ([TC-27-fail.png](screenshots/TC-27-fail.png)).
3. **Triệu chứng:** `GET /api/requests/my?page=9999999999999999999&size=10` trả `500 INTERNAL_ERROR`; mong đợi `200` với danh sách rỗng hoặc `400`. Đối chiếu: `page=999` → `200`, danh sách rỗng (S-27-21). Hàm đọc phân trang dùng chung cho các API danh sách khác (tin, tài khoản, đề xuất, thông báo, đánh giá) nhưng mới thử trên API này.
4. **Cách tái lập:** (đã chạy phần "Chuẩn bị chung")

```powershell
Goi GET "http://localhost:3000/api/requests/my?page=999&size=10" $khach
Goi GET "http://localhost:3000/api/requests/my?page=9999999999999999999&size=10" $khach
```

   Kết quả: lệnh đầu (đối chứng) `HTTP 200  success=True`; lệnh sau `HTTP 500  INTERNAL_ERROR`.
5. **Nguyên nhân:** `docThamSoPhanTrang` tính `viTriBatDau = (trang − 1) × kichThuoc` mà không giới hạn trên ([response.js:10-17](../src/utils/response.js#L10-L17)); giá trị khoảng 10²⁰ làm `OFFSET` tràn kiểu `bigint` — `value "100000000000000000000" is out of range for type bigint` (mã 22003).
6. **Đề xuất sửa (chưa áp dụng, chưa kiểm chứng):** giới hạn `trang` tối đa (ví dụ 1.000.000) trong `docThamSoPhanTrang`; hoặc ánh xạ mã 22003 thành `400` trong `xuLyLoi`.
7. **Trạng thái và xác nhận:** **MỞ** — chưa có commit sửa. Lỗi tái hiện ở hai lần chạy bổ sung (2026-11-13) và bằng lệnh ở dòng 4 (2026-11-16). Sau khi sửa, chạy lại TC-27: S-27-22 phải là `200` hoặc `400`.

## BUG-05 — Thân yêu cầu lớn hơn 100 KB trả 500 thay vì 413

1. **Mã và mức độ:** BUG-05 · **MINOR** — mô tả dài hơn 100 KB không thực tế với người dùng bình thường; không lộ hay làm sai dữ liệu. Lỗi nằm ở tầng đọc thân yêu cầu nên áp dụng cho mọi API nhận JSON.
2. **Phát hiện bởi:** TC-28 — bước bổ sung S-28-7 ([TC-28-fail.png](screenshots/TC-28-fail.png)).
3. **Triệu chứng:** `POST /api/requests` với `description` dài 150.000 ký tự trả `500 INTERNAL_ERROR`; mong đợi `413` hoặc `400`. Đối chứng: thân 50.000 ký tự vẫn `201` (S-25-7). Lỗi xảy ra ở bước đọc thân, trước cả bước xác thực.
4. **Cách tái lập:** (đã chạy phần "Chuẩn bị chung")

```powershell
$lon = '{"title":"Tin lon","description":"' + ('a' * 150000) + '","category":"Dien lanh","location":"Quan 7","preferredTime":"2026-12-05T09:00:00Z"}'
Goi POST http://localhost:3000/api/requests $khach $lon
```

   Kết quả: `HTTP 500  INTERNAL_ERROR`.
5. **Nguyên nhân:** `app.use(express.json())` ([app.js:10](../src/app.js#L10)) dùng giới hạn mặc định 100 KB; thân lớn hơn làm thư viện ném `PayloadTooLargeError: request entity too large` (`type: 'entity.too.large'`, mã 413). `xuLyLoi` chỉ ánh xạ `entity.parse.failed` ([error-handler.js:27-28](../src/utils/error-handler.js#L27-L28)); mọi lỗi khác đều thành 500 ([dòng 29-31](../src/utils/error-handler.js#L29-L31)).
6. **Đề xuất sửa (chưa áp dụng, chưa kiểm chứng):** thêm nhánh `loi.type === 'entity.too.large'` trong `xuLyLoi` trả `413` (hoặc `400 VALIDATION_ERROR`); nếu dùng mã `413` thì bổ sung vào `TEN_LOI_THEO_MA_HTTP` và [api-contract.md](api-contract.md) §2.1.3.
7. **Trạng thái và xác nhận:** **MỞ** — chưa có commit sửa. Lỗi tái hiện ở hai lần chạy bổ sung (2026-11-13) và bằng lệnh ở dòng 4 (2026-11-16); log server: `PayloadTooLargeError: request entity too large`. Sau khi sửa, chạy lại TC-28: S-28-7 phải là `413` hoặc `400`.

---

# Phần B — Lệch so với tiêu chí, ghi nhận và hạn chế khác

Không phải bug đã chốt. **DEV** = hành vi khác tiêu chí chấp nhận trong `ProductBacklog_Nhom03.xlsx`; **UI** = phát hiện khi rà soát mã giao diện, chưa chạy trên trình duyệt; **TD** = chất lượng của chính bộ test; **OBS** = ghi nhận, không tính là FAIL. Mỗi mục gồm: **Mức độ · Phát hiện bởi · Triệu chứng · Nguyên nhân gốc · Cách xử lý · File ảnh hưởng**.

## DEV-01. Token cũ vẫn dùng được sau khi đăng xuất

- **Mức độ:** Chấp nhận — quyết định thiết kế đã ghi trong [project-notes.md](project-notes.md) (Sprint 2, "Đăng xuất (US03)"). Rủi ro: token bị lộ vẫn dùng được đến khi hết hạn (mặc định 1 ngày).
- **Phát hiện bởi:** TC-03 bước B3 — S-03-3 ([TC-03-fail.png](screenshots/TC-03-fail.png)); làm TC-03 FAIL.
- **Triệu chứng:** tiêu chí US03 viết "Hệ thống kết thúc phiên". Sau `POST /api/auth/logout`, gọi lại `GET /api/auth/me` bằng chính token đó vẫn trả `200`.
- **Nguyên nhân gốc:** JWT không lưu phiên ở server; `dangXuat` chỉ trả thành công ([auth.controller.js:22-25](../src/controllers/auth.controller.js#L22-L25)) và middleware chỉ kiểm chữ ký, hạn dùng, người dùng còn tồn tại và chưa bị khóa ([auth.middleware.js](../src/middlewares/auth.middleware.js)). Giao diện xóa token ở trình duyệt.
- **Cách xử lý:** chấp nhận và sửa tiêu chí US03 trong backlog; nếu muốn đúng tiêu chí thì thêm danh sách thu hồi token hoặc cột `tokenVersion` trong bảng `users`.
- **File ảnh hưởng:** `src/controllers/auth.controller.js`, `src/middlewares/auth.middleware.js`, tiêu chí US03 trong [product-backlog-nhom03.md](product-backlog-nhom03.md).

## DEV-02. Kỹ thuật viên đã gửi đề xuất cũng xem được chi tiết đề xuất

- **Mức độ:** Chấp nhận — quyết định thiết kế đã ghi trong [project-notes.md](project-notes.md) (giao diện Sprint 3, "US15"): chuông thông báo cần mở đề xuất để lấy mã tin.
- **Phát hiện bởi:** TC-15 bước B3 ([TC-15-fail.png](screenshots/TC-15-fail.png)); làm TC-15 FAIL (kết luận do đối chiếu tiêu chí, test tự động vẫn PASS).
- **Triệu chứng:** tiêu chí US15 "Chỉ chủ tin mới được xem". Thực tế kỹ thuật viên gửi đề xuất gọi `GET /api/proposals/{id}` nhận `200`; khách hàng khác và kỹ thuật viên không liên quan nhận `403 NOT_OWNER` (đúng).
- **Nguyên nhân gốc:** `layChiTietDeXuat` cho phép cả chủ tin lẫn người gửi đề xuất ([proposal.service.js:88-96](../src/services/proposal.service.js#L88-L96)).
- **Cách xử lý:** chấp nhận và sửa tiêu chí thành "chủ tin hoặc kỹ thuật viên đã gửi đề xuất".
- **File ảnh hưởng:** `src/services/proposal.service.js`, tiêu chí US15 trong [product-backlog-nhom03.md](product-backlog-nhom03.md).

## DEV-03. Trạng thái đề xuất đã rút là `WITHDRAWN`, tiêu chí ghi `DA_RUT`

- **Mức độ:** Ghi nhận — chỉ lệch tên giá trị, cùng ngữ nghĩa; TC-23 vẫn PASS.
- **Phát hiện bởi:** TC-23 bước B1.
- **Triệu chứng:** tiêu chí US23 "cập nhật trạng thái đề xuất thành DA_RUT"; API và CSDL trả `WITHDRAWN`.
- **Nguyên nhân gốc:** `DA_RUT` là tên hằng số nội bộ của mã nguồn, giá trị là `'WITHDRAWN'` ([constants.js:18](../src/utils/constants.js#L18)); [api-contract.md](api-contract.md) chưa liệt kê tập trạng thái của đề xuất.
- **Cách xử lý:** cập nhật tiêu chí US23 và api-contract cho thống nhất.
- **File ảnh hưởng:** `src/utils/constants.js` (không cần sửa), tiêu chí US23, `docs/api-contract.md`.

## UI-01. Người sai vai trò bị chuyển hướng im lặng, không hiện thông báo "không có quyền"

- **Mức độ:** Minor (dự kiến) — **chưa xác minh trên trình duyệt**, chỉ thấy khi rà soát mã.
- **Phát hiện bởi:** TC-04 bước B2, phần giao diện ([báo cáo §5](test-report.md), dòng US04-S2).
- **Triệu chứng:** tiêu chí US04 "Hệ thống từ chối và hiển thị thông báo không có quyền". Khách hàng hoặc kỹ thuật viên vào trang quản lý tài khoản bị đưa về trang chính của vai trò mình mà không có thông báo nào. API vẫn trả `403 FORBIDDEN` đúng.
- **Nguyên nhân gốc:** `TuyenDuocBaoVe` chỉ gọi `chuyenDenManHinh(...)` rồi hiển thị `null` ([ProtectedRoute.jsx:6-19](../frontend/src/components/ProtectedRoute.jsx#L6-L19)).
- **Cách xử lý:** mở trình duyệt, đăng nhập bằng tài khoản khách hàng rồi vào `#/admin/users` để xác nhận; nếu đúng thì hiện thông báo trước khi chuyển hướng.
- **File ảnh hưởng:** `frontend/src/components/ProtectedRoute.jsx`.

## TD-01. Ba suite test phụ thuộc thứ tự chạy

- **Mức độ:** Không phải lỗi sản phẩm — chất lượng bộ test; chạy cả bộ vẫn xanh.
- **Phát hiện bởi:** chạy riêng từng suite (lần chạy 6 trong [báo cáo §1](test-report.md), chi tiết §4.4).
- **Triệu chứng:** chạy riêng suite `US02`, `US07` hoặc `US10` thì mỗi suite lỗi một test (`401 !== 200`; `length >= 1`; `length > 0`). Chạy cả file hoặc kèm suite tiền đề thì PASS.
- **Nguyên nhân gốc:** test `US02` đăng nhập bằng tài khoản do suite `US01` đăng ký ([auth.test.js:53](../tests/auth.test.js#L53)); test `US07` cần tin do suite `US06` tạo ([request.test.js:56](../tests/request.test.js#L56)); test `US10` cần tin Chờ đề xuất do các test trước tạo ([request.test.js:116](../tests/request.test.js#L116)).
- **Cách xử lý:** mỗi test tự dựng dữ liệu cần dùng (ví dụ `taoTin`) bên trong `it`.
- **File ảnh hưởng:** `tests/auth.test.js`, `tests/request.test.js`.

## OBS-01. Không giới hạn số lần đăng nhập sai

- **Mức độ:** Ghi nhận — rủi ro dò mật khẩu (OWASP A07), không nằm trong tiêu chí chấp nhận.
- **Phát hiện bởi:** TC-29 bước B5 — S-29-12 ([TC-29-pass.png](screenshots/TC-29-pass.png)).
- **Triệu chứng:** 25 lần đăng nhập sai liên tiếp đều `401`, sau đó đăng nhập đúng `200`; không bị chặn hay làm chậm.
- **Nguyên nhân gốc:** `POST /api/auth/login` không có cơ chế giới hạn tốc độ ([auth.routes.js:10](../src/routes/auth.routes.js#L10)).
- **Cách xử lý:** thêm giới hạn số lần thử theo email hoặc địa chỉ IP.
- **File ảnh hưởng:** `src/routes/auth.routes.js`.

## OBS-02. Thời gian mong muốn trong quá khứ vẫn được chấp nhận

- **Mức độ:** Ghi nhận — tiêu chí US06 không nói về trường hợp này.
- **Phát hiện bởi:** TC-25 — S-25-12 ([TC-25-pass.png](screenshots/TC-25-pass.png)).
- **Triệu chứng:** `POST /api/requests` với `preferredTime` = `2020-01-01T00:00:00Z` trả `201`.
- **Nguyên nhân gốc:** validator chỉ kiểm chuỗi có phân tích được thành ngày hay không, không so với thời điểm hiện tại ([request.validator.js:25-31](../src/validators/request.validator.js#L25-L31)).
- **Cách xử lý:** làm rõ yêu cầu; nếu cần thì từ chối thời gian trong quá khứ.
- **File ảnh hưởng:** `src/validators/request.validator.js`.

## OBS-03. Ký tự `%` và `_` trong bộ lọc hoạt động như ký tự đại diện

- **Mức độ:** Ghi nhận — chỉ ảnh hưởng độ chính xác của bộ lọc, không lộ dữ liệu ngoài quyền.
- **Phát hiện bởi:** TC-31 — S-31-8 ([TC-31-pass.png](screenshots/TC-31-pass.png)).
- **Triệu chứng:** `location=%` trả toàn bộ tin Chờ đề xuất (24/24, không lọc); `location=Qu_n 7` vẫn khớp (22 tin) vì `_` đại diện cho một ký tự bất kỳ. Chuỗi SQL như `' OR '1'='1` không gây lỗi hay rò dữ liệu (câu lệnh có tham số hóa).
- **Nguyên nhân gốc:** giá trị lọc được chèn vào mẫu `ILIKE` mà không thoát `%` và `_` ([request.repository.js:48](../src/repositories/request.repository.js#L48), [user.repository.js:44](../src/repositories/user.repository.js#L44)).
- **Cách xử lý:** thoát `%`, `_`, `\` trước khi ghép vào mẫu `ILIKE`.
- **File ảnh hưởng:** `src/repositories/request.repository.js`, `src/repositories/user.repository.js`.

## OBS-04. Mã tin viết dạng hex hoặc thập phân vẫn được chấp nhận

- **Mức độ:** Ghi nhận — vẫn qua kiểm tra chủ sở hữu nên không vượt quyền.
- **Phát hiện bởi:** TC-27 — S-27-16 ([TC-27-fail.png](screenshots/TC-27-fail.png)).
- **Triệu chứng:** `GET /api/requests/0x1` và `GET /api/requests/1.0` trả đúng tin mã 1 thay vì `404`.
- **Nguyên nhân gốc:** `docMaSo` dùng `Number()` nên chấp nhận chuỗi hex, thập phân và dạng khoa học ([request.service.js:8](../src/services/request.service.js#L8)).
- **Cách xử lý:** chỉ chấp nhận chuỗi gồm toàn chữ số (có thể gộp với sửa BUG-03).
- **File ảnh hưởng:** `src/services/request.service.js`.

## OBS-05. Giá đề xuất bị làm tròn thầm lặng đến một chữ số thập phân

- **Mức độ:** Ghi nhận — giá trả về khác giá người dùng gửi.
- **Phát hiện bởi:** TC-26 — S-26-4 và S-26-6 ([TC-26-fail.png](screenshots/TC-26-fail.png)).
- **Triệu chứng:** gửi `0.05` được lưu `0.1`; gửi `350000.55` được lưu `350000.6`, phản hồi `201` không báo gì.
- **Nguyên nhân gốc:** cột `proposal.price` là `DECIMAL(15,1)` ([001_khoi_tao_csdl.sql:34](../migrations/001_khoi_tao_csdl.sql#L34)) còn validator không kiểm số chữ số thập phân.
- **Cách xử lý:** xử lý cùng BUG-02 (yêu cầu số nguyên VND hoặc báo lỗi khi có nhiều hơn một chữ số thập phân).
- **File ảnh hưởng:** `src/validators/proposal.validator.js`, `migrations/001_khoi_tao_csdl.sql`.

## OBS-06. Tài liệu ghi `page` mặc định 0, mã dùng 1

- **Mức độ:** Ghi nhận — lệch tài liệu, đã ghi trong [project-notes.md](project-notes.md).
- **Phát hiện bởi:** TC-27 — S-27-17 ([TC-27-fail.png](screenshots/TC-27-fail.png)): `page=0` được hiểu là trang 1.
- **Triệu chứng:** [api-contract.md](api-contract.md) §2.6 ghi mặc định `page=0`, API thực tế bắt đầu từ `page=1`.
- **Nguyên nhân gốc:** `PHAN_TRANG_MAC_DINH.trang` = 1 theo ví dụ `meta` của api-contract.
- **Cách xử lý:** thống nhất lại tài liệu.
- **File ảnh hưởng:** `docs/api-contract.md`.
