# Pawse

A personal purchase decision matrix. When something catches your eye, Pawse walks you through a short series of checks — pace, realness, and fit — to help you decide whether to buy it, wait, or pass. Every check traces back to a real, named difference between purchases that turned out right and ones that didn't.

## How to run

Serve the folder with any static file server. The simplest option with no install:

```sh
npx serve .
```

Then open `http://localhost:3000` in your browser.

ES modules and the service worker both require HTTP (not `file://`), so opening `index.html` directly won't work. Any static server will do — `npx serve`, Python's `http.server`, Caddy, nginx, etc.

To install as a home screen app: open the served URL on your phone and use your browser's "Add to Home Screen" option. The service worker will cache the app shell so it works offline after first load.

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
index.html          App shell: meta tags, font links, CSS link, module script
manifest.json       Web App Manifest (PWA install metadata)
sw.js               Service worker — caches the app shell for offline use
```

## Editing guide

| What you want to change | Where to look |
|---|---|
| A question, hint, or body text | `js/logic.js` — the `COPY` object at the top |
| Stage labels (eyebrow text) | `js/logic.js` — the `STAGE` object |
| Decision flow or branching | `js/logic.js` — transition functions (`goTo`, `goDontBuy`, etc.) |
| How a screen looks | `js/ui.js` — `screenHTML()` and the HTML helper functions |
| Colors, spacing, typography | `css/main.css` |
| App name, theme color, icons | `manifest.json` |
