<script lang="ts">
	type Option = string | { value: string; label: string };

	interface Props {
		options?: Option[];
		/** Two-way bound selected value. */
		value?: string;
		/** Called with the new value on change. */
		onChange?: (value: string) => void;
	}

	let { options = [], value = $bindable(), onChange }: Props = $props();

	const valueOf = (o: Option) => (typeof o === 'string' ? o : o.value);
	const labelOf = (o: Option) => (typeof o === 'string' ? o : o.label);

	function select(v: string) {
		value = v;
		onChange?.(v);
	}
</script>

<!--
	Segmented control (the RSVP picker). Rounded inset track; the active
	segment lifts onto a white pill.
-->
<div class="wala-segmented" role="tablist">
	{#each options as opt (valueOf(opt))}
		{@const v = valueOf(opt)}
		<button
			type="button"
			role="tab"
			aria-selected={v === value}
			class="seg {v === value ? 'active' : ''}"
			onclick={() => select(v)}
		>
			{labelOf(opt)}
		</button>
	{/each}
</div>

<style>
	.wala-segmented {
		display: flex;
		gap: 4px;
		padding: 4px;
		background: var(--color-surface-sunk);
		border-radius: var(--radius-pill);
	}
	.seg {
		flex: 1;
		border: none;
		border-radius: var(--radius-pill);
		padding: 9px 8px;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 14px;
		cursor: pointer;
		color: var(--color-text-muted);
		background: transparent;
		transition:
			background var(--dur-base) var(--ease-out),
			color var(--dur-base);
	}
	.seg.active {
		color: var(--color-text-strong);
		background: var(--color-white);
		box-shadow: var(--shadow-soft);
	}
</style>
