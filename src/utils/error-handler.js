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
  } else if (loi.type === 'entity.too.large') {
    // express.json() giới hạn thân yêu cầu ở 100 KB; dùng 400 (đã có trong API contract) thay vì thêm mã 413.
    loiTraVe = new LoiUngDung(400, 'VALIDATION_ERROR', 'Dữ liệu gửi lên quá lớn (tối đa 100 KB)');
  } else if (typeof loi.type === 'string' && loi.status >= 400 && loi.status < 500) {
    // Các lỗi đọc thân yêu cầu khác của body-parser (bảng mã, mã hóa nội dung không được hỗ trợ...) cũng do người gọi gây ra.
    loiTraVe = new LoiUngDung(400, 'VALIDATION_ERROR', 'Dữ liệu gửi lên không được hỗ trợ hoặc không hợp lệ');
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
    // Bỏ phần sau dấu ? để không phản chiếu lại chuỗi truy vấn (có thể chứa token hay thông tin cá nhân người gọi tự đặt vào URL).
    path: req.originalUrl.split('?')[0],
  };
  if (loiTraVe.chiTiet?.length) noiDung.details = loiTraVe.chiTiet;
  res.status(loiTraVe.maHttp).json(noiDung);
}

module.exports = { LoiUngDung, xuLyKhongTimThayDuongDan, xuLyLoi };
