require('dotenv').config({ quiet: true });

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

module.exports = cauHinh;
