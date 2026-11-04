import React from 'react';
import { Nut, TruongNhap, GhiChu } from './Ui.jsx';
import { danhSachYeuCau } from '../data/demoData.js';

export default function BieuMauYeuCau() {
  return <>
    <TruongNhap nhan="Loại dịch vụ" giaTri="Sửa máy lạnh" loaiTruong="select" cacLuaChon={['Sửa máy lạnh', 'Sửa máy giặt', 'Sửa ống nước', 'Sửa điện']} batBuoc />
    <TruongNhap nhan="Mô tả sự cố" giaTri={danhSachYeuCau[0].moTa} batBuoc rong laVungVanBan />
    <div className="luoi-truong-nhap">
      <TruongNhap nhan="Ngày mong muốn" giaTri="2026-10-22" loaiTruong="date" batBuoc />
      <TruongNhap nhan="Khung giờ mong muốn" giaTri="09:00 – 11:00" batBuoc />
      <TruongNhap nhan="Tỉnh / Thành phố" giaTri="TP. Hồ Chí Minh" batBuoc />
      <TruongNhap nhan="Quận / Huyện" giaTri="Bình Thạnh" batBuoc />
      <TruongNhap nhan="Địa chỉ chi tiết" giaTri="24/8 đường D5, Phường 25" batBuoc rong />
    </div>
    <GhiChu>Số điện thoại và địa chỉ chi tiết chỉ hiển thị cho kỹ thuật viên được bạn chọn.</GhiChu>
    <div className="hang-nut"><Nut maManHinhDich="03">Đăng tin</Nut><Nut maManHinhDich="03" laNutPhu>Hủy</Nut></div>
  </>;
}
