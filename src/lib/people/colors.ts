/** The avatar accent ramp — assign round-robin so people keep a colour. */
export const AV_RAMP = [
	'var(--color-av-1)',
	'var(--color-av-2)',
	'var(--color-av-3)',
	'var(--color-av-4)',
	'var(--color-av-5)',
	'var(--color-av-6)',
	'var(--color-av-7)',
	'var(--color-av-8)'
];

/** Deterministic colour from a name, so a person keeps their colour. */
export function colorFor(name = '', override?: string | null): string {
	if (override) return override;
	let h = 0;
	for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
	return AV_RAMP[h % AV_RAMP.length];
}
