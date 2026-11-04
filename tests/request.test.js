const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, truyVan, dongKetNoi, datLaiCoSoDuLieu, taoTaiKhoan, voiToken, duLieuTinMau, taoTin } = require('./helpers');

let khachHang;
let khachHangKhac;
let kyThuatVien;
let quanTriVien;

before(async () => {
  await datLaiCoSoDuLieu();
  khachHang = await taoTaiKhoan('CUSTOMER', { fullName: 'Nguyễn Minh Anh' });
  khachHangKhac = await taoTaiKhoan('CUSTOMER');
  kyThuatVien = await taoTaiKhoan('TECHNICIAN');
  quanTriVien = await taoTaiKhoan('ADMIN');
});
after(dongKetNoi);

describe('US06 - Đăng tin sửa chữa', () => {
  it('khách hàng đăng tin thành công, trạng thái Chờ đề xuất', async () => {
    const res = await voiToken(request(app).post('/api/requests'), khachHang.token).send(duLieuTinMau);
    assert.equal(res.status, 201);
    assert.equal(res.body.message, 'Tạo tin thành công');
    assert.equal(res.body.data.status, 'WAITING_PROPOSAL');
    assert.equal(res.body.data.customerId, khachHang.id);
    assert.equal(res.body.data.selectedProposalId, null);
    assert.equal(res.body.data.preferredTime, '2026-11-05T09:00:00.000Z');
  });

  it('thiếu thông tin bắt buộc thì không tạo tin (BR05)', async () => {
    const res = await voiToken(request(app).post('/api/requests'), khachHang.token).send({ description: 'abc' });
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'VALIDATION_ERROR');
    assert.deepEqual(res.body.details.map((loi) => loi.field).sort(), ['category', 'location', 'preferredTime', 'title']);
  });

  it('kỹ thuật viên và quản trị viên không được đăng tin (BR01)', async () => {
    for (const taiKhoan of [kyThuatVien, quanTriVien]) {
      const res = await voiToken(request(app).post('/api/requests'), taiKhoan.token).send(duLieuTinMau);
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'FORBIDDEN');
    }
  });

  it('chưa đăng nhập trả 401', async () => {
    const res = await request(app).post('/api/requests').send(duLieuTinMau);
    assert.equal(res.status, 401);
  });
});

describe('US07 - Danh sách tin của tôi', () => {
  it('chỉ trả tin của chính khách hàng, kèm phân trang và số đề xuất (BR03)', async () => {
    await taoTin(khachHangKhac.token, { title: 'Tin của người khác' });
    const res = await voiToken(request(app).get('/api/requests/my'), khachHang.token);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 1);
    assert.ok(res.body.data.every((tin) => tin.customerId === khachHang.id));
    assert.equal(res.body.data[0].proposalCount, 0);
    assert.deepEqual(Object.keys(res.body.meta).sort(), ['page', 'size', 'totalElements', 'totalPages']);
  });

  it('khách hàng chưa có tin nhận danh sách rỗng', async () => {
    const moi = await taoTaiKhoan('CUSTOMER');
    const res = await voiToken(request(app).get('/api/requests/my'), moi.token);
    assert.deepEqual(res.body.data, []);
    assert.equal(res.body.meta.totalElements, 0);
  });

  it('phân trang theo page/size', async () => {
    const moi = await taoTaiKhoan('CUSTOMER');
    for (let i = 1; i <= 3; i += 1) await taoTin(moi.token, { title: `Tin ${i}` });
    const res = await voiToken(request(app).get('/api/requests/my?page=2&size=2'), moi.token);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].title, 'Tin 1');
    assert.deepEqual(res.body.meta, { page: 2, size: 2, totalElements: 3, totalPages: 2 });
  });

  it('kỹ thuật viên không gọi được API này', async () => {
    const res = await voiToken(request(app).get('/api/requests/my'), kyThuatVien.token);
    assert.equal(res.status, 403);
  });
});

describe('US08 - Chi tiết tin của mình', () => {
  it('chủ tin xem đầy đủ, có cả số điện thoại của mình', async () => {
    const tin = await taoTin(khachHang.token);
    const res = await voiToken(request(app).get(`/api/requests/${tin.id}`), khachHang.token);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.id, tin.id);
    assert.equal(res.body.data.customer.fullName, 'Nguyễn Minh Anh');
    assert.equal(res.body.data.customer.phone, '0901234567');
  });

  it('khách hàng khác không xem được (BR03)', async () => {
    const tin = await taoTin(khachHang.token);
    const res = await voiToken(request(app).get(`/api/requests/${tin.id}`), khachHangKhac.token);
    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'NOT_OWNER');
  });

  it('tin không tồn tại hoặc mã không hợp lệ trả 404', async () => {
    for (const ma of ['999999', 'abc']) {
      const res = await voiToken(request(app).get(`/api/requests/${ma}`), khachHang.token);
      assert.equal(res.status, 404);
      assert.equal(res.body.code, 'REQUEST_NOT_FOUND');
    }
  });
});

describe('US10 - Kỹ thuật viên xem danh sách tin', () => {
  it('chỉ liệt kê tin Chờ đề xuất (BR04)', async () => {
    const tinDaXong = await taoTin(khachHang.token, { title: 'Tin đã chọn' });
    await truyVan(`UPDATE repair_request SET status = 'SELECTED' WHERE id = $1`, [tinDaXong.id]);
    const res = await voiToken(request(app).get('/api/requests?size=100'), kyThuatVien.token);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length > 0);
    assert.ok(res.body.data.every((tin) => tin.status === 'WAITING_PROPOSAL'));
    assert.ok(!res.body.data.some((tin) => tin.id === tinDaXong.id));
    assert.ok(res.body.data.every((tin) => tin.customer === undefined), 'không kèm liên hệ khách hàng (BR15)');
  });

  it('lọc theo loại dịch vụ và khu vực', async () => {
    await taoTin(khachHang.token, { category: 'Điện nước', location: 'Thủ Đức' });
    const res = await voiToken(request(app).get(`/api/requests?category=${encodeURIComponent('Điện nước')}&location=${encodeURIComponent('thủ đức')}`), kyThuatVien.token);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].category, 'Điện nước');
  });

  it('khách hàng không gọi được API danh sách của kỹ thuật viên', async () => {
    const res = await voiToken(request(app).get('/api/requests'), khachHang.token);
    assert.equal(res.status, 403);
  });
});

describe('US12 - Kỹ thuật viên xem chi tiết tin', () => {
  it('xem được thông tin nhưng không thấy số điện thoại khách (BR15)', async () => {
    const tin = await taoTin(khachHang.token);
    const res = await voiToken(request(app).get(`/api/requests/${tin.id}`), kyThuatVien.token);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.customer.fullName, 'Nguyễn Minh Anh');
    assert.equal(res.body.data.customer.phone, undefined);
    assert.equal(res.body.data.canPropose, true);
    assert.equal(res.body.data.hasProposed, false);
    assert.equal(res.body.data.myProposalStatus, null);
  });

  it('tin không còn Chờ đề xuất vẫn xem được nhưng không gửi đề xuất được (BR04)', async () => {
    const tin = await taoTin(khachHang.token);
    await truyVan(`UPDATE repair_request SET status = 'CLOSED' WHERE id = $1`, [tin.id]);
    const res = await voiToken(request(app).get(`/api/requests/${tin.id}`), kyThuatVien.token);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'CLOSED');
    assert.equal(res.body.data.canPropose, false);
  });

  it('quản trị viên không xem chi tiết tin (BR01)', async () => {
    const tin = await taoTin(khachHang.token);
    const res = await voiToken(request(app).get(`/api/requests/${tin.id}`), quanTriVien.token);
    assert.equal(res.status, 403);
  });
});

describe('US17 - Xác nhận hoàn thành', () => {
  it('tin còn Chờ đề xuất thì không xác nhận được (BR12)', async () => {
    const tin = await taoTin(khachHang.token);
    const res = await voiToken(request(app).patch(`/api/requests/${tin.id}/complete`), khachHang.token);
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'INVALID_STATUS_TRANSITION');
  });

  it('không phải chủ tin thì bị từ chối (BR11)', async () => {
    const tin = await taoTin(khachHang.token);
    await truyVan(`UPDATE repair_request SET status = 'SELECTED' WHERE id = $1`, [tin.id]);
    const res = await voiToken(request(app).patch(`/api/requests/${tin.id}/complete`), khachHangKhac.token);
    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'NOT_OWNER');
  });

  it('chủ tin xác nhận khi tin Đã chọn kỹ thuật viên, lần hai bị từ chối', async () => {
    const tin = await taoTin(khachHang.token);
    await truyVan(`UPDATE repair_request SET status = 'SELECTED' WHERE id = $1`, [tin.id]);
    const res = await voiToken(request(app).patch(`/api/requests/${tin.id}/complete`), khachHang.token);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'COMPLETED');
    const lanHai = await voiToken(request(app).patch(`/api/requests/${tin.id}/complete`), khachHang.token);
    assert.equal(lanHai.body.code, 'INVALID_STATUS_TRANSITION');
  });
});
