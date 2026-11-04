import axios from 'axios';
import { layPhienDangNhap, xoaPhienDangNhap } from './phienDangNhap.js';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((cauHinh) => {
  const phien = layPhienDangNhap();
  if (phien) cauHinh.headers.Authorization = `Bearer ${phien.token}`;
  return cauHinh;
});

// Token hết hạn / không hợp lệ hoặc tài khoản bị khóa: xóa phiên và quay về trang đăng nhập.
httpClient.interceptors.response.use(
  (phanHoi) => phanHoi,
  (loi) => {
    const maLoi = loi.response?.data?.code;
    const laYeuCauDangNhap = loi.config?.url?.startsWith('/auth/login');
    if (!laYeuCauDangNhap && (loi.response?.status === 401 || maLoi === 'ACCOUNT_LOCKED') && layPhienDangNhap()) {
      xoaPhienDangNhap();
      window.location.hash = '#/login';
    }
    return Promise.reject(loi);
  },
);

export function layThongDiepLoi(loi) {
  if (loi.response?.data?.message) return loi.response.data.message;
  if (loi.request) return 'Không kết nối được máy chủ, vui lòng thử lại.';
  return 'Đã có lỗi xảy ra, vui lòng thử lại.';
}

export function layMaLoi(loi) {
  return loi.response?.data?.code ?? null;
}

// Chuyển details của VALIDATION_ERROR thành { tenTruong: thongDiep } để hiện dưới từng ô nhập.
export function layLoiTheoTruong(loi) {
  return Object.fromEntries((loi.response?.data?.details ?? []).map(({ field, message }) => [field, message]));
}

export default httpClient;
