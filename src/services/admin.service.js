const khoNguoiDung = require('../repositories/user.repository');
const { LoiUngDung } = require('../utils/error-handler');
const { VAI_TRO } = require('../utils/constants');

// US04: tra cứu tài khoản Khách hàng / Kỹ thuật viên theo từ khóa, vai trò, trạng thái.
function layDanhSachTaiKhoan({ tuKhoa, role, trangThai, phanTrang }) {
  const isLocked = trangThai === 'LOCKED' ? true : trangThai === 'ACTIVE' ? false : undefined;
  return khoNguoiDung.timDanhSachChoQuanTri({ tuKhoa, role, isLocked, ...phanTrang });
}

// US05: khóa / mở khóa. Không thao tác trên tài khoản quản trị viên (gồm chính mình).
async function datTrangThaiKhoa(id, isLocked) {
  const ma = Number(id);
  const nguoiDung = Number.isInteger(ma) && ma > 0 ? await khoNguoiDung.timTheoId(ma) : null;
  if (!nguoiDung) throw new LoiUngDung(404, 'USER_NOT_FOUND', 'Không tìm thấy người dùng');
  if (nguoiDung.role === VAI_TRO.QUAN_TRI_VIEN) {
    throw new LoiUngDung(403, 'FORBIDDEN', 'Không thể khóa hoặc mở khóa tài khoản quản trị viên');
  }
  if (nguoiDung.isLocked === isLocked) return nguoiDung;
  return khoNguoiDung.capNhatTrangThaiKhoa(nguoiDung.id, isLocked);
}

module.exports = { layDanhSachTaiKhoan, datTrangThaiKhoa };
