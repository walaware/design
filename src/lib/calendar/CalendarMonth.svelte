<script lang="ts" module>
	export type { CalendarEvent, CalendarTone } from './calendar.js';
</script>

<script lang="ts">
	import IconButton from '../core/IconButton.svelte';
	import type { CalendarEvent } from './calendar.js';

	interface Props {
		/** Displayed year (e.g. 2026). */
		year: number;
		/** Displayed month, 1–12 (not 0-based). */
		month: number;
		events?: CalendarEvent[];
		/** First column of the week — 0 Sunday (default) or 1 Monday. */
		weekStartsOn?: 0 | 1;
		/** Show leading/trailing days from neighbouring months, dimmed. */
		showAdjacent?: boolean;
		/** Event bars per day before collapsing the rest into "+N more". */
		maxPerDay?: number;
		/** Highlighted "today" as `YYYY-MM-DD`. Omit to derive from the clock. */
		today?: string;
		/** Header title override (default e.g. "July 2026"). */
		title?: string;
		/** Show the built-in header (title + prev/next). */
		header?: boolean;
		/** Previous-month handler (header chevron). */
		onPrev?: () => void;
		/** Next-month handler (header chevron). */
		onNext?: () => void;
		/** A day cell was tapped — `YYYY-MM-DD`. */
		onSelectDay?: (date: string) => void;
		/** A day's "+N more" was tapped — `YYYY-MM-DD`. */
		onOverflow?: (date: string) => void;
	}

	let {
		year,
		month,
		events = [],
		weekStartsOn = 0,
		showAdjacent = true,
		maxPerDay = 3,
		today,
		title,
		header = true,
		onPrev,
		onNext,
		onSelectDay,
		onOverflow
	}: Props = $props();

	const MONTHS = [
		'January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December'
	];
	const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	function toIso(dt: Date): string {
		const y = dt.getFullYear();
		const m = String(dt.getMonth() + 1).padStart(2, '0');
		const d = String(dt.getDate()).padStart(2, '0');
		return `${y}-${m}-${d}`;
	}
	function fromIso(iso: string): Date {
		const [y, m, d] = iso.split('-').map(Number);
		return new Date(y, m - 1, d);
	}
	function dayDiff(a: string, b: string): number {
		return Math.round((fromIso(b).getTime() - fromIso(a).getTime()) / 86400000);
	}
	function clamp(n: number, lo: number, hi: number): number {
		return Math.min(hi, Math.max(lo, n));
	}

	const heading = $derived(title ?? `${MONTHS[month - 1]} ${year}`);
	const weekdayLabels = $derived(
		Array.from({ length: 7 }, (_, i) => WEEKDAYS[(i + weekStartsOn) % 7])
	);
	const todayIso = $derived(today ?? toIso(new Date()));

	// The grid: whole weeks covering the month, padded with adjacent-month days.
	const weeks = $derived.by(() => {
		const first = new Date(year, month - 1, 1);
		const lead = (first.getDay() - weekStartsOn + 7) % 7;
		const daysInMonth = new Date(year, month, 0).getDate();
		const totalCells = Math.ceil((lead + daysInMonth) / 7) * 7;
		const start = new Date(year, month - 1, 1 - lead);
		const out: { date: string; day: number; inMonth: boolean; isToday: boolean }[][] = [];
		for (let w = 0; w < totalCells / 7; w++) {
			const row = [];
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
	});

	interface Bar {
		event: CalendarEvent;
		colStart: number; // 1-based grid column
		colEnd: number; // exclusive (grid-column end)
		lane: number;
		continuesLeft: boolean;
		continuesRight: boolean;
	}

	// Per-week: pack intersecting events into non-overlapping lanes, then split
	// into visible bars (lanes < maxPerDay) and per-day overflow counts.
	const layout = $derived.by(() => {
		// Longer spans first, then by start — keeps multi-day trips on low lanes.
		const sorted = [...events].sort((a, b) => {
			const la = dayDiff(a.start, a.end ?? a.start);
			const lb = dayDiff(b.start, b.end ?? b.start);
			return lb - la || a.start.localeCompare(b.start);
		});
		return weeks.map((week) => {
			const weekStart = week[0].date;
			const weekEnd = week[6].date;
			const laneEnds: number[] = []; // last occupied col index per lane
			const bars: Bar[] = [];
			for (const ev of sorted) {
				const evEnd = ev.end ?? ev.start;
				if (ev.start > weekEnd || evEnd < weekStart) continue; // no overlap this week
				const segStart = ev.start < weekStart ? weekStart : ev.start;
				const segEnd = evEnd > weekEnd ? weekEnd : evEnd;
				const c0 = clamp(dayDiff(weekStart, segStart), 0, 6);
				const c1 = clamp(dayDiff(weekStart, segEnd), 0, 6);
				let lane = laneEnds.findIndex((end) => end < c0);
				if (lane === -1) {
					lane = laneEnds.length;
					laneEnds.push(c1);
				} else {
					laneEnds[lane] = c1;
				}
				bars.push({
					event: ev,
					colStart: c0 + 1,
					colEnd: c1 + 2,
					lane,
					continuesLeft: ev.start < weekStart,
					continuesRight: evEnd > weekEnd
				});
			}
			const visible = bars.filter((b) => b.lane < maxPerDay);
			const laneCount = Math.min(laneEnds.length, maxPerDay);
			// Overflow per day: count hidden bars covering each column.
			const overflow = Array.from({ length: 7 }, (_, col) =>
				bars.filter((b) => b.lane >= maxPerDay && b.colStart - 1 <= col && b.colEnd - 2 >= col)
					.length
			);
			return { week, visible, laneCount, overflow };
		});
	});

	function barTag(ev: CalendarEvent): 'a' | 'button' | 'span' {
		if (ev.href) return 'a';
		if (ev.onClick) return 'button';
		return 'span';
	}
</script>

<!--
	Month grid with multi-day event spans. Events carry a `tone`: `owned` trips are
	accent-tinted and interactive (link through); `teaser` events (a friend's shared
	trip) are muted and read-only — never a link. Mobile-first; drop it into an
	AppShell content column or a Card.
-->
<div class="wala-calendarmonth">
	{#if header}
		<div class="cal-head">
			<IconButton tone="soft" size={34} aria-label="Previous month" onclick={() => onPrev?.()}>‹</IconButton>
			<div class="cal-title">{heading}</div>
			<IconButton tone="soft" size={34} aria-label="Next month" onclick={() => onNext?.()}>›</IconButton>
		</div>
	{/if}

	<div class="cal-weekdays" role="row">
		{#each weekdayLabels as w (w)}<div class="wd" role="columnheader">{w}</div>{/each}
	</div>

	<div class="cal-grid">
		{#each layout as { week, visible, laneCount, overflow }, wi (wi)}
			<div class="cal-week" style:--lanes={laneCount}>
				<!-- day-number header cells -->
				{#each week as cell (cell.date)}
					<button
						type="button"
						class="cal-day {cell.inMonth ? '' : 'adjacent'} {cell.isToday ? 'is-today' : ''}"
						class:hidden={!cell.inMonth && !showAdjacent}
						onclick={() => onSelectDay?.(cell.date)}
						aria-label={cell.date}
					>
						<span class="daynum">{cell.day}</span>
					</button>
				{/each}

				<!-- event lanes -->
				{#each visible as bar (bar.event.id)}
					{@const tag = barTag(bar.event)}
					<svelte:element
						this={tag}
						href={tag === 'a' ? bar.event.href : undefined}
						role={tag === 'span' ? 'note' : undefined}
						class="cal-bar tone-{bar.event.tone ?? 'owned'}"
						class:cl={bar.continuesLeft}
						class:cr={bar.continuesRight}
						style:grid-column="{bar.colStart} / {bar.colEnd}"
						style:grid-row={bar.lane + 2}
						onclick={tag === 'button' ? () => bar.event.onClick?.() : undefined}
						title={bar.event.title}
					>
						{#if bar.event.emoji}<span class="bar-emoji">{bar.event.emoji}</span>{/if}
						<span class="bar-title">{bar.event.title}</span>
					</svelte:element>
				{/each}

				<!-- "+N more" per day -->
				{#each overflow as n, col (col)}
					{#if n > 0}
						<button
							type="button"
							class="cal-more"
							style:grid-column="{col + 1} / {col + 2}"
							style:grid-row={maxPerDay + 2}
							onclick={() => onOverflow?.(week[col].date)}
						>+{n}</button>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.wala-calendarmonth {
		font-family: var(--font-body);
	}
	.cal-head {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 10px;
	}
	.cal-title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: var(--text-heading);
		color: var(--color-text-strong);
	}
	/* prev on the left, title, next pushed to the right */
	.cal-head :global(.wala-iconbtn:first-child) {
		margin-right: 2px;
	}
	.cal-head .cal-title {
		margin-right: auto;
	}
	.cal-weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		margin-bottom: 4px;
	}
	.wd {
		text-align: center;
		font-weight: 800;
		font-size: var(--text-tiny);
		color: var(--color-text-muted);
		padding: 4px 0;
	}
	.cal-grid {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.cal-week {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		/* row 1 = day numbers; then one row per lane; then the overflow row */
		grid-template-rows: auto repeat(var(--lanes), 20px) auto;
		gap: 2px 2px;
		row-gap: 2px;
	}
	.cal-day {
		grid-row: 1;
		border: none;
		background: none;
		cursor: pointer;
		padding: 3px 0 1px;
		display: flex;
		justify-content: center;
		border-radius: var(--radius-sm);
		min-height: 26px;
	}
	.cal-day:hover {
		background: var(--color-sand-100);
	}
	.cal-day.hidden {
		visibility: hidden;
		pointer-events: none;
	}
	.daynum {
		font-weight: 700;
		font-size: 12.5px;
		color: var(--color-text-strong);
		width: 22px;
		height: 22px;
		display: grid;
		place-items: center;
		border-radius: var(--radius-pill);
	}
	.cal-day.adjacent .daynum {
		color: var(--color-sand-400);
	}
	.cal-day.is-today .daynum {
		background: var(--color-primary);
		color: var(--color-white);
		font-weight: 800;
	}
	.cal-bar {
		display: flex;
		align-items: center;
		gap: 4px;
		min-width: 0;
		height: 18px;
		padding: 0 6px;
		border-radius: var(--radius-sm);
		font-weight: 800;
		font-size: 11px;
		line-height: 1;
		text-decoration: none;
		border: none;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		background: var(--bar-bg);
		color: var(--bar-fg);
	}
	.cal-bar.cl {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}
	.cal-bar.cr {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
	.bar-emoji {
		font-size: 10px;
	}
	.bar-title {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	/* owned — your trips: accent, interactive */
	.tone-owned {
		--bar-bg: var(--color-primary-soft);
		--bar-fg: var(--color-primary-press);
		cursor: pointer;
	}
	a.tone-owned:hover,
	button.tone-owned:hover {
		filter: brightness(0.97);
	}
	/* teaser — a friend's shared trip: muted, read-only */
	.tone-teaser {
		--bar-bg: var(--color-sand-200);
		--bar-fg: var(--color-cocoa-500);
		cursor: default;
		opacity: 0.92;
	}
	/* neutral — generic block */
	.tone-neutral {
		--bar-bg: var(--color-surface-sunk);
		--bar-fg: var(--color-cocoa-700);
	}
	a.tone-neutral,
	button.tone-neutral {
		cursor: pointer;
	}
	.cal-more {
		align-self: start;
		justify-self: start;
		margin-left: 2px;
		border: none;
		background: none;
		cursor: pointer;
		font-weight: 800;
		font-size: 10.5px;
		color: var(--color-text-muted);
		padding: 1px 4px;
		border-radius: var(--radius-sm);
	}
	.cal-more:hover {
		background: var(--color-sand-100);
		color: var(--color-text-strong);
	}
</style>
