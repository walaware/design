<script lang="ts" module>
	import type { Snippet } from 'svelte';

	/** One row in a PersonList. */
	export interface Person {
		/** Stable id — used for selection + keying. */
		id: string;
		name: string;
		color?: string;
		src?: string;
		/** Emoji instead of the initial/photo. */
		emoji?: string;
		/** Muted sub-line under the name (e.g. "3 trips together"). */
		meta?: string;
	}
</script>

<script lang="ts">
	import Avatar from './Avatar.svelte';

	interface Props {
		people: Person[];
		/** Multi-select mode — each row gets a check affordance and toggles on tap. */
		selectable?: boolean;
		/** Selected ids (two-way). */
		selected?: string[];
		/** Fired when a row's selection flips (selectable mode). */
		onToggle?: (id: string, next: boolean) => void;
		/** Row tap in non-selectable mode (e.g. open a profile). Omit for static rows. */
		onSelect?: (person: Person) => void;
		/** Trailing per-row action — e.g. an "Invite" / "Add friend" Button. */
		action?: Snippet<[Person]>;
		/** Avatar diameter. */
		size?: number;
		/** Hairline dividers between rows (first row always omits it). */
		divider?: boolean;
	}

	let {
		people,
		selectable = false,
		selected = $bindable([]),
		onToggle,
		onSelect,
		action,
		size = 40,
		divider = true
	}: Props = $props();

	const isSel = (id: string) => selected.includes(id);

	function toggle(p: Person) {
		const next = !isSel(p.id);
		selected = next ? [...selected, p.id] : selected.filter((x) => x !== p.id);
		onToggle?.(p.id, next);
	}

	function rowClick(p: Person) {
		if (selectable) toggle(p);
		else onSelect?.(p);
	}

	const interactive = $derived(selectable || !!onSelect);
</script>

<!--
	Vertical list of people — a friends list, a "traveled with" suggestion list,
	or (with `selectable`) a multi-select picker. Compose inside a Card.
-->
<div class="wala-personlist">
	{#each people as p, i (p.id)}
		{@const rowDivider = divider && i > 0}
		<div class="row {rowDivider ? 'divider' : ''}">
			{#if interactive}
				<button
					class="hit"
					type="button"
					aria-pressed={selectable ? isSel(p.id) : undefined}
					onclick={() => rowClick(p)}
				>
					{#if selectable}
						<span class="check {isSel(p.id) ? 'on' : ''}" aria-hidden="true">
							{#if isSel(p.id)}✓{/if}
						</span>
					{/if}
					<Avatar name={p.name} color={p.color} src={p.src} emoji={p.emoji} {size} />
					<span class="who">
						<span class="name">{p.name}</span>
						{#if p.meta}<span class="meta">{p.meta}</span>{/if}
					</span>
				</button>
			{:else}
				<span class="hit static">
					<Avatar name={p.name} color={p.color} src={p.src} emoji={p.emoji} {size} />
					<span class="who">
						<span class="name">{p.name}</span>
						{#if p.meta}<span class="meta">{p.meta}</span>{/if}
					</span>
				</span>
			{/if}
			{#if action}<span class="action">{@render action(p)}</span>{/if}
		</div>
	{/each}
</div>

<style>
	.wala-personlist {
		display: flex;
		flex-direction: column;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 11px;
		padding: 6px 0;
	}
	.row.divider {
		border-top: 1px solid var(--color-sand-200);
	}
	.hit {
		flex: 1;
		min-width: 0;
		display: flex;
		align-items: center;
		gap: 11px;
		padding: 5px 0;
		background: none;
		border: none;
		text-align: left;
		font: inherit;
		color: inherit;
	}
	button.hit {
		cursor: pointer;
	}
	.hit.static {
		cursor: default;
	}
	.check {
		flex: none;
		width: 24px;
		height: 24px;
		border-radius: var(--radius-pill);
		display: grid;
		place-items: center;
		border: 2px solid var(--color-sand-300);
		color: var(--color-white);
		font-size: 13px;
		font-weight: 800;
		transition:
			background var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out);
	}
	.check.on {
		background: var(--color-primary);
		border-color: var(--color-primary);
	}
	.who {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.name {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 14.5px;
		color: var(--color-text-strong);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.meta {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 12.5px;
		color: var(--color-text-muted);
	}
	.action {
		flex: none;
		margin-left: auto;
	}
</style>
