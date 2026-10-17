// Tools page: Retirement Check ("Am I on track?") and Roth vs Traditional.
(function () {
  const $ = (id) => document.getElementById(id);
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);

  /* ---------- Shared 2026 figures (sources cited on the page) ---------- */
  const SS = { bend1: 1286, bend2: 7749, wageMax: 184500, fra: 67 }; // SSA 2026 PIA bend points & taxable max
  const ROTH_PHASEOUT = TAX_2026.rothPhaseout; // brackets & deduction live in js/data/tax2026.js
  const FIDELITY = [[30, 1], [40, 3], [50, 6], [60, 8], [67, 10]];

  /* ---------- Social Security (rough) ---------- */
  function socialSecurity(salary, claimAge) {
    const aime = Math.min(salary, SS.wageMax) / 12;
    const pia = 0.9 * Math.min(aime, SS.bend1) + 0.32 * Math.max(0, Math.min(aime, SS.bend2) - SS.bend1) + 0.15 * Math.max(0, aime - SS.bend2);
    const months = (claimAge - SS.fra) * 12;
    let factor = 1;
    if (months < 0) {
      const early = -months;
      factor = 1 - Math.min(early, 36) * (5 / 900) - Math.max(0, early - 36) * (5 / 1200);
    } else factor = 1 + months * (2 / 300); // 8% per year of delay
    return pia * factor;
  }

  /* ---------- 4% rule backtest from real data ---------- */
  const REAL_6040 = MARKET_HISTORY.map((r, i) => (1 + 0.6 * r[1] + 0.4 * r[2]) / (1 + INFLATION[i][1]) - 1);
  function successRate(wr, years = 30) {
    let ok = 0, n = 0;
    for (let s = 0; s + years <= REAL_6040.length; s++) {
      let b = 1, failed = false;
      for (let k = 0; k < years; k++) { b -= wr; if (b < 0) { failed = true; break; } b *= 1 + REAL_6040[s + k]; }
      n++; if (!failed) ok++;
    }
    return { rate: ok / n, n };
  }

  /* ---------- Retirement check ---------- */
  function project(age, retireAge, saved, salary, rate, r) {
    const ages = [age], vals = [saved];
    let b = saved;
    for (let a = age + 1; a <= retireAge; a++) { b = b * (1 + r) + salary * rate; ages.push(a); vals.push(b); }
    return { ages, vals, end: b };
  }
  function benchmark(age) {
    if (age < 30) return null;
    for (let i = 0; i < FIDELITY.length - 1; i++) {
      const [a0, m0] = FIDELITY[i], [a1, m1] = FIDELITY[i + 1];
      if (age <= a1) return m0 + ((m1 - m0) * (age - a0)) / (a1 - a0);
    }
    return 10;
  }

  function retire() {
    const age = +$("rt-age").value;
    if (+$("rt-retire").value <= age) $("rt-retire").value = Math.min(70, age + 1);
    const retireAge = +$("rt-retire").value, salary = num("rt-salary"), saved = num("rt-saved");
    const rate = +$("rt-rate").value / 100, r = (parseFloat($("rt-return").value) || 0) / 100, wr = +$("rt-wr").value / 100;
    const spend = num("rt-spend");
    $("rt-age-l").textContent = age; $("rt-rate-l").textContent = $("rt-rate").value;
    $("rt-retire-l").textContent = retireAge; $("rt-wr-l").textContent = $("rt-wr").value; $("rt-at").textContent = retireAge;

    const ss = socialSecurity(salary, retireAge);
    const need = Math.max(0, spend - ss * 12) / wr;
    const p = project(age, retireAge, saved, salary, rate, r);
    const ratio = need === 0 ? 1 : p.end / need;

    // Saving rate that would hit the target (binary search).
    let lo = 0, hi = 1;
    for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; project(age, retireAge, saved, salary, mid, r).end >= need ? (hi = mid) : (lo = mid); }
    const needRate = hi;

    $("rt-proj").textContent = FG.money(p.end);
    $("rt-need").textContent = FG.money(need);
    $("rt-ss").textContent = FG.money(ss) + "/mo";
    const bm = benchmark(age);
    $("rt-bench").textContent = bm === null ? "1× by 30" : `${bm.toFixed(1)}× salary`;

    const status = ratio >= 1 ? ["🎉", "On track", "var(--good)"] : ratio >= 0.75 ? ["🙂", "Getting close", "var(--gold)"] : ["⚠️", "Behind — but fixable", "var(--bad)"];
    $("rt-status").innerHTML = `<div class="gauge-top"><div><div class="small muted">Retirement readiness</div><div class="gauge-num">${Math.round(Math.min(ratio, 9.99) * 100)}%</div></div>
      <span class="badge" style="font-size:.9rem;color:${status[2]}">${status[0]} ${status[1]}</span></div>
      <div class="meter" style="height:12px;margin-top:12px"><span style="width:${Math.min(100, ratio * 100)}%;background:${status[2]}"></span></div>`;

    Charts.line($("rt-chart"), {
      x: p.ages, xFormat: (a) => `Age ${a}`, label: "Projected retirement savings vs. target",
      series: [{ name: "Projected savings", color: "--series-1", values: p.vals }, { name: "What you'll need", color: "--series-2", values: p.ages.map(() => need), dash: true }],
      yFormat: FG.compact, tipFormat: (v) => FG.money(v), tipTitle: (i) => `Age ${p.ages[i]}`,
    });

    const sr = successRate(wr);
    const have = bm !== null && salary > 0 ? ` You have ${(saved / salary).toFixed(1)}× your salary saved today.` : "";
    $("rt-insight").innerHTML = (ratio >= 1
      ? `<strong>Nice!</strong> At ${Math.round(rate * 100)}% you're projected to reach your target by ${retireAge}.`
      : `<strong>To get on track</strong>, save about <strong>${Math.round(needRate * 100)}%</strong> of pay instead of ${Math.round(rate * 100)}% — or retire a bit later, which also raises Social Security.`)
      + have + ` <strong>History check:</strong> withdrawing ${(wr * 100).toFixed(1)}% a year (raised with inflation) from a 60/40 portfolio lasted 30 years in ${Math.round(sr.rate * 100)}% of the ${sr.n} periods since 1928.`;
  }
  ["rt-age", "rt-salary", "rt-saved", "rt-rate", "rt-retire", "rt-spend", "rt-return", "rt-wr"].forEach((id) => $(id).addEventListener("input", retire));
  $("rt-salary").addEventListener("change", () => { $("rt-spend").value = Math.round(num("rt-salary") * 0.8); retire(); });

  /* ---------- Roth vs Traditional ---------- */
  function bracketFor(status, income) {
    const { taxable, marginal } = federalTax(status, income);
    return { rate: marginal, taxable };
  }
  function roth() {
    const status = $("rv-status").value, income = num("rv-income"), c = num("rv-contrib");
    const later = parseFloat($("rv-later").value), n = +$("rv-years").value, r = (parseFloat($("rv-return").value) || 0) / 100;
    $("rv-years-l").textContent = n;
    const { rate: now, taxable } = bracketFor(status, income);
    const fv = (amt, years) => { let b = 0; for (let y = 0; y < years; y++) b = (b + amt) * (1 + r); return b; };
    const yrs = Array.from({ length: n + 1 }, (_, i) => i);
    const tradVals = yrs.map((y) => fv(c, y) * (1 - later));
    const rothVals = yrs.map((y) => fv(c * (1 - now), y));
    const t = tradVals[n], ro = rothVals[n];
    $("rv-now").textContent = Math.round(now * 100) + "%";
    $("rv-roth").textContent = FG.money(ro);
    $("rv-trad").textContent = FG.money(t);
    Charts.line($("rv-chart"), {
      x: yrs, xFormat: (y) => `Yr ${y}`, label: "After-tax value: Roth vs Traditional",
      series: [{ name: "Roth (tax-free)", color: "--series-1", values: rothVals }, { name: `Traditional (after ${Math.round(later * 100)}% tax)`, color: "--series-2", values: tradVals }],
      yFormat: FG.compact, tipFormat: (v) => FG.money(v), tipTitle: (i) => `After ${i} year${i === 1 ? "" : "s"}`,
    });
    const [p0, p1] = ROTH_PHASEOUT[status];
    const winner = Math.abs(now - later) < 0.001 ? "tie" : now < later ? "roth" : "trad";
    $("rv-insight").innerHTML = `Your taxable income is about ${FG.money(taxable)}, putting you in the <strong>${Math.round(now * 100)}%</strong> bracket today. `
      + (winner === "tie" ? "Same tax rate now and later — <strong>Roth and Traditional come out even</strong>. Roth gives more flexibility; Traditional lowers today's tax bill."
        : winner === "roth" ? `You expect a <strong>higher</strong> rate later (${Math.round(later * 100)}%), so <strong>Roth wins</strong> by about ${FG.money(ro - t)}: pay tax now while it's cheap.`
        : `You expect a <strong>lower</strong> rate later (${Math.round(later * 100)}%), so <strong>Traditional wins</strong> by about ${FG.money(t - ro)}: take the deduction now.`)
      + (income > p0 ? ` <br>⚠️ Heads-up: Roth IRA contributions phase out between ${FG.money(p0)} and ${FG.money(p1)} of modified AGI for your filing status (a Roth 401(k) has no income limit).` : "");
  }
  ["rv-status", "rv-income", "rv-contrib", "rv-later", "rv-years", "rv-return"].forEach((id) => $(id).addEventListener("input", roth));

  /* ---------- Init & redraw ---------- */
  retire(); roth();
  document.addEventListener("tabshow", (e) => { if (e.detail === "retire") retire(); if (e.detail === "roth") roth(); });
  let tm;
  addEventListener("resize", () => { clearTimeout(tm); tm = setTimeout(() => { retire(); roth(); }, 150); });
  document.addEventListener("themechange", () => { retire(); roth(); });
})();
