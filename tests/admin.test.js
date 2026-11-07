const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, dongKetNoi, datLaiCoSoDuLieu, taoTaiKhoan, voiToken } = require('./helpers');

let quanTriVien;
let khachHang;
let kyThuatVien;

before(async () => {
  await datLaiCoSoDuLieu();
  quanTriVien = await taoTaiKhoan('ADMIN');
  khachHang = await taoTaiKhoan('CUSTOMER', { fullName: 'Nguyễn Minh Anh' });
  kyThuatVien = await taoTaiKhoan('TECHNICIAN', { fullName: 'Trần Quốc Huy' });
});
after(dongKetNoi);

function goiQuanTri(phuongThuc, duongDan, token = quanTriVien.token) {
  return voiToken(request(app)[phuongThuc](`/api/admin${duongDan}`), token);
}

describe('US04 - Xem danh sách tài khoản', () => {
  it('liệt kê khách hàng và kỹ thuật viên, không gồm quản trị viên, kèm thống kê', async () => {
    const res = await goiQuanTri('get', '/users');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.map((nguoiDung) => nguoiDung.role).sort(), ['CUSTOMER', 'TECHNICIAN']);
    assert.equal(res.body.data[0].passwordHash, undefined);
    assert.deepEqual(res.body.meta.summary, { active: 2, locked: 0 });
  });

  it('lọc theo từ khóa, vai trò và trạng thái', async () => {
    const theoTen = await goiQuanTri('get', `/users?q=${encodeURIComponent('quốc huy')}`);
    assert.deepEqual(theoTen.body.data.map((nguoiDung) => nguoiDung.id), [kyThuatVien.id]);
    const theoVaiTro = await goiQuanTri('get', '/users?role=CUSTOMER');
    assert.deepEqual(theoVaiTro.body.data.map((nguoiDung) => nguoiDung.id), [khachHang.id]);
    const biKhoa = await goiQuanTri('get', '/users?status=LOCKED');
    assert.deepEqual(biKhoa.body.data, []);
  });

  it('khách hàng và kỹ thuật viên không truy cập được (BR01)', async () => {
    for (const taiKhoan of [khachHang, kyThuatVien]) {
      const res = await goiQuanTri('get', '/users', taiKhoan.token);
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'FORBIDDEN');
    }
  });
});

describe('US05 - Khóa / mở khóa tài khoản', () => {
  it('khóa thì người dùng không đăng nhập và không gọi API được; mở khóa thì dùng lại được', async () => {
    const khoa = await goiQuanTri('patch', `/users/${khachHang.id}/lock`);
    assert.equal(khoa.status, 200);
    assert.equal(khoa.body.message, 'Khóa tài khoản thành công');
    assert.equal(khoa.body.data.isLocked, true);

    const dangNhap = await request(app).post('/api/auth/login').send({ email: khachHang.email, password: khachHang.password });
    assert.equal(dangNhap.body.code, 'ACCOUNT_LOCKED');
    const goiApi = await voiToken(request(app).get('/api/auth/me'), khachHang.token);
    assert.equal(goiApi.body.code, 'ACCOUNT_LOCKED');

    const moKhoa = await goiQuanTri('patch', `/users/${khachHang.id}/unlock`);
    assert.equal(moKhoa.body.message, 'Mở khóa tài khoản thành công');
    assert.equal(moKhoa.body.data.isLocked, false);
    const dangNhapLai = await request(app).post('/api/auth/login').send({ email: khachHang.email, password: khachHang.password });
    assert.equal(dangNhapLai.status, 200);
  });

  it('không khóa được tài khoản quản trị viên, kể cả chính mình', async () => {
    const res = await goiQuanTri('patch', `/users/${quanTriVien.id}/lock`);
    assert.equal(res.status, 403);
  });

  it('người dùng không tồn tại trả USER_NOT_FOUND', async () => {
    const res = await goiQuanTri('patch', '/users/999999/lock');
    assert.equal(res.status, 404);
    assert.equal(res.body.code, 'USER_NOT_FOUND');
  });

  it('người không phải quản trị viên không khóa được', async () => {
    const res = await goiQuanTri('patch', `/users/${khachHang.id}/lock`, kyThuatVien.token);
    assert.equal(res.status, 403);
  });
});
