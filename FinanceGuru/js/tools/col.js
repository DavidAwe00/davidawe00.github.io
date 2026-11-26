// Cost of Living by State: BEA Regional Price Parities (js/data/rpp.js) applied to pay, plus BLS state
// median pay for a chosen job (js/data/statepay.js), adjusted for prices.
(function () {
  const { $, num, money, t } = ToolKit;
  if (!$("panel-col")) return;
  const states = Object.keys(RPP).sort();
  const opts = states.map((s) => `<option>${s}</option>`).join("");
  $("cl-from").innerHTML = $("cl-to").innerHTML = opts;
  $("cl-from").value = "Texas";
  $("cl-to").value = "California";
  const jobs = () => { const v = $("cl-job").value; $("cl-job").innerHTML = STATE_PAY_OCCS.map((o) => `<option value="${o.key}">${o.emoji} ${t(o.name)}</option>`).join(""); if (v) $("cl-job").value = v; };
  jobs();
  $("cl-rpp-year").textContent = RPP_YEAR;

  function calc() {
    const from = $("cl-from").value, to = $("cl-to").value, pay = num("cl-pay"), job = $("cl-job").value;
    const equiv = pay * (RPP[to] / RPP[from]);
    $("cl-equiv-label").textContent = t("Same buying power in {state}", { state: to });
    $("cl-equiv").textContent = money(equiv);
    $("cl-rpp").textContent = `${RPP[from].toFixed(1)} → ${RPP[to].toFixed(1)}`;
    const name = t(STATE_PAY_OCCS.find((o) => o.key === job).name);
    const row = (s) => {
      const p = STATE_PAY[s] && STATE_PAY[s][job];
      return `<tr><td>${s}</td><td>${RPP[s].toFixed(1)}</td><td>${p ? money(p) : t("n/a")}</td><td>${p ? money(p * 100 / RPP[s]) : t("n/a")}</td></tr>`;
    };
    $("cl-table").innerHTML = `<thead><tr><th scope="col">${t("State")}</th><th scope="col">${t("Prices")}</th><th scope="col">${t("Median pay: {job}", { job: name })}</th><th scope="col">${t("In U.S.-average dollars")}</th></tr></thead><tbody>${row(from)}${from !== to ? row(to) : ""}</tbody>`;
    const pf = STATE_PAY[from] && STATE_PAY[from][job], pt = STATE_PAY[to] && STATE_PAY[to][job];
    const diffPct = Math.round((RPP[to] / RPP[from] - 1) * 100);
    let text = from === to ? t("Pick two different states to compare.") :
      t(diffPct >= 0 ? "Prices in {to} are about <strong>{pct}% higher</strong> than in {from}, so {pay} there feels like {equiv} in {to}." : "Prices in {to} are about <strong>{pct}% lower</strong> than in {from}, so {pay} there feels like {equiv} in {to}.",
        { to, from, pct: Math.abs(diffPct), pay: money(pay), equiv: money(equiv) });
    if (from !== to && pf && pt) {
      const rf = pf * 100 / RPP[from], rt = pt * 100 / RPP[to];
      const vars = { job: name.toLowerCase(), to, there: money(rt), here: money(rf) };
      text += " " + (job === "all"
        ? t(rt > rf ? "Across all jobs, typical pay adjusted for prices is higher in {to} ({there} vs {here})." : "Across all jobs, typical pay adjusted for prices is lower in {to} ({there} vs {here}).", vars)
        : t(rt > rf ? "For a typical {job}, pay adjusted for prices is higher in {to} ({there} vs {here})." : "For a typical {job}, pay adjusted for prices is lower in {to} ({there} vs {here}).", vars));
    }
    $("cl-insight").innerHTML = text;
  }

  ["cl-from", "cl-to", "cl-pay", "cl-job"].forEach((id) => $(id).addEventListener("input", calc));
  document.addEventListener("langchange", () => { jobs(); calc(); });
  calc();
})();
