const khoThongBao = require('../repositories/notification.repository');
const { LoiUngDung } = require('../utils/error-handler');
const { docMaSo } = require('../utils/ma-so');
const { LOAI_THONG_BAO } = require('../utils/constants');

// US20 / BR16: thông báo trong ứng dụng. Mọi hàm tạo thông báo chạy trong transaction của sự kiện gây ra nó (truyền client),
// nên sự kiện thất bại thì không có thông báo. title là chuỗi cố định ngắn; tên tin (tối đa 200 ký tự) chỉ nằm ở content.
function taoThongBao({ userId, type, title, content, relatedId }, { client } = {}) {
  return khoThongBao.tao({ userId, type, title, content, relatedId }, { client });
}

const dinhDangGia = (gia) => `${Number(gia).toLocaleString('vi-VN')} đồng`;

// Khách hàng chủ tin: có kỹ thuật viên gửi đề xuất mới cho tin. relatedId là mã đề xuất.
function thongBaoCoDeXuatMoi(deXuat, yeuCau, kyThuatVien, { client } = {}) {
  return taoThongBao(
    {
      userId: yeuCau.customerId,
      type: LOAI_THONG_BAO.DE_XUAT_MOI,
      title: 'Có đề xuất mới cho tin của bạn',
      content: `${kyThuatVien.fullName} đã gửi đề xuất ${dinhDangGia(deXuat.price)} cho tin "${yeuCau.title}"`,
      relatedId: deXuat.id,
    },
    { client },
  );
}

// BR16: kỹ thuật viên được chọn. relatedId là mã đề xuất, theo ví dụ trong API contract.
function thongBaoDeXuatDuocChapNhan(deXuat, yeuCau, { client } = {}) {
  return taoThongBao(
    {
      userId: deXuat.technicianId,
      type: LOAI_THONG_BAO.DE_XUAT_DUOC_CHAP_NHAN,
      title: 'Đề xuất của bạn đã được chấp nhận',
      content: `Đề xuất của bạn cho tin "${yeuCau.title}" đã được chấp nhận`,
      relatedId: deXuat.id,
    },
    { client },
  );
}

// Kỹ thuật viên có đề xuất còn chờ bị từ chối khi khách hàng chọn đề xuất khác (BR10). relatedId là mã đề xuất bị từ chối.
async function thongBaoDeXuatBiTuChoi(cacDeXuatBiTuChoi, yeuCau, { client } = {}) {
  for (const deXuat of cacDeXuatBiTuChoi) {
    await taoThongBao(
      {
        userId: deXuat.technicianId,
        type: LOAI_THONG_BAO.DE_XUAT_BI_TU_CHOI,
        title: 'Đề xuất của bạn không được chọn',
        content: `Khách hàng đã chọn kỹ thuật viên khác cho tin "${yeuCau.title}"`,
        relatedId: deXuat.id,
      },
      { client },
    );
  }
}

// Kỹ thuật viên được chọn: khách hàng đã xác nhận hoàn thành công việc. relatedId là mã tin.
function thongBaoDaHoanThanh(yeuCau, kyThuatVienId, { client } = {}) {
  return taoThongBao(
    {
      userId: kyThuatVienId,
      type: LOAI_THONG_BAO.DA_HOAN_THANH,
      title: 'Khách hàng đã xác nhận hoàn thành công việc',
      content: `Công việc "${yeuCau.title}" đã được khách hàng xác nhận hoàn thành`,
      relatedId: yeuCau.id,
    },
    { client },
  );
}

// Người được đánh giá (khách hàng hoặc kỹ thuật viên). relatedId là mã tin để mở đúng công việc.
function thongBaoCoDanhGiaMoi(danhGia, yeuCau, nguoiDanhGia, { client } = {}) {
  return taoThongBao(
    {
      userId: danhGia.toUserId,
      type: LOAI_THONG_BAO.CO_DANH_GIA_MOI,
      title: 'Bạn nhận được một đánh giá mới',
      content: `${nguoiDanhGia.fullName} đã đánh giá ${danhGia.rating} sao cho công việc "${yeuCau.title}"`,
      relatedId: yeuCau.id,
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
  const ma = docMaSo(id, 'NOTIFICATION_NOT_FOUND', 'Không tìm thấy thông báo');
  const thongBao = await khoThongBao.timTheoId(ma);
  if (!thongBao) throw new LoiUngDung(404, 'NOTIFICATION_NOT_FOUND', 'Không tìm thấy thông báo');
  if (thongBao.userId !== nguoiDung.id) throw new LoiUngDung(403, 'NOT_OWNER', 'Bạn không có quyền với thông báo này');
  return thongBao.isRead ? thongBao : khoThongBao.danhDauDaDoc(thongBao.id);
}

module.exports = {
  thongBaoCoDeXuatMoi,
  thongBaoDeXuatDuocChapNhan,
  thongBaoDeXuatBiTuChoi,
  thongBaoDaHoanThanh,
  thongBaoCoDanhGiaMoi,
  layDanhSachThongBao,
  demThongBaoChuaDoc,
  danhDauDaDoc,
};
