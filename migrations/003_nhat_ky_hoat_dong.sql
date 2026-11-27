-- Trang Thống kê của quản trị viên: nhật ký hoạt động và trạng thái xử lý cảnh báo. Chỉ thêm mới, không sửa bảng cũ.
-- Nhật ký ghi từ lúc triển khai; không lưu địa chỉ IP, chuỗi User-Agent gốc hay email đã nhập khi đăng nhập sai.
-- user_id không đặt khóa ngoại: nhật ký chỉ dùng để thống kê, không được cản thao tác trên bảng users.
CREATE TABLE activity_log (
  id          BIGSERIAL PRIMARY KEY,
  user_id     INT          NULL,
  user_role   VARCHAR(20)  NULL,
  action      VARCHAR(40)  NOT NULL,
  target_type VARCHAR(20)  NULL,
  target_id   INT          NULL,
  status      VARCHAR(10)  NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE')),
  http_status INT          NULL,
  route       VARCHAR(120) NULL,
  device      VARCHAR(20)  NULL,
  os          VARCHAR(20)  NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_created ON activity_log (created_at);
CREATE INDEX idx_activity_log_action ON activity_log (action, created_at);
CREATE INDEX idx_activity_log_target ON activity_log (action, target_id);

-- Trạng thái xử lý của cảnh báo (cảnh báo được tính lại mỗi lần xem, khóa gồm ngày phát sinh).
CREATE TABLE alert_state (
  alert_key  VARCHAR(100) PRIMARY KEY,
  status     VARCHAR(20)  NOT NULL CHECK (status IN ('NEW', 'ACKNOWLEDGED', 'RESOLVED')),
  updated_by INT          NOT NULL,
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Thời điểm chấp nhận đề xuất và hoàn thành công việc được đọc từ thông báo tương ứng.
CREATE INDEX idx_notification_type_related ON notification (type, related_id);
