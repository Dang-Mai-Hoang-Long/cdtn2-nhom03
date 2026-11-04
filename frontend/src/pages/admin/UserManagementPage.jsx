import React from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, TruongNhap, GhiChu, GhiChuChanTrang } from '../../components/Ui.jsx';
import BangNguoiDung from '../../components/UserTable.jsx';
export default function TrangQuanLyTaiKhoan() {
  return <><div className="khung-noi-dung"><TieuDeTrang tieuDe="Quản lý tài khoản" phuDe="Tra cứu tài khoản khách hàng, kỹ thuật viên và kiểm soát quyền truy cập." />
    <KhungNoiDung className="bo-loc-tai-khoan"><div className="luoi-truong-nhap cac-truong-quan-tri"><TruongNhap nhan="Tìm theo họ tên hoặc email" giaTri="" /><TruongNhap nhan="Vai trò" giaTri="Tất cả vai trò" loaiTruong="select" cacLuaChon={['Tất cả vai trò', 'Khách hàng', 'Kỹ thuật viên']} /><TruongNhap nhan="Trạng thái" giaTri="Tất cả trạng thái" loaiTruong="select" cacLuaChon={['Tất cả trạng thái', 'Hoạt động', 'Bị khóa']} /><Nut>Tìm kiếm</Nut><Nut laNutPhu>Đặt lại</Nut></div></KhungNoiDung>
    <div className="can-deu-hai-ben so-luong-ket-qua"><strong>6 tài khoản · 4 hoạt động · 2 bị khóa</strong><span>Dữ liệu minh họa</span></div>
    <BangNguoiDung />
    <div className="chan-danh-sach"><span>Hiển thị 6/6 tài khoản</span><span>Trang 1 / 1</span></div><GhiChu>Tài khoản bị khóa không thể đăng nhập hoặc thực hiện thao tác yêu cầu quyền.</GhiChu>
    </div><GhiChuChanTrang>Khóa / Mở khóa chỉ minh họa nút thao tác. Quản trị viên không thể tự khóa tài khoản của chính mình.</GhiChuChanTrang></>;
}
