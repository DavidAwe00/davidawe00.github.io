// Shared helpers: theme toggle, progress storage, formatting, toast.
const FG = (() => {
  const STORE_KEY = "fg-progress-v1";

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage blocked */ }
  }

  // Which app-server services are on (accounts, classes, newsletter, …). The static build (GitHub Pages) has no
  // app server, so it answers {} without a request that would only 404.
  let featuresLoading = null;
  function features() {
    if (typeof SITE_CONFIG === "object" && SITE_CONFIG.staticSite) return Promise.resolve({});
    return (featuresLoading ||= fetch("/api/config", { credentials: "same-origin", signal: AbortSignal.timeout(35000) }) // long enough for a sleeping host to wake
      .then((r) => (r.ok ? r.json() : {})).then((c) => (c && typeof c === "object" ? c : {})).catch(() => ({})));
  }

  function getProgress() {
    try { return JSON.parse(safeGet(STORE_KEY)) || { done: {}, xp: 0 }; }
    catch { return { done: {}, xp: 0 }; }
  }
  function completeLesson(id, score, total) {
    const p = getProgress();
    const prev = p.done[id];
    const earned = score * 10 + (prev ? 0 : 20); // first-time completion bonus
    if (!prev || score > prev.score) p.done[id] = { score, total };
    p.xp += earned;
    safeSet(STORE_KEY, JSON.stringify(p));
    renderXp();
    document.dispatchEvent(new Event("progresschange"));
    return earned;
  }

  function addXp(n) {
    const p = getProgress();
    p.xp += Math.max(0, Math.round(n));
    safeSet(STORE_KEY, JSON.stringify(p));
    renderXp();
  }

  // Saves a game's high score; returns { best, isNew }.
  function recordBest(game, score) {
    const key = "fg-best-" + game;
    const prev = parseFloat(safeGet(key)) || 0;
    const isNew = score > prev;
    if (isNew) safeSet(key, String(score));
    return { best: Math.max(prev, score), isNew };
  }
  const getBest = (game) => parseFloat(safeGet("fg-best-" + game)) || 0;

  const money = (n, digits = 0) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: digits, minimumFractionDigits: digits });
  const compact = (n) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });

  function toast(msg) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2600);
  }

  // Current daily-challenge streak (alive only if answered today or yesterday). See js/daily.js.
  function streak() {
    try {
      const s = JSON.parse(safeGet("fg-daily-v1")) || {};
      const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const y = new Date(); y.setDate(y.getDate() - 1);
      return s.last === key(new Date()) || s.last === key(y) ? s.streak || 0 : 0;
    } catch { return 0; }
  }

  function renderXp() {
    let el = document.querySelector("[data-xp]");
    if (!el) return;
    if (el.tagName !== "A") { // the pill links to the progress page
      const a = document.createElement("a");
      a.className = el.className; a.href = "badges.html"; a.setAttribute("data-xp", "");
      a.title = "Your level, streak & badges";
      el.replaceWith(a); el = a;
    }
    const s = streak();
    el.textContent = `${s ? `🔥${s} · ` : ""}${getProgress().xp} XP`;
  }

  function initTheme() {
    const saved = safeGet("fg-theme");
    if (saved) document.documentElement.dataset.theme = saved;
    const btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    const isDark = () =>
      document.documentElement.dataset.theme === "dark" ||
      (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    const label = () => {
      const es = document.documentElement.lang === "es";
      btn.textContent = isDark() ? "☀" : "☾";
      btn.setAttribute("aria-label", isDark() ? (es ? "Cambiar a modo claro" : "Switch to light mode") : (es ? "Cambiar a modo oscuro" : "Switch to dark mode"));
    };
    label();
    document.addEventListener("langchange", label);
    btn.addEventListener("click", () => {
      const next = isDark() ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      safeSet("fg-theme", next);
      label();
      document.dispatchEvent(new Event("themechange"));
    });
  }

  // The interest form stays hidden unless the app server says email signup is enabled. On the static
  // site (GitHub Pages) there is no server, so visitors only see the free-planner link.
  async function initSignup() {
    const forms = document.querySelectorAll("form[data-signup]");
    if (!forms.length) return;
    if ((await features()).newsletter !== true) return; // no app server or signup off: keep the form hidden
    document.querySelectorAll("[data-signup-off]").forEach((el) => (el.hidden = true));
    forms.forEach((form) => {
      form.hidden = false;
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const button = form.querySelector('button[type="submit"]');
        let status = form.querySelector('[data-signup-status]');
        if (!status) { status = document.createElement('p'); status.dataset.signupStatus = ''; status.setAttribute('role', 'status'); form.append(status); }
        button.disabled = true; status.textContent = 'Saving…';
        try {
          const response = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.querySelector('input[type="email"]').value, consent: form.querySelector('[data-email-consent]')?.checked === true }), signal: AbortSignal.timeout(15000) });
          const data = await response.json().catch(() => ({ error: 'Email signup is not available on this site yet. Please check back soon.' }));
          if (!response.ok) throw new Error(data.error);
          status.textContent = data.message; form.reset();
        } catch (error) { status.textContent = error.message || 'Could not save your email. Please try again later.'; }
        finally { button.disabled = false; }
      });
    });
  }

  // Accounts (where the app server serves the site): a "Sign in" / "Account" link in every header, and learning
  // progress synced between a signed-in learner's devices. The session itself is in HttpOnly cookies; this browser
  // only remembers who is signed in (email and age group) to show the link and to know to sync.
  const ACCOUNT_KEY = "me-account-v1";
  const SYNC_KEY = /^fg-(?:progress-v1|daily-v1|checkup-v1|capstone-v1|best-[a-z0-9-]{1,40})$/;  // same list as the server
  function account() {
    try { const a = JSON.parse(safeGet(ACCOUNT_KEY)); return a && typeof a.email === "string" ? a : null; } catch { return null; }
  }
  function rememberAccount(info) {
    if (info && info.email) safeSet(ACCOUNT_KEY, JSON.stringify({ email: info.email, ageGroup: info.ageGroup === "teen" ? "teen" : "adult" }));
    else { try { localStorage.removeItem(ACCOUNT_KEY); } catch { /* storage blocked */ } }
    renderAccountLink();
  }
  async function accountApi(path, method = "GET", body, retry = true) {
    let r;
    try {
      r = await fetch(`/api${path}`, { method, credentials: "same-origin", keepalive: method === "PUT", headers: { "Content-Type": "application/json" },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(35000) });
    } catch { throw new Error("Could not reach MoneyExplained. If it was asleep, try again in a minute."); }
    if (r.status === 401 && retry) {
      const refreshed = await fetch("/api/auth/refresh", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => null);
      if (refreshed && refreshed.ok) return accountApi(path, method, body, false);
    }
    const out = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(out.error || "Something went wrong."); e.status = r.status; throw e; }
    return out;
  }

  function localProgress() {
    const out = {};
    try { Object.keys(localStorage).filter((k) => SYNC_KEY.test(k)).forEach((k) => { out[k] = localStorage.getItem(k); }); } catch { /* storage blocked */ }
    return out;
  }
  const stable = (o) => JSON.stringify(Object.keys(o).sort().map((k) => [k, o[k]]));
  const parse = (s) => { try { const v = JSON.parse(s); return v && typeof v === "object" ? v : null; } catch { return null; } };
  // Two devices' progress combined: the better score for each lesson, the higher XP and game bests, the more
  // recent daily streak; for anything else this device's copy wins, and the other fills in what's missing.
  function mergeProgress(local, remote) {
    const out = { ...remote, ...local };
    for (const k of Object.keys(out)) {
      const a = local[k], b = remote[k];
      if (a === undefined || b === undefined || a === b) continue;
      if (k === "fg-progress-v1") {
        const pa = parse(a), pb = parse(b);
        if (!pa || !pb) { out[k] = pa ? a : b; continue; }
        const done = { ...(pb.done || {}) };
        for (const [id, r] of Object.entries(pa.done || {})) if (!done[id] || (r && r.score > done[id].score)) done[id] = r;
        out[k] = JSON.stringify({ ...pb, ...pa, done, xp: Math.max(Number(pa.xp) || 0, Number(pb.xp) || 0) });
      } else if (k.startsWith("fg-best-")) {
        out[k] = String(Math.max(parseFloat(a) || 0, parseFloat(b) || 0));
      } else if (k === "fg-daily-v1") {
        const da = parse(a) || {}, db = parse(b) || {};
        out[k] = String(db.last || "") > String(da.last || "") ? b : a;
      }
    }
    return out;
  }

  let lastSynced = null, pushTimer = 0;
  async function pushProgress() {
    clearTimeout(pushTimer);
    if (!account() || lastSynced === null) return;
    const data = localProgress(), now = stable(data);
    if (now === lastSynced) return;
    try { await accountApi("/progress", "PUT", { data }); lastSynced = now; }
    catch (e) { if (e.status === 401) rememberAccount(null); }
  }
  async function syncProgress() {
    if (!account()) return { synced: false };
    let remote;
    try { remote = (await accountApi("/progress")).progress?.data || {}; }
    catch (e) { if (e.status === 401) rememberAccount(null); return { synced: false, error: e.message }; }
    const local = localProgress(), merged = mergeProgress(local, remote);
    let changed = false;
    for (const [k, v] of Object.entries(merged)) if (local[k] !== v) { safeSet(k, v); changed = true; }
    lastSynced = stable(remote);
    if (changed) { renderXp(); document.dispatchEvent(new Event("progresschange")); }
    await pushProgress();
    return { synced: true, changed };
  }
  let syncListening = false;
  function initAccountSync() {
    if (syncListening) return syncProgress();
    syncListening = true;
    document.addEventListener("progresschange", () => { clearTimeout(pushTimer); pushTimer = setTimeout(pushProgress, 1500); });
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") pushProgress(); });
    return syncProgress();
  }

  function renderAccountLink() {
    const link = document.querySelector("[data-account-link]");
    if (!link) return;
    const es = getLang() === "es";
    const a = account(), text = a ? (es ? "Cuenta" : "Account") : (es ? "Iniciar sesión" : "Sign in");
    if (es) link.lang = "es";
    // Phones show a person icon (the label stays for screen readers); wider screens show the words.
    link.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg><span class="nav-account-text">${text}</span>`;
    link.classList.toggle("signed-in", Boolean(a));
    link.setAttribute("aria-label", text);
    link.title = a ? `Signed in as ${a.email}` : "Sign in or create an account to save your progress on every device";
  }
  async function initAccount() {
    const nav = document.querySelector(".site-header .nav");
    const framed = (() => { try { return window.top !== window.self; } catch { return true; } })();
    if (!nav || framed || (await features()).accounts !== true) return;
    if (!nav.querySelector("[data-account-link]")) {
      const link = document.createElement("a");
      link.className = "nav-account"; link.href = "account.html"; link.dataset.accountLink = "";
      if (/(^|\/)account\.html$/.test(location.pathname)) link.setAttribute("aria-current", "page");
      const before = nav.querySelector("[data-lang-toggle]") || nav.querySelector("[data-theme-toggle]");
      if (before) before.before(link); else nav.append(link);
      renderAccountLink();
    }
    if (!/(^|\/)account\.html$/.test(location.pathname)) initAccountSync();  // the account page runs its own sync
  }

  // Games and the lesson player redraw with innerHTML, which drops keyboard focus to <body>.
  // For any [data-focus-root] the user was working in, move focus to the best control in the new
  // content: [data-autofocus], then an answer choice, then next/restart/start, then any button.
  function initFocusRescue() {
    document.querySelectorAll("[data-focus-root]").forEach((root) => {
      let owned = false;
      root.addEventListener("focusin", () => (owned = true));
      document.addEventListener("focusin", (e) => { if (!root.contains(e.target)) owned = false; });
      new MutationObserver(() => {
        const a = document.activeElement;
        const visible = (el) => el && el.getClientRects().length;
        // Focus is "lost" if it fell to <body>, or sits on something removed, hidden, or disabled.
        const lost = !a || a === document.body || !document.contains(a) || !visible(a) || a.disabled;
        if (!owned || !lost) return;
        const pick = ["[data-autofocus]", ".choice:not([disabled])", "[data-next], [data-restart], [data-start]", "button:not([disabled]), a[href], input, [tabindex='0']"]
          .map((sel) => [...root.querySelectorAll(sel)].find(visible)).find(Boolean);
        if (pick) pick.focus({ preventScroll: true });
      }).observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "disabled"] });
    });
  }

  // Header "Topics" dropdown (<details>): close it on outside click, Escape, or after choosing a link.
  function initNavMenu() {
    const menus = [...document.querySelectorAll(".nav-menu")];
    if (!menus.length) return;
    document.addEventListener("click", (e) => menus.forEach((m) => { if (m.open && !m.contains(e.target)) m.open = false; }));
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      menus.forEach((m) => { if (m.open) { m.open = false; m.querySelector("summary").focus(); } });
    });
  }

  // Calculators update their result tiles as you type, which a screen reader doesn't notice. After an
  // input or select settles, read out the edited section's [data-announce] element, else its headline
  // tile (.stat.hero, else the first .stat). Sections that already have their own live region announce themselves.
  function initResultAnnouncer() {
    let region = null, timer = 0, last = "";
    const visible = (el) => el.getClientRects().length;
    document.addEventListener("input", (e) => {
      if (!e.target.matches("input, select, textarea")) return;
      const scope = e.target.closest("[role=tabpanel]") || e.target.closest("section") || e.target.closest(".tool");
      if (!scope || scope.querySelector("[aria-live]")) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        const own = [...scope.querySelectorAll("[data-announce]")].find(visible);
        const stat = [...scope.querySelectorAll(".stat.hero"), ...scope.querySelectorAll(".stat")].find(visible);
        const label = stat?.querySelector(".label")?.textContent.trim(), value = stat?.querySelector(".value")?.textContent.trim();
        const text = own ? own.textContent.trim() : label && value && value !== "—" ? `${label}: ${value}` : "";
        if (!text || text === last) return;
        if (!region) { region = document.createElement("div"); region.className = "sr-only"; region.setAttribute("aria-live", "polite"); document.body.append(region); }
        region.textContent = last = text;
      }, 900);
    });
  }

  // Contact details come from site.config.json (js/site-config.js). With an email set, every footer gets a
  // "Report an error" link for the current page and [data-contact] blocks (About page) appear.
  const config = typeof SITE_CONFIG === "object" ? SITE_CONFIG : {};
  function initContact() {
    const email = config.contactEmail;
    if (!email) return;
    const mailto = (subject, body = "") => `mailto:${email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
    document.querySelectorAll("[data-contact-email]").forEach((a) => { a.href = mailto("MoneyExplained"); a.textContent = email; });
    document.querySelectorAll("[data-contact]").forEach((el) => (el.hidden = false));
    document.querySelectorAll(".site-footer .container > span:last-child").forEach((links) => {
      const a = document.createElement("a");
      a.href = mailto(`Error report: ${document.title}`, `Page: ${location.href.split("#")[0]}\n\nWhat looks wrong (and your source, if you have one):\n`);
      a.textContent = "Report an error";
      a.dataset.report = "";
      links.append(" · ", a);
    });
    if (document.documentElement.lang === "es") setChromeLang("es");  // the Learn page switched before this ran
  }

  // Once site.config.json names the YouTube channel, every page links the Videos page (Topics menu) and the channel (footer).
  function initVideosLink() {
    const channel = config.youtubeChannel;
    if (!channel) return;
    document.querySelectorAll(".nav-menu-panel").forEach((panel) => {
      if (!panel.querySelector('[href="videos.html"]')) panel.insertAdjacentHTML("beforeend", '<a href="videos.html"><span class="nav-menu-icon" aria-hidden="true">🎬</span><span><strong>Videos</strong><span class="small muted">Short lessons on YouTube</span></span></a>');
    });
    document.querySelectorAll(".site-footer .container > span:last-child").forEach((links) => {
      const a = document.createElement("a");
      a.href = channel; a.rel = "noopener"; a.textContent = "YouTube";
      links.append(" · ", a);
    });
    if (document.documentElement.lang === "es") setChromeLang("es");  // the Learn page switched before this ran
  }

  // Cookie-free page counts with GoatCounter when site.config.json names a site code. Never on the planner
  // (its links can carry paycheck figures), never locally, and not when the browser asks not to be tracked.
  function initAnalytics() {
    const code = config.goatcounter;
    if (code) {
      document.querySelectorAll("[data-analytics]").forEach((el) => (el.hidden = false));
      document.querySelectorAll("[data-no-analytics]").forEach((el) => (el.hidden = true));
    }
    if (!code || location.protocol !== "https:" || /(^|\/)plan\.html$/.test(location.pathname)) return;
    if (navigator.doNotTrack === "1" || navigator.globalPrivacyControl) return;
    window.goatcounter = { path: () => location.pathname };  // the path only: no query strings or hashes
    const s = document.createElement("script");
    s.async = true; s.src = "https://gc.zgo.at/count.js";
    s.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
    document.head.append(s);
  }

  // "Was this helpful?" under a lesson's results or a tool. Shown once page counts or a contact address
  // are set up, so an answer always reaches someone: the vote is a GoatCounter event (key + yes/no, nothing
  // else) when counting is allowed, and "No" offers an email link. Answers are kept here so we don't re-ask.
  const FEEDBACK_KEY = "fg-feedback-v1";
  const FEEDBACK_T = {
    en: { ask: "Was this helpful?", yes: "👍 Yes", no: "👎 No", thanks: "Thanks for the feedback!", missing: "Tell us what was missing →" },
    es: { ask: "¿Te sirvió?", yes: "👍 Sí", no: "👎 No", thanks: "¡Gracias por tu opinión!", missing: "Cuéntanos qué faltó →" },
  };
  function feedback(host, key, title, lang = "en") {
    if (!host || !(config.goatcounter || config.contactEmail)) { if (host) host.hidden = true; return; }
    const t = FEEDBACK_T[lang] || FEEDBACK_T.en;
    let saved = {};
    try { saved = JSON.parse(safeGet(FEEDBACK_KEY)) || {}; } catch { /* corrupt: start over */ }
    if (typeof saved !== "object" || Array.isArray(saved)) saved = {};
    const missingLink = () => config.contactEmail
      ? ` <a href="mailto:${config.contactEmail}?subject=${encodeURIComponent(`Feedback: ${title}`)}&body=${encodeURIComponent(`Page: ${location.href.split("#")[0]}${location.hash}

What was missing or confusing:
`)}">${t.missing}</a>` : "";
    const done = (vote) => { host.innerHTML = `<p class="small muted" role="status">${t.thanks}${vote === "no" ? missingLink() : ""}</p>`; };
    host.hidden = false;
    host.lang = lang;
    if (saved[key]) return done(saved[key]);
    host.innerHTML = `<div class="feedback" role="group" aria-label="${t.ask}"><span class="small">${t.ask}</span>
      <button class="btn btn-ghost" type="button" data-vote="yes">${t.yes}</button>
      <button class="btn btn-ghost" type="button" data-vote="no">${t.no}</button></div>`;
    host.querySelectorAll("[data-vote]").forEach((b) => b.addEventListener("click", () => {
      const vote = b.dataset.vote;
      saved[key] = vote;
      safeSet(FEEDBACK_KEY, JSON.stringify(saved));
      if (window.goatcounter && typeof window.goatcounter.count === "function") {
        window.goatcounter.count({ path: `feedback/${key}/${vote}`, title: `Feedback: ${title}`, event: true });
      }
      done(vote);
    }));
  }

  // Language, on every page: an EN/ES switch in the header; a one-time offer of Spanish to visitors whose browser
  // prefers it; and, on pages not translated yet, the header and footer in Spanish with a note saying so.
  // Pages with Spanish load js/i18n.js with a dictionary (script[data-dict]) or are marked <html data-es>.
  function switchLang(lang) {
    setLang(lang);
    const url = new URL(location.href);
    url.searchParams.delete("lang"); // a shared ?lang=es link would otherwise win again after the reload
    if (url.href !== location.href) location.replace(url.href); else location.reload();
  }
  function initLanguage() {
    const pref = getLang(), other = pref === "es" ? "en" : "es";
    const spanishPage = !!document.querySelector("script[data-dict]") || document.documentElement.hasAttribute("data-es");
    const nav = document.querySelector(".site-header .nav");
    if (nav && !nav.querySelector("[data-lang-toggle]")) {
      const b = document.createElement("button");
      b.type = "button"; b.className = "icon-btn lang-toggle"; b.dataset.langToggle = ""; b.lang = other;
      b.textContent = other.toUpperCase();
      b.title = other === "es" ? "Ver en español" : "View in English";
      b.setAttribute("aria-label", b.title);
      const theme = nav.querySelector("[data-theme-toggle]");
      if (theme) theme.before(b); else nav.append(b);
      b.addEventListener("click", () => switchLang(other));
    }
    const main = document.querySelector("main");
    if (pref === "es" && !spanishPage && main) {
      setChromeLang("es");
      document.documentElement.lang = "en"; // the page itself is still English, for screen readers
      main.insertAdjacentHTML("afterbegin", `<p class="lang-note container" lang="es">Esta página todavía está en inglés. <button type="button" class="link-btn" data-lang-en>View in English</button></p>`);
      main.querySelector("[data-lang-en]").addEventListener("click", () => switchLang("en"));
    }
    // Offer Spanish once, only to visitors who haven't chosen a language and whose browser asks for Spanish.
    const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    if (safeGet(LANG_KEY) === null && safeGet("fg-lang-offer") === null && langs.some((l) => /^es\b/i.test(l)) && main) {
      main.insertAdjacentHTML("afterbegin", `<div class="lang-offer" role="region" aria-label="Idioma / Language">
        <span lang="es">¿Prefieres leer MoneyExplained en español?</span>
        <button type="button" class="btn btn-primary" lang="es" data-offer="es">Ver en español</button>
        <button type="button" class="btn btn-ghost" data-offer="en">Continue in English</button></div>`);
      main.querySelector(".lang-offer").addEventListener("click", (e) => {
        const b = e.target.closest("[data-offer]");
        if (!b) return;
        safeSet("fg-lang-offer", b.dataset.offer);
        if (b.dataset.offer === "es") return switchLang("es");
        setLang("en");
        e.currentTarget.remove();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLanguage();
    initTheme();
    initVideosLink();
    initContact();
    initAnalytics();
    initNavMenu();
    initFocusRescue();
    initResultAnnouncer();
    renderXp();
    initSignup();
    initAccount();
    const y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  });

  const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Smooth scrolling, except for people who asked their system for less motion.
  const scrollTo = (el, block = "start") => el && el.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block });

  // Header and footer in Spanish for pages whose content is in Spanish (the Learn page). The linked pages
  // themselves are still in English. Sets <html lang> so screen readers switch pronunciation.
  const CHROME_ES = {
    "Learn": "Aprende", "Topics": "Temas", "Play": "Juega", "Tools": "Herramientas", "My plan": "Mi plan",
    "Investing": "Inversiones", "Returns, fees, and accounts": "Rendimientos, comisiones y cuentas",
    "College & careers": "Universidad y carreras", "Majors, pay, and ROI": "Carreras, salarios y rentabilidad",
    "Credit & debt": "Crédito y deudas", "Scores, cards, and loans": "Puntajes, tarjetas y préstamos",
    "Taxes": "Impuestos", "Brackets and paychecks": "Tramos y cheques de pago",
    "Housing": "Vivienda", "Mortgages and rent vs buy": "Hipotecas y alquilar vs. comprar",
    "Videos": "Videos", "Short lessons on YouTube": "Lecciones cortas en YouTube",
    "MoneyExplained. For educational purposes only — not financial advice.": "MoneyExplained. Solo con fines educativos; no es asesoría financiera.",
    "Invest": "Invertir", "College": "Universidad", "Credit": "Crédito", "Teachers & parents": "Docentes y familias",
    "Privacy": "Privacidad", "Terms": "Términos", "About": "Acerca de", "Report an error": "Reportar un error",
  };
  const chromeOriginal = new WeakMap();
  function setChromeLang(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll(".site-header, .site-footer").forEach((root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!chromeOriginal.has(n)) chromeOriginal.set(n, n.nodeValue);
        const en = chromeOriginal.get(n), key = en.trim();
        n.nodeValue = lang === "es" && CHROME_ES[key] ? en.replace(key, CHROME_ES[key]) : en;
      }
    });
    document.dispatchEvent(new Event("langchange"));
  }

  // The visitor's lesson language ("en" or "es"), shared by the Learn page, daily challenge, and Check-up.
  const LANG_KEY = "fg-lang";
  function getLang() { return safeGet(LANG_KEY) === "es" ? "es" : "en"; }
  function setLang(lang) { safeSet(LANG_KEY, lang); }
  // Spanish lesson text (js/lessons.es.js) for pages that load it only when someone picks Spanish.
  const siteScript = document.currentScript && document.currentScript.src;
  let esLoading = null;
  function loadSpanish() {
    if (typeof localizeLesson === "function") return Promise.resolve();
    return (esLoading ||= new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = new URL("lessons.es.js", siteScript || location.href).href;
      s.onload = resolve; s.onerror = () => { esLoading = null; reject(new Error("Spanish lessons failed to load")); };
      document.head.append(s);
    }));
  }

  const accountTools = { current: account, remember: rememberAccount, api: accountApi, sync: initAccountSync, push: pushProgress, merge: mergeProgress, SYNC_KEY };
  return { account: accountTools, features, feedback, getProgress, completeLesson, addXp, recordBest, getBest, money, compact, toast, reducedMotion, scrollTo, setChromeLang, getLang, setLang, loadSpanish };
})();

// Offline support: register sw.js from the site root (found relative to this script, so lesson pages and
// subfolder hosting work). Network-first, so it never serves stale pages to online visitors.
(() => {
  const src = document.currentScript && document.currentScript.src;
  if (!src || !("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
  addEventListener("load", () => { navigator.serviceWorker.register(new URL("../sw.js", src)).catch(() => {}); });
})();
