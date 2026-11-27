import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDuLieu } from '../../../components/analytics/useDuLieu.js';
import { VungDuLieu, BangDuLieu, HopThoai } from '../../../components/analytics/Khoi.jsx';
import { giaTriTheoCot, tienDayDu, so, ngayIsoHien } from '../../../components/analytics/dinhDang.js';
import { layBaoCao, taiFileBaoCao, thamSoThoiGian } from '../../../api/analyticsApi.js';
import { layThongDiepLoi } from '../../../api/httpClient.js';
import { Nut, ThongBao, PhanTrang, LienKetNguoiDung } from '../../../components/Ui.jsx';
import { dinhDangThoiGian } from '../../../utils/dinhDang.js';

export const CAC_BAO_CAO = [
  ['users', 'Người dùng'], ['revenue', 'Giá trị công việc'], ['transactions', 'Giao dịch'], ['activity', 'Hoạt động'],
  ['system', 'Hệ thống'], ['errors', 'Lỗi'], ['performance', 'Hiệu năng'],
];
const KHONG_LOC_THOI_GIAN = ['performance'];

// Cột hiển thị trên bảng (hộp chi tiết hiện đủ mọi cột, file xuất cũng đủ).
const COT_AN_TREN_BANG = { users: ['id', 'reviewsReceived'], revenue: ['location'], transactions: ['title', 'completedAt'], activity: ['ip', 'os'], errors: ['os'], system: ['diskPct', 'dbMs'], performance: ['maxMs'] };

function BanIn({ duLieu, boLocChu, onXong }) {
  useEffect(() => {
    const xong = () => onXong();
    window.addEventListener('afterprint', xong, { once: true });
    const hen = setTimeout(() => window.print(), 150);
    return () => {
      clearTimeout(hen);
      window.removeEventListener('afterprint', xong);
    };
  }, [onXong]);
  return createPortal(<div className="tk-vung-in">
    <style>{'@page { size: A4 landscape; margin: 12mm; }'}</style>
    <h1>{duLieu.title}</h1>
    <p>Sửa chữa tại nhà. Lập lúc {dinhDangThoiGian(new Date().toISOString())}. {boLocChu} Tổng {so(duLieu.phanTrang.totalElements)} dòng{duLieu.rows.length < duLieu.phanTrang.totalElements ? `, in ${so(duLieu.rows.length)} dòng đầu` : ''}.{duLieu.summary ? ` ${duLieu.summary.label}: ${tienDayDu(duLieu.summary.value)}.` : ''}</p>
    {duLieu.note && <p>{duLieu.note}</p>}
    <table>
      <thead><tr>{duLieu.columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
      <tbody>{duLieu.rows.map((d, i) => <tr key={d.id ?? i}>{duLieu.columns.map((c) => <td key={c.key}>{giaTriTheoCot(c, d[c.key])}</td>)}</tr>)}</tbody>
    </table>
  </div>, document.body);
}

export default function TabBaoCao({ boLoc, thamSoUrl }) {
  const loaiTuUrl = CAC_BAO_CAO.some(([ma]) => ma === thamSoUrl.get('loai')) ? thamSoUrl.get('loai') : 'users';
  const locTuUrl = Object.fromEntries([...thamSoUrl].filter(([k]) => ['type', 'status', 'role', 'category', 'action', 'method', 'dbOk'].includes(k)));
  const [loai, datLoai] = useState(loaiTuUrl);
  const [truyVan, datTruyVan] = useState({ q: '', loc: locTuUrl, sort: undefined, dir: undefined, page: 1, tatCa: false });
  const [nhapTim, datNhapTim] = useState('');
  const [xem, datXem] = useState(null);
  const [thongBao, datThongBao] = useState({ loai: '', noiDung: '' });
  const [dangXuat, datDangXuat] = useState('');
  const [banIn, datBanIn] = useState(null);

  const locThoiGian = !KHONG_LOC_THOI_GIAN.includes(loai);
  const thoiGian = !locThoiGian || truyVan.tatCa ? { range: 'all' } : thamSoThoiGian(boLoc);
  const thamSoChung = { ...thoiGian, ...truyVan.loc, q: truyVan.q || undefined, sort: truyVan.sort, dir: truyVan.dir };
  const thamSo = { ...thamSoChung, page: truyVan.page, size: 10 };
  const trangThai = useDuLieu(() => layBaoCao(loai, thamSo), `${loai}|${JSON.stringify(thamSo)}`);

  // Đổi khoảng thời gian chung thì quay về trang 1.
  const khoaThoiGian = JSON.stringify(thamSoThoiGian(boLoc));
  useEffect(() => { datTruyVan((t) => (t.page === 1 ? t : { ...t, page: 1 })); }, [khoaThoiGian]);

  function doiLoai(ma) {
    datLoai(ma);
    datTruyVan({ q: '', loc: {}, sort: undefined, dir: undefined, page: 1, tatCa: truyVan.tatCa });
    datNhapTim('');
    datThongBao({ loai: '', noiDung: '' });
  }

  const doi = (thayDoi) => datTruyVan((t) => ({ ...t, ...thayDoi, page: thayDoi.page ?? 1 }));
  const datLaiLoc = () => {
    datNhapTim('');
    doi({ q: '', loc: {}, sort: undefined, dir: undefined });
  };

  async function xuat(format) {
    datDangXuat(format);
    datThongBao({ loai: '', noiDung: '' });
    try {
      const kq = await taiFileBaoCao(loai, { ...thamSoChung, format });
      datThongBao({ loai: 'thanh-cong', noiDung: `Đã tải ${kq.tenFile} (${so(kq.soDong)} dòng${kq.biCat ? ', đã giới hạn số dòng' : ''}).` });
    } catch (loi) {
      datThongBao({ loai: 'loi', noiDung: layThongDiepLoi(loi) });
    }
    datDangXuat('');
  }

  async function inPdf() {
    datDangXuat('pdf');
    datThongBao({ loai: '', noiDung: '' });
    try {
      datBanIn(await layBaoCao(loai, { ...thamSoChung, print: '1' }));
    } catch (loi) {
      datThongBao({ loai: 'loi', noiDung: layThongDiepLoi(loi) });
      datDangXuat('');
    }
  }
  const [xongIn] = useState(() => () => { datBanIn(null); datDangXuat(''); });

  const chuBoLoc = (d) => [
    d.range ? `${d.dateLabel}: ${ngayIsoHien(d.range.from)} đến ${ngayIsoHien(d.range.to)}.` : locThoiGian ? 'Toàn bộ thời gian.' : '',
    truyVan.q ? `Tìm: "${truyVan.q}".` : '',
    ...d.filters.filter((f) => truyVan.loc[f.key]).map((f) => `${f.label}: ${f.options.find((o) => o.value === truyVan.loc[f.key])?.label}.`),
  ].filter(Boolean).join(' ');

  return <div className="tk-cot">
    <div className="tk-chon-bao-cao" role="group" aria-label="Loại báo cáo">
      {CAC_BAO_CAO.map(([ma, ten]) => <button key={ma} type="button" className={`nut-loc ${loai === ma ? 'dang-duoc-chon' : ''}`} aria-pressed={loai === ma} onClick={() => doiLoai(ma)}>{ten}</button>)}
    </div>
    <ThongBao loai={thongBao.loai}>{thongBao.noiDung}</ThongBao>
    <VungDuLieu {...trangThai}>{(d) => {
      if (d.type !== loai) return <p className="dang-tai">Đang tải dữ liệu…</p>;
      const cot = d.columns.filter((c) => !(COT_AN_TREN_BANG[loai] ?? []).includes(c.key));
      const sapXep = d.sort;
      const coLoc = truyVan.q || Object.keys(truyVan.loc).length > 0;
      return <section className="tk-khung">
        <div className="tk-khung-dau">
          <div><h2>{d.title}</h2><p>{chuBoLoc(d)}{d.note ? ` ${d.note}` : ''}</p></div>
          <div className="tk-nut-xuat" role="group" aria-label="Xuất báo cáo">
            <Nut laNutPhu onClick={() => xuat('csv')} disabled={!!dangXuat}>{dangXuat === 'csv' ? 'Đang xuất…' : 'Xuất CSV'}</Nut>
            <Nut laNutPhu onClick={() => xuat('xlsx')} disabled={!!dangXuat}>{dangXuat === 'xlsx' ? 'Đang xuất…' : 'Xuất Excel'}</Nut>
            <Nut laNutPhu onClick={inPdf} disabled={!!dangXuat}>{dangXuat === 'pdf' ? 'Đang chuẩn bị…' : 'Xuất PDF'}</Nut>
          </div>
        </div>
        <form className="tk-loc-bao-cao" onSubmit={(e) => { e.preventDefault(); doi({ q: nhapTim.trim() }); }}>
          <label className="tk-o-tim"><span>Tìm kiếm</span><input type="search" value={nhapTim} maxLength={100} onChange={(e) => datNhapTim(e.target.value)} /></label>
          {d.filters.map((f) => <label key={f.key}><span>{f.label}</span>
            <select value={truyVan.loc[f.key] ?? ''} onChange={(e) => { const loc = { ...truyVan.loc }; if (e.target.value) loc[f.key] = e.target.value; else delete loc[f.key]; doi({ loc }); }}>
              <option value="">Tất cả</option>{f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select></label>)}
          {locThoiGian && <label><span>Thời gian</span><select value={truyVan.tatCa ? 'all' : 'range'} onChange={(e) => doi({ tatCa: e.target.value === 'all' })}><option value="range">Theo khoảng đang chọn</option><option value="all">Toàn bộ</option></select></label>}
          <Nut loaiNut="submit">Tìm</Nut>
          {coLoc && <Nut laNutPhu onClick={datLaiLoc}>Xóa lọc</Nut>}
        </form>
        <p className="tk-dem-dong"><strong>{so(d.phanTrang.totalElements)} dòng</strong>{d.summary ? ` · ${d.summary.label}: ${tienDayDu(d.summary.value)}` : ''}{d.phanTrang.totalPages > 1 ? ` · trang ${d.phanTrang.page} / ${d.phanTrang.totalPages}` : ''}</p>
        <BangDuLieu tenBang={d.title} cot={cot} dong={d.rows} sapXep={sapXep}
          onSapXep={(khoa) => doi({ sort: khoa, dir: sapXep.key === khoa && sapXep.dir === 'asc' ? 'desc' : 'asc' })}
          onXem={datXem} hien={(c, r) => giaTriTheoCot(c, r[c.key])}
          trongRong={d.range ? 'Không có dòng nào trong khoảng thời gian và bộ lọc này. Thử chọn "Toàn bộ" ở ô Thời gian.' : 'Không có dòng nào phù hợp.'} />
        <PhanTrang phanTrang={d.phanTrang} onChuyenTrang={(page) => doi({ page })} />
        {xem && <HopThoai tieuDe="Chi tiết" onDong={() => datXem(null)}>
          <dl className="tk-chi-tiet">{d.columns.map((c) => <React.Fragment key={c.key}><dt>{c.label}</dt><dd>{giaTriTheoCot(c, xem[c.key])}</dd></React.Fragment>)}</dl>
          {(loai === 'users' ? xem.id : xem.userId) && <p onClick={() => datXem(null)}><LienKetNguoiDung id={loai === 'users' ? xem.id : xem.userId}>Mở hồ sơ người dùng</LienKetNguoiDung></p>}
        </HopThoai>}
      </section>;
    }}</VungDuLieu>
    {banIn && <BanIn duLieu={banIn} boLocChu={chuBoLoc(banIn)} onXong={xongIn} />}
  </div>;
}
