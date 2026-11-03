export const screens = [
  { id: '01', path: 'login', title: 'Đăng nhập', role: 'Tài khoản', group: 'Tài khoản', nav: [] },
  { id: '02', path: 'register', title: 'Đăng ký', role: 'Tài khoản', group: 'Tài khoản', nav: [] },
  { id: '03', path: 'customer/requests', title: 'Tin của tôi', role: 'Khách hàng', group: 'Khách hàng', nav: ['Tin của tôi', 'Đăng tin'] },
  { id: '04', path: 'customer/requests/new', title: 'Đăng tin sửa chữa', role: 'Khách hàng', group: 'Khách hàng', nav: ['Tin của tôi', 'Đăng tin'] },
  { id: '05', path: 'customer/requests/SC-024', title: 'Tin và đề xuất', role: 'Khách hàng', group: 'Khách hàng', nav: ['Tin của tôi', 'Đăng tin'] },
  { id: '06', path: 'customer/proposals/DX-018', title: 'Chi tiết đề xuất', role: 'Khách hàng', group: 'Khách hàng', nav: ['Tin của tôi', 'Đăng tin'] },
  { id: '07', path: 'customer/requests/SC-024/tracking', title: 'Theo dõi công việc', role: 'Khách hàng', group: 'Khách hàng', nav: ['Tin của tôi', 'Đăng tin'] },
  { id: '08', path: 'customer/requests/SC-024/review', title: 'Đánh giá kỹ thuật viên', role: 'Khách hàng', group: 'Khách hàng', nav: ['Tin của tôi', 'Đăng tin'] },
  { id: '09', path: 'technician/requests', title: 'Tìm việc sửa chữa', role: 'Kỹ thuật viên', group: 'Kỹ thuật viên', nav: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { id: '10', path: 'technician/requests/SC-024', title: 'Chi tiết tin sửa chữa', role: 'Kỹ thuật viên', group: 'Kỹ thuật viên', nav: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { id: '11', path: 'technician/requests/SC-024/proposal', title: 'Gửi đề xuất', role: 'Kỹ thuật viên', group: 'Kỹ thuật viên', nav: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { id: '12', path: 'technician/proposals', title: 'Đề xuất của tôi', role: 'Kỹ thuật viên', group: 'Kỹ thuật viên', nav: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { id: '13', path: 'technician/work/SC-024', title: 'Công việc được chọn', role: 'Kỹ thuật viên', group: 'Kỹ thuật viên', nav: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { id: '14', path: 'technician/work/SC-024/review', title: 'Đánh giá khách hàng', role: 'Kỹ thuật viên', group: 'Kỹ thuật viên', nav: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { id: '15', path: 'technician/notifications', title: 'Thông báo', role: 'Kỹ thuật viên', group: 'Kỹ thuật viên', nav: ['Tìm việc sửa chữa', 'Đề xuất của tôi', 'Công việc được chọn'] },
  { id: '16', path: 'admin/users', title: 'Quản lý tài khoản', role: 'Quản trị viên', group: 'Quản trị viên', nav: ['Quản lý tài khoản'] },
];

export const menuTarget = {
  'Tin của tôi': '03',
  'Đăng tin': '04',
  'Tìm việc sửa chữa': '09',
  'Đề xuất của tôi': '12',
  'Công việc được chọn': '13',
  'Quản lý tài khoản': '16',
};

export function hrefFor(id) {
  const screen = screens.find((item) => item.id === id);
  return `#/${screen?.path ?? 'login'}`;
}
