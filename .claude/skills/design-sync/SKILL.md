---
name: design-sync
description: Ingest a Claude Design export (a zip dropped in ./incoming) and reconcile it into this Svelte design system — inventory, diff, sync tokens, port NEW/CHANGED components, update barrel/demo/README, then emit a human report and a sync-back summary for Claude Design. Use when the user drops a design zip, mentions syncing/ingesting a design export, or says "sync claude design".
---

# Design Sync (Claude Design ⇄ Claude Code)

Reconcile an upstream React design export into this Svelte repo. The React design
system (Claude Design) is the source of truth for component **design + behaviour**;
this repo owns the Svelte implementation **and the app roster** (see AGENTS.md →
"Canonical app roster"). Read `AGENTS.md` first — it holds the conventions, the
token namespace mapping, and the scope rules this skill depends on.

## Inputs

- A zip at `incoming/<name>.zip` (the `/incoming` folder is gitignored). If the user
  hasn't named one, check `incoming/` for the most recent zip.
- Export layout: each component is a folder of `<Name>.jsx` (reference behaviour),
  `<Name>.d.ts` (typed public API = the contract), `<Name>.prompt.md` (usage notes).
  Tokens live in `tokens/*.css` as CSS custom properties.

## Procedure

1. **Unpack.** Unzip to `incoming/<name>/`. List every component (path, exported
   name, props from its `.d.ts`) and every token file.

2. **Diff** against this repo (`src/lib/**`, `src/lib/theme.css`). Classify each
   component and token group as **NEW**, **CHANGED** (prop or behaviour delta), or
   **UNCHANGED**. **Never modify UNCHANGED files.** Compare upstream `.d.ts` props +
   defaults against the repo component's `$props()` interface; remember color tokens
   are `--color-*`-prefixed here (see the mapping table in AGENTS.md), so a bare-name
   vs prefixed difference is **not** a real change.

3. **Sync tokens first** into `src/lib/theme.css`:
   - Preserve the `[data-app]` scope structure and the constant `--color-wala`.
   - Apply the namespace mapping (`--coral-500` → `--color-coral-500`, etc.).
   - Flag any token rename/removal that would break existing components.
   - **App roster:** this repo is truth. If the export uses old app names
     (`mealwala`→`healthwala`, `spendwala`→`moneywala`) or omits `folkwala`, keep the
     repo's roster and record the drift for the sync-back summary — do not downgrade.

4. **Port NEW + CHANGED components** to Svelte following the repo conventions in
   AGENTS.md (runes, `Snippet` children, scoped `<style>` classes + CSS vars, `class`
   + `{...rest}` pass-through, `--color-*` semantics). Keep public prop names and
   defaults identical to the `.d.ts`. A React "node" prop becomes `string | Snippet`.
   **Do not port app-domain components** (anything that encodes one app's domain, e.g.
   a `trip/` category) — list them as intentionally out-of-scope per the rule of three.

5. **Register** every added/changed component: export from `src/lib/index.ts`, add a
   usage to the demo in `src/routes/+page.svelte`, and update the component table in
   `README.md`. Match how existing entries are registered.

6. **Verify.** Run `pnpm run check` (0 errors/warnings) then `pnpm run package`
   (publint "All good!"). Fix anything that fails.

7. **Stop and ask** for anything that can't map 1:1 to Svelte (React-specific
   composition, ambiguous scope) rather than guessing. List these explicitly.

## Outputs (always produce both)

- **Human report** — NEW / CHANGED / UNCHANGED tables, files written, and the list of
  non-1:1 ports / out-of-scope items / decisions needed.
- **Sync-back summary for Claude Design** — a copy-pasteable block telling the upstream
  design system what to change so it matches this repo: app renames/additions, token
  divergences, any contract corrections, and components this repo intentionally won't
  carry. The human feeds this to Claude Design to keep the two-way sync converging.
