<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Avatar from './Avatar.svelte';

	type Person = string | { name: string; color?: string; src?: string };

	interface Props extends HTMLAttributes<HTMLDivElement> {
		people?: Person[];
		/** Max avatars shown before the "+N" overflow. */
		max?: number;
		size?: number;
		/** Override the "+N" overflow label. */
		overflowLabel?: string;
	}

	let { people = [], max = 5, size = 34, overflowLabel, class: klass = '', ...rest }: Props = $props();

	const shown = $derived(people.slice(0, max));
	const extra = $derived(people.length - shown.length);
	const nameOf = (p: Person) => (typeof p === 'string' ? p : p.name);
	const colorOf = (p: Person) => (typeof p === 'string' ? undefined : p.color);
	const srcOf = (p: Person) => (typeof p === 'string' ? undefined : p.src);
</script>

<!-- Overlapping cluster of avatars with an optional "+N" overflow. -->
<div class="wala-avatargroup {klass}" {...rest}>
	<div class="stack">
		{#each shown as p, i (i)}
			<Avatar
				name={nameOf(p)}
				color={colorOf(p)}
				src={srcOf(p)}
				{size}
				ring
				style={i === 0 ? '' : `margin-left:${-size * 0.28}px`}
			/>
		{/each}
	</div>
	{#if extra > 0 || overflowLabel}
		<span class="overflow">{overflowLabel || `+${extra}`}</span>
	{/if}
</div>

<style>
	.wala-avatargroup {
		display: inline-flex;
		align-items: center;
	}
	.stack {
		display: inline-flex;
	}
	.overflow {
		margin-left: 10px;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 13px;
		color: var(--color-text-muted);
	}
</style>
