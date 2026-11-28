const express = require('express');
const dieuKhienNguoiDung = require('../controllers/user.controller');
const { xacThuc } = require('../middlewares/auth.middleware');
const { kiemTraDuLieu } = require('../middlewares/validate.middleware');
const { kiemTraCapNhatHoSo, kiemTraDoiMatKhau } = require('../validators/user.validator');

const dinhTuyenNguoiDung = express.Router();

// Mọi vai trò đã đăng nhập đều xem được hồ sơ; phần nào hiện cho ai do service quyết định.
dinhTuyenNguoiDung.use(xacThuc);
// Chỉ sửa được tài khoản của chính mình (không có đường dẫn sửa theo mã người dùng).
dinhTuyenNguoiDung.patch('/me', kiemTraDuLieu(kiemTraCapNhatHoSo), dieuKhienNguoiDung.capNhatThongTinCaNhan);
dinhTuyenNguoiDung.patch('/me/password', kiemTraDuLieu(kiemTraDoiMatKhau), dieuKhienNguoiDung.doiMatKhau);
dinhTuyenNguoiDung.get('/:id', dieuKhienNguoiDung.layHoSoNguoiDung);

module.exports = dinhTuyenNguoiDung;
