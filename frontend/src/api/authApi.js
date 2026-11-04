import httpClient from './httpClient.js';

export async function dangKy(duLieu) {
  const { data } = await httpClient.post('/auth/register', duLieu);
  return data.data;
}

export async function dangNhap(email, password) {
  const { data } = await httpClient.post('/auth/login', { email, password });
  return data.data;
}

export async function dangXuat() {
  await httpClient.post('/auth/logout');
}

export async function layThongTinCaNhan() {
  const { data } = await httpClient.get('/auth/me');
  return data.data;
}
