CREATE TYPE accrual_method AS ENUM ('IMMEDIATE', 'MONTHLY', 'NONE');

CREATE TABLE leave_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    name            VARCHAR(100) NOT NULL,
    days_per_year   NUMERIC(5,2) NOT NULL DEFAULT 0,
    accrual_method  accrual_method NOT NULL DEFAULT 'IMMEDIATE',
    is_paid         BOOLEAN NOT NULL DEFAULT TRUE,
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (company_id, name)
);

CREATE INDEX idx_leave_types_company_id ON leave_types(company_id);
