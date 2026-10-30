# Progress
## Current
Epic: 4 Notification Center | Branch: epic/4-notifications | Status: done
## Done
- [x] Epic 0 — Foundation and storage layer (2026-10-30)
- [x] Epic 1 — Design tokens, app shell, route stubs (2026-10-30)
- [x] Epic 2 — Daily Task Management (2026-10-30)
- [x] Epic 3 — Tasks Hub and sync (2026-10-30)
- [x] Epic 4 — Notification Center (2026-10-30)
## Decisions made during build
- Placed test files under `tests/` mirroring `src/` and enforced closed-palette compliance (`tokens-guardrail.test.ts`) plus zero component duplication (`hub-list.test.tsx` verifies strictly one `TaskCard.tsx` and one `TaskForm.tsx`).
- Auto-reveals the Completed group in Tasks Hub when `?task=<id>` targets a completed task so clicking a `"Completed"` notification always scrolls to and highlights the card.
- Used a sibling stretched `TransitionLink` (`after:absolute after:inset-0`) beside the `Checkbox` in `NotificationItem` so clicking the card body navigates via `TransitionLink` and marks read while clicking the checkbox toggles read without nesting interactive `<button>` inside `<a>`.
## Manual test script for current epic
1. Open `/tasks/daily` or `/tasks/hub` — create a task due in 2 minutes and verify `Due soon` appears in the notification bell popover at 1m30s and `Overdue` appears at 2m00s without duplicates.
2. Tick the read checkbox on a notification — verify its unread coral dot disappears and unread count decrements without navigating away; click **Mark all as read** to clear remaining unread items.
3. Click a task notification body — verify the popover closes, marks the notification read, and opens `/tasks/hub?task=<id>` with the matching task scrolled into view, expanded, and glowing for 2 seconds.
4. Click outside or press `Esc` while the notification popover is open — verify it closes cleanly and returns focus to the bell.
## Known issues
- Pre-existing user modifications on `md/agent_readme.md`, `md/human_readme.md`, `md/ui_readme.md`, `sources.txt`, and untracked `md/human_instructions.md` remain unstaged and untouched per §2.10.
## Ideas (not doing now)
- Add an API route for `/api/media/:id` in a future epic when media-consuming pages are specified.
## Environment notes
- Node `v26.13.0`, npm `11.20.0`, Git `2.56.0.windows.1` on Windows (`win32 x64`).
