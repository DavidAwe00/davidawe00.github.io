// First Apartment Budget: your share of rent and utilities against HUD's 30%-of-income guideline,
// plus the cash needed to move in.
(function () {
  const { $, num, money, t } = ToolKit;
  if (!$("panel-apartment")) return;

  function calc() {
    const income = num("ap-income") / 12, people = Math.max(1, Math.round(num("ap-people")));
    const rent = num("ap-rent"), share = rent / people, util = num("ap-util") / people, ins = num("ap-ins");
    const monthly = share + util + ins;
    const pct = income ? monthly / income : 0;
    const maxShare = income * 0.3;
    const deposit = share * num("ap-deposit");
    const cash = share + deposit + num("ap-setup") + num("ap-fees");
    $("ap-max").textContent = money(maxShare);
    $("ap-month").textContent = money(monthly);
    $("ap-pct").textContent = income ? t("{pct}% of your gross pay", { pct: Math.round(pct * 100) }) : "";
    $("ap-cash").textContent = money(cash);
    $("ap-list").innerHTML = [
      ["Your rent share", share], ["Your utilities share", util], ["Renters insurance", ins],
      ["First month's rent", share, true], ["Security deposit", deposit, true], ["Furniture, moving & setup", num("ap-setup"), true], ["Application & setup fees", num("ap-fees"), true],
    ].map(([n, v, once]) => `<div class="pc-row"><span>${t(n)}</span><span>${money(v)}</span><span class="muted small">${once ? t("once") : t("/month")}</span></div>`).join("");
    const landlordOk = num("ap-income") >= rent * 12 / people * 3;
    const p100 = Math.round(pct * 100);
    $("ap-insight").innerHTML = !income ? t("Enter your income to check affordability.") :
      `${pct <= 0.3 ? t("✅ Your housing costs are <strong>{pct}%</strong> of your pay, within the 30% guideline.", { pct: p100 }) : `${t("⚠️ Your housing costs are <strong>{pct}%</strong> of your pay, above the 30% guideline.", { pct: p100 })} ${people < 4 ? t("Another roommate, a cheaper place, or higher income would help.") : t("A cheaper place or higher income would help.")}`} ` +
      `${t("Save <strong>{cash}</strong> before you sign.", { cash: money(cash) })} ${landlordOk ? t("Your income also meets the common 3× rent rule for your share.") : t("Many landlords want income of about 3× the rent; you may need a co-signer or roommates on the lease.")}`;
  }

  document.querySelectorAll("#panel-apartment input").forEach((el) => el.addEventListener("input", calc));
  document.addEventListener("langchange", calc);
  calc();
})();
