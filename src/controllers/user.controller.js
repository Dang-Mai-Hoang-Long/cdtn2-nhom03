const dichVuNguoiDung = require('../services/user.service');
const { traVeThanhCong } = require('../utils/response');

async function layHoSoNguoiDung(req, res, next) {
  try {
    const duLieu = await dichVuNguoiDung.layHoSo(req.nguoiDung, req.params.id);
    return traVeThanhCong(res, { duLieu });
  } catch (loi) {
    return next(loi);
  }
}

async function capNhatThongTinCaNhan(req, res, next) {
  try {
    const duLieu = await dichVuNguoiDung.capNhatThongTinCaNhan(req.nguoiDung, req.body);
    return traVeThanhCong(res, { duLieu, thongDiep: 'Cập nhật thông tin thành công' });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = { layHoSoNguoiDung, capNhatThongTinCaNhan };
