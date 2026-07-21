# tripwala — account-less group trips

**Accent:** Coral `#FF7A59` (the house default + the constant `--color-wala`) · **Glyph:** `compass` · **Root:** `trip` · **`data-app`:** `tripwala`
**Layout mode:** `AppShell`, two-level — global destinations → an open trip as a **contextual dashboard** (two-column dashboard + rail on desktop, hub-&-spoke on mobile), plus a dedicated **Trip settings** screen
**Status:** designing · **Last mock sync:** 2026-07-19 (`Tripwala Redesign.dc.html` — trip-page IA redesign: dashboard + rail / hub-&-spoke, itinerary density, one settings home; pulled via design-sync)

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
| `ideas` | Ideas | 💭 | **active** on the Someday wishlist page (see Screens) |
| `calendar` | Calendar | 📅 | **active** on `/calendar` (friend-graph feature — see Screens); was `soon` |
| `planner` | Planner | 🗓️ | `soon` |
| `map` | Map | 🗺️ | `soon` |

> **`ideas` is a live top-level destination — not a `soon` row, and not a section of the
> dated Trips home.** Idea-trips (`status='idea'`) are deliberately kept out of the
> current/upcoming/past date buckets, so they get their own AppShell destination — the
> *undated* counterpart to dated **Trips**. This is the right AppShell pattern (the shell
> exists for multiple destinations) and keeps the dated dashboard uncluttered. It's purely
> a consumer-side `NavItem` — **no kit change**. Do **not** repurpose Calendar/Planner/Map:
> those are different future concepts, not "trips without dates".

> **Not "Today".** Earlier drafts of this doc said "Trips · Today" — that was wrong. The live
> app-level nav is **Trips** + the three `soon` rows above.

> **Profile entry point.** The account row in the shell opens an **account menu** (added in
> **v0.9.3**): pass `account.onProfile` for a **Profile** item and `account.onSignOut` for a
> **Sign out** item. The menu opens from the desktop sidebar footer row (whole row is the
> trigger) and from the mobile top-bar avatar. Wire `onProfile` to open the **Profile editor**
> screen below. Leave all handlers unset and the account row stays a plain, non-interactive
> label (today's behaviour).

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

### Someday wishlist / trip ideas (`#ideas` app level)

A private place to capture whole-trip *ideas* still tentative ("road trip to Vancouver
Island someday") — no dates, just gathering thoughts. Visible only to you, or to a
co-organizer you invite. It's the undated sibling of Trips home. Backend model (tripwala's):
an idea is a trip in a new `status='idea'` stage; "promote to trip" is a one-field change
`idea`→`planning`. **This whole screen composes shipped `@walaware/design` v0.6.0 primitives
+ tripwala-domain composition — no new shared package.**

- **Header:** `h1` "Someday" (or "Trip ideas") + a muted subtitle ("Trips you're daydreaming
  about."). No date-bucket labels (that's the point — ideas aren't dated).
- **Quick-add (title-only capture):** the shared **`Composer`** — the sanctioned rounded
  input + send affordance. `me={null}`, `placeholder="Somewhere you're dreaming about…"`,
  `onSend={(title) => createIdea(title)}` (writes `status='idea'`). Reuse it as-is; don't
  build a bespoke quick-add. (A labelled `TextField` + `Button` is the alternative if you
  ever want a full form, but `Composer` is the closest quick-add match.)
- **Idea cards** in a responsive grid (`repeat(auto-fill, minmax(260px, 1fr))`, same as Trips
  home). Tap → opens the idea on the existing planning canvas (location ideas, map pins,
  description) as the "gather thoughts" surface.
- **Empty state:** the shared **`EmptyState`** — `emoji="💭"`,
  `title="Nothing on the someday list yet"`,
  `body="Capture a trip you're daydreaming about — no dates needed."`,
  `action="Add an idea"`, `onAction={focusQuickAdd}`. Reuse as-is.

**Idea card — app-domain (tripwala's repo), built as a `variant="idea"` on tripwala's own
`TripCard`.** `TripCard` is already app-domain (not in the shared kit), and an idea is the
same visual skeleton with a few data deltas, so prefer a **prop variant** over a whole new
component (less divergence to maintain). Deltas vs. the dated card:

| | dated `TripCard` | `TripCard variant="idea"` |
| --- | --- | --- |
| second line | `dates · where` | **optional rough location only** (muted; omit entirely if none yet) |
| status | `leaf` "N going" / `sun` "N maybe" RSVP `Chip`s | a **"Someday" lifecycle `Chip`** (see below) |
| people | crew `Avatar` stack | co-organizer `AvatarGroup` (often just you, or you + 1) |
| primary affordance | — (tap opens) | **"Promote to trip"** `Button variant="soft" size="sm"` |

Shared parts it composes: `Card`, `Chip`, `AvatarGroup`, `Button` (all v0.6.0).

**"Someday" badge → shared `Chip`, not `StatusBadge`.** `StatusBadge`/`status.ts` are
explicitly **RSVP / claim** state (Going/Maybe/Out/Set/Open); trip **lifecycle**
(idea/planning/confirmed/completed) is a different axis and is tripwala-domain. Render the
badge as `<Chip tone="neutral">💭 Someday</Chip>` (or `tone="coral"` if you want it to read
warmer/on-brand). **Do not add `someday` to `status.ts`** — it would muddy that map's RSVP
semantic. If a lifecycle badge later proves out across ~3 apps, promote it then (rule of
three); until then it's a `Chip` in tripwala's repo.

**Promote-to-trip action.** One-field `idea`→`planning`. Button vocabulary per the layout
conventions: inline on the card = `Button variant="soft" size="sm"` "Promote to trip"; on the
idea's detail/canvas header = `Button variant="primary"` "Promote to trip". On promote, the
idea leaves the wishlist and appears in Trips home's dated buckets; confirm with the standard
toast ("On the calendar 🎉").

**Visibility (just me / + co-organizer).** Reuses tripwala's membership model — no design-system
surface. The invited co-organizer renders in the card's `AvatarGroup` and on the idea page's
crew row; an "Invite a co-organizer" affordance is a `Button variant="ghost" size="sm"`.

### Friend graph & shared calendar (`@walaware/design` v0.7.0)

The friend-graph feature (accepted friendships between accounts, invite-friends-to-a-trip,
and friends-see-your-trips-on-a-calendar) is built from **three new shared primitives** shipped
in **v0.7.0** — `CalendarMonth`, `RequestCard`, `PersonList`. They're all generic (they know
nothing about trips or friendships); the friendship data model, the `trip_invitations`
collection, the `'friends'`-visibility opt-in, the **teaser redaction** (name/dates/location
only — never private details), and every trip→event / friend→row mapping stay **app-local**.
See the README prop tables for full contracts. Where each lands:

- **`/calendar` page (`#calendar` app level) — calendar + friends rail (redesign 2026-07-20).**
  Today it's a lone `CalendarMonth` in the content column with the right half of the desktop
  empty and a flat "Your trips / Shared by friends" legend. Make it **two-column on desktop**:
  the `CalendarMonth` in the main column + a **"Whose trips" rail** on the side that is the
  colour key **and** the filter. The rail = a row per person — **You** + each accepted friend —
  each with the person's `Avatar`/colour swatch (`colorFor`), name, a trips-count meta ("3
  together"), and a **`Switch`**; toggling a person shows/hides their trips on the grid. This
  **replaces the flat legend**. On mobile: a horizontal colour-chip filter row (or a "Filter"
  sheet) above a full-width calendar. Base mapping is unchanged — your trips → `tone: 'owned'`
  (+ `href`); a friend's `'friends'`-visible trip → redacted `tone: 'teaser'` (rough title/dates,
  **no `href`**; **redaction stays server-side**, never send private fields to a friend's client).
  Drive `onPrev`/`onNext`, `onSelectDay`/`onOverflow` as before.
- **Colour-code by owner — needs `@walaware/design` ≥ v0.11.0.** Set each `CalendarEvent`'s new
  **`color`** to the owner's hue (`colorFor(name)` / the friend's avatar colour) so every
  person's trips read in their own colour; the rail swatches match 1:1. `color` layers the hue on
  top of `tone` (which still governs behaviour: owned interactive, teaser read-only).
- **Dedup shared trips (you + a friend on the same trip).** When a friend's filter is on and a
  trip is one you're BOTH on, **render it once, not twice** — today "Ben & Mindi's Wedding" shows
  as both your owned bar AND a friend's teaser; that double must go. Keep your own `owned` bar
  (yours to open) and **mark it shared** instead of adding the teaser: a **👥 leading glyph** +
  co-travellers in the title / day-detail ("… · with Maya"), and the friend's rail row reads
  "shared with you". (Dedup + marker only apply when the friend's filter is on; off, you just see
  your own copy.) A richer co-traveller **avatar cluster on the bar** is a possible future
  `CalendarMonth` capability — flag it if the 👥 marker reads too thin; not building it yet.
- **Filtering** is client-side over the mapped events (owner toggle); pair it with the rail.
- **Invite typeahead — add existing friends without typing their email.** On the invite inputs
  (Trip settings → Access & invites "invite by email"; the friends / co-organizer invite fields),
  as the user types a name/email show a **dropdown of matching accepted friends** (avatar + name);
  picking one adds them directly (creates the `trip_invitation` / friend link) with no full-email
  typing, while a non-matching entry falls back to the plain email invite. **App-local** for now —
  a small accessible typeahead over the known friends list; revisit a shared `Combobox` primitive
  only if a second app needs it (rule of three).
- **Dashboard inbox — friend requests + trip invitations.** Both render as **`RequestCard`**:
  a friend request uses `avatar={{name}}` + `title="X wants to be friends"` + `onAccept`/`onDecline`;
  a trip invitation uses `emoji` (the trip glyph) + `title={trip.name}` + `meta="{dates} · {where} · from {inviter}"`
  + `onAccept`/`onDecline`. Outgoing/pending requests you sent use `pending` + `onCancel`.
- **Invite-from-friends flow.** A **`PersonList selectable`** bound to a `selected` id array
  (map your friends to `Person[]`), with a primary "Invite N" `Button` — then create
  `trip_invitations` for the selected ids (which land as `RequestCard`s on their dashboards).
- **Friends list & "people you've traveled with" suggestions.** Non-selectable **`PersonList`**;
  suggestion rows use the `action` snippet for a per-row "Add friend" `Button variant="soft" size="sm"`.
  (This supersedes reaching for `AvatarGroup` here — that's the overlapping *stack* for crews on a
  card; a managed list of people is `PersonList`.) A friends-management home can be its own
  destination or live under Settings — app's call.

**Shared vs local, at a glance:** shared = `CalendarMonth`, `RequestCard`, `PersonList` (v0.7.0,
already exported). Local (tripwala repo) = friendships/`trip_invitations`/visibility data model +
migrations, the server-side teaser query + redaction, trip→`CalendarEvent` and friend→`Person`
mappings, the `/calendar` page assembly, the dashboard inbox list, and all accept/decline/cancel
handlers.

### Dates section — one calendar, not two (`@walaware/design` v0.9.0)

The Dates module used to stack two surfaces in one card: a `DateField range` for proposing a
candidate span, and a hand-rolled month grid for tapping your free days. Both collapse into a
single `RangeCalendar`. `DateField range` stays for plain forms (Settings); the planning page
just shows the calendar.

**Wiring the three overlays without turning it into mud.** The component gives you four
non-competing visual channels — the rule is *one meaning per channel*, and never send the same
information down two of them:

| tripwala concept | prop | channel |
| ---------------- | ---- | ------- |
| how much of the crew is free that day | `heat[date] = free / memberCount` | cell background (sand ramp) |
| **your own** free ranges | `ranges` with `tone: 'outline'` | stroked band |
| the organizer's proposed candidates | `ranges` with `tone: 'candidate'` | lane bars |
| the span being proposed right now | `bind:start` / `bind:end` | solid accent pills |

- **Don't** also mark your own free days in `heat` — heat is the *group* signal. If you shade
  your own availability too, a day where only you are free looks identical to a day where four
  people are.
- **Do** normalize `heat` to `0..1` on the server (`free / memberCount`), and pass
  `heatLabel={(d, v) => `${Math.round(v * memberCount)} of ${memberCount} free`}` so screen
  readers get the count, not the ratio. Omit days with zero free — `0` renders nothing.
- **Don't** re-tint the day number based on heat. The ramp is capped at `sand-400` precisely so
  `--color-text-strong` never drops below ~9.2:1. The old flip-to-white-past-0.5 rule is gone.
- **Voting** stays in the app's list beside the calendar, not on the bars. A 16px bar is a poor
  tap target and the list already carries 👍/🤔/👎. Pass `onClick` on a `candidate` range only
  to *scroll to / focus* that candidate's row in the list.
- **Gating "Propose":** pass `minNights` and gate the button on `onSelect` having fired —
  `onSelect` fires only for valid spans, and `onInvalidSelect` hands you `'too-short' |
  'contains-disabled' | 'out-of-bounds'` to explain why. The span still completes and renders in
  a danger tone, so the user sees what they picked rather than having it silently clamped.
- **Bounds:** pass `min={todayIso}` (no proposing the past) and `max` about a year out. The
  chevrons disable themselves at both edges; you don't need to bound paging separately.
- **Responsive:** leave `months="auto"`. It measures the *container*, not the viewport, and
  renders 1 / 2 / 3 months (<640 / <1024 / ≥1024). Delete the `matchMedia` shim. SSR renders one
  month and widens on hydration.

**Shared vs local:** shared = `RangeCalendar`, `Switch`, `CopyField`. Local (tripwala repo) =
the availability + candidate data model, the `free/memberCount` aggregation query, the
candidate→`DateRange` and availability→`heat` mappings, the vote list beside the calendar, and
the Propose handler.

`Switch` replaces the hand-rolled "Trip notifications" pill; `CopyField` replaces the three
hand-rolled copy rows (invite link, co-organizer link, Immich album URL).

### Trip page — dashboard + rail (desktop) · hub-&-spoke (mobile) — redesign 2026-07-19

> **Supersedes** the previous "one scroll of `<section id>` modules, all expanded" spec —
> which had drifted, in the shipped app, into a punishing single scroll (every module
> expanded, a 20-night itinerary rendering ~21 empty "＋ Add entry" rows, an inline live map,
> per-module "Hide" buttons, and a nested bottom Settings-in-Settings accordion).
> **Reference impl:** `Tripwala Redesign.dc.html` (Claude Design, pulled 2026-07-19 via
> design-sync; the interactive source lives in the sync export). **Recomposition only** —
> existing Campfire components, **no new primitives, no token changes.** Needs `AppShell`
> ≥ **v0.10.0** (contextual `scrollSpy`+`back`, `notifications`, mobile header-collapse),
> `OverflowMenu`, `Switch`, `CopyField`, `SegmentedControl`, `NotificationBell`.

**Shell wiring.** Contextual mode: `back` ("All trips"), `scrollSpy` (**desktop only**),
`[data-appshell-sticky]` trip header, **`max-width: 1180`** (was 920), `notifications` (the
bell), and `title`/`subtitle`/`icon` fed for the mobile header-collapse. The shell `nav` is
the trip's **section nav** (Overview · Itinerary · Bookings · Map · Packing · Expenses) — and
**hidden sections drop out of the nav** too.

**Sticky trip header** (`data-appshell-sticky`): emoji tile · title · `dates · where · N going ·
M maybe` · overlapped crew avatars · (desktop) `Button variant="soft"` "💬 Message crew" · a
**"＋ Add" `OverflowMenu`** (primary Button trigger) → Itinerary entry · Booking · Expense · Map
pin · Something to decide.

**Overview stat strip (desktop)** — one row of cards under the header: **Countdown** · **Crew** ·
**Next up** (flex 1.5, ellipsis) · **To decide** (a `--color-primary-soft` *button* → jump to the
decisions block). Replaces the old three-tile Overview section.

**Two-column body (desktop ≥920px)** — `display:flex; gap:26px; align-items:flex-start`:
- **Main column** (`flex:1.5`) = **Itinerary** — "What's the plan?":
  - **Open decisions surface at the TOP** of the card (`--color-primary-soft` block): 🤔 question
    · `2 of 5 voted · closes Wed` · `Button variant="soft" size="sm"` "Vote". (Was buried at the
    page bottom.)
  - Days grouped under **city headers** (`📍 Lisbon · Jul 24 – 30 · 6 nights`). **Only planned
    days render** — each with entry pills (`time` chip · title · claimer `Avatar 24`).
  - Contiguous empty days collapse to **ONE dashed row per city** (`＋ Sun 26 → Thu 30 · 4 open
    days`) that expands to per-day add-chips on click (plain state — no `Disclosure`), with a
    "collapse" link. A 20-night trip is ~1 screen, not ~21 add-entry rows.
- **Rail column** (`flex:1; min-width:300px`) = compact module summaries, each header with a `⋯`
  `OverflowMenu`:
  - **Bookings** "What's booked?" — rows (emoji · title · meta · status `Chip` leaf/sun) + "＋ Add
    a booking".
  - **Map** "Pins & places" — a **static peek card** (hatched preview + "N pins across M cities" +
    "Open the map →"). **No inline live map** — the full map is its own screen.
  - **Packing** "Who's bringing what?" — a **claim meter** (X of Y + progress bar) + unclaimed rows
    (`Button variant="soft" size="sm"` "🙋 Claim") + "See all N items →"; "🎉 Everything's claimed"
    when done.
  - **Expenses** "Who paid what?" — a `--color-primary-soft` balance line ("You're owed $86" ·
    "$1,240 so far") + last-expense line + "＋ Add an expense".
- **Not-started / hidden modules** collapse to **one dashed row** ("＋ Not on this trip: ⛺ Gear ·
  📷 Photos … — turn on in settings"), never full empty-state blocks.

**Module `⋯` menu** (every module): **"Hide this section"** (syncs the Sections toggles; toast
points at Trip settings to restore) · "Section settings…" (→ Trip settings). **The old inline
per-module "Hide" buttons are removed.**

**Mobile (<920px) = hub & spoke:**
- **Trip home** = a status list: Countdown + Next-up tiles, then **one tappable row per active
  module** (emoji tile · house-question title · live status line · ▸), then a dashed **"⚙️ Trip
  settings"** row. No long scroll.
- Tapping a row opens that **module focused** (one per screen) with a "← Trip home" row; the shell
  header-collapse carries trip identity into the top bar. The "＋ Add" menu stays in the header.

**Voice.** Module titles are the house questions: "What's the plan?" · "What's booked?" · "Pins
& places" · "Who's bringing what?" · "Who paid what?".

### Trip settings — one home (own screen, `max-width: 640`)

**Stays inside the trip's contextual shell — it is NOT an app-level (level-0) page.** Even
though it's its own route, render it with `AppShell` still in **contextual mode**: pass `back`
(→ the trip, e.g. "← Portugal with the crew") and the **trip's section `nav`** (Overview ·
Itinerary · … — so you can jump straight back into any section), with `title` = "⚙️ Trip
settings" and **`scrollSpy` off** (it's a distinct screen, not an in-page anchor list; the
section nav items navigate back to the trip route + section rather than scrolling in place). Do
**NOT** let the shell fall back to the global destinations (Trips · Ideas · Bookings · …) — that
dumps the user out of the trip context on entry, which is the bug to avoid.

**Entry points (do not make it sidebar-only):** the sidebar ⚙ (desktop) **and** every module's
`⋯` menu ("Section settings…", alongside "Hide this section") **and** the mobile trip-home ⚙ row.
The settings screen itself carries a "← Back to trip" affordance. **Replaces** the old bottom
`#tripsettings` accordion AND every scattered inline control. Four groups:
- **🧩 Sections — what this trip shows:** a `Switch` per module (Itinerary, Bookings, Map, Packing,
  Expenses, Gear library, Photos, Meals) with a live meta line. **This is the restore-hidden-
  sections surface** — it syncs with the module `⋯` "Hide".
- **🔗 Access & invites:** `CopyField` invite link; three `SegmentedControl`s — **How people join**
  (Instant / Request), **Who can invite & share** (Everyone / Organizers), **Friends' calendars
  see** (Private / Busy / Name & place); a **People & roles** row (`Button variant="ghost"`
  "Manage").
- **🔔 Your notifications:** a single `Switch` (trip notifications — claims, RSVPs, meal updates).
- **🧰 Manage:** Trip details (Edit) · Clone this trip (Make a copy) · Leave this trip (Leave).

_(App-level `#settings` below stays for account/identity; per-trip config now lives in this
Trip settings screen.)_

### App settings (`#settings` app level)
- Toggle rows (Trip notifications) + an **account row**: `Avatar 36` + "Maya" + "No account
  — just a claimed name" + a right-aligned `Button variant="ghost" size="sm"` "Sign out".
  The no-account line is the identity model stated plainly.

### Profile editor (`#profile` — opened from the shell account menu)
Lets someone set their **nickname** and **change their photo** — the identity they carry across
the suite (no account; just a claimed name + an optional photo). Reached via the shell account
menu's **Profile** item (`account.onProfile`). Sign-out now lives in that same menu
(`account.onSignOut`), so the settings-screen "Sign out" button above is optional once wired.

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
