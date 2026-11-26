import React, { useEffect } from 'react';
import { chuyenDenManHinh, MAN_HINH_CHINH_THEO_VAI_TRO, VAI_TRO_THEO_NHOM, NHOM_MOI_VAI_TRO } from '../navigation/screenRoutes.js';

// BR01 phía giao diện: chưa đăng nhập về trang đăng nhập; sai vai trò về trang chính của vai trò mình.
// Màn hình dùng chung (NHOM_MOI_VAI_TRO) chỉ cần đã đăng nhập. Backend vẫn kiểm tra lại quyền ở mọi API.
export default function TuyenDuocBaoVe({ manHinh, phien, children }) {
  const vaiTroCanCo = VAI_TRO_THEO_NHOM[manHinh.nhomVaiTro];
  const laManHinhDungChung = manHinh.nhomVaiTro === NHOM_MOI_VAI_TRO;
  const laTrangTaiKhoan = !vaiTroCanCo && !laManHinhDungChung;
  let maManHinhChuyenDen = null;
  if (laManHinhDungChung) maManHinhChuyenDen = phien ? null : '01';
  else if (laTrangTaiKhoan && phien) maManHinhChuyenDen = MAN_HINH_CHINH_THEO_VAI_TRO[phien.user.role];
  else if (!laTrangTaiKhoan && !phien) maManHinhChuyenDen = '01';
  else if (!laTrangTaiKhoan && phien.user.role !== vaiTroCanCo) maManHinhChuyenDen = MAN_HINH_CHINH_THEO_VAI_TRO[phien.user.role];

  useEffect(() => {
    if (maManHinhChuyenDen) chuyenDenManHinh(maManHinhChuyenDen);
  }, [maManHinhChuyenDen]);

  return maManHinhChuyenDen ? null : children;
}
