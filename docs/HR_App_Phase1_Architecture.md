# HR App — Phase 1 Architecture Decision Record
> Version 2.1 | May 2026 | Stack: React 19 · Spring Boot 4 · Java 25 · PostgreSQL · AWS · Terraform 1.15

---

## 1. Project Structure

### Approach: Single Monorepo

```
github.com/yourname/hrapp/
├── backend/                → Spring Boot (Java)
├── frontend/               → React (Web)
├── mobile/                 → React Native (iOS & Android)
├── infrastructure/         → Terraform (AWS)
├── docker-compose.yml      → Local dev (all services)
├── .github/
│   └── workflows/
│       ├── backend.yml     → CI/CD for backend
│       └── frontend.yml    → CI/CD for frontend
└── README.md
```

One repo. One PR. One place to find everything.

---

### 1.1 Backend Structure (Spring Boot)

Follows a clean **layered + modular** architecture. Each HR module is a self-contained package.

```
backend/
├── src/main/java/com/hrapp/
│   ├── HrAppApplication.java
│   │
│   ├── config/
│   │   ├── SecurityConfig.java        # Spring Security + JWT
│   │   ├── CorsConfig.java
│   │   └── AwsConfig.java             # S3, SES beans
│   │
│   ├── common/
│   │   ├── exception/                 # Global error handling
│   │   ├── response/                  # Standard API response wrapper
│   │   ├── audit/                     # Created/updated by tracking
│   │   └── multitenancy/              # Tenant context & filtering
│   │
│   ├── auth/
│   │   ├── AuthController.java
│   │   ├── AuthService.java
│   │   ├── JwtTokenProvider.java
│   │   └── dto/
│   │
│   ├── company/
│   │   ├── CompanyController.java
│   │   ├── CompanyService.java
│   │   ├── CompanyRepository.java
│   │   ├── Company.java
│   │   └── dto/
│   │
│   ├── employee/
│   │   ├── EmployeeController.java
│   │   ├── EmployeeService.java
│   │   ├── EmployeeRepository.java
│   │   ├── Employee.java
│   │   └── dto/
│   │
│   ├── department/
│   │   ├── DepartmentController.java
│   │   ├── DepartmentService.java
│   │   ├── DepartmentRepository.java
│   │   ├── Department.java
│   │   └── dto/
│   │
│   └── document/
│       ├── DocumentController.java
│       ├── DocumentService.java       # S3 upload/download
│       ├── DocumentRepository.java
│       ├── Document.java
│       └── dto/
│
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   └── application-prod.yml
│
├── src/test/
├── Dockerfile
└── pom.xml
```

---

### 1.2 Frontend Structure (React)

Feature-based folder structure — each module owns its components, hooks, and API calls.

```
frontend/
├── public/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   │
│   ├── api/
│   │   ├── axios.js                   # Base Axios instance + JWT header
│   │   ├── authApi.js
│   │   ├── employeeApi.js
│   │   ├── departmentApi.js
│   │   └── documentApi.js
│   │
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterCompanyPage.jsx
│   │   └── useAuth.js
│   │
│   ├── layout/
│   │   ├── AppLayout.jsx
│   │   ├── Sidebar.jsx
│   │   └── Topbar.jsx
│   │
│   ├── dashboard/
│   │   └── DashboardPage.jsx
│   │
│   ├── employees/
│   │   ├── EmployeeListPage.jsx
│   │   ├── EmployeeDetailPage.jsx
│   │   ├── EmployeeForm.jsx
│   │   └── useEmployees.js
│   │
│   ├── departments/
│   │   ├── DepartmentListPage.jsx
│   │   ├── DepartmentForm.jsx
│   │   └── OrgChartPage.jsx
│   │
│   ├── documents/
│   │   ├── DocumentList.jsx
│   │   └── DocumentUpload.jsx
│   │
│   └── common/
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Table.jsx
│       ├── Badge.jsx
│       └── PrivateRoute.jsx           # Role-based route guard
│
├── .env.development
├── .env.production
├── Dockerfile
└── package.json
```

---

### 1.3 Infrastructure Structure (Terraform)

```
infrastructure/
├── main.tf                            # Root module
├── variables.tf                       # Input variables
├── outputs.tf                         # Output values
├── terraform.tfvars                   # Your actual values (gitignored)
├── terraform.tfvars.example           # Template to share safely
│
└── modules/
    ├── networking/                    # VPC, subnets, security groups
    ├── database/                      # RDS PostgreSQL
    ├── ecs/                           # ECS cluster, Fargate tasks
    ├── storage/                       # S3 buckets (frontend + documents)
    ├── cdn/                           # CloudFront distribution
    ├── email/                         # SES configuration
    └── secrets/                       # Secrets Manager entries
```

**Single command deploy:**
```bash
# First time setup
terraform init
terraform apply          # Spins up entire AWS infrastructure

# Tear everything down
terraform destroy        # Destroys all AWS resources cleanly
```

---

## 2. Database Design (PostgreSQL)

### Multi-Tenancy Strategy: Shared Database, Shared Schema

Every table has a `company_id` foreign key. All queries are automatically scoped to the current tenant via a Spring interceptor. Simple, cost-effective, and maintainable solo.

---

### Entity Relationship Diagram

```
companies
    └──< users
    └──< departments
              └── parent_id → departments (self-ref, nested depts)
    └──< employees
              └──< documents
              └── department_id → departments
              └── manager_id   → employees (self-ref)
              └── user_id      → users
```

---

### Table Definitions

#### companies
```sql
CREATE TABLE companies (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(255) NOT NULL,
    slug          VARCHAR(100) UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    phone         VARCHAR(50),
    address       TEXT,
    country       VARCHAR(100) DEFAULT 'United Kingdom',
    logo_url      VARCHAR(500),
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);
```

#### users
```sql
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id    UUID NOT NULL REFERENCES companies(id),
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,           -- BCrypt
    role          VARCHAR(50) NOT NULL,            -- HR_ADMIN, MANAGER, EMPLOYEE, SUPER_ADMIN
    is_active     BOOLEAN DEFAULT TRUE,
    last_login    TIMESTAMP,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, email)
);
```

#### departments
```sql
CREATE TABLE departments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id    UUID NOT NULL REFERENCES companies(id),
    name          VARCHAR(255) NOT NULL,
    description   TEXT,
    parent_id     UUID REFERENCES departments(id),
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);
```

#### employees
```sql
CREATE TABLE employees (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id        UUID NOT NULL REFERENCES companies(id),
    user_id           UUID REFERENCES users(id),
    department_id     UUID REFERENCES departments(id),
    manager_id        UUID REFERENCES employees(id),

    -- Personal Info
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100) NOT NULL,
    preferred_name    VARCHAR(100),
    date_of_birth     DATE,
    gender            VARCHAR(50),
    nationality       VARCHAR(100),
    phone             VARCHAR(50),
    personal_email    VARCHAR(255),
    address           TEXT,

    -- Job Info
    employee_number   VARCHAR(50),
    job_title         VARCHAR(255),
    employment_type   VARCHAR(50),   -- FULL_TIME, PART_TIME, CONTRACT
    employment_status VARCHAR(50),   -- ACTIVE, ON_LEAVE, TERMINATED
    start_date        DATE NOT NULL,
    end_date          DATE,
    probation_end     DATE,

    -- System
    avatar_url        VARCHAR(500),
    created_at        TIMESTAMP DEFAULT NOW(),
    updated_at        TIMESTAMP DEFAULT NOW()
);
```

#### documents
```sql
CREATE TABLE documents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id    UUID NOT NULL REFERENCES companies(id),
    employee_id   UUID NOT NULL REFERENCES employees(id),
    uploaded_by   UUID NOT NULL REFERENCES users(id),
    name          VARCHAR(255) NOT NULL,
    type          VARCHAR(100),   -- CONTRACT, ID, CERTIFICATE, OTHER
    s3_key        VARCHAR(500) NOT NULL,
    file_size     BIGINT,
    mime_type     VARCHAR(100),
    created_at    TIMESTAMP DEFAULT NOW()
);
```

> ✅ **No custom_fields table** — deliberately excluded. Properly model domain concepts as real columns. Revisit only if a genuine, specific need emerges in Phase 4+.

---

## 3. API Design

### Base URL
```
Production:  https://api.yourdomain.com/api/v1
Development: http://localhost:8080/api/v1
```

### Auth Strategy
- **Email + password** for Phase 1 (simple, clean)
- JWT Bearer Token: `Authorization: Bearer <token>`
- Token payload: `userId`, `companyId`, `role`
- Access token: 1 hour | Refresh token: 7 days
- Spring Security structured to support OAuth2/SSO in Phase 4 without a rewrite

### Standard Response Envelope
```json
{
  "success": true,
  "data": { },
  "message": "Employee created successfully",
  "timestamp": "2026-05-26T10:00:00Z"
}
```

Error response:
```json
{
  "success": false,
  "error": "EMPLOYEE_NOT_FOUND",
  "message": "Employee with id xyz not found",
  "timestamp": "2026-05-26T10:00:00Z"
}
```

---

### Endpoints

#### Auth
```
POST   /api/v1/auth/register           Register new company + admin user
POST   /api/v1/auth/login              Login → returns JWT
POST   /api/v1/auth/refresh            Refresh access token
POST   /api/v1/auth/logout             Invalidate token
POST   /api/v1/auth/forgot-password    Send reset email
POST   /api/v1/auth/reset-password     Reset with token
```

#### Employees
```
GET    /api/v1/employees               List all (paginated, filterable)
POST   /api/v1/employees               Create employee
GET    /api/v1/employees/{id}          Get employee detail
PUT    /api/v1/employees/{id}          Update employee
DELETE /api/v1/employees/{id}          Deactivate (soft delete)
GET    /api/v1/employees/{id}/documents  List employee documents
```

#### Departments
```
GET    /api/v1/departments             List all departments
POST   /api/v1/departments             Create department
GET    /api/v1/departments/{id}        Get department
PUT    /api/v1/departments/{id}        Update department
DELETE /api/v1/departments/{id}        Delete department
GET    /api/v1/departments/org-chart   Org chart tree
```

#### Documents
```
POST   /api/v1/documents/upload        Upload → S3
GET    /api/v1/documents/{id}          Get metadata
GET    /api/v1/documents/{id}/download Pre-signed S3 URL
DELETE /api/v1/documents/{id}          Delete document
```

#### Company
```
GET    /api/v1/company                 Get company profile
PUT    /api/v1/company                 Update company profile
POST   /api/v1/company/logo            Upload logo
GET    /api/v1/company/stats           Dashboard stats
```

#### Users
```
GET    /api/v1/users                   List users
POST   /api/v1/users/invite            Invite by email
PUT    /api/v1/users/{id}/role         Change role
DELETE /api/v1/users/{id}              Deactivate user
GET    /api/v1/users/me                Current user profile
```

---

## 4. AWS Infrastructure (Terraform-managed)

### Architecture Overview

```
Internet
    │
    ▼
┌──────────────────────────────────────────┐
│   CloudFront + S3 (React static build)   │  ← Frontend
└──────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────┐
│       Application Load Balancer          │
└──────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────┐
│     ECS Fargate — Spring Boot API        │  ← Backend
└──────────────────────────────────────────┘
    │                    │
    ▼                    ▼
┌──────────┐      ┌────────────┐
│ RDS      │      │ S3 Private │  ← Documents
│PostgreSQL│      │            │
└──────────┘      └────────────┘
                        │
                 ┌──────────────┐
                 │   AWS SES    │  ← Emails
                 └──────────────┘
```

### AWS Services

| Service | Purpose | Notes |
|---|---|---|
| **ECS Fargate** | Run Spring Boot container | No EC2 to manage |
| **ECR** | Docker image registry | GitHub Actions pushes here |
| **RDS PostgreSQL** | Main database | db.t3.micro to start, daily backups |
| **S3** (frontend) | Host React build | Public, behind CloudFront |
| **S3** (documents) | Employee file storage | Private, pre-signed URLs only |
| **CloudFront** | CDN for frontend | HTTPS, fast delivery |
| **SES** | Transactional email | Welcome, password reset |
| **ACM** | SSL/TLS certificates | Free HTTPS |
| **Route 53** | DNS | Points domain to CloudFront + ALB |
| **Secrets Manager** | DB creds, JWT secret | No secrets in code ever |
| **CloudWatch** | Logs & monitoring | Spring Boot + ECS metrics |

### Environments

| Environment | How |
|---|---|
| **Local Dev** | `docker-compose up` — Spring Boot + PostgreSQL |
| **Staging** | `terraform workspace select staging && terraform apply` |
| **Production** | `terraform workspace select prod && terraform apply` |

### Key Terraform Commands
```bash
terraform init                        # First time — download providers
terraform plan                        # Preview changes
terraform apply                       # Deploy / update infrastructure
terraform destroy                     # Tear everything down cleanly
terraform workspace list              # See environments
```

### CI/CD (GitHub Actions)
```
Push to main
    │
    ▼
GitHub Actions
    ├── Run tests (mvn test)
    ├── Build Docker image
    ├── Push to ECR
    └── Update ECS task → rolling deploy (zero downtime)
```

---

## 5. Security Decisions

| Concern | Decision |
|---|---|
| **Auth** | Email + password (Phase 1). Spring Security abstracted for OAuth2/SSO later |
| **Password hashing** | BCrypt |
| **Tenant isolation** | `company_id` filter on every query via Spring interceptor |
| **Document access** | S3 pre-signed URLs, 15-min expiry |
| **Secrets** | AWS Secrets Manager only — nothing in code or .env |
| **HTTPS** | Enforced everywhere via CloudFront + ACM |
| **CORS** | Frontend domain whitelist only |
| **Rate limiting** | AWS WAF on ALB — Phase 2 hardening |

---

## 6. Phase 1 — Build Order

```
Week 1–2:   Monorepo setup, Docker Compose, Terraform (infra skeleton), CI/CD
Week 3–4:   Auth — register company, login, JWT, roles, password reset
Week 5–6:   Company profile + Department management
Week 7–9:   Employee CRUD (create, list, view, edit, deactivate)
Week 10–11: Document upload (S3 integration, pre-signed URLs)
Week 12:    Dashboard stats + polish + full staging deploy via Terraform
```

---

## 7. Key Dependencies

### Backend (pom.xml)
```xml
spring-boot-starter-web    # Spring Boot 4.0.6
spring-boot-starter-data-jpa
spring-boot-starter-security
spring-boot-starter-validation
spring-boot-starter-mail
postgresql
flyway-core                  ← DB migrations — never edit DB manually
jjwt-api / jjwt-impl / jjwt-jackson
aws-java-sdk-s3
spring-cloud-starter-aws
lombok
mapstruct                    ← DTO ↔ Entity mapping
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^19",
    "react-router-dom": "^6",
    "axios": "^1",
    "@tanstack/react-query": "^5",
    "react-hook-form": "^7",
    "zod": "^3",
    "tailwindcss": "^3",
    "lucide-react": "latest",
    "@headlessui/react": "latest"
  }
}
```

### Infrastructure (Terraform)
```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"   # AWS provider 6.46.0
    }
  }
  backend "s3" {}    # Remote state stored in S3
}
```

---

*Architecture Document v2.1 — Monorepo · Email/Password Auth · Terraform · No Custom Fields*
