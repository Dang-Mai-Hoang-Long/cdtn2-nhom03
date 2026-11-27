// Khoảng thời gian của trang thống kê. Mốc ngày/tháng tính theo giờ Việt Nam (UTC+7, không có giờ mùa hè).
// Mỗi khoảng gồm các "ô" (giờ, ngày hoặc tháng) cho kỳ này và kỳ trước liền kề, cùng độ dài, để so sánh từng ô một.
const { LoiUngDung } = require('./error-handler');

const GIO_MS = 3600 * 1000;
const NGAY_MS = 24 * GIO_MS;
const LECH_VN_MS = 7 * GIO_MS;
const SO_NGAY_TOI_DA = 731;
const CAC_KHOANG = ['today', '7d', '30d', '90d', '12m', 'custom'];
const SO_NGAY = { '7d': 7, '30d': 30, '90d': 90 };

// Thời điểm 00:00 giờ Việt Nam của ngày chứa ms.
const dauNgayVn = (ms) => Math.floor((ms + LECH_VN_MS) / NGAY_MS) * NGAY_MS - LECH_VN_MS;

function dauThangVn(ms, lech = 0) {
  const vn = new Date(ms + LECH_VN_MS);
  return Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth() + lech, 1) - LECH_VN_MS;
}

function luiMotNam(ms) {
  const vn = new Date(ms + LECH_VN_MS);
  vn.setUTCFullYear(vn.getUTCFullYear() - 1);
  return vn.getTime() - LECH_VN_MS;
}

const haiChuSo = (so) => String(so).padStart(2, '0');

function nhanO(ms, loai) {
  const vn = new Date(ms + LECH_VN_MS);
  if (loai === 'hour') return `${haiChuSo(vn.getUTCHours())}:00`;
  if (loai === 'month') return `${haiChuSo(vn.getUTCMonth() + 1)}/${vn.getUTCFullYear()}`;
  return `${haiChuSo(vn.getUTCDate())}/${haiChuSo(vn.getUTCMonth() + 1)}`;
}

function ngayIso(ms) {
  return new Date(ms + LECH_VN_MS).toISOString().slice(0, 10);
}

function docNgay(giaTri) {
  if (typeof giaTri !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(giaTri)) return null;
  const ms = Date.parse(`${giaTri}T00:00:00Z`);
  if (Number.isNaN(ms) || new Date(ms).toISOString().slice(0, 10) !== giaTri) return null;
  return ms - LECH_VN_MS;
}

const loiKhoang = (field, message) => new LoiUngDung(400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', [{ field, message }]);

function taoDayMoc(dau, cuoi, buoc) {
  const moc = [];
  for (let ms = dau; ms < cuoi; ms = buoc(ms)) moc.push(ms);
  moc.push(cuoi);
  return moc;
}

// Trả về { key, bucket, start, end, previousStart, previousEnd, boundaries, previousBoundaries, labels }.
// boundaries có n + 1 phần tử (mili giây): ô thứ i là [boundaries[i], boundaries[i+1]).
function docKhoangThoiGian(query = {}, bayGio = Date.now()) {
  const key = query.range === undefined || query.range === '' ? '30d' : query.range;
  if (!CAC_KHOANG.includes(key)) throw loiKhoang('range', `range phải là một trong: ${CAC_KHOANG.join(', ')}`);

  let bucket = 'day';
  let start;
  let end = bayGio;
  let moc;
  let lui;

  if (key === 'today') {
    bucket = 'hour';
    start = dauNgayVn(bayGio);
    moc = taoDayMoc(start, Math.max(end, start + 1), (ms) => ms + GIO_MS);
    lui = (ms) => ms - NGAY_MS;
  } else if (key === '12m') {
    bucket = 'month';
    start = dauThangVn(bayGio, -11);
    moc = taoDayMoc(start, end, (ms) => dauThangVn(ms, 1));
    lui = luiMotNam;
  } else if (key === 'custom') {
    const tu = docNgay(query.from);
    const den = docNgay(query.to);
    if (tu === null) throw loiKhoang('from', 'Chọn ngày bắt đầu hợp lệ (YYYY-MM-DD)');
    if (den === null) throw loiKhoang('to', 'Chọn ngày kết thúc hợp lệ (YYYY-MM-DD)');
    if (den < tu) throw loiKhoang('to', 'Ngày kết thúc phải từ ngày bắt đầu trở đi');
    if (tu > bayGio) throw loiKhoang('from', 'Ngày bắt đầu không được ở tương lai');
    const soNgay = Math.round((den - tu) / NGAY_MS) + 1;
    if (soNgay > SO_NGAY_TOI_DA) throw loiKhoang('to', `Khoảng thời gian tối đa ${SO_NGAY_TOI_DA} ngày`);
    start = tu;
    end = Math.min(den + NGAY_MS, bayGio);
    if (soNgay <= 2) bucket = 'hour';
    else if (soNgay > 92) bucket = 'month';
    const buoc = bucket === 'hour' ? (ms) => ms + GIO_MS : bucket === 'month' ? (ms) => dauThangVn(ms, 1) : (ms) => ms + NGAY_MS;
    moc = taoDayMoc(start, end, buoc);
    lui = (ms) => ms - soNgay * NGAY_MS;
  } else {
    const soNgay = SO_NGAY[key];
    start = dauNgayVn(bayGio) - (soNgay - 1) * NGAY_MS;
    moc = taoDayMoc(start, end, (ms) => ms + NGAY_MS);
    lui = (ms) => ms - soNgay * NGAY_MS;
  }

  const mocTruoc = moc.map(lui);
  return {
    key,
    bucket,
    start,
    end,
    previousStart: mocTruoc[0],
    previousEnd: mocTruoc[mocTruoc.length - 1],
    boundaries: moc,
    previousBoundaries: mocTruoc,
    labels: moc.slice(0, -1).map((ms) => nhanO(ms, bucket)),
  };
}

// Thông tin khoảng gửi cho giao diện (ngày theo giờ Việt Nam).
function moTaKhoang(khoang) {
  return {
    key: khoang.key,
    bucket: khoang.bucket,
    from: ngayIso(khoang.start),
    to: ngayIso(khoang.end - 1),
    previousFrom: ngayIso(khoang.previousStart),
    previousTo: ngayIso(khoang.previousEnd - 1),
    start: new Date(khoang.start).toISOString(),
    end: new Date(khoang.end).toISOString(),
    labels: khoang.labels,
  };
}

module.exports = { docKhoangThoiGian, moTaKhoang, dauNgayVn, ngayIso, NGAY_MS, GIO_MS };
