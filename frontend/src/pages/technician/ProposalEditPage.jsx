import React, { useEffect, useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, ThongBao, DangTai } from '../../components/Ui.jsx';
import BieuMauDeXuat from '../../components/ProposalForm.jsx';
import { layChiTietDeXuat, suaDeXuat } from '../../api/proposalApi.js';
import { chuyenDenManHinh } from '../../navigation/screenRoutes.js';
import { layThongDiepLoi } from '../../api/httpClient.js';
import { dinhDangMaTin } from '../../utils/dinhDang.js';
import { KHOA_THONG_BAO_DE_XUAT_CUA_TOI } from './MyProposalsPage.jsx';

// Lý do không sửa được theo trạng thái của đề xuất và của tin; null nghĩa là được sửa.
function lyDoKhongSuaDuoc(deXuat) {
  if (deXuat.status === 'ACCEPTED') return 'Đề xuất đã được khách hàng chấp nhận nên không sửa được.';
  if (deXuat.status === 'REJECTED') return 'Khách hàng đã chọn kỹ thuật viên khác nên đề xuất này không sửa được.';
  if (deXuat.status === 'WITHDRAWN') return 'Đề xuất đã rút nên không sửa được.';
  if (deXuat.request.status !== 'WAITING_PROPOSAL') return 'Tin không còn nhận đề xuất nên không sửa được.';
  return null;
}

// US22: chỉ kỹ thuật viên gửi đề xuất mới sửa được, và chỉ khi đề xuất còn chờ và tin còn nhận đề xuất.
// Backend vẫn kiểm tra lại khi lưu (PROPOSAL_NOT_EDITABLE, NOT_OWNER...).
export default function TrangSuaDeXuat({ thamSo }) {
  const [deXuat, datDeXuat] = useState(null);
  const [loi, datLoi] = useState('');

  useEffect(() => {
    layChiTietDeXuat(thamSo.id).then(datDeXuat).catch((loiGoi) => datLoi(layThongDiepLoi(loiGoi)));
  }, [thamSo.id]);

  function khiLuuThanhCong() {
    try {
      sessionStorage.setItem(KHOA_THONG_BAO_DE_XUAT_CUA_TOI, 'Chỉnh sửa đề xuất thành công');
    } catch {
      // Bỏ qua.
    }
    chuyenDenManHinh('12');
  }

  if (!deXuat) {
    return <div className="khung-noi-dung">{loi ? <><ThongBao loai="loi">{loi}</ThongBao><Nut maManHinhDich="12" laNutPhu>Về Đề xuất của tôi</Nut></> : <DangTai />}</div>;
  }
  const lyDo = lyDoKhongSuaDuoc(deXuat);
  const phuDe = `${dinhDangMaTin(deXuat.request.id)} — ${deXuat.request.title}`;
  if (lyDo) {
    return <div className="khung-noi-dung"><TieuDeTrang tieuDe="Sửa đề xuất" phuDe={phuDe} />
      <ThongBao>{lyDo}</ThongBao>
      <Nut maManHinhDich="12" laNutPhu>Về Đề xuất của tôi</Nut>
    </div>;
  }

  return <div className="khung-noi-dung"><TieuDeTrang tieuDe="Sửa đề xuất" phuDe={`${phuDe} · Các trường có dấu * là bắt buộc.`} />
    <div className="hai-cot">
      <KhungNoiDung tieuDe="Chi tiết đề xuất của bạn" className="khung-bieu-mau">
        <BieuMauDeXuat
          giaTriBanDau={{ price: String(deXuat.price), description: deXuat.description, estimatedDuration: deXuat.estimatedDuration }}
          guiDi={(duLieu) => suaDeXuat(deXuat.id, duLieu)}
          khiThanhCong={khiLuuThanhCong}
          nhanNutGui="Lưu thay đổi"
          nutHuy={<Nut maManHinhDich="12" laNutPhu>Hủy</Nut>}
        />
      </KhungNoiDung>
      <div className="cot-noi-dung">
        <ThongBao>Chỉ sửa được khi khách hàng chưa chấp nhận đề xuất và tin còn nhận đề xuất.</ThongBao>
      </div>
    </div>
  </div>;
}
