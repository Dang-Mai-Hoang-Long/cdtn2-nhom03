import React from 'react';
import { TieuDeTrang, Nut, GhiChuChanTrang, ThongKe, DanhSachYeuCau } from '../../components/Ui.jsx';
import { layDuongDanManHinh } from '../../navigation/screenRoutes.js';
export default function TrangTinCuaToi() {
  return <><div className="khung-noi-dung"><TieuDeTrang tieuDe="Tin của tôi" phuDe="Theo dõi yêu cầu sửa chữa và các đề xuất bạn đã nhận." hanhDong={<Nut maManHinhDich="04">+ Đăng tin sửa chữa</Nut>} /><ThongKe cacMuc={ [['Chờ đề xuất','1'],['Đã chọn kỹ thuật viên','1'],['Hoàn thành','1'],['Đã đóng','1']] } /><div className="hang-bo-loc">{['Tất cả (4)','Chờ đề xuất (1)','Đã chọn (1)','Hoàn thành (1)','Đã đóng (1)'].map((banGhi,viTri)=><a key={banGhi} className={`nut-loc ${viTri===0?'dang-duoc-chon':''}`} href={layDuongDanManHinh('03')}>{banGhi}</a>)}</div><DanhSachYeuCau /></div><GhiChuChanTrang>Chọn tin để xem yêu cầu và đề xuất nhận được. Từ SC-024, mở chi tiết để xem các đề xuất và chọn kỹ thuật viên.</GhiChuChanTrang></>;
}
