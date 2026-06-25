# tripwala — account-less group trips

**Accent:** Coral `#FF7A59` (the house default + the constant `--color-wala`) · **Glyph:** `compass` · **Root:** `trip` · **`data-app`:** `tripwala`
**Layout mode:** `AppShell`, two-level — global destinations → **contextual section nav** (scrollSpy) over one scrollable trip page
**Status:** designing · **Last mock sync:** 2026-06-23 (`templates/tripwala` multi-trip + AppShell contextual workspace; `ui_kits/rally` single-page worked example — both in the Claude Design package)

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

**App level** — global destinations, coral accent, Settings via `onSettings`. Only **Trips**
is live today; the rest are dimmed `soon` roadmap rows (matches the current upstream template):

| key | label | icon | state |
| --- | ----- | ---- | ----- |
| `trips` | Trips | 🧭 | **active** (stays active while a trip is open) |
| `calendar` | Calendar | 📅 | `soon` |
| `planner` | Planner | 🗓️ | `soon` |
| `map` | Map | 🗺️ | `soon` |

> **Not "Today".** Earlier drafts of this doc said "Trips · Today" — that was wrong. The live
> app-level nav is **Trips** + the three `soon` rows above.

> **Profile entry point.** The account avatar in the shell is the way into the profile editor:
> pass `account.onProfile` to `AppShell` (added in **v0.3.3**) and the avatar — in both the
> desktop sidebar footer and the mobile top bar — becomes a `"Your profile"` button. Leave
> `onProfile` unset and the avatar stays non-interactive (today's behaviour). Wire it to open
> the **Profile editor** screen below.

**Contextual (a trip is open)** — the sidebar becomes a **section nav over ONE scrollable
page** (no sub-routes): `back={{ label: 'All trips', onClick }}` exits (also closes the
drawer); `scrollSpy` turns `nav` into in-page anchors. On **mobile**, the shell now
**collapses the sticky trip header into the top bar** (added in **v0.4.0**): pass
`title={trip.name}`, `subtitle="{dates} · {where}"`, and `icon={trip.emoji}` — the top bar
shows the brand while the trip header is in view, then crossfades to the trip's icon + name +
subtitle as the header scrolls under it (so the name shows once, not twice). This replaces the
app-side `collapseHeader` prototype, which reached into kit DOM (hiding the top-bar icon via
`html[data-trip] .wala-appshell .topbar > [role="img"]`) and managed the header's sticky/offset
coupling itself — all now owned by the kit. Module nav (each row → a `<section id>`):

| key | label | icon | `<section>` |
| --- | ----- | ---- | ----------- |
| `overview` | Overview | ✨ | `#overview` |
| `dates` | Dates | 📅 | `#dates` |
| `crew` | Who's coming | 🙌 | `#crew` |
| `gear` | Gear | 🎒 | `#gear` |
| `food` | Food | 🍳 | `#food` |
| `packing` | Packing | 🧳 | `#packing` |
| `expenses` | Expenses | 💸 | `#expenses` |
| `tripsettings` | Trip settings | ⚙️ | `#tripsettings` |

…then a dimmed **`soon`** group: `Itinerary 🗓️ · Map 🗺️ · Photos 📷`. **Consumer contract:**
render the modules as one long page of `<section id="…">`s (the ids above), and mark the
sticky trip header `data-appshell-sticky` so scrollSpy offsets land right.

## Layout conventions (the 2026-06-23 cleanup)

The current `templates/tripwala` tightened the visual language. Apply these consistently —
they're how the cleaned-up mocks read:

- **Section header sits *above* the card, not inside it.** Each `<section id>` opens with a
  header row — `emoji (17px) + <h2> (font-display 600, 18px)` and an optional muted
  subtitle (e.g. "— who's bringing what") or right-aligned `Chip`s — then the `Card` below
  holds the rows. (This differs from the rally model, which put the title in `CardHeader`
  *inside* the card. Either is valid; the template uses header-above-card.)
- **Horizontal dividers** between list rows: `border-top: 1px solid var(--color-sand-200)`,
  and **the first row omits it** (same rule as `ClaimRow`/`ExpenseRow` `divider` default
  `true` → pass `false` on row 0). Structural separators (sticky header, Trips-home section
  headers) use the heavier `--color-sand-300`.
- **Action / button alignment** is always right via `margin-left:auto` (or the action as the
  last flex child). Button vocabulary: header CTA = `Button variant="primary"`; an inline
  row action like claim = `Button variant="soft" size="sm"`; destructive/quiet = `Button
  variant="ghost" size="sm"`. Header actions can also use `CardHeader action={…}` (already
  right-aligns).
- **Row rhythm:** list rows are `padding: 11px 0`, `gap: 11px`; a leading 20px emoji in a
  26px-wide centered slot; the label `flex:1` (700, 14.5px); the trailing claim/avatar/amount.

## Screens

### Trips home (`#trips` app level)
- **Header:** `h1` "Your trips" + muted subtitle ("N trips coming up.") + a right-aligned
  `Button variant="primary"` "＋ New trip". Divider under it (`--color-sand-300`).
- **Upcoming / Past** uppercase labels, each over a responsive card grid
  (`repeat(auto-fill, minmax(260px, 1fr))`). A **trip card** (tap → opens the trip): emoji
  tile (gradient sand) + title + `dates · where`, a crew `Avatar` stack (`ring`, −8px
  overlap), and right-aligned `Chip`s (`leaf` "N going", `sun` "N maybe"). Past cards are
  dimmed (`opacity 0.82`), smaller, with "N went".

### Trip page (contextual mode — one scroll of `<section id>` modules)
- **Purpose:** everything about one trip on one page; module nav + scrollspy navigate it.
- **Sticky header** (`data-appshell-sticky`): emoji tile + trip title + `dates · where · N
  going` + a right-aligned `Button variant="primary"` "Message crew". `scroll-margin-top`
  on each section keeps anchored scrolls clear of it. On mobile this header **scrolls away**
  and its identity (emoji + title + `dates · where`) crossfades into the top bar — wire the
  shell's `title`/`subtitle`/`icon` to match it (the kit owns the collapse; no app CSS).
- **Modules** (in nav order):
  - `#overview ✨` — three stat tiles (`surface-sunk`, `radius-md`): **Countdown** ("in 12
    days") · **Crew** ("6 going") · **Claimed** ("3/8"); then a "Gear & food claimed" label
    with a right-aligned count and a **progress bar** (8px, `radius-pill`, sand-300 track,
    `--color-primary` fill).
  - `#dates 📅` — big date (`display`, 20px) + muted nights label; then a **day plan** list:
    rows `day (104px, primary-press 800) + label`, divider-separated.
  - `#crew 🙌 Who's coming?` — crew as **avatar pills** (`Avatar 28` + name on `sand-100`
    `radius-pill`); header carries right-aligned going/maybe `Chip`s.
  - `#gear 🎒` ("— who's bringing what") — rows: emoji + name + **either** a claimed
    avatar-pill (`Avatar 22` + claimer) **or** a `Button variant="soft" size="sm"` "Claim".
  - `#food 🍳` ("— who's cooking") — identical row pattern to Gear.
  - `#packing 🧳` ("— your personal list") — a **personal checklist**: a check circle
    (filled `--color-primary` + ✓ when done, else a 2px sand-300 ring) + item.
  - `#expenses 💸` — rows: `Avatar` + who / what + right-aligned amount (`display`, 16px);
    then a **balance box** (`--color-primary-soft`, `radius-md`): "You're owed $X" / "You owe
    $X" (primary-press) + right-aligned "$Y each".
  - `#tripsettings ⚙️ Trip settings` — toggle rows: **Trip notifications** (pill switch,
    `--color-primary` on / sand-300 off, 22px knob) and **Leave this trip** (`Button
    variant="ghost" size="sm"` "Leave").
- **`soon` modules:** Itinerary · Map · Photos (dimmed nav rows, no section yet).

### App settings (`#settings` app level)
- Toggle rows (Trip notifications) + an **account row**: `Avatar 36` + "Maya" + "No account
  — just a claimed name" + a right-aligned `Button variant="ghost" size="sm"` "Sign out".
  The no-account line is the identity model stated plainly.

### Profile editor (`#profile` — opened from the shell avatar)
Lets someone set their **nickname** and **change their photo** — the identity they carry across
the suite (no account; just a claimed name + an optional photo). Reached via `account.onProfile`.

- **Layout**: a single `Card` over the content column (app level, coral accent). Top: a centred
  **`AvatarUpload`** (`size≈96`, `name={nickname}`, `src={photoUrl}`) — the camera badge opens
  the OS file picker and previews the chosen image immediately. Below it: a **`TextField`** bound
  to the nickname (label "Display name", seeded with the current name). Footer: right-aligned
  `Button variant="ghost"` "Cancel" + `Button variant="primary"` "Save" (the layout-convention
  button order).
- **Photo flow** (app-domain — tripwala owns it): `AvatarUpload`'s `onPick(file)` hands tripwala
  the `File`; tripwala uploads it (PocketBase `users.avatar` per the org data convention), then
  feeds the stored URL back as `src` — which supersedes `AvatarUpload`'s local preview. While the
  upload is in flight, pass `disabled` to the editor's controls. Keep a too-large/wrong-type guard
  before upload (the `accept="image/*"` picker filter is a hint, not validation).
- **Save**: writes the nickname (and, once uploaded, the avatar URL) to the profile record; on
  success, confirm with the standard toast ("Saved ✨") and return to where they came from.
- **What's shared vs. app-domain**: `AvatarUpload` + `TextField` + `Button` + `Card` are all the
  shared package (v0.3.3). The **editor screen itself** — the form, validation, the upload, the
  persistence — is tripwala's, built in its own repo (rule of three).

### Global: toast
- Actions confirm with a fixed bottom-center pill toast ("You've got it 🙌", "Signed out 👋").

## App-domain components (tripwala builds these in its own repo)

These are tripwala-domain and live in **tripwala's own repo**, not the shared `@walaware/design`
package (rule of three — they're upstream's `trip/` category, intentionally not exported). The
shared package **does not** ship them; there is no `@walaware/design/trip` import.

**But the design is specified** — the contracts + usage below are mirrored from the Claude
Design source (`components/trip/*` + the `ui_kits/rally` worked example) so the tripwala agent
has the full spec in one place. tripwala writes the **Svelte** implementation once, composing the
shared primitives it already imports (`Avatar`, `Button`, `Card`, `CardHeader`, `Chip`,
`SegmentedControl`, `LeanMeter`, `ChatMessage`, `Composer`, `EmptyState`, `IconButton`).

> **Two reference fidelities — don't conflate them.** The current `templates/tripwala`
> (the cleanup you build now) **inlines simplified rows** for Gear/Food/Expenses (see
> Screens above) — it does *not* yet use the richer components below. `ClaimRow`,
> `ExpenseRow`, `BalanceSummary`, and the `route`/`chat`/flaky-maybe model come from the
> original `ui_kits/rally` worked example and are the **canonical richer building blocks** to
> reach for when a module gets fleshed out (e.g. Who's coming → full RSVP + flaky-maybe;
> Gear → grab flow; Expenses → computed settle-up). Build the lean template now; keep these
> as the upgrade path. The contracts are below so either fidelity is one source.

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

### Section model + trip types (the rally worked-example data shape)
> This is the **richer rally model** (the upgrade path above), not the lean template's flat
> modules. A trip is `{ type, title, where, dates, sections[] }`. Each **section is a modular
> block** keyed by `kind` — nothing is hard-required, every section is relabelable and its
> items editable, and the page has an "Add a section" affordance. Kinds and what renders them:

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
- ~~Mobile shows two stacked sticky headers (top bar + trip header) with the name twice.~~
  **Resolved 2026-06-25 (v0.4.0):** the kit collapses the trip header into the top bar
  (`title`/`subtitle`/`icon` crossfade); drop the app-side `collapseHeader` action + the kit
  DOM overrides.
- Build out the "soon" modules (Itinerary · Map · Photos) when designed upstream.
- **Gear/Food rows — lean inline vs richer `ClaimRow` (decision pending).** The current
  template inlines simplified Gear/Food rows (emoji + name + claimed avatar-pill | "Claim"
  soft button). Upgrade to the richer `ClaimRow` (the "up for grabs!" note + grab flow + the
  claimed-tile coral swap — see App-domain components) **only when** Gear/Food needs that
  fidelity. Trigger: claiming becomes a primary interaction (e.g. unclaimed-item nudges,
  per-person claim counts) rather than a static "who's bringing what" display. Until then,
  keep the lean rows — don't pull `ClaimRow` in prematurely.
