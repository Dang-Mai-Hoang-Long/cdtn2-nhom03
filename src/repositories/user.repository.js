const { truyVan } = require('../db');

function chuyenNguoiDung(dong) {
  if (!dong) return null;
  return {
    id: dong.id,
    email: dong.email,
    fullName: dong.full_name,
    phone: dong.phone,
    role: dong.role,
    isLocked: dong.is_locked,
    ratingAvg: dong.rating_avg,
    createdAt: dong.created_at,
  };
}

async function timTheoId(id) {
  const { rows } = await truyVan('SELECT * FROM users WHERE id = $1', [id]);
  return chuyenNguoiDung(rows[0]);
}

// Trả thêm passwordHash để tầng service so khớp mật khẩu khi đăng nhập.
async function timTheoEmailKemMatKhau(email) {
  const { rows } = await truyVan('SELECT * FROM users WHERE email = $1', [email]);
  if (!rows[0]) return null;
  return { ...chuyenNguoiDung(rows[0]), passwordHash: rows[0].password_hash };
}

async function tao({ email, passwordHash, fullName, phone, role }) {
  const { rows } = await truyVan(
    `INSERT INTO users (email, password_hash, full_name, phone, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [email, passwordHash, fullName, phone, role],
  );
  return chuyenNguoiDung(rows[0]);
}

module.exports = { chuyenNguoiDung, timTheoId, timTheoEmailKemMatKhau, tao };
