import { useState } from 'react';
import { Heart, Clock, History, X, RotateCcw, Trash2, ArrowLeft } from 'lucide-react';

const STAGE = {
  urgent: 'Pace check', scarcity: 'Pace check', createSpace: 'Pace check',
  trackRecord: 'Realness check', tested: 'Realness check', feel: 'Realness check',
  habit: 'Fit check', replacement: 'Fit check', alreadyGone: 'Fit check', space: 'Fit check', cycle: 'Fit check',
};

function Eyebrow({ children }) {
  if (!children) return null;
  return (
    <div className="text-[11px] tracking-[0.18em] uppercase font-semibold text-[#9B8AAE] mb-3">
      {children}
    </div>
  );
}

function Question({ text, hint }) {
  return (
    <div className="mb-7">
      <h2 className="font-serif text-[26px] leading-tight text-[#2A2138] mb-2">
        {text}
      </h2>
      {hint && <p className="text-[#9B8AAE] text-[13px] leading-snug">{hint}</p>}
    </div>
  );
}

function Choice({ onClick, children, tone = 'default' }) {
  const base = 'w-full text-left px-5 py-4 rounded-2xl border transition-colors mb-3 font-medium';
  const styles = tone === 'primary'
    ? 'bg-[#2A2138] text-[#FBFAFC] border-[#2A2138] hover:bg-[#3a2e4d]'
    : 'bg-[#FBFAFC] text-[#2A2138] border-[#E4DEEE] hover:border-[#C28E2A] hover:bg-[#F7F0E0]';
  return (
    <button onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

function Outcome({ icon, color, bg, title, subtitle, children, onRestart }) {
  return (
    <div className="text-center py-2">
      <div
        className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
        style={{ backgroundColor: bg }}
      >
        {icon}
      </div>
      <h2 className="font-serif text-[28px] leading-tight mb-2" style={{ color }}>
        {title}
      </h2>
      {subtitle && <p className="text-[#6E6380] text-[15px] mb-5">{subtitle}</p>}
      {children}
      <button
        onClick={onRestart}
        className="mt-6 inline-flex items-center gap-2 text-[#6E6380] text-sm font-medium hover:text-[#2A2138]"
      >
        <RotateCcw size={15} /> Start over
      </button>
    </div>
  );
}

export default function DecisionMatrix() {
  const [screen, setScreen] = useState('start');
  const [itemName, setItemName] = useState('');
  const [stillPlanned, setStillPlanned] = useState(false);
  const [dontBuyReason, setDontBuyReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyState, setHistoryState] = useState('idle');
  const [navStack, setNavStack] = useState([]);

  function goTo(next, applyExtra) {
    setNavStack((prev) => [...prev, { screen, stillPlanned }]);
    if (applyExtra) applyExtra();
    setScreen(next);
  }

  function goBack() {
    setNavStack((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setScreen(last.screen);
      setStillPlanned(last.stillPlanned);
      return prev.slice(0, -1);
    });
  }

  function reset() {
    setScreen('start');
    setItemName('');
    setStillPlanned(false);
    setDontBuyReason('');
    setNavStack([]);
  }

  async function logOutcome(outcome, reason) {
    try {
      const id = Date.now().toString();
      const entry = {
        id,
        itemName: itemName.trim() || 'Untitled',
        outcome,
        reason: reason || '',
        date: new Date().toISOString(),
      };
      await window.storage.set(`entries:${id}`, JSON.stringify(entry));
    } catch (e) {
      console.error('Could not save entry', e);
    }
  }

  function goDontBuy(reason) {
    setDontBuyReason(reason);
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

  async function openHistory() {
    setShowHistory(true);
    setHistoryState('loading');
    try {
      const list = await window.storage.list('entries:');
      const keys = (list && list.keys) || [];
      const entries = [];
      for (const k of keys) {
        try {
          const res = await window.storage.get(k);
          if (res && res.value) entries.push(JSON.parse(res.value));
        } catch (e) {}
      }
      entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(entries);
      setHistoryState('ready');
    } catch (e) {
      setHistoryState('error');
    }
  }

  async function clearHistory() {
    try {
      const list = await window.storage.list('entries:');
      const keys = (list && list.keys) || [];
      for (const k of keys) {
        await window.storage.delete(k);
      }
      setHistory([]);
    } catch (e) {
      setHistoryState('error');
    }
  }

  const outcomeColor = { 'Buy it': '#2F6B45', "Don't buy": '#9B3C3C', 'Not yet': '#B5762A' };

  return (
    <div className="min-h-screen w-full bg-[#EDEAF2] flex items-center justify-center p-5">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&display=swap');
        .font-serif { font-family: 'Fraunces', serif; font-optical-sizing: auto; }
        * { font-family: 'Inter', sans-serif; }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.18); opacity: 0.9; }
        }
        .pulse-glow { animation: pulseGlow 2.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .pulse-glow { animation: none; }
        }
      `}</style>

      <div className="w-full max-w-md bg-[#FBFAFC] rounded-3xl shadow-xl p-7 relative">
        {!showHistory && (
          <div className="flex items-center justify-between mb-4 h-5">
            {screen !== 'start' ? (
              <button onClick={goBack} className="text-[#9B8AAE] hover:text-[#2A2138]" aria-label="Back to previous question">
                <ArrowLeft size={20} />
              </button>
            ) : <span />}
            {screen === 'start' ? (
              <button onClick={openHistory} className="text-[#9B8AAE] hover:text-[#2A2138]" aria-label="View history">
                <History size={20} />
              </button>
            ) : <span />}
          </div>
        )}

        {showHistory ? (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-[22px] text-[#2A2138]">History</h2>
              <button onClick={() => setShowHistory(false)} className="text-[#9B8AAE] hover:text-[#2A2138]">
                <X size={20} />
              </button>
            </div>
            {historyState === 'loading' && (
              <p className="text-[#6E6380] text-sm">Loading past entries…</p>
            )}
            {historyState === 'error' && (
              <p className="text-[#9B3C3C] text-sm">Couldn't load history. Try again later.</p>
            )}
            {historyState === 'ready' && history.length === 0 && (
              <p className="text-[#6E6380] text-sm">Nothing logged yet — entries appear here once you reach an outcome.</p>
            )}
            {historyState === 'ready' && history.length > 0 && (
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {history.map((h) => (
                  <div key={h.id} className="border border-[#E4DEEE] rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-[#2A2138] text-[15px]">{h.itemName}</span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: outcomeColor[h.outcome], backgroundColor: '#F2EFF5' }}
                      >
                        {h.outcome}
                      </span>
                    </div>
                    {h.reason && <p className="text-[#6E6380] text-[13px] mb-1">{h.reason}</p>}
                    <p className="text-[#9B8AAE] text-[11px]">
                      {new Date(h.date).toLocaleDateString()} · {new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {historyState === 'ready' && history.length > 0 && (
              <button
                onClick={clearHistory}
                className="mt-5 inline-flex items-center gap-2 text-[#9B3C3C] text-sm font-medium hover:opacity-75"
              >
                <Trash2 size={14} /> Clear history
              </button>
            )}
          </div>
        ) : (
          <>
            {screen === 'start' && (
              <div className="text-center py-2">
                <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#C28E2A] pulse-glow" />
                  <Heart size={26} className="relative text-[#FBFAFC]" fill="#C28E2A" stroke="#C28E2A" />
                </div>
                <h1 className="font-serif text-[26px] text-[#2A2138] mb-2">Feel the pull</h1>
                <p className="text-[#6E6380] text-[14px] mb-6">What's pulling at you right now?</p>
                <input
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. that lens, those shoes…"
                  className="w-full px-4 py-3 rounded-xl border border-[#E4DEEE] mb-6 text-[#2A2138] outline-none focus:border-[#C28E2A]"
                />
                <Choice tone="primary" onClick={() => goTo('urgent')}>
                  Walk through it →
                </Choice>
              </div>
            )}

            {screen === 'urgent' && (
              <div>
                <Eyebrow>{STAGE.urgent}</Eyebrow>
                <Question text="Feels urgent?" hint="Most “decide now” feelings turn out to be false alarms." />
                <Choice onClick={() => goTo('scarcity')}>Feels urgent</Choice>
                <Choice onClick={() => goTo('trackRecord')}>Can decide later instead</Choice>
              </div>
            )}

            {screen === 'scarcity' && (
              <div>
                <Eyebrow>{STAGE.scarcity}</Eyebrow>
                <Question text="Real, or just impatience?" hint="Real scarcity happens sometimes — but usually this is about not wanting to wait, not the item disappearing." />
                <Choice onClick={() => goTo('trackRecord')}>It's genuinely scarce</Choice>
                <Choice onClick={() => goTo('createSpace')}>I'm just impatient</Choice>
              </div>
            )}

            {screen === 'createSpace' && (
              <div>
                <Eyebrow>{STAGE.createSpace}</Eyebrow>
                <Question text="Create space" />
                <p className="text-[#6E6380] text-[15px] mb-7">
                  Wait. Sleep on it. Revisit later. Only come back to this once the urgency has actually cooled —
                  there's no rush to press on right now.
                </p>
                <Choice tone="primary" onClick={() => goTo('trackRecord')}>
                  I've created that space — continue
                </Choice>
              </div>
            )}

            {screen === 'trackRecord' && (
              <div>
                <Eyebrow>{STAGE.trackRecord}</Eyebrow>
                <Question text="Real history with this exact thing?" hint="Liking the brand or category isn’t the same as having proof with this exact thing." />
                <Choice onClick={() => goTo('habit')}>Strong history with this exact thing</Choice>
                <Choice onClick={() => goTo('tested')}>No real history with it</Choice>
              </div>
            )}

            {screen === 'tested' && (
              <div>
                <Eyebrow>{STAGE.tested}</Eyebrow>
                <Question text="Tried it, not just imagined?" hint="An imagined want and a tested one are different things — testing tells the truth before money does." />
                <Choice onClick={() => goTo('feel')}>Yes, I've actually tried it</Choice>
                <Choice onClick={goNotYet}>Not yet — only imagined it</Choice>
              </div>
            )}

            {screen === 'notYet' && (
              <Outcome
                icon={<Clock size={26} color="#B5762A" />}
                bg="#F4E8D6"
                color="#B5762A"
                title="Not yet"
                subtitle="This isn't a no — find a way to test it first."
                onRestart={reset}
              >
                <p className="text-[#6E6380] text-[14px]">
                  Try it, borrow it, ask someone who's used it, or just let time pass and see if the want survives.
                </p>
              </Outcome>
            )}

            {screen === 'feel' && (
              <div>
                <Eyebrow>{STAGE.feel}</Eyebrow>
                <Question text="Joy, or just neutral?" hint="Neutral isn’t a soft yes — it’s the same signal that predicted regret before." />
                <Choice onClick={() => goTo('habit')}>It felt like joy</Choice>
                <Choice onClick={() => goDontBuy('Not real enough — testing came back neutral')}>It felt neutral</Choice>
              </div>
            )}

            {screen === 'habit' && (
              <div>
                <Eyebrow>{STAGE.habit}</Eyebrow>
                <Question text="New habit, or fits one I have?" hint="Loving something doesn’t guarantee it gets used — it has to fit a rhythm already being lived, not a new one." />
                <Choice onClick={() => goTo('replacement')}>Fits a habit I already have</Choice>
                <Choice onClick={() => goDontBuy('Would need a new habit to actually use it')}>Would need a new habit</Choice>
              </div>
            )}

            {screen === 'replacement' && (
              <div>
                <Eyebrow>{STAGE.replacement}</Eyebrow>
                <Question text="Replacing something I own?" hint="A planned swap doesn’t free up space until it actually happens." />
                <Choice onClick={() => goTo('alreadyGone')}>Yes, replacing something</Choice>
                <Choice onClick={() => goTo('space', () => setStillPlanned(false))}>No, not replacing anything</Choice>
              </div>
            )}

            {screen === 'alreadyGone' && (
              <div>
                <Eyebrow>{STAGE.alreadyGone}</Eyebrow>
                <Question text="Already gone, or still planned?" hint="This decides whether the space check gets to count space that hasn’t really been freed yet." />
                <Choice onClick={() => goTo('space', () => setStillPlanned(false))}>Already gone</Choice>
                <Choice onClick={() => goTo('space', () => setStillPlanned(true))}>Still just planned</Choice>
              </div>
            )}

            {screen === 'space' && (
              <div>
                <Eyebrow>{STAGE.space}</Eyebrow>
                <Question text="Overflows the space I've made?" hint="The feeling that actually makes “no” stick — more than any abstract clutter-avoidance rule." />
                {stillPlanned && (
                  <p className="text-[#B5762A] text-[13px] mb-4 -mt-3 font-medium">
                    Remember: answer as if nothing has left yet.
                  </p>
                )}
                <Choice onClick={() => goTo('cycle')}>No, it fits</Choice>
                <Choice onClick={() => goDontBuy('Overflows the space made for it')}>Yes, it overflows</Choice>
              </div>
            )}

            {screen === 'cycle' && (
              <div>
                <Eyebrow>{STAGE.cycle}</Eyebrow>
                <Question text="Deepens the stuckness?" hint="“Stuckness” means the trapped feeling at month-end — not the dollar amount itself." />
                <Choice onClick={goBuyIt}>Stays clear</Choice>
                <Choice onClick={() => goDontBuy('Deepens the stuckness')}>Deepens it</Choice>
              </div>
            )}

            {screen === 'dontBuy' && (
              <Outcome
                icon={<X size={26} color="#9B3C3C" />}
                bg="#F3E2E0"
                color="#9B3C3C"
                title="Don't buy"
                subtitle={dontBuyReason}
                onRestart={reset}
              />
            )}

            {screen === 'buyIt' && (
              <Outcome
                icon={<Heart size={24} color="#2F6B45" fill="#2F6B45" />}
                bg="#DFF0E4"
                color="#2F6B45"
                title="Buy it"
                subtitle="Every check held. Go ahead."
                onRestart={reset}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
