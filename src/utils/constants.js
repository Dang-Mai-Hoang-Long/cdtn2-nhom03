const VAI_TRO = Object.freeze({
  KHACH_HANG: 'CUSTOMER',
  KY_THUAT_VIEN: 'TECHNICIAN',
  QUAN_TRI_VIEN: 'ADMIN',
});

const TRANG_THAI_YEU_CAU = Object.freeze({
  CHO_DE_XUAT: 'WAITING_PROPOSAL',
  DA_CHON_KY_THUAT_VIEN: 'SELECTED',
  HOAN_THANH: 'COMPLETED',
  DA_DONG: 'CLOSED',
});

const TRANG_THAI_DE_XUAT = Object.freeze({
  CHO_XU_LY: 'PENDING',
  DA_CHAP_NHAN: 'ACCEPTED',
  BI_TU_CHOI: 'REJECTED',
  DA_RUT: 'WITHDRAWN',
});

// Mỗi loại nói rõ ai nhận và relatedId là mã gì:
//   NEW_PROPOSAL (khách hàng chủ tin, mã đề xuất), PROPOSAL_ACCEPTED (kỹ thuật viên được chọn, mã đề xuất),
//   PROPOSAL_REJECTED (kỹ thuật viên có đề xuất bị từ chối, mã đề xuất),
//   REQUEST_COMPLETED (kỹ thuật viên được chọn, mã tin), REVIEW_RECEIVED (người được đánh giá, mã tin).
const LOAI_THONG_BAO = Object.freeze({
  DE_XUAT_MOI: 'NEW_PROPOSAL',
  DE_XUAT_DUOC_CHAP_NHAN: 'PROPOSAL_ACCEPTED',
  DE_XUAT_BI_TU_CHOI: 'PROPOSAL_REJECTED',
  DA_HOAN_THANH: 'REQUEST_COMPLETED',
  CO_DANH_GIA_MOI: 'REVIEW_RECEIVED',
});

// Mã lớn nhất của cột id kiểu INT (SERIAL) trong PostgreSQL.
const ID_TOI_DA = 2147483647;

const PHAN_TRANG_MAC_DINH = Object.freeze({ trang: 1, trangToiDa: 1000000, kichThuoc: 10, kichThuocToiDa: 100 });

module.exports = { VAI_TRO, TRANG_THAI_YEU_CAU, TRANG_THAI_DE_XUAT, LOAI_THONG_BAO, ID_TOI_DA, PHAN_TRANG_MAC_DINH };
