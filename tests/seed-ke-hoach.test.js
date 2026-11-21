// Kiểm thử thuần logic (không cần CSDL) cho bộ kiểm tra kế hoạch dữ liệu mẫu và bộ sinh dữ liệu tự động:
// kế hoạch sai phải bị chặn trước khi ghi, bộ sinh phải tái lập được, hợp lệ và đủ đa dạng.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { timLoiKeHoach, kiemTraKeHoach, gopKeHoach } = require('../seeds/ke-hoach');
const { sinhKeHoach, SO_TIN_MAC_DINH } = require('../seeds/tu-dong');
const { taoNgauNhien } = require('../seeds/tu-dong/so-ngau-nhien');
const thuCong = require('../seeds/thu-cong');

const BAY_GIO = new Date('2026-11-21T03:00:00.000Z');

// Kế hoạch nhỏ nhất mà hợp lệ: một tin đã hoàn thành, một đề xuất được chọn, một đánh giá.
const keHoachMau = () => ({
  taiKhoan: [
    { khoa: 'k', email: 'k@demo.vn', fullName: 'Khách Hàng', phone: '0901000001', role: 'CUSTOMER' },
    { khoa: 't', email: 't@demo.vn', fullName: 'Thợ Sửa', phone: '0902000001', role: 'TECHNICIAN' },
    { khoa: 'a', email: 'a@demo.vn', fullName: 'Quản Trị', phone: '0900000001', role: 'ADMIN' },
  ],
  tin: [{
    khoa: 'x', khachHang: 'k', title: 'Tiêu đề', description: 'Mô tả', category: 'Sửa điện', location: 'Quận 1',
    soNgayToi: 2, gioMongMuon: 9, ketQua: 'HOAN_THANH', ktvDuocChon: 't',
  }],
  deXuat: [{ tin: 'x', ktv: 't', price: 100000, description: 'Báo giá' }],
  danhGia: [{ tin: 'x', nguoiGui: 'k', rating: 5 }],
});
const bienDoi = (thayDoi) => {
  const keHoach = keHoachMau();
  thayDoi(keHoach);
  return keHoach;
};
const loiCua = (keHoach) => timLoiKeHoach(keHoach, { bayGio: BAY_GIO });
const coLoiKhop = (keHoach, mau) => assert.ok(loiCua(keHoach).some((loi) => mau.test(loi)), `không có lỗi khớp ${mau}: ${loiCua(keHoach).join(' | ')}`);

describe('Kế hoạch dữ liệu mẫu - kiểm tra trước khi ghi', () => {
  it('kế hoạch hợp lệ không có lỗi; gửi lại đề xuất sau khi rút là hợp lệ', () => {
    assert.deepEqual(loiCua(keHoachMau()), []);
    const guiLai = bienDoi((keHoach) => {
      keHoach.deXuat = [{ ...keHoach.deXuat[0], rut: true }, { ...keHoach.deXuat[0], price: 90000 }];
    });
    assert.deepEqual(loiCua(guiLai), []);
  });

  it('bắt lỗi tài khoản: trùng khóa, email viết hoa, số điện thoại sai', () => {
    coLoiKhop(bienDoi((keHoach) => keHoach.taiKhoan.push({ ...keHoach.taiKhoan[0], email: 'khac@demo.vn' })), /trùng khóa/);
    coLoiKhop(bienDoi((keHoach) => { keHoach.taiKhoan[0].email = 'K@demo.vn'; }), /viết thường/);
    coLoiKhop(bienDoi((keHoach) => { keHoach.taiKhoan[0].phone = 'abc'; }), /Số điện thoại/);
  });

  it('bắt lỗi tham chiếu: chủ tin không phải khách hàng, tin không tồn tại, kỹ thuật viên được chọn thiếu đề xuất', () => {
    coLoiKhop(bienDoi((keHoach) => { keHoach.tin[0].khachHang = 't'; }), /không phải khách hàng/);
    coLoiKhop(bienDoi((keHoach) => { keHoach.deXuat[0].tin = 'khong-co'; }), /tin không có trong kế hoạch/);
    coLoiKhop(bienDoi((keHoach) => { keHoach.deXuat = []; }), /chưa có đề xuất còn hiệu lực/);
    coLoiKhop(bienDoi((keHoach) => { delete keHoach.tin[0].ktvDuocChon; }), /ktvDuocChon/);
  });

  it('bắt lỗi quy tắc nghiệp vụ: BR08 (đề xuất trùng), BR13 (đánh giá khi chưa hoàn thành), BR14 (đánh giá trùng), BR16', () => {
    coLoiKhop(bienDoi((keHoach) => keHoach.deXuat.push({ ...keHoach.deXuat[0] })), /BR08/);
    coLoiKhop(bienDoi((keHoach) => { keHoach.tin[0].ketQua = 'CHO_DE_XUAT'; delete keHoach.tin[0].ktvDuocChon; }), /BR13/);
    coLoiKhop(bienDoi((keHoach) => keHoach.danhGia.push({ ...keHoach.danhGia[0] })), /BR14/);
    coLoiKhop(bienDoi((keHoach) => { keHoach.danhGia[0].nguoiGui = 'a'; }), /không tham gia/);
    coLoiKhop(bienDoi((keHoach) => { keHoach.deXuat[0].daDocThongBao = true; keHoach.deXuat[0].rut = true; }), /BR16/);
  });

  it('bắt dữ liệu sai theo validator của API: giá, số sao', () => {
    coLoiKhop(bienDoi((keHoach) => { keHoach.deXuat[0].price = 0; }), /Giá đề xuất/);
    coLoiKhop(bienDoi((keHoach) => { keHoach.danhGia[0].rating = 6; }), /Số sao/);
  });

  it('bắt thời điểm đảo thứ tự hoặc ở tương lai', () => {
    coLoiKhop(bienDoi((keHoach) => { keHoach.tin[0].taoLuc = '2026-11-10T00:00:00.000Z'; keHoach.deXuat[0].taoLuc = '2026-11-09T00:00:00.000Z'; }), /sớm hơn/);
    coLoiKhop(bienDoi((keHoach) => { keHoach.tin[0].taoLuc = '2027-01-01T00:00:00.000Z'; }), /tương lai/);
    // BR07: đề xuất gửi sau khi tin đã chọn kỹ thuật viên.
    coLoiKhop(bienDoi((keHoach) => {
      Object.assign(keHoach.tin[0], { taoLuc: '2026-11-01T00:00:00.000Z', chapNhanLuc: '2026-11-02T00:00:00.000Z' });
      keHoach.deXuat[0].taoLuc = '2026-11-03T00:00:00.000Z';
    }), /ngày gửi đề xuất của tin/);
    coLoiKhop(bienDoi((keHoach) => Object.assign(keHoach.tin[0], { chapNhanLuc: '2026-11-05T00:00:00.000Z', hoanThanhLuc: '2026-11-04T00:00:00.000Z' })), /lúc chấp nhận đề xuất/);
    coLoiKhop(bienDoi((keHoach) => {
      Object.assign(keHoach.tin[0], { chapNhanLuc: '2026-11-03T00:00:00.000Z', hoanThanhLuc: '2026-11-06T00:00:00.000Z' });
      keHoach.danhGia[0].taoLuc = '2026-11-05T00:00:00.000Z';
    }), /lúc hoàn thành/);
    coLoiKhop(bienDoi((keHoach) => { keHoach.tin[0].ketQua = 'DA_CHON'; keHoach.tin[0].hoanThanhLuc = '2026-11-05T00:00:00.000Z'; keHoach.danhGia = []; }), /hoanThanhLuc chỉ dùng/);
    coLoiKhop(bienDoi((keHoach) => { keHoach.tin[0].taoLuc = 'không phải ngày'; }), /thời điểm hợp lệ/);
  });

  it('kiemTraKeHoach ném lỗi nêu rõ chưa ghi gì vào CSDL; gopKeHoach giữ dữ liệu viết tay ở đầu', () => {
    assert.throws(() => kiemTraKeHoach(bienDoi((keHoach) => { keHoach.deXuat[0].price = 0; }), { bayGio: BAY_GIO }), /chưa ghi gì vào CSDL/);
    const gop = gopKeHoach(thuCong, keHoachMau());
    assert.equal(gop.tin[0].khoa, thuCong.tin[0].khoa);
    assert.equal(gop.tin.length, thuCong.tin.length + 1);
    assert.equal(gop.taiKhoan[0].khoa, 'admin');
  });

  it('dữ liệu viết tay hợp lệ và đúng khoảng 50 tin', () => {
    assert.deepEqual(timLoiKeHoach(thuCong, { bayGio: BAY_GIO }), []);
    assert.ok(thuCong.tin.length >= 45 && thuCong.tin.length <= 55);
  });
});

describe('Bộ số ngẫu nhiên có hạt giống', () => {
  it('cùng hạt giống cho cùng chuỗi, khác hạt giống cho chuỗi khác, giá trị nằm trong [0, 1)', () => {
    const lay = (hat) => { const ngauNhien = taoNgauNhien(hat); return Array.from({ length: 50 }, () => ngauNhien.so()); };
    assert.deepEqual(lay(1), lay(1));
    assert.notDeepEqual(lay(1), lay(2));
    assert.ok(lay(3).every((so) => so >= 0 && so < 1));
  });

  it('chọn theo trọng số không bao giờ chọn trọng số 0; chọn không trùng trả đúng số phần tử khác nhau', () => {
    const ngauNhien = taoNgauNhien(9);
    const cacMuc = [{ ten: 'a', w: 0 }, { ten: 'b', w: 1 }, { ten: 'c', w: 5 }, { ten: 'd', w: 0 }];
    for (let i = 0; i < 300; i += 1) assert.notEqual(ngauNhien.chonTheoTrongSo(cacMuc, (muc) => muc.w).w, 0);
    const khongTrung = ngauNhien.chonKhongTrung(cacMuc, (muc) => muc.w, 5);
    assert.deepEqual(khongTrung.map((muc) => muc.ten).sort(), ['b', 'c']);
  });
});

describe('Dữ liệu tự động', () => {
  const keHoach = sinhKeHoach({ bayGio: BAY_GIO });
  const dem = (mang, layKhoa) => mang.reduce((ketQua, muc) => ({ ...ketQua, [layKhoa(muc)]: (ketQua[layKhoa(muc)] ?? 0) + 1 }), {});

  it('mặc định 1000 tin; tái lập được: cùng tham số cho cùng kế hoạch, khác hạt giống cho kế hoạch khác', () => {
    assert.equal(SO_TIN_MAC_DINH, 1000);
    assert.equal(keHoach.tin.length, 1000);
    assert.deepEqual(sinhKeHoach({ bayGio: BAY_GIO }), keHoach);
    assert.notDeepEqual(sinhKeHoach({ bayGio: BAY_GIO, hatGiong: 1 }), keHoach);
  });

  it('hợp lệ theo mọi validator, quy tắc nghiệp vụ và thứ tự thời gian (kể cả khi ghép với phần viết tay)', () => {
    assert.deepEqual(loiCua(keHoach), []);
    assert.deepEqual(loiCua(gopKeHoach(thuCong, keHoach)), []);
  });

  it('hợp lệ với nhiều hạt giống và nhiều quy mô khác nhau', () => {
    for (const [soTin, hatGiong] of [[1, 5], [10, 6], [120, 7], [300, 8], [500, 9]]) {
      const nho = sinhKeHoach({ soTin, hatGiong, bayGio: BAY_GIO });
      assert.equal(nho.tin.length, soTin);
      assert.deepEqual(loiCua(nho), [], `soTin=${soTin} hatGiong=${hatGiong}`);
    }
  });

  it('soTin = 0 cho kế hoạch rỗng; soTin sai bị từ chối', () => {
    assert.deepEqual(sinhKeHoach({ soTin: 0 }), { taiKhoan: [], tin: [], deXuat: [], danhGia: [] });
    for (const soTin of [-1, 1.5, Number.NaN, '10']) assert.throws(() => sinhKeHoach({ soTin }), /số nguyên không âm/);
  });

  it('phủ đủ bốn trạng thái, tỷ lệ gần thiết kế, và có tin cũ lẫn tin mới', () => {
    const theoKetQua = dem(keHoach.tin, (tin) => tin.ketQua);
    assert.deepEqual(Object.keys(theoKetQua).sort(), ['CHO_DE_XUAT', 'DA_CHON', 'DA_DONG', 'HOAN_THANH']);
    const ty = (ketQua) => theoKetQua[ketQua] / keHoach.tin.length;
    assert.ok(Math.abs(ty('CHO_DE_XUAT') - 0.35) < 0.06 && Math.abs(ty('HOAN_THANH') - 0.38) < 0.06, JSON.stringify(theoKetQua));
    const cacNgay = keHoach.tin.map((tin) => Date.parse(tin.taoLuc));
    assert.ok((Math.max(...cacNgay) - Math.min(...cacNgay)) / (24 * 3600 * 1000) > 100, 'tin phải trải trên hơn 100 ngày');
    assert.deepEqual(cacNgay, [...cacNgay].sort((a, b) => a - b), 'mã tin phải tăng theo thời điểm đăng');
    for (const tin of keHoach.tin.filter((muc) => muc.ketQua === 'HOAN_THANH')) {
      assert.ok(tin.chapNhanLuc && tin.hoanThanhLuc, `tin ${tin.khoa} thiếu mốc chấp nhận hoặc hoàn thành`);
      assert.ok(Date.parse(tin.hoanThanhLuc) >= Date.parse(tin.chapNhanLuc));
    }
  });

  it('phân bổ lệch như thật: có khách hàng rất nhiều tin, có khách và kỹ thuật viên chưa có việc, có tài khoản bị khóa', () => {
    const tinTheoKhach = dem(keHoach.tin, (tin) => tin.khachHang);
    assert.ok(Math.max(...Object.values(tinTheoKhach)) >= 20);
    const khach = keHoach.taiKhoan.filter((taiKhoan) => taiKhoan.role === 'CUSTOMER');
    const kyThuatVien = keHoach.taiKhoan.filter((taiKhoan) => taiKhoan.role === 'TECHNICIAN');
    assert.equal(khach.length, 150);
    assert.equal(kyThuatVien.length, 80);
    assert.ok(khach.filter((taiKhoan) => !tinTheoKhach[taiKhoan.khoa]).length >= 10);
    const deXuatTheoKtv = dem(keHoach.deXuat, (deXuat) => deXuat.ktv);
    assert.ok(kyThuatVien.filter((taiKhoan) => !deXuatTheoKtv[taiKhoan.khoa]).length >= 1);
    assert.ok(Math.max(...Object.values(deXuatTheoKtv)) >= 50);
    assert.ok(keHoach.taiKhoan.filter((taiKhoan) => taiKhoan.biKhoa).length >= 3);
  });

  it('đa dạng đề xuất: đã rút, gửi lại sau khi rút, đã sửa, tin không đề xuất, tin đóng còn đề xuất chờ, nhiều đề xuất', () => {
    const deXuatTheoTin = dem(keHoach.deXuat, (deXuat) => deXuat.tin);
    assert.ok(keHoach.tin.some((tin) => !deXuatTheoTin[tin.khoa]), 'cần tin chưa có đề xuất');
    assert.ok(Math.max(...Object.values(deXuatTheoTin)) >= 7);
    assert.ok(keHoach.deXuat.some((deXuat) => deXuat.rut));
    assert.ok(keHoach.deXuat.some((deXuat) => deXuat.sua));
    assert.ok(keHoach.deXuat.some((deXuat) => !deXuat.estimatedDuration));
    const guiLai = keHoach.deXuat.filter((deXuat, chiSo) => !deXuat.rut && keHoach.deXuat.slice(0, chiSo).some((truoc) => truoc.rut && truoc.tin === deXuat.tin && truoc.ktv === deXuat.ktv));
    assert.ok(guiLai.length >= 5, 'cần đề xuất gửi lại sau khi rút');
    const dongConCho = keHoach.tin.filter((tin) => tin.ketQua === 'DA_DONG' && keHoach.deXuat.some((deXuat) => deXuat.tin === tin.khoa && !deXuat.rut));
    assert.ok(dongConCho.length >= 10, 'cần tin đóng còn đề xuất chờ');
    const gia = keHoach.deXuat.map((deXuat) => deXuat.price);
    assert.ok(gia.some((muc) => muc % 1 !== 0) && gia.some((muc) => muc < 50000) && gia.some((muc) => muc > 5000000));
  });

  it('đa dạng đánh giá: đủ 1 đến 5 sao, tin hoàn thành chưa ai đánh giá, chỉ một bên đánh giá, có và không có nhận xét', () => {
    assert.deepEqual([...new Set(keHoach.danhGia.map((danhGia) => danhGia.rating))].sort(), [1, 2, 3, 4, 5]);
    const hoanThanh = keHoach.tin.filter((tin) => tin.ketQua === 'HOAN_THANH');
    const bien = (tin) => keHoach.danhGia.filter((danhGia) => danhGia.tin === tin.khoa);
    assert.ok(hoanThanh.some((tin) => bien(tin).length === 0));
    assert.ok(hoanThanh.some((tin) => bien(tin).length === 1 && bien(tin)[0].nguoiGui === tin.khachHang));
    assert.ok(hoanThanh.some((tin) => bien(tin).length === 1 && bien(tin)[0].nguoiGui === tin.ktvDuocChon));
    assert.ok(hoanThanh.some((tin) => bien(tin).length === 2));
    assert.ok(keHoach.danhGia.some((danhGia) => danhGia.comment) && keHoach.danhGia.some((danhGia) => !danhGia.comment));
  });

  it('đa dạng nội dung: nhiều loại dịch vụ và địa phương, mô tả dài, ký tự đặc biệt, tin đã sửa, số điện thoại nhiều kiểu', () => {
    assert.ok(new Set(keHoach.tin.map((tin) => tin.category)).size >= 8);
    assert.ok(new Set(keHoach.tin.map((tin) => tin.location.split(', ').pop())).size >= 5);
    assert.ok(keHoach.tin.some((tin) => tin.description.length > 500));
    assert.ok(keHoach.tin.some((tin) => /[<&]/.test(tin.description)));
    assert.ok(keHoach.tin.filter((tin) => tin.suaTin).length >= 30);
    const dienThoai = keHoach.taiKhoan.map((taiKhoan) => taiKhoan.phone);
    assert.ok(dienThoai.some((so) => so.startsWith('+84')) && dienThoai.some((so) => so.includes(' ')) && dienThoai.some((so) => so.includes('.')));
    assert.ok(keHoach.tin.some((tin) => Date.parse(tin.thoiGianMongMuon) < BAY_GIO.getTime() && tin.ketQua === 'CHO_DE_XUAT'), 'cần tin chờ có thời gian mong muốn đã qua');
    assert.ok(new Set(keHoach.tin.map((tin) => tin.title)).size > 300, 'tiêu đề phải đa dạng');
  });
});
