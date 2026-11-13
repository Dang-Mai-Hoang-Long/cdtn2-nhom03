// Đề xuất mẫu, gửi theo thứ tự trong mảng (BR07: chỉ gửi cho tin đang Chờ đề xuất; BR08: mỗi kỹ thuật viên một đề xuất
// còn hiệu lực cho mỗi tin). tin và ktv là khóa trong tin-sua-chua.js và tai-khoan.js.
// Với tin có ketQua DA_CHON hoặc HOAN_THANH, đề xuất của ktvDuocChon được khách hàng chấp nhận; các đề xuất còn chờ
// của tin đó tự chuyển sang bị từ chối (BR10).
// rut: true thì kỹ thuật viên rút đề xuất ngay sau khi gửi (US23, trạng thái Đã rút).
// daDocThongBao: true thì đánh dấu đã đọc thông báo "đề xuất được chấp nhận" của đề xuất này (BR16, US20).
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
];
