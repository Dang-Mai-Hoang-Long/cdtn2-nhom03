import React, { useCallback, useEffect, useState } from 'react';
import { layDanhSachThongBao, demThongBaoChuaDoc, danhDauDaDoc } from '../api/notificationApi.js';
import { layChiTietDeXuat } from '../api/proposalApi.js';
import { chuyenDenManHinh } from '../navigation/screenRoutes.js';
import { dinhDangThoiGian } from '../utils/dinhDang.js';

const THOI_GIAN_CAP_NHAT_MS = 60000;
const NHAN_LOAI_THONG_BAO = {
  NEW_PROPOSAL: 'Đề xuất mới',
  PROPOSAL_ACCEPTED: 'Đề xuất được chấp nhận',
  PROPOSAL_REJECTED: 'Đề xuất không được chọn',
  REQUEST_COMPLETED: 'Công việc hoàn thành',
  REVIEW_RECEIVED: 'Đánh giá mới',
};

async function layMaTinCuaDeXuat(maDeXuat) {
  const deXuat = await layChiTietDeXuat(maDeXuat);
  return deXuat.requestId;
}

// relatedId là mã đề xuất với NEW_PROPOSAL, PROPOSAL_ACCEPTED, PROPOSAL_REJECTED và là mã tin với REQUEST_COMPLETED, REVIEW_RECEIVED.
// Mở màn hình ứng với từng loại: khách hàng xem đề xuất mới hoặc theo dõi công việc; kỹ thuật viên xem công việc được chọn hoặc tin.
async function moNoiDungThongBao(thongBao, maVaiTro) {
  const { type, relatedId } = thongBao;
  if (!relatedId) return;
  const laKhachHang = maVaiTro === 'CUSTOMER';
  try {
    if (type === 'NEW_PROPOSAL') chuyenDenManHinh('06', { id: relatedId });
    else if (type === 'PROPOSAL_ACCEPTED') chuyenDenManHinh('13', { id: await layMaTinCuaDeXuat(relatedId) });
    else if (type === 'PROPOSAL_REJECTED') chuyenDenManHinh('10', { id: await layMaTinCuaDeXuat(relatedId) });
    else if (type === 'REQUEST_COMPLETED') chuyenDenManHinh('13', { id: relatedId });
    else if (type === 'REVIEW_RECEIVED') chuyenDenManHinh(laKhachHang ? '07' : '13', { id: relatedId });
  } catch {
    chuyenDenManHinh(laKhachHang ? '03' : '12');
  }
}

// US20: chuông thông báo trong ứng dụng; danh sách mới nhất trước. Thông báo chưa đọc có chấm xanh bên trái,
// bấm vào dòng để xem thì đánh dấu đã đọc và chấm biến mất.
export default function ChuongThongBao({ vaiTro, maVaiTro }) {
  const [dangMo, datTrangThaiMo] = useState(false);
  const [soChuaDoc, datSoChuaDoc] = useState(0);
  const [danhSachThongBao, datDanhSachThongBao] = useState(null);

  const capNhatSoChuaDoc = useCallback(() => {
    demThongBaoChuaDoc().then(datSoChuaDoc).catch(() => {});
  }, []);

  useEffect(() => {
    capNhatSoChuaDoc();
    const hen = window.setInterval(capNhatSoChuaDoc, THOI_GIAN_CAP_NHAT_MS);
    return () => window.clearInterval(hen);
  }, [capNhatSoChuaDoc]);

  useEffect(() => {
    if (!dangMo) return;
    layDanhSachThongBao({ size: 20 }).then(({ danhSach }) => datDanhSachThongBao(danhSach)).catch(() => datDanhSachThongBao([]));
  }, [dangMo]);

  async function danhDauDaDocTrongDanhSach(thongBao) {
    try {
      await danhDauDaDoc(thongBao.id);
      datDanhSachThongBao((danhSachTruoc) => danhSachTruoc?.map((muc) => (muc.id === thongBao.id ? { ...muc, isRead: true } : muc)));
      capNhatSoChuaDoc();
    } catch {
      // Không đánh dấu được thì giữ chấm xanh để người dùng thấy thông báo vẫn chưa đọc.
    }
  }

  async function moThongBao(thongBao) {
    datTrangThaiMo(false);
    if (!thongBao.isRead) await danhDauDaDocTrongDanhSach(thongBao);
    await moNoiDungThongBao(thongBao, maVaiTro);
  }

  return <div className="khung-nut-thong-bao">
    <button
      className={`nut-thong-bao ${dangMo ? 'dang-mo' : ''}`}
      type="button"
      aria-label={`Thông báo, ${soChuaDoc} chưa đọc`}
      aria-expanded={dangMo}
      onClick={() => datTrangThaiMo((trangThaiTruoc) => !trangThaiTruoc)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
      {soChuaDoc > 0 && <span className="so-luong-thong-bao">{soChuaDoc}</span>}
    </button>
    {dangMo && <section className="bang-thong-bao" aria-label="Thông báo">
      <div className="dau-bang-thong-bao"><strong>Thông báo</strong><span>{vaiTro}</span></div>
      <div className="danh-sach-thong-bao">
        {danhSachThongBao === null && <p className="muc-thong-bao">Đang tải…</p>}
        {danhSachThongBao?.length === 0 && <p className="muc-thong-bao">Bạn chưa có thông báo nào.</p>}
        {danhSachThongBao?.map((thongBao) => <button type="button" className={`muc-thong-bao ${thongBao.isRead ? '' : 'chua-doc'}`} key={thongBao.id} onClick={() => moThongBao(thongBao)}>
          {!thongBao.isRead && <>
            <span className="cham-chua-doc" aria-hidden="true" />
            <span className="chi-cho-trinh-doc">Chưa đọc. </span>
          </>}
          <span className="loai-thong-bao">{NHAN_LOAI_THONG_BAO[thongBao.type] ?? 'Thông báo'}</span>
          <strong>{thongBao.title}</strong>
          <span className="noi-dung-thong-bao">{thongBao.content}</span>
          <time>{dinhDangThoiGian(thongBao.createdAt)}</time>
        </button>)}
      </div>
    </section>}
  </div>;
}
