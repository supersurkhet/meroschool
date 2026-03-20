# meroschool — Project Plan

## Phase 1: Foundation
- [x] Scaffold Turborepo monorepo (web, desktop, mobile)
- [x] Define Convex schema (18 tables)
- [ ] Set up Convex backend (auth, login)
- [ ] Set up WorkOS auth flow (login, signup, session management)
- [ ] Configure Tauri for desktop app
- [ ] Set up Expo Router for mobile app

## Phase 2: Core Features
- [ ] Role-based dashboards (student, teacher, parent, admin)
- [ ] Attendance system (bulk marking, QR check-in, tracking %)
- [ ] Study materials (class → subject → module → topic hierarchy)
- [ ] MCQ test engine (question bank, auto-evaluation, scoring)
- [ ] Homework/assignments (assign, submit, grade)

## Phase 3: Extended Features
- [ ] Progress tracking (per-student, visible to teacher + parent)
- [ ] Salary tracking for staff
- [ ] QR classroom (scan QR → join class space)
- [ ] Notifications (attendance alerts, test results to parents)
- [ ] CSV import/export (bulk enrollment, grade export)

## Phase 4: Polish
- [ ] i18n (English + Nepali)
- [ ] Dark mode + light mode
- [ ] Responsive design audit
- [ ] Write unit tests (Vitest)
- [ ] Write E2E tests (Playwright)

## Launch
- [ ] Final QA pass
- [ ] Deploy web to Cloudflare Workers (school.surkhet.app)
- [ ] Build desktop app with Tauri
- [ ] Build mobile app with EAS
- [ ] Verify production deployment
