import React, { useCallback, useEffect, useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, ThongBao, DangTai, TomTatYeuCau, NhanTrangThaiYeuCau } from '../../components/Ui.jsx';
import DanhSachDeXuat from '../../components/ProposalList.jsx';
import { KHOA_THONG_BAO_CHI_TIET_TIN } from '../../components/RequestForm.jsx';
import { chuyenDenManHinh } from '../../navigation/screenRoutes.js';
import { layChiTietYeuCau, dongYeuCau } from '../../api/requestApi.js';
import { layDanhSachDeXuatCuaYeuCau, chapNhanDeXuat } from '../../api/proposalApi.js';
import { layThongDiepLoi } from '../../api/httpClient.js';
import { dinhDangThoiGian, dinhDangMaTin, dinhDangTien } from '../../utils/dinhDang.js';

// US08 + US14 + US16: chi tiết tin của khách hàng, các đề xuất đã nhận và chọn kỹ thuật viên.
export default function TrangChiTietYeuCau({ thamSo }) {
  const [yeuCau, datYeuCau] = useState(null);
  const [danhSachDeXuat, datDanhSachDeXuat] = useState([]);
  const [loi, datLoi] = useState('');
  const [maDangXuLy, datMaDangXuLy] = useState(null);
  const [dangDong, datDangDong] = useState(false);
  const [thongBaoThanhCong] = useState(() => {
    try {
      const thongDiep = sessionStorage.getItem(KHOA_THONG_BAO_CHI_TIET_TIN);
      sessionStorage.removeItem(KHOA_THONG_BAO_CHI_TIET_TIN);
      return thongDiep;
    } catch {
      return null;
    }
  });

  const taiDuLieu = useCallback(async () => {
    try {
      const [chiTiet, deXuat] = await Promise.all([layChiTietYeuCau(thamSo.id), layDanhSachDeXuatCuaYeuCau(thamSo.id)]);
      datYeuCau(chiTiet);
      datDanhSachDeXuat(deXuat);
    } catch (loiGoi) {
      datLoi(layThongDiepLoi(loiGoi));
    }
  }, [thamSo.id]);

  useEffect(() => { taiDuLieu(); }, [taiDuLieu]);

  async function xuLyChapNhan(deXuat) {
    const dongY = window.confirm(`Chấp nhận đề xuất ${dinhDangTien(deXuat.price)} của ${deXuat.technician.fullName}?\nTin sẽ chuyển sang "Đã chọn kỹ thuật viên" và các đề xuất khác không còn được chọn.`);
    if (!dongY) return;
    datMaDangXuLy(deXuat.id);
    datLoi('');
    try {
      await chapNhanDeXuat(deXuat.id);
      chuyenDenManHinh('07', { id: thamSo.id });
    } catch (loiGoi) {
      datLoi(layThongDiepLoi(loiGoi));
      datMaDangXuLy(null);
      taiDuLieu();
    }
  }

  // US09 (BR03, BR06): chỉ đóng được khi tin chưa chọn kỹ thuật viên; nếu trạng thái đã đổi thì backend báo lỗi.
  async function xuLyDong() {
    if (!window.confirm('Đóng tin này?\nTin sẽ không còn nhận đề xuất mới từ kỹ thuật viên.')) return;
    datDangDong(true);
    datLoi('');
    try {
      await dongYeuCau(thamSo.id);
      try {
        sessionStorage.setItem('thongBaoTinCuaToi', 'Đóng tin thành công');
      } catch {
        // Bỏ qua.
      }
      chuyenDenManHinh('03');
    } catch (loiGoi) {
      datLoi(layThongDiepLoi(loiGoi));
      datDangDong(false);
      taiDuLieu();
    }
  }

  if (!yeuCau) return <div className="khung-noi-dung">{loi ? <><ThongBao loai="loi">{loi}</ThongBao><Nut maManHinhDich="03" laNutPhu>Về Tin của tôi</Nut></> : <DangTai />}</div>;

  const dangChoDeXuat = yeuCau.status === 'WAITING_PROPOSAL';
  const soDangCho = danhSachDeXuat.filter((deXuat) => deXuat.status === 'PENDING').length;
  return <div className="khung-noi-dung">
    <TieuDeTrang tieuDe={yeuCau.title} phuDe={`${dinhDangMaTin(yeuCau.id)} · Tạo ngày ${dinhDangThoiGian(yeuCau.createdAt)}`} hanhDong={<NhanTrangThaiYeuCau trangThai={yeuCau.status} />} />
    <ThongBao loai="thanh-cong">{thongBaoThanhCong}</ThongBao>
    <ThongBao loai="loi">{loi}</ThongBao>
    <div className="hai-cot luoi-chi-tiet">
      <KhungNoiDung tieuDe="Thông tin tin của tôi">
        <TomTatYeuCau yeuCau={yeuCau} />
        {!dangChoDeXuat && yeuCau.status !== 'CLOSED' && <div className="hang-nut"><Nut maManHinhDich="07" thamSoDich={{ id: yeuCau.id }}>Theo dõi công việc</Nut></div>}
        {dangChoDeXuat && <div className="hang-nut"><Nut maManHinhDich="17" thamSoDich={{ id: yeuCau.id }}>Sửa tin</Nut><Nut laNutPhu onClick={xuLyDong} disabled={dangDong}>{dangDong ? 'Đang đóng…' : 'Đóng tin'}</Nut></div>}
      </KhungNoiDung>
      <KhungNoiDung tieuDe={`Các đề xuất đã nhận (${danhSachDeXuat.length})`}>
        {dangChoDeXuat && danhSachDeXuat.length > 0 && <div className="so-luong-de-xuat"><span>{soDangCho} có thể chọn</span></div>}
        <DanhSachDeXuat danhSach={danhSachDeXuat} coTheChon={dangChoDeXuat} maDangXuLy={maDangXuLy} onChapNhan={xuLyChapNhan} />
      </KhungNoiDung>
    </div>
  </div>;
}
