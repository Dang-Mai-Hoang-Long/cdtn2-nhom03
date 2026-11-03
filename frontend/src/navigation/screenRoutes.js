export const danhSachManHinh = [
  { maManHinh: '01', duongDan: 'login', tieuDe: 'Đăng nhập', vaiTro: 'Tài khoản', nhomVaiTro: 'Tài khoản', mucDieuHuong: [] },
  { maManHinh: '02', duongDan: 'register', tieuDe: 'Đăng ký', vaiTro: 'Tài khoản', nhomVaiTro: 'Tài khoản', mucDieuHuong: [] },
  { maManHinh: '03', duongDan: 'customer/requests', tieuDe: 'Tin của tôi', vaiTro: 'Khách hàng', nhomVaiTro: 'Khách hàng', mucDieuHuong: ['Tin của tôi', 'Đăng tin'] },
  { maManHinh: '04', duongDan: 'customer/requests/new', tieuDe: 'Đăng tin sửa chữa', vaiTro: 'Khách hàng', nhomVaiTro: 'Khách hàng', mucDieuHuong: ['Tin của tôi', 'Đăng tin'] },
  { maManHinh: '05', duongDan: 'customer/requests/SC-024', tieuDe: 'Tin và đề xuất', vaiTro: 'Khách hàng', nhomVaiTro: 'Khách hàng', mucDieuHuong: ['Tin của tôi', 'Đăng tin'] },
  { maManHinh: '06', duongDan: 'customer/proposals/DX-018', tieuDe: 'Chi tiết đề xuất', vaiTro: 'Khách hàng', nhomVaiTro: 'Khách hàng', mucDieuHuong: ['Tin của tôi', 'Đăng tin'] },
  { maManHinh: '07', duongDan: 'customer/requests/SC-024/tracking', tieuDe: 'Theo dõi công việc', vaiTro: 'Khách hàng', nhomVaiTro: 'Khách hàng', mucDieuHuong: ['Tin của tôi', 'Đăng tin'] },
  { maManHinh: '08', duongDan: 'customer/requests/SC-024/review', tieuDe: 'Đánh giá kỹ thuật viên', vaiTro: 'Khách hàng', nhomVaiTro: 'Khách hàng', mucDieuHuong: ['Tin của tôi', 'Đăng tin'] },
  { maManHinh: '09', duongDan: 'technician/requests', tieuDe: 'Tìm việc sửa chữa', vaiTro: 'Kỹ thuật viên', nhomVaiTro: 'Kỹ thuật viên', mucDieuHuong: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { maManHinh: '10', duongDan: 'technician/requests/SC-024', tieuDe: 'Chi tiết tin sửa chữa', vaiTro: 'Kỹ thuật viên', nhomVaiTro: 'Kỹ thuật viên', mucDieuHuong: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { maManHinh: '11', duongDan: 'technician/requests/SC-024/proposal', tieuDe: 'Gửi đề xuất', vaiTro: 'Kỹ thuật viên', nhomVaiTro: 'Kỹ thuật viên', mucDieuHuong: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { maManHinh: '12', duongDan: 'technician/proposals', tieuDe: 'Đề xuất của tôi', vaiTro: 'Kỹ thuật viên', nhomVaiTro: 'Kỹ thuật viên', mucDieuHuong: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { maManHinh: '13', duongDan: 'technician/work/SC-024', tieuDe: 'Công việc được chọn', vaiTro: 'Kỹ thuật viên', nhomVaiTro: 'Kỹ thuật viên', mucDieuHuong: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { maManHinh: '14', duongDan: 'technician/work/SC-024/review', tieuDe: 'Đánh giá khách hàng', vaiTro: 'Kỹ thuật viên', nhomVaiTro: 'Kỹ thuật viên', mucDieuHuong: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { maManHinh: '16', duongDan: 'admin/users', tieuDe: 'Quản lý tài khoản', vaiTro: 'Quản trị viên', nhomVaiTro: 'Quản trị viên', mucDieuHuong: ['Quản lý tài khoản'] },
];

export const manHinhTheoMucMenu = {
  'Tin của tôi': '03',
  'Đăng tin': '04',
  'Tìm việc sửa chữa': '09',
  'Đề xuất của tôi': '12',
  'Công việc được chọn': '13',
  'Quản lý tài khoản': '16',
};

export function layDuongDanManHinh(maManHinh) {
  const manHinh = danhSachManHinh.find((banGhi) => banGhi.maManHinh === maManHinh);
  return `#/${manHinh?.duongDan ?? 'login'}`;
}
