const express = require('express');
const dinhTuyenXacThuc = require('./auth.routes');
const dinhTuyenYeuCau = require('./request.routes');
const dinhTuyenDeXuat = require('./proposal.routes');
const dinhTuyenDanhGia = require('./review.routes');

const dinhTuyenApi = express.Router();

dinhTuyenApi.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' }, message: 'Thành công' }));
dinhTuyenApi.use('/auth', dinhTuyenXacThuc);
dinhTuyenApi.use('/requests', dinhTuyenYeuCau);
dinhTuyenApi.use('/proposals', dinhTuyenDeXuat);
dinhTuyenApi.use('/reviews', dinhTuyenDanhGia);

module.exports = dinhTuyenApi;
