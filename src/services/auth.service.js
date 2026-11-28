const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cauHinh = require('../config/env');
const khoNguoiDung = require('../repositories/user.repository');
const { LoiUngDung } = require('../utils/error-handler');

const SO_VONG_BAM_MAT_KHAU = 10;

function chuanHoaEmail(email) {
  return email.trim().toLowerCase();
}

function taoToken(nguoiDung) {
  return jwt.sign({ userId: nguoiDung.id, role: nguoiDung.role }, cauHinh.jwtSecret, { algorithm: 'HS256', expiresIn: cauHinh.jwtExpiresIn });
}

// US01
async function dangKy({ email, password, fullName, phone, role }) {
  const emailChuan = chuanHoaEmail(email);
  if (await khoNguoiDung.timTheoEmailKemMatKhau(emailChuan)) {
    throw new LoiUngDung(409, 'EMAIL_ALREADY_EXISTS', 'Email đã tồn tại');
  }

  const passwordHash = await bcrypt.hash(password, SO_VONG_BAM_MAT_KHAU);
  let nguoiDung;
  try {
    nguoiDung = await khoNguoiDung.tao({ email: emailChuan, passwordHash, fullName: fullName.trim(), phone: phone.trim(), role });
  } catch (loi) {
    // Hai yêu cầu đăng ký cùng email chạy song song: ràng buộc UNIQUE của DB chặn lại.
    if (loi.code === '23505') throw new LoiUngDung(409, 'EMAIL_ALREADY_EXISTS', 'Email đã tồn tại');
    throw loi;
  }

  const { id, fullName: hoTen, phone: soDienThoai, role: vaiTro } = nguoiDung;
  return { id, email: nguoiDung.email, fullName: hoTen, phone: soDienThoai, role: vaiTro, token: taoToken(nguoiDung) };
}

// US02 (BR02: tài khoản bị khóa không đăng nhập được)
async function dangNhap({ email, password }) {
  const nguoiDung = await khoNguoiDung.timTheoEmailKemMatKhau(chuanHoaEmail(email));
  const matKhauDung = nguoiDung && (await bcrypt.compare(password, nguoiDung.passwordHash));
  if (!matKhauDung) throw new LoiUngDung(401, 'UNAUTHORIZED', 'Email hoặc mật khẩu không đúng');
  if (nguoiDung.isLocked) {
    throw new LoiUngDung(403, 'ACCOUNT_LOCKED', 'Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên');
  }

  const { passwordHash, createdAt, ...thongTinNguoiDung } = nguoiDung;
  return { token: taoToken(nguoiDung), user: thongTinNguoiDung };
}

// Người dùng tự đổi mật khẩu của mình, phải nhập đúng mật khẩu hiện tại. Sai thì trả 400 chứ không phải 401, vì giao diện
// coi 401 là hết phiên và đăng xuất. Token đã cấp trước đó vẫn dùng được tới khi hết hạn (JWT không thu hồi).
async function doiMatKhau(nguoiDung, { currentPassword, newPassword }) {
  const { passwordHash } = await khoNguoiDung.timTheoEmailKemMatKhau(nguoiDung.email);
  if (!(await bcrypt.compare(currentPassword, passwordHash))) {
    const thongDiep = 'Mật khẩu hiện tại không đúng';
    throw new LoiUngDung(400, 'VALIDATION_ERROR', thongDiep, [{ field: 'currentPassword', message: thongDiep }]);
  }
  await khoNguoiDung.capNhatMatKhau(nguoiDung.id, await bcrypt.hash(newPassword, SO_VONG_BAM_MAT_KHAU));
}

module.exports = { dangKy, dangNhap, doiMatKhau, taoToken };
