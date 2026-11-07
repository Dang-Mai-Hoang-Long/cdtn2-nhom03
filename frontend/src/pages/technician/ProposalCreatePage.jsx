import React, { useEffect, useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, TruongNhap, ThongBao, DangTai, NhanTrangThaiYeuCau } from '../../components/Ui.jsx';
import { chuyenDenManHinh } from '../../navigation/screenRoutes.js';
import { layChiTietYeuCau } from '../../api/requestApi.js';
import { guiDeXuat } from '../../api/proposalApi.js';
import { layThongDiepLoi, layLoiTheoTruong } from '../../api/httpClient.js';
import { dinhDangThoiGian, dinhDangMaTin } from '../../utils/dinhDang.js';
import { KHOA_THONG_BAO_GUI_DE_XUAT } from './RequestDetailPage.jsx';

// US13: gửi đề xuất (giá, nội dung, thời gian dự kiến). BR07/BR08 do backend kiểm tra và báo lỗi.
export default function TrangGuiDeXuat({ thamSo }) {
  const [yeuCau, datYeuCau] = useState(null);
  const [loiChung, datLoiChung] = useState('');
  const [loiTheoTruong, datLoiTheoTruong] = useState({});
  const [dangGui, datDangGui] = useState(false);

  useEffect(() => {
    layChiTietYeuCau(thamSo.id).then(datYeuCau).catch((loiGoi) => datLoiChung(layThongDiepLoi(loiGoi)));
  }, [thamSo.id]);

  async function xuLyGui(suKien) {
    suKien.preventDefault();
    const duLieu = Object.fromEntries(new FormData(suKien.currentTarget));
    const giaDeXuat = duLieu.price.replace(/[.,\s]/g, '');
    datDangGui(true);
    datLoiChung('');
    datLoiTheoTruong({});
    try {
      await guiDeXuat({
        requestId: yeuCau.id,
        price: giaDeXuat === '' ? null : Number(giaDeXuat),
        description: duLieu.description,
        estimatedDuration: duLieu.estimatedDuration.trim() || undefined,
      });
      try {
        sessionStorage.setItem(KHOA_THONG_BAO_GUI_DE_XUAT, 'Gửi đề xuất thành công');
      } catch {
        // Bỏ qua.
      }
      chuyenDenManHinh('10', { id: yeuCau.id });
    } catch (loi) {
      const cacLoi = layLoiTheoTruong(loi);
      datLoiTheoTruong(cacLoi);
      datLoiChung(Object.keys(cacLoi).length ? 'Vui lòng kiểm tra lại các thông tin bắt buộc.' : layThongDiepLoi(loi));
      datDangGui(false);
    }
  }

  if (!yeuCau) return <div className="khung-noi-dung">{loiChung ? <ThongBao loai="loi">{loiChung}</ThongBao> : <DangTai />}</div>;

  return <div className="khung-noi-dung"><TieuDeTrang tieuDe="Gửi đề xuất sửa chữa" phuDe={`${dinhDangMaTin(yeuCau.id)} — ${yeuCau.title} · Các trường có dấu * là bắt buộc.`} />
    <div className="hai-cot">
      <KhungNoiDung tieuDe="Chi tiết đề xuất của bạn" className="khung-bieu-mau">
        <form onSubmit={xuLyGui} noValidate>
          <ThongBao loai="loi">{loiChung}</ThongBao>
          {!yeuCau.canPropose && <ThongBao>{yeuCau.hasProposed ? 'Bạn đã gửi đề xuất cho tin này.' : 'Tin không còn nhận đề xuất.'}</ThongBao>}
          <TruongNhap nhan="Chi phí đề xuất (VND)" ten="price" inputMode="numeric" placeholder="Ví dụ: 450000" batBuoc loi={loiTheoTruong.price} />
          <TruongNhap nhan="Nội dung phạm vi thực hiện" ten="description" laVungVanBan batBuoc loi={loiTheoTruong.description} />
          <TruongNhap nhan="Thời gian dự kiến" ten="estimatedDuration" maxLength={50} placeholder="Ví dụ: 2-3 giờ" loi={loiTheoTruong.estimatedDuration} />
          <div className="hang-nut"><Nut loaiNut="submit" disabled={dangGui || !yeuCau.canPropose}>{dangGui ? 'Đang gửi…' : 'Gửi đề xuất'}</Nut><Nut maManHinhDich="10" thamSoDich={{ id: yeuCau.id }} laNutPhu>Hủy</Nut></div>
        </form>
      </KhungNoiDung>
      <div className="cot-noi-dung">
        <KhungNoiDung tieuDe="Tin bạn đang đề xuất">
          <NhanTrangThaiYeuCau trangThai={yeuCau.status} />
          <h3>{dinhDangMaTin(yeuCau.id)} · {yeuCau.title}</h3>
          <div className="luoi-truong-nhap">
            <div><span className="nhan-mo-ta">Yêu cầu</span><strong>{yeuCau.category}</strong></div>
            <div><span className="nhan-mo-ta">Khu vực</span><strong>{yeuCau.location}</strong></div>
            <div className="truong-nhap-rong"><span className="nhan-mo-ta">Thời gian mong muốn</span><strong>{dinhDangThoiGian(yeuCau.preferredTime)}</strong></div>
          </div>
        </KhungNoiDung>
        <ThongBao>Mỗi kỹ thuật viên chỉ có thể gửi một đề xuất đang hiệu lực cho cùng một tin.</ThongBao>
      </div>
    </div>
  </div>;
}
