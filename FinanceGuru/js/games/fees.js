// Fee Hunter — tap every bank fee hiding on a month's statement, then pick how you'd avoid each one.
// Statements get harder: plain fee names, then several fees at once, then bank shorthand ("SVC CHG") and decoys
// like an ATM fee rebate. Points: +1 per fee found, −1 per line that wasn't a fee (never below 0), +1 per right fix.
// Overdraft, NSF, and ATM amounts are Bankrate's 2025 Checking Account and ATM Fee Study averages;
// other fee amounts are examples. Businesses are fictional.
window.Games = window.Games || {};
Games.fees = (() => {
  const root = document.getElementById("fee-root");
  const ROUNDS = 3;
  const t = (s, v) => (typeof I18N === "object" ? I18N.t(s, v) : s);
  // Statement dates ("Mar 2") in the page's language ("2 mar").
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = (d) => { const [m, n] = d.split(" "); return new Date(2026, MONTHS.indexOf(m), +n).toLocaleDateString(typeof I18N === "object" ? I18N.locale() : "en-US", { month: "short", day: "numeric" }); };
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
    card: "<strong>Rush card delivery fee.</strong> A standard replacement card is usually free and arrives in about a week. Lock the lost card in your bank's app and pay with your phone's digital wallet while you wait.",
    extod: "<strong>Extended overdraft fee.</strong> Some banks charge again when your balance stays below $0 for several days. Get back above $0 fast, or pick a bank that doesn't charge overdraft fees at all.",
  };
  // How to avoid each fee: [right answer, two tempting wrong ones].
  const FIX = {
    od: ["Turn off overdraft coverage for debit and set a low-balance alert", "Pay the overdraft fee right away so it doesn't grow", "Use the debit card less often but for bigger purchases"],
    nsf: ["Keep a small buffer and schedule autopays for after payday", "Turn off every autopay", "Pay the bill again the same day"],
    atm: ["Use your bank's ATMs or get cash back at a store", "Take out less cash each time", "Use a credit card at the ATM instead"],
    sur: ["Find an in-network ATM in your bank's app", "Withdraw smaller amounts more often", "Use a credit card at the ATM instead"],
    fx: ["Use a card with no foreign transaction fee", "Split the order into smaller purchases", "Pay with your savings account instead"],
    maint: ["Set up direct deposit or switch to free checking", "Make fewer purchases each month", "Keep the account but stop using it"],
    paper: ["Switch to e-statements", "Ask for a statement every other month", "Throw the paper statements away unopened"],
    odt: ["Set a low-balance alert and move money yourself", "Link a credit card to cover overdrafts instead", "Keep less money in savings"],
    excess: ["Spend from checking and leave savings alone", "Make all your withdrawals on the same day", "Move your savings to a second savings account"],
    card: ["Choose free standard delivery and lock the card in the app", "Wait a week before reporting the card lost", "Order two cards so you always have a spare"],
    extod: ["Get the balance back above $0 right away", "Wait for payday so it's covered by one deposit", "Make a small purchase to reset the clock"],
  };
  // Each line: [date, description, amount, feeKey?]. Amounts are signed; running balances are computed.
  const STATEMENTS = [
    { title: "Tight week before payday", level: 1, start: 42.10, lines: [
      ["Mar 2", "Bean There Coffee", -5.75], ["Mar 3", "StreamFlix subscription", -15.49], ["Mar 3", "QuickFuel gas", -38.00],
      ["Mar 3", "OVERDRAFT ITEM FEE", -26.77, "od"], ["Mar 5", "Payroll deposit: Riverside Grocery", 412.50], ["Mar 6", "FreshMart groceries", -64.20],
      ["Mar 8", "TRANSFER TO SAVINGS", -50.00], ["Mar 10", "Phone bill autopay", -45.00], ["Mar 31", "INTEREST PAID", 0.02],
    ] },
    { title: "Spring break cash", level: 2, start: 620.00, lines: [
      ["Apr 1", "ATM WITHDRAWAL: Beachside Mart", -60.00], ["Apr 1", "NON-NETWORK ATM FEE", -1.64, "atm"], ["Apr 1", "ATM OWNER SURCHARGE", -3.22, "sur"],
      ["Apr 2", "Online order: Kicks Intl (UK)", -40.00], ["Apr 2", "FOREIGN TRANSACTION FEE", -1.20, "fx"], ["Apr 4", "Taco Shack", -12.40],
      ["Apr 5", "CASH BACK REWARD", 3.10], ["Apr 9", "Payroll deposit: Riverside Grocery", 398.75], ["Apr 12", "Bus pass", -25.00],
    ] },
    { title: "The account itself", level: 2, start: 180.00, lines: [
      ["May 1", "MONTHLY MAINTENANCE FEE", -12.00, "maint"], ["May 1", "PAPER STATEMENT FEE", -3.00, "paper"], ["May 3", "IronWorks Gym membership", -29.99],
      ["May 6", "AutoInsure payment $96.00: RETURNED UNPAID", 0], ["May 6", "NSF RETURNED ITEM FEE", -16.82, "nsf"], ["May 9", "Payroll deposit: Riverside Grocery", 405.20],
      ["May 10", "AutoInsure payment", -96.00], ["May 14", "Pizza Planet", -18.50], ["May 31", "INTEREST PAID", 0.03],
    ] },
    { title: "Moving money around", level: 3, start: 25.00, lines: [
      ["Jun 2", "Game Store: in-app purchase", -34.99], ["Jun 2", "OVERDRAFT TRANSFER FROM SAVINGS", 34.99], ["Jun 2", "OVERDRAFT TRANSFER FEE", -10.00, "odt"],
      ["Jun 4", "Payroll deposit: Riverside Grocery", 380.00], ["Jun 5", "Concert tickets", -85.00], ["Jun 7", "Annual membership: BigBox Club", -60.00],
      ["Jun 20", "SAVINGS EXCESS WITHDRAWAL FEE", -10.00, "excess"], ["Jun 21", "P2P payment from Alex (rent share)", 150.00], ["Jun 28", "Electric bill", -72.30],
    ] },
    { title: "The lost wallet", level: 3, start: 140.00, lines: [
      ["Jul 1", "Payroll deposit: Riverside Grocery", 392.10], ["Jul 3", "CARD REPL RUSH DLVRY", -25.00, "card"], ["Jul 3", "Burger Barn", -11.25],
      ["Jul 4", "ATM WITHDRAWAL: Harbor Credit Union", -40.00], ["Jul 5", "ATM FEE REBATE", 3.22], ["Jul 8", "Streamly subscription", -11.99],
      ["Jul 15", "SVC CHG", -15.00, "maint"], ["Jul 20", "Phone bill autopay", -45.00], ["Jul 31", "INTEREST PAID", 0.04],
    ] },
    { title: "Waiting on payday", level: 3, start: 60.00, lines: [
      ["Aug 1", "Car insurance autopay", -96.00], ["Aug 1", "ITEM PAID OD CHG", -26.77, "od"], ["Aug 2", "LOW BALANCE ALERT SENT: NO CHARGE", 0],
      ["Aug 5", "EXT OD BAL CHG", -25.00, "extod"], ["Aug 7", "Payroll deposit: Riverside Grocery", 410.00], ["Aug 9", "FreshMart groceries", -58.40],
      ["Aug 10", "Mobile check deposit", 120.00], ["Aug 20", "REFUND: Kicks Intl (UK)", 40.00], ["Aug 31", "INTEREST PAID", 0.01],
    ] },
  ];
  const LEVEL = { 1: "Easy", 2: "Tricky", 3: "Sneaky: bank shorthand and decoys" };
  const money = (v) => (v < 0 ? "−$" : "$") + Math.abs(v).toFixed(2);
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let round, score, deck, picked, checked, yearly, fixes, fixedYearly, fixRight, fixTotal;

  function start() {
    round = 0; score = 0; yearly = 0; fixedYearly = 0; fixRight = 0; fixTotal = 0;
    // One statement per level, easiest first.
    deck = [1, 2, 3].map((lv) => shuffle(STATEMENTS.filter((s) => s.level === lv))[0]);
    next();
  }

  function next() {
    picked = new Set(); checked = false; fixes = [];
    const s = deck[round];
    let bal = s.start;
    const rows = s.lines.map((l, i) => {
      bal += l[2];
      return `<button class="fee-row" data-row="${i}" aria-pressed="false">
        <span class="fee-desc"><span class="small muted">${day(l[0])}</span> ${t(l[1])}</span>
        <span class="fee-amt ${l[2] < 0 ? "neg" : ""}">${l[2] ? money(l[2]) : "$0.00"}</span>
        <span class="fee-bal ${bal < 0 ? "neg" : ""}">${money(bal)}</span></button>`;
    }).join("");
    root.innerHTML = `
      <div class="small muted">${t("Statement {n} of {total} · {score} pts", { n: round + 1, total: ROUNDS, score })}</div>
      <div class="step-dots">${Array.from({ length: ROUNDS }, (_, i) => `<span class="${i < round ? "on" : ""}"></span>`).join("")}</div>
      <h3 style="margin:12px 0 4px">${t(s.title)} <span class="fee-level">${t(LEVEL[s.level])}</span></h3>
      <p class="small muted" style="margin:0 0 10px">${t("Tap every <strong>fee the bank charged</strong>. Starting balance: {amount}", { amount: money(s.start) })}</p>
      <div class="fee-statement" role="group" aria-label="${t("Statement lines")}">
        <div class="fee-head"><span>${t("Date · Description")}</span><span>${t("Amount")}</span><span>${t("Balance")}</span></div>${rows}
      </div>
      <div style="text-align:center;margin-top:14px"><button class="btn btn-primary" data-check>${t("Check statement")}</button></div>
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
    // Every fee on the statement, found or missed, gets a "how would you avoid it?" question.
    fixes = fees.map((i) => ({ i, order: shuffle([0, 1, 2]), answer: null }));
    fixTotal += fixes.length;
    root.querySelector("[data-check]").remove();
    document.getElementById("fee-feedback").innerHTML = `<div class="feedback">
      <p style="margin:0"><strong>${found === fees.length && !wrong ? t("✅ Every fee found!") : t(fees.length > 1 ? "Found {found} of {n} fees" : "Found {found} of {n} fee", { found, n: fees.length }) + (wrong ? " · " + t(wrong > 1 ? "{n} lines weren't fees" : "{n} line wasn't a fee", { n: wrong }) : "") + "."}</strong> ${t("+{n} pts.", { n: pts })}
      ${t("This month's fees: <strong>{month}</strong>. Every month, that's <strong>{year} a year</strong>.", { month: money(total), year: money(total * 12) })}</p></div>
      <h3 style="margin:16px 0 4px">${t("How would you avoid each fee?")}</h3>
      <p class="small muted" style="margin:0 0 8px">${t("+1 point for each right fix.")}</p>
      <div class="fee-fixes">${fixes.map((f, k) => {
        const l = s.lines[f.i];
        return `<div class="fee-fix" data-fixbox="${k}"><div class="fee-fix-name"><strong>${t(l[1])}</strong> <span class="fee-amt neg">${money(l[2])}</span></div>
          <div class="fee-opts" role="group" aria-label="${t("Ways to avoid {fee}", { fee: t(l[1]) })}">${f.order.map((o) => `<button class="choice" data-fix="${k}:${o}">${t(FIX[l[3]][o])}</button>`).join("")}</div>
          <div class="fee-tip small" aria-live="polite"></div></div>`;
      }).join("")}</div>
      <div id="fee-next" style="text-align:center;margin-top:12px"></div>`;
  }

  function answerFix(k, o) {
    const f = fixes[k];
    if (!f || f.answer !== null) return;
    f.answer = o;
    const l = deck[round].lines[f.i];
    const box = root.querySelector(`[data-fixbox="${k}"]`);
    box.querySelectorAll("[data-fix]").forEach((b) => {
      const opt = +b.dataset.fix.split(":")[1];
      b.disabled = true;
      if (opt === 0) b.classList.add("correct");
      else if (opt === o) b.classList.add("wrong");
    });
    if (o === 0) { score++; fixRight++; fixedYearly += -l[2] * 12; }
    box.querySelector(".fee-tip").innerHTML = (o === 0 ? t("✅ Right.") : t("❌ Not quite.")) + " " + t(TIP[l[3]]);
    if (fixes.every((x) => x.answer !== null)) {
      const right = fixes.filter((x) => x.answer === 0).length;
      document.getElementById("fee-next").innerHTML = `<p class="small" style="margin:0 0 10px">${t("{right} of {n} fixes right · {score} pts so far", { right, n: fixes.length, score })}</p>
        <button class="btn btn-primary" data-next>${round + 1 < ROUNDS ? t("Next statement →") : t("See results →")}</button>`;
      document.querySelector("#fee-next [data-next]").focus({ preventScroll: true });
    }
  }

  function end() {
    // Each fee is worth 2 points: 1 for spotting it, 1 for the right fix.
    const max = deck.reduce((t, s) => t + s.lines.filter((l) => l[3]).length, 0) * 2;
    const { best, isNew } = FG.recordBest("fees", score);
    const xp = score * 8;
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    root.innerHTML = `<div class="result">
      <div class="card-icon" style="font-size:2.4rem">🔎</div>
      <div class="big">${score}/${max}</div>
      <p class="small muted">${isNew ? t("🏆 New best!") : t("Best: {best}", { best: t("{n} pts", { n: best }) })} · +${xp} XP</p>
      <p>${t("If these three months repeated all year, the fees would cost <strong>{amount}</strong>, money you'd get nothing for.", { amount: money(yearly / ROUNDS) })}
        ${t("You picked the right fix for <strong>{right} of {n}</strong> fees, worth <strong>{amount} a year</strong>.", { right: fixRight, n: fixTotal, amount: money(fixedYearly / ROUNDS) })}</p>
      <div class="callout" style="text-align:left">${t("<strong>Money lesson:</strong> most bank fees are optional. Pick a no-fee account, don't opt in to overdraft coverage for debit, set low-balance alerts, and use in-network ATMs. Learn more in the <a href=\"learn.html#banking\">Banking Basics lesson</a>.")}</div>
      <button class="btn btn-primary" data-restart>${t("Play again")}</button></div>`;
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
    const fx = e.target.closest("[data-fix]");
    if (fx && !fx.disabled) { const [k, o] = fx.dataset.fix.split(":").map(Number); return answerFix(k, o); }
    if (e.target.closest("[data-next]")) { round++; return round < ROUNDS ? next() : end(); }
    if (e.target.closest("[data-restart]")) start();
  });

  // A statement not yet checked is redrawn in the new language (taps so far are kept).
  document.addEventListener("langchange", () => {
    if (round === undefined || checked || round >= ROUNDS) return;
    const keep = new Set(picked); next(); picked = keep;
    picked.forEach((i) => root.querySelector(`[data-row="${i}"]`).setAttribute("aria-pressed", "true"));
  });
  return { show() { if (round === undefined) start(); }, hide() {} };
})();
