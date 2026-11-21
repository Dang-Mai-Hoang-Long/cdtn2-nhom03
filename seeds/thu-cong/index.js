// Phần dữ liệu viết tay (khoảng 50 tin): từng tình huống được chọn có chủ đích để thử một chức năng hoặc một biên cụ thể.
// Trả về "kế hoạch" cùng dạng với phần tự động (xem ../ke-hoach.js) để một bộ thực thi duy nhất chạy cả hai.
const taiKhoan = require('./tai-khoan');
const tin = require('./tin-sua-chua');
const deXuat = require('./de-xuat');
const danhGia = require('./danh-gia');

module.exports = { taiKhoan, tin, deXuat, danhGia };
