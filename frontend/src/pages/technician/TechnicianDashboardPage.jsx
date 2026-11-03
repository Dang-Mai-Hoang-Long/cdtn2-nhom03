import React from "react";
import {
  Title,
  Panel,
  Button,
  Badge,
  Note,
  FooterNote,
  RequestSummary,
  Progress,
} from "../../components/Ui.jsx";
import { requests, proposals } from "../../data/demoData.js";
const request = requests[0];
export default function TechnicianDashboardPage() {
  return (
    <>
      <div className="content-wrap">
        <Title
          title="Công việc được chọn"
          subtitle={`${request.id} — ${request.title} · Đề xuất DX-018 đã được chấp nhận.`}
          action={<Badge>Đã chọn kỹ thuật viên</Badge>}
        />
        <Note>Chờ khách hàng xác nhận hoàn thành công việc.</Note>
        <div className="two-column">
          <div className="stack">
            <Panel title="Yêu cầu sửa chữa">
              <RequestSummary />
            </Panel>
            <Panel title="Đề xuất DX-018">
              <div className="field-grid">
                <div>
                  <span className="muted-label">Kỹ thuật viên</span>
                  <strong>Trần Quốc Huy</strong>
                </div>
                <div>
                  <span className="muted-label">Chi phí đề xuất</span>
                  <strong>450.000 đ</strong>
                </div>
                <div className="field-wide">
                  <span className="muted-label">Nội dung thực hiện</span>
                  <p>{proposals[0].summary}</p>
                </div>
                <div>
                  <span className="muted-label">Ngày dự kiến</span>
                  <strong>22/10/2026 · 09:00</strong>
                </div>
                <div>
                  <span className="muted-label">Thời lượng</span>
                  <strong>90 phút</strong>
                </div>
              </div>
            </Panel>
          </div>
          <div className="stack">
            <Panel title="Liên hệ khách hàng">
              <Badge tone="badge-light">Chỉ hiển thị sau khi được chọn</Badge>
              <dl className="role-list">
                <dt>Khách hàng</dt>
                <dd>Nguyễn Minh Anh</dd>
                <dt>Số điện thoại</dt>
                <dd>090 123 4567</dd>
                <dt>Địa chỉ</dt>
                <dd>24/8 đường D5, Phường 25, Bình Thạnh</dd>
              </dl>
              <Note>
                Thông tin này chỉ hiển thị cho kỹ thuật viên đã được chọn.
              </Note>
            </Panel>
            <Panel title="Trạng thái công việc">
              <Progress active={1} />
              <Button to="14">Xem đánh giá khách hàng</Button>
            </Panel>
          </div>
        </div>
      </div>
      <FooterNote>
        13 là trang công việc được chọn. Khi khách xác nhận hoàn thành, trạng
        thái sẽ đổi và hai bên có thể đánh giá.
      </FooterNote>
    </>
  );
}
