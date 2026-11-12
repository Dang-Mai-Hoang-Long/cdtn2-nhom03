import React from 'react';
import { NhanTrangThai, Nut } from './Ui.jsx';
import { NHAN_VAI_TRO } from '../utils/dinhDang.js';

// US04: bảng tài khoản; US05: nút Khóa / Mở khóa (onDoiTrangThai xử lý xác nhận và gọi API).
export default function BangNguoiDung({ danhSach, maDangXuLy, onDoiTrangThai }) {
  return <div className="khung-bang-nguoi-dung"><table className="bang-nguoi-dung"><thead><tr><th>Họ và tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{danhSach.map((nguoiDung) => <tr key={nguoiDung.id}>
    <td><strong>{nguoiDung.fullName}</strong></td>
    <td>{nguoiDung.email}</td>
    <td>{NHAN_VAI_TRO[nguoiDung.role]}</td>
    <td><NhanTrangThai sacThai={nguoiDung.isLocked ? '' : 'nhan-nhat'}>{nguoiDung.isLocked ? 'Bị khóa' : 'Hoạt động'}</NhanTrangThai></td>
    <td><Nut laNutPhu disabled={maDangXuLy === nguoiDung.id} onClick={() => onDoiTrangThai(nguoiDung)}>{nguoiDung.isLocked ? 'Mở khóa' : 'Khóa'}</Nut></td>
  </tr>)}</tbody></table></div>;
}
