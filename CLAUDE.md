# CLAUDE.md — HR App Project Context
> Drop this file in the root of your monorepo before starting Claude Code.
> Claude Code reads this automatically at startup — no need to explain anything from scratch.

---

## What We're Building

A modern, full-featured HR SaaS platform — inspired by SageHR. Targeting UK market first, all company sizes (SMB to Enterprise), available on web and mobile.

This file gives Claude Code full context so we can start coding immediately.

---

## All Decisions Made — Do Not Re-ask

| Area | Decision |
|---|---|
| **Repo structure** | Single monorepo (backend/ frontend/ mobile/ infrastructure/) |
| **Backend** | Spring Boot 4.0.6 (Java 25) |
| **Frontend** | React |
| **Mobile** | React Native 0.79 (iOS & Android) |
| **Database** | PostgreSQL |
| **Cloud** | AWS only |
| **Infrastructure** | Terraform 1.15.3 — `terraform apply` spins everything up, `terraform destroy` tears it all down |
| **Auth (Phase 1)** | Email + password, JWT. Spring Security abstracted for OAuth2/SSO later |
| **Multi-tenancy** | Shared DB, shared schema — `company_id` on every table, filtered via Spring interceptor |
| **Payroll compliance** | UK-first (PAYE, NI, HMRC RTI) |
| **Pricing** | Per employee/month — Starter £3, Growth £6, Enterprise custom |
| **Integrations** | None at launch — Phase 7 |
| **Custom fields** | Deliberately excluded — model everything as proper domain columns |
| **Team size** | Solo developer |

---

## Branch Strategy — Mandatory

> GitHub Pro is not active (personal account). Branch protection cannot be technically enforced on the private repo.
> This is therefore a **hard convention rule** — Claude must follow it without exception.

### The rule
- **`main` is always stable.** No direct pushes to main — ever. The only exception was the initial project setup commits.
- **Every story gets its own branch**, created from the latest `main`.
- **Claude opens a PR** when the story is complete and all tests pass.
- **Only the human (you) merges the PR.** Claude never merges.

### Branch naming
```
issue/{number}/{short-kebab-description}

Examples:
  issue/5/company-registration
  issue/6/user-login-jwt
  issue/10/department-crud
  issue/12/create-employee-profile
```

### Workflow Claude follows for every story
```
1. git checkout main && git pull origin main
2. git checkout -b issue/{n}/{description}
3. Write code + tests (all tests must pass locally before PR)
4. git push origin issue/{n}/{description}
5. gh pr create --title "[Issue #{n}] Title" --body "..."
6. STOP — wait for human to review and merge
```

### PR description template Claude uses
```
## Summary
- What was built (2–3 bullets)

## Testing
- How to verify locally (docker-compose up, then...)
- Unit tests: mvn test or npm test
- E2E tests (if applicable): cd e2e && npm run test:api

## Related
Closes #{issue-number}
```

### GitHub Actions
Auto-triggers are **disabled** on both workflows (personal account — avoid billing).
Workflows exist as skeletons only. Re-enable `push`/`pull_request` triggers when
wiring up staging deploy.

---

## Story Execution Playbook

> This applies to every single user story — all 75 of them.
> Claude follows this without being told. No need to repeat it.

### Trigger
The human says one of:
- "pick up issue #N"
- "start the next story"
- "let's do issue #N"

Claude reads `docs/PROGRESS.md`, identifies the story, reads the GitHub issue, and begins. No asking "shall I start?" — just start.

---

### Step 1 — Understand the story
- Read the GitHub issue: description, acceptance criteria, sub-tasks, testing requirements
- Identify what layers are touched: DB migration? backend service/controller? frontend page/component? E2E tests?
- If anything in the acceptance criteria is ambiguous, ask **one focused question** before branching. Otherwise proceed.

---

### Step 2 — Create the branch
```bash
git checkout main
git pull origin main
git checkout -b issue/{n}/{short-kebab-description}
```

---

### Step 3 — Announce the plan (brief)
Tell the user in 3–5 bullet points what will be built before writing a single line of code. Example:

> **Starting Issue #5 — Company Registration**
> - Flyway migrations V1 (companies) + V2 (users) — already exist, skipping
> - `AuthService.register()` — creates company + HR_ADMIN user, returns JWT pair
> - `AuthController` — POST /api/v1/auth/register with validation
> - Welcome email logged locally (SES deferred)
> - Unit tests: AuthServiceTest, AuthControllerTest
> - E2E: auth.api.spec.ts (register happy path + duplicate/validation errors)

No waiting for approval on this — it's informational. Proceed immediately after posting it.

---

### Step 4 — Build in this order
Always build in this sequence within a story (skip layers that aren't relevant):

1. **Flyway migration** — if new tables or columns needed
2. **Entity + Repository** — JPA entity, Spring Data repository
3. **Service layer** — business logic, tenant scoping, exception throwing
4. **Controller layer** — REST endpoints, request/response DTOs, validation
5. **Frontend** — API client method, page/component, form validation
6. **Unit tests** — service test (Mockito), controller test (MockMvc), component test (Vitest)
7. **E2E tests** — Playwright API spec + UI spec

---

### Step 5 — Test, fix, repeat
```bash
# Backend
cd backend && mvn test

# Frontend
cd frontend && npm test

# E2E API tests (docker-compose must be up)
cd e2e && npm run test:api

# E2E UI tests (both docker-compose and npm run dev must be up)
cd e2e && npm run test:ui
```

Fix any failures. Re-run. Do not raise a PR until all tests are green.
If a test reveals a real bug in the implementation — fix the implementation, not the test.

---

### Step 6 — Pre-PR checklist
Before raising the PR, verify:
- [ ] All backend unit tests pass (`mvn test`)
- [ ] All frontend unit tests pass (`npm test` in `frontend/`)
- [ ] Playwright API tests pass (`npm run test:api` in `e2e/`)
- [ ] No hardcoded secrets, no TODO/FIXME left behind
- [ ] Every new DB table has `company_id` and is indexed on it
- [ ] Every service method scopes queries to `TenantContext.getCurrentCompany()`
- [ ] Soft deletes used where applicable (employees)
- [ ] `docs/PROGRESS.md` updated — story marked `🔄 In Progress` (done before coding, `✅ Done` after PR is raised)
- [ ] Sub-tasks in the GitHub issue ticked off

---

### Step 7 — Write the user summary
Post this to the chat **before** raising the PR. This is what the human reads to understand what was built.

```
## Issue #{n} — {Story Title} — Complete

### What was built
- {bullet: key backend thing}
- {bullet: key frontend thing}
- {bullet: tests written}

### How to test locally
1. docker-compose up
2. cd frontend && npm run dev
3. {specific action: e.g. "go to /register, fill in the form, submit"}
4. {what to expect: e.g. "you should be redirected to /dashboard"}

### API (quick test with curl or Postman)
POST http://localhost:8080/api/v1/{endpoint}
{example request body}

### Notable decisions
- {anything non-obvious: a trade-off made, a constraint hit, something deferred}

### PR
{link — posted right after this summary}
```

---

### Step 8 — Raise the PR
```bash
git push origin issue/{n}/{description}

gh pr create \
  --title "[Issue #{n}] {Story title}" \
  --body "..." \
  --base main
```

PR body must include:
- Summary bullets (same as user summary above)
- How to test locally
- `Closes #{n}` so GitHub auto-closes the issue on merge

---

### Step 9 — Stop
PR is raised. Post the PR link to the chat. **Do not merge. Do not touch main.**
Wait for the human to review and merge.

Once merged, update `docs/PROGRESS.md` — mark the story `✅ Done`.

---

### What to do if blocked
If something genuinely can't be resolved without a human decision (e.g. a product ambiguity, a dependency on something not yet built), post a clear blocker message:

```
**Blocked on Issue #{n}**
Reason: {one sentence}
Decision needed: {specific question with 2–3 options if possible}
Everything else is done — this is the only thing holding up the PR.
```

Do not raise a half-finished PR. Either finish it or describe the blocker clearly.

---

## Monorepo Structure

```
hrapp/
├── backend/                → Spring Boot (Java)
├── frontend/               → React (Web)
├── mobile/                 → React Native
├── infrastructure/         → Terraform (AWS)
├── docker-compose.yml      → Local dev
├── .github/workflows/      → CI/CD (GitHub Actions)
├── CLAUDE.md               ← You are here
└── README.md
```

---

## Phased Roadmap

| Phase | Focus | Timeline |
|---|---|---|
| **Phase 1** ← We are here | Foundation + Employee Management | Months 1–3 |
| Phase 2 | Leave & Attendance | Months 3–5 |
| Phase 3 | Mobile App | Months 5–7 |
| Phase 4 | Performance Reviews | Months 7–9 |
| Phase 5 | Recruitment / ATS | Months 9–11 |
| Phase 6 | Payroll (UK) | Months 11–13 |
| Phase 7 | Integrations & Scale | Months 13–15 |

---

## Phase 1 — What We're Building Now

### Goal
Working app: company registration, employee management, document storage, role-based access, dashboard.

### Database Tables (Phase 1)
- `companies` — tenant root
- `users` — login accounts with roles
- `departments` — nested via parent_id
- `employees` — full profile, links to user/dept/manager
- `documents` — metadata only; files stored in AWS S3

### User Roles
- `SUPER_ADMIN` — platform level
- `HR_ADMIN` — full company access
- `MANAGER` — team access
- `EMPLOYEE` — self-service only

### API Base URL
```
Local:  http://localhost:8080/api/v1
Prod:   https://api.yourdomain.com/api/v1
```

### Auth Flow
- POST `/api/v1/auth/register` — creates company + HR_ADMIN user
- POST `/api/v1/auth/login` — returns access token (1hr) + refresh token (7 days)
- All protected routes: `Authorization: Bearer <token>`

### Standard API Response
```json
{ "success": true, "data": {}, "message": "...", "timestamp": "..." }
{ "success": false, "error": "ERROR_CODE", "message": "...", "timestamp": "..." }
```

---

## Phase 1 Build Order

Follow this — always have something runnable:

```
Week 1–2:   Monorepo setup, Docker Compose, Terraform skeleton, GitHub Actions CI/CD
Week 3–4:   Auth (register, login, JWT, roles, password reset)
Week 5–6:   Company profile + Department management
Week 7–9:   Employee CRUD (create, list, view, edit, deactivate)
Week 10–11: Document upload (S3, pre-signed URLs)
Week 12:    Dashboard stats + polish + staging deploy
```

---

## Key Backend Dependencies (Spring Boot)

```xml
spring-boot-starter-web
spring-boot-starter-data-jpa
spring-boot-starter-security
spring-boot-starter-validation
spring-boot-starter-mail
postgresql
flyway-core
jjwt-api / jjwt-impl / jjwt-jackson
aws-java-sdk-s3
spring-cloud-starter-aws
lombok
mapstruct
```

## Key Frontend Dependencies (React)

```
react, react-router-dom, axios
@tanstack/react-query
react-hook-form, zod
tailwindcss, lucide-react, @headlessui/react
```

---

## AWS Infrastructure (Terraform-managed)

```
CloudFront → S3 (React static)
ALB → ECS Fargate (Spring Boot)
RDS PostgreSQL (db.t3.micro)
S3 private bucket (documents)
SES (email)
Secrets Manager (DB creds, JWT secret)
CloudWatch (logs)
```

Local dev runs via `docker-compose up` — no AWS needed for development.

---

## Important Engineering Rules

1. **Never edit the DB manually** — always use Flyway migrations
2. **Never hardcode secrets** — AWS Secrets Manager only (prod); .env.example for local
3. **Every query must be scoped to company_id** — multi-tenancy is non-negotiable
4. **Documents never served directly from S3** — always pre-signed URLs (15-min expiry)
5. **Soft delete employees** — set `employment_status = TERMINATED`, never hard delete
6. **No custom_fields table** — model domain concepts as real columns

---

## Testing Standards — Non-Negotiable

A user story is **not done** until all of these pass:

### Backend (per story)
- **Service layer**: JUnit 5 + Mockito — happy path, edge cases, error paths
- **Controller layer**: `@WebMvcTest` + MockMvc — all endpoints, auth enforcement, validation
- **Repository**: `@DataJpaTest` — custom queries and Specifications only (not for generated methods)
- Run with: `mvn test`

### Frontend (per component/page)
- **Component tests**: Vitest + React Testing Library — renders, user events, error states
- Run with: `npm test` inside `frontend/`

### E2E — added once page + API + DB are complete for a story
- **API tests**: Playwright `request` fixture — no browser, pure HTTP. Happy path + key error cases.
- **UI tests**: Playwright page automation — full user journey from login to action to assertion.
- Run with: `npm test` inside `e2e/`
- API tests only: `npm run test:api`
- UI tests only: `npm run test:ui`

### Test file naming conventions
| Layer | Pattern | Example |
|---|---|---|
| Backend service | `*ServiceTest.java` | `AuthServiceTest.java` |
| Backend controller | `*ControllerTest.java` | `AuthControllerTest.java` |
| Frontend component | `*.test.jsx` | `LoginPage.test.jsx` |
| Playwright API | `*.api.spec.ts` | `auth.api.spec.ts` |
| Playwright UI | `*.spec.ts` | `login.spec.ts` |

---

## What Is Deferred (Do NOT implement yet)

| Area | Reason |
|---|---|
| **AWS / Terraform / CI-CD** | Personal AWS account — minimise billing. Implement when ready to deploy to staging. |
| **GitHub Actions workflows** | Exist as skeletons only. Do not wire up or run. |
| **SES email sending** | Local dev uses logs only. Wire up SES when deploying to staging. |
| **S3 document storage** | Local dev uses local filesystem or mock. Wire up S3 when deploying to staging. |

**For local development**: `docker-compose up` is the only infrastructure needed.

---

## Where We Are Now

Monorepo scaffolded. Phase 1 coding in progress.

- `docker-compose up` → PostgreSQL + Spring Boot running locally
- `cd frontend && npm run dev` → React app at http://localhost:5173
- `cd e2e && npm test` → Playwright tests (API + UI)
- All 75 GitHub issues created across 7 phases with testing requirements on each

---

*Generated from planning session — May 2026*

---

## Verified Tech Versions (May 2026)

| Tool | Version | Notes |
|---|---|---|
| **Java** | 25 LTS | Latest LTS (Sept 2025). Min required by Spring Boot 4 |
| **Spring Boot** | 4.0.6 | Built on Spring Framework 7. New projects use Boot 4 |
| **React** | 19.2.6 | Latest stable |
| **React Native** | 0.79 | Latest stable |
| **Node.js** | 24 LTS | Active LTS — Node 26 is Current, not LTS until Oct 2026 |
| **PostgreSQL** | 17 | Latest stable |
| **Terraform** | 1.15.3 | Latest stable |
| **AWS Provider** | ~> 6.0 | Latest Terraform AWS provider |
| **Docker** | Latest | Always use latest stable |

