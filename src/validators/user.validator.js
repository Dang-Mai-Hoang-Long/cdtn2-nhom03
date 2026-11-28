const { loiHoTen, loiSoDienThoai, laChuoiCoNoiDung, DO_DAI_MAT_KHAU_TOI_THIEU } = require('./auth.validator');

// Sửa thông tin tài khoản của mình: chỉ họ tên và số điện thoại, gửi trường nào sửa trường đó (cần ít nhất một trường).
// Email dùng để đăng nhập, vai trò và trạng thái khóa không tự đổi được; mọi trường khác trong thân yêu cầu bị bỏ qua.
function kiemTraCapNhatHoSo(duLieu) {
  const danhSachLoi = [];
  const coHoTen = duLieu.fullName !== undefined;
  const coSoDienThoai = duLieu.phone !== undefined;
  if (!coHoTen && !coSoDienThoai) {
    return [{ field: 'body', message: 'Cần gửi ít nhất một trường cần sửa: fullName hoặc phone' }];
  }
  if (coHoTen) {
    const loi = loiHoTen(duLieu.fullName);
    if (loi) danhSachLoi.push({ field: 'fullName', message: loi });
  }
  if (coSoDienThoai) {
    const loi = loiSoDienThoai(duLieu.phone);
    if (loi) danhSachLoi.push({ field: 'phone', message: loi });
  }
  return danhSachLoi;
}

// Đổi mật khẩu của mình: mật khẩu hiện tại, mật khẩu mới và nhập lại mật khẩu mới. Không cắt khoảng trắng (giống đăng ký).
// Mật khẩu hiện tại đúng hay sai do service kiểm tra.
function kiemTraDoiMatKhau({ currentPassword, newPassword, confirmPassword }) {
  const danhSachLoi = [];
  if (!laChuoiCoNoiDung(currentPassword)) danhSachLoi.push({ field: 'currentPassword', message: 'Mật khẩu hiện tại không được để trống' });

  if (!laChuoiCoNoiDung(newPassword)) danhSachLoi.push({ field: 'newPassword', message: 'Mật khẩu mới không được để trống' });
  else if (newPassword.length < DO_DAI_MAT_KHAU_TOI_THIEU) {
    danhSachLoi.push({ field: 'newPassword', message: `Mật khẩu mới phải có ít nhất ${DO_DAI_MAT_KHAU_TOI_THIEU} ký tự` });
  } else if (newPassword === currentPassword) {
    danhSachLoi.push({ field: 'newPassword', message: 'Mật khẩu mới phải khác mật khẩu hiện tại' });
  }

  if (!laChuoiCoNoiDung(confirmPassword)) danhSachLoi.push({ field: 'confirmPassword', message: 'Vui lòng nhập lại mật khẩu mới' });
  else if (confirmPassword !== newPassword) danhSachLoi.push({ field: 'confirmPassword', message: 'Mật khẩu nhập lại không khớp' });
  return danhSachLoi;
}

module.exports = { kiemTraCapNhatHoSo, kiemTraDoiMatKhau };
