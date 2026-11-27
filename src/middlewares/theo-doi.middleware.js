// Đo thời gian phản hồi, mã lỗi, kích thước dữ liệu của mọi yêu cầu API và ghi nhật ký hoạt động sau khi phản hồi xong.
const { timTuyen } = require('../utils/tuyen-duong');
const doLuong = require('../utils/do-luong');
const dichVuNhatKy = require('../services/activity-log.service');

const TIEN_TO_THONG_KE = '/api/admin/analytics';

function theoDoiYeuCau(req, res, next) {
  const duongDan = req.path;
  if (!duongDan.toLowerCase().startsWith('/api')) return next();

  const batDau = process.hrtime.bigint();
  const tuyen = timTuyen(req.method, duongDan);
  // Yêu cầu của chính trang thống kê (tự làm mới mỗi vài giây) không được tính vào số đo API của ứng dụng.
  const tinhSoDo = !duongDan.toLowerCase().startsWith(TIEN_TO_THONG_KE);
  if (tinhSoDo) doLuong.batDauYeuCau();

  let thanTraVe;
  const traJson = res.json.bind(res);
  res.json = (noiDung) => {
    thanTraVe = noiDung;
    return traJson(noiDung);
  };

  let daKetThuc = false;
  const ketThuc = () => {
    if (daKetThuc) return;
    daKetThuc = true;
    if (tinhSoDo) {
      doLuong.ketThucYeuCau();
      doLuong.ghiNhan({
        tuyen: `${req.method} ${tuyen?.mau ?? '(đường dẫn khác)'}`,
        maHttp: res.statusCode,
        thoiGian: Number(process.hrtime.bigint() - batDau) / 1e6,
        byteVao: Number(req.headers['content-length']) || 0,
        byteRa: Number(res.getHeader('content-length')) || 0,
      });
    }
    if (res.writableFinished) dichVuNhatKy.ghiTuYeuCau({ req, maHttp: res.statusCode, tuyen, thanTraVe });
  };
  res.on('finish', ketThuc);
  res.on('close', ketThuc);
  return next();
}

module.exports = { theoDoiYeuCau };
