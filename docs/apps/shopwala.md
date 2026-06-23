# shopwala — marketplace selling agent

**Accent:** Berry `#E84F7C` · **Glyph:** `shopping-bag` · **Root:** `shop` · **`data-app`:** `shopwala`
**Layout mode:** AppShell — desktop sidebar ⇄ mobile top bar + slide-in drawer, **no bottom tab bar** (4 nav destinations + settings)
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

`AppShell` `nav`, Berry accent. Settings via `onSettings`.

| key | label | icon | badge? | purpose |
| --- | ----- | ---- | ------ | ------- |
| `overview` | Home | 🏠 | — | dashboard summary of agent activity |
| `inbox` | Needs you | 🔔 | count of open escalations | **hero** — escalations needing a human |
| `listings` | Listings | 🛍️ | — | all listings, filterable by status |
| `deals` | Deals | 🤝 | — | in-progress deals / handshakes |
| _settings_ | Settings | ⚙ (shell glyph) | — | agent capability toggles |

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
- **Context / UX notes:** status drives both the badge tone and the filter buckets.

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

## App-specific patterns

- **Escalation card** (buyer/listing context + agent question + snooze) — shopwala-only
  for now; lives in the app repo.
- **Capability toggle row** (with locked state + risk note) — app repo.
- Both are promotion candidates for the kit *only* if healthwala/taskwala-style agents
  reuse them (rule of three).

## Open questions / TODO

- Flesh out Home + Deals section breakdowns at the next mock sync.

## Resolved

- **2026-06-23 — mobile chrome:** follow `AppShell` (top bar + drawer), **no bottom tab
  bar**. Upstream's "mobile top bar + tabs" template wording is deprecated; see the
  layout-decision note at the top and the sync-back to Claude Design.
