import React from 'react';
import { TieuDeTrang, KhungNoiDung, ThongBao } from '../../components/Ui.jsx';
import BieuMauYeuCau from '../../components/RequestForm.jsx';

export default function TrangTaoYeuCau() {
  return <div className="khung-noi-dung"><TieuDeTrang tieuDe="Đăng tin sửa chữa" phuDe="Mô tả sự cố, chọn thời gian và địa điểm. Các trường có dấu * là bắt buộc." />
    <div className="hai-cot">
      <KhungNoiDung tieuDe="Thông tin cần sửa chữa" className="khung-bieu-mau"><BieuMauYeuCau /></KhungNoiDung>
      <div className="cot-noi-dung">
        <KhungNoiDung tieuDe="Đăng tin nhanh"><ol className="cac-buoc"><li><strong>Nêu nhu cầu</strong><span>Chọn đúng dịch vụ và mô tả rõ sự cố.</span></li><li><strong>Chọn lịch</strong><span>Điền ngày và giờ mong muốn.</span></li><li><strong>Nhận đề xuất</strong><span>So sánh đề xuất từ kỹ thuật viên.</span></li></ol></KhungNoiDung>
        <ThongBao>Kỹ thuật viên chỉ thấy khu vực. Số điện thoại của bạn chỉ hiển thị cho kỹ thuật viên được bạn chọn.</ThongBao>
      </div>
    </div>
  </div>;
}
