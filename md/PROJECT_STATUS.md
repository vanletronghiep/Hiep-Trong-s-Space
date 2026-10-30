# Project Status — Hiep Trong Space

**Last Updated:** 2026-10-31  
**Active Branch:** `epic/8-hardening`  
**Overall Status:** All buildable epics (**Epic 0 through Epic 8**) are **100% complete, verified, and passing all quality gates** (`npm run check` & `npm run build`).

---

## 1. Architecture Overview & Main Components

**Hiep Trong Space** is a local-first, single-owner personal universe web application built with **Next.js 15 (App Router)**, **React 19**, **TypeScript 5 (strict mode)**, **Tailwind CSS v4**, **TanStack Query v5**, **Drizzle ORM**, and **SQLite (`better-sqlite3` in WAL mode)**.

### 1.1 Strict 7-Layer Dependency Hierarchy
Enforced at build and lint time via [`eslint.config.mjs`](../eslint.config.mjs) (`no-restricted-imports` and `no-restricted-properties`) and [`tests/design/craft-and-architecture-guardrails.test.ts`](../tests/design/craft-and-architecture-guardrails.test.ts):

```text
app (Next.js routes & API handlers)
 └─► features (UI feature modules: home, tasks, notifications, transitions, blank)
      ├─► client (TanStack Query hooks, typed API client, minute ticker, localStorage preferences)
      └─► ui (Reusable cosmic design-system primitives & WorkspaceShell)
           └─► design (CSS custom property tokens, variable fonts, motion curves)

app/api & server (Composition root, config, scheduler, API envelope helpers)
 └─► services (TaskService, NotificationService, StorageAdapter implementations)
      └─► domain (Pure business rules: clock, time, task-status, task-sort, reminder, date-input, notification-rules)
           └─► contracts (Zod schemas, DTO types, API envelopes)
```

- **Zero layer leaks:** UI and feature components never import Drizzle, SQLite, or `node:fs`. Domain modules are 100% pure functions accepting an explicit `Clock` and `tz` with zero I/O or global `new Date()` calls.
- **Single environment reader:** Only [`src/server/config.ts`](../src/server/config.ts) reads `process.env` (plus Next.js's static `process.env.NEXT_RUNTIME === 'nodejs'` check in [`src/instrumentation.ts`](../src/instrumentation.ts)).
- **Single `localStorage` reader:** Only [`src/client/preferences.ts`](../src/client/preferences.ts) reads/writes browser `localStorage`.
- **Single navigation wrapper:** All internal navigation passes through [`src/features/transitions/TransitionLink.tsx`](../src/features/transitions/TransitionLink.tsx) and `useTransitionRouter()` from [`src/features/transitions/TransitionProvider.tsx`](../src/features/transitions/TransitionProvider.tsx).

### 1.2 Main Components & Subsystems Created
1. **Cosmic Observational Design System (`src/design/`, `src/ui/`):**
   - Deep-void dark palette (`#05060B` → `#0A0D18` → `#101526`), semantic status tokens with WCAG AA contrast, self-hosted Google Variable Fonts (*Cormorant Garamond* display serif + *Inter* UI sans), and cubic-bezier motion curves.
   - 16 UI modules (`Button`, `IconButton`, `Badge`, `Chip`, `Checkbox`, `Dialog`, `Drawer`, `Popover`, `Toast`, `SegmentedControl`, `Skeleton`, `EmptyState`, `StarIcon`, `UniverseMenu`, `WorkspaceShell`, plus `cn` and `use-focus-trap`).
2. **Homepage & 3D Starfield Engine (`src/features/home/`):**
   - Framework-free 2D `<canvas>` 3D-perspective starfield (`StarfieldEngine`) with 3 depth layers, cursor repulsion, click-to-spark bursts, occasional shooting stars, visibility pause when backgrounded, and static rendering under `prefers-reduced-motion`.
   - Editorial `Hero` (`Wordmark`, subtitle, `"Let's go"` pill button), cosmos notification bell, and `FeatureCollection` offering both a **scroll-linked pinned Horizontal Gallery** and a **2-column Vertical Grid** for all 13 features, each with a custom geometric SVG `FeatureThumbnail`.
3. **Cosmic Launch Page Transition (`src/features/transitions/`):**
   - 4-phase (~3.0s) spacecraft warp-speed transition (`Charge & Lift` → `Warp Engage` → `Hyperspace Cruise` → `Arrival & Decelerate`) coordinated with destination `<PageReady />`, double-click lock, 10s failsafe timeout, focus restoration, and a `<= 300ms` crossfade fallback for reduced motion or browser Back/Forward (`popstate`).
4. **Daily Task Management & Tasks Hub (`src/features/tasks/`):**
   - **Daily Task Management (`/tasks/daily`):** Yesterday / Today / Tomorrow columns (responsive tabs below `1024px`), Week view (`WeekView`), Month calendar view (`MonthView`) with day drawer, collapsible `OverdueList`, single-click completion with strikethrough + fade, inline `TaskForm` with natural-language dates (`today`, `tomorrow`, `in 3 days`, `+2w`) and reminders (`20m`, `1h`), `TransferDialog` (Move to tomorrow / Pick date / Move to Tasks Hub), `FinishedCounter`, and Statistics placeholder drawer.
   - **Tasks Hub (`/tasks/hub`):** Master backlog grouped into **Overdue**, **Due soon** (within 24h), and **Later** urgency buckets, search input, priority filter, deadline/priority sort toggle, `Show completed` toggle, one-click `"Schedule for today"` / `"Schedule for date…"`, and `?task=<id>` deep-link scroll + 2s glow highlight — sharing one SQLite `tasks` table, one `TaskCard`, and one `TaskForm` with Daily Task Management.
5. **Notification Center & Background Scheduler (`src/features/notifications/`, `src/server/scheduler.ts`):**
   - `BellButton` with live unread badge (`99+` cap) on both `/` and `WorkspaceShell`, `NotificationPopover`, and `NotificationItem` with per-item read/unread checkbox (`stopPropagation` so checking read never navigates) and `"Mark all read"`.
   - Server-side idempotent 30s scheduler started via [`src/instrumentation.ts`](../src/instrumentation.ts) (plus 15s API fallback tick and 7-day automatic purge) generating `due_soon` and `overdue` notifications without duplicates (enforced by unique `(task_id, type)` SQLite index).
6. **Storage Abstraction & SQLite Persistence (`src/services/storage/`):**
   - `StorageAdapter` interface (`storage-adapter.ts`) with full `LocalStorageAdapter` implementation (`local-task-repository.ts`, `local-notification-repository.ts`, `local-media-storage.ts`, `schema.ts` in WAL mode with `foreign_keys = ON`) and `DriveStorageAdapter` stub returning `DRIVE_NOT_CONFIGURED` until a future epic.

---

## 2. Key Files Added or Modified

### Root & Configuration
| File | Purpose |
| :--- | :--- |
| [`package.json`](../package.json) | Scripts (`dev`, `build`, `start`, `lint`, `typecheck`, `test`, `check`, `db:generate`, `db:migrate`, `format`) and agreed dependencies. |
| [`next.config.ts`](../next.config.ts) | Configures `serverExternalPackages: ['better-sqlite3']` for native SQLite addon compatibility. |
| [`eslint.config.mjs`](../eslint.config.mjs) | Enforces the 7-layer dependency hierarchy, bans `console.log`, `@typescript-eslint/no-explicit-any`, and unauthorized `process.env` access. |
| [`drizzle.config.ts`](../drizzle.config.ts) | Drizzle Kit configuration pointing to `src/services/storage/local/schema.ts` and `./data/hiep-trong-space.db`. |
| [`vitest.config.ts`](../vitest.config.ts) | Vitest test runner configuration with `jsdom` and `@/` path alias. |
| [`.env.example`](../.env.example) | Documented environment variable template (`APP_TIMEZONE`, `STORAGE_DRIVER`, `DATA_DIR`, `DATABASE_FILE`, `MEDIA_DIR`, `SCHEDULER_TICK_SECONDS`). |
| [`README.md`](../README.md) | Root project overview, architecture summary, and setup instructions. |

### Documentation (`/md`)
| File | Purpose |
| :--- | :--- |
| [`md/PROJECT_STATUS.md`](./PROJECT_STATUS.md) | This comprehensive architectural and implementation status report. |
| [`md/how_to_run.md`](./how_to_run.md) | Step-by-step PowerShell guide to run, build, test, and back up the project. |
| [`md/progress.md`](./progress.md) | Epic-by-epic log of completed milestones, verification results, and commit hashes. |
| [`md/agent_readme.md`](./agent_readme.md) | Protected technical and architectural specification (read-only authority). |
| [`md/human_readme.md`](./human_readme.md) | Protected human-friendly product & architecture handbook (read-only). |
| [`md/ui_readme.md`](./ui_readme.md) | Protected visual, typography, motion, and component craft specification (read-only). |
| [`md/human_instructions.md`](./human_instructions.md) | Protected operator prompt playbook (read-only). |

### Layer 1 — Contracts (`src/contracts/`)
| File | Purpose |
| :--- | :--- |
| [`src/contracts/api.ts`](../src/contracts/api.ts) | Canonical `ErrorCode` union, `ApiError`, and `ApiResponse<T>` (`{ ok: true, data }` / `{ ok: false, error }`) schemas. |
| [`src/contracts/task.ts`](../src/contracts/task.ts) | Zod schemas & DTO types for `TaskRecord`, `TaskView`, `TaskPriority`, `TaskOrigin`, `TaskEffectiveStatus`, `CreateTaskInput`, `UpdateTaskInput`, `TransferTaskInput`, and `TaskListQuery`. |
| [`src/contracts/notification.ts`](../src/contracts/notification.ts) | Zod schemas & types for `NotificationRecord`, `NotificationView`, `NotificationType`, and `NotificationListResponse`. |
| [`src/contracts/index.ts`](../src/contracts/index.ts) | Barrel export for all contracts. |

### Layer 2 — Pure Domain Logic (`src/domain/`)
| File | Purpose |
| :--- | :--- |
| [`src/domain/clock.ts`](../src/domain/clock.ts) | Injectable `Clock` interface (`systemClock`, `fixedClock`) for deterministic time testing. |
| [`src/domain/time.ts`](../src/domain/time.ts) | Timezone-aware (`Asia/Saigon` default) date/time formatting, local day boundaries, week/month ranges, and ISO helpers. |
| [`src/domain/task-status.ts`](../src/domain/task-status.ts) | Pure derivation of `TaskEffectiveStatus` (`completed` / `overdue` / `pending`), `isTaskDueSoon` (within 24h), and `toTaskView`. |
| [`src/domain/task-sort.ts`](../src/domain/task-sort.ts) | Deterministic comparators (`priority` High→Medium→Low, `dueAt` earliest first with nulls last, `createdAt` tiebreaker) and Hub urgency grouping (`overdue` / `dueSoon` / `later`). |
| [`src/domain/reminder.ts`](../src/domain/reminder.ts) | Computes reminder `remindAt` timestamps (`due_soon` 24h before deadline or custom offset). |
| [`src/domain/date-input.ts`](../src/domain/date-input.ts) | Parses date/time form inputs into validated local dates (`YYYY-MM-DD`) and UTC ISO instants. |
| [`src/domain/notification-rules.ts`](../src/domain/notification-rules.ts) | Pure evaluation of which tasks require `due_soon` or `overdue` notifications and 7-day purge cutoffs. |

### Layer 3 — Services & Storage (`src/services/`)
| File | Purpose |
| :--- | :--- |
| [`src/services/errors.ts`](../src/services/errors.ts) | Typed `AppError` class with HTTP status and `ErrorCode` mapping. |
| [`src/services/storage/storage-adapter.ts`](../src/services/storage/storage-adapter.ts) | `StorageAdapter`, `TaskRepository`, `NotificationRepository`, and `MediaStorage` interfaces. |
| [`src/services/storage/local/schema.ts`](../src/services/storage/local/schema.ts) | Drizzle SQLite schema for `tasks`, `notifications`, and `app_meta` tables with indexes and unique `(task_id, type)` constraint. |
| [`src/services/storage/local/local-task-repository.ts`](../src/services/storage/local/local-task-repository.ts) | SQLite repository for task CRUD, filtering, completion, and transfer operations. |
| [`src/services/storage/local/local-notification-repository.ts`](../src/services/storage/local/local-notification-repository.ts) | SQLite repository for notification listing with live task joins, idempotent upserts, read-state updates, and 7-day purge. |
| [`src/services/storage/local/local-media-storage.ts`](../src/services/storage/local/local-media-storage.ts) | Local filesystem media storage under `DATA_DIR/media`. |
| [`src/services/storage/local/local-storage-adapter.ts`](../src/services/storage/local/local-storage-adapter.ts) | Full SQLite implementation of `StorageAdapter` (`PRAGMA journal_mode = WAL`, `PRAGMA foreign_keys = ON`, automatic table initialization). |
| [`src/services/storage/drive/drive-storage-adapter.ts`](../src/services/storage/drive/drive-storage-adapter.ts) | Clean stub returning `DRIVE_NOT_CONFIGURED` for future Google Drive sync. |
| [`src/services/storage/factory.ts`](../src/services/storage/factory.ts) | Instantiates the active `StorageAdapter` based on `STORAGE_DRIVER`. |
| [`src/services/task-service.ts`](../src/services/task-service.ts) | `TaskService` orchestrating validation, creation, updates, complete/uncomplete, transfer, and deletes. |
| [`src/services/notification-service.ts`](../src/services/notification-service.ts) | `NotificationService` handling notification listing, read/unread toggling, mark-all-read, and `evaluateAndGenerate()`. |

### Layer 4 — Server Composition Root (`src/server/` & `src/instrumentation.ts`)
| File | Purpose |
| :--- | :--- |
| [`src/server/config.ts`](../src/server/config.ts) | Zod-validated environment configuration loader (`getAppConfig()`). |
| [`src/server/container.ts`](../src/server/container.ts) | Singleton server dependency container wiring `StorageAdapter`, `TaskService`, and `NotificationService`. |
| [`src/server/api-response.ts`](../src/server/api-response.ts) | Standardized `{ ok: true, data }` / `{ ok: false, error }` JSON response helpers. |
| [`src/server/logger.ts`](../src/server/logger.ts) | Structured server logger. |
| [`src/server/scheduler.ts`](../src/server/scheduler.ts) | Singleton 30-second background interval ticking `notificationService.evaluateAndGenerate()`. |
| [`src/instrumentation.ts`](../src/instrumentation.ts) | Next.js server startup hook launching the background scheduler in the Node.js runtime. |

### Layer 5 — Design System & UI Primitives (`src/design/`, `src/ui/`)
| File | Purpose |
| :--- | :--- |
| [`src/design/tokens.css`](../src/design/tokens.css) | Complete CSS custom property token sheet (colors, fluid typography, spacing, radii, shadows, z-index, motion). |
| [`src/design/fonts.ts`](../src/design/fonts.ts) | Self-hosted Google Variable Fonts (`Cormorant_Garamond` & `Inter`). |
| [`src/design/motion.ts`](../src/design/motion.ts) | Shared animation duration and easing constants plus reduced-motion detection hook. |
| [`src/ui/*.tsx`](../src/ui/) | `Button`, `IconButton`, `Badge`, `Chip`, `Checkbox`, `Dialog`, `Drawer`, `Popover`, `Toast`, `SegmentedControl`, `Skeleton`, `EmptyState`, `StarIcon`, `UniverseMenu`, `WorkspaceShell`, `cn.ts`, and `use-focus-trap.ts`. |

### Layer 6 — Client State & Feature Modules (`src/client/`, `src/features/`)
| File | Purpose |
| :--- | :--- |
| [`src/client/api-client.ts`](../src/client/api-client.ts) | Typed `fetch` wrapper parsing `{ ok, data, error }` envelopes. |
| [`src/client/preferences.ts`](../src/client/preferences.ts) | Safe `localStorage` wrapper for persisting UI preferences (e.g. homepage gallery view mode). |
| [`src/client/query-provider.tsx`](../src/client/query-provider.tsx) | TanStack Query `QueryClientProvider` setup. |
| [`src/client/use-minute-ticker.ts`](../src/client/use-minute-ticker.ts) | Shared 60-second client ticker keeping client-side `overdue` / `dueSoon` derivations fresh without page reload. |
| [`src/client/queries/tasks.ts`](../src/client/queries/tasks.ts) | React Query hooks & mutations for tasks (`useTasksQuery`, `useCreateTaskMutation`, `useUpdateTaskMutation`, `useCompleteTaskMutation`, `useUncompleteTaskMutation`, `useTransferTaskMutation`, `useDeleteTaskMutation`). |
| [`src/client/queries/notifications.ts`](../src/client/queries/notifications.ts) | React Query hooks for notifications (`useNotificationsQuery` with 30s polling + window-focus refetch, `useMarkNotificationReadMutation`, `useMarkNotificationUnreadMutation`, `useMarkAllNotificationsReadMutation`). |
| [`src/features/registry.ts`](../src/features/registry.ts) | Single source of truth for all 13 features (`built` vs `blank`, routes, labels, thumbnail presets, accents). |
| [`src/features/home/starfield/*`](../src/features/home/starfield/) | `starfield-engine.ts` (pure 2D canvas 3D starfield simulation) and `Starfield.tsx` React wrapper. |
| [`src/features/home/*`](../src/features/home/) | `Wordmark.tsx`, `LetsGoButton.tsx`, `Hero.tsx`, `HomeFooter.tsx`, and `feature-collection/*` (`FeatureThumbnail`, `FeatureCard`, `CollectionHeader`, `HorizontalGallery`, `VerticalGrid`, `FeatureCollection`). |
| [`src/features/transitions/*`](../src/features/transitions/) | `transition-rules.ts`, `CosmicLaunchOverlay.tsx`, `TransitionLink.tsx`, and `TransitionProvider.tsx` (`useTransitionRouter`, `PageReady`). |
| [`src/features/tasks/*`](../src/features/tasks/) | `TaskCard.tsx`, `TaskForm.tsx`, `TaskMenu.tsx`, `TransferDialog.tsx`, `FinishedCounter.tsx`, `PriorityBadge.tsx`, `DueSoonDot.tsx`, `OverdueList.tsx`, `WeekView.tsx`, `MonthView.tsx`, `DailyBoard.tsx`, and `HubList.tsx`. |
| [`src/features/notifications/*`](../src/features/notifications/) | `BellButton.tsx`, `NotificationPopover.tsx`, and `NotificationItem.tsx`. |
| [`src/features/blank/BlankPage.tsx`](../src/features/blank/BlankPage.tsx) | Reusable cosmic placeholder screen for the 11 upcoming features. |

### Layer 7 — Next.js App Router Pages & API Routes (`src/app/`)
| File | Purpose |
| :--- | :--- |
| [`src/app/layout.tsx`](../src/app/layout.tsx) & [`src/app/providers.tsx`](../src/app/providers.tsx) | Root layout mounting variable fonts, `QueryProvider`, `ToastProvider`, and `TransitionProvider`. |
| [`src/app/page.tsx`](../src/app/page.tsx) | Homepage (`/`) combining `<Starfield />`, `<Hero />`, `<FeatureCollection />`, and `<HomeFooter />`. |
| [`src/app/(workspace)/layout.tsx`](../src/app/(workspace)/layout.tsx) | Shared workspace chrome (`<WorkspaceShell />` with Universe Menu `✦` and Notification Bell). |
| [`src/app/(workspace)/tasks/daily/page.tsx`](../src/app/(workspace)/tasks/daily/page.tsx) | Daily Task Management page (`/tasks/daily`). |
| [`src/app/(workspace)/tasks/hub/page.tsx`](../src/app/(workspace)/tasks/hub/page.tsx) | Tasks Hub page (`/tasks/hub`). |
| `src/app/(workspace)/**/page.tsx` (11 routes) | Blank pages for `/events`, `/ai-engineering`, `/blogs`, `/apcs`, `/flashcards`, `/entertainment`, `/tracking`, `/projects`, `/milestones`, `/learning-room`, `/achievements`. |
| [`src/app/api/health/route.ts`](../src/app/api/health/route.ts) | `GET /api/health` returning storage health, driver, and app timezone. |
| `src/app/api/tasks/**/route.ts` | `GET/POST /api/tasks`, `PATCH/DELETE /api/tasks/[id]`, `POST /api/tasks/[id]/complete`, `POST /api/tasks/[id]/uncomplete`, `POST /api/tasks/[id]/transfer`. |
| `src/app/api/notifications/**/route.ts` | `GET /api/notifications`, `POST /api/notifications/[id]/read`, `POST /api/notifications/[id]/unread`, `POST /api/notifications/read-all`. |

---

## 3. Current Working State, Dependencies & Next Steps

### 3.1 Current Working State
- **Epics Completed:** Epic 0 (Foundation), Epic 1 (Design System & Shell), Epic 2 (Daily Task Management), Epic 3 (Tasks Hub), Epic 4 (Notification Center & Scheduler), Epic 5 (Homepage & Starfield), Epic 6 (Feature Collection), Epic 7 (Cosmic Launch Transition), and Epic 8 (Polish, Accessibility, Performance & Hardening).
- **Test & Quality Gate Status:**
  - `npm run lint`: **0 errors, 0 warnings**
  - `npm run typecheck`: **0 TypeScript errors**
  - `npm test`: **17 test suites / 60 tests passing** (unit, integration, component, and architectural/craft guardrail tests)
  - `npm run build`: **21/21 Next.js routes compiled cleanly**
- **Database Status:** Local SQLite database migrated and active at `./data/hiep-trong-space.db`.

### 3.2 Dependencies Installed
- **Runtime:** `next@^15.3.0`, `react@^19.1.0`, `react-dom@^19.1.0`, `@tanstack/react-query@^5.74.0`, `drizzle-orm@^0.41.0`, `better-sqlite3@^13.0.3`, `zod@^3.24.2`, `lucide-react@^1.16.0`
- **Development:** `typescript@^5.8.3`, `tailwindcss@^4.1.4`, `@tailwindcss/postcss@^4.1.4`, `drizzle-kit@^0.31.0`, `vitest@^3.1.1`, `@testing-library/react@^16.3.0`, `@testing-library/jest-dom@^6.6.3`, `@testing-library/user-event@^14.6.1`, `jsdom@^26.1.0`, `eslint@^9.24.0`, `eslint-config-next@^15.3.0`, `prettier@^3.5.3`, `tsx@^4.19.3`

### 3.3 Potential Next Steps (Future Epics 9+)
1. **Merge to `main` (when approved by owner):** Merge `epic/8-hardening` into `main` to finalize the v1.0 release.
2. **Unlock Future Feature Cards (Epics 9+):** Replace any of the 11 `<BlankPage />` routes (`/events`, `/ai-engineering`, `/blogs`, `/apcs`, `/flashcards`, `/entertainment`, `/tracking`, `/projects`, `/milestones`, `/learning-room`, `/achievements`) with full domain/service/UI implementations and flip their status in [`src/features/registry.ts`](../src/features/registry.ts) from `'blank'` to `'built'`.
3. **Optional Google Drive Sync:** Implement `DriveStorageAdapter` in [`src/services/storage/drive/drive-storage-adapter.ts`](../src/services/storage/drive/drive-storage-adapter.ts) when cloud backup is desired.
