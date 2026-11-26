require('dotenv').config({ quiet: true });

// Khóa HS256 ngắn dễ bị dò ra bằng cách thử hàng loạt; 32 ký tự là mức tối thiểu của RFC 7518 (256 bit).
const DO_DAI_TOI_THIEU_JWT_SECRET = 32;

const laMoiTruongKiemThu = process.env.NODE_ENV === 'test';

const cauHinh = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: laMoiTruongKiemThu ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  laMoiTruongKiemThu,
};

if (!cauHinh.databaseUrl) {
  throw new Error(`Thiếu biến môi trường ${laMoiTruongKiemThu ? 'TEST_DATABASE_URL' : 'DATABASE_URL'}`);
}
if (!cauHinh.jwtSecret) {
  throw new Error('Thiếu biến môi trường JWT_SECRET');
}
if (cauHinh.jwtSecret.length < DO_DAI_TOI_THIEU_JWT_SECRET) {
  throw new Error(`JWT_SECRET quá ngắn (cần ít nhất ${DO_DAI_TOI_THIEU_JWT_SECRET} ký tự), tạo khóa mới: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`);
}

module.exports = cauHinh;
