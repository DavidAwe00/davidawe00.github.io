// HSA / FSA Savings: income tax (federal via federalTax, plus state) and payroll tax avoided on
// contributions, with 2026 IRS limits and the FSA use-it-or-lose-it rule.
(function () {
  const { $, num, money } = ToolKit;
  if (!$("panel-hsa")) return;
  const LIMITS = { "hsa-self": 4400, "hsa-family": 8750, fsa: 3400 }; // Rev. Proc. 2025-19 and 2025-32
  const FSA_CARRYOVER = 680;

  function calc() {
    const type = $("hs-type").value, isFsa = type === "fsa", limit = LIMITS[type];
    if (isFsa) $("hs-payroll").checked = true; // health FSAs only work through an employer's payroll
    $("hs-payroll").disabled = isFsa;
    $("hs-spend-wrap").hidden = !isFsa;
    const amt = Math.min(num("hs-amt"), limit), income = num("hs-income"), status = $("hs-status").value;
    $("hs-limit").textContent = `2026 limit: ${money(limit)}${num("hs-amt") > limit ? `. Counting only ${money(limit)}.` : "."}`;
    const fed = federalTax(status, income).tax - federalTax(status, Math.max(0, income - amt)).tax;
    const state = (num("hs-state") / 100) * amt;
    // Payroll contributions also skip Social Security (only on wages under the wage base) and Medicare.
    const F = TAX_2026.fica, base = F.ssWageBase;
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

  ["hs-type", "hs-amt", "hs-income", "hs-status", "hs-state", "hs-spend", "hs-payroll"].forEach((id) => $(id).addEventListener("input", calc));
  calc();
})();
