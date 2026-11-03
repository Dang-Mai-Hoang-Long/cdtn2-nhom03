import React from 'react';
import { Title, Panel, Button, Badge, Field, Note, FooterNote, Progress } from './Ui.jsx';
import { requests } from '../data/demoData.js';

const request = requests[0];

export function ReviewForm({ target }) {
  return <><div className="content-wrap"><Title title={target === 'Kỹ thuật viên' ? 'Hoàn thành và đánh giá' : 'Đánh giá khách hàng'} subtitle={`${request.id} — ${request.title} · Công việc hoàn thành lúc 22/10/2026 · 10:30`} action={<Badge tone="badge-dark">Hoàn thành</Badge>} /><Progress active={2} />
    <div className="two-column rating-layout"><Panel title={`Đánh giá ${target.toLowerCase()}`} className="form-panel"><label className="field"><span>Chất lượng trải nghiệm *</span><div className="stars">{[1,2,3,4,5].map((star)=><button key={star} type="button" aria-label={`${star} sao`}>{star} ★</button>)}</div></label><Field label="Nhận xét (không bắt buộc)" value={target === 'Kỹ thuật viên' ? 'Kỹ thuật viên đến đúng giờ, kiểm tra và giải thích rõ tình trạng máy lạnh.' : 'Khách hàng cung cấp thông tin rõ ràng, phối hợp tốt khi kiểm tra thiết bị.'} area /><Note>Mỗi bên chỉ được gửi một đánh giá cho công việc đã hoàn thành.</Note><div className="button-row"><Button to={target === 'Kỹ thuật viên' ? '03' : '15'}>Gửi đánh giá</Button><Button to={target === 'Kỹ thuật viên' ? '03' : '13'} secondary>Về danh sách</Button></div></Panel><Panel title="Người nhận đánh giá"><dl className="role-list"><dt>{target} thực hiện</dt><dd>{target === 'Kỹ thuật viên' ? 'Trần Quốc Huy' : 'Nguyễn Minh Anh'}</dd><dt>Dịch vụ</dt><dd>Sửa máy lạnh</dd><dt>Công việc</dt><dd>{request.id} · {request.title}</dd><dt>Hoàn thành lúc</dt><dd>22/10/2026 · 10:30</dd></dl><Note>Đánh giá giúp cộng đồng tham khảo chất lượng làm việc.</Note></Panel></div>
    </div><FooterNote>Gửi đánh giá → danh sách tương ứng. Có thể bỏ qua nhận xét; trang hiển thị dữ liệu minh họa.</FooterNote></>;
}
