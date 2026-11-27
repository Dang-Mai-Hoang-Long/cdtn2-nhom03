// Dữ liệu cho cảnh báo: sự kiện bất thường trong nhật ký, tin quá hẹn và trạng thái xử lý đã lưu.
const { truyVan } = require('../db');

const NGAY_VN = "to_char(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD')";

// Gom theo người dùng và ngày (giờ Việt Nam) các lần thất bại trong khoảng [tu, den).
async function gomThatBai({ dieuKien, tu, den, toiThieu }) {
  const { rows } = await truyVan(
    `SELECT a.user_id, u.full_name, ${NGAY_VN.replace('created_at', 'a.created_at')} AS ngay, count(*)::int AS so,
            min(a.created_at) AS dau, max(a.created_at) AS cuoi,
            (array_agg(DISTINCT a.route))[1:5] AS cac_duong_dan
     FROM activity_log a LEFT JOIN users u ON u.id = a.user_id
     WHERE a.status = 'FAILURE' AND ${dieuKien} AND a.created_at >= $1 AND a.created_at < $2
     GROUP BY a.user_id, u.full_name, ngay HAVING count(*) >= $3
     ORDER BY max(a.created_at) DESC`,
    [tu, den, toiThieu],
  );
  return rows;
}

const dangNhapSai = (khoang) => gomThatBai({ dieuKien: "a.action = 'LOGIN' AND a.http_status = 401", ...khoang });
const taiKhoanBiKhoaDangNhap = (khoang) => gomThatBai({ dieuKien: "a.action = 'LOGIN' AND a.http_status = 403", ...khoang });
const biTuChoiQuyen = (khoang) => gomThatBai({ dieuKien: "a.action <> 'LOGIN' AND a.http_status = 403", ...khoang });

async function loiMayChuTheoNgay({ tu, den }) {
  const { rows } = await truyVan(
    `SELECT ${NGAY_VN} AS ngay, count(*)::int AS so, min(created_at) AS dau, max(created_at) AS cuoi,
            (array_agg(DISTINCT route))[1:5] AS cac_duong_dan
     FROM activity_log WHERE action = 'SERVER_ERROR' AND created_at >= $1 AND created_at < $2
     GROUP BY ngay ORDER BY ngay DESC`,
    [tu, den],
  );
  return rows;
}

async function tinQuaHen(soLuong = 10) {
  const { rows } = await truyVan(
    `SELECT id, title, preferred_time, count(*) OVER ()::int AS tong, min(preferred_time) OVER () AS cu_nhat
     FROM repair_request WHERE status = 'WAITING_PROPOSAL' AND preferred_time < now()
     ORDER BY preferred_time LIMIT $1`,
    [soLuong],
  );
  return rows;
}

async function trangThaiDaLuu(cacKhoa) {
  if (cacKhoa.length === 0) return new Map();
  const { rows } = await truyVan(
    `SELECT s.alert_key, s.status, s.updated_at, u.full_name FROM alert_state s LEFT JOIN users u ON u.id = s.updated_by WHERE s.alert_key = ANY($1)`,
    [cacKhoa],
  );
  return new Map(rows.map((d) => [d.alert_key, { status: d.status, updatedAt: d.updated_at, updatedBy: d.full_name }]));
}

async function luuTrangThai({ key, status, userId }) {
  await truyVan(
    `INSERT INTO alert_state (alert_key, status, updated_by) VALUES ($1, $2, $3)
     ON CONFLICT (alert_key) DO UPDATE SET status = EXCLUDED.status, updated_by = EXCLUDED.updated_by, updated_at = now()`,
    [key, status, userId],
  );
}

module.exports = { dangNhapSai, taiKhoanBiKhoaDangNhap, biTuChoiQuyen, loiMayChuTheoNgay, tinQuaHen, trangThaiDaLuu, luuTrangThai };
