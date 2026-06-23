<script lang="ts" module>
	import type { Snippet } from 'svelte';

	/** Renderable bit — a plain string/number, or a Snippet for richer nodes. */
	type NodeLike = string | number | Snippet;

	export interface NavItem {
		/** Stable key (falls back to index). */
		key?: string;
		/** Destination label. */
		label: NodeLike;
		/** Leading icon — emoji or snippet. */
		icon?: NodeLike;
		/** Badge count/dot; omit or false for none. */
		badge?: NodeLike | false;
		/** Highlight as the current destination. Ignored in `scrollSpy` mode (active is computed from scroll). */
		active?: boolean;
		/** Destination URL — renders the row as a real `<a>` (keeps nav a true link). In `scrollSpy` mode, an `href="#id"` also marks the section this item targets. */
		href?: string;
		/** scrollSpy section id this item targets (alternative to `href="#id"`). */
		target?: string;
		/** Roadmap item — rendered dimmed + non-interactive with a "soon" tag. */
		soon?: boolean;
		/** Navigate handler (also closes the mobile drawer). */
		onClick?: () => void;
	}

	export interface ShellBack {
		/** Row label. @default "Back" */
		label?: NodeLike;
		onClick: () => void;
	}

	export interface ShellAccount {
		name: string;
		/** Avatar colour (any CSS colour or --color-av-* token). */
		color?: string;
		/** Profile photo URL; falls back to the coloured initial. */
		avatar?: string;
		/** Subtitle line under the name; defaults to "Sign out" when onSignOut is set. */
		meta?: NodeLike;
		onSignOut?: () => void;
	}
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import AppIcon from '../brand/AppIcon.svelte';
	import Wordmark from '../brand/Wordmark.svelte';
	import Avatar from '../people/Avatar.svelte';
	import IconButton from '../core/IconButton.svelte';
	import type { WalaApp } from '../brand/suite.js';

	// Omit `title` — we repurpose it as a contextual label node, not the DOM tooltip string.
	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
		/** Which wala app — sets the accent (data-app) and brand wordmark + icon. */
		app?: WalaApp;
		/** Primary destinations. */
		nav?: NavItem[];
		/** Account shown in the sidebar footer / mobile top bar. */
		account?: ShellAccount | null;
		/** Settings affordance handler (sidebar footer + mobile top bar). Omit to hide. */
		onSettings?: (() => void) | null;
		/** Mark the settings row active. */
		settingsActive?: boolean;
		/** Contextual mode: a "← …" row above the nav that exits the current context. */
		back?: ShellBack | null;
		/** Treat `nav` as an in-page section nav over the scrollable main: smooth-scroll on click, active-section highlight on scroll. Items need `href="#id"` or `target`. */
		scrollSpy?: boolean;
		/** Fixed scroll offset (px) for scrollSpy. Omit to auto-measure a `[data-appshell-sticky]` header inside main. */
		scrollSpyOffset?: number | null;
		/** Context label shown in the mobile top bar in place of the wordmark (e.g. the open record's name). */
		title?: NodeLike | null;
		/** Viewport width (px) at/above which the sidebar shows; below it, the drawer. */
		breakpoint?: number;
		/** Max content-column width in px. */
		maxWidth?: number;
		/** Override the content padding. */
		contentPadding?: string;
		/** Screen content. */
		children?: Snippet;
	}

	let {
		app = 'tripwala',
		nav = [],
		account = null,
		onSettings = null,
		settingsActive = false,
		back = null,
		scrollSpy = false,
		scrollSpyOffset = null,
		title = null,
		breakpoint = 920,
		maxWidth = 920,
		contentPadding = 'clamp(18px,3.2vw,34px) clamp(16px,3.4vw,40px) 64px',
		children,
		class: klass = '',
		...rest
	}: Props = $props();

	let desktop = $state(true);
	let drawer = $state(false);
	let spyActive = $state<string | null>(null);
	let navIn = $state(true);
	let mainEl = $state<HTMLElement>();

	$effect(() => {
		const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
		const update = () => (desktop = mq.matches);
		update();
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	});

	/** App brand root — strip the constant "wala" suffix (tripwala → trip). */
	const root = $derived(String(app).replace(/wala$/, ''));

	/** Wrap a handler so any nav/settings click also closes the mobile drawer. */
	const go = (fn: (() => void) | null | undefined) => () => {
		fn?.();
		drawer = false;
	};

	/* ---- Contextual sidebar: section nav + scrollspy ----
	   When `scrollSpy` is on, `nav` items are in-page anchors over ONE scrollable
	   page (no sub-routes): click smooth-scrolls to the section, scroll highlights
	   the active one. The section id is the item's explicit `target`, else the id
	   from an in-page `href="#id"`. */
	const spyTarget = (n: NavItem): string | null =>
		n.target ?? (typeof n.href === 'string' && n.href.charAt(0) === '#' ? n.href.slice(1) : null);

	const spyIds = $derived(
		scrollSpy ? nav.map(spyTarget).filter((id): id is string => !!id) : []
	);
	const spyKey = $derived(spyIds.join('|'));

	/** Slide the nav column in whenever the context changes (app level ↔ a record,
	    and between records). Transform-only; opacity stays 1 so the nav can't hide.
	    The CSS transition is gated behind prefers-reduced-motion. */
	const navKey = $derived(scrollSpy || back ? 'ctx:' + (typeof title === 'string' ? title : '') : 'app');
	$effect(() => {
		navKey; // track
		navIn = false;
		const r = requestAnimationFrame(() => requestAnimationFrame(() => (navIn = true)));
		return () => cancelAnimationFrame(r);
	});

	/** Section anchor — by id, escaping for the CSS selector when supported. */
	const sectionEl = (rootEl: HTMLElement, id: string) =>
		rootEl.querySelector<HTMLElement>('#' + (typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(id) : id));

	/** Scroll offset — explicit, else auto-measured from a sticky record header. */
	const offsetFor = (rootEl: HTMLElement): number => {
		if (typeof scrollSpyOffset === 'number') return scrollSpyOffset;
		const sticky = rootEl.querySelector<HTMLElement>('[data-appshell-sticky]');
		return sticky ? sticky.offsetHeight + 14 : 16;
	};

	const scrollToSection = (id: string) => {
		const rootEl = mainEl;
		if (!rootEl) return;
		const el = sectionEl(rootEl, id);
		if (!el) return;
		const top =
			el.getBoundingClientRect().top -
			rootEl.getBoundingClientRect().top +
			rootEl.scrollTop -
			offsetFor(rootEl);
		rootEl.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
		spyActive = id;
	};

	/** Spy nav-row click: intercept the anchor, smooth-scroll, close the drawer. */
	const spyClick = (id: string, item: NavItem) => (e: Event) => {
		e.preventDefault();
		scrollToSection(id);
		drawer = false;
		item.onClick?.();
	};

	/** Reset to the top + first section when the spy nav set changes (e.g. a record opens). */
	$effect(() => {
		spyKey; // track
		if (scrollSpy && mainEl) {
			mainEl.scrollTop = 0;
			spyActive = spyIds[0] ?? null;
		}
	});

	/** Track the active section while scrolling the main column. */
	$effect(() => {
		if (!scrollSpy) return;
		const rootEl = mainEl;
		if (!rootEl) return;
		spyKey; // re-bind when the section set changes
		const onScroll = () => {
			const off = offsetFor(rootEl);
			const rootTop = rootEl.getBoundingClientRect().top;
			let current = spyIds[0] ?? null;
			for (const id of spyIds) {
				const el = sectionEl(rootEl, id);
				if (!el) continue;
				const top = el.getBoundingClientRect().top - rootTop;
				if (top <= off + 6) current = id;
				else break;
			}
			spyActive = current; // identical assignment is a no-op in Svelte 5
		};
		onScroll();
		rootEl.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			rootEl.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});

	/* Shell-owned chrome glyphs (Lucide, 24×24, 2px rounded stroke) — inner SVG
	   markup only. Kept crisp line icons instead of emoji so the chrome reads as
	   UI, not content. These are chrome-specific (not app-suite WALA_GLYPHS). */
	const SHELL_ICONS: Record<string, string> = {
		settings:
			'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
		menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
		back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>'
	};
</script>

{#snippet node(value: NodeLike | undefined | null)}
	{#if typeof value === 'function'}{@render value()}{:else if value != null}{value}{/if}
{/snippet}

{#snippet shellIcon(name: 'settings' | 'menu' | 'back', size: number)}
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- shell glyphs are a static, internal allow-list -->
		{@html SHELL_ICONS[name]}
	</svg>
{/snippet}

{#snippet navColumn()}
	<!-- Slides in (transform-only) when the context changes; opacity stays 1. -->
	<div class="navwrap" style:transform={navIn ? 'translateX(0)' : 'translateX(-14px)'}>
		{#if back}
			<button class="back-row" onclick={go(back.onClick)}>
				<span class="back-icon">{@render shellIcon('back', 16)}</span>
				<span class="nav-label">{#if back.label != null}{@render node(back.label)}{:else}Back{/if}</span>
			</button>
			<div class="nav-divider"></div>
		{/if}
		<nav class="nav">
			{#each nav as item, i (item.key ?? i)}
				{@const tid = spyTarget(item)}
				{@const isSpy = scrollSpy && !!tid}
				{#if item.soon}
					<div class="nav-btn soon">
						<span class="nav-icon">{@render node(item.icon)}</span>
						<span class="nav-label">{@render node(item.label)}</span>
						<span class="soon-tag">soon</span>
					</div>
				{:else}
					<!-- svelte-ignore a11y_no_static_element_interactions -- both branches (a[href] / button) are interactive -->
					<svelte:element
						this={item.href ? 'a' : 'button'}
						href={item.href}
						class="nav-btn"
						class:active={isSpy ? spyActive === tid : item.active}
						onclick={isSpy ? spyClick(tid as string, item) : go(item.onClick)}
					>
						<span class="nav-icon">{@render node(item.icon)}</span>
						<span class="nav-label">{@render node(item.label)}</span>
						{#if item.badge != null && item.badge !== false}
							<span class="badge">{@render node(item.badge)}</span>
						{/if}
					</svelte:element>
				{/if}
			{/each}
		</nav>
	</div>
{/snippet}

{#snippet footer()}
	<div class="foot">
		{#if onSettings}
			<button class="nav-btn" class:active={settingsActive} onclick={go(onSettings)}>
				<span class="nav-icon glyph">{@render shellIcon('settings', 19)}</span>
				<span class="nav-label">Settings</span>
			</button>
		{/if}
		{#if account}
			<div class="account">
				<Avatar name={account.name} color={account.color} src={account.avatar} size={32} />
				<div class="account-text">
					<div class="account-name">{account.name}</div>
					{#if account.onSignOut}
						<button type="button" class="account-meta link" onclick={account.onSignOut}>
							{#if account.meta != null}{@render node(account.meta)}{:else}Sign out{/if}
						</button>
					{:else if account.meta != null}
						<div class="account-meta">{@render node(account.meta)}</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
{/snippet}

{#snippet brand(iconSize: number, wordSize: number)}
	<div class="brand">
		<AppIcon {app} size={iconSize} />
		<Wordmark {root} size={wordSize} />
	</div>
{/snippet}

<!--
	The shared walaware app chrome — one shell across the whole stack.
	Desktop (≥ breakpoint): a left sidebar. Mobile: a top bar + slide-in
	drawer (no bottom tab bar). The app supplies `nav`, `account` and
	content; the shell owns all chrome and wires the accent via data-app.
-->
<div data-app={app} class="wala-appshell {klass}" {...rest}>
	{#if desktop}
		<aside class="sidebar">
			{@render brand(36, 25)}
			{@render navColumn()}
			{@render footer()}
		</aside>
	{/if}

	<div class="main">
		{#if !desktop}
			<header class="topbar" class:drawer-open={drawer} inert={drawer}>
				<IconButton tone="soft" size={32} onclick={() => (drawer = true)} aria-label="menu">
					{@render shellIcon('menu', 18)}
				</IconButton>
				<AppIcon {app} size={30} />
				{#if title != null}
					<span class="topbar-title">{@render node(title)}</span>
				{:else}
					<Wordmark {root} size={21} />
				{/if}
				<span class="topbar-end">
					{#if onSettings}
						<IconButton tone="soft" size={32} onclick={go(onSettings)} aria-label="settings">
							{@render shellIcon('settings', 18)}
						</IconButton>
					{/if}
					{#if account}
						<Avatar name={account.name} color={account.color} src={account.avatar} size={32} />
					{/if}
				</span>
			</header>
		{/if}

		<main class="content" style:padding={contentPadding} bind:this={mainEl}>
			<div class="content-inner" style:max-width="{maxWidth}px">
				{@render children?.()}
			</div>
		</main>
	</div>

	{#if !desktop}
		<div
			class="scrim"
			class:open={drawer}
			onclick={() => (drawer = false)}
			role="presentation"
		></div>
		<aside class="drawer" class:open={drawer}>
			{@render brand(32, 23)}
			{@render navColumn()}
			{@render footer()}
		</aside>
	{/if}
</div>

<style>
	.wala-appshell {
		min-height: 100vh;
		display: flex;
		background: var(--color-bg-app);
		font-family: var(--font-body);
		color: var(--color-text-strong);
	}

	/* ---- Desktop sidebar ---- */
	.sidebar {
		width: 248px;
		flex: none;
		position: sticky;
		top: 0;
		height: 100vh;
		display: flex;
		flex-direction: column;
		padding: 22px 16px;
		border-right: 1px solid var(--color-sand-300);
		background: var(--color-bg-app-alt);
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 11px;
		padding: 6px 8px 22px;
	}

	/* Nav column slides in (transform-only) when the context changes. */
	.navwrap {
		transition: transform var(--dur-base) var(--ease-out);
	}
	@media (prefers-reduced-motion: reduce) {
		.navwrap {
			transition: none;
		}
	}

	.nav {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	/* ---- Contextual "← back" row + divider ---- */
	.back-row {
		display: flex;
		align-items: center;
		gap: 9px;
		width: 100%;
		border: none;
		background: transparent;
		cursor: pointer;
		padding: 9px 12px;
		border-radius: var(--radius-md);
		font-family: var(--font-body);
		font-weight: 800;
		font-size: 13.5px;
		text-align: left;
		color: var(--color-text-muted);
		transition: background var(--dur-fast) var(--ease-out);
	}
	.back-row:hover {
		background: var(--color-sand-100);
	}
	.back-icon {
		width: 22px;
		display: grid;
		place-items: center;
	}
	.nav-divider {
		height: 1px;
		background: var(--color-sand-200);
		margin: 6px 10px 8px;
	}

	.foot {
		margin-top: auto;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	/* ---- Nav / settings rows ---- */
	.nav-btn {
		display: flex;
		align-items: center;
		gap: 11px;
		width: 100%;
		border: none;
		cursor: pointer;
		padding: 11px 12px;
		border-radius: var(--radius-md);
		background: transparent;
		font-family: var(--font-body);
		font-weight: 800;
		font-size: 14.5px;
		text-align: left;
		text-decoration: none;
		color: var(--color-text-strong);
		transition: background var(--dur-fast) var(--ease-out);
	}
	.nav-btn:hover {
		background: var(--color-sand-100);
	}
	/* Active wins over hover (declared after, equal specificity). */
	.nav-btn.active {
		color: var(--color-primary-press);
		background: var(--color-primary-soft);
	}
	/* Roadmap "soon" row — dimmed, non-interactive (higher specificity kills hover). */
	.nav-btn.soon {
		color: var(--color-text-muted);
		opacity: 0.6;
		cursor: default;
	}
	.nav-btn.soon:hover {
		background: transparent;
	}
	.soon-tag {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		background: var(--color-sand-200);
		border-radius: var(--radius-pill);
		padding: 2px 7px;
	}

	.nav-icon {
		font-size: 18px;
		width: 22px;
		text-align: center;
	}
	.nav-icon.glyph {
		display: grid;
		place-items: center;
	}
	.nav-label {
		flex: 1;
	}

	.badge {
		background: var(--color-primary);
		color: var(--color-white);
		font-size: 11px;
		font-weight: 800;
		min-width: 20px;
		height: 20px;
		border-radius: var(--radius-pill);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 6px;
	}

	/* ---- Account block ---- */
	.account {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 10px 6px;
		margin-top: 6px;
		border-top: 1px solid var(--color-sand-300);
	}
	.account-text {
		line-height: 1.2;
		flex: 1;
		min-width: 0;
	}
	.account-name {
		font-weight: 800;
		font-size: 13.5px;
		color: var(--color-text-strong);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.account-meta {
		font-size: 12px;
		color: var(--color-wala);
		font-weight: 700;
	}
	.account-meta.link {
		display: block;
		width: 100%;
		text-align: left;
		padding: 0;
		border: none;
		background: none;
		font-family: var(--font-body);
		cursor: pointer;
	}

	/* ---- Main column ---- */
	.main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.topbar {
		position: sticky;
		top: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 16px;
		background: var(--color-bg-app);
		border-bottom: 1px solid var(--color-sand-300);
		transition: opacity var(--dur-base) var(--ease-out);
	}
	/* While the drawer is open it owns the brand + nav; the sticky top bar
	   would otherwise show through (it out-paints the scrim), so fade it out. */
	.topbar.drawer-open {
		opacity: 0;
		pointer-events: none;
	}
	.topbar-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 17px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}
	.topbar-end {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.content {
		flex: 1;
		min-width: 0;
		overflow-y: auto;
	}
	.content-inner {
		width: 100%;
		margin: 0 auto;
	}

	/* ---- Mobile drawer ---- */
	.scrim {
		position: fixed;
		inset: 0;
		z-index: 40;
		background: rgba(43, 30, 28, 0.42);
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--dur-base) var(--ease-out);
	}
	.scrim.open {
		opacity: 1;
		pointer-events: auto;
	}

	.drawer {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		z-index: 50;
		width: 264px;
		max-width: 82vw;
		display: flex;
		flex-direction: column;
		padding: 18px 14px;
		background: var(--color-bg-app-alt);
		box-shadow: var(--shadow-pop);
		transform: translateX(-100%);
		transition: transform var(--dur-base) var(--ease-out);
	}
	.drawer.open {
		transform: translateX(0);
	}
</style>
