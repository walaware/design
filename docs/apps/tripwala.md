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

## App-specific patterns

These are tripwala-domain and live in **tripwala's own repo**, not the shared kit
(rule of three — they're upstream's `trip/` category, intentionally not ported here):

- `ClaimRow` — claimable line item with an up-for-grabs state.
- `ExpenseRow` — a split-cost line.
- `BalanceSummary` — settle-up / who-owes-whom.
- GPX route map panel — the sanctioned drawn UI.

## Open questions / TODO

- ~~Decide if/when tripwala moves from single-page to AppShell (multi-trip).~~ **Resolved
  2026-06-23:** adopted `AppShell` two-level (global destinations → contextual section nav).
- Build out the "soon" modules (Itinerary · Map · Photos) when designed upstream.
