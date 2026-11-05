const { chayTrongGiaoDich } = require('../db');
const khoDeXuat = require('../repositories/proposal.repository');
const khoYeuCau = require('../repositories/request.repository');
const dichVuYeuCau = require('./request.service');
const dichVuThongBao = require('./notification.service');
const { LoiUngDung } = require('../utils/error-handler');
const { TRANG_THAI_YEU_CAU, TRANG_THAI_DE_XUAT } = require('../utils/constants');

function baoLoiDaGuiDeXuat() {
  return new LoiUngDung(409, 'ALREADY_PROPOSED', 'Bạn đã gửi đề xuất cho tin này');
}

// US13 (BR07, BR08). Khóa dòng tin để không nhận đề xuất khi tin vừa chuyển trạng thái.
function guiDeXuat(nguoiDung, duLieu) {
  return chayTrongGiaoDich(async (client) => {
    const yeuCau = await dichVuYeuCau.layYeuCauHoacBaoLoi(duLieu.requestId, { client, khoaDong: true });
    if (yeuCau.status !== TRANG_THAI_YEU_CAU.CHO_DE_XUAT) {
      throw new LoiUngDung(400, 'REQUEST_NOT_WAITING', 'Tin không còn nhận đề xuất');
    }
    if (await khoDeXuat.coDeXuatDangHieuLuc(yeuCau.id, nguoiDung.id, { client })) throw baoLoiDaGuiDeXuat();

    try {
      return await khoDeXuat.tao(
        {
          requestId: yeuCau.id,
          technicianId: nguoiDung.id,
          price: duLieu.price,
          description: duLieu.description.trim(),
          estimatedDuration: duLieu.estimatedDuration?.trim() || null,
        },
        { client },
      );
    } catch (loi) {
      if (loi.code === '23505') throw baoLoiDaGuiDeXuat();
      throw loi;
    }
  });
}

// US14 (BR09): chỉ chủ tin xem được danh sách đề xuất.
async function layDanhSachDeXuatCuaYeuCau(nguoiDung, requestId) {
  const yeuCau = await dichVuYeuCau.layYeuCauHoacBaoLoi(requestId);
  dichVuYeuCau.kiemTraChuTin(yeuCau, nguoiDung);
  return khoDeXuat.timTheoYeuCau(yeuCau.id);
}

// US16 (BR09, BR10, BR12, BR16): mọi thay đổi nằm trong một transaction.
function chapNhanDeXuat(nguoiDung, id) {
  const maDeXuat = dichVuYeuCau.docMaSo(id, 'PROPOSAL_NOT_FOUND', 'Không tìm thấy đề xuất');
  return chayTrongGiaoDich(async (client) => {
    const deXuatBanDau = await khoDeXuat.timTheoId(maDeXuat, { client });
    if (!deXuatBanDau) throw new LoiUngDung(404, 'PROPOSAL_NOT_FOUND', 'Không tìm thấy đề xuất');

    // Khóa tin trước rồi mới khóa đề xuất, để hai lần chấp nhận song song xếp hàng theo tin.
    const yeuCau = await khoYeuCau.timTheoId(deXuatBanDau.requestId, { client, khoaDong: true });
    dichVuYeuCau.kiemTraChuTin(yeuCau, nguoiDung);
    const deXuat = await khoDeXuat.timTheoId(maDeXuat, { client, khoaDong: true });

    if (yeuCau.status === TRANG_THAI_YEU_CAU.DA_CHON_KY_THUAT_VIEN || yeuCau.status === TRANG_THAI_YEU_CAU.HOAN_THANH) {
      throw new LoiUngDung(409, 'PROPOSAL_ALREADY_ACCEPTED', 'Tin đã chọn kỹ thuật viên');
    }
    if (yeuCau.status !== TRANG_THAI_YEU_CAU.CHO_DE_XUAT) {
      throw new LoiUngDung(400, 'INVALID_STATUS_TRANSITION', 'Tin không còn ở trạng thái chờ đề xuất');
    }
    if (deXuat.status !== TRANG_THAI_DE_XUAT.CHO_XU_LY) {
      throw new LoiUngDung(400, 'INVALID_STATUS_TRANSITION', 'Đề xuất này không còn được chọn');
    }

    const deXuatDuocChon = await khoDeXuat.capNhatTrangThai(deXuat.id, TRANG_THAI_DE_XUAT.DA_CHAP_NHAN, { client });
    await khoDeXuat.tuChoiCacDeXuatConLai(yeuCau.id, deXuat.id, { client });
    await khoYeuCau.capNhatTrangThai(yeuCau.id, TRANG_THAI_YEU_CAU.DA_CHON_KY_THUAT_VIEN, { client, selectedProposalId: deXuat.id });
    await dichVuThongBao.thongBaoDeXuatDuocChapNhan(deXuatDuocChon, { client });
    return deXuatDuocChon;
  });
}

const NHAN_TRANG_THAI_DE_XUAT = {
  PENDING: 'đang chờ xem xét',
  ACCEPTED: 'đã được chấp nhận',
  REJECTED: 'không được chọn',
  WITHDRAWN: 'đã rút',
};

function docMaDeXuat(id) {
  return dichVuYeuCau.docMaSo(id, 'PROPOSAL_NOT_FOUND', 'Không tìm thấy đề xuất');
}

// US15: chủ tin (BR09) hoặc kỹ thuật viên gửi đề xuất xem được chi tiết đề xuất.
async function layChiTietDeXuat(nguoiDung, id) {
  const deXuat = await khoDeXuat.timChiTietTheoId(docMaDeXuat(id));
  if (!deXuat) throw new LoiUngDung(404, 'PROPOSAL_NOT_FOUND', 'Không tìm thấy đề xuất');
  const laChuTin = deXuat.request.customerId === nguoiDung.id;
  const laNguoiGui = deXuat.technicianId === nguoiDung.id;
  if (!laChuTin && !laNguoiGui) throw new LoiUngDung(403, 'NOT_OWNER', 'Bạn không có quyền xem đề xuất này');
  return deXuat;
}

// Màn hình 12: kỹ thuật viên xem các đề xuất mình đã gửi.
function layDanhSachDeXuatCuaToi(nguoiDung, { status, phanTrang }) {
  return khoDeXuat.timTheoKyThuatVien(nguoiDung.id, { status, ...phanTrang });
}

// Khóa tin rồi khóa đề xuất (cùng thứ tự với chấp nhận đề xuất) và kiểm tra người gửi.
async function khoaDeXuatCuaKyThuatVien(client, nguoiDung, id) {
  const maDeXuat = docMaDeXuat(id);
  const deXuatBanDau = await khoDeXuat.timTheoId(maDeXuat, { client });
  if (!deXuatBanDau) throw new LoiUngDung(404, 'PROPOSAL_NOT_FOUND', 'Không tìm thấy đề xuất');
  const yeuCau = await khoYeuCau.timTheoId(deXuatBanDau.requestId, { client, khoaDong: true });
  const deXuat = await khoDeXuat.timTheoId(maDeXuat, { client, khoaDong: true });
  if (deXuat.technicianId !== nguoiDung.id) throw new LoiUngDung(403, 'NOT_OWNER', 'Bạn không phải người gửi đề xuất này');
  if (deXuat.status === TRANG_THAI_DE_XUAT.DA_CHAP_NHAN) {
    throw new LoiUngDung(409, 'PROPOSAL_ALREADY_ACCEPTED', 'Đề xuất đã được khách hàng chấp nhận');
  }
  return { yeuCau, deXuat };
}

// US22: chỉ sửa khi đề xuất còn chờ xem xét và tin vẫn đang nhận đề xuất.
function suaDeXuat(nguoiDung, id, duLieu) {
  return chayTrongGiaoDich(async (client) => {
    const { yeuCau, deXuat } = await khoaDeXuatCuaKyThuatVien(client, nguoiDung, id);
    if (deXuat.status !== TRANG_THAI_DE_XUAT.CHO_XU_LY) {
      throw new LoiUngDung(409, 'PROPOSAL_NOT_EDITABLE', `Không thể chỉnh sửa vì đề xuất ${NHAN_TRANG_THAI_DE_XUAT[deXuat.status]}`);
    }
    if (yeuCau.status === TRANG_THAI_YEU_CAU.DA_CHON_KY_THUAT_VIEN || yeuCau.status === TRANG_THAI_YEU_CAU.HOAN_THANH) {
      throw new LoiUngDung(400, 'REQUEST_ALREADY_SELECTED', 'Tin đã chọn kỹ thuật viên, không thể chỉnh sửa đề xuất');
    }
    if (yeuCau.status !== TRANG_THAI_YEU_CAU.CHO_DE_XUAT) {
      throw new LoiUngDung(400, 'REQUEST_NOT_WAITING', 'Tin không còn nhận đề xuất');
    }

    const duLieuMoi = {};
    if (duLieu.price !== undefined) duLieuMoi.price = duLieu.price;
    if (duLieu.description !== undefined) duLieuMoi.description = duLieu.description.trim();
    if (duLieu.estimatedDuration !== undefined) duLieuMoi.estimatedDuration = duLieu.estimatedDuration?.trim() || null;
    return khoDeXuat.capNhatThongTin(deXuat.id, duLieuMoi, { client });
  });
}

// US23: rút đề xuất chưa được chấp nhận; dữ liệu vẫn giữ lại với trạng thái WITHDRAWN.
function rutDeXuat(nguoiDung, id) {
  return chayTrongGiaoDich(async (client) => {
    const { deXuat } = await khoaDeXuatCuaKyThuatVien(client, nguoiDung, id);
    if (deXuat.status !== TRANG_THAI_DE_XUAT.CHO_XU_LY) {
      throw new LoiUngDung(400, 'INVALID_STATUS_TRANSITION', `Không thể rút vì đề xuất ${NHAN_TRANG_THAI_DE_XUAT[deXuat.status]}`);
    }
    return khoDeXuat.capNhatTrangThai(deXuat.id, TRANG_THAI_DE_XUAT.DA_RUT, { client });
  });
}

module.exports = {
  guiDeXuat,
  layDanhSachDeXuatCuaYeuCau,
  chapNhanDeXuat,
  layChiTietDeXuat,
  layDanhSachDeXuatCuaToi,
  suaDeXuat,
  rutDeXuat,
};
