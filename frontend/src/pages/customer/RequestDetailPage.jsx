import React from 'react';
import { Title, Panel, Button, Badge, FooterNote, RequestSummary } from '../../components/Ui.jsx';
import { requests } from '../../data/demoData.js';
import { hrefFor } from '../../navigation/screenRoutes.js';
import ProposalList from '../../components/ProposalList.jsx';
const request = requests[0];
export default function RequestDetailPage() {
  return <><div className="content-wrap"><Title title={request.title} subtitle={`${request.id} · Tin của Nguyễn Minh Anh · Tạo ngày ${request.date}`} action={<Badge>Chờ đề xuất</Badge>} />
    <div className="two-column detail-grid"><Panel title="Thông tin tin của tôi"><RequestSummary /><div className="button-row"><Button to="04" secondary>Sửa tin</Button><Button to="03" secondary>Đóng tin</Button></div></Panel><Panel title="Các đề xuất đã nhận (3)"><div className="proposal-count"><span>2 có thể chọn</span><a className="text-link" href={hrefFor('06')}>Xem tất cả</a></div><ProposalList selectable /></Panel></div></div><FooterNote>Chọn một đề xuất để xem chi tiết và hồ sơ kỹ thuật viên. Chỉ đề xuất còn hiệu lực mới có thể được chọn.</FooterNote></>;
}
