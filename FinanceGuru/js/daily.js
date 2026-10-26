// Daily challenge, streaks, and badges. One question per day, drawn from the lesson quizzes
// (each lesson's facts are sourced on its page). Progress lives in this browser only.
// English or Spanish: the language is the Learn page's saved choice (fg-lang), and the Spanish
// lesson file is loaded only when it's needed. Answers and streaks are shared across languages.
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

  const T = {
    en: {
      title: "Daily challenge", from: "from", locale: undefined, streakTip: "Answer every day to grow your streak",
      days: (n) => `${n} day${n === 1 ? "" : "s"}`, right: "✅ Correct! +15 XP", wrong: "❌ Not quite. +5 XP for showing up",
      tomorrow: "Come back tomorrow to keep your streak.", review: "Review the lesson →", other: "Español", otherLang: "es", otherLabel: "Ver el reto en español",
    },
    es: {
      title: "Reto diario", from: "de", locale: "es", streakTip: "Responde cada día para hacer crecer tu racha",
      days: (n) => `${n} día${n === 1 ? "" : "s"}`, right: "✅ ¡Correcto! +15 XP", wrong: "❌ No exactamente. +5 XP por participar",
      tomorrow: "Vuelve mañana para mantener tu racha.", review: "Repasa la lección →", other: "English", otherLang: "en", otherLabel: "Show the challenge in English",
    },
  };
  // Returns a promise that settles once the card is drawn (Spanish may need a download first).
  function render(host) {
    const lang = FG.getLang();
    if (lang === "es" && typeof localizeLesson !== "function") {
      return FG.loadSpanish().then(() => render(host), () => { FG.setLang("en"); return render(host); });
    }
    const base = todaysQuestion(), st = state(), t = T[lang];
    const lesson = lang === "es" ? localizeLesson(base.lesson, "es") : base.lesson;
    const q = { ...base, ...lesson.quiz[base.lesson.quiz.findIndex((x) => x.q === base.q)], lesson };
    const done = st.today;
    host.lang = lang;
    host.innerHTML = `
      <div class="daily-head">
        <div><span class="eyebrow" style="margin:0">${t.title}</span><div class="small muted">${new Date().toLocaleDateString(t.locale, { weekday: "long", month: "long", day: "numeric" })} · ${t.from} “${q.lesson.title}”</div></div>
        <div class="daily-tools">
          <button type="button" class="chip" data-daily-lang="${t.otherLang}" lang="${t.otherLang}" aria-label="${t.otherLabel}">${t.other}</button>
          <div class="streak-pill" title="${t.streakTip}">🔥 ${t.days(st.streak)}</div>
        </div>
      </div>
      <p class="quiz-q" style="margin-top:12px">${q.q}</p>
      <div class="choices">${q.choices.map((c, i) => {
        const cls = done ? (i === q.answer ? "correct" : i === done.choice ? "wrong" : "") : "";
        return `<button class="choice ${cls}" data-daily="${i}" ${done ? "disabled" : ""}>${c}</button>`;
      }).join("")}</div>
      ${done ? `<div class="feedback" tabindex="-1" data-autofocus><strong>${done.ok ? t.right : t.wrong}</strong> ${q.why}
        <div class="small muted" style="margin-top:6px">${t.tomorrow} <a href="learn.html${lang === "es" ? "?lang=es" : ""}#${q.lesson.id}">${t.review}</a></div></div>` : ""}`;
    host.onclick = (e) => {
      const switcher = e.target.closest("[data-daily-lang]");
      if (switcher) {
        FG.setLang(switcher.dataset.dailyLang);
        render(host).then(() => host.querySelector("[data-daily-lang]")?.focus());
        return;
      }
      const b = e.target.closest("[data-daily]");
      if (!b || st.today) return;
      answer(+b.dataset.daily);
      render(host);
      document.dispatchEvent(new Event("progresschange"));
    };
    return Promise.resolve();
  }

  return { state, render, todaysQuestion, dayKey };
})();
