import React from 'react';
import { Title, Panel, Button, Badge, Field, Note, FooterNote } from '../../components/Ui.jsx';
import { requests } from '../../data/demoData.js';
import { hrefFor } from '../../navigation/screenRoutes.js';
export default function RequestSearchPage() {
  return <><div className="content-wrap"><Title title="Tìm việc sửa chữa" subtitle="Các yêu cầu đang chờ đề xuất. Lọc theo dịch vụ và khu vực phù hợp." />
    <div className="search-layout"><Panel title="Tìm và lọc tin" className="filter-panel"><Field label="Từ khóa" value="" /><Field label="Loại dịch vụ" value="Tất cả dịch vụ" type="select" options={['Tất cả dịch vụ', 'Sửa máy lạnh', 'Sửa máy giặt', 'Sửa ống nước']} /><Field label="Khu vực" value="Tất cả khu vực" type="select" options={['Tất cả khu vực', 'Bình Thạnh', 'Phú Nhuận', 'Quận 1']} /><Button>Tìm kiếm</Button><Button secondary>Đặt lại</Button><Note>Bạn chỉ xem các tin phù hợp với dịch vụ và khu vực.</Note></Panel><div className="search-results"><div className="result-count">3 tin đang nhận đề xuất <span>Tất cả dịch vụ · Tất cả khu vực</span></div>{requests.slice(0,3).map((item)=><Panel key={item.id} className="result-card"><div className="proposal-heading"><div><strong>{item.id} · {item.title}</strong><span>{item.service} · {item.location}</span></div><Badge>{item.status}</Badge></div><p>{item.description}</p><p className="subtle">Mong muốn: 22/10/2026 · 09:00 – 11:00</p><div className="inline-between"><span>{item.date}</span><a className="text-link" href={hrefFor('10')}>Xem chi tiết</a></div></Panel>)}</div></div>
    </div><FooterNote>Chọn tin để xem chi tiết → 10. Kỹ thuật viên chỉ xem được thông tin liên hệ chi tiết sau khi được chọn.</FooterNote></>;
}
