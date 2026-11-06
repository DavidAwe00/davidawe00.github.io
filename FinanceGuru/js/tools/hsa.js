// HSA / FSA Savings: income tax (federal via federalTax, plus state) and payroll tax avoided on
// contributions, with IRS limits for 2026 or 2027 and the FSA use-it-or-lose-it rule.
(function () {
  const { $, num, money } = ToolKit;
  if (!$("panel-hsa")) return;
  // Limits by plan year. null = not announced yet, so the previous year's figure is used and labeled.
  // 2026: HSA Rev. Proc. 2025-19, FSA Rev. Proc. 2025-32. 2027: HSA Rev. Proc. 2026-24 (June 1, 2026),
  // FSA Rev. Proc. 2026-35 (Nov. 5, 2026); Social Security wage base from SSA (Oct 14, 2026).
  const YEARS = {
    2026: { "hsa-self": 4400, "hsa-family": 8750, fsa: 3400, carryover: 680, wageBase: 184500 },
    2027: { "hsa-self": 4500, "hsa-family": 9000, fsa: 3500, carryover: 700, wageBase: 192300 },
  };
  const pick = (year, key) => YEARS[year][key] ?? YEARS[year - 1][key];
  const announced = (year, key) => YEARS[year][key] !== null;
  // From October, open enrollment is choosing next year's amounts.
  const now = new Date(), defaultYear = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();
  $("hs-year").value = YEARS[defaultYear] ? String(defaultYear) : "2026";

  function calc() {
    const year = +$("hs-year").value, type = $("hs-type").value, isFsa = type === "fsa";
    const limit = pick(year, type), FSA_CARRYOVER = pick(year, "carryover");
    if (isFsa) $("hs-payroll").checked = true; // health FSAs only work through an employer's payroll
    $("hs-payroll").disabled = isFsa;
    $("hs-spend-wrap").hidden = !isFsa;
    const amt = Math.min(num("hs-amt"), limit), income = num("hs-income"), status = $("hs-status").value;
    $("hs-limit").textContent = (announced(year, type) ? `${year} limit: ${money(limit)}` : `${year} limit not announced yet; using ${year - 1}'s ${money(limit)}`)
      + (num("hs-amt") > limit ? `. Counting only ${money(limit)}.` : ".");
    const fed = federalTax(status, income, year).tax - federalTax(status, Math.max(0, income - amt), year).tax;
    const state = (num("hs-state") / 100) * amt;
    // Payroll contributions also skip Social Security (only on wages under the wage base) and Medicare.
    const F = TAX_2026.fica, base = pick(year, "wageBase");
    const fica = $("hs-payroll").checked ? F.ssRate * (Math.min(income, base) - Math.min(Math.max(0, income - amt), base)) + F.medicare * amt : 0;
    const saved = fed + state + fica;
    const rate = amt ? saved / amt : 0;
    $("hs-save").textContent = money(saved);
    $("hs-per").textContent = amt ? money(100 * (1 - rate)) : "—";
    const risk = isFsa ? Math.max(0, amt - num("hs-spend") - FSA_CARRYOVER) : 0;
    $("hs-risk-label").textContent = isFsa ? "At risk of forfeiting" : "Unused money";
    $("hs-risk").textContent = isFsa ? money(risk) : "Rolls over";
    $("hs-insight").innerHTML = !amt ? "Enter a contribution to see the savings." :
      `Putting in ${money(amt)} saves about <strong>${money(saved)}</strong> in taxes, so every $100 of care costs you about ${money(100 * (1 - rate))}. ` +
      (isFsa
        ? (risk > 0 ? `⚠️ You plan to put in ${money(risk)} more than you expect to spend (after the ${money(FSA_CARRYOVER)} carryover, if your plan offers it). Health FSA money left over is generally lost, so contribute only what you're confident you'll use.` : "Your contribution fits your expected spending, so you're unlikely to lose any.")
        : "HSA money is yours to keep: it rolls over every year, goes with you if you change jobs, and can be invested. Some states, including California and New Jersey, still tax HSA contributions.");
  }

  ["hs-year", "hs-type", "hs-amt", "hs-income", "hs-status", "hs-state", "hs-spend", "hs-payroll"].forEach((id) => $(id).addEventListener("input", calc));
  calc();
})();
