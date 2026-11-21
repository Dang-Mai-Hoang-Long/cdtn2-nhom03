// Đánh giá mẫu, chỉ cho tin đã Hoàn thành và đúng hai bên tham gia công việc, mỗi bên một lần (BR13, BR14).
// tin: khóa trong tin-sua-chua.js; nguoiGui: khóa trong tai-khoan.js (khách hàng đánh giá kỹ thuật viên được chọn và ngược lại).
// Tin dien-xong cố ý chỉ có đánh giá của khách hàng để kỹ thuật viên thử gửi đánh giá của mình (US19).
// Chỉ thêm dòng mới ở CUỐI mảng để mã của 3 đánh giá đầu không đổi.
const { chuoiDaiDung } = require('./tien-ich');

module.exports = [
  { tin: 'tulanh-xong', nguoiGui: 'khach2', rating: 5, comment: 'Kỹ thuật viên đến đúng giờ, giải thích rõ nguyên nhân và sửa nhanh.' },
  { tin: 'tulanh-xong', nguoiGui: 'ktv2', rating: 4, comment: 'Khách hàng phối hợp tốt, nhà cửa gọn gàng.' },
  { tin: 'dien-xong', nguoiGui: 'khach2', rating: 4 },

  // ===== Bổ sung cho các tin từ SC-008 (khach4-dien-xong-khong-danh-gia cố ý không có đánh giá nào) =====
  { tin: 'khach1-dien-xong', nguoiGui: 'khach1', rating: 5, comment: 'Làm nhanh, gọn gàng, báo giá đúng như đã thỏa thuận.' },
  { tin: 'khach1-dien-xong', nguoiGui: 'ktv5', rating: 5 },
  // Đánh giá 1 sao kèm nhận xét dài: thử hiển thị điểm thấp và đoạn văn nhiều dòng.
  { tin: 'khach1-nuoc-xong-dg-thap', nguoiGui: 'khach1', rating: 1, comment: 'Thợ đến trễ gần hai tiếng mà không báo trước. Sửa xong vòi vẫn yếu nước, phải gọi người khác tới làm lại. Báo giá cuối cùng cao hơn lúc đầu 100.000 đồng mà không giải thích lý do. Không khuyến khích.' },
  { tin: 'khach1-maylanh-ktv-bi-khoa', nguoiGui: 'khach1', rating: 4, comment: 'Xử lý đúng chỗ rò, làm ngoài giờ như đã hẹn.' },
  { tin: 'khach1-maygiat-xong-ktv7', nguoiGui: 'khach1', rating: 3 },
  { tin: 'khach1-maygiat-xong-ktv7', nguoiGui: 'ktv7', rating: 4, comment: 'Khách hàng nhiệt tình, chuẩn bị sẵn chỗ làm việc.' },
  // Chỉ kỹ thuật viên đánh giá, khách hàng chưa đánh giá (thử US18 từ phía khách hàng).
  { tin: 'khach2-tulanh-xong-ktv5', nguoiGui: 'ktv5', rating: 5, comment: 'Khách hàng thân thiện, thanh toán ngay sau khi sửa xong.' },
  { tin: 'khach3-maylanh-xong', nguoiGui: 'khach3', rating: 5, comment: 'Chuyên nghiệp, giải thích rõ nguyên nhân lỗi.' },
  { tin: 'khach3-maylanh-xong', nguoiGui: 'ktv1', rating: 5 },
  // Nhận xét dài đúng 1000 ký tự (giới hạn của validator) và đánh giá 3 sao.
  { tin: 'khach3-nuoc-xong-nhan-xet-dai', nguoiGui: 'khach3', rating: 3, comment: chuoiDaiDung('Dịch vụ ổn, thợ làm kỹ và dọn dẹp sạch sẽ sau khi sửa nhưng thời gian chờ lâu hơn dự kiến. ', 1000) },
  { tin: 'khach3-nuoc-xong-nhan-xet-dai', nguoiGui: 'ktv2', rating: 5, comment: 'Khách hàng hướng dẫn vị trí đồng hồ rõ ràng.' },
  { tin: 'khach3-khac-xong', nguoiGui: 'khach3', rating: 2, comment: 'Sửa chậm hơn dự kiến nửa ngày.' },
  { tin: 'khach3-maygiat-xong-dg-thap', nguoiGui: 'khach3', rating: 2, comment: 'Máy vẫn còn tiếng ồn nhẹ sau khi sửa.' },
  { tin: 'khach3-maygiat-xong-dg-thap', nguoiGui: 'ktv6', rating: 1, comment: 'Khách hàng không có mặt đúng giờ hẹn, phải chờ rất lâu.' },
  { tin: 'khach4-maylanh-xong', nguoiGui: 'khach4', rating: 4 },
  { tin: 'khach4-maylanh-xong-ktv2', nguoiGui: 'khach4', rating: 3, comment: 'Hết mùi nhưng vài hôm sau mùi nhẹ quay lại.' },
  { tin: 'khach4-maylanh-xong-ktv2', nguoiGui: 'ktv2', rating: 4 },
  { tin: 'khach4-nuoc-xong', nguoiGui: 'khach4', rating: 5, comment: 'Tìm đúng chỗ rò, không phải đục nhiều tường.' },
  // Nhận xét chỉ một emoji (độ dài tối thiểu) và đánh giá hai chiều đều 5 sao.
  { tin: 'khach5-ha-noi-xong', nguoiGui: 'khach5', rating: 5, comment: '👍' },
  { tin: 'khach5-ha-noi-xong', nguoiGui: 'ktv5', rating: 5 },
  { tin: 'khachkhoa-nuoc-xong', nguoiGui: 'khachkhoa', rating: 4 },
  { tin: 'khachkhoa-nuoc-xong', nguoiGui: 'ktv3', rating: 5, comment: 'Khách hàng thanh toán nhanh, trao đổi rõ ràng.' },
];
