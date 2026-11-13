# Dữ liệu mẫu và tài khoản demo

Thư mục này tạo dữ liệu mẫu cho CSDL phát triển (`DATABASE_URL`) để thử ứng dụng ngay mà không phải đăng ký và nhập tay.

```bash
npm run migrate       # dựng bảng nếu chưa có
npm run seed          # tạo dữ liệu mẫu; dừng nếu đã có tài khoản demo
npm run seed:reset    # xóa TOÀN BỘ dữ liệu ứng dụng rồi tạo lại từ đầu
```

`seed:reset` xóa cả dữ liệu bạn tự nhập (các bảng `users`, `repair_request`, `proposal`, `review`, `notification`; bảng `schema_migrations` được giữ nguyên). Lệnh từ chối chạy khi `NODE_ENV=production`.

## Tài khoản demo

Mật khẩu chung: `Demo@123` (chỉ dành cho môi trường phát triển).

| Vai trò | Email | Họ tên | Dùng để thử |
| --- | --- | --- | --- |
| Quản trị viên | `admin@demo.vn` | Quản Trị Demo | Quản lý tài khoản (US04, US05) |
| Khách hàng | `khach1@demo.vn` | Nguyễn Minh Anh | Tin chờ đề xuất, đã chọn kỹ thuật viên |
| Khách hàng | `khach2@demo.vn` | Lê Thị Hoa | Tin hoàn thành, đã đóng |
| Kỹ thuật viên | `ktv1@demo.vn` | Trần Quốc Huy | Có việc được chọn và việc đã hoàn thành chưa đánh giá khách |
| Kỹ thuật viên | `ktv2@demo.vn` | Phạm Văn Bình | Có đề xuất không được chọn và việc đã hoàn thành |
| Kỹ thuật viên | `ktv3@demo.vn` | Võ Thanh Sơn | Có đề xuất đã rút |
| Kỹ thuật viên | `bikhoa@demo.vn` | Đỗ Văn Khóa | Tài khoản bị khóa: không đăng nhập được, thử mở khóa bằng quản trị viên |

## Tin mẫu

| Mã tin | Chủ tin | Trạng thái | Đề xuất |
| --- | --- | --- | --- |
| SC-001 Máy lạnh không làm mát | khach1 | Chờ đề xuất | ktv1 và ktv2 chờ xem xét, ktv3 đã rút |
| SC-002 Máy giặt không vắt được | khach1 | Chờ đề xuất | Chưa có (thử sửa tin, đóng tin) |
| SC-003 Rò rỉ ống nước | khach1 | Đã chọn kỹ thuật viên | ktv1 được chọn, ktv2 không được chọn |
| SC-004 Tủ lạnh không đông | khach2 | Hoàn thành | ktv2 được chọn, ktv3 không được chọn; đã đánh giá hai chiều |
| SC-005 Chập điện ổ cắm | khach2 | Hoàn thành | ktv1 được chọn; chỉ khách hàng đã đánh giá |
| SC-006 Máy lạnh phát tiếng ồn | khach2 | Đã đóng | Chưa có |
| SC-007 Quạt trần kêu to | khach2 | Chờ đề xuất | ktv3 chờ xem xét |

## Cách hoạt động

- Dữ liệu viết trong các file `tai-khoan.js`, `tin-sua-chua.js`, `de-xuat.js`, `danh-gia.js`. Sửa các file này để đổi dữ liệu mẫu.
- `chay-seed.js` tạo dữ liệu bằng đúng các service của ứng dụng (đăng ký, đăng tin, gửi đề xuất, chấp nhận, xác nhận hoàn thành, đánh giá, khóa tài khoản), không chèn SQL trực tiếp. Nhờ đó các quy tắc nghiệp vụ BR01 đến BR16 được áp dụng như khi dùng thật: đề xuất khác tự bị từ chối khi chọn kỹ thuật viên, kỹ thuật viên được chọn nhận thông báo, điểm trung bình được tính lại.
- Thời gian mong muốn của tin tính theo lúc chạy seed, nên tin chưa hoàn thành luôn nằm trong tương lai.
- `npm test` có `tests/seed.test.js` chạy seed trên CSDL test và kiểm tra các quy tắc nghiệp vụ trên dữ liệu tạo ra.
- Seed không nằm trong một transaction. Nếu bị lỗi giữa chừng, chạy `npm run seed:reset`.
