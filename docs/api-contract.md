## **API Contract**

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

_Trường meta chỉ xuất hiện ở các API trả về danh sách có phân trang._

#### **2.1.2 Cấu trúc lỗi chuẩn (Error Response)**

Tất cả API khi lỗi đều trả về cùng một cấu trúc thống nhất:

```
{
  "success": false,
  "status": 400,
  "error": "Bad Request",
  "message": "Tin đã được chọn kỹ thuật viên, không thể đóng",
  "code": "REQUEST_ALREADY_SELECTED",
  "timestamp": "2026-10-29T09:15:30.123Z",
  "path": "/api/requests/15/close",
  "details": [
    { "field": "price", "message": "Giá đề xuất phải lớn hơn 0" }
  ]
}
```

**Giải thích các trường:**

- **success:** Luôn là false khi lỗi.
- **status:** HTTP Status Code tương ứng.
- **error:** Tên lỗi ngắn (Bad Request, Unauthorized...).
- **message:** Thông báo dễ hiểu cho người dùng.
- **code:** Mã lỗi nghiệp vụ (frontend dùng để xử lý riêng).
- **timestamp:** Thời điểm xảy ra lỗi (ISO 8601).
- **path:** Endpoint gây lỗi.
- **details:** Mảng chi tiết lỗi validation (optional).

#### **2.1.3. HTTP Status Code sử dụng**

| **Status** | **Ý nghĩa**           | **Khi nào dùng**                                  |
| ---------- | --------------------- | ------------------------------------------------- |
| **200**    | OK                    | Thành công (GET, PUT, PATCH)                      |
| **201**    | Created               | Tạo mới thành công (POST)                         |
| **204**    | No Content            | Xóa thành công / không có data trả về             |
| **400**    | Bad Request           | Validation lỗi / vi phạm quy tắc nghiệp vụ        |
| **401**    | Unauthorized          | Chưa đăng nhập hoặc token hết hạn                 |
| **403**    | Forbidden             | Không có quyền (sai role / không phải chủ sở hữu) |
| **404**    | Not Found             | Không tìm thấy resource                           |
| **409**    | Conflict              | Xung đột dữ liệu (đã gửi đề xuất rồi...)          |
| **500**    | Internal Server Error | Lỗi hệ thống                                      |

### 2.2. Danh sách mã lỗi nghiệp vụ (Error Code)

| **Code**                      | **HTTP** | **Mô tả**                                                  |
| ----------------------------- | -------- | ---------------------------------------------------------- |
| **UNAUTHORIZED**              | 401      | Chưa đăng nhập / Token không hợp lệ                        |
| **FORBIDDEN**                 | 403      | Không có quyền thực hiện hành động                         |
| **ACCOUNT_LOCKED**            | 403      | Tài khoản đã bị khóa                                       |
| **USER_NOT_FOUND**            | 404      | Không tìm thấy người dùng                                  |
| **REQUEST_NOT_FOUND**         | 404      | Không tìm thấy tin sửa chữa                                |
| **PROPOSAL_NOT_FOUND**        | 404      | Không tìm thấy đề xuất                                     |
| **REVIEW_NOT_FOUND**          | 404      | Không tìm thấy đánh giá                                    |
| **NOTIFICATION_NOT_FOUND**    | 404      | Không tìm thấy thông báo                                   |
| **VALIDATION_ERROR**          | 400      | Lỗi validate dữ liệu đầu vào                               |
| **MISSING_REQUIRED_FIELD**    | 400      | Thiếu trường bắt buộc                                      |
| **INVALID_STATUS_TRANSITION** | 400      | Chuyển trạng thái không hợp lệ (BR12)                      |
| **REQUEST_ALREADY_SELECTED**  | 400      | Tin đã chọn kỹ thuật viên (không đóng được)                |
| **REQUEST_NOT_WAITING**       | 400      | Tin không ở trạng thái chờ đề xuất                         |
| **ALREADY_PROPOSED**          | 409      | Kỹ thuật viên đã gửi đề xuất cho tin này rồi (BR08)        |
| **PROPOSAL_ALREADY_ACCEPTED** | 409      | Đã có đề xuất được chấp nhận                               |
| **NOT_OWNER**                 | 403      | Không phải chủ sở hữu tin / đề xuất                        |
| **CANNOT_REVIEW_YET**         | 400      | Công việc chưa hoàn thành, chưa được đánh giá              |
| **ALREADY_REVIEWED**          | 409      | Đã đánh giá rồi (BR14)                                     |
| **SELF_REVIEW_NOT_ALLOWED**   | 400      | Không được tự đánh giá chính mình                          |
| **CONTACT_NOT_VISIBLE**       | 403      | Chưa được chọn nên không xem được thông tin liên hệ (BR15) |
| **EMAIL_ALREADY_EXISTS**      | 409      | Email đã được sử dụng để đăng ký                           |
| **REQUEST_NOT_EDITABLE**      | 409      | Tin sửa chữa không còn đủ điều kiện để chỉnh sửa.          |
| **PROPOSAL_NOT_EDITABLE**     | 409      | Đề xuất không còn đủ điều kiện để chỉnh sửa.               |

### 2.3. Danh sách API theo Controller

#### **2.3.1. AuthController – /api/auth**

| **Method** | **Endpoint**       | **Mô tả**                   | **Success** | **Error Code thường gặp**              |
| ---------- | ------------------ | --------------------------- | ----------- | -------------------------------------- |
| **POST**   | /api/auth/register | Đăng ký tài khoản           | 201         | VALIDATION_ERROR, EMAIL_ALREADY_EXISTS |
| **POST**   | /api/auth/login    | Đăng nhập                   | 200         | UNAUTHORIZED, ACCOUNT_LOCKED           |
| **POST**   | /api/auth/logout   | Đăng xuất                   | 200         | UNAUTHORIZED                           |
| **GET**    | /api/auth/me       | Lấy thông tin user hiện tại | 200         | UNAUTHORIZED                           |

**Chi tiết Request / Response**

```
POST /api/auth/register
```

**Request Body:**

```
{
  "email": "string",
  "password": "string",
  "fullName": "string",
  "phone": "string",
  "role": "CUSTOMER" | "TECHNICIAN"
}
```

**Response 201:**

```
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "role": "CUSTOMER",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Đăng ký thành công"
}
POST /api/auth/login
```

**Request Body:**

```
{
  "email": "string",
  "password": "string"
}
```

**Response 200:**

```
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567",
      "role": "CUSTOMER",
      "isLocked": false,
      "ratingAvg": 4.5
    }
  }
}
GET /api/auth/me
```

**Response 200:**

```
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "phone": "0901234567",
    "role": "CUSTOMER",
    "isLocked": false,
    "ratingAvg": 4.5,
    "createdAt": "2026-10-01T08:00:00Z"
  }
}
```

#### **2.3.2. RequestController – /api/requests**

| **Method** | **Endpoint**                | **Mô tả**                           | **Success** | **Error Code thường gặp**                                                                                                                                                                           |
| ---------- | --------------------------- | ----------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **POST**   | /api/requests               | Khách hàng tạo tin sửa chữa         | 201         | VALIDATION_ERROR, FORBIDDEN                                                                                                                                                                         |
| **GET**    | /api/requests/my            | Danh sách tin của tôi (Customer)    | 200         | UNAUTHORIZED, FORBIDDEN                                                                                                                                                                             |
| **GET**    | /api/requests               | Danh sách tin + filter (Technician) | 200         | UNAUTHORIZED                                                                                                                                                                                        |
| **GET**    | /api/requests/{id}          | Chi tiết tin sửa chữa               | 200         | REQUEST_NOT_FOUND, CONTACT_NOT_VISIBLE                                                                                                                                                              |
| **PATCH**  | /api/requests/{id}          | Sửa tin sửa chữa                    | 200         | REQUEST_NOT_FOUND<br><br>NOT_OWNER<br><br>REQUEST_ALREADY_SELECTED<br><br>REQUEST_NOT_WAITING<br><br>VALIDATION_ERROR<br><br>MISSING_REQUIRED_FIELD<br><br>UNAUTHORIZED<br><br>REQUEST_NOT_EDITABLE |
| **PATCH**  | /api/requests/{id}/close    | Đóng tin sửa chữa                   | 200         | REQUEST_NOT_FOUND, NOT_OWNER, REQUEST_ALREADY_SELECTED                                                                                                                                              |
| **PATCH**  | /api/requests/{id}/complete | Xác nhận hoàn thành công việc       | 200         | REQUEST_NOT_FOUND, NOT_OWNER, INVALID_STATUS_TRANSITION                                                                                                                                             |

**Chi tiết Request / Response**

```
POST /api/requests
```

**Request Body:**

```
{
  "title": "string",
  "description": "string",
  "category": "string",
  "location": "string",
  "preferredTime": "datetime"
}
```

**Response 201:**

```
{
  "success": true,
  "data": {
    "id": 15,
    "customerId": 1,
    "title": "Sửa máy lạnh không lạnh",
    "description": "Máy lạnh chạy nhưng không làm lạnh...",
    "category": "Điện lạnh",
    "location": "Quận 7, TP.HCM",
    "preferredTime": "2026-11-05T09:00:00Z",
    "status": "WAITING_PROPOSAL",
    "selectedProposalId": null,
    "createdAt": "2026-10-30T10:00:00Z"
  },
  "message": "Tạo tin thành công"
}
GET /api/requests/{id}
```

**Response 200:**

```
{
  "success": true,
  "data": {
    "id": 15,
    "customerId": 1,
    "title": "Sửa máy lạnh không lạnh",
    "description": "Máy lạnh chạy nhưng không làm lạnh...",
    "category": "Điện lạnh",
    "location": "Quận 7, TP.HCM",
    "preferredTime": "2026-11-05T09:00:00Z",
    "status": "SELECTED",
    "selectedProposalId": 42,
    "createdAt": "2026-10-30T10:00:00Z",
    "customer": {
      "id": 1,
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567"
    }
  }
}
```

_Lưu ý: Trường phone của customer chỉ hiện khi kỹ thuật viên đã được chọn (BR15). Query params (GET /api/requests): category, location, status, page, size, sort_

Trạng thái tin (BR12): WAITING_PROPOSAL → SELECTED → COMPLETED (hoặc CLOSED)

#### **2.3.3. ProposalController – /api/proposals**

| **Method** | **Endpoint**                       | **Mô tả**                     | **Success** | **Error Code thường gặp**                                                                                                                                                                                                            |
| ---------- | ---------------------------------- | ----------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **POST**   | /api/proposals                     | Kỹ thuật viên gửi đề xuất     | 201         | REQUEST_NOT_WAITING, ALREADY_PROPOSED, VALIDATION_ERROR                                                                                                                                                                              |
| **GET**    | /api/proposals/request/{requestId} | Danh sách đề xuất của một tin | 200         | REQUEST_NOT_FOUND, NOT_OWNER                                                                                                                                                                                                         |
| **GET**    | /api/proposals/{id}                | Chi tiết đề xuất              | 200         | PROPOSAL_NOT_FOUND, NOT_OWNER                                                                                                                                                                                                        |
| **PATCH**  | /api/proposals/{id}                | Sửa đề xuất                   | 200         | PROPOSAL_NOT_FOUND<br><br>NOT_OWNER<br><br>PROPOSAL_ALREADY_ACCEPTED<br><br>REQUEST_NOT_FOUND<br><br>REQUEST_ALREADY_SELECTED<br><br>VALIDATION_ERROR<br><br>MISSING_REQUIRED_FIELD<br><br>UNAUTHORIZED<br><br>PROPOSAL_NOT_EDITABLE |
| **PATCH**  | /api/proposals/{id}/close          | Rút đề xuất                   | 200         | PROPOSAL_NOT_FOUND<br><br>NOT_OWNER<br><br>PROPOSAL_ALREADY_ACCEPTED<br><br>REQUEST_NOT_FOUND<br><br>INVALID_STATUS_TRANSITION<br><br>UNAUTHORIZED                                                                                   |
| **PATCH**  | /api/proposals/{id}/accept         | Khách hàng chấp nhận đề xuất  | 200         | PROPOSAL_NOT_FOUND, NOT_OWNER, PROPOSAL_ALREADY_ACCEPTED, INVALID_STATUS_TRANSITION                                                                                                                                                  |

**Chi tiết Request / Response**

```
POST /api/proposals
```

**Request Body:**

```
{
  "requestId": 15,
  "price": 350000,
  "description": "string",
  "estimatedDuration": "string"
}
```

**Response 201:**

```
{
  "success": true,
  "data": {
    "id": 42,
    "requestId": 15,
    "technicianId": 8,
    "price": 350000,
    "description": "Tôi chuyên sửa máy lạnh, có thể đến trong ngày mai",
    "estimatedDuration": "2-3 giờ",
    "status": "PENDING",
    "createdAt": "2026-10-30T11:00:00Z"
  },
  "message": "Gửi đề xuất thành công"
}
PATCH /api/proposals/{id}/accept
```

**Response 200:**

```
{
  "success": true,
  "data": {
    "id": 42,
    "requestId": 15,
    "technicianId": 8,
    "price": 350000,
    "description": "Tôi chuyên sửa máy lạnh...",
    "estimatedDuration": "2-3 giờ",
    "status": "ACCEPTED",
    "createdAt": "2026-10-30T11:00:00Z"
  },
  "message": "Chấp nhận đề xuất thành công"
}
```

_Khi chấp nhận: tin chuyển sang SELECTED, các đề xuất khác → REJECTED, tạo notification cho KTV._

#### **2.3.4. ReviewController – /api/reviews**

| **Method** | **Endpoint**               | **Mô tả**                 | **Success** | **Error Code thường gặp**                                                      |
| ---------- | -------------------------- | ------------------------- | ----------- | ------------------------------------------------------------------------------ |
| **POST**   | /api/reviews               | Tạo đánh giá hai chiều    | 201         | CANNOT_REVIEW_YET, ALREADY_REVIEWED, SELF_REVIEW_NOT_ALLOWED, VALIDATION_ERROR |
| **GET**    | /api/reviews/user/{userId} | Xem đánh giá của một user | 200         | USER_NOT_FOUND                                                                 |

**Chi tiết Request / Response**

```
POST /api/reviews
```

**Request Body:**

```
{
  "requestId": 15,
  "rating": 5,
  "comment": "Kỹ thuật viên làm việc rất chuyên nghiệp"
}
```

**Response 201:**

```
{
  "success": true,
  "data": {
    "id": 7,
    "requestId": 15,
    "fromUserId": 1,
    "toUserId": 8,
    "rating": 5,
    "comment": "Kỹ thuật viên làm việc rất chuyên nghiệp",
    "createdAt": "2026-10-31T16:00:00Z"
  },
  "message": "Đánh giá thành công"
}
```

#### **2.3.5. AdminController – /api/admin**

| **Method** | **Endpoint**                 | **Mô tả**               | **Success** | **Error Code thường gặp** |
| ---------- | ---------------------------- | ----------------------- | ----------- | ------------------------- |
| **GET**    | /api/admin/users             | Xem danh sách tài khoản | 200         | FORBIDDEN                 |
| **PATCH**  | /api/admin/users/{id}/lock   | Khóa tài khoản          | 200         | USER_NOT_FOUND, FORBIDDEN |
| **PATCH**  | /api/admin/users/{id}/unlock | Mở khóa tài khoản       | 200         | USER_NOT_FOUND, FORBIDDEN |

Query params (GET /api/admin/users): role, status, page, size

#### **2.3.6. NotifyController – /api/notifications**

| **Method** | **Endpoint**                    | **Mô tả**                    | **Success** | **Error Code thường gặp**         |
| ---------- | ------------------------------- | ---------------------------- | ----------- | --------------------------------- |
| **GET**    | /api/notifications              | Danh sách thông báo của user | 200         | UNAUTHORIZED                      |
| **GET**    | /api/notifications/unread-count | Số thông báo chưa đọc        | 200         | UNAUTHORIZED                      |
| **PATCH**  | /api/notifications/{id}/read    | Đánh dấu đã đọc              | 200         | NOTIFICATION_NOT_FOUND, NOT_OWNER |

**Response GET /api/notifications:**

```
{
  "success": true,
  "data": [
    {
      "id": 3,
      "userId": 8,
      "type": "PROPOSAL_ACCEPTED",
      "title": "Đề xuất của bạn đã được chấp nhận",
      "content": "Khách hàng đã chọn bạn cho tin #15",
      "isRead": false,
      "relatedId": 42,
      "createdAt": "2026-10-30T12:00:00Z"
    }
  ],
  "meta": { "page": 1, "size": 10, "totalElements": 1, "totalPages": 1 }
}
```

_Thông báo chính (BR16): Đề xuất được chấp nhận → gửi cho kỹ thuật viên._

### 2.4. Entities chính

Các thực thể dữ liệu tương ứng với bảng trong cơ sở dữ liệu (API dùng camelCase):

**User**

```
id, email, passwordHash, fullName, phone, role, isLocked, ratingAvg, createdAt
```

**RepairRequest**

```
id, customerId, title, description, category, location, preferredTime, status, selectedProposalId, createdAt
```

**Proposal**

```
id, requestId, technicianId, price, description, estimatedDuration, status, createdAt
```

**Review**

```
id, requestId, fromUserId, toUserId, rating, comment, createdAt
```

**Notification**

```
id, userId, type, title, content, isRead, relatedId, createdAt
```

### 2.5. Ví dụ Response thực tế

#### **2.5.1. Thành công – Tạo tin sửa chữa**

```
{
  "success": true,
  "data": {
    "id": 15,
    "customerId": 1,
    "title": "Sửa máy lạnh không lạnh",
    "description": "Máy lạnh chạy nhưng không làm lạnh, nghi gas hết",
    "category": "Điện lạnh",
    "location": "Quận 7, TP.HCM",
    "preferredTime": "2026-11-05T09:00:00Z",
    "status": "WAITING_PROPOSAL",
    "selectedProposalId": null,
    "createdAt": "2026-10-30T10:00:00Z"
  },
  "message": "Tạo tin thành công"
}
```

#### **2.5.2. Lỗi – Tạo tin thiếu trường bắt buộc (400)**

```
{
  "success": false,
  "status": 400,
  "error": "Bad Request",
  "message": "Dữ liệu không hợp lệ",
  "code": "VALIDATION_ERROR",
  "timestamp": "2026-10-30T10:01:00.000Z",
  "path": "/api/requests",
  "details": [
    { "field": "title", "message": "Tiêu đề không được để trống" },
    { "field": "category", "message": "Phải chọn loại dịch vụ" }
  ]
}
```

#### **2.5.3. Thành công – Gửi đề xuất**

```
{
  "success": true,
  "data": {
    "id": 42,
    "requestId": 15,
    "technicianId": 8,
    "price": 350000,
    "description": "Tôi chuyên sửa máy lạnh, có thể đến trong ngày mai",
    "estimatedDuration": "2-3 giờ",
    "status": "PENDING",
    "createdAt": "2026-10-30T11:00:00Z"
  },
  "message": "Gửi đề xuất thành công"
}
```

#### **2.5.4. Lỗi – Đã gửi đề xuất rồi (409 Conflict)**

```
{
  "success": false,
  "status": 409,
  "error": "Conflict",
  "message": "Bạn đã gửi đề xuất cho tin sửa chữa này rồi",
  "code": "ALREADY_PROPOSED",
  "timestamp": "2026-10-30T11:05:00.000Z",
  "path": "/api/proposals"
}
```

#### **2.5.5. Thành công – Chấp nhận đề xuất**

```
{
  "success": true,
  "data": {
    "id": 42,
    "requestId": 15,
    "technicianId": 8,
    "price": 350000,
    "description": "Tôi chuyên sửa máy lạnh...",
    "estimatedDuration": "2-3 giờ",
    "status": "ACCEPTED",
    "createdAt": "2026-10-30T11:00:00Z"
  },
  "message": "Chấp nhận đề xuất thành công"
}
```

#### **2.5.6. Lỗi – Đóng tin đã chọn KTV (400)**

```
{
  "success": false,
  "status": 400,
  "error": "Bad Request",
  "message": "Tin đã được chọn kỹ thuật viên, không thể đóng",
  "code": "REQUEST_ALREADY_SELECTED",
  "timestamp": "2026-10-30T14:00:00.000Z",
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
  "timestamp": "2026-10-30T11:02:00.000Z",
  "path": "/api/proposals",
  "details": [
    { "field": "price", "message": "Giá đề xuất phải lớn hơn 0" },
    { "field": "description", "message": "Mô tả không được để trống" }
  ]
}
```

### 2.6. Ghi chú kỹ thuật

1. **Authentication:** JWT Bearer Token. Token chứa userId và role.
2. **Authorization:** Role-based (CUSTOMER / TECHNICIAN / ADMIN) + kiểm tra ownership theo BR01–BR16.
3. **Pagination:** Tất cả API list hỗ trợ page, size, sort. Mặc định page=0, size=10.
4. **Quy ước đặt tên:** Database dùng snake_case, API JSON dùng camelCase.
5. **Ngoài phạm vi:** Thanh toán thật, Chat real-time, Mobile native – không có API trong phiên bản này.

**Tham chiếu:** Tài liệu SRS rút gọn, kiến trúc phân lớp và ERD của Nhóm 03.
