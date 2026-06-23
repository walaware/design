<script lang="ts">
	import Button from '../core/Button.svelte';

	interface Props {
		emoji?: string;
		title?: string;
		body?: string;
		/** Action button label; omit for no action. */
		action?: string;
		onAction?: () => void;
	}

	let { emoji = '🦗', title = "It's quiet in here…", body, action, onAction }: Props = $props();
</script>

<!--
	Friendly empty state — walaware never leaves a blank card. A big emoji,
	a warm line with personality, and a single inviting action.
-->
<div class="wala-emptystate">
	<div class="emoji">{emoji}</div>
	<div class="title">{title}</div>
	{#if body}<div class="body">{body}</div>{/if}
	{#if action}<Button variant="primary" size="md" onclick={() => onAction?.()}>{action}</Button>{/if}
</div>

<style>
	.wala-emptystate {
		text-align: center;
		padding: 28px 18px 24px;
	}
	.emoji {
		font-size: 40px;
		line-height: 1;
		margin-bottom: 12px;
	}
	.title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 18px;
		color: var(--color-text-strong);
		margin-bottom: 6px;
	}
	.body {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 14px;
		color: var(--color-text-muted);
		max-width: 260px;
		margin: 0 auto 16px;
	}
</style>
