// Phần dữ liệu tự động (mặc định 1000 tin): sinh bằng bộ số ngẫu nhiên có hạt giống cố định, nên cùng tham số thì
// cùng dữ liệu. Trả về "kế hoạch" cùng dạng với phần viết tay (xem ../ke-hoach.js) để một bộ thực thi duy nhất chạy cả hai.
// Dữ liệu cố ý lệch như thật: ít khách hàng rất nhiều tin, nhiều người ít tin; một phần tài khoản không có việc nào;
// phần nhỏ tài khoản bị khóa; tin cũ có đủ đề xuất, rút, sửa, đánh giá một hoặc hai chiều, theo dòng thời gian hợp lệ.
const { taoNgauNhien } = require('./so-ngau-nhien');
const { sinhTaiKhoan } = require('./sinh-tai-khoan');
const { sinhNguCanhTin } = require('./sinh-tin');
const { sinhHoatDongCuaTin } = require('./sinh-hoat-dong');
const { GIO, NGAY, doiSangIso } = require('./thoi-gian');

const SO_TIN_MAC_DINH = 1000;
const HAT_GIONG_MAC_DINH = 20261121;
// Tài khoản có hoạt động được tạo trước hoạt động đầu tiên của chính nó từ 1 giờ đến 45 ngày;
// tài khoản chưa có hoạt động nào tạo từ 2 đến 210 ngày trước lúc chạy seed.
const TAI_KHOAN_TRUOC_HOAT_DONG_TOI_DA_NGAY = 45;
const TAI_KHOAN_CHUA_HOAT_DONG_TOI_THIEU_NGAY = 2;
const TAI_KHOAN_CHUA_HOAT_DONG_TOI_DA_NGAY = 210;

function ghiMocSomNhat(mocTheoKhoa, khoa, mili) {
  if (!mocTheoKhoa.has(khoa) || mili < mocTheoKhoa.get(khoa)) mocTheoKhoa.set(khoa, mili);
}

function ganThoiGianTaiKhoan(ngauNhien, cacHoSo, mocSomNhat, bayGio) {
  const khoangChuaHoatDong = TAI_KHOAN_CHUA_HOAT_DONG_TOI_DA_NGAY - TAI_KHOAN_CHUA_HOAT_DONG_TOI_THIEU_NGAY;
  for (const hoSo of cacHoSo) {
    const moc = mocSomNhat.get(hoSo.taiKhoan.khoa);
    const thoiDiem = moc === undefined
      ? bayGio.getTime() - (TAI_KHOAN_CHUA_HOAT_DONG_TOI_THIEU_NGAY + ngauNhien.so() * khoangChuaHoatDong) * NGAY
      : moc - GIO - ngauNhien.so() * TAI_KHOAN_TRUOC_HOAT_DONG_TOI_DA_NGAY * NGAY;
    hoSo.taiKhoan.taoLuc = doiSangIso(thoiDiem);
  }
}

// bayGio là thời điểm chạy seed; mọi thời điểm sinh ra đều nằm trước nó. Cùng (soTin, hatGiong, bayGio) cho cùng kế hoạch.
function sinhKeHoach({ soTin = SO_TIN_MAC_DINH, hatGiong = HAT_GIONG_MAC_DINH, bayGio = new Date() } = {}) {
  if (!Number.isInteger(soTin) || soTin < 0) throw new Error(`Số tin tự động phải là số nguyên không âm, nhận được: ${soTin}`);
  if (soTin === 0) return { taiKhoan: [], tin: [], deXuat: [], danhGia: [] };

  const ngauNhien = taoNgauNhien(hatGiong);
  const { khachHang, kyThuatVien } = sinhTaiKhoan(ngauNhien, soTin);
  const cacNguCanh = sinhNguCanhTin(ngauNhien, { soTin, khachHang, bayGio });

  const tin = [];
  const deXuat = [];
  const danhGia = [];
  const tinSomNhatCuaKhach = new Map();
  const deXuatSomNhatCuaKyThuatVien = new Map();
  for (const nguCanh of cacNguCanh) {
    const hoatDong = sinhHoatDongCuaTin(ngauNhien, nguCanh, kyThuatVien, bayGio);
    if (hoatDong.ktvDuocChon) {
      nguCanh.tin.ktvDuocChon = hoatDong.ktvDuocChon;
      nguCanh.tin.chapNhanLuc = hoatDong.chapNhanLuc;
    }
    if (hoatDong.hoanThanhLuc) nguCanh.tin.hoanThanhLuc = hoatDong.hoanThanhLuc;
    tin.push(nguCanh.tin);
    deXuat.push(...hoatDong.deXuat);
    danhGia.push(...hoatDong.danhGia);
    ghiMocSomNhat(tinSomNhatCuaKhach, nguCanh.tin.khachHang, nguCanh.taoLucMs);
    for (const mau of hoatDong.deXuat) ghiMocSomNhat(deXuatSomNhatCuaKyThuatVien, mau.ktv, Date.parse(mau.taoLuc));
  }

  ganThoiGianTaiKhoan(ngauNhien, khachHang, tinSomNhatCuaKhach, bayGio);
  ganThoiGianTaiKhoan(ngauNhien, kyThuatVien, deXuatSomNhatCuaKyThuatVien, bayGio);
  return { taiKhoan: [...khachHang, ...kyThuatVien].map((hoSo) => hoSo.taiKhoan), tin, deXuat, danhGia };
}

module.exports = { sinhKeHoach, SO_TIN_MAC_DINH, HAT_GIONG_MAC_DINH };
