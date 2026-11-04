const express = require('express');
const dinhTuyenXacThuc = require('./auth.routes');
const dinhTuyenYeuCau = require('./request.routes');

const dinhTuyenApi = express.Router();

dinhTuyenApi.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' }, message: 'Thành công' }));
dinhTuyenApi.use('/auth', dinhTuyenXacThuc);
dinhTuyenApi.use('/requests', dinhTuyenYeuCau);

module.exports = dinhTuyenApi;
