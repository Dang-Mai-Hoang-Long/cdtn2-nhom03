import React from 'react';
import { Badge, Button } from './Ui.jsx';
import { users } from '../data/demoData.js';

export default function UserTable() {
  return <div className="user-table-wrap"><table className="user-table"><thead><tr><th>Họ và tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{users.map(([name, email, role, status]) => <tr key={email}><td><strong>{name}</strong></td><td>{email}</td><td>{role}</td><td><Badge tone={status === 'Hoạt động' ? 'badge-light' : ''}>{status}</Badge></td><td><Button secondary>{status === 'Hoạt động' ? 'Khóa' : 'Mở khóa'}</Button></td></tr>)}</tbody></table></div>;
}
