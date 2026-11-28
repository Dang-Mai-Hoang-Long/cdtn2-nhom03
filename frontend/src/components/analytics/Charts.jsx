// Biểu đồ SVG tự vẽ (không dùng thư viện). Mỗi biểu đồ có chú giải bằng chữ khi nhiều chuỗi, chú thích khi rê chuột hoặc
// dùng phím mũi tên, và luôn có bản bảng dữ liệu ở khung chứa (KhungBieuDo) nên không phụ thuộc vào màu hay chuột.
import React, { useId, useState } from 'react';
import { useBeRong } from './useDuLieu.js';
import { so } from './dinhDang.js';

const LE = { trai: 52, phai: 12, tren: 12, duoi: 28 };

// Mốc trục tung tròn số: 0 và 3 bước đều.
function mocTruc(lonNhat) {
  if (!(lonNhat > 0)) return [0, 1];
  const tho = lonNhat / 3;
  const bac = 10 ** Math.floor(Math.log10(tho));
  const buoc = [1, 2, 2.5, 5, 10].map((k) => k * bac).find((b) => b >= tho) ?? 10 * bac;
  const moc = [];
  for (let v = 0; v < lonNhat + buoc; v += buoc) moc.push(Number(v.toPrecision(12)));
  return moc;
}

function rutGonTruc(v) {
  if (v >= 1e9) return `${so(v / 1e9)} tỷ`;
  if (v >= 1e6) return `${(v / 1e6).toLocaleString('vi-VN')} tr`;
  if (v >= 1e4) return `${(v / 1e3).toLocaleString('vi-VN')} N`;
  return v.toLocaleString('vi-VN');
}

// Chọn các nhãn trục hoành cách đều sao cho không chồng lên nhau.
function nhanHienThi(soNhan, beRong) {
  const toiDa = Math.max(2, Math.floor(beRong / 64));
  const buoc = Math.max(1, Math.ceil((soNhan - 1) / (toiDa - 1)));
  const chiSo = [];
  for (let i = soNhan - 1; i >= 0; i -= buoc) chiSo.push(i);
  return new Set(chiSo);
}

export function ChuGiai({ muc }) {
  return <ul className="tk-chu-giai">{muc.map((m) => <li key={m.ten}>
    <span className={`tk-khoa-mau ${m.kieu ?? 'o'}`} style={{ '--mau': m.mau }} aria-hidden="true" />
    <span>{m.ten}</span>{m.giaTri !== undefined && !Array.isArray(m.giaTri) && <strong>{m.giaTri}</strong>}
  </li>)}</ul>;
}

function ChuThich({ x, beRong, tieuDe, dong }) {
  const benTrai = x > beRong / 2;
  return <div className="tk-chu-thich" style={{ left: x, transform: benTrai ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)' }} role="presentation">
    <span className="tk-chu-thich-tieu-de">{tieuDe}</span>
    {dong.map((d) => <span className="tk-chu-thich-dong" key={d.ten}><span className={`tk-khoa-mau ${d.kieu ?? 'duong'}`} style={{ '--mau': d.mau }} /><strong>{d.giaTri}</strong><span>{d.ten}</span></span>)}
  </div>;
}

// Điều hướng bằng bàn phím giữa các ô dữ liệu.
function useChonO(soO) {
  const [o, datO] = useState(null);
  const phim = (suKien) => {
    if (suKien.key === 'ArrowRight') datO((cu) => Math.min(soO - 1, (cu ?? -1) + 1));
    else if (suKien.key === 'ArrowLeft') datO((cu) => Math.max(0, (cu ?? soO) - 1));
    else if (suKien.key === 'Escape') datO(null);
    else return;
    suKien.preventDefault();
  };
  return [o !== null && o < soO ? o : null, datO, phim];
}

// nhanDay: tên đầy đủ của từng mốc cho chú thích, khi nhãn trên trục chỉ là mốc đầu của một nhóm.
export function BieuDoDuong({ nhan, nhanDay = nhan, chuoi, dinhDang = so, moTa, cao = 240 }) {
  const [ganKhung, beRong] = useBeRong();
  const [o, datO, phim] = useChonO(nhan.length);
  const maGradient = `tk${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const rongVe = Math.max(10, beRong - LE.trai - LE.phai);
  const caoVe = cao - LE.tren - LE.duoi;
  const moc = mocTruc(Math.max(0, ...chuoi.flatMap((c) => c.giaTri)));
  const dinh = moc[moc.length - 1];
  const x = (i) => LE.trai + (nhan.length === 1 ? rongVe / 2 : (i * rongVe) / (nhan.length - 1));
  const y = (v) => LE.tren + caoVe - (v / dinh) * caoVe;
  const hienNhan = nhanHienThi(nhan.length, rongVe);
  const duong = (gt) => gt.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  function reChuot(suKien) {
    const hop = suKien.currentTarget.getBoundingClientRect();
    const viTri = suKien.clientX - hop.left - LE.trai;
    datO(Math.max(0, Math.min(nhan.length - 1, Math.round((viTri / rongVe) * (nhan.length - 1)))));
  }

  return <div className="tk-bieu-do" ref={ganKhung}>
    {beRong > 0 && <svg width={beRong} height={cao} role="img" aria-label={`${moTa}. Dùng phím mũi tên trái, phải để xem từng mốc.`} tabIndex={0}
      onPointerMove={reChuot} onPointerLeave={() => datO(null)} onKeyDown={phim} onBlur={() => datO(null)}>
      {moc.map((m) => <g key={m}><line className="tk-luoi" x1={LE.trai} x2={beRong - LE.phai} y1={y(m)} y2={y(m)} /><text className="tk-nhan-truc" x={LE.trai - 8} y={y(m) + 4} textAnchor="end">{rutGonTruc(m)}</text></g>)}
      {nhan.map((n, i) => hienNhan.has(i) && <text key={`${n}-${i}`} className="tk-nhan-truc" x={x(i)} y={cao - 8} textAnchor={i === nhan.length - 1 && nhan.length > 1 ? 'end' : 'middle'}>{n}</text>)}
      {chuoi.map((c, j) => c.vung && <g key={`vung-${c.ten}`}>
        <linearGradient id={`${maGradient}-${j}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.mau} stopOpacity="0.18" /><stop offset="1" stopColor={c.mau} stopOpacity="0.04" /></linearGradient>
        <path d={`${duong(c.giaTri)} L${x(nhan.length - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#${maGradient}-${j})`} />
      </g>)}
      {[...chuoi].reverse().map((c) => <path key={c.ten} d={duong(c.giaTri)} fill="none" stroke={c.mau} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" strokeDasharray={c.dut ? '5 5' : undefined} />)}
      {nhan.length === 1 && chuoi.map((c) => <circle key={c.ten} cx={x(0)} cy={y(c.giaTri[0])} r="4" fill={c.mau} />)}
      {o !== null && <g>
        <line className="tk-chi-doc" x1={x(o)} x2={x(o)} y1={LE.tren} y2={LE.tren + caoVe} />
        {chuoi.map((c) => <circle key={c.ten} cx={x(o)} cy={y(c.giaTri[o])} r="4.5" fill={c.mau} className="tk-diem" />)}
      </g>}
    </svg>}
    {o !== null && <ChuThich x={x(o)} beRong={beRong} tieuDe={nhanDay[o]} dong={chuoi.map((c) => ({ ten: c.ten, mau: c.mau, kieu: c.dut ? 'dut' : 'duong', giaTri: dinhDang(c.giaTri[o]) }))} />}
    <span className="chi-cho-trinh-doc" aria-live="polite">{o !== null ? `${nhanDay[o]}: ${chuoi.map((c) => `${c.ten} ${dinhDang(c.giaTri[o])}`).join(', ')}` : ''}</span>
  </div>;
}

// Cột chồng (mặc định) hoặc cột nhóm (nhom = true).
export function BieuDoCot({ nhan, nhanDay = nhan, chuoi, nhom = false, dinhDang = so, moTa, cao = 240 }) {
  const [ganKhung, beRong] = useBeRong();
  const [o, datO, phim] = useChonO(nhan.length);
  const rongVe = Math.max(10, beRong - LE.trai - LE.phai);
  const caoVe = cao - LE.tren - LE.duoi;
  const lonNhat = Math.max(0, ...nhan.map((_, i) => (nhom ? Math.max(...chuoi.map((c) => c.giaTri[i])) : chuoi.reduce((a, c) => a + c.giaTri[i], 0))));
  const moc = mocTruc(lonNhat);
  const dinh = moc[moc.length - 1];
  const buoc = rongVe / nhan.length;
  const soCot = nhom ? chuoi.length : 1;
  const rongCot = Math.max(1, Math.min(24, (buoc * 0.72 - (soCot - 1) * 2) / soCot));
  const y = (v) => LE.tren + caoVe - (v / dinh) * caoVe;
  const hienNhan = nhanHienThi(nhan.length, rongVe);
  const tamO = (i) => LE.trai + buoc * i + buoc / 2;
  // Cột bo tròn 4px ở đầu dữ liệu, vuông ở chân.
  const hinhCot = (cx, tren, duoi, bo) => {
    const r = bo ? Math.min(4, rongCot / 2, duoi - tren) : 0;
    return `M${cx},${duoi} V${tren + r} Q${cx},${tren} ${cx + r},${tren} H${cx + rongCot - r} Q${cx + rongCot},${tren} ${cx + rongCot},${tren + r} V${duoi} Z`;
  };

  return <div className="tk-bieu-do" ref={ganKhung}>
    {beRong > 0 && <svg width={beRong} height={cao} role="img" aria-label={`${moTa}. Dùng phím mũi tên trái, phải để xem từng mốc.`} tabIndex={0}
      onPointerLeave={() => datO(null)} onKeyDown={phim} onBlur={() => datO(null)}>
      {moc.map((m) => <g key={m}><line className="tk-luoi" x1={LE.trai} x2={beRong - LE.phai} y1={y(m)} y2={y(m)} /><text className="tk-nhan-truc" x={LE.trai - 8} y={y(m) + 4} textAnchor="end">{rutGonTruc(m)}</text></g>)}
      {nhan.map((n, i) => {
        let chong = 0;
        const dauNhom = tamO(i) - (soCot * rongCot + (soCot - 1) * 2) / 2;
        const lopTren = chuoi.reduce((a, c, j) => (c.giaTri[i] > 0 ? j : a), -1);
        return <g key={`${n}-${i}`} onPointerEnter={() => datO(i)} className={o === i ? 'tk-o-dang-chon' : ''}>
          <rect x={LE.trai + buoc * i} y={LE.tren} width={buoc} height={caoVe} fill="transparent" />
          {chuoi.map((c, j) => {
            const v = c.giaTri[i];
            if (!(v > 0)) return null;
            if (nhom) return <path key={c.ten} d={hinhCot(dauNhom + j * (rongCot + 2), y(v), y(0), true)} fill={c.mau} />;
            const duoi = y(chong) - (chong > 0 ? 2 : 0);
            chong += v;
            const tren = Math.min(y(chong), duoi - 1);
            return <path key={c.ten} d={hinhCot(dauNhom, tren, duoi, j === lopTren)} fill={c.mau} />;
          })}
          {hienNhan.has(i) && <text className="tk-nhan-truc" x={tamO(i)} y={cao - 8} textAnchor="middle">{n}</text>}
        </g>;
      })}
    </svg>}
    {o !== null && <ChuThich x={tamO(o)} beRong={beRong} tieuDe={nhanDay[o]} dong={chuoi.map((c) => ({ ten: c.ten, mau: c.mau, kieu: 'o', giaTri: dinhDang(c.giaTri[o]) }))} />}
    <span className="chi-cho-trinh-doc" aria-live="polite">{o !== null ? `${nhanDay[o]}: ${chuoi.map((c) => `${c.ten} ${dinhDang(c.giaTri[o])}`).join(', ')}` : ''}</span>
  </div>;
}

// Danh sách thanh ngang một màu, giá trị ghi ở đầu thanh.
export function ThanhNgang({ muc, dinhDang = so, mau = 'var(--tk-s1)' }) {
  const lonNhat = Math.max(1, ...muc.map((m) => m.soLuong));
  return <ul className="tk-thanh-ngang">{muc.map((m) => <li key={m.ten}>
    <span className="tk-thanh-ten" title={m.ten}>{m.ten}</span>
    <span className="tk-thanh-ranh"><span style={{ width: `${(m.soLuong / lonNhat) * 100}%`, background: m.mauRieng ?? mau }} /></span>
    <strong>{dinhDang(m.soLuong)}</strong>
  </li>)}</ul>;
}

// Biểu đồ vành khuyên cho tỷ lệ ít nhóm (tối đa 6), tổng ở giữa, chú giải kèm số và phần trăm.
// anTong: không ghi tổng ở giữa (đã có ở hàng số liệu), chỉ hiện số của phần đang rê chuột.
export function BieuDoVanh({ muc, donVi, moTa, anTong = false }) {
  const [dangChon, datDangChon] = useState(null);
  const tong = muc.reduce((a, m) => a + m.soLuong, 0);
  const R = 70;
  const r = 46;
  let goc = -Math.PI / 2;
  const khe = muc.filter((m) => m.soLuong > 0).length > 1 ? 0.025 : 0;
  const cung = muc.map((m) => {
    const rong = tong ? (m.soLuong / tong) * Math.PI * 2 : 0;
    const dau = goc;
    goc += rong;
    if (!m.soLuong) return null;
    const a = dau + khe / 2;
    const b = Math.max(a + 0.001, goc - khe / 2 - (rong > 6.28 ? 0.001 : 0));
    const diem = (g, bk) => `${(80 + Math.cos(g) * bk).toFixed(2)},${(80 + Math.sin(g) * bk).toFixed(2)}`;
    const lon = b - a > Math.PI ? 1 : 0;
    return { ...m, d: `M${diem(a, R)} A${R},${R} 0 ${lon} 1 ${diem(b, R)} L${diem(b, r)} A${r},${r} 0 ${lon} 0 ${diem(a, r)} Z` };
  }).filter(Boolean);
  const hien = dangChon ? muc.find((m) => m.ten === dangChon) : null;
  const tyLe = (v) => (tong ? `${((v / tong) * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : '0%');

  return <div className="tk-vanh">
    <svg viewBox="0 0 160 160" role="img" aria-label={`${moTa}: ${muc.map((m) => `${m.ten} ${so(m.soLuong)}`).join(', ')}`}>
      {tong === 0 && <circle cx="80" cy="80" r="58" className="tk-vanh-rong" />}
      {cung.map((c) => <path key={c.ten} d={c.d} fill={c.mau} opacity={dangChon && dangChon !== c.ten ? 0.45 : 1}
        onPointerEnter={() => datDangChon(c.ten)} onPointerLeave={() => datDangChon(null)}><title>{`${c.ten}: ${so(c.soLuong)} (${tyLe(c.soLuong)})`}</title></path>)}
      {(hien || !anTong) && <>
        <text x="80" y="78" textAnchor="middle" className="tk-vanh-so">{so(hien ? hien.soLuong : tong)}</text>
        <text x="80" y="97" textAnchor="middle" className="tk-nhan-truc">{hien ? tyLe(hien.soLuong) : donVi}</text>
      </>}
    </svg>
    <ChuGiai muc={muc.map((m) => ({ ten: m.ten, mau: m.mau, giaTri: `${so(m.soLuong)} ${donVi} (${tyLe(m.soLuong)})` }))} />
  </div>;
}

const CAC_THU = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];
const THU_NGAN = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const SO_BAC = 5;

// Ngưỡng trên của từng bậc màu, chia theo phân vị của các ô khác 0 để một ô đột biến không làm mọi ô khác nhạt như nhau.
function nguongBac(bang) {
  const khac0 = bang.flat().filter((v) => v > 0).sort((a, b) => a - b);
  if (khac0.length === 0) return [];
  const nguong = Array.from({ length: SO_BAC }, (_, i) => khac0[Math.ceil(((i + 1) / SO_BAC) * khac0.length) - 1]);
  return [...new Set(nguong)];
}

// Bản đồ nhiệt thứ × giờ: một sắc độ từ nhạt đến đậm; chú giải ghi rõ khoảng số của từng bậc.
export function BanDoNhiet({ bang, donVi, moTa }) {
  const [oChon, datOChon] = useState(null);
  const nguong = nguongBac(bang);
  // Ít bậc hơn năm thì dùng các màu đậm trước để vẫn phân biệt rõ.
  const bu = SO_BAC - nguong.length;
  const bac = (v) => (v === 0 ? 0 : nguong.findIndex((n) => v <= n) + 1 + bu);
  const chuGiai = [{ bac: 0, chu: '0' }, ...nguong.map((n, i) => {
    const tu = i === 0 ? 1 : nguong[i - 1] + 1;
    return { bac: i + 1 + bu, chu: tu >= n ? so(n) : `${so(tu)}–${so(n)}` };
  })];
  return <div className="tk-nhiet-khung">
    <div className="tk-nhiet" role="img" aria-label={moTa} onPointerLeave={() => datOChon(null)}>
      {bang.map((dong, t) => <React.Fragment key={THU_NGAN[t]}>
        <span className="tk-nhiet-thu">{THU_NGAN[t]}</span>
        {dong.map((v, g) => <span key={g} className={`tk-nhiet-o bac-${bac(v)} ${oChon?.t === t && oChon?.g === g ? 'dang-chon' : ''}`}
          title={`${CAC_THU[t]}, ${g}:00–${g + 1}:00: ${so(v)} ${donVi}`} onPointerEnter={() => datOChon({ t, g, v })} />)}
      </React.Fragment>)}
      <span />
      {Array.from({ length: 24 }, (_, g) => <span key={g} className="tk-nhiet-gio">{g % 3 === 0 ? g : ''}</span>)}
    </div>
    <div className="tk-nhiet-chan">
      <span aria-live="polite">{oChon ? `${CAC_THU[oChon.t]}, ${oChon.g}:00–${oChon.g + 1}:00: ${so(oChon.v)} ${donVi}` : 'Rê chuột vào ô để xem số. Giờ Việt Nam.'}</span>
      <span className="tk-nhiet-thang">{chuGiai.map((m) => <span key={m.bac}><span className={`tk-nhiet-o bac-${m.bac}`} />{m.chu}</span>)}</span>
    </div>
  </div>;
}

// Đồng hồ đo mức sử dụng tài nguyên (0 đến 100%), đổi sang màu cảnh báo khi vượt ngưỡng và ghi rõ bằng chữ.
export function DongHo({ ten, phanTram, nguong, chiTiet }) {
  const coSo = phanTram !== null && phanTram !== undefined;
  const v = coSo ? Math.max(0, Math.min(100, phanTram)) : 0;
  const vuot = coSo && v > nguong;
  const diem = (p, bk = 60) => {
    const g = Math.PI * (1 - p / 100);
    return `${(70 + Math.cos(g) * bk).toFixed(2)},${(70 - Math.sin(g) * bk).toFixed(2)}`;
  };
  return <div className={`tk-dong-ho ${vuot ? 'vuot' : ''}`}>
    <h3>{ten}</h3>
    <svg viewBox="0 0 140 92" role="img" aria-label={coSo ? `${ten} ${v}%, ngưỡng ${nguong}%${vuot ? ', đang vượt ngưỡng' : ''}` : `${ten}: chưa có số đo`}>
      <path className="tk-dong-ho-ranh" d={`M${diem(0)} A60,60 0 0 1 ${diem(100)}`} />
      {v > 0 && <path className="tk-dong-ho-muc" d={`M${diem(0)} A60,60 0 0 1 ${diem(v)}`} />}
      <path className="tk-dong-ho-nguong" d={`M${diem(nguong, 50)} L${diem(nguong, 70)}`} />
      <text x="70" y="64" textAnchor="middle" className="tk-vanh-so">{coSo ? `${v.toLocaleString('vi-VN')}%` : '—'}</text>
      <text x="70" y="84" textAnchor="middle" className="tk-nhan-truc">{coSo ? (vuot ? 'Vượt ngưỡng' : `Ngưỡng ${nguong}%`) : 'Chưa đo'}</text>
    </svg>
    <p>{chiTiet}</p>
  </div>;
}
