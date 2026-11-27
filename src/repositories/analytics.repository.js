// Truy vấn tổng hợp cho trang thống kê. Mọi con số tính từ bảng nghiệp vụ và nhật ký, không có dữ liệu giả.
// Thời điểm chấp nhận đề xuất và hoàn thành công việc lấy từ thông báo PROPOSAL_ACCEPTED / REQUEST_COMPLETED.
const { truyVan } = require('../db');

// giao_dich: mỗi đề xuất được chấp nhận là một giao dịch.
// su_kien: mọi việc người dùng đã làm. Việc tạo dữ liệu đọc thẳng từ bảng nghiệp vụ (có đủ lịch sử); đăng nhập, sửa,
// đóng, khóa... chỉ có trong activity_log nên chỉ tính từ khi ghi nhật ký. Không hành động nào được đếm hai lần.
const CTE_GIAO_DICH = `giao_dich AS (
  SELECT p.id AS proposal_id, p.request_id, p.price, p.technician_id, r.customer_id, r.title, r.category, r.location,
         r.status AS request_status,
         (SELECT min(n.created_at) FROM notification n WHERE n.type = 'PROPOSAL_ACCEPTED' AND n.related_id = p.id) AS accepted_at,
         (SELECT min(n.created_at) FROM notification n WHERE n.type = 'REQUEST_COMPLETED' AND n.related_id = r.id) AS completed_at
  FROM proposal p JOIN repair_request r ON r.id = p.request_id
  WHERE p.status = 'ACCEPTED'
)`;

const HANH_DONG_TU_BANG = "('REGISTER', 'CREATE_REQUEST', 'CREATE_PROPOSAL', 'CREATE_REVIEW', 'ACCEPT_PROPOSAL', 'COMPLETE_REQUEST')";

const CTE_SU_KIEN = `${CTE_GIAO_DICH},
su_kien AS (
  SELECT u.created_at, u.id AS user_id, 'REGISTER'::text AS action, 'user'::text AS target_type, u.id AS target_id FROM users u
  UNION ALL SELECT r.created_at, r.customer_id, 'CREATE_REQUEST', 'request', r.id FROM repair_request r
  UNION ALL SELECT p.created_at, p.technician_id, 'CREATE_PROPOSAL', 'proposal', p.id FROM proposal p
  UNION ALL SELECT v.created_at, v.from_user_id, 'CREATE_REVIEW', 'review', v.id FROM review v
  UNION ALL SELECT g.accepted_at, g.customer_id, 'ACCEPT_PROPOSAL', 'proposal', g.proposal_id FROM giao_dich g WHERE g.accepted_at IS NOT NULL
  UNION ALL SELECT g.completed_at, g.customer_id, 'COMPLETE_REQUEST', 'request', g.request_id FROM giao_dich g WHERE g.completed_at IS NOT NULL
  UNION ALL SELECT l.created_at, l.user_id, l.action::text, l.target_type::text, l.target_id FROM activity_log l
    WHERE l.status = 'SUCCESS' AND l.user_id IS NOT NULL AND l.action NOT IN ${HANH_DONG_TU_BANG}
)`;

// Một hoạt động không tính việc tạo tài khoản (tài khoản mẫu và tài khoản do quản trị viên tạo không phải hoạt động).
const LA_HOAT_DONG = "action <> 'REGISTER'";
// Số "người dùng hoạt động" (DAU, WAU, MAU, giữ chân, rời bỏ, thiết bị) chỉ tính khách hàng và kỹ thuật viên:
// quản trị viên là người vận hành, đăng nhập để xem thống kê không được làm tăng số người dùng.
const KHONG_PHAI_QUAN_TRI = "user_id NOT IN (SELECT id FROM users WHERE role = 'ADMIN')";
const LA_NGUOI_DUNG_HOAT_DONG = `${LA_HOAT_DONG} AND ${KHONG_PHAI_QUAN_TRI}`;

const iso = (ms) => new Date(ms).toISOString();
const dayIso = (moc) => moc.map(iso);

function dienO(dong, soO, cot = 'gia_tri') {
  const ketQua = new Array(soO).fill(0);
  for (const d of dong) ketQua[d.o - 1] = Number(d[cot]);
  return ketQua;
}

// Gộp một biểu thức (count, sum...) theo từng ô của khoảng. nguon, cotThoiGian, bieuThuc chỉ lấy từ hằng số trong mã.
async function gopTheoO({ moc, nguon, cotThoiGian = 'created_at', bieuThuc = 'count(*)', dieuKien = 'TRUE', cte }) {
  const soO = moc.length - 1;
  const { rows } = await truyVan(
    `${cte ? `WITH ${cte}` : ''}
     SELECT width_bucket(${cotThoiGian}, $1::timestamptz[]) AS o, ${bieuThuc} AS gia_tri
     FROM ${nguon}
     WHERE ${cotThoiGian} >= $2 AND ${cotThoiGian} < $3 AND ${dieuKien}
     GROUP BY 1`,
    [dayIso(moc), iso(moc[0]), iso(moc[soO])],
  );
  return dienO(rows.filter((d) => d.o >= 1 && d.o <= soO), soO);
}

// Hai dãy: kỳ này và kỳ trước.
async function gopHaiKy(khoang, tuyChon) {
  const [kyNay, kyTruoc] = await Promise.all([
    gopTheoO({ ...tuyChon, moc: khoang.boundaries }),
    gopTheoO({ ...tuyChon, moc: khoang.previousBoundaries }),
  ]);
  return { current: kyNay, previous: kyTruoc };
}

// Một giá trị gộp cho cả kỳ này và kỳ trước (ví dụ số người dùng hoạt động khác nhau: không cộng được từ các ô).
async function gopCaKy(khoang, { nguon, cotThoiGian = 'created_at', bieuThuc = 'count(*)', dieuKien = 'TRUE', cte }) {
  const { rows } = await truyVan(
    `${cte ? `WITH ${cte}` : ''}
     SELECT (SELECT ${bieuThuc} FROM ${nguon} WHERE ${cotThoiGian} >= $1 AND ${cotThoiGian} < $2 AND ${dieuKien}) AS current,
            (SELECT ${bieuThuc} FROM ${nguon} WHERE ${cotThoiGian} >= $3 AND ${cotThoiGian} < $4 AND ${dieuKien}) AS previous`,
    [iso(khoang.start), iso(khoang.end), iso(khoang.previousStart), iso(khoang.previousEnd)],
  );
  return { current: Number(rows[0].current ?? 0), previous: Number(rows[0].previous ?? 0) };
}

const nguoiDungMoi = (khoang) => gopHaiKy(khoang, { nguon: 'users' });
const tongNguoiDungMoi = (khoang) => gopCaKy(khoang, { nguon: 'users' });

const hoatDongTheoO = (khoang) => gopHaiKy(khoang, { cte: CTE_SU_KIEN, nguon: 'su_kien', bieuThuc: 'count(DISTINCT user_id)', dieuKien: LA_NGUOI_DUNG_HOAT_DONG });
const tongHoatDong = (khoang) => gopCaKy(khoang, { cte: CTE_SU_KIEN, nguon: 'su_kien', bieuThuc: 'count(DISTINCT user_id)', dieuKien: LA_NGUOI_DUNG_HOAT_DONG });

const giaoDichChot = (khoang) => gopHaiKy(khoang, { cte: CTE_GIAO_DICH, nguon: 'giao_dich', cotThoiGian: 'accepted_at' });
const tongGiaoDichChot = (khoang) => gopCaKy(khoang, { cte: CTE_GIAO_DICH, nguon: 'giao_dich', cotThoiGian: 'accepted_at' });
const viecHoanThanh = (khoang) => gopHaiKy(khoang, { cte: CTE_GIAO_DICH, nguon: 'giao_dich', cotThoiGian: 'completed_at' });
const tongViecHoanThanh = (khoang) => gopCaKy(khoang, { cte: CTE_GIAO_DICH, nguon: 'giao_dich', cotThoiGian: 'completed_at' });
const giaTriHoanThanh = (khoang) => gopHaiKy(khoang, { cte: CTE_GIAO_DICH, nguon: 'giao_dich', cotThoiGian: 'completed_at', bieuThuc: 'coalesce(sum(price), 0)' });
const tongGiaTriHoanThanh = (khoang) => gopCaKy(khoang, { cte: CTE_GIAO_DICH, nguon: 'giao_dich', cotThoiGian: 'completed_at', bieuThuc: 'coalesce(sum(price), 0)' });

const tinMoi = (khoang) => gopHaiKy(khoang, { nguon: 'repair_request' });
const deXuatMoi = (khoang) => gopHaiKy(khoang, { nguon: 'proposal' });
const danhGiaMoi = (khoang) => gopHaiKy(khoang, { nguon: 'review' });

const loiMayChu = (khoang) => gopHaiKy(khoang, { nguon: 'activity_log', dieuKien: "action = 'SERVER_ERROR'" });

// Số cộng dồn tính tới một thời điểm.
async function soCongDon(luc) {
  const { rows } = await truyVan(
    `SELECT (SELECT count(*) FROM users WHERE created_at < $1)::int AS users,
            (SELECT count(*) FROM repair_request WHERE created_at < $1)::int AS requests,
            (SELECT count(*) FROM proposal WHERE created_at < $1)::int AS proposals,
            (SELECT count(*) FROM review WHERE created_at < $1)::int AS reviews`,
    [iso(luc)],
  );
  return rows[0];
}

// Việc đang chờ xử lý ngay lúc này (không lọc theo kỳ).
async function viecDangCho() {
  const { rows } = await truyVan(
    `SELECT (SELECT count(*) FROM repair_request WHERE status = 'WAITING_PROPOSAL')::int AS requests_waiting,
            (SELECT count(*) FROM repair_request WHERE status = 'WAITING_PROPOSAL' AND preferred_time < now())::int AS requests_overdue,
            (SELECT count(*) FROM proposal p JOIN repair_request r ON r.id = p.request_id
               WHERE p.status = 'PENDING' AND r.status = 'WAITING_PROPOSAL')::int AS proposals_pending,
            (SELECT count(*) FROM repair_request WHERE status = 'SELECTED')::int AS jobs_in_progress`,
  );
  const d = rows[0];
  return { requestsWaiting: d.requests_waiting, requestsOverdue: d.requests_overdue, proposalsPending: d.proposals_pending, jobsInProgress: d.jobs_in_progress };
}

async function trangThaiTin() {
  const { rows } = await truyVan('SELECT status AS key, count(*)::int AS count FROM repair_request GROUP BY status ORDER BY count(*) DESC');
  return rows;
}

async function thoiDiemBatDauNhatKy() {
  const { rows } = await truyVan("SELECT applied_at FROM schema_migrations WHERE name = '003_nhat_ky_hoat_dong.sql'");
  return rows[0]?.applied_at ?? null;
}

// ---------- Người dùng ----------
async function soNguoiHoatDongTrong(tu, den) {
  const { rows } = await truyVan(
    `WITH ${CTE_SU_KIEN} SELECT count(DISTINCT user_id)::int AS so FROM su_kien WHERE created_at >= $1 AND created_at < $2 AND ${LA_NGUOI_DUNG_HOAT_DONG}`,
    [iso(tu), iso(den)],
  );
  return rows[0].so;
}

// Giữ chân: trong số người hoạt động kỳ trước, bao nhiêu người còn hoạt động kỳ này. Kèm người dùng mới / quay lại.
async function giuChan(khoang) {
  const { rows } = await truyVan(
    `WITH ${CTE_SU_KIEN},
     nay AS (SELECT DISTINCT user_id FROM su_kien WHERE created_at >= $1 AND created_at < $2 AND ${LA_NGUOI_DUNG_HOAT_DONG}),
     truoc AS (SELECT DISTINCT user_id FROM su_kien WHERE created_at >= $3 AND created_at < $4 AND ${LA_NGUOI_DUNG_HOAT_DONG})
     SELECT (SELECT count(*) FROM truoc)::int AS co_so,
            (SELECT count(*) FROM truoc t JOIN nay n USING (user_id))::int AS giu_lai,
            (SELECT count(*) FROM nay n JOIN users u ON u.id = n.user_id WHERE u.created_at >= $1)::int AS moi,
            (SELECT count(*) FROM nay n JOIN users u ON u.id = n.user_id WHERE u.created_at < $1)::int AS quay_lai`,
    [iso(khoang.start), iso(khoang.end), iso(khoang.previousStart), iso(khoang.previousEnd)],
  );
  const d = rows[0];
  return { base: d.co_so, retained: d.giu_lai, newActive: d.moi, returning: d.quay_lai };
}

// Mỗi ô: người hoạt động mới đăng ký trong kỳ và người hoạt động đã có tài khoản từ trước kỳ.
async function moiVaQuayLaiTheoO(khoang) {
  const moc = khoang.boundaries;
  const soO = moc.length - 1;
  const { rows } = await truyVan(
    `WITH ${CTE_SU_KIEN}
     SELECT width_bucket(s.created_at, $1::timestamptz[]) AS o,
            count(DISTINCT s.user_id) FILTER (WHERE u.created_at >= $2)::int AS moi,
            count(DISTINCT s.user_id) FILTER (WHERE u.created_at < $2)::int AS cu
     FROM su_kien s JOIN users u ON u.id = s.user_id
     WHERE s.created_at >= $2 AND s.created_at < $3 AND s.${LA_HOAT_DONG} AND u.role <> 'ADMIN'
     GROUP BY 1`,
    [dayIso(moc), iso(moc[0]), iso(moc[soO])],
  );
  const hopLe = rows.filter((d) => d.o >= 1 && d.o <= soO);
  return { new: dienO(hopLe, soO, 'moi'), returning: dienO(hopLe, soO, 'cu') };
}

async function theoVaiTroVaTrangThai(den) {
  const { rows } = await truyVan('SELECT role, is_locked, count(*)::int AS so FROM users WHERE created_at < $1 GROUP BY role, is_locked', [iso(den)]);
  return rows.map((d) => ({ role: d.role, isLocked: d.is_locked, count: d.so }));
}

// Khu vực của khách hàng theo địa điểm của tin đăng gần nhất (dự án không lưu quốc gia hay địa chỉ người dùng).
async function khachTheoKhuVuc(den) {
  const { rows } = await truyVan(
    `SELECT khu_vuc AS name, count(*)::int AS count FROM (
       SELECT DISTINCT ON (customer_id) customer_id, btrim(location) AS khu_vuc
       FROM repair_request WHERE created_at < $1 ORDER BY customer_id, created_at DESC, id DESC
     ) t GROUP BY khu_vuc ORDER BY count(*) DESC, khu_vuc`,
    [iso(den)],
  );
  return rows;
}

// Thiết bị / hệ điều hành: số người dùng khác nhau có hoạt động được ghi nhật ký trong kỳ.
async function theoThietBi(khoang, cot) {
  if (!['device', 'os'].includes(cot)) throw new Error('Cột không hợp lệ');
  const { rows } = await truyVan(
    `SELECT coalesce(${cot}, 'Không rõ') AS name, count(DISTINCT user_id)::int AS count FROM activity_log
     WHERE user_id IS NOT NULL AND status = 'SUCCESS' AND created_at >= $1 AND created_at < $2 AND ${KHONG_PHAI_QUAN_TRI}
     GROUP BY 1 ORDER BY count DESC, name`,
    [iso(khoang.start), iso(khoang.end)],
  );
  return rows;
}

// ---------- Hoạt động ----------
async function dangNhapTheoO(khoang) {
  const gop = (action, status) => gopTheoO({ moc: khoang.boundaries, nguon: 'activity_log', dieuKien: `action = '${action}' AND status = '${status}'` });
  const [thanhCong, thatBai, dangXuat] = await Promise.all([gop('LOGIN', 'SUCCESS'), gop('LOGIN', 'FAILURE'), gop('LOGOUT', 'SUCCESS')]);
  return { success: thanhCong, failure: thatBai, logout: dangXuat };
}

async function hoatDongTheoVaiTro(khoang) {
  const gop = (vaiTro) => gopTheoO({
    moc: khoang.boundaries,
    cte: CTE_SU_KIEN,
    nguon: 'su_kien s JOIN users u ON u.id = s.user_id',
    cotThoiGian: 's.created_at',
    dieuKien: `s.${LA_HOAT_DONG} AND u.role = '${vaiTro}'`,
  });
  const [customer, technician, admin] = await Promise.all([gop('CUSTOMER'), gop('TECHNICIAN'), gop('ADMIN')]);
  return { customer, technician, admin };
}

// Tạo / cập nhật / đóng-rút (dự án không xóa dữ liệu nên không có thao tác xóa).
async function thaoTacTheoO(khoang) {
  const gop = (dieuKien) => gopTheoO({ moc: khoang.boundaries, cte: CTE_SU_KIEN, nguon: 'su_kien', dieuKien });
  const [create, update, close] = await Promise.all([
    gop("action IN ('REGISTER', 'CREATE_REQUEST', 'CREATE_PROPOSAL', 'CREATE_REVIEW')"),
    gop("action IN ('UPDATE_REQUEST', 'UPDATE_PROPOSAL', 'UPDATE_PROFILE', 'ACCEPT_PROPOSAL', 'COMPLETE_REQUEST', 'LOCK_USER', 'UNLOCK_USER')"),
    gop("action IN ('CLOSE_REQUEST', 'WITHDRAW_PROPOSAL')"),
  ]);
  return { create, update, close };
}

async function demTheoHanhDong(khoang, { chiQuanTri = false } = {}) {
  const { rows } = await truyVan(
    `WITH ${CTE_SU_KIEN}
     SELECT s.action, count(*)::int AS count FROM su_kien s JOIN users u ON u.id = s.user_id
     WHERE s.created_at >= $1 AND s.created_at < $2 AND s.${LA_HOAT_DONG} AND ($3 = false OR u.role = 'ADMIN')
     GROUP BY s.action ORDER BY count(*) DESC, s.action`,
    [iso(khoang.start), iso(khoang.end), chiQuanTri],
  );
  return rows;
}

async function nguoiDungHoatDongNhieuNhat(khoang, soLuong = 10) {
  const { rows } = await truyVan(
    `WITH ${CTE_SU_KIEN}
     SELECT u.id, u.full_name, u.role, count(*)::int AS so, max(s.created_at) AS lan_cuoi
     FROM su_kien s JOIN users u ON u.id = s.user_id
     WHERE s.created_at >= $1 AND s.created_at < $2 AND s.${LA_HOAT_DONG}
     GROUP BY u.id ORDER BY so DESC, lan_cuoi DESC, u.id LIMIT $3`,
    [iso(khoang.start), iso(khoang.end), soLuong],
  );
  return rows.map((d) => ({ id: d.id, fullName: d.full_name, role: d.role, count: d.so, lastAt: d.lan_cuoi }));
}

// Số hoạt động theo thứ trong tuần (1 = thứ Hai) và giờ, theo giờ Việt Nam.
async function banDoNhiet(khoang) {
  const { rows } = await truyVan(
    `WITH ${CTE_SU_KIEN}
     SELECT extract(isodow FROM created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::int AS thu,
            extract(hour FROM created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::int AS gio, count(*)::int AS so
     FROM su_kien WHERE created_at >= $1 AND created_at < $2 AND ${LA_HOAT_DONG} GROUP BY 1, 2`,
    [iso(khoang.start), iso(khoang.end)],
  );
  const bang = Array.from({ length: 7 }, () => new Array(24).fill(0));
  for (const d of rows) bang[d.thu - 1][d.gio] = d.so;
  return bang;
}

module.exports = {
  CTE_GIAO_DICH,
  CTE_SU_KIEN,
  nguoiDungMoi,
  tongNguoiDungMoi,
  hoatDongTheoO,
  tongHoatDong,
  giaoDichChot,
  tongGiaoDichChot,
  viecHoanThanh,
  tongViecHoanThanh,
  giaTriHoanThanh,
  tongGiaTriHoanThanh,
  tinMoi,
  deXuatMoi,
  danhGiaMoi,
  loiMayChu,
  soCongDon,
  viecDangCho,
  trangThaiTin,
  thoiDiemBatDauNhatKy,
  soNguoiHoatDongTrong,
  giuChan,
  moiVaQuayLaiTheoO,
  theoVaiTroVaTrangThai,
  khachTheoKhuVuc,
  theoThietBi,
  dangNhapTheoO,
  hoatDongTheoVaiTro,
  thaoTacTheoO,
  demTheoHanhDong,
  nguoiDungHoatDongNhieuNhat,
  banDoNhiet,
};
