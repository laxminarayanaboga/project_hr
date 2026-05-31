CREATE TABLE public_holidays (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID NOT NULL REFERENCES companies(id),
    name        VARCHAR(100) NOT NULL,
    holiday_date DATE NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (company_id, holiday_date)
);

CREATE INDEX idx_public_holidays_company_id ON public_holidays(company_id);
CREATE INDEX idx_public_holidays_date ON public_holidays(company_id, holiday_date);
