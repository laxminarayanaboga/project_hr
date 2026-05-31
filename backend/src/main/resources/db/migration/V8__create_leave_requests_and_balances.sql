CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

CREATE TABLE leave_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    employee_id     UUID NOT NULL REFERENCES employees(id),
    leave_type_id   UUID NOT NULL REFERENCES leave_types(id),
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    working_days    NUMERIC(5,2) NOT NULL,
    reason          TEXT,
    status          leave_status NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leave_requests_company_id  ON leave_requests(company_id);
CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status      ON leave_requests(company_id, status);

CREATE TABLE leave_balances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    employee_id     UUID NOT NULL REFERENCES employees(id),
    leave_type_id   UUID NOT NULL REFERENCES leave_types(id),
    year            INT NOT NULL,
    entitled_days   NUMERIC(5,2) NOT NULL DEFAULT 0,
    used_days       NUMERIC(5,2) NOT NULL DEFAULT 0,
    adjusted_days   NUMERIC(5,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (employee_id, leave_type_id, year)
);

CREATE INDEX idx_leave_balances_company_id  ON leave_balances(company_id);
CREATE INDEX idx_leave_balances_employee_id ON leave_balances(employee_id);

CREATE TABLE leave_balance_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    balance_id      UUID NOT NULL REFERENCES leave_balances(id),
    change_type     VARCHAR(50) NOT NULL,  -- ACCRUAL, DEDUCTION, ADJUSTMENT, REFUND
    days_delta      NUMERIC(5,2) NOT NULL,
    reason          TEXT,
    performed_by    UUID REFERENCES users(id),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_leave_balance_history_balance_id ON leave_balance_history(balance_id);
