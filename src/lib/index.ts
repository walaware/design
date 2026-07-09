/**
 * @walaware/design — the shared house style for the walaware family of
 * life apps. Design tokens live in `theme.css` (imported separately);
 * this entry point exports the Svelte 5 components and brand registries.
 *
 *   import { Wordmark, AppIcon, Button } from '@walaware/design';
 *   // app css: @import "@walaware/design/theme.css";
 */

// Brand
export { default as Wordmark } from './brand/Wordmark.svelte';
export { default as AppIcon } from './brand/AppIcon.svelte';
export { WALA_SUITE, WALA_GLYPHS, type WalaApp, type WalaSuiteEntry } from './brand/suite.js';

// Core
export { default as Button } from './core/Button.svelte';
export { default as IconButton } from './core/IconButton.svelte';
export { default as Card } from './core/Card.svelte';
export { default as CardHeader } from './core/CardHeader.svelte';
export { default as Chip } from './core/Chip.svelte';
export { default as Tooltip } from './core/Tooltip.svelte';
export { default as Disclosure } from './core/Disclosure.svelte';
export { default as OverflowMenu, type OverflowAction } from './core/OverflowMenu.svelte';

// Shell
export { default as AppShell } from './shell/AppShell.svelte';
export { type NavItem, type ShellAccount, type ShellBack } from './shell/AppShell.svelte';

// Calendar
export { default as CalendarMonth } from './calendar/CalendarMonth.svelte';
export { default as RangeCalendar, type InvalidReason } from './calendar/RangeCalendar.svelte';
export {
	type CalendarEvent,
	type CalendarTone,
	type DateRange,
	type RangeTone
} from './calendar/calendar.js';

// People
export { default as Avatar } from './people/Avatar.svelte';
export { default as AvatarUpload } from './people/AvatarUpload.svelte';
export { default as AvatarGroup } from './people/AvatarGroup.svelte';
export { default as LeanMeter } from './people/LeanMeter.svelte';
export { default as PersonList, type Person } from './people/PersonList.svelte';
export { colorFor } from './people/colors.js';
export { type Lean } from './people/lean.js';

// Forms
export { default as TextField } from './forms/TextField.svelte';
export { default as DateField } from './forms/DateField.svelte';
export { default as SegmentedControl } from './forms/SegmentedControl.svelte';
export { default as Composer } from './forms/Composer.svelte';
export { default as Switch } from './forms/Switch.svelte';
export { default as CopyField } from './forms/CopyField.svelte';

// Feedback
export { default as StatusBadge } from './feedback/StatusBadge.svelte';
export { type Status } from './feedback/status.js';
export { default as EmptyState } from './feedback/EmptyState.svelte';
export { default as ChatMessage } from './feedback/ChatMessage.svelte';
export { default as RequestCard, type RequestPerson } from './feedback/RequestCard.svelte';
export { default as Skeleton } from './feedback/Skeleton.svelte';
export { default as SkeletonText } from './feedback/SkeletonText.svelte';
