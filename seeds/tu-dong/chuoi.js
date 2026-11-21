// Hàm xử lý chuỗi dùng khi ghép văn bản cho dữ liệu tự động.

// Viết hoa chữ cái đầu (hoạt động đúng với chữ tiếng Việt có dấu).
const vietHoa = (chuoi) => chuoi.charAt(0).toUpperCase() + chuoi.slice(1);

module.exports = { vietHoa };
