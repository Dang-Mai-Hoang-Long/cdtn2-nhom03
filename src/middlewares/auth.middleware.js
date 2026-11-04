const jwt = require('jsonwebtoken');
const cauHinh = require('../config/env');
const khoNguoiDung = require('../repositories/user.repository');
const { LoiUngDung } = require('../utils/error-handler');

function docToken(req) {
  const [kieu, token] = (req.headers.authorization || '').split(' ');
  return kieu === 'Bearer' && token ? token : null;
}

// Xác thực JWT và nạp người dùng hiện tại vào req.nguoiDung.
// Tra lại DB mỗi lần để tài khoản vừa bị khóa bị chặn ngay (BR02).
async function xacThuc(req, res, next) {
  try {
    const token = docToken(req);
    if (!token) throw new LoiUngDung(401, 'UNAUTHORIZED', 'Bạn cần đăng nhập để tiếp tục');

    let noiDungToken;
    try {
      noiDungToken = jwt.verify(token, cauHinh.jwtSecret);
    } catch {
      throw new LoiUngDung(401, 'UNAUTHORIZED', 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }

    const nguoiDung = await khoNguoiDung.timTheoId(noiDungToken.userId);
    if (!nguoiDung) throw new LoiUngDung(401, 'UNAUTHORIZED', 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    if (nguoiDung.isLocked) {
      throw new LoiUngDung(403, 'ACCOUNT_LOCKED', 'Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên');
    }

    req.nguoiDung = nguoiDung;
    return next();
  } catch (loi) {
    return next(loi);
  }
}

module.exports = { xacThuc, docToken };
