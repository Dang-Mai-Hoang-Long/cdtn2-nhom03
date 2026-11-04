const dichVuXacThuc = require('../services/auth.service');
const { traVeThanhCong } = require('../utils/response');

async function dangKy(req, res, next) {
  try {
    const duLieu = await dichVuXacThuc.dangKy(req.body);
    return traVeThanhCong(res, { maHttp: 201, duLieu, thongDiep: 'Đăng ký thành công' });
  } catch (loi) {
    return next(loi);
  }
}

async function dangNhap(req, res, next) {
  try {
    const duLieu = await dichVuXacThuc.dangNhap(req.body);
    return traVeThanhCong(res, { duLieu, thongDiep: 'Đăng nhập thành công' });
  } catch (loi) {
    return next(loi);
  }
}

// US03: JWT không lưu phiên ở server; client xóa token sau khi nhận phản hồi này.
function dangXuat(req, res) {
  return traVeThanhCong(res, { thongDiep: 'Đăng xuất thành công' });
}

function layThongTinCaNhan(req, res) {
  return traVeThanhCong(res, { duLieu: req.nguoiDung });
}

module.exports = { dangKy, dangNhap, dangXuat, layThongTinCaNhan };
