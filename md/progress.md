# Progress
## Current
Epic: 8 Hardening and polish | Branch: epic/8-hardening | Status: done
## Done
- [x] Epic 0 — Foundation and storage layer (2026-10-30)
- [x] Epic 1 — Design tokens, app shell, route stubs (2026-10-30)
- [x] Epic 2 — Daily Task Management (2026-10-30)
- [x] Epic 3 — Tasks Hub and sync (2026-10-30)
- [x] Epic 4 — Notification Center (2026-10-30)
- [x] Epic 5 — Homepage (2026-10-30)
- [x] Epic 6 — Feature Collection (2026-10-30)
- [x] Epic 7 — Cosmic Launch (2026-10-30)
- [x] Epic 8 — Hardening and polish (2026-10-30)
## Decisions made during build
- Placed test files under `tests/` mirroring `src/` and enforced closed-palette compliance (`tokens-guardrail.test.ts`), craft/architecture compliance (`craft-and-architecture-guardrails.test.ts`), and zero component duplication (`hub-list.test.tsx`).
- Built `StarfieldEngine` as a framework-free 2D Canvas 3D-perspective engine with preallocated typed arrays, seeded PRNG for static reduced-motion frames, CSS-token colour lookup at init, `visibilitychange` pause, and automatic quality step-down; reused directly inside `CosmicLaunchOverlay`.
- Homepage Quality Gate (`ui_readme.md` §16.1): 1. Yes, 2. Yes, 3. Yes, 4. Yes, 5. Yes, 6. Yes, 7. Yes, 8. Yes, 9. Yes, 10. Yes.
- Switched `Cormorant_Garamond` and `Inter` in `src/design/fonts.ts` to variable-font loading (omitting discrete `weight` arrays) so Next.js 15 self-hosts `.woff2` variable fonts reliably during `npm run build` across all weights (`300–700`, normal & italic).
- Tightened derived status text `color-mix` stops in `src/design/tokens.css` (`--text-completed`, `--text-overdue`, `--text-due-soon`, `--text-notif-completed`, `--text-system`, `--text-accent`) so all status labels and badges exceed WCAG AA `4.5:1` contrast.
- Epic 9 (Statistics) remains intentionally unstarted (`BLOCKED` per `agent_readme.md` §10 & §2.9) behind the `"Statistics will live here."` placeholder drawer.
## Manual test script for current epic
1. Run `npm run check` and `npm run build` — verify ESLint, TypeScript, all Vitest suites, and the Next.js production build succeed with zero errors.
2. Open `http://localhost:3000` (`npm run dev` or `npm start`) — test keyboard-only navigation (`Tab`, `Shift+Tab`, `Enter`, `Esc`, `Ctrl+K` Universe menu), OS `prefers-reduced-motion`, and responsive widths (`320px`, `360px`, `768px`, `1024px`, `1280px`, `1440px`) across `/`, `/tasks/daily`, `/tasks/hub`, the Notification Center popover, and Blank Pages.
3. Follow the `README.md` backup steps (`Copy-Item -Recurse .\data ...`) to verify single-folder local backup of SQLite and media storage.
## Known issues
- Pre-existing user modifications on `md/agent_readme.md`, `md/human_readme.md`, `md/ui_readme.md`, `sources.txt`, and untracked `md/human_instructions.md` remain unstaged and untouched per §2.10.
## Ideas (not doing now)
- None pending for v1 (Epic 9 Statistics awaits user specification).
## Environment notes
- Node `v26.13.0`, npm `11.20.0`, Git `2.56.0.windows.1` on Windows (`win32 x64`).
