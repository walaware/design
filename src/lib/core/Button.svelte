<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'accent' | 'soft' | 'ghost';
	type Size = 'sm' | 'md' | 'lg';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		/** Stretch to fill the container width. */
		full?: boolean;
		/** Render as a real link (`<a href>`) styled as a button — for nav. */
		href?: string;
		/** Link target (only with `href`). `_blank` auto-adds a safe `rel`. */
		target?: string;
		/** Link rel (only with `href`). Defaults to `noopener noreferrer` for `target="_blank"`. */
		rel?: string;
		iconLeft?: Snippet;
		iconRight?: Snippet;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		full = false,
		disabled = false,
		href,
		target,
		rel,
		iconLeft,
		iconRight,
		children,
		class: klass = '',
		...rest
	}: Props = $props();

	// A disabled link isn't a real thing — fall back to a real <button disabled>.
	const asLink = $derived(!!href && !disabled);
	// Safe default: target="_blank" without a rel is a reverse-tabnabbing risk.
	const safeRel = $derived(rel ?? (target === '_blank' ? 'noopener noreferrer' : undefined));
</script>

<!--
	Chunky, pill-shaped action with a 3D "lip" that compresses on press —
	the signature Campfire button. `primary` follows the per-app accent.
	Pass `href` to render a real <a> (keeps a nav-styled-as-button a true link).
-->
<svelte:element
	this={asLink ? 'a' : 'button'}
	class="wala-btn v-{variant} s-{size} {full ? 'full' : ''} {klass}"
	href={asLink ? href : undefined}
	target={asLink ? target : undefined}
	rel={asLink ? safeRel : undefined}
	disabled={asLink ? undefined : disabled}
	{...rest}
>
	{#if iconLeft}{@render iconLeft()}{/if}
	{#if children}{@render children()}{/if}
	{#if iconRight}{@render iconRight()}{/if}
</svelte:element>

<style>
	.wala-btn {
		--lip-h: 5px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: auto;
		font-family: var(--font-display);
		font-weight: 600;
		line-height: 1.1;
		border: none;
		border-radius: var(--radius-pill);
		text-decoration: none;
		color: var(--btn-fg);
		background: var(--btn-bg);
		box-shadow: 0 var(--lip-h) 0 var(--btn-lip);
		transform: translateY(0);
		transition:
			transform var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out),
			filter var(--dur-fast);
		cursor: pointer;
	}
	.wala-btn.full {
		width: 100%;
	}
	.wala-btn:active:not(:disabled) {
		transform: translateY(var(--lip-h));
		box-shadow: 0 0 0 var(--btn-lip);
	}
	.wala-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.s-sm {
		--lip-h: 4px;
		font-size: 13px;
		padding: 8px 16px;
	}
	.s-md {
		--lip-h: 5px;
		font-size: 15px;
		padding: 12px 22px;
	}
	.s-lg {
		--lip-h: 6px;
		font-size: 17px;
		padding: 15px 28px;
	}

	.v-primary {
		--btn-bg: var(--color-primary);
		--btn-fg: var(--color-white);
		--btn-lip: var(--color-primary-press);
	}
	.v-secondary {
		--btn-bg: var(--color-sun-400);
		--btn-fg: var(--color-cocoa-900);
		--btn-lip: var(--color-sun-600);
	}
	.v-accent {
		--btn-bg: var(--color-berry-500);
		--btn-fg: var(--color-white);
		--btn-lip: var(--color-berry-600);
	}
	.v-soft {
		--btn-bg: var(--color-coral-200);
		--btn-fg: var(--color-coral-700);
		--btn-lip: var(--color-coral-300);
	}
	.v-ghost {
		--btn-bg: transparent;
		--btn-fg: var(--color-coral-700);
		--btn-lip: transparent;
		border: 2px solid var(--color-coral-300);
		box-shadow: none;
	}
	.v-ghost:active:not(:disabled) {
		transform: none;
		box-shadow: none;
	}
</style>
