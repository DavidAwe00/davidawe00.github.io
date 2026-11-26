// Class membership for students (no account): joining with a teacher's code stores a random token in this
// browser, and lesson quiz scores and Money Check-up answers are sent with it whenever progress changes.
// The server keeps only the scores. The API may live on another site (SITE_CONFIG.apiOrigin); no cookies are sent.
const ClassSync = (() => {
  const KEY = "fg-class-v1";
  const api = (typeof SITE_CONFIG === "object" && SITE_CONFIG.apiOrigin) || "";
  const load = () => { try { const m = JSON.parse(localStorage.getItem(KEY)); return m && typeof m.token === "string" ? m : null; } catch { return null; } };
  const save = (m) => { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch { /* storage blocked */ } };
  const clear = () => { try { localStorage.removeItem(KEY); } catch { /* storage blocked */ } };

  async function post(path, body) {
    const r = await fetch(`${api}/api/class/${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "omit", keepalive: true });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(data.error || "The class service didn't respond. Try again in a minute."); e.status = r.status; throw e; }
    return data;
  }

  // Classes are available when the API answers and reports them turned on.
  let available = null;
  function isAvailable() {
    // The static site with no apiOrigin has no class service to ask.
    if (!api && typeof SITE_CONFIG === "object" && SITE_CONFIG.staticSite) available ||= Promise.resolve(false);
    available ||= fetch(`${api}/api/config`, { credentials: "omit" }).then((r) => (r.ok ? r.json() : {})).then((c) => c.classes === true).catch(() => false);
    return available;
  }

  function snapshot() {
    let checkup = {};
    try { checkup = JSON.parse(localStorage.getItem("fg-checkup-v1")) || {}; } catch { /* unreadable: send none */ }
    return { done: FG.getProgress().done, checkup: { pre: checkup.pre, post: checkup.post } };
  }

  let timer = 0;
  function sync() {
    const m = load();
    if (!m) return;
    clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        const r = await post("progress", { token: m.token, progress: snapshot() });
        if (r.member) save({ ...m, syncedAt: Date.now() });
        else { clear(); document.dispatchEvent(new Event("classchange")); }  // the teacher removed this student
      } catch { /* offline or asleep: the next page view tries again */ }
    }, 800);
  }

  // The teacher's assigned lessons, checked at most every 5 minutes (and right after joining).
  async function refresh(force = false) {
    const m = load();
    if (!m || (!force && m.checkedAt && Date.now() - m.checkedAt < 300000)) return;
    try {
      const r = await post("status", { token: m.token });
      if (!r.member) { clear(); document.dispatchEvent(new Event("classchange")); return; }
      const assigned = Array.isArray(r.assigned) ? r.assigned.filter((id) => typeof id === "string") : [];
      const assignedDue = typeof r.assignedDue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.assignedDue) ? r.assignedDue : null;
      save({ ...load(), className: r.className, assigned, assignedDue, checkedAt: Date.now() });
      document.dispatchEvent(new Event("classchange"));
    } catch { /* offline: keep the last list */ }
  }
  const assigned = () => (load()?.assigned || []);
  // The due date as the teacher set it (a calendar date, so it's shown in UTC to avoid shifting a day).
  const assignedDue = () => (load()?.assignedDue || null);
  const dueLabel = (lang = "en") => {
    const due = assignedDue();
    return due ? new Date(`${due}T00:00:00Z`).toLocaleDateString(lang === "es" ? "es-US" : "en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }) : "";
  };
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const pastDue = () => Boolean(assignedDue()) && today() > assignedDue();

  // Quiz answers, sent as they're chosen so the server can check them. Only the first answer to each question
  // counts for the teacher. Answers that couldn't be sent (offline, server asleep) wait here and go with the next one.
  const PENDING = "fg-class-answers";
  const pending = () => { try { const p = JSON.parse(localStorage.getItem(PENDING)); return Array.isArray(p) ? p : []; } catch { return []; } };
  const setPending = (p) => { try { if (p.length) localStorage.setItem(PENDING, JSON.stringify(p.slice(-200))); else localStorage.removeItem(PENDING); } catch { /* storage blocked */ } };
  let flushing = Promise.resolve();
  function answer(lesson, question, choice) {
    if (!load()) return Promise.resolve(null);
    setPending([...pending(), { lesson, question, choice }]);
    return flush();
  }
  function flush() {
    flushing = flushing.then(async () => {
      let last = null;
      for (const a of pending()) {
        const m = load();
        if (!m) { setPending([]); return null; }
        try { last = { ...a, ...(await post("answer", { token: m.token, ...a })) }; }
        catch (e) {
          if (!(e.status >= 400 && e.status < 500 && e.status !== 429)) return last;  // offline or busy: keep the rest for later
          last = null;  // a rejected answer (e.g. a retired lesson) is dropped
        }
        setPending(pending().slice(1));
        if (last && last.member === false) { clear(); setPending([]); document.dispatchEvent(new Event("classchange")); return null; }
      }
      return last;
    }).catch(() => null);
    return flushing;
  }

  async function join(code, nickname, rejoin) {
    const r = await post(rejoin ? "rejoin" : "join", { code, nickname, ...(rejoin ? { rejoin } : {}) });
    save({ token: r.token, className: r.className, nickname: r.nickname });
    sync();
    refresh(true);
    document.dispatchEvent(new Event("classchange"));
    return r;
  }

  async function leave() {
    const m = load();
    if (m) await post("leave", { token: m.token });
    clear();
    setPending([]);
    document.dispatchEvent(new Event("classchange"));
  }

  document.addEventListener("progresschange", sync);
  sync();
  refresh();
  if (pending().length) flush();
  return { load, join, leave, sync, refresh, answer, assigned, assignedDue, dueLabel, pastDue, isAvailable };
})();
