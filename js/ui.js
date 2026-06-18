// ══════════════════════════════════════════════════════════════════
// UI — rendering and event handling
//
// To change how a screen looks: edit screenHTML() or historyHTML().
// To change which buttons appear or what they do: edit bindEvents().
// This file contains no branching logic — it only reads state and
// maps it to markup.
// ══════════════════════════════════════════════════════════════════

import {
  STAGE, COPY, state, setRenderCallback,
  goTo, goBack, reset,
  goDontBuy, goBuyIt, goNotYet,
  openHistory, closeHistory, clearHistory,
} from './logic.js';

// ── Inline SVG icons ───────────────────────────────────────────────

const ICON = {
  arrowLeft:  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  history:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95L1 10"/></svg>`,
  x:          `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  rotateCcw:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
  trash2:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  heartGold:  `<svg width="26" height="26" viewBox="0 0 24 24" fill="#C28E2A" stroke="#C28E2A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  heartGreen: `<svg width="24" height="24" viewBox="0 0 24 24" fill="#2F6B45" stroke="#2F6B45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  xRed:       `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#9B3C3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  clockAmber: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#B5762A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
};

const OUTCOME_COLOR = { 'Buy it': '#2F6B45', "Don't buy": '#9B3C3C', 'Not yet': '#B5762A' };

// ── HTML helpers ───────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function navBar() {
  const back = state.screen !== 'start'
    ? `<button class="icon-btn" id="btn-back" aria-label="Back to previous question">${ICON.arrowLeft}</button>`
    : `<span></span>`;
  const hist = state.screen === 'start'
    ? `<button class="icon-btn" id="btn-history" aria-label="View history">${ICON.history}</button>`
    : `<span></span>`;
  return `<div class="nav-bar">${back}${hist}</div>`;
}

function eyebrow(key) {
  return STAGE[key] ? `<div class="eyebrow">${esc(STAGE[key])}</div>` : '';
}

function question(key) {
  const c = COPY[key];
  const hint = c.hint ? `<p class="question-hint">${esc(c.hint)}</p>` : '';
  return `<div class="question-wrap"><h2 class="question-text">${esc(c.question)}</h2>${hint}</div>`;
}

function choice(label, id, primary) {
  const cls = primary ? 'choice choice-primary' : 'choice';
  return `<button class="${cls}" id="${id}">${esc(label)}</button>`;
}

function outcome({ icon, bg, color, title, subtitle, bodyText }) {
  const sub  = subtitle ? `<p class="outcome-sub">${esc(subtitle)}</p>` : '';
  const body = bodyText ? `<p class="outcome-body">${esc(bodyText)}</p>` : '';
  return `<div class="outcome-wrap">
    <div class="outcome-icon" style="background:${bg}">${icon}</div>
    <h2 class="outcome-title" style="color:${color}">${esc(title)}</h2>
    ${sub}${body}
    <button class="restart-btn" id="btn-restart">${ICON.rotateCcw} Start over</button>
  </div>`;
}

// ── Screen templates ───────────────────────────────────────────────

function screenHTML() {
  const s = state.screen;

  if (s === 'start') return `
    <div class="start-wrap">
      <div class="pulse-wrap">
        <div class="pulse-bg"></div>
        <span class="pulse-icon">${ICON.heartGold}</span>
      </div>
      <h1 class="start-title">Feel the pull</h1>
      <p class="start-sub">What's pulling at you right now?</p>
      <input id="item-input" type="text" class="text-input"
        placeholder="e.g. that lens, those shoes…"
        value="${esc(state.itemName)}" />
      ${choice('Walk through it →', 'btn-start', true)}
    </div>`;

  if (s === 'urgent') return `
    ${eyebrow(s)}${question(s)}
    ${choice('Feels urgent', 'btn-urgent-yes')}
    ${choice('Can decide later instead', 'btn-urgent-no')}`;

  if (s === 'scarcity') return `
    ${eyebrow(s)}${question(s)}
    ${choice('It's genuinely scarce', 'btn-scarce-yes')}
    ${choice('I'm just impatient', 'btn-scarce-no')}`;

  if (s === 'createSpace') return `
    ${eyebrow(s)}${question(s)}
    <p class="body-text">${esc(COPY.createSpace.body)}</p>
    ${choice('I've created that space — continue', 'btn-space-created', true)}`;

  if (s === 'trackRecord') return `
    ${eyebrow(s)}${question(s)}
    ${choice('Strong history with this exact thing', 'btn-track-yes')}
    ${choice('No real history with it', 'btn-track-no')}`;

  if (s === 'tested') return `
    ${eyebrow(s)}${question(s)}
    ${choice('Yes, I've actually tried it', 'btn-tested-yes')}
    ${choice('Not yet — only imagined it', 'btn-tested-no')}`;

  if (s === 'notYet') return outcome({
    icon: ICON.clockAmber, bg: '#F4E8D6', color: '#B5762A',
    title: 'Not yet',
    subtitle: 'This isn't a no — find a way to test it first.',
    bodyText: 'Try it, borrow it, ask someone who's used it, or just let time pass and see if the want survives.',
  });

  if (s === 'feel') return `
    ${eyebrow(s)}${question(s)}
    ${choice('It felt like joy', 'btn-feel-joy')}
    ${choice('It felt neutral', 'btn-feel-neutral')}`;

  if (s === 'habit') return `
    ${eyebrow(s)}${question(s)}
    ${choice('Fits a habit I already have', 'btn-habit-yes')}
    ${choice('Would need a new habit', 'btn-habit-no')}`;

  if (s === 'replacement') return `
    ${eyebrow(s)}${question(s)}
    ${choice('Yes, replacing something', 'btn-replace-yes')}
    ${choice('No, not replacing anything', 'btn-replace-no')}`;

  if (s === 'alreadyGone') return `
    ${eyebrow(s)}${question(s)}
    ${choice('Already gone', 'btn-gone-yes')}
    ${choice('Still just planned', 'btn-gone-no')}`;

  if (s === 'space') {
    const warn = state.stillPlanned
      ? `<p class="still-planned-note">Remember: answer as if nothing has left yet.</p>`
      : '';
    return `
      ${eyebrow(s)}${question(s)}
      ${warn}
      ${choice('No, it fits', 'btn-space-fits')}
      ${choice('Yes, it overflows', 'btn-space-overflow')}`;
  }

  if (s === 'cycle') return `
    ${eyebrow(s)}${question(s)}
    ${choice('Stays clear', 'btn-cycle-clear')}
    ${choice('Deepens it', 'btn-cycle-deepen')}`;

  if (s === 'dontBuy') return outcome({
    icon: ICON.xRed, bg: '#F3E2E0', color: '#9B3C3C',
    title: 'Don't buy',
    subtitle: state.dontBuyReason,
  });

  if (s === 'buyIt') return outcome({
    icon: ICON.heartGreen, bg: '#DFF0E4', color: '#2F6B45',
    title: 'Buy it',
    subtitle: 'Every check held. Go ahead.',
  });

  return '';
}

function historyHTML() {
  let body = '';
  if (state.historyState === 'loading') {
    body = `<p class="history-msg">Loading past entries…</p>`;
  } else if (state.historyState === 'error') {
    body = `<p class="history-error">Couldn't load history. Try again later.</p>`;
  } else if (state.history.length === 0) {
    body = `<p class="history-msg">Nothing logged yet — entries appear here once you reach an outcome.</p>`;
  } else {
    const rows = state.history.map(h => {
      const color = OUTCOME_COLOR[h.outcome] || '#6E6380';
      const reason = h.reason ? `<p class="history-entry-reason">${esc(h.reason)}</p>` : '';
      const d = new Date(h.date);
      const ds = d.toLocaleDateString() + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `<div class="history-entry">
        <div class="history-entry-top">
          <span class="history-entry-name">${esc(h.itemName)}</span>
          <span class="history-badge" style="color:${color}">${esc(h.outcome)}</span>
        </div>
        ${reason}
        <p class="history-entry-date">${ds}</p>
      </div>`;
    }).join('');
    body = `<div class="history-list">${rows}</div>
      <button class="clear-btn" id="btn-clear-history">${ICON.trash2} Clear history</button>`;
  }
  return `<div>
    <div class="history-header">
      <h2 class="history-title">History</h2>
      <button class="icon-btn" id="btn-close-history" aria-label="Close history">${ICON.x}</button>
    </div>
    ${body}
  </div>`;
}

// ── Render ─────────────────────────────────────────────────────────

export function render() {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = state.showHistory ? historyHTML() : navBar() + screenHTML();
  bindEvents();
}

function on(id, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', fn);
}

function bindEvents() {
  // Navigation
  on('btn-back',          goBack);
  on('btn-history',       openHistory);
  on('btn-close-history', closeHistory);
  on('btn-clear-history', clearHistory);
  on('btn-restart',       reset);

  // Start screen: keep itemName in sync; allow Enter to proceed
  const inp = document.getElementById('item-input');
  if (inp) {
    inp.addEventListener('input', e => { state.itemName = e.target.value; });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') goTo('urgent'); });
    inp.focus();
    inp.setSelectionRange(inp.value.length, inp.value.length);
  }

  // Question screens
  on('btn-start',           () => goTo('urgent'));
  on('btn-urgent-yes',      () => goTo('scarcity'));
  on('btn-urgent-no',       () => goTo('trackRecord'));
  on('btn-scarce-yes',      () => goTo('trackRecord'));
  on('btn-scarce-no',       () => goTo('createSpace'));
  on('btn-space-created',   () => goTo('trackRecord'));
  on('btn-track-yes',       () => goTo('habit'));
  on('btn-track-no',        () => goTo('tested'));
  on('btn-tested-yes',      () => goTo('feel'));
  on('btn-tested-no',       goNotYet);
  on('btn-feel-joy',        () => goTo('habit'));
  on('btn-feel-neutral',    () => goDontBuy('Not real enough — testing came back neutral'));
  on('btn-habit-yes',       () => goTo('replacement'));
  on('btn-habit-no',        () => goDontBuy('Would need a new habit to actually use it'));
  on('btn-replace-yes',     () => goTo('alreadyGone'));
  on('btn-replace-no',      () => goTo('space', () => { state.stillPlanned = false; }));
  on('btn-gone-yes',        () => goTo('space', () => { state.stillPlanned = false; }));
  on('btn-gone-no',         () => goTo('space', () => { state.stillPlanned = true; }));
  on('btn-space-fits',      () => goTo('cycle'));
  on('btn-space-overflow',  () => goDontBuy('Overflows the space made for it'));
  on('btn-cycle-clear',     goBuyIt);
  on('btn-cycle-deepen',    () => goDontBuy('Deepens the stuckness'));
}

// ── Bootstrap ──────────────────────────────────────────────────────

// Give logic.js a reference to render so state transitions can
// trigger re-renders without logic.js importing ui.js.
setRenderCallback(render);

render();

// Service worker — offline support (requires HTTPS or localhost)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
