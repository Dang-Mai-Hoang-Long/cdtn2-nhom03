-- Lược đồ khởi đầu theo docs/erd-nhom03.drawio.
-- Bảng "user" của ERD đặt tên users vì user là từ khóa dành riêng của PostgreSQL.

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('CUSTOMER', 'TECHNICIAN', 'ADMIN')),
  is_locked     BOOLEAN      NOT NULL DEFAULT false,
  rating_avg    DECIMAL(3,1) NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE repair_request (
  id                   SERIAL PRIMARY KEY,
  customer_id          INT          NOT NULL REFERENCES users(id),
  title                VARCHAR(200) NOT NULL,
  description          TEXT         NOT NULL,
  category             VARCHAR(50)  NOT NULL,
  location             VARCHAR(255) NOT NULL,
  preferred_time       TIMESTAMPTZ  NULL,
  status               VARCHAR(20)  NOT NULL DEFAULT 'WAITING_PROPOSAL'
                       CHECK (status IN ('WAITING_PROPOSAL', 'SELECTED', 'COMPLETED', 'CLOSED')),
  selected_proposal_id INT          NULL,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE proposal (
  id                 SERIAL PRIMARY KEY,
  request_id         INT           NOT NULL REFERENCES repair_request(id),
  technician_id      INT           NOT NULL REFERENCES users(id),
  price              DECIMAL(15,1) NOT NULL CHECK (price > 0),
  description        TEXT          NOT NULL,
  estimated_duration VARCHAR(50)   NULL,
  status             VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                     CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT now()
);

ALTER TABLE repair_request
  ADD CONSTRAINT fk_repair_request_selected_proposal
  FOREIGN KEY (selected_proposal_id) REFERENCES proposal(id);

-- BR08: mỗi kỹ thuật viên chỉ có một đề xuất còn hiệu lực cho cùng một tin.
CREATE UNIQUE INDEX uq_proposal_dang_hieu_luc
  ON proposal (request_id, technician_id)
  WHERE status IN ('PENDING', 'ACCEPTED');

-- BR10: mỗi tin chỉ có một đề xuất được chấp nhận.
CREATE UNIQUE INDEX uq_proposal_duoc_chap_nhan
  ON proposal (request_id)
  WHERE status = 'ACCEPTED';

CREATE TABLE review (
  id           SERIAL PRIMARY KEY,
  request_id   INT         NOT NULL REFERENCES repair_request(id),
  from_user_id INT         NOT NULL REFERENCES users(id),
  to_user_id   INT         NOT NULL REFERENCES users(id),
  rating       INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT        NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, from_user_id)
);

CREATE TABLE notification (
  id         SERIAL PRIMARY KEY,
  user_id    INT          NOT NULL REFERENCES users(id),
  type       VARCHAR(50)  NOT NULL,
  title      VARCHAR(200) NOT NULL,
  content    TEXT         NOT NULL,
  is_read    BOOLEAN      NOT NULL DEFAULT false,
  related_id INT          NULL,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_repair_request_customer ON repair_request (customer_id);
CREATE INDEX idx_repair_request_status ON repair_request (status);
CREATE INDEX idx_proposal_request ON proposal (request_id);
CREATE INDEX idx_notification_user ON notification (user_id);
