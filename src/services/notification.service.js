const khoThongBao = require('../repositories/notification.repository');
const { LOAI_THONG_BAO } = require('../utils/constants');

// BR16: báo cho kỹ thuật viên khi đề xuất được chấp nhận. Chạy trong transaction chấp nhận đề xuất.
function thongBaoDeXuatDuocChapNhan(deXuat, { client } = {}) {
  return khoThongBao.tao(
    {
      userId: deXuat.technicianId,
      type: LOAI_THONG_BAO.DE_XUAT_DUOC_CHAP_NHAN,
      title: 'Đề xuất của bạn đã được chấp nhận',
      content: `Khách hàng đã chọn bạn cho tin #${deXuat.requestId}`,
      relatedId: deXuat.id,
    },
    { client },
  );
}

module.exports = { thongBaoDeXuatDuocChapNhan };
