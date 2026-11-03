import React from 'react';
import { Button, Field, Note } from './Ui.jsx';
import { requests } from '../data/demoData.js';

export default function RequestForm() {
  return <>
    <Field label="Loại dịch vụ" value="Sửa máy lạnh" type="select" options={['Sửa máy lạnh', 'Sửa máy giặt', 'Sửa ống nước', 'Sửa điện']} required />
    <Field label="Mô tả sự cố" value={requests[0].description} required wide area />
    <div className="field-grid">
      <Field label="Ngày mong muốn" value="2026-10-22" type="date" required />
      <Field label="Khung giờ mong muốn" value="09:00 – 11:00" required />
      <Field label="Tỉnh / Thành phố" value="TP. Hồ Chí Minh" required />
      <Field label="Quận / Huyện" value="Bình Thạnh" required />
      <Field label="Địa chỉ chi tiết" value="24/8 đường D5, Phường 25" required wide />
    </div>
    <Note>Số điện thoại và địa chỉ chi tiết chỉ hiển thị cho kỹ thuật viên được bạn chọn.</Note>
    <div className="button-row"><Button to="03">Đăng tin</Button><Button to="03" secondary>Hủy</Button></div>
  </>;
}
