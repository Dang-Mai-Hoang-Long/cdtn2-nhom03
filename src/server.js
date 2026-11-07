const app = require('./app');
const cauHinh = require('./config/env');

app.listen(cauHinh.port, () => {
  console.log(`Backend đang chạy tại http://localhost:${cauHinh.port}`);
});
