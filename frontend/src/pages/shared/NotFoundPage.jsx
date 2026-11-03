import React from 'react';
import { TieuDeTrang, KhungNoiDung, Nut } from '../../components/Ui.jsx';
export default function TrangKhongTimThay() {
  return <div className="khung-noi-dung"><TieuDeTrang tieuDe="Không tìm thấy trang" phuDe="Địa chỉ bạn mở không nằm trong luồng giao diện hiện tại." /><KhungNoiDung tieuDe="Đi đến màn hình"><p>Chọn một trang trong thanh xem trước hoặc quay về danh sách tin sửa chữa.</p><Nut maManHinhDich="03">Tin của tôi</Nut></KhungNoiDung></div>;
}
