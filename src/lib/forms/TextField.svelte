<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label?: string;
		/** Leading emoji / glyph inside the field. */
		prefix?: string | null;
		hint?: string;
		/** Two-way bound input value. */
		value?: string;
	}

	let { label, prefix = null, hint, value = $bindable(''), ...rest }: Props = $props();
</script>

<!-- Friendly rounded text field with an optional emoji/icon prefix. -->
<label class="wala-textfield">
	{#if label}<span class="label">{label}</span>{/if}
	<span class="field">
		{#if prefix}<span class="prefix">{prefix}</span>{/if}
		<input bind:value {...rest} />
	</span>
	{#if hint}<span class="hint">{hint}</span>{/if}
</label>

<style>
	.wala-textfield {
		display: block;
	}
	.label {
		display: block;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 14px;
		color: var(--color-text-strong);
		margin-bottom: 7px;
	}
	.field {
		display: flex;
		align-items: center;
		gap: 9px;
		background: var(--color-white);
		border: 2px solid var(--color-sand-300);
		border-radius: var(--radius-md);
		padding: 0 14px;
		transition:
			border-color var(--dur-base),
			box-shadow var(--dur-base);
	}
	.field:focus-within {
		border-color: var(--color-coral-400);
		box-shadow: 0 0 0 4px var(--color-coral-200);
	}
	.prefix {
		font-size: 18px;
	}
	input {
		flex: 1;
		min-width: 0;
		border: none;
		outline: none;
		background: transparent;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 16px;
		color: var(--color-text-strong);
		padding: 13px 0;
	}
	.hint {
		display: block;
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 12.5px;
		color: var(--color-text-muted);
		margin-top: 6px;
	}
</style>
