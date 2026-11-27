// Phân loại thiết bị và hệ điều hành từ User-Agent. Chỉ lưu nhóm đã phân loại, không lưu chuỗi gốc.
function phanLoaiThietBi(userAgent) {
  const ua = String(userAgent || '');
  if (!ua) return { device: null, os: null };

  let os = 'Khác';
  if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(ua)) os = 'macOS';
  else if (/Linux|X11|CrOS/i.test(ua)) os = 'Linux';

  let device = 'Khác';
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) device = 'Máy tính bảng';
  else if (/Mobi|iPhone|iPod|Android/i.test(ua)) device = 'Điện thoại';
  else if (/Windows|Macintosh|X11|Linux|CrOS/i.test(ua)) device = 'Máy tính';

  return { device, os };
}

module.exports = { phanLoaiThietBi };
