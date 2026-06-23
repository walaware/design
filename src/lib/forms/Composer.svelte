<script lang="ts">
	import Avatar from '../people/Avatar.svelte';
	import IconButton from '../core/IconButton.svelte';

	interface Props {
		placeholder?: string;
		/** Called with the trimmed message on send. */
		onSend?: (text: string) => void;
		/** Optional "me" avatar shown at the leading edge. */
		me?: { name: string; color?: string } | null;
	}

	let { placeholder = 'Message the crew…', onSend, me = null }: Props = $props();

	let text = $state('');

	function send() {
		const t = text.trim();
		if (!t) return;
		onSend?.(t);
		text = '';
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') send();
	}
</script>

<!-- Rounded input + send button for the trip chat (or any quick note). -->
<div class="wala-composer">
	{#if me}<Avatar name={me.name} color={me.color} size={32} />{/if}
	<div class="field">
		<input bind:value={text} {placeholder} onkeydown={onKeydown} />
		<IconButton tone="solid" size={34} aria-label="Send" onclick={send}>↑</IconButton>
	</div>
</div>

<style>
	.wala-composer {
		display: flex;
		align-items: center;
		gap: 9px;
	}
	.field {
		flex: 1;
		display: flex;
		align-items: center;
		background: var(--color-white);
		border: 2px solid var(--color-sand-300);
		border-radius: var(--radius-pill);
		padding: 0 6px 0 16px;
	}
	input {
		flex: 1;
		min-width: 0;
		border: none;
		outline: none;
		background: transparent;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 14px;
		color: var(--color-text-strong);
		padding: 11px 0;
	}
</style>
