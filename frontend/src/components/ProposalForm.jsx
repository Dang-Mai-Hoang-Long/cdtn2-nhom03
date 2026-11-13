import React, { useState } from 'react';
import { Nut, TruongNhap, ThongBao } from './Ui.jsx';
import { layThongDiepLoi, layLoiTheoTruong } from '../api/httpClient.js';

// Biểu mẫu đề xuất dùng chung cho gửi mới (US13) và sửa (US22). BR07, BR08 và điều kiện sửa do backend kiểm tra và báo lỗi.
// guiDi({ price, description, estimatedDuration }): gọi API, ném lỗi nếu thất bại; khiThanhCong(): điều hướng sau khi lưu.
export default function BieuMauDeXuat({ giaTriBanDau = {}, guiDi, khiThanhCong, nhanNutGui, nutHuy, voHieuHoa = false }) {
  const [loiChung, datLoiChung] = useState('');
  const [loiTheoTruong, datLoiTheoTruong] = useState({});
  const [dangGui, datDangGui] = useState(false);

  async function xuLyGui(suKien) {
    suKien.preventDefault();
    const duLieu = Object.fromEntries(new FormData(suKien.currentTarget));
    const giaDeXuat = duLieu.price.replace(/[.,\s]/g, '');
    datDangGui(true);
    datLoiChung('');
    datLoiTheoTruong({});
    try {
      await guiDi({
        price: giaDeXuat === '' ? null : Number(giaDeXuat),
        description: duLieu.description,
        estimatedDuration: duLieu.estimatedDuration.trim(),
      });
      khiThanhCong();
    } catch (loi) {
      const cacLoi = layLoiTheoTruong(loi);
      datLoiTheoTruong(cacLoi);
      datLoiChung(Object.keys(cacLoi).length ? 'Vui lòng kiểm tra lại các thông tin bắt buộc.' : layThongDiepLoi(loi));
      datDangGui(false);
    }
  }

  return <form onSubmit={xuLyGui} noValidate>
    <ThongBao loai="loi">{loiChung}</ThongBao>
    <TruongNhap nhan="Chi phí đề xuất (VND)" ten="price" inputMode="numeric" placeholder="Ví dụ: 450000" batBuoc giaTri={giaTriBanDau.price} loi={loiTheoTruong.price} />
    <TruongNhap nhan="Nội dung phạm vi thực hiện" ten="description" laVungVanBan batBuoc giaTri={giaTriBanDau.description} loi={loiTheoTruong.description} />
    <TruongNhap nhan="Thời gian dự kiến" ten="estimatedDuration" maxLength={50} placeholder="Ví dụ: 2-3 giờ" giaTri={giaTriBanDau.estimatedDuration ?? ''} loi={loiTheoTruong.estimatedDuration} />
    <div className="hang-nut"><Nut loaiNut="submit" disabled={dangGui || voHieuHoa}>{dangGui ? 'Đang gửi…' : nhanNutGui}</Nut>{nutHuy}</div>
  </form>;
}
