import React, { useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, TruongNhap, ThongBao } from '../../components/Ui.jsx';
import { layDuongDanManHinh, chuyenDenManHinh } from '../../navigation/screenRoutes.js';
import { dangKy } from '../../api/authApi.js';
import { layThongDiepLoi, layLoiTheoTruong } from '../../api/httpClient.js';
import { KHOA_THONG_BAO_DANG_KY } from './LoginPage.jsx';

// US01: đăng ký thành công thì chuyển đến trang đăng nhập kèm thông báo (theo tiêu chí chấp nhận).
export default function TrangDangKy() {
  const [loiChung, datLoiChung] = useState('');
  const [loiTheoTruong, datLoiTheoTruong] = useState({});
  const [dangGui, datDangGui] = useState(false);

  async function xuLyGui(suKien) {
    suKien.preventDefault();
    const duLieu = Object.fromEntries(new FormData(suKien.currentTarget));
    datDangGui(true);
    datLoiChung('');
    datLoiTheoTruong({});
    try {
      await dangKy(duLieu);
      try {
        sessionStorage.setItem(KHOA_THONG_BAO_DANG_KY, 'Đăng ký thành công. Vui lòng đăng nhập.');
      } catch {
        // Không lưu được thông báo thì vẫn chuyển trang.
      }
      chuyenDenManHinh('01');
    } catch (loi) {
      const cacLoi = layLoiTheoTruong(loi);
      datLoiTheoTruong(cacLoi);
      datLoiChung(Object.keys(cacLoi).length ? 'Vui lòng nhập đầy đủ và đúng các thông tin bắt buộc.' : layThongDiepLoi(loi));
      datDangGui(false);
    }
  }

  return <div className="khung-noi-dung"><TieuDeTrang tieuDe="Đăng ký tài khoản" phuDe="Chọn vai trò phù hợp để bắt đầu sử dụng nền tảng." />
    <div className="luoi-tai-khoan luoi-dang-ky">
      <KhungNoiDung tieuDe="Thông tin tài khoản" className="khung-bieu-mau">
        <form onSubmit={xuLyGui} noValidate>
          <p className="mo-ta-phu">Tất cả các trường có dấu * là bắt buộc.</p>
          <ThongBao loai="loi">{loiChung}</ThongBao>
          <div className="luoi-truong-nhap">
            <TruongNhap nhan="Họ và tên" ten="fullName" autoComplete="name" batBuoc loi={loiTheoTruong.fullName} />
            <TruongNhap nhan="Số điện thoại" ten="phone" loaiTruong="tel" autoComplete="tel" batBuoc loi={loiTheoTruong.phone} />
            <TruongNhap nhan="Email" ten="email" loaiTruong="email" autoComplete="email" batBuoc rong loi={loiTheoTruong.email} />
            <TruongNhap nhan="Mật khẩu" ten="password" loaiTruong="password" autoComplete="new-password" batBuoc rong loi={loiTheoTruong.password} />
          </div>
          <fieldset className="lua-chon-vai-tro"><legend>Vai trò *</legend>
            <label><input type="radio" name="role" value="CUSTOMER" defaultChecked /> <span><strong>Khách hàng</strong><small>Tôi có nhu cầu sửa chữa tại nhà.</small></span></label>
            <label><input type="radio" name="role" value="TECHNICIAN" /> <span><strong>Kỹ thuật viên</strong><small>Tôi cung cấp dịch vụ sửa chữa.</small></span></label>
          </fieldset>
          {loiTheoTruong.role && <small className="loi-truong-nhap">{loiTheoTruong.role}</small>}
          <Nut loaiNut="submit" disabled={dangGui}>{dangGui ? 'Đang đăng ký…' : 'Đăng ký'}</Nut>
        </form>
        <div className="can-deu-hai-ben chan-dang-ky"><span>Bạn đã có tài khoản?</span><a className="lien-ket-van-ban" href={layDuongDanManHinh('01')}>Đăng nhập</a></div>
      </KhungNoiDung>
      <div className="cot-noi-dung">
        <KhungNoiDung tieuDe="Sau khi đăng ký"><ol className="cac-buoc"><li><strong>Tạo tài khoản</strong><span>Cung cấp các thông tin bắt buộc.</span></li><li><strong>Đăng nhập</strong><span>Sử dụng email và mật khẩu vừa tạo.</span></li><li><strong>Sử dụng đúng vai trò</strong><span>Khách hàng đăng tin; kỹ thuật viên gửi đề xuất.</span></li></ol></KhungNoiDung>
        <ThongBao>Không có lựa chọn đăng ký quản trị viên. Quyền quản trị không được tự cấp qua biểu mẫu này.</ThongBao>
      </div>
    </div>
  </div>;
}
