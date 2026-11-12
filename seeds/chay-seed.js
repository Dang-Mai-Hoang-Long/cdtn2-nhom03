// Tạo dữ liệu mẫu và tài khoản demo cho môi trường phát triển.
// Đi qua tầng service như khi dùng ứng dụng nên mọi quy tắc nghiệp vụ (BR01-BR16) đều được áp dụng:
// trạng thái tin, đề xuất khác bị từ chối khi chọn kỹ thuật viên, thông báo cho kỹ thuật viên, điểm trung bình.
// Cách dùng: npm run seed        dừng nếu đã có tài khoản demo
//            npm run seed:reset  xóa TOÀN BỘ dữ liệu ứng dụng rồi tạo lại
const bcrypt = require('bcryptjs');
const { truyVan, dongKetNoi } = require('../src/db');
const khoNguoiDung = require('../src/repositories/user.repository');
const dichVuXacThuc = require('../src/services/auth.service');
const dichVuYeuCau = require('../src/services/request.service');
const dichVuDeXuat = require('../src/services/proposal.service');
const dichVuDanhGia = require('../src/services/review.service');
const dichVuThongBao = require('../src/services/notification.service');
const dichVuQuanTri = require('../src/services/admin.service');
const { VAI_TRO } = require('../src/utils/constants');
const { MAT_KHAU_DEMO, QUAN_TRI_VIEN, KHACH_HANG, KY_THUAT_VIEN } = require('./tai-khoan');
const cacTin = require('./tin-sua-chua');
const cacDeXuat = require('./de-xuat');
const cacDanhGia = require('./danh-gia');

const CAC_BANG_UNG_DUNG = 'users, repair_request, proposal, review, notification';
const MOT_NGAY_MS = 24 * 60 * 60 * 1000;
const SO_VONG_BAM_MAT_KHAU = 10;

function layMaDeXuat(cacMaDeXuat, khoaTin, khoaKyThuatVien) {
  const ma = cacMaDeXuat[`${khoaTin}:${khoaKyThuatVien}`];
  if (!ma) throw new Error(`Dữ liệu mẫu sai: tin "${khoaTin}" tham chiếu kỹ thuật viên "${khoaKyThuatVien}" chưa có đề xuất`);
  return ma;
}

function kiemTraMoiTruong() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Không chạy dữ liệu mẫu ở môi trường production');
  }
  if (process.env.DATABASE_URL && process.env.DATABASE_URL === process.env.TEST_DATABASE_URL) {
    throw new Error('DATABASE_URL trùng TEST_DATABASE_URL, hãy kiểm tra lại file .env');
  }
}

async function daCoTaiKhoanDemo() {
  const cacEmail = [...QUAN_TRI_VIEN, ...KHACH_HANG, ...KY_THUAT_VIEN].map((taiKhoan) => taiKhoan.email);
  const { rows } = await truyVan('SELECT count(*)::int AS so FROM users WHERE email = ANY($1)', [cacEmail]);
  return rows[0].so > 0;
}

// Trả về { khoa: { id, role } } để các bước sau gọi service với đúng người dùng.
async function taoTaiKhoan() {
  const nguoiDung = {};
  for (const taiKhoan of QUAN_TRI_VIEN) {
    const daTao = await khoNguoiDung.tao({
      email: taiKhoan.email,
      passwordHash: await bcrypt.hash(MAT_KHAU_DEMO, SO_VONG_BAM_MAT_KHAU),
      fullName: taiKhoan.fullName,
      phone: taiKhoan.phone,
      role: VAI_TRO.QUAN_TRI_VIEN,
    });
    nguoiDung[taiKhoan.khoa] = { id: daTao.id, role: daTao.role };
  }
  const cacNhom = [[KHACH_HANG, VAI_TRO.KHACH_HANG], [KY_THUAT_VIEN, VAI_TRO.KY_THUAT_VIEN]];
  for (const [danhSach, role] of cacNhom) {
    for (const taiKhoan of danhSach) {
      const daTao = await dichVuXacThuc.dangKy({ email: taiKhoan.email, password: MAT_KHAU_DEMO, fullName: taiKhoan.fullName, phone: taiKhoan.phone, role });
      nguoiDung[taiKhoan.khoa] = { id: daTao.id, role };
    }
  }
  return nguoiDung;
}

async function taoCacTin(nguoiDung) {
  const cacMaTin = {};
  for (const mau of cacTin) {
    const thoiGianMongMuon = new Date(Date.now() + mau.soNgayToi * MOT_NGAY_MS);
    thoiGianMongMuon.setHours(mau.gioMongMuon, 0, 0, 0);
    const daTao = await dichVuYeuCau.taoYeuCau(nguoiDung[mau.khachHang], {
      title: mau.title,
      description: mau.description,
      category: mau.category,
      location: mau.location,
      preferredTime: thoiGianMongMuon.toISOString(),
    });
    cacMaTin[mau.khoa] = daTao.id;
  }
  return cacMaTin;
}

// Khóa của kết quả: "<khóa tin>:<khóa kỹ thuật viên>" -> mã đề xuất.
async function guiCacDeXuat(nguoiDung, cacMaTin) {
  const cacMaDeXuat = {};
  for (const mau of cacDeXuat) {
    const kyThuatVien = nguoiDung[mau.ktv];
    const daGui = await dichVuDeXuat.guiDeXuat(kyThuatVien, {
      requestId: cacMaTin[mau.tin],
      price: mau.price,
      description: mau.description,
      estimatedDuration: mau.estimatedDuration,
    });
    cacMaDeXuat[`${mau.tin}:${mau.ktv}`] = daGui.id;
    if (mau.rut) await dichVuDeXuat.rutDeXuat(kyThuatVien, daGui.id);
  }
  return cacMaDeXuat;
}

// Đưa từng tin tới trạng thái cuối bằng đúng các thao tác của khách hàng.
async function hoanTatCacTin(nguoiDung, cacMaTin, cacMaDeXuat) {
  for (const mau of cacTin) {
    const khachHang = nguoiDung[mau.khachHang];
    const maTin = cacMaTin[mau.khoa];
    if (mau.ketQua === 'DA_DONG') await dichVuYeuCau.dongYeuCau(khachHang, maTin);
    if (mau.ketQua === 'DA_CHON' || mau.ketQua === 'HOAN_THANH') {
      await dichVuDeXuat.chapNhanDeXuat(khachHang, layMaDeXuat(cacMaDeXuat, mau.khoa, mau.ktvDuocChon));
    }
    if (mau.ketQua === 'HOAN_THANH') await dichVuYeuCau.xacNhanHoanThanh(khachHang, maTin);
  }
}

async function guiCacDanhGia(nguoiDung, cacMaTin) {
  for (const mau of cacDanhGia) {
    await dichVuDanhGia.taoDanhGia(nguoiDung[mau.nguoiGui], { requestId: cacMaTin[mau.tin], rating: mau.rating, comment: mau.comment });
  }
}

async function danhDauThongBaoDaDoc(nguoiDung, cacMaDeXuat) {
  for (const mau of cacDeXuat.filter((deXuat) => deXuat.daDocThongBao)) {
    const { rows } = await truyVan('SELECT id FROM notification WHERE user_id = $1 AND related_id = $2', [nguoiDung[mau.ktv].id, cacMaDeXuat[`${mau.tin}:${mau.ktv}`]]);
    for (const dong of rows) await dichVuThongBao.danhDauDaDoc(nguoiDung[mau.ktv], dong.id);
  }
}

async function khoaCacTaiKhoanDemo(nguoiDung) {
  for (const taiKhoan of [...KHACH_HANG, ...KY_THUAT_VIEN].filter((tk) => tk.biKhoa)) {
    await dichVuQuanTri.datTrangThaiKhoa(nguoiDung[taiKhoan.khoa].id, true);
  }
}

async function chayDuLieuMau({ datLai = false } = {}) {
  kiemTraMoiTruong();
  if (datLai) {
    await truyVan(`TRUNCATE ${CAC_BANG_UNG_DUNG} RESTART IDENTITY CASCADE`);
  } else if (await daCoTaiKhoanDemo()) {
    throw new Error('Đã có tài khoản demo trong CSDL. Chạy "npm run seed:reset" để xóa toàn bộ dữ liệu và tạo lại.');
  }

  const nguoiDung = await taoTaiKhoan();
  const cacMaTin = await taoCacTin(nguoiDung);
  const cacMaDeXuat = await guiCacDeXuat(nguoiDung, cacMaTin);
  await hoanTatCacTin(nguoiDung, cacMaTin, cacMaDeXuat);
  await guiCacDanhGia(nguoiDung, cacMaTin);
  await danhDauThongBaoDaDoc(nguoiDung, cacMaDeXuat);
  await khoaCacTaiKhoanDemo(nguoiDung);

  return {
    soTaiKhoan: Object.keys(nguoiDung).length,
    soTin: Object.keys(cacMaTin).length,
    soDeXuat: Object.keys(cacMaDeXuat).length,
    soDanhGia: cacDanhGia.length,
  };
}

function inKetQua(ketQua) {
  console.log(`Đã tạo ${ketQua.soTaiKhoan} tài khoản, ${ketQua.soTin} tin, ${ketQua.soDeXuat} đề xuất, ${ketQua.soDanhGia} đánh giá.`);
  console.log(`\nTài khoản demo (mật khẩu chung: ${MAT_KHAU_DEMO})`);
  const cacNhom = [['Quản trị viên', QUAN_TRI_VIEN], ['Khách hàng', KHACH_HANG], ['Kỹ thuật viên', KY_THUAT_VIEN]];
  for (const [nhan, danhSach] of cacNhom) {
    for (const taiKhoan of danhSach) {
      console.log(`  ${nhan.padEnd(14)} ${taiKhoan.email.padEnd(18)} ${taiKhoan.fullName}${taiKhoan.biKhoa ? ' (bị khóa)' : ''}`);
    }
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
