// Teachers & parents page: lesson plans, printable quizzes and worksheets with answer keys, and family conversation guides.
(function () {
  const $ = (id) => document.getElementById(id);
  const LETTERS = "ABCD";
  let area = "All";

  const studentLink = (id) => new URL(`learn.html#${id}`, location.href).href;
  const tags = (areas) => areas.map((a) => `<span class="badge">${a}</span>`).join(" ");
  const links = (act) => act.links.map(([t, href]) => `<a href="${href}">${t}</a>`).join(" · ");

  function planHtml(l, p, i) {
    return `
      <div class="plan-head">
        <div><div class="small muted">Lesson ${i + 1} · ~45 min · Grades 9–12</div><h3>${l.icon} ${l.title}</h3></div>
        <div>${tags(p.areas)}</div>
      </div>
      <h4>Students will be able to</h4>
      <ul>${p.objectives.map((o) => `<li>${o}</li>`).join("")}</ul>
      <h4>Agenda</h4>
      <ol class="agenda">
        <li><span>5 min</span><div><strong>Warm-up.</strong> ${p.warmup}</div></li>
        <li><span>10 min</span><div><strong>Lesson.</strong> Students complete <a href="learn.html#${l.id}">${l.title}</a> (about ${l.minutes} min reading + 3-question quiz).<div class="small muted print-only">${studentLink(l.id)}</div></div></li>
        <li><span>20 min</span><div><strong>Activity: ${p.activity.title}.</strong> <span class="small">${links(p.activity)}</span>
          <ol>${p.activity.steps.map((s) => `<li>${s}</li>`).join("")}</ol></div></li>
        <li><span>7 min</span><div><strong>Discuss.</strong><ul>${p.discuss.map((d) => `<li>${d}</li>`).join("")}</ul></div></li>
        <li><span>3 min</span><div><strong>Exit ticket.</strong> Hand out the printable quiz (“Print quiz + answer key”), or have students show their in-app quiz score.</div></li>
      </ol>`;
  }

  function quizHtml(l, i) {
    const qs = l.quiz.map((q, n) => `
      <li><p>${q.q}</p><ol class="quiz-choices">${q.choices.map((c) => `<li>${c}</li>`).join("")}</ol></li>`).join("");
    const key = l.quiz.map((q) => `<li><strong>${LETTERS[q.answer]}. ${q.choices[q.answer]}</strong> — ${q.why}</li>`).join("");
    return `
      <div class="print-sheet">
        <div class="plan-head"><div><div class="small muted">FinanceGuru · Lesson ${i + 1} exit ticket</div><h3>${l.icon} ${l.title}</h3></div></div>
        <p>Name: ______________________________ &nbsp; Date: ______________</p>
        <ol class="quiz-print">${qs}</ol>
      </div>
      <div class="print-sheet page-break">
        <div class="plan-head"><div><div class="small muted">Answer key — teacher copy</div><h3>${l.icon} ${l.title}</h3></div></div>
        <ol>${key}</ol>
      </div>`;
  }

  function renderPlans() {
    const shown = LESSONS.map((l, i) => [l, PLANS[l.id], i]).filter(([, p]) => p && (area === "All" || p.areas.includes(area)));
    $("plan-list").innerHTML = shown.map(([l, p, i]) => `
      <details class="card plan" data-id="${l.id}">
        <summary>
          <span class="plan-num">${i + 1}</span>
          <span class="plan-title"><strong>${l.icon} ${l.title}</strong><span class="small muted">Activity: ${p.activity.title}</span></span>
          <span class="plan-tags">${tags(p.areas)}</span>
        </summary>
        <div class="plan-body">
          ${planHtml(l, p, i)}
          <div class="hero-actions">
            <button class="btn btn-primary" data-print="plan">🖨 Print plan</button>
            <button class="btn btn-ghost" data-print="quiz">📝 Print quiz + answer key</button>
            <button class="btn btn-ghost" data-print="worksheet">📄 Print student worksheet</button>
            <button class="btn btn-ghost" data-copy>🔗 Copy student link</button>
          </div>
        </div>
      </details>`).join("") || `<p class="muted">No lessons in this area yet.</p>`;
  }

  function renderChips() {
    const used = STANDARD_AREAS.filter((a) => Object.values(PLANS).some((p) => p.areas.includes(a)));
    $("area-chips").innerHTML = ["All", ...used].map((a) => `<button class="chip" aria-pressed="${a === area}" data-area="${a}">${a}</button>`).join("");
  }

  function renderParents() {
    $("parent-grid").innerHTML = LESSONS.filter((l) => PLANS[l.id]).map((l) => {
      const h = PLANS[l.id].home;
      return `
        <div class="card parent-card">
          <h3>${l.icon} ${l.title}</h3>
          <h4>Talk about it</h4>
          <ul>${h.talk.map((t) => `<li>${t}</li>`).join("")}</ul>
          <h4>Try this together</h4>
          <p>${h.try}</p>
          <a class="btn btn-ghost" href="learn.html#${l.id}">Start the ${l.minutes}-min lesson →</a>
        </div>`;
    }).join("");
  }

  function printOnly(html) {
    $("print-area").innerHTML = html;
    document.body.classList.add("print-mode");
    window.print();
  }
  addEventListener("afterprint", () => { document.body.classList.remove("print-mode"); $("print-area").innerHTML = ""; });

  $("area-chips").addEventListener("click", (e) => {
    const b = e.target.closest("[data-area]");
    if (!b) return;
    area = b.dataset.area;
    renderChips(); renderPlans();
  });

  $("plan-list").addEventListener("click", async (e) => {
    const card = e.target.closest(".plan");
    if (!card) return;
    const i = LESSONS.findIndex((l) => l.id === card.dataset.id), l = LESSONS[i];
    const kind = e.target.closest("[data-print]")?.dataset.print;
    if (kind === "plan") printOnly(`<div class="print-sheet">${planHtml(l, PLANS[l.id], i)}</div>`);
    if (kind === "quiz") printOnly(quizHtml(l, i));
    if (kind === "worksheet") printOnly(Worksheet.build(l, PLANS[l.id], i));
    if (e.target.closest("[data-copy]")) {
      try { await navigator.clipboard.writeText(studentLink(l.id)); FG.toast("Student link copied 🔗"); }
      catch { FG.toast(studentLink(l.id)); }
    }
  });

  // Tabs (remembered in the URL hash so a parent link opens the parent guide).
  function setMode(mode) {
    ["teachers", "parents"].forEach((m) => {
      $(m).hidden = m !== mode;
      $("tab-" + m).setAttribute("aria-selected", m === mode);
      $("tab-" + m).tabIndex = m === mode ? 0 : -1;
    });
  }
  document.querySelector('[role="tablist"]').addEventListener("click", (e) => {
    const b = e.target.closest("[data-mode]");
    if (!b) return;
    setMode(b.dataset.mode);
    history.replaceState(null, "", "#" + b.dataset.mode);
  });
  document.querySelector('[role="tablist"]').addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next = $("parents").hidden ? "parents" : "teachers";
    setMode(next); $("tab-" + next).focus();
    history.replaceState(null, "", "#" + next);
  });

  $("plan-count").textContent = $("plan-count-lead").textContent = Object.keys(PLANS).length;
  renderChips(); renderPlans(); renderParents();
  const fromHash = () => setMode(location.hash === "#parents" ? "parents" : "teachers");
  addEventListener("hashchange", fromHash);
  fromHash();
})();
