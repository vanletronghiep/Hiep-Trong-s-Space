# Progress
## Current
Epic: 1 Design tokens, app shell, route stubs | Branch: epic/1-design-shell | Status: done
## Done
- [x] Epic 0 — Foundation and storage layer (2026-10-30)
- [x] Epic 1 — Design tokens, app shell, route stubs (2026-10-30)
## Decisions made during build
- Placed test files under `tests/` mirroring `src/` and added `tests/design/tokens-guardrail.test.ts` to fail automatically if any raw `#hex`, `rgb()`, or `hsl()` colour literal appears in `src/` outside `src/design/tokens.css`.
- Configured ESLint `no-restricted-imports` across all §5.1 architectural layers plus `no-restricted-properties` blocking `process.env` outside `src/server/config.ts`.
- Used `better-sqlite3@^13.0.3` with `PRAGMA journal_mode = WAL` and `PRAGMA foreign_keys = ON`.
- Kept `WorkspaceShell` top-bar chrome separate from `WorkspacePageHeader` / `BlankPage` headings so every route renders strictly one `<h1>` element per page.
## Manual test script for current epic
1. Run `npm run check` — confirm lint, typecheck, and all 18 tests (including token closed-palette and 13-route coverage) pass.
2. Start `npm run dev` and open `/` plus all 13 feature routes (`/tasks/daily`, `/tasks/hub`, `/events`, etc.) and press `Ctrl+K` on any workspace route to filter and jump via the Universe menu.
## Known issues
- Pre-existing user modifications on `md/agent_readme.md`, `md/human_readme.md`, `md/ui_readme.md`, `sources.txt`, and untracked `md/human_instructions.md` remain unstaged and untouched per §2.10.
## Ideas (not doing now)
- Add an API route for `/api/media/:id` in a future epic when media-consuming pages are specified.
## Environment notes
- Node `v26.13.0`, npm `11.20.0`, Git `2.56.0.windows.1` on Windows (`win32 x64`).
