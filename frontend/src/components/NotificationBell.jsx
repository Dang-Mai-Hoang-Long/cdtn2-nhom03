import React, { useCallback, useEffect, useState } from 'react';
import { layDanhSachThongBao, demThongBaoChuaDoc, danhDauDaDoc } from '../api/notificationApi.js';
import { layChiTietDeXuat } from '../api/proposalApi.js';
import { chuyenDenManHinh } from '../navigation/screenRoutes.js';
import { dinhDangThoiGian } from '../utils/dinhDang.js';

const THOI_GIAN_CAP_NHAT_MS = 60000;
const NHAN_LOAI_THONG_BAO = { PROPOSAL_ACCEPTED: 'Đề xuất được chấp nhận' };

// US20: chuông thông báo trong ứng dụng; danh sách mới nhất trước, bấm vào để đánh dấu đã đọc.
export default function ChuongThongBao({ vaiTro }) {
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

  async function moThongBao(thongBao) {
    datTrangThaiMo(false);
    if (!thongBao.isRead) {
      await danhDauDaDoc(thongBao.id).catch(() => {});
      capNhatSoChuaDoc();
    }
    // relatedId là mã đề xuất: lấy mã tin để mở trang Công việc được chọn.
    if (thongBao.type === 'PROPOSAL_ACCEPTED' && thongBao.relatedId) {
      try {
        const deXuat = await layChiTietDeXuat(thongBao.relatedId);
        chuyenDenManHinh('13', { id: deXuat.requestId });
      } catch {
        chuyenDenManHinh('12');
      }
    }
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
          <span className="loai-thong-bao">{NHAN_LOAI_THONG_BAO[thongBao.type] ?? 'Thông báo'}{!thongBao.isRead && ' · Mới'}</span>
          <strong>{thongBao.title}</strong>
          <span className="noi-dung-thong-bao">{thongBao.content}</span>
          <time>{dinhDangThoiGian(thongBao.createdAt)}</time>
        </button>)}
      </div>
    </section>}
  </div>;
}
