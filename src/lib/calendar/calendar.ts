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

/** How a committed range is drawn on a `RangeCalendar` grid. */
export type RangeTone =
	| 'candidate' // a proposal — an accent bar in a lane under the day numbers
	| 'outline' // your own availability — a stroked band, no fill
	| 'muted'; // context — a soft filled band

/** A committed span drawn under the selection layer. Dates inclusive. */
export interface DateRange {
	id: string;
	/** First day, inclusive — `YYYY-MM-DD`. */
	start: string;
	/** Last day, inclusive — `YYYY-MM-DD`. Omit for a single day. */
	end?: string;
	/** Drawing channel (default `candidate`). */
	tone?: RangeTone;
	/** Bar text (`candidate` only) and accessible description. */
	label?: string;
	/** Leading glyph on a `candidate` bar. */
	emoji?: string;
	/** Click handler — makes a `candidate` bar interactive (e.g. to vote). */
	onClick?: () => void;
}

export const MONTH_NAMES = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December'
];

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAY_LONG = [
	'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

/* ── date arithmetic on `YYYY-MM-DD` strings ──────────────────────────────
   Everything is local-midnight based: ISO strings sort lexicographically,
   which is why comparisons below use `<` / `>` directly on the strings. */

export function toIso(dt: Date): string {
	const y = dt.getFullYear();
	const m = String(dt.getMonth() + 1).padStart(2, '0');
	const d = String(dt.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function fromIso(iso: string): Date {
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(y, m - 1, d);
}

/** Whole days from `a` to `b` (negative when `b` precedes `a`). */
export function dayDiff(a: string, b: string): number {
	return Math.round((fromIso(b).getTime() - fromIso(a).getTime()) / 86400000);
}

/** Shift an ISO date by `n` days, crossing month/year boundaries correctly. */
export function addDays(iso: string, n: number): string {
	const dt = fromIso(iso);
	return toIso(new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n));
}

export function clampNum(n: number, lo: number, hi: number): number {
	return Math.min(hi, Math.max(lo, n));
}

/** Nights between two inclusive endpoints — a 3rd→5th stay is 2 nights. */
export function nightsBetween(start: string, end: string): number {
	return Math.max(0, dayDiff(start, end));
}

/** "Wednesday, July 8, 2026" — for cell accessible names. */
export function formatLongDate(iso: string): string {
	const dt = fromIso(iso);
	return `${WEEKDAY_LONG[dt.getDay()]}, ${MONTH_NAMES[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`;
}

/** "Jul 8" — for range announcements. */
export function formatShortDate(iso: string): string {
	const dt = fromIso(iso);
	return `${MONTH_NAMES[dt.getMonth()].slice(0, 3)} ${dt.getDate()}`;
}

/** Month ordinal, for bounds arithmetic across year boundaries. */
export function monthIndex(year: number, month: number): number {
	return year * 12 + (month - 1);
}

export function fromMonthIndex(idx: number): { year: number; month: number } {
	return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

/* ── grid construction ───────────────────────────────────────────────── */

export interface DayCell {
	date: string;
	day: number;
	inMonth: boolean;
	isToday: boolean;
}

/** Whole weeks covering `month`, padded with adjacent-month days. */
export function buildWeeks(
	year: number,
	month: number,
	weekStartsOn: 0 | 1,
	todayIso: string
): DayCell[][] {
	const first = new Date(year, month - 1, 1);
	const lead = (first.getDay() - weekStartsOn + 7) % 7;
	const daysInMonth = new Date(year, month, 0).getDate();
	const totalCells = Math.ceil((lead + daysInMonth) / 7) * 7;
	const start = new Date(year, month - 1, 1 - lead);
	const out: DayCell[][] = [];
	for (let w = 0; w < totalCells / 7; w++) {
		const row: DayCell[] = [];
		for (let d = 0; d < 7; d++) {
			const dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d);
			const iso = toIso(dt);
			row.push({
				date: iso,
				day: dt.getDate(),
				inMonth: dt.getMonth() === month - 1,
				isToday: iso === todayIso
			});
		}
		out.push(row);
	}
	return out;
}

export function weekdayLabels(weekStartsOn: 0 | 1): string[] {
	return Array.from({ length: 7 }, (_, i) => WEEKDAY_SHORT[(i + weekStartsOn) % 7]);
}

/* ── span → week segment, and lane packing ───────────────────────────── */

/** Anything with an inclusive start and an optional inclusive end. */
export interface DaySpan {
	start: string;
	end?: string;
}

/** Where a span sits within one week, in 1-based grid columns. */
export interface WeekSegment {
	/** 1-based grid column start. */
	colStart: number;
	/** Exclusive grid-column end. */
	colEnd: number;
	/** The span began before this week. */
	continuesLeft: boolean;
	/** The span continues past this week. */
	continuesRight: boolean;
}

/** Clip a span to one week, or `null` when they don't overlap. */
export function weekSegment(
	weekStart: string,
	weekEnd: string,
	span: DaySpan
): WeekSegment | null {
	const spanEnd = span.end ?? span.start;
	if (span.start > weekEnd || spanEnd < weekStart) return null;
	const segStart = span.start < weekStart ? weekStart : span.start;
	const segEnd = spanEnd > weekEnd ? weekEnd : spanEnd;
	const c0 = clampNum(dayDiff(weekStart, segStart), 0, 6);
	const c1 = clampNum(dayDiff(weekStart, segEnd), 0, 6);
	return {
		colStart: c0 + 1,
		colEnd: c1 + 2,
		continuesLeft: span.start < weekStart,
		continuesRight: spanEnd > weekEnd
	};
}

export interface PackedBar<T> extends WeekSegment {
	item: T;
	/** 0-based lane index within the week. */
	lane: number;
}

/** Longest spans first, then by start — keeps multi-day trips on low lanes. */
export function sortSpans<T extends DaySpan>(items: T[]): T[] {
	return [...items].sort((a, b) => {
		const la = dayDiff(a.start, a.end ?? a.start);
		const lb = dayDiff(b.start, b.end ?? b.start);
		return lb - la || a.start.localeCompare(b.start);
	});
}

/**
 * Interval partitioning: assign each overlapping span the lowest free lane.
 * `items` should already be sorted with `sortSpans`.
 */
export function packLanes<T extends DaySpan>(
	weekStart: string,
	weekEnd: string,
	items: T[]
): { bars: PackedBar<T>[]; laneCount: number } {
	const laneEnds: number[] = []; // last occupied column index per lane
	const bars: PackedBar<T>[] = [];
	for (const item of items) {
		const seg = weekSegment(weekStart, weekEnd, item);
		if (!seg) continue;
		const c0 = seg.colStart - 1;
		const c1 = seg.colEnd - 2;
		let lane = laneEnds.findIndex((end) => end < c0);
		if (lane === -1) {
			lane = laneEnds.length;
			laneEnds.push(c1);
		} else {
			laneEnds[lane] = c1;
		}
		bars.push({ ...seg, item, lane });
	}
	return { bars, laneCount: laneEnds.length };
}
