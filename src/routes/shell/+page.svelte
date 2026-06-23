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

	const nav = $derived<NavItem[]>([
		{ key: 'home', label: 'Home', icon: '🧭', active: screen === 'home', onClick: () => (screen = 'home') },
		{ key: 'today', label: 'Today', icon: '📍', badge: 2, active: screen === 'today', onClick: () => (screen = 'today') },
		{ key: 'crew', label: 'Crew', icon: '👥', active: screen === 'crew', onClick: () => (screen = 'crew') }
	]);
</script>

<AppShell
	{app}
	{nav}
	account={{ name: 'Maya', color: 'var(--color-av-1)', onSignOut: () => alert('Signed out') }}
	onSettings={() => (screen = 'settings')}
	settingsActive={screen === 'settings'}
>
	<h1 style="margin-bottom:6px">{screen === 'settings' ? 'Settings' : WALA_SUITE[app].label}</h1>
	<p style="color:var(--color-text-body);margin:0 0 18px">
		Resize below 920px to collapse the sidebar into the top-bar + drawer. Switch app to watch the
		accent (and the active nav row) recolor — while the coral <code>·wala</code> in the wordmark stays put.
	</p>

	<Card>
		<CardHeader icon="🎨" title="Switch app accent" />
		<div style="display:flex;flex-wrap:wrap;gap:8px">
			{#each appNames as a (a)}
				<button
					onclick={() => (app = a)}
					style="border:none;background:none;cursor:pointer;padding:0"
				>
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
			<p style="margin:0 0 12px;color:var(--color-text-body)">
				Nav clicks set the active row and close the mobile drawer. Settings + account live in the
				sidebar footer and the mobile top bar.
			</p>
			<Button>Primary action</Button>
		</Card>
	{/if}
</AppShell>
