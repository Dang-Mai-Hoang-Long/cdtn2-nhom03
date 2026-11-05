const { laChuoiCoNoiDung } = require('./auth.validator');

const GIA_TOI_DA = 1e13;
const CAC_TRUONG_CO_THE_SUA = ['price', 'description', 'estimatedDuration'];

// chiKiemTraTruongCoGui: dùng cho PATCH (US22), chỉ kiểm tra các trường được gửi lên.
function kiemTraTruongDeXuat(duLieu, { chiKiemTraTruongCoGui = false } = {}) {
  const danhSachLoi = [];
  const canKiemTra = (truong) => !chiKiemTraTruongCoGui || duLieu[truong] !== undefined;

  if (canKiemTra('price')) {
    if (typeof duLieu.price !== 'number' || !Number.isFinite(duLieu.price) || duLieu.price <= 0) {
      danhSachLoi.push({ field: 'price', message: 'Giá đề xuất phải lớn hơn 0' });
    } else if (duLieu.price >= GIA_TOI_DA) {
      danhSachLoi.push({ field: 'price', message: 'Giá đề xuất quá lớn' });
    }
  }
  if (canKiemTra('description') && !laChuoiCoNoiDung(duLieu.description)) {
    danhSachLoi.push({ field: 'description', message: 'Mô tả không được để trống' });
  }
  if (duLieu.estimatedDuration !== undefined && duLieu.estimatedDuration !== null) {
    if (typeof duLieu.estimatedDuration !== 'string' || duLieu.estimatedDuration.trim().length > 50) {
      danhSachLoi.push({ field: 'estimatedDuration', message: 'Thời gian dự kiến tối đa 50 ký tự' });
    }
  }
  return danhSachLoi;
}

function kiemTraGuiDeXuat(duLieu) {
  const danhSachLoi = [];
  if (!Number.isInteger(duLieu.requestId) || duLieu.requestId <= 0) {
    danhSachLoi.push({ field: 'requestId', message: 'Phải chọn tin sửa chữa' });
  }
  return [...danhSachLoi, ...kiemTraTruongDeXuat(duLieu)];
}

function kiemTraSuaDeXuat(duLieu) {
  if (!CAC_TRUONG_CO_THE_SUA.some((truong) => duLieu[truong] !== undefined)) {
    return [{ field: 'body', message: 'Không có thông tin nào để cập nhật' }];
  }
  return kiemTraTruongDeXuat(duLieu, { chiKiemTraTruongCoGui: true });
}

module.exports = { kiemTraGuiDeXuat, kiemTraSuaDeXuat };
