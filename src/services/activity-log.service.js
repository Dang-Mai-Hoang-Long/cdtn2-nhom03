// Quyết định yêu cầu nào được ghi vào nhật ký hoạt động. Chỉ ghi: thao tác làm thay đổi dữ liệu, đăng ký / đăng nhập /
// đăng xuất (kể cả đăng nhập thất bại), lần bị từ chối quyền (403) và lỗi máy chủ (500). Yêu cầu đọc bình thường không ghi.
// Không lưu địa chỉ IP, chuỗi User-Agent gốc, email đã nhập hay bất kỳ phần nào của thân yêu cầu.
const khoNhatKy = require('../repositories/activity-log.repository');
const khoNguoiDung = require('../repositories/user.repository');
const { phanLoaiThietBi } = require('../utils/thiet-bi');
const { ID_TOI_DA } = require('../utils/constants');

const CAC_LOAI_BAO_CAO = new Set(['users', 'revenue', 'transactions', 'activity', 'system', 'errors', 'performance']);

function docMaDoiTuong(giaTri) {
  const so = Number(giaTri);
  return Number.isInteger(so) && so > 0 && so <= ID_TOI_DA ? so : null;
}

async function timMaNguoiDungTheoEmail(email) {
  if (typeof email !== 'string') return null;
  const nguoiDung = await khoNguoiDung.timTheoEmailKemMatKhau(email.trim().toLowerCase());
  return nguoiDung ? { id: nguoiDung.id, role: nguoiDung.role } : null;
}

async function taoBanGhi({ req, maHttp, tuyen, thanTraVe }) {
  const nguoiDung = req.nguoiDung ?? null;
  const chung = {
    userId: nguoiDung?.id ?? null,
    userRole: nguoiDung?.role ?? null,
    httpStatus: maHttp,
    route: `${req.method} ${tuyen?.mau ?? '(đường dẫn khác)'}`,
    ...phanLoaiThietBi(req.headers['user-agent']),
    targetType: null,
    targetId: null,
  };

  if (maHttp >= 500) return { ...chung, action: 'SERVER_ERROR', status: 'FAILURE' };

  const hanhDong = tuyen?.hanhDong;
  if (!hanhDong) {
    return maHttp === 403 && nguoiDung ? { ...chung, action: 'ACCESS_DENIED', status: 'FAILURE' } : null;
  }

  const banGhi = { ...chung, action: hanhDong, targetType: tuyen.doiTuong, targetId: docMaDoiTuong(tuyen.maDoiTuong) };
  if (maHttp >= 400) {
    if (hanhDong === 'LOGIN' && (maHttp === 401 || maHttp === 403)) {
      const timThay = await timMaNguoiDungTheoEmail(req.body?.email);
      return { ...banGhi, userId: timThay?.id ?? null, userRole: timThay?.role ?? null, targetId: timThay?.id ?? null, status: 'FAILURE' };
    }
    // Lỗi nhập liệu (400, 404, 409) là thao tác bình thường của người dùng, không ghi.
    return maHttp === 403 ? { ...banGhi, status: 'FAILURE' } : null;
  }

  const duLieu = thanTraVe?.data;
  if (hanhDong === 'LOGIN' || hanhDong === 'REGISTER') {
    const taiKhoan = hanhDong === 'LOGIN' ? duLieu?.user : duLieu;
    return { ...banGhi, userId: taiKhoan?.id ?? null, userRole: taiKhoan?.role ?? null, targetId: taiKhoan?.id ?? null, status: 'SUCCESS' };
  }
  if (hanhDong.startsWith('CREATE_')) banGhi.targetId = docMaDoiTuong(duLieu?.id);
  if (hanhDong === 'LOGOUT' || hanhDong === 'UPDATE_PROFILE' || hanhDong === 'CHANGE_PASSWORD') banGhi.targetId = banGhi.userId;
  if (hanhDong === 'EXPORT_REPORT' && CAC_LOAI_BAO_CAO.has(tuyen.maDoiTuong)) banGhi.route = banGhi.route.replace(':id', tuyen.maDoiTuong);
  return { ...banGhi, status: 'SUCCESS' };
}

// Dòng chưa ghi được (thường là lỗi 500 đúng lúc CSDL mất kết nối) được giữ trong bộ nhớ rồi ghi bù kèm thời điểm
// xảy ra, để số "Lỗi hệ thống" không bỏ sót sự cố. Backend khởi động lại trước khi ghi bù thì các dòng này mất.
const SO_DONG_CHO_TOI_DA = 1000;
const dongCho = [];
let dangGhiBu = false;

async function ghiBu() {
  if (dangGhiBu) return;
  dangGhiBu = true;
  try {
    while (dongCho.length > 0) {
      await khoNhatKy.them(dongCho[0]);
      dongCho.shift();
    }
  } catch {
    // CSDL vẫn chưa ghi được: để lại cho lần sau.
  } finally {
    dangGhiBu = false;
  }
}

// Gọi sau khi phản hồi đã gửi xong; lỗi ghi nhật ký (ví dụ CSDL đang dừng) không được ảnh hưởng tới yêu cầu.
async function ghiTuYeuCau(thongTin) {
  const luc = new Date().toISOString();
  let banGhi = null;
  try {
    banGhi = await taoBanGhi(thongTin);
    if (!banGhi) return;
    await khoNhatKy.them(banGhi);
    if (dongCho.length > 0) await ghiBu();
  } catch (loi) {
    if (banGhi && dongCho.length < SO_DONG_CHO_TOI_DA) dongCho.push({ ...banGhi, createdAt: luc });
    if (process.env.NODE_ENV !== 'test') console.error('Không ghi được nhật ký hoạt động:', loi.message);
  }
}

module.exports = { ghiTuYeuCau, taoBanGhi, ghiBu };
