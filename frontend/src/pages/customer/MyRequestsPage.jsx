import React from 'react';
import { Title, Button, FooterNote, Stats, RequestList } from '../../components/Ui.jsx';
import { hrefFor } from '../../navigation/screenRoutes.js';
export default function MyRequestsPage() {
  return <><div className="content-wrap"><Title title="Tin của tôi" subtitle="Theo dõi yêu cầu sửa chữa và các đề xuất bạn đã nhận." action={<Button to="04">+ Đăng tin sửa chữa</Button>} /><Stats items={ [['Chờ đề xuất','1'],['Đã chọn kỹ thuật viên','1'],['Hoàn thành','1'],['Đã đóng','1']] } /><div className="filter-row">{['Tất cả (4)','Chờ đề xuất (1)','Đã chọn (1)','Hoàn thành (1)','Đã đóng (1)'].map((item,index)=><a key={item} className={`filter-pill ${index===0?'selected':''}`} href={hrefFor('03')}>{item}</a>)}</div><RequestList /></div><FooterNote>Chọn tin để xem yêu cầu và đề xuất nhận được. Từ SC-024, mở chi tiết để xem các đề xuất và chọn kỹ thuật viên.</FooterNote></>;
}
