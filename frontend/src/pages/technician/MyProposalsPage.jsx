import React from 'react';
import { Title, Panel, Button, Badge, FooterNote } from '../../components/Ui.jsx';
import { proposals } from '../../data/demoData.js';
import { hrefFor } from '../../navigation/screenRoutes.js';
export default function MyProposalsPage() {
  return <><div className="content-wrap"><Title title="Đề xuất của tôi" subtitle="Theo dõi kết quả các đề xuất bạn đã gửi." />
    <div className="filter-row">{['Tất cả (3)','Chờ xem xét (1)','Đã chấp nhận (1)','Đã rút (1)'].map((item,index)=><a className={`filter-pill ${index===0?'selected':''}`} href={hrefFor('12')} key={item}>{item}</a>)}</div>
    <div className="stack">{[
      {request:'SC-024 · Máy lạnh không làm mát', code:'DX-018', price:'450.000 đ', status:'Đã chấp nhận', detail:'Khách hàng chọn lúc 20/10/2026 · 14:20. Xem chi tiết công việc đã nhận thông tin liên hệ.', target:'13'},
      {request:'SC-025 · Máy lạnh chảy nước', code:'DX-019', price:'400.000 đ', status:'Chờ xem xét', detail:'Tin vẫn chờ đề xuất. Bạn có thể sửa đề xuất hoặc rút đề xuất.', target:'11'},
      {request:'SC-020 · Máy lạnh phát tiếng ồn', code:'DX-014', price:'350.000 đ', status:'Đã rút', detail:'Đã rút lúc 19/10/2026 · 10:00. Không thể khôi phục đề xuất.', target:'09'},
    ].map((item)=><Panel key={item.code} className="my-proposal"><div className="proposal-heading"><div><strong>{item.request}</strong><span>{item.code} · 20/10/2026 · 10:15</span></div><strong className="price">{item.price}</strong></div><p>{proposals[0].summary}</p><div className="inline-between"><Badge tone={item.status==='Đã chấp nhận'?'badge-dark':''}>{item.status}</Badge><span>{item.detail}</span></div><div className="button-row"><Button to={item.target}>Xem công việc</Button>{item.status==='Chờ xem xét'&&<><Button to="11" secondary>Sửa đề xuất</Button><Button secondary>Rút đề xuất</Button></>}</div></Panel>)}</div>
    </div><FooterNote>Chọn công việc được chấp nhận → 13. Trạng thái và nút chỉ minh họa cho danh sách mẫu.</FooterNote></>;
}
