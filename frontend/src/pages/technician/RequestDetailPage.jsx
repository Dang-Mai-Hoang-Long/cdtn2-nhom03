import React from 'react';
import { Title, Panel, Button, Badge, Note, FooterNote, RequestSummary } from '../../components/Ui.jsx';
import { requests } from '../../data/demoData.js';
const request = requests[0];
export default function TechnicianRequestDetailPage() {
  return <><div className="content-wrap"><Title title={request.title} subtitle={`${request.id} · Đăng ngày 20/10/2026 lúc 08:30`} action={<Badge>Chờ đề xuất</Badge>} />
    <div className="two-column"><Panel title="Chi tiết tin công khai"><RequestSummary /></Panel><div className="stack"><Panel title="Bạn có thể thực hiện?"><div className="field-grid"><div><span className="muted-label">Dịch vụ</span><strong>Sửa máy lạnh</strong></div><div><span className="muted-label">Khu vực</span><strong>Bình Thạnh</strong></div><div className="field-wide"><span className="muted-label">Lịch mong muốn</span><strong>22/10/2026 · 09:00 – 11:00</strong></div></div><Button to="11">Gửi đề xuất</Button><Button to="09" secondary>Quay lại tìm việc</Button></Panel><Note>Số điện thoại và địa chỉ chi tiết sẽ hiển thị cho kỹ thuật viên được chọn.</Note></div></div>
    </div><FooterNote>Gửi đề xuất → 11. Tin đã đóng hoặc đã chọn kỹ thuật viên sẽ không nhận đề xuất mới.</FooterNote></>;
}
