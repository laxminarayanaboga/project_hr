-- =============================================================================
-- Demo seed data — repeatable migration (R__ prefix)
-- Loaded only in dev environment via docker-compose Flyway FLYWAY_LOCATIONS.
-- Re-runs automatically when this file changes (checksum-based).
-- All inserts are idempotent via ON CONFLICT DO NOTHING (pinned UUIDs).
-- Password for all accounts: Demo1234!
-- =============================================================================

DO $$
DECLARE
    v_demo_pw TEXT := '$2a$10$9jg3KCgiJzjGfgK6b39F/OXuOmv5.uTKAlf4PysklCKSMkTIDK7H6';

    -- Pinnacle Digital Ltd
    v_pin_co        UUID := '11111111-0000-4000-8000-000000000001';
    v_pin_hr_user   UUID := '11111111-0001-4000-8000-000000000001';
    v_pin_cto_user  UUID := '11111111-0001-4000-8000-000000000002';
    v_pin_mbe_user  UUID := '11111111-0001-4000-8000-000000000003';
    v_pin_mfe_user  UUID := '11111111-0001-4000-8000-000000000004';
    v_pin_mqa_user  UUID := '11111111-0001-4000-8000-000000000005';
    v_pin_mdes_user UUID := '11111111-0001-4000-8000-000000000006';
    v_pin_u01       UUID := '11111111-0001-4000-8000-000000000007';
    v_pin_u02       UUID := '11111111-0001-4000-8000-000000000008';
    v_pin_u03       UUID := '11111111-0001-4000-8000-000000000009';
    v_pin_u04       UUID := '11111111-0001-4000-8000-000000000010';
    v_pin_u05       UUID := '11111111-0001-4000-8000-000000000011';
    v_pin_u06       UUID := '11111111-0001-4000-8000-000000000012';
    v_pin_u07       UUID := '11111111-0001-4000-8000-000000000013';
    v_pin_u08       UUID := '11111111-0001-4000-8000-000000000014';
    v_pin_u09       UUID := '11111111-0001-4000-8000-000000000015';
    v_pin_u10       UUID := '11111111-0001-4000-8000-000000000016';
    v_pin_u11       UUID := '11111111-0001-4000-8000-000000000017';
    v_pin_u12       UUID := '11111111-0001-4000-8000-000000000018';
    v_pin_u13       UUID := '11111111-0001-4000-8000-000000000019';
    v_pin_u14       UUID := '11111111-0001-4000-8000-000000000020';
    v_pin_u15       UUID := '11111111-0001-4000-8000-000000000021';
    v_pin_u16       UUID := '11111111-0001-4000-8000-000000000022';
    v_pin_u17       UUID := '11111111-0001-4000-8000-000000000023';

    v_pin_dept_tech  UUID := '11111111-0002-4000-8000-000000000001';
    v_pin_dept_be    UUID := '11111111-0002-4000-8000-000000000002';
    v_pin_dept_fe    UUID := '11111111-0002-4000-8000-000000000003';
    v_pin_dept_qa    UUID := '11111111-0002-4000-8000-000000000004';
    v_pin_dept_des   UUID := '11111111-0002-4000-8000-000000000005';
    v_pin_dept_sales UUID := '11111111-0002-4000-8000-000000000006';
    v_pin_dept_ops   UUID := '11111111-0002-4000-8000-000000000007';

    v_pin_e_hr   UUID := '11111111-0003-4000-8000-000000000001';
    v_pin_e_cto  UUID := '11111111-0003-4000-8000-000000000002';
    v_pin_e_mbe  UUID := '11111111-0003-4000-8000-000000000003';
    v_pin_e_mfe  UUID := '11111111-0003-4000-8000-000000000004';
    v_pin_e_mqa  UUID := '11111111-0003-4000-8000-000000000005';
    v_pin_e_mdes UUID := '11111111-0003-4000-8000-000000000006';
    v_pin_e01    UUID := '11111111-0003-4000-8000-000000000007';
    v_pin_e02    UUID := '11111111-0003-4000-8000-000000000008';
    v_pin_e03    UUID := '11111111-0003-4000-8000-000000000009';
    v_pin_e04    UUID := '11111111-0003-4000-8000-000000000010';
    v_pin_e05    UUID := '11111111-0003-4000-8000-000000000011';
    v_pin_e06    UUID := '11111111-0003-4000-8000-000000000012';
    v_pin_e07    UUID := '11111111-0003-4000-8000-000000000013';
    v_pin_e08    UUID := '11111111-0003-4000-8000-000000000014';
    v_pin_e09    UUID := '11111111-0003-4000-8000-000000000015';
    v_pin_e10    UUID := '11111111-0003-4000-8000-000000000016';
    v_pin_e11    UUID := '11111111-0003-4000-8000-000000000017';
    v_pin_e12    UUID := '11111111-0003-4000-8000-000000000018';
    v_pin_e13    UUID := '11111111-0003-4000-8000-000000000019';
    v_pin_e14    UUID := '11111111-0003-4000-8000-000000000020';
    v_pin_e15    UUID := '11111111-0003-4000-8000-000000000021';
    v_pin_e16    UUID := '11111111-0003-4000-8000-000000000022';
    v_pin_e17    UUID := '11111111-0003-4000-8000-000000000023';
    v_pin_e_term UUID := '11111111-0003-4000-8000-000000000024';

    v_pin_lt_al   UUID := '11111111-0004-4000-8000-000000000001';
    v_pin_lt_sl   UUID := '11111111-0004-4000-8000-000000000002';
    v_pin_lt_mat  UUID := '11111111-0004-4000-8000-000000000003';
    v_pin_lt_comp UUID := '11111111-0004-4000-8000-000000000004';

    -- Blossom Care Services
    v_blo_co       UUID := '22222222-0000-4000-8000-000000000001';
    v_blo_hr_user  UUID := '22222222-0001-4000-8000-000000000001';
    v_blo_mgr1_u   UUID := '22222222-0001-4000-8000-000000000002';
    v_blo_mgr2_u   UUID := '22222222-0001-4000-8000-000000000003';
    v_blo_u01      UUID := '22222222-0001-4000-8000-000000000004';
    v_blo_u02      UUID := '22222222-0001-4000-8000-000000000005';
    v_blo_u03      UUID := '22222222-0001-4000-8000-000000000006';
    v_blo_u04      UUID := '22222222-0001-4000-8000-000000000007';
    v_blo_u05      UUID := '22222222-0001-4000-8000-000000000008';
    v_blo_u06      UUID := '22222222-0001-4000-8000-000000000009';
    v_blo_u07      UUID := '22222222-0001-4000-8000-000000000010';
    v_blo_u08      UUID := '22222222-0001-4000-8000-000000000011';

    v_blo_dept_care  UUID := '22222222-0002-4000-8000-000000000001';
    v_blo_dept_admin UUID := '22222222-0002-4000-8000-000000000002';
    v_blo_dept_mgmt  UUID := '22222222-0002-4000-8000-000000000003';

    v_blo_e_hr   UUID := '22222222-0003-4000-8000-000000000001';
    v_blo_e_mgr1 UUID := '22222222-0003-4000-8000-000000000002';
    v_blo_e_mgr2 UUID := '22222222-0003-4000-8000-000000000003';
    v_blo_e01    UUID := '22222222-0003-4000-8000-000000000004';
    v_blo_e02    UUID := '22222222-0003-4000-8000-000000000005';
    v_blo_e03    UUID := '22222222-0003-4000-8000-000000000006';
    v_blo_e04    UUID := '22222222-0003-4000-8000-000000000007';
    v_blo_e05    UUID := '22222222-0003-4000-8000-000000000008';
    v_blo_e06    UUID := '22222222-0003-4000-8000-000000000009';
    v_blo_e07    UUID := '22222222-0003-4000-8000-000000000010';
    v_blo_e08    UUID := '22222222-0003-4000-8000-000000000011';
    v_blo_e_term UUID := '22222222-0003-4000-8000-000000000012';

    v_blo_lt_al   UUID := '22222222-0004-4000-8000-000000000001';
    v_blo_lt_sl   UUID := '22222222-0004-4000-8000-000000000002';
    v_blo_lt_comp UUID := '22222222-0004-4000-8000-000000000003';

    -- Thornwood Consulting Group
    v_tho_co       UUID := '33333333-0000-4000-8000-000000000001';
    v_tho_hr_user  UUID := '33333333-0001-4000-8000-000000000001';
    v_tho_ceo_u    UUID := '33333333-0001-4000-8000-000000000002';
    v_tho_dir1_u   UUID := '33333333-0001-4000-8000-000000000003';
    v_tho_dir2_u   UUID := '33333333-0001-4000-8000-000000000004';
    v_tho_dir3_u   UUID := '33333333-0001-4000-8000-000000000005';
    v_tho_mgr1_u   UUID := '33333333-0001-4000-8000-000000000006';
    v_tho_mgr2_u   UUID := '33333333-0001-4000-8000-000000000007';
    v_tho_mgr3_u   UUID := '33333333-0001-4000-8000-000000000008';
    v_tho_mgr4_u   UUID := '33333333-0001-4000-8000-000000000009';
    v_tho_u01 UUID := '33333333-0001-4000-8000-000000000010';
    v_tho_u02 UUID := '33333333-0001-4000-8000-000000000011';
    v_tho_u03 UUID := '33333333-0001-4000-8000-000000000012';
    v_tho_u04 UUID := '33333333-0001-4000-8000-000000000013';
    v_tho_u05 UUID := '33333333-0001-4000-8000-000000000014';
    v_tho_u06 UUID := '33333333-0001-4000-8000-000000000015';
    v_tho_u07 UUID := '33333333-0001-4000-8000-000000000016';
    v_tho_u08 UUID := '33333333-0001-4000-8000-000000000017';
    v_tho_u09 UUID := '33333333-0001-4000-8000-000000000018';
    v_tho_u10 UUID := '33333333-0001-4000-8000-000000000019';
    v_tho_u11 UUID := '33333333-0001-4000-8000-000000000020';
    v_tho_u12 UUID := '33333333-0001-4000-8000-000000000021';
    v_tho_u13 UUID := '33333333-0001-4000-8000-000000000022';
    v_tho_u14 UUID := '33333333-0001-4000-8000-000000000023';
    v_tho_u15 UUID := '33333333-0001-4000-8000-000000000024';
    v_tho_u16 UUID := '33333333-0001-4000-8000-000000000025';
    v_tho_u17 UUID := '33333333-0001-4000-8000-000000000026';
    v_tho_u18 UUID := '33333333-0001-4000-8000-000000000027';
    v_tho_u19 UUID := '33333333-0001-4000-8000-000000000028';

    v_tho_dept_exec  UUID := '33333333-0002-4000-8000-000000000001';
    v_tho_dept_strat UUID := '33333333-0002-4000-8000-000000000002';
    v_tho_dept_fin   UUID := '33333333-0002-4000-8000-000000000003';
    v_tho_dept_hr    UUID := '33333333-0002-4000-8000-000000000004';
    v_tho_dept_it    UUID := '33333333-0002-4000-8000-000000000005';
    v_tho_dept_cs    UUID := '33333333-0002-4000-8000-000000000006';
    v_tho_dept_del   UUID := '33333333-0002-4000-8000-000000000007';
    v_tho_dept_bd    UUID := '33333333-0002-4000-8000-000000000008';

    v_tho_e_hr   UUID := '33333333-0003-4000-8000-000000000001';
    v_tho_e_ceo  UUID := '33333333-0003-4000-8000-000000000002';
    v_tho_e_dir1 UUID := '33333333-0003-4000-8000-000000000003';
    v_tho_e_dir2 UUID := '33333333-0003-4000-8000-000000000004';
    v_tho_e_dir3 UUID := '33333333-0003-4000-8000-000000000005';
    v_tho_e_mgr1 UUID := '33333333-0003-4000-8000-000000000006';
    v_tho_e_mgr2 UUID := '33333333-0003-4000-8000-000000000007';
    v_tho_e_mgr3 UUID := '33333333-0003-4000-8000-000000000008';
    v_tho_e_mgr4 UUID := '33333333-0003-4000-8000-000000000009';
    v_tho_e01    UUID := '33333333-0003-4000-8000-000000000010';
    v_tho_e02    UUID := '33333333-0003-4000-8000-000000000011';
    v_tho_e03    UUID := '33333333-0003-4000-8000-000000000012';
    v_tho_e04    UUID := '33333333-0003-4000-8000-000000000013';
    v_tho_e05    UUID := '33333333-0003-4000-8000-000000000014';
    v_tho_e06    UUID := '33333333-0003-4000-8000-000000000015';
    v_tho_e07    UUID := '33333333-0003-4000-8000-000000000016';
    v_tho_e08    UUID := '33333333-0003-4000-8000-000000000017';
    v_tho_e09    UUID := '33333333-0003-4000-8000-000000000018';
    v_tho_e10    UUID := '33333333-0003-4000-8000-000000000019';
    v_tho_e11    UUID := '33333333-0003-4000-8000-000000000020';
    v_tho_e12    UUID := '33333333-0003-4000-8000-000000000021';
    v_tho_e13    UUID := '33333333-0003-4000-8000-000000000022';
    v_tho_e14    UUID := '33333333-0003-4000-8000-000000000023';
    v_tho_e15    UUID := '33333333-0003-4000-8000-000000000024';
    v_tho_e16    UUID := '33333333-0003-4000-8000-000000000025';
    v_tho_e17    UUID := '33333333-0003-4000-8000-000000000026';
    v_tho_e18    UUID := '33333333-0003-4000-8000-000000000027';
    v_tho_e19    UUID := '33333333-0003-4000-8000-000000000028';
    v_tho_e_term UUID := '33333333-0003-4000-8000-000000000029';

    v_tho_lt_al   UUID := '33333333-0004-4000-8000-000000000001';
    v_tho_lt_sl   UUID := '33333333-0004-4000-8000-000000000002';
    v_tho_lt_mat  UUID := '33333333-0004-4000-8000-000000000003';
    v_tho_lt_comp UUID := '33333333-0004-4000-8000-000000000004';

    -- leave request IDs (pinned so ON CONFLICT works)
    v_pin_lr01 UUID := '11111111-0005-4000-8000-000000000001';
    v_pin_lr02 UUID := '11111111-0005-4000-8000-000000000002';
    v_pin_lr03 UUID := '11111111-0005-4000-8000-000000000003';
    v_pin_lr04 UUID := '11111111-0005-4000-8000-000000000004';
    v_pin_lr05 UUID := '11111111-0005-4000-8000-000000000005';
    v_pin_lr06 UUID := '11111111-0005-4000-8000-000000000006';
    v_pin_lr07 UUID := '11111111-0005-4000-8000-000000000007';
    v_pin_lr08 UUID := '11111111-0005-4000-8000-000000000008';

    v_blo_lr01 UUID := '22222222-0005-4000-8000-000000000001';
    v_blo_lr02 UUID := '22222222-0005-4000-8000-000000000002';
    v_blo_lr03 UUID := '22222222-0005-4000-8000-000000000003';
    v_blo_lr04 UUID := '22222222-0005-4000-8000-000000000004';
    v_blo_lr05 UUID := '22222222-0005-4000-8000-000000000005';
    v_blo_lr06 UUID := '22222222-0005-4000-8000-000000000006';
    v_blo_lr07 UUID := '22222222-0005-4000-8000-000000000007';

    v_tho_lr01 UUID := '33333333-0005-4000-8000-000000000001';
    v_tho_lr02 UUID := '33333333-0005-4000-8000-000000000002';
    v_tho_lr03 UUID := '33333333-0005-4000-8000-000000000003';
    v_tho_lr04 UUID := '33333333-0005-4000-8000-000000000004';
    v_tho_lr05 UUID := '33333333-0005-4000-8000-000000000005';
    v_tho_lr06 UUID := '33333333-0005-4000-8000-000000000006';
    v_tho_lr07 UUID := '33333333-0005-4000-8000-000000000007';
    v_tho_lr08 UUID := '33333333-0005-4000-8000-000000000008';
    v_tho_lr09 UUID := '33333333-0005-4000-8000-000000000009';
    v_tho_lr10 UUID := '33333333-0005-4000-8000-000000000010';
    v_tho_lr11 UUID := '33333333-0005-4000-8000-000000000011';
    v_tho_lr12 UUID := '33333333-0005-4000-8000-000000000012';

BEGIN

-- =============================================================================
-- PINNACLE DIGITAL LTD
-- =============================================================================

INSERT INTO companies(id, name, slug, email, phone, address, country)
VALUES (v_pin_co,'Pinnacle Digital Ltd','pinnacle-digital','admin@pinnacle-digital.co.uk',
        '+44 20 7123 4560','12 Tech Square, Shoreditch, London, E1 6RF','United Kingdom')
ON CONFLICT (id) DO NOTHING;

-- Users
INSERT INTO users(id, company_id, email, password_hash, role) VALUES
    (v_pin_hr_user,   v_pin_co,'admin@pinnacle-digital.co.uk',                v_demo_pw,'HR_ADMIN'),
    (v_pin_cto_user,  v_pin_co,'james.thornton@pinnacle-digital.co.uk',       v_demo_pw,'MANAGER'),
    (v_pin_mbe_user,  v_pin_co,'rachel.chen@pinnacle-digital.co.uk',          v_demo_pw,'MANAGER'),
    (v_pin_mfe_user,  v_pin_co,'dan.patel@pinnacle-digital.co.uk',            v_demo_pw,'MANAGER'),
    (v_pin_mqa_user,  v_pin_co,'sophie.walker@pinnacle-digital.co.uk',        v_demo_pw,'MANAGER'),
    (v_pin_mdes_user, v_pin_co,'alex.morgan@pinnacle-digital.co.uk',          v_demo_pw,'MANAGER'),
    (v_pin_u01,       v_pin_co,'liam.harris@pinnacle-digital.co.uk',          v_demo_pw,'EMPLOYEE'),
    (v_pin_u02,       v_pin_co,'emma.wilson@pinnacle-digital.co.uk',          v_demo_pw,'EMPLOYEE'),
    (v_pin_u03,       v_pin_co,'noah.jones@pinnacle-digital.co.uk',           v_demo_pw,'EMPLOYEE'),
    (v_pin_u04,       v_pin_co,'olivia.brown@pinnacle-digital.co.uk',         v_demo_pw,'EMPLOYEE'),
    (v_pin_u05,       v_pin_co,'william.taylor@pinnacle-digital.co.uk',       v_demo_pw,'EMPLOYEE'),
    (v_pin_u06,       v_pin_co,'ava.anderson@pinnacle-digital.co.uk',         v_demo_pw,'EMPLOYEE'),
    (v_pin_u07,       v_pin_co,'james.white@pinnacle-digital.co.uk',          v_demo_pw,'EMPLOYEE'),
    (v_pin_u08,       v_pin_co,'isabella.martin@pinnacle-digital.co.uk',      v_demo_pw,'EMPLOYEE'),
    (v_pin_u09,       v_pin_co,'oliver.thomas@pinnacle-digital.co.uk',        v_demo_pw,'EMPLOYEE'),
    (v_pin_u10,       v_pin_co,'mia.jackson@pinnacle-digital.co.uk',          v_demo_pw,'EMPLOYEE'),
    (v_pin_u11,       v_pin_co,'elijah.lee@pinnacle-digital.co.uk',           v_demo_pw,'EMPLOYEE'),
    (v_pin_u12,       v_pin_co,'charlotte.hall@pinnacle-digital.co.uk',       v_demo_pw,'EMPLOYEE'),
    (v_pin_u13,       v_pin_co,'lucas.young@pinnacle-digital.co.uk',          v_demo_pw,'EMPLOYEE'),
    (v_pin_u14,       v_pin_co,'amelia.king@pinnacle-digital.co.uk',          v_demo_pw,'EMPLOYEE'),
    (v_pin_u15,       v_pin_co,'henry.wright@pinnacle-digital.co.uk',         v_demo_pw,'EMPLOYEE'),
    (v_pin_u16,       v_pin_co,'harper.scott@pinnacle-digital.co.uk',         v_demo_pw,'EMPLOYEE'),
    (v_pin_u17,       v_pin_co,'tom.newman@pinnacle-digital.co.uk',           v_demo_pw,'EMPLOYEE')
ON CONFLICT (id) DO NOTHING;

-- Departments
INSERT INTO departments(id, company_id, name, parent_id) VALUES
    (v_pin_dept_tech,  v_pin_co,'Technology',        NULL),
    (v_pin_dept_des,   v_pin_co,'Design',             NULL),
    (v_pin_dept_sales, v_pin_co,'Sales & Marketing',  NULL),
    (v_pin_dept_ops,   v_pin_co,'Operations',         NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO departments(id, company_id, name, parent_id) VALUES
    (v_pin_dept_be, v_pin_co,'Backend Engineering', v_pin_dept_tech),
    (v_pin_dept_fe, v_pin_co,'Frontend Engineering',v_pin_dept_tech),
    (v_pin_dept_qa, v_pin_co,'QA & Testing',        v_pin_dept_tech)
ON CONFLICT (id) DO NOTHING;

-- Employees — management
INSERT INTO employees(id, company_id, user_id, department_id, manager_id, first_name, last_name, job_title, employment_type, employment_status, start_date, contracted_hours_per_week) VALUES
    (v_pin_e_hr,   v_pin_co, v_pin_hr_user,   v_pin_dept_ops,  NULL,         'Sarah',  'Mitchell','HR Manager',                 'FULL_TIME','ACTIVE','2022-03-01',40),
    (v_pin_e_cto,  v_pin_co, v_pin_cto_user,  v_pin_dept_tech, NULL,         'James',  'Thornton','Chief Technology Officer',    'FULL_TIME','ACTIVE','2021-01-15',40),
    (v_pin_e_mbe, v_pin_co, v_pin_mbe_user,  v_pin_dept_be,   v_pin_e_cto,  'Rachel', 'Chen',    'Backend Engineering Lead',   'FULL_TIME','ACTIVE','2021-06-01',40),
    (v_pin_e_mfe,  v_pin_co, v_pin_mfe_user,  v_pin_dept_fe,   v_pin_e_cto,  'Dan',    'Patel',   'Frontend Engineering Lead',  'FULL_TIME','ACTIVE','2022-01-10',40),
    (v_pin_e_mqa,  v_pin_co, v_pin_mqa_user,  v_pin_dept_qa,   v_pin_e_cto,  'Sophie', 'Walker',  'QA Lead',                    'FULL_TIME','ACTIVE','2022-04-01',40),
    (v_pin_e_mdes, v_pin_co, v_pin_mdes_user, v_pin_dept_des,  NULL,         'Alex',   'Morgan',  'Design Lead',                'FULL_TIME','ACTIVE','2022-09-01',40)
ON CONFLICT (id) DO NOTHING;

-- Employees — individual contributors
INSERT INTO employees(id, company_id, user_id, department_id, manager_id, first_name, last_name, job_title, employment_type, employment_status, start_date, contracted_hours_per_week) VALUES
    (v_pin_e01, v_pin_co, v_pin_u01, v_pin_dept_be,   v_pin_e_mbe,'Liam',     'Harris',   'Senior Backend Developer',  'FULL_TIME','ACTIVE','2021-08-01',40),
    (v_pin_e02, v_pin_co, v_pin_u02, v_pin_dept_be,   v_pin_e_mbe,'Emma',     'Wilson',   'Backend Developer',         'FULL_TIME','ACTIVE','2022-05-16',40),
    (v_pin_e03, v_pin_co, v_pin_u03, v_pin_dept_be,   v_pin_e_mbe,'Noah',     'Jones',    'Junior Backend Developer',  'FULL_TIME','ACTIVE','2023-02-01',40),
    (v_pin_e04, v_pin_co, v_pin_u04, v_pin_dept_fe,   v_pin_e_mfe, 'Olivia',   'Brown',    'Senior Frontend Developer', 'FULL_TIME','ACTIVE','2021-11-01',40),
    (v_pin_e05, v_pin_co, v_pin_u05, v_pin_dept_fe,   v_pin_e_mfe, 'William',  'Taylor',   'Frontend Developer',        'FULL_TIME','ACTIVE','2022-07-01',40),
    (v_pin_e06, v_pin_co, v_pin_u06, v_pin_dept_fe,   v_pin_e_mfe, 'Ava',      'Anderson', 'Junior Frontend Developer', 'FULL_TIME','ACTIVE','2023-09-04',40),
    (v_pin_e07, v_pin_co, v_pin_u07, v_pin_dept_qa,   v_pin_e_mqa, 'James',    'White',    'Senior QA Engineer',        'FULL_TIME','ACTIVE','2022-02-14',40),
    (v_pin_e08, v_pin_co, v_pin_u08, v_pin_dept_qa,   v_pin_e_mqa, 'Isabella', 'Martin',   'QA Engineer',               'FULL_TIME','ACTIVE','2023-01-09',40),
    (v_pin_e09, v_pin_co, v_pin_u09, v_pin_dept_des,  v_pin_e_mdes,'Oliver',   'Thomas',   'Senior UI/UX Designer',     'FULL_TIME','ACTIVE','2022-03-21',40),
    (v_pin_e10, v_pin_co, v_pin_u10, v_pin_dept_des,  v_pin_e_mdes,'Mia',      'Jackson',  'UI/UX Designer',            'FULL_TIME','ACTIVE','2023-06-12',40),
    (v_pin_e11, v_pin_co, v_pin_u11, v_pin_dept_sales,v_pin_e_hr,  'Elijah',   'Lee',      'Sales Manager',             'FULL_TIME','ACTIVE','2021-07-01',40),
    (v_pin_e12, v_pin_co, v_pin_u12, v_pin_dept_sales,v_pin_e_hr,  'Charlotte','Hall',     'Marketing Specialist',      'FULL_TIME','ACTIVE','2022-10-03',40),
    (v_pin_e13, v_pin_co, v_pin_u13, v_pin_dept_ops,  v_pin_e_hr,  'Lucas',    'Young',    'Operations Coordinator',    'FULL_TIME','ACTIVE','2023-03-13',40),
    (v_pin_e16, v_pin_co, v_pin_u16, v_pin_dept_qa,   v_pin_e_mqa, 'Harper',   'Scott',    'QA Analyst',                'FULL_TIME','ACTIVE','2024-05-01',40),
    (v_pin_e17, v_pin_co, v_pin_u17, v_pin_dept_be,   v_pin_e_mbe,'Tom',      'Newman',   'Contractor Backend Dev',    'CONTRACT', 'ACTIVE','2025-01-06',40)
ON CONFLICT (id) DO NOTHING;

-- Recently joined (dynamic dates — separate inserts)
INSERT INTO employees(id, company_id, user_id, department_id, manager_id, first_name, last_name, job_title, employment_type, employment_status, start_date, contracted_hours_per_week)
VALUES (v_pin_e14, v_pin_co, v_pin_u14, v_pin_dept_be, v_pin_e_mbe, 'Amelia', 'King', 'Junior Backend Developer', 'FULL_TIME', 'ACTIVE', CURRENT_DATE - 14, 40)
ON CONFLICT (id) DO NOTHING;

INSERT INTO employees(id, company_id, user_id, department_id, manager_id, first_name, last_name, job_title, employment_type, employment_status, start_date, contracted_hours_per_week)
VALUES (v_pin_e15, v_pin_co, v_pin_u15, v_pin_dept_fe, v_pin_e_mfe, 'Henry', 'Wright', 'Frontend Developer', 'FULL_TIME', 'ACTIVE', CURRENT_DATE - 7, 40)
ON CONFLICT (id) DO NOTHING;

-- Terminated
INSERT INTO employees(id, company_id, user_id, department_id, manager_id, first_name, last_name, job_title, employment_type, employment_status, start_date, end_date, contracted_hours_per_week)
VALUES (v_pin_e_term, v_pin_co, NULL, v_pin_dept_fe, v_pin_e_mfe, 'George', 'Burton', 'Frontend Developer', 'FULL_TIME', 'TERMINATED', '2022-06-01', '2024-11-30', 40)
ON CONFLICT (id) DO NOTHING;

-- Leave types
INSERT INTO leave_types(id, company_id, name, days_per_year, accrual_method, is_paid, requires_approval) VALUES
    (v_pin_lt_al,   v_pin_co,'Annual Leave',              25.0,'IMMEDIATE',true, true),
    (v_pin_lt_sl,   v_pin_co,'Sick Leave',                10.0,'IMMEDIATE',true, false),
    (v_pin_lt_mat,  v_pin_co,'Maternity/Paternity Leave',  0.0,'NONE',     false,true),
    (v_pin_lt_comp, v_pin_co,'Compassionate Leave',         3.0,'IMMEDIATE',true, true)
ON CONFLICT (id) DO NOTHING;

-- Leave balances 2026
INSERT INTO leave_balances(id, company_id, employee_id, leave_type_id, year, entitled_days, used_days, adjusted_days)
SELECT gen_random_uuid(), v_pin_co, emp, lt, 2026, ent, used, 0
FROM (VALUES
    (v_pin_e_hr),(v_pin_e_cto),(v_pin_e_mbe),(v_pin_e_mfe),(v_pin_e_mqa),(v_pin_e_mdes),
    (v_pin_e01),(v_pin_e02),(v_pin_e03),(v_pin_e04),(v_pin_e05),(v_pin_e06),
    (v_pin_e07),(v_pin_e08),(v_pin_e09),(v_pin_e10),(v_pin_e11),(v_pin_e12),
    (v_pin_e13),(v_pin_e14),(v_pin_e15),(v_pin_e16),(v_pin_e17)
) AS emps(emp)
CROSS JOIN (VALUES
    (v_pin_lt_al,  25.0, 8.0),
    (v_pin_lt_sl,  10.0, 2.0),
    (v_pin_lt_comp, 3.0, 0.0)
) AS lt_data(lt, ent, used)
WHERE NOT EXISTS (
    SELECT 1 FROM leave_balances lb
    WHERE lb.employee_id = emp AND lb.leave_type_id = lt AND lb.year = 2026
);

-- Leave requests (pinned IDs)
INSERT INTO leave_requests(id, company_id, employee_id, leave_type_id, start_date, end_date, working_days, reason, status) VALUES
    (v_pin_lr01, v_pin_co, v_pin_e01,  v_pin_lt_al,   CURRENT_DATE-2,  CURRENT_DATE+2,  5.0,'Holiday',         'APPROVED'),
    (v_pin_lr02, v_pin_co, v_pin_e02,  v_pin_lt_al,   CURRENT_DATE+7,  CURRENT_DATE+11, 5.0,'Summer holiday',   'PENDING'),
    (v_pin_lr03, v_pin_co, v_pin_e04,  v_pin_lt_al,   CURRENT_DATE+14, CURRENT_DATE+18, 5.0,'Family trip',      'PENDING'),
    (v_pin_lr04, v_pin_co, v_pin_e07,  v_pin_lt_comp, CURRENT_DATE+3,  CURRENT_DATE+5,  3.0,'Bereavement',      'PENDING'),
    (v_pin_lr05, v_pin_co, v_pin_e03,  v_pin_lt_al,   CURRENT_DATE+21, CURRENT_DATE+25, 5.0,'Break',            'APPROVED'),
    (v_pin_lr06, v_pin_co, v_pin_e05,  v_pin_lt_al,   CURRENT_DATE+28, CURRENT_DATE+30, 3.0,'Long weekend',     'APPROVED'),
    (v_pin_lr07, v_pin_co, v_pin_e06,  v_pin_lt_al,   CURRENT_DATE+5,  CURRENT_DATE+9,  5.0,'Holiday',          'REJECTED'),
    (v_pin_lr08, v_pin_co, v_pin_e08,  v_pin_lt_al,   CURRENT_DATE+10, CURRENT_DATE+12, 3.0,'Plans changed',    'CANCELLED')
ON CONFLICT (id) DO NOTHING;

UPDATE leave_requests SET rejection_reason = 'Team at full capacity during this period — please rebook for a later date.'
WHERE id = v_pin_lr07 AND rejection_reason IS NULL;

-- Attendance — 15 working days per employee
INSERT INTO attendance_records(id, company_id, employee_id, clock_in, clock_out, hours_worked)
SELECT gen_random_uuid(), v_pin_co, emp,
       (work_day + '08:50'::time) AT TIME ZONE 'Europe/London',
       (work_day + '17:15'::time) AT TIME ZONE 'Europe/London', 8.4
FROM (VALUES
    (v_pin_e_hr),(v_pin_e_mbe),(v_pin_e_mfe),(v_pin_e_mqa),
    (v_pin_e01),(v_pin_e02),(v_pin_e04),(v_pin_e05),(v_pin_e07),(v_pin_e08),
    (v_pin_e09),(v_pin_e10),(v_pin_e11),(v_pin_e12),(v_pin_e16)
) AS emps(emp)
CROSS JOIN (
    SELECT gs::date AS work_day
    FROM generate_series(CURRENT_DATE - 21, CURRENT_DATE - 1, '1 day'::interval) gs
    WHERE EXTRACT(dow FROM gs) NOT IN (0, 6)
    LIMIT 15
) days
WHERE NOT EXISTS (
    SELECT 1 FROM attendance_records ar
    WHERE ar.employee_id = emp AND ar.clock_in::date = work_day
);

-- Clocked in today, not yet out
INSERT INTO attendance_records(id, company_id, employee_id, clock_in, clock_out, hours_worked)
SELECT gen_random_uuid(), v_pin_co, emp,
       (CURRENT_DATE + '09:05'::time) AT TIME ZONE 'Europe/London', NULL, NULL
FROM (VALUES (v_pin_e03),(v_pin_e06),(v_pin_e13)) AS t(emp)
WHERE EXTRACT(dow FROM CURRENT_DATE) NOT IN (0, 6)
  AND NOT EXISTS (
      SELECT 1 FROM attendance_records ar
      WHERE ar.employee_id = emp AND ar.clock_in::date = CURRENT_DATE
  );

-- Overtime (5 records, mixed statuses)
INSERT INTO overtime_records(id, company_id, employee_id, attendance_record_id, work_date, hours_worked, contracted_hours, overtime_hours, status)
SELECT gen_random_uuid(), v_pin_co, ar.employee_id, ar.id, ar.clock_in::date, 10.0, 8.0, 2.0, ot.st
FROM (VALUES (v_pin_e01,'APPROVED'::text),(v_pin_e_mbe,'PENDING'),(v_pin_e04,'PENDING'),(v_pin_e07,'REJECTED'),(v_pin_e02,'APPROVED')) AS ot(emp, st)
JOIN attendance_records ar ON ar.employee_id = ot.emp AND ar.company_id = v_pin_co AND ar.clock_out IS NOT NULL
WHERE NOT EXISTS (SELECT 1 FROM overtime_records ov WHERE ov.attendance_record_id = ar.id)
LIMIT 5;

-- =============================================================================
-- BLOSSOM CARE SERVICES
-- =============================================================================

INSERT INTO companies(id, name, slug, email, phone, address, country)
VALUES (v_blo_co,'Blossom Care Services','blossom-care','admin@blossomcare.co.uk',
        '+44 161 234 5678','8 Poplar Lane, Manchester, M14 5GH','United Kingdom')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users(id, company_id, email, password_hash, role) VALUES
    (v_blo_hr_user, v_blo_co,'admin@blossomcare.co.uk',         v_demo_pw,'HR_ADMIN'),
    (v_blo_mgr1_u,  v_blo_co,'diane.foster@blossomcare.co.uk',  v_demo_pw,'MANAGER'),
    (v_blo_mgr2_u,  v_blo_co,'kevin.nash@blossomcare.co.uk',    v_demo_pw,'MANAGER'),
    (v_blo_u01,     v_blo_co,'priya.sharma@blossomcare.co.uk',  v_demo_pw,'EMPLOYEE'),
    (v_blo_u02,     v_blo_co,'tom.hall@blossomcare.co.uk',      v_demo_pw,'EMPLOYEE'),
    (v_blo_u03,     v_blo_co,'claire.ross@blossomcare.co.uk',   v_demo_pw,'EMPLOYEE'),
    (v_blo_u04,     v_blo_co,'mark.ali@blossomcare.co.uk',      v_demo_pw,'EMPLOYEE'),
    (v_blo_u05,     v_blo_co,'zoe.khan@blossomcare.co.uk',      v_demo_pw,'EMPLOYEE'),
    (v_blo_u06,     v_blo_co,'ben.cox@blossomcare.co.uk',       v_demo_pw,'EMPLOYEE'),
    (v_blo_u07,     v_blo_co,'nina.wood@blossomcare.co.uk',     v_demo_pw,'EMPLOYEE'),
    (v_blo_u08,     v_blo_co,'leo.price@blossomcare.co.uk',     v_demo_pw,'EMPLOYEE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO departments(id, company_id, name, parent_id) VALUES
    (v_blo_dept_care,  v_blo_co,'Care Team',     NULL),
    (v_blo_dept_admin, v_blo_co,'Administration', NULL),
    (v_blo_dept_mgmt,  v_blo_co,'Management',     NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO employees(id, company_id, user_id, department_id, manager_id, first_name, last_name, job_title, employment_type, employment_status, start_date, contracted_hours_per_week) VALUES
    (v_blo_e_hr,   v_blo_co, v_blo_hr_user, v_blo_dept_mgmt, NULL,          'Sandra','Blake',   'HR & Operations Manager','FULL_TIME','ACTIVE','2020-04-01',37.5),
    (v_blo_e_mgr1, v_blo_co, v_blo_mgr1_u,  v_blo_dept_care, NULL,          'Diane', 'Foster',  'Care Team Manager',      'FULL_TIME','ACTIVE','2019-11-01',37.5),
    (v_blo_e_mgr2, v_blo_co, v_blo_mgr2_u,  v_blo_dept_admin,NULL,          'Kevin', 'Nash',    'Admin Manager',          'FULL_TIME','ACTIVE','2021-02-01',37.5),
    (v_blo_e01,    v_blo_co, v_blo_u01,     v_blo_dept_care, v_blo_e_mgr1,  'Priya', 'Sharma',  'Senior Carer',           'FULL_TIME','ACTIVE','2021-05-10',37.5),
    (v_blo_e02,    v_blo_co, v_blo_u02,     v_blo_dept_care, v_blo_e_mgr1,  'Tom',   'Hall',    'Carer',                  'PART_TIME','ACTIVE','2022-01-17',20.0),
    (v_blo_e03,    v_blo_co, v_blo_u03,     v_blo_dept_care, v_blo_e_mgr1,  'Claire','Ross',    'Carer',                  'FULL_TIME','ACTIVE','2022-06-01',37.5),
    (v_blo_e04,    v_blo_co, v_blo_u04,     v_blo_dept_care, v_blo_e_mgr1,  'Mark',  'Ali',     'Bank Staff Carer',       'CONTRACT', 'ACTIVE','2023-03-01',24.0),
    (v_blo_e05,    v_blo_co, v_blo_u05,     v_blo_dept_care, v_blo_e_mgr1,  'Zoe',   'Khan',    'Junior Carer',           'FULL_TIME','ACTIVE','2024-02-01',37.5),
    (v_blo_e06,    v_blo_co, v_blo_u06,     v_blo_dept_admin,v_blo_e_mgr2,  'Ben',   'Cox',     'Admin Coordinator',      'FULL_TIME','ACTIVE','2022-09-01',37.5),
    (v_blo_e07,    v_blo_co, v_blo_u07,     v_blo_dept_admin,v_blo_e_mgr2,  'Nina',  'Wood',    'Receptionist',           'PART_TIME','ACTIVE','2023-07-03',20.0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO employees(id, company_id, user_id, department_id, manager_id, first_name, last_name, job_title, employment_type, employment_status, start_date, contracted_hours_per_week)
VALUES (v_blo_e08, v_blo_co, v_blo_u08, v_blo_dept_care, v_blo_e_mgr1, 'Leo', 'Price', 'Junior Carer', 'FULL_TIME', 'ACTIVE', CURRENT_DATE - 10, 37.5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO employees(id, company_id, user_id, department_id, manager_id, first_name, last_name, job_title, employment_type, employment_status, start_date, end_date, contracted_hours_per_week)
VALUES (v_blo_e_term, v_blo_co, NULL, v_blo_dept_care, v_blo_e_mgr1, 'Janet', 'Pearce', 'Senior Carer', 'FULL_TIME', 'TERMINATED', '2020-08-01', '2025-01-31', 37.5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO leave_types(id, company_id, name, days_per_year, accrual_method, is_paid, requires_approval) VALUES
    (v_blo_lt_al,   v_blo_co,'Annual Leave',       28.0,'IMMEDIATE',true, true),
    (v_blo_lt_sl,   v_blo_co,'Sick Leave',         10.0,'IMMEDIATE',true, false),
    (v_blo_lt_comp, v_blo_co,'Compassionate Leave', 3.0,'IMMEDIATE',true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO leave_balances(id, company_id, employee_id, leave_type_id, year, entitled_days, used_days, adjusted_days)
SELECT gen_random_uuid(), v_blo_co, emp, lt, 2026, ent, used, 0
FROM (VALUES
    (v_blo_e_hr),(v_blo_e_mgr1),(v_blo_e_mgr2),
    (v_blo_e01),(v_blo_e02),(v_blo_e03),(v_blo_e04),(v_blo_e05),(v_blo_e06),(v_blo_e07),(v_blo_e08)
) AS emps(emp)
CROSS JOIN (VALUES
    (v_blo_lt_al,  28.0, 5.0),
    (v_blo_lt_sl,  10.0, 1.0),
    (v_blo_lt_comp, 3.0, 0.0)
) AS lt_data(lt, ent, used)
WHERE NOT EXISTS (
    SELECT 1 FROM leave_balances lb
    WHERE lb.employee_id = emp AND lb.leave_type_id = lt AND lb.year = 2026
);

INSERT INTO leave_requests(id, company_id, employee_id, leave_type_id, start_date, end_date, working_days, reason, status) VALUES
    (v_blo_lr01, v_blo_co, v_blo_e01, v_blo_lt_al,   CURRENT_DATE-1,  CURRENT_DATE+1,  3.0,'Personal time',  'APPROVED'),
    (v_blo_lr02, v_blo_co, v_blo_e02, v_blo_lt_al,   CURRENT_DATE+5,  CURRENT_DATE+9,  5.0,'Holiday',        'PENDING'),
    (v_blo_lr03, v_blo_co, v_blo_e03, v_blo_lt_al,   CURRENT_DATE+7,  CURRENT_DATE+8,  2.0,'Appointment',    'PENDING'),
    (v_blo_lr04, v_blo_co, v_blo_e04, v_blo_lt_comp, CURRENT_DATE+2,  CURRENT_DATE+3,  2.0,'Family matter',  'PENDING'),
    (v_blo_lr05, v_blo_co, v_blo_e05, v_blo_lt_al,   CURRENT_DATE+14, CURRENT_DATE+16, 3.0,'Break',          'APPROVED'),
    (v_blo_lr06, v_blo_co, v_blo_e06, v_blo_lt_al,   CURRENT_DATE+3,  CURRENT_DATE+5,  3.0,'Holiday',        'REJECTED'),
    (v_blo_lr07, v_blo_co, v_blo_e07, v_blo_lt_al,   CURRENT_DATE+20, CURRENT_DATE+22, 3.0,'Errands',        'CANCELLED')
ON CONFLICT (id) DO NOTHING;

UPDATE leave_requests SET rejection_reason = 'Insufficient staffing cover — minimum 4 carers required on shift.'
WHERE id = v_blo_lr06 AND rejection_reason IS NULL;

INSERT INTO attendance_records(id, company_id, employee_id, clock_in, clock_out, hours_worked)
SELECT gen_random_uuid(), v_blo_co, emp,
       (work_day + '08:30'::time) AT TIME ZONE 'Europe/London',
       (work_day + '17:00'::time) AT TIME ZONE 'Europe/London', 8.5
FROM (VALUES (v_blo_e_hr),(v_blo_e_mgr1),(v_blo_e_mgr2),(v_blo_e01),(v_blo_e02),(v_blo_e03),(v_blo_e06)) AS emps(emp)
CROSS JOIN (
    SELECT gs::date AS work_day
    FROM generate_series(CURRENT_DATE - 21, CURRENT_DATE - 1, '1 day'::interval) gs
    WHERE EXTRACT(dow FROM gs) NOT IN (0, 6)
    LIMIT 15
) days
WHERE NOT EXISTS (
    SELECT 1 FROM attendance_records ar
    WHERE ar.employee_id = emp AND ar.clock_in::date = work_day
);

INSERT INTO attendance_records(id, company_id, employee_id, clock_in, clock_out, hours_worked)
SELECT gen_random_uuid(), v_blo_co, emp,
       (CURRENT_DATE + '08:45'::time) AT TIME ZONE 'Europe/London', NULL, NULL
FROM (VALUES (v_blo_e04),(v_blo_e05),(v_blo_e08)) AS t(emp)
WHERE EXTRACT(dow FROM CURRENT_DATE) NOT IN (0, 6)
  AND NOT EXISTS (
      SELECT 1 FROM attendance_records ar WHERE ar.employee_id = emp AND ar.clock_in::date = CURRENT_DATE
  );

INSERT INTO overtime_records(id, company_id, employee_id, attendance_record_id, work_date, hours_worked, contracted_hours, overtime_hours, status)
SELECT gen_random_uuid(), v_blo_co, ar.employee_id, ar.id, ar.clock_in::date, 10.5, 7.5, 3.0, ot.st
FROM (VALUES (v_blo_e01,'APPROVED'::text),(v_blo_e_mgr1,'PENDING'),(v_blo_e03,'REJECTED'),(v_blo_e06,'PENDING'),(v_blo_e02,'APPROVED')) AS ot(emp, st)
JOIN attendance_records ar ON ar.employee_id = ot.emp AND ar.company_id = v_blo_co AND ar.clock_out IS NOT NULL
WHERE NOT EXISTS (SELECT 1 FROM overtime_records ov WHERE ov.attendance_record_id = ar.id)
LIMIT 5;

-- =============================================================================
-- THORNWOOD CONSULTING GROUP
-- =============================================================================

INSERT INTO companies(id, name, slug, email, phone, address, country)
VALUES (v_tho_co,'Thornwood Consulting Group','thornwood-consulting','admin@thornwood-consulting.co.uk',
        '+44 20 3456 7890','45 Cannon Street, London, EC4N 5AB','United Kingdom')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users(id, company_id, email, password_hash, role) VALUES
    (v_tho_hr_user, v_tho_co,'admin@thornwood-consulting.co.uk',          v_demo_pw,'HR_ADMIN'),
    (v_tho_ceo_u,   v_tho_co,'richard.hayes@thornwood-consulting.co.uk',  v_demo_pw,'MANAGER'),
    (v_tho_dir1_u,  v_tho_co,'fiona.grant@thornwood-consulting.co.uk',    v_demo_pw,'MANAGER'),
    (v_tho_dir2_u,  v_tho_co,'marcus.bell@thornwood-consulting.co.uk',    v_demo_pw,'MANAGER'),
    (v_tho_dir3_u,  v_tho_co,'helen.shaw@thornwood-consulting.co.uk',     v_demo_pw,'MANAGER'),
    (v_tho_mgr1_u,  v_tho_co,'adam.ford@thornwood-consulting.co.uk',      v_demo_pw,'MANAGER'),
    (v_tho_mgr2_u,  v_tho_co,'claire.hunt@thornwood-consulting.co.uk',    v_demo_pw,'MANAGER'),
    (v_tho_mgr3_u,  v_tho_co,'paul.green@thornwood-consulting.co.uk',     v_demo_pw,'MANAGER'),
    (v_tho_mgr4_u,  v_tho_co,'lisa.west@thornwood-consulting.co.uk',      v_demo_pw,'MANAGER'),
    (v_tho_u01, v_tho_co,'jack.cooper@thornwood-consulting.co.uk',        v_demo_pw,'EMPLOYEE'),
    (v_tho_u02, v_tho_co,'grace.mills@thornwood-consulting.co.uk',        v_demo_pw,'EMPLOYEE'),
    (v_tho_u03, v_tho_co,'ben.reed@thornwood-consulting.co.uk',           v_demo_pw,'EMPLOYEE'),
    (v_tho_u04, v_tho_co,'ella.ross@thornwood-consulting.co.uk',          v_demo_pw,'EMPLOYEE'),
    (v_tho_u05, v_tho_co,'dan.cole@thornwood-consulting.co.uk',           v_demo_pw,'EMPLOYEE'),
    (v_tho_u06, v_tho_co,'kate.ward@thornwood-consulting.co.uk',          v_demo_pw,'EMPLOYEE'),
    (v_tho_u07, v_tho_co,'sam.lane@thornwood-consulting.co.uk',           v_demo_pw,'EMPLOYEE'),
    (v_tho_u08, v_tho_co,'amy.price@thornwood-consulting.co.uk',          v_demo_pw,'EMPLOYEE'),
    (v_tho_u09, v_tho_co,'jake.stone@thornwood-consulting.co.uk',         v_demo_pw,'EMPLOYEE'),
    (v_tho_u10, v_tho_co,'lucy.ford@thornwood-consulting.co.uk',          v_demo_pw,'EMPLOYEE'),
    (v_tho_u11, v_tho_co,'ryan.hill@thornwood-consulting.co.uk',          v_demo_pw,'EMPLOYEE'),
    (v_tho_u12, v_tho_co,'anna.dean@thornwood-consulting.co.uk',          v_demo_pw,'EMPLOYEE'),
    (v_tho_u13, v_tho_co,'will.cross@thornwood-consulting.co.uk',         v_demo_pw,'EMPLOYEE'),
    (v_tho_u14, v_tho_co,'meg.hunt@thornwood-consulting.co.uk',           v_demo_pw,'EMPLOYEE'),
    (v_tho_u15, v_tho_co,'chris.bain@thornwood-consulting.co.uk',         v_demo_pw,'EMPLOYEE'),
    (v_tho_u16, v_tho_co,'sara.lowe@thornwood-consulting.co.uk',          v_demo_pw,'EMPLOYEE'),
    (v_tho_u17, v_tho_co,'joe.wade@thornwood-consulting.co.uk',           v_demo_pw,'EMPLOYEE'),
    (v_tho_u18, v_tho_co,'beth.king@thornwood-consulting.co.uk',          v_demo_pw,'EMPLOYEE'),
    (v_tho_u19, v_tho_co,'owen.newman@thornwood-consulting.co.uk',        v_demo_pw,'EMPLOYEE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO departments(id, company_id, name, parent_id) VALUES
    (v_tho_dept_exec,  v_tho_co,'Executive',           NULL),
    (v_tho_dept_strat, v_tho_co,'Strategy & Advisory', NULL),
    (v_tho_dept_fin,   v_tho_co,'Finance & Accounting',NULL),
    (v_tho_dept_hr,    v_tho_co,'Human Resources',     NULL),
    (v_tho_dept_it,    v_tho_co,'IT & Systems',        NULL),
    (v_tho_dept_cs,    v_tho_co,'Client Services',     NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO departments(id, company_id, name, parent_id) VALUES
    (v_tho_dept_del, v_tho_co,'Delivery',             v_tho_dept_cs),
    (v_tho_dept_bd,  v_tho_co,'Business Development', v_tho_dept_cs)
ON CONFLICT (id) DO NOTHING;

INSERT INTO employees(id, company_id, user_id, department_id, manager_id, first_name, last_name, job_title, employment_type, employment_status, start_date, contracted_hours_per_week) VALUES
    (v_tho_e_hr,   v_tho_co, v_tho_hr_user, v_tho_dept_hr,    NULL,          'Patricia','Owen',   'HR Director',              'FULL_TIME','ACTIVE','2018-05-01',40),
    (v_tho_e_ceo,  v_tho_co, v_tho_ceo_u,  v_tho_dept_exec,  NULL,          'Richard', 'Hayes',  'CEO',                      'FULL_TIME','ACTIVE','2017-01-03',40),
    (v_tho_e_dir1, v_tho_co, v_tho_dir1_u, v_tho_dept_strat, v_tho_e_ceo,   'Fiona',   'Grant',  'Director of Strategy',     'FULL_TIME','ACTIVE','2018-03-01',40),
    (v_tho_e_dir2, v_tho_co, v_tho_dir2_u, v_tho_dept_fin,   v_tho_e_ceo,   'Marcus',  'Bell',   'Finance Director',         'FULL_TIME','ACTIVE','2018-06-01',40),
    (v_tho_e_dir3, v_tho_co, v_tho_dir3_u, v_tho_dept_cs,    v_tho_e_ceo,   'Helen',   'Shaw',   'Director of Client Svcs',  'FULL_TIME','ACTIVE','2019-01-07',40),
    (v_tho_e_mgr1, v_tho_co, v_tho_mgr1_u, v_tho_dept_it,    v_tho_e_ceo,   'Adam',    'Ford',   'IT Manager',               'FULL_TIME','ACTIVE','2020-02-03',40),
    (v_tho_e_mgr2, v_tho_co, v_tho_mgr2_u, v_tho_dept_strat, v_tho_e_dir1,  'Claire',  'Hunt',   'Strategy Manager',         'FULL_TIME','ACTIVE','2020-09-01',40),
    (v_tho_e_mgr3, v_tho_co, v_tho_mgr3_u, v_tho_dept_del,   v_tho_e_dir3,  'Paul',    'Green',  'Delivery Manager',         'FULL_TIME','ACTIVE','2021-01-04',40),
    (v_tho_e_mgr4, v_tho_co, v_tho_mgr4_u, v_tho_dept_bd,    v_tho_e_dir3,  'Lisa',    'West',   'BD Manager',               'FULL_TIME','ACTIVE','2021-04-01',40)
ON CONFLICT (id) DO NOTHING;

INSERT INTO employees(id, company_id, user_id, department_id, manager_id, first_name, last_name, job_title, employment_type, employment_status, start_date, contracted_hours_per_week) VALUES
    (v_tho_e01, v_tho_co, v_tho_u01, v_tho_dept_strat, v_tho_e_mgr2, 'Jack',  'Cooper','Senior Consultant',      'FULL_TIME','ACTIVE','2021-06-01',40),
    (v_tho_e02, v_tho_co, v_tho_u02, v_tho_dept_strat, v_tho_e_mgr2, 'Grace', 'Mills', 'Consultant',             'FULL_TIME','ACTIVE','2022-02-14',40),
    (v_tho_e03, v_tho_co, v_tho_u03, v_tho_dept_strat, v_tho_e_mgr2, 'Ben',   'Reed',  'Junior Consultant',      'FULL_TIME','ACTIVE','2023-05-01',40),
    (v_tho_e04, v_tho_co, v_tho_u04, v_tho_dept_fin,   v_tho_e_dir2, 'Ella',  'Ross',  'Senior Accountant',      'FULL_TIME','ACTIVE','2020-11-02',40),
    (v_tho_e05, v_tho_co, v_tho_u05, v_tho_dept_fin,   v_tho_e_dir2, 'Dan',   'Cole',  'Accountant',             'FULL_TIME','ACTIVE','2022-03-07',40),
    (v_tho_e06, v_tho_co, v_tho_u06, v_tho_dept_fin,   v_tho_e_dir2, 'Kate',  'Ward',  'Finance Analyst',        'FULL_TIME','ACTIVE','2023-09-04',40),
    (v_tho_e07, v_tho_co, v_tho_u07, v_tho_dept_it,    v_tho_e_mgr1, 'Sam',   'Lane',  'Systems Engineer',       'FULL_TIME','ACTIVE','2021-08-02',40),
    (v_tho_e08, v_tho_co, v_tho_u08, v_tho_dept_it,    v_tho_e_mgr1, 'Amy',   'Price', 'IT Support Specialist',  'FULL_TIME','ACTIVE','2022-10-10',40),
    (v_tho_e09, v_tho_co, v_tho_u09, v_tho_dept_del,   v_tho_e_mgr3, 'Jake',  'Stone', 'Senior Delivery Consultant','FULL_TIME','ACTIVE','2020-07-06',40),
    (v_tho_e10, v_tho_co, v_tho_u10, v_tho_dept_del,   v_tho_e_mgr3, 'Lucy',  'Ford',  'Delivery Consultant',    'FULL_TIME','ACTIVE','2021-10-04',40),
    (v_tho_e11, v_tho_co, v_tho_u11, v_tho_dept_del,   v_tho_e_mgr3, 'Ryan',  'Hill',  'Delivery Analyst',       'FULL_TIME','ACTIVE','2022-05-09',40),
    (v_tho_e12, v_tho_co, v_tho_u12, v_tho_dept_bd,    v_tho_e_mgr4, 'Anna',  'Dean',  'Senior BD Executive',    'FULL_TIME','ACTIVE','2020-04-01',40),
    (v_tho_e13, v_tho_co, v_tho_u13, v_tho_dept_bd,    v_tho_e_mgr4, 'Will',  'Cross', 'BD Executive',           'FULL_TIME','ACTIVE','2022-08-01',40),
    (v_tho_e14, v_tho_co, v_tho_u14, v_tho_dept_hr,    v_tho_e_hr,   'Meg',   'Hunt',  'HR Business Partner',    'FULL_TIME','ACTIVE','2022-01-17',40),
    (v_tho_e15, v_tho_co, v_tho_u15, v_tho_dept_strat, v_tho_e_mgr2, 'Chris', 'Bain',  'Consultant',             'FULL_TIME','ACTIVE','2023-11-06',40),
    (v_tho_e16, v_tho_co, v_tho_u16, v_tho_dept_del,   v_tho_e_mgr3, 'Sara',  'Lowe',  'Junior Consultant',      'FULL_TIME','ACTIVE','2024-03-11',40),
    (v_tho_e17, v_tho_co, v_tho_u17, v_tho_dept_bd,    v_tho_e_mgr4, 'Joe',   'Wade',  'BD Analyst',             'FULL_TIME','ACTIVE','2024-07-01',40)
ON CONFLICT (id) DO NOTHING;

INSERT INTO employees(id, company_id, user_id, department_id, manager_id, first_name, last_name, job_title, employment_type, employment_status, start_date, contracted_hours_per_week)
VALUES (v_tho_e18, v_tho_co, v_tho_u18, v_tho_dept_fin, v_tho_e_dir2, 'Beth', 'King', 'Junior Accountant', 'FULL_TIME', 'ACTIVE', CURRENT_DATE - 20, 40)
ON CONFLICT (id) DO NOTHING;

INSERT INTO employees(id, company_id, user_id, department_id, manager_id, first_name, last_name, job_title, employment_type, employment_status, start_date, contracted_hours_per_week)
VALUES (v_tho_e19, v_tho_co, v_tho_u19, v_tho_dept_it, v_tho_e_mgr1, 'Owen', 'Newman', 'IT Graduate', 'FULL_TIME', 'ACTIVE', CURRENT_DATE - 5, 40)
ON CONFLICT (id) DO NOTHING;

INSERT INTO employees(id, company_id, user_id, department_id, manager_id, first_name, last_name, job_title, employment_type, employment_status, start_date, end_date, contracted_hours_per_week)
VALUES (v_tho_e_term, v_tho_co, NULL, v_tho_dept_strat, v_tho_e_mgr2, 'Nicholas', 'Drew', 'Senior Consultant', 'FULL_TIME', 'TERMINATED', '2019-06-01', '2024-08-31', 40)
ON CONFLICT (id) DO NOTHING;

INSERT INTO leave_types(id, company_id, name, days_per_year, accrual_method, is_paid, requires_approval) VALUES
    (v_tho_lt_al,   v_tho_co,'Annual Leave',              25.0,'IMMEDIATE',true, true),
    (v_tho_lt_sl,   v_tho_co,'Sick Leave',                10.0,'IMMEDIATE',true, false),
    (v_tho_lt_mat,  v_tho_co,'Maternity/Paternity Leave',  0.0,'NONE',     false,true),
    (v_tho_lt_comp, v_tho_co,'Compassionate Leave',         3.0,'IMMEDIATE',true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO leave_balances(id, company_id, employee_id, leave_type_id, year, entitled_days, used_days, adjusted_days)
SELECT gen_random_uuid(), v_tho_co, emp, lt, 2026, ent, used, 0
FROM (VALUES
    (v_tho_e_hr),(v_tho_e_ceo),(v_tho_e_dir1),(v_tho_e_dir2),(v_tho_e_dir3),
    (v_tho_e_mgr1),(v_tho_e_mgr2),(v_tho_e_mgr3),(v_tho_e_mgr4),
    (v_tho_e01),(v_tho_e02),(v_tho_e03),(v_tho_e04),(v_tho_e05),(v_tho_e06),
    (v_tho_e07),(v_tho_e08),(v_tho_e09),(v_tho_e10),(v_tho_e11),(v_tho_e12),
    (v_tho_e13),(v_tho_e14),(v_tho_e15),(v_tho_e16),(v_tho_e17),(v_tho_e18),(v_tho_e19)
) AS emps(emp)
CROSS JOIN (VALUES
    (v_tho_lt_al,   25.0,10.0),
    (v_tho_lt_sl,   10.0, 2.0),
    (v_tho_lt_comp,  3.0, 0.0)
) AS lt_data(lt, ent, used)
WHERE NOT EXISTS (
    SELECT 1 FROM leave_balances lb
    WHERE lb.employee_id = emp AND lb.leave_type_id = lt AND lb.year = 2026
);

INSERT INTO leave_requests(id, company_id, employee_id, leave_type_id, start_date, end_date, working_days, reason, status) VALUES
    (v_tho_lr01, v_tho_co, v_tho_e01,  v_tho_lt_al,   CURRENT_DATE-3,  CURRENT_DATE+1,  5.0,'Conference travel',  'APPROVED'),
    (v_tho_lr02, v_tho_co, v_tho_e09,  v_tho_lt_al,   CURRENT_DATE,    CURRENT_DATE+2,  3.0,'Short break',        'APPROVED'),
    (v_tho_lr03, v_tho_co, v_tho_e02,  v_tho_lt_al,   CURRENT_DATE+5,  CURRENT_DATE+9,  5.0,'Holiday',            'PENDING'),
    (v_tho_lr04, v_tho_co, v_tho_e04,  v_tho_lt_al,   CURRENT_DATE+7,  CURRENT_DATE+9,  3.0,'Personal leave',     'PENDING'),
    (v_tho_lr05, v_tho_co, v_tho_e07,  v_tho_lt_al,   CURRENT_DATE+12, CURRENT_DATE+14, 3.0,'Annual leave',       'PENDING'),
    (v_tho_lr06, v_tho_co, v_tho_e12,  v_tho_lt_al,   CURRENT_DATE+5,  CURRENT_DATE+7,  3.0,'Trip',               'PENDING'),
    (v_tho_lr07, v_tho_co, v_tho_e13,  v_tho_lt_comp, CURRENT_DATE+2,  CURRENT_DATE+4,  3.0,'Family bereavement', 'PENDING'),
    (v_tho_lr08, v_tho_co, v_tho_e03,  v_tho_lt_al,   CURRENT_DATE+21, CURRENT_DATE+25, 5.0,'Holiday',            'APPROVED'),
    (v_tho_lr09, v_tho_co, v_tho_e10,  v_tho_lt_al,   CURRENT_DATE+28, CURRENT_DATE+30, 3.0,'Long weekend',       'APPROVED'),
    (v_tho_lr10, v_tho_co, v_tho_e05,  v_tho_lt_al,   CURRENT_DATE+4,  CURRENT_DATE+8,  5.0,'Holiday',            'REJECTED'),
    (v_tho_lr11, v_tho_co, v_tho_e06,  v_tho_lt_al,   CURRENT_DATE+15, CURRENT_DATE+17, 3.0,'Break',              'CANCELLED'),
    (v_tho_lr12, v_tho_co, v_tho_e_dir1,v_tho_lt_al,  CURRENT_DATE+35, CURRENT_DATE+39, 5.0,'Summer holiday',     'APPROVED')
ON CONFLICT (id) DO NOTHING;

UPDATE leave_requests SET rejection_reason = 'Key client deliverable scheduled — cannot approve leave during this sprint.'
WHERE id = v_tho_lr10 AND rejection_reason IS NULL;

INSERT INTO attendance_records(id, company_id, employee_id, clock_in, clock_out, hours_worked)
SELECT gen_random_uuid(), v_tho_co, emp,
       (work_day + '08:55'::time) AT TIME ZONE 'Europe/London',
       (work_day + '17:30'::time) AT TIME ZONE 'Europe/London', 8.6
FROM (VALUES
    (v_tho_e_hr),(v_tho_e_mgr1),(v_tho_e_mgr2),(v_tho_e_mgr3),(v_tho_e_mgr4),
    (v_tho_e01),(v_tho_e02),(v_tho_e03),(v_tho_e04),(v_tho_e05),(v_tho_e06),
    (v_tho_e07),(v_tho_e08),(v_tho_e09),(v_tho_e10),(v_tho_e11),(v_tho_e12),(v_tho_e14),(v_tho_e16)
) AS emps(emp)
CROSS JOIN (
    SELECT gs::date AS work_day
    FROM generate_series(CURRENT_DATE - 21, CURRENT_DATE - 1, '1 day'::interval) gs
    WHERE EXTRACT(dow FROM gs) NOT IN (0, 6)
    LIMIT 15
) days
WHERE NOT EXISTS (
    SELECT 1 FROM attendance_records ar
    WHERE ar.employee_id = emp AND ar.clock_in::date = work_day
);

INSERT INTO attendance_records(id, company_id, employee_id, clock_in, clock_out, hours_worked)
SELECT gen_random_uuid(), v_tho_co, emp,
       (CURRENT_DATE + '09:00'::time) AT TIME ZONE 'Europe/London', NULL, NULL
FROM (VALUES (v_tho_e13),(v_tho_e15),(v_tho_e17)) AS t(emp)
WHERE EXTRACT(dow FROM CURRENT_DATE) NOT IN (0, 6)
  AND NOT EXISTS (
      SELECT 1 FROM attendance_records ar WHERE ar.employee_id = emp AND ar.clock_in::date = CURRENT_DATE
  );

INSERT INTO overtime_records(id, company_id, employee_id, attendance_record_id, work_date, hours_worked, contracted_hours, overtime_hours, status)
SELECT gen_random_uuid(), v_tho_co, ar.employee_id, ar.id, ar.clock_in::date, 11.5, 8.0, 3.5, ot.st
FROM (VALUES
    (v_tho_e01,'APPROVED'::text),(v_tho_e_mgr2,'APPROVED'),(v_tho_e09,'PENDING'),
    (v_tho_e04,'REJECTED'),(v_tho_e12,'PENDING'),(v_tho_e07,'PENDING'),(v_tho_e02,'APPROVED')
) AS ot(emp, st)
JOIN attendance_records ar ON ar.employee_id = ot.emp AND ar.company_id = v_tho_co AND ar.clock_out IS NOT NULL
WHERE NOT EXISTS (SELECT 1 FROM overtime_records ov WHERE ov.attendance_record_id = ar.id)
LIMIT 7;

END $$;
