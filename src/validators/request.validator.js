const { laChuoiCoNoiDung } = require('./auth.validator');

const CAC_TRUONG_CHUOI = [
  { truong: 'title', thongDiepTrong: 'Tiêu đề không được để trống', doDaiToiDa: 200 },
  { truong: 'description', thongDiepTrong: 'Mô tả sự cố không được để trống' },
  { truong: 'category', thongDiepTrong: 'Phải chọn loại dịch vụ', doDaiToiDa: 50 },
  { truong: 'location', thongDiepTrong: 'Địa điểm không được để trống', doDaiToiDa: 255 },
];

const CAC_TRUONG_CO_THE_SUA = [...CAC_TRUONG_CHUOI.map(({ truong }) => truong), 'preferredTime'];

// chiKiemTraTruongCoGui: dùng cho PATCH, chỉ kiểm tra các trường được gửi lên.
function kiemTraTruongYeuCau(duLieu, { chiKiemTraTruongCoGui = false } = {}) {
  const danhSachLoi = [];
  const canKiemTra = (truong) => !chiKiemTraTruongCoGui || duLieu[truong] !== undefined;

  for (const { truong, thongDiepTrong, doDaiToiDa } of CAC_TRUONG_CHUOI) {
    if (!canKiemTra(truong)) continue;
    if (!laChuoiCoNoiDung(duLieu[truong])) danhSachLoi.push({ field: truong, message: thongDiepTrong });
    else if (doDaiToiDa && duLieu[truong].trim().length > doDaiToiDa) {
      danhSachLoi.push({ field: truong, message: `Tối đa ${doDaiToiDa} ký tự` });
    }
  }

  if (canKiemTra('preferredTime')) {
    if (!laChuoiCoNoiDung(duLieu.preferredTime)) {
      danhSachLoi.push({ field: 'preferredTime', message: 'Phải chọn thời gian mong muốn' });
    } else if (Number.isNaN(Date.parse(duLieu.preferredTime))) {
      danhSachLoi.push({ field: 'preferredTime', message: 'Thời gian mong muốn không hợp lệ' });
    }
  }
  return danhSachLoi;
}

// BR05: khách hàng phải nhập đủ thông tin bắt buộc trước khi đăng tin.
function kiemTraTaoYeuCau(duLieu) {
  return kiemTraTruongYeuCau(duLieu);
}

// US21: sửa một phần thông tin, nhưng phải có ít nhất một trường hợp lệ được gửi lên.
function kiemTraSuaYeuCau(duLieu) {
  if (!CAC_TRUONG_CO_THE_SUA.some((truong) => duLieu[truong] !== undefined)) {
    return [{ field: 'body', message: 'Không có thông tin nào để cập nhật' }];
  }
  return kiemTraTruongYeuCau(duLieu, { chiKiemTraTruongCoGui: true });
}

module.exports = { kiemTraTaoYeuCau, kiemTraSuaYeuCau, CAC_TRUONG_CO_THE_SUA };
