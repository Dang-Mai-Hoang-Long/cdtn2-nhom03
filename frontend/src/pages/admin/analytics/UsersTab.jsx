import React from 'react';
import { useDuLieu } from '../../../components/analytics/useDuLieu.js';
import { VungDuLieu, KhungBieuDo } from '../../../components/analytics/Khoi.jsx';
import { BieuDoCot, BieuDoVanh, ThanhNgang, ChuGiai } from '../../../components/analytics/Charts.jsx';
import { MAU } from '../../../components/analytics/hangSo.js';
import { so, phanTram, ngayIsoHien } from '../../../components/analytics/dinhDang.js';
import { layPhanTichNguoiDung, thamSoThoiGian } from '../../../api/analyticsApi.js';
import { NHAN_VAI_TRO, dinhDangThoiGian } from '../../../utils/dinhDang.js';

const MAU_VAI_TRO = { CUSTOMER: MAU.chinh, TECHNICIAN: MAU.hai, ADMIN: MAU.ba };
const TEN_TRANG_THAI = { ACTIVE: 'Hoạt động', LOCKED: 'Bị khóa' };

function ChiSo({ ten, giaTri, giaiThich }) {
  return <div className="tk-chi-so"><span>{ten}</span><strong>{giaTri}</strong><small>{giaiThich}</small></div>;
}

export default function TabNguoiDung({ boLoc }) {
  const thamSo = thamSoThoiGian(boLoc);
  const trangThai = useDuLieu(() => layPhanTichNguoiDung(thamSo), JSON.stringify(thamSo));

  return <VungDuLieu {...trangThai}>{(d) => {
    const nvr = [
      { ten: 'Người dùng mới', mau: MAU.hai, giaTri: d.newVsReturning.series.new },
      { ten: 'Quay lại', mau: MAU.chinh, giaTri: d.newVsReturning.series.returning },
    ];
    const khongNhatKy = `Chưa có lượt đăng nhập hay thao tác nào được ghi trong kỳ này (nhật ký bắt đầu ${dinhDangThoiGian(d.loggingSince)}).`;
    const danhSach = (ten, muc, tenCot) => ({ cot: [ten, tenCot], dong: muc.map((m) => [m.name, so(m.count)]) });

    return <div className="tk-cot">
      <p className="tk-khoang-hien">Kỳ đang xem: {ngayIsoHien(d.range.from)} đến {ngayIsoHien(d.range.to)}. Người hoạt động là khách hàng hoặc kỹ thuật viên đã đăng tin, gửi đề xuất, đánh giá, chấp nhận, xác nhận hoàn thành hoặc đăng nhập; không tính quản trị viên.</p>
      <section className="tk-luoi-chi-so" aria-label="Chỉ số người dùng">
        <ChiSo ten="DAU" giaTri={so(d.dau)} giaiThich={`Hoạt động trong ngày ${ngayIsoHien(d.range.to)}`} />
        <ChiSo ten="WAU" giaTri={so(d.wau)} giaiThich="Hoạt động trong 7 ngày cuối kỳ" />
        <ChiSo ten="MAU" giaTri={so(d.mau)} giaiThich="Hoạt động trong 30 ngày cuối kỳ" />
        <ChiSo ten="Tỷ lệ giữ chân" giaTri={phanTram(d.retention.rate)} giaiThich={d.retention.base ? `${so(d.retention.retained)} trên ${so(d.retention.base)} người hoạt động kỳ trước còn hoạt động` : 'Kỳ trước không có người hoạt động'} />
        <ChiSo ten="Tỷ lệ rời bỏ" giaTri={phanTram(d.churn.rate)} giaiThich={d.churn.base ? `${so(d.churn.lost)} người hoạt động kỳ trước không quay lại` : 'Chưa tính được'} />
        <ChiSo ten="Tăng trưởng người dùng" giaTri={phanTram(d.growth.rate)} giaiThich={`${so(d.growth.totalAtStart)} → ${so(d.growth.totalAtEnd)} tài khoản (${so(d.growth.newUsers)} mới, kỳ trước ${so(d.growth.previousNewUsers)})`} />
      </section>

      <div className="tk-luoi-bieu-do">
        <KhungBieuDo rong tieuDe="Người dùng mới và quay lại" moTa={`Trong kỳ: ${so(d.newVsReturning.new)} người hoạt động mới đăng ký, ${so(d.newVsReturning.returning)} người quay lại.`} donVi="người"
          chuThich={<ChuGiai muc={nvr} />} trongRong={d.newVsReturning.new + d.newVsReturning.returning === 0 ? 'Không có người hoạt động trong kỳ.' : ''}
          bang={{ cot: ['Mốc', ...nvr.map((c) => c.ten)], dong: d.range.labels.map((n, i) => [n, ...nvr.map((c) => so(c.giaTri[i]))]) }}>
          <BieuDoCot nhan={d.range.labels} chuoi={nvr} moTa="Người dùng mới và quay lại, xếp chồng" />
        </KhungBieuDo>

        <KhungBieuDo tieuDe="Theo nhóm quyền" moTa="Tất cả tài khoản tính đến cuối kỳ." donVi="tài khoản"
          bang={{ cot: ['Nhóm quyền', 'Tài khoản'], dong: d.byRole.map((r) => [NHAN_VAI_TRO[r.key], so(r.count)]) }}>
          <BieuDoVanh moTa="Tài khoản theo nhóm quyền" donVi="tài khoản" muc={d.byRole.map((r) => ({ ten: NHAN_VAI_TRO[r.key], soLuong: r.count, mau: MAU_VAI_TRO[r.key] }))} />
        </KhungBieuDo>

        <KhungBieuDo tieuDe="Theo trạng thái tài khoản" moTa="Trạng thái hiện tại của các tài khoản tạo trước cuối kỳ." donVi="tài khoản"
          bang={{ cot: ['Trạng thái', 'Tài khoản'], dong: d.byStatus.map((r) => [TEN_TRANG_THAI[r.key], so(r.count)]) }}>
          <BieuDoVanh moTa="Tài khoản theo trạng thái" donVi="tài khoản" muc={d.byStatus.map((r) => ({ ten: TEN_TRANG_THAI[r.key], soLuong: r.count, mau: r.key === 'ACTIVE' ? MAU.chinh : MAU.bon }))} />
        </KhungBieuDo>

        <KhungBieuDo rong tieuDe="Khách hàng theo khu vực" moTa="Địa điểm của tin gần nhất mỗi khách hàng đăng. Hệ thống không lưu quốc gia nên chỉ chia theo khu vực." donVi="khách hàng"
          trongRong={d.byRegion.length === 0 ? 'Chưa có tin đăng nào.' : ''} bang={danhSach('Khu vực', d.byRegion, 'Khách hàng')}>
          <ThanhNgang muc={d.byRegion.map((r) => ({ ten: r.name, soLuong: r.count, mauRieng: r.isRest ? MAU.kyTruoc : undefined }))} />
        </KhungBieuDo>

        <KhungBieuDo tieuDe="Theo thiết bị" moTa="Người dùng có hoạt động được ghi trong kỳ, phân loại từ trình duyệt." donVi="người"
          trongRong={d.byDevice.length === 0 ? khongNhatKy : ''} bang={danhSach('Thiết bị', d.byDevice, 'Người')}>
          <ThanhNgang muc={d.byDevice.map((r) => ({ ten: r.name, soLuong: r.count }))} />
        </KhungBieuDo>

        <KhungBieuDo tieuDe="Theo hệ điều hành" moTa="Người dùng có hoạt động được ghi trong kỳ, phân loại từ trình duyệt." donVi="người"
          trongRong={d.byOs.length === 0 ? khongNhatKy : ''} bang={danhSach('Hệ điều hành', d.byOs, 'Người')}>
          <ThanhNgang muc={d.byOs.map((r) => ({ ten: r.name, soLuong: r.count }))} />
        </KhungBieuDo>
      </div>
    </div>;
  }}</VungDuLieu>;
}
