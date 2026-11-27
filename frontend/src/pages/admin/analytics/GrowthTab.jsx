import React from 'react';
import { useDuLieu } from '../../../components/analytics/useDuLieu.js';
import { VungDuLieu, KhungBieuDo } from '../../../components/analytics/Khoi.jsx';
import { BieuDoDuong, BieuDoCot, ChuGiai } from '../../../components/analytics/Charts.jsx';
import { MAU } from '../../../components/analytics/hangSo.js';
import { so, tienGon, tienDayDu, phanTram, ngayIsoHien, ghiChuMocCuoi } from '../../../components/analytics/dinhDang.js';
import { layTangTruong, thamSoThoiGian } from '../../../api/analyticsApi.js';

const tong = (m) => m.reduce((a, b) => a + b, 0);

function moTaThayDoi(nay, truoc, dinhDang = so) {
  if (!truoc) return `Kỳ này ${dinhDang(nay)}; kỳ trước chưa có.`;
  const tyLe = (nay - truoc) / truoc;
  return `Kỳ này ${dinhDang(nay)}, kỳ trước ${dinhDang(truoc)} (${tyLe > 0 ? 'tăng' : tyLe < 0 ? 'giảm' : 'không đổi'}${tyLe ? ` ${phanTram(Math.abs(tyLe))}` : ''}).`;
}

export default function TabTangTruong({ boLoc }) {
  const thamSo = thamSoThoiGian(boLoc);
  const trangThai = useDuLieu(() => layTangTruong(thamSo), JSON.stringify(thamSo));

  return <VungDuLieu {...trangThai}>{(d) => {
    const nhan = d.range.labels;
    const donViO = d.range.bucket === 'hour' ? 'giờ' : d.range.bucket === 'month' ? 'tháng' : 'ngày';
    // Biểu đồ đường kỳ này / kỳ trước dùng chung một cách dựng.
    const duong = ({ tieuDe, moTa, donVi, day, dinhDang = so, vung = false, tongKy }) => {
      const chuoi = [{ ten: 'Kỳ này', mau: MAU.chinh, giaTri: day.current, vung }];
      if (boLoc.compare) chuoi.push({ ten: 'Kỳ trước', mau: MAU.kyTruoc, giaTri: day.previous, dut: true });
      const rong = Math.max(0, ...day.current, ...(boLoc.compare ? day.previous : [])) === 0;
      return <KhungBieuDo tieuDe={tieuDe} moTa={`${moTa}${tongKy ? ` ${boLoc.compare ? moTaThayDoi(tongKy.current, tongKy.previous, dinhDang) : `Kỳ này ${dinhDang(tongKy.current)}.`}` : ''}`} donVi={donVi}
        chuThich={boLoc.compare && <ChuGiai muc={[{ ten: 'Kỳ này', mau: MAU.chinh, kieu: 'duong' }, { ten: 'Kỳ trước', mau: MAU.kyTruoc, kieu: 'dut' }]} />}
        trongRong={rong ? 'Không có dữ liệu trong khoảng thời gian này.' : ''}
        bang={{ cot: ['Mốc', 'Kỳ này', ...(boLoc.compare ? ['Kỳ trước'] : [])], dong: nhan.map((n, i) => [n, dinhDang(day.current[i]), ...(boLoc.compare ? [dinhDang(day.previous[i])] : [])]) }}>
        <BieuDoDuong nhan={nhan} chuoi={chuoi} dinhDang={dinhDang} moTa={`${tieuDe} theo ${donViO}`} />
      </KhungBieuDo>;
    };
    const giaoDich = [
      { ten: 'Chấp nhận đề xuất', mau: MAU.chinh, giaTri: d.transactions.accepted.current },
      { ten: 'Hoàn thành', mau: MAU.hai, giaTri: d.transactions.completed.current },
    ];
    const noiDung = [
      { ten: 'Tin sửa chữa', mau: MAU.chinh, giaTri: d.content.requests },
      { ten: 'Đề xuất', mau: MAU.hai, giaTri: d.content.proposals },
      { ten: 'Đánh giá', mau: MAU.ba, giaTri: d.content.reviews },
    ];
    const bangNhieuChuoi = (chuoi) => ({ cot: ['Mốc', ...chuoi.map((c) => c.ten)], dong: nhan.map((n, i) => [n, ...chuoi.map((c) => so(c.giaTri[i]))]) });

    return <div className="tk-cot">
      <p className="tk-khoang-hien">Kỳ đang xem: {ngayIsoHien(d.range.from)} đến {ngayIsoHien(d.range.to)}{boLoc.compare ? `, so với ${ngayIsoHien(d.range.previousFrom)} đến ${ngayIsoHien(d.range.previousTo)}` : ''}. Mỗi điểm là một {donViO}.{ghiChuMocCuoi(d.range)}</p>
      <div className="tk-luoi-bieu-do">
        {duong({ tieuDe: 'Tổng người dùng', moTa: 'Số tài khoản cộng dồn.', donVi: 'tài khoản', day: d.users.cumulative, vung: true })}
        {duong({ tieuDe: 'Người dùng mới', moTa: 'Tài khoản tạo mới.', donVi: 'tài khoản', day: d.users.new, tongKy: d.users.total })}
        {duong({ tieuDe: 'Người dùng hoạt động', moTa: `Số khách hàng và kỹ thuật viên khác nhau có hoạt động trong từng ${donViO}.`, donVi: 'người', day: d.activeUsers, tongKy: d.activeUsers.total })}
        {duong({ tieuDe: 'Giá trị công việc hoàn thành', moTa: 'Giá đề xuất được chọn của việc đã xong (nền tảng không thu tiền).', donVi: 'đồng', day: d.completedValue, dinhDang: tienGon, vung: true, tongKy: d.completedValue.total })}
        <KhungBieuDo tieuDe="Giao dịch" moTa={`${boLoc.compare ? moTaThayDoi(d.transactions.total.accepted.current, d.transactions.total.accepted.previous) : `Kỳ này ${so(d.transactions.total.accepted.current)} đề xuất được chấp nhận.`} Hoàn thành: ${so(d.transactions.total.completed.current)}.`} donVi="giao dịch"
          chuThich={<ChuGiai muc={giaoDich} />} trongRong={tong(giaoDich[0].giaTri) + tong(giaoDich[1].giaTri) === 0 ? 'Không có giao dịch trong khoảng thời gian này.' : ''} bang={bangNhieuChuoi(giaoDich)}>
          <BieuDoCot nhan={nhan} chuoi={giaoDich} nhom moTa={`Giao dịch theo ${donViO}`} />
        </KhungBieuDo>
        <KhungBieuDo tieuDe="Nội dung mới" moTa={boLoc.compare ? moTaThayDoi(d.content.total.current, d.content.total.previous) : `Kỳ này ${so(d.content.total.current)} nội dung.`} donVi="nội dung"
          chuThich={<ChuGiai muc={noiDung} />} trongRong={d.content.total.current === 0 ? 'Chưa có nội dung mới trong khoảng thời gian này.' : ''} bang={bangNhieuChuoi(noiDung)}>
          <BieuDoCot nhan={nhan} chuoi={noiDung} moTa={`Nội dung mới theo ${donViO}, xếp chồng theo loại`} />
        </KhungBieuDo>
      </div>
      <p className="tk-phu">Giá trị đầy đủ của kỳ này: {tienDayDu(d.completedValue.total.current)}.</p>
    </div>;
  }}</VungDuLieu>;
}
