// Salary Showdown — higher or lower, using real median pay data.
// Lesson: what you study and which career you choose are huge financial decisions.
window.Games = window.Games || {};
Games.salary = (() => {
  const root = document.getElementById("hl-root");
  const $streak = document.getElementById("hl-streak");
  const MAJOR_EMOJI = { Engineering: "⚙️", "Tech & Math": "💻", Business: "📊", "Health & Science": "🔬", Education: "🍎" };

  const POOL = [
    ...MAJORS.map((m) => ({ emoji: MAJOR_EMOJI[m.group] || "📚", name: `${m.name} major`, what: "Median pay at mid-career (ages 35–45)", pay: m.mid })),
    ...MAJORS.map((m) => ({ emoji: MAJOR_EMOJI[m.group] || "📚", name: `${m.name} major`, what: "Median starting pay (ages 22–27)", pay: m.early })),
    ...(typeof OCCUPATIONS !== "undefined" ? OCCUPATIONS.map((o) => ({ emoji: o.emoji, name: o.name, what: `Median pay · ${EDU_LEVELS.find((e) => e.key === o.edu).label.toLowerCase()}`, pay: o.pay }))
      : CAREERS.map((c) => ({ emoji: c.emoji, name: c.name, what: `Median pay · ${c.edu.toLowerCase()}`, pay: c.pay }))),
  ];

  let left, right, streak = 0, used, locked = false;

  function pick() {
    for (let tries = 0; tries < 200; tries++) {
      const c = POOL[Math.floor(Math.random() * POOL.length)];
      if (!used.has(c) && Math.abs(c.pay - left.pay) >= 3000) { used.add(c); return c; }
    }
    return POOL.find((c) => !used.has(c)) || POOL[0];
  }

  function start() {
    used = new Set();
    left = POOL[Math.floor(Math.random() * POOL.length)];
    used.add(left);
    right = pick();
    streak = 0;
    render();
  }

  const card = (c, reveal) => `
    <div class="card hl-card">
      <div class="emoji">${c.emoji}</div>
      <div class="name">${c.name}</div>
      <div class="small muted">${c.what}</div>
      <div class="pay" data-pay>${reveal ? FG.money(c.pay) : "?"}</div>
      ${reveal ? "" : `<div class="sort-buttons"><button class="btn btn-buy" data-guess="higher">▲ Higher</button><button class="btn btn-sell" data-guess="lower">▼ Lower</button></div>`}
    </div>`;

  function render(msg = "") {
    $streak.textContent = "🔥 Streak " + streak;
    root.innerHTML = `<div class="hl-game">${card(left, true)}<div class="hl-vs">vs</div>${card(right, false)}</div>
      <p class="small muted" style="text-align:center;margin:12px 0 0" aria-live="polite">${msg || "Does the right side pay more or less?"}</p>`;
    locked = false;
  }

  function guess(dir) {
    if (locked) return;
    locked = true;
    const ok = (dir === "higher") === (right.pay > left.pay);
    const payEl = root.querySelectorAll("[data-pay]")[1];
    payEl.textContent = FG.money(right.pay);
    root.querySelectorAll("[data-guess]").forEach((b) => (b.disabled = true));
    if (ok) {
      streak++;
      const diff = Math.abs(right.pay - left.pay);
      setTimeout(() => {
        left = right;
        right = pick();
        render(`✅ Correct! A difference of ${FG.money(diff)} a year — about ${FG.money(diff * 30)} over a 30-year career.`);
      }, 900);
    } else setTimeout(end, 900);
  }

  function end() {
    const { best, isNew } = FG.recordBest("salary", streak);
    const xp = Math.min(45, streak * 3);
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    root.innerHTML = `<div class="result">
      <div class="card-icon" style="font-size:2.4rem">💼</div>
      <h3>${right.name} ${right.pay > left.pay ? "pays more" : "pays less"}: ${FG.money(right.pay)} vs ${FG.money(left.pay)}</h3>
      <div class="big">${streak} in a row</div>
      <p class="small muted">${isNew ? "🏆 New best!" : "Best: " + best} · +${xp} XP</p>
      <div class="callout" style="text-align:left"><strong>Money lesson:</strong> your career is your biggest wealth-building tool. Explore every major's pay, unemployment, and ROI in the <a href="college.html#majors">College &amp; Careers hub</a>.</div>
      <button class="btn btn-primary" data-restart>Play again</button></div>`;
  }

  root.addEventListener("click", (e) => {
    const g = e.target.closest("[data-guess]");
    if (g) guess(g.dataset.guess);
    if (e.target.closest("[data-restart]")) start();
  });
  addEventListener("keydown", (e) => {
    if (document.getElementById("game-salary").hidden || !root.querySelector("[data-guess]:not([disabled])")) return;
    if (e.key === "ArrowUp") { e.preventDefault(); guess("higher"); }
    if (e.key === "ArrowDown") { e.preventDefault(); guess("lower"); }
  });

  return { show() { if (!left) start(); }, hide() {} };
})();
