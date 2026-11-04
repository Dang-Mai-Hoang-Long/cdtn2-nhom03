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
