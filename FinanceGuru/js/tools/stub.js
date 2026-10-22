// Pay Stub Reader: explains each line of a pay stub, checks Social Security and Medicare against
// their 2026 rates, compares federal withholding with a simple 2026 estimate, checks that the
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
    const n = PERIODS[s.frequency] || 26, f = TAX_2026.fica;
    const deductions = s.k401 + s.health + s.other + s.federal + s.ss + s.medicare + s.state;
    const computedNet = s.gross - deductions;
    // Simple annualized estimate (not Publication 15-T): pre-tax 401(k) and health lower taxable pay.
    const taxablePerCheck = Math.max(0, s.gross - s.k401 - s.health);
    const fedEstimate = federalTax(s.status || "single", taxablePerCheck * n).tax / n;
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
    const { $, num, money } = ToolKit;
    const cents = (v) => (v < 0 ? "−" : "") + "$" + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const read = () => ({ frequency: $("ps-freq").value, status: $("ps-status").value, gross: num("ps-gross"), k401: num("ps-401k"), health: num("ps-health"),
      other: num("ps-other"), federal: num("ps-fed"), ss: num("ps-ss"), medicare: num("ps-med"), state: num("ps-state"), net: num("ps-net") });
    const mark = { ok: "✅", low: "⚠️", high: "⚠️", zero: "⚠️" };

    function calc() {
      const s = read();
      if (!s.gross) { $("ps-result").innerHTML = `<p class="muted">Enter the gross pay from your stub to start.</p>`; return; }
      const r = check(s), pct = (v) => `${((v / s.gross) * 100).toFixed(1)}%`;
      const fedNote = {
        ok: "In the range a simple 2026 estimate expects.",
        low: `Lower than a simple estimate (${cents(r.federal.expected)}). That's normal if your W-4 claims dependents; otherwise you may owe at tax time.`,
        high: `Higher than a simple estimate (${cents(r.federal.expected)}). The W-4 Step 2 box (two jobs) or extra withholding does this, and usually means a bigger refund.`,
        zero: `No federal tax was withheld, but a simple estimate expects about ${cents(r.federal.expected)}. If your W-4 says "exempt" and you'll owe tax this year, update it with payroll.`,
      }[r.federal.status];
      const fica = (x, name, rate) => x.ok ? `${rate} of your pay, as required.` : `Expected about ${cents(x.expected)} (${rate}${s.health ? ", after pre-tax health" : ""}). Ask payroll to check it.`;
      const rows = [
        ["Gross pay", s.gross, "What you earned this pay period before anything comes out.", null],
        ["401(k) / retirement", -s.k401, s.k401 ? "Your savings for retirement. Pre-tax, so it lowers your income tax." : "Nothing going to retirement. If your employer matches, you're leaving free money behind.", s.k401 ? null : "low"],
        ["Health, dental, vision", -s.health, "Insurance premiums. Usually pre-tax, which also lowers Social Security and Medicare.", null],
        ["Federal income tax", -s.federal, fedNote, r.federal.status],
        ["Social Security", -s.ss, fica(r.ss, "Social Security", "6.2%") + (r.overWageBase ? " It stops once you earn $184,500 this year." : ""), r.ss.status],
        ["Medicare", -s.medicare, fica(r.medicare, "Medicare", "1.45%"), r.medicare.status],
        ["State / local tax", -s.state, s.state ? "Varies by state; nine states have no wage income tax." : "None withheld. Fine if your state has no income tax.", null],
        ["Other deductions", -s.other, "Union dues, a Roth 401(k), wage garnishments, and similar items.", null],
      ].filter(([, v, , st], i) => i < 2 || v || (st && st !== "ok")); // always show flagged lines, even at $0
      $("ps-result").innerHTML = `
        <div class="stats">
          <div class="stat hero"><div class="label">Take-home per check</div><div class="value">${cents(r.takeHome)}</div></div>
          <div class="stat"><div class="label">About per month</div><div class="value">${money(r.monthly)}</div></div>
          <div class="stat"><div class="label">You keep</div><div class="value">${pct(r.takeHome)}</div></div>
        </div>
        <div class="pc-list">${rows.map(([name, v, note, st]) => `<div class="ps-row"><div class="pc-row"><span>${st ? `${mark[st]} ` : ""}${name}</span><span>${cents(v)}</span><span class="muted small">${pct(Math.abs(v))}</span></div><p class="small muted">${note}</p></div>`).join("")}</div>
        <p class="callout small">${r.netMatches
          ? `Net pay: <strong>${cents(r.takeHome)}</strong>. ${s.net ? "✅ The lines add up." : "Enter the net pay from your stub to double-check the math."}`
          : `⚠️ Your lines add up to <strong>${cents(r.computedNet)}</strong>, but the stub says <strong>${cents(s.net)}</strong>. A deduction may be missing from what you entered.`}</p>
        <div class="hero-actions"><a class="btn btn-primary" href="plan.html?takehome=${r.takeHome.toFixed(2)}&amp;frequency=${s.frequency}">Use ${cents(r.takeHome)} in my First Paycheck Plan →</a></div>`;
    }
    document.querySelectorAll("#panel-stub input, #panel-stub select").forEach((el) => el.addEventListener("input", calc));
    calc();
  }
  if (typeof document !== "undefined" && document.getElementById("panel-stub")) render();
  return { check, PERIODS };
})();
