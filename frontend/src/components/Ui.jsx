import React from 'react';
import { requests, proposals } from '../data/demoData.js';
import { hrefFor } from '../navigation/screenRoutes.js';

const request = requests[0];

export function Title({ title, subtitle, action }) {
  return <div className="page-title"><div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{action}</div>;
}

export function Panel({ title, children, className = '' }) {
  return <section className={`panel ${className}`}>{title && <h2>{title}</h2>}{children}</section>;
}

export function Button({ children, to, secondary = false }) {
  const className = `button ${secondary ? 'button-secondary' : ''}`;
  return to ? <a className={className} href={hrefFor(to)}>{children}</a> : <button className={className} type="button">{children}</button>;
}

export function Badge({ children, tone = '' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Field({ label, value, type = 'text', wide = false, required = false, area = false, options = [] }) {
  const control = area
    ? <textarea defaultValue={value} rows="4" />
    : type === 'select'
      ? <select defaultValue={value}>{options.map((option) => <option key={option}>{option}</option>)}</select>
      : <input type={type} defaultValue={value} />;
  return <label className={`field ${wide ? 'field-wide' : ''}`}><span>{label}{required && ' *'}</span>{control}</label>;
}

export function Note() { return null; }

export function FooterNote() { return null; }

export function Stats({ items, compact = false }) {
  return <div className={`stats ${compact ? 'stats-compact' : ''}`}>{items.map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>;
}

export function RequestSummary({ item = request }) {
  return <div className="request-summary"><div className="field-grid"><div><span className="muted-label">Loại dịch vụ</span><strong>{item.service}</strong></div><div><span className="muted-label">Khu vực</span><strong>{item.location}</strong></div><div><span className="muted-label">Thời gian mong muốn</span><strong>22/10/2026 · 09:00 – 11:00</strong></div><div className="field-wide"><span className="muted-label">Mô tả sự cố</span><p>{item.description}</p></div><div className="field-wide"><span className="muted-label">Địa chỉ chi tiết</span><strong>24/8 đường D5, Phường 25</strong></div><div><span className="muted-label">Liên hệ</span><strong>Nguyễn Minh Anh · 090 123 4567</strong></div><div><span className="muted-label">Ngày tạo</span><strong>{item.date}</strong></div></div></div>;
}

export function Progress({ active = 1 }) {
  const steps = ['Chờ đề xuất', 'Đã chọn kỹ thuật viên', 'Hoàn thành'];
  return <div className="progress">{steps.map((step, index) => <div key={step} className={index <= active ? 'complete' : ''}><span>{index < active ? '✓' : index + 1}</span><strong>{step}</strong></div>)}</div>;
}

export function RequestList({ compact = false }) {
  return <div className={`request-list ${compact ? 'request-list-compact' : ''}`}>
    {!compact && <div className="request-row request-head"><span>Yêu cầu sửa chữa</span><span>Ngày tạo</span><span>Đề xuất</span><span>Trạng thái</span><span>Thao tác</span></div>}
    {requests.map((item) => <article className="request-row" key={item.id}>
      <div className="request-name"><strong>{item.id} · {item.title}</strong><span>{item.service} · {item.location}</span>{compact && <span>{item.description}</span>}</div>
      {!compact && <span>{item.date}</span>}
      <span>{item.count}</span>
      <span><Badge tone={item.status === 'Hoàn thành' ? 'badge-dark' : ''}>{item.status}</Badge></span>
      <a className="text-link" href={hrefFor(item.id === 'SC-024' ? '05' : '07')}>Xem chi tiết</a>
    </article>)}
    <div className="list-footer"><span>Hiển thị {requests.length}/{requests.length} tin của bạn</span><span>Trang 1 / 1</span></div>
  </div>;
}

export function ProposalCards({ selectable = false }) {
  return <div className="stack">{proposals.map((item, index) => <article className="proposal-card" key={item.name}>
    <div className="proposal-main"><div className="proposal-heading"><div><strong>{item.name}</strong><span>{item.date}</span></div><strong className="price">{item.price}</strong></div>
    <p>{item.summary}</p><div className="proposal-bottom"><span>{item.rating}</span><Badge tone={index === 2 ? '' : 'badge-light'}>{item.status}</Badge></div>
    <div className="button-row"><Button to={selectable ? '06' : '06'} secondary>{selectable ? 'Xem đề xuất' : 'Xem chi tiết'}</Button>{selectable && index === 0 && <Button to="07">Chấp nhận đề xuất</Button>}</div>
    </div>
  </article>)}</div>;
}
