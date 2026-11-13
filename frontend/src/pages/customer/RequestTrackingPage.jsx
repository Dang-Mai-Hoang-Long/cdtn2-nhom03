import React, { useCallback, useEffect, useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, NhanTrangThai, ThongBao, DangTai, TomTatYeuCau, TienTrinh, NhanTrangThaiYeuCau } from '../../components/Ui.jsx';
import { layChiTietYeuCau, xacNhanHoanThanh } from '../../api/requestApi.js';
import { layDanhSachDeXuatCuaYeuCau } from '../../api/proposalApi.js';
import { layThongDiepLoi } from '../../api/httpClient.js';
import { dinhDangThoiGian, dinhDangMaTin, dinhDangTien, NHAN_TRANG_THAI_DE_XUAT } from '../../utils/dinhDang.js';

// US17: khách hàng theo dõi công việc đã chọn kỹ thuật viên và xác nhận hoàn thành.
export default function TrangTheoDoiYeuCau({ thamSo }) {
  const [yeuCau, datYeuCau] = useState(null);
  const [danhSachDeXuat, datDanhSachDeXuat] = useState([]);
  const [loi, datLoi] = useState('');
  const [thanhCong, datThanhCong] = useState('');
  const [dangGui, datDangGui] = useState(false);

  const taiDuLieu = useCallback(async () => {
    try {
      const [chiTiet, deXuat] = await Promise.all([layChiTietYeuCau(thamSo.id), layDanhSachDeXuatCuaYeuCau(thamSo.id)]);
      datYeuCau(chiTiet);
      datDanhSachDeXuat(deXuat);
    } catch (loiGoi) {
      datLoi(layThongDiepLoi(loiGoi));
    }
  }, [thamSo.id]);

  useEffect(() => { taiDuLieu(); }, [taiDuLieu]);

  async function xuLyXacNhan() {
    if (!window.confirm('Xác nhận công việc đã hoàn thành?\nTin sẽ chuyển sang trạng thái "Hoàn thành".')) return;
    datDangGui(true);
    datLoi('');
    try {
      await xacNhanHoanThanh(yeuCau.id);
      datThanhCong('Xác nhận hoàn thành thành công');
      await taiDuLieu();
    } catch (loiGoi) {
      datLoi(layThongDiepLoi(loiGoi));
    }
    datDangGui(false);
  }

  if (!yeuCau) return <div className="khung-noi-dung">{loi ? <ThongBao loai="loi">{loi}</ThongBao> : <DangTai />}</div>;

  const deXuatDuocChon = danhSachDeXuat.find((deXuat) => deXuat.id === yeuCau.selectedProposalId);
  const cacDeXuatKhac = danhSachDeXuat.filter((deXuat) => deXuat.id !== yeuCau.selectedProposalId);
  return <div className="khung-noi-dung">
    <TieuDeTrang tieuDe={yeuCau.title} phuDe={`${dinhDangMaTin(yeuCau.id)} · Tạo ngày ${dinhDangThoiGian(yeuCau.createdAt)}`} hanhDong={<NhanTrangThaiYeuCau trangThai={yeuCau.status} />} />
    <TienTrinh trangThai={yeuCau.status} />
    <ThongBao loai="thanh-cong">{thanhCong}</ThongBao>
    <ThongBao loai="loi">{loi}</ThongBao>
    {yeuCau.status === 'WAITING_PROPOSAL' && <ThongBao>Tin chưa chọn kỹ thuật viên. <a className="lien-ket-van-ban" href={`#/customer/requests/${yeuCau.id}`}>Xem các đề xuất</a></ThongBao>}
    <div className="hai-cot">
      <KhungNoiDung tieuDe="Thông tin yêu cầu"><TomTatYeuCau yeuCau={yeuCau} /></KhungNoiDung>
      <div className="cot-noi-dung">
        {deXuatDuocChon && <KhungNoiDung tieuDe="Đề xuất đã chấp nhận">
          <div className="dau-the-de-xuat"><strong>{deXuatDuocChon.technician.fullName}</strong><NhanTrangThai sacThai="nhan-dam">Đã chấp nhận</NhanTrangThai></div>
          <div className="luoi-truong-nhap cach-tren">
            <div><span className="nhan-mo-ta">Chi phí đề xuất</span><strong>{dinhDangTien(deXuatDuocChon.price)}</strong></div>
            <div><span className="nhan-mo-ta">Thời gian dự kiến</span><strong>{deXuatDuocChon.estimatedDuration || '—'}</strong></div>
            <div className="truong-nhap-rong"><span className="nhan-mo-ta">Phạm vi công việc</span><p>{deXuatDuocChon.description}</p></div>
          </div>
          {yeuCau.status === 'SELECTED' && <Nut onClick={xuLyXacNhan} disabled={dangGui}>{dangGui ? 'Đang xác nhận…' : 'Xác nhận hoàn thành'}</Nut>}
          {yeuCau.status === 'COMPLETED' && <ThongBao loai="thanh-cong">{yeuCau.hasReviewed ? 'Công việc đã hoàn thành. Bạn đã đánh giá kỹ thuật viên.' : 'Công việc đã hoàn thành.'}</ThongBao>}
          {yeuCau.status === 'COMPLETED' && !yeuCau.hasReviewed && <Nut maManHinhDich="08" thamSoDich={{ id: yeuCau.id }}>Đánh giá kỹ thuật viên</Nut>}
        </KhungNoiDung>}
        {cacDeXuatKhac.length > 0 && <KhungNoiDung tieuDe="Các đề xuất khác">{cacDeXuatKhac.map((deXuat) => <div className="de-xuat-thu-gon" key={deXuat.id}><strong>{deXuat.technician.fullName} · {dinhDangTien(deXuat.price)}</strong><NhanTrangThai>{NHAN_TRANG_THAI_DE_XUAT[deXuat.status]}</NhanTrangThai></div>)}</KhungNoiDung>}
      </div>
    </div>
  </div>;
}
