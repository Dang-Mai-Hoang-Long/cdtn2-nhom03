-- US23: thêm trạng thái WITHDRAWN (đã rút) cho đề xuất. Đề xuất đã rút vẫn được lưu để tra cứu lịch sử
-- và không còn "đang hiệu lực" theo BR08, nên kỹ thuật viên có thể gửi đề xuất mới cho cùng tin.
ALTER TABLE proposal DROP CONSTRAINT proposal_status_check;
ALTER TABLE proposal ADD CONSTRAINT proposal_status_check
  CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'));
