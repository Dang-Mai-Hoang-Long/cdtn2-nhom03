import React, { useState } from 'react';
import { TEN_MUC_DO, TEN_TRANG_THAI_CANH_BAO, TEN_NHOM_CANH_BAO, duongDanThongKe } from '../../../components/analytics/hangSo.js';
import { datTrangThaiCanhBao } from '../../../api/analyticsApi.js';
import { layThongDiepLoi } from '../../../api/httpClient.js';
import { dinhDangThoiGian } from '../../../utils/dinhDang.js';
import { layDuongDanManHinh } from '../../../navigation/screenRoutes.js';
import { HopThoai } from '../../../components/analytics/Khoi.jsx';
import { Nut, ThongBao } from '../../../components/Ui.jsx';

export function HuyHieuMucDo({ muc }) {
  return <span className={`tk-huy-hieu ${muc}`}>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d={muc === 'critical' ? 'M8 3h8l5 5v8l-5 5H8l-5-5V8zM12 8v5M12 16.2v.01' : muc === 'warning' ? 'M12 4 2.5 20h19zM12 10v4.5M12 17.2v.01' : 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8v.01'} /></svg>
    {TEN_MUC_DO[muc]}
  </span>;
}

function lienKetCua(canhBao) {
  const l = canhBao.link;
  if (!l) return null;
  if (l.screen === 'users' && l.id) return { duongDan: layDuongDanManHinh('19', { id: l.id }), ten: 'Xem tài khoản' };
  if (l.report) return { duongDan: duongDanThongKe('bao-cao', { loai: l.report, ...l.filters }), ten: 'Xem trong báo cáo' };
  if (l.tab) return { duongDan: duongDanThongKe(l.tab), ten: 'Xem số liệu' };
  return null;
}

// gon: danh sách rút gọn trên tab Tổng quan (chỉ mở chi tiết, không đổi trạng thái tại chỗ).
export default function DanhSachCanhBao({ cacCanhBao, onCapNhat, gon = false }) {
  const [dangXem, datDangXem] = useState(null);
  const [loi, datLoi] = useState('');
  const [dangLuu, datDangLuu] = useState('');
  const chiTiet = cacCanhBao.find((a) => a.key === dangXem);

  async function doiTrangThai(canhBao, status) {
    datDangLuu(canhBao.key);
    datLoi('');
    try {
      await datTrangThaiCanhBao(canhBao.key, status);
      onCapNhat?.();
    } catch (loiGoi) {
      datLoi(layThongDiepLoi(loiGoi));
    }
    datDangLuu('');
  }

  const chonTrangThai = (a) => <label className="tk-chon-trang-thai"><span className="chi-cho-trinh-doc">{`Trạng thái xử lý: ${a.title}`}</span>
    <select value={a.status} disabled={dangLuu === a.key} onChange={(e) => doiTrangThai(a, e.target.value)}>
      {Object.entries(TEN_TRANG_THAI_CANH_BAO).map(([v, n]) => <option key={v} value={v}>{n}</option>)}
    </select></label>;

  return <>
    <ThongBao loai="loi">{loi}</ThongBao>
    <ul className={`tk-canh-bao ${gon ? 'gon' : ''}`}>
      {cacCanhBao.map((a) => {
        const lienKet = lienKetCua(a);
        return <li key={a.key} className={a.status === 'RESOLVED' ? 'da-xu-ly' : ''}>
          <div className="tk-canh-bao-dau">
            <HuyHieuMucDo muc={a.severity} />
            <span className="tk-phu">{TEN_NHOM_CANH_BAO[a.category]} · {dinhDangThoiGian(a.occurredAt)}</span>
            {gon && <span className="tk-phu">{TEN_TRANG_THAI_CANH_BAO[a.status]}</span>}
          </div>
          <h3>{a.title}</h3>
          {!gon && <p>{a.description}</p>}
          <p className="tk-goi-y"><strong>Đề xuất:</strong> {a.suggestion}</p>
          <div className="tk-canh-bao-chan">
            <button type="button" className="tk-nut-nho" onClick={() => datDangXem(a.key)}>Xem chi tiết</button>
            {lienKet && <a className="lien-ket-van-ban" href={lienKet.duongDan}>{lienKet.ten}</a>}
            {!gon && chonTrangThai(a)}
          </div>
        </li>;
      })}
    </ul>
    {chiTiet && <HopThoai tieuDe={chiTiet.title} onDong={() => datDangXem(null)}>
      <dl className="tk-chi-tiet">
        <dt>Mức độ</dt><dd><HuyHieuMucDo muc={chiTiet.severity} /></dd>
        <dt>Nhóm</dt><dd>{TEN_NHOM_CANH_BAO[chiTiet.category]}</dd>
        <dt>Thời điểm phát sinh</dt><dd>{dinhDangThoiGian(chiTiet.occurredAt)}</dd>
        <dt>Mô tả</dt><dd>{chiTiet.description}</dd>
        {chiTiet.details.length > 0 && <><dt>Liên quan</dt><dd><ul>{chiTiet.details.map((d) => <li key={d}>{d}</li>)}</ul></dd></>}
        <dt>Hành động đề xuất</dt><dd>{chiTiet.suggestion}</dd>
        <dt>Trạng thái</dt><dd>{chonTrangThai(chiTiet)}{chiTiet.statusUpdatedBy && <span className="tk-phu"> Cập nhật bởi {chiTiet.statusUpdatedBy}, {dinhDangThoiGian(chiTiet.statusUpdatedAt)}</span>}</dd>
      </dl>
      {lienKetCua(chiTiet) && <Nut onClick={() => { window.location.hash = lienKetCua(chiTiet).duongDan; datDangXem(null); }}>{lienKetCua(chiTiet).ten}</Nut>}
    </HopThoai>}
  </>;
}
