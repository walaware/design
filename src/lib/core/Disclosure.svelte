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

	const contentId = $props.id();
	let summaryEl: HTMLButtonElement | undefined = $state();
	let clipEl: HTMLDivElement | undefined = $state();

	function toggle() {
		if (disabled) return;
		const next = !isOpen;
		if (!isControlled) inner = next;
		onToggle?.(next);
	}

	// Collapsing strands focus on an `inert` node — pull it back to the summary.
	// An effect (not just `toggle`) so controlled consumers are covered too.
	$effect(() => {
		if (isOpen || !clipEl) return;
		if (clipEl.contains(document.activeElement)) summaryEl?.focus();
	});
</script>

<!--
	Collapsible section — a tappable summary row with a rotating chevron over
	height-animated content. Controlled (`open` + `onToggle`) or uncontrolled
	(`defaultOpen`); the body eases open/closed via a grid-rows trick and the
	chevron flips. Respects prefers-reduced-motion. Use for settings groups,
	gear/packing lists, "show more", or any expand/collapse row.

	While collapsed the body is `inert`, so its focusable children leave the tab
	order and the a11y tree; collapsing with focus inside returns focus to the
	summary rather than stranding it.

	**Popovers in the body are supported.** The body clips itself while it animates
	(that's what the height transition needs), but un-clips once open, so an
	`OverflowMenu`, `Tooltip`, or an app's own absolutely-positioned dropdown may
	overhang the content box. Give the popover a `z-index` if it must paint over a
	sibling below it. The one thing that still clips is a popover opened *during*
	the ~200ms open/close transition, which no pointer can realistically hit.
-->
<div class="wala-disclosure {klass}" {...rest}>
	<button
		bind:this={summaryEl}
		type="button"
		class="summary"
		aria-expanded={isOpen}
		aria-controls={contentId}
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
		<!--
			`inert` while collapsed: `overflow: hidden` only clips paint, so without
			it the body's buttons and inputs stay in the tab order and in the a11y
			tree — a closed group of six Disclosures would hand a keyboard user
			~30 invisible focus stops. Not `hidden="until-found"`: that applies
			`content-visibility: hidden`, which collapses the measured height and
			breaks the grid-rows open/close animation.
		-->
		<div class="content-clip" bind:this={clipEl} id={contentId} inert={!isOpen}>
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
	/*
		`overflow: hidden` is what makes the height animation read as a wipe — without
		it the body spills out of the 0fr row. But it also clips absolutely-positioned
		children, so a popover in the body (OverflowMenu, Tooltip, an app's dropdown)
		got cut off at the content box.

		Once the row has finished growing it is exactly content height, so `visible`
		clips nothing — it only lets popovers overhang. `overflow` is a discrete
		property: `allow-discrete` lets it flip mid-transition, and giving it a delay
		(and no duration) of its own defers the flip to the end of the height
		transition. Collapsing has neither, so it snaps back to `hidden` before the
		row shrinks.

		Deliberately CSS, not a `transitionend` listener: this stays correct for a
		Disclosure that mounts already open (no transition ever runs), for one hidden
		behind `display: none`, and under reduced motion — all cases a JS latch has to
		special-case.
	*/
	.content-clip {
		overflow: hidden;
		min-height: 0;
		transition: overflow 0s allow-discrete;
	}
	.content.open > .content-clip {
		overflow: visible;
		transition-delay: var(--dur-base);
	}
	.content-pad {
		padding-bottom: 4px;
	}

	@media (prefers-reduced-motion: reduce) {
		.chevron,
		.content {
			transition: none;
		}
		/* No height transition to wait out — un-clip on the spot. */
		.content.open > .content-clip {
			transition-delay: 0s;
		}
	}
</style>
