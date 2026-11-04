const { laChuoiCoNoiDung } = require('./auth.validator');

// BR05: khách hàng phải nhập đủ thông tin bắt buộc trước khi đăng tin.
function kiemTraTaoYeuCau(duLieu) {
  const danhSachLoi = [];
  const kiemTraChuoi = (truong, thongDiepTrong, doDaiToiDa) => {
    if (!laChuoiCoNoiDung(duLieu[truong])) danhSachLoi.push({ field: truong, message: thongDiepTrong });
    else if (doDaiToiDa && duLieu[truong].trim().length > doDaiToiDa) {
      danhSachLoi.push({ field: truong, message: `Tối đa ${doDaiToiDa} ký tự` });
    }
  };
  kiemTraChuoi('title', 'Tiêu đề không được để trống', 200);
  kiemTraChuoi('description', 'Mô tả sự cố không được để trống');
  kiemTraChuoi('category', 'Phải chọn loại dịch vụ', 50);
  kiemTraChuoi('location', 'Địa điểm không được để trống', 255);

  if (!laChuoiCoNoiDung(duLieu.preferredTime)) {
    danhSachLoi.push({ field: 'preferredTime', message: 'Phải chọn thời gian mong muốn' });
  } else if (Number.isNaN(Date.parse(duLieu.preferredTime))) {
    danhSachLoi.push({ field: 'preferredTime', message: 'Thời gian mong muốn không hợp lệ' });
  }
  return danhSachLoi;
}

module.exports = { kiemTraTaoYeuCau };
