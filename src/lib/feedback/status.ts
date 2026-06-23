export const STATUS_MAP = {
	going: { cls: 'going', label: 'Going', emoji: '🔥' },
	maybe: { cls: 'maybe', label: 'Maybe', emoji: '🤔' },
	out: { cls: 'out', label: 'Out', emoji: '' },
	set: { cls: 'going', label: 'Set', emoji: '✓' },
	open: { cls: 'open', label: 'Open', emoji: '' }
} as const;

/** RSVP / claim state. */
export type Status = keyof typeof STATUS_MAP;
