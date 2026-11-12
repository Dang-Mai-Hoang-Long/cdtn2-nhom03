import React, { useEffect, useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, ThongBao, DangTai } from '../../components/Ui.jsx';
import BieuMauYeuCau from '../../components/RequestForm.jsx';
import { layChiTietYeuCau } from '../../api/requestApi.js';
import { layThongDiepLoi } from '../../api/httpClient.js';
import { dinhDangMaTin } from '../../utils/dinhDang.js';

// US21 (BR03, BR06): chỉ chủ tin sửa được và chỉ khi tin còn Chờ đề xuất. Backend vẫn kiểm tra lại khi lưu.
export default function TrangSuaYeuCau({ thamSo }) {
  const [yeuCau, datYeuCau] = useState(null);
  const [loi, datLoi] = useState('');

  useEffect(() => {
    layChiTietYeuCau(thamSo.id).then(datYeuCau).catch((loiGoi) => datLoi(layThongDiepLoi(loiGoi)));
  }, [thamSo.id]);

  if (!yeuCau) {
    return <div className="khung-noi-dung">{loi ? <><ThongBao loai="loi">{loi}</ThongBao><Nut maManHinhDich="03" laNutPhu>Về Tin của tôi</Nut></> : <DangTai />}</div>;
  }
  if (yeuCau.status !== 'WAITING_PROPOSAL') {
    return <div className="khung-noi-dung"><TieuDeTrang tieuDe="Sửa tin sửa chữa" phuDe={`${dinhDangMaTin(yeuCau.id)} — ${yeuCau.title}`} />
      <ThongBao>Chỉ sửa được tin đang chờ đề xuất. Tin đã chọn kỹ thuật viên hoặc đã đóng không còn chỉnh sửa được.</ThongBao>
      <Nut maManHinhDich="05" thamSoDich={{ id: yeuCau.id }} laNutPhu>Quay lại tin</Nut>
    </div>;
  }

  return <div className="khung-noi-dung"><TieuDeTrang tieuDe="Sửa tin sửa chữa" phuDe={`${dinhDangMaTin(yeuCau.id)} · Các trường có dấu * là bắt buộc.`} />
    <div className="hai-cot">
      <KhungNoiDung tieuDe="Thông tin cần sửa chữa" className="khung-bieu-mau"><BieuMauYeuCau yeuCauCu={yeuCau} /></KhungNoiDung>
      <div className="cot-noi-dung">
        <ThongBao>Chỉ sửa được khi tin chưa chọn kỹ thuật viên. Kỹ thuật viên đã gửi đề xuất sẽ thấy thông tin mới của tin.</ThongBao>
      </div>
    </div>
  </div>;
}
