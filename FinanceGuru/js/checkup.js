// Money Check-up: a 10-question pre/post test, two concept questions per unit, drawn from the
// lesson quizzes (each fact is sourced on its lesson page). Answers stay hidden until the end so
// the "before" score is a fair baseline. Results live in this browser only.
// English or Spanish (the saved lesson language, js/lessons.es.js). Answers are stored by choice
// position, so a "before" in one language compares fairly with an "after" in the other.
const Checkup = (() => {
  const KEY = "fg-checkup-v1";
  // [lesson id, quiz question index] — concepts over number trivia, so a pre-test isn't a memory test.
  const PICKS = [
    ["budgeting", 0], ["taxes-101", 0],
    ["emergency-fund", 1], ["scams", 0],
    ["debt", 0], ["credit", 0],
    ["compound-interest", 0], ["investing", 0],
    ["rent-vs-buy", 0], ["car-buying", 0],
  ];
  const unitOf = (id) => UNITS.findIndex((u) => u.lessons.includes(id));
  const QUESTIONS = PICKS.map(([id, i]) => {
    const lesson = LESSONS.find((l) => l.id === id);
    return { ...lesson.quiz[i], lesson, unit: unitOf(id), index: i };
  });

  const T = {
    en: {
      title: "🩺 Money Check-up", locale: undefined,
      intro: "Ten questions, two from each unit. Take it <strong>before</strong> you start the lessons and again <strong>after</strong> to see how much you've learned. Answers stay hidden until the end, and results are saved in this browser only.",
      unit: (n, title) => `Unit ${n}: ${title}`, before: "before", after: "after", Before: "Before", After: "After",
      review: "Review your answers", youSaid: "You said:", answer: "Answer:", lessonLink: (t) => `${t} lesson →`,
      startTitle: 'Start with the "before" check-up',
      startLead: (done) => `About 5 minutes. Don't worry about your score — it's a starting line, not a grade.${done ? ` You've already finished ${done} lesson${done > 1 ? "s" : ""}, so this baseline may be higher than a true "before."` : ""}`,
      start: "Start the check-up →", beforeScore: 'Your "before" score',
      taken: (d, done, total, left) => `Taken ${d}. ${left ? `Finish the lessons (${done}/${total} done), then come back for the "after" check-up.` : 'You\'ve finished every lesson — time for the "after" check-up!'}`,
      startWith: (u) => `Start with ${u} →`, takeAfter: (left) => `Take the "after" check-up${left ? " now" : " →"}`,
      byUnit: "By unit", weakest: (u) => `Your weakest unit was <strong>${u}</strong>, so that's a good place to start. Answers stay hidden until the "after" check-up so it's a fair comparison.`,
      improved: (g) => `You improved by ${g} question${g > 1 ? "s" : ""}! 📈`, perfect: "Perfect both times! 🏆", same: "Same score as before", lower: "A little lower this time",
      retryHint: ' Review the explanations below and revisit those lessons, then retake the "after" check-up.',
      retake: 'Retake "after"', reset: "Start over", bars: "Gray bar: before. Green bar: after.",
      progress: (phase, n, of) => `${phase === "pre" ? "Before" : "After"} check-up · question ${n} of ${of}`,
      back: "← Back", skip: "I don't know →", confirm: "Clear both check-up scores and start over?", langGroup: "Check-up language",
    },
    es: {
      title: "🩺 Chequeo de dinero", locale: "es",
      intro: "Diez preguntas, dos de cada unidad. Hazlo <strong>antes</strong> de empezar las lecciones y otra vez <strong>después</strong> para ver cuánto aprendiste. Las respuestas se muestran al final, y los resultados se guardan solo en este navegador.",
      unit: (n, title) => `Unidad ${n}: ${title}`, before: "antes", after: "después", Before: "Antes", After: "Después",
      review: "Revisa tus respuestas", youSaid: "Respondiste:", answer: "Respuesta:", lessonLink: (t) => `Lección: ${t} →`,
      startTitle: "Empieza con el chequeo inicial",
      startLead: (done) => `Unos 5 minutos. No te preocupes por el puntaje: es un punto de partida, no una calificación.${done ? ` Ya terminaste ${done} ${done > 1 ? "lecciones" : "lección"}, así que este punto de partida puede salir más alto.` : ""}`,
      start: "Empezar el chequeo →", beforeScore: "Tu puntaje inicial",
      taken: (d, done, total, left) => `Hecho el ${d}. ${left ? `Termina las lecciones (${done}/${total} hechas) y vuelve para el chequeo final.` : "Terminaste todas las lecciones: ¡es hora del chequeo final!"}`,
      startWith: (u) => `Empieza con ${u} →`, takeAfter: (left) => `Hacer el chequeo final${left ? " ahora" : " →"}`,
      byUnit: "Por unidad", weakest: (u) => `Tu unidad más débil fue <strong>${u}</strong>, así que es un buen lugar para empezar. Las respuestas se muestran después del chequeo final para que la comparación sea justa.`,
      improved: (g) => `¡Mejoraste ${g} ${g > 1 ? "preguntas" : "pregunta"}! 📈`, perfect: "¡Perfecto las dos veces! 🏆", same: "El mismo puntaje que antes", lower: "Un poco más bajo esta vez",
      retryHint: " Revisa las explicaciones de abajo, repasa esas lecciones y vuelve a hacer el chequeo final.",
      retake: "Repetir el chequeo final", reset: "Empezar de nuevo", bars: "Barra gris: antes. Barra verde: después.",
      progress: (phase, n, of) => `Chequeo ${phase === "pre" ? "inicial" : "final"} · pregunta ${n} de ${of}`,
      back: "← Atrás", skip: "No lo sé →", confirm: "¿Borrar los dos puntajes del chequeo y empezar de nuevo?", langGroup: "Idioma del chequeo",
    },
  };

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage blocked */ } };
  const state = () => {
    const s = load();
    const ok = (r) => r && Array.isArray(r.answers) && r.answers.length === QUESTIONS.length ? r : null;
    const pre = ok(s.pre);
    return { pre, post: pre && ok(s.post) };
  };
  const scoreOf = (answers) => answers.filter((a, i) => a === QUESTIONS[i].answer).length;

  function render(host) {
    let phase = null, step = 0, answers = [], lang = "en";
    const t = () => T[lang];
    // The question, its lesson, and its unit title in the current language.
    const shown = (q) => {
      if (lang !== "es") return { ...q, unitTitle: UNITS[q.unit].title, href: `lessons/${q.lesson.id}.html` };
      const lesson = localizeLesson(q.lesson, "es");
      return { ...q, ...lesson.quiz[q.index], lesson, unitTitle: UNITS_ES[UNITS[q.unit].id], href: `learn.html?lang=es#${q.lesson.id}` };
    };
    const unitTitle = (u) => (lang === "es" ? UNITS_ES[u.id] : u.title);
    const pct = (n) => Math.round((n / QUESTIONS.length) * 100);
    const date = (iso) => new Date(iso).toLocaleDateString(t().locale, { month: "short", day: "numeric", year: "numeric" });
    const lessonsDone = () => Object.keys(FG.getProgress().done).filter((id) => LESSONS.some((l) => l.id === id)).length;

    // Per-unit score (out of 2) for one attempt.
    const byUnit = (ans) => UNITS.map((u, n) => {
      const idx = QUESTIONS.map((q, i) => (q.unit === n ? i : -1)).filter((i) => i >= 0);
      return { unit: u, n, right: idx.filter((i) => ans[i] === QUESTIONS[i].answer).length, of: idx.length };
    });

    function unitBars(pre, post) {
      const a = byUnit(pre.answers), b = post ? byUnit(post.answers) : null;
      return `<div class="checkup-units">${a.map((r, k) => `
        <div class="checkup-unit">
          <div class="small"><strong>${r.unit.icon} ${t().unit(r.n + 1, unitTitle(r.unit))}</strong>
            <span class="muted">· ${t().before} ${r.right}/${r.of}${b ? ` · ${t().after} ${b[k].right}/${b[k].of}` : ""}</span></div>
          <div class="meter" aria-hidden="true"><span style="width:${(r.right / r.of) * 100}%;background:var(--muted)"></span></div>
          ${b ? `<div class="meter" aria-hidden="true"><span style="width:${(b[k].right / b[k].of) * 100}%;background:var(--brand)"></span></div>` : ""}
        </div>`).join("")}</div>`;
    }

    function review(run) {
      return `<details class="checkup-review"><summary><strong>${t().review}</strong></summary><ol>${QUESTIONS.map((q0, i) => {
        const q = shown(q0), right = run.answers[i] === q.answer;
        return `<li><p><strong>${q.q}</strong></p>
          <p class="small">${right ? "✅" : "❌"} ${t().youSaid} ${q.choices[run.answers[i]] ?? "—"}${right ? "" : `<br>${t().answer} <strong>${q.choices[q.answer]}</strong>`}</p>
          <p class="small muted">${q.why} <a href="${q.href}">${t().lessonLink(q.lesson.title)}</a></p></li>`;
      }).join("")}</ol></details>`;
    }

    function home() {
      const { pre, post } = state();
      const done = lessonsDone();
      if (!pre) {
        host.innerHTML = `<div class="card result">
          <div class="big">10</div>
          <h2 tabindex="-1" data-autofocus>${t().startTitle}</h2>
          <p class="muted">${t().startLead(done)}</p>
          <div class="hero-actions" style="justify-content:center"><button class="btn btn-primary" data-act="start" data-phase="pre">${t().start}</button></div>
        </div>`;
        return;
      }
      const ps = scoreOf(pre.answers);
      if (!post) {
        const weakest = byUnit(pre.answers).reduce((w, r) => (r.right < w.right ? r : w));
        const first = LESSONS.find((l) => weakest.unit.lessons.includes(l.id));
        const left = LESSONS.length - done;
        const firstHref = lang === "es" ? `learn.html?lang=es#${first.id}` : `lessons/${first.id}.html`;
        host.innerHTML = `<div class="card result">
          <div class="big">${ps}/${QUESTIONS.length}</div>
          <h2 tabindex="-1" data-autofocus>${t().beforeScore}</h2>
          <p class="muted">${t().taken(date(pre.date), done, LESSONS.length, left)}</p>
          <div class="hero-actions" style="justify-content:center">
            ${left ? `<a class="btn btn-primary" href="${firstHref}">${t().startWith(unitTitle(weakest.unit))}</a>` : ""}
            <button class="btn ${left ? "btn-ghost" : "btn-primary"}" data-act="start" data-phase="post">${t().takeAfter(left)}</button>
          </div>
        </div>
        <div class="card" style="margin-top:16px"><h3 style="margin-top:0">${t().byUnit}</h3>${unitBars(pre)}
          <p class="small muted">${t().weakest(unitTitle(weakest.unit))}</p></div>`;
        return;
      }
      const qs = scoreOf(post.answers), gain = qs - ps;
      const msg = gain > 0 ? t().improved(gain) : gain === 0 ? (qs === QUESTIONS.length ? t().perfect : t().same) : t().lower;
      host.innerHTML = `<div class="card result">
        <div class="checkup-compare">
          <div><div class="small muted">${t().Before}</div><div class="big" style="color:var(--muted)">${ps}/${QUESTIONS.length}</div><div class="small muted">${date(pre.date)}</div></div>
          <div class="checkup-arrow" aria-hidden="true">→</div>
          <div><div class="small muted">${t().After}</div><div class="big">${qs}/${QUESTIONS.length}</div><div class="small muted">${date(post.date)}</div></div>
        </div>
        <h2 tabindex="-1" data-autofocus>${msg}</h2>
        <p class="muted">${pct(ps)}% → ${pct(qs)}%.${gain <= 0 ? t().retryHint : ""}</p>
        <div class="hero-actions" style="justify-content:center">
          <button class="btn btn-ghost" data-act="start" data-phase="post">${t().retake}</button>
          <button class="btn btn-ghost" data-act="reset">${t().reset}</button>
        </div>
      </div>
      <div class="card" style="margin-top:16px"><h3 style="margin-top:0">${t().byUnit}</h3>${unitBars(pre, post)}
        <p class="small muted">${t().bars}</p>${review(post)}</div>`;
    }

    function question() {
      const q = shown(QUESTIONS[step]);
      host.innerHTML = `<div class="card">
        <div class="small muted">${t().progress(phase, step + 1, QUESTIONS.length)} · ${UNITS[q.unit].icon} ${q.unitTitle}</div>
        <div class="step-dots" aria-hidden="true">${QUESTIONS.map((_, i) => `<span class="${i <= step ? "on" : ""}"></span>`).join("")}</div>
        <p class="quiz-q" tabindex="-1" data-autofocus>${q.q}</p>
        <div class="choices">${q.choices.map((c, i) => `<button class="choice${answers[step] === i ? " picked" : ""}" data-choice="${i}" aria-pressed="${answers[step] === i}">${c}</button>`).join("")}</div>
        <div class="step-actions">
          <button class="btn btn-ghost" data-act="back" ${step === 0 ? "disabled" : ""}>${t().back}</button>
          <button class="btn btn-ghost" data-act="skip">${t().skip}</button>
        </div>
      </div>`;
    }

    function finish() {
      const s = load();
      const firstTime = !s[phase];
      s[phase] = { answers, date: new Date().toISOString() };
      if (phase === "pre") delete s.post; // a new baseline invalidates the old comparison
      save(s);
      if (firstTime) FG.addXp(phase === "pre" ? 10 : 25);
      document.dispatchEvent(new Event("progresschange"));
      phase = null;
      home();
      FG.scrollTo(host);
    }

    // Page heading, intro, header/footer, and switch follow the language; a check-up in progress keeps its answers.
    function applyLang(next) {
      lang = next;
      const title = document.getElementById("checkup-title"), intro = document.getElementById("checkup-intro");
      if (title) title.textContent = t().title;
      if (intro) intro.innerHTML = t().intro;
      document.title = `${t().title.replace("🩺 ", "")} — FinanceGuru`;
      FG.setChromeLang(lang);
      host.lang = lang;
      const sw = document.getElementById("checkup-lang");
      if (sw) {
        sw.setAttribute("aria-label", t().langGroup);
        sw.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lang === lang));
      }
      if (phase) question(); else home();
    }

    async function setLanguage(next) {
      if (next === "es") {
        try { await FG.loadSpanish(); } catch { next = "en"; }
      }
      FG.setLang(next);
      applyLang(next);
    }

    document.getElementById("checkup-lang")?.addEventListener("click", (e) => {
      const b = e.target.closest("[data-lang]");
      if (b && b.dataset.lang !== lang) setLanguage(b.dataset.lang).then(() => b.focus());
    });

    host.addEventListener("click", (e) => {
      const choice = e.target.closest("[data-choice]");
      const act = e.target.closest("[data-act]");
      if (choice || act?.dataset.act === "skip") {
        answers[step] = choice ? +choice.dataset.choice : -1;
        if (++step < QUESTIONS.length) question(); else finish();
        return;
      }
      if (!act) return;
      if (act.dataset.act === "start") { phase = act.dataset.phase; step = 0; answers = []; question(); }
      if (act.dataset.act === "back" && step > 0) { step--; question(); }
      if (act.dataset.act === "reset" && confirm(t().confirm)) {
        save({});
        document.dispatchEvent(new Event("progresschange"));
        home();
      }
      FG.scrollTo(host);
    });

    // ?lang=es in a shared link wins and is remembered, as on the Learn page.
    const asked = new URLSearchParams(location.search).get("lang");
    setLanguage(asked === "es" || asked === "en" ? asked : FG.getLang());
  }

  const host = document.getElementById("checkup");
  if (host) render(host);
  return { state, scoreOf, QUESTIONS };
})();
