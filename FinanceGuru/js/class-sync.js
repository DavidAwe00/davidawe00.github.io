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
    if (!r.ok) throw new Error(data.error || "The class service didn't respond. Try again in a minute.");
    return data;
  }

  // Classes are available when the API answers and reports them turned on.
  let available = null;
  function isAvailable() {
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
      save({ ...load(), className: r.className, assigned, checkedAt: Date.now() });
      document.dispatchEvent(new Event("classchange"));
    } catch { /* offline: keep the last list */ }
  }
  const assigned = () => (load()?.assigned || []);

  async function join(code, nickname) {
    const r = await post("join", { code, nickname });
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
    document.dispatchEvent(new Event("classchange"));
  }

  document.addEventListener("progresschange", sync);
  sync();
  refresh();
  return { load, join, leave, sync, refresh, assigned, isAvailable };
})();
