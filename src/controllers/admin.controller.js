const dichVuQuanTri = require('../services/admin.service');
const { traVeThanhCong, docThamSoPhanTrang, taoThongTinPhanTrang } = require('../utils/response');

function docChuoi(giaTri) {
  return typeof giaTri === 'string' && giaTri.trim() !== '' ? giaTri.trim() : undefined;
}

// Query: q (họ tên hoặc email), role (CUSTOMER | TECHNICIAN), status (ACTIVE | LOCKED), page, size.
async function layDanhSachTaiKhoan(req, res, next) {
  try {
    const phanTrang = docThamSoPhanTrang(req.query);
    const role = ['CUSTOMER', 'TECHNICIAN'].includes(req.query.role) ? req.query.role : undefined;
    const trangThai = ['ACTIVE', 'LOCKED'].includes(req.query.status) ? req.query.status : undefined;
    const { danhSach, tongSo, soBiKhoa } = await dichVuQuanTri.layDanhSachTaiKhoan({ tuKhoa: docChuoi(req.query.q), role, trangThai, phanTrang });
    return traVeThanhCong(res, {
      duLieu: danhSach,
      phanTrang: { ...taoThongTinPhanTrang(phanTrang, tongSo), summary: { active: tongSo - soBiKhoa, locked: soBiKhoa } },
    });
  } catch (loi) {
    return next(loi);
  }
}

async function khoaTaiKhoan(req, res, next) {
  try {
    const duLieu = await dichVuQuanTri.datTrangThaiKhoa(req.params.id, true);
    return traVeThanhCong(res, { duLieu, thongDiep: 'Khóa tài khoản thành công' });
  } catch (loi) {
    return next(loi);
  }
}

async function moKhoaTaiKhoan(req, res, next) {
  try {
    const duLieu = await dichVuQuanTri.datTrangThaiKhoa(req.params.id, false);
    return traVeThanhCong(res, { duLieu, thongDiep: 'Mở khóa tài khoản thành công' });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = { layDanhSachTaiKhoan, khoaTaiKhoan, moKhoaTaiKhoan };
