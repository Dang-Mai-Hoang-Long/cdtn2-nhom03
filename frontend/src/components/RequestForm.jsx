import React, { useState } from 'react';
import { Nut, TruongNhap, ThongBao } from './Ui.jsx';
import { CAC_LOAI_DICH_VU } from '../utils/dinhDang.js';
import { taoYeuCau, suaYeuCau } from '../api/requestApi.js';
import { layThongDiepLoi, layLoiTheoTruong } from '../api/httpClient.js';
import { chuyenDenManHinh } from '../navigation/screenRoutes.js';

export const KHOA_THONG_BAO_CHI_TIET_TIN = 'thongBaoChiTietTin';

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

// Tách địa điểm đã lưu thành hai ô tại ", " cuối cùng. Dữ liệu cũ không có dấu phẩy thì để trống tỉnh/thành phố
// để người dùng tự điền.
function tachDiaDiem(diaDiem) {
  const viTri = diaDiem.lastIndexOf(', ');
  if (viTri === -1) return { quanHuyen: diaDiem, tinhThanh: '' };
  return { quanHuyen: diaDiem.slice(0, viTri), tinhThanh: diaDiem.slice(viTri + 2) };
}

// Đổi thời gian đã lưu (ISO) về ngày và giờ theo giờ địa phương cho hai ô nhập.
function tachThoiGian(giaTri) {
  const thoiDiem = new Date(giaTri);
  if (!giaTri || Number.isNaN(thoiDiem.getTime())) return { ngay: '', gio: '09:00' };
  const hai = (so) => String(so).padStart(2, '0');
  return {
    ngay: `${thoiDiem.getFullYear()}-${hai(thoiDiem.getMonth() + 1)}-${hai(thoiDiem.getDate())}`,
    gio: `${hai(thoiDiem.getHours())}:${hai(thoiDiem.getMinutes())}`,
  };
}

const GIA_TRI_MAC_DINH = { title: '', category: '', description: '', ngay: '', gio: '09:00', quanHuyen: '', tinhThanh: 'TP. Hồ Chí Minh' };

function taoGiaTriBanDau(yeuCauCu) {
  if (!yeuCauCu) return GIA_TRI_MAC_DINH;
  return {
    title: yeuCauCu.title,
    category: yeuCauCu.category,
    description: yeuCauCu.description,
    ...tachThoiGian(yeuCauCu.preferredTime),
    ...tachDiaDiem(yeuCauCu.location),
  };
}

function luuThongBao(khoa, thongDiep) {
  try {
    sessionStorage.setItem(khoa, thongDiep);
  } catch {
    // Bỏ qua.
  }
}

// US06: đăng tin; US21: sửa tin khi truyền yeuCauCu. location = "Quận/Huyện, Tỉnh/Thành phố" vì API chỉ có một trường địa điểm.
export default function BieuMauYeuCau({ yeuCauCu = null }) {
  const cheDoSua = Boolean(yeuCauCu);
  const giaTriBanDau = taoGiaTriBanDau(yeuCauCu);
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
      const duLieuGui = {
        title: duLieu.title,
        category: duLieu.category,
        description: duLieu.description,
        location: taoDiaDiem(cacO.quanHuyen, cacO.tinhThanh),
        preferredTime: taoThoiGianMongMuon(cacO.ngay, cacO.gio),
      };
      if (cheDoSua) {
        await suaYeuCau(yeuCauCu.id, duLieuGui);
        luuThongBao(KHOA_THONG_BAO_CHI_TIET_TIN, 'Chỉnh sửa tin thành công');
        chuyenDenManHinh('05', { id: yeuCauCu.id });
      } else {
        await taoYeuCau(duLieuGui);
        luuThongBao('thongBaoTinCuaToi', 'Đăng tin thành công');
        chuyenDenManHinh('03');
      }
    } catch (loi) {
      const cacLoi = gamLoiVaoOThieu(layLoiTheoTruong(loi), cacO);
      datLoiTheoTruong(cacLoi);
      datLoiChung(Object.keys(cacLoi).length ? 'Vui lòng nhập đầy đủ các thông tin bắt buộc.' : layThongDiepLoi(loi));
      datDangGui(false);
    }
  }

  return <form onSubmit={xuLyGui} noValidate>
    <ThongBao loai="loi">{loiChung}</ThongBao>
    <TruongNhap nhan="Tiêu đề" ten="title" batBuoc maxLength={200} placeholder="Ví dụ: Máy lạnh không làm mát" giaTri={giaTriBanDau.title} loi={loiTheoTruong.title} />
    <TruongNhap nhan="Loại dịch vụ" ten="category" loaiTruong="select" cacLuaChon={[{ giaTri: '', nhan: 'Chọn loại dịch vụ' }, ...CAC_LOAI_DICH_VU]} giaTri={giaTriBanDau.category} batBuoc loi={loiTheoTruong.category} />
    <TruongNhap nhan="Mô tả sự cố" ten="description" batBuoc rong laVungVanBan placeholder="Mô tả tình trạng, thời điểm xảy ra, những gì bạn đã thử…" giaTri={giaTriBanDau.description} loi={loiTheoTruong.description} />
    <div className="luoi-truong-nhap">
      <TruongNhap nhan="Ngày mong muốn" ten="ngayMongMuon" loaiTruong="date" min={ngayHomNay()} batBuoc giaTri={giaTriBanDau.ngay} loi={loiTheoTruong.ngayMongMuon} />
      <TruongNhap nhan="Giờ mong muốn" ten="gioMongMuon" loaiTruong="time" giaTri={giaTriBanDau.gio} batBuoc loi={loiTheoTruong.gioMongMuon} />
      <TruongNhap nhan="Quận / Huyện" ten="quanHuyen" batBuoc giaTri={giaTriBanDau.quanHuyen} loi={loiTheoTruong.quanHuyen} />
      <TruongNhap nhan="Tỉnh / Thành phố" ten="tinhThanh" giaTri={giaTriBanDau.tinhThanh} batBuoc loi={loiTheoTruong.tinhThanh} />
    </div>
    <div className="hang-nut">
      <Nut loaiNut="submit" disabled={dangGui}>{dangGui ? 'Đang lưu…' : cheDoSua ? 'Lưu thay đổi' : 'Đăng tin'}</Nut>
      <Nut maManHinhDich={cheDoSua ? '05' : '03'} thamSoDich={cheDoSua ? { id: yeuCauCu.id } : undefined} laNutPhu>Hủy</Nut>
    </div>
  </form>;
}
