// Money Check-up: a 10-question pre/post test, two concept questions per unit, drawn from the
// lesson quizzes (each fact is sourced on its lesson page). Answers stay hidden until the end so
// the "before" score is a fair baseline. Results live in this browser only.
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
    return { ...lesson.quiz[i], lesson, unit: unitOf(id) };
  });

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
    let phase = null, step = 0, answers = [];
    const st = () => state();
    const pct = (n) => Math.round((n / QUESTIONS.length) * 100);
    const date = (iso) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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
          <div class="small"><strong>${r.unit.icon} Unit ${r.n + 1}: ${r.unit.title}</strong>
            <span class="muted">· before ${r.right}/${r.of}${b ? ` · after ${b[k].right}/${b[k].of}` : ""}</span></div>
          <div class="meter" aria-hidden="true"><span style="width:${(r.right / r.of) * 100}%;background:var(--muted)"></span></div>
          ${b ? `<div class="meter" aria-hidden="true"><span style="width:${(b[k].right / b[k].of) * 100}%;background:var(--brand)"></span></div>` : ""}
        </div>`).join("")}</div>`;
    }

    function review(run) {
      return `<details class="checkup-review"><summary><strong>Review your answers</strong></summary><ol>${QUESTIONS.map((q, i) => {
        const right = run.answers[i] === q.answer;
        return `<li><p><strong>${q.q}</strong></p>
          <p class="small">${right ? "✅" : "❌"} You said: ${q.choices[run.answers[i]] ?? "—"}${right ? "" : `<br>Answer: <strong>${q.choices[q.answer]}</strong>`}</p>
          <p class="small muted">${q.why} <a href="lessons/${q.lesson.id}.html">${q.lesson.title} lesson →</a></p></li>`;
      }).join("")}</ol></details>`;
    }

    function home() {
      const { pre, post } = st();
      const done = lessonsDone();
      if (!pre) {
        host.innerHTML = `<div class="card result">
          <div class="big">10</div>
          <h2 tabindex="-1" data-autofocus>Start with the "before" check-up</h2>
          <p class="muted">About 5 minutes. Don't worry about your score — it's a starting line, not a grade.${done ? ` You've already finished ${done} lesson${done > 1 ? "s" : ""}, so this baseline may be higher than a true "before."` : ""}</p>
          <div class="hero-actions" style="justify-content:center"><button class="btn btn-primary" data-act="start" data-phase="pre">Start the check-up →</button></div>
        </div>`;
        return;
      }
      const ps = scoreOf(pre.answers);
      if (!post) {
        const weakest = byUnit(pre.answers).reduce((w, r) => (r.right < w.right ? r : w));
        const first = LESSONS.find((l) => weakest.unit.lessons.includes(l.id));
        const left = LESSONS.length - done;
        host.innerHTML = `<div class="card result">
          <div class="big">${ps}/${QUESTIONS.length}</div>
          <h2 tabindex="-1" data-autofocus>Your "before" score</h2>
          <p class="muted">Taken ${date(pre.date)}. ${left ? `Finish the lessons (${done}/${LESSONS.length} done), then come back for the "after" check-up.` : `You've finished every lesson — time for the "after" check-up!`}</p>
          <div class="hero-actions" style="justify-content:center">
            ${left ? `<a class="btn btn-primary" href="lessons/${first.id}.html">Start with ${weakest.unit.title} →</a>` : ""}
            <button class="btn ${left ? "btn-ghost" : "btn-primary"}" data-act="start" data-phase="post">Take the "after" check-up${left ? " now" : " →"}</button>
          </div>
        </div>
        <div class="card" style="margin-top:16px"><h3 style="margin-top:0">By unit</h3>${unitBars(pre)}
          <p class="small muted">Your weakest unit was <strong>${weakest.unit.title}</strong>, so that's a good place to start. Answers stay hidden until the "after" check-up so it's a fair comparison.</p></div>`;
        return;
      }
      const qs = scoreOf(post.answers), gain = qs - ps;
      const msg = gain > 0 ? `You improved by ${gain} question${gain > 1 ? "s" : ""}! 📈` : gain === 0 ? (qs === QUESTIONS.length ? "Perfect both times! 🏆" : "Same score as before") : "A little lower this time";
      host.innerHTML = `<div class="card result">
        <div class="checkup-compare">
          <div><div class="small muted">Before</div><div class="big" style="color:var(--muted)">${ps}/${QUESTIONS.length}</div><div class="small muted">${date(pre.date)}</div></div>
          <div class="checkup-arrow" aria-hidden="true">→</div>
          <div><div class="small muted">After</div><div class="big">${qs}/${QUESTIONS.length}</div><div class="small muted">${date(post.date)}</div></div>
        </div>
        <h2 tabindex="-1" data-autofocus>${msg}</h2>
        <p class="muted">${pct(ps)}% → ${pct(qs)}%.${gain <= 0 ? " Review the explanations below and revisit those lessons, then retake the \"after\" check-up." : ""}</p>
        <div class="hero-actions" style="justify-content:center">
          <button class="btn btn-ghost" data-act="start" data-phase="post">Retake "after"</button>
          <button class="btn btn-ghost" data-act="reset">Start over</button>
        </div>
      </div>
      <div class="card" style="margin-top:16px"><h3 style="margin-top:0">By unit</h3>${unitBars(pre, post)}
        <p class="small muted">Gray bar: before. Green bar: after.</p>${review(post)}</div>`;
    }

    function question() {
      const q = QUESTIONS[step];
      host.innerHTML = `<div class="card">
        <div class="small muted">${phase === "pre" ? "Before" : "After"} check-up · question ${step + 1} of ${QUESTIONS.length} · ${UNITS[q.unit].icon} ${UNITS[q.unit].title}</div>
        <div class="step-dots" aria-hidden="true">${QUESTIONS.map((_, i) => `<span class="${i <= step ? "on" : ""}"></span>`).join("")}</div>
        <p class="quiz-q" tabindex="-1" data-autofocus>${q.q}</p>
        <div class="choices">${q.choices.map((c, i) => `<button class="choice${answers[step] === i ? " picked" : ""}" data-choice="${i}" aria-pressed="${answers[step] === i}">${c}</button>`).join("")}</div>
        <div class="step-actions">
          <button class="btn btn-ghost" data-act="back" ${step === 0 ? "disabled" : ""}>← Back</button>
          <button class="btn btn-ghost" data-act="skip">I don't know →</button>
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
      if (act.dataset.act === "reset" && confirm("Clear both check-up scores and start over?")) {
        save({});
        document.dispatchEvent(new Event("progresschange"));
        home();
      }
      FG.scrollTo(host);
    });

    home();
  }

  const host = document.getElementById("checkup");
  if (host) render(host);
  return { state, scoreOf, QUESTIONS };
})();
