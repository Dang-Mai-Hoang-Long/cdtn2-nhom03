
## Quyết định khi triển khai Sprint 2

- Truy cập CSDL bằng driver `pg`, không dùng ORM; migration là SQL thuần trong `migrations/`, chạy bằng `npm run migrate` (bảng `schema_migrations` ghi các file đã chạy).
- Bảng `user` của ERD đặt tên `users` vì `user` là từ khóa dành riêng của PostgreSQL. Các bảng khác giữ đúng tên ERD.
- BR08 và BR10 được chặn thêm bằng unique index một phần (đề xuất còn hiệu lực theo tin + kỹ thuật viên; một đề xuất ACCEPTED mỗi tin), cùng với khóa dòng `FOR UPDATE` trong transaction, để không bị vượt qua khi gửi song song.
- Phân trang bắt đầu từ `page=1` (theo ví dụ `meta` trong API contract; mục 2.6 ghi mặc định `page=0` — cần thống nhất lại tài liệu).
- `preferredTime` bắt buộc ở API (theo US06 và wireframe) dù cột trong ERD cho phép NULL.
- Kỹ thuật viên xem được chi tiết tin ở mọi trạng thái (theo tiêu chí chấp nhận US12); nút gửi đề xuất chỉ hiện khi tin đang chờ. Số điện thoại khách hàng chỉ trả về cho kỹ thuật viên được chọn (BR15) — không dùng mã lỗi `CONTACT_NOT_VISIBLE`.
- Chấp nhận đề xuất (US16) tạo luôn thông báo `PROPOSAL_ACCEPTED` cho kỹ thuật viên trong cùng transaction (BR16, theo tiêu chí chấp nhận US16). API đọc thông báo thuộc US20 (Sprint 3).
- Chi tiết tin cho kỹ thuật viên trả thêm `hasProposed`, `canPropose`, `myProposalId`, `myProposalStatus`; danh sách tin trả thêm `proposalCount`. Đây là trường bổ sung ngoài API contract.
- Đăng xuất (US03): JWT không lưu phiên ở server; API trả 200 và giao diện xóa token. Tài khoản bị khóa bị chặn ngay vì middleware tra lại trạng thái khóa ở mỗi request (BR02).
- Biểu mẫu đăng tin thêm trường Tiêu đề (API bắt buộc nhưng wireframe chưa có) và bỏ "Địa chỉ chi tiết" vì API chỉ có một trường `location` mà kỹ thuật viên nào cũng thấy. Nếu cần địa chỉ chi tiết chỉ hiện cho kỹ thuật viên được chọn, phải thêm cột mới vào ERD và API.

## Quyết định khi triển khai giao diện Sprint 3

- Thêm hai màn hình ngoài 16 màn hình của wireframe: 17 (Sửa tin, `customer/requests/:id/edit`) và 18 (Sửa đề xuất, `technician/proposals/:id/edit`). Sửa tin dùng lại `RequestForm` ở chế độ sửa; gửi và sửa đề xuất dùng chung `ProposalForm`.
- Nút và màn hình chỉ hiện khi quy tắc nghiệp vụ cho phép (đóng/sửa tin khi Chờ đề xuất; sửa đề xuất khi còn chờ và tin còn nhận đề xuất; rút đề xuất khi còn chờ; đánh giá khi tin Hoàn thành, đúng bên tham gia và chưa đánh giá). Backend vẫn kiểm tra lại, giao diện hiện thông báo lỗi của backend khi trạng thái đã đổi.
- US15: backend cho cả kỹ thuật viên đã gửi đề xuất xem chi tiết đề xuất (rộng hơn tiêu chí "chỉ chủ tin xem"), vì chuông thông báo cần mở đề xuất để lấy mã tin. Giao diện chỉ có màn hình chi tiết đề xuất cho khách hàng.
- Danh sách "Công việc được chọn" của kỹ thuật viên lấy từ `GET /api/proposals/my?status=ACCEPTED`, không có API riêng.
- Thông báo (US20) là chuông trên thanh đầu trang với danh sách thả xuống, không có trang riêng.
- Đã xóa `frontend/src/data/demoData.js` (dữ liệu minh họa của wireframe) vì không còn màn hình nào dùng; dữ liệu mẫu để thử ứng dụng nằm ở `seeds/`.
- Dữ liệu mẫu và tài khoản demo nằm ở `seeds/`, tạo qua tầng service nên tuân thủ BR01-BR16; `tests/seed.test.js` kiểm tra các bất biến đó.

## Quyết định khi sửa lỗi ở Sprint 4 (theo `docs/bug-log.md`)

- Sprint 4 chỉ gồm việc sửa 5 bug Minor (BUG-01 đến BUG-05) trong bug-log; các mục DEV, UI, TD, OBS chưa làm. Không bug nào đổi quy tắc nghiệp vụ.
- Mỗi bug được sửa tại nguyên nhân (validator, hàm đọc mã số, hàm phân trang, xử lý lỗi), không thêm lớp ánh xạ chung mã lỗi PostgreSQL sang 4xx vì sẽ che các lỗi máy chủ thật.
- BUG-01: số điện thoại tối đa 20 ký tự theo chuỗi đã `trim` (gồm dấu cách), khớp cột `users.phone`.
- BUG-02: giá đề xuất tối thiểu 0,1 (khớp `DECIMAL(15,1)`). Giá có nhiều chữ số thập phân vẫn bị làm tròn thầm lặng (OBS-05 còn mở).
- BUG-03: mã vượt 2147483647 trả `404` như mã không tồn tại; hàm `docMaSo` nằm ở `src/utils/ma-so.js`. Bug-log liệt kê 10 endpoint nhưng thực tế 15 endpoint bị lỗi, đều đã sửa và có test. Mã dạng hex hoặc thập phân (OBS-04) vẫn được `Number()` chấp nhận.
- BUG-04: `page` được kẹp tối đa 1.000.000; `page` lớn hơn trả `200` với danh sách rỗng và `meta.page` là mức tối đa.
- BUG-05: thân yêu cầu lớn hơn 100 KB trả `400 VALIDATION_ERROR` thay vì `413` để không phải thêm mã mới vào API contract.
