#!/usr/bin/env bash
# designer-up.sh — bring up (or tear down) the headless-Linux stack that lets
# `@pro-vi/designer` drive claude.ai/design on a display-less dev server.
#
#   Xvfb :99  →  headed Chrome (CDP :9222, dedicated profile)  →  x11vnc (login only)
#
# designer + agent-browser then drive the logged-in Chrome over CDP with no
# display. The VNC path is only needed for the ONE-TIME interactive login
# (Cloudflare + Google SSO block headless), and is bound to localhost — reach it
# through an SSH tunnel:  ssh -N -L 5999:localhost:5900 <server>  → VNC to :5999.
#
# Usage:
#   ./designer-up.sh up          start Xvfb + Chrome (assumes already logged in)
#   ./designer-up.sh up --vnc    also start x11vnc for a first-time login
#   ./designer-up.sh status      show what's running
#   ./designer-up.sh down        stop x11vnc + Chrome + Xvfb
#
# Requires: Xvfb, google-chrome/chromium, x11vnc (for --vnc), and (for designer
# itself) Node >=24 + `npm i -g agent-browser`. See README.md.
set -euo pipefail

DISP="${DESIGNER_DISPLAY:-:99}"
PORT="${DESIGNER_CDP:-9222}"
VNC_PORT="${DESIGNER_VNC_PORT:-5900}"
PROFILE="${DESIGNER_PROFILE:-$HOME/.chrome-designer-profile}"
LOGDIR="${DESIGNER_LOGDIR:-$HOME/.designer-run}"
mkdir -p "$LOGDIR"

# Chrome resolution: CHROME_BIN wins, else first present Linux binary.
if [ -n "${CHROME_BIN:-}" ]; then CHROME="$CHROME_BIN"; else
  for c in /usr/bin/google-chrome /usr/bin/google-chrome-stable /usr/bin/chromium /usr/bin/chromium-browser; do
    [ -x "$c" ] && CHROME="$c" && break
  done
fi
CHROME="${CHROME:-/usr/bin/google-chrome}"

cdp_up()  { curl -fs -o /dev/null "http://127.0.0.1:$PORT/json/version"; }
xvfb_up() { xdpyinfo -display "$DISP" >/dev/null 2>&1; }
vnc_up()  { ss -ltn 2>/dev/null | grep -q "127.0.0.1:$VNC_PORT"; }

start_xvfb() {
  if xvfb_up; then echo "[xvfb] $DISP already up"; return; fi
  setsid nohup Xvfb "$DISP" -screen 0 1600x1000x24 -nolisten tcp >"$LOGDIR/xvfb.log" 2>&1 &
  for _ in $(seq 1 20); do xvfb_up && break; sleep 0.3; done
  xvfb_up && echo "[xvfb] $DISP up" || { echo "[xvfb] FAILED (see $LOGDIR/xvfb.log)"; exit 1; }
}

start_chrome() {
  if cdp_up; then echo "[chrome] CDP :$PORT already up"; return; fi
  [ -x "$CHROME" ] || { echo "[chrome] not found: $CHROME (set CHROME_BIN)"; exit 1; }
  DISPLAY="$DISP" setsid nohup "$CHROME" \
    --remote-debugging-port="$PORT" \
    --user-data-dir="$PROFILE" \
    --no-first-run --no-default-browser-check \
    --disable-search-engine-choice-screen \
    --disable-gpu --disable-dev-shm-usage \
    "https://claude.ai/design" >"$LOGDIR/chrome.log" 2>&1 &
  for _ in $(seq 1 40); do cdp_up && break; sleep 0.5; done
  cdp_up && echo "[chrome] CDP :$PORT up ($(curl -fs "http://127.0.0.1:$PORT/json/version" | sed -n 's/.*"Browser": *"\([^"]*\)".*/\1/p'))" \
         || { echo "[chrome] FAILED (see $LOGDIR/chrome.log)"; exit 1; }
}

start_vnc() {
  command -v x11vnc >/dev/null || { echo "[vnc] x11vnc not installed (sudo apt install x11vnc)"; exit 1; }
  [ -f "$HOME/.vnc/passwd" ] || { echo "[vnc] no ~/.vnc/passwd — run: x11vnc -storepasswd <pw> ~/.vnc/passwd"; exit 1; }
  if vnc_up; then echo "[vnc] already on 127.0.0.1:$VNC_PORT"; return; fi
  x11vnc -display "$DISP" -rfbauth "$HOME/.vnc/passwd" -localhost -rfbport "$VNC_PORT" \
    -forever -shared -bg -o "$LOGDIR/x11vnc.log" >/dev/null 2>&1
  sleep 1
  vnc_up && echo "[vnc] 127.0.0.1:$VNC_PORT — tunnel: ssh -N -L 5999:localhost:$VNC_PORT <server>, then VNC to localhost:5999" \
         || { echo "[vnc] FAILED (see $LOGDIR/x11vnc.log)"; exit 1; }
}

case "${1:-up}" in
  up)
    start_xvfb; start_chrome
    [ "${2:-}" = "--vnc" ] && start_vnc || true
    echo "[ok] designer stack ready on $DISP (CDP :$PORT). Run designer with DESIGNER_CDP=$PORT under Node 24."
    ;;
  status)
    echo "xvfb $DISP : $(xvfb_up && echo UP || echo down)"
    echo "chrome CDP : $(cdp_up && echo "UP $(curl -fs http://127.0.0.1:$PORT/json/version | sed -n 's/.*"Browser": *"\([^"]*\)".*/\1/p')" || echo down)"
    echo "x11vnc     : $(vnc_up && echo "UP (127.0.0.1:$VNC_PORT)" || echo down)"
    cdp_up && echo "tab        : $(curl -fs http://127.0.0.1:$PORT/json | sed -n 's/.*"url": *"\([^"]*claude.ai[^"]*\)".*/\1/p' | head -1)"
    ;;
  down)
    pkill -f "x11vnc .*-rfbport $VNC_PORT" 2>/dev/null && echo "[vnc] stopped" || true
    pkill -f "remote-debugging-port=$PORT" 2>/dev/null && echo "[chrome] stopped" || true
    pkill -f "Xvfb $DISP" 2>/dev/null && echo "[xvfb] stopped" || true
    ;;
  *) echo "usage: $0 {up [--vnc]|status|down}"; exit 2 ;;
esac
