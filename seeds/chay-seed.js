// Tạo dữ liệu mẫu và tài khoản demo cho môi trường phát triển.
// Cách dùng: npm run seed        dừng nếu đã có tài khoản demo
//            npm run seed:reset  xóa TOÀN BỘ dữ liệu ứng dụng rồi tạo lại
// Dữ liệu viết tay nằm ở thu-cong/; bộ thực thi (thuc-thi.js) tạo qua service nên mọi quy tắc nghiệp vụ được áp dụng.
const { truyVan, dongKetNoi } = require('../src/db');
const thuCong = require('./thu-cong');
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

async function chayDuLieuMau({ datLai = false, bayGio = new Date(), tienDo } = {}) {
  kiemTraMoiTruong();
  if (datLai) {
    await truyVan(`TRUNCATE ${CAC_BANG_UNG_DUNG} RESTART IDENTITY CASCADE`);
  } else if (await daCoTaiKhoanDemo()) {
    throw new Error('Đã có tài khoản demo trong CSDL. Chạy "npm run seed:reset" để xóa toàn bộ dữ liệu và tạo lại.');
  }
  return thucThiKeHoach(gopKeHoach(thuCong), { bayGio, tienDo });
}

function inKetQua(ketQua) {
  console.log(`Đã tạo ${ketQua.soTaiKhoan} tài khoản, ${ketQua.soTin} tin, ${ketQua.soDeXuat} đề xuất, ${ketQua.soDanhGia} đánh giá.`);
  console.log(`\nTài khoản demo (mật khẩu chung: ${MAT_KHAU_DEMO})`);
  for (const taiKhoan of thuCong.taiKhoan) {
    console.log(`  ${NHAN_VAI_TRO[taiKhoan.role].padEnd(14)} ${taiKhoan.email.padEnd(22)} ${taiKhoan.fullName}${taiKhoan.biKhoa ? ' (bị khóa)' : ''}`);
  }
}

if (require.main === module) {
  chayDuLieuMau({ datLai: process.argv.includes('--reset') })
    .then(inKetQua)
    .catch((loi) => {
      console.error(loi.message);
      process.exitCode = 1;
    })
    .finally(dongKetNoi);
}

module.exports = { chayDuLieuMau };
