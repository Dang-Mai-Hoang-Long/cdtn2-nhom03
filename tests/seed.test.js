// Chạy seed trên CSDL test rồi kiểm tra dữ liệu mẫu tuân thủ quy tắc nghiệp vụ, không chỉ "có dữ liệu".
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, truyVan, dongKetNoi, datLaiCoSoDuLieu } = require('./helpers');
const { chayDuLieuMau } = require('../seeds/chay-seed');
const { MAT_KHAU_DEMO } = require('../seeds/hang-so');
const { taiKhoan: cacTaiKhoan, tin: cacTin, deXuat: cacDeXuat, danhGia: cacDanhGia } = require('../seeds/thu-cong');

const theoVaiTro = (role) => cacTaiKhoan.filter((taiKhoan) => taiKhoan.role === role);

let ketQuaSeed;

before(async () => {
  await datLaiCoSoDuLieu();
  ketQuaSeed = await chayDuLieuMau();
});
after(dongKetNoi);

async function lay(cauLenh, thamSo) {
  const { rows } = await truyVan(cauLenh, thamSo);
  return rows;
}

describe('Seed - tài khoản demo', () => {
  it('đủ tài khoản theo vai trò, đăng nhập được bằng mật khẩu demo (BR01)', async () => {
    for (const taiKhoan of cacTaiKhoan.filter((tk) => !tk.biKhoa)) {
      const res = await request(app).post('/api/auth/login').send({ email: taiKhoan.email, password: MAT_KHAU_DEMO });
      assert.equal(res.status, 200, taiKhoan.email);
    }
    const soTheoVaiTro = await lay('SELECT role, count(*)::int AS so FROM users GROUP BY role ORDER BY role');
    assert.deepEqual(soTheoVaiTro, [
      { role: 'ADMIN', so: theoVaiTro('ADMIN').length },
      { role: 'CUSTOMER', so: theoVaiTro('CUSTOMER').length },
      { role: 'TECHNICIAN', so: theoVaiTro('TECHNICIAN').length },
    ]);
    assert.equal(ketQuaSeed.soTaiKhoan, cacTaiKhoan.length);
  });

  it('tài khoản bị khóa không đăng nhập được (BR02)', async () => {
    const taiKhoanBiKhoa = cacTaiKhoan.find((taiKhoan) => taiKhoan.biKhoa);
    const res = await request(app).post('/api/auth/login').send({ email: taiKhoanBiKhoa.email, password: MAT_KHAU_DEMO });
    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'ACCOUNT_LOCKED');
  });
});

describe('Seed - quy tắc nghiệp vụ của dữ liệu mẫu', () => {
  it('mỗi tin tối đa một đề xuất ACCEPTED và mỗi kỹ thuật viên tối đa một đề xuất còn hiệu lực cho mỗi tin (BR08, BR10)', async () => {
    const nhieuChapNhan = await lay(`SELECT request_id FROM proposal WHERE status = 'ACCEPTED' GROUP BY request_id HAVING count(*) > 1`);
    assert.deepEqual(nhieuChapNhan, []);
    const nhieuHieuLuc = await lay(`SELECT request_id, technician_id FROM proposal WHERE status IN ('PENDING', 'ACCEPTED') GROUP BY request_id, technician_id HAVING count(*) > 1`);
    assert.deepEqual(nhieuHieuLuc, []);
  });

  it('trạng thái tin khớp đề xuất được chọn, đề xuất còn lại không còn chờ (BR10, BR12)', async () => {
    const cacYeuCau = await lay('SELECT id, status, selected_proposal_id FROM repair_request ORDER BY id');
    assert.equal(cacYeuCau.length, cacTin.length);
    for (const yeuCau of cacYeuCau) {
      const deXuatTrongTin = await lay('SELECT id, status FROM proposal WHERE request_id = $1', [yeuCau.id]);
      if (['SELECTED', 'COMPLETED'].includes(yeuCau.status)) {
        const duocChon = deXuatTrongTin.find((deXuat) => deXuat.id === yeuCau.selected_proposal_id);
        assert.equal(duocChon?.status, 'ACCEPTED', `tin ${yeuCau.id}`);
        assert.equal(deXuatTrongTin.filter((deXuat) => deXuat.status === 'PENDING').length, 0, `tin ${yeuCau.id} còn đề xuất chờ`);
      } else {
        assert.equal(yeuCau.selected_proposal_id, null, `tin ${yeuCau.id}`);
        assert.equal(deXuatTrongTin.filter((deXuat) => deXuat.status === 'ACCEPTED').length, 0, `tin ${yeuCau.id}`);
      }
    }
  });

  it('phủ đủ các trạng thái của tin và của đề xuất để thử mọi màn hình', async () => {
    const trangThaiTin = (await lay('SELECT DISTINCT status FROM repair_request ORDER BY status')).map((dong) => dong.status);
    assert.deepEqual(trangThaiTin, ['CLOSED', 'COMPLETED', 'SELECTED', 'WAITING_PROPOSAL']);
    const trangThaiDeXuat = (await lay('SELECT DISTINCT status FROM proposal ORDER BY status')).map((dong) => dong.status);
    assert.deepEqual(trangThaiDeXuat, ['ACCEPTED', 'PENDING', 'REJECTED', 'WITHDRAWN']);
    assert.equal(ketQuaSeed.soTin, cacTin.length);
    assert.equal(ketQuaSeed.soDeXuat, cacDeXuat.length);
  });

  it('đánh giá chỉ cho tin hoàn thành, đúng hai bên tham gia, mỗi bên một lần và điểm trung bình khớp (BR13, BR14)', async () => {
    const cacDanhGiaDaLuu = await lay(`SELECT rv.request_id, rv.from_user_id, rv.to_user_id, r.status, r.customer_id, p.technician_id
      FROM review rv JOIN repair_request r ON r.id = rv.request_id JOIN proposal p ON p.id = r.selected_proposal_id`);
    assert.equal(cacDanhGiaDaLuu.length, cacDanhGia.length);
    for (const danhGia of cacDanhGiaDaLuu) {
      assert.equal(danhGia.status, 'COMPLETED');
      const haiBen = [danhGia.customer_id, danhGia.technician_id].sort();
      assert.deepEqual([danhGia.from_user_id, danhGia.to_user_id].sort(), haiBen);
      assert.notEqual(danhGia.from_user_id, danhGia.to_user_id);
    }
    const trung = await lay('SELECT request_id, from_user_id FROM review GROUP BY request_id, from_user_id HAVING count(*) > 1');
    assert.deepEqual(trung, []);
    const lechDiem = await lay(`SELECT u.id FROM users u WHERE u.rating_avg IS DISTINCT FROM (SELECT ROUND(AVG(rating)::numeric, 1) FROM review WHERE to_user_id = u.id)`);
    assert.deepEqual(lechDiem, []);
  });

  it('mỗi đề xuất được chấp nhận có đúng một thông báo cho kỹ thuật viên của nó (BR16)', async () => {
    const chapNhan = await lay(`SELECT id, technician_id FROM proposal WHERE status = 'ACCEPTED'`);
    assert.ok(chapNhan.length > 0);
    for (const deXuat of chapNhan) {
      const thongBao = await lay(`SELECT id FROM notification WHERE user_id = $1 AND related_id = $2 AND type = 'PROPOSAL_ACCEPTED'`, [deXuat.technician_id, deXuat.id]);
      assert.equal(thongBao.length, 1, `đề xuất ${deXuat.id}`);
    }
    const tongThongBao = await lay('SELECT count(*)::int AS so FROM notification');
    assert.equal(tongThongBao[0].so, chapNhan.length);
  });
});

describe('Seed - mã ổn định của dữ liệu cũ (bug-log, api-contract dẫn tới những mã này)', () => {
  it('7 tài khoản, 7 tin, 9 đề xuất, 3 đánh giá đầu giữ nguyên mã và trạng thái', async () => {
    const emails = (await lay('SELECT email FROM users WHERE id <= 7 ORDER BY id')).map((dong) => dong.email);
    assert.deepEqual(emails, ['admin@demo.vn', 'khach1@demo.vn', 'khach2@demo.vn', 'ktv1@demo.vn', 'ktv2@demo.vn', 'ktv3@demo.vn', 'bikhoa@demo.vn']);
    const tin = await lay('SELECT id, title, status FROM repair_request WHERE id <= 7 ORDER BY id');
    assert.equal(tin[1].title, 'Máy giặt không vắt được');
    assert.deepEqual(tin.map((dong) => dong.status), ['WAITING_PROPOSAL', 'WAITING_PROPOSAL', 'SELECTED', 'COMPLETED', 'COMPLETED', 'CLOSED', 'WAITING_PROPOSAL']);
    const deXuat = await lay('SELECT status FROM proposal WHERE id <= 9 ORDER BY id');
    assert.deepEqual(deXuat.map((dong) => dong.status), ['PENDING', 'PENDING', 'WITHDRAWN', 'ACCEPTED', 'REJECTED', 'ACCEPTED', 'REJECTED', 'ACCEPTED', 'PENDING']);
    const danhGia = await lay('SELECT request_id FROM review WHERE id <= 3 ORDER BY id');
    assert.deepEqual(danhGia.map((dong) => dong.request_id), [4, 4, 5]);
    const thongBao = await lay('SELECT user_id, related_id, is_read FROM notification WHERE id <= 3 ORDER BY id');
    assert.deepEqual(thongBao, [{ user_id: 4, related_id: 4, is_read: false }, { user_id: 5, related_id: 6, is_read: false }, { user_id: 4, related_id: 8, is_read: true }]);
  });
});

describe('Seed - phần viết tay phủ đủ các tình huống đã hứa trong seeds/README.md', () => {
  const soTinThuCong = cacTin.length;

  it('khoảng 50 tin; có khách hàng và kỹ thuật viên đủ nhiều dữ liệu để thử phân trang (10 mục mỗi trang)', async () => {
    assert.ok(soTinThuCong >= 45 && soTinThuCong <= 55, `số tin viết tay là ${soTinThuCong}`);
    const khachNhieuTin = await lay('SELECT customer_id FROM repair_request WHERE id <= $1 GROUP BY customer_id HAVING count(*) > 10', [soTinThuCong]);
    assert.ok(khachNhieuTin.length >= 1);
    const ktvNhieuDeXuat = await lay('SELECT technician_id FROM proposal WHERE request_id <= $1 GROUP BY technician_id HAVING count(*) > 10', [soTinThuCong]);
    assert.ok(ktvNhieuDeXuat.length >= 1);
    const ktvNhieuViecDuocChon = await lay(`SELECT technician_id FROM proposal WHERE request_id <= $1 AND status = 'ACCEPTED' GROUP BY technician_id HAVING count(*) >= 5`, [soTinThuCong]);
    assert.ok(ktvNhieuViecDuocChon.length >= 1);
  });

  it('tin đóng còn đề xuất chờ (BR06), tin chờ mà mọi đề xuất đã rút, đề xuất gửi lại sau khi rút (BR08)', async () => {
    const dongConCho = await lay(`SELECT DISTINCT r.id FROM repair_request r JOIN proposal p ON p.request_id = r.id
      WHERE r.status = 'CLOSED' AND p.status = 'PENDING' AND r.id <= $1`, [soTinThuCong]);
    assert.ok(dongConCho.length >= 1);
    const chiConDeXuatDaRut = await lay(`SELECT r.id FROM repair_request r WHERE r.status = 'WAITING_PROPOSAL' AND r.id <= $1
      AND EXISTS (SELECT 1 FROM proposal WHERE request_id = r.id)
      AND NOT EXISTS (SELECT 1 FROM proposal WHERE request_id = r.id AND status IN ('PENDING', 'ACCEPTED'))`, [soTinThuCong]);
    assert.ok(chiConDeXuatDaRut.length >= 1);
    const guiLai = await lay(`SELECT request_id, technician_id FROM proposal WHERE request_id <= $1 GROUP BY request_id, technician_id
      HAVING count(*) FILTER (WHERE status = 'WITHDRAWN') > 0 AND count(*) FILTER (WHERE status = 'PENDING') > 0`, [soTinThuCong]);
    assert.ok(guiLai.length >= 1);
  });

  it('đánh giá đủ 1 đến 5 sao; có tin hoàn thành chưa ai đánh giá, chỉ một bên đánh giá, nhận xét dài đúng 1000 ký tự', async () => {
    const cacSao = (await lay('SELECT DISTINCT rating FROM review WHERE request_id <= $1 ORDER BY rating', [soTinThuCong])).map((dong) => dong.rating);
    assert.deepEqual(cacSao, [1, 2, 3, 4, 5]);
    const theoTin = await lay(`SELECT count(rv.id)::int AS so, coalesce(bool_or(rv.from_user_id = r.customer_id), false) AS co_khach
      FROM repair_request r LEFT JOIN review rv ON rv.request_id = r.id WHERE r.status = 'COMPLETED' AND r.id <= $1 GROUP BY r.id`, [soTinThuCong]);
    assert.ok(theoTin.some((dong) => dong.so === 0), 'cần tin hoàn thành chưa ai đánh giá');
    assert.ok(theoTin.some((dong) => dong.so === 1 && dong.co_khach), 'cần tin chỉ khách hàng đánh giá');
    assert.ok(theoTin.some((dong) => dong.so === 1 && !dong.co_khach), 'cần tin chỉ kỹ thuật viên đánh giá');
    const [{ dai_nhat }] = await lay('SELECT max(length(comment))::int AS dai_nhat FROM review WHERE request_id <= $1', [soTinThuCong]);
    assert.equal(dai_nhat, 1000);
  });

  it('giá đề xuất ở hai đầu biên của validator', async () => {
    const [{ thap, cao }] = await lay('SELECT min(price) AS thap, max(price) AS cao FROM proposal WHERE request_id <= $1', [soTinThuCong]);
    assert.equal(thap, 0.1);
    assert.ok(cao >= 9999999999999);
  });

  it('tài khoản đủ loại: khách hàng và kỹ thuật viên bị khóa, người chưa có dữ liệu; không khóa được quản trị viên (BR01, BR02)', async () => {
    const biKhoa = (await lay('SELECT role FROM users WHERE is_locked ORDER BY role')).map((dong) => dong.role);
    assert.ok(biKhoa.includes('CUSTOMER') && biKhoa.includes('TECHNICIAN'));
    const khachChuaCoTin = await lay(`SELECT id FROM users u WHERE role = 'CUSTOMER' AND NOT EXISTS (SELECT 1 FROM repair_request WHERE customer_id = u.id)`);
    assert.ok(khachChuaCoTin.length >= 1);
    const ktvChuaDeXuat = await lay(`SELECT id FROM users u WHERE role = 'TECHNICIAN' AND NOT EXISTS (SELECT 1 FROM proposal WHERE technician_id = u.id)`);
    assert.ok(ktvChuaDeXuat.length >= 1);

    const dangNhap = await request(app).post('/api/auth/login').send({ email: 'admin@demo.vn', password: MAT_KHAU_DEMO });
    const [{ id: maAdminPhu }] = await lay(`SELECT id FROM users WHERE email = 'admin2@demo.vn'`);
    const khoa = await request(app).patch(`/api/admin/users/${maAdminPhu}/lock`).set('Authorization', `Bearer ${dangNhap.body.data.token}`);
    assert.equal(khoa.status, 403);
    assert.equal(khoa.body.code, 'FORBIDDEN');
  });

  it('thông báo có cả đã đọc lẫn chưa đọc, một kỹ thuật viên có nhiều thông báo chưa đọc (BR16)', async () => {
    const [{ da_doc }] = await lay('SELECT count(*)::int AS da_doc FROM notification WHERE is_read');
    assert.ok(da_doc >= 1);
    const nhieuChuaDoc = await lay('SELECT user_id FROM notification WHERE NOT is_read GROUP BY user_id HAVING count(*) >= 5');
    assert.ok(nhieuChuaDoc.length >= 1);
  });

  it('dữ liệu biên được lưu đúng: độ dài tối đa, khoảng trắng bị cắt, ký tự đặc biệt giữ nguyên, tin và đề xuất đã sửa', async () => {
    const [{ title: dai200 }] = await lay('SELECT title FROM repair_request WHERE length(title) = 200');
    assert.equal(dai200.length, 200);
    const toiDa = await lay('SELECT 1 FROM repair_request WHERE length(category) = 50 AND length(location) = 255');
    assert.equal(toiDa.length, 1);
    const daCat = await lay(`SELECT title, location FROM repair_request WHERE title = 'Máy giặt   kêu  to' AND location = 'Quận 5, TP. Hồ Chí Minh'`);
    assert.equal(daCat.length, 1);
    const dacBiet = await lay(`SELECT 1 FROM repair_request WHERE title = $1`, [`Ổ cắm "chập" & <b>nổ</b> '; DROP TABLE users; --`]);
    assert.equal(dacBiet.length, 1);
    const daSua = await lay(`SELECT 1 FROM repair_request WHERE title = 'Cần xem giúp cửa cuốn bị kẹt' AND category = 'Sửa cửa cuốn'`);
    assert.equal(daSua.length, 1);
    const [{ price }] = await lay(`SELECT price FROM proposal WHERE description LIKE 'Kiểm tra gas, áp suất và cảm biến của cả hai máy.%'`);
    assert.equal(price, 430000);
  });
});

describe('Seed - chạy lại và chốt chặn', () => {
  it('đã có tài khoản demo thì từ chối chạy lại, --reset tạo lại đúng số lượng', async () => {
    await assert.rejects(() => chayDuLieuMau(), /seed:reset/);
    const lanHai = await chayDuLieuMau({ datLai: true });
    assert.deepEqual(lanHai, ketQuaSeed);
    const soTin = await lay('SELECT count(*)::int AS so FROM repair_request');
    assert.equal(soTin[0].so, cacTin.length);
  });

  it('từ chối chạy ở môi trường production', async () => {
    const moiTruongCu = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      await assert.rejects(() => chayDuLieuMau({ datLai: true }), /production/);
    } finally {
      process.env.NODE_ENV = moiTruongCu;
    }
    const soTin = await lay('SELECT count(*)::int AS so FROM repair_request');
    assert.equal(soTin[0].so, cacTin.length);
  });
});
