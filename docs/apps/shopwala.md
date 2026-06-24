# shopwala — marketplace selling agent

**Accent:** Berry `#E84F7C` · **Glyph:** `shopping-bag` · **Root:** `shop` · **`data-app`:** `shopwala`
**Layout mode:** `AppShell`, two-level — global destinations → **contextual listing workspace** (scrollSpy) over one scrollable page (same shared shell mode tripwala uses). Desktop sidebar ⇄ mobile top bar + slide-in drawer, **no bottom tab bar**.
**Status:** designing · **Last mock sync:** 2026-06-23 (`templates/shopwala` in the Claude Design package)

> **Layout decision (2026-06-23):** shopwala uses the standard `AppShell` responsive
> model verbatim — desktop sidebar, mobile top bar + drawer, **no bottom tab bar**. The
> upstream `templates/shopwala` description ("mobile top bar + tabs") is **deprecated**;
> AppShell is the source of truth for chrome. Flagged for Claude Design in the sync-back.

## Context

shopwala is a **selling agent**, not a manual marketplace UI. An AI agent runs your
listings and handles buyer conversations end-to-end (answering questions, scheduling,
light negotiation). The human is the *exception handler*: the agent escalates only when
it hits something it shouldn't auto-decide, and the app's job is to make those moments
fast to resolve. The hero surface is therefore the **Escalations Inbox** ("Needs you"),
and Settings is where you grant/revoke what the agent may handle on its own.

Implication for layout: optimize for *triage at a glance* (what needs me, snooze if not
now) and *trust/control* (clearly show what the agent is and isn't allowed to do).

## Navigation

shopwala uses **`AppShell` in both of its modes** (the contextual mode is a shared shell
capability — see the AppShell prop table in the README; demo at `/shell` → "Open a trip").
Two levels:

**App level** — global destinations, Berry accent, Settings via `onSettings`:

| key | label | icon | badge? | purpose |
| --- | ----- | ---- | ------ | ------- |
| `overview` | Home | 🏠 | — | dashboard summary of agent activity |
| `inbox` | Needs you | 🔔 | count of open escalations | **hero** — escalations needing a human |
| `listings` | Listings | 🛍️ | — | all listings, filterable by status |
| `deals` | Deals | 🤝 | — | in-progress deals / handshakes |
| _settings_ | Settings | ⚙ (shell glyph) | — | agent capability toggles |

**Contextual** — opening a listing (tap a card in Listings) swaps the sidebar to a
**section nav over ONE scrollable page**, exactly like tripwala's trip workspace:
`back={{ label: 'All listings', onClick }}` + `scrollSpy` + `title={listing.name}`. Module nav:

| key | label | icon | targets `<section>` |
| --- | ----- | ---- | ------------------- |
| `overview` | Overview | ✨ | `#overview` |
| `conversations` | Conversations | 💬 | `#conversations` |
| `details` | Details | 📝 | `#details` |
| `pricing` | Pricing | 🏷️ | `#pricing` |
| `activity` | Activity | 📊 | `#activity` |
| `settings` | Listing settings | ⚙ | `#settings` |

…then a dimmed **`soon`** group: `Insights 📈 · Promote 🚀 · Similar sold 🔁`. The sticky
listing header is marked `data-appshell-sticky`; mobile top-bar `title` = the listing name.

## Screens

### Needs you / Escalations Inbox (`inbox`) — hero

- **Purpose:** the one screen that matters daily — conversations the agent paused for you.
- **Layout:** AppShell content column; a stack of escalation **cards**, most-urgent first.
- **Sections:** each escalation is a `Card` — buyer + listing context, the agent's
  question, and quick actions. Category chips (see Settings) tag *why* it escalated.
- **States:** empty = "All caught up!" celebration; a toast confirms actions
  ("Snoozed price-firm 💤").
- **Context / UX notes:** every card is **snoozeable** — options `+1 hour`, `+3 hours`,
  `Tonight`, `Tomorrow`. Snooze ≠ resolve; it re-surfaces later. Triage speed is the
  whole point.

### Listings (`listings`)

- **Purpose:** manage everything you're selling.
- **Layout:** filter row (pill chips) above a list of listing `Card`s.
- **Sections:** filters `All / Active / Pending / Sold`; each listing shows a
  `StatusBadge` — **Active** = leaf, **Pending** = sun, **Sold / Draft / Archived** =
  neutral.
- **Context / UX notes:** status drives both the badge tone and the filter buckets. Each
  card also carries a coral **🔔 N needs-you badge** (count of escalated chats on that
  listing), so triage and listing management share one signal. **Tapping a card opens the
  contextual listing workspace** (below).

### Listing workspace (contextual mode) — one scroll of `<section>` modules

- **Purpose:** everything about one listing on one page, without leaving the shell —
  opened from a Listings card; `back` ("← All listings") exits.
- **Layout:** `AppShell` contextual mode; a sticky listing header (`data-appshell-sticky`:
  thumbnail, title, price, `StatusBadge`), then a `--stack-gap` stack of `<section id>`
  `Card` modules navigated by the module nav + scrollspy.
- **Modules** (each a `<section id>` matching the contextual nav):
  - `#overview` — agent-activity summary for this listing.
  - `#conversations` — buyer threads; a thread's **"Review"** action routes to the
    **Needs you** inbox (the hero surface stays the single triage queue — the workspace
    links into it, doesn't fork it).
  - `#details` — `Condition · Category · Location · Listed (days ago)` field rows.
  - `#pricing` — price + negotiation posture for this listing.
  - `#activity` — views / saves / events timeline.
  - `#settings` — per-listing **"Let the agent reply here"** toggle (local state, default
    **on**) — a listing-scoped echo of the global capability contract in Settings.
- **Context / UX notes:** the dimmed **Insights · Promote · Similar sold** nav rows are
  roadmap (`soon`). No new shared primitives — composes the kit + app-domain cards.

### Deals (`deals`)

- **Purpose:** track deals the agent has moved toward a handshake.
- _(Mock detail thin in the package — capture fully on the next mock sync.)_

### Home (`overview`)

- **Purpose:** at-a-glance summary of what the agent did and what's pending.
- _(Capture section breakdown on the next mock sync.)_

### Settings (`settings`)

- **Purpose:** govern the agent — what it may handle alone vs. always escalate.
- **Sections:** capability toggles, each `emoji Label`:
  - `🔎 Available?` · `📍 Location` · `🏷️ Price firm?` · `📅 Scheduling` — toggleable.
  - `⚖️ Negotiation` — toggleable, **enable last** (it sends counter-offers); show the
    note inline.
  - `🛡️ Scam suspect` · `🤝 Finalizing` · `💬 Other` — **locked** (always escalate to you).
- **Context / UX notes:** this screen is the trust contract. Locked categories must read
  as deliberately non-negotiable, not "coming soon."

## App-domain components (shopwala builds these in its own repo)

App-domain — **not** shipped in `@walaware/design` (rule of three); they compose the
shared primitives. Built in shopwala's repo:

- **Escalation card** (buyer/listing context + agent question + snooze: `+1 hour / +3
  hours / Tonight / Tomorrow`) — the Needs-you hero row.
- **Capability toggle row** (with locked state + risk note) — Settings + the per-listing
  "Let the agent reply here" toggle reuse this shape.
- **Listing card** (thumbnail + `StatusBadge` + 🔔 needs-you badge) — opens the workspace.
- All are promotion candidates for the kit *only* if healthwala/taskwala-style agents
  reuse them (rule of three).

## Open questions / TODO

- Flesh out Home + Deals section breakdowns at the next mock sync.
- Build out the workspace `soon` modules (Insights · Promote · Similar sold) when designed.

## Resolved

- **2026-06-23 — contextual workspace:** Listings cards open into an `AppShell` contextual
  section nav (scrollSpy over one scrollable page), mirroring tripwala's trip workspace.
  No package change — app-domain layout on the already-synced shell mode (v0.3.0).
- **2026-06-23 — mobile chrome:** follow `AppShell` (top bar + drawer), **no bottom tab
  bar**. Upstream's "mobile top bar + tabs" template wording is deprecated; see the
  layout-decision note at the top and the sync-back to Claude Design.
