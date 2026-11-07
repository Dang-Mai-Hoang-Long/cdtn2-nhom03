const express = require('express');
const dieuKhienDanhGia = require('../controllers/review.controller');
const { xacThuc } = require('../middlewares/auth.middleware');
const { phanQuyen } = require('../middlewares/role.middleware');
const { kiemTraDuLieu } = require('../middlewares/validate.middleware');
const { kiemTraTaoDanhGia } = require('../validators/review.validator');
const { VAI_TRO } = require('../utils/constants');

const dinhTuyenDanhGia = express.Router();

dinhTuyenDanhGia.use(xacThuc);
dinhTuyenDanhGia.post('/', phanQuyen(VAI_TRO.KHACH_HANG, VAI_TRO.KY_THUAT_VIEN), kiemTraDuLieu(kiemTraTaoDanhGia), dieuKhienDanhGia.taoDanhGia);
dinhTuyenDanhGia.get('/user/:userId', dieuKhienDanhGia.layDanhGiaCuaNguoiDung);

module.exports = dinhTuyenDanhGia;
