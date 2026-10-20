// Job Offer Comparison: take-home pay after 2026 federal tax, FICA, and state tax, plus the 401(k) match
// you'd actually capture, minus health premiums and commute cost. Uses TAX_2026/federalTax (js/data/tax2026.js).
(function () {
  const { $, num, money } = ToolKit;
  if (!$("panel-offer")) return;
  const F = TAX_2026.fica;
  const COMMUTE_PER_MILE = 0.29; // AAA 2026: fuel 17.3¢ + maintenance, repairs & tires 11.7¢
  const WEEKS = 50;

  function offer(side, savePct, status) {
    const pay = num(`of-pay-${side}`), matchCap = num(`of-match-${side}`) / 100;
    const health = num(`of-health-${side}`) * 12, state = num(`of-state-${side}`) / 100;
    const k401 = pay * savePct;
    const match = pay * Math.min(savePct, matchCap);
    const missed = pay * Math.max(0, matchCap - savePct);
    const ficaWages = Math.max(0, pay - health); // premiums through a cafeteria plan skip FICA; 401(k) doesn't
    const incomeWages = Math.max(0, pay - health - k401);
    const fed = federalTax(status, incomeWages).tax;
    const fica = F.ssRate * Math.min(ficaWages, F.ssWageBase) + F.medicare * ficaWages;
    const stateTax = state * incomeWages;
    const takeHome = pay - k401 - health - fed - fica - stateTax;
    const commute = num(`of-miles-${side}`) * Math.min(7, num(`of-days-${side}`)) * WEEKS * COMMUTE_PER_MILE;
    // "Real value": spendable cash after commuting, plus everything that lands in your 401(k).
    const value = takeHome - commute + k401 + match;
    return { pay, k401, match, missed, health, fed, fica, stateTax, takeHome, commute, value };
  }

  function calc() {
    const save = num("of-save") / 100, status = $("of-status").value;
    const a = offer("a", save, status), b = offer("b", save, status);
    const rows = [
      ["Yearly pay", "pay"], ["Your 401(k) savings", "k401"], ["Employer 401(k) match", "match"],
      ["Health premiums", "health", -1], ["Federal income tax", "fed", -1], ["Social Security + Medicare", "fica", -1],
      ["State income tax", "stateTax", -1], ["Take-home pay", "takeHome"], ["Commute cost", "commute", -1],
    ];
    $("of-table").innerHTML = `<thead><tr><th scope="col">Per year</th><th scope="col">Offer A</th><th scope="col">Offer B</th></tr></thead><tbody>${
      rows.map(([label, k, sign]) => `<tr${k === "takeHome" ? ' class="sub"' : ""}><td>${label}</td><td>${money((sign || 1) * a[k])}</td><td>${money((sign || 1) * b[k])}</td></tr>`).join("")
    }<tr class="total"><td>Real value (take-home − commute + all 401(k) money)</td><td>${money(a.value)}</td><td>${money(b.value)}</td></tr></tbody>`;

    const diff = a.value - b.value, win = diff >= 0 ? "A" : "B", payWin = a.pay >= b.pay ? "A" : "B";
    $("of-result").innerHTML = Math.abs(diff) < 1
      ? `<p class="offer-verdict">These offers come out about even.</p>`
      : `<p class="offer-verdict">Offer <strong>${win}</strong> is worth about <strong>${money(Math.abs(diff))} more per year</strong> (${money(Math.abs(diff) / 12)} a month).</p>`;
    const notes = [];
    if (payWin !== win && Math.abs(diff) >= 1) notes.push(`Offer ${payWin} has the bigger paycheck, but benefits and commuting flip the result.`);
    [["A", a], ["B", b]].forEach(([s, o]) => { if (o.missed > 0) notes.push(`With Offer ${s}, saving ${Math.round(save * 100)}% leaves ${money(o.missed)} of free match money on the table each year.`); });
    notes.push("Also weigh things this can't measure: growth, schedule, remote days, paid time off, and who you'd work with.");
    $("of-insight").innerHTML = notes.join(" ");
  }

  document.querySelectorAll("#panel-offer input, #panel-offer select").forEach((el) => el.addEventListener("input", calc));
  calc();
})();
