CREATE TYPE approver_type AS ENUM ('DIRECT_MANAGER', 'HR_ADMIN');

CREATE TABLE leave_approval_steps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    leave_type_id   UUID NOT NULL REFERENCES leave_types(id),
    step_order      INT NOT NULL CHECK (step_order BETWEEN 1 AND 3),
    approver_type   approver_type NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (leave_type_id, step_order)
);

CREATE INDEX idx_leave_approval_steps_company_id    ON leave_approval_steps(company_id);
CREATE INDEX idx_leave_approval_steps_leave_type_id ON leave_approval_steps(leave_type_id);

-- Tracks per-request approval state for multi-level chains
CREATE TABLE leave_request_approvals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leave_request_id    UUID NOT NULL REFERENCES leave_requests(id),
    step_order          INT NOT NULL,
    approver_type       approver_type NOT NULL,
    approver_id         UUID REFERENCES users(id),
    status              leave_status NOT NULL DEFAULT 'PENDING',
    comment             TEXT,
    decided_at          TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leave_request_approvals_request_id ON leave_request_approvals(leave_request_id);
