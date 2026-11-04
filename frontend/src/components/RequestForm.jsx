import React, { useState } from 'react';
import { Nut, TruongNhap, ThongBao } from './Ui.jsx';
import { CAC_LOAI_DICH_VU } from '../utils/dinhDang.js';
import { taoYeuCau } from '../api/requestApi.js';
import { layThongDiepLoi, layLoiTheoTruong } from '../api/httpClient.js';
import { chuyenDenManHinh } from '../navigation/screenRoutes.js';

function ngayHomNay() {
  const homNay = new Date();
  homNay.setMinutes(homNay.getMinutes() - homNay.getTimezoneOffset());
  return homNay.toISOString().slice(0, 10);
}

// Gộp ngày + giờ theo giờ địa phương thành ISO; thiếu ngày thì để trống cho backend báo lỗi (BR05).
function taoThoiGianMongMuon(ngay, gio) {
  if (!ngay) return '';
  const thoiDiem = new Date(`${ngay}T${gio || '08:00'}`);
  return Number.isNaN(thoiDiem.getTime()) ? '' : thoiDiem.toISOString();
}

// US06: biểu mẫu đăng tin; location = "Quận/Huyện, Tỉnh/Thành phố" vì API chỉ có một trường địa điểm.
export default function BieuMauYeuCau() {
  const [loiChung, datLoiChung] = useState('');
  const [loiTheoTruong, datLoiTheoTruong] = useState({});
  const [dangGui, datDangGui] = useState(false);

  async function xuLyGui(suKien) {
    suKien.preventDefault();
    const duLieu = Object.fromEntries(new FormData(suKien.currentTarget));
    const location = [duLieu.quanHuyen, duLieu.tinhThanh].map((phan) => phan.trim()).filter(Boolean).join(', ');
    datDangGui(true);
    datLoiChung('');
    datLoiTheoTruong({});
    try {
      await taoYeuCau({
        title: duLieu.title,
        category: duLieu.category,
        description: duLieu.description,
        location,
        preferredTime: taoThoiGianMongMuon(duLieu.ngayMongMuon, duLieu.gioMongMuon),
      });
      try {
        sessionStorage.setItem('thongBaoTinCuaToi', 'Đăng tin thành công');
      } catch {
        // Bỏ qua.
      }
      chuyenDenManHinh('03');
    } catch (loi) {
      const cacLoi = layLoiTheoTruong(loi);
      datLoiTheoTruong(cacLoi);
      datLoiChung(Object.keys(cacLoi).length ? 'Vui lòng nhập đầy đủ các thông tin bắt buộc.' : layThongDiepLoi(loi));
      datDangGui(false);
    }
  }

  return <form onSubmit={xuLyGui} noValidate>
    <ThongBao loai="loi">{loiChung}</ThongBao>
    <TruongNhap nhan="Tiêu đề" ten="title" batBuoc maxLength={200} placeholder="Ví dụ: Máy lạnh không làm mát" loi={loiTheoTruong.title} />
    <TruongNhap nhan="Loại dịch vụ" ten="category" loaiTruong="select" cacLuaChon={[{ giaTri: '', nhan: 'Chọn loại dịch vụ' }, ...CAC_LOAI_DICH_VU]} giaTri="" batBuoc loi={loiTheoTruong.category} />
    <TruongNhap nhan="Mô tả sự cố" ten="description" batBuoc rong laVungVanBan placeholder="Mô tả tình trạng, thời điểm xảy ra, những gì bạn đã thử…" loi={loiTheoTruong.description} />
    <div className="luoi-truong-nhap">
      <TruongNhap nhan="Ngày mong muốn" ten="ngayMongMuon" loaiTruong="date" min={ngayHomNay()} batBuoc loi={loiTheoTruong.preferredTime} />
      <TruongNhap nhan="Giờ mong muốn" ten="gioMongMuon" loaiTruong="time" giaTri="09:00" batBuoc />
      <TruongNhap nhan="Quận / Huyện" ten="quanHuyen" batBuoc loi={loiTheoTruong.location} />
      <TruongNhap nhan="Tỉnh / Thành phố" ten="tinhThanh" giaTri="TP. Hồ Chí Minh" batBuoc />
    </div>
    <div className="hang-nut"><Nut loaiNut="submit" disabled={dangGui}>{dangGui ? 'Đang đăng tin…' : 'Đăng tin'}</Nut><Nut maManHinhDich="03" laNutPhu>Hủy</Nut></div>
  </form>;
}
