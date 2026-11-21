// Sinh tài khoản khách hàng và kỹ thuật viên tự động, kèm "hồ sơ" nội bộ (mức hoạt động, chuyên môn, điểm mong đợi)
// để bộ sinh tin phân bổ công việc có chủ ý. Hồ sơ không đưa vào kế hoạch; chỉ phần taiKhoan được ghi vào CSDL.
const { HO, DEM_NAM, DEM_NU, TEN_NAM, TEN_NU, DAU_SO } = require('./du-lieu-nguoi');
const { LOAI_DICH_VU } = require('./du-lieu-van-ban');

const TY_LE_KHACH_TREN_TIN = 0.15;
const TY_LE_KTV_TREN_TIN = 0.08;
const SO_KHACH_TOI_THIEU = 8;
const SO_KTV_TOI_THIEU = 6;
const TY_LE_KHACH_KHONG_HOAT_DONG = 0.12;
const TY_LE_KTV_KHONG_HOAT_DONG = 0.1;
const TY_LE_BI_KHOA = 0.04;
const SO_CHUYEN_MON_TOI_DA = 3;

const danhSo = (thuTu) => String(thuTu).padStart(3, '0');

function taoHoTen(ngauNhien) {
  const laNu = ngauNhien.xacSuat(0.5);
  const ho = ngauNhien.chon(HO);
  const dem = ngauNhien.chon(laNu ? DEM_NU : DEM_NAM);
  const ten = ngauNhien.chon(laNu ? TEN_NU : TEN_NAM);
  return ngauNhien.xacSuat(0.1) ? `${ho} ${ten}` : `${ho} ${dem} ${ten}`;
}

// Bốn kiểu viết số điện thoại (liền, +84, cách bằng khoảng trắng, cách bằng dấu chấm), đều hợp lệ với validator.
function taoSoDienThoai(ngauNhien) {
  const so = `${ngauNhien.chon(DAU_SO)}${String(ngauNhien.nguyen(0, 9999999)).padStart(7, '0')}`;
  const kieu = ngauNhien.so();
  if (kieu < 0.6) return so;
  if (kieu < 0.75) return `+84${so.slice(1)}`;
  if (kieu < 0.9) return `${so.slice(0, 4)} ${so.slice(4, 7)} ${so.slice(7)}`;
  return `${so.slice(0, 4)}.${so.slice(4, 7)}.${so.slice(7)}`;
}

function taoTaiKhoan(ngauNhien, { khoa, email, role }) {
  const taiKhoan = { khoa, email, fullName: taoHoTen(ngauNhien), phone: taoSoDienThoai(ngauNhien), role };
  if (ngauNhien.xacSuat(TY_LE_BI_KHOA)) taiKhoan.biKhoa = true;
  return taiKhoan;
}

// Mức hoạt động lệch mạnh: ít tài khoản rất bận, nhiều tài khoản ít việc, một phần không có việc nào.
function taoTrongSoHoatDong(ngauNhien, tyLeKhongHoatDong, soMu, heSo) {
  if (ngauNhien.xacSuat(tyLeKhongHoatDong)) return 0;
  return Math.pow(ngauNhien.so(), soMu) * heSo + 0.05;
}

function sinhKhachHang(ngauNhien, soLuong) {
  return Array.from({ length: soLuong }, (_, chiSo) => {
    const thuTu = danhSo(chiSo + 1);
    return {
      taiKhoan: taoTaiKhoan(ngauNhien, { khoa: `td-kh-${thuTu}`, email: `auto.kh${thuTu}@demo.vn`, role: 'CUSTOMER' }),
      trongSo: taoTrongSoHoatDong(ngauNhien, TY_LE_KHACH_KHONG_HOAT_DONG, 3, 10),
      diem: 3 + 2 * Math.pow(ngauNhien.so(), 0.5), // điểm kỳ vọng khi kỹ thuật viên đánh giá khách hàng: 3 đến 5
    };
  });
}

function sinhKyThuatVien(ngauNhien, soLuong) {
  return Array.from({ length: soLuong }, (_, chiSo) => {
    const thuTu = danhSo(chiSo + 1);
    const taiKhoan = taoTaiKhoan(ngauNhien, { khoa: `td-ktv-${thuTu}`, email: `auto.ktv${thuTu}@demo.vn`, role: 'TECHNICIAN' });
    const chuyenMon = ngauNhien
      .chonKhongTrung(LOAI_DICH_VU, (loai) => loai.trongSo, ngauNhien.nguyen(1, SO_CHUYEN_MON_TOI_DA))
      .map((loai) => loai.ten);
    return {
      taiKhoan,
      trongSo: taoTrongSoHoatDong(ngauNhien, TY_LE_KTV_KHONG_HOAT_DONG, 2.2, 10),
      diem: 2 + 2.9 * Math.pow(ngauNhien.so(), 0.45), // điểm kỳ vọng khách hàng chấm: 2 đến 4,9, lệch về phía cao
      chuyenMon,
    };
  });
}

// Mỗi phía luôn có ít nhất một tài khoản hoạt động để mọi tin đều có chủ và kỹ thuật viên để nhận.
function damBaoCoNguoiHoatDong(danhSach) {
  if (!danhSach.some((hoSo) => hoSo.trongSo > 0)) danhSach[0].trongSo = 1;
}

function sinhTaiKhoan(ngauNhien, soTin) {
  const soKhach = Math.max(SO_KHACH_TOI_THIEU, Math.round(soTin * TY_LE_KHACH_TREN_TIN));
  const soKyThuatVien = Math.max(SO_KTV_TOI_THIEU, Math.round(soTin * TY_LE_KTV_TREN_TIN));
  const khachHang = sinhKhachHang(ngauNhien, soKhach);
  const kyThuatVien = sinhKyThuatVien(ngauNhien, soKyThuatVien);
  damBaoCoNguoiHoatDong(khachHang);
  damBaoCoNguoiHoatDong(kyThuatVien);
  return { khachHang, kyThuatVien };
}

module.exports = { sinhTaiKhoan };
