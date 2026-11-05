export const NHAN_TRANG_THAI_YEU_CAU = {
  WAITING_PROPOSAL: 'Chờ đề xuất',
  SELECTED: 'Đã chọn kỹ thuật viên',
  COMPLETED: 'Hoàn thành',
  CLOSED: 'Đã đóng',
};

export const NHAN_TRANG_THAI_DE_XUAT = {
  PENDING: 'Chờ xem xét',
  ACCEPTED: 'Đã chấp nhận',
  REJECTED: 'Không được chọn',
  WITHDRAWN: 'Đã rút',
};

export const NHAN_VAI_TRO = {
  CUSTOMER: 'Khách hàng',
  TECHNICIAN: 'Kỹ thuật viên',
  ADMIN: 'Quản trị viên',
};

export const CAC_LOAI_DICH_VU = ['Sửa máy lạnh', 'Sửa máy giặt', 'Sửa tủ lạnh', 'Sửa ống nước', 'Sửa điện', 'Khác'];

const hai = (so) => String(so).padStart(2, '0');

export function dinhDangThoiGian(giaTri) {
  if (!giaTri) return '—';
  const thoiDiem = new Date(giaTri);
  if (Number.isNaN(thoiDiem.getTime())) return '—';
  return `${hai(thoiDiem.getDate())}/${hai(thoiDiem.getMonth() + 1)}/${thoiDiem.getFullYear()} · ${hai(thoiDiem.getHours())}:${hai(thoiDiem.getMinutes())}`;
}

export function dinhDangTien(soTien) {
  return `${Number(soTien).toLocaleString('vi-VN')} đ`;
}

export function dinhDangMaTin(id) {
  return `SC-${String(id).padStart(3, '0')}`;
}

export function dinhDangDiem(diem) {
  return diem === null || diem === undefined ? 'Chưa có đánh giá' : `${String(diem).replace('.', ',')} / 5`;
}
