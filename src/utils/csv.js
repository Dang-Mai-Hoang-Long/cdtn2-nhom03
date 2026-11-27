// CSV UTF-8 có BOM để Excel đọc đúng tiếng Việt. Ô bắt đầu bằng = + - @ (hoặc tab, xuống dòng) được thêm dấu nháy đơn
// ở đầu để phần mềm bảng tính không chạy nội dung do người dùng nhập như công thức (CSV injection).
const BAT_DAU_CONG_THUC = /^[=+\-@\t\r]/;

function thoatO(giaTri) {
  if (giaTri === null || giaTri === undefined) return '';
  if (typeof giaTri === 'number') return String(giaTri);
  let chuoi = String(giaTri);
  if (BAT_DAU_CONG_THUC.test(chuoi)) chuoi = `'${chuoi}`;
  return /[",\r\n]/.test(chuoi) ? `"${chuoi.replace(/"/g, '""')}"` : chuoi;
}

function taoCsv(tieuDeCot, cacDong) {
  const dong = [tieuDeCot, ...cacDong].map((d) => d.map(thoatO).join(','));
  return Buffer.from(`﻿${dong.join('\r\n')}\r\n`, 'utf8');
}

module.exports = { taoCsv };
