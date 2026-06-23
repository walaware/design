# AGENTS.md — @walaware/design

Context for AI agents working in this repo. Read this before making changes.

## What this is

`@walaware/design` is the shared house style ("Campfire" — warm sand/cocoa
neutrals, per-app accent, constant coral "wala" thread) for the walaware family
of life apps. It ships:

- **Design tokens** as a single Tailwind v4 CSS-first file: `src/lib/theme.css`.
- **Svelte 5 components**, organized by domain under `src/lib/`.
- A **barrel export** at `src/lib/index.ts` and a live demo at `src/routes/+page.svelte`.

The **React design system in Claude Design is the upstream source of truth for
component design and behaviour**; this repo is the Svelte implementation. The two
are kept in sync by hand via the workflow below. **Exception: app names / the app
roster are owned HERE** (see "Canonical app roster").

## Repo conventions (match these exactly)

Components are Svelte 5 with runes. Before writing one, read 2–3 neighbours
(`core/Button.svelte`, `core/Chip.svelte`, `core/Card.svelte`).

- `<script lang="ts">`, props via `$props()`, an `interface Props` (extend
  `HTMLAttributes<HTMLXElement>` / `HTMLButtonAttributes` etc. when the root is a
  real element so native attrs pass through).
- Children and slotted content are `Snippet`s rendered with `{@render ...}`. There
  are no React-style `ReactNode` props — a "node" prop becomes `string | Snippet`.
- Pass-through pattern: `let { ..., class: klass = '', ...rest }: Props = $props()`
  then spread `{...rest}` and interpolate `{klass}` onto the root element.
- Derived state with `$derived`, local state with `$state`, two-way props with
  `$bindable`. Side-effect cleanup (timers) via `onDestroy`.
- Styling is **scoped `<style>` with classes + CSS custom properties** — variant/
  tone/size become classes (`v-{variant}`, `t-{tone}`, `s-{size}`), and per-variant
  values are bound through local `--vars`. Do **not** port React inline-style objects
  verbatim; translate them to scoped classes.
- Components read **semantic, namespaced** tokens — `--color-primary`,
  `--color-text-strong`, `--radius-md`, `--shadow-pop`, never hard-coded hues.
- One comment block above the markup describing the component's role.
- Keep each component's **public prop names + defaults identical to its upstream
  `.d.ts`**. Treat `.d.ts` + `.prompt.md` as the contract, `.jsx` as reference behaviour.

### Token namespace mapping (upstream → this repo)

Upstream React tokens are unprefixed; this repo's color tokens carry Tailwind v4's
`--color-*` prefix. Non-color tokens are identical.

| Upstream            | This repo                  |
| ------------------- | -------------------------- |
| `--coral-500`       | `--color-coral-500`        |
| `--primary*`        | `--color-primary*`         |
| `--wala`, `--wala-soft` | `--color-wala`, `--color-wala-soft` |
| `--text-strong`     | `--color-text-strong`      |
| `--sand-300`        | `--color-sand-300`         |
| `--radius-md`, `--shadow-pop`, `--font-body`, `--text-tiny`, `--space-*`, `--dur-*`, `--ease-*` | identical |

## Per-app accent contract

A screen sets `data-app="<name>"` on a wrapper; `theme.css` remaps
`--color-primary*` (+ focus ring) to that app's accent. `--color-wala` (coral) is
**never** remapped — it's the family thread. Components that use `--color-primary*`
recolor automatically. Preserve this `[data-app]` scope structure on every token sync.

### Canonical app roster (this repo is truth)

```
tripwala   coral   #FF7A59  Journeys & trips
healthwala amber   #F59E14  Health & meals      (was "mealwala" upstream)
stuffwala  teal    #2FB6A3  Personal inventory
moneywala  leaf    #3FA66A  Money & expenses    (was "spendwala" upstream)
shopwala   berry   #E84F7C  Buying & selling
taskwala   sky     #4F9ED1  Plans & tasks
folkwala   grape   #B57EDC  People & relationships
```

Defined in `theme.css` (`[data-app]` scopes + `--acc-*` tokens) and `brand/suite.ts`
(`WALA_SUITE`). As of the AppShell sync, upstream (Claude Design) has converged on
this roster — `mealwala`→`healthwala`, `spendwala`→`moneywala`, and `folkwala` added.
If a future export ever regresses to the old names, **do not downgrade** — keep this
roster and flag the drift in the sync-back summary.

## Screen layout recipe (for app repos)

This repo is the **layout source of truth** for every walaware app. An app repo
should depend on `@walaware/design`, import `theme.css`, and build screens from this
recipe + the component kit — it should **not** copy markup from Claude Design's
`templates/` or `ui_kits/` (those are visual reference only, not shipped code).
Typical flow: Claude Design generates a mock → map the mock onto the mode + scaffold
below using the kit's components and the semantic tokens in `theme.css`.

**Always:** set `data-app="<name>"` on the screen root so the accent + wordmark
resolve (coral `--color-wala` stays constant). Read semantic tokens, never hues.

### Pick a layout mode

- **`AppShell`** — multi-destination apps (nav, several screens, account/settings).
  Import it from `@walaware/design`; supply `app`, `nav`, `account`, `onSettings`;
  the shell owns brand lockup + nav + drawer. Content column caps at `maxWidth`
  (default **920px**). Desktop = left sidebar; below `breakpoint` (920px) = top bar +
  drawer. See `src/routes/shell/+page.svelte` for a worked screen.
- **Single mobile column** — one focused surface (no nav). A centered column capped at
  `--screen-max` (**430px**), `min-height: 100vh`, flex column, with its own header
  (`AppIcon` + `Wordmark` + a trailing `IconButton`). Mirrors `templates/app-starter`.

```svelte
<!-- single-column scaffold -->
<div data-app="shopwala" class="screen">
  <header class="screen-head">
    <AppIcon app="shopwala" size={44} />
    <Wordmark root="shop" size={30} />
    <IconButton tone="soft" aria-label="More" class="ml-auto">⋯</IconButton>
  </header>
  <div class="intro">
    <h1>What are you selling?</h1>          <!-- sentence-case question, Fredoka display -->
    <p>One friendly line of context.</p>     <!-- 15px body, text-wrap: pretty -->
  </div>
  <section class="sections">                 <!-- gap: var(--stack-gap); padding: 0 gutter -->
    <Card><CardHeader icon="🏷️" title="Your listings" /> … </Card>
    <Card> … </Card>
  </section>
</div>
```

### Page rhythm (both modes)

- **Sections are `Card`s led by `CardHeader`** — an emoji tile + a sentence-case
  *question* title ("What to bring", not "Items"). One leading emoji per section.
- **Stack gap** between cards: `--stack-gap` (14px). Card padding: `--card-pad` (18px).
  `Card` has no margin of its own — the **parent** supplies spacing via a flex column
  with `gap` (don't rely on card margins).
- **Gutter** (screen side padding): `--gutter` (16px; templates go up to 20px). Min tap
  target `--tap-min` (44px).
- **Type:** page title = `--text-display` (Fredoka, ~28px); section titles via
  `CardHeader`; body = `--text-body` (Nunito 15px), line-height ~1.5, `text-wrap: pretty`.
  Never below `--text-tiny` (11.5px) — tiny meta labels only.
- **Surfaces:** white cards, `--radius-lg` (24px), `--shadow-card` (accent-tinted) — **no
  border**. Hero/sheet = `--radius-xl` (28px). Tiles/inputs = `--radius-md` (16px).
  Everything tappable (buttons, chips, avatars, segmented control) is a **pill**.
  Hairlines on rows/inputs use `--color-sand-300`.
- **Motion:** `--ease-spring` for pops/toggles, `--ease-out` otherwise; durations
  `--dur-fast` 120ms (press) / `--dur-base` 200ms / `--dur-pop` 320ms. No ambient motion.
- **Iconography:** **emoji** for in-content signifiers (one per section), **Lucide** line
  glyphs for chrome/controls (the sanctioned set — `AppShell` does this for settings/menu;
  app glyphs live in `WALA_GLYPHS`). Never hand-draw decorative SVG.
- **Voice/empties:** speak to *you* about *we/us*; titles are questions; empty states
  invite (`EmptyState` — "It's quiet in here…"), completion celebrates.

All values above are tokens in `src/lib/theme.css` — that file is the source; this is the
map. When in doubt, open `src/routes/+page.svelte` (gallery) or `/shell` for live patterns.

### Per-app layouts (`docs/apps/`)

Each app's screens, navigation, and UX context are captured in `docs/apps/<app>.md`
(start from `docs/apps/TEMPLATE.md`; index in the README → "App layouts"). Because
Claude Design usually mocks **several screens per app**, capture them thoroughly there —
layout mode, section-by-section breakdown, the components each uses, states, and the
non-obvious context (e.g. shopwala's agent-escalation model). When a design sync brings
new/changed mocks for an app (a `templates/<app>` or `ui_kits/*` folder in the package),
create or update that app's file as part of the sync.

## Scope: what belongs in the shared kit

Generic primitives and patterns only (brand, core, people, forms, feedback).
**App-specific / domain components live in the app's own repo** — e.g. tripwala's
expense splitter, settle-up summary, claim row. Promote a pattern up only after
it's proven in ~3 apps (the "rule of three" — see README). When an upstream export
contains app-domain components (e.g. a `trip/` category), **do not port them**;
list them as intentionally out-of-scope.

## Design-sync workflow (Claude Design ⇄ Claude Code)

Recurring task: ingest a design export and reconcile it into this repo. A repo skill
automates it — see `.claude/skills/design-sync/SKILL.md`. In short:

1. A zip is dropped at `incoming/<name>.zip` (the `/incoming` folder is gitignored).
2. Unzip, inventory every component (`.d.ts` props) and token file.
3. Diff vs this repo → **NEW / CHANGED / UNCHANGED**. Never touch UNCHANGED files.
4. Sync tokens first (preserve `[data-app]` scopes + `--color-wala`; flag breaking
   renames/removals; remember the namespace mapping and the canonical-roster rule).
5. Port NEW + CHANGED components to Svelte per the conventions above; keep public
   prop names + defaults identical to each `.d.ts`.
6. Update `src/lib/index.ts`, the demo in `src/routes/+page.svelte`, and the README
   component table.
7. If the package carries app screens (`templates/<app>`, `ui_kits/*`), capture/update
   `docs/apps/<app>.md` (layout, screens, context) and the README "App layouts" index.
8. Run `pnpm run check` then `pnpm run package` — both must be clean.
9. Emit two artifacts: the **NEW/CHANGED/UNCHANGED report** (+ non-1:1 ports) for the
   human, and a **sync-back summary** to feed to Claude Design so upstream matches
   this repo (renames, additions, divergences).

## Verify before done

- `pnpm run check` → 0 errors/warnings.
- `pnpm run package` → publint "All good!".
- **Smoke-test the dev server**: `pnpm dev`, then `curl` every route — each must
  return `200`, not `500`. `check`/`package` use the full TS compiler and pass on code
  the dev server's lighter TS-stripper rejects. Known trap: an optional function param
  `(fn?: () => void)` strips to invalid `(fn?)` and 500s dev SSR — write
  `(fn: (() => void) | undefined)` instead.
- New/changed component exported from `src/lib/index.ts` and shown in the demo.
