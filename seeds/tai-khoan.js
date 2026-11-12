// Tài khoản demo. Mọi tài khoản dùng chung mật khẩu MAT_KHAU_DEMO; chỉ dành cho môi trường phát triển.
// khoa: tên ngắn để các file dữ liệu khác tham chiếu tới tài khoản.
const MAT_KHAU_DEMO = 'Demo@123';

// Quản trị viên không đăng ký được qua giao diện (BR01) nên bộ chạy tạo riêng.
const QUAN_TRI_VIEN = [
  { khoa: 'admin', email: 'admin@demo.vn', fullName: 'Quản Trị Demo', phone: '0900000001' },
];

const KHACH_HANG = [
  { khoa: 'khach1', email: 'khach1@demo.vn', fullName: 'Nguyễn Minh Anh', phone: '0901000001' },
  { khoa: 'khach2', email: 'khach2@demo.vn', fullName: 'Lê Thị Hoa', phone: '0901000002' },
];

// biKhoa: true thì bị quản trị viên khóa sau khi tạo (BR02), để thử đăng nhập bị từ chối và mở khóa.
const KY_THUAT_VIEN = [
  { khoa: 'ktv1', email: 'ktv1@demo.vn', fullName: 'Trần Quốc Huy', phone: '0902000001' },
  { khoa: 'ktv2', email: 'ktv2@demo.vn', fullName: 'Phạm Văn Bình', phone: '0902000002' },
  { khoa: 'ktv3', email: 'ktv3@demo.vn', fullName: 'Võ Thanh Sơn', phone: '0902000003' },
  { khoa: 'bikhoa', email: 'bikhoa@demo.vn', fullName: 'Đỗ Văn Khóa', phone: '0902000004', biKhoa: true },
];

module.exports = { MAT_KHAU_DEMO, QUAN_TRI_VIEN, KHACH_HANG, KY_THUAT_VIEN };
