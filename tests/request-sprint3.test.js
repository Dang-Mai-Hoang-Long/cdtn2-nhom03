const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, truyVan, dongKetNoi, datLaiCoSoDuLieu, taoTaiKhoan, voiToken, taoTin } = require('./helpers');

let khachHang;
let khachHangKhac;
let kyThuatVien;

before(async () => {
  await datLaiCoSoDuLieu();
  khachHang = await taoTaiKhoan('CUSTOMER');
  khachHangKhac = await taoTaiKhoan('CUSTOMER');
  kyThuatVien = await taoTaiKhoan('TECHNICIAN');
});
after(dongKetNoi);

function datTrangThai(id, trangThai) {
  return truyVan('UPDATE repair_request SET status = $2 WHERE id = $1', [id, trangThai]);
}

describe('US09 - Đóng tin sửa chữa', () => {
  it('chủ tin đóng tin Chờ đề xuất; kỹ thuật viên không còn thấy và không gửi đề xuất được', async () => {
    const tin = await taoTin(khachHang.token, { title: 'Tin sẽ đóng' });
    const res = await voiToken(request(app).patch(`/api/requests/${tin.id}/close`), khachHang.token);
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Đóng tin thành công');
    assert.equal(res.body.data.status, 'CLOSED');

    const danhSach = await voiToken(request(app).get('/api/requests?size=100'), kyThuatVien.token);
    assert.ok(!danhSach.body.data.some((banGhi) => banGhi.id === tin.id));
    const guiDeXuat = await voiToken(request(app).post('/api/proposals'), kyThuatVien.token).send({ requestId: tin.id, price: 100000, description: 'abc' });
    assert.equal(guiDeXuat.body.code, 'REQUEST_NOT_WAITING');
  });

  it('không đóng được tin đã chọn kỹ thuật viên (BR06)', async () => {
    const tin = await taoTin(khachHang.token);
    await datTrangThai(tin.id, 'SELECTED');
    const res = await voiToken(request(app).patch(`/api/requests/${tin.id}/close`), khachHang.token);
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'REQUEST_ALREADY_SELECTED');
    assert.equal(res.body.message, 'Không thể đóng tin đã chọn kỹ thuật viên');
  });

  it('đóng lần hai trả INVALID_STATUS_TRANSITION', async () => {
    const tin = await taoTin(khachHang.token);
    await voiToken(request(app).patch(`/api/requests/${tin.id}/close`), khachHang.token);
    const res = await voiToken(request(app).patch(`/api/requests/${tin.id}/close`), khachHang.token);
    assert.equal(res.body.code, 'INVALID_STATUS_TRANSITION');
  });

  it('người khác không đóng được tin (BR03)', async () => {
    const tin = await taoTin(khachHang.token);
    const res = await voiToken(request(app).patch(`/api/requests/${tin.id}/close`), khachHangKhac.token);
    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'NOT_OWNER');
  });
});

describe('US21 - Sửa tin sửa chữa', () => {
  it('chủ tin sửa một phần thông tin khi tin còn Chờ đề xuất', async () => {
    const tin = await taoTin(khachHang.token);
    const res = await voiToken(request(app).patch(`/api/requests/${tin.id}`), khachHang.token)
      .send({ title: '  Tiêu đề mới  ', preferredTime: '2026-12-01T03:00:00Z' });
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Chỉnh sửa tin thành công');
    assert.equal(res.body.data.title, 'Tiêu đề mới');
    assert.equal(res.body.data.preferredTime, '2026-12-01T03:00:00.000Z');
    assert.equal(res.body.data.description, tin.description);
  });

  it('dữ liệu không hợp lệ thì báo lỗi và không cập nhật', async () => {
    const tin = await taoTin(khachHang.token);
    const res = await voiToken(request(app).patch(`/api/requests/${tin.id}`), khachHang.token).send({ title: ' ', preferredTime: 'abc' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.details.map((loi) => loi.field).sort(), ['preferredTime', 'title']);
    const { rows } = await truyVan('SELECT title FROM repair_request WHERE id = $1', [tin.id]);
    assert.equal(rows[0].title, tin.title);
  });

  it('không gửi trường nào thì báo lỗi', async () => {
    const tin = await taoTin(khachHang.token);
    const res = await voiToken(request(app).patch(`/api/requests/${tin.id}`), khachHang.token).send({ status: 'COMPLETED' });
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'VALIDATION_ERROR');
  });

  it('tin đã chọn kỹ thuật viên hoặc đã đóng thì không sửa được', async () => {
    for (const trangThai of ['SELECTED', 'COMPLETED', 'CLOSED']) {
      const tin = await taoTin(khachHang.token);
      await datTrangThai(tin.id, trangThai);
      const res = await voiToken(request(app).patch(`/api/requests/${tin.id}`), khachHang.token).send({ title: 'Mới' });
      assert.equal(res.status, 409, trangThai);
      assert.equal(res.body.code, 'REQUEST_NOT_EDITABLE');
    }
  });

  it('người khác và kỹ thuật viên không sửa được', async () => {
    const tin = await taoTin(khachHang.token);
    const nguoiKhac = await voiToken(request(app).patch(`/api/requests/${tin.id}`), khachHangKhac.token).send({ title: 'Mới' });
    assert.equal(nguoiKhac.body.code, 'NOT_OWNER');
    const kyThuat = await voiToken(request(app).patch(`/api/requests/${tin.id}`), kyThuatVien.token).send({ title: 'Mới' });
    assert.equal(kyThuat.status, 403);
  });
});
