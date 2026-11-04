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
  kyThuatVienB = await taoTaiKhoan('TECHNICIAN', { fullName: 'Lê Văn B' });
});
after(dongKetNoi);

function guiDeXuat(token, duLieu) {
  return voiToken(request(app).post('/api/proposals'), token).send({ price: 350000, description: 'Có thể đến trong ngày mai', estimatedDuration: '2-3 giờ', ...duLieu });
}

describe('US13 - Gửi đề xuất', () => {
  it('gửi thành công, trạng thái PENDING', async () => {
    const tin = await taoTin(khachHang.token);
    const res = await guiDeXuat(kyThuatVienA.token, { requestId: tin.id });
    assert.equal(res.status, 201);
    assert.equal(res.body.message, 'Gửi đề xuất thành công');
    assert.equal(res.body.data.status, 'PENDING');
    assert.equal(res.body.data.price, 350000);
    assert.equal(res.body.data.technicianId, kyThuatVienA.id);
  });

  it('gửi lần hai cho cùng tin trả 409 ALREADY_PROPOSED (BR08)', async () => {
    const tin = await taoTin(khachHang.token);
    await guiDeXuat(kyThuatVienA.token, { requestId: tin.id });
    const res = await guiDeXuat(kyThuatVienA.token, { requestId: tin.id });
    assert.equal(res.status, 409);
    assert.equal(res.body.code, 'ALREADY_PROPOSED');
    assert.equal(res.body.message, 'Bạn đã gửi đề xuất cho tin này');
  });

  it('gửi song song hai lần thì chỉ một lần thành công (BR08)', async () => {
    const tin = await taoTin(khachHang.token);
    const ketQua = await Promise.all([guiDeXuat(kyThuatVienA.token, { requestId: tin.id }), guiDeXuat(kyThuatVienA.token, { requestId: tin.id })]);
    assert.deepEqual(ketQua.map((res) => res.status).sort(), [201, 409]);
  });

  it('tin không còn Chờ đề xuất trả REQUEST_NOT_WAITING (BR07)', async () => {
    const tin = await taoTin(khachHang.token);
    await truyVan(`UPDATE repair_request SET status = 'CLOSED' WHERE id = $1`, [tin.id]);
    const res = await guiDeXuat(kyThuatVienA.token, { requestId: tin.id });
    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'REQUEST_NOT_WAITING');
  });

  it('dữ liệu sai trả VALIDATION_ERROR', async () => {
    const tin = await taoTin(khachHang.token);
    const res = await guiDeXuat(kyThuatVienA.token, { requestId: tin.id, price: 0, description: ' ' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.details.map((loi) => loi.field).sort(), ['description', 'price']);
  });

  it('tin không tồn tại trả REQUEST_NOT_FOUND', async () => {
    const res = await guiDeXuat(kyThuatVienA.token, { requestId: 999999 });
    assert.equal(res.status, 404);
    assert.equal(res.body.code, 'REQUEST_NOT_FOUND');
  });

  it('khách hàng không gửi được đề xuất (BR01)', async () => {
    const tin = await taoTin(khachHang.token);
    const res = await guiDeXuat(khachHang.token, { requestId: tin.id });
    assert.equal(res.status, 403);
  });
});

describe('US14 - Xem đề xuất đã nhận', () => {
  it('chủ tin thấy danh sách đề xuất kèm tên kỹ thuật viên', async () => {
    const tin = await taoTin(khachHang.token);
    await guiDeXuat(kyThuatVienA.token, { requestId: tin.id, price: 300000 });
    await guiDeXuat(kyThuatVienB.token, { requestId: tin.id, price: 400000 });
    const res = await voiToken(request(app).get(`/api/proposals/request/${tin.id}`), khachHang.token);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.data.map((dx) => dx.technician.fullName), ['Trần Văn A', 'Lê Văn B']);
    assert.deepEqual(res.body.data.map((dx) => dx.price), [300000, 400000]);
    assert.ok(res.body.data[0].createdAt);
  });

  it('tin chưa có đề xuất trả danh sách rỗng', async () => {
    const tin = await taoTin(khachHang.token);
    const res = await voiToken(request(app).get(`/api/proposals/request/${tin.id}`), khachHang.token);
    assert.deepEqual(res.body.data, []);
  });

  it('người không phải chủ tin bị từ chối (BR09)', async () => {
    const tin = await taoTin(khachHang.token);
    const res = await voiToken(request(app).get(`/api/proposals/request/${tin.id}`), khachHangKhac.token);
    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'NOT_OWNER');
    const kyThuatVienXem = await voiToken(request(app).get(`/api/proposals/request/${tin.id}`), kyThuatVienA.token);
    assert.equal(kyThuatVienXem.status, 403);
  });
});

describe('US16 - Chọn kỹ thuật viên', () => {
  async function chuanBiTinCoHaiDeXuat() {
    const tin = await taoTin(khachHang.token);
    const deXuatA = (await guiDeXuat(kyThuatVienA.token, { requestId: tin.id })).body.data;
    const deXuatB = (await guiDeXuat(kyThuatVienB.token, { requestId: tin.id })).body.data;
    return { tin, deXuatA, deXuatB };
  }

  it('chấp nhận: đề xuất ACCEPTED, đề xuất khác REJECTED, tin SELECTED, tạo thông báo (BR10, BR12, BR16)', async () => {
    const { tin, deXuatA, deXuatB } = await chuanBiTinCoHaiDeXuat();
    const res = await voiToken(request(app).patch(`/api/proposals/${deXuatA.id}/accept`), khachHang.token);
    assert.equal(res.status, 200);
    assert.equal(res.body.message, 'Chấp nhận đề xuất thành công');
    assert.equal(res.body.data.status, 'ACCEPTED');

    const { rows: [dongB] } = await truyVan('SELECT status FROM proposal WHERE id = $1', [deXuatB.id]);
    assert.equal(dongB.status, 'REJECTED');
    const { rows: [dongTin] } = await truyVan('SELECT status, selected_proposal_id FROM repair_request WHERE id = $1', [tin.id]);
    assert.deepEqual(dongTin, { status: 'SELECTED', selected_proposal_id: deXuatA.id });
    const { rows: thongBao } = await truyVan('SELECT * FROM notification WHERE user_id = $1 AND related_id = $2', [kyThuatVienA.id, deXuatA.id]);
    assert.equal(thongBao.length, 1);
    assert.equal(thongBao[0].type, 'PROPOSAL_ACCEPTED');
    assert.equal(thongBao[0].is_read, false);
  });

  it('kỹ thuật viên được chọn thấy số điện thoại khách, người khác thì không (BR15)', async () => {
    const { tin, deXuatA } = await chuanBiTinCoHaiDeXuat();
    await voiToken(request(app).patch(`/api/proposals/${deXuatA.id}/accept`), khachHang.token);
    const duocChon = await voiToken(request(app).get(`/api/requests/${tin.id}`), kyThuatVienA.token);
    const khongDuocChon = await voiToken(request(app).get(`/api/requests/${tin.id}`), kyThuatVienB.token);
    assert.equal(duocChon.body.data.customer.phone, '0901234567');
    assert.equal(khongDuocChon.body.data.customer.phone, undefined);
    assert.equal(duocChon.body.data.myProposalStatus, 'ACCEPTED');
    assert.equal(khongDuocChon.body.data.myProposalStatus, 'REJECTED');
    assert.equal(khongDuocChon.body.data.hasProposed, false);
  });

  it('đã chọn rồi thì không chọn đề xuất khác được (BR10)', async () => {
    const { deXuatA, deXuatB } = await chuanBiTinCoHaiDeXuat();
    await voiToken(request(app).patch(`/api/proposals/${deXuatA.id}/accept`), khachHang.token);
    const res = await voiToken(request(app).patch(`/api/proposals/${deXuatB.id}/accept`), khachHang.token);
    assert.equal(res.status, 409);
    assert.equal(res.body.code, 'PROPOSAL_ALREADY_ACCEPTED');
    assert.equal(res.body.message, 'Tin đã chọn kỹ thuật viên');
  });

  it('chấp nhận song song hai đề xuất thì chỉ một thành công', async () => {
    const { tin, deXuatA, deXuatB } = await chuanBiTinCoHaiDeXuat();
    const ketQua = await Promise.all([
      voiToken(request(app).patch(`/api/proposals/${deXuatA.id}/accept`), khachHang.token),
      voiToken(request(app).patch(`/api/proposals/${deXuatB.id}/accept`), khachHang.token),
    ]);
    assert.deepEqual(ketQua.map((res) => res.status).sort(), [200, 409]);
    const { rows } = await truyVan(`SELECT count(*)::int AS so FROM proposal WHERE request_id = $1 AND status = 'ACCEPTED'`, [tin.id]);
    assert.equal(rows[0].so, 1);
  });

  it('không phải chủ tin thì không chấp nhận được (BR09)', async () => {
    const { deXuatA } = await chuanBiTinCoHaiDeXuat();
    const res = await voiToken(request(app).patch(`/api/proposals/${deXuatA.id}/accept`), khachHangKhac.token);
    assert.equal(res.status, 403);
    assert.equal(res.body.code, 'NOT_OWNER');
  });

  it('đề xuất không tồn tại trả PROPOSAL_NOT_FOUND', async () => {
    const res = await voiToken(request(app).patch('/api/proposals/999999/accept'), khachHang.token);
    assert.equal(res.status, 404);
    assert.equal(res.body.code, 'PROPOSAL_NOT_FOUND');
  });

  it('luồng đầy đủ: đăng tin -> đề xuất -> chọn -> hoàn thành', async () => {
    const { tin, deXuatA } = await chuanBiTinCoHaiDeXuat();
    await voiToken(request(app).patch(`/api/proposals/${deXuatA.id}/accept`), khachHang.token);
    const res = await voiToken(request(app).patch(`/api/requests/${tin.id}/complete`), khachHang.token);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.status, 'COMPLETED');
    assert.equal(res.body.data.selectedProposalId, deXuatA.id);
  });
});
