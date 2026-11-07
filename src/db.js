const { Pool, types } = require('pg');
const cauHinh = require('./config/env');

// Trả kiểu NUMERIC (giá, điểm đánh giá) về số JavaScript thay vì chuỗi.
types.setTypeParser(types.builtins.NUMERIC, (giaTri) => (giaTri === null ? null : Number(giaTri)));

const pool = new Pool({ connectionString: cauHinh.databaseUrl });

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
