const { VAI_TRO } = require('../utils/constants');

const MAU_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAU_SO_DIEN_THOAI = /^\+?[0-9]{9,15}$/;
const DO_DAI_MAT_KHAU_TOI_THIEU = 6;

function laChuoiCoNoiDung(giaTri) {
  return typeof giaTri === 'string' && giaTri.trim() !== '';
}

function kiemTraDangKy(duLieu) {
  const danhSachLoi = [];
  if (!laChuoiCoNoiDung(duLieu.fullName)) danhSachLoi.push({ field: 'fullName', message: 'Họ tên không được để trống' });
  else if (duLieu.fullName.trim().length > 100) danhSachLoi.push({ field: 'fullName', message: 'Họ tên tối đa 100 ký tự' });

  if (!laChuoiCoNoiDung(duLieu.email)) danhSachLoi.push({ field: 'email', message: 'Email không được để trống' });
  else if (!MAU_EMAIL.test(duLieu.email.trim()) || duLieu.email.trim().length > 100) {
    danhSachLoi.push({ field: 'email', message: 'Email không đúng định dạng' });
  }

  if (!laChuoiCoNoiDung(duLieu.password)) danhSachLoi.push({ field: 'password', message: 'Mật khẩu không được để trống' });
  else if (duLieu.password.length < DO_DAI_MAT_KHAU_TOI_THIEU) {
    danhSachLoi.push({ field: 'password', message: `Mật khẩu phải có ít nhất ${DO_DAI_MAT_KHAU_TOI_THIEU} ký tự` });
  }

  if (!laChuoiCoNoiDung(duLieu.phone)) danhSachLoi.push({ field: 'phone', message: 'Số điện thoại không được để trống' });
  else if (!MAU_SO_DIEN_THOAI.test(duLieu.phone.replace(/[\s.-]/g, ''))) {
    danhSachLoi.push({ field: 'phone', message: 'Số điện thoại không hợp lệ' });
  }

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

module.exports = { kiemTraDangKy, kiemTraDangNhap, laChuoiCoNoiDung };
