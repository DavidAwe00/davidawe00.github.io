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
    const label = () => { btn.textContent = isDark() ? "☀" : "☾"; btn.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode"); };
    label();
    btn.addEventListener("click", () => {
      const next = isDark() ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      safeSet("fg-theme", next);
      label();
      document.dispatchEvent(new Event("themechange"));
    });
  }

  function initSignup() {
    document.querySelectorAll("form[data-signup]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        // TODO: connect to an email provider (ConvertKit, Beehiiv, Mailchimp) — see README.
        form.reset();
        toast("You're on the list! 🎉");
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

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initNavMenu();
    initFocusRescue();
    renderXp();
    initSignup();
    const y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();
  });

  const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Smooth scrolling, except for people who asked their system for less motion.
  const scrollTo = (el, block = "start") => el && el.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block });

  return { getProgress, completeLesson, addXp, recordBest, getBest, money, compact, toast, reducedMotion, scrollTo };
})();
