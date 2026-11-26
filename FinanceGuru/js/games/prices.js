// Price Time Machine — guess what everyday items cost today, using real BLS average prices.
// You set your guess on a slider and score by how close you land. The reveal charts the item's real
// price history against the "just inflation" path, so you see which things beat inflation and which lagged.
// Lesson: inflation raises prices over time, but not evenly — some things beat inflation, some lag it.
window.Games = window.Games || {};
Games.prices = (() => {
  const root = document.getElementById("ptm-root");
  const ROUNDS = 8, NOW = "2025", STEPS = 1000;
  const t = (s, v) => (typeof I18N === "object" ? I18N.t(s, v) : s);
  // "a dozen large eggs" is looked up whole: other languages need the article to agree with the item.
  const aItem = (item) => t("a " + item.name.toLowerCase());
  const itemName = (item) => t(item.name).toLowerCase();
  let round, score, deck, current, locked, results;

  const fmt = (v) => (v < 0.2 ? (v * 100).toFixed(1) + "¢" : v < 1 ? Math.round(v * 100) + "¢" : "$" + v.toFixed(2));
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  function makeRound(item) {
    const years = Object.keys(item.prices).filter((y) => y !== NOW && +y <= 2015);
    const year = years[Math.floor(Math.random() * years.length)];
    const then = item.prices[year], now = item.prices[NOW];
    const cpi = CPI_ANNUAL[NOW] / CPI_ANNUAL[year];
    const inflAdj = then * cpi;
    // A log-scale slider whose ends depend on the old price and inflation, not on the answer.
    const lo = Math.min(then * 0.5, now * 0.8), hi = Math.max(inflAdj * 3, now * 1.25);
    return { item, year, then, now, cpi, inflAdj, lo, hi };
  }
  const toPrice = (v) => current.lo * Math.pow(current.hi / current.lo, v / STEPS);
  const toStep = (p) => Math.round((Math.log(p / current.lo) / Math.log(current.hi / current.lo)) * STEPS);

  // 100 for a bullseye, about 75 at 10% off, 50 at 20% off, 0 past ~50% off.
  const points = (guess, real) => Math.max(0, Math.round(100 - Math.abs(Math.log(guess / real)) * 250));
  const rating = (p) => t(p >= 88 ? "🎯 Bullseye!" : p >= 65 ? "🔥 Very close" : p >= 40 ? "👍 Ballpark" : p > 0 ? "😬 A bit off" : "❌ Way off");

  function start() {
    round = 0; score = 0; results = [];
    deck = shuffle(PRICES.filter((p) => p.prices[NOW]));
    next();
  }

  function next() {
    current = makeRound(deck[round % deck.length]);
    locked = false;
    draw();
  }

  function draw() {
    const c = current;
    root.innerHTML = `
      <div class="small muted">${t("Round {n} of {total} · {score} pts", { n: round + 1, total: ROUNDS, score })}</div>
      <div class="step-dots">${Array.from({ length: ROUNDS }, (_, i) => `<span class="${i < round ? "on" : ""}"></span>`).join("")}</div>
      <div class="ptm-item">
        <div class="emoji">${c.item.emoji}</div>
        <p style="margin:8px 0 0">${t("In <strong>{year}</strong>, {item} cost about", { year: c.year, item: aItem(c.item) })}</p>
        <div class="then">${fmt(c.then)}</div>
        <p class="quiz-q" style="margin-top:8px"><label for="ptm-guess">${t("What did it cost in {year}?", { year: NOW })}</label></p>
      </div>
      <div class="ptm-slider">
        <div class="ptm-guess" id="ptm-out" aria-hidden="true">${fmt(c.then)}</div>
        <input type="range" id="ptm-guess" min="0" max="${STEPS}" step="1" value="${toStep(c.then)}" aria-valuetext="${fmt(c.then)}">
        <div class="small muted" style="display:flex;justify-content:space-between"><span>${fmt(c.lo)}</span><span>${fmt(c.hi)}</span></div>
        <p class="small muted" style="margin:10px 0 0">${t("📏 Overall prices rose <strong>{pct}%</strong> since {year}.", { pct: Math.round((c.cpi - 1) * 100), year: c.year })}
          <button class="chip" data-snap type="button">${t("Snap to inflation")}</button></p>
        <div style="text-align:center;margin-top:14px"><button class="btn btn-primary" data-lock>${t("Lock in guess")}</button></div>
      </div>
      <div id="ptm-feedback" style="max-width:600px;margin:16px auto 0" aria-live="polite"></div>`;
  }

  function showGuess() {
    const r = document.getElementById("ptm-guess");
    const p = toPrice(+r.value);
    document.getElementById("ptm-out").textContent = fmt(p);
    r.setAttribute("aria-valuetext", fmt(p));
  }

  function lock() {
    if (locked) return;
    locked = true;
    const c = current, guess = toPrice(+document.getElementById("ptm-guess").value);
    const pts = points(guess, c.now);
    score += pts;
    results.push({ c, guess, pts });
    root.querySelectorAll("#ptm-guess,[data-snap],[data-lock]").forEach((b) => (b.disabled = true));
    const vsInfl = c.now / c.inflAdj - 1;
    const verdict = Math.abs(vsInfl) < 0.08 ? t("rose about in line with overall inflation")
      : vsInfl > 0 ? t("rose <strong>faster</strong> than inflation ({pct}% above)", { pct: Math.round(vsInfl * 100) })
      : t("actually got <strong>cheaper</strong> after inflation ({pct}% below)", { pct: Math.round(-vsInfl * 100) });
    const off = guess / c.now - 1;
    document.getElementById("ptm-feedback").innerHTML = `<div class="feedback" style="display:block">
        <strong>${rating(pts)} ${t("+{n} pts.", { n: pts })}</strong> ${t("You guessed {guess}; the {year} average was <strong>{real}</strong>", { guess: fmt(guess), year: NOW, real: fmt(c.now) })}
        (${Math.abs(off) < 0.01 ? t("you were within 1%") : t(off > 0 ? "you were {pct}% high" : "you were {pct}% low", { pct: Math.round(Math.abs(off) * 100) })}).
        ${t("If it had simply kept pace with inflation since {year}, it would cost {price} — so this item {verdict}.", { year: c.year, price: fmt(c.inflAdj), verdict })}
        ${history(c, guess)}
      </div>
      <div style="text-align:center;margin-top:12px"><button class="btn btn-primary" data-next>${round + 1 < ROUNDS ? t("Next item →") : t("See results →")}</button></div>`;
    root.querySelector("[data-next]").focus({ preventScroll: true });
  }

  // Real price history vs. the path it would have taken if it only tracked inflation from the starting year.
  function history(c, guess) {
    const years = Object.keys(c.item.prices).sort();
    const infl = (y) => c.then * CPI_ANNUAL[y] / CPI_ANNUAL[c.year];
    const W = 560, H = 190, m = { t: 12, r: 16, b: 24, l: 48 };
    const y0 = +years[0], y1 = +NOW;
    const vals = [...years.map((y) => c.item.prices[y]), ...years.filter((y) => +y >= +c.year).map(infl), guess];
    const max = Math.max(...vals) * 1.1;
    const x = (y) => m.l + ((+y - y0) / (y1 - y0)) * (W - m.l - m.r);
    const yy = (v) => m.t + (H - m.t - m.b) * (1 - v / max);
    const path = (pts) => pts.map(([a, b], i) => `${i ? "L" : "M"}${x(a).toFixed(1)},${yy(b).toFixed(1)}`).join("");
    const real = path(years.map((y) => [y, c.item.prices[y]]));
    const inf = path(years.filter((y) => +y >= +c.year).map((y) => [y, infl(y)]));
    const s1 = css("--series-1"), s2 = css("--series-2"), mu = css("--muted");
    let svg = `<div class="chart" style="margin-top:12px;max-width:${W}px"><svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${t("{item} price history: {list}", { item: t(c.item.name), list: years.map((y) => `${y} ${fmt(c.item.prices[y])}`).join(", ") })}">`;
    for (let k = 0; k <= 3; k++) { const v = (max / 3) * k; svg += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${yy(v)}" y2="${yy(v)}"/><g class="axis"><text x="${m.l - 6}" y="${yy(v) + 4}" text-anchor="end">${fmt(v)}</text></g>`; }
    for (let yr = Math.ceil(y0 / 10) * 10; yr <= y1; yr += 10) svg += `<g class="axis"><text x="${x(yr)}" y="${H - 6}" text-anchor="middle">${yr}</text></g>`;
    svg += `<path d="${inf}" fill="none" stroke="${s1}" stroke-width="2" stroke-dasharray="5 4"/>`;
    svg += `<path d="${real}" fill="none" stroke="${s2}" stroke-width="2.5" stroke-linejoin="round"/>`;
    svg += `<circle cx="${x(c.year)}" cy="${yy(c.then)}" r="4" fill="${s2}"/>`;
    svg += `<circle cx="${x(NOW)}" cy="${yy(c.now)}" r="4.5" fill="${s2}"/>`;
    svg += `<line x1="${x(NOW) - 7}" x2="${x(NOW) + 7}" y1="${yy(guess)}" y2="${yy(guess)}" stroke="${mu}" stroke-width="3"/>`;
    svg += `</svg></div><div class="chart-legend small" style="margin-top:6px"><span><i style="background:${s2}"></i>${t("Real price ({price} in {year})", { price: fmt(c.now), year: NOW })}</span><span><i style="background:${s1}"></i>${t("If it only kept up with inflation from {year}", { year: c.year })}</span><span><i style="background:${mu};height:3px;vertical-align:3px"></i>${t("Your guess")}</span></div>`;
    return svg;
  }

  function end() {
    const { best, isNew } = FG.recordBest("prices", score);
    const xp = Math.round(score / 16);
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    const beat = results.filter((r) => r.c.now > r.c.inflAdj * 1.08), lag = results.filter((r) => r.c.now < r.c.inflAdj * 0.92);
    const bestRound = results.reduce((a, b) => (b.pts > a.pts ? b : a));
    const name = (r) => `${r.c.item.emoji} ${itemName(r.c.item)}`;
    root.innerHTML = `<div class="result">
      <div class="card-icon" style="font-size:2.4rem">🛒</div>
      <div class="big">${score} / ${ROUNDS * 100}</div>
      <p class="small muted">${isNew ? t("🏆 New best!") : best > ROUNDS ? t("Best: {best}", { best: t("{n} pts", { n: best }) }) : t("Best: {best}", { best: t("{n}/{total} correct (old version)", { n: best, total: ROUNDS }) })} · +${xp} XP</p>
      <ul class="small" style="text-align:left;max-width:520px;margin:12px auto">
        <li>${t("Closest guess: {item} ({rating})", { item: name(bestRound), rating: rating(bestRound.pts) })}</li>
        ${beat.length ? `<li>${t("Beat inflation: {items}", { items: beat.map(name).join(", ") })}</li>` : ""}
        ${lag.length ? `<li>${t("Got cheaper after inflation: {items}", { items: lag.map(name).join(", ") })}</li>` : ""}
      </ul>
      <div class="callout" style="text-align:left">${t("<strong>Money lesson:</strong> since 1980, overall prices roughly quadrupled. Some things (eggs, beef, bacon) rose even faster, while others (gas, bananas, electricity) got cheaper after inflation. Cash sitting still loses buying power — investing is how you keep up. See the <a href=\"invest.html#inflation\">inflation section</a>.")}</div>
      <button class="btn btn-primary" data-restart>${t("Play again")}</button></div>`;
  }

  root.addEventListener("input", (e) => { if (e.target.id === "ptm-guess") showGuess(); });
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-snap]")) { document.getElementById("ptm-guess").value = toStep(current.inflAdj); return showGuess(); }
    if (e.target.closest("[data-lock]")) return lock();
    if (e.target.closest("[data-next]")) { round++; return round < ROUNDS ? next() : end(); }
    if (e.target.closest("[data-restart]")) start();
  });
  root.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.id === "ptm-guess") { e.preventDefault(); lock(); } });

  // A round in progress is redrawn in the new language only before its guess is locked; the slider keeps its spot.
  document.addEventListener("langchange", () => {
    if (!current || locked) return;
    const pos = document.getElementById("ptm-guess").value;
    draw();
    document.getElementById("ptm-guess").value = pos; showGuess();
  });
  return { show() { if (round === undefined) start(); }, hide() {} };
})();
