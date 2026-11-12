// duongDan có thể chứa tham số dạng :id; màn hình cụ thể đứng trước màn hình có tham số cùng tiền tố.
export const danhSachManHinh = [
  { maManHinh: '01', duongDan: 'login', tieuDe: 'Đăng nhập', vaiTro: 'Tài khoản', nhomVaiTro: 'Tài khoản', mucDieuHuong: [] },
  { maManHinh: '02', duongDan: 'register', tieuDe: 'Đăng ký', vaiTro: 'Tài khoản', nhomVaiTro: 'Tài khoản', mucDieuHuong: [] },
  { maManHinh: '03', duongDan: 'customer/requests', tieuDe: 'Tin của tôi', vaiTro: 'Khách hàng', nhomVaiTro: 'Khách hàng', mucDieuHuong: ['Tin của tôi', 'Đăng tin'] },
  { maManHinh: '04', duongDan: 'customer/requests/new', tieuDe: 'Đăng tin sửa chữa', vaiTro: 'Khách hàng', nhomVaiTro: 'Khách hàng', mucDieuHuong: ['Tin của tôi', 'Đăng tin'] },
  { maManHinh: '07', duongDan: 'customer/requests/:id/tracking', tieuDe: 'Theo dõi công việc', vaiTro: 'Khách hàng', nhomVaiTro: 'Khách hàng', mucDieuHuong: ['Tin của tôi', 'Đăng tin'] },
  { maManHinh: '08', duongDan: 'customer/requests/:id/review', tieuDe: 'Đánh giá kỹ thuật viên', vaiTro: 'Khách hàng', nhomVaiTro: 'Khách hàng', mucDieuHuong: ['Tin của tôi', 'Đăng tin'] },
  { maManHinh: '17', duongDan: 'customer/requests/:id/edit', tieuDe: 'Sửa tin sửa chữa', vaiTro: 'Khách hàng', nhomVaiTro: 'Khách hàng', mucDieuHuong: ['Tin của tôi', 'Đăng tin'] },
  { maManHinh: '05', duongDan: 'customer/requests/:id', tieuDe: 'Tin và đề xuất', vaiTro: 'Khách hàng', nhomVaiTro: 'Khách hàng', mucDieuHuong: ['Tin của tôi', 'Đăng tin'] },
  { maManHinh: '06', duongDan: 'customer/proposals/:id', tieuDe: 'Chi tiết đề xuất', vaiTro: 'Khách hàng', nhomVaiTro: 'Khách hàng', mucDieuHuong: ['Tin của tôi', 'Đăng tin'] },
  { maManHinh: '09', duongDan: 'technician/requests', tieuDe: 'Tìm việc sửa chữa', vaiTro: 'Kỹ thuật viên', nhomVaiTro: 'Kỹ thuật viên', mucDieuHuong: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { maManHinh: '11', duongDan: 'technician/requests/:id/proposal', tieuDe: 'Gửi đề xuất', vaiTro: 'Kỹ thuật viên', nhomVaiTro: 'Kỹ thuật viên', mucDieuHuong: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { maManHinh: '10', duongDan: 'technician/requests/:id', tieuDe: 'Chi tiết tin sửa chữa', vaiTro: 'Kỹ thuật viên', nhomVaiTro: 'Kỹ thuật viên', mucDieuHuong: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { maManHinh: '12', duongDan: 'technician/proposals', tieuDe: 'Đề xuất của tôi', vaiTro: 'Kỹ thuật viên', nhomVaiTro: 'Kỹ thuật viên', mucDieuHuong: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { maManHinh: '14', duongDan: 'technician/work/:id/review', tieuDe: 'Đánh giá khách hàng', vaiTro: 'Kỹ thuật viên', nhomVaiTro: 'Kỹ thuật viên', mucDieuHuong: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { maManHinh: '13', duongDan: 'technician/work/:id', tieuDe: 'Công việc được chọn', vaiTro: 'Kỹ thuật viên', nhomVaiTro: 'Kỹ thuật viên', mucDieuHuong: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
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

export const VAI_TRO_THEO_NHOM = { 'Khách hàng': 'CUSTOMER', 'Kỹ thuật viên': 'TECHNICIAN', 'Quản trị viên': 'ADMIN' };
export const MAN_HINH_CHINH_THEO_VAI_TRO = { CUSTOMER: '03', TECHNICIAN: '09', ADMIN: '16' };

// Tham số còn thiếu được thay bằng "chon" để màn hình tự hiển thị hướng dẫn chọn bản ghi.
export function layDuongDanManHinh(maManHinh, thamSo = {}) {
  const manHinh = danhSachManHinh.find((banGhi) => banGhi.maManHinh === maManHinh);
  const duongDan = (manHinh?.duongDan ?? 'login').replace(/:([a-zA-Z]+)/g, (_, ten) => encodeURIComponent(thamSo[ten] ?? 'chon'));
  return `#/${duongDan}`;
}

export function chuyenDenManHinh(maManHinh, thamSo) {
  window.location.hash = layDuongDanManHinh(maManHinh, thamSo);
}

function soKhopDuongDan(mau, duongDan) {
  const cacPhanMau = mau.split('/');
  const cacPhan = duongDan.split('/');
  if (cacPhanMau.length !== cacPhan.length) return null;
  const thamSo = {};
  for (let viTri = 0; viTri < cacPhanMau.length; viTri += 1) {
    if (cacPhanMau[viTri].startsWith(':')) thamSo[cacPhanMau[viTri].slice(1)] = decodeURIComponent(cacPhan[viTri]);
    else if (cacPhanMau[viTri] !== cacPhan[viTri]) return null;
  }
  return thamSo;
}

export function timManHinhTheoDuongDan(duongDan) {
  const duongDanSach = duongDan.replace(/^#?\/?/, '').split('?')[0].replace(/\/$/, '');
  for (const manHinh of danhSachManHinh) {
    const thamSo = soKhopDuongDan(manHinh.duongDan, duongDanSach);
    if (thamSo) return { manHinh, thamSo };
  }
  return null;
}
