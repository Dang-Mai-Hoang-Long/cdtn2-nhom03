// Hàm hỗ trợ khi viết dữ liệu mẫu thủ công, chủ yếu để tạo chuỗi dài đúng giới hạn của validator và CSDL.

// Chuỗi dài đúng n ký tự: lặp mẫu rồi cắt. Ký tự cuối luôn khác khoảng trắng để sau khi cắt hai đầu (validator và
// service đều trim) độ dài vẫn đúng n. Chỉ dùng mẫu gồm ký tự trong BMP (không emoji): validator đếm theo đơn vị
// UTF-16 còn VARCHAR đếm theo ký tự, hai cách đếm chỉ trùng nhau với ký tự BMP.
function chuoiDaiDung(mau, n) {
  let ketQua = '';
  while (ketQua.length < n) ketQua += mau;
  ketQua = ketQua.slice(0, n);
  return ketQua.endsWith(' ') ? `${ketQua.slice(0, n - 1)}.` : ketQua;
}

module.exports = { chuoiDaiDung };
