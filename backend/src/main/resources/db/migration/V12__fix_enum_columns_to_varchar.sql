-- Hibernate's @Enumerated(EnumType.STRING) sends VARCHAR, but V6/V8/V9 created
-- native PostgreSQL ENUM types. This migration converts all affected columns to
-- VARCHAR so Hibernate can insert without a type cast error.

ALTER TABLE leave_types
    ALTER COLUMN accrual_method TYPE VARCHAR(50) USING accrual_method::text;
ALTER TABLE leave_types
    ALTER COLUMN accrual_method SET DEFAULT 'IMMEDIATE';

ALTER TABLE leave_requests
    ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
ALTER TABLE leave_requests
    ALTER COLUMN status SET DEFAULT 'PENDING';

ALTER TABLE leave_approval_steps
    ALTER COLUMN approver_type TYPE VARCHAR(50) USING approver_type::text;

ALTER TABLE leave_request_approvals
    ALTER COLUMN approver_type TYPE VARCHAR(50) USING approver_type::text;
ALTER TABLE leave_request_approvals
    ALTER COLUMN status TYPE VARCHAR(50) USING status::text;
ALTER TABLE leave_request_approvals
    ALTER COLUMN status SET DEFAULT 'PENDING';

DROP TYPE IF EXISTS accrual_method;
DROP TYPE IF EXISTS leave_status;
DROP TYPE IF EXISTS approver_type;
