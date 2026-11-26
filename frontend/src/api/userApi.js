import httpClient from './httpClient.js';

// Hồ sơ một người dùng. Mọi người đã đăng nhập xem được phần công khai; email, số điện thoại và trạng thái khóa
// chỉ có khi người xem là quản trị viên hoặc chính chủ.
export async function layHoSoNguoiDung(id) {
  const { data } = await httpClient.get(`/users/${id}`);
  return data.data;
}

// Tự sửa thông tin của mình: duLieu gồm fullName và/hoặc phone. Trả về người dùng sau khi sửa.
export async function capNhatThongTinCaNhan(duLieu) {
  const { data } = await httpClient.patch('/users/me', duLieu);
  return data.data;
}
