// Progress page: level, streak, stats, and badges — all computed from progress saved in this browser.
(function () {
  const $ = (id) => document.getElementById(id);
  const GAMES = ["catcher", "sorter", "life", "market", "salary", "prices", "credit", "envelope", "scam", "fees", "plans", "betting"];
  const LEVELS = [[0, "Rookie"], [100, "Saver"], [250, "Budgeter"], [500, "Planner"], [1000, "Investor"], [2000, "Wealth Builder"], [4000, "Money Guru"]];

  function badges(p, d) {
    const c = Checkup.state(), cap = Capstone.state();
    const done = Object.values(p.done);
    const played = GAMES.filter((g) => FG.getBest(g) > 0).length;
    const best = (g) => FG.getBest(g);
    return [
      ["👣", "First Steps", "Finish your first lesson", done.length >= 1],
      ["📚", "Halfway There", `Finish ${Math.ceil(LESSONS.length / 2)} lessons`, done.length >= Math.ceil(LESSONS.length / 2)],
      ["🎓", "Scholar", `Finish all ${LESSONS.length} lessons`, done.length >= LESSONS.length],
      ...UNITS.map((u, n) => [u.icon, `Unit ${n + 1}: ${u.title}`, `Finish all ${u.lessons.length} lessons in Unit ${n + 1}`, u.lessons.every((id) => p.done[id])]),
      ["🩺", "Check-up", "Take the Money Check-up", !!c.pre],
      ["🌱", "Growth Spurt", "Beat your \"before\" score on the Money Check-up", !!(c.pre && c.post && Checkup.scoreOf(c.post.answers) > Checkup.scoreOf(c.pre.answers))],
      ["🎓", "First Year", "Finish the capstone", cap.runs.length >= 1],
      ["🏅", "Five for Five", "Get all 5 units in the green in the capstone", cap.best >= 5],
      ["💯", "Perfect Score", "Ace any lesson quiz", done.some((x) => x.score === x.total)],
      ["📅", "Daily Habit", "Answer a daily challenge", d.total >= 1],
      ["🔥", "On Fire", "Reach a 3-day streak", d.best >= 3],
      ["⚡", "Unstoppable", "Reach a 7-day streak", d.best >= 7],
      ["🏆", "Legend", "Reach a 30-day streak", d.best >= 30],
      ["🎮", "Player One", "Play any game", played >= 1],
      ["🕹️", "Arcade Regular", "Play 4 different games", played >= 4],
      ["👾", "Arcade Master", `Play all ${GAMES.length} games`, played >= GAMES.length],
      ["🐷", "Piggy Bank Pro", "Save $500+ in Piggy Bank Catcher", best("catcher") >= 500],
      ["📊", "Credit Climber", "Finish Credit Score Quest at 760+", best("credit") >= 760],
      ["✉️", "Budget Boss", "Score 2,000+ in Envelope Budget", best("envelope") >= 2000],
      ["🛡️", "Scam-Proof", "Spot all 10 in Spot the Scam", best("scam") >= 10],
      ["🔎", "Fee Hunter", "Score 6+ in Fee Hunter", best("fees") >= 6],
      ["☂️", "Well Covered", "Pick the cheaper plan 5/5 times in Plan Picker", best("plans") >= 5],
      ["🎢", "Steady Hands", "Finish the Market Rollercoaster", best("market") > 0],
      ["⭐", "Rising Star", "Earn 100 XP", p.xp >= 100],
      ["🌟", "Star Student", "Earn 500 XP", p.xp >= 500],
      ["💎", "Money Guru", "Earn 4,000 XP", p.xp >= 4000],
    ];
  }

  function render() {
    const p = FG.getProgress(), d = Daily.state();
    const li = LEVELS.reduce((k, [min], i) => (p.xp >= min ? i : k), 0);
    const [min, name] = LEVELS[li], next = LEVELS[li + 1];
    const pct = next ? ((p.xp - min) / (next[0] - min)) * 100 : 100;
    $("lvl").innerHTML = `
      <div class="gauge-top"><div><div class="small muted">Level ${li + 1}</div><div class="gauge-num" style="font-size:2.4rem">${name}</div></div><span class="badge done" style="font-size:1rem">${p.xp} XP</span></div>
      <div class="meter" style="height:12px;margin-top:12px"><span style="width:${pct}%;background:var(--brand)"></span></div>
      <div class="small muted" style="margin-top:6px">${next ? `${next[0] - p.xp} XP to ${next[1]}` : "Top level reached!"}</div>`;
    const done = Object.keys(p.done).length;
    $("pstats").innerHTML = `
      <div class="stat hero"><div class="label">Current streak</div><div class="value">🔥 ${d.streak}</div></div>
      <div class="stat"><div class="label">Best streak</div><div class="value">${d.best}</div></div>
      <div class="stat"><div class="label">Lessons finished</div><div class="value">${done}/${LESSONS.length}</div></div>
      <div class="stat"><div class="label">Daily accuracy</div><div class="value">${d.total ? Math.round((d.correct / d.total) * 100) + "%" : "—"}</div></div>`;
    const left = LESSONS.length - done;
    $("cert-status").textContent = left ? `Finish ${left} more lesson${left > 1 ? "s" : ""} to unlock it.` : "Unlocked — print it or share it!";
    $("cert-link").textContent = left ? "Preview →" : "Get your certificate →";
    const c = Checkup.state(), n = Checkup.QUESTIONS.length;
    $("checkup-status").textContent = c.post ? `Before ${Checkup.scoreOf(c.pre.answers)}/${n} → after ${Checkup.scoreOf(c.post.answers)}/${n}`
      : c.pre ? `Before: ${Checkup.scoreOf(c.pre.answers)}/${n}. Take the "after" check-up when you finish the lessons.`
      : "10 questions to take before the lessons and again after.";
    $("checkup-link").textContent = c.post ? "See your results →" : c.pre ? "Take the \"after\" check-up →" : "Take the check-up →";
    const cap = Capstone.state(), last = cap.runs.at(-1);
    $("capstone-status").textContent = last ? `Best: ${cap.best}/5 units in the green · last net worth ${FG.money(Math.round(last.netWorth))}`
      : "Seven decisions, one year on a $50,000 salary, and a report card for every unit.";
    $("capstone-link").textContent = last ? "Play again →" : "Start the capstone →";
    const list = badges(p, d);
    const earned = list.filter((b) => b[3]).length;
    $("badge-count").textContent = `${earned} of ${list.length} earned`;
    $("badge-grid").innerHTML = list.map(([e, n, how, ok]) => `
      <div class="badge-tile ${ok ? "earned" : ""}" title="${how}">
        <div class="badge-icon">${ok ? e : "🔒"}</div><strong>${n}</strong><span class="small muted">${how}</span>
      </div>`).join("");
  }

  Daily.render($("daily"));
  render();
  document.addEventListener("progresschange", render);
})();
