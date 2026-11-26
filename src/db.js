const { Pool, types } = require('pg');
const cauHinh = require('./config/env');

// Trả kiểu NUMERIC (giá, điểm đánh giá) về số JavaScript thay vì chuỗi.
types.setTypeParser(types.builtins.NUMERIC, (giaTri) => (giaTri === null ? null : Number(giaTri)));

const pool = new Pool({ connectionString: cauHinh.databaseUrl });

// Kết nối rảnh trong pool bị cắt (khởi động lại hoặc dừng PostgreSQL, mạng đứt) phát ra sự kiện 'error'.
// Không có trình lắng nghe thì Node thoát cả tiến trình; ghi log (chỉ thông điệp, không ghi chuỗi kết nối) rồi để pool tự tạo kết nối mới ở lần truy vấn sau.
pool.on('error', (loi) => {
  console.error('Kết nối CSDL bị gián đoạn:', loi.message);
});

function truyVan(cauLenh, thamSo) {
  return pool.query(cauLenh, thamSo);
}

// Chạy một nhóm thao tác trong cùng transaction; hàm xuLy nhận client riêng.
async function chayTrongGiaoDich(xuLy) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ketQua = await xuLy(client);
    await client.query('COMMIT');
    return ketQua;
  } catch (loi) {
    await client.query('ROLLBACK');
    throw loi;
  } finally {
    client.release();
  }
}

function dongKetNoi() {
  return pool.end();
}

module.exports = { pool, truyVan, chayTrongGiaoDich, dongKetNoi };
