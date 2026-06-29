<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Tone = 'neutral' | 'coral' | 'sun' | 'berry' | 'leaf' | 'danger';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		tone?: Tone;
		/** Transparent fill, coloured border only. */
		outline?: boolean;
		children?: Snippet;
	}

	let { tone = 'neutral', outline = false, children, class: klass = '', ...rest }: Props = $props();
</script>

<!-- Small rounded pill for counts, tags, and status summaries. -->
<span class="wala-chip t-{tone} {outline ? 'outline' : ''} {klass}" {...rest}>
	{#if children}{@render children()}{/if}
</span>

<style>
	.wala-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: var(--text-tiny);
		padding: 5px 12px;
		border-radius: var(--radius-pill);
		color: var(--chip-fg);
		background: var(--chip-bg);
		border: 2px solid var(--chip-bd);
		white-space: nowrap;
	}
	.wala-chip.outline {
		background: transparent;
	}
	.t-neutral {
		--chip-bg: var(--color-surface-chip);
		--chip-fg: var(--color-cocoa-700);
		--chip-bd: var(--color-sand-300);
	}
	.t-coral {
		--chip-bg: var(--color-coral-200);
		--chip-fg: var(--color-coral-700);
		--chip-bd: var(--color-coral-200);
	}
	.t-sun {
		--chip-bg: var(--color-sun-200);
		/* cocoa-700, not sun-600 — amber-on-amber (sun-600 on sun-200) fails contrast
		   for labels like "In planning" / "N maybe". The only tone that needed it. */
		--chip-fg: var(--color-cocoa-700);
		--chip-bd: var(--color-sun-200);
	}
	.t-berry {
		--chip-bg: var(--color-berry-200);
		--chip-fg: var(--color-berry-600);
		--chip-bd: var(--color-berry-200);
	}
	.t-leaf {
		--chip-bg: var(--color-leaf-200);
		--chip-fg: var(--color-leaf-600);
		--chip-bd: var(--color-leaf-200);
	}
	.t-danger {
		--chip-bg: var(--color-danger-soft);
		--chip-fg: var(--color-danger-ink);
		--chip-bd: var(--color-danger-soft);
	}
</style>
