// Pay Stub Reader: explains each line of a pay stub, checks Social Security and Medicare against
// this year's rates, compares federal withholding with a simple estimate for this year, checks that the
// deductions add up to net pay, and hands the take-home to the First Paycheck Plan.
const PayStub = (() => {
  const PERIODS = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 };
  const near = (a, b) => Math.abs(a - b) <= Math.max(1, b * 0.01);

  // Social Security and Medicare skip pre-tax health premiums (a Section 125 cafeteria plan) but not
  // a 401(k). Some employers take health premiums after tax, so either base counts as correct.
  function ficaCheck(actual, rate, gross, health) {
    const bases = [gross - health, gross].map((b) => b * rate);
    const ok = bases.some((e) => near(actual, e));
    return { expected: bases[0], ok, status: ok ? "ok" : actual < bases[0] ? "low" : "high" };
  }

  function check(s) {
    const n = PERIODS[s.frequency] || 26, f = TAX_NOW.fica;
    const deductions = s.k401 + s.health + s.other + s.federal + s.ss + s.medicare + s.state;
    const computedNet = s.gross - deductions;
    // Simple annualized estimate (not Publication 15-T): pre-tax 401(k) and health lower taxable pay.
    const taxablePerCheck = Math.max(0, s.gross - s.k401 - s.health);
    const fedEstimate = federalTax(s.status || "single", taxablePerCheck * n, TAX_YEAR_NOW).tax / n;
    const ratio = fedEstimate ? s.federal / fedEstimate : s.federal ? Infinity : 1;
    const federal = { expected: fedEstimate,
      status: fedEstimate > 0 && s.federal === 0 ? "zero" : ratio < 0.65 ? "low" : ratio > 1.35 ? "high" : "ok" };
    const annual = s.gross * n;
    return {
      periods: n, deductions, computedNet, federal,
      ss: ficaCheck(s.ss, f.ssRate, s.gross, s.health),
      medicare: ficaCheck(s.medicare, f.medicare, s.gross, s.health),
      overWageBase: annual > f.ssWageBase,
      netMatches: !s.net || near(s.net, computedNet),
      takeHome: s.net || computedNet,
      monthly: (s.net || computedNet) * n / 12,
      annualGross: annual,
    };
  }

  function render() {
    const { $, num, money, t } = ToolKit;
    const cents = (v) => (v < 0 ? "−" : "") + "$" + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const read = () => ({ frequency: $("ps-freq").value, status: $("ps-status").value, gross: num("ps-gross"), k401: num("ps-401k"), health: num("ps-health"),
      other: num("ps-other"), federal: num("ps-fed"), ss: num("ps-ss"), medicare: num("ps-med"), state: num("ps-state"), net: num("ps-net") });
    const mark = { ok: "✅", low: "⚠️", high: "⚠️", zero: "⚠️" };

    function calc() {
      const s = read();
      if (!s.gross) { $("ps-result").innerHTML = `<p class="muted">${t("Enter the gross pay from your stub to start.")}</p>`; return; }
      const r = check(s), pct = (v) => `${((v / s.gross) * 100).toFixed(1)}%`;
      const fedNote = {
        ok: t("In the range a simple {year} estimate expects.", { year: TAX_YEAR_NOW }),
        low: t("Lower than a simple estimate ({amount}). That's normal if your W-4 claims dependents; otherwise you may owe at tax time.", { amount: cents(r.federal.expected) }),
        high: t("Higher than a simple estimate ({amount}). The W-4 Step 2 box (two jobs) or extra withholding does this, and usually means a bigger refund.", { amount: cents(r.federal.expected) }),
        zero: t("No federal tax was withheld, but a simple estimate expects about {amount}. If your W-4 says \"exempt\" and you'll owe tax this year, update it with payroll.", { amount: cents(r.federal.expected) }),
      }[r.federal.status];
      const fica = (x, rate) => x.ok ? t("{rate} of your pay, as required.", { rate })
        : t(s.health ? "Expected about {amount} ({rate}, after pre-tax health). Ask payroll to check it." : "Expected about {amount} ({rate}). Ask payroll to check it.", { amount: cents(x.expected), rate });
      const rows = [
        ["Gross pay", s.gross, t("What you earned this pay period before anything comes out."), null],
        ["401(k) / retirement", -s.k401, s.k401 ? t("Your savings for retirement. Pre-tax, so it lowers your income tax.") : t("Nothing going to retirement. If your employer matches, you're leaving free money behind."), s.k401 ? null : "low"],
        ["Health, dental, vision", -s.health, t("Insurance premiums. Usually pre-tax, which also lowers Social Security and Medicare."), null],
        ["Federal income tax", -s.federal, fedNote, r.federal.status],
        // The wage base comes from this year's figures (it was hardcoded to 2026's $184,500).
        ["Social Security", -s.ss, fica(r.ss, "6.2%") + (r.overWageBase ? " " + t("It stops once you earn {base} this year.", { base: money(TAX_NOW.fica.ssWageBase) }) : ""), r.ss.status],
        ["Medicare", -s.medicare, fica(r.medicare, "1.45%"), r.medicare.status],
        ["State / local tax", -s.state, s.state ? t("Varies by state; nine states have no wage income tax.") : t("None withheld. Fine if your state has no income tax."), null],
        ["Other deductions", -s.other, t("Union dues, a Roth 401(k), wage garnishments, and similar items."), null],
      ].filter(([, v, , st], i) => i < 2 || v || (st && st !== "ok")); // always show flagged lines, even at $0
      $("ps-result").innerHTML = `
        <div class="stats">
          <div class="stat hero"><div class="label">${t("Take-home per check")}</div><div class="value">${cents(r.takeHome)}</div></div>
          <div class="stat"><div class="label">${t("About per month")}</div><div class="value">${money(r.monthly)}</div></div>
          <div class="stat"><div class="label">${t("You keep")}</div><div class="value">${pct(r.takeHome)}</div></div>
        </div>
        <div class="pc-list">${rows.map(([name, v, note, st]) => `<div class="ps-row"><div class="pc-row"><span>${st ? `${mark[st]} ` : ""}${t(name)}</span><span>${cents(v)}</span><span class="muted small">${pct(Math.abs(v))}</span></div><p class="small muted">${note}</p></div>`).join("")}</div>
        <p class="callout small">${r.netMatches
          ? `${t("Net pay: <strong>{net}</strong>.", { net: cents(r.takeHome) })} ${s.net ? t("✅ The lines add up.") : t("Enter the net pay from your stub to double-check the math.")}`
          : t("⚠️ Your lines add up to <strong>{computed}</strong>, but the stub says <strong>{stub}</strong>. A deduction may be missing from what you entered.", { computed: cents(r.computedNet), stub: cents(s.net) })}</p>
        <div class="hero-actions"><a class="btn btn-primary" href="plan.html?takehome=${r.takeHome.toFixed(2)}&amp;frequency=${s.frequency}">${t("Use {amount} in my First Paycheck Plan →", { amount: cents(r.takeHome) })}</a></div>`;
    }
    document.querySelectorAll("#panel-stub input, #panel-stub select").forEach((el) => el.addEventListener("input", calc));
    document.addEventListener("langchange", calc);
    calc();
  }
  if (typeof document !== "undefined" && document.getElementById("panel-stub")) render();
  return { check, PERIODS };
})();
