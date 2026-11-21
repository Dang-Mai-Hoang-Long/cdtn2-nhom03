// Sinh phần "tin" của dữ liệu tự động: nội dung, loại dịch vụ, địa điểm, trạng thái cuối và thời điểm đăng.
// Đề xuất và đánh giá của từng tin do sinh-hoat-dong.js sinh sau, dựa trên "ngữ cảnh" mà file này trả về.
const { PHUT, GIO, NGAY, doiSangIso } = require('./thoi-gian');
const { vietHoa } = require('./chuoi');
const {
  LOAI_DICH_VU, LOAI_HIEM, LICH_SU, KHAN_CAP, TIEP_CAN, LIEN_HE, BO_SUNG, KY_TU_DAC_BIET,
} = require('./du-lieu-van-ban');
const { DIA_PHUONG, DUONG } = require('./du-lieu-nguoi');

const PHAN_BO_KET_QUA = [['CHO_DE_XUAT', 35], ['DA_CHON', 12], ['HOAN_THANH', 38], ['DA_DONG', 15]];
// Tuổi của tin (số ngày từ lúc đăng đến lúc chạy seed) theo trạng thái cuối. Tin hoàn thành đủ cũ để còn thời gian
// chấp nhận, làm việc và đánh giá; một phần tin chờ đề xuất đã để rất lâu.
const TUOI_TIN_NGAY = { CHO_DE_XUAT: [0, 21], DA_CHON: [1, 30], HOAN_THANH: [8, 150], DA_DONG: [2, 120] };
const TUOI_TIN_CHO_CU_NGAY = [22, 75];
const TY_LE_TIN_CHO_CU = 0.12;
const GIO_TOI_THIEU_SAU_KHI_DANG = 2;
const GIO_TOI_DA_TRONG_NGAY = 22;
const TY_LE_LOAI_NGOAI_DANH_SACH = 0.02;
const TY_LE_MO_TA_DAI = 0.01;
const TY_LE_KY_TU_DAC_BIET = 0.015;
const TY_LE_DIA_CHI_CHI_TIET = 0.12;
const TY_LE_SUA_TIN = 0.06;
const TY_LE_THOI_GIAN_MONG_MUON_DA_QUA = 0.15;
const DO_DAI_TIEU_DE_TOI_DA = 200;
const GIO_UTC_TOI_DA_TRONG_NGAY = 13; // 0-13 giờ UTC là 7-20 giờ giờ Việt Nam

const loaiKhac = LOAI_DICH_VU.find((loai) => loai.ten === 'Khác');
const thaySo = (ngauNhien, cau) => cau.replace('{n}', String(ngauNhien.nguyen(1, 12)));

// Trả về { nhom, category }: nhom quyết định nội dung và giá, category là chuỗi lưu vào tin (có thể ngoài danh sách của giao diện).
function chonLoai(ngauNhien) {
  if (ngauNhien.xacSuat(TY_LE_LOAI_NGOAI_DANH_SACH)) return { nhom: loaiKhac, category: ngauNhien.chon(LOAI_HIEM) };
  const nhom = ngauNhien.chonTheoTrongSo(LOAI_DICH_VU, (loai) => loai.trongSo);
  return { nhom, category: nhom.ten };
}

function taoTieuDe(ngauNhien, thietBi, suCo) {
  const goc = vietHoa(`${thietBi} ${suCo.tieuDe}`);
  const kieu = ngauNhien.so();
  if (kieu < 0.15) return `Cần sửa gấp: ${goc.charAt(0).toLowerCase()}${goc.slice(1)}`;
  if (kieu < 0.25) return `${goc} (nhờ báo giá)`;
  if (kieu < 0.3) return `${goc}, ở chung cư`;
  return goc;
}

function taoMoTa(ngauNhien, suCo) {
  const cacCau = [`${vietHoa(suCo.chiTiet)}.`];
  if (ngauNhien.xacSuat(0.7)) cacCau.push(thaySo(ngauNhien, ngauNhien.chon(LICH_SU)));
  if (ngauNhien.xacSuat(0.35)) cacCau.push(ngauNhien.chon(KHAN_CAP));
  if (ngauNhien.xacSuat(0.4)) cacCau.push(ngauNhien.chon(TIEP_CAN));
  if (ngauNhien.xacSuat(0.3)) cacCau.push(ngauNhien.chon(LIEN_HE));
  if (ngauNhien.xacSuat(TY_LE_MO_TA_DAI)) {
    const khoCau = [...LICH_SU, ...TIEP_CAN, ...LIEN_HE, ...KHAN_CAP];
    const soCauThem = ngauNhien.nguyen(15, 30);
    for (let i = 0; i < soCauThem; i += 1) cacCau.push(thaySo(ngauNhien, ngauNhien.chon(khoCau)));
  }
  if (ngauNhien.xacSuat(TY_LE_KY_TU_DAC_BIET)) cacCau.push(ngauNhien.chon(KY_TU_DAC_BIET));
  return cacCau.join(' ');
}

function taoDiaDiem(ngauNhien) {
  const noi = ngauNhien.chonTheoTrongSo(DIA_PHUONG, (diaPhuong) => diaPhuong.trongSo);
  const khuVuc = `${ngauNhien.chon(noi.quan)}, ${noi.thanhPho}`;
  if (!ngauNhien.xacSuat(TY_LE_DIA_CHI_CHI_TIET)) return khuVuc;
  return `${ngauNhien.nguyen(1, 400)} ${ngauNhien.chon(DUONG)}, ${khuVuc}`;
}

// Thời điểm đăng: lùi từ lúc chạy seed theo tuổi của trạng thái cuối, lệch thêm 2-22 giờ để không tròn ngày.
function tinhTaoLuc(ngauNhien, ketQua, bayGio) {
  const laTinChoCu = ketQua === 'CHO_DE_XUAT' && ngauNhien.xacSuat(TY_LE_TIN_CHO_CU);
  const khoang = laTinChoCu ? TUOI_TIN_CHO_CU_NGAY : TUOI_TIN_NGAY[ketQua];
  const soNgay = ngauNhien.nguyen(khoang[0], khoang[1]);
  const soPhutLe = ngauNhien.nguyen(GIO_TOI_THIEU_SAU_KHI_DANG * 60, GIO_TOI_DA_TRONG_NGAY * 60);
  return bayGio.getTime() - soNgay * NGAY - soPhutLe * PHUT;
}

// Giờ tròn trong ngày chứa mốc đã cho, trong khoảng 7-20 giờ giờ Việt Nam.
function layGioTrongNgay(ngauNhien, moc) {
  return Math.floor(moc / NGAY) * NGAY + ngauNhien.nguyen(0, GIO_UTC_TOI_DA_TRONG_NGAY) * GIO;
}

// Tin còn chờ thường hẹn trong tương lai (một phần đã quá hạn); tin khác hẹn vài ngày sau khi đăng.
function tinhThoiGianMongMuon(ngauNhien, ketQua, taoLucMs, bayGio) {
  const conChoVaChuaQuaHan = ketQua === 'CHO_DE_XUAT' && !ngauNhien.xacSuat(TY_LE_THOI_GIAN_MONG_MUON_DA_QUA);
  if (conChoVaChuaQuaHan) return layGioTrongNgay(ngauNhien, bayGio.getTime() + ngauNhien.nguyen(1, 21) * NGAY);
  return layGioTrongNgay(ngauNhien, taoLucMs + ngauNhien.nguyen(1, 10) * NGAY);
}

// Một phần tin được khách hàng sửa ngay sau khi đăng (US21): bổ sung mô tả, thêm ghi chú vào tiêu đề hoặc đổi địa điểm.
function taoSuaTin(ngauNhien, tin) {
  if (!ngauNhien.xacSuat(TY_LE_SUA_TIN)) return undefined;
  const bosung = `${tin.description} ${ngauNhien.chon(BO_SUNG)}`;
  const tieuDeMoi = `${tin.title} (đã cập nhật)`;
  const kieu = ngauNhien.so();
  if (kieu < 0.5 || tieuDeMoi.length > DO_DAI_TIEU_DE_TOI_DA) return { description: bosung };
  if (kieu < 0.8) return { title: tieuDeMoi };
  return { description: bosung, location: taoDiaDiem(ngauNhien) };
}

// "Ngữ cảnh" của một tin: tin theo dạng kế hoạch (chưa có khoa, ktvDuocChon, chapNhanLuc) cùng thông tin để sinh hoạt động.
function taoNguCanhTin(ngauNhien, { khach, ketQua, bayGio }) {
  const { nhom, category } = chonLoai(ngauNhien);
  const thietBi = ngauNhien.chon(nhom.thietBi);
  const suCo = ngauNhien.chon(nhom.suCo);
  const taoLucMs = tinhTaoLuc(ngauNhien, ketQua, bayGio);
  const tin = {
    khachHang: khach.taiKhoan.khoa,
    title: taoTieuDe(ngauNhien, thietBi, suCo),
    description: taoMoTa(ngauNhien, suCo),
    category,
    location: taoDiaDiem(ngauNhien),
    thoiGianMongMuon: doiSangIso(tinhThoiGianMongMuon(ngauNhien, ketQua, taoLucMs, bayGio)),
    ketQua,
    taoLuc: doiSangIso(taoLucMs),
  };
  const suaTin = taoSuaTin(ngauNhien, tin);
  if (suaTin) tin.suaTin = suaTin;
  return { tin, nhom, khach, ketQua, taoLucMs };
}

// Sinh soTin ngữ cảnh, xếp theo thời điểm đăng (tin cũ trước) rồi mới đặt khóa, để mã tin tăng theo thời gian như dữ liệu thật.
function sinhNguCanhTin(ngauNhien, { soTin, khachHang, bayGio }) {
  const cacNguCanh = Array.from({ length: soTin }, () => {
    const ketQua = ngauNhien.chonTheoCap(PHAN_BO_KET_QUA);
    const khach = ngauNhien.chonTheoTrongSo(khachHang, (hoSo) => hoSo.trongSo);
    return taoNguCanhTin(ngauNhien, { khach, ketQua, bayGio });
  });
  cacNguCanh.sort((a, b) => a.taoLucMs - b.taoLucMs);
  cacNguCanh.forEach((nguCanh, chiSo) => {
    nguCanh.khoa = `td-${String(chiSo + 1).padStart(4, '0')}`;
    nguCanh.tin.khoa = nguCanh.khoa;
  });
  return cacNguCanh;
}

module.exports = { sinhNguCanhTin };
