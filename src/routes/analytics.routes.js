const express = require('express');
const dieuKhien = require('../controllers/analytics.controller');

// Gắn vào router quản trị nên mọi đường dẫn ở đây đã yêu cầu đăng nhập với vai trò ADMIN (BR01).
const dinhTuyenThongKe = express.Router();

dinhTuyenThongKe.get('/overview', dieuKhien.tongQuan);
dinhTuyenThongKe.get('/growth', dieuKhien.tangTruong);
dinhTuyenThongKe.get('/users', dieuKhien.nguoiDung);
dinhTuyenThongKe.get('/activity', dieuKhien.hoatDong);
dinhTuyenThongKe.get('/system', dieuKhien.heThong);
dinhTuyenThongKe.get('/alerts', dieuKhien.canhBao);
dinhTuyenThongKe.patch('/alerts/:key', dieuKhien.datTrangThaiCanhBao);
dinhTuyenThongKe.get('/reports/:type', dieuKhien.layBaoCao);
dinhTuyenThongKe.get('/reports/:type/export', dieuKhien.xuatBaoCao);

module.exports = dinhTuyenThongKe;
