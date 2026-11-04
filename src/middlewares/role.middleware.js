const { LoiUngDung } = require('../utils/error-handler');

// BR01: chỉ cho phép các vai trò được liệt kê. Dùng sau middleware xacThuc.
function phanQuyen(...cacVaiTroDuocPhep) {
  return (req, res, next) => {
    if (!cacVaiTroDuocPhep.includes(req.nguoiDung?.role)) {
      return next(new LoiUngDung(403, 'FORBIDDEN', 'Bạn không có quyền thực hiện thao tác này'));
    }
    return next();
  };
}

module.exports = { phanQuyen };
