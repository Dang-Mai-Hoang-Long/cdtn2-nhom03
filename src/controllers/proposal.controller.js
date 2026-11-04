const dichVuDeXuat = require('../services/proposal.service');
const { traVeThanhCong } = require('../utils/response');

async function guiDeXuat(req, res, next) {
  try {
    const duLieu = await dichVuDeXuat.guiDeXuat(req.nguoiDung, req.body);
    return traVeThanhCong(res, { maHttp: 201, duLieu, thongDiep: 'Gửi đề xuất thành công' });
  } catch (loi) {
    return next(loi);
  }
}

async function layDanhSachDeXuatCuaYeuCau(req, res, next) {
  try {
    const duLieu = await dichVuDeXuat.layDanhSachDeXuatCuaYeuCau(req.nguoiDung, req.params.requestId);
    return traVeThanhCong(res, { duLieu });
  } catch (loi) {
    return next(loi);
  }
}

async function chapNhanDeXuat(req, res, next) {
  try {
    const duLieu = await dichVuDeXuat.chapNhanDeXuat(req.nguoiDung, req.params.id);
    return traVeThanhCong(res, { duLieu, thongDiep: 'Chấp nhận đề xuất thành công' });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = { guiDeXuat, layDanhSachDeXuatCuaYeuCau, chapNhanDeXuat };
