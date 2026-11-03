import React from 'react';
import { Title, Panel, Button, Badge, Field, Note, FooterNote } from '../../components/Ui.jsx';
import { requests, proposals } from '../../data/demoData.js';
const request = requests[0];
export default function ProposalCreatePage() {
  return <><div className="content-wrap"><Title title="Gửi đề xuất sửa chữa" subtitle={`${request.id} — ${request.title} · Các trường có dấu * là bắt buộc.`} />
    <div className="two-column"><Panel title="Chi tiết đề xuất của bạn" className="form-panel"><Field label="Chi phí đề xuất (VND)" value="450000" required /><Field label="Nội dung phạm vi thực hiện" value={proposals[0].summary} area required /><div className="field-grid"><Field label="Ngày bắt đầu dự kiến" value="2026-10-22" type="date" required /><Field label="Giờ bắt đầu dự kiến" value="09:00" type="time" required /></div><Field label="Thời lượng dự kiến" value="90 phút" required /><Note>Mỗi kỹ thuật viên chỉ có thể gửi một đề xuất đang hiệu lực cho cùng một tin.</Note><div className="button-row"><Button to="12">Gửi đề xuất</Button><Button to="09" secondary>Hủy</Button></div></Panel>
      <div className="stack"><Panel title="Tin bạn đang đề xuất"><Badge>Chờ đề xuất</Badge><h3>{request.id} · {request.title}</h3><div className="field-grid"><div><span className="muted-label">Yêu cầu</span><strong>{request.service}</strong></div><div><span className="muted-label">Khu vực</span><strong>{request.location}</strong></div><div className="field-wide"><span className="muted-label">Thời gian mong muốn</span><strong>22/10/2026 · 09:00 – 11:00</strong></div></div></Panel><Note>Không gửi thông tin liên hệ trực tiếp. Chỉ chia sẻ khi khách hàng chọn bạn.</Note></div>
    </div></div><FooterNote>Gửi đề xuất thành công → 12. Đây là giao diện tĩnh, thông tin nhập không được gửi hoặc lưu.</FooterNote></>;
}
