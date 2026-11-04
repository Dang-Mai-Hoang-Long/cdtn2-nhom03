import React from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, NhanTrangThai, GhiChuChanTrang } from '../../components/Ui.jsx';
import { danhSachDeXuat } from '../../data/demoData.js';
import { layDuongDanManHinh } from '../../navigation/screenRoutes.js';
export default function TrangDeXuatCuaToi() {
  return <><div className="khung-noi-dung"><TieuDeTrang tieuDe="Đề xuất của tôi" phuDe="Theo dõi kết quả các đề xuất bạn đã gửi." />
    <div className="hang-bo-loc">{['Tất cả (3)','Chờ xem xét (1)','Đã chấp nhận (1)','Đã rút (1)'].map((banGhi,viTri)=><a className={`nut-loc ${viTri===0?'dang-duoc-chon':''}`} href={layDuongDanManHinh('12')} key={banGhi}>{banGhi}</a>)}</div>
    <div className="cot-noi-dung">{[
      {yeuCau:'SC-024 · Máy lạnh không làm mát', maDeXuat:'DX-018', chiPhiDeXuat:'450.000 đ', trangThai:'Đã chấp nhận', moTaChiTiet:'Khách hàng chọn lúc 20/10/2026 · 14:20. Xem chi tiết công việc đã nhận thông tin liên hệ.', maManHinhDich:'13'},
      {yeuCau:'SC-025 · Máy lạnh chảy nước', maDeXuat:'DX-019', chiPhiDeXuat:'400.000 đ', trangThai:'Chờ xem xét', moTaChiTiet:'Tin vẫn chờ đề xuất. Bạn có thể sửa đề xuất hoặc rút đề xuất.', maManHinhDich:'11'},
      {yeuCau:'SC-020 · Máy lạnh phát tiếng ồn', maDeXuat:'DX-014', chiPhiDeXuat:'350.000 đ', trangThai:'Đã rút', moTaChiTiet:'Đã rút lúc 19/10/2026 · 10:00. Không thể khôi phục đề xuất.', maManHinhDich:'09'},
    ].map((banGhi)=><KhungNoiDung key={banGhi.maDeXuat} className="de-xuat-cua-toi"><div className="dau-the-de-xuat"><div><strong>{banGhi.yeuCau}</strong><span>{banGhi.maDeXuat} · 20/10/2026 · 10:15</span></div><strong className="chi-phi-de-xuat">{banGhi.chiPhiDeXuat}</strong></div><p>{danhSachDeXuat[0].tomTat}</p><div className="can-deu-hai-ben"><NhanTrangThai sacThai={banGhi.trangThai==='Đã chấp nhận'?'nhan-dam':''}>{banGhi.trangThai}</NhanTrangThai><span>{banGhi.moTaChiTiet}</span></div><div className="hang-nut"><Nut maManHinhDich={banGhi.maManHinhDich}>Xem công việc</Nut>{banGhi.trangThai==='Chờ xem xét'&&<><Nut maManHinhDich="11" laNutPhu>Sửa đề xuất</Nut><Nut laNutPhu>Rút đề xuất</Nut></>}</div></KhungNoiDung>)}</div>
    </div><GhiChuChanTrang>Chọn công việc được chấp nhận → 13. Trạng thái và nút chỉ minh họa cho danh sách mẫu.</GhiChuChanTrang></>;
}
