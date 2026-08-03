<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Polaroid from './Polaroid.svelte';
	import Sticker from './Sticker.svelte';

	export interface WallPhoto {
		src: string;
		alt?: string;
	}

	interface Props extends HTMLAttributes<HTMLElement> {
		/** Thumbnails (already proxied by the app). Capped at `max`. */
		photos?: WallPhoto[];
		/** Big scrapbook heading — usually the trip name. */
		title?: string;
		/** Supporting line, e.g. "Jul 18–21 · 5 crew". */
		subtitle?: string;
		/** Link out to the full album; omit to hide the link. */
		albumUrl?: string;
		/** Album link label. */
		albumLabel?: string;
		/** Decorative corner emoji. Pass `false` to drop them, or your own set. */
		stickers?: string[] | false;
		/** Cap the number of photos rendered. */
		max?: number;
	}

	let {
		photos = [],
		title,
		subtitle,
		albumUrl,
		albumLabel = 'See all photos ↗',
		stickers,
		max = 30,
		class: klass = '',
		...rest
	}: Props = $props();

	const DEFAULT_STICKERS = ['📸', '✨', '🌴', '💛'];
	// Fixed tilt + lift sequences → SSR-stable, no Math.random, still feels scattered.
	const TILTS = [-5, 4, -3, 6, -6, 3, -4, 5, -2, 2, -6, 4];
	const LIFTS = [0, 14, 4, 18, 8, 0, 12, 2, 16, 6];
	const CORNERS = ['tl', 'tr', 'bl', 'br'] as const;
	const STICKER_TONES = ['coral', 'sun', 'berry', 'sun'] as const;
	const STICKER_TILTS = [-8, 7, 6, -7];

	const shown = $derived(photos.slice(0, Math.max(0, max)));
	const stickerSet = $derived(
		stickers === false ? [] : stickers && stickers.length ? stickers : DEFAULT_STICKERS
	);
	// Show the frame when there's anything to celebrate.
	const hasContent = $derived(shown.length > 0 || !!title);
</script>

<!--
	PhotoWall — the celebratory "look back at the trip" collage. A warm gradient
	board with a scrapbook heading, a scattered pile of tilted polaroids (graceful
	from 1 to ~30 photos), decorative corner stickers, and a link out to the full
	album. Stickers/tape are aria-hidden; photo alt text passes straight through;
	hover motion respects prefers-reduced-motion.
-->
{#if hasContent}
	<section class="wala-photowall {klass}" {...rest}>
		{#each stickerSet.slice(0, 4) as sticker, i (i)}
			<Sticker
				class="corner c-{CORNERS[i]}"
				emoji={sticker}
				tone={STICKER_TONES[i]}
				tilt={STICKER_TILTS[i]}
			/>
		{/each}

		{#if title || subtitle}
			<header class="head">
				{#if title}<h2 class="title">{title}</h2>{/if}
				{#if subtitle}<p class="subtitle">{subtitle}</p>{/if}
			</header>
		{/if}

		{#if shown.length}
			<div class="pile" data-count={shown.length}>
				{#each shown as photo, i (photo.src + i)}
					<div class="slot" style:--lift="{LIFTS[i % LIFTS.length]}px">
						<Polaroid src={photo.src} alt={photo.alt ?? ''} tilt={TILTS[i % TILTS.length]} tape={i % 3 === 1} />
					</div>
				{/each}
			</div>
		{/if}

		{#if albumUrl}
			<a class="album" href={albumUrl} target="_blank" rel="noopener noreferrer">{albumLabel}</a>
		{/if}
	</section>
{/if}

<style>
	.wala-photowall {
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 18px;
		padding: 26px 20px 24px;
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-pop);
		background:
			radial-gradient(
				85% 70% at 12% 0%,
				color-mix(in srgb, var(--color-coral-200) 75%, transparent),
				transparent 62%
			),
			radial-gradient(
				90% 75% at 88% 8%,
				color-mix(in srgb, var(--color-sun-200) 85%, transparent),
				transparent 60%
			),
			radial-gradient(
				70% 60% at 60% 100%,
				color-mix(in srgb, var(--color-berry-200) 55%, transparent),
				transparent 60%
			),
			var(--color-sand-100);
	}

	.head {
		text-align: center;
		max-width: 34ch;
	}
	.title {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: var(--text-display);
		line-height: var(--lh-tight);
		letter-spacing: var(--ls-tight);
		color: var(--color-text-strong);
		text-wrap: balance;
	}
	.subtitle {
		margin: 6px 0 0;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--text-body);
		color: var(--color-text-muted);
	}

	.pile {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: flex-start;
		gap: 16px 14px;
		width: 100%;
		padding: 6px 2px 2px;
	}
	.slot {
		width: clamp(116px, 30%, 150px);
		transform: translateY(var(--lift));
	}

	/* Few photos read as an intentional cluster, not a stretched row. */
	.pile[data-count='1'] .slot {
		width: clamp(180px, 62%, 240px);
		transform: none;
	}
	.pile[data-count='2'] .slot,
	.pile[data-count='3'] .slot {
		width: clamp(140px, 40%, 190px);
	}

	.album {
		display: inline-flex;
		align-items: center;
		min-height: var(--tap-min);
		padding: 0 18px;
		border-radius: var(--radius-pill);
		background: var(--color-white);
		color: var(--color-primary-press);
		font-family: var(--font-display);
		font-weight: 600;
		font-size: var(--text-body);
		box-shadow: var(--shadow-soft);
		text-decoration: none;
		transition: transform var(--dur-fast) var(--ease-spring);
	}
	.album:hover {
		transform: translateY(-2px);
	}
	.album:focus-visible {
		outline: 3px solid var(--color-focus-ring);
		outline-offset: 2px;
	}

	.wala-photowall :global(.corner) {
		position: absolute;
		z-index: 3;
		pointer-events: none;
	}
	.wala-photowall :global(.c-tl) {
		top: 12px;
		left: 12px;
	}
	.wala-photowall :global(.c-tr) {
		top: 12px;
		right: 12px;
	}
	.wala-photowall :global(.c-bl) {
		bottom: 14px;
		left: 12px;
	}
	.wala-photowall :global(.c-br) {
		bottom: 14px;
		right: 12px;
	}

	/* Slim gutters + smaller stickers on narrow screens. */
	@media (max-width: 420px) {
		.wala-photowall {
			padding: 22px 14px 20px;
		}
		.slot {
			width: clamp(120px, 44%, 156px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.album {
			transition: none;
		}
		.album:hover {
			transform: none;
		}
	}
</style>
