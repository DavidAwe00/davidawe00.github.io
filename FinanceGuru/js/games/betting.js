// Beat the Book — 20 rounds of betting choices with a $100 bankroll, then the same choices replayed by
// 10,000 simulated players. Lesson: every bet has a negative expected value; luck fades, the edge doesn't.
// Every game is treated as a fair 50/50 coin flip so the only edge is the sportsbook's pricing.
window.Games = window.Games || {};
Games.betting = (() => {
  const root = document.getElementById("bet-root");
  const ROUNDS = 20, START = 100, STAKE = 10, SIMS = 10000;
  const BETS = [
    { key: "single", label: "Single game at −110", note: "Win $9.09 · 1 in 2 chance", p: 1 / 2, win: STAKE * 100 / 110 },
    { key: "parlay", label: "4-leg parlay", note: "Win $122.83 · 1 in 16 chance", p: 1 / 16, win: STAKE * (Math.pow(1 + 100 / 110, 4) - 1) },
    { key: "long", label: "Long shot at +500", note: "Win $50 · 1 in 7 chance", p: 1 / 7, win: STAKE * 5 },
    { key: "skip", label: "Skip this one", note: "Keep your $10", p: 0, win: 0 },
  ];
  const money = (v) => (v < 0 ? "−$" : "$") + Math.abs(v).toFixed(2);
  let round, bank, picks, log, locked;

  function start() {
    round = 0; bank = START; picks = []; log = [];
    next();
  }

  function next() {
    locked = false;
    const broke = bank < STAKE;
    root.innerHTML = `
      <div class="bet-top"><div><div class="small muted">Round ${round + 1} of ${ROUNDS}</div><div class="bet-bank">${money(bank)}</div></div>
        <div class="small muted" style="text-align:right">Every bet is $${STAKE}.<br>Games are fair coin flips.</div></div>
      <div class="step-dots">${Array.from({ length: ROUNDS }, (_, i) => `<span class="${i < round ? "on" : ""}"></span>`).join("")}</div>
      ${broke ? `<p class="small" style="margin:8px 0"><strong>You're out of money to bet.</strong> All you can do is skip.</p>` : ""}
      <div class="bet-choices">${BETS.map((b, i) => `<button class="choice" data-pick="${i}" ${broke && b.key !== "skip" ? "disabled" : ""}>
        <strong>${b.label}</strong><small>${b.note}</small><span class="key">${i + 1}</span></button>`).join("")}</div>
      <div id="bet-feedback" aria-live="polite" style="min-height:3em;margin-top:12px">${log.length ? log[log.length - 1] : ""}</div>`;
  }

  function pick(i) {
    if (locked) return;
    const b = BETS[i];
    if (b.key !== "skip" && bank < STAKE) return;
    locked = true;
    picks.push(i);
    let msg;
    if (b.key === "skip") msg = `<div class="feedback">⏭️ Skipped. Your $${STAKE} stays in your pocket.</div>`;
    else if (Math.random() < b.p) { bank += b.win; msg = `<div class="feedback">🎉 <strong>${b.label} hit!</strong> +${money(b.win)}</div>`; }
    else { bank -= STAKE; msg = `<div class="feedback">😬 ${b.label} lost. −$${STAKE}.00</div>`; }
    log.push(msg);
    round++;
    round < ROUNDS ? next() : end();
  }

  // Replays the player's exact choices for many simulated bettors.
  function simulate() {
    const finals = new Float64Array(SIMS);
    let placed = 0;
    for (let s = 0; s < SIMS; s++) {
      let m = START;
      for (const i of picks) {
        const b = BETS[i];
        if (b.key === "skip" || m < STAKE) continue;
        placed++;
        m += Math.random() < b.p ? b.win : -STAKE;
      }
      finals[s] = m;
    }
    return { finals, placed };
  }

  function end() {
    const { finals, placed } = simulate();
    const ahead = finals.filter((v) => v > START).length / SIMS;
    const avg = finals.reduce((t, v) => t + v, 0) / SIMS;
    const perBet = placed ? ((START - avg) * SIMS / placed) : 0; // average loss per $10 bet actually placed
    const bets = picks.filter((i) => BETS[i].key !== "skip").length;
    // Histogram of final bankrolls in $25 buckets, capped at $300+.
    const edges = [0, 25, 50, 75, 100, 125, 150, 200, 300, Infinity];
    const counts = edges.slice(0, -1).map((lo, k) => finals.filter((v) => v >= lo && v < edges[k + 1]).length);
    const maxC = Math.max(...counts, 1);
    const label = (k) => (edges[k + 1] === Infinity ? `$${edges[k]}+` : `$${edges[k]}–${edges[k + 1]}`);
    const you = edges.findIndex((lo, k) => bank >= lo && bank < edges[k + 1]);
    // A tiny floor so going broke still counts as "played" for badges (best scores of 0 read as unplayed).
    FG.recordBest("betting", Math.max(Math.round(bank), 0.001));
    FG.addXp(25);
    Games.refreshBest && Games.refreshBest();
    root.innerHTML = `<div class="result" style="text-align:left">
      <div style="text-align:center"><div class="card-icon" style="font-size:2.4rem">🎲</div>
      <div class="big">${money(bank)}</div>
      <p class="small muted">You started with $${START} and made ${bets} bet${bets === 1 ? "" : "s"} · +25 XP</p></div>
      <h3 style="margin:16px 0 4px">${SIMS.toLocaleString("en-US")} players made your exact choices</h3>
      ${bets ? `<p style="margin:0 0 10px">Only <strong>${Math.round(ahead * 100)}%</strong> ended up ahead. On average they finished with <strong>${money(avg)}</strong>, losing about <strong>${money(perBet)}</strong> on every $${STAKE} bet they placed.</p>`
        : `<p style="margin:0 0 10px">You skipped every bet, so every one of them kept all $${START}. That's the only strategy with no house edge.</p>`}
      <div class="bet-hist" role="img" aria-label="Final bankroll of ${SIMS} simulated players: ${counts.map((c, k) => `${label(k)}: ${c}`).join(", ")}">
        ${counts.map((c, k) => `<div class="bet-row${k === you ? " you" : ""}"><span>${label(k)}</span><div class="bar"><i style="width:${(c / maxC) * 100}%"></i></div><span>${(c / SIMS * 100).toFixed(1)}%${k === you ? " ← you" : ""}</span></div>`).join("")}
      </div>
      <div class="callout"><strong>Money lesson:</strong> per $10 bet, a single game loses about $0.45 on average, a long shot about $1.43, and a 4-leg parlay about $1.70. Some people get lucky for a while, but the more you bet, the closer you get to the house edge. Learn more in the <a href="learn.html#betting">Math of Betting lesson</a>.</div>
      <div style="text-align:center"><button class="btn btn-primary" data-restart>Play again</button></div></div>`;
  }

  root.addEventListener("click", (e) => {
    const p = e.target.closest("[data-pick]");
    if (p && !p.disabled) return pick(+p.dataset.pick);
    if (e.target.closest("[data-restart]")) start();
  });
  document.addEventListener("keydown", (e) => {
    if (root.closest("[hidden]") || round === undefined || round >= ROUNDS || e.ctrlKey || e.metaKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
    const i = "1234".indexOf(e.key);
    if (i >= 0) { e.preventDefault(); pick(i); }
  });

  return { show() { if (round === undefined) start(); }, hide() {} };
})();
