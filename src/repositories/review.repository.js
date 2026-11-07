const { truyVan } = require('../db');

function chuyenDanhGia(dong) {
  if (!dong) return null;
  return {
    id: dong.id,
    requestId: dong.request_id,
    fromUserId: dong.from_user_id,
    toUserId: dong.to_user_id,
    rating: dong.rating,
    comment: dong.comment,
    createdAt: dong.created_at,
  };
}

async function tao({ requestId, fromUserId, toUserId, rating, comment }, { client } = {}) {
  const thucThi = client ?? { query: truyVan };
  const { rows } = await thucThi.query(
    `INSERT INTO review (request_id, from_user_id, to_user_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [requestId, fromUserId, toUserId, rating, comment],
  );
  return chuyenDanhGia(rows[0]);
}

async function daDanhGia(requestId, fromUserId, { client } = {}) {
  const thucThi = client ?? { query: truyVan };
  const { rows } = await thucThi.query('SELECT 1 FROM review WHERE request_id = $1 AND from_user_id = $2', [requestId, fromUserId]);
  return rows.length > 0;
}

// Điểm trung bình làm tròn 1 chữ số thập phân theo kiểu DECIMAL(3,1) của ERD.
async function capNhatDiemTrungBinh(userId, { client } = {}) {
  const thucThi = client ?? { query: truyVan };
  await thucThi.query(
    `UPDATE users SET rating_avg = (SELECT ROUND(AVG(rating)::numeric, 1) FROM review WHERE to_user_id = $1) WHERE id = $1`,
    [userId],
  );
}

async function timTheoNguoiDuocDanhGia(toUserId, { viTriBatDau, kichThuoc }) {
  const { rows: dongDem } = await truyVan('SELECT count(*)::int AS tong FROM review WHERE to_user_id = $1', [toUserId]);
  const { rows } = await truyVan(
    `SELECT rv.*, u.full_name AS from_full_name, u.role AS from_role, r.title AS request_title
     FROM review rv
     JOIN users u ON u.id = rv.from_user_id
     JOIN repair_request r ON r.id = rv.request_id
     WHERE rv.to_user_id = $1
     ORDER BY rv.created_at DESC, rv.id DESC
     LIMIT $2 OFFSET $3`,
    [toUserId, kichThuoc, viTriBatDau],
  );
  return {
    danhSach: rows.map((dong) => ({
      ...chuyenDanhGia(dong),
      fromUser: { id: dong.from_user_id, fullName: dong.from_full_name, role: dong.from_role },
      requestTitle: dong.request_title,
    })),
    tongSo: dongDem[0].tong,
  };
}

module.exports = { chuyenDanhGia, tao, daDanhGia, capNhatDiemTrungBinh, timTheoNguoiDuocDanhGia };
