// Bộ sinh số giả ngẫu nhiên có hạt giống cố định (mulberry32): cùng hạt giống thì cùng chuỗi số, nên dữ liệu tự động
// tái lập được từng byte giữa các lần chạy và giữa các máy. Không dùng Math.random.
function taoNgauNhien(hatGiong) {
  let trangThai = hatGiong >>> 0;

  // Số thực trong [0, 1).
  function so() {
    trangThai = (trangThai + 0x6d2b79f5) >>> 0;
    let t = trangThai;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Số nguyên trong [nho, lon].
  const nguyen = (nho, lon) => nho + Math.floor(so() * (lon - nho + 1));
  const chon = (mang) => mang[Math.floor(so() * mang.length)];
  const xacSuat = (p) => so() < p;

  // Chọn một phần tử theo trọng số; phần tử có trọng số <= 0 không bao giờ được chọn.
  function chonTheoTrongSo(cacMuc, trongSoCuaMuc) {
    let tong = 0;
    for (const muc of cacMuc) tong += Math.max(0, trongSoCuaMuc(muc));
    let diem = so() * tong;
    let cuoiCoTrongSo = cacMuc[0];
    for (const muc of cacMuc) {
      const trongSo = Math.max(0, trongSoCuaMuc(muc));
      if (trongSo === 0) continue;
      cuoiCoTrongSo = muc;
      diem -= trongSo;
      if (diem < 0) return muc;
    }
    return cuoiCoTrongSo;
  }

  // Chọn soLuong phần tử khác nhau theo trọng số (không hoàn lại); không chọn phần tử có trọng số <= 0.
  function chonKhongTrung(cacMuc, trongSoCuaMuc, soLuong) {
    const conLai = cacMuc.filter((muc) => trongSoCuaMuc(muc) > 0);
    const ketQua = [];
    while (ketQua.length < soLuong && conLai.length > 0) {
      const muc = chonTheoTrongSo(conLai, trongSoCuaMuc);
      ketQua.push(muc);
      conLai.splice(conLai.indexOf(muc), 1);
    }
    return ketQua;
  }

  // Chọn giá trị từ danh sách cặp [giá trị, trọng số].
  const chonTheoCap = (cacCap) => chonTheoTrongSo(cacCap, (cap) => cap[1])[0];

  return { so, nguyen, chon, xacSuat, chonTheoTrongSo, chonKhongTrung, chonTheoCap };
}

module.exports = { taoNgauNhien };
