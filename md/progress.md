# Progress
## Current
Epic: 6 Feature Collection | Branch: epic/6-feature-collection | Status: done
## Done
- [x] Epic 0 — Foundation and storage layer (2026-10-30)
- [x] Epic 1 — Design tokens, app shell, route stubs (2026-10-30)
- [x] Epic 2 — Daily Task Management (2026-10-30)
- [x] Epic 3 — Tasks Hub and sync (2026-10-30)
- [x] Epic 4 — Notification Center (2026-10-30)
- [x] Epic 5 — Homepage (2026-10-30)
- [x] Epic 6 — Feature Collection (2026-10-30)
## Decisions made during build
- Placed test files under `tests/` mirroring `src/` and enforced closed-palette compliance (`tokens-guardrail.test.ts`) plus zero component duplication (`hub-list.test.tsx` verifies strictly one `TaskCard.tsx` and one `TaskForm.tsx`).
- Built `StarfieldEngine` as a framework-free 2D Canvas 3D-perspective engine with preallocated typed arrays, seeded PRNG for static reduced-motion frames, CSS-token colour lookup at init (zero raw hex/rgb), `visibilitychange` pause, and automatic quality step-down.
- Homepage Quality Gate (`ui_readme.md` §16.1): 1. Yes, 2. Yes, 3. Yes, 4. Yes, 5. Yes, 6. Yes, 7. Yes, 8. Yes, 9. Yes, 10. Yes.
- Bounded desktop pinned horizontal card width by `min((content - 24) / 2, (100svh - header - 172) * 1.6)` (`ui_readme.md` §11.4) with symmetric track padding so cards 1–2 and 12–13 align identically inside `--max-content` at progress `0` and `1` across all aspect ratios.
## Manual test script for current epic
1. Open `/` on desktop (`>=1024px`) — scroll down into **Explore the space** (`Horizontal` mode) and verify the stage pins cleanly with two large 16:10 cards visible initially, translating continuously left as you scroll down and reversing smoothly as you scroll up before releasing into the footer.
2. Click **Vertical** in the section header — verify all 13 cards render immediately in a 2-column grid (7 rows, no spacer, no sticky stage), scroll stays anchored at the collection, and reloading `/` remembers `Vertical`.
3. Resize below `1024px` (768px tablet / 390px phone) or enable `prefers-reduced-motion` in `Horizontal` mode — verify it switches to the native touch-friendly `scroll-snap` horizontal gallery with zero horizontal page overflow.
## Known issues
- Pre-existing user modifications on `md/agent_readme.md`, `md/human_readme.md`, `md/ui_readme.md`, `sources.txt`, and untracked `md/human_instructions.md` remain unstaged and untouched per §2.10.
## Ideas (not doing now)
- Add an API route for `/api/media/:id` in a future epic when media-consuming pages are specified.
## Environment notes
- Node `v26.13.0`, npm `11.20.0`, Git `2.56.0.windows.1` on Windows (`win32 x64`).
