# meroschool

School management ecosystem for Surkhet, Nepal.

## Project Structure
Turborepo monorepo:
```
meroschool/
├── apps/
│   ├── web/           # SvelteKit — landing page & web app (school.surkhet.app)
│   ├── desktop/       # Tauri + SvelteKit — admin desktop app
│   └── mobile/        # Expo — student/teacher/parent mobile app
├── packages/
│   ├── ui/            # Shared shadcn-svelte components
│   ├── config/        # Shared tsconfig
│   └── utils/         # Shared TypeScript utilities & validation
├── convex/            # Convex backend — schema, functions, auth
├── turbo.json
└── biome.jsonc
```

## Commands
```bash
bun run dev          # Start all apps via turbo
bun run build        # Build all apps
bun run lint         # Lint all apps with Biome
bun run test         # Run all tests
bun run check        # Type-check all apps
turbo dev --filter=web       # Run only web
turbo dev --filter=desktop   # Run only desktop
turbo dev --filter=mobile    # Run only mobile
npx convex dev               # Start Convex dev server
```

## Stack
- **Frontend (Web/Desktop)**: SvelteKit, Svelte 5 (runes), shadcn-svelte, Tailwind v4, Lucide icons
- **Mobile**: Expo, React Native, Expo Router, NativeWind
- **Desktop**: Tauri v2 + SvelteKit
- **Backend**: Convex (schema, functions, real-time)
- **Auth**: WorkOS AuthKit
- **Hosting**: Cloudflare Workers (web)
- **Build**: Turborepo, bun
- **Quality**: Biome (lint/format), Vitest (unit), Playwright (e2e)
- **Extras**: TanStack Table, LayerChart, Resend, PapaParse (CSV), qrcode

## Conventions
- TypeScript strict mode
- Format with Biome (tabs, single quotes, no semicolons)
- Components in `src/lib/components/`
- Use shadcn-svelte components as base
- Lucide for icons
- Convex for database (schema in `convex/schema.ts`)
- WorkOS for authentication
- i18n: English + Nepali
- Dark mode + light mode support

## Roles
- **student**: view materials, take tests, submit homework, view progress
- **teacher**: mark attendance, upload materials, create tests, grade submissions
- **parent**: view child's attendance/progress/test results, receive notifications
- **admin**: manage school, classes, teachers, students, salary, reports
