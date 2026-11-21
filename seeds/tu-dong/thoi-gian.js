// Hằng số và hàm thời gian dùng khi sinh dòng thời gian của dữ liệu tự động (mọi thời điểm tính bằng mili giây).
const PHUT = 60 * 1000;
const GIO = 60 * PHUT;
const NGAY = 24 * GIO;

const doiSangIso = (mili) => new Date(mili).toISOString();

module.exports = { PHUT, GIO, NGAY, doiSangIso };
