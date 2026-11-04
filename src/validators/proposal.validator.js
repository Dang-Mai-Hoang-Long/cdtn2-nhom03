const { laChuoiCoNoiDung } = require('./auth.validator');

const GIA_TOI_DA = 1e13;

function kiemTraGuiDeXuat(duLieu) {
  const danhSachLoi = [];
  if (!Number.isInteger(duLieu.requestId) || duLieu.requestId <= 0) {
    danhSachLoi.push({ field: 'requestId', message: 'Phải chọn tin sửa chữa' });
  }
  if (typeof duLieu.price !== 'number' || !Number.isFinite(duLieu.price) || duLieu.price <= 0) {
    danhSachLoi.push({ field: 'price', message: 'Giá đề xuất phải lớn hơn 0' });
  } else if (duLieu.price >= GIA_TOI_DA) {
    danhSachLoi.push({ field: 'price', message: 'Giá đề xuất quá lớn' });
  }
  if (!laChuoiCoNoiDung(duLieu.description)) {
    danhSachLoi.push({ field: 'description', message: 'Mô tả không được để trống' });
  }
  if (duLieu.estimatedDuration !== undefined && duLieu.estimatedDuration !== null) {
    if (typeof duLieu.estimatedDuration !== 'string' || duLieu.estimatedDuration.trim().length > 50) {
      danhSachLoi.push({ field: 'estimatedDuration', message: 'Thời gian dự kiến tối đa 50 ký tự' });
    }
  }
  return danhSachLoi;
}

module.exports = { kiemTraGuiDeXuat };
