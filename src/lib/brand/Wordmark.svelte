<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		/** App-specific root, lowercase, no suffix. */
		root?: string;
		/** The constant family suffix. */
		suffix?: string;
		/** Suffix colour — the family thread. Keep coral. */
		accent?: string;
		/** Root colour. */
		ink?: string;
		/** Font size in px (number) or any CSS length. */
		size?: number | string;
		/** Fredoka weight. */
		weight?: 400 | 500 | 600 | 700;
		/** Show the subtle middot between root and suffix. */
		showDot?: boolean;
	}

	let {
		root = 'trip',
		suffix = 'wala',
		accent = 'var(--color-wala, #ff7a59)',
		ink = 'var(--color-brand-ink, #3a2d28)',
		size = 64,
		weight = 600,
		showDot = true,
		...rest
	}: Props = $props();

	const px = $derived(typeof size === 'number' ? `${size}px` : size);
</script>

<!--
	walaware family wordmark — root in ink + the constant coral "wala".
	"wala" never recolours with the per-app accent, so the suite reads as
	one family. `root` is a prop; everything else is fixed by the brand.
-->
<span class="wala-wordmark" style:font-size={px} style:font-weight={weight} style:color={ink} {...rest}>
	<span>{root}</span>
	{#if showDot}<span class="dot" style:color={accent}>·</span>{/if}
	<span style:color={accent}>{suffix}</span>
</span>

<style>
	.wala-wordmark {
		font-family: var(--font-display, 'Fredoka', system-ui, sans-serif);
		line-height: 1;
		white-space: nowrap;
		display: inline-flex;
		align-items: baseline;
		letter-spacing: -0.025em;
	}
	.dot {
		opacity: 0.5;
		padding: 0 0.04em;
	}
</style>
