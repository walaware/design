<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onDestroy } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Placement = 'top' | 'bottom' | 'left' | 'right';
	type Tone = 'dark' | 'light';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		/** Bubble content — a string or a snippet. */
		label: string | Snippet;
		/** Side the bubble appears on. */
		placement?: Placement;
		/** Visual tone — dark (cocoa) or light (white). */
		tone?: Tone;
		/** Hover delay before showing, ms. */
		delay?: number;
		/** Max bubble width, px. */
		maxWidth?: number;
		/** Force display (controlled). Omit for hover/focus behaviour. */
		open?: boolean;
		/** The trigger element the tooltip wraps. */
		children?: Snippet;
	}

	let {
		label,
		placement = 'top',
		tone = 'dark',
		delay = 120,
		maxWidth = 220,
		open,
		children,
		class: klass = '',
		...rest
	}: Props = $props();

	let hovered = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	const shown = $derived(open ?? hovered);

	function show() {
		clearTimeout(timer);
		timer = setTimeout(() => (hovered = true), delay);
	}
	function hide() {
		clearTimeout(timer);
		hovered = false;
	}

	onDestroy(() => clearTimeout(timer));
</script>

<!--
	Hover/focus tooltip — a small cocoa bubble with a rotating-square arrow
	that wraps any trigger (icon button, chip, stat label). Opens on pointer
	enter AND keyboard focus so it stays accessible; a subtle fade + spring
	translate brings it in. Pass `open` to force it visible (controlled).
-->
<span
	class="wala-tooltip {klass}"
	onpointerenter={show}
	onpointerleave={hide}
	onfocusin={show}
	onfocusout={hide}
	{...rest}
>
	{#if children}{@render children()}{/if}
	<span
		role="tooltip"
		aria-hidden={!shown}
		class="bubble p-{placement} t-{tone} {shown ? 'shown' : ''}"
		style:max-width="{maxWidth}px"
	>
		{#if typeof label === 'function'}{@render label()}{:else}{label}{/if}
		<span aria-hidden="true" class="arrow"></span>
	</span>
</span>

<style>
	.wala-tooltip {
		position: relative;
		display: inline-flex;
	}

	.bubble {
		--rest: 4px;
		--tt-bg: var(--color-cocoa-900);
		--tt-fg: var(--color-white);
		--tt-bd: transparent;
		position: absolute;
		z-index: 80;
		width: max-content;
		padding: 7px 11px;
		border-radius: var(--radius-md);
		background: var(--tt-bg);
		color: var(--tt-fg);
		border: 1px solid var(--tt-bd);
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--text-tiny);
		line-height: 1.4;
		text-align: center;
		box-shadow: var(--shadow-pop);
		opacity: 0;
		pointer-events: none;
		transition:
			opacity var(--dur-fast) var(--ease-out),
			transform var(--dur-base) var(--ease-spring);
	}
	.bubble.shown {
		--rest: 0px;
		opacity: 1;
	}

	.t-dark {
		--tt-bg: var(--color-cocoa-900);
		--tt-fg: var(--color-white);
		--tt-bd: transparent;
	}
	.t-light {
		--tt-bg: var(--color-white);
		--tt-fg: var(--color-text-strong);
		--tt-bd: var(--color-sand-300);
	}

	/* Bubble placement — sits on the named face of the trigger, with a small
	   gap, and springs the last 4px toward the trigger as it appears. */
	.p-top {
		bottom: 100%;
		left: 50%;
		margin-bottom: 8px;
		transform: translateX(-50%) translateY(calc(-1 * var(--rest)));
	}
	.p-bottom {
		top: 100%;
		left: 50%;
		margin-top: 8px;
		transform: translateX(-50%) translateY(var(--rest));
	}
	.p-left {
		right: 100%;
		top: 50%;
		margin-right: 8px;
		transform: translateY(-50%) translateX(calc(-1 * var(--rest)));
	}
	.p-right {
		left: 100%;
		top: 50%;
		margin-left: 8px;
		transform: translateY(-50%) translateX(var(--rest));
	}

	/* Rotating-square arrow on the opposite face, inheriting the bubble fill
	   and the two border edges that face outward (for the light tone). */
	.arrow {
		position: absolute;
		width: 10px;
		height: 10px;
		background: var(--tt-bg);
		transform: rotate(45deg);
	}
	.p-top .arrow {
		top: 100%;
		left: 50%;
		margin-left: -5px;
		margin-top: -5px;
		border-right: 1px solid var(--tt-bd);
		border-bottom: 1px solid var(--tt-bd);
	}
	.p-bottom .arrow {
		bottom: 100%;
		left: 50%;
		margin-left: -5px;
		margin-bottom: -5px;
		border-left: 1px solid var(--tt-bd);
		border-top: 1px solid var(--tt-bd);
	}
	.p-left .arrow {
		left: 100%;
		top: 50%;
		margin-top: -5px;
		margin-left: -5px;
		border-top: 1px solid var(--tt-bd);
		border-right: 1px solid var(--tt-bd);
	}
	.p-right .arrow {
		right: 100%;
		top: 50%;
		margin-top: -5px;
		margin-right: -5px;
		border-bottom: 1px solid var(--tt-bd);
		border-left: 1px solid var(--tt-bd);
	}
</style>
