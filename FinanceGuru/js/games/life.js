// Payday — a 12-month life simulator.
// Lessons: emergency funds, avoiding high-interest debt, free money (401k match),
// negotiating bills, lifestyle creep, and budgeting for fun so you don't burn out.
window.Games = window.Games || {};
Games.life = (() => {
  const root = document.getElementById("life-root");
  const PAY = 3200, BILLS = 2000, BUFFER = 300;
  let s; // game state

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const happy = (n) => (s.happy = clamp(s.happy + n, 0, 100));

  // Pay a cost: checking first, then emergency fund, then the credit card.
  function pay(amount) {
    const fromCash = Math.min(s.cash, amount);
    s.cash -= fromCash;
    let rest = amount - fromCash;
    const fromSavings = Math.min(s.savings, rest);
    s.savings -= fromSavings;
    rest -= fromSavings;
    s.debt += rest;
    if (rest > 0) return ` <span class="delta down">${FG.money(rest)} went on your credit card at 24% APR.</span>`;
    if (fromSavings > 0) return ` <span class="delta up">Your emergency fund covered ${FG.money(fromSavings)}.</span>`;
    return "";
  }
  function emergency(amount) {
    s.emergencies++;
    const before = s.debt;
    const note = pay(amount);
    if (s.debt === before) s.covered++;
    return note;
  }

  const EMERGENCIES = [
    { emoji: "🚗", title: "Your car breaks down", text: "The mechanic quotes $900 to fix it.", choices: [
      { label: "Fix it", sub: "−$900", act: () => (happy(-3), "Car's fixed." + emergency(900)) },
      { label: "Take the bus for a while", sub: "−$150 · less convenient", act: () => (happy(-10), "Slower commute, but cheaper." + emergency(150)) },
    ] },
    { emoji: "🏥", title: "Surprise medical bill", text: "An ER visit leaves you with a $600 bill.", choices: [
      { label: "Pay it in full", sub: "−$600", act: () => (happy(-2), "Bill paid." + emergency(600)) },
      { label: "Call and ask for a discount", sub: "takes an hour on the phone", act: () => (happy(-3), "They knocked 30% off for paying now — you saved $180! Always ask." + emergency(420)) },
    ] },
    { emoji: "⏰", title: "Hours cut at work", text: "Your paycheck is $600 short this month.", choices: [
      { label: "Tighten your belt", sub: "−$600", act: () => (happy(-5), "Lean month." + emergency(600)) },
      { label: "Pick up weekend gig shifts", sub: "covers it · exhausting", act: () => (s.emergencies++, s.covered++, happy(-10), "Extra shifts filled the gap — but you're tired.") },
    ] },
    { emoji: "🐶", title: "Your dog needs the vet", text: "An infection needs treatment: $500.", choices: [
      { label: "Pay for treatment", sub: "−$500", act: () => (happy(-1), "Your pup is on the mend. 🐾" + emergency(500)) },
    ] },
  ];

  const EVENTS = [
    { emoji: "🎤", title: "Concert weekend", text: "Friends are going to a festival. Tickets, travel, and food: $450.", choices: [
      { label: "Go all-in", sub: "−$450 · big fun", act: () => (happy(15), "Unforgettable weekend!" + pay(450)) },
      { label: "Host a game night instead", sub: "−$40 · still fun", act: () => (happy(7), "Cheap and cheerful — great call." + pay(40)) },
      { label: "Skip it", sub: "$0 · FOMO", act: () => (happy(-6), "You saved money but missed out.") },
    ] },
    { emoji: "📱", title: "Phone screen shattered", text: "Your phone still works, but the screen is cracked.", choices: [
      { label: "Buy the newest flagship", sub: "−$1,100", act: () => (happy(8), "Shiny!" + pay(1100)) },
      { label: "Repair the screen", sub: "−$150", act: () => (happy(1), "Good as new for a fraction of the price." + pay(150)) },
      { label: "Live with the cracks", sub: "$0", act: () => (happy(-5), "Free, if a bit annoying.") },
    ] },
    { emoji: "🏢", title: "401(k) match offered", text: "Put in $300 this month and your employer adds $300 — free money.", choices: [
      { label: "Contribute $300", sub: "doubles instantly", act: () => { const c = Math.min(300, s.cash); s.cash -= c; s.invest += c * 2; s.matched = true; return `You invested ${FG.money(c)} and got ${FG.money(c)} free! 💸`; } },
      { label: "Skip it", sub: "keep the cash", act: () => "You left free money on the table." },
    ] },
    { emoji: "📺", title: "Huge TV sale!", text: "A 75-inch TV is 40% off — just $800. Put it on the credit card?", choices: [
      { label: "Buy it on credit", sub: "+$800 debt at 24% APR", act: () => (happy(8), (s.debt += 800), "Movie nights are epic. The card balance is too.") },
      { label: "Pass", sub: "$0", act: () => (happy(-2), "There's always another sale.") },
    ] },
    { emoji: "🎉", title: "Work bonus!", text: "You earned a $1,000 bonus after taxes.", choices: [
      { label: "Weekend getaway", sub: "spend it all", act: () => (happy(18), "Sun, sand, and zero regrets.") },
      { label: "Emergency fund", sub: "+$1,000 savings", act: () => (happy(2), (s.savings += 1000), "Your safety net just got stronger.") },
      { label: "Invest it", sub: "+$1,000 investments", act: () => (happy(2), (s.invest += 1000), "Future you says thanks.") },
      { label: "Half fun, half saved", sub: "+$500 savings", act: () => (happy(9), (s.savings += 500), "Balance — the best of both.") },
    ] },
    { emoji: "🤝", title: "A friend needs $300", text: "A close friend asks to borrow $300 until next month.", choices: [
      { label: "Lend it", sub: "−$300 · may not come back", act: () => { happy(4); const n = pay(300); if (Math.random() < 0.5) { s.repay = s.month + 2; return "You helped a friend." + n; } return "You helped a friend — but only lend what you can afford to lose." + n; } },
      { label: "Say no kindly", sub: "$0 · awkward", act: () => (happy(-3), "Awkward, but your budget is intact.") },
    ] },
    { emoji: "🔁", title: "Subscription check-up", text: "You're paying $95/month for 6 subscriptions, and barely use half.", choices: [
      { label: "Cancel 3 of them", sub: "+$45 every month", act: () => (happy(-2), (s.subs = true), "Cancelled! That's $540 a year back in your pocket.") },
      { label: "Keep them all", sub: "$0", act: () => "Those small charges keep adding up..." },
    ] },
    { emoji: "🧾", title: "Tax refund arrives", text: "+$700 lands in your account.", choices: [
      { label: "Treat yourself", sub: "spend it", act: () => (happy(12), "Fun purchase!") },
      { label: "Emergency fund", sub: "+$700 savings", act: () => (happy(1), (s.savings += 700), "Safety net boosted.") },
      { label: "Pay down debt", sub: "or save if no debt", act: () => { const p = Math.min(s.debt, 700); s.debt -= p; s.savings += 700 - p; happy(2); return p ? `Paid off ${FG.money(p)} of debt.` : "No debt — saved it instead!"; } },
    ] },
    { emoji: "🪙", title: "Hot crypto tip", text: "A coworker swears a new coin will 10x. Put in $1,000?", choices: [
      { label: "All in!", sub: "−$1,000 · very risky", act: () => { const n = pay(1000); if (Math.random() < 0.2) { s.cash += 2500; happy(10); return "It mooned! You cashed out $2,500. Lucky this time." + n; } s.cash += 150; happy(-10); return "The coin crashed 85%. You got $150 back." + n; } },
      { label: "Stick to index funds", sub: "$0", act: () => "Boring is beautiful." },
    ] },
    { emoji: "💍", title: "Destination wedding invite", text: "Your cousin is getting married abroad. Total cost: $1,200.", choices: [
      { label: "Go!", sub: "−$1,200", act: () => (happy(14), "A beautiful trip." + pay(1200)) },
      { label: "Send a gift & video call", sub: "−$100", act: () => (happy(2), "They appreciated it." + pay(100)) },
    ] },
    { emoji: "📈", title: "You got a raise!", text: "+$200/month from now on. What will you do with it?", choices: [
      { label: "Auto-invest the raise", sub: "+$200/mo invested", act: () => (happy(2), (s.raise = "save"), "Lifestyle stays the same, wealth grows. Smart.") },
      { label: "Upgrade my lifestyle", sub: "nicer everything", act: () => (happy(8), (s.raise = "spend"), "That's lifestyle creep — spending rises to match income.") },
    ] },
  ];

  function newGame() {
    const picks = shuffle([...EMERGENCIES]).slice(0, 3);
    const others = shuffle(EVENTS.filter((e) => !["🏢", "📈"].includes(e.emoji))).slice(0, 7);
    const deck = shuffle([...picks, ...others, EVENTS.find((e) => e.emoji === "🏢"), EVENTS.find((e) => e.emoji === "📈")]);
    s = { month: 0, cash: 500, savings: 0, invest: 0, debt: 0, happy: 65, deck, log: [],
          emergencies: 0, covered: 0, interestPaid: 0, burnouts: 0, matched: false, subs: false, raise: null, repay: 0 };
    beginMonth();
  }

  function beginMonth() {
    s.month++;
    s.cash += PAY - BILLS + (s.subs ? 45 : 0);
    if (s.raise === "save") s.invest += 200;
    if (s.repay === s.month) { s.cash += 300; log("🤝 Your friend paid you back $300!"); }
    if (s.debt > 0) {
      const min = Math.min(s.debt, Math.max(25, s.debt * 0.03));
      s.debt -= min; s.cash -= min;
    }
    let pre = "";
    if (s.happy < 20) {
      s.burnouts++;
      happy(25);
      pre = `<div class="feedback" style="margin-bottom:12px">🔥 <strong>Burnout!</strong> You've been too strict, so you splurged $500 to feel better.${pay(500)}</div>`;
      log("🔥 Burnout splurge: −$500");
    }
    s.event = s.deck.pop();
    render(eventView(pre));
  }

  function eventView(pre = "") {
    const e = s.event;
    return `${pre}<div class="emoji">${e.emoji}</div><h3>${e.title}</h3><p>${e.text}</p>
      <div class="choices">${e.choices.map((c, i) => `<button class="choice" data-ev="${i}"><strong>${c.label}</strong><small>${c.sub}</small></button>`).join("")}</div>`;
  }

  function allocateView(result) {
    const amt = Math.max(0, Math.round(s.cash - BUFFER));
    s.alloc = amt;
    const opts = amt <= 0 ? [["done", "😮‍💨", "Continue", "Nothing left over this month"]] : [
      ["save", "🛡️", "Emergency fund", "Safe cash for surprises"],
      ["invest", "📈", "Invest", "Grows long-term, bumpy short-term"],
      ...(s.debt > 0 ? [["debt", "💳", "Pay off credit card", `Kill that 24% APR (${FG.money(s.debt)} owed)`]] : []),
      ["balanced", "⚖️", "Balanced split", "50% safety · 25% invest · 25% fun"],
      ["fun", "🎉", "Treat yourself", "Spend it all on fun"],
    ];
    return `<div class="feedback" style="margin-bottom:16px">${result}</div>
      <h3>Payday leftovers: ${FG.money(amt)}</h3>
      <p class="muted small">You keep ${FG.money(BUFFER)} in checking as a buffer. Where should the rest go?</p>
      <div class="choices">${opts.map(([k, e, l, sub]) => `<button class="choice" data-al="${k}"><strong>${e} ${l}</strong><small>${sub}</small></button>`).join("")}</div>`;
  }

  function allocate(kind) {
    const a = s.alloc;
    s.cash -= kind === "done" ? 0 : a;
    if (kind === "save") { s.savings += a; happy(-2); }
    if (kind === "invest") { s.invest += a; happy(-2); }
    if (kind === "debt") { const p = Math.min(s.debt, a); s.debt -= p; s.savings += a - p; happy(-1); }
    if (kind === "balanced") {
      const safe = a * 0.5, p = Math.min(s.debt, safe);
      s.debt -= p; s.savings += safe - p; s.invest += a * 0.25; happy(5);
    }
    if (kind === "fun") happy(11);
    log(`Month ${s.month}: ${s.event.emoji} ${s.event.title} → ${{ save: "🛡️ saved", invest: "📈 invested", debt: "💳 paid debt", balanced: "⚖️ balanced", fun: "🎉 had fun", done: "nothing left" }[kind]}`);

    // Month-end: interest, market moves, life drains a little happiness.
    s.savings *= 1 + 0.04 / 12;
    const ret = 0.006 + (Math.random() + Math.random() + Math.random() - 1.5) * 0.06;
    s.invest *= 1 + ret;
    const interest = s.debt * 0.02;
    s.debt += interest;
    s.interestPaid += interest;
    happy(-4);

    if (s.month >= 12) render(endView(), true);
    else beginMonth();
  }

  function endView() {
    const nw = s.cash + s.savings + s.invest - s.debt;
    const grade = nw >= 9000 && s.happy >= 50 ? "A" : nw >= 6000 && s.happy >= 35 ? "B" : nw >= 2500 ? "C" : "D";
    const xp = { A: 60, B: 45, C: 30, D: 20 }[grade];
    const { best, isNew } = FG.recordBest("life", Math.round(nw));
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    const lessons = [];
    if (s.emergencies) lessons.push(s.covered === s.emergencies
      ? `🛡️ Your emergency fund handled all ${s.emergencies} emergencies. That's exactly what it's for.`
      : `🛡️ ${s.emergencies - s.covered} of ${s.emergencies} emergencies ended up on your credit card. A bigger emergency fund prevents that.`);
    if (s.interestPaid > 1) lessons.push(`💳 You paid ${FG.money(s.interestPaid)} in credit card interest — money that bought you nothing.`);
    if (s.burnouts) lessons.push(`🔥 You burned out ${s.burnouts}× and splurged. Budget some fun on purpose — it's cheaper than burnout.`);
    else if (s.happy >= 50) lessons.push("😊 You kept your happiness up. A good budget includes fun.");
    lessons.push(s.matched ? "🏢 You grabbed the 401(k) match — a 100% instant return." : "🏢 Always take an employer match if you can. It's free money.");
    if (s.raise === "spend") lessons.push("📈 You upgraded your lifestyle with your raise. Investing raises is how wealth quietly builds.");
    if (s.subs) lessons.push("🔁 Cancelling unused subscriptions saved you money every month.");
    return `<div class="emoji">🏁</div><h3>Year complete!</h3>
      <div class="stats" style="margin-top:12px">
        <div class="stat hero"><div class="label">Net worth</div><div class="value">${FG.money(nw)}</div></div>
        <div class="stat"><div class="label">Happiness</div><div class="value">${Math.round(s.happy)}/100</div></div>
        <div class="stat"><div class="label">Grade</div><div class="value">${grade}</div></div>
      </div>
      <p class="small muted">${isNew ? "🏆 New best net worth!" : "Best: " + FG.money(best)} · +${xp} XP</p>
      <div class="callout"><strong>What this year taught you:</strong><ul class="small" style="margin:6px 0 0">${lessons.map((l) => `<li>${l}</li>`).join("")}</ul></div>
      <button class="btn btn-primary" data-restart>Play another year</button>`;
  }

  function log(t) { s.log.unshift(t); }

  function statsView() {
    const nw = s.cash + s.savings + s.invest - s.debt;
    const hc = s.happy >= 50 ? "var(--good)" : s.happy >= 25 ? "var(--gold)" : "var(--bad)";
    return `<div class="card life-stats">
      <div class="stat hero"><div class="label">Net worth</div><div class="value">${FG.money(nw)}</div></div>
      <div class="stat"><div class="label">🏦 Checking</div><div class="value">${FG.money(s.cash)}</div></div>
      <div class="stat"><div class="label">🛡️ Emergency fund</div><div class="value">${FG.money(s.savings)}</div></div>
      <div class="stat"><div class="label">📈 Investments</div><div class="value">${FG.money(s.invest)}</div></div>
      <div class="stat ${s.debt > 0.5 ? "debt" : ""}"><div class="label">💳 Credit card debt</div><div class="value">${FG.money(s.debt)}</div></div>
      <div><div class="small" style="display:flex;justify-content:space-between"><strong>😊 Happiness</strong><span>${Math.round(s.happy)}/100</span></div>
        <div class="meter"><span style="width:${s.happy}%;background:${hc}"></span></div></div>
      ${s.log.length ? `<ol class="life-log" reversed>${s.log.map((l) => `<li>${l}</li>`).join("")}</ol>` : ""}
    </div>`;
  }

  function render(main, done = false) {
    const m = Math.min(12, s.month);
    root.innerHTML = `<div>
        <div class="small muted">${done ? "Year in review" : `Month ${m} of 12`}</div>
        <div class="month-dots">${Array.from({ length: 12 }, (_, i) => `<span class="${i < m ? "on" : ""}"></span>`).join("")}</div>
        <div class="card event-card">${main}</div>
      </div>${statsView()}`;
  }

  root.addEventListener("click", (e) => {
    const ev = e.target.closest("[data-ev]");
    if (ev) return render(allocateView(s.event.choices[+ev.dataset.ev].act()));
    const al = e.target.closest("[data-al]");
    if (al) return allocate(al.dataset.al);
    if (e.target.closest("[data-restart]")) newGame();
  });

  return {
    show() { if (!s) newGame(); },
    hide() {},
  };
})();
