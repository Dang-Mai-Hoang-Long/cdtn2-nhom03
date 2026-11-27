const express = require("express");
const cors = require("cors");
const cauHinh = require("./config/env");
const dinhTuyenApi = require("./routes");
const { xuLyKhongTimThayDuongDan, xuLyLoi } = require("./utils/error-handler");
const { theoDoiYeuCau } = require("./middlewares/theo-doi.middleware");

const app = express();

// Không báo cho bên ngoài biết backend dùng Express (bớt thông tin cho kẻ dò lỗ hổng theo phiên bản).
app.disable("x-powered-by");

app.use(cors({ origin: cauHinh.clientUrl }));
// Đo thời gian phản hồi và ghi nhật ký hoạt động cho trang thống kê; đặt trước express.json để tính cả thân lỗi.
app.use(theoDoiYeuCau);
app.use(express.json());

// Route kiểm tra trạng thái backend
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend đang hoạt động",
  });
});

app.use("/api", dinhTuyenApi);
app.use(xuLyKhongTimThayDuongDan);
app.use(xuLyLoi);

module.exports = app;
