import httpClient from './httpClient.js';

// thamSo: q, role (CUSTOMER | TECHNICIAN), status (ACTIVE | LOCKED), page, size.
export async function layDanhSachTaiKhoan(thamSo = {}) {
  const { data } = await httpClient.get('/admin/users', { params: thamSo });
  return { danhSach: data.data, phanTrang: data.meta };
}

export async function khoaTaiKhoan(id) {
  const { data } = await httpClient.patch(`/admin/users/${id}/lock`);
  return data.data;
}

export async function moKhoaTaiKhoan(id) {
  const { data } = await httpClient.patch(`/admin/users/${id}/unlock`);
  return data.data;
}
