# Progress
## Current
Epic: 5 Homepage | Branch: epic/5-homepage | Status: done
## Done
- [x] Epic 0 — Foundation and storage layer (2026-10-30)
- [x] Epic 1 — Design tokens, app shell, route stubs (2026-10-30)
- [x] Epic 2 — Daily Task Management (2026-10-30)
- [x] Epic 3 — Tasks Hub and sync (2026-10-30)
- [x] Epic 4 — Notification Center (2026-10-30)
- [x] Epic 5 — Homepage (2026-10-30)
## Decisions made during build
- Placed test files under `tests/` mirroring `src/` and enforced closed-palette compliance (`tokens-guardrail.test.ts`) plus zero component duplication (`hub-list.test.tsx` verifies strictly one `TaskCard.tsx` and one `TaskForm.tsx`).
- Built `StarfieldEngine` as a framework-free 2D Canvas 3D-perspective engine with preallocated typed arrays, seeded PRNG for static reduced-motion frames, CSS-token colour lookup at init (zero raw hex/rgb), `visibilitychange` pause, and automatic quality step-down.
- Homepage Quality Gate (`ui_readme.md` §16.1): 1. Yes, 2. Yes, 3. Yes, 4. Yes, 5. Yes, 6. Yes, 7. Yes, 8. Yes, 9. Yes, 10. Yes.
## Manual test script for current epic
1. Open `/` — verify the dark cosmos gradient, subtle radial lights, and smooth 3D-perspective starfield drift continuously without overflow at 320px, 768px, and 1440px.
2. Inspect the `Wordmark` — verify italic `"Hiep Trong"` overlaps the top-left of uppercase `"SPACE"`, optically centred beneath one lavender four-point star, followed by the statement and tagline.
3. Hover and Tab-focus **Let's go** in the top-right beside the cosmos bell — verify the label slides/fades right while the arrow glides in without shifting button width, and clicking smooth-scrolls to `#features` without changing the URL hash.
4. Enable OS `prefers-reduced-motion` — verify the starfield renders one seeded static frame without starting the RAF loop and `"Let's go"` jumps cleanly without smooth-scroll animation.
## Known issues
- Pre-existing user modifications on `md/agent_readme.md`, `md/human_readme.md`, `md/ui_readme.md`, `sources.txt`, and untracked `md/human_instructions.md` remain unstaged and untouched per §2.10.
## Ideas (not doing now)
- Add an API route for `/api/media/:id` in a future epic when media-consuming pages are specified.
## Environment notes
- Node `v26.13.0`, npm `11.20.0`, Git `2.56.0.windows.1` on Windows (`win32 x64`).
