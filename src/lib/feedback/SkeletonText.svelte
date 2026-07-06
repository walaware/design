<script lang="ts">
	import Skeleton from './Skeleton.svelte';

	interface Props {
		/** Number of placeholder lines. */
		lines?: number;
		/** Height of each line — number → px, or any CSS length. */
		lineHeight?: string | number;
		/** Width of the final (ragged) line. Set '100%' for a flush block. */
		lastLine?: string;
		/** Gap between lines. */
		gap?: string | number;
		/** Passed through to each line. */
		motion?: 'pulse' | 'shimmer' | 'none';
		class?: string;
		[key: string]: unknown;
	}

	let {
		lines = 3,
		lineHeight = '0.85em',
		lastLine = '60%',
		gap = 10,
		motion = 'pulse',
		class: klass = '',
		...rest
	}: Props = $props();

	const gapLen = $derived(typeof gap === 'number' ? `${gap}px` : gap);
	const rows = $derived(Array.from({ length: Math.max(1, lines) }, (_, i) => i));
</script>

<!--
	SkeletonText — a stack of text-line placeholders with a ragged last line,
	for loading paragraphs and multi-line copy. Wraps Skeleton, so it inherits
	the same pulse/shimmer + reduced-motion behaviour.
-->
<span class="wala-skeleton-text {klass}" style:gap={gapLen} aria-hidden="true" {...rest}>
	{#each rows as i (i)}
		<Skeleton
			variant="text"
			height={lineHeight}
			width={i === rows.length - 1 && rows.length > 1 ? lastLine : '100%'}
			{motion}
		/>
	{/each}
</span>

<style>
	.wala-skeleton-text {
		display: flex;
		flex-direction: column;
	}
</style>
