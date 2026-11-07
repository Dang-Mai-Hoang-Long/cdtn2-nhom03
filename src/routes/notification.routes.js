const express = require('express');
const dieuKhienThongBao = require('../controllers/notification.controller');
const { xacThuc } = require('../middlewares/auth.middleware');

const dinhTuyenThongBao = express.Router();

dinhTuyenThongBao.use(xacThuc);
dinhTuyenThongBao.get('/', dieuKhienThongBao.layDanhSachThongBao);
dinhTuyenThongBao.get('/unread-count', dieuKhienThongBao.demThongBaoChuaDoc);
dinhTuyenThongBao.patch('/:id/read', dieuKhienThongBao.danhDauDaDoc);

module.exports = dinhTuyenThongBao;
