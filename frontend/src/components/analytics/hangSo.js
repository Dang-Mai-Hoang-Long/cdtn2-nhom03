// Màu chuỗi dữ liệu (đã kiểm bằng bộ kiểm tra màu: phân biệt được với người mù màu, tương phản ≥ 3:1 trên nền thẻ).
// Màu gắn cố định với đối tượng, không đổi khi lọc. Màu cảnh báo tách riêng trong analytics.css.
export const MAU = Object.freeze({
  chinh: '#1f7a55',
  hai: '#b77912',
  ba: '#2f6db5',
  bon: '#b4532f',
  kyTruoc: '#7d7f76',
});

export const TEN_MUC_DO = { critical: 'Nghiêm trọng', warning: 'Cảnh báo', info: 'Thông tin' };
export const TEN_TRANG_THAI_CANH_BAO = { NEW: 'Chưa xử lý', ACKNOWLEDGED: 'Đã tiếp nhận', RESOLVED: 'Đã xử lý' };
export const TEN_NHOM_CANH_BAO = {
  system: 'Hệ thống', performance: 'Hiệu năng', security: 'Bảo mật', activity: 'Bất thường', error: 'Lỗi', growth: 'Tăng trưởng', operations: 'Vận hành',
};

export function duongDanThongKe(tab, them = {}) {
  const thamSo = new URLSearchParams({ tab, ...them });
  return `#/admin/analytics?${thamSo}`;
}
