import React, { useEffect, useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, TruongNhap, ThongBao, DangTai, PhanTrang } from '../../components/Ui.jsx';
import BangNguoiDung from '../../components/UserTable.jsx';
import { layDanhSachTaiKhoan, khoaTaiKhoan, moKhoaTaiKhoan } from '../../api/adminApi.js';
import { layThongDiepLoi } from '../../api/httpClient.js';

const BO_LOC_TRONG = { q: '', role: '', status: '' };
const CAC_VAI_TRO = [{ giaTri: '', nhan: 'Tất cả vai trò' }, { giaTri: 'CUSTOMER', nhan: 'Khách hàng' }, { giaTri: 'TECHNICIAN', nhan: 'Kỹ thuật viên' }];
const CAC_TRANG_THAI = [{ giaTri: '', nhan: 'Tất cả trạng thái' }, { giaTri: 'ACTIVE', nhan: 'Hoạt động' }, { giaTri: 'LOCKED', nhan: 'Bị khóa' }];

// US04: quản trị viên tra cứu tài khoản Khách hàng và Kỹ thuật viên (BR01). US05: khóa / mở khóa có xác nhận;
// tài khoản bị khóa không đăng nhập được (BR02). Danh sách không gồm quản trị viên nên không thể tự khóa mình.
export default function TrangQuanLyTaiKhoan() {
  const [boLoc, datBoLoc] = useState(BO_LOC_TRONG);
  const [trang, datTrang] = useState(1);
  const [ketQua, datKetQua] = useState(null);
  const [loi, datLoi] = useState('');
  const [thanhCong, datThanhCong] = useState('');
  const [maDangXuLy, datMaDangXuLy] = useState(null);
  const [lanTai, datLanTai] = useState(0);
  const [phienBanBieuMau, datPhienBanBieuMau] = useState(0);

  useEffect(() => {
    let daHuy = false;
    layDanhSachTaiKhoan({ q: boLoc.q || undefined, role: boLoc.role || undefined, status: boLoc.status || undefined, page: trang, size: 10 })
      .then((duLieu) => !daHuy && datKetQua(duLieu))
      .catch((loiGoi) => !daHuy && datLoi(layThongDiepLoi(loiGoi)));
    return () => { daHuy = true; };
  }, [boLoc, trang, lanTai]);

  function xuLyTimKiem(suKien) {
    suKien.preventDefault();
    const duLieu = new FormData(suKien.currentTarget);
    datBoLoc({ q: String(duLieu.get('q')).trim(), role: String(duLieu.get('role')), status: String(duLieu.get('status')) });
    datTrang(1);
  }

  function datLai() {
    datBoLoc(BO_LOC_TRONG);
    datTrang(1);
    datPhienBanBieuMau((so) => so + 1);
  }

  async function xuLyDoiTrangThai(nguoiDung) {
    const khoa = !nguoiDung.isLocked;
    const dongY = window.confirm(khoa
      ? `Khóa tài khoản ${nguoiDung.fullName} (${nguoiDung.email})?\nNgười dùng này sẽ không đăng nhập được nữa.`
      : `Mở khóa tài khoản ${nguoiDung.fullName} (${nguoiDung.email})?\nNgười dùng này sẽ đăng nhập lại được.`);
    if (!dongY) return;
    datMaDangXuLy(nguoiDung.id);
    datLoi('');
    datThanhCong('');
    try {
      await (khoa ? khoaTaiKhoan : moKhoaTaiKhoan)(nguoiDung.id);
      datThanhCong(khoa ? 'Khóa tài khoản thành công' : 'Mở khóa tài khoản thành công');
    } catch (loiGoi) {
      datLoi(layThongDiepLoi(loiGoi));
    }
    datMaDangXuLy(null);
    datLanTai((so) => so + 1);
  }

  const tomTat = ketQua?.phanTrang.summary;
  return <div className="khung-noi-dung"><TieuDeTrang tieuDe="Quản lý tài khoản" phuDe="Tra cứu tài khoản khách hàng, kỹ thuật viên và kiểm soát quyền truy cập." />
    <KhungNoiDung className="bo-loc-tai-khoan">
      <form key={phienBanBieuMau} onSubmit={xuLyTimKiem}>
        <div className="luoi-truong-nhap cac-truong-quan-tri">
          <TruongNhap nhan="Tìm theo họ tên hoặc email" ten="q" giaTri="" />
          <TruongNhap nhan="Vai trò" ten="role" loaiTruong="select" giaTri="" cacLuaChon={CAC_VAI_TRO} />
          <TruongNhap nhan="Trạng thái" ten="status" loaiTruong="select" giaTri="" cacLuaChon={CAC_TRANG_THAI} />
          <Nut loaiNut="submit">Tìm kiếm</Nut>
          <Nut laNutPhu onClick={datLai}>Đặt lại</Nut>
        </div>
      </form>
    </KhungNoiDung>
    <ThongBao loai="thanh-cong">{thanhCong}</ThongBao>
    <ThongBao loai="loi">{loi}</ThongBao>
    {!ketQua && !loi && <DangTai />}
    {ketQua && <div className="can-deu-hai-ben so-luong-ket-qua"><strong>{ketQua.phanTrang.totalElements} tài khoản · {tomTat.active} hoạt động · {tomTat.locked} bị khóa</strong></div>}
    {ketQua && ketQua.danhSach.length === 0 && <ThongBao>Không tìm thấy tài khoản phù hợp</ThongBao>}
    {ketQua && ketQua.danhSach.length > 0 && <>
      <BangNguoiDung danhSach={ketQua.danhSach} maDangXuLy={maDangXuLy} onDoiTrangThai={xuLyDoiTrangThai} />
      <div className="chan-danh-sach"><span>Hiển thị {ketQua.danhSach.length}/{ketQua.phanTrang.totalElements} tài khoản</span><span>Trang {ketQua.phanTrang.page} / {Math.max(ketQua.phanTrang.totalPages, 1)}</span></div>
    </>}
    <PhanTrang phanTrang={ketQua?.phanTrang} onChuyenTrang={datTrang} />
  </div>;
}
