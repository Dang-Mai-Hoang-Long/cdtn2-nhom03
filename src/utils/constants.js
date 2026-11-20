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

const LOAI_THONG_BAO = Object.freeze({
  DE_XUAT_DUOC_CHAP_NHAN: 'PROPOSAL_ACCEPTED',
});

// Mã lớn nhất của cột id kiểu INT (SERIAL) trong PostgreSQL.
const ID_TOI_DA = 2147483647;

const PHAN_TRANG_MAC_DINH = Object.freeze({ trang: 1, trangToiDa: 1000000, kichThuoc: 10, kichThuocToiDa: 100 });

module.exports = { VAI_TRO, TRANG_THAI_YEU_CAU, TRANG_THAI_DE_XUAT, LOAI_THONG_BAO, ID_TOI_DA, PHAN_TRANG_MAC_DINH };
