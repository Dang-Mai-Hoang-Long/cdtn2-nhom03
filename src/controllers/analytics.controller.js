const dichVuThongKe = require('../services/analytics.service');
const dichVuBaoCao = require('../services/report.service');
const dichVuCanhBao = require('../services/alert.service');
const dichVuHeThong = require('../services/system-health.service');
const { docKhoangThoiGian } = require('../utils/khoang-thoi-gian');
const { traVeThanhCong } = require('../utils/response');

// Mọi số liệu thống kê đọc theo cùng tham số khoảng thời gian: range, from, to.
const theoKhoang = (hamDichVu) => async (req, res, next) => {
  try {
    const duLieu = await hamDichVu(docKhoangThoiGian(req.query));
    return traVeThanhCong(res, { duLieu });
  } catch (loi) {
    return next(loi);
  }
};

const khongThamSo = (hamDichVu) => async (req, res, next) => {
  try {
    return traVeThanhCong(res, { duLieu: await hamDichVu() });
  } catch (loi) {
    return next(loi);
  }
};

async function layBaoCao(req, res, next) {
  try {
    const { duLieu, phanTrang } = await dichVuBaoCao.layBaoCao(req.params.type, req.query);
    return traVeThanhCong(res, { duLieu, phanTrang });
  } catch (loi) {
    return next(loi);
  }
}

async function xuatBaoCao(req, res, next) {
  try {
    const file = await dichVuBaoCao.xuatBaoCao(req.params.type, req.query);
    res.set({
      'Content-Type': file.kieu,
      'Content-Disposition': `attachment; filename="${file.tenFile}"`,
      'X-So-Dong': String(file.soDong),
      'X-Bi-Cat': file.biCat ? '1' : '0',
      'Access-Control-Expose-Headers': 'Content-Disposition, X-So-Dong, X-Bi-Cat',
      'Cache-Control': 'no-store',
    });
    return res.send(file.noiDung);
  } catch (loi) {
    return next(loi);
  }
}

async function datTrangThaiCanhBao(req, res, next) {
  try {
    const duLieu = await dichVuCanhBao.datTrangThai(req.params.key, req.body?.status, req.nguoiDung);
    return traVeThanhCong(res, { duLieu, thongDiep: 'Đã cập nhật trạng thái cảnh báo' });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  tongQuan: theoKhoang(dichVuThongKe.tongQuan),
  tangTruong: theoKhoang(dichVuThongKe.tangTruong),
  nguoiDung: theoKhoang(dichVuThongKe.nguoiDung),
  hoatDong: theoKhoang(dichVuThongKe.hoatDong),
  heThong: khongThamSo(dichVuHeThong.tinhTrangHienTai),
  canhBao: khongThamSo(dichVuCanhBao.layCanhBao),
  datTrangThaiCanhBao,
  layBaoCao,
  xuatBaoCao,
};
