import React, { useEffect, useState } from 'react';
import { KhungUngDung } from '../components/AppLayout.jsx';
import TuyenDuocBaoVe from '../components/ProtectedRoute.jsx';
import { timManHinhTheoDuongDan } from '../navigation/screenRoutes.js';
import { layPhienDangNhap, theoDoiPhienDangNhap } from '../api/phienDangNhap.js';
import TrangDangNhap from '../pages/shared/LoginPage.jsx';
import TrangDangKy from '../pages/shared/RegisterPage.jsx';
import TrangKhongTimThay from '../pages/shared/NotFoundPage.jsx';
import TrangTinCuaToi from '../pages/customer/MyRequestsPage.jsx';
import TrangTaoYeuCau from '../pages/customer/RequestCreatePage.jsx';
import TrangChiTietYeuCau from '../pages/customer/RequestDetailPage.jsx';
import TrangXemDeXuat from '../pages/customer/ProposalReviewPage.jsx';
import TrangTheoDoiYeuCau from '../pages/customer/RequestTrackingPage.jsx';
import TrangSuaYeuCau from '../pages/customer/RequestEditPage.jsx';
import TrangDanhGiaKyThuatVien from '../pages/customer/CustomerReviewPage.jsx';
import TrangTimYeuCau from '../pages/technician/RequestSearchPage.jsx';
import TrangChiTietTinKyThuatVien from '../pages/technician/RequestDetailPage.jsx';
import TrangGuiDeXuat from '../pages/technician/ProposalCreatePage.jsx';
import TrangDeXuatCuaToi from '../pages/technician/MyProposalsPage.jsx';
import TrangSuaDeXuat from '../pages/technician/ProposalEditPage.jsx';
import TrangCongViecDuocChon from '../pages/technician/TechnicianDashboardPage.jsx';
import TrangDanhGiaKhachHang from '../pages/technician/TechnicianReviewPage.jsx';
import TrangQuanLyTaiKhoan from '../pages/admin/UserManagementPage.jsx';

const trangTheoMaManHinh = {
  '01': TrangDangNhap,
  '02': TrangDangKy,
  '03': TrangTinCuaToi,
  '04': TrangTaoYeuCau,
  '05': TrangChiTietYeuCau,
  '06': TrangXemDeXuat,
  '07': TrangTheoDoiYeuCau,
  '08': TrangDanhGiaKyThuatVien,
  '09': TrangTimYeuCau,
  '10': TrangChiTietTinKyThuatVien,
  '11': TrangGuiDeXuat,
  '12': TrangDeXuatCuaToi,
  '13': TrangCongViecDuocChon,
  '14': TrangDanhGiaKhachHang,
  '16': TrangQuanLyTaiKhoan,
  '17': TrangSuaYeuCau,
  '18': TrangSuaDeXuat,
};

function docViTriHienTai() {
  const duongDan = window.location.hash.replace(/^#\/?/, '');
  if (duongDan === '') return { manHinh: timManHinhTheoDuongDan('login').manHinh, thamSo: {} };
  return timManHinhTheoDuongDan(duongDan);
}

export function DieuHuongUngDung() {
  const [viTri, datViTri] = useState(docViTriHienTai);
  const [phien, datPhien] = useState(layPhienDangNhap);

  useEffect(() => {
    const dongBoTheoDuongDan = () => {
      datViTri(docViTriHienTai());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', dongBoTheoDuongDan);
    const huyTheoDoi = theoDoiPhienDangNhap(datPhien);
    return () => {
      window.removeEventListener('hashchange', dongBoTheoDuongDan);
      huyTheoDoi();
    };
  }, []);

  if (!viTri) return <KhungUngDung phien={phien}><TrangKhongTimThay /></KhungUngDung>;
  const { manHinh, thamSo } = viTri;
  const TrangHienThi = trangTheoMaManHinh[manHinh.maManHinh] ?? TrangKhongTimThay;
  return <KhungUngDung manHinh={manHinh} phien={phien}>
    <TuyenDuocBaoVe manHinh={manHinh} phien={phien}>
      <TrangHienThi key={window.location.hash} thamSo={thamSo} phien={phien} />
    </TuyenDuocBaoVe>
  </KhungUngDung>;
}
