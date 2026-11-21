// Tạo dữ liệu mẫu và tài khoản demo cho môi trường phát triển: phần viết tay (thu-cong/, 50 tin) và phần sinh tự động
// (tu-dong/, mặc định 1000 tin). Bộ thực thi (thuc-thi.js) tạo qua service nên mọi quy tắc nghiệp vụ được áp dụng.
// Cách dùng: npm run seed                  dừng nếu đã có tài khoản demo
//            npm run seed:reset            xóa TOÀN BỘ dữ liệu ứng dụng rồi tạo lại
//            npm run seed:thu-cong         chỉ phần viết tay (nhanh, vài giây)
//            npm run seed -- --so-tin=300  đổi số tin tự động; --hat-giong=N đổi hạt giống (cùng hạt giống thì cùng dữ liệu)
const { truyVan, dongKetNoi } = require('../src/db');
const thuCong = require('./thu-cong');
const { sinhKeHoach, SO_TIN_MAC_DINH, HAT_GIONG_MAC_DINH } = require('./tu-dong');
const { gopKeHoach } = require('./ke-hoach');
const { thucThiKeHoach } = require('./thuc-thi');
const { MAT_KHAU_DEMO } = require('./hang-so');

const CAC_BANG_UNG_DUNG = 'users, repair_request, proposal, review, notification';
const NHAN_VAI_TRO = { ADMIN: 'Quản trị viên', CUSTOMER: 'Khách hàng', TECHNICIAN: 'Kỹ thuật viên' };

function kiemTraMoiTruong() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Không chạy dữ liệu mẫu ở môi trường production');
  }
  if (process.env.DATABASE_URL && process.env.DATABASE_URL === process.env.TEST_DATABASE_URL) {
    throw new Error('DATABASE_URL trùng TEST_DATABASE_URL, hãy kiểm tra lại file .env');
  }
}

async function daCoTaiKhoanDemo() {
  const cacEmail = thuCong.taiKhoan.map((taiKhoan) => taiKhoan.email);
  const { rows } = await truyVan('SELECT count(*)::int AS so FROM users WHERE email = ANY($1)', [cacEmail]);
  return rows[0].so > 0;
}

// soTinTuDong = 0 chỉ tạo phần viết tay. Cùng soTinTuDong, hatGiong và bayGio thì dữ liệu tự động giống hệt nhau.
async function chayDuLieuMau({ datLai = false, soTinTuDong = SO_TIN_MAC_DINH, hatGiong = HAT_GIONG_MAC_DINH, bayGio = new Date(), tienDo } = {}) {
  kiemTraMoiTruong();
  const keHoach = gopKeHoach(thuCong, sinhKeHoach({ soTin: soTinTuDong, hatGiong, bayGio }));
  if (datLai) {
    await truyVan(`TRUNCATE ${CAC_BANG_UNG_DUNG} RESTART IDENTITY CASCADE`);
  } else if (await daCoTaiKhoanDemo()) {
    throw new Error('Đã có tài khoản demo trong CSDL. Chạy "npm run seed:reset" để xóa toàn bộ dữ liệu và tạo lại.');
  }
  const ketQua = await thucThiKeHoach(keHoach, { bayGio, tienDo });
  return { ...ketQua, soTinThuCong: thuCong.tin.length, soTinTuDong: keHoach.tin.length - thuCong.tin.length };
}

function docSoTuThamSo(cacThamSo, ten) {
  const muc = cacThamSo.find((thamSo) => thamSo.startsWith(`--${ten}=`));
  return muc === undefined ? undefined : Number(muc.slice(ten.length + 3));
}

function docTuyChon(cacThamSo) {
  const tuyChon = { datLai: cacThamSo.includes('--reset') };
  if (cacThamSo.includes('--chi-thu-cong')) tuyChon.soTinTuDong = 0;
  const soTin = docSoTuThamSo(cacThamSo, 'so-tin');
  if (soTin !== undefined) tuyChon.soTinTuDong = soTin;
  const hatGiong = docSoTuThamSo(cacThamSo, 'hat-giong');
  if (hatGiong !== undefined) tuyChon.hatGiong = hatGiong;
  return tuyChon;
}

function inKetQua(ketQua, thoiGianGiay) {
  console.log(`Đã tạo ${ketQua.soTaiKhoan} tài khoản, ${ketQua.soTin} tin (${ketQua.soTinThuCong} viết tay + ${ketQua.soTinTuDong} tự động), ${ketQua.soDeXuat} đề xuất, ${ketQua.soDanhGia} đánh giá trong ${thoiGianGiay} giây.`);
  console.log(`\nTài khoản demo viết tay (mật khẩu chung: ${MAT_KHAU_DEMO})`);
  for (const taiKhoan of thuCong.taiKhoan) {
    console.log(`  ${NHAN_VAI_TRO[taiKhoan.role].padEnd(14)} ${taiKhoan.email.padEnd(22)} ${taiKhoan.fullName}${taiKhoan.biKhoa ? ' (bị khóa)' : ''}`);
  }
  if (ketQua.soTinTuDong > 0) {
    console.log(`\nTài khoản tự động: auto.kh001@demo.vn (khách hàng), auto.ktv001@demo.vn (kỹ thuật viên), ... cùng mật khẩu ${MAT_KHAU_DEMO}.`);
  }
}

if (require.main === module) {
  const batDau = Date.now();
  const tienDo = (buoc, daXong, tong) => console.log(`  ${buoc}: ${daXong}/${tong}`);
  chayDuLieuMau({ ...docTuyChon(process.argv.slice(2)), tienDo })
    .then((ketQua) => inKetQua(ketQua, Math.round((Date.now() - batDau) / 1000)))
    .catch((loi) => {
      console.error(loi.message);
      process.exitCode = 1;
    })
    .finally(dongKetNoi);
}

module.exports = { chayDuLieuMau };
