import httpClient from './httpClient.js';

const GOC = '/admin/analytics';

// Tham số khoảng thời gian dùng chung: range, from, to (from/to chỉ gửi khi chọn khoảng tùy chỉnh).
export function thamSoThoiGian({ range, from, to }) {
  return range === 'custom' ? { range, from, to } : { range };
}

const lay = (duongDan) => async (thamSo) => {
  const { data } = await httpClient.get(`${GOC}${duongDan}`, { params: thamSo });
  return data.data;
};

export const layTongQuan = lay('/overview');
export const layTangTruong = lay('/growth');
export const layPhanTichNguoiDung = lay('/users');
export const layPhanTichHoatDong = lay('/activity');
export const layTinhTrangHeThong = lay('/system');
export const layCanhBao = lay('/alerts');

export async function datTrangThaiCanhBao(khoa, status) {
  const { data } = await httpClient.patch(`${GOC}/alerts/${encodeURIComponent(khoa)}`, { status });
  return data.data;
}

export async function layBaoCao(loai, thamSo) {
  const { data } = await httpClient.get(`${GOC}/reports/${loai}`, { params: thamSo });
  return { ...data.data, phanTrang: data.meta };
}

// Tải file xuất qua axios (cần gửi token) rồi lưu bằng liên kết tạm.
export async function taiFileBaoCao(loai, thamSo) {
  const phanHoi = await httpClient.get(`${GOC}/reports/${loai}/export`, { params: thamSo, responseType: 'blob' });
  const tenFile = /filename="([^"]+)"/.exec(phanHoi.headers['content-disposition'] ?? '')?.[1] ?? `bao-cao-${loai}.${thamSo.format}`;
  const duongDan = URL.createObjectURL(phanHoi.data);
  const lienKet = document.createElement('a');
  lienKet.href = duongDan;
  lienKet.download = tenFile;
  document.body.append(lienKet);
  lienKet.click();
  lienKet.remove();
  setTimeout(() => URL.revokeObjectURL(duongDan), 1000);
  return { tenFile, soDong: Number(phanHoi.headers['x-so-dong'] ?? 0), biCat: phanHoi.headers['x-bi-cat'] === '1' };
}

// Kiểm tra backend còn sống (không cần đăng nhập, không chạm CSDL) để phân biệt mất kết nối với lỗi CSDL.
export async function kiemTraMayChu() {
  try {
    await httpClient.get('/health', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}
