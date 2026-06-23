<script lang="ts">
	import Avatar from '../people/Avatar.svelte';

	interface Props {
		name?: string;
		color?: string;
		text?: string;
		time?: string;
		/** Your own message — right-aligned, accent bubble. */
		mine?: boolean;
		/** A centred system note ("Maya claimed the tent"). */
		system?: boolean;
	}

	let { name, color, text, time, mine = false, system = false }: Props = $props();
</script>

<!--
	A bubble in the trip chat. Renders three ways: your own (right, accent),
	someone else's (left, with avatar), and system notes (centred).
-->
{#if system}
	<div class="system">
		<span class="system-pill">{text}</span>
	</div>
{:else}
	<div class="row {mine ? 'mine' : ''}">
		{#if !mine}<Avatar {name} {color} size={28} />{/if}
		<div class="col">
			{#if !mine}<div class="who">{name}</div>{/if}
			<div class="bubble">{text}</div>
			{#if time}<div class="time">{time}</div>{/if}
		</div>
	</div>
{/if}

<style>
	.system {
		text-align: center;
		margin: 6px 0;
	}
	.system-pill {
		display: inline-block;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 11.5px;
		color: var(--color-text-muted);
		background: var(--color-sand-200);
		border-radius: var(--radius-pill);
		padding: 4px 12px;
	}
	.row {
		display: flex;
		gap: 8px;
		align-items: flex-end;
		margin: 8px 0;
	}
	.row.mine {
		flex-direction: row-reverse;
	}
	.col {
		max-width: 76%;
	}
	.who {
		font-family: var(--font-body);
		font-weight: 800;
		font-size: 11.5px;
		color: var(--color-text-muted);
		margin: 0 0 3px 4px;
	}
	.bubble {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 14px;
		line-height: 1.35;
		color: var(--color-text-strong);
		background: var(--color-white);
		border: 1px solid var(--color-sand-300);
		border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) 6px;
		padding: 9px 13px;
		box-shadow: var(--shadow-soft);
	}
	.mine .bubble {
		color: var(--color-white);
		background: var(--color-primary);
		border: none;
		border-radius: var(--radius-lg) var(--radius-lg) 6px var(--radius-lg);
	}
	.time {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 10.5px;
		color: var(--color-text-muted);
		margin: 3px 0 0 4px;
		text-align: left;
	}
	.mine .time {
		margin: 3px 4px 0 0;
		text-align: right;
	}
</style>
