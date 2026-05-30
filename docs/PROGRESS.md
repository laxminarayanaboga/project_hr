# Project Progress

> **How to read this file**
> - ✅ Done — built, tested, merged
> - 🔄 In Progress — currently being worked on
> - ⏭ Deferred — intentionally skipped for now (see note)
> - ⬜ Not Started — next in queue or backlog
>
> Pick up the **first ⬜ item** at the top of the current phase.
> Update status here whenever a story starts or completes.

---

## Phase 1 — Foundation + Employee Management
> Target: Months 1–3 | Milestone: [Phase 1](https://github.com/laxminarayanaboga/project_hr/milestone/1)

### Week 1–2: Project Setup
| Status | Issue | Story |
|--------|-------|-------|
| ✅ | [#1](https://github.com/laxminarayanaboga/project_hr/issues/1) | Monorepo structure & project scaffolding |
| ✅ | [#2](https://github.com/laxminarayanaboga/project_hr/issues/2) | Docker Compose local dev environment |
| ⏭ | [#3](https://github.com/laxminarayanaboga/project_hr/issues/3) | Terraform AWS infrastructure *(skeleton written, deploy deferred — personal AWS account)* |
| ⏭ | [#4](https://github.com/laxminarayanaboga/project_hr/issues/4) | GitHub Actions CI/CD *(skeleton written, auto-triggers disabled — re-enable at staging deploy)* |

### Week 3–4: Authentication
| Status | Issue | Story |
|--------|-------|-------|
| ✅ | [#5](https://github.com/laxminarayanaboga/project_hr/issues/5) | Company registration — POST /auth/register |
| ✅ | [#6](https://github.com/laxminarayanaboga/project_hr/issues/6) | User login with JWT — POST /auth/login |
| ✅ | [#7](https://github.com/laxminarayanaboga/project_hr/issues/7) | Token refresh & logout |
| ✅ | [#8](https://github.com/laxminarayanaboga/project_hr/issues/8) | Password reset flow |

### Week 5–6: Company Profile + Departments
| Status | Issue | Story |
|--------|-------|-------|
| ✅ | [#9](https://github.com/laxminarayanaboga/project_hr/issues/9) | Company profile management |
| ✅ | [#10](https://github.com/laxminarayanaboga/project_hr/issues/10) | Department CRUD |
| ✅ | [#11](https://github.com/laxminarayanaboga/project_hr/issues/11) | Org chart tree |

### Week 7–9: Employee Management
| Status | Issue | Story |
|--------|-------|-------|
| ✅ | [#12](https://github.com/laxminarayanaboga/project_hr/issues/12) | Create employee profile |
| ✅ | [#13](https://github.com/laxminarayanaboga/project_hr/issues/13) | List & search employees |
| ✅ | [#14](https://github.com/laxminarayanaboga/project_hr/issues/14) | View & edit employee profile |
| ✅ | [#15](https://github.com/laxminarayanaboga/project_hr/issues/15) | Deactivate employee (soft delete) |

### Week 10–11: Documents
| Status | Issue | Story |
|--------|-------|-------|
| ⬜ | [#16](https://github.com/laxminarayanaboga/project_hr/issues/16) | Upload employee document to S3 |
| ⬜ | [#17](https://github.com/laxminarayanaboga/project_hr/issues/17) | View & download employee documents |

### Week 12: Dashboard + Polish
| Status | Issue | Story |
|--------|-------|-------|
| ⬜ | [#18](https://github.com/laxminarayanaboga/project_hr/issues/18) | Dashboard stats & RBAC |

---

## Phase 2 — Leave & Attendance
> Target: Months 3–5 | Milestone: [Phase 2](https://github.com/laxminarayanaboga/project_hr/milestone/2)
> Status: ⬜ Not started — begins after Phase 1 is complete

| Status | Issue | Story |
|--------|-------|-------|
| ⬜ | [#19](https://github.com/laxminarayanaboga/project_hr/issues/19) | Leave type configuration |
| ⬜ | [#20](https://github.com/laxminarayanaboga/project_hr/issues/20) | Employee leave request submission |
| ⬜ | [#21](https://github.com/laxminarayanaboga/project_hr/issues/21) | Manager leave approval workflow |
| ⬜ | [#22](https://github.com/laxminarayanaboga/project_hr/issues/22) | Multi-level approval configuration |
| ⬜ | [#23](https://github.com/laxminarayanaboga/project_hr/issues/23) | Leave balance tracking & accruals |
| ⬜ | [#24](https://github.com/laxminarayanaboga/project_hr/issues/24) | UK public holiday calendar |
| ⬜ | [#25](https://github.com/laxminarayanaboga/project_hr/issues/25) | Web clock-in / clock-out |
| ⬜ | [#26](https://github.com/laxminarayanaboga/project_hr/issues/26) | Overtime tracking |
| ⬜ | [#27](https://github.com/laxminarayanaboga/project_hr/issues/27) | Leave & absence reports export |
| ⬜ | [#28](https://github.com/laxminarayanaboga/project_hr/issues/28) | Manager team leave dashboard |
| ⬜ | [#29](https://github.com/laxminarayanaboga/project_hr/issues/29) | Leave email alerts |

---

## Phase 3 — Mobile App
> Target: Months 5–7 | Milestone: [Phase 3](https://github.com/laxminarayanaboga/project_hr/milestone/3)

| Status | Issue | Story |
|--------|-------|-------|
| ⬜ | [#30](https://github.com/laxminarayanaboga/project_hr/issues/30) | React Native app setup |
| ⬜ | [#31](https://github.com/laxminarayanaboga/project_hr/issues/31) | Mobile login & secure session |
| ⬜ | [#32](https://github.com/laxminarayanaboga/project_hr/issues/32) | Employee directory on mobile |
| ⬜ | [#33](https://github.com/laxminarayanaboga/project_hr/issues/33) | Leave request & approval on mobile |
| ⬜ | [#34](https://github.com/laxminarayanaboga/project_hr/issues/34) | Attendance clock-in/out on mobile |
| ⬜ | [#35](https://github.com/laxminarayanaboga/project_hr/issues/35) | Push notifications |
| ⬜ | [#36](https://github.com/laxminarayanaboga/project_hr/issues/36) | Payslip viewing on mobile |
| ⬜ | [#37](https://github.com/laxminarayanaboga/project_hr/issues/37) | App Store & Google Play submission |

---

## Phase 4 — Performance Reviews
> Target: Months 7–9 | Milestone: [Phase 4](https://github.com/laxminarayanaboga/project_hr/milestone/4)

| Status | Issue | Story |
|--------|-------|-------|
| ⬜ | [#38](https://github.com/laxminarayanaboga/project_hr/issues/38) | Review cycle setup |
| ⬜ | [#39](https://github.com/laxminarayanaboga/project_hr/issues/39) | Goal setting & OKR tracking |
| ⬜ | [#40](https://github.com/laxminarayanaboga/project_hr/issues/40) | Self-assessment forms |
| ⬜ | [#41](https://github.com/laxminarayanaboga/project_hr/issues/41) | Manager review & scoring |
| ⬜ | [#42](https://github.com/laxminarayanaboga/project_hr/issues/42) | 360-degree peer feedback |
| ⬜ | [#43](https://github.com/laxminarayanaboga/project_hr/issues/43) | Customisable review templates |
| ⬜ | [#44](https://github.com/laxminarayanaboga/project_hr/issues/44) | Performance history timeline |
| ⬜ | [#45](https://github.com/laxminarayanaboga/project_hr/issues/45) | Performance analytics dashboard |
| ⬜ | [#46](https://github.com/laxminarayanaboga/project_hr/issues/46) | Automated review reminders |

---

## Phase 5 — Recruitment / ATS
> Target: Months 9–11 | Milestone: [Phase 5](https://github.com/laxminarayanaboga/project_hr/milestone/5)

| Status | Issue | Story |
|--------|-------|-------|
| ⬜ | [#47](https://github.com/laxminarayanaboga/project_hr/issues/47) | Job posting management |
| ⬜ | [#48](https://github.com/laxminarayanaboga/project_hr/issues/48) | Public careers page |
| ⬜ | [#49](https://github.com/laxminarayanaboga/project_hr/issues/49) | Candidate application & CV upload |
| ⬜ | [#50](https://github.com/laxminarayanaboga/project_hr/issues/50) | Kanban candidate pipeline |
| ⬜ | [#51](https://github.com/laxminarayanaboga/project_hr/issues/51) | Interview scheduling & notes |
| ⬜ | [#52](https://github.com/laxminarayanaboga/project_hr/issues/52) | Scorecards & team feedback |
| ⬜ | [#53](https://github.com/laxminarayanaboga/project_hr/issues/53) | Offer letter generation |
| ⬜ | [#54](https://github.com/laxminarayanaboga/project_hr/issues/54) | Candidate to employee conversion |
| ⬜ | [#55](https://github.com/laxminarayanaboga/project_hr/issues/55) | Recruitment analytics |

---

## Phase 6 — Payroll UK
> Target: Months 11–13 | Milestone: [Phase 6](https://github.com/laxminarayanaboga/project_hr/milestone/6)

| Status | Issue | Story |
|--------|-------|-------|
| ⬜ | [#56](https://github.com/laxminarayanaboga/project_hr/issues/56) | Employee payroll setup |
| ⬜ | [#57](https://github.com/laxminarayanaboga/project_hr/issues/57) | Monthly payroll run |
| ⬜ | [#58](https://github.com/laxminarayanaboga/project_hr/issues/58) | PAYE & NI calculations |
| ⬜ | [#59](https://github.com/laxminarayanaboga/project_hr/issues/59) | Statutory pay (SSP, SMP, SPP) |
| ⬜ | [#60](https://github.com/laxminarayanaboga/project_hr/issues/60) | Auto-enrolment pension |
| ⬜ | [#61](https://github.com/laxminarayanaboga/project_hr/issues/61) | HMRC RTI submission (FPS) |
| ⬜ | [#62](https://github.com/laxminarayanaboga/project_hr/issues/62) | Payslip generation & distribution |
| ⬜ | [#63](https://github.com/laxminarayanaboga/project_hr/issues/63) | BACS bank transfer export |
| ⬜ | [#64](https://github.com/laxminarayanaboga/project_hr/issues/64) | Payroll history & audit trail |
| ⬜ | [#65](https://github.com/laxminarayanaboga/project_hr/issues/65) | Year-end P60 generation |

---

## Phase 7 — Integrations & Scale
> Target: Months 13–15 | Milestone: [Phase 7](https://github.com/laxminarayanaboga/project_hr/milestone/7)

| Status | Issue | Story |
|--------|-------|-------|
| ⬜ | [#66](https://github.com/laxminarayanaboga/project_hr/issues/66) | Public REST API & Webhooks |
| ⬜ | [#67](https://github.com/laxminarayanaboga/project_hr/issues/67) | Google Workspace / M365 SSO |
| ⬜ | [#68](https://github.com/laxminarayanaboga/project_hr/issues/68) | Xero / QuickBooks payroll export |
| ⬜ | [#69](https://github.com/laxminarayanaboga/project_hr/issues/69) | Slack / Teams notifications |
| ⬜ | [#70](https://github.com/laxminarayanaboga/project_hr/issues/70) | LinkedIn / Indeed job board |
| ⬜ | [#71](https://github.com/laxminarayanaboga/project_hr/issues/71) | White-labeling |
| ⬜ | [#72](https://github.com/laxminarayanaboga/project_hr/issues/72) | Advanced analytics & report builder |
| ⬜ | [#73](https://github.com/laxminarayanaboga/project_hr/issues/73) | GDPR tools |
| ⬜ | [#74](https://github.com/laxminarayanaboga/project_hr/issues/74) | 2FA enforcement |
| ⬜ | [#75](https://github.com/laxminarayanaboga/project_hr/issues/75) | Performance & load testing at scale |
