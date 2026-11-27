// Định dạng số liệu thống kê theo cách viết tiếng Việt.
import { dinhDangThoiGian } from '../../utils/dinhDang.js';

const soNguyenVn = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });
const motChuSo = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });

export const trong = (v) => v === null || v === undefined || Number.isNaN(v);
export const so = (v) => (trong(v) ? '—' : soNguyenVn.format(v));
export const soLe = (v) => (trong(v) ? '—' : motChuSo.format(v));
export const phanTram = (tyLe) => (trong(tyLe) ? '—' : `${motChuSo.format(tyLe * 100)}%`);
export const tienDayDu = (v) => (trong(v) ? '—' : `${soNguyenVn.format(v)} đ`);

export function tienGon(v) {
  if (trong(v)) return '—';
  if (Math.abs(v) >= 1e9) return `${motChuSo.format(v / 1e9)} tỷ đ`;
  if (Math.abs(v) >= 1e6) return `${motChuSo.format(v / 1e6)} tr đ`;
  return `${soNguyenVn.format(v)} đ`;
}

export const miliGiay = (v) => (trong(v) ? '—' : `${v < 10 ? motChuSo.format(v) : soNguyenVn.format(v)} ms`);

export function dungLuong(byte) {
  if (trong(byte)) return '—';
  const donVi = ['B', 'KB', 'MB', 'GB', 'TB'];
  let giaTri = byte;
  let i = 0;
  while (giaTri >= 1024 && i < donVi.length - 1) {
    giaTri /= 1024;
    i += 1;
  }
  return `${motChuSo.format(giaTri)} ${donVi[i]}`;
}

export function thoiLuong(giay) {
  if (trong(giay)) return '—';
  const ngay = Math.floor(giay / 86400);
  const gio = Math.floor((giay % 86400) / 3600);
  const phut = Math.floor((giay % 3600) / 60);
  if (ngay > 0) return `${ngay} ngày ${gio} giờ`;
  if (gio > 0) return `${gio} giờ ${phut} phút`;
  if (phut > 0) return `${phut} phút`;
  return `${Math.floor(giay)} giây`;
}

export const ngayIsoHien = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '—');

// Khoảng kết thúc ở thời điểm hiện tại thì ô cuối đang dở nên thường thấp hơn các ô trước.
export function ghiChuMocCuoi(range) {
  if (Math.abs(Date.now() - Date.parse(range.end)) > 5 * 60000) return '';
  const donVi = range.bucket === 'hour' ? 'Giờ' : range.bucket === 'month' ? 'Tháng' : 'Ngày';
  return ` ${donVi} cuối chưa trọn.`;
}

// Giá trị một ô trong bảng báo cáo theo kiểu cột do máy chủ khai báo.
export function giaTriTheoCot(cot, giaTri) {
  if (giaTri === null || giaTri === undefined || giaTri === '') return '—';
  if (cot.type === 'datetime') return dinhDangThoiGian(giaTri);
  if (cot.type === 'enum') return cot.labels?.[giaTri] ?? giaTri;
  if (cot.type === 'money') return tienDayDu(giaTri);
  if (cot.type === 'number') return cot.key === 'id' || cot.key === 'httpStatus' ? String(giaTri) : soLe(giaTri);
  return String(giaTri);
}

export const NHAN_HANH_DONG = {
  REGISTER: 'Tạo tài khoản', LOGIN: 'Đăng nhập', LOGOUT: 'Đăng xuất', CREATE_REQUEST: 'Đăng tin', UPDATE_REQUEST: 'Sửa tin',
  CLOSE_REQUEST: 'Đóng tin', COMPLETE_REQUEST: 'Xác nhận hoàn thành', CREATE_PROPOSAL: 'Gửi đề xuất', UPDATE_PROPOSAL: 'Sửa đề xuất',
  ACCEPT_PROPOSAL: 'Chấp nhận đề xuất', WITHDRAW_PROPOSAL: 'Rút đề xuất', CREATE_REVIEW: 'Đánh giá', UPDATE_PROFILE: 'Sửa hồ sơ',
  LOCK_USER: 'Khóa tài khoản', UNLOCK_USER: 'Mở khóa tài khoản', EXPORT_REPORT: 'Xuất báo cáo', UPDATE_ALERT: 'Cập nhật cảnh báo',
  ACCESS_DENIED: 'Bị từ chối quyền', SERVER_ERROR: 'Lỗi máy chủ',
};
