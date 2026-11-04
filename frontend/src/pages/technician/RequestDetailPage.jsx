import React from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, NhanTrangThai, GhiChu, GhiChuChanTrang, TomTatYeuCau } from '../../components/Ui.jsx';
import { danhSachYeuCau } from '../../data/demoData.js';
const yeuCau = danhSachYeuCau[0];
export default function TrangChiTietTinKyThuatVien() {
  return <><div className="khung-noi-dung"><TieuDeTrang tieuDe={yeuCau.tieuDe} phuDe={`${yeuCau.maYeuCau} · Đăng ngày 20/10/2026 lúc 08:30`} hanhDong={<NhanTrangThai>Chờ đề xuất</NhanTrangThai>} />
    <div className="hai-cot"><KhungNoiDung tieuDe="Chi tiết tin công khai"><TomTatYeuCau /></KhungNoiDung><div className="cot-noi-dung"><KhungNoiDung tieuDe="Bạn có thể thực hiện?"><div className="luoi-truong-nhap"><div><span className="nhan-mo-ta">Dịch vụ</span><strong>Sửa máy lạnh</strong></div><div><span className="nhan-mo-ta">Khu vực</span><strong>Bình Thạnh</strong></div><div className="truong-nhap-rong"><span className="nhan-mo-ta">Lịch mong muốn</span><strong>22/10/2026 · 09:00 – 11:00</strong></div></div><Nut maManHinhDich="11">Gửi đề xuất</Nut><Nut maManHinhDich="09" laNutPhu>Quay lại tìm việc</Nut></KhungNoiDung><GhiChu>Số điện thoại và địa chỉ chi tiết sẽ hiển thị cho kỹ thuật viên được chọn.</GhiChu></div></div>
    </div><GhiChuChanTrang>Gửi đề xuất → 11. Tin đã đóng hoặc đã chọn kỹ thuật viên sẽ không nhận đề xuất mới.</GhiChuChanTrang></>;
}
