---
name: verify
description: How to run and visually verify this app's UI changes (dev server, headless Edge screenshots, CDP interaction).
---

# Verifying UI changes in this repo

## Launch
- The user often already has `next dev` on port 3000 for this dir — check `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` first. A second `pnpm dev` exits 1 ("Another next dev server is already running"); the existing one hot-reloads your edits, use it.
- Backend must be on 8080 (`curl http://localhost:8080/tournaments`) for live data; seed has 4 upcoming tournaments, all starting "Hoy". Without it, calendar queries error into empty states.

## Screenshots (no Playwright in repo)
Headless Edge:
```sh
EDGE="/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
"$EDGE" --headless=new --disable-gpu --window-size=1440,1000 --virtual-time-budget=9000 --screenshot=OUT.png "http://localhost:3000/"
```
- `--virtual-time-budget=9000` lets React Query + FadeContent settle.
- **Gotcha:** widths below ~500px render cut at the right edge — a headless window-width floor, NOT a layout bug (verify by shooting an untouched page at the same width). Use ≥500px for narrow-layout checks.

## Interaction (clicks, scroll state)
Launch with `--remote-debugging-port=9222 --user-data-dir=<tmp>` (no `--screenshot`), then drive CDP from Node (global WebSocket, no deps): fetch `http://127.0.0.1:9222/json`, connect to the page's `webSocketDebuggerUrl`, send `Runtime.evaluate` with `returnByValue: true`. Working example: click `[aria-label="Siguientes"]`, wait ~900ms for smooth scroll, read `strip.scrollLeft` + button `disabled` states.

## Lint/format
- `rtk` proxy filters Biome output and can mask errors ("Lint: No issues found" with exit 1). Use the raw binary: `./node_modules/.bin/biome check <files>` and trust its exit code, or `sh .husky/pre-commit`.
