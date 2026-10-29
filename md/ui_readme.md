# Design language

## How to use this design language

**Goal:** Learn this template's design language — then design **anything** (different page type, product UI, campaign, dashboard) with the same rigor.

**This is not a build spec.** You are not required to reproduce this template's section list, copy, layout order, or source stack.

**Design language stack** (read top-down, build bottom-up):

| Layer | Section | Use when building |
| --- | --- | --- |
| 0 | Anti-slop | Universal guardrails — always |
| 1 | Design principles | Taste and system character — internalize first |
| 2 | Design tokens | All colour, type, spacing values |
| — | Motion system | Transferable animation vocabulary |
| — | Imagery direction | Which image media + art styles fit |
| 3 | Primitive components | Atoms for any screen |
| 4 | Reference components | Study source compositions — adapt or omit |
| — | Composition guide | Apply language to the user's brief |

| Do | Don't |
| --- | --- |
| Internalize principles and token *relationships* | Copy every reference component for unrelated briefs |
| Reuse **primitives** in new combinations | Treat **reference components** as mandatory blocks |
| Match spacing, type, and colour *relationships* | Paste hash asset paths or brand names as defaults |
| Pick image **medium** and **style** from Imagery direction | Drop anime, watercolor, or lifestyle photos into a technical light SaaS language |
| Add npm/CDN libraries when they improve UI/UX — map to tokens and motion | Add colours, fonts, or motion outside **Design tokens** and this language |
| Implement in the **user's** stack when known (React, Vue, Tailwind, etc.) | Force vanilla HTML because the source template used it |
| Port snippets to components, utilities, or design tokens in their stack | Treat **Dependencies (from source)** as a closed allowlist — it is reference only |
| **Implement responsive** — mobile through desktop; preserve token relationships across breakpoints | Ship desktop-only because the source template was cloned desktop-first |

**Responsive (build rule):** Source templates are often extracted **desktop-first** — responsive `@media` rules may be absent or incomplete in reference snippets. That is expected. When you **build** from this design language, you **must** implement responsive layout and type (stack columns, scale display type, touch-friendly targets, readable line lengths). Infer breakpoints from token tiers and layout habits in **Design principles**; do not require per-reference-component responsive specs in this file.

When the user asks for something unlike the source (e.g. SaaS dashboard from a portfolio template), keep principles + tokens + motion + imagery vocabulary; invent new layouts using primitives.

---

**Anti-slop:** follow **### Anti-slop (builder) — hard rules** below only — do not add colours, fonts, casing, layout, or motion outside **Design tokens**, **Primitive components**, **Reference components**, **Motion system**, and this section.

### Anti-slop (builder) — hard rules

**Language contract:** everything you may use is in **this DESIGN.md** — read **How to use this design language** first. This file teaches craft; **Reference components** are reference studies, not mandatory blocks. Stay inside **Design tokens**, **Primitive components**, **Motion system**, **Imagery direction**, and this section when building. **Dependencies (from source)** is informational — see **Libraries & dependencies**.

Map legacy terms when reading rules below: **FIXED SPEC → Design tokens + Reference components**; **### Tokens → Design tokens**; **Section patterns / Section recipes → Reference components**; **CONTENT SLOTS / MEDIA SLOTS → copy and assets in reference components and snippets**.

Design tokens and documented section exceptions win when composing new pages from this design language. **Every rule below is mandatory.**

#### Casing & uppercase

**Default: sentence case everywhere** unless **Design tokens** or **Reference components** document `text-transform` on that exact element.

- This template uses `text-transform: uppercase` only on micro labels inside feature-card mini-UI illustrations — preserve only where **Reference components → Features** documents those selectors.
- Do not invent all-caps nav, CTAs, labels, or eyebrows.
- No tag-left / header-right section heads (`01 · TITLE` left column + title right) unless **Reference components** document that layout. Stack eyebrow **above** heading in one column.

```css
/* enforce unless Design tokens or Reference components name an exception */
nav a,
.btn,
button,
label,
h1,
h2,
h3,
h4,
p {
  text-transform: none;
}
```

Use `--text-transform-default` from **Design tokens** when present.

#### Typography & font-mono

**Default: `font-family` tokens from Design tokens only.** No decorative monospace.

- Geist Mono (`--font-mono`) is documented for micro labels inside feature-card illustrations (keyboard shortcuts, model names, duration stamps) — use only in those illustrated UI atoms.
- No JetBrains Mono, IBM Plex Mono, or undocumented mono on nav, eyebrows, section titles, CTAs, or body.
- Section numbers use the **same face as section titles** — not mono — unless this design language says otherwise.
- Use `font-variant-numeric: tabular-nums` on the **existing** face for stats and timers — not a mono swap unless documented.

#### Colours

**Closed palette.** Use **only** colours in **Design tokens** (`:root` `--color-*` and any other colour tokens). **If a colour is not in Design tokens, do not use it.**

- Every `color`, `background`, `background-color`, `border-color`, `fill`, `stroke`, `box-shadow`, and gradient stop → `var(--*)` from Design tokens. **No inline hex, `rgb()`, `hsl()`, `oklch()`, or Tailwind arbitrary colours** outside `:root`.
- No invented hover/focus/active colours — only tokens in Design tokens or per-element values in **Primitive components** / **Reference components**.
- No new `--color-*` at build time. No default greys, lighter borders, or purple/blue accents beyond `--color-accent`.

```css
/* BAD — not in Design tokens */
.card {
  border-color: #333;
  background: rgba(255, 255, 255, 0.05);
}

/* GOOD */
.card {
  border-color: var(--color-border-subtle);
  background: var(--color-card);
}
```

#### Layout

No purple/blue/pink gradient heroes; aurora blobs; equal 3-col icon grids; card-in-card; glassmorphism on gradients; fake browser/phone/IDE chrome; `width: 100vw`; identical section padding when this design language varies section by section.

**Exceptions only when documented in this design language:** glass-framed product screenshots, frosted sticky nav blur, segmented pill tab bar, layered shadow media frames — must appear in **Design tokens** and **Reference components** for that element.

Gradients only with stops from Design tokens.

#### Type, icons & motion

- Fonts from Design tokens only — Signifier for display, Inter for UI; light weight (300) on large serif headlines.
- One icon library per page; inline SVG icons only; no emoji feature icons like ✨, 🚀, 🎯, ⚡, 🔥, 💡
- Lottie, Three.js, or similar are allowed when they improve UI/UX — map timing and feel to **Motion system** and tokens, not generic bounce/elastic defaults.
- Motion from this design language only — blur-fade slide-in on enter, opacity crossfades on tab swap; no bounce/elastic, `transition-all`, universal `hover:scale-105`; `:focus-visible` rings instant when added.

#### Libraries & dependencies

- **Dependencies (from source)** records fonts, scripts, and CDNs the template used — **reference only**, not a closed allowlist.
- Agents may add **any npm package or CDN** when it improves UI/UX (animation, icons, scroll, charts, accessibility, etc.) — map behaviour back to this design language's **Design tokens**, **Motion system**, and anti-slop guardrails.
- Prefer the user's stack when known. Libraries must not override closed palette, typography, casing, or documented motion signatures.

#### Content & media

- No invented stats, testimonials, or placeholder brands ("Acme", "Jane Doe") unless user brief overrides.
- **Extraction vs build:** Primitive and reference HTML snippets in this file use **role-based placeholders** (`Brand name`, `Section heading`, …) — not origin template copy and not fake brand names. When **building** a page, replace placeholders with the user's real brief content.
- Hero screenshot: `loading="eager"` for LCP; lazy-load below-fold screenshots.
- Copy polish: curly quotes `"…"`; em-dash `—`; nav/CTAs `white-space: nowrap`; z-index from Design tokens — not `9999`.

Avoid generic filler vibes like:

- unleash
- elevate
- revolutionize
- next-gen
- seamless
- transformative platform

Avoid fake brand slop:

- Acme
- Nexus
- Flowbit
- Quantumly
- NovaCore

Avoid fake complexity slop:

- pseudo-enterprise control labels
- decorative system markers
- filler status microcopy
- fake operator / runtime / orchestration jargon unless truly central to the brand

---

## Design principles

### Style

A bright white canvas carries warm-neutral ink and a single blue accent channel reserved for AI and interactive proof states. Display voice is editorial and calm: a light-weight serif at large sizes with tight negative tracking, paired with a neutral sans for UI chrome and body copy. Shape language favors full-round pills for navigation, badges, and tabs, with modest 16px radii on cards and screenshot frames. Depth comes from hairline rings, layered soft shadows on product imagery, and low-alpha tinted surfaces — never from gradient heroes or glass blobs. Motion is quiet and precise: elements blur-fade upward on enter with staggered delays, and tabbed media crossfades rather than slides. The mood is premium productivity tooling — private, local-first, technically credible — with product UI screenshots as the primary visual proof rather than lifestyle photography or illustrative mascots.

### Design system overview

**Visual identity & metaphor:** A personal library on a clean desk — organized, private, instrument-like. The page is the frame; the app screenshots are the artwork.

**Color philosophy:** Pure white field (`--color-bg`), near-black ink (`--color-fg`), black primary actions (`--color-primary`), and a single chromatic accent (`--color-accent`, blue-violet) for AI highlights, selection rings, and annotation callouts. Secondary hierarchy uses stepped black alphas (60%, 50%, 40%, 35%) on text and 4–6% black tints on card surfaces. No multi-accent rainbow UI.

**Typography:** Signifier serif at weight 300 for display and section headings; Inter (variable) at 400–600 for UI, body, and buttons. Geist Mono only inside illustrated feature-card micro-UI (keyboard hints, model labels, timestamps). Sentence case default; uppercase micro labels only inside card illustrations.

**Shape & surface:** Pill radius (`--radius-pill`) for nav download, announcement badges, tab segments, and feature pills. Card radius 16px (`--radius-card`). Screenshot frames use inset hairline ring + multi-layer drop shadow. Tinted cards at 4% black; hover lifts to 6%.

**Layout & spacing:** Centered columns capped at 64rem (hero/screens) or 56rem (narrow bands). Generous vertical rhythm: 4–6rem section padding tiers, 2.5rem gaps between headline clusters and CTAs. Three-column bento grids at desktop with 8px gutters; stack to one column on mobile.

**Motion & interaction:** Blur-fade slide-in (12px Y, 4px blur) on scroll enter via IntersectionObserver; CSS keyframe variants for hero load. Tab indicator slides inside segmented control; screenshot opacity crossfade 300ms. Hover: opacity and background shifts only — no scale.

**Accent & proof:** Blue accent signals AI/opt-in features and active selection. Social proof is product demonstration — framed UI captures, device composites, and CSS-built mini interface illustrations — not testimonial cards or stat counters.

**What this system rejects:** Dark-mode marketing gradients, lifestyle stock photography, 3D mascots, equal icon-row feature grids, neon cyberpunk accents, heavy card borders, bounce animations, and uppercase marketing shout labels.

### Key characteristics

- White canvas with warm-neutral ink — light mode only in source
- Signifier light-serif display paired with Inter UI sans
- Black filled primary CTA; soft gray secondary with hairline ring
- Single blue accent channel for AI and interactive proof
- Pill geometry on nav actions, badges, tabs, and feature chips
- Tinted surface cards at 4% black with 16px corner radius
- Glass-framed product screenshots with layered shadow depth
- Sticky frosted nav with gradient blur mask — no solid bar
- Blur-fade scroll reveals with staggered animation-delay
- Bento feature grid with CSS mini-UI illustrations per card
- Segmented pill tab bar driving cross-fading screenshot proof
- Muted footer: small wordmark, low-contrast link row — no imagery
- Geist Mono only inside illustrated micro-UI atoms — not global labels

---

## Design tokens

```css
:root {
  /* Core palette */
  --color-bg: #ffffff; /* page field */
  --color-fg: oklch(0.2 0.004 78); /* primary ink */
  --color-fg-muted: rgba(0, 0, 0, 0.5); /* body secondary */
  --color-fg-subtle: rgba(0, 0, 0, 0.35); /* footer, meta */
  --color-primary: #000000; /* filled CTA */
  --color-primary-fg: #ffffff; /* text on primary */
  --color-accent: oklch(60% 0.18 262); /* AI highlights, rings */
  --color-secondary: rgba(0, 0, 0, 0.06); /* ghost buttons, nav pill */

  /* Surfaces */
  --color-card: rgba(0, 0, 0, 0.04); /* tinted panels */
  --color-card-hover: rgba(0, 0, 0, 0.06); /* card hover lift */
  --color-border-subtle: rgba(0, 0, 0, 0.08); /* hairline rings */
  --color-border-frame: rgba(0, 0, 0, 0.15); /* screenshot frame ring */

  /* Typography families */
  --font-serif: "Signifier", ui-serif, Georgia, serif;
  --font-signifier: "Signifier", ui-serif, Georgia, serif;
  --font-sans: "Inter var", "Inter", system-ui, sans-serif;
  --font-mono: "Geist Mono", ui-monospace, monospace; /* feature card micro-UI only */

  /* Type scale */
  --font-size-display: clamp(2.25rem, 4vw, 2.8125rem);
  --font-size-h2: clamp(2rem, 3.5vw, 2.5rem);
  --font-size-h3: clamp(1.5rem, 2.5vw, 1.75rem);
  --font-size-body: 1rem;
  --font-size-subcopy: 1.0625rem;
  --font-size-ui: 0.875rem;
  --font-size-caption: 0.8125rem;
  --font-size-micro: 0.75rem;

  /* Layout */
  --max-content: 64rem;
  --max-content-narrow: 56rem;
  --nav-height: 60px;
  --page-gutter: 1.5rem;

  /* Radii */
  --radius-pill: 999px;
  --radius-card: 16px;
  --radius-image: 16px;
  --radius-btn: 0.75rem;

  /* Z-index */
  --z-nav: 30;
  --z-elevated: 10;

  /* Motion */
  --motion-duration-fast: 0.15s;
  --motion-duration-base: 0.3s;
  --motion-duration-reveal: 0.7s;
  --motion-ease: ease;
  --motion-blur-enter: 4px;
  --motion-y-enter: 12px;

  /* Casing */
  --text-transform-default: none;
}
```

---

## Dependencies (from source)

| Asset / dependency | Role |
| --- | --- |
| Signifier (woff2 via CDN) | Display serif — weight 300 |
| Inter (Google Fonts) | UI and body sans — weights 300–600 |
| Geist Mono | Micro labels in feature-card illustrations only |
| `index.js` | IntersectionObserver scroll reveals; surfaces tab switcher |
| Inline SVG icons | Platform, format, and UI glyphs throughout |
| Product PNG screenshots | Hero, tabbed tour, device composite |

---

## Suggestions

**Suggestion:** Add `:focus-visible` outline tokens (`--color-focus-ring`) on interactive pills and tab buttons — source relies on hover only.

**Suggestion:** Consolidate feature-section Tailwind utility mappings into semantic component classes when porting to a component framework.

**Suggestion:** Add `prefers-reduced-motion` fallbacks that skip blur filter and use opacity-only reveals.

**Suggestion:** Self-host Signifier instead of hotlinking CDN for production builds.

---

## Motion system

| Technique | Timing / trigger | Used in source |
| --- | --- | --- |
| Blur-fade slide-in | 0.7s ease; IO threshold 0.15 | Features, surfaces, devices, CTA |
| Hero load stagger | 0.1–0.3s delay steps | Hero copy and CTA row |
| Fade-in (no blur) | 0.6s ease | Hero screenshot |
| Tab screenshot crossfade | 0.3s opacity | Surfaces tab switcher |
| Tab indicator insert | 0.25s ease | Active tab pill background |
| Hover opacity/color | 0.15–0.2s | Nav links, format cards, buttons |

### Blur-fade slide-in

**Learn:** Use for first entrance of content blocks — combines 4px blur removal, 12px upward translate, and opacity 0→1. Feels editorial and calm; avoid on every nested element.
**Implementation notes:** `[data-animate]` starts `opacity: 0; filter: blur(4px); transform: translateY(12px)`. IntersectionObserver adds `.is-visible` once. Stagger via inline `animation-delay` or nth-child rules.

### Tab screenshot crossfade

**Learn:** Swap proof imagery without layout shift — stack images absolutely and toggle `.is-active` opacity. Pair with a sliding pill indicator on the tab bar.
**Implementation notes:** `initSurfacesTabs()` toggles `is-active` on `.surfaces__shot` and injects/removes `.surfaces__tab-indicator` on the active tab.

### Hero load stagger

**Learn:** On first paint, cascade `.animate-blur-fade` with incremental delays (0.1s steps) so headline → subcopy → actions read in sequence.
**Implementation notes:** CSS `@keyframes blur-fade-slide-in` with `animation-fill-mode: forwards`.

---

## Imagery direction

### Medium

| ID | Role in this language | Treatment |
| --- | --- | --- |
| ui-screenshot | Primary proof — hero, tabbed tour, device composite | Glass frame: hairline ring, layered soft shadow, slight brightness boost (1.04) |
| vector | Inline SVG in format grid and feature-card mini-UI | Monochrome icons at 50% ink, brighten on hover |

### Style

| ID | Why it fits |
| --- | --- |
| technical | Real product UI captures show actual tooling — credible for dev/productivity positioning |
| minimal | Clean app chrome, white/gray UI, sparse decoration inside screenshots |
| realistic | Actual interface pixels — not illustrated or stylized product viz |

### Avoid

| ID | Why it clashes |
| --- | --- |
| anime | Breaks calm premium productivity tone |
| watercolor | Too soft and decorative for technical SaaS proof |
| cartoon | Undermines product credibility |
| 3d-render | Source uses real UI captures, not CGI product scenes |
| ai-art | No generative texture or surreal grading in signature imagery |
| warm-editorial-portrait | No lifestyle photography in source — proof is interface-only |
| surreal | Opposite of the restrained literal UI aesthetic |
| whimsical-illustration | Feature cards use precise mini-UI, not storybook art |

**Learn:** Keep imagery in the same neutral-to-cool UI world as the page — white app chrome, soft gray sidebars, black text. The page canvas is white; screenshot content may include colorful in-app media (thumbnails, icons) but marketing imagery should remain actual product interface captures in glass frames, not stock photos or illustrated heroes. When generating assets, prefer crisp macOS/iOS UI at retina resolution with subtle outer shadow — never lifestyle models, 3D blobs, or cinematic portraits.

---

## Primitive components

### Typography — display (serif)

**Purpose:** Primary marketing headline voice.
**When to use:** Page title, major section headings.
**Avoid:** Weights above 400 on Signifier — light voice is intentional.

**Learn:** Light serif at clamp scale with `-0.02em` tracking sells calm premium — not bold sans shouting.

**HTML anatomy:**

```html
<h1 class="heading-xl">Display title</h1>
```

**CSS:**

```css
.heading-xl {
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: var(--font-size-display);
  line-height: 1.05;
  letter-spacing: -0.02em;
  text-align: center;
  text-wrap: balance;
  color: var(--color-fg);
}
```

**Tokens:** `--font-serif`, `--font-size-display`, `--color-fg`
**Interaction:** Pair with blur-fade enter animation on first load.

---

### Typography — section heading

**Purpose:** Secondary large headings below display tier.
**When to use:** Mid-page section titles, capture band headings.
**Avoid:** Matching display size everywhere — use `heading-md` for tertiary titles.

**Learn:** Three-tier serif scale (xl / lg / md) maintains rhythm without shouting.

**HTML anatomy:**

```html
<h2 class="heading-lg">Section heading</h2>
```

**CSS:**

```css
.heading-lg {
  font-family: var(--font-serif);
  font-weight: 300;
  font-size: var(--font-size-h2);
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-align: center;
}
```

**Tokens:** `--font-serif`, `--font-size-h2`

---

### Typography — body / subcopy

**Purpose:** Supporting copy under headings.
**When to use:** Paragraphs, captions below screenshots.
**Avoid:** Full-width paragraphs without `max-width` constraint.

**Learn:** Muted ink at 55–60% alpha keeps hierarchy without a second color.

**HTML anatomy:**

```html
<p class="subcopy">Body text</p>
```

**CSS:**

```css
.subcopy {
  font-family: var(--font-sans);
  font-size: var(--font-size-subcopy);
  line-height: 1.6;
  color: var(--color-fg-muted);
  text-align: center;
  max-width: 36rem;
}
```

**Tokens:** `--font-sans`, `--color-fg-muted`

---

### Badge — announcement pill

**Purpose:** Compact news or version callout above headline.
**When to use:** One eyebrow per viewport — product updates, launch notes.
**Avoid:** Multiple competing badges in the hero cluster.

**Learn:** White pill with inset highlight and hairline shadow reads as native macOS notification — not a loud marketing banner.

**HTML anatomy:**

```html
<a href="#" class="hero__badge">
  <span class="hero__badge-pill">Eyebrow label</span>
  <svg class="hero__badge-chevron" aria-hidden="true"><!-- chevron --></svg>
</a>
```

**CSS — default / hover:**

```css
.hero__badge-pill {
  display: inline-flex;
  height: 1.25rem;
  padding: 0.125rem 0.625rem;
  font-size: var(--font-size-micro);
  font-weight: 500;
  background: var(--color-bg);
  border-radius: var(--radius-pill);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.09);
}
.hero__badge:hover .hero__badge-chevron {
  transform: translateX(2px);
  color: rgba(0,0,0,0.7);
}
```

**Tokens:** `--radius-pill`, `--color-bg`
**Interaction:** Chevron nudge on hover; entire badge is one link.

---

### Button — primary (filled)

**Purpose:** Main conversion action.
**When to use:** Download, sign up — one per cluster.
**Avoid:** Multiple black buttons competing in one row.

**Learn:** Solid black fill on white canvas is the strongest contrast available — reserve for primary action only.

**HTML anatomy:**

```html
<a href="#" class="btn btn--primary">Primary action</a>
```

**CSS — default / hover:**

```css
.btn--primary {
  background: var(--color-primary);
  color: var(--color-primary-fg);
  border-radius: var(--radius-btn);
  padding: 0.625rem 1.25rem;
  font-weight: 500;
}
.btn--primary:hover { opacity: 0.85; }
```

**Tokens:** `--color-primary`, `--color-primary-fg`, `--radius-btn`

---

### Button — secondary (surface)

**Purpose:** Secondary action beside primary.
**When to use:** Alternate path (purchase, learn more).
**Avoid:** Outlined ghost that disappears on white — use tinted fill instead.

**Learn:** 6% black tint + hairline ring reads softer than primary without losing affordance.

**HTML anatomy:**

```html
<a href="#" class="btn btn--secondary">Secondary action</a>
```

**CSS — default / hover:**

```css
.btn--secondary {
  background: var(--color-secondary);
  color: var(--color-fg);
  box-shadow: 0 0 0 0.5px var(--color-border-subtle);
  border-radius: var(--radius-btn);
}
.btn--secondary:hover { background: var(--color-card-hover); }
```

**Tokens:** `--color-secondary`, `--color-border-subtle`

---

### Nav — link

**Purpose:** Single text navigation item.
**When to use:** Centered nav cluster in sticky header.
**Avoid:** All-caps or underlined default state.

**Learn:** 80% opacity default → 100% on hover keeps nav quiet.

**HTML anatomy:**

```html
<a href="#">Nav link</a>
```

**CSS:**

```css
.site-nav__links a {
  font-size: var(--font-size-ui);
  font-weight: 500;
  opacity: 0.8;
  transition: opacity var(--motion-duration-fast);
}
.site-nav__links a:hover { opacity: 1; }
```

**Tokens:** `--font-size-ui`

---

### Nav — download pill

**Purpose:** Persistent header CTA.
**When to use:** Sticky nav right column.
**Avoid:** Black fill in nav — use secondary surface to defer to hero primary.

**Learn:** Secondary pill in nav prevents double-primary competition with hero CTA.

**HTML anatomy:**

```html
<a href="#" class="site-nav__download">Primary action</a>
```

**CSS:**

```css
.site-nav__download {
  padding: 0.4rem 1rem;
  border-radius: var(--radius-pill);
  background: var(--color-secondary);
  box-shadow: 0 0 0 0.5px var(--color-border-subtle);
  font-size: var(--font-size-ui);
  font-weight: 500;
}
```

**Tokens:** `--radius-pill`, `--color-secondary`

---

### Tab — segmented pill

**Purpose:** Switch between related proof views.
**When to use:** Product tour with multiple screenshots.
**Avoid:** Underline tabs or vertical tab lists for this language.

**Learn:** Floating white indicator inside gray track reads as macOS segmented control.

**HTML anatomy:**

```html
<button type="button" role="tab" class="surfaces__tab is-active" aria-selected="true">
  <span class="surfaces__tab-indicator" aria-hidden="true"></span>
  <span class="surfaces__tab-label">Tab label</span>
</button>
```

**CSS:**

```css
.surfaces__tabs {
  display: inline-flex;
  padding: 0.25rem;
  border-radius: var(--radius-pill);
  background: rgba(0,0,0,0.03);
  box-shadow: 0 0 0 0.5px var(--color-border-subtle);
}
.surfaces__tab.is-active { color: var(--color-fg); }
.surfaces__tab-indicator {
  position: absolute;
  inset: 0;
  border-radius: var(--radius-pill);
  background: var(--color-bg);
  box-shadow: 0 2px 8px -2px rgba(0,0,0,0.08), 0 0 0 0.5px var(--color-border-subtle);
}
```

**Tokens:** `--radius-pill`, `--color-bg`
**Interaction:** Indicator injected on active tab only; see Motion system → Tab screenshot crossfade.

---

### Card — tinted surface

**Purpose:** Low-contrast panel on white field.
**When to use:** Feature cards, device band shell, format tiles.
**Avoid:** White card on white without tint differentiation.

**Learn:** 4% black tint is the signature surface — hover to 6% only.

**HTML anatomy:**

```html
<div class="card-surface">…</div>
```

**CSS:**

```css
.card-surface {
  background: var(--color-card);
  border-radius: var(--radius-card);
  transition: background var(--motion-duration-base);
}
.card-surface:hover { background: var(--color-card-hover); }
```

**Tokens:** `--color-card`, `--radius-card`

---

### Card — media frame (screenshot)

**Purpose:** Product UI capture container.
**When to use:** Hero proof, tabbed screenshots.
**Avoid:** Raw `<img>` without ring and shadow stack.

**Learn:** Hairline ring + three-layer shadow elevates flat screenshots into premium proof.

**HTML anatomy:**

```html
<div class="media-frame">
  <img src="[asset]" alt="Product screenshot">
</div>
```

**CSS:**

```css
.media-frame {
  border-radius: var(--radius-image);
  overflow: hidden;
  background: var(--color-card);
  box-shadow:
    0 0 0 1px var(--color-border-frame),
    0 2px 6px rgba(0,0,0,0.03),
    0 16px 40px rgba(0,0,0,0.05),
    0 40px 100px rgba(0,0,0,0.07);
}
.media-frame img { filter: brightness(1.04); }
```

**Tokens:** `--radius-image`, `--color-border-frame`

---

### Chip — status / opt-in

**Purpose:** Small label for optional or beta features.
**When to use:** Beside feature card titles (AI features).
**Avoid:** Large banner chips — keep at `text-xs` scale.

**Learn:** 10% black tint pill at card title row signals optional without alarm colors.

**HTML anatomy:**

```html
<span class="chip-opt-in">Status label</span>
```

**CSS:**

```css
.chip-opt-in {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  height: 1.25rem;
  font-size: var(--font-size-micro);
  font-weight: 500;
  border-radius: var(--radius-pill);
  background: rgba(0,0,0,0.1);
  color: rgba(0,0,0,0.8);
}
```

**Tokens:** `--radius-pill`

---

## Reference components

### Chrome — sticky navigation

**Reference only** — source template header; adapt or omit for other briefs.

**Role in source:** Persistent three-column nav: logo left, links center, download pill right, with frosted gradient blur behind.
**Primitives used:** Nav — link, Nav — download pill
**Learn:** Sticky frosted wash lets content scroll beneath without a solid bar — keeps the page airy.

**HTML snippet:**

```html
<header class="site-nav">
  <div class="site-nav__blur" aria-hidden="true"></div>
  <div class="site-nav__inner">
    <a href="/" class="site-nav__logo" aria-label="Brand name home">
      <img src="[asset]" alt="Logo" width="18" height="20">
    </a>
    <nav class="site-nav__links" aria-label="Main">
      <a href="#">Nav link</a>
      <a href="#">Nav link</a>
    </nav>
    <a href="#" class="site-nav__download">Primary action</a>
  </div>
</header>
```

**CSS snippet (composition-specific):**

```css
.site-nav {
  position: sticky;
  top: 0;
  z-index: var(--z-nav);
  height: var(--nav-height);
}
.site-nav__inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: var(--nav-height);
  padding: 0 var(--page-gutter);
}
```

**If adapting:** Dashboard apps can simplify to logo + sparse links; preserve frosted blur and pill download pattern.

---

### Hero (`data-section="hero"`)

**Reference only** — source template hero; adapt or omit for other briefs.

**Role in source:** Centered announcement badge, serif headline, dual CTAs, platform links, full-width framed product screenshot below.
**Primitives used:** Badge — announcement pill, Typography — display, Button — primary, Button — secondary, Card — media frame
**Learn:** Stacked copy center axis + screenshot as second act — typography sells promise, image sells proof.

**HTML snippet:**

```html
<section id="hero" class="section section--hero">
  <div class="hero">
    <div class="hero__intro">
      <div class="hero__copy">
        <a href="#" class="hero__badge">
          <span class="hero__badge-pill">Eyebrow label</span>
        </a>
        <h1 class="hero__title animate-blur-fade">Display title</h1>
        <p class="hero__subcopy animate-blur-fade">Body text</p>
      </div>
      <div class="hero__actions animate-blur-fade">
        <div class="hero__buttons">
          <a href="#" class="hero__btn hero__btn--primary">Primary action</a>
          <a href="#" class="hero__btn hero__btn--secondary">Secondary action</a>
        </div>
        <div class="hero__platforms">
          <a href="#" class="hero__platform-link">Platform label</a>
        </div>
      </div>
    </div>
    <div class="hero__visual">
      <div class="hero__screenshot animate-fade-in">
        <img src="[asset]" alt="Product screenshot" loading="eager">
      </div>
    </div>
  </div>
</section>
```

**CSS snippet (composition-specific):**

```css
.hero__intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
  padding: 5rem 2rem 3.5rem;
}
.hero__buttons {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
@media (min-width: 640px) {
  .hero__buttons { flex-direction: row; }
}
```

**If adapting:** Swap screenshot for video or interactive demo; keep centered axis and staggered blur-fade load.

---

### Features (`data-section="features"`)

**Reference only** — source template bento grid; adapt or omit for other briefs.

**Role in source:** Centered serif section title + subcopy, then 12-card bento grid with CSS mini-UI illustrations and blur-fade stagger.
**Primitives used:** Typography — section heading, Typography — body, Card — tinted surface, Chip — status
**Learn:** Each card's illustration is a tiny product scene — teaches features through interface fragments, not generic icons.

**HTML snippet (representative card):**

```html
<section id="features" class="section section--features">
  <div class="features">
    <div class="features__header">
      <h2 class="features__title" data-animate>Section heading</h2>
      <p class="features__subcopy" data-animate>Body text</p>
    </div>
    <div class="features__grid">
      <div class="feature-card feature-card--animate" data-animate>
        <div class="feature-card__illustration" aria-hidden="true"><!-- mini UI --></div>
        <div class="feature-card__body">
          <h3 class="feature-card__title">Card title</h3>
          <p class="feature-card__desc">Card description</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

**CSS snippet (composition-specific):**

```css
.features__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  padding: 0 var(--page-gutter);
}
@media (min-width: 640px) { .features__grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .features__grid { grid-template-columns: repeat(3, 1fr); } }
.feature-card {
  display: flex;
  flex-direction: column;
  background: var(--color-card);
  border-radius: var(--radius-card);
}
```

**If adapting:** Reduce card count for simpler products; keep illustration + title + one-line description pattern. AI features may pair title row with Chip — status.

---

### Surfaces (`data-section="surfaces"`)

**Reference only** — source tabbed product tour; adapt or omit for other briefs.

**Role in source:** Headline + subcopy, segmented tab bar, cross-fading screenshot, caption, format icon grid.
**Primitives used:** Typography — section heading, Tab — segmented pill, Card — media frame
**Learn:** Tabs turn one horizontal band into five proof states without scrolling — ideal for multi-view products.

**HTML snippet:**

```html
<section id="surfaces" class="section section--surfaces">
  <div class="surfaces__wrap">
    <div class="surfaces__intro" data-animate>
      <h2 class="surfaces__title heading-xl">Section heading</h2>
      <p class="surfaces__subcopy subcopy">Body text</p>
    </div>
    <div class="surfaces__tabs-wrap" data-animate>
      <div class="surfaces__tabs" role="tablist">
        <button type="button" role="tab" class="surfaces__tab is-active" data-tab="view-a">
          <span class="surfaces__tab-indicator" aria-hidden="true"></span>
          <span class="surfaces__tab-label">Tab label</span>
        </button>
      </div>
    </div>
    <div class="surfaces__screenshot-wrap" data-animate>
      <div class="surfaces__screenshot">
        <img src="[asset]" alt="Product screenshot" class="surfaces__shot is-active" data-shot="view-a">
      </div>
      <p class="surfaces__caption">Caption text</p>
    </div>
  </div>
</section>
```

**JS snippet:**

```javascript
// See initSurfacesTabs() in Appendix — toggles is-active on tabs and shots
```

**If adapting:** Fewer tabs for simpler products; format grid optional if not multi-format.

---

### Devices (`data-section="devices"`)

**Reference only** — source cross-device proof band; adapt or omit for other briefs.

**Role in source:** Tinted card shell with centered headline, subcopy, three feature pills, overlapping device composite image.
**Primitives used:** Typography — section heading, Typography — body, Card — tinted surface
**Learn:** Negative margin on mockup (`margin-top: -8%`) pulls devices into headline space — creates depth without extra section.

**HTML snippet:**

```html
<section id="devices" class="section section--devices">
  <div class="devices__card" data-animate>
    <div class="devices__header">
      <h2 class="devices__title" data-animate>Section heading</h2>
      <p class="devices__subcopy" data-animate>Body text</p>
      <div class="devices__pills" data-animate>
        <span class="devices__pill">Feature label</span>
      </div>
    </div>
    <img class="devices__mockup" src="[asset]" alt="Product on multiple devices" loading="lazy">
  </div>
</section>
```

**If adapting:** Single-device products can use one screenshot; keep pill row for three proof points max.

---

### CTA (`data-section="cta"`)

**Reference only** — source closing conversion band; adapt or omit for other briefs.

**Role in source:** Narrow centered serif headline, compact black download button, muted platform note.
**Primitives used:** Typography — section heading, Button — primary
**Learn:** Smaller button than hero (2.25rem height, 0.5rem radius) signals epilogue — not a second hero.

**HTML snippet:**

```html
<section id="cta" class="section section--cta">
  <div class="cta__inner content-wrap content-wrap--narrow">
    <h2 class="cta__title" data-animate>Section heading</h2>
    <div class="cta__actions" data-animate>
      <a href="#" class="cta__download">Primary action</a>
      <span class="cta__note">Supporting note</span>
    </div>
  </div>
</section>
```

**If adapting:** Works as final band on any landing; swap platform note for pricing or trust line.

---

### Footer (`data-section="footer"`)

**Reference only** — source minimal footer; adapt or omit for other briefs.

**Role in source:** Large top padding, inline wordmark SVG + copyright, wrapped muted link row. No background image.
**Primitives used:** Typography — caption
**Learn:** Footer recedes via 35% ink opacity — page ends quietly without a dark band.

**HTML snippet:**

```html
<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__brand">
      <svg class="site-footer__wordmark" aria-hidden="true"><!-- wordmark paths --></svg>
      <p class="site-footer__copyright">© Year Brand name</p>
    </div>
    <nav class="site-footer__links" aria-label="Footer">
      <a href="#" class="site-footer__link">Footer link</a>
    </nav>
  </div>
</footer>
```

**If adapting:** Replace wordmark SVG with text logo; keep low-contrast link hover lift to 5% tint.

---

## Composition guide

### Applying the design language to any brief

Port tokens and primitives into the user's stack first — CSS variables, Tailwind theme extension, or design-system tokens. For a dashboard or app shell: use Signifier for page titles only, Inter for all controls, black primary buttons, blue accent for AI/active states, and tinted `--color-card` panels instead of white cards with heavy borders. Replace screenshot proof with live components where appropriate, but keep glass-frame treatment on any embedded product imagery. Motion: one blur-fade signature per viewport area — do not stack IO reveals on every row in dense tables.

### Source page rhythm *(optional)*

Reference narrative order: sticky nav → centered hero with screenshot → bento features → tabbed surfaces tour → device composite band → compact CTA → quiet footer. Spacing escalates from tight hero intro to generous section padding mid-page, then tightens for CTA and footer.

### Combining primitives

Stack Badge → Display title → Subcopy → Button pair vertically on center axis. Pair one black primary with one secondary surface button. Use Chip — status beside card titles for optional AI features only. Place media frames full-width within content wrap, never bleeding past `--max-content`. Nav download stays secondary surface; hero carries the black primary.

### Animation stacking

Limit to one IO observer pattern: `[data-animate]` with `.is-visible`. Hero uses CSS animation classes on load; below-fold uses observer. Stagger delays ≤ 0.15s steps inside a grid. Tab crossfade and scroll reveal should not run simultaneously on the same element. Add `prefers-reduced-motion: reduce` to skip blur filter.

### New work checklist

- All colours from tokens — no stray hex in components?
- One motion signature per viewport region?
- Signifier only on headings — Inter on UI?
- Geist Mono only in illustrated micro-UI?
- Product imagery uses glass-frame treatment?
- Responsive: stacked CTAs, 1-col bento, touch-friendly tabs on mobile?
- No origin template copy in shipped content?

---

## Appendix: global scripts

### IntersectionObserver scroll reveals

Powers `[data-animate]` elements in features, surfaces, devices, CTA, and footer. Threshold `0.15`, `rootMargin: '0px 0px -40px 0px'`. Adds `.is-visible` once, then unobserves.

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
```

### Surfaces tab switcher

`initSurfacesTabs()` — click handler on `[role="tab"]` toggles `.is-active` on tabs, injects/removes `.surfaces__tab-indicator`, and crossfades `.surfaces__shot` by `data-shot` / `data-tab` match. See **Reference components → Surfaces**.

Read the design spec and follow instructions.