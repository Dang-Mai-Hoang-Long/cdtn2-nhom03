import React from 'react';
import { dinhDangThoiGian, NHAN_TRANG_THAI_YEU_CAU, NHAN_VAI_TRO } from '../utils/dinhDang.js';
import { layDuongDanManHinh } from '../navigation/screenRoutes.js';

export function TieuDeTrang({ tieuDe, phuDe, hanhDong }) {
  return <div className="tieu-de-trang"><div><h1>{tieuDe}</h1>{phuDe && <p>{phuDe}</p>}</div>{hanhDong}</div>;
}

export function KhungNoiDung({ tieuDe, children, className = '' }) {
  return <section className={`khung-noi-dung ${className}`}>{tieuDe && <h2>{tieuDe}</h2>}{children}</section>;
}

export function Nut({ children, maManHinhDich, thamSoDich, laNutPhu = false, loaiNut = 'button', onClick, disabled = false }) {
  const className = `nut ${laNutPhu ? 'nut-phu' : ''}`;
  return maManHinhDich
    ? <a className={className} href={layDuongDanManHinh(maManHinhDich, thamSoDich)}>{children}</a>
    : <button className={className} type={loaiNut} onClick={onClick} disabled={disabled}>{children}</button>;
}

export function NhanTrangThai({ children, sacThai = '' }) {
  return <span className={`nhan-trang-thai ${sacThai}`}>{children}</span>;
}

// ten: thuộc tính name để đọc giá trị bằng FormData khi gửi biểu mẫu; loi: thông báo lỗi của trường.
export function TruongNhap({ nhan, giaTri, loaiTruong = 'text', rong = false, batBuoc = false, laVungVanBan = false, cacLuaChon = [], ten, loi, ...thuocTinhKhac }) {
  const thuocTinh = { name: ten, defaultValue: giaTri, 'aria-invalid': loi ? true : undefined, ...thuocTinhKhac };
  const dieuKhien = laVungVanBan
    ? <textarea rows="4" {...thuocTinh} />
    : loaiTruong === 'select'
      ? <select {...thuocTinh}>{cacLuaChon.map((luaChon) => {
        const { giaTri: giaTriLuaChon, nhan: nhanLuaChon } = typeof luaChon === 'string' ? { giaTri: luaChon, nhan: luaChon } : luaChon;
        return <option key={giaTriLuaChon} value={giaTriLuaChon}>{nhanLuaChon}</option>;
      })}</select>
      : <input type={loaiTruong} {...thuocTinh} />;
  return <label className={`truong-nhap ${rong ? 'truong-nhap-rong' : ''} ${loi ? 'truong-nhap-co-loi' : ''}`}>
    <span>{nhan}{batBuoc && ' *'}</span>{dieuKhien}{loi && <small className="loi-truong-nhap">{loi}</small>}
  </label>;
}

// Thông báo hiển thị thật trên trang (GhiChu của wireframe đang bị ẩn).
export function ThongBao({ loai = 'thong-tin', children }) {
  if (!children) return null;
  return <div className={`thong-bao-trang thong-bao-${loai}`} role={loai === 'loi' ? 'alert' : 'status'}>{children}</div>;
}

export function DangTai({ children = 'Đang tải dữ liệu…' }) {
  return <p className="dang-tai">{children}</p>;
}

export function GhiChu() { return null; }

export function GhiChuChanTrang() { return null; }

export function ThongKe({ cacMuc, rutGon = false }) {
  return <div className={`cac-muc-thong-ke ${rutGon ? 'cac-muc-thong-ke-rut-gon' : ''}`}>{cacMuc.map(([nhan, giaTri]) => <div className="muc-thong-ke" key={nhan}><span>{nhan}</span><strong>{giaTri}</strong></div>)}</div>;
}

export function TomTatYeuCau({ yeuCau }) {
  const lienHe = yeuCau.customer
    ? <><LienKetNguoiDung id={yeuCau.customer.id}>{yeuCau.customer.fullName}</LienKetNguoiDung>{yeuCau.customer.phone && ` · ${yeuCau.customer.phone}`}</>
    : '—';
  return <div className="tom-tat-yeu-cau"><div className="luoi-truong-nhap">
    <div><span className="nhan-mo-ta">Loại dịch vụ</span><strong>{yeuCau.category}</strong></div>
    <div><span className="nhan-mo-ta">Khu vực</span><strong>{yeuCau.location}</strong></div>
    <div><span className="nhan-mo-ta">Thời gian mong muốn</span><strong>{dinhDangThoiGian(yeuCau.preferredTime)}</strong></div>
    <div><span className="nhan-mo-ta">Ngày tạo</span><strong>{dinhDangThoiGian(yeuCau.createdAt)}</strong></div>
    <div className="truong-nhap-rong"><span className="nhan-mo-ta">Mô tả sự cố</span><p>{yeuCau.description}</p></div>
    {yeuCau.customer && <div className="truong-nhap-rong"><span className="nhan-mo-ta">Liên hệ</span><strong>{lienHe}</strong>{!yeuCau.customer.phone && <span className="mo-ta-phu"> Số điện thoại chỉ hiển thị cho kỹ thuật viên được chọn.</span>}</div>}
  </div></div>;
}

const BUOC_THEO_TRANG_THAI = { WAITING_PROPOSAL: 0, SELECTED: 1, COMPLETED: 2 };

export function TienTrinh({ trangThai }) {
  const buocHienTai = BUOC_THEO_TRANG_THAI[trangThai] ?? 0;
  const cacBuoc = ['Chờ đề xuất', 'Đã chọn kỹ thuật viên', 'Hoàn thành'];
  return <div className="tien-trinh">{cacBuoc.map((buoc, viTri) => <div key={buoc} className={viTri <= buocHienTai ? 'hoan-thanh' : ''}><span>{viTri < buocHienTai || trangThai === 'COMPLETED' ? '✓' : viTri + 1}</span><strong>{buoc}</strong></div>)}</div>;
}

// Mỗi trạng thái một sắc thái: chờ đề xuất (xanh), đã chọn kỹ thuật viên (vàng), hoàn thành (đen), đã đóng (viền xám).
const SAC_THAI_YEU_CAU = { WAITING_PROPOSAL: '', SELECTED: 'nhan-chon', COMPLETED: 'nhan-dam', CLOSED: 'nhan-nhat' };

export function NhanTrangThaiYeuCau({ trangThai }) {
  return <NhanTrangThai sacThai={SAC_THAI_YEU_CAU[trangThai] ?? ''}>{NHAN_TRANG_THAI_YEU_CAU[trangThai] ?? trangThai}</NhanTrangThai>;
}

// Liên kết tới hồ sơ một người dùng (màn hình 19). Không có mã thì chỉ hiện tên.
export function LienKetNguoiDung({ id, children }) {
  if (!id) return children;
  return <a className="lien-ket-van-ban" href={layDuongDanManHinh('19', { id })}>{children}</a>;
}

// Điểm 1 đến 5 bằng năm ngôi sao; giá trị bằng chữ nằm ở aria-label nên không chỉ dựa vào hình hay màu.
export function HienThiSao({ diem }) {
  const soSao = Math.round(Number(diem));
  return <span className="hang-sao-hien-thi" role="img" aria-label={`${String(diem).replace('.', ',')} trên 5 sao`}>
    {[1, 2, 3, 4, 5].map((viTri) => <svg key={viTri} viewBox="0 0 24 24" className={viTri <= soSao ? 'sao-day' : 'sao-rong'} aria-hidden="true"><path d="M12 3.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.8l6-.8z" /></svg>)}
  </span>;
}

// Đánh giá bên kia gửi cho người đang xem ở công việc này: nơi thông báo "Đánh giá mới" dẫn tới.
export function DanhGiaNhanDuoc({ danhGia }) {
  if (!danhGia) return null;
  const tieuDe = `${NHAN_VAI_TRO[danhGia.fromUser.role] ?? 'Bên kia'} đánh giá bạn`;
  return <KhungNoiDung tieuDe={tieuDe} className="khung-danh-gia-nhan">
    <article className="danh-gia-muc">
      <div className="dau-danh-gia"><HienThiSao diem={danhGia.rating} /><time dateTime={danhGia.createdAt}>{dinhDangThoiGian(danhGia.createdAt)}</time></div>
      <p className="noi-dung-danh-gia">{danhGia.comment || 'Không có nhận xét.'}</p>
      <p className="nguon-danh-gia">Từ <LienKetNguoiDung id={danhGia.fromUser.id}>{danhGia.fromUser.fullName}</LienKetNguoiDung></p>
    </article>
  </KhungNoiDung>;
}

export function PhanTrang({ phanTrang, onChuyenTrang }) {
  if (!phanTrang || phanTrang.totalPages <= 1) return null;
  return <div className="hang-nut">
    <Nut laNutPhu disabled={phanTrang.page <= 1} onClick={() => onChuyenTrang(phanTrang.page - 1)}>Trang trước</Nut>
    <Nut laNutPhu disabled={phanTrang.page >= phanTrang.totalPages} onClick={() => onChuyenTrang(phanTrang.page + 1)}>Trang sau</Nut>
  </div>;
}
