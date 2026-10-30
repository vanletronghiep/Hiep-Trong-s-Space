# Progress
## Current
Epic: 7 Cosmic Launch | Branch: epic/7-cosmic-launch | Status: done
## Done
- [x] Epic 0 — Foundation and storage layer (2026-10-30)
- [x] Epic 1 — Design tokens, app shell, route stubs (2026-10-30)
- [x] Epic 2 — Daily Task Management (2026-10-30)
- [x] Epic 3 — Tasks Hub and sync (2026-10-30)
- [x] Epic 4 — Notification Center (2026-10-30)
- [x] Epic 5 — Homepage (2026-10-30)
- [x] Epic 6 — Feature Collection (2026-10-30)
- [x] Epic 7 — Cosmic Launch (2026-10-30)
## Decisions made during build
- Placed test files under `tests/` mirroring `src/` and enforced closed-palette compliance (`tokens-guardrail.test.ts`) plus zero component duplication (`hub-list.test.tsx` verifies strictly one `TaskCard.tsx` and one `TaskForm.tsx`).
- Built `StarfieldEngine` as a framework-free 2D Canvas 3D-perspective engine with preallocated typed arrays, seeded PRNG for static reduced-motion frames, CSS-token colour lookup at init (zero raw hex/rgb), `visibilitychange` pause, and automatic quality step-down; reused directly inside `CosmicLaunchOverlay`.
- Homepage Quality Gate (`ui_readme.md` §16.1): 1. Yes, 2. Yes, 3. Yes, 4. Yes, 5. Yes, 6. Yes, 7. Yes, 8. Yes, 9. Yes, 10. Yes.
- Implemented `CosmicLaunchOverlay` + `TransitionProvider` with 100% composited `transform`/`opacity` flight keyframes, `<PageReady />` arrival coordination (holding smoothly at `2300ms` if destination data is still loading, with a 10s failsafe reveal), `OverlayErrorBoundary` fallback, and a `<= 300ms` plain crossfade for `prefers-reduced-motion` and browser `popstate`.
## Manual test script for current epic
1. Click any Feature Card on `/` or jump via `Ctrl+K` Universe Menu — verify the ~3s 4-phase Cosmic Launch plays (0–500ms Departure, 500–1300ms Ignition, 1300–2300ms Acceleration with restrained star streaks, 2300–3000ms Arrival fade into the destination page with focus placed on the new heading).
2. Double-click a link during transition — verify repeated clicks are ignored; press browser Back/Forward — verify a quick `<= 300ms` plain fade plays without the 3s sequence.
3. Click `"Let's go"` on `/`, open/close the notification popover, or click a task notification while already on `/tasks/hub` (`?task=<id>`) — verify Cosmic Launch never triggers for non-route or same-pathname actions.
4. Enable OS `prefers-reduced-motion` — verify internal route changes use a `<= 300ms` opacity crossfade with no spacecraft or star streaks.
## Known issues
- Pre-existing user modifications on `md/agent_readme.md`, `md/human_readme.md`, `md/ui_readme.md`, `sources.txt`, and untracked `md/human_instructions.md` remain unstaged and untouched per §2.10.
## Ideas (not doing now)
- Add an API route for `/api/media/:id` in a future epic when media-consuming pages are specified.
## Environment notes
- Node `v26.13.0`, npm `11.20.0`, Git `2.56.0.windows.1` on Windows (`win32 x64`).
