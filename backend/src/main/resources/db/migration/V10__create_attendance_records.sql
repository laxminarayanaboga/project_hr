CREATE TABLE attendance_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id),
    employee_id     UUID NOT NULL REFERENCES employees(id),
    clock_in        TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out       TIMESTAMP WITH TIME ZONE,
    hours_worked    DECIMAL(5, 2),
    notes           TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attendance_company   ON attendance_records(company_id);
CREATE INDEX idx_attendance_employee  ON attendance_records(employee_id);
CREATE INDEX idx_attendance_clock_in  ON attendance_records(clock_in);
