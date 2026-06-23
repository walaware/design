<script lang="ts">
	import {
		Wordmark,
		AppIcon,
		Button,
		IconButton,
		Card,
		CardHeader,
		Chip,
		Tooltip,
		Avatar,
		AvatarGroup,
		LeanMeter,
		TextField,
		SegmentedControl,
		Composer,
		StatusBadge,
		EmptyState,
		ChatMessage,
		WALA_SUITE,
		type WalaApp
	} from '$lib/index.js';

	const apps = Object.keys(WALA_SUITE) as WalaApp[];

	// Two apps shown full-width to prove the per-app accent contract.
	const demos: { app: WalaApp; root: string }[] = [
		{ app: 'tripwala', root: 'trip' },
		{ app: 'shopwala', root: 'shop' }
	];

	let rsvp = $state('Going');
	const crew = [
		{ name: 'Maya' },
		{ name: 'Arjun' },
		{ name: 'Sam' },
		{ name: 'Priya' },
		{ name: 'Leo' },
		{ name: 'Nina' },
		{ name: 'Theo' }
	];
</script>

{#snippet phone(app: WalaApp, root: string)}
	<div class="phone" data-app={app}>
		<header class="phone-head">
			<AppIcon {app} size={52} />
			<div>
				<Wordmark {root} size={30} />
				<div class="sub">{WALA_SUITE[app].label}</div>
			</div>
		</header>

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
			<CardHeader
				icon="🎒"
				title="What to bring"
				action={bringAction}
			/>
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
			<EmptyState
				emoji="🦗"
				title="It's quiet in here…"
				body="No plans yet — be the first to add one!"
				action="Add a plan ✨"
			/>
		</Card>
	</div>
{/snippet}

{#snippet bringAction()}
	<IconButton aria-label="Add" size={32}>＋</IconButton>
{/snippet}

<main>
	<section class="intro">
		<Wordmark root="design" size={64} />
		<p>
			The <strong>@walaware/design</strong> house style — one warm Campfire language, a per-app accent,
			and the constant coral <code>·wala</code> thread. Below: the same components under two app
			accents. Notice the wordmark suffix stays coral everywhere while every primary action follows
			the app.
		</p>

		<div class="suite">
			{#each apps as app (app)}
				<div class="suite-item" data-app={app}>
					<AppIcon {app} size={64} />
					<Wordmark root={app.replace('wala', '')} size={22} />
				</div>
			{/each}
		</div>
	</section>

	<section class="frames">
		{#each demos as d (d.app)}
			{@render phone(d.app, d.root)}
		{/each}
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
	.frames {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 24px;
		margin-top: 24px;
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
