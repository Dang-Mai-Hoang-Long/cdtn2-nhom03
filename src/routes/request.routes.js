const express = require('express');
const dieuKhienYeuCau = require('../controllers/request.controller');
const { xacThuc } = require('../middlewares/auth.middleware');
const { phanQuyen } = require('../middlewares/role.middleware');
const { kiemTraDuLieu } = require('../middlewares/validate.middleware');
const { kiemTraTaoYeuCau } = require('../validators/request.validator');
const { VAI_TRO } = require('../utils/constants');

const dinhTuyenYeuCau = express.Router();
const chiKhachHang = phanQuyen(VAI_TRO.KHACH_HANG);
const chiKyThuatVien = phanQuyen(VAI_TRO.KY_THUAT_VIEN);

dinhTuyenYeuCau.use(xacThuc);
dinhTuyenYeuCau.post('/', chiKhachHang, kiemTraDuLieu(kiemTraTaoYeuCau), dieuKhienYeuCau.taoYeuCau);
dinhTuyenYeuCau.get('/my', chiKhachHang, dieuKhienYeuCau.layDanhSachYeuCauCuaToi);
dinhTuyenYeuCau.get('/', chiKyThuatVien, dieuKhienYeuCau.layDanhSachYeuCauDangCho);
dinhTuyenYeuCau.get('/:id', phanQuyen(VAI_TRO.KHACH_HANG, VAI_TRO.KY_THUAT_VIEN), dieuKhienYeuCau.layChiTietYeuCau);
dinhTuyenYeuCau.patch('/:id/complete', chiKhachHang, dieuKhienYeuCau.xacNhanHoanThanh);

module.exports = dinhTuyenYeuCau;
