export const requests = [
  { id: 'SC-024', title: 'Máy lạnh không làm mát', service: 'Sửa máy lạnh', status: 'Chờ đề xuất', count: '3 đề xuất · 2 có thể chọn', date: '20/10/2026 · 08:30', location: 'Bình Thạnh, TP. Hồ Chí Minh', description: 'Máy lạnh phòng ngủ vẫn chạy nhưng không làm mát đủ. Đã vệ sinh lưới lọc, không thấy báo lỗi. Cần kiểm tra và khắc phục để sử dụng lại.' },
  { id: 'SC-023', title: 'Vòi bếp rò nước', service: 'Sửa ống nước', status: 'Đã chọn kỹ thuật viên', count: '2 đề xuất · Đã chọn 1', date: '19/10/2026 · 09:00', location: 'Bình Thạnh, TP. Hồ Chí Minh', description: 'Nước rỉ liên tục tại khớp nối dưới chậu rửa.' },
  { id: 'SC-021', title: 'Máy giặt không xả nước', service: 'Sửa máy giặt', status: 'Hoàn thành', count: '2 đề xuất · Đã chọn 1', date: '15/10/2026 · 08:00', location: 'Phú Nhuận, TP. Hồ Chí Minh', description: 'Máy dừng ở chu trình xả, nước còn trong lồng.' },
  { id: 'SC-019', title: 'Ổ cắm phòng khách bị lỏng', service: 'Sửa điện', status: 'Đã đóng', count: '0 đề xuất', date: '12/10/2026 · 15:00', location: 'Bình Thạnh, TP. Hồ Chí Minh', description: 'Ổ cắm không giữ chặt phích; không còn nhu cầu sửa.' },
];

export const proposals = [
  { name: 'Trần Quốc Huy', price: '450.000 đ', rating: '4,8 / 5 · 12 đánh giá', summary: 'Kiểm tra dàn lạnh, dàn nóng và tình trạng gas. Vệ sinh lưới lọc, kiểm tra thoát nước và chạy thử sau xử lý.', date: '20/10/2026 · 10:15', status: 'Chờ xem xét' },
  { name: 'Lê Văn Nam', price: '500.000 đ', rating: '4,9 / 5 · 18 đánh giá', summary: 'Kiểm tra máy lạnh và vệ sinh; dự kiến thực hiện trong 2 giờ.', date: '20/10/2026 · 11:00', status: 'Chờ xem xét' },
  { name: 'Phạm Đức Long', price: '420.000 đ', rating: '4,6 / 5 · 9 đánh giá', summary: 'Kiểm tra máy lạnh, làm sạch bộ lọc và kiểm tra thoát nước.', date: '20/10/2026 · 11:30', status: 'Đã rút' },
];

export const users = [
  ['Nguyễn Minh Anh', 'minh.anh@example.com', 'Khách hàng', 'Hoạt động'],
  ['Trần Quốc Huy', 'quoc.huy@example.com', 'Kỹ thuật viên', 'Hoạt động'],
  ['Lê Văn Nam', 'van.nam@example.com', 'Kỹ thuật viên', 'Hoạt động'],
  ['Phạm Đức Long', 'duc.long@example.com', 'Kỹ thuật viên', 'Bị khóa'],
  ['Võ Thanh Mai', 'thanh.mai@example.com', 'Khách hàng', 'Bị khóa'],
  ['Đỗ Hoàng Phúc', 'hoang.phuc@example.com', 'Khách hàng', 'Hoạt động'],
];
