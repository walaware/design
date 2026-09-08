# moneywala — cards, loyalty balances & the benefits you keep forgetting to use

**Accent:** Leaf `#3FA66A` · **Glyph:** `wallet` · **Root:** `money` · **`data-app`:** `moneywala`
**Layout mode:** `AppShell` (multi-destination: dashboard + three record types + their forms)
**Status:** building · **Last mock sync:** — _(none — see "Provenance" below)_

> **Provenance (read this first).** Unlike tripwala/shopwala, nothing here comes from a
> Claude Design mock. moneywala was **scaffolded app-side from its charter**, and this
> file captures (a) what the app agent reported on 2026-09-08 when it requested
> **`SelectField`**, and (b) the kit guidance that request settled. Treat the screen
> breakdown as *the app's current shape*, not a blessed design — when moneywala does go
> through Claude Design, rewrite the Screens section from the mocks and mark the sync
> date above.

## Context

moneywala is the **"which card do I pay with, and what am I leaving on the table?"** app.
The user keeps a manual record of their credit/debit cards, their loyalty programme
balances, and the benefit rules attached to each (5% back on groceries, two free lounge
visits a quarter, a ₹2000 spend milestone). The app's job is to turn that pile of
fine-print into a **benefit dashboard** — what's still unused, what resets soon, what a
given purchase should be paid with.

Two consequences for layout:

- **It is a records app.** The core interaction is CRUD on three linked record types
  (card → programme → benefit rule), entered **by hand** — no bank connection, no
  scraping. Forms are the primary surface, not an afterthought, and they are
  **server-action forms** (progressive enhancement, works without JS).
- **Everything is "pick one among N."** A benefit rule belongs to a card. A balance
  belongs to a programme. A programme has a holder. That single interaction — choose one
  existing record inside a form — is why `SelectField` exists (see below).

## Navigation

`AppShell` with the Leaf accent; settings via `onSettings`.

| key | label | icon | badge? | purpose |
| --- | ----- | ---- | ------ | ------- |
| `dashboard` | Home | 🏠 | count of expiring-soon benefits | **hero** — what's unused, what resets soon |
| `cards` | Cards | 💳 | — | the card list + add/edit card |
| `loyalty` | Loyalty | 🎟️ | — | programmes and their balances |
| `benefits` | Benefits | 🎁 | — | benefit rules, grouped by card |
| _settings_ | Settings | ⚙ (shell glyph) | — | account; keep it thin |

Per Sam's standing IA stance, **prefer in-context actions over a settings screen** — an
"edit this card" affordance belongs on the card, not in Settings.

## Screens

_As scaffolded app-side. Each of the three record types follows the same list → form
shape; the dashboard is the only bespoke surface._

### Benefit dashboard (`dashboard`)

- **Purpose:** the payoff screen — the benefits you still haven't used.
- **Layout:** `AppShell` content column (caps at 920px), `Card` sections with
  `CardHeader`, stacked at `--stack-gap`.
- **Sections:** `⏳ What resets soon?` → benefit rules approaching their reset date ·
  `🎁 What's still unused?` → per-card unused benefits · `💳 Which card for what?` →
  the category → best-card summary.
- **States:** empty is the common first-run state — `EmptyState` ("It's quiet in
  here…") inviting the user to add their first card, since nothing works until one
  exists.

### Cards / Loyalty / Benefits (`cards`, `loyalty`, `benefits`)

- **Purpose:** list + manual-entry CRUD for each record type.
- **Layout:** a `Card` per record in a flex column; the add/edit form is a form `Card`
  (or `Modal` for a quick add) whose fields are the kit's form primitives.
- **Sections/fields:** `TextField` for names and numbers, `DateField` for reset and
  expiry dates, **`SelectField` for every "which existing record?" field** — the card a
  benefit rule attaches to, the programme a balance belongs to, the holder, the reset
  cycle. `Switch` for on/off flags, `SegmentedControl` for 2–3 mutually exclusive modes.
- **States:** empty list → `EmptyState`; a `SelectField` whose source list is empty
  should render **disabled with a placeholder that says why** ("No programmes yet") —
  don't show an empty dropdown.

## Kit guidance

### `SelectField` (shipped v0.14.0 — this app's request)

`import { SelectField } from '@walaware/design'`. A native `<select>` in TextField
chrome: submits with `name=`, works with no JS, OS picker and its a11y for free. Use it
for **one record among N**; it is deliberately single-select (`multiple` is omitted from
the props).

- **Options:** `options={[{ value, label, disabled? }]}` — or bare strings when value and
  label are the same. Need `<optgroup>`, or already have the markup? Pass raw
  `<option>`/`<optgroup>` as children instead; they render after `options`.
- **Required fields:** always pair `required` with a `placeholder` ("Choose a card…").
  The placeholder is an empty-value option that becomes *unselectable* under `required`,
  so the browser's own validation fires on an untouched field — which is what makes the
  no-JS server-action path work.
- **`size`** is the kit's `'sm' | 'md'` form scale, **not** the native visible-row count
  (that native attribute is omitted). `md` matches `TextField`; use `sm` for dense
  secondary fields.
- **Don't wrap it.** Delete the app-local stopgap at `web/src/lib/ui/SelectField.svelte`
  rather than keeping a thin re-export — the app should import from the package so a
  future chrome change lands everywhere at once.

### The rest of the form family

`TextField`, `DateField`, `SelectField`, `Switch`, `SegmentedControl`, `Composer`,
`CopyField` all share one field chrome. Keep a form's fields on the **same `size`** so
their heights line up, and remember the **focus ring is coral across the whole family**,
not the app accent — a leaf-ringed select next to a coral-ringed text field is the bug,
not the feature (see the README's SelectField note).

## App-specific patterns

These stay in `walaware/moneywala` — none are near the rule of three:

- **Benefit rule editor** — the fine-print → structured-rule form (category, rate, cap,
  reset cycle). Money-domain.
- **Best-card-for-this-purchase** summary — the dashboard's category → card mapping.
- **Balance ledger row** — a loyalty balance with its manual-adjustment history.

Watch the "record picker" pattern: if a second app builds a *searchable/typeahead* picker
over a long list, that's the promotion candidate (a `ComboBox` sibling to `SelectField`),
not another bare select.

## Open questions / TODO

- **No design mock yet.** Run moneywala through Claude Design and rewrite "Screens"
  from the result; nav keys/icons above are the app's own, not blessed.
- **Long option lists.** `SelectField` is a native select — fine to a few dozen options.
  If a real user has 100+ benefit rules, we need the typeahead sibling; tell design when
  that becomes real rather than hand-rolling one app-side.
- **Currency/amount input.** Not yet a shared primitive; moneywala is using `TextField`.
  If healthwala or shopwala needs the same, that's two of three.
