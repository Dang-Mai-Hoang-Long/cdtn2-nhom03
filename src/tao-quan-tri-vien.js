// Tạo tài khoản quản trị viên (không đăng ký được qua giao diện - BR01).
// Cách dùng: npm run create-admin -- <email> <mật khẩu> "<họ tên>" <số điện thoại>
const bcrypt = require('bcryptjs');
const { truyVan, dongKetNoi } = require('./db');

async function taoQuanTriVien([email, matKhau, hoTen, soDienThoai]) {
  if (!email || !matKhau || !hoTen || !soDienThoai) {
    throw new Error('Cách dùng: npm run create-admin -- <email> <mật khẩu> "<họ tên>" <số điện thoại>');
  }
  if (matKhau.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  const { rows } = await truyVan(
    `INSERT INTO users (email, password_hash, full_name, phone, role)
     VALUES ($1, $2, $3, $4, 'ADMIN') RETURNING id, email`,
    [email.trim().toLowerCase(), await bcrypt.hash(matKhau, 10), hoTen.trim(), soDienThoai.trim()],
  );
  return rows[0];
}

taoQuanTriVien(process.argv.slice(2))
  .then(({ id, email }) => console.log(`Đã tạo quản trị viên #${id} (${email})`))
  .catch((loi) => {
    console.error(loi.code === '23505' ? 'Email đã tồn tại' : loi.message);
    process.exitCode = 1;
  })
  .finally(dongKetNoi);
