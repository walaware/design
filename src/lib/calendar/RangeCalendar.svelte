<script lang="ts" module>
	export type { DateRange, RangeTone } from './calendar.js';

	/** Why a completed span was rejected. */
	export type InvalidReason = 'too-short' | 'contains-disabled' | 'out-of-bounds';
</script>

<script lang="ts">
	import IconButton from '../core/IconButton.svelte';
	import type { DateRange } from './calendar.js';
	import {
		MONTH_NAMES,
		toIso,
		fromIso,
		addDays,
		dayDiff,
		clampNum,
		nightsBetween,
		formatLongDate,
		formatShortDate,
		monthIndex,
		fromMonthIndex,
		buildWeeks,
		weekdayLabels as weekdayLabelsFor,
		packLanes,
		sortSpans,
		type DaySpan
	} from './calendar.js';

	interface Props {
		/** Selected span start, `YYYY-MM-DD`. Bindable. */
		start?: string | null;
		/** Selected span end, `YYYY-MM-DD`. Bindable. */
		end?: string | null;
		/** Months shown side by side. `auto` → 1 / 2 / 3 by container width. */
		months?: number | 'auto';
		/** Leading visible month (defaults to `start`, else today). */
		defaultYear?: number;
		/** Leading visible month, 1–12. */
		defaultMonth?: number;
		/** Earliest selectable day, inclusive. Also bounds paging. */
		min?: string;
		/** Latest selectable day, inclusive. Also bounds paging. */
		max?: string;
		/** Minimum nights in a span. Shorter spans complete but read as invalid. */
		minNights?: number;
		/** First column of the week — 0 Sunday (default) or 1 Monday. */
		weekStartsOn?: 0 | 1;
		/** Per-day density, 0–1. Shades the cell on a sand ramp. */
		heat?: Record<string, number>;
		/** Turns a heat value into a phrase for the cell's accessible name. */
		heatLabel?: (date: string, value: number) => string;
		/** Committed spans drawn under the selection layer. */
		ranges?: DateRange[];
		/** Extra per-day disabling, on top of `min`/`max`. */
		isDisabled?: (date: string) => boolean;
		/** `candidate` bars per day before the rest collapse into "+N". */
		maxLanes?: number;
		/** Highlighted "today" as `YYYY-MM-DD`. Omit to derive from the clock. */
		today?: string;
		/** Accessible name for each month grid is derived; this names the whole widget. */
		label?: string;
		/** Show the built-in header (title + prev/next). */
		header?: boolean;
		/** A valid span was completed. */
		onSelect?: (start: string, end: string) => void;
		/** A span was completed but fails `minNights` / bounds / disabled days. */
		onInvalidSelect?: (start: string, end: string, reason: InvalidReason) => void;
		/** The visible leading month changed. */
		onViewChange?: (year: number, month: number) => void;
	}

	let {
		start = $bindable(null),
		end = $bindable(null),
		months = 'auto',
		defaultYear,
		defaultMonth,
		min,
		max,
		minNights = 0,
		weekStartsOn = 0,
		heat = {},
		heatLabel,
		ranges = [],
		isDisabled,
		maxLanes = 3,
		today,
		label = 'Choose a date range',
		header = true,
		onSelect,
		onInvalidSelect,
		onViewChange
	}: Props = $props();

	const todayIso = $derived(today ?? toIso(new Date()));

	/* ── view window ─────────────────────────────────────────────────── */

	/** One-shot seed: the view is uncontrolled after mount, driven by paging. */
	function initialViewIdx(): number {
		const seed = fromIso(start ?? today ?? toIso(new Date()));
		return monthIndex(defaultYear ?? seed.getFullYear(), defaultMonth ?? seed.getMonth() + 1);
	}

	let viewIdx = $state(initialViewIdx());

	let rootEl: HTMLDivElement | undefined = $state();
	// SSR and first paint render one month; the observer widens after hydration.
	let autoCount = $state(1);

	$effect(() => {
		if (months !== 'auto' || !rootEl) return;
		const ro = new ResizeObserver(([entry]) => {
			const w = entry.contentRect.width;
			autoCount = w < 640 ? 1 : w < 1024 ? 2 : 3;
		});
		ro.observe(rootEl);
		return () => ro.disconnect();
	});

	const monthCount = $derived(months === 'auto' ? autoCount : Math.max(1, months));

	const minIdx = $derived(
		min ? monthIndex(fromIso(min).getFullYear(), fromIso(min).getMonth() + 1) : -Infinity
	);
	const maxIdx = $derived(
		max ? monthIndex(fromIso(max).getFullYear(), fromIso(max).getMonth() + 1) : Infinity
	);

	// Latest leading month that still keeps the last visible month within `max`.
	const maxLeadIdx = $derived(Math.max(minIdx, maxIdx - monthCount + 1));
	const canPrev = $derived(viewIdx > minIdx);
	const canNext = $derived(viewIdx < maxLeadIdx);

	const visibleMonths = $derived(
		Array.from({ length: monthCount }, (_, i) => fromMonthIndex(viewIdx + i))
	);

	function page(delta: number) {
		const next = clampNum(viewIdx + delta * monthCount, minIdx, maxLeadIdx);
		if (next === viewIdx) return;
		viewIdx = next;
		const { year, month } = fromMonthIndex(viewIdx);
		onViewChange?.(year, month);
	}

	/** Scroll the view so `iso`'s month is visible, without moving past bounds. */
	function ensureVisible(iso: string) {
		const dt = fromIso(iso);
		const idx = monthIndex(dt.getFullYear(), dt.getMonth() + 1);
		let next = viewIdx;
		if (idx < viewIdx) next = idx;
		else if (idx > viewIdx + monthCount - 1) next = idx - monthCount + 1;
		next = clampNum(next, minIdx, maxLeadIdx);
		if (next === viewIdx) return;
		viewIdx = next;
		const { year, month } = fromMonthIndex(viewIdx);
		onViewChange?.(year, month);
	}

	/* ── disabling ───────────────────────────────────────────────────── */

	function disabled(iso: string): boolean {
		if (min && iso < min) return true;
		if (max && iso > max) return true;
		return isDisabled?.(iso) ?? false;
	}

	/* ── selection state machine ─────────────────────────────────────── */

	let anchor = $state<string | null>(null);
	let hoverDate = $state<string | null>(null);
	/** One-shot seed: thereafter driven by keyboard navigation and focus. */
	function initialFocus(): string {
		return start ?? today ?? toIso(new Date());
	}

	let focusedDate = $state(initialFocus());
	let announcement = $state('');
	let wantFocus = $state(false);

	// Snapshot so Escape can restore a range that a half-made one clobbered.
	let prevStart: string | null = null;
	let prevEnd: string | null = null;

	/** The span currently drawn: the tentative one while picking, else committed. */
	const drawn = $derived.by((): DaySpan | null => {
		if (anchor !== null) {
			const tip = hoverDate ?? focusedDate;
			return tip >= anchor ? { start: anchor, end: tip } : { start: anchor, end: anchor };
		}
		if (start && end) return { start, end };
		if (start) return { start, end: start };
		return null;
	});

	function invalidReason(s: string, e: string): InvalidReason | null {
		if ((min && s < min) || (max && e > max)) return 'out-of-bounds';
		for (let d = s; d <= e; d = addDays(d, 1)) {
			if (isDisabled?.(d)) return 'contains-disabled';
		}
		if (nightsBetween(s, e) < minNights) return 'too-short';
		return null;
	}

	const drawnInvalid = $derived(drawn ? invalidReason(drawn.start, drawn.end!) !== null : false);

	function nightsPhrase(n: number): string {
		return `${n} night${n === 1 ? '' : 's'}`;
	}

	function reasonPhrase(r: InvalidReason): string {
		if (r === 'too-short') return `At least ${nightsPhrase(minNights)} required.`;
		if (r === 'contains-disabled') return 'That span includes unavailable days.';
		return 'That span is outside the allowed dates.';
	}

	function beginAt(iso: string) {
		// Snapshot only when leaving a committed state. Restarting a half-made
		// span must not overwrite it with the already-cleared start/end, or
		// Escape would restore the half-made range instead of the real one.
		if (anchor === null) {
			prevStart = start;
			prevEnd = end;
		}
		anchor = iso;
		start = iso;
		end = null;
		announcement = `${formatShortDate(iso)} selected as the start date. Now choose an end date.`;
	}

	function activate(iso: string) {
		if (disabled(iso)) return;
		// No anchor yet, or a second click before the anchor: (re)start the span.
		if (anchor === null || iso < anchor) {
			beginAt(iso);
			return;
		}
		const s = anchor;
		anchor = null;
		start = s;
		end = iso;
		const reason = invalidReason(s, iso);
		const n = nightsBetween(s, iso);
		if (reason) {
			announcement = `${formatShortDate(s)} to ${formatShortDate(iso)}, ${nightsPhrase(n)}. ${reasonPhrase(reason)}`;
			onInvalidSelect?.(s, iso, reason);
		} else {
			announcement = `${formatShortDate(s)} to ${formatShortDate(iso)} selected. ${nightsPhrase(n)}.`;
			onSelect?.(s, iso);
		}
	}

	function cancel() {
		if (anchor === null) return;
		anchor = null;
		start = prevStart;
		end = prevEnd;
		announcement = 'Selection cancelled.';
	}

	/* ── keyboard: roving tabindex over the day grid ─────────────────── */

	function moveFocus(iso: string) {
		let next = iso;
		if (min && next < min) next = min;
		if (max && next > max) next = max;
		focusedDate = next;
		ensureVisible(next);
		wantFocus = true;
	}

	/** Same day-of-month `n` months away, clamped to that month's length. */
	function shiftMonth(iso: string, n: number): string {
		const dt = fromIso(iso);
		const target = new Date(dt.getFullYear(), dt.getMonth() + n, 1);
		const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
		return toIso(
			new Date(target.getFullYear(), target.getMonth(), Math.min(dt.getDate(), lastDay))
		);
	}

	function onDayKeydown(event: KeyboardEvent, iso: string) {
		// Enter/Space are left to the button's native activation — handling them
		// here too would fire `activate` twice.
		const offsetInWeek = (fromIso(iso).getDay() - weekStartsOn + 7) % 7;
		let next: string | null = null;
		switch (event.key) {
			case 'ArrowLeft': next = addDays(iso, -1); break;
			case 'ArrowRight': next = addDays(iso, 1); break;
			case 'ArrowUp': next = addDays(iso, -7); break;
			case 'ArrowDown': next = addDays(iso, 7); break;
			case 'Home': next = addDays(iso, -offsetInWeek); break;
			case 'End': next = addDays(iso, 6 - offsetInWeek); break;
			case 'PageUp': next = shiftMonth(iso, event.shiftKey ? -12 : -1); break;
			case 'PageDown': next = shiftMonth(iso, event.shiftKey ? 12 : 1); break;
			case 'Escape':
				event.preventDefault();
				cancel();
				return;
			default:
				return;
		}
		event.preventDefault();
		moveFocus(next);
	}

	$effect(() => {
		if (!wantFocus) return;
		wantFocus = false;
		rootEl?.querySelector<HTMLElement>(`[data-date="${focusedDate}"]`)?.focus();
	});

	/* ── per-month layout ────────────────────────────────────────────── */

	const candidates = $derived(ranges.filter((r) => (r.tone ?? 'candidate') === 'candidate'));
	const bands = $derived(ranges.filter((r) => (r.tone ?? 'candidate') !== 'candidate'));

	/** Clip a span to a week ∩ month, in 1-based grid columns of that week. */
	function segment(
		span: { start: string; end?: string },
		weekStart: string,
		weekEnd: string,
		monthFirst: string,
		monthLast: string
	) {
		const s = span.start;
		const e = span.end ?? span.start;
		const lo = weekStart > monthFirst ? weekStart : monthFirst;
		const hi = weekEnd < monthLast ? weekEnd : monthLast;
		if (s > hi || e < lo) return null;
		const segStart = s < lo ? lo : s;
		const segEnd = e > hi ? hi : e;
		return {
			colStart: dayDiff(weekStart, segStart) + 1,
			colEnd: dayDiff(weekStart, segEnd) + 2,
			continuesLeft: s < segStart,
			continuesRight: e > segEnd
		};
	}

	interface MonthView {
		year: number;
		month: number;
		heading: string;
		monthFirst: string;
		monthLast: string;
		weeks: ReturnType<typeof buildWeeks>;
		/** Per week: candidate bars keyed by their starting column. */
		lanes: {
			laneCount: number;
			bars: { range: DateRange; colStart: number; cols: number; lane: number; cl: boolean; cr: boolean }[];
			overflow: number[];
		}[];
	}

	const monthViews = $derived.by((): MonthView[] =>
		visibleMonths.map(({ year, month }) => {
			const monthFirst = toIso(new Date(year, month - 1, 1));
			const monthLast = toIso(new Date(year, month, 0));
			const weeks = buildWeeks(year, month, weekStartsOn, todayIso);

			// Clip candidates to this month, keeping a handle on the original so
			// bars that run past a month edge still render a squared-off end.
			const clipped = candidates
				.map((range) => {
					const s = range.start < monthFirst ? monthFirst : range.start;
					const e = (range.end ?? range.start) > monthLast ? monthLast : (range.end ?? range.start);
					return s > e ? null : { start: s, end: e, range };
				})
				.filter((c): c is { start: string; end: string; range: DateRange } => c !== null);
			const sorted = sortSpans(clipped);

			const lanes = weeks.map((week) => {
				const { bars, laneCount: total } = packLanes(week[0].date, week[6].date, sorted);
				const visible = bars
					.filter((b) => b.lane < maxLanes)
					.map((b) => ({
						range: b.item.range,
						colStart: b.colStart,
						cols: b.colEnd - b.colStart,
						lane: b.lane,
						cl: b.continuesLeft || b.item.range.start < b.item.start,
						cr: b.continuesRight || (b.item.range.end ?? b.item.range.start) > b.item.end
					}));
				const overflow = Array.from({ length: 7 }, (_, col) =>
					bars.filter((b) => b.lane >= maxLanes && b.colStart - 1 <= col && b.colEnd - 2 >= col)
						.length
				);
				return { laneCount: Math.min(total, maxLanes), bars: visible, overflow };
			});

			return {
				year,
				month,
				heading: `${MONTH_NAMES[month - 1]} ${year}`,
				monthFirst,
				monthLast,
				weeks,
				lanes
			};
		})
	);

	const weekdays = $derived(weekdayLabelsFor(weekStartsOn));

	function heatOf(iso: string): number {
		return clampNum(heat[iso] ?? 0, 0, 1);
	}

	function inDrawn(iso: string): boolean {
		return !!drawn && iso >= drawn.start && iso <= drawn.end!;
	}

	function dayLabel(iso: string): string {
		const parts = [formatLongDate(iso)];
		const h = heatOf(iso);
		if (h > 0 && heatLabel) parts.push(heatLabel(iso, h));
		for (const r of ranges) {
			if (r.label && iso >= r.start && iso <= (r.end ?? r.start)) parts.push(`In ${r.label}`);
		}
		if (disabled(iso)) parts.push('Unavailable');
		return parts.join('. ') + '.';
	}

	/** One tab stop per month grid: the focused day, else that month's 1st. */
	function isTabbable(iso: string, mv: MonthView): boolean {
		if (focusedDate >= mv.monthFirst && focusedDate <= mv.monthLast) return iso === focusedDate;
		return iso === mv.monthFirst;
	}
</script>

<!--
	Inline, selectable range calendar. Click a start, then an end — the tentative
	span previews on hover and on keyboard focus, so it works by tap on mobile
	where there is no hover. Four overlays coexist by using four different visual
	properties, never four intensities of one fill: `heat` shades the cell on a
	sand ramp, `outline` ranges stroke a band, `candidate` ranges draw accent bars
	in lanes, and the live selection owns the solid accent pills. The heat ramp
	tops out at sand-400, so the day number never loses contrast and never has to
	flip colour.

	A11y: one `role="grid"` per month, roving tabindex, arrows/Home/End/PageUp/
	PageDown to navigate, Enter or Space to set start then end, Escape to cancel a
	half-made span (restoring whatever was committed before).
-->
<div class="wala-rangecalendar" bind:this={rootEl} role="group" aria-label={label}>
	{#if header}
		<div class="rc-head">
			<IconButton
				tone="soft"
				size={34}
				aria-label="Previous month"
				disabled={!canPrev}
				onclick={() => page(-1)}>‹</IconButton
			>
			<div class="rc-title">{monthViews[0]?.heading}</div>
			<IconButton
				tone="soft"
				size={34}
				aria-label="Next month"
				disabled={!canNext}
				onclick={() => page(1)}>›</IconButton
			>
		</div>
	{/if}

	<div class="rc-months">
		{#each monthViews as mv (mv.heading)}
			<div class="rc-month">
				<div class="rc-month-title" aria-hidden="true">{mv.heading}</div>

				<div class="rc-grid" role="grid" aria-label={mv.heading}>
					<div class="rc-row rc-weekdays" role="row">
						{#each weekdays as w (w)}
							<span class="rc-wd" role="columnheader">{w}</span>
						{/each}
					</div>

					{#each mv.weeks as week, wi (wi)}
						{@const lane = mv.lanes[wi]}
						<div class="rc-row" role="row" style:--lanes={lane.laneCount}>
							{#each week as cell, ci (cell.date)}
								{#if !cell.inMonth}
									<div class="rc-cell rc-empty" role="gridcell"></div>
								{:else}
									{@const isDis = disabled(cell.date)}
									{@const h = heatOf(cell.date)}
									{@const covered = inDrawn(cell.date)}
									{@const selSeg = drawn
										? segment(drawn, week[0].date, week[6].date, mv.monthFirst, mv.monthLast)
										: null}
									<div
										class="rc-cell"
										role="gridcell"
										aria-selected={!!start && !!end && covered && anchor === null}
										class:is-start={drawn?.start === cell.date}
										class:is-end={drawn?.end === cell.date}
										class:in-span={covered}
										class:invalid={covered && drawnInvalid}
									>
										{#if h > 0 && !covered}
											<span class="rc-heat" aria-hidden="true" style:--heat={h}></span>
										{/if}

										{#each bands as b (b.id)}
											{@const seg = segment(b, week[0].date, week[6].date, mv.monthFirst, mv.monthLast)}
											{#if seg && seg.colStart === ci + 1}
												<span
													class="rc-band tone-{b.tone}"
													aria-hidden="true"
													class:cl={seg.continuesLeft}
													class:cr={seg.continuesRight}
													style:--cols={seg.colEnd - seg.colStart}
												></span>
											{/if}
										{/each}

										{#if selSeg && selSeg.colStart === ci + 1}
											<span
												class="rc-sel"
												aria-hidden="true"
												class:tentative={anchor !== null}
												class:invalid={drawnInvalid}
												class:cl={selSeg.continuesLeft}
												class:cr={selSeg.continuesRight}
												style:--cols={selSeg.colEnd - selSeg.colStart}
											></span>
										{/if}

										<button
											type="button"
											class="rc-day"
											class:is-today={cell.isToday}
											data-date={cell.date}
											tabindex={isTabbable(cell.date, mv) ? 0 : -1}
											aria-disabled={isDis}
											aria-label={dayLabel(cell.date)}
											onclick={() => activate(cell.date)}
											onkeydown={(e) => onDayKeydown(e, cell.date)}
											onmouseenter={() => (hoverDate = cell.date)}
											onmouseleave={() => (hoverDate = null)}
											onfocus={() => (focusedDate = cell.date)}
										>
											<span class="rc-num">{cell.day}</span>
										</button>

										{#each lane.bars.filter((b) => b.colStart === ci + 1) as bar (bar.range.id)}
											{@const tag = bar.range.onClick ? 'button' : 'span'}
											<svelte:element
												this={tag}
												class="rc-bar"
												class:cl={bar.cl}
												class:cr={bar.cr}
												aria-hidden={tag === 'span' ? 'true' : undefined}
												aria-label={tag === 'button' ? bar.range.label : undefined}
												style:--cols={bar.cols}
												style:--lane={bar.lane}
												onclick={tag === 'button' ? () => bar.range.onClick?.() : undefined}
											>
												{#if bar.range.emoji}<span class="rc-bar-emoji">{bar.range.emoji}</span>{/if}
												<span class="rc-bar-label">{bar.range.label ?? ''}</span>
											</svelte:element>
										{/each}

										{#if lane.overflow[ci] > 0}
											<span class="rc-more" aria-hidden="true" style:--lane={maxLanes}
												>+{lane.overflow[ci]}</span
											>
										{/if}
									</div>
								{/if}
							{/each}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<p class="rc-sr" aria-live="polite">{announcement}</p>
</div>

<style>
	.wala-rangecalendar {
		font-family: var(--font-body);
		--rc-gap: 2px;
		--rc-daysize: 30px;
		--rc-lane-h: 16px;
		--rc-lane-gap: 2px;
	}
	.rc-head {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 10px;
	}
	.rc-title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: var(--text-heading);
		color: var(--color-text-strong);
		margin-right: auto;
	}
	.rc-months {
		display: flex;
		gap: 24px;
		align-items: flex-start;
	}
	.rc-month {
		flex: 1 1 0;
		min-width: 0;
	}
	.rc-month-title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: var(--text-body);
		color: var(--color-text-strong);
		text-align: center;
		margin-bottom: 6px;
	}
	/* The header row shows only when more than one month is visible; with a
	   single month the widget header already names it. */
	.rc-months:has(.rc-month:only-child) .rc-month-title {
		display: none;
	}
	.rc-grid {
		display: flex;
		flex-direction: column;
		gap: var(--rc-gap);
	}
	.rc-row {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: var(--rc-gap);
	}
	.rc-weekdays {
		margin-bottom: 2px;
	}
	.rc-wd {
		text-align: center;
		font-weight: 800;
		font-size: var(--text-tiny);
		color: var(--color-text-muted);
		padding: 4px 0;
	}
	.rc-cell {
		position: relative;
		min-height: calc(
			var(--rc-daysize) + var(--lanes, 0) * (var(--rc-lane-h) + var(--rc-lane-gap))
		);
	}
	.rc-empty {
		pointer-events: none;
	}

	/* ── layer 1: heat (cell background, sand ramp) ───────────────────
	   The ramp lives entirely in sand and tops out at sand-400, so
	   --color-text-strong stays legible at every value. No text flip. */
	.rc-heat {
		position: absolute;
		inset: 0 0 auto 0;
		height: var(--rc-daysize);
		border-radius: var(--radius-sm);
		pointer-events: none;
		background: color-mix(
			in oklab,
			var(--color-sand-400) calc(var(--heat) * 100%),
			var(--color-white)
		);
	}

	/* ── layer 2: committed bands (stroke or soft fill) ───────────────── */
	.rc-band,
	.rc-sel {
		position: absolute;
		top: 1px;
		left: 0;
		height: calc(var(--rc-daysize) - 2px);
		pointer-events: none;
		/* span N columns, re-adding the gaps the columns straddle */
		width: calc(var(--cols) * 100% + (var(--cols) - 1) * var(--rc-gap));
		border-radius: var(--radius-pill);
	}
	.rc-band.cl,
	.rc-sel.cl {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}
	.rc-band.cr,
	.rc-sel.cr {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
	/* outline — your own availability: stroked, never filled */
	.rc-band.tone-outline {
		border: 1.5px solid var(--color-cocoa-300);
	}
	/* muted — context: soft sand fill */
	.rc-band.tone-muted {
		background: var(--color-sand-200);
	}

	/* ── layer 3: the live selection (owns the accent) ────────────────── */
	.rc-sel {
		background: color-mix(in oklab, var(--color-primary) 16%, var(--color-white));
	}
	.rc-sel.tentative {
		background: color-mix(in oklab, var(--color-primary) 9%, var(--color-white));
	}
	.rc-sel.invalid {
		background: color-mix(in oklab, var(--color-danger) 11%, var(--color-white));
	}

	/* ── layer 4: the day itself ──────────────────────────────────────── */
	.rc-day {
		position: relative;
		z-index: 1;
		width: 100%;
		height: var(--rc-daysize);
		border: none;
		background: none;
		cursor: pointer;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.rc-day[aria-disabled='true'] {
		cursor: default;
	}
	.rc-num {
		font-weight: 700;
		font-size: 12.5px;
		color: var(--color-text-strong);
		width: 24px;
		height: 24px;
		display: grid;
		place-items: center;
		border-radius: var(--radius-pill);
	}
	.rc-day:hover:not([aria-disabled='true']) .rc-num {
		box-shadow: inset 0 0 0 1.5px var(--color-sand-400);
	}
	.rc-day:focus-visible {
		outline: none;
	}
	.rc-day:focus-visible .rc-num {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}
	.rc-day[aria-disabled='true'] .rc-num {
		color: var(--color-cocoa-300);
		text-decoration: line-through;
	}
	.rc-day.is-today .rc-num {
		box-shadow: inset 0 0 0 1.5px var(--color-primary);
	}
	/* endpoints — the only solid accent on the grid */
	.rc-cell.is-start .rc-num,
	.rc-cell.is-end .rc-num {
		background: var(--color-primary);
		color: var(--color-text-on-color);
		font-weight: 800;
	}
	.rc-cell.invalid.is-start .rc-num,
	.rc-cell.invalid.is-end .rc-num {
		background: var(--color-danger);
	}

	/* ── layer 5: candidate bars ──────────────────────────────────────── */
	.rc-bar {
		position: absolute;
		left: 0;
		top: calc(var(--rc-daysize) + var(--lane) * (var(--rc-lane-h) + var(--rc-lane-gap)));
		width: calc(var(--cols) * 100% + (var(--cols) - 1) * var(--rc-gap));
		height: var(--rc-lane-h);
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 0 6px;
		border: none;
		border-radius: var(--radius-sm);
		background: var(--color-primary-soft);
		color: var(--color-primary-press);
		font-family: inherit;
		font-weight: 800;
		font-size: 10.5px;
		line-height: 1;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
	}
	button.rc-bar {
		cursor: pointer;
	}
	button.rc-bar:hover {
		filter: brightness(0.97);
	}
	.rc-bar.cl {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}
	.rc-bar.cr {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
	.rc-bar-emoji {
		font-size: 10px;
	}
	.rc-bar-label {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.rc-more {
		position: absolute;
		left: 2px;
		top: calc(var(--rc-daysize) + var(--lane) * (var(--rc-lane-h) + var(--rc-lane-gap)));
		font-weight: 800;
		font-size: 10px;
		color: var(--color-text-muted);
		pointer-events: none;
	}

	.rc-sr {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	@media (max-width: 640px) {
		.rc-months {
			gap: 16px;
		}
	}
</style>
