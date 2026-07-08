# designer on a headless Linux box

Runbook for driving [`@pro-vi/designer`](https://github.com/pro-vi/designer) — an
MCP/CLI that lets an agent drive **claude.ai/design** (Claude's design tool, which has
no API) with codebase context — from this headless dev server, so the *design* step can
feed our [`design-sync`](../../.claude/skills/design-sync/SKILL.md) pull.

```
brief → designer (drives claude.ai/design in real Chrome, codebase-aware)
      → designer handoff (export zip → project/ + decision-record.md)
      → /design-sync (pull into this repo) → port to Svelte → verify → release → paseo notify app
```

designer is a **design-phase tool, not part of the shipped `@walaware/design` kit** — this
folder is just the ops glue to run it here. It can move to a `walaware/tools` repo later;
nothing in `src/lib` depends on it.

## Status: works on Linux (validated 2026-07-01)

designer runs **stock** on Linux — no fork required. Validated on this box:
`designer doctor` green (agent-browser ✓, CDP ✓, signed in ✓) and `designer health`
**14 ok / 0 fail** (8 state-dependent skips), including the Share → handoff export
endpoint returning `200 application/zip`. Only the mutating `prompt → handoff` rung is
untested (skipped to avoid touching the live design project).

The one blocker on a headless server is the **one-time login** (Cloudflare + Google SSO
block headless Chrome), solved with a virtual display + a localhost VNC over SSH.

## Prerequisites

- **Node ≥ 24** — `agent-browser` requires it (designer itself is fine on ≥22). Use nvm:
  `nvm install 24 && nvm use 24`. Run designer under Node 24.
- **agent-browser** — `npm i -g agent-browser` (installs under the active Node).
- **Chrome** — `/usr/bin/google-chrome` (or set `CHROME_BIN`).
- **Xvfb** + **x11vnc** — `sudo apt install xvfb x11vnc` (Xvfb usually preinstalled).
- A **VNC password** for the one-time login: `x11vnc -storepasswd <pw> ~/.vnc/passwd`.

## First-time login (once per machine)

```bash
# 1. Start the stack WITH vnc for the login
./designer-up.sh up --vnc

# 2. From your laptop, tunnel the localhost-bound VNC (pick any free LOCAL port;
#    5900 is taken by macOS Screen Sharing, so use e.g. 5999):
#      ssh -N -L 5999:localhost:5900 <server>
#    then point a VNC viewer at localhost:5999 (macOS: Finder ⌘K → vnc://localhost:5999)

# 3. In the Chrome window: clear Cloudflare, sign in, land on claude.ai/design.
#    The session persists in ~/.chrome-designer-profile — done once.

# 4. (optional) stop the VNC path; Chrome + Xvfb keep running:
#      pkill -f 'x11vnc .*-rfbport 5900'
```

## Daily use (already logged in)

```bash
./designer-up.sh up            # Xvfb + Chrome (no VNC needed)
./designer-up.sh status        # check what's up + current claude.ai tab
./designer-up.sh down          # stop everything

# Drive designer (Node 24, point it at our CDP Chrome):
nvm use 24
export DESIGNER_CDP=9222 CHROME_BIN=/usr/bin/google-chrome
designer doctor
designer health --json
# designer session --action create --name "…" --key x
# designer prompt "design the …" --key x     # returns a claude.ai/design URL to taste
# designer handoff --key x                    # export → project/ + decision-record.md
```

**Tasting** returns a `claude.ai/design` URL — open it in your **own laptop browser**
(already logged into claude.ai); no server display needed for that.

## Security

- x11vnc binds **127.0.0.1 only** and is password-protected — reachable solely through
  your SSH tunnel, nothing exposed on the LAN/public net.
- The CDP port (9222) is likewise localhost-only.
- Keep VNC running only during the login; `designer-up.sh down` stops all three.

## Linux deltas + upstream patch

designer is ~stock on Linux; two cosmetic/robustness gaps remain, fixed in
[`upstream-linux-support.patch`](./upstream-linux-support.patch) (ready to PR to
`pro-vi/designer`; `git apply` in a clone):

1. `scripts/designer-chrome.sh` defaulted `CHROME` to the macOS path — now resolves
   `CHROME_BIN` → per-OS default (Linux `google-chrome`/`chromium`). *(setup.ts already
   uses the Linux-aware `defaultChromeBin()`, so this only affects the fallback launcher.)*
2. `setup.ts` used BSD `ps -Axww` to verify the debug Chrome's profile — GNU/Linux ps
   rejects `-x` ("must set personality to get -x option"), so the probe silently
   degraded to `unknown` (adopt-ok via the DOM backstop, so usage still worked). Now
   OS-aware: `ps -eww -o command` on non-mac.

The README's "macOS only" banner is stale — `package.json` already declares
`os: [darwin, linux, win32]` and `cross-platform.ts` branches for all three.

We consume upstream `@pro-vi/designer` directly; a fork is only warranted if the PR
stalls. This runbook + `designer-up.sh` are the only Linux-specific pieces we maintain.
