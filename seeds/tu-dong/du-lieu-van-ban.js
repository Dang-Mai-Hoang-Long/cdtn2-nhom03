// Kho văn bản để ghép nội dung tin, đề xuất và đánh giá tự động. Mỗi mảng càng nhiều biến thể thì dữ liệu càng đa dạng.
// {n} trong câu được thay bằng một số ngẫu nhiên. congViec viết thường vì được ghép vào giữa câu rồi viết hoa chữ đầu.
const LOAI_DICH_VU = [
  {
    ten: 'Sửa máy lạnh', trongSo: 24, giaThap: 200000, giaCao: 900000,
    thietBi: ['Máy lạnh Daikin', 'Máy lạnh Panasonic', 'Máy lạnh LG Inverter', 'Máy lạnh Samsung', 'Máy lạnh Toshiba', 'Máy lạnh Casper', 'Máy lạnh âm trần', 'Máy lạnh tủ đứng'],
    suCo: [
      { tieuDe: 'không làm mát', chiTiet: 'chạy nhưng hơi thổi ra không lạnh, nghi hết gas' },
      { tieuDe: 'chảy nước ra sàn', chiTiet: 'dàn lạnh nhỏ nước xuống sàn mỗi lần bật quá một giờ' },
      { tieuDe: 'báo lỗi và tự tắt', chiTiet: 'hiện mã lỗi trên màn hình rồi tự ngắt sau vài phút' },
      { tieuDe: 'kêu to khi chạy', chiTiet: 'dàn nóng kêu ù ù và rung mạnh khi máy nén hoạt động' },
      { tieuDe: 'có mùi hôi', chiTiet: 'mỗi lần bật đều có mùi ẩm mốc trong những phút đầu' },
      { tieuDe: 'không nhận điều khiển', chiTiet: 'bấm điều khiển không có phản hồi, đèn báo nhấp nháy' },
      { tieuDe: 'đóng tuyết dàn lạnh', chiTiet: 'dàn lạnh đóng tuyết dày và gió yếu dần' },
      { tieuDe: 'chạy một lúc rồi ngắt', chiTiet: 'chạy khoảng mười phút thì tự ngắt, phải chờ mới bật lại được' },
      { tieuDe: 'cần vệ sinh định kỳ', chiTiet: 'đã hơn một năm chưa vệ sinh, hơi lạnh yếu và có bụi' },
      { tieuDe: 'dàn nóng không chạy', chiTiet: 'dàn lạnh thổi gió nhưng quạt dàn nóng đứng yên' },
    ],
    congViec: ['kiểm tra gas và áp suất', 'vệ sinh dàn lạnh và dàn nóng', 'thay tụ khởi động', 'kiểm tra bo mạch và cảm biến', 'thông ống thoát nước', 'thay cảm biến nhiệt'],
  },
  {
    ten: 'Sửa máy giặt', trongSo: 16, giaThap: 180000, giaCao: 800000,
    thietBi: ['Máy giặt Samsung cửa trước', 'Máy giặt LG lồng ngang', 'Máy giặt Electrolux', 'Máy giặt Toshiba cửa trên', 'Máy giặt Panasonic', 'Máy giặt Aqua', 'Máy giặt Sharp', 'Máy giặt sấy Bosch'],
    suCo: [
      { tieuDe: 'không vắt được', chiTiet: 'xả nước bình thường nhưng đến bước vắt thì dừng và báo lỗi' },
      { tieuDe: 'không cấp nước', chiTiet: 'bấm chạy nhưng máy không lấy nước, màn hình báo lỗi' },
      { tieuDe: 'xả nước không dừng', chiTiet: 'xả nước liên tục kể cả khi đã tắt nguồn' },
      { tieuDe: 'rung mạnh khi vắt', chiTiet: 'rung và kêu to khi vắt, máy dịch chuyển khỏi vị trí' },
      { tieuDe: 'dừng giữa chừng', chiTiet: 'đang giặt thì dừng, đèn nhấp nháy và không chạy tiếp' },
      { tieuDe: 'rò nước ở cửa', chiTiet: 'nước rỉ ra từ gioăng cửa mỗi lần giặt' },
      { tieuDe: 'cửa không mở được', chiTiet: 'giặt xong nhưng cửa bị khóa, còn nước bên trong' },
      { tieuDe: 'kêu to khi giặt', chiTiet: 'phát ra tiếng lạch cạch từ lồng giặt khi quay' },
      { tieuDe: 'không lên nguồn', chiTiet: 'cắm điện, bấm nút nhưng không có đèn nào sáng' },
      { tieuDe: 'có mùi hôi', chiTiet: 'quần áo giặt xong vẫn có mùi ẩm, lồng giặt bám cặn' },
    ],
    congViec: ['kiểm tra van cấp nước', 'thay gioăng cửa', 'kiểm tra bơm xả', 'cân lại chân máy và giảm chấn', 'thay cảm biến mực nước', 'kiểm tra bo mạch'],
  },
  {
    ten: 'Sửa tủ lạnh', trongSo: 16, giaThap: 250000, giaCao: 1200000,
    thietBi: ['Tủ lạnh Samsung Inverter', 'Tủ lạnh LG hai cánh', 'Tủ lạnh Panasonic', 'Tủ lạnh Hitachi Side by Side', 'Tủ lạnh Toshiba', 'Tủ lạnh Sharp', 'Tủ lạnh Aqua', 'Tủ lạnh mini'],
    suCo: [
      { tieuDe: 'không đông', chiTiet: 'ngăn đông không còn lạnh, ngăn mát vẫn bình thường' },
      { tieuDe: 'không lạnh ngăn mát', chiTiet: 'ngăn đông vẫn đông nhưng ngăn mát chỉ mát nhẹ' },
      { tieuDe: 'đóng tuyết dày', chiTiet: 'thành sau đóng tuyết thành mảng dày, đồ ăn bị đông cứng' },
      { tieuDe: 'kêu to khi máy nén chạy', chiTiet: 'máy nén chạy kêu ù ù và rung cả tủ, vài phút mới êm' },
      { tieuDe: 'chảy nước dưới đáy', chiTiet: 'nước chảy ra sàn dưới đáy tủ mỗi sáng' },
      { tieuDe: 'chạy liên tục không ngắt', chiTiet: 'máy nén chạy suốt ngày đêm, hóa đơn tiền điện tăng' },
      { tieuDe: 'rò điện nhẹ', chiTiet: 'chạm vào vỏ tủ thấy tê nhẹ' },
      { tieuDe: 'không chạy, đèn không sáng', chiTiet: 'cắm điện nhưng tủ không có phản ứng, đèn bên trong không sáng' },
      { tieuDe: 'cửa đóng không kín', chiTiet: 'gioăng cửa bị hở, hơi lạnh thoát ra và đóng tuyết ở mép' },
      { tieuDe: 'có mùi hôi', chiTiet: 'dù đã vệ sinh sạch vẫn có mùi khó chịu bên trong tủ' },
    ],
    congViec: ['kiểm tra bộ xả tuyết', 'thay quạt dàn lạnh', 'kiểm tra rơ-le khởi động', 'nạp gas và kiểm tra rò gas', 'thay gioăng cửa', 'kiểm tra cảm biến nhiệt'],
  },
  {
    ten: 'Sửa ống nước', trongSo: 18, giaThap: 150000, giaCao: 700000,
    thietBi: ['Vòi nước bồn rửa', 'Bồn cầu', 'Vòi sen nhà tắm', 'Đường ống nước âm tường', 'Máy bơm nước', 'Bồn nước mái nhà', 'Đồng hồ nước', 'Chậu rửa mặt'],
    suCo: [
      { tieuDe: 'rò rỉ nước', chiTiet: 'nước rỉ nhỏ giọt liên tục, làm ướt sàn và tủ bên dưới' },
      { tieuDe: 'bị tắc nghẽn', chiTiet: 'nước rút rất chậm và có mùi hôi, đã thử thông bằng hóa chất' },
      { tieuDe: 'nước chảy yếu', chiTiet: 'nước chảy rất yếu dù các vòi khác vẫn bình thường' },
      { tieuDe: 'bị vỡ ống', chiTiet: 'ống bị nứt, nước phun ra mỗi khi mở van' },
      { tieuDe: 'rò nước xuống tầng dưới', chiTiet: 'trần nhà tầng dưới bị thấm, nghi ống âm tường rò' },
      { tieuDe: 'xả không hết nước', chiTiet: 'xả nước yếu và nước rút chậm' },
      { tieuDe: 'có tiếng kêu trong ống', chiTiet: 'có tiếng gõ và rung trong ống mỗi khi mở nước' },
      { tieuDe: 'mất nước đột ngột', chiTiet: 'đang dùng thì nước ngừng chảy, nhà bên cạnh vẫn có nước' },
      { tieuDe: 'đọng nước ngoài thân ống', chiTiet: 'hơi nước đọng thành giọt dưới sàn gần vị trí lắp đặt' },
      { tieuDe: 'van không đóng kín', chiTiet: 'đóng van hết cỡ vẫn rỉ nước, số nước trên đồng hồ vẫn tăng' },
    ],
    congViec: ['thông tắc bằng máy chuyên dụng', 'thay gioăng và siết lại mối nối', 'thay đoạn ống bị hỏng', 'dò rò bằng thiết bị chuyên dụng', 'thay van khóa', 'vệ sinh đường ống'],
  },
  {
    ten: 'Sửa điện', trongSo: 20, giaThap: 120000, giaCao: 800000,
    thietBi: ['Ổ cắm phòng khách', 'Cầu dao tổng', 'Đèn LED phòng ngủ', 'Quạt trần', 'Bình nóng lạnh', 'Chuông cửa', 'Bảng điện tầng trệt', 'Máy bơm nước'],
    suCo: [
      { tieuDe: 'nhảy aptomat liên tục', chiTiet: 'aptomat nhảy khi bật đồng thời nhiều thiết bị' },
      { tieuDe: 'chập chờn rồi tắt', chiTiet: 'chập chờn rồi tự tắt, bật lại được sau vài phút' },
      { tieuDe: 'có mùi khét', chiTiet: 'nóng lên khi sử dụng và thoang thoảng mùi khét' },
      { tieuDe: 'bị cháy xém', chiTiet: 'có vết cháy xém quanh vị trí cắm, đã ngừng sử dụng' },
      { tieuDe: 'mất điện một phần', chiTiet: 'một nửa số ổ cắm và đèn trong nhà mất điện, aptomat tổng vẫn bật' },
      { tieuDe: 'không lên nguồn', chiTiet: 'bật công tắc nhưng không có phản ứng, đã thử thiết bị khác' },
      { tieuDe: 'rò điện nhẹ', chiTiet: 'chạm vào vỏ thấy tê nhẹ, nghi chạm vỏ' },
      { tieuDe: 'kêu rè rè', chiTiet: 'phát ra tiếng rè rè liên tục khi có điện' },
      { tieuDe: 'cần lắp thêm', chiTiet: 'cần lắp thêm điểm cấp điện ở vị trí mới' },
      { tieuDe: 'nóng bất thường', chiTiet: 'vỏ nóng bất thường sau khi dùng khoảng một giờ' },
    ],
    congViec: ['kiểm tra dây dẫn và mối nối', 'thay ổ cắm hoặc aptomat', 'đo tải từng nhánh', 'thay bộ nguồn đèn', 'đo cách điện và tiếp địa', 'đấu lại dây theo đúng tiêu chuẩn'],
  },
  {
    ten: 'Khác', trongSo: 6, giaThap: 100000, giaCao: 1500000,
    thietBi: ['Cửa cuốn', 'Cổng tự động', 'Máy bơm giếng khoan', 'Camera an ninh', 'Khóa cửa điện tử', 'Rèm tự động', 'Quạt thông gió', 'Máy hút mùi'],
    suCo: [
      { tieuDe: 'không chạy', chiTiet: 'bật nguồn nhưng thiết bị không hoạt động' },
      { tieuDe: 'kẹt giữa chừng', chiTiet: 'chạy được nửa đường thì dừng và kêu bíp' },
      { tieuDe: 'kêu to bất thường', chiTiet: 'phát ra tiếng kêu to và rung khi vận hành' },
      { tieuDe: 'mất kết nối', chiTiet: 'không còn nhận tín hiệu từ điều khiển hoặc ứng dụng' },
      { tieuDe: 'cần bảo dưỡng định kỳ', chiTiet: 'cần kiểm tra và bôi trơn trước mùa mưa' },
      { tieuDe: 'phản hồi chậm', chiTiet: 'bấm điều khiển phải chờ vài giây mới có phản hồi' },
      { tieuDe: 'hỏng bộ điều khiển', chiTiet: 'bộ điều khiển không còn nhận lệnh dù đã thay pin' },
      { tieuDe: 'rò rỉ dầu mỡ', chiTiet: 'có vết dầu mỡ chảy ra quanh thân thiết bị' },
    ],
    congViec: ['kiểm tra mô-tơ và bộ điều khiển', 'bôi trơn và chỉnh hành trình', 'thay cảm biến an toàn', 'thay pin và kiểm tra mạch', 'kiểm tra nguồn cấp', 'cân chỉnh cơ cấu truyền động'],
  },
];

// Một số tin dùng loại dịch vụ ngoài danh sách của giao diện (API nhận chuỗi bất kỳ), nội dung lấy theo nhóm "Khác".
const LOAI_HIEM = ['Sửa bình nóng lạnh', 'Sửa TV', 'Sửa bếp từ', 'Sửa cửa cuốn', 'Sửa quạt', 'Sửa máy lọc nước'];

const LICH_SU = [
  'Thiết bị đã dùng được {n} năm.', 'Mua từ khoảng {n} năm trước, chưa từng sửa.', 'Đã từng sửa một lần cách đây {n} tháng.',
  'Còn bảo hành hãng nhưng muốn nhờ thợ ngoài xem trước.', 'Chưa bao giờ gặp lỗi tương tự.', 'Lỗi xuất hiện từ {n} ngày nay và nặng dần.',
  'Hôm qua vẫn chạy bình thường.', 'Đã thử tắt mở lại nhiều lần nhưng không hết.',
];
const KHAN_CAP = [
  'Cần xử lý trong hôm nay nếu được.', 'Không gấp, trong tuần này là được.', 'Rất cần vì cả nhà đang dùng.',
  'Ưu tiên buổi sáng.', 'Ưu tiên cuối tuần vì ngày thường đi làm.', 'Cần xong trước khi khách đến nhà.',
];
const TIEP_CAN = [
  'Nhà ở chung cư, có thang máy.', 'Nhà phố, thiết bị ở tầng 3.', 'Hẻm nhỏ xe máy vào được, xe tải không vào được.',
  'Có chỗ để xe trước cửa.', 'Thiết bị đặt ở vị trí cao, cần mang thang.', 'Cổng khóa, gọi trước để được mở cửa.',
  'Có thú cưng trong nhà, mong thợ lưu ý.',
];
const LIEN_HE = [
  'Vui lòng gọi trước 30 phút.', 'Nhắn tin trước khi đến.', 'Có người ở nhà cả ngày.',
  'Chỉ có người ở nhà sau 5 giờ chiều.', 'Báo giá trước khi sửa giúp tôi.',
];

// Phần bổ sung khi khách hàng sửa tin sau khi đăng (US21).
const BO_SUNG = [
  'Bổ sung: có thể đến buổi chiều.', 'Bổ sung: đã kiểm tra nguồn điện vẫn bình thường.', 'Bổ sung: thiết bị còn nguyên tem, chưa tháo mở.',
  'Bổ sung: nhà có thêm một thiết bị cùng loại cần xem luôn.', 'Bổ sung: đổi địa chỉ nhận thợ sang cổng sau.',
  'Bổ sung: sẽ gửi thêm ảnh cho thợ khi nhắn tin.',
];

// Một phần nhỏ tin có ký tự đặc biệt để thử hiển thị và bộ lọc; phải hiển thị nguyên văn.
const KY_TU_DAC_BIET = [
  'Ghi chú: "đừng gọi sau 9 giờ tối" & nhắn tin giúp.', 'Mã tham chiếu <KH-001> & #A/B_100%.', "Nhà số 12/3A (hẻm 'ông Ba'), cạnh quán cà phê.",
  'Giá mong muốn: <= 500.000đ; nếu > thì báo trước.', 'Liên hệ: a.b+c@example.com hoặc zalo 0901 234 567.',
];

const BAO_HANH = [
  'Bảo hành 1 tháng.', 'Bảo hành 3 tháng cho phần đã sửa.', 'Bảo hành 6 tháng linh kiện thay mới.', 'Không bảo hành phần linh kiện cũ.',
  'Có hóa đơn và phiếu bảo hành.', 'Giá đã gồm công đi lại.', 'Giá chưa gồm linh kiện phát sinh.',
];
const THOI_GIAN_DU_KIEN = ['30 phút', '45 phút', '1 giờ', '1-2 giờ', '2 giờ', '2-3 giờ', '3 giờ', 'Nửa ngày', 'Trong ngày', '1 ngày', '2-3 ngày'];

// Nhận xét theo nhóm sao: thap (1-2), vua (3), cao (4-5).
const NHAN_XET_KHACH = {
  thap: ['Thợ đến trễ và sửa chưa dứt điểm.', 'Báo giá ban đầu thấp nhưng cuối cùng cao hơn.', 'Sửa xong vài hôm sau lỗi lại tái phát.', 'Làm chậm hơn dự kiến, để lại bụi bẩn.'],
  vua: ['Sửa được nhưng thời gian chờ hơi lâu.', 'Tạm ổn, giá hơi cao so với mong đợi.', 'Làm xong đúng yêu cầu, giao tiếp bình thường.', 'Thiết bị chạy lại bình thường, cần dọn dẹp kỹ hơn.'],
  cao: [
    'Thợ đến đúng giờ, giải thích rõ nguyên nhân.', 'Sửa nhanh, gọn gàng, giá đúng như báo.', 'Rất chuyên nghiệp, sẽ nhờ lại lần sau.',
    'Làm kỹ, kiểm tra lại cẩn thận trước khi về.', 'Bảo hành rõ ràng, nhiệt tình tư vấn.', 'Giá hợp lý, thiết bị chạy êm hơn trước.',
  ],
};
const NHAN_XET_KTV = {
  thap: ['Khách hàng không có mặt đúng giờ hẹn.', 'Mô tả sự cố không đúng nên mất thêm thời gian.', 'Khách hàng đổi yêu cầu nhiều lần.'],
  vua: ['Khách hàng thanh toán đúng hẹn nhưng trao đổi hơi chậm.', 'Công việc bình thường, không có gì đặc biệt.', 'Địa chỉ khó tìm nhưng khách hướng dẫn được.'],
  cao: ['Khách hàng thân thiện, chuẩn bị sẵn chỗ làm việc.', 'Thanh toán ngay sau khi sửa xong.', 'Hướng dẫn vị trí rõ ràng, phối hợp tốt.', 'Khách hàng dễ nói chuyện, sẵn sàng giới thiệu thêm.'],
};

module.exports = {
  LOAI_DICH_VU, LOAI_HIEM, LICH_SU, KHAN_CAP, TIEP_CAN, LIEN_HE, BO_SUNG, KY_TU_DAC_BIET,
  BAO_HANH, THOI_GIAN_DU_KIEN, NHAN_XET_KHACH, NHAN_XET_KTV,
};
