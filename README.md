# HRApp — Modern HR SaaS Platform

A full-featured HR platform for the UK market. Built with React, Spring Boot 4, PostgreSQL, and AWS.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TailwindCSS |
| Backend | Spring Boot 4.0.6 (Java 25) |
| Database | PostgreSQL 17 |
| Mobile | React Native 0.79 |
| Cloud | AWS (ECS Fargate, RDS, S3, SES, CloudFront) |
| Infrastructure | Terraform 1.15 |
| CI/CD | GitHub Actions |

## Quick Start (Local Dev)

**Prerequisites:** Docker Desktop, Java 25, Node 24

```bash
# 1. Clone and start the database
docker-compose up db -d

# 2. Start the backend (picks up dev profile automatically)
cd backend
./mvnw spring-boot:run

# 3. Start the frontend (in a new terminal)
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:5173  
API runs at: http://localhost:8080/api/v1

Or start everything at once:
```bash
docker-compose up
```

## Project Structure

```
hrapp/
├── backend/          → Spring Boot API (Java 25)
├── frontend/         → React web app
├── mobile/           → React Native app (iOS & Android)
├── infrastructure/   → Terraform (AWS)
├── scripts/          → Utility scripts (GitHub setup, etc.)
├── .github/          → CI/CD workflows
└── docker-compose.yml
```

## Demo Data

The `dev` profile automatically seeds three realistic demo companies on first startup.
Full details — login credentials, data highlights, how to reset — in [docs/seed-data.md](docs/seed-data.md).

## Database Migrations

Managed by Flyway. **Never edit the DB manually.**

```bash
# Migrations run automatically on backend startup.
# To add a new migration:
touch backend/src/main/resources/db/migration/V6__your_description.sql
```

## Infrastructure

```bash
cd infrastructure
terraform init
terraform workspace select staging  # or prod
terraform plan
terraform apply   # Deploy
terraform destroy # Tear down
```

## Phased Roadmap

| Phase | Focus | Timeline |
|---|---|---|
| **Phase 1** ← Current | Foundation + Employee Management | Months 1–3 |
| Phase 2 | Leave & Attendance | Months 3–5 |
| Phase 3 | Mobile App | Months 5–7 |
| Phase 4 | Performance Reviews | Months 7–9 |
| Phase 5 | Recruitment / ATS | Months 9–11 |
| Phase 6 | Payroll (UK) | Months 11–13 |
| Phase 7 | Integrations & Scale | Months 13–15 |

See [GitHub Issues](https://github.com/laxminarayanaboga/project_hr/issues) for the full backlog.
