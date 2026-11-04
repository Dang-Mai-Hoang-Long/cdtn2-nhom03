const { truyVan } = require('../db');

function chuyenYeuCau(dong) {
  if (!dong) return null;
  return {
    id: dong.id,
    customerId: dong.customer_id,
    title: dong.title,
    description: dong.description,
    category: dong.category,
    location: dong.location,
    preferredTime: dong.preferred_time,
    status: dong.status,
    selectedProposalId: dong.selected_proposal_id,
    createdAt: dong.created_at,
  };
}

const THU_TU_SAP_XEP = { asc: 'ASC', desc: 'DESC' };

async function tao({ customerId, title, description, category, location, preferredTime }) {
  const { rows } = await truyVan(
    `INSERT INTO repair_request (customer_id, title, description, category, location, preferred_time)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [customerId, title, description, category, location, preferredTime],
  );
  return chuyenYeuCau(rows[0]);
}

// client: truyền client của transaction khi cần khóa dòng (FOR UPDATE).
async function timTheoId(id, { client, khoaDong = false } = {}) {
  const thucThi = client ?? { query: truyVan };
  const { rows } = await thucThi.query(`SELECT * FROM repair_request WHERE id = $1${khoaDong ? ' FOR UPDATE' : ''}`, [id]);
  return chuyenYeuCau(rows[0]);
}

// Lọc động theo các điều kiện có giá trị; trả về danh sách kèm số đề xuất và tổng số bản ghi.
async function timDanhSach({ customerId, status, category, location, thuTu = 'desc', viTriBatDau, kichThuoc }) {
  const dieuKien = [];
  const thamSo = [];
  const themDieuKien = (bieuThuc, giaTri) => {
    thamSo.push(giaTri);
    dieuKien.push(bieuThuc.replace('?', `$${thamSo.length}`));
  };
  if (customerId) themDieuKien('r.customer_id = ?', customerId);
  if (status) themDieuKien('r.status = ?', status);
  if (category) themDieuKien('r.category = ?', category);
  if (location) themDieuKien('r.location ILIKE ?', `%${location}%`);
  const menhDeWhere = dieuKien.length ? `WHERE ${dieuKien.join(' AND ')}` : '';

  const { rows: dongDem } = await truyVan(`SELECT count(*)::int AS tong FROM repair_request r ${menhDeWhere}`, thamSo);
  const { rows } = await truyVan(
    `SELECT r.*, (SELECT count(*)::int FROM proposal p WHERE p.request_id = r.id) AS proposal_count
     FROM repair_request r ${menhDeWhere}
     ORDER BY r.created_at ${THU_TU_SAP_XEP[thuTu] || 'DESC'}, r.id ${THU_TU_SAP_XEP[thuTu] || 'DESC'}
     LIMIT $${thamSo.length + 1} OFFSET $${thamSo.length + 2}`,
    [...thamSo, kichThuoc, viTriBatDau],
  );
  return {
    danhSach: rows.map((dong) => ({ ...chuyenYeuCau(dong), proposalCount: dong.proposal_count })),
    tongSo: dongDem[0].tong,
  };
}

async function capNhatTrangThai(id, status, { client, selectedProposalId } = {}) {
  const thucThi = client ?? { query: truyVan };
  const { rows } = await thucThi.query(
    `UPDATE repair_request
     SET status = $2, selected_proposal_id = COALESCE($3, selected_proposal_id)
     WHERE id = $1 RETURNING *`,
    [id, status, selectedProposalId ?? null],
  );
  return chuyenYeuCau(rows[0]);
}

module.exports = { chuyenYeuCau, tao, timTheoId, timDanhSach, capNhatTrangThai };
