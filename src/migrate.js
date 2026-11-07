// Chạy các file SQL trong thư mục migrations/ theo thứ tự tên, mỗi file đúng một lần.
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

const thuMucMigration = path.join(__dirname, '..', 'migrations');

async function chayMigration({ inThongBao = true } = {}) {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    const { rows } = await client.query('SELECT name FROM schema_migrations');
    const daChay = new Set(rows.map((dong) => dong.name));
    const cacFile = fs.readdirSync(thuMucMigration).filter((ten) => ten.endsWith('.sql')).sort();

    for (const tenFile of cacFile) {
      if (daChay.has(tenFile)) continue;
      const cauLenh = fs.readFileSync(path.join(thuMucMigration, tenFile), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(cauLenh);
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [tenFile]);
        await client.query('COMMIT');
        if (inThongBao) console.log(`Đã chạy migration ${tenFile}`);
      } catch (loi) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${tenFile} thất bại: ${loi.message}`);
      }
    }
  } finally {
    client.release();
  }
}

module.exports = { chayMigration };

if (require.main === module) {
  chayMigration()
    .then(() => pool.end())
    .catch((loi) => {
      console.error(loi.message);
      process.exit(1);
    });
}
