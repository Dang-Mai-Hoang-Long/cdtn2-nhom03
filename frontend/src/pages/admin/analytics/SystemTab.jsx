import React, { useEffect, useState } from 'react';
import { useDuLieu } from '../../../components/analytics/useDuLieu.js';
import { VungDuLieu, KhungBieuDo } from '../../../components/analytics/Khoi.jsx';
import { BieuDoDuong, DongHo } from '../../../components/analytics/Charts.jsx';
import { MAU, duongDanThongKe } from '../../../components/analytics/hangSo.js';
import { so, soLe, miliGiay, dungLuong, thoiLuong, phanTram } from '../../../components/analytics/dinhDang.js';
import { layTinhTrangHeThong, kiemTraMayChu } from '../../../api/analyticsApi.js';
import { dinhDangThoiGian } from '../../../utils/dinhDang.js';
import { ThongBao, Nut } from '../../../components/Ui.jsx';
import { HuyHieuMucDo } from './AlertList.jsx';

const gio = (iso) => new Date(iso).toLocaleTimeString('vi-VN', { hour12: false });

// Khi không đọc được số đo: kiểm tra backend còn sống không để nói đúng sự cố (mất kết nối hay lỗi CSDL / máy chủ).
function useChanDoan(loi) {
  const [thongBao, datThongBao] = useState('');
  useEffect(() => {
    let daHuy = false;
    if (!loi) {
      datThongBao('');
      return undefined;
    }
    kiemTraMayChu().then((song) => !daHuy && datThongBao(song
      ? 'Backend vẫn chạy nhưng không đọc được số đo: nhiều khả năng cơ sở dữ liệu đang gặp sự cố.'
      : 'Mất kết nối tới máy chủ backend. Số liệu bên dưới (nếu có) là của lần đo trước.'));
    return () => { daHuy = true; };
  }, [loi]);
  return thongBao;
}

export default function TabHeThong() {
  const [tuLamMoi, datTuLamMoi] = useState(true);
  const trangThai = useDuLieu(layTinhTrangHeThong, 'he-thong', { chuKy: tuLamMoi ? 15000 : 0 });
  const chanDoan = useChanDoan(trangThai.loi);

  return <div className="tk-cot">
    {chanDoan && <div className="tk-bao-dong" role="alert"><HuyHieuMucDo muc="critical" /><span>{chanDoan}</span></div>}
    <div className="tk-thanh-lam-moi">
      <span className="tk-phu">{trangThai.duLieu ? `Đo lúc ${gio(trangThai.duLieu.at)}` : 'Đang đo…'}{tuLamMoi ? ', tự đo lại sau mỗi 15 giây.' : ', đã dừng tự làm mới.'}</span>
      <button type="button" className="tk-nut-nho" aria-pressed={!tuLamMoi} onClick={() => datTuLamMoi((v) => !v)}>{tuLamMoi ? 'Tạm dừng' : 'Tiếp tục tự làm mới'}</button>
      <Nut laNutPhu onClick={trangThai.taiLai}>Đo ngay</Nut>
    </div>
    <VungDuLieu {...trangThai}>{(d) => {
      const nguong = d.thresholds;
      const db = d.database;
      const lichSu = d.history;
      const nhan = lichSu.map((m) => gio(m.at));
      const bieuDo = (tieuDe, moTa, donVi, chuoi, dinhDang) => <KhungBieuDo tieuDe={tieuDe} moTa={moTa} donVi={donVi}
        trongRong={lichSu.length < 2 ? 'Cần ít nhất hai lần đo (khoảng 30 giây sau khi backend khởi động) mới vẽ được.' : ''}
        chuThich={chuoi.length > 1 && <ul className="tk-chu-giai">{chuoi.map((c) => <li key={c.ten}><span className="tk-khoa-mau duong" style={{ '--mau': c.mau }} aria-hidden="true" /><span>{c.ten}</span></li>)}</ul>}
        bang={{ cot: ['Giờ', ...chuoi.map((c) => c.ten)], dong: lichSu.map((m, i) => [nhan[i], ...chuoi.map((c) => dinhDang(c.giaTri[i]))]) }}>
        <BieuDoDuong nhan={nhan} chuoi={chuoi} moTa={tieuDe} dinhDang={dinhDang} cao={200} />
      </KhungBieuDo>;
      const cot = (khoa) => lichSu.map((m) => m[khoa] ?? 0);

      return <div className="tk-cot">
        {d.alerts.length > 0
          ? <ul className="tk-canh-bao gon" aria-label="Cảnh báo hệ thống đang vượt ngưỡng">{d.alerts.map((a) => <li key={a.key}><div className="tk-canh-bao-dau"><HuyHieuMucDo muc={a.severity} /></div><h3>{a.title}</h3><p>{a.description} <strong>Đề xuất:</strong> {a.suggestion}</p></li>)}</ul>
          : <ThongBao loai="thanh-cong">Không chỉ số nào đang vượt ngưỡng.</ThongBao>}

        <section className="tk-khung tk-luoi-dong-ho" aria-label="Mức sử dụng tài nguyên">
          <DongHo ten="CPU" phanTram={d.cpu ? Number(d.cpu.systemPct.toFixed(1)) : null} nguong={nguong.cpuPct} chiTiet={d.cpu ? `${d.cpu.cores} luồng, riêng backend ${soLe(d.cpu.processPct)}%` : 'Cần hai lần đo để tính'} />
          <DongHo ten="RAM" phanTram={Number(d.memory.systemUsedPct.toFixed(1))} nguong={nguong.ramPct} chiTiet={`${dungLuong(d.memory.usedBytes)} / ${dungLuong(d.memory.totalBytes)}; backend ${dungLuong(d.memory.processRssBytes)}`} />
          <DongHo ten="Ổ đĩa" phanTram={d.disk ? Number(d.disk.usedPct.toFixed(1)) : null} nguong={nguong.diskPct} chiTiet={d.disk ? `Còn trống ${dungLuong(d.disk.freeBytes)} / ${dungLuong(d.disk.totalBytes)}` : 'Hệ điều hành không cho đọc'} />
        </section>

        <section className="tk-luoi-chi-so" aria-label="Chỉ số máy chủ">
          <div className="tk-chi-so"><span>Cơ sở dữ liệu</span><strong className={db.ok ? 'tot' : 'xau'}>{db.ok ? 'Hoạt động' : 'Lỗi'}</strong><small>{db.ok ? `PostgreSQL ${db.version}, phản hồi ${miliGiay(db.latencyMs)}, ${dungLuong(db.sizeBytes)}` : `Mã lỗi ${db.error}`}</small></div>
          <div className="tk-chi-so"><span>Kết nối đang mở</span><strong>{db.ok ? so(db.activeConnections) : '—'}</strong><small>{db.ok ? `tối đa ${so(db.maxConnections)}; ` : ''}pool {so(db.pool.total)} (rảnh {so(db.pool.idle)}, chờ {so(db.pool.waiting)})</small></div>
          <div className="tk-chi-so"><span>Thời gian phản hồi API</span><strong>{miliGiay(d.api.p95Ms)}</strong><small>p95 trong 5 phút; trung bình {miliGiay(d.api.avgMs)}; ngưỡng {so(nguong.apiP95Ms)} ms</small></div>
          <div className="tk-chi-so"><span>Tỷ lệ lỗi API</span><strong>{d.api.requests ? phanTram(d.api.errorRate) : '—'}</strong><small>{so(d.api.errors5xx)} lỗi 5xx và {so(d.api.errors4xx)} lỗi 4xx trên {so(d.api.requests)} yêu cầu (5 phút)</small></div>
          <div className="tk-chi-so"><span>Thời gian chạy</span><strong>{thoiLuong(d.uptimeSeconds)}</strong><small>Backend từ {dinhDangThoiGian(d.startedAt)}; máy đã chạy {thoiLuong(d.osUptimeSeconds)}</small></div>
          <div className="tk-chi-so"><span>Lưu lượng API</span><strong>{dungLuong(d.network.bytesIn + d.network.bytesOut)}</strong><small>Nhận {dungLuong(d.network.bytesIn)}, gửi {dungLuong(d.network.bytesOut)} từ khi backend khởi động; yêu cầu đang xử lý: {so(d.api.inFlight)}</small></div>
        </section>

        <div className="tk-luoi-bieu-do">
          {bieuDo('CPU và RAM', 'Mức sử dụng của máy chủ qua các lần đo.', '%', [{ ten: 'CPU', mau: MAU.chinh, giaTri: cot('cpuPct') }, { ten: 'RAM', mau: MAU.hai, giaTri: cot('ramPct') }], (v) => `${soLe(v)}%`)}
          {bieuDo('Phản hồi API p95', 'Trong một phút trước mỗi lần đo; 0 khi không có yêu cầu.', 'mili giây', [{ ten: 'p95', mau: MAU.ba, giaTri: cot('p95Ms') }], miliGiay)}
          {bieuDo('Yêu cầu mỗi phút', 'Số yêu cầu API trong phút trước mỗi lần đo (lưu lượng).', 'yêu cầu', [{ ten: 'Yêu cầu', mau: MAU.chinh, giaTri: cot('requests') }], so)}
          {bieuDo('Cơ sở dữ liệu phản hồi', 'Thời gian chạy truy vấn kiểm tra.', 'mili giây', [{ ten: 'Phản hồi', mau: MAU.bon, giaTri: cot('dbMs') }], miliGiay)}
        </div>
        <p className="tk-phu">Ngưỡng cảnh báo: CPU {nguong.cpuPct}%, RAM {nguong.ramPct}%, ổ đĩa {nguong.diskPct}%, API p95 {so(nguong.apiP95Ms)} ms, lỗi 5xx {nguong.errorRatePct}% (từ {nguong.errorRateMinRequests} yêu cầu), CSDL {nguong.dbMs} ms. Lịch sử chỉ có từ khi backend khởi động. <a className="lien-ket-van-ban" href={duongDanThongKe('bao-cao', { loai: 'system' })}>Xem báo cáo hệ thống</a></p>
      </div>;
    }}</VungDuLieu>
  </div>;
}
