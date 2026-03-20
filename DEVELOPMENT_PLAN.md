# MeroSchool — Development Plan

## Overview
- **Business Value**: Complete school management ecosystem for Surkhet, Nepal — digitizing attendance, academics, testing, and parent communication
- **Success Metrics**: Admin can manage school, teachers can mark attendance + create tests, students can take tests + view materials, parents get notifications
- **Domain**: school.surkhet.app
- **Priority**: High — all 4 workers are active

## Current State (Already Built)
- Turborepo monorepo scaffolded (web, desktop, mobile)
- Convex schema: 18 tables defined
- Convex functions: schools, people, academics, materials, attendance, tests, assignments, salary, notifications, progress
- Web app: landing pages (home, features, pricing, about, contact, demo, onboard), UI components, i18n skeleton, theme
- Desktop app: shadcn-svelte components (button, card, input, badge, label, textarea, separator, skeleton, avatar, progress), i18n skeleton, auth + school stores
- Mobile app: Expo Router with role-based layouts (student, teacher, parent), auth, QR scan, UI components

## Worker Assignment

| Worker | Surface | Responsibility |
|--------|---------|---------------|
| **Convex** | 647 | Schema fixes, remaining functions, auth config, real-time subscriptions |
| **Web-SvelteKit** | 645 | Landing page polish, web dashboard (admin + teacher), auth flow |
| **Tauri-Desktop** | 648 | Admin desktop app — school management, salary, CSV import/export, reports |
| **Expo-Mobile** | 646 | Student/teacher/parent mobile apps, QR scan, offline-capable |

---

## Phase 1: Auth & Foundation (Day 1)

### 1.1 — Fix Convex Schema Mismatches
**Worker**: Convex (647)
**Estimate**: 2h

The Convex functions reference fields not in the schema (`users` table, `studentId` on attendance as individual records vs embedded array, `isPublished` on tests vs `status`, `parentIds` on students, `totalMarks` on assignments, `grade` as number on submissions). Fix these:

- Add `users` table to schema: `{ workosUserId, name, email, role, avatarUrl, isActive, schoolId }`
- Flatten `attendance` table: individual records per student (not embedded array) — functions already treat it this way
- Add `studentId` index on attendance
- Add `isPublished` to tests OR change functions to use `status`
- Add `parentIds` to students table
- Add `totalMarks` to assignments
- Change `grade` from string to number on submissions
- Add `order` field to testQuestions in schema
- Add `totalMarks` and `submittedAt` to testAttempts in schema

### 1.2 — WorkOS Auth Integration (Web)
**Worker**: Web-SvelteKit (645)
**Estimate**: 3h

- Install `@workos-inc/node` and `@workos-inc/authkit-sveltekit` (if available) or build manually
- Create `src/lib/server/auth.ts` with WorkOS client
- Create `/auth/callback` route — handle WorkOS redirect, create session cookie, upsert user via Convex
- Create `/auth/login` route — redirect to WorkOS AuthKit
- Create `/auth/logout` route — clear session, redirect to landing
- Add auth middleware in `hooks.server.ts` — check session, populate `event.locals.user`
- Create `src/lib/stores/auth.svelte.ts` — reactive user state for client
- Role-based route guards: `/dashboard/admin/*`, `/dashboard/teacher/*`, `/dashboard/student/*`, `/dashboard/parent/*`

### 1.3 — WorkOS Auth Integration (Mobile)
**Worker**: Expo-Mobile (646)
**Estimate**: 3h

- Use `expo-auth-session` + `expo-web-browser` for WorkOS AuthKit redirect
- Create auth context provider wrapping the app
- Store tokens in `expo-secure-store`
- Auto-refresh token logic
- Wire Convex client with auth token
- Role-based routing in `app/_layout.tsx` — redirect to correct tab group based on role

### 1.4 — WorkOS Auth Integration (Desktop)
**Worker**: Tauri-Desktop (648)
**Estimate**: 2h

- Use SvelteKit's server-side auth (same as web, adapter-static for Tauri)
- Or use Tauri's deep link handler for OAuth callback
- Wire `src/lib/stores/auth.svelte.ts` with Convex client
- Admin-only: redirect non-admin users away

### 1.5 — Convex Auth Config
**Worker**: Convex (647)
**Estimate**: 1h

- Configure `auth.config.ts` with correct WorkOS issuer
- Add `WORKOS_ISSUER_URL` to Convex environment variables
- Test token validation with `ctx.auth.getUserIdentity()`

---

## Phase 2: Role-Based Dashboards (Day 1-2)

### 2.1 — Admin Dashboard (Desktop)
**Worker**: Tauri-Desktop (648)
**Estimate**: 4h

Build the admin desktop dashboard at `/` (root route):
- Sidebar navigation: Dashboard, Schools, Classes, Teachers, Students, Parents, Subjects, Salary, Reports
- Dashboard cards: total students, teachers, classes, today's attendance %
- Use TanStack Table for data tables (students, teachers)
- School hierarchy view (school → class → section → students)
- CRUD forms for schools, classes, sections using Superforms + Zod

Screenshot Should Show: Desktop app with sidebar, dashboard cards showing stats, data table with students

### 2.2 — Teacher Dashboard (Web)
**Worker**: Web-SvelteKit (645)
**Estimate**: 3h

Build `/dashboard/teacher`:
- Welcome card with teacher name, today's date
- Quick actions: Mark Attendance, Create Test, Upload Material, Create Assignment
- My Classes list (subjects assigned to this teacher)
- Recent activity feed (recent test submissions, attendance marked)
- Today's schedule overview

Screenshot Should Show: Teacher dashboard with class cards, quick action buttons, recent activity

### 2.3 — Student Dashboard (Mobile)
**Worker**: Expo-Mobile (646)
**Estimate**: 3h

Build `app/(student)/index.tsx`:
- Greeting card with student name
- Attendance % ring chart
- Upcoming tests + assignments
- Recent test scores
- Quick links: Materials, Tests, Assignments, Profile
- Bottom tab nav: Home, Materials, Tests, Assignments, Profile

Screenshot Should Show: Mobile student home screen with attendance ring, upcoming items, quick links

### 2.4 — Parent Dashboard (Mobile)
**Worker**: Expo-Mobile (646)
**Estimate**: 2h

Build `app/(parent)/index.tsx`:
- Child selector (if parent has multiple children)
- Child's attendance % this month
- Recent test results
- Recent notifications
- Bottom tab nav: Home, Attendance, Results, Notifications

Screenshot Should Show: Parent home with child's summary card, recent results, notification badges

---

## Phase 3: Attendance System (Day 2-3)

### 3.1 — Bulk Attendance Marking (Web — Teacher)
**Worker**: Web-SvelteKit (645)
**Estimate**: 4h

Build `/dashboard/teacher/attendance`:
- Section selector dropdown (teacher's assigned sections)
- Date picker (defaults to today)
- Student list with present/absent/late toggle buttons (bulk marking)
- "Mark All Present" shortcut button
- Submit button → calls `attendance.markBulk` Convex mutation
- Summary bar: X present, Y absent, Z late
- Toast confirmation on save

Screenshot Should Show: Attendance page with student list, colored status buttons, summary bar

### 3.2 — QR Check-in (Mobile — Student)
**Worker**: Expo-Mobile (646)
**Estimate**: 3h

Build QR attendance flow:
- Teacher generates QR code (unique per section + date + time window)
- Student scans QR from `app/qr-scan.tsx`
- Validates: correct section, within time window, not already marked
- Auto-marks as "present" via Convex mutation
- Success animation + haptic feedback

### 3.3 — Attendance Reports (Desktop — Admin)
**Worker**: Tauri-Desktop (648)
**Estimate**: 3h

Build attendance reporting in desktop admin:
- Section-wise attendance table with date range filter
- Student-wise attendance history with % calculation
- Monthly attendance summary with LayerChart bar chart
- Export to CSV button
- Highlight students below 75% attendance in red

Screenshot Should Show: Attendance report table with colored cells, chart showing monthly trend

### 3.4 — Attendance View (Mobile — Parent)
**Worker**: Expo-Mobile (646)
**Estimate**: 2h

Build `app/(parent)/attendance.tsx`:
- Calendar view showing present/absent/late per day (color coded)
- Monthly attendance % at top
- Filter by month

---

## Phase 4: Study Materials (Day 3-4)

### 4.1 — Material Upload (Web — Teacher)
**Worker**: Web-SvelteKit (645)
**Estimate**: 3h

Build `/dashboard/teacher/materials`:
- Hierarchy browser: Subject → Module → Topic (tree view or breadcrumb)
- "Add Material" dialog: title, type (video/pdf/link), URL/file upload, description
- File upload to Convex storage (for PDFs)
- Drag-to-reorder modules and topics
- Edit/delete materials

### 4.2 — Material Browser (Mobile — Student)
**Worker**: Expo-Mobile (646)
**Estimate**: 3h

Build `app/(student)/materials.tsx`:
- Subject list → Module list → Topic list → Materials
- Video player (embedded YouTube or Expo AV)
- PDF viewer (expo-document-picker or WebView)
- Link opens in-app browser
- Bookmark/favorite materials

### 4.3 — Material Management (Desktop — Admin)
**Worker**: Tauri-Desktop (648)
**Estimate**: 2h

- Admin view of all materials across subjects
- Bulk upload materials via CSV (title, type, url, topic mapping)
- Material analytics: view counts per material (stretch goal)

---

## Phase 5: MCQ Test Engine (Day 4-5)

### 5.1 — Test Creation (Web — Teacher)
**Worker**: Web-SvelteKit (645)
**Estimate**: 4h

Build `/dashboard/teacher/tests`:
- Create Test form: title, subject, module, duration, total marks
- Question builder: question text, 4 options, correct answer, marks
- Bulk question import from JSON/CSV
- Question bank view (all questions for a subject)
- Generate random test from question bank
- Publish/unpublish toggle
- Preview test as student would see it

Screenshot Should Show: Test editor with question builder, option inputs, correct answer selector

### 5.2 — Test Taking (Mobile — Student)
**Worker**: Expo-Mobile (646)
**Estimate**: 4h

Build `app/(student)/tests.tsx`:
- Available tests list (published, not yet attempted)
- Test start screen: title, duration, total questions, total marks
- Timer countdown (auto-submit on expiry)
- One question per screen with option radio buttons
- Navigation: next/previous, question palette showing answered/unanswered
- Submit confirmation dialog
- Auto-evaluation result screen: score, percentage, correct/wrong per question

Screenshot Should Show: Test taking screen with question, options, timer, question palette

### 5.3 — Test Results (Web — Teacher)
**Worker**: Web-SvelteKit (645)
**Estimate**: 2h

Build `/dashboard/teacher/tests/[id]/results`:
- TanStack Table showing all attempts: student name, score, percentage, time taken
- Sort by score, filter by pass/fail
- Score distribution chart (LayerChart)
- Export results to CSV

### 5.4 — Test Results (Mobile — Parent)
**Worker**: Expo-Mobile (646)
**Estimate**: 2h

Build `app/(parent)/results.tsx`:
- List of child's test attempts with scores
- Tap to see detailed result (correct/wrong per question)
- Overall test average trend chart

---

## Phase 6: Homework & Assignments (Day 5-6)

### 6.1 — Assignment Creation (Web — Teacher)
**Worker**: Web-SvelteKit (645)
**Estimate**: 3h

Build `/dashboard/teacher/assignments`:
- Create assignment: title, description, subject, section, due date, total marks
- Rich text description (basic markdown)
- File attachment support
- View submissions with grading interface
- Bulk grade with feedback

### 6.2 — Assignment Submission (Mobile — Student)
**Worker**: Expo-Mobile (646)
**Estimate**: 3h

Build `app/(student)/assignments.tsx`:
- Pending assignments list with due dates
- Submit: text response + file upload (photo/document)
- View grade + feedback after grading
- Overdue assignments highlighted

### 6.3 — Assignment Management (Desktop — Admin)
**Worker**: Tauri-Desktop (648)
**Estimate**: 2h

- Overview of all assignments across sections
- Submission rate per assignment
- Late submission tracking

---

## Phase 7: Progress Tracking (Day 6-7)

### 7.1 — Student Progress Dashboard (Web — Teacher)
**Worker**: Web-SvelteKit (645)
**Estimate**: 3h

Build `/dashboard/teacher/progress`:
- Section selector
- Student progress table: name, attendance %, test avg %, assignments completed
- Click student → detailed progress view with LayerChart graphs
- Trend lines: attendance and test performance over months
- Export progress report to PDF/CSV

### 7.2 — Progress View (Mobile — Parent)
**Worker**: Expo-Mobile (646)
**Estimate**: 2h

- Overall progress card: attendance %, test avg %, assignment completion %
- Progress trend chart (last 6 months)
- Subject-wise breakdown
- Compare with section average (anonymized)

### 7.3 — Progress Reports (Desktop — Admin)
**Worker**: Tauri-Desktop (648)
**Estimate**: 2h

- School-wide progress analytics
- Class-wise and section-wise averages
- Top performers list
- Students at risk (low attendance + low scores)

---

## Phase 8: Salary & Admin Tools (Day 7-8)

### 8.1 — Salary Management (Desktop — Admin)
**Worker**: Tauri-Desktop (648)
**Estimate**: 3h

Build salary tracking:
- Teacher list with monthly salary records
- Create salary record: teacher, month, year, amount
- Mark as paid with date
- Monthly salary report with totals
- Export to CSV
- Pending vs paid status with visual indicators

### 8.2 — CSV Import/Export (Desktop — Admin)
**Worker**: Tauri-Desktop (648)
**Estimate**: 4h

Build import/export system using PapaParse:
- **Import**: Bulk student enrollment (CSV → validate → preview → insert)
- **Import**: Bulk teacher registration
- **Import**: Question bank import
- **Export**: Student list, attendance records, test results, salary records
- CSV template downloads
- Validation errors shown in table with row numbers

### 8.3 — QR Classroom Generator (Desktop — Admin)
**Worker**: Tauri-Desktop (648)
**Estimate**: 2h

- Generate QR codes per section (using qrcode library)
- QR encodes: school ID + section ID + date
- Print-friendly QR cards with class name
- Batch generate for all sections

---

## Phase 9: Notifications (Day 8)

### 9.1 — Notification System (Convex)
**Worker**: Convex (647)
**Estimate**: 2h

- Auto-notification on: attendance marked absent, test result available, assignment graded, assignment due tomorrow
- Notification preferences per user
- Mark as read mutation
- Batch notification for section-wide events

### 9.2 — Notification UI (Mobile)
**Worker**: Expo-Mobile (646)
**Estimate**: 2h

Build `app/(parent)/notifications.tsx`:
- Notification list with unread badge on tab
- Tap to view detail + mark as read
- Pull to refresh
- Push notification integration (Expo Notifications)

### 9.3 — Notification Bell (Web)
**Worker**: Web-SvelteKit (645)
**Estimate**: 1h

- Notification bell icon in navbar with unread count badge
- Dropdown showing recent notifications
- "Mark all as read" button
- Click notification → navigate to relevant page

---

## Phase 10: i18n & Theming (Day 8-9)

### 10.1 — Nepali Translations (Web + Desktop)
**Worker**: Web-SvelteKit (645) + Tauri-Desktop (648)
**Estimate**: 3h per worker

- Complete translation file for Nepali (`ne.ts`)
- Language switcher in navbar/settings
- Persist language preference in localStorage
- All UI labels, buttons, messages, error texts translated
- Date formatting in Nepali calendar (Bikram Sambat) — stretch goal

### 10.2 — Nepali Translations (Mobile)
**Worker**: Expo-Mobile (646)
**Estimate**: 2h

- Complete `lib/i18n/ne.ts` with all mobile-specific strings
- Language switcher in profile/settings
- Persist preference with AsyncStorage

### 10.3 — Dark Mode (All Apps)
**Worker**: All workers
**Estimate**: 2h each

- Web + Desktop: Tailwind dark mode class strategy, theme toggle in navbar
- Mobile: React Native appearance API, theme context provider
- Persist preference
- All components respect dark mode

---

## Phase 11: Landing Page & Polish (Day 9-10)

### 11.1 — Landing Page Polish (Web)
**Worker**: Web-SvelteKit (645)
**Estimate**: 4h

Polish school.surkhet.app landing:
- Hero section with school illustration, CTA buttons
- Features grid with icons (attendance, tests, materials, etc.)
- Pricing section (free tier + school plan)
- Testimonials/social proof
- Footer with links, contact info
- Mobile responsive
- Performance optimization (LCP < 2.5s)

### 11.2 — Onboarding Flow (Web)
**Worker**: Web-SvelteKit (645)
**Estimate**: 3h

Build `/onboard`:
- Step 1: Create school (name, address, phone, email)
- Step 2: Add classes and sections
- Step 3: Invite teachers (email)
- Step 4: Import students (CSV or manual)
- Progress stepper UI
- Skip/back navigation

### 11.3 — Desktop App Polish
**Worker**: Tauri-Desktop (648)
**Estimate**: 2h

- Window title bar customization
- App icon
- Auto-updater configuration
- System tray icon (optional)

---

## Phase 12: Deploy & Verify (Day 10)

### 12.1 — Deploy Web to Cloudflare Workers
**Worker**: Web-SvelteKit (645)
- Configure `wrangler.toml` with school.surkhet.app domain
- Set environment secrets (WORKOS keys, CONVEX_URL)
- Deploy and verify

### 12.2 — Build Desktop App
**Worker**: Tauri-Desktop (648)
- `cargo tauri build` for macOS
- Create GitHub Release with `.dmg`
- Test installation

### 12.3 — Build Mobile App
**Worker**: Expo-Mobile (646)
- `eas build --platform ios` and `--platform android`
- Create GitHub Release
- Test on devices

---

## Task Distribution Summary (cmux_send_submit commands)

### Convex Worker (surface:647) — 5h total
1. Fix schema mismatches (users table, attendance flatten, test fields)
2. Configure WorkOS auth
3. Build notification auto-triggers
4. Add missing indexes and optimizations

### Web-SvelteKit Worker (surface:645) — 26h total
1. WorkOS auth integration + route guards
2. Teacher dashboard
3. Attendance marking UI
4. Material upload UI
5. Test creation + results UI
6. Assignment creation + grading UI
7. Progress dashboard
8. Notification bell
9. i18n + dark mode
10. Landing page polish + onboarding
11. Deploy to Cloudflare Workers

### Tauri-Desktop Worker (surface:648) — 24h total
1. WorkOS auth (admin-only)
2. Admin dashboard with sidebar
3. Attendance reports
4. Material management
5. Assignment overview
6. Progress reports
7. Salary management
8. CSV import/export
9. QR code generator
10. i18n + dark mode
11. Desktop build + release

### Expo-Mobile Worker (surface:646) — 28h total
1. WorkOS auth with expo-auth-session
2. Student dashboard
3. Parent dashboard
4. QR attendance check-in
5. Attendance calendar (parent)
6. Material browser
7. Test taking engine
8. Test results (parent)
9. Assignment submission
10. Progress view (parent)
11. Notifications
12. i18n + dark mode
13. EAS build

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Schema/function mismatches cause runtime errors | High | High | Fix schema first (Phase 1.1) before any UI work |
| WorkOS auth complexity across 3 platforms | Medium | High | Start with web, reuse patterns for desktop/mobile |
| Convex schema changes break existing functions | Medium | Medium | Run `npx convex dev` continuously, fix type errors immediately |
| Expo build issues on CI | Medium | Medium | Test EAS build early, don't wait for Day 10 |
| i18n coverage gaps (missing translations) | Low | Low | Use English as fallback, fill Nepali incrementally |
| Tauri cross-platform build complexity | Medium | Medium | Focus macOS first, add Windows/Linux later |
