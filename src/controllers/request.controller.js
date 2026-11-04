const dichVuYeuCau = require('../services/request.service');
const { traVeThanhCong, docThamSoPhanTrang, taoThongTinPhanTrang } = require('../utils/response');
const { TRANG_THAI_YEU_CAU } = require('../utils/constants');

// sort=createdAt,asc | createdAt,desc (mặc định mới nhất trước).
function docThuTu(query) {
  return String(query.sort || '').toLowerCase().endsWith(',asc') ? 'asc' : 'desc';
}

function docChuoi(giaTri) {
  return typeof giaTri === 'string' && giaTri.trim() !== '' ? giaTri.trim() : undefined;
}

async function taoYeuCau(req, res, next) {
  try {
    const duLieu = await dichVuYeuCau.taoYeuCau(req.nguoiDung, req.body);
    return traVeThanhCong(res, { maHttp: 201, duLieu, thongDiep: 'Tạo tin thành công' });
  } catch (loi) {
    return next(loi);
  }
}

async function layDanhSachYeuCauCuaToi(req, res, next) {
  try {
    const phanTrang = docThamSoPhanTrang(req.query);
    const status = Object.values(TRANG_THAI_YEU_CAU).includes(req.query.status) ? req.query.status : undefined;
    const { danhSach, tongSo } = await dichVuYeuCau.layDanhSachYeuCauCuaToi(req.nguoiDung, { status, thuTu: docThuTu(req.query), phanTrang });
    return traVeThanhCong(res, { duLieu: danhSach, phanTrang: taoThongTinPhanTrang(phanTrang, tongSo) });
  } catch (loi) {
    return next(loi);
  }
}

async function layDanhSachYeuCauDangCho(req, res, next) {
  try {
    const phanTrang = docThamSoPhanTrang(req.query);
    const { danhSach, tongSo } = await dichVuYeuCau.layDanhSachYeuCauDangCho({
      category: docChuoi(req.query.category),
      location: docChuoi(req.query.location),
      thuTu: docThuTu(req.query),
      phanTrang,
    });
    return traVeThanhCong(res, { duLieu: danhSach, phanTrang: taoThongTinPhanTrang(phanTrang, tongSo) });
  } catch (loi) {
    return next(loi);
  }
}

async function layChiTietYeuCau(req, res, next) {
  try {
    const duLieu = await dichVuYeuCau.layChiTietYeuCau(req.nguoiDung, req.params.id);
    return traVeThanhCong(res, { duLieu });
  } catch (loi) {
    return next(loi);
  }
}

async function xacNhanHoanThanh(req, res, next) {
  try {
    const duLieu = await dichVuYeuCau.xacNhanHoanThanh(req.nguoiDung, req.params.id);
    return traVeThanhCong(res, { duLieu, thongDiep: 'Xác nhận hoàn thành thành công' });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = { taoYeuCau, layDanhSachYeuCauCuaToi, layDanhSachYeuCauDangCho, layChiTietYeuCau, xacNhanHoanThanh };
