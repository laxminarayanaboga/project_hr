#!/bin/bash
set -e
REPO="laxminarayanaboga/project_hr"

echo "=== Creating Labels ==="
gh label create "user-story" --color "0075ca" --description "User story" --repo $REPO --force
gh label create "infrastructure" --color "e4e669" --description "Infrastructure & DevOps" --repo $REPO --force
gh label create "auth" --color "d93f0b" --description "Authentication & Authorization" --repo $REPO --force
gh label create "employee" --color "0e8a16" --description "Employee management" --repo $REPO --force
gh label create "department" --color "1d76db" --description "Department & org structure" --repo $REPO --force
gh label create "document" --color "5319e7" --description "Document management" --repo $REPO --force
gh label create "leave" --color "e99695" --description "Leave management" --repo $REPO --force
gh label create "attendance" --color "f9d0c4" --description "Attendance tracking" --repo $REPO --force
gh label create "payroll" --color "0052cc" --description "Payroll UK" --repo $REPO --force
gh label create "mobile" --color "b60205" --description "React Native mobile app" --repo $REPO --force
gh label create "ats" --color "006b75" --description "Applicant tracking system" --repo $REPO --force
gh label create "performance" --color "8B4513" --description "Performance reviews" --repo $REPO --force
gh label create "integration" --color "c2e0c6" --description "Third-party integrations" --repo $REPO --force
gh label create "dashboard" --color "bfd4f2" --description "Dashboard & analytics" --repo $REPO --force
gh label create "backend" --color "fef2c0" --description "Spring Boot backend" --repo $REPO --force
gh label create "frontend" --color "c5def5" --description "React frontend" --repo $REPO --force
gh label create "phase-1" --color "0075ca" --description "Phase 1: Foundation" --repo $REPO --force
gh label create "phase-2" --color "006400" --description "Phase 2: Leave & Attendance" --repo $REPO --force
gh label create "phase-3" --color "cc5500" --description "Phase 3: Mobile App" --repo $REPO --force
gh label create "phase-4" --color "6600cc" --description "Phase 4: Performance Reviews" --repo $REPO --force
gh label create "phase-5" --color "8B0057" --description "Phase 5: Recruitment ATS" --repo $REPO --force
gh label create "phase-6" --color "003399" --description "Phase 6: Payroll UK" --repo $REPO --force
gh label create "phase-7" --color "444444" --description "Phase 7: Integrations & Scale" --repo $REPO --force
echo "Labels done."

echo "=== Creating Milestones ==="
gh api repos/$REPO/milestones --method POST \
  -f title="Phase 1 — Foundation + Employee Management" \
  -f description="Working app: company registration, employee management, documents, RBAC, dashboard. Months 1-3." \
  -f due_on="2026-08-29T00:00:00Z" -f state="open" > /dev/null && echo "Milestone 1 created"

gh api repos/$REPO/milestones --method POST \
  -f title="Phase 2 — Leave & Attendance" \
  -f description="Core day-to-day HR: leave requests, approvals, balances, UK holidays, clock-in/out, reports. Months 3-5." \
  -f due_on="2026-10-29T00:00:00Z" -f state="open" > /dev/null && echo "Milestone 2 created"

gh api repos/$REPO/milestones --method POST \
  -f title="Phase 3 — Mobile App" \
  -f description="React Native app (iOS & Android): login, directory, leave, attendance, push notifications, payslips. Months 5-7." \
  -f due_on="2026-12-29T00:00:00Z" -f state="open" > /dev/null && echo "Milestone 3 created"

gh api repos/$REPO/milestones --method POST \
  -f title="Phase 4 — Performance Reviews" \
  -f description="Full performance cycle: goal setting, OKRs, self-assessment, 360 feedback, analytics. Months 7-9." \
  -f due_on="2027-02-28T00:00:00Z" -f state="open" > /dev/null && echo "Milestone 4 created"

gh api repos/$REPO/milestones --method POST \
  -f title="Phase 5 — Recruitment / ATS" \
  -f description="Hire-to-onboard: job postings, careers page, candidate pipeline, interviews, offer letters, conversion. Months 9-11." \
  -f due_on="2027-04-29T00:00:00Z" -f state="open" > /dev/null && echo "Milestone 5 created"

gh api repos/$REPO/milestones --method POST \
  -f title="Phase 6 — Payroll UK" \
  -f description="UK-compliant payroll: PAYE, NI, RTI, statutory pay, pension, payslips, P60, BACS. Months 11-13." \
  -f due_on="2027-06-29T00:00:00Z" -f state="open" > /dev/null && echo "Milestone 6 created"

gh api repos/$REPO/milestones --method POST \
  -f title="Phase 7 — Integrations & Scale" \
  -f description="Open platform: REST API, SSO, third-party integrations, white-labeling, GDPR, 2FA, load testing. Months 13-15." \
  -f due_on="2027-08-29T00:00:00Z" -f state="open" > /dev/null && echo "Milestone 7 created"

echo "=== All labels and milestones created ==="
