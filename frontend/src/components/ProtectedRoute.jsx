import React, { useEffect } from 'react';
import { chuyenDenManHinh, MAN_HINH_CHINH_THEO_VAI_TRO, VAI_TRO_THEO_NHOM } from '../navigation/screenRoutes.js';

// BR01 phía giao diện: chưa đăng nhập về trang đăng nhập; sai vai trò về trang chính của vai trò mình.
// Backend vẫn kiểm tra lại quyền ở mọi API.
export default function TuyenDuocBaoVe({ manHinh, phien, children }) {
  const vaiTroCanCo = VAI_TRO_THEO_NHOM[manHinh.nhomVaiTro];
  const laTrangTaiKhoan = !vaiTroCanCo;
  let maManHinhChuyenDen = null;
  if (laTrangTaiKhoan && phien) maManHinhChuyenDen = MAN_HINH_CHINH_THEO_VAI_TRO[phien.user.role];
  else if (!laTrangTaiKhoan && !phien) maManHinhChuyenDen = '01';
  else if (!laTrangTaiKhoan && phien.user.role !== vaiTroCanCo) maManHinhChuyenDen = MAN_HINH_CHINH_THEO_VAI_TRO[phien.user.role];

  useEffect(() => {
    if (maManHinhChuyenDen) chuyenDenManHinh(maManHinhChuyenDen);
  }, [maManHinhChuyenDen]);

  return maManHinhChuyenDen ? null : children;
}
