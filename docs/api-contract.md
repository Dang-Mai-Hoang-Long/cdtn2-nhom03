## **API Contract**

> Bản này **khớp mã nguồn hiện tại** (cập nhật 2026-11-21). Ví dụ thành công lấy từ phản hồi thật của backend sau `npm run seed:thu-cong` (17 tài khoản, 50 tin viết tay; rút bớt phần tử cho gọn, token cắt ngắn). Mã của tài khoản, tin, đề xuất đầu và mọi tên, giá trị trong ví dụ khớp dữ liệu đó; mã của bản ghi mới tạo (ví dụ tin 51, đề xuất 79), điểm trung bình và số lượng sẽ lớn hơn nếu chạy `npm run seed` (thêm 1000 tin tự động). Ví dụ lỗi ở mục 2.5.4, 2.5.6 và 2.5.7 dùng đúng thông điệp và mã lỗi của mã nguồn nhưng thời điểm và mã tin chỉ để minh họa. Các điểm khác bản thiết kế ban đầu được liệt kê ở mục 2.7 và đầy đủ ở [thay-doi-thiet-ke.md](thay-doi-thiet-ke.md).

Mọi API nằm dưới tiền tố `/api`. Giá trị thời gian là chuỗi ISO 8601 UTC (ví dụ `2026-11-05T09:00:00.000Z`). Tên trường JSON dùng camelCase.

### 2.1. Cấu trúc Response chung

#### **2.1.1. Response thành công (Success)**

Tất cả API thành công trả về cấu trúc sau:

```
{
  "success": true,
  "data": { ... },
  "message": "Thành công",
  "meta": {
    "page": 1,
    "size": 10,
    "totalElements": 125,
    "totalPages": 13
  }
}
```

- `message` là "Thành công" nếu API không có thông điệp riêng (các thông điệp riêng ghi ở từng API).
- `data` là `null` khi API không trả dữ liệu (`POST /api/auth/logout`).
- `meta` chỉ xuất hiện ở các API trả danh sách có phân trang (mục 2.6). Hai API có thêm trường trong `meta`: `GET /api/admin/users` thêm `summary`, `GET /api/reviews/user/{userId}` thêm `user` (mục 2.3.5 và 2.3.4).
- Một API danh sách **không** phân trang và không có `meta`: `GET /api/proposals/request/{requestId}`.

#### **2.1.2 Cấu trúc lỗi chuẩn (Error Response)**

Tất cả API khi lỗi đều trả về cùng một cấu trúc thống nhất:

```
{
  "success": false,
  "status": 400,
  "error": "Bad Request",
  "message": "Dữ liệu không hợp lệ",
  "code": "VALIDATION_ERROR",
  "timestamp": "2026-11-21T00:20:53.877Z",
  "path": "/api/requests",
  "details": [
    { "field": "title", "message": "Tiêu đề không được để trống" }
  ]
}
```

**Giải thích các trường:**

- **success:** Luôn là false khi lỗi.
- **status:** HTTP Status Code tương ứng.
- **error:** Tên lỗi ngắn theo mã HTTP: `Bad Request` (400), `Unauthorized` (401), `Forbidden` (403), `Not Found` (404), `Conflict` (409), `Internal Server Error` (500).
- **message:** Thông báo dễ hiểu cho người dùng (tiếng Việt).
- **code:** Mã lỗi nghiệp vụ (frontend dùng để xử lý riêng), xem mục 2.2.
- **timestamp:** Thời điểm xảy ra lỗi (ISO 8601).
- **path:** Đường dẫn yêu cầu (`req.originalUrl`, gồm cả query string).
- **details:** Mảng chi tiết lỗi theo từng trường. **Chỉ có** khi `code` là `VALIDATION_ERROR` do dữ liệu sai ở các API có kiểm tra thân yêu cầu; các lỗi khác không có trường này.

#### **2.1.3. HTTP Status Code sử dụng**

| **Status** | **Ý nghĩa**           | **Khi nào dùng**                                                                   |
| ---------- | --------------------- | ---------------------------------------------------------------------------------- |
| **200**    | OK                    | Thành công (GET, PATCH, POST đăng nhập/đăng xuất)                                  |
| **201**    | Created               | Tạo mới thành công (POST đăng ký, tạo tin, gửi đề xuất, tạo đánh giá)              |
| **400**    | Bad Request           | Dữ liệu sai (`VALIDATION_ERROR`) hoặc vi phạm quy tắc nghiệp vụ/trạng thái         |
| **401**    | Unauthorized          | Chưa đăng nhập, token sai hoặc hết hạn, sai email/mật khẩu                         |
| **403**    | Forbidden             | Sai vai trò, không phải chủ sở hữu, tài khoản bị khóa                              |
| **404**    | Not Found             | Không tìm thấy tài nguyên hoặc đường dẫn (kể cả mã số không hợp lệ hoặc quá lớn)   |
| **409**    | Conflict              | Xung đột dữ liệu hoặc trạng thái (email trùng, đã gửi đề xuất, đã đánh giá...)     |
| **500**    | Internal Server Error | Lỗi hệ thống không lường trước (thân phản hồi chỉ có thông điệp chung, không lộ chi tiết) |

Hệ thống **không dùng** `204 No Content` (các API xóa/đóng đều trả `200` kèm dữ liệu) và **không dùng** `413`/`415`: thân yêu cầu quá lớn hoặc có bảng mã/mã hóa nội dung không hỗ trợ cũng trả `400 VALIDATION_ERROR` (mục 2.6).

### 2.2. Danh sách mã lỗi nghiệp vụ (Error Code)

Backend dùng đúng **22 mã** sau. Các mã dùng chung nhiều tình huống được ghi rõ từng tình huống.

| **Code**                      | **HTTP** | **Khi nào xảy ra**                                                                                                                                                                                                   |
| ----------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UNAUTHORIZED**              | 401      | Thiếu hoặc sai token (`Bạn cần đăng nhập để tiếp tục`; `Phiên đăng nhập không hợp lệ hoặc đã hết hạn`), hoặc đăng nhập sai email/mật khẩu (`Email hoặc mật khẩu không đúng`)                                           |
| **FORBIDDEN**                 | 403      | Sai vai trò (BR01) (`Bạn không có quyền thực hiện thao tác này`); khóa/mở khóa tài khoản quản trị viên                                                                                                                |
| **ACCOUNT_LOCKED**            | 403      | Đăng nhập đúng mật khẩu nhưng tài khoản bị khóa; hoặc mọi API cần đăng nhập mà tài khoản đang bị khóa (BR02, kiểm tra lại ở mỗi yêu cầu)                                                                              |
| **NOT_OWNER**                 | 403      | Không phải chủ sở hữu hoặc không tham gia: tin của người khác, đề xuất không phải của mình/không thuộc tin của mình, thông báo của người khác, đánh giá công việc không tham gia (BR03, BR09, BR11, BR13)             |
| **NOT_FOUND**                 | 404      | Đường dẫn không tồn tại (ngoài các API trong tài liệu này); loại báo cáo hoặc cảnh báo không có (mục 2.3.9)                                                                                                         |
| **USER_NOT_FOUND**            | 404      | Không tìm thấy người dùng (`GET /api/users/{id}`, `GET /api/reviews/user/{userId}`, khóa/mở khóa tài khoản)                                                                                                                                 |
| **REQUEST_NOT_FOUND**         | 404      | Không tìm thấy tin sửa chữa                                                                                                                                                                                          |
| **PROPOSAL_NOT_FOUND**        | 404      | Không tìm thấy đề xuất                                                                                                                                                                                               |
| **NOTIFICATION_NOT_FOUND**    | 404      | Không tìm thấy thông báo                                                                                                                                                                                             |
| **VALIDATION_ERROR**          | 400      | Dữ liệu sai (kèm `details`); JSON không hợp lệ; thân yêu cầu lớn hơn 100 KB; bảng mã hoặc mã hóa nội dung không hỗ trợ                                                                                               |
| **REQUEST_NOT_WAITING**       | 400      | Gửi hoặc sửa đề xuất khi tin không ở trạng thái Chờ đề xuất (BR07) (`Tin không còn nhận đề xuất`)                                                                                                                    |
| **REQUEST_ALREADY_SELECTED**  | 400      | Đóng tin (BR06), hoặc sửa đề xuất, khi tin đã chọn kỹ thuật viên hoặc đã hoàn thành                                                                                                                                  |
| **INVALID_STATUS_TRANSITION** | 400      | Chuyển trạng thái sai trình tự (BR12): xác nhận hoàn thành khi tin chưa ở Đã chọn kỹ thuật viên; đóng tin đã đóng; chấp nhận đề xuất khi tin không còn chờ đề xuất hoặc đề xuất không còn ở trạng thái chờ; rút đề xuất không còn ở trạng thái chờ |
| **CANNOT_REVIEW_YET**         | 400      | Đánh giá khi tin đã chọn kỹ thuật viên nhưng chưa ở trạng thái Hoàn thành (BR13). Tin chưa chọn kỹ thuật viên (Chờ đề xuất, Đã đóng) chưa có bên còn lại nên trả `NOT_OWNER`, không phải mã này                    |
| **SELF_REVIEW_NOT_ALLOWED**   | 400      | Tự đánh giá chính mình (lớp bảo vệ; trong luồng bình thường không xảy ra vì người được đánh giá luôn là bên còn lại)                                                                                                  |
| **ALREADY_PROPOSED**          | 409      | Kỹ thuật viên đã có đề xuất đang hiệu lực (chờ hoặc đã chấp nhận) cho tin này (BR08)                                                                                                                                 |
| **PROPOSAL_ALREADY_ACCEPTED** | 409      | Chấp nhận đề xuất khi tin đã chọn kỹ thuật viên (BR10) (`Tin đã chọn kỹ thuật viên`); sửa hoặc rút đề xuất đã được chấp nhận                                                                                          |
| **PROPOSAL_NOT_EDITABLE**     | 409      | Sửa đề xuất không còn ở trạng thái chờ (đã bị từ chối hoặc đã rút)                                                                                                                                                   |
| **REQUEST_NOT_EDITABLE**      | 409      | Sửa tin đã chọn kỹ thuật viên, đã hoàn thành hoặc đã đóng                                                                                                                                                            |
| **ALREADY_REVIEWED**          | 409      | Đã gửi đánh giá cho công việc này (BR14)                                                                                                                                                                             |
| **EMAIL_ALREADY_EXISTS**      | 409      | Email đã được dùng để đăng ký (không phân biệt hoa thường)                                                                                                                                                           |
| **INTERNAL_ERROR**            | 500      | Lỗi hệ thống không lường trước                                                                                                                                                                                       |

**Quy ước mã số trong đường dẫn và thân yêu cầu:** mã (`{id}`, `{requestId}`, `{userId}`, `requestId`) là số nguyên dương không quá 2147483647. Mã không hợp lệ (chữ, số âm, 0) hoặc vượt giới hạn được xem như không tồn tại và trả `404` với mã `*_NOT_FOUND` của tài nguyên tương ứng.

### 2.3. Danh sách API theo Controller

**Quy ước chung**

- Xác thực: `Authorization: Bearer <token>` (JWT). Mọi API đều cần đăng nhập, **trừ** đăng ký, đăng nhập, `GET /` và `GET /api/health`.
- Vai trò viết tắt: **KH** = CUSTOMER (khách hàng), **KTV** = TECHNICIAN (kỹ thuật viên), **QTV** = ADMIN (quản trị viên). Cột "Vai trò" ghi vai trò được phép; vai trò khác nhận `403 FORBIDDEN`.
- Giá trị trạng thái tin (`status`): `WAITING_PROPOSAL`, `SELECTED`, `COMPLETED`, `CLOSED`. Giá trị trạng thái đề xuất: `PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`.
- Chuỗi văn bản được cắt khoảng trắng hai đầu trước khi lưu.

#### **2.3.1. AuthController – /api/auth**

| **Method** | **Endpoint**       | **Vai trò**  | **Mô tả**                   | **Success** | **Error Code thường gặp**                          |
| ---------- | ------------------ | ------------ | --------------------------- | ----------- | -------------------------------------------------- |
| **POST**   | /api/auth/register | công khai    | Đăng ký tài khoản           | 201         | VALIDATION_ERROR, EMAIL_ALREADY_EXISTS             |
| **POST**   | /api/auth/login    | công khai    | Đăng nhập                   | 200         | VALIDATION_ERROR, UNAUTHORIZED, ACCOUNT_LOCKED     |
| **POST**   | /api/auth/logout   | mọi vai trò  | Đăng xuất                   | 200         | UNAUTHORIZED                                       |
| **GET**    | /api/auth/me       | mọi vai trò  | Lấy thông tin user hiện tại | 200         | UNAUTHORIZED, ACCOUNT_LOCKED                       |

**POST /api/auth/register** — thông điệp: `Đăng ký thành công`

Request Body:

| Trường     | Bắt buộc | Quy tắc                                                                                                     |
| ---------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `email`    | có       | Đúng định dạng email, tối đa 100 ký tự; được đổi sang chữ thường; duy nhất                                  |
| `password` | có       | Tối thiểu 6 ký tự                                                                                           |
| `fullName` | có       | Không rỗng, tối đa 100 ký tự                                                                                |
| `phone`    | có       | 9 đến 15 chữ số (bỏ qua khoảng trắng, `.`, `-`, cho phép `+` đầu), chuỗi sau khi cắt hai đầu tối đa 20 ký tự. Không duy nhất |
| `role`     | có       | `CUSTOMER` hoặc `TECHNICIAN` (không tự đăng ký `ADMIN`, BR01)                                               |

Response 201 (đăng ký xong nhận luôn token, giao diện vẫn chuyển người dùng về trang đăng nhập):

```
{
  "success": true,
  "data": {
    "id": 18,
    "email": "mau@example.com",
    "fullName": "Mẫu",
    "phone": "0912345678",
    "role": "CUSTOMER",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Đăng ký thành công"
}
```

**POST /api/auth/login** — thông điệp: `Đăng nhập thành công`. Request Body: `email`, `password` (bắt buộc, không rỗng; email không phân biệt hoa thường).

Response 200:

```
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 2,
      "email": "khach1@demo.vn",
      "fullName": "Nguyễn Minh Anh",
      "phone": "0901000001",
      "role": "CUSTOMER",
      "isLocked": false,
      "ratingAvg": 4.5
    }
  },
  "message": "Đăng nhập thành công"
}
```

Sai email hoặc mật khẩu trả cùng một thông báo `401 UNAUTHORIZED`. Tài khoản bị khóa nhưng đúng mật khẩu trả `403 ACCOUNT_LOCKED` (`Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên`).

**POST /api/auth/logout** — Response 200: `{ "success": true, "data": null, "message": "Đăng xuất thành công" }`. JWT không lưu phiên ở server nên API này **không thu hồi token**: token cũ vẫn dùng được đến khi hết hạn; giao diện tự xóa token (mục 2.6).

**GET /api/auth/me** — Response 200 (có thêm `createdAt` so với `user` của đăng nhập):

```
{
  "success": true,
  "data": {
    "id": 2,
    "email": "khach1@demo.vn",
    "fullName": "Nguyễn Minh Anh",
    "phone": "0901000001",
    "role": "CUSTOMER",
    "isLocked": false,
    "ratingAvg": 4.5,
    "createdAt": "2026-11-21T01:35:28.139Z"
  },
  "message": "Thành công"
}
```

#### **2.3.2. RequestController – /api/requests**

| **Method** | **Endpoint**                | **Vai trò** | **Mô tả**                                    | **Success** | **Error Code thường gặp**                                                                              |
| ---------- | --------------------------- | ----------- | -------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| **POST**   | /api/requests               | KH          | Khách hàng tạo tin sửa chữa                  | 201         | VALIDATION_ERROR, FORBIDDEN                                                                            |
| **GET**    | /api/requests/my            | KH          | Danh sách tin của tôi                        | 200         | FORBIDDEN                                                                                              |
| **GET**    | /api/requests               | KTV         | Danh sách tin đang chờ đề xuất + bộ lọc      | 200         | FORBIDDEN                                                                                              |
| **GET**    | /api/requests/{id}          | KH, KTV     | Chi tiết tin sửa chữa                        | 200         | REQUEST_NOT_FOUND, NOT_OWNER (khách hàng xem tin người khác), FORBIDDEN (quản trị viên)                |
| **PATCH**  | /api/requests/{id}          | KH (chủ tin) | Sửa tin sửa chữa                            | 200         | REQUEST_NOT_FOUND, NOT_OWNER, REQUEST_NOT_EDITABLE, VALIDATION_ERROR                                   |
| **PATCH**  | /api/requests/{id}/close    | KH (chủ tin) | Đóng tin sửa chữa                           | 200         | REQUEST_NOT_FOUND, NOT_OWNER, REQUEST_ALREADY_SELECTED, INVALID_STATUS_TRANSITION                      |
| **PATCH**  | /api/requests/{id}/complete | KH (chủ tin) | Xác nhận hoàn thành công việc               | 200         | REQUEST_NOT_FOUND, NOT_OWNER, INVALID_STATUS_TRANSITION                                                |

**POST /api/requests** — thông điệp: `Tạo tin thành công`. Tin mới luôn ở `WAITING_PROPOSAL`.

Request Body (mọi trường bắt buộc):

| Trường          | Quy tắc                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------ |
| `title`         | Không rỗng, tối đa 200 ký tự                                                                     |
| `description`   | Không rỗng (không giới hạn độ dài ngoài giới hạn thân yêu cầu 100 KB)                            |
| `category`      | Không rỗng, tối đa 50 ký tự (giao diện chọn trong: Sửa máy lạnh, Sửa máy giặt, Sửa tủ lạnh, Sửa ống nước, Sửa điện, Khác; API nhận chuỗi bất kỳ) |
| `location`      | Không rỗng, tối đa 255 ký tự (giao diện ghép thành `Quận/Huyện, Tỉnh/Thành phố`)                 |
| `preferredTime` | Chuỗi ngày giờ phân tích được; **không** bắt buộc là tương lai                                   |

Response 201:

```
{
  "success": true,
  "data": {
    "id": 51,
    "customerId": 2,
    "title": "Tin mẫu",
    "description": "Mô tả",
    "category": "Sửa điện",
    "location": "Quận 1, TP. Hồ Chí Minh",
    "preferredTime": "2026-12-01T09:00:00.000Z",
    "status": "WAITING_PROPOSAL",
    "selectedProposalId": null,
    "createdAt": "2026-11-21T00:20:53.553Z"
  },
  "message": "Tạo tin thành công"
}
```

**GET /api/requests/my** (KH) — chỉ trả tin của chính mình (BR03). Query: `status` (một trong 4 trạng thái; giá trị khác bị bỏ qua), `sort`, `page`, `size` (mục 2.6). Mỗi phần tử là tin như trên **kèm** `proposalCount` (tổng số đề xuất của tin, mọi trạng thái). Danh sách có `meta`.

**GET /api/requests** (KTV) — chỉ trả tin ở `WAITING_PROPOSAL` (BR04), phần tử có `proposalCount`, không có thông tin khách hàng. Query:

| Tham số    | Quy tắc                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| `category` | Khớp **chính xác** với `category` của tin                                                             |
| `location` | Khớp **chứa chuỗi** không phân biệt hoa thường (`ILIKE '%giá trị%'`). Ký tự `%` và `_` chưa được thoát nên đóng vai trò ký tự đại diện |
| `sort`     | Giá trị kết thúc bằng `,asc` (ví dụ `createdAt,asc`) sắp tăng dần; mọi giá trị khác hoặc bỏ trống sắp giảm dần theo thời gian tạo |
| `page`, `size` | Mục 2.6                                                                                           |

Tham số `status` bị bỏ qua ở API này.

**GET /api/requests/{id}** — thông tin tin, cộng thêm tùy vai trò:

- **KH (chủ tin):** `customer: { id, fullName, phone }`, `hasReviewed` và `receivedReview`. Khách hàng khác nhận `403 NOT_OWNER`.
- **KTV:** xem được tin ở **mọi trạng thái**. `customer: { id, fullName }`; trường `customer.phone` **chỉ có** khi kỹ thuật viên này là người được chọn (BR15). Thêm: `hasProposed` (có đề xuất đang hiệu lực), `myProposalId`, `myProposalStatus` (đề xuất mới nhất của mình trên tin, hoặc `null`), `canPropose` (tin đang chờ và chưa có đề xuất đang hiệu lực), `hasReviewed`, `receivedReview`.

`hasReviewed` là người xem đã gửi đánh giá cho công việc này chưa (BR14). `receivedReview` là đánh giá bên kia gửi cho người xem ở công việc này: `{ id, requestId, fromUserId, toUserId, rating, comment, createdAt, fromUser: { id, fullName, role } }`, hoặc `null` khi chưa có hay người xem không tham gia công việc.

Response 200 (KTV được chọn):

```
{
  "success": true,
  "data": {
    "id": 3,
    "customerId": 2,
    "title": "Rò rỉ ống nước dưới bồn rửa",
    "description": "Ống nước dưới bồn rửa bếp rò rỉ, ướt tủ bếp. Cần xử lý trong ngày.",
    "category": "Sửa ống nước",
    "location": "Quận 1, TP. Hồ Chí Minh",
    "preferredTime": "2026-11-22T03:00:00.000Z",
    "status": "SELECTED",
    "selectedProposalId": 4,
    "createdAt": "2026-11-21T00:20:52.134Z",
    "customer": { "id": 2, "fullName": "Nguyễn Minh Anh", "phone": "0901000001" },
    "hasProposed": true,
    "myProposalId": 4,
    "myProposalStatus": "ACCEPTED",
    "canPropose": false,
    "hasReviewed": false,
    "receivedReview": null
  },
  "message": "Thành công"
}
```

**PATCH /api/requests/{id}** — thông điệp: `Chỉnh sửa tin thành công`. Chỉ chủ tin, chỉ khi tin ở `WAITING_PROPOSAL`. Request Body: **một phần** của thân tạo tin (`title`, `description`, `category`, `location`, `preferredTime`); phải có ít nhất một trường (nếu không: `VALIDATION_ERROR` với `field: "body"`), trường gửi lên được kiểm tra như khi tạo. Response 200: tin sau khi sửa (như POST). Tin đã chọn kỹ thuật viên hoặc hoàn thành trả `409 REQUEST_NOT_EDITABLE` (`Tin đã chọn kỹ thuật viên, không thể chỉnh sửa`), tin đã đóng trả `409 REQUEST_NOT_EDITABLE` (`Tin đã đóng, không thể chỉnh sửa`).

**PATCH /api/requests/{id}/close** — thông điệp: `Đóng tin thành công`. Chỉ chủ tin, chỉ khi tin ở `WAITING_PROPOSAL` (BR06): đã chọn kỹ thuật viên hoặc hoàn thành trả `400 REQUEST_ALREADY_SELECTED` (`Không thể đóng tin đã chọn kỹ thuật viên`), đã đóng trả `400 INVALID_STATUS_TRANSITION`. Các đề xuất đang chờ của tin **được giữ nguyên** ở `PENDING` nhưng tin không còn nhận chọn. Response 200: tin với `status` `CLOSED`.

**PATCH /api/requests/{id}/complete** — thông điệp: `Xác nhận hoàn thành thành công`. Chỉ chủ tin (BR11), chỉ từ `SELECTED` sang `COMPLETED` (BR12); trạng thái khác trả `400 INVALID_STATUS_TRANSITION`. Tạo thông báo `REQUEST_COMPLETED` cho kỹ thuật viên được chọn. Response 200: tin với `status` `COMPLETED`.

Trạng thái tin (BR12): `WAITING_PROPOSAL` → `SELECTED` → `COMPLETED`; hoặc `WAITING_PROPOSAL` → `CLOSED`.

#### **2.3.3. ProposalController – /api/proposals**

| **Method** | **Endpoint**                       | **Vai trò**       | **Mô tả**                                 | **Success** | **Error Code thường gặp**                                                                                                      |
| ---------- | ---------------------------------- | ----------------- | ----------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **POST**   | /api/proposals                     | KTV               | Kỹ thuật viên gửi đề xuất                 | 201         | VALIDATION_ERROR, REQUEST_NOT_FOUND, REQUEST_NOT_WAITING, ALREADY_PROPOSED                                                     |
| **GET**    | /api/proposals/my                  | KTV               | Danh sách đề xuất của tôi                 | 200         | FORBIDDEN                                                                                                                      |
| **GET**    | /api/proposals/request/{requestId} | KH (chủ tin)      | Danh sách đề xuất của một tin             | 200         | REQUEST_NOT_FOUND, NOT_OWNER                                                                                                   |
| **GET**    | /api/proposals/{id}                | KH (chủ tin), KTV (người gửi) | Chi tiết đề xuất              | 200         | PROPOSAL_NOT_FOUND, NOT_OWNER                                                                                                  |
| **PATCH**  | /api/proposals/{id}                | KTV (người gửi)   | Sửa đề xuất                               | 200         | PROPOSAL_NOT_FOUND, NOT_OWNER, PROPOSAL_ALREADY_ACCEPTED, PROPOSAL_NOT_EDITABLE, REQUEST_ALREADY_SELECTED, REQUEST_NOT_WAITING, VALIDATION_ERROR |
| **PATCH**  | /api/proposals/{id}/close          | KTV (người gửi)   | **Rút đề xuất** (không phải đóng tin)     | 200         | PROPOSAL_NOT_FOUND, NOT_OWNER, PROPOSAL_ALREADY_ACCEPTED, INVALID_STATUS_TRANSITION                                            |
| **PATCH**  | /api/proposals/{id}/accept         | KH (chủ tin)      | Khách hàng chấp nhận đề xuất              | 200         | PROPOSAL_NOT_FOUND, NOT_OWNER, PROPOSAL_ALREADY_ACCEPTED, INVALID_STATUS_TRANSITION                                            |

**POST /api/proposals** — thông điệp: `Gửi đề xuất thành công`. Request Body:

| Trường              | Bắt buộc | Quy tắc                                                                                                                      |
| ------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `requestId`         | có       | Số nguyên dương                                                                                                              |
| `price`             | có       | **Số** (không phải chuỗi) từ 0,1 đến dưới 10¹³. Cột lưu một chữ số thập phân nên giá có nhiều chữ số thập phân bị làm tròn |
| `description`       | có       | Không rỗng                                                                                                                   |
| `estimatedDuration` | không    | Chuỗi tối đa 50 ký tự; rỗng hoặc `null` được lưu là `null`                                                                    |

Lỗi giá: `Giá đề xuất phải lớn hơn 0` (≤ 0 hoặc không phải số), `Giá đề xuất tối thiểu 0,1`, `Giá đề xuất quá lớn`. Tin phải ở `WAITING_PROPOSAL` (BR07) và kỹ thuật viên chưa có đề xuất đang hiệu lực cho tin (BR08). Gửi thành công tạo thông báo `NEW_PROPOSAL` cho khách hàng chủ tin (mục 2.3.6).

Response 201:

```
{
  "success": true,
  "data": {
    "id": 79,
    "requestId": 7,
    "technicianId": 4,
    "price": 300000,
    "description": "Cân chỉnh quạt",
    "estimatedDuration": "1 giờ",
    "status": "PENDING",
    "createdAt": "2026-11-21T00:20:53.672Z"
  },
  "message": "Gửi đề xuất thành công"
}
```

**GET /api/proposals/request/{requestId}** (KH chủ tin, BR09) — trả **mảng** mọi đề xuất của tin ở mọi trạng thái (kể cả `REJECTED`, `WITHDRAWN`), cũ nhất trước, **không phân trang** (không có `meta`). Mỗi phần tử là đề xuất kèm `technician: { id, fullName, ratingAvg }`:

```
{
  "id": 1, "requestId": 1, "technicianId": 4, "price": 450000,
  "description": "Kiểm tra, nạp gas R32 và vệ sinh dàn lạnh. Bảo hành 1 tháng.",
  "estimatedDuration": "2-3 giờ", "status": "PENDING", "createdAt": "2026-11-21T00:20:52.143Z",
  "technician": { "id": 4, "fullName": "Trần Quốc Huy", "ratingAvg": 4.7 }
}
```

**GET /api/proposals/my** (KTV) — đề xuất của chính mình, mới nhất trước, có phân trang. Query: `status` (`PENDING`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`; giá trị khác bị bỏ qua), `page`, `size`. Mỗi phần tử là đề xuất kèm `request: { id, title, status, category, location }` (không có `sort`).

**GET /api/proposals/{id}** — đề xuất kèm `technician: { id, fullName, ratingAvg }` và `request: { id, title, status, customerId }`. Xem được: chủ tin và kỹ thuật viên đã gửi đề xuất đó; người khác nhận `403 NOT_OWNER`.

**PATCH /api/proposals/{id}** — thông điệp: `Chỉnh sửa đề xuất thành công`. Chỉ người gửi. Request Body: một phần của `price`, `description`, `estimatedDuration` (ít nhất một trường, quy tắc như khi gửi). Điều kiện: đề xuất ở `PENDING` và tin ở `WAITING_PROPOSAL`. Đề xuất đã chấp nhận: `409 PROPOSAL_ALREADY_ACCEPTED`; đã bị từ chối hoặc đã rút: `409 PROPOSAL_NOT_EDITABLE`; tin đã chọn kỹ thuật viên hoặc hoàn thành: `400 REQUEST_ALREADY_SELECTED`; tin đã đóng: `400 REQUEST_NOT_WAITING`.

**PATCH /api/proposals/{id}/close** — thông điệp: `Rút đề xuất thành công`. Đề xuất sang `WITHDRAWN` (vẫn lưu để tra cứu lịch sử, không thể khôi phục). Chỉ người gửi, chỉ khi `PENDING`: đã chấp nhận trả `409 PROPOSAL_ALREADY_ACCEPTED`; đã bị từ chối hoặc đã rút trả `400 INVALID_STATUS_TRANSITION`. Đề xuất đã rút không còn đang hiệu lực (BR08) nên kỹ thuật viên có thể gửi đề xuất mới cho cùng tin.

**PATCH /api/proposals/{id}/accept** — thông điệp: `Chấp nhận đề xuất thành công`. Chỉ chủ tin (BR09). Trong **một giao dịch**: đề xuất → `ACCEPTED`; các đề xuất `PENDING` khác của tin → `REJECTED` (BR10); tin → `SELECTED` kèm `selectedProposalId` (BR12); tạo thông báo `PROPOSAL_ACCEPTED` cho kỹ thuật viên được chọn (BR16) và `PROPOSAL_REJECTED` cho từng kỹ thuật viên có đề xuất vừa bị từ chối (đề xuất đã rút không được báo). Tin đã chọn rồi trả `409 PROPOSAL_ALREADY_ACCEPTED`; tin đã đóng hoặc đề xuất không còn `PENDING` (đã rút, đã bị từ chối) trả `400 INVALID_STATUS_TRANSITION`. Response 200: đề xuất với `status` `ACCEPTED` (cấu trúc như POST).

#### **2.3.4. ReviewController – /api/reviews**

| **Method** | **Endpoint**               | **Vai trò**  | **Mô tả**                                              | **Success** | **Error Code thường gặp**                                                                             |
| ---------- | -------------------------- | ------------ | ------------------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------- |
| **POST**   | /api/reviews               | KH, KTV      | Tạo đánh giá hai chiều                                 | 201         | VALIDATION_ERROR, REQUEST_NOT_FOUND, NOT_OWNER, CANNOT_REVIEW_YET, ALREADY_REVIEWED                   |
| **GET**    | /api/reviews/user/{userId} | mọi vai trò  | Xem các đánh giá mà một người dùng đã nhận             | 200         | USER_NOT_FOUND                                                                                        |

**POST /api/reviews** — thông điệp: `Đánh giá thành công`. Request Body: `requestId` (số nguyên dương), `rating` (số nguyên 1 đến 5), `comment` (không bắt buộc, chuỗi tối đa 1000 ký tự). Người được đánh giá do hệ thống xác định: khách hàng chủ tin đánh giá kỹ thuật viên được chọn, kỹ thuật viên được chọn đánh giá khách hàng chủ tin; người không tham gia công việc nhận `403 NOT_OWNER`. Thứ tự kiểm tra: tin tồn tại (`404 REQUEST_NOT_FOUND`) → người gọi tham gia công việc (`403 NOT_OWNER`; tin chưa chọn kỹ thuật viên thì chưa có bên còn lại nên cũng trả mã này) → tin ở `COMPLETED` (BR13, nếu chưa: `400 CANNOT_REVIEW_YET`) → chưa đánh giá (BR14, nếu rồi: `409 ALREADY_REVIEWED`). Điểm trung bình `ratingAvg` của người được đánh giá được tính lại (làm tròn một chữ số thập phân) trong cùng giao dịch, cùng với thông báo `REVIEW_RECEIVED` cho người được đánh giá.

Response 201:

```
{
  "success": true,
  "data": {
    "id": 26,
    "requestId": 3,
    "fromUserId": 2,
    "toUserId": 4,
    "rating": 5,
    "comment": "Tốt",
    "createdAt": "2026-11-21T01:35:29.277Z"
  },
  "message": "Đánh giá thành công"
}
```

**GET /api/reviews/user/{userId}** — đánh giá người dùng đó **nhận được**, mới nhất trước, có phân trang (`page`, `size`). Mỗi phần tử là đánh giá kèm `fromUser: { id, fullName, role }` và `requestTitle`. `meta` có thêm `user: { id, fullName, role, ratingAvg }` của người được xem:

```
{
  "success": true,
  "data": [
    {
      "id": 26, "requestId": 3, "fromUserId": 2, "toUserId": 4, "rating": 5, "comment": "Tốt",
      "createdAt": "2026-11-21T01:35:29.277Z",
      "fromUser": { "id": 2, "fullName": "Nguyễn Minh Anh", "role": "CUSTOMER" },
      "requestTitle": "Rò rỉ ống nước dưới bồn rửa"
    },
    {
      "id": 21, "requestId": 37, "fromUserId": 10, "toUserId": 4, "rating": 5, "comment": "Tìm đúng chỗ rò, không phải đục nhiều tường.",
      "createdAt": "2026-11-21T01:35:28.555Z",
      "fromUser": { "id": 10, "fullName": "Phạm Đình Quang", "role": "CUSTOMER" },
      "requestTitle": "Rò nước xuống trần nhà tầng dưới"
    }
  ],
  "message": "Thành công",
  "meta": {
    "page": 1, "size": 2, "totalElements": 4, "totalPages": 2,
    "user": { "id": 4, "fullName": "Trần Quốc Huy", "role": "TECHNICIAN", "ratingAvg": 4.8 }
  }
}
```

#### **2.3.5. AdminController – /api/admin**

Mọi API trong nhóm này chỉ dành cho **QTV** (vai trò khác nhận `403 FORBIDDEN`).

| **Method** | **Endpoint**                 | **Mô tả**                                   | **Success** | **Error Code thường gặp**         |
| ---------- | ---------------------------- | ------------------------------------------- | ----------- | --------------------------------- |
| **GET**    | /api/admin/users             | Xem danh sách tài khoản                     | 200         | FORBIDDEN                         |
| **PATCH**  | /api/admin/users/{id}/lock   | Khóa tài khoản                              | 200         | USER_NOT_FOUND, FORBIDDEN         |
| **PATCH**  | /api/admin/users/{id}/unlock | Mở khóa tài khoản                           | 200         | USER_NOT_FOUND, FORBIDDEN         |

**GET /api/admin/users** — chỉ liệt kê tài khoản `CUSTOMER` và `TECHNICIAN` (**không gồm** quản trị viên), mới tạo trước. Query:

| Tham số        | Quy tắc                                                                                              |
| -------------- | ---------------------------------------------------------------------------------------------------- |
| `q`            | Khớp chứa chuỗi, không phân biệt hoa thường, trên `fullName` hoặc `email` (`%` và `_` chưa được thoát) |
| `role`         | `CUSTOMER` hoặc `TECHNICIAN`; giá trị khác bị bỏ qua                                                 |
| `status`       | `ACTIVE` (không bị khóa) hoặc `LOCKED` (bị khóa); giá trị khác bị bỏ qua                             |
| `page`, `size` | Mục 2.6                                                                                              |

Mỗi phần tử là người dùng `{ id, email, fullName, phone, role, isLocked, ratingAvg, createdAt }`. `meta` có thêm `summary: { active, locked }` tính trên **tập đã lọc** (không phải một trang):

```
"meta": { "page": 1, "size": 2, "totalElements": 7, "totalPages": 4, "summary": { "active": 7, "locked": 0 } }
```

**PATCH /api/admin/users/{id}/lock** — thông điệp: `Khóa tài khoản thành công`; **/unlock** — `Mở khóa tài khoản thành công`. Response 200: người dùng sau thay đổi (cấu trúc như phần tử ở trên). Gọi lại khi tài khoản đã ở đúng trạng thái vẫn trả `200`. Tài khoản quản trị viên (kể cả chính mình) trả `403 FORBIDDEN` (`Không thể khóa hoặc mở khóa tài khoản quản trị viên`). Tài khoản bị khóa bị chặn ở mọi API cần đăng nhập ngay yêu cầu kế tiếp (`403 ACCOUNT_LOCKED`, BR02).

#### **2.3.6. NotifyController – /api/notifications**

Mọi vai trò đã đăng nhập; mỗi người chỉ thấy thông báo của chính mình.

| **Method** | **Endpoint**                    | **Mô tả**                                  | **Success** | **Error Code thường gặp**                    |
| ---------- | ------------------------------- | ------------------------------------------ | ----------- | -------------------------------------------- |
| **GET**    | /api/notifications              | Danh sách thông báo của user, mới nhất trước | 200       | UNAUTHORIZED                                 |
| **GET**    | /api/notifications/unread-count | Số thông báo chưa đọc                      | 200         | UNAUTHORIZED                                 |
| **PATCH**  | /api/notifications/{id}/read    | Đánh dấu đã đọc                            | 200         | NOTIFICATION_NOT_FOUND, NOT_OWNER            |

**GET /api/notifications** — có phân trang (`page`, `size`). Response (kỹ thuật viên `ktv2@demo.vn` trong dữ liệu mẫu):

```
{
  "success": true,
  "data": [
    {
      "id": 149,
      "userId": 5,
      "type": "REVIEW_RECEIVED",
      "title": "Bạn nhận được một đánh giá mới",
      "content": "Phạm Đình Quang đã đánh giá 3 sao cho công việc \"Máy lạnh có mùi hôi khi bật\"",
      "isRead": false,
      "relatedId": 35,
      "createdAt": "2026-11-21T01:27:40.747Z"
    }
  ],
  "message": "Thành công",
  "meta": { "page": 1, "size": 2, "totalElements": 12, "totalPages": 6 }
}
```

**Các loại thông báo.** Mỗi thông báo được tạo trong cùng giao dịch với sự kiện gây ra nó, nên sự kiện thất bại thì không có thông báo. `title` là chuỗi cố định theo loại; tên tin chỉ nằm ở `content`. **`relatedId` có ý nghĩa khác nhau theo `type`**: mã đề xuất với ba loại đầu, mã tin với hai loại sau.

| `type`              | Người nhận                                    | Khi nào                                                                                              | `relatedId` | `title`                                      | Ví dụ `content`                                                                    |
| ------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| `NEW_PROPOSAL`      | Khách hàng chủ tin                            | Kỹ thuật viên gửi đề xuất mới cho tin (`POST /api/proposals`), kể cả gửi lại sau khi rút              | Mã đề xuất  | Có đề xuất mới cho tin của bạn               | `Trần Quốc Huy đã gửi đề xuất 450.000 đồng cho tin "Máy lạnh không làm mát"`        |
| `PROPOSAL_ACCEPTED` | Kỹ thuật viên được chọn (BR16)                | Khách hàng chấp nhận đề xuất (`PATCH /api/proposals/{id}/accept`)                                     | Mã đề xuất  | Đề xuất của bạn đã được chấp nhận            | `Đề xuất của bạn cho tin "Rò rỉ ống nước dưới bồn rửa" đã được chấp nhận`           |
| `PROPOSAL_REJECTED` | Mỗi kỹ thuật viên có đề xuất đang chờ của tin | Cùng lúc khách hàng chấp nhận một đề xuất khác (BR10); đề xuất đã rút không được báo                  | Mã đề xuất bị từ chối | Đề xuất của bạn không được chọn      | `Khách hàng đã chọn kỹ thuật viên khác cho tin "Rò rỉ ống nước dưới bồn rửa"`        |
| `REQUEST_COMPLETED` | Kỹ thuật viên được chọn                       | Khách hàng xác nhận hoàn thành (`PATCH /api/requests/{id}/complete`)                                  | Mã tin      | Khách hàng đã xác nhận hoàn thành công việc  | `Công việc "Tủ lạnh không đông" đã được khách hàng xác nhận hoàn thành`             |
| `REVIEW_RECEIVED`   | Bên được đánh giá (khách hàng hoặc kỹ thuật viên) | Bên kia gửi đánh giá (`POST /api/reviews`)                                                       | Mã tin      | Bạn nhận được một đánh giá mới               | `Lê Thị Hoa đã đánh giá 5 sao cho công việc "Tủ lạnh không đông"`                  |

Một ví dụ cho mỗi loại (trường `id`, `userId`, `isRead`, `createdAt` như ví dụ ở trên):

```
{ "type": "NEW_PROPOSAL",      "title": "Có đề xuất mới cho tin của bạn", "content": "Trần Quốc Huy đã gửi đề xuất 450.000 đồng cho tin \"Máy lạnh không làm mát\"", "relatedId": 1 }
{ "type": "PROPOSAL_ACCEPTED", "title": "Đề xuất của bạn đã được chấp nhận", "content": "Đề xuất của bạn cho tin \"Rò rỉ ống nước dưới bồn rửa\" đã được chấp nhận", "relatedId": 4 }
{ "type": "PROPOSAL_REJECTED", "title": "Đề xuất của bạn không được chọn", "content": "Khách hàng đã chọn kỹ thuật viên khác cho tin \"Rò rỉ ống nước dưới bồn rửa\"", "relatedId": 5 }
{ "type": "REQUEST_COMPLETED", "title": "Khách hàng đã xác nhận hoàn thành công việc", "content": "Công việc \"Tủ lạnh không đông\" đã được khách hàng xác nhận hoàn thành", "relatedId": 4 }
{ "type": "REVIEW_RECEIVED",   "title": "Bạn nhận được một đánh giá mới", "content": "Lê Thị Hoa đã đánh giá 5 sao cho công việc \"Tủ lạnh không đông\"", "relatedId": 4 }
```

Rút đề xuất, sửa đề xuất, sửa tin và đóng tin **không** tạo thông báo. Cột `type` trong CSDL là chuỗi tự do (`VARCHAR(50)`), nên thêm loại mới không cần đổi lược đồ.

**GET /api/notifications/unread-count** — `{ "success": true, "data": { "count": 12 }, "message": "Thành công" }`.

**PATCH /api/notifications/{id}/read** — thông điệp: `Đã đánh dấu đã đọc`. Response 200: thông báo với `isRead: true`. Gọi lại trên thông báo đã đọc vẫn trả `200`. Thông báo của người khác trả `403 NOT_OWNER`.

#### **2.3.7. Hệ thống (không cần đăng nhập)**

| **Method** | **Endpoint**    | **Mô tả**                                   | **Response 200**                                                     |
| ---------- | --------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| **GET**    | /               | Kiểm tra backend đang chạy                  | `{ "success": true, "message": "Backend đang hoạt động" }`           |
| **GET**    | /api/health     | Kiểm tra API                                | `{ "success": true, "data": { "status": "ok" }, "message": "Thành công" }` |

Mọi đường dẫn khác trả `404 NOT_FOUND` (`Không tìm thấy đường dẫn`). Backend không phục vụ giao diện: giao diện chạy riêng (Vite, cổng 5173) và chuyển tiếp `/api` sang backend.

#### **2.3.8. UserController – /api/users**

| **Method** | **Endpoint**    | **Vai trò**  | **Mô tả**                                         | **Success** | **Error Code thường gặp**   |
| ---------- | --------------- | ------------ | ------------------------------------------------- | ----------- | --------------------------- |
| **GET**    | /api/users/{id} | mọi vai trò  | Xem hồ sơ một người dùng (thông tin tài khoản và số liệu đánh giá) | 200         | UNAUTHORIZED, USER_NOT_FOUND |
| **PATCH**  | /api/users/me   | mọi vai trò  | Tự sửa họ tên và số điện thoại của chính mình      | 200         | VALIDATION_ERROR, UNAUTHORIZED, ACCOUNT_LOCKED |

**GET /api/users/{id}** — thông điệp: `Thành công`. Người đã đăng nhập, vai trò nào cũng gọi được; phần nào hiện cho ai do backend quyết định:

| Trường | Ai thấy | Ý nghĩa |
| ------ | ------- | ------- |
| `id`, `fullName`, `role`, `createdAt` | mọi vai trò | Mã, họ tên, vai trò, ngày tham gia |
| `ratingAvg` | mọi vai trò | Điểm trung bình (một chữ số thập phân), `null` khi chưa có đánh giá |
| `reviewCount` | mọi vai trò | Số đánh giá người này **nhận được** (khớp `meta.totalElements` của `GET /api/reviews/user/{userId}`) |
| `ratingCounts` | mọi vai trò | Số đánh giá theo từng mức sao, đủ khóa `"1"` đến `"5"` (mức không có thì `0`); tổng bằng `reviewCount` |
| `completedCount` | mọi vai trò | Số công việc đã hoàn thành: khách hàng là số tin của mình ở `COMPLETED`; kỹ thuật viên là số tin `COMPLETED` đã chọn đề xuất của mình; quản trị viên luôn `0` |
| `email`, `phone`, `isLocked` | **chỉ quản trị viên và chính chủ** | Người khác không nhận ba trường này (không có khóa trong JSON). Số điện thoại khách hàng vẫn theo BR15 ở các API tin và công việc |

Quy tắc: tài khoản **quản trị viên** chỉ quản trị viên xem được, người dùng thường nhận `404 USER_NOT_FOUND` như khi mã không tồn tại (BR01). Tài khoản **bị khóa** vẫn xem được hồ sơ (lịch sử và đánh giá còn nguyên); chỉ quản trị viên thấy `isLocked`. Mã không phải số nguyên dương hoặc lớn hơn 2147483647 trả `404 USER_NOT_FOUND`. Đánh giá chi tiết của người đó lấy bằng `GET /api/reviews/user/{userId}` (mục 2.3.4); giao diện tải hồ sơ trước và bỏ qua đánh giá khi hồ sơ trả `404`, vì API đánh giá vẫn trả `200` cho mã quản trị viên.

```
GET /api/users/15 (khách hàng đang đăng nhập xem kỹ thuật viên)
{
  "success": true,
  "data": {
    "id": 15, "fullName": "Dương Văn Tài", "role": "TECHNICIAN", "ratingAvg": 4,
    "reviewCount": 4, "ratingCounts": { "1": 0, "2": 1, "3": 0, "4": 1, "5": 2 },
    "completedCount": 5, "createdAt": "2026-11-26T07:14:07.000Z"
  },
  "message": "Thành công"
}
```

Quản trị viên hoặc chính chủ nhận thêm `"email"`, `"phone"`, `"isLocked"`.

**PATCH /api/users/me** — thông điệp: `Cập nhật thông tin thành công`. Người đã đăng nhập tự sửa thông tin của **chính mình**; không có đường dẫn sửa theo mã người dùng nên không sửa được tài khoản người khác (kể cả quản trị viên sửa người dùng). Request Body:

| Trường | Quy tắc |
| ------ | ------- |
| `fullName` | Chuỗi 1 đến 100 ký tự sau khi bỏ khoảng trắng hai đầu |
| `phone` | Cùng quy tắc khi đăng ký: 9 đến 15 chữ số, cho phép `+`, dấu cách, `.`, `-`; tối đa 20 ký tự sau khi bỏ khoảng trắng hai đầu |

Gửi trường nào thì sửa trường đó; cần ít nhất một trong hai, thiếu cả hai trả `400 VALIDATION_ERROR` với `details: [{ "field": "body", ... }]`. Giá trị được cắt khoảng trắng hai đầu trước khi lưu, ký tự đặc biệt giữ nguyên văn. Email (dùng để đăng nhập), mật khẩu, vai trò, `isLocked`, `ratingAvg` **không sửa được**: gửi kèm thì bị bỏ qua. Response 200: người dùng sau khi sửa, cùng cấu trúc `GET /api/auth/me` (không có mật khẩu). Chưa đăng nhập nhận `401 UNAUTHORIZED`; tài khoản bị khóa nhận `403 ACCOUNT_LOCKED` (BR02).

#### **2.3.9. AnalyticsController – /api/admin/analytics (chỉ quản trị viên)**

| **Method** | **Endpoint** | **Mô tả** | **Success** | **Error Code thường gặp** |
| ---------- | ------------ | --------- | ----------- | ------------------------- |
| **GET** | /api/admin/analytics/overview | Tám chỉ số tổng quan, chuỗi theo mốc thời gian, tin theo trạng thái, 5 hoạt động gần nhất | 200 | VALIDATION_ERROR, FORBIDDEN |
| **GET** | /api/admin/analytics/growth | Tăng trưởng người dùng, người hoạt động, giá trị công việc, giao dịch, nội dung | 200 | VALIDATION_ERROR, FORBIDDEN |
| **GET** | /api/admin/analytics/users | DAU, WAU, MAU, giữ chân, rời bỏ, tăng trưởng, mới/quay lại, theo vai trò, trạng thái, khu vực, thiết bị, hệ điều hành | 200 | VALIDATION_ERROR, FORBIDDEN |
| **GET** | /api/admin/analytics/activity | Đăng nhập/đăng xuất, hoạt động theo vai trò, tạo/cập nhật/đóng, chức năng dùng nhiều, người hoạt động nhiều, bản đồ nhiệt, số đo API, nhật ký gần đây | 200 | VALIDATION_ERROR, FORBIDDEN |
| **GET** | /api/admin/analytics/system | CPU, RAM, ổ đĩa, lưu lượng API, thời gian phản hồi, tỷ lệ lỗi, thời gian chạy, CSDL, kết nối, lịch sử mẫu, cảnh báo vượt ngưỡng | 200 | FORBIDDEN |
| **GET** | /api/admin/analytics/alerts | Cảnh báo và nhận định kèm mức độ, thời điểm, trạng thái xử lý, hành động đề xuất | 200 | FORBIDDEN |
| **PATCH** | /api/admin/analytics/alerts/{key} | Đổi trạng thái xử lý: body `{ "status": "NEW" \| "ACKNOWLEDGED" \| "RESOLVED" }` | 200 | VALIDATION_ERROR, NOT_FOUND, FORBIDDEN |
| **GET** | /api/admin/analytics/reports/{type} | Báo cáo chi tiết có tìm, lọc, sắp xếp, phân trang | 200 | VALIDATION_ERROR, NOT_FOUND, FORBIDDEN |
| **GET** | /api/admin/analytics/reports/{type}/export | Tải file `format=csv` (mặc định) hoặc `format=xlsx` theo cùng bộ lọc, tối đa 10.000 dòng | 200 | VALIDATION_ERROR, NOT_FOUND, FORBIDDEN |

**Tham số thời gian** (overview, growth, users, activity, reports): `range` = `today` | `7d` | `30d` (mặc định) | `90d` | `12m` | `custom`; với `custom` thêm `from`, `to` dạng `YYYY-MM-DD` (tối đa 731 ngày). Mốc ngày tính theo giờ Việt Nam. Kỳ so sánh là khoảng cùng độ dài liền trước. Phản hồi có `range` gồm `from`, `to`, `previousFrom`, `previousTo`, `bucket` (`hour` | `day` | `month`) và `labels`. Riêng báo cáo nhận thêm `range=all` (không lọc thời gian).

**Báo cáo:** `type` = `users` | `revenue` | `transactions` | `activity` | `system` | `errors` | `performance`. Query: `q`, `sort` (khóa cột), `dir` (`asc` | `desc`), `page`, `size`, các khóa lọc do phản hồi khai báo trong `filters`, và `print=1` để lấy tối đa 2000 dòng cho việc in. `data` gồm `title`, `columns` (khóa, nhãn, kiểu, nhãn giá trị), `filters`, `sort`, `summary`, `rows`; `meta` như mục 2.6. `system` và `performance` chỉ có số đo từ khi backend khởi động.

**Định nghĩa số liệu:** giao dịch = đề xuất được chấp nhận; giá trị công việc = giá đề xuất được chọn của tin đã hoàn thành (nền tảng không thu tiền nên không phải doanh thu); thời điểm chấp nhận và hoàn thành lấy từ thông báo `PROPOSAL_ACCEPTED` và `REQUEST_COMPLETED`; người dùng hoạt động = khách hàng hoặc kỹ thuật viên (không tính quản trị viên) đã đăng tin, gửi đề xuất, đánh giá, chấp nhận, xác nhận hoàn thành hoặc có thao tác được ghi trong nhật ký (đăng nhập, sửa, đóng…); lỗi hệ thống = phản hồi 500 đã ghi nhật ký, kể cả lúc mất CSDL (ghi bù khi CSDL chạy lại, mất nếu backend khởi động lại trước đó). Dự án không thu thập quốc gia và địa chỉ IP.

### 2.4. Entities chính

Các thực thể dữ liệu tương ứng với bảng trong cơ sở dữ liệu (API dùng camelCase). Tên bảng người dùng trong CSDL là `users`. Hai bảng chỉ phục vụ trang thống kê (`migrations/003`): `activity_log` (người dùng, vai trò, hành động, đối tượng, kết quả, mã HTTP, mẫu đường dẫn, loại thiết bị, hệ điều hành, thời điểm; **không** lưu địa chỉ IP, chuỗi User-Agent, email nhập vào hay nội dung yêu cầu) và `alert_state` (khóa cảnh báo, trạng thái xử lý, người cập nhật).

**User** (không bao giờ trả `passwordHash`)

```
id, email, passwordHash, fullName, phone, role, isLocked, ratingAvg, createdAt
```

`role`: `CUSTOMER` | `TECHNICIAN` | `ADMIN`. `ratingAvg`: số một chữ số thập phân (1,0 đến 5,0) hoặc `null` nếu chưa có đánh giá.

**RepairRequest**

```
id, customerId, title, description, category, location, preferredTime, status, selectedProposalId, createdAt
```

Các API danh sách và chi tiết thêm các trường tính toán (`proposalCount`, `customer`, `hasProposed`, `canPropose`, `myProposalId`, `myProposalStatus`, `hasReviewed`, `receivedReview`) như mô tả ở mục 2.3.2.

**Proposal**

```
id, requestId, technicianId, price, description, estimatedDuration, status, createdAt
```

`price` là số (một chữ số thập phân); `estimatedDuration` có thể `null`.

**Review**

```
id, requestId, fromUserId, toUserId, rating, comment, createdAt
```

`comment` có thể `null`. Duy nhất theo (`requestId`, `fromUserId`).

**Notification**

```
id, userId, type, title, content, isRead, relatedId, createdAt
```

`type`: `NEW_PROPOSAL` | `PROPOSAL_ACCEPTED` | `PROPOSAL_REJECTED` | `REQUEST_COMPLETED` | `REVIEW_RECEIVED`. `relatedId` là mã đề xuất hoặc mã tin tùy `type` (bảng ở mục 2.3.6).

### 2.5. Ví dụ Response thực tế

#### **2.5.1. Thành công – Tạo tin sửa chữa**

Xem phản hồi `POST /api/requests` ở mục 2.3.2.

#### **2.5.2. Lỗi – Tạo tin thiếu trường bắt buộc (400)**

```
{
  "success": false,
  "status": 400,
  "error": "Bad Request",
  "message": "Dữ liệu không hợp lệ",
  "code": "VALIDATION_ERROR",
  "timestamp": "2026-11-21T00:20:53.877Z",
  "path": "/api/requests",
  "details": [
    { "field": "title", "message": "Tiêu đề không được để trống" },
    { "field": "description", "message": "Mô tả sự cố không được để trống" },
    { "field": "category", "message": "Phải chọn loại dịch vụ" },
    { "field": "location", "message": "Địa điểm không được để trống" },
    { "field": "preferredTime", "message": "Phải chọn thời gian mong muốn" }
  ]
}
```

#### **2.5.3. Thành công – Gửi đề xuất**

Xem phản hồi `POST /api/proposals` ở mục 2.3.3.

#### **2.5.4. Lỗi – Đã gửi đề xuất rồi (409 Conflict)**

```
{
  "success": false,
  "status": 409,
  "error": "Conflict",
  "message": "Bạn đã gửi đề xuất cho tin này",
  "code": "ALREADY_PROPOSED",
  "timestamp": "2026-11-21T09:15:30.123Z",
  "path": "/api/proposals"
}
```

#### **2.5.5. Thành công – Chấp nhận đề xuất**

Xem phản hồi `PATCH /api/proposals/{id}/accept` ở mục 2.3.3 (đề xuất `ACCEPTED`).

#### **2.5.6. Lỗi – Đóng tin đã chọn KTV (400)**

```
{
  "success": false,
  "status": 400,
  "error": "Bad Request",
  "message": "Không thể đóng tin đã chọn kỹ thuật viên",
  "code": "REQUEST_ALREADY_SELECTED",
  "timestamp": "2026-11-21T14:00:00.000Z",
  "path": "/api/requests/15/close"
}
```

#### **2.5.7. Lỗi Validation – Gửi đề xuất (400)**

```
{
  "success": false,
  "status": 400,
  "error": "Bad Request",
  "message": "Dữ liệu không hợp lệ",
  "code": "VALIDATION_ERROR",
  "timestamp": "2026-11-21T11:02:00.000Z",
  "path": "/api/proposals",
  "details": [
    { "field": "price", "message": "Giá đề xuất phải lớn hơn 0" },
    { "field": "description", "message": "Mô tả không được để trống" }
  ]
}
```

#### **2.5.8. Lỗi – Chưa đăng nhập (401) và sai vai trò (403)**

```
{ "success": false, "status": 401, "error": "Unauthorized", "message": "Bạn cần đăng nhập để tiếp tục", "code": "UNAUTHORIZED", "timestamp": "2026-11-21T00:20:53.852Z", "path": "/api/requests/1" }

{ "success": false, "status": 403, "error": "Forbidden", "message": "Bạn không có quyền thực hiện thao tác này", "code": "FORBIDDEN", "timestamp": "2026-11-21T00:20:53.861Z", "path": "/api/admin/users" }
```

#### **2.5.9. Lỗi – Đường dẫn không tồn tại (404)**

```
{ "success": false, "status": 404, "error": "Not Found", "message": "Không tìm thấy đường dẫn", "code": "NOT_FOUND", "timestamp": "2026-11-21T00:20:53.868Z", "path": "/api/khong-co" }
```

### 2.6. Ghi chú kỹ thuật

1. **Authentication:** JWT Bearer Token. Token chứa `userId` và `role`, hạn dùng theo cấu hình (mặc định 1 ngày). Mỗi yêu cầu backend tra lại người dùng trong CSDL nên tài khoản bị khóa bị chặn ngay (`403 ACCOUNT_LOCKED`, BR02). **Đăng xuất không thu hồi token** vì JWT không lưu phiên ở server: token cũ vẫn dùng được đến khi hết hạn; giao diện xóa token khỏi trình duyệt.
2. **Authorization:** Role-based (CUSTOMER / TECHNICIAN / ADMIN) + kiểm tra ownership theo BR01–BR16. Kỹ thuật viên đã gửi đề xuất cũng xem được chi tiết đề xuất đó. Số điện thoại khách hàng chỉ trả cho khách hàng chủ tin và kỹ thuật viên được chọn (BR15); không có mã lỗi riêng cho việc này (trường `phone` đơn giản là vắng mặt).
3. **Pagination:** áp dụng cho các API danh sách có `meta`. `page` và `size` được đọc bằng `parseInt`: giá trị không đọc được hoặc bằng 0 dùng mặc định (`page` = 1, `size` = 10), số âm được nâng lên mức tối thiểu 1. `page` bắt đầu từ **1**; `page` lớn hơn **1.000.000** bị kẹp về 1.000.000 (trả danh sách rỗng, không báo lỗi). `size` tối đa **100** (lớn hơn bị kẹp về 100). `sort` chỉ có ở `GET /api/requests/my` và `GET /api/requests` (chỉ sắp theo thời gian tạo; `,asc` ở cuối là tăng dần, còn lại là mới nhất trước); các danh sách khác luôn sắp theo thời gian tạo, mới nhất trước (riêng danh sách đề xuất của một tin: cũ nhất trước).
4. **Giới hạn thân yêu cầu:** JSON tối đa 100 KB. Thân lớn hơn, JSON không hợp lệ, bảng mã hoặc mã hóa nội dung không được hỗ trợ đều trả `400 VALIDATION_ERROR` (không có `details`).
5. **Quy ước đặt tên:** Database dùng snake_case, API JSON dùng camelCase.
6. **CORS:** chỉ cho phép nguồn gốc cấu hình trong `CLIENT_URL` (mặc định `http://localhost:5173`).
7. **Ngoài phạm vi:** Thanh toán thật, Chat real-time, Mobile native – không có API trong phiên bản này.

**Tham chiếu:** Tài liệu SRS rút gọn, kiến trúc phân lớp và ERD của Nhóm 03.

### 2.7. Khác biệt so với bản thiết kế ban đầu

Tóm tắt các điểm contract này khác bản đầu; chi tiết, lý do và nguồn ở [thay-doi-thiet-ke.md](thay-doi-thiet-ke.md).

- Chỉ **22 mã lỗi** được dùng. `MISSING_REQUIRED_FIELD`, `REVIEW_NOT_FOUND`, `CONTACT_NOT_VISIBLE` được bản đầu liệt kê nhưng backend không dùng (thiếu trường báo `VALIDATION_ERROR` kèm `details`; không có API nào trả `REVIEW_NOT_FOUND`; BR15 được đáp ứng bằng cách không trả `phone`). Ngược lại backend có thêm `NOT_FOUND` (đường dẫn không có) và `INTERNAL_ERROR`.
- `page` bắt đầu từ **1** (bản đầu ghi mặc định 0) và bị kẹp ở 1.000.000 thay vì báo lỗi.
- Thân yêu cầu lớn hơn 100 KB trả `400 VALIDATION_ERROR`, không phải `413`. Không dùng `204`.
- `PATCH /api/proposals/{id}/close` là **rút đề xuất** (trạng thái `WITHDRAWN`), không phải đóng tin; đóng tin là `PATCH /api/requests/{id}/close`.
- Thêm API ngoài bản đầu: `GET /api/proposals/my`, `GET /`, `GET /api/health`, `GET /api/users/{id}` (hồ sơ người dùng) và `PATCH /api/users/me` (tự sửa họ tên, số điện thoại), mục 2.3.8.
- Thêm trường ngoài bản đầu: `proposalCount`, `hasProposed`, `canPropose`, `myProposalId`, `myProposalStatus`, `hasReviewed`, `receivedReview`, `meta.summary` (admin), `meta.user` (đánh giá).
- Bản đầu liệt kê `CONTACT_NOT_VISIBLE` là mã lỗi của `GET /api/requests/{id}`; thực tế API vẫn trả `200` và chỉ bỏ trường `customer.phone` khi kỹ thuật viên chưa được chọn.
- `PATCH /api/requests/{id}` trả `REQUEST_NOT_EDITABLE` (409) khi tin không còn sửa được, không dùng `REQUEST_ALREADY_SELECTED`/`REQUEST_NOT_WAITING` như bảng lỗi bản đầu.
- `sort` chỉ có ở hai API danh sách tin (bản đầu ghi mọi API danh sách đều hỗ trợ); `GET /api/requests` bỏ qua `status`; `GET /api/admin/users` có thêm tham số `q`.
- Đăng xuất **không thu hồi token** (DEV-01); kỹ thuật viên gửi đề xuất cũng xem được chi tiết đề xuất đó (DEV-02).
- Giá đề xuất tối thiểu 0,1; số điện thoại tối đa 20 ký tự; mã số vượt 2147483647 trả `404` (sửa lỗi Sprint 4, [bug-log.md](bug-log.md)).
- Thông báo (US20, BR16) mở rộng từ một loại (`PROPOSAL_ACCEPTED`) lên năm loại theo yêu cầu ngày 2026-11-21: thêm `NEW_PROPOSAL`, `PROPOSAL_REJECTED`, `REQUEST_COMPLETED`, `REVIEW_RECEIVED`. Không thêm API hay trường mới; chỉ thêm các giá trị `type`, và `relatedId` nay là mã đề xuất hoặc mã tin tùy `type`.
