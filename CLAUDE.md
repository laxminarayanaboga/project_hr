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

### The rule — simple

| Type of work | Branch? | PR? |
|---|---|---|
| **User story** (feature code, tests) | ✅ Yes — `issue/{n}/{desc}` | ✅ Yes — human merges |
| **Everything else** (docs, CLAUDE.md, scripts, config, tooling) | ❌ No | ❌ No — push straight to main |

The PR gate exists to protect working code from breaking. Docs and config changes don't need it.

### Branch naming (user stories only)
```
issue/{number}/{short-kebab-description}

Examples:
  issue/5/company-registration
  issue/6/user-login-jwt
  issue/10/department-crud
  issue/12/create-employee-profile
```

### Workflow for a user story
```
1. git checkout main && git pull origin main
2. git checkout -b issue/{n}/{description}
3. Write code + tests (all must pass locally before PR)
4. git push origin issue/{n}/{description}
5. gh pr create --title "[Issue #{n}] Title" --body "..."
6. STOP — wait for human to review and merge
```

### PR description template
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
- Read the GitHub issue fully: description, acceptance criteria, sub-tasks, testing requirements
- Identify what layers are touched: DB migration? backend service/controller? frontend page/component? E2E tests?
- Identify anything genuinely unclear before writing a single line of code

---

### Step 2 — Clarification round (ALWAYS before branching)

The human may not be at the keyboard — questions must be asked **all at once, upfront**, so coding can run uninterrupted once answered.

**After reading the issue, ask yourself:**
- Is there a product decision not already covered in CLAUDE.md?
- Is there an edge case with multiple valid approaches?
- Is there missing information that would block completion?
- Is there a dependency on something not yet built?

**If YES to any — post all questions in one numbered list, then wait:**
```
**Issue #{n} — {Title} — Questions before I start**

1. {Question} — options: A) ... B) ...
2. {Question}
3. {Question}

I won't branch or write any code until these are answered.
```

**If NO questions — skip this step entirely.** Do not ask "any questions?" as a formality. Do not ask "shall I proceed?" Just move to Step 3.

**What counts as a valid question:**
- Product/UX decisions not already decided (e.g. "when an employee is deactivated, should pending leave requests be auto-rejected or left pending?")
- Ambiguous acceptance criteria with multiple valid interpretations
- A genuine dependency gap (e.g. "this story links to departments, but department CRUD isn't built yet — should I stub it or build departments first?")

**What does NOT count:**
- Anything already decided in CLAUDE.md (tech stack, patterns, deferred items)
- Standard implementation choices — pick the appropriate pattern from existing code
- "Shall I proceed?" / "Is this okay?" — never ask these

---

### Step 3 — Create the branch
```bash
git checkout main
git pull origin main
git checkout -b issue/{n}/{short-kebab-description}
```

---

### Step 4 — Announce the plan (brief)
Tell the user in 3–5 bullet points what will be built. Informational only — do not wait for approval, proceed immediately.

> **Starting Issue #5 — Company Registration**
> - Flyway migrations V1 + V2 already exist — skipping
> - `AuthService.register()` — creates company + HR_ADMIN user, returns JWT pair
> - `AuthController` — POST /api/v1/auth/register with validation
> - Welcome email: logged locally (SES deferred until staging)
> - Tests: AuthServiceTest (Mockito), AuthControllerTest (MockMvc), auth.api.spec.ts (Playwright)

---

### Step 5 — Build in this order
Always build in this sequence within a story (skip layers that aren't relevant):

1. **Flyway migration** — if new tables or columns needed
2. **Entity + Repository** — JPA entity, Spring Data repository
3. **Service layer** — business logic, tenant scoping, exception throwing
4. **Controller layer** — REST endpoints, request/response DTOs, validation
5. **Frontend** — API client method, page/component, form validation
6. **Unit tests** — service test (Mockito), controller test (MockMvc), component test (Vitest)
7. **E2E tests** — Playwright API spec + UI spec

---

### Step 6 — Test, fix, repeat

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

Fix failures. Re-run. Do not raise a PR until all tests are green.

**When tests fail — diagnose first, then fix correctly:**

| Situation | Correct action |
|---|---|
| Test fails because implementation logic is wrong | Fix the implementation |
| Test asserts the wrong thing (wrong status code, wrong field name) | Fix the test |
| Test is genuinely flaky (timing, async) | Fix the test setup |
| Test is no longer relevant after a design change | Delete the test AND document why |

**Never do this:**
- ❌ Delete a failing test just to make the suite go green
- ❌ Add special-case `if (test)` logic to production code to satisfy a test
- ❌ Change an expected value in a test to match wrong output without understanding why
- ❌ `@Disabled` / `test.skip` a failing test without a comment explaining the plan

If tests are failing and the cause is genuinely unclear after honest investigation — raise a blocker (see below), not a workaround.

---

### Step 7 — Pre-PR checklist
Before raising the PR, verify:
- [ ] All backend unit tests pass (`mvn test`)
- [ ] All frontend unit tests pass (`npm test` in `frontend/`)
- [ ] Playwright API tests pass (`npm run test:api` in `e2e/`)
- [ ] No hardcoded secrets, no TODO/FIXME left behind
- [ ] Every new DB table has `company_id` and is indexed on it
- [ ] Every service method scopes queries to `TenantContext.getCurrentCompany()`
- [ ] Soft deletes used where applicable (employees)
- [ ] `docs/PROGRESS.md` updated — story marked `🔄 In Progress` before coding, `✅ Done` after PR raised
- [ ] Sub-tasks in the GitHub issue ticked off

---

### Step 8 — Write the user summary
Post this to the chat **before** raising the PR.

```
## Issue #{n} — {Story Title} — Complete

### What was built
- {bullet: key backend thing}
- {bullet: key frontend thing}
- {bullet: tests written}

### How to test locally
1. docker-compose up
2. cd frontend && npm run dev
3. {specific action — e.g. "go to /register, fill the form, submit"}
4. {what to expect — e.g. "redirected to /dashboard"}

### API
POST http://localhost:8080/api/v1/{endpoint}
{example request body}

### Notable decisions
- {anything non-obvious: trade-off made, constraint hit, something deferred}

### PR
{link — raised right after this}
```

---

### Step 9 — Raise the PR
```bash
git push origin issue/{n}/{description}

gh pr create \
  --title "[Issue #{n}] {Story title}" \
  --body "..." \
  --base main
```

PR body: summary bullets, how to test, `Closes #{n}`.

---

### Step 10 — Stop
PR is raised. Post the PR link. **Do not merge. Do not touch main.**
Wait for the human to review and merge. Once merged, mark `✅ Done` in `docs/PROGRESS.md`.

---

### Mid-story: when to ask the human

The goal is to run Steps 3–10 without interrupting the human. But sometimes something genuinely unexpected comes up mid-story — a product decision that wasn't foreseeable from the issue, a discovered dependency gap, or a design constraint that changes the approach.

**It is okay to ask mid-story. Keep it to a minimum and make it count.**

When asking:
- Post one clear message with the specific question — not a stream of "quick questions"
- Include what you've tried or what the options are
- Keep going on the parts of the story that don't depend on the answer

Format:
```
**Needs your input — Issue #{n}**
Context: {one sentence on what you hit}
Question: {specific question}
Options: A) ... B) ...
Continuing with: {what I'm doing while you respond}
```

---

### Blockers (can't continue without human input)
If something genuinely blocks all further progress:

```
**Blocked — Issue #{n}**
Reason: {one sentence}
Decision needed: {specific question with options if possible}
Everything else is complete — this is the only thing holding up the PR.
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

**Phase 1, Week 3–4 — Auth block is next.**

Setup complete:
- Monorepo scaffolded (backend, frontend, mobile, infrastructure, e2e, scripts, docs)
- Docker Compose ready — `docker-compose up` starts PostgreSQL 17 + Spring Boot
- Flyway migrations V1–V5 written (companies, users, departments, employees, documents)
- Spring Security + JWT filter + TenantContext wired (skeleton, not yet connected to real auth endpoints)
- React app scaffolded with routing, auth context, axios interceptor, all page shells
- Playwright E2E configured (API + UI test projects)
- Vitest + React Testing Library configured
- 75 GitHub issues across 7 phases, all with testing acceptance criteria
- Issues #1–#4 closed (setup done / deferred)

**Next stories to build (in order):**
- #5 — Company registration (POST /auth/register)
- #6 — User login with JWT (POST /auth/login)
- #7 — Token refresh & logout
- #8 — Password reset flow

**Agreed approach:** batch mode — human gives a batch of stories, Claude asks all
clarification questions upfront for the whole batch, then builds all stories
sequentially without interruption, raising a PR per story.

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

