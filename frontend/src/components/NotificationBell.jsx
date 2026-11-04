import React, { useState } from 'react';
import { layDuongDanManHinh } from '../navigation/screenRoutes.js';

const thongBaoTheoVaiTro = {
  'Khách hàng': [
    { loaiThongBao: 'Trạng thái', tieuDe: 'Bạn đã nhận được 3 đề xuất', noiDung: 'Tin SC-024 đang chờ bạn xem và chọn kỹ thuật viên.', thoiGianHienThi: 'Hôm nay · 10:15', maManHinhDich: '05' },
    { loaiThongBao: 'Xác nhận', tieuDe: 'Xác nhận hoàn thành công việc', noiDung: 'Sau khi kiểm tra kết quả sửa chữa, bạn có thể xác nhận hoàn thành tin SC-024.', thoiGianHienThi: 'Hôm qua · 16:40', maManHinhDich: '07' },
    { loaiThongBao: 'Quy tắc', tieuDe: 'Chỉ chọn một đề xuất cho mỗi tin', noiDung: 'Khi chấp nhận một đề xuất, các đề xuất còn lại sẽ không còn hiệu lực.', thoiGianHienThi: 'Thông tin', maManHinhDich: '05' },
  ],
  'Kỹ thuật viên': [
    { loaiThongBao: 'Trạng thái', tieuDe: 'Đề xuất của bạn đã được chấp nhận', noiDung: 'Nguyễn Minh Anh đã chọn đề xuất DX-018 cho tin SC-024.', thoiGianHienThi: '20/10/2026 · 14:20', maManHinhDich: '13' },
    { loaiThongBao: 'Xác nhận', tieuDe: 'Công việc đang chờ xác nhận hoàn thành', noiDung: 'Khách hàng sẽ xác nhận sau khi công việc sửa chữa hoàn tất.', thoiGianHienThi: '20/10/2026 · 14:20', maManHinhDich: '13' },
    { loaiThongBao: 'Quy tắc', tieuDe: 'Thông tin liên hệ của khách hàng', noiDung: 'Thông tin chi tiết chỉ hiển thị sau khi khách hàng chọn đề xuất của bạn.', thoiGianHienThi: 'Thông tin', maManHinhDich: '12' },
  ],
  'Quản trị viên': [
    { loaiThongBao: 'Trạng thái', tieuDe: 'Tài khoản cần được theo dõi', noiDung: 'Danh sách hiện có tài khoản đang hoạt động và bị khóa.', thoiGianHienThi: 'Hôm nay', maManHinhDich: '16' },
    { loaiThongBao: 'Xác nhận', tieuDe: 'Xác nhận trước khi khóa tài khoản', noiDung: 'Kiểm tra đúng người dùng trước khi thay đổi trạng thái truy cập.', thoiGianHienThi: 'Thông tin', maManHinhDich: '16' },
    { loaiThongBao: 'Quy tắc', tieuDe: 'Quyền quản trị không tự đăng ký', noiDung: 'Chỉ quản trị viên có quyền quản lý trạng thái tài khoản người dùng.', thoiGianHienThi: 'Thông tin', maManHinhDich: '16' },
  ],
};

export default function ChuongThongBao({ vaiTro }) {
  const [dangMo, datTrangThaiMo] = useState(false);
  const danhSachThongBao = thongBaoTheoVaiTro[vaiTro] ?? [];

  return <div className="khung-nut-thong-bao">
    <button
      className={`nut-thong-bao ${dangMo ? 'dang-mo' : ''}`}
      type="button"
      aria-label={`Thông báo, ${danhSachThongBao.length} mục`}
      aria-expanded={dangMo}
      onClick={() => datTrangThaiMo((trangThaiTruoc) => !trangThaiTruoc)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
      <span className="so-luong-thong-bao">{danhSachThongBao.length}</span>
    </button>
    {dangMo && <section className="bang-thong-bao" aria-label="Thông báo">
      <div className="dau-bang-thong-bao"><strong>Thông báo</strong><span>{vaiTro}</span></div>
      <div className="danh-sach-thong-bao">
        {danhSachThongBao.map((banGhi) => <a className="muc-thong-bao" key={banGhi.tieuDe} href={layDuongDanManHinh(banGhi.maManHinhDich)} onClick={() => datTrangThaiMo(false)}>
          <span className="loai-thong-bao">{banGhi.loaiThongBao}</span>
          <strong>{banGhi.tieuDe}</strong>
          <span className="noi-dung-thong-bao">{banGhi.noiDung}</span>
          <time>{banGhi.thoiGianHienThi}</time>
        </a>)}
      </div>
    </section>}
  </div>;
}
