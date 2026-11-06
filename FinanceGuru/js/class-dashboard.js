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
    return { done: lessons.length, pct, units, assignedDone, pre: s.progress?.checkup?.pre, post: s.progress?.checkup?.post };
  }
  const assignedOf = (c) => (c.assigned || []).filter((id) => data.lessons.includes(id));
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
      return `<tr><th scope="row">${esc(lessonTitle[id] || id)}</th><td>${scores.length}/${students.length}</td><td>${pct === null ? "—" : `${pct}%`}</td></tr>`;
    }).join("");
    return `<details class="by-lesson"><summary>Scores by lesson</summary><div class="table-wrap"><table class="roster"><thead><tr><th scope="col">Lesson</th><th scope="col">Finished</th><th scope="col">Average quiz</th></tr></thead><tbody>${rows}</tbody></table></div></details>`;
  }

  function roster(c) {
    const students = [...c.class_students].sort((a, b) => a.nickname.localeCompare(b.nickname));
    if (!students.length) return `<p class="muted">No students yet. They open <strong>My progress</strong> on FinanceGuru, choose <strong>Your class</strong>, and enter the code (or use the student link).</p>`;
    const assigned = assignedOf(c);
    const head = `<tr><th scope="col">Nickname</th><th scope="col">Lessons</th>${assigned.length ? `<th scope="col">Assigned</th>` : ""}<th scope="col">Avg quiz</th>${UNITS.map((u) => `<th scope="col" class="unit-col" title="${esc(u.title)}"><span aria-hidden="true">${u.icon}</span><span class="sr-only">${esc(u.title)}</span></th>`).join("")}<th scope="col">Check-up</th><th scope="col">Last active</th><th scope="col"><span class="sr-only">Remove</span></th></tr>`;
    const rows = students.map((s) => {
      const x = studentSummary(s, assigned);
      return `<tr><th scope="row">${esc(s.nickname)}</th><td>${x.done}/${total()}</td>${assigned.length ? `<td class="${x.assignedDone === assigned.length ? "unit-done" : ""}">${x.assignedDone}/${assigned.length}</td>` : ""}<td>${x.pct === null ? "—" : `${x.pct}%`}</td>
        ${x.units.map((u) => `<td class="unit-col${u.done === u.of ? " unit-done" : ""}">${u.done}/${u.of}</td>`).join("")}
        <td>${checkup(x)}</td><td>${when(s.updated_at)}</td>
        <td><button type="button" class="icon-btn" data-remove="${esc(s.id)}" aria-label="Remove ${esc(s.nickname)}">✕</button></td></tr>`;
    }).join("");
    return `<p class="small">${esc(classSummary(students))}</p>
      <div class="table-wrap"><table class="roster"><caption class="sr-only">Students in ${esc(c.name)}</caption><thead>${head}</thead><tbody>${rows}</tbody></table></div>
      <p class="small muted">${assigned.length ? "Assigned: assigned lessons finished. " : ""}Unit columns: ${UNITS.map((u) => `${u.icon} ${esc(u.title)}`).join(" · ")}. Check-up: before → after, out of ${data.checkupQuestions}.</p>
      ${byLesson(students)}`;
  }

  // Lesson picker grouped by unit; a unit's checkbox selects or clears all of its lessons.
  function assignPicker(c) {
    const chosen = assignedOf(c);
    const units = UNITS.map((u) => ({ u, ids: u.lessons.filter((id) => data.lessons.includes(id)) })).filter((x) => x.ids.length);
    return `<details class="assign"><summary>Assigned lessons (${chosen.length})</summary>
      <p class="small muted">Students see assigned lessons on My progress and tagged in the lesson list. Their scores show in the Assigned column.</p>
      <div class="assign-units">${units.map(({ u, ids }) => `<fieldset class="assign-unit">
        <legend><label><input type="checkbox" data-unit="${esc(u.id)}"> ${u.icon} ${esc(u.title)}</label></legend>
        ${ids.map((id) => `<label><input type="checkbox" name="assign" value="${esc(id)}" data-in="${esc(u.id)}"${chosen.includes(id) ? " checked" : ""}> ${esc(lessonTitle[id] || id)}</label>`).join("")}
      </fieldset>`).join("")}</div>
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

  function render() {
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
        ${assignPicker(c)}
        ${roster(c)}
      </article>`).join("") : `<p class="muted">No classes yet. Create one above to get a code for your students.</p>`;
    $("class-list").querySelectorAll("[data-class]").forEach(syncUnitBoxes);
  }

  /* ---------- CSV (spreadsheet-safe) ---------- */
  function csv(c) {
    const cell = (v) => { let s = String(v ?? ""); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };
    const assigned = assignedOf(c);
    const head = ["Nickname", "Lessons completed", ...(assigned.length ? [`Assigned completed (of ${assigned.length})`] : []), "Average quiz %", "Check-up before", "Check-up after", "Last active", ...data.lessons.map((id) => LESSONS.find((l) => l.id === id)?.title || id)];
    const rows = c.class_students.map((s) => {
      const x = studentSummary(s, assigned);
      return [s.nickname, x.done, ...(assigned.length ? [x.assignedDone] : []), x.pct ?? "", x.pre ?? "", x.post ?? "", (s.updated_at || "").slice(0, 10), ...data.lessons.map((id) => { const r = s.progress?.lessons?.[id]; return r ? `${r[0]}/${r[1]}` : ""; })];
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
    render();
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
    if (button.dataset.copy) {
      navigator.clipboard.writeText(joinLink(c.code)).then(() => FG.toast("Student link copied 🔗"), () => FG.toast(joinLink(c.code)));
    } else if (button.dataset.toggle) {
      busy(button, async () => { await api(`/classes/${c.id}`, "PUT", { open: button.dataset.toggle === "open" }); await load(); say(button.dataset.toggle === "open" ? `${c.name} is open to new students.` : `${c.name} is closed to new students. Current students keep syncing.`); });
    } else if ("saveAssign" in button.dataset) {
      const ids = [...card.querySelectorAll("[name=assign]:checked")].map((i) => i.value);
      busy(button, async () => {
        await api(`/classes/${c.id}`, "PUT", { assigned: ids });
        await load();
        say(ids.length ? `Assigned ${ids.length} lesson${ids.length > 1 ? "s" : ""} to ${c.name}.` : `Cleared the assigned lessons for ${c.name}.`);
      });
    } else if ("csv" in button.dataset) {
      csv(c);
    } else if ("delete" in button.dataset) {
      if (!confirm(`Delete "${c.name}"? This permanently removes the class and all of its students' progress from FinanceGuru.`)) return;
      busy(button, async () => { await api(`/classes/${c.id}`, "DELETE"); await load(); say(`Deleted ${c.name}.`); $("class-name-input").focus(); });
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
  $("logout").addEventListener("click", (e) => busy(e.currentTarget, async () => { await api("/auth/logout", "POST", {}); data.classes = []; render(); show("signin"); say("Signed out."); }));

  async function start() {
    try {
      const me = await api("/me");
      $("account-email").textContent = me.email;
      show("dashboard");
      await load();
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
    let features = {};
    try { features = await (await fetch("/api/config", { credentials: "same-origin" })).json(); } catch { /* static site */ }
    if (!features.classes) { show("unavailable"); return; }
    try { await start(); } catch (e) { show("signin"); say(e.message); }
  })();
})();
