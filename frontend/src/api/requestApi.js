import httpClient from './httpClient.js';

export async function taoYeuCau(duLieu) {
  const { data } = await httpClient.post('/requests', duLieu);
  return data.data;
}

export async function layDanhSachYeuCauCuaToi(thamSo = {}) {
  const { data } = await httpClient.get('/requests/my', { params: thamSo });
  return { danhSach: data.data, phanTrang: data.meta };
}

export async function layDanhSachYeuCauDangCho(thamSo = {}) {
  const { data } = await httpClient.get('/requests', { params: thamSo });
  return { danhSach: data.data, phanTrang: data.meta };
}

export async function layChiTietYeuCau(id) {
  const { data } = await httpClient.get(`/requests/${id}`);
  return data.data;
}

export async function xacNhanHoanThanh(id) {
  const { data } = await httpClient.patch(`/requests/${id}/complete`);
  return data.data;
}
