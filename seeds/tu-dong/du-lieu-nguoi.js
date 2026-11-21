// Kho dữ liệu để ghép tên người, số điện thoại và địa điểm cho dữ liệu tự động.
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Trương', 'Đinh', 'Mai', 'Tạ'];
const DEM_NAM = ['Văn', 'Hữu', 'Minh', 'Quốc', 'Đức', 'Thanh', 'Gia', 'Anh', 'Công', 'Tuấn', 'Hoàng', 'Xuân'];
const DEM_NU = ['Thị', 'Ngọc', 'Thùy', 'Thanh', 'Minh', 'Hoài', 'Khánh', 'Mỹ', 'Phương', 'Bích', 'Kim'];
const TEN_NAM = ['Anh', 'Bình', 'Cường', 'Dũng', 'Đạt', 'Hải', 'Hiếu', 'Hùng', 'Huy', 'Khoa', 'Khôi', 'Long', 'Minh', 'Nam', 'Phúc', 'Quân', 'Quang', 'Sơn', 'Tài', 'Thắng', 'Thành', 'Tín', 'Toàn', 'Trung', 'Tuấn', 'Việt', 'Vinh', 'Vũ', 'Lâm', 'Kiên'];
const TEN_NU = ['Anh', 'Chi', 'Dung', 'Giang', 'Hà', 'Hạnh', 'Hoa', 'Hương', 'Lan', 'Linh', 'Loan', 'Mai', 'My', 'Ngân', 'Ngọc', 'Nhung', 'Oanh', 'Phượng', 'Quyên', 'Thảo', 'Thu', 'Thủy', 'Trang', 'Trâm', 'Uyên', 'Vy', 'Yến', 'Hằng', 'Nhi', 'Tâm'];

// Đầu số di động (3 chữ số, gồm cả số 0 đầu); ghép với 7 chữ số ngẫu nhiên thành số 10 chữ số.
const DAU_SO = ['090', '091', '093', '094', '097', '098', '086', '088', '032', '033', '035', '036', '037', '038', '039', '070', '076', '077', '078', '079', '081', '082', '083', '085'];

// Nơi có tin: trọng số quyết định tỷ lệ; quan là các quận, huyện, thành phố trực thuộc.
const DIA_PHUONG = [
  {
    thanhPho: 'TP. Hồ Chí Minh', trongSo: 50,
    quan: ['Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 10', 'Quận 11', 'Quận 12', 'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Tân Phú', 'Bình Tân', 'Thủ Đức', 'Nhà Bè', 'Hóc Môn', 'Củ Chi'],
  },
  {
    thanhPho: 'Hà Nội', trongSo: 25,
    quan: ['Ba Đình', 'Hoàn Kiếm', 'Đống Đa', 'Cầu Giấy', 'Thanh Xuân', 'Hai Bà Trưng', 'Hà Đông', 'Long Biên', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Tây Hồ', 'Hoàng Mai'],
  },
  { thanhPho: 'Đà Nẵng', trongSo: 9, quan: ['Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu', 'Cẩm Lệ'] },
  { thanhPho: 'Cần Thơ', trongSo: 6, quan: ['Ninh Kiều', 'Bình Thủy', 'Cái Răng', 'Ô Môn'] },
  { thanhPho: 'Hải Phòng', trongSo: 5, quan: ['Hồng Bàng', 'Lê Chân', 'Ngô Quyền', 'Hải An'] },
  { thanhPho: 'Đồng Nai', trongSo: 3, quan: ['Biên Hòa', 'Long Khánh', 'Nhơn Trạch'] },
  { thanhPho: 'Khánh Hòa', trongSo: 2, quan: ['Nha Trang', 'Cam Ranh'] },
];

const DUONG = [
  'Nguyễn Huệ', 'Lê Lợi', 'Trần Hưng Đạo', 'Nguyễn Trãi', 'Lý Thường Kiệt', 'Hai Bà Trưng', 'Cách Mạng Tháng Tám', 'Điện Biên Phủ',
  'Võ Văn Tần', 'Phan Đăng Lưu', 'Nguyễn Thị Minh Khai', 'Lạc Long Quân', 'Trường Chinh', 'Nguyễn Văn Linh', 'Phạm Văn Đồng',
  'Hoàng Diệu', 'Lê Duẩn', 'Trần Phú', 'Bạch Đằng', 'Nguyễn Hữu Thọ',
];

module.exports = { HO, DEM_NAM, DEM_NU, TEN_NAM, TEN_NU, DAU_SO, DIA_PHUONG, DUONG };
