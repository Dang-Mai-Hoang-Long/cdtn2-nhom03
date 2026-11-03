import React from 'react';
import { Title, Panel, Button, Badge, Note, FooterNote } from '../../components/Ui.jsx';
export default function NotificationsPage() {
  return <><div className="content-wrap"><Title title="Thông báo" subtitle="Thông báo trong ứng dụng khi đề xuất của bạn được khách hàng chấp nhận." />
    <div className="two-column notification-grid"><div className="stack"><div className="inline-between"><strong>Tất cả thông báo (1)</strong><span className="subtle">Mới nhất trước</span></div><Panel className="notification-card"><div className="notification-meta"><Badge tone="badge-dark">Đề xuất được chấp nhận</Badge><span>20/10/2026 · 14:20</span></div><h2>Đề xuất của bạn đã được chấp nhận</h2><p>Nguyễn Minh Anh đã chọn đề xuất DX-018 của bạn cho tin “Máy lạnh không làm mát”.</p><div className="field-grid"><div><span className="muted-label">Tin sửa chữa</span><strong>SC-024</strong></div><div><span className="muted-label">Chi phí đề xuất</span><strong>450.000 đ</strong></div></div><Button to="13">Xem công việc được chọn</Button></Panel></div><Panel title="Khi nào bạn nhận thông báo?"><p>Thông báo được tạo khi khách hàng chấp nhận đề xuất của bạn.</p><Note>Mở thông báo để xem chi tiết công việc và thông tin liên hệ.</Note></Panel></div>
    </div><FooterNote>Thông báo chỉ xuất hiện trong luồng khi đề xuất được chấp nhận. Dữ liệu mẫu: 1 thông báo.</FooterNote></>;
}
