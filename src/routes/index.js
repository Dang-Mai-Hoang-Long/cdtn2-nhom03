const express = require('express');

const dinhTuyenApi = express.Router();

dinhTuyenApi.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' }, message: 'Thành công' }));

module.exports = dinhTuyenApi;
