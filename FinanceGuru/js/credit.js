// Credit & debt hub: illustrative credit score model, credit card payoff, student loan plan comparison.
(function () {
  const $ = (id) => document.getElementById(id);
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
  const t = I18N.t;
  const fmtMonths = (m) => {
    const y = Math.floor(m / 12), mo = m % 12;
    return [y ? t("{n} yr", { n: y }) : "", mo ? t("{n} mo", { n: mo }) : ""].filter(Boolean).join(" ") || t("{n} mo", { n: 0 });
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
    // The top three tiers are too narrow for their names on small screens: show just the starting scores there
    // (the badge names the current tier, and each segment's title names its tier).
    const narrow = $("cs-gauge").clientWidth < 520;
    $("cs-gauge").innerHTML = `
      <div class="gauge-top"><div><div class="small muted">${t("Illustrative score")}</div><div class="gauge-num">${s}</div></div><span class="badge done" style="font-size:.9rem">${t(tier)}</span></div>
      <div class="gauge-bar">${TIERS.map(([min, name], i) => {
        const max = TIERS[i + 1] ? TIERS[i + 1][0] : 851;
        return `<span style="flex:${max - min}" class="${name === tier ? "on" : ""}" title="${t(name)}: ${min}–${max - 1}"></span>`;
      }).join("")}<i style="left:${pos}%"></i></div>
      <div class="gauge-labels"${narrow ? ' style="height:1.4em"' : ""}>${TIERS.map(([min, name], i) => {
        const max = TIERS[i + 1] ? TIERS[i + 1][0] : 850;
        // The last label sits at the right edge, so it is right-aligned there instead of centered (which would clip it).
        const place = i === TIERS.length - 1 ? "right:0;transform:none;text-align:right" : `left:${(((min + max) / 2 - 300) / 550) * 100}%`;
        return `<span style="${place}">${narrow ? "" : `${t(name)}<br>`}${min}+</span>`;
      }).join("")}</div>`;
    $("cs-bars").innerHTML = FACTORS.map((x) => {
      const max = x.w * 550, got = max * f[x.key];
      return `<div class="hb-row"><span class="hb-name">${t(x.name)}<small>${t("{pct}% of the score", { pct: Math.round(x.w * 100) })}</small></span>
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
      ? t("<strong>Excellent habits!</strong> This profile is near the top of the scale.")
      : `<strong>${t("Biggest opportunity: {factor}.", { factor: t(gaps[0].name).toLowerCase() })}</strong> ${t(TIPS[gaps[0].key])}`;
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
    $("cc-min-time").textContent = min.stuck ? t("50+ yrs") : fmtMonths(min.months);
    $("cc-min-int").textContent = FG.money(min.interest);
    $("cc-fix-label").textContent = t("{amount}/mo: time", { amount: FG.money(fixed) });
    $("cc-fix-time").textContent = fix.stuck ? t("Never") : fmtMonths(fix.months);
    $("cc-fix-int").textContent = fix.stuck ? "∞" : FG.money(fix.interest);
    const n = Math.max(min.bals.length, fix.stuck ? 0 : fix.bals.length);
    const pad = (a) => Array.from({ length: n }, (_, i) => (i < a.length ? a[i] : 0));
    const series = [{ name: t("Minimum payments"), color: "--series-2", values: pad(min.bals) }];
    if (!fix.stuck) series.unshift({ name: t("{amount}/month", { amount: FG.money(fixed) }), color: "--series-1", values: pad(fix.bals) });
    Charts.line($("cc-chart"), {
      x: Array.from({ length: n }, (_, i) => i), xFormat: (m) => (n > 36 ? t("Yr {n}", { n: +(m / 12).toFixed(1) }) : t("Mo {n}", { n: m })),
      label: t("Credit card balance over time"), series, yFormat: FG.compact, tipFormat: (v) => FG.money(v),
      tipTitle: (i) => (i >= 12 ? t("Month {n} (year {y})", { n: i, y: (i / 12).toFixed(1) }) : t("Month {n}", { n: i })),
    });
    $("cc-insight").innerHTML = fix.stuck
      ? t("<strong>Warning:</strong> {amount}/month doesn't even cover the interest ({first} in the first month). The balance would never shrink.", { amount: FG.money(fixed), first: FG.money(bal * apr / 1200) })
      : t("Paying {amount}/month instead of the minimum saves <strong>{saved}</strong> in interest and gets you debt-free <strong>{time} sooner</strong>. The minimum payment shrinks as your balance does — which is exactly why it takes so long.",
          { amount: FG.money(fixed), saved: FG.money(min.interest - fix.interest), time: fmtMonths(Math.max(0, min.months - fix.months)) });
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
      { rap: false, name: t("Tiered Standard ({n} yrs)", { n: ty }), color: "--series-1", ...fixedPlan(bal, r, ty), note: t("Fixed payment. No forgiveness.") },
      { rap: true, name: t("RAP (income-based)"), color: "--series-2", ...rapPlan(bal, r, agi, g, deps), note: t("Payment rises with income.") },
    ];
    if (ty > 10) plans.push({ rap: false, name: t("Pay it off in 10 yrs"), color: "--series-3", ...fixedPlan(bal, r, 10), note: t("Prepaying early is allowed — no penalty.") });
    $("sl-plans").innerHTML = plans.map((p) => `
      <div class="plan-card" style="border-top-color:var(${p.color})">
        <strong>${p.name}</strong>
        <div class="plan-pay">${FG.money(p.first)}<small>${p.rap ? t("/mo to start") : t("/mo")}</small></div>
        <div class="kv"><span>${t("Paid off in")}</span><span>${p.forgiven > 0 ? t("30 yrs (rest forgiven)") : fmtMonths(p.months)}</span></div>
        <div class="kv"><span>${t("Total you pay")}</span><strong>${FG.money(p.total)}</strong></div>
        ${p.forgiven > 0 ? `<div class="kv"><span>${t("Forgiven")}</span><span>${FG.money(p.forgiven)}</span></div>` : ""}
        <p class="small muted" style="margin:6px 0 0">${p.note}</p>
      </div>`).join("");
    Charts.line($("sl-chart"), {
      x: Array.from({ length: 31 }, (_, i) => i), xFormat: (y) => t("Yr {n}", { n: y }), label: t("Loan balance by plan"),
      series: plans.map((p) => ({ name: p.name, color: p.color, values: p.yearly.slice(0, 31) })),
      yFormat: FG.compact, tipFormat: (v) => FG.money(v), tipTitle: (i) => t(i === 1 ? "After {n} year" : "After {n} years", { n: i }),
    });
    const [std, rap] = plans;
    const cheaper = rap.total < std.total ? rap : std;
    $("sl-insight").innerHTML = [
      t(cheaper === rap ? "With these numbers, <strong>RAP</strong> costs less in total ({total})." : "With these numbers, <strong>the Tiered Standard plan</strong> costs less in total ({total}).", { total: FG.money(cheaper.total) }),
      rap.help > 1
        ? t("RAP starts at {rap}/month vs {std} on Tiered Standard, and the government would cover about {help} in waived interest and principal matches.", { rap: FG.money(rap.first), std: FG.money(std.first), help: FG.money(rap.help) })
        : t("RAP starts at {rap}/month vs {std} on Tiered Standard.", { rap: FG.money(rap.first), std: FG.money(std.first) }),
      rap.forgiven > 0 ? t("About {amount} would be forgiven after 30 years (possibly taxable).", { amount: FG.money(rap.forgiven) }) : "",
      t("Lower payments usually mean paying longer — pick based on your budget and job stability."),
    ].filter(Boolean).join(" ");
  }
  ["sl-bal", "sl-rate", "sl-agi", "sl-growth", "sl-dep"].forEach((id) => $(id).addEventListener("input", loans));

  /* ---------- Init ---------- */
  score(); cards(); loans();
  const redraw = () => { score(); cards(); loans(); }; // score: its labels stack differently on narrow screens
  let resizeTimer;
  addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(redraw, 150); });
  document.addEventListener("langchange", redraw);
  document.addEventListener("themechange", redraw);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", redraw);
})();
