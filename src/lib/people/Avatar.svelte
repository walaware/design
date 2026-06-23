<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { colorFor } from './colors.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		name?: string;
		/** Explicit colour; `null`/omitted derives a stable colour from the name. */
		color?: string | null;
		/** Diameter in px. */
		size?: number;
		/** White ring (for overlapping clusters). */
		ring?: boolean;
		/** Show an emoji instead of the initial. */
		emoji?: string | null;
		/** Photo URL; falls back to the coloured initial when missing/empty or on load error. */
		src?: string | null;
	}

	let { name = '?', color, size = 36, ring = false, emoji = null, src = null, ...rest }: Props = $props();

	const initial = $derived((name.trim()[0] || '?').toUpperCase());
	const bg = $derived(colorFor(name, color));
	const altText = $derived(name && name !== '?' ? name : '');

	// A broken/expired/rate-limited photo must never show a broken-image icon —
	// fall back to the initial. Reset when `src` changes (CDN URLs rotate).
	let imgError = $state(false);
	$effect(() => {
		src;
		imgError = false;
	});
	const showImg = $derived(!emoji && !!src && !imgError);
</script>

<!--
	Friendly round avatar. Shows the person's photo when `src` is given, else a
	coloured initial (their identity in account-less walaware apps). `emoji`
	overrides both. The colour-derived background sits behind the photo (visible
	while it loads and for transparent images).
-->
<span
	title={name}
	class="wala-avatar {ring ? 'ring' : ''}"
	style:width="{size}px"
	style:height="{size}px"
	style:font-size="{Math.round(size * 0.42)}px"
	style:background={bg}
	{...rest}
>
	{#if emoji}
		{emoji}
	{:else if showImg}
		<img class="img" {src} alt={altText} onerror={() => (imgError = true)} />
	{:else}
		{initial}
	{/if}
</span>

<style>
	.wala-avatar {
		display: inline-grid;
		place-items: center;
		flex: none;
		overflow: hidden;
		border-radius: var(--radius-pill);
		color: var(--color-white);
		font-family: var(--font-display);
		font-weight: 600;
		line-height: 1;
		user-select: none;
	}
	.wala-avatar .img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: inherit;
		display: block;
	}
	.wala-avatar.ring {
		border: 2.5px solid var(--color-white);
		box-shadow: 0 0 0 1px rgba(58, 45, 40, 0.06);
	}
</style>
