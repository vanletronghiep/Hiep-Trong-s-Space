# Progress
## Current
Epic: 3 Tasks Hub and sync | Branch: epic/3-tasks-hub | Status: done
## Done
- [x] Epic 0 — Foundation and storage layer (2026-10-30)
- [x] Epic 1 — Design tokens, app shell, route stubs (2026-10-30)
- [x] Epic 2 — Daily Task Management (2026-10-30)
- [x] Epic 3 — Tasks Hub and sync (2026-10-30)
## Decisions made during build
- Placed test files under `tests/` mirroring `src/` and enforced closed-palette compliance (`tokens-guardrail.test.ts`) plus zero component duplication (`hub-list.test.tsx` verifies strictly one `TaskCard.tsx` and one `TaskForm.tsx`).
- Auto-reveals the Completed group in Tasks Hub when `?task=<id>` targets a completed task so clicking a `"Completed"` notification always scrolls to and highlights the card.
## Manual test script for current epic
1. Open `/tasks/hub` — create an unscheduled task via **Add task** and confirm it appears under Overdue / Due soon / Later without appearing in any Daily column.
2. Click the task card body to expand — click **Add to today** (or **Add to tomorrow** / **Pick date…**), confirm the `"Scheduled DD/MM"` chip appears, and verify the task appears in `/tasks/daily`.
3. Complete or delete a task in `/tasks/hub` and confirm `/tasks/daily` reflects the change immediately via shared query cache invalidation; toggle **Show completed** to inspect finished tasks.
4. Visit `/tasks/hub?task=<id>` and confirm the matching card scrolls into view, expands, and plays the 2-second highlight glow.
## Known issues
- Pre-existing user modifications on `md/agent_readme.md`, `md/human_readme.md`, `md/ui_readme.md`, `sources.txt`, and untracked `md/human_instructions.md` remain unstaged and untouched per §2.10.
## Ideas (not doing now)
- Add an API route for `/api/media/:id` in a future epic when media-consuming pages are specified.
## Environment notes
- Node `v26.13.0`, npm `11.20.0`, Git `2.56.0.windows.1` on Windows (`win32 x64`).
