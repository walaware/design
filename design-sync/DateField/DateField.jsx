import React, { useId, useMemo, useRef, useEffect } from 'react';

/**
 * DateField — native date / range primitive (reference implementation).
 *
 * Single date OR a start–end range in one component, styled like TextField. The critical,
 * non-negotiable bit is the input CSS: `appearance: none` + `min-width: 0` + `width: 100%`,
 * which is what lets two range fields sit two-up inside a card on mobile without overflow.
 * Pseudo-element + shrink rules can't live in an inline style object, so they're emitted
 * once via a module <style> tag; everything else is inline to match the design-system
 * reference style.
 *
 * See DateField.d.ts for the prop contract (shared with the Svelte implementation).
 */

const isDate = (s) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
const toUTC = (iso) => {
	const [y, m, d] = iso.split('-').map(Number);
	return Date.UTC(y, m - 1, d);
};
const addDays = (iso, days) => new Date(toUTC(iso) + days * 86400000).toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((toUTC(b) - toUTC(a)) / 86400000);

// One-time stylesheet for the rules inline styles can't express (the overflow fix lives here).
const STYLE_ID = 'wala-datefield-styles';
const CSS = `
.wala-datefield input {
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
  color: var(--text-strong);
  padding: 13px 0;
}
.wala-datefield.s-sm input { font-size: 14px; padding: 9px 0; }
.wala-datefield input:disabled { color: var(--text-muted); cursor: not-allowed; }
.wala-datefield input:invalid { box-shadow: none; }
.wala-datefield input::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.5; transition: opacity 200ms; }
.wala-datefield input::-webkit-calendar-picker-indicator:hover { opacity: 0.85; }
.wala-datefield input::-webkit-inner-spin-button,
.wala-datefield input::-webkit-clear-button { display: none; }
.wala-datefield .wala-df-field:focus-within { border-color: var(--coral-400); box-shadow: 0 0 0 4px var(--coral-200); }
.wala-datefield .cal-btn { flex: none; display: grid; place-items: center; margin-left: 6px; padding: 0; width: 22px; height: 22px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; }
@supports selector(::-webkit-calendar-picker-indicator) { .wala-datefield .cal-btn { display: none; } }
`;

function useStyles() {
	useEffect(() => {
		if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
		const el = document.createElement('style');
		el.id = STYLE_ID;
		el.textContent = CSS;
		document.head.appendChild(el);
	}, []);
}

const fieldStyle = {
	position: 'relative',
	display: 'flex',
	alignItems: 'center',
	background: 'var(--white, #fff)',
	border: '2px solid var(--sand-300)',
	borderRadius: 'var(--radius-md)',
	padding: '0 12px',
	transition: 'border-color 200ms, box-shadow 200ms'
};
const labelStyle = {
	display: 'block',
	fontFamily: 'var(--font-display)',
	fontWeight: 600,
	fontSize: 14,
	color: 'var(--text-strong)',
	marginBottom: 7
};
const subLabelStyle = {
	display: 'block',
	fontFamily: 'var(--font-body)',
	fontWeight: 700,
	fontSize: 12.5,
	color: 'var(--text-muted)',
	marginBottom: 5
};
const hintStyle = (error) => ({
	display: 'block',
	fontFamily: 'var(--font-body)',
	fontWeight: 600,
	fontSize: 12.5,
	color: error ? 'var(--primary-press)' : 'var(--text-muted)',
	marginTop: 6
});

const CalIcon = () => (
	<svg
		width="18"
		height="18"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<rect width="18" height="18" x="3" y="4" rx="2" />
		<path d="M3 10h18" />
		<path d="M8 2v4" />
		<path d="M16 2v4" />
	</svg>
);

export default function DateField({
	label,
	hint,
	min,
	max,
	size = 'md',
	disabled = false,
	required = false,
	name,
	range = false,
	value = '',
	onValueChange,
	start = '',
	end = '',
	onStartChange,
	onEndChange,
	startLabel = 'From',
	endLabel = 'To',
	minNights = 0,
	nameStart,
	nameEnd,
	id,
	className = '',
	...rest
}) {
	useStyles();
	const auto = useId();
	const base = id ?? `wala-df-${auto}`;
	const startRef = useRef(null);
	const endRef = useRef(null);
	const singleRef = useRef(null);

	const endMin = useMemo(() => {
		if (range && isDate(start)) {
			const floor = addDays(start, Math.max(0, minNights));
			return min && min > floor ? min : floor;
		}
		return min;
	}, [range, start, minNights, min]);

	const nights = range && isDate(start) && isDate(end) ? daysBetween(start, end) : null;
	const invalid = range && nights != null && (nights < 0 || (minNights > 0 && nights < minNights));

	// Never keep a backwards range: if Start moves past End, clear End.
	useEffect(() => {
		if (range && isDate(start) && isDate(end) && end < start) onEndChange?.('');
	}, [range, start, end, onEndChange]);

	const openPicker = (ref) => {
		const el = ref.current;
		if (!el) return;
		try {
			el.showPicker();
		} catch {
			el.focus();
		}
	};

	const startName = nameStart ?? (name ? `${name}_start` : undefined);
	const endName = nameEnd ?? (name ? `${name}_end` : undefined);
	const hintId = `${base}-hint`;

	const calButton = (ref) => (
		<button
			type="button"
			className="cal-btn"
			tabIndex={-1}
			aria-hidden="true"
			disabled={disabled}
			onClick={() => openPicker(ref)}
		>
			<CalIcon />
		</button>
	);

	return (
		<div className={`wala-datefield s-${size} ${className}`.trim()}>
			{range ? (
				<>
					{label && (
						<span style={labelStyle} id={`${base}-group`}>
							{label}
						</span>
					)}
					<div
						role="group"
						aria-labelledby={label ? `${base}-group` : undefined}
						aria-describedby={hint ? hintId : undefined}
						style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}
					>
						<div style={{ flex: 1, minWidth: 0 }}>
							<label style={subLabelStyle} htmlFor={`${base}-start`}>
								{startLabel}
							</label>
							<span className="wala-df-field" style={fieldStyle}>
								<input
									ref={startRef}
									id={`${base}-start`}
									type="date"
									name={startName}
									value={start}
									min={min}
									max={max}
									disabled={disabled}
									required={required}
									onChange={(e) => onStartChange?.(e.target.value)}
									{...rest}
								/>
								{calButton(startRef)}
							</span>
						</div>
						<div style={{ flex: 1, minWidth: 0 }}>
							<label style={subLabelStyle} htmlFor={`${base}-end`}>
								{endLabel}
							</label>
							<span className="wala-df-field" style={fieldStyle}>
								<input
									ref={endRef}
									id={`${base}-end`}
									type="date"
									name={endName}
									value={end}
									min={endMin}
									max={max}
									disabled={disabled}
									required={required}
									aria-invalid={invalid || undefined}
									aria-describedby={hint ? hintId : undefined}
									onChange={(e) => onEndChange?.(e.target.value)}
									{...rest}
								/>
								{calButton(endRef)}
							</span>
						</div>
					</div>
				</>
			) : (
				<>
					{label && (
						<label style={labelStyle} htmlFor={`${base}-input`}>
							{label}
						</label>
					)}
					<span className="wala-df-field" style={fieldStyle}>
						<input
							ref={singleRef}
							id={`${base}-input`}
							type="date"
							name={name}
							value={value}
							min={min}
							max={max}
							disabled={disabled}
							required={required}
							aria-describedby={hint ? hintId : undefined}
							onChange={(e) => onValueChange?.(e.target.value)}
							{...rest}
						/>
						{calButton(singleRef)}
					</span>
				</>
			)}
			{hint && (
				<span style={hintStyle(invalid)} id={hintId}>
					{hint}
				</span>
			)}
		</div>
	);
}
