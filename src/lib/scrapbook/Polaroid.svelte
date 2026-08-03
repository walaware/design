<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		/** Thumbnail URL (already proxied by the app). */
		src: string;
		/** Alt text passthrough — leave empty for a purely decorative photo. */
		alt?: string;
		/** Optional handwritten caption printed under the photo. */
		caption?: string;
		/** Base rotation in degrees — the scattered tilt. */
		tilt?: number;
		/** A strip of washi tape across the top edge. */
		tape?: boolean;
	}

	let { src, alt = '', caption, tilt = 0, tape = false, class: klass = '', ...rest }: Props =
		$props();

	// A broken / expired / rate-limited thumbnail must never show a broken-image
	// icon — fall back to a soft placeholder. Reset when `src` changes.
	let imgError = $state(false);
	$effect(() => {
		src;
		imgError = false;
	});
	const showImg = $derived(!!src && !imgError);
</script>

<!--
	One polaroid in the pile — a white frame with a thick bottom lip, a soft-sunk
	photo, an optional washi-tape strip and handwritten caption. Sits at a static
	tilt; on hover it lifts and straightens (skipped under reduced-motion).
-->
<figure class="wala-polaroid {klass}" style:--tilt="{tilt}deg" {...rest}>
	{#if tape}<span class="tape" aria-hidden="true"></span>{/if}
	<div class="photo">
		{#if showImg}
			<img {src} {alt} loading="lazy" decoding="async" onerror={() => (imgError = true)} />
		{:else}
			<span class="ph" aria-hidden="true">📷</span>
		{/if}
	</div>
	{#if caption}<figcaption>{caption}</figcaption>{/if}
</figure>

<style>
	.wala-polaroid {
		--frame: 8px;
		margin: 0;
		padding: var(--frame) var(--frame) calc(var(--frame) * 2.4);
		background: var(--color-white);
		border-radius: var(--radius-sm);
		box-shadow: var(--shadow-pop);
		transform: rotate(var(--tilt));
		transition:
			transform var(--dur-base) var(--ease-spring),
			box-shadow var(--dur-base) var(--ease-out);
		position: relative;
	}
	.wala-polaroid:hover {
		transform: rotate(0deg) translateY(-6px) scale(1.03);
		box-shadow: 0 22px 40px -14px rgba(255, 122, 89, 0.5);
		z-index: 2;
	}
	.photo {
		aspect-ratio: 1 / 1;
		border-radius: calc(var(--radius-sm) - 6px);
		overflow: hidden;
		background: var(--color-surface-sunk);
		display: grid;
		place-items: center;
	}
	.photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.photo .ph {
		font-size: 26px;
		opacity: 0.5;
	}
	figcaption {
		margin-top: 8px;
		text-align: center;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: var(--text-small);
		color: var(--color-text-body);
		letter-spacing: var(--ls-tight);
	}
	.tape {
		position: absolute;
		top: -9px;
		left: 50%;
		width: 46%;
		height: 18px;
		transform: translateX(-50%) rotate(-2deg);
		background: color-mix(in srgb, var(--color-sun-300) 62%, transparent);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
		border-radius: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.wala-polaroid {
			transition: none;
		}
		.wala-polaroid:hover {
			transform: rotate(var(--tilt));
			box-shadow: var(--shadow-pop);
		}
	}
</style>
