// Nhãn tiếng Việt dùng chung cho báo cáo (giao diện và file xuất).
const NHAN_VAI_TRO = { CUSTOMER: 'Khách hàng', TECHNICIAN: 'Kỹ thuật viên', ADMIN: 'Quản trị viên', UNKNOWN: 'Không xác định' };

const NHAN_TRANG_THAI_TAI_KHOAN = { ACTIVE: 'Hoạt động', LOCKED: 'Bị khóa' };

const NHAN_TRANG_THAI_TIN = { WAITING_PROPOSAL: 'Chờ đề xuất', SELECTED: 'Đã chọn kỹ thuật viên', COMPLETED: 'Hoàn thành', CLOSED: 'Đã đóng' };

const NHAN_KET_QUA = { SUCCESS: 'Thành công', FAILURE: 'Thất bại' };

const NHAN_HANH_DONG = {
  REGISTER: 'Tạo tài khoản',
  LOGIN: 'Đăng nhập',
  LOGOUT: 'Đăng xuất',
  CREATE_REQUEST: 'Đăng tin',
  UPDATE_REQUEST: 'Sửa tin',
  CLOSE_REQUEST: 'Đóng tin',
  COMPLETE_REQUEST: 'Xác nhận hoàn thành',
  CREATE_PROPOSAL: 'Gửi đề xuất',
  UPDATE_PROPOSAL: 'Sửa đề xuất',
  ACCEPT_PROPOSAL: 'Chấp nhận đề xuất',
  WITHDRAW_PROPOSAL: 'Rút đề xuất',
  CREATE_REVIEW: 'Đánh giá',
  UPDATE_PROFILE: 'Sửa hồ sơ',
  LOCK_USER: 'Khóa tài khoản',
  UNLOCK_USER: 'Mở khóa tài khoản',
  EXPORT_REPORT: 'Xuất báo cáo',
  UPDATE_ALERT: 'Cập nhật cảnh báo',
  ACCESS_DENIED: 'Bị từ chối quyền',
  SERVER_ERROR: 'Lỗi máy chủ',
};

const NHAN_LOAI_LOI = { SERVER_ERROR: 'Lỗi máy chủ', LOGIN_FAILED: 'Đăng nhập thất bại', ACCESS_DENIED: 'Bị từ chối quyền' };

module.exports = { NHAN_VAI_TRO, NHAN_TRANG_THAI_TAI_KHOAN, NHAN_TRANG_THAI_TIN, NHAN_KET_QUA, NHAN_HANH_DONG, NHAN_LOAI_LOI };
