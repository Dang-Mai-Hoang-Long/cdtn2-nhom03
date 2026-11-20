const { PHAN_TRANG_MAC_DINH } = require('./constants');

function traVeThanhCong(res, { maHttp = 200, duLieu = null, thongDiep = 'Thành công', phanTrang } = {}) {
  const noiDung = { success: true, data: duLieu, message: thongDiep };
  if (phanTrang) noiDung.meta = phanTrang;
  return res.status(maHttp).json(noiDung);
}

// Đọc page/size từ query string; trang bắt đầu từ 1 theo ví dụ meta trong API contract.
// page được kẹp trong [1, trangToiDa] để OFFSET không tràn kiểu bigint của PostgreSQL (lỗi 22003).
function docThamSoPhanTrang(query) {
  const trang = Math.min(Math.max(Number.parseInt(query.page, 10) || PHAN_TRANG_MAC_DINH.trang, 1), PHAN_TRANG_MAC_DINH.trangToiDa);
  const kichThuoc = Math.min(
    Math.max(Number.parseInt(query.size, 10) || PHAN_TRANG_MAC_DINH.kichThuoc, 1),
    PHAN_TRANG_MAC_DINH.kichThuocToiDa,
  );
  return { trang, kichThuoc, viTriBatDau: (trang - 1) * kichThuoc };
}

function taoThongTinPhanTrang({ trang, kichThuoc }, tongSo) {
  return { page: trang, size: kichThuoc, totalElements: tongSo, totalPages: Math.ceil(tongSo / kichThuoc) };
}

module.exports = { traVeThanhCong, docThamSoPhanTrang, taoThongTinPhanTrang };
