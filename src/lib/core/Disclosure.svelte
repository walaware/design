<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onToggle'> {
		/** Always-visible summary content (left of the chevron). */
		summary: string | Snippet;
		/** The collapsible content. */
		children?: Snippet;
		/** Optional leading icon/emoji shown before the summary. */
		icon?: string | Snippet;
		/** Controlled open state. Omit for uncontrolled (use `defaultOpen`). */
		open?: boolean;
		/** Initial open state when uncontrolled. */
		defaultOpen?: boolean;
		/** Fired with the next open state on toggle. */
		onToggle?: (open: boolean) => void;
		/** Show the rotating chevron. */
		chevron?: boolean;
		disabled?: boolean;
		/** Inline style for the summary button row. */
		summaryStyle?: string;
		/** Inline style for the content wrapper. */
		contentStyle?: string;
	}

	let {
		summary,
		children,
		icon,
		open,
		defaultOpen = false,
		onToggle,
		chevron = true,
		disabled = false,
		summaryStyle = '',
		contentStyle = '',
		class: klass = '',
		...rest
	}: Props = $props();

	// Controlled when `open` is supplied; otherwise track our own state.
	// svelte-ignore state_referenced_locally -- intentionally seeds from the initial defaultOpen
	let inner = $state(defaultOpen);
	const isControlled = $derived(open != null);
	const isOpen = $derived(isControlled ? !!open : inner);

	function toggle() {
		if (disabled) return;
		const next = !isOpen;
		if (!isControlled) inner = next;
		onToggle?.(next);
	}
</script>

<!--
	Collapsible section — a tappable summary row with a rotating chevron over
	height-animated content. Controlled (`open` + `onToggle`) or uncontrolled
	(`defaultOpen`); the body eases open/closed via a grid-rows trick and the
	chevron flips. Respects prefers-reduced-motion. Use for settings groups,
	gear/packing lists, "show more", or any expand/collapse row.
-->
<div class="wala-disclosure {klass}" {...rest}>
	<button
		type="button"
		class="summary"
		aria-expanded={isOpen}
		{disabled}
		onclick={toggle}
		style={summaryStyle}
	>
		{#if icon != null}
			<span class="icon">
				{#if typeof icon === 'function'}{@render icon()}{:else}{icon}{/if}
			</span>
		{/if}
		<span class="label">
			{#if typeof summary === 'function'}{@render summary()}{:else}{summary}{/if}
		</span>
		{#if chevron}
			<span class="chevron {isOpen ? 'open' : ''}" aria-hidden="true">⌄</span>
		{/if}
	</button>
	<div class="content {isOpen ? 'open' : ''}">
		<div class="content-clip">
			<div class="content-pad" style={contentStyle}>
				{#if children}{@render children()}{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.summary {
		display: flex;
		align-items: center;
		gap: 11px;
		width: 100%;
		text-align: left;
		border: none;
		background: none;
		padding: 12px 2px;
		cursor: pointer;
		color: var(--color-text-strong);
		font-family: var(--font-body);
	}
	.summary:disabled {
		cursor: default;
		opacity: 0.5;
	}

	.icon {
		flex: none;
		display: grid;
		place-items: center;
		font-size: 18px;
		width: 24px;
	}
	.label {
		flex: 1;
		min-width: 0;
	}

	.chevron {
		flex: none;
		font-size: 15px;
		font-weight: 800;
		color: var(--color-text-muted);
		transform: rotate(0deg);
		transition: transform var(--dur-base) var(--ease-spring);
	}
	.chevron.open {
		transform: rotate(180deg);
	}

	/* Height-animated body via the grid-rows 0fr→1fr trick. */
	.content {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--dur-base) var(--ease-out);
	}
	.content.open {
		grid-template-rows: 1fr;
	}
	.content-clip {
		overflow: hidden;
		min-height: 0;
	}
	.content-pad {
		padding-bottom: 4px;
	}

	@media (prefers-reduced-motion: reduce) {
		.chevron,
		.content {
			transition: none;
		}
	}
</style>
