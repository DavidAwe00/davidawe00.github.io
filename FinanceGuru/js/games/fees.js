// Fee Hunter — tap every bank fee hiding on a month's statement, then learn how to avoid each one.
// Overdraft, NSF, and ATM amounts are Bankrate's 2025 Checking Account and ATM Fee Study averages;
// other fee amounts are examples. Businesses are fictional.
window.Games = window.Games || {};
Games.fees = (() => {
  const root = document.getElementById("fee-root");
  const ROUNDS = 3;
  const TIP = {
    od: "<strong>Overdraft fee ($26.77 average).</strong> The purchase pushed the balance below $0 and the bank covered it, for a price. Don't opt in to overdraft coverage for debit and ATM, and turn on low-balance alerts.",
    nsf: "<strong>Insufficient funds fee ($16.82 average).</strong> The payment bounced, so you paid a fee and the bill still isn't paid. Keep a small buffer, or link savings to cover shortfalls.",
    atm: "<strong>Your bank's out-of-network ATM fee ($1.64 average).</strong> Use your bank's ATM network or get cash back at a store.",
    sur: "<strong>ATM owner's surcharge ($3.22 average).</strong> Together with your bank's fee, that's $4.86 to get your own cash.",
    fx: "<strong>Foreign transaction fee.</strong> Many cards charge a percentage of purchases from foreign sellers. Some cards and banks charge none.",
    maint: "<strong>Monthly maintenance fee.</strong> Many accounts waive it with a direct deposit or a minimum balance, and free checking accounts never charge it.",
    paper: "<strong>Paper statement fee.</strong> Switch to e-statements in your bank's app.",
    odt: "<strong>Overdraft transfer fee.</strong> Cheaper than an overdraft, but still a fee. Low-balance alerts let you move money yourself for free.",
    excess: "<strong>Excess withdrawal fee.</strong> Some savings accounts charge when you make too many withdrawals in a month. Keep savings for saving, and spend from checking.",
  };
  // Each line: [date, description, amount, feeKey?]. Amounts are signed; running balances are computed.
  const STATEMENTS = [
    { title: "Tight week before payday", start: 42.10, lines: [
      ["Mar 2", "Bean There Coffee", -5.75], ["Mar 3", "StreamFlix subscription", -15.49], ["Mar 3", "QuickFuel gas", -38.00],
      ["Mar 3", "OVERDRAFT ITEM FEE", -26.77, "od"], ["Mar 5", "Payroll deposit: Riverside Grocery", 412.50], ["Mar 6", "FreshMart groceries", -64.20],
      ["Mar 8", "TRANSFER TO SAVINGS", -50.00], ["Mar 10", "Phone bill autopay", -45.00], ["Mar 31", "INTEREST PAID", 0.02],
    ] },
    { title: "Spring break cash", start: 620.00, lines: [
      ["Apr 1", "ATM WITHDRAWAL: Beachside Mart", -60.00], ["Apr 1", "NON-NETWORK ATM FEE", -1.64, "atm"], ["Apr 1", "ATM OWNER SURCHARGE", -3.22, "sur"],
      ["Apr 2", "Online order: Kicks Intl (UK)", -40.00], ["Apr 2", "FOREIGN TRANSACTION FEE", -1.20, "fx"], ["Apr 4", "Taco Shack", -12.40],
      ["Apr 5", "CASH BACK REWARD", 3.10], ["Apr 9", "Payroll deposit: Riverside Grocery", 398.75], ["Apr 12", "Bus pass", -25.00],
    ] },
    { title: "The account itself", start: 180.00, lines: [
      ["May 1", "MONTHLY MAINTENANCE FEE", -12.00, "maint"], ["May 1", "PAPER STATEMENT FEE", -3.00, "paper"], ["May 3", "IronWorks Gym membership", -29.99],
      ["May 6", "AutoInsure payment $96.00: RETURNED UNPAID", 0], ["May 6", "NSF RETURNED ITEM FEE", -16.82, "nsf"], ["May 9", "Payroll deposit: Riverside Grocery", 405.20],
      ["May 10", "AutoInsure payment", -96.00], ["May 14", "Pizza Planet", -18.50], ["May 31", "INTEREST PAID", 0.03],
    ] },
    { title: "Moving money around", start: 25.00, lines: [
      ["Jun 2", "Game Store: in-app purchase", -34.99], ["Jun 2", "OVERDRAFT TRANSFER FROM SAVINGS", 34.99], ["Jun 2", "OVERDRAFT TRANSFER FEE", -10.00, "odt"],
      ["Jun 4", "Payroll deposit: Riverside Grocery", 380.00], ["Jun 5", "Concert tickets", -85.00], ["Jun 7", "Annual membership: BigBox Club", -60.00],
      ["Jun 20", "SAVINGS EXCESS WITHDRAWAL FEE", -10.00, "excess"], ["Jun 21", "P2P payment from Alex (rent share)", 150.00], ["Jun 28", "Electric bill", -72.30],
    ] },
  ];
  const money = (v) => (v < 0 ? "−$" : "$") + Math.abs(v).toFixed(2);
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let round, score, deck, picked, checked, yearly;

  function start() {
    round = 0; score = 0; yearly = 0;
    deck = shuffle([...STATEMENTS]).slice(0, ROUNDS);
    next();
  }

  function next() {
    picked = new Set(); checked = false;
    const s = deck[round];
    let bal = s.start;
    const rows = s.lines.map((l, i) => {
      bal += l[2];
      return `<button class="fee-row" data-row="${i}" aria-pressed="false">
        <span class="fee-desc"><span class="small muted">${l[0]}</span> ${l[1]}</span>
        <span class="fee-amt ${l[2] < 0 ? "neg" : ""}">${l[2] ? money(l[2]) : "$0.00"}</span>
        <span class="fee-bal ${bal < 0 ? "neg" : ""}">${money(bal)}</span></button>`;
    }).join("");
    root.innerHTML = `
      <div class="small muted">Statement ${round + 1} of ${ROUNDS} · ${score} pts</div>
      <div class="step-dots">${Array.from({ length: ROUNDS }, (_, i) => `<span class="${i < round ? "on" : ""}"></span>`).join("")}</div>
      <h3 style="margin:12px 0 4px">${s.title}</h3>
      <p class="small muted" style="margin:0 0 10px">Tap every <strong>fee the bank charged</strong>. Starting balance: ${money(s.start)}</p>
      <div class="fee-statement" role="group" aria-label="Statement lines">
        <div class="fee-head"><span>Date · Description</span><span>Amount</span><span>Balance</span></div>${rows}
      </div>
      <div style="text-align:center;margin-top:14px"><button class="btn btn-primary" data-check>Check statement</button></div>
      <div id="fee-feedback" style="margin-top:14px" aria-live="polite"></div>`;
  }

  function check() {
    if (checked) return;
    checked = true;
    const s = deck[round];
    const fees = s.lines.map((l, i) => (l[3] ? i : -1)).filter((i) => i >= 0);
    let found = 0, wrong = 0;
    root.querySelectorAll("[data-row]").forEach((b) => {
      const i = +b.dataset.row, isFee = !!s.lines[i][3], on = picked.has(i);
      b.disabled = true;
      if (isFee && on) { found++; b.classList.add("hit"); }
      else if (isFee) b.classList.add("missed");
      else if (on) { wrong++; b.classList.add("wrong"); }
    });
    const pts = Math.max(0, found - wrong);
    score += pts;
    const total = fees.reduce((t, i) => t - s.lines[i][2], 0);
    yearly += total * 12;
    root.querySelector("[data-check]").remove();
    document.getElementById("fee-feedback").innerHTML = `<div class="feedback">
      <p style="margin:0 0 8px"><strong>${found === fees.length && !wrong ? "✅ Every fee found!" : `Found ${found} of ${fees.length} fee${fees.length > 1 ? "s" : ""}${wrong ? ` · ${wrong > 1 ? wrong + " lines weren't fees" : "1 line wasn't a fee"}` : ""}.`}</strong> +${pts} pts.
      This month's fees: <strong>${money(total)}</strong>. Every month, that's <strong>${money(total * 12)} a year</strong>.</p>
      <ul style="margin:0;padding-left:20px">${fees.map((i) => `<li>${TIP[s.lines[i][3]]}</li>`).join("")}</ul></div>
      <div style="text-align:center;margin-top:12px"><button class="btn btn-primary" data-next>${round + 1 < ROUNDS ? "Next statement →" : "See results →"}</button></div>`;
  }

  function end() {
    const max = deck.reduce((t, s) => t + s.lines.filter((l) => l[3]).length, 0);
    const { best, isNew } = FG.recordBest("fees", score);
    const xp = score * 8;
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    root.innerHTML = `<div class="result">
      <div class="card-icon" style="font-size:2.4rem">🔎</div>
      <div class="big">${score}/${max}</div>
      <p class="small muted">${isNew ? "🏆 New best!" : "Best: " + best + " pts"} · +${xp} XP</p>
      <p>If these three months repeated all year, the fees would cost <strong>${money(yearly / ROUNDS)}</strong>, money you'd get nothing for.</p>
      <div class="callout" style="text-align:left"><strong>Money lesson:</strong> most bank fees are optional. Pick a no-fee account, don't opt in to overdraft coverage for debit, set low-balance alerts, and use in-network ATMs. Learn more in the <a href="learn.html#banking">Banking Basics lesson</a>.</div>
      <button class="btn btn-primary" data-restart>Play again</button></div>`;
  }

  root.addEventListener("click", (e) => {
    const r = e.target.closest("[data-row]");
    if (r && !checked) {
      const i = +r.dataset.row;
      picked.has(i) ? picked.delete(i) : picked.add(i);
      r.setAttribute("aria-pressed", picked.has(i));
      return;
    }
    if (e.target.closest("[data-check]")) return check();
    if (e.target.closest("[data-next]")) { round++; return round < ROUNDS ? next() : end(); }
    if (e.target.closest("[data-restart]")) start();
  });

  return { show() { if (round === undefined) start(); }, hide() {} };
})();
