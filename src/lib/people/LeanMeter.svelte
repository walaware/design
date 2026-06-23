<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { LEAN_LEVELS, type Lean } from './lean.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		/** How confident a "Maybe" really is. */
		lean?: Lean;
		showLabel?: boolean;
	}

	let { lean = 2, showLabel = true, class: klass = '', ...rest }: Props = $props();

	const l = $derived(LEAN_LEVELS[lean] ?? LEAN_LEVELS[2]);
</script>

<!--
	Captures how flaky a "Maybe" really is. Three dots fill by confidence
	so the host can read the room at a glance.
-->
<span class="wala-leanmeter {klass}" {...rest}>
	<span class="dots">
		{#each [1, 2, 3] as i (i)}
			<span class="dot" style:background={i <= l.dots ? l.color : 'var(--color-sand-300)'}></span>
		{/each}
	</span>
	{#if showLabel}
		<span class="label" style:color={l.color}>{l.label}</span>
	{/if}
</span>

<style>
	.wala-leanmeter {
		display: inline-flex;
		align-items: center;
		gap: 7px;
	}
	.dots {
		display: inline-flex;
		gap: 3px;
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: var(--radius-pill);
	}
	.label {
		font-family: var(--font-body);
		font-weight: 800;
		font-size: 11.5px;
	}
</style>
