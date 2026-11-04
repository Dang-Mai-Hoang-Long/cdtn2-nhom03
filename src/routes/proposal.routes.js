const express = require('express');
const dieuKhienDeXuat = require('../controllers/proposal.controller');
const { xacThuc } = require('../middlewares/auth.middleware');
const { phanQuyen } = require('../middlewares/role.middleware');
const { kiemTraDuLieu } = require('../middlewares/validate.middleware');
const { kiemTraGuiDeXuat } = require('../validators/proposal.validator');
const { VAI_TRO } = require('../utils/constants');

const dinhTuyenDeXuat = express.Router();
const chiKhachHang = phanQuyen(VAI_TRO.KHACH_HANG);

dinhTuyenDeXuat.use(xacThuc);
dinhTuyenDeXuat.post('/', phanQuyen(VAI_TRO.KY_THUAT_VIEN), kiemTraDuLieu(kiemTraGuiDeXuat), dieuKhienDeXuat.guiDeXuat);
dinhTuyenDeXuat.get('/request/:requestId', chiKhachHang, dieuKhienDeXuat.layDanhSachDeXuatCuaYeuCau);
dinhTuyenDeXuat.patch('/:id/accept', chiKhachHang, dieuKhienDeXuat.chapNhanDeXuat);

module.exports = dinhTuyenDeXuat;
