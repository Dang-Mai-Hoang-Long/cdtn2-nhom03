const { LoiUngDung } = require('../utils/error-handler');

// hamKiemTra(body) trả về mảng { field, message }; mảng rỗng nghĩa là dữ liệu hợp lệ.
function kiemTraDuLieu(hamKiemTra) {
  return (req, res, next) => {
    const danhSachLoi = hamKiemTra(req.body ?? {});
    if (danhSachLoi.length) {
      return next(new LoiUngDung(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', danhSachLoi));
    }
    return next();
  };
}

module.exports = { kiemTraDuLieu };
