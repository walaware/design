<script lang="ts">
	import type { Snippet } from 'svelte';
	import { STATUS_MAP, type Status } from './status.js';

	interface Props {
		status?: Status;
		/** Override the default label text. */
		children?: Snippet;
	}

	let { status = 'going', children }: Props = $props();

	const s = $derived(STATUS_MAP[status] ?? STATUS_MAP.going);
</script>

<!-- Status badge for RSVP / claim state — Going, Maybe, Out, Set, Open. -->
<span class="wala-statusbadge b-{s.cls}">
	{#if s.emoji}<span class="emoji">{s.emoji}</span>{/if}
	{#if children}{@render children()}{:else}{s.label}{/if}
</span>

<style>
	.wala-statusbadge {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-family: var(--font-body);
		font-weight: 800;
		font-size: var(--text-tiny);
		padding: 5px 11px;
		border-radius: var(--radius-pill);
		background: var(--sb-bg);
		color: var(--sb-fg);
		white-space: nowrap;
	}
	.emoji {
		font-size: 11px;
	}
	.b-going {
		--sb-bg: var(--color-status-going-soft);
		--sb-fg: var(--color-leaf-600);
	}
	.b-maybe {
		--sb-bg: var(--color-status-maybe-soft);
		--sb-fg: var(--color-sun-600);
	}
	.b-out {
		--sb-bg: var(--color-sand-200);
		--sb-fg: var(--color-cocoa-500);
	}
	.b-open {
		--sb-bg: var(--color-accent-soft);
		--sb-fg: var(--color-berry-600);
	}
</style>
