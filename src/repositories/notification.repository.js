const { truyVan } = require('../db');

function chuyenThongBao(dong) {
  if (!dong) return null;
  return {
    id: dong.id,
    userId: dong.user_id,
    type: dong.type,
    title: dong.title,
    content: dong.content,
    isRead: dong.is_read,
    relatedId: dong.related_id,
    createdAt: dong.created_at,
  };
}

async function tao({ userId, type, title, content, relatedId }, { client } = {}) {
  const thucThi = client ?? { query: truyVan };
  const { rows } = await thucThi.query(
    `INSERT INTO notification (user_id, type, title, content, related_id)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, type, title, content, relatedId],
  );
  return chuyenThongBao(rows[0]);
}

// Mới nhất trước (US20: hiển thị theo thứ tự thời gian).
async function timTheoNguoiDung(userId, { viTriBatDau, kichThuoc }) {
  const { rows: dongDem } = await truyVan('SELECT count(*)::int AS tong FROM notification WHERE user_id = $1', [userId]);
  const { rows } = await truyVan(
    `SELECT * FROM notification WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3`,
    [userId, kichThuoc, viTriBatDau],
  );
  return { danhSach: rows.map(chuyenThongBao), tongSo: dongDem[0].tong };
}

async function demChuaDoc(userId) {
  const { rows } = await truyVan('SELECT count(*)::int AS so FROM notification WHERE user_id = $1 AND is_read = false', [userId]);
  return rows[0].so;
}

async function timTheoId(id) {
  const { rows } = await truyVan('SELECT * FROM notification WHERE id = $1', [id]);
  return chuyenThongBao(rows[0]);
}

async function danhDauDaDoc(id) {
  const { rows } = await truyVan('UPDATE notification SET is_read = true WHERE id = $1 RETURNING *', [id]);
  return chuyenThongBao(rows[0]);
}

module.exports = { chuyenThongBao, tao, timTheoNguoiDung, demChuaDoc, timTheoId, danhDauDaDoc };
