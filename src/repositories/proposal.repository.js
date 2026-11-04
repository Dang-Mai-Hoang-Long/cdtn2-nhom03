const { truyVan } = require('../db');

function chuyenDeXuat(dong) {
  if (!dong) return null;
  return {
    id: dong.id,
    requestId: dong.request_id,
    technicianId: dong.technician_id,
    price: dong.price,
    description: dong.description,
    estimatedDuration: dong.estimated_duration,
    status: dong.status,
    createdAt: dong.created_at,
  };
}

async function tao({ requestId, technicianId, price, description, estimatedDuration }, { client } = {}) {
  const thucThi = client ?? { query: truyVan };
  const { rows } = await thucThi.query(
    `INSERT INTO proposal (request_id, technician_id, price, description, estimated_duration)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [requestId, technicianId, price, description, estimatedDuration],
  );
  return chuyenDeXuat(rows[0]);
}

async function timTheoId(id, { client, khoaDong = false } = {}) {
  const thucThi = client ?? { query: truyVan };
  const { rows } = await thucThi.query(`SELECT * FROM proposal WHERE id = $1${khoaDong ? ' FOR UPDATE' : ''}`, [id]);
  return chuyenDeXuat(rows[0]);
}

async function coDeXuatDangHieuLuc(requestId, technicianId, { client } = {}) {
  const thucThi = client ?? { query: truyVan };
  const { rows } = await thucThi.query(
    `SELECT 1 FROM proposal WHERE request_id = $1 AND technician_id = $2 AND status IN ('PENDING', 'ACCEPTED')`,
    [requestId, technicianId],
  );
  return rows.length > 0;
}

// Danh sách đề xuất của một tin kèm thông tin cơ bản của kỹ thuật viên (US14).
async function timTheoYeuCau(requestId) {
  const { rows } = await truyVan(
    `SELECT p.*, u.full_name AS technician_full_name, u.rating_avg AS technician_rating_avg
     FROM proposal p JOIN users u ON u.id = p.technician_id
     WHERE p.request_id = $1
     ORDER BY p.created_at ASC, p.id ASC`,
    [requestId],
  );
  return rows.map((dong) => ({
    ...chuyenDeXuat(dong),
    technician: { id: dong.technician_id, fullName: dong.technician_full_name, ratingAvg: dong.technician_rating_avg },
  }));
}

async function capNhatTrangThai(id, status, { client } = {}) {
  const thucThi = client ?? { query: truyVan };
  const { rows } = await thucThi.query('UPDATE proposal SET status = $2 WHERE id = $1 RETURNING *', [id, status]);
  return chuyenDeXuat(rows[0]);
}

// BR10: các đề xuất còn chờ khác của cùng tin bị từ chối khi một đề xuất được chấp nhận.
async function tuChoiCacDeXuatConLai(requestId, idDuocChon, { client } = {}) {
  const thucThi = client ?? { query: truyVan };
  await thucThi.query(
    `UPDATE proposal SET status = 'REJECTED' WHERE request_id = $1 AND id <> $2 AND status = 'PENDING'`,
    [requestId, idDuocChon],
  );
}

module.exports = { chuyenDeXuat, tao, timTheoId, coDeXuatDangHieuLuc, timTheoYeuCau, capNhatTrangThai, tuChoiCacDeXuatConLai };
