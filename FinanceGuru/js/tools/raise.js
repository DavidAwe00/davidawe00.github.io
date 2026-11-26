// Raise vs Inflation: compares a pay change with the change in the annual average CPI-U
// (CPI_ANNUAL in js/data/inflation.js) between the two years.
(function () {
  const { $, num, money, t } = ToolKit;
  if (!$("panel-raise")) return;
  const years = Object.keys(CPI_ANNUAL).filter((y) => +y >= 1990).reverse();
  const latest = years[0];
  $("rs-old-year").innerHTML = $("rs-new-year").innerHTML = years.map((y) => `<option>${y}</option>`).join("");
  $("rs-new-year").value = latest;
  $("rs-old-year").value = String(latest - 1);
  const pct = (v) => (v >= 0 ? "+" : "−") + Math.abs(v * 100).toFixed(1) + "%";

  function calc() {
    const oldPay = num("rs-old"), newPay = num("rs-new");
    const y0 = $("rs-old-year").value, y1 = $("rs-new-year").value;
    const infl = CPI_ANNUAL[y1] / CPI_ANNUAL[y0] - 1;
    const raise = oldPay ? newPay / oldPay - 1 : 0;
    const needed = oldPay * (1 + infl);
    const real = needed ? newPay / needed - 1 : 0;
    $("rs-raise").textContent = oldPay ? pct(raise) : "—";
    $("rs-infl").textContent = pct(infl);
    $("rs-real").textContent = oldPay ? pct(real) : "—";
    $("rs-real").style.color = real >= 0 ? "var(--good)" : "var(--bad)";
    $("rs-insight").innerHTML = !oldPay
      ? t("Enter your old pay to compare.")
      : +y1 <= +y0
        ? t("Pick a new-pay year after the old-pay year.")
        : real >= 0
          ? t("To keep up with prices from {y0} to {y1}, you needed <strong>{needed}</strong>. You're earning {more} more than that, so your buying power grew.", { y0, y1, needed: money(needed), more: money(newPay - needed) })
          : t("To keep up with prices from {y0} to {y1}, you needed <strong>{needed}</strong>. You're {short} short, so even with the raise, your pay buys less than before. That's useful to know before your next pay conversation.", { y0, y1, needed: money(needed), short: money(needed - newPay) });
  }

  ["rs-old", "rs-new", "rs-old-year", "rs-new-year"].forEach((id) => $(id).addEventListener("input", calc));
  document.addEventListener("langchange", calc);
  calc();
})();
