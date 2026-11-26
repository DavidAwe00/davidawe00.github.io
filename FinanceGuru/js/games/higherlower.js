// Salary Showdown — three ways to play with real median pay data.
//   Higher or Lower: 3 lives; pay gaps get smaller as your score climbs.
//   Pay Guesser: slide to your guess and score by how close you land.
//   Head Start: more school means a later start. Who has earned more by a given age? See the earnings race.
// Lesson: what you study and which career you choose are huge financial decisions, and time matters too.
window.Games = window.Games || {};
Games.salary = (() => {
  const root = document.getElementById("hl-root");
  const $pill = document.getElementById("hl-streak");
  const MAJOR_EMOJI = { Engineering: "⚙️", "Tech & Math": "💻", Business: "📊", "Health & Science": "🔬", Education: "🍎" };
  const HAS_OCC = typeof OCCUPATIONS !== "undefined";
  const eduOf = (k) => (HAS_OCC ? EDU_LEVELS.find((e) => e.key === k) : null);

  const t = (s, v) => (typeof I18N === "object" ? I18N.t(s, v) : s);
  // Names and descriptions are getters, so a card reads in whatever language the page is in when it's shown.
  // (Major and job names are translated by js/i18n/college.es.js.)
  const OCC = HAS_OCC ? OCCUPATIONS.map((o) => ({ emoji: o.emoji, get name() { return t(o.name); }, get what() { return t("Median pay · {edu}", { edu: t(eduOf(o.edu).label).toLowerCase() }); }, pay: o.pay, edu: eduOf(o.edu), growth: o.growth }))
    : CAREERS.map((c) => ({ emoji: c.emoji, get name() { return t(c.name); }, get what() { return t("Median pay · {edu}", { edu: t(c.edu).toLowerCase() }); }, pay: c.pay }));
  const POOL = [
    ...MAJORS.map((m) => ({ emoji: MAJOR_EMOJI[m.group] || "📚", get name() { return t("{major} major", { major: t(m.name) }); }, get what() { return t("Median pay at mid-career (ages 35–45)"); }, pay: m.mid })),
    ...MAJORS.map((m) => ({ emoji: MAJOR_EMOJI[m.group] || "📚", get name() { return t("{major} major", { major: t(m.name) }); }, get what() { return t("Median starting pay (ages 22–27)"); }, pay: m.early })),
    ...OCC,
  ];
  const MEDIAN = typeof ALL_OCCUPATIONS_MEDIAN !== "undefined" ? ALL_OCCUPATIONS_MEDIAN : 50000;
  const GUESS_ROUNDS = 6, RACE_ROUNDS = 6, LIVES = 3, STEPS = 1000, LO = 25000, HI = 250000;

  let mode = null, st = null, locked = false;
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  function menu() {
    mode = null; st = null;
    $pill.textContent = t("💼 Pick a mode");
    const best = (k) => { const b = FG.getBest(k); return b ? ` · 🏆 ${b}` : ""; };
    root.innerHTML = `<div class="choices" style="max-width:560px;margin:0 auto">
      <button class="choice" data-mode="hl"><strong>${t("▲▼ Higher or Lower")}</strong><small>${t("Which pays more? 3 lives, and the gaps get smaller as you go")}${best("salary")}</small></button>
      ${HAS_OCC ? `<button class="choice" data-mode="guess"><strong>${t("🎚️ Pay Guesser")}</strong><small>${t("Slide to your guess for {n} careers. Closer = more points", { n: GUESS_ROUNDS })}${best("salary-guess")}</small></button>
      <button class="choice" data-mode="race"><strong>${t("🏁 Head Start")}</strong><small>${t("More school means starting work later. Who has earned more by a given age?")}${best("salary-race")}</small></button>` : ""}
    </div>`;
  }

  /* ---------- Higher or Lower ---------- */
  // The minimum pay gap shrinks as you score, so later rounds are closer calls.
  const minGap = () => Math.max(3000, 30000 - st.score * 2500);
  function pickNext() {
    const g = minGap();
    const ok = POOL.filter((c) => !st.used.has(c) && Math.abs(c.pay - st.left.pay) >= g);
    const close = ok.filter((c) => Math.abs(c.pay - st.left.pay) <= g * 3);
    const c = rand(st.score >= 4 && close.length ? close : ok.length ? ok : POOL);
    st.used.add(c);
    return c;
  }
  function hlStart() {
    mode = "hl";
    const left = rand(POOL);
    st = { used: new Set([left]), left, score: 0, lives: LIVES, misses: [] };
    st.right = pickNext();
    hlRender();
  }
  const hlCard = (c, reveal) => `
    <div class="card hl-card">
      <div class="emoji">${c.emoji}</div>
      <div class="name">${c.name}</div>
      <div class="small muted">${c.what}</div>
      <div class="pay" data-pay>${reveal ? FG.money(c.pay) : "?"}</div>
      ${reveal ? "" : `<div class="sort-buttons"><button class="btn btn-buy" data-guess="higher">${t("▲ Higher")}</button><button class="btn btn-sell" data-guess="lower">${t("▼ Lower")}</button></div>`}
    </div>`;
  function hlRender(msg = "") {
    $pill.textContent = `${"❤️".repeat(st.lives)}${"🤍".repeat(LIVES - st.lives)} · ${t("{n} correct", { n: st.score })}`;
    root.innerHTML = `<div class="hl-game">${hlCard(st.left, true)}<div class="hl-vs">${t("vs")}</div>${hlCard(st.right, false)}</div>
      <p class="small muted" style="text-align:center;margin:12px 0 0" aria-live="polite">${msg || `${t("Does the right side pay more or less?")} <span class="muted">${t("Gaps are now as small as {amount}.", { amount: FG.money(minGap()) })}</span>`}</p>`;
    locked = false;
  }
  function hlGuess(dir) {
    if (locked) return;
    locked = true;
    const { left, right } = st;
    const ok = (dir === "higher") === (right.pay > left.pay);
    root.querySelectorAll("[data-pay]")[1].textContent = FG.money(right.pay);
    root.querySelectorAll("[data-guess]").forEach((b) => (b.disabled = true));
    const diff = Math.abs(right.pay - left.pay);
    if (ok) st.score++;
    else { st.lives--; st.misses.push({ left, right }); }
    setTimeout(() => {
      if (st.lives <= 0) return hlEnd();
      st.left = right;
      st.right = pickNext();
      hlRender(ok ? t("✅ Correct! A difference of {diff} a year — about {career} over a 30-year career.", { diff: FG.money(diff), career: FG.money(diff * 30) })
        : `${t(right.pay > left.pay ? "❌ {name} pays {pay}, more than {other}." : "❌ {name} pays {pay}, less than {other}.", { name: right.name, pay: FG.money(right.pay), other: FG.money(left.pay) })} ${t(st.lives === 1 ? "{n} life left." : "{n} lives left.", { n: st.lives })}`);
    }, 900);
  }
  function hlEnd() {
    const { best, isNew } = FG.recordBest("salary", st.score);
    const xp = Math.min(45, st.score * 3);
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    end(`<div class="big">${t("{n} correct", { n: st.score })}</div>
      <p class="small muted">${isNew ? t("🏆 New best!") : t("Best: {best}", { best })} · +${xp} XP</p>
      <ul class="small" style="text-align:left;max-width:520px;margin:12px auto">${st.misses.map((m) => `<li>${m.right.emoji} ${m.right.name}: ${FG.money(m.right.pay)} vs ${m.left.emoji} ${m.left.name}: ${FG.money(m.left.pay)}</li>`).join("")}</ul>`);
  }

  /* ---------- Pay Guesser ---------- */
  const toPay = (v) => LO * Math.pow(HI / LO, v / STEPS);
  const toStep = (p) => Math.round((Math.log(p / LO) / Math.log(HI / LO)) * STEPS);
  const points = (g, real) => Math.max(0, Math.round(100 - Math.abs(Math.log(g / real)) * 250));
  function guessStart() {
    mode = "guess";
    st = { deck: shuffle([...OCC]).slice(0, GUESS_ROUNDS), round: 0, score: 0, log: [] };
    guessRender();
  }
  function guessRender() {
    const c = st.deck[st.round];
    $pill.textContent = t("Round {n}/{total} · {score} pts", { n: st.round + 1, total: GUESS_ROUNDS, score: st.score });
    root.innerHTML = `<div class="card hl-card" style="max-width:460px;margin:0 auto">
        <div class="emoji">${c.emoji}</div><div class="name">${c.name}</div>
        <div class="small muted">${t("Typical entry education: {edu}", { edu: t(c.edu.label).toLowerCase() })}${c.growth ? " · " + t("🚀 fast-growing (+{pct}% by 2035)", { pct: c.growth }) : ""}</div>
      </div>
      <div class="ptm-slider">
        <label for="hl-slider" class="quiz-q" style="display:block;margin-top:12px">${t("What's the median yearly pay?")}</label>
        <div class="ptm-guess" id="hl-out" aria-hidden="true">${FG.money(MEDIAN)}</div>
        <input type="range" id="hl-slider" min="0" max="${STEPS}" value="${toStep(MEDIAN)}" aria-valuetext="${FG.money(MEDIAN)}">
        <div class="small muted" style="display:flex;justify-content:space-between"><span>${FG.compact(LO)}</span><span>${FG.compact(HI)}</span></div>
        <p class="small muted" style="margin:8px 0 0">${t("📏 The slider starts at the median for all U.S. jobs: {amount}.", { amount: FG.money(MEDIAN) })}</p>
        <div style="text-align:center;margin-top:14px"><button class="btn btn-primary" data-lock>${t("Lock in guess")}</button></div>
      </div>
      <div id="hl-fb" style="max-width:560px;margin:16px auto 0" aria-live="polite"></div>`;
    locked = false;
  }
  const roundPay = (p) => Math.round(p / 500) * 500;
  function guessLock() {
    if (locked) return;
    locked = true;
    const c = st.deck[st.round], g = roundPay(toPay(+document.getElementById("hl-slider").value));
    const pts = points(g, c.pay);
    st.score += pts;
    st.log.push({ c, g, pts });
    root.querySelectorAll("#hl-slider,[data-lock]").forEach((b) => (b.disabled = true));
    const off = g / c.pay - 1;
    const vs = c.pay / MEDIAN - 1;
    document.getElementById("hl-fb").innerHTML = `<div class="feedback" style="display:block">
        <strong>${t(pts >= 88 ? "🎯 Bullseye!" : pts >= 65 ? "🔥 Very close" : pts >= 40 ? "👍 Ballpark" : "😬 Off")} ${t("+{n} pts.", { n: pts })}</strong>
        ${t("You guessed {guess}; the median is <strong>{pay}</strong>", { guess: FG.money(g), pay: FG.money(c.pay) })} (${Math.abs(off) < 0.01 ? t("within 1%") : t(off > 0 ? "you were {pct}% high" : "you were {pct}% low", { pct: Math.round(Math.abs(off) * 100) })}).
        ${t(vs >= 0 ? "That's about {hourly} an hour and {pct}% above the median U.S. job." : "That's about {hourly} an hour and {pct}% below the median U.S. job.", { hourly: FG.money(c.pay / 2080, 2), pct: Math.round(Math.abs(vs) * 100) })}</div>
      <div style="text-align:center;margin-top:12px"><button class="btn btn-primary" data-next>${st.round + 1 < GUESS_ROUNDS ? t("Next career →") : t("See results →")}</button></div>`;
    root.querySelector("[data-next]").focus({ preventScroll: true });
  }
  function guessEnd() {
    const { best, isNew } = FG.recordBest("salary-guess", st.score);
    const xp = Math.round(st.score / 15);
    FG.addXp(xp);
    const surprise = st.log.reduce((a, b) => (b.pts < a.pts ? b : a));
    end(`<div class="big">${st.score} / ${GUESS_ROUNDS * 100}</div>
      <p class="small muted">${isNew ? t("🏆 New best!") : t("Best: {best}", { best })} · +${xp} XP</p>
      <p class="small">${t("Biggest surprise: {emoji} <strong>{name}</strong> — you guessed {guess}, real median {pay}.", { emoji: surprise.c.emoji, name: surprise.c.name, guess: FG.money(surprise.g), pay: FG.money(surprise.c.pay) })}</p>`);
  }

  /* ---------- Head Start ---------- */
  // Everyone starts work at 18 plus their years of school, then earns today's median pay each year.
  const startAge = (c) => 18 + c.edu.years;
  const earned = (c, age) => c.pay * Math.max(0, age - startAge(c));
  function racePair() {
    for (let t = 0; t < 500; t++) {
      const a = rand(OCC), b = rand(OCC);
      const [early, late] = a.edu.years < b.edu.years ? [a, b] : [b, a];
      if (early.edu.years === late.edu.years || late.pay < early.pay * 1.15) continue;
      const cross = crossAge(early, late);
      if (cross < 24 || cross > 60) continue;
      // Ask about an age near the crossover, so it's a real decision.
      const age = Math.max(startAge(late) + 2, Math.min(65, Math.round(cross + (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 8))));
      if (Math.abs(age - cross) < 1) continue;
      return { cards: shuffle([early, late]), early, late, cross, age };
    }
  }
  const crossAge = (e, l) => (l.pay * startAge(l) - e.pay * startAge(e)) / (l.pay - e.pay);
  function raceStart() {
    mode = "race";
    st = { round: 0, score: 0 };
    raceRound();
  }
  function raceRound() {
    st.q = racePair();
    const q = st.q;
    $pill.textContent = t("Round {n}/{total} · {score} right", { n: st.round + 1, total: RACE_ROUNDS, score: st.score });
    const card = (c, i) => `<button class="card hl-card choice" data-race="${i}" style="text-align:center;padding-left:16px">
        <div class="emoji">${c.emoji}</div><div class="name">${c.name}</div>
        <div class="small muted">${t(c.edu.label)} · ${t("starts work at {age}", { age: startAge(c) })}</div>
        <div class="pay">${FG.money(c.pay)}<span class="small muted">${t("/yr")}</span></div></button>`;
    root.innerHTML = `<p class="quiz-q" style="text-align:center;margin:0 0 12px">${t("By age <strong>{age}</strong>, who has earned more in total?", { age: q.age })}</p>
      <div class="hl-game">${card(q.cards[0], 0)}<div class="hl-vs">${t("vs")}</div>${card(q.cards[1], 1)}</div>
      <div id="hl-fb" style="max-width:600px;margin:16px auto 0" aria-live="polite"></div>`;
    locked = false;
  }
  function racePick(i) {
    if (locked) return;
    locked = true;
    const q = st.q, pick = q.cards[i], other = q.cards[1 - i];
    const winner = earned(q.late, q.age) > earned(q.early, q.age) ? q.late : q.early;
    const ok = pick === winner;
    if (ok) st.score++;
    root.querySelectorAll("[data-race]").forEach((b, j) => { b.disabled = true; if (q.cards[j] === winner) b.classList.add("correct"); else if (j === i) b.classList.add("wrong"); });
    const cross = Math.ceil(q.cross);
    document.getElementById("hl-fb").innerHTML = `<div class="feedback" style="display:block">
        <strong>${ok ? t("✅ Right!") : t("❌ Not this time.")}</strong> ${t("By {age}: {e1} {a1} vs {e2} {a2}.", { age: q.age, e1: q.early.emoji, a1: FG.money(earned(q.early, q.age)), e2: q.late.emoji, a2: FG.money(earned(q.late, q.age)) })}
        ${t("{name} starts {n} years later but pulls ahead at about age <strong>{cross}</strong>.", { name: q.late.name, n: q.late.edu.years - q.early.edu.years, cross })}
        ${t("By 65 the gap is {gap}.", { gap: FG.money(earned(q.late, 65) - earned(q.early, 65))})}
        ${raceChart(q)}
      </div>
      <div style="text-align:center;margin-top:12px"><button class="btn btn-primary" data-next>${st.round + 1 < RACE_ROUNDS ? t("Next race →") : t("See results →")}</button></div>`;
    root.querySelector("[data-next]").focus({ preventScroll: true });
  }
  function raceChart(q) {
    const W = 560, H = 200, m = { t: 12, r: 16, b: 24, l: 56 };
    const max = earned(q.late, 65) * 1.05;
    const x = (a) => m.l + ((a - 18) / (65 - 18)) * (W - m.l - m.r);
    const y = (v) => m.t + (H - m.t - m.b) * (1 - v / max);
    const line = (c) => Array.from({ length: 48 }, (_, k) => 18 + k).map((a, k) => `${k ? "L" : "M"}${x(a).toFixed(1)},${y(earned(c, a)).toFixed(1)}`).join("");
    const s1 = css("--series-1"), s2 = css("--series-2"), mu = css("--muted");
    let svg = `<div class="chart" style="margin-top:12px;max-width:${W}px"><svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${t("Total earnings by age: {late} passes {early} at about age {age}", { late: q.late.name, early: q.early.name, age: Math.ceil(q.cross) })}">`;
    for (let k = 0; k <= 3; k++) { const v = (max / 3) * k; svg += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/><g class="axis"><text x="${m.l - 6}" y="${y(v) + 4}" text-anchor="end">${FG.compact(v)}</text></g>`; }
    for (const a of [18, 25, 35, 45, 55, 65]) svg += `<g class="axis"><text x="${x(a)}" y="${H - 6}" text-anchor="middle">${a}</text></g>`;
    svg += `<line x1="${x(q.age)}" x2="${x(q.age)}" y1="${m.t}" y2="${H - m.b}" stroke="${mu}" stroke-dasharray="3 3"/><g class="axis"><text x="${x(q.age) + 4}" y="${m.t + 10}">${t("age {n}", { n: q.age })}</text></g>`;
    svg += `<path d="${line(q.early)}" fill="none" stroke="${s1}" stroke-width="2.5"/><path d="${line(q.late)}" fill="none" stroke="${s2}" stroke-width="2.5"/>`;
    svg += `<circle cx="${x(q.cross)}" cy="${y(earned(q.early, q.cross))}" r="4" fill="${css("--surface")}" stroke="${mu}" stroke-width="2"/></svg></div>
      <div class="chart-legend small" style="margin-top:6px"><span><i style="background:${s1}"></i>${q.early.name}</span><span><i style="background:${s2}"></i>${q.late.name}</span></div>`;
    return svg;
  }
  function raceEnd() {
    const { best, isNew } = FG.recordBest("salary-race", st.score);
    const xp = st.score * 6;
    FG.addXp(xp);
    end(`<div class="big">${st.score} / ${RACE_ROUNDS}</div>
      <p class="small muted">${isNew ? t("🏆 New best!") : t("Best: {best}", { best: best + "/" + RACE_ROUNDS })} · +${xp} XP</p>
      <p class="small" style="text-align:left">${t("More school delays your first paycheck, so a higher salary needs years to catch up — and that's before tuition and student loans, which this race leaves out. Real pay also grows with experience in most careers.")}</p>`);
  }

  function end(body) {
    $pill.textContent = t("💼 Game over");
    root.innerHTML = `<div class="result">
      <div class="card-icon" style="font-size:2.4rem">💼</div>${body}
      <div class="callout" style="text-align:left">${t("<strong>Money lesson:</strong> your career is your biggest wealth-building tool. Explore every major's pay, unemployment, and ROI in the <a href=\"college.html#majors\">College &amp; Careers hub</a>.")}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button class="btn btn-primary" data-again>${t("Play again")}</button><button class="btn btn-ghost" data-menu>${t("Other modes")}</button></div></div>`;
  }

  root.addEventListener("input", (e) => {
    if (e.target.id !== "hl-slider") return;
    const v = FG.money(roundPay(toPay(+e.target.value)));
    document.getElementById("hl-out").textContent = v;
    e.target.setAttribute("aria-valuetext", v);
  });
  root.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.id === "hl-slider") { e.preventDefault(); guessLock(); } });
  root.addEventListener("click", (e) => {
    const m = e.target.closest("[data-mode]");
    if (m) return ({ hl: hlStart, guess: guessStart, race: raceStart })[m.dataset.mode]();
    const g = e.target.closest("[data-guess]");
    if (g) return hlGuess(g.dataset.guess);
    if (e.target.closest("[data-lock]")) return guessLock();
    const r = e.target.closest("[data-race]");
    if (r) return racePick(+r.dataset.race);
    if (e.target.closest("[data-next]")) {
      st.round++;
      if (mode === "guess") return st.round < GUESS_ROUNDS ? guessRender() : guessEnd();
      return st.round < RACE_ROUNDS ? raceRound() : raceEnd();
    }
    if (e.target.closest("[data-again]")) return ({ hl: hlStart, guess: guessStart, race: raceStart })[mode]();
    if (e.target.closest("[data-menu]")) menu();
  });
  addEventListener("keydown", (e) => {
    if (document.getElementById("game-salary").hidden || !root.querySelector("[data-guess]:not([disabled])")) return;
    if (e.key === "ArrowUp") { e.preventDefault(); hlGuess("higher"); }
    if (e.key === "ArrowDown") { e.preventDefault(); hlGuess("lower"); }
  });

  // Only the mode menu is redrawn on a language change; a round in progress keeps its language until the next screen.
  document.addEventListener("langchange", () => { if (!mode && root.innerHTML.trim()) menu(); });
  return { show() { if (!root.innerHTML.trim()) menu(); }, hide() {} };
})();
