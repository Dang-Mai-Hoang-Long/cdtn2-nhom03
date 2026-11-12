import React, { useEffect, useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, NhanTrangThai, ThongBao, DangTai, TomTatYeuCau, TienTrinh, NhanTrangThaiYeuCau } from '../../components/Ui.jsx';
import { layChiTietYeuCau } from '../../api/requestApi.js';
import { layThongDiepLoi } from '../../api/httpClient.js';
import { dinhDangMaTin } from '../../utils/dinhDang.js';

// Màn hình 13: công việc kỹ thuật viên được chọn; liên hệ khách hàng chỉ có khi được chọn (BR15).
export default function TrangCongViecDuocChon({ thamSo }) {
  const chuaChonCongViec = !thamSo.id || thamSo.id === 'chon';
  const [yeuCau, datYeuCau] = useState(null);
  const [loi, datLoi] = useState('');

  useEffect(() => {
    if (chuaChonCongViec) return;
    layChiTietYeuCau(thamSo.id).then(datYeuCau).catch((loiGoi) => datLoi(layThongDiepLoi(loiGoi)));
  }, [thamSo.id, chuaChonCongViec]);

  if (chuaChonCongViec) {
    return <div className="khung-noi-dung"><TieuDeTrang tieuDe="Công việc được chọn" phuDe="Các công việc khách hàng đã chọn đề xuất của bạn." />
      <ThongBao>Mở công việc từ trang chi tiết tin khi đề xuất của bạn được chấp nhận. Danh sách thông báo và công việc sẽ có ở Sprint 3.</ThongBao>
      <Nut maManHinhDich="09" laNutPhu>Đến trang tìm việc</Nut>
    </div>;
  }
  if (!yeuCau) return <div className="khung-noi-dung">{loi ? <ThongBao loai="loi">{loi}</ThongBao> : <DangTai />}</div>;
  if (yeuCau.myProposalStatus !== 'ACCEPTED') {
    return <div className="khung-noi-dung"><TieuDeTrang tieuDe="Công việc được chọn" phuDe={`${dinhDangMaTin(yeuCau.id)} — ${yeuCau.title}`} />
      <ThongBao>Bạn chưa được chọn cho tin này.</ThongBao>
      <Nut maManHinhDich="10" thamSoDich={{ id: yeuCau.id }} laNutPhu>Xem chi tiết tin</Nut>
    </div>;
  }

  return <div className="khung-noi-dung">
    <TieuDeTrang tieuDe="Công việc được chọn" phuDe={`${dinhDangMaTin(yeuCau.id)} — ${yeuCau.title} · Đề xuất của bạn đã được chấp nhận.`} hanhDong={<NhanTrangThaiYeuCau trangThai={yeuCau.status} />} />
    {yeuCau.status === 'SELECTED' && <ThongBao>Chờ khách hàng xác nhận hoàn thành công việc.</ThongBao>}
    {yeuCau.status === 'COMPLETED' && <ThongBao loai="thanh-cong">{yeuCau.hasReviewed ? 'Khách hàng đã xác nhận hoàn thành công việc. Bạn đã đánh giá khách hàng.' : 'Khách hàng đã xác nhận hoàn thành công việc.'}</ThongBao>}
    {yeuCau.status === 'COMPLETED' && !yeuCau.hasReviewed && <div className="hang-nut"><Nut maManHinhDich="14" thamSoDich={{ id: yeuCau.id }}>Đánh giá khách hàng</Nut></div>}
    <div className="hai-cot">
      <KhungNoiDung tieuDe="Yêu cầu sửa chữa"><TomTatYeuCau yeuCau={yeuCau} /></KhungNoiDung>
      <div className="cot-noi-dung">
        <KhungNoiDung tieuDe="Liên hệ khách hàng">
          <NhanTrangThai sacThai="nhan-nhat">Chỉ hiển thị sau khi được chọn</NhanTrangThai>
          <dl className="danh-sach-vai-tro">
            <dt>Khách hàng</dt><dd>{yeuCau.customer.fullName}</dd>
            <dt>Số điện thoại</dt><dd>{yeuCau.customer.phone ?? '—'}</dd>
            <dt>Khu vực</dt><dd>{yeuCau.location}</dd>
          </dl>
        </KhungNoiDung>
        <KhungNoiDung tieuDe="Trạng thái công việc"><TienTrinh trangThai={yeuCau.status} /></KhungNoiDung>
      </div>
    </div>
  </div>;
}
