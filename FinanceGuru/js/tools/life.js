// Life Insurance Needs: income × years + debts + future costs − savings − existing coverage.
(function () {
  const { $, num, money, t } = ToolKit;
  if (!$("panel-life")) return;

  function calc() {
    const income = num("li-income") * num("li-years");
    const need = income + num("li-debt") + num("li-future");
    const offsets = num("li-savings") + num("li-have");
    const gap = Math.max(0, need - offsets);
    $("li-need").textContent = money(need);
    $("li-gap").textContent = money(gap);
    $("li-list").innerHTML = [
      ["Income replacement", income], ["Debts", num("li-debt")], ["Future costs", num("li-future")],
      ["Savings and investments", -num("li-savings")], ["Coverage you have", -num("li-have")],
    ].map(([n, v]) => `<div class="pc-row"><span>${t(n)}</span><span>${money(v)}</span><span></span></div>`).join("");
    $("li-insight").innerHTML = gap
      ? t("A <strong>term life</strong> policy of about <strong>{amount}</strong> for {years} years would cover the gap. Term coverage is usually far cheaper than whole life for the same amount.", { amount: money(Math.ceil(gap / 50000) * 50000), years: num("li-years") })
      : t("Your savings and existing coverage already cover this estimate. Revisit it after big life changes like marriage, a home, or a child.");
  }

  document.querySelectorAll("#panel-life input").forEach((el) => el.addEventListener("input", calc));
  document.addEventListener("langchange", calc);
  calc();
})();
