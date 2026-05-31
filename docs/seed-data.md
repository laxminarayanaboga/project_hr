# Demo Seed Data

## Purpose

When you start the app locally (or run a demo), three realistic UK companies are automatically seeded into the database. Every Phase 1 + Phase 2 feature — employees, org chart, leave requests, attendance, overtime, leave balances — has populated data from the moment you log in. No manual setup required.

The seed is a Flyway **repeatable migration** (`R__demo_seed_data.sql`) placed under `db/migration/dev/`. Docker Compose mounts that directory so the seed runs automatically on every fresh database.

---

## How to Load

```bash
docker compose down -v                  # wipe the volume
docker compose build --no-cache        # rebuild images
docker compose up -d                    # start everything
```

The backend prints a credential banner at startup confirming the seed loaded:

```
╔══════════════════════════════════════════════════════════════════╗
║            DEMO SEED DATA LOADED — DEV PROFILE                  ║
╠══════════════════════════════════════════════════════════════════╣
║  Pinnacle Digital Ltd     admin@pinnacle-digital.co.uk          ║
║  Blossom Care Services    admin@blossomcare.co.uk               ║
║  Thornwood Consulting     admin@thornwood-consulting.co.uk       ║
║  Password (all accounts): Demo1234!                             ║
║  Mailpit web UI:          http://localhost:8025                  ║
╚══════════════════════════════════════════════════════════════════╝
```

## How to Reset

```bash
docker compose down -v && docker compose up -d
```

---

## Testing Emails

Leave notifications are caught by **Mailpit** — check http://localhost:8025.

> **Important:** Log in as a regular employee (e.g. Liam Harris), not the HR Admin.
> The HR Admin has no manager, so there is nobody to notify when she submits leave.

Quick test flow:
1. Log in as `liam.harris@pinnacle-digital.co.uk` / `Demo1234!`
2. Submit a leave request
3. Open http://localhost:8025 — "Leave request from Liam Harris" appears in Rachel Chen's inbox

---

## Login Credentials — All Accounts

**Password for every account: `Demo1234!`**

---

### Pinnacle Digital Ltd

#### HR Admin & Managers

| Email | Name | Role | Reports to |
|---|---|---|---|
| `admin@pinnacle-digital.co.uk` | Sarah Mitchell | HR Admin | — |
| `james.thornton@pinnacle-digital.co.uk` | James Thornton | Manager — CTO | — |
| `rachel.chen@pinnacle-digital.co.uk` | Rachel Chen | Manager — Backend Lead | James Thornton |
| `dan.patel@pinnacle-digital.co.uk` | Dan Patel | Manager — Frontend Lead | James Thornton |
| `sophie.walker@pinnacle-digital.co.uk` | Sophie Walker | Manager — QA Lead | James Thornton |
| `alex.morgan@pinnacle-digital.co.uk` | Alex Morgan | Manager — Design Lead | — |

#### Employees

| Email | Name | Job Title | Manager |
|---|---|---|---|
| `liam.harris@pinnacle-digital.co.uk` | Liam Harris | Senior Backend Developer | Rachel Chen |
| `emma.wilson@pinnacle-digital.co.uk` | Emma Wilson | Backend Developer | Rachel Chen |
| `noah.jones@pinnacle-digital.co.uk` | Noah Jones | Junior Backend Developer | Rachel Chen |
| `amelia.king@pinnacle-digital.co.uk` | Amelia King | Junior Backend Developer *(recent)* | Rachel Chen |
| `tom.newman@pinnacle-digital.co.uk` | Tom Newman | Contractor Backend Dev | Rachel Chen |
| `olivia.brown@pinnacle-digital.co.uk` | Olivia Brown | Senior Frontend Developer | Dan Patel |
| `william.taylor@pinnacle-digital.co.uk` | William Taylor | Frontend Developer | Dan Patel |
| `ava.anderson@pinnacle-digital.co.uk` | Ava Anderson | Junior Frontend Developer | Dan Patel |
| `henry.wright@pinnacle-digital.co.uk` | Henry Wright | Frontend Developer *(recent)* | Dan Patel |
| `james.white@pinnacle-digital.co.uk` | James White | Senior QA Engineer | Sophie Walker |
| `isabella.martin@pinnacle-digital.co.uk` | Isabella Martin | QA Engineer | Sophie Walker |
| `harper.scott@pinnacle-digital.co.uk` | Harper Scott | QA Analyst | Sophie Walker |
| `oliver.thomas@pinnacle-digital.co.uk` | Oliver Thomas | Senior UI/UX Designer | Alex Morgan |
| `mia.jackson@pinnacle-digital.co.uk` | Mia Jackson | UI/UX Designer | Alex Morgan |
| `elijah.lee@pinnacle-digital.co.uk` | Elijah Lee | Sales Manager | Sarah Mitchell |
| `charlotte.hall@pinnacle-digital.co.uk` | Charlotte Hall | Marketing Specialist | Sarah Mitchell |
| `lucas.young@pinnacle-digital.co.uk` | Lucas Young | Operations Coordinator | Sarah Mitchell |

---

### Blossom Care Services

#### HR Admin & Managers

| Email | Name | Role | Reports to |
|---|---|---|---|
| `admin@blossomcare.co.uk` | Sandra Blake | HR Admin | — |
| `diane.foster@blossomcare.co.uk` | Diane Foster | Manager — Care Team | — |
| `kevin.nash@blossomcare.co.uk` | Kevin Nash | Manager — Admin | — |

#### Employees

| Email | Name | Job Title | Manager |
|---|---|---|---|
| `priya.sharma@blossomcare.co.uk` | Priya Sharma | Senior Carer | Diane Foster |
| `tom.hall@blossomcare.co.uk` | Tom Hall | Carer *(part-time)* | Diane Foster |
| `claire.ross@blossomcare.co.uk` | Claire Ross | Carer | Diane Foster |
| `mark.ali@blossomcare.co.uk` | Mark Ali | Bank Staff Carer *(contract)* | Diane Foster |
| `zoe.khan@blossomcare.co.uk` | Zoe Khan | Junior Carer | Diane Foster |
| `leo.price@blossomcare.co.uk` | Leo Price | Junior Carer *(recent)* | Diane Foster |
| `ben.cox@blossomcare.co.uk` | Ben Cox | Admin Coordinator | Kevin Nash |
| `nina.wood@blossomcare.co.uk` | Nina Wood | Receptionist *(part-time)* | Kevin Nash |

---

### Thornwood Consulting Group

#### HR Admin, CEO & Directors

| Email | Name | Role | Reports to |
|---|---|---|---|
| `admin@thornwood-consulting.co.uk` | Patricia Owen | HR Admin | — |
| `richard.hayes@thornwood-consulting.co.uk` | Richard Hayes | Manager — CEO | — |
| `fiona.grant@thornwood-consulting.co.uk` | Fiona Grant | Manager — Director of Strategy | Richard Hayes |
| `marcus.bell@thornwood-consulting.co.uk` | Marcus Bell | Manager — Finance Director | Richard Hayes |
| `helen.shaw@thornwood-consulting.co.uk` | Helen Shaw | Manager — Director of Client Svcs | Richard Hayes |
| `adam.ford@thornwood-consulting.co.uk` | Adam Ford | Manager — IT Manager | Richard Hayes |
| `claire.hunt@thornwood-consulting.co.uk` | Claire Hunt | Manager — Strategy Manager | Fiona Grant |
| `paul.green@thornwood-consulting.co.uk` | Paul Green | Manager — Delivery Manager | Helen Shaw |
| `lisa.west@thornwood-consulting.co.uk` | Lisa West | Manager — BD Manager | Helen Shaw |

#### Employees

| Email | Name | Job Title | Manager |
|---|---|---|---|
| `jack.cooper@thornwood-consulting.co.uk` | Jack Cooper | Senior Consultant | Claire Hunt |
| `grace.mills@thornwood-consulting.co.uk` | Grace Mills | Consultant | Claire Hunt |
| `ben.reed@thornwood-consulting.co.uk` | Ben Reed | Junior Consultant | Claire Hunt |
| `chris.bain@thornwood-consulting.co.uk` | Chris Bain | Consultant | Claire Hunt |
| `ella.ross@thornwood-consulting.co.uk` | Ella Ross | Senior Accountant | Marcus Bell |
| `dan.cole@thornwood-consulting.co.uk` | Dan Cole | Accountant | Marcus Bell |
| `kate.ward@thornwood-consulting.co.uk` | Kate Ward | Finance Analyst | Marcus Bell |
| `beth.king@thornwood-consulting.co.uk` | Beth King | Junior Accountant *(recent)* | Marcus Bell |
| `sam.lane@thornwood-consulting.co.uk` | Sam Lane | Systems Engineer | Adam Ford |
| `amy.price@thornwood-consulting.co.uk` | Amy Price | IT Support Specialist | Adam Ford |
| `owen.newman@thornwood-consulting.co.uk` | Owen Newman | IT Graduate *(recent)* | Adam Ford |
| `jake.stone@thornwood-consulting.co.uk` | Jake Stone | Senior Delivery Consultant | Paul Green |
| `lucy.ford@thornwood-consulting.co.uk` | Lucy Ford | Delivery Consultant | Paul Green |
| `ryan.hill@thornwood-consulting.co.uk` | Ryan Hill | Delivery Analyst | Paul Green |
| `sara.lowe@thornwood-consulting.co.uk` | Sara Lowe | Junior Consultant | Paul Green |
| `anna.dean@thornwood-consulting.co.uk` | Anna Dean | Senior BD Executive | Lisa West |
| `will.cross@thornwood-consulting.co.uk` | Will Cross | BD Executive | Lisa West |
| `joe.wade@thornwood-consulting.co.uk` | Joe Wade | BD Analyst | Lisa West |
| `meg.hunt@thornwood-consulting.co.uk` | Meg Hunt | HR Business Partner | Patricia Owen |

---

## Company Data Highlights

### Pinnacle Digital Ltd — 23 employees (UK tech agency)

| | |
|---|---|
| **Departments** | Technology (→ Backend Engineering, Frontend Engineering, QA & Testing), Design, Sales & Marketing, Operations |
| **Manager chain** | CTO → Backend/Frontend/QA leads → engineers |
| **Recently joined** | Amelia King (2 weeks ago), Henry Wright (1 week ago) — both in probation |
| **Leave states** | 1 currently on leave, 3 pending approval, 2 approved future, 1 rejected, 1 cancelled |
| **Attendance** | 15 days of clock-in/out history per employee; 3 active sessions (no clock-out yet) |
| **Overtime** | 5 records — APPROVED, PENDING, REJECTED |

### Blossom Care Services — 12 employees (UK social care SMB)

| | |
|---|---|
| **Departments** | Care Team, Administration, Management |
| **Structure** | Flat — mix of full-time, part-time, bank/contract staff |
| **Recently joined** | Leo Price (10 days ago) — in probation |
| **Leave states** | 1 currently on leave, 3 pending approval, 1 approved future, 1 rejected, 1 cancelled |
| **Attendance** | 15 days per employee; 3 active sessions |
| **Overtime** | 5 records |

### Thornwood Consulting Group — 28 employees (UK management consulting)

| | |
|---|---|
| **Departments** | Executive, Strategy & Advisory, Finance & Accounting, Human Resources, IT & Systems, Client Services (→ Delivery, Business Development) |
| **Manager chain** | CEO → Directors → Managers → Associates (4 levels) |
| **Recently joined** | Beth King (finance, ~3 weeks ago), Owen Newman (IT grad, ~1 week ago) |
| **Leave states** | 2 currently on leave, 5 pending approval, 3 approved future, 1 rejected, 1 cancelled |
| **Attendance** | 15 days per employee; 3 active sessions |
| **Overtime** | 8 records — mix of APPROVED, PENDING, REJECTED |

---

## Extending the Seed

Edit `backend/src/main/resources/db/migration/dev/R__demo_seed_data.sql`. On the next `docker compose up`, Flyway detects the checksum change and re-runs the file automatically.

All inserts use `ON CONFLICT (id) DO NOTHING` — re-running on an existing volume is safe and produces no duplicates.

---

## Profile Isolation

The seed file lives in `db/migration/dev/`. Flyway scans this directory recursively when mounting `./backend/src/main/resources/db/migration`. Production and CI environments do not mount the `dev/` directory, so seed data never reaches staging or production.
