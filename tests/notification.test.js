const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, dongKetNoi, datLaiCoSoDuLieu, taoTaiKhoan, voiToken, taoTin } = require('./helpers');

let khachHang;
let kyThuatVien;
let kyThuatVienKhac;

before(async () => {
  await datLaiCoSoDuLieu();
  khachHang = await taoTaiKhoan('CUSTOMER');
  kyThuatVien = await taoTaiKhoan('TECHNICIAN');
  kyThuatVienKhac = await taoTaiKhoan('TECHNICIAN');
});
after(dongKetNoi);

async function duocChapNhan(tieuDe) {
  const tin = await taoTin(khachHang.token, { title: tieuDe });
  const deXuat = (await voiToken(request(app).post('/api/proposals'), kyThuatVien.token).send({ requestId: tin.id, price: 100000, description: 'Sửa' })).body.data;
  await voiToken(request(app).patch(`/api/proposals/${deXuat.id}/accept`), khachHang.token);
  return deXuat;
}

describe('US20 - Thông báo khi đề xuất được chấp nhận', () => {
  it('kỹ thuật viên nhận thông báo có tên tin, mới nhất trước, đếm chưa đọc', async () => {
    const deXuat1 = await duocChapNhan('Sửa máy giặt');
    const deXuat2 = await duocChapNhan('Sửa tủ lạnh');

    const res = await voiToken(request(app).get('/api/notifications'), kyThuatVien.token);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 2);
    assert.equal(res.body.data[0].content, 'Đề xuất của bạn cho tin "Sửa tủ lạnh" đã được chấp nhận');
    assert.equal(res.body.data[0].relatedId, deXuat2.id);
    assert.equal(res.body.data[1].relatedId, deXuat1.id);
    assert.equal(res.body.data[0].type, 'PROPOSAL_ACCEPTED');
    assert.equal(res.body.meta.totalElements, 2);

    const dem = await voiToken(request(app).get('/api/notifications/unread-count'), kyThuatVien.token);
    assert.deepEqual(dem.body.data, { count: 2 });
  });

  it('đánh dấu đã đọc làm giảm số chưa đọc', async () => {
    const { body } = await voiToken(request(app).get('/api/notifications'), kyThuatVien.token);
    const res = await voiToken(request(app).patch(`/api/notifications/${body.data[0].id}/read`), kyThuatVien.token);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.isRead, true);
    const dem = await voiToken(request(app).get('/api/notifications/unread-count'), kyThuatVien.token);
    assert.equal(dem.body.data.count, body.data.length - 1);
  });

  it('không đọc được thông báo của người khác, không tồn tại trả 404', async () => {
    const { body } = await voiToken(request(app).get('/api/notifications'), kyThuatVien.token);
    const nguoiKhac = await voiToken(request(app).patch(`/api/notifications/${body.data[0].id}/read`), kyThuatVienKhac.token);
    assert.equal(nguoiKhac.status, 403);
    assert.equal(nguoiKhac.body.code, 'NOT_OWNER');
    const khongCo = await voiToken(request(app).patch('/api/notifications/999999/read'), kyThuatVien.token);
    assert.equal(khongCo.status, 404);
    assert.equal(khongCo.body.code, 'NOTIFICATION_NOT_FOUND');
  });

  it('người chưa có thông báo nhận danh sách rỗng', async () => {
    const res = await voiToken(request(app).get('/api/notifications'), kyThuatVienKhac.token);
    assert.deepEqual(res.body.data, []);
  });

  it('chưa đăng nhập trả 401', async () => {
    const res = await request(app).get('/api/notifications');
    assert.equal(res.status, 401);
  });
});
