<script lang="ts">
	interface Props {
		/** On/off. Bindable. */
		checked?: boolean;
		/** Visible label to the left of the track. */
		label?: string;
		/** Sub-line under the label. */
		meta?: string;
		/** Accessible name when there's no visible `label`. */
		ariaLabel?: string;
		disabled?: boolean;
		onChange?: (checked: boolean) => void;
		class?: string;
	}

	let {
		checked = $bindable(false),
		label,
		meta,
		ariaLabel,
		disabled = false,
		onChange,
		class: klass = ''
	}: Props = $props();

	const id = $props.id();

	function toggle() {
		if (disabled) return;
		checked = !checked;
		onChange?.(checked);
	}
</script>

<!--
	Pill toggle for an immediate boolean — notifications, visibility, opt-ins.
	Flips on click; `role="switch"` gives assistive tech on/off rather than the
	checkbox's checked/unchecked. Use a Button for anything that needs confirming.
-->
<div class="wala-switch {klass}" class:disabled>
	{#if label}
		<label class="sw-text" for={id}>
			<span class="sw-label">{label}</span>
			{#if meta}<span class="sw-meta">{meta}</span>{/if}
		</label>
	{/if}
	<button
		{id}
		type="button"
		role="switch"
		class="sw-track"
		aria-checked={checked}
		aria-label={label ? undefined : ariaLabel}
		{disabled}
		onclick={toggle}
	>
		<span class="sw-thumb"></span>
	</button>
</div>

<style>
	.wala-switch {
		display: flex;
		align-items: center;
		gap: 12px;
		font-family: var(--font-body);
	}
	.sw-text {
		display: flex;
		flex-direction: column;
		gap: 1px;
		margin-right: auto;
		cursor: pointer;
	}
	.wala-switch.disabled .sw-text {
		cursor: default;
	}
	.sw-label {
		font-weight: 700;
		font-size: var(--text-body);
		color: var(--color-text-strong);
	}
	.sw-meta {
		font-weight: 700;
		font-size: var(--text-tiny);
		color: var(--color-text-muted);
	}
	.sw-track {
		flex: none;
		position: relative;
		width: 48px;
		height: 28px;
		padding: 0;
		border: none;
		border-radius: var(--radius-pill);
		background: var(--color-sand-300);
		cursor: pointer;
		transition: background var(--dur-base) var(--ease-out);
	}
	.sw-track[aria-checked='true'] {
		background: var(--color-primary);
	}
	.sw-track:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}
	.sw-track:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.sw-thumb {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 22px;
		height: 22px;
		border-radius: var(--radius-pill);
		background: var(--color-white);
		box-shadow: var(--shadow-card);
		transition: transform var(--dur-base) var(--ease-spring);
	}
	.sw-track[aria-checked='true'] .sw-thumb {
		transform: translateX(20px);
	}

	@media (prefers-reduced-motion: reduce) {
		.sw-track,
		.sw-thumb {
			transition: none;
		}
	}
</style>
