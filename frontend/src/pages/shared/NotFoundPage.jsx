import React from 'react';
import { Title, Panel, Button } from '../../components/Ui.jsx';
export default function NotFoundPage() {
  return <div className="content-wrap"><Title title="Không tìm thấy trang" subtitle="Địa chỉ bạn mở không nằm trong luồng giao diện hiện tại." /><Panel title="Đi đến màn hình"><p>Chọn một trang trong thanh xem trước hoặc quay về danh sách tin sửa chữa.</p><Button to="03">Tin của tôi</Button></Panel></div>;
}
