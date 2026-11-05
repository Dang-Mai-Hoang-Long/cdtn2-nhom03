const dichVuThongBao = require('../services/notification.service');
const { traVeThanhCong, docThamSoPhanTrang, taoThongTinPhanTrang } = require('../utils/response');

async function layDanhSachThongBao(req, res, next) {
  try {
    const phanTrang = docThamSoPhanTrang(req.query);
    const { danhSach, tongSo } = await dichVuThongBao.layDanhSachThongBao(req.nguoiDung, phanTrang);
    return traVeThanhCong(res, { duLieu: danhSach, phanTrang: taoThongTinPhanTrang(phanTrang, tongSo) });
  } catch (loi) {
    return next(loi);
  }
}

async function demThongBaoChuaDoc(req, res, next) {
  try {
    const soLuong = await dichVuThongBao.demThongBaoChuaDoc(req.nguoiDung);
    return traVeThanhCong(res, { duLieu: { count: soLuong } });
  } catch (loi) {
    return next(loi);
  }
}

async function danhDauDaDoc(req, res, next) {
  try {
    const duLieu = await dichVuThongBao.danhDauDaDoc(req.nguoiDung, req.params.id);
    return traVeThanhCong(res, { duLieu, thongDiep: 'Đã đánh dấu đã đọc' });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = { layDanhSachThongBao, demThongBaoChuaDoc, danhDauDaDoc };
