// First Apartment Budget: your share of rent and utilities against HUD's 30%-of-income guideline,
// plus the cash needed to move in.
(function () {
  const { $, num, money } = ToolKit;
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
    $("ap-pct").textContent = income ? `${Math.round(pct * 100)}% of your gross pay` : "";
    $("ap-cash").textContent = money(cash);
    $("ap-list").innerHTML = [
      ["Your rent share", share], ["Your utilities share", util], ["Renters insurance", ins],
      ["First month's rent", share, true], ["Security deposit", deposit, true], ["Furniture, moving & setup", num("ap-setup"), true], ["Application & setup fees", num("ap-fees"), true],
    ].map(([n, v, once]) => `<div class="pc-row"><span>${n}</span><span>${money(v)}</span><span class="muted small">${once ? "once" : "/month"}</span></div>`).join("");
    const landlordOk = num("ap-income") >= rent * 12 / people * 3;
    $("ap-insight").innerHTML = !income ? "Enter your income to check affordability." :
      `${pct <= 0.3 ? `✅ Your housing costs are <strong>${Math.round(pct * 100)}%</strong> of your pay, within the 30% guideline.` : `⚠️ Your housing costs are <strong>${Math.round(pct * 100)}%</strong> of your pay, above the 30% guideline. ${people < 4 ? "Another roommate, a cheaper place, or higher income would help." : "A cheaper place or higher income would help."}`} ` +
      `Save <strong>${money(cash)}</strong> before you sign. ${landlordOk ? "Your income also meets the common 3× rent rule for your share." : "Many landlords want income of about 3× the rent; you may need a co-signer or roommates on the lease."}`;
  }

  document.querySelectorAll("#panel-apartment input").forEach((el) => el.addEventListener("input", calc));
  calc();
})();
