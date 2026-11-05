const express = require('express');
const dieuKhienDeXuat = require('../controllers/proposal.controller');
const { xacThuc } = require('../middlewares/auth.middleware');
const { phanQuyen } = require('../middlewares/role.middleware');
const { kiemTraDuLieu } = require('../middlewares/validate.middleware');
const { kiemTraGuiDeXuat, kiemTraSuaDeXuat } = require('../validators/proposal.validator');
const { VAI_TRO } = require('../utils/constants');

const dinhTuyenDeXuat = express.Router();
const chiKhachHang = phanQuyen(VAI_TRO.KHACH_HANG);
const chiKyThuatVien = phanQuyen(VAI_TRO.KY_THUAT_VIEN);

dinhTuyenDeXuat.use(xacThuc);
dinhTuyenDeXuat.post('/', chiKyThuatVien, kiemTraDuLieu(kiemTraGuiDeXuat), dieuKhienDeXuat.guiDeXuat);
dinhTuyenDeXuat.get('/my', chiKyThuatVien, dieuKhienDeXuat.layDanhSachDeXuatCuaToi);
dinhTuyenDeXuat.get('/request/:requestId', chiKhachHang, dieuKhienDeXuat.layDanhSachDeXuatCuaYeuCau);
dinhTuyenDeXuat.get('/:id', phanQuyen(VAI_TRO.KHACH_HANG, VAI_TRO.KY_THUAT_VIEN), dieuKhienDeXuat.layChiTietDeXuat);
dinhTuyenDeXuat.patch('/:id', chiKyThuatVien, kiemTraDuLieu(kiemTraSuaDeXuat), dieuKhienDeXuat.suaDeXuat);
dinhTuyenDeXuat.patch('/:id/close', chiKyThuatVien, dieuKhienDeXuat.rutDeXuat);
dinhTuyenDeXuat.patch('/:id/accept', chiKhachHang, dieuKhienDeXuat.chapNhanDeXuat);

module.exports = dinhTuyenDeXuat;
