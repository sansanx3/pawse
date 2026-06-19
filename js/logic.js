// ══════════════════════════════════════════════════════════════════
// DECISION LOGIC — stage labels, question copy, state, transitions
//
// To change a question or hint: edit COPY below.
// To change the flow or branching: edit the transition functions.
// This file has no knowledge of the DOM or how screens are rendered.
// ══════════════════════════════════════════════════════════════════

// ── Stage labels (eyebrow text shown above each question) ──────────

const STAGE = {
  urgent:      'Pace check',
  scarcity:    'Pace check',
  createSpace: 'Pace check',
  trackRecord: 'Realness check',
  tested:      'Realness check',
  gladness:    'Realness check',
  feel:        'Realness check',
  habit:       'Fit check',
  replacement: 'Fit check',
  alreadyGone: 'Fit check',
  space:       'Fit check',
  cycle:       'Fit check',
};

// ── All question text, hints, and body copy ────────────────────────

const COPY = {
  urgent: {
    question: 'Feels urgent?',
    hint: 'Most “decide now” feelings turn out to be false alarms.',
  },
  scarcity: {
    question: 'Real, or just impatience?',
    hint: 'Real scarcity happens sometimes — but usually this is about not wanting to wait, not the item disappearing.',
  },
  createSpace: {
    question: 'Create space',
    body: 'Wait. Sleep on it. Revisit later. Only come back to this once the urgency has actually cooled — there’s no rush to press on right now.',
  },
  trackRecord: {
    question: 'Real history with this exact thing?',
    hint: 'Liking the brand or category isn’t the same as having proof with this exact thing.',
  },
  tested: {
    question: 'Tried it, not just imagined?',
    hint: 'An imagined want and a tested one are different things — testing tells the truth before money does.',
  },
  gladness: {
    question: "If this disappoints — am I still glad I have it?",
    hint: "This is about whether the relationship with this item can survive disappointment — not about whether it'll perform well or get used.",
  },
  feel: {
    question: 'Joy, or just neutral?',
    hint: 'Neutral isn’t a soft yes — it’s the same signal that predicted regret before.',
  },
  habit: {
    question: 'New habit, or fits one I have?',
    hint: 'Loving something doesn’t guarantee it gets used — it has to fit a rhythm already being lived, not a new one.',
  },
  replacement: {
    question: 'Replacing something I own?',
    hint: 'A planned swap doesn’t free up space until it actually happens.',
  },
  alreadyGone: {
    question: 'Already gone, or still planned?',
    hint: 'This decides whether the space check gets to count space that hasn’t really been freed yet.',
  },
  space: {
    question: 'Overflows the space I’ve made?',
    hint: 'The feeling that actually makes “no” stick — more than any abstract clutter-avoidance rule.',
  },
  cycle: {
    question: 'Deepens the stuckness?',
    hint: '“Stuckness” means the trapped feeling at month-end — not the dollar amount itself.',
  },
};

// ── App state ──────────────────────────────────────────────────────

const state = {
  screen:       'start',
  itemName:     '',
  stillPlanned: false,
  dontBuyReason: '',
  showHistory:  false,
  history:      [],
  historyState: 'idle',  // idle | loading | ready | error
  navStack:     [],      // [{ screen, stillPlanned }]
};

// ui.js injects its render function here so logic can trigger re-renders
// without creating a circular import between logic ↔ ui.
let _render = () => {};
function setRenderCallback(fn) { _render = fn; }

// ── Navigation ─────────────────────────────────────────────────────

function goTo(next, sideEffect) {
  state.navStack = [...state.navStack, { screen: state.screen, stillPlanned: state.stillPlanned }];
  if (sideEffect) sideEffect();
  state.screen = next;
  _render();
}

function goBack() {
  if (state.navStack.length === 0) return;
  const last = state.navStack[state.navStack.length - 1];
  state.navStack = state.navStack.slice(0, -1);
  state.screen = last.screen;
  state.stillPlanned = last.stillPlanned;
  _render();
}

function reset() {
  state.screen = 'start';
  state.itemName = '';
  state.stillPlanned = false;
  state.dontBuyReason = '';
  state.navStack = [];
  _render();
}

// ── Outcome transitions ────────────────────────────────────────────

function logOutcome(outcome, reason) {
  try {
    const id = Date.now().toString();
    const entry = {
      id,
      itemName: state.itemName.trim() || 'Untitled',
      outcome,
      reason: reason || '',
      date: new Date().toISOString(),
    };
    storeSave('entries:' + id, JSON.stringify(entry));
  } catch (e) {
    console.error('Could not save entry', e);
  }
}

function goDontBuy(reason) {
  state.dontBuyReason = reason;
  goTo('dontBuy');
  logOutcome("Don't buy", reason);
}

function goBuyIt() {
  goTo('buyIt');
  logOutcome('Buy it', '');
}

function goNotYet() {
  goTo('notYet');
  logOutcome('Not yet', "Hasn't been tested");
}

function goFindTest() {
  goTo('findTest');
  logOutcome('Not yet', "Can't test it — needs another way in");
}

// ── History ────────────────────────────────────────────────────────

function openHistory() {
  state.showHistory = true;
  state.historyState = 'loading';
  _render();
  try {
    const keys = storeListKeys('entries:');
    const entries = [];
    for (const k of keys) {
      try { const raw = storeGet(k); if (raw) entries.push(JSON.parse(raw)); } catch (_) {}
    }
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    state.history = entries;
    state.historyState = 'ready';
  } catch (_) {
    state.historyState = 'error';
  }
  _render();
}

function closeHistory() {
  state.showHistory = false;
  _render();
}

function clearHistory() {
  try {
    const keys = storeListKeys('entries:');
    for (const k of keys) storeDelete(k);
    state.history = [];
    _render();
  } catch (_) {
    state.historyState = 'error';
    _render();
  }
}
