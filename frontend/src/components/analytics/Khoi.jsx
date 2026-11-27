// Các khối dùng lại của trang thống kê: trạng thái tải / lỗi / trống, thẻ biểu đồ (kèm bản bảng), thẻ số liệu, bộ lọc
// thời gian, bảng dữ liệu có sắp xếp và hộp thoại chi tiết.
import React, { useEffect, useRef, useState } from 'react';
import { Nut, ThongBao, DangTai } from '../Ui.jsx';
import { DuongNho } from './Charts.jsx';
import { phanTram } from './dinhDang.js';

// Hiện nội dung khi đã có dữ liệu; đang tải lại thì giữ nội dung cũ mờ đi (không nhảy bố cục).
export function VungDuLieu({ duLieu, loi, dangTai, taiLai, children }) {
  if (!duLieu) {
    if (loi) return <div className="tk-trang-thai-loi"><ThongBao loai="loi">{loi}</ThongBao><Nut laNutPhu onClick={taiLai}>Thử lại</Nut></div>;
    return <DangTai />;
  }
  return <div className={dangTai ? 'tk-dang-lam-moi' : ''} aria-busy={dangTai}>
    {loi && <div className="tk-trang-thai-loi"><ThongBao loai="loi">{`Chưa cập nhật được: ${loi}`}</ThongBao><Nut laNutPhu onClick={taiLai}>Thử lại</Nut></div>}
    {children(duLieu)}
  </div>;
}

function BangTho({ cot, dong }) {
  return <div className="tk-cuon-ngang tk-bang-so"><table>
    <thead><tr>{cot.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
    <tbody>{dong.map((d, i) => <tr key={i}>{d.map((v, j) => (j === 0 ? <th key={j} scope="row">{v}</th> : <td key={j}>{v}</td>))}</tr>)}</tbody>
  </table></div>;
}

// bang: { cot: [tên cột], dong: [[giá trị đã định dạng]] }. trongRong: lời nhắn khi không có dữ liệu để vẽ.
export function KhungBieuDo({ tieuDe, moTa, donVi, bang, trongRong, chuThich, children, rong = false }) {
  const [xemBang, datXemBang] = useState(false);
  return <section className={`tk-khung ${rong ? 'tk-khung-rong' : ''}`}>
    <div className="tk-khung-dau">
      <div><h2>{tieuDe}</h2><p>{moTa}{donVi ? ` Đơn vị: ${donVi}.` : ''}</p></div>
      {bang && !trongRong && <button type="button" className="tk-nut-nho" aria-pressed={xemBang} onClick={() => datXemBang((v) => !v)}>{xemBang ? 'Xem biểu đồ' : 'Xem bảng'}</button>}
    </div>
    {chuThich && !xemBang && !trongRong && chuThich}
    {trongRong ? <p className="tk-trong">{trongRong}</p> : xemBang ? <BangTho {...bang} /> : children}
  </section>;
}

const BIEU_TUONG = {
  totalUsers: 'M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 19v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.5 4.7a3 3 0 0 1 0 5.7',
  newUsers: 'M15 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 3 17.5V19M9 10.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 8v6M15 11h6',
  activeUsers: 'M3 12h4l3 7 4-14 3 7h4',
  transactions: 'M4 8h13l-3-3M20 16H7l3 3',
  completedValue: 'M4 6h16v12H4zM12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM7 9v.01M17 15v.01',
  totalContent: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  pendingTasks: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
  systemErrors: 'M12 4 2.5 20h19zM12 10v4.5M12 17.2v.01',
};

export function BieuTuong({ ten }) {
  return <svg className="tk-bieu-tuong" viewBox="0 0 24 24" aria-hidden="true"><path d={BIEU_TUONG[ten]} /></svg>;
}

// thayDoi: tỷ lệ so với kỳ trước (null: kỳ trước bằng 0). tangLaXau: tăng là điều không tốt (lỗi, việc tồn).
export function TheSoLieu({ bieuTuong, ten, giaTri, thayDoi, coSoSanh, tangLaXau = false, ghiChu, spark, sacThai = '', lienKet }) {
  const tot = thayDoi === null || thayDoi === undefined || thayDoi === 0 ? '' : (thayDoi > 0) !== tangLaXau ? 'tot' : 'xau';
  return <article className={`tk-the ${sacThai}`}>
    <div className="tk-the-dau"><BieuTuong ten={bieuTuong} /><h3>{lienKet ? <a href={lienKet}>{ten}</a> : ten}</h3></div>
    <div className="tk-the-giua"><strong>{giaTri}</strong><DuongNho giaTri={spark} /></div>
    <p className="tk-the-chan">
      {coSoSanh && thayDoi !== undefined && (thayDoi === null
        ? <span className="tk-doi">Kỳ trước chưa có</span>
        : <span className={`tk-doi ${tot}`}><span aria-hidden="true">{thayDoi > 0 ? '▲' : thayDoi < 0 ? '▼' : '■'}</span> {thayDoi > 0 ? 'Tăng' : thayDoi < 0 ? 'Giảm' : 'Không đổi'} {thayDoi !== 0 && phanTram(Math.abs(thayDoi))}</span>)}
      <span>{ghiChu}</span>
    </p>
  </article>;
}

const CAC_KHOANG = [['today', 'Hôm nay'], ['7d', '7 ngày'], ['30d', '30 ngày'], ['90d', '90 ngày'], ['12m', '12 tháng'], ['custom', 'Tùy chọn ngày']];

const homNayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function BoLocThoiGian({ boLoc, onDoi, coSoSanh = true }) {
  const [nhap, datNhap] = useState({ from: boLoc.from, to: boLoc.to });
  const [dangChonNgay, datDangChonNgay] = useState(boLoc.range === 'custom');
  const [loi, datLoi] = useState('');

  function chon(range) {
    datLoi('');
    if (range === 'custom') {
      datDangChonNgay(true);
      return;
    }
    datDangChonNgay(false);
    onDoi({ ...boLoc, range });
  }

  function apDung(suKien) {
    suKien.preventDefault();
    if (!nhap.from || !nhap.to) return datLoi('Chọn đủ ngày bắt đầu và ngày kết thúc.');
    if (nhap.to < nhap.from) return datLoi('Ngày kết thúc phải từ ngày bắt đầu trở đi.');
    datLoi('');
    return onDoi({ ...boLoc, range: 'custom', from: nhap.from, to: nhap.to });
  }

  const dangChon = dangChonNgay ? 'custom' : boLoc.range;
  return <div className="tk-bo-loc">
    <div className="tk-khoang" role="group" aria-label="Khoảng thời gian">
      {CAC_KHOANG.map(([ma, ten]) => <button key={ma} type="button" className={`nut-loc ${dangChon === ma ? 'dang-duoc-chon' : ''}`} aria-pressed={dangChon === ma} onClick={() => chon(ma)}>{ten}</button>)}
    </div>
    {coSoSanh && <label className="tk-so-sanh"><input type="checkbox" checked={boLoc.compare} onChange={(e) => onDoi({ ...boLoc, compare: e.target.checked })} /> So với kỳ trước</label>}
    {dangChonNgay && <form className="tk-chon-ngay" onSubmit={apDung} noValidate>
      <label>Từ ngày<input type="date" value={nhap.from} max={homNayIso()} onChange={(e) => datNhap((n) => ({ ...n, from: e.target.value }))} /></label>
      <label>Đến ngày<input type="date" value={nhap.to} min={nhap.from || undefined} max={homNayIso()} onChange={(e) => datNhap((n) => ({ ...n, to: e.target.value }))} /></label>
      <Nut loaiNut="submit">Áp dụng</Nut>
      {loi && <p className="loi-truong-nhap" role="alert">{loi}</p>}
    </form>}
  </div>;
}

// cot: [{ key, label, type }]. hien(cot, dong) trả nội dung ô. Có onSapXep thì tiêu đề cột bấm để sắp xếp.
export function BangDuLieu({ cot, dong, sapXep, onSapXep, onXem, hien, tenBang, trongRong = 'Không có dữ liệu phù hợp.' }) {
  if (dong.length === 0) return <p className="tk-trong">{trongRong}</p>;
  return <div className="tk-cuon-ngang"><table className="tk-bang">
    <caption className="chi-cho-trinh-doc">{tenBang}</caption>
    <thead><tr>
      {cot.map((c) => {
        const dang = sapXep?.key === c.key;
        return <th key={c.key} scope="col" className={c.type === 'number' || c.type === 'money' ? 'tk-so' : ''} aria-sort={dang ? (sapXep.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
          {onSapXep ? <button type="button" onClick={() => onSapXep(c.key)}>{c.label}<span aria-hidden="true">{dang ? (sapXep.dir === 'asc' ? ' ↑' : ' ↓') : ''}</span></button> : c.label}
        </th>;
      })}
      {onXem && <th scope="col"><span className="chi-cho-trinh-doc">Chi tiết</span></th>}
    </tr></thead>
    <tbody>{dong.map((d, i) => <tr key={d.id ?? i}>
      {cot.map((c) => <td key={c.key} className={c.type === 'number' || c.type === 'money' ? 'tk-so' : c.type === 'datetime' || c.type === 'enum' ? 'tk-gon' : ''}>{hien(c, d)}</td>)}
      {onXem && <td><button type="button" className="tk-nut-nho" onClick={() => onXem(d)}>Xem</button></td>}
    </tr>)}</tbody>
  </table></div>;
}

export function HopThoai({ tieuDe, onDong, children }) {
  const hop = useRef(null);
  useEffect(() => {
    const phanTu = hop.current;
    if (phanTu && !phanTu.open) phanTu.showModal();
  }, []);
  return <dialog ref={hop} className="tk-hop-thoai" aria-labelledby="tk-tieu-de-hop-thoai" onClose={onDong} onClick={(e) => { if (e.target === hop.current) hop.current.close(); }}>
    <div className="tk-hop-thoai-noi-dung">
      <div className="tk-khung-dau"><h2 id="tk-tieu-de-hop-thoai">{tieuDe}</h2><button type="button" className="tk-nut-nho" onClick={() => hop.current.close()}>Đóng</button></div>
      {children}
    </div>
  </dialog>;
}
