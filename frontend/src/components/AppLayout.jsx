import React from 'react';
import { layDuongDanManHinh, manHinhTheoMucMenu, MAN_HINH_CHINH_THEO_VAI_TRO, chuyenDenManHinh } from '../navigation/screenRoutes.js';
import { dangXuat } from '../api/authApi.js';
import { xoaPhienDangNhap } from '../api/phienDangNhap.js';
import { NHAN_VAI_TRO } from '../utils/dinhDang.js';
import ChuongThongBao from './NotificationBell.jsx';

function LienKetDieuHuong({ nhan, mucHienTai }) {
  const maManHinh = manHinhTheoMucMenu[nhan] ?? (nhan === 'Đăng nhập' ? '01' : '02');
  return <a className={`lien-ket-dieu-huong ${mucHienTai === nhan ? 'dang-la-muc-hien-tai' : ''}`} href={layDuongDanManHinh(maManHinh)}>{nhan}</a>;
}

// US03: gọi API đăng xuất (bỏ qua lỗi mạng), rồi luôn xóa phiên ở trình duyệt và về trang đăng nhập.
async function xuLyDangXuat() {
  try {
    await dangXuat();
  } catch {
    // Phiên phía trình duyệt vẫn được xóa bên dưới.
  }
  xoaPhienDangNhap();
  chuyenDenManHinh('01');
}

export function KhungUngDung({ manHinh, phien, children }) {
  const maManHinh = manHinh?.maManHinh;
  const laTrangTaiKhoan = !manHinh || maManHinh === '01' || maManHinh === '02';
  const mucDieuHuongHienTai = ['04'].includes(maManHinh) ? 'Đăng tin'
    : ['05', '06', '07', '08'].includes(maManHinh) ? 'Tin của tôi'
      : ['10', '11'].includes(maManHinh) ? 'Tìm việc sửa chữa'
        : maManHinh === '14' ? 'Công việc được chọn' : manHinh?.tieuDe;
  const trangChinh = phien ? MAN_HINH_CHINH_THEO_VAI_TRO[phien.user.role] : '01';

  return <div className="khung-ung-dung">
    <header className="dau-trang">
      <a className="thuong-hieu" href={layDuongDanManHinh(trangChinh)}>Sửa chữa tại nhà</a>
      {!laTrangTaiKhoan && manHinh.mucDieuHuong.length > 0 && <nav className="dieu-huong-chinh" aria-label="Điều hướng chính">
        {manHinh.mucDieuHuong.map((nhan) => <LienKetDieuHuong key={nhan} nhan={nhan} mucHienTai={mucDieuHuongHienTai} />)}
      </nav>}
      {laTrangTaiKhoan && !phien && <nav className="dieu-huong-chinh dieu-huong-tai-khoan" aria-label="Tài khoản">
        <LienKetDieuHuong nhan="Đăng nhập" mucHienTai={maManHinh === '01' ? 'Đăng nhập' : ''} />
        <LienKetDieuHuong nhan="Đăng ký" mucHienTai={maManHinh === '02' ? 'Đăng ký' : ''} />
      </nav>}
      {phien && <div className="thao-tac-dau-trang">
        <ChuongThongBao vaiTro={NHAN_VAI_TRO[phien.user.role]} />
        <div className="the-tai-khoan">
          <strong>{phien.user.fullName}</strong>
          <span>{NHAN_VAI_TRO[phien.user.role]}</span>
        </div>
        <button className="nut nut-phu nut-dang-xuat" type="button" onClick={xuLyDangXuat}>Đăng xuất</button>
      </div>}
    </header>
    <main>{children}</main>
  </div>;
}
