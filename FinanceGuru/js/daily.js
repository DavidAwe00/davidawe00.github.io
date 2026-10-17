// Daily challenge, streaks, and badges. One question per day, drawn from the lesson quizzes
// (each lesson's facts are sourced on its page). Progress lives in this browser only.
const Daily = (() => {
  const KEY = "fg-daily-v1";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage blocked */ } };

  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const yesterdayKey = () => { const d = new Date(); d.setDate(d.getDate() - 1); return dayKey(d); };

  const POOL = LESSONS.flatMap((l) => l.quiz.map((q) => ({ ...q, lesson: l })));
  function todaysQuestion() {
    let h = 0;
    for (const ch of dayKey()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return POOL[h % POOL.length];
  }

  function state() {
    const s = load();
    // A streak survives only if the last answer was today or yesterday.
    const alive = s.last === dayKey() || s.last === yesterdayKey();
    return { streak: alive ? s.streak || 0 : 0, best: s.best || 0, last: s.last, today: s.today && s.today.day === dayKey() ? s.today : null, total: s.total || 0, correct: s.correct || 0 };
  }

  function answer(choice) {
    const s = load(), st = state();
    if (st.today) return st.today; // already answered today
    const q = todaysQuestion(), ok = choice === q.answer;
    s.streak = st.streak + 1;
    s.best = Math.max(st.best, s.streak);
    s.last = dayKey();
    s.total = (s.total || 0) + 1;
    s.correct = (s.correct || 0) + (ok ? 1 : 0);
    s.today = { day: dayKey(), choice, ok };
    save(s);
    FG.addXp(ok ? 15 : 5);
    return s.today;
  }

  function render(host) {
    const q = todaysQuestion(), st = state();
    const done = st.today;
    host.innerHTML = `
      <div class="daily-head">
        <div><span class="eyebrow" style="margin:0">Daily challenge</span><div class="small muted">${new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · from “${q.lesson.title}”</div></div>
        <div class="streak-pill" title="Answer every day to grow your streak">🔥 ${st.streak} day${st.streak === 1 ? "" : "s"}</div>
      </div>
      <p class="quiz-q" style="margin-top:12px">${q.q}</p>
      <div class="choices">${q.choices.map((c, i) => {
        const cls = done ? (i === q.answer ? "correct" : i === done.choice ? "wrong" : "") : "";
        return `<button class="choice ${cls}" data-daily="${i}" ${done ? "disabled" : ""}>${c}</button>`;
      }).join("")}</div>
      ${done ? `<div class="feedback" tabindex="-1" data-autofocus><strong>${done.ok ? "✅ Correct! +15 XP" : "❌ Not quite. +5 XP for showing up"}</strong> ${q.why}
        <div class="small muted" style="margin-top:6px">Come back tomorrow to keep your streak. <a href="learn.html#${q.lesson.id}">Review the lesson →</a></div></div>` : ""}`;
    host.onclick = (e) => {
      const b = e.target.closest("[data-daily]");
      if (!b || st.today) return;
      answer(+b.dataset.daily);
      render(host);
      document.dispatchEvent(new Event("progresschange"));
    };
  }

  return { state, render, todaysQuestion, dayKey };
})();
