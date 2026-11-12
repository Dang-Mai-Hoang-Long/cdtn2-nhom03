import React, { useEffect, useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, ThongBao, DangTai, NhanTrangThaiYeuCau } from '../../components/Ui.jsx';
import BieuMauDeXuat from '../../components/ProposalForm.jsx';
import { chuyenDenManHinh } from '../../navigation/screenRoutes.js';
import { layChiTietYeuCau } from '../../api/requestApi.js';
import { guiDeXuat } from '../../api/proposalApi.js';
import { layThongDiepLoi } from '../../api/httpClient.js';
import { dinhDangThoiGian, dinhDangMaTin } from '../../utils/dinhDang.js';
import { KHOA_THONG_BAO_GUI_DE_XUAT } from './RequestDetailPage.jsx';

// US13: gửi đề xuất (giá, nội dung, thời gian dự kiến). BR07/BR08 do backend kiểm tra và báo lỗi.
export default function TrangGuiDeXuat({ thamSo }) {
  const [yeuCau, datYeuCau] = useState(null);
  const [loi, datLoi] = useState('');

  useEffect(() => {
    layChiTietYeuCau(thamSo.id).then(datYeuCau).catch((loiGoi) => datLoi(layThongDiepLoi(loiGoi)));
  }, [thamSo.id]);

  function khiGuiThanhCong() {
    try {
      sessionStorage.setItem(KHOA_THONG_BAO_GUI_DE_XUAT, 'Gửi đề xuất thành công');
    } catch {
      // Bỏ qua.
    }
    chuyenDenManHinh('10', { id: yeuCau.id });
  }

  if (!yeuCau) return <div className="khung-noi-dung">{loi ? <ThongBao loai="loi">{loi}</ThongBao> : <DangTai />}</div>;

  return <div className="khung-noi-dung"><TieuDeTrang tieuDe="Gửi đề xuất sửa chữa" phuDe={`${dinhDangMaTin(yeuCau.id)} — ${yeuCau.title} · Các trường có dấu * là bắt buộc.`} />
    <div className="hai-cot">
      <KhungNoiDung tieuDe="Chi tiết đề xuất của bạn" className="khung-bieu-mau">
        {!yeuCau.canPropose && <ThongBao>{yeuCau.hasProposed ? 'Bạn đã gửi đề xuất cho tin này.' : 'Tin không còn nhận đề xuất.'}</ThongBao>}
        <BieuMauDeXuat
          guiDi={(duLieu) => guiDeXuat({ requestId: yeuCau.id, ...duLieu })}
          khiThanhCong={khiGuiThanhCong}
          nhanNutGui="Gửi đề xuất"
          voHieuHoa={!yeuCau.canPropose}
          nutHuy={<Nut maManHinhDich="10" thamSoDich={{ id: yeuCau.id }} laNutPhu>Hủy</Nut>}
        />
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
