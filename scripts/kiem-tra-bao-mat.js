// Kiểm tra bảo mật bằng tay có tự động hóa: kiểm soát truy cập theo chủ sở hữu (OWASP A01), cấu hình (A02), băm mật khẩu (A04),
// tiêm mã (A05), xác thực (A07), thông báo lỗi và nhật ký. Mỗi dòng PASS/FAIL tương ứng một bước trong docs/checklist-bao-mat.md.
//
// Cách chạy (CSDL phát triển đã nạp dữ liệu mẫu: npm run migrate && npm run seed):
//   node scripts/kiem-tra-bao-mat.js                 chạy tất cả
//   node scripts/kiem-tra-bao-mat.js --giu-tin-xss   giữ lại tin thử XSS để mở trên giao diện (xóa tay sau khi xem)
//   node scripts/kiem-tra-bao-mat.js --ghi=ketqua.txt  ghi thêm kết quả ra tệp
//   node scripts/kiem-tra-bao-mat.js --phan=TC-34,LOG  chỉ chạy các phần nêu tên (TC-34 TC-35 TC-36 TC-37 TC-38 LOG); LOG kiểm nhật ký của các phần đã chạy
// Script tự bật hai backend riêng (cổng 3101 bình thường, cổng 3102 trỏ CSDL đã chết) nên không đụng backend đang chạy ở cổng 3000.
// Dữ liệu đụng tới (khóa/mở khóa ktv3, tài khoản thử, tin thử) được trả về như cũ khi script kết thúc.
// Không phải bộ test của dự án (npm test): script này gọi HTTP thật tới server thật và sửa dữ liệu phát triển.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ quiet: true });
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const GOC = path.resolve(__dirname, '..');
const CONG_BINH_THUONG = 3101;
const CONG_CSDL_CHET = 3102;
const MAT_KHAU_DEMO = 'Demo@123';
const thamSo = process.argv.slice(2);
const giuTinXss = thamSo.includes('--giu-tin-xss');
const tepGhi = (thamSo.find((t) => t.startsWith('--ghi=')) || '').slice(6);
const phanChon = (thamSo.find((t) => t.startsWith('--phan=')) || '').slice(7).split(',').filter(Boolean);
const chon = (ten) => phanChon.length === 0 || phanChon.includes(ten);

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  console.error('Thiếu DATABASE_URL hoặc JWT_SECRET trong .env (xem .env.example).');
  process.exit(2);
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const sql = async (cauLenh, tham = []) => (await pool.query(cauLenh, tham)).rows;
const mot = async (cauLenh, tham = []) => (await sql(cauLenh, tham))[0];
const nghi = (ms) => new Promise((r) => setTimeout(r, ms));

const dong = [];
const in_ = (s = '') => { dong.push(s); console.log(s); };
let dat = 0;
let hong = 0;
const ghi = (ten, ok, chiTiet = '') => { if (ok) dat++; else hong++; in_(`${ok ? 'PASS' : 'FAIL'}  ${ten}${ok ? '' : `   <-- ${String(chiTiet).slice(0, 300)}`}`); };

const cacMay = [];
function batBackend(cong, bienMoiTruong, tepNhatKy) {
  const may = spawn(process.execPath, ['src/server.js'], { cwd: GOC, env: { ...process.env, PORT: String(cong), NODE_ENV: 'production', ...bienMoiTruong }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  const nhatKy = [];
  may.stdout.on('data', (d) => nhatKy.push(String(d)));
  may.stderr.on('data', (d) => nhatKy.push(String(d)));
  cacMay.push(may);
  return { may, laySach: () => nhatKy.join('') };
}
function tatBackend() {
  for (const may of cacMay) { try { may.kill(); } catch { /* đã tắt */ } }
}

async function goi(goc, method, duongDan, token, than, thoRaw) {
  const phanHoi = await fetch(`${goc}${duongDan}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: thoRaw ?? (than === undefined ? undefined : JSON.stringify(than)) });
  const txt = await phanHoi.text();
  let body = null;
  try { body = JSON.parse(txt); } catch { /* không phải JSON */ }
  return { status: phanHoi.status, body, txt, headers: phanHoi.headers };
}
const tom = (r) => `HTTP ${r.status} ${r.body?.code ?? ''} ${r.body?.message ?? r.txt.slice(0, 80)}`;

async function chay() {
  const sach = batBackend(CONG_BINH_THUONG, {});
  const hong_ = batBackend(CONG_CSDL_CHET, { DATABASE_URL: 'postgres://nhom03:nhom03@127.0.0.1:55999/suachua_dev' });
  const API = `http://localhost:${CONG_BINH_THUONG}/api`;
  const API_HONG = `http://localhost:${CONG_CSDL_CHET}/api`;
  for (const url of [API, API_HONG]) {
    for (let i = 0; i < 60; i++) { try { if ((await fetch(`${url}/health`)).ok) break; } catch { /* chưa lên */ } await nghi(250); }
  }
  const dangNhap = async (email) => { const r = await goi(API, 'POST', '/auth/login', null, { email, password: MAT_KHAU_DEMO }); if (!r.body?.data?.token) throw new Error(`Không đăng nhập được ${email} (đã chạy npm run seed chưa?): ${tom(r)}`); return { token: r.body.data.token, user: r.body.data.user, txt: r.txt }; };
  const khach1 = await dangNhap('khach1@demo.vn');
  const khach2 = await dangNhap('khach2@demo.vn');
  const ktv1 = await dangNhap('ktv1@demo.vn');
  const ktv2 = await dangNhap('ktv2@demo.vn');
  const ktv3 = await dangNhap('ktv3@demo.vn');
  const admin = await dangNhap('admin@demo.vn');
  const tinCho = async (idKhach) => (await mot("SELECT id FROM repair_request WHERE customer_id = $1 AND status = 'WAITING_PROPOSAL' ORDER BY id LIMIT 1", [idKhach])).id;
  const tinKhach1 = await tinCho(khach1.user.id);
  const tinKhach2 = await tinCho(khach2.user.id);
  const tinXongKhach2 = (await mot("SELECT id FROM repair_request WHERE customer_id = $1 AND status = 'COMPLETED' ORDER BY id LIMIT 1", [khach2.user.id])).id;
  const dxCuaKtv1 = (await mot("SELECT id FROM proposal WHERE technician_id = $1 AND status = 'PENDING' ORDER BY id LIMIT 1", [ktv1.user.id])).id;
  const dxTrenTinKhach1 = (await mot("SELECT id FROM proposal WHERE request_id = $1 AND status = 'PENDING' ORDER BY id LIMIT 1", [tinKhach1])).id;
  const tbCuaKhach1 = (await mot('SELECT id FROM notification WHERE user_id = $1 ORDER BY id LIMIT 1', [khach1.user.id])).id;
  const tieuDeGoc = (await mot('SELECT title FROM repair_request WHERE id = $1', [tinKhach2])).title;
  const git = (...tham) => new Promise((xong) => { const c = spawn('git', ['-C', GOC, ...tham]); let o = ''; c.stdout.on('data', (d) => { o += d; }); c.on('error', () => xong('')); c.on('close', () => xong(o.trim())); });
  const commit = `${(await git('rev-parse', '--short', 'HEAD')) || '?'}${(await git('status', '--porcelain')) ? ' + thay đổi chưa commit' : ''}`;
  in_(`##### KIỂM TRA BẢO MẬT ${new Date().toISOString()} | commit ${commit} | Node ${process.version} | backend riêng cổng ${CONG_BINH_THUONG} (NODE_ENV=production)`);
  in_(`Dữ liệu thử: khach1 (id ${khach1.user.id}) có tin ${tinKhach1}; khach2 (id ${khach2.user.id}) có tin ${tinKhach2} và tin đã hoàn thành ${tinXongKhach2}; đề xuất của ktv1: ${dxCuaKtv1}; đề xuất trên tin của khach1: ${dxTrenTinKhach1}; thông báo của khach1: ${tbCuaKhach1}`);
  let r;

  if (chon('TC-34')) {
  in_('\n### TC-34  A01:2025 KIỂM SOÁT TRUY CẬP THEO CHỦ SỞ HỮU');
  r = await goi(API, 'GET', `/requests/${tinKhach2}`, khach1.token); in_(`khach1 xem tin của khach2 (GET /requests/${tinKhach2}) -> ${tom(r)}`);
  ghi('khách A xem chi tiết tin của khách B -> 403 NOT_OWNER', r.status === 403 && r.body.code === 'NOT_OWNER');
  r = await goi(API, 'PATCH', `/requests/${tinKhach2}`, khach1.token, { title: 'Bị sửa trái phép' }); in_(`khach1 SỬA tin của khach2 -> ${tom(r)}`);
  ghi('khách A SỬA tin của khách B -> 403 NOT_OWNER', r.status === 403 && r.body.code === 'NOT_OWNER');
  ghi('  tiêu đề tin của B trong CSDL không đổi', (await mot('SELECT title FROM repair_request WHERE id = $1', [tinKhach2])).title === tieuDeGoc);
  r = await goi(API, 'PATCH', `/requests/${tinKhach2}/close`, khach1.token); in_(`khach1 ĐÓNG tin của khach2 -> ${tom(r)}`);
  ghi('khách A ĐÓNG tin của khách B -> 403', r.status === 403);
  ghi('  trạng thái tin của B vẫn WAITING_PROPOSAL', (await mot('SELECT status FROM repair_request WHERE id = $1', [tinKhach2])).status === 'WAITING_PROPOSAL');
  r = await goi(API, 'GET', `/proposals/request/${tinKhach2}`, khach1.token); in_(`khach1 xem đề xuất của tin khach2 -> ${tom(r)}`);
  ghi('khách A xem đề xuất của tin khách B -> 403 (BR09)', r.status === 403);
  r = await goi(API, 'PATCH', `/proposals/${dxTrenTinKhach1}/accept`, khach2.token); in_(`khach2 CHẤP NHẬN đề xuất trên tin của khach1 -> ${tom(r)}`);
  ghi('khách B chấp nhận đề xuất trên tin của khách A -> 403 (BR09)', r.status === 403);
  ghi('  đề xuất đó vẫn PENDING', (await mot('SELECT status FROM proposal WHERE id = $1', [dxTrenTinKhach1])).status === 'PENDING');
  r = await goi(API, 'PATCH', `/proposals/${dxCuaKtv1}`, ktv2.token, { price: 1 }); in_(`ktv2 SỬA đề xuất của ktv1 -> ${tom(r)}`);
  ghi('kỹ thuật viên B sửa đề xuất của kỹ thuật viên A -> 403', r.status === 403);
  r = await goi(API, 'PATCH', `/proposals/${dxCuaKtv1}/close`, ktv2.token); in_(`ktv2 RÚT đề xuất của ktv1 -> ${tom(r)}`);
  ghi('kỹ thuật viên B rút đề xuất của A -> 403', r.status === 403);
  r = await goi(API, 'GET', `/proposals/${dxCuaKtv1}`, ktv2.token); in_(`ktv2 xem chi tiết đề xuất của ktv1 -> ${tom(r)}`);
  ghi('kỹ thuật viên B xem đề xuất của A -> 403', r.status === 403);
  r = await goi(API, 'PATCH', `/notifications/${tbCuaKhach1}/read`, khach2.token); in_(`khach2 đánh dấu ĐÃ ĐỌC thông báo của khach1 -> ${tom(r)}`);
  ghi('người dùng B đánh dấu đã đọc thông báo của A -> 403 NOT_OWNER', r.status === 403 && r.body.code === 'NOT_OWNER');
  r = await goi(API, 'POST', '/reviews', khach1.token, { requestId: tinXongKhach2, rating: 1, comment: 'đánh giá trái phép' }); in_(`khach1 ĐÁNH GIÁ công việc của khach2 (không tham gia) -> ${tom(r)}`);
  ghi('người không tham gia đánh giá công việc -> 403 NOT_OWNER (BR13)', r.status === 403 && r.body.code === 'NOT_OWNER');
  r = await goi(API, 'GET', '/admin/users', khach1.token); in_(`khach1 gọi API quản trị GET /admin/users -> ${tom(r)}`);
  ghi('khách hàng gọi API quản trị -> 403 FORBIDDEN (BR01)', r.status === 403 && r.body.code === 'FORBIDDEN');
  r = await goi(API, 'PATCH', `/admin/users/${khach2.user.id}/lock`, ktv1.token); in_(`ktv1 KHÓA tài khoản khach2 -> ${tom(r)}`);
  ghi('kỹ thuật viên khóa tài khoản người khác -> 403', r.status === 403);
  r = await goi(API, 'POST', '/requests', ktv1.token, { title: 't', description: 'd', category: 'Khác', location: 'l', preferredTime: new Date(Date.now() + 864e5).toISOString() }); in_(`ktv1 ĐĂNG tin (chức năng của khách hàng) -> ${tom(r)}`);
  ghi('kỹ thuật viên đăng tin sửa chữa -> 403 (BR01)', r.status === 403);
  const tenGoc = (await mot('SELECT full_name FROM users WHERE id = $1', [khach1.user.id])).full_name;
  r = await goi(API, 'PATCH', '/users/me', khach1.token, { fullName: 'Tên mới', role: 'ADMIN' });
  const vaiTro = (await mot('SELECT role FROM users WHERE id = $1', [khach1.user.id])).role;
  in_(`khach1 gửi kèm role=ADMIN khi sửa hồ sơ -> ${tom(r)}; role trong CSDL: ${vaiTro}`);
  await sql('UPDATE users SET full_name = $1 WHERE id = $2', [tenGoc, khach1.user.id]);
  ghi('leo thang đặc quyền qua trường role khi sửa hồ sơ: bị bỏ qua, role vẫn CUSTOMER', vaiTro === 'CUSTOMER');
  r = await goi(API, 'POST', '/auth/register', null, { email: 'tam-leo-thang@demo.vn', password: MAT_KHAU_DEMO, fullName: 'Tạm', phone: '0901234567', role: 'ADMIN' }); in_(`đăng ký với role=ADMIN -> ${tom(r)}`);
  ghi('tự đăng ký tài khoản quản trị viên -> 400 (BR01)', r.status === 400);
  await sql("DELETE FROM users WHERE email = 'tam-leo-thang@demo.vn'");

  }
  if (chon('TC-35')) {
  in_('\n### TC-35  A02:2025 CẤU HÌNH SAI (lỗi, CORS, tiêu đề phản hồi)');
  const kiemLo = (ten, x) => { const lo = /(\bat\s+\S+\.js|node_modules|stack|ECONN|postgres:\/\/|password|SELECT |INSERT |UPDATE |relation |column |pg_|syntax error|constraint|[A-Z]:\\|\/home\/|\/app\/)/i.exec(x.txt); ghi(`${ten}: phản hồi không chứa vết ngăn xếp, tên bảng/cột, SQL hay chuỗi kết nối`, !lo, lo?.[0]); };
  r = await goi(API, 'POST', '/auth/login', null, undefined, '{"email": "a@b.vn", "password": '); in_(`JSON hỏng -> ${tom(r)} | ${r.txt}`); kiemLo('JSON hỏng', r);
  ghi('JSON hỏng -> 400', r.status === 400);
  r = await goi(API, 'POST', '/auth/login', null, undefined, 'khong phai json {{{'); in_(`thân không phải JSON -> ${tom(r)}`); kiemLo('thân rác', r);
  r = await goi(API, 'GET', '/requests/abc', khach1.token); in_(`mã sai kiểu (GET /requests/abc) -> ${tom(r)}`); kiemLo('mã sai kiểu', r);
  r = await goi(API, 'GET', '/duong-dan-khong-ton-tai'); in_(`đường dẫn không tồn tại -> ${tom(r)} | ${r.txt}`); kiemLo('đường dẫn lạ', r);
  r = await goi(API, 'POST', '/requests', khach1.token, { title: 'x'.repeat(120000) }); in_(`thân hơn 100 KB -> ${tom(r)}`); kiemLo('thân quá lớn', r);
  r = await goi(API_HONG, 'POST', '/auth/login', null, { email: 'khach1@demo.vn', password: MAT_KHAU_DEMO }); in_(`CSDL KHÔNG kết nối được (backend cổng ${CONG_CSDL_CHET}): đăng nhập -> ${tom(r)} | ${r.txt}`);
  ghi('CSDL chết: trả 500 INTERNAL_ERROR với thông điệp chung', r.status === 500 && r.body?.code === 'INTERNAL_ERROR'); kiemLo('CSDL chết', r);
  const tenMay = (await fetch(`${API}/health`)).headers.get('x-powered-by'); in_(`tiêu đề X-Powered-By của phản hồi: ${tenMay}`);
  ghi('phản hồi không còn tiêu đề X-Powered-By (không lộ Express)', tenMay === null);
  const cors1 = await fetch(`${API}/health`, { headers: { Origin: 'http://evil.example' } }); in_(`Origin http://evil.example -> Access-Control-Allow-Origin = ${cors1.headers.get('access-control-allow-origin')}`);
  ghi('nguồn lạ: header luôn là địa chỉ giao diện đã cấu hình (CLIENT_URL), không phản chiếu nguồn lạ, không phải * -> trình duyệt chặn', cors1.headers.get('access-control-allow-origin') === (process.env.CLIENT_URL || 'http://localhost:5173'));
  const pre = await fetch(`${API}/requests`, { method: 'OPTIONS', headers: { Origin: 'http://evil.example', 'Access-Control-Request-Method': 'GET' } }); in_(`preflight OPTIONS từ evil.example -> HTTP ${pre.status}, Access-Control-Allow-Origin = ${pre.headers.get('access-control-allow-origin')}`);
  ghi('preflight từ nguồn lạ cũng không được phản chiếu và không phải *', pre.headers.get('access-control-allow-origin') !== 'http://evil.example' && pre.headers.get('access-control-allow-origin') !== '*');

  }
  if (chon('TC-36')) {
  in_('\n### TC-36  A04:2025 MẬT MÃ HỌC (mật khẩu đã băm)');
  const th = await mot("SELECT count(*)::int AS tong, count(*) FILTER (WHERE password_hash ~ '^[$]2[aby][$]10[$][./A-Za-z0-9]{53}$')::int AS bcrypt, count(*) FILTER (WHERE password_hash LIKE '%' || $1 || '%')::int AS doc FROM users", [MAT_KHAU_DEMO]);
  in_(`CSDL: ${th.tong} tài khoản; ${th.bcrypt} chuỗi băm bcrypt dạng $2b$10$...; ${th.doc} dòng chứa mật khẩu đọc được`);
  ghi('mọi mật khẩu trong CSDL là chuỗi băm bcrypt (không đọc được)', th.tong === th.bcrypt && th.tong > 0 && th.doc === 0);
  const mau = (await mot('SELECT left(password_hash, 29) AS dau FROM users WHERE id = $1', [khach1.user.id])).dau;
  in_(`mẫu một dòng (29 ký tự đầu của password_hash, user id ${khach1.user.id}): ${mau}...`);
  const dsPhanHoi = [['POST /auth/login', khach1.txt]];
  for (const [ten, duong, token] of [['GET /auth/me', '/auth/me', khach1.token], ['GET /users/:id', `/users/${ktv1.user.id}`, khach1.token], ['GET /admin/users', '/admin/users', admin.token], ['GET /requests (kỹ thuật viên)', '/requests', ktv1.token], ['GET /requests/my', '/requests/my', khach1.token], ['GET /proposals/my', '/proposals/my', ktv1.token], ['GET /notifications', '/notifications', khach1.token], ['GET /reviews/user/:id', `/reviews/user/${ktv1.user.id}`, khach1.token]]) {
    dsPhanHoi.push([ten, (await goi(API, 'GET', duong, token)).txt]);
  }
  for (const [ten, txt] of dsPhanHoi) ghi(`${ten}: phản hồi không chứa mật khẩu hay chuỗi băm`, !/password|\$2[aby]\$|hash/i.test(txt));
  const emailThu = `bam-${Date.now()}@demo.vn`;
  r = await goi(API, 'POST', '/auth/register', null, { email: emailThu, password: MAT_KHAU_DEMO, fullName: 'Kiểm Thử Băm', phone: '0912345678', role: 'CUSTOMER' }); in_(`đăng ký tài khoản thử -> ${tom(r)}`);
  const bamMoi = (await mot('SELECT password_hash FROM users WHERE email = $1', [emailThu])).password_hash;
  const bamKhach1 = (await mot('SELECT password_hash FROM users WHERE id = $1', [khach1.user.id])).password_hash;
  ghi('cùng mật khẩu nhưng tài khoản đăng ký mới có chuỗi băm KHÁC tài khoản demo (muối riêng mỗi lần băm)', bamMoi.startsWith('$2b$10$') && bamMoi !== bamKhach1);
  await sql('DELETE FROM users WHERE email = $1', [emailThu]);
  in_(`ghi chú: tài khoản demo dùng CHUNG một chuỗi băm vì seed băm một lần cho mọi tài khoản; tài khoản đăng ký thật không bị vậy`);

  }
  if (chon('TC-37')) {
  in_('\n### TC-37  A05:2025 TIÊM MÃ (SQL và XSS)');
  const tongGoc = (await goi(API, 'GET', '/requests', ktv1.token)).body?.meta?.totalElements;
  in_(`tổng tin đang chờ theo API khi KHÔNG lọc: ${tongGoc}`);
  const soBangTruoc = (await mot("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'")).n;
  const soNguoiTruoc = (await mot('SELECT count(*)::int AS n FROM users')).n;
  r = await goi(API, 'GET', `/requests?category=${encodeURIComponent("' OR 1=1 --")}`, ktv1.token); const nSqli = r.body?.meta?.totalElements; in_(`lọc category = ' OR 1=1 -- -> ${tom(r)} | số bản ghi trả về: ${nSqli}`);
  ghi("chuỗi ' OR 1=1 -- ở trường lọc KHÔNG trả toàn bộ bản ghi (được coi là chữ thường)", r.status === 200 && nSqli === 0 && tongGoc > 0);
  r = await goi(API, 'GET', `/requests?location=${encodeURIComponent("'; DROP TABLE users; --")}`, ktv1.token); in_(`lọc location = '; DROP TABLE users; -- -> ${tom(r)}`);
  ghi('chuỗi DROP TABLE ở trường lọc: xử lý bình thường (200), bảng users còn nguyên', r.status === 200 && (await mot('SELECT count(*)::int AS n FROM users')).n === soNguoiTruoc);
  r = await goi(API, 'POST', '/auth/login', null, { email: "admin@demo.vn' OR '1'='1", password: "x' OR '1'='1" }); in_(`đăng nhập email "admin@demo.vn' OR '1'='1" -> ${tom(r)}`);
  ghi('tiêm SQL vào đăng nhập (email) bị từ chối, không có token', r.status >= 400 && r.status < 500 && !r.body?.data?.token);
  r = await goi(API, 'POST', '/auth/login', null, { email: 'khach1@demo.vn', password: "' OR '1'='1" }); in_(`đăng nhập email thật + mật khẩu "' OR '1'='1" -> ${tom(r)}`);
  ghi('tiêm SQL vào mật khẩu: 401, không đăng nhập được', r.status === 401 && !r.body?.data?.token);
  const xss = '<script>alert(1)</script><img src=x onerror=alert(2)>';
  r = await goi(API, 'POST', '/requests', khach1.token, { title: `Thử XSS ${xss}`.slice(0, 100), description: `Mô tả ${xss}; '; DROP TABLE users; --`, category: 'Điện lạnh', location: 'Quận 1, TP.HCM', preferredTime: new Date(Date.now() + 2 * 864e5).toISOString() });
  in_(`đăng tin chứa thẻ script và DROP TABLE -> ${tom(r)}`);
  const idTin = r.body?.data?.id;
  ghi('tin chứa mã độc và SQL được lưu NGUYÊN VĂN như văn bản (201)', r.status === 201 && !!idTin);
  if (idTin) {
    const luu = (await mot('SELECT description FROM repair_request WHERE id = $1', [idTin])).description;
    ghi('CSDL lưu đúng chuỗi gốc (tham số hóa, không bị diễn giải)', luu.includes('<script>alert(1)</script>') && luu.includes('DROP TABLE users'));
    ghi('bảng users và số bảng trong CSDL không đổi sau mọi lần tiêm', (await mot('SELECT count(*)::int AS n FROM users')).n === soNguoiTruoc && (await mot("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'")).n === soBangTruoc);
    const chiTiet = await goi(API, 'GET', `/requests/${idTin}`, khach1.token);
    in_(`Content-Type của phản hồi chi tiết tin: ${chiTiet.headers.get('content-type')}`);
    ghi('API trả lại đúng chuỗi, Content-Type là application/json (không phải HTML)', chiTiet.status === 200 && chiTiet.body.data.description.includes('<script>') && /application\/json/.test(chiTiet.headers.get('content-type')));
    if (giuTinXss) in_(`Đã giữ tin thử XSS id ${idTin} để mở trên giao diện (#/customer/requests/${idTin}, đăng nhập khach1@demo.vn); script phải hiện thành chữ. Xóa sau khi xem: DELETE FROM repair_request WHERE id = ${idTin};`);
    else await sql('DELETE FROM repair_request WHERE id = $1', [idTin]);
  }

  }
  if (chon('TC-38')) {
  in_('\n### TC-38  A07:2025 LỖI XÁC THỰC (token, đăng nhập, khóa tài khoản)');
  r = await goi(API, 'GET', '/auth/me'); in_(`không gửi token -> ${tom(r)}`);
  ghi('không token -> 401 UNAUTHORIZED', r.status === 401 && r.body.code === 'UNAUTHORIZED');
  const [h, p, s] = khach1.token.split('.');
  r = await goi(API, 'GET', '/auth/me', `${h}.${p}.${s.slice(0, -1)}${s.slice(-1) === 'A' ? 'B' : 'A'}`); in_(`sửa 1 ký tự ở CHỮ KÝ -> ${tom(r)}`);
  ghi('token sửa một ký tự ở chữ ký -> 401', r.status === 401);
  const payloadSua = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(p, 'base64url').toString()), role: 'ADMIN', userId: admin.user.id })).toString('base64url');
  r = await goi(API, 'GET', '/admin/users', `${h}.${payloadSua}.${s}`); in_(`sửa PAYLOAD thành role=ADMIN, giữ chữ ký cũ -> ${tom(r)}`);
  ghi('token sửa payload (role=ADMIN) giữ chữ ký cũ -> 401', r.status === 401);
  r = await goi(API, 'GET', '/auth/me', jwt.sign({ userId: khach1.user.id, role: 'CUSTOMER' }, process.env.JWT_SECRET, { expiresIn: -10 })); in_(`token đã hết hạn (exp trong quá khứ, ký đúng khóa) -> ${tom(r)}`);
  ghi('token hết hạn -> 401', r.status === 401);
  r = await goi(API, 'GET', '/admin/users', jwt.sign({ userId: admin.user.id, role: 'ADMIN' }, 'khoa-khac-hoan-toan-khong-phai-cua-he-thong-1234567890')); in_(`token ký bằng KHÓA KHÁC (giả quản trị viên) -> ${tom(r)}`);
  ghi('token giả mạo ký bằng khóa khác -> 401', r.status === 401);
  const algNone = `${Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ userId: admin.user.id, role: 'ADMIN' })).toString('base64url')}.`;
  r = await goi(API, 'GET', '/admin/users', algNone); in_(`token alg=none không chữ ký, giả quản trị viên -> ${tom(r)}`);
  ghi('token alg=none -> 401', r.status === 401);
  r = await goi(API, 'GET', '/auth/me', jwt.sign({ userId: khach1.user.id, role: 'CUSTOMER' }, process.env.JWT_SECRET, { algorithm: 'HS512'})); in_(`token HS512 ký ĐÚNG khóa (khác thuật toán HS256 của hệ thống) -> ${tom(r)}`);
  ghi('token HS512 -> 401: hệ thống ghim HS256', r.status === 401);
  const noiDung = jwt.decode(khach1.token);
  in_(`payload token thật: ${JSON.stringify(noiDung)} | alg: ${JSON.parse(Buffer.from(h, 'base64url').toString()).alg} | hạn: ${noiDung.exp - noiDung.iat} giây`);
  ghi('payload chỉ gồm id, vai trò, thời điểm cấp và hạn (không email, số điện thoại, tên)', Object.keys(noiDung).sort().join(',') === 'exp,iat,role,userId');
  const sai = await goi(API, 'POST', '/auth/login', null, { email: 'khach1@demo.vn', password: 'SaiMatKhau' });
  const khongCo = await goi(API, 'POST', '/auth/login', null, { email: 'khong-ton-tai@demo.vn', password: 'SaiMatKhau' });
  in_(`đăng nhập sai mật khẩu -> ${tom(sai)}; email không tồn tại -> ${tom(khongCo)}`);
  ghi('sai mật khẩu và sai email cho CÙNG một thông điệp (không lộ email nào tồn tại)', sai.status === 401 && khongCo.status === 401 && sai.body.message === khongCo.body.message);
  const trongUrl = await fetch(`${API}/auth/me?token=${khach1.token}`); in_(`token đặt trong query string (?token=...) -> HTTP ${trongUrl.status}`);
  ghi('token trong URL không được chấp nhận (chỉ nhận qua header Authorization)', trongUrl.status === 401);
  const thanTrongUrl = await trongUrl.text();
  in_(`phản hồi lỗi có chứa lại token từ URL không: ${thanTrongUrl.includes(khach1.token) ? 'CÓ' : 'không'}; trường path = ${JSON.parse(thanTrongUrl).path}`);
  ghi('phản hồi lỗi không phản chiếu lại chuỗi truy vấn (token trong URL không bị trả ngược)', !thanTrongUrl.includes(khach1.token) && JSON.parse(thanTrongUrl).path === '/api/auth/me');
  r = await goi(API, 'POST', '/auth/register', null, { email: 'yeu@demo.vn', password: '123', fullName: 'Yếu', phone: '0912345678', role: 'CUSTOMER' }); in_(`đăng ký mật khẩu "123" -> ${tom(r)}`);
  ghi('mật khẩu quá ngắn bị từ chối (400)', r.status === 400); await sql("DELETE FROM users WHERE email = 'yeu@demo.vn'");
  r = await goi(API, 'POST', '/auth/register', null, { email: 'khach1@demo.vn', password: MAT_KHAU_DEMO, fullName: 'Trùng', phone: '0912345678', role: 'CUSTOMER' }); in_(`đăng ký trùng email -> ${tom(r)}`);
  ghi('đăng ký trùng email bị từ chối (409)', r.status === 409);
  r = await goi(API, 'POST', '/auth/login', null, { email: 'bikhoa@demo.vn', password: MAT_KHAU_DEMO }); in_(`đăng nhập tài khoản đã bị khóa (đúng mật khẩu) -> ${tom(r)}`);
  ghi('tài khoản bị khóa không đăng nhập được -> 403 ACCOUNT_LOCKED', r.status === 403 && r.body.code === 'ACCOUNT_LOCKED');
  try {
    r = await goi(API, 'PATCH', `/admin/users/${ktv3.user.id}/lock`, admin.token); in_(`admin khóa ktv3 -> ${tom(r)}`);
    const sauKhoa = await goi(API, 'GET', '/auth/me', ktv3.token); in_(`ktv3 dùng token CŨ (chưa hết hạn) sau khi bị khóa -> ${tom(sauKhoa)}`);
    ghi('khóa tài khoản có hiệu lực NGAY với token đang dùng (403), không chờ token hết hạn (BR02)', sauKhoa.status === 403 && sauKhoa.body.code === 'ACCOUNT_LOCKED');
  } finally {
    r = await goi(API, 'PATCH', `/admin/users/${ktv3.user.id}/unlock`, admin.token); in_(`admin mở khóa ktv3 -> ${tom(r)}`);
  }
  ghi('mở khóa xong ktv3 dùng lại được', (await goi(API, 'GET', '/auth/me', ktv3.token)).status === 200);
  let coGioiHan = false;
  for (let i = 0; i < 12; i++) { const x = await goi(API, 'POST', '/auth/login', null, { email: 'khach1@demo.vn', password: `sai-${i}` }); if (x.status === 429) coGioiHan = true; }
  const saiXong = await goi(API, 'POST', '/auth/login', null, { email: 'khach1@demo.vn', password: MAT_KHAU_DEMO });
  in_(`ghi nhận (OBS-01): 12 lần sai liên tiếp rồi đăng nhập đúng -> ${tom(saiXong)}; có trả 429 lần nào không: ${coGioiHan ? 'có' : 'không'} (hệ thống không giới hạn số lần thử; xem quyết định ở docs/checklist-bao-mat.md)`);

  }
  if (chon('LOG')) {
  in_('\n### M6  NHẬT KÝ KHÔNG GHI SECRET VÀ DỮ LIỆU CÁ NHÂN');
  await nghi(500);
  const log1 = sach.laySach();
  const log2 = hong_.laySach();
  in_(`nhật ký backend cổng ${CONG_BINH_THUONG} (gồm đăng nhập đúng/sai, token giả, JSON hỏng): ${log1.split(/\r?\n/).filter(Boolean).length} dòng`);
  in_(log1.split(/\r?\n/).filter(Boolean).slice(0, 5).join('\n'));
  in_(`nhật ký backend cổng ${CONG_CSDL_CHET} (CSDL chết): ${log2.split(/\r?\n/).filter(Boolean).length} dòng; 4 dòng đầu:`);
  in_(log2.split(/\r?\n/).filter(Boolean).slice(0, 4).join('\n'));
  const nhay = /password|passwd|token|jwt|secret|bearer|eyJ|postgres:\/\/|Demo@123|SaiMatKhau|0[0-9]{9}|\+84[0-9]{9}|@demo\.vn|@y\.vn|@b\.vn/i;
  for (const [ten, log] of [[CONG_BINH_THUONG, log1], [CONG_CSDL_CHET, log2]]) {
    const khop = log.split(/\r?\n/).filter((d) => nhay.test(d));
    ghi(`nhật ký cổng ${ten}: grep -iE "password|token|secret|jwt|bearer|postgres://|số điện thoại|email" -> ${khop.length} dòng`, khop.length === 0, khop.slice(0, 3).join(' | '));
  }
  }
}

chay()
  .catch((loi) => { hong++; in_(`LỖI KHI CHẠY: ${loi.stack || loi.message}`); })
  .finally(async () => {
    tatBackend();
    await pool.end().catch(() => {});
    in_(`\nTỔNG: ${dat} đạt, ${hong} lỗi`);
    if (tepGhi) fs.writeFileSync(tepGhi, dong.join('\n'));
    process.exit(hong ? 1 : 0);
  });
