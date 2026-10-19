// Fee-to-APR converter (Credit hub): payday loans, buy now pay later, and a card for comparison,
// plus payday rollovers. APR = fee ÷ amount × 365 ÷ days, as in Truth in Lending disclosures.
(function () {
  const $ = (id) => document.getElementById(id);
  if (!$("loancost")) return;
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
  const CARD_APR = 22.36; // Federal Reserve G.19, Aug 2026 (matches the page hero)
  const PRESETS = {
    payday: { amt: 400, fee: 60, days: 14, roll: true },
    bnpl: { amt: 200, fee: 0, days: 42 },
    "bnpl-late": { amt: 200, fee: 10, days: 42 },
    card: { amt: 400, fee: +(400 * CARD_APR / 100 * 14 / 365).toFixed(2), days: 14 },
  };
  // Whole dollars when even, cents otherwise (a $3.43 fee shouldn't read as $3).
  const cash = (v) => (Number.isInteger(Math.round(v * 100) / 100) ? FG.money(v) : "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  const pctFmt = (v) => (v >= 100 ? Math.round(v) : v.toFixed(1)) + "%";

  function applyPreset() {
    const p = PRESETS[$("lc-preset").value];
    $("lc-amt").value = p.amt; $("lc-fee").value = p.fee; $("lc-days").value = p.days; $("lc-roll").value = 0;
    $("lc-roll-wrap").hidden = !p.roll;
    calc();
  }

  function calc() {
    const amt = num("lc-amt"), fee = num("lc-fee"), days = Math.max(1, num("lc-days"));
    const roll = $("lc-roll-wrap").hidden ? 0 : +$("lc-roll").value;
    $("lc-roll-l").textContent = roll;
    const apr = amt ? (fee / amt) * (365 / days) * 100 : 0;
    const fees = fee * (roll + 1);
    $("lc-apr").textContent = pctFmt(apr);
    $("lc-repay").textContent = cash(amt + fees);
    $("lc-fees").textContent = cash(fees);

    const rows = [["This loan", apr, "--series-2"], ["Average credit card", CARD_APR, "--series-1"], ["Typical payday loan", 391, "--series-5"]];
    const max = Math.max(...rows.map((r) => r[1]), 1);
    $("lc-bars").innerHTML = rows.map(([n, v, c]) => `<div class="hb-row"><span class="hb-name">${n}</span><div class="hb-track"><span class="hb-bar" style="width:${Math.max(0.5, (v / max) * 100)}%;background:var(${c})"></span></div><span class="hb-val">${pctFmt(v)}</span></div>`).join("");
    $("lc-bars").setAttribute("aria-label", rows.map(([n, v]) => `${n}: ${pctFmt(v)} APR`).join(", "));

    const weeks = Math.round((days * (roll + 1)) / 7);
    $("lc-insight").innerHTML = !fee
      ? "Paid on time with no fees, this costs nothing extra. The risk is missing a payment or juggling several plans at once: late fees and overdrafts add up fast."
      : roll
        ? `Rolling over ${roll} time${roll > 1 ? "s" : ""} means about ${weeks} weeks of borrowing and <strong>${cash(fees)}</strong> in fees, and you still owe the original ${cash(amt)}.`
        : `${cash(fee)} on ${cash(amt)} for ${days} days works out to <strong>${pctFmt(apr)} APR</strong>, about ${apr > CARD_APR ? Math.round(apr / CARD_APR) + " times" : "the same as or less than"} the average credit card rate.`;
  }

  $("lc-preset").addEventListener("change", applyPreset);
  ["lc-amt", "lc-fee", "lc-days", "lc-roll"].forEach((id) => $(id).addEventListener("input", calc));
  applyPreset();
})();
