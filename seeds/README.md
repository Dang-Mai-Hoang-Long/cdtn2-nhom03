# Dữ liệu mẫu và tài khoản demo

Thư mục này tạo dữ liệu mẫu cho CSDL phát triển (`DATABASE_URL`) để thử ứng dụng ngay mà không phải đăng ký và nhập tay. Gồm hai phần:

- **Phần viết tay** (`thu-cong/`): 17 tài khoản, **50 tin** mà từng tin nhắm một tình huống hoặc giá trị biên cụ thể.
- **Phần tự động** (`tu-dong/`): sinh **1000 tin** cùng 230 tài khoản, đa dạng và lệch như dữ liệu thật, tái lập được bằng hạt giống cố định.

```bash
npm run migrate            # dựng bảng nếu chưa có
npm run seed               # viết tay + 1000 tin tự động (khoảng 10 giây); dừng nếu đã có tài khoản demo
npm run seed:reset         # xóa TOÀN BỘ dữ liệu ứng dụng rồi tạo lại từ đầu
npm run seed:thu-cong      # chỉ phần viết tay (vài giây)
npm run seed:thu-cong:reset
npm run seed -- --so-tin=300 --hat-giong=42   # đổi số tin tự động và hạt giống
```

`seed:reset` xóa cả dữ liệu bạn tự nhập (các bảng `users`, `repair_request`, `proposal`, `review`, `notification`; bảng `schema_migrations` được giữ nguyên). Lệnh từ chối chạy khi `NODE_ENV=production`.

## Phần viết tay: 17 tài khoản, 50 tin

Mỗi tin viết tay nhắm một tình huống cụ thể để thử một chức năng hoặc một giá trị biên. Mã tin dưới đây là thứ tự trong `thu-cong/tin-sua-chua.js` (SC-001 là tin có mã 1). Bảy tin đầu, bảy tài khoản đầu và chín đề xuất đầu giữ nguyên mã từ phiên bản trước vì `docs/bug-log.md` và `docs/api-contract.md` dẫn tới các mã đó. Mã thông báo thì không còn ổn định: từ khi mỗi đề xuất mới cũng tạo thông báo, các thông báo "được chấp nhận" của ba đề xuất đầu chỉ ổn định về người nhận và đề xuất (kiểm tra bằng `tests/seed.test.js`).

### Tài khoản demo

Mật khẩu chung: `Demo@123` (chỉ dành cho môi trường phát triển).

| Vai trò | Email | Họ tên | Dùng để thử |
| --- | --- | --- | --- |
| Quản trị viên | `admin@demo.vn` | Quản Trị Demo | Quản lý tài khoản (US04, US05) |
| Quản trị viên | `admin2@demo.vn` | Quản Trị Phụ | Khóa quản trị viên bị từ chối (BR01); không có trong danh sách tài khoản |
| Khách hàng | `khach1@demo.vn` | Nguyễn Minh Anh | 12 tin: "Tin của tôi" có trang 2; tin 7 đề xuất; tin đã sửa; tin quá hạn |
| Khách hàng | `khach2@demo.vn` | Lê Thị Hoa | 8 tin: hoàn thành, đã đóng; đề xuất giá biên |
| Khách hàng | `khach3@demo.vn` | Trần Thị Bích Ngọc | 9 tin: tin 5 đề xuất; đánh giá thấp; nhận xét 1000 ký tự; SĐT `+84...` |
| Khách hàng | `khach4@demo.vn` | Phạm Đình Quang | 8 tin: tin đóng còn 3 đề xuất chờ; tin hẹn xa; hoàn thành chưa ai đánh giá |
| Khách hàng | `khach5@demo.vn` | Nguyễn Hoàng Anh Thư | 10 tin dữ liệu biên: độ dài tối đa, ký tự đặc biệt, Unicode, địa phương khác |
| Khách hàng | `khach6@demo.vn` | Ngô Bảo Châu | Chưa có tin nào: màn hình danh sách trống |
| Khách hàng | `khachkhoa@demo.vn` | Lý Văn Khóa | Bị khóa nhưng còn lịch sử (tin đã chọn, tin hoàn thành) |
| Kỹ thuật viên | `ktv1@demo.vn` | Trần Quốc Huy | Có việc được chọn và việc đã hoàn thành chưa đánh giá khách |
| Kỹ thuật viên | `ktv2@demo.vn` | Phạm Văn Bình | Có đề xuất không được chọn và việc đã hoàn thành |
| Kỹ thuật viên | `ktv3@demo.vn` | Võ Thanh Sơn | Có đề xuất đã rút, rút rồi gửi lại |
| Kỹ thuật viên | `ktv4@demo.vn` | Hồ Thị Mai Anh | Chưa gửi đề xuất nào: màn hình trống |
| Kỹ thuật viên | `ktv5@demo.vn` | Dương Văn Tài | 15 đề xuất ("Đề xuất của tôi" có trang 2), 7 việc được chọn, nhiều thông báo chưa đọc |
| Kỹ thuật viên | `ktv6@demo.vn` | Bùi Quang Vinh | Chủ yếu nhận đánh giá 1-2 sao |
| Kỹ thuật viên | `ktv7@demo.vn` | Nguyễn Hoàng Phúc | Có việc hoàn thành hai bên đã đánh giá và việc hoàn thành chưa ai đánh giá |
| Kỹ thuật viên | `bikhoa@demo.vn` | Đỗ Văn Khóa | Bị khóa: không đăng nhập được, có việc đã hoàn thành; thử mở khóa bằng quản trị viên |

### Bảng phủ tình huống

| Tình huống | Tin | Điều cần thử |
| --- | --- | --- |
| Đủ bốn trạng thái tin (BR12) và bốn trạng thái đề xuất | SC-001 đến SC-007 | Mọi màn hình theo trạng thái |
| Tin không có đề xuất | SC-002, SC-006, SC-013, SC-025, SC-029, SC-042 | Sửa tin, đóng tin, màn hình trống |
| Tin nhiều đề xuất | SC-008 (7, từ 6 kỹ thuật viên), SC-027 (5) | Danh sách đề xuất, chọn một trong nhiều |
| Đề xuất đã rút | SC-001 | Trạng thái Đã rút trong danh sách |
| Rút rồi gửi lại đề xuất (BR08) | SC-008 | `myProposalId` trỏ đề xuất mới nhất |
| Sửa đề xuất khi còn chờ (US22) | SC-008, SC-016, SC-031 | Giá sau khi sửa |
| Sửa tin sau khi đăng (US21) | SC-013, SC-029 | Tiêu đề, mô tả, loại đã đổi |
| Đóng tin nhưng đề xuất chờ vẫn còn (BR06) | SC-009, SC-020, SC-034 | Kỹ thuật viên thấy đề xuất chờ trên tin đã đóng |
| Mọi đề xuất đã rút | SC-048 (tin chờ), SC-047 (tin đã đóng) | Số đề xuất lớn hơn 0 nhưng không còn đề xuất hiệu lực |
| Đã chọn kỹ thuật viên, thông báo chưa đọc / đã đọc (BR16) | SC-003, SC-010, SC-019, SC-023, SC-033, SC-049 | Chuông thông báo, số điện thoại khách chỉ hiện cho người được chọn (BR15) |
| Hoàn thành, hai bên đã đánh giá | SC-004, SC-011, SC-015, SC-021, SC-024, SC-028, SC-035, SC-046, SC-050 | Điểm trung bình |
| Hoàn thành, chỉ khách hàng đánh giá | SC-005, SC-012, SC-014, SC-026, SC-030, SC-037 | Kỹ thuật viên gửi đánh giá của mình (US19) |
| Hoàn thành, chỉ kỹ thuật viên đánh giá | SC-018 | Khách hàng gửi đánh giá của mình (US18) |
| Hoàn thành, chưa ai đánh giá | SC-032 | Cả hai bên cùng thấy nút đánh giá |
| Đánh giá đủ 1 đến 5 sao, nhận xét dài 1000 ký tự | SC-012 và SC-028 (1 sao), SC-024 (1000 ký tự) | Điểm trung bình thấp (ktv6), hiển thị nhận xét dài |
| Kỹ thuật viên hoặc khách hàng bị khóa vẫn có lịch sử (BR02) | SC-014, SC-048 đến SC-050 | Đăng nhập bị từ chối, dữ liệu cũ vẫn hiển thị |
| Giá đề xuất ở biên và giá lẻ | SC-017 | 0,1; 9.999.999.999.999,9; 150.000,5 |
| Thời gian mong muốn đã qua, hoặc rất xa | SC-016, SC-036 | Tin vẫn chờ đề xuất |
| Độ dài tối đa: tiêu đề 200, loại 50, địa điểm 255, mô tả hơn 4000 ký tự | SC-038, SC-039, SC-040 | Cắt chữ, xuống dòng, bố cục thẻ |
| Ký tự đặc biệt, `<script>`, `'; DROP TABLE`, `%` và `_` | SC-041 | Hiển thị nguyên văn, bộ lọc địa điểm |
| Emoji, chữ tiếng Việt dạng tổ hợp (NFD) | SC-042 | Hiển thị và tìm kiếm |
| Khoảng trắng thừa ở hai đầu | SC-043 | Bị cắt khi lưu |
| Loại dịch vụ ngoài danh sách của giao diện | SC-013 (sau khi sửa), SC-044 | Bộ lọc theo loại |
| Địa phương khác TP. Hồ Chí Minh | SC-045 (Đà Nẵng), SC-046, SC-047, SC-048 đến SC-050 (Hà Nội) | Bộ lọc theo địa điểm |
| Phân trang (10 mục mỗi trang) | khach1 (12 tin), ktv5 (15 đề xuất) | Trang 2 của danh sách |

## Phần tự động: 1000 tin, 230 tài khoản

Sinh bởi `tu-dong/` bằng bộ số giả ngẫu nhiên có hạt giống cố định (không dùng `Math.random`): cùng số tin, hạt giống và thời điểm chạy thì cùng dữ liệu. Tài khoản: `auto.kh001@demo.vn` đến `auto.kh150@demo.vn` (khách hàng) và `auto.ktv001@demo.vn` đến `auto.ktv080@demo.vn` (kỹ thuật viên), mật khẩu `Demo@123`. Số tài khoản tỷ lệ theo số tin (khoảng 15% khách hàng, 8% kỹ thuật viên so với số tin).

| Khía cạnh | Cách sinh |
| --- | --- |
| Trạng thái tin | Khoảng 35% chờ đề xuất, 12% đã chọn, 38% hoàn thành, 15% đã đóng |
| Phân bổ | Lệch như thật: khách hàng có từ 0 đến hơn 30 tin, kỹ thuật viên có từ 0 đến hơn 100 đề xuất; khoảng 12% khách hàng và 10% kỹ thuật viên chưa có việc nào; 4% tài khoản bị khóa |
| Nội dung | 6 loại dịch vụ chính (mỗi loại 8 thiết bị, 10 sự cố, 6 đầu việc) cộng 6 loại ngoài danh sách của giao diện; 7 địa phương (TP. Hồ Chí Minh, Hà Nội, Đà Nẵng, Cần Thơ, Hải Phòng, Đồng Nai, Khánh Hòa); một phần nhỏ có địa chỉ chi tiết, mô tả dài, ký tự đặc biệt |
| Đề xuất | 0 đến 8 đề xuất mỗi tin theo trạng thái; kỹ thuật viên đúng chuyên môn được ưu tiên; khoảng 8% bị rút, một phần trong đó được gửi lại với giá khác; khoảng 10% được sửa giá; giá từ vài chục nghìn đến hàng chục triệu, có giá lẻ và có đề xuất không ghi thời gian dự kiến |
| Đánh giá | Khách hàng đánh giá khoảng 85% tin hoàn thành, kỹ thuật viên khoảng 55%, nên có tin chỉ một bên hoặc không bên nào đánh giá; điểm sao bám theo "chất lượng" của từng kỹ thuật viên nên có người điểm cao, có người điểm thấp |
| Dòng thời gian | Trải trên hơn 100 ngày. Tài khoản tạo trước hoạt động đầu tiên của chính nó, rồi tin, đề xuất, chấp nhận, hoàn thành, đánh giá theo đúng thứ tự; mọi đề xuất của tin gửi trước lúc chấp nhận (BR07); không có thời điểm ở tương lai; mã tin tăng theo thời điểm đăng |

Dữ liệu tự động chỉ dùng các tài khoản tự động, không đụng tới tài khoản và tin viết tay, nên điểm trung bình và số liệu của dữ liệu viết tay không bị nhiễu.

## Thông báo trong dữ liệu mẫu

Thông báo do chính các service tạo ra khi chạy seed (đề xuất mới, được chấp nhận, bị từ chối, hoàn thành, đánh giá; xem `docs/api-contract.md` mục 2.3.6), không chèn tay. Với dữ liệu tự động, ngày tạo thông báo được lùi về đúng thời điểm sự kiện gây ra nó, và **thông báo cũ hơn 7 ngày được đánh dấu đã đọc** để tài khoản bận không có hàng trăm thông báo chưa đọc. Thông báo của dữ liệu viết tay và thông báo gần đây vẫn chưa đọc (trừ những đề xuất được đánh dấu `daDocThongBao`): ví dụ `khach1@demo.vn` có khoảng 26 chưa đọc, đủ để thử chấm xanh và số đếm trên chuông. Chuông chỉ liệt kê 20 thông báo mới nhất, chưa có nút xem thêm.

## Cách hoạt động

- Dữ liệu viết tay nằm trong `thu-cong/` (`tai-khoan.js`, `tin-sua-chua.js`, `de-xuat.js`, `danh-gia.js`). Sửa các file này để đổi dữ liệu mẫu. Mã tài khoản, tin, đề xuất theo đúng thứ tự trong mảng, các tài liệu dẫn tới những mã đó nên chỉ thêm mục mới ở cuối mảng. Chuỗi dài đúng giới hạn tạo bằng `chuoiDaiDung` (`thu-cong/tien-ich.js`).
- Mọi nguồn dữ liệu cùng trả về một "kế hoạch" (tài khoản, tin, đề xuất, đánh giá). `ke-hoach.js` kiểm tra kế hoạch bằng chính các validator của API trước khi ghi gì vào CSDL; `thuc-thi.js` thực thi kế hoạch; `chay-seed.js` là lệnh chạy.
- `thuc-thi.js` tạo dữ liệu bằng đúng các service của ứng dụng (đăng tin, sửa tin, gửi đề xuất, rút, chấp nhận, xác nhận hoàn thành, đánh giá, khóa tài khoản), không chèn SQL trực tiếp, trừ việc lùi ngày tạo về quá khứ khi kế hoạch có `taoLuc`. Nhờ đó các quy tắc nghiệp vụ BR01 đến BR16 được áp dụng như khi dùng thật: đề xuất khác tự bị từ chối khi chọn kỹ thuật viên, kỹ thuật viên được chọn nhận thông báo, điểm trung bình được tính lại. Tài khoản chèn qua `user.repository` (cùng hàm mà dịch vụ đăng ký gọi) với một mật khẩu băm dùng chung.
- Thời gian mong muốn của tin viết tay tính theo lúc chạy seed, nên tin chưa hoàn thành nằm trong tương lai (trừ SC-016 cố ý đã quá hạn).
- Kiểm thử: `tests/seed-ke-hoach.test.js` (không cần CSDL) kiểm tra bộ kiểm tra kế hoạch bắt đúng từng loại lỗi và bộ sinh tái lập được, hợp lệ ở nhiều quy mô, đủ đa dạng; `tests/seed.test.js` chạy 50 tin viết tay cùng 150 tin tự động trên CSDL test, kiểm tra quy tắc nghiệp vụ, các tình huống trong bảng phủ, số thông báo theo từng loại và dòng thời gian trong CSDL.
- Seed không nằm trong một transaction. Kế hoạch được kiểm tra trước khi ghi nên lỗi dữ liệu dừng ngay mà chưa ghi gì; nếu vẫn lỗi giữa chừng (mất kết nối...), chạy `npm run seed:reset`.
