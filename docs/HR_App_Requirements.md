# HR App — Product Requirements Document
> Inspired by SageHR | Version 2.0 | May 2026

---

## 1. Overview

A modern, full-featured Human Resources platform designed for companies of all sizes — from startups to large enterprises. Available on both **web** and **mobile**, it centralizes HR operations into a single, intuitive workspace.

---

## 2. Decisions Log

| Area | Decision |
|---|---|
| **Modules** | Employee Management, Leave & Attendance, ATS, Payroll, Performance Reviews |
| **Target Market** | All company sizes (SMB to Enterprise) |
| **Platform** | Web (React) + Mobile (React Native) |
| **Payroll Compliance** | UK-first (PAYE, National Insurance, HMRC RTI) — expand later |
| **Deployment** | Cloud-only on AWS |
| **Pricing** | Per employee/month — 3 tiers + 14-day free trial (no credit card) |
| **Integrations** | Phase 5 — none at launch |
| **Tech Stack** | React · Spring Boot (Java) · PostgreSQL · AWS |
| **Team** | Solo — phased roadmap designed accordingly |

---

## 3. Pricing Model

| Plan | Price | Best For |
|---|---|---|
| **Starter** | £3 / employee / month | 1–50 employees |
| **Growth** | £6 / employee / month | 50–500 employees |
| **Enterprise** | Custom quote | 500+ employees |

- 14-day free trial, no credit card required
- Volume discounts negotiable at Enterprise level
- UK market first — pricing in GBP

---

## 4. Target Users

| Role | Description |
|---|---|
| **HR Admin** | Full access — manages all modules and configurations |
| **Manager** | Approves leaves, reviews team performance, views team data |
| **Employee (Self-Service)** | Applies for leave, views payslips, updates personal info |
| **Recruiter** | Manages job postings, pipelines, and candidates |
| **Finance/Payroll Admin** | Manages payroll runs, tax settings, and reports |
| **Super Admin** | System-level access, multi-company/tenant management |

---

## 5. Core Modules

### 5.1 Employee Management
- Employee profiles (personal info, job title, department, manager)
- Document storage (contracts, IDs, certifications)
- Org chart (visual hierarchy)
- Onboarding & offboarding workflows
- Custom fields per company
- Employment history tracking
- Role & permission management (RBAC)

### 5.2 Leave & Attendance
- Leave types (annual, sick, unpaid, maternity/paternity, custom)
- Leave request & approval workflow
- Leave balance tracking & accruals
- UK public holiday calendar
- Attendance tracking (clock-in/out)
- Overtime tracking
- Absence reports & analytics

### 5.3 Recruitment / ATS (Applicant Tracking System)
- Job posting creation & management
- Hosted careers page
- Candidate pipeline (Kanban-style stages)
- CV upload & storage
- Interview scheduling
- Scorecards & feedback collection
- Offer letter generation
- Candidate → Employee conversion

### 5.4 Payroll (UK)
- Payroll run management (monthly, bi-weekly)
- Salary, bonuses, deductions, allowances
- PAYE & National Insurance calculations
- HMRC RTI submissions
- Statutory pay (SSP, SMP, SPP)
- Auto-enrolment pension support (NEST / The People's Pension)
- Payslip generation & distribution
- Payroll history & audit trail

### 5.5 Performance Reviews
- Review cycle setup (quarterly, bi-annual, annual)
- Goal setting & OKR tracking
- 360-degree feedback (self, peer, manager)
- Performance ratings & scoring
- Customisable review templates
- Performance history timeline
- Analytics & reports

---

## 6. Supporting Features

### 6.1 Dashboard & Analytics
- Role-based dashboards (admin, manager, employee)
- Key HR metrics (headcount, turnover, absenteeism, time-to-hire)
- Exportable reports (PDF, CSV)

### 6.2 Notifications & Alerts
- In-app notifications
- Email notifications
- Push notifications (mobile)
- Reminders for reviews, leave approvals, contract renewals

### 6.3 Multi-Tenant Support
- Isolated data per company/tenant
- Shared AWS infrastructure
- White-labeling option (Phase 5)

### 6.4 Integrations (Phase 5)
- Google Workspace / Microsoft 365
- Slack / Teams
- Accounting tools (Xero, QuickBooks)
- Job boards (LinkedIn, Indeed)
- Open REST API & Webhooks

### 6.5 Security & Compliance
- Role-based access control (RBAC)
- Data encryption at rest and in transit
- GDPR compliance (data export, deletion requests)
- Audit logs
- Two-factor authentication (2FA)
- SSO support (Phase 4)

---

## 7. Tech Stack

| Layer | Technology |
|---|---|
| **Frontend (Web)** | React 19 |
| **Frontend (Mobile)** | React Native (iOS & Android) |
| **Backend** | Spring Boot 4.0.6 (Java 25) |
| **Database** | PostgreSQL |
| **Cloud** | AWS |
| **Auth** | Spring Security + JWT |
| **Storage** | AWS S3 (documents, payslips) |
| **Email** | AWS SES |
| **CI/CD** | GitHub Actions |
| **Hosting** | AWS ECS (Docker containers) or Elastic Beanstalk |

---

## 8. Platform Requirements

### 8.1 Web App
- Responsive design (desktop & tablet)
- Chrome, Firefox, Safari, Edge support

### 8.2 Mobile App (React Native)
- iOS & Android
- Core mobile features:
  - Leave requests & approvals
  - Employee directory
  - Attendance clock-in/out
  - Push notifications
  - Payslip viewing
  - Performance check-ins

---

## 9. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Page load < 2s, API response < 500ms |
| **Scalability** | 10 to 100,000+ employees per tenant |
| **Availability** | 99.9% uptime SLA |
| **Data Backup** | Daily automated backups, 30-day retention (AWS RDS snapshots) |
| **Accessibility** | WCAG 2.1 AA compliant |
| **Localisation** | UK English, GBP — multi-language Phase 5 |

---

## 10. Phased Roadmap

> Each phase targets **2–3 months** solo. Timeline compresses if collaborators join.
> Every phase ends with a **shippable, usable product**.

---

### 🚀 Phase 1 — Foundation (Months 1–3)
**Goal: Working app skeleton + Employee Management**

#### Deliverables
- [ ] Project setup — React frontend, Spring Boot backend, PostgreSQL on AWS RDS
- [ ] Authentication — JWT login, role-based access (HR Admin, Manager, Employee)
- [ ] Multi-tenant architecture — company registration & isolation
- [ ] Employee profiles — create, edit, view, deactivate
- [ ] Department & org structure management
- [ ] Document upload & storage (AWS S3)
- [ ] Basic role & permission management
- [ ] Simple admin dashboard (headcount, departments)
- [ ] Email notifications (AWS SES) — welcome email, password reset

**✅ Shippable:** A company can sign up, onboard employees, manage their profiles and documents.

---

### 📅 Phase 2 — Leave & Attendance (Months 3–5)
**Goal: Core day-to-day HR operations**

#### Deliverables
- [ ] Leave types setup (annual, sick, unpaid, maternity/paternity, custom)
- [ ] Leave request & multi-level approval workflow
- [ ] Leave balance tracking & accruals
- [ ] UK public holiday calendar (auto-populated)
- [ ] Attendance clock-in / clock-out (web)
- [ ] Overtime tracking
- [ ] Leave & absence reports (exportable CSV/PDF)
- [ ] Manager dashboard — team leave overview
- [ ] Email alerts — leave approvals, rejections, reminders

**✅ Shippable:** Teams can manage all leave and attendance end-to-end. Replaces spreadsheets entirely.

---

### 📱 Phase 3 — Mobile App (Months 5–7)
**Goal: React Native app covering core daily-use features**

#### Deliverables
- [ ] React Native app (iOS & Android)
- [ ] Login & secure session
- [ ] Employee directory & profile view
- [ ] Leave request & approval on mobile
- [ ] Attendance clock-in/out (with timestamp)
- [ ] Push notifications (leave approvals, reminders)
- [ ] Payslip viewing (read-only, Phase 4 payroll prerequisite)
- [ ] App Store & Google Play submission

**✅ Shippable:** Employees and managers can handle daily HR tasks from their phones.

---

### 🎯 Phase 4 — Performance Reviews (Months 7–9)
**Goal: Close the employee lifecycle loop**

#### Deliverables
- [ ] Review cycle setup (quarterly / bi-annual / annual)
- [ ] Goal setting & OKR tracking (individual & team)
- [ ] Self-assessment forms
- [ ] Manager review & scoring
- [ ] 360-degree feedback (peer reviews)
- [ ] Customisable review templates
- [ ] Performance history timeline per employee
- [ ] Performance analytics dashboard
- [ ] Automated review reminders (email + push)

**✅ Shippable:** Full performance review cycle from goal setting to final rating — no more Google Forms or spreadsheets.

---

### 💼 Phase 5 — Recruitment / ATS (Months 9–11)
**Goal: Hire-to-onboard pipeline**

#### Deliverables
- [ ] Job posting creation & management
- [ ] Hosted public careers page (subdomain per company)
- [ ] Candidate application form & CV upload
- [ ] Kanban pipeline — stages (Applied → Screening → Interview → Offer → Hired)
- [ ] Interview scheduling & notes
- [ ] Scorecards & team feedback collection
- [ ] Offer letter generation (templated)
- [ ] One-click candidate → employee conversion
- [ ] Basic recruitment analytics (time-to-hire, source tracking)

**✅ Shippable:** End-to-end recruitment from job post to new hire onboarded — fully integrated with employee management.

---

### 💷 Phase 6 — Payroll UK (Months 11–13)
**Goal: UK-compliant payroll engine**

> ⚠️ Most complex phase — allow extra buffer time.

#### Deliverables
- [ ] Employee payroll setup (salary, tax code, NI category)
- [ ] Monthly payroll run management
- [ ] PAYE & National Insurance calculations
- [ ] Statutory pay — SSP, SMP, SPP
- [ ] Auto-enrolment pension (NEST / The People's Pension)
- [ ] HMRC RTI submission (FPS — Full Payment Submission)
- [ ] Payslip generation & PDF distribution
- [ ] Bank transfer export file (BACS format)
- [ ] Payroll history & audit trail
- [ ] Year-end P60 generation

**✅ Shippable:** Fully compliant UK payroll — replaces Sage Payroll or Xero Payroll for small/mid businesses.

---

### 🔗 Phase 7 — Integrations & Scale (Months 13–15)
**Goal: Open up the platform & polish for growth**

#### Deliverables
- [ ] REST API (public, documented) & Webhooks
- [ ] Google Workspace / Microsoft 365 SSO
- [ ] Xero / QuickBooks payroll export integration
- [ ] Slack / Teams notification integration
- [ ] LinkedIn / Indeed job board posting
- [ ] White-labeling (custom logo, colours, domain)
- [ ] Advanced analytics & custom report builder
- [ ] GDPR tools (data export, right to deletion)
- [ ] 2FA enforcement options
- [ ] Performance & load testing at scale

**✅ Shippable:** A fully open, scalable, enterprise-ready HR platform.

---

## 11. Summary Timeline

| Phase | Focus | Solo Timeline |
|---|---|---|
| Phase 1 | Foundation + Employee Management | Months 1–3 |
| Phase 2 | Leave & Attendance | Months 3–5 |
| Phase 3 | Mobile App | Months 5–7 |
| Phase 4 | Performance Reviews | Months 7–9 |
| Phase 5 | Recruitment / ATS | Months 9–11 |
| Phase 6 | Payroll (UK) | Months 11–13 |
| Phase 7 | Integrations & Scale | Months 13–15 |

> 💡 **With a collaborator**, each phase could shrink to 4–6 weeks — full product in ~9 months.

---

*Document version 2.0 — Updated May 2026. All decisions confirmed.*
