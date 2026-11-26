// Payday — a 12-month life simulator.
// Lessons: emergency funds, avoiding high-interest debt, free money (401k match),
// negotiating bills, lifestyle creep, delayed consequences (skipped care, buy-now-pay-later),
// investing in your earning power, and budgeting for fun so you don't burn out.
window.Games = window.Games || {};
Games.life = (() => {
  const root = document.getElementById("life-root");
  const t = (s, v) => (typeof I18N === "object" ? I18N.t(s, v) : s);
  const BUFFER = 300, CARD_APR = 0.24, SAVINGS_APY = 0.04;
  const PROFILES = [
    { id: "first", emoji: "🧑‍💼", name: "First full-time job", pay: 3200, bills: 2000, cash: 500, debt: 0,
      blurb: "$3,200 take-home, $2,000 of rent, food & bills. No debt yet.", targets: [9000, 6000, 2500] },
    { id: "grad", emoji: "🎓", name: "Grad with a balance", pay: 3600, bills: 2350, cash: 300, debt: 2500,
      blurb: "$3,600 take-home, $2,350 of bills (student loan included), and $2,500 already on a card at 24% APR.", targets: [10000, 6500, 3000] },
    { id: "tight", emoji: "🧮", name: "Tight budget", pay: 2500, bills: 1950, cash: 200, debt: 0,
      blurb: "$2,500 take-home from part-time hours, $1,950 of bills. Every dollar counts. Hard mode.", targets: [5500, 3000, 1200] },
  ];
  const BUCKETS = [
    ["save", "🛡️", "Emergency fund", "4% APY, safe"],
    ["invest", "📈", "Invest", "Grows long-term, bumpy short-term"],
    ["debt", "💳", "Extra card payment", "Every dollar saves 24% APR"],
    ["fun", "🎉", "Fun money", "Keeps burnout away"],
  ];
  const PRESETS = {
    balanced: { label: "⚖️ Balanced", split: { save: 0.4, invest: 0.2, debt: 0.2, fun: 0.2 } },
    safety: { label: "🛡️ Safety first", split: { save: 0.8, invest: 0, debt: 0, fun: 0.2 } },
    avalanche: { label: "💳 Crush debt", split: { save: 0.1, invest: 0, debt: 0.75, fun: 0.15 } },
    yolo: { label: "🎉 Treat yourself", split: { save: 0, invest: 0, debt: 0, fun: 1 } },
  };
  let s; // game state

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const happy = (n) => (s.happy = clamp(s.happy + n, 0, 100));
  const netWorth = () => s.cash + s.savings + s.invest - s.debt;
  // Schedule a consequence. If that month already has one, it lands the next free month; past month 12 it's "dodged".
  const later = (months, event) => {
    let m = s.month + months;
    while (m <= 12 && s.later[m]) m++;
    if (m <= 12) s.later[m] = event; else s.dodged.push(event.title);
  };

  // Pay a cost: checking first, then emergency fund, then the credit card.
  function pay(amount) {
    const fromCash = clamp(s.cash, 0, amount);
    s.cash -= fromCash;
    let rest = amount - fromCash;
    const fromSavings = Math.min(s.savings, rest);
    s.savings -= fromSavings;
    rest -= fromSavings;
    s.debt += rest;
    if (rest > 0) return ` <span class="delta down">${t("{amount} went on your credit card at 24% APR.", { amount: FG.money(rest) })}</span>`;
    if (fromSavings > 0) return ` <span class="delta up">${t("Your emergency fund covered {amount}.", { amount: FG.money(fromSavings) })}</span>`;
    return "";
  }
  function emergency(amount) {
    s.emergencies++;
    const before = s.debt;
    const note = pay(amount);
    if (s.debt === before) s.covered++;
    return note;
  }

  /* ---------- Follow-up events (scheduled by earlier choices) ---------- */
  const TOOTHACHE = { emoji: "😖", title: "Toothache!", followUp: true, text: "That skipped checkup became a cavity that needs a root canal: $1,100.", choices: [
    { label: "Get it fixed", sub: "−$1,100", act: () => (happy(-8), (s.skippedCare = true), t("Ouch. A $40 cleaning would have caught it early.") + emergency(1100)) },
  ] };
  const CAR_DIES = { emoji: "🛻", title: "The bus life gets old", followUp: true, text: "Your car has sat broken for months. A coworker offers you their old one for $2,000.", choices: [
    { label: "Buy it", sub: "−$2,000", act: () => (happy(6), t("Wheels again!") + pay(2000)) },
    { label: "Keep riding the bus", sub: "$0 · −$60/mo in fares", act: () => (happy(-6), (s.bills += 60), t("Bus fares are now part of your bills.")) },
  ] };

  const EMERGENCIES = [
    { emoji: "🚗", title: "Your car breaks down", text: "The mechanic quotes $900 to fix it.", choices: [
      { label: "Fix it", sub: "−$900", act: () => (happy(-3), t("Car's fixed.") + emergency(900)) },
      { label: "Take the bus for a while", sub: "−$150 now · less convenient", act: () => (happy(-10), later(4, CAR_DIES), t("Slower commute, but cheaper — for now.") + emergency(150)) },
    ] },
    { emoji: "🏥", title: "Surprise medical bill", text: "An ER visit leaves you with a $600 bill.", choices: [
      { label: "Pay it in full", sub: "−$600", act: () => (happy(-2), t("Bill paid.") + emergency(600)) },
      { label: "Call and ask for a discount", sub: "takes an hour on the phone", act: () => (happy(-3), (s.negotiated++), t("They knocked 30% off for paying now — you saved $180! Always ask.") + emergency(420)) },
      { label: "Ask for a payment plan", sub: "$100/mo for 6 months, 0% interest", act: () => (happy(-1), s.plans.push({ name: "Hospital plan", amt: 100, left: 6, fee: 25 }), t("Many hospitals offer 0% plans if you ask. Don't miss a payment.")) },
    ] },
    { emoji: "⏰", title: "Hours cut at work", text: "Your paycheck is $600 short this month.", choices: [
      { label: "Tighten your belt", sub: "−$600", act: () => (happy(-5), t("Lean month.") + emergency(600)) },
      { label: "Pick up weekend gig shifts", sub: "covers it · exhausting", act: () => (s.emergencies++, s.covered++, happy(-12), t("Extra shifts filled the gap — but you're wiped out.")) },
    ] },
    { emoji: "🐶", title: "Your dog needs the vet", text: "An infection needs treatment: $500.", choices: [
      { label: "Pay for treatment", sub: "−$500", act: () => (happy(-1), t("Your pup is on the mend. 🐾") + emergency(500)) },
    ] },
    { emoji: "💧", title: "Burst pipe", text: "Water damaged your stuff. Renter's insurance? You never got it. Replacing things: $700.", choices: [
      { label: "Replace the essentials", sub: "−$700", act: () => (happy(-4), (s.noInsurance = true), t("A $15/month renter's policy would have covered this.") + emergency(700)) },
      { label: "Buy used, go slow", sub: "−$300 · makeshift for a while", act: () => (happy(-8), (s.noInsurance = true), t("Thrift stores to the rescue.") + emergency(300)) },
    ] },
  ];

  const EVENTS = [
    { emoji: "🎤", title: "Concert weekend", text: "Friends are going to a festival. Tickets, travel, and food: $450.", choices: [
      { label: "Go all-in", sub: "−$450 · big fun", act: () => (happy(15), t("Unforgettable weekend!") + pay(450)) },
      { label: "Host a game night instead", sub: "−$40 · still fun", act: () => (happy(7), t("Cheap and cheerful — great call.") + pay(40)) },
      { label: "Skip it", sub: "$0 · FOMO", act: () => (happy(-6), t("You saved money but missed out.")) },
    ] },
    { emoji: "📱", title: "Phone screen shattered", text: "Your phone still works, but the screen is cracked.", choices: [
      { label: "Buy the newest flagship", sub: "−$1,100", act: () => (happy(8), t("Shiny!") + pay(1100)) },
      { label: "Repair the screen", sub: "−$150", act: () => (happy(1), t("Good as new for a fraction of the price.") + pay(150)) },
      { label: "Live with the cracks", sub: "$0", act: () => (happy(-5), t("Free, if a bit annoying.")) },
    ] },
    { emoji: "🏢", title: "401(k) match offered", key: "match", text: "Put in $300 this month and your employer adds $300 — free money.", choices: [
      { label: "Contribute $300", sub: "doubles instantly", act: () => { const c = clamp(Math.min(300, s.cash), 0, 300); s.cash -= c; s.invest += c * 2; s.matched = c > 0; return c ? t("You invested {amount} and got {amount} free! 💸", { amount: FG.money(c) }) : t("Your checking account was empty, so you couldn't contribute."); } },
      { label: "Skip it", sub: "keep the cash", act: () => t("You left free money on the table.") },
    ] },
    { emoji: "📺", title: "Huge TV sale!", text: "A 75-inch TV is 40% off — just $800. Put it on the credit card?", choices: [
      { label: "Buy it on credit", sub: "+$800 debt at 24% APR", act: () => (happy(8), (s.debt += 800), t("Movie nights are epic. The card balance is too.")) },
      { label: "Pass", sub: "$0", act: () => (happy(-2), t("There's always another sale.")) },
    ] },
    { emoji: "🎉", title: "Work bonus!", text: "You earned a $1,000 bonus after taxes.", choices: [
      { label: "Weekend getaway", sub: "spend it all", act: () => (happy(18), t("Sun, sand, and zero regrets.")) },
      { label: "Emergency fund", sub: "+$1,000 savings", act: () => (happy(2), (s.savings += 1000), t("Your safety net just got stronger.")) },
      { label: "Invest it", sub: "+$1,000 investments", act: () => (happy(2), (s.invest += 1000), t("Future you says thanks.")) },
      { label: "Half fun, half saved", sub: "+$500 savings", act: () => (happy(9), (s.savings += 500), t("Balance — the best of both.")) },
    ] },
    { emoji: "🤝", title: "A friend needs $300", text: "A close friend asks to borrow $300 until next month.", choices: [
      { label: "Lend it", sub: "−$300 · may not come back", act: () => { happy(4); const n = pay(300); if (Math.random() < 0.5) { s.repay = s.month + 2; return t("You helped a friend.") + n; } return t("You helped a friend — but only lend what you can afford to lose.") + n; } },
      { label: "Say no kindly", sub: "$0 · awkward", act: () => (happy(-3), t("Awkward, but your budget is intact.")) },
    ] },
    { emoji: "🔁", title: "Subscription check-up", text: "You're paying $95/month for 6 subscriptions, and barely use half.", choices: [
      { label: "Cancel 3 of them", sub: "−$45/mo bills", act: () => (happy(-2), (s.bills -= 45), (s.subs = true), t("Cancelled! That's $540 a year back in your pocket.")) },
      { label: "Keep them all", sub: "$0", act: () => t("Those small charges keep adding up...") },
    ] },
    { emoji: "🧾", title: "Tax refund arrives", text: "+$700 lands in your account.", choices: [
      { label: "Treat yourself", sub: "spend it", act: () => (happy(12), t("Fun purchase!")) },
      { label: "Emergency fund", sub: "+$700 savings", act: () => (happy(1), (s.savings += 700), t("Safety net boosted.")) },
      { label: "Pay down debt", sub: "or save if no debt", act: () => { const p = Math.min(s.debt, 700); s.debt -= p; s.savings += 700 - p; happy(2); return p ? t("Paid off {amount} of debt.", { amount: FG.money(p) }) : t("No debt — saved it instead!"); } },
    ] },
    { emoji: "🪙", title: "Hot crypto tip", text: "A coworker swears a new coin will 10x. Put in $1,000?", choices: [
      { label: "All in!", sub: "−$1,000 · very risky", act: () => { const n = pay(1000); if (Math.random() < 0.2) { s.cash += 2500; happy(10); return t("It mooned! You cashed out $2,500. Lucky this time.") + n; } s.cash += 150; happy(-10); s.crypto = true; return t("The coin crashed 85%. You got $150 back.") + n; } },
      { label: "Stick to index funds", sub: "$0", act: () => t("Boring is beautiful.") },
    ] },
    { emoji: "💍", title: "Destination wedding invite", text: "Your cousin is getting married abroad. Total cost: $1,200.", choices: [
      { label: "Go!", sub: "−$1,200", act: () => (happy(14), t("A beautiful trip.") + pay(1200)) },
      { label: "Send a gift & video call", sub: "−$100", act: () => (happy(2), t("They appreciated it.") + pay(100)) },
    ] },
    { emoji: "📈", title: "You got a raise!", key: "raise", text: "+$200/month from now on. What will you do with it?", choices: [
      { label: "Auto-invest the raise", sub: "+$200/mo invested", act: () => (happy(2), (s.raise = "save"), t("Lifestyle stays the same, wealth grows. Smart.")) },
      { label: "Upgrade my lifestyle", sub: "+$200/mo bills · nicer everything", act: () => (happy(8), (s.raise = "spend"), (s.pay += 200), (s.bills += 200), t("That's lifestyle creep — spending rises to match income.")) },
    ] },
    { emoji: "🦷", title: "Dental checkup reminder", text: "Your dentist says you're overdue. A cleaning is $40 with your plan.", choices: [
      { label: "Book it", sub: "−$40", act: () => (happy(-1), t("Clean teeth, no surprises.") + pay(40)) },
      { label: "Skip it this year", sub: "$0 · for now", act: () => (later(4, TOOTHACHE), t("Saved $40... for now.")) },
    ] },
    { emoji: "🧑‍🏫", title: "Weekend certification course", text: "A $450 course could qualify you for a better-paying role at work.", choices: [
      { label: "Take the course", sub: "−$450 · pays off later?", act: () => { happy(-4); s.upskill = s.month + 3; return t("Six long Saturdays. Your manager noticed.") + pay(450); } },
      { label: "Not now", sub: "$0", act: () => t("Maybe next year.") },
    ] },
    { emoji: "🛍️", title: "Pay in 4!", text: "Noise-cancelling headphones: $240, or 4 payments of $60 with buy now, pay later.", choices: [
      { label: "Pay in 4", sub: "$60/mo for 4 months", act: () => (happy(6), s.plans.push({ name: "Pay-in-4", amt: 60, left: 4, fee: 10, bnpl: true }), t("Feels cheap now. The payments come out automatically — even in a tight month.")) },
      { label: "Buy outright", sub: "−$240", act: () => (happy(6), t("Yours, no strings.") + pay(240)) },
      { label: "Skip it", sub: "$0", act: () => (happy(-2), t("Your old earbuds still work.")) },
    ] },
    { emoji: "🏠", title: "Lease renewal", text: "Your landlord wants +$120/month to renew.", choices: [
      { label: "Sign it", sub: "+$120/mo bills", act: () => (s.bills += 120, t("Moving is expensive too.")) },
      { label: "Negotiate", sub: "could go either way", act: () => { s.negotiated++; if (Math.random() < 0.55) { s.bills += 40; return t("You showed them listings for similar units and offered a 12-month lease. They settled at +$40."); } s.bills += 120; happy(-2); return t("They wouldn't budge — but asking cost you nothing."); } },
      { label: "Get a roommate", sub: "−$400/mo bills · less privacy", act: () => (s.bills -= 400, happy(-8), (s.roommate = true), t("Cheaper rent, shared fridge.")) },
    ] },
    { emoji: "📞", title: "Phone & internet bill review", text: "You've been paying $140/month since your promo ended.", choices: [
      { label: "Call and threaten to cancel", sub: "20 minutes on hold", act: () => (happy(-2), (s.bills -= 40), s.negotiated++, t("The retention desk found a $40/month discount. That's $480 a year.")) },
      { label: "Leave it", sub: "$0", act: () => t("Companies count on you not calling.") },
    ] },
  ];

  /* ---------- Game flow ---------- */
  function pickView() {
    s = null;
    root.innerHTML = `<div class="card event-card" style="grid-column:1/-1">
      <div class="emoji">🗓️</div><h3>${t("Choose your life")}</h3>
      <p class="muted">${t("Survive 12 months of paydays, bills, emergencies, and temptations. Some choices come back to bite you months later.")}</p>
      <div class="choices">${PROFILES.map((p, i) => `<button class="choice" data-profile="${i}"><strong>${p.emoji} ${t(p.name)}</strong><small>${t(p.blurb)}</small></button>`).join("")}</div>
    </div>`;
  }

  function newGame(profile) {
    const picks = shuffle([...EMERGENCIES]).slice(0, 3);
    const others = shuffle(EVENTS.filter((e) => !e.key)).slice(0, 8);
    const deck = shuffle([...picks, ...others, EVENTS.find((e) => e.key === "match"), EVENTS.find((e) => e.key === "raise")]);
    s = { profile, month: 0, pay: profile.pay, bills: profile.bills, cash: profile.cash, savings: 0, invest: 0, debt: profile.debt,
          happy: 65, deck, later: {}, plans: [], dodged: [], log: [], hist: [], split: { ...PRESETS.balanced.split },
          emergencies: 0, covered: 0, interestPaid: 0, burnouts: 0, lateFees: 0, negotiated: 0, funSpent: 0,
          matched: false, subs: false, raise: null, repay: 0, upskill: 0 };
    s.hist.push(netWorth());
    beginMonth();
  }

  function beginMonth() {
    s.month++;
    const notes = [];
    s.cash += s.pay - s.bills;
    if (s.raise === "save") s.invest += 200;
    if (s.repay === s.month) { s.cash += 300; notes.push(t("🤝 Your friend paid you back $300!")); }
    if (s.upskill === s.month) { s.pay += 250; notes.push(t("🧑‍🏫 Your certification paid off: a new role and +$250/month take-home!")); }
    // Payment plans and buy-now-pay-later come out automatically; an empty account means a late fee.
    s.plans = s.plans.filter((p) => {
      if (s.cash < p.amt) { s.lateFees += p.fee; s.debt += p.fee; notes.push(t("⚠️ {plan} payment hit an empty account: {fee} late fee.", { plan: t(p.name), fee: FG.money(p.fee) })); }
      pay(p.amt);
      return --p.left > 0;
    });
    if (s.debt > 0) {
      const min = Math.min(s.debt, Math.max(25, s.debt * 0.03));
      s.debt -= min; s.cash -= min;
    }
    let pre = "";
    if (s.happy < 20) {
      s.burnouts++;
      happy(25);
      notes.push(t("🔥 <strong>Burnout!</strong> You've been too strict, so you splurged $500 to feel better.") + pay(500));
      log(t("🔥 Burnout splurge: −$500"));
    }
    if (s.cash < 0) { const short = -s.cash; s.cash = 0; notes.push(t("🏦 Checking ran dry.") + pay(short)); }
    if (notes.length) pre = `<div class="feedback" style="margin-bottom:12px;display:block">${notes.map((n) => `<div>${n}</div>`).join("")}</div>`;
    s.event = s.later[s.month] || s.deck.pop();
    render(eventView(pre));
  }

  function eventView(pre = "") {
    const e = s.event;
    return `${pre}<div class="emoji">${e.emoji}</div><h3>${t(e.title)}${e.followUp ? ` <span class="badge">${t("Consequence")}</span>` : ""}</h3><p>${t(e.text)}</p>
      <div class="choices">${e.choices.map((c, i) => `<button class="choice" data-ev="${i}"><strong>${t(c.label)}</strong><small>${t(c.sub)}</small></button>`).join("")}</div>`;
  }

  // Split this month's leftover between four buckets. Last month's split is the starting point.
  function allocateView(result) {
    const amt = Math.max(0, Math.round((s.cash - BUFFER) / 25) * 25);
    s.alloc = amt;
    if (amt <= 0) {
      return `<div class="feedback" style="margin-bottom:16px">${result}</div>
        <h3>${t("Nothing left over this month")}</h3><p class="muted small">${t("You're at or below your {amount} checking buffer.", { amount: FG.money(BUFFER) })}</p>
        <button class="btn btn-primary" data-confirm>${t("Next month →")}</button>`;
    }
    const split = { ...s.split };
    if (s.debt <= 0.5) { split.save += split.debt; split.debt = 0; }
    s.draft = Object.fromEntries(BUCKETS.map(([k]) => [k, Math.round((split[k] * amt) / 25) * 25]));
    fitDraft();
    return `<div class="feedback" style="margin-bottom:16px">${result}</div>
      <h3>${t("Payday leftovers: {amount}", { amount: FG.money(amt) })}</h3>
      <p class="muted small">${t("You keep {amount} in checking as a buffer. Split the rest:", { amount: FG.money(BUFFER) })}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 12px">${Object.entries(PRESETS).map(([k, p]) => `<button class="chip" data-preset="${k}">${t(p.label)}</button>`).join("")}</div>
      <div style="display:grid;gap:12px">${BUCKETS.map(([k, e, l, sub]) => {
        const off = k === "debt" && s.debt <= 0.5;
        return `<div${off ? ' style="opacity:.5"' : ""}><div class="small" style="display:flex;justify-content:space-between;gap:8px"><label for="life-${k}"><strong>${e} ${t(l)}</strong> <span class="muted">${off ? t("no card debt") : t(sub)}</span></label><strong data-amt="${k}"></strong></div>
          <input type="range" id="life-${k}" data-bucket="${k}" min="0" max="${amt}" step="25" value="${s.draft[k]}"${off ? " disabled" : ""}></div>`;
      }).join("")}</div>
      <p class="small" id="life-left" style="margin:12px 0" aria-live="polite"></p>
      <button class="btn btn-primary" data-confirm>${t("Lock it in →")}</button>`;
  }

  // Keep the draft within the leftover amount; anything unassigned stays in checking.
  function fitDraft(changed) {
    const keys = BUCKETS.map(([k]) => k);
    let over = keys.reduce((t, k) => t + s.draft[k], 0) - s.alloc;
    for (const k of [...keys.filter((k) => k !== changed).reverse(), changed].filter(Boolean)) {
      if (over <= 0) break;
      const cut = Math.min(over, s.draft[k]);
      s.draft[k] -= cut; over -= cut;
    }
  }
  function paintDraft() {
    BUCKETS.forEach(([k]) => {
      const r = root.querySelector(`[data-bucket="${k}"]`), a = root.querySelector(`[data-amt="${k}"]`);
      if (r) r.value = s.draft[k];
      if (a) a.textContent = FG.money(s.draft[k]);
    });
    const left = s.alloc - BUCKETS.reduce((t, [k]) => t + s.draft[k], 0);
    const el = document.getElementById("life-left");
    if (el) el.innerHTML = left > 0 ? t("🏦 {amount} unassigned stays in checking.", { amount: FG.money(left) }) : t("✅ Every dollar has a job.");
  }

  function allocate() {
    const a = s.alloc;
    if (a > 0) {
      const d = s.draft;
      const spent = d.save + d.invest + d.debt + d.fun;
      s.cash -= spent;
      s.savings += d.save;
      s.invest += d.invest;
      const p = Math.min(s.debt, d.debt);
      s.debt -= p; s.savings += d.debt - p;
      s.funSpent += d.fun;
      // Fun has diminishing returns; a month with zero fun wears you down.
      happy(d.fun > 0 ? Math.round(16 * (1 - Math.exp(-d.fun / 300))) : -3);
      s.split = Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v / a]));
      const parts = BUCKETS.filter(([k]) => d[k] > 0).map(([k, e]) => `${e} ${FG.compact(d[k])}`);
      log(`${t("M{n}", { n: s.month })}: ${s.event.emoji} ${t(s.event.title)} → ${parts.join(" ") || t("kept in checking")}`);
    } else log(`${t("M{n}", { n: s.month })}: ${s.event.emoji} ${t(s.event.title)} → ${t("nothing left over")}`);

    // Month-end: interest, market moves, life drains a little happiness.
    s.savings *= 1 + SAVINGS_APY / 12;
    const ret = 0.006 + (Math.random() + Math.random() + Math.random() - 1.5) * 0.06;
    s.invest *= 1 + ret;
    const interest = s.debt * (CARD_APR / 12);
    s.debt += interest;
    s.interestPaid += interest;
    happy(-4);
    s.hist.push(netWorth());

    if (s.month >= 12) render(endView(), true);
    else beginMonth();
  }

  function sparkline(vals, w = 260, h = 56) {
    if (vals.length < 2) return "";
    const lo = Math.min(0, ...vals), hi = Math.max(1, ...vals);
    const x = (i) => (i / 12) * (w - 8) + 4, y = (v) => h - 4 - ((v - lo) / (hi - lo)) * (h - 8);
    const d = vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
    const zero = lo < 0 ? `<line x1="4" x2="${w - 4}" y1="${y(0)}" y2="${y(0)}" style="stroke:var(--border-strong)" stroke-dasharray="3 3"/>` : "";
    const last = vals[vals.length - 1];
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" role="img" aria-label="${t("Net worth by month, now {amount}", { amount: FG.money(last) })}">${zero}
      <path d="${d}" fill="none" style="stroke:var(--brand)" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="${x(vals.length - 1)}" cy="${y(last)}" r="3.5" style="fill:var(--brand)"/></svg>`;
  }

  function endView() {
    const nw = netWorth(), start = s.hist[0];
    const [a, b, c] = s.profile.targets;
    const grade = nw >= a && s.happy >= 50 ? "A" : nw >= b && s.happy >= 35 ? "B" : nw >= c ? "C" : "D";
    const xp = { A: 60, B: 45, C: 30, D: 20 }[grade];
    const { best, isNew } = FG.recordBest("life", Math.round(nw));
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    const months = s.savings / s.bills;
    const lessons = [];
    if (s.emergencies) lessons.push(s.covered === s.emergencies
      ? t("🛡️ Your emergency fund handled all {n} emergencies. That's exactly what it's for.", { n: s.emergencies })
      : t("🛡️ {missed} of {n} emergencies ended up on your credit card. A bigger emergency fund prevents that.", { missed: s.emergencies - s.covered, n: s.emergencies }));
    lessons.push(months >= 3 ? t("🧱 You ended with {months} months of bills saved. Most experts suggest 3–6.", { months: months.toFixed(1) })
      : t("🧱 Your emergency fund covers {months} months of bills. Aim for 3–6 months over time.", { months: months.toFixed(1) }));
    if (s.interestPaid > 1) lessons.push(t("💳 You paid {amount} in credit card interest — money that bought you nothing.", { amount: FG.money(s.interestPaid) }));
    if (s.lateFees) lessons.push(t("⚠️ Automatic payments hit an empty account and cost {amount} in late fees. Pay-later plans are still debt.", { amount: FG.money(s.lateFees) }));
    if (s.skippedCare) lessons.push(t("🦷 Skipping a $40 checkup turned into a $1,100 bill. Prevention is the cheapest care there is."));
    if (s.dodged.length) lessons.push(t("🍀 The year ended before \"{event}\" caught up with you. In real life, it wouldn't.", { event: t(s.dodged[0]) }));
    if (s.noInsurance) lessons.push(t("☔ Renter's insurance often costs about $15/month and covers exactly that kind of loss."));
    if (s.upskill) lessons.push(s.upskill <= 12 ? t("🧑‍🏫 Your course led to a raise. Investing in your skills can beat any stock.") : t("🧑‍🏫 Your course would have paid off soon. Skills are long-term investments."));
    if (s.negotiated) lessons.push(t("📞 You negotiated {n}× — bills are often more flexible than they look.", { n: s.negotiated }));
    if (s.burnouts) lessons.push(t("🔥 You burned out {n}× and splurged. Budget some fun on purpose — it's cheaper than burnout.", { n: s.burnouts }));
    else if (s.happy >= 50) lessons.push(t("😊 You spent {amount} on planned fun and kept your happiness up. A good budget includes fun.", { amount: FG.money(s.funSpent) }));
    lessons.push(s.matched ? t("🏢 You grabbed the 401(k) match — a 100% instant return.") : t("🏢 Always take an employer match if you can. It's free money."));
    if (s.raise === "spend") lessons.push(t("📈 You upgraded your lifestyle with your raise. Investing raises is how wealth quietly builds."));
    if (s.crypto) lessons.push(t("🪙 Hot tips usually go the way your coin did. Diversified index funds don't need luck."));
    const delta = nw - start;
    return `<div class="emoji">🏁</div><h3>${t("Year complete!")}</h3>
      <div class="stats" style="margin-top:12px">
        <div class="stat hero"><div class="label">${t("Net worth")}</div><div class="value">${FG.money(nw)}</div><div class="small"><span class="delta ${delta >= 0 ? "up" : "down"}">${delta >= 0 ? "+" : "−"}${FG.money(Math.abs(delta))}</span> ${t("this year")}</div></div>
        <div class="stat"><div class="label">${t("Happiness")}</div><div class="value">${Math.round(s.happy)}/100</div></div>
        <div class="stat"><div class="label">${t("Grade")}</div><div class="value">${grade}</div></div>
      </div>
      ${sparkline(s.hist, 520, 90)}
      <p class="small muted">${s.profile.emoji} ${t(s.profile.name)} · ${isNew ? t("🏆 New best net worth!") : t("Best: {best}", { best: FG.money(best) })} · +${xp} XP</p>
      <div class="callout"><strong>${t("What this year taught you:")}</strong><ul class="small" style="margin:6px 0 0">${lessons.map((l) => `<li>${l}</li>`).join("")}</ul></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" data-replay>${t("Same life, new year")}</button><button class="btn btn-ghost" data-restart>${t("Choose a different life")}</button></div>`;
  }

  function log(t) { s.log.unshift(t); }

  function statsView() {
    const nw = netWorth();
    const hc = s.happy >= 50 ? "var(--good)" : s.happy >= 25 ? "var(--gold)" : "var(--bad)";
    const months = s.savings / s.bills;
    const owed = s.plans.reduce((t, p) => t + p.amt * p.left, 0);
    return `<div class="card life-stats">
      <div class="stat hero"><div class="label">${t("Net worth")}</div><div class="value">${FG.money(nw)}</div>${sparkline(s.hist)}</div>
      <div class="small muted">${t("💵 {pay} in · 🧾 {bills} bills each month", { pay: FG.money(s.pay), bills: FG.money(s.bills) })}</div>
      <div class="stat"><div class="label">${t("🏦 Checking")}</div><div class="value">${FG.money(s.cash)}</div></div>
      <div class="stat"><div class="label">${t("🛡️ Emergency fund")}</div><div class="value">${FG.money(s.savings)}</div><div class="small muted">${t("{months} months of bills", { months: months.toFixed(1) })}</div></div>
      <div class="stat"><div class="label">${t("📈 Investments")}</div><div class="value">${FG.money(s.invest)}</div></div>
      <div class="stat ${s.debt > 0.5 ? "debt" : ""}"><div class="label">${t("💳 Credit card debt")}</div><div class="value">${FG.money(s.debt)}</div>${s.debt > 0.5 ? `<div class="small muted">${t("~{amount} interest next month", { amount: FG.money(s.debt * CARD_APR / 12) })}</div>` : ""}</div>
      ${owed ? `<div class="small">${t("🗓️ Payment plans: {amount} still due ({plans})", { amount: FG.money(owed), plans: s.plans.map((p) => t("{plan} {amount}/mo × {n}", { plan: t(p.name), amount: FG.money(p.amt), n: p.left })).join(", ") })}</div>` : ""}
      <div><div class="small" style="display:flex;justify-content:space-between"><strong>${t("😊 Happiness")}</strong><span>${Math.round(s.happy)}/100</span></div>
        <div class="meter"><span style="width:${s.happy}%;background:${hc}"></span></div></div>
      ${s.log.length ? `<ol class="life-log" reversed>${s.log.map((l) => `<li>${l}</li>`).join("")}</ol>` : ""}
    </div>`;
  }

  function render(main, done = false) {
    const m = Math.min(12, s.month);
    root.innerHTML = `<div>
        <div class="small muted">${done ? t("Year in review") : t("Month {n} of 12", { n: m })} · ${s.profile.emoji} ${t(s.profile.name)}</div>
        <div class="month-dots">${Array.from({ length: 12 }, (_, i) => `<span class="${i < m ? "on" : ""}"></span>`).join("")}</div>
        <div class="card event-card">${main}</div>
      </div>${statsView()}`;
    if (root.querySelector("[data-bucket]")) paintDraft();
  }

  root.addEventListener("click", (e) => {
    const pr = e.target.closest("[data-profile]");
    if (pr) return newGame(PROFILES[+pr.dataset.profile]);
    const ev = e.target.closest("[data-ev]");
    if (ev) return render(allocateView(s.event.choices[+ev.dataset.ev].act()));
    const ps = e.target.closest("[data-preset]");
    if (ps) {
      const sp = { ...PRESETS[ps.dataset.preset].split };
      if (s.debt <= 0.5) { sp.save += sp.debt; sp.debt = 0; }
      s.draft = Object.fromEntries(BUCKETS.map(([k]) => [k, Math.floor((sp[k] * s.alloc) / 25) * 25]));
      return paintDraft();
    }
    if (e.target.closest("[data-confirm]")) return allocate();
    if (e.target.closest("[data-replay]")) return newGame(s.profile);
    if (e.target.closest("[data-restart]")) pickView();
  });
  root.addEventListener("input", (e) => {
    const r = e.target.closest("[data-bucket]");
    if (!r) return;
    s.draft[r.dataset.bucket] = +r.value;
    fitDraft(r.dataset.bucket);
    paintDraft();
  });

  // Redraw the current screen in the new language. A finished year is not redrawn (that would record it again).
  document.addEventListener("langchange", () => {
    if (!s) { if (root.innerHTML.trim()) pickView(); return; }
    if (s.month > 12 || root.querySelector("[data-replay]")) return;
    if (root.querySelector("[data-ev]")) render(eventView());
  });
  return {
    show() { if (!root.innerHTML.trim()) pickView(); },
    hide() {},
  };
})();
