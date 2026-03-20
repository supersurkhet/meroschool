# MeroSchool

School management ecosystem for Surkhet, Nepal. A complete digital platform for managing attendance, academics, tests, assignments, and parent communication.

**Domain**: [school.surkhet.app](https://school.surkhet.app)

## Architecture

```
meroschool/
├── apps/
│   ├── web/           # SvelteKit — Landing page + teacher web dashboard
│   ├── desktop/       # Tauri v2 + SvelteKit — Admin desktop application
│   └── mobile/        # Expo — Student, teacher & parent mobile app
├── packages/
│   ├── ui/            # Shared shadcn-svelte components
│   ├── config/        # Shared TypeScript config
│   └── utils/         # Shared utilities & validation
├── convex/            # Backend — schema, functions, auth, crons
└── turbo.json         # Turborepo build orchestration
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend (Web/Desktop)** | SvelteKit, Svelte 5 (runes), shadcn-svelte, Tailwind CSS v4 |
| **Mobile** | Expo, React Native, Expo Router, NativeWind |
| **Desktop** | Tauri v2 + SvelteKit (adapter-static) |
| **Backend** | Convex (real-time database, functions, file storage, cron jobs) |
| **Auth** | WorkOS AuthKit (SSO, role-based access) |
| **Hosting** | Cloudflare Workers (web) |
| **Build** | Turborepo, bun |
| **Quality** | Biome (lint/format), Vitest, svelte-check |
| **i18n** | English + Nepali (ne) |
| **Extras** | TanStack Table, LayerChart, PapaParse, qrcode, lucide icons |

## Features

### Attendance System
- Bulk attendance marking by teacher (web + mobile)
- QR code check-in for students (scan classroom QR → auto-mark present)
- Attendance calendar view for parents (color-coded days)
- Daily/monthly attendance summaries and % tracking
- Auto-notification to parents when child is absent

### MCQ Test Engine
- Question bank CRUD with bulk import
- Random test generation from question bank (Fisher-Yates shuffle)
- Timed test-taking on mobile (countdown, auto-submit)
- Auto-evaluation with instant scoring
- Per-question review (correct/wrong breakdown)
- Test statistics: avg score, pass rate, score distribution

### Study Materials
- Hierarchical organization: Class → Subject → Module → Topic → Materials
- Support for video, PDF, documents, and links
- File upload via Convex storage
- Material browsing on mobile with in-app viewers

### Homework & Assignments
- Create assignments with due dates and total marks
- Student submission (text + file upload)
- Teacher grading with feedback
- Overdue tracking and notifications

### Progress Tracking
- Per-student progress: attendance %, test average, assignment completion
- Section-wide progress overview for teachers
- Trend charts (attendance + scores over time)
- Students at risk alerts (low attendance + low scores)

### Salary Management (Admin)
- Monthly salary records per teacher
- Base salary, deductions, bonuses, net calculation
- Bulk salary generation for all teachers
- Mark paid with timestamp
- CSV export

### QR Classroom
- Generate QR codes per section (admin desktop)
- Print-friendly QR cards with class labels
- Student scans → joins class space, views materials, takes tests
- Time-windowed QR codes prevent replay

### CSV Import/Export (Admin)
- Bulk student enrollment from CSV
- Bulk teacher registration
- Validation with row-level error reporting
- Export: students, attendance, test results, salary records
- Template CSV downloads

### Notifications
- Real-time push to parents: absence alerts, test results, graded assignments
- In-app notification center with unread badges
- Notification bell (web) and notification tab (mobile)
- Scheduled reminders (assignment due tomorrow)

### i18n & Theming
- Full English + Nepali (ne) translation
- Language switcher in all apps
- Dark mode + light mode with system preference detection
- Persistent user preferences

## Role-Based Access

| Role | Platform | Access |
|------|----------|--------|
| **Admin** | Desktop | School management, teachers, students, salary, CSV, QR, reports |
| **Teacher** | Web + Mobile | Attendance, tests, materials, assignments, progress |
| **Student** | Mobile | Dashboard, materials, test-taking, assignments, QR scan |
| **Parent** | Mobile | Child's attendance, test results, progress, notifications |

## Setup

### Prerequisites
- [bun](https://bun.sh) (package manager)
- [Node.js](https://nodejs.org) 20+
- [Rust](https://rustup.rs) (for Tauri desktop builds)
- Convex account
- WorkOS account

### Install

```bash
git clone https://github.com/supersurkhet/meroschool.git
cd meroschool
bun install
```

### Environment Variables

Copy `.env.example` to `.env.local` in the project root:

```env
CONVEX_DEPLOYMENT=your-convex-deployment
CONVEX_URL=https://your-project.convex.cloud
WORKOS_API_KEY=sk_live_...
WORKOS_CLIENT_ID=client_...
```

For the mobile app, prefix with `EXPO_PUBLIC_`:
```env
EXPO_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### Development

```bash
# Start all apps
bun run dev

# Start individual apps
turbo dev --filter=@meroschool/web
turbo dev --filter=@meroschool/desktop
turbo dev --filter=@meroschool/mobile

# Start Convex backend
npx convex dev
```

### Build

```bash
# Build all
bun run build

# Desktop (Tauri)
cd apps/desktop && cargo tauri build

# Mobile (Expo)
cd apps/mobile && eas build --platform ios
cd apps/mobile && eas build --platform android
```

### Quality

```bash
bun run check    # TypeScript type checking
bun run lint     # Biome lint + format
bun run test     # Vitest unit tests
```

## Convex Schema

18 tables: `users`, `schools`, `classes`, `sections`, `students`, `teachers`, `parents`, `subjects`, `modules`, `topics`, `materials`, `tests`, `testQuestions`, `testAttempts`, `attendance`, `assignments`, `submissions`, `salaryRecords`, `notifications`

See [`convex/schema.ts`](convex/schema.ts) for full schema definition.

## License

Private — supersurkhet/meroschool
