import React, { useEffect, useState } from 'react';
import { KhungUngDung } from '../components/AppLayout.jsx';
import { danhSachManHinh } from '../navigation/screenRoutes.js';
import TrangDangNhap from '../pages/shared/LoginPage.jsx';
import TrangDangKy from '../pages/shared/RegisterPage.jsx';
import TrangTinCuaToi from '../pages/customer/MyRequestsPage.jsx';
import TrangTaoYeuCau from '../pages/customer/RequestCreatePage.jsx';
import TrangChiTietYeuCau from '../pages/customer/RequestDetailPage.jsx';
import TrangXemDeXuat from '../pages/customer/ProposalReviewPage.jsx';
import TrangTheoDoiYeuCau from '../pages/customer/RequestTrackingPage.jsx';
import TrangDanhGiaKyThuatVien from '../pages/customer/CustomerReviewPage.jsx';
import TrangTimYeuCau from '../pages/technician/RequestSearchPage.jsx';
import TrangChiTietTinKyThuatVien from '../pages/technician/RequestDetailPage.jsx';
import TrangGuiDeXuat from '../pages/technician/ProposalCreatePage.jsx';
import TrangDeXuatCuaToi from '../pages/technician/MyProposalsPage.jsx';
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
};

function docManHinhTheoDuongDan() {
  const duongDanHienTai = window.location.hash.replace(/^#\/?/, '');
  return danhSachManHinh.find((manHinh) => manHinh.duongDan === duongDanHienTai || manHinh.maManHinh === duongDanHienTai)?.maManHinh ?? '01';
}

export function DieuHuongUngDung() {
  const [maManHinh, datMaManHinh] = useState(docManHinhTheoDuongDan);
  useEffect(() => {
    const dongBoManHinhTheoDuongDan = () => datMaManHinh(docManHinhTheoDuongDan());
    window.addEventListener('hashchange', dongBoManHinhTheoDuongDan);
    return () => window.removeEventListener('hashchange', dongBoManHinhTheoDuongDan);
  }, []);

  const manHinh = danhSachManHinh.find((banGhi) => banGhi.maManHinh === maManHinh) ?? danhSachManHinh[0];
  const TrangHienThi = trangTheoMaManHinh[manHinh.maManHinh] ?? TrangDangNhap;
  return <KhungUngDung manHinh={manHinh}><TrangHienThi /></KhungUngDung>;
}
