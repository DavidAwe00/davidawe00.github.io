// Lesson player: reading cards -> quiz -> results. English or Spanish (js/lessons.es.js);
// progress is keyed by lesson id, so it's shared across languages.
(function () {
  const list = document.getElementById("lesson-list");
  const body = document.getElementById("lesson-body");
  const LANG_KEY = "fg-lang";
  let lesson, step, score, answered, firstRender = true, checked = null;  // checked: the server's reply to the latest class answer

  const T = {
    en: {
      lessons: "Lessons", of: "of", back: "← Back", next: "Next →", takeQuiz: "Take the quiz →",
      quizQ: (i, n) => `Quiz · question ${i} of ${n}`, nextQ: "Next question →", seeResults: "See results →",
      correct: "✅ Correct!", wrong: "❌ Not quite.",
      perfect: "Perfect score! 🏆", great: "Great job! 🎉", effort: "Nice effort — review and try again anytime.",
      earned: (xp) => `You earned <strong>+${xp} XP</strong>.`, retry: "Retry lesson",
      checked: (s, n) => `🏫 Your teacher sees your first try: <strong>${s}/${n}</strong>. Retakes are for practice.`, checkedLater: "🏫 Your answers will reach your teacher when you're back online.",
      cert: "🎓 Get your certificate →", unitDone: (n, title) => `🏅 Unit ${n} complete: ${title}! You earned a badge.`,
      backup: "Your progress is saved only in this browser. <a href=\"badges.html#backup\">Download a backup</a> so you don’t lose it.",
      checkup: "🩺 Take the \"after\" check-up →", capstone: "🎓 Capstone: your first year →", nextL: (t) => `Next: ${t} →`, finish: "Finish the remaining lessons →",
      title: "Learn — MoneyExplained", langGroup: "Lesson language", assigned: "Assigned", due: (d) => `Due ${d}`, watch: "Prefer to watch? This lesson has a video.",
    },
    es: {
      lessons: "Lecciones", of: "de", back: "← Atrás", next: "Siguiente →", takeQuiz: "Hacer el quiz →",
      quizQ: (i, n) => `Quiz · pregunta ${i} de ${n}`, nextQ: "Siguiente pregunta →", seeResults: "Ver resultados →",
      correct: "✅ ¡Correcto!", wrong: "❌ No exactamente.",
      perfect: "¡Puntaje perfecto! 🏆", great: "¡Muy bien! 🎉", effort: "Buen intento: repasa y vuelve a intentarlo cuando quieras.",
      earned: (xp) => `Ganaste <strong>+${xp} XP</strong>.`, retry: "Repetir la lección",
      checked: (s, n) => `🏫 Tu docente ve tu primer intento: <strong>${s}/${n}</strong>. Repetir sirve para practicar.`, checkedLater: "🏫 Tus respuestas le llegarán a tu docente cuando vuelvas a estar en línea.",
      cert: "🎓 Obtén tu certificado →", unitDone: (n, title) => `🏅 ¡Unidad ${n} completa: ${title}! Ganaste una insignia.`,
      backup: "Tu progreso solo se guarda en este navegador. <a href=\"badges.html#backup\">Descarga una copia de seguridad</a> para no perderlo.",
      checkup: "🩺 Haz el chequeo final →", capstone: "🎓 Proyecto final: tu primer año (en inglés) →", nextL: (t) => `Siguiente: ${t} →`, finish: "Termina las lecciones que faltan →",
      title: "Aprende — MoneyExplained", langGroup: "Idioma de la lección", assigned: "Asignada", due: (d) => `Para el ${d}`, watch: "¿Prefieres verlo? Esta lección tiene un video.",
    },
  };

  // ?lang=es in a shared link wins and is remembered; otherwise use the saved choice.
  let lang = new URLSearchParams(location.search).get("lang");
  try {
    if (lang === "es" || lang === "en") localStorage.setItem(LANG_KEY, lang);
    else lang = localStorage.getItem(LANG_KEY);
  } catch { /* storage blocked */ }
  if (lang !== "es") lang = "en";
  const t = () => T[lang];
  const L = (l) => localizeLesson(l, lang);

  function renderLang() {
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lang === lang));
    document.getElementById("lesson-nav-title").textContent = t().lessons;
    list.lang = body.lang = lang;
    document.title = t().title;
    FG.setChromeLang(lang);
    document.querySelector(".lang-switch").setAttribute("aria-label", t().langGroup);
  }

  function renderNav() {
    const p = FG.getProgress();
    const assigned = typeof ClassSync === "object" ? ClassSync.assigned() : [];  // from the student's class, if any
    list.innerHTML = LESSONS.map((l) => `
      <li><button data-id="${l.id}" ${lesson && lesson.id === l.id ? 'aria-current="true"' : ""}>
        <span class="check ${p.done[l.id] ? "done" : ""}">${p.done[l.id] ? "✓" : ""}</span>${L(l).title}
        ${assigned.includes(l.id) && !p.done[l.id] ? `<span class="lesson-tag">${ClassSync.assignedDue() ? t().due(ClassSync.dueLabel(lang)) : t().assigned}</span>` : ""}
      </button></li>`).join("");
  }

  document.addEventListener("classchange", () => renderNav());
  list.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-id]");
    if (!btn) return;
    if (location.hash.slice(1) === btn.dataset.id) open(btn.dataset.id);
    else location.hash = btn.dataset.id;
  });

  document.querySelector(".lang-switch").addEventListener("click", (e) => {
    const b = e.target.closest("[data-lang]");
    if (!b || b.dataset.lang === lang) return;
    lang = b.dataset.lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch { /* storage blocked */ }
    const url = new URL(location.href);
    url.searchParams.delete("lang");
    history.replaceState(null, "", url);
    renderLang();
    lesson = L(LESSONS.find((l) => l.id === lesson.id));
    // Mid-quiz or on results, restart the quiz so a question can't be scored twice (or XP awarded twice).
    if (step >= lesson.cards.length) { step = lesson.cards.length; score = 0; }
    renderNav();
    render();
  });

  function open(id) {
    lesson = L(LESSONS.find((l) => l.id === id) || LESSONS[0]);
    step = 0;
    score = 0;
    checked = null;
    renderNav();
    render();
  }

  // Steps: 0..cards-1 are reading cards, then one step per quiz question, then results.
  const totalSteps = () => lesson.cards.length + lesson.quiz.length;

  function dots() {
    return `<div class="step-dots" aria-hidden="true">${Array.from({ length: totalSteps() }, (_, i) =>
      `<span class="${i <= step ? "on" : ""}"></span>`).join("")}</div>`;
  }

  function render() {
    answered = false;
    const nCards = lesson.cards.length;
    if (step < nCards) {
      const c = lesson.cards[step];
      const video = step === 0 && typeof VideoPlayer === "object" ? VideoPlayer.forLesson(lesson.id, lang) : null;
      body.innerHTML = `
        <h1 class="lesson-meta small muted">${lesson.icon} ${lesson.title} <span>· ${step + 1} ${t().of} ${nCards}</span></h1>
        ${dots()}
        <article><h2 tabindex="-1" data-autofocus>${c.heading}</h2>${c.html}</article>
        ${video ? `<details class="lesson-video"><summary>🎬 ${t().watch}</summary>${VideoPlayer.poster(video, lang)}</details>` : ""}
        <div class="step-actions">
          <button class="btn btn-ghost" data-act="back" ${step === 0 ? "disabled" : ""}>${t().back}</button>
          <button class="btn btn-primary" data-act="next">${step === nCards - 1 ? t().takeQuiz : t().next}</button>
        </div>`;
    } else if (step < totalSteps()) {
      const qi = step - nCards;
      const q = lesson.quiz[qi];
      body.innerHTML = `
        <h1 class="lesson-meta small muted">${lesson.icon} ${lesson.title} <span>· ${t().quizQ(qi + 1, lesson.quiz.length)}</span></h1>
        ${dots()}
        <article>
          <p class="quiz-q" tabindex="-1" data-autofocus>${q.q}</p>
          <div class="choices">${q.choices.map((c, i) => `<button class="choice" data-choice="${i}">${c}</button>`).join("")}</div>
          <div id="feedback" aria-live="polite"></div>
        </article>
        <div class="step-actions">
          <span></span>
          <button class="btn btn-primary" data-act="next" disabled>${qi === lesson.quiz.length - 1 ? t().seeResults : t().nextQ}</button>
        </div>`;
    } else {
      const total = lesson.quiz.length;
      const earned = FG.completeLesson(lesson.id, score, total);
      renderNav();
      const idx = LESSONS.findIndex((l) => l.id === lesson.id);
      const next = LESSONS[idx + 1] && L(LESSONS[idx + 1]);
      const msg = score === total ? t().perfect : score >= total - 1 ? t().great : t().effort;
      const allDone = LESSONS.every((l) => FG.getProgress().done[l.id]);
      const ui = UNITS.findIndex((u) => u.lessons.includes(lesson.id));
      const unitDone = ui >= 0 && UNITS[ui].lessons.every((id) => FG.getProgress().done[id]);
      // Finishing a unit is when losing progress would hurt: suggest a backup unless one was made in the last 14 days.
      let lastBackup = 0; try { lastBackup = Date.parse(localStorage.getItem("fg-last-backup")) || 0; } catch { /* storage blocked */ }
      const suggestBackup = unitDone && Date.now() - lastBackup > 14 * 864e5;
      body.innerHTML = `
        <div class="card result">
          <div class="big">${score}/${total}</div>
          <h2 tabindex="-1" data-autofocus>${msg}</h2>
          <p class="muted">${t().earned(earned)}</p>
          ${unitDone ? `<p class="unit-done-note">${t().unitDone(ui + 1, lang === "es" ? UNITS_ES[UNITS[ui].id] : UNITS[ui].title)}</p>` : ""}
          ${suggestBackup ? `<p class="backup-nudge small">${t().backup}</p>` : ""}
          <div class="hero-actions" style="justify-content:center">
            <button class="btn btn-ghost" data-act="retry">${t().retry}</button>
            ${allDone ? `<a class="btn btn-primary" href="certificate.html">${t().cert}</a><a class="btn btn-ghost" href="capstone.html">${t().capstone}</a><a class="btn btn-ghost" href="checkup.html">${t().checkup}</a>` : ""}
            ${next ? `<a class="btn ${allDone ? "btn-ghost" : "btn-primary"}" href="#${next.id}">${t().nextL(next.title)}</a>`
                   : allDone ? "" : `<a class="btn btn-primary" href="learn.html#${LESSONS.find((l) => !FG.getProgress().done[l.id]).id}">${t().finish}</a>`}
          </div>
          <div data-feedback hidden></div>
        </div>`;
      // In a class: once the last answer is checked, say which score the teacher sees.
      if (checked) {
        const shownFor = lesson.id, note = document.createElement("p");
        note.className = "small class-checked"; note.setAttribute("role", "status");
        body.querySelector(".result .muted").after(note);
        checked.then((r) => {
          if (lesson.id !== shownFor || !note.isConnected) return;
          note.innerHTML = r && r.lesson === shownFor && r.complete ? t().checked(r.score, r.total) : r && r.member === false ? "" : t().checkedLater;
        });
        checked = null;
      }
      FG.feedback(body.querySelector("[data-feedback]"), `lesson/${lesson.id}`, lesson.title, lang);
    }
    // Don't jump past the page header on first load; after that, keep each step in view.
    if (firstRender) firstRender = false;
    else FG.scrollTo(body);
  }

  body.addEventListener("click", (e) => {
    const choice = e.target.closest("[data-choice]");
    if (choice && !answered) {
      answered = true;
      const q = lesson.quiz[step - lesson.cards.length];
      const picked = +choice.dataset.choice;
      const buttons = body.querySelectorAll(".choice");
      buttons.forEach((b, i) => {
        b.disabled = true;
        if (i === q.answer) b.classList.add("correct");
        else if (i === picked) b.classList.add("wrong");
      });
      const right = picked === q.answer;
      if (right) score++;
      // In a class, the server checks the answer too; the first answer to each question is what the teacher sees.
      if (typeof ClassSync === "object" && ClassSync.load()) checked = ClassSync.answer(lesson.id, step - lesson.cards.length, picked);
      document.getElementById("feedback").innerHTML =
        `<div class="feedback"><strong>${right ? t().correct : t().wrong}</strong> ${q.why}</div>`;
      const nextBtn = body.querySelector('[data-act="next"]');
      nextBtn.disabled = false;
      nextBtn.focus({ preventScroll: true });
      return;
    }
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "next") { step++; render(); }
    if (act === "back") { step--; render(); }
    if (act === "retry") { step = 0; score = 0; render(); }
  });

  window.addEventListener("hashchange", () => open(location.hash.slice(1)));
  renderLang();
  open(location.hash.slice(1));
})();
