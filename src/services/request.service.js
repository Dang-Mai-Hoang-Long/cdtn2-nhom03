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

  if (nguoiDung.role === VAI_TRO.KHACH_HANG) {
    kiemTraChuTin(yeuCau, nguoiDung);
    return { ...yeuCau, customer: { id: khachHang.id, fullName: khachHang.fullName, phone: khachHang.phone } };
  }

  // Kỹ thuật viên xem được tin ở mọi trạng thái (theo tiêu chí chấp nhận US12),
  // nhưng chỉ gửi đề xuất được khi tin đang Chờ đề xuất.
  const { rows } = await truyVan(
    `SELECT EXISTS (SELECT 1 FROM proposal WHERE request_id = $1 AND technician_id = $2 AND status IN ('PENDING', 'ACCEPTED')) AS da_gui`,
    [yeuCau.id, nguoiDung.id],
  );
  const hasProposed = rows[0].da_gui;
  const duocXemLienHe = await laKyThuatVienDuocChon(yeuCau, nguoiDung.id);
  const customer = { id: khachHang.id, fullName: khachHang.fullName };
  if (duocXemLienHe) customer.phone = khachHang.phone;

  return {
    ...yeuCau,
    customer,
    hasProposed,
    canPropose: yeuCau.status === TRANG_THAI_YEU_CAU.CHO_DE_XUAT && !hasProposed,
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

module.exports = {
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
