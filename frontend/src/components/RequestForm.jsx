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

// location và preferredTime là một trường của API nhưng biểu mẫu nhập bằng hai ô.
// Thiếu một ô thì gửi chuỗi rỗng để backend từ chối (không tạo tin) và báo lỗi cùng các trường khác (BR05).
function taoDiaDiem(quanHuyen, tinhThanh) {
  return quanHuyen && tinhThanh ? `${quanHuyen}, ${tinhThanh}` : '';
}

// Gộp ngày + giờ theo giờ địa phương thành ISO.
function taoThoiGianMongMuon(ngay, gio) {
  if (!ngay || !gio) return '';
  const thoiDiem = new Date(`${ngay}T${gio}`);
  return Number.isNaN(thoiDiem.getTime()) ? '' : thoiDiem.toISOString();
}

// Gắn lỗi của trường ghép vào đúng ô còn thiếu để người dùng biết cần điền ô nào.
function gamLoiVaoOThieu(cacLoi, { quanHuyen, tinhThanh, ngay, gio }) {
  const { location, preferredTime, ...cacLoiKhac } = cacLoi;
  if (location) {
    if (!quanHuyen) cacLoiKhac.quanHuyen = 'Quận / Huyện không được để trống';
    if (!tinhThanh) cacLoiKhac.tinhThanh = 'Tỉnh / Thành phố không được để trống';
    if (quanHuyen && tinhThanh) cacLoiKhac.quanHuyen = location;
  }
  if (preferredTime) {
    if (ngay && !gio) cacLoiKhac.gioMongMuon = 'Giờ mong muốn không được để trống';
    else cacLoiKhac.ngayMongMuon = preferredTime;
  }
  return cacLoiKhac;
}

// US06: biểu mẫu đăng tin; location = "Quận/Huyện, Tỉnh/Thành phố" vì API chỉ có một trường địa điểm.
export default function BieuMauYeuCau() {
  const [loiChung, datLoiChung] = useState('');
  const [loiTheoTruong, datLoiTheoTruong] = useState({});
  const [dangGui, datDangGui] = useState(false);

  async function xuLyGui(suKien) {
    suKien.preventDefault();
    const duLieu = Object.fromEntries(new FormData(suKien.currentTarget));
    const cacO = { quanHuyen: duLieu.quanHuyen.trim(), tinhThanh: duLieu.tinhThanh.trim(), ngay: duLieu.ngayMongMuon, gio: duLieu.gioMongMuon };
    datDangGui(true);
    datLoiChung('');
    datLoiTheoTruong({});
    try {
      await taoYeuCau({
        title: duLieu.title,
        category: duLieu.category,
        description: duLieu.description,
        location: taoDiaDiem(cacO.quanHuyen, cacO.tinhThanh),
        preferredTime: taoThoiGianMongMuon(cacO.ngay, cacO.gio),
      });
      try {
        sessionStorage.setItem('thongBaoTinCuaToi', 'Đăng tin thành công');
      } catch {
        // Bỏ qua.
      }
      chuyenDenManHinh('03');
    } catch (loi) {
      const cacLoi = gamLoiVaoOThieu(layLoiTheoTruong(loi), cacO);
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
      <TruongNhap nhan="Ngày mong muốn" ten="ngayMongMuon" loaiTruong="date" min={ngayHomNay()} batBuoc loi={loiTheoTruong.ngayMongMuon} />
      <TruongNhap nhan="Giờ mong muốn" ten="gioMongMuon" loaiTruong="time" giaTri="09:00" batBuoc loi={loiTheoTruong.gioMongMuon} />
      <TruongNhap nhan="Quận / Huyện" ten="quanHuyen" batBuoc loi={loiTheoTruong.quanHuyen} />
      <TruongNhap nhan="Tỉnh / Thành phố" ten="tinhThanh" giaTri="TP. Hồ Chí Minh" batBuoc loi={loiTheoTruong.tinhThanh} />
    </div>
    <div className="hang-nut"><Nut loaiNut="submit" disabled={dangGui}>{dangGui ? 'Đang đăng tin…' : 'Đăng tin'}</Nut><Nut maManHinhDich="03" laNutPhu>Hủy</Nut></div>
  </form>;
}
