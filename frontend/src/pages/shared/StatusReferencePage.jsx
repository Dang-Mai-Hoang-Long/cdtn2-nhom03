import React from 'react';
import { Title, Panel, Button, Note, FooterNote } from '../../components/Ui.jsx';
export default function StatusReferencePage() {
  const groups = [
    { title:'A · Luồng trạng thái và quyền thao tác', cards:[['Chờ đề xuất','Khách hàng đã đăng tin. Kỹ thuật viên có thể gửi đề xuất.'],['Đã chọn kỹ thuật viên','Khách hàng chấp nhận một đề xuất. Các đề xuất khác không được chọn.'],['Hoàn thành','Khách hàng xác nhận công việc đã hoàn thành. Hai bên có thể đánh giá.'],['Đã đóng','Tin đã đóng, không nhận đề xuất mới.']] },
    { title:'B · Xác thực và giới hạn truy cập', cards:[['Đăng nhập không thành công','Email hoặc mật khẩu không đúng.'],['Đăng ký lỗi: email đã tồn tại','Email này đã được sử dụng.'],['Không có quyền truy cập','Bạn không có quyền truy cập nội dung này.']] },
    { title:'C · Dữ liệu bắt buộc và điều kiện gửi', cards:[['Thiếu thông tin đăng tin','Loại dịch vụ và mô tả sự cố là bắt buộc.'],['Thiếu thông tin đề xuất','Chi phí và thời lượng dự kiến là bắt buộc.'],['Tin không còn nhận đề xuất','Tin đã được chọn kỹ thuật viên hoặc đã đóng.']] },
    { title:'D · Trạng thái trống và kết quả đã gửi', cards:[['Khách hàng chưa đăng tin','Bạn chưa có tin sửa chữa nào.'],['Tin chưa có đề xuất','Tin chưa nhận được đề xuất nào.'],['Kỹ thuật viên chưa có tin','Hiện không có tin sửa chữa nào.'],['Bộ lọc không có kết quả','Không tìm thấy tin phù hợp.']] },
    { title:'E · Xác nhận thao tác — luôn có Hủy và hành động rõ ràng', cards:[['Đóng tin sửa chữa?','Tin sẽ ngừng nhận đề xuất mới.'],['Chấp nhận đề xuất này?','Tin chuyển sang Đã chọn kỹ thuật viên.'],['Xác nhận đã hoàn thành?','Công việc chuyển sang trạng thái Hoàn thành.'],['Khóa tài khoản?','Người dùng không thể đăng nhập.']] },
  ];
  return <><div className="content-wrap"><Title title="Trạng thái, xác nhận và quy tắc" subtitle="Tham chiếu nhanh cho luồng giao diện và trạng thái của nền tảng." />
    {groups.map((group)=><section className="reference-section" key={group.title}><h2>{group.title}</h2><div className="reference-grid">{group.cards.map(([title,body])=><Panel key={title} title={title}><p>{body}</p><div className="button-row"><Button secondary>Hủy</Button><Button>Xác nhận</Button></div></Panel>)}</div></section>)}
    <Note>Dữ liệu minh họa. Quyền và chuyển trạng thái trong bản demo không được xác thực hoặc lưu.</Note></div><FooterNote>Tham chiếu trạng thái, điều kiện dữ liệu và xác nhận thao tác cho các màn hình 01–16.</FooterNote></>;
}
