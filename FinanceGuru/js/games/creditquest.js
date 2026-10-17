// Credit Score Quest — 12 months of real-life credit choices; watch an illustrative score respond.
// Lessons: pay on time, keep utilization low, apply sparingly, keep old accounts, check your report,
// and keep an emergency fund so surprises don't land on a 22%+ APR card.
window.Games = window.Games || {};
Games.credit = (() => {
  const root = document.getElementById("cq-root");
  const APR = 0.2236;   // Federal Reserve G.19, Aug 2026: avg rate on accounts assessed interest
  const BUDGET = 600;   // monthly money available for the card + savings
  let s;

  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const cards = () => s.accounts.filter((a) => a.type === "card");
  const limit = () => cards().reduce((t, a) => t + a.limit, 0);
  function inputs() {
    const ages = s.accounts.map((a) => (s.month - a.opened) / 12);
    return {
      late: s.lates.length,
      util: limit() ? Math.min(100, (s.balance / limit()) * 100) : 100,
      age: ages.reduce((t, x) => t + x, 0) / ages.length,
      inq: s.inquiries.filter((m) => s.month - m < 12).length,
      mix: new Set(s.accounts.map((a) => a.kind)).size,
    };
  }
  const current = () => CREDIT_MODEL.score(inputs()).score;
  const openAccount = (type, kind, lim) => { s.accounts.push({ type, kind, opened: s.month, limit: lim || 0 }); s.inquiries.push(s.month); };
  // Spend money: from savings if chosen and possible, otherwise the card.
  function spend(amount, fromSavings) {
    if (fromSavings && s.savings >= amount) { s.savings -= amount; return `Paid ${FG.money(amount)} from savings.`; }
    s.balance += amount;
    return fromSavings ? `Savings were short, so ${FG.money(amount)} went on your card.` : `${FG.money(amount)} went on your card.`;
  }

  const EVENTS = [
    { e: "🛍️", t: "Store card offer", d: "At checkout: \"Open our store card and save 20% on these $300 jeans!\"", c: [
      ["Open the store card", () => { openAccount("card", "card", 1000); return "New card ($1,000 limit) — but that's a hard inquiry and a brand-new account lowering your average age. " + spend(240); }],
      ["No thanks — skip the jeans", () => "Saved $300 and your credit file stays clean."],
    ] },
    { e: "💻", t: "Laptop died", d: "You need a laptop for work. A new one is $1,000; a refurbished one is $450.", c: [
      ["New laptop, from savings", () => spend(1000, true)],
      ["New laptop, on the card", () => spend(1000)],
      ["Refurbished, from savings", () => spend(450, true)],
    ] },
    { e: "📈", t: "Credit limit increase", d: "Your card issuer offers to raise your limit from $2,000 to $4,000.", c: [
      ["Accept", () => { cards()[0].limit = 4000; return "More available credit means a lower utilization ratio — as long as you don't spend it."; }],
      ["Decline", () => "Fine too — just keep your balance low."],
    ] },
    { e: "🚗", t: "Your car won't start", d: "The repair isn't worth it. You need transportation.", c: [
      ["Finance a used car (auto loan)", () => { openAccount("loan", "auto", 0); return "Auto loan approved: a hard inquiry and a new account, but it adds an installment loan to your credit mix. Pay it on time!"; }],
      ["Bike + bus for a while", () => "No new debt. Your credit report doesn't change."],
    ] },
    { e: "📬", t: "\"You're pre-approved!\"", d: "Three credit card offers arrive in the mail.", c: [
      ["Apply for all three", () => { for (let i = 0; i < 3; i++) openAccount("card", "card", 1500); return "Three hard inquiries and three new accounts at once. Your average account age just dropped a lot."; }],
      ["Shred them", () => "Good call. Apply only when you have a reason."],
    ] },
    { e: "🐶", t: "Vet emergency", d: "Your dog needs surgery: $700.", c: [
      ["Pay from savings", () => spend(700, true)],
      ["Put it on the card", () => spend(700)],
    ] },
    { e: "🏖️", t: "Friends' beach trip", d: "Everyone's going. Your share: $800.", c: [
      ["Go — charge it", () => spend(800)],
      ["Go — use savings", () => spend(800, true)],
      ["Sit this one out", () => "FOMO, but your credit and savings thank you."],
    ] },
    { e: "✂️", t: "Close your oldest card?", d: "You barely use your first card anymore. Close it?", c: [
      ["Close it", () => { const c = cards()[0]; if (cards().length > 1) { c.limit = 0; c.type = "closed"; return "Closed. Your total available credit shrank, so the same balance now means higher utilization."; } return "It's your only card — closing it would leave you no available credit, so you keep it after all."; }],
      ["Keep it open", () => "Smart: old accounts and unused credit both help your score."],
    ] },
    { e: "🔍", t: "Free credit report check", d: "On AnnualCreditReport.com you spot a $300 account you never opened.", c: [
      ["Dispute it", () => "The bureau investigated and removed it. Checking your reports catches errors and fraud."],
      ["Ignore it", () => { s.lates.push(s.month); return "It went unpaid and was reported as delinquent on your file. Always dispute errors!"; }],
    ] },
    { e: "🤝", t: "Co-sign for a friend?", d: "A friend asks you to co-sign their car loan.", c: [
      ["Co-sign", () => { s.accounts.push({ type: "loan", kind: "auto", opened: s.month, limit: 0 }); s.inquiries.push(s.month); if (Math.random() < 0.5) { s.lates.push(s.month); return "Your friend missed a payment — and as co-signer, it shows up on YOUR report too."; } return "So far your friend pays on time. But their loan is now your responsibility too."; }],
      ["Politely decline", () => "Co-signing makes you fully responsible for someone else's debt. Declining protects you."],
    ] },
    { e: "⏳", t: "Paycheck delayed", d: "A payroll mix-up means you only have $100 for bills this month.", c: [
      ["Call the card issuer and explain", () => { s.budget = 100; return "Good move — many issuers will work with you if you call before the due date. Still, make sure at least the minimum gets paid."; }],
      ["Hope for the best", () => { s.budget = 100; return "Only $100 available this month. Make sure the minimum gets paid!"; }],
    ] },
  ];

  function start() {
    s = {
      month: 0, balance: 900, savings: 300, interest: 0, budget: BUDGET, paidFull: 0, phase: "event",
      accounts: [{ type: "card", kind: "card", opened: -14, limit: 2000 }, { type: "loan", kind: "student", opened: -40, limit: 0 }],
      lates: [], inquiries: [], log: [], deck: shuffle([...EVENTS]).slice(0, 10),
    };
    s.startScore = current();
    s.prevScore = s.startScore;
    nextMonth();
  }

  function nextMonth() {
    s.month++;
    s.budget = BUDGET;
    s.event = s.month === 1 || s.month === 7 ? null : s.deck.pop(); // two quiet months
    s.phase = s.event ? "event" : "pay";
    render();
  }

  const minPay = () => Math.min(s.balance, Math.max(25, s.balance * 0.01 + s.balance * APR / 12));

  function pay(kind) {
    const before = s.balance;
    let amt = 0, note = "";
    if (kind === "full") { amt = s.balance; s.paidFull++; note = "Paid in full — no interest this month."; }
    if (kind === "budget") { amt = Math.min(s.balance, s.budget); note = `Paid ${FG.money(amt)}.`; }
    if (kind === "min") { amt = minPay(); note = `Paid the minimum (${FG.money(amt)}).`; }
    if (kind === "skip") { amt = 0; s.lates.push(s.month); note = "Missed payment. Once it's 30 days past due, the lender reports it as late — and it can stay on your report for up to 7 years."; }
    s.balance -= amt;
    s.savings += Math.max(0, s.budget - amt);
    if (s.balance > 0.5 && kind !== "full") { const i = s.balance * APR / 12; s.balance += i; s.interest += i; note += ` Interest charged: ${FG.money(i)}.`; }
    s.log.unshift(`Month ${s.month}: ${note.split(".")[0]}.`);
    s.lastNote = note;
    s.phase = "result";
    render();
  }

  function scorePanel() {
    const sc = current(), delta = sc - s.prevScore, tier = CREDIT_MODEL.tier(sc), inp = inputs();
    const pos = ((sc - 300) / 550) * 100;
    return `<div class="card cq-side">
      <div class="gauge-top"><div><div class="small muted">Illustrative score</div><div class="gauge-num">${sc}${delta ? `<span class="cq-delta ${delta > 0 ? "up" : "down"}">${delta > 0 ? "+" : ""}${delta}</span>` : ""}</div></div><span class="badge done">${tier}</span></div>
      <div class="gauge-bar">${CREDIT_MODEL.TIERS.map(([min, name], i) => `<span style="flex:${(CREDIT_MODEL.TIERS[i + 1] ? CREDIT_MODEL.TIERS[i + 1][0] : 851) - min}" class="${name === tier ? "on" : ""}"></span>`).join("")}<i style="left:${pos}%"></i></div>
      <div class="kv" style="margin-top:14px"><span>Card balance</span><strong>${FG.money(s.balance)}</strong></div>
      <div class="kv"><span>Utilization</span><span>${Math.round(inp.util)}% of ${FG.money(limit())}</span></div>
      <div class="kv"><span>Late payments</span><span>${s.lates.length}</span></div>
      <div class="kv"><span>New applications</span><span>${inp.inq}</span></div>
      <div class="kv"><span>Avg. account age</span><span>${inp.age.toFixed(1)} yrs</span></div>
      <div class="kv"><span>Savings</span><span>${FG.money(s.savings)}</span></div>
      <div class="kv"><span>Interest paid</span><span>${FG.money(s.interest)}</span></div>
    </div>`;
  }

  function render() {
    let main;
    if (s.phase === "event") {
      const ev = s.event;
      main = `<div class="emoji">${ev.e}</div><h3>${ev.t}</h3><p>${ev.d}</p>
        <div class="choices">${ev.c.map(([label], i) => `<button class="choice" data-ev="${i}">${label}</button>`).join("")}</div>`;
    } else if (s.phase === "pay") {
      const full = s.balance <= s.budget;
      main = `${s.eventNote ? `<div class="feedback" style="margin-bottom:14px">${s.eventNote}</div>` : `<p class="muted">A quiet month. 😌</p>`}
        <h3>💳 Your statement is due</h3>
        <p class="small muted">Balance ${FG.money(s.balance)} · minimum ${FG.money(minPay())} · you have ${FG.money(s.budget)} this month (whatever you don't pay goes to savings). APR ${(APR * 100).toFixed(2)}%.</p>
        <div class="choices">
          ${s.balance < 0.5 ? `<button class="choice" data-pay="full">Nothing owed — move ${FG.money(s.budget)} to savings</button>` : `
          <button class="choice" data-pay="full" ${full ? "" : "disabled"}>Pay the full balance (${FG.money(s.balance)})${full ? "" : " — not enough this month"}</button>
          ${full ? "" : `<button class="choice" data-pay="budget">Pay all I can (${FG.money(Math.min(s.balance, s.budget))})</button>`}
          <button class="choice" data-pay="min">Pay just the minimum (${FG.money(minPay())})</button>
          <button class="choice" data-pay="skip">Skip it this month</button>`}
        </div>`;
    } else if (s.phase === "result") {
      main = `<div class="feedback">${s.lastNote}</div>
        <div style="margin-top:14px"><button class="btn btn-primary" data-next>${s.month < 12 ? `Next month →` : "See my year →"}</button></div>`;
    } else main = endView();
    root.innerHTML = `<div class="life"><div>
        <div class="small muted">${s.phase === "end" ? "Year in review" : `Month ${s.month} of 12`}</div>
        <div class="month-dots">${Array.from({ length: 12 }, (_, i) => `<span class="${i < s.month ? "on" : ""}"></span>`).join("")}</div>
        <div class="card event-card">${main}</div></div>${scorePanel()}</div>`;
    s.prevScore = current();
  }

  function endView() {
    const sc = current(), change = sc - s.startScore;
    const { best, isNew } = FG.recordBest("credit", sc);
    const xp = Math.max(5, Math.min(50, Math.round((sc - 620) / 4)));
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    const inp = inputs(), L = [];
    L.push(s.lates.length ? `⏰ ${s.lates.length} late mark${s.lates.length > 1 ? "s" : ""} hit your payment history — the biggest factor (35%). Autopay the minimum so it never happens.` : "⏰ Zero late payments. That's the #1 habit for a great score.");
    L.push(inp.util > 30 ? `📉 Your utilization ended at ${Math.round(inp.util)}%. Under 30% helps; under 10% is even better.` : `📉 Utilization ended at ${Math.round(inp.util)}% — nicely low.`);
    if (inp.inq >= 3) L.push(`📝 ${inp.inq} applications this year. Each hard inquiry dings your score a bit; space them out.`);
    if (s.interest > 1) L.push(`💸 You paid ${FG.money(s.interest)} in card interest at ${(APR * 100).toFixed(2)}% APR. Paying in full avoids it entirely.`);
    if (s.paidFull >= 8) L.push(`💯 You paid in full ${s.paidFull} times. That's how you use a card for free.`);
    return `<div class="emoji">🏁</div><h3>Year complete!</h3>
      <div class="stats" style="margin-top:12px">
        <div class="stat hero"><div class="label">Final score</div><div class="value">${sc}</div></div>
        <div class="stat"><div class="label">Change</div><div class="value">${change >= 0 ? "+" : ""}${change}</div></div>
        <div class="stat"><div class="label">Tier</div><div class="value" style="font-size:1.2rem">${CREDIT_MODEL.tier(sc)}</div></div>
      </div>
      <p class="small muted">${isNew ? "🏆 New best!" : "Best: " + best} · +${xp} XP</p>
      <div class="callout"><strong>What this year taught you:</strong><ul class="small" style="margin:6px 0 0">${L.map((l) => `<li>${l}</li>`).join("")}</ul></div>
      <button class="btn btn-primary" data-restart>Play another year</button>
      <p class="small muted" style="margin-top:10px">Illustrative model weighted like FICO's published factors — not a real score. Try the <a href="credit.html#score">credit score simulator</a>.</p>`;
  }

  root.addEventListener("click", (e) => {
    const ev = e.target.closest("[data-ev]");
    if (ev) { s.eventNote = s.event.c[+ev.dataset.ev][1](); s.phase = "pay"; return render(); }
    const p = e.target.closest("[data-pay]:not([disabled])");
    if (p) return pay(p.dataset.pay);
    if (e.target.closest("[data-next]")) {
      s.eventNote = "";
      if (s.month >= 12) { s.phase = "end"; return render(); }
      return nextMonth();
    }
    if (e.target.closest("[data-restart]")) start();
  });

  return { show() { if (!s) start(); }, hide() {} };
})();
