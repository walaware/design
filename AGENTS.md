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
7. Run `pnpm run check` then `pnpm run package` — both must be clean.
8. Emit two artifacts: the **NEW/CHANGED/UNCHANGED report** (+ non-1:1 ports) for the
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
