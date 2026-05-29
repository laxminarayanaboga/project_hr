#!/bin/bash
set -e
REPO="laxminarayanaboga/project_hr"

echo "=== Creating Phase 1 Issues ==="

gh issue create --repo "$REPO" \
  --title "[Setup] Monorepo structure & project scaffolding" \
  --label "infrastructure,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## Description
Set up the full monorepo folder structure for backend, frontend, mobile, and infrastructure. Every developer (or Claude) should be able to clone and know exactly where everything lives.

## Acceptance Criteria
- Monorepo follows the agreed structure from architecture doc
- Root README explains the project and how to run it
- .gitignore covers Java, Node, Terraform, and OS files

## Sub-tasks
- [ ] Create root folder structure (backend/ frontend/ mobile/ infrastructure/ scripts/)
- [ ] Add root README.md with project overview and quick-start guide
- [ ] Add comprehensive .gitignore (Java, Maven, Node, React Native, Terraform, macOS)
- [ ] Add docker-compose.yml skeleton (Spring Boot + PostgreSQL services)
- [ ] Verify all folders are committed and visible in GitHub"

gh issue create --repo "$REPO" \
  --title "[Setup] Docker Compose local dev environment" \
  --label "infrastructure,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## Description
Full local development environment via a single \`docker-compose up\` command. No AWS account needed for day-to-day development.

## Acceptance Criteria
- \`docker-compose up\` starts all services cleanly
- Backend connects to PostgreSQL automatically
- Hot reload works for Spring Boot
- Data persists across restarts via Docker volumes

## Sub-tasks
- [ ] PostgreSQL 17 container with named volume for data persistence
- [ ] Spring Boot container with dev profile and hot reload (spring-boot-devtools)
- [ ] Environment variables via .env file (gitignored, .env.example committed)
- [ ] Health checks on both containers
- [ ] Port mapping: 8080 (API), 5432 (DB)
- [ ] README section: how to start, stop, reset local DB"

gh issue create --repo "$REPO" \
  --title "[Setup] Terraform AWS infrastructure skeleton" \
  --label "infrastructure,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## Description
Full AWS infrastructure defined as code. \`terraform apply\` spins everything up; \`terraform destroy\` tears it all down. No manual AWS console clicks.

## Acceptance Criteria
- All Phase 1 AWS resources defined in Terraform modules
- Remote state stored in S3 with DynamoDB locking
- Staging and production workspaces configured
- terraform.tfvars.example committed (no real values ever committed)

## Sub-tasks
- [ ] S3 bucket + DynamoDB table for remote Terraform state
- [ ] Networking module: VPC, public/private subnets, security groups, NAT gateway
- [ ] Database module: RDS PostgreSQL 17 (db.t3.micro), automated backups, multi-AZ option
- [ ] ECS module: Fargate cluster, task definition, service, IAM roles
- [ ] Storage module: S3 bucket for documents (private), S3 bucket for frontend (public)
- [ ] CDN module: CloudFront distribution pointing to frontend S3
- [ ] Email module: SES domain + email identity verification
- [ ] Secrets module: Secrets Manager entries for DB creds and JWT secret
- [ ] ECR repository for Docker images
- [ ] Route 53 hosted zone and DNS records
- [ ] ACM SSL certificate (us-east-1 for CloudFront)
- [ ] outputs.tf: ALB URL, CloudFront URL, RDS endpoint, S3 bucket names"

gh issue create --repo "$REPO" \
  --title "[Setup] GitHub Actions CI/CD pipeline" \
  --label "infrastructure,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## Description
Automated CI/CD: every push to main triggers tests, builds a Docker image, pushes to ECR, and deploys to ECS with zero downtime.

## Acceptance Criteria
- Backend CI runs on every PR (tests must pass before merge)
- Merge to main triggers automatic deploy to staging
- Docker images tagged with git SHA for traceability

## Sub-tasks
- [ ] backend.yml: run mvn test on every push/PR
- [ ] backend.yml: build Docker image and push to ECR on merge to main
- [ ] backend.yml: update ECS task definition and trigger rolling deploy
- [ ] frontend.yml: run npm test and build on every push/PR
- [ ] frontend.yml: build and sync to S3, invalidate CloudFront on merge to main
- [ ] Store AWS credentials in GitHub Secrets (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
- [ ] Store JWT_SECRET, DB connection string in GitHub Secrets
- [ ] Branch protection rule: require CI to pass before merge"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can register my company and create the first admin account" \
  --label "user-story,auth,backend,frontend,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## User Story
As an HR Admin, I can register my company so that I can start using the platform.

## Acceptance Criteria
- Company name, email, and password are required
- Company slug is auto-generated from the company name
- A JWT access token and refresh token are returned on success
- A welcome email is sent via AWS SES
- Duplicate company email returns a clear error

## Sub-tasks
- [ ] Flyway migration V1: companies table
- [ ] Flyway migration V2: users table
- [ ] POST /api/v1/auth/register endpoint (creates company + HR_ADMIN user)
- [ ] BCrypt password hashing
- [ ] JWT generation (access token 1hr + refresh token 7 days)
- [ ] Welcome email template + SES send on registration
- [ ] Standard API response wrapper (success/error envelope)
- [ ] React: RegisterCompanyPage form (company name, email, password, confirm password)
- [ ] React: form validation with react-hook-form + zod
- [ ] React: redirect to dashboard on success"

gh issue create --repo "$REPO" \
  --title "As a user, I can log in with email and password and receive a JWT token" \
  --label "user-story,auth,backend,frontend,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## User Story
As a user, I can log in so that I can access my company's HR data securely.

## Acceptance Criteria
- Valid credentials return access token + refresh token
- Invalid credentials return a 401 with clear error message
- JWT payload contains userId, companyId, role
- Token is stored client-side and sent as Bearer on all requests

## Sub-tasks
- [ ] POST /api/v1/auth/login endpoint
- [ ] Spring Security JWT filter (validates token on every protected request)
- [ ] SecurityConfig: public vs protected routes, CORS config
- [ ] Tenant context interceptor: extract companyId from JWT and bind to request thread
- [ ] React: LoginPage (email + password form)
- [ ] React: store token in memory/httpOnly cookie, axios interceptor adds Bearer header
- [ ] React: role-based redirect after login (HR_ADMIN → dashboard, EMPLOYEE → self-service)"

gh issue create --repo "$REPO" \
  --title "As a user, I can refresh my session and log out securely" \
  --label "user-story,auth,backend,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## User Story
As a user, my session stays alive without re-logging in, and I can log out cleanly.

## Acceptance Criteria
- POST /auth/refresh returns a new access token given a valid refresh token
- POST /auth/logout invalidates the refresh token
- Expired access token + valid refresh token = silent refresh (no logout)

## Sub-tasks
- [ ] POST /api/v1/auth/refresh endpoint (validate refresh token, issue new access token)
- [ ] POST /api/v1/auth/logout endpoint (invalidate refresh token in DB)
- [ ] Store refresh tokens in DB with expiry (users table or separate table)
- [ ] Axios interceptor: auto-refresh on 401, retry original request
- [ ] Clear tokens from client on logout"

gh issue create --repo "$REPO" \
  --title "As a user, I can reset my password via email" \
  --label "user-story,auth,backend,frontend,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## User Story
As a user, if I forget my password I can reset it securely via a link sent to my email.

## Acceptance Criteria
- Reset link expires after 1 hour
- Link is single-use (invalidated after use)
- Password must meet minimum strength requirements

## Sub-tasks
- [ ] POST /api/v1/auth/forgot-password (generate token, send reset email via SES)
- [ ] POST /api/v1/auth/reset-password (validate token, update password hash, invalidate token)
- [ ] Password reset token table (or column on users) with expiry
- [ ] SES email template for password reset
- [ ] React: ForgotPasswordPage (email input)
- [ ] React: ResetPasswordPage (new password + confirm, reads token from URL)"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can manage my company profile" \
  --label "user-story,employee,backend,frontend,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## User Story
As an HR Admin, I can view and update my company details and upload a logo.

## Acceptance Criteria
- Company name, address, phone, country are editable
- Logo uploaded to S3 and URL stored on company record
- Only HR_ADMIN role can edit company profile

## Sub-tasks
- [ ] GET /api/v1/company — return current tenant company profile
- [ ] PUT /api/v1/company — update company fields
- [ ] POST /api/v1/company/logo — upload logo to S3, return logo_url
- [ ] React: CompanySettingsPage with editable form
- [ ] React: logo upload with preview
- [ ] Role guard: MANAGER and EMPLOYEE see read-only view"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can create and manage departments" \
  --label "user-story,department,backend,frontend,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## User Story
As an HR Admin, I can create departments, nest them under parent departments, and keep the structure organised.

## Acceptance Criteria
- Departments can be nested up to any depth via parent_id
- Deleting a department with active employees is blocked
- All departments are scoped to the current company (company_id)

## Sub-tasks
- [ ] Flyway migration V3: departments table (with parent_id self-reference)
- [ ] GET /api/v1/departments — list all departments flat
- [ ] POST /api/v1/departments — create department
- [ ] PUT /api/v1/departments/{id} — update department
- [ ] DELETE /api/v1/departments/{id} — delete (block if employees assigned)
- [ ] React: DepartmentListPage with create/edit/delete actions
- [ ] React: DepartmentForm (name, description, parent department dropdown)"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can view the company org chart" \
  --label "user-story,department,frontend,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## User Story
As an HR Admin or Manager, I can see the company hierarchy as a visual org chart.

## Acceptance Criteria
- Org chart reflects live department and employee data
- Expandable/collapsible nodes
- Shows employee names and job titles at each node

## Sub-tasks
- [ ] GET /api/v1/departments/org-chart — recursive tree structure response
- [ ] React: OrgChartPage — render tree using a chart library (e.g. react-organizational-chart)
- [ ] Expand/collapse department nodes
- [ ] Show employee count per department
- [ ] Link from org chart node to department detail"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can create a new employee profile" \
  --label "user-story,employee,backend,frontend,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## User Story
As an HR Admin, I can add a new employee to the system with their full profile.

## Acceptance Criteria
- All required fields validated before save
- Employee number auto-generated if not provided
- Employee is scoped to the current company (company_id)
- Avatar can be uploaded to S3

## Sub-tasks
- [ ] Flyway migration V4: employees table (full schema from architecture doc)
- [ ] POST /api/v1/employees — create employee
- [ ] Employee entity, repository, service, controller, DTOs (MapStruct)
- [ ] Avatar upload to S3 (POST /api/v1/employees/{id}/avatar)
- [ ] React: EmployeeForm — personal info, job info, department/manager dropdowns
- [ ] React: form validation (react-hook-form + zod schema)
- [ ] React: avatar upload with crop preview"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can list and search all employees" \
  --label "user-story,employee,backend,frontend,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## User Story
As an HR Admin or Manager, I can view all employees with search and filter capabilities.

## Acceptance Criteria
- Results are paginated (20 per page default)
- Filterable by department, employment status, job title
- Searchable by name or employee number
- Results scoped to current company only

## Sub-tasks
- [ ] GET /api/v1/employees — paginated list with query params (page, size, search, departmentId, status)
- [ ] Spring Data JPA Specification for dynamic filtering
- [ ] React: EmployeeListPage — table with avatar, name, job title, department, status
- [ ] React: search bar + filter dropdowns (department, status)
- [ ] React: pagination component
- [ ] React: quick actions per row (view, edit, deactivate)"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can view and edit an employee profile" \
  --label "user-story,employee,backend,frontend,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## User Story
As an HR Admin, I can view the full employee profile and edit any field. As an Employee, I can view my own profile and edit limited personal fields.

## Acceptance Criteria
- HR_ADMIN can edit all fields
- EMPLOYEE can only edit personal info (phone, address, personal email)
- MANAGER can view their direct reports (read-only)

## Sub-tasks
- [ ] GET /api/v1/employees/{id} — full employee detail
- [ ] PUT /api/v1/employees/{id} — update employee (role-based field permissions)
- [ ] React: EmployeeDetailPage — tabbed layout (Personal, Job, Documents)
- [ ] React: inline edit mode vs read-only based on role
- [ ] React: employment history section (start date, probation end, status)"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can deactivate an employee (soft delete)" \
  --label "user-story,employee,backend,frontend,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## User Story
As an HR Admin, I can deactivate an employee when they leave the company. Their record is retained for history — never hard deleted.

## Acceptance Criteria
- Deactivation sets employment_status = TERMINATED and records end_date
- Terminated employees are excluded from active lists by default
- The action requires confirmation (no accidental clicks)
- The user account linked to the employee is also deactivated

## Sub-tasks
- [ ] DELETE /api/v1/employees/{id} — soft delete (set status=TERMINATED, end_date=today)
- [ ] Deactivate linked user account (is_active=false)
- [ ] Default filter: active employees only (status != TERMINATED)
- [ ] React: confirmation modal before deactivating
- [ ] React: end date + reason capture in offboarding modal
- [ ] React: terminated employees visible under separate filter/tab"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can upload documents for an employee" \
  --label "user-story,document,backend,frontend,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## User Story
As an HR Admin, I can upload contracts, IDs, and certificates for an employee. Files are stored securely in S3.

## Acceptance Criteria
- Supported file types: PDF, DOC, DOCX, JPG, PNG
- Max file size: 10MB per file
- Files never served directly from S3 — always via pre-signed URL (15-min expiry)
- Document metadata stored in DB (name, type, size, uploader)

## Sub-tasks
- [ ] Flyway migration V5: documents table
- [ ] POST /api/v1/documents/upload — multipart upload, store to S3, save metadata to DB
- [ ] S3 key naming: {companyId}/{employeeId}/{uuid}-{filename}
- [ ] File type and size validation (backend)
- [ ] React: DocumentUpload component — drag-and-drop or file picker
- [ ] React: document type selector (CONTRACT, ID, CERTIFICATE, OTHER)
- [ ] React: upload progress indicator"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can view and download employee documents" \
  --label "user-story,document,backend,frontend,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## User Story
As an HR Admin, I can see all documents for an employee and download them securely.

## Acceptance Criteria
- Download link is a pre-signed S3 URL (expires in 15 minutes)
- Documents list shows name, type, size, upload date, uploader
- Only users with access to that employee can view their documents

## Sub-tasks
- [ ] GET /api/v1/employees/{id}/documents — list all documents for employee
- [ ] GET /api/v1/documents/{id}/download — generate and return pre-signed S3 URL
- [ ] DELETE /api/v1/documents/{id} — remove document from S3 and DB
- [ ] React: DocumentList component in employee detail tab
- [ ] React: download button (opens pre-signed URL in new tab)
- [ ] React: delete document with confirmation"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can view a dashboard with company stats" \
  --label "user-story,dashboard,backend,frontend,phase-1" \
  --milestone "Phase 1 — Foundation + Employee Management" \
  --body "## User Story
As an HR Admin, I see a dashboard on login showing key company metrics at a glance.

## Acceptance Criteria
- Dashboard shows headcount, department count, recent hires, pending actions
- Role-based: HR_ADMIN sees all stats, MANAGER sees team stats, EMPLOYEE sees personal info
- Stats are real-time from the DB

## Sub-tasks
- [ ] GET /api/v1/company/stats — headcount, departments, new hires this month, active vs terminated
- [ ] React: DashboardPage — stat cards with icons (lucide-react)
- [ ] React: recent hires list (last 5 employees added)
- [ ] React: PrivateRoute component — redirect to login if no token
- [ ] React: role-based sidebar navigation (HR_ADMIN vs MANAGER vs EMPLOYEE menus)
- [ ] React: AppLayout with Sidebar + Topbar (user avatar, company name, logout)"

echo "=== Phase 1 done. Creating Phase 2 Issues ==="

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can configure leave types for my company" \
  --label "user-story,leave,backend,frontend,phase-2" \
  --milestone "Phase 2 — Leave & Attendance" \
  --body "## User Story
As an HR Admin, I can define the types of leave available in my company (annual, sick, unpaid, etc.) with custom rules per type.

## Acceptance Criteria
- Default UK leave types are pre-configured on company creation
- HR Admin can add, edit, or deactivate leave types
- Each type has: name, days allowance per year, accrual method, paid/unpaid flag, requires approval flag

## Sub-tasks
- [ ] Flyway migration: leave_types table
- [ ] CRUD endpoints for leave types (/api/v1/leave-types)
- [ ] Seed default types: Annual Leave (28 days UK), Sick Leave, Unpaid, Maternity, Paternity
- [ ] React: Leave Types settings page
- [ ] React: Leave type form with all config fields"

gh issue create --repo "$REPO" \
  --title "As an Employee, I can submit a leave request" \
  --label "user-story,leave,backend,frontend,phase-2" \
  --milestone "Phase 2 — Leave & Attendance" \
  --body "## User Story
As an Employee, I can request time off by submitting a leave request with dates and reason.

## Acceptance Criteria
- Cannot book dates in the past
- System checks remaining balance before allowing submission
- Public holidays and weekends excluded from leave count
- Employee gets email confirmation on submission

## Sub-tasks
- [ ] Flyway migration: leave_requests table
- [ ] Flyway migration: leave_balances table
- [ ] POST /api/v1/leaves — create leave request
- [ ] Business day calculation (exclude weekends + public holidays)
- [ ] Balance check validation
- [ ] React: Leave request form (date range picker, leave type, reason)
- [ ] React: remaining balance display per leave type
- [ ] Email notification on submission (to employee + manager)"

gh issue create --repo "$REPO" \
  --title "As a Manager, I can approve or reject leave requests from my team" \
  --label "user-story,leave,backend,frontend,phase-2" \
  --milestone "Phase 2 — Leave & Attendance" \
  --body "## User Story
As a Manager, I can review pending leave requests from my direct reports and approve or reject them with a comment.

## Acceptance Criteria
- Manager only sees requests from their direct reports
- Approval deducts from employee leave balance
- Employee notified by email on approval or rejection
- Manager can see team calendar to spot conflicts

## Sub-tasks
- [ ] PUT /api/v1/leaves/{id}/approve — approve request, deduct balance
- [ ] PUT /api/v1/leaves/{id}/reject — reject with mandatory reason
- [ ] GET /api/v1/leaves/pending — manager view of pending requests
- [ ] Team leave calendar endpoint
- [ ] React: manager leave approval queue (list of pending requests)
- [ ] React: approve/reject modal with comment field
- [ ] React: team leave calendar view (who is off when)"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can configure multi-level leave approval chains" \
  --label "user-story,leave,backend,frontend,phase-2" \
  --milestone "Phase 2 — Leave & Attendance" \
  --body "## User Story
As an HR Admin, I can set up approval workflows so that certain leave types require approval from multiple levels (e.g. manager then HR).

## Acceptance Criteria
- Up to 3 approval levels configurable per leave type
- Each level notified only after previous level approves
- If an approver is unavailable, HR Admin can override

## Sub-tasks
- [ ] Flyway migration: leave_approval_steps table
- [ ] Leave policy approval chain configuration endpoints
- [ ] Sequential approver notification logic
- [ ] HR Admin override endpoint
- [ ] React: approval chain builder in leave type settings"

gh issue create --repo "$REPO" \
  --title "As an Employee, I can see my leave balances and accruals" \
  --label "user-story,leave,backend,frontend,phase-2" \
  --milestone "Phase 2 — Leave & Attendance" \
  --body "## User Story
As an Employee, I can see how many days of each leave type I have remaining and how they accrue over time.

## Acceptance Criteria
- Balance updates immediately after approval
- Accrual runs monthly (cron job)
- HR Admin can manually adjust balances with a reason

## Sub-tasks
- [ ] GET /api/v1/leave-balances/me — employee own balances
- [ ] GET /api/v1/leave-balances?employeeId= — HR Admin view for any employee
- [ ] Accrual engine: monthly cron job to add accrued days
- [ ] PUT /api/v1/leave-balances/{id}/adjust — HR Admin manual adjustment with reason
- [ ] React: leave balance summary cards on employee dashboard
- [ ] React: balance history with accrual and usage log"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can manage the UK public holiday calendar" \
  --label "user-story,leave,backend,frontend,phase-2" \
  --milestone "Phase 2 — Leave & Attendance" \
  --body "## User Story
As an HR Admin, I can view and manage the UK public holidays calendar so they are automatically excluded from leave day counts.

## Acceptance Criteria
- UK public holidays (England & Wales) pre-seeded for current and next year
- HR Admin can add or remove holidays
- Public holidays shown on the leave calendar

## Sub-tasks
- [ ] Flyway migration: public_holidays table
- [ ] Seed 2026 and 2027 UK public holidays (England & Wales)
- [ ] CRUD endpoints for public holidays
- [ ] Public holiday lookup used in leave day calculation logic
- [ ] React: Public Holidays settings page with calendar view"

gh issue create --repo "$REPO" \
  --title "As an Employee, I can clock in and clock out on the web" \
  --label "user-story,attendance,backend,frontend,phase-2" \
  --milestone "Phase 2 — Leave & Attendance" \
  --body "## User Story
As an Employee, I can record my attendance by clocking in when I start work and out when I finish.

## Acceptance Criteria
- Only one active clock-in allowed at a time
- Clock-in/out timestamps recorded to the second
- Employee can view their attendance log

## Sub-tasks
- [ ] Flyway migration: attendance_records table
- [ ] POST /api/v1/attendance/clock-in
- [ ] POST /api/v1/attendance/clock-out
- [ ] GET /api/v1/attendance/today — current day status
- [ ] GET /api/v1/attendance/history — paginated attendance history
- [ ] React: Clock-in/out widget on employee dashboard (big button, shows current status)
- [ ] React: attendance history table (date, in, out, hours worked)"

gh issue create --repo "$REPO" \
  --title "As a Manager, I can view and approve overtime for my team" \
  --label "user-story,attendance,backend,frontend,phase-2" \
  --milestone "Phase 2 — Leave & Attendance" \
  --body "## User Story
As a Manager, I can see when employees have worked beyond their contracted hours and approve overtime.

## Acceptance Criteria
- Overtime = hours worked beyond contracted hours per day/week
- Manager sees overtime summary per employee
- Overtime records exportable for payroll use

## Sub-tasks
- [ ] Contracted hours field on employee record (Flyway migration)
- [ ] Overtime calculation service (actual vs contracted hours)
- [ ] GET /api/v1/attendance/overtime?teamId= — manager overtime view
- [ ] PUT /api/v1/attendance/overtime/{id}/approve
- [ ] React: overtime report table per team member"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can export leave and absence reports" \
  --label "user-story,leave,dashboard,backend,frontend,phase-2" \
  --milestone "Phase 2 — Leave & Attendance" \
  --body "## User Story
As an HR Admin, I can export leave and absence data as CSV or PDF for reporting and payroll purposes.

## Acceptance Criteria
- Reports filterable by date range, employee, department, leave type
- CSV export for data analysis
- PDF export for formal reporting

## Sub-tasks
- [ ] GET /api/v1/reports/leave — leave summary with filters
- [ ] CSV export endpoint (/api/v1/reports/leave/export?format=csv)
- [ ] PDF generation (iText or JasperReports)
- [ ] React: Reports page with filter controls and export buttons
- [ ] React: absence summary table with totals per employee"

gh issue create --repo "$REPO" \
  --title "As a Manager, I see a team leave overview on my dashboard" \
  --label "user-story,leave,dashboard,frontend,phase-2" \
  --milestone "Phase 2 — Leave & Attendance" \
  --body "## User Story
As a Manager, I can see at a glance which team members are off today, upcoming leaves, and leave stats for my team.

## Acceptance Criteria
- Who is off today widget (real-time)
- Upcoming leave list for next 30 days
- Monthly absence rate per team member

## Sub-tasks
- [ ] GET /api/v1/dashboard/manager-stats — team leave summary
- [ ] React: manager dashboard page
- [ ] React: who-is-off-today widget
- [ ] React: upcoming leaves timeline list
- [ ] React: team absence stats cards"

gh issue create --repo "$REPO" \
  --title "System sends email alerts for leave events" \
  --label "user-story,leave,backend,phase-2" \
  --milestone "Phase 2 — Leave & Attendance" \
  --body "## User Story
As an employee or manager, I receive timely email notifications for leave-related events so I never miss an approval or update.

## Acceptance Criteria
- Employee notified when request is approved or rejected
- Manager notified when a new request is pending their approval
- HR Admin receives weekly pending approvals digest

## Sub-tasks
- [ ] SES email template: leave request submitted (to manager)
- [ ] SES email template: leave approved (to employee)
- [ ] SES email template: leave rejected with reason (to employee)
- [ ] Scheduled job: weekly pending approvals reminder to managers
- [ ] Email notification service abstraction (swap SES for other providers later)"

echo "=== Phase 2 done. Creating Phase 3 Issues ==="

gh issue create --repo "$REPO" \
  --title "[Setup] React Native app initialisation (iOS & Android)" \
  --label "infrastructure,mobile,phase-3" \
  --milestone "Phase 3 — Mobile App" \
  --body "## Description
Bootstrap the React Native 0.79 project for iOS and Android with all core dependencies and project conventions established.

## Acceptance Criteria
- App builds and runs on iOS Simulator and Android Emulator
- Navigation, API client, and auth token storage all configured
- CI/CD builds the app on every push

## Sub-tasks
- [ ] React Native 0.79 project init (TypeScript template)
- [ ] React Navigation v7 setup (stack + bottom tabs)
- [ ] Shared Axios API client (same base URL as web, JWT header)
- [ ] react-native-keychain for secure token storage
- [ ] react-native-async-storage for non-sensitive data
- [ ] Environment config (.env via react-native-config)
- [ ] ESLint + Prettier config
- [ ] GitHub Actions: iOS build (Xcode) and Android build (Gradle)"

gh issue create --repo "$REPO" \
  --title "As a user, I can log in on the mobile app with a secure session" \
  --label "user-story,mobile,auth,phase-3" \
  --milestone "Phase 3 — Mobile App" \
  --body "## User Story
As a user, I can log in on my phone and stay logged in securely between app launches.

## Acceptance Criteria
- Token stored in device keychain (not AsyncStorage)
- Auto-refresh token on app foreground if access token expired
- Biometric unlock option (Face ID / fingerprint)

## Sub-tasks
- [ ] Login screen (email + password, company detection)
- [ ] JWT stored in react-native-keychain
- [ ] App state listener: refresh token when app comes to foreground
- [ ] Biometric auth with react-native-biometrics (optional toggle)
- [ ] Logout clears keychain and navigates to login"

gh issue create --repo "$REPO" \
  --title "As an Employee, I can browse the employee directory on mobile" \
  --label "user-story,mobile,employee,phase-3" \
  --milestone "Phase 3 — Mobile App" \
  --body "## User Story
As an Employee, I can look up colleagues in the employee directory from my phone.

## Acceptance Criteria
- Search by name works in real-time
- Profile shows avatar, name, job title, department, contact info
- Tap to call or email directly from the app

## Sub-tasks
- [ ] Employee list screen with search (FlatList, debounced API call)
- [ ] Employee profile screen (avatar, personal info, job info)
- [ ] Department filter
- [ ] Tap phone number to call (Linking.openURL)
- [ ] Tap email to open mail client"

gh issue create --repo "$REPO" \
  --title "As an Employee or Manager, I can manage leave requests on mobile" \
  --label "user-story,mobile,leave,phase-3" \
  --milestone "Phase 3 — Mobile App" \
  --body "## User Story
As an Employee, I can apply for leave from my phone. As a Manager, I can approve or reject requests on the go.

## Acceptance Criteria
- Full leave request form on mobile (date picker, type, reason)
- Manager sees approval queue with swipe actions
- Leave calendar shows team availability

## Sub-tasks
- [ ] Leave request screen (date range picker, leave type, reason, balance display)
- [ ] My leave history screen (list with status badges)
- [ ] Manager: approval queue screen with approve/reject actions
- [ ] Team leave calendar screen
- [ ] Leave balance summary screen"

gh issue create --repo "$REPO" \
  --title "As an Employee, I can clock in and out on mobile with a timestamp" \
  --label "user-story,mobile,attendance,phase-3" \
  --milestone "Phase 3 — Mobile App" \
  --body "## User Story
As an Employee, I can record my attendance from my phone with a single tap, capturing the exact time.

## Acceptance Criteria
- Large, clear clock-in/out button (state-aware)
- Location captured at clock-in (optional, user consent required)
- Weekly hours summary shown

## Sub-tasks
- [ ] Clock-in/out screen with large status-aware button
- [ ] GPS location capture on clock-in (react-native-geolocation, with permission prompt)
- [ ] Today's shift summary (in time, out time, hours worked)
- [ ] Weekly hours summary screen
- [ ] Prevent duplicate clock-in (check current state before allowing)"

gh issue create --repo "$REPO" \
  --title "As a user, I receive push notifications for HR events" \
  --label "user-story,mobile,phase-3" \
  --milestone "Phase 3 — Mobile App" \
  --body "## User Story
As a user, I receive push notifications so I know immediately about leave approvals, rejections, and review reminders.

## Acceptance Criteria
- Push notifications work on both iOS and Android
- Tapping a notification opens the relevant screen
- Users can configure notification preferences

## Sub-tasks
- [ ] Firebase Cloud Messaging (FCM) integration
- [ ] Backend: FCM token registration endpoint
- [ ] Backend: send push on leave approved/rejected/pending
- [ ] Deep link routing (notification tap → relevant screen)
- [ ] Notification preferences screen in app settings
- [ ] Handle notifications in foreground, background, and killed state"

gh issue create --repo "$REPO" \
  --title "As an Employee, I can view my payslips on mobile" \
  --label "user-story,mobile,payroll,phase-3" \
  --milestone "Phase 3 — Mobile App" \
  --body "## User Story
As an Employee, I can view my historical payslips from my phone (read-only, no payroll data entry on mobile).

## Acceptance Criteria
- List of payslips sorted by date (most recent first)
- Payslip PDF viewable in-app
- Downloadable to device

## Sub-tasks
- [ ] Payslips list screen (month, gross pay, net pay, status)
- [ ] Payslip PDF viewer (react-native-pdf or WebView)
- [ ] Download payslip to device (react-native-fs)
- [ ] Placeholder screen if no payslips yet (Phase 6 dependency)"

gh issue create --repo "$REPO" \
  --title "[Setup] App Store and Google Play submission" \
  --label "infrastructure,mobile,phase-3" \
  --milestone "Phase 3 — Mobile App" \
  --body "## Description
Prepare and submit the app to both app stores. This includes all metadata, icons, screenshots, and store listings.

## Acceptance Criteria
- App approved and live on both stores
- Internal test track set up for beta testing before public release

## Sub-tasks
- [ ] App icons (all required sizes for iOS and Android)
- [ ] Splash screen
- [ ] iOS: App Store Connect listing (description, keywords, screenshots)
- [ ] iOS: TestFlight internal testing group
- [ ] iOS: App Store submission and review
- [ ] Android: Play Store listing (description, screenshots, content rating)
- [ ] Android: Internal testing track
- [ ] Android: Play Store submission and review
- [ ] Code signing config for release builds"

echo "=== Phase 3 done. Creating Phase 4 Issues ==="

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can set up performance review cycles" \
  --label "user-story,performance,backend,frontend,phase-4" \
  --milestone "Phase 4 — Performance Reviews" \
  --body "## User Story
As an HR Admin, I can create and schedule performance review cycles (quarterly, bi-annual, or annual) and choose which employees participate.

## Acceptance Criteria
- Cycle has a name, frequency, start/end dates, and status (draft/active/closed)
- HR Admin activates a cycle to begin the review process
- Participants can be all employees or a specific subset

## Sub-tasks
- [ ] Flyway migration: review_cycles table
- [ ] CRUD endpoints for review cycles
- [ ] Cycle activation/deactivation logic
- [ ] Participant selection (all employees or manual selection)
- [ ] React: Review Cycles management page
- [ ] React: Cycle setup wizard (name, dates, frequency, participants)"

gh issue create --repo "$REPO" \
  --title "As an Employee, I can set personal goals and track OKRs" \
  --label "user-story,performance,backend,frontend,phase-4" \
  --milestone "Phase 4 — Performance Reviews" \
  --body "## User Story
As an Employee, I can set my objectives and key results (OKRs) and update progress throughout the review cycle.

## Acceptance Criteria
- Goals linked to a review cycle
- Key results have a numeric progress tracker (0-100%)
- Employees can update progress at any time during the cycle
- Managers can see their direct reports' goals

## Sub-tasks
- [ ] Flyway migration: goals and key_results tables
- [ ] CRUD endpoints for goals and key results
- [ ] Progress update endpoint (PUT /api/v1/goals/{id}/progress)
- [ ] Manager view: GET /api/v1/goals?employeeId=
- [ ] React: Goals dashboard (my goals list with progress bars)
- [ ] React: Create/edit goal form with key results
- [ ] React: Progress update slider/input"

gh issue create --repo "$REPO" \
  --title "As an Employee, I can complete my self-assessment" \
  --label "user-story,performance,backend,frontend,phase-4" \
  --milestone "Phase 4 — Performance Reviews" \
  --body "## User Story
As an Employee, I can fill out a self-assessment form for an active review cycle, reflecting on my performance and achievements.

## Acceptance Criteria
- Self-assessment form based on the cycle template
- Can be saved as draft and submitted before deadline
- Locked for editing after submission deadline

## Sub-tasks
- [ ] Flyway migration: self_assessments table
- [ ] POST /api/v1/reviews/self-assessment (save or submit)
- [ ] Deadline enforcement (block submit after cycle end date)
- [ ] React: Self-assessment form (section per template question)
- [ ] React: Save draft vs submit confirmation
- [ ] React: submission status indicator per employee"

gh issue create --repo "$REPO" \
  --title "As a Manager, I can complete performance reviews for my direct reports" \
  --label "user-story,performance,backend,frontend,phase-4" \
  --milestone "Phase 4 — Performance Reviews" \
  --body "## User Story
As a Manager, I can write and submit performance reviews for each of my direct reports, including ratings and written feedback.

## Acceptance Criteria
- Manager can see each direct report's self-assessment before writing their review
- Ratings on a 1-5 scale with written justification required
- Manager review submitted before cycle close date

## Sub-tasks
- [ ] Flyway migration: manager_reviews table
- [ ] POST /api/v1/reviews/manager (submit manager review)
- [ ] GET /api/v1/reviews/manager/pending — list of direct reports needing review
- [ ] React: Manager review form (read self-assessment alongside)
- [ ] React: rating input (1-5 stars/scale) per competency
- [ ] React: written feedback sections (strengths, development areas, overall)"

gh issue create --repo "$REPO" \
  --title "As an Employee, I can give and receive 360-degree peer feedback" \
  --label "user-story,performance,backend,frontend,phase-4" \
  --milestone "Phase 4 — Performance Reviews" \
  --body "## User Story
As an Employee, I can nominate peers to review me, and I can provide anonymous feedback for colleagues who have nominated me.

## Acceptance Criteria
- Peer feedback is anonymous to the reviewee
- Employees can nominate 3-5 peers per cycle
- HR Admin can override nominations if needed

## Sub-tasks
- [ ] Flyway migration: peer_reviews table, peer_nominations table
- [ ] Peer nomination endpoints
- [ ] Anonymous feedback submission endpoint
- [ ] Feedback aggregation service (anonymised summary)
- [ ] React: peer nomination screen (select from colleagues)
- [ ] React: peer feedback form (anonymous submission)
- [ ] React: aggregated feedback display on review result page"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can create and manage review templates" \
  --label "user-story,performance,backend,frontend,phase-4" \
  --milestone "Phase 4 — Performance Reviews" \
  --body "## User Story
As an HR Admin, I can build custom review templates with different sections and question types, then assign them to review cycles.

## Acceptance Criteria
- Template supports: text, rating scale, yes/no, multiple choice question types
- Templates are versioned — editing creates a new version, doesn't overwrite history
- Templates can be assigned to one or more review cycles

## Sub-tasks
- [ ] Flyway migration: review_templates, template_sections, template_questions tables
- [ ] CRUD endpoints for templates and sections
- [ ] Template versioning logic
- [ ] Template assignment to review cycles
- [ ] React: Template editor (drag-and-drop sections and questions)
- [ ] React: Question type selector with preview"

gh issue create --repo "$REPO" \
  --title "As an Employee, I can view my full performance history timeline" \
  --label "user-story,performance,frontend,phase-4" \
  --milestone "Phase 4 — Performance Reviews" \
  --body "## User Story
As an Employee, I can look back at all my past performance reviews, ratings, and goals in a timeline view.

## Acceptance Criteria
- Timeline shows all completed cycles chronologically
- Each entry shows: final rating, manager comments, goal completion
- Accessible to the employee and their manager

## Sub-tasks
- [ ] GET /api/v1/employees/{id}/performance-history — all completed reviews
- [ ] React: Performance History tab on employee profile
- [ ] React: Timeline component with expandable review entries
- [ ] React: Rating trend chart (line chart across cycles)
- [ ] React: Goal completion history per cycle"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can view performance analytics across the company" \
  --label "user-story,performance,dashboard,frontend,phase-4" \
  --milestone "Phase 4 — Performance Reviews" \
  --body "## User Story
As an HR Admin, I can see company-wide performance analytics to identify top performers, rating distributions, and review completion rates.

## Acceptance Criteria
- Cycle completion rate visible in real-time
- Rating distribution chart
- Top performers list exportable to CSV

## Sub-tasks
- [ ] GET /api/v1/analytics/performance — aggregated stats per cycle
- [ ] React: Performance analytics dashboard
- [ ] React: Rating distribution bar chart
- [ ] React: Completion rate progress indicator
- [ ] React: Top performers list (filterable by department)
- [ ] CSV export for performance data"

gh issue create --repo "$REPO" \
  --title "System sends automated reminders for review deadlines" \
  --label "user-story,performance,backend,phase-4" \
  --milestone "Phase 4 — Performance Reviews" \
  --body "## User Story
As an HR Admin, I can rely on automated reminders being sent so employees and managers complete their reviews on time.

## Acceptance Criteria
- Reminder sent 7 days before deadline
- Reminder sent 1 day before deadline
- Escalation email to HR Admin for still-incomplete reviews on the day of deadline

## Sub-tasks
- [ ] Scheduled job (Spring @Scheduled) to check review deadlines daily
- [ ] SES email: reminder to employee (self-assessment pending)
- [ ] SES email: reminder to manager (reviews pending)
- [ ] SES email: escalation to HR Admin (list of incomplete reviews)
- [ ] Push notification via FCM for mobile users"

echo "=== Phase 4 done. Creating Phase 5 Issues ==="

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can create and manage job postings" \
  --label "user-story,ats,backend,frontend,phase-5" \
  --milestone "Phase 5 — Recruitment / ATS" \
  --body "## User Story
As an HR Admin, I can create job postings with full descriptions, requirements, and publish them to the careers page.

## Acceptance Criteria
- Job has: title, department, location, type (FT/PT/contract), salary range, description, requirements
- Status: draft, published, closed
- Closing date optional

## Sub-tasks
- [ ] Flyway migration: jobs table
- [ ] CRUD endpoints for job postings
- [ ] Publish/close status transitions
- [ ] React: Job postings management list
- [ ] React: Job posting form (rich text description editor)
- [ ] React: Draft vs publish workflow"

gh issue create --repo "$REPO" \
  --title "As a candidate, I can browse open jobs on a public careers page" \
  --label "user-story,ats,frontend,phase-5" \
  --milestone "Phase 5 — Recruitment / ATS" \
  --body "## User Story
As a job candidate, I can visit a company's careers page, browse open positions, and click to apply — all without logging in.

## Acceptance Criteria
- Careers page accessible at /careers/{company-slug} (no auth required)
- Jobs filterable by department and location
- SEO-friendly page (meta tags, job posting structured data)

## Sub-tasks
- [ ] Public careers page route (/careers/:companySlug)
- [ ] GET /api/v1/public/jobs?companySlug= — public, unauthenticated endpoint
- [ ] React: CareersPage — job listing with filter/search
- [ ] React: JobDetailPage — full description + apply button
- [ ] SEO: meta tags, Open Graph, JSON-LD job posting schema"

gh issue create --repo "$REPO" \
  --title "As a candidate, I can apply for a job and upload my CV" \
  --label "user-story,ats,backend,frontend,phase-5" \
  --milestone "Phase 5 — Recruitment / ATS" \
  --body "## User Story
As a candidate, I can fill out an application form and upload my CV for a job I am interested in.

## Acceptance Criteria
- No account needed to apply
- CV stored in S3 (same bucket as employee documents, different prefix)
- Duplicate application (same email + job) is blocked with helpful message

## Sub-tasks
- [ ] Flyway migration: candidates table, applications table
- [ ] POST /api/v1/public/applications — create application + CV upload to S3
- [ ] Duplicate detection (email + job ID)
- [ ] Application confirmation email to candidate (SES)
- [ ] New application notification email to HR Admin
- [ ] React: ApplicationForm — personal details, cover letter, CV upload"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can manage candidates through a Kanban pipeline" \
  --label "user-story,ats,frontend,phase-5" \
  --milestone "Phase 5 — Recruitment / ATS" \
  --body "## User Story
As an HR Admin, I can move candidates through pipeline stages using a visual Kanban board.

## Acceptance Criteria
- Stages: Applied → Screening → Interview → Offer → Hired / Rejected
- Drag-and-drop between stages
- Stage change triggers notification to relevant parties

## Sub-tasks
- [ ] Flyway migration: pipeline_stages table, stage transition history
- [ ] PUT /api/v1/applications/{id}/stage — move candidate to new stage
- [ ] React: Kanban board (react-beautiful-dnd or @dnd-kit)
- [ ] React: candidate card (name, role applied, date, CV link)
- [ ] React: stage transition email trigger
- [ ] React: bulk stage update for multiple candidates"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can schedule interviews and record notes" \
  --label "user-story,ats,backend,frontend,phase-5" \
  --milestone "Phase 5 — Recruitment / ATS" \
  --body "## User Story
As an HR Admin, I can schedule interviews for candidates, assign interviewers, and record notes after the interview.

## Acceptance Criteria
- Interview has: date/time, interviewer(s), format (video/phone/in-person), location/link
- Candidate and interviewers notified by email
- Interview notes added post-interview

## Sub-tasks
- [ ] Flyway migration: interviews table
- [ ] CRUD endpoints for interviews
- [ ] Interviewer assignment (link to users)
- [ ] Calendar invite email generation (ICS file attachment)
- [ ] Post-interview notes endpoint
- [ ] React: Interview scheduler form
- [ ] React: Interview timeline on candidate profile"

gh issue create --repo "$REPO" \
  --title "As an interviewer, I can submit a scorecard for a candidate" \
  --label "user-story,ats,backend,frontend,phase-5" \
  --milestone "Phase 5 — Recruitment / ATS" \
  --body "## User Story
As an interviewer, I can submit a structured scorecard after an interview to help the team make a consistent hiring decision.

## Acceptance Criteria
- Scorecard tied to an interview and candidate
- Ratings per competency + overall recommendation (strong hire / hire / no hire)
- Aggregate score visible to HR Admin after all interviewers submit

## Sub-tasks
- [ ] Flyway migration: scorecards table
- [ ] Scorecard submission endpoint
- [ ] Aggregate score calculation
- [ ] React: Scorecard submission form
- [ ] React: Scorecard summary view on candidate profile
- [ ] React: Hiring decision panel (aggregate scores + recommendation counts)"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can generate and send offer letters" \
  --label "user-story,ats,backend,frontend,phase-5" \
  --milestone "Phase 5 — Recruitment / ATS" \
  --body "## User Story
As an HR Admin, I can generate a professional offer letter from a template and send it to the candidate for acceptance.

## Acceptance Criteria
- Template supports variable substitution (name, role, salary, start date, etc.)
- Letter generated as PDF
- Candidate can accept or decline via a link (no account needed)
- Acceptance recorded with timestamp

## Sub-tasks
- [ ] Flyway migration: offer_letters table
- [ ] Offer letter template engine (variable substitution)
- [ ] PDF generation and storage in S3
- [ ] POST /api/v1/offers/{id}/send — email offer to candidate
- [ ] Public acceptance/decline endpoint (token-based, no login)
- [ ] React: Offer letter generator form
- [ ] React: Offer letter preview before sending"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can convert a hired candidate into an employee with one click" \
  --label "user-story,ats,backend,frontend,phase-5" \
  --milestone "Phase 5 — Recruitment / ATS" \
  --body "## User Story
As an HR Admin, after a candidate accepts an offer, I can convert them into an employee record without re-entering data.

## Acceptance Criteria
- Candidate data (name, email, role, department, start date) pre-fills the employee form
- Application is linked to the new employee record
- Onboarding welcome email sent automatically

## Sub-tasks
- [ ] POST /api/v1/applications/{id}/convert-to-employee
- [ ] Auto-populate employee fields from candidate record
- [ ] Link application record to new employee ID
- [ ] Trigger welcome email (same as company registration flow)
- [ ] React: Convert to Employee button on hired candidate profile
- [ ] React: pre-filled EmployeeForm with confirmation step"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can view recruitment analytics" \
  --label "user-story,ats,dashboard,frontend,phase-5" \
  --milestone "Phase 5 — Recruitment / ATS" \
  --body "## User Story
As an HR Admin, I can see key recruitment metrics to understand hiring performance and pipeline health.

## Acceptance Criteria
- Time-to-hire per role
- Application source tracking (where candidates found the job)
- Pipeline conversion rates per stage

## Sub-tasks
- [ ] GET /api/v1/analytics/recruitment — key metrics
- [ ] Source tracking field on application (LinkedIn, Indeed, direct, referral, etc.)
- [ ] Time-to-hire calculation (application date → offer accepted date)
- [ ] React: Recruitment analytics dashboard
- [ ] React: Pipeline funnel chart (applications per stage)
- [ ] React: Time-to-hire trend chart
- [ ] CSV export for recruitment data"

echo "=== Phase 5 done. Creating Phase 6 Issues ==="

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can configure payroll settings for each employee" \
  --label "user-story,payroll,backend,frontend,phase-6" \
  --milestone "Phase 6 — Payroll UK" \
  --body "## User Story
As an HR Admin, I can set up the payroll details for each employee including salary, tax code, NI category, pension enrollment, and bank details.

## Acceptance Criteria
- Bank details stored encrypted at rest
- Tax code validated against UK format (e.g. 1257L)
- NI category validated (A, B, C, D, H, J, M, Z)

## Sub-tasks
- [ ] Flyway migration: employee_payroll table (salary, pay_frequency, tax_code, ni_category, pension_enrolled, bank details encrypted)
- [ ] CRUD endpoints for employee payroll settings
- [ ] Bank detail encryption (AES-256 via AWS KMS or Secrets Manager)
- [ ] UK tax code format validation
- [ ] NI category validation
- [ ] React: Employee Payroll Settings tab on employee profile
- [ ] React: bank details form (masked display after save)"

gh issue create --repo "$REPO" \
  --title "As a Payroll Admin, I can run the monthly payroll" \
  --label "user-story,payroll,backend,frontend,phase-6" \
  --milestone "Phase 6 — Payroll UK" \
  --body "## User Story
As a Payroll Admin, I can initiate, review, and finalise the monthly payroll run for all employees.

## Acceptance Criteria
- Payroll run is a multi-step wizard (initiate → calculate → review → finalise)
- Finalized payroll is immutable (no edits after finalisation)
- Run includes all active employees with payroll configured

## Sub-tasks
- [ ] Flyway migration: payroll_runs table, payroll_run_items table (one per employee per run)
- [ ] POST /api/v1/payroll/runs — initiate run
- [ ] POST /api/v1/payroll/runs/{id}/calculate — trigger calculation engine
- [ ] POST /api/v1/payroll/runs/{id}/finalise — lock run
- [ ] React: Payroll run wizard (initiate → review → confirm)
- [ ] React: per-employee payroll detail (gross, deductions, net)
- [ ] React: run summary before finalisation"

gh issue create --repo "$REPO" \
  --title "System calculates PAYE and National Insurance correctly" \
  --label "user-story,payroll,backend,phase-6" \
  --milestone "Phase 6 — Payroll UK" \
  --body "## User Story
As a Payroll Admin, I can trust that the system automatically calculates the correct PAYE income tax and National Insurance for each employee based on UK HMRC rules.

## Acceptance Criteria
- Tax bands correct for 2026/27 tax year
- NI calculated correctly per category (employee + employer)
- Tax code applied correctly to determine personal allowance
- Calculation engine unit-tested with HMRC examples

## Sub-tasks
- [ ] UK 2026/27 tax bands implementation (personal allowance, basic, higher, additional rate)
- [ ] Tax code parser (handles standard codes like 1257L, BR, D0, NT, K codes)
- [ ] NI Category A calculation (employee 8% + employer 13.8% on qualifying earnings)
- [ ] NI Category B, C, D, H, J, M, Z implementations
- [ ] Net pay derivation (gross - income tax - employee NI - pension contributions)
- [ ] Unit tests for all tax band edge cases using HMRC test vectors
- [ ] Annual vs monthly vs weekly pay period handling"

gh issue create --repo "$REPO" \
  --title "System calculates statutory pay (SSP, SMP, SPP) correctly" \
  --label "user-story,payroll,backend,phase-6" \
  --milestone "Phase 6 — Payroll UK" \
  --body "## User Story
As a Payroll Admin, I can trust the system to calculate the correct statutory pay for sick leave, maternity, and paternity.

## Acceptance Criteria
- SSP rate correct and eligibility checked (min earnings threshold)
- SMP calculated at 90% for first 6 weeks then statutory rate for remaining 33
- SPP calculated per HMRC current rates
- Integrated with leave records for accurate date ranges

## Sub-tasks
- [ ] SSP: eligibility check (Average Weekly Earnings >= lower earnings limit), daily SSP rate calculation
- [ ] SMP: 6-week 90% period + 33-week statutory rate calculation
- [ ] SPP: 2-week statutory rate calculation
- [ ] Integration with leave_requests table for date ranges
- [ ] Statutory pay fields on payroll_run_items
- [ ] HMRC reclaim calculations (employer reclaim for statutory pay)
- [ ] Unit tests with HMRC example calculations"

gh issue create --repo "$REPO" \
  --title "System supports auto-enrolment pension contributions" \
  --label "user-story,payroll,backend,frontend,phase-6" \
  --milestone "Phase 6 — Payroll UK" \
  --body "## User Story
As a Payroll Admin, I can manage auto-enrolment pension contributions for eligible employees, complying with The Pensions Regulator requirements.

## Acceptance Criteria
- Auto-enrolment eligibility assessed on each payroll run
- Minimum contributions: 5% employee, 3% employer (total 8%)
- Employees can opt out — opt-out period tracked
- Pension provider export file generated

## Sub-tasks
- [ ] Auto-enrolment eligibility assessment (age 22-SPA, earnings above threshold)
- [ ] Pension contribution calculation (qualifying earnings basis)
- [ ] Opt-out handling and re-enrolment cycle (every 3 years)
- [ ] Support for NEST and The People's Pension provider formats
- [ ] Pension contribution data on payroll run items
- [ ] React: pension enrollment settings per employee
- [ ] Pension export file generation (CSV per provider spec)"

gh issue create --repo "$REPO" \
  --title "As a Payroll Admin, I can submit RTI reports to HMRC" \
  --label "user-story,payroll,backend,phase-6" \
  --milestone "Phase 6 — Payroll UK" \
  --body "## User Story
As a Payroll Admin, I can submit the Full Payment Submission (FPS) to HMRC after each payroll run, as required by Real Time Information legislation.

## Acceptance Criteria
- FPS XML generated to HMRC schema specification
- Submission to HMRC test gateway before production
- Submission status tracked (submitted, acknowledged, error)

## Sub-tasks
- [ ] FPS XML schema implementation (HMRC RTI schema)
- [ ] Employer details section (PAYE reference, accounts office reference)
- [ ] Employee payment details section (per employee per period)
- [ ] HMRC RTI API integration (test gateway first)
- [ ] Submission status tracking and error handling
- [ ] EPS (Employer Payment Summary) for statutory reclaims
- [ ] React: RTI submission panel in payroll run workflow"

gh issue create --repo "$REPO" \
  --title "As an Employee, I receive a payslip after each payroll run" \
  --label "user-story,payroll,backend,frontend,phase-6" \
  --milestone "Phase 6 — Payroll UK" \
  --body "## User Story
As an Employee, I receive my payslip after each payroll run and can view it in the app and download it as a PDF.

## Acceptance Criteria
- Payslip PDF generated automatically on payroll finalisation
- Emailed to employee and available in the app
- Shows full breakdown: gross pay, all deductions, net pay, YTD figures

## Sub-tasks
- [ ] Payslip PDF template (HMRC-compliant layout)
- [ ] PDF generation on payroll run finalisation (iText or similar)
- [ ] S3 storage for payslip PDFs
- [ ] SES email with payslip attached on finalisation
- [ ] GET /api/v1/payslips/me — employee list of own payslips
- [ ] GET /api/v1/payslips/{id}/download — pre-signed S3 URL
- [ ] React: Payslips page on employee self-service
- [ ] React: payslip detail view with PDF viewer"

gh issue create --repo "$REPO" \
  --title "As a Payroll Admin, I can export a BACS payment file" \
  --label "user-story,payroll,backend,phase-6" \
  --milestone "Phase 6 — Payroll UK" \
  --body "## User Story
As a Payroll Admin, I can download a BACS-formatted file after finalising payroll to submit to the bank for employee salary payments.

## Acceptance Criteria
- BACS Standard 18 format
- One payment record per employee
- File validated before download (totals match payroll run)

## Sub-tasks
- [ ] BACS Standard 18 file format implementation
- [ ] Net pay per employee mapped to BACS payment record
- [ ] File total validation (sum of payments == payroll run total)
- [ ] GET /api/v1/payroll/runs/{id}/bacs-export — download BACS file
- [ ] Audit log entry on each BACS file download"

gh issue create --repo "$REPO" \
  --title "As a Payroll Admin, I can view payroll history and audit trail" \
  --label "user-story,payroll,backend,frontend,phase-6" \
  --milestone "Phase 6 — Payroll UK" \
  --body "## User Story
As a Payroll Admin, I can view all past payroll runs with full detail and an immutable audit trail for compliance purposes.

## Acceptance Criteria
- All past runs listed with status and totals
- Each run drills down to per-employee breakdown
- Audit log shows who did what and when (cannot be edited)

## Sub-tasks
- [ ] GET /api/v1/payroll/runs — paginated list of all runs
- [ ] GET /api/v1/payroll/runs/{id} — full run detail with employee breakdown
- [ ] Immutable audit log table (INSERT only, no UPDATE/DELETE)
- [ ] React: Payroll History page
- [ ] React: Run detail drilldown (per employee gross/net/tax/NI)
- [ ] CSV/PDF export for payroll run report"

gh issue create --repo "$REPO" \
  --title "As a Payroll Admin, I can generate year-end P60 certificates" \
  --label "user-story,payroll,backend,frontend,phase-6" \
  --milestone "Phase 6 — Payroll UK" \
  --body "## User Story
As a Payroll Admin, at the end of the tax year I can generate P60 certificates for all employees in employment on 5 April.

## Acceptance Criteria
- P60 PDF matches HMRC layout specification
- Bulk generation for all eligible employees
- Employees can download their P60 from self-service

## Sub-tasks
- [ ] Annual tax/NI totals calculation per employee (from payroll run items)
- [ ] P60 PDF template (HMRC approved layout)
- [ ] Bulk P60 generation for all eligible employees
- [ ] S3 storage and SES distribution on generation
- [ ] GET /api/v1/p60s?year= — list P60s for a tax year
- [ ] Employee self-service P60 download
- [ ] React: P60 generation panel in year-end section"

echo "=== Phase 6 done. Creating Phase 7 Issues ==="

gh issue create --repo "$REPO" \
  --title "As a developer, I can access the platform via a documented public REST API" \
  --label "user-story,integration,backend,phase-7" \
  --milestone "Phase 7 — Integrations & Scale" \
  --body "## User Story
As an external developer or partner, I can integrate with the HR platform via a stable, documented REST API using API keys.

## Acceptance Criteria
- API keys issued per company via admin panel
- Rate limiting enforced (100 req/min default)
- OpenAPI/Swagger documentation auto-generated
- Webhook event subscriptions manageable via API

## Sub-tasks
- [ ] API key generation and management (keys stored hashed)
- [ ] API key authentication filter (alternative to JWT for machine clients)
- [ ] Rate limiting per API key (Bucket4j or AWS WAF)
- [ ] OpenAPI 3.0 spec auto-generation (springdoc-openapi)
- [ ] Swagger UI endpoint (/api/v1/docs)
- [ ] Webhook registration endpoints (subscribe to events)
- [ ] Webhook delivery engine (HTTP POST with HMAC signature)
- [ ] React: Developer settings page (API keys + webhook config)"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can enable Google Workspace or Microsoft 365 SSO" \
  --label "user-story,integration,auth,backend,frontend,phase-7" \
  --milestone "Phase 7 — Integrations & Scale" \
  --body "## User Story
As an HR Admin, I can configure SSO so my team logs in with their existing Google or Microsoft work accounts instead of a separate password.

## Acceptance Criteria
- Existing users matched by email on first SSO login
- New users auto-provisioned on first SSO login with EMPLOYEE role
- HR Admin can force SSO-only login (disable password auth)

## Sub-tasks
- [ ] Spring Security OAuth2 client config (Google OIDC)
- [ ] Spring Security OAuth2 client config (Microsoft Entra ID / Azure AD)
- [ ] User matching/provisioning on first SSO login
- [ ] Force SSO flag per company (disable password login)
- [ ] React: SSO configuration in company settings
- [ ] React: Google/Microsoft login buttons on login page"

gh issue create --repo "$REPO" \
  --title "As a Payroll Admin, I can export payroll data to Xero or QuickBooks" \
  --label "user-story,integration,payroll,backend,phase-7" \
  --milestone "Phase 7 — Integrations & Scale" \
  --body "## User Story
As a Payroll Admin, I can sync payroll journal entries directly to my accounting software after each payroll run.

## Acceptance Criteria
- Payroll journal exported as a Xero or QuickBooks compatible format
- Mapping between payroll categories and accounting chart of accounts is configurable
- Sync status tracked per payroll run

## Sub-tasks
- [ ] Xero API OAuth2 integration
- [ ] Xero payroll journal export (manual journal format)
- [ ] QuickBooks Online API integration
- [ ] Chart of accounts mapping configuration UI
- [ ] Sync status tracking per payroll run
- [ ] React: Accounting integration settings page"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can receive HR notifications in Slack or Microsoft Teams" \
  --label "user-story,integration,backend,phase-7" \
  --milestone "Phase 7 — Integrations & Scale" \
  --body "## User Story
As an HR Admin, I can connect Slack or Teams so that key HR events (leave approvals, new hires, review reminders) appear in a designated channel.

## Acceptance Criteria
- HR Admin authorises app via OAuth
- Configurable: choose which events trigger notifications and which channel
- Notifications are formatted clearly with action links

## Sub-tasks
- [ ] Slack App setup and OAuth2 flow
- [ ] Slack Web API: post message to channel
- [ ] Teams incoming webhook setup
- [ ] Notification event routing to Slack/Teams
- [ ] React: Slack/Teams integration settings (channel config, event toggles)"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can post job listings directly to LinkedIn and Indeed" \
  --label "user-story,integration,ats,backend,phase-7" \
  --milestone "Phase 7 — Integrations & Scale" \
  --body "## User Story
As an HR Admin, I can publish a job posting to LinkedIn and Indeed with one click from within the platform, and track which board each application came from.

## Acceptance Criteria
- One-click post from job detail page
- Application source auto-tagged when candidate applies via external board
- Posting status synced (active/closed) between platform and boards

## Sub-tasks
- [ ] LinkedIn Jobs API integration
- [ ] Indeed Publisher API integration
- [ ] Source tracking parameter in application URL
- [ ] Posting sync (close job on board when closed in platform)
- [ ] React: Post to job boards button on job posting page"

gh issue create --repo "$REPO" \
  --title "As an Enterprise customer, I can white-label the platform with my branding" \
  --label "user-story,integration,frontend,phase-7" \
  --milestone "Phase 7 — Integrations & Scale" \
  --body "## User Story
As an Enterprise customer, I can apply my company logo, brand colours, and custom domain to the platform so it feels native to my organisation.

## Acceptance Criteria
- Custom logo replaces HR app logo throughout
- Primary colour configurable (used for buttons, highlights)
- Custom domain (CNAME) points to the platform
- Branded login page and email templates

## Sub-tasks
- [ ] Brand settings table (logo_url, primary_colour, custom_domain)
- [ ] CSS variable injection from company brand settings
- [ ] Custom domain routing (CloudFront CNAME support)
- [ ] Branded email templates (SES template variables)
- [ ] React: Brand settings page in company admin
- [ ] React: live brand preview in settings"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can build custom reports with an advanced report builder" \
  --label "user-story,integration,dashboard,frontend,phase-7" \
  --milestone "Phase 7 — Integrations & Scale" \
  --body "## User Story
As an HR Admin, I can build my own reports by selecting fields from across the platform and applying filters, then save and schedule them.

## Acceptance Criteria
- Report builder supports fields from: employees, leave, payroll, performance
- Filters: date ranges, departments, employment status, etc.
- Saved reports can be scheduled to email on a recurring basis

## Sub-tasks
- [ ] Report builder API (dynamic query generation with company_id scoping)
- [ ] Field registry (available fields per domain, with labels)
- [ ] Report save and schedule configuration
- [ ] Scheduled email delivery of reports (cron + SES)
- [ ] React: Drag-and-drop report builder UI
- [ ] React: Saved reports list
- [ ] Export: CSV, PDF, Excel"

gh issue create --repo "$REPO" \
  --title "As a user, I can request a GDPR data export or deletion" \
  --label "user-story,integration,backend,frontend,phase-7" \
  --milestone "Phase 7 — Integrations & Scale" \
  --body "## User Story
As a user, I can exercise my GDPR rights by requesting a full export of my personal data or requesting that my data be deleted from the platform.

## Acceptance Criteria
- Data export delivered as JSON/CSV within 72 hours (or immediately if possible)
- Deletion anonymises personal data (name, email, DOB, address) — does not break financial records
- All requests logged with timestamp and actioning user

## Sub-tasks
- [ ] Data export service (collect all personal data for a user across all tables)
- [ ] Export packaging (JSON + CSV zip, delivered via email link)
- [ ] Anonymisation service (replace personal fields with anonymised values, retain aggregate data)
- [ ] GDPR request log table (immutable audit)
- [ ] React: GDPR requests section in HR Admin settings
- [ ] React: Employee self-service data export request button"

gh issue create --repo "$REPO" \
  --title "As an HR Admin, I can enforce two-factor authentication for my team" \
  --label "user-story,integration,auth,backend,frontend,phase-7" \
  --milestone "Phase 7 — Integrations & Scale" \
  --body "## User Story
As an HR Admin, I can require all users in my company to set up 2FA, adding an extra layer of security to the platform.

## Acceptance Criteria
- Users can set up TOTP 2FA (Google Authenticator / Authy)
- HR Admin can enforce 2FA — users without it set up are blocked on login
- Backup codes generated on 2FA setup
- Account recovery flow if 2FA device is lost

## Sub-tasks
- [ ] TOTP secret generation and QR code endpoint
- [ ] TOTP verification on login (second factor)
- [ ] Backup codes generation (8 codes, hashed in DB)
- [ ] Backup code consumption (one-time use)
- [ ] Company-level enforce 2FA setting
- [ ] Login flow: block and redirect to 2FA setup if enforce is on
- [ ] React: 2FA setup flow (QR code, verify, backup codes)
- [ ] React: 2FA enforcement toggle in company security settings"

gh issue create --repo "$REPO" \
  --title "[Scale] Performance and load testing at scale" \
  --label "infrastructure,integration,backend,phase-7" \
  --milestone "Phase 7 — Integrations & Scale" \
  --body "## Description
Verify the platform performs reliably under production-scale load (10,000+ concurrent users) before opening to Enterprise customers.

## Acceptance Criteria
- API response time < 500ms at p95 under target load
- No degradation up to 10,000 concurrent users
- Load test results integrated into CI as a regression check

## Sub-tasks
- [ ] Load test suite using k6 (script key user journeys: login, list employees, submit leave)
- [ ] Baseline performance benchmark (single user)
- [ ] Ramp test: 10 → 100 → 1000 → 10000 concurrent users
- [ ] Database query analysis (slow query log, EXPLAIN ANALYZE on hot paths)
- [ ] Add indexes for common query patterns (company_id + status, employee search)
- [ ] Redis caching layer for session tokens and hot-read data
- [ ] CloudFront cache rules tuning for static assets
- [ ] ECS auto-scaling policy (scale out at 70% CPU)
- [ ] Performance regression check in CI (alert if p95 degrades > 20%)"

echo "=== ALL ISSUES CREATED ==="
