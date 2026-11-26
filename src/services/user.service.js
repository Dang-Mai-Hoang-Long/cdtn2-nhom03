const khoNguoiDung = require('../repositories/user.repository');
const { LoiUngDung } = require('../utils/error-handler');
const { docMaSo } = require('../utils/ma-so');
const { VAI_TRO } = require('../utils/constants');

// Xem hồ sơ một người dùng. Ai đã đăng nhập cũng xem được phần công khai: tên, vai trò, điểm đánh giá, số liệu, ngày tham gia.
// Email, số điện thoại và trạng thái khóa chỉ dành cho quản trị viên và chính chủ; số điện thoại khách hàng vẫn theo BR15
// ở các màn hình công việc. Tài khoản quản trị viên không hiện với người dùng thường (BR01): coi như không tồn tại.
async function layHoSo(nguoiXem, id) {
  const ma = docMaSo(id, 'USER_NOT_FOUND', 'Không tìm thấy người dùng');
  const nguoiDung = await khoNguoiDung.timTheoId(ma);
  const laQuanTri = nguoiXem.role === VAI_TRO.QUAN_TRI_VIEN;
  if (!nguoiDung || (nguoiDung.role === VAI_TRO.QUAN_TRI_VIEN && !laQuanTri)) {
    throw new LoiUngDung(404, 'USER_NOT_FOUND', 'Không tìm thấy người dùng');
  }

  const hoSo = {
    id: nguoiDung.id,
    fullName: nguoiDung.fullName,
    role: nguoiDung.role,
    ratingAvg: nguoiDung.ratingAvg,
    ...(await khoNguoiDung.thongKeHoSo(nguoiDung)),
    createdAt: nguoiDung.createdAt,
  };
  if (laQuanTri || nguoiDung.id === nguoiXem.id) {
    hoSo.email = nguoiDung.email;
    hoSo.phone = nguoiDung.phone;
    hoSo.isLocked = nguoiDung.isLocked;
  }
  return hoSo;
}

// Người dùng tự sửa họ tên và số điện thoại của mình. Không có tham số mã người dùng nên không sửa được tài khoản người khác;
// tài khoản bị khóa đã bị middleware xác thực chặn từ trước (BR02).
function capNhatThongTinCaNhan(nguoiDung, { fullName, phone }) {
  return khoNguoiDung.capNhatThongTin(nguoiDung.id, {
    fullName: fullName === undefined ? null : fullName.trim(),
    phone: phone === undefined ? null : phone.trim(),
  });
}

module.exports = { layHoSo, capNhatThongTinCaNhan };
