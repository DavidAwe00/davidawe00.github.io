// Market Rollercoaster — 20 simulated years of a stock/bond portfolio with one to three crashes.
// Lessons: time in the market beats timing the market; panic-selling locks in losses and misses
// the rebound; steady contributions buy cheap shares in crashes; bonds cushion falls; fees compound.
window.Games = window.Games || {};
Games.market = (() => {
  const $ = (id) => document.getElementById(id);
  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const t = (s, v) => (typeof I18N === "object" ? I18N.t(s, v) : s);
  const MONTHS = 240, START = 10000, CASH_RATE = 0.0017, INDEX_FEE = 0.0005;
  const PANIC = [
    "📉 Markets plunge! Experts warn the worst is yet to come.",
    "😱 'Get out while you can,' says a TV pundit.",
    "📉 Your neighbor just sold everything. Should you?",
    "🔻 Headlines: 'Is this the next Great Depression?'",
    "📉 Another red month. Your portfolio is way down.",
    "🧯 'Cash is king,' declares a viral finance video.",
  ];
  const BOOM = [
    "🚀 Stocks hit a new all-time high!",
    "📈 Markets roar back. Investors who held are smiling.",
    "🎉 Recovery complete — and then some.",
  ];
  const FOMO = [
    "🤑 Everyone at work is talking about how rich they're getting.",
    "📈 'Stocks only go up,' says a stranger online.",
  ];

  let cfg, stocks, bonds, i, you, hold, holdIdx, invested, trades, timer, paused, youHist, holdHist, cashSpans,
      peak, youPeak, maxDD, lastHeadline, inCrash, feesPaid, monthsInCash, crashes;

  const noise = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.08;
  function makePaths() {
    const s = Array.from({ length: MONTHS }, () => 0.007 + noise() * 0.5);
    const b = Array.from({ length: MONTHS }, () => 0.0028 + noise() * 0.1);
    // One to three crashes of different depths, spread across the 20 years.
    const n = 1 + Math.floor(Math.random() * 3), slot = Math.floor((MONTHS - 40) / n);
    crashes = [];
    for (let c = 0; c < n; c++) {
      const start = 18 + c * slot + Math.floor(Math.random() * Math.max(1, slot - 40));
      const len = 4 + Math.floor(Math.random() * 8), depth = 0.04 + Math.random() * 0.04;
      const recLen = 8 + Math.floor(Math.random() * 10), rec = 0.025 + Math.random() * 0.025;
      for (let k = 0; k < len && start + k < MONTHS; k++) { s[start + k] = -depth + noise() * 0.3; b[start + k] += 0.003; }
      for (let k = 0; k < recLen && start + len + k < MONTHS; k++) s[start + len + k] = rec + noise() * 0.3;
      crashes.push(start);
    }
    return [s, b];
  }

  function readCfg() {
    return { mix: +$("mk-mix").value / 100, add: +$("mk-add").value, fee: +$("mk-fund").value, speed: +$("mk-speed").value };
  }
  function mixLabel() {
    const m = +$("mk-mix").value;
    $("mk-mix-out").textContent = m === 100 ? t("100% stocks") : m === 0 ? t("100% bonds") : t("{s}% stocks / {b}% bonds", { s: m, b: 100 - m });
  }

  function reset() {
    clearInterval(timer); timer = null; paused = false;
    cfg = readCfg();
    [stocks, bonds] = makePaths();
    i = 0; you = hold = holdIdx = START; invested = true; trades = 0; peak = youPeak = START; maxDD = 0;
    lastHeadline = 0; inCrash = false; feesPaid = 0; monthsInCash = 0;
    youHist = [START]; holdHist = [START]; cashSpans = [];
    $("mk-headline").textContent = "";
    $("mk-headline").className = "headline";
    $("mk-status").textContent = "";
    $("mk-report").innerHTML = "";
    $("mk-toggle").hidden = $("mk-pause").hidden = true;
    $("mk-setup").removeAttribute("aria-disabled");
    $("mk-setup").querySelectorAll("input,select").forEach((el) => (el.disabled = false));
    updateToggle();
    stats();
    draw();
  }

  function start() {
    reset();
    $("mk-setup").setAttribute("aria-disabled", "true");
    $("mk-setup").querySelectorAll("input,select").forEach((el) => (el.disabled = true));
    $("mk-start").hidden = true;
    $("mk-toggle").hidden = $("mk-pause").hidden = false;
    $("mk-pause").textContent = t("⏸ Pause");
    $("mk-headline").textContent = cfg.add ? t("🎢 Here we go! {pct}% stocks, adding {amount} a month.", { pct: Math.round(cfg.mix * 100), amount: FG.money(cfg.add) }) : t("🎢 Here we go! {pct}% stocks.", { pct: Math.round(cfg.mix * 100) });
    timer = setInterval(step, cfg.speed);
  }

  function step() {
    const ret = cfg.mix * stocks[i] + (1 - cfg.mix) * bonds[i];
    const fee = cfg.fee / 12;
    hold = hold * (1 + ret - fee) + cfg.add;
    holdIdx = holdIdx * (1 + ret - INDEX_FEE / 12) + cfg.add;
    if (invested) { feesPaid += you * fee; you = you * (1 + ret - fee) + cfg.add; }
    else { you = you * (1 + CASH_RATE) + cfg.add; monthsInCash++; }
    i++;
    youHist.push(you); holdHist.push(hold);
    if (!invested) cashSpans[cashSpans.length - 1][1] = i;
    youPeak = Math.max(youPeak, you);
    maxDD = Math.max(maxDD, 1 - you / youPeak);

    // Headlines driven by the market's drawdown from its peak
    peak = Math.max(peak, hold);
    const dd = 1 - hold / peak;
    const h = $("mk-headline");
    if (dd > 0.12 && i - lastHeadline > 6) {
      inCrash = true; lastHeadline = i;
      h.textContent = t(PANIC[Math.floor(Math.random() * PANIC.length)]) + " " + t("(down {pct}% from the top)", { pct: Math.round(dd * 100) });
      h.className = "headline panic";
    } else if (inCrash && hold >= peak) {
      inCrash = false; lastHeadline = i;
      h.textContent = t(BOOM[Math.floor(Math.random() * BOOM.length)]);
      h.className = "headline boom";
    } else if (!inCrash && !invested && i - lastHeadline > 24) {
      lastHeadline = i;
      h.textContent = t(FOMO[Math.floor(Math.random() * FOMO.length)]);
      h.className = "headline boom";
    }

    stats();
    draw();
    if (i >= MONTHS) end();
  }

  function toggle() {
    if (!timer && !paused) return;
    invested = !invested;
    trades++;
    if (!invested) cashSpans.push([i, i]);
    updateToggle();
  }
  function pause() {
    if (!timer && !paused) return;
    paused = !paused;
    if (paused) { clearInterval(timer); timer = null; $("mk-pause").textContent = t("▶ Resume"); $("mk-status").textContent = t("Paused. Take a breath."); }
    else { timer = setInterval(step, cfg.speed); $("mk-pause").textContent = t("⏸ Pause"); updateToggle(); }
  }
  function updateToggle() {
    const b = $("mk-toggle");
    b.className = "btn " + (invested ? "btn-sell" : "btn-buy");
    b.textContent = invested ? t("😱 SELL everything") : t("💪 BUY back in");
    $("mk-status").textContent = invested ? t("You're invested.") : t("You're in cash (earning ~2%/yr).");
  }

  function stats() {
    $("mk-you").textContent = FG.money(you);
    $("mk-hold").textContent = FG.money(hold);
    $("mk-year").textContent = (i / 12).toFixed(1);
  }

  function end() {
    clearInterval(timer); timer = null; paused = false;
    $("mk-toggle").hidden = $("mk-pause").hidden = true;
    $("mk-start").hidden = false;
    $("mk-start").textContent = t("↻ Ride again (new market)");
    $("mk-setup").removeAttribute("aria-disabled");
    $("mk-setup").querySelectorAll("input,select").forEach((el) => (el.disabled = false));
    const diff = you - hold;
    const beat = you >= hold * 0.98;
    const xp = 20 + (beat ? 20 : 0);
    const { isNew } = FG.recordBest("market", Math.round(you));
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    const h = $("mk-headline");
    h.className = "headline " + (beat ? "boom" : "panic");
    h.innerHTML = trades === 0
      ? t("🏆 You held through every crash and finished with {you}. That's how investors win.", { you: FG.money(you) })
      : beat
        ? t("🎯 Nice timing — you finished with {you} vs {hold} buy-and-hold. Most people aren't that lucky.", { you: FG.money(you), hold: FG.money(hold) })
        : t("😬 Selling cost you {cost}. Buy-and-hold ended at {hold}; you ended at {you}.", { cost: FG.money(-diff), hold: FG.money(hold), you: FG.money(you) });
    $("mk-status").innerHTML = `${t(trades === 1 ? "{n} trade" : "{n} trades", { n: trades })} · +${xp} XP${isNew ? " · " + t("🏆 New best!") : ""}`;
    report();
  }

  // The debrief: what actually drove the result.
  function report() {
    const contributed = START + cfg.add * MONTHS;
    const growth = you - contributed;
    // Which of the market's 10 best months did you sit out?
    const portRet = stocks.map((r, k) => cfg.mix * r + (1 - cfg.mix) * bonds[k]);
    const best = portRet.map((r, k) => [r, k]).sort((a, b) => b[0] - a[0]).slice(0, 10).map(([, k]) => k);
    const inCash = (k) => cashSpans.some(([a, b]) => k >= a && k < b);
    const missed = best.filter(inCash).length;
    const feeGap = holdIdx - hold;
    const lessons = [];
    lessons.push(missed
      ? t("📆 You were in cash for {n} of the 10 best months. The best months usually come right after the worst ones, so panic-sellers tend to miss them.", { n: missed })
      : trades ? t("📆 You caught all 10 of the best months. Lucky timing is hard to repeat.") : t("📆 You were invested for all 10 of the best months, and most of them came right after crashes."));
    if (cfg.add) lessons.push(t("🪣 You added {amount} every month. During crashes that money bought shares on sale. That's dollar-cost averaging.", { amount: FG.money(cfg.add) }));
    lessons.push(cfg.mix >= 0.8
      ? t("🎢 At {pct}% stocks, your worst drop was {dd}%. That's the price of higher long-run growth.", { pct: Math.round(cfg.mix * 100), dd: Math.round(maxDD * 100) })
      : t("🛟 At {pct}% stocks, your worst drop was {dd}%. Smoother, but slower. Try a ride with more stocks and compare.", { pct: Math.round(cfg.mix * 100), dd: Math.round(maxDD * 100) }));
    lessons.push(cfg.fee > INDEX_FEE
      ? t("💸 The managed fund's 1% fee cost {amount} compared with the same ride in a 0.05% index fund. Small yearly fees compound.", { amount: FG.money(feeGap) })
      : t("💸 Your index fund charged only {amount} in fees over 20 years. A 1% fund would have cost thousands more.", { amount: FG.money(feesPaid) }));
    $("mk-report").innerHTML = `
      <div class="stats" style="margin-top:16px">
        <div class="stat"><div class="label">${t("You put in")}</div><div class="value">${FG.money(contributed)}</div></div>
        <div class="stat"><div class="label">${t("Growth")}</div><div class="value" style="color:${growth >= 0 ? "var(--good)" : "var(--bad)"}">${growth >= 0 ? "+" : "−"}${FG.money(Math.abs(growth))}</div></div>
        <div class="stat"><div class="label">${t("Worst drop")}</div><div class="value">−${Math.round(maxDD * 100)}%</div></div>
        <div class="stat"><div class="label">${t("Months in cash")}</div><div class="value">${monthsInCash}</div></div>
      </div>
      <div class="callout"><strong>${t(crashes.length === 1 ? "Your 20-year debrief ({n} crash):" : "Your 20-year debrief ({n} crashes):", { n: crashes.length })}</strong><ul class="small" style="margin:6px 0 0">${lessons.map((l) => `<li>${l}</li>`).join("")}</ul></div>`;
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
    const contributed = (k) => START + cfg.add * k;
    const max = niceMax(Math.max(START * 2, contributed(MONTHS) * 1.2, ...youHist, ...holdHist) * 1.05);
    const x = (k) => m.l + (k / MONTHS) * iw;
    const y = (v) => m.t + ih - (v / max) * ih;
    geom = { W, m, iw, x, y };
    const line = (arr) => arr.map((v, k) => `${k ? "L" : "M"}${x(k).toFixed(1)},${y(v).toFixed(1)}`).join("");
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${t("Your portfolio versus buy and hold over 20 years")}">`;
    cashSpans.forEach(([a, b]) => {
      svg += `<rect x="${x(a)}" y="${m.t}" width="${Math.max(1, x(b) - x(a))}" height="${ih}" fill="${css("--surface-2")}"/>`;
    });
    for (let k = 0; k <= 4; k++) {
      const v = (max / 4) * k;
      svg += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${y(v)}" y2="${y(v)}"/><g class="axis"><text x="${m.l - 8}" y="${y(v) + 4}" text-anchor="end">${FG.compact(v)}</text></g>`;
    }
    for (let yr = 0; yr <= 20; yr += 5) svg += `<g class="axis"><text x="${x(yr * 12)}" y="${H - 8}" text-anchor="middle">${t("Yr {n}", { n: yr })}</text></g>`;
    if (cfg.add) svg += `<path d="M${x(0)},${y(contributed(0))}L${x(youHist.length - 1)},${y(contributed(youHist.length - 1))}" fill="none" stroke="${css("--muted")}" stroke-width="1" stroke-dasharray="4 4"/>`;
    svg += `<path d="${line(holdHist)}" fill="none" stroke="${css("--series-1")}" stroke-width="2" stroke-linejoin="round"/>`;
    svg += `<path d="${line(youHist)}" fill="none" stroke="${css("--series-2")}" stroke-width="2" stroke-linejoin="round"/>`;
    const n = youHist.length - 1;
    svg += `<circle cx="${x(n)}" cy="${y(youHist[n])}" r="4" fill="${css("--series-2")}" stroke="${css("--surface")}" stroke-width="2"/>`;
    svg += `<line id="mk-cross" x1="0" x2="0" y1="${m.t}" y2="${m.t + ih}" stroke="${css("--muted")}" stroke-width="1" opacity="0"/>`;
    if (cashSpans.length) svg += `<g class="axis"><text x="${x(cashSpans[0][0]) + 4}" y="${m.t + 12}">${t("in cash")}</text></g>`;
    if (cfg.add && n > 30) svg += `<g class="axis"><text x="${x(n) - 4}" y="${y(contributed(n)) + 14}" text-anchor="end">${t("what you put in")}</text></g>`;
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
    tip.innerHTML = `<strong>${t("Year {n}", { n: (k / 12).toFixed(1) })}</strong>
      <div class="row"><span><i style="background:${css("--series-2")}"></i>${t("You")}</span><span>${FG.money(youHist[k])}</span></div>
      <div class="row"><span><i style="background:${css("--series-1")}"></i>${t("Buy &amp; hold")}</span><span>${FG.money(holdHist[k])}</span></div>
      ${cfg.add ? `<div class="row"><span>${t("Put in")}</span><span>${FG.money(START + cfg.add * k)}</span></div>` : ""}`;
    const lx = (geom.x(k) / geom.W) * rect.width;
    tip.style.left = (lx + 200 > rect.width ? lx - 190 : lx + 12) + "px";
    tip.style.top = "10px";
    tip.style.opacity = 1;
  });
  $("mk-chart").addEventListener("mouseleave", () => { const t = $("mk-tip"); if (t) t.style.opacity = 0; });

  $("mk-start").addEventListener("click", start);
  $("mk-toggle").addEventListener("click", toggle);
  $("mk-pause").addEventListener("click", pause);
  $("mk-mix").addEventListener("input", mixLabel);
  $("mk-setup").addEventListener("change", () => { if (!timer && !paused && i === 0) reset(); });
  addEventListener("keydown", (e) => {
    if ($("game-market").hidden || $("mk-toggle").hidden || e.target.closest("input,select,textarea")) return;
    if (e.code === "Space") { e.preventDefault(); toggle(); }
    if (e.key === "p" || e.key === "P") { e.preventDefault(); pause(); }
  });
  document.addEventListener("themechange", () => stocks && draw());
  document.addEventListener("langchange", () => { mixLabel(); if (stocks) draw(); });
  addEventListener("resize", () => stocks && !$("game-market").hidden && draw());

  return {
    show() { mixLabel(); if (!stocks) reset(); else draw(); },
    hide() {
      if ((timer || paused) && i < MONTHS && i > 0) {
        clearInterval(timer); timer = null; paused = false;
        $("mk-start").hidden = false; $("mk-start").textContent = t("▶ Start a new ride");
        $("mk-toggle").hidden = $("mk-pause").hidden = true;
        $("mk-setup").removeAttribute("aria-disabled");
        $("mk-setup").querySelectorAll("input,select").forEach((el) => (el.disabled = false));
      }
    },
  };
})();
