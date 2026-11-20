// BUG-03: mã định danh vượt phạm vi cột INT (2147483647) phải trả 404 như mã không tồn tại, không phải lỗi 500.
// Kiểm tra mọi endpoint nhận mã (trên đường dẫn hoặc trong thân yêu cầu), không chỉ các endpoint đã nêu trong bug-log.
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, dongKetNoi, datLaiCoSoDuLieu, taoTaiKhoan, voiToken } = require('./helpers');

const ID_LON_NHAT_INT4 = 2147483647;
const ID_VUOT_INT4 = 2147483648;

const taiKhoan = {};

before(async () => {
  await datLaiCoSoDuLieu();
  taiKhoan.khach = await taoTaiKhoan('CUSTOMER');
  taiKhoan.ktv = await taoTaiKhoan('TECHNICIAN');
  taiKhoan.admin = await taoTaiKhoan('ADMIN');
});
after(dongKetNoi);

// [phương thức, đường dẫn, vai trò gọi, thân yêu cầu, mã lỗi nghiệp vụ mong đợi]
function cacEndpointNhanMa(id) {
  return [
    ['get', `/api/requests/${id}`, 'khach', undefined, 'REQUEST_NOT_FOUND'],
    ['patch', `/api/requests/${id}`, 'khach', { title: 'Tiêu đề mới' }, 'REQUEST_NOT_FOUND'],
    ['patch', `/api/requests/${id}/close`, 'khach', undefined, 'REQUEST_NOT_FOUND'],
    ['patch', `/api/requests/${id}/complete`, 'khach', undefined, 'REQUEST_NOT_FOUND'],
    ['get', `/api/proposals/${id}`, 'khach', undefined, 'PROPOSAL_NOT_FOUND'],
    ['patch', `/api/proposals/${id}`, 'ktv', { price: 1000 }, 'PROPOSAL_NOT_FOUND'],
    ['patch', `/api/proposals/${id}/close`, 'ktv', undefined, 'PROPOSAL_NOT_FOUND'],
    ['patch', `/api/proposals/${id}/accept`, 'khach', undefined, 'PROPOSAL_NOT_FOUND'],
    ['get', `/api/proposals/request/${id}`, 'khach', undefined, 'REQUEST_NOT_FOUND'],
    ['post', '/api/proposals', 'ktv', { requestId: id, price: 1000, description: 'x' }, 'REQUEST_NOT_FOUND'],
    ['post', '/api/reviews', 'khach', { requestId: id, rating: 5 }, 'REQUEST_NOT_FOUND'],
    ['get', `/api/reviews/user/${id}`, 'khach', undefined, 'USER_NOT_FOUND'],
    ['patch', `/api/admin/users/${id}/lock`, 'admin', undefined, 'USER_NOT_FOUND'],
    ['patch', `/api/admin/users/${id}/unlock`, 'admin', undefined, 'USER_NOT_FOUND'],
    ['patch', `/api/notifications/${id}/read`, 'ktv', undefined, 'NOTIFICATION_NOT_FOUND'],
  ];
}

async function goi([phuongThuc, duongDan, vaiTro, thanYeuCau]) {
  const yeuCau = voiToken(request(app)[phuongThuc](duongDan), taiKhoan[vaiTro].token);
  return thanYeuCau === undefined ? yeuCau : yeuCau.send(thanYeuCau);
}

describe('BUG-03 - Mã định danh vượt phạm vi int4', () => {
  it('mã 2147483648 trả 404 ở mọi endpoint nhận mã, không còn 500', async () => {
    for (const endpoint of cacEndpointNhanMa(ID_VUOT_INT4)) {
      const res = await goi(endpoint);
      assert.equal(res.status, 404, `${endpoint[0].toUpperCase()} ${endpoint[1]}`);
      assert.equal(res.body.code, endpoint[4], `${endpoint[0].toUpperCase()} ${endpoint[1]}`);
    }
  });

  it('mã lớn nhất của int4 (2147483647) vẫn trả 404 như trước (ranh giới)', async () => {
    for (const endpoint of cacEndpointNhanMa(ID_LON_NHAT_INT4)) {
      const res = await goi(endpoint);
      assert.equal(res.status, 404, `${endpoint[0].toUpperCase()} ${endpoint[1]}`);
      assert.equal(res.body.code, endpoint[4], `${endpoint[0].toUpperCase()} ${endpoint[1]}`);
    }
  });
});
