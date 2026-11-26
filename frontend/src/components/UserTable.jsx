import React from 'react';
import { NhanTrangThai, Nut, LienKetNguoiDung } from './Ui.jsx';
import { NHAN_VAI_TRO } from '../utils/dinhDang.js';

// US04: bảng tài khoản; US05: nút Khóa / Mở khóa (onDoiTrangThai xử lý xác nhận và gọi API).
export default function BangNguoiDung({ danhSach, maDangXuLy, onDoiTrangThai }) {
  return <div className="khung-bang-nguoi-dung"><table className="bang-nguoi-dung"><thead><tr><th>Họ và tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{danhSach.map((nguoiDung) => <tr key={nguoiDung.id}>
    <td><strong><LienKetNguoiDung id={nguoiDung.id}>{nguoiDung.fullName}</LienKetNguoiDung></strong></td>
    <td>{nguoiDung.email}</td>
    <td>{NHAN_VAI_TRO[nguoiDung.role]}</td>
    <td><NhanTrangThai sacThai={nguoiDung.isLocked ? 'nhan-khoa' : 'nhan-nhat'}>{nguoiDung.isLocked ? 'Bị khóa' : 'Hoạt động'}</NhanTrangThai></td>
    <td><div className="hang-hanh-dong">
      <LienKetNguoiDung id={nguoiDung.id}>Xem chi tiết</LienKetNguoiDung>
      <Nut laNutPhu disabled={maDangXuLy === nguoiDung.id} onClick={() => onDoiTrangThai(nguoiDung)}>{nguoiDung.isLocked ? 'Mở khóa' : 'Khóa'}</Nut>
    </div></td>
  </tr>)}</tbody></table></div>;
}
