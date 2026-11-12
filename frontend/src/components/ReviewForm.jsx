import React, { useEffect, useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, TruongNhap, ThongBao, DangTai, TienTrinh, NhanTrangThaiYeuCau } from './Ui.jsx';
import { layChiTietYeuCau } from '../api/requestApi.js';
import { layDanhSachDeXuatCuaYeuCau } from '../api/proposalApi.js';
import { taoDanhGia } from '../api/reviewApi.js';
import { layThongDiepLoi, layLoiTheoTruong } from '../api/httpClient.js';
import { dinhDangMaTin } from '../utils/dinhDang.js';

const CAC_SO_SAO = [1, 2, 3, 4, 5];

// Tải tin và tên người nhận đánh giá: khách hàng đánh giá kỹ thuật viên được chọn, kỹ thuật viên đánh giá khách hàng.
async function taiDuLieu(maTin, khachDanhGia) {
  const yeuCau = await layChiTietYeuCau(maTin);
  if (!khachDanhGia) return { yeuCau, tenNguoiNhan: yeuCau.customer.fullName };
  const cacDeXuat = await layDanhSachDeXuatCuaYeuCau(maTin);
  const duocChon = cacDeXuat.find((deXuat) => deXuat.id === yeuCau.selectedProposalId);
  return { yeuCau, tenNguoiNhan: duocChon?.technician.fullName ?? '—' };
}

// Lý do chưa được đánh giá, hoặc null nếu được. BR13: chỉ khi tin Hoàn thành và đúng bên tham gia; BR14: mỗi bên một lần.
function lyDoChuaDuocDanhGia(yeuCau, khachDanhGia) {
  if (!khachDanhGia && yeuCau.myProposalStatus !== 'ACCEPTED') return 'Bạn không phải kỹ thuật viên được chọn cho công việc này nên không đánh giá được.';
  if (yeuCau.status !== 'COMPLETED') return 'Chỉ được đánh giá sau khi công việc hoàn thành.';
  if (yeuCau.hasReviewed) return 'Bạn đã đánh giá rồi.';
  return null;
}

// US18 (khách hàng đánh giá kỹ thuật viên) và US19 (kỹ thuật viên đánh giá khách hàng).
// Giao diện chỉ hiện biểu mẫu khi hợp lệ; backend vẫn kiểm tra lại (CANNOT_REVIEW_YET, ALREADY_REVIEWED, NOT_OWNER).
export function BieuMauDanhGia({ doiTuongDanhGia, thamSo }) {
  const khachDanhGia = doiTuongDanhGia === 'Kỹ thuật viên';
  const [duLieu, datDuLieu] = useState(null);
  const [loi, datLoi] = useState('');
  const [soSao, datSoSao] = useState(0);
  const [loiTheoTruong, datLoiTheoTruong] = useState({});
  const [dangGui, datDangGui] = useState(false);
  const [daGui, datDaGui] = useState(false);

  useEffect(() => {
    taiDuLieu(thamSo.id, khachDanhGia).then(datDuLieu).catch((loiGoi) => datLoi(layThongDiepLoi(loiGoi)));
  }, [thamSo.id, khachDanhGia]);

  async function xuLyGui(suKien) {
    suKien.preventDefault();
    const nhanXet = String(new FormData(suKien.currentTarget).get('comment')).trim();
    datDangGui(true);
    datLoi('');
    datLoiTheoTruong({});
    try {
      await taoDanhGia({ requestId: duLieu.yeuCau.id, rating: soSao || null, comment: nhanXet || undefined });
      datDaGui(true);
    } catch (loiGoi) {
      const cacLoi = layLoiTheoTruong(loiGoi);
      datLoiTheoTruong(cacLoi);
      datLoi(Object.keys(cacLoi).length ? '' : layThongDiepLoi(loiGoi));
      datDangGui(false);
    }
  }

  const nutQuayLai = <Nut maManHinhDich={khachDanhGia ? '07' : '13'} thamSoDich={{ id: thamSo.id }} laNutPhu>Quay lại công việc</Nut>;
  if (!duLieu) return <div className="khung-noi-dung">{loi ? <><ThongBao loai="loi">{loi}</ThongBao>{nutQuayLai}</> : <DangTai />}</div>;

  const { yeuCau, tenNguoiNhan } = duLieu;
  const lyDo = lyDoChuaDuocDanhGia(yeuCau, khachDanhGia);
  let noiDung;
  if (daGui) {
    noiDung = <><ThongBao loai="thanh-cong">Gửi đánh giá thành công. Cảm ơn bạn đã phản hồi.</ThongBao>{nutQuayLai}</>;
  } else if (lyDo) {
    noiDung = <><ThongBao>{lyDo}</ThongBao>{nutQuayLai}</>;
  } else {
    noiDung = <form onSubmit={xuLyGui} noValidate>
      <ThongBao loai="loi">{loi}</ThongBao>
      <div className={`truong-nhap ${loiTheoTruong.rating ? 'truong-nhap-co-loi' : ''}`}>
        <span>Chất lượng trải nghiệm *</span>
        <div className="cac-sao" role="group" aria-label="Số sao">
          {CAC_SO_SAO.map((so) => <button key={so} type="button" className={soSao === so ? 'dang-chon' : ''} aria-pressed={soSao === so} aria-label={`${so} sao`} onClick={() => datSoSao(so)}>{so} ★</button>)}
        </div>
        {loiTheoTruong.rating && <small className="loi-truong-nhap">{loiTheoTruong.rating}</small>}
      </div>
      <TruongNhap nhan="Nhận xét (không bắt buộc)" ten="comment" laVungVanBan maxLength={1000} loi={loiTheoTruong.comment} />
      <ThongBao>Mỗi bên chỉ được gửi một đánh giá cho công việc đã hoàn thành.</ThongBao>
      <div className="hang-nut"><Nut loaiNut="submit" disabled={dangGui}>{dangGui ? 'Đang gửi…' : 'Gửi đánh giá'}</Nut>{nutQuayLai}</div>
    </form>;
  }

  return <div className="khung-noi-dung">
    <TieuDeTrang tieuDe={`Đánh giá ${doiTuongDanhGia.toLowerCase()}`} phuDe={`${dinhDangMaTin(yeuCau.id)} — ${yeuCau.title}`} hanhDong={<NhanTrangThaiYeuCau trangThai={yeuCau.status} />} />
    <TienTrinh trangThai={yeuCau.status} />
    <div className="hai-cot luoi-danh-gia">
      <KhungNoiDung tieuDe={`Đánh giá ${doiTuongDanhGia.toLowerCase()}`} className="khung-bieu-mau">{noiDung}</KhungNoiDung>
      <KhungNoiDung tieuDe="Người nhận đánh giá">
        <dl className="danh-sach-vai-tro">
          <dt>{doiTuongDanhGia}</dt><dd>{tenNguoiNhan}</dd>
          <dt>Dịch vụ</dt><dd>{yeuCau.category}</dd>
          <dt>Công việc</dt><dd>{dinhDangMaTin(yeuCau.id)} · {yeuCau.title}</dd>
        </dl>
      </KhungNoiDung>
    </div>
  </div>;
}
