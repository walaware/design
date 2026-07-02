/** Visual role of a calendar event. */
export type CalendarTone =
	| 'owned' // yours — accent-tinted, interactive (links through)
	| 'teaser' // a friend's shared trip — muted, read-only, never a link
	| 'neutral'; // generic block — sand-tinted, interactive only if href/onClick

/** One event on the month grid. Dates are inclusive `YYYY-MM-DD`. */
export interface CalendarEvent {
	/** Stable id — used for keying + overflow bookkeeping. */
	id: string;
	title: string;
	/** First day, inclusive — `YYYY-MM-DD`. */
	start: string;
	/** Last day, inclusive — `YYYY-MM-DD`. Omit for a single-day event. */
	end?: string;
	/** Visual role (default `owned`). */
	tone?: CalendarTone;
	/** Leading glyph on the bar. */
	emoji?: string;
	/** Renders the bar as a link. Leave unset for read-only teasers. */
	href?: string;
	/** Click handler (used when there's no `href`). */
	onClick?: () => void;
}
