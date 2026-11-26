import React, { useEffect, useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, TruongNhap, ThongBao, DangTai, PhanTrang } from '../../components/Ui.jsx';
import { layDuongDanManHinh } from '../../navigation/screenRoutes.js';
import { layDanhSachYeuCauDangCho } from '../../api/requestApi.js';
import { layThongDiepLoi } from '../../api/httpClient.js';
import { dinhDangThoiGian, dinhDangMaTin, CAC_LOAI_DICH_VU } from '../../utils/dinhDang.js';

// US10: kỹ thuật viên xem các tin đang Chờ đề xuất (BR04), lọc theo loại dịch vụ và khu vực.
export default function TrangTimYeuCau() {
  const [boLoc, datBoLoc] = useState({ category: '', location: '' });
  const [trang, datTrang] = useState(1);
  const [ketQua, datKetQua] = useState(null);
  const [loi, datLoi] = useState('');
  const [phienBanBieuMau, datPhienBanBieuMau] = useState(0);

  useEffect(() => {
    let daHuy = false;
    datKetQua(null);
    datLoi('');
    layDanhSachYeuCauDangCho({ category: boLoc.category || undefined, location: boLoc.location || undefined, page: trang, size: 10 })
      .then((duLieu) => !daHuy && datKetQua(duLieu))
      .catch((loiGoi) => !daHuy && datLoi(layThongDiepLoi(loiGoi)));
    return () => { daHuy = true; };
  }, [boLoc, trang]);

  function xuLyTimKiem(suKien) {
    suKien.preventDefault();
    const duLieu = new FormData(suKien.currentTarget);
    datBoLoc({ category: String(duLieu.get('category')), location: String(duLieu.get('location')).trim() });
    datTrang(1);
  }

  function datLai() {
    datBoLoc({ category: '', location: '' });
    datTrang(1);
    datPhienBanBieuMau((so) => so + 1);
  }

  const moTaBoLoc = `${boLoc.category || 'Tất cả dịch vụ'} · ${boLoc.location || 'Tất cả khu vực'}`;
  return <div className="khung-noi-dung"><TieuDeTrang tieuDe="Tìm việc sửa chữa" phuDe="Các yêu cầu đang chờ đề xuất. Lọc theo dịch vụ và khu vực phù hợp." />
    <div className="bo-cuc-tim-kiem">
      <KhungNoiDung tieuDe="Tìm và lọc tin" className="khung-bo-loc">
        <form key={phienBanBieuMau} onSubmit={xuLyTimKiem}>
          <TruongNhap nhan="Loại dịch vụ" ten="category" loaiTruong="select" giaTri="" cacLuaChon={[{ giaTri: '', nhan: 'Tất cả dịch vụ' }, ...CAC_LOAI_DICH_VU]} />
          <TruongNhap nhan="Khu vực" ten="location" placeholder="Ví dụ: Bình Thạnh" />
          <Nut loaiNut="submit">Tìm kiếm</Nut>
          <Nut laNutPhu onClick={datLai}>Đặt lại</Nut>
        </form>
      </KhungNoiDung>
      <div className="ket-qua-tim-kiem">
        <ThongBao loai="loi">{loi}</ThongBao>
        {!ketQua && !loi && <DangTai />}
        {ketQua && <div className="so-luong-ket-qua">{ketQua.phanTrang.totalElements} tin đang nhận đề xuất <span>{moTaBoLoc}</span></div>}
        {ketQua && ketQua.danhSach.length === 0 && <ThongBao>{boLoc.category || boLoc.location ? 'Không tìm thấy tin phù hợp' : 'Hiện không có tin sửa chữa nào'}</ThongBao>}
        {ketQua?.danhSach.map((tin) => <KhungNoiDung key={tin.id} className="the-ket-qua phieu">
          <div className="cuong-phieu">
            <div><span>Mã tin</span><strong>{dinhDangMaTin(tin.id)}</strong></div>
            <div><span>Đề xuất</span><strong>{tin.proposalCount}</strong></div>
          </div>
          <div className="than-phieu">
            <h3><a href={layDuongDanManHinh('10', { id: tin.id })}>{tin.title}</a></h3>
            <p className="loai-phieu">{tin.category} tại {tin.location}</p>
            <p className="mo-ta-phieu">{tin.description}</p>
            <div className="chan-phieu">
              <span><strong>Mong muốn {dinhDangThoiGian(tin.preferredTime)}</strong><small>Đăng {dinhDangThoiGian(tin.createdAt)}</small></span>
              <a className="lien-ket-van-ban" href={layDuongDanManHinh('10', { id: tin.id })}>Xem chi tiết {dinhDangMaTin(tin.id)}</a>
            </div>
          </div>
        </KhungNoiDung>)}
        <PhanTrang phanTrang={ketQua?.phanTrang} onChuyenTrang={datTrang} />
      </div>
    </div>
  </div>;
}
