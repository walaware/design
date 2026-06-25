# design-sync staging

Staging area for **repo-originated** component contracts waiting to be **pushed up** to the
**walaware Design System** Claude Design project (the React `.jsx` reference + `.d.ts` contract +
`.prompt.md` are the upstream source of truth — see `AGENTS.md` and the `design-sync` skill).

These files are **not** part of the shipped package (they live outside `src/lib`, so
svelte-package and `tsconfig` ignore them) and **not** the runtime implementation — that's the
Svelte component under `src/lib/`. They're here so the upstream push is a trivial follow-up.

## Pending push

- **`DateField/`** — new primitive (single date / range). Implemented in Svelte at
  `src/lib/forms/DateField.svelte`. The upstream push could not run in this environment because
  the **DesignSync MCP needs `/design-login`** (interactive terminal). To complete the sync:
  1. Run `/design-login`, then `/design-sync` (push direction).
  2. `list_files` the project to confirm the exact target paths for forms components.
  3. `finalize_plan` → `write_files` these three files (`DateField.jsx`, `DateField.d.ts`,
     `DateField.prompt.md`) into that path; read one back to verify.

Once pushed and confirmed upstream, this staging copy can be removed.
