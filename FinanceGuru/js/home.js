// Homepage: lesson units (collapsible) + progress, remembered section dropdowns, and the hero mini-calculator.
// In Spanish (js/i18n.js with js/i18n/home.es.js), lesson titles and summaries come from js/lessons.es.js and
// lesson links open the Spanish lesson on the Learn page (the static lessons/*.html pages are English).
(function () {
  const t = I18N.t;
  const spanish = () => I18N.lang() === "es" && typeof localizeLesson === "function";
  const L = (l) => (spanish() ? localizeLesson(l, "es") : l);
  const unitTitle = (u) => (spanish() && typeof UNITS_ES === "object" && UNITS_ES[u.id] ? UNITS_ES[u.id] : u.title);
  const unitBlurb = (u) => t(u.blurb);
  const lessonHref = (id) => (spanish() ? `learn.html?lang=es#${id}` : `lessons/${id}.html`);

  /* ---------- Lesson units + progress ---------- */
  function lessons() {
    const p = FG.getProgress();
    const grid = document.getElementById("lesson-grid");
    // A Money Check-up points to the unit with the most room to grow; otherwise follow course order.
    const rec = Checkup.recommendedUnit(p.done);
    const order = UNITS.flatMap((u) => u.lessons).map((id) => LESSONS.find((l) => l.id === id));
    const nextUp = (rec && order.find((l) => rec.unit.lessons.includes(l.id) && !p.done[l.id])) || order.find((l) => !p.done[l.id]);
    const card = (l) => {
      const done = p.done[l.id], ll = L(l);
      return `<a class="card" href="${lessonHref(l.id)}">
        <div class="card-icon">${FGIcons.svg(FGIcons.lesson[l.id]) || l.icon}</div>
        <h3>${LESSONS.indexOf(l) + 1}. ${ll.title}</h3>
        <p class="muted small">${ll.summary}</p>
        <div class="card-meta"><span>${t("{n} min", { n: l.minutes })}</span>
          <span class="badge ${done ? "done" : ""}">${done ? `✓ ${done.score}/${done.total}` : l === nextUp ? t("Up next") : t("Not started")}</span></div>
      </a>`;
    };
    // Keep whichever units the visitor has open when the grid is redrawn (language change).
    const wasOpen = new Set([...grid.querySelectorAll("details[open]")].map((d) => d.dataset.unit));
    grid.innerHTML = UNITS.map((u, n) => {
      const ls = u.lessons.map((id) => LESSONS.find((l) => l.id === id));
      const finished = ls.filter((l) => p.done[l.id]).length;
      const open = wasOpen.size ? wasOpen.has(u.id) : nextUp ? u.lessons.includes(nextUp.id) : n === 0;
      const status = finished === ls.length ? t("✓ Complete") : finished ? t("{done}/{total} done", { done: finished, total: ls.length }) : t("{n} lessons", { n: ls.length });
      const recommended = rec && rec.unit.id === u.id;
      return `<details class="unit${recommended ? " recommended" : ""}" data-unit="${u.id}"${open ? " open" : ""}>
        <summary><span class="unit-icon" aria-hidden="true">${FGIcons.svg(FGIcons.unit[u.id]) || u.icon}</span>
          <span class="unit-text"><strong>${t("Unit {n}: {title}", { n: n + 1, title: unitTitle(u) })}${recommended ? ` <span class="rec-badge">${t("Recommended")}</span>` : ""}</strong><span class="small muted">${unitBlurb(u)}<span class="unit-inline-status"> · ${status}</span></span></span>
          <span class="unit-status ${finished === ls.length ? "done" : ""}">${status}</span></summary>
        <div class="grid">${ls.map(card).join("")}</div></details>`;
    }).join("");
    sync();
    const count = LESSONS.filter((l) => p.done[l.id]).length;
    const note = document.getElementById("path-note");
    if (rec) {
      note.innerHTML = t("Based on your Money Check-up, your best next step is <strong>Unit {n}: {unit}</strong> ({right} of {of} right).", { n: rec.n + 1, unit: unitTitle(rec.unit), right: rec.right, of: rec.of })
        + ` <a href="${lessonHref(nextUp.id)}">${t("Start with {lesson} →", { lesson: L(nextUp).title })}</a>`;
      note.hidden = false;
    } else if (!count && !Checkup.state().pre) {
      note.innerHTML = t("Not sure where to start? <a href=\"checkup.html\">Take the 10-question Money Check-up</a> and we’ll point you to the unit where you’ll learn the most.");
      note.hidden = false;
    }
    document.getElementById("path-count").textContent = count ? t("{done}/{total} done", { done: count, total: LESSONS.length }) : t("{n} lessons", { n: LESSONS.length });
    document.getElementById("proof-lessons").textContent = LESSONS.length;
    document.getElementById("home-progress").style.width = (count / LESSONS.length) * 100 + "%";
    document.getElementById("home-progress-label").textContent = t("{done} of {total} lessons complete", { done: count, total: LESSONS.length });
  }
  const grid = document.getElementById("lesson-grid");
  const toggle = document.getElementById("units-toggle");
  const allOpen = () => [...grid.querySelectorAll("details")].every((d) => d.open);
  function sync() { toggle.textContent = allOpen() ? t("Collapse all") : t("Show all lessons"); }
  toggle.addEventListener("click", () => {
    const openAll = !allOpen();
    grid.querySelectorAll("details").forEach((d) => (d.open = openAll));
    sync();
  });
  grid.addEventListener("toggle", sync, true);
  lessons();

  /* ---------- Section dropdowns: remember which ones this visitor opened or closed (per-browser convenience) ---------- */
  const KEY = "fg-home-sections";
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { /* storage blocked */ }
  document.querySelectorAll("details.section-drop").forEach((d) => {
    if (d.dataset.section in saved) d.open = saved[d.dataset.section];
    d.addEventListener("toggle", () => {
      saved[d.dataset.section] = d.open;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch { /* storage blocked */ }
    });
  });

  /* ---------- Hero mini-calculator ---------- */
  const a = document.getElementById("demo-slider-amt");
  const y = document.getElementById("demo-slider-yrs");
  function update() {
    const pmt = +a.value, n = +y.value * 12, r = 0.08 / 12;
    const fv = pmt * ((Math.pow(1 + r, n) - 1) / r);
    document.getElementById("demo-amt").textContent = FG.money(pmt);
    document.getElementById("demo-yrs").textContent = y.value;
    document.getElementById("demo-result").textContent = FG.money(fv);
    document.getElementById("demo-in").textContent = FG.money(pmt * n);
    const points = Array.from({ length: 61 }, (_, i) => {
      const months = n * i / 60, value = pmt * ((Math.pow(1 + r, months) - 1) / r);
      return `${4 + i / 60 * 432},${152 - value / fv * 140}`;
    });
    document.getElementById("growth-line").setAttribute("d", "M" + points.join(" L"));
    document.getElementById("growth-area").setAttribute("d", "M4,152 L" + points.join(" L") + " L436,152 Z");
    document.getElementById("growth-contributions").setAttribute("d", `M4,152 L436,${152 - pmt * n / fv * 140}`);
    document.getElementById("growth-end").textContent = t("Year {n}", { n: y.value });
    document.getElementById("growth-chart-description").textContent = t("{pmt} contributed monthly over {years} years: {put} contributed and an illustrative balance of {fv} at an assumed 8% annual return.", { pmt: FG.money(pmt), years: y.value, put: FG.money(pmt * n), fv: FG.money(fv) });
  }
  a.addEventListener("input", update);
  y.addEventListener("input", update);
  update();

  // Spanish lesson titles live in js/lessons.es.js, loaded only for Spanish visitors.
  document.addEventListener("langchange", () => {
    update();
    if (I18N.lang() === "es") FG.loadSpanish().catch(() => {}).then(lessons); else lessons();
  });
})();
