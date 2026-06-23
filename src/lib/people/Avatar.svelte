<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { colorFor } from './colors.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		name?: string;
		/** Explicit colour; otherwise derived from the name. */
		color?: string;
		/** Diameter in px. */
		size?: number;
		/** White ring (for overlapping clusters). */
		ring?: boolean;
		/** Show an emoji instead of the initial. */
		emoji?: string | null;
	}

	let { name = '?', color, size = 36, ring = false, emoji = null, ...rest }: Props = $props();

	const initial = $derived((name.trim()[0] || '?').toUpperCase());
	const bg = $derived(colorFor(name, color));
</script>

<!--
	Friendly round initial chip. People in walaware apps are account-less,
	so the coloured initial IS their identity.
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
	{emoji || initial}
</span>

<style>
	.wala-avatar {
		display: inline-grid;
		place-items: center;
		flex: none;
		border-radius: var(--radius-pill);
		color: var(--color-white);
		font-family: var(--font-display);
		font-weight: 600;
		line-height: 1;
		user-select: none;
	}
	.wala-avatar.ring {
		border: 2.5px solid var(--color-white);
		box-shadow: 0 0 0 1px rgba(58, 45, 40, 0.06);
	}
</style>
