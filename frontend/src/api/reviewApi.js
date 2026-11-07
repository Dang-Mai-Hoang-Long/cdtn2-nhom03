import httpClient from './httpClient.js';

export async function taoDanhGia(duLieu) {
  const { data } = await httpClient.post('/reviews', duLieu);
  return data.data;
}

export async function layDanhGiaCuaNguoiDung(userId, thamSo = {}) {
  const { data } = await httpClient.get(`/reviews/user/${userId}`, { params: thamSo });
  return { danhSach: data.data, phanTrang: data.meta };
}
