const { VAI_TRO } = require('../utils/constants');

const MAU_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAU_SO_DIEN_THOAI = /^\+?[0-9]{9,15}$/;
const DO_DAI_MAT_KHAU_TOI_THIEU = 6;
// Khớp cột users.phone VARCHAR(20); độ dài tính trên chuỗi đã trim, gồm cả dấu cách.
const DO_DAI_SO_DIEN_THOAI_TOI_DA = 20;

function laChuoiCoNoiDung(giaTri) {
  return typeof giaTri === 'string' && giaTri.trim() !== '';
}

// Quy tắc họ tên và số điện thoại dùng chung cho đăng ký và sửa thông tin tài khoản; trả thông điệp lỗi hoặc null.
function loiHoTen(giaTri) {
  if (!laChuoiCoNoiDung(giaTri)) return 'Họ tên không được để trống';
  if (giaTri.trim().length > 100) return 'Họ tên tối đa 100 ký tự';
  return null;
}

function loiSoDienThoai(giaTri) {
  if (!laChuoiCoNoiDung(giaTri)) return 'Số điện thoại không được để trống';
  if (!MAU_SO_DIEN_THOAI.test(giaTri.replace(/[\s.-]/g, ''))) return 'Số điện thoại không hợp lệ';
  if (giaTri.trim().length > DO_DAI_SO_DIEN_THOAI_TOI_DA) return `Số điện thoại tối đa ${DO_DAI_SO_DIEN_THOAI_TOI_DA} ký tự`;
  return null;
}

function kiemTraDangKy(duLieu) {
  const danhSachLoi = [];
  const loiTen = loiHoTen(duLieu.fullName);
  if (loiTen) danhSachLoi.push({ field: 'fullName', message: loiTen });

  if (!laChuoiCoNoiDung(duLieu.email)) danhSachLoi.push({ field: 'email', message: 'Email không được để trống' });
  else if (!MAU_EMAIL.test(duLieu.email.trim()) || duLieu.email.trim().length > 100) {
    danhSachLoi.push({ field: 'email', message: 'Email không đúng định dạng' });
  }

  if (!laChuoiCoNoiDung(duLieu.password)) danhSachLoi.push({ field: 'password', message: 'Mật khẩu không được để trống' });
  else if (duLieu.password.length < DO_DAI_MAT_KHAU_TOI_THIEU) {
    danhSachLoi.push({ field: 'password', message: `Mật khẩu phải có ít nhất ${DO_DAI_MAT_KHAU_TOI_THIEU} ký tự` });
  }

  const loiDienThoai = loiSoDienThoai(duLieu.phone);
  if (loiDienThoai) danhSachLoi.push({ field: 'phone', message: loiDienThoai });

  // BR01: chỉ được tự đăng ký Khách hàng hoặc Kỹ thuật viên.
  if (![VAI_TRO.KHACH_HANG, VAI_TRO.KY_THUAT_VIEN].includes(duLieu.role)) {
    danhSachLoi.push({ field: 'role', message: 'Vai trò phải là Khách hàng hoặc Kỹ thuật viên' });
  }
  return danhSachLoi;
}

function kiemTraDangNhap(duLieu) {
  const danhSachLoi = [];
  if (!laChuoiCoNoiDung(duLieu.email)) danhSachLoi.push({ field: 'email', message: 'Email không được để trống' });
  if (!laChuoiCoNoiDung(duLieu.password)) danhSachLoi.push({ field: 'password', message: 'Mật khẩu không được để trống' });
  return danhSachLoi;
}

module.exports = { kiemTraDangKy, kiemTraDangNhap, laChuoiCoNoiDung, loiHoTen, loiSoDienThoai, DO_DAI_MAT_KHAU_TOI_THIEU };
