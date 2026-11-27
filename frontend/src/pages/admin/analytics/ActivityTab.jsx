import React from 'react';
import { useDuLieu } from '../../../components/analytics/useDuLieu.js';
import { VungDuLieu, KhungBieuDo, BangDuLieu } from '../../../components/analytics/Khoi.jsx';
import { BieuDoDuong, BieuDoCot, ThanhNgang, BanDoNhiet, ChuGiai } from '../../../components/analytics/Charts.jsx';
import { MAU, duongDanThongKe } from '../../../components/analytics/hangSo.js';
import { so, soLe, miliGiay, phanTram, ngayIsoHien, NHAN_HANH_DONG } from '../../../components/analytics/dinhDang.js';
import { layPhanTichHoatDong, thamSoThoiGian } from '../../../api/analyticsApi.js';
import { dinhDangThoiGian, NHAN_VAI_TRO } from '../../../utils/dinhDang.js';
import { LienKetNguoiDung } from '../../../components/Ui.jsx';

const tong = (m) => m.reduce((a, b) => a + b, 0);

export default function TabHoatDong({ boLoc }) {
  const thamSo = thamSoThoiGian(boLoc);
  const trangThai = useDuLieu(() => layPhanTichHoatDong(thamSo), JSON.stringify(thamSo));

  return <VungDuLieu {...trangThai}>{(d) => {
    const nhan = d.range.labels;
    const ghiTu = dinhDangThoiGian(d.loggingSince);
    const dangNhap = [
      { ten: 'Đăng nhập thành công', mau: MAU.chinh, giaTri: d.logins.success },
      { ten: 'Đăng nhập thất bại', mau: MAU.bon, giaTri: d.logins.failure },
      { ten: 'Đăng xuất', mau: MAU.ba, giaTri: d.logins.logout },
    ];
    const vaiTro = [
      { ten: 'Khách hàng', mau: MAU.chinh, giaTri: d.byRole.customer },
      { ten: 'Kỹ thuật viên', mau: MAU.hai, giaTri: d.byRole.technician },
      { ten: 'Quản trị viên', mau: MAU.ba, giaTri: d.byRole.admin },
    ];
    const thaoTac = [
      { ten: 'Tạo mới', mau: MAU.chinh, giaTri: d.operations.create },
      { ten: 'Cập nhật', mau: MAU.hai, giaTri: d.operations.update },
      { ten: 'Đóng hoặc rút', mau: MAU.bon, giaTri: d.operations.close },
    ];
    const bang = (chuoi) => ({ cot: ['Mốc', ...chuoi.map((c) => c.ten)], dong: nhan.map((n, i) => [n, ...chuoi.map((c) => so(c.giaTri[i]))]) });
    const rong = (chuoi, loiNhan) => (chuoi.every((c) => tong(c.giaTri) === 0) ? loiNhan : '');
    const hanhDong = (ds) => ds.map((m) => ({ ten: NHAN_HANH_DONG[m.action] ?? m.action, soLuong: m.count }));
    const bangHanhDong = (ds) => ({ cot: ['Thao tác', 'Số lần'], dong: ds.map((m) => [NHAN_HANH_DONG[m.action] ?? m.action, so(m.count)]) });
    const api = d.api.summary;

    return <div className="tk-cot">
      <p className="tk-khoang-hien">Kỳ đang xem: {ngayIsoHien(d.range.from)} đến {ngayIsoHien(d.range.to)}. Đăng nhập, sửa, đóng và khóa chỉ được ghi từ {ghiTu}.</p>
      <div className="tk-luoi-bieu-do">
        <KhungBieuDo rong tieuDe="Đăng nhập và đăng xuất" moTa="Lượt theo thời gian." donVi="lượt" chuThich={<ChuGiai muc={dangNhap.map((c) => ({ ...c, kieu: 'duong', giaTri: so(tong(c.giaTri)) }))} />}
          trongRong={rong(dangNhap, `Chưa có lượt đăng nhập nào được ghi trong kỳ (ghi từ ${ghiTu}).`)} bang={bang(dangNhap)}>
          <BieuDoDuong nhan={nhan} chuoi={dangNhap} moTa="Đăng nhập thành công, thất bại và đăng xuất" />
        </KhungBieuDo>
        <KhungBieuDo tieuDe="Hoạt động theo vai trò" moTa="Số việc người dùng thực hiện, gồm hoạt động của quản trị viên." donVi="lượt" chuThich={<ChuGiai muc={vaiTro} />}
          trongRong={rong(vaiTro, 'Không có hoạt động trong kỳ.')} bang={bang(vaiTro)}>
          <BieuDoCot nhan={nhan} chuoi={vaiTro} moTa="Hoạt động theo vai trò, xếp chồng" />
        </KhungBieuDo>
        <KhungBieuDo tieuDe="Tạo, cập nhật, đóng" moTa="Hệ thống không xóa dữ liệu; đóng tin và rút đề xuất thay cho xóa." donVi="thao tác" chuThich={<ChuGiai muc={thaoTac} />}
          trongRong={rong(thaoTac, 'Không có thao tác trong kỳ.')} bang={bang(thaoTac)}>
          <BieuDoCot nhan={nhan} chuoi={thaoTac} moTa="Thao tác tạo, cập nhật, đóng hoặc rút" />
        </KhungBieuDo>
        <KhungBieuDo tieuDe="Chức năng được dùng nhiều" moTa="Xếp theo số lần thực hiện trong kỳ." donVi="lần" trongRong={d.features.length === 0 ? 'Không có hoạt động trong kỳ.' : ''} bang={bangHanhDong(d.features)}>
          <ThanhNgang muc={hanhDong(d.features.slice(0, 10))} />
        </KhungBieuDo>
        <KhungBieuDo tieuDe="Hoạt động của quản trị viên" moTa="Đăng nhập, khóa, mở khóa, xuất báo cáo, xử lý cảnh báo." donVi="lần" trongRong={d.adminActions.length === 0 ? `Chưa có thao tác quản trị nào được ghi trong kỳ (ghi từ ${ghiTu}).` : ''} bang={bangHanhDong(d.adminActions)}>
          <ThanhNgang muc={hanhDong(d.adminActions)} mau={MAU.ba} />
        </KhungBieuDo>
        <KhungBieuDo rong tieuDe="Thời điểm hoạt động trong tuần" moTa="Số hoạt động theo thứ và giờ." donVi="lượt" trongRong={d.heatmap.flat().every((v) => v === 0) ? 'Không có hoạt động trong kỳ.' : ''}
          bang={{ cot: ['Thứ', ...Array.from({ length: 24 }, (_, g) => `${g}h`)], dong: d.heatmap.map((dong, t) => [['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][t], ...dong]) }}>
          <BanDoNhiet bang={d.heatmap} donVi="hoạt động" moTa="Bản đồ nhiệt hoạt động theo thứ và giờ, giờ Việt Nam" />
        </KhungBieuDo>
      </div>

      <div className="tk-hai-cot">
        <section className="tk-khung">
          <div className="tk-khung-dau"><div><h2>Người dùng hoạt động nhiều nhất</h2><p>10 người có nhiều việc nhất trong kỳ.</p></div></div>
          <BangDuLieu tenBang="Người dùng hoạt động nhiều nhất" dong={d.topUsers} trongRong="Không có hoạt động trong kỳ."
            cot={[{ key: 'fullName', label: 'Người dùng' }, { key: 'role', label: 'Vai trò' }, { key: 'count', label: 'Số việc', type: 'number' }, { key: 'lastAt', label: 'Lần gần nhất' }]}
            hien={(c, r) => c.key === 'fullName' ? <LienKetNguoiDung id={r.id}>{r.fullName}</LienKetNguoiDung> : c.key === 'role' ? NHAN_VAI_TRO[r.role] : c.key === 'lastAt' ? dinhDangThoiGian(r.lastAt) : so(r.count)} />
        </section>
        <section className="tk-khung">
          <div className="tk-khung-dau"><div><h2>Yêu cầu API</h2><p>Đo từ {dinhDangThoiGian(d.api.since)} (khi backend khởi động), trong phạm vi kỳ đang xem. Không tính trang thống kê.</p></div><a className="lien-ket-van-ban" href={duongDanThongKe('bao-cao', { loai: 'performance' })}>Báo cáo hiệu năng</a></div>
          <div className="tk-luoi-chi-so gon">
            <div className="tk-chi-so"><span>Số yêu cầu</span><strong>{so(api.requests)}</strong></div>
            <div className="tk-chi-so"><span>Lỗi 4xx / 5xx</span><strong>{so(api.errors4xx)} / {so(api.errors5xx)}</strong></div>
            <div className="tk-chi-so"><span>Tỷ lệ lỗi máy chủ</span><strong>{api.requests ? phanTram(api.errorRate) : '—'}</strong></div>
            <div className="tk-chi-so"><span>Phản hồi p95</span><strong>{miliGiay(api.p95Ms)}</strong></div>
          </div>
          <BangDuLieu tenBang="Đường dẫn được gọi nhiều nhất" dong={d.api.routes.slice(0, 8).map((r) => ({ ...r, id: `${r.method} ${r.route}` }))} trongRong="Chưa có yêu cầu nào kể từ khi backend khởi động."
            cot={[{ key: 'id', label: 'Đường dẫn' }, { key: 'requests', label: 'Lần gọi', type: 'number' }, { key: 'avgMs', label: 'Trung bình (ms)', type: 'number' }]}
            hien={(c, r) => c.key === 'id' ? <code>{r.id}</code> : c.key === 'avgMs' ? soLe(r.avgMs) : so(r.requests)} />
        </section>
      </div>

      <section className="tk-khung">
        <div className="tk-khung-dau"><div><h2>Nhật ký hoạt động gần đây</h2><p>10 sự kiện mới nhất. Địa chỉ IP không được thu thập.</p></div><a className="lien-ket-van-ban" href={duongDanThongKe('bao-cao', { loai: 'activity' })}>Xem toàn bộ, lọc và xuất</a></div>
        <BangDuLieu tenBang="Nhật ký hoạt động gần đây" dong={d.recent}
          cot={[{ key: 'createdAt', label: 'Thời điểm' }, { key: 'userName', label: 'Người dùng' }, { key: 'action', label: 'Thao tác' }, { key: 'target', label: 'Đối tượng' }, { key: 'ip', label: 'Địa chỉ IP' }, { key: 'status', label: 'Kết quả' }]}
          hien={(c, r) => c.key === 'createdAt' ? dinhDangThoiGian(r.createdAt) : c.key === 'action' ? NHAN_HANH_DONG[r.action] ?? r.action : c.key === 'status' ? <span className={`tk-ket-qua ${r.status === 'SUCCESS' ? 'tot' : 'xau'}`}>{r.status === 'SUCCESS' ? 'Thành công' : 'Thất bại'}</span> : c.key === 'userName' ? <LienKetNguoiDung id={r.userId}>{r.userName}</LienKetNguoiDung> : r[c.key]} />
      </section>
    </div>;
  }}</VungDuLieu>;
}
