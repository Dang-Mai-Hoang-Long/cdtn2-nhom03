import React from "react";
import {
  TieuDeTrang,
  KhungNoiDung,
  Nut,
  NhanTrangThai,
  GhiChu,
  GhiChuChanTrang,
  TomTatYeuCau,
  TienTrinh,
} from "../../components/Ui.jsx";
import { danhSachYeuCau, danhSachDeXuat } from "../../data/demoData.js";
const yeuCau = danhSachYeuCau[0];
export default function TrangCongViecDuocChon() {
  return (
    <>
      <div className="khung-noi-dung">
        <TieuDeTrang
          tieuDe="Công việc được chọn"
          phuDe={`${yeuCau.maYeuCau} — ${yeuCau.tieuDe} · Đề xuất DX-018 đã được chấp nhận.`}
          hanhDong={<NhanTrangThai>Đã chọn kỹ thuật viên</NhanTrangThai>}
        />
        <GhiChu>Chờ khách hàng xác nhận hoàn thành công việc.</GhiChu>
        <div className="hai-cot">
          <div className="cot-noi-dung">
            <KhungNoiDung tieuDe="Yêu cầu sửa chữa">
              <TomTatYeuCau />
            </KhungNoiDung>
            <KhungNoiDung tieuDe="Đề xuất DX-018">
              <div className="luoi-truong-nhap">
                <div>
                  <span className="nhan-mo-ta">Kỹ thuật viên</span>
                  <strong>Trần Quốc Huy</strong>
                </div>
                <div>
                  <span className="nhan-mo-ta">Chi phí đề xuất</span>
                  <strong>450.000 đ</strong>
                </div>
                <div className="truong-nhap-rong">
                  <span className="nhan-mo-ta">Nội dung thực hiện</span>
                  <p>{danhSachDeXuat[0].tomTat}</p>
                </div>
                <div>
                  <span className="nhan-mo-ta">Ngày dự kiến</span>
                  <strong>22/10/2026 · 09:00</strong>
                </div>
                <div>
                  <span className="nhan-mo-ta">Thời lượng</span>
                  <strong>90 phút</strong>
                </div>
              </div>
            </KhungNoiDung>
          </div>
          <div className="cot-noi-dung">
            <KhungNoiDung tieuDe="Liên hệ khách hàng">
              <NhanTrangThai sacThai="nhan-nhat">Chỉ hiển thị sau khi được chọn</NhanTrangThai>
              <dl className="danh-sach-vai-tro">
                <dt>Khách hàng</dt>
                <dd>Nguyễn Minh Anh</dd>
                <dt>Số điện thoại</dt>
                <dd>090 123 4567</dd>
                <dt>Địa chỉ</dt>
                <dd>24/8 đường D5, Phường 25, Bình Thạnh</dd>
              </dl>
              <GhiChu>
                Thông tin này chỉ hiển thị cho kỹ thuật viên đã được chọn.
              </GhiChu>
            </KhungNoiDung>
            <KhungNoiDung tieuDe="Trạng thái công việc">
              <TienTrinh buocHienTai={1} />
              <Nut maManHinhDich="14">Xem đánh giá khách hàng</Nut>
            </KhungNoiDung>
          </div>
        </div>
      </div>
      <GhiChuChanTrang>
        13 là trang công việc được chọn. Khi khách xác nhận hoàn thành, trạng
        thái sẽ đổi và hai bên có thể đánh giá.
      </GhiChuChanTrang>
    </>
  );
}
