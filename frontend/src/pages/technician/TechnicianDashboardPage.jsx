import React, { useEffect, useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, NhanTrangThai, ThongBao, DangTai, TomTatYeuCau, TienTrinh, NhanTrangThaiYeuCau } from '../../components/Ui.jsx';
import { layChiTietYeuCau } from '../../api/requestApi.js';
import { layDanhSachDeXuatCuaToi } from '../../api/proposalApi.js';
import { layDuongDanManHinh } from '../../navigation/screenRoutes.js';
import { layThongDiepLoi } from '../../api/httpClient.js';
import { dinhDangMaTin, dinhDangTien, dinhDangThoiGian } from '../../utils/dinhDang.js';

// Danh sách công việc kỹ thuật viên đã được chọn: chính là các đề xuất của mình ở trạng thái Đã chấp nhận.
function DanhSachCongViecDuocChon() {
  const [ketQua, datKetQua] = useState(null);
  const [loi, datLoi] = useState('');

  useEffect(() => {
    layDanhSachDeXuatCuaToi({ status: 'ACCEPTED', size: 50 }).then(datKetQua).catch((loiGoi) => datLoi(layThongDiepLoi(loiGoi)));
  }, []);

  return <div className="khung-noi-dung"><TieuDeTrang tieuDe="Công việc được chọn" phuDe="Các công việc khách hàng đã chọn đề xuất của bạn." />
    <ThongBao loai="loi">{loi}</ThongBao>
    {!ketQua && !loi && <DangTai />}
    {ketQua && ketQua.danhSach.length === 0 && <ThongBao>Bạn chưa được khách hàng chọn cho công việc nào. Gửi đề xuất ở trang tìm việc để có công việc.</ThongBao>}
    <div className="cot-noi-dung">{ketQua?.danhSach.map((deXuat) => <KhungNoiDung key={deXuat.id}>
      <div className="dau-the-de-xuat">
        <div><strong>{dinhDangMaTin(deXuat.request.id)} · {deXuat.request.title}</strong><span>{deXuat.request.category} · {deXuat.request.location} · Chọn lúc {dinhDangThoiGian(deXuat.createdAt)}</span></div>
        <strong className="chi-phi-de-xuat">{dinhDangTien(deXuat.price)}</strong>
      </div>
      <div className="can-deu-hai-ben"><NhanTrangThaiYeuCau trangThai={deXuat.request.status} /><a className="nut" href={layDuongDanManHinh('13', { id: deXuat.request.id })}>Xem công việc</a></div>
    </KhungNoiDung>)}</div>
    <Nut maManHinhDich="09" laNutPhu>Đến trang tìm việc</Nut>
  </div>;
}

// Màn hình 13: công việc kỹ thuật viên được chọn; liên hệ khách hàng chỉ có khi được chọn (BR15).
export default function TrangCongViecDuocChon({ thamSo }) {
  const chuaChonCongViec = !thamSo.id || thamSo.id === 'chon';
  const [yeuCau, datYeuCau] = useState(null);
  const [loi, datLoi] = useState('');

  useEffect(() => {
    if (chuaChonCongViec) return;
    layChiTietYeuCau(thamSo.id).then(datYeuCau).catch((loiGoi) => datLoi(layThongDiepLoi(loiGoi)));
  }, [thamSo.id, chuaChonCongViec]);

  if (chuaChonCongViec) return <DanhSachCongViecDuocChon />;
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
