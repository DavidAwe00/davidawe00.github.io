// Plan Picker — choose a low-deductible or high-deductible health plan for each person, then see
// what their year of care actually costs on both. Teaches premium vs deductible vs coinsurance vs
// out-of-pocket max. Plans, people, and bills are illustrative; preventive care is free under the ACA.
window.Games = window.Games || {};
Games.plans = (() => {
  const root = document.getElementById("plan-root");
  const ROUNDS = 5;
  const PLANS = [
    { name: "Low-deductible plan", short: "Low deductible", premium: 110, deductible: 500, coins: 0.2, oop: 3500, hsa: 0 },
    { name: "High-deductible plan + HSA", short: "High deductible", premium: 45, deductible: 3000, coins: 0.2, oop: 6000, hsa: 250 },
  ];
  // [description, billed amount, preventive?]
  const PEOPLE = [
    { name: "Hana", emoji: "🏃‍♀️", about: "21, runs every morning, rarely gets sick. Last year: one checkup.", year: [["Yearly checkup", 250, true], ["Urgent care for strep throat", 200]] },
    { name: "Marco", emoji: "💊", about: "24, takes a monthly prescription for asthma and catches every cold going around.", year: [["Yearly checkup", 250, true], ["Asthma prescription (12 months × $40)", 480], ["3 sick visits", 450]] },
    { name: "Kai", emoji: "🤧", about: "19, gets allergy shots every month and otherwise stays healthy.", year: [["Yearly checkup", 250, true], ["12 allergy specialist visits × $80", 960]] },
    { name: "Sofia", emoji: "⚽", about: "20, plays club soccer and sprained both ankles last season.", year: [["Yearly checkup", 250, true], ["ER visit + cast for a broken wrist", 4500], ["10 physical therapy sessions", 1200], ["Sick visit", 150]] },
    { name: "Dev", emoji: "🦵", about: "23, has knee surgery scheduled for the spring after an old injury.", year: [["Knee surgery (outpatient)", 18000], ["10 physical therapy sessions", 1200]] },
    { name: "Lena", emoji: "🍀", about: "22, healthy, no prescriptions, hasn't been to a doctor in two years.", surprise: true, year: [["Appendicitis: ER, surgery, and 2-night hospital stay", 25000]] },
  ];
  const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let round, correct, saved, deck, locked;

  // What a person pays on a plan: premiums + their share of covered care (capped) − employer HSA deposit.
  function cost(plan, year) {
    const billed = year.filter((e) => !e[2]).reduce((t, e) => t + e[1], 0);
    const ded = Math.min(billed, plan.deductible);
    const care = Math.min(plan.oop, ded + plan.coins * (billed - ded));
    return { premiums: plan.premium * 12, ded, coins: care - ded, care, hsa: plan.hsa, capped: care === plan.oop && billed > 0, total: plan.premium * 12 + care - plan.hsa, billed };
  }

  function start() {
    round = 0; correct = 0; saved = 0;
    deck = shuffle([...PEOPLE]).slice(0, ROUNDS);
    next();
  }

  const planCard = (p, i) => `<button class="choice plan-card" data-pick="${i}">
      <strong>${p.name}</strong>
      <span>Premium: <b>${money(p.premium)}/mo</b> (${money(p.premium * 12)}/yr)</span>
      <span>Deductible: <b>${money(p.deductible)}</b>, then you pay ${p.coins * 100}%</span>
      <span>Out-of-pocket max: <b>${money(p.oop)}</b></span>
      ${p.hsa ? `<span>Employer adds <b>${money(p.hsa)}</b> to your HSA</span>` : "<span>&nbsp;</span>"}
      <span class="small muted">Worst case: ${money(p.premium * 12 + p.oop - p.hsa)} a year</span></button>`;

  function next() {
    const who = deck[round];
    locked = false;
    root.innerHTML = `
      <div class="small muted">Person ${round + 1} of ${ROUNDS} · ${correct} cheaper picks</div>
      <div class="step-dots">${Array.from({ length: ROUNDS }, (_, i) => `<span class="${i < round ? "on" : ""}"></span>`).join("")}</div>
      <div class="plan-person"><span class="emoji">${who.emoji}</span><div><h3 style="margin:0">${who.name}</h3><p class="muted" style="margin:2px 0 0">${who.about}</p></div></div>
      <p class="quiz-q">Which plan will cost ${who.name} less this year?</p>
      <div class="plan-choices">${PLANS.map(planCard).join("")}</div>
      <div id="plan-feedback" style="margin-top:16px" aria-live="polite"></div>`;
  }

  function pick(i) {
    if (locked) return;
    locked = true;
    const who = deck[round];
    const c = PLANS.map((p) => cost(p, who.year));
    const best = c[0].total <= c[1].total ? 0 : 1, ok = i === best;
    if (ok) correct++;
    saved += c[1 - best].total - c[best].total;
    root.querySelectorAll("[data-pick]").forEach((b, j) => {
      b.disabled = true;
      if (j === best) b.classList.add("correct");
      else if (j === i) b.classList.add("wrong");
    });
    const rows = (k) => `<table class="plan-table"><caption>${PLANS[k].short}</caption>
      <tr><td>Premiums</td><td>${money(c[k].premiums)}</td></tr>
      <tr><td>Deductible paid</td><td>${money(c[k].ded)}</td></tr>
      <tr><td>Coinsurance (20%)</td><td>${money(c[k].coins)}${c[k].capped ? " <span class=\"small\">(hit max)</span>" : ""}</td></tr>
      ${PLANS[k].hsa ? `<tr><td>Employer HSA deposit</td><td>−${money(PLANS[k].hsa)}</td></tr>` : ""}
      <tr class="total"><td>Total</td><td>${money(c[k].total)}</td></tr></table>`;
    const lesson = who.surprise
      ? (ok ? "Good call. Nobody plans for appendicitis, but the out-of-pocket max is what limits the damage." : `The high-deductible plan was a fair bet for someone this healthy, but surprises happen. Before choosing it, make sure your emergency fund could cover its out-of-pocket max.`)
      : best === 1 ? "With little care, the lower premium and the employer's HSA money win. The deductible barely matters."
      : "With a big expense, both plans hit or approach their limits, so the lower deductible and out-of-pocket max save more than the extra premiums cost.";
    document.getElementById("plan-feedback").innerHTML = `<div class="feedback">
      <p style="margin:0 0 8px"><strong>${ok ? "✅ Cheaper pick!" : "❌ The other plan was cheaper."}</strong> ${who.name}'s year:</p>
      <ul style="margin:0 0 10px;padding-left:20px">${who.year.map((e) => `<li>${e[0]}: ${money(e[1])}${e[2] ? " <em>(preventive, $0 to you)</em>" : ""}</li>`).join("")}</ul>
      <div class="plan-tables">${rows(0)}${rows(1)}</div>
      <p style="margin:10px 0 0">${lesson} Difference: <strong>${money(Math.abs(c[0].total - c[1].total))}</strong>.</p></div>
      <div style="text-align:center;margin-top:12px"><button class="btn btn-primary" data-next>${round + 1 < ROUNDS ? "Next person →" : "See results →"}</button></div>`;
  }

  function end() {
    const { best, isNew } = FG.recordBest("plans", correct);
    const xp = correct * 8;
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    root.innerHTML = `<div class="result">
      <div class="card-icon" style="font-size:2.4rem">☂️</div>
      <div class="big">${correct}/${ROUNDS}</div>
      <p class="small muted">${isNew ? "🏆 New best!" : "Best: " + best + "/" + ROUNDS} · +${xp} XP</p>
      <p>Picking the cheaper plan every time would have saved these ${ROUNDS} people <strong>${money(saved)}</strong> in total.</p>
      <div class="callout" style="text-align:left"><strong>Money lesson:</strong> compare the <em>total</em> yearly cost, not just the premium. If you expect little care, a high-deductible plan often wins, but only choose it if you could pay its out-of-pocket max. Learn more in the <a href="learn.html#insurance">Insurance 101 lesson</a>.</div>
      <button class="btn btn-primary" data-restart>Play again</button></div>`;
  }

  root.addEventListener("click", (e) => {
    const p = e.target.closest("[data-pick]");
    if (p) return pick(+p.dataset.pick);
    if (e.target.closest("[data-next]")) { round++; return round < ROUNDS ? next() : end(); }
    if (e.target.closest("[data-restart]")) start();
  });

  return { show() { if (round === undefined) start(); }, hide() {} };
})();
