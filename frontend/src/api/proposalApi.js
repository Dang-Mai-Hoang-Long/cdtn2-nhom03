import httpClient from './httpClient.js';

export async function guiDeXuat(duLieu) {
  const { data } = await httpClient.post('/proposals', duLieu);
  return data.data;
}

export async function layDanhSachDeXuatCuaYeuCau(requestId) {
  const { data } = await httpClient.get(`/proposals/request/${requestId}`);
  return data.data;
}

export async function chapNhanDeXuat(id) {
  const { data } = await httpClient.patch(`/proposals/${id}/accept`);
  return data.data;
}

export async function layChiTietDeXuat(id) {
  const { data } = await httpClient.get(`/proposals/${id}`);
  return data.data;
}

export async function layDanhSachDeXuatCuaToi(thamSo = {}) {
  const { data } = await httpClient.get('/proposals/my', { params: thamSo });
  return { danhSach: data.data, phanTrang: data.meta };
}

export async function suaDeXuat(id, duLieu) {
  const { data } = await httpClient.patch(`/proposals/${id}`, duLieu);
  return data.data;
}

export async function rutDeXuat(id) {
  const { data } = await httpClient.patch(`/proposals/${id}/close`);
  return data.data;
}
