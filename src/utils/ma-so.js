const { LoiUngDung } = require('./error-handler');
const { ID_TOI_DA } = require('./constants');

// Đọc mã số từ đường dẫn hoặc thân yêu cầu. Mã không hợp lệ hoặc vượt phạm vi cột INT (ID_TOI_DA) thì không thể tồn tại
// trong CSDL nên coi như không tìm thấy (404), thay vì đưa vào truy vấn làm PostgreSQL báo lỗi 22003.
function docMaSo(giaTri, maLoi, thongDiep) {
  const so = Number(giaTri);
  if (!Number.isInteger(so) || so <= 0 || so > ID_TOI_DA) throw new LoiUngDung(404, maLoi, thongDiep);
  return so;
}

module.exports = { docMaSo };
