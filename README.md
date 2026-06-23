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
		Button, IconButton, Card, CardHeader, Chip,
		Avatar, AvatarGroup, LeanMeter,
		TextField, SegmentedControl, Composer,
		StatusBadge, EmptyState, ChatMessage
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
| `core`     | `Button`, `IconButton`, `Card`, `CardHeader`, `Chip` |
| `people`   | `Avatar`, `AvatarGroup`, `LeanMeter` (+ `colorFor`) |
| `forms`    | `TextField`, `SegmentedControl`, `Composer` |
| `feedback` | `StatusBadge`, `EmptyState`, `ChatMessage`  |

`Button` `variant`: `primary` (follows the app accent) · `secondary` (amber) · `accent` (berry) ·
`soft` · `ghost`. Sizes: `sm` · `md` · `lg`.

### App-specific & "derived" components

The shared kit stays **generic** — primitives and patterns reusable across every app. Domain/feature
components (e.g. tripwala's expense splitter, settle-up summary, claim row) live in **the app's own
repo**, composed from these primitives. Promote a pattern up into `@walaware/design` only once it's
proven in ~3 apps (the rule of three); promoting early couples the shared package to one app's domain.

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
