<script lang="ts" module>
	import type { Snippet } from 'svelte';

	/** Renderable bit — a plain string/number, or a Snippet for richer nodes. */
	type NodeLike = string | number | Snippet;

	/** One choice. A bare string is used as both the submitted value and the label. */
	export type SelectOption = string | { value: string; label: string; disabled?: boolean };

	/** Deterministic per-instance id seed (stable across SSR/CSR — components mount in order). */
	let uid = 0;
</script>

<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';

	// Omit the natives we repurpose: `value` narrows to string, `size` is our sm/md scale
	// (not the native visible-row count). `multiple` is out of scope — one record, one pick.
	interface Props extends Omit<HTMLSelectAttributes, 'value' | 'size' | 'multiple'> {
		/** Field label. */
		label?: NodeLike;
		/** Helper / error line below the field. */
		hint?: NodeLike;
		/** Choices, in order. A bare string is used as both value and label. */
		options?: SelectOption[];
		/** Leading emoji / glyph inside the field (mirrors TextField). */
		prefix?: string | null;
		/** Empty-value first option. Unselectable once `required`, so the browser's own
		    "please select an item" validation fires on an untouched field. **Defaults to
		    "Choose one…" whenever `required` is set** — without it the first real option is
		    silently preselected and that validation never fires, which is the exact case the
		    prop exists for. Pass `placeholder=""` to opt out deliberately. */
		placeholder?: string;
		/** Form size scale. */
		size?: 'sm' | 'md';
		disabled?: boolean;
		required?: boolean;
		name?: string;
		/** Selected value ($bindable). '' = nothing picked yet. */
		value?: string;
		/** Escape hatch — raw `<option>` / `<optgroup>` markup, rendered after `options`. */
		children?: Snippet;
	}

	let {
		label,
		hint,
		options = [],
		prefix = null,
		placeholder,
		size = 'md',
		disabled = false,
		required = false,
		name,
		value = $bindable(''),
		children,
		id,
		class: klass = '',
		...rest
	}: Props = $props();

	// Internal ids for label association. A consumer-supplied `id` seeds them (and lands on the
	// select); otherwise a stable per-instance fallback. Derived so they stay correct if `id`
	// ever changes.
	const autoId = `wala-sf-${++uid}`;
	const baseId = $derived((id as string | undefined) ?? autoId);
	const hintId = $derived(`${baseId}-hint`);

	const valueOf = (o: SelectOption) => (typeof o === 'string' ? o : o.value);
	const labelOf = (o: SelectOption) => (typeof o === 'string' ? o : o.label);
	const disabledOf = (o: SelectOption) => (typeof o === 'string' ? false : (o.disabled ?? false));

	/** A `required` field with no placeholder preselects its first real option, so the
	    browser never asks for a choice and a no-JS form submits whatever happened to be
	    first — bake the prompt in rather than let every consumer rediscover it.
	    `placeholder=""` is the deliberate opt-out (an empty string stays falsy below). */
	const prompt = $derived(placeholder ?? (required ? 'Choose one…' : undefined));

	/** Nothing picked yet — paint the field like a placeholder. */
	const empty = $derived(value === '' || value == null);
</script>

{#snippet node(v: NodeLike | undefined | null)}
	{#if typeof v === 'function'}{@render v()}{:else if v != null}{v}{/if}
{/snippet}

<!--
	Native, accessible single-choice picker — "which one of these records?" in a form.
	A real `<select>`, so it submits with `name=`, works with no JS, and gets the OS
	picker (and its a11y) for free. Chrome matches TextField/DateField exactly; only the
	native arrow is replaced (`appearance: none` + our own chevron) so the affordance
	looks the same in every engine. Like DateField, the field is `min-width: 0` /
	`width: 100%` so a long option label can never push it out of its card on mobile.
-->
<div class="wala-selectfield s-{size} {klass}">
	{#if label}<label class="label" for={baseId}>{@render node(label)}</label>{/if}
	<span class="field" class:is-disabled={disabled}>
		{#if prefix}<span class="prefix" aria-hidden="true">{prefix}</span>{/if}
		<select
			bind:value
			id={baseId}
			{name}
			{disabled}
			{required}
			class:empty
			aria-describedby={hint ? hintId : undefined}
			{...rest}
		>
			{#if prompt}
				<option value="" disabled={required}>{prompt}</option>
			{/if}
			{#each options as opt (valueOf(opt))}
				<option value={valueOf(opt)} disabled={disabledOf(opt)}>{labelOf(opt)}</option>
			{/each}
			{@render children?.()}
		</select>
		<svg
			class="chev"
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="m6 9 6 6 6-6" />
		</svg>
	</span>
	{#if hint}<span class="hint" id={hintId}>{@render node(hint)}</span>{/if}
</div>

<style>
	.wala-selectfield {
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

	/* ---- Field shell — mirrors TextField / DateField (radius, border, focus ring). ---- */
	.field {
		position: relative;
		display: flex;
		align-items: center;
		gap: 9px;
		background: var(--color-white);
		border: 2px solid var(--color-sand-300);
		border-radius: var(--radius-md);
		padding: 0 12px 0 14px;
		transition:
			border-color var(--dur-base),
			box-shadow var(--dur-base);
	}
	.field:focus-within {
		border-color: var(--color-focus-ring);
		box-shadow: 0 0 0 4px var(--color-primary-soft);
	}
	.field.is-disabled {
		background: var(--color-surface-sunk);
	}

	.prefix {
		flex: none;
		font-size: 18px;
	}

	select {
		/* Same shrink-safety as DateField: a long option label must never widen the field
		   past its card on a phone. */
		appearance: none;
		-webkit-appearance: none;
		min-width: 0;
		width: 100%;
		flex: 1;
		border: none;
		outline: none;
		background: transparent;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 16px;
		color: var(--color-text-strong);
		padding: 13px 0;
		cursor: pointer;
		/* Leave room for the chevron so a long label ellipsises instead of running under it. */
		padding-right: 4px;
		text-overflow: ellipsis;
	}
	/* Nothing picked yet — read as a prompt, not as a value. */
	select.empty {
		color: var(--color-text-muted);
		font-weight: 600;
	}
	select:disabled {
		color: var(--color-text-muted);
		cursor: not-allowed;
	}
	/* Don't let an untouched required field paint the browser's red invalid outline. */
	select:invalid {
		box-shadow: none;
	}
	/* The popup list is OS-drawn; give it our ink so it doesn't inherit the muted
	   placeholder colour on engines that cascade into it. */
	select option {
		color: var(--color-text-strong);
		font-weight: 600;
	}

	.chev {
		flex: none;
		color: var(--color-text-muted);
		pointer-events: none;
	}

	/* ---- Size scale ---- */
	.s-sm select {
		font-size: 14px;
		padding: 9px 4px 9px 0;
	}
	.s-sm .field {
		padding: 0 10px 0 11px;
	}
	.s-sm .prefix {
		font-size: 15px;
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
