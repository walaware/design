<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		Wordmark,
		AppIcon,
		Button,
		IconButton,
		Card,
		CardHeader,
		Chip,
		Tooltip,
		Disclosure,
		OverflowMenu,
		Avatar,
		AvatarUpload,
		AvatarGroup,
		LeanMeter,
		TextField,
		DateField,
		SegmentedControl,
		Composer,
		StatusBadge,
		EmptyState,
		ChatMessage,
		CalendarMonth,
		RequestCard,
		PersonList,
		type CalendarEvent,
		WALA_SUITE,
		type WalaApp
	} from '$lib/index.js';

	const apps = Object.keys(WALA_SUITE) as WalaApp[];

	let rsvp = $state('Going');
	let cond = $state('Used');

	// Calendar demo — owned trips (accent, link through) vs friend teasers (muted, read-only).
	const calEvents: CalendarEvent[] = [
		{ id: 't1', title: 'Tofino', emoji: '🏄', start: '2026-07-08', end: '2026-07-12', tone: 'owned', href: '#' },
		{ id: 't2', title: 'Camp', emoji: '🏕️', start: '2026-07-18', end: '2026-07-19', tone: 'owned', href: '#' },
		{ id: 'f1', title: "Maya · Banff", start: '2026-07-10', end: '2026-07-14', tone: 'teaser' },
		{ id: 'f2', title: "Theo · Portland", start: '2026-07-24', end: '2026-07-26', tone: 'teaser' },
		{ id: 't3', title: 'Day trip', start: '2026-07-11', tone: 'owned', href: '#' }
	];
	let calYear = $state(2026);
	let calMonth = $state(7);
	function stepMonth(delta: number) {
		const m = calMonth + delta;
		if (m < 1) { calMonth = 12; calYear -= 1; }
		else if (m > 12) { calMonth = 1; calYear += 1; }
		else calMonth = m;
	}

	// Friend picker demo.
	let pickFriends = $state<string[]>(['u2']);
	const friends = [
		{ id: 'u1', name: 'Maya', src: photoRef(), meta: '3 trips together' },
		{ id: 'u2', name: 'Arjun', meta: '1 trip together' },
		{ id: 'u3', name: 'Priya' },
		{ id: 'u4', name: 'Leo', meta: 'New friend' }
	];
	function photoRef() {
		return `data:image/svg+xml,${encodeURIComponent(
			"<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' fill='#FFB23E'/></svg>"
		)}`;
	}

	// DateField demo state. `today` bounds the pickers; the range starts empty.
	const today = new Date().toISOString().slice(0, 10);
	let day = $state('');
	let tripStart = $state('');
	let tripEnd = $state('');

	// A self-contained avatar photo (data URI — always loads, no network), so the
	// demo shows a real photo; the "broken" demo uses a URL that 404s → initial.
	const photo = `data:image/svg+xml,${encodeURIComponent(
		"<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#FFB23E'/><stop offset='1' stop-color='#E84F7C'/></linearGradient></defs><rect width='96' height='96' fill='url(#g)'/><circle cx='48' cy='40' r='15' fill='#fff' opacity='.92'/><path d='M22 84a26 22 0 0 1 52 0z' fill='#fff' opacity='.92'/></svg>"
	)}`;
	const brokenPhoto = 'https://invalid.invalid/avatar.jpg';

	const crew = [
		{ name: 'Maya', src: photo },
		{ name: 'Arjun' },
		{ name: 'Sam', src: photo },
		{ name: 'Priya' },
		{ name: 'Leo' },
		{ name: 'Nina' },
		{ name: 'Theo' }
	];
</script>

{#snippet phone(app: WalaApp, root: string, body: Snippet)}
	<div class="phone" data-app={app}>
		<header class="phone-head">
			<AppIcon {app} size={52} />
			<div>
				<Wordmark {root} size={30} />
				<div class="sub">{WALA_SUITE[app].label}</div>
			</div>
		</header>
		{@render body()}
	</div>
{/snippet}

{#snippet tripBody()}
	<Card>
		<CardHeader icon="🔥" title="Who's coming?" />
		<SegmentedControl options={['Going', 'Maybe', 'Out']} bind:value={rsvp} />
		<div class="row gap">
			<AvatarGroup people={crew} max={5} />
			<StatusBadge status="going">3 in</StatusBadge>
		</div>
		<div class="row gap">
			<Button>I'm in! 🙌</Button>
			<Button variant="soft">Maybe</Button>
			<LeanMeter lean={2} />
		</div>
	</Card>

	<Card>
		<CardHeader icon="🎒" title="What to bring" action={bringAction} />
		<div class="claim">
			<span class="claim-emoji">⛺</span>
			<span class="claim-body">
				<span class="claim-name">Tent</span>
				<span class="claim-note">Maya's got it</span>
			</span>
			<Avatar name="Maya" size={28} />
		</div>
		<div class="claim">
			<span class="claim-emoji">🍳</span>
			<span class="claim-body">
				<span class="claim-name">Camp stove</span>
				<span class="claim-note">up for grabs!</span>
			</span>
			<Button variant="secondary" size="sm">Grab it</Button>
		</div>
	</Card>

	<Card>
		<CardHeader icon="💬" title="Trip chat" />
		<ChatMessage system text="Sam started the trip" />
		<ChatMessage name="Maya" text="who's driving? 🚗" time="9:41" />
		<ChatMessage mine text="me! got the big car" time="9:42" />
		<Composer me={{ name: 'You' }} placeholder="Message the crew…" />
	</Card>

	<Card>
		<TextField label="Trip name" prefix="🗺️" placeholder="Weekend in the hills" hint="Sentence case, friendly." />
		<div class="row gap" style="margin-top:12px">
			<Chip tone="coral">2 nights</Chip>
			<Tooltip label="Last polled 2m ago" placement="bottom" tone="light">
				<Chip tone="leaf">4 going</Chip>
			</Tooltip>
			<Chip tone="neutral" outline>+ add tag</Chip>
			<Tooltip label="Auto-send is off — every reply waits for you">
				<IconButton aria-label="Info">ⓘ</IconButton>
			</Tooltip>
			<IconButton aria-label="More">⋯</IconButton>
		</div>
	</Card>

	<Card>
		<CardHeader icon="📅" title="When are we going?" />
		<DateField label="Trip date" bind:value={day} min={today} hint="Pick a day to start." />
		<div style="margin-top:14px">
			<DateField
				range
				label="Trip dates"
				bind:start={tripStart}
				bind:end={tripEnd}
				min={today}
				minNights={2}
				hint={tripStart && tripEnd ? 'Looks good! ✨' : 'At least 2 nights — To can’t come before From.'}
			/>
		</div>
		<!-- Narrow-width proof: a range field two-up inside a 320px box, zero overflow. -->
		<p class="narrow-note">Two-up at 320px (the mobile no-overflow guarantee):</p>
		<div class="narrow">
			<DateField range size="sm" startLabel="Check in" endLabel="Check out" min={today} />
		</div>
	</Card>

	<Card>
		<EmptyState
			emoji="🦗"
			title="It's quiet in here…"
			body="No plans yet — be the first to add one!"
			action="Add a plan ✨"
		/>
	</Card>
{/snippet}

{#snippet shopBody()}
	<Card>
		<CardHeader icon="📷" title="Vintage film camera" />
		<SegmentedControl options={['New', 'Used', 'Any']} bind:value={cond} />
		<div class="row gap">
			<AvatarGroup people={crew} max={5} />
			<StatusBadge status="going">5 watching</StatusBadge>
		</div>
		<div class="row gap">
			<Button>Buy now 🛍️</Button>
			<Button variant="soft">Make offer</Button>
			<LeanMeter lean={1} />
		</div>
	</Card>

	<Card>
		<CardHeader icon="📦" title="Your listings" action={bringAction} />
		<div class="claim">
			<span class="claim-emoji">📷</span>
			<span class="claim-body">
				<span class="claim-name">Film camera</span>
				<span class="claim-note">£60 · top offer from Maya</span>
			</span>
			<Avatar name="Maya" size={28} />
		</div>
		<div class="claim">
			<span class="claim-emoji">🚲</span>
			<span class="claim-body">
				<span class="claim-name">City bike</span>
				<span class="claim-note">open to offers</span>
			</span>
			<Button variant="secondary" size="sm">Offer</Button>
		</div>
	</Card>

	<Card>
		<CardHeader icon="💬" title="Deal chat" />
		<ChatMessage system text="Maya asked about Film camera" />
		<ChatMessage name="Maya" text="would you take £55? 📷" time="9:41" />
		<ChatMessage mine text="deal — it's yours! 🤝" time="9:42" />
		<Composer me={{ name: 'You' }} placeholder="Message the buyer…" />
	</Card>

	<Card>
		<TextField label="Listing title" prefix="🏷️" placeholder="Vintage film camera" hint="Short, honest, searchable." />
		<div class="row gap" style="margin-top:12px">
			<Chip tone="coral">£60</Chip>
			<Tooltip label="Listed 2 days ago" placement="bottom" tone="light">
				<Chip tone="leaf">5 offers</Chip>
			</Tooltip>
			<Chip tone="neutral" outline>+ add tag</Chip>
			<Tooltip label="Offers stay private until you accept one">
				<IconButton aria-label="Info">ⓘ</IconButton>
			</Tooltip>
			<IconButton aria-label="More">⋯</IconButton>
		</div>
	</Card>

	<Card>
		<EmptyState
			emoji="🛒"
			title="No offers yet…"
			body="Share your listing to get the first one in!"
			action="Share listing ✨"
		/>
	</Card>
{/snippet}

{#snippet bringAction()}
	<IconButton aria-label="Add" size={32}>＋</IconButton>
{/snippet}

<main>
	<section class="intro">
		<Wordmark root="design" size={64} />
		<p>
			The <strong>@walaware/design</strong> house style — one warm Campfire language, a per-app accent,
			and the constant coral <code>·wala</code> thread. Below: the same component kit dressed as two
			different apps — <strong>tripwala</strong> and <strong>shopwala</strong>. Notice the wordmark
			suffix stays coral everywhere while every primary action follows the app accent.
		</p>

		<div class="suite">
			{#each apps as app (app)}
				<div class="suite-item" data-app={app}>
					<AppIcon {app} size={64} />
					<Wordmark root={app.replace('wala', '')} size={22} />
				</div>
			{/each}
		</div>

		<div class="avatars">
			<span class="avatars-label">Avatars — photo, graceful fallback:</span>
			<Avatar name="Maya" src={photo} size={48} />
			<Avatar name="Arjun" src={brokenPhoto} size={48} />
			<Avatar name="Sam" size={48} />
			<Avatar name="Leo" emoji="🦊" size={48} />
			<AvatarGroup people={crew} max={5} size={40} />
		</div>

		<div class="avatars">
			<span class="avatars-label">AvatarUpload — editable photo (profile editor):</span>
			<AvatarUpload name="Maya" src={photo} size={72} onPick={(f) => alert('Picked ' + f.name)} />
			<AvatarUpload name="Sam" size={72} onPick={(f) => alert('Picked ' + f.name)} />
		</div>

		<div class="primitives" data-app="shopwala">
			<span class="avatars-label">Disclosure &amp; OverflowMenu — collapse + ⋯ actions:</span>
			<div class="primitives-row">
				<div class="narrow">
					<Disclosure icon="⚙️" summary="Advanced options" defaultOpen={false}>
						<p class="claim-note">Hidden until you ask for it — eases open, chevron flips.</p>
					</Disclosure>
					<Disclosure icon="🛡️" summary="What the agent may send on its own">
						<p class="claim-note">Availability replies, location, scheduling — negotiation always asks you.</p>
					</Disclosure>
				</div>
				<OverflowMenu
					label="Trek road bike · 54cm"
					actions={[
						{ icon: '✅', label: 'Mark sold', onClick: () => alert('Marked sold') },
						{ icon: '🕓', label: 'Mark pending', onClick: () => alert('Marked pending') },
						{ icon: '🔗', label: 'Open listing', onClick: () => alert('Opened') },
						{ icon: '🗑️', label: 'Delete', danger: true, onClick: () => alert('Deleted') }
					]}
				/>
			</div>
		</div>

		<!-- Cascade check: the base reset zeroes heading margins, but a Tailwind
		     utility must still win (resets now live in @layer base). This h2 must
		     compute margin-bottom: 2rem, and the box below it sits 2rem clear. -->
		<div data-cascade-check>
			<h2 class="mb-8">Utility-over-reset check</h2>
			<div>If <code>mb-8</code> wins, there's a 2rem gap above this line.</div>
		</div>

		<p class="shell-link">See the full app chrome — sidebar ⇄ mobile drawer:</p>
		<div class="shell-cta">
			<Button href="/shell" variant="soft" size="sm">Open the AppShell demo →</Button>
		</div>
	</section>

	<section class="social" data-app="tripwala">
		<h2 class="social-h">Calendar, requests &amp; people <span class="tag">v0.7.0</span></h2>
		<p class="social-note">
			The friend-graph &amp; shared-calendar surfaces — generic primitives; the trip/friend
			domain stays in the app.
		</p>
		<div class="social-grid">
			<Card>
				<CalendarMonth
					year={calYear}
					month={calMonth}
					events={calEvents}
					onPrev={() => stepMonth(-1)}
					onNext={() => stepMonth(1)}
					today="2026-07-11"
				/>
				<p class="social-legend">
					<span class="dot owned"></span> your trips &nbsp;
					<span class="dot teaser"></span> friends' shared trips (read-only)
				</p>
			</Card>

			<div class="social-col">
				<RequestCard
					avatar={{ name: 'Maya' }}
					title="Maya wants to be friends"
					meta="3 mutual friends"
					onAccept={() => alert('Accepted')}
					onDecline={() => alert('Declined')}
				/>
				<RequestCard
					emoji="🏄"
					title="Tofino surf weekend"
					meta="Aug 8–12 · Tofino · from Theo"
					onAccept={() => alert('Joined')}
					onDecline={() => alert('Declined')}
				/>
				<Card>
					<CardHeader icon="🧑‍🤝‍🧑" title="Invite friends" />
					<PersonList people={friends} selectable bind:selected={pickFriends} />
					<div class="social-actions">
						<Button variant="primary" size="sm" disabled={pickFriends.length === 0}>
							Invite {pickFriends.length || ''}
						</Button>
					</div>
				</Card>
			</div>
		</div>
	</section>

	<section class="frames">
		{@render phone('tripwala', 'trip', tripBody)}
		{@render phone('shopwala', 'shop', shopBody)}
	</section>
</main>

<style>
	main {
		max-width: 980px;
		margin: 0 auto;
		padding: 40px 20px 80px;
	}
	.intro p {
		max-width: 60ch;
		font-size: 16px;
		color: var(--color-text-body);
		line-height: 1.5;
	}
	.intro code {
		font-family: var(--font-display);
		color: var(--color-wala);
		font-weight: 600;
	}
	.suite {
		display: flex;
		flex-wrap: wrap;
		gap: 22px;
		margin: 24px 0 8px;
	}
	.suite-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}
	.avatars {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
		margin: 18px 0 0;
	}
	.avatars-label {
		font-size: 15px;
		color: var(--color-text-body);
		margin-right: 4px;
	}
	.primitives {
		margin: 22px 0 0;
	}
	.primitives-row {
		display: flex;
		align-items: flex-start;
		gap: 16px;
		margin-top: 10px;
	}
	.shell-link {
		margin: 18px 0 0;
		font-size: 15px;
		color: var(--color-text-body);
	}
	.shell-cta {
		margin: 10px 0 0;
	}
	.frames {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 24px;
		margin-top: 24px;
	}
	.social {
		margin-top: 40px;
	}
	.social-h {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 22px;
		color: var(--color-text-strong);
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.social-h .tag {
		font-family: var(--font-body);
		font-weight: 800;
		font-size: 11px;
		color: var(--color-primary-press);
		background: var(--color-primary-soft);
		padding: 3px 9px;
		border-radius: var(--radius-pill);
	}
	.social-note {
		font-size: 14px;
		color: var(--color-text-muted);
		margin: 6px 0 18px;
		max-width: 60ch;
	}
	.social-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--stack-gap);
		align-items: start;
	}
	.social-col {
		display: flex;
		flex-direction: column;
		gap: var(--stack-gap);
	}
	.social-legend {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 12px 0 0;
		font-size: 12px;
		font-weight: 700;
		color: var(--color-text-muted);
	}
	.social-legend .dot {
		width: 12px;
		height: 12px;
		border-radius: var(--radius-sm);
		display: inline-block;
	}
	.social-legend .dot.owned {
		background: var(--color-primary-soft);
	}
	.social-legend .dot.teaser {
		background: var(--color-sand-200);
	}
	.social-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 12px;
	}
	.phone {
		display: flex;
		flex-direction: column;
		gap: var(--stack-gap);
		background: var(--color-bg-app);
		border-radius: var(--radius-xl);
		padding: 18px;
		box-shadow: var(--shadow-soft);
	}
	.phone-head {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.sub {
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 12.5px;
		color: var(--color-text-muted);
	}
	.row {
		display: flex;
		align-items: center;
	}
	.gap {
		gap: 10px;
		flex-wrap: wrap;
		margin-top: 12px;
	}
	.narrow-note {
		margin: 16px 0 6px;
		font-size: 12.5px;
		font-weight: 700;
		color: var(--color-text-muted);
	}
	.narrow {
		width: 320px;
		max-width: 100%;
		border: 1px dashed var(--color-sand-300);
		border-radius: var(--radius-md);
		padding: 12px;
	}
	/* A "claim row" composed from primitives — the pattern lives in the
	   app, not the shared kit (see README: rule of three). */
	.claim {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 0;
		border-top: 1px solid var(--color-sand-200);
	}
	.claim-emoji {
		width: 40px;
		height: 40px;
		flex: none;
		border-radius: var(--radius-md);
		background: var(--color-sand-200);
		display: grid;
		place-items: center;
		font-size: 19px;
	}
	.claim-body {
		flex: 1;
		min-width: 0;
	}
	.claim-name {
		display: block;
		font-family: var(--font-body);
		font-weight: 800;
		font-size: 15px;
		color: var(--color-text-strong);
	}
	.claim-note {
		display: block;
		font-family: var(--font-body);
		font-weight: 700;
		font-size: 12.5px;
		color: var(--color-text-muted);
	}
</style>
