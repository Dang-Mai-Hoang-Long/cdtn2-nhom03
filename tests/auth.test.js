const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, truyVan, dongKetNoi, datLaiCoSoDuLieu, taoTaiKhoan } = require('./helpers');

before(datLaiCoSoDuLieu);
after(dongKetNoi);

const duLieuDangKy = {
  email: 'Minh.Anh@Example.com',
  password: 'matkhau123',
  fullName: 'Nguyễn Minh Anh',
  phone: '0901234567',
  role: 'CUSTOMER',
};

describe('US01 - Đăng ký', () => {
  it('đăng ký thành công, trả token và không lộ mật khẩu', async () => {
    const res = await request(app).post('/api/auth/register').send(duLieuDangKy);
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, 'Đăng ký thành công');
    assert.equal(res.body.data.email, 'minh.anh@example.com');
    assert.equal(res.body.data.role, 'CUSTOMER');
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.passwordHash, undefined);
  });

  it('thiếu thông tin bắt buộc trả VALIDATION_ERROR kèm chi tiết từng trường', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' });
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'VALIDATION_ERROR');
    const cacTruong = res.body.details.map((loi) => loi.field);
    for (const truong of ['fullName', 'password', 'phone', 'role']) assert.ok(cacTruong.includes(truong), truong);
    assert.equal(res.body.path, '/api/auth/register');
  });

  it('email đã tồn tại (không phân biệt hoa thường) trả 409 EMAIL_ALREADY_EXISTS', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...duLieuDangKy, email: 'minh.anh@example.com' });
    assert.equal(res.status, 409);
    assert.equal(res.body.code, 'EMAIL_ALREADY_EXISTS');
    assert.equal(res.body.message, 'Email đã tồn tại');
  });

  it('không cho tự đăng ký vai trò ADMIN (BR01)', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...duLieuDangKy, email: 'admin@example.com', role: 'ADMIN' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.details.map((loi) => loi.field), ['role']);
  });
});

describe('US02 - Đăng nhập', () => {
  it('đăng nhập đúng trả token và thông tin người dùng có vai trò', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'minh.anh@example.com', password: 'matkhau123' });
    assert.equal(res.status, 200);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.role, 'CUSTOMER');
    assert.equal(res.body.data.user.isLocked, false);
    assert.equal(res.body.data.user.passwordHash, undefined);
  });

  it('sai mật khẩu hoặc email trả 401 với cùng một thông báo', async () => {
    const saiMatKhau = await request(app).post('/api/auth/login').send({ email: 'minh.anh@example.com', password: 'sai' });
    const saiEmail = await request(app).post('/api/auth/login').send({ email: 'khong@co.com', password: 'matkhau123' });
    for (const res of [saiMatKhau, saiEmail]) {
      assert.equal(res.status, 401);
      assert.equal(res.body.code, 'UNAUTHORIZED');
      assert.equal(res.body.message, 'Email hoặc mật khẩu không đúng');
    }
  });

  it('tài khoản bị khóa không đăng nhập được (BR02)', async () => {
    const taiKhoan = await taoTaiKhoan('TECHNICIAN', { isLocked: true });
    const res = await request(app).post('/api/auth/login').send({ email: taiKhoan.email, password: taiKhoan.password });
    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'ACCOUNT_LOCKED');
    assert.equal(res.body.message, 'Tài khoản đã bị khóa, vui lòng liên hệ quản trị viên');
  });
});

describe('US03 - Đăng xuất và /me', () => {
  it('đăng xuất cần đăng nhập', async () => {
    const res = await request(app).post('/api/auth/logout');
    assert.equal(res.status, 401);
    assert.equal(res.body.code, 'UNAUTHORIZED');
  });

  it('đăng xuất thành công khi có token', async () => {
    const { token } = await taoTaiKhoan('CUSTOMER');
    const res = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Đăng xuất thành công');
  });

  it('/me trả thông tin người dùng hiện tại', async () => {
    const { id, token } = await taoTaiKhoan('TECHNICIAN');
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, id);
    assert.equal(res.body.data.role, 'TECHNICIAN');
    assert.ok(res.body.data.createdAt);
  });

  it('token sai trả 401', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer abc.def.ghi');
    assert.equal(res.status, 401);
  });

  it('tài khoản bị khóa sau khi đăng nhập bị chặn ngay ở các API cần đăng nhập (BR02)', async () => {
    const { id, token } = await taoTaiKhoan('CUSTOMER');
    await truyVan('UPDATE users SET is_locked = true WHERE id = $1', [id]);
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'ACCOUNT_LOCKED');
  });
});
