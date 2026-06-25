<script lang="ts">
	import Avatar from './Avatar.svelte';

	interface Props {
		/** Name behind the coloured-initial fallback (when there's no photo). */
		name?: string;
		/** Explicit colour; `null`/omitted derives a stable colour from the name. */
		color?: string | null;
		/** Current photo URL; falls back to the coloured initial when missing. */
		src?: string | null;
		/** Diameter in px. Profile editors typically use a large avatar (96+). */
		size?: number;
		/** Called with the chosen File when the user picks a new photo. */
		onPick?: (file: File) => void;
		/** Show a local preview of the picked file immediately (default true). */
		preview?: boolean;
		/** Accepted file types for the picker. */
		accept?: string;
		/** Accessible label for the control. */
		label?: string;
		/** Disable picking (e.g. while a save is in flight). */
		disabled?: boolean;
	}

	let {
		name = '?',
		color = null,
		src = null,
		size = 96,
		onPick,
		preview = true,
		accept = 'image/*',
		label = 'Change photo',
		disabled = false
	}: Props = $props();

	let input = $state<HTMLInputElement>();
	let previewSrc = $state<string | null>(null);

	/** Revoke the object URL we created so picking repeatedly doesn't leak blobs. */
	const revoke = () => {
		if (previewSrc) URL.revokeObjectURL(previewSrc);
		previewSrc = null;
	};

	const onChange = (e: Event) => {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;
		if (preview) {
			revoke();
			previewSrc = URL.createObjectURL(file);
		}
		onPick?.(file);
	};

	// A new `src` from the consumer (e.g. after a successful upload) supersedes the
	// local preview — drop ours so we show the canonical photo, not a stale blob.
	$effect(() => {
		src;
		revoke();
	});
	// Revoke on teardown.
	$effect(() => revoke);

	/** Badge scales with the avatar but never gets too small to tap. */
	const badge = $derived(Math.max(22, Math.round(size * 0.34)));
	const glyph = $derived(Math.round(badge * 0.56));
	const shown = $derived(previewSrc ?? src);
</script>

<!--
	Editable avatar — the photo affordance for profile editors across the suite.
	Composes the presentational `Avatar`, overlaying a camera badge and wiring a
	hidden file input. Picking a photo calls `onPick(file)` (the app uploads it)
	and, by default, previews it locally right away. Keyboard-operable: the badge
	is a real button; the file input sits outside the tab order and is triggered
	by it.
-->
<div class="wala-avatar-upload" style:width="{size}px" style:height="{size}px">
	<Avatar {name} {color} src={shown} {size} />

	<input
		bind:this={input}
		type="file"
		{accept}
		class="file"
		tabindex="-1"
		aria-hidden="true"
		onchange={onChange}
	/>

	<button
		type="button"
		class="badge"
		style:width="{badge}px"
		style:height="{badge}px"
		onclick={() => input?.click()}
		aria-label={label}
		{disabled}
	>
		<svg
			width={glyph}
			height={glyph}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path
				d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"
			/>
			<circle cx="12" cy="13" r="3" />
		</svg>
	</button>
</div>

<style>
	.wala-avatar-upload {
		position: relative;
		display: inline-block;
		flex: none;
		line-height: 0;
	}

	/* Hidden but still in the DOM so the badge button can trigger it. Not in the
	   tab order (the button is the focusable affordance). */
	.file {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
	}

	/* Camera badge — bottom-right, on the accent, with a white ring so it reads
	   off any photo. The interactive bit, so it carries hover/focus affordance. */
	.badge {
		position: absolute;
		right: 0;
		bottom: 0;
		display: grid;
		place-items: center;
		padding: 0;
		border: 2px solid var(--color-white);
		border-radius: var(--radius-pill);
		background: var(--color-primary);
		color: var(--color-white);
		cursor: pointer;
		box-shadow: 0 1px 3px rgba(58, 45, 40, 0.22);
		transition:
			transform var(--dur-fast) var(--ease-out),
			background var(--dur-fast) var(--ease-out),
			box-shadow var(--dur-fast) var(--ease-out);
	}
	.badge:hover {
		background: var(--color-primary-press);
		transform: scale(1.08);
	}
	.badge:focus-visible {
		outline: none;
		box-shadow: 0 0 0 3px var(--color-primary-soft);
	}
	.badge:disabled {
		opacity: 0.5;
		cursor: default;
		transform: none;
	}
</style>
