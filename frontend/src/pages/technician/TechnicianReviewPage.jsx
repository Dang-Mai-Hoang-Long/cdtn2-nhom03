import React from 'react';
import { BieuMauDanhGia } from '../../components/ReviewForm.jsx';

// US19: kỹ thuật viên được chọn đánh giá khách hàng sau khi công việc hoàn thành.
export default function TrangDanhGiaKhachHang({ thamSo }) {
  return <BieuMauDanhGia doiTuongDanhGia="Khách hàng" thamSo={thamSo} />;
}
