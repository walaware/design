<script lang="ts">
	import {
		AppShell,
		Card,
		CardHeader,
		Button,
		Chip,
		EmptyState,
		Avatar,
		WALA_SUITE,
		type WalaApp,
		type NavItem
	} from '$lib/index.js';

	const appNames = Object.keys(WALA_SUITE) as WalaApp[];
	let app = $state<WalaApp>('tripwala');
	let screen = $state('home');

	// null = app level (global destinations). A string = a record is open, so the
	// sidebar becomes a section nav (scrollSpy) over one scrollable page.
	let record = $state<string | null>(null);

	// Self-contained avatar photo (data URI) for the signed-in account.
	const photo = `data:image/svg+xml,${encodeURIComponent(
		"<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#FFB23E'/><stop offset='1' stop-color='#E84F7C'/></linearGradient></defs><rect width='96' height='96' fill='url(#g)'/><circle cx='48' cy='40' r='15' fill='#fff' opacity='.92'/><path d='M22 84a26 22 0 0 1 52 0z' fill='#fff' opacity='.92'/></svg>"
	)}`;

	// APP-LEVEL nav — global destinations. `href` makes each row a real <a>;
	// `onClick` still drives screen state + closes the mobile drawer.
	const appNav = $derived<NavItem[]>([
		{ key: 'home', label: 'Home', icon: '🧭', href: '#home', active: screen === 'home', onClick: () => (screen = 'home') },
		{ key: 'today', label: 'Today', icon: '📍', badge: 2, href: '#today', active: screen === 'today', onClick: () => (screen = 'today') },
		{ key: 'crew', label: 'Crew', icon: '👥', href: '#crew', active: screen === 'crew', onClick: () => (screen = 'crew') }
	]);

	// CONTEXTUAL nav — in-page sections (scrollSpy) + a dimmed "soon" group. Each
	// live row targets a <section id>; the shell smooth-scrolls + tracks the active one.
	const sections = [
		{ id: 'overview', icon: '📋', label: 'Overview' },
		{ id: 'crew', icon: '🙌', label: "Who's coming" },
		{ id: 'gear', icon: '🎒', label: 'Gear' },
		{ id: 'expenses', icon: '💰', label: 'Expenses' }
	];
	const recordNav: NavItem[] = [
		...sections.map((s) => ({ key: s.id, label: s.label, icon: s.icon, href: `#${s.id}` })),
		{ key: 'itinerary', label: 'Itinerary', icon: '🗓️', soon: true },
		{ key: 'map', label: 'Map', icon: '🗺️', soon: true },
		{ key: 'photos', label: 'Photos', icon: '📸', soon: true }
	];

	const open = (name: string) => (record = name);
	const close = () => (record = null);
</script>

<AppShell
	{app}
	nav={record ? recordNav : appNav}
	scrollSpy={!!record}
	title={record}
	back={record ? { label: 'All trips', onClick: close } : null}
	account={{
		name: 'Maya',
		avatar: photo,
		onProfile: () => alert('Profile'),
		onSignOut: () => alert('Signed out')
	}}
	onSettings={record ? null : () => (screen = 'settings')}
	settingsActive={screen === 'settings'}
>
	{#if record}
		<!-- CONTEXTUAL MODE: one scrollable page; the sticky header is auto-measured
		     for the scroll offset via [data-appshell-sticky]. -->
		<div class="record-head" data-appshell-sticky>
			<Button variant="ghost" size="sm" onclick={close}>← All trips</Button>
			<h1>{record}</h1>
			<p class="sub">Aug 8–10 · Point Reyes</p>
		</div>

		<div class="stack">
			<section id="overview">
				<Card>
					<CardHeader icon="📋" title="Overview" />
					<p class="card-text">A scrollspy section nav over one long page — no sub-routes. Click a row to smooth-scroll; the active row tracks your scroll position.</p>
					<div class="chips">
						<Chip tone="coral">🎉 4 going</Chip>
						<Chip tone="sun">🤔 2 maybe</Chip>
						<Chip tone="berry">🎒 3 open</Chip>
					</div>
				</Card>
			</section>

			<section id="crew">
				<Card>
					<CardHeader icon="🙌" title="Who's coming" />
					<div class="people">
						<span class="person"><Avatar name="Maya" src={photo} size={30} /> Maya · host</span>
						<span class="person"><Avatar name="Sam" size={30} /> Sam</span>
						<span class="person"><Avatar name="Priya" size={30} /> Priya</span>
					</div>
				</Card>
			</section>

			<section id="gear">
				<Card>
					<CardHeader icon="🎒" title="Gear" />
					<p class="card-text">Claimable items — unclaimed read "up for grabs!".</p>
				</Card>
			</section>

			<section id="expenses">
				<Card>
					<CardHeader icon="💰" title="Expenses" />
					<p class="card-text">Split costs and settle up. The dimmed <strong>Itinerary · Map · Photos</strong> nav rows are roadmap items (<code>soon</code>).</p>
				</Card>
			</section>
		</div>
	{:else}
		<!-- APP LEVEL: global destinations. -->
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
					<CardHeader icon="🧭" title="Open a record" />
					<p class="card-text">
						The same shell flips into a contextual section nav when a destination opens — a back row,
						scrollspy module nav, and the record's name in the mobile top bar.
					</p>
					<Button onclick={() => open('Point Reyes weekend')}>Open a trip →</Button>
				</Card>
			{/if}
		</div>
	{/if}
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

	/* Contextual record header — sticks under the scroll area; [data-appshell-sticky]
	   lets the shell auto-measure the scrollspy offset. */
	.record-head {
		position: sticky;
		top: 0;
		z-index: 5;
		background: var(--color-bg-app);
		padding: 2px 0 14px;
		margin-bottom: var(--stack-gap);
		border-bottom: 1px solid var(--color-sand-300);
	}
	.record-head h1 {
		margin: 6px 0 2px;
	}
	.record-head .sub {
		margin: 0;
		font-weight: 800;
		color: var(--color-primary-press);
	}
	.people {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.person {
		display: flex;
		align-items: center;
		gap: 9px;
		font-weight: 800;
		color: var(--color-text-strong);
	}
	section {
		scroll-margin-top: 96px;
	}
	/* Tall enough that the contextual page overflows the scrollport — so the
	   scrollspy (smooth-scroll + active-on-scroll) is actually exercised. */
	.stack section {
		min-height: 58vh;
	}
</style>
