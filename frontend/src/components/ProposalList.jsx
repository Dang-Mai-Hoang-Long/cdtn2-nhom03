import React from 'react';
import { Nut, NhanTrangThai } from './Ui.jsx';
import { dinhDangThoiGian, dinhDangTien, dinhDangDiem, NHAN_TRANG_THAI_DE_XUAT } from '../utils/dinhDang.js';

// US14: danh sách đề xuất của một tin. coTheChon: tin còn Chờ đề xuất nên hiện nút Chấp nhận cho đề xuất đang chờ.
export default function DanhSachDeXuat({ danhSach, coTheChon = false, maDangXuLy, onChapNhan }) {
  if (!danhSach.length) return <p className="mo-ta-phu">Chưa có đề xuất nào</p>;
  return <div className="cot-noi-dung">{danhSach.map((deXuat) => <article className="the-de-xuat" key={deXuat.id}>
    <div className="noi-dung-the-de-xuat">
      <div className="dau-the-de-xuat"><div><strong>{deXuat.technician.fullName}</strong><span>Gửi lúc {dinhDangThoiGian(deXuat.createdAt)}</span></div><strong className="chi-phi-de-xuat">{dinhDangTien(deXuat.price)}</strong></div>
      <p>{deXuat.description}</p>
      <div className="chan-the-de-xuat">
        <span>{dinhDangDiem(deXuat.technician.ratingAvg)}{deXuat.estimatedDuration && ` · Dự kiến ${deXuat.estimatedDuration}`}</span>
        <NhanTrangThai sacThai={deXuat.status === 'ACCEPTED' ? 'nhan-dam' : 'nhan-nhat'}>{NHAN_TRANG_THAI_DE_XUAT[deXuat.status]}</NhanTrangThai>
      </div>
      {coTheChon && deXuat.status === 'PENDING' && <div className="hang-nut">
        <Nut disabled={Boolean(maDangXuLy)} onClick={() => onChapNhan(deXuat)}>{maDangXuLy === deXuat.id ? 'Đang chấp nhận…' : 'Chấp nhận đề xuất'}</Nut>
      </div>}
    </div>
  </article>)}</div>;
}
