<script lang="ts">
	import Button from '../core/Button.svelte';

	interface Props {
		/** The text to show and copy. */
		value: string;
		/** Field label above the input. */
		label?: string;
		/** Accessible name when there's no visible `label`. */
		ariaLabel?: string;
		/** Idle button label. */
		copyLabel?: string;
		/** Label shown after a successful copy. */
		copiedLabel?: string;
		/** How long the copied state sticks, in ms. */
		resetAfter?: number;
		onCopy?: (value: string) => void;
		class?: string;
	}

	let {
		value,
		label,
		ariaLabel,
		copyLabel = 'Copy',
		copiedLabel = 'Copied!',
		resetAfter = 1500,
		onCopy,
		class: klass = ''
	}: Props = $props();

	const id = $props.id();

	type CopyState = 'idle' | 'copied' | 'failed';
	let status = $state<CopyState>('idle');
	let inputEl: HTMLInputElement | undefined = $state();
	let timer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => () => clearTimeout(timer));

	function flash(next: CopyState) {
		status = next;
		clearTimeout(timer);
		timer = setTimeout(() => (status = 'idle'), resetAfter);
	}

	async function copy() {
		// navigator.clipboard is undefined outside secure contexts, and can reject
		// when the permission is denied — fall back to selecting the text so the
		// value is never simply unreachable.
		try {
			if (!navigator.clipboard) throw new Error('Clipboard API unavailable');
			await navigator.clipboard.writeText(value);
			flash('copied');
			onCopy?.(value);
		} catch {
			inputEl?.select();
			flash('failed');
		}
	}

	const buttonLabel = $derived(
		status === 'copied' ? copiedLabel : status === 'failed' ? 'Press ⌘C' : copyLabel
	);
</script>

<!--
	Readonly value with a Copy button — invite links, share URLs, album addresses.
	The button flips to "Copied!" briefly, and the result is announced politely so
	screen-reader users get the same confirmation the flip gives everyone else.
	When the clipboard isn't reachable the value is selected instead of failing
	silently.
-->
<div class="wala-copyfield {klass}">
	{#if label}<label class="cf-label" for={id}>{label}</label>{/if}
	<div class="cf-row">
		<input
			{id}
			bind:this={inputEl}
			class="cf-input"
			type="text"
			readonly
			{value}
			aria-label={label ? undefined : ariaLabel}
			onfocus={(e) => e.currentTarget.select()}
		/>
		<Button variant={status === 'copied' ? 'primary' : 'soft'} size="sm" onclick={copy}>
			{buttonLabel}
		</Button>
	</div>
	<p class="cf-sr" aria-live="polite">
		{#if status === 'copied'}Copied to clipboard.{:else if status === 'failed'}Couldn't reach the
			clipboard. The value is selected — press Control or Command C to copy.{/if}
	</p>
</div>

<style>
	.wala-copyfield {
		font-family: var(--font-body);
	}
	.cf-label {
		display: block;
		font-weight: 800;
		font-size: var(--text-tiny);
		color: var(--color-text-muted);
		margin-bottom: 5px;
	}
	.cf-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.cf-input {
		flex: 1;
		min-width: 0;
		font-family: inherit;
		font-weight: 700;
		font-size: var(--text-body);
		color: var(--color-text-body);
		background: var(--color-surface-sunk);
		border: 1px solid var(--color-border-soft);
		border-radius: var(--radius-md);
		padding: 9px 12px;
		text-overflow: ellipsis;
	}
	.cf-input:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 1px;
	}
	.cf-sr {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
