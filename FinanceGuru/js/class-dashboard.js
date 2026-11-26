// Teacher dashboard (class.html): sign in, create class codes, and see each student's lessons, quiz scores,
// and Money Check-up growth. Runs on the app origin (the API sets same-site cookies). Student data is shown
// as text only; nothing from the server is inserted as HTML without escaping.
(function () {
  const $ = (id) => document.getElementById(id);
  const config = typeof SITE_CONFIG === "object" ? SITE_CONFIG : {};
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const say = (text) => { $("notice").textContent = text; };
  const show = (id) => ["elsewhere", "unavailable", "signin", "dashboard"].forEach((s) => ($(s).hidden = s !== id));
  const lessonTitle = Object.fromEntries(LESSONS.map((l) => [l.id, `${l.icon} ${l.title}`]));
  let data = { classes: [], lessons: [], checkupQuestions: 10 };
  let google = { connected: false, links: {} };  // Google Classroom connection and each class's linked course
  let googleCourses = null;  // the teacher's Classroom courses, loaded when first needed
  const params = new URLSearchParams(location.search);

  async function api(path, method = "GET", body, refresh = true) {
    let r;
    try {
      r = await fetch(`/api${path}`, { method, credentials: "same-origin", headers: { "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(35000) });
    } catch { throw new Error("Could not connect. If the app was asleep, try again in a minute."); }
    if (r.status === 401 && refresh && !path.startsWith("/auth/")) {
      try { await api("/auth/refresh", "POST", {}, false); } catch (e) { e.status = 401; throw e; }
      return api(path, method, body, false);
    }
    let out;
    try { out = await r.json(); } catch { throw new Error("The class service isn't available on this site."); }
    if (!r.ok) { const e = new Error(out.error || "The request could not be completed."); e.status = r.status; throw e; }
    return out;
  }
  async function busy(button, work) {
    if (button.disabled) return;
    button.disabled = true;
    try { await work(); } catch (e) { say(e.message); } finally { button.disabled = false; }
  }

  /* ---------- Summaries ---------- */
  const total = () => data.lessons.length;
  function studentSummary(s, assigned = []) {
    const lessons = Object.entries(s.progress?.lessons || {}).filter(([id]) => data.lessons.includes(id));
    const pct = lessons.length ? Math.round((lessons.reduce((a, [, [sc, of]]) => a + sc / of, 0) / lessons.length) * 100) : null;
    const units = UNITS.map((u) => ({ u, done: u.lessons.filter((id) => s.progress?.lessons?.[id]).length, of: u.lessons.length }));
    const assignedDone = assigned.filter((id) => s.progress?.lessons?.[id]).length;
    // First-try scores the server checked (graded): what to use for grades.
    const graded = Object.entries(s.graded || {}).filter(([id]) => data.lessons.includes(id));
    const firstPct = graded.length ? Math.round((graded.reduce((a, [, [sc, of]]) => a + sc / of, 0) / graded.length) * 100) : null;
    return { done: lessons.length, pct, firstPct, units, assignedDone, pre: s.progress?.checkup?.pre, post: s.progress?.checkup?.post };
  }
  const assignedOf = (c) => (c.assigned || []).filter((id) => data.lessons.includes(id));
  // Due dates are calendar dates (YYYY-MM-DD): format in UTC so they don't shift a day, compare with today's local date.
  const dueText = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
  const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const isPastDue = (c) => Boolean(c.assigned_due) && localToday() > c.assigned_due;
  const when = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso), days = Math.floor((Date.now() - d) / 86400000);
    return days < 1 ? "Today" : days < 2 ? "Yesterday" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };
  const checkup = (x) => (x.pre === undefined ? "—" : `${x.pre}${x.post === undefined ? " → …" : ` → ${x.post}`}`);

  function classSummary(students) {
    if (!students.length) return "";
    const sums = students.map((s) => studentSummary(s));
    const both = sums.filter((x) => x.pre !== undefined && x.post !== undefined);
    const avg = (xs) => (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1);
    return `${students.length} student${students.length > 1 ? "s" : ""} · average ${avg(sums.map((x) => x.done))} of ${total()} lessons`
      + (both.length ? ` · Check-up average ${avg(both.map((x) => x.pre))} → ${avg(both.map((x) => x.post))} out of ${data.checkupQuestions} (${both.length} took both)` : "");
  }

  function byLesson(students) {
    if (!students.length) return "";
    const rows = data.lessons.map((id) => {
      const scores = students.map((s) => s.progress?.lessons?.[id]).filter(Boolean);
      const pct = scores.length ? Math.round((scores.reduce((a, [sc, of]) => a + sc / of, 0) / scores.length) * 100) : null;
      const firsts = students.map((s) => s.graded?.[id]).filter(Boolean);
      const first = firsts.length ? Math.round((firsts.reduce((a, [sc, of]) => a + sc / of, 0) / firsts.length) * 100) : null;
      return `<tr><th scope="row">${esc(lessonTitle[id] || id)}</th><td>${scores.length}/${students.length}</td><td>${first === null ? "—" : `${first}%`}</td><td>${pct === null ? "—" : `${pct}%`}</td></tr>`;
    }).join("");
    return `<details class="by-lesson"><summary>Scores by lesson</summary><div class="table-wrap"><table class="roster"><thead><tr><th scope="col">Lesson</th><th scope="col">Finished</th><th scope="col">First-try average ✓</th><th scope="col">Best practice average</th></tr></thead><tbody>${rows}</tbody></table></div></details>`;
  }

  function roster(c) {
    const students = [...c.class_students].sort((a, b) => a.nickname.localeCompare(b.nickname));
    if (!students.length) return `<p class="muted">No students yet. They open <strong>My progress</strong> on MoneyExplained, choose <strong>Your class</strong>, and enter the code (or use the student link).</p>`;
    const assigned = assignedOf(c);
    const head = `<tr><th scope="col">Nickname</th><th scope="col">Lessons</th>${assigned.length ? `<th scope="col">Assigned</th>` : ""}<th scope="col">First try ✓</th><th scope="col">Best (practice)</th>${UNITS.map((u) => `<th scope="col" class="unit-col" title="${esc(u.title)}"><span aria-hidden="true">${u.icon}</span><span class="sr-only">${esc(u.title)}</span></th>`).join("")}<th scope="col">Check-up</th><th scope="col">Last active</th><th scope="col"><span class="sr-only">Actions</span></th></tr>`;
    const rows = students.map((s) => {
      const x = studentSummary(s, assigned);
      return `<tr><th scope="row">${esc(s.nickname)}</th><td>${x.done}/${total()}</td>${assigned.length ? (x.assignedDone === assigned.length ? `<td class="unit-done">${x.assignedDone}/${assigned.length}</td>` : `<td${isPastDue(c) ? ' class="assign-late"' : ""}>${x.assignedDone}/${assigned.length}${isPastDue(c) ? " · late" : ""}</td>`) : ""}<td>${x.firstPct === null ? "—" : `${x.firstPct}%`}</td><td>${x.pct === null ? "—" : `${x.pct}%`}</td>
        ${x.units.map((u) => `<td class="unit-col${u.done === u.of ? " unit-done" : ""}">${u.done}/${u.of}</td>`).join("")}
        <td>${checkup(x)}</td><td>${when(s.updated_at)}</td>
        <td class="row-actions"><button type="button" class="btn btn-ghost btn-small" data-rejoin="${esc(s.id)}" aria-label="Rejoin code for ${esc(s.nickname)} on a new device">New device</button><button type="button" class="icon-btn" data-remove="${esc(s.id)}" aria-label="Remove ${esc(s.nickname)}">✕</button></td></tr>`;
    }).join("");
    return `<p class="small">${esc(classSummary(students))}</p>
      <div class="table-wrap"><table class="roster"><caption class="sr-only">Students in ${esc(c.name)}</caption><thead>${head}</thead><tbody>${rows}</tbody></table></div>
      <p class="small muted">${assigned.length ? `Assigned: assigned lessons finished${c.assigned_due ? ` (due ${esc(dueText(c.assigned_due))}; ${students.filter((s) => studentSummary(s, assigned).assignedDone === assigned.length).length} of ${students.length} done)` : ""}. ` : ""}Unit columns: ${UNITS.map((u) => `${u.icon} ${esc(u.title)}`).join(" · ")}. Check-up: before → after, out of ${data.checkupQuestions}. <strong>First try ✓</strong>: the average of each finished quiz's first answers, checked by MoneyExplained; use it for grades. <strong>Best (practice)</strong> includes retakes. <strong>New device</strong> gives a student a one-time code to move to another computer or phone.</p>
      ${byLesson(students)}`;
  }

  // Lesson picker grouped by unit; a unit's checkbox selects or clears all of its lessons.
  function assignPicker(c) {
    const chosen = assignedOf(c);
    const units = UNITS.map((u) => ({ u, ids: u.lessons.filter((id) => data.lessons.includes(id)) })).filter((x) => x.ids.length);
    return `<details class="assign"><summary>Assigned lessons (${chosen.length})${chosen.length && c.assigned_due ? ` · due ${esc(dueText(c.assigned_due))}` : ""}</summary>
      <p class="small muted">Students see assigned lessons on My progress and tagged in the lesson list. Their scores show in the Assigned column.</p>
      <div class="assign-units">${units.map(({ u, ids }) => `<fieldset class="assign-unit">
        <legend><label><input type="checkbox" data-unit="${esc(u.id)}"> ${u.icon} ${esc(u.title)}</label></legend>
        ${ids.map((id) => `<label><input type="checkbox" name="assign" value="${esc(id)}" data-in="${esc(u.id)}"${chosen.includes(id) ? " checked" : ""}> ${esc(lessonTitle[id] || id)}</label>`).join("")}
      </fieldset>`).join("")}</div>
      <div class="field assign-due"><label for="due-${esc(c.id)}">Due date (optional)</label><div class="input-wrap"><input type="date" id="due-${esc(c.id)}" data-due value="${esc(c.assigned_due || "")}"></div></div>
      <button type="button" class="btn btn-primary" data-save-assign>Save assigned lessons</button>
    </details>`;
  }
  function syncUnitBoxes(card) {
    card.querySelectorAll("[data-unit]").forEach((box) => {
      const items = [...card.querySelectorAll(`[data-in="${box.dataset.unit}"]`)], on = items.filter((i) => i.checked).length;
      box.checked = on === items.length; box.indeterminate = on > 0 && on < items.length;
    });
  }

  const joinLink = (code) => new URL(`badges.html?join=${code}`, config.siteUrl || location.href).href;

  /* ---------- Google Classroom and LMS ---------- */
  // Google's share link works without any setup: it opens Classroom with the link ready to post.
  const shareToClassroom = (url, title) => `https://classroom.google.com/share?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
  function googleBox(c) {
    const share = `<a href="${esc(shareToClassroom(joinLink(c.code), `Join ${c.name} on MoneyExplained`))}" target="_blank" rel="noopener">Share the student link to Google Classroom ↗</a>`;
    if (!data.googleClassroom) return `<p class="small">${share}</p>`;
    const link = google.links[c.id];
    let body;
    if (!google.connected) {
      body = `<p class="small muted">Connect Google Classroom (button at the top) to post lessons as Classroom assignments and send quiz scores as grades.</p>`;
    } else if (!link) {
      body = `<div class="field"><label for="gc-${esc(c.id)}">Classroom course</label><div class="input-wrap"><select id="gc-${esc(c.id)}" data-gcourse>${courseOptions()}</select></div></div>
        <button type="button" class="btn btn-primary" data-glink>Link course</button>`;
    } else {
      const waiting = assignedOf(c).filter((id) => !link.posted.includes(id)).length;
      body = `<p>Linked to <strong>${esc(link.courseName)}</strong>. ${link.posted.length} lesson${link.posted.length === 1 ? "" : "s"} posted as Classroom assignments.</p>
        <div class="hero-actions">
          <button type="button" class="btn btn-primary" data-gpost ${waiting ? "" : "disabled"}>${waiting ? `Post ${waiting} assigned lesson${waiting > 1 ? "s" : ""}` : "Assigned lessons are posted"}</button>
          <button type="button" class="btn btn-ghost" data-groster ${c.class_students.length ? "" : "disabled"}>Match students</button>
          <button type="button" class="btn btn-ghost" data-gsync ${link.posted.length ? "" : "disabled"}>Send grades to Classroom</button>
          <button type="button" class="btn btn-ghost" data-gunlink>Unlink</button>
        </div>
        <div data-groster-box></div>
        <p class="small muted">Grades are each lesson's first-try quiz score out of 100 (checked by MoneyExplained; retakes don't change it), for students you've matched.</p>`;
    }
    return `<details class="assign google-box" data-key="google"><summary>Google Classroom${link ? ` · ${esc(link.courseName)}` : ""}</summary>${body}<p class="small">${share}</p></details>`;
  }
  const courseOptions = () => (googleCourses ? (googleCourses.length ? googleCourses.map((g) => `<option value="${esc(g.id)}">${esc(g.name)}</option>`).join("") : `<option value="">No active courses where you're a teacher</option>`) : `<option value="">Loading your courses…</option>`);
  async function loadCourses() {
    if (googleCourses) return;
    try { googleCourses = (await api("/google/courses")).courses; } catch (e) { say(e.message); googleCourses = null; return; }
    document.querySelectorAll("[data-gcourse]").forEach((s) => { s.innerHTML = courseOptions(); });
  }
  function lmsLine(c) {
    const courses = c.lti_courses || [];
    return courses.length ? `<p class="small">Connected LMS course${courses.length > 1 ? "s" : ""}: ${courses.map((x) => `<strong>${esc(x.context_title)}</strong>`).join(", ")}. Students who open its MoneyExplained assignments join this class automatically.</p>` : "";
  }
  function rosterBox(c, r) {
    const ours = [...c.class_students].sort((a, b) => a.nickname.localeCompare(b.nickname));
    const options = (sel) => `<option value="">Not matched</option>${r.students.map((g) => `<option value="${esc(g.userId)}"${g.userId === sel ? " selected" : ""}>${esc(g.name)}</option>`).join("")}`;
    return `<div class="table-wrap"><table class="roster"><caption class="sr-only">Match students to Google Classroom</caption>
      <thead><tr><th scope="col">MoneyExplained nickname</th><th scope="col">Google Classroom student</th></tr></thead>
      <tbody>${ours.map((s) => `<tr><th scope="row">${esc(s.nickname)}</th><td><select data-gmatch="${esc(s.id)}" aria-label="Classroom student for ${esc(s.nickname)}">${options(r.matches[s.id] || r.suggested[s.id] || "")}</select>${!r.matches[s.id] && r.suggested[s.id] ? ` <span class="small muted">suggested</span>` : ""}</td></tr>`).join("")}</tbody></table></div>
      <button type="button" class="btn btn-primary" data-gsave>Save matches</button>`;
  }

  function render() {
    // Keep open sections open across a redraw.
    const open = new Set([...document.querySelectorAll("[data-class] details[open]")].map((d) => `${d.closest("[data-class]").dataset.class}:${d.dataset.key || d.className}`));
    $("class-list").innerHTML = data.classes.length ? data.classes.map((c) => `
      <article class="card class-item" data-class="${esc(c.id)}" aria-labelledby="class-${esc(c.id)}">
        <div class="class-item-head">
          <h3 id="class-${esc(c.id)}">${esc(c.name)}</h3>
          <span class="badge">${c.open ? "Open to join" : "Closed to new students"}</span>
        </div>
        <div class="class-share">
          <div><div class="small muted">Class code</div><div class="class-code">${esc(c.code)}</div></div>
          <div class="class-share-link"><div class="small muted">Student link</div><code>${esc(joinLink(c.code))}</code></div>
        </div>
        <div class="hero-actions">
          <button type="button" class="btn btn-ghost" data-copy="${esc(c.code)}">Copy student link</button>
          <button type="button" class="btn btn-ghost" data-toggle="${c.open ? "close" : "open"}">${c.open ? "Stop new joins" : "Let students join"}</button>
          <button type="button" class="btn btn-ghost" data-csv ${c.class_students.length ? "" : "disabled"}>Download CSV</button>
          <button type="button" class="btn btn-ghost" data-delete>Delete class</button>
        </div>
        ${lmsLine(c)}
        ${assignPicker(c)}
        ${googleBox(c)}
        ${roster(c)}
      </article>`).join("") : `<p class="muted">No classes yet. Create one above to get a code for your students.</p>`;
    $("class-list").querySelectorAll("[data-class]").forEach(syncUnitBoxes);
    $("class-list").querySelectorAll("[data-class] details").forEach((d) => { if (open.has(`${d.closest("[data-class]").dataset.class}:${d.dataset.key || d.className}`)) d.open = true; });
    if (document.querySelector("[data-gcourse]") && google.connected) loadCourses();
    $("google-connect").hidden = !data.googleClassroom;
    $("google-connect").textContent = google.connected ? "Disconnect Google Classroom" : "Connect Google Classroom";
    $("lms-help").hidden = !data.lti;
    $("lms-config-url").textContent = `${location.origin}/lti/config.json`;
  }

  /* ---------- CSV (spreadsheet-safe) ---------- */
  function csv(c) {
    const cell = (v) => { let s = String(v ?? ""); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };
    const assigned = assignedOf(c);
    const head = ["Nickname", "Lessons completed", ...(assigned.length ? [`Assigned completed (of ${assigned.length}${c.assigned_due ? `, due ${c.assigned_due}` : ""})`] : []), "First-try average %", "Best practice average %", "Check-up before", "Check-up after", "Last active", ...data.lessons.map((id) => LESSONS.find((l) => l.id === id)?.title || id), ...data.lessons.map((id) => `${LESSONS.find((l) => l.id === id)?.title || id} (first try)`)];
    const rows = c.class_students.map((s) => {
      const x = studentSummary(s, assigned);
      return [s.nickname, x.done, ...(assigned.length ? [x.assignedDone] : []), x.firstPct ?? "", x.pct ?? "", x.pre ?? "", x.post ?? "", (s.updated_at || "").slice(0, 10), ...data.lessons.map((id) => { const r = s.progress?.lessons?.[id]; return r ? `${r[0]}/${r[1]}` : ""; }), ...data.lessons.map((id) => { const r = s.graded?.[id]; return r ? `${r[0]}/${r[1]}` : ""; })];
    });
    const blob = new Blob(["﻿" + [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${c.name.replace(/[^\w -]+/g, "").trim() || "class"} progress.csv`;
    document.body.append(a); a.click(); a.remove();  // the link must be in the page for the download to start
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- Actions ---------- */
  async function load() {
    data = await api("/classes");
    if (data.googleClassroom) {
      try { google = await api("/google/status"); } catch (e) { say(e.message); }
    }
    render();
  }

  $("google-connect").addEventListener("click", (e) => busy(e.currentTarget, async () => {
    if (google.connected) {
      if (!confirm("Disconnect Google Classroom? Assignments already in Classroom stay there, but MoneyExplained can't send grades until you connect again.")) return;
      await api("/google/disconnect", "POST", {});
      googleCourses = null;
      await load();
      say("Disconnected Google Classroom.");
    } else {
      location.href = (await api("/google/connect", "POST", {})).url;
    }
  }));

  // Google Classroom actions inside a class card.
  async function googleAction(button, c, card) {
    if ("glink" in button.dataset) {
      const courseId = card.querySelector("[data-gcourse]")?.value;
      if (!courseId) { say("Choose a Classroom course first."); return; }
      await busy(button, async () => { const r = await api(`/classes/${c.id}/google`, "PUT", { courseId }); await load(); say(`Linked ${c.name} to ${r.linked.courseName}.`); });
    } else if ("gunlink" in button.dataset) {
      if (!confirm(`Unlink ${c.name} from Google Classroom? Assignments already posted stay in Classroom.`)) return;
      await busy(button, async () => { await api(`/classes/${c.id}/google`, "PUT", { courseId: null }); await load(); say(`Unlinked ${c.name}.`); });
    } else if ("gpost" in button.dataset) {
      await busy(button, async () => { const r = await api(`/classes/${c.id}/google/post`, "POST", {}); await load(); say(`Posted ${r.posted} lesson${r.posted === 1 ? "" : "s"} to Google Classroom.`); });
    } else if ("groster" in button.dataset) {
      await busy(button, async () => {
        const r = await api(`/classes/${c.id}/google/roster`);
        card.querySelector("[data-groster-box]").innerHTML = r.students.length ? rosterBox(c, r) : `<p class="small muted">No students in the Classroom course yet.</p>`;
        say("Match each nickname to a Classroom student, then save.");
      });
    } else if ("gsave" in button.dataset) {
      const matches = Object.fromEntries([...card.querySelectorAll("[data-gmatch]")].map((s) => [s.dataset.gmatch, s.value || null]));
      const picked = Object.values(matches).filter(Boolean);
      if (new Set(picked).size !== picked.length) { say("Each Classroom student can be matched to only one nickname."); return; }
      await busy(button, async () => { await api(`/classes/${c.id}/google/match`, "PUT", { matches }); say(`Saved ${picked.length} match${picked.length === 1 ? "" : "es"}.`); });
    } else if ("gsync" in button.dataset) {
      await busy(button, async () => {
        const r = await api(`/classes/${c.id}/google/sync`, "POST", {});
        say(`Sent ${r.updated} grade${r.updated === 1 ? "" : "s"} to Google Classroom (${r.unchanged} already up to date${r.unmatched ? `, ${r.unmatched} student${r.unmatched === 1 ? "" : "s"} not matched yet` : ""}).`);
      });
    }
  }

  $("class-list").addEventListener("change", (e) => {
    const card = e.target.closest("[data-class]");
    if (!card) return;
    if (e.target.dataset.unit) card.querySelectorAll(`[data-in="${e.target.dataset.unit}"]`).forEach((i) => { i.checked = e.target.checked; });
    syncUnitBoxes(card);
  });

  $("class-list").addEventListener("click", (e) => {
    const card = e.target.closest("[data-class]"), button = e.target.closest("button");
    if (!card || !button) return;
    const c = data.classes.find((x) => x.id === card.dataset.class);
    if (Object.keys(button.dataset).some((k) => /^g[a-z]/.test(k))) { googleAction(button, c, card); return; }
    if (button.dataset.copy) {
      navigator.clipboard.writeText(joinLink(c.code)).then(() => FG.toast("Student link copied 🔗"), () => FG.toast(joinLink(c.code)));
    } else if (button.dataset.toggle) {
      busy(button, async () => { await api(`/classes/${c.id}`, "PUT", { open: button.dataset.toggle === "open" }); await load(); say(button.dataset.toggle === "open" ? `${c.name} is open to new students.` : `${c.name} is closed to new students. Current students keep syncing.`); });
    } else if ("saveAssign" in button.dataset) {
      const ids = [...card.querySelectorAll("[name=assign]:checked")].map((i) => i.value);
      const due = ids.length ? card.querySelector("[data-due]").value || null : null;  // clearing the lessons clears the date
      busy(button, async () => {
        await api(`/classes/${c.id}`, "PUT", { assigned: ids, assignedDue: due });
        await load();
        say(ids.length ? `Assigned ${ids.length} lesson${ids.length > 1 ? "s" : ""} to ${c.name}${due ? `, due ${dueText(due)}` : ""}.` : `Cleared the assigned lessons for ${c.name}.`);
      });
    } else if ("csv" in button.dataset) {
      csv(c);
    } else if ("delete" in button.dataset) {
      if (!confirm(`Delete "${c.name}"? This permanently removes the class and all of its students' progress from MoneyExplained.`)) return;
      busy(button, async () => { await api(`/classes/${c.id}`, "DELETE"); await load(); say(`Deleted ${c.name}.`); $("class-name-input").focus(); });
    } else if (button.dataset.rejoin) {
      const s = c.class_students.find((x) => x.id === button.dataset.rejoin);
      busy(button, async () => {
        const r = await api(`/classes/${c.id}/students/${s.id}/rejoin`, "POST", {});
        say(`Rejoin code for ${r.nickname}: ${r.code.split("").join(" ")}. It works once, for 24 hours. On the new device: My progress → Your class → "Already in this class on another device?", with the class code and the nickname ${r.nickname}. The old device leaves the class.`);
      });
    } else if (button.dataset.remove) {
      const s = c.class_students.find((x) => x.id === button.dataset.remove);
      if (!confirm(`Remove ${s.nickname} from ${c.name}? Their progress in this class is deleted; their own device keeps it.`)) return;
      busy(button, async () => { await api(`/classes/${c.id}/students/${s.id}`, "DELETE"); await load(); say(`Removed ${s.nickname}.`); });
    }
  });

  $("new-class").addEventListener("submit", (e) => {
    e.preventDefault();
    const button = e.submitter || $("new-class").querySelector("[type=submit]");
    if (!$("class-name-input").value.trim()) { say("Name the class first."); return; }
    busy(button, async () => {
      const { class: made } = await api("/classes", "POST", { name: $("class-name-input").value });
      $("class-name-input").value = "";
      await load();
      say(`Created ${made.name}. Code: ${made.code.split("").join(" ")}.`);
    });
  });

  async function authenticate(signup, button) {
    if (!$("auth-form").reportValidity()) return;
    if (signup && !$("adult-consent").checked) { say("Confirm that you're 18 or older and agree to the privacy terms to create an account."); return; }
    await busy(button, async () => {
      const r = await api(`/auth/${signup ? "signup" : "login"}`, "POST", { email: $("auth-email").value, password: $("auth-password").value, adultConsent: $("adult-consent").checked });
      say(r.message);
      if (r.authenticated) await start();
    });
  }
  $("auth-form").addEventListener("submit", (e) => { e.preventDefault(); authenticate(false, e.submitter || $("auth-form").querySelector("[type=submit]")); });
  $("signup").addEventListener("click", (e) => authenticate(true, e.currentTarget));
  $("refresh").addEventListener("click", (e) => busy(e.currentTarget, async () => { await load(); say("Updated."); }));
  $("logout").addEventListener("click", (e) => busy(e.currentTarget, async () => { await api("/auth/logout", "POST", {}); FG.account.remember(null); data.classes = []; render(); show("signin"); say("Signed out."); }));

  async function start() {
    try {
      const me = await api("/me");
      FG.account.remember(me);
      if (me.ageGroup === "teen") { show("signin"); say(`You're signed in as ${me.email}, a student account. Classes are for teacher accounts: sign in with one below.`); return; }
      $("account-email").textContent = me.email;
      // Signed in from an LMS launch: go back to finish connecting the course.
      const ticket = params.get("lti");
      if (ticket && /^[A-Za-z0-9_-]{43}$/.test(ticket)) { location.replace(`lti.html#t=${ticket}${params.get("f") === "1" ? "&f=1" : ""}`); return; }
      show("dashboard");
      await load();
      const result = { connected: "Google Classroom is connected. Link a class to a course below.", denied: "Google Classroom wasn't connected (permission was declined).",
        scopes: "Google Classroom needs all the permissions it asks for. Connect again and leave every box checked.", error: "Google Classroom couldn't be connected. Please try again." }[params.get("google")];
      if (result) { say(result); history.replaceState(null, "", location.pathname); }
    } catch (e) {
      if (e.status === 401) { show("signin"); return; }
      throw e;
    }
  }

  (async () => {
    if (config.apiOrigin && location.origin !== config.apiOrigin) {
      $("elsewhere-link").href = `${config.apiOrigin}/class.html`;
      show("elsewhere");
      return;
    }
    if (!(await FG.features()).classes) { show("unavailable"); return; }
    try { await start(); } catch (e) { show("signin"); say(e.message); }
  })();
})();
