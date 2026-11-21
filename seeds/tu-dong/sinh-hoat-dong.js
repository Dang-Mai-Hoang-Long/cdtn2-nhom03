// Sinh hoạt động quanh một tin của dữ liệu tự động: kỹ thuật viên gửi (rút, gửi lại, sửa) đề xuất, khách hàng chọn một
// đề xuất, rồi hai bên đánh giá. Mọi thời điểm đi đúng trình tự (tin < đề xuất < chấp nhận < đánh giá) và không nằm ở
// tương lai; ke-hoach.js kiểm tra lại lần nữa trước khi ghi.
const { PHUT, GIO, NGAY, doiSangIso } = require('./thoi-gian');
const { vietHoa } = require('./chuoi');
const { BAO_HANH, THOI_GIAN_DU_KIEN, NHAN_XET_KHACH, NHAN_XET_KTV } = require('./du-lieu-van-ban');

// Số đề xuất của một tin theo trạng thái cuối. Tin đã chọn kỹ thuật viên luôn có ít nhất một đề xuất.
const PHAN_BO_SO_DE_XUAT = {
  CHO_DE_XUAT: [[0, 22], [1, 25], [2, 22], [3, 16], [4, 8], [5, 4], [6, 2], [8, 1]],
  DA_DONG: [[0, 45], [1, 20], [2, 15], [3, 10], [4, 6], [5, 4]],
  DA_CHON: [[1, 30], [2, 30], [3, 20], [4, 10], [5, 6], [6, 4]],
  HOAN_THANH: [[1, 30], [2, 30], [3, 20], [4, 10], [5, 6], [6, 4]],
};
const TRONG_SO_DUNG_CHUYEN_MON = 6;
const TY_LE_RUT = 0.08;
const TY_LE_GUI_LAI_SAU_KHI_RUT = 0.35;
const TY_LE_SUA_DE_XUAT = 0.1;
const TY_LE_KHONG_GHI_THOI_GIAN_DU_KIEN = 0.2;
const TY_LE_KHACH_DANH_GIA = 0.85;
const TY_LE_KTV_DANH_GIA = 0.55;
const TY_LE_DA_DOC_THONG_BAO = { HOAN_THANH: 0.7, DA_CHON: 0.3 };
const TRE_GUI_DE_XUAT_TOI_DA_GIO = 60;
const TRE_CHAP_NHAN_TOI_DA_GIO = 47;
const TRE_HOAN_THANH_TOI_DA_NGAY = 3; // từ lúc chấp nhận đến lúc khách hàng xác nhận hoàn thành
const THOI_GIAN_DANH_GIA_TOI_DA_NGAY = 12;
const LE_AN_TOAN_PHUT = 30; // mọi thời điểm cách lúc chạy seed ít nhất chừng này
const GIA_TOI_THIEU = 20000;

const lamTronGia = (gia) => Math.max(GIA_TOI_THIEU, Math.round(gia / 1000) * 1000);

// Giá lệch về phía thấp; phần lớn làm tròn mười nghìn, còn lại có giá lẻ, giá thật rẻ, thật đắt hoặc có phần thập phân.
function taoGia(ngauNhien, nhom) {
  const goc = nhom.giaThap + (nhom.giaCao - nhom.giaThap) * Math.pow(ngauNhien.so(), 1.5);
  const kieu = ngauNhien.so();
  if (kieu < 0.01) return ngauNhien.nguyen(20, 50) * 1000;
  if (kieu < 0.03) return Math.round((goc * ngauNhien.nguyen(5, 20)) / 10000) * 10000;
  if (kieu < 0.81) return Math.max(GIA_TOI_THIEU, Math.round(goc / 10000) * 10000);
  if (kieu < 0.91) return Math.max(GIA_TOI_THIEU, Math.round(goc / 50000) * 50000);
  if (kieu < 0.97) return lamTronGia(goc);
  return lamTronGia(goc) + 0.5;
}

function taoMoTaDeXuat(ngauNhien, nhom) {
  const cacViec = ngauNhien.chonKhongTrung(nhom.congViec, () => 1, ngauNhien.nguyen(1, 3));
  const cacCau = [`${vietHoa(cacViec.join(', '))}.`];
  if (ngauNhien.xacSuat(0.6)) cacCau.push(ngauNhien.chon(BAO_HANH));
  return cacCau.join(' ');
}

function taoDeXuat(ngauNhien, { khoaTin, nhom, kyThuatVien, thoiDiemGui }) {
  const deXuat = {
    tin: khoaTin,
    ktv: kyThuatVien.taiKhoan.khoa,
    price: taoGia(ngauNhien, nhom),
    description: taoMoTaDeXuat(ngauNhien, nhom),
    taoLuc: doiSangIso(thoiDiemGui),
  };
  if (!ngauNhien.xacSuat(TY_LE_KHONG_GHI_THOI_GIAN_DU_KIEN)) deXuat.estimatedDuration = ngauNhien.chon(THOI_GIAN_DU_KIEN);
  if (ngauNhien.xacSuat(TY_LE_SUA_DE_XUAT)) deXuat.sua = { price: lamTronGia(deXuat.price * (0.85 + 0.1 * ngauNhien.so())) };
  return deXuat;
}

// Đề xuất đầu tiên của một kỹ thuật viên gửi sau 1 giờ đến khoảng 2,5 ngày kể từ lúc đăng tin (dồn về phía sớm).
function tinhThoiDiemGui(ngauNhien, taoLucTinMs, gioiHanMs) {
  return Math.min(taoLucTinMs + GIO + Math.pow(ngauNhien.so(), 2) * TRE_GUI_DE_XUAT_TOI_DA_GIO * GIO, gioiHanMs);
}

function taoDeXuatGuiLai(ngauNhien, { khoaTin, nhom, kyThuatVien, deXuatDaRut, gioiHanMs }) {
  const thoiDiem = Math.min(Date.parse(deXuatDaRut.taoLuc) + (1 + ngauNhien.so() * 23) * GIO, gioiHanMs);
  const deXuat = taoDeXuat(ngauNhien, { khoaTin, nhom, kyThuatVien, thoiDiemGui: thoiDiem });
  deXuat.price = lamTronGia(deXuatDaRut.price * (0.9 + 0.2 * ngauNhien.so()));
  return deXuat;
}

// Điểm sao quanh điểm kỳ vọng của người được chấm, thêm nhiễu xấp xỉ phân phối chuẩn, kẹp trong 1-5.
function taoSoSao(ngauNhien, diemKyVong) {
  const nhieu = (ngauNhien.so() + ngauNhien.so() + ngauNhien.so() - 1.5) * 1.4;
  return Math.min(5, Math.max(1, Math.round(diemKyVong + nhieu)));
}

function taoNhanXet(ngauNhien, kho, soSao) {
  const nhom = soSao <= 2 ? kho.thap : soSao === 3 ? kho.vua : kho.cao;
  const xacSuatCo = soSao <= 2 ? 0.8 : 0.55;
  return ngauNhien.xacSuat(xacSuatCo) ? ngauNhien.chon(nhom) : undefined;
}

function taoDanhGia(ngauNhien, { khoaTin, nguoiGui, diemKyVong, kho, thoiDiem }) {
  const soSao = taoSoSao(ngauNhien, diemKyVong);
  const danhGia = { tin: khoaTin, nguoiGui, rating: soSao, taoLuc: doiSangIso(thoiDiem) };
  const nhanXet = taoNhanXet(ngauNhien, kho, soSao);
  if (nhanXet) danhGia.comment = nhanXet;
  return danhGia;
}

// Khách hàng đánh giá kỹ thuật viên được chọn (US18) và ngược lại (US19); mỗi bên có thể bỏ qua, nên có tin chỉ một
// bên đánh giá hoặc không ai đánh giá.
function sinhDanhGia(ngauNhien, { nguCanh, kyThuatVienDuocChon, hoanThanhMs, bayGio }) {
  const batDau = hoanThanhMs + GIO;
  const cuoi = Math.min(hoanThanhMs + THOI_GIAN_DANH_GIA_TOI_DA_NGAY * NGAY, bayGio.getTime() - LE_AN_TOAN_PHUT * PHUT);
  const thoiDiem = () => Math.min(batDau + ngauNhien.so() * Math.max(0, cuoi - batDau), cuoi);
  const cacDanhGia = [];
  if (ngauNhien.xacSuat(TY_LE_KHACH_DANH_GIA)) {
    cacDanhGia.push(taoDanhGia(ngauNhien, {
      khoaTin: nguCanh.khoa, nguoiGui: nguCanh.khach.taiKhoan.khoa, diemKyVong: kyThuatVienDuocChon.diem, kho: NHAN_XET_KHACH, thoiDiem: thoiDiem(),
    }));
  }
  if (ngauNhien.xacSuat(TY_LE_KTV_DANH_GIA)) {
    cacDanhGia.push(taoDanhGia(ngauNhien, {
      khoaTin: nguCanh.khoa, nguoiGui: kyThuatVienDuocChon.taiKhoan.khoa, diemKyVong: nguCanh.khach.diem, kho: NHAN_XET_KTV, thoiDiem: thoiDiem(),
    }));
  }
  return cacDanhGia;
}

// Trả về { deXuat, danhGia, ktvDuocChon, chapNhanLuc, hoanThanhLuc } cho một tin. ktvDuocChon và chapNhanLuc chỉ có khi tin đã chọn
// kỹ thuật viên, hoanThanhLuc chỉ có khi tin đã hoàn thành.
function sinhHoatDongCuaTin(ngauNhien, nguCanh, cacKyThuatVien, bayGio) {
  const gioiHanMs = bayGio.getTime() - LE_AN_TOAN_PHUT * PHUT;
  const dangHoatDong = cacKyThuatVien.filter((hoSo) => hoSo.trongSo > 0);
  const soDuKien = ngauNhien.chonTheoCap(PHAN_BO_SO_DE_XUAT[nguCanh.ketQua]);
  const cacNguoiGui = ngauNhien.chonKhongTrung(
    dangHoatDong,
    (hoSo) => hoSo.trongSo * (hoSo.chuyenMon.includes(nguCanh.nhom.ten) ? TRONG_SO_DUNG_CHUYEN_MON : 1),
    soDuKien,
  );
  const daChonKyThuatVien = ['DA_CHON', 'HOAN_THANH'].includes(nguCanh.ketQua);
  const chiSoDuocChon = daChonKyThuatVien ? ngauNhien.nguyen(0, cacNguoiGui.length - 1) : -1;

  const cacDeXuat = [];
  let deXuatDuocChon;
  cacNguoiGui.forEach((kyThuatVien, chiSo) => {
    const thoiDiemGui = tinhThoiDiemGui(ngauNhien, nguCanh.taoLucMs, gioiHanMs);
    const deXuat = taoDeXuat(ngauNhien, { khoaTin: nguCanh.khoa, nhom: nguCanh.nhom, kyThuatVien, thoiDiemGui });
    const duocChon = chiSo === chiSoDuocChon;
    if (!duocChon && ngauNhien.xacSuat(TY_LE_RUT)) {
      deXuat.rut = true;
      cacDeXuat.push(deXuat);
      if (ngauNhien.xacSuat(TY_LE_GUI_LAI_SAU_KHI_RUT)) {
        cacDeXuat.push(taoDeXuatGuiLai(ngauNhien, { khoaTin: nguCanh.khoa, nhom: nguCanh.nhom, kyThuatVien, deXuatDaRut: deXuat, gioiHanMs }));
      }
      return;
    }
    cacDeXuat.push(deXuat);
    if (duocChon) deXuatDuocChon = { deXuat, kyThuatVien };
  });

  if (!deXuatDuocChon) return { deXuat: cacDeXuat, danhGia: [] };

  // Chấp nhận sau khi mọi đề xuất của tin đã được gửi: tin ở trạng thái Đã chọn thì không nhận thêm đề xuất (BR07).
  const deXuatMuonNhatMs = Math.max(...cacDeXuat.map((deXuat) => Date.parse(deXuat.taoLuc)));
  const chapNhanMs = Math.min(
    deXuatMuonNhatMs + GIO + ngauNhien.so() * TRE_CHAP_NHAN_TOI_DA_GIO * GIO,
    bayGio.getTime() - (LE_AN_TOAN_PHUT / 3) * PHUT,
  );
  if (ngauNhien.xacSuat(TY_LE_DA_DOC_THONG_BAO[nguCanh.ketQua])) deXuatDuocChon.deXuat.daDocThongBao = true;
  const ketQuaChon = { deXuat: cacDeXuat, danhGia: [], ktvDuocChon: deXuatDuocChon.kyThuatVien.taiKhoan.khoa, chapNhanLuc: doiSangIso(chapNhanMs) };
  if (nguCanh.ketQua !== 'HOAN_THANH') return ketQuaChon;

  const hoanThanhMs = Math.min(
    chapNhanMs + GIO + ngauNhien.so() * TRE_HOAN_THANH_TOI_DA_NGAY * NGAY,
    bayGio.getTime() - LE_AN_TOAN_PHUT * PHUT,
  );
  const danhGia = sinhDanhGia(ngauNhien, { nguCanh, kyThuatVienDuocChon: deXuatDuocChon.kyThuatVien, hoanThanhMs, bayGio });
  return { ...ketQuaChon, danhGia, hoanThanhLuc: doiSangIso(hoanThanhMs) };
}

module.exports = { sinhHoatDongCuaTin };
