# tripwala — account-less group trips

**Accent:** Coral `#FF7A59` (the house default + the constant `--color-wala`) · **Glyph:** `compass` · **Root:** `trip` · **`data-app`:** `tripwala`
**Layout mode:** Single rich page (modular sections); could adopt AppShell for multi-trip
**Status:** designing · **Last mock sync:** 2026-06-23 (`ui_kits/rally` in the Claude Design package)

## Context

tripwala plans a group trip with **no accounts** — people are identified by a coloured
initial they "claim", so anyone with the link can participate. The trip page is a single
scroll of modular **sections** chosen by trip type (a road trip shows route + gas; a
cabin weekend shows meals + packing). The emotional job: make "are we actually doing
this?" feel light and social, hence the flaky-maybe RSVP and up-for-grabs claiming.

Note: tripwala is the app the Campfire house style was originally authored for, so its
patterns seeded much of the shared kit.

## Navigation

Single-page in the worked example (no `AppShell` nav). If it grows to multiple trips, it
would adopt AppShell with destinations like Trips / Today / Chat.

## Screens

### Trip page (single scroll of sections)

- **Purpose:** everything about one trip on one page; sections vary by trip type.
- **Layout:** single mobile column (`--screen-max`), header (AppIcon + Wordmark), then a
  `--stack-gap` stack of `Card` sections.
- **Sections** (each a `Card` + `CardHeader` emoji/question title):
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

- Decide if/when tripwala moves from single-page to AppShell (multi-trip).
