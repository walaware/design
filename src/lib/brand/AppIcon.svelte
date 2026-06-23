<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { WALA_SUITE, WALA_GLYPHS, type WalaApp } from './suite.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		/** Pull glyph + accent from the suite automatically. */
		app?: WalaApp | null;
		/** Override the Lucide glyph name (key into WALA_GLYPHS). */
		glyph?: string | null;
		/** Override the squircle fill. Defaults to the live --app-accent. */
		accent?: string | null;
		/** Tile size in px. */
		size?: number;
		/** Corner radius in px. Defaults to ~28% of size (squircle). */
		radius?: number | null;
		/** Glyph stroke colour. */
		glyphColor?: string;
		/** Soft accent-tinted drop shadow. */
		shadow?: boolean;
	}

	let {
		app = null,
		glyph = null,
		accent = null,
		size = 96,
		radius = null,
		glyphColor = 'var(--color-white, #fff)',
		shadow = true,
		...rest
	}: Props = $props();

	const entry = $derived(app ? WALA_SUITE[app] : null);
	const name = $derived(glyph ?? entry?.glyph ?? 'compass');
	const inner = $derived(WALA_GLYPHS[name] ?? WALA_GLYPHS.compass);
	const fill = $derived(accent ?? entry?.accent ?? 'var(--app-accent, #ff7a59)');
	const r = $derived(radius != null ? radius : Math.round(size * 0.28));
	const g = $derived(Math.round(size * 0.52));
	const off = $derived(Math.max(4, Math.round(size * 0.08)));
	const boxShadow = $derived(shadow ? `0 ${off}px ${Math.round(size * 0.2)}px -${off}px ${fill}` : 'none');
</script>

<!--
	walaware app icon — the launcher standard. A coloured squircle in the
	app's accent + a single white Lucide glyph. Pass `app` to pull the
	suite's glyph + accent, or set `glyph` / `accent` explicitly.
-->
<span
	role="img"
	aria-label={app ?? name}
	class="wala-appicon"
	style:width="{size}px"
	style:height="{size}px"
	style:border-radius="{r}px"
	style:background={fill}
	style:box-shadow={boxShadow}
	{...rest}
>
	<svg
		width={g}
		height={g}
		viewBox="0 0 24 24"
		fill="none"
		stroke={glyphColor}
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- glyphs are a static, internal allow-list -->
		{@html inner}
	</svg>
</span>

<style>
	.wala-appicon {
		display: inline-grid;
		place-items: center;
		flex: none;
	}
</style>
