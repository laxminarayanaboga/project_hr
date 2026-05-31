ALTER TABLE employees
    ADD COLUMN contracted_hours_per_week DECIMAL(5, 2) NOT NULL DEFAULT 40.0;

CREATE TABLE overtime_records (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id            UUID NOT NULL REFERENCES companies(id),
    employee_id           UUID NOT NULL REFERENCES employees(id),
    attendance_record_id  UUID NOT NULL REFERENCES attendance_records(id),
    work_date             DATE NOT NULL,
    hours_worked          DECIMAL(5, 2) NOT NULL,
    contracted_hours      DECIMAL(5, 2) NOT NULL,
    overtime_hours        DECIMAL(5, 2) NOT NULL,
    status                VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_by           UUID REFERENCES employees(id),
    approved_at           TIMESTAMP WITH TIME ZONE,
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_overtime_company   ON overtime_records(company_id);
CREATE INDEX idx_overtime_employee  ON overtime_records(employee_id);
CREATE INDEX idx_overtime_status    ON overtime_records(status);
