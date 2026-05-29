CREATE TABLE documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID NOT NULL REFERENCES companies(id),
    employee_id UUID NOT NULL REFERENCES employees(id),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    name        VARCHAR(255) NOT NULL,
    type        VARCHAR(100),    -- CONTRACT, ID, CERTIFICATE, OTHER
    s3_key      VARCHAR(500) NOT NULL,
    file_size   BIGINT,
    mime_type   VARCHAR(100),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_company_id ON documents(company_id);
CREATE INDEX idx_documents_employee_id ON documents(employee_id);
