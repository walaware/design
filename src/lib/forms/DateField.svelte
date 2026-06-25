<script lang="ts" module>
	import type { Snippet } from 'svelte';

	/** Renderable bit — a plain string/number, or a Snippet for richer nodes. */
	type NodeLike = string | number | Snippet;

	/** Deterministic per-instance id seed (stable across SSR/CSR — components mount in order). */
	let uid = 0;
</script>

<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	// Omit the natives we repurpose: `value`/`size` change type, `min`/`max` narrow to ISO strings.
	interface Props extends Omit<HTMLInputAttributes, 'value' | 'size' | 'min' | 'max'> {
		/** Field label. In range mode, an overall label above the two inputs. */
		label?: NodeLike;
		/** Helper / error line below the field. */
		hint?: NodeLike;
		/** Lower bound, "YYYY-MM-DD". */
		min?: string;
		/** Upper bound, "YYYY-MM-DD". */
		max?: string;
		/** Form size scale. */
		size?: 'sm' | 'md';
		disabled?: boolean;
		required?: boolean;
		name?: string;
		/** false (default) = single date; true = start/end range. */
		range?: boolean;

		// --- single mode ---
		/** Selected date, "YYYY-MM-DD" ($bindable). */
		value?: string;

		// --- range mode ---
		/** Range start, "YYYY-MM-DD" ($bindable). */
		start?: string;
		/** Range end, "YYYY-MM-DD" ($bindable). */
		end?: string;
		/** Start input label. */
		startLabel?: NodeLike;
		/** End input label. */
		endLabel?: NodeLike;
		/** Minimum gap in days: sets End's effective `min` to `start + minNights` and flags the
		    range invalid when shorter. 0 = no minimum. */
		minNights?: number;
		/** Override the start input's submit name (default `${name}_start`). */
		nameStart?: string;
		/** Override the end input's submit name (default `${name}_end`). */
		nameEnd?: string;
	}

	let {
		label,
		hint,
		min,
		max,
		size = 'md',
		disabled = false,
		required = false,
		name,
		range = false,
		value = $bindable(''),
		start = $bindable(''),
		end = $bindable(''),
		startLabel = 'From',
		endLabel = 'To',
		minNights = 0,
		nameStart,
		nameEnd,
		id,
		class: klass = '',
		...rest
	}: Props = $props();

	// Internal ids for label association. A consumer-supplied `id` seeds them (and lands on the
	// single input); otherwise a stable per-instance fallback. Derived so they stay correct if
	// `id` ever changes.
	const autoId = `wala-df-${++uid}`;
	const baseId = $derived((id as string | undefined) ?? autoId);
	const singleId = $derived(baseId);
	const startId = $derived(`${baseId}-start`);
	const endId = $derived(`${baseId}-end`);
	const groupId = $derived(`${baseId}-group`);
	const hintId = $derived(`${baseId}-hint`);

	/* ---- ISO date helpers (UTC so DST never shifts a day) ---- */
	const isDate = (s: string | undefined): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
	const toUTC = (iso: string) => {
		const [y, m, d] = iso.split('-').map(Number);
		return Date.UTC(y, m - 1, d);
	};
	const addDays = (iso: string, days: number) =>
		new Date(toUTC(iso) + days * 86400000).toISOString().slice(0, 10);
	const daysBetween = (a: string, b: string) => Math.round((toUTC(b) - toUTC(a)) / 86400000);

	/** End's effective lower bound: tracks Start (+ minNights), never below the field `min`.
	    Falls back to `min` when Start is empty. */
	const endMin = $derived.by(() => {
		if (range && isDate(start)) {
			const floor = addDays(start, Math.max(0, minNights));
			return min && min > floor ? min : floor;
		}
		return min;
	});

	/** Nights currently selected, or null when the range isn't fully set. */
	const nights = $derived(range && isDate(start) && isDate(end) ? daysBetween(start, end) : null);
	/** Range is invalid: End before Start, or shorter than the required minimum. */
	const invalid = $derived(
		range && nights != null && (nights < 0 || (minNights > 0 && nights < minNights))
	);

	/** Keep the range never-backwards: if Start moves past End, clear End (it re-picks against
	    the live `endMin`). minNights shortfalls are surfaced via `invalid`, not cleared. */
	$effect(() => {
		if (range && isDate(start) && isDate(end) && end < start) end = '';
	});

	let singleEl = $state<HTMLInputElement>();
	let startEl = $state<HTMLInputElement>();
	let endEl = $state<HTMLInputElement>();

	/** Open the OS-native picker from the calendar affordance (fallback browsers without an
	    inline `::-webkit-calendar-picker-indicator`). Focus if `showPicker` is unavailable. */
	const openPicker = (el: HTMLInputElement | undefined) => {
		if (!el) return;
		try {
			el.showPicker();
		} catch {
			el.focus();
		}
	};

	const startName = $derived(nameStart ?? (name ? `${name}_start` : undefined));
	const endName = $derived(nameEnd ?? (name ? `${name}_end` : undefined));
</script>

{#snippet node(value: NodeLike | undefined | null)}
	{#if typeof value === 'function'}{@render value()}{:else if value != null}{value}{/if}
{/snippet}

{#snippet calButton(el: HTMLInputElement | undefined)}
	<!-- Mouse affordance only (the input itself is the labelled, keyboard-operable control), so
	     it's aria-hidden + removed from the tab order. Hidden on engines that keep a native
	     calendar-picker indicator (see :global rule below). -->
	<button
		type="button"
		class="cal-btn"
		tabindex="-1"
		aria-hidden="true"
		{disabled}
		onclick={() => openPicker(el)}
	>
		<svg
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
			<rect width="18" height="18" x="3" y="4" rx="2" />
			<path d="M3 10h18" />
			<path d="M8 2v4" />
			<path d="M16 2v4" />
		</svg>
	</button>
{/snippet}

<!--
	Native, accessible date primitive — single date OR a start–end range. Styled like
	TextField. Bakes in the mobile fix every consumer otherwise rediscovers: native
	`<input type="date">` has an intrinsic min-width that `min-width: 0` alone won't beat,
	so two range fields spill out of their card on phones — `appearance: none` +
	`min-width: 0` + `width: 100%` makes the field shrink to its container everywhere.
-->
<div class="wala-datefield s-{size} {klass}" class:range>
	{#if range}
		{#if label}<span class="label" id={groupId}>{@render node(label)}</span>{/if}
		<div
			class="range-row"
			role="group"
			aria-labelledby={label ? groupId : undefined}
			aria-describedby={hint ? hintId : undefined}
		>
			<div class="leg">
				<label class="sub-label" for={startId}>{@render node(startLabel)}</label>
				<span class="field">
					<input
						bind:this={startEl}
						bind:value={start}
						id={startId}
						type="date"
						name={startName}
						{min}
						{max}
						{disabled}
						{required}
						{...rest}
					/>
					{@render calButton(startEl)}
				</span>
			</div>
			<div class="leg">
				<label class="sub-label" for={endId}>{@render node(endLabel)}</label>
				<span class="field">
					<input
						bind:this={endEl}
						bind:value={end}
						id={endId}
						type="date"
						name={endName}
						min={endMin}
						{max}
						{disabled}
						{required}
						aria-invalid={invalid || undefined}
						aria-describedby={hint ? hintId : undefined}
						{...rest}
					/>
					{@render calButton(endEl)}
				</span>
			</div>
		</div>
	{:else}
		{#if label}<label class="label" for={singleId}>{@render node(label)}</label>{/if}
		<span class="field">
			<input
				bind:this={singleEl}
				bind:value
				id={singleId}
				type="date"
				{name}
				{min}
				{max}
				{disabled}
				{required}
				aria-describedby={hint ? hintId : undefined}
				{...rest}
			/>
			{@render calButton(singleEl)}
		</span>
	{/if}
	{#if hint}<span class="hint" class:error={invalid} id={hintId}>{@render node(hint)}</span>{/if}
</div>

<style>
	.wala-datefield {
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

	/* ---- Range: two equal, shrink-safe columns. Two-up down to 360px without overflow. ---- */
	.range-row {
		display: flex;
		gap: 10px;
		align-items: flex-start;
	}
	.leg {
		flex: 1;
		min-width: 0;
	}
	.sub-label {
		display: block;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 12.5px;
		color: var(--color-text-muted);
		margin-bottom: 5px;
	}

	/* ---- Field shell — mirrors TextField (radius, border, focus ring). ---- */
	.field {
		position: relative;
		display: flex;
		align-items: center;
		background: var(--color-white);
		border: 2px solid var(--color-sand-300);
		border-radius: var(--radius-md);
		padding: 0 12px;
		transition:
			border-color var(--dur-base),
			box-shadow var(--dur-base);
	}
	.field:focus-within {
		border-color: var(--color-coral-400);
		box-shadow: 0 0 0 4px var(--color-coral-200);
	}

	/* ---- The input — the overflow fix lives here. ---- */
	input {
		/* `appearance: none` + `min-width: 0` + `width: 100%` is REQUIRED: native date inputs
		   carry an intrinsic min-width that `min-width: 0` alone can't override, so side-by-side
		   range fields overflow their container on mobile Chrome AND Safari. */
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
	}
	input:disabled {
		color: var(--color-text-muted);
		cursor: not-allowed;
	}
	/* Don't let an empty/half-typed value paint the browser's red invalid outline. */
	input:invalid {
		box-shadow: none;
	}

	/* Chromium/WebKit keep the calendar-picker indicator under `appearance: none` — style it
	   as the affordance and hide our fallback glyph (see @supports below). */
	input::-webkit-calendar-picker-indicator {
		cursor: pointer;
		opacity: 0.5;
		transition: opacity var(--dur-base);
	}
	input::-webkit-calendar-picker-indicator:hover {
		opacity: 0.85;
	}
	/* Strip the legacy WebKit spinner/clear so only the indicator shows. */
	input::-webkit-inner-spin-button,
	input::-webkit-clear-button {
		display: none;
	}

	/* Fallback calendar affordance for engines that drop the native indicator (e.g. Firefox);
	   hidden where the native indicator exists so we never double up. */
	.cal-btn {
		flex: none;
		display: grid;
		place-items: center;
		margin-left: 6px;
		padding: 0;
		width: 22px;
		height: 22px;
		border: none;
		background: transparent;
		color: var(--color-text-muted);
		cursor: pointer;
	}
	.cal-btn:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}
	@supports selector(::-webkit-calendar-picker-indicator) {
		.cal-btn {
			display: none;
		}
	}

	/* ---- Size scale ---- */
	.s-sm input {
		font-size: 14px;
		padding: 9px 0;
	}
	.s-sm .field {
		padding: 0 11px;
	}

	.hint {
		display: block;
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 12.5px;
		color: var(--color-text-muted);
		margin-top: 6px;
	}
	.hint.error {
		color: var(--color-primary-press);
	}
</style>
