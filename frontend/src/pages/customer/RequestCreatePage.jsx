import React from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, GhiChu, GhiChuChanTrang } from '../../components/Ui.jsx';
import BieuMauYeuCau from '../../components/RequestForm.jsx';
export default function TrangTaoYeuCau() {
  return <><div className="khung-noi-dung"><TieuDeTrang tieuDe="Đăng tin sửa chữa" phuDe="Mô tả sự cố, chọn thời gian và địa điểm. Các trường có dấu * là bắt buộc." />
    <div className="hai-cot"><KhungNoiDung tieuDe="Thông tin cần sửa chữa" className="khung-bieu-mau"><BieuMauYeuCau /></KhungNoiDung>
      <div className="cot-noi-dung"><KhungNoiDung tieuDe="Đăng tin nhanh"><ol className="cac-buoc"><li><strong>Nêu nhu cầu</strong><span>Chọn đúng dịch vụ và mô tả rõ sự cố.</span></li><li><strong>Chọn lịch</strong><span>Điền ngày và khung giờ mong muốn.</span></li><li><strong>Nhận đề xuất</strong><span>So sánh đề xuất từ kỹ thuật viên.</span></li></ol></KhungNoiDung><GhiChu>Số điện thoại và địa chỉ chi tiết chỉ hiển thị cho kỹ thuật viên được bạn chọn.</GhiChu><KhungNoiDung tieuDe="Chế độ sửa tin · US21"><p className="mo-ta-phu">Có thể sửa tin khi trạng thái chờ đề xuất. Chỉ sửa của bạn khi chưa có kỹ thuật viên được chọn.</p><Nut maManHinhDich="05" laNutPhu>Lưu thay đổi</Nut></KhungNoiDung></div>
    </div></div><GhiChuChanTrang>Đăng tin thành công → 03, trạng thái Chờ đề xuất. Hủy → 03. Các nút ở đây chỉ điều hướng giữa màn hình mẫu.</GhiChuChanTrang></>;
}
