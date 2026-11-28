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

// Chỉ ghi các trường được truyền (null nghĩa là giữ nguyên giá trị cũ).
async function capNhatThongTin(id, { fullName, phone }) {
  const { rows } = await truyVan(
    'UPDATE users SET full_name = COALESCE($2, full_name), phone = COALESCE($3, phone) WHERE id = $1 RETURNING *',
    [id, fullName, phone],
  );
  return chuyenNguoiDung(rows[0]);
}

async function capNhatMatKhau(id, passwordHash) {
  await truyVan('UPDATE users SET password_hash = $2 WHERE id = $1', [id, passwordHash]);
}

// Số liệu trên hồ sơ: số đánh giá nhận được, số lượng từng mức sao (đủ khóa 1 đến 5, mức không có thì bằng 0)
// và số công việc đã hoàn thành (khách hàng: tin của mình; kỹ thuật viên: tin đã chọn đề xuất của mình).
async function thongKeHoSo(nguoiDung) {
  const { rows: dongSao } = await truyVan('SELECT rating, count(*)::int AS so_luong FROM review WHERE to_user_id = $1 GROUP BY rating', [nguoiDung.id]);
  const phanBoSao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  dongSao.forEach((dong) => { phanBoSao[dong.rating] = dong.so_luong; });
  const soDanhGia = Object.values(phanBoSao).reduce((tong, soLuong) => tong + soLuong, 0);

  let soHoanThanh = 0;
  if (nguoiDung.role === 'TECHNICIAN') {
    const { rows } = await truyVan(
      `SELECT count(*)::int AS tong FROM repair_request r
       JOIN proposal p ON p.id = r.selected_proposal_id
       WHERE r.status = 'COMPLETED' AND p.technician_id = $1`,
      [nguoiDung.id],
    );
    soHoanThanh = rows[0].tong;
  } else if (nguoiDung.role === 'CUSTOMER') {
    const { rows } = await truyVan("SELECT count(*)::int AS tong FROM repair_request WHERE status = 'COMPLETED' AND customer_id = $1", [nguoiDung.id]);
    soHoanThanh = rows[0].tong;
  }
  return { reviewCount: soDanhGia, ratingCounts: phanBoSao, completedCount: soHoanThanh };
}

module.exports = { chuyenNguoiDung, timTheoId, timTheoEmailKemMatKhau, tao, timDanhSachChoQuanTri, capNhatTrangThaiKhoa, capNhatThongTin, capNhatMatKhau, thongKeHoSo };
