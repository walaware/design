<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Leading emoji shown in a rounded tile. */
		icon?: string;
		/** Tile background. */
		iconBg?: string;
		/** Section title — keep it a friendly question. */
		title?: string;
		/** Optional trailing action (button, chip, link). */
		action?: Snippet;
	}

	let { icon, iconBg = 'var(--color-sand-200)', title, action }: Props = $props();
</script>

<!-- Card header: emoji tile + question title, at the top of each section. -->
<div class="wala-cardheader">
	{#if icon}
		<span class="icon" style:background={iconBg}>{icon}</span>
	{/if}
	<span class="title">{title}</span>
	{#if action}<span class="action">{@render action()}</span>{/if}
</div>

<style>
	.wala-cardheader {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 14px;
	}
	.icon {
		width: 32px;
		height: 32px;
		flex: none;
		border-radius: var(--radius-md);
		display: grid;
		place-items: center;
		font-size: 16px;
	}
	.title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: var(--text-heading);
		color: var(--color-text-strong);
	}
	.action {
		margin-left: auto;
	}
</style>
