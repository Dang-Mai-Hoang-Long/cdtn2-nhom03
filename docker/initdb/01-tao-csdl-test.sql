-- Chạy tự động một lần khi volume CSDL còn trống (cơ chế docker-entrypoint-initdb.d của image postgres).
-- suachua_dev được tạo bởi POSTGRES_DB; thêm suachua_test cho npm test (bị xóa và dựng lại mỗi lần chạy test).
CREATE DATABASE suachua_test OWNER nhom03;
