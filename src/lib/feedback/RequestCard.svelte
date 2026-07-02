<script lang="ts" module>
	import type { Snippet } from 'svelte';

	/** Leading person for the card (friend requests). */
	export interface RequestPerson {
		name: string;
		color?: string;
		src?: string;
	}
</script>

<script lang="ts">
	import Card from '../core/Card.svelte';
	import Button from '../core/Button.svelte';
	import Chip from '../core/Chip.svelte';
	import Avatar from '../people/Avatar.svelte';

	interface Props {
		/** Leading avatar — use for person-centric requests (friend requests). */
		avatar?: RequestPerson | null;
		/** Leading emoji tile — use for object-centric requests (a trip invite). Ignored when `avatar` is set. */
		emoji?: string | null;
		/** Emoji tile background. */
		emojiBg?: string;
		/** Headline — "Maya wants to be friends" / the trip name. */
		title?: string | Snippet;
		/** Sub-line — "3 mutual friends" / "Aug 8–12 · Tofino · from Theo". */
		meta?: string | Snippet;
		/** Accept handler — shows the primary Accept action. */
		onAccept?: (() => void) | undefined;
		acceptLabel?: string;
		/** Decline handler — shows the ghost Decline action. */
		onDecline?: (() => void) | undefined;
		declineLabel?: string;
		/** Cancel handler — for an outgoing/pending request (shows a soft Cancel). */
		onCancel?: (() => void) | undefined;
		cancelLabel?: string;
		/** Mark as an outgoing/pending request — shows a muted "Pending" chip. */
		pending?: boolean;
		/** Extra body content under the meta line. */
		children?: Snippet;
	}

	let {
		avatar = null,
		emoji = null,
		emojiBg = 'var(--color-sand-200)',
		title,
		meta,
		onAccept = undefined,
		acceptLabel = 'Accept',
		onDecline = undefined,
		declineLabel = 'Decline',
		onCancel = undefined,
		cancelLabel = 'Cancel',
		pending = false,
		children
	}: Props = $props();
</script>

<!--
	Inbound request card — a friend request or a trip invitation waiting on the
	dashboard. Leading avatar (person) or emoji tile (object), a title + meta,
	and Accept/Decline (incoming) or Cancel (outgoing/pending) actions.
-->
<Card pad>
	<div class="wala-requestcard">
		<div class="lead">
			{#if avatar}
				<Avatar name={avatar.name} color={avatar.color} src={avatar.src} size={44} />
			{:else if emoji}
				<span class="emoji" style:background={emojiBg}>{emoji}</span>
			{/if}
		</div>
		<div class="body">
			<div class="title">{#if typeof title === 'function'}{@render title()}{:else}{title}{/if}</div>
			{#if meta}
				<div class="meta">{#if typeof meta === 'function'}{@render meta()}{:else}{meta}{/if}</div>
			{/if}
			{#if children}<div class="extra">{@render children()}</div>{/if}
		</div>
		<div class="actions">
			{#if pending}
				<Chip tone="neutral">Pending</Chip>
			{/if}
			{#if onAccept}
				<Button variant="primary" size="sm" onclick={() => onAccept?.()}>{acceptLabel}</Button>
			{/if}
			{#if onDecline}
				<Button variant="ghost" size="sm" onclick={() => onDecline?.()}>{declineLabel}</Button>
			{/if}
			{#if onCancel}
				<Button variant="soft" size="sm" onclick={() => onCancel?.()}>{cancelLabel}</Button>
			{/if}
		</div>
	</div>
</Card>

<style>
	.wala-requestcard {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.lead {
		flex: none;
	}
	.emoji {
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		border-radius: var(--radius-md);
		font-size: 22px;
	}
	.body {
		flex: 1;
		min-width: 0;
	}
	.title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: var(--text-heading);
		color: var(--color-text-strong);
		line-height: 1.25;
	}
	.meta {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 13px;
		color: var(--color-text-muted);
		margin-top: 2px;
	}
	.extra {
		margin-top: 8px;
	}
	.actions {
		flex: none;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	/* Stack the actions under the body on narrow cards. */
	@media (max-width: 380px) {
		.wala-requestcard {
			flex-wrap: wrap;
		}
		.actions {
			width: 100%;
			justify-content: flex-end;
		}
	}
</style>
