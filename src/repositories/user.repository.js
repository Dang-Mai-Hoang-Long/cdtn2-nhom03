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

// US04: danh sách tài khoản Khách hàng và Kỹ thuật viên (không gồm quản trị viên), lọc động.
async function timDanhSachChoQuanTri({ tuKhoa, role, isLocked, viTriBatDau, kichThuoc }) {
  const dieuKien = ["role IN ('CUSTOMER', 'TECHNICIAN')"];
  const thamSo = [];
  if (tuKhoa) {
    thamSo.push(`%${tuKhoa}%`);
    dieuKien.push(`(full_name ILIKE $${thamSo.length} OR email ILIKE $${thamSo.length})`);
  }
  if (role) {
    thamSo.push(role);
    dieuKien.push(`role = $${thamSo.length}`);
  }
  if (isLocked !== undefined) {
    thamSo.push(isLocked);
    dieuKien.push(`is_locked = $${thamSo.length}`);
  }
  const menhDeWhere = `WHERE ${dieuKien.join(' AND ')}`;
  const { rows: dongDem } = await truyVan(
    `SELECT count(*)::int AS tong, count(*) FILTER (WHERE is_locked)::int AS so_bi_khoa FROM users ${menhDeWhere}`,
    thamSo,
  );
  const { rows } = await truyVan(
    `SELECT * FROM users ${menhDeWhere} ORDER BY created_at DESC, id DESC LIMIT $${thamSo.length + 1} OFFSET $${thamSo.length + 2}`,
    [...thamSo, kichThuoc, viTriBatDau],
  );
  return { danhSach: rows.map(chuyenNguoiDung), tongSo: dongDem[0].tong, soBiKhoa: dongDem[0].so_bi_khoa };
}

async function capNhatTrangThaiKhoa(id, isLocked) {
  const { rows } = await truyVan('UPDATE users SET is_locked = $2 WHERE id = $1 RETURNING *', [id, isLocked]);
  return chuyenNguoiDung(rows[0]);
}

module.exports = { chuyenNguoiDung, timTheoId, timTheoEmailKemMatKhau, tao, timDanhSachChoQuanTri, capNhatTrangThaiKhoa };
