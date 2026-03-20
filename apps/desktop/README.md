# MeroSchool Admin Desktop

Tauri v2 desktop application for school administration. Built with SvelteKit, Tailwind CSS v4, and shadcn-svelte components.

## Prerequisites

- [Bun](https://bun.sh/) (v1.3+)
- [Rust](https://rustup.rs/) (1.77+)
- Platform-specific dependencies:
  - **macOS**: Xcode Command Line Tools (`xcode-select --install`)
  - **Linux**: `sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`
  - **Windows**: [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/), WebView2

## Setup

```sh
# From monorepo root
bun install

# Optional: set Convex URL for live data
echo "VITE_CONVEX_URL=https://your-deployment.convex.cloud" > apps/desktop/.env.local
```

## Development

```sh
# Web-only dev (no Tauri shell)
cd apps/desktop
bun run dev -- --port 5013

# Full Tauri dev (native window + hot reload)
cd apps/desktop
bun run tauri dev
```

## Building

```sh
# Frontend only (static site in build/)
cd apps/desktop
bun run build

# Full native app (macOS .dmg / Linux .AppImage / Windows .msi)
cd apps/desktop
bun run tauri build
```

Output locations:
- macOS: `src-tauri/target/release/bundle/dmg/`
- Linux: `src-tauri/target/release/bundle/appimage/`
- Windows: `src-tauri/target/release/bundle/msi/`

## Type Checking

```sh
cd apps/desktop
bun run check
```

## Features

- School setup wizard (academic year, classes, sections, subjects)
- Student enrollment (manual + CSV import)
- Teacher management with subject/class assignment
- Parent linking to students
- Exam schedule and timetable management
- Staff salary tracking (monthly records, payment status)
- Reports (attendance, exam results, class performance)
- Grade export (CSV/PDF)
- QR code generation for classrooms
- i18n (English + Nepali)
- Dark/light mode with system preference detection
- Real-time Convex backend (falls back to sample data offline)

## CI/CD

Tagged releases (`v*`) trigger GitHub Actions to build native installers for macOS (ARM + Intel), Linux, and Windows. See `.github/workflows/release.yml`.
