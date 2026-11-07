const TEN_LOI_THEO_MA_HTTP = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
};

// Lỗi nghiệp vụ có mã HTTP và mã lỗi theo docs/api-contract.md mục 2.2.
class LoiUngDung extends Error {
  constructor(maHttp, maLoi, thongDiep, chiTiet) {
    super(thongDiep);
    this.maHttp = maHttp;
    this.maLoi = maLoi;
    this.chiTiet = chiTiet;
  }
}

function xuLyKhongTimThayDuongDan(req, res, next) {
  next(new LoiUngDung(404, 'NOT_FOUND', 'Không tìm thấy đường dẫn'));
}

// eslint-disable-next-line no-unused-vars
function xuLyLoi(loi, req, res, next) {
  let loiTraVe = loi;
  if (loi.type === 'entity.parse.failed') {
    loiTraVe = new LoiUngDung(400, 'VALIDATION_ERROR', 'Dữ liệu gửi lên không phải JSON hợp lệ');
  } else if (!(loi instanceof LoiUngDung)) {
    if (process.env.NODE_ENV !== 'test') console.error(loi);
    loiTraVe = new LoiUngDung(500, 'INTERNAL_ERROR', 'Lỗi hệ thống, vui lòng thử lại sau');
  }

  const noiDung = {
    success: false,
    status: loiTraVe.maHttp,
    error: TEN_LOI_THEO_MA_HTTP[loiTraVe.maHttp] || 'Error',
    message: loiTraVe.message,
    code: loiTraVe.maLoi,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };
  if (loiTraVe.chiTiet?.length) noiDung.details = loiTraVe.chiTiet;
  res.status(loiTraVe.maHttp).json(noiDung);
}

module.exports = { LoiUngDung, xuLyKhongTimThayDuongDan, xuLyLoi };
