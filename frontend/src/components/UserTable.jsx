import React from 'react';
import { NhanTrangThai, Nut } from './Ui.jsx';
import { danhSachNguoiDung } from '../data/demoData.js';

export default function BangNguoiDung() {
  return <div className="khung-bang-nguoi-dung"><table className="bang-nguoi-dung"><thead><tr><th>Họ và tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{danhSachNguoiDung.map(([tenNguoiDung, diaChiEmail, vaiTro, trangThai]) => <tr key={diaChiEmail}><td><strong>{tenNguoiDung}</strong></td><td>{diaChiEmail}</td><td>{vaiTro}</td><td><NhanTrangThai sacThai={trangThai === 'Hoạt động' ? 'nhan-nhat' : ''}>{trangThai}</NhanTrangThai></td><td><Nut laNutPhu>{trangThai === 'Hoạt động' ? 'Khóa' : 'Mở khóa'}</Nut></td></tr>)}</tbody></table></div>;
}
