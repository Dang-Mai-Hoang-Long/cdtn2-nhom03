// "Kế hoạch" dữ liệu mẫu và bước kiểm tra nó TRƯỚC khi ghi vào CSDL.
// Seed không nằm trong một transaction, nên lỗi phát hiện giữa chừng để lại dữ liệu dở dang. Vì vậy mọi lỗi có thể
// biết trước (dữ liệu sai theo validator của API, tham chiếu sai khóa, vi phạm BR07/BR08/BR12/BR13/BR14, thời gian đảo
// thứ tự) đều được bắt ở đây, dùng đúng các hàm kiểm tra mà route của ứng dụng dùng.
//
// Dạng của kế hoạch:
//   taiKhoan: [{ khoa, email, fullName, phone, role, biKhoa?, taoLuc? }]
//   tin:      [{ khoa, khachHang, title, description, category, location, ketQua, ktvDuocChon?,
//                soNgayToi + gioMongMuon  HOẶC  thoiGianMongMuon (chuỗi ISO), suaTin?, taoLuc?, chapNhanLuc? }]
//   deXuat:   [{ tin, ktv, price, description, estimatedDuration?, rut?, sua?, daDocThongBao?, taoLuc? }]
//   danhGia:  [{ tin, nguoiGui, rating, comment?, taoLuc? }]
// ketQua: CHO_DE_XUAT | DA_CHON | HOAN_THANH | DA_DONG. Các trường taoLuc / chapNhanLuc là thời điểm (chuỗi ISO) để
// lùi ngày tạo về quá khứ sau khi tạo xong; không có thì giữ thời điểm chạy seed.
const { MAT_KHAU_DEMO } = require('./hang-so');
const { VAI_TRO } = require('../src/utils/constants');
const { kiemTraDangKy } = require('../src/validators/auth.validator');
const { kiemTraTaoYeuCau, kiemTraSuaYeuCau } = require('../src/validators/request.validator');
const { kiemTraGuiDeXuat, kiemTraSuaDeXuat } = require('../src/validators/proposal.validator');
const { kiemTraTaoDanhGia } = require('../src/validators/review.validator');

const MOT_NGAY_MS = 24 * 60 * 60 * 1000;
const CAC_KET_QUA = ['CHO_DE_XUAT', 'DA_CHON', 'HOAN_THANH', 'DA_DONG'];
const MA_GIA_DE_KIEM_TRA = 1; // validator chỉ cần mã là số nguyên dương; mã thật chỉ có sau khi tạo tin.
const SO_LOI_TOI_DA_HIEN_THI = 15;

// Thời gian mong muốn của tin: tuyệt đối (thoiGianMongMuon) hoặc tính theo lúc chạy seed (soNgayToi, gioMongMuon).
function thoiGianMongMuonCuaTin(tin, bayGio) {
  if (tin.thoiGianMongMuon) return new Date(tin.thoiGianMongMuon);
  const thoiGian = new Date(bayGio.getTime() + tin.soNgayToi * MOT_NGAY_MS);
  thoiGian.setHours(tin.gioMongMuon, 0, 0, 0);
  return thoiGian;
}

function laThoiDiemHopLe(giaTri) {
  return typeof giaTri === 'string' && !Number.isNaN(Date.parse(giaTri));
}

function kiemTraTaiKhoan(taiKhoan, themLoi) {
  const taiKhoanTheoKhoa = new Map();
  const emailDaDung = new Set();
  for (const mau of taiKhoan) {
    const viTri = `tài khoản "${mau.khoa}"`;
    if (taiKhoanTheoKhoa.has(mau.khoa)) themLoi(viTri, 'trùng khóa');
    taiKhoanTheoKhoa.set(mau.khoa, mau);
    if (mau.email !== mau.email?.trim().toLowerCase()) themLoi(viTri, 'email phải viết thường và không có khoảng trắng thừa');
    if (emailDaDung.has(mau.email)) themLoi(viTri, 'trùng email');
    emailDaDung.add(mau.email);
    if (!Object.values(VAI_TRO).includes(mau.role)) themLoi(viTri, `vai trò "${mau.role}" không hợp lệ`);
    // Quản trị viên không qua đăng ký (BR01) nên kiểm tra như khách hàng để vẫn bắt được email, họ tên, số điện thoại sai.
    const vaiTroKiemTra = mau.role === VAI_TRO.QUAN_TRI_VIEN ? VAI_TRO.KHACH_HANG : mau.role;
    for (const loi of kiemTraDangKy({ ...mau, password: MAT_KHAU_DEMO, role: vaiTroKiemTra })) themLoi(viTri, `${loi.field}: ${loi.message}`);
    if (mau.taoLuc !== undefined && !laThoiDiemHopLe(mau.taoLuc)) themLoi(viTri, 'taoLuc không phải thời điểm hợp lệ');
  }
  return taiKhoanTheoKhoa;
}

function kiemTraTin(tinMau, taiKhoanTheoKhoa, bayGio, themLoi) {
  const tinTheoKhoa = new Map();
  for (const mau of tinMau) {
    const viTri = `tin "${mau.khoa}"`;
    if (tinTheoKhoa.has(mau.khoa)) themLoi(viTri, 'trùng khóa');
    tinTheoKhoa.set(mau.khoa, mau);
    if (taiKhoanTheoKhoa.get(mau.khachHang)?.role !== VAI_TRO.KHACH_HANG) themLoi(viTri, `chủ tin "${mau.khachHang}" không phải khách hàng có trong kế hoạch`);
    if (!CAC_KET_QUA.includes(mau.ketQua)) themLoi(viTri, `ketQua "${mau.ketQua}" không hợp lệ`);
    const coKyThuatVienDuocChon = ['DA_CHON', 'HOAN_THANH'].includes(mau.ketQua);
    if (coKyThuatVienDuocChon !== Boolean(mau.ktvDuocChon)) themLoi(viTri, 'ktvDuocChon chỉ được có (và bắt buộc) khi ketQua là DA_CHON hoặc HOAN_THANH');
    if (!mau.thoiGianMongMuon && (!Number.isInteger(mau.soNgayToi) || !Number.isInteger(mau.gioMongMuon))) {
      themLoi(viTri, 'cần thoiGianMongMuon hoặc cả soNgayToi lẫn gioMongMuon');
    }
    const duLieuTao = { ...mau, preferredTime: thoiGianMongMuonCuaTin(mau, bayGio).toISOString() };
    for (const loi of kiemTraTaoYeuCau(duLieuTao)) themLoi(viTri, `${loi.field}: ${loi.message}`);
    if (mau.suaTin) for (const loi of kiemTraSuaYeuCau(mau.suaTin)) themLoi(viTri, `suaTin.${loi.field}: ${loi.message}`);
    for (const truong of ['taoLuc', 'chapNhanLuc']) {
      if (mau[truong] !== undefined && !laThoiDiemHopLe(mau[truong])) themLoi(viTri, `${truong} không phải thời điểm hợp lệ`);
    }
    if (mau.chapNhanLuc && !coKyThuatVienDuocChon) themLoi(viTri, 'chapNhanLuc chỉ dùng cho tin đã chọn kỹ thuật viên');
  }
  return tinTheoKhoa;
}

// Mô phỏng thứ tự gửi đề xuất để bắt BR08 (mỗi kỹ thuật viên chỉ một đề xuất còn hiệu lực cho mỗi tin).
// Trả về đề xuất cuối cùng còn hiệu lực của từng cặp "tin:kỹ thuật viên".
function kiemTraDeXuat(deXuat, tinTheoKhoa, taiKhoanTheoKhoa, themLoi) {
  const conHieuLuc = new Map();
  deXuat.forEach((mau, chiSo) => {
    const viTri = `đề xuất #${chiSo + 1} (tin "${mau.tin}", kỹ thuật viên "${mau.ktv}")`;
    if (!tinTheoKhoa.has(mau.tin)) themLoi(viTri, 'tin không có trong kế hoạch');
    if (taiKhoanTheoKhoa.get(mau.ktv)?.role !== VAI_TRO.KY_THUAT_VIEN) themLoi(viTri, 'kỹ thuật viên không có trong kế hoạch');
    for (const loi of kiemTraGuiDeXuat({ ...mau, requestId: MA_GIA_DE_KIEM_TRA })) themLoi(viTri, `${loi.field}: ${loi.message}`);
    if (mau.sua) for (const loi of kiemTraSuaDeXuat(mau.sua)) themLoi(viTri, `sua.${loi.field}: ${loi.message}`);
    if (mau.taoLuc !== undefined && !laThoiDiemHopLe(mau.taoLuc)) themLoi(viTri, 'taoLuc không phải thời điểm hợp lệ');

    const khoa = `${mau.tin}:${mau.ktv}`;
    if (conHieuLuc.has(khoa)) themLoi(viTri, 'đã có đề xuất còn hiệu lực cho tin này (BR08): phải rút đề xuất trước rồi mới gửi lại');
    if (mau.rut) conHieuLuc.delete(khoa);
    else conHieuLuc.set(khoa, mau);
  });
  return conHieuLuc;
}

function kiemTraKyThuatVienDuocChon(tinTheoKhoa, conHieuLuc, deXuat, themLoi) {
  for (const mau of tinTheoKhoa.values()) {
    if (!mau.ktvDuocChon) continue;
    if (!conHieuLuc.has(`${mau.khoa}:${mau.ktvDuocChon}`)) {
      themLoi(`tin "${mau.khoa}"`, `kỹ thuật viên được chọn "${mau.ktvDuocChon}" chưa có đề xuất còn hiệu lực cho tin này`);
    }
  }
  for (const mau of deXuat.filter((deXuatMau) => deXuatMau.daDocThongBao)) {
    const tin = tinTheoKhoa.get(mau.tin);
    const laDeXuatDuocChon = tin?.ktvDuocChon === mau.ktv && !mau.rut;
    if (!laDeXuatDuocChon) themLoi(`đề xuất của "${mau.ktv}" cho tin "${mau.tin}"`, 'daDocThongBao chỉ dùng cho đề xuất được chấp nhận (BR16)');
  }
}

function kiemTraDanhGia(danhGia, tinTheoKhoa, themLoi) {
  const daDanhGia = new Set();
  danhGia.forEach((mau, chiSo) => {
    const viTri = `đánh giá #${chiSo + 1} (tin "${mau.tin}", người gửi "${mau.nguoiGui}")`;
    const tin = tinTheoKhoa.get(mau.tin);
    if (!tin) return themLoi(viTri, 'tin không có trong kế hoạch');
    if (tin.ketQua !== 'HOAN_THANH') themLoi(viTri, 'chỉ đánh giá được tin đã hoàn thành (BR13)');
    if (![tin.khachHang, tin.ktvDuocChon].includes(mau.nguoiGui)) themLoi(viTri, 'người gửi không tham gia công việc này');
    const khoa = `${mau.tin}:${mau.nguoiGui}`;
    if (daDanhGia.has(khoa)) themLoi(viTri, 'mỗi bên chỉ đánh giá một lần cho mỗi tin (BR14)');
    daDanhGia.add(khoa);
    for (const loi of kiemTraTaoDanhGia({ ...mau, requestId: MA_GIA_DE_KIEM_TRA })) themLoi(viTri, `${loi.field}: ${loi.message}`);
    if (mau.taoLuc !== undefined && !laThoiDiemHopLe(mau.taoLuc)) themLoi(viTri, 'taoLuc không phải thời điểm hợp lệ');
  });
}

const luc = (giaTri) => (giaTri === undefined ? undefined : Date.parse(giaTri));

// Thời điểm phải đi đúng trình tự: tài khoản < tin < đề xuất < chấp nhận < đánh giá, và không nằm ở tương lai.
function kiemTraThuTuThoiGian({ taiKhoan, tin, deXuat, danhGia }, bayGio, themLoi) {
  const taiKhoanTheoKhoa = new Map(taiKhoan.map((mau) => [mau.khoa, mau]));
  const tinTheoKhoa = new Map(tin.map((mau) => [mau.khoa, mau]));
  const khongSomHon = (viTri, thoiDiem, moc, tenMoc) => {
    if (thoiDiem !== undefined && moc !== undefined && thoiDiem < moc) themLoi(viTri, `thời điểm sớm hơn ${tenMoc}`);
  };
  const cacMoc = [...taiKhoan, ...tin, ...deXuat, ...danhGia].flatMap((mau) => [mau.taoLuc, mau.chapNhanLuc]);
  for (const moc of cacMoc.filter((giaTri) => laThoiDiemHopLe(giaTri))) {
    if (Date.parse(moc) > bayGio.getTime()) themLoi('thời gian', `"${moc}" nằm ở tương lai so với lúc chạy seed`);
  }
  for (const mau of tin) {
    khongSomHon(`tin "${mau.khoa}"`, luc(mau.taoLuc), luc(taiKhoanTheoKhoa.get(mau.khachHang)?.taoLuc), 'ngày tạo của chủ tin');
  }
  for (const mau of deXuat) {
    const viTri = `đề xuất của "${mau.ktv}" cho tin "${mau.tin}"`;
    khongSomHon(viTri, luc(mau.taoLuc), luc(tinTheoKhoa.get(mau.tin)?.taoLuc), 'ngày tạo tin');
    khongSomHon(viTri, luc(mau.taoLuc), luc(taiKhoanTheoKhoa.get(mau.ktv)?.taoLuc), 'ngày tạo tài khoản kỹ thuật viên');
    const tinCuaDeXuat = tinTheoKhoa.get(mau.tin);
    if (tinCuaDeXuat?.ktvDuocChon === mau.ktv && !mau.rut) {
      khongSomHon(`tin "${mau.tin}" (chấp nhận)`, luc(tinCuaDeXuat.chapNhanLuc), luc(mau.taoLuc), 'ngày gửi đề xuất được chọn');
    }
  }
  for (const mau of danhGia) {
    khongSomHon(`đánh giá của "${mau.nguoiGui}" cho tin "${mau.tin}"`, luc(mau.taoLuc), luc(tinTheoKhoa.get(mau.tin)?.chapNhanLuc), 'lúc chấp nhận đề xuất');
  }
}

// Trả về danh sách lỗi (rỗng nếu kế hoạch hợp lệ); dùng trực tiếp trong kiểm thử.
function timLoiKeHoach(keHoach, { bayGio = new Date() } = {}) {
  const loi = [];
  const themLoi = (viTri, thongDiep) => loi.push(`${viTri}: ${thongDiep}`);
  const taiKhoanTheoKhoa = kiemTraTaiKhoan(keHoach.taiKhoan, themLoi);
  const tinTheoKhoa = kiemTraTin(keHoach.tin, taiKhoanTheoKhoa, bayGio, themLoi);
  const conHieuLuc = kiemTraDeXuat(keHoach.deXuat, tinTheoKhoa, taiKhoanTheoKhoa, themLoi);
  kiemTraKyThuatVienDuocChon(tinTheoKhoa, conHieuLuc, keHoach.deXuat, themLoi);
  kiemTraDanhGia(keHoach.danhGia, tinTheoKhoa, themLoi);
  kiemTraThuTuThoiGian(keHoach, bayGio, themLoi);
  return loi;
}

function kiemTraKeHoach(keHoach, tuyChon) {
  const loi = timLoiKeHoach(keHoach, tuyChon);
  if (loi.length === 0) return;
  const hienThi = loi.slice(0, SO_LOI_TOI_DA_HIEN_THI).map((dong) => `  - ${dong}`).join('\n');
  const conLai = loi.length > SO_LOI_TOI_DA_HIEN_THI ? `\n  ... và ${loi.length - SO_LOI_TOI_DA_HIEN_THI} lỗi nữa` : '';
  throw new Error(`Dữ liệu mẫu không hợp lệ (${loi.length} lỗi), chưa ghi gì vào CSDL:\n${hienThi}${conLai}`);
}

// Ghép nhiều kế hoạch theo thứ tự (thủ công trước, tự động sau) để mã của dữ liệu viết tay luôn ổn định.
function gopKeHoach(...cacKeHoach) {
  return {
    taiKhoan: cacKeHoach.flatMap((keHoach) => keHoach.taiKhoan),
    tin: cacKeHoach.flatMap((keHoach) => keHoach.tin),
    deXuat: cacKeHoach.flatMap((keHoach) => keHoach.deXuat),
    danhGia: cacKeHoach.flatMap((keHoach) => keHoach.danhGia),
  };
}

module.exports = { timLoiKeHoach, kiemTraKeHoach, gopKeHoach, thoiGianMongMuonCuaTin };
