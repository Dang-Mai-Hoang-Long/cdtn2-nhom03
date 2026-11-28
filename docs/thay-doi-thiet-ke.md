# Thay đổi so với thiết kế ban đầu

Tài liệu này ghi **mọi chỗ mã nguồn hiện tại khác thiết kế ban đầu** (SRS, Product Backlog, ERD, wireframe, bản API contract đầu), kèm lý do và nơi tìm chi tiết. "Thiết kế ban đầu" là các tài liệu trong thư mục `docs/` lúc khởi đầu dự án; "hiện tại" là mã trên nhánh `phong` ngày 2026-11-21.

Các tài liệu liên quan: [api-contract.md](api-contract.md) (chi tiết API, mục 2.7 tóm tắt phần API), [project-notes.md](project-notes.md) (quyết định theo từng Sprint), [bug-log.md](bug-log.md) (lỗi và các mục DEV/OBS), [seeds/README.md](../seeds/README.md) (dữ liệu mẫu). Các tài liệu thiết kế gốc (SRS, backlog, ERD) **không bị sửa**; mọi lệch được ghi ở đây để nhóm quyết định cập nhật tài liệu gốc hay mã.

Cột "Nguồn" ghi tài liệu hoặc mã commit (7 ký tự) để truy lại.

## A. Cơ sở dữ liệu

| # | Hạng mục | Thiết kế ban đầu | Hiện tại | Lý do | Nguồn |
| --- | --- | --- | --- | --- | --- |
| A1 | Tên bảng người dùng | `user` | `users` | `user` là từ khóa dành riêng của PostgreSQL | project-notes (Sprint 2), `migrations/001` |
| A2 | Trạng thái đề xuất | `PENDING`, `ACCEPTED`, `REJECTED` | Thêm `WITHDRAWN` | US23: kỹ thuật viên rút đề xuất nhưng vẫn lưu để tra cứu lịch sử | `migrations/002`, DEV-03 |
| A3 | Chặn BR08 và BR10 | Kiểm tra ở tầng service | Thêm unique index một phần (một đề xuất còn hiệu lực cho mỗi cặp tin-kỹ thuật viên; một đề xuất `ACCEPTED` mỗi tin) cùng khóa dòng `FOR UPDATE` | Gửi hoặc chọn song song không được vượt qua quy tắc | project-notes (Sprint 2), `migrations/001` |
| A4 | `repair_request.preferred_time` | Cho phép NULL theo ERD | Cột vẫn cho NULL nhưng API bắt buộc | US06 và wireframe yêu cầu chọn thời gian mong muốn | project-notes (Sprint 2) |
| A5 | Quản lý migration | Không có trong ERD | Bảng `schema_migrations` ghi file đã chạy; migration là SQL thuần, truy cập CSDL bằng `pg`, không ORM | Đơn giản, dễ kiểm soát | project-notes (Sprint 2), 1564916 |
| A6 | `notification.type` | Một loại (`PROPOSAL_ACCEPTED`) | Năm loại, cột `VARCHAR(50)` không ràng buộc nên **không đổi lược đồ** | Xem mục C8 | a959892 |
| A7 | Bảng cho trang thống kê | (không có) | Thêm `activity_log`, `alert_state` và chỉ mục `notification(type, related_id)`; không sửa bảng cũ. Không lưu địa chỉ IP, User-Agent gốc, email nhập khi đăng nhập sai | Thống kê đăng nhập, hoạt động quản trị, thiết bị và trạng thái xử lý cảnh báo cần được ghi lại | `migrations/003` |

## B. API (chi tiết trong api-contract.md)

| # | Hạng mục | Thiết kế ban đầu | Hiện tại | Lý do | Nguồn |
| --- | --- | --- | --- | --- | --- |
| B1 | Mã lỗi | `MISSING_REQUIRED_FIELD`, `REVIEW_NOT_FOUND`, `CONTACT_NOT_VISIBLE` có trong danh sách | Backend dùng đúng 22 mã, không dùng ba mã này; thêm `NOT_FOUND` (đường dẫn không có) và `INTERNAL_ERROR` | Thiếu trường báo `VALIDATION_ERROR` kèm `details`; không có API trả `REVIEW_NOT_FOUND`; BR15 đáp ứng bằng cách không trả `phone` | 7ffe0cd |
| B2 | Phân trang | `page` mặc định 0 | `page` bắt đầu từ 1; `page` lớn hơn 1.000.000 bị kẹp; `size` tối đa 100 | Khớp ví dụ `meta` của contract; tránh lỗi 500 khi `page` quá lớn | OBS-06, BUG-04 (ae3e017) |
| B3 | Thân yêu cầu quá lớn, lỗi đọc thân | (không nêu) / có `204` | Lớn hơn 100 KB và mọi lỗi đọc thân của body-parser trả `400 VALIDATION_ERROR`; không dùng `204`, `413`, `415` | Không phải thêm mã mới; trước đây trả 500 | BUG-05 (438a449, 2f05954) |
| B4 | `PATCH /api/proposals/{id}/close` | Tên gợi ý đóng | Là **rút đề xuất** (`WITHDRAWN`); đóng tin là `PATCH /api/requests/{id}/close` | US23 | 7ffe0cd |
| B5 | API thêm ngoài bản đầu | (không có) | `GET /api/proposals/my`, `GET /`, `GET /api/health` | Màn hình "Đề xuất của tôi" và "Công việc được chọn"; kiểm tra backend sống | project-notes (Sprint 3), 7ffe0cd |
| B6 | Trường phản hồi thêm | (không có) | `proposalCount`, `hasProposed`, `canPropose`, `myProposalId`, `myProposalStatus`, `hasReviewed`, `meta.summary` (admin), `meta.user` (đánh giá) | Giao diện cần để hiện nút đúng trạng thái | project-notes (Sprint 2), 7ffe0cd |
| B7 | Số điện thoại khách hàng (BR15) | `GET /api/requests/{id}` có thể báo `CONTACT_NOT_VISIBLE` | Luôn `200`; `customer.phone` chỉ có khi kỹ thuật viên là người được chọn | Không cần mã lỗi riêng | project-notes (Sprint 2) |
| B8 | Mã lỗi khi sửa tin | `REQUEST_ALREADY_SELECTED` / `REQUEST_NOT_WAITING` | `REQUEST_NOT_EDITABLE` (409) | Rõ nghĩa hơn cho tin đã chọn, hoàn thành, đã đóng | 6cbb3e7, 7ffe0cd |
| B9 | Tham số danh sách | Mọi API danh sách có `sort`; tin của kỹ thuật viên lọc theo `status` | `sort` chỉ ở hai API danh sách tin; `GET /api/requests` bỏ qua `status`; danh sách tài khoản có thêm `q` | Khớp thực tế | 7ffe0cd |
| B10 | Mã số quá lớn | (không nêu) | Mã vượt 2147483647 trả `404` (như mã không tồn tại) | Trước đây trả 500 | BUG-03 (d49d654) |
| B11 | Giá đề xuất và số điện thoại | (không giới hạn rõ) | Giá tối thiểu 0,1 (khớp `DECIMAL(15,1)`); số điện thoại tối đa 20 ký tự (khớp `VARCHAR(20)`) | Trước đây trả 500 | BUG-01 (caa7c2d), BUG-02 (6c1ffd2) |
| B12 | Xem hồ sơ người dùng | (không có API) | Thêm `GET /api/users/{id}` cho mọi vai trò đã đăng nhập: phần công khai gồm tên, vai trò, điểm trung bình, số đánh giá, phân bố sao, số công việc hoàn thành, ngày tham gia; `email`, `phone`, `isLocked` chỉ cho quản trị viên và chính chủ; tài khoản quản trị viên trả `404` cho người dùng thường | Giao diện cần trang hồ sơ để xem đánh giá và thông tin tài khoản mà không lộ số điện thoại ngoài BR15 | api-contract mục 2.3.8 |
| B13 | Sửa thông tin tài khoản | (không có API) | Thêm `PATCH /api/users/me`: tự sửa `fullName` và `phone` (cùng quy tắc kiểm tra như đăng ký, gửi trường nào sửa trường đó); email, mật khẩu, vai trò, `isLocked`, `ratingAvg` không sửa được qua API này và bị bỏ qua (mật khẩu đổi bằng API riêng, B15); không có đường sửa theo mã nên không sửa được tài khoản người khác | Người dùng cần chỉnh họ tên và số điện thoại khi thông tin liên hệ thay đổi; email là định danh đăng nhập nên giữ nguyên | api-contract mục 2.3.8 |
| B14 | Thống kê quản trị | (không có API) | Thêm chín API `/api/admin/analytics/...` (chỉ quản trị viên) và middleware đo thời gian phản hồi, ghi nhật ký hoạt động sau khi phản hồi xong | Quản trị viên cần theo dõi tăng trưởng, hoạt động, tình trạng máy chủ, báo cáo và cảnh báo | api-contract mục 2.3.9 |
| B15 | Đổi mật khẩu | (không có API) | Thêm `PATCH /api/users/me/password`: mật khẩu hiện tại, mật khẩu mới (ít nhất 6 ký tự, khác mật khẩu cũ) và nhập lại. Sai mật khẩu hiện tại trả `400` chứ không phải `401` để giao diện không đăng xuất. Token đã cấp không bị thu hồi, còn dùng được tới khi hết hạn | Người dùng cần tự đổi mật khẩu của mình | api-contract mục 2.3.8 |

## C. Nghiệp vụ và phân quyền

| # | Hạng mục | Thiết kế ban đầu | Hiện tại | Lý do | Nguồn |
| --- | --- | --- | --- | --- | --- |
| C1 | Đăng xuất (US03) | "Hệ thống kết thúc phiên" | API trả 200 nhưng **không thu hồi token** (JWT không lưu phiên); giao diện xóa token; tài khoản bị khóa vẫn bị chặn ngay | Đơn giản; rủi ro token bị lộ còn dùng được đến hết hạn (mặc định 1 ngày) | DEV-01 |
| C2 | Xem chi tiết đề xuất (US15) | Chỉ chủ tin | Chủ tin **và kỹ thuật viên đã gửi đề xuất đó** | Chuông thông báo cần mở đề xuất để lấy mã tin | DEV-02 |
| C3 | Xem chi tiết tin (US12) | (theo tiêu chí US12) | Kỹ thuật viên xem được tin ở **mọi** trạng thái; nút gửi đề xuất chỉ hiện khi tin đang chờ | Theo tiêu chí chấp nhận US12 | project-notes (Sprint 2) |
| C4 | Đóng tin (BR06) | Chỉ chặn đóng tin đã chọn kỹ thuật viên | Khi đóng, các đề xuất đang chờ của tin **giữ nguyên** `PENDING` | BR06 không yêu cầu đổi trạng thái đề xuất | request.service, seeds SC-009 |
| C5 | Tên trạng thái đề xuất đã rút | `DA_RUT` | `WITHDRAWN` (`DA_RUT` chỉ là tên hằng số trong mã) | Thống nhất tên với các trạng thái khác | DEV-03 |
| C6 | Thông báo khi chấp nhận (BR16) | Báo kỹ thuật viên | Tạo trong **cùng transaction** với việc chấp nhận | Chấp nhận thất bại thì không có thông báo | project-notes (Sprint 2) |
| C7 | Thời gian mong muốn trong quá khứ | Không nêu | Vẫn được chấp nhận | Ghi nhận, chưa quyết định | OBS-02 |
| C8 | **Thông báo (US20, BR16)** | Một loại: kỹ thuật viên nhận khi đề xuất được chấp nhận | **Năm loại** theo yêu cầu 2026-11-21 (xem bảng dưới) | Người dùng muốn thông báo đủ vòng đời của tin | a959892 |

### C8. Năm loại thông báo

| `type` | Người nhận | Khi nào | `relatedId` |
| --- | --- | --- | --- |
| `NEW_PROPOSAL` | Khách hàng chủ tin | Có đề xuất mới được thêm vào tin (kể cả gửi lại sau khi rút) | Mã đề xuất |
| `PROPOSAL_ACCEPTED` | Kỹ thuật viên được chọn | Đề xuất được khách hàng chọn (BR16, đã có từ trước) | Mã đề xuất |
| `PROPOSAL_REJECTED` | Từng kỹ thuật viên có đề xuất đang chờ | Cùng lúc khách hàng chọn một đề xuất khác (BR10); đề xuất đã rút không được báo | Mã đề xuất bị từ chối |
| `REQUEST_COMPLETED` | Kỹ thuật viên được chọn | Khách hàng xác nhận hoàn thành | Mã tin |
| `REVIEW_RECEIVED` | Bên được đánh giá (khách hàng hoặc kỹ thuật viên) | Bên kia gửi đánh giá sau khi hoàn thành | Mã tin |

Quyết định đi kèm (người dùng chưa nêu rõ, đã chọn mặc định hợp lý):

- Mỗi thông báo tạo trong transaction của sự kiện gốc. `title` là chuỗi cố định; tên tin chỉ nằm ở `content` vì tên tin dài tới 200 ký tự bằng độ dài tối đa của `title`.
- **`relatedId` có nghĩa khác nhau theo `type`** (mã đề xuất hoặc mã tin). Chọn theo cách này để giữ nguyên nghĩa cũ của `PROPOSAL_ACCEPTED` và để màn hình chi tiết đề xuất của khách hàng mở thẳng bằng mã đề xuất. Mọi truy vấn theo cặp (người nhận, `relatedId`) phải kèm `type`.
- **Không** tạo thông báo khi rút đề xuất, sửa đề xuất, sửa tin hay đóng tin, vì yêu cầu không nêu. Cần thì thêm sau, không đổi lược đồ.
- Nội dung `NEW_PROPOSAL` ghi tên kỹ thuật viên và giá; nội dung `REVIEW_RECEIVED` ghi tên người đánh giá và số sao, không ghi nhận xét.
- SRS (US20, FR20, BR16) vẫn ghi một loại thông báo; chưa cập nhật tài liệu gốc.

## D. Giao diện

| # | Hạng mục | Thiết kế ban đầu | Hiện tại | Lý do | Nguồn |
| --- | --- | --- | --- | --- | --- |
| D1 | Số màn hình | 16 màn hình wireframe | Thêm màn hình **17** (sửa tin, `customer/requests/:id/edit`) và **18** (sửa đề xuất, `technician/proposals/:id/edit`) | US21, US22 | project-notes (Sprint 3), 9c31048, 260aea7 |
| D2 | Biểu mẫu đăng tin | Có "Địa chỉ chi tiết", không có Tiêu đề | Thêm Tiêu đề (API bắt buộc), bỏ "Địa chỉ chi tiết" | API chỉ có một trường `location` mà mọi kỹ thuật viên đều thấy; muốn địa chỉ chi tiết chỉ cho người được chọn thì phải thêm cột vào ERD và API | project-notes (Sprint 2) |
| D3 | Thông báo | Màn hình thông báo | Chuông trên thanh đầu trang với danh sách thả xuống (20 thông báo mới nhất), không có trang riêng, chưa có nút xem thêm hay "đánh dấu tất cả đã đọc" | Gọn; đủ cho US20 | project-notes (Sprint 3), e518889 |
| D4 | Dấu hiệu chưa đọc | (không nêu) | **Chấm tròn xanh dương bên trái dòng**, biến mất sau khi bấm xem (kèm chữ ẩn "Chưa đọc." cho trình đọc màn hình); thay nền xám và chữ "· Mới" | Theo yêu cầu 2026-11-21 | eae5177 |
| D5 | Đích khi bấm thông báo | (không nêu) | Theo loại và vai trò: đề xuất mới mở chi tiết đề xuất (khách hàng); được chọn và hoàn thành mở công việc được chọn; không được chọn mở chi tiết tin; đánh giá mở theo dõi công việc (khách hàng) hoặc công việc được chọn (kỹ thuật viên), trang đích hiện đánh giá nhận được (số sao, nhận xét, người gửi) lấy từ trường `receivedReview` của chi tiết tin; đang đứng sẵn ở trang đích thì bấm thông báo vẫn tải lại | Mỗi thông báo dẫn tới nơi cần xem; sửa lỗi bấm "Đánh giá mới" không thấy nội dung đánh giá (28/11/2026) | eae5177 |
| D6 | "Công việc được chọn" | (không nêu) | Lấy từ `GET /api/proposals/my?status=ACCEPTED`, không có API riêng | Tránh thêm API | project-notes (Sprint 3), a700f90 |
| D7 | Dữ liệu minh họa của wireframe | `demoData.js` | Đã xóa; dữ liệu mẫu nằm ở `seeds/` | Không màn hình nào còn dùng | 55c4c3c |
| D8 | Hồ sơ người dùng | (không có màn hình) | Thêm màn hình **19** (`users/:id`, địa chỉ `#/users/{id}`) dùng chung mọi vai trò: thông tin tài khoản, điểm đánh giá với phân bố sao và danh sách đánh giá đã nhận (5 mục mỗi trang). Mở từ tên người dùng ở danh sách đề xuất, chi tiết đề xuất, theo dõi công việc, chi tiết tin và công việc được chọn; từ tên người đánh giá; từ "Xem chi tiết" ở bảng tài khoản của quản trị viên; từ thẻ tài khoản ở đầu trang ("Tài khoản của tôi" trên điện thoại) | Người dùng cần xem đánh giá và thông tin tài khoản của nhau | `frontend/src/pages/shared/UserProfilePage.jsx` |
| D9 | Sửa thông tin tài khoản | (không có) | Nút "Sửa thông tin" trên hồ sơ của chính mình mở biểu mẫu họ tên và số điện thoại (email hiển thị chỉ đọc); lỗi hiện dưới từng ô; lưu xong tên ở đầu trang đổi ngay mà không cần đăng nhập lại | Cùng màn hình 19 với hồ sơ người dùng | `frontend/src/pages/shared/UserProfilePage.jsx` |

| D10 | Trang thống kê | (không có; ngoài SRS) | Màn hình **15** "Thống kê" (`admin/analytics`) là một trang duy nhất: tiêu đề và bộ lọc thời gian; bốn số liệu (người dùng, tin sửa chữa, việc hoàn thành, giá trị công việc); bốn biểu đồ xếp 2 × 2: giao dịch (cột), giá trị công việc (đường), người dùng theo vai trò (tròn), tin theo trạng thái (thanh ngang); cột và đường gộp mốc thời gian còn tối đa 15. Bản 27/11 chia bảy nhóm; từ 28/11/2026 chỉ giữ tổng quan cho gọn, sáu nhóm còn lại (tăng trưởng, người dùng, hoạt động, hệ thống, báo cáo, cảnh báo) bỏ khỏi giao diện, API và mã vẫn còn trong dự án. Quản trị viên đăng nhập vẫn vào "Quản lý tài khoản". Biểu đồ SVG tự vẽ, không dùng thư viện | Yêu cầu mở rộng 27/11/2026 | `frontend/src/pages/admin/analytics/` |
| D11 | Đổi mật khẩu | (không có) | Nút "Đổi mật khẩu" cạnh "Sửa thông tin" trên hồ sơ của chính mình mở biểu mẫu ba ô; lỗi hiện dưới từng ô; đổi xong biểu mẫu đóng, phiên đang dùng giữ nguyên | Cùng màn hình 19 với hồ sơ người dùng | `frontend/src/pages/shared/UserProfilePage.jsx` |

## E. Công cụ, môi trường và dữ liệu mẫu

| # | Hạng mục | Trước | Hiện tại | Nguồn |
| --- | --- | --- | --- | --- |
| E1 | Quy ước đặt tên | Trộn tiếng Anh và tiếng Việt | Tên trong mã dùng tiếng Việt không dấu theo camelCase ([quy-uoc-dat-ten-code.md](quy-uoc-dat-ten-code.md)); tên file giữ nguyên | e58cc78 |
| E2 | Chạy dự án | Chạy backend và frontend riêng | `npm run dev` chạy cả hai (Vite chuyển tiếp `/api` sang cổng 3000); Docker Compose chạy cả CSDL, backend, giao diện | 4528f3b, 8006652 |
| E3 | Dữ liệu mẫu | Chưa có; sau đó 7 tin viết tay | **50 tin viết tay + 1000 tin tự động** (xem bên dưới) | 9d3c2c6, 0fa366a, 0a4722a, 2c4798a |
| E4 | Tài liệu API | Bản đầu có sai lệch (mục B) | Viết lại theo mã nguồn; mọi mã lỗi và endpoint đối chiếu máy móc (22/22 mã, 28/28 endpoint tại thời điểm viết lại). Các API thêm sau đó: hồ sơ người dùng (B12, B13) và chín API thống kê (B14, mục 2.3.9 của api-contract) | 7ffe0cd |

### E3. Dữ liệu mẫu (`seeds/`)

- **Phần viết tay** (`seeds/thu-cong/`): 17 tài khoản, 50 tin; mỗi tin nhắm một tình huống hoặc giá trị biên (bảng phủ ở [seeds/README.md](../seeds/README.md)). Bảy tin, bảy tài khoản và chín đề xuất đầu giữ nguyên mã vì `bug-log.md` và `api-contract.md` dẫn tới các mã đó.
- **Phần tự động** (`seeds/tu-dong/`): 1000 tin, 230 tài khoản, khoảng 2200 đề xuất, khoảng 560 đánh giá; sinh bằng bộ số ngẫu nhiên có hạt giống cố định nên cùng tham số cho cùng dữ liệu; phân bổ lệch như thật; dòng thời gian trải hơn 100 ngày và đúng trình tự.
- **Cấu trúc**: mọi nguồn trả về một "kế hoạch" `{ taiKhoan, tin, deXuat, danhGia }`. `seeds/ke-hoach.js` kiểm tra kế hoạch bằng chính validator của API (cộng BR07, BR08, BR13, BR14, thứ tự thời gian) **trước khi ghi** nên dữ liệu sai dừng ngay thay vì để dữ liệu dở dang; `seeds/thuc-thi.js` thực thi qua service.
- **Đánh đổi đã chọn**: tài khoản chèn qua `user.repository` với một mật khẩu băm dùng chung (băm riêng từng tài khoản tốn vài giây mà không thêm giá trị kiểm thử); ngày tạo được lùi về quá khứ bằng một lệnh `UPDATE ... FROM unnest` cho mỗi bảng; thông báo cũ hơn 7 ngày được đánh dấu đã đọc.
- **Lệnh**: `npm run seed` (cả hai phần, khoảng 10 giây), `npm run seed:reset`, `npm run seed:thu-cong`, `--so-tin=N`, `--hat-giong=N`.
- **Mã thông báo không còn ổn định** từ khi mỗi đề xuất mới cũng tạo thông báo; chỉ người nhận và đề xuất của thông báo "được chấp nhận" đầu tiên là ổn định.
- Cách hiểu yêu cầu "khoảng 50 thủ công, phần dưới 1000 tự động": đơn vị đếm là **tin sửa chữa**.

## F. Lỗi đã sửa làm đổi hành vi (Sprint 4)

Năm lỗi Minor trong [bug-log.md](bug-log.md) đều trả `500` và nay trả `4xx`; không lỗi nào đổi quy tắc nghiệp vụ. Chi tiết ở mục B (B2, B3, B10, B11): BUG-01 `caa7c2d`, BUG-02 `6c1ffd2`, BUG-03 `d49d654`, BUG-04 `ae3e017`, BUG-05 `438a449` và `2f05954`.

## G. Còn mở hoặc chưa làm

- Các mục DEV-01, DEV-02, UI-01, OBS-01 đến OBS-05 trong bug-log vẫn mở (DEV-03 và OBS-06 về phần tài liệu đã xử lý bằng việc viết lại api-contract).
- Thông báo: chuông chỉ liệt kê 20 mới nhất, chưa có "xem thêm" hay "đánh dấu tất cả đã đọc"; chưa có thông báo cho rút đề xuất, sửa đề xuất, sửa tin, đóng tin.
- SRS, Product Backlog và ERD gốc chưa được cập nhật theo các thay đổi trên (ví dụ US03, US15, US20, FR20, BR16, tên bảng `users`, trạng thái `WITHDRAWN`).
