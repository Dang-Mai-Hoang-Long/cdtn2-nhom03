import React from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, NhanTrangThai, TruongNhap, GhiChu, GhiChuChanTrang, TienTrinh } from './Ui.jsx';
import { danhSachYeuCau } from '../data/demoData.js';

const yeuCau = danhSachYeuCau[0];

export function BieuMauDanhGia({ doiTuongDanhGia }) {
  return <><div className="khung-noi-dung"><TieuDeTrang tieuDe={doiTuongDanhGia === 'Kỹ thuật viên' ? 'Hoàn thành và đánh giá' : 'Đánh giá khách hàng'} phuDe={`${yeuCau.maYeuCau} — ${yeuCau.tieuDe} · Công việc hoàn thành lúc 22/10/2026 · 10:30`} hanhDong={<NhanTrangThai sacThai="nhan-dam">Hoàn thành</NhanTrangThai>} /><TienTrinh buocHienTai={2} />
    <div className="hai-cot luoi-danh-gia"><KhungNoiDung tieuDe={`Đánh giá ${doiTuongDanhGia.toLowerCase()}`} className="khung-bieu-mau"><label className="truong-nhap"><span>Chất lượng trải nghiệm *</span><div className="cac-sao">{[1,2,3,4,5].map((soSao)=><button key={soSao} type="button" aria-label={`${soSao} sao`}>{soSao} ★</button>)}</div></label><TruongNhap nhan="Nhận xét (không bắt buộc)" giaTri={doiTuongDanhGia === 'Kỹ thuật viên' ? 'Kỹ thuật viên đến đúng giờ, kiểm tra và giải thích rõ tình trạng máy lạnh.' : 'Khách hàng cung cấp thông tin rõ ràng, phối hợp tốt khi kiểm tra thiết bị.'} laVungVanBan /><GhiChu>Mỗi bên chỉ được gửi một đánh giá cho công việc đã hoàn thành.</GhiChu><div className="hang-nut"><Nut maManHinhDich={doiTuongDanhGia === 'Kỹ thuật viên' ? '03' : '13'}>Gửi đánh giá</Nut><Nut maManHinhDich={doiTuongDanhGia === 'Kỹ thuật viên' ? '03' : '13'} laNutPhu>Về danh sách</Nut></div></KhungNoiDung><KhungNoiDung tieuDe="Người nhận đánh giá"><dl className="danh-sach-vai-tro"><dt>{doiTuongDanhGia} thực hiện</dt><dd>{doiTuongDanhGia === 'Kỹ thuật viên' ? 'Trần Quốc Huy' : 'Nguyễn Minh Anh'}</dd><dt>Dịch vụ</dt><dd>Sửa máy lạnh</dd><dt>Công việc</dt><dd>{yeuCau.maYeuCau} · {yeuCau.tieuDe}</dd><dt>Hoàn thành lúc</dt><dd>22/10/2026 · 10:30</dd></dl><GhiChu>Đánh giá giúp cộng đồng tham khảo chất lượng làm việc.</GhiChu></KhungNoiDung></div>
    </div><GhiChuChanTrang>Gửi đánh giá → danh sách tương ứng. Có thể bỏ qua nhận xét; trang hiển thị dữ liệu minh họa.</GhiChuChanTrang></>;
}
