const DO_DAI_NHAN_XET_TOI_DA = 1000;

function kiemTraTaoDanhGia(duLieu) {
  const danhSachLoi = [];
  if (!Number.isInteger(duLieu.requestId) || duLieu.requestId <= 0) {
    danhSachLoi.push({ field: 'requestId', message: 'Phải chọn công việc cần đánh giá' });
  }
  if (!Number.isInteger(duLieu.rating) || duLieu.rating < 1 || duLieu.rating > 5) {
    danhSachLoi.push({ field: 'rating', message: 'Số sao phải từ 1 đến 5' });
  }
  if (duLieu.comment !== undefined && duLieu.comment !== null) {
    if (typeof duLieu.comment !== 'string' || duLieu.comment.trim().length > DO_DAI_NHAN_XET_TOI_DA) {
      danhSachLoi.push({ field: 'comment', message: `Nhận xét tối đa ${DO_DAI_NHAN_XET_TOI_DA} ký tự` });
    }
  }
  return danhSachLoi;
}

module.exports = { kiemTraTaoDanhGia };
