// Cost of Living by State: BEA Regional Price Parities (js/data/rpp.js) applied to pay, plus BLS state
// median pay for a chosen job (js/data/statepay.js), adjusted for prices.
(function () {
  const { $, num, money } = ToolKit;
  if (!$("panel-col")) return;
  const states = Object.keys(RPP).sort();
  const opts = states.map((s) => `<option>${s}</option>`).join("");
  $("cl-from").innerHTML = $("cl-to").innerHTML = opts;
  $("cl-from").value = "Texas";
  $("cl-to").value = "California";
  $("cl-job").innerHTML = STATE_PAY_OCCS.map((o) => `<option value="${o.key}">${o.emoji} ${o.name}</option>`).join("");
  $("cl-rpp-year").textContent = RPP_YEAR;

  function calc() {
    const from = $("cl-from").value, to = $("cl-to").value, pay = num("cl-pay"), job = $("cl-job").value;
    const equiv = pay * (RPP[to] / RPP[from]);
    $("cl-equiv-label").textContent = `Same buying power in ${to}`;
    $("cl-equiv").textContent = money(equiv);
    $("cl-rpp").textContent = `${RPP[from].toFixed(1)} → ${RPP[to].toFixed(1)}`;
    const name = STATE_PAY_OCCS.find((o) => o.key === job).name;
    const row = (s) => {
      const p = STATE_PAY[s] && STATE_PAY[s][job];
      return `<tr><td>${s}</td><td>${RPP[s].toFixed(1)}</td><td>${p ? money(p) : "n/a"}</td><td>${p ? money(p * 100 / RPP[s]) : "n/a"}</td></tr>`;
    };
    $("cl-table").innerHTML = `<thead><tr><th scope="col">State</th><th scope="col">Prices</th><th scope="col">Median pay: ${name}</th><th scope="col">In U.S.-average dollars</th></tr></thead><tbody>${row(from)}${from !== to ? row(to) : ""}</tbody>`;
    const pf = STATE_PAY[from] && STATE_PAY[from][job], pt = STATE_PAY[to] && STATE_PAY[to][job];
    const diffPct = Math.round((RPP[to] / RPP[from] - 1) * 100);
    let text = from === to ? "Pick two different states to compare." :
      `Prices in ${to} are about <strong>${Math.abs(diffPct)}% ${diffPct >= 0 ? "higher" : "lower"}</strong> than in ${from}, so ${money(pay)} there feels like ${money(equiv)} in ${to}.`;
    if (from !== to && pf && pt) {
      const rf = pf * 100 / RPP[from], rt = pt * 100 / RPP[to];
      const who = job === "all" ? "Across all jobs, typical pay" : `For a typical ${name.toLowerCase()}, pay`;
      text += ` ${who} adjusted for prices is ${rt > rf ? "higher" : "lower"} in ${to} (${money(rt)} vs ${money(rf)}).`;
    }
    $("cl-insight").innerHTML = text;
  }

  ["cl-from", "cl-to", "cl-pay", "cl-job"].forEach((id) => $(id).addEventListener("input", calc));
  calc();
})();
