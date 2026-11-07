import React, { useEffect, useState } from 'react';
import { TieuDeTrang, Nut, ThongKe, ThongBao, DangTai, PhanTrang, NhanTrangThaiYeuCau } from '../../components/Ui.jsx';
import { layDuongDanManHinh } from '../../navigation/screenRoutes.js';
import { layDanhSachYeuCauCuaToi } from '../../api/requestApi.js';
import { layThongDiepLoi } from '../../api/httpClient.js';
import { dinhDangThoiGian, dinhDangMaTin, NHAN_TRANG_THAI_YEU_CAU } from '../../utils/dinhDang.js';

const CAC_BO_LOC = [
  { giaTri: '', nhan: 'Tất cả' },
  { giaTri: 'WAITING_PROPOSAL', nhan: 'Chờ đề xuất' },
  { giaTri: 'SELECTED', nhan: 'Đã chọn' },
  { giaTri: 'COMPLETED', nhan: 'Hoàn thành' },
  { giaTri: 'CLOSED', nhan: 'Đã đóng' },
];

function trangChiTietCuaTin(tin) {
  return ['SELECTED', 'COMPLETED'].includes(tin.status) ? '07' : '05';
}

// US07: danh sách tin do chính khách hàng đăng, lọc theo trạng thái.
export default function TrangTinCuaToi() {
  const [boLoc, datBoLoc] = useState('');
  const [trang, datTrang] = useState(1);
  const [ketQua, datKetQua] = useState(null);
  const [soLuongTheoTrangThai, datSoLuongTheoTrangThai] = useState({});
  const [loi, datLoi] = useState('');
  const [thongBaoThanhCong] = useState(() => {
    try {
      const thongDiep = sessionStorage.getItem('thongBaoTinCuaToi');
      sessionStorage.removeItem('thongBaoTinCuaToi');
      return thongDiep;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    let daHuy = false;
    datKetQua(null);
    layDanhSachYeuCauCuaToi({ status: boLoc || undefined, page: trang, size: 10 })
      .then((duLieu) => !daHuy && datKetQua(duLieu))
      .catch((loiGoi) => !daHuy && datLoi(layThongDiepLoi(loiGoi)));
    return () => { daHuy = true; };
  }, [boLoc, trang]);

  useEffect(() => {
    Promise.all(CAC_BO_LOC.map(({ giaTri }) => layDanhSachYeuCauCuaToi({ status: giaTri || undefined, size: 1 })
      .then(({ phanTrang }) => [giaTri, phanTrang.totalElements])))
      .then((cacCap) => datSoLuongTheoTrangThai(Object.fromEntries(cacCap)))
      .catch(() => {});
  }, []);

  const chonBoLoc = (giaTri) => { datBoLoc(giaTri); datTrang(1); };

  return <div className="khung-noi-dung">
    <TieuDeTrang tieuDe="Tin của tôi" phuDe="Theo dõi yêu cầu sửa chữa và các đề xuất bạn đã nhận." hanhDong={<Nut maManHinhDich="04">+ Đăng tin sửa chữa</Nut>} />
    <ThongKe cacMuc={CAC_BO_LOC.slice(1).map(({ giaTri }) => [NHAN_TRANG_THAI_YEU_CAU[giaTri], String(soLuongTheoTrangThai[giaTri] ?? '–')])} />
    <div className="hang-bo-loc">{CAC_BO_LOC.map(({ giaTri, nhan }) => <button key={nhan} type="button" className={`nut-loc ${boLoc === giaTri ? 'dang-duoc-chon' : ''}`} onClick={() => chonBoLoc(giaTri)}>{nhan} ({soLuongTheoTrangThai[giaTri] ?? '–'})</button>)}</div>
    <ThongBao loai="thanh-cong">{thongBaoThanhCong}</ThongBao>
    <ThongBao loai="loi">{loi}</ThongBao>
    {!ketQua && !loi && <DangTai />}
    {ketQua && ketQua.danhSach.length === 0 && <ThongBao>{boLoc ? 'Không có tin nào ở trạng thái này' : 'Bạn chưa có tin sửa chữa nào'}</ThongBao>}
    {ketQua && ketQua.danhSach.length > 0 && <div className="danh-sach-yeu-cau">
      <div className="dong-yeu-cau dau-yeu-cau"><span>Yêu cầu sửa chữa</span><span>Ngày tạo</span><span>Đề xuất</span><span>Trạng thái</span><span>Thao tác</span></div>
      {ketQua.danhSach.map((tin) => <article className="dong-yeu-cau" key={tin.id}>
        <div className="ten-yeu-cau"><strong>{dinhDangMaTin(tin.id)} · {tin.title}</strong><span>{tin.category} · {tin.location}</span></div>
        <span>{dinhDangThoiGian(tin.createdAt)}</span>
        <span>{tin.proposalCount} đề xuất</span>
        <span><NhanTrangThaiYeuCau trangThai={tin.status} /></span>
        <a className="lien-ket-van-ban" href={layDuongDanManHinh(trangChiTietCuaTin(tin), { id: tin.id })}>Xem chi tiết</a>
      </article>)}
      <div className="chan-danh-sach"><span>Hiển thị {ketQua.danhSach.length}/{ketQua.phanTrang.totalElements} tin của bạn</span><span>Trang {ketQua.phanTrang.page} / {Math.max(ketQua.phanTrang.totalPages, 1)}</span></div>
    </div>}
    <PhanTrang phanTrang={ketQua?.phanTrang} onChuyenTrang={datTrang} />
  </div>;
}
