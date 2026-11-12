import React from 'react';
import { BieuMauDanhGia } from '../../components/ReviewForm.jsx';

// US18: khách hàng đánh giá kỹ thuật viên sau khi công việc hoàn thành.
export default function TrangDanhGiaKyThuatVien({ thamSo }) {
  return <BieuMauDanhGia doiTuongDanhGia="Kỹ thuật viên" thamSo={thamSo} />;
}
