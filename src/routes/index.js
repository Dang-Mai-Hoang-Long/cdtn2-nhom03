const express = require('express');
const dinhTuyenXacThuc = require('./auth.routes');

const dinhTuyenApi = express.Router();

dinhTuyenApi.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' }, message: 'Thành công' }));
dinhTuyenApi.use('/auth', dinhTuyenXacThuc);

module.exports = dinhTuyenApi;
