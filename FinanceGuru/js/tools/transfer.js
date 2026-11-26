// Balance Transfer Check: interest on the current card vs a transfer fee plus 0% intro period,
// then the post-intro APR on whatever balance is left. Same fixed monthly payment for both.
(function () {
  const { $, num, money, t } = ToolKit;
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
  const span = (m) => (m === Infinity ? t("never") : m >= 12 ? `${t("{n} yr", { n: Math.floor(m / 12) })} ${t("{n} mo", { n: m % 12 })}` : t("{n} mo", { n: m }));

  function calc() {
    const bal = num("bt-bal"), apr = num("bt-apr"), feePct = num("bt-fee") / 100, intro = Math.round(num("bt-months"));
    const after = num("bt-after"), pay = num("bt-pay");
    const stay = payoff(bal, pay, () => apr);
    const fee = bal * feePct;
    const move = payoff(bal + fee, pay, (m) => (m < intro ? 0 : after));
    const moveCost = fee + move.interest;
    const left = Math.max(0, bal + fee - pay * intro);
    $("bt-stay").textContent = stay.interest === Infinity ? t("Never paid off") : money(stay.interest);
    $("bt-move").textContent = move.interest === Infinity ? t("Never paid off") : money(moveCost);
    const saved = stay.interest - moveCost;
    $("bt-save").textContent = Number.isFinite(saved) ? money(saved) : "—";
    $("bt-save").style.color = saved > 0 ? "var(--good)" : "var(--bad)";
    $("bt-insight").innerHTML = !bal ? t("Enter a balance to compare.") : stay.interest === Infinity && move.interest === Infinity
      ? t("This payment doesn't cover the monthly interest. Raise it to make progress.")
      : `${t("Transfer fee: <strong>{fee}</strong>.", { fee: money(fee) })} ${left > 0
          ? t("At {pay} a month, <strong>{left}</strong> is still owed when the 0% period ends, and it starts costing {after}% APR. To clear it in time, pay about {needed} a month.", { pay: money(pay), left: money(left), after, needed: money((bal + fee) / Math.max(1, intro)) })
          : t("At {pay} a month, you'd pay it off in {time}, before the 0% period ends.", { pay: money(pay), time: span(move.months) })} ${saved > 0
          ? t("Compared with staying put (paid off in {time}), you save about {saved}. Don't add new charges to either card.", { time: span(stay.months), saved: money(saved) })
          : t("Here, the fee costs more than the interest you'd avoid, so the transfer isn't worth it.")}`;
  }

  document.querySelectorAll("#panel-transfer input").forEach((el) => el.addEventListener("input", calc));
  document.addEventListener("langchange", calc);
  calc();
})();
