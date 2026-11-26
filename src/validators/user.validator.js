const { loiHoTen, loiSoDienThoai } = require('./auth.validator');

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

module.exports = { kiemTraCapNhatHoSo };
