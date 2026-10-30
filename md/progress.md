# Progress
## Current
Epic: 0 Foundation and storage layer | Branch: epic/0-foundation | Status: review
## Done
- [x] Epic 0 — Foundation and storage layer (2026-10-30)
## Decisions made during build
- Placed test files under `tests/` mirroring `src/` (as allowed by `agent_readme.md` §5.2), including a reusable `runStorageAdapterContractTests` suite (`tests/services/storage/storage-adapter.contract.ts`) so future adapters can run the identical contract tests.
- Configured ESLint `no-restricted-imports` across all §5.1 architectural layers (both `@/*` aliases and relative `**/*` paths) plus `no-restricted-properties` blocking `process.env` everywhere outside `src/server/config.ts`.
- Used `better-sqlite3@^13.0.3` (latest stable) so prebuilt Windows x64 binaries work on Node `v26.13.0` without Visual Studio C++ Build Tools; enabled `PRAGMA journal_mode = WAL` and `PRAGMA foreign_keys = ON` on connection open so `ON DELETE CASCADE` fires deterministically.
## Manual test script for current epic
1. Run `npm run check` — verify ESLint (including architecture boundary rules), `tsc --noEmit`, and all 15 Vitest tests pass.
2. Run `npm run dev` — open `http://localhost:3000/` (200 OK) and `http://localhost:3000/api/health` (`{"ok":true,"storage":"local"}`), and confirm `data/hiep-trong-space.db` is created and migrated automatically.
3. Run `git status` — confirm `.env` and `data/` do not appear as untracked/staged files.
## Known issues
- Pre-existing user modifications on `md/agent_readme.md`, `md/human_readme.md`, `md/ui_readme.md`, `sources.txt`, and untracked `md/human_instructions.md` were left unstaged and untouched per §2.10.
## Ideas (not doing now)
- Add an API route for `/api/media/:id` in a future epic when media-consuming pages are specified.
## Environment notes
- Node `v26.13.0`, npm `11.20.0`, Git `2.56.0.windows.1` on Windows (`win32 x64`).
- Installed agreed stack: Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, `motion` 12, TanStack Query 5, Zod 3, `better-sqlite3` 13 + Drizzle ORM / Drizzle Kit, `date-fns` 4 + `@date-fns/tz`, `lucide-react`, Vitest 3, ESLint 9, Prettier 3.
