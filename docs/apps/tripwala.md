# tripwala — account-less group trips

**Accent:** Coral `#FF7A59` (the house default + the constant `--color-wala`) · **Glyph:** `compass` · **Root:** `trip` · **`data-app`:** `tripwala`
**Layout mode:** `AppShell`, two-level — global destinations → **contextual section nav** (scrollSpy) over one scrollable trip page
**Status:** designing · **Last mock sync:** 2026-06-23 (`ui_kits/rally` worked example + AppShell contextual mode in the Claude Design package)

## Context

tripwala plans a group trip with **no accounts** — people are identified by a coloured
initial they "claim", so anyone with the link can participate. A trip is a single scroll
of modular **sections** chosen by trip type (a road trip shows route + gas; a cabin
weekend shows meals + packing). The emotional job: make "are we actually doing this?"
feel light and social, hence the flaky-maybe RSVP and up-for-grabs claiming.

Note: tripwala is the app the Campfire house style was originally authored for, so its
patterns seeded much of the shared kit.

## Navigation

tripwala now uses **`AppShell` in both of its modes** (the contextual mode is a shared
shell capability — see the AppShell prop table in the README; demo at `/shell` → "Open a
trip"). Two levels:

- **App level** — global destinations: `Trips · Today`. Standard `nav[].active` + `onClick`.
- **Contextual (a trip is open)** — the sidebar becomes a **section nav over ONE
  scrollable page** (no sub-routes):
  - `back={{ label: 'All trips', onClick }}` exits the trip (also closes the drawer).
  - `scrollSpy` turns `nav` into in-page anchors — each item targets a `<section id>` via
    `href="#id"`; the shell smooth-scrolls on click and highlights the active section on
    scroll.
  - `title={trip.name}` shows the trip name in the mobile top bar (in place of the wordmark).
  - Module nav set: `Overview · Dates · Who's coming · Gear · Food · Packing · Expenses ·
    Trip settings`, then a dimmed **`soon`** group (`Itinerary · Map · Photos`) for roadmap items.
  - **Consumer contract:** render the modules as one long page of `<section id="…">`s, and
    mark the sticky trip header `data-appshell-sticky` so scrollSpy offsets land right.

## Screens

### Trip page (contextual mode — one scroll of `<section>` modules under the section nav)

- **Purpose:** everything about one trip on one page; module nav + scrollspy navigate it;
  the section set varies by trip type.
- **Layout:** `AppShell` contextual mode; a sticky trip header (`data-appshell-sticky`:
  AppIcon, trip title + dates + status chips), then a `--stack-gap` stack of `<section
  id>` `Card` modules. The page is also customizable (an "Add a section" affordance).
- **Sections** (each a `Card` + `CardHeader` emoji/question title, wrapped in a `<section id>`):
  - `🙌 Who's coming?` (**people**) — RSVP `Going / Maybe / Out`; `Maybe` opens a
    **flaky-maybe** confidence picker (`LeanMeter`: long-shot → 50/50 → leaning-yes).
    Uses `Avatar`, `SegmentedControl`, `LeanMeter`, status emoji 🔥🤔💤.
  - `🎒 What to bring` (**claim**) — claimable items; unclaimed read "up for grabs!".
    Uses `ClaimRow`, `EmptyState`.
  - `🗺️ Route` (**route**) — a GPX map panel. The **one sanctioned hand-drawn graphic**
    (functional product UI), everything else is Lucide/emoji.
  - `💬 Trip chat` (**chat**) — `ChatMessage` + `Composer`.
  - `💰 Expenses` (**expenses**) — split costs (Groceries / Gas / Campsite…), settle-up.
    Uses `ExpenseRow`, `BalanceSummary`.
- **States:** empty sections invite ("It's quiet in here… be the first!"); completion
  celebrates.

## App-domain components (tripwala builds these in its own repo)

These are tripwala-domain and live in **tripwala's own repo**, not the shared `@walaware/design`
package (rule of three — they're upstream's `trip/` category, intentionally not exported). The
shared package **does not** ship them; there is no `@walaware/design/trip` import.

**But the design is specified** — the contracts + usage below are mirrored from the Claude
Design source (`components/trip/*` + the `ui_kits/rally` worked example) so the tripwala agent
has the full spec in one place. tripwala writes the **Svelte** implementation once, composing the
shared primitives it already imports (`Avatar`, `Button`, `Card`, `CardHeader`, `Chip`,
`SegmentedControl`, `LeanMeter`, `ChatMessage`, `Composer`, `EmptyState`, `IconButton`).

### `ClaimRow` — claimable gear/task row (Rally's signature component)
Emoji tile + item; shows a "Grab it" button when unclaimed, swaps to the claimer's `Avatar`
once taken. Composes `Avatar` + `Button`.

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `emoji` | node | leading tile glyph (default `🎒`) |
| `emojiBg` | string | tile background (default `--color-sand-200`; takes coral once claimed) |
| `name` | node | item name (e.g. "Camp stove") |
| `note` | node | sub-text when unclaimed (e.g. "up for grabs!") |
| `claimedBy` | `string \| null` | claimer's name; `null` = unclaimed |
| `claimColor` | string | override claimer avatar colour |
| `onClaim` | `() => void` | grab action |
| `claimLabel` | string | grab button label (default "Grab it"; rally uses "I'll do it" once you've joined) |
| `divider` | boolean | top divider (default true; pass `false` on the first row) |

### `ExpenseRow` — one shared cost line
What it was, who paid, how it splits, total + per-person. Stack inside a `Card`.

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `emoji` | node | tile glyph (default `💸`) |
| `title` | node | what the expense was for |
| `amount` | number | total |
| `paidBy` | string | who fronted it |
| `paidColor` | string | payer avatar colour |
| `splitCount` | number | people it splits across (drives the per-person figure) |
| `splitLabel` | string | override split text (e.g. "just Maya & Theo", else "everyone") |
| `divider` | boolean | top divider (default true) |

### `BalanceSummary` — net position + settle-up
The payoff of expense tracking: the current user's net (`+` owed to you / `−` you owe) and the
minimal who-pays-whom lines. A fully-settled trip shows a 🎉. Composes `Avatar`.

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `youNet` | number | current user's net (default 0) |
| `settlements` | `Settlement[]` | `{ from, fromColor?, to, toColor?, amount }[]` |

### Route map panel (`route` section)
A GPX map panel — **the one sanctioned hand-drawn graphic** (functional product UI); everything
else stays Lucide/emoji. Data shape: `{ file, track: [[x,y]…], distance, gain, days, road?, stops? }`.

### Section model + trip types (the page's data shape)
A trip is `{ type, title, where, dates, sections[] }`. Each **section is a modular block** keyed by
`kind` — nothing is hard-required, every section is relabelable and its items editable, and the
page has an "Add a section" affordance. Kinds and what renders them:

| `kind` | Renders | Shared parts used |
| ------ | ------- | ----------------- |
| `people` | RSVP list + your answer; `Maybe` opens the **flaky-maybe** confidence picker | `Avatar`, `SegmentedControl`, `LeanMeter`, status emoji 🔥🤔💤 |
| `claim` | list of `ClaimRow`s; empty → `EmptyState`; footer "N still open" / "🎉 All covered!" | `ClaimRow`, `EmptyState`, `IconButton` (＋ add) |
| `route` | the GPX map panel | (app-domain drawn UI) |
| `chat` | scrollable `ChatMessage` log + `Composer` | `ChatMessage`, `Composer` |
| `expenses` | `BalanceSummary` headline + `ExpenseRow` list | `BalanceSummary`, `ExpenseRow`, `IconButton` |

A **trip type** just seeds a starting set of sections — Rally ships `camping`, `backpacking`,
`roadtrip`, `overlanding`, `cabin` (a type picker swaps the set). Expense **splitting** is computed
(`split: "everyone"` or a named subset → greedy min-cash-flow settlements). Full seed data +
the balance algorithm are in the Claude Design `ui_kits/rally/tripData.jsx` reference.

> These map onto the contextual-mode `<section id>` modules (see Navigation): `people`→`#crew`,
> `claim`→`#gear`/`#packing`/`#food`, `route`→`#map` (a "soon" module today), `expenses`→`#expenses`,
> `chat`→a chat module. Build the Svelte versions in tripwala's repo; this doc is the contract.

## Open questions / TODO

- ~~Decide if/when tripwala moves from single-page to AppShell (multi-trip).~~ **Resolved
  2026-06-23:** adopted `AppShell` two-level (global destinations → contextual section nav).
- Build out the "soon" modules (Itinerary · Map · Photos) when designed upstream.
