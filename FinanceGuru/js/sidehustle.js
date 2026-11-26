// Side hustle tax set-aside (Taxes page): self-employment tax + the extra federal and state income tax a
// gig's profit adds on top of W-2 wages. Uses this year's figures (TAX_NOW) and federalTax() from js/data/tax2026.js.
(function () {
  const $ = (id) => document.getElementById(id);
  if (!$("gig")) return;
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
  const t = I18N.t;
  const F = TAX_NOW.fica;
  const SE_FACTOR = 0.9235, SE_MIN = 400, QBI = 0.2;

  function taxesOn(profit, wages, status, stateRate) {
    // Self-employment tax: Social Security share is capped by the wage base, which W-2 wages use up first.
    const seBase = profit * SE_FACTOR;
    const se = seBase < SE_MIN ? 0 : 0.124 * Math.min(seBase, Math.max(0, F.ssWageBase - wages)) + 0.029 * seBase;
    const halfSe = se / 2;
    // Income tax: federal tax with the gig minus without it. QBI deduction simplified to 20% of
    // (profit − half of SE tax), capped at 20% of taxable income before it.
    const agi = wages + profit - halfSe;
    const qbi = Math.min(QBI * Math.max(0, profit - halfSe), QBI * Math.max(0, agi - TAX_NOW.stdDed[status]));
    const fed = Math.max(0, federalTax(status, agi - qbi, TAX_YEAR_NOW).tax - federalTax(status, wages, TAX_YEAR_NOW).tax);
    const state = stateRate * Math.max(0, profit - halfSe);
    return { se, fed, state, total: se + fed + state };
  }

  function calc() {
    const income = num("g-income"), wages = num("g-wages"), status = $("g-status").value, stateRate = num("g-state") / 100;
    const expenses = num("g-exp"), mileage = num("g-miles") * +$("g-rate").value;
    const profit = Math.max(0, income - expenses - mileage);
    const tx = taxesOn(profit, wages, status, stateRate);
    const pct = profit ? tx.total / profit : 0;
    const mileageSaved = taxesOn(Math.max(0, income - expenses), wages, status, stateRate).total - tx.total;

    $("g-profit").textContent = FG.money(profit);
    $("g-tax").textContent = FG.money(tx.total);
    $("g-pct").textContent = profit ? `$${Math.round(pct * 100)}` : "—";
    const rows = [
      ["Gig income", income, "--series-1"], ["Mileage deduction", -mileage, "--series-3"], ["Other expenses", -expenses, "--series-3"],
      ["Self-employment tax", tx.se, "--series-2"], ["Extra federal income tax", tx.fed, "--series-4"], ["State income tax", tx.state, "--series-5"],
    ];
    $("g-list").innerHTML = rows.map(([name, v, c]) => `<div class="pc-row"><span><i style="background:var(${c})"></i>${t(name)}</span><span>${v < 0 ? "−" : ""}${FG.money(Math.abs(v))}</span><span></span></div>`).join("");
    $("g-insight").innerHTML = !profit
      ? t("No profit, no tax on it. Keep records of your income and expenses anyway.")
      : `${t("Move <strong>{pct}%</strong> of your gig profit into a separate savings account as it comes in.", { pct: Math.round(pct * 100) })} ${
        tx.total >= 1000
          ? t("Because you'll likely owe $1,000 or more, the IRS expects <strong>quarterly estimated payments</strong> of about {quarter} (due in April, June, September, and January), or extra withholding at your regular job.", { quarter: FG.money(tx.total / 4) })
          : t("You'll likely owe under $1,000, so you can usually pay it with your tax return. Still report every dollar.")
      }${mileageSaved >= 1 ? " " + t("Logging your miles cut your tax by about <strong>{saved}</strong>.", { saved: FG.money(mileageSaved) }) : ""}`;
  }

  ["g-income", "g-exp", "g-miles", "g-rate", "g-wages", "g-status", "g-state"].forEach((id) => $(id).addEventListener("input", calc));
  document.addEventListener("langchange", calc);
  calc();
})();
