const app = require('./app');
const cauHinh = require('./config/env');
const { batDauLayMau } = require('./services/system-health.service');

app.listen(cauHinh.port, () => {
  console.log(`Backend đang chạy tại http://localhost:${cauHinh.port}`);
  batDauLayMau();
});
