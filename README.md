# Pawse

A personal purchase decision matrix. When something catches your eye, Pawse walks you through a short series of checks — pace, realness, and fit — to help you decide whether to buy it, wait, or pass. Every check traces back to a real, named difference between purchases that turned out right and ones that didn't.

## How to run

Open `index.html` directly in any browser — no server needed. Double-click the file or drag it into a browser window.

It also works when deployed to any static host (GitHub Pages, Netlify, etc.).

To install as a home screen app: open the hosted URL on your phone and use your browser's "Add to Home Screen" option. The service worker will cache the app shell so it works offline after first load.

## Project layout

```
css/
  main.css          All styles — colors, layout, typography
icons/
  icon-192.svg      App icon at 192 × 192 (PWA / Android)
  icon-512.svg      App icon at 512 × 512 (splash screen / maskable)
js/
  logic.js          Decision flow: stages, questions, state, transitions
  storage.js        localStorage helpers (all keys prefixed pawse:)
  ui.js             Rendering and event binding — entry point
index.html          App shell: meta tags, font links, CSS link, three script tags
manifest.json       Web App Manifest (PWA install metadata)
sw.js               Service worker — caches the app shell for offline use
```

## Shipping updates

Each time you push a change, bump the version in **two places** — keeping them in sync ensures installed PWAs pick up the new files automatically without a force refresh:

1. **`sw.js` line 1** — `const VERSION = '1.1'` → change the string (e.g. `'1.2'`).  
   This renames the service worker cache. On next visit the browser detects that `sw.js` changed, installs the new worker, deletes the old cache, and re-fetches all assets fresh. `skipWaiting` and `clients.claim` make this happen immediately without waiting for tabs to close.

2. **`index.html`** — update the `?v=1.1` query string on the four local asset references (`main.css`, `storage.js`, `logic.js`, `ui.js`) to match.  
   This busts the browser's HTTP cache for users who visit without a service worker installed (first visit, or unsupported browser).

The service worker's fetch handler uses `ignoreSearch: true` when checking the cache, so `?v=1.x` requests are served correctly from cached entries regardless of the query string.

## Editing guide

| What you want to change | Where to look |
|---|---|
| A question, hint, or body text | `js/logic.js` — the `COPY` object at the top |
| Stage labels (eyebrow text) | `js/logic.js` — the `STAGE` object |
| Decision flow or branching | `js/logic.js` — transition functions (`goTo`, `goDontBuy`, etc.) |
| How a screen looks | `js/ui.js` — `screenHTML()` and the HTML helper functions |
| Colors, spacing, typography | `css/main.css` |
| App name, theme color, icons | `manifest.json` |
