# DateField

Native, accessible date primitive for the walaware suite. **One** component covers either a
**single date** or a **start–end range** — styled to match `TextField`.

## When to use

- Any date input in the suite (trip dates, listing availability, due dates, birthdays).
- A date **range** (check-in/check-out, trip start/end) — use `range` rather than wiring two
  separate pickers, so the From/To coupling and the mobile layout are handled for you.

Reach for `TextField` instead for free text; `SegmentedControl` for a small fixed set of choices.

## Why it's a primitive (don't hand-roll `<input type="date">`)

A raw native date input has an **intrinsic min-width that `min-width: 0` does not override**, so
two side-by-side range inputs spill out of their card on mobile Chrome AND Safari (desktop
Chromium renders date inputs narrow, which hides the bug). The reliable fix —
`appearance: none` + `min-width: 0` + `width: 100%` — is baked in here so it's correct
everywhere. The component also owns the range coupling: `To.min` auto-tracks `From` (honoring
`minNights`), `End` clears if `Start` moves past it, and the two inputs are a shrink-safe,
two-up layout that fits at 360px.

No custom calendar popover — it uses the **OS-native picker** (best accessibility, nothing to
maintain). A calendar glyph is shown only on engines that drop the native picker indicator.

## Props

See `DateField.d.ts` for the full contract. Common: `label`, `hint`, `min`, `max`,
`size` (`'sm' | 'md'`), `disabled`, `required`, `name`, `range`.

- **Single** (`range={false}`, default): `value` + `onValueChange`.
- **Range** (`range`): `start`/`end` + `onStartChange`/`onEndChange`; `startLabel`/`endLabel`
  (default "From"/"To"); `minNights` (min gap in days — sets `End.min` and flags the range
  `aria-invalid` when shorter); `nameStart`/`nameEnd` (submit names, default
  `${name}_start` / `${name}_end`).

> Svelte parity: the `@walaware/design` Svelte component exposes `value`/`start`/`end` as
> `$bindable` two-way props instead of value + on*Change. Prop **names and defaults are
> otherwise identical** across both implementations.

## Examples

```jsx
// single
<DateField label="Date" value={day} onValueChange={setDay} min={today} />

// range, minimum 2 nights
<DateField
  range
  label="Trip dates"
  start={start} onStartChange={setStart}
  end={end} onEndChange={setEnd}
  min={today}
  minNights={2}
  hint="At least 2 nights"
/>
```

```svelte
<!-- Svelte (@walaware/design) -->
<DateField label="Date" bind:value={day} min={today} />
<DateField range bind:start bind:end min={today} minNights={2} hint="At least 2 nights" />
```

## Accessibility

- Labels are associated (`htmlFor`/`for`). Range mode is a `role="group"` labelled by the
  overall label, wrapping the two individually-labelled inputs.
- Range invalidity (End before Start, or shorter than `minNights`) sets `aria-invalid` on the
  End input and the hint reads as an error (accent-red); the group references the hint via
  `aria-describedby`.
- The calendar glyph is a mouse affordance only (`aria-hidden`, removed from the tab order) —
  keyboard users operate the native input directly.

## Acceptance check

At a **360px** viewport on mobile Safari AND Chrome, a range `DateField` sits **two-up inside a
card with zero horizontal overflow**. End is not selectable before Start; `minNights` is enforced
on both the client guard (native `min`) and the value (invalid flag). Both platforms use the OS
date picker.
