import React from 'react';
import { Title, Panel, Button, Field, Note, FooterNote } from '../../components/Ui.jsx';
import UserTable from '../../components/UserTable.jsx';
export default function UserManagementPage() {
  return <><div className="content-wrap"><Title title="Quản lý tài khoản" subtitle="Tra cứu tài khoản khách hàng, kỹ thuật viên và kiểm soát quyền truy cập." />
    <Panel className="admin-filter"><div className="field-grid admin-fields"><Field label="Tìm theo họ tên hoặc email" value="" /><Field label="Vai trò" value="Tất cả vai trò" type="select" options={['Tất cả vai trò', 'Khách hàng', 'Kỹ thuật viên']} /><Field label="Trạng thái" value="Tất cả trạng thái" type="select" options={['Tất cả trạng thái', 'Hoạt động', 'Bị khóa']} /><Button>Tìm kiếm</Button><Button secondary>Đặt lại</Button></div></Panel>
    <div className="inline-between result-count"><strong>6 tài khoản · 4 hoạt động · 2 bị khóa</strong><span>Dữ liệu minh họa</span></div>
    <UserTable />
    <div className="list-footer"><span>Hiển thị 6/6 tài khoản</span><span>Trang 1 / 1</span></div><Note>Tài khoản bị khóa không thể đăng nhập hoặc thực hiện thao tác yêu cầu quyền.</Note>
    </div><FooterNote>Khóa / Mở khóa chỉ minh họa nút thao tác. Quản trị viên không thể tự khóa tài khoản của chính mình.</FooterNote></>;
}
