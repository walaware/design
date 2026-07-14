<script lang="ts" module>
	import type { Snippet } from 'svelte';

	/** Renderable bit — a plain string/number, or a Snippet for richer nodes. */
	type NodeLike = string | number | Snippet;

	export interface NotificationAction {
		/** Stable key. */
		key: string;
		label: NodeLike;
		/** Tone of the inline button. @default 'ghost' */
		variant?: 'primary' | 'ghost' | 'danger';
		disabled?: boolean;
		onClick: () => void;
	}

	export interface NotificationItem {
		/** Stable key. */
		key: string;
		/** Leading icon — an emoji, or a Snippet (e.g. an <Avatar>). */
		icon?: NodeLike;
		/** Primary line, e.g. "Alice sent you a friend request". */
		title: NodeLike;
		/** Secondary line — timestamp, trip name, etc. */
		meta?: NodeLike;
		/** Already seen — renders dimmed with no unread dot. */
		read?: boolean;
		/** Whole-row link. Rendered as a real `<a>`; the row closes the panel on click. */
		href?: string;
		/** Row click handler (mutually useful with `href`). Closes the panel. */
		onClick?: () => void;
		/** Inline actions (Accept / Decline …). These do NOT close the panel, so the
		    app can re-render the list in place after acting. */
		actions?: NotificationAction[];
	}

	/** The `notifications` payload AppShell hands the bell. App owns the data + actions;
	    the shell owns the bell, the unread badge, and the panel presentation. */
	export interface ShellNotifications {
		/** Pre-sorted, newest first. */
		items: NotificationItem[];
		/** Unread count for the bell badge. */
		unread: number;
		/** Panel opened — the app marks items seen here. */
		onOpen?: () => void;
		/** "Mark all read" header action. Omit to hide it. */
		onMarkAllRead?: () => void;
		/** Empty-state node shown when `items` is empty. Defaults to a tidy caught-up line. */
		empty?: NodeLike;
	}
</script>

<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		/** Notification data + handlers. */
		data: ShellNotifications;
		/** Desktop popover horizontal alignment to the bell. @default 'end' */
		align?: 'start' | 'end';
		/** Desktop popover side. @default 'bottom' */
		placement?: 'bottom' | 'top';
		/** Viewport width (px) below which the panel becomes a bottom sheet. @default 720 */
		breakpoint?: number;
		/** Bell trigger diameter (px). @default 36 */
		size?: number;
		/** Panel header title. @default 'Notifications' */
		heading?: string;
		/** aria-label base for the bell (the unread count is appended). @default 'Notifications' */
		triggerLabel?: string;
	}

	let {
		data,
		align = 'end',
		placement = 'bottom',
		breakpoint = 720,
		size = 36,
		heading = 'Notifications',
		triggerLabel = 'Notifications',
		class: klass = '',
		...rest
	}: Props = $props();

	let open = $state(false);
	let mobile = $state(false);
	let wrapEl = $state<HTMLSpanElement>();
	let panelEl = $state<HTMLElement>();
	let triggerEl = $state<HTMLButtonElement>();

	const unread = $derived(Math.max(0, data?.unread ?? 0));
	const badge = $derived(unread > 99 ? '99+' : String(unread));
	const items = $derived(data?.items ?? []);
	const hasMarkAll = $derived(!!data?.onMarkAllRead && unread > 0);

	// Popover ↔ bottom-sheet switch, mirroring OverflowMenu / AppShell's matchMedia use.
	$effect(() => {
		const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
		const update = () => (mobile = mq.matches);
		update();
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	});

	function close() {
		open = false;
	}
	function toggle() {
		open = !open;
		// Fire onOpen on the false→true edge so the app marks items seen exactly once.
		if (open) data?.onOpen?.();
	}
	function rowActivate(item: NotificationItem) {
		// href navigations let the browser handle it (and unmount us); a bare onClick
		// row both fires and closes the panel.
		if (!item.href) close();
		item.onClick?.();
	}
	function runAction(a: NotificationAction) {
		if (a.disabled) return;
		a.onClick(); // deliberately does NOT close — the list re-renders in place
	}
	function markAll() {
		data?.onMarkAllRead?.();
	}

	/* ---- a11y: Escape + outside-click + focus trap ----
	   Matches the account OverflowMenu's Escape/outside-click, and adds the focus
	   containment the notification panel warrants (it's a richer surface). */
	const FOCUSABLE =
		'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

	const focusables = (root: HTMLElement): HTMLElement[] =>
		Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
			(el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
		);

	$effect(() => {
		if (!open) return;
		const surface = panelEl;
		const returnTo = triggerEl;
		// Move focus into the panel once it's mounted.
		queueMicrotask(() => {
			const f = surface ? focusables(surface) : [];
			(f[0] ?? surface)?.focus?.();
		});
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.stopPropagation();
				close();
			} else if (e.key === 'Tab' && surface) {
				const f = focusables(surface);
				if (f.length === 0) {
					e.preventDefault();
					surface.focus?.();
					return;
				}
				const first = f[0];
				const last = f[f.length - 1];
				const active = document.activeElement as HTMLElement | null;
				if (e.shiftKey && (active === first || !surface.contains(active))) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && active === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		const onDown = (e: MouseEvent) => {
			if (!mobile && wrapEl && !wrapEl.contains(e.target as Node)) close();
		};
		document.addEventListener('keydown', onKey);
		document.addEventListener('mousedown', onDown);
		return () => {
			document.removeEventListener('keydown', onKey);
			document.removeEventListener('mousedown', onDown);
			returnTo?.focus?.();
		};
	});
</script>

{#snippet node(value: NodeLike | undefined | null)}
	{#if typeof value === 'function'}{@render value()}{:else if value != null}{value}{/if}
{/snippet}

{#snippet bellGlyph()}
	<svg
		width={Math.round(size * 0.52)}
		height={Math.round(size * 0.52)}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
		<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
	</svg>
{/snippet}

{#snippet panelBody()}
	<div class="head">
		<span class="head-title">{heading}</span>
		{#if hasMarkAll}
			<button type="button" class="mark-all" onclick={markAll}>Mark all read</button>
		{/if}
	</div>
	{#if items.length === 0}
		<div class="empty">
			{#if data.empty != null}{@render node(data.empty)}{:else}You're all caught up.{/if}
		</div>
	{:else}
		<ul class="list">
			{#each items as item (item.key)}
				<li class="row" class:unread={!item.read}>
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<svelte:element
						this={item.href ? 'a' : item.onClick ? 'button' : 'div'}
						href={item.href}
						class="row-main"
						class:link={!!(item.href || item.onClick)}
						onclick={item.href || item.onClick ? () => rowActivate(item) : undefined}
					>
						{#if !item.read}<span class="dot" aria-hidden="true"></span>{/if}
						{#if item.icon != null}<span class="row-icon">{@render node(item.icon)}</span>{/if}
						<span class="row-text">
							<span class="row-title">{@render node(item.title)}</span>
							{#if item.meta != null}<span class="row-meta">{@render node(item.meta)}</span>{/if}
						</span>
					</svelte:element>
					{#if item.actions && item.actions.length}
						<div class="row-actions">
							{#each item.actions as a (a.key)}
								<button
									type="button"
									class="act v-{a.variant ?? 'ghost'}"
									disabled={a.disabled}
									onclick={() => runAction(a)}
								>
									{@render node(a.label)}
								</button>
							{/each}
						</div>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
{/snippet}

<!--
	Notification bell — a badge-topped bell that opens an actionable panel as a popover
	on desktop and a bottom sheet on mobile (below `breakpoint`). The app owns the items
	and their actions; the shell owns the affordance, unread badge, and presentation.
	Closes on row navigation, outside click, Escape, or scrim tap; inline item actions
	deliberately keep the panel open. Focus is trapped in the panel and restored to the
	bell on close.
-->
<span bind:this={wrapEl} class="wala-notif {klass}" {...rest}>
	<button
		bind:this={triggerEl}
		type="button"
		class="bell {open ? 'open' : ''}"
		aria-haspopup="dialog"
		aria-expanded={open}
		aria-label={unread > 0 ? `${triggerLabel}, ${unread} unread` : triggerLabel}
		onclick={toggle}
		style:width="{size}px"
		style:height="{size}px"
	>
		{@render bellGlyph()}
		{#if unread > 0}<span class="badge" aria-hidden="true">{badge}</span>{/if}
	</button>

	{#if open && !mobile}
		<div
			bind:this={panelEl}
			role="dialog"
			aria-label={heading}
			tabindex="-1"
			class="panel p-{placement} a-{align}"
		>
			{@render panelBody()}
		</div>
	{/if}
</span>

{#if open && mobile}
	<div class="scrim" role="presentation" onclick={close}></div>
	<div bind:this={panelEl} role="dialog" aria-label={heading} tabindex="-1" class="sheet">
		<div class="grabber"></div>
		{@render panelBody()}
	</div>
{/if}

<style>
	.wala-notif {
		position: relative;
		display: inline-flex;
		flex: none;
	}

	/* ---- Bell trigger ---- */
	.bell {
		position: relative;
		flex: none;
		display: grid;
		place-items: center;
		border: none;
		border-radius: 50%;
		background: none;
		color: var(--color-text-body);
		cursor: pointer;
		transition: background var(--dur-fast) var(--ease-out);
	}
	.bell:hover,
	.bell.open {
		background: var(--color-sand-100);
	}
	.bell:focus-visible {
		outline: none;
		box-shadow: 0 0 0 3px var(--color-primary-soft);
	}
	.badge {
		position: absolute;
		top: -1px;
		right: -1px;
		min-width: 17px;
		height: 17px;
		padding: 0 4px;
		border-radius: var(--radius-pill);
		background: var(--color-primary);
		color: var(--color-white);
		font-family: var(--font-body);
		font-size: 10.5px;
		font-weight: 800;
		line-height: 17px;
		text-align: center;
		box-shadow: 0 0 0 2px var(--color-bg-app-alt);
	}

	/* ---- Desktop popover ---- */
	.panel {
		position: absolute;
		z-index: 60;
		width: 340px;
		max-width: min(340px, calc(100vw - 32px));
		background: var(--color-surface-card);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-pop);
		overflow: hidden;
		animation: wala-nb-pop var(--dur-base) var(--ease-out);
	}
	.p-bottom {
		top: calc(100% + 8px);
	}
	.p-top {
		bottom: calc(100% + 8px);
	}
	.a-end {
		right: 0;
	}
	.a-start {
		left: 0;
	}

	/* ---- Mobile bottom sheet + scrim ---- */
	.scrim {
		position: fixed;
		inset: 0;
		z-index: 70;
		background: rgba(58, 45, 40, 0.38);
		animation: wala-nb-scrim var(--dur-base) var(--ease-out);
	}
	.sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 71;
		max-height: 78vh;
		display: flex;
		flex-direction: column;
		padding: 8px 0 calc(8px + env(safe-area-inset-bottom));
		background: var(--color-surface-card);
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		box-shadow: var(--shadow-pop);
		animation: wala-nb-sheet var(--dur-base) var(--ease-out);
	}
	.grabber {
		width: 38px;
		height: 4px;
		margin: 6px auto 4px;
		border-radius: var(--radius-pill);
		background: var(--color-sand-300);
		flex: none;
	}

	/* ---- Header ---- */
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 13px 16px 9px;
		flex: none;
	}
	.head-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 15.5px;
		color: var(--color-text-strong);
	}
	.mark-all {
		border: none;
		background: none;
		padding: 2px;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 12.5px;
		color: var(--color-wala);
		cursor: pointer;
	}
	.mark-all:hover {
		text-decoration: underline;
	}

	/* ---- Empty state ---- */
	.empty {
		padding: 22px 16px 26px;
		text-align: center;
		font-size: 13.5px;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	/* ---- List ---- */
	.list {
		list-style: none;
		margin: 0;
		padding: 4px 6px 8px;
		overflow-y: auto;
		max-height: min(60vh, 420px);
	}
	.sheet .list {
		max-height: none;
		flex: 1;
	}
	/* Stack: [icon + text] on line 1, inline actions on line 2 (indented under the text)
	   so titles get the row's full width and any number of actions wrap cleanly. */
	.row {
		display: flex;
		flex-direction: column;
		padding: 2px 4px;
		border-radius: var(--radius-md);
	}
	.row-main {
		display: flex;
		align-items: flex-start;
		gap: 11px;
		flex: 1;
		min-width: 0;
		width: 100%;
		text-align: left;
		border: none;
		background: none;
		padding: 9px 10px;
		border-radius: var(--radius-md);
		text-decoration: none;
		color: inherit;
		font-family: var(--font-body);
	}
	.row-main.link {
		cursor: pointer;
		transition: background var(--dur-fast) var(--ease-out);
	}
	.row-main.link:hover {
		background: var(--color-sand-100);
	}
	.row-main:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 2px var(--color-primary-soft);
	}
	/* Unread dot sits at the leading edge; a subtle tint reinforces it. */
	.dot {
		flex: none;
		width: 8px;
		height: 8px;
		margin-top: 6px;
		border-radius: 50%;
		background: var(--color-primary);
	}
	.row:not(.unread) .row-main {
		opacity: 0.62;
	}
	.row-icon {
		flex: none;
		width: 30px;
		height: 30px;
		display: grid;
		place-items: center;
		font-size: 20px;
		line-height: 1;
	}
	.row-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		line-height: 1.25;
	}
	.row-title {
		font-size: 13.5px;
		font-weight: 700;
		color: var(--color-text-strong);
	}
	.row-meta {
		font-size: 11.5px;
		font-weight: 600;
		color: var(--color-text-muted);
	}

	/* ---- Inline actions (Accept / Decline …) ---- */
	.row-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		flex: none;
		/* Indent under the title: row-main padding-left (10) + icon (30) + gap (11). */
		padding: 2px 10px 10px 51px;
	}
	.act {
		border: none;
		border-radius: var(--radius-pill);
		padding: 6px 13px;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 12.5px;
		cursor: pointer;
		transition:
			filter var(--dur-fast) var(--ease-out),
			background var(--dur-fast) var(--ease-out);
	}
	.act:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.act.v-primary {
		background: var(--color-primary);
		color: var(--color-white);
	}
	.act.v-primary:hover:not(:disabled) {
		filter: brightness(0.96);
	}
	.act.v-ghost {
		background: var(--color-sand-200);
		color: var(--color-text-body);
	}
	.act.v-ghost:hover:not(:disabled) {
		background: var(--color-sand-300);
	}
	.act.v-danger {
		background: var(--color-danger-soft);
		color: var(--color-danger-ink);
	}
	.act.v-danger:hover:not(:disabled) {
		filter: brightness(0.97);
	}

	@keyframes wala-nb-pop {
		from {
			opacity: 0;
			transform: translateY(-4px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@keyframes wala-nb-sheet {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
	@keyframes wala-nb-scrim {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.panel,
		.sheet,
		.scrim {
			animation: none;
		}
	}
</style>
