import React from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, NhanTrangThai, GhiChuChanTrang, TomTatYeuCau } from '../../components/Ui.jsx';
import { danhSachYeuCau } from '../../data/demoData.js';
import { layDuongDanManHinh } from '../../navigation/screenRoutes.js';
import DanhSachDeXuat from '../../components/ProposalList.jsx';
const yeuCau = danhSachYeuCau[0];
export default function TrangChiTietYeuCau() {
  return <><div className="khung-noi-dung"><TieuDeTrang tieuDe={yeuCau.tieuDe} phuDe={`${yeuCau.maYeuCau} · Tin của Nguyễn Minh Anh · Tạo ngày ${yeuCau.thoiGian}`} hanhDong={<NhanTrangThai>Chờ đề xuất</NhanTrangThai>} />
    <div className="hai-cot luoi-chi-tiet"><KhungNoiDung tieuDe="Thông tin tin của tôi"><TomTatYeuCau /><div className="hang-nut"><Nut maManHinhDich="04" laNutPhu>Sửa tin</Nut><Nut maManHinhDich="03" laNutPhu>Đóng tin</Nut></div></KhungNoiDung><KhungNoiDung tieuDe="Các đề xuất đã nhận (3)"><div className="so-luong-de-xuat"><span>2 có thể chọn</span><a className="lien-ket-van-ban" href={layDuongDanManHinh('06')}>Xem tất cả</a></div><DanhSachDeXuat coTheChon /></KhungNoiDung></div></div><GhiChuChanTrang>Chọn một đề xuất để xem chi tiết và hồ sơ kỹ thuật viên. Chỉ đề xuất còn hiệu lực mới có thể được chọn.</GhiChuChanTrang></>;
}
