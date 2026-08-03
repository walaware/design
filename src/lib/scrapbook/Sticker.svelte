<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Tone = 'sun' | 'coral' | 'berry' | 'plain';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		/** Emoji to show inside the badge (ignored when `children` is given). */
		emoji?: string;
		/** Soft badge colour. */
		tone?: Tone;
		/** Rotation in degrees — the hand-stuck-on tilt. */
		tilt?: number;
		/** Diameter in px. */
		size?: number;
		/** Purely decorative by default (hidden from assistive tech). */
		decorative?: boolean;
		children?: Snippet;
	}

	let {
		emoji,
		tone = 'sun',
		tilt = -6,
		size = 40,
		decorative = true,
		children,
		class: klass = '',
		...rest
	}: Props = $props();
</script>

<!--
	A little fridge-magnet / washi-badge accent for scrapbook surfaces. Decorative
	by default (aria-hidden) — a soft tinted disc with a hand-stuck tilt and a
	white ring, holding an emoji or slotted content. Used by PhotoWall's corners.
-->
<span
	class="wala-sticker t-{tone} {klass}"
	style:--tilt="{tilt}deg"
	style:--size="{size}px"
	aria-hidden={decorative ? 'true' : undefined}
	{...rest}
>
	{#if children}{@render children()}{:else if emoji}{emoji}{/if}
</span>

<style>
	.wala-sticker {
		display: inline-grid;
		place-items: center;
		flex: none;
		width: var(--size);
		height: var(--size);
		font-size: calc(var(--size) * 0.5);
		line-height: 1;
		border-radius: var(--radius-pill);
		background: var(--sticker-bg, var(--color-sun-200));
		border: 2.5px solid var(--color-white);
		box-shadow: var(--shadow-soft);
		transform: rotate(var(--tilt));
		user-select: none;
	}
	.t-sun {
		--sticker-bg: var(--color-sun-200);
	}
	.t-coral {
		--sticker-bg: var(--color-coral-200);
	}
	.t-berry {
		--sticker-bg: var(--color-berry-200);
	}
	.t-plain {
		--sticker-bg: var(--color-sand-200);
	}
</style>
