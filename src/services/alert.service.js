// Cảnh báo và nhận định, tính lại mỗi lần xem từ số đo hệ thống, nhật ký và dữ liệu nghiệp vụ. Trạng thái xử lý được
// lưu theo khóa; khóa gồm ngày phát sinh nên sự việc của ngày mới là một cảnh báo mới (chưa xử lý).
const kho = require('../repositories/alert.repository');
const khoThongKe = require('../repositories/analytics.repository');
const dichVuHeThong = require('./system-health.service');
const { LoiUngDung } = require('../utils/error-handler');
const { docKhoangThoiGian, ngayIso, NGAY_MS } = require('../utils/khoang-thoi-gian');

const CAC_TRANG_THAI = ['NEW', 'ACKNOWLEDGED', 'RESOLVED'];
const SO_NGAY_XET = 7;
const NGUONG_DANG_NHAP_SAI = 5;
const NGUONG_BI_TU_CHOI = 5;
const NGUONG_TANG_TRUONG = 0.3;
const THU_TU_MUC = { critical: 0, warning: 1, info: 2 };

const gioVn = (d) => new Date(new Date(d).getTime() + 7 * 3600 * 1000).toISOString().slice(11, 16);
const ngayVnHien = (ngay) => `${ngay.slice(8, 10)}/${ngay.slice(5, 7)}`;
const tenNguoi = (d) => d.full_name ?? 'tài khoản không tồn tại';
const phanTram = (so) => `${so > 0 ? 'tăng' : 'giảm'} ${Math.round(Math.abs(so) * 100)}%`;

const canhBao = (key, severity, category, title, description, suggestion, occurredAt, them = {}) => ({
  key, severity, category, title, description, suggestion, occurredAt, details: [], link: null, ...them,
});

async function canhBaoBaoMat(khoang) {
  const [saiMatKhau, biKhoa, tuChoi, loi] = await Promise.all([
    kho.dangNhapSai({ ...khoang, toiThieu: NGUONG_DANG_NHAP_SAI }),
    kho.taiKhoanBiKhoaDangNhap({ ...khoang, toiThieu: 1 }),
    kho.biTuChoiQuyen({ ...khoang, toiThieu: NGUONG_BI_TU_CHOI }),
    kho.loiMayChuTheoNgay(khoang),
  ]);
  const ds = [];
  for (const d of saiMatKhau) {
    ds.push(canhBao(`dang-nhap-sai:${d.user_id ?? 0}:${d.ngay}`, d.so >= 20 ? 'critical' : 'warning', 'security',
      `${d.so} lần đăng nhập sai vào ${tenNguoi(d)}`,
      `Ngày ${ngayVnHien(d.ngay)}, từ ${gioVn(d.dau)} đến ${gioVn(d.cuoi)}.`,
      'Liên hệ chủ tài khoản; nếu không phải họ thì khóa tài khoản và đặt giới hạn đăng nhập ở reverse proxy.',
      d.cuoi, { link: { tab: 'bao-cao', report: 'errors', filters: { type: 'LOGIN_FAILED' } } }));
  }
  for (const d of biKhoa) {
    ds.push(canhBao(`tai-khoan-khoa:${d.user_id ?? 0}:${d.ngay}`, 'info', 'security',
      `Tài khoản đang bị khóa của ${tenNguoi(d)} cố đăng nhập`, `${d.so} lần trong ngày ${ngayVnHien(d.ngay)}.`,
      'Kiểm tra lý do khóa; mở khóa nếu khóa nhầm.', d.cuoi, { link: { screen: 'users', id: d.user_id } }));
  }
  for (const d of tuChoi) {
    ds.push(canhBao(`tu-choi-quyen:${d.user_id ?? 0}:${d.ngay}`, 'warning', 'activity',
      `${tenNguoi(d)} bị từ chối quyền ${d.so} lần`, `Ngày ${ngayVnHien(d.ngay)}: thao tác trên dữ liệu không thuộc quyền.`,
      'Xem các đường dẫn bị từ chối; nếu có dấu hiệu dò quyền thì khóa tài khoản.', d.cuoi,
      { details: d.cac_duong_dan, link: { tab: 'bao-cao', report: 'errors', filters: { type: 'ACCESS_DENIED' } } }));
  }
  for (const d of loi) {
    ds.push(canhBao(`loi-may-chu:${d.ngay}`, d.so >= 10 ? 'critical' : 'warning', 'error',
      `${d.so} lỗi máy chủ ngày ${ngayVnHien(d.ngay)}`, `Phản hồi 500 từ ${gioVn(d.dau)} đến ${gioVn(d.cuoi)}.`,
      'Xem log backend tại thời điểm đó và báo cáo Lỗi.', d.cuoi,
      { details: d.cac_duong_dan, link: { tab: 'bao-cao', report: 'errors', filters: { type: 'SERVER_ERROR' } } }));
  }
  return ds;
}

async function canhBaoVanHanh(bayGio) {
  const [quaHen, tin, nguoiMoi] = await Promise.all([
    kho.tinQuaHen(10),
    khoThongKe.tinMoi(docKhoangThoiGian({ range: '30d' }, bayGio)),
    khoThongKe.nguoiDungMoi(docKhoangThoiGian({ range: '30d' }, bayGio)),
  ]);
  const ds = [];
  const homNay = ngayIso(bayGio);
  if (quaHen.length > 0) {
    const tong = quaHen[0].tong;
    ds.push(canhBao(`tin-qua-hen:${homNay}`, 'warning', 'operations',
      `${tong} tin chờ đề xuất đã quá giờ hẹn`,
      `Khách hàng mong được phục vụ trước thời điểm đã qua; tin cũ nhất hẹn từ ${ngayVnHien(ngayIso(Date.parse(quaHen[0].cu_nhat)))}.`,
      'Nhắc khách hàng đổi giờ hẹn hoặc đóng tin; kiểm tra khu vực và loại dịch vụ thiếu kỹ thuật viên.',
      new Date(bayGio).toISOString(),
      { details: quaHen.map((d) => `SC-${String(d.id).padStart(3, '0')} · ${d.title}`) }));
  }
  const tongDay = (m) => m.reduce((a, b) => a + b, 0);
  for (const [ma, ten, d] of [['tin', 'Tin sửa chữa mới', tin], ['nguoi-dung', 'Người dùng mới', nguoiMoi]]) {
    const nay = tongDay(d.current);
    const truoc = tongDay(d.previous);
    if (!truoc) continue;
    const tyLe = (nay - truoc) / truoc;
    if (Math.abs(tyLe) < NGUONG_TANG_TRUONG) continue;
    ds.push(canhBao(`tang-truong-${ma}:${homNay}`, tyLe < 0 ? 'warning' : 'info', 'growth',
      `${ten} ${phanTram(tyLe)} trong 30 ngày`, `${nay} so với ${truoc} ở 30 ngày liền trước.`,
      tyLe > 0 ? 'Kiểm tra số kỹ thuật viên có đủ đáp ứng nhu cầu tăng thêm.' : 'Xem biểu đồ tăng trưởng để tìm thời điểm bắt đầu giảm.',
      new Date(bayGio).toISOString(), { link: { tab: 'tang-truong' } }));
  }
  return ds;
}

async function layCanhBao(bayGio = Date.now()) {
  const khoang = { tu: new Date(bayGio - SO_NGAY_XET * NGAY_MS).toISOString(), den: new Date(bayGio + 60000).toISOString() };
  const [heThong, baoMat, vanHanh] = await Promise.all([dichVuHeThong.tinhTrangHienTai(), canhBaoBaoMat(khoang), canhBaoVanHanh(bayGio)]);
  const homNay = ngayIso(bayGio);
  const tuHeThong = heThong.alerts.map((a) => canhBao(`${a.key}:${homNay}`, a.severity, a.category, a.title, a.description, a.suggestion, a.occurredAt, { link: { tab: 'he-thong' } }));
  const ds = [...tuHeThong, ...baoMat, ...vanHanh];
  const trangThai = await kho.trangThaiDaLuu(ds.map((a) => a.key));
  for (const a of ds) {
    const luu = trangThai.get(a.key);
    a.status = luu?.status ?? 'NEW';
    a.statusUpdatedAt = luu?.updatedAt ?? null;
    a.statusUpdatedBy = luu?.updatedBy ?? null;
  }
  ds.sort((a, b) => (a.status === 'RESOLVED') - (b.status === 'RESOLVED') || THU_TU_MUC[a.severity] - THU_TU_MUC[b.severity] || new Date(b.occurredAt) - new Date(a.occurredAt));
  return { alerts: ds, windowDays: SO_NGAY_XET, openCount: ds.filter((a) => a.status !== 'RESOLVED').length };
}

async function datTrangThai(key, status, nguoiDung) {
  if (typeof key !== 'string' || !/^[a-z0-9:-]{1,100}$/.test(key)) throw new LoiUngDung(404, 'NOT_FOUND', 'Không tìm thấy cảnh báo');
  if (!CAC_TRANG_THAI.includes(status)) {
    throw new LoiUngDung(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', [{ field: 'status', message: `status là một trong: ${CAC_TRANG_THAI.join(', ')}` }]);
  }
  const { alerts } = await layCanhBao();
  if (!alerts.some((a) => a.key === key)) throw new LoiUngDung(404, 'NOT_FOUND', 'Không tìm thấy cảnh báo');
  await kho.luuTrangThai({ key, status, userId: nguoiDung.id });
  return { key, status };
}

module.exports = { layCanhBao, datTrangThai };
