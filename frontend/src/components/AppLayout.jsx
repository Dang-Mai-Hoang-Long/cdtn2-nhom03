import React from 'react';
import { hrefFor, menuTarget } from '../navigation/screenRoutes.js';
import NotificationBell from './NotificationBell.jsx';

function NavLink({ label, current }) {
  const target = menuTarget[label] ?? (label === 'Đăng nhập' ? '01' : '02');
  return <a className={`nav-link ${current === label ? 'is-current' : ''}`} href={hrefFor(target)}>{label}</a>;
}

export function AppLayout({ screen, children }) {
  const isAccount = screen.id === '01' || screen.id === '02';
  const navCurrent = ['04'].includes(screen.id) ? 'Đăng tin'
    : ['05', '06', '07', '08'].includes(screen.id) ? 'Tin của tôi'
      : ['10', '11'].includes(screen.id) ? 'Tìm việc sửa chữa'
        : screen.id === '14' ? 'Công việc được chọn' : screen.title;

  return <div className="app-shell">
    <header className="site-header">
      <a className="brand" href={hrefFor(screen.group === 'Kỹ thuật viên' ? '09' : screen.group === 'Quản trị viên' ? '16' : '03')}>Sửa chữa tại nhà</a>
      {!isAccount && screen.nav.length > 0 && <nav className="primary-nav" aria-label="Điều hướng chính">
        {screen.nav.map((label) => <NavLink key={label} label={label} current={navCurrent} />)}
      </nav>}
      {isAccount && <nav className="primary-nav account-nav" aria-label="Tài khoản">
        <NavLink label="Đăng nhập" current={screen.id === '01' ? 'Đăng nhập' : ''} />
        <NavLink label="Đăng ký" current={screen.id === '02' ? 'Đăng ký' : ''} />
      </nav>}
      {!isAccount && <div className="header-actions">
        <NotificationBell role={screen.group} />
        <div className="account-chip">
          <strong>{screen.group === 'Kỹ thuật viên' ? 'Trần Quốc Huy' : screen.group === 'Quản trị viên' ? 'Lê Thu Hà' : 'Nguyễn Minh Anh'}</strong>
          <span>{screen.role}</span>
        </div>
      </div>}
    </header>
    <main>{children}</main>
  </div>;
}
