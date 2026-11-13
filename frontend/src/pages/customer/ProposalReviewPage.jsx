import React, { useCallback, useEffect, useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, NhanTrangThai, ThongBao, DangTai } from '../../components/Ui.jsx';
import { layChiTietDeXuat, chapNhanDeXuat } from '../../api/proposalApi.js';
import { chuyenDenManHinh } from '../../navigation/screenRoutes.js';
import { layThongDiepLoi } from '../../api/httpClient.js';
import { dinhDangThoiGian, dinhDangMaTin, dinhDangTien, dinhDangDiem, NHAN_TRANG_THAI_DE_XUAT } from '../../utils/dinhDang.js';

// Lý do đề xuất không còn chọn được, theo trạng thái của đề xuất và của tin (BR10, BR12).
function lyDoKhongChonDuoc(deXuat) {
  if (deXuat.status === 'ACCEPTED') return 'Bạn đã chọn đề xuất này cho tin.';
  if (deXuat.status === 'REJECTED') return 'Đề xuất này không còn được chọn vì bạn đã chọn kỹ thuật viên khác.';
  if (deXuat.status === 'WITHDRAWN') return 'Kỹ thuật viên đã rút đề xuất này nên không thể chọn.';
  return 'Tin không còn nhận đề xuất nên không thể chọn thêm kỹ thuật viên.';
}

// US15 (BR09): chỉ chủ tin xem được chi tiết đề xuất. US16 (BR09, BR10): chấp nhận ngay tại đây khi còn được chọn.
export default function TrangXemDeXuat({ thamSo }) {
  const [deXuat, datDeXuat] = useState(null);
  const [loi, datLoi] = useState('');
  const [dangXuLy, datDangXuLy] = useState(false);

  const taiDuLieu = useCallback(async () => {
    try {
      datDeXuat(await layChiTietDeXuat(thamSo.id));
    } catch (loiGoi) {
      datLoi(layThongDiepLoi(loiGoi));
    }
  }, [thamSo.id]);

  useEffect(() => { taiDuLieu(); }, [taiDuLieu]);

  async function xuLyChapNhan() {
    const dongY = window.confirm(`Chấp nhận đề xuất ${dinhDangTien(deXuat.price)} của ${deXuat.technician.fullName}?\nTin sẽ chuyển sang "Đã chọn kỹ thuật viên" và các đề xuất khác không còn được chọn.`);
    if (!dongY) return;
    datDangXuLy(true);
    datLoi('');
    try {
      await chapNhanDeXuat(deXuat.id);
      chuyenDenManHinh('07', { id: deXuat.requestId });
    } catch (loiGoi) {
      datLoi(layThongDiepLoi(loiGoi));
      datDangXuLy(false);
      taiDuLieu();
    }
  }

  if (!deXuat) return <div className="khung-noi-dung">{loi ? <><ThongBao loai="loi">{loi}</ThongBao><Nut maManHinhDich="03" laNutPhu>Về Tin của tôi</Nut></> : <DangTai />}</div>;

  const choChonDuoc = deXuat.status === 'PENDING' && deXuat.request.status === 'WAITING_PROPOSAL';
  return <div className="khung-noi-dung">
    <TieuDeTrang tieuDe={`Đề xuất của ${deXuat.technician.fullName}`} phuDe={`Cho tin ${dinhDangMaTin(deXuat.request.id)} — ${deXuat.request.title}`} hanhDong={<NhanTrangThai sacThai={deXuat.status === 'ACCEPTED' ? 'nhan-dam' : ''}>{NHAN_TRANG_THAI_DE_XUAT[deXuat.status]}</NhanTrangThai>} />
    <ThongBao loai="loi">{loi}</ThongBao>
    <div className="hai-cot">
      <div className="cot-noi-dung">
        <KhungNoiDung tieuDe="Nội dung đề xuất">
          <div className="luoi-truong-nhap">
            <div><span className="nhan-mo-ta">Chi phí đề xuất</span><strong>{dinhDangTien(deXuat.price)}</strong></div>
            <div><span className="nhan-mo-ta">Thời gian dự kiến</span><strong>{deXuat.estimatedDuration || '—'}</strong></div>
            <div className="truong-nhap-rong"><span className="nhan-mo-ta">Nội dung thực hiện</span><p>{deXuat.description}</p></div>
            <div className="truong-nhap-rong"><span className="nhan-mo-ta">Thời gian gửi</span><strong>{dinhDangThoiGian(deXuat.createdAt)}</strong></div>
          </div>
        </KhungNoiDung>
        <KhungNoiDung tieuDe="Thông tin kỹ thuật viên">
          <div className="luoi-truong-nhap">
            <div><span className="nhan-mo-ta">Họ tên</span><strong>{deXuat.technician.fullName}</strong></div>
            <div><span className="nhan-mo-ta">Đánh giá</span><strong>{dinhDangDiem(deXuat.technician.ratingAvg)}</strong></div>
          </div>
        </KhungNoiDung>
      </div>
      <div className="cot-noi-dung">
        <KhungNoiDung tieuDe={choChonDuoc ? 'Chọn kỹ thuật viên này?' : 'Trạng thái lựa chọn'}>
          <p className="mo-ta-phu">Yêu cầu: {deXuat.request.title}</p>
          <div className="chi-phi-de-xuat gia-de-xuat-lon">{dinhDangTien(deXuat.price)}</div>
          {choChonDuoc
            ? <>
              <ThongBao>Bạn chỉ chọn được một kỹ thuật viên cho tin này. Sau khi chấp nhận, tin không còn sửa hay đóng được và hệ thống gửi thông báo cho kỹ thuật viên.</ThongBao>
              <Nut onClick={xuLyChapNhan} disabled={dangXuLy}>{dangXuLy ? 'Đang chấp nhận…' : 'Chấp nhận đề xuất'}</Nut>
            </>
            : <ThongBao>{lyDoKhongChonDuoc(deXuat)}</ThongBao>}
          <Nut maManHinhDich="05" thamSoDich={{ id: deXuat.request.id }} laNutPhu>Quay lại danh sách đề xuất</Nut>
        </KhungNoiDung>
      </div>
    </div>
  </div>;
}
