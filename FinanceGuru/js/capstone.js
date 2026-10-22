// Capstone: "Your First Year After Graduation". Seven decisions (one or more per unit) feed a
// month-by-month simulation of a first year on a $50,000 salary, then a report card grades each unit
// and links back to its lessons. Taxes use the shared 2026 federal figures (js/data/tax2026.js) and
// the credit score uses the shared illustrative model (js/creditmodel.js). Cited figures are listed
// in the page's "How this works"; everything marked illustrative is a round teaching number.
const Capstone = (() => {
  const KEY = "fg-capstone-v1";
  const SALARY = 50000;            // illustrative starting salary
  const START_CASH = 3000;         // illustrative: graduation gifts + summer job savings
  const STATE_RATE = 0.04;         // illustrative flat state income tax
  const MATCH_UP_TO = 0.04;        // illustrative plan: employer matches 100% of the first 4% of pay
  const ESSENTIALS = 700;          // illustrative: groceries, phone, utilities, health premium
  const BUFFER = 500;              // checking cushion kept before sweeping extra into savings
  const SURPRISE = 1200, SURPRISE_MONTH = 7, BONUS = 1000;
  const CARD_APR = 0.2236;         // Federal Reserve G.19, Aug 2026 (same figure as the Credit hub)
  const CARD_LIMIT = 2000;         // illustrative first-card limit
  const OVERDRAFT = 26.77;         // Bankrate 2025 average overdraft fee
  const RENTERS = 170 / 12;        // ~$170/yr renters insurance (Triple-I, from NAIC data)
  const AAA_DEPRECIATION = 4422, NEW_PRICE = 50562; // AAA Your Driving Costs 2026; KBB Sept 2026 average new price
  const CAR_INSURANCE = 2098 / 12; // AAA 2026 average insurance
  const RUNNING = 200;             // illustrative gas + maintenance per month

  const DECISIONS = [
    { id: "home", unit: "decide", icon: "🏠", title: "Where will you live?", lessons: ["rent-vs-buy", "budgeting"],
      text: "Your job starts next month. A common guideline (HUD) is to keep housing at or under 30% of your gross pay, which is $1,250 a month on $50,000.",
      choices: [
        { id: "alone", label: "Studio apartment by yourself", rent: 1450, renters: true, moveIn: 1450 + 1200, sub: "$1,450/mo rent · $2,650 to move in (deposit + furniture)" },
        { id: "roommate", label: "Share a 2-bedroom with a roommate", rent: 900, renters: true, moveIn: 900 + 700, sub: "$900/mo your share · $1,600 to move in" },
        { id: "family", label: "Live with family and chip in", rent: 400, renters: false, moveIn: 0, sub: "$400/mo to help with bills · no move-in costs" },
      ] },
    { id: "ride", unit: "decide", icon: "🚗", title: "How will you get to work?", lessons: ["car-buying"],
      text: "The 20/4/10 guideline: 20% down, a loan of 4 years or less, and total car costs under 10% of gross pay ($417 a month here).",
      choices: [
        { id: "transit", label: "Bus or train pass (or bike)", transit: 90, sub: "$90/mo · slower some days" },
        { id: "used", label: "Reliable used car, 4-year loan", price: 16000, down: 1600, apr: 9, months: 48, sub: "$16,000 · $1,600 down · ~9% APR" },
        { id: "new", label: "Brand-new car, 7-year loan", price: NEW_PRICE, down: 0, apr: 7, months: 84, sub: "$50,562 (average new price) · $0 down · ~7% APR" },
      ] },
    { id: "k401", unit: "grow", icon: "💼", title: "Your 401(k) signup form", lessons: ["retirement-accounts", "compound-interest"],
      text: "Your employer matches 100% of what you put in, up to 4% of your pay. Contributions come out before federal and state income tax.",
      choices: [
        { id: "0", label: "Skip it for now", pct: 0 },
        { id: "4", label: "Put in 4% (the full match)", pct: 0.04 },
        { id: "10", label: "Put in 10%", pct: 0.10 },
      ] },
    { id: "bank", unit: "earn", icon: "🏦", title: "Where will your extra cash sit?", lessons: ["banking", "emergency-fund"],
      text: "Anything above a $500 cushion in checking gets moved here each month. Both savings options below are insured up to $250,000.",
      choices: [
        { id: "checking", label: "Leave it all in checking", apy: 0, sweep: false, sub: "Easy to reach, easy to spend · 0%" },
        { id: "bank", label: "Savings account at my bank", apy: 0.0037, sweep: true, sub: "0.37% APY (FDIC national average)" },
        { id: "hys", label: "Online high-yield savings", apy: 0.04, sweep: true, sub: "About 4% APY (top online banks, Bankrate)" },
      ] },
    { id: "fun", unit: "earn", icon: "🛍️", title: "Your spending style", lessons: ["budgeting"],
      text: "After rent, transport, and essentials, how much goes to wants each month: eating out, concerts, clothes, subscriptions?",
      choices: [
        { id: "lean", label: "Lean: a few treats", wants: 250, sub: "$250/mo on wants" },
        { id: "balanced", label: "Balanced", wants: 450, sub: "$450/mo on wants" },
        { id: "big", label: "Living it up", wants: 900, sub: "$900/mo on wants" },
      ] },
    { id: "card", unit: "borrow", icon: "💳", title: "Your first credit card", lessons: ["credit", "debt"],
      text: "A student card with a $2,000 limit is offered. The average APR on balances is 22.36% (Federal Reserve).",
      choices: [
        { id: "none", label: "No card. Debit only", sub: "No credit history gets built" },
        { id: "autopay", label: "Card for the phone bill, autopay in full", sub: "A small charge each month, paid off automatically" },
        { id: "minimum", label: "Card for all your wants, pay the minimum", sub: "More spending money now, interest later" },
      ] },
    { id: "bonus", unit: "grow", icon: "🎁", title: "Month 12: a $1,000 bonus", lessons: ["retirement-accounts", "debt"],
      text: "Your first year went well, and your boss hands you a $1,000 bonus (after taxes). What do you do with it?",
      choices: [
        { id: "roth", label: "Open a Roth IRA and invest it", sub: "Grows tax-free for retirement" },
        { id: "payoff", label: "Pay off card debt, save the rest", sub: "Card balance first, then savings" },
        { id: "trip", label: "Take a trip", sub: "A great memory, $0 left" },
      ] },
  ];
  const pick = (choices, d) => DECISIONS.find((x) => x.id === d).choices.find((c) => c.id === choices[d]);
  const valid = (choices) => !!choices && DECISIONS.every((d) => d.choices.some((c) => c.id === choices[d.id]));

  const loanPayment = (principal, apr, months) => {
    const r = apr / 100 / 12;
    return principal <= 0 ? 0 : r ? (principal * r) / (1 - Math.pow(1 + r, -months)) : principal / months;
  };

  // Yearly paycheck math: 401(k) lowers income taxes but not FICA.
  function paycheck(pct) {
    const k = SALARY * pct, match = SALARY * Math.min(pct, MATCH_UP_TO);
    const fed = federalTax("single", SALARY - k).tax;
    const f = TAX_2026.fica, fica = Math.min(SALARY, f.ssWageBase) * f.ssRate + SALARY * f.medicare;
    const state = (SALARY - k) * STATE_RATE;
    return { k, match, fed, fica, state, takeHome: SALARY - k - fed - fica - state };
  }

  // Fixed monthly costs implied by a (possibly partial) set of choices.
  function monthly(choices) {
    const home = choices.home && pick(choices, "home"), ride = choices.ride && pick(choices, "ride");
    const housing = home ? home.rent + (home.renters ? RENTERS : 0) : 0;
    const carPay = ride && ride.price ? loanPayment(ride.price - ride.down, ride.apr, ride.months) : 0;
    const transport = !ride ? 0 : ride.transit || carPay + CAR_INSURANCE + RUNNING;
    const fun = choices.fun ? pick(choices, "fun").wants : 0;
    const takeHome = choices.k401 ? paycheck(pick(choices, "k401").pct).takeHome / 12 : paycheck(0).takeHome / 12;
    return { housing, transport, carPay, essentials: ESSENTIALS, wants: fun, takeHome };
  }

  function simulate(choices) {
    const home = pick(choices, "home"), ride = pick(choices, "ride"), bank = pick(choices, "bank");
    const card = choices.card, pay = paycheck(pick(choices, "k401").pct), m = monthly(choices);
    const s = { cash: START_CASH, savings: 0, card: 0, retirement: 0, interestEarned: 0, cardInterest: 0, loanInterest: 0, overdrafts: 0, late: 0,
      carLoan: ride.price ? ride.price - ride.down : 0, events: [], months: [] };
    const hasCard = card !== "none";

    // Pay a bill: checking, then savings, then the card (if any), then an overdraft.
    function payBill(amount) {
      const from = { cash: 0, savings: 0, card: 0, short: 0 };
      from.cash = Math.max(0, Math.min(s.cash, amount)); s.cash -= from.cash; let rest = amount - from.cash;
      from.savings = Math.min(s.savings, rest); s.savings -= from.savings; rest -= from.savings;
      if (hasCard) { from.card = Math.max(0, Math.min(CARD_LIMIT - s.card, rest)); s.card += from.card; rest -= from.card; }
      if (rest > 0.005) { from.short = rest; s.cash -= rest + OVERDRAFT; s.overdrafts++; s.late++; }
      return from;
    }

    payBill(home.moveIn + (ride.down || 0));
    if (home.moveIn || ride.down) s.events.push({ month: 1, icon: "📦", text: `Moving in and getting set up cost ${money(home.moveIn + (ride.down || 0))}.` });

    for (let month = 1; month <= 12; month++) {
      s.cash += m.takeHome;
      s.retirement += (pay.k + pay.match) / 12;
      // Card: interest on last month's balance, then this month's charges, then the payment.
      if (hasCard) {
        if (card === "autopay") { const p = Math.min(s.card, Math.max(0, s.cash)); s.card -= p; s.cash -= p; }
        const interest = s.card * CARD_APR / 12; s.card += interest; s.cardInterest += interest;
        if (card === "minimum") {
          const charge = Math.min(m.wants, CARD_LIMIT - s.card); s.card += charge;
          if (m.wants - charge > 0) payBill(m.wants - charge);
          const min = Math.min(s.card, Math.max(25, s.card * 0.01 + interest));
          if (s.cash >= min) { s.cash -= min; s.card -= min; } else { const paid = Math.max(0, s.cash); s.cash -= paid; s.card -= paid; s.late++; }
        }
      }
      payBill(m.housing + m.transport + m.essentials + (card === "minimum" ? 0 : m.wants));
      if (s.carLoan > 0) { s.loanInterest += s.carLoan * ride.apr / 100 / 12; s.carLoan = Math.max(0, s.carLoan * (1 + ride.apr / 100 / 12) - m.carPay); }

      if (month === SURPRISE_MONTH) {
        const what = ride.price ? "Your car needs a $1,200 repair" : "A dental emergency costs $1,200";
        const from = payBill(SURPRISE);
        const how = from.card || from.short
          ? [from.card ? `${money(from.card)} went on your credit card at 22.36% APR.` : "", from.short ? `You came up ${money(from.short)} short and paid an overdraft fee.` : ""].join(" ").trim()
          : from.savings ? `${from.cash ? `Checking covered ${money(from.cash)} and your` : "Your"} savings covered ${money(from.savings)}.` : "Checking covered it.";
        s.events.push({ month, icon: "⚠️", text: `${what}. ${how}`, ok: !from.card && !from.short });
      }
      if (month === 12) {
        const b = choices.bonus;
        if (b === "roth") { s.retirement += BONUS; s.roth = BONUS; }
        const p = b === "payoff" ? Math.min(s.card, BONUS) : 0;
        if (b === "payoff") { s.card -= p; s.cash += BONUS - p; }
        s.events.push({ month, icon: "🎁", text: b === "roth" ? "Your $1,000 bonus went into a Roth IRA."
          : b === "payoff" ? (p ? `Your bonus paid ${money(p)} of card debt${p < BONUS ? " and the rest went to savings" : ""}.` : "No card debt to pay, so your bonus went to savings.")
          : "Your $1,000 bonus paid for a trip." });
      }

      // Extra cash above the cushion is swept to savings.
      if (bank.sweep && s.cash > BUFFER) { s.savings += s.cash - BUFFER; s.cash = BUFFER; }
      const interest = s.savings * bank.apy / 12; s.savings += interest; s.interestEarned += interest;
      s.months.push({ month, worth: worth(s) });
    }

    function worth(x) { return x.cash + x.savings + x.retirement - x.card - x.carLoan + carValue(); }
    function carValue() { return ride.price ? ride.price - AAA_DEPRECIATION * (ride.price / NEW_PRICE) : 0; }
    const essentialsMonthly = m.housing + m.transport + m.essentials;
    const credit = score(s, card, !!ride.price);
    return {
      ...s, netWorth: worth(s), carValue: carValue(), monthly: m, pay, essentialsMonthly, credit,
      cashOnHand: Math.max(0, s.cash) + s.savings,
      // Financial net worth change (leaves out the car and its loan, which are scored under Big decisions).
      saved: s.cash + s.savings + s.retirement - s.card - START_CASH,
    };
  }

  // Illustrative score from the shared model. FICO needs an account open 6+ months to score you,
  // so with no card (and no loan) there is no score yet.
  function score(s, card, hasLoan) {
    const accounts = (card !== "none" ? 1 : 0) + (hasLoan ? 1 : 0);
    if (!accounts) return null;
    const util = card === "none" ? 0 : card === "autopay" ? 3 : Math.min(100, (s.card / CARD_LIMIT) * 100);
    const r = CREDIT_MODEL.score({ late: s.late, util, age: 1, inq: accounts, mix: accounts });
    return { ...r, util, tier: CREDIT_MODEL.tier(r.score) };
  }

  // One grade per unit: "good", "ok", or "bad", with the numbers behind it.
  function grade(choices, r) {
    const gross = SALARY / 12, units = {};
    const rate = r.saved / SALARY;
    units.earn = { status: rate >= 0.2 ? "good" : rate >= 0.1 ? "ok" : "bad", value: `${Math.round(rate * 100)}% of pay saved`,
      note: rate >= 0.2 ? "You hit the 20% savings target from the 50/30/20 guideline." : rate >= 0.1 ? "A solid start. The 50/30/20 guideline aims for 20% of pay." : rate > 0 ? "Most of your pay went to spending. Trimming one big fixed cost frees up the most." : "You ended the year with less than you started with." };
    const months = r.cashOnHand / r.essentialsMonthly, surprise = r.events.find((e) => e.month === SURPRISE_MONTH);
    units.protect = { status: months >= 3 && surprise.ok ? "good" : months >= 1 && surprise.ok ? "ok" : "bad", value: `${months.toFixed(1)} months of essentials saved`,
      note: !surprise.ok ? "The $1,200 surprise didn't fit in your savings. An emergency fund keeps surprises off high-interest cards." : months >= 3 ? "You reached the 3–6 month emergency fund goal." : "Your savings covered the surprise. Next goal: 3 months of essential costs." };
    const c = r.credit, debt = r.card > 0.5;
    units.borrow = { status: debt || r.late ? "bad" : c ? "good" : "ok", value: c ? `Score ≈ ${c.score} (${c.tier})${debt ? ` · ${money(r.card)} card debt` : ""}` : "No credit score yet",
      note: r.late ? "Missed or short payments hurt payment history, the biggest part of a score." : debt ? `Carrying a balance cost you ${money(r.cardInterest)} in interest this year and kept your utilization high.` : c ? "On-time payments and low balances are building your credit." : "No debt is great, but with no account open 6+ months you have no score. A card on autopay builds one." };
    const pct = pick(choices, "k401").pct;
    units.grow = { status: pct >= MATCH_UP_TO ? "good" : r.roth ? "ok" : "bad", value: `${money(r.retirement)} for retirement`,
      note: pct >= MATCH_UP_TO ? `You captured the full ${money(r.pay.match)} employer match: free money.` : `You left ${money(SALARY * MATCH_UP_TO)} of employer match on the table.${r.roth ? " The Roth IRA helps." : ""}` };
    const hp = r.monthly.housing / gross, tp = r.monthly.transport / gross;
    const ok = (hp <= 0.3 ? 1 : 0) + (tp <= 0.1 ? 1 : 0);
    units.decide = { status: ok === 2 ? "good" : ok === 1 ? "ok" : "bad", value: `Housing ${Math.round(hp * 100)}% · transport ${Math.round(tp * 100)}% of gross`,
      note: ok === 2 ? "Housing under 30% and transport under 10% of gross pay leaves room for everything else." : [hp > 0.3 ? "Housing is over the 30% guideline." : "", tp > 0.1 ? `Transport is over the 10% car guideline${pick(choices, "ride").id === "new" ? `, and after a year you owe ${money(r.carLoan)} on a car worth about ${money(r.carValue)}` : ""}.` : ""].filter(Boolean).join(" ") };
    return units;
  }

  const money = (v) => (v < 0 ? "−" : "") + "$" + Math.round(Math.abs(v)).toLocaleString("en-US");
  const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY)); return s && Array.isArray(s.runs) ? s : { runs: [] }; } catch { return { runs: [] }; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage blocked */ } };
  // Saved runs: only well-formed ones count (choices are re-simulated, never trusted as numbers).
  const state = () => {
    const runs = load().runs.filter((r) => r && valid(r.choices) && typeof r.date === "string");
    const scored = runs.map((r) => { const res = simulate(r.choices), g = grade(r.choices, res); return { ...r, netWorth: res.netWorth, good: Object.values(g).filter((u) => u.status === "good").length }; });
    return { runs: scored, best: scored.reduce((b, r) => Math.max(b, r.good), 0) };
  }

  function render(host) {
    let step = -1, choices = {};
    const unitOf = (id) => UNITS.find((u) => u.id === id);
    const lessonLink = (id) => { const l = LESSONS.find((x) => x.id === id); return l ? `<a href="lessons/${id}.html">${l.title}</a>` : ""; };

    function budgetBar() {
      const m = monthly(choices), spent = m.housing + m.transport + (choices.fun ? m.essentials + m.wants : 0);
      const left = m.takeHome - spent;
      return `<div class="cap-budget" aria-live="polite"><span>Take-home <strong>${money(m.takeHome)}</strong>/mo</span>
        <span>Planned <strong>${money(spent)}</strong></span>
        <span class="${left < 0 ? "delta down" : ""}">Left over <strong>${money(left)}</strong></span></div>`;
    }

    function intro() {
      const runs = state().runs;
      host.innerHTML = `<div class="card result">
        <div class="big">🎓</div>
        <h2 tabindex="-1" data-autofocus>You just graduated. Now what?</h2>
        <p class="muted">You're 22, starting a job that pays <strong>$50,000 a year</strong>, with <strong>$3,000</strong> saved. Make seven decisions, then see where you stand after twelve months, with a report card for every unit of the course.</p>
        <div class="hero-actions" style="justify-content:center"><button class="btn btn-primary" data-act="start">Start your first year →</button></div>
        ${runs.length ? `<p class="small muted">You've finished the capstone ${runs.length} time${runs.length > 1 ? "s" : ""}. Best: ${state().best}/5 units in the green.</p>` : ""}
      </div>`;
    }

    function decision() {
      const d = DECISIONS[step], u = unitOf(d.unit);
      let subs = d.choices.map((c) => c.sub);
      if (d.id === "k401") subs = d.choices.map((c) => { const p = paycheck(c.pct); return `Take-home ${money(p.takeHome / 12)}/mo · ${p.match ? `${money(p.match / 12)}/mo match` : "no match"}`; });
      host.innerHTML = `<div class="card">
        <div class="small muted">Decision ${step + 1} of ${DECISIONS.length} · ${u.icon} ${u.title}</div>
        <div class="step-dots" aria-hidden="true">${DECISIONS.map((_, i) => `<span class="${i <= step ? "on" : ""}"></span>`).join("")}</div>
        <h2 class="quiz-q" tabindex="-1" data-autofocus>${d.icon} ${d.title}</h2>
        <p class="muted">${d.text}</p>
        ${budgetBar()}
        <div class="choices">${d.choices.map((c, i) => `<button class="choice${choices[d.id] === c.id ? " picked" : ""}" data-choice="${c.id}" aria-pressed="${choices[d.id] === c.id}">${c.label}<small>${subs[i]}</small></button>`).join("")}</div>
        <p class="small muted">Learn more: ${d.lessons.map(lessonLink).join(" · ")}</p>
        <div class="step-actions"><button class="btn btn-ghost" data-act="back">← Back</button></div>
      </div>`;
    }

    function results() {
      const r = simulate(choices), g = grade(choices, r);
      const good = Object.values(g).filter((u) => u.status === "good").length;
      const store = load(), prev = state().runs.at(-1), firstTime = !state().runs.length;
      store.runs = [...store.runs.filter((x) => x && valid(x.choices)), { choices, date: new Date().toISOString() }].slice(-5);
      save(store);
      if (firstTime) FG.addXp(50);
      document.dispatchEvent(new Event("progresschange"));
      const label = { good: "On track", ok: "Getting there", bad: "Needs work" };
      host.innerHTML = `<div class="card result">
        <div class="small muted">Net worth after one year</div>
        <div class="big"${r.netWorth < 0 ? ' style="color:var(--bad)"' : ""}>${money(r.netWorth)}</div>
        <h2 tabindex="-1" data-autofocus>${good === 5 ? "All five units in the green! 🏆" : `${good} of 5 units in the green`}</h2>
        <p class="muted">You started with ${money(START_CASH)}.${prev ? ` Last time you finished with ${money(prev.netWorth)}.` : ""}${firstTime ? " +50 XP" : ""}</p>
      </div>
      <div class="stats" style="margin-top:16px">
        <div class="stat hero"><div class="label">Cash + savings</div><div class="value">${money(r.cashOnHand)}</div><div class="small muted">${money(r.interestEarned)} interest earned</div></div>
        <div class="stat"><div class="label">Retirement</div><div class="value">${money(r.retirement)}</div><div class="small muted">${r.pay.match ? `incl. ${money(r.pay.match)} match` : "no match"}</div></div>
        <div class="stat"><div class="label">Debt</div><div class="value">${money(r.card + r.carLoan + Math.max(0, -r.cash))}</div><div class="small muted">${money(r.cardInterest + r.loanInterest)} interest paid</div></div>
        <div class="stat"><div class="label">Credit score</div><div class="value">${r.credit ? r.credit.score : "None"}</div><div class="small muted">${r.credit ? `${r.credit.tier} (illustrative)` : "no account yet"}</div></div>
      </div>
      <div class="card"><h3 style="margin-top:0">Your year</h3>
        <ul class="cap-events">${r.events.map((e) => `<li><span aria-hidden="true">${e.icon}</span><span><strong>Month ${e.month}.</strong> ${e.text}</span></li>`).join("")}
        ${r.overdrafts ? `<li><span aria-hidden="true">🚫</span><span>You came up short ${r.overdrafts} time${r.overdrafts > 1 ? "s" : ""}, paying ${money(r.overdrafts * OVERDRAFT)} in overdraft fees.</span></li>` : ""}</ul>
      </div>
      <div class="card" style="margin-top:16px"><h3 style="margin-top:0">Report card</h3>
        <div class="cap-grades">${UNITS.map((u, n) => { const x = g[u.id]; const d = DECISIONS.filter((d) => d.unit === u.id); const ls = [...new Set(d.flatMap((d) => d.lessons))];
          return `<div class="cap-grade ${x.status}">
            <div class="cap-grade-top"><strong>${u.icon} Unit ${n + 1}: ${u.title}</strong><span class="cap-pill">${label[x.status]}</span></div>
            <div class="cap-value">${x.value}</div>
            <p class="small muted">${x.note}${x.status !== "good" && ls.length ? ` Review: ${ls.map(lessonLink).join(" · ")}` : ""}</p>
          </div>`; }).join("")}</div>
      </div>
      <div class="card" style="margin-top:16px;text-align:center"><h3 style="margin-top:0">Try a different year</h3>
        <p class="muted small">Change one decision at a time to see what moves the most.</p>
        <div class="hero-actions" style="justify-content:center">
          <button class="btn btn-primary" data-act="again">Play again</button>
          <a class="btn btn-ghost" href="plan.html">Build your real paycheck plan →</a>
        </div>
      </div>`;
    }

    host.addEventListener("click", (e) => {
      const c = e.target.closest("[data-choice]"), act = e.target.closest("[data-act]")?.dataset.act;
      if (c) { choices[DECISIONS[step].id] = c.dataset.choice; if (++step < DECISIONS.length) decision(); else results(); }
      else if (act === "start" || act === "again") { step = 0; if (act === "start") choices = {}; decision(); }
      else if (act === "back") { if (--step < 0) intro(); else decision(); }
      else return;
      FG.scrollTo(host);
    });
    intro();
  }

  const host = typeof document !== "undefined" && document.getElementById("capstone");
  if (host) render(host);
  return { DECISIONS, paycheck, monthly, simulate, grade, state, valid };
})();
