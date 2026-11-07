const dichVuDeXuat = require('../services/proposal.service');
const { traVeThanhCong, docThamSoPhanTrang, taoThongTinPhanTrang } = require('../utils/response');
const { TRANG_THAI_DE_XUAT } = require('../utils/constants');

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

async function layChiTietDeXuat(req, res, next) {
  try {
    const duLieu = await dichVuDeXuat.layChiTietDeXuat(req.nguoiDung, req.params.id);
    return traVeThanhCong(res, { duLieu });
  } catch (loi) {
    return next(loi);
  }
}

async function layDanhSachDeXuatCuaToi(req, res, next) {
  try {
    const phanTrang = docThamSoPhanTrang(req.query);
    const status = Object.values(TRANG_THAI_DE_XUAT).includes(req.query.status) ? req.query.status : undefined;
    const { danhSach, tongSo } = await dichVuDeXuat.layDanhSachDeXuatCuaToi(req.nguoiDung, { status, phanTrang });
    return traVeThanhCong(res, { duLieu: danhSach, phanTrang: taoThongTinPhanTrang(phanTrang, tongSo) });
  } catch (loi) {
    return next(loi);
  }
}

async function suaDeXuat(req, res, next) {
  try {
    const duLieu = await dichVuDeXuat.suaDeXuat(req.nguoiDung, req.params.id, req.body);
    return traVeThanhCong(res, { duLieu, thongDiep: 'Chỉnh sửa đề xuất thành công' });
  } catch (loi) {
    return next(loi);
  }
}

async function rutDeXuat(req, res, next) {
  try {
    const duLieu = await dichVuDeXuat.rutDeXuat(req.nguoiDung, req.params.id);
    return traVeThanhCong(res, { duLieu, thongDiep: 'Rút đề xuất thành công' });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = {
  guiDeXuat,
  layDanhSachDeXuatCuaYeuCau,
  chapNhanDeXuat,
  layChiTietDeXuat,
  layDanhSachDeXuatCuaToi,
  suaDeXuat,
  rutDeXuat,
};
