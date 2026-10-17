// Envelope Budget — drag each expense into Needs / Wants / Savings (or skip it) before payday.
// Lesson: the 50/30/20 guideline (Warren & Warren Tyagi, "All Your Worth", 2005) — and that you
// usually can't afford every want.
window.Games = window.Games || {};
Games.envelope = (() => {
  const root = document.getElementById("env-root");
  const INCOME = 3200; // sample monthly take-home pay (made-up budget, not a statistic)
  const ENVS = [
    { key: "need", name: "Needs", emoji: "🏠", pct: 0.5, color: "--series-1" },
    { key: "want", name: "Wants", emoji: "🎉", pct: 0.3, color: "--series-2" },
    { key: "save", name: "Savings & debt", emoji: "🌱", pct: 0.2, color: "--series-3" },
  ];
  // Sample expenses for one month.
  const CARDS = [
    ["🏠", "Rent", 875, "need", "Housing is a core need."],
    ["🛒", "Groceries", 320, "need", "Food at home is a need."],
    ["💡", "Electric & water", 120, "need", "Utilities keep your home running."],
    ["📱", "Basic phone plan", 45, "need", "A basic plan is essential for work and safety."],
    ["🚌", "Bus pass & gas", 90, "need", "Getting to work protects your income."],
    ["🎓", "Student loan minimum", 150, "need", "Minimum payments are required — missing them hurts your credit."],
    ["📺", "Streaming bundle", 25, "want", "Entertainment is a want."],
    ["🍣", "Dinners out", 180, "want", "Restaurant meals are a want (groceries are the need)."],
    ["🎤", "Concert tickets", 120, "want", "Fun, but optional."],
    ["👟", "New sneakers", 140, "want", "You own shoes — new ones are a want."],
    ["🏋️", "Boutique gym", 60, "want", "Exercise can be free; a premium gym is a want."],
    ["☕", "Coffee shop runs", 70, "want", "Daily lattes add up — a want."],
    ["🎮", "New video game", 70, "want", "A want."],
    ["🧳", "Weekend getaway", 350, "want", "Travel is a want — plan and save for it."],
    ["🛟", "Emergency fund", 300, "save", "Savings: your cushion for surprises."],
    ["🌱", "Roth IRA", 250, "save", "Investing for retirement belongs in the 20%."],
    ["💳", "Extra loan payment", 90, "save", "Paying debt down faster counts toward the 20% bucket."],
  ];

  let deck, i, totals, score, wrong, skipped, locked;
  const shuffle = (a) => { for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };

  function start() {
    deck = shuffle([...CARDS]);
    i = 0; score = 0; wrong = 0; skipped = [];
    totals = { need: 0, want: 0, save: 0 };
    root.innerHTML = `
      <div class="env-top">
        <div class="small muted">Payday! Take-home pay: <strong>${FG.money(INCOME)}</strong> · Left to assign: <strong id="env-left"></strong></div>
        <div class="step-dots" id="env-dots"></div>
      </div>
      <div class="env-stage">
        <div class="env-card-slot" id="env-slot"></div>
        <div class="env-feedback small" id="env-fb" aria-live="polite">Drag the expense into an envelope — or tap one.</div>
      </div>
      <div class="env-row">
        ${ENVS.map((e) => `<button class="envelope" data-env="${e.key}" style="--env:var(${e.color})">
          <span class="env-name">${e.emoji} ${e.name}</span>
          <span class="env-goal">Goal ${Math.round(e.pct * 100)}%: ${FG.money(INCOME * e.pct)}</span>
          <span class="env-meter"><span data-fill="${e.key}"></span><i></i></span>
          <span class="env-amt" data-amt="${e.key}">$0</span>
        </button>`).join("")}
        <button class="envelope skip" data-env="skip"><span class="env-name">🗑️ Skip it</span><span class="env-goal">Not this month</span><span class="env-amt" id="env-skipped">$0 skipped</span></button>
      </div>`;
    showCard();
  }

  const placed = () => totals.need + totals.want + totals.save;

  function updateEnvelopes() {
    ENVS.forEach((e) => {
      const goal = INCOME * e.pct, v = totals[e.key];
      const fill = root.querySelector(`[data-fill="${e.key}"]`);
      fill.style.width = Math.min(100, (v / (goal * 1.5)) * 100) + "%";
      fill.parentElement.classList.toggle("over", e.key === "want" ? v > goal : false);
      root.querySelector(`[data-amt="${e.key}"]`).textContent = `${FG.money(v)} · ${Math.round((v / INCOME) * 100)}%`;
    });
    const left = INCOME - placed();
    const el = document.getElementById("env-left");
    el.textContent = FG.money(left);
    el.style.color = left < 0 ? "var(--bad)" : "";
    document.getElementById("env-skipped").textContent = `${FG.money(skipped.reduce((t, c) => t + c[2], 0))} skipped`;
    document.getElementById("env-dots").innerHTML = deck.map((_, k) => `<span class="${k < i ? "on" : ""}"></span>`).join("");
  }

  function showCard() {
    updateEnvelopes();
    if (i >= deck.length) return end();
    const c = deck[i];
    document.getElementById("env-slot").innerHTML = `<div class="sort-card env-card" id="env-card" tabindex="0" aria-label="${c[1]}, ${FG.money(c[2])}">
      <div class="emoji">${c[0]}</div><div class="name">${c[1]}</div><div class="env-price">${FG.money(c[2])}</div></div>`;
    locked = false;
    bindDrag(document.getElementById("env-card"));
  }

  function choose(env) {
    if (locked || i >= deck.length) return;
    const c = deck[i], fb = document.getElementById("env-fb");
    const [, name, amt, cat, why] = c;
    if (env === "skip") {
      if (cat === "need") { score -= 25; fb.innerHTML = `<span class="delta down">🚫 You can't skip ${name.toLowerCase()}!</span> ${why}`; shake(); return; }
      skipped.push(c);
      if (cat === "want") { score += 50; fb.innerHTML = `<span class="delta up">✓ Skipped ${name} — ${FG.money(amt)} stays free.</span> Cutting wants is the easiest way to balance a budget.`; }
      else { score -= 50; fb.innerHTML = `<span class="delta down">Skipped savings.</span> Future you loses ${FG.money(amt)} this month. Pay yourself first!`; }
    } else if (env === cat) {
      score += 100; totals[cat] += amt;
      fb.innerHTML = `<span class="delta up">✓ ${name} → ${ENVS.find((e) => e.key === cat).name}.</span> ${why}`;
    } else {
      score -= 50; wrong++; totals[cat] += amt;
      fb.innerHTML = `<span class="delta down">✗ ${name} belongs in ${ENVS.find((e) => e.key === cat).name}.</span> ${why} (Moved it for you.)`;
    }
    locked = true;
    const card = document.getElementById("env-card");
    card.style.transition = "transform .25s ease, opacity .25s ease";
    card.style.transform = "scale(.6) translateY(80px)";
    card.style.opacity = 0;
    i++;
    setTimeout(showCard, 260);
  }
  function shake() { const c = document.getElementById("env-card"); c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake"); }

  // Pointer-based drag (works for mouse and touch). Tapping an envelope also works.
  function bindDrag(card) {
    let sx, sy, dragging = false;
    card.addEventListener("pointerdown", (e) => { if (locked) return; dragging = true; sx = e.clientX; sy = e.clientY; try { card.setPointerCapture(e.pointerId); } catch { /* capture unsupported */ } card.style.transition = "none"; card.classList.add("dragging"); });
    card.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      card.style.transform = `translate(${e.clientX - sx}px, ${e.clientY - sy}px) rotate(${(e.clientX - sx) / 30}deg)`;
      root.querySelectorAll(".envelope").forEach((b) => b.classList.remove("hover"));
      const t = targetAt(card, e.clientX, e.clientY);
      if (t) t.classList.add("hover");
    });
    card.addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false; card.classList.remove("dragging");
      root.querySelectorAll(".envelope").forEach((b) => b.classList.remove("hover"));
      const t = targetAt(card, e.clientX, e.clientY);
      if (t) choose(t.dataset.env);
      else { card.style.transition = "transform .2s ease"; card.style.transform = ""; }
    });
  }
  function targetAt(card, x, y) {
    card.style.pointerEvents = "none";
    const el = document.elementFromPoint(x, y);
    card.style.pointerEvents = "";
    return el && el.closest(".envelope");
  }

  function end() {
    const wantGoal = INCOME * 0.3, saveGoal = INCOME * 0.2;
    let left = INCOME - placed();
    const checks = [
      [totals.want <= wantGoal, `Wants: ${FG.money(totals.want)} of the ${FG.money(wantGoal)} goal`, 200],
      [totals.save >= saveGoal, `Savings & debt: ${FG.money(totals.save)} (goal ${FG.money(saveGoal)})`, 200],
      [left >= 0, left >= 0 ? `Spent no more than you earned (${FG.money(left)} left over)` : `Overspent by ${FG.money(-left)} — that would land on a credit card`, left >= 0 ? 100 : -200],
    ];
    checks.forEach(([ok, , pts]) => { if (ok || pts < 0) score += pts; });
    const stars = checks.filter(([ok]) => ok).length - (wrong > 1 ? 1 : 0);
    const { best, isNew } = FG.recordBest("envelope", score);
    const xp = Math.max(5, Math.min(50, Math.round(score / 40)));
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    root.querySelector(".env-stage").innerHTML = `<div class="result" style="padding:8px">
      <div class="env-stars">${"⭐".repeat(Math.max(0, stars))}${"☆".repeat(3 - Math.max(0, stars))}</div>
      <div class="big">${score} pts</div>
      <p class="small muted">${isNew ? "🏆 New best!" : "Best: " + best} · +${xp} XP · ${wrong} misfiled</p>
      <ul class="env-checks">${checks.map(([ok, label]) => `<li>${ok ? "✅" : "❌"} ${label}</li>`).join("")}</ul>
      ${left > 0 ? `<p class="small">💡 Got ${FG.money(left)} left? Give every dollar a job — move it to savings.</p>` : ""}
      <div class="callout" style="text-align:left"><strong>Money lesson:</strong> the 50/30/20 guideline — 50% needs, 30% wants, 20% savings and extra debt payments — is a starting point, not a law. The real skill is the one you just practiced: you can't fund every want, so decide what matters most <em>before</em> payday.</div>
      <button class="btn btn-primary" data-restart>Play again</button></div>`;
  }

  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-restart]")) return start();
    const env = e.target.closest("[data-env]");
    if (env) choose(env.dataset.env);
  });
  addEventListener("keydown", (e) => {
    if (document.getElementById("game-envelope").hidden || !document.getElementById("env-card")) return;
    const map = { 1: "need", 2: "want", 3: "save", s: "skip", S: "skip" };
    if (map[e.key]) { e.preventDefault(); choose(map[e.key]); }
  });

  return { show() { if (!deck) start(); }, hide() {} };
})();
