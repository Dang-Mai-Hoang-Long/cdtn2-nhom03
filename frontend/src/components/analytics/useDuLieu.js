// Tải dữ liệu cho một khối thống kê: giữ kết quả cũ trong lúc tải lại, tải lại định kỳ khi có chuKy (mili giây), và
// bỏ kết quả của lần tải đã cũ. khoa là chuỗi đại diện tham số: đổi khoa thì tải lại.
import { useCallback, useEffect, useRef, useState } from 'react';
import { layThongDiepLoi } from '../../api/httpClient.js';

export function useDuLieu(tai, khoa, { chuKy = 0, bat = true } = {}) {
  const [trangThai, datTrangThai] = useState({ duLieu: null, loi: '', dangTai: bat, khoa: null });
  const [lan, datLan] = useState(0);
  const hamTai = useRef(tai);
  hamTai.current = tai;

  useEffect(() => {
    if (!bat) return undefined;
    let daHuy = false;
    let henGio;
    async function chay() {
      datTrangThai((cu) => ({ ...cu, dangTai: true }));
      try {
        const duLieu = await hamTai.current();
        if (!daHuy) datTrangThai({ duLieu, loi: '', dangTai: false, khoa });
      } catch (loi) {
        // Lỗi khi đổi tham số thì bỏ dữ liệu cũ (tránh hiện số của bộ lọc khác); lỗi khi tự làm mới thì giữ lại.
        if (!daHuy) datTrangThai((cu) => ({ duLieu: cu.khoa === khoa ? cu.duLieu : null, loi: layThongDiepLoi(loi), dangTai: false, khoa: cu.khoa }));
      }
      if (!daHuy && chuKy > 0) henGio = setTimeout(chay, chuKy);
    }
    chay();
    return () => {
      daHuy = true;
      clearTimeout(henGio);
    };
  }, [khoa, lan, chuKy, bat]);

  const taiLai = useCallback(() => datLan((so) => so + 1), []);
  return { ...trangThai, taiLai };
}

// Gộp nhiều lần tải thành một trạng thái cho VungDuLieu: chỉ có dữ liệu khi tất cả đều đã có.
export function gopTrangThai(cacLanTai) {
  const ds = Object.entries(cacLanTai);
  return {
    duLieu: ds.every(([, t]) => t.duLieu) ? Object.fromEntries(ds.map(([ten, t]) => [ten, t.duLieu])) : null,
    loi: ds.find(([, t]) => t.loi)?.[1].loi ?? '',
    dangTai: ds.some(([, t]) => t.dangTai),
    taiLai: () => ds.forEach(([, t]) => t.taiLai()),
  };
}

// Bề rộng thật của một phần tử, để vẽ biểu đồ SVG đúng điểm ảnh (chữ không bị co giãn).
export function useBeRong() {
  const [beRong, datBeRong] = useState(0);
  const quanSat = useRef(null);
  const ganPhanTu = useCallback((phanTu) => {
    quanSat.current?.disconnect();
    if (!phanTu) return;
    datBeRong(phanTu.clientWidth);
    quanSat.current = new ResizeObserver(([muc]) => datBeRong(Math.floor(muc.contentRect.width)));
    quanSat.current.observe(phanTu);
  }, []);
  return [ganPhanTu, beRong];
}
