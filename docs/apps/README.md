# App layouts

Per-app layout + context capture. The design repo is the **source of truth** app repos
point to, so each app's screens, navigation, sections, and the non-obvious UX context
live here — captured thoroughly, since Claude Design typically mocks **multiple screens
per app**.

- Build screens from the **[screen layout recipe](../../AGENTS.md#screen-layout-recipe-for-app-repos)**
  (layout modes, scaffold, page rhythm) using the kit + `theme.css` tokens.
- One file per app: [`<app>.md`](TEMPLATE.md). Start from **[TEMPLATE.md](TEMPLATE.md)**.
- Keep these current: whenever a design sync brings new/changed mocks for an app
  (`templates/<app>` or `ui_kits/*` in the package), update its file — the `design-sync`
  skill calls this out.

## Captured so far

- [tripwala.md](tripwala.md) — account-less group trips (single page).
- [shopwala.md](shopwala.md) — marketplace selling agent (AppShell, Berry).

The full roster and status table lives in the [repo README → App layouts](../../README.md#app-layouts).
