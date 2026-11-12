import React, { useEffect, useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, NhanTrangThai, ThongBao, DangTai, PhanTrang } from '../../components/Ui.jsx';
import { layDanhSachDeXuatCuaToi, rutDeXuat } from '../../api/proposalApi.js';
import { layDuongDanManHinh } from '../../navigation/screenRoutes.js';
import { layThongDiepLoi } from '../../api/httpClient.js';
import { dinhDangThoiGian, dinhDangMaTin, dinhDangTien, NHAN_TRANG_THAI_DE_XUAT, NHAN_TRANG_THAI_YEU_CAU } from '../../utils/dinhDang.js';

export const KHOA_THONG_BAO_DE_XUAT_CUA_TOI = 'thongBaoDeXuatCuaToi';

const CAC_BO_LOC = [
  { giaTri: '', nhan: 'Tất cả' },
  { giaTri: 'PENDING', nhan: NHAN_TRANG_THAI_DE_XUAT.PENDING },
  { giaTri: 'ACCEPTED', nhan: NHAN_TRANG_THAI_DE_XUAT.ACCEPTED },
  { giaTri: 'REJECTED', nhan: NHAN_TRANG_THAI_DE_XUAT.REJECTED },
  { giaTri: 'WITHDRAWN', nhan: NHAN_TRANG_THAI_DE_XUAT.WITHDRAWN },
];

const GHI_CHU_THEO_TRANG_THAI = {
  PENDING: 'Đang chờ khách hàng xem xét. Bạn có thể rút đề xuất.',
  ACCEPTED: 'Khách hàng đã chọn đề xuất của bạn. Xem công việc để thấy thông tin liên hệ.',
  REJECTED: 'Khách hàng đã chọn kỹ thuật viên khác cho tin này.',
  WITHDRAWN: 'Bạn đã rút đề xuất này. Dữ liệu vẫn được lưu để tra cứu, không khôi phục được.',
};

function docThongBaoThanhCong() {
  try {
    const thongDiep = sessionStorage.getItem(KHOA_THONG_BAO_DE_XUAT_CUA_TOI);
    sessionStorage.removeItem(KHOA_THONG_BAO_DE_XUAT_CUA_TOI);
    return thongDiep;
  } catch {
    return null;
  }
}

// Màn hình 12: kỹ thuật viên xem các đề xuất mình đã gửi (BR: chỉ quản lý đề xuất của mình).
// US22: sửa khi đề xuất còn chờ và tin còn nhận đề xuất. US23: rút khi đề xuất chưa được chấp nhận.
export default function TrangDeXuatCuaToi() {
  const [boLoc, datBoLoc] = useState('');
  const [trang, datTrang] = useState(1);
  const [ketQua, datKetQua] = useState(null);
  const [soLuongTheoTrangThai, datSoLuongTheoTrangThai] = useState({});
  const [loi, datLoi] = useState('');
  const [thongBaoThanhCong, datThongBaoThanhCong] = useState(docThongBaoThanhCong);
  const [lanTai, datLanTai] = useState(0);
  const [maDangRut, datMaDangRut] = useState(null);

  useEffect(() => {
    let daHuy = false;
    datKetQua(null);
    layDanhSachDeXuatCuaToi({ status: boLoc || undefined, page: trang, size: 10 })
      .then((duLieu) => !daHuy && datKetQua(duLieu))
      .catch((loiGoi) => !daHuy && datLoi(layThongDiepLoi(loiGoi)));
    return () => { daHuy = true; };
  }, [boLoc, trang, lanTai]);

  useEffect(() => {
    Promise.all(CAC_BO_LOC.map(({ giaTri }) => layDanhSachDeXuatCuaToi({ status: giaTri || undefined, size: 1 })
      .then(({ phanTrang }) => [giaTri, phanTrang.totalElements])))
      .then((cacCap) => datSoLuongTheoTrangThai(Object.fromEntries(cacCap)))
      .catch(() => {});
  }, [lanTai]);

  const chonBoLoc = (giaTri) => { datBoLoc(giaTri); datTrang(1); };

  async function xuLyRut(deXuat) {
    const dongY = window.confirm(`Rút đề xuất ${dinhDangTien(deXuat.price)} cho tin ${dinhDangMaTin(deXuat.request.id)}?\nKhách hàng sẽ không còn chọn được đề xuất này và bạn không thể khôi phục.`);
    if (!dongY) return;
    datMaDangRut(deXuat.id);
    datLoi('');
    datThongBaoThanhCong(null);
    try {
      await rutDeXuat(deXuat.id);
      datThongBaoThanhCong('Rút đề xuất thành công');
    } catch (loiGoi) {
      datLoi(layThongDiepLoi(loiGoi));
    }
    datMaDangRut(null);
    datLanTai((so) => so + 1);
  }

  return <div className="khung-noi-dung">
    <TieuDeTrang tieuDe="Đề xuất của tôi" phuDe="Theo dõi kết quả các đề xuất bạn đã gửi." />
    <div className="hang-bo-loc">{CAC_BO_LOC.map(({ giaTri, nhan }) => <button key={nhan} type="button" className={`nut-loc ${boLoc === giaTri ? 'dang-duoc-chon' : ''}`} onClick={() => chonBoLoc(giaTri)}>{nhan} ({soLuongTheoTrangThai[giaTri] ?? '–'})</button>)}</div>
    <ThongBao loai="thanh-cong">{thongBaoThanhCong}</ThongBao>
    <ThongBao loai="loi">{loi}</ThongBao>
    {!ketQua && !loi && <DangTai />}
    {ketQua && ketQua.danhSach.length === 0 && <ThongBao>{boLoc ? 'Không có đề xuất nào ở trạng thái này' : 'Bạn chưa gửi đề xuất nào'}</ThongBao>}
    <div className="cot-noi-dung">{ketQua?.danhSach.map((deXuat) => {
      const manHinhXemTin = deXuat.status === 'ACCEPTED' ? '13' : '10';
      return <KhungNoiDung key={deXuat.id} className="de-xuat-cua-toi">
        <div className="dau-the-de-xuat">
          <div><strong>{dinhDangMaTin(deXuat.request.id)} · {deXuat.request.title}</strong><span>{deXuat.request.category} · {deXuat.request.location} · Gửi lúc {dinhDangThoiGian(deXuat.createdAt)}</span></div>
          <strong className="chi-phi-de-xuat">{dinhDangTien(deXuat.price)}</strong>
        </div>
        <p>{deXuat.description}{deXuat.estimatedDuration && ` (dự kiến ${deXuat.estimatedDuration})`}</p>
        <div className="can-deu-hai-ben">
          <NhanTrangThai sacThai={deXuat.status === 'ACCEPTED' ? 'nhan-dam' : ''}>{NHAN_TRANG_THAI_DE_XUAT[deXuat.status]}</NhanTrangThai>
          <span>{GHI_CHU_THEO_TRANG_THAI[deXuat.status]} Tin: {NHAN_TRANG_THAI_YEU_CAU[deXuat.request.status]}.</span>
        </div>
        <div className="hang-nut">
          <a className="nut" href={layDuongDanManHinh(manHinhXemTin, { id: deXuat.request.id })}>Xem công việc</a>
          {deXuat.status === 'PENDING' && <Nut laNutPhu disabled={maDangRut === deXuat.id} onClick={() => xuLyRut(deXuat)}>{maDangRut === deXuat.id ? 'Đang rút…' : 'Rút đề xuất'}</Nut>}
        </div>
      </KhungNoiDung>;
    })}</div>
    <PhanTrang phanTrang={ketQua?.phanTrang} onChuyenTrang={datTrang} />
  </div>;
}
