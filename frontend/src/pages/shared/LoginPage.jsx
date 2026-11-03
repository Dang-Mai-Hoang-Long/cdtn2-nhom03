import React from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, TruongNhap, GhiChu, GhiChuChanTrang } from '../../components/Ui.jsx';
import { layDuongDanManHinh } from '../../navigation/screenRoutes.js';
export default function TrangDangNhap() {
  return <><div className="khung-noi-dung"><TieuDeTrang tieuDe="Đăng nhập" phuDe="Nền tảng kết nối và đặt dịch vụ sửa chữa tại nhà" />
    <div className="luoi-tai-khoan"><KhungNoiDung tieuDe="Truy cập tài khoản" className="khung-tai-khoan"><p className="mo-ta-phu">Nhập email và mật khẩu đã đăng ký.</p><TruongNhap nhan="Email" giaTri="minh.anh@example.com" batBuoc /><TruongNhap nhan="Mật khẩu" giaTri="password123" loaiTruong="password" batBuoc /><Nut maManHinhDich="03">Đăng nhập</Nut><div className="vach-ngan"/><div className="can-deu-hai-ben"><span>Bạn chưa có tài khoản?</span><a className="lien-ket-van-ban" href={layDuongDanManHinh('02')}>Đăng ký tài khoản</a></div></KhungNoiDung>
      <div className="cot-noi-dung"><KhungNoiDung tieuDe="Vai trò theo tài khoản"><dl className="danh-sach-vai-tro"><dt>Khách hàng</dt><dd>Đăng và quản lý tin sửa chữa của bạn.</dd><dt>Kỹ thuật viên</dt><dd>Tìm việc và quản lý đề xuất của bạn.</dd><dt>Quản trị viên</dt><dd>Quản lý trạng thái tài khoản người dùng.</dd></dl></KhungNoiDung><GhiChu>Không cần chọn vai trò khi đăng nhập. Hệ thống sử dụng vai trò đã được gán cho tài khoản.</GhiChu><p className="ghi-chu-chan-trang">* Thông tin bắt buộc</p></div>
    </div></div><GhiChuChanTrang>Đăng nhập hợp lệ → 03 (Khách hàng), 09 (Kỹ thuật viên), 16 (Quản trị viên), theo vai trò của tài khoản. Dữ liệu nhập không được lưu.</GhiChuChanTrang></>;
}
