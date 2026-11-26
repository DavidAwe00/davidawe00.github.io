// LMS launch page (lti.html#t=<ticket>). The server verified the launch and parked it as a ticket; this page
// decides what to show:
// - students: join the linked class as their LMS user, then open the assigned lesson (in its own tab);
// - teachers adding lessons (Deep Linking): pick lessons, which go back to the LMS as graded assignments;
// - teachers in a course that isn't connected yet: sign in once and connect it to a MoneyExplained class.
(function () {
  const $ = (id) => document.getElementById(id);
  const SECTIONS = ["problem", "framed", "link", "signin", "linked-elsewhere", "pick", "teacher"];
  const show = (id) => { SECTIONS.forEach((s) => ($(s).hidden = s !== id)); $("notice").textContent = ""; };
  const say = (text) => { $("notice").textContent = text; };
  const hash = new URLSearchParams(location.hash.slice(1));
  const ticket = /^[A-Za-z0-9_-]{43}$/.test(hash.get("t") || "") ? hash.get("t") : null;
  const fromFrame = hash.get("f") === "1";  // opened in a new tab from the LMS's frame to connect the course
  const framed = (() => { try { return window.top !== window.self; } catch { return true; } })();
  const lessonTitle = (id) => LESSONS.find((l) => l.id === id)?.title || id;
  const newTabUrl = () => `${location.origin}${location.pathname}#t=${ticket}&f=1`;
  let info;

  async function api(path, method = "POST", body, retry = true) {
    let r;
    try {
      r = await fetch(`/api${path}`, { method, credentials: "same-origin", headers: { "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(35000) });
    } catch { throw new Error("Could not reach MoneyExplained. If it was asleep, try again in a minute."); }
    if (r.status === 401 && retry && path === "/me") {
      try { await api("/auth/refresh", "POST", {}, false); return api(path, method, body, false); } catch { /* not signed in */ }
    }
    let out;
    try { out = await r.json(); } catch { throw new Error("MoneyExplained isn't responding. Try again in a minute."); }
    if (!r.ok) { const e = new Error(out.error || "Something went wrong."); e.status = r.status; throw e; }
    return out;
  }
  function fail(message) { $("problem-text").textContent = message; show("problem"); }

  async function start() {
    if (!ticket) return fail("Open MoneyExplained from an assignment or the apps menu in your course.");
    info = await api("/lti/ticket", "POST", { ticket });
    document.querySelectorAll("[data-course]").forEach((el) => { el.textContent = info.courseTitle; });
    if (!info.teacher) return student();
    if (!info.linked) return connect();
    if (fromFrame) { say(`Connected to ${info.linked.name}. Go back to your course tab and choose "I've connected it, continue".`); SECTIONS.forEach((s) => ($(s).hidden = true)); return; }
    if (info.kind === "deeplink") return pick();
    $("teacher-text").textContent = `Students who open it join ${info.linked.name} and go straight to "${lessonTitle(info.lesson)}". `
      + (info.grades ? "Their quiz score is sent to this assignment in your gradebook." : "This assignment has no gradebook column, so scores show on the class dashboard only.");
    show("teacher");
  }

  /* ---------- Students ---------- */
  async function student() {
    if (framed) {  // storage in an LMS frame is separate from the site, so lessons open in their own tab
      $("framed-title").textContent = info.lesson ? lessonTitle(info.lesson) : "Open MoneyExplained";
      $("framed-link").href = location.href;
      show("framed");
      return;
    }
    say("Joining your class…");
    const r = await api("/lti/student", "POST", { ticket });
    try { localStorage.setItem("fg-class-v1", JSON.stringify({ token: r.token, className: r.className, nickname: r.nickname })); }
    catch { return fail("Your browser is blocking storage for this site, so your progress can't be saved. Allow site data for MoneyExplained and open the assignment again."); }
    history.replaceState(null, "", location.pathname);
    location.replace(r.lesson ? `learn.html#${r.lesson}` : "badges.html");
  }

  /* ---------- Teachers: connect the course once ---------- */
  async function connect() {
    if (framed) {  // signing in needs our own tab (the LMS frame usually can't keep our sign-in cookie)
      $("connect-tab").href = newTabUrl();
      show("linked-elsewhere");
      return;
    }
    try { FG.account.remember(await api("/me", "GET")); } catch (e) {
      if (e.status !== 401) throw e;
      show("signin");
      $("auth-email").focus();
      return;
    }
    const { classes } = await api("/classes", "GET");
    const select = $("link-class");
    select.replaceChildren(...classes.map((c) => new Option(c.name, c.id)), new Option(`New class: ${info.courseTitle}`, ""));
    show("link");
  }
  // Sign in, or create a teacher account, without leaving the launch.
  async function authenticate(signup, button) {
    const message = (text) => { $("auth-message").textContent = text; };
    if (!$("auth-form").reportValidity()) return;
    if (signup && !$("adult-consent").checked) { message("Confirm that you're 18 or older and agree to the privacy terms to create an account."); $("adult-consent").focus(); return; }
    button.disabled = true;
    try {
      const r = await api(`/auth/${signup ? "signup" : "login"}`, "POST", { email: $("auth-email").value, password: $("auth-password").value, adultConsent: $("adult-consent").checked });
      if (!r.authenticated) {  // a new account waiting for email confirmation
        message(`${r.message} This page stays open: once you've confirmed, sign in here to finish connecting the course.`);
        $("auth-password").value = "";
        return;
      }
      message("");
      await connect();
    } catch (err) { message(err.message); } finally { button.disabled = false; }
  }
  $("auth-form").addEventListener("submit", (e) => { e.preventDefault(); authenticate(false, $("signin-submit")); });
  $("signup").addEventListener("click", (e) => {
    $("auth-password").autocomplete = "new-password";
    authenticate(true, e.currentTarget);
  });

  $("link-save").addEventListener("click", async (e) => {
    const button = e.currentTarget;
    button.disabled = true;
    try {
      const id = $("link-class").value;
      const r = await api("/lti/link", "POST", { ticket, ...(id ? { classId: id } : { name: info.courseTitle }) });
      say(`Connected ${info.courseTitle} to ${r.class.name}.`);
      await start();
    } catch (err) { say(err.message); } finally { button.disabled = false; }
  });
  $("connect-done").addEventListener("click", async (e) => {
    const button = e.currentTarget;
    button.disabled = true;
    try { await start(); if (!info.linked) say("It isn't connected yet. Finish connecting it in the other tab first."); }
    catch (err) { say(err.message); } finally { button.disabled = false; }
  });

  /* ---------- Teachers: pick lessons (Deep Linking) ---------- */
  function pick() {
    $("pick-class").textContent = info.linked.name;
    $("pick-units").innerHTML = UNITS.map((u) => `<fieldset class="assign-unit">
      <legend><label><input type="checkbox" data-unit="${u.id}"> ${u.icon} ${u.title}</label></legend>
      ${u.lessons.map((id) => `<label><input type="checkbox" name="lesson" value="${id}" data-in="${u.id}"> ${LESSONS.find((l) => l.id === id)?.icon || ""} ${lessonTitle(id)}</label>`).join("")}
    </fieldset>`).join("");
    show("pick");
    count();
  }
  const chosen = () => [...document.querySelectorAll("[name=lesson]:checked")].map((i) => i.value);
  function count() {
    const n = chosen().length;
    $("pick-save").textContent = n ? `Add ${n} lesson${n > 1 ? "s" : ""}` : "Add lessons";
    document.querySelectorAll("[data-unit]").forEach((box) => {
      const items = [...document.querySelectorAll(`[data-in="${box.dataset.unit}"]`)], on = items.filter((i) => i.checked).length;
      box.checked = on === items.length; box.indeterminate = on > 0 && on < items.length;
    });
  }
  $("pick-units").addEventListener("change", (e) => {
    if (e.target.dataset.unit) document.querySelectorAll(`[data-in="${e.target.dataset.unit}"]`).forEach((i) => { i.checked = e.target.checked; });
    count();
  });
  $("pick-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const lessons = chosen();
    if (!lessons.length) { say("Choose at least one lesson."); return; }
    $("pick-save").disabled = true;
    try {
      const r = await api("/lti/deeplink", "POST", { ticket, lessons });
      say(`Adding ${r.count} lesson${r.count > 1 ? "s" : ""} to your course…`);
      $("return-form").action = r.returnUrl;
      $("return-jwt").value = r.jwt;
      $("return-form").submit();
    } catch (err) { say(err.message); $("pick-save").disabled = false; }
  });

  start().catch((e) => fail(e.message));
})();
