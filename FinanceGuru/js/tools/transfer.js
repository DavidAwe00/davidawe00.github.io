// Balance Transfer Check: interest on the current card vs a transfer fee plus 0% intro period,
// then the post-intro APR on whatever balance is left. Same fixed monthly payment for both.
(function () {
  const { $, num, money } = ToolKit;
  if (!$("panel-transfer")) return;
  const MAX_MONTHS = 600;

  // Months to pay off and total interest. aprAt(month) gives the APR (%) for that month.
  function payoff(balance, payment, aprAt) {
    let bal = balance, interest = 0, m = 0;
    while (bal > 0.005 && m < MAX_MONTHS) {
      const i = bal * aprAt(m) / 100 / 12;
      if (payment <= i && i > 0) return { months: Infinity, interest: Infinity };
      bal += i; interest += i; bal -= Math.min(payment, bal); m++;
    }
    return { months: m, interest };
  }
  const span = (m) => (m === Infinity ? "never" : m >= 12 ? `${Math.floor(m / 12)} yr ${m % 12} mo` : `${m} mo`);

  function calc() {
    const bal = num("bt-bal"), apr = num("bt-apr"), feePct = num("bt-fee") / 100, intro = Math.round(num("bt-months"));
    const after = num("bt-after"), pay = num("bt-pay");
    const stay = payoff(bal, pay, () => apr);
    const fee = bal * feePct;
    const move = payoff(bal + fee, pay, (m) => (m < intro ? 0 : after));
    const moveCost = fee + move.interest;
    const left = Math.max(0, bal + fee - pay * intro);
    $("bt-stay").textContent = stay.interest === Infinity ? "Never paid off" : money(stay.interest);
    $("bt-move").textContent = move.interest === Infinity ? "Never paid off" : money(moveCost);
    const saved = stay.interest - moveCost;
    $("bt-save").textContent = Number.isFinite(saved) ? money(saved) : "—";
    $("bt-save").style.color = saved > 0 ? "var(--good)" : "var(--bad)";
    $("bt-insight").innerHTML = !bal ? "Enter a balance to compare." : stay.interest === Infinity && move.interest === Infinity
      ? "This payment doesn't cover the monthly interest. Raise it to make progress."
      : `Transfer fee: <strong>${money(fee)}</strong>. ${left > 0
          ? `At ${money(pay)} a month, <strong>${money(left)}</strong> is still owed when the 0% period ends, and it starts costing ${after}% APR. To clear it in time, pay about ${money((bal + fee) / Math.max(1, intro))} a month.`
          : `At ${money(pay)} a month, you'd pay it off in ${span(move.months)}, before the 0% period ends.`} ${saved > 0
          ? `Compared with staying put (paid off in ${span(stay.months)}), you save about ${money(saved)}. Don't add new charges to either card.`
          : "Here, the fee costs more than the interest you'd avoid, so the transfer isn't worth it."}`;
  }

  document.querySelectorAll("#panel-transfer input").forEach((el) => el.addEventListener("input", calc));
  calc();
})();
