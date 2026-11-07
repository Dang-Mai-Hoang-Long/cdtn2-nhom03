import React, { useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, TruongNhap, ThongBao } from '../../components/Ui.jsx';
import { layDuongDanManHinh, chuyenDenManHinh, MAN_HINH_CHINH_THEO_VAI_TRO } from '../../navigation/screenRoutes.js';
import { dangNhap } from '../../api/authApi.js';
import { luuPhienDangNhap } from '../../api/phienDangNhap.js';
import { layThongDiepLoi, layLoiTheoTruong } from '../../api/httpClient.js';

const KHOA_THONG_BAO_DANG_KY = 'thongBaoDangKy';

function docThongBaoDangKy() {
  try {
    const thongDiep = sessionStorage.getItem(KHOA_THONG_BAO_DANG_KY);
    sessionStorage.removeItem(KHOA_THONG_BAO_DANG_KY);
    return thongDiep;
  } catch {
    return null;
  }
}

// US02: đăng nhập rồi chuyển đến trang chính theo vai trò của tài khoản.
export default function TrangDangNhap() {
  const [thongBaoThanhCong] = useState(docThongBaoDangKy);
  const [loiChung, datLoiChung] = useState('');
  const [loiTheoTruong, datLoiTheoTruong] = useState({});
  const [dangGui, datDangGui] = useState(false);

  async function xuLyGui(suKien) {
    suKien.preventDefault();
    const duLieu = new FormData(suKien.currentTarget);
    datDangGui(true);
    datLoiChung('');
    datLoiTheoTruong({});
    try {
      const { token, user } = await dangNhap(String(duLieu.get('email')), String(duLieu.get('password')));
      luuPhienDangNhap(token, user);
      chuyenDenManHinh(MAN_HINH_CHINH_THEO_VAI_TRO[user.role]);
    } catch (loi) {
      datLoiTheoTruong(layLoiTheoTruong(loi));
      datLoiChung(layThongDiepLoi(loi));
      datDangGui(false);
    }
  }

  return <div className="khung-noi-dung"><TieuDeTrang tieuDe="Đăng nhập" phuDe="Nền tảng kết nối và đặt dịch vụ sửa chữa tại nhà" />
    <div className="luoi-tai-khoan">
      <KhungNoiDung tieuDe="Truy cập tài khoản" className="khung-tai-khoan">
        <form onSubmit={xuLyGui} noValidate>
          <p className="mo-ta-phu">Nhập email và mật khẩu đã đăng ký.</p>
          <ThongBao loai="thanh-cong">{thongBaoThanhCong}</ThongBao>
          <ThongBao loai="loi">{loiChung}</ThongBao>
          <TruongNhap nhan="Email" ten="email" loaiTruong="email" autoComplete="email" batBuoc loi={loiTheoTruong.email} />
          <TruongNhap nhan="Mật khẩu" ten="password" loaiTruong="password" autoComplete="current-password" batBuoc loi={loiTheoTruong.password} />
          <Nut loaiNut="submit" disabled={dangGui}>{dangGui ? 'Đang đăng nhập…' : 'Đăng nhập'}</Nut>
        </form>
        <div className="vach-ngan" />
        <div className="can-deu-hai-ben"><span>Bạn chưa có tài khoản?</span><a className="lien-ket-van-ban" href={layDuongDanManHinh('02')}>Đăng ký tài khoản</a></div>
      </KhungNoiDung>
      <div className="cot-noi-dung">
        <KhungNoiDung tieuDe="Vai trò theo tài khoản"><dl className="danh-sach-vai-tro"><dt>Khách hàng</dt><dd>Đăng và quản lý tin sửa chữa của bạn.</dd><dt>Kỹ thuật viên</dt><dd>Tìm việc và quản lý đề xuất của bạn.</dd><dt>Quản trị viên</dt><dd>Quản lý trạng thái tài khoản người dùng.</dd></dl></KhungNoiDung>
        <ThongBao>Không cần chọn vai trò khi đăng nhập. Hệ thống sử dụng vai trò đã được gán cho tài khoản.</ThongBao>
        <p className="ghi-chu-chan-trang">* Thông tin bắt buộc</p>
      </div>
    </div>
  </div>;
}

export { KHOA_THONG_BAO_DANG_KY };
