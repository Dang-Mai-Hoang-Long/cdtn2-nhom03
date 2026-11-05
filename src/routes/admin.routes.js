const express = require('express');
const dieuKhienQuanTri = require('../controllers/admin.controller');
const { xacThuc } = require('../middlewares/auth.middleware');
const { phanQuyen } = require('../middlewares/role.middleware');
const { VAI_TRO } = require('../utils/constants');

const dinhTuyenQuanTri = express.Router();

// BR01: toàn bộ API quản trị chỉ dành cho ADMIN.
dinhTuyenQuanTri.use(xacThuc, phanQuyen(VAI_TRO.QUAN_TRI_VIEN));
dinhTuyenQuanTri.get('/users', dieuKhienQuanTri.layDanhSachTaiKhoan);
dinhTuyenQuanTri.patch('/users/:id/lock', dieuKhienQuanTri.khoaTaiKhoan);
dinhTuyenQuanTri.patch('/users/:id/unlock', dieuKhienQuanTri.moKhoaTaiKhoan);

module.exports = dinhTuyenQuanTri;
