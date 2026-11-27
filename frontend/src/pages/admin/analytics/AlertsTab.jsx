import React, { useState } from 'react';
import { VungDuLieu } from '../../../components/analytics/Khoi.jsx';
import { TEN_MUC_DO, TEN_TRANG_THAI_CANH_BAO, TEN_NHOM_CANH_BAO } from '../../../components/analytics/hangSo.js';
import { so } from '../../../components/analytics/dinhDang.js';
import DanhSachCanhBao from './AlertList.jsx';

export default function TabCanhBao({ canhBao }) {
  const [loc, datLoc] = useState({ severity: '', category: '', status: 'open' });
  const chon = (khoa) => (e) => datLoc((l) => ({ ...l, [khoa]: e.target.value }));

  return <VungDuLieu {...canhBao}>{(d) => {
    const ds = d.alerts.filter((a) => (!loc.severity || a.severity === loc.severity)
      && (!loc.category || a.category === loc.category)
      && (loc.status === '' || (loc.status === 'open' ? a.status !== 'RESOLVED' : a.status === loc.status)));
    const dem = (muc) => d.alerts.filter((a) => a.severity === muc && a.status !== 'RESOLVED').length;
    return <div className="tk-cot">
      <p className="tk-khoang-hien">Sự kiện trong {d.windowDays} ngày gần nhất, cùng tình trạng hệ thống và dữ liệu hiện tại. Đang mở: {so(d.openCount)} cảnh báo ({so(dem('critical'))} nghiêm trọng, {so(dem('warning'))} cảnh báo, {so(dem('info'))} thông tin).</p>
      <div className="tk-loc-bao-cao">
        <label><span>Mức độ</span><select value={loc.severity} onChange={chon('severity')}><option value="">Tất cả</option>{Object.entries(TEN_MUC_DO).map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></label>
        <label><span>Nhóm</span><select value={loc.category} onChange={chon('category')}><option value="">Tất cả</option>{Object.entries(TEN_NHOM_CANH_BAO).map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></label>
        <label><span>Trạng thái</span><select value={loc.status} onChange={chon('status')}><option value="open">Đang mở</option><option value="">Tất cả</option>{Object.entries(TEN_TRANG_THAI_CANH_BAO).map(([v, n]) => <option key={v} value={v}>{n}</option>)}</select></label>
      </div>
      {ds.length === 0
        ? <p className="tk-trong">{d.alerts.length === 0 ? 'Không có cảnh báo hay nhận định nào.' : 'Không có cảnh báo khớp bộ lọc.'}</p>
        : <DanhSachCanhBao cacCanhBao={ds} onCapNhat={canhBao.taiLai} />}
    </div>;
  }}</VungDuLieu>;
}
