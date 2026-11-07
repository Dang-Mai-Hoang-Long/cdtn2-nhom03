import httpClient from './httpClient.js';

export async function layDanhSachThongBao(thamSo = {}) {
  const { data } = await httpClient.get('/notifications', { params: thamSo });
  return { danhSach: data.data, phanTrang: data.meta };
}

export async function demThongBaoChuaDoc() {
  const { data } = await httpClient.get('/notifications/unread-count');
  return data.data.count;
}

export async function danhDauDaDoc(id) {
  const { data } = await httpClient.patch(`/notifications/${id}/read`);
  return data.data;
}
