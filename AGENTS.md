# AGENTS.md — @walaware/design

Context for AI agents working in this repo. Read this before making changes.

## What this is

`@walaware/design` is the shared house style ("Campfire" — warm sand/cocoa
neutrals, per-app accent, constant coral "wala" thread) for the walaware family
of life apps. It ships:

- **Design tokens** as a single Tailwind v4 CSS-first file: `src/lib/theme.css`.
- **Svelte 5 components**, organized by domain under `src/lib/`.
- A **barrel export** at `src/lib/index.ts` and a live demo at `src/routes/+page.svelte`.

The **React design system in Claude Design is the source of truth for component
design and behaviour**; this repo is the Svelte implementation. **This repo + agent is
the sync hub**: app repos consume the shipped package and point only here, and this repo
is kept in **two-way sync** with Claude Design via the live **DesignSync** MCP tool
(see the design-sync workflow below). **Exception: app names / the app roster are owned
HERE** (see "Canonical app roster").

## Org conventions (walaware/.github)

[`walaware/.github`](https://github.com/walaware/.github) is the org-wide source of truth
for conventions + architecture (the suite names two sync sources: that repo for
conventions, **this** repo for design). Adopt new conventions as they land so this repo
doesn't drift. The ones that apply to this repo **as a shared library** (most are
app-only — PocketBase, OAuth, Caddy, secrets):

- **Library playground port `5901`** — shared libraries run their demo off the app dev
  grid (apps take `5173 + n*100`); pinned in `vite.config.js`. (`5901` not `5900` — `5900`
  is macOS Screen Sharing/VNC.)
- **License `MIT`** — shared libraries are MIT (apps are AGPL-3.0). ✓ already.
- **SvelteKit 5 web conventions** — runes, Prettier, `pnpm check` clean before a PR —
  already mirrored under "Repo conventions" below.

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

## Requests from app agents

App agents don't build new shared surfaces themselves. Per
[for-agents.md](https://github.com/walaware/.github/blob/main/docs/for-agents.md#need-a-new-visual-surface-route-it-through-design),
when an app needs a new component / page / visual surface that isn't app-specific,
it **requests a new package from this repo** rather than building the shared piece
in the app. This repo is the entry point — take the request, then run it through
the sync below. Requests usually arrive over **Paseo** — the app agent finds this
repo's design agent with `paseo ls -g` and sends the brief with
`paseo send <design-agent-id> "…"` (the same channel the shopwala/tripwala agents
use); the brief describes the surface and the job it does.

1. **Consult Claude Design** for the requested surface — drive it with
   [`tools/designer/`](tools/designer/README.md) (the [designer](https://github.com/pro-vi/designer)
   MCP/CLI), which prompts **claude.ai/design** with the brief *plus this repo's
   codebase context*, then `designer handoff` exports the result to disk. On this
   headless box, bring the stack up first: `tools/designer/designer-up.sh up`
   (Xvfb + logged-in Chrome over CDP; one-time VNC login per the runbook). If
   designer is unavailable, fall back to consulting Claude Design by hand.
2. **Pull it in** and port to Svelte (the design-sync flow), releasing an updated
   `@walaware/design` (`pnpm version …`).
3. **Hand back** the released **package + the app-specific guidance** (captured in
   `docs/apps/<app>.md`) over Paseo (reply to the app agent's `paseo send`, or post in
   the shared coordination room) so the app agent can resume its frontend work.

App-**domain** components still stay in the app's own repo — see "Scope". Only
generic, non-app-specific surfaces come through here.

## Design-sync workflow (two-way, via the DesignSync MCP)

Recurring task: keep this repo and the **walaware Design System** Claude Design project
in sync — **both directions**. The `design-sync` skill drives it
(`.claude/skills/design-sync/SKILL.md`); run `/design-login` once to authorize the live
**DesignSync** MCP tool. In short:

- **Access:** live DesignSync MCP is the **primary** path — `list_files`/`get_file` to
  diff, `finalize_plan`→`write_files` to push. A zip in `incoming/` is a **deprecated
  fallback** for when the MCP isn't available (headless/cron); `/incoming` stays
  gitignored.
- **Pull (Claude Design → repo):** diff `.d.ts` props vs each component's `$props()` →
  **NEW / CHANGED / UNCHANGED** (never touch UNCHANGED). Tokens first (preserve
  `[data-app]` scopes, `--color-wala`, `@theme static`; namespace mapping;
  canonical-roster rule). Port NEW+CHANGED to Svelte, prop names/defaults identical to
  the `.d.ts`; register in `index.ts` + demo + README; capture `docs/apps/<app>.md` for
  any `templates/<app>`/`ui_kits/*`.
- **Push (repo → Claude Design):** after a repo-originated change ships, mirror its
  contract + reference + prompt into the React source (`get_file` to match their style,
  author to a staging dir, `finalize_plan`→`write_files`, read-back to verify).
  Incrementally — changed components only. Svelte-only concerns (e.g. `@theme static`)
  are **not** pushed.
- **Verify:** `pnpm run check` + `pnpm run package` clean, dev-server smoke (routes 200),
  then `pnpm version patch|minor` to release the Svelte side (apps bump `#v0.x.y`).
- **Output:** a human NEW/CHANGED/UNCHANGED report noting what was written **on each
  side** + the release tag. (A copy-paste sync-back block is only for the zip fallback.)

## Verify before done

- `pnpm run check` → 0 errors/warnings.
- `pnpm run package` → publint "All good!".
- **Smoke-test the dev server**: `pnpm dev` (pinned to **`5901`** in `vite.config.js` —
  the registered library playground port, off the app dev grid), then `curl` every route
  — each must return `200`, not `500`. `check`/`package` use the full TS compiler and pass
  on code the dev server's lighter TS-stripper rejects. Known trap: an optional function
  param `(fn?: () => void)` strips to invalid `(fn?)` and 500s dev SSR — write
  `(fn: (() => void) | undefined)` instead.
- New/changed component exported from `src/lib/index.ts` and shown in the demo.
