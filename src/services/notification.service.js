const khoThongBao = require('../repositories/notification.repository');
const { LoiUngDung } = require('../utils/error-handler');
const { LOAI_THONG_BAO } = require('../utils/constants');

// BR16 / US20: báo cho kỹ thuật viên khi đề xuất được chấp nhận. Chạy trong transaction chấp nhận đề xuất.
function thongBaoDeXuatDuocChapNhan(deXuat, yeuCau, { client } = {}) {
  return khoThongBao.tao(
    {
      userId: deXuat.technicianId,
      type: LOAI_THONG_BAO.DE_XUAT_DUOC_CHAP_NHAN,
      title: 'Đề xuất của bạn đã được chấp nhận',
      content: `Đề xuất của bạn cho tin "${yeuCau.title}" đã được chấp nhận`,
      // relatedId là mã đề xuất, theo ví dụ trong API contract.
      relatedId: deXuat.id,
    },
    { client },
  );
}

function layDanhSachThongBao(nguoiDung, phanTrang) {
  return khoThongBao.timTheoNguoiDung(nguoiDung.id, phanTrang);
}

function demThongBaoChuaDoc(nguoiDung) {
  return khoThongBao.demChuaDoc(nguoiDung.id);
}

async function danhDauDaDoc(nguoiDung, id) {
  const ma = Number(id);
  const thongBao = Number.isInteger(ma) && ma > 0 ? await khoThongBao.timTheoId(ma) : null;
  if (!thongBao) throw new LoiUngDung(404, 'NOTIFICATION_NOT_FOUND', 'Không tìm thấy thông báo');
  if (thongBao.userId !== nguoiDung.id) throw new LoiUngDung(403, 'NOT_OWNER', 'Bạn không có quyền với thông báo này');
  return thongBao.isRead ? thongBao : khoThongBao.danhDauDaDoc(thongBao.id);
}

module.exports = { thongBaoDeXuatDuocChapNhan, layDanhSachThongBao, demThongBaoChuaDoc, danhDauDaDoc };
