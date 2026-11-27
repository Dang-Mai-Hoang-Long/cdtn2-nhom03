// Bảng đường dẫn API dùng để đo lường và ghi nhật ký. Số đo gộp theo mẫu đường dẫn (không theo URL thật) nên bộ nhớ
// bị chặn trên và chuỗi truy vấn không bao giờ bị lưu lại. Thêm endpoint mới thì thêm một dòng ở đây.
const SO = '([^/]+)';

// [phương thức, mẫu đường dẫn, hành động ghi nhật ký khi gọi, loại đối tượng]
const CAC_TUYEN = [
  ['GET', '/api/health'],
  ['POST', '/api/auth/register', 'REGISTER', 'user'],
  ['POST', '/api/auth/login', 'LOGIN', 'user'],
  ['POST', '/api/auth/logout', 'LOGOUT', 'user'],
  ['GET', '/api/auth/me'],
  ['POST', '/api/requests', 'CREATE_REQUEST', 'request'],
  ['GET', '/api/requests/my'],
  ['GET', '/api/requests'],
  ['GET', '/api/requests/:id'],
  ['PATCH', '/api/requests/:id', 'UPDATE_REQUEST', 'request'],
  ['PATCH', '/api/requests/:id/close', 'CLOSE_REQUEST', 'request'],
  ['PATCH', '/api/requests/:id/complete', 'COMPLETE_REQUEST', 'request'],
  ['POST', '/api/proposals', 'CREATE_PROPOSAL', 'proposal'],
  ['GET', '/api/proposals/my'],
  ['GET', '/api/proposals/request/:id'],
  ['GET', '/api/proposals/:id'],
  ['PATCH', '/api/proposals/:id', 'UPDATE_PROPOSAL', 'proposal'],
  ['PATCH', '/api/proposals/:id/close', 'WITHDRAW_PROPOSAL', 'proposal'],
  ['PATCH', '/api/proposals/:id/accept', 'ACCEPT_PROPOSAL', 'proposal'],
  ['POST', '/api/reviews', 'CREATE_REVIEW', 'review'],
  ['GET', '/api/reviews/user/:id'],
  ['GET', '/api/notifications'],
  ['GET', '/api/notifications/unread-count'],
  ['PATCH', '/api/notifications/:id/read'],
  ['GET', '/api/users/:id'],
  ['PATCH', '/api/users/me', 'UPDATE_PROFILE', 'user'],
  ['GET', '/api/admin/users'],
  ['PATCH', '/api/admin/users/:id/lock', 'LOCK_USER', 'user'],
  ['PATCH', '/api/admin/users/:id/unlock', 'UNLOCK_USER', 'user'],
  ['GET', '/api/admin/analytics/overview'],
  ['GET', '/api/admin/analytics/growth'],
  ['GET', '/api/admin/analytics/users'],
  ['GET', '/api/admin/analytics/activity'],
  ['GET', '/api/admin/analytics/system'],
  ['GET', '/api/admin/analytics/alerts'],
  ['PATCH', '/api/admin/analytics/alerts/:id', 'UPDATE_ALERT', 'alert'],
  ['GET', '/api/admin/analytics/reports/:id'],
  ['GET', '/api/admin/analytics/reports/:id/export', 'EXPORT_REPORT', 'report'],
].map(([phuongThuc, mau, hanhDong = null, doiTuong = null]) => ({
  phuongThuc,
  mau,
  hanhDong,
  doiTuong,
  bieuThuc: new RegExp(`^${mau.replace(/:id/g, SO)}/?$`, 'i'),
}));

// Đường dẫn cụ thể (không có :id) được xét trước để /requests/my không bị khớp thành /requests/:id.
const THU_TU_XET = [...CAC_TUYEN].sort((a, b) => a.mau.split(':id').length - b.mau.split(':id').length);

function timTuyen(phuongThuc, duongDan) {
  for (const tuyen of THU_TU_XET) {
    if (tuyen.phuongThuc !== phuongThuc) continue;
    const khop = tuyen.bieuThuc.exec(duongDan);
    if (khop) return { ...tuyen, maDoiTuong: khop[1] ?? null };
  }
  return null;
}

module.exports = { timTuyen };
