// Lưu token và thông tin người dùng sau khi đăng nhập. localStorage có thể bị chặn nên luôn bọc try/catch.
const KHOA_LUU_TRU = 'phienDangNhap';
const nguoiNghe = new Set();

export function layPhienDangNhap() {
  try {
    const giaTri = JSON.parse(localStorage.getItem(KHOA_LUU_TRU));
    return giaTri?.token && giaTri?.user ? giaTri : null;
  } catch {
    return null;
  }
}

function thongBaoThayDoi() {
  nguoiNghe.forEach((hamXuLy) => hamXuLy(layPhienDangNhap()));
}

export function luuPhienDangNhap(token, user) {
  try {
    localStorage.setItem(KHOA_LUU_TRU, JSON.stringify({ token, user }));
  } catch {
    // Bỏ qua: trình duyệt chặn lưu trữ, người dùng sẽ phải đăng nhập lại khi tải lại trang.
  }
  thongBaoThayDoi();
}

export function xoaPhienDangNhap() {
  try {
    localStorage.removeItem(KHOA_LUU_TRU);
  } catch {
    // Bỏ qua.
  }
  thongBaoThayDoi();
}

export function theoDoiPhienDangNhap(hamXuLy) {
  nguoiNghe.add(hamXuLy);
  return () => nguoiNghe.delete(hamXuLy);
}
