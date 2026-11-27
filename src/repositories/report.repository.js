// Nguồn dữ liệu của các báo cáo chi tiết. Mỗi nguồn là một câu SELECT có cột đặt đúng tên khóa trả cho giao diện;
// lọc, tìm kiếm, sắp xếp và phân trang bọc bên ngoài. Tên cột sắp xếp chỉ lấy từ danh sách trong mã, giá trị luôn là tham số.
// Cùng định nghĩa giao dịch và sự kiện với phần tổng quan (analytics.repository) nên số liệu hai nơi khớp nhau.
const { truyVan } = require('../db');
const { CTE_GIAO_DICH, CTE_SU_KIEN } = require('./analytics.repository');

const MA_TIN = (cot) => `'SC-' || CASE WHEN length(${cot}::text) < 3 THEN lpad(${cot}::text, 3, '0') ELSE ${cot}::text END`;
const HANH_DONG_TU_BANG = "('REGISTER', 'CREATE_REQUEST', 'CREATE_PROPOSAL', 'CREATE_REVIEW', 'ACCEPT_PROPOSAL', 'COMPLETE_REQUEST')";

const TEN_DOI_TUONG = `CASE
  WHEN x.target_type = 'alert' THEN 'Cảnh báo'
  WHEN x.target_type = 'report' THEN 'Báo cáo ' || CASE split_part(split_part(x.route, '/reports/', 2), '/', 1)
    WHEN 'users' THEN 'người dùng' WHEN 'revenue' THEN 'giá trị công việc' WHEN 'transactions' THEN 'giao dịch'
    WHEN 'activity' THEN 'hoạt động' WHEN 'system' THEN 'hệ thống' WHEN 'errors' THEN 'lỗi' WHEN 'performance' THEN 'hiệu năng' ELSE '' END
  WHEN x.target_id IS NULL THEN coalesce(x.route, '')
  WHEN x.target_type = 'request' THEN 'Tin ' || ${MA_TIN('x.target_id')}
  WHEN x.target_type = 'proposal' THEN 'Đề xuất #' || x.target_id
  WHEN x.target_type = 'review' THEN 'Đánh giá #' || x.target_id
  WHEN x.target_type = 'user' THEN 'Tài khoản #' || x.target_id
  ELSE coalesce(x.route, '')
END`;

// Nhật ký hợp nhất: việc tạo dữ liệu lấy từ bảng nghiệp vụ (ghép thêm thiết bị nếu có dòng nhật ký tương ứng), còn
// đăng nhập, sửa, đóng, khóa và mọi lần thất bại lấy từ activity_log.
const SQL_NHAT_KY = `
  SELECT x.khoa AS "id", x.created_at AS "createdAt", x.user_id AS "userId", coalesce(u.full_name, 'Không xác định') AS "userName",
         coalesce(u.role, 'UNKNOWN') AS "role", x.action AS "action", ${TEN_DOI_TUONG} AS "target", x.status AS "status",
         x.device AS "device", x.os AS "os", 'Không thu thập' AS "ip"
  FROM (
    SELECT s.action || ':' || s.target_id AS khoa, s.created_at, s.user_id, s.action, s.target_type, s.target_id,
           'SUCCESS' AS status, NULL::text AS route, l.device::text AS device, l.os::text AS os
    FROM su_kien s
    LEFT JOIN LATERAL (
      SELECT device, os FROM activity_log a
      WHERE a.action = s.action AND a.target_id = s.target_id AND a.status = 'SUCCESS' ORDER BY a.id DESC LIMIT 1
    ) l ON true
    WHERE s.action IN ${HANH_DONG_TU_BANG}
    UNION ALL
    SELECT 'log:' || a.id, a.created_at, a.user_id, a.action::text, a.target_type::text, a.target_id,
           a.status::text, a.route::text, a.device::text, a.os::text
    FROM activity_log a
    WHERE a.status = 'FAILURE' OR a.action NOT IN ${HANH_DONG_TU_BANG}
  ) x
  LEFT JOIN users u ON u.id = x.user_id`;

const NGUON = {
  users: {
    sql: `SELECT u.id AS "id", u.full_name AS "fullName", u.email AS "email", u.role AS "role",
                 CASE WHEN u.is_locked THEN 'LOCKED' ELSE 'ACTIVE' END AS "status", u.created_at AS "createdAt",
                 (SELECT count(*) FROM repair_request r WHERE r.customer_id = u.id)::int AS "requests",
                 (SELECT count(*) FROM proposal p WHERE p.technician_id = u.id)::int AS "proposals",
                 (SELECT count(*) FROM review v WHERE v.to_user_id = u.id)::int AS "reviewsReceived",
                 u.rating_avg::float8 AS "ratingAvg"
          FROM users u`,
    cotThoiGian: 'createdAt',
    cotTimKiem: ['fullName', 'email'],
  },
  revenue: {
    cte: CTE_GIAO_DICH,
    sql: `SELECT g.proposal_id AS "id", ${MA_TIN('g.request_id')} AS "code", g.title AS "title", g.category AS "category",
                 c.full_name AS "customer", k.full_name AS "technician", g.price::float8 AS "price",
                 g.completed_at AS "completedAt", g.location AS "location"
          FROM giao_dich g JOIN users c ON c.id = g.customer_id JOIN users k ON k.id = g.technician_id
          WHERE g.completed_at IS NOT NULL`,
    cotThoiGian: 'completedAt',
    cotTimKiem: ['code', 'title', 'customer', 'technician', 'location'],
    cotTong: 'price',
  },
  transactions: {
    cte: CTE_GIAO_DICH,
    sql: `SELECT g.proposal_id AS "id", ${MA_TIN('g.request_id')} AS "code", g.title AS "title", c.full_name AS "customer",
                 k.full_name AS "technician", g.price::float8 AS "price", g.request_status AS "status",
                 g.accepted_at AS "acceptedAt", g.completed_at AS "completedAt", g.category AS "category"
          FROM giao_dich g JOIN users c ON c.id = g.customer_id JOIN users k ON k.id = g.technician_id
          WHERE g.accepted_at IS NOT NULL`,
    cotThoiGian: 'acceptedAt',
    cotTimKiem: ['code', 'title', 'customer', 'technician'],
    cotTong: 'price',
  },
  activity: { cte: CTE_SU_KIEN, sql: SQL_NHAT_KY, cotThoiGian: 'createdAt', cotTimKiem: ['userName', 'target'] },
  errors: {
    sql: `SELECT a.id AS "id", a.created_at AS "createdAt",
                 CASE WHEN a.action = 'SERVER_ERROR' THEN 'SERVER_ERROR' WHEN a.action = 'LOGIN' THEN 'LOGIN_FAILED' ELSE 'ACCESS_DENIED' END AS "type",
                 coalesce(u.full_name, 'Không xác định') AS "userName", a.route AS "route", a.http_status AS "httpStatus",
                 a.device AS "device", a.os AS "os"
          FROM activity_log a LEFT JOIN users u ON u.id = a.user_id WHERE a.status = 'FAILURE'`,
    cotThoiGian: 'createdAt',
    cotTimKiem: ['userName', 'route'],
  },
};

const thoatKyTuMau = (chuoi) => chuoi.replace(/[\\%_]/g, (k) => `\\${k}`);

function taoDieuKien(nguon, { khoang, tuKhoa, boLoc = {} }) {
  const dieuKien = [];
  const thamSo = [];
  const them = (giaTri) => `$${thamSo.push(giaTri)}`;
  if (khoang) dieuKien.push(`t."${nguon.cotThoiGian}" >= ${them(new Date(khoang.start).toISOString())} AND t."${nguon.cotThoiGian}" < ${them(new Date(khoang.end).toISOString())}`);
  if (tuKhoa) {
    const mau = them(`%${thoatKyTuMau(tuKhoa)}%`);
    dieuKien.push(`(${nguon.cotTimKiem.map((cot) => `t."${cot}" ILIKE ${mau}`).join(' OR ')})`);
  }
  for (const [cot, giaTri] of Object.entries(boLoc)) dieuKien.push(`t."${cot}"::text = ${them(giaTri)}`);
  return { where: dieuKien.length ? `WHERE ${dieuKien.join(' AND ')}` : '', thamSo };
}

// cotSapXep phải đã được kiểm tra là cột của báo cáo (service đảm nhiệm).
async function truyVanBaoCao(loai, { khoang, tuKhoa, boLoc, cotSapXep, chieu, gioiHan, boQua = 0 }) {
  const nguon = NGUON[loai];
  const { where, thamSo } = taoDieuKien(nguon, { khoang, tuKhoa, boLoc });
  const cte = nguon.cte ? `WITH ${nguon.cte}` : '';
  const tu = `FROM (${nguon.sql}) t ${where}`;
  const tongSql = nguon.cotTong ? `, coalesce(sum(t."${nguon.cotTong}"), 0)::float8 AS tong_gia_tri` : '';
  const { rows: dem } = await truyVan(`${cte} SELECT count(*)::int AS so${tongSql} ${tu}`, thamSo);
  const { rows } = await truyVan(
    `${cte} SELECT * ${tu} ORDER BY t."${cotSapXep}" ${chieu === 'asc' ? 'ASC' : 'DESC'} NULLS LAST, t."id" LIMIT $${thamSo.length + 1} OFFSET $${thamSo.length + 2}`,
    [...thamSo, gioiHan, boQua],
  );
  return { rows, total: dem[0].so, sum: nguon.cotTong ? dem[0].tong_gia_tri : null };
}

// Giá trị khác nhau của một cột (để điền danh sách lọc), ví dụ các loại dịch vụ.
async function giaTriCuaCot(loai, cot) {
  const nguon = NGUON[loai];
  const cte = nguon.cte ? `WITH ${nguon.cte}` : '';
  const { rows } = await truyVan(`${cte} SELECT DISTINCT t."${cot}" AS v FROM (${nguon.sql}) t WHERE t."${cot}" IS NOT NULL ORDER BY 1`);
  return rows.map((d) => d.v);
}

async function suKienGanDay(soLuong) {
  const { rows } = await truyVan(
    `WITH ${CTE_SU_KIEN} SELECT * FROM (${SQL_NHAT_KY}) t ORDER BY t."createdAt" DESC, t."id" LIMIT $1`,
    [soLuong],
  );
  return rows;
}

module.exports = { truyVanBaoCao, giaTriCuaCot, suKienGanDay };
