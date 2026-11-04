// Tiện ích dùng chung cho kiểm thử API: tạo lại CSDL test và tạo nhanh tài khoản.
process.env.NODE_ENV = 'test';

const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { truyVan, dongKetNoi } = require('../src/db');
const { chayMigration } = require('../src/migrate');

async function datLaiCoSoDuLieu() {
  await truyVan('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await chayMigration({ inThongBao: false });
}

let soThuTu = 0;

async function taoTaiKhoan(role = 'CUSTOMER', { isLocked = false, fullName } = {}) {
  soThuTu += 1;
  const email = `${role.toLowerCase()}${soThuTu}@example.com`;
  const password = 'matkhau123';
  const { rows } = await truyVan(
    `INSERT INTO users (email, password_hash, full_name, phone, role, is_locked)
     VALUES ($1, $2, $3, '0901234567', $4, $5) RETURNING id`,
    [email, await bcrypt.hash(password, 4), fullName || `Người dùng ${soThuTu}`, role, isLocked],
  );
  const phanHoi = isLocked ? null : await request(app).post('/api/auth/login').send({ email, password });
  return { id: rows[0].id, email, password, token: phanHoi?.body.data.token };
}

module.exports = { app, request, truyVan, dongKetNoi, datLaiCoSoDuLieu, taoTaiKhoan };
