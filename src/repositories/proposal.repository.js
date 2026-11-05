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

// Chi tiết đề xuất kèm thông tin kỹ thuật viên và tóm tắt tin (US15).
async function timChiTietTheoId(id) {
  const { rows } = await truyVan(
    `SELECT p.*, u.full_name AS technician_full_name, u.rating_avg AS technician_rating_avg,
            r.customer_id, r.title AS request_title, r.status AS request_status
     FROM proposal p
     JOIN users u ON u.id = p.technician_id
     JOIN repair_request r ON r.id = p.request_id
     WHERE p.id = $1`,
    [id],
  );
  const dong = rows[0];
  if (!dong) return null;
  return {
    ...chuyenDeXuat(dong),
    technician: { id: dong.technician_id, fullName: dong.technician_full_name, ratingAvg: dong.technician_rating_avg },
    request: { id: dong.request_id, title: dong.request_title, status: dong.request_status, customerId: dong.customer_id },
  };
}

// Đề xuất của một kỹ thuật viên kèm tóm tắt tin (màn hình 12 - Đề xuất của tôi).
async function timTheoKyThuatVien(technicianId, { status, viTriBatDau, kichThuoc }) {
  const thamSo = [technicianId];
  let dieuKienTrangThai = '';
  if (status) {
    thamSo.push(status);
    dieuKienTrangThai = 'AND p.status = $2';
  }
  const { rows: dongDem } = await truyVan(`SELECT count(*)::int AS tong FROM proposal p WHERE p.technician_id = $1 ${dieuKienTrangThai}`, thamSo);
  const { rows } = await truyVan(
    `SELECT p.*, r.title AS request_title, r.status AS request_status, r.category AS request_category, r.location AS request_location
     FROM proposal p JOIN repair_request r ON r.id = p.request_id
     WHERE p.technician_id = $1 ${dieuKienTrangThai}
     ORDER BY p.created_at DESC, p.id DESC
     LIMIT $${thamSo.length + 1} OFFSET $${thamSo.length + 2}`,
    [...thamSo, kichThuoc, viTriBatDau],
  );
  return {
    danhSach: rows.map((dong) => ({
      ...chuyenDeXuat(dong),
      request: { id: dong.request_id, title: dong.request_title, status: dong.request_status, category: dong.request_category, location: dong.request_location },
    })),
    tongSo: dongDem[0].tong,
  };
}

const COT_THEO_TRUONG = { price: 'price', description: 'description', estimatedDuration: 'estimated_duration' };

// Chỉ cập nhật các trường có trong duLieu; tên cột lấy từ danh sách cố định.
async function capNhatThongTin(id, duLieu, { client } = {}) {
  const thucThi = client ?? { query: truyVan };
  const cacTruong = Object.keys(COT_THEO_TRUONG).filter((truong) => duLieu[truong] !== undefined);
  const menhDeSet = cacTruong.map((truong, viTri) => `${COT_THEO_TRUONG[truong]} = $${viTri + 2}`).join(', ');
  const { rows } = await thucThi.query(
    `UPDATE proposal SET ${menhDeSet} WHERE id = $1 RETURNING *`,
    [id, ...cacTruong.map((truong) => duLieu[truong])],
  );
  return chuyenDeXuat(rows[0]);
}

module.exports = {
  chuyenDeXuat,
  tao,
  timTheoId,
  timChiTietTheoId,
  timTheoKyThuatVien,
  coDeXuatDangHieuLuc,
  timTheoYeuCau,
  capNhatTrangThai,
  capNhatThongTin,
  tuChoiCacDeXuatConLai,
};
