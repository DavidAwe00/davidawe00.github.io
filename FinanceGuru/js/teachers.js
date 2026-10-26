// Teachers & parents page: lesson plans, slide decks, printable quizzes and worksheets with answer keys, and family conversation guides.
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
            <a class="btn btn-primary" href="slides.html#${l.id}" target="_blank" rel="noopener">📽 Present slides</a>
            <button class="btn btn-ghost" data-print="plan">🖨 Print plan</button>
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

  /* ---------- Your state's requirement (js/data/states.js) ---------- */
  const STATE_KEY = "fg-state";
  const codes = Object.keys(STATE_PF.states).sort((a, b) => STATE_PF.states[a].name.localeCompare(STATE_PF.states[b].name));
  // Graduating class of this school year's seniors (a school year starts in August).
  const seniors = (() => { const d = new Date(); return d.getFullYear() + (d.getMonth() >= 7 ? 1 : 0); })();
  const ordinal = (n) => n + ([11, 12, 13].includes(n) ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th");
  const grade = (cls) => { const g = 12 - (cls - seniors); return g >= 1 ? `${ordinal(g)} grade` : g === 0 ? "kindergarten" : null; };
  const statusText = (s) => s.since ? `Required since the Class of ${s.since}` : s.adopted ? `Required (adopted ${s.adopted})` : s.starts ? `Starts with the Class of ${s.starts}` : "No standalone course required";

  function stateInfo(code) {
    const s = STATE_PF.states[code], status = statePfStatus(s);
    const g = s.starts && grade(s.starts);
    const lead = status === "now"
      ? `Students in ${s.name} take a standalone personal finance course (at least one semester) to graduate.`
      : status === "soon"
        ? `${s.name} has adopted a standalone personal finance course requirement. It starts with the Class of ${s.starts}${g ? `: students in ${g} this school year` : ""}.`
        : `${s.name} doesn't require a standalone personal finance course yet. Personal finance may be taught inside another course, such as economics; your state department of education has the details.`;
    const counts = STANDARD_AREAS.map((a) => [a, Object.values(PLANS).filter((p) => p.areas.includes(a)).length]);
    return `
      <p class="state-status ${status}"><strong>${statusText(s)}</strong></p>
      <p>${lead}</p>
      <h3 class="small">FinanceGuru lessons by national standards area</h3>
      <div class="chips">${counts.map(([a, n]) => `<button type="button" class="chip" data-state-area="${a}">${a} · ${n}</button>`).join("")}</div>`;
  }

  function pickState(code, remember = true) {
    if (!STATE_PF.states[code]) return;
    $("state-pick").value = code;
    $("state-info").innerHTML = stateInfo(code);
    $("state-map").querySelectorAll("[data-state]").forEach((b) => b.classList.toggle("on", b.dataset.state === code));
    if (remember) try { localStorage.setItem(STATE_KEY, code); } catch { /* storage blocked */ }
  }

  function renderStates() {
    $("state-map").innerHTML = Object.entries(STATE_PF.grid).map(([code, [r, c]]) => {
      const s = STATE_PF.states[code];
      return `<button type="button" tabindex="-1" class="state-tile ${statePfStatus(s)}" data-state="${code}" title="${s.name}: ${statusText(s)}" style="grid-row:${r + 1};grid-column:${c + 1}">${code}</button>`;
    }).join("");
    $("state-pick").innerHTML = `<option value="">Select a state…</option>` + codes.map((c) => `<option value="${c}">${STATE_PF.states[c].name}</option>`).join("");
    const all = Object.values(STATE_PF.states).map(statePfStatus);
    $("state-source").innerHTML = `${all.filter((s) => s === "now").length} states require the course now and ${all.filter((s) => s === "soon").length} more start with the Classes of 2027–${Math.max(...Object.values(STATE_PF.states).map((s) => s.starts || 0))}. Source: <a href="${STATE_PF.source}" rel="noopener" target="_blank">NGPF Live U.S. Dashboard</a>, checked ${STATE_PF.checked}. NGPF counts only standalone courses of at least one semester.`;
    let saved = null;
    try { saved = localStorage.getItem(STATE_KEY); } catch { /* storage blocked */ }
    if (saved) pickState(saved, false);
    else $("state-info").innerHTML = `<p class="muted">Pick a state to see its requirement and how the lessons line up with the national standards.</p>`;
  }

  $("state-map").addEventListener("click", (e) => { const b = e.target.closest("[data-state]"); if (b) pickState(b.dataset.state); });
  $("state-pick").addEventListener("change", (e) => pickState(e.target.value));
  $("state-info").addEventListener("click", (e) => {
    const b = e.target.closest("[data-state-area]");
    if (!b) return;
    area = b.dataset.stateArea;
    renderChips(); renderPlans();
    $("area-chips").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    $("area-chips").querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
  });

  $("plan-count").textContent = $("plan-count-lead").textContent = Object.keys(PLANS).length;
  renderChips(); renderPlans(); renderParents(); renderStates();
  const fromHash = () => setMode(location.hash === "#parents" ? "parents" : "teachers");
  addEventListener("hashchange", fromHash);
  fromHash();
})();
