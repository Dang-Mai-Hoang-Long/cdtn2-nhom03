const { chayTrongGiaoDich, truyVan } = require('../db');
const khoDanhGia = require('../repositories/review.repository');
const khoNguoiDung = require('../repositories/user.repository');
const dichVuYeuCau = require('./request.service');
const { LoiUngDung } = require('../utils/error-handler');
const { TRANG_THAI_YEU_CAU } = require('../utils/constants');

async function layKyThuatVienDuocChon(yeuCau, { client } = {}) {
  if (!yeuCau.selectedProposalId) return null;
  const thucThi = client ?? { query: truyVan };
  const { rows } = await thucThi.query('SELECT technician_id FROM proposal WHERE id = $1', [yeuCau.selectedProposalId]);
  return rows[0]?.technician_id ?? null;
}

// Xác định người được đánh giá: khách hàng đánh giá kỹ thuật viên được chọn (US18) và ngược lại (US19).
async function xacDinhNguoiDuocDanhGia(yeuCau, nguoiDung, { client } = {}) {
  const kyThuatVienId = await layKyThuatVienDuocChon(yeuCau, { client });
  if (nguoiDung.id === yeuCau.customerId) return kyThuatVienId;
  if (kyThuatVienId && nguoiDung.id === kyThuatVienId) return yeuCau.customerId;
  return null;
}

// US18, US19 (BR13, BR14). Cập nhật điểm trung bình của người được đánh giá trong cùng transaction.
function taoDanhGia(nguoiDung, { requestId, rating, comment }) {
  return chayTrongGiaoDich(async (client) => {
    const yeuCau = await dichVuYeuCau.layYeuCauHoacBaoLoi(requestId, { client, khoaDong: true });
    const nguoiDuocDanhGiaId = await xacDinhNguoiDuocDanhGia(yeuCau, nguoiDung, { client });
    if (!nguoiDuocDanhGiaId) throw new LoiUngDung(403, 'NOT_OWNER', 'Bạn không tham gia công việc này');
    if (nguoiDuocDanhGiaId === nguoiDung.id) throw new LoiUngDung(400, 'SELF_REVIEW_NOT_ALLOWED', 'Không được tự đánh giá chính mình');
    if (yeuCau.status !== TRANG_THAI_YEU_CAU.HOAN_THANH) {
      throw new LoiUngDung(400, 'CANNOT_REVIEW_YET', 'Chỉ được đánh giá sau khi công việc hoàn thành');
    }
    if (await khoDanhGia.daDanhGia(yeuCau.id, nguoiDung.id, { client })) {
      throw new LoiUngDung(409, 'ALREADY_REVIEWED', 'Bạn đã đánh giá rồi');
    }

    const danhGia = await khoDanhGia.tao(
      { requestId: yeuCau.id, fromUserId: nguoiDung.id, toUserId: nguoiDuocDanhGiaId, rating, comment: comment?.trim() || null },
      { client },
    );
    await khoDanhGia.capNhatDiemTrungBinh(nguoiDuocDanhGiaId, { client });
    return danhGia;
  });
}

async function layDanhGiaCuaNguoiDung(userId, phanTrang) {
  const ma = dichVuYeuCau.docMaSo(userId, 'USER_NOT_FOUND', 'Không tìm thấy người dùng');
  const nguoiDung = await khoNguoiDung.timTheoId(ma);
  if (!nguoiDung) throw new LoiUngDung(404, 'USER_NOT_FOUND', 'Không tìm thấy người dùng');
  const ketQua = await khoDanhGia.timTheoNguoiDuocDanhGia(ma, phanTrang);
  return { ...ketQua, nguoiDung: { id: nguoiDung.id, fullName: nguoiDung.fullName, role: nguoiDung.role, ratingAvg: nguoiDung.ratingAvg } };
}

module.exports = { taoDanhGia, layDanhGiaCuaNguoiDung, xacDinhNguoiDuocDanhGia };
