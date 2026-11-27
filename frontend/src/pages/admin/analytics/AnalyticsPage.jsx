// Trang Thống kê của quản trị viên: bảy nhóm theo tab, bộ lọc thời gian dùng chung. Tab được ghi trên đường dẫn
// (#/admin/analytics?tab=...) để mở thẳng và quay lại được; bộ lọc được giữ khi chuyển tab.
import React, { useState } from 'react';
import { TieuDeTrang } from '../../../components/Ui.jsx';
import { BoLocThoiGian } from '../../../components/analytics/Khoi.jsx';
import { useDuLieu } from '../../../components/analytics/useDuLieu.js';
import { duongDanThongKe } from '../../../components/analytics/hangSo.js';
import { layCanhBao } from '../../../api/analyticsApi.js';
import TabTongQuan from './OverviewTab.jsx';
import TabTangTruong from './GrowthTab.jsx';
import TabNguoiDung from './UsersTab.jsx';
import TabHoatDong from './ActivityTab.jsx';
import TabHeThong from './SystemTab.jsx';
import TabBaoCao from './ReportsTab.jsx';
import TabCanhBao from './AlertsTab.jsx';
import '../../../styles/analytics.css';

const CAC_TAB = [
  { ma: 'tong-quan', ten: 'Tổng quan', locThoiGian: true, Trang: TabTongQuan },
  { ma: 'tang-truong', ten: 'Tăng trưởng', locThoiGian: true, Trang: TabTangTruong },
  { ma: 'nguoi-dung', ten: 'Người dùng', locThoiGian: true, Trang: TabNguoiDung },
  { ma: 'hoat-dong', ten: 'Hoạt động', locThoiGian: true, Trang: TabHoatDong },
  { ma: 'he-thong', ten: 'Hệ thống', Trang: TabHeThong },
  { ma: 'bao-cao', ten: 'Báo cáo', locThoiGian: true, khongSoSanh: true, Trang: TabBaoCao },
  { ma: 'canh-bao', ten: 'Cảnh báo', Trang: TabCanhBao },
];

let boLocDaLuu = { range: '30d', from: '', to: '', compare: true };

export default function TrangThongKe() {
  const thamSoUrl = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
  const tab = CAC_TAB.find((t) => t.ma === thamSoUrl.get('tab')) ?? CAC_TAB[0];
  const [boLoc, datBoLoc] = useState(boLocDaLuu);
  // Cảnh báo dùng chung cho số trên tab, tab Tổng quan và tab Cảnh báo; tự làm mới mỗi phút.
  const canhBao = useDuLieu(layCanhBao, 'canh-bao', { chuKy: 60000 });
  const soDangMo = canhBao.duLieu?.alerts.filter((a) => a.status !== 'RESOLVED' && a.severity !== 'info').length ?? 0;

  function doiBoLoc(moi) {
    boLocDaLuu = moi;
    datBoLoc(moi);
  }

  const Trang = tab.Trang;
  return <div className="khung-noi-dung tk-trang">
    <TieuDeTrang tieuDe="Thống kê hệ thống" phuDe="Số liệu tính trực tiếp từ cơ sở dữ liệu và máy chủ đang chạy." />
    <nav className="tk-tab" aria-label="Nhóm thống kê">
      {CAC_TAB.map((t) => <a key={t.ma} href={duongDanThongKe(t.ma)} aria-current={t.ma === tab.ma ? 'page' : undefined}>
        {t.ten}{t.ma === 'canh-bao' && soDangMo > 0 && <span className="tk-so-canh-bao" aria-label={`${soDangMo} cảnh báo cần chú ý`}>{soDangMo}</span>}
      </a>)}
    </nav>
    {tab.locThoiGian && <BoLocThoiGian boLoc={boLoc} onDoi={doiBoLoc} coSoSanh={!tab.khongSoSanh} />}
    <Trang boLoc={boLoc} canhBao={canhBao} thamSoUrl={thamSoUrl} />
  </div>;
}
