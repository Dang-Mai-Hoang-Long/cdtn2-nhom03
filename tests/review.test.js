const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, dongKetNoi, datLaiCoSoDuLieu, taoTaiKhoan, voiToken, taoTin } = require('./helpers');

let khachHang;
let khachHangKhac;
let kyThuatVienDuocChon;
let kyThuatVienKhac;

before(async () => {
  await datLaiCoSoDuLieu();
  khachHang = await taoTaiKhoan('CUSTOMER', { fullName: 'Khách Hàng A' });
  khachHangKhac = await taoTaiKhoan('CUSTOMER');
  kyThuatVienDuocChon = await taoTaiKhoan('TECHNICIAN');
  kyThuatVienKhac = await taoTaiKhoan('TECHNICIAN');
});
after(dongKetNoi);

// Tạo tin, kỹ thuật viên gửi đề xuất, khách chấp nhận; hoanThanh=true thì xác nhận hoàn thành.
async function taoCongViec({ hoanThanh = true } = {}) {
  const tin = await taoTin(khachHang.token);
  const deXuat = (await voiToken(request(app).post('/api/proposals'), kyThuatVienDuocChon.token).send({ requestId: tin.id, price: 300000, description: 'Sửa' })).body.data;
  await voiToken(request(app).post('/api/proposals'), kyThuatVienKhac.token).send({ requestId: tin.id, price: 200000, description: 'Sửa' });
  await voiToken(request(app).patch(`/api/proposals/${deXuat.id}/accept`), khachHang.token);
  if (hoanThanh) await voiToken(request(app).patch(`/api/requests/${tin.id}/complete`), khachHang.token);
  return tin;
}

function danhGia(token, duLieu) {
  return voiToken(request(app).post('/api/reviews'), token).send(duLieu);
}

describe('US18 - Khách hàng đánh giá kỹ thuật viên', () => {
  it('đánh giá thành công, người nhận là kỹ thuật viên được chọn, cập nhật điểm trung bình', async () => {
    const tin = await taoCongViec();
    const res = await danhGia(khachHang.token, { requestId: tin.id, rating: 5, comment: 'Rất tốt' });
    assert.equal(res.status, 201);
    assert.equal(res.body.message, 'Đánh giá thành công');
    assert.equal(res.body.data.toUserId, kyThuatVienDuocChon.id);
    assert.equal(res.body.data.fromUserId, khachHang.id);

    const tin2 = await taoCongViec();
    await danhGia(khachHang.token, { requestId: tin2.id, rating: 4 });
    const me = await voiToken(request(app).get('/api/auth/me'), kyThuatVienDuocChon.token);
    assert.equal(me.body.data.ratingAvg, 4.5);

    const chiTiet = await voiToken(request(app).get(`/api/requests/${tin.id}`), khachHang.token);
    assert.equal(chiTiet.body.data.hasReviewed, true);
  });

  it('chưa hoàn thành thì không đánh giá được (BR13)', async () => {
    const tin = await taoCongViec({ hoanThanh: false });
    const res = await danhGia(khachHang.token, { requestId: tin.id, rating: 5 });
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'CANNOT_REVIEW_YET');
    assert.equal(res.body.message, 'Chỉ được đánh giá sau khi công việc hoàn thành');
  });

  it('chỉ được đánh giá một lần (BR14)', async () => {
    const tin = await taoCongViec();
    await danhGia(khachHang.token, { requestId: tin.id, rating: 5 });
    const res = await danhGia(khachHang.token, { requestId: tin.id, rating: 3 });
    assert.equal(res.status, 409);
    assert.equal(res.body.code, 'ALREADY_REVIEWED');
    assert.equal(res.body.message, 'Bạn đã đánh giá rồi');
  });

  it('số sao ngoài 1-5 trả VALIDATION_ERROR', async () => {
    const tin = await taoCongViec();
    const res = await danhGia(khachHang.token, { requestId: tin.id, rating: 6 });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.details.map((loi) => loi.field), ['rating']);
  });
});

describe('US19 - Kỹ thuật viên đánh giá khách hàng', () => {
  it('kỹ thuật viên được chọn đánh giá khách hàng', async () => {
    const tin = await taoCongViec();
    const res = await danhGia(kyThuatVienDuocChon.token, { requestId: tin.id, rating: 4, comment: 'Thân thiện' });
    assert.equal(res.status, 201);
    assert.equal(res.body.data.toUserId, khachHang.id);
  });

  it('kỹ thuật viên không được chọn hoặc người ngoài bị từ chối (BR13)', async () => {
    const tin = await taoCongViec();
    for (const taiKhoan of [kyThuatVienKhac, khachHangKhac]) {
      const res = await danhGia(taiKhoan.token, { requestId: tin.id, rating: 4 });
      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'NOT_OWNER');
    }
  });

  it('chưa hoàn thành thì kỹ thuật viên cũng không đánh giá được', async () => {
    const tin = await taoCongViec({ hoanThanh: false });
    const res = await danhGia(kyThuatVienDuocChon.token, { requestId: tin.id, rating: 4 });
    assert.equal(res.body.code, 'CANNOT_REVIEW_YET');
  });
});

describe('Xem đánh giá của một người dùng', () => {
  it('trả danh sách đánh giá nhận được kèm người đánh giá', async () => {
    const tin = await taoCongViec();
    await danhGia(kyThuatVienDuocChon.token, { requestId: tin.id, rating: 5, comment: 'Tốt' });
    const res = await voiToken(request(app).get(`/api/reviews/user/${khachHang.id}`), kyThuatVienKhac.token);
    assert.equal(res.status, 200);
    assert.ok(res.body.data.length >= 1);
    assert.ok(res.body.data[0].fromUser.fullName);
    assert.equal(res.body.meta.user.fullName, 'Khách Hàng A');
  });

  it('người dùng không tồn tại trả USER_NOT_FOUND', async () => {
    const res = await voiToken(request(app).get('/api/reviews/user/999999'), khachHang.token);
    assert.equal(res.status, 404);
    assert.equal(res.body.code, 'USER_NOT_FOUND');
  });
});
