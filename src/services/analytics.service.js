// Số liệu cho các tab Tổng quan, Tăng trưởng, Người dùng, Hoạt động của trang thống kê.
const kho = require('../repositories/analytics.repository');
const khoBaoCao = require('../repositories/report.repository');
const doLuong = require('../utils/do-luong');
const { moTaKhoang, dauNgayVn, NGAY_MS } = require('../utils/khoang-thoi-gian');

const SO_KHU_VUC_HIEN_THI = 8;

const tong = (mang) => mang.reduce((a, b) => a + b, 0);
// Phần trăm thay đổi so với kỳ trước; kỳ trước bằng 0 thì không tính được tỷ lệ.
const thayDoi = (nay, truoc) => (truoc ? (nay - truoc) / truoc : null);

function congDon(dau, mang) {
  let so = dau;
  return mang.map((v) => (so += v));
}

const tongNoiDung = (d) => d.requests + d.proposals + d.reviews;

const the = (key, giaTri, truoc, series, them = {}) => ({ key, value: giaTri, previous: truoc, change: truoc === null ? null : thayDoi(giaTri, truoc), series, ...them });

async function tongQuan(khoang) {
  const [
    moi, hoatDong, tongHoatDong, chot, tongChot, xong, tongXong, giaTri, tongGiaTri, tin, deXuat, danhGia, loi,
    cuoiKy, cuoiKyTruoc, dauKy, dangCho, trangThai, batDauNhatKy, ganDay,
  ] = await Promise.all([
    kho.nguoiDungMoi(khoang), kho.hoatDongTheoO(khoang), kho.tongHoatDong(khoang), kho.giaoDichChot(khoang), kho.tongGiaoDichChot(khoang),
    kho.viecHoanThanh(khoang), kho.tongViecHoanThanh(khoang), kho.giaTriHoanThanh(khoang), kho.tongGiaTriHoanThanh(khoang),
    kho.tinMoi(khoang), kho.deXuatMoi(khoang), kho.danhGiaMoi(khoang), kho.loiMayChu(khoang),
    kho.soCongDon(khoang.end), kho.soCongDon(khoang.previousEnd), kho.soCongDon(khoang.start), kho.viecDangCho(),
    kho.trangThaiTin(), kho.thoiDiemBatDauNhatKy(), khoBaoCao.suKienGanDay(5),
  ]);
  const noiDungTheoO = tin.current.map((v, i) => v + deXuat.current[i] + danhGia.current[i]);

  return {
    range: moTaKhoang(khoang),
    loggingSince: batDauNhatKy,
    cards: [
      the('totalUsers', cuoiKy.users, cuoiKyTruoc.users, congDon(dauKy.users, moi.current), { added: tong(moi.current) }),
      the('newUsers', tong(moi.current), tong(moi.previous), moi.current),
      the('activeUsers', tongHoatDong.current, tongHoatDong.previous, hoatDong.current),
      the('transactions', tongChot.current, tongChot.previous, chot.current, { completed: tongXong.current }),
      the('completedValue', tongGiaTri.current, tongGiaTri.previous, giaTri.current, { completed: tongXong.current, completedSeries: xong.current }),
      the('totalContent', tongNoiDung(cuoiKy), tongNoiDung(cuoiKyTruoc), congDon(tongNoiDung(dauKy), noiDungTheoO), {
        breakdown: { requests: cuoiKy.requests, proposals: cuoiKy.proposals, reviews: cuoiKy.reviews },
      }),
      the('pendingTasks', dangCho.requestsWaiting, null, null, dangCho),
      the('systemErrors', tong(loi.current), tong(loi.previous), loi.current),
    ],
    requestsTrend: tin,
    requestStatus: trangThai,
    recent: ganDay,
  };
}

async function tangTruong(khoang) {
  const [moi, hoatDong, tongHoatDong, giaTri, chot, xong, tin, deXuat, danhGia, dauKy, dauKyTruoc] = await Promise.all([
    kho.nguoiDungMoi(khoang), kho.hoatDongTheoO(khoang), kho.tongHoatDong(khoang), kho.giaTriHoanThanh(khoang), kho.giaoDichChot(khoang),
    kho.viecHoanThanh(khoang), kho.tinMoi(khoang), kho.deXuatMoi(khoang), kho.danhGiaMoi(khoang),
    kho.soCongDon(khoang.start), kho.soCongDon(khoang.previousStart),
  ]);
  const gopNoiDung = (ky) => tin[ky].map((v, i) => v + deXuat[ky][i] + danhGia[ky][i]);
  const tongHai = (d) => ({ current: tong(d.current), previous: tong(d.previous) });

  return {
    range: moTaKhoang(khoang),
    users: {
      new: moi,
      cumulative: { current: congDon(dauKy.users, moi.current), previous: congDon(dauKyTruoc.users, moi.previous) },
      total: tongHai(moi),
    },
    activeUsers: { ...hoatDong, total: tongHoatDong },
    completedValue: { ...giaTri, total: tongHai(giaTri) },
    transactions: { accepted: chot, completed: xong, total: { accepted: tongHai(chot), completed: tongHai(xong) } },
    content: {
      requests: tin.current,
      proposals: deXuat.current,
      reviews: danhGia.current,
      all: { current: gopNoiDung('current'), previous: gopNoiDung('previous') },
      total: { current: tong(gopNoiDung('current')), previous: tong(gopNoiDung('previous')) },
    },
  };
}

// Gộp các nhóm nhỏ thành "Còn lại" để biểu đồ không quá nhiều mục.
function gopPhanDuoi(danhSach, soGiu) {
  if (danhSach.length <= soGiu) return danhSach;
  const conLai = danhSach.slice(soGiu).reduce((a, d) => a + d.count, 0);
  return [...danhSach.slice(0, soGiu), { name: `${danhSach.length - soGiu} khu vực còn lại`, count: conLai, isRest: true }];
}

async function nguoiDung(khoang) {
  const ngayCuoi = dauNgayVn(khoang.end - 1);
  const [dau, wau, mau, giuChan, theoO, vaiTro, khuVuc, thietBi, heDieuHanh, dauKy, cuoiKy, moi, batDauNhatKy] = await Promise.all([
    kho.soNguoiHoatDongTrong(ngayCuoi, khoang.end),
    kho.soNguoiHoatDongTrong(ngayCuoi - 6 * NGAY_MS, khoang.end),
    kho.soNguoiHoatDongTrong(ngayCuoi - 29 * NGAY_MS, khoang.end),
    kho.giuChan(khoang), kho.moiVaQuayLaiTheoO(khoang), kho.theoVaiTroVaTrangThai(khoang.end), kho.khachTheoKhuVuc(khoang.end),
    kho.theoThietBi(khoang, 'device'), kho.theoThietBi(khoang, 'os'), kho.soCongDon(khoang.start), kho.soCongDon(khoang.end),
    kho.tongNguoiDungMoi(khoang), kho.thoiDiemBatDauNhatKy(),
  ]);
  const demTheo = (dieuKien) => vaiTro.filter(dieuKien).reduce((a, d) => a + d.count, 0);
  const tyLeGiu = giuChan.base ? giuChan.retained / giuChan.base : null;

  return {
    range: moTaKhoang(khoang),
    loggingSince: batDauNhatKy,
    dau,
    wau,
    mau,
    retention: { rate: tyLeGiu, retained: giuChan.retained, base: giuChan.base },
    churn: { rate: tyLeGiu === null ? null : 1 - tyLeGiu, lost: giuChan.base - giuChan.retained, base: giuChan.base },
    growth: { rate: dauKy.users ? (cuoiKy.users - dauKy.users) / dauKy.users : null, newUsers: moi.current, previousNewUsers: moi.previous, totalAtStart: dauKy.users, totalAtEnd: cuoiKy.users },
    newVsReturning: { new: giuChan.newActive, returning: giuChan.returning, series: theoO },
    byRole: ['CUSTOMER', 'TECHNICIAN', 'ADMIN'].map((role) => ({ key: role, count: demTheo((d) => d.role === role) })),
    byStatus: [
      { key: 'ACTIVE', count: demTheo((d) => !d.isLocked) },
      { key: 'LOCKED', count: demTheo((d) => d.isLocked) },
    ],
    byRegion: gopPhanDuoi(khuVuc, SO_KHU_VUC_HIEN_THI),
    byDevice: thietBi,
    byOs: heDieuHanh,
  };
}

// Số đo API chỉ có từ khi backend khởi động, nên cắt khoảng yêu cầu theo thời điểm đó.
function soDoApi(khoang) {
  const { batDauLuc } = doLuong.trangThaiHienTai();
  return { since: batDauLuc, summary: doLuong.tomTatKhoang(khoang.start, khoang.end + 60000), routes: doLuong.danhSachTuyen() };
}

async function hoatDong(khoang) {
  const [dangNhap, theoVaiTro, thaoTac, tinhNang, quanTri, nguoiNhieu, nhiet, ganDay, batDauNhatKy] = await Promise.all([
    kho.dangNhapTheoO(khoang), kho.hoatDongTheoVaiTro(khoang), kho.thaoTacTheoO(khoang), kho.demTheoHanhDong(khoang),
    kho.demTheoHanhDong(khoang, { chiQuanTri: true }), kho.nguoiDungHoatDongNhieuNhat(khoang), kho.banDoNhiet(khoang),
    khoBaoCao.suKienGanDay(10), kho.thoiDiemBatDauNhatKy(),
  ]);
  return {
    range: moTaKhoang(khoang),
    loggingSince: batDauNhatKy,
    logins: dangNhap,
    byRole: theoVaiTro,
    operations: thaoTac,
    features: tinhNang,
    adminActions: quanTri,
    topUsers: nguoiNhieu,
    heatmap: nhiet,
    api: soDoApi(khoang),
    recent: ganDay,
  };
}

module.exports = { tongQuan, tangTruong, nguoiDung, hoatDong, thayDoi };
