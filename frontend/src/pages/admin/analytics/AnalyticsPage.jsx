// Trang Thống kê của quản trị viên: một trang duy nhất gồm tiêu đề, bộ lọc thời gian, bốn số liệu và bốn biểu đồ.
// Bộ lọc được giữ khi rời trang rồi quay lại.
import React, { useState } from 'react';
import { BoLocThoiGian } from '../../../components/analytics/Khoi.jsx';
import TongQuan from './OverviewTab.jsx';
import '../../../styles/analytics.css';

let boLocDaLuu = { range: '30d', from: '', to: '', compare: true };

export default function TrangThongKe() {
  const [boLoc, datBoLoc] = useState(boLocDaLuu);

  function doiBoLoc(moi) {
    boLocDaLuu = moi;
    datBoLoc(moi);
  }

  return <div className="khung-noi-dung tk-trang tk-tong-quan">
    <header className="tk-dau-trang">
      <h1>Thống kê hệ thống</h1>
      <BoLocThoiGian boLoc={boLoc} onDoi={doiBoLoc} />
    </header>
    <TongQuan boLoc={boLoc} />
  </div>;
}
