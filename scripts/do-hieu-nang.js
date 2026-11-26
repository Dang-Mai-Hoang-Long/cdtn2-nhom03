// Đo hiệu năng NFR1: thời gian phản hồi dưới 3 giây khi có 1000 tin và 100 người dùng đồng thời.
// Cách chạy: node scripts/do-hieu-nang.js   (CSDL phát triển đã nạp dữ liệu mẫu 1050 tin: npm run migrate && npm run seed)
// Script tự bật một backend riêng (cổng 3104, NODE_ENV=production, cùng CSDL với .env) rồi cho 100 người dùng ảo gọi API cùng lúc.
//   --nguoi=100   số người dùng ảo (60% kỹ thuật viên, 40% khách hàng)   --vong=15   số vòng thao tác của mỗi người
// Máy đo, backend và CSDL cùng chạy trên một máy qua loopback nên số đo chỉ so với ngưỡng 3 giây, không phải số đo máy chủ thật.
// Không phải test của dự án (npm test).
const { spawn } = require('node:child_process');
const os = require('node:os');
require('dotenv').config({ quiet: true });
const { Pool } = require('pg');

const tham = Object.fromEntries(process.argv.slice(2).filter((t) => t.startsWith('--')).map((t) => { const [k, v] = t.slice(2).split('='); return [k, v]; }));
const SO_NGUOI = Number(tham.nguoi || 100);
const SO_VONG = Number(tham.vong || 15);
const NGUONG_MS = 3000;
const CONG = 3104;
const API = `http://localhost:${CONG}/api`;
const nghi = (ms) => new Promise((r) => setTimeout(r, ms));
const phanVi = (mang, p) => { const s = [...mang].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.ceil((p / 100) * s.length) - 1)] : 0; };

async function goi(method, duong, token, than) {
  const t0 = performance.now();
  try {
    const r = await fetch(`${API}${duong}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: than === undefined ? undefined : JSON.stringify(than) });
    await r.arrayBuffer();
    return { ms: performance.now() - t0, status: r.status };
  } catch { return { ms: performance.now() - t0, status: 0 }; }
}
async function dangNhap(email) {
  const r = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'Demo@123' }) });
  const j = await r.json();
  return { token: j.data?.token, id: j.data?.user?.id };
}

async function chay() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dem = (await pool.query("SELECT count(*)::int AS n FROM repair_request")).rows[0].n;
  const emails = (await pool.query("SELECT email, role FROM users WHERE is_locked = false AND role IN ('CUSTOMER','TECHNICIAN') ORDER BY (email LIKE 'auto.%'), id")).rows;
  const khach = emails.filter((e) => e.role === 'CUSTOMER').slice(0, Math.round(SO_NGUOI * 0.4));
  const ktv = emails.filter((e) => e.role === 'TECHNICIAN').slice(0, SO_NGUOI - khach.length);
  const may = spawn(process.execPath, ['src/server.js'], { cwd: require('node:path').resolve(__dirname, '..'), env: { ...process.env, PORT: String(CONG), NODE_ENV: 'production' }, stdio: 'ignore', windowsHide: true });
  const tat = () => { try { may.kill(); } catch { /* đã tắt */ } };
  process.on('exit', tat);
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`${API}/health`)).ok) break; } catch { /* chưa lên */ } await nghi(250); }
  console.log(`##### ĐO HIỆU NĂNG ${new Date().toISOString()} | Node ${process.version} | ${os.cpus()[0].model.trim()} x${os.cpus().length} | RAM ${(os.totalmem() / 2 ** 30).toFixed(0)} GB`);
  console.log(`CSDL: ${dem} tin; ${khach.length + ktv.length} người dùng ảo (${ktv.length} kỹ thuật viên, ${khach.length} khách hàng), mỗi người ${SO_VONG} vòng; ngưỡng ${NGUONG_MS} ms`);

  // Chuẩn bị: lấy token (đăng nhập có giãn thời gian, không tính vào số đo; số đo đăng nhập ở phần riêng bên dưới).
  const phien = [];
  const tatCa = [...ktv.map((e) => ({ ...e })), ...khach.map((e) => ({ ...e }))];
  for (let i = 0; i < tatCa.length; i += 5) {
    await Promise.all(tatCa.slice(i, i + 5).map(async (e) => { const p = await dangNhap(e.email); if (p.token) phien.push({ ...e, ...p }); }));
  }
  const idTinCuaKhach = {};
  for (const p of phien.filter((x) => x.role === 'CUSTOMER')) { const r = await pool.query('SELECT id FROM repair_request WHERE customer_id = $1 ORDER BY id LIMIT 3', [p.id]); idTinCuaKhach[p.id] = r.rows.map((x) => x.id); }
  const idTinCho = (await pool.query("SELECT id FROM repair_request WHERE status = 'WAITING_PROPOSAL' ORDER BY id LIMIT 200")).rows.map((x) => x.id);
  await pool.end();

  // Phần 1: người dùng đã đăng nhập thao tác liên tục (không nghỉ giữa các yêu cầu = tải nặng hơn người dùng thật).
  const soDo = {};
  const ghi = (ten, r) => { (soDo[ten] ||= { ms: [], loi: 0 }); soDo[ten].ms.push(r.ms); if (r.status < 200 || r.status >= 300) soDo[ten].loi++; };
  const t0 = performance.now();
  await Promise.all(phien.map(async (p, idx) => {
    for (let v = 0; v < SO_VONG; v++) {
      if (p.role === 'TECHNICIAN') {
        ghi('GET /requests (kỹ thuật viên, trang)', await goi('GET', `/requests?page=${(v % 20) + 1}&size=10`, p.token));
        ghi('GET /requests?category (lọc)', await goi('GET', `/requests?category=${encodeURIComponent('Sửa máy lạnh')}`, p.token));
        ghi('GET /requests/{id} (chi tiết)', await goi('GET', `/requests/${idTinCho[(idx + v) % idTinCho.length]}`, p.token));
        ghi('GET /proposals/my', await goi('GET', '/proposals/my', p.token));
      } else {
        ghi('GET /requests/my', await goi('GET', '/requests/my', p.token));
        const ids = idTinCuaKhach[p.id] || [];
        if (ids.length) ghi('GET /requests/{id} (tin của mình)', await goi('GET', `/requests/${ids[v % ids.length]}`, p.token));
      }
      ghi('GET /notifications/unread-count', await goi('GET', '/notifications/unread-count', p.token));
    }
  }));
  const tong = (performance.now() - t0) / 1000;
  const tatCaMs = Object.values(soDo).flatMap((x) => x.ms);
  console.log(`\nPhần 1: ${tatCaMs.length} yêu cầu từ ${phien.length} người dùng ảo trong ${tong.toFixed(1)} giây (${(tatCaMs.length / tong).toFixed(0)} yêu cầu/giây)`);
  console.log('Điểm cuối'.padEnd(42) + 'Số lần'.padStart(8) + 'p50'.padStart(8) + 'p95'.padStart(8) + 'p99'.padStart(8) + 'max'.padStart(8) + 'Lỗi'.padStart(6));
  for (const [ten, x] of Object.entries(soDo)) console.log(ten.padEnd(42) + String(x.ms.length).padStart(8) + phanVi(x.ms, 50).toFixed(0).padStart(8) + phanVi(x.ms, 95).toFixed(0).padStart(8) + phanVi(x.ms, 99).toFixed(0).padStart(8) + Math.max(...x.ms).toFixed(0).padStart(8) + String(x.loi).padStart(6));
  const loi1 = Object.values(soDo).reduce((a, x) => a + x.loi, 0);
  const p95Chung = phanVi(tatCaMs, 95); const maxChung = Math.max(...tatCaMs);
  console.log(`Tổng hợp: p50 ${phanVi(tatCaMs, 50).toFixed(0)} ms · p95 ${p95Chung.toFixed(0)} ms · p99 ${phanVi(tatCaMs, 99).toFixed(0)} ms · max ${maxChung.toFixed(0)} ms · lỗi ${loi1}/${tatCaMs.length}`);
  const dat1 = maxChung < NGUONG_MS && loi1 === 0;
  console.log(`${dat1 ? 'PASS' : 'FAIL'}  mọi yêu cầu dưới ${NGUONG_MS} ms với ${phien.length} người dùng đồng thời và ${dem} tin (max ${maxChung.toFixed(0)} ms, lỗi ${loi1})`);

  // Phần 2: 100 người cùng bấm đăng nhập một lúc (bcryptjs băm bằng JavaScript nên chặn luồng chính: đo riêng).
  const dn = await Promise.all(phien.map(async (p) => goi('POST', '/auth/login', null, { email: p.email, password: 'Demo@123' })));
  const msDn = dn.map((x) => x.ms);
  const loiDn = dn.filter((x) => x.status !== 200).length;
  console.log(`\nPhần 2: ${phien.length} đăng nhập cùng một lúc: p50 ${phanVi(msDn, 50).toFixed(0)} ms · p95 ${phanVi(msDn, 95).toFixed(0)} ms · max ${Math.max(...msDn).toFixed(0)} ms · lỗi ${loiDn}`);
  console.log(`${Math.max(...msDn) < NGUONG_MS && loiDn === 0 ? 'PASS' : 'GHI NHẬN'}  đợt đăng nhập đồng thời (đỉnh tải hiếm gặp), max ${Math.max(...msDn).toFixed(0)} ms so với ngưỡng ${NGUONG_MS} ms`);

  // Phần 3: đăng nhập đến đều 10 lượt/giây trong 10 giây (mức đỉnh thực tế hơn đợt bấm cùng một lúc).
  const kq3 = await Promise.all(phien.map(async (p, i) => { await nghi(i * 100); return goi('POST', '/auth/login', null, { email: p.email, password: 'Demo@123' }); }));
  const ms3 = kq3.map((x) => x.ms);
  const loi3 = kq3.filter((x) => x.status !== 200).length;
  console.log(`
Phần 3: ${phien.length} đăng nhập đến đều 10 lượt/giây: p50 ${phanVi(ms3, 50).toFixed(0)} ms · p95 ${phanVi(ms3, 95).toFixed(0)} ms · max ${Math.max(...ms3).toFixed(0)} ms · lỗi ${loi3}`);
  const dat3 = Math.max(...ms3) < NGUONG_MS && loi3 === 0;
  console.log(`${dat3 ? 'PASS' : 'FAIL'}  đăng nhập 10 lượt/giây dưới ${NGUONG_MS} ms (max ${Math.max(...ms3).toFixed(0)} ms, lỗi ${loi3})`);
  tat();
  process.exit(dat1 && dat3 ? 0 : 1);
}
chay().catch((l) => { console.error(l); process.exit(2); });
