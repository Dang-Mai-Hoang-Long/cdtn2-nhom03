# **BẢN SRS RÚT GỌN**

## **1.1. Giới thiệu, phạm vi và bảng thuật ngữ**

### 1.1.1. Giới thiệu

Xây dựng một nền tảng web hai chiều (two-sided marketplace) kết nối khách hàng có nhu cầu sửa chữa với kỹ thuật viên cung cấp dịch vụ, cho phép đăng tin, tìm kiếm, gửi đề xuất sửa chữa, lựa chọn kỹ thuật viên, theo dõi trạng thái công việc và đánh giá sau khi hoàn thành.

### 1.1.2. Phạm vi

**Trong phạm vi:**

1. Đăng ký, đăng nhập, đăng xuất và phân quyền 3 vai trò: Khách hàng, Kỹ thuật viên, Quản trị viên.
2. Khách hàng đăng và quản lý tin sửa chữa (mô tả sự cố, thời gian, địa điểm).
3. Kỹ thuật viên tìm kiếm, lọc tin sửa chữa, gửi và quản lý đề xuất thực hiện công việc.
4. Khách hàng xem danh sách đề xuất và lựa chọn kỹ thuật viên phù hợp.
5. Theo dõi trạng thái tin sửa chữa (Chờ đề xuất, Đã chọn kỹ thuật viên, hoàn thành).
6. Đánh giá hai chiều sau khi công việc hoàn thành (khách hàng đánh giá kỹ thuật viên và ngược lại).
7. Quản trị viên quản lý tài khoản (xem danh sách, khóa/mở khóa)
8. Thông báo cơ bản khi có cập nhật tin sửa chữa.

**Ngoài phạm vi:**

9. Thanh toán/giao dịch tiền thật qua cổng thanh toán
10. Ứng dụng di động native riêng biệt (ưu tiên web responsive)
11. Chat real-time nâng cao giữa hai bên (có thể để hướng phát triển)

### 1.1.3. Bảng thuật ngữ

| Thuật ngữ            | Giải thích                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------- |
| SRS                  | Tài liệu đặc tả yêu cầu phần mềm (Software Requirements Specification).                       |
| Khách hàng           | Người đăng tin khi có nhu cầu sửa chữa.                                                       |
| Kỹ thuật viên        | Người cung cấp dịch vụ và gửi đề xuất sửa chữa.                                               |
| Quản trị viên        | Người quản lý tài khoản trên hệ thống.                                                        |
| Tin sửa chữa         | Thông tin về nhu cầu sửa chữa do khách hàng đăng tải.                                         |
| Đề xuất sửa chữa     | Đề nghị thực hiện công việc do kỹ thuật viên gửi đến khách hàng.                              |
| Trạng thái công việc | Tình trạng hiện tại của tin sửa chữa.                                                         |
| User Story (US)      | Mô tả nhu cầu hoặc mục tiêu của người dùng đối với hệ thống.                                  |
| MoSCoW               | Phương pháp phân loại mức độ ưu tiên yêu cầu: Must have, Should have, Could have, Won't have. |

## **1.2. Các bên liên quan và vai trò người dùng**

| Người dùng    | Mô tả                                                                                                          | Vai trò                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Khách hàng    | Người có nhu cầu sửa chữa thiết bị, đăng tin yêu cầu và lựa chọn kỹ thuật viên phù hợp để thực hiện công việc. | Đăng tin sửa chữa, quản lý tin đã đăng, xem và lựa chọn đề xuất, theo dõi trạng thái công việc, đánh giá kỹ thuật viên. |
| Kỹ thuật viên | Người cung cấp dịch vụ sửa chữa, tìm kiếm yêu cầu phù hợp và gửi đề xuất thực hiện công việc.                  | Tìm kiếm tin sửa chữa, gửi đề xuất, sửa chữa, đánh giá khách hàng.                                                      |
| Quản trị viên | Người quản lý tài khoản và kiểm soát quyền truy cập của người dùng trên nền tảng.                              | Xem danh sách tài khoản, khóa và mở khóa tài khoản.                                                                     |

## **1.3. Yêu cầu chức năng**

### 1.3.1. User Story

| Mã US | Mô tả                                                                                                                                                         | MoSCoW      |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| US01  | Là người dùng, tôi muốn đăng ký tài khoản để có thể sử dụng nền tảng.                                                                                         | Must have   |
| US02  | Là người dùng, tôi muốn đăng nhập vào tài khoản để truy cập các chức năng phù hợp với vai trò của mình.                                                       | Must have   |
| US03  | Là người dùng, tôi muốn đăng xuất để kết thúc phiên sử dụng tài khoản.                                                                                        | Must have   |
| US04  | Là quản trị viên, tôi muốn xem danh sách tài khoản để quản lý người dùng trên nền tảng.                                                                       | Must have   |
| US05  | Là quản trị viên, tôi muốn khóa hoặc mở khóa tài khoản để kiểm soát quyền truy cập nền tảng.                                                                  | Must have   |
| US06  | Là khách hàng, tôi muốn đăng tin yêu cầu sửa chữa để tìm kỹ thuật viên phù hợp.                                                                               | Must have   |
| US07  | Là khách hàng, tôi muốn xem danh sách tin sửa chữa của mình, bao gồm trạng thái của từng tin, để theo dõi và quản lý các yêu cầu đã đăng.                     | Must have   |
| US08  | Là khách hàng, tôi muốn xem chi tiết tin sửa chữa của mình, bao gồm trạng thái hiện tại, để kiểm tra thông tin yêu cầu đã đăng.                               | Must have   |
| US09  | Là khách hàng, tôi muốn đóng tin sửa chữa của mình khi không còn nhu cầu.                                                                                     | Must have   |
| US10  | Là kỹ thuật viên, tôi muốn xem danh sách tin sửa chữa để tìm kiếm công việc phù hợp.                                                                          | Must have   |
| US11  | Là kỹ thuật viên, tôi muốn lọc tin sửa chữa theo các tiêu chí phù hợp để nhanh chóng tìm được công việc mong muốn.                                            | Must have   |
| US12  | Là kỹ thuật viên, tôi muốn xem chi tiết tin sửa chữa, bao gồm trạng thái hiện tại, để đánh giá yêu cầu và quyết định có gửi đề xuất hay không.                | Must have   |
| US13  | Là kỹ thuật viên, tôi muốn gửi đề xuất cho một tin sửa chữa để thể hiện mong muốn thực hiện công việc.                                                        | Must have   |
| US14  | Là khách hàng, tôi muốn xem các đề xuất sửa chữa đã nhận để cân nhắc lựa chọn kỹ thuật viên.                                                                  | Must have   |
| US15  | Là khách hàng, tôi muốn xem chi tiết đề xuất của kỹ thuật viên để có đủ thông tin trước khi đưa ra quyết định lựa chọn.                                       | Must have   |
| US16  | Là khách hàng, tôi muốn chọn một kỹ thuật viên từ danh sách đề xuất để thực hiện công việc sửa chữa.                                                          | Must have   |
| US17  | Là khách hàng, tôi muốn xác nhận công việc đã hoàn thành để hệ thống cập nhật trạng thái yêu cầu và kết thúc quá trình sửa chữa.                              | Must have   |
| US18  | Là khách hàng, tôi muốn đánh giá kỹ thuật viên sau khi hoàn thành sửa chữa để phản hồi chất lượng dịch vụ.                                                    | Should have |
| US19  | Là kỹ thuật viên, tôi muốn đánh giá khách hàng sau khi hoàn thành sửa chữa để phản hồi quá trình hợp tác.                                                     | Should have |
| US20  | Là kỹ thuật viên, tôi muốn nhận thông báo khi đề xuất của mình được chấp nhận để biết kết quả lựa chọn.                                                       | Could have  |
| US21  | Là khách hàng, tôi cần chỉnh sửa thông tin tin sửa chữa của mình khi tin chưa được chọn kỹ thuật viên, để cập nhật thông tin yêu cầu khi cần thay đổi         | Should have |
| US22  | Là kỹ thuật viên, tôi cần chỉnh sửa đề xuất đã gửi khi chưa được khách hàng chấp nhận, để điều chỉnh giá và nội dung đề xuất phù hợp.                         | Should have |
| US23  | Là kỹ thuật viên, tôi cần rút đề xuất đã gửi khi không còn khả năng thực hiện công việc, để tránh khách hàng lựa chọn một đề xuất mà tôi không thể thực hiện. | Should have |

### 1.3.2. Yêu cầu chức năng

| Mã FR | Mô tả                                                                                                                                                | US   |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| FR01  | Hệ thống phải cho phép người dùng đăng ký tài khoản bằng cách cung cấp các thông tin bắt buộc theo quy định.                                         | US01 |
| FR02  | Hệ thống phải cho phép người dùng đăng nhập bằng thông tin tài khoản hợp lệ.                                                                         | US02 |
| FR03  | Hệ thống phải cho phép người dùng đăng xuất khỏi tài khoản để kết thúc phiên sử dụng.                                                                | US03 |
| FR04  | Hệ thống phải cho phép quản trị viên xem danh sách tài khoản người dùng trên nền tảng.                                                               | US04 |
| FR05  | Hệ thống phải cho phép quản trị viên khóa hoặc mở khóa tài khoản người dùng.                                                                         | US05 |
| FR06  | Hệ thống phải cho phép khách hàng tạo tin yêu cầu sửa chữa bằng cách cung cấp các thông tin cần thiết về nhu cầu sửa chữa.                           | US06 |
| FR07  | Hệ thống phải cho phép khách hàng xem danh sách các tin sửa chữa do mình đăng, bao gồm trạng thái hiện tại của từng tin.                             | US07 |
| FR08  | Hệ thống phải cho phép khách hàng xem chi tiết tin sửa chữa do mình đăng, bao gồm các thông tin đã cung cấp và trạng thái hiện tại.                  | US08 |
| FR09  | Hệ thống phải cho phép khách hàng đóng tin sửa chữa do mình đăng khi tin đáp ứng các điều kiện đóng.                                                 | US09 |
| FR10  | Hệ thống phải cho phép kỹ thuật viên xem danh sách tin sửa chữa có thể tiếp nhận.                                                                    | US10 |
| FR11  | Hệ thống phải cho phép kỹ thuật viên lọc danh sách tin sửa chữa theo các tiêu chí được hỗ trợ, chẳng hạn như loại dịch vụ hoặc khu vực sửa chữa.     | US11 |
| FR12  | Hệ thống phải cho phép kỹ thuật viên xem chi tiết tin sửa chữa để đánh giá yêu cầu trước khi gửi đề xuất.                                            | US12 |
| FR13  | Hệ thống phải cho phép kỹ thuật viên gửi đề xuất cho tin sửa chữa đủ điều kiện, bao gồm các thông tin cần thiết như giá đề xuất và nội dung đề xuất. | US13 |
| FR14  | Hệ thống phải cho phép khách hàng xem danh sách các đề xuất mà kỹ thuật viên đã gửi cho tin sửa chữa của mình.                                       | US14 |
| FR15  | Hệ thống phải cho phép khách hàng xem chi tiết từng đề xuất sửa chữa, bao gồm thông tin đề xuất và kỹ thuật viên gửi đề xuất.                        | US15 |
| FR16  | Hệ thống phải cho phép khách hàng chấp nhận một đề xuất để lựa chọn kỹ thuật viên thực hiện công việc sửa chữa.                                      | US16 |
| FR17  | Hệ thống phải cho phép khách hàng xác nhận công việc sửa chữa đã hoàn thành để hệ thống cập nhật trạng thái tin sang Hoàn thành.                     | US17 |
| FR18  | Hệ thống phải cho phép khách hàng đánh giá kỹ thuật viên sau khi công việc sửa chữa hoàn thành.                                                      | US18 |
| FR19  | Hệ thống phải cho phép kỹ thuật viên đánh giá khách hàng sau khi công việc sửa chữa hoàn thành.                                                      | US19 |
| FR20  | Hệ thống phải cho phép kỹ thuật viên nhận thông báo khi đề xuất của mình được khách hàng chấp nhận.                                                  | US20 |
| FR21  | Hệ thống cho phép khách hàng chỉnh sửa thông tin tin sửa chữa đã đăng khi tin chưa chọn kỹ thuật viên.                                               | US21 |
| FR22  | Hệ thống cho phép kỹ thuật viên chỉnh sửa nội dung và thông tin đề xuất đã gửi khi đề xuất chưa được khách hàng chấp nhận.                           | US22 |
| FR23  | Hệ thống cho phép kỹ thuật viên rút đề xuất đã gửi khi đề xuất chưa được khách hàng chấp nhận.                                                       | US23 |

## **1.4. Yêu cầu phi chức năng**

| Mã NFR | Mô tả                                                                                                                                                                                                                                   |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR1   | Hệ thống phải hiển thị danh sách tin sửa chữa trong vòng 3 giây với tối đa 1000 tin sửa chữa trong cơ sở dữ liệu, khi có 100 người dùng truy cập đồng thời.                                                                             |
| NFR2   | Hệ thống phải giới hạn quyền truy cập theo vai trò người dùng; khách hàng chỉ được xem và chỉnh sửa tin sửa chữa do mình đăng, kỹ thuật viên chỉ được quản lý đề xuất của mình và quản trị viên được phép quản lý tài khoản người dùng. |
| NFR3   | Người dùng mới phải hoàn thành việc đăng tin sửa chữa với đầy đủ thông tin bắt buộc trong vòng 3 phút, sau tối đa 5 phút hướng dẫn sử dụng, mà không cần sự trợ giúp từ người khác.                                                     |

## **1.5. Ràng buộc và quy tắc nghiệp vụ**

| Mã ràng buộc | Nội dung ràng buộc                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR01         | Người dùng chỉ được thực hiện các chức năng phù hợp với vai trò của mình: khách hàng, kỹ thuật viên hoặc quản trị viên.                            |
| BR02         | Tài khoản bị khóa không được thực hiện các thao tác yêu cầu đăng nhập.                                                                             |
| BR03         | Khách hàng chỉ được xem hoặc đóng các tin sửa chữa do chính mình tạo.                                                                              |
| BR04         | Kỹ thuật viên chỉ được xem và gửi đề xuất đối với các tin đang ở trạng thái chờ đề xuất.                                                           |
| BR05         | Khách hàng phải cung cấp đầy đủ các thông tin bắt buộc trước khi đăng tin sửa chữa.                                                                |
| BR06         | Khách hàng chỉ được đóng tin của mình khi tin chưa được chọn kỹ thuật viên.                                                                        |
| BR07         | Kỹ thuật viên chỉ được gửi đề xuất cho tin đang ở trạng thái "Chờ đề xuất".                                                                        |
| BR08         | Mỗi kỹ thuật viên chỉ được có một đề xuất đang hiệu lực cho cùng một tin sửa chữa.                                                                 |
| BR09         | Chỉ khách hàng sở hữu tin mới được xem danh sách đề xuất và chấp nhận đề xuất của tin đó.                                                          |
| BR10         | Mỗi tin sửa chữa chỉ được có một kỹ thuật viên được chọn. Khi một đề xuất được chấp nhận, các đề xuất còn lại không còn đủ điều kiện để được chọn. |
| BR11         | Chỉ khách hàng sở hữu tin mới được xác nhận hoàn thành công việc.                                                                                  |
| BR12         | Trạng thái tin sửa chữa chỉ được chuyển theo trình tự: Chờ đề xuất → Đã chọn kỹ thuật viên → Hoàn thành.                                           |
| BR13         | Khách hàng và kỹ thuật viên chỉ được đánh giá đối phương sau khi công việc đã ở trạng thái "Hoàn thành" và chỉ đối với công việc mà họ tham gia.   |
| BR14         | Mỗi bên chỉ được gửi một đánh giá cho bên còn lại đối với mỗi công việc đã hoàn thành.                                                             |
| BR15         | Thông tin liên hệ chi tiết của khách hàng chỉ được hiển thị cho kỹ thuật viên đã được chọn thực hiện công việc.                                    |
| BR16         | Hệ thống phải tạo thông báo trong ứng dụng cho kỹ thuật viên khi đề xuất của họ được khách hàng chấp nhận.                                         |

## **1.6. Bảng truy vết**

| Mã FR | Mã US | MoSCoW      |
| ----- | ----- | ----------- |
| FR01  | US01  | Must have   |
| FR02  | US02  | Must have   |
| FR03  | US03  | Must have   |
| FR04  | US04  | Must have   |
| FR05  | US05  | Must have   |
| FR06  | US06  | Must have   |
| FR07  | US07  | Must have   |
| FR08  | US08  | Must have   |
| FR09  | US09  | Must have   |
| FR10  | US10  | Must have   |
| FR11  | US11  | Must have   |
| FR12  | US12  | Must have   |
| FR13  | US13  | Must have   |
| FR14  | US14  | Must have   |
| FR15  | US15  | Must have   |
| FR16  | US16  | Must have   |
| FR17  | US17  | Must have   |
| FR18  | US18  | Should have |
| FR19  | US19  | Should have |
| FR20  | US20  | Could have  |
| FR21  | US21  | Should have |
| FR22  | US22  | Should have |
| FR23  | US23  | Should have |
