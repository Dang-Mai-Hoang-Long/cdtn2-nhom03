const dichVuDanhGia = require('../services/review.service');
const { traVeThanhCong, docThamSoPhanTrang, taoThongTinPhanTrang } = require('../utils/response');

async function taoDanhGia(req, res, next) {
  try {
    const duLieu = await dichVuDanhGia.taoDanhGia(req.nguoiDung, req.body);
    return traVeThanhCong(res, { maHttp: 201, duLieu, thongDiep: 'Đánh giá thành công' });
  } catch (loi) {
    return next(loi);
  }
}

// Trả danh sách đánh giá người dùng nhận được; meta có thêm thông tin người được đánh giá.
async function layDanhGiaCuaNguoiDung(req, res, next) {
  try {
    const phanTrang = docThamSoPhanTrang(req.query);
    const { danhSach, tongSo, nguoiDung } = await dichVuDanhGia.layDanhGiaCuaNguoiDung(req.params.userId, phanTrang);
    return traVeThanhCong(res, { duLieu: danhSach, phanTrang: { ...taoThongTinPhanTrang(phanTrang, tongSo), user: nguoiDung } });
  } catch (loi) {
    return next(loi);
  }
}

module.exports = { taoDanhGia, layDanhGiaCuaNguoiDung };
