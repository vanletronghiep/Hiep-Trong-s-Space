# Hiep Trong Space

> **Revision note (2026-10-30).** Your original text is preserved below. Everything I added is marked **[Clarified]** (usually inside a `>` block) or lives in a clearly labelled new section. Nothing you wrote was deleted; the only things moved are your instructions to the chatbot, which are now in **Appendix A** because they are not part of the product spec.
>
> **Document roles:** this file = WHAT & WHY. `agent_readme.md` = HOW TO BUILD (for the agent). `human_instructions.md` = HOW TO CONTROL THE AGENT (for you). `ui_readme.md` = visual and interaction design.

---

## 0. [Clarified] Quick facts, goals and glossary

**Goal.** One private, beautiful, local-first website where Hiep manages daily tasks (priority no. 1), notifications, learning, projects and personal tracking, and where the project itself is a practice run for building a large system with AI agents.

**Target user.** One person (Hiep), on one Windows PC, no login. Used every day, so it must be fast, calm and comfortable for long sessions.

**Success looks like:**
- Tasks can be created, scheduled, completed, transferred and deleted in a few seconds each.
- Nothing silently disappears; nothing is shown twice with different data.
- The UI can be fully redesigned later without touching storage or business logic.
- Swapping local storage for Google Drive later means writing one new adapter, nothing else.

**Glossary**

| Term | Meaning |
| --- | --- |
| Task | One record in one database table. Daily Task Management and the Tasks Hub are two *views* of the same records, never two copies. |
| Deadline | The date and time (24h) the task is due. Required. |
| Scheduled date | The day whose Daily list the task appears in. Optional. Separate from the deadline. |
| Overdue | Task is not completed and its deadline is earlier than "now" (timezone Asia/Saigon). |
| Due soon | Task is not completed, not overdue, and its reminder moment has been reached (see Notification Hub). |
| Blank Page | A page that exists in navigation with a placeholder only. You will specify it later. The agent must not invent its content. |
| Epic | A large, self-contained chunk of work the agent completes and you review before the next one starts. |
| Feature card | A card on the homepage that links to one feature page. |

---

## Overview
- This is a comprehensive personal life management project designed to help me stay organized and productive while gaining hands-on experience in building large-scale projects with AI agents.
- This web-based project is designed for my personal demand. At first, I want to run it locally, if there is any furthur adjustment, I will change later.
- This website project must satisfied layout, content requirements also it should be designed systematically with clear layout structure, beautiful homepage with interactive animation, motion.

> **[Clarified] Decisions applying to the whole project**
> - **Run mode:** local only, started with a single command on your PC. Single user, no login. A later desktop app (for example Tauri) must remain possible, which is why UI and logic are kept separate.
> - **Timezone:** Asia/Saigon (UTC+7). Configurable in `.env`.
> - **Date display:** `DD/MM` (for example `30/10`). The year is always stored internally and shown when it matters (a different year, or in editors).
> - **Time:** 24-hour format `HH:mm`.
> - **UI language:** English.
> - **Visual themes:** the homepage is the dark "cosmos"; all working pages (tasks and the rest) use the bright lavender "Celestial Workspace". See `ui_readme.md`. Where its generic template conflicts with a specific section, the specific section wins (rules are in `agent_readme.md`).
> - **Fonts (free only):** Cormorant Garamond for headings and the wordmark, Inter for the interface. The paid font named in the generic template is not used.

## Background and constraints
- I know many language, I am patient enough to read agent-generated code if needed.
- Agent: Antigravity IDE
    - Model: Gemini 4 Argon - Gemini 3.8 Flash
- OS: Windows
- Editor: Antigravity IDE
- Budget: free tools only
### Environment and installation permissions
My current setup: I have NOT installed most of the tools and libraries
this project needs.

The agent is allowed to install automatically, without asking me:
- Project-level dependencies through the package manager (npm / pnpm / pip),
  installed inside the project folder or a virtual environment only
- Standard, well-known libraries needed for the agreed stack
  (e.g. React/Next.js, Tailwind, shadcn/ui, Three.js, SQLite driver,
  a test framework, ESLint/Prettier, TypeScript)
- Dev tools needed to run, lint, test and build the project

The agent must ASK me first before:
- Installing any library NOT in the agreed stack, and say why it is needed
- Installing system-wide tools (Node.js, Python, Git, databases, Docker)
  and give me the exact command or steps if I should run it myself
- Upgrading major versions of existing dependencies
- Adding paid, account-based or cloud services

The agent must NEVER:
- Use sudo / administrator rights unless I explicitly approve
- Change system settings, environment variables, or files outside
  the project folder
- Download or run scripts from unknown sources
- Put API keys or secrets in code (use a .env file kept out of git)

After every installation, the agent must:
- Tell me in one line what was installed and why
- Record it in package.json / requirements.txt so the setup is reproducible
- Commit the change separately from feature code

> **[Clarified]**
> - **Package manager:** npm (the simplest on Windows). The agent must not mix in pnpm or yarn.
> - **"Agreed stack"** is fixed in the next section. Anything outside that list requires asking you first.
> - **Windows note:** the SQLite driver (`better-sqlite3`) normally installs from prebuilt binaries. If installation asks for Visual Studio Build Tools or any system-level compiler, that is a system-wide install, so the agent must stop and ask you.
> - **Commits:** the agent commits on an epic branch only. It never pushes, never force-pushes and never touches `main`. You merge.

## Technical Preferences
- Stack: recommend one, I'm open
- Because my project is required continuous edit, save, writing from user, therefore I don't mind if I have to use any tools, stack, ... all I need is the satisfying my requirements.

> **[Clarified] Recommended and agreed stack**
>
> | Layer | Choice | Why |
> | --- | --- | --- |
> | Framework | Next.js (App Router) + React + TypeScript | Mature, one project for UI and API, easy to run locally |
> | Styling | Tailwind CSS with CSS-variable design tokens | Fast, themeable, redesign-friendly |
> | Motion | `motion` library (formerly Framer Motion) + CSS | Scroll-linked and layout animations (task reordering, horizontal gallery) |
> | Starfield | Plain HTML Canvas 2D, no Three.js | Lighter and exactly what your spec asks for |
> | Data fetching | TanStack Query | Keeps Daily view, Hub and notifications in sync |
> | Validation | Zod | One schema shared by API and UI |
> | Database | SQLite (`better-sqlite3`) with Drizzle ORM | One local file, easy backup, easy to replace |
> | Dates | `date-fns` (+ timezone support) | Reliable timezone-aware date maths |
> | Icons | `lucide-react` + a hand-made inline four-point star SVG | One icon library per page |
> | Tests | Vitest (+ Testing Library) | Unit tests for the task rules |
> | Quality | ESLint, Prettier, TypeScript strict | Catches architecture violations automatically |
>
> **Architecture in one sentence:** UI → client hooks → HTTP API → services → storage adapter → SQLite. Each layer only knows the one below it, so the UI can be replaced and the storage can be swapped independently.

## How to work with agent
- I want to work with agent with splitted Epic instead of let agent solving at once.

> **[Clarified] Epic plan (default order).** The agent starts one epic at a time and stops for your review after each.
>
> | Epic | Name | Result you can try |
> | --- | --- | --- |
> | 0 | Foundation and storage layer | Project runs, database works, tests pass |
> | 1 | Design tokens, app shell, 13 blank page stubs | Every route opens; placeholder pages look right |
> | 2 | Daily Task Management | You can already use tasks every day |
> | 3 | Tasks Hub and sync | Hub and Daily stay in sync |
> | 4 | Notification Center | Bell, popover, due-soon logic |
> | 5 | Homepage: starfield, wordmark, "Let's go" | The magnificent front door |
> | 6 | Feature Collection (horizontal and vertical modes) | Feature cards gallery |
> | 7 | Cosmic Launch page transition | Rocket journey between pages |
> | 8 | Hardening and polish | Accessibility, responsive, performance |
> | 9 | Statistics (blocked) | Only after you describe it |
>
> Tasks come before the homepage on purpose: you said you want to use the features right away.

## Addition Requirements
- Build the website using modern, industry-standard technologies, frameworks, and best practices, with a clean, scalable, modular, and maintainable project structure. Ensure the UI layer is loosely coupled with the business logic and backend, allowing the entire interface to be redesigned or replaced with minimal changes to other parts of the codebase.

- To maintain flexibility for future storage migrations (specifically transitioning from local storage to Google Drive API / Cloud Storage), please adhere to the following architecture rules:

1. **Decoupled Storage Layer (Repository / Adapter Pattern):**
   - DO NOT perform direct file I/O operations (e.g., `open()`, `fs.writeFileSync`) or hardcoded database queries directly inside routes, controllers, or UI logic.
   - Abstract all data storage and retrieval logic inside a dedicated storage module/class (e.g., `services/storage/` or `StorageAdapter`).

2. **Environment Configuration:**
   - Store storage path bases, folder IDs, and environment-specific parameters in environment variables (`.env`).

3. **Storage Abstraction Interface:**
   - Design the storage methods to be agnostic of the underlying backend. Methods should follow simple interfaces like `save_item(data)`, `get_item(id)`, `upload_media(file)`.
   - The primary application logic should only interact with this abstraction layer so that swapping local storage for Google Drive API requires updating only the storage adapter implementation.

> **[Clarified]**
> - In TypeScript the method names are camelCase: `saveItem`, `getItem`, `uploadMedia`, plus `listItems` and `deleteItem`.
> - Local storage means a `data/` folder next to the project (git-ignored): one SQLite file plus a `media/` folder for uploads. Their locations come from `.env`.
> - Only a `local` adapter is built now. A `drive` adapter is a documented stub that throws "not implemented".
> - **Backup:** because everything lives in `data/`, copying that folder is a full backup. `human_instructions.md` explains how.

## Folder Initial Description
```
Task Management/
├── md/
│   ├── agent_readme.md
│   ├── human_readme.md
│   └── ui_readme.md
└── sources.txt - this file is for human only
```

> **[Clarified] Folder after refinement.** Your request listed `user_guide.md`; the task text called it `human_instructions.md`. Decision: **`human_instructions.md`**.
> ```
> Task Management/
> ├── md/
> │   ├── human_readme.md          (this file)
> │   ├── agent_readme.md
> │   ├── human_instructions.md
> │   ├── ui_readme.md
> │   ├── progress.md              (agent-maintained status log, created in Epic 0)
> │   └── refs/                    (optional: your reference images)
> ├── sources.txt                  (human only; the agent never reads or edits it)
> └── AGENTS.md                    (tiny pointer so the IDE auto-loads agent_readme.md)
> ```
> The application code (`src/`, `package.json`, `data/`, …) is created next to `md/` in the same folder.

## UI ideas
- All the description are in the `md/ui_readme.md`, agent will directly working in this file description for UI, UX ideas.

> **[Clarified]**
> - The agent reads `ui_readme.md` but does not edit it without your permission; deviations are logged in `progress.md`.
> - Reference images mentioned in the UI spec were not provided. If you want them followed, put them in `md/refs/` and tell the agent. Otherwise it works from the text only.
> - Feature-card thumbnails: no stock photos. The agent generates abstract, on-palette SVG/CSS thumbnails. Each card has a `thumbnail` field so you can swap in your own images later.

## Features

> **[Clarified] Site map (13 feature pages + homepage).** The UI spec says the Notification Hub is a popover, not a page, so the Feature Collection has **13 cards**.
>
> | # | Feature | Route | Status |
> | --- | --- | --- | --- |
> | 0 | Homepage | `/` | Full build |
> | 1 | Daily Task Management | `/tasks/daily` | Full build (priority 1) |
> | 2 | Tasks Hub | `/tasks/hub` | Full build |
> | – | Notification Hub | popover on `/` and in the app shell | Full build |
> | 3 | Events | `/events` | Blank Page |
> | 4 | AI Engineering | `/ai-engineering` | Blank Page |
> | 5 | Blogs Hub | `/blogs` | Blank Page |
> | 6 | APCS Hub – University | `/apcs` | Blank Page |
> | 7 | Flashcard System | `/flashcards` | Blank Page |
> | 8 | Entertainment Hub | `/entertainment` | Blank Page |
> | 9 | Tracking | `/tracking` | Blank Page |
> | 10 | In Progress Project | `/projects` | Blank Page |
> | 11 | Annual Milestone | `/milestones` | Blank Page |
> | 12 | Learning Room | `/learning-room` | Blank Page |
> | 13 | Personal Achievements | `/achievements` | Blank Page |
>
> Card order on the homepage follows this table (Daily first).

### Daily Task Management 
- Priority: No 1 Priority
- Behavior:
    - Default mode is a 3 consecutive day (yesterday, today, tomorrow) tasks list.
    - I can change the display: Week/ Months
    - Adding task can only exists in the today, tomorrow tab.
    - Every task has a 3 dots (Editting) to open edit tab of that task.
    - Overdue task can be transfered to the Today/Tomorrow/ Specified Date.
    - Deleting Task button.
    - When choosing a Date, are allowed to type the new deadline time (24h). Date with this pattern: Day/Month
    - Add task button, allow user to add task with following features:
        - Task title
        - Deadline with particular date, time.
        - Piority - Urgent/ Normal/ Optional
        - Description - User Description about the task, they type in
        - Pinned option
    - Each task has these features:
        - If overdue, changes the color to color (red color family)
    - Finished Task 
        - Completed tasks once ticked by user (marking finished) will be push to the bottom (including smooth transition)
        - A light color strikethrough to mark completed task, with italic.
        - There will be a small box represents number of finished task that day.
    - Overdue List:
        - Under the main daily task management space, there will be a Overdue Task list which let user know which task is overdue. Its representation is the same with daily task, it is the box (describe particularly in the `ui_readme.md`). 
        - Also there will be a button that allow user to transfer the overdue task to another date
        - Deleting Task Button
- Statistics: This is a statistics building for Task Managment, this feature will be describe later.

> **[Clarified] Detailed behaviour**
>
> **Data model.** A task has: title (required, max 120 chars), description (optional, max 2000), priority (Urgent / Normal / Optional, default Normal), pinned (yes/no), deadline (date and time, required), scheduled date (optional), status (active / completed), completed time, created and updated times.
>
> **Layout.**
> - **Day view (default):** Yesterday | Today | Tomorrow. Three columns on desktop, with Today visually emphasised. On narrow screens they become three tabs.
> - **Week view:** seven days of the current week with previous/next week arrows. **Month view:** calendar grid showing task counts per day; clicking a day opens that day's list. Week and Month are read and manage views: you can complete, edit, transfer and delete, but you cannot add tasks there.
> - A segmented control switches Day | Week | Month. The choice is remembered.
> - **Adding tasks** is only possible in the Today and Tomorrow columns. A new task there gets that day as its scheduled date and a deadline prefilled to that day at 23:59 (you can change it). Yesterday has no add button.
> - The Overdue list sits below the main area, in every view.
>
> **Deadline input.** Type or pick a date as `DD/MM` and a time as `HH:mm`. If you type `DD/MM` without a year, the app uses the nearest matching date that is today or later, and shows the full resolved date under the field so there is no surprise. A calendar picker allows any year. A new task cannot be created with a deadline in the past; editing an existing task is allowed.
>
> **Sorting inside a day:** pinned first, then priority (Urgent, Normal, Optional), then deadline time, with completed tasks always at the bottom.
>
> **Pinned** means "stick to the top of its day list". It is not a separate page.
>
> **Overdue.** The deadline has passed and the task is not completed. The task turns pale-coral (readable, never a harsh red fill) in its day column **and** is listed in the Overdue list. They are the same record, so ticking or deleting it in either place updates both.
>
> **Transfer (overdue task).** Choose Today, Tomorrow or a specific date plus a time. This sets **both** the scheduled date and the deadline, so the task stops being overdue.
>
> **Delete.** The three-dot menu has "Delete", which removes the task everywhere after a confirmation. It also has "Remove from today" (clears only the scheduled date, so the task stays in the Hub).
>
> **Completion.** Ticking animates the checkbox, applies a light strikethrough and italic title, then the card glides to the bottom of its list. Unticking reverses it. Each day header shows a small box with the number of finished tasks that day ("N done").
>
> **Statistics.** Reserved as an empty placeholder (a Statistics entry in the page header). The database keeps completion times so statistics can be built later. Blocked until you describe it.
>
> **Acceptance criteria**
> - [ ] Default view shows Yesterday, Today and Tomorrow; Add exists only on Today and Tomorrow.
> - [ ] Add and edit use the same form with title, deadline (DD/MM + 24h time), priority, description, pinned.
> - [ ] Validation: empty title, over-long text and past deadline on creation show clear messages.
> - [ ] A task past its deadline turns coral and appears in the Overdue list without a page refresh.
> - [ ] Transfer moves an overdue task to Today, Tomorrow or a chosen date and removes it from Overdue.
> - [ ] Completing moves the card to the bottom with a smooth animation, strikethrough and italic; the day's finished counter increases.
> - [ ] Deleting asks for confirmation and removes the task from Daily, Hub and notifications.
> - [ ] Day / Week / Month switching works and is remembered; Week and Month have no Add button.
> - [ ] Reloading the page keeps all data.

### Tasks Hub
- Its features likely same with the **Daily Task Management**
- Adding task button - 100% same with **Daily Task Management**
- Connect with **Notification Hub**, notify one day before the task deadline, if the task deadline - present < 1 day => notify before 1/4 time. Such as: 12h left => Notify when it is 3h left.
    - Tag in notification hub: Due Soon
- Allow to connect with **Daily Task Management**, when user expand one task, there will have an option to for user to add it to Today/Tomorrow/Date.
    - When a task a ticked finished (in the Daily Task Management) it automatically sync with the Tasks Hub to remove that task.
    - Vice versa, when click finished/ Deleted in a Task Hub, the task in the **Daily Task Management** will also be impacted.
- When click finished in the Task Hub. 

> **[Clarified] Detailed behaviour**
>
> **What the Hub is.** The master list of **every active task** regardless of date, including tasks that have never been scheduled in Daily. Daily and Hub read the same records, so synchronisation is automatic and instant (no copying).
>
> **The unfinished sentence** ("When click finished in the Task Hub.") is interpreted as: completing a task in the Hub completes the same task in Daily, and it disappears from the Hub's active list.
>
> **Layout.** Tasks grouped by urgency: Overdue, Due soon (reminder moment reached), Later. Search box, priority filter, sort by deadline (default). A "Completed" toggle shows finished tasks (so history is never lost). The Add button and form are identical to Daily; a task created in the Hub has no scheduled date until you add it to a day.
>
> **Expand a task.** Clicking the card body (not the checkbox or menu) expands it: full description and actions **Add to Today**, **Add to Tomorrow**, **Pick date…** (and **Remove from daily** if already scheduled).
>
> **Sync rules (single source of truth)**
>
> | Action | In Daily | In Hub |
> | --- | --- | --- |
> | Complete | Task moves to the bottom, struck through | Task leaves the active list (visible under "Completed") |
> | Untick completed | Returns to normal position | Reappears in active list |
> | Delete | Gone | Gone |
> | Add to Today/Tomorrow/Date | Appears in that day | Stays, with a small "scheduled" date label |
> | Remove from today | Gone from that day | Stays |
>
> **Notification link.** A task's reminder is calculated from its deadline: if at least 24 hours remain when the deadline is set, notify **24 hours before**; if less than 24 hours remain, notify when **one quarter of the time remaining at that moment** is left (12h left → notify at 3h left). Tag: **Due Soon**. Changing the deadline recalculates the reminder.
>
> **Acceptance criteria**
> - [ ] Hub lists all active tasks with the same card design as Daily.
> - [ ] Create in Hub = same form and rules as Daily.
> - [ ] Completing or deleting in either place is reflected in the other within a second, without reload.
> - [ ] Expand shows Add to Today / Tomorrow / Date; after adding, the task appears in the correct Daily column.
> - [ ] Due-soon calculation matches the 24h and quarter-time rules (unit-tested).

### Notification Hub
- Clear notifications >= 7 days ago
- A small text denotes N days ago in the corner of the bottom right corner of the notification message.
- Read box ticked, user can tick to turn off red point (show that user already read that notification)
- A notification message should include these: Title, Read-check, days ago, time-left, tag (because there are many type of notifications so different in color, tag will help user identify more easily)

> **[Clarified] Detailed behaviour** (visual details are in `ui_readme.md`, section "Homepage Notification Center")
>
> - **Not a page.** A bell icon (top-right, next to "Let's go" on the homepage, and also in the shell of inner pages so you can check reminders while working) opens a floating popover.
> - **Delivery:** in-app only. The server checks reminders every 30 seconds while the app is running and catches up on anything missed the next time it starts.
> - **Ordering:** newest on top. Unread count shown on the bell with a red dot.
> - **Each notification shows:** title, short message, tag, read checkbox, "N days ago" in the bottom-right corner, and time left when relevant ("3h 20m left" or "Overdue by 2h").
> - **Tags:** Due Soon, Overdue, Completed, General, System.
> - **When notifications are created:**
>   - *Due Soon* at the reminder moment described above.
>   - *Overdue* when the deadline passes while the task is still active.
>   - *Completed* when you complete a task that had a Due Soon or Overdue notification (a friendly "closing the loop" message). Other completions stay silent to avoid noise.
>   - *General* and *System* are for future use.
> - **No duplicates.** Each reminder event creates at most one notification.
> - **No data copies.** A notification points to a task; its title and time-left are read from the task, so renaming or rescheduling a task is reflected immediately. If the task is deleted, its notifications are deleted. If a task is completed or its deadline changes, stale Due Soon / Overdue notifications for it are removed.
> - **Retention:** notifications 7 days old or older are deleted from the database (at startup and every hour), not just hidden.
> - **Click behaviour:** clicking a task notification opens `/tasks/hub` with that task highlighted. Marking read (checkbox) does not navigate.
> - **No Cosmic Launch** animation for opening or closing the popover.
>
> **Acceptance criteria**
> - [ ] Bell shows unread dot/count; clicking opens the popover; click outside or Esc closes it.
> - [ ] Notifications are newest first, each with title, tag, read check, "N days ago", time left.
> - [ ] Read checkbox clears that notification's unread dot; "Mark all as read" works.
> - [ ] Creating a task due in 2 minutes yields a Due Soon notification at the correct moment and an Overdue one at the deadline, once each.
> - [ ] Notifications older than 7 days are removed from the database.
> - [ ] Empty state reads "All caught up."

### Events (Blank Page)
- I use this tab to save following Events: School Offline/ Online Events, Meeting, Exam Date (High Priority, should be treated as a special zone in the Events Hub)
- Leave this Page empty, i will adjust later
### AI Engineering (Blank Page)
- Roadmap
- My seperate study space about my career, AI Engineer
- Connect with Notion notes
    - Import Notes to website.
### Blogs Hub (Blank Page)
- My random writing (Draft/ Writing Mode)
    - Domino Procrastination
    - How long a human brain can focus intensively?
### APCS Hub - University (Blank Page)
- Self-study Progress
- Subject sources
    - Support uploading data
    - Subject Notes
### Flashcard System (Blank Page)
- English flashcard with multiple topics, groups
- Ctrl+S to save when finish typing
### Entertainment Hub (Blank Page)
- Music Hub
    - Connect with Youtube Music, or sth
- Game Hub
    - No idea
- Library
    - Reading Book
### Tracking (Blank Page)
- Daily Habits
- Sleep Calculator
- Sleep Tracking
- Screen Time
    - User input every screen time
    - Analyzes data, create chart, diagram, ... for statistics
    - Phone using Tendency
### In Progress Project (Blank Page)
- Go Game Project
- Task Management Project
### Annual Milestone (Blank Page)
- Master Git
- Learn Transformer
....

### Learning Room (Blank Page)
- Import from Today Task
- 10mintues warm up
- Promodo
### Personal Achievements (Blank Page)
- Contest registered, results
    - What I have learned from this contest
    - Image gallery
    - Stages (Elementary to Universtiy)
    - Lists
        - 

        Yes, create me a detailed agent_readme.md files that instruct Agent what to do. Then give me user_guide.md file to instruct me what to do. Task Management/
├── md/
│   ├── agent_readme.md
│   ├── user_guide.md
│   └── ui_readme.md
└── sources.txt

> **[Clarified] Blank Pages (all 11 above).** Each is a real route with the app shell, the page title, a small star accent, the line "This space is waiting to be built.", and a way back to the homepage. The feature descriptions above are *your notes for later* and are intentionally **not** implemented. The agent must not build any of those features, add data models for them, or guess their content. Notion import, Youtube Music connection, uploads and charts all wait until you write that page's own description.
>
> **[Clarified] Statistics for tasks** is also a placeholder until described.

## Clarification for Chatbot
- This is a bonus clarification for chatbot to understand that **Blank Page** means this page will later be instructed by me. So just ignore its content. You just need to know that, those are mentioned feature, when implementing, just give that feature a blank page.

---

## 1. [Clarified] Homepage and navigation summary
Full detail lives in `ui_readme.md`. In summary:
- **Homepage = dark cosmos.** Animated 3D-perspective starfield (Canvas 2D), the wordmark "Hiep Trong" (signature) + "SPACE" (dominant, uppercase serif), a small four-point star detail, one short statement, and nothing else competing for attention.
- **No navigation bar.** Top-right has two small elements only: the notification bell and the **"Let's go"** button (text morphs to an arrow on hover; click smooth-scrolls to the Feature Collection).
- **Feature Collection:** 13 large cards from one data source, with a **Horizontal | Vertical** toggle. Horizontal = pinned section where vertical scrolling slides cards sideways (two cards visible on desktop). Vertical = ordinary two-column grid. The choice is remembered. On tablets and phones the pinned effect is replaced by a touch-friendly layout (see `agent_readme.md`).
- **Cosmic Launch:** a ~3 second rocket animation plays when navigating to another internal page, never for the notification popover, same-page scrolling or external links.
- **Statement text** (my default; change freely): "A space for everything I aspire to become."

## 2. [Clarified] Global behaviours the agent should apply everywhere
These are the "obvious but unwritten" expectations, now written down.
- **Empty states** for every list, with calm one-line text and a call to action where relevant.
- **Validation messages** next to the field, never browser alerts.
- **Instant feedback:** updates appear immediately and roll back with an error toast if the server refuses.
- **New items** animate in and glow softly for about a second at their sorted position; deleted items fade and collapse.
- **Dangerous actions** (delete) ask for confirmation. Nothing is deleted by a single accidental click.
- **Keyboard:** Esc closes popovers, menus and drawers; Enter submits forms; all controls are reachable with Tab and show a visible focus ring.
- **Time labels** refresh by themselves every minute ("3h left" becomes "2h 59m left").
- **Responsive:** every page works on desktop, tablet and phone widths with no horizontal page overflow.
- **Accessibility:** sufficient contrast, labels on icon buttons, reduced-motion respected, never colour alone to convey meaning.
- **Errors** are friendly, specific and recoverable; the app never shows a blank screen.

## 3. [Clarified] Non-goals for now
Login or multiple users, cloud sync, mobile app, desktop packaging, recurring tasks, subtasks, tags, push notifications, e-mail, Notion/Google Calendar/YouTube integrations, any content of Blank Pages. (The database is designed so recurring tasks and tags can be added later without rewriting.)

## 4. [Clarified] Decision log (answers to the architect's questions)
All defaults proposed were accepted on 2026-10-30.

| ID | Decision |
| --- | --- |
| A1 | Guide file is named `human_instructions.md`; `user_guide.md` is dropped |
| A2 | Dark homepage + lavender workspace are the two themes; the generic template only supplies craft rules |
| A3 | Cormorant Garamond + Inter |
| A4 | No reference images provided; work from text; `md/refs/` optional |
| A5 | 13 cards; notifications are a popover only |
| A6 | Unfinished Hub sentence = completing in Hub mirrors Daily |
| B1 | Tasks have both `deadline` and `scheduledDate` |
| B2 | Time is required; default 23:59; overdue = past deadline and not completed (Asia/Saigon) |
| B3 | Transfer updates both scheduled date and deadline |
| B4 | Delete removes everywhere; extra "Remove from today" action |
| B5 | Completed tasks are kept, hidden from the Hub's active list, available under "Completed" |
| B6 | Pinned = top of the day list |
| B7 | Sort: pinned → priority → deadline time; completed last |
| B8 | Yesterday shows its tasks incl. completed; Week/Month manage but cannot add |
| B9 | No recurring/subtasks/tags in v1; schema leaves room |
| B10 | Display `DD/MM`, store ISO with year |
| C1 | Notifications in-app only |
| C2 | Server-side scheduler (30 s) with catch-up on start |
| C3 | Purge ≥ 7 days old at start and hourly |
| D1 | Next.js + TypeScript + Tailwind + SQLite via repository layer + Canvas 2D |
| D2 | Local SQLite adapter now; Drive adapter is a stub |
| D3 | Single user, no login |
| D4 | Node.js/Git status unknown; the agent must give exact install steps (see `human_instructions.md`) |
| D5 | Notion import is out of scope for now |
| E1 | Add a tiny `AGENTS.md` pointer |
| E2 | Epic order as in the table above |
| E3 | Unit tests for rules; no heavy end-to-end tests initially |
| E4 | UI language English |

**Assumptions I made that you did not explicitly choose** (tell me to change any): the bell also appears inside inner pages' shell; "Completed" notifications only close the loop on due-soon or overdue tasks; stale due-soon/overdue notifications are removed rather than kept when a task is completed or rescheduled; the Daily 3-day view is three columns on desktop (tabs on mobile); delete uses a confirmation dialog rather than an undo toast; the notification "Completed" tag is soft sage while the completed *task* state uses muted purple (as written in `ui_readme.md`).

## 5. [Clarified] Open items (not blocking Epics 0–8)
- Description of the task **Statistics** feature.
- Reference images for homepage and feature cards (optional).
- Content and behaviour of every Blank Page, one at a time, when you are ready.
- Whether to use Notion import, Google Calendar sync or YouTube Music later.

---

## Appendix A — Original chatbot brief (kept verbatim for reference; not part of the product spec)

### What will you do
Act as a **strict Senior Software Architect and Requirements Analyst**. Your goal is to transform my initial project description into a complete, precise, and implementation-ready specification.

#### Phase 1 — Requirement Clarification
- Thoroughly read `human_readme.md` and inspect the existing project structure.
- Identify all missing details, ambiguous features, contradictions, edge cases, and undefined requirements. 
    - If you identified that the missing details can be supplement automatically and it is not necessary to ask user to clarify, you should understand it then later explain it more clearly for agent to understand.
- Ask me structured, specific questions iteratively until every important aspect of the project is sufficiently clear.
- Recommend appropriate solutions when needed.

#### Phase 2 — Documentation Refinement
- Summarize all clarified requirements, proposed changes, additional questions, and decisions.
- Incrementally improve `human_readme.md` by adding missing details, correcting inaccuracies, and clarifying existing descriptions.
- **Never completely rewrite, delete, or fundamentally change existing content without my explicit permission.**
- Ensure all features have clear purposes, expected behaviors, constraints, and acceptance criteria.

#### Phase 3 — Architecture & Deliverables
Design a modern, modular, scalable, and maintainable architecture using appropriate industry-standard technologies and best practices. Keep the UI layer loosely coupled with business logic and backend services so the interface can be redesigned or replaced independently.

Create or update these three documents:

**1. `human_readme.md` — WHAT & WHY**
- The authoritative, human-readable project specification.
- Include project goals, target users, complete feature descriptions, user workflows, expected behaviors, constraints, edge cases, and acceptance criteria.
- Preserve existing content while incorporating all approved clarifications.
- Also reconstruct the my description without modify my initial content too much, you should reconstruct to make the clarification for clearly, removing overlap information, ambiguous

**2. `agent_readme.md` — HOW TO BUILD**
- The technical instruction manual for AI coding agents.
- Define the technology stack, system architecture, folder structure, module boundaries, UI separation, coding conventions, dependencies, testing strategy, and development commands.
- Specify agent responsibilities, permissions, prohibited actions, and rules for maintaining consistency.
- You can explain, instruct agent in long words, concise words, ...  I don't care. I mean as long as agent understand, it is okay.
- My expression in `human_readme.md` might ambiguous, dumb expression, you should understand it then explain it for the agent for better expression.
- You have to explain it so clearly that agent can understand the task totally, by the way, in some details I didn't mention so particularly such as: You know that the notification dropout, new task will be upon the preivous task, ... I didn't mention, but you know how to describe it for agent. I mean some task is more complex, but I didn't mention, but you know that that task in commonly represent this way, you can automatically apply it.

**3. `human_instructions.md` — HOW TO CONTROL THE AGENT**
- A practical guide for me to supervise AI-assisted development.
- Provide step-by-step workflows, reusable prompt templates, task planning methods, session checklists, and code review procedures.
- Explain how to verify implementations, manage Git, handle bugs, prevent unauthorized changes, and recover when the agent goes off track.
- Include strategies for preserving context across sessions and minimizing token consumption.
