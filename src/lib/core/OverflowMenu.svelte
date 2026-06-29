<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface OverflowAction {
		/** Optional leading icon/emoji. */
		icon?: string | Snippet;
		label: string | Snippet;
		onClick?: () => void;
		/** Render in the danger tone (destructive). */
		danger?: boolean;
		disabled?: boolean;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		/** The actions to list. */
		actions: OverflowAction[];
		/** Title shown at the top of the mobile bottom sheet (e.g. the record name). */
		label?: string | Snippet;
		/**
		 * Custom trigger. Receives `{ toggle, open }` — wire `toggle` to your element's
		 * click (Svelte can't inject a handler into slotted markup the way React clones an
		 * element). Defaults to a `⋯` round button.
		 */
		trigger?: Snippet<[{ toggle: () => void; open: boolean }]>;
		/** Desktop popover horizontal alignment to the trigger. */
		align?: 'start' | 'end';
		/** Desktop popover side. */
		placement?: 'bottom' | 'top';
		/** Viewport width (px) below which the menu becomes a bottom sheet. */
		breakpoint?: number;
		/** Size of the default trigger. */
		size?: number;
		disabled?: boolean;
		/** aria-label for the default trigger. */
		triggerLabel?: string;
		/** Inline style applied to the popover / sheet surface. */
		menuStyle?: string;
	}

	let {
		actions = [],
		label,
		trigger,
		align = 'end',
		placement = 'bottom',
		breakpoint = 720,
		size = 36,
		disabled = false,
		triggerLabel = 'More actions',
		menuStyle = '',
		class: klass = '',
		...rest
	}: Props = $props();

	let open = $state(false);
	let mobile = $state(false);
	let wrapEl = $state<HTMLSpanElement>();

	// Popover ↔ bottom-sheet switch, mirroring AppShell's matchMedia approach.
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
		if (!disabled) open = !open;
	}
	function run(a: OverflowAction) {
		if (a.disabled) return;
		close();
		a.onClick?.();
	}

	// Close on Escape (always) and outside mousedown (desktop popover only).
	$effect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close();
		};
		const onDown = (e: MouseEvent) => {
			if (!mobile && wrapEl && !wrapEl.contains(e.target as Node)) close();
		};
		document.addEventListener('keydown', onKey);
		document.addEventListener('mousedown', onDown);
		return () => {
			document.removeEventListener('keydown', onKey);
			document.removeEventListener('mousedown', onDown);
		};
	});
</script>

<!--
	Overflow menu — a `⋯` trigger that opens a list of actions as a popover on
	desktop and a bottom sheet on mobile (below `breakpoint`). Closes on action,
	outside click, Escape, or scrim tap; respects prefers-reduced-motion. The one
	place row/item action overflow lives, so screens stop hand-rolling dropdowns —
	keep one primary action as a real button and pour the rest in here.
-->
<span bind:this={wrapEl} class="wala-overflow {klass}" {...rest}>
	{#if trigger}
		{@render trigger({ toggle, open })}
	{:else}
		<button
			type="button"
			class="trigger {open ? 'open' : ''}"
			aria-label={triggerLabel}
			aria-haspopup="menu"
			aria-expanded={open}
			{disabled}
			onclick={toggle}
			style:width="{size}px"
			style:height="{size}px"
			style:font-size="{Math.round(size * 0.52)}px"
		>
			⋯
		</button>
	{/if}

	{#if open && !mobile}
		<div
			role="menu"
			class="popover p-{placement} a-{align}"
			style={menuStyle}
		>
			{#each actions as a, i (i)}
				{@render item(a, false)}
			{/each}
		</div>
	{/if}
</span>

{#if open && mobile}
	<div class="scrim" role="presentation" onclick={close}></div>
	<div role="menu" class="sheet" style={menuStyle}>
		<div class="grabber"></div>
		{#if label != null}
			<div class="sheet-title">
				{#if typeof label === 'function'}{@render label()}{:else}{label}{/if}
			</div>
		{/if}
		{#each actions as a, i (i)}
			{@render item(a, true)}
		{/each}
	</div>
{/if}

{#snippet item(a: OverflowAction, big: boolean)}
	<button
		type="button"
		role="menuitem"
		class="item {big ? 'big' : ''} {a.danger ? 'danger' : ''}"
		disabled={a.disabled}
		onclick={() => run(a)}
	>
		{#if a.icon != null}
			<span class="item-icon">
				{#if typeof a.icon === 'function'}{@render a.icon()}{:else}{a.icon}{/if}
			</span>
		{/if}
		<span class="item-label">
			{#if typeof a.label === 'function'}{@render a.label()}{:else}{a.label}{/if}
		</span>
	</button>
{/snippet}

<style>
	.wala-overflow {
		position: relative;
		display: inline-flex;
		flex: none;
	}

	/* Default ⋯ trigger */
	.trigger {
		flex: none;
		display: grid;
		place-items: center;
		border: none;
		border-radius: 50%;
		background: none;
		color: var(--color-text-body);
		font-weight: 800;
		cursor: pointer;
		transition: background var(--dur-fast) var(--ease-out);
	}
	.trigger:hover,
	.trigger.open {
		background: var(--color-sand-100);
	}
	.trigger:disabled {
		cursor: default;
		opacity: 0.5;
	}

	/* Desktop popover */
	.popover {
		position: absolute;
		z-index: 60;
		min-width: 180px;
		padding: 6px;
		background: var(--color-surface-card);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-pop);
		animation: wala-om-pop var(--dur-base) var(--ease-out);
	}
	.p-bottom {
		top: calc(100% + 6px);
	}
	.p-top {
		bottom: calc(100% + 6px);
	}
	.a-end {
		right: 0;
	}
	.a-start {
		left: 0;
	}

	/* Mobile bottom sheet + scrim */
	.scrim {
		position: fixed;
		inset: 0;
		z-index: 70;
		background: rgba(58, 45, 40, 0.38);
		animation: wala-om-scrim var(--dur-base) var(--ease-out);
	}
	.sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 71;
		padding: 8px 12px calc(18px + env(safe-area-inset-bottom));
		background: var(--color-surface-card);
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		box-shadow: var(--shadow-pop);
		animation: wala-om-sheet var(--dur-base) var(--ease-out);
	}
	.grabber {
		width: 38px;
		height: 4px;
		margin: 6px auto 8px;
		border-radius: var(--radius-pill);
		background: var(--color-sand-300);
	}
	.sheet-title {
		padding: 4px 8px 8px;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 15px;
		color: var(--color-text-strong);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Action items */
	.item {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		text-align: left;
		border: none;
		background: none;
		padding: 9px 11px;
		border-radius: var(--radius-md);
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 13.5px;
		color: var(--color-text-body);
		cursor: pointer;
		white-space: nowrap;
		transition: background var(--dur-fast) var(--ease-out);
	}
	.item:hover {
		background: var(--color-sand-100);
	}
	.item.danger {
		color: var(--color-danger-ink);
	}
	.item.danger:hover {
		background: var(--color-danger-soft);
	}
	.item:disabled {
		cursor: default;
		opacity: 0.5;
	}
	.item:disabled:hover {
		background: none;
	}
	.item.big {
		gap: 13px;
		padding: 13px 9px;
		font-size: 15px;
	}

	.item-icon {
		flex: none;
		width: 18px;
		text-align: center;
		font-size: 14px;
	}
	.item.big .item-icon {
		width: 22px;
		font-size: 17px;
	}

	@keyframes wala-om-pop {
		from {
			opacity: 0;
			transform: translateY(-4px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@keyframes wala-om-sheet {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
	@keyframes wala-om-scrim {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.popover,
		.sheet,
		.scrim {
			animation: none;
		}
	}
</style>
