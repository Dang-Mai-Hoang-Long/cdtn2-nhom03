import React from 'react';
import { layDuongDanManHinh, manHinhTheoMucMenu } from '../navigation/screenRoutes.js';
import ChuongThongBao from './NotificationBell.jsx';

function LienKetDieuHuong({ nhan, mucHienTai }) {
  const doiTuongDanhGia = manHinhTheoMucMenu[nhan] ?? (nhan === 'Đăng nhập' ? '01' : '02');
  return <a className={`lien-ket-dieu-huong ${mucHienTai === nhan ? 'dang-la-muc-hien-tai' : ''}`} href={layDuongDanManHinh(doiTuongDanhGia)}>{nhan}</a>;
}

export function KhungUngDung({ manHinh, children }) {
  const laTrangTaiKhoan = manHinh.maManHinh === '01' || manHinh.maManHinh === '02';
  const mucDieuHuongHienTai = ['04'].includes(manHinh.maManHinh) ? 'Đăng tin'
    : ['05', '06', '07', '08'].includes(manHinh.maManHinh) ? 'Tin của tôi'
      : ['10', '11'].includes(manHinh.maManHinh) ? 'Tìm việc sửa chữa'
        : manHinh.maManHinh === '14' ? 'Công việc được chọn' : manHinh.tieuDe;

  return <div className="khung-ung-dung">
    <header className="dau-trang">
      <a className="thuong-hieu" href={layDuongDanManHinh(manHinh.nhomVaiTro === 'Kỹ thuật viên' ? '09' : manHinh.nhomVaiTro === 'Quản trị viên' ? '16' : '03')}>Sửa chữa tại nhà</a>
      {!laTrangTaiKhoan && manHinh.mucDieuHuong.length > 0 && <nav className="dieu-huong-chinh" aria-label="Điều hướng chính">
        {manHinh.mucDieuHuong.map((nhan) => <LienKetDieuHuong key={nhan} nhan={nhan} mucHienTai={mucDieuHuongHienTai} />)}
      </nav>}
      {laTrangTaiKhoan && <nav className="dieu-huong-chinh dieu-huong-tai-khoan" aria-label="Tài khoản">
        <LienKetDieuHuong nhan="Đăng nhập" mucHienTai={manHinh.maManHinh === '01' ? 'Đăng nhập' : ''} />
        <LienKetDieuHuong nhan="Đăng ký" mucHienTai={manHinh.maManHinh === '02' ? 'Đăng ký' : ''} />
      </nav>}
      {!laTrangTaiKhoan && <div className="thao-tac-dau-trang">
        <ChuongThongBao vaiTro={manHinh.nhomVaiTro} />
        <div className="the-tai-khoan">
          <strong>{manHinh.nhomVaiTro === 'Kỹ thuật viên' ? 'Trần Quốc Huy' : manHinh.nhomVaiTro === 'Quản trị viên' ? 'Lê Thu Hà' : 'Nguyễn Minh Anh'}</strong>
          <span>{manHinh.vaiTro}</span>
        </div>
      </div>}
    </header>
    <main>{children}</main>
  </div>;
}
