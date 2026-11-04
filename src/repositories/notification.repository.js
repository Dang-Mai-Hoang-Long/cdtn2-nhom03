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

module.exports = { chuyenThongBao, tao };
