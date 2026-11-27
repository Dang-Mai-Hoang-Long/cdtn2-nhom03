// Đo tình trạng máy chủ đang chạy backend: CPU, RAM, ổ đĩa, thời gian chạy, cơ sở dữ liệu. Mọi số là số đo thật tại
// thời điểm lấy mẫu; lịch sử chỉ giữ trong bộ nhớ từ khi backend khởi động (tối đa 24 giờ).
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const { pool, truyVan } = require('../db');
const doLuong = require('../utils/do-luong');
const { ghiBu } = require('./activity-log.service');

const CHU_KY_LAY_MAU_MS = 15000;
const SO_MAU_TOI_DA = (24 * 3600 * 1000) / CHU_KY_LAY_MAU_MS;
const THU_MUC_DU_AN = path.resolve(__dirname, '..', '..');

const NGUONG = Object.freeze({
  cpuPct: 85,
  ramPct: 85,
  diskPct: 90,
  apiP95Ms: 3000, // NFR1: phản hồi dưới 3 giây
  errorRatePct: 5,
  errorRateMinRequests: 20,
  dbMs: 500,
});

const lichSu = [];
let mauCpuTruoc = docBoDemCpu();
let boHenGio = null;

function docBoDemCpu() {
  let ranh = 0;
  let tong = 0;
  for (const loi of os.cpus()) {
    for (const [loai, thoiGian] of Object.entries(loi.times)) {
      tong += thoiGian;
      if (loai === 'idle') ranh += thoiGian;
    }
  }
  return { ranh, tong, tienTrinh: process.cpuUsage(), luc: process.hrtime.bigint() };
}

// Mức dùng CPU giữa hai lần đọc. os.loadavg() luôn trả 0 trên Windows nên phải tự tính từ thời gian của từng lõi.
function tinhCpu() {
  const nay = docBoDemCpu();
  const tong = nay.tong - mauCpuTruoc.tong;
  const khoangUs = Number(nay.luc - mauCpuTruoc.luc) / 1000;
  const dungUs = (nay.tienTrinh.user - mauCpuTruoc.tienTrinh.user) + (nay.tienTrinh.system - mauCpuTruoc.tienTrinh.system);
  // Hai lần đọc quá sát nhau thì con số không đáng tin: giữ mốc cũ để lần sau đo trên khoảng dài hơn.
  if (khoangUs < 200000 || tong <= 0) return null;
  const ketQua = {
    systemPct: Math.min(100, Math.max(0, (1 - (nay.ranh - mauCpuTruoc.ranh) / tong) * 100)),
    processPct: Math.min(100, Math.max(0, (dungUs / khoangUs / os.cpus().length) * 100)),
    cores: os.cpus().length,
    model: os.cpus()[0]?.model.trim() ?? '',
  };
  mauCpuTruoc = nay;
  return ketQua;
}

function docRam() {
  const tong = os.totalmem();
  const dung = tong - os.freemem();
  const tienTrinh = process.memoryUsage();
  return { systemUsedPct: (dung / tong) * 100, totalBytes: tong, usedBytes: dung, processRssBytes: tienTrinh.rss, heapUsedBytes: tienTrinh.heapUsed };
}

function docODia() {
  try {
    const s = fs.statfsSync(THU_MUC_DU_AN);
    const tong = s.blocks * s.bsize;
    const trong = s.bavail * s.bsize;
    if (!tong) return null;
    return { usedPct: ((tong - trong) / tong) * 100, totalBytes: tong, freeBytes: trong };
  } catch {
    return null;
  }
}

async function docCoSoDuLieu() {
  const batDau = process.hrtime.bigint();
  try {
    await truyVan('SELECT 1');
    const latencyMs = Number(process.hrtime.bigint() - batDau) / 1e6;
    const { rows } = await truyVan(
      `SELECT pg_database_size(current_database())::float8 AS size,
              (SELECT count(*) FROM pg_stat_activity WHERE datname = current_database())::int AS ket_noi,
              current_setting('max_connections')::int AS toi_da, current_setting('server_version') AS phien_ban`,
    );
    return {
      ok: true,
      latencyMs,
      sizeBytes: rows[0].size,
      activeConnections: rows[0].ket_noi,
      maxConnections: rows[0].toi_da,
      version: rows[0].phien_ban,
      pool: { total: pool.totalCount, idle: pool.idleCount, waiting: pool.waitingCount },
    };
  } catch (loi) {
    return { ok: false, latencyMs: null, error: loi.code || 'DB_ERROR', pool: { total: pool.totalCount, idle: pool.idleCount, waiting: pool.waitingCount } };
  }
}

const lamTron = (so, chuSo = 1) => (so === null || so === undefined ? null : Number(so.toFixed(chuSo)));

// luuLichSu: chỉ bộ hẹn giờ ghi vào lịch sử, để lịch sử cách đều 15 giây dù trang thống kê gọi thêm lúc nào.
async function layMau({ luuLichSu = false } = {}) {
  const luc = new Date();
  const cpu = tinhCpu();
  const ram = docRam();
  const oDia = docODia();
  const coSoDuLieu = await docCoSoDuLieu();
  const api = doLuong.tomTatKhoang(luc.getTime() - 60000, luc.getTime() + 60000);
  const mau = {
    id: luc.getTime(),
    at: luc.toISOString(),
    cpuPct: lamTron(cpu?.systemPct ?? lichSu.at(-1)?.cpuPct ?? null),
    processCpuPct: lamTron(cpu?.processPct ?? lichSu.at(-1)?.processCpuPct ?? null),
    ramPct: lamTron(ram.systemUsedPct),
    diskPct: lamTron(oDia?.usedPct ?? null),
    dbOk: coSoDuLieu.ok ? 'OK' : 'LOI',
    dbMs: lamTron(coSoDuLieu.latencyMs),
    requests: api.requests,
    errorRatePct: lamTron(api.errorRate * 100),
    p95Ms: lamTron(api.p95Ms),
  };
  if (luuLichSu) {
    lichSu.push(mau);
    if (lichSu.length > SO_MAU_TOI_DA) lichSu.splice(0, lichSu.length - SO_MAU_TOI_DA);
  }
  return { mau, cpu, ram, oDia, coSoDuLieu };
}

// Chỉ server.js gọi (không chạy trong kiểm thử); unref để bộ hẹn giờ không giữ tiến trình sống.
function batDauLayMau() {
  if (boHenGio) return;
  // Mỗi lần lấy mẫu cũng ghi bù các dòng nhật ký còn chờ từ lúc CSDL mất kết nối.
  const chay = () => layMau({ luuLichSu: true }).then(({ coSoDuLieu }) => coSoDuLieu.ok && ghiBu())
    .catch((loi) => console.error('Không lấy được số đo hệ thống:', loi.message));
  setTimeout(chay, 1000).unref();
  boHenGio = setInterval(chay, CHU_KY_LAY_MAU_MS);
  boHenGio.unref();
}

// Cảnh báo hệ thống và hiệu năng theo ngưỡng, dựa trên một lần đo.
function canhBaoTheoNguong({ mau, api5Phut }) {
  const ds = [];
  const them = (key, severity, category, title, description, suggestion) => ds.push({ key, severity, category, title, description, suggestion, occurredAt: mau.at });
  const so = (v) => String(v).replace('.', ',');
  if (mau.dbOk !== 'OK') them('he-thong-csdl-loi', 'critical', 'system', 'Cơ sở dữ liệu không phản hồi', 'Truy vấn kiểm tra tới PostgreSQL thất bại.', 'Kiểm tra dịch vụ PostgreSQL và chuỗi kết nối DATABASE_URL.');
  else if (mau.dbMs > NGUONG.dbMs) them('he-thong-csdl-cham', 'warning', 'system', 'Cơ sở dữ liệu phản hồi chậm', `Truy vấn kiểm tra mất ${so(mau.dbMs)} ms (ngưỡng ${NGUONG.dbMs} ms).`, 'Kiểm tra tải của PostgreSQL và các truy vấn đang chạy.');
  if (mau.cpuPct > NGUONG.cpuPct) them('he-thong-cpu', 'warning', 'system', 'CPU vượt ngưỡng', `CPU đang dùng ${so(mau.cpuPct)}% (ngưỡng ${NGUONG.cpuPct}%).`, 'Xem tiến trình nào chiếm CPU; cân nhắc chạy nhiều tiến trình backend.');
  if (mau.ramPct > NGUONG.ramPct) them('he-thong-ram', 'warning', 'system', 'RAM vượt ngưỡng', `RAM đang dùng ${so(mau.ramPct)}% (ngưỡng ${NGUONG.ramPct}%).`, 'Đóng tiến trình không cần thiết hoặc tăng bộ nhớ máy chủ.');
  if (mau.diskPct > NGUONG.diskPct) them('he-thong-o-dia', 'critical', 'system', 'Ổ đĩa sắp đầy', `Ổ đĩa đã dùng ${so(mau.diskPct)}% (ngưỡng ${NGUONG.diskPct}%).`, 'Giải phóng dung lượng, sao lưu rồi dọn file nhật ký cũ.');
  if (api5Phut.p95Ms > NGUONG.apiP95Ms) them('hieu-nang-api-cham', 'warning', 'performance', 'API phản hồi chậm', `p95 trong 5 phút là ${Math.round(api5Phut.p95Ms)} ms (ngưỡng ${NGUONG.apiP95Ms} ms).`, 'Xem báo cáo Hiệu năng để tìm đường dẫn chậm nhất.');
  if (api5Phut.requests >= NGUONG.errorRateMinRequests && api5Phut.errorRate * 100 > NGUONG.errorRatePct) {
    them('hieu-nang-ty-le-loi', 'critical', 'error', 'Tỷ lệ lỗi máy chủ tăng cao', `${api5Phut.errors5xx}/${api5Phut.requests} yêu cầu trong 5 phút trả lỗi 5xx (ngưỡng ${NGUONG.errorRatePct}%).`, 'Mở báo cáo Lỗi và xem log của backend.');
  }
  return ds;
}

async function tinhTrangHienTai() {
  const { mau, cpu, ram, oDia, coSoDuLieu } = await layMau();
  const luc = Date.now();
  const api5Phut = doLuong.tomTatKhoang(luc - 5 * 60000, luc + 60000);
  const trangThai = doLuong.trangThaiHienTai();
  return {
    at: mau.at,
    uptimeSeconds: process.uptime(),
    osUptimeSeconds: os.uptime(),
    startedAt: trangThai.batDauLuc,
    cpu: cpu ?? (mau.cpuPct === null ? null : { systemPct: mau.cpuPct, processPct: mau.processCpuPct, cores: os.cpus().length, model: os.cpus()[0]?.model.trim() ?? '' }),
    memory: ram,
    disk: oDia,
    network: { bytesIn: trangThai.tongByteVao, bytesOut: trangThai.tongByteRa, since: trangThai.batDauLuc },
    api: { windowMinutes: 5, ...api5Phut, inFlight: trangThai.dangXuLy },
    database: coSoDuLieu,
    thresholds: NGUONG,
    alerts: canhBaoTheoNguong({ mau, api5Phut }),
    sampleIntervalSeconds: CHU_KY_LAY_MAU_MS / 1000,
    history: lichSu.slice(-80),
  };
}

const lichSuMau = () => [...lichSu];

module.exports = { batDauLayMau, tinhTrangHienTai, lichSuMau, NGUONG };
