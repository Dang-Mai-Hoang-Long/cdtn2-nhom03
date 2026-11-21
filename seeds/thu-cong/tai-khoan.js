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
];

module.exports = TAI_KHOAN;
