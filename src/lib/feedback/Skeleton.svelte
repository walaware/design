<script lang="ts">
	interface Props {
		/** Shape of the placeholder. */
		variant?: 'rect' | 'text' | 'circle';
		/** Width — number → px, or any CSS length. Defaults to fill (100%). */
		width?: string | number;
		/** Height — number → px, or any CSS length. Defaults per variant. */
		height?: string | number;
		/** Corner radius override; falls back to a per-variant default. */
		radius?: string;
		/** Placeholder animation. Reduced-motion always freezes to a static tint. */
		motion?: 'pulse' | 'shimmer' | 'none';
		class?: string;
		[key: string]: unknown;
	}

	let {
		variant = 'rect',
		width,
		height,
		radius,
		motion = 'pulse',
		class: klass = '',
		...rest
	}: Props = $props();

	const len = (v: string | number | undefined) =>
		v == null ? undefined : typeof v === 'number' ? `${v}px` : v;

	// Sensible per-variant defaults so callers can drop a bare <Skeleton />.
	const w = $derived(len(width) ?? (variant === 'circle' ? '40px' : '100%'));
	const h = $derived(
		len(height) ?? (variant === 'circle' ? w : variant === 'text' ? '0.85em' : '16px')
	);
	const r = $derived(
		radius ??
			(variant === 'circle'
				? 'var(--radius-pill)'
				: variant === 'text'
					? 'var(--radius-sm)'
					: 'var(--radius-md)')
	);
</script>

<!--
	Skeleton — a calm loading placeholder in the house style. Blocks breathe
	with a soft pulse (or an opt-in shimmer sweep) and freeze to a static sand
	tint under prefers-reduced-motion. Purely decorative: it's aria-hidden, so
	give the surrounding loading region aria-busy="true" for assistive tech.
-->
<span
	class="wala-skeleton {motion} {klass}"
	style:width={w}
	style:height={h}
	style:border-radius={r}
	aria-hidden="true"
	{...rest}
></span>

<style>
	.wala-skeleton {
		display: inline-block;
		background: var(--color-surface-sunk);
		vertical-align: middle;
	}

	.wala-skeleton.pulse {
		animation: wala-skeleton-pulse 1.4s var(--ease-out) infinite;
	}

	.wala-skeleton.shimmer {
		position: relative;
		overflow: hidden;
	}
	.wala-skeleton.shimmer::after {
		content: '';
		position: absolute;
		inset: 0;
		transform: translateX(-100%);
		background: linear-gradient(
			90deg,
			transparent 0%,
			color-mix(in oklab, var(--color-white) 65%, transparent) 50%,
			transparent 100%
		);
		animation: wala-skeleton-sweep 1.6s var(--ease-out) infinite;
	}

	@keyframes wala-skeleton-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.55;
		}
	}

	@keyframes wala-skeleton-sweep {
		100% {
			transform: translateX(100%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.wala-skeleton,
		.wala-skeleton.pulse {
			animation: none;
			opacity: 0.75;
		}
		.wala-skeleton.shimmer::after {
			animation: none;
			display: none;
		}
	}
</style>
