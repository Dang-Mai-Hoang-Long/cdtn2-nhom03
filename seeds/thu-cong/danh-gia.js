// Đánh giá mẫu, chỉ cho tin đã Hoàn thành và đúng hai bên tham gia công việc, mỗi bên một lần (BR13, BR14).
// tin: khóa trong tin-sua-chua.js; nguoiGui: khóa trong tai-khoan.js (khách hàng đánh giá kỹ thuật viên được chọn và ngược lại).
// Tin dien-xong cố ý chỉ có đánh giá của khách hàng để kỹ thuật viên thử gửi đánh giá của mình (US19).
module.exports = [
  { tin: 'tulanh-xong', nguoiGui: 'khach2', rating: 5, comment: 'Kỹ thuật viên đến đúng giờ, giải thích rõ nguyên nhân và sửa nhanh.' },
  { tin: 'tulanh-xong', nguoiGui: 'ktv2', rating: 4, comment: 'Khách hàng phối hợp tốt, nhà cửa gọn gàng.' },
  { tin: 'dien-xong', nguoiGui: 'khach2', rating: 4 },
];
