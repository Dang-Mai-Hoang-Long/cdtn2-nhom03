import React, { useEffect, useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, ThongBao, DangTai, TomTatYeuCau, NhanTrangThaiYeuCau } from '../../components/Ui.jsx';
import { layChiTietYeuCau } from '../../api/requestApi.js';
import { layThongDiepLoi } from '../../api/httpClient.js';
import { dinhDangThoiGian, dinhDangMaTin } from '../../utils/dinhDang.js';

export const KHOA_THONG_BAO_GUI_DE_XUAT = 'thongBaoGuiDeXuat';

function docThongBaoGuiDeXuat() {
  try {
    const thongDiep = sessionStorage.getItem(KHOA_THONG_BAO_GUI_DE_XUAT);
    sessionStorage.removeItem(KHOA_THONG_BAO_GUI_DE_XUAT);
    return thongDiep;
  } catch {
    return null;
  }
}

function TrangThaiDeXuatCuaToi({ yeuCau }) {
  if (yeuCau.myProposalStatus === 'ACCEPTED') {
    return <><ThongBao loai="thanh-cong">Khách hàng đã chọn đề xuất của bạn.</ThongBao><Nut maManHinhDich="13" thamSoDich={{ id: yeuCau.id }}>Xem công việc được chọn</Nut></>;
  }
  if (yeuCau.myProposalStatus === 'PENDING') return <ThongBao>Bạn đã gửi đề xuất cho tin này. Đang chờ khách hàng xem xét.</ThongBao>;
  if (yeuCau.canPropose) return <Nut maManHinhDich="11" thamSoDich={{ id: yeuCau.id }}>Gửi đề xuất</Nut>;
  if (yeuCau.myProposalStatus === 'REJECTED') return <ThongBao>Khách hàng đã chọn kỹ thuật viên khác cho tin này.</ThongBao>;
  return <ThongBao>Tin không còn ở trạng thái nhận đề xuất.</ThongBao>;
}

// US12: kỹ thuật viên xem chi tiết tin; chỉ gửi đề xuất được khi tin đang Chờ đề xuất (BR04).
export default function TrangChiTietTinKyThuatVien({ thamSo }) {
  const [yeuCau, datYeuCau] = useState(null);
  const [loi, datLoi] = useState('');
  const [thongBaoThanhCong] = useState(docThongBaoGuiDeXuat);

  useEffect(() => {
    layChiTietYeuCau(thamSo.id).then(datYeuCau).catch((loiGoi) => datLoi(layThongDiepLoi(loiGoi)));
  }, [thamSo.id]);

  if (!yeuCau) return <div className="khung-noi-dung">{loi ? <><ThongBao loai="loi">{loi}</ThongBao><Nut maManHinhDich="09" laNutPhu>Quay lại tìm việc</Nut></> : <DangTai />}</div>;

  return <div className="khung-noi-dung">
    <TieuDeTrang tieuDe={yeuCau.title} phuDe={`${dinhDangMaTin(yeuCau.id)} · Đăng lúc ${dinhDangThoiGian(yeuCau.createdAt)}`} hanhDong={<NhanTrangThaiYeuCau trangThai={yeuCau.status} />} />
    <ThongBao loai="thanh-cong">{thongBaoThanhCong}</ThongBao>
    <div className="hai-cot">
      <KhungNoiDung tieuDe="Chi tiết tin"><TomTatYeuCau yeuCau={yeuCau} /></KhungNoiDung>
      <div className="cot-noi-dung">
        <KhungNoiDung tieuDe="Bạn có thể thực hiện?">
          <div className="luoi-truong-nhap">
            <div><span className="nhan-mo-ta">Dịch vụ</span><strong>{yeuCau.category}</strong></div>
            <div><span className="nhan-mo-ta">Khu vực</span><strong>{yeuCau.location}</strong></div>
            <div className="truong-nhap-rong"><span className="nhan-mo-ta">Lịch mong muốn</span><strong>{dinhDangThoiGian(yeuCau.preferredTime)}</strong></div>
          </div>
          <TrangThaiDeXuatCuaToi yeuCau={yeuCau} />
          <Nut maManHinhDich="09" laNutPhu>Quay lại tìm việc</Nut>
        </KhungNoiDung>
        <ThongBao>Số điện thoại của khách hàng chỉ hiển thị cho kỹ thuật viên được chọn.</ThongBao>
      </div>
    </div>
  </div>;
}
