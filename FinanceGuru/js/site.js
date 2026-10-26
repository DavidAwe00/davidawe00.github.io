// Shared helpers: theme toggle, progress storage, formatting, toast.
const FG = (() => {
  const STORE_KEY = "fg-progress-v1";

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage blocked */ }
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
    let enabled = false;
    try {
      const r = await fetch("/api/config", { signal: AbortSignal.timeout(5000) });
      enabled = r.ok && (await r.json()).newsletter === true;
    } catch { /* no app server: keep the form hidden */ }
    if (!enabled) return;
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

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initNavMenu();
    initFocusRescue();
    initResultAnnouncer();
    renderXp();
    initSignup();
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
    "FinanceGuru. For educational purposes only — not financial advice.": "FinanceGuru. Solo con fines educativos; no es asesoría financiera.",
    "Invest": "Invertir", "College": "Universidad", "Credit": "Crédito", "Teachers & parents": "Docentes y familias",
    "Privacy": "Privacidad", "Terms": "Términos",
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

  return { getProgress, completeLesson, addXp, recordBest, getBest, money, compact, toast, reducedMotion, scrollTo, setChromeLang, getLang, setLang, loadSpanish };
})();

// Offline support: register sw.js from the site root (found relative to this script, so lesson pages and
// subfolder hosting work). Network-first, so it never serves stale pages to online visitors.
(() => {
  const src = document.currentScript && document.currentScript.src;
  if (!src || !("serviceWorker" in navigator) || !/^https?:$/.test(location.protocol)) return;
  addEventListener("load", () => { navigator.serviceWorker.register(new URL("../sw.js", src)).catch(() => {}); });
})();
