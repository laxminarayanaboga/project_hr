CREATE TABLE employees (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id          UUID NOT NULL REFERENCES companies(id),
    user_id             UUID REFERENCES users(id),
    department_id       UUID REFERENCES departments(id),
    manager_id          UUID REFERENCES employees(id),

    -- Personal Info
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    preferred_name      VARCHAR(100),
    date_of_birth       DATE,
    gender              VARCHAR(50),
    nationality         VARCHAR(100),
    phone               VARCHAR(50),
    personal_email      VARCHAR(255),
    address             TEXT,

    -- Job Info
    employee_number     VARCHAR(50),
    job_title           VARCHAR(255),
    employment_type     VARCHAR(50),    -- FULL_TIME, PART_TIME, CONTRACT
    employment_status   VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, ON_LEAVE, TERMINATED
    start_date          DATE NOT NULL,
    end_date            DATE,
    probation_end       DATE,

    -- System
    avatar_url          VARCHAR(500),
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_employees_company_id ON employees(company_id);
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);
CREATE INDEX idx_employees_status ON employees(company_id, employment_status);
CREATE INDEX idx_employees_name ON employees(company_id, last_name, first_name);
