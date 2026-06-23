export const LEAN_LEVELS = {
	1: { dots: 1, color: 'var(--color-berry-500)', label: 'Long shot' },
	2: { dots: 2, color: 'var(--color-sun-500)', label: '50 / 50' },
	3: { dots: 3, color: 'var(--color-leaf-500)', label: 'Leaning yes' }
} as const;

/** How confident a "Maybe" really is: 1 = long shot, 3 = leaning yes. */
export type Lean = keyof typeof LEAN_LEVELS;
