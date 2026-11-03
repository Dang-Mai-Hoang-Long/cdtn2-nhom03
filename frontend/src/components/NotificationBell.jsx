import React, { useState } from 'react';
import { hrefFor } from '../navigation/screenRoutes.js';

const notificationsByRole = {
  'Khách hàng': [
    { type: 'Trạng thái', title: 'Bạn đã nhận được 3 đề xuất', body: 'Tin SC-024 đang chờ bạn xem và chọn kỹ thuật viên.', time: 'Hôm nay · 10:15', to: '05' },
    { type: 'Xác nhận', title: 'Xác nhận hoàn thành công việc', body: 'Sau khi kiểm tra kết quả sửa chữa, bạn có thể xác nhận hoàn thành tin SC-023.', time: 'Hôm qua · 16:40', to: '07' },
    { type: 'Quy tắc', title: 'Chỉ chọn một đề xuất cho mỗi tin', body: 'Khi chấp nhận một đề xuất, các đề xuất còn lại sẽ không còn hiệu lực.', time: 'Thông tin', to: '05' },
  ],
  'Kỹ thuật viên': [
    { type: 'Trạng thái', title: 'Đề xuất của bạn đã được chấp nhận', body: 'Nguyễn Minh Anh đã chọn đề xuất DX-018 cho tin SC-024.', time: '20/10/2026 · 14:20', to: '13' },
    { type: 'Xác nhận', title: 'Công việc đang chờ xác nhận hoàn thành', body: 'Khách hàng sẽ xác nhận sau khi công việc sửa chữa hoàn tất.', time: '20/10/2026 · 14:20', to: '13' },
    { type: 'Quy tắc', title: 'Thông tin liên hệ của khách hàng', body: 'Thông tin chi tiết chỉ hiển thị sau khi khách hàng chọn đề xuất của bạn.', time: 'Thông tin', to: '12' },
  ],
  'Quản trị viên': [
    { type: 'Trạng thái', title: 'Tài khoản cần được theo dõi', body: 'Danh sách hiện có tài khoản đang hoạt động và bị khóa.', time: 'Hôm nay', to: '16' },
    { type: 'Xác nhận', title: 'Xác nhận trước khi khóa tài khoản', body: 'Kiểm tra đúng người dùng trước khi thay đổi trạng thái truy cập.', time: 'Thông tin', to: '16' },
    { type: 'Quy tắc', title: 'Quyền quản trị không tự đăng ký', body: 'Chỉ quản trị viên có quyền quản lý trạng thái tài khoản người dùng.', time: 'Thông tin', to: '16' },
  ],
};

export default function NotificationBell({ role }) {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = notificationsByRole[role] ?? [];

  return <div className="notification-bell-wrap">
    <button
      className={`notification-bell ${isOpen ? 'is-open' : ''}`}
      type="button"
      aria-label={`Thông báo, ${notifications.length} mục`}
      aria-expanded={isOpen}
      onClick={() => setIsOpen((open) => !open)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
      <span className="notification-count">{notifications.length}</span>
    </button>
    {isOpen && <section className="notification-menu" aria-label="Thông báo">
      <div className="notification-menu-header"><strong>Thông báo</strong><span>{role}</span></div>
      <div className="notification-menu-list">
        {notifications.map((item) => <a className="notification-item" key={item.title} href={hrefFor(item.to)} onClick={() => setIsOpen(false)}>
          <span className="notification-item-type">{item.type}</span>
          <strong>{item.title}</strong>
          <span className="notification-item-body">{item.body}</span>
          <time>{item.time}</time>
        </a>)}
      </div>
    </section>}
  </div>;
}
