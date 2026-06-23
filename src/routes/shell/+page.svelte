<script lang="ts">
	import {
		AppShell,
		Card,
		CardHeader,
		Button,
		Chip,
		EmptyState,
		WALA_SUITE,
		type WalaApp,
		type NavItem
	} from '$lib/index.js';

	const appNames = Object.keys(WALA_SUITE) as WalaApp[];
	let app = $state<WalaApp>('tripwala');
	let screen = $state('home');

	// Self-contained avatar photo (data URI) for the signed-in account.
	const photo = `data:image/svg+xml,${encodeURIComponent(
		"<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#FFB23E'/><stop offset='1' stop-color='#E84F7C'/></linearGradient></defs><rect width='96' height='96' fill='url(#g)'/><circle cx='48' cy='40' r='15' fill='#fff' opacity='.92'/><path d='M22 84a26 22 0 0 1 52 0z' fill='#fff' opacity='.92'/></svg>"
	)}`;

	// `href` renders each row as a real <a> (cmd/middle-click works); `onClick`
	// still drives the in-page screen state and closes the mobile drawer.
	const nav = $derived<NavItem[]>([
		{ key: 'home', label: 'Home', icon: '🧭', href: '#home', active: screen === 'home', onClick: () => (screen = 'home') },
		{ key: 'today', label: 'Today', icon: '📍', badge: 2, href: '#today', active: screen === 'today', onClick: () => (screen = 'today') },
		{ key: 'crew', label: 'Crew', icon: '👥', href: '#crew', active: screen === 'crew', onClick: () => (screen = 'crew') }
	]);
</script>

<AppShell
	{app}
	{nav}
	account={{ name: 'Maya', avatar: photo, onSignOut: () => alert('Signed out') }}
	onSettings={() => (screen = 'settings')}
	settingsActive={screen === 'settings'}
>
	<div class="stack">
		<div class="backrow">
			<Button href="/" variant="ghost" size="sm">← Components</Button>
		</div>
		<h1>{screen === 'settings' ? 'Settings' : WALA_SUITE[app].label}</h1>
		<p class="lead">
			Resize below 920px to collapse the sidebar into the top-bar + drawer. Switch app to watch the
			accent (and the active nav row) recolor — while the coral <code>·wala</code> in the wordmark stays put.
		</p>

		<Card>
			<CardHeader icon="🎨" title="Switch app accent" />
			<div class="chips">
				{#each appNames as a (a)}
					<button class="chip-btn" onclick={() => (app = a)}>
						<Chip tone={a === app ? 'coral' : 'neutral'} outline={a !== app}>{a}</Chip>
					</button>
				{/each}
			</div>
		</Card>

		{#if screen === 'crew'}
			<Card>
				<EmptyState emoji="👋" title="No crew yet" body="Invite people to see them here." action="Invite ✨" />
			</Card>
		{:else}
			<Card>
				<CardHeader icon="✅" title="It works" />
				<p class="card-text">
					Nav clicks set the active row and close the mobile drawer. Settings + account live in the
					sidebar footer and the mobile top bar.
				</p>
				<Button>Primary action</Button>
			</Card>
		{/if}
	</div>

</AppShell>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		gap: var(--stack-gap);
	}
	.backrow {
		margin-bottom: 2px;
	}
	.stack h1 {
		margin: 4px 0 0;
	}
	.lead {
		margin: 0;
		color: var(--color-text-body);
	}
	.card-text {
		margin: 2px 0 14px;
		color: var(--color-text-body);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.chip-btn {
		border: none;
		background: none;
		cursor: pointer;
		padding: 0;
	}
	.stack code {
		font-family: var(--font-display);
		color: var(--color-wala);
		font-weight: 600;
	}
</style>
