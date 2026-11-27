// Báo cáo chi tiết: định nghĩa cột và bộ lọc, đọc tham số, phân trang, xuất CSV / Excel.
const kho = require('../repositories/report.repository');
const doLuong = require('../utils/do-luong');
const dichVuHeThong = require('./system-health.service');
const { docKhoangThoiGian, moTaKhoang } = require('../utils/khoang-thoi-gian');
const { docThamSoPhanTrang, taoThongTinPhanTrang } = require('../utils/response');
const { LoiUngDung } = require('../utils/error-handler');
const { taoCsv } = require('../utils/csv');
const { taoXlsx } = require('../utils/xlsx');
const { NHAN_VAI_TRO, NHAN_TRANG_THAI_TAI_KHOAN, NHAN_TRANG_THAI_TIN, NHAN_KET_QUA, NHAN_HANH_DONG, NHAN_LOAI_LOI } = require('../utils/nhan');

const GIOI_HAN_XUAT = 10000;
const GIOI_HAN_IN = 2000;

const cot = (key, label, type = 'text', them = {}) => ({ key, label, type, ...them });
const enumCot = (key, label, labels, them) => cot(key, label, 'enum', { labels, ...them });
const khongCoKhongXacDinh = (nhan) => Object.fromEntries(Object.entries(nhan).filter(([k]) => k !== 'UNKNOWN'));
const luaChon = (nhan) => Object.entries(nhan).map(([value, label]) => ({ value, label }));

const BAO_CAO = {
  users: {
    title: 'Báo cáo người dùng',
    dateLabel: 'Ngày tạo tài khoản',
    columns: [
      cot('id', 'Mã', 'number', { width: 8 }), cot('fullName', 'Họ tên', 'text', { width: 26 }), cot('email', 'Email', 'text', { width: 28 }),
      enumCot('role', 'Vai trò', khongCoKhongXacDinh(NHAN_VAI_TRO)), enumCot('status', 'Trạng thái', NHAN_TRANG_THAI_TAI_KHOAN),
      cot('requests', 'Tin đã đăng', 'number'), cot('proposals', 'Đề xuất đã gửi', 'number'), cot('reviewsReceived', 'Đánh giá nhận', 'number'),
      cot('ratingAvg', 'Điểm trung bình', 'number'), cot('createdAt', 'Ngày tạo', 'datetime'),
    ],
    filters: () => [
      { key: 'role', label: 'Vai trò', options: luaChon(khongCoKhongXacDinh(NHAN_VAI_TRO)) },
      { key: 'status', label: 'Trạng thái', options: luaChon(NHAN_TRANG_THAI_TAI_KHOAN) },
    ],
    sort: ['createdAt', 'desc'],
  },
  revenue: {
    title: 'Báo cáo giá trị công việc hoàn thành',
    dateLabel: 'Ngày hoàn thành',
    note: 'Giá trị là giá đề xuất được chọn của công việc đã hoàn thành. Nền tảng không thu tiền nên đây không phải doanh thu.',
    columns: [
      cot('code', 'Mã tin'), cot('title', 'Tiêu đề', 'text', { width: 34 }), cot('category', 'Loại dịch vụ'), cot('customer', 'Khách hàng', 'text', { width: 22 }),
      cot('technician', 'Kỹ thuật viên', 'text', { width: 22 }), cot('price', 'Giá trị (đ)', 'money'), cot('completedAt', 'Hoàn thành lúc', 'datetime'), cot('location', 'Khu vực', 'text', { width: 24 }),
    ],
    filters: async () => [{ key: 'category', label: 'Loại dịch vụ', options: (await kho.giaTriCuaCot('revenue', 'category')).map((v) => ({ value: v, label: v })) }],
    sort: ['completedAt', 'desc'],
    sumLabel: 'Tổng giá trị',
  },
  transactions: {
    title: 'Báo cáo giao dịch',
    dateLabel: 'Ngày chấp nhận đề xuất',
    note: 'Một giao dịch là một đề xuất được khách hàng chấp nhận.',
    columns: [
      cot('code', 'Mã tin'), cot('title', 'Tiêu đề', 'text', { width: 34 }), cot('customer', 'Khách hàng', 'text', { width: 22 }), cot('technician', 'Kỹ thuật viên', 'text', { width: 22 }),
      cot('price', 'Giá trị (đ)', 'money'), enumCot('status', 'Trạng thái tin', NHAN_TRANG_THAI_TIN), cot('acceptedAt', 'Chấp nhận lúc', 'datetime'), cot('completedAt', 'Hoàn thành lúc', 'datetime'),
    ],
    filters: () => [{ key: 'status', label: 'Trạng thái tin', options: luaChon({ SELECTED: NHAN_TRANG_THAI_TIN.SELECTED, COMPLETED: NHAN_TRANG_THAI_TIN.COMPLETED }) }],
    sort: ['acceptedAt', 'desc'],
    sumLabel: 'Tổng giá trị giao dịch',
  },
  activity: {
    title: 'Báo cáo hoạt động',
    dateLabel: 'Thời điểm',
    note: 'Việc tạo dữ liệu có đủ lịch sử; đăng nhập, sửa, đóng, khóa và lần thất bại chỉ có từ khi ghi nhật ký. Hệ thống không thu thập địa chỉ IP.',
    columns: [
      cot('createdAt', 'Thời điểm', 'datetime'), cot('userName', 'Người dùng', 'text', { width: 22 }), enumCot('role', 'Vai trò', NHAN_VAI_TRO),
      enumCot('action', 'Thao tác', NHAN_HANH_DONG, { width: 20 }), cot('target', 'Đối tượng', 'text', { width: 28 }), enumCot('status', 'Kết quả', NHAN_KET_QUA),
      cot('device', 'Thiết bị'), cot('os', 'Hệ điều hành'), cot('ip', 'Địa chỉ IP'),
    ],
    filters: () => [
      { key: 'action', label: 'Thao tác', options: luaChon(NHAN_HANH_DONG) },
      { key: 'status', label: 'Kết quả', options: luaChon(NHAN_KET_QUA) },
      { key: 'role', label: 'Vai trò', options: luaChon(NHAN_VAI_TRO) },
    ],
    sort: ['createdAt', 'desc'],
  },
  errors: {
    title: 'Báo cáo lỗi',
    dateLabel: 'Thời điểm',
    note: 'Gồm lỗi máy chủ (500), đăng nhập thất bại và lần bị từ chối quyền, ghi từ khi triển khai nhật ký.',
    columns: [
      cot('createdAt', 'Thời điểm', 'datetime'), enumCot('type', 'Loại', NHAN_LOAI_LOI, { width: 20 }), cot('userName', 'Người dùng', 'text', { width: 22 }),
      cot('route', 'Đường dẫn', 'text', { width: 40 }), cot('httpStatus', 'Mã HTTP', 'number'), cot('device', 'Thiết bị'), cot('os', 'Hệ điều hành'),
    ],
    filters: () => [{ key: 'type', label: 'Loại lỗi', options: luaChon(NHAN_LOAI_LOI) }],
    sort: ['createdAt', 'desc'],
  },
  system: {
    title: 'Báo cáo hệ thống',
    dateLabel: 'Thời điểm lấy mẫu',
    note: 'Mẫu đo mỗi 15 giây, chỉ giữ trong bộ nhớ từ khi backend khởi động (tối đa 24 giờ).',
    inMemory: () => dichVuHeThong.lichSuMau(),
    columns: [
      cot('at', 'Thời điểm', 'datetime'), cot('cpuPct', 'CPU (%)', 'number'), cot('ramPct', 'RAM (%)', 'number'), cot('diskPct', 'Ổ đĩa (%)', 'number'),
      enumCot('dbOk', 'CSDL', { OK: 'Hoạt động', LOI: 'Lỗi' }), cot('dbMs', 'CSDL phản hồi (ms)', 'number'), cot('requests', 'Yêu cầu / phút', 'number'),
      cot('errorRatePct', 'Tỷ lệ lỗi 5xx (%)', 'number'), cot('p95Ms', 'API p95 (ms)', 'number'),
    ],
    filters: () => [{ key: 'dbOk', label: 'CSDL', options: luaChon({ OK: 'Hoạt động', LOI: 'Lỗi' }) }],
    sort: ['at', 'desc'],
    searchKeys: ['at'],
    timeKey: 'at',
  },
  performance: {
    title: 'Báo cáo hiệu năng API',
    note: 'Số đo theo đường dẫn tính từ khi backend khởi động, không lọc theo khoảng thời gian; không tính yêu cầu của trang thống kê.',
    inMemory: () => doLuong.danhSachTuyen().map((d) => ({
      id: `${d.method} ${d.route}`, ...d, avgMs: Number(d.avgMs.toFixed(1)), p95Ms: Number(d.p95Ms.toFixed(1)), maxMs: Number(d.maxMs.toFixed(1)),
    })),
    columns: [
      cot('method', 'Phương thức'), cot('route', 'Đường dẫn', 'text', { width: 40 }), cot('requests', 'Số yêu cầu', 'number'),
      cot('errors4xx', 'Lỗi 4xx', 'number'), cot('errors5xx', 'Lỗi 5xx', 'number'), cot('avgMs', 'Trung bình (ms)', 'number'), cot('p95Ms', 'p95 (ms)', 'number'), cot('maxMs', 'Lớn nhất (ms)', 'number'),
    ],
    filters: () => [{ key: 'method', label: 'Phương thức', options: luaChon({ GET: 'GET', POST: 'POST', PATCH: 'PATCH' }) }],
    sort: ['requests', 'desc'],
    searchKeys: ['route'],
  },
};

const loiThamSo = (field, message) => new LoiUngDung(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', [{ field, message }]);
const docChuoi = (v) => (typeof v === 'string' ? v.trim() : '');

function layDinhNghia(loai) {
  if (!Object.prototype.hasOwnProperty.call(BAO_CAO, loai)) throw new LoiUngDung(404, 'NOT_FOUND', 'Không có loại báo cáo này');
  return BAO_CAO[loai];
}

async function docThamSo(loai, query) {
  const dinhNghia = layDinhNghia(loai);
  const tuKhoa = docChuoi(query.q).slice(0, 100);
  const cotSapXep = docChuoi(query.sort) || dinhNghia.sort[0];
  if (!dinhNghia.columns.some((c) => c.key === cotSapXep)) throw loiThamSo('sort', 'Không sắp xếp được theo cột này');
  const chieu = docChuoi(query.dir) || (cotSapXep === dinhNghia.sort[0] ? dinhNghia.sort[1] : 'asc');
  if (!['asc', 'desc'].includes(chieu)) throw loiThamSo('dir', 'dir là asc hoặc desc');
  const boLocCo = await dinhNghia.filters();
  const boLoc = {};
  for (const { key, options } of boLocCo) {
    const giaTri = docChuoi(query[key]);
    if (!giaTri) continue;
    if (!options.some((o) => o.value === giaTri)) throw loiThamSo(key, 'Giá trị lọc không hợp lệ');
    boLoc[key] = giaTri;
  }
  // range=all: không lọc theo thời gian. Báo cáo hiệu năng không có cột thời gian.
  const khoang = !dinhNghia.dateLabel || query.range === 'all' ? null : docKhoangThoiGian(query);
  return { dinhNghia, boLocCo, tuKhoa, cotSapXep, chieu, boLoc, khoang };
}

// Báo cáo trong bộ nhớ (hệ thống, hiệu năng): lọc, sắp xếp, phân trang bằng JavaScript.
function locTrongBoNho({ dinhNghia, tuKhoa, cotSapXep, chieu, boLoc, khoang }, gioiHan, boQua) {
  let dong = dinhNghia.inMemory();
  if (khoang) dong = dong.filter((d) => Date.parse(d[dinhNghia.timeKey]) >= khoang.start && Date.parse(d[dinhNghia.timeKey]) < khoang.end);
  if (tuKhoa) {
    const mau = tuKhoa.toLowerCase();
    dong = dong.filter((d) => (dinhNghia.searchKeys ?? []).some((k) => String(d[k]).toLowerCase().includes(mau)));
  }
  for (const [k, v] of Object.entries(boLoc)) dong = dong.filter((d) => String(d[k]) === v);
  const dau = chieu === 'asc' ? 1 : -1;
  dong = [...dong].sort((a, b) => {
    const x = a[cotSapXep];
    const y = b[cotSapXep];
    if (x === y) return 0;
    if (x === null || x === undefined) return 1;
    if (y === null || y === undefined) return -1;
    return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'vi')) * dau;
  });
  return { rows: dong.slice(boQua, boQua + gioiHan), total: dong.length, sum: null };
}

async function docDong(thamSo, loai, gioiHan, boQua = 0) {
  if (thamSo.dinhNghia.inMemory) return locTrongBoNho(thamSo, gioiHan, boQua);
  return kho.truyVanBaoCao(loai, {
    khoang: thamSo.khoang, tuKhoa: thamSo.tuKhoa, boLoc: thamSo.boLoc, cotSapXep: thamSo.cotSapXep, chieu: thamSo.chieu, gioiHan, boQua,
  });
}

// print=1: trả tất cả dòng đã lọc (tối đa GIOI_HAN_IN) để in / lưu PDF từ trình duyệt.
async function layBaoCao(loai, query) {
  const thamSo = await docThamSo(loai, query);
  const dangIn = query.print === '1';
  const phanTrang = dangIn ? { trang: 1, kichThuoc: GIOI_HAN_IN, viTriBatDau: 0 } : docThamSoPhanTrang(query);
  const ketQua = await docDong(thamSo, loai, phanTrang.kichThuoc, phanTrang.viTriBatDau);
  const { dinhNghia } = thamSo;
  return {
    duLieu: {
      type: loai,
      title: dinhNghia.title,
      note: dinhNghia.note ?? null,
      dateLabel: dinhNghia.dateLabel ?? null,
      range: thamSo.khoang ? moTaKhoang(thamSo.khoang) : null,
      columns: dinhNghia.columns,
      filters: thamSo.boLocCo,
      sort: { key: thamSo.cotSapXep, dir: thamSo.chieu },
      summary: ketQua.sum === null || ketQua.sum === undefined ? null : { label: dinhNghia.sumLabel, value: ketQua.sum },
      rows: ketQua.rows,
    },
    phanTrang: taoThongTinPhanTrang(phanTrang, ketQua.total),
  };
}

const dinhDangThoiGianVn = (giaTri) => {
  if (!giaTri) return '';
  const vn = new Date(new Date(giaTri).getTime() + 7 * 3600 * 1000).toISOString();
  return `${vn.slice(8, 10)}/${vn.slice(5, 7)}/${vn.slice(0, 4)} ${vn.slice(11, 16)}`;
};

function giaTriXuat(cotBaoCao, giaTri) {
  if (giaTri === null || giaTri === undefined) return '';
  if (cotBaoCao.type === 'datetime') return dinhDangThoiGianVn(giaTri);
  if (cotBaoCao.type === 'enum') return cotBaoCao.labels[giaTri] ?? String(giaTri);
  if (cotBaoCao.type === 'number' || cotBaoCao.type === 'money') return Number(giaTri);
  return String(giaTri);
}

const LOAI_FILE = {
  csv: { mime: 'text/csv; charset=utf-8', tao: (dn, dong) => taoCsv(dn.columns.map((c) => c.label), dong) },
  xlsx: {
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    tao: (dn, dong) => taoXlsx(dn.title, dn.columns.map((c) => ({ tieuDe: c.label, rong: c.width ?? (c.type === 'datetime' ? 18 : 15) })), dong),
  },
};

async function xuatBaoCao(loai, query) {
  const dinhDang = docChuoi(query.format) || 'csv';
  if (!Object.prototype.hasOwnProperty.call(LOAI_FILE, dinhDang)) throw loiThamSo('format', 'format là csv hoặc xlsx');
  const thamSo = await docThamSo(loai, query);
  const ketQua = await docDong(thamSo, loai, GIOI_HAN_XUAT);
  const { dinhNghia } = thamSo;
  const dong = ketQua.rows.map((d) => dinhNghia.columns.map((c) => giaTriXuat(c, d[c.key])));
  const ngay = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10);
  return {
    noiDung: LOAI_FILE[dinhDang].tao(dinhNghia, dong),
    kieu: LOAI_FILE[dinhDang].mime,
    tenFile: `bao-cao-${loai}-${ngay}.${dinhDang}`,
    biCat: ketQua.total > GIOI_HAN_XUAT,
    soDong: dong.length,
  };
}

module.exports = { layBaoCao, xuatBaoCao };
