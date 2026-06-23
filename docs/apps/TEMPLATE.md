<!--
  Per-app layout + context capture. Copy this to docs/apps/<app>.md when an app
  enters design. The design repo is the source of truth app repos point to, so
  capture EVERY screen Claude Design hands us here — layout mode, sections, the
  components each section uses, states, and the non-obvious UX context. Anchor to
  the kit (AppShell / components / theme.css tokens); see AGENTS.md → "Screen
  layout recipe". Keep it current as mocks evolve.
-->

# <app> — <one-line purpose>

**Accent:** <colour> `<hex>` · **Glyph:** `<lucide-name>` · **Root:** `<root>` · **`data-app`:** `<app>`
**Layout mode:** AppShell _(nav below)_ — or — Single mobile column (`--screen-max`)
**Status:** designing | building | shipped · **Last mock sync:** <YYYY-MM-DD> (<package/source>)

## Context

What the app is for, who uses it, the core job, and the central UX idea — the thing
a screen-designer must understand before laying anything out. 2–5 sentences.

## Navigation (AppShell apps)

Destinations supplied to `AppShell`'s `nav`, plus the settings affordance.

| key | label | icon | badge? | purpose |
| --- | ----- | ---- | ------ | ------- |
| … | … | … | … | … |

## Screens

One subsection per screen Claude Design requests. Capture layout, not just a list.

### <Screen name> (`<key>`)

- **Purpose:** what this screen is for.
- **Layout:** mode + column; hero section (if any); section order top→bottom.
- **Sections:** each as `emoji Title` → what it holds → kit components used
  (`Card`/`CardHeader`/`Chip`/`StatusBadge`/…).
- **States:** empty / loading / error / success — with the actual microcopy.
- **Context / UX notes:** the non-obvious bits (agent behaviour, edge cases,
  permissions, why a control exists). This is the part code can't infer.

## App-specific patterns

Components or patterns unique to this app. These live in the **app's own repo**, not
the shared kit, until proven across ~3 apps (rule of three). List them so we can spot
promotion candidates.

## Open questions / TODO

- …
