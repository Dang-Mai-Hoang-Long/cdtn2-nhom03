import React from 'react';
import { Title, Panel, Button, Badge, FooterNote, RequestSummary, Progress } from '../../components/Ui.jsx';
import { requests, proposals } from '../../data/demoData.js';
const request = requests[0];
export default function RequestTrackingPage() {
  return <><div className="content-wrap"><Title title={request.title} subtitle={`${request.id} · Đã chấp nhận đề xuất DX-018 lúc 20/10/2026 · 14:20`} action={<Badge>Đã chọn kỹ thuật viên</Badge>} /><Progress active={1} />
    <div className="two-column"><Panel title="Thông tin yêu cầu"><RequestSummary /></Panel><div className="stack"><Panel title="Đề xuất đã chấp nhận"><div className="proposal-heading"><strong>Trần Quốc Huy</strong><Badge tone="badge-dark">Đã chấp nhận</Badge></div><div className="field-grid top-gap"><div><span className="muted-label">Chi phí đề xuất</span><strong>450.000 đ</strong></div><div><span className="muted-label">Thời gian dự kiến</span><strong>22/10/2026 · 09:00 – 11:00</strong></div><div className="field-wide"><span className="muted-label">Phạm vi công việc</span><p>{proposals[0].summary}</p></div></div><Button to="08">Xác nhận hoàn thành</Button></Panel><Panel title="Các đề xuất khác">{proposals.slice(1).map((item)=><div className="mini-proposal" key={item.name}><strong>{item.name} · {item.price}</strong><Badge>{item.status}</Badge></div>)}</Panel></div></div></div><FooterNote>Xác nhận hoàn thành → 08. Khi hoàn tất, bạn có thể gửi đánh giá. Không có thao tác nào được lưu.</FooterNote></>;
}
