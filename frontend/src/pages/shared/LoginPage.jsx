import React from 'react';
import { Title, Panel, Button, Field, Note, FooterNote } from '../../components/Ui.jsx';
import { hrefFor } from '../../navigation/screenRoutes.js';
export default function LoginPage() {
  return <><div className="content-wrap"><Title title="Đăng nhập" subtitle="Nền tảng kết nối và đặt dịch vụ sửa chữa tại nhà" />
    <div className="auth-grid"><Panel title="Truy cập tài khoản" className="auth-panel"><p className="subtle">Nhập email và mật khẩu đã đăng ký.</p><Field label="Email" value="minh.anh@example.com" required /><Field label="Mật khẩu" value="password123" type="password" required /><Button to="03">Đăng nhập</Button><div className="panel-divider"/><div className="inline-between"><span>Bạn chưa có tài khoản?</span><a className="text-link" href={hrefFor('02')}>Đăng ký tài khoản</a></div></Panel>
      <div className="stack"><Panel title="Vai trò theo tài khoản"><dl className="role-list"><dt>Khách hàng</dt><dd>Đăng và quản lý tin sửa chữa của bạn.</dd><dt>Kỹ thuật viên</dt><dd>Tìm việc và quản lý đề xuất của bạn.</dd><dt>Quản trị viên</dt><dd>Quản lý trạng thái tài khoản người dùng.</dd></dl></Panel><Note>Không cần chọn vai trò khi đăng nhập. Hệ thống sử dụng vai trò đã được gán cho tài khoản.</Note><p className="footnote">* Thông tin bắt buộc</p></div>
    </div></div><FooterNote>Đăng nhập hợp lệ → 03 (Khách hàng), 09 (Kỹ thuật viên), 16 (Quản trị viên), theo vai trò của tài khoản. Dữ liệu nhập không được lưu.</FooterNote></>;
}
