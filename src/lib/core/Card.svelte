<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		/** Apply the standard card padding. */
		pad?: boolean;
		/** Larger hero radius for sheets / feature cards. */
		hero?: boolean;
		children?: Snippet;
	}

	let { pad = true, hero = false, children, class: klass = '', ...rest }: Props = $props();
</script>

<!-- Soft rounded surface — the building block of every walaware section. -->
<div class="wala-card {hero ? 'hero' : ''} {pad ? 'pad' : ''} {klass}" {...rest}>
	{#if children}{@render children()}{/if}
</div>

<style>
	.wala-card {
		background: var(--color-surface-card);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-card);
	}
	.wala-card.hero {
		border-radius: var(--radius-xl);
	}
	.wala-card.pad {
		padding: var(--card-pad);
	}
</style>
