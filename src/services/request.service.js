const { chayTrongGiaoDich, truyVan } = require('../db');
const khoYeuCau = require('../repositories/request.repository');
const khoNguoiDung = require('../repositories/user.repository');
const { LoiUngDung } = require('../utils/error-handler');
const { VAI_TRO, TRANG_THAI_YEU_CAU } = require('../utils/constants');

function docMaSo(giaTri, maLoi, thongDiep) {
  const so = Number(giaTri);
  if (!Number.isInteger(so) || so <= 0) throw new LoiUngDung(404, maLoi, thongDiep);
  return so;
}

function docMaYeuCau(giaTri) {
  return docMaSo(giaTri, 'REQUEST_NOT_FOUND', 'Không tìm thấy tin sửa chữa');
}

async function layYeuCauHoacBaoLoi(id, tuyChon) {
  const yeuCau = await khoYeuCau.timTheoId(docMaYeuCau(id), tuyChon);
  if (!yeuCau) throw new LoiUngDung(404, 'REQUEST_NOT_FOUND', 'Không tìm thấy tin sửa chữa');
  return yeuCau;
}

// BR03/BR09/BR11: chỉ chủ tin mới được thao tác trên tin của mình.
function kiemTraChuTin(yeuCau, nguoiDung) {
  if (yeuCau.customerId !== nguoiDung.id) {
    throw new LoiUngDung(403, 'NOT_OWNER', 'Bạn không có quyền truy cập tin sửa chữa này');
  }
}

// US06: tin mới luôn ở trạng thái Chờ đề xuất (BR12).
function taoYeuCau(nguoiDung, duLieu) {
  return khoYeuCau.tao({
    customerId: nguoiDung.id,
    title: duLieu.title.trim(),
    description: duLieu.description.trim(),
    category: duLieu.category.trim(),
    location: duLieu.location.trim(),
    preferredTime: new Date(duLieu.preferredTime),
  });
}

// US07 (BR03): chỉ trả về tin do chính khách hàng tạo.
function layDanhSachYeuCauCuaToi(nguoiDung, { status, thuTu, phanTrang }) {
  return khoYeuCau.timDanhSach({ customerId: nguoiDung.id, status, thuTu, ...phanTrang });
}

// US10 (BR04): kỹ thuật viên chỉ thấy tin đang Chờ đề xuất, không kèm liên hệ khách hàng (BR15).
function layDanhSachYeuCauDangCho({ category, location, thuTu, phanTrang }) {
  return khoYeuCau.timDanhSach({ status: TRANG_THAI_YEU_CAU.CHO_DE_XUAT, category, location, thuTu, ...phanTrang });
}

async function laKyThuatVienDuocChon(yeuCau, kyThuatVienId) {
  if (!yeuCau.selectedProposalId) return false;
  const { rows } = await truyVan('SELECT technician_id FROM proposal WHERE id = $1', [yeuCau.selectedProposalId]);
  return rows[0]?.technician_id === kyThuatVienId;
}

// US08 (khách hàng, BR03) và US12 (kỹ thuật viên, BR04 + BR15).
async function layChiTietYeuCau(nguoiDung, id) {
  const yeuCau = await layYeuCauHoacBaoLoi(id);
  const khachHang = await khoNguoiDung.timTheoId(yeuCau.customerId);
  // hasReviewed: người đang xem đã gửi đánh giá cho công việc này chưa (US18, US19 - BR14).
  const { rows: dongDanhGia } = await truyVan('SELECT 1 FROM review WHERE request_id = $1 AND from_user_id = $2', [yeuCau.id, nguoiDung.id]);
  const hasReviewed = dongDanhGia.length > 0;

  if (nguoiDung.role === VAI_TRO.KHACH_HANG) {
    kiemTraChuTin(yeuCau, nguoiDung);
    return { ...yeuCau, customer: { id: khachHang.id, fullName: khachHang.fullName, phone: khachHang.phone }, hasReviewed };
  }

  // Kỹ thuật viên xem được tin ở mọi trạng thái (theo tiêu chí chấp nhận US12),
  // nhưng chỉ gửi đề xuất được khi tin đang Chờ đề xuất.
  const { rows } = await truyVan(
    `SELECT id, status FROM proposal WHERE request_id = $1 AND technician_id = $2 ORDER BY created_at DESC, id DESC LIMIT 1`,
    [yeuCau.id, nguoiDung.id],
  );
  const deXuatCuaToi = rows[0] ?? null;
  const hasProposed = ['PENDING', 'ACCEPTED'].includes(deXuatCuaToi?.status);
  const duocXemLienHe = await laKyThuatVienDuocChon(yeuCau, nguoiDung.id);
  const customer = { id: khachHang.id, fullName: khachHang.fullName };
  if (duocXemLienHe) customer.phone = khachHang.phone;

  return {
    ...yeuCau,
    customer,
    hasProposed,
    myProposalId: deXuatCuaToi?.id ?? null,
    myProposalStatus: deXuatCuaToi?.status ?? null,
    canPropose: yeuCau.status === TRANG_THAI_YEU_CAU.CHO_DE_XUAT && !hasProposed,
    hasReviewed,
  };
}

// US17 (BR11 + BR12): chỉ chủ tin, chỉ từ Đã chọn kỹ thuật viên sang Hoàn thành.
function xacNhanHoanThanh(nguoiDung, id) {
  return chayTrongGiaoDich(async (client) => {
    const yeuCau = await layYeuCauHoacBaoLoi(id, { client, khoaDong: true });
    kiemTraChuTin(yeuCau, nguoiDung);
    if (yeuCau.status !== TRANG_THAI_YEU_CAU.DA_CHON_KY_THUAT_VIEN) {
      throw new LoiUngDung(400, 'INVALID_STATUS_TRANSITION', 'Chỉ xác nhận hoàn thành được khi tin đã chọn kỹ thuật viên');
    }
    return khoYeuCau.capNhatTrangThai(yeuCau.id, TRANG_THAI_YEU_CAU.HOAN_THANH, { client });
  });
}

// US21: chỉ sửa được khi tin còn Chờ đề xuất (chưa chọn kỹ thuật viên).
function suaYeuCau(nguoiDung, id, duLieu) {
  return chayTrongGiaoDich(async (client) => {
    const yeuCau = await layYeuCauHoacBaoLoi(id, { client, khoaDong: true });
    kiemTraChuTin(yeuCau, nguoiDung);
    if (yeuCau.status === TRANG_THAI_YEU_CAU.DA_CHON_KY_THUAT_VIEN || yeuCau.status === TRANG_THAI_YEU_CAU.HOAN_THANH) {
      throw new LoiUngDung(409, 'REQUEST_NOT_EDITABLE', 'Tin đã chọn kỹ thuật viên, không thể chỉnh sửa');
    }
    if (yeuCau.status !== TRANG_THAI_YEU_CAU.CHO_DE_XUAT) {
      throw new LoiUngDung(409, 'REQUEST_NOT_EDITABLE', 'Tin đã đóng, không thể chỉnh sửa');
    }

    const duLieuMoi = {};
    for (const truong of ['title', 'description', 'category', 'location']) {
      if (duLieu[truong] !== undefined) duLieuMoi[truong] = duLieu[truong].trim();
    }
    if (duLieu.preferredTime !== undefined) duLieuMoi.preferredTime = new Date(duLieu.preferredTime);
    return khoYeuCau.capNhatThongTin(yeuCau.id, duLieuMoi, { client });
  });
}

// US09 (BR03 + BR06): chủ tin chỉ đóng được tin chưa chọn kỹ thuật viên.
function dongYeuCau(nguoiDung, id) {
  return chayTrongGiaoDich(async (client) => {
    const yeuCau = await layYeuCauHoacBaoLoi(id, { client, khoaDong: true });
    kiemTraChuTin(yeuCau, nguoiDung);
    if (yeuCau.status === TRANG_THAI_YEU_CAU.DA_CHON_KY_THUAT_VIEN || yeuCau.status === TRANG_THAI_YEU_CAU.HOAN_THANH) {
      throw new LoiUngDung(400, 'REQUEST_ALREADY_SELECTED', 'Không thể đóng tin đã chọn kỹ thuật viên');
    }
    if (yeuCau.status !== TRANG_THAI_YEU_CAU.CHO_DE_XUAT) {
      throw new LoiUngDung(400, 'INVALID_STATUS_TRANSITION', 'Tin đã được đóng trước đó');
    }
    return khoYeuCau.capNhatTrangThai(yeuCau.id, TRANG_THAI_YEU_CAU.DA_DONG, { client });
  });
}

module.exports = {
  suaYeuCau,
  dongYeuCau,
  docMaSo,
  docMaYeuCau,
  layYeuCauHoacBaoLoi,
  kiemTraChuTin,
  taoYeuCau,
  layDanhSachYeuCauCuaToi,
  layDanhSachYeuCauDangCho,
  layChiTietYeuCau,
  xacNhanHoanThanh,
};
