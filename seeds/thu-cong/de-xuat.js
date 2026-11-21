// Đề xuất mẫu, gửi theo thứ tự trong mảng (BR07: chỉ gửi cho tin đang Chờ đề xuất; BR08: mỗi kỹ thuật viên một đề xuất
// còn hiệu lực cho mỗi tin). tin và ktv là khóa trong tin-sua-chua.js và tai-khoan.js.
// Với tin có ketQua DA_CHON hoặc HOAN_THANH, đề xuất của ktvDuocChon được khách hàng chấp nhận; các đề xuất còn chờ
// của tin đó tự chuyển sang bị từ chối (BR10).
// rut: true thì kỹ thuật viên rút đề xuất ngay sau khi gửi (US23, trạng thái Đã rút).
// daDocThongBao: true thì đánh dấu đã đọc thông báo "đề xuất được chấp nhận" của đề xuất này (BR16, US20).
// sua: { price?, description?, estimatedDuration? } kỹ thuật viên sửa đề xuất ngay sau khi gửi, khi còn chờ (US22).
// Gửi lại sau khi rút: thêm một dòng cùng tin và ktv NGAY SAU dòng có rut: true (BR08 chỉ cho một đề xuất còn hiệu lực).
// Chỉ thêm dòng mới ở CUỐI mảng để mã của 9 đề xuất đầu và 3 thông báo không đổi.
const { chuoiDaiDung } = require('./tien-ich');

module.exports = [
  { tin: 'maylanh-cho', ktv: 'ktv1', price: 450000, description: 'Kiểm tra, nạp gas R32 và vệ sinh dàn lạnh. Bảo hành 1 tháng.', estimatedDuration: '2-3 giờ' },
  { tin: 'maylanh-cho', ktv: 'ktv2', price: 400000, description: 'Kiểm tra rò gas, nạp gas và vệ sinh máy. Giá chưa gồm linh kiện thay thế nếu có.', estimatedDuration: '2 giờ' },
  { tin: 'maylanh-cho', ktv: 'ktv3', price: 380000, description: 'Nạp gas và vệ sinh máy lạnh tại nhà.', estimatedDuration: '90 phút', rut: true },

  { tin: 'ongnuoc-dachon', ktv: 'ktv1', price: 350000, description: 'Thay ống và co nối dưới bồn rửa, kiểm tra các mối nối còn lại.', estimatedDuration: '1-2 giờ' },
  { tin: 'ongnuoc-dachon', ktv: 'ktv2', price: 300000, description: 'Siết và quấn lại các mối nối bị rò, thay gioăng.', estimatedDuration: '1 giờ' },

  { tin: 'tulanh-xong', ktv: 'ktv2', price: 500000, description: 'Kiểm tra bo mạch và quạt dàn lạnh, thay cảm biến nếu hỏng.', estimatedDuration: '2 giờ' },
  { tin: 'tulanh-xong', ktv: 'ktv3', price: 450000, description: 'Kiểm tra và xử lý đóng tuyết dàn lạnh.', estimatedDuration: '2 giờ' },

  { tin: 'dien-xong', ktv: 'ktv1', price: 250000, description: 'Thay ổ cắm, kiểm tra dây dẫn và aptomat.', estimatedDuration: '1 giờ', daDocThongBao: true },

  { tin: 'quatran-moi', ktv: 'ktv3', price: 280000, description: 'Cân chỉnh cánh quạt, tra dầu và siết lại các khớp nối.', estimatedDuration: '1 giờ' },

  // ===== Bổ sung cho các tin từ SC-008 =====

  // khach1-nhieu-de-xuat: 7 đề xuất (ktv3 rút rồi gửi lại với giá khác, ktv5 sửa giá, ktv6 không ghi thời gian dự kiến)
  { tin: 'khach1-nhieu-de-xuat', ktv: 'ktv1', price: 480000, description: 'Kiểm tra cả hai máy, vệ sinh dàn lạnh và nạp gas bổ sung nếu thiếu.', estimatedDuration: '3 giờ' },
  { tin: 'khach1-nhieu-de-xuat', ktv: 'ktv2', price: 420000, description: 'Vệ sinh và kiểm tra hai máy trong một buổi, giá chưa gồm gas.', estimatedDuration: '2-3 giờ' },
  { tin: 'khach1-nhieu-de-xuat', ktv: 'ktv3', price: 400000, description: 'Kiểm tra và vệ sinh hai máy.', estimatedDuration: '3 giờ', rut: true },
  { tin: 'khach1-nhieu-de-xuat', ktv: 'ktv3', price: 390000, description: 'Giá mới sau khi cân nhắc lại: vệ sinh, kiểm tra và nạp gas cả hai máy.', estimatedDuration: '3 giờ' },
  { tin: 'khach1-nhieu-de-xuat', ktv: 'ktv5', price: 450000, description: 'Kiểm tra gas, áp suất và cảm biến của cả hai máy.', estimatedDuration: '2 giờ', sua: { price: 430000 } },
  { tin: 'khach1-nhieu-de-xuat', ktv: 'ktv6', price: 350000, description: 'Vệ sinh hai máy, nếu thiếu gas báo giá thêm.' },
  { tin: 'khach1-nhieu-de-xuat', ktv: 'ktv7', price: 520000, description: 'Kiểm tra toàn bộ, thay cảm biến nhiệt nếu hỏng. Bảo hành 3 tháng.', estimatedDuration: '4 giờ' },

  // khach1-maygiat-dong: tin đã đóng nhưng hai đề xuất vẫn còn chờ (BR06 không đụng tới đề xuất)
  { tin: 'khach1-maygiat-dong', ktv: 'ktv2', price: 280000, description: 'Cân lại chân máy, kiểm tra lò xo giảm chấn.', estimatedDuration: '1-2 giờ' },
  { tin: 'khach1-maygiat-dong', ktv: 'ktv6', price: 250000, description: 'Kiểm tra giảm chấn và cân bằng lồng giặt.', estimatedDuration: '1 giờ' },

  // khach1-tulanh-dachon: ktv5 được chọn (thông báo chưa đọc), ktv2 bị từ chối
  { tin: 'khach1-tulanh-dachon', ktv: 'ktv5', price: 600000, description: 'Xả tuyết, kiểm tra điện trở xả đá và cảm biến, thay nếu hỏng.', estimatedDuration: '2-3 giờ' },
  { tin: 'khach1-tulanh-dachon', ktv: 'ktv2', price: 550000, description: 'Kiểm tra bộ xả tuyết và quạt dàn lạnh.', estimatedDuration: '2 giờ' },

  { tin: 'khach1-dien-xong', ktv: 'ktv5', price: 200000, description: 'Kiểm tra dây nguồn, thay bộ nguồn đèn LED nếu hỏng.', estimatedDuration: '1 giờ', daDocThongBao: true },
  { tin: 'khach1-dien-xong', ktv: 'ktv1', price: 220000, description: 'Thay bộ nguồn đèn và kiểm tra mối nối.', estimatedDuration: '1 giờ' },

  { tin: 'khach1-nuoc-xong-dg-thap', ktv: 'ktv6', price: 180000, description: 'Tháo đầu sen, thông cặn và kiểm tra van.', estimatedDuration: '1 giờ' },
  { tin: 'khach1-nuoc-xong-dg-thap', ktv: 'ktv3', price: 200000, description: 'Thông đường ống và thay đầu sen mới.', estimatedDuration: '1 giờ' },

  // khach1-maylanh-ktv-bi-khoa: kỹ thuật viên được chọn sau đó bị khóa (BR02 không xóa lịch sử)
  { tin: 'khach1-maylanh-ktv-bi-khoa', ktv: 'bikhoa', price: 350000, description: 'Thông ống thoát nước và vệ sinh khay hứng.', estimatedDuration: '2 giờ' },
  { tin: 'khach1-maylanh-ktv-bi-khoa', ktv: 'ktv2', price: 380000, description: 'Kiểm tra độ dốc ống thoát và thông tắc.', estimatedDuration: '2 giờ' },

  { tin: 'khach1-maygiat-xong-ktv7', ktv: 'ktv7', price: 300000, description: 'Kiểm tra van cấp nước, thay van nếu hỏng.', estimatedDuration: '1-2 giờ' },

  // khach1-dien-qua-han: thời gian mong muốn đã qua; kỹ thuật viên sửa lại giá và thời gian dự kiến
  { tin: 'khach1-dien-qua-han', ktv: 'ktv5', price: 150000, description: 'Thay ổ cắm chịu tải cao và kiểm tra dây dẫn.', estimatedDuration: '1 giờ', sua: { price: 140000, estimatedDuration: '45 phút' } },

  // khach2-gia-bien: giá ở hai đầu biên và giá có phần thập phân
  { tin: 'khach2-gia-bien', ktv: 'ktv1', price: 0.1, description: 'Giá tối thiểu 0,1 để thử biên của trường giá.', estimatedDuration: '1 giờ' },
  { tin: 'khach2-gia-bien', ktv: 'ktv2', price: 9999999999999.9, description: 'Giá lớn nhất còn hợp lệ (dưới 10 nghìn tỷ) để thử hiển thị số lớn.', estimatedDuration: chuoiDaiDung('Thời gian dự kiến rất dài ', 50) },
  { tin: 'khach2-gia-bien', ktv: 'ktv5', price: 150000.5, description: 'Giá có phần thập phân (một chữ số sau dấu phẩy).', estimatedDuration: '1 giờ' },

  { tin: 'khach2-tulanh-xong-ktv5', ktv: 'ktv5', price: 480000, description: 'Kiểm tra rơ-le khởi động và tụ máy nén, thay nếu hỏng.', estimatedDuration: '2 giờ', daDocThongBao: true },
  { tin: 'khach2-tulanh-xong-ktv5', ktv: 'ktv3', price: 450000, description: 'Kiểm tra máy nén và bộ khởi động.', estimatedDuration: '2 giờ' },

  { tin: 'khach2-nuoc-dachon', ktv: 'ktv1', price: 270000, description: 'Thông bồn cầu bằng máy chuyên dụng và kiểm tra ống thoát.', estimatedDuration: '1 giờ', daDocThongBao: true },
  { tin: 'khach2-nuoc-dachon', ktv: 'ktv5', price: 260000, description: 'Thông tắc và kiểm tra phao nước.', estimatedDuration: '1 giờ' },

  { tin: 'khach2-dien-dong-con-cho', ktv: 'ktv2', price: 230000, description: 'Kiểm tra thanh nhiệt và rơ-le nhiệt của bình.', estimatedDuration: '1 giờ' },

  // khach3
  { tin: 'khach3-maylanh-xong', ktv: 'ktv1', price: 500000, description: 'Kiểm tra bo mạch dàn nóng và cảm biến nhiệt, báo giá linh kiện trước khi thay.', estimatedDuration: '2-3 giờ' },
  { tin: 'khach3-maygiat-mot-de-xuat', ktv: 'ktv2', price: 330000, description: 'Kiểm tra van cấp nước và cảm biến mực nước.', estimatedDuration: '1-2 giờ' },

  { tin: 'khach3-tulanh-dachon', ktv: 'ktv3', price: 520000, description: 'Kiểm tra cửa gió và cảm biến ngăn mát.', estimatedDuration: '2 giờ' },
  { tin: 'khach3-tulanh-dachon', ktv: 'ktv1', price: 540000, description: 'Kiểm tra quạt dàn lạnh, cảm biến và bộ xả tuyết.', estimatedDuration: '2-3 giờ' },

  { tin: 'khach3-nuoc-xong-nhan-xet-dai', ktv: 'ktv2', price: 220000, description: 'Thay gioăng đồng hồ và siết lại các mối nối.', estimatedDuration: '1 giờ' },

  { tin: 'khach3-khac-xong', ktv: 'ktv5', price: 800000, description: 'Chỉnh hành trình, thay cảm biến an toàn của cổng.', estimatedDuration: '1 ngày' },
  { tin: 'khach3-khac-xong', ktv: 'ktv6', price: 750000, description: 'Kiểm tra mô-tơ và bộ điều khiển cổng.', estimatedDuration: '1 ngày' },

  // khach3-maylanh-nam-de-xuat: 5 đề xuất của 5 kỹ thuật viên khác nhau
  { tin: 'khach3-maylanh-nam-de-xuat', ktv: 'ktv1', price: 460000, description: 'Vệ sinh và kiểm tra gas bốn máy, bảo hành 1 tháng.', estimatedDuration: '4 giờ' },
  { tin: 'khach3-maylanh-nam-de-xuat', ktv: 'ktv2', price: 430000, description: 'Vệ sinh bốn máy trong một buổi sáng.', estimatedDuration: 'Nửa ngày' },
  { tin: 'khach3-maylanh-nam-de-xuat', ktv: 'ktv3', price: 410000, description: 'Vệ sinh dàn lạnh, dàn nóng và kiểm tra gas.', estimatedDuration: '4 giờ' },
  { tin: 'khach3-maylanh-nam-de-xuat', ktv: 'ktv5', price: 440000, description: 'Vệ sinh toàn bộ, đo áp suất gas từng máy.', estimatedDuration: '4 giờ' },
  { tin: 'khach3-maylanh-nam-de-xuat', ktv: 'ktv7', price: 470000, description: 'Vệ sinh sâu bốn máy, thay lưới lọc nếu cần.', estimatedDuration: 'Nửa ngày' },

  { tin: 'khach3-maygiat-xong-dg-thap', ktv: 'ktv6', price: 260000, description: 'Kiểm tra khóa cửa và bơm xả.', estimatedDuration: '1 giờ' },

  // khach4
  { tin: 'khach4-maylanh-xong', ktv: 'ktv5', price: 390000, description: 'Kiểm tra bo mạch nhận tín hiệu và mắt thu điều khiển.', estimatedDuration: '1-2 giờ' },
  { tin: 'khach4-maylanh-xong', ktv: 'ktv1', price: 400000, description: 'Kiểm tra mắt nhận và bo mạch dàn lạnh.', estimatedDuration: '1-2 giờ' },

  { tin: 'khach4-nuoc-cho', ktv: 'ktv5', price: 250000, description: 'Thông tắc bằng lò xo và kiểm tra siphon.', estimatedDuration: '1 giờ', sua: { price: 230000 } },
  { tin: 'khach4-nuoc-cho', ktv: 'ktv1', price: 260000, description: 'Thông tắc đường thoát và vệ sinh siphon.', estimatedDuration: '1 giờ' },

  { tin: 'khach4-dien-xong-khong-danh-gia', ktv: 'ktv7', price: 310000, description: 'Đo tải từng nhánh, thay aptomat nhánh nếu quá tải.', estimatedDuration: '2 giờ' },

  { tin: 'khach4-maygiat-dachon', ktv: 'ktv5', price: 290000, description: 'Thay gioăng cửa và kiểm tra khóa cửa.', estimatedDuration: '1-2 giờ' },
  { tin: 'khach4-maygiat-dachon', ktv: 'ktv3', price: 280000, description: 'Thay gioăng cửa chính hãng.', estimatedDuration: '1-2 giờ' },

  // khach4-tulanh-dong-nhieu-cho: tin đã đóng nhưng còn ba đề xuất chờ
  { tin: 'khach4-tulanh-dong-nhieu-cho', ktv: 'ktv1', price: 500000, description: 'Kiểm tra rò điện, đo cách điện máy nén.', estimatedDuration: '2 giờ' },
  { tin: 'khach4-tulanh-dong-nhieu-cho', ktv: 'ktv2', price: 480000, description: 'Kiểm tra dây tiếp địa và cách điện.', estimatedDuration: '2 giờ' },
  { tin: 'khach4-tulanh-dong-nhieu-cho', ktv: 'ktv3', price: 470000, description: 'Đo rò điện và xử lý tiếp địa.', estimatedDuration: '2 giờ' },

  { tin: 'khach4-maylanh-xong-ktv2', ktv: 'ktv2', price: 410000, description: 'Vệ sinh dàn lạnh bằng máy xịt áp lực và diệt khuẩn.', estimatedDuration: '2 giờ' },
  { tin: 'khach4-khac-xa', ktv: 'ktv6', price: 1500000, description: 'Rút máy bơm lên kiểm tra, thay phớt và vệ sinh.', estimatedDuration: '1 ngày' },
  { tin: 'khach4-nuoc-xong', ktv: 'ktv1', price: 240000, description: 'Dò rò bằng thiết bị chuyên dụng và hàn lại mối nối.', estimatedDuration: '2-3 giờ' },

  // khach5: đề xuất ở dữ liệu biên
  { tin: 'khach5-tieu-de-200', ktv: 'ktv1', price: 300000, description: 'Kiểm tra toàn bộ hệ thống điện và báo giá trước khi sửa.', estimatedDuration: '2 giờ' },
  {
    tin: 'khach5-mo-ta-dai', ktv: 'ktv5', price: 5500000, estimatedDuration: '2 ngày',
    description: `Báo giá chi tiết từng phòng (mô tả dài hơn 3000 ký tự):\n${Array.from({ length: 45 }, (_, i) => `Phòng ${i + 1}: vệ sinh dàn lạnh, kiểm tra gas, đo áp suất, thay gioăng nếu cần.`).join(' ')}`,
  },
  { tin: 'khach5-mo-ta-dai', ktv: 'ktv2', price: 5200000, description: 'Kiểm tra và vệ sinh toàn bộ, báo giá linh kiện sau khi khảo sát.', estimatedDuration: '2 ngày' },
  { tin: 'khach5-loai-va-dia-diem-toi-da', ktv: 'ktv3', price: 200000, description: 'Thời gian dự kiến ở đề xuất này dài đúng 50 ký tự (giới hạn của cột).', estimatedDuration: chuoiDaiDung('Dự kiến rất dài ', 50) },
  { tin: 'khach5-ky-tu-dac-biet', ktv: 'ktv2', price: 180000, description: `Giá <b>không phát sinh</b> & "bảo hành 3 tháng" '; DROP TABLE proposal; -- <img src=x onerror=alert(1)>`, estimatedDuration: '1 giờ' },
  { tin: 'khach5-khoang-trang', ktv: 'ktv1', price: 210000, description: '   Báo giá có khoảng trắng thừa ở hai đầu.   ', estimatedDuration: '  1 giờ  ' },
  { tin: 'khach5-loai-ngoai-danh-sach', ktv: 'ktv5', price: 320000, description: 'Kiểm tra thanh nhiệt và rơ-le chống giật của bình.', estimatedDuration: '1-2 giờ' },
  { tin: 'khach5-da-nang', ktv: 'ktv6', price: 600000, description: 'Kiểm tra hai máy và nạp gas nếu thiếu.', estimatedDuration: '3 giờ' },
  { tin: 'khach5-da-nang', ktv: 'ktv2', price: 580000, description: 'Vệ sinh hai máy và kiểm tra gas.', estimatedDuration: '3 giờ' },
  { tin: 'khach5-ha-noi-xong', ktv: 'ktv5', price: 420000, description: 'Dò mạch, sửa chỗ đứt dây và cân lại tải.', estimatedDuration: '2-3 giờ' },
  // khach5-dong-chi-con-rut: mọi đề xuất đã rút, tin đóng sau đó
  { tin: 'khach5-dong-chi-con-rut', ktv: 'ktv1', price: 150000, description: 'Thay đoạn ống bị gãy.', estimatedDuration: '1 giờ', rut: true },
  { tin: 'khach5-dong-chi-con-rut', ktv: 'ktv2', price: 140000, description: 'Thay vòi và nối lại ống.', estimatedDuration: '1 giờ', rut: true },

  // khachkhoa
  { tin: 'khachkhoa-maylanh-rut-het', ktv: 'ktv2', price: 330000, description: 'Thông ống thoát nước máy lạnh.', estimatedDuration: '1 giờ', rut: true },
  { tin: 'khachkhoa-maylanh-rut-het', ktv: 'ktv3', price: 310000, description: 'Kiểm tra khay hứng và ống thoát.', estimatedDuration: '1 giờ', rut: true },
  { tin: 'khachkhoa-dien-dachon', ktv: 'ktv1', price: 260000, description: 'Thay nút bấm và kiểm tra bộ chuông.', estimatedDuration: '1 giờ' },
  { tin: 'khachkhoa-nuoc-xong', ktv: 'ktv3', price: 210000, description: 'Kiểm tra tụ khởi động và mô-tơ bơm.', estimatedDuration: '1-2 giờ' },
];
