// Market Rollercoaster — 20 simulated years of a stock index with two crashes.
// Lesson: time in the market beats timing the market; panic-selling locks in losses.
window.Games = window.Games || {};
Games.market = (() => {
  const $ = (id) => document.getElementById(id);
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const MONTHS = 240, START = 10000, STEP_MS = 70, CASH_RATE = 0.0017;
  const PANIC = [
    "📉 Markets plunge! Experts warn the worst is yet to come.",
    "😱 'Get out while you can,' says a TV pundit.",
    "📉 Your neighbor just sold everything. Should you?",
    "🔻 Headlines: 'Is this the next Great Depression?'",
    "📉 Another red month. Your portfolio is way down.",
  ];
  const BOOM = [
    "🚀 Stocks hit a new all-time high!",
    "📈 Markets roar back. Investors who held are smiling.",
    "🎉 Recovery complete — and then some.",
  ];

  let path, i, you, hold, invested, trades, timer, youHist, holdHist, cashSpans, peak, lastHeadline, inCrash;

  const noise = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.08;
  function makePath() {
    const r = Array.from({ length: MONTHS }, () => 0.007 + noise() * 0.5);
    const crash = (start, len, depth, recLen, rec) => {
      for (let k = 0; k < len; k++) r[start + k] = -depth + noise() * 0.3;
      for (let k = 0; k < recLen; k++) r[start + len + k] = rec + noise() * 0.3;
    };
    crash(30 + Math.floor(Math.random() * 50), 8, 0.055, 12, 0.035);
    crash(140 + Math.floor(Math.random() * 50), 6, 0.07, 10, 0.045);
    return r;
  }

  function reset() {
    clearInterval(timer);
    path = makePath();
    i = 0; you = hold = START; invested = true; trades = 0; peak = START; lastHeadline = 0; inCrash = false;
    youHist = [START]; holdHist = [START]; cashSpans = [];
    $("mk-headline").textContent = "";
    $("mk-headline").className = "headline";
    $("mk-status").textContent = "";
    $("mk-toggle").hidden = true;
    updateToggle();
    stats();
    draw();
  }

  function start() {
    reset();
    $("mk-start").hidden = true;
    $("mk-toggle").hidden = false;
    $("mk-headline").textContent = "🎢 Here we go! You're fully invested.";
    timer = setInterval(step, STEP_MS);
  }

  function step() {
    const ret = path[i];
    hold *= 1 + ret;
    you *= invested ? 1 + ret : 1 + CASH_RATE;
    i++;
    youHist.push(you); holdHist.push(hold);
    if (!invested) cashSpans[cashSpans.length - 1][1] = i;

    // Headlines driven by the market's drawdown from its peak
    peak = Math.max(peak, hold);
    const dd = 1 - hold / peak;
    const h = $("mk-headline");
    if (dd > 0.15 && i - lastHeadline > 6) {
      inCrash = true; lastHeadline = i;
      h.textContent = PANIC[Math.floor(Math.random() * PANIC.length)];
      h.className = "headline panic";
    } else if (inCrash && hold >= peak) {
      inCrash = false; lastHeadline = i;
      h.textContent = BOOM[Math.floor(Math.random() * BOOM.length)];
      h.className = "headline boom";
    }

    stats();
    draw();
    if (i >= MONTHS) end();
  }

  function toggle() {
    invested = !invested;
    trades++;
    if (!invested) cashSpans.push([i, i]);
    updateToggle();
  }
  function updateToggle() {
    const b = $("mk-toggle");
    b.className = "btn " + (invested ? "btn-sell" : "btn-buy");
    b.textContent = invested ? "😱 SELL everything" : "💪 BUY back in";
    $("mk-status").textContent = invested ? "You're invested." : "You're in cash (earning ~2%/yr).";
  }

  function stats() {
    $("mk-you").textContent = FG.money(you);
    $("mk-hold").textContent = FG.money(hold);
    $("mk-year").textContent = (i / 12).toFixed(1);
  }

  function end() {
    clearInterval(timer);
    $("mk-toggle").hidden = true;
    $("mk-start").hidden = false;
    $("mk-start").textContent = "↻ Ride again (new market)";
    const diff = you - hold;
    const beat = you >= hold * 0.98;
    const xp = 20 + (beat ? 20 : 0);
    const { isNew } = FG.recordBest("market", Math.round(you));
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    const h = $("mk-headline");
    h.className = "headline " + (beat ? "boom" : "panic");
    h.innerHTML = trades === 0
      ? `🏆 You held through every crash and turned $10,000 into ${FG.money(you)}. That's how investors win.`
      : beat
        ? `🎯 Nice timing — you finished with ${FG.money(you)} vs ${FG.money(hold)} buy-and-hold. Most people aren't that lucky.`
        : `😬 Selling cost you ${FG.money(-diff)}. Buy-and-hold ended at ${FG.money(hold)}; you ended at ${FG.money(you)}.`;
    $("mk-status").innerHTML = `${trades} trade${trades === 1 ? "" : "s"} · +${xp} XP${isNew ? " · 🏆 New best!" : ""}<br>
      <strong>Lesson:</strong> the best months often come right after the worst ones. Panic-selling usually means missing the rebound.`;
  }

  /* ---------- Chart ---------- */
  function niceMax(v) {
    const mag = Math.pow(10, Math.floor(Math.log10(v)));
    for (const s of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (s * mag >= v) return s * mag;
    return 10 * mag;
  }

  let geom;
  function draw() {
    const host = $("mk-chart");
    const W = host.clientWidth || 600, H = Math.round(Math.min(320, Math.max(220, W * 0.45)));
    const m = { t: 10, r: 10, b: 26, l: 56 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const max = niceMax(Math.max(START * 2, ...youHist, ...holdHist) * 1.05);
    const x = (k) => m.l + (k / MONTHS) * iw;
    const y = (v) => m.t + ih - (v / max) * ih;
    geom = { W, m, iw, x, y };
    const line = (arr) => arr.map((v, k) => `${k ? "L" : "M"}${x(k).toFixed(1)},${y(v).toFixed(1)}`).join("");
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Your portfolio versus buy and hold over 20 years">`;
    cashSpans.forEach(([a, b]) => {
      svg += `<rect x="${x(a)}" y="${m.t}" width="${Math.max(1, x(b) - x(a))}" height="${ih}" fill="${css("--surface-2")}"/>`;
    });
    for (let k = 0; k <= 4; k++) {
      const v = (max / 4) * k;
      svg += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/><g class="axis"><text x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${FG.compact(v)}</text></g>`;
    }
    for (let yr = 0; yr <= 20; yr += 5) svg += `<g class="axis"><text x="${x(yr * 12)}" y="${H - 8}" text-anchor="middle">Yr ${yr}</text></g>`;
    svg += `<path d="${line(holdHist)}" fill="none" stroke="${css("--series-1")}" stroke-width="2" stroke-linejoin="round"/>`;
    svg += `<path d="${line(youHist)}" fill="none" stroke="${css("--series-2")}" stroke-width="2" stroke-linejoin="round"/>`;
    const n = youHist.length - 1;
    svg += `<circle cx="${x(n)}" cy="${y(youHist[n])}" r="4" fill="${css("--series-2")}" stroke="${css("--surface")}" stroke-width="2"/>`;
    svg += `<line id="mk-cross" x1="0" x2="0" y1="${m.t}" y2="${m.t + ih}" stroke="${css("--muted")}" stroke-width="1" opacity="0"/>`;
    if (cashSpans.length) svg += `<g class="axis"><text x="${x(cashSpans[0][0]) + 4}" y="${m.t + 12}">in cash</text></g>`;
    svg += `</svg><div class="tooltip" id="mk-tip"></div>`;
    host.innerHTML = svg;
  }

  $("mk-chart").addEventListener("mousemove", (e) => {
    if (!geom || !youHist) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * geom.W;
    const k = Math.round(((px - geom.m.l) / geom.iw) * MONTHS);
    const tip = $("mk-tip"), cross = $("mk-cross");
    if (k < 0 || k >= youHist.length) { tip.style.opacity = 0; cross.setAttribute("opacity", 0); return; }
    cross.setAttribute("x1", geom.x(k)); cross.setAttribute("x2", geom.x(k)); cross.setAttribute("opacity", 0.6);
    tip.innerHTML = `<strong>Year ${(k / 12).toFixed(1)}</strong>
      <div class="row"><span><i style="background:${css("--series-2")}"></i>You</span><span>${FG.money(youHist[k])}</span></div>
      <div class="row"><span><i style="background:${css("--series-1")}"></i>Buy &amp; hold</span><span>${FG.money(holdHist[k])}</span></div>`;
    const lx = (geom.x(k) / geom.W) * rect.width;
    tip.style.left = (lx + 200 > rect.width ? lx - 190 : lx + 12) + "px";
    tip.style.top = "10px";
    tip.style.opacity = 1;
  });
  $("mk-chart").addEventListener("mouseleave", () => { const t = $("mk-tip"); if (t) t.style.opacity = 0; });

  $("mk-start").addEventListener("click", start);
  $("mk-toggle").addEventListener("click", toggle);
  addEventListener("keydown", (e) => { if (e.code === "Space" && !$("mk-toggle").hidden && !$("game-market").hidden) { e.preventDefault(); toggle(); } });
  document.addEventListener("themechange", () => path && draw());
  addEventListener("resize", () => path && !$("game-market").hidden && draw());

  return {
    show() { if (!path) reset(); else draw(); },
    hide() { if (timer && i < MONTHS && i > 0) { clearInterval(timer); timer = null; $("mk-start").hidden = false; $("mk-start").textContent = "▶ Start a new ride"; $("mk-toggle").hidden = true; } },
  };
})();
