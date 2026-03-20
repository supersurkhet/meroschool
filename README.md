<p align="center">
  <strong style="font-size: 2em;">MeroSchool</strong><br>
  <em>Digital School Management for Nepal</em>
</p>

<p align="center">
  <a href="https://school.surkhet.app">school.surkhet.app</a> &nbsp;|&nbsp;
  <a href="https://github.com/supersurkhet/meroschool/releases">Downloads</a> &nbsp;|&nbsp;
  <a href="https://school.surkhet.app/download">Get the App</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SvelteKit-FF3E00?logo=svelte&logoColor=white" alt="SvelteKit" />
  <img src="https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/Tauri-24C8D8?logo=tauri&logoColor=white" alt="Tauri" />
  <img src="https://img.shields.io/badge/Convex-FF6B35?logo=convex&logoColor=white" alt="Convex" />
  <img src="https://img.shields.io/badge/Tailwind_v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

MeroSchool is a complete school management ecosystem built for schools in Surkhet, Nepal. It connects students, teachers, parents, and administrators through a unified platform spanning web, mobile, and desktop.

## Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │              Convex Backend                   │
                    │  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
                    │  │ Schema  │ │Functions │ │  File Store  │  │
                    │  │18 tables│ │13 modules│ │  PDF/Video   │  │
                    │  └─────────┘ └──────────┘ └──────────────┘  │
                    │  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │
                    │  │  Auth   │ │  Crons   │ │ Real-time    │  │
                    │  │ WorkOS  │ │  Daily   │ │ Subscriptions│  │
                    │  └─────────┘ └──────────┘ └──────────────┘  │
                    └──────────┬────────┬────────┬────────────────┘
                               │        │        │
                    ┌──────────┴──┐ ┌───┴────┐ ┌─┴──────────┐
                    │  Web App    │ │ Mobile │ │  Desktop   │
                    │  SvelteKit  │ │  Expo  │ │   Tauri    │
                    │  CF Workers │ │ RN     │ │  SvelteKit │
                    │             │ │        │ │            │
                    │  Teachers   │ │Students│ │   Admins   │
                    │  Landing    │ │Teachers│ │   School   │
                    │  Dashboard  │ │Parents │ │   Mgmt     │
                    └─────────────┘ └────────┘ └────────────┘
                    school.surkhet.app  iOS/Android  macOS/Win/Linux
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend (Web/Desktop)** | SvelteKit, Svelte 5 (runes), shadcn-svelte, Tailwind CSS v4, Lucide icons |
| **Mobile** | Expo SDK 55, React Native, Expo Router, NativeWind, react-i18next |
| **Desktop** | Tauri v2 + SvelteKit (adapter-static), TanStack Table, PapaParse, qrcode |
| **Backend** | Convex (real-time database, serverless functions, file storage, cron jobs) |
| **Auth** | WorkOS AuthKit (SSO, role-based access control) |
| **Hosting** | Cloudflare Pages (web), EAS Build (mobile), GitHub Releases (desktop) |
| **Monorepo** | Turborepo + bun workspaces |
| **Quality** | Biome (lint/format), svelte-check, TypeScript strict mode |
| **i18n** | English + Nepali (ne) with persistent language preference |
| **CI/CD** | GitHub Actions (lint/check/test + Tauri cross-platform builds) |

## Features

### Attendance System
- **Bulk marking** by teacher: toggle present/absent/late per student, submit for entire section
- **QR check-in**: admin generates time-windowed QR codes per section, students scan to auto-mark present
- **Calendar view** for parents: color-coded days (green/red/yellow), monthly summary
- **Auto-alerts**: parents notified instantly when child is marked absent
- **Reports**: daily/monthly summaries, attendance % per student, section-wide history

### MCQ Test Engine
- **Question bank**: CRUD with bulk import from CSV/JSON
- **Random generation**: Fisher-Yates shuffle to create unique tests from a question pool
- **Timed test-taking**: countdown timer on mobile, auto-submit on expiry
- **Auto-evaluation**: instant scoring with per-question correct/wrong breakdown
- **Statistics**: average score, highest/lowest, pass rate (>40%), score distribution
- **Parent notification**: automatic alert with score when test is submitted

### Study Materials
- **Hierarchical organization**: Class → Subject → Module → Topic → Materials
- **Multiple types**: video (YouTube/embedded), PDF, documents, external links
- **File upload**: direct upload to Convex file storage for PDFs and documents
- **Mobile viewer**: in-app video player, PDF viewer, and in-app browser for links

### Homework & Assignments
- **Create**: title, description, subject, section, due date, total marks
- **Submit**: text response + file/photo upload (mobile camera or document picker)
- **Grade**: teacher grades with numeric score + written feedback
- **Track**: overdue highlighting, submission rates, auto-reminder day before due

### Progress Tracking
- **Per-student dashboard**: attendance %, test average %, assignment completion rate
- **Section overview**: teacher sees all students in a sortable table
- **Trend charts**: attendance and test scores over last 6 months (LayerChart)
- **At-risk alerts**: students with attendance < 75% AND test average < 40%

### Salary Management (Admin Desktop)
- **Monthly records**: base salary, deductions, bonuses, net salary per teacher
- **Bulk generation**: create salary records for all active teachers in one click
- **Mark paid**: timestamp when payment is processed, notification to teacher
- **Reports**: monthly totals, export to CSV

### QR Classroom
- **Generate**: admin creates QR codes per section with school/section/date/expiry
- **Print**: print-friendly QR cards with class name and section label
- **Scan**: student scans QR → auto-joins class space (view materials, take tests)
- **Security**: time-windowed codes prevent replay, section validation prevents wrong-class scans

### CSV Import/Export (Admin Desktop)
- **Import students**: drag-drop CSV, preview table, row-level validation (email, phone, required fields)
- **Import teachers**: bulk registration with department and qualification
- **Export**: students, attendance (date range), test results, salary records
- **Templates**: downloadable CSV templates with correct headers

### Notifications
- **Real-time**: absence alerts, test results, graded assignments push to parents
- **Scheduled**: daily cron sends "assignment due tomorrow" reminders
- **In-app**: notification bell (web) with unread badge, notification tab (mobile)
- **Management**: mark read, mark all read, auto-cleanup of 30-day-old read notifications

### i18n & Theming
- **Languages**: complete English + Nepali (ne) translations across all 3 apps
- **Switcher**: EN/ने toggle in navbar (web/desktop) and settings (mobile)
- **Dark mode**: system preference detection + manual toggle, persistent preference
- **Consistent**: all shadcn-svelte components respect dark mode via Tailwind `dark:` variants

## Role-Based Access

| Role | Platform | Capabilities |
|------|----------|-------------|
| **Admin** | Desktop | Manage schools, classes, sections. CRUD teachers/students/parents. Salary records. CSV import/export. QR code generation. School-wide reports and analytics. |
| **Teacher** | Web + Mobile | Mark attendance (bulk + QR). Create/publish MCQ tests. Upload study materials. Create assignments and grade submissions. View section progress. |
| **Student** | Mobile | View dashboard with attendance ring. Browse materials by subject. Take timed MCQ tests. Submit assignments. Scan classroom QR. View grades and progress. |
| **Parent** | Mobile | View child's attendance calendar. See test results with scores. Track academic progress. Receive push notifications. Switch between multiple children. |

## Project Structure

```
meroschool/
├── apps/
│   ├── web/                          # SvelteKit web app
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── +page.svelte             # Landing page
│   │   │   │   ├── download/                # Download page
│   │   │   │   ├── features/                # Features page
│   │   │   │   ├── pricing/                 # Pricing page
│   │   │   │   ├── onboard/                 # School registration wizard
│   │   │   │   ├── demo/                    # Interactive demo
│   │   │   │   ├── auth/                    # WorkOS auth (login/callback/logout)
│   │   │   │   └── dashboard/teacher/       # Teacher dashboard
│   │   │   │       ├── attendance/
│   │   │   │       ├── tests/
│   │   │   │       ├── materials/
│   │   │   │       ├── assignments/
│   │   │   │       └── progress/
│   │   │   ├── lib/
│   │   │   │   ├── components/ui/           # shadcn-svelte components
│   │   │   │   ├── i18n/                    # en.ts + ne.ts (400+ keys each)
│   │   │   │   ├── server/auth.ts           # WorkOS server-side auth
│   │   │   │   └── convex-client.ts         # Convex HTTP client
│   │   │   └── hooks.server.ts              # Auth middleware
│   │   ├── wrangler.jsonc                   # Cloudflare Pages config
│   │   └── svelte.config.js                 # adapter-cloudflare
│   │
│   ├── desktop/                      # Tauri v2 desktop app
│   │   ├── src/
│   │   │   ├── routes/(app)/
│   │   │   │   ├── dashboard/               # Admin dashboard with stats
│   │   │   │   ├── schools/                 # School CRUD
│   │   │   │   ├── classes/                 # Class + section management
│   │   │   │   ├── teachers/                # Teacher management
│   │   │   │   ├── students/                # Student management + CSV import
│   │   │   │   ├── salary/                  # Salary records + bulk generation
│   │   │   │   ├── reports/                 # Analytics + charts + export
│   │   │   │   └── qr/                      # QR code generator + print
│   │   │   ├── lib/
│   │   │   │   ├── components/ui/           # shadcn-svelte components
│   │   │   │   ├── i18n/                    # en.ts + ne.ts
│   │   │   │   ├── stores/                  # auth, school, theme (Svelte 5 runes)
│   │   │   │   └── convex.ts                # Convex HTTP client
│   │   │   └── +layout.ts                   # SSR off, prerender on (Tauri)
│   │   ├── src-tauri/
│   │   │   ├── tauri.conf.json              # App config (v1.0.0)
│   │   │   ├── Cargo.toml                   # Rust dependencies
│   │   │   └── capabilities/                # Tauri permissions
│   │   └── svelte.config.js                 # adapter-static
│   │
│   └── mobile/                       # Expo mobile app
│       ├── app/
│       │   ├── (auth)/login.tsx             # Login screen
│       │   ├── (student)/                   # Student tab group
│       │   │   ├── index.tsx                # Dashboard with attendance ring
│       │   │   ├── materials.tsx            # Material browser
│       │   │   ├── tests.tsx                # Test taking engine
│       │   │   ├── assignments.tsx          # Assignment submission
│       │   │   └── profile.tsx              # Profile + settings
│       │   ├── (teacher)/                   # Teacher tab group
│       │   │   ├── index.tsx                # Teacher dashboard
│       │   │   ├── attendance.tsx           # Bulk attendance marking
│       │   │   ├── materials.tsx            # Material upload
│       │   │   ├── tests.tsx                # Test management
│       │   │   └── assignments.tsx          # Assignment grading
│       │   ├── (parent)/                    # Parent tab group
│       │   │   ├── index.tsx                # Child progress dashboard
│       │   │   ├── attendance.tsx           # Attendance calendar
│       │   │   ├── results.tsx              # Test results
│       │   │   └── notifications.tsx        # Notification center
│       │   ├── qr-scan.tsx                  # QR scanner
│       │   └── _layout.tsx                  # Root layout + providers
│       ├── components/
│       │   ├── ui/                          # Button, Card, Input, Badge, Skeleton
│       │   ├── ErrorBoundary.tsx
│       │   └── LanguageSwitcher.tsx
│       ├── lib/
│       │   ├── auth/                        # AuthProvider + SecureStore
│       │   ├── convex/                      # ConvexReactClient + hooks
│       │   ├── i18n/                        # en.ts + ne.ts + i18next config
│       │   └── theme/                       # Light/dark palettes + ThemeProvider
│       ├── eas.json                         # EAS Build profiles
│       └── app.json                         # Expo config (app.surkhet.school)
│
├── packages/
│   ├── ui/                           # Shared shadcn-svelte component library
│   ├── config/                       # Shared tsconfig.base.json
│   └── utils/                        # Shared TypeScript utilities
│
├── convex/                           # Convex backend
│   ├── schema.ts                     # 18 tables with indexes
│   ├── auth.ts                       # WorkOS auth, upsertUser, role detection
│   ├── auth.config.ts                # WorkOS provider config
│   ├── schools.ts                    # School/class/section CRUD + hierarchy
│   ├── people.ts                     # Student/teacher/parent CRUD
│   ├── academics.ts                  # Subject/module/topic CRUD
│   ├── attendance.ts                 # Bulk marking, QR check-in, summaries
│   ├── tests.ts                      # Question bank, test gen, auto-eval
│   ├── materials.ts                  # File upload/download, CRUD
│   ├── assignments.ts                # Create/submit/grade lifecycle
│   ├── salary.ts                     # Monthly records, bulk create, mark paid
│   ├── notifications.ts             # Send, subscribe, mark read, cron cleanup
│   ├── progress.ts                   # Student + section progress aggregation
│   ├── reports.ts                    # School-wide aggregation queries
│   ├── csv.ts                        # Bulk enrollment, export queries
│   ├── crons.ts                      # Scheduled: due reminders, old notif cleanup
│   └── seed.ts                       # Demo data: Surkhet Valley Academy
│
├── .github/workflows/
│   ├── ci.yml                        # Lint + check + test on push/PR
│   └── tauri-build.yml               # Cross-platform desktop builds on tag
│
├── turbo.json                        # Turborepo task config
├── biome.jsonc                       # Biome lint/format config
├── CLAUDE.md                         # AI assistant context
├── DEVELOPMENT_PLAN.md               # Feature breakdown + worker assignments
├── TESTING.md                        # Verification checklist (210+ entries)
└── PROJECT_PLAN.md                   # Phase milestones
```

## Setup

### Prerequisites

- [bun](https://bun.sh) v1.0+ (package manager)
- [Node.js](https://nodejs.org) 20+
- [Rust](https://rustup.rs) (only for desktop builds)
- [Convex](https://convex.dev) account (free tier available)
- [WorkOS](https://workos.com) account (free dev tier)

### Install

```bash
git clone https://github.com/supersurkhet/meroschool.git
cd meroschool
bun install
```

### Environment Variables

Create `.env.local` in the project root:

```env
# Convex (auto-populated by `npx convex dev`)
CONVEX_DEPLOYMENT=dev:your-deployment-name
CONVEX_URL=https://your-project.convex.cloud

# WorkOS (from dashboard.workos.com)
WORKOS_API_KEY=sk_test_...
WORKOS_CLIENT_ID=client_...

# For SvelteKit browser access
VITE_CONVEX_URL=https://your-project.convex.cloud

# For Expo mobile app
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### Start Development

```bash
# 1. Start Convex backend (opens browser for auth on first run)
npx convex dev

# 2. Seed demo data (Surkhet Valley Academy: 8 students, 4 teachers, test data)
npx convex run seed:seed

# 3. Start all apps via Turborepo
bun run dev

# Or start individual apps:
turbo dev --filter=@meroschool/web       # http://localhost:5173
turbo dev --filter=@meroschool/desktop   # http://localhost:1420 (Tauri dev)
turbo dev --filter=@meroschool/mobile    # Expo dev server
```

### Quality Checks

```bash
bun run check    # svelte-check + TypeScript across all apps
bun run lint     # Biome lint + format check
bun run test     # Vitest unit tests
```

## Deployment

### Web (Cloudflare Pages)

```bash
cd apps/web
bun run build
bunx wrangler pages deploy .svelte-kit/cloudflare --project-name meroschool-web
```

Set environment secrets in Cloudflare dashboard:
`WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `CONVEX_URL`

Custom domain: `school.surkhet.app` → CNAME → `meroschool-web.pages.dev`

### Mobile (EAS Build)

```bash
cd apps/mobile

# Preview (internal distribution, APK for Android)
eas build --profile preview --platform all

# Production (App Store + Play Store)
eas build --profile production --platform all
eas submit --platform ios
eas submit --platform android
```

Bundle ID: `app.surkhet.school`

### Desktop (Tauri)

Local build:
```bash
cd apps/desktop
cargo tauri build
```

CI build (auto on version tags):
```bash
git tag v1.1.0
git push origin v1.1.0
# GitHub Actions builds .dmg (macOS), .msi (Windows), .AppImage (Linux)
# Binaries attached to GitHub Release automatically
```

## Downloads

| Platform | Link |
|----------|------|
| **Web App** | [school.surkhet.app](https://school.surkhet.app) |
| **Download Page** | [school.surkhet.app/download](https://school.surkhet.app/download) |
| **Desktop (all platforms)** | [GitHub Releases](https://github.com/supersurkhet/meroschool/releases/latest) |
| **Android APK** | [GitHub Releases](https://github.com/supersurkhet/meroschool/releases/latest) |
| **iOS** | Coming soon (App Store) |

## Convex Schema

18 tables powering the entire backend:

| Category | Tables |
|----------|--------|
| **Identity** | `users` |
| **School Structure** | `schools`, `classes`, `sections` |
| **People** | `students`, `teachers`, `parents` |
| **Academics** | `subjects`, `modules`, `topics`, `materials` |
| **Assessment** | `tests`, `testQuestions`, `testAttempts`, `assignments`, `submissions` |
| **Operations** | `attendance`, `salaryRecords`, `notifications` |

See [`convex/schema.ts`](convex/schema.ts) for the full schema with validators and indexes.

## Screenshots

> Screenshots coming soon. Run `bun run dev` to see the app locally.

| View | Description |
|------|-------------|
| Landing Page | Hero, features grid, pricing, built for Nepal |
| Teacher Dashboard | Quick actions, my classes, recent activity |
| Attendance Marking | Section selector, student list, status toggles |
| MCQ Test Taking | Timer, question, options, question palette |
| Student Dashboard | Attendance ring, upcoming tests, assignments |
| Parent Dashboard | Child selector, calendar, test results |
| Admin Desktop | Sidebar, stats cards, school hierarchy |
| Download Page | Role selector, platform detection, store badges |

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run quality checks: `bun run check && bun run lint`
5. Commit with conventional commits: `git commit -m "feat: add my feature"`
6. Push and create a PR: `gh pr create`

### Conventions

- **TypeScript** strict mode everywhere
- **Biome** for formatting (tabs, single quotes, no semicolons)
- **Svelte 5** runes (`$state`, `$derived`, `$effect`, `$props`) — no Svelte 4 patterns
- **Conventional commits**: `feat:`, `fix:`, `docs:`, `chore:`
- **Components** in `src/lib/components/`
- **shadcn-svelte** as the component base for web/desktop
- **Lucide** for all icons

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with care for the schools of Surkhet, Nepal.<br>
  <a href="https://school.surkhet.app">school.surkhet.app</a>
</p>
