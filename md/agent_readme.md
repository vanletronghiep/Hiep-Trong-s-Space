# agent_readme.md — HOW TO BUILD Hiep Trong Space

Audience: the AI coding agent (Antigravity IDE). Read this file completely at the start of every session. It is the technical authority. `human_readme.md` explains WHAT and WHY; `ui_readme.md` is the visual and interaction authority; `md/progress.md` is the live status log.

---

## 0. How to use this document

### 0.1 Document precedence (when two sources disagree)
1. The user's latest explicit instruction in chat.
2. `human_readme.md` (behaviour, decisions, acceptance criteria).
3. This file (architecture, rules, conventions).
4. `ui_readme.md`: inside it, **the specific section for a surface beats the generic "design language" template**. Specific sections are: Homepage UI, Animated Universe Background, Homepage Navigation, Feature Collection, Global Page Transition, Task UI, Homepage Notification Center. The generic template (white canvas, Signifier font, blue accent, "closed palette", reference components) only contributes **craft rules**: sentence case, no emoji icons, quiet motion, anti-slop, tokens-only colours, responsive-by-default. It does **not** contribute its colours or fonts.
5. If still ambiguous: ask the user one short question. Do not guess on anything that is expensive to redo.

Known conflicts already resolved (do not re-ask):
- Dark backgrounds: the starfield spec wins (`#05080D → #071321 → #09182A`). The homepage's `#090D20 / #10152B` may only appear as a very faint ambient tint.
- Soft white: use `#F4EFFF` everywhere (the button spec's `#F4F2FF` is treated as the same token).
- Wordmark "SPACE" is uppercase because the Homepage spec says so. That is the only uppercase exception besides tiny tags and micro labels.
- Task "Completed" state colour `#9A8BCB`; notification "Completed" tag is soft sage. Both are intentional.
- Fonts: Cormorant Garamond (display) and Inter (UI). Never Signifier, never any paid font.

### 0.2 Session start protocol (every session, in this order)
1. Read this file, then `md/progress.md`.
2. Read only the `human_readme.md` and `ui_readme.md` sections relevant to the current epic (use headings; do not re-read everything).
3. Run `git status` and `git branch --show-current`. Confirm you are on the current epic's branch with a clean tree (or explain what is dirty).
4. State in 2–4 lines: current epic, what you will do first, what you will NOT touch.
5. Work in small steps; after each step run the relevant checks (section 12).

### 0.3 Session end protocol
1. Run `npm run lint`, `npm run typecheck`, `npm test`. Fix failures you caused.
2. Update `md/progress.md` (template in section 14.3).
3. Commit (section 13). Report to the user using the format in section 14.2.
4. Stop. Do not start the next epic.

---

## 1. Project summary (60 seconds)

A single-user, local-first, personal life-management website for one person (Hiep) on Windows. Fully built features: **Homepage**, **Daily Task Management** (priority no. 1), **Tasks Hub**, **Notification Center** (popover). Eleven further feature pages are **Blank Pages** (placeholder only). Visual identity: a dark animated cosmos on the homepage, a bright lavender "Celestial Workspace" everywhere else.

Hard architectural goals:
- UI can be redesigned or replaced with minimal changes elsewhere.
- Storage can be swapped (SQLite → Google Drive/Cloud) by writing one adapter.
- Task logic is pure, tested, and independent of React and the database.

---

## 2. Non-negotiable rules (summary — details below)

1. **One epic at a time.** Never start the next epic without the user's explicit go-ahead.
2. **No I/O outside the storage layer.** No `fs`, `better-sqlite3`, `drizzle`, SQL strings in routes, services, UI, or domain code. Only `src/services/storage/**` may touch them.
3. **UI never imports** `src/services/**`, `src/server/**`, `drizzle-orm`, or `better-sqlite3`. UI talks to the backend only through `src/client/**`.
4. **Domain is pure.** `src/domain/**` imports nothing from React, Next, Node I/O, or the database. Time comes from an injected `Clock`.
5. **Daily Task Management and Tasks Hub use one task table and one `TaskCard` component.**
6. **All colours come from tokens** (`src/design/tokens.css`). No hex/rgb in components.
7. **Secrets and paths in `.env`.** Never in code. `.env` and `data/` are git-ignored.
8. **Ask before** anything in section 3's "ASK FIRST" list. **Never** do anything in the "NEVER" list.
9. **Do not implement Blank Page content or Statistics.** Placeholders only.
10. **Do not edit** `human_readme.md`, `ui_readme.md`, `sources.txt` or this file (`agent_readme.md`) without explicit permission. You maintain `md/progress.md` yourself.
11. **No scope creep.** If you notice something worth improving outside the epic, record it in `progress.md` under "Ideas", do not do it.

---

## 3. Permissions

### 3.1 Allowed without asking
- Installing **project-level** npm dependencies from the agreed list (section 4.2), inside the project folder.
- Dev tools to run, lint, test, build: ESLint, Prettier, Vitest, TypeScript, drizzle-kit.
- Creating and editing files inside the project folder (except protected files in 2.10).
- Creating a git branch for the current epic; committing on it.

### 3.2 ASK FIRST (stop and wait for an answer)
- Any library **not** in the agreed list. Say what, why, and the alternative of not using it.
- Any **system-wide** tool (Node.js, Git, Python, Visual Studio Build Tools, databases, Docker). Give the user the exact Windows command or steps and wait for them to run it (see `human_instructions.md` §2 for the standard commands).
- **Major-version** upgrades of existing dependencies.
- Paid, account-based, or cloud services (including Google Drive credentials).
- Deleting or rewriting more than ~30 lines of existing, working code outside the current epic's scope.
- Changing the database schema in a way that drops or renames existing columns after Epic 2 (use additive migrations).

### 3.3 NEVER
- Use administrator rights, `sudo`, or change system settings, environment variables, PATH, registry, or files outside the project folder.
- Download or run scripts from unknown sources (`curl | sh`, random gists).
- Put API keys or secrets in code, commits, logs, or `progress.md`.
- `git push`, `git push --force`, `git reset --hard` on a shared ref, rewrite history, or commit to `main`.
- Delete the `data/` folder or the database file; run destructive SQL against real data without asking.
- Disable lint rules, TypeScript strictness, or tests to make something pass.
- Add telemetry, analytics, remote fonts, or CDN scripts (fonts are self-hosted via `next/font`).

### 3.4 After every installation
1. Tell the user in one line: what was installed and why.
2. Make sure it is recorded in `package.json` / lockfile.
3. Commit it **separately** from feature code: `chore(deps): add <pkg> for <reason>`.

---

## 4. Technology

### 4.1 Environment
- OS: Windows. Shell: assume PowerShell or cmd. **Every npm script must work on Windows** (no `rm -rf`, no `export VAR=`; use cross-platform tools already in the stack, or Node scripts).
- Node.js: current LTS (check the Next.js docs for the minimum). Package manager: **npm only**.
- Check availability first: `node -v`, `npm -v`, `git --version`. If missing, ASK FIRST with the exact install steps.
- Git line endings: add `.gitattributes` with `* text=auto`.

### 4.2 Agreed stack (install at the latest stable version available at install time, pin in the lockfile)
| Purpose | Package(s) |
| --- | --- |
| Framework | `next` (App Router), `react`, `react-dom`, `typescript`, `@types/*` |
| Styling | `tailwindcss` (+ its PostCSS plugin), `clsx`, `tailwind-merge` |
| Motion | `motion` (the Framer Motion successor) |
| Data fetching | `@tanstack/react-query` |
| Validation | `zod` |
| Database | `better-sqlite3`, `drizzle-orm`, `drizzle-kit` (dev) |
| Dates | `date-fns`, `@date-fns/tz` |
| Icons | `lucide-react` (only icon library) + hand-made inline SVG for the four-point star |
| IDs | `crypto.randomUUID()` (built in; no package) |
| Tests | `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` |
| Quality | `eslint` (+ `eslint-config-next`), `prettier`, `eslint-plugin-boundaries` or built-in `no-restricted-imports` |

Anything else (for example `shadcn/ui`, `zustand`, `axios`, Playwright) is **ASK FIRST**. `three` is deliberately **not** used: the starfield is Canvas 2D.

Fallback if `better-sqlite3` cannot install on this machine without system build tools: STOP and ask. Do not silently switch databases. (Possible fallback to propose: Node's built-in `node:sqlite` if the installed Node version provides it.)

### 4.3 TypeScript and code conventions
- `strict: true`, `noUncheckedIndexedAccess: true`. No `any` (use `unknown` + narrowing). No non-null `!` without a comment.
- Path alias `@/*` → `src/*`.
- Files: components `PascalCase.tsx`; everything else `kebab-case.ts`. One main export per file; named exports (default exports only where Next requires).
- Functions short and named for intent. Comments explain **why**, not what.
- Dates: never use `Date` arithmetic by hand; use `date-fns` with the app timezone. Never use `new Date()` directly in domain/services; use `clock.now()`.
- Errors: services throw typed `AppError` (`code`, `message`, `httpStatus`); route handlers translate them to JSON `{ error: { code, message, fields? } }`.
- No `console.log` left in committed code (use a tiny `logger` util).

---

## 5. Architecture

### 5.1 Layers and the dependency rule

```
UI (src/features, src/ui, src/app pages)
   ↓ uses
Client (src/client): typed API client + TanStack Query hooks + UI preferences
   ↓ HTTP (JSON)
API (src/app/api/**): thin route handlers (validate → call service → return DTO)
   ↓
Services (src/services): use cases (TaskService, NotificationService, …)
   ↓ interfaces only
Storage (src/services/storage): StorageAdapter + local SQLite implementation
```
Shared by all: `src/contracts` (Zod schemas, DTOs, enums) and `src/domain` (pure rules).

| Module | May import | Must NOT import |
| --- | --- | --- |
| `domain` | `contracts` types, `date-fns` | React, Next, `services`, `server`, I/O, DB |
| `contracts` | `zod` | everything else |
| `services` (not `storage`) | `domain`, `contracts`, storage **interfaces** | `better-sqlite3`, `drizzle-orm`, `fs`, React, Next |
| `services/storage/local` | drivers, `fs`, `drizzle-orm`, `contracts`, interfaces | UI, Next |
| `server` (composition root, config, scheduler) | `services`, `services/storage`, `domain` | UI |
| `app/api` | `contracts`, `server` (to obtain services) | `services/storage/**`, DB drivers, UI |
| `client` | `contracts`, `domain` (pure helpers), `react`, `@tanstack/react-query` | `services`, `server`, DB |
| `features`, `ui` | `client`, `contracts`, `domain` (pure helpers), `design`, `motion`, `lucide-react` | `services`, `server`, DB drivers, `fs` |
| `design` | none | everything |

Enforce this with ESLint `no-restricted-imports` (or `eslint-plugin-boundaries`) configured in Epic 0. A violation is a failing lint, not a style opinion.

**Redesign test:** you must be able to delete `src/features` and `src/ui`, build a new UI, and use the same `src/client` hooks without touching any other folder.

### 5.2 Folder structure

```
Task Management/
├── md/                      human_readme, agent_readme, human_instructions, ui_readme, progress, refs/
├── sources.txt              human only — never read or edit
├── AGENTS.md                one-paragraph pointer to md/agent_readme.md
├── .env.example             committed, documents every variable (no secrets)
├── .env                     git-ignored
├── .gitignore, .gitattributes, eslint config, prettier config, vitest config, tsconfig
├── drizzle/                 generated SQL migrations (committed)
├── data/                    git-ignored: hiep-trong-space.db, media/
├── public/
└── src/
    ├── app/                 Next.js routes ONLY (thin)
    │   ├── layout.tsx       providers, fonts, global CSS
    │   ├── page.tsx         homepage (composes features/home)
    │   ├── (workspace)/     route group wrapped by WorkspaceShell
    │   │   ├── tasks/daily/page.tsx
    │   │   ├── tasks/hub/page.tsx
    │   │   └── events|ai-engineering|blogs|apcs|flashcards|entertainment|
    │   │       tracking|projects|milestones|learning-room|achievements/page.tsx   (BlankPage)
    │   └── api/             route handlers (tasks, notifications, health)
    ├── contracts/           zod schemas + DTO types + enums (shared by API and UI)
    ├── domain/              pure rules: task-status, task-sort, reminder, time, notification-rules, clock
    ├── services/
    │   ├── task-service.ts, notification-service.ts, errors.ts
    │   └── storage/
    │       ├── storage-adapter.ts    interfaces
    │       ├── factory.ts            createStorageAdapter(config)
    │       ├── local/                SQLite + local media implementation
    │       └── drive/                stub: throws NotImplementedError
    ├── server/              config.ts (the ONLY place reading process.env), container.ts, scheduler.ts
    ├── client/              api-client.ts, queries/*, preferences.ts (UI prefs wrapper over localStorage)
    ├── features/
    │   ├── registry.ts      the single list of 13 features (single source for cards, routes, titles)
    │   ├── home/            Hero, Wordmark, Starfield, LetsGoButton, feature-collection/*
    │   ├── tasks/           TaskCard, TaskForm, TaskMenu, DailyBoard, WeekView, MonthView, OverdueList, HubList, …
    │   ├── notifications/   BellButton, NotificationPopover, NotificationItem
    │   ├── transitions/     CosmicLaunch overlay, TransitionProvider, TransitionLink, useTransitionRouter
    │   └── blank/           BlankPage
    ├── ui/                  design-system primitives: Button, IconButton, Badge, Chip, Dialog, Drawer, Popover, Toast, SegmentedControl, Skeleton, Checkbox, StarIcon, WorkspaceShell
    └── design/              tokens.css, fonts.ts, motion.ts (durations, easings, variants)
tests/                       mirrors src for domain/service tests (or colocate *.test.ts — choose one in Epic 0 and keep it)
```

### 5.3 Environment variables (`.env.example`)
```
APP_TIMEZONE=Asia/Saigon
STORAGE_DRIVER=local            # local | drive (drive is a stub)
DATA_DIR=./data
DATABASE_FILE=hiep-trong-space.db
MEDIA_DIR=./data/media
GOOGLE_DRIVE_FOLDER_ID=         # future; leave empty
SCHEDULER_TICK_SECONDS=30
```
`src/server/config.ts` parses these with Zod and exports a typed config object. Nothing else reads `process.env`.

### 5.4 Storage abstraction (the contract to keep)

```ts
// src/services/storage/storage-adapter.ts
export interface Repository<TRecord, TQuery = void> {
  saveItem(record: TRecord): Promise<TRecord>;          // create or update (upsert by id)
  getItem(id: string): Promise<TRecord | null>;
  listItems(query?: TQuery): Promise<TRecord[]>;
  deleteItem(id: string): Promise<void>;
}
export interface MediaStorage {
  uploadMedia(file: { name: string; mimeType: string; data: Uint8Array }): Promise<{ id: string; url: string }>;
  getMedia(id: string): Promise<{ mimeType: string; data: Uint8Array } | null>;
  deleteMedia(id: string): Promise<void>;
}
export interface TaskRepository extends Repository<TaskRecord, TaskQuery> {}
export interface NotificationRepository extends Repository<NotificationRecord, NotificationQuery> {
  deleteWhere(filter: NotificationDeleteFilter): Promise<number>;   // purge, stale removal
}
export interface StorageAdapter {
  tasks: TaskRepository;
  notifications: NotificationRepository;
  media: MediaStorage;
  init(): Promise<void>;        // run migrations / prepare folders
  close(): Promise<void>;
}
```
- Services receive a `StorageAdapter` (dependency injection via `src/server/container.ts`). They never know which implementation it is.
- `local/` implements it with SQLite (Drizzle). `drive/` exports a class implementing the same interface whose methods throw `NotImplementedError("Drive adapter not implemented")`, with a comment listing which Drive API calls each method would map to.
- Queries are expressed as plain objects (`TaskQuery { status?, scheduledDate?, scheduledFrom?, scheduledTo?, deadlineFrom?, deadlineTo?, search? }`), never SQL. Business rules (overdue, sorting) are **not** in storage; storage returns data, domain/services decide.
- Media is in the interface now but only used by future pages; implement local file storage minimally and test it, do not build upload UI.
- Test both repositories against a temporary SQLite file; write the repository test suite so it can be re-run against a future adapter.

### 5.4.1 Clock
```ts
export interface Clock { now(): Date }
export const systemClock: Clock = { now: () => new Date() };
```
All services and the scheduler receive a `Clock`. Tests use a fake clock. This is what makes overdue/reminder logic testable.

---

## 6. Domain model and rules

### 6.1 Task
```ts
type Priority = 'urgent' | 'normal' | 'optional';
type TaskStatus = 'active' | 'completed';
interface TaskRecord {
  id: string;                    // uuid
  title: string;                 // 1..120 chars, trimmed
  description: string;           // '' allowed, max 2000
  priority: Priority;            // default 'normal'
  pinned: boolean;               // default false
  deadlineAt: string;            // ISO instant (UTC); required
  scheduledDate: string | null;  // 'YYYY-MM-DD' in APP_TIMEZONE; null = not in any Daily list
  status: TaskStatus;
  completedAt: string | null;
  reminderAt: string | null;     // computed (6.4); null when completed or already overdue at creation
  createdAt: string;
  updatedAt: string;
}
```
DB table `tasks` with those columns. Leave schema room for future recurring/tags/subtasks **without** creating columns for them now. Index `(status, scheduledDate)`, `(status, deadlineAt)`, `(reminderAt)`.

### 6.2 Derived state (computed, never stored)
- `isOverdue = status === 'active' && deadlineAt < now`
- `timeLeftMs = deadlineAt − now` (negative when overdue)
- `isDueSoon = status === 'active' && !isOverdue && reminderAt != null && reminderAt <= now`
- The API returns these as DTO fields (`isOverdue`, `isDueSoon`, `timeLeftMs`) for convenience, **and** the pure functions live in `domain` so the UI can re-evaluate live every minute without refetching. Both must call the same function.

### 6.3 Placement rules
- A task appears in the Daily column for date D if `scheduledDate === D`. If `scheduledDate` is null it appears **only** in the Hub.
- Tasks created from a Daily Today/Tomorrow column get `scheduledDate` = that column's date and a default deadline of that date at 23:59 (user editable).
- A task is shown in its day column even if overdue (coral styling) **and** in the Overdue list (same record, same `TaskCard`).
- Overdue list = all active tasks with `isOverdue`, any date, sorted by deadline ascending (oldest first).
- Week view: 7 days Mon–Sun of the selected week, grouping by `scheduledDate`. Month view: calendar grid with per-day counts; clicking a day opens a drawer with that day's list. No Add button in Week/Month.
- Yesterday column: tasks scheduled for yesterday (active and completed). No Add button there.

### 6.4 Sorting (within one day list and within Hub groups)
1. Completed tasks always last (ordered by `completedAt` ascending so the newest completion lands at the bottom).
2. Pinned first.
3. Priority: urgent, normal, optional.
4. `deadlineAt` ascending.
5. `createdAt` ascending as the final stable tie-breaker.
Implement as one pure `compareTasks` in `domain/task-sort.ts`, unit tested.

### 6.5 Reminder calculation (Due Soon)
```
T0 = moment the deadline is set (task creation, or deadline edit/transfer) = clock.now()
remaining = deadlineAt − T0
if remaining <= 0          → reminderAt = null (already overdue)
else if remaining >= 24h   → reminderAt = deadlineAt − 24h
else                       → reminderAt = deadlineAt − remaining/4      (12h left → notify at 3h left)
```
Recompute `reminderAt` whenever `deadlineAt` changes or the task is un-completed. Set to null when completed. Unit-test: 3 days, exactly 24h, 12h, 1h, 1 minute, past.

### 6.6 Transfer rule
Transferring an overdue task to Today / Tomorrow / a specific date requires a date and a time (default 23:59; if the target is today and 23:59 has not passed it is fine; the new deadline must be in the future). It sets **both** `scheduledDate` and `deadlineAt` and recomputes `reminderAt`. Reject a transfer whose new deadline is in the past with a field error.

### 6.7 Mutations and their side effects (all in `TaskService`, one transaction concept per action)
| Action | Effects |
| --- | --- |
| Create | Validate; reject past deadline; compute `reminderAt`; save |
| Update | Validate; if `deadlineAt` changed → recompute `reminderAt` and delete that task's stale `due_soon`/`overdue` notifications; editing a past deadline on an existing task is allowed |
| Complete | `status=completed`, `completedAt=now`, `reminderAt=null`; if the task had a `due_soon` or `overdue` notification → delete those and create one `completed` notification (dedupe-keyed) |
| Uncomplete | `status=active`, `completedAt=null`, recompute `reminderAt` (null if already overdue) |
| Schedule / Unschedule | Set / clear `scheduledDate` (does not change the deadline) |
| Transfer | See 6.6 |
| Delete | Hard delete the task and its notifications |

### 6.9 Notifications
```ts
type NotificationKind = 'due_soon' | 'overdue' | 'completed' | 'general' | 'system';
interface NotificationRecord {
  id: string; kind: NotificationKind;
  taskId: string | null;              // task kinds only
  dedupeKey: string;                  // UNIQUE, e.g. `task:${taskId}:due_soon:${deadlineAt}`
  payload: { title?: string; message?: string } | null;   // only for general/system
  createdAt: string; readAt: string | null;
}
```
- **No copies of task data.** For task kinds, the DTO is built at read time by joining the task: title, deadline, status, time-left come from the live task. Foreign key with `ON DELETE CASCADE`.
- **Creation (scheduler tick, `NotificationService.runReminderTick()`):**
  - Active tasks with `reminderAt <= now` and `deadlineAt > now` and no `due_soon` notification for `(taskId, deadlineAt)` → create `due_soon`.
  - Active tasks with `deadlineAt <= now` and no `overdue` notification for `(taskId, deadlineAt)` → create `overdue`.
  - The unique `dedupeKey` guarantees idempotence, which is also what makes **catch-up after downtime** safe. Catch-up must not create a `due_soon` for a task that is already overdue.
- **Retention:** delete notifications with `createdAt <= now − 7 days` (`purgeExpired()`), at startup and hourly. Real deletion from the DB.
- **Order:** newest first (`createdAt` desc).
- **DTO** includes: `id, kind, tag label, title, message, isRead, createdAt, daysAgoLabel (computed in UI from createdAt), timeLeftMs|null, taskId|null, targetUrl|null` (`/tasks/hub?task=<id>`).
- **Message wording** (English, sentence case): due soon — title "Due soon", message `"<task title>" is due <DD/MM HH:mm>.`; overdue — "Overdue", `"<task title>" was due <DD/MM HH:mm>.`; completed — "Nicely done", `"<task title>" is complete.`
- **Unread count** endpoint is part of the list response (`unreadCount`).

### 6.10 Scheduler (`src/server/scheduler.ts`)
- Start from `src/instrumentation.ts` (Next.js `register()` hook, Node runtime only). Guard against double start in dev with a `globalThis` flag.
- Every `SCHEDULER_TICK_SECONDS` (default 30): `runReminderTick()`. At start and hourly: `purgeExpired()`.
- **Fallback:** `GET /api/notifications` also runs `runReminderTick()` if the last tick was more than 15 seconds ago, so a missing scheduler never means missing reminders.
- Must catch and log its own errors and never crash the server.

---

## 7. API contract (JSON, route handlers in `src/app/api`)

All handlers: parse input with Zod from `contracts`, call a service, return a DTO; errors → `{ error: { code, message, fields? } }` with proper status (400 validation, 404 missing, 409 conflict, 500 unexpected). No business logic here.

| Method & path | Purpose |
| --- | --- |
| `GET /api/tasks?status=&scheduledFrom=&scheduledTo=&search=&priority=` | List tasks (DTOs with derived flags) |
| `POST /api/tasks` | Create |
| `GET /api/tasks/:id` | One task |
| `PATCH /api/tasks/:id` | Update fields (title, description, priority, pinned, deadlineAt, scheduledDate) |
| `POST /api/tasks/:id/complete` and `/uncomplete` | Complete / undo |
| `POST /api/tasks/:id/transfer` | Body `{ scheduledDate, deadlineAt }` |
| `DELETE /api/tasks/:id` | Delete |
| `GET /api/notifications` | `{ items, unreadCount }` (runs tick fallback) |
| `POST /api/notifications/:id/read` and `/unread` | Toggle read |
| `POST /api/notifications/read-all` | Mark all read |
| `GET /api/health` | `{ ok: true, storage: 'local' }` |

Client (`src/client`): `api-client.ts` (fetch wrapper + typed errors), `queries/tasks.ts`, `queries/notifications.ts` exporting hooks such as `useTasks(params)`, `useCreateTask()`, `useCompleteTask()`, `useTransferTask()`, `useNotifications()`. Mutations use optimistic updates with rollback and invalidate related queries so Daily, Hub, Overdue list and the bell always agree. Notifications poll every 30 s and on window focus; task queries refetch on window focus and every 60 s.

`src/client/preferences.ts` wraps `localStorage` (try/catch, SSR-safe) for UI-only preferences: `daily.view` (day|week|month), `featureCollection.layout` (horizontal|vertical). This is not domain data and is the only place allowed to touch `localStorage`.

---

## 8. UI architecture and design rules

Full visual detail is in `ui_readme.md`. This section is what you must not get wrong.

### 8.1 Tokens (`src/design/tokens.css`, exposed to Tailwind via `@theme`)
```css
:root {
  /* Cosmos (homepage, transition overlay) */
  --cosmos-bg-0:#05080D; --cosmos-bg-1:#071321; --cosmos-bg-2:#09182A;
  --cosmos-text:#F4EFFF; --cosmos-text-muted:#A5A5B8; --cosmos-lavender:#A78BFA;
  --cosmos-star-white:#FFFFFF; --cosmos-star-blue:#A9CFFF; --cosmos-star-pale:#CFE3FF; /* pale blue proposed */
  --cosmos-engine-glow:#A9CFFF; --cosmos-exhaust:#A99AEF;
  /* Workspace (all working pages, popover, task UI) */
  --ws-bg:#F0EFF8; --ws-surface:#FFFFFF; --ws-text:#29263B; --ws-text-muted:#777387;
  --ws-accent:#A99AEF; --ws-accent-soft:#DCD5F1; --ws-border:#E9E5F2;
  /* Status */
  --status-overdue:#D77F85; --status-completed:#9A8BCB; --status-due-soon:#D7A45D;
  --status-notif-completed:#8FB8A0;  /* soft sage, proposed; user may adjust */
  --status-system:#A5A5B8;
  /* Shape, layout, z-index, motion */
  --radius-card:16px; --radius-pill:999px; --radius-btn:12px;
  --z-bg:0; --z-content:10; --z-nav:30; --z-popover:40; --z-drawer:50; --z-transition:100;
  --motion-fast:150ms; --motion-base:300ms; --motion-reveal:700ms; --motion-ease:cubic-bezier(.22,.61,.36,1);
}
```
- Tints (coral overdue background, lavender hover) are made with `color-mix()` from the tokens above. **No new hex values in components.** If a colour is missing, add a token in `tokens.css` and tell the user.
- **Contrast:** `--ws-accent` on white fails AA for text. Use it for fills, borders, icons, and large elements only. Body and metadata text use `--ws-text` / `--ws-text-muted`. Check ≥ 4.5:1 for normal text.

### 8.2 Typography and casing
- Fonts via `next/font` (self-hosted, `display: swap`, with metric-matched fallbacks to avoid layout shift): **Cormorant Garamond** (weights 300–600, italic for "Hiep Trong") for display, **Inter** for UI.
- Sentence case everywhere. Uppercase only: the "SPACE" wordmark and small category tags. No monospace.
- No emoji as icons. One icon library (`lucide-react`) plus the custom star SVG.

### 8.3 Motion
- Allowed: blur-fade slide-in on enter (12 px, 4 px blur, 700 ms), opacity crossfades, hover opacity/colour shifts, gentle card lift (≤ 2 px) in the workspace, layout animations for reordering tasks (200–300 ms).
- Forbidden: bounce/elastic, `transition: all`, universal `hover:scale`, spinning, shaking.
- Always honour `prefers-reduced-motion`: replace movement and blur with simple opacity or nothing; stop the starfield motion and render one static frame; disable the pinned horizontal gallery (see 9.9).
- Animate `transform` and `opacity` only; avoid layout-thrashing properties.

### 8.4 Shell and navigation outside the homepage
- `WorkspaceShell` (light lavender): slim top bar with the small wordmark "Hiep Trong ✦" (link to `/`), the page title, and the notification bell at the right. A "Universe menu" button (also `Ctrl+K`) opens a compact list of all 13 features from `registry.ts` for quick jumping. No other navigation chrome.
- The homepage has **no** navigation bar: only the bell and "Let's go" in the top-right.
- Internal navigation everywhere uses `TransitionLink` / `useTransitionRouter` so Cosmic Launch applies consistently (section 9.10).

### 8.5 Component inventory (build once, reuse)
`TaskCard`, `TaskForm` (used in a Drawer for add and edit), `TaskMenu` (three-dot), `PriorityBadge`, `DueSoonDot`, `FinishedCounter`, `OverdueList`, `DailyBoard`, `WeekView`, `MonthView`, `HubList`, `NotificationPopover`, `NotificationItem`, `BellButton`, `BlankPage`, `FeatureCard`, `FeatureCollection` (with `HorizontalGallery` and `VerticalGrid`), `Starfield`, `Wordmark`, `LetsGoButton`, `CosmicLaunch`, plus primitives in `src/ui`. Do not create a second task card or second form for the Hub.

### 8.6 Accessibility baseline
Semantic HTML (`header`, `main`, `nav`, `section`, `button` vs `a`), labelled icon buttons, `aria-live="polite"` region for toasts, focus trapped in Dialog/Drawer and returned on close, `role="tablist"` for tabs, `aria-pressed`/`aria-checked` on toggles, visible `:focus-visible` rings, all functions reachable by keyboard, Esc closes overlays.

---

## 9. Feature implementation specs

### 9.1 TaskCard (shared by Daily, Overdue list, Hub)
Layout per `ui_readme.md` "Task UI — Celestial Workspace".
- **Top row:** animated checkbox, title (strongest emphasis), three-dot menu.
- **Middle:** description (muted, multi-line, clamp to 2 lines when collapsed). Omit the row entirely if empty (no blank space).
- **Bottom:** priority badge (Urgent coral-tinted, Normal lavender-tinted, Optional outlined), pin icon if pinned, deadline `DD/MM HH:mm` (add the year only if it is not the current year), time-left text, amber dot for due soon.
- **States:** normal; urgent; pinned; completed (light strikethrough, italic title, muted, lowered prominence); overdue (pale coral background or coral border + "Overdue" indicator with text, not colour alone); due soon (small amber indicator). A task can be urgent + pinned + overdue at once; styles must compose.
- **Menu items (context-aware):** Edit; Add to Today / Tomorrow / Pick date… (Hub only, or when unscheduled); Remove from today (when scheduled); Transfer… (overdue only); Delete (confirmation dialog).
- **Expand/collapse:** click on the card body toggles; checkbox and menu clicks never toggle it. Expanded shows full description and (in Hub) the schedule action row.
- **Hover:** shadow/border-colour shift and ≤ 2 px lift. **Entry:** a new card animates in and glows softly (≈ 1.2 s) at its sorted position, and the list scrolls it into view if needed. **Exit:** fade and collapse. **Reorder:** use `motion` layout animations (`layout`, `AnimatePresence`) so completion movement to the bottom is smooth.
- Time-left labels (`3h 20m left`, `Overdue by 2h`, `Due tomorrow`) update every minute with a single shared timer (one interval for the whole page, not one per card).

### 9.2 TaskForm (add and edit; one component)
Fields: Title (required, counter at 100+), Deadline date (`DD/MM` text input + calendar picker; shows resolved full date beneath), Deadline time (`HH:mm`, 24h, validated), Priority (segmented: Urgent / Normal / Optional, default Normal), Description (textarea, 2000 max), Pinned (toggle). Opens in a right-side Drawer (bottom sheet on mobile). Buttons: Save (primary, `Enter` on single-line fields submits) and Cancel (`Esc`). Date parsing rule: `DD/MM` without year → the nearest occurrence on or after today; a picker allows other years. Creation rejects a past deadline (inline message). Prefill from context (see 6.3). Disable Save while submitting; show the server's field errors.

### 9.3 Daily Task Management page (`/tasks/daily`)
- Header: title, SegmentedControl **Day | Week | Month** (persisted via `preferences`), date navigation for Week/Month, a Statistics button that opens an empty placeholder panel ("Statistics will live here.").
- **Day view:** three columns Yesterday | Today | Tomorrow (desktop ≥ 1024 px; tabs below). Column header: weekday and `DD/MM`, finished counter box ("N done"), Add task button on Today and Tomorrow only. Today is visually emphasised (accent border or soft tint), Yesterday slightly muted.
- Overdue list below (all views): heading with a count, empty state "Nothing overdue.", each item a `TaskCard` with a **Transfer** button (popover: Today / Tomorrow / pick date + time) and **Delete**.
- Empty column state: one calm line (for example "No tasks for today.").

### 9.4 Tasks Hub page (`/tasks/hub`)
- Groups: Overdue, Due soon, Later (active only). Search box, priority filter, sort by deadline (default). "Show completed" toggle lists completed tasks in a separate muted group.
- Add task button opens the same `TaskForm` with no scheduled date.
- Query `?task=<id>` scrolls to the card, expands it and highlights it for about 2 seconds (used by notification clicks). Same-path navigation must not trigger Cosmic Launch.
- Expanded card shows Add to Today / Tomorrow / Pick date… and Remove from daily.

### 9.5 Homepage (`/`)
- Sections: Hero (full viewport height), Feature Collection (`id="features"`), quiet footer (small wordmark, copyright).
- **Hero:** wordmark composition (9.6), one short statement, optional one-line tagline, nothing else. Entrance: wordmark fades in, supporting text 200–300 ms later, star fades in last. No other animation beyond the starfield.
- **Top-right controls** (fixed, `z-nav`): `BellButton` then `LetsGoButton`. No other nav.
- **Starfield:** see 9.7.
- Atmospheric blue ambient: one or two very low-opacity CSS radial gradients behind the canvas.
- Text sits above the canvas (`z-content`); the canvas is `pointer-events: none`.

### 9.6 Wordmark
- "Hiep Trong" as a signature: Cormorant Garamond italic, small relative to SPACE, soft white, slightly offset/overlapping the top-left of SPACE.
- "SPACE": uppercase Cormorant Garamond (try weight 300–400), `clamp()` size (≈ 4rem → 11rem), wide letter spacing (≈ 0.18–0.3em, reduced on mobile), soft white.
- A tiny four-point star (inline SVG, `--cosmos-lavender`) above the wordmark or acting as a separator. Max one or two stars total.
- Fluid sizing with `clamp()`; must never overflow at 320 px width; hierarchy between the two lines is preserved on mobile (stack, tighten tracking, keep star placement).
- Wordmark is real text (selectable, accessible name "Hiep Trong Space"), not an image.

### 9.7 Starfield engine (`src/features/home/starfield/`)
A framework-free class `StarfieldEngine` (no React inside) plus a thin `<Starfield/>` React wrapper. The same engine is reused by the Cosmic Launch overlay.
- **Canvas 2D**, one `requestAnimationFrame` loop, delta-time based, DPR capped at 2, resize-aware (ResizeObserver), no React state updates per frame, no per-frame object allocation. Preallocate typed arrays (`Float32Array`) for `x, y, z, size, brightness, colourIndex, speed`.
- **3D perspective:** stars live in a volume (`x, y ∈ [-w,w]`, `z ∈ [near, far]`); projection `sx = cx + x/z * focal`, `sy = cy + y/z * focal`. Stars move toward the viewer (`z -= speed * dt`); when `z < near` or the projection leaves the screen, **recycle** the same slot to a far depth with new random x, y, brightness (no resets visible).
- **Count:** desktop ≈ 2500 stars, tablet ≈ 1500, mobile ≈ 800; scale further by `hardwareConcurrency` and viewport area; expose `quality` (low/medium/high) for later tuning.
- **Appearance:** most stars tiny (≤ 1 px) white; some pale blue (`--cosmos-star-blue`, `--cosmos-star-pale`); ~1–2% brighter; size and alpha grow as z decreases. Three depth layers (distant, mid, near) get different speed and brightness. Near stars (and ~2–3% of mid stars) draw short trails from previous projected position. Gentle twinkle: small sine alpha variation, not a repeating blink.
- **Movement:** slow, continuous forward drift (atmospheric, not hyperspace). Engine exposes `setSpeedMultiplier(n)` and `setTrailStrength(n)`, which Cosmic Launch uses to accelerate (never exceeds a modest limit).
- **Mouse:** optional parallax shifts the projection centre by at most ~12 px, smoothed; disabled on touch / coarse pointers.
- **Colours:** read from CSS variables once at init (not hard-coded).
- **Lifecycle:** pause when `document.hidden`; `destroy()` cancels the loop and observers (call it on unmount and in React Strict Mode double-mount safely). Respect `prefers-reduced-motion`: render a single static frame and do not start the loop.
- **Performance budget:** stays smooth (target 60 fps) on a mid laptop; if frame time stays high, step down quality automatically.

### 9.8 "Let's go" button
- Fixed top-right pill, transparent or faintly translucent, thin border, `--cosmos-text`. Default label "Let's go". On hover **and** `:focus-visible`, the label slides/fades out while a right arrow fades in with a short left-to-right translate (coordinated opacity + `translateX`), the button dimensions never change (stack both in the same grid cell). On touch the label stays visible (no hover dependence) and the arrow may appear on `:active`.
- Click: `document.getElementById('features')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })`. Add `scroll-margin-top` on the section. It is a `<button>` (not a route link), so it does **not** trigger Cosmic Launch. Do not change the URL hash or reload the page.
- Touch target ≥ 44×44 px. It must not overlap the bell or content on small screens (the two controls sit side by side with a gap; if space is tight, shrink padding, not the target).

### 9.9 Feature Collection
- **Data:** only `src/features/registry.ts` (id, slug, title, label, href, thumbnail). The 13 entries, in order: Daily Task Management, Tasks Hub, Events, AI Engineering, Blogs Hub, APCS Hub, Flashcards, Entertainment Hub, Tracking, In Progress Projects, Annual Milestones, Learning Room, Personal Achievements. Both layouts map over the same array.
- **Card (`FeatureCard`):** entire card is one `TransitionLink`. Landscape thumbnail (aspect ≈ 16:10, 16 px radius), small category label below, large title (Cormorant Garamond), subtle arrow that appears/shifts on hover/focus, restrained hover (image slight brightness/scale ≤ 1.02 allowed here, arrow nudge), visible focus ring. Thumbnails are generated SVG/CSS compositions in the palette (abstract constellations, orbit lines, gradients), unique per feature, no stock photos, no cartoon planets.
- **Toggle:** a segmented pill "Horizontal | Vertical" in the section header (`role="radiogroup"` or tablist semantics), keyboard accessible, persisted via `preferences`.
- **Horizontal mode (desktop ≥ 1024 px, fine pointer, no reduced motion):**
  - Structure: `<section style={{height: outerHeight}}>` → `<div class="sticky top-0 h-screen overflow-hidden">` → `<div class="flex" style={{transform: translateX}}>` track.
  - `travel = trackWidth − viewportWidth` (measured with ResizeObserver; recompute on resize and font load). `outerHeight = travel + viewportHeight`. Progress = scroll offset within the section / `travel`, clamped 0–1; `translateX = −progress * travel`. Use `motion`'s `useScroll` + `useTransform` (no React state per scroll tick) or a rAF-throttled handler writing `style.transform` directly.
  - Two cards visible at once (each ≈ 48% of the content width, with the gap); first and last cards must align fully at 0 and 1. No snapping, no scroll hijacking (never `preventDefault` on wheel), fully reversible.
  - The section header (title + toggle) is part of the pinned view so the toggle stays reachable. Releases naturally into the next section.
- **Fallback (< 1024 px, coarse pointer, or reduced motion):** Horizontal mode renders a native, touch-friendly horizontal gallery using CSS `scroll-snap-type: x proximity` with `overflow-x: auto` **inside the section** (one card per view on phones, two on tablets), with visible scroll affordance. The page itself never scrolls horizontally.
- **Vertical mode:** ordinary CSS grid, 2 equal columns ≥ 768 px, 1 column below, equal gaps, cards fill the content width, section height = content height. **No** sticky, no transforms, no extra spacer, no scroll listeners.
- **Switching modes:** unmount the other mode's listeners/observers (cleanup in effects), avoid layout flash (render the correct mode on first paint from the persisted preference, with a stable default of "horizontal" on desktop), then call `section.scrollIntoView({ block: 'start' })` (instant) so the user stays at the collection and is never stuck in an empty spacer.
- **Overflow:** `overflow-x: clip` on the page wrapper only where needed; never use `100vw` for widths.

### 9.10 Cosmic Launch page transition (`src/features/transitions/`)
- **Pieces:** `TransitionProvider` (mounted in root layout; owns state and the overlay), `TransitionLink` (wraps `next/link`), `useTransitionRouter()` (wraps `router.push/replace` for programmatic navigation). Application code never calls `next/navigation`'s router directly for internal page changes.
- **When it plays:** only when the destination **pathname differs** from the current one, the link is internal, same-tab, not modified (no Ctrl/Cmd/Shift/middle-click), and no transition is already running (ignore repeated clicks). **Not** for: buttons that do not navigate, external links, hash/anchor scrolling, query-only changes on the same path, notification popover interactions.
- **Back/forward:** browser history navigation shows a short plain fade (≤ 300 ms), not the 3-second sequence, so it always works and feels instant. Preserve the destination URL exactly.
- **Timeline (target ≈ 3 s):**
  - 0–500 ms Departure: page content fades out; overlay (`--cosmos-bg-0`) fades in with the starfield; spacecraft appears bottom-left, small.
  - 500–1300 ms Ignition: engine glow rises (`--cosmos-engine-glow`), star speed multiplier ramps up, soft short exhaust with `--cosmos-exhaust` highlights.
  - 1300–2300 ms Acceleration: spacecraft moves diagonally bottom-left → top-right with ease-in, exhaust trail lengthens, restrained star streaks.
  - 2300–3000 ms Arrival: spacecraft vanishes into the distance, overlay fades out revealing the destination.
- **Spacecraft:** small inline SVG, minimal geometric silhouette in soft white/silver, never orange flames, never cartoonish; animate with CSS transforms/opacity (composited). Starfield behind it is a `StarfieldEngine` instance (reused code), not a second implementation.
- **Readiness coordination (critical):**
  1. On click: lock scroll (`overflow: hidden` on `<html>`), set `aria-busy`, mount overlay (`z-transition`), start the timeline, and call `router.push(href)` immediately inside `React.startTransition`.
  2. Destination is **ready** when `usePathname()` equals the target **and** that page has signalled readiness: pages render `<PageReady />` (or call `usePageReady()`) after their first required data has loaded; Blank Pages signal immediately on mount.
  3. Phase 4 starts at the later of `t = 2300 ms` and "ready". If ready early, nothing is skipped or artificially extended. If not ready by 2300 ms, hold the last frame with a subtle idle glow (no spinner, no text) until ready.
  4. Safety: if not ready after 10 s, reveal the destination anyway (pages render their own skeleton/error states, so it is never blank) and log a warning. If navigation errors, hide the overlay and show an error toast; the user stays on the current page.
  5. On finish: unlock scroll, remove overlay, restore focus to the destination's `main` heading, release the "running" lock.
- **Reduced motion:** replace the sequence with a ≤ 300 ms opacity crossfade; no spacecraft, no streaks.
- **Failure fallback:** if the overlay throws, plain navigation proceeds.
- **Cleanup:** cancel timers/RAF and destroy the engine when the transition ends or the provider unmounts.

### 9.11 Notification center
- `BellButton` (lucide `Bell`), unread red dot + optional count badge (cap "9+"), soft hover illumination. Located top-right on the homepage (left of "Let's go") and in `WorkspaceShell`'s top-right.
- `NotificationPopover`: anchored floating panel (light surface, 16 px radius, subtle border and shadow), width ≈ 380 px (full width minus 16 px margins on phones), max-height ≈ 70vh with internal scroll, kept inside the viewport (flip/shift positioning). Header: "Notifications", "N unread", "Mark all as read". List newest first. Empty state: "All caught up." / "Your universe is running smoothly."
- `NotificationItem`: title, message, tag (colour per kind: Due Soon amber, Overdue coral, Completed sage, General lavender, System gray), a read checkbox (checked = no red dot), "N days ago" (or "Just now", "N hours ago") in the bottom-right corner, time-left text when applicable. Clicking the item body navigates to `targetUrl` for task kinds (via `TransitionLink`, so it plays Cosmic Launch when the path changes) and marks it read; clicking the checkbox only toggles read.
- **Interaction:** click bell toggles; outside click and Esc close; clicks inside never close it; focus moves into the popover on open and returns to the bell on close; `aria-expanded`, `aria-controls`, `role="dialog"` with label.
- **Animation:** open 200–250 ms (fade + slight downward + scale ≈ .98→1), close 150–200 ms. **No** Cosmic Launch for open/close.
- Data from `useNotifications()` (polls every 30 s). Optimistic read toggles.

### 9.12 Blank Pages
`BlankPage({ title })` inside `WorkspaceShell`: page title, small star accent, "This space is waiting to be built.", a "Back to home" `TransitionLink`. Nothing else. Do not add models, forms, fake data or content. Each of the 11 routes renders `BlankPage` with its title from `registry.ts`.

### 9.13 Unwritten-but-expected behaviours (apply automatically)
Empty states, skeleton loaders (never a blank flash), toasts for errors/success, confirm-before-delete, optimistic updates with rollback, focus management in overlays, remembered view preferences, a single minute-timer for relative times, `Esc`/`Enter` keyboard behaviour, no horizontal page overflow at any width, friendly error boundaries per page (`error.tsx`) and `not-found.tsx` styled like the app, correct page `<title>`s, favicon using the star mark.

---

## 10. Epics

Rule: complete one epic, run all checks, update `progress.md`, commit, report, **stop**. Each epic has its own branch `epic/<n>-<slug>`.

### Epic 0 — Foundation and storage layer
**Scope:** scaffold Next.js (TypeScript, App Router, Tailwind, ESLint, `src/` dir, alias `@/*`) in the project root without disturbing `md/` or `sources.txt` (if the scaffold tool refuses the non-empty folder, scaffold in a temp subfolder and move files; never delete `md/`); `.gitignore` (must ignore `.env`, `data/`, `backups/`, `.next/`, `node_modules/`), `.gitattributes`, `.env.example`, Prettier, Vitest; folder skeleton from 5.2; ESLint boundary rules; `contracts`, `domain` (clock, time helpers), `server/config.ts`; `StorageAdapter` interfaces, local SQLite implementation with Drizzle schema + migration for `tasks` and `notifications`, `drive` stub; `AGENTS.md`; `md/progress.md`; `GET /api/health`.
**Out of scope:** any UI beyond the default page.
**Done when:** `npm run dev` serves the app; `/api/health` returns ok; migration creates the DB under `data/`; repository tests pass against a temp DB; lint boundaries fail on a deliberate violation (verify, then remove it); `.env` and `data/` are ignored by git.

### Epic 1 — Design tokens, app shell, route stubs
**Scope:** `tokens.css`, fonts via `next/font`, Tailwind theme mapping, `ui` primitives needed later (Button, IconButton, Badge, Chip, Dialog, Drawer, Popover, Toast, SegmentedControl, Skeleton, Checkbox, StarIcon), `WorkspaceShell` (with bell placeholder), `registry.ts` with 13 features, `BlankPage`, all 13 routes (Daily and Hub routes temporarily use `BlankPage`), `error.tsx`, `not-found.tsx`, Universe menu (`Ctrl+K`), `TransitionLink` as a plain `next/link` wrapper (Epic 7 adds the animation).
**Done when:** every route opens and looks consistent; no hard-coded colours (grep check); tab order and focus rings work; layout is clean at 360, 768, 1280 px.

### Epic 2 — Daily Task Management
**Scope:** domain rules (`task-status`, `task-sort`, `reminder`, transfer validation) with unit tests; `TaskService`; task API routes; client hooks; `TaskCard`, `TaskForm`, `TaskMenu`, `DailyBoard` (Day/Week/Month), `OverdueList`, finished counters, Statistics placeholder; animations; validation; confirmations.
**Done when:** all Daily acceptance criteria in `human_readme.md` pass; unit tests cover overdue, sorting, reminder maths, transfer, validation; a manual script (in `progress.md`) is documented: create tasks for yesterday/today/tomorrow, complete, transfer, delete, reload.

### Epic 3 — Tasks Hub and sync
**Scope:** `HubList` (groups, search, priority filter, completed toggle), schedule actions, `?task=` highlight, shared `TaskCard`/`TaskForm` reuse (no duplicates), cross-view sync via query invalidation.
**Done when:** all Hub acceptance criteria pass; completing/deleting in either view reflects in the other without reload; no duplicated task components exist.

### Epic 4 — Notification Center
**Scope:** `NotificationService`, repository usage, scheduler + tick fallback + purge, API routes, client hooks, `BellButton`, `NotificationPopover`, `NotificationItem`, stale-notification rules from 6.7, mounting the bell in `WorkspaceShell`.
**Done when:** a task due in 2 minutes yields exactly one Due Soon (at the right moment) and one Overdue notification; restart-with-missed-reminders catches up without duplicates; 7-day purge verified with a fake-clock test; accessibility checks pass.

### Epic 5 — Homepage
**Scope:** `StarfieldEngine` + `<Starfield/>`, ambient gradient, `Wordmark`, statement, hero entrance, `LetsGoButton` with smooth scroll to `#features` (temporary placeholder section until Epic 6), bell mounted top-right, quiet footer, reduced-motion static frame, visibility pause, mobile adaption.
**Done when:** the 10 questions in `ui_readme.md` §10 (Homepage Final Quality Standard) are answered "yes" and noted in `progress.md`; 60 fps desktop; no overflow at 320 px; works with animations disabled.

### Epic 6 — Feature Collection
**Scope:** `FeatureCard`, thumbnails, `FeatureCollection`, `HorizontalGallery` (pinned, scroll-linked), `VerticalGrid`, toggle with persistence, fallbacks, resize handling, mode-switch cleanup.
**Done when:** every acceptance checkbox in `ui_readme.md` "Feature Collection §10" passes; verified at 1440, 1024, 768, 390 px.

### Epic 7 — Cosmic Launch
**Scope:** section 9.10 in full; integrate into every internal link and programmatic navigation; `PageReady` signalling on all pages.
**Done when:** the timeline plays correctly; double-clicks ignored; back/forward fine; slow-page test (artificial delay) holds the overlay without revealing an incomplete page; reduced-motion crossfade works; notification popover and same-page anchors never trigger it.

### Epic 8 — Hardening and polish
**Scope:** accessibility audit, contrast, responsive pass, performance pass (bundle, canvas, re-renders), error boundaries, empty/loading states, README at project root (how to run), backup instructions, cleanup of progress "Ideas".
**Done when:** checklist in section 15 is fully green.

### Epic 9 — Statistics (BLOCKED)
Do not start until the user supplies the feature description.

---

## 11. Testing strategy
- **Unit (must):** everything in `domain` (status, sort, reminder, time parsing `DD/MM`, transfer rules) using a fake `Clock`. Table-driven tests; include boundaries (exactly 24h, midnight, timezone, leap day, year rollover).
- **Service (must):** `TaskService` and `NotificationService` against a temp SQLite adapter: create/update/complete/uncomplete/transfer/delete side effects, dedupe, catch-up, purge, cascade deletion.
- **Repository contract tests:** a reusable suite run against the local adapter (re-runnable against future adapters).
- **Component (should):** `TaskForm` validation, `TaskCard` states, `NotificationPopover` open/close/read behaviour.
- **Manual checklists** per epic are in `progress.md` and `human_instructions.md`. No Playwright in v1 (ASK FIRST to add).
- Tests must be deterministic: no real time, no network, no shared DB file between tests.
- A bug fix starts with a failing test that reproduces it.

## 12. Commands (define these npm scripts in Epic 0; all Windows-safe)
| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the app at http://localhost:3000 |
| `npm run build` / `npm start` | Production build / run |
| `npm run lint` | ESLint (includes architecture boundaries) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest, single run |
| `npm run test:watch` | Vitest watch |
| `npm run format` | Prettier write |
| `npm run db:generate` / `npm run db:migrate` | drizzle-kit generate / apply migrations |
| `npm run check` | lint + typecheck + test (run before every commit) |

## 13. Git rules
- Branch per epic: `epic/0-foundation`, `epic/2-daily-tasks`, … created from `main` after the user merged the previous one.
- Commits: small and focused, Conventional style: `feat(tasks): …`, `fix(notifications): …`, `chore(deps): …`, `test(domain): …`, `docs: …`, `refactor: …`. Dependency installs are **separate** commits.
- Before committing: `npm run check` is green; `git status` shows no `.env`, `data/`, or secrets; `git diff --stat` contains only files within the epic's scope.
- Never push, force, rebase published history, or touch `main`. The user merges and tags (`epic-N-done`).
- If the repo is not initialised: ask the user to confirm, then `git init` is allowed (it is project-local) with an initial commit containing `md/` and config only.

## 14. Agent behaviour and reporting

### 14.1 Ask-or-decide
Decide yourself for details with a conventional answer (spacing, animation easing, copy wording, internal naming). Ask when: it changes behaviour the user described, costs a lot to redo, needs a new dependency/permission, or two documents conflict in a way not resolved above. Ask **one** short question with your recommended default.

### 14.2 Report format (end of each step/session; keep it short)
```
Epic <n> — <name>: <done | partial | blocked>
Did: <3–6 bullets>
Checked: lint ✔/✘, typecheck ✔/✘, tests <n> passed, manual: <what you tried>
Files: <count> changed — <key folders>
Deviations from spec: <none | list>
Needs from you: <none | question or action>
Next (not started): <proposal>
```
No long essays, no pasting entire files.

### 14.3 `md/progress.md` template (maintain it; keep under ~150 lines)
```
# Progress
## Current
Epic: <n> <name> | Branch: <name> | Status: <in progress/review/done>
## Done
- [x] Epic 0 … (date)
## Decisions made during build
- <short bullet + reason>
## Manual test script for current epic
1. … 2. …
## Known issues
- <issue> (file:line)
## Ideas (not doing now)
- <idea>
## Environment notes
- Node <ver>, npm <ver>, installed deps summary, Windows quirks
```

### 14.4 When something breaks
Reproduce → write a failing test (if logic) → fix the cause, not the symptom → run checks → note it in `progress.md`. After two failed attempts on the same problem, stop, summarise what you tried and what you think is wrong, and ask the user.

---

## 15. Definition of done (every epic) and final checklist
- [ ] Only the epic's scope was touched; no secrets; `.env`/`data/` untouched in git.
- [ ] `npm run check` is green; new logic has tests.
- [ ] Architecture rules hold: UI imports nothing from services/server/DB; routes contain no business logic; no file I/O outside `services/storage`.
- [ ] No hard-coded colours/fonts outside tokens; sentence case; one icon library.
- [ ] Keyboard-only use works; focus visible; labels present; reduced-motion respected.
- [ ] Responsive at 360 / 768 / 1280 / 1440 px with no horizontal page overflow.
- [ ] Empty, loading, and error states exist for every list/page.
- [ ] `progress.md` updated; commit(s) made on the epic branch; report delivered; stopped.

## 16. Windows and risk notes
- Install problems with `better-sqlite3`: see 4.2 (ask).
- Long path / spaces in the folder name ("Task Management"): quote paths in scripts; avoid shell-specific syntax.
- Next.js dev server with instrumentation can start twice in dev; guard with `globalThis` (6.10).
- Hot reload may recreate the SQLite connection: use a singleton on `globalThis` in `server/container.ts`.
- Antivirus or sync tools (OneDrive) can lock the SQLite file: keep the project outside OneDrive; if locking appears, tell the user.
- Port 3000 busy: use `npm run dev -- -p 3001` and tell the user.
