# How to Run — Hiep Trong Space

Your workspace (`d:\Vibe Coding\Task Management`) is **already configured** with `.env`, `node_modules`, and the local SQLite database (`data/hiep-trong-space.db`).

---

## 1. Quick Start (Run Right Now)

Open a terminal (**PowerShell** or VS Code Terminal) in `d:\Vibe Coding\Task Management` and run:

```powershell
npm run dev
```

Then open your browser at:

- **http://localhost:3000**

To stop the server at any time, press **`Ctrl + C`** in the terminal.

> **Tip:** If port `3000` is already in use, run on another port (e.g. `3001`):
> ```powershell
> npx next dev -p 3001
> ```

---

## 2. Run in Production Mode (Fastest Performance)

If you want optimized production performance instead of development mode:

```powershell
npm run build
npm start
```

Then open **http://localhost:3000**.

---

## 3. First-Time Setup (Only Needed on a Fresh Clone / New Machine)

If you ever move this project to a new machine or delete `node_modules` / `data`:

```powershell
# 1. Create your environment file from the template
Copy-Item .env.example .env

# 2. Install dependencies
npm install

# 3. Create & migrate the local SQLite database
npm run db:migrate

# 4. Start the app
npm run dev
```

---

## 4. Pages & Features to Explore

Once the server is running at **http://localhost:3000**:

| Page / Feature | URL / Shortcut | What You Can Do |
| :--- | :--- | :--- |
| **Homepage & Starfield** | `http://localhost:3000/` | Interactive 3D starfield canvas (cursor repulsion, shooting stars, click-to-spark bursts) and **"Let's go!"** smooth scroll. |
| **Feature Collection** | Scroll down on `/` | Switch between **Horizontal 3D Cover-Flow Gallery** (drag, wheel, keyboard `←`/`→`, filter chips) and **Vertical Grid**. |
| **Cosmic Launch Transition** | Click any feature card on `/` | 4-phase ~3s spacecraft warp-speed transition into the destination feature (or instant crossfade if OS Reduced Motion is enabled). |
| **Daily Task Management** | `http://localhost:3000/tasks/daily` | **Day / Week / Month** views, create tasks with natural dates (`today`, `tomorrow`, `in 3 days`, `+2w`) & reminders (`20m`, `1h`), filter/sort, transfer tasks, and track the **Finished Today** counter. |
| **Tasks Hub** | `http://localhost:3000/tasks/hub` | Master backlog grouped by **Overdue / Due soon / Later**, search, priority filters, sort toggle, and one-click **"Move to today"** / **"Schedule for date…"**. |
| **Notification Center** | Bell icon (top-right of any `/tasks/*` or feature page) | Live unread badge, due-soon / overdue / reminder notifications, click to deep-link and highlight the task (`?task=<id>`), Mark all read, or Clear all. |
| **Universe Menu** | Click top-left **✦** icon or press **`Ctrl + K`** (`Cmd + K` on Mac) | Quick-jump drawer to any of the 13 features from anywhere in the app. |
| **Future Feature Pages (11)** | `/study/german`, `/finance`, `/health/fitness`, etc. | Styled cosmic placeholder pages with direct return links to Home and Daily Tasks. |

---

## 5. Useful Commands Reference

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the Next.js development server at `http://localhost:3000` |
| `npm run build` | Build the production application |
| `npm start` | Run the built production server |
| `npm run check` | Run all quality gates: ESLint + TypeScript typecheck + Vitest test suite |
| `npm test` | Run the full Vitest unit & integration test suite once |
| `npm run test:watch` | Run Vitest in interactive watch mode |
| `npm run db:migrate` | Apply SQLite database migrations (`./data/hiep-trong-space.db`) |
| `npm run db:studio` | Open Drizzle Studio in your browser to inspect/edit database tables visually |
| `npm run format` | Format all files with Prettier |

---

## 6. Where Your Data Lives & How to Back It Up

All your tasks, reminders, and notifications are stored locally in:

- **Database file:** `d:\Vibe Coding\Task Management\data\hiep-trong-space.db`
- **Media folder:** `d:\Vibe Coding\Task Management\data\media\`

### Backup Command (PowerShell)
Stop the server (`Ctrl + C`), then run:

```powershell
$stamp = Get-Date -Format "yyyy-MM-dd_HHmm"
Compress-Archive -Path .\data -DestinationPath ".\backup-hiep-trong-space-$stamp.zip"
```

### Restore Command (PowerShell)
Stop the server (`Ctrl + C`), then run:

```powershell
Remove-Item -Recurse -Force .\data
Expand-Archive -Path .\backup-hiep-trong-space-YYYY-MM-DD_HHMM.zip -DestinationPath .
```
