// Nội dung trang Thống kê: bốn số liệu chính ở trên (người dùng, tin sửa chữa, việc hoàn thành, giá trị công việc),
// bên dưới là bốn biểu đồ hợp với dạng dữ liệu: giao dịch (cột, hai số đếm mỗi cột), giá trị công việc (đường, xu hướng
// theo thời gian), người dùng theo vai trò (tròn, các phần của một tổng), tin theo trạng thái (thanh ngang, so nhóm).
import React from 'react';
import { useDuLieu, gopTrangThai } from '../../../components/analytics/useDuLieu.js';
import { VungDuLieu, KhungBieuDo, NhanThayDoi } from '../../../components/analytics/Khoi.jsx';
import { BieuDoDuong, BieuDoCot, BieuDoVanh, ThanhNgang, ChuGiai } from '../../../components/analytics/Charts.jsx';
import { MAU } from '../../../components/analytics/hangSo.js';
import { so, tienGon, tienDayDu, ngayIsoHien } from '../../../components/analytics/dinhDang.js';
import { layTongQuan, layTangTruong, layPhanTichNguoiDung, thamSoThoiGian } from '../../../api/analyticsApi.js';
import { NHAN_VAI_TRO, NHAN_TRANG_THAI_YEU_CAU } from '../../../utils/dinhDang.js';

const MAU_VAI_TRO = { CUSTOMER: MAU.chinh, TECHNICIAN: MAU.hai, ADMIN: MAU.ba };
// Thứ tự theo vòng đời của tin; tin đang chờ đề xuất là việc cần xử lý nên được tô nổi.
const THU_TU_TRANG_THAI = ['WAITING_PROPOSAL', 'SELECTED', 'COMPLETED', 'CLOSED'];
const SO_COT_TOI_DA = 15;
const CAO_BIEU_DO = 180;
const tong = (day) => day.reduce((a, b) => a + b, 0);

// Gộp các mốc thời gian liền nhau để cột đủ rộng mà đọc. Gộp từ cuối nên các nhóm gần nhất luôn đủ mốc.
function gopMoc(nhan) {
  const buoc = Math.max(1, Math.ceil(nhan.length / SO_COT_TOI_DA));
  const nhom = [];
  for (let cuoi = nhan.length; cuoi > 0; cuoi -= buoc) nhom.unshift([Math.max(0, cuoi - buoc), cuoi]);
  return {
    buoc,
    nhan: nhom.map(([a]) => nhan[a]),
    nhanDay: nhom.map(([a, b]) => (b - a > 1 ? `${nhan[a]} – ${nhan[b - 1]}` : nhan[a])),
    gop: (day) => nhom.map(([a, b]) => tong(day.slice(a, b))),
  };
}

// Viết khoảng đang xem thành lời. trong: ghép vào cuối câu; nay, truoc: tên trong chú giải và câu so sánh.
function tenKhoang({ key, from, to }) {
  if (key === 'today') return { trong: 'hôm nay', nay: 'Hôm nay', truoc: 'hôm qua cùng giờ' };
  if (key === 'custom') {
    const soNgay = Math.round((Date.parse(to) - Date.parse(from)) / 86400000) + 1;
    return { trong: 'trong khoảng đã chọn', nay: 'Khoảng đã chọn', truoc: `${soNgay} ngày trước đó` };
  }
  const dai = { '7d': '7 ngày', '30d': '30 ngày', '90d': '90 ngày', '12m': '12 tháng' }[key];
  return { trong: `trong ${dai} qua`, nay: `${dai} qua`, truoc: `${dai} trước đó` };
}
const vietHoa = (chu) => chu.charAt(0).toUpperCase() + chu.slice(1);

// Mỗi ô: tên, con số và một dòng bổ sung (số mới đăng, hoặc tăng giảm so với khoảng trước).
function TheSo({ ten, giaTri, dayDu, them }) {
  return <div className="tk-the-so">
    <dt>{ten}</dt>
    <dd>
      <strong title={dayDu}>{giaTri}</strong>
      {them && <span>{them}</span>}
    </dd>
  </div>;
}

export default function TongQuan({ boLoc }) {
  const thamSo = thamSoThoiGian(boLoc);
  const khoa = JSON.stringify(thamSo);
  const tongQuan = useDuLieu(() => layTongQuan(thamSo), khoa);
  const tangTruong = useDuLieu(() => layTangTruong(thamSo), khoa);
  const nguoiDung = useDuLieu(() => layPhanTichNguoiDung(thamSo), khoa);

  return <VungDuLieu {...gopTrangThai({ tongQuan, tangTruong, nguoiDung })}>{({ tongQuan: d, tangTruong: t, nguoiDung: n }) => {
    const the = Object.fromEntries(d.cards.map((c) => [c.key, c]));
    const donViO = t.range.bucket === 'hour' ? 'giờ' : t.range.bucket === 'month' ? 'tháng' : 'ngày';
    const moc = gopMoc(t.range.labels);
    // Mỗi cột, mỗi điểm ứng với bao nhiêu giờ, ngày hay tháng.
    const moiO = `${moc.buoc} ${donViO}`;
    const ghiTheo = moc.buoc > 1 ? `; ${donViO} ghi bên dưới là ${donViO} đầu tiên` : '';
    const khoangXem = tenKhoang(d.range);

    // Tài khoản được đếm đến cuối khoảng đang chọn; khoảng đã qua thì biểu đồ vai trò ghi rõ ngày đó.
    // Khoảng kéo đến hiện tại là khoảng chưa hết ngày cuối (xét theo dữ liệu, không theo giờ lúc vẽ lại).
    const denNay = Date.parse(t.range.end) < Date.parse(`${t.range.to}T00:00:00+07:00`) + 86400000;
    const denNgay = ngayIsoHien(d.range.to);
    const xong = t.transactions.total.completed;
    // Dòng so sánh, chỉ khi đang bật. Khoảng trước bằng 0 thì không tính được tỷ lệ.
    const soSanh = (nay, truoc) => {
      if (!boLoc.compare) return null;
      if (!truoc) return `${vietHoa(khoangXem.truoc)} chưa có số liệu`;
      return <><NhanThayDoi thayDoi={(nay - truoc) / truoc} /> so với {khoangXem.truoc}</>;
    };

    const giaoDich = [
      { ten: 'Đề xuất được chấp nhận', mau: MAU.chinh, giaTri: moc.gop(t.transactions.accepted.current) },
      { ten: 'Việc đã hoàn thành', mau: MAU.hai, giaTri: moc.gop(t.transactions.completed.current) },
    ];
    const giaTri = [{ ten: vietHoa(khoangXem.nay), mau: MAU.chinh, giaTri: moc.gop(t.completedValue.current), vung: true }];
    if (boLoc.compare) giaTri.push({ ten: vietHoa(khoangXem.truoc), mau: MAU.kyTruoc, giaTri: moc.gop(t.completedValue.previous), dut: true });
    const bangChuoi = (chuoi, dinhDang) => ({ cot: ['Thời gian', ...chuoi.map((c) => c.ten)], dong: moc.nhanDay.map((ten, i) => [ten, ...chuoi.map((c) => dinhDang(c.giaTri[i]))]) });
    const khongCo = (chuoi) => chuoi.every((c) => c.giaTri.every((v) => v === 0));

    const vaiTro = n.byRole.map((r) => ({ ten: NHAN_VAI_TRO[r.key], soLuong: r.count, mau: MAU_VAI_TRO[r.key] }));
    const trangThaiTin = THU_TU_TRANG_THAI.map((ma) => ({
      ten: NHAN_TRANG_THAI_YEU_CAU[ma], soLuong: d.requestStatus.find((s) => s.key === ma)?.count ?? 0, mauRieng: ma === 'WAITING_PROPOSAL' ? MAU.hai : MAU.kyTruoc,
    }));

    const quaHen = the.pendingTasks.requestsOverdue;

    return <div className="tk-cot">
      <h2 className="chi-cho-trinh-doc">Số liệu chính</h2>
      <dl className="tk-day-so">
        <TheSo ten="Người dùng" giaTri={so(the.totalUsers.value)}
          them={`Mới đăng ký ${khoangXem.trong}: ${so(the.totalUsers.added)}`} />
        <TheSo ten="Tin sửa chữa" giaTri={so(the.totalContent.breakdown.requests)}
          them={`Mới đăng ${khoangXem.trong}: ${so(tong(d.requestsTrend.current))}`} />
        <TheSo ten="Việc hoàn thành" giaTri={so(xong.current)}
          them={soSanh(xong.current, xong.previous)} />
        <TheSo ten="Giá trị công việc" giaTri={tienGon(the.completedValue.value)} dayDu={tienDayDu(the.completedValue.value)}
          them={soSanh(the.completedValue.value, the.completedValue.previous)} />
      </dl>
      <div className="tk-luoi-bieu-do tk-bon-bieu-do">
        <KhungBieuDo tieuDe="Giao dịch" moTa={`Mỗi cặp cột là số của ${moiO}${ghiTheo}.`}
          chuThich={<ChuGiai muc={giaoDich} />} trongRong={khongCo(giaoDich) ? 'Không có giao dịch trong khoảng thời gian này.' : ''} bang={bangChuoi(giaoDich, so)}>
          <BieuDoCot nhan={moc.nhan} nhanDay={moc.nhanDay} chuoi={giaoDich} nhom cao={CAO_BIEU_DO} moTa="Đề xuất được chấp nhận và việc hoàn thành theo thời gian" />
        </KhungBieuDo>

        <KhungBieuDo tieuDe="Giá trị theo thời gian" moTa={`Mỗi điểm cộng giá các việc xong trong ${moiO}. Không phải doanh thu.`}
          chuThich={<ChuGiai muc={giaTri.map((c) => ({ ten: c.ten, mau: c.mau, kieu: c.dut ? 'dut' : 'duong' }))} />}
          trongRong={khongCo(giaTri) ? 'Chưa có việc hoàn thành trong khoảng thời gian này.' : ''} bang={bangChuoi(giaTri, tienDayDu)}>
          <BieuDoDuong nhan={moc.nhan} nhanDay={moc.nhanDay} chuoi={giaTri} dinhDang={tienGon} cao={CAO_BIEU_DO} moTa="Giá trị công việc hoàn thành theo thời gian" />
        </KhungBieuDo>

        <KhungBieuDo tieuDe="Người dùng theo vai trò" moTa={denNay ? 'Tất cả tài khoản đang có, chia theo vai trò.' : `Tài khoản tạo đến ${denNgay}, chia theo vai trò.`}
          trongRong={vaiTro.length === 0 ? 'Chưa có tài khoản nào.' : ''} bang={{ cot: ['Vai trò', 'Tài khoản'], dong: vaiTro.map((m) => [m.ten, so(m.soLuong)]) }}>
          <BieuDoVanh moTa="Tài khoản theo vai trò" donVi="tài khoản" muc={vaiTro} anTong />
        </KhungBieuDo>

        <KhungBieuDo tieuDe="Tin theo trạng thái" moTa={`Tất cả tin theo tình trạng hiện nay. ${quaHen ? `${so(quaHen)} tin chờ đề xuất đã qua giờ khách hẹn.` : 'Không tin chờ đề xuất nào quá giờ hẹn.'}`}
          trongRong={d.requestStatus.length === 0 ? 'Chưa có tin sửa chữa nào.' : ''} bang={{ cot: ['Trạng thái', 'Số tin'], dong: trangThaiTin.map((m) => [m.ten, so(m.soLuong)]) }}>
          <ThanhNgang muc={trangThaiTin} dinhDang={(v) => `${so(v)} tin`} />
        </KhungBieuDo>
      </div>
    </div>;
  }}</VungDuLieu>;
}
