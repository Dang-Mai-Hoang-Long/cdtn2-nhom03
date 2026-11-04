import React from 'react';
import { danhSachYeuCau, danhSachDeXuat } from '../data/demoData.js';
import { layDuongDanManHinh } from '../navigation/screenRoutes.js';

const yeuCau = danhSachYeuCau[0];

export function TieuDeTrang({ tieuDe, phuDe, hanhDong }) {
  return <div className="tieu-de-trang"><div><h1>{tieuDe}</h1>{phuDe && <p>{phuDe}</p>}</div>{hanhDong}</div>;
}

export function KhungNoiDung({ tieuDe, children, className = '' }) {
  return <section className={`khung-noi-dung ${className}`}>{tieuDe && <h2>{tieuDe}</h2>}{children}</section>;
}

export function Nut({ children, maManHinhDich, laNutPhu = false }) {
  const className = `nut ${laNutPhu ? 'nut-phu' : ''}`;
  return maManHinhDich ? <a className={className} href={layDuongDanManHinh(maManHinhDich)}>{children}</a> : <button className={className} type="button">{children}</button>;
}

export function NhanTrangThai({ children, sacThai = '' }) {
  return <span className={`nhan-trang-thai ${sacThai}`}>{children}</span>;
}

export function TruongNhap({ nhan, giaTri, loaiTruong = 'text', rong = false, batBuoc = false, laVungVanBan = false, cacLuaChon = [] }) {
  const dieuKhien = laVungVanBan
    ? <textarea defaultValue={giaTri} rows="4" />
    : loaiTruong === 'select'
      ? <select defaultValue={giaTri}>{cacLuaChon.map((luaChon) => <option key={luaChon}>{luaChon}</option>)}</select>
      : <input type={loaiTruong} defaultValue={giaTri} />;
  return <label className={`truong-nhap ${rong ? 'truong-nhap-rong' : ''}`}><span>{nhan}{batBuoc && ' *'}</span>{dieuKhien}</label>;
}

export function GhiChu() { return null; }

export function GhiChuChanTrang() { return null; }

export function ThongKe({ cacMuc, rutGon = false }) {
  return <div className={`cac-muc-thong-ke ${rutGon ? 'cac-muc-thong-ke-rut-gon' : ''}`}>{cacMuc.map(([nhan, giaTri]) => <div className="muc-thong-ke" key={nhan}><span>{nhan}</span><strong>{giaTri}</strong></div>)}</div>;
}

export function TomTatYeuCau({ banGhi = yeuCau }) {
  return <div className="tom-tat-yeu-cau"><div className="luoi-truong-nhap"><div><span className="nhan-mo-ta">Loại dịch vụ</span><strong>{banGhi.loaiDichVu}</strong></div><div><span className="nhan-mo-ta">Khu vực</span><strong>{banGhi.khuVuc}</strong></div><div><span className="nhan-mo-ta">Thời gian mong muốn</span><strong>22/10/2026 · 09:00 – 11:00</strong></div><div className="truong-nhap-rong"><span className="nhan-mo-ta">Mô tả sự cố</span><p>{banGhi.moTa}</p></div><div className="truong-nhap-rong"><span className="nhan-mo-ta">Địa chỉ chi tiết</span><strong>24/8 đường D5, Phường 25</strong></div><div><span className="nhan-mo-ta">Liên hệ</span><strong>Nguyễn Minh Anh · 090 123 4567</strong></div><div><span className="nhan-mo-ta">Ngày tạo</span><strong>{banGhi.thoiGian}</strong></div></div></div>;
}

export function TienTrinh({ buocHienTai = 1 }) {
  const cacBuoc = ['Chờ đề xuất', 'Đã chọn kỹ thuật viên', 'Hoàn thành'];
  return <div className="tien-trinh">{cacBuoc.map((buoc, viTri) => <div key={buoc} className={viTri <= buocHienTai ? 'hoan-thanh' : ''}><span>{viTri < buocHienTai ? '✓' : viTri + 1}</span><strong>{buoc}</strong></div>)}</div>;
}

export function DanhSachYeuCau({ rutGon = false }) {
  return <div className={`danh-sach-yeu-cau ${rutGon ? 'danh-sach-yeu-cau-rut-gon' : ''}`}>
    {!rutGon && <div className="dong-yeu-cau dau-yeu-cau"><span>Yêu cầu sửa chữa</span><span>Ngày tạo</span><span>Đề xuất</span><span>Trạng thái</span><span>Thao tác</span></div>}
    {danhSachYeuCau.map((banGhi) => <article className="dong-yeu-cau" key={banGhi.maYeuCau}>
      <div className="ten-yeu-cau"><strong>{banGhi.maYeuCau} · {banGhi.tieuDe}</strong><span>{banGhi.loaiDichVu} · {banGhi.khuVuc}</span>{rutGon && <span>{banGhi.moTa}</span>}</div>
      {!rutGon && <span>{banGhi.thoiGian}</span>}
      <span>{banGhi.soLuongDeXuat}</span>
      <span><NhanTrangThai sacThai={banGhi.trangThai === 'Hoàn thành' ? 'nhan-dam' : ''}>{banGhi.trangThai}</NhanTrangThai></span>
      <a className="lien-ket-van-ban" href={layDuongDanManHinh(banGhi.maYeuCau === 'SC-024' ? '05' : '07')}>Xem chi tiết</a>
    </article>)}
    <div className="chan-danh-sach"><span>Hiển thị {danhSachYeuCau.length}/{danhSachYeuCau.length} tin của bạn</span><span>Trang 1 / 1</span></div>
  </div>;
}

export function DanhSachTheDeXuat({ coTheChon = false }) {
  return <div className="cot-noi-dung">{danhSachDeXuat.map((banGhi, viTri) => <article className="the-de-xuat" key={banGhi.tenKyThuatVien}>
    <div className="noi-dung-the-de-xuat"><div className="dau-the-de-xuat"><div><strong>{banGhi.tenKyThuatVien}</strong><span>{banGhi.thoiGian}</span></div><strong className="chi-phi-de-xuat">{banGhi.chiPhiDeXuat}</strong></div>
    <p>{banGhi.tomTat}</p><div className="chan-the-de-xuat"><span>{banGhi.diemDanhGia}</span><NhanTrangThai sacThai={viTri === 2 ? '' : 'nhan-nhat'}>{banGhi.trangThai}</NhanTrangThai></div>
    <div className="hang-nut"><Nut maManHinhDich={coTheChon ? '06' : '06'} laNutPhu>{coTheChon ? 'Xem đề xuất' : 'Xem chi tiết'}</Nut>{coTheChon && viTri === 0 && <Nut maManHinhDich="07">Chấp nhận đề xuất</Nut>}</div>
    </div>
  </article>)}</div>;
}
