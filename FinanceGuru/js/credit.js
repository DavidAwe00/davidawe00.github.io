// Credit & debt hub: illustrative credit score model, credit card payoff, student loan plan comparison.
(function () {
  const $ = (id) => document.getElementById(id);
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
  const fmtMonths = (m) => {
    const y = Math.floor(m / 12), mo = m % 12;
    return [y ? `${y} yr` : "", mo ? `${mo} mo` : ""].filter(Boolean).join(" ") || "0 mo";
  };

  /* ---------- Credit score (illustrative; model in js/creditmodel.js) ---------- */
  const { FACTORS, TIERS } = CREDIT_MODEL;

  function score() {
    const late = +$("cs-late").value, util = +$("cs-util").value, age = +$("cs-age").value, inq = +$("cs-inq").value, mix = +$("cs-mix").value;
    $("cs-late-l").textContent = late; $("cs-util-l").textContent = util; $("cs-age-l").textContent = age;
    $("cs-inq-l").textContent = inq; $("cs-mix-l").textContent = mix;
    const { score: s, f } = CREDIT_MODEL.score({ late, util, age, inq, mix });
    const tier = CREDIT_MODEL.tier(s);
    const pos = ((s - 300) / 550) * 100;
    $("cs-gauge").innerHTML = `
      <div class="gauge-top"><div><div class="small muted">Illustrative score</div><div class="gauge-num">${s}</div></div><span class="badge done" style="font-size:.9rem">${tier}</span></div>
      <div class="gauge-bar">${TIERS.map(([min, name], i) => {
        const max = TIERS[i + 1] ? TIERS[i + 1][0] : 851;
        return `<span style="flex:${max - min}" class="${name === tier ? "on" : ""}" title="${name}: ${min}–${max - 1}"></span>`;
      }).join("")}<i style="left:${pos}%"></i></div>
      <div class="gauge-labels">${TIERS.map(([min, name], i) => {
        const max = TIERS[i + 1] ? TIERS[i + 1][0] : 850;
        return `<span style="left:${(((min + max) / 2 - 300) / 550) * 100}%">${name}<br>${min}+</span>`;
      }).join("")}</div>`;
    $("cs-bars").innerHTML = FACTORS.map((x) => {
      const max = x.w * 550, got = max * f[x.key];
      return `<div class="hb-row"><span class="hb-name">${x.name}<small>${Math.round(x.w * 100)}% of the score</small></span>
        <div class="hb-track"><span class="hb-track-bg" style="width:${(max / 192.5) * 100}%"></span><span class="hb-bar" style="width:${(got / 192.5) * 100}%"></span></div>
        <span class="hb-val">${Math.round(got)}<small class="muted">/${Math.round(max)}</small></span></div>`;
    }).join("");
    const gaps = FACTORS.map((x) => ({ ...x, gap: x.w * (1 - f[x.key]) })).sort((a, b) => b.gap - a.gap);
    const TIPS = {
      pay: "Late payments hurt the most. Set up autopay for at least the minimum, and they fade in importance over time.",
      util: "Pay down card balances or pay before the statement date to lower utilization — it can lift a score quickly.",
      age: "History length only grows with time. Keep your oldest accounts open and be patient.",
      new: "Several applications in a short time can signal risk. Space out new credit.",
      mix: "Having different kinds of credit helps a little — but never take on debt just for the mix.",
    };
    $("cs-tip").innerHTML = gaps[0].gap < 0.01
      ? "<strong>Excellent habits!</strong> This profile is near the top of the scale."
      : `<strong>Biggest opportunity: ${gaps[0].name.toLowerCase()}.</strong> ${TIPS[gaps[0].key]}`;
  }
  ["cs-late", "cs-util", "cs-age", "cs-inq", "cs-mix"].forEach((id) => $(id).addEventListener("input", score));

  /* ---------- Credit card payoff ---------- */
  function payoff(balance, apr, payFn) {
    const r = apr / 100 / 12, bals = [balance];
    let bal = balance, interest = 0, m = 0;
    while (bal > 0.005 && m < 600) {
      const i = bal * r, pay = payFn(bal, i);
      if (pay <= i) return { stuck: true, bals, interest, months: m };
      interest += i;
      bal = Math.max(0, bal + i - pay);
      bals.push(bal);
      m++;
    }
    return { stuck: m >= 600, bals, interest, months: m };
  }
  function cards() {
    const bal = num("cc-bal"), apr = num("cc-apr"), fixed = num("cc-fixed");
    const min = payoff(bal, apr, (b, i) => Math.min(b + i, Math.max(25, b * 0.01 + i)));
    const fix = payoff(bal, apr, (b, i) => Math.min(b + i, fixed));
    $("cc-min-time").textContent = min.stuck ? "50+ yrs" : fmtMonths(min.months);
    $("cc-min-int").textContent = FG.money(min.interest);
    $("cc-fix-label").textContent = `${FG.money(fixed)}/mo: time`;
    $("cc-fix-time").textContent = fix.stuck ? "Never" : fmtMonths(fix.months);
    $("cc-fix-int").textContent = fix.stuck ? "∞" : FG.money(fix.interest);
    const n = Math.max(min.bals.length, fix.stuck ? 0 : fix.bals.length);
    const pad = (a) => Array.from({ length: n }, (_, i) => (i < a.length ? a[i] : 0));
    const series = [{ name: "Minimum payments", color: "--series-2", values: pad(min.bals) }];
    if (!fix.stuck) series.unshift({ name: `${FG.money(fixed)}/month`, color: "--series-1", values: pad(fix.bals) });
    Charts.line($("cc-chart"), {
      x: Array.from({ length: n }, (_, i) => i), xFormat: (m) => (n > 36 ? `Yr ${+(m / 12).toFixed(1)}` : `Mo ${m}`),
      label: "Credit card balance over time", series, yFormat: FG.compact, tipFormat: (v) => FG.money(v),
      tipTitle: (i) => `Month ${i}${i >= 12 ? ` (year ${(i / 12).toFixed(1)})` : ""}`,
    });
    $("cc-insight").innerHTML = fix.stuck
      ? `<strong>Warning:</strong> ${FG.money(fixed)}/month doesn't even cover the interest (${FG.money(bal * apr / 1200)} in the first month). The balance would never shrink.`
      : `Paying ${FG.money(fixed)}/month instead of the minimum saves <strong>${FG.money(min.interest - fix.interest)}</strong> in interest and gets you debt-free <strong>${fmtMonths(Math.max(0, min.months - fix.months))} sooner</strong>. The minimum payment shrinks as your balance does — which is exactly why it takes so long.`;
  }
  ["cc-bal", "cc-apr", "cc-fixed"].forEach((id) => $(id).addEventListener("input", cards));

  /* ---------- Student loans ---------- */
  const tieredYears = (b) => (b < 25000 ? 10 : b < 50000 ? 15 : b < 100000 ? 20 : 25);
  const amortized = (b, r, n) => (r === 0 ? b / n : (b * r) / (1 - Math.pow(1 + r, -n)));
  function rapMonthly(agi, deps) {
    if (agi <= 10000) return 10;
    const pct = Math.min(10, Math.ceil((agi - 10000) / 10000));
    return Math.max(10, (agi * pct) / 100 / 12 - 50 * deps);
  }
  function fixedPlan(bal, r, years) {
    const n = years * 12, p = amortized(bal, r, n), yearly = [bal];
    let b = bal;
    for (let m = 1; m <= 360; m++) {
      if (m <= n) b = Math.max(0, b * (1 + r) - p);
      if (m % 12 === 0) yearly.push(b);
    }
    return { first: p, total: p * n, months: n, forgiven: 0, yearly };
  }
  function rapPlan(bal, r, agi, growth, deps) {
    let b = bal, paid = 0, m = 0, first = null, help = 0;
    const yearly = [bal];
    for (m = 1; m <= 360 && b > 0.005; m++) {
      const income = agi * Math.pow(1 + growth, Math.floor((m - 1) / 12));
      let p = rapMonthly(income, deps);
      if (first === null) first = p;
      const i = b * r;
      if (p >= b + i) { p = b + i; b = 0; paid += p; break; }
      const fromPay = Math.max(0, p - i);
      const cut = Math.max(fromPay, Math.min(p, 50)); // $50 principal match rule
      help += Math.max(0, i - p) + (cut - fromPay); // waived interest + government match
      b -= cut; paid += p;
      if (m % 12 === 0) yearly.push(b);
    }
    while (yearly.length < 31) yearly.push(b > 0.005 && m > 360 ? b : 0);
    return { first, total: paid, months: Math.min(m, 360), forgiven: m > 360 ? b : 0, yearly, help };
  }
  function loans() {
    const bal = num("sl-bal"), r = num("sl-rate") / 100 / 12, agi = num("sl-agi"), g = +$("sl-growth").value / 100, deps = +$("sl-dep").value;
    $("sl-growth-l").textContent = $("sl-growth").value; $("sl-dep-l").textContent = deps;
    const ty = tieredYears(bal);
    const plans = [
      { name: `Tiered Standard (${ty} yrs)`, color: "--series-1", ...fixedPlan(bal, r, ty), note: "Fixed payment. No forgiveness." },
      { name: "RAP (income-based)", color: "--series-2", ...rapPlan(bal, r, agi, g, deps), note: "Payment rises with income." },
    ];
    if (ty > 10) plans.push({ name: "Pay it off in 10 yrs", color: "--series-3", ...fixedPlan(bal, r, 10), note: "Prepaying early is allowed — no penalty." });
    $("sl-plans").innerHTML = plans.map((p) => `
      <div class="plan-card" style="border-top-color:var(${p.color})">
        <strong>${p.name}</strong>
        <div class="plan-pay">${FG.money(p.first)}<small>/mo${p.name.startsWith("RAP") ? " to start" : ""}</small></div>
        <div class="kv"><span>Paid off in</span><span>${p.forgiven > 0 ? "30 yrs (rest forgiven)" : fmtMonths(p.months)}</span></div>
        <div class="kv"><span>Total you pay</span><strong>${FG.money(p.total)}</strong></div>
        ${p.forgiven > 0 ? `<div class="kv"><span>Forgiven</span><span>${FG.money(p.forgiven)}</span></div>` : ""}
        <p class="small muted" style="margin:6px 0 0">${p.note}</p>
      </div>`).join("");
    Charts.line($("sl-chart"), {
      x: Array.from({ length: 31 }, (_, i) => i), xFormat: (y) => `Yr ${y}`, label: "Loan balance by plan",
      series: plans.map((p) => ({ name: p.name, color: p.color, values: p.yearly.slice(0, 31) })),
      yFormat: FG.compact, tipFormat: (v) => FG.money(v), tipTitle: (i) => `After ${i} year${i === 1 ? "" : "s"}`,
    });
    const [std, rap] = plans;
    const cheaper = rap.total < std.total ? rap : std;
    $("sl-insight").innerHTML = `With these numbers, <strong>${cheaper === rap ? "RAP" : "the Tiered Standard plan"}</strong> costs less in total (${FG.money(cheaper.total)}).
      RAP starts at ${FG.money(rap.first)}/month vs ${FG.money(std.first)} on Tiered Standard${rap.help > 1 ? `, and the government would cover about ${FG.money(rap.help)} in waived interest and principal matches` : ""}.
      ${rap.forgiven > 0 ? `About ${FG.money(rap.forgiven)} would be forgiven after 30 years (possibly taxable).` : ""} Lower payments usually mean paying longer — pick based on your budget and job stability.`;
  }
  ["sl-bal", "sl-rate", "sl-agi", "sl-growth", "sl-dep"].forEach((id) => $(id).addEventListener("input", loans));

  /* ---------- Init ---------- */
  score(); cards(); loans();
  const redraw = () => { cards(); loans(); };
  let t;
  addEventListener("resize", () => { clearTimeout(t); t = setTimeout(redraw, 150); });
  document.addEventListener("themechange", redraw);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", redraw);
})();
