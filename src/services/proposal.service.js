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

module.exports = { guiDeXuat, layDanhSachDeXuatCuaYeuCau, chapNhanDeXuat };
