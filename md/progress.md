# Progress
## Current
Epic: 2 Daily Task Management | Branch: epic/2-daily-tasks | Status: done
## Done
- [x] Epic 0 — Foundation and storage layer (2026-10-30)
- [x] Epic 1 — Design tokens, app shell, route stubs (2026-10-30)
- [x] Epic 2 — Daily Task Management (2026-10-30)
## Decisions made during build
- Placed test files under `tests/` mirroring `src/` and enforced closed-palette compliance via `tests/design/tokens-guardrail.test.ts`.
- Built `TaskCard`, `TaskForm`, `TaskMenu`, `TransferDialog`, and `ScheduleDateDialog` once in `src/features/tasks/` with context-aware props (`daily` | `overdue` | `hub`) so Epic 3 reuses the exact same components without duplication.
- Re-evaluated `deriveTaskState(task, now)` live on the client via a single shared `useMinuteTicker()` timer per page so tasks transition into Due soon or Overdue automatically without per-card intervals.
## Manual test script for current epic
1. Open `/tasks/daily` — verify Day view shows Yesterday (no Add button), Today (emphasised + Add button), and Tomorrow (Add button), plus Overdue below.
2. Add tasks in Today and Tomorrow (`DD/MM` + `HH:mm`, Urgent/Normal/Optional, Pinned); edit a task's deadline into the past to verify Yesterday/Overdue coral appearance.
3. Tick a task's checkbox — verify animated strike + italic, smooth glide to the bottom of the column, and `"N done"` counter increment.
4. Click **Transfer** on an overdue task — move it to Today or Tomorrow with a future time and confirm it leaves Overdue and lands in the target column.
5. Delete a task via the three-dot menu or Overdue card — confirm the dialog prompt and removal; switch Day / Week / Month and reload the page to verify persistence.
## Known issues
- Pre-existing user modifications on `md/agent_readme.md`, `md/human_readme.md`, `md/ui_readme.md`, `sources.txt`, and untracked `md/human_instructions.md` remain unstaged and untouched per §2.10.
## Ideas (not doing now)
- Add an API route for `/api/media/:id` in a future epic when media-consuming pages are specified.
## Environment notes
- Node `v26.13.0`, npm `11.20.0`, Git `2.56.0.windows.1` on Windows (`win32 x64`).
