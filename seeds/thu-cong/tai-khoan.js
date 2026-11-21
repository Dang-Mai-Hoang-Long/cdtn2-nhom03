// Tài khoản demo viết tay. Mật khẩu chung nằm ở ../hang-so.js; chỉ dành cho môi trường phát triển.
// khoa: tên ngắn để các file dữ liệu khác tham chiếu tới tài khoản.
// Tài khoản được tạo theo ĐÚNG THỨ TỰ trong mảng, nên mã tài khoản ổn định (admin = 1, khach1 = 2...).
// Các tài liệu (bug-log, api-contract) dẫn tới những mã này: chỉ thêm tài khoản mới ở CUỐI mảng.
// biKhoa: true thì bị quản trị viên khóa sau khi mọi thao tác xong (BR02), để thử đăng nhập bị từ chối và mở khóa.
// Quản trị viên không đăng ký được qua giao diện (BR01) nên bộ chạy tạo thẳng trong CSDL.
const TAI_KHOAN = [
  { khoa: 'admin', email: 'admin@demo.vn', fullName: 'Quản Trị Demo', phone: '0900000001', role: 'ADMIN' },

  { khoa: 'khach1', email: 'khach1@demo.vn', fullName: 'Nguyễn Minh Anh', phone: '0901000001', role: 'CUSTOMER' },
  { khoa: 'khach2', email: 'khach2@demo.vn', fullName: 'Lê Thị Hoa', phone: '0901000002', role: 'CUSTOMER' },

  { khoa: 'ktv1', email: 'ktv1@demo.vn', fullName: 'Trần Quốc Huy', phone: '0902000001', role: 'TECHNICIAN' },
  { khoa: 'ktv2', email: 'ktv2@demo.vn', fullName: 'Phạm Văn Bình', phone: '0902000002', role: 'TECHNICIAN' },
  { khoa: 'ktv3', email: 'ktv3@demo.vn', fullName: 'Võ Thanh Sơn', phone: '0902000003', role: 'TECHNICIAN' },
  { khoa: 'bikhoa', email: 'bikhoa@demo.vn', fullName: 'Đỗ Văn Khóa', phone: '0902000004', role: 'TECHNICIAN', biKhoa: true },

  // ----- Bổ sung để phủ thêm tình huống (thêm ở cuối nên mã của 7 tài khoản trên không đổi) -----
  // admin2: thử khóa / mở khóa tài khoản quản trị viên (bị từ chối, BR01) và danh sách tài khoản không gồm quản trị viên.
  { khoa: 'admin2', email: 'admin2@demo.vn', fullName: 'Quản Trị Phụ', phone: '0900000002', role: 'ADMIN' },
  // Các số điện thoại dưới đây cố ý khác định dạng (+84, khoảng trắng, dấu chấm, dấu gạch) để thử hiển thị.
  { khoa: 'khach3', email: 'khach3@demo.vn', fullName: 'Trần Thị Bích Ngọc', phone: '+84901000003', role: 'CUSTOMER' },
  { khoa: 'khach4', email: 'khach4@demo.vn', fullName: 'Phạm Đình Quang', phone: '0901 000 004', role: 'CUSTOMER' },
  { khoa: 'khach5', email: 'khach5@demo.vn', fullName: 'Nguyễn Hoàng Anh Thư', phone: '0901.000.005', role: 'CUSTOMER' },
  // khach6 chưa có tin nào: thử màn hình danh sách trống.
  { khoa: 'khach6', email: 'khach6@demo.vn', fullName: 'Ngô Bảo Châu', phone: '090-100-0006', role: 'CUSTOMER' },
  // khachkhoa bị khóa nhưng còn lịch sử: tin đã chọn kỹ thuật viên, tin hoàn thành.
  { khoa: 'khachkhoa', email: 'khachkhoa@demo.vn', fullName: 'Lý Văn Khóa', phone: '0901000007', role: 'CUSTOMER', biKhoa: true },
  // ktv4 chưa gửi đề xuất nào: thử màn hình trống của kỹ thuật viên mới.
  { khoa: 'ktv4', email: 'ktv4@demo.vn', fullName: 'Hồ Thị Mai Anh', phone: '0902000005', role: 'TECHNICIAN' },
  // ktv5 là kỹ thuật viên bận nhất: hơn 10 đề xuất (qua trang 1 của "Đề xuất của tôi") và nhiều việc được chọn.
  { khoa: 'ktv5', email: 'ktv5@demo.vn', fullName: 'Dương Văn Tài', phone: '+84 902 000 006', role: 'TECHNICIAN' },
  // ktv6 chủ yếu nhận đánh giá thấp (1-2 sao): thử hiển thị điểm trung bình thấp.
  { khoa: 'ktv6', email: 'ktv6@demo.vn', fullName: 'Bùi Quang Vinh', phone: '0902000007', role: 'TECHNICIAN' },
  // ktv7 có họ tên dài đúng 100 ký tự (giới hạn của cột users.full_name): thử cắt chữ và xuống dòng.
  { khoa: 'ktv7', email: 'ktv7@demo.vn', fullName: 'Nguyễn Hoàng Phúc Bảo Quốc Thiên Trường Minh Gia Khánh Anh Đức Tuấn Hải Long Thịnh Vượng Phát Đạt Vũ', phone: '0902000008', role: 'TECHNICIAN' },
];

module.exports = TAI_KHOAN;
