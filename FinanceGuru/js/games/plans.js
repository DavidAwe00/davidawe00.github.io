// Plan Picker — choose one of three health plans for each person from their risk profile, then see
// one real year rolled AND 4,000 simulated years on every plan. Teaches premium vs deductible vs copays
// vs coinsurance vs out-of-pocket max, and that the best plan on average isn't the cheapest every year.
// Plans, people, odds, and bills are illustrative; preventive care is free under the ACA.
window.Games = window.Games || {};
Games.plans = (() => {
  const root = document.getElementById("plan-root");
  const ROUNDS = 5, SIMS = 4000;
  // visit/rx copays apply before the deductible; null means that care goes through the deductible.
  const PLANS = [
    { name: "Low-deductible plan", short: "Low deductible", label: "low-deductible plan", emoji: "🛡️", premium: 95, deductible: 500, coins: 0.2, oop: 3000, visit: 25, rx: 10, hsa: 0 },
    { name: "Copay plan", short: "Copay plan", label: "copay plan", emoji: "🎟️", premium: 60, deductible: 2500, coins: 0.3, oop: 6500, visit: 30, rx: 10, hsa: 0 },
    { name: "High-deductible plan + HSA", short: "High deductible", label: "high-deductible plan", emoji: "🏦", premium: 55, deductible: 3200, coins: 0.2, oop: 6000, visit: null, rx: null, hsa: 250 },
  ];
  // Events: { d: description, amt: allowed price per item, n: how many, t: prev | visit | rx | big, p: chance (risks only) }
  const PEOPLE = [
    { name: "Hana", emoji: "🏃‍♀️", about: "21, runs every morning, rarely gets sick.",
      base: [{ d: "Yearly checkup", amt: 250, t: "prev" }],
      risks: [{ d: "Sick visit", amt: 150, t: "visit", p: 0.5 }, { d: "Urgent care for strep throat", amt: 200, t: "visit", p: 0.3 }, { d: "Sprained ankle: ER + X-ray", amt: 2500, t: "big", p: 0.05 }] },
    { name: "Marco", emoji: "💊", about: "24, takes a monthly asthma prescription and catches every cold going around.",
      base: [{ d: "Yearly checkup", amt: 250, t: "prev" }, { d: "Asthma prescription", amt: 40, n: 12, t: "rx" }, { d: "Sick visits", amt: 150, n: 3, t: "visit" }],
      risks: [{ d: "ER visit for an asthma attack", amt: 3000, t: "big", p: 0.15 }] },
    { name: "Kai", emoji: "🤧", about: "19, gets allergy shots at a specialist every month.",
      base: [{ d: "Yearly checkup", amt: 250, t: "prev" }, { d: "Allergy specialist visits", amt: 80, n: 12, t: "visit" }],
      risks: [{ d: "Sick visit", amt: 150, t: "visit", p: 0.4 }] },
    { name: "Sofia", emoji: "⚽", about: "20, plays club soccer. Last season: two sprains and a broken finger.",
      base: [{ d: "Yearly checkup", amt: 250, t: "prev" }],
      risks: [{ d: "ER visit + cast for a broken wrist", amt: 4500, t: "big", p: 0.35 }, { d: "Physical therapy sessions", amt: 120, n: 10, t: "visit", p: 0.3 }, { d: "Sick visit", amt: 150, t: "visit", p: 0.5 }] },
    { name: "Dev", emoji: "🦵", about: "23, has knee surgery scheduled for the spring after an old injury.",
      base: [{ d: "Knee surgery (outpatient)", amt: 18000, t: "big" }, { d: "Physical therapy sessions", amt: 120, n: 10, t: "visit" }],
      risks: [{ d: "Sick visit", amt: 150, t: "visit", p: 0.4 }] },
    { name: "Lena", emoji: "🍀", about: "22, healthy, no prescriptions, hasn't seen a doctor in two years.",
      base: [{ d: "Yearly checkup", amt: 250, t: "prev" }],
      risks: [{ d: "Sick visit", amt: 150, t: "visit", p: 0.3 }, { d: "Appendicitis: ER, surgery, and 2-night stay", amt: 25000, t: "big", p: 0.04 }] },
    { name: "Jordan", emoji: "🩸", about: "25, has type 1 diabetes: monthly insulin and supplies, plus specialist check-ins.",
      base: [{ d: "Yearly checkup", amt: 250, t: "prev" }, { d: "Insulin and supplies", amt: 300, n: 12, t: "rx" }, { d: "Endocrinologist visits", amt: 200, n: 4, t: "visit" }],
      risks: [{ d: "ER visit for low blood sugar", amt: 4000, t: "big", p: 0.1 }] },
  ];
  const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const t = (s, v) => (typeof I18N === "object" ? I18N.t(s, v) : s);
  const odds = (p) => (p >= 0.5 ? t("{pct}% chance", { pct: Math.round(p * 100) }) : t("1 in {n} chance", { n: Math.round(1 / p) }));
  let round, correct, lostAvg, deck, locked, luckyYears;

  // What a person pays on a plan for one year: premiums + their share of care (capped) − employer HSA deposit.
  function cost(plan, events) {
    let copays = 0, billed = 0;
    for (const e of events) {
      const n = e.n || 1;
      if (e.t === "prev") continue;
      const copay = e.t === "visit" ? plan.visit : e.t === "rx" ? plan.rx : null;
      if (copay != null) copays += copay * n;
      else billed += e.amt * n;
    }
    const ded = Math.min(billed, plan.deductible);
    const care = Math.min(plan.oop, copays + ded + plan.coins * (billed - ded));
    return { premiums: plan.premium * 12, care, total: plan.premium * 12 + care - plan.hsa, capped: care === plan.oop && care > 0 };
  }
  const rollYear = (who) => [...who.base, ...who.risks.filter((r) => Math.random() < r.p)];

  function simulate(who) {
    return PLANS.map((p) => {
      const t = new Float64Array(SIMS);
      for (let s = 0; s < SIMS; s++) t[s] = cost(p, rollYear(who)).total;
      t.sort();
      const avg = t.reduce((a, b) => a + b, 0) / SIMS;
      // "Bad years" = the average of the worst 10% of years, so it is never below the overall average.
      const tail = t.subarray(Math.floor(SIMS * 0.9));
      return { avg, bad: tail.reduce((a, b) => a + b, 0) / tail.length, worst: p.premium * 12 + p.oop - p.hsa };
    });
  }

  function start() {
    round = 0; correct = 0; lostAvg = 0; luckyYears = 0;
    deck = shuffle([...PEOPLE]).slice(0, ROUNDS);
    next();
  }

  const planCard = (p, i) => `<button class="choice plan-card" data-pick="${i}">
      <strong>${p.emoji} ${t(p.name)}</strong>
      <span>${t("Premium: <b>{month}/mo</b> ({year}/yr)", { month: money(p.premium), year: money(p.premium * 12) })}</span>
      <span>${t("Deductible: <b>{amount}</b>, then you pay {pct}%", { amount: money(p.deductible), pct: p.coins * 100 })}</span>
      <span>${p.visit != null ? t("Copays: <b>{visit}</b> visit · <b>{rx}</b> prescription", { visit: money(p.visit), rx: money(p.rx) }) : t("No copays: visits and prescriptions count toward the deductible")}</span>
      <span>${t("Out-of-pocket max: <b>{amount}</b>", { amount: money(p.oop) })}</span>
      ${p.hsa ? `<span>${t("Employer adds <b>{amount}</b> to your HSA", { amount: money(p.hsa) })}</span>` : "<span>&nbsp;</span>"}
      <span class="small muted">${t("Worst case: {amount} a year", { amount: money(p.premium * 12 + p.oop - p.hsa) })}</span></button>`;

  const eventLine = (e) => `${t(e.d)}${e.n ? ` (${e.n} × ${money(e.amt)})` : `: ${money(e.amt)}`}${e.t === "prev" ? ` <em>${t("(preventive, $0)")}</em>` : ""}`;

  function next() {
    const who = deck[round];
    locked = false;
    root.innerHTML = `
      <div class="small muted">${t("Person {n} of {total} · {correct} best picks", { n: round + 1, total: ROUNDS, correct })}</div>
      <div class="step-dots">${Array.from({ length: ROUNDS }, (_, i) => `<span class="${i < round ? "on" : ""}"></span>`).join("")}</div>
      <div class="plan-person"><span class="emoji">${who.emoji}</span><div><h3 style="margin:0">${who.name}</h3><p class="muted" style="margin:2px 0 0">${t(who.about)}</p></div></div>
      <div class="plan-profile small">
        <div><strong>${t("Expected this year")}</strong><ul>${who.base.map((e) => `<li>${eventLine(e)}</li>`).join("")}</ul></div>
        <div><strong>${t("Might happen")}</strong><ul>${who.risks.map((r) => `<li>${odds(r.p)}: ${eventLine(r)}</li>`).join("")}</ul></div>
      </div>
      <p class="quiz-q">${t("Which plan costs {name} the least <em>on average</em>?", { name: who.name })}</p>
      <div class="plan-choices">${PLANS.map(planCard).join("")}</div>
      <div id="plan-feedback" style="margin-top:16px" aria-live="polite"></div>`;
  }

  function pick(i) {
    if (locked) return;
    locked = true;
    const who = deck[round];
    const sim = simulate(who);
    const year = rollYear(who);
    const actual = PLANS.map((p) => cost(p, year));
    const best = sim.reduce((b, s, k) => (s.avg < sim[b].avg ? k : b), 0);
    const bestYear = actual.reduce((b, s, k) => (s.total < actual[b].total ? k : b), 0);
    const ok = i === best;
    if (ok) correct++;
    lostAvg += sim[i].avg - sim[best].avg;
    if (bestYear === i && !ok) luckyYears++;
    root.querySelectorAll("[data-pick]").forEach((b, j) => {
      b.disabled = true;
      if (j === best) b.classList.add("correct");
      else if (j === i) b.classList.add("wrong");
    });
    const maxV = Math.max(...sim.map((s) => s.bad));
    const bar = (v, cls) => `<span class="plan-bar ${cls}" style="width:${Math.max(2, (v / maxV) * 100)}%"></span>`;
    const rows = PLANS.map((p, k) => `<tr class="${k === i ? "picked" : ""}">
        <th scope="row">${p.emoji} ${t(p.short)}${k === i ? ` <span class="small muted">${t("(you)")}</span>` : ""}</th>
        <td>${money(sim[k].avg)}${k === best ? " ⭐" : ""}<div class="plan-track">${bar(sim[k].avg, "avg")}</div></td>
        <td>${money(sim[k].bad)}<div class="plan-track">${bar(sim[k].bad, "bad")}</div></td>
        <td>${money(actual[k].total)}${actual[k].capped ? ` <span class="small" title="${t("Hit the out-of-pocket max")}">${t("(max)")}</span>` : ""}</td></tr>`).join("");
    const extra = year.filter((e) => !who.base.includes(e));
    const luck = bestYear !== best
      ? t("This year, the {lucky} happened to be cheapest. That's luck: over thousands of years, the {best} wins.", { lucky: t(PLANS[bestYear].label), best: t(PLANS[best].label) })
      : t("The plan that's best on average was also the cheapest this year.");
    document.getElementById("plan-feedback").innerHTML = `<div class="feedback" style="display:block">
      <p style="margin:0 0 8px"><strong>${ok ? t("✅ Best pick on average!") : t("❌ The {plan} is cheaper on average, by {amount} a year.", { plan: t(PLANS[best].label), amount: money(sim[i].avg - sim[best].avg) })}</strong></p>
      <p style="margin:0 0 8px">${extra.length ? t("🎲 {name}'s year: on top of the expected care, {events}.", { name: who.name, events: extra.map((e) => `<strong>${t(e.d)}</strong>`).join(" " + t("and") + " ") }) : t("🎲 {name}'s year: only the expected care. Nothing surprising.", { name: who.name })}</p>
      <div style="overflow-x:auto"><table class="plan-table plan-sim">
        <thead><tr><th></th><th>${t("Average year")}</th><th>${t("Worst 10% of years")}</th><th>${t("This year")}</th></tr></thead>
        <tbody>${rows}</tbody></table></div>
      <p style="margin:10px 0 0">${luck} ${PLANS[best].hsa && sim[best].bad > sim[best].avg * 1.5 ? t("Only choose it if you could cover the bad years: the worst case is {amount}.", { amount: money(sim[best].worst) }) : ""}</p></div>
      <div style="text-align:center;margin-top:12px"><button class="btn btn-primary" data-next>${round + 1 < ROUNDS ? t("Next person →") : t("See results →")}</button></div>`;
    root.querySelector("[data-next]").focus({ preventScroll: true });
  }

  function end() {
    const { best, isNew } = FG.recordBest("plans", correct);
    const xp = correct * 8;
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    root.innerHTML = `<div class="result">
      <div class="card-icon" style="font-size:2.4rem">☂️</div>
      <div class="big">${correct}/${ROUNDS}</div>
      <p class="small muted">${isNew ? t("🏆 New best!") : t("Best: {best}", { best: best + "/" + ROUNDS })} · +${xp} XP</p>
      <p>${lostAvg > 0.5 ? t("Your picks would cost these {n} people about <strong>{amount}</strong> more per year, on average, than the best plans.", { n: ROUNDS, amount: money(lostAvg) }) : t("Every pick was the cheapest plan on average. 🎯")}
        ${luckyYears ? " " + t("{n} of your other picks happened to win this particular year, but luck doesn't repeat.", { n: luckyYears }) : ""}</p>
      <div class="callout" style="text-align:left">${t("<strong>Money lesson:</strong> compare the <em>total</em> yearly cost (premiums plus your share of care), not just the premium. Regular visits and prescriptions favor copay plans; a big known expense favors a low out-of-pocket max; healthy people often save with a high-deductible plan, but only if their emergency fund could cover its worst case. Learn more in the <a href=\"learn.html#insurance\">Insurance 101 lesson</a>.")}</div>
      <button class="btn btn-primary" data-restart>${t("Play again")}</button></div>`;
  }

  root.addEventListener("click", (e) => {
    const p = e.target.closest("[data-pick]");
    if (p) return pick(+p.dataset.pick);
    if (e.target.closest("[data-next]")) { round++; return round < ROUNDS ? next() : end(); }
    if (e.target.closest("[data-restart]")) start();
  });

  // A person not yet answered is redrawn in the new language.
  document.addEventListener("langchange", () => { if (round !== undefined && !locked && round < ROUNDS) next(); });
  return { show() { if (round === undefined) start(); }, hide() {} };
})();
