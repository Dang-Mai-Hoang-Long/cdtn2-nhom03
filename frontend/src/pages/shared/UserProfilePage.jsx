import React, { useEffect, useState } from 'react';
import { TieuDeTrang, KhungNoiDung, Nut, TruongNhap, ThongBao, DangTai, PhanTrang, HienThiSao, LienKetNguoiDung } from '../../components/Ui.jsx';
import { layHoSoNguoiDung, capNhatThongTinCaNhan } from '../../api/userApi.js';
import { layDanhGiaCuaNguoiDung } from '../../api/reviewApi.js';
import { luuPhienDangNhap } from '../../api/phienDangNhap.js';
import { layThongDiepLoi, layLoiTheoTruong } from '../../api/httpClient.js';
import { chuyenDenManHinh, MAN_HINH_CHINH_THEO_VAI_TRO } from '../../navigation/screenRoutes.js';
import { dinhDangNgay, dinhDangDiem, NHAN_VAI_TRO } from '../../utils/dinhDang.js';

const SO_DANH_GIA_MOI_TRANG = 5;

function quayLai(vaiTro) {
  if (window.history.length > 1) window.history.back();
  else chuyenDenManHinh(MAN_HINH_CHINH_THEO_VAI_TRO[vaiTro]);
}

// Hồ sơ người dùng: thông tin tài khoản và các đánh giá người đó đã nhận.
// Phần công khai ai đăng nhập cũng xem được; email, số điện thoại và trạng thái khóa chỉ hiện cho quản trị viên và chính chủ
// (backend quyết định, giao diện chỉ hiển thị trường nào có trong phản hồi).
export default function TrangHoSoNguoiDung({ thamSo, phien }) {
  const [hoSo, datHoSo] = useState(null);
  const [loi, datLoi] = useState('');
  const [danhGia, datDanhGia] = useState(null);
  const [loiDanhGia, datLoiDanhGia] = useState('');
  const [trang, datTrang] = useState(1);
  // Chỉ chính chủ mới sửa được thông tin của mình (họ tên và số điện thoại; email dùng để đăng nhập nên không đổi).
  const [dangSua, datDangSua] = useState(false);
  const [dangLuu, datDangLuu] = useState(false);
  const [loiSua, datLoiSua] = useState('');
  const [loiTruong, datLoiTruong] = useState({});
  const [thongBaoSua, datThongBaoSua] = useState('');

  // Tải hồ sơ trước: hồ sơ không tồn tại (hoặc là quản trị viên với người thường) thì không tải đánh giá.
  useEffect(() => {
    let daHuy = false;
    layHoSoNguoiDung(thamSo.id)
      .then((duLieu) => !daHuy && datHoSo(duLieu))
      .catch((loiGoi) => !daHuy && datLoi(layThongDiepLoi(loiGoi)));
    return () => { daHuy = true; };
  }, [thamSo.id]);

  useEffect(() => {
    if (!hoSo) return undefined;
    let daHuy = false;
    datLoiDanhGia('');
    layDanhGiaCuaNguoiDung(hoSo.id, { page: trang, size: SO_DANH_GIA_MOI_TRANG })
      .then((ketQua) => !daHuy && datDanhGia(ketQua))
      .catch((loiGoi) => !daHuy && datLoiDanhGia(layThongDiepLoi(loiGoi)));
    return () => { daHuy = true; };
  }, [hoSo?.id, trang]);

  function batDauSua() {
    datThongBaoSua('');
    datLoiSua('');
    datLoiTruong({});
    datDangSua(true);
  }

  function huySua() {
    datDangSua(false);
    datLoiSua('');
    datLoiTruong({});
  }

  async function xuLyLuu(suKien) {
    suKien.preventDefault();
    const duLieu = new FormData(suKien.currentTarget);
    datDangLuu(true);
    datLoiSua('');
    datLoiTruong({});
    try {
      const nguoiDungMoi = await capNhatThongTinCaNhan({ fullName: String(duLieu.get('fullName')), phone: String(duLieu.get('phone')) });
      datHoSo((truoc) => ({ ...truoc, fullName: nguoiDungMoi.fullName, phone: nguoiDungMoi.phone }));
      // Cập nhật cả phiên đăng nhập để tên ở đầu trang đổi theo ngay.
      luuPhienDangNhap(phien.token, { ...phien.user, fullName: nguoiDungMoi.fullName, phone: nguoiDungMoi.phone });
      datDangSua(false);
      datThongBaoSua('Đã cập nhật thông tin tài khoản.');
    } catch (loiGoi) {
      datLoiTruong(layLoiTheoTruong(loiGoi));
      datLoiSua(layThongDiepLoi(loiGoi));
    } finally {
      datDangLuu(false);
    }
  }

  const nutQuayLai = <Nut laNutPhu onClick={() => quayLai(phien.user.role)}>Quay lại</Nut>;
  if (!hoSo) {
    return <div className="khung-noi-dung">{loi
      ? <><ThongBao loai="loi">{loi}</ThongBao>{nutQuayLai}</>
      : <DangTai />}</div>;
  }

  const laChinhChu = hoSo.id === phien.user.id;
  const coThongTinRieng = 'email' in hoSo;
  const nhanHoanThanh = hoSo.role === 'TECHNICIAN' ? 'Việc đã hoàn thành' : 'Tin đã hoàn thành';
  const tongDanhGia = hoSo.reviewCount;

  return <div className="khung-noi-dung">
    <TieuDeTrang tieuDe={hoSo.fullName} phuDe={`${NHAN_VAI_TRO[hoSo.role]}, tham gia từ ${dinhDangNgay(hoSo.createdAt)}`} hanhDong={nutQuayLai} />
    <ThongBao loai="thanh-cong">{thongBaoSua}</ThongBao>
    {hoSo.isLocked && <ThongBao loai="loi">Tài khoản này đang bị khóa. Người dùng không đăng nhập được cho tới khi được mở khóa.</ThongBao>}
    <div className="hai-cot luoi-chi-tiet">
      <div className="cot-noi-dung">
        <KhungNoiDung tieuDe={laChinhChu ? 'Thông tin tài khoản của bạn' : 'Thông tin tài khoản'}>
          {laChinhChu && dangSua
            ? <form onSubmit={xuLyLuu} noValidate>
              <ThongBao loai="loi">{loiSua}</ThongBao>
              <TruongNhap nhan="Họ tên" ten="fullName" giaTri={hoSo.fullName} batBuoc maxLength={100} autoComplete="name" loi={loiTruong.fullName} />
              <TruongNhap nhan="Số điện thoại" ten="phone" loaiTruong="tel" giaTri={hoSo.phone} batBuoc autoComplete="tel" loi={loiTruong.phone} />
              <div className="truong-chi-doc">
                <span className="nhan-mo-ta">Email</span>
                <strong>{hoSo.email}</strong>
                <span className="mo-ta-phu">Email dùng để đăng nhập nên không đổi được.</span>
              </div>
              <div className="hang-nut">
                <Nut loaiNut="submit" disabled={dangLuu}>{dangLuu ? 'Đang lưu…' : 'Lưu thay đổi'}</Nut>
                <Nut laNutPhu onClick={huySua} disabled={dangLuu}>Hủy</Nut>
              </div>
            </form>
            : <>
          <div className="luoi-truong-nhap">
            <div><span className="nhan-mo-ta">Vai trò</span><strong>{NHAN_VAI_TRO[hoSo.role]}</strong></div>
            <div><span className="nhan-mo-ta">Tham gia từ</span><strong>{dinhDangNgay(hoSo.createdAt)}</strong></div>
            {hoSo.role !== 'ADMIN' && <div><span className="nhan-mo-ta">{nhanHoanThanh}</span><strong>{hoSo.completedCount}</strong></div>}
            {coThongTinRieng && <div><span className="nhan-mo-ta">Trạng thái</span><strong>{hoSo.isLocked ? 'Bị khóa' : 'Đang hoạt động'}</strong></div>}
            {coThongTinRieng && <div className="truong-nhap-rong"><span className="nhan-mo-ta">Email</span><strong>{hoSo.email}</strong></div>}
            {coThongTinRieng && <div className="truong-nhap-rong"><span className="nhan-mo-ta">Số điện thoại</span><strong>{hoSo.phone}</strong></div>}
          </div>
          {!coThongTinRieng && <p className="mo-ta-phu">Email và số điện thoại chỉ hiển thị cho chính chủ và quản trị viên.</p>}
          {laChinhChu && <div className="hang-nut"><Nut laNutPhu onClick={batDauSua}>Sửa thông tin</Nut></div>}
            </>}
        </KhungNoiDung>
        {hoSo.role !== 'ADMIN' && <KhungNoiDung tieuDe="Điểm đánh giá">
          {tongDanhGia === 0
            ? <p className="mo-ta-phu">{dinhDangDiem(hoSo.ratingAvg)}</p>
            : <>
              <div className="tong-quan-diem">
                <strong className="diem-lon">{Number(hoSo.ratingAvg).toFixed(1).replace('.', ',')}</strong>
                <div><HienThiSao diem={hoSo.ratingAvg} /><span className="mo-ta-phu">Trung bình từ {tongDanhGia} đánh giá</span></div>
              </div>
              <div className="phan-bo-sao">
                {[5, 4, 3, 2, 1].map((sao) => <div className="dong-phan-bo" key={sao}>
                  <span>{sao} sao</span>
                  <span className="thanh-phan-bo" aria-hidden="true"><span style={{ width: `${(hoSo.ratingCounts[sao] / tongDanhGia) * 100}%` }} /></span>
                  <span>{hoSo.ratingCounts[sao]}</span>
                </div>)}
              </div>
            </>}
        </KhungNoiDung>}
      </div>

      {hoSo.role !== 'ADMIN' && <KhungNoiDung tieuDe={`Đánh giá đã nhận (${tongDanhGia})`}>
        <ThongBao loai="loi">{loiDanhGia}</ThongBao>
        {!danhGia && !loiDanhGia && <DangTai />}
        {danhGia && danhGia.danhSach.length === 0 && <p className="mo-ta-phu">{laChinhChu
          ? 'Bạn chưa nhận được đánh giá nào. Đánh giá xuất hiện sau khi công việc hoàn thành và bên kia gửi đánh giá.'
          : 'Người dùng này chưa nhận được đánh giá nào.'}</p>}
        {danhGia && danhGia.danhSach.length > 0 && <div className="danh-sach-danh-gia">
          {danhGia.danhSach.map((muc) => <article className="danh-gia-muc" key={muc.id}>
            <div className="dau-danh-gia"><HienThiSao diem={muc.rating} /><time dateTime={muc.createdAt}>{dinhDangNgay(muc.createdAt)}</time></div>
            <p className="noi-dung-danh-gia">{muc.comment || 'Không có nhận xét.'}</p>
            <p className="nguon-danh-gia">Từ <LienKetNguoiDung id={muc.fromUser.id}>{muc.fromUser.fullName}</LienKetNguoiDung> ({NHAN_VAI_TRO[muc.fromUser.role]}), cho tin “{muc.requestTitle}”</p>
          </article>)}
        </div>}
        <PhanTrang phanTrang={danhGia?.phanTrang} onChuyenTrang={datTrang} />
      </KhungNoiDung>}
    </div>
  </div>;
}
