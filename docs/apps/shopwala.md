# shopwala — marketplace selling agent

**Accent:** Berry `#E84F7C` · **Glyph:** `shopping-bag` · **Root:** `shop` · **`data-app`:** `shopwala`
**Layout mode:** `AppShell`, two-level — global destinations → **contextual listing workspace** (scrollSpy) over one scrollable page (same shared shell mode tripwala uses). Desktop sidebar ⇄ mobile top bar + slide-in drawer, **no bottom tab bar**.
**Status:** designing · **Last mock sync:** 2026-06-29 (`templates/shopwala` redesign in the Claude Design package)

> **Redesign (2026-06-29):** the escalations inbox was reworked from a flat card
> stack into **item shelves with collapsible threads**, and a numeric **confidence
> threshold** + **auto-send** master switch now drive escalation. This sync also lands
> two shared primitives the redesign leans on — **`Disclosure`** (the collapsible
> thread row) and **`OverflowMenu`** (the per-item `⋯` menu) — plus the **danger** and
> **confidence** token families. Upstream has converged on "desktop sidebar ⇄ mobile
> drawer" (no tab bar), so the older "mobile top bar + tabs" wording is retired.

## Context

shopwala is a **selling agent**, not a manual marketplace UI. An AI agent runs your
listings and handles buyer conversations end-to-end (answering questions, scheduling,
light negotiation) on your real Facebook Marketplace account. The human is the
*exception handler*: the agent escalates only when it hits something it shouldn't
auto-decide, and the app's job is to make those moments fast to resolve. The hero
surface is therefore the **Escalations Inbox** ("Needs you" / "Who's buying?"), and
Settings is where you grant/revoke what the agent may handle on its own.

**The escalation model (the spine of the whole app).** Every buyer message gets an
*intent* and a *confidence* score. Three things send a thread to you instead of letting
the agent reply:

1. **Always-escalate intents** — `Negotiation`, `Finalizing` (a deal), `Other`
   (off-script questions), `Scam suspect`. These never auto-send regardless of settings.
2. **Below the confidence threshold** — a per-account slider (default **0.85**). Below
   "X% sure", the agent always asks first.
3. **Capability switched off** — even an allowed intent (e.g. `Location`) escalates if
   you haven't granted it in Settings, or while the **Auto-send** master switch is off
   (the safe default — every reply waits for you).

Implication for layout: optimize for *triage at a glance* (what needs me, snooze if not
now) and *trust/control* (clearly show what the agent is and isn't allowed to do, and
how sure it is).

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
| `deals` | Deals | 🤝 | — | upcoming meetups the agent helped close |
| _settings_ | Settings | ⚙ (shell glyph) | — | auto-send, capability toggles, confidence threshold, FB session |

**Contextual** — opening a listing (tap a card in Listings) swaps the sidebar to a
**section nav over ONE scrollable page**, exactly like tripwala's trip workspace:
`back={{ label: 'All listings', onClick }}` + `scrollSpy` + `title={listing.name}`. Module nav (section ids in parens):

| key | label | icon | targets `<section>` |
| --- | ----- | ---- | ------------------- |
| `overview` | Overview | ✨ | `#overview` |
| `convos` | Conversations | 💬 | `#convos` |
| `details` | Details | 📝 | `#details` |
| `pricing` | Pricing | 🏷️ | `#pricing` |
| `activity` | Activity | 📊 | `#activity` |
| `listingsettings` | Listing settings | ⚙ | `#listingsettings` |

The sticky listing header is marked `data-appshell-sticky`; mobile top-bar `title` = the
listing name. On **mobile** the listing header collapses into the top bar (kit, v0.4.0) —
also pass `subtitle` (price · status · views) and `icon` (the listing thumbnail/emoji) so
the bar crossfades brand → listing identity as the header scrolls under it.

## Screens

### Needs you / Escalations Inbox (`inbox`) — hero

Title **"Who's buying?"**; sub-line is the queue count + a **`🔒 Auto-send is off`** pill
(present while the master switch is off). The inbox is **grouped by item into shelves**,
not a flat list — each listing with open escalations is one shelf:

- **Shelf header** (loud, structural): hatched emoji tile · listing title · `price ·
  status` · a Berry **count pill** (`N waiting`) · an **`OverflowMenu`** (`⋯`) of
  item-level actions (Mark sold / Mark pending / Open listing / etc.; destructive ones in
  the `danger` tone).
- **Thread tray** (quiet, contained — sand-50, hairline-topped): the per-buyer escalation
  threads as **collapsible rows** (the new `Disclosure` primitive's shape):
  - **Collapsed (~58px scan state):** avatar · buyer name · intent glyph **or** a
    `🛡️ Scam` danger pill · message preview · a **confidence dot** (ok / low / risk
    colour) · `›`.
  - **Expanded (act state — lifts out of the tray onto a white, accent-bordered panel):**
    buyer + intent pill, one meta line (`{pct} sure` in the confidence colour + a tiny
    bar + the escalation reason), the buyer's message bubble, the **agent's drafted reply**
    in an editable textarea, then the **action ladder**: one primary **`Approve & send`**,
    a ghost **`Take over`**, and a **`💤` snooze** button opening a small menu
    (`+1 hour / +3 hours / Tonight / Tomorrow`).
- **States:** empty = "All caught up! 🎉" (`EmptyState`) — "The agent's handling every
  chat right now." A toast confirms actions ("Snoozed 💤").
- **Context / UX notes:** the **shelf vs. tray** contrast is deliberate — items are the
  loud parents, threads are the quiet children, and only the one you're acting on lifts
  out. Snooze ≠ resolve; it re-surfaces later. Triage speed is the whole point.

### Listings (`listings`)

- **Purpose:** manage everything you're selling.
- **Layout:** title + **`New listing 🛍️`** primary; a filter pill row; then a **card grid**
  (`minmax(180px,1fr)`), not a list.
- **Cards:** hatched thumbnail (emoji), a **`🔔 N` needs-you badge** overlaid when the
  listing has escalations, price, a status `Chip` (**Active** = leaf, **Pending** = sun,
  **Sold/Draft** = neutral/coral per state), and a `💬 N chats` line.
- **Filters:** `All / Active / Pending / Sold` as pills (active = filled Berry).
- **Context / UX notes:** status drives both the chip tone and the filter buckets. The
  needs-you badge ties triage and listing management to one signal. **Tapping a card opens
  the contextual listing workspace** (below).

### Listing workspace (contextual mode) — one scroll of `<section>` modules

- **Purpose:** everything about one listing on one page, without leaving the shell —
  opened from a Listings card; `back` ("← All listings") exits.
- **Layout:** `AppShell` contextual mode; a sticky listing header (`data-appshell-sticky`:
  thumbnail, title, `price · status · N views`, and a **`View on Marketplace ↗`** primary),
  then a stack of `<section id>` modules navigated by the module nav + scrollspy.
- **Modules:**
  - `#overview` — a **needs-you hero** (gradient card + `Review →`) when this listing has
    escalations; a stat strip (**Views · Active chats · Days live**); and a one-line
    **agent summary** ("✨ …").
  - `#convos` — buyer threads as rows (avatar, buyer, last message): a **`Review`** soft
    button when the thread needs you (routes into the **Needs you** inbox — the hero stays
    the single triage queue), else a status `Chip` (`Agent replied` / `Agent handling`).
    Empty state when there are no open chats.
  - `#details` — `Condition · Category · Location · …` spec tiles, the description, and a
    photo grid.
  - `#pricing` — big list price + an **offers** list (buyer, when, amount, status —
    "Countered $55" / "Full price"), or "No offers yet — the agent is fielding questions."
  - `#activity` — an icon timeline of agent/buyer events with relative timestamps.
  - `#listingsettings` — a **"Let the agent reply here"** toggle (listing-scoped echo of
    the global capability contract, default **on**) and a **Manage** row (`Pause` /
    `Mark sold` / `Delete`).
- **Context / UX notes:** composes the kit + app-domain cards; no new shared primitives
  beyond `Disclosure`/`OverflowMenu`.

### Deals (`deals`)

- **Purpose:** track deals the agent moved to a handshake — framed as **"Upcoming meetups"**.
- **Layout:** a single column (≤560px) of deal `Card`s. Each: avatar · buyer · item ·
  price · status `Chip`; a meta strip (**`📅 time`** · **`📍 place`**) between hairlines;
  then **`Adjust`** (soft) + **`Cancel`** (ghost).
- **Context / UX notes:** these are post-agreement logistics, so the screen reads like a
  calendar of pickups, not a pipeline.

### Home (`overview`)

- **Purpose:** at-a-glance summary of what the agent did and what's pending. Greets by
  name ("Hey Sam 👋 — here's your shop today").
- **Sections:**
  - A **needs-you hero** gradient card — a big count + "The agent's holding everything
    else." + a **`Review now →`** primary (jumps to the inbox).
  - A stat-tile grid — **active listings** and **deals pending** (each taps through to its
    destination) + a **FB session** status tile (leaf dot = connected, danger dot = needs
    login).
  - **Recent escalations** — a compact list (avatar, buyer, listing, intent pill, and a
    confidence % in its signal colour; scam rows use the danger pill).

### Settings (`settings`)

- **Purpose:** govern the agent — what it may handle alone vs. always escalate, and how
  sure it must be.
- **Sections (one card):**
  - **`⚡ Auto-send`** master toggle + blurb (off = every reply waits for you; the inbox
    shows the `🔒 Auto-send is off` pill while off).
  - **"Let the agent send these on its own"** — intent rows, each `emoji Label` with an
    optional note:
    - Toggleable: `🔎 Available?` · `📍 Location` · `🏷️ Price firm?` · `📅 Scheduling` ·
      `⚖️ Negotiation` (enable last — it sends counter-offers).
    - **Locked** (`🔒 always asks you`): `🛡️ Scam suspect` · `🤝 Finalizing` · `💬 Other`.
  - **Confidence threshold** — a slider (0.5–0.99, default **0.85**) with a live `{pct}`
    read-out: "Below {pct} sure, the agent always asks you first."
  - **Facebook session** — status dot + `Chip`; copy makes the trust model explicit
    ("runs on your main account, so you log in by hand — we never store your password") +
    a **`Log in by hand`** action.
- **Context / UX notes:** this screen is the trust contract. Locked categories must read
  as deliberately non-negotiable, not "coming soon"; the threshold slider is the dial
  between autonomy and caution.

## Shared primitives this app leans on

- **`Disclosure`** (core, shipped this sync) — the collapsible escalation **thread row**
  in the inbox tray (collapsed scan ⇄ expanded act). Generic enough to ship; shopwala is
  its first heavy consumer.
- **`OverflowMenu`** (core, shipped this sync) — the per-item `⋯` menu on inbox shelves
  and listing rows (desktop popover / mobile sheet, `danger` actions). Replaces the
  hand-rolled dropdowns the earlier mock had inline.
- **danger** + **confidence** tokens (shipped this sync) — `--color-danger*` for scam /
  destructive pills and `--color-confidence-ok|low|risk` for the one consistent
  confidence mapping across inbox dots, recents, and the expanded meta line.

## App-domain components (shopwala builds these in its own repo)

App-domain — **not** shipped in `@walaware/design` (rule of three); they compose the
shared primitives. Built in shopwala's repo:

- **Item shelf + thread tray** (the inbox group) — built from a shelf header + a tray of
  `Disclosure` rows; the expand/collapse, confidence dot, and action ladder are app-domain.
- **Escalation panel** (expanded thread: confidence meta line, message bubble, drafted-reply
  textarea, Approve/Take-over/Snooze ladder).
- **Capability toggle row** (with locked state + risk note) — Settings + the per-listing
  "Let the agent reply here" toggle reuse this shape.
- **Listing card** (thumbnail + status `Chip` + 🔔 needs-you badge) — opens the workspace.
- **Confidence threshold slider** + **FB session card** — settings-specific.
- All are promotion candidates for the kit *only* if other agent-style apps reuse them.

## Open questions / TODO

- **Capability toggle row — promote to the shared kit? (decision pending).** shopwala uses
  it in two places already (app Settings + the per-listing "Let the agent reply here"
  toggle), but that's two usages in *one* app — below the rule-of-three bar. Trigger: a
  **second agent-style app** (healthwala/taskwala/folkwala) needs the same governable
  on/off-with-locked-state row → then promote a `ToggleRow`/`CapabilityRow` primitive into
  `@walaware/design` and refactor shopwala onto it. Until then it stays app-domain.
- Build out any workspace `soon` modules (Insights · Promote · Similar sold) when designed.
- Watch whether the **escalation panel** / **item shelf** stabilise into a reusable shape
  a second agent app could share — promote only on cross-app reuse.

## Resolved

- **2026-06-29 — inbox redesign + escalation model:** flat escalation cards → **item
  shelves with collapsible threads**; numeric **confidence threshold** + **auto-send**
  master switch now drive escalation. Motivated the `Disclosure` + `OverflowMenu`
  primitives and the danger/confidence tokens, all landed this sync.
- **2026-06-23 — contextual workspace:** Listings cards open into an `AppShell` contextual
  section nav (scrollSpy over one scrollable page), mirroring tripwala's trip workspace.
  App-domain layout on the already-synced shell mode.
- **2026-06-23 — mobile chrome:** follow `AppShell` (top bar + drawer), **no bottom tab
  bar**. Upstream has since converged on this in the template description.
