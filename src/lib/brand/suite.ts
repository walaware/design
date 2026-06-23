/**
 * The walaware app suite registry + the sanctioned Lucide glyph set.
 * The accent is each app's identity colour (its squircle + in-app chrome);
 * the coral "wala" thread stays constant everywhere regardless.
 */

/* Lucide line glyphs (24×24 grid, 2px rounded stroke) — inner SVG markup
   only; AppIcon supplies the <svg> wrapper. Lucide is the sanctioned set;
   never hand-draw decorative SVG. */
export const WALA_GLYPHS: Record<string, string> = {
	compass:
		'<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/>',
	'heart-pulse':
		'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>',
	package:
		'<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>',
	wallet:
		'<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>',
	'shopping-bag':
		'<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
	'square-check-big':
		'<path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"/><path d="m9 11 3 3L22 4"/>',
	'users-round':
		'<path d="M18 21a8 8 0 0 0-16 0"/><circle cx="10" cy="8" r="5"/><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>'
};

export interface WalaSuiteEntry {
	/** Lucide glyph name (key into WALA_GLYPHS). */
	glyph: string;
	/** The app's identity accent colour. */
	accent: string;
	/** Human label / purpose. */
	label: string;
}

export const WALA_SUITE = {
	tripwala: { glyph: 'compass', accent: '#FF7A59', label: 'Journeys & trips' },
	healthwala: { glyph: 'heart-pulse', accent: '#F59E14', label: 'Health & meals' },
	stuffwala: { glyph: 'package', accent: '#2FB6A3', label: 'Personal inventory' },
	moneywala: { glyph: 'wallet', accent: '#3FA66A', label: 'Money & expenses' },
	shopwala: { glyph: 'shopping-bag', accent: '#E84F7C', label: 'Buying & selling' },
	taskwala: { glyph: 'square-check-big', accent: '#4F9ED1', label: 'Plans & tasks' },
	folkwala: { glyph: 'users-round', accent: '#B57EDC', label: 'People & relationships' }
} satisfies Record<string, WalaSuiteEntry>;

export type WalaApp = keyof typeof WALA_SUITE;
