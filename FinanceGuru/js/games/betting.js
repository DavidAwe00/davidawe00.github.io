// Beat the Book — 20 rounds of betting choices with a $100 bankroll, then the same choices (and bet sizes)
// replayed by 10,000 simulated players. A running ledger splits your result into the house edge (expected
// loss) and luck; the end screen charts your bankroll against the middle 80% of players and flags chasing
// losses (raising the bet right after a loss).
// Lesson: every bet has a negative expected value; luck fades, the edge doesn't.
// Every game is treated as a fair 50/50 coin flip so the only edge is the sportsbook's pricing.
window.Games = window.Games || {};
Games.betting = (() => {
  const root = document.getElementById("bet-root");
  const ROUNDS = 20, START = 100, SIMS = 10000, STAKES = [5, 10, 25];
  const t = (s, v) => (typeof I18N === "object" ? I18N.t(s, v) : s);
  // mult: profit per $1 staked when the bet wins.
  const BETS = [
    { key: "single", label: "Single game at −110", p: 1 / 2, odds: 2, mult: 100 / 110 },
    { key: "parlay", label: "4-leg parlay", p: 1 / 16, odds: 16, mult: Math.pow(1 + 100 / 110, 4) - 1 },
    { key: "long", label: "Long shot at +500", p: 1 / 7, odds: 7, mult: 5 },
    { key: "skip", label: "Skip this one", p: 0, mult: 0 },
  ];
  const ev = (b, stake) => (b.key === "skip" ? 0 : stake * (b.p * b.mult - (1 - b.p))); // expected profit (negative)
  const money = (v) => (v < 0 ? "−$" : "$") + Math.abs(v).toFixed(2);
  const signed = (v) => (v > 0.005 ? "+" : "") + money(v);
  let round, bank, stake, picks, log, locked, path, handle, expected;

  function start() {
    round = 0; bank = START; picks = []; log = []; path = [START]; handle = 0; expected = 0;
    stake = stake || 10;
    next();
  }

  const affordable = () => STAKES.filter((s) => s <= bank + 1e-9);

  function next() {
    locked = false;
    const can = affordable();
    if (can.length && !can.includes(stake)) stake = can[can.length - 1];
    const broke = !can.length;
    const luck = bank - START + expected;
    root.innerHTML = `
      <div class="bet-top"><div><div class="small muted">${t("Round {n} of {total}", { n: round + 1, total: ROUNDS })}</div><div class="bet-bank">${money(bank)}</div></div>
        <div class="small muted" style="text-align:right">${t("Games are fair coin flips.<br>The edge is in the prices.")}</div></div>
      <div class="step-dots">${Array.from({ length: ROUNDS }, (_, i) => `<span class="${i < round ? "on" : ""}"></span>`).join("")}</div>
      <div class="bet-ledger small" aria-label="${t("Running totals")}">
        <span>${t("Total bet")}<strong>${money(handle)}</strong></span>
        <span>${t("House edge")}<strong class="${expected > 0.005 ? "neg" : ""}">${money(-expected)}</strong></span>
        <span>${t("Luck")}<strong class="${luck < -0.005 ? "neg" : luck > 0.005 ? "pos" : ""}">${signed(luck)}</strong></span>
      </div>
      ${broke ? `<p class="small" style="margin:8px 0">${t("<strong>You're out of money to bet.</strong> All you can do is skip.")}</p>`
        : `<div class="bet-stakes"><span class="small muted">${t("Bet size")}</span><div class="chips">${STAKES.map((s) => `<button class="chip" data-stake="${s}" aria-pressed="${s === stake}" ${s > bank + 1e-9 ? "disabled" : ""}>$${s}</button>`).join("")}</div></div>`}
      <div class="bet-choices">${BETS.map((b, i) => `<button class="choice" data-pick="${i}" ${broke && b.key !== "skip" ? "disabled" : ""}>
        <strong>${t(b.label)}</strong><small>${b.key === "skip" ? t("Keep your {stake}", { stake: money(stake) })
          : t("Win {win} · 1 in {k} chance", { win: money(stake * b.mult), k: b.odds }) + `<br>${t("Expected: {ev}", { ev: money(ev(b, stake)) })}`}</small><span class="key">${i + 1}</span></button>`).join("")}</div>
      <div id="bet-feedback" aria-live="polite" style="min-height:3em;margin-top:12px">${log.length ? log[log.length - 1] : ""}</div>`;
  }

  function setStake(s) {
    if (locked || !STAKES.includes(s) || s > bank + 1e-9) return;
    stake = s;
    root.querySelectorAll("[data-stake]").forEach((c) => c.setAttribute("aria-pressed", +c.dataset.stake === s));
    next(); // refreshes the payouts on the bet buttons for the new size
  }

  function pick(i) {
    if (locked) return;
    const b = BETS[i];
    const live = b.key !== "skip";
    if (live && stake > bank + 1e-9) return;
    locked = true;
    let msg, won = null;
    if (!live) msg = `<div class="feedback">${t("⏭️ Skipped. Your {stake} stays in your pocket.", { stake: money(stake) })}</div>`;
    else {
      handle += stake; expected -= ev(b, stake);
      won = Math.random() < b.p;
      const note = `<br><span class="small muted">${t("Expected value of that bet: {ev}. Over many bets, that's what it costs.", { ev: money(ev(b, stake)) })}</span>`;
      if (won) { bank += stake * b.mult; msg = `<div class="feedback">${t("🎉 <strong>{bet} hit!</strong> +{amount}", { bet: t(b.label), amount: money(stake * b.mult) })}${note}</div>`; }
      else { bank -= stake; msg = `<div class="feedback">${t("😬 {bet} lost. −{amount}", { bet: t(b.label), amount: money(stake) })}${note}</div>`; }
    }
    picks.push({ i, stake: live ? stake : 0, won });
    path.push(bank);
    log.push(msg);
    round++;
    round < ROUNDS ? next() : end();
  }

  // Replays the player's exact choices and bet sizes for many simulated bettors, keeping every bankroll path.
  function simulate() {
    const paths = new Float32Array(SIMS * (ROUNDS + 1));
    let wagered = 0;
    for (let s = 0; s < SIMS; s++) {
      let m = START;
      paths[s * (ROUNDS + 1)] = m;
      picks.forEach((pk, r) => {
        const b = BETS[pk.i];
        if (pk.stake && m >= pk.stake - 1e-9) { wagered += pk.stake; m += Math.random() < b.p ? pk.stake * b.mult : -pk.stake; }
        paths[s * (ROUNDS + 1) + r + 1] = m;
      });
    }
    // 10th, 50th, and 90th percentile bankroll after each round.
    const band = [];
    const col = new Float32Array(SIMS);
    for (let r = 0; r <= ROUNDS; r++) {
      for (let s = 0; s < SIMS; s++) col[s] = paths[s * (ROUNDS + 1) + r];
      col.sort();
      band.push([col[Math.floor(SIMS * 0.1)], col[Math.floor(SIMS * 0.5)], col[Math.floor(SIMS * 0.9)]]);
    }
    const finals = Array.from({ length: SIMS }, (_, s) => paths[s * (ROUNDS + 1) + ROUNDS]);
    return { finals, band, wagered };
  }

  // Your bankroll over the 20 rounds against the middle 80% of simulated players.
  function chart(band) {
    const W = 560, H = 200, m = { t: 12, r: 14, b: 24, l: 44 };
    const max = Math.max(150, ...band.map((b) => b[2]), ...path) * 1.08;
    const x = (r) => m.l + (r / ROUNDS) * (W - m.l - m.r);
    const y = (v) => m.t + (H - m.t - m.b) * (1 - Math.max(0, v) / max);
    const line = (vals) => vals.map((v, r) => `${r ? "L" : "M"}${x(r).toFixed(1)},${y(v).toFixed(1)}`).join("");
    const area = line(band.map((b) => b[2])) + band.map((b, r) => r).reverse().map((r) => `L${x(r).toFixed(1)},${y(band[r][0]).toFixed(1)}`).join("") + "Z";
    const step = max > 300 ? 100 : 50;
    let svg = `<div class="chart" style="margin-top:8px;max-width:${W}px"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${t("Your bankroll by round: {list}", { list: path.map((v) => money(v)).join(", ") })}">`;
    for (let v = 0; v <= max; v += step) svg += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/><g class="axis"><text x="${m.l - 6}" y="${y(v) + 4}" text-anchor="end">$${v}</text></g>`;
    for (let r = 0; r <= ROUNDS; r += 5) svg += `<g class="axis"><text x="${x(r)}" y="${H - 6}" text-anchor="middle">${r}</text></g>`;
    svg += `<path d="${area}" style="fill:var(--series-1);opacity:.18"/>`;
    svg += `<path d="${line(band.map((b) => b[1]))}" fill="none" style="stroke:var(--series-1)" stroke-width="2" stroke-dasharray="5 4"/>`;
    svg += `<path d="${line(path)}" fill="none" style="stroke:var(--series-2)" stroke-width="2.5" stroke-linejoin="round"/>`;
    svg += `<circle cx="${x(ROUNDS)}" cy="${y(bank)}" r="4.5" style="fill:var(--series-2)"/></svg></div>`;
    svg += `<div class="chart-legend small" style="margin-top:6px"><span><i style="background:var(--series-2)"></i>${t("Your bankroll")}</span><span><i style="background:var(--series-1)"></i>${t("Middle player")}</span><span><i style="background:var(--series-1);opacity:.3"></i>${t("Middle 80% of players")}</span></div>`;
    return svg;
  }

  function end() {
    const { finals, band, wagered } = simulate();
    const ahead = finals.filter((v) => v > START).length / SIMS;
    const avg = finals.reduce((s, v) => s + v, 0) / SIMS;
    const bets = picks.filter((p) => p.stake).length;
    const lossPer10 = wagered ? ((START - avg) * SIMS / wagered) * 10 : 0; // simulated loss per $10 actually wagered
    const luck = bank - START + expected;
    // Chasing: a bigger bet placed right after a losing one.
    let chase = 0;
    for (let r = 1; r < picks.length; r++) {
      const prev = picks.slice(0, r).reverse().find((p) => p.stake);
      if (prev && prev.won === false && picks[r].stake > prev.stake) chase++;
    }
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
    const stat = (lbl, v, cls = "") => `<div class="stat"><div class="label">${lbl}</div><div class="value ${cls}">${v}</div></div>`;
    root.innerHTML = `<div class="result" style="text-align:left">
      <div style="text-align:center"><div class="card-icon" style="font-size:2.4rem">🎲</div>
      <div class="big">${money(bank)}</div>
      <p class="small muted">${t(bets === 1 ? "You started with ${start} and made {n} bet" : "You started with ${start} and made {n} bets", { start: START, n: bets })} · +25 XP</p></div>
      ${bets ? `<div class="stats bet-stats">
        ${stat(t("Total bet"), money(handle))}
        ${stat(t("Your result"), signed(bank - START), bank < START ? "neg" : "")}
        ${stat(t("House edge"), money(-expected), "neg")}
        ${stat(t("Luck"), signed(luck), luck < 0 ? "neg" : "")}
      </div>
      <p class="small" style="margin:0 0 6px">${t("Your result = house edge + luck. The edge was set the moment you placed each bet. Luck is the part that changes every time you play.")}</p>` : ""}
      <h3 style="margin:16px 0 4px">${t("{n} players made your exact choices", { n: SIMS.toLocaleString(typeof I18N === "object" ? I18N.locale() : "en-US") })}</h3>
      ${bets ? `<p style="margin:0 0 6px">${t("Only <strong>{pct}%</strong> ended up ahead. On average they finished with <strong>{avg}</strong>, losing about <strong>{loss}</strong> for every $10 they bet.", { pct: Math.round(ahead * 100), avg: money(avg), loss: money(lossPer10) })}</p>
        ${chart(band)}`
        : `<p style="margin:0 0 10px">${t("You skipped every bet, so every one of them kept all ${start}. That's the only strategy with no house edge.", { start: START })}</p>`}
      <div class="bet-hist" role="img" aria-label="${t("Final bankroll of {n} simulated players: {list}", { n: SIMS, list: counts.map((c, k) => `${label(k)}: ${c}`).join(", ") })}">
        ${counts.map((c, k) => `<div class="bet-row${k === you ? " you" : ""}"><span>${label(k)}</span><div class="bar"><i style="width:${(c / maxC) * 100}%"></i></div><span>${(c / SIMS * 100).toFixed(1)}%${k === you ? " " + t("← you") : ""}</span></div>`).join("")}
      </div>
      ${chase ? `<div class="callout">${t(chase === 1 ? "🚩 <strong>You raised your bet right after a loss once.</strong> That's called chasing losses. The odds don't change after a loss, so a bigger bet only means a bigger expected loss." : "🚩 <strong>You raised your bet right after a loss {n} times.</strong> That's called chasing losses. The odds don't change after a loss, so a bigger bet only means a bigger expected loss.", { n: chase })}</div>` : ""}
      <div class="callout">${t("<strong>Money lesson:</strong> per $10 bet, a single game loses about $0.45 on average, a long shot about $1.43, and a 4-leg parlay about $1.70. Some people get lucky for a while, but the more you bet, the closer you get to the house edge. Learn more in the <a href=\"learn.html#betting\">Math of Betting lesson</a>.")}</div>
      <div style="text-align:center"><button class="btn btn-primary" data-restart>${t("Play again")}</button></div></div>`;
  }

  root.addEventListener("click", (e) => {
    const s = e.target.closest("[data-stake]");
    if (s && !s.disabled) return setStake(+s.dataset.stake);
    const p = e.target.closest("[data-pick]");
    if (p && !p.disabled) return pick(+p.dataset.pick);
    if (e.target.closest("[data-restart]")) start();
  });
  document.addEventListener("keydown", (e) => {
    if (root.closest("[hidden]") || round === undefined || round >= ROUNDS || e.ctrlKey || e.metaKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
    const i = "1234".indexOf(e.key);
    if (i >= 0) { e.preventDefault(); pick(i); return; }
    // ← and → change the bet size.
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const can = affordable(), k = can.indexOf(stake) + (e.key === "ArrowRight" ? 1 : -1);
      if (can[k]) { e.preventDefault(); setStake(can[k]); }
    }
  });

  document.addEventListener("langchange", () => { if (round !== undefined && round < ROUNDS) next(); });
  return { show() { if (round === undefined) start(); }, hide() {} };
})();
