const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, truyVan, dongKetNoi, datLaiCoSoDuLieu, taoTaiKhoan, voiToken, taoTin } = require('./helpers');

let khachHang;
let khachHangKhac;
let kyThuatVienA;
let kyThuatVienB;

before(async () => {
  await datLaiCoSoDuLieu();
  khachHang = await taoTaiKhoan('CUSTOMER');
  khachHangKhac = await taoTaiKhoan('CUSTOMER');
  kyThuatVienA = await taoTaiKhoan('TECHNICIAN', { fullName: 'Trần Văn A' });
  kyThuatVienB = await taoTaiKhoan('TECHNICIAN');
});
after(dongKetNoi);

async function taoTinCoDeXuat(token = kyThuatVienA.token) {
  const tin = await taoTin(khachHang.token);
  const res = await voiToken(request(app).post('/api/proposals'), token)
    .send({ requestId: tin.id, price: 300000, description: 'Kiểm tra và sửa', estimatedDuration: '2 giờ' });
  return { tin, deXuat: res.body.data };
}

function chapNhan(id) {
  return voiToken(request(app).patch(`/api/proposals/${id}/accept`), khachHang.token);
}

describe('US15 - Xem chi tiết đề xuất', () => {
  it('chủ tin xem đầy đủ đề xuất kèm thông tin kỹ thuật viên', async () => {
    const { tin, deXuat } = await taoTinCoDeXuat();
    const res = await voiToken(request(app).get(`/api/proposals/${deXuat.id}`), khachHang.token);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.price, 300000);
    assert.equal(res.body.data.technician.fullName, 'Trần Văn A');
    assert.equal(res.body.data.request.id, tin.id);
  });

  it('kỹ thuật viên gửi đề xuất cũng xem được', async () => {
    const { deXuat } = await taoTinCoDeXuat();
    const res = await voiToken(request(app).get(`/api/proposals/${deXuat.id}`), kyThuatVienA.token);
    assert.equal(res.status, 200);
  });

  it('người không phải chủ tin bị từ chối (BR09)', async () => {
    const { deXuat } = await taoTinCoDeXuat();
    for (const taiKhoan of [khachHangKhac, kyThuatVienB]) {
      const res = await voiToken(request(app).get(`/api/proposals/${deXuat.id}`), taiKhoan.token);
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'NOT_OWNER');
    }
  });

  it('đề xuất không tồn tại trả PROPOSAL_NOT_FOUND', async () => {
    const res = await voiToken(request(app).get('/api/proposals/999999'), khachHang.token);
    assert.equal(res.status, 404);
    assert.equal(res.body.code, 'PROPOSAL_NOT_FOUND');
  });
});

describe('Đề xuất của tôi (màn hình 12)', () => {
  it('kỹ thuật viên chỉ thấy đề xuất của mình, kèm tóm tắt tin', async () => {
    await taoTinCoDeXuat(kyThuatVienB.token);
    const res = await voiToken(request(app).get('/api/proposals/my'), kyThuatVienB.token);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 1);
    assert.ok(res.body.data.every((deXuat) => deXuat.technicianId === kyThuatVienB.id));
    assert.ok(res.body.data[0].request.title);
    assert.equal(res.body.meta.page, 1);
  });

  it('khách hàng không gọi được', async () => {
    const res = await voiToken(request(app).get('/api/proposals/my'), khachHang.token);
    assert.equal(res.status, 403);
  });
});

describe('US22 - Sửa đề xuất', () => {
  it('sửa thành công khi đề xuất còn chờ xem xét', async () => {
    const { deXuat } = await taoTinCoDeXuat();
    const res = await voiToken(request(app).patch(`/api/proposals/${deXuat.id}`), kyThuatVienA.token).send({ price: 280000, estimatedDuration: '' });
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Chỉnh sửa đề xuất thành công');
    assert.equal(res.body.data.price, 280000);
    assert.equal(res.body.data.estimatedDuration, null);
    assert.equal(res.body.data.description, 'Kiểm tra và sửa');
  });

  it('dữ liệu không hợp lệ thì không cập nhật', async () => {
    const { deXuat } = await taoTinCoDeXuat();
    const res = await voiToken(request(app).patch(`/api/proposals/${deXuat.id}`), kyThuatVienA.token).send({ price: -1, description: '' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.details.map((loi) => loi.field).sort(), ['description', 'price']);
    const { rows } = await truyVan('SELECT price FROM proposal WHERE id = $1', [deXuat.id]);
    assert.equal(rows[0].price, 300000);
  });

  it('đề xuất đã được chấp nhận thì không sửa được', async () => {
    const { deXuat } = await taoTinCoDeXuat();
    await chapNhan(deXuat.id);
    const res = await voiToken(request(app).patch(`/api/proposals/${deXuat.id}`), kyThuatVienA.token).send({ price: 1 });
    assert.equal(res.status, 409);
    assert.equal(res.body.code, 'PROPOSAL_ALREADY_ACCEPTED');
  });

  it('đề xuất đã rút hoặc bị từ chối thì PROPOSAL_NOT_EDITABLE', async () => {
    const { deXuat } = await taoTinCoDeXuat();
    await voiToken(request(app).patch(`/api/proposals/${deXuat.id}/close`), kyThuatVienA.token);
    const res = await voiToken(request(app).patch(`/api/proposals/${deXuat.id}`), kyThuatVienA.token).send({ price: 1 });
    assert.equal(res.status, 409);
    assert.equal(res.body.code, 'PROPOSAL_NOT_EDITABLE');
  });

  it('tin đã đóng thì không sửa được đề xuất', async () => {
    const { tin, deXuat } = await taoTinCoDeXuat();
    await voiToken(request(app).patch(`/api/requests/${tin.id}/close`), khachHang.token);
    const res = await voiToken(request(app).patch(`/api/proposals/${deXuat.id}`), kyThuatVienA.token).send({ price: 1 });
    assert.equal(res.body.code, 'REQUEST_NOT_WAITING');
  });

  it('kỹ thuật viên khác không sửa được', async () => {
    const { deXuat } = await taoTinCoDeXuat();
    const res = await voiToken(request(app).patch(`/api/proposals/${deXuat.id}`), kyThuatVienB.token).send({ price: 1 });
    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'NOT_OWNER');
  });
});

describe('US23 - Rút đề xuất', () => {
  it('rút thành công; khách hàng thấy trạng thái đã rút và không chấp nhận được', async () => {
    const { tin, deXuat } = await taoTinCoDeXuat();
    const res = await voiToken(request(app).patch(`/api/proposals/${deXuat.id}/close`), kyThuatVienA.token);
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Rút đề xuất thành công');
    assert.equal(res.body.data.status, 'WITHDRAWN');

    const danhSach = await voiToken(request(app).get(`/api/proposals/request/${tin.id}`), khachHang.token);
    assert.equal(danhSach.body.data[0].status, 'WITHDRAWN');
    const chapNhanLai = await chapNhan(deXuat.id);
    assert.equal(chapNhanLai.body.code, 'INVALID_STATUS_TRANSITION');
  });

  it('sau khi rút có thể gửi đề xuất mới cho cùng tin (BR08)', async () => {
    const { tin, deXuat } = await taoTinCoDeXuat();
    await voiToken(request(app).patch(`/api/proposals/${deXuat.id}/close`), kyThuatVienA.token);
    const res = await voiToken(request(app).post('/api/proposals'), kyThuatVienA.token).send({ requestId: tin.id, price: 250000, description: 'Đề xuất mới' });
    assert.equal(res.status, 201);
  });

  it('không rút được đề xuất đã chấp nhận', async () => {
    const { deXuat } = await taoTinCoDeXuat();
    await chapNhan(deXuat.id);
    const res = await voiToken(request(app).patch(`/api/proposals/${deXuat.id}/close`), kyThuatVienA.token);
    assert.equal(res.status, 409);
    assert.equal(res.body.code, 'PROPOSAL_ALREADY_ACCEPTED');
  });

  it('rút lần hai báo trạng thái hiện tại', async () => {
    const { deXuat } = await taoTinCoDeXuat();
    await voiToken(request(app).patch(`/api/proposals/${deXuat.id}/close`), kyThuatVienA.token);
    const res = await voiToken(request(app).patch(`/api/proposals/${deXuat.id}/close`), kyThuatVienA.token);
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'INVALID_STATUS_TRANSITION');
    assert.equal(res.body.message, 'Không thể rút vì đề xuất đã rút');
  });
});
