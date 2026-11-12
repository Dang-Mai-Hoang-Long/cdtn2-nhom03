// Chạy seed trên CSDL test rồi kiểm tra dữ liệu mẫu tuân thủ quy tắc nghiệp vụ, không chỉ "có dữ liệu".
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, truyVan, dongKetNoi, datLaiCoSoDuLieu } = require('./helpers');
const { chayDuLieuMau } = require('../seeds/chay-seed');
const { MAT_KHAU_DEMO, QUAN_TRI_VIEN, KHACH_HANG, KY_THUAT_VIEN } = require('../seeds/tai-khoan');
const cacTin = require('../seeds/tin-sua-chua');
const cacDeXuat = require('../seeds/de-xuat');
const cacDanhGia = require('../seeds/danh-gia');

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
    const tatCa = [...QUAN_TRI_VIEN, ...KHACH_HANG, ...KY_THUAT_VIEN].filter((taiKhoan) => !taiKhoan.biKhoa);
    for (const taiKhoan of tatCa) {
      const res = await request(app).post('/api/auth/login').send({ email: taiKhoan.email, password: MAT_KHAU_DEMO });
      assert.equal(res.status, 200, taiKhoan.email);
    }
    const theoVaiTro = await lay('SELECT role, count(*)::int AS so FROM users GROUP BY role ORDER BY role');
    assert.deepEqual(theoVaiTro, [
      { role: 'ADMIN', so: QUAN_TRI_VIEN.length },
      { role: 'CUSTOMER', so: KHACH_HANG.length },
      { role: 'TECHNICIAN', so: KY_THUAT_VIEN.length },
    ]);
    assert.equal(ketQuaSeed.soTaiKhoan, QUAN_TRI_VIEN.length + KHACH_HANG.length + KY_THUAT_VIEN.length);
  });

  it('tài khoản bị khóa không đăng nhập được (BR02)', async () => {
    const taiKhoanBiKhoa = KY_THUAT_VIEN.find((taiKhoan) => taiKhoan.biKhoa);
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
