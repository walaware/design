<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Tone = 'soft' | 'sun' | 'plain' | 'solid';

	interface Props extends HTMLButtonAttributes {
		tone?: Tone;
		/** Diameter in px. */
		size?: number;
		children?: Snippet;
	}

	let { tone = 'soft', size = 40, children, class: klass = '', ...rest }: Props = $props();
</script>

<!-- Round icon-only button for compact actions (+ add, close, more). -->
<button
	class="wala-iconbtn t-{tone} {klass}"
	style:width="{size}px"
	style:height="{size}px"
	style:font-size="{Math.round(size * 0.45)}px"
	{...rest}
>
	{#if children}{@render children()}{/if}
</button>

<style>
	.wala-iconbtn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		box-shadow: none;
	}
	.wala-iconbtn {
		flex: none;
		display: grid;
		place-items: center;
		border: none;
		border-radius: var(--radius-pill);
		background: var(--ib-bg);
		color: var(--ib-fg);
		cursor: pointer;
		transition:
			transform var(--dur-fast) var(--ease-spring),
			filter var(--dur-fast);
	}
	.wala-iconbtn:active {
		transform: scale(0.9);
	}
	.t-soft {
		--ib-bg: var(--color-coral-200);
		--ib-fg: var(--color-coral-700);
	}
	.t-sun {
		--ib-bg: var(--color-sun-200);
		--ib-fg: var(--color-sun-600);
	}
	.t-plain {
		--ib-bg: var(--color-sand-200);
		--ib-fg: var(--color-cocoa-700);
	}
	.t-solid {
		--ib-bg: var(--color-primary);
		--ib-fg: var(--color-white);
	}
</style>
