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

-- =============================================================================
-- PERSONAL INFORMATION — email, phone, DOB, gender, nationality, address,
-- employee number, probation end. Uses literal UUIDs so no PL/pgSQL
-- substitution issues. Fully idempotent (re-sets same values each run).
-- =============================================================================

-- Pinnacle Digital Ltd
UPDATE employees e
SET personal_email  = v.pe,
    phone           = v.ph,
    date_of_birth   = v.dob,
    gender          = v.gen,
    nationality     = v.nat,
    address         = v.addr,
    employee_number = v.enum,
    probation_end   = v.prob
FROM (VALUES
    ('11111111-0003-4000-8000-000000000001'::uuid,'sarah.m@hotmail.co.uk',       '+44 7711 234001','1985-03-15'::date,'Female','British',        '24 Elm Street, Bethnal Green, London, E2 6LT',         'PIN-001',NULL::date),
    ('11111111-0003-4000-8000-000000000002'::uuid,'james.thornton82@gmail.com',  '+44 7711 234002','1979-07-22'::date,'Male',  'British',        '15 Hoxton Square, Hackney, London, N1 6NT',            'PIN-002',NULL::date),
    ('11111111-0003-4000-8000-000000000003'::uuid,'rachel.chen@gmail.com',       '+44 7711 234003','1987-11-04'::date,'Female','British',        '42 Brick Lane, Tower Hamlets, London, E1 6RF',         'PIN-003',NULL::date),
    ('11111111-0003-4000-8000-000000000004'::uuid,'danpatel88@yahoo.co.uk',      '+44 7711 234004','1988-05-19'::date,'Male',  'British',        '7 Columbia Road, Bethnal Green, London, E2 7RG',       'PIN-004',NULL::date),
    ('11111111-0003-4000-8000-000000000005'::uuid,'sophie.walker@gmail.com',     '+44 7711 234005','1990-08-30'::date,'Female','British',        '31 Roman Road, Bow, London, E3 5QR',                   'PIN-005',NULL::date),
    ('11111111-0003-4000-8000-000000000006'::uuid,'alexmorgan.design@outlook.com','+44 7711 234006','1989-01-12'::date,'Male', 'British',        '19 Redchurch Street, Shoreditch, London, E2 7DJ',      'PIN-006',NULL::date),
    ('11111111-0003-4000-8000-000000000007'::uuid,'liam.harris.dev@gmail.com',   '+44 7711 234007','1993-06-25'::date,'Male',  'British',        '88 Whitechapel Road, London, E1 1JX',                  'PIN-007',NULL::date),
    ('11111111-0003-4000-8000-000000000008'::uuid,'emma.wilson95@gmail.com',     '+44 7711 234008','1994-09-03'::date,'Female','British',        '14 Stepney Green, London, E1 3JX',                     'PIN-008',NULL::date),
    ('11111111-0003-4000-8000-000000000009'::uuid,'noahjones@gmail.com',         '+44 7711 234009','1999-02-14'::date,'Male',  'British',        '56 Cambridge Heath Road, London, E2 9DA',              'PIN-009','2023-05-01'::date),
    ('11111111-0003-4000-8000-000000000010'::uuid,'olivia.b@hotmail.co.uk',      '+44 7711 234010','1992-12-07'::date,'Female','British',        '3 Weaver Street, Shoreditch, London, E1 6QX',          'PIN-010',NULL::date),
    ('11111111-0003-4000-8000-000000000011'::uuid,'will.taylor.dev@gmail.com',   '+44 7711 234011','1995-04-18'::date,'Male',  'British',        '72 Old Street, Hackney, London, EC1V 9HX',             'PIN-011',NULL::date),
    ('11111111-0003-4000-8000-000000000012'::uuid,'ava.anderson@outlook.com',    '+44 7711 234012','2001-07-09'::date,'Female','British',        '29 Kingsland Road, Dalston, London, E8 4AB',           'PIN-012','2023-12-04'::date),
    ('11111111-0003-4000-8000-000000000013'::uuid,'james.white.qa@gmail.com',    '+44 7711 234013','1990-11-28'::date,'Male',  'British',        '45 Bethnal Green Road, London, E1 6LA',                'PIN-013',NULL::date),
    ('11111111-0003-4000-8000-000000000014'::uuid,'isabella.martin@gmail.com',   '+44 7711 234014','1997-03-22'::date,'Female','British',        '11 Arnold Circus, Shoreditch, London, E2 7JR',         'PIN-014','2023-04-09'::date),
    ('11111111-0003-4000-8000-000000000015'::uuid,'oliver.thomas.design@gmail.com','+44 7711 234015','1991-09-16'::date,'Male','British',        '63 Curtain Road, Shoreditch, London, EC2A 3PE',        'PIN-015',NULL::date),
    ('11111111-0003-4000-8000-000000000016'::uuid,'mia.jackson@gmail.com',       '+44 7711 234016','1996-05-01'::date,'Female','British',        '38 Great Eastern Street, Shoreditch, London, EC2A 3JL','PIN-016','2023-09-12'::date),
    ('11111111-0003-4000-8000-000000000017'::uuid,'elijah.lee@yahoo.co.uk',      '+44 7711 234017','1988-10-13'::date,'Male',  'British',        '27 Commercial Street, Spitalfields, London, E1 6LP',   'PIN-017',NULL::date),
    ('11111111-0003-4000-8000-000000000018'::uuid,'charlotte.hall@gmail.com',    '+44 7711 234018','1994-08-24'::date,'Female','British',        '16 Hanbury Street, Spitalfields, London, E1 5JP',      'PIN-018',NULL::date),
    ('11111111-0003-4000-8000-000000000019'::uuid,'lucas.young@hotmail.co.uk',   '+44 7711 234019','1997-12-05'::date,'Male',  'British',        '52 Fashion Street, Spitalfields, London, E1 6PX',      'PIN-019','2023-06-13'::date),
    ('11111111-0003-4000-8000-000000000022'::uuid,'harper.scott@gmail.com',      '+44 7711 234022','1998-01-23'::date,'Female','British',        '19 Toynbee Street, Aldgate, London, E1 7NE',           'PIN-022','2024-08-01'::date),
    ('11111111-0003-4000-8000-000000000023'::uuid,'tom.newman@gmail.com',        '+44 7711 234023','1993-06-11'::date,'Male',  'Irish',          '44 Back Church Lane, Whitechapel, London, E1 1LX',     'PIN-023','2025-04-06'::date)
) AS v(eid, pe, ph, dob, gen, nat, addr, enum, prob)
WHERE e.id = v.eid;

-- Pinnacle — recently joined (probation = start_date + 3 months, derived dynamically)
UPDATE employees SET
    personal_email  = 'amelia.king@gmail.com',
    phone           = '+44 7711 234020',
    date_of_birth   = '2001-04-17',
    gender          = 'Female',
    nationality     = 'British',
    address         = '8 Princelet Street, Spitalfields, London, E1 5QA',
    employee_number = 'PIN-020',
    probation_end   = (start_date + INTERVAL '3 months')::date
WHERE id = '11111111-0003-4000-8000-000000000020';

UPDATE employees SET
    personal_email  = 'henry.wright@outlook.com',
    phone           = '+44 7711 234021',
    date_of_birth   = '2000-08-30',
    gender          = 'Male',
    nationality     = 'British',
    address         = '33 Fournier Street, Spitalfields, London, E1 6QE',
    employee_number = 'PIN-021',
    probation_end   = (start_date + INTERVAL '3 months')::date
WHERE id = '11111111-0003-4000-8000-000000000021';

-- Blossom Care Services
UPDATE employees e
SET personal_email  = v.pe,
    phone           = v.ph,
    date_of_birth   = v.dob,
    gender          = v.gen,
    nationality     = v.nat,
    address         = v.addr,
    employee_number = v.enum,
    probation_end   = v.prob
FROM (VALUES
    ('22222222-0003-4000-8000-000000000001'::uuid,'sandra.blake@gmail.com',      '+44 7712 345001','1978-05-08'::date,'Female','British',        '14 Princess Road, Moss Side, Manchester, M14 4RW',     'BLO-001',NULL::date),
    ('22222222-0003-4000-8000-000000000002'::uuid,'diane.foster@hotmail.co.uk',  '+44 7712 345002','1973-11-20'::date,'Female','British',        '6 Wilmslow Road, Fallowfield, Manchester, M14 6AB',    'BLO-002',NULL::date),
    ('22222222-0003-4000-8000-000000000003'::uuid,'kevin.nash@gmail.com',        '+44 7712 345003','1980-03-14'::date,'Male',  'British',        '32 Parkside Avenue, Levenshulme, Manchester, M19 3EP', 'BLO-003',NULL::date),
    ('22222222-0003-4000-8000-000000000004'::uuid,'priya.sharma@gmail.com',      '+44 7712 345004','1989-07-29'::date,'Female','British',        '8 Victoria Avenue, Didsbury, Manchester, M20 2GE',     'BLO-004',NULL::date),
    ('22222222-0003-4000-8000-000000000005'::uuid,'thomas.hall88@gmail.com',     '+44 7712 345005','1988-02-17'::date,'Male',  'British',        '24 Mauldeth Road, Withington, Manchester, M20 4PG',    'BLO-005',NULL::date),
    ('22222222-0003-4000-8000-000000000006'::uuid,'claire.ross@outlook.com',     '+44 7712 345006','1990-09-05'::date,'Female','British',        '19 Palatine Road, Didsbury, Manchester, M20 3LZ',      'BLO-006',NULL::date),
    ('22222222-0003-4000-8000-000000000007'::uuid,'mark.ali@gmail.com',          '+44 7712 345007','1987-12-22'::date,'Male',  'British',        '55 Stockport Road, Longsight, Manchester, M13 0LF',    'BLO-007',NULL::date),
    ('22222222-0003-4000-8000-000000000008'::uuid,'zoe.khan@gmail.com',          '+44 7712 345008','1999-04-11'::date,'Female','British',        '37 Plymouth Grove, Victoria Park, Manchester, M13 0AH','BLO-008','2024-05-01'::date),
    ('22222222-0003-4000-8000-000000000009'::uuid,'ben.cox@hotmail.co.uk',       '+44 7712 345009','1991-08-03'::date,'Male',  'British',        '12 Whitworth Street West, Manchester, M1 5WX',         'BLO-009',NULL::date),
    ('22222222-0003-4000-8000-000000000010'::uuid,'nina.wood@gmail.com',         '+44 7712 345010','1996-01-28'::date,'Female','British',        '44 Oxford Road, Chorlton-cum-Hardy, Manchester, M21 9EZ','BLO-010',NULL::date)
) AS v(eid, pe, ph, dob, gen, nat, addr, enum, prob)
WHERE e.id = v.eid;

-- Blossom — recently joined
UPDATE employees SET
    personal_email  = 'leo.price@gmail.com',
    phone           = '+44 7712 345011',
    date_of_birth   = '2001-10-15',
    gender          = 'Male',
    nationality     = 'British',
    address         = '71 Lapwing Lane, West Didsbury, Manchester, M20 2WH',
    employee_number = 'BLO-011',
    probation_end   = (start_date + INTERVAL '3 months')::date
WHERE id = '22222222-0003-4000-8000-000000000011';

-- Thornwood Consulting Group
UPDATE employees e
SET personal_email  = v.pe,
    phone           = v.ph,
    date_of_birth   = v.dob,
    gender          = v.gen,
    nationality     = v.nat,
    address         = v.addr,
    employee_number = v.enum,
    probation_end   = v.prob
FROM (VALUES
    ('33333333-0003-4000-8000-000000000001'::uuid,'patricia.owen@gmail.com',        '+44 7713 456001','1972-04-16'::date,'Female','British',  '5 Cannon Place, City of London, EC4N 6AF',            'THO-001',NULL::date),
    ('33333333-0003-4000-8000-000000000002'::uuid,'richard.hayes.ceo@gmail.com',    '+44 7713 456002','1968-09-30'::date,'Male',  'British',  '18 Cheapside, City of London, EC2V 6AN',              'THO-002',NULL::date),
    ('33333333-0003-4000-8000-000000000003'::uuid,'fiona.grant@gmail.com',           '+44 7713 456003','1974-02-14'::date,'Female','British',  '12 Aldgate High Street, London, EC3N 1AH',            'THO-003',NULL::date),
    ('33333333-0003-4000-8000-000000000004'::uuid,'marcus.bell@outlook.com',         '+44 7713 456004','1971-11-22'::date,'Male',  'British',  '24 Monument Street, City of London, EC3R 8BQ',        'THO-004',NULL::date),
    ('33333333-0003-4000-8000-000000000005'::uuid,'helen.shaw@gmail.com',            '+44 7713 456005','1975-07-08'::date,'Female','British',  '9 Lombard Street, City of London, EC3V 9AA',          'THO-005',NULL::date),
    ('33333333-0003-4000-8000-000000000006'::uuid,'adam.ford.it@gmail.com',          '+44 7713 456006','1981-05-19'::date,'Male',  'British',  '33 Gracechurch Street, City of London, EC3V 0AT',     'THO-006',NULL::date),
    ('33333333-0003-4000-8000-000000000007'::uuid,'claire.hunt@hotmail.co.uk',       '+44 7713 456007','1984-10-07'::date,'Female','British',  '15 Cornhill, City of London, EC3V 3ND',               'THO-007',NULL::date),
    ('33333333-0003-4000-8000-000000000008'::uuid,'paul.green@gmail.com',            '+44 7713 456008','1983-03-25'::date,'Male',  'British',  '41 King William Street, London, EC4R 9AW',            'THO-008',NULL::date),
    ('33333333-0003-4000-8000-000000000009'::uuid,'lisa.west@gmail.com',             '+44 7713 456009','1985-12-03'::date,'Female','British',  '7 Threadneedle Street, London, EC2R 8AY',             'THO-009',NULL::date),
    ('33333333-0003-4000-8000-000000000010'::uuid,'jack.cooper@gmail.com',           '+44 7713 456010','1990-08-14'::date,'Male',  'British',  '28 Bishopsgate, City of London, EC2N 4AJ',            'THO-010',NULL::date),
    ('33333333-0003-4000-8000-000000000011'::uuid,'grace.mills@gmail.com',           '+44 7713 456011','1994-05-27'::date,'Female','British',  '16 Liverpool Street, London, EC2M 7PY',               'THO-011',NULL::date),
    ('33333333-0003-4000-8000-000000000012'::uuid,'ben.reed@outlook.com',            '+44 7713 456012','1998-01-18'::date,'Male',  'British',  '54 Moorgate, London, EC2R 6BJ',                       'THO-012','2023-08-01'::date),
    ('33333333-0003-4000-8000-000000000013'::uuid,'ella.ross@gmail.com',             '+44 7713 456013','1988-07-05'::date,'Female','British',  '3 Gresham Street, London, EC2V 7BX',                  'THO-013',NULL::date),
    ('33333333-0003-4000-8000-000000000014'::uuid,'dan.cole@hotmail.co.uk',          '+44 7713 456014','1993-11-09'::date,'Male',  'British',  '19 Wood Street, London, EC2V 7QA',                    'THO-014',NULL::date),
    ('33333333-0003-4000-8000-000000000015'::uuid,'kate.ward@gmail.com',             '+44 7713 456015','1997-04-23'::date,'Female','British',  '38 London Wall, London, EC2M 5TP',                    'THO-015','2023-12-04'::date),
    ('33333333-0003-4000-8000-000000000016'::uuid,'sam.lane@gmail.com',              '+44 7713 456016','1991-09-11'::date,'Male',  'British',  '22 Basinghall Street, London, EC2V 5DN',              'THO-016',NULL::date),
    ('33333333-0003-4000-8000-000000000017'::uuid,'amy.price@gmail.com',             '+44 7713 456017','1995-02-28'::date,'Female','British',  '47 Coleman Street, London, EC2R 5AN',                 'THO-017',NULL::date),
    ('33333333-0003-4000-8000-000000000018'::uuid,'jake.stone@gmail.com',            '+44 7713 456018','1986-06-17'::date,'Male',  'British',  '9 Lothbury, City of London, EC2R 7HH',                'THO-018',NULL::date),
    ('33333333-0003-4000-8000-000000000019'::uuid,'lucy.ford@gmail.com',             '+44 7713 456019','1991-12-04'::date,'Female','British',  '31 Copthall Avenue, London, EC2R 7DJ',                'THO-019',NULL::date),
    ('33333333-0003-4000-8000-000000000020'::uuid,'ryan.hill@hotmail.co.uk',         '+44 7713 456020','1995-08-21'::date,'Male',  'British',  '13 London Wall, London, EC2M 1PY',                    'THO-020',NULL::date),
    ('33333333-0003-4000-8000-000000000021'::uuid,'anna.dean@gmail.com',             '+44 7713 456021','1987-03-09'::date,'Female','British',  '44 Austin Friars, London, EC2N 2HA',                  'THO-021',NULL::date),
    ('33333333-0003-4000-8000-000000000022'::uuid,'will.cross@gmail.com',            '+44 7713 456022','1994-10-16'::date,'Male',  'British',  '6 Finch Lane, London, EC3V 3NA',                      'THO-022',NULL::date),
    ('33333333-0003-4000-8000-000000000023'::uuid,'meg.hunt@outlook.com',            '+44 7713 456023','1992-07-30'::date,'Female','British',  '25 St Mary Axe, London, EC3A 8BF',                    'THO-023',NULL::date),
    ('33333333-0003-4000-8000-000000000024'::uuid,'chris.bain@gmail.com',            '+44 7713 456024','1996-03-12'::date,'Male',  'British',  '17 Mincing Lane, London, EC3R 7PP',                   'THO-024','2024-02-06'::date),
    ('33333333-0003-4000-8000-000000000025'::uuid,'sara.lowe@gmail.com',             '+44 7713 456025','1999-11-07'::date,'Female','British',  '39 Fenchurch Street, London, EC3M 4DT',               'THO-025','2024-06-11'::date),
    ('33333333-0003-4000-8000-000000000026'::uuid,'joe.wade@hotmail.co.uk',          '+44 7713 456026','1998-06-25'::date,'Male',  'British',  '52 Eastcheap, London, EC3M 1JS',                      'THO-026','2024-10-01'::date)
) AS v(eid, pe, ph, dob, gen, nat, addr, enum, prob)
WHERE e.id = v.eid;

-- Thornwood — recently joined
UPDATE employees SET
    personal_email  = 'beth.king@gmail.com',
    phone           = '+44 7713 456027',
    date_of_birth   = '2001-02-14',
    gender          = 'Female',
    nationality     = 'British',
    address         = '8 Gracechurch Street, London, EC3V 0AT',
    employee_number = 'THO-027',
    probation_end   = (start_date + INTERVAL '3 months')::date
WHERE id = '33333333-0003-4000-8000-000000000027';

UPDATE employees SET
    personal_email  = 'owen.newman@gmail.com',
    phone           = '+44 7713 456028',
    date_of_birth   = '2002-09-03',
    gender          = 'Male',
    nationality     = 'British',
    address         = '14 Lombard Court, London, EC3V 9BE',
    employee_number = 'THO-028',
    probation_end   = (start_date + INTERVAL '3 months')::date
WHERE id = '33333333-0003-4000-8000-000000000028';

END $$;
