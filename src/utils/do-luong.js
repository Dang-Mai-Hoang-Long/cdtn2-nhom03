// Số đo API giữ trong bộ nhớ của tiến trình, tính từ lúc backend khởi động (khởi động lại thì bắt đầu lại).
// Gộp theo phút (giữ 24 giờ) và theo mẫu đường dẫn. Yêu cầu của chính trang thống kê không được tính.
const SO_PHUT_LUU = 24 * 60;
const SO_MAU_THOI_GIAN_MOI_TUYEN = 500;
const SO_MAU_THOI_GIAN_MOI_PHUT = 300;

const batDauLuc = new Date();
const theoPhut = new Map();
const theoTuyen = new Map();
let dangXuLy = 0;
let tongByteVao = 0;
let tongByteRa = 0;

function phanVi(mang, p) {
  if (mang.length === 0) return null;
  const sapXep = [...mang].sort((a, b) => a - b);
  return sapXep[Math.min(sapXep.length - 1, Math.ceil((p / 100) * sapXep.length) - 1)];
}

function layNhom(map, khoa, taoMoi) {
  let nhom = map.get(khoa);
  if (!nhom) {
    nhom = taoMoi();
    map.set(khoa, nhom);
  }
  return nhom;
}

function themMau(nhom, thoiGian, toiDa) {
  if (nhom.mau.length < toiDa) nhom.mau.push(thoiGian);
  else nhom.mau[nhom.soLan % toiDa] = thoiGian;
}

function batDauYeuCau() {
  dangXuLy += 1;
}

function ketThucYeuCau() {
  dangXuLy = Math.max(0, dangXuLy - 1);
}

function ghiNhan({ tuyen, maHttp, thoiGian, byteVao, byteRa, luc = Date.now() }) {
  tongByteVao += byteVao;
  tongByteRa += byteRa;
  const phut = Math.floor(luc / 60000);
  const nhomPhut = layNhom(theoPhut, phut, () => ({ soLan: 0, loi4xx: 0, loi5xx: 0, tongThoiGian: 0, byteVao: 0, byteRa: 0, mau: [] }));
  const nhomTuyen = layNhom(theoTuyen, tuyen, () => ({ soLan: 0, loi4xx: 0, loi5xx: 0, tongThoiGian: 0, lonNhat: 0, mau: [] }));
  for (const [nhom, toiDa] of [[nhomPhut, SO_MAU_THOI_GIAN_MOI_PHUT], [nhomTuyen, SO_MAU_THOI_GIAN_MOI_TUYEN]]) {
    themMau(nhom, thoiGian, toiDa);
    nhom.soLan += 1;
    nhom.tongThoiGian += thoiGian;
    if (maHttp >= 500) nhom.loi5xx += 1;
    else if (maHttp >= 400) nhom.loi4xx += 1;
  }
  nhomTuyen.lonNhat = Math.max(nhomTuyen.lonNhat, thoiGian);
  nhomPhut.byteVao += byteVao;
  nhomPhut.byteRa += byteRa;
  if (theoPhut.size > SO_PHUT_LUU) {
    for (const khoa of theoPhut.keys()) {
      if (khoa <= phut - SO_PHUT_LUU) theoPhut.delete(khoa);
    }
  }
}

// Gộp các phút trong khoảng [tuMs, denMs).
function tomTatKhoang(tuMs, denMs) {
  const tong = { soLan: 0, loi4xx: 0, loi5xx: 0, tongThoiGian: 0, byteVao: 0, byteRa: 0 };
  const mau = [];
  for (const [phut, nhom] of theoPhut) {
    const luc = phut * 60000;
    if (luc + 60000 <= tuMs || luc >= denMs) continue;
    for (const khoa of Object.keys(tong)) tong[khoa] += nhom[khoa];
    mau.push(...nhom.mau);
  }
  return {
    requests: tong.soLan,
    errors4xx: tong.loi4xx,
    errors5xx: tong.loi5xx,
    errorRate: tong.soLan ? tong.loi5xx / tong.soLan : 0,
    avgMs: tong.soLan ? tong.tongThoiGian / tong.soLan : null,
    p95Ms: phanVi(mau, 95),
    bytesIn: tong.byteVao,
    bytesOut: tong.byteRa,
  };
}

function danhSachTuyen() {
  return [...theoTuyen].map(([tuyen, nhom]) => {
    const [phuongThuc, ...phan] = tuyen.split(' ');
    return {
      method: phuongThuc,
      route: phan.join(' '),
      requests: nhom.soLan,
      errors4xx: nhom.loi4xx,
      errors5xx: nhom.loi5xx,
      avgMs: nhom.tongThoiGian / nhom.soLan,
      p95Ms: phanVi(nhom.mau, 95),
      maxMs: nhom.lonNhat,
    };
  }).sort((a, b) => b.requests - a.requests);
}

const trangThaiHienTai = () => ({ batDauLuc, dangXuLy, tongByteVao, tongByteRa });

module.exports = { batDauYeuCau, ketThucYeuCau, ghiNhan, tomTatKhoang, danhSachTuyen, trangThaiHienTai, phanVi };
