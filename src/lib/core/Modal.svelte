<script lang="ts" module>
	import type { Snippet } from 'svelte';

	/** Renderable bit — a plain string/number, or a Snippet for richer nodes. */
	type NodeLike = string | number | Snippet;
</script>

<script lang="ts">
	import IconButton from './IconButton.svelte';

	interface Props {
		/** Whether the dialog is shown. Bindable. */
		open?: boolean;
		/** Header title. Omit for a title-less dialog (still give a `label` for a11y). */
		title?: NodeLike;
		/** aria-label when there's no string `title`. @default "Dialog" */
		label?: string;
		/** Requested close (scrim tap, Esc, or the ✕). The consumer flips `open` to false. */
		onClose?: () => void;
		/** Desktop max width — sm 420 · md 520 · lg 680. @default "md" */
		size?: 'sm' | 'md' | 'lg';
		/** Viewport width (px) below which the dialog becomes a bottom sheet. @default 640 */
		breakpoint?: number;
		/** Allow scrim-tap / Esc to dismiss. @default true */
		dismissible?: boolean;
		/** Hide the default ✕ close button. @default false */
		hideClose?: boolean;
		/** Body content. */
		children?: Snippet;
		/** Optional pinned footer (e.g. action buttons). */
		footer?: Snippet;
		class?: string;
	}

	let {
		open = $bindable(false),
		title,
		label = 'Dialog',
		onClose,
		size = 'md',
		breakpoint = 640,
		dismissible = true,
		hideClose = false,
		children,
		footer,
		class: klass = ''
	}: Props = $props();

	let mobile = $state(false);
	let panelEl = $state<HTMLElement>();

	$effect(() => {
		const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
		const update = () => (mobile = mq.matches);
		update();
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	});

	const requestClose = () => onClose?.();

	const FOCUSABLE =
		'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
	const focusables = (root: HTMLElement): HTMLElement[] =>
		Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
			(el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement
		);

	/* While open: focus-trap the panel, close on Esc, lock the background scroll, and
	   restore focus to whatever opened it on close. Mirrors NotificationBell's dialog. */
	$effect(() => {
		if (!open) return;
		const surface = panelEl;
		const returnTo = document.activeElement as HTMLElement | null;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		queueMicrotask(() => {
			const f = surface ? focusables(surface) : [];
			(f[0] ?? surface)?.focus?.();
		});
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				if (!dismissible) return;
				e.stopPropagation();
				requestClose();
			} else if (e.key === 'Tab' && surface) {
				const f = focusables(surface);
				if (f.length === 0) {
					e.preventDefault();
					surface.focus?.();
					return;
				}
				const first = f[0];
				const last = f[f.length - 1];
				const active = document.activeElement as HTMLElement | null;
				if (e.shiftKey && (active === first || !surface.contains(active))) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && active === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('keydown', onKey);
			document.body.style.overflow = prevOverflow;
			returnTo?.focus?.();
		};
	});

	const onScrim = () => {
		if (dismissible) requestClose();
	};
</script>

{#snippet node(value: NodeLike | undefined | null)}
	{#if typeof value === 'function'}{@render value()}{:else if value != null}{value}{/if}
{/snippet}

<!--
	Modal dialog — a centered card over a scrim on desktop, a bottom sheet on mobile
	(below `breakpoint`). Closes on scrim tap, Esc, or the ✕ (all via `onClose`; set
	`dismissible={false}` to require an explicit action). Focus is trapped inside and
	restored to the opener on close; the background scroll is locked while open.
-->
{#if open}
	<div class="wala-modal {klass}" class:sheet={mobile} role="presentation">
		<!-- Scrim dismiss is a convenience; the keyboard path is Esc + the ✕ button. -->
		<div class="scrim" role="presentation" onclick={onScrim}></div>
		<div
			bind:this={panelEl}
			class="panel s-{size}"
			role="dialog"
			aria-modal="true"
			aria-label={typeof title === 'string' ? title : label}
			tabindex="-1"
		>
			{#if mobile}<div class="grabber"></div>{/if}
			{#if title != null || !hideClose}
				<div class="head" class:untitled={title == null}>
					{#if title != null}<div class="head-title">{@render node(title)}</div>{/if}
					{#if !hideClose}
						<IconButton tone="soft" size={32} onclick={requestClose} aria-label="Close">✕</IconButton>
					{/if}
				</div>
			{/if}
			<div class="body">{@render children?.()}</div>
			{#if footer}<div class="foot">{@render footer()}</div>{/if}
		</div>
	</div>
{/if}

<style>
	.wala-modal {
		position: fixed;
		inset: 0;
		z-index: 80;
		display: grid;
		place-items: center;
		padding: clamp(16px, 4vw, 40px);
	}
	.wala-modal.sheet {
		place-items: end stretch;
		padding: 0;
	}

	.scrim {
		position: absolute;
		inset: 0;
		background: rgba(43, 30, 28, 0.45);
		animation: wala-modal-scrim var(--dur-base) var(--ease-out);
	}

	.panel {
		position: relative;
		z-index: 1;
		width: 100%;
		max-height: min(86vh, 720px);
		display: flex;
		flex-direction: column;
		background: var(--color-surface-card);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-pop);
		overflow: hidden;
		animation: wala-modal-pop var(--dur-base) var(--ease-out);
	}
	.s-sm {
		max-width: 420px;
	}
	.s-md {
		max-width: 520px;
	}
	.s-lg {
		max-width: 680px;
	}

	/* Mobile bottom sheet */
	.sheet .panel {
		max-width: 100%;
		max-height: 88vh;
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		animation: wala-modal-sheet var(--dur-base) var(--ease-out);
	}
	.grabber {
		flex: none;
		width: 38px;
		height: 4px;
		margin: 8px auto 2px;
		border-radius: var(--radius-pill);
		background: var(--color-sand-300);
	}

	.head {
		flex: none;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px 14px 12px 20px;
	}
	.head.untitled {
		justify-content: flex-end;
		padding: 12px 14px 0 20px;
	}
	.head-title {
		flex: 1;
		min-width: 0;
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 18px;
		color: var(--color-text-strong);
	}

	.body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 0 20px 20px;
	}

	.foot {
		flex: none;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;
		padding: 14px 20px calc(16px + env(safe-area-inset-bottom));
		border-top: 1px solid var(--color-sand-200);
	}
	.sheet .foot {
		padding-bottom: calc(20px + env(safe-area-inset-bottom));
	}

	@keyframes wala-modal-scrim {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	@keyframes wala-modal-pop {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
	@keyframes wala-modal-sheet {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.scrim,
		.panel {
			animation: none;
		}
	}
</style>
