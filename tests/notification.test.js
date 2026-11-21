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

describe('US20 - Thông báo cho các sự kiện của tin sửa chữa (đề xuất mới, bị từ chối, hoàn thành, đánh giá)', () => {
  let khach;
  let ktvA;
  let ktvB;
  let ktvC;

  before(async () => {
    khach = await taoTaiKhoan('CUSTOMER', { fullName: 'Khách Thử' });
    ktvA = await taoTaiKhoan('TECHNICIAN', { fullName: 'Thợ A' });
    ktvB = await taoTaiKhoan('TECHNICIAN', { fullName: 'Thợ B' });
    ktvC = await taoTaiKhoan('TECHNICIAN', { fullName: 'Thợ C' });
  });

  const layThongBao = async (nguoi) => (await voiToken(request(app).get('/api/notifications'), nguoi.token)).body.data;
  const theoLoai = (danhSach, type) => danhSach.filter((thongBao) => thongBao.type === type);
  const guiDeXuat = async (nguoi, requestId, price = 100000) => (
    await voiToken(request(app).post('/api/proposals'), nguoi.token).send({ requestId, price, description: 'Sửa' })
  ).body.data;

  it('đề xuất mới: khách hàng chủ tin nhận thông báo kèm tên kỹ thuật viên và giá, kỹ thuật viên gửi thì không', async () => {
    const tin = await taoTin(khach.token, { title: 'Máy lạnh kêu' });
    const deXuat = await guiDeXuat(ktvA, tin.id, 1500000);

    const thongBao = theoLoai(await layThongBao(khach), 'NEW_PROPOSAL');
    assert.equal(thongBao.length, 1);
    assert.equal(thongBao[0].relatedId, deXuat.id);
    assert.equal(thongBao[0].isRead, false);
    assert.equal(thongBao[0].title, 'Có đề xuất mới cho tin của bạn');
    assert.match(thongBao[0].content, /^Thợ A đã gửi đề xuất 1\.500\.000 đồng cho tin "Máy lạnh kêu"$/);
    assert.deepEqual(await layThongBao(ktvA), []);
  });

  it('đề xuất bị từ chối vì lỗi (gửi trùng) không tạo thông báo', async () => {
    const tin = await taoTin(khach.token, { title: 'Máy giặt rung' });
    await guiDeXuat(ktvA, tin.id);
    const truoc = (await layThongBao(khach)).length;
    const lanHai = await voiToken(request(app).post('/api/proposals'), ktvA.token).send({ requestId: tin.id, price: 50000, description: 'Gửi lại' });
    assert.equal(lanHai.status, 409);
    assert.equal((await layThongBao(khach)).length, truoc);
  });

  describe('một tin đi hết vòng đời: chọn, hoàn thành, đánh giá', () => {
    let tin;
    let deXuatA;
    let deXuatB;
    let deXuatC;

    before(async () => {
      tin = await taoTin(khach.token, { title: 'Tủ lạnh không đông' });
      deXuatA = await guiDeXuat(ktvA, tin.id);
      deXuatB = await guiDeXuat(ktvB, tin.id);
      deXuatC = await guiDeXuat(ktvC, tin.id);
      await voiToken(request(app).patch(`/api/proposals/${deXuatC.id}/close`), ktvC.token);
      await voiToken(request(app).patch(`/api/proposals/${deXuatA.id}/accept`), khach.token);
    });

    it('chọn đề xuất: người được chọn nhận ACCEPTED, người còn chờ nhận REJECTED, người đã rút không nhận gì (BR10, BR16)', async () => {
      const cuaA = (await layThongBao(ktvA)).filter((thongBao) => thongBao.relatedId === deXuatA.id);
      assert.deepEqual(cuaA.map((thongBao) => thongBao.type), ['PROPOSAL_ACCEPTED']);

      const cuaB = (await layThongBao(ktvB)).filter((thongBao) => thongBao.relatedId === deXuatB.id);
      assert.equal(cuaB.length, 1);
      assert.equal(cuaB[0].type, 'PROPOSAL_REJECTED');
      assert.equal(cuaB[0].title, 'Đề xuất của bạn không được chọn');
      assert.equal(cuaB[0].content, 'Khách hàng đã chọn kỹ thuật viên khác cho tin "Tủ lạnh không đông"');
      assert.equal(cuaB[0].isRead, false);

      assert.deepEqual(await layThongBao(ktvC), []);
      const loaiCuaKhach = (await layThongBao(khach)).map((thongBao) => thongBao.type);
      assert.ok(!loaiCuaKhach.includes('PROPOSAL_ACCEPTED') && !loaiCuaKhach.includes('PROPOSAL_REJECTED'));
    });

    it('rút đề xuất, đóng tin và sửa đề xuất không tạo thông báo (ngoài phạm vi US20)', async () => {
      const tinKhac = await taoTin(khach.token, { title: 'Quạt trần kêu' });
      const deXuat = await guiDeXuat(ktvB, tinKhac.id);
      const truocKhach = (await layThongBao(khach)).length;
      const truocKtv = (await layThongBao(ktvB)).length;
      await voiToken(request(app).patch(`/api/proposals/${deXuat.id}`), ktvB.token).send({ price: 90000 });
      await voiToken(request(app).patch(`/api/proposals/${deXuat.id}/close`), ktvB.token);
      await voiToken(request(app).patch(`/api/requests/${tinKhac.id}/close`), khach.token);
      assert.equal((await layThongBao(khach)).length, truocKhach);
      assert.equal((await layThongBao(ktvB)).length, truocKtv);
    });

    it('xác nhận hoàn thành: kỹ thuật viên được chọn nhận thông báo (relatedId là mã tin), người khác thì không', async () => {
      await voiToken(request(app).patch(`/api/requests/${tin.id}/complete`), khach.token);

      const cuaA = theoLoai(await layThongBao(ktvA), 'REQUEST_COMPLETED');
      assert.equal(cuaA.length, 1);
      assert.equal(cuaA[0].relatedId, tin.id);
      assert.equal(cuaA[0].title, 'Khách hàng đã xác nhận hoàn thành công việc');
      assert.equal(cuaA[0].content, 'Công việc "Tủ lạnh không đông" đã được khách hàng xác nhận hoàn thành');
      assert.equal(theoLoai(await layThongBao(ktvB), 'REQUEST_COMPLETED').length, 0);
      assert.equal(theoLoai(await layThongBao(khach), 'REQUEST_COMPLETED').length, 0);
    });

    it('đánh giá: bên được đánh giá nhận thông báo kèm tên người đánh giá và số sao; đánh giá bị từ chối không tạo thông báo', async () => {
      const khachDanhGia = await voiToken(request(app).post('/api/reviews'), khach.token).send({ requestId: tin.id, rating: 5, comment: 'Tốt' });
      assert.equal(khachDanhGia.status, 201);
      const cuaA = theoLoai(await layThongBao(ktvA), 'REVIEW_RECEIVED');
      assert.equal(cuaA.length, 1);
      assert.equal(cuaA[0].relatedId, tin.id);
      assert.equal(cuaA[0].title, 'Bạn nhận được một đánh giá mới');
      assert.equal(cuaA[0].content, 'Khách Thử đã đánh giá 5 sao cho công việc "Tủ lạnh không đông"');

      const ktvDanhGia = await voiToken(request(app).post('/api/reviews'), ktvA.token).send({ requestId: tin.id, rating: 4 });
      assert.equal(ktvDanhGia.status, 201);
      const cuaKhach = theoLoai(await layThongBao(khach), 'REVIEW_RECEIVED');
      assert.equal(cuaKhach.length, 1);
      assert.equal(cuaKhach[0].content, 'Thợ A đã đánh giá 4 sao cho công việc "Tủ lạnh không đông"');

      const trung = await voiToken(request(app).post('/api/reviews'), ktvA.token).send({ requestId: tin.id, rating: 1 });
      assert.equal(trung.status, 409);
      assert.equal(theoLoai(await layThongBao(khach), 'REVIEW_RECEIVED').length, 1);
      assert.equal(theoLoai(await layThongBao(ktvB), 'REVIEW_RECEIVED').length, 0);
    });

    it('thông báo mới ở trạng thái chưa đọc; bấm đọc thì isRead đổi và số chưa đọc giảm', async () => {
      const truoc = (await voiToken(request(app).get('/api/notifications/unread-count'), khach.token)).body.data.count;
      const chuaDoc = (await layThongBao(khach)).filter((thongBao) => !thongBao.isRead);
      assert.equal(chuaDoc.length, truoc);
      const res = await voiToken(request(app).patch(`/api/notifications/${chuaDoc[0].id}/read`), khach.token);
      assert.equal(res.body.data.isRead, true);
      const sau = (await voiToken(request(app).get('/api/notifications/unread-count'), khach.token)).body.data.count;
      assert.equal(sau, truoc - 1);
    });
  });
});
