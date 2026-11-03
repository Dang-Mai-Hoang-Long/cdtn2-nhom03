import React from 'react';
import { Title, Panel, Button, Note, FooterNote } from '../../components/Ui.jsx';
import RequestForm from '../../components/RequestForm.jsx';
export default function RequestCreatePage() {
  return <><div className="content-wrap"><Title title="Đăng tin sửa chữa" subtitle="Mô tả sự cố, chọn thời gian và địa điểm. Các trường có dấu * là bắt buộc." />
    <div className="two-column"><Panel title="Thông tin cần sửa chữa" className="form-panel"><RequestForm /></Panel>
      <div className="stack"><Panel title="Đăng tin nhanh"><ol className="steps"><li><strong>Nêu nhu cầu</strong><span>Chọn đúng dịch vụ và mô tả rõ sự cố.</span></li><li><strong>Chọn lịch</strong><span>Điền ngày và khung giờ mong muốn.</span></li><li><strong>Nhận đề xuất</strong><span>So sánh đề xuất từ kỹ thuật viên.</span></li></ol></Panel><Note>Số điện thoại và địa chỉ chi tiết chỉ hiển thị cho kỹ thuật viên được bạn chọn.</Note><Panel title="Chế độ sửa tin · US21"><p className="subtle">Có thể sửa tin khi trạng thái chờ đề xuất. Chỉ sửa của bạn khi chưa có kỹ thuật viên được chọn.</p><Button to="05" secondary>Lưu thay đổi</Button></Panel></div>
    </div></div><FooterNote>Đăng tin thành công → 03, trạng thái Chờ đề xuất. Hủy → 03. Các nút ở đây chỉ điều hướng giữa màn hình mẫu.</FooterNote></>;
}
