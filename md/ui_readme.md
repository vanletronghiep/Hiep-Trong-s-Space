# ui_readme.md — Hiep Trong Space: UI/UX Design Specification

Authority: this is the single, consolidated visual and interaction specification. It replaces the previous `ui_readme.md`. The previous file mixed a generic marketing-template "design language" (white canvas, Signifier font, blue accent) with your own detailed specs (dark cosmos homepage, lavender task workspace). Your own specs are the **primary source** here; the generic template contributed only craft rules and a few reusable component ideas.

Related documents: `human_readme.md` (behaviour), `agent_readme.md` (architecture, code rules). If this file and `agent_readme.md` disagree about a **visual** detail, this file wins; about **architecture**, `agent_readme.md` wins.

---

## 0. How to read this file

### 0.1 Structure
| Part | Section | Purpose |
| --- | --- | --- |
| A | 1 Identity and principles | What the product should feel like |
| A | 2 Tokens | The only colours, fonts, spacing, radii, shadows, motion values allowed |
| A | 3 Typography | Fonts and type scale |
| A | 4 Motion system | Allowed and forbidden motion, timings |
| A | 5 Imagery | Thumbnails and artwork rules |
| A | 6 Craft rules (anti-slop) | Hard guardrails |
| A | 7 Responsive system | Breakpoints and behaviour rules |
| A | 8 Accessibility | Baseline for every surface |
| B | 9 Shared components | Buttons, chips, segmented control, inputs, dialog, drawer, popover, toast, empty state |
| C | 10 Homepage | Hero, wordmark, starfield, top-right controls |
| C | 11 Feature Collection | Horizontal and vertical modes, cards |
| C | 12 Cosmic Launch | Page transition |
| C | 13 Workspace shell and Blank Pages | Frame for all inner pages |
| C | 14 Task UI | Task card, forms, Daily board, Overdue list, Hub |
| C | 15 Notification center | Bell and popover |
| D | 16 Quality gates | Checklists before calling any UI done |
| D | 17 Conflict resolutions | What was ambiguous and how it was decided |

### 0.2 Two themes, one family
- **Cosmos (dark):** the homepage, the Feature Collection, and the Cosmic Launch overlay. Immersive, quiet, typographic.
- **Workspace (light lavender):** every working page (tasks and all other pages), drawers, dialogs, and the notification popover. Bright, organised, comfortable for daily use.
- They are visually related through shared typefaces, the four-point star motif, pill geometry, restrained motion and lavender accents. Never put large dark surfaces on workspace pages; never put a white page on the homepage.

### 0.3 Precedence inside this file
Specific surface section (10–15) > Shared components (9) > Principles (1). Tokens (2) are always the only allowed values.

---

# Part A — Foundations

## 1. Identity and principles

**Core idea:** *Hiep Trong Space should look like a personal universe expressed through typography.* Impress through the precision of the few elements that remain, not through the quantity of elements.

Principles (applied in order when in doubt):
1. **Typography is the artwork.** Whitespace is the atmosphere. Simplicity is the personality.
2. **Quiet, never empty.** Minimalism is precision: every element has a purpose and an exact position.
3. **Cosmic by detail, not by decoration.** The space theme lives in the name, the starfield, a tiny four-point star, soft lavender accents and orbit-like hairlines. No planets, rockets-as-decoration, astronauts, nebula blobs or "stars everywhere".
4. **Light, calm motion.** Everything moves with soft easing, short durations, and has a reduced-motion equivalent. The page must stay elegant with all animation disabled.
5. **Consistency over novelty.** Shared tokens and components; no per-page one-offs.
6. **Not a generic SaaS or dashboard.** No hero-with-gradient-blobs, equal icon-grids, heavy borders, glassmorphism stacks, neon.

**The star motif (signature detail):** a minimalist four-point star (SVG below). Used sparingly: once in the hero wordmark, once beside inner-page headings, in empty states, and as the favicon. Never on every card or list item.

```svg
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path fill="currentColor" d="M12 0C12.8 7.2 16.8 11.2 24 12C16.8 12.8 12.8 16.8 12 24C11.2 16.8 7.2 12.8 0 12C7.2 11.2 11.2 7.2 12 0Z"/>
</svg>
```

---

## 2. Design tokens (the closed palette)

**Rule:** every colour, shadow, radius, spacing, z-index and motion value in the product comes from this section via CSS variables in `src/design/tokens.css`. No raw hex/rgb/hsl in components. Tints are made with `color-mix()` from these tokens (that is allowed and is not a new colour). If something is missing, add a token here first.

```css
:root {
  /* ─── Cosmos theme (homepage, Feature Collection, Cosmic Launch) ─── */
  --cosmos-bg-0: #05080D;         /* almost black: base */
  --cosmos-bg-1: #071321;         /* deep midnight blue */
  --cosmos-bg-2: #09182A;         /* dark navy */
  --cosmos-navy-0: #090D20;       /* midnight navy — ambient tint only, ≤ 6% */
  --cosmos-navy-1: #10152B;       /* deep navy — ambient tint only, ≤ 6% */
  --cosmos-text: #F4EFFF;         /* soft white: wordmark, titles, buttons */
  --cosmos-text-muted: #A5A5B8;   /* secondary gray: supporting text, labels */
  --cosmos-lavender: #A78BFA;     /* tiny highlights: star, active states */
  --cosmos-star-white: #FFFFFF;
  --cosmos-star-blue: #A9CFFF;    /* icy blue stars, engine glow */
  --cosmos-star-pale: #CFE3FF;    /* pale blue stars */
  --cosmos-engine-glow: #A9CFFF;
  --cosmos-exhaust: #A99AEF;      /* restrained lavender exhaust highlight */

  /* ─── Workspace theme (all working pages, popover, drawers, dialogs) ─── */
  --ws-bg: #F0EFF8;               /* workspace background */
  --ws-surface: #FFFFFF;          /* task boxes, popover, drawer */
  --ws-text: #29263B;             /* primary text */
  --ws-text-muted: #777387;       /* secondary text */
  --ws-accent: #A99AEF;           /* primary accent (fills, borders, icons) */
  --ws-accent-soft: #DCD5F1;      /* secondary accent (chips, hover fills) */
  --ws-border: #E9E5F2;           /* hairline borders */

  /* ─── Status (shared) ─── */
  --status-overdue: #D77F85;      /* muted coral */
  --status-completed: #9A8BCB;    /* task completed state */
  --status-due-soon: #D7A45D;     /* warm amber */
  --status-notif-completed: #8FB8A0; /* soft sage: notification "Completed" tag (proposed value) */
  --status-system: #A5A5B8;       /* neutral gray: notification "System" tag */

  /* ─── Derived (computed, not new colours) ─── */
  --ws-focus: color-mix(in srgb, var(--ws-accent) 55%, var(--ws-text));
  --cosmos-focus: var(--cosmos-lavender);
  --ws-scrim: color-mix(in srgb, var(--ws-text) 28%, transparent);
  --tint-overdue-bg: color-mix(in srgb, var(--status-overdue) 8%, var(--ws-surface));
  --tint-overdue-border: color-mix(in srgb, var(--status-overdue) 45%, var(--ws-border));
  --text-overdue: color-mix(in srgb, var(--status-overdue) 55%, var(--ws-text));
  --text-due-soon: color-mix(in srgb, var(--status-due-soon) 50%, var(--ws-text));
  --text-completed: color-mix(in srgb, var(--ws-text-muted) 80%, var(--ws-surface));

  /* ─── Typography ─── */
  --font-display: "Cormorant Garamond", ui-serif, Georgia, serif;
  --font-ui: "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
  /* no monospace token: monospace is not used */

  --fs-wordmark-space: clamp(3.25rem, 14vw, 11rem);
  --fs-wordmark-signature: clamp(1.5rem, 3.4vw, 2.75rem);
  --fs-display: clamp(2.25rem, 4vw, 3.25rem);    /* section titles on cosmos */
  --fs-h1: clamp(1.75rem, 2.6vw, 2.25rem);       /* workspace page titles */
  --fs-h2: clamp(1.25rem, 1.8vw, 1.5rem);
  --fs-card-title: clamp(1.5rem, 2.4vw, 2.125rem);/* feature card titles */
  --fs-body: 1rem;            /* 16 */
  --fs-ui: 0.875rem;          /* 14 */
  --fs-small: 0.8125rem;      /* 13 */
  --fs-micro: 0.75rem;        /* 12: tags, timestamps */
  --lh-tight: 1.05; --lh-heading: 1.15; --lh-body: 1.6; --lh-relaxed: 1.7;
  --ls-wordmark: 0.22em; --ls-wordmark-mobile: 0.12em; --ls-support: 0.02em;

  /* ─── Spacing (4-px base) ─── */
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
  --space-5: 1.5rem; --space-6: 2rem; --space-7: 3rem; --space-8: 4rem;
  --space-9: 6rem;    --space-10: 8rem;
  --gutter: 1.25rem;                 /* page side padding < 1024 */
  --gutter-lg: 2.5rem;               /* ≥ 1024 */
  --max-content: 80rem;              /* 1280: workspace, feature collection */
  --max-narrow: 36rem;               /* supporting copy */

  /* ─── Radii ─── */
  --radius-pill: 999px;
  --radius-card: 16px;      /* feature thumbnails, popover, drawer corners */
  --radius-task: 14px;      /* task boxes (12–18 allowed range) */
  --radius-item: 12px;      /* compact notification items, inputs, buttons */
  --radius-sm: 8px;

  /* ─── Shadows (all derived from ink tokens) ─── */
  --shadow-task: 0 1px 2px color-mix(in srgb, var(--ws-text) 4%, transparent),
                 0 4px 14px color-mix(in srgb, var(--ws-text) 4%, transparent);
  --shadow-task-hover: 0 2px 4px color-mix(in srgb, var(--ws-text) 5%, transparent),
                       0 10px 28px color-mix(in srgb, var(--ws-text) 9%, transparent);
  --shadow-popover: 0 2px 6px color-mix(in srgb, var(--cosmos-bg-0) 18%, transparent),
                    0 18px 48px color-mix(in srgb, var(--cosmos-bg-0) 32%, transparent);
  --shadow-drawer: -8px 0 40px color-mix(in srgb, var(--ws-text) 14%, transparent);

  /* ─── Layout / layers ─── */
  --topbar-h: 56px;
  --z-bg: 0; --z-content: 10; --z-nav: 30; --z-popover: 40; --z-drawer: 50; --z-toast: 60; --z-transition: 100;

  /* ─── Motion ─── */
  --dur-instant: 100ms; --dur-fast: 150ms; --dur-base: 250ms; --dur-slow: 400ms; --dur-reveal: 700ms; --dur-hero: 900ms;
  --ease: cubic-bezier(0.22, 0.61, 0.36, 1);          /* default smooth */
  --ease-in: cubic-bezier(0.5, 0, 0.9, 0.4);          /* acceleration (spacecraft) */
  --blur-enter: 4px; --y-enter: 12px;
}
```

Notes:
- Near-duplicate values in your specs were merged: `#F4F2FF` (button, spacecraft) → `--cosmos-text #F4EFFF`; transition background `#080E1B` → `--cosmos-bg-0`; the accent `#A99AEF` is kept as `--ws-accent` (workspace) and `--cosmos-exhaust` (spacecraft).
- `--cosmos-navy-0/1` (`#090D20`, `#10152B`) are kept only as very faint ambient tints (≤ 6% mix) to avoid contradicting the near-black starfield base.
- Proposed values you did not specify: `--cosmos-star-pale`, `--status-notif-completed` (sage). Change them here if you want something else.
- **Contrast rule:** `--ws-accent` and `--ws-accent-soft` are for fills, borders, icons and large shapes. Text on the workspace uses `--ws-text` or `--ws-text-muted`. Status text uses the derived `--text-*` tokens. Verify ≥ 4.5:1 for text and ≥ 3:1 for meaningful non-text graphics.

---

## 3. Typography

| Role | Face | Weight / style | Size token | Notes |
| --- | --- | --- | --- | --- |
| Wordmark "SPACE" | Cormorant Garamond | 300–400, uppercase | `--fs-wordmark-space` | tracking `--ls-wordmark`, line-height 0.9 |
| Wordmark "Hiep Trong" | Cormorant Garamond | 400 italic | `--fs-wordmark-signature` | the personal signature |
| Display / section titles (cosmos) | Cormorant Garamond | 300–400 | `--fs-display` | tight tracking −0.01em |
| Workspace page titles | Cormorant Garamond | 400–500 | `--fs-h1` | one per page |
| Feature card titles | Cormorant Garamond | 400 | `--fs-card-title` | |
| Everything else (UI, body, tasks, buttons, notifications) | Inter | 400 / 500 / 600 | `--fs-body`, `--fs-ui`, `--fs-small`, `--fs-micro` | |

Rules:
- Self-hosted via `next/font` with `display: swap` and metric-matched fallbacks (no layout shift, no remote font requests). Reason: free tools only and offline-friendly local use.
- Sentence case everywhere. The **only** uppercase text is the wordmark "SPACE". No all-caps nav, buttons, labels, tags, or eyebrows.
- No monospace anywhere. Use `font-variant-numeric: tabular-nums` on times, counts and durations.
- Tasks, forms, popover and tables use Inter; Cormorant appears only for titles/wordmark so dense UI stays highly legible.
- Supporting text min 14px (13px only for metadata, 12px only for tag/timestamp micro-text).
- Body line length ≤ ~65 characters (`--max-narrow` for supporting copy).
- Curly quotes and a true em dash in copy. `white-space: nowrap` on buttons and nav labels.

---

## 4. Motion system

### 4.1 Allowed vocabulary
| Name | Use | Spec |
| --- | --- | --- |
| Blur-fade enter | First appearance of blocks (hero text, section headings, cards on scroll) | opacity 0→1, `translateY(var(--y-enter))→0`, blur `var(--blur-enter)→0`, `--dur-reveal`, `--ease`; staggered 100–150 ms steps; once per element |
| Hero entrance | Homepage load | wordmark fades in (`--dur-hero`), supporting text +300 ms, star +600 ms, top-right controls +900 ms; opacity only (+ optional ≤ 8 px rise) |
| Crossfade | Tab/mode content swaps | opacity 250 ms |
| Hover shifts | Links, pills, cards | colour/opacity/border changes 150–200 ms; workspace cards lift ≤ 2 px |
| Layout animation | Task reordering, list insert/remove | 250–300 ms, spring-free ease (`motion` layout) |
| Popover | Notification panel | open 220 ms (fade, +8 px down, scale .98→1); close 170 ms (fade, −6 px, scale 1→.99) |
| Drawer / dialog | Task editor, confirmations | slide/fade 250 ms in, 180 ms out |
| Scroll-linked | Horizontal feature gallery | transform tied 1:1 to scroll progress (see 11) |
| Cosmic Launch | Internal page navigation | ~3 s sequence (see 12) |

### 4.2 Forbidden
Bounce, elastic or overshoot easing; `transition: all`; blanket `hover:scale`; spinning; shaking; looping decorative animations (except the starfield); parallax beyond the specified starfield drift; animating width/height/top/left (use transform/opacity; use layout animation helpers for reorder).

### 4.3 Rules
- Stagger ≤ 150 ms steps; one motion "signature" per viewport region; never stack reveal + tab crossfade on the same element.
- Focus rings appear instantly (no transition).
- **Reduced motion (`prefers-reduced-motion: reduce`):** no blur, no translate; reveals become opacity-only or instant; starfield renders one static frame; horizontal pinned gallery becomes a native gallery; Cosmic Launch becomes a ≤ 300 ms crossfade; smooth scrolling becomes instant. Every surface must look finished with animation off.
- Pause continuous work (starfield) when the tab is hidden.

---

## 5. Imagery direction

- **Primary medium:** typography, CSS and inline SVG. No stock space photos. No large raster assets just to look sophisticated.
- **Feature thumbnails (13):** generated SVG/CSS compositions, 16:10, dark navy field from the cosmos gradient, fine constellation lines, one or two orbit arcs, a single four-point star, small tonal variation per feature (lavender vs icy-blue emphasis, different line arrangement) so each is recognisable. Thin inner ring `inset 0 0 0 1px color-mix(var(--cosmos-text) 10%, transparent)`. Each card has a `thumbnail` field so you can drop in your own image later.
- **Style fit:** minimal, technical, precise, calm.
- **Avoid:** anime, cartoon, watercolour, 3D-rendered planets or rockets, AI-art textures, surreal imagery, lifestyle photography, glowing nebula illustrations, emoji icons.
- **Icons:** one library only (`lucide-react`), stroke 1.5, 16–20 px, plus the custom star SVG. Colour `currentColor` from tokens.
- **Reference images:** your earlier "reference images" were not supplied. Implement from the written specs here; if you add images to `md/refs/`, compare against them during Epic 5–6 review.

---

## 6. Craft rules (anti-slop) — mandatory

1. **Closed palette.** Only section-2 tokens. No default greys, extra purples/blues, neon, strong glows.
2. **No decorative gradients as design.** Allowed gradients: the cosmos base (bg-0→bg-2), very low-opacity radial ambient lights, a faint lavender wash at the top of the workspace, and the exhaust trail. All stops from tokens.
3. **Surfaces:** workspace cards are white with a hairline border and very subtle shadow. No glassmorphism stacks, no card-inside-card, no heavy borders, no neon outlines.
4. **Shape language:** pills for actions, tabs, chips, tags; 12–16 px radii for cards/inputs. Never over-rounded blobs.
5. **Casing:** sentence case (only "SPACE" is uppercase).
6. **No filler copy:** avoid "unleash", "elevate", "revolutionize", "seamless", "next-gen", fake brand names, fake stats, pseudo-technical status jargon, decorative system markers.
7. **No fake chrome:** no fake browser/phone frames, no `100vw` widths (use `100%`), no `z-index: 9999` (use tokens).
8. **Every element earns its place:** if removing it changes nothing, remove it.
9. **Consistent spacing:** use the spacing scale; align to a clear grid; keep alignment axes consistent.
10. **Stars:** at most one decorative star per region; never on task cards.

---

## 7. Responsive system

Build mobile-first; never just shrink the desktop layout.

| Name | Min width | Typical device |
| --- | --- | --- |
| base | 0 (design for 360) | phone |
| sm | 640 | large phone |
| md | 768 | tablet portrait |
| lg | 1024 | tablet landscape / laptop |
| xl | 1280 | desktop |
| 2xl | 1536 | large desktop |

Global rules:
- No horizontal page overflow at any width (test 320, 360, 768, 1024, 1280, 1440).
- Page gutter `--gutter` (< lg) and `--gutter-lg` (≥ lg); content max `--max-content`; centre it.
- Touch targets ≥ 44×44 px (visual size may be smaller; hit area may not).
- Hover-only interactions must have a keyboard/touch equivalent.
- Support dynamic viewport units (`svh`/`dvh`) and `env(safe-area-inset-*)` for fixed top-right controls.
- Fluid type with `clamp()`; supporting text never below 14 px (metadata 13 px, tags/timestamps 12 px).

Per-surface behaviour summary:

| Surface | base (<768) | md (768–1023) | lg+ (≥1024) |
| --- | --- | --- | --- |
| Hero wordmark | stacked, tighter tracking, centred | stacked, medium | spacious composition, signature overlaps SPACE |
| Feature Collection, Horizontal | native swipe gallery, 1 card/view | native gallery, 2 cards/view | pinned scroll-driven, 2 cards visible |
| Feature Collection, Vertical | 1 column | 2 columns | 2 columns |
| Daily board (Day view) | 3 tabs (Yesterday/Today/Tomorrow) | 3 tabs | 3 columns |
| Task editor | bottom sheet | right drawer 420px | right drawer 440px |
| Notification popover | full width − 2×16px | 380px anchored | 380px anchored |

---

## 8. Accessibility baseline

- Semantic HTML: `header`, `nav`, `main`, `section`, `button` for actions, `a` for navigation. One `h1` per page.
- Visible `:focus-visible` rings on everything interactive: cosmos `2px solid var(--cosmos-focus)` with 3 px offset; workspace `2px solid var(--ws-focus)` with 2 px offset. Never removed.
- Icon-only buttons have `aria-label`; toggles use `aria-pressed`/`aria-checked`; tabs use `role="tablist"` / `tab` / `tabpanel`; popover/dialog/drawer have roles, labels, focus trap (dialog/drawer) and focus return on close.
- Never rely on colour alone: overdue shows text "Overdue", due-soon shows text/dot + label, priority shows its word.
- Contrast: text ≥ 4.5:1 (large text ≥ 3:1), UI components and meaningful graphics ≥ 3:1.
- `aria-live="polite"` region for toasts and status changes ("Task completed").
- Keyboard: Tab order follows visual order; Esc closes overlays; Enter submits forms; `Ctrl+K` opens the Universe menu on workspace pages.
- Reduced motion per 4.3. Respect forced-colors where feasible (borders must not vanish).

---

# Part B — Shared components

Build once in `src/ui`, reuse everywhere. Names are for reference.

### 9.1 Buttons
| Variant | Cosmos theme | Workspace theme |
| --- | --- | --- |
| Primary | (not used on homepage) | fill `--ws-text`, text `--ws-surface`, radius `--radius-item`, height 40 (44 touch), weight 500; hover opacity .9 |
| Secondary | — | fill `--ws-accent-soft`, text `--ws-text`, hairline `--ws-border`; hover fill `color-mix(var(--ws-accent) 35%, var(--ws-surface))` |
| Ghost / icon | pill, transparent, border `color-mix(var(--cosmos-text) 22%, transparent)`, text `--cosmos-text`; hover border 45%, fill `color-mix(var(--cosmos-text) 8%, transparent)` | transparent; hover fill `--ws-accent-soft` |
| Destructive | — | text `--text-overdue`, hairline `--tint-overdue-border`; hover `--tint-overdue-bg` (confirm dialog shows a filled coral variant: bg `--status-overdue`, text `--ws-text`... verify contrast) |

One primary per cluster. Disabled = 45% opacity, no hover, `aria-disabled`.

### 9.2 Chips, badges, tags (pills)
Height 20–24, padding 0 10px, `--fs-micro`, weight 500, radius pill. Background = `color-mix(<token> 16%, var(--ws-surface))`, text = derived darker mix with `--ws-text` (≥ 4.5:1). Used for priority, notification category, counts.

### 9.3 Segmented control (pill)
Track: pill, background `color-mix(var(--ws-text) 4%, var(--ws-bg))`, hairline `--ws-border`, padding 4. Active segment: white (`--ws-surface`) pill indicator with soft shadow that slides (250 ms) under the label. Used for **Day | Week | Month** and **Priority**; a cosmos variant (`--cosmos-text` at 8% track, 14% active) is used for **Horizontal | Vertical**.

### 9.4 Inputs
Height 44, radius `--radius-item`, background `--ws-surface`, border `--ws-border`, text `--ws-text`, placeholder `--ws-text-muted`. Focus: border `--ws-focus` + 2 px ring. Error: border `--tint-overdue-border`, message below in `--text-overdue` with an icon (not colour only). Labels above inputs, sentence case, 14 px weight 500. Textarea auto-grows to 6 lines. Date input displays `DD/MM` with a calendar button; resolved full date shown beneath in muted 13 px.

### 9.5 Checkbox
20 px rounded square (radius 6), border 1.5 px `--ws-text-muted`; checked: fill `--status-completed` (darkened with `color-mix(… 20% var(--ws-text))` if needed to reach 3:1) and white tick drawn with a 200 ms stroke animation; hover ring `--ws-accent-soft`. Used for task completion and notification "read".

### 9.6 Dialog (confirm)
Centred, 400 px max, radius 16, surface white, scrim `--ws-scrim`, focus trapped, title (Cormorant 22 px or Inter 18 semibold), one-line body, buttons right-aligned (Cancel secondary, Delete destructive). Esc cancels. Enter does **not** trigger destructive action by default (focus starts on Cancel).

### 9.7 Drawer (task editor)
Right-side panel 440 px (420 at md), full-height, surface white, radius 20 on the left corners, `--shadow-drawer`, scrim `--ws-scrim`. Header (title + close), scrollable body, sticky footer (Cancel / Save). On < 768 px it is a bottom sheet (max-height 90dvh, radius 20 top). Slide 250 ms; focus moves to first field; returns to trigger on close.

### 9.8 Popover and menu
White surface, radius 12–16, hairline `--ws-border`, `--shadow-popover`, kept inside the viewport (flip/shift). Menu items 40 px tall, 8 px radius, hover `--ws-accent-soft`, destructive item uses `--text-overdue`.

### 9.9 Toast
Bottom-centre, white surface, hairline border, radius 12, 14 px text, optional action. 4 s auto-dismiss (errors persist until dismissed), `aria-live`. Never covers the primary action area on mobile.

### 9.10 Skeleton and empty states
- Skeleton: `--ws-accent-soft` at 50% blocks with a slow opacity pulse (no shimmer sweep, no spinner).
- Empty state: a small orbit illustration (two concentric 1 px circles in `--ws-accent-soft` with a tiny four-point star on one) ≈ 72 px, one calm sentence in `--ws-text-muted`, and an optional action. Examples: "No tasks for today.", "Nothing overdue.", "All caught up. Your universe is running smoothly."

---

# Part C — Surfaces

## 10. Homepage (dark cosmos)

### 10.1 Composition
A single spacious, full-viewport hero followed by the Feature Collection and a quiet footer. No navigation bar. The only fixed UI is the top-right pair (bell + "Let's go"). The visual focus is the wordmark; the starfield is atmosphere.

```
[ fixed top-right:  🔔(bell)  [ Let's go ] ]

                       ✦                 ← one small four-point star
                 Hiep Trong              ← italic signature, overlapping SPACE
              S P A C E                  ← dominant uppercase serif
        A space for everything I aspire to become.
        Ideas, projects, and ambitions — in one quiet place.

                (starfield everywhere behind)
```

Layout rules:
- Hero: `min-height: 100svh`, content centred on both axes; optical centre slightly above geometric centre (~ −3svh).
- Vertical rhythm: star → 1.25rem → wordmark block → 2.5rem → statement → 0.75rem → tagline. Large whitespace above and below; do not fill empty space.
- Background: starfield canvas (fixed, behind all content) over the base gradient `linear-gradient(180deg, var(--cosmos-bg-0), var(--cosmos-bg-1) 60%, var(--cosmos-bg-2))`.
- Subtle atmosphere: one or two radial lights at ≤ 6% opacity — icy blue (`--cosmos-star-blue`) in the upper-right area, and an almost imperceptible `--cosmos-navy-1` / lavender (≤ 4%) glow low-left. These must be barely noticeable and must not reduce text contrast.

### 10.2 Wordmark ("Hiep Trong" + "SPACE")
A custom typographic lock-up, not a heading with default styling.
- **"SPACE":** Cormorant Garamond 300–400, uppercase, `--fs-wordmark-space`, letter-spacing `--ls-wordmark` (`--ls-wordmark-mobile` below 480 px), line-height 0.9, colour `--cosmos-text`. Compensate for trailing letter-spacing (add equal left padding or negative right margin) so it is optically centred.
- **"Hiep Trong":** Cormorant Garamond italic 400, `--fs-wordmark-signature`, colour `--cosmos-text` at 90%, placed as a signature: left-aligned to the start of "SPACE" and overlapping its top-left by ~35% of the signature height (negative margin or absolute offset, `z-index` above SPACE). Must feel connected, never floating apart.
- **Star:** inline SVG, 14–18 px, `--cosmos-lavender`, centred above the lock-up (or as a tiny separator on the visual axis). Fades in last. One star in the hero (a second tiny one is allowed only if it improves balance).
- Real text, selectable; accessible name "Hiep Trong Space" (e.g. visually-hidden full name; the stylised pieces `aria-hidden`).
- Mobile: keep hierarchy (SPACE dominant); stack centred; reduce tracking; keep the signature overlap and star; no overflow at 320 px (SPACE size is clamped so 5 letters + tracking fit within `100% − 2×gutter`).

### 10.3 Supporting text
- **Statement:** "A space for everything I aspire to become." Inter 15–17 px, `--cosmos-text-muted`, letter-spacing `--ls-support`, line-height `--lh-relaxed`, max-width `--max-narrow`, centred.
- **Tagline (optional, smaller):** "Ideas, projects, and ambitions — in one quiet place." Inter 14 px, `--cosmos-text-muted` at 80%.
- Both are editable copy; keep them short, personal, non-corporate.

### 10.4 Entrance
Wordmark fades in (900 ms), statement +300 ms, tagline +450 ms, star +600 ms, top-right controls +900 ms. Opacity (and at most 8 px rise). No zoom, bounce, or spin. With reduced motion everything is simply visible.

### 10.5 Starfield (animated universe background)
**Goal:** an infinite, dense, dark starfield in continuous gentle forward motion with convincing 3D depth, closest to a "travelling through space" reference — never a flat twinkling dot field.

Rendering and performance (details of engineering are in `agent_readme.md` §9.7):
- HTML Canvas 2D, one `requestAnimationFrame` loop, delta-time movement, DPR capped at 2, fixed behind content, `pointer-events: none`, never causes overflow; no per-frame allocations; no React state per frame; pause when hidden; adapt quality to device.
- Star count: ≈ 2500 desktop, ≈ 1500 tablet, ≈ 800 phone (scaled by area/hardware); thousands of stars on desktop.

Visual spec:
- **Perspective:** stars exist in 3D volume; projection origin at viewport centre; each star moves toward the viewer and outward toward the edges; when it leaves the screen or gets too near it is recycled to the far field with new random properties. Motion is continuous and seamless; no visible resets.
- **Per-star variation:** position, size, brightness, opacity, colour, speed all differ. Most stars are tiny (≤ 1 px) and subtle; ~1–2% are brighter.
- **Colours:** mostly `--cosmos-star-white`; some `--cosmos-star-blue` and `--cosmos-star-pale`. No purple/pink particles.
- **Depth layers:** (1) distant — extremely small, low brightness, slow, densest; (2) mid — small white/blue, moderate brightness and speed; (3) near — slightly larger, brighter, faster, with occasional short streaks. Size and brightness increase as a star approaches.
- **Streaks:** only near stars (and a small percentage of mid stars) get short motion trails; rare; never "hyperspace".
- **Twinkle:** small, irregular alpha variation per star (not a uniform blink).
- **Speed:** slow and atmospheric — travelling gently, not warping. A speed multiplier exists for Cosmic Launch (default 1).
- **Optional cursor response:** the vanishing centre may shift by ≤ ~12 px, eased; disabled on touch devices; never makes stars chase the cursor.
- **Static fallback (reduced motion, or before first frame):** one pre-drawn frame using the same distribution (seeded), so the page looks identical but still.
- **Avoid:** planets, nebulae, galaxy swirls, shooting-star spam, falling-snow look, big glow, bloom.

### 10.6 Top-right controls
A single fixed cluster, `top: max(20px, env(safe-area-inset-top))`, `right: max(20px, env(safe-area-inset-right))` (16 px on phones), `z-index: var(--z-nav)`, flex row, gap 8–12 px, bell then "Let's go". No other navigation exists on the homepage.

**Bell:** 44×44 hit area, 20 px lucide `Bell` (stroke 1.5), colour `--cosmos-text` at 85%; hover: fill `color-mix(var(--cosmos-text) 8%, transparent)` and icon to 100%; unread dot 8 px `--status-overdue` with a 2 px ring in `--cosmos-bg-0` at top-right; optional count badge (pill, cap "9+") replacing the dot. (Popover design in section 15.)

**"Let's go" button:**
- Pill, height 40, padding 0 22 px, min-width equal to the label's width, border 1 px `color-mix(var(--cosmos-text) 22%, transparent)`, background transparent or `color-mix(var(--cosmos-bg-0) 40%, transparent)`, text `--cosmos-text`, Inter 14 px weight 500, `white-space: nowrap`. No icon in default state, no shadow, no glow.
- **Hover and `:focus-visible`:** label fades out and slides ~8 px right while a right-pointing arrow (lucide `ArrowRight`, 18 px) fades in sliding from ~10 px left to centre; 280 ms `--ease`; both stacked in the same grid cell so the button's size never changes; border to 45%, fill to 8%.
- **Touch / no-hover:** the label "Let's go" stays visible; the arrow may appear on `:active` only. Accessible name is always "Let's go".
- **Click:** smooth-scrolls to the Feature Collection (`#features`, with `scroll-margin-top`); instant when reduced motion; does not change the URL, reload, or play Cosmic Launch.

### 10.7 Footer
Small wordmark text ("Hiep Trong" italic) and a muted line of text, `--cosmos-text-muted` at 60%, generous top padding, no links, no imagery.

---

## 11. Feature Collection

### 11.1 Content and data
13 feature cards from **one** data source (`registry.ts`); both layouts consume the same array and order: Daily Task Management, Tasks Hub, Events, AI Engineering, Blogs Hub, APCS Hub, Flashcards, Entertainment Hub, Tracking, In Progress Projects, Annual Milestones, Learning Room, Personal Achievements. (Notifications are a popover, not a card.)

### 11.2 Section header
Cormorant display title "Explore the space" (`--fs-display`, `--cosmos-text`), muted one-line description (“Thirteen places, each with its own purpose.”), and the **Horizontal | Vertical** segmented control (cosmos variant) aligned right on desktop, below the title on mobile. Active segment clearly distinguished (filled pill + `aria-checked`/`aria-pressed`). Blur-fade enter on first view.

### 11.3 Feature card (identical in both modes)
Structure, top to bottom, no container background:
1. **Thumbnail:** 16:10 landscape, radius `--radius-card`, inner hairline ring, generated artwork (section 5).
2. **Category label:** Inter 13 px, `--cosmos-text-muted`, sentence case (e.g. "Tasks", "Learning", "Tracking", "Personal"), margin-top 16 px.
3. **Title:** Cormorant `--fs-card-title`, `--cosmos-text`, line-height 1.1, margin-top 4 px.
4. **Arrow indicator:** small `ArrowUpRight` (18 px) at the end of the title row, 60% opacity, 100% on hover.
- The whole card is one link (`TransitionLink`) with a clear focus ring (`--cosmos-focus`, radius matching the thumbnail).
- **Hover/focus:** thumbnail brightness 1.00→1.06 and scale ≤ 1.02 (image only, clipped by the radius), arrow nudges 2 px up-right, title colour to `color-mix(var(--cosmos-text) 100%, var(--cosmos-lavender) 12%)`. Transitions 200–300 ms. No border glow, no big shadow.
- Card never changes design between modes.

### 11.4 Horizontal mode (immersive, scroll-driven) — desktop ≥ 1024 px, fine pointer, motion allowed
- The section is a tall scroll container; inside it a **sticky, full-viewport pinned stage** holds the header and a horizontal **track** of cards. Vertical scrolling translates the track right-to-left in proportion to scroll progress (continuous, no snapping, no hijacking, perfectly reversible).
- Initially **two large cards are visible** side by side. Card width = `min((content − gap) / 2, (100svh − header − text-block) × 1.6)` so image + text always fit in the viewport; gap 24 px (`--space-5`); both cards vertically aligned; the pair is horizontally centred in `--max-content`.
- Travel = track width − viewport width; first card aligned at progress 0 and last card fully visible at progress 1. During movement a partial third card may appear — desired.
- A minimal progress hairline (1 px, 120 px wide, `--cosmos-text` at 20% track with 60% fill) sits under the cards; optional and non-interactive.
- Enter/release: normal vertical scroll → pin → horizontal movement → release → normal scroll; upward scroll reverses everything. No horizontal page scrollbar ever.
- Resize/font-load recalculates travel and section height.

### 11.5 Horizontal mode on tablet, phone, coarse pointers, or reduced motion
A native, touch-friendly horizontal gallery inside the section: `overflow-x: auto`, `scroll-snap-type: x proximity`, one card per view on phones (card ≈ 84% of width so the next card peeks), two on tablets. No pinning, no scroll-linked transform. Visible scrollbar styling kept subtle; keyboard arrow scrolling works. Page itself never scrolls sideways.

### 11.6 Vertical mode (traditional grid)
- ≥ 768 px: **two equal columns**, gap 24 px (column) × 48 px (row), cards fill the available content width (`--max-content` minus gutters). 13 cards → seven rows (the last row holds one card, left-aligned).
- < 768 px: one column.
- Height is simply the content height: **no** sticky, no spacer, no transforms, no scroll listeners, no animation that blocks navigation. Cards may use the blur-fade enter (staggered ≤ 150 ms) once.

### 11.7 Switching modes
Instant, no reload; clean up listeners/observers of the previous mode; recalc dimensions; keep the user near the collection (scroll to the section top when needed) — never stranded in an empty spacer. The selection persists. A cross-fade (250 ms) between layouts is allowed; layout must not jump.

---

## 12. Cosmic Launch (global page transition)

**Idea:** every internal page change is a short journey through the universe. Plays only for real internal route changes (not for the popover, same-page anchors, hash scrolling, external links, or buttons that don't navigate); ignores repeated clicks; browser Back/Forward use a quick ≤ 300 ms fade instead.

### 12.1 Visual elements
- **Overlay:** full viewport, `--z-transition`, background `--cosmos-bg-0` (+ the starfield engine, same distribution/colours as the homepage).
- **Spacecraft:** minimal, elegant, small (≈ 36–56 px long at 1× — never more than ~6% of the viewport width): a slim geometric capsule with two small swept fins, body soft white/silver (`--cosmos-text`), one tiny window tinted `--cosmos-star-blue`; no cartoon face, no big flames, no orange/red. Oriented along its flight path (toward upper-right).
- **Engine glow:** soft radial `--cosmos-engine-glow` at the tail, intensity ramps with phase.
- **Exhaust:** short soft trail from `--cosmos-engine-glow` fading into `--cosmos-exhaust` at low opacity; length grows during acceleration (0 → ~240 px). Restrained; no particles explosion.
- **Streaks:** restrained star trails during acceleration only.
- No text, no percentages, no spinner.

### 12.2 Timeline (≈ 3 s)
| Phase | Time | Visual |
| --- | --- | --- |
| 1 Departure | 0–500 ms | Current page fades out; overlay fades in; faint starfield; spacecraft appears bottom-left (≈ 12vw, 88vh), small and still |
| 2 Ignition | 500–1300 ms | Engine glow rises; star speed ×1 → ×2.5; short soft exhaust appears; slight forward drift of the craft |
| 3 Acceleration | 1300–2300 ms | Craft travels diagonally bottom-left → upper-right on an ease-in curve (`--ease-in`); exhaust lengthens; star speed → ×7 with subtle streaks; craft stays recognisable and small |
| 4 Arrival | 2300–3000 ms | Craft shrinks (to ~40%) and fades into the distance; overlay fades; destination content fades up (blur-fade enter); no hard cut |

If the destination is not ready at 2300 ms, hold the last frame with a very subtle idle glow (no spinner/text) until ready; if ready earlier nothing is skipped or stretched. Failsafe reveal after 10 s. Scroll locked while active. Reduced motion: plain ≤ 300 ms opacity crossfade, no craft. If the overlay fails, navigation proceeds without it. (Coordination logic: `agent_readme.md` §9.10.)

---

## 13. Workspace shell and Blank Pages

### 13.1 Workspace shell (all pages except the homepage)
- Page background `--ws-bg` with an extremely faint lavender wash at the top (`radial-gradient` of `--ws-accent` ≤ 8%, fading out by ~40vh). No dark panels.
- **Top bar** (height `--topbar-h`, sticky, same colour as `--ws-bg`, hairline bottom border appears after scrolling): left — the small signature "Hiep Trong" (Cormorant italic 22 px, with a 10 px star in `--ws-accent`) linking home; right — the **Universe menu** button (secondary pill with a command icon and "Ctrl K" hint hidden on touch) and the **bell**.
- **Page header:** below the bar, left-aligned: workspace title (`--fs-h1`, Cormorant, `--ws-text`) with a small star accent beside it (12 px, `--ws-accent`), an optional muted one-line description, and the page's controls (segmented control, primary "Add task" button) right-aligned (stacked on mobile).
- Content width `--max-content`, centred; vertical rhythm `--space-6` between blocks.
- **Universe menu:** a command-palette-style popover (480 px max, centred under the top bar): search input, list of the 13 features with icon-less rows (title + muted route), arrow-key navigation, Enter opens, Esc closes. Navigation uses `TransitionLink` rules.

### 13.2 Blank Page
Centred vertically in the content area: faint orbit rings (two concentric 1 px circles in `--ws-accent-soft`, ~220 px and ~320 px, behind the heading), the page title in Cormorant (`--fs-display` scaled for workspace, `--ws-text`), a single star (`--ws-accent`, 14 px) above it, the line "This space is waiting to be built." in `--ws-text-muted`, and a secondary pill "Back to home". Nothing else. No fake content, charts, or controls.

---

## 14. Task UI — Celestial Workspace

### 14.1 Concept
Bright, sophisticated, minimalist, comfortable for all-day use: soft lavender canvas, white floating task boxes, muted lavender accents, restrained pastel status colours. It must not look like a generic productivity dashboard.

### 14.2 Task card (one shared component for Daily, Overdue list and Hub)
Every task is its own independent white box; never plain-text rows.

```
┌──────────────────────────────────────────────────────────┐
│ ☐  Task title (Inter 16/600, --ws-text)             ⋯    │  top row
│    Optional description, muted 14px, up to 2 lines        │  middle row
│    [Urgent] 📌  30/10 · 18:00 · 3h 20m left  ● Due soon   │  bottom row
└──────────────────────────────────────────────────────────┘
```
(📌 and ● are drawn with lucide `Pin` and a CSS dot in the real UI, not emoji.)

- **Surface:** `--ws-surface`, border 1 px `--ws-border`, radius `--radius-task`, `--shadow-task`, padding 16 px 18 px, internal gap 8–12 px. Height adapts to content; empty description removes the middle row entirely (no gap).
- **Top row:** checkbox (9.5), title (Inter 16 px semibold, the strongest emphasis, wraps to 2 lines then clamps), three-dot menu button (lucide `MoreHorizontal`, 36×36 hit target, hover fill `--ws-accent-soft`).
- **Middle row:** description in `--ws-text-muted`, Inter 14 px, line-height 1.55, multi-line; clamped to 2 lines when collapsed, full when expanded.
- **Bottom row (metadata, compact, wraps on small widths):** priority badge, pin icon (if pinned), deadline `DD/MM HH:mm` (tabular numbers; year shown only if not the current year), time-left text, due-soon indicator. Muted `--fs-small`.
- **Priority badges (always with the word):** *Urgent* — background `color-mix(var(--status-overdue) 16%, var(--ws-surface))`, text `--text-overdue`, small solid dot; *Normal* — `--ws-accent-soft` background, `--ws-text` text; *Optional* — transparent with `--ws-border` outline, muted text.
- **Hover:** border `color-mix(var(--ws-accent) 45%, var(--ws-border))`, `--shadow-task-hover`, lift 2 px (transform), 200 ms. **Press:** lift 0. Cursor pointer on the body (it expands).
- **Expand/collapse:** click on the body toggles; the checkbox/menu/buttons never toggle it. Expanded shows full description and the action row (Hub: Add to Today / Tomorrow / Pick date… / Remove from daily). Height change animates (layout animation, 250 ms).
- **Menu (three dots):** Edit; Add to Today / Tomorrow / Pick date…; Remove from today; Transfer… (overdue only); Delete (destructive, with confirm dialog).

### 14.3 Task states (compose freely; the same component)
| State | Visual |
| --- | --- |
| Normal | white surface, standard border, muted metadata |
| Urgent | coral-tinted *Urgent* badge; title unchanged; slightly stronger border `color-mix(var(--status-overdue) 20%, var(--ws-border))` |
| Pinned | small `Pin` icon in `--ws-accent` (darkened mix for contrast); card border `--ws-accent-soft`; no extra decoration |
| Completed | title italic with light line-through (decoration colour `--text-completed`, 1 px), text `--text-completed`, card opacity .72, shadow reduced, checkbox filled; glides to the bottom of its list |
| Overdue | background `--tint-overdue-bg`, border `--tint-overdue-border`, a clear "Overdue by 2h" label (clock icon + text in `--text-overdue`); never a harsh red fill; readability preserved |
| Due soon | 8 px `--status-due-soon` dot + "Due soon" text in `--text-due-soon` |
| New | soft 1.2 s lavender glow (`--ws-accent` ring fading from 35% to 0) once on insertion |
| Highlighted (from notification) | same glow, 2 s, scrolled into view |

Do **not** add stars or celestial ornaments to individual task cards.

### 14.4 Task editor (add/edit — one form)
- Opens in the **Drawer** (9.7). Title "New task" / "Edit task" in Cormorant 24 px.
- Fields in order: **Title** (required, counter at 100/120), **Deadline** row (date `DD/MM` input with calendar button + time `HH:mm` input; resolved full date shown below in muted 13 px; Today/Tomorrow quick chips beside the date for speed), **Priority** (segmented: Urgent / Normal / Optional), **Description** (textarea), **Pinned** (toggle switch with label "Pin to top of the day").
- Validation messages inline with icons; Save disabled while submitting; Save = primary, Cancel = secondary; footer sticky.

### 14.5 Daily Task Management page
- **Header:** title "Daily tasks" with star accent; **Day | Week | Month** segmented control; "Statistics" secondary button (opens an empty placeholder panel); week/month navigation arrows when relevant.
- **Day view (≥ 1024 px):** three equal columns — Yesterday | Today | Tomorrow — gap 24 px. Columns are *not* cards (no card-in-card): a column is a header + a vertical stack of task cards (gap 12 px). Column header: weekday (Inter 14/600) + `DD/MM` (muted) on the left; on the right the **finished counter** box (pill, 24 px high, `--ws-accent-soft` bg, "3 done") and, for Today and Tomorrow only, an **Add task** button (secondary, small, plus icon). **Today** is emphasised with a soft tinted background wash `color-mix(var(--ws-accent) 6%, transparent)` behind the column and an accent underline on the header; **Yesterday** content is slightly muted (opacity .9 header). On < 1024 px the three days become a segmented tab strip with one visible list.
- **Week view:** 7 compact day columns (horizontal scroll inside the container on small screens, never the page) with the same cards in a denser variant (single-line description); header shows today's column emphasised; no Add button.
- **Month view:** calendar grid, each day cell shows date and task-count dots/number; today ringed with `--ws-accent`; clicking a day opens that day's list in a drawer; no Add button.
- **Empty column:** orbit empty state with one calm sentence.
- **Overdue list (below, every view):** section header "Overdue" with a coral count chip and a hairline; list of the same `TaskCard` in a responsive grid (1 column mobile, 2 columns ≥ 1024) so it reads as a lane, not a table. Each card exposes a **Transfer** button (opens a small popover: Today / Tomorrow / Pick date + time, Save) and **Delete**. Empty state: "Nothing overdue."
- **Completion motion:** checkbox tick animates; title gets strike/italic; card glides to the bottom of its list (layout animation ≤ 300 ms); the finished counter increments with a short opacity cross-fade (no bounce).

### 14.6 Tasks Hub page
- Same header pattern: title "Tasks hub", **Add task** primary, search field (pill, 40 px), priority filter (segmented or select), "Show completed" toggle.
- Body: grouped lists — **Overdue**, **Due soon**, **Later** — each with a small heading, count chip and a single-column or two-column responsive stack of `TaskCard`s (two columns ≥ 1024). Completed tasks (when shown) are a separate muted group at the end.
- Cards identical to Daily; expanded cards reveal the schedule action row (Add to Today / Tomorrow / Pick date…). A small "Scheduled 31/10" chip appears in metadata when scheduled.
- Highlight behaviour for notification links (glow + scroll into view).

### 14.7 Celestial details in the workspace (restrained)
Allowed: tiny star beside page titles; faint orbit lines in empty states and the Blank Page; a very soft lavender ambient at the top of the page; star accents beside section headings. Not allowed: stars on cards, large illustrations, animated sparkles, glowing effects.

---

## 15. Notification center (homepage and workspace)

### 15.1 Role
A small floating control panel above the interface — **not a page, not a full-screen overlay**. "Stay connected to your universe without leaving it."

### 15.2 Bell
See 10.6. In the workspace top bar the bell uses workspace colours (`--ws-text` icon, hover fill `--ws-accent-soft`, unread dot `--status-overdue` with a 2 px ring in `--ws-bg`). Identical dot/badge behaviour.

### 15.3 Popover
- Anchored under the bell, right-aligned, width 380 px (full width − 32 px on phones), max-height 70dvh with internal scrolling, kept inside the viewport (flip/shift).
- Surface `--ws-surface` (bright against the dark homepage), border 1 px `--ws-border`, radius `--radius-card`, `--shadow-popover`, padding 0 (header and list manage their own).
- **Header** (padding 16 px 16 px 12 px, bottom hairline): "Notifications" (Inter 16/600 `--ws-text`), "3 unread" (muted 13 px), and a text button "Mark all as read" (`--ws-text`, hover `--ws-accent-soft` background; disabled when none unread).
- **List:** newest first, gap 8 px, padding 12 px, scrollable.
- **Item (compact card):** background `--ws-surface`, 1 px `--ws-border`, radius `--radius-item`, padding 12 px 14 px; unread items have a faint `color-mix(var(--ws-accent) 6%, var(--ws-surface))` background and an 8 px `--status-overdue` unread dot at the left edge of the title row.
  - Row 1: **tag** pill (left) and **read checkbox** (right, 9.5, small).
  - Row 2: **title** (Inter 14/600).
  - Row 3: **message** (Inter 13, `--ws-text-muted`, up to 2 lines).
  - Row 4 (footer): **time-left** on the left when relevant ("3h 20m left", "Overdue by 2h", in the matching status text colour) and **"N days ago"** at the bottom-right corner (12 px, `--ws-text-muted`; "Just now", "2 hours ago", "3 days ago").
- **Tags:** *Due soon* (`--status-due-soon`), *Overdue* (`--status-overdue`), *Completed* (`--status-notif-completed`, soft sage), *General* (`--ws-accent` / `--ws-accent-soft`), *System* (`--status-system`). Pill 20 px high, 12 px text, tint = `color-mix(<token> 16%, var(--ws-surface))`, text = darker mix with `--ws-text` (≥ 4.5:1).
- **Interactions:** click item body → opens the related task (internal navigation → Cosmic Launch when the path changes) and marks read; the checkbox toggles read without navigating; clicking inside never closes the panel; click outside and Esc close it; the bell toggles it; focus moves into the panel on open and returns to the bell on close (`role="dialog"`, `aria-label="Notifications"`, `aria-expanded` on the bell).
- **Empty state:** orbit mini-illustration (56 px), "All caught up." (Inter 15/600) and "Your universe is running smoothly." (muted).
- **Animation:** open 220 ms (fade, 8 px down, scale .98→1, origin top-right), close 170 ms (fade, 6 px up). Local interaction only — **never** triggers Cosmic Launch.
- Notifications older than seven days are deleted by the system (not a UI concern, but the list must never show them).

---

# Part D — Quality and decisions

## 16. Quality gates

### 16.1 Homepage final standard (all must be "yes")
1. A distinctive Hiep Trong Space identity is established immediately.
2. The wordmark looks deliberately designed, not ordinary heading text.
3. "SPACE" is dominant while "Hiep Trong" feels connected.
4. The composition is balanced and sophisticated.
5. Whitespace feels intentional.
6. Celestial details are subtle and meaningful (one star, the starfield).
7. The palette creates a calm, immersive atmosphere.
8. The page remains impressive with animations disabled.
9. It works beautifully on mobile (320–430 px).
10. It feels like a personal brand, not a generic productivity site.

### 16.2 Feature Collection acceptance
- [ ] All 13 cards in both modes, same order, one data source.
- [ ] Desktop Horizontal: two large cards visible initially; scrolling down moves them left; scrolling up reverses; pinned during the sequence; releases at both ends; no snapping or hijacking.
- [ ] Desktop Vertical: two equal-width columns, seven rows, no sticky/horizontal movement/blank space.
- [ ] Toggle switches instantly, no reload, no stuck scroll; selection remembered.
- [ ] Tablet/phone fallbacks work; no unintended horizontal page overflow.
- [ ] Cards are fully clickable, keyboard-focusable with visible rings.

### 16.3 Task UI acceptance
- [ ] Every task is a white box with top/middle/bottom rows; empty descriptions leave no gap.
- [ ] All states (normal, urgent, pinned, completed, overdue, due soon) render and compose correctly.
- [ ] Daily and Hub use the same component with identical visuals.
- [ ] Completing animates smoothly to the bottom with strike + italic; counter updates.
- [ ] Overdue is pale coral with a text label, not an aggressive red.
- [ ] Text contrast passes; status never relies on colour alone.

### 16.4 Notification acceptance
- [ ] Opens/closes with click, outside click, Esc; stays in viewport; adapts on mobile.
- [ ] Tags colour-coded; read checkbox and "Mark all as read" work; "N days ago" bottom-right.
- [ ] Empty state correct; no Cosmic Launch for popover actions.

### 16.5 Every surface
- [ ] Only tokens used (search for hex/rgb outside `tokens.css`).
- [ ] Sentence case except "SPACE"; one icon library; no emoji icons.
- [ ] Looks finished at 360 / 768 / 1280 / 1440 px.
- [ ] Reduced motion and keyboard-only use verified.
- [ ] No leftover placeholder or template copy.

## 17. Conflict resolutions (what was ambiguous and how it was decided)

| # | Conflict in the old file | Decision |
| --- | --- | --- |
| 1 | Generic template: white canvas, blue accent, Signifier serif, black primary buttons, product-screenshot marketing layout vs your dark cosmos homepage and lavender workspace | Your specs are primary. Template's colours, fonts, screenshot/devices/CTA sections dropped; kept only craft ideas (pill shapes, tinted surfaces, quiet blur-fade motion, segmented tabs, sentence case) |
| 2 | Homepage background `#090D20/#10152B` vs starfield `#05080D/#071321/#09182A` | Starfield palette is the base; the two navy values are allowed only as ≤ 6% ambient tints |
| 3 | Soft white `#F4EFFF` vs button/spacecraft `#F4F2FF`; transition bg `#080E1B` vs `#05080D` | Merged to one token each (`--cosmos-text`, `--cosmos-bg-0`) |
| 4 | Template forbade uppercase and "Display weights ≤ 400"; your wordmark requires uppercase SPACE | Uppercase allowed only for "SPACE"; headings stay light (300–400) |
| 5 | Template: Signifier paid font; free-tools-only constraint | Cormorant Garamond + Inter (self-hosted) |
| 6 | Template: Geist Mono for micro labels | Monospace removed entirely |
| 7 | Task "Completed" colour `#9A8BCB` vs notification "Completed: soft sage" | Both kept: task state uses `--status-completed`, notification tag uses `--status-notif-completed` |
| 8 | "Red" unread point vs coral palette | Unread dot uses `--status-overdue` (muted coral) to stay within the palette |
| 9 | Workspace primary button colour not specified (template said black) | `--ws-text` fill (dark ink) with white text — accessible and in-palette |
| 10 | Task "Urgent" and "Overdue" are both coral | Differentiated by form: Urgent = small badge with word; Overdue = tinted card + clock icon + "Overdue by …" text |
| 11 | "Reference images" mentioned but not supplied | Specs are text-driven; optional `md/refs/` for later comparison |
| 12 | Feature cards: template used bento cards with mini-UI illustrations and uppercase labels | Replaced by your spec: large thumbnail + small label + large title, no container card |
| 13 | Notification Hub as "page" in the original blueprint vs popover in the UI spec | Popover only; 13 feature cards |
| 14 | Mobile behaviour of pinned horizontal gallery undefined | Native snap gallery below 1024 px / coarse pointer / reduced motion |
| 15 | Feature Collection card height vs 100vh in pinned mode | Card width bounded by available viewport height (formula in 11.4) |
