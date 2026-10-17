// Price Time Machine — guess what everyday items cost today, using real BLS average prices.
// Lesson: inflation raises prices over time, but not evenly — some things beat inflation, some lag it.
window.Games = window.Games || {};
Games.prices = (() => {
  const root = document.getElementById("ptm-root");
  const ROUNDS = 8, NOW = "2025";
  let round, correct, deck, current, locked;

  const fmt = (v) => (v < 0.2 ? (v * 100).toFixed(1) + "¢" : v < 1 ? Math.round(v * 100) + "¢" : "$" + v.toFixed(2));
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function makeRound(item) {
    const years = Object.keys(item.prices).filter((y) => y !== NOW && +y <= 2015);
    const year = years[Math.floor(Math.random() * years.length)];
    const then = item.prices[year], now = item.prices[NOW];
    const inflAdj = then * CPI_ANNUAL[NOW] / CPI_ANNUAL[year];
    // Distractors: the "just inflation" price plus scaled decoys, kept at least 15% apart.
    const picks = [now];
    for (const c of shuffle([inflAdj, now * 0.6, now * 1.6, inflAdj * 1.45, now * 0.4, now * 2.2])) {
      if (picks.length === 4) break;
      if (picks.every((p) => Math.abs(c / p - 1) > 0.15)) picks.push(c);
    }
    return { item, year, then, now, inflAdj, choices: shuffle(picks) };
  }

  function start() {
    round = 0; correct = 0;
    deck = shuffle(PRICES.filter((p) => p.prices[NOW]));
    next();
  }

  function next() {
    current = makeRound(deck[round % deck.length]);
    locked = false;
    const c = current;
    root.innerHTML = `
      <div class="small muted">Round ${round + 1} of ${ROUNDS} · ${correct} correct</div>
      <div class="step-dots">${Array.from({ length: ROUNDS }, (_, i) => `<span class="${i < round ? "on" : ""}"></span>`).join("")}</div>
      <div class="ptm-item">
        <div class="emoji">${c.item.emoji}</div>
        <p style="margin:8px 0 0">In <strong>${c.year}</strong>, a ${c.item.name.toLowerCase()} cost about</p>
        <div class="then">${fmt(c.then)}</div>
        <p class="quiz-q" style="margin-top:8px">What did it cost in ${NOW}?</p>
      </div>
      <div class="ptm-choices">${c.choices.map((v, i) => `<button class="choice" data-pick="${i}">${fmt(v)}</button>`).join("")}</div>
      <div id="ptm-feedback" style="max-width:560px;margin:16px auto 0" aria-live="polite"></div>`;
  }

  function pick(i) {
    if (locked) return;
    locked = true;
    const c = current, chosen = c.choices[i], ok = chosen === c.now;
    if (ok) correct++;
    root.querySelectorAll("[data-pick]").forEach((b, j) => {
      b.disabled = true;
      if (c.choices[j] === c.now) b.classList.add("correct");
      else if (j === i) b.classList.add("wrong");
    });
    const vsInfl = c.now / c.inflAdj - 1;
    const verdict = Math.abs(vsInfl) < 0.08 ? "rose about in line with overall inflation"
      : vsInfl > 0 ? `rose <strong>faster</strong> than inflation (${Math.round(vsInfl * 100)}% above)`
      : `actually got <strong>cheaper</strong> after inflation (${Math.round(-vsInfl * 100)}% below)`;
    $fb().innerHTML = `<div class="feedback"><strong>${ok ? "✅ Correct!" : "❌ Not quite."}</strong> ${NOW} average: <strong>${fmt(c.now)}</strong>.
      If it had simply kept pace with inflation since ${c.year}, it would cost ${fmt(c.inflAdj)} — so this item ${verdict}.</div>
      <div style="text-align:center;margin-top:12px"><button class="btn btn-primary" data-next>${round + 1 < ROUNDS ? "Next item →" : "See results →"}</button></div>`;
  }
  const $fb = () => document.getElementById("ptm-feedback");

  function end() {
    const { best, isNew } = FG.recordBest("prices", correct);
    const xp = correct * 5;
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    root.innerHTML = `<div class="result">
      <div class="card-icon" style="font-size:2.4rem">🛒</div>
      <div class="big">${correct}/${ROUNDS}</div>
      <p class="small muted">${isNew ? "🏆 New best!" : "Best: " + best + "/" + ROUNDS} · +${xp} XP</p>
      <div class="callout" style="text-align:left"><strong>Money lesson:</strong> since 1980, overall prices roughly quadrupled. Some things (eggs, beef, bacon) rose even faster, while others (gas, coffee, electricity) got cheaper after inflation. Cash sitting still loses buying power — investing is how you keep up. See the <a href="invest.html#inflation">inflation section</a>.</div>
      <button class="btn btn-primary" data-restart>Play again</button></div>`;
  }

  root.addEventListener("click", (e) => {
    const p = e.target.closest("[data-pick]");
    if (p) return pick(+p.dataset.pick);
    if (e.target.closest("[data-next]")) { round++; return round < ROUNDS ? next() : end(); }
    if (e.target.closest("[data-restart]")) start();
  });

  return { show() { if (round === undefined) start(); }, hide() {} };
})();
