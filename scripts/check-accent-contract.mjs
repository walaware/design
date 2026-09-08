#!/usr/bin/env node
/**
 * Accent-contract guard.
 *
 * Why this exists: `--acc-trip` (#ff7a59) is byte-identical to `--color-coral-500`, so
 * tripwala's accent IS the coral ramp. A component that hardcodes `--color-coral-*` in an
 * accent role therefore renders correctly in the reference app and wrong in the other six
 * — which is how soft/ghost Button, soft IconButton and all three form focus rings shipped
 * broken through v0.14.1 and were only caught once moneywala (leaf) consumed them.
 *
 * So: any `--color-coral-*` reference inside src/lib/**\/*.svelte is an error unless it is
 * explicitly marked. Write `accent-exempt: <reason>` in a comment above a CSS rule and the
 * exemption covers that whole rule, up to its closing brace — a named-hue tone
 * (`Chip tone="coral"`) is a legitimate use; an accent role is not. Anything meant to stay
 * coral in EVERY app should read `--color-wala` / `--color-wala-soft` instead, which needs
 * no exemption at all.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const LIB = join(ROOT, 'src/lib');
const PATTERN = /--color-coral-\d+/;
const MARKER = 'accent-exempt';

const walk = (dir) =>
	readdirSync(dir).flatMap((entry) => {
		const full = join(dir, entry);
		return statSync(full).isDirectory() ? walk(full) : full.endsWith('.svelte') ? [full] : [];
	});

const violations = [];
let exempt = 0;

for (const file of walk(LIB)) {
	const lines = readFileSync(file, 'utf8').split('\n');
	// The marker opens an exemption that runs to the end of the CSS rule it annotates, so a
	// multi-declaration block needs one comment, not one per line.
	let inExemptRule = false;
	lines.forEach((line, i) => {
		if (line.includes(MARKER)) inExemptRule = true;
		else if (inExemptRule && line.includes('}')) inExemptRule = false;

		if (!PATTERN.test(line)) return;
		if (inExemptRule) {
			exempt++;
			return;
		}
		violations.push({ file: relative(ROOT, file), line: i + 1, text: line.trim() });
	});
}

if (violations.length > 0) {
	console.error('\n✗ Accent-contract violation — hardcoded coral in a component.\n');
	for (const v of violations) console.error(`  ${v.file}:${v.line}\n    ${v.text}`);
	console.error(
		`\n  ${violations.length} unmarked reference(s). Coral is BOTH the house lead and tripwala's` +
			'\n  accent, so this renders correctly in tripwala and wrong in the other six apps.\n' +
			'\n  Fix one of these ways:' +
			'\n    • accent role (primary and its quiet variants) → --color-primary / -soft / -ink / -lip' +
			'\n    • a focus ring                                 → --color-focus-ring + --color-primary-soft' +
			'\n    • coral in EVERY app (the family thread)       → --color-wala / --color-wala-soft' +
			`\n    • a deliberately named hue tone                → put a "${MARKER}: <reason>" comment` +
			'\n      above the rule (it covers the whole rule)\n'
	);
	process.exit(1);
}

console.log(`✓ Accent contract clean — no unmarked coral in components (${exempt} marked exempt).`);
