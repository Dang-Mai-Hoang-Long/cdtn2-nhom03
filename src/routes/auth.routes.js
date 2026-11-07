const express = require('express');
const dieuKhienXacThuc = require('../controllers/auth.controller');
const { xacThuc } = require('../middlewares/auth.middleware');
const { kiemTraDuLieu } = require('../middlewares/validate.middleware');
const { kiemTraDangKy, kiemTraDangNhap } = require('../validators/auth.validator');

const dinhTuyenXacThuc = express.Router();

dinhTuyenXacThuc.post('/register', kiemTraDuLieu(kiemTraDangKy), dieuKhienXacThuc.dangKy);
dinhTuyenXacThuc.post('/login', kiemTraDuLieu(kiemTraDangNhap), dieuKhienXacThuc.dangNhap);
dinhTuyenXacThuc.post('/logout', xacThuc, dieuKhienXacThuc.dangXuat);
dinhTuyenXacThuc.get('/me', xacThuc, dieuKhienXacThuc.layThongTinCaNhan);

module.exports = dinhTuyenXacThuc;
