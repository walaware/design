import type { ReactNode } from 'react';

/**
 * DateField — native, accessible date primitive.
 *
 * One component handles EITHER a single date OR a start–end range. Styled like
 * `TextField`. Bakes in the mobile fix every consumer otherwise rediscovers: a native
 * `<input type="date">` carries an intrinsic min-width that `min-width: 0` alone can't
 * override, so two side-by-side range fields overflow their card on mobile Chrome AND
 * Safari — the field forces `appearance: none` + `min-width: 0` + `width: 100%` so it
 * always shrinks to its container. No custom calendar popover: the OS-native picker is
 * used (best a11y, nothing to maintain).
 *
 * Contract is shared with the Svelte implementation in `@walaware/design`
 * (`src/lib/forms/DateField.svelte`) — public prop names + defaults are identical. The
 * Svelte side exposes `value`/`start`/`end` as `$bindable` two-way props; in React they
 * are controlled values paired with the `onValueChange`/`onStartChange`/`onEndChange`
 * callbacks below.
 */
export interface DateFieldProps
	extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'size' | 'min' | 'max'> {
	/** Field label. In range mode, an overall label above the two inputs. */
	label?: ReactNode;
	/** Helper / error line below the field. */
	hint?: ReactNode;
	/** Lower bound, "YYYY-MM-DD". */
	min?: string;
	/** Upper bound, "YYYY-MM-DD". */
	max?: string;
	/** Form size scale. @default 'md' */
	size?: 'sm' | 'md';
	disabled?: boolean;
	required?: boolean;
	name?: string;
	/** false = single date; true = start/end range. @default false */
	range?: boolean;

	// --- single mode ---
	/** Selected date, "YYYY-MM-DD". */
	value?: string;
	/** Fired with the new single date. */
	onValueChange?: (value: string) => void;

	// --- range mode ---
	/** Range start, "YYYY-MM-DD". */
	start?: string;
	/** Range end, "YYYY-MM-DD". */
	end?: string;
	/** Fired with the new range start. */
	onStartChange?: (start: string) => void;
	/** Fired with the new range end (empty string when cleared because Start moved past it). */
	onEndChange?: (end: string) => void;
	/** Start input label. @default 'From' */
	startLabel?: ReactNode;
	/** End input label. @default 'To' */
	endLabel?: ReactNode;
	/**
	 * Minimum gap in days. Sets End's effective `min` to `start + minNights` (native client
	 * guard) and flags the range invalid (`aria-invalid`) when the selected gap is shorter.
	 * @default 0
	 */
	minNights?: number;
	/** Override the start input's submit name. @default `${name}_start` */
	nameStart?: string;
	/** Override the end input's submit name. @default `${name}_end` */
	nameEnd?: string;
}

declare const DateField: React.FC<DateFieldProps>;
export default DateField;
