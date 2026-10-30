# human_instructions.md — HOW TO CONTROL THE AGENT

For you (Hiep). Practical, copy-paste friendly, written for Windows + Antigravity IDE. You do not need to memorise it: use §3 (the loop) and §4 (prompts) every day, and open the other sections when you need them.

**Your three documents:** `human_readme.md` = what and why (your product spec). `agent_readme.md` = how to build (the agent's manual). This file = how you supervise. `ui_readme.md` = the visual design, unchanged.

---

## 1. The mental model

- The agent is a fast, literal, sometimes over-enthusiastic junior engineer. It does exactly what the documents and your prompt say, plus whatever it *guesses*. Your job is to keep the guesses small.
- **You control four things:** (1) which epic is active, (2) what is allowed (permissions), (3) when work is accepted (review + tests), (4) what is saved (Git). The agent controls nothing outside the current epic.
- **Rule of thumb:** small steps, frequent commits, review before merging. An hour of review per epic beats ten hours of untangling.
- Flash-class models are fast but lose detail in long sessions. Keep each prompt focused on one outcome and start a fresh session per epic (see §12).

---

## 2. One-time setup (about 30 minutes)

### 2.1 Install the system tools yourself (the agent is not allowed to)
Open **PowerShell** (normal, not "as administrator" unless the installer asks) and check what you have:

```powershell
node -v
npm -v
git --version
```

If a command says "not recognized", install it. Easiest way on Windows 10/11 is `winget`:

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
```

Close PowerShell, open a new one, and run the three version commands again. (If `winget` is not available, download the LTS installer from nodejs.org and Git from git-scm.com and click through the defaults.)

Tell Git who you are (once):

```powershell
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

### 2.2 Prepare the project folder
1. Put the project in a normal folder **outside OneDrive** (for example `C:\Projects\Task Management`). OneDrive sync can lock the database file.
2. Inside it you should have: `md\human_readme.md`, `md\agent_readme.md`, `md\human_instructions.md`, `md\ui_readme.md`, and `sources.txt` (yours alone).
3. Open that folder in Antigravity IDE (File → Open Folder).
4. Initialise Git and make the safety commit:

```powershell
git init
git add md sources.txt
git commit -m "docs: add project specification"
git branch -M main
```

5. Protect your own documents from accidental edits (optional but recommended):

```powershell
attrib +R md\human_readme.md
attrib +R md\ui_readme.md
attrib +R sources.txt
```
To edit them yourself later: `attrib -R md\human_readme.md`, edit, then `attrib +R` again.

### 2.3 Check how Antigravity loads instructions
The agent will create a small `AGENTS.md` that points to `md/agent_readme.md`. In your very first session, ask the agent: *"Which file or setting do you load automatically as project rules?"* If it says it does not auto-load `AGENTS.md`, you simply paste the **Session start prompt** from §4.2 at the beginning of every session. That is enough.

---

## 3. The loop you repeat for every epic

```
1  Start a NEW chat/session for the epic
2  Paste "Session start" + "Epic start" prompt         (§4.1, §4.2)
3  Ask for a PLAN first; read it; approve or adjust     (§4.3)
4  Let the agent work in steps; answer its questions
5  Agent reports (short). You run the checks            (§7)
6  You review the diff                                  (§8)
7  Problems? Use the bug / fix prompts                  (§4.6, §10)
8  Happy? Merge to main + tag                           (§9)
9  Take a break. Next epic = next fresh session
```

Epics in order: 0 Foundation → 1 Shell and stubs → 2 Daily tasks → 3 Hub → 4 Notifications → 5 Homepage → 6 Feature Collection → 7 Cosmic Launch → 8 Polish → 9 Statistics (only after you describe it).

If you want to *use* the app early, stop after Epic 2 or 3 and use it for a few days. That is the best source of real requirements.

---

## 4. Prompt templates (copy, replace the `<…>`)

### 4.1 Session start (paste first in every new session)
```
You are working on Hiep Trong Space. Before doing anything:
1. Read md/agent_readme.md fully, then md/progress.md.
2. Read only the parts of md/human_readme.md and md/ui_readme.md relevant to the current epic.
3. Run `git status` and tell me the current branch.
Then reply in at most 5 lines: current epic, what you will do first, what you will NOT touch. Do not write code yet.
```

### 4.2 Epic start (right after 4.1)
```
Current epic: Epic <n> – <name>.
Branch: epic/<n>-<slug> (create it from main if it does not exist).
Scope: exactly what md/agent_readme.md lists for this epic. Nothing else.
First, give me a numbered plan (max 12 steps) with the files you will create or change. Wait for my "go" before coding.
```

### 4.3 Plan approval
```
Go, with these changes: <changes or "none">.
Work step by step. After each step, run `npm run check` and tell me the result in one line. Stop and ask if something is ambiguous or needs a dependency or system tool.
```

### 4.4 Continue after a pause or mid-epic
```
Continue Epic <n>. Re-read md/progress.md to see where we are. Do the next unfinished step only: <step or "the next one in the plan">. Report using the format in agent_readme.md §14.2 when done.
```

### 4.5 Review request (ask the agent to self-audit before you review)
```
Epic <n> looks finished. Before I review, audit your own work against the "Definition of done" in md/agent_readme.md §15. List every unchecked item and every place where you deviated from the spec. Do not fix anything yet. Also update md/progress.md.
```

### 4.6 Bug report
```
Bug in <page/feature>.
Steps: 1) … 2) … 3) …
Expected: …
Actual: … (add error text or a screenshot description)
Please: (a) explain the likely cause in 3 lines, (b) write a failing test if it is logic, (c) fix only this bug, (d) run `npm run check`, (e) list the files you changed. Do not refactor unrelated code.
```

### 4.7 Scope fence (use when the agent starts doing extra things)
```
Stop. That is outside Epic <n>. Revert those extra changes (only the ones from this session) and put the idea under "Ideas" in md/progress.md instead. Then continue with the planned step.
```

### 4.8 Change request (you changed your mind about behaviour)
```
I want to change this behaviour: <before → after>. 
1) Tell me which documents and files this affects. 
2) Propose the smallest change. 
3) Wait for my "go". If it contradicts md/human_readme.md, tell me which sentence and I will update the document myself.
```

### 4.9 Dependency or tool request (the agent must ask; this is your answer)
```
Approved: install <package> for <reason> (project-level only). Commit it separately as chore(deps).
```
```
Not approved. Find a way without it, or explain the cost of avoiding it.
```

### 4.10 "You are off track" (see §11 for the full ladder)
```
Stop. Do not make further changes. List: (1) what you changed in this session (files), (2) what you were trying to do, (3) what is broken now. Then wait.
```

### 4.11 Context handoff (when a session gets long or confused)
```
We will continue in a new session. Update md/progress.md so a fresh agent can continue without this chat: current epic and branch, what is done, what is half-done (with file names), decisions made, known issues, the next 3 steps. Then commit it with `docs: update progress`.
```

### 4.12 Closing an epic
```
Epic <n> accepted. Final tasks: update md/progress.md (mark done, date), make sure everything is committed on the epic branch, and give me the exact git commands to merge it. Do not merge and do not start the next epic.
```

---

## 5. How to plan and write a good task prompt

Break big work into pieces that fit this rule: **one outcome you can verify in under 5 minutes, touching ≤ ~8 files.**

A good prompt has five parts:
1. **Goal** — one sentence, observable ("A task past its deadline turns coral in the Today column").
2. **Where** — which files/folders, or "find them yourself, but tell me first".
3. **Rules** — which spec sections apply ("agent_readme §6.5", "ui_readme Task UI").
4. **Done when** — a visible check you can do.
5. **Don't** — what to leave alone.

Example:
```
Goal: completing a task moves its card to the bottom of the day list with a smooth animation, strikethrough and italic title.
Rules: agent_readme §6.4 (sorting) and §9.1 (TaskCard); ui_readme "Task States".
Done when: ticking a task in Today animates it to the bottom; unticking returns it; the "N done" counter updates.
Don't: change the TaskForm, the API contract, or any colours.
```

Avoid prompts like "make the tasks nicer" or "finish everything for Daily". They invite guessing.

---

## 6. Session checklists

### Before a session
- [ ] Last epic merged (or you consciously continue on the epic branch).
- [ ] `git status` is clean (`git status` shows nothing to commit), or you know why not.
- [ ] You know the **one** outcome you want from this session.
- [ ] (After Epic 2) You made a backup of `data\` if you changed the database schema (§13).

### During a session
- [ ] The agent made a plan and you approved it.
- [ ] Each step ends with `npm run check` green.
- [ ] You read every question the agent asks; you answer with a decision, not "whatever".
- [ ] Any new package: did you approve it? (`git diff package.json` shows it.)
- [ ] The session is not drifting: if it talks about things outside the epic, use §4.7.

### After a session
- [ ] Agent reported in the short format and updated `md/progress.md`.
- [ ] You ran the checks and the manual test script for this epic (§7).
- [ ] Changes are committed on the epic branch.
- [ ] You wrote down any new idea or requirement in `sources.txt` (your private notes).

---

## 7. How to verify an implementation

### 7.1 Automatic checks (always)
```powershell
npm run check          # lint + typecheck + tests
npm run build          # production build must succeed (before merging an epic)
```
Green output is necessary, not sufficient. Tests only check what the agent thought to test, so do the manual script too.

### 7.2 Manual test scripts (5–10 minutes per epic; start the app with `npm run dev`, open http://localhost:3000)

**Epic 0 — Foundation:** open `/api/health` → shows ok; a `data` folder with a `.db` file appears; `git status` does not list `data` or `.env`.

**Epic 1 — Shell:** open every route in the Universe menu (`Ctrl+K`); each shows its title and "This space is waiting to be built."; tab through with the keyboard; resize the window to phone width.

**Epic 2 — Daily tasks:**
1. Add a task in Today (deadline 23:59) and one in Tomorrow. Try an empty title and a past deadline → clear messages.
2. Add an Urgent pinned task → it jumps to the top of Today.
3. Tick a task → strikethrough, italic, glides to the bottom; "N done" goes up. Untick → returns.
4. Create a task due in 2 minutes; wait → it turns coral and appears in the Overdue list. Transfer it to Tomorrow → it leaves Overdue.
5. Three-dot menu → Edit, change the title, save. Delete a task → confirmation appears.
6. Switch to Week and Month → no Add button; counts look right. Reload the page → everything is still there.

**Epic 3 — Hub:** the Hub lists the same tasks; complete one in Daily → it leaves the Hub list (and shows under "Show completed"); delete one in Hub → gone in Daily; create one in Hub → expand it → "Add to Tomorrow" → it appears in Tomorrow.

**Epic 4 — Notifications:** create a task due in ~2 minutes → within the window you get **Due Soon** (at the quarter-time moment) then **Overdue** at the deadline, once each. Bell dot and count update; tick the read box → dot disappears; "Mark all as read" works; Esc and outside click close the popover; opening it does **not** play any rocket animation. Stop the server, wait past a reminder, start again → you get the missed notification, not duplicates.

**Epic 5 — Homepage:** stars move continuously with depth; text is readable; wordmark looks designed (not a plain heading); reduce motion in Windows (Settings → Accessibility → Visual effects → Animation effects off) → stars become still; hover "Let's go" → text becomes an arrow smoothly; click → smooth scroll; shrink to 360 px width → no sideways scrollbar.

**Epic 6 — Feature Collection:** Horizontal: scroll down → section pins, cards slide left, scroll up → reverses, section releases at both ends; 13 cards reachable. Vertical: two columns, seven rows (13 cards → last row has one), no pinning or blank space. Toggle repeatedly while scrolled in the middle → you never get stuck. Test at tablet and phone width.

**Epic 7 — Cosmic Launch:** click a feature card → rocket journey (~3 s) then the page appears; double-click quickly → only one transition; browser Back → quick fade, works; click "Let's go" and the bell → no rocket; same-page links → no rocket; (ask the agent for a way to simulate a slow page) → overlay waits and never shows a half-loaded page.

### 7.3 Look for these "silent failures"
Data lost after reload; a task shown differently in Daily and Hub; a reminder created twice; the page scrolling sideways; the console (F12 → Console) showing red errors; the fan spinning while the homepage idles (performance problem).

---

## 8. Code review procedure (≈10–15 minutes per epic)

You said you can read the code, so use that, but efficiently. Do not read everything. Follow this order.

**Step 1 — Size and shape**
```powershell
git diff --stat main
```
Does the list of files match the epic? Anything surprising (config files, other features, `md\`)? That is the first red flag.

**Step 2 — Dependencies and secrets**
```powershell
git diff main -- package.json
git diff main --name-only | Select-String "\.env|secret|key"
```
Every new dependency must be in the agreed list or approved by you. No `.env` in the diff.

**Step 3 — Architecture boundaries** (these must print **nothing**)
```powershell
# UI must not reach services, server or storage
Select-String -Path (Get-ChildItem src\features,src\ui -Recurse -Include *.ts,*.tsx) -Pattern "services/|@/server|better-sqlite3|drizzle|node:fs|from 'fs'"

# No file or DB access outside the storage layer
Select-String -Path (Get-ChildItem src -Recurse -Include *.ts,*.tsx | Where-Object { $_.FullName -notmatch "services\\storage" }) -Pattern "node:fs|from 'fs'|better-sqlite3|drizzle-orm"

# Environment variables read only in config.ts
Select-String -Path (Get-ChildItem src -Recurse -Include *.ts,*.tsx | Where-Object { $_.Name -ne "config.ts" }) -Pattern "process\.env"
```

**Step 4 — Design discipline** (must print nothing outside `tokens.css`)
```powershell
Select-String -Path (Get-ChildItem src -Recurse -Include *.ts,*.tsx,*.css | Where-Object { $_.Name -ne "tokens.css" }) -Pattern "#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\("
```

**Step 5 — Read the important files** (10 minutes): the domain rule files (`src\domain`), the service for this epic (`src\services`), and one UI component. Ask yourself:
- Is the logic in `domain`/`services` rather than inside a React component?
- Are there tests for the tricky rules (boundaries, time)?
- Any `any`, `// TODO`, commented-out code, or `console.log`?
- Does each function do one thing and have a clear name?

**Step 6 — Ask the agent about what you do not understand**
```
Explain <file>:<function> in 5 lines for someone who knows TypeScript but not this project. Why is it written this way?
```

**Step 7 — Run the manual script (§7.2)**, then decide: merge, or send back with a precise list of fixes.

**Red flags that mean "send it back":** changes outside scope; tests deleted or weakened; lint rules disabled; hard-coded colours; copied-and-pasted second task component; business logic inside route handlers; time read directly with `new Date()` in domain/services; unexplained new dependencies.

---

## 9. Git management

**Mental model:** `main` = accepted, working versions only. `epic/...` branch = work in progress. The agent commits only on epic branches. You merge.

```powershell
git status                          # what changed?
git branch --show-current           # where am I?
git log --oneline -15               # recent history
git diff                            # uncommitted changes
git diff --stat main                # what this branch changes vs main
```

**Accept an epic (after review and tests):**
```powershell
git switch main
git merge --no-ff epic/2-daily-tasks -m "Merge epic 2: daily tasks"
git tag epic-2-done
```
Tags are your save points. List them with `git tag`.

**Start the next epic:** ask the agent (it runs `git switch -c epic/3-hub` from main), or do it yourself.

**Backup of the whole repo:** copy the folder to an external drive or a private remote later. (Pushing to GitHub is optional; if you do, use a *private* repo and never commit `.env` or `data\`.)

---

## 10. Handling bugs

1. **Reproduce it yourself** and write the steps (§4.6 template).
2. **Classify:** *logic* (wrong overdue, wrong order, duplicate notification) → needs a test; *visual* (spacing, colour) → screenshot + "compare with ui_readme section X"; *environment* (install, port) → copy the exact error text.
3. Send **one bug per prompt**.
4. Insist on: cause in plain words → failing test (for logic) → minimal fix → `npm run check` → list of changed files.
5. After the fix, re-run the manual script for that area. Bugs love to move.
6. If two attempts fail, §4.10 and §11.

Useful things to give the agent: the exact error text, what you clicked, the URL, and (for browser errors) the red lines from F12 → Console. For bad data: tell it what you saw; **never** let it delete the database to "fix" something. Back up first (§13).

---

## 11. Recovery ladder — when the agent goes off track

Try the lightest step that works.

| Level | Situation | Action |
| --- | --- | --- |
| 1 | Small drift | Use §4.7 (scope fence) or §4.10 (stop and list changes) |
| 2 | Uncommitted mess in a few files | `git restore <file>` (one file) or `git restore .` (everything uncommitted, tracked files) |
| 3 | Also junk new files | `git clean -n` (preview!) then `git clean -fd`. Check the preview does not list `data\` or anything you want |
| 4 | Several bad commits on the epic branch | `git log --oneline` → pick the last good commit → `git reset --hard <hash>` (only on the epic branch, never on `main`) |
| 5 | Everything is tangled | `git switch main`, `git branch -D epic/<n>-<slug>`, start the epic again with a smaller scope and a better plan |
| 6 | Agent is confused (repeats itself, ignores rules) | §4.11 handoff, **new session**, §4.1 + §4.4 |
| 7 | Lost work you actually wanted | `git reflog` shows recent positions; `git switch -c rescue <hash>` |

To keep a half-done attempt while experimenting: `git stash` (park) and `git stash pop` (restore).

**Why it goes off track (and the cure):** the prompt was too big (split it); the session is too long (new session); the spec was ambiguous (answer the question in the docs); the model needs a smaller step (ask for the plan with ≤ 5 steps).

---

## 12. Preserving context across sessions

Agents forget between sessions. Your protection is **files**, not chat history.

- `md/progress.md` is the memory. The agent updates it at the end of every session; you check it. If a decision matters, it must be in `progress.md` or in a document, not only in chat.
- **One epic = one fresh session.** Within a long epic, start a new session after ~1–2 hours or when the agent seems to lose track, using §4.11 then §4.1.
- **Never paste whole files** into chat when the agent can read them. Name the file or section instead: "see md/agent_readme.md §6.5".
- **Put decisions where they belong:** behaviour → `human_readme.md` (you edit; remember `attrib -R`), technical rules → ask the agent to propose an edit to `agent_readme.md`, then you approve it.
- **Keep your private notes** in `sources.txt`; the agent never reads it.
- When you change your mind about a rule, update the document first, then tell the agent to re-read that section. A rule that exists only in chat will be forgotten.

---

## 13. Data safety and backup

All your data lives in `data\` (the SQLite file plus uploaded media). Back it up:

```powershell
New-Item -ItemType Directory -Force backups | Out-Null
Copy-Item -Recurse -Force data ("backups\data-" + (Get-Date -Format "yyyyMMdd-HHmm"))
```
Stop the app first (Ctrl+C in the terminal running `npm run dev`) so the file is not mid-write. Ask the agent in Epic 0 to also ignore `backups/` in `.gitignore` (add `backups/` yourself if it is missing).

**Restore:** stop the app, rename the current `data` to `data-broken`, copy the backup folder back as `data`.

**Always back up before:** a schema migration after Epic 2, an Epic that changes how tasks are stored, or any prompt that mentions "delete", "reset", "clean", "migrate".

---

## 14. Preventing unauthorised changes

- **Permissions are written down** (agent_readme §3). Remind the agent in prompts when relevant: "Ask before adding any dependency."
- **Read-only protection** for your documents (§2.2) so the agent cannot silently rewrite them.
- **After every session:** `git diff --stat main` and `git diff main -- package.json`. Anything you did not expect → §8 red flags.
- **System changes:** the agent must not install Node, Git, build tools, change PATH or settings, or leave the project folder. If it asks you to run a command, read it first. Never run `curl … | sh`-style commands suggested by anyone.
- **Secrets:** if you ever add an API key, it goes in `.env` only. If the agent writes one into code, stop and rotate the key.
- **Terminal approval:** if the IDE lets you choose between "always allow" and "ask before running commands", use **ask** during early epics; relax later if you trust the pattern.
- **Branch discipline:** if you see the agent on `main`, stop it (§4.10) and ask why.

---

## 15. Minimising token and time consumption

- **Short, specific prompts** (§5). Long vague prompts cost more and give worse results.
- **Plan first, code second.** A 12-line plan is cheaper than re-doing 600 lines.
- **Point to sections, not content:** "agent_readme §9.9" instead of pasting text.
- **Ask for short reports** (the format in §14.2 of the agent doc). Say "no long explanations" if it rambles.
- **Small diffs:** one outcome per prompt, so the agent reads few files.
- **Fresh sessions per epic** prevent paying for a huge, stale history.
- **Avoid re-reading:** the session start prompt tells the agent to read only relevant sections of the long documents.
- **Stop retry loops:** after two failed attempts, ask for a diagnosis instead of a third blind try.
- **Use the cheaper model for mechanical work** (formatting, renames, simple components) and the stronger one for planning, architecture and tricky logic, if your IDE lets you switch.
- **Batch your own thinking:** write all your feedback on a screen in one message ("1… 2… 3…") rather than five separate prompts.

---

## 16. Quick reference

| I want to… | Do this |
| --- | --- |
| Start the app | `npm run dev` → http://localhost:3000 |
| Stop the app | Ctrl+C in that terminal |
| Run all checks | `npm run check` |
| See what changed | `git status`, `git diff --stat main` |
| Undo uncommitted work | `git restore .` (and `git clean -n` to preview untracked files) |
| Save a good state | merge the epic, then `git tag epic-N-done` |
| Back up data | §13 |
| New session | §4.11 handoff → new chat → §4.1 → §4.4 |
| Agent wants a tool installed | Run the command yourself (§2.1), then tell it "installed" |
| Port 3000 in use | `npm run dev -- -p 3001` |
| Change a behaviour | §4.8, then edit `human_readme.md` yourself |

**Golden rules:** one epic at a time · plan before code · review before merge · commit often · back up `data\` · docs are the memory · when unsure, stop and ask.
