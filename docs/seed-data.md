# Demo Seed Data

## Purpose

When you start the app locally (or run a demo), three realistic UK companies are automatically seeded into the database. Every Phase 1 + Phase 2 feature — employees, org chart, leave requests, attendance, overtime, leave balances — has populated data from the moment you log in. No manual setup required.

The seed is a Flyway **repeatable migration** (`R__demo_seed_data.sql`) placed under `db/migration/dev/`. Docker Compose configures Flyway to scan that extra directory, so the seed runs automatically on every fresh database.

---

## How to Load

Start the stack from scratch:

```bash
docker compose down -v                         # wipe the volume
docker compose build --no-cache               # rebuild images
docker compose up -d                           # start everything
```

Flyway runs automatically and applies the seed. The backend logs a credential banner at startup:

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

---

## How to Reset

```bash
docker compose down -v && docker compose up -d
```

This wipes the PostgreSQL volume and re-applies all migrations from scratch, producing identical data.

---

## Login Credentials

| Company | HR Admin Email | Password |
|---|---|---|
| Pinnacle Digital Ltd | `admin@pinnacle-digital.co.uk` | `Demo1234!` |
| Blossom Care Services | `admin@blossomcare.co.uk` | `Demo1234!` |
| Thornwood Consulting Group | `admin@thornwood-consulting.co.uk` | `Demo1234!` |

Individual employee logins follow `firstname.lastname@company-domain.co.uk` — all with password `Demo1234!`. See the seed SQL for the full list.

---

## Company Summaries

### Pinnacle Digital Ltd — 23 employees (UK tech agency)

| Feature | Highlights |
|---|---|
| **Departments** | Technology (→ Backend, Frontend, QA), Design, Sales & Marketing, Operations |
| **Employees** | 23 active + 1 terminated; mix of senior/junior engineers, designers, sales |
| **Manager hierarchy** | CTO → Backend/Frontend/QA leads → engineers |
| **Recently joined** | 2 employees in last 30 days (shows onboarding context) |
| **Leave** | 1 currently on leave, 3 pending approval, 2 approved future, 1 rejected, 1 cancelled |
| **Attendance** | 15 days of history per employee; 3 clocked in today without clock-out |
| **Overtime** | 5 records — mix of APPROVED, PENDING, REJECTED |

### Blossom Care Services — 12 employees (UK social care SMB)

| Feature | Highlights |
|---|---|
| **Departments** | Care Team, Administration, Management |
| **Employees** | Flat structure; mix of full-time, part-time, bank staff (CONTRACT); 1 recently joined |
| **Leave** | 1 currently on leave, 3 pending approval, 1 approved future, 1 rejected, 1 cancelled |
| **Attendance** | 15 days per employee; 3 clocked in today |
| **Overtime** | 5 records — mix of APPROVED, PENDING, REJECTED |

### Thornwood Consulting Group — 28 employees (UK management consulting)

| Feature | Highlights |
|---|---|
| **Departments** | Executive, Strategy & Advisory, Finance & Accounting, HR, IT & Systems, Client Services (→ Delivery, Business Development) |
| **Employees** | 4-level hierarchy: CEO → Directors → Managers → Associates; 2 recently joined |
| **Leave** | 2 currently on leave, 5 pending approval, 3 approved future, 1 rejected, 1 cancelled |
| **Attendance** | 15 days per employee; 3 clocked in today |
| **Overtime** | 8 records — mix of APPROVED, PENDING, REJECTED |

---

## Extending the Seed

Edit `backend/src/main/resources/db/migration/dev/R__demo_seed_data.sql`. On the next `docker compose up`, Flyway detects the checksum change and re-runs the file automatically.

All inserts are guarded with `WHERE NOT EXISTS (...)` so re-running on an existing volume (without `-v`) is safe — it only adds missing rows, never duplicates.

---

## Profile Isolation

The seed file lives in `db/migration/dev/`. Docker Compose configures Flyway with:

```
FLYWAY_LOCATIONS=filesystem:/flyway/sql,filesystem:/flyway/sql/dev
```

The production Docker image and CI test environments do **not** mount the `dev/` directory, so seed data never reaches staging or production.
