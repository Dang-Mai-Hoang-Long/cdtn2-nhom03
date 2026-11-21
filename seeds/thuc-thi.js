// Thực thi một "kế hoạch" dữ liệu mẫu (xem ke-hoach.js) bằng chính các service của ứng dụng.
// Đi qua tầng service như khi dùng ứng dụng nên mọi quy tắc nghiệp vụ (BR01-BR16) đều được áp dụng:
// trạng thái tin, đề xuất khác bị từ chối khi chọn kỹ thuật viên, thông báo cho kỹ thuật viên, điểm trung bình.
// Tài khoản được chèn qua user.repository (cùng hàm mà dịch vụ đăng ký gọi) với một mật khẩu băm dùng chung, vì băm
// riêng từng tài khoản (bcrypt) tốn vài giây cho hàng trăm tài khoản mà không thêm giá trị kiểm thử nào.
const bcrypt = require('bcryptjs');
const { truyVan } = require('../src/db');
const khoNguoiDung = require('../src/repositories/user.repository');
const dichVuYeuCau = require('../src/services/request.service');
const dichVuDeXuat = require('../src/services/proposal.service');
const dichVuDanhGia = require('../src/services/review.service');
const dichVuThongBao = require('../src/services/notification.service');
const dichVuQuanTri = require('../src/services/admin.service');
const { MAT_KHAU_DEMO } = require('./hang-so');
const { kiemTraKeHoach, thoiGianMongMuonCuaTin } = require('./ke-hoach');

const SO_VONG_BAM_MAT_KHAU = 10;
const BUOC_BAO_TIEN_DO = 250;

function layMaDeXuat(cacMaDeXuat, khoaTin, khoaKyThuatVien) {
  const ma = cacMaDeXuat.get(`${khoaTin}:${khoaKyThuatVien}`);
  if (!ma) throw new Error(`Dữ liệu mẫu sai: tin "${khoaTin}" tham chiếu kỹ thuật viên "${khoaKyThuatVien}" chưa có đề xuất`);
  return ma;
}

// Báo tiến độ ở các bước dài (hàng nghìn lệnh) để người chạy biết chương trình không bị treo.
function baoTienDo(tienDo, buoc, daXong, tong) {
  if (tienDo && tong >= BUOC_BAO_TIEN_DO && (daXong % BUOC_BAO_TIEN_DO === 0 || daXong === tong)) tienDo(buoc, daXong, tong);
}

// Trả về { khoa: { id, role } } để các bước sau gọi service với đúng người dùng.
async function taoTaiKhoan(danhSach) {
  const passwordHash = await bcrypt.hash(MAT_KHAU_DEMO, SO_VONG_BAM_MAT_KHAU);
  const nguoiDung = {};
  for (const mau of danhSach) {
    const daTao = await khoNguoiDung.tao({ email: mau.email, passwordHash, fullName: mau.fullName, phone: mau.phone, role: mau.role });
    nguoiDung[mau.khoa] = { id: daTao.id, role: daTao.role };
  }
  return nguoiDung;
}

async function taoCacTin(danhSach, nguoiDung, bayGio, tienDo) {
  const cacMaTin = {};
  let daXong = 0;
  for (const mau of danhSach) {
    const khachHang = nguoiDung[mau.khachHang];
    const daTao = await dichVuYeuCau.taoYeuCau(khachHang, {
      title: mau.title,
      description: mau.description,
      category: mau.category,
      location: mau.location,
      preferredTime: thoiGianMongMuonCuaTin(mau, bayGio).toISOString(),
    });
    cacMaTin[mau.khoa] = daTao.id;
    if (mau.suaTin) await dichVuYeuCau.suaYeuCau(khachHang, daTao.id, mau.suaTin);
    baoTienDo(tienDo, 'Tạo tin', (daXong += 1), danhSach.length);
  }
  return cacMaTin;
}

// Trả về { maTheoThuTu: [mã đề xuất theo thứ tự mảng], maHienTai: Map "<khóa tin>:<khóa kỹ thuật viên>" -> mã đề xuất
// gần nhất }. Đề xuất gửi lại sau khi rút ghi đè khóa cũ, nên khóa luôn trỏ tới đề xuất còn hiệu lực.
async function guiCacDeXuat(danhSach, nguoiDung, cacMaTin, tienDo) {
  const maTheoThuTu = [];
  const maHienTai = new Map();
  let daXong = 0;
  for (const mau of danhSach) {
    const kyThuatVien = nguoiDung[mau.ktv];
    const daGui = await dichVuDeXuat.guiDeXuat(kyThuatVien, {
      requestId: cacMaTin[mau.tin],
      price: mau.price,
      description: mau.description,
      estimatedDuration: mau.estimatedDuration,
    });
    maTheoThuTu.push(daGui.id);
    maHienTai.set(`${mau.tin}:${mau.ktv}`, daGui.id);
    if (mau.sua) await dichVuDeXuat.suaDeXuat(kyThuatVien, daGui.id, mau.sua);
    if (mau.rut) await dichVuDeXuat.rutDeXuat(kyThuatVien, daGui.id);
    baoTienDo(tienDo, 'Gửi đề xuất', (daXong += 1), danhSach.length);
  }
  return { maTheoThuTu, maHienTai };
}

// Đưa từng tin tới trạng thái cuối bằng đúng các thao tác của khách hàng.
async function hoanTatCacTin(danhSach, nguoiDung, cacMaTin, cacMaDeXuat, tienDo) {
  let daXong = 0;
  for (const mau of danhSach) {
    const khachHang = nguoiDung[mau.khachHang];
    const maTin = cacMaTin[mau.khoa];
    if (mau.ketQua === 'DA_DONG') await dichVuYeuCau.dongYeuCau(khachHang, maTin);
    if (mau.ketQua === 'DA_CHON' || mau.ketQua === 'HOAN_THANH') {
      await dichVuDeXuat.chapNhanDeXuat(khachHang, layMaDeXuat(cacMaDeXuat, mau.khoa, mau.ktvDuocChon));
    }
    if (mau.ketQua === 'HOAN_THANH') await dichVuYeuCau.xacNhanHoanThanh(khachHang, maTin);
    baoTienDo(tienDo, 'Chốt trạng thái tin', (daXong += 1), danhSach.length);
  }
}

// Trả về mã đánh giá theo thứ tự mảng để gắn thời điểm.
async function guiCacDanhGia(danhSach, nguoiDung, cacMaTin, tienDo) {
  const cacMaDanhGia = [];
  for (const mau of danhSach) {
    const daTao = await dichVuDanhGia.taoDanhGia(nguoiDung[mau.nguoiGui], { requestId: cacMaTin[mau.tin], rating: mau.rating, comment: mau.comment });
    cacMaDanhGia.push(daTao.id);
    baoTienDo(tienDo, 'Gửi đánh giá', cacMaDanhGia.length, danhSach.length);
  }
  return cacMaDanhGia;
}

// Thông báo "đề xuất được chấp nhận" (BR16) tra theo "<mã kỹ thuật viên>:<mã đề xuất>", đọc một lần cho cả bộ.
async function docThongBaoDuocChapNhan() {
  const { rows } = await truyVan(`SELECT id, user_id, related_id FROM notification WHERE type = 'PROPOSAL_ACCEPTED'`);
  return new Map(rows.map((dong) => [`${dong.user_id}:${dong.related_id}`, dong.id]));
}

async function danhDauThongBaoDaDoc(keHoach, nguoiDung, cacMaDeXuat, cacThongBao) {
  for (const mau of keHoach.deXuat.filter((deXuat) => deXuat.daDocThongBao)) {
    const kyThuatVien = nguoiDung[mau.ktv];
    const maThongBao = cacThongBao.get(`${kyThuatVien.id}:${layMaDeXuat(cacMaDeXuat, mau.tin, mau.ktv)}`);
    if (!maThongBao) throw new Error(`Dữ liệu mẫu sai: không có thông báo để đánh dấu đã đọc cho "${mau.ktv}" ở tin "${mau.tin}"`);
    await dichVuThongBao.danhDauDaDoc(kyThuatVien, maThongBao);
  }
}

async function khoaCacTaiKhoan(danhSach, nguoiDung) {
  for (const mau of danhSach.filter((taiKhoan) => taiKhoan.biKhoa)) {
    await dichVuQuanTri.datTrangThaiKhoa(nguoiDung[mau.khoa].id, true);
  }
}

// Lùi created_at về quá khứ theo kế hoạch: mỗi bảng một lệnh UPDATE ... FROM unnest, không dùng vòng lặp từng dòng.
// Tên bảng chỉ lấy từ hằng số trong file này, không bao giờ từ dữ liệu bên ngoài.
async function ganThoiGianTao(bang, cacDong) {
  const coThoiGian = cacDong.filter((dong) => dong.luc !== undefined);
  if (coThoiGian.length === 0) return;
  await truyVan(
    `UPDATE ${bang} AS t SET created_at = v.luc FROM unnest($1::int[], $2::timestamptz[]) AS v(id, luc) WHERE t.id = v.id`,
    [coThoiGian.map((dong) => dong.id), coThoiGian.map((dong) => new Date(dong.luc).toISOString())],
  );
}

async function ganThoiGianChoKeHoach(keHoach, ma) {
  const { nguoiDung, cacMaTin, maDeXuatTheoThuTu, cacMaDanhGia, cacThongBao, cacMaDeXuat } = ma;
  await ganThoiGianTao('users', keHoach.taiKhoan.map((mau) => ({ id: nguoiDung[mau.khoa].id, luc: mau.taoLuc })));
  await ganThoiGianTao('repair_request', keHoach.tin.map((mau) => ({ id: cacMaTin[mau.khoa], luc: mau.taoLuc })));
  await ganThoiGianTao('proposal', keHoach.deXuat.map((mau, chiSo) => ({ id: maDeXuatTheoThuTu[chiSo], luc: mau.taoLuc })));
  await ganThoiGianTao('review', keHoach.danhGia.map((mau, chiSo) => ({ id: cacMaDanhGia[chiSo], luc: mau.taoLuc })));
  const thongBao = keHoach.tin
    .filter((mau) => mau.ktvDuocChon)
    .map((mau) => ({ id: cacThongBao.get(`${nguoiDung[mau.ktvDuocChon].id}:${layMaDeXuat(cacMaDeXuat, mau.khoa, mau.ktvDuocChon)}`), luc: mau.chapNhanLuc }));
  await ganThoiGianTao('notification', thongBao);
}

// Kiểm tra kế hoạch trước, rồi mới ghi. Trả về số lượng bản ghi đã tạo.
async function thucThiKeHoach(keHoach, { bayGio = new Date(), tienDo } = {}) {
  kiemTraKeHoach(keHoach, { bayGio });

  const nguoiDung = await taoTaiKhoan(keHoach.taiKhoan);
  const cacMaTin = await taoCacTin(keHoach.tin, nguoiDung, bayGio, tienDo);
  const { maTheoThuTu: maDeXuatTheoThuTu, maHienTai: cacMaDeXuat } = await guiCacDeXuat(keHoach.deXuat, nguoiDung, cacMaTin, tienDo);
  await hoanTatCacTin(keHoach.tin, nguoiDung, cacMaTin, cacMaDeXuat, tienDo);
  const cacMaDanhGia = await guiCacDanhGia(keHoach.danhGia, nguoiDung, cacMaTin, tienDo);
  const cacThongBao = await docThongBaoDuocChapNhan();
  await danhDauThongBaoDaDoc(keHoach, nguoiDung, cacMaDeXuat, cacThongBao);
  await khoaCacTaiKhoan(keHoach.taiKhoan, nguoiDung);
  await ganThoiGianChoKeHoach(keHoach, { nguoiDung, cacMaTin, maDeXuatTheoThuTu, cacMaDanhGia, cacThongBao, cacMaDeXuat });

  return {
    soTaiKhoan: keHoach.taiKhoan.length,
    soTin: keHoach.tin.length,
    soDeXuat: keHoach.deXuat.length,
    soDanhGia: keHoach.danhGia.length,
  };
}

module.exports = { thucThiKeHoach };
