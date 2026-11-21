// Tin sửa chữa mẫu, phủ đủ các trạng thái của BR12 (Chờ đề xuất -> Đã chọn kỹ thuật viên -> Hoàn thành) và Đã đóng.
// khoa: tên ngắn để de-xuat.js và danh-gia.js tham chiếu; khachHang: khóa trong tai-khoan.js.
// soNgayToi: thời gian mong muốn tính từ lúc chạy seed (âm là đã qua); gioMongMuon: giờ trong ngày.
// ketQua: CHO_DE_XUAT | DA_CHON | HOAN_THANH | DA_DONG. DA_CHON và HOAN_THANH cần ktvDuocChon,
// kỹ thuật viên này phải có đề xuất cho tin trong de-xuat.js. Mã tin theo thứ tự trong mảng (SC-001, SC-002...).
// suaTin: (tùy chọn) khách hàng sửa tin ngay sau khi đăng (US21), dùng để thử tin đã được chỉnh sửa.
// 7 tin đầu giữ nguyên để mã tin, đề xuất, thông báo mà các tài liệu dẫn tới không đổi; tin mới chỉ thêm ở cuối mảng.
const { chuoiDaiDung } = require('./tien-ich');

module.exports = [
  {
    khoa: 'maylanh-cho',
    khachHang: 'khach1',
    title: 'Máy lạnh không làm mát',
    description: 'Máy lạnh chạy nhưng không làm mát, nghi hết gas. Máy 2 ngựa, lắp được 3 năm.',
    category: 'Sửa máy lạnh',
    location: 'Quận 7, TP. Hồ Chí Minh',
    soNgayToi: 2,
    gioMongMuon: 9,
    ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'maygiat-moi',
    khachHang: 'khach1',
    title: 'Máy giặt không vắt được',
    description: 'Máy giặt xả nước bình thường nhưng đến bước vắt thì dừng và báo lỗi.',
    category: 'Sửa máy giặt',
    location: 'Bình Thạnh, TP. Hồ Chí Minh',
    soNgayToi: 3,
    gioMongMuon: 14,
    ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'ongnuoc-dachon',
    khachHang: 'khach1',
    title: 'Rò rỉ ống nước dưới bồn rửa',
    description: 'Ống nước dưới bồn rửa bếp rò rỉ, ướt tủ bếp. Cần xử lý trong ngày.',
    category: 'Sửa ống nước',
    location: 'Quận 1, TP. Hồ Chí Minh',
    soNgayToi: 1,
    gioMongMuon: 10,
    ketQua: 'DA_CHON',
    ktvDuocChon: 'ktv1',
  },
  {
    khoa: 'tulanh-xong',
    khachHang: 'khach2',
    title: 'Tủ lạnh không đông',
    description: 'Ngăn đông của tủ lạnh không còn lạnh, ngăn mát vẫn bình thường.',
    category: 'Sửa tủ lạnh',
    location: 'Thủ Đức, TP. Hồ Chí Minh',
    soNgayToi: -5,
    gioMongMuon: 9,
    ketQua: 'HOAN_THANH',
    ktvDuocChon: 'ktv2',
  },
  {
    khoa: 'dien-xong',
    khachHang: 'khach2',
    title: 'Chập điện ổ cắm phòng khách',
    description: 'Ổ cắm phòng khách bị cháy xém, aptomat nhảy liên tục khi cắm thiết bị.',
    category: 'Sửa điện',
    location: 'Gò Vấp, TP. Hồ Chí Minh',
    soNgayToi: -2,
    gioMongMuon: 16,
    ketQua: 'HOAN_THANH',
    ktvDuocChon: 'ktv1',
  },
  {
    khoa: 'maylanh-dong',
    khachHang: 'khach2',
    title: 'Máy lạnh phát tiếng ồn',
    description: 'Máy lạnh kêu to khi chạy. Đã tự khắc phục được nên không cần sửa nữa.',
    category: 'Sửa máy lạnh',
    location: 'Quận 3, TP. Hồ Chí Minh',
    soNgayToi: 4,
    gioMongMuon: 8,
    ketQua: 'DA_DONG',
  },
  {
    khoa: 'quatran-moi',
    khachHang: 'khach2',
    title: 'Quạt trần kêu to khi quay',
    description: 'Quạt trần phòng ngủ kêu lạch cạch và lắc mạnh khi chạy tốc độ cao.',
    category: 'Sửa điện',
    location: 'Quận 10, TP. Hồ Chí Minh',
    soNgayToi: 3,
    gioMongMuon: 15,
    ketQua: 'CHO_DE_XUAT',
  },

  // ===== Bổ sung từ SC-008: mỗi tin nhắm một tình huống (bảng phủ ở seeds/README.md) =====

  // ----- khach1: 12 tin tất cả, đủ để "Tin của tôi" có trang 2 (10 tin mỗi trang) -----
  {
    khoa: 'khach1-nhieu-de-xuat', khachHang: 'khach1', category: 'Sửa máy lạnh', location: 'Quận 2, TP. Hồ Chí Minh',
    title: 'Hai máy lạnh phòng ngủ chạy nhưng không lạnh',
    description: 'Hai máy lạnh Inverter ở phòng ngủ và phòng làm việc đều chạy nhưng hơi thổi ra không lạnh. Cần kiểm tra cả hai máy trong cùng một lần.',
    soNgayToi: 2, gioMongMuon: 8, ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'khach1-maygiat-dong', khachHang: 'khach1', category: 'Sửa máy giặt', location: 'Bình Thạnh, TP. Hồ Chí Minh',
    title: 'Máy giặt rung mạnh khi vắt',
    description: 'Máy giặt cửa trước rung và kêu to khi vắt. Đã tự cân bằng lại nhưng vẫn rung nên chuyển sang nhờ người quen sửa.',
    soNgayToi: 5, gioMongMuon: 9, ketQua: 'DA_DONG',
  },
  {
    khoa: 'khach1-tulanh-dachon', khachHang: 'khach1', category: 'Sửa tủ lạnh', location: 'Quận 5, TP. Hồ Chí Minh',
    title: 'Tủ lạnh bị đóng tuyết dày ngăn mát',
    description: 'Ngăn mát đóng tuyết thành mảng dày ở thành sau, đồ ăn bị đông cứng. Tủ Side by Side dung tích 500 lít.',
    soNgayToi: 1, gioMongMuon: 14, ketQua: 'DA_CHON', ktvDuocChon: 'ktv5',
  },
  {
    khoa: 'khach1-dien-xong', khachHang: 'khach1', category: 'Sửa điện', location: 'Phú Nhuận, TP. Hồ Chí Minh',
    title: 'Đèn phòng khách chập chờn rồi tắt',
    description: 'Đèn LED phòng khách chập chờn rồi tự tắt, bật lại được sau vài phút. Nghi lỏng dây hoặc hỏng bộ nguồn.',
    soNgayToi: -4, gioMongMuon: 10, ketQua: 'HOAN_THANH', ktvDuocChon: 'ktv5',
  },
  {
    khoa: 'khach1-nuoc-xong-dg-thap', khachHang: 'khach1', category: 'Sửa ống nước', location: 'Tân Bình, TP. Hồ Chí Minh',
    title: 'Vòi sen nhà tắm yếu nước',
    description: 'Vòi sen nhà tắm nước chảy rất yếu dù các vòi khác bình thường. Có thể do cặn trong đường ống.',
    soNgayToi: -7, gioMongMuon: 16, ketQua: 'HOAN_THANH', ktvDuocChon: 'ktv6',
  },
  {
    khoa: 'khach1-khac-da-sua', khachHang: 'khach1', category: 'Khác', location: 'Quận 11, TP. Hồ Chí Minh',
    title: 'Cần người xem giúp thiết bị trong nhà',
    description: 'Một thiết bị trong nhà bị hỏng, chưa rõ cần loại thợ nào. Mô tả chi tiết sẽ bổ sung sau.',
    soNgayToi: 4, gioMongMuon: 11, ketQua: 'CHO_DE_XUAT',
    suaTin: {
      title: 'Cần xem giúp cửa cuốn bị kẹt',
      description: 'Cửa cuốn trước nhà bị kẹt giữa chừng, bấm remote chỉ nghe tiếng mô-tơ kêu mà cửa không chạy.',
      category: 'Sửa cửa cuốn',
    },
  },
  {
    khoa: 'khach1-maylanh-ktv-bi-khoa', khachHang: 'khach1', category: 'Sửa máy lạnh', location: 'Gò Vấp, TP. Hồ Chí Minh',
    title: 'Máy lạnh âm trần chảy nước',
    description: 'Máy lạnh âm trần ở quán cà phê chảy nước xuống sàn. Cần xử lý ngoài giờ mở cửa.',
    soNgayToi: -10, gioMongMuon: 21, ketQua: 'HOAN_THANH', ktvDuocChon: 'bikhoa',
  },
  {
    khoa: 'khach1-maygiat-xong-ktv7', khachHang: 'khach1', category: 'Sửa máy giặt', location: 'Thủ Đức, TP. Hồ Chí Minh',
    title: 'Máy giặt không cấp nước',
    description: 'Bấm chạy nhưng máy không lấy nước, màn hình báo lỗi E1. Máy dùng được 6 năm.',
    soNgayToi: -12, gioMongMuon: 8, ketQua: 'HOAN_THANH', ktvDuocChon: 'ktv7',
  },
  {
    khoa: 'khach1-dien-qua-han', khachHang: 'khach1', category: 'Sửa điện', location: 'Quận 6, TP. Hồ Chí Minh',
    title: 'Ổ cắm bếp nóng và có mùi khét',
    description: 'Ổ cắm bếp nóng lên khi dùng nồi chiên không dầu, thoang thoảng mùi khét. Đã rút điện từ hôm qua. Thời gian mong muốn đã qua nhưng tin vẫn chờ đề xuất.',
    soNgayToi: -3, gioMongMuon: 9, ketQua: 'CHO_DE_XUAT',
  },

  // ----- khach2: thêm 4 tin (tổng 8) -----
  {
    khoa: 'khach2-gia-bien', khachHang: 'khach2', category: 'Sửa máy lạnh', location: 'Quận 4, TP. Hồ Chí Minh',
    title: 'Máy lạnh treo tường rò nước',
    description: 'Dàn lạnh nhỏ nước giọt ở góc dưới. Đã kiểm tra ống thoát thấy thông. Tin này có đề xuất với giá ở hai đầu biên (0,1 và gần 10 nghìn tỷ) và giá lẻ.',
    soNgayToi: 6, gioMongMuon: 10, ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'khach2-tulanh-xong-ktv5', khachHang: 'khach2', category: 'Sửa tủ lạnh', location: 'Thủ Đức, TP. Hồ Chí Minh',
    title: 'Tủ lạnh kêu to khi máy nén chạy',
    description: 'Máy nén chạy kêu ù ù và rung cả tủ, vài phút mới êm. Tủ 2 cánh 300 lít.',
    soNgayToi: -6, gioMongMuon: 15, ketQua: 'HOAN_THANH', ktvDuocChon: 'ktv5',
  },
  {
    khoa: 'khach2-nuoc-dachon', khachHang: 'khach2', category: 'Sửa ống nước', location: 'Quận 12, TP. Hồ Chí Minh',
    title: 'Bồn cầu xả không hết nước',
    description: 'Bồn cầu xả nước yếu, nước rút chậm. Nhà đang có người lớn tuổi nên cần xử lý sớm.',
    soNgayToi: 2, gioMongMuon: 9, ketQua: 'DA_CHON', ktvDuocChon: 'ktv1',
  },
  {
    khoa: 'khach2-dien-dong-con-cho', khachHang: 'khach2', category: 'Sửa điện', location: 'Quận 7, TP. Hồ Chí Minh',
    title: 'Bình nóng lạnh không nóng',
    description: 'Bình nóng lạnh bật đèn nhưng nước không nóng. Đã đổi sang nhờ người quen nên đóng tin; đề xuất đang chờ của kỹ thuật viên được giữ nguyên (BR06).',
    soNgayToi: 3, gioMongMuon: 18, ketQua: 'DA_DONG',
  },

  // ----- khach3: 9 tin, nhiều đề xuất và đánh giá với đủ mức sao -----
  {
    khoa: 'khach3-maylanh-xong', khachHang: 'khach3', category: 'Sửa máy lạnh', location: 'Quận 8, TP. Hồ Chí Minh',
    title: 'Máy lạnh báo lỗi E6 rồi tự tắt',
    description: 'Máy lạnh báo lỗi E6 rồi tự tắt. Máy dùng được 2 năm, đã hết hạn bảo hành của hãng.',
    soNgayToi: -9, gioMongMuon: 9, ketQua: 'HOAN_THANH', ktvDuocChon: 'ktv1',
  },
  {
    khoa: 'khach3-maygiat-mot-de-xuat', khachHang: 'khach3', category: 'Sửa máy giặt', location: 'Tân Phú, TP. Hồ Chí Minh',
    title: 'Máy giặt xả nước mãi không dừng',
    description: 'Máy xả nước liên tục kể cả khi đã tắt nguồn, phải rút điện mới dừng.',
    soNgayToi: 4, gioMongMuon: 13, ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'khach3-tulanh-dachon', khachHang: 'khach3', category: 'Sửa tủ lạnh', location: 'Bình Tân, TP. Hồ Chí Minh',
    title: 'Tủ lạnh không làm lạnh ngăn mát',
    description: 'Ngăn đông vẫn đông nhưng ngăn mát chỉ mát nhẹ, thức ăn nhanh hỏng.',
    soNgayToi: 1, gioMongMuon: 8, ketQua: 'DA_CHON', ktvDuocChon: 'ktv3',
  },
  {
    khoa: 'khach3-nuoc-xong-nhan-xet-dai', khachHang: 'khach3', category: 'Sửa ống nước', location: 'Hóc Môn, TP. Hồ Chí Minh',
    title: 'Rò rỉ nước ở đồng hồ nước',
    description: 'Đồng hồ nước ở đầu nhà rò nhỏ giọt liên tục, số nước tăng dù cả nhà vắng.',
    soNgayToi: -15, gioMongMuon: 7, ketQua: 'HOAN_THANH', ktvDuocChon: 'ktv2',
  },
  {
    khoa: 'khach3-dien-dong-khong-de-xuat', khachHang: 'khach3', category: 'Sửa điện', location: 'Củ Chi, TP. Hồ Chí Minh',
    title: 'Lắp thêm ổ cắm ở phòng ngủ',
    description: 'Cần lắp thêm hai ổ cắm đôi gần giường ngủ. Đã nhờ thợ khác làm nên không cần nữa.',
    soNgayToi: 7, gioMongMuon: 10, ketQua: 'DA_DONG',
  },
  {
    khoa: 'khach3-khac-xong', khachHang: 'khach3', category: 'Khác', location: 'Quận 3, TP. Hồ Chí Minh',
    title: 'Sửa cổng tự động bị kẹt',
    description: 'Cổng tự động chạy được nửa đường thì dừng và kêu bíp. Cổng sắt dài 4 mét.',
    soNgayToi: -11, gioMongMuon: 14, ketQua: 'HOAN_THANH', ktvDuocChon: 'ktv5',
  },
  {
    khoa: 'khach3-maylanh-nam-de-xuat', khachHang: 'khach3', category: 'Sửa máy lạnh', location: 'Phú Nhuận, TP. Hồ Chí Minh',
    title: 'Vệ sinh và kiểm tra bốn máy lạnh văn phòng',
    description: 'Văn phòng có bốn máy lạnh treo tường cần vệ sinh và kiểm tra gas. Làm trong một buổi sáng cuối tuần.',
    soNgayToi: 8, gioMongMuon: 8, ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'khach3-maygiat-xong-dg-thap', khachHang: 'khach3', category: 'Sửa máy giặt', location: 'Quận 10, TP. Hồ Chí Minh',
    title: 'Máy giặt không vắt, cửa không mở',
    description: 'Máy giặt dừng giữa chừng, cửa bị khóa không mở được và còn nước bên trong.',
    soNgayToi: -13, gioMongMuon: 17, ketQua: 'HOAN_THANH', ktvDuocChon: 'ktv6',
  },
  {
    khoa: 'khach3-tulanh-da-sua', khachHang: 'khach3', category: 'Sửa tủ lạnh', location: 'Quận 1, TP. Hồ Chí Minh',
    title: 'Tủ lạnh mini phòng trọ',
    description: 'Tủ lạnh mini không chạy. Chưa rõ nguyên nhân.',
    soNgayToi: 5, gioMongMuon: 19, ketQua: 'CHO_DE_XUAT',
    suaTin: {
      title: 'Tủ lạnh mini phòng trọ không khởi động',
      description: 'Tủ lạnh mini 90 lít cắm điện không có phản ứng gì, đèn bên trong cũng không sáng. Ổ cắm đã thử với thiết bị khác vẫn dùng bình thường.',
    },
  },

  // ----- khach4: 8 tin, gồm tin đóng nhưng còn nhiều đề xuất chờ và tin có thời gian mong muốn rất xa -----
  {
    khoa: 'khach4-maylanh-xong', khachHang: 'khach4', category: 'Sửa máy lạnh', location: 'Thủ Đức, TP. Hồ Chí Minh',
    title: 'Máy lạnh không nhận điều khiển',
    description: 'Máy lạnh không phản hồi khi bấm điều khiển, đèn báo nhấp nháy. Đã thay pin mới.',
    soNgayToi: -5, gioMongMuon: 11, ketQua: 'HOAN_THANH', ktvDuocChon: 'ktv5',
  },
  {
    khoa: 'khach4-nuoc-cho', khachHang: 'khach4', category: 'Sửa ống nước', location: 'Quận 10, TP. Hồ Chí Minh',
    title: 'Bồn rửa chén bị tắc',
    description: 'Nước trong bồn rửa chén rút rất chậm, có mùi hôi. Đã thử thông bằng hóa chất nhưng không hiệu quả.',
    soNgayToi: 3, gioMongMuon: 9, ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'khach4-dien-xong-khong-danh-gia', khachHang: 'khach4', category: 'Sửa điện', location: 'Bình Thạnh, TP. Hồ Chí Minh',
    title: 'Cầu dao tổng hay nhảy',
    description: 'Cầu dao tổng nhảy khi bật đồng thời máy lạnh và bình nóng lạnh. Tin hoàn thành nhưng chưa bên nào đánh giá.',
    soNgayToi: -8, gioMongMuon: 20, ketQua: 'HOAN_THANH', ktvDuocChon: 'ktv7',
  },
  {
    khoa: 'khach4-maygiat-dachon', khachHang: 'khach4', category: 'Sửa máy giặt', location: 'Gò Vấp, TP. Hồ Chí Minh',
    title: 'Máy giặt lồng ngang bị rò nước ở cửa',
    description: 'Nước rỉ ra từ gioăng cửa mỗi lần giặt. Gioăng có vẻ bị rách.',
    soNgayToi: 2, gioMongMuon: 16, ketQua: 'DA_CHON', ktvDuocChon: 'ktv5',
  },
  {
    khoa: 'khach4-tulanh-dong-nhieu-cho', khachHang: 'khach4', category: 'Sửa tủ lạnh', location: 'Quận 6, TP. Hồ Chí Minh',
    title: 'Tủ lạnh bị rò điện nhẹ',
    description: 'Chạm vào vỏ tủ lạnh thấy tê nhẹ. Đã rút điện và hỏi thêm người quen nên đóng tin để chờ hãng bảo hành.',
    soNgayToi: 3, gioMongMuon: 8, ketQua: 'DA_DONG',
  },
  {
    khoa: 'khach4-maylanh-xong-ktv2', khachHang: 'khach4', category: 'Sửa máy lạnh', location: 'Nhà Bè, TP. Hồ Chí Minh',
    title: 'Máy lạnh có mùi hôi khi bật',
    description: 'Mỗi lần bật máy lạnh đều có mùi ẩm mốc khó chịu trong vài phút đầu.',
    soNgayToi: -14, gioMongMuon: 9, ketQua: 'HOAN_THANH', ktvDuocChon: 'ktv2',
  },
  {
    khoa: 'khach4-khac-xa', khachHang: 'khach4', category: 'Khác', location: 'Củ Chi, TP. Hồ Chí Minh',
    title: 'Bảo dưỡng máy bơm giếng khoan',
    description: 'Máy bơm giếng khoan cần kiểm tra và bảo dưỡng định kỳ trước mùa mưa. Không gấp: thời gian mong muốn cách đây hai tháng.',
    soNgayToi: 60, gioMongMuon: 8, ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'khach4-nuoc-xong', khachHang: 'khach4', category: 'Sửa ống nước', location: 'Quận 3, TP. Hồ Chí Minh',
    title: 'Rò nước xuống trần nhà tầng dưới',
    description: 'Trần nhà tầng dưới bị thấm nước, nghi ống cấp nước âm tường của căn hộ bị rò.',
    soNgayToi: -20, gioMongMuon: 10, ketQua: 'HOAN_THANH', ktvDuocChon: 'ktv1',
  },

  // ----- khach5: 10 tin dữ liệu biên (độ dài tối đa, ký tự đặc biệt, Unicode, khoảng trắng, địa phương khác) -----
  {
    khoa: 'khach5-tieu-de-200', khachHang: 'khach5', category: 'Sửa điện', location: 'Quận 1, TP. Hồ Chí Minh',
    title: chuoiDaiDung('Tiêu đề rất dài để kiểm tra giới hạn hai trăm ký tự của ô nhập liệu và cách hiển thị trên thẻ tin. ', 200),
    description: 'Tin có tiêu đề dài đúng 200 ký tự (giới hạn của cột title), dùng để thử cắt chữ và xuống dòng trên danh sách.',
    soNgayToi: 9, gioMongMuon: 9, ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'khach5-mo-ta-dai', khachHang: 'khach5', category: 'Sửa máy lạnh', location: 'Quận 2, TP. Hồ Chí Minh',
    title: 'Hệ thống máy lạnh nhiều phòng, mô tả rất dài',
    description: `Mô tả dài, nhiều dòng (hơn 4000 ký tự):\n${Array.from({ length: 55 }, (_, i) => `${i + 1}. Phòng số ${i + 1} có máy lạnh không đủ lạnh vào buổi chiều, quạt dàn nóng kêu to.`).join('\n')}`,
    soNgayToi: 5, gioMongMuon: 9, ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'khach5-loai-va-dia-diem-toi-da', khachHang: 'khach5',
    category: chuoiDaiDung('Sửa chữa thiết bị gia dụng và điện tử cỡ nhỏ ', 50),
    location: chuoiDaiDung('Số 12 ngõ 34 đường Nguyễn Văn Linh, khu phố 5, phường Tân Phong, quận 7, thành phố Hồ Chí Minh, ', 255),
    title: 'Loại dịch vụ dài 50 ký tự, địa điểm dài 255 ký tự',
    description: 'Thử hai giới hạn: category dài đúng 50 ký tự và location dài đúng 255 ký tự.',
    soNgayToi: 6, gioMongMuon: 15, ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'khach5-ky-tu-dac-biet', khachHang: 'khach5', category: 'Sửa điện', location: 'Quận 1 - 100%_test, TP. Hồ Chí Minh',
    title: `Ổ cắm "chập" & <b>nổ</b> '; DROP TABLE users; --`,
    description: `Thử ký tự đặc biệt: <script>alert('xss')</script>, dấu nháy ' và ", ký hiệu & % _ \\ và \`backtick\`. Nội dung phải hiển thị nguyên văn, không được thực thi. Địa điểm có % và _ để thử ký tự đại diện của bộ lọc.`,
    soNgayToi: 4, gioMongMuon: 10, ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'khach5-unicode', khachHang: 'khach5', category: 'Sửa tủ lạnh', location: 'Quận 3, TP. Hồ Chí Minh',
    title: 'Tủ lạnh ❄️ không lạnh 🙁 (có emoji)',
    description: `Văn bản có emoji 😀🔧 và chữ tiếng Việt viết ở dạng tổ hợp (NFD): ${'Sửa chữa tủ lạnh'.normalize('NFD')}.`,
    soNgayToi: 7, gioMongMuon: 11, ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'khach5-khoang-trang', khachHang: 'khach5', category: 'Sửa máy giặt', location: '  Quận 5, TP. Hồ Chí Minh  ',
    title: '   Máy giặt   kêu  to   ',
    description: '  Dòng một.\n\nDòng ba, sau hai lần xuống dòng. Khoảng trắng thừa ở hai đầu bị cắt khi lưu.  ',
    soNgayToi: 3, gioMongMuon: 12, ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'khach5-loai-ngoai-danh-sach', khachHang: 'khach5', category: 'Sửa bình nóng lạnh', location: 'Quận 12, TP. Hồ Chí Minh',
    title: 'Bình nóng lạnh bị rò điện',
    description: 'Loại dịch vụ không nằm trong danh sách sáu loại của giao diện (API nhận chuỗi bất kỳ), để thử bộ lọc theo loại.',
    soNgayToi: 2, gioMongMuon: 17, ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'khach5-da-nang', khachHang: 'khach5', category: 'Sửa máy lạnh', location: 'Hải Châu, Đà Nẵng',
    title: 'Máy lạnh phòng khách sạn mini không lạnh',
    description: 'Khách sạn mini 8 phòng có hai máy lạnh không đủ lạnh. Ở Đà Nẵng, để thử bộ lọc theo địa điểm.',
    soNgayToi: 10, gioMongMuon: 8, ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'khach5-ha-noi-xong', khachHang: 'khach5', category: 'Sửa điện', location: 'Ba Đình, Hà Nội',
    title: 'Mất điện một nửa căn hộ',
    description: 'Một nửa số ổ cắm và đèn trong căn hộ mất điện, aptomat tổng vẫn bật.',
    soNgayToi: -9, gioMongMuon: 14, ketQua: 'HOAN_THANH', ktvDuocChon: 'ktv5',
  },
  {
    khoa: 'khach5-dong-chi-con-rut', khachHang: 'khach5', category: 'Sửa ống nước', location: 'Cầu Giấy, Hà Nội',
    title: 'Vòi nước ngoài sân bị gãy',
    description: 'Vòi nước ngoài sân bị gãy ở chỗ nối. Các kỹ thuật viên đều đã rút đề xuất, khách hàng đóng tin.',
    soNgayToi: 2, gioMongMuon: 9, ketQua: 'DA_DONG',
  },

  // ----- khachkhoa (bị khóa sau khi tạo xong dữ liệu): lịch sử của một khách hàng bị khóa -----
  {
    khoa: 'khachkhoa-maylanh-rut-het', khachHang: 'khachkhoa', category: 'Sửa máy lạnh', location: 'Hoàn Kiếm, Hà Nội',
    title: 'Máy lạnh phòng ngủ chảy nước',
    description: 'Tin còn chờ nhưng mọi đề xuất đã được kỹ thuật viên rút: số đề xuất lớn hơn 0 mà không còn đề xuất nào hiệu lực.',
    soNgayToi: 4, gioMongMuon: 10, ketQua: 'CHO_DE_XUAT',
  },
  {
    khoa: 'khachkhoa-dien-dachon', khachHang: 'khachkhoa', category: 'Sửa điện', location: 'Đống Đa, Hà Nội',
    title: 'Chuông cửa không kêu',
    description: 'Chuông cửa không kêu dù đã thay pin, nút bấm có vẻ bị kẹt.',
    soNgayToi: 1, gioMongMuon: 15, ketQua: 'DA_CHON', ktvDuocChon: 'ktv1',
  },
  {
    khoa: 'khachkhoa-nuoc-xong', khachHang: 'khachkhoa', category: 'Sửa ống nước', location: 'Hai Bà Trưng, Hà Nội',
    title: 'Máy bơm nước lên bồn không chạy',
    description: 'Máy bơm nước lên bồn mái nhà không chạy dù đã bật nguồn, nghe tiếng ù nhỏ.',
    soNgayToi: -6, gioMongMuon: 13, ketQua: 'HOAN_THANH', ktvDuocChon: 'ktv3',
  },
];
