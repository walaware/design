# @walaware/design

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Svelte](https://img.shields.io/badge/Svelte-5-ff3e00.svg)](https://svelte.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8.svg)](https://tailwindcss.com)
[![AI-developed](https://img.shields.io/badge/built_with-AI_%2B_human_review-7c3aed.svg)](https://github.com/walaware/.github/blob/main/AI_POLICY.md)

The shared design system for **walaware** — a family of small, personally-built life apps
(`tripwala`, `healthwala`, `stuffwala`, `moneywala`, `shopwala`, `taskwala`, `folkwala`). One warm, playful
**Campfire** house style so the whole suite feels like one world, with a **per-app accent** so each
app still feels like its own place.

Ships:

- **Design tokens** as a Tailwind 4 CSS-first theme (`theme.css`) — palette, type, spacing, radii,
  shadows, motion.
- The **`Wordmark`** component — the `root·wala` family lockup (the `wala` suffix is always coral).
- **`AppIcon`** + the `WALA_SUITE` registry — the launcher squircle standard.
- A set of warm, rounded **Svelte 5 components** (buttons, cards, avatars, chat, forms, feedback).

---

## Install

```bash
pnpm add github:walaware/design#v0.1.0
```

It builds on install (the `prepare` script runs `svelte-package`), so no separate build step is
needed. Peer deps — already present in any walaware app:

```bash
pnpm add -D svelte tailwindcss @tailwindcss/vite
```

> Pin to a tag (`#v0.1.0`) so installs are reproducible. To cut a new release, bump the version and
> push a matching tag.

---

## Wire it up (3 steps)

### 1. Import the theme — after Tailwind

In your app's global stylesheet (e.g. `src/app.css`):

```css
@import 'tailwindcss';
@import '@walaware/design/theme.css';
```

This contributes all tokens to Tailwind (so you get utilities like `bg-coral-500`, `text-cocoa-900`,
`rounded-lg`, `shadow-card`, `font-display`) **and** emits them as `:root` CSS variables that the
shipped components read at runtime. Make sure Tailwind is enabled via `@tailwindcss/vite`:

```js
// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
export default { plugins: [tailwindcss(), sveltekit()] };
```

### 2. Load the fonts

`theme.css` declares the font **tokens** but does not load the binaries (a CSS `@import` can't follow
Tailwind's output). Add the fonts to your app shell — `src/app.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
	href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,600;1,700&display=swap"
	rel="stylesheet"
/>
```

Both fonts are OFL — to self-host, drop the `.woff2` files in your app and swap the `<link>` for
local `@font-face` rules using the same family names (`Fredoka`, `Nunito`).

### 3. Declare your app's accent

Set `data-app="<name>"` once, high up — usually on `<html>` in `src/app.html`:

```html
<html lang="en" data-app="shopwala"></html>
```

That remaps `--color-primary*` to the app's accent, so **every primary action and active state picks
up the accent automatically** — components need no per-app config. The coral `--color-wala` thread is
intentionally never remapped, so the wordmark stays consistent across the whole family. With no
`data-app`, the neutral house coral is used.

---

## Wordmark

```svelte
<script>
	import { Wordmark } from '@walaware/design';
</script>

<!-- root in ink + the constant coral "wala" -->
<Wordmark root="shop" size={48} />
<Wordmark root="trip" size={64} showDot={false} />
```

`root` is the only thing you change per app. `suffix` (`"wala"`), the coral `accent`, and the ink are
fixed by the brand. The `wala` suffix never takes the per-app accent — it's the family thread.

| Prop      | Default                | Notes                                  |
| --------- | ---------------------- | -------------------------------------- |
| `root`    | `"trip"`               | App-specific root, lowercase           |
| `suffix`  | `"wala"`               | The constant family suffix             |
| `accent`  | `var(--color-wala)`    | Suffix colour — keep coral             |
| `ink`     | `var(--color-brand-ink)` | Root colour                          |
| `size`    | `64`                   | px number or any CSS length            |
| `weight`  | `600`                  | Fredoka weight (400–700)               |
| `showDot` | `true`                 | The subtle middot between root and wala |

## App icon

```svelte
<script>
	import { AppIcon, WALA_SUITE } from '@walaware/design';
</script>

<AppIcon app="healthwala" size={96} />
<!-- or override explicitly -->
<AppIcon glyph="compass" accent="#FF7A59" size={64} />
```

`WALA_SUITE` is the source of truth for each app's glyph + accent + label:

| App         | Root    | Glyph (Lucide)     | Accent          |
| ----------- | ------- | ------------------ | --------------- |
| `tripwala`   | trip   | `compass`          | Coral `#FF7A59` |
| `healthwala` | health | `heart-pulse`      | Amber `#F59E14` |
| `stuffwala`  | stuff  | `package`          | Teal `#2FB6A3`  |
| `moneywala`  | money  | `wallet`           | Leaf `#3FA66A`  |
| `shopwala`   | shop   | `shopping-bag`     | Berry `#E84F7C` |
| `taskwala`   | task   | `square-check-big` | Sky `#4F9ED1`   |
| `folkwala`   | folk   | `users-round`      | Grape `#B57EDC` |

---

## Components

```svelte
<script>
	import {
		AppShell, NotificationBell,
		Button, IconButton, Card, CardHeader, Chip, Tooltip, Disclosure, OverflowMenu,
		CalendarMonth, RangeCalendar,
		Avatar, AvatarUpload, AvatarGroup, LeanMeter, PersonList,
		TextField, DateField, SegmentedControl, Composer, Switch, CopyField,
		StatusBadge, EmptyState, ChatMessage, RequestCard, Skeleton, SkeletonText
	} from '@walaware/design';
	let rsvp = $state('Going');
</script>

<Card>
	<CardHeader icon="🔥" title="Who's coming?" />
	<SegmentedControl options={['Going', 'Maybe', 'Out']} bind:value={rsvp} />
	<Button>I'm in! 🙌</Button>
	<Button variant="soft">Maybe</Button>
</Card>
```

| Group      | Components                                  |
| ---------- | ------------------------------------------- |
| `brand`    | `Wordmark`, `AppIcon` (+ `WALA_SUITE`, `WALA_GLYPHS`) |
| `shell`    | `AppShell`, `NotificationBell` (+ `NavItem`, `ShellAccount`, `ShellBack`, `ShellNotifications`, `NotificationItem`, `NotificationAction` types) |
| `core`     | `Button`, `IconButton`, `Card`, `CardHeader`, `Chip`, `Tooltip`, `Disclosure`, `OverflowMenu` (+ `OverflowAction` type) |
| `calendar` | `CalendarMonth`, `RangeCalendar` (+ `CalendarEvent`, `CalendarTone`, `DateRange`, `RangeTone`, `InvalidReason` types) |
| `people`   | `Avatar`, `AvatarUpload`, `AvatarGroup`, `LeanMeter`, `PersonList` (+ `colorFor`, `Person` type) |
| `forms`    | `TextField`, `DateField`, `SegmentedControl`, `Composer`, `Switch`, `CopyField` |
| `feedback` | `StatusBadge`, `EmptyState`, `ChatMessage`, `RequestCard` (+ `RequestPerson` type), `Skeleton`, `SkeletonText` |

`AppShell` is the standard app chrome: a desktop left sidebar that collapses to a
top bar + slide-in drawer below `breakpoint` (default 920px). The app supplies
`nav` + `account` + content; the shell owns the brand lockup, active states,
drawer mechanics, and accent wiring (`data-app`). No bottom tab bar.
`ShellAccount` is `{ name, color?, avatar?, meta?, onProfile?, onSignOut?, actions? }` —
pass `avatar` (a photo URL) and the footer/top-bar avatar shows the photo, falling back to
the initial. When `onProfile`, `onSignOut`, or extra `actions` are set the account row
becomes a **menu** (a popover on desktop, a bottom sheet on mobile): the whole footer row
opens it, and on mobile the top-bar avatar does. Items render in order **Profile → your
`actions` → Sign out** (Sign out in the danger tone). `meta` is now purely an
informational subtitle (e.g. an email); sign-out lives in the menu, not that line.

**Notifications.** Pass `notifications` to add a **notification bell** — top-right of the
mobile top bar, and beside the wordmark at the top of the desktop sidebar. The app owns the
data + actions; the shell owns the bell, the unread badge, and the panel (a popover on
desktop, a bottom sheet on mobile) with focus-trap + Esc-to-close, mirroring the account
menu. `ShellNotifications` is `{ items, unread, onOpen?, onMarkAllRead?, empty? }`:

| Field | Type | Notes |
| ----- | ---- | ----- |
| `items` | `NotificationItem[]` | pre-sorted, newest first |
| `unread` | `number` | badge count on the bell (hidden at 0, capped `99+`) |
| `onOpen` | `() => void` | fired once when the panel opens — mark items seen here |
| `onMarkAllRead` | `() => void` | header "Mark all read" action; omit or `unread: 0` hides it |
| `empty` | node | empty-state node; defaults to a tidy "caught up" line |

Each `NotificationItem` is `{ key, icon?, title, meta?, read?, href?, onClick?, actions? }` —
`icon` is an emoji **or a snippet** (e.g. an `<Avatar>`); `read` dims the row and drops its
unread dot; `href`/`onClick` make the row a link/button that **closes** the panel on activate;
`actions` are inline `{ key, label, variant?: 'primary'|'ghost'|'danger', onClick, disabled? }`
buttons (Accept/Decline …) that **keep** the panel open so the list can re-render in place.
`NotificationBell` is also exported standalone for use outside the shell. Live demo at `/shell`.

**Contextual mode** turns the same sidebar into a section nav over **one scrollable
page** (no sub-routes) — for opening a record (a trip, an order) without leaving the shell:

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `back` | `ShellBack \| null` | a "← …" row above the nav that exits the context (`{ label?, onClick }`) |
| `scrollSpy` | `boolean` | treat `nav` as in-page anchors: smooth-scroll on click, highlight the active section on scroll. Items need `href="#id"` or `target` |
| `scrollSpyOffset` | `number \| null` | fixed scroll offset; omit to auto-measure a `[data-appshell-sticky]` header inside the scroll area |
| `title` | node | the open record's name — the **collapsed** mobile top-bar title (see below); with collapse off it replaces the wordmark in the bar, as before |
| `subtitle` | node | second line under the collapsed `title` (e.g. `dates · where`). Collapse mode only |
| `icon` | node | record icon shown in place of the app icon when the top bar is collapsed (e.g. an emoji tile). Omit → keep the app icon. Collapse mode only |
| `collapseHeader` | `boolean` | collapse the record header into the mobile top bar (default `true`); `false` keeps today's always-pinned header |

**Collapsing record header (mobile).** On mobile the sticky top bar and the consumer's
`[data-appshell-sticky]` record header would stack into two sticky rows showing the record
name twice. With `collapseHeader` on (the default, in contextual mode), the kit lets the
record header **scroll away** — the top bar is the only sticky chrome — and crossfades the
bar's content by opacity as the header passes under it: brand (app icon + wordmark) when the
header is in view → record `icon` + `title` + `subtitle` once it scrolls under. Reverts on
scroll-up. The scroll-spy offset tracks the top bar, so anchored sections still land right.
Desktop has no top bar, so this is a no-op there (the header stays as the consumer styles it).

`NavItem` also gains `target?` (section id, alt to `href="#id"`) and `soon?` (a dimmed,
non-interactive roadmap row with a "soon" tag). Consumer contract: render the modules as
one long page of `<section id="…">`s and mark the sticky record header
`data-appshell-sticky`. See the `/shell` demo ("Open a trip") and
[docs/apps/tripwala.md](docs/apps/tripwala.md).

### CalendarMonth

A mobile-first month grid with **multi-day event spans** and a built-in header (title +
prev/next). Events carry a `tone` that sets both look and behaviour: `owned` bars are
accent-tinted and interactive (they link through via `href`); `teaser` bars — a friend's
shared trip seen on your calendar — are **muted and read-only** (never a link). Overlapping
events stack into lanes; a day with more than `maxPerDay` collapses the rest into `+N`.

```svelte
<CalendarMonth
  year={2026} month={7} events={events}
  onPrev={() => step(-1)} onNext={() => step(1)}
  onSelectDay={(d) => open(d)}
/>
```

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `year` | `number` | displayed year |
| `month` | `number` | displayed month, **1–12** (not 0-based) |
| `events` | `CalendarEvent[]` | see shape below |
| `weekStartsOn` | `0 \| 1` | 0 Sunday (default) / 1 Monday |
| `showAdjacent` | `boolean` | dim leading/trailing days from neighbour months (default `true`) |
| `maxPerDay` | `number` | event bars per day before `+N more` (default 3) |
| `today` | `string` | highlighted day `YYYY-MM-DD`; omit to derive from the clock |
| `title` | `string` | header title override (default e.g. `"July 2026"`) |
| `header` | `boolean` | show the built-in header (default `true`) |
| `onPrev` / `onNext` | `() => void` | header chevrons |
| `onSelectDay` | `(date: string) => void` | a day cell tapped (`YYYY-MM-DD`) |
| `onOverflow` | `(date: string) => void` | a `+N more` tapped |

`CalendarEvent` = `{ id, title, start, end?, tone?, emoji?, href?, onClick? }` — `start`/`end`
are inclusive `YYYY-MM-DD` (omit `end` for a single day). `tone`: `'owned'` (default) ·
`'teaser'` · `'neutral'`. The calendar renders generic events — mapping your trips (and a
friend's shared, redacted teasers) into `CalendarEvent[]` is the app's job.

### Disclosure

A collapsible section — summary row + rotating chevron over height-animated content.
Controlled (`open` + `onToggle`) or uncontrolled (`defaultOpen`).

While collapsed the body is **`inert`**: its focusable children leave the tab order and the
accessibility tree, so a stack of closed groups doesn't hand keyboard users a run of invisible
focus stops. Collapsing while focus is inside returns focus to the summary rather than
stranding it on `<body>`. The summary is wired to the body with `aria-controls`.

(Deliberately not `hidden="until-found"` — it applies `content-visibility: hidden`, which
collapses the measured height and breaks the open/close animation.)

### RangeCalendar

An inline, selectable range calendar. Click a start, then an end — the tentative span
previews on hover *and* on keyboard focus, so it works by tap on mobile where there is no
hover. A second click before the anchor cancels and restarts. Use `DateField range` for
plain forms; use this when the calendar *is* the surface.

```svelte
<RangeCalendar
  bind:start bind:end
  min={todayIso} max={oneYearOut}
  minNights={2}
  heat={freeByDay}
  heatLabel={(d, v) => `${Math.round(v * memberCount)} of ${memberCount} free`}
  ranges={[
    { id: 'mine', start, end, tone: 'outline', label: 'your free days' },
    { id: c.id, start: c.start, end: c.end, tone: 'candidate', label: c.name, onClick: vote }
  ]}
  onSelect={(s, e) => propose(s, e)}
  onInvalidSelect={(s, e, why) => explain(why)}
/>
```

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `start` / `end` | `string \| null` | selected span, `YYYY-MM-DD`. **Bindable**. `''` is treated as unset, so a `$state('')` binding is safe |
| `months` | `number \| 'auto'` | `auto` (default) → 1 / 2 / 3 by *container* width (<640 / <1024 / ≥1024) |
| `defaultYear` / `defaultMonth` | `number` | leading visible month; seeds the view once (defaults to `start`, else today) |
| `min` / `max` | `string` | selectable bounds, inclusive. Also bound paging — chevrons disable at the edges |
| `minNights` | `number` | minimum span (default `0`). Shorter spans **complete but read as invalid** — never silently clamped |
| `weekStartsOn` | `0 \| 1` | 0 Sunday (default), 1 Monday |
| `heat` | `Record<string, number>` | per-day density 0–1, shaded on a sand ramp |
| `heatLabel` | `(date, value) => string` | turns a heat value into a phrase for the cell's accessible name |
| `ranges` | `DateRange[]` | committed spans drawn under the selection layer |
| `isDisabled` | `(date) => boolean` | extra per-day disabling on top of `min`/`max` |
| `maxLanes` | `number` | `candidate` bars per day before the rest collapse into `+N` (default `3`) |
| `today` | `string` | override the clock |
| `label` | `string` | accessible name for the widget |
| `onSelect` | `(start, end) => void` | fires only for a **valid** completed span |
| `onInvalidSelect` | `(start, end, reason) => void` | `reason`: `'too-short' \| 'contains-disabled' \| 'out-of-bounds'` |
| `onViewChange` | `(year, month) => void` | the leading visible month changed |

`DateRange` is `{ id, start, end?, tone?, label?, emoji?, onClick? }` with
`tone: 'candidate' | 'outline' | 'muted'` (default `candidate`).

**The overlays don't fight because each owns a different visual property, not a different
intensity of the same fill:**

| Channel | Draws as | Token |
| ------- | -------- | ----- |
| `heat` | cell background | white → `sand-400` ramp |
| `outline` range | stroked band, never filled | `cocoa-300` |
| `candidate` range | lane bar under the day number | `primary-soft` |
| selection | solid endpoint pills + wash | `primary` |

The heat ramp stays entirely in *sand* and tops out at `sand-400`, so `--color-text-strong`
holds **≥ 9.2:1** contrast at every heat value — the day number never flips colour. Heat is
suppressed under the live selection so tints never stack. Give `heat` a value only where you
mean it; `0` renders nothing.

**A11y** (owned by the component): one `role="grid"` per month with a roving tabindex,
`←/→` by day, `↑/↓` by week, `Home`/`End` to the week edges, `PageUp`/`PageDown` by month
(`Shift` for a year), `Enter`/`Space` to set start then end, `Escape` to cancel a half-made
span — restoring whatever was committed before it. Cells carry `aria-selected` and
`aria-disabled`; completed spans are announced politely with their night count.

### Switch

A `role="switch"` pill toggle for an immediate boolean. Use a `Button` for anything that
needs confirming, and `SegmentedControl` for a choice between named options.

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `checked` | `boolean` | **Bindable** |
| `label` / `meta` | `string` | visible label + sub-line |
| `ariaLabel` | `string` | accessible name when there's no visible `label` |
| `disabled` | `boolean` | |
| `onChange` | `(checked) => void` | |

### CopyField

Readonly value with a Copy button that flips to "Copied!" — invite links, share URLs, album
addresses. The result is announced politely, so screen-reader users get the same confirmation
the flip gives everyone else. When the clipboard isn't reachable (non-secure context, denied
permission) the value is **selected** rather than failing silently.

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `value` | `string` | shown and copied |
| `label` | `string` | field label |
| `ariaLabel` | `string` | accessible name when there's no visible `label` |
| `copyLabel` / `copiedLabel` | `string` | default `"Copy"` / `"Copied!"` |
| `resetAfter` | `number` | ms the copied state sticks (default `1500`) |
| `onCopy` | `(value) => void` | fires on a successful copy |

### RequestCard

A self-contained inbound-request card for a dashboard inbox — a **friend request** (leading
`avatar`) or a **trip invitation** (leading `emoji` tile). Shows Accept + Decline for an
incoming request, or a `Cancel` + `Pending` chip for an outgoing one. Renders its own `Card`.

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `avatar` | `{ name, color?, src? } \| null` | leading person (friend request) |
| `emoji` | `string \| null` | leading emoji tile (trip invite); ignored when `avatar` is set |
| `emojiBg` | `string` | emoji tile background |
| `title` | `string \| Snippet` | headline |
| `meta` | `string \| Snippet` | sub-line (mutuals / `dates · where · from …`) |
| `onAccept` / `acceptLabel` | `() => void` / `string` | primary action (default "Accept") |
| `onDecline` / `declineLabel` | `() => void` / `string` | ghost action (default "Decline") |
| `onCancel` / `cancelLabel` | `() => void` / `string` | soft action for outgoing requests (default "Cancel") |
| `pending` | `boolean` | show a muted "Pending" chip |
| `children` | `Snippet` | extra body under the meta line |

`RequestCard` is the **generic** card; the friendship / invitation domain (states, who can
accept, what a teaser exposes) lives in the app.

### Skeleton / SkeletonText

Calm loading placeholders in the house style. A `Skeleton` block mirrors one piece of the
ready layout; `SkeletonText` stacks text lines with a ragged last line. Default animation is
a soft **pulse**; opt into a **shimmer** sweep per block. Both freeze to a static sand tint
under `prefers-reduced-motion`. Placeholders are `aria-hidden` — mark the surrounding loading
region `aria-busy="true"` so assistive tech announces the wait.

```svelte
<div aria-busy="true">
  <Skeleton variant="circle" width={44} />
  <Skeleton variant="text" width="55%" />
  <Skeleton variant="rect" height={120} radius="var(--radius-lg)" motion="shimmer" />
  <SkeletonText lines={3} />
</div>
```

**`Skeleton`**

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `variant` | `'rect' \| 'text' \| 'circle'` | shape; default `rect` |
| `width` | `string \| number` | number → px; default fill (`100%`), circle `40px` |
| `height` | `string \| number` | default per variant (text `0.85em`, circle = width, rect `16px`) |
| `radius` | `string` | override; defaults `radius-md` / `radius-sm` (text) / `radius-pill` (circle) |
| `motion` | `'pulse' \| 'shimmer' \| 'none'` | default `pulse` |

**`SkeletonText`**

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `lines` | `number` | line count; default `3` |
| `lineHeight` | `string \| number` | per-line height; default `0.85em` |
| `lastLine` | `string` | width of the ragged final line; default `60%` |
| `gap` | `string \| number` | gap between lines; default `10` (px) |
| `motion` | `'pulse' \| 'shimmer' \| 'none'` | passed to each line; default `pulse` |

The primitive is generic; where you show it and which ready-layout it mirrors stays in the app.

### PersonList

A vertical list of people — a friends list, a "traveled with" suggestion list, or a
multi-select **friend picker** (`selectable`). Compose it inside a `Card`.

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `people` | `Person[]` | `{ id, name, color?, src?, emoji?, meta? }` |
| `selectable` | `boolean` | multi-select — each row gets a check + toggles on tap |
| `selected` | `string[]` | selected ids (**`$bindable`**) |
| `onToggle` | `(id, next) => void` | selection flipped (selectable mode) |
| `onSelect` | `(person) => void` | row tap in non-selectable mode |
| `action` | `Snippet<[Person]>` | trailing per-row action (e.g. an Invite button) |
| `size` | `number` | avatar diameter (default 40) |
| `divider` | `boolean` | hairline between rows, first omitted (default `true`) |

### Avatars

`Avatar` renders, in precedence order: `emoji` → `src` (photo) → colour-derived initial.

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `name` | `string` | seeds the initial + a stable colour |
| `src` | `string \| null` | photo URL; **falls back to the initial** on missing/empty/load-error (never a broken-image icon) |
| `color` | `string \| null` | override; `null` ⇒ derive from `name` |
| `emoji` | `string \| null` | overrides both photo and initial |
| `size` | `number` | diameter px (default 36) |
| `ring` | `boolean` | white ring for overlapping clusters |

`AvatarGroup` takes `people: (string \| { name, color?, src? })[]` — each person's `src`
flows down to its `Avatar`, with the same fallback.

`AvatarUpload` is the editable avatar for profile editors — it composes `Avatar`, overlays
a camera badge (a real focusable button), and wires a hidden file input. Picking a photo
calls `onPick(file)` (the app uploads it) and previews it locally right away.

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `onPick` | `(file: File) => void` | fired with the chosen file |
| `src` | `string \| null` | current photo; a new value supersedes the local preview |
| `size` | `number` | diameter px (default 96) |
| `preview` | `boolean` | preview the picked file locally (default true) |
| `accept` | `string` | picker file types (default `image/*`) |
| `label` | `string` | badge `aria-label` (default `"Change photo"`) |
| `disabled` | `boolean` | disable picking (e.g. while saving) |

Pair it with **`AppShell`'s `account.onProfile`** — when set, the shell account menu
(opened from the sidebar footer row or the mobile top-bar avatar) gets a **Profile** item
that opens the editor.

`Button` `variant`: `primary` (follows the app accent) · `secondary` (amber) · `accent` (berry) ·
`soft` · `ghost`. Sizes: `sm` · `md` · `lg`. Pass **`href`** (with optional `target`/`rel`) to
render a real `<a>` styled as a button — so nav-as-button stays a true link (`target="_blank"`
auto-adds `rel="noopener noreferrer"`). `AppShell` nav items take the same `href` to render each
row as a real link.

### DateField

A native, accessible date primitive — **one single date OR a start–end range** in one
component, styled like `TextField`. It bakes in the mobile fix every consumer otherwise
rediscovers: a native `<input type="date">` carries an intrinsic min-width that `min-width: 0`
alone can't override, so two side-by-side range fields spill out of their card on phones. The
field forces `appearance: none` + `min-width: 0` + `width: 100%` so it always shrinks to its
container. Range mode owns `To.min` auto-tracking `From`, clearing `End` if `Start` moves past
it, an optional `minNights` minimum, and a shrink-safe two-up layout (fits at 360px). No custom
calendar popover — it uses the OS-native picker (best a11y, nothing to maintain).

| Prop | Type | Notes |
| ---- | ---- | ----- |
| `label` | node | field label; in range mode, the group label above both inputs |
| `hint` | node | helper / error line below (turns accent-red when the range is invalid) |
| `min` / `max` | `string` | bounds, `"YYYY-MM-DD"` |
| `size` | `'sm' \| 'md'` | form size scale (default `md`) |
| `disabled`, `required`, `name` | — | native form attributes |
| `range` | `boolean` | `false` (default) = single date; `true` = start/end |
| `value` | `string` | **single:** bound date (`$bindable`) |
| `start` / `end` | `string` | **range:** bound start/end (`$bindable`) |
| `startLabel` / `endLabel` | node | range input labels (default `From` / `To`) |
| `minNights` | `number` | min gap in days: sets `End`'s effective `min` and flags the range invalid when shorter (`0` = none) |
| `nameStart` / `nameEnd` | `string` | override the submit names (default `${name}_start` / `${name}_end`) |

```svelte
<script>
  import { DateField } from '@walaware/design';
  let day = $state(''), start = $state(''), end = $state('');
  const today = new Date().toISOString().slice(0, 10);
</script>

<!-- single -->
<DateField label="Date" bind:value={day} min={today} />

<!-- range, min 2 nights -->
<DateField range bind:start bind:end min={today} minNights={2} hint="At least 2 nights" />
```

### Exported types: `Status` & `Lean`

Shared enums (string-literal unions) that drive `StatusBadge` and `LeanMeter`:

| Type | Values | Meaning |
| ---- | ------ | ------- |
| `Status` | `going` · `maybe` · `out` · `set` · `open` | RSVP / claim state (`going` 🔥, `maybe` 🤔, `set` ✓, `open`) |
| `Lean` | `1` · `2` · `3` | how confident a "Maybe" really is — `1` long shot, `2` 50/50, `3` leaning yes |

```svelte
<script>
  import { StatusBadge, LeanMeter, type Status, type Lean } from '@walaware/design';
  let rsvp: Status = 'maybe';
  let lean: Lean = 2;
</script>
<StatusBadge status={rsvp}>Maybe</StatusBadge>
<LeanMeter {lean} />
```

> Component **props are the typed `.d.ts` contract** — your editor autocompletes them from the
> package. Nullable-friendly where it helps: `Avatar.color` and `SegmentedControl.value` accept
> `null` (= derive / nothing selected).

### App-specific & "derived" components

The shared kit stays **generic** — primitives and patterns reusable across every app. Domain/feature
components (e.g. tripwala's expense splitter, settle-up summary, claim row) live in **the app's own
repo**, composed from these primitives. Promote a pattern up into `@walaware/design` only once it's
proven in ~3 apps (the rule of three); promoting early couples the shared package to one app's domain.

---

## App layouts

This repo is the **layout source of truth** every app repo points to. Build screens from the
**[screen layout recipe](AGENTS.md#screen-layout-recipe-for-app-repos)** (modes, scaffold, rhythm)
using the kit + tokens. Each app's screens, layout, and context are captured in
[`docs/apps/`](docs/apps/) ([template](docs/apps/TEMPLATE.md)) — capture every screen Claude Design
mocks there, thoroughly.

| App | Layout | Screens & context |
| --- | ------ | ----------------- |
| `tripwala` | AppShell (two-level) | [docs/apps/tripwala.md](docs/apps/tripwala.md) |
| `healthwala` | — | _not yet designed_ |
| `stuffwala` | — | _not yet designed_ |
| `moneywala` | — | _not yet designed_ |
| `shopwala` | AppShell | [docs/apps/shopwala.md](docs/apps/shopwala.md) |
| `taskwala` | — | _not yet designed_ |
| `folkwala` | — | _not yet designed_ |

---

## Token reference

All tokens are CSS variables on `:root` and (for colours/type/radius/shadow/motion) Tailwind
utilities. Colours use Tailwind v4's `--color-*` namespace.

| Token                                | Value / role                                  |
| ------------------------------------ | --------------------------------------------- |
| `--color-sand-{50–400}`              | Warm neutral backgrounds (`sand-100` = canvas) |
| `--color-coral-{200–700}`            | House lead + the constant `wala` thread        |
| `--color-sun / berry / leaf / sky / teal` | Accents + functional hues (status, avatars) |
| `--color-cocoa-{300–900}`            | Ink (`cocoa-900` = strong text)                |
| `--color-primary` / `-press` / `-soft` | **Remapped per app** via `data-app`          |
| `--color-wala` / `-soft`             | The coral constant — never remapped            |
| `--color-bg-app`, `--color-surface-card` | Semantic surfaces                          |
| `--color-text-strong` / `-body` / `-muted` | Semantic text                            |
| `--color-status-going` / `-maybe` / `-out` | RSVP / claim state                       |
| `--font-display` (Fredoka) / `--font-body` (Nunito) | Type families               |
| `--text-display 28` … `--text-tiny 11.5` (px) | Mobile-first type scale              |
| `--radius-sm 11 / md 16 / lg 24 / xl 28 / pill` | Soft corners; pills for actions    |
| `--shadow-card / soft / pop / chip`  | Soft accent-tinted shadows                     |
| `--ease-spring` / `--ease-out`, `--dur-fast/base/pop` | Bouncy, quick motion          |
| `--gutter 16`, `--card-pad 18`, `--stack-gap 14`, `--tap-min 44`, `--screen-max 430` | Layout |

### Per-app accent contract

```html
<html data-app="moneywala">
	<!-- primary actions now leaf-green; wala stays coral -->
</html>
```

Apps may also override their accent directly if they ever diverge from the suite default:

```css
[data-app='shopwala'] {
	--app-accent: #d6603e; /* a custom terracotta, say */
	--app-accent-press: #b94e30;
	--app-accent-soft: #ffe0d4;
}
```

---

## Develop

```bash
pnpm install        # installs deps + builds dist/ (prepare)
pnpm dev            # preview route — wordmark + components in two accents
pnpm run check      # svelte-check (types)
pnpm run package    # build dist/ + publint
```

The preview route (`src/routes/+page.svelte`) renders the wordmark, the full app-icon suite, and the
core components under both the tripwala and shopwala accents — the quickest way to eyeball changes.

## Release

Releasing is one command. Apps install via `github:walaware/design#<tag>`, so a release is just a
correct tag on a green commit — there's no npm publish step.

```bash
pnpm version patch   # or: minor | major
```

That single command, via lifecycle hooks:

1. **`preversion`** runs `pnpm check && pnpm package` — a failing build/types aborts the release, so
   you can never tag a broken commit.
2. bumps `package.json`, commits, and creates the matching **`vX.Y.Z`** tag (version and tag can't
   drift — npm/pnpm `version` does both atomically; it also refuses to run with a dirty tree).
3. **`postversion`** runs `git push --follow-tags` — pushes the commit and its tag together.

Pushing the tag triggers the **Release** workflow (`.github/workflows/release.yml`): it re-validates
the tagged commit on CI and creates a GitHub Release with auto-generated notes. Every push/PR is also
checked by the **CI** workflow (`.github/workflows/ci.yml`), so `main` stays releasable.

Consuming apps move to a new version by bumping the `#vX.Y.Z` ref in their `package.json` (or
`pnpm update @walaware/design`).

---

## Contributing

PRs welcome — see the suite-wide [Contributing guide](https://github.com/walaware/.github/blob/main/CONTRIBUTING.md)
and [Code of Conduct](https://github.com/walaware/.github/blob/main/CODE_OF_CONDUCT.md). Keep the kit
**generic**: promote a component into `@walaware/design` only once it's proven in ~3 apps (the rule of
three). Docs follow the [documentation standard](https://github.com/walaware/.github/blob/main/DOCUMENTATION.md);
broader conventions live in [walaware/.github/docs](https://github.com/walaware/.github/tree/main/docs).

## Built with AI

`@walaware/design` is part of a [heavily AI-developed](https://github.com/walaware/.github/blob/main/AI_POLICY.md)
suite — built by LLM agents under human direction and review.

## License

[MIT](./LICENSE) — shared libraries are permissive so every walaware app can consume them freely.
(The apps themselves are AGPL-3.0.)
