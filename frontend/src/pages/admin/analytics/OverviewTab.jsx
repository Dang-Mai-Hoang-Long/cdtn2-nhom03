import React from 'react';
import { useDuLieu } from '../../../components/analytics/useDuLieu.js';
import { VungDuLieu, TheSoLieu, KhungBieuDo, BangDuLieu } from '../../../components/analytics/Khoi.jsx';
import { BieuDoDuong, BieuDoVanh, ChuGiai } from '../../../components/analytics/Charts.jsx';
import { MAU, duongDanThongKe } from '../../../components/analytics/hangSo.js';
import { so, tienGon, tienDayDu, ngayIsoHien, ghiChuMocCuoi, NHAN_HANH_DONG } from '../../../components/analytics/dinhDang.js';
import { layTongQuan, thamSoThoiGian } from '../../../api/analyticsApi.js';
import { dinhDangThoiGian, NHAN_TRANG_THAI_YEU_CAU } from '../../../utils/dinhDang.js';
import { ThongBao, DangTai, LienKetNguoiDung } from '../../../components/Ui.jsx';
import DanhSachCanhBao from './AlertList.jsx';

const MAU_TRANG_THAI = { COMPLETED: MAU.chinh, WAITING_PROPOSAL: MAU.hai, CLOSED: MAU.ba, SELECTED: MAU.bon };

function cacThe(d, coSoSanh) {
  const the = Object.fromEntries(d.cards.map((c) => [c.key, c]));
  const ghiNhatKy = `Ghi từ ${dinhDangThoiGian(d.loggingSince)}`;
  const kyTruoc = (c, f = so) => (coSoSanh ? `Kỳ trước: ${f(c.previous)}` : '');
  return [
    { key: 'totalUsers', ten: 'Tổng người dùng', giaTri: so(the.totalUsers.value), ghiChu: `+${so(the.totalUsers.added)} trong kỳ`, lienKet: duongDanThongKe('nguoi-dung') },
    { key: 'newUsers', ten: 'Người dùng mới', giaTri: so(the.newUsers.value), ghiChu: kyTruoc(the.newUsers), lienKet: duongDanThongKe('bao-cao', { loai: 'users' }) },
    { key: 'activeUsers', ten: 'Người dùng hoạt động', giaTri: so(the.activeUsers.value), ghiChu: 'Khách hàng, kỹ thuật viên đã đăng tin, đề xuất, đánh giá hoặc đăng nhập', lienKet: duongDanThongKe('hoat-dong') },
    { key: 'transactions', ten: 'Giao dịch', giaTri: so(the.transactions.value), ghiChu: `Đề xuất được chấp nhận; ${so(the.transactions.completed)} việc hoàn thành`, lienKet: duongDanThongKe('bao-cao', { loai: 'transactions' }) },
    { key: 'completedValue', ten: 'Giá trị công việc', giaTri: <span title={tienDayDu(the.completedValue.value)}>{tienGon(the.completedValue.value)}</span>, ghiChu: 'Việc đã hoàn thành, không phải doanh thu nền tảng', lienKet: duongDanThongKe('bao-cao', { loai: 'revenue' }) },
    { key: 'totalContent', ten: 'Tổng nội dung', giaTri: so(the.totalContent.value), ghiChu: `${so(the.totalContent.breakdown.requests)} tin, ${so(the.totalContent.breakdown.proposals)} đề xuất, ${so(the.totalContent.breakdown.reviews)} đánh giá`, lienKet: duongDanThongKe('tang-truong') },
    {
      key: 'pendingTasks', ten: 'Việc chờ xử lý', giaTri: so(the.pendingTasks.value), boQuaSoSanh: true, sacThai: the.pendingTasks.requestsOverdue > 0 ? 'can-chu-y' : '',
      ghiChu: `Tin chờ đề xuất (hiện tại), ${so(the.pendingTasks.requestsOverdue)} quá giờ hẹn; ${so(the.pendingTasks.proposalsPending)} đề xuất chờ chọn`, lienKet: duongDanThongKe('canh-bao'),
    },
    { key: 'systemErrors', ten: 'Lỗi hệ thống', giaTri: so(the.systemErrors.value), tangLaXau: true, sacThai: the.systemErrors.value > 0 ? 'loi' : '', ghiChu: `Phản hồi 500, gồm cả lúc mất CSDL (ghi bù khi chạy lại). ${ghiNhatKy}`, lienKet: duongDanThongKe('bao-cao', { loai: 'errors' }) },
  ].map((t) => ({ ...t, spark: the[t.key].series, thayDoi: t.boQuaSoSanh ? undefined : the[t.key].change }));
}

export default function TabTongQuan({ boLoc, canhBao }) {
  const thamSo = thamSoThoiGian(boLoc);
  const trangThai = useDuLieu(() => layTongQuan(thamSo), JSON.stringify(thamSo));

  return <VungDuLieu {...trangThai}>{(d) => {
    const khoang = `${ngayIsoHien(d.range.from)} đến ${ngayIsoHien(d.range.to)}`;
    const so1 = d.requestsTrend.current.reduce((a, b) => a + b, 0);
    const so2 = d.requestsTrend.previous.reduce((a, b) => a + b, 0);
    const chuoi = [{ ten: 'Kỳ này', mau: MAU.chinh, giaTri: d.requestsTrend.current, vung: true }];
    if (boLoc.compare) chuoi.push({ ten: 'Kỳ trước', mau: MAU.kyTruoc, giaTri: d.requestsTrend.previous, dut: true });
    const moCanhBao = canhBao.duLieu?.alerts.filter((a) => a.status !== 'RESOLVED') ?? [];

    return <div className="tk-cot">
      <p className="tk-khoang-hien">Kỳ đang xem: {khoang}{boLoc.compare ? `, so với ${ngayIsoHien(d.range.previousFrom)} đến ${ngayIsoHien(d.range.previousTo)}` : ''}.{ghiChuMocCuoi(d.range)}</p>
      <section className="tk-luoi-the" aria-label="Chỉ số tổng quan">
        {cacThe(d, boLoc.compare).map(({ key, boQuaSoSanh, ...the }) => <TheSoLieu key={key} bieuTuong={key} coSoSanh={boLoc.compare} {...the} />)}
      </section>

      <div className="tk-hai-cot">
        <KhungBieuDo tieuDe="Tin sửa chữa mới" moTa={`Số tin đăng theo ${d.range.bucket === 'hour' ? 'giờ' : d.range.bucket === 'month' ? 'tháng' : 'ngày'}.`} donVi="tin"
          chuThich={boLoc.compare && <ChuGiai muc={[{ ten: 'Kỳ này', mau: MAU.chinh, kieu: 'duong', giaTri: so(so1) }, { ten: 'Kỳ trước', mau: MAU.kyTruoc, kieu: 'dut', giaTri: so(so2) }]} />}
          trongRong={so1 + (boLoc.compare ? so2 : 0) === 0 ? 'Chưa có tin nào trong khoảng thời gian này.' : ''}
          bang={{ cot: ['Mốc', 'Kỳ này', ...(boLoc.compare ? ['Kỳ trước'] : [])], dong: d.range.labels.map((n, i) => [n, so(d.requestsTrend.current[i]), ...(boLoc.compare ? [so(d.requestsTrend.previous[i])] : [])]) }}>
          <BieuDoDuong nhan={d.range.labels} chuoi={chuoi} moTa={`Tin mới: kỳ này ${so1}${boLoc.compare ? `, kỳ trước ${so2}` : ''}`} />
        </KhungBieuDo>

        <section className="tk-khung">
          <div className="tk-khung-dau"><div><h2>Cảnh báo cần chú ý</h2><p>{canhBao.duLieu ? `${moCanhBao.length} cảnh báo chưa xử lý xong.` : 'Đang kiểm tra…'}</p></div><a className="lien-ket-van-ban" href={duongDanThongKe('canh-bao')}>Xem tất cả</a></div>
          {!canhBao.duLieu && !canhBao.loi && <DangTai />}
          <ThongBao loai="loi">{canhBao.loi}</ThongBao>
          {canhBao.duLieu && moCanhBao.length === 0 && <p className="tk-trong">Không có cảnh báo nào đang mở.</p>}
          {moCanhBao.length > 0 && <DanhSachCanhBao cacCanhBao={moCanhBao.slice(0, 3)} onCapNhat={canhBao.taiLai} gon />}
        </section>
      </div>

      <div className="tk-hai-cot">
        <section className="tk-khung">
          <div className="tk-khung-dau"><div><h2>Hoạt động gần đây</h2><p>5 việc mới nhất trên toàn hệ thống.</p></div><a className="lien-ket-van-ban" href={duongDanThongKe('bao-cao', { loai: 'activity' })}>Xem nhật ký</a></div>
          <BangDuLieu tenBang="Hoạt động gần đây" dong={d.recent}
            cot={[{ key: 'createdAt', label: 'Thời điểm' }, { key: 'userName', label: 'Người dùng' }, { key: 'action', label: 'Thao tác' }, { key: 'target', label: 'Đối tượng' }]}
            hien={(c, r) => c.key === 'createdAt' ? dinhDangThoiGian(r.createdAt) : c.key === 'action' ? NHAN_HANH_DONG[r.action] ?? r.action : c.key === 'userName' ? <LienKetNguoiDung id={r.userId}>{r.userName}</LienKetNguoiDung> : r.target} />
        </section>

        <KhungBieuDo tieuDe="Tin theo trạng thái" moTa="Toàn bộ tin hiện có, không theo khoảng thời gian." donVi="tin"
          bang={{ cot: ['Trạng thái', 'Số tin'], dong: d.requestStatus.map((s) => [NHAN_TRANG_THAI_YEU_CAU[s.key], so(s.count)]) }}
          trongRong={d.requestStatus.length === 0 ? 'Chưa có tin sửa chữa nào.' : ''}>
          <BieuDoVanh moTa="Tin theo trạng thái" donVi="tin" muc={d.requestStatus.map((s) => ({ ten: NHAN_TRANG_THAI_YEU_CAU[s.key] ?? s.key, soLuong: s.count, mau: MAU_TRANG_THAI[s.key] ?? MAU.kyTruoc }))} />
        </KhungBieuDo>
      </div>
    </div>;
  }}</VungDuLieu>;
}
