// Spanish for pages whose words live in HTML and JS (Tools, then the games). English stays in the source and is the
// lookup key; a page's Spanish dictionary (js/i18n/<page>.es.js) is loaded only when the visitor's language
// (FG.getLang(), shared with the lessons) is Spanish. Untranslated strings fall back to English and are recorded
// in I18N.missing() so tests can require a complete dictionary.
//   I18N.t("You saved {amount}.", { amount }) — dynamic text in JS; {name} placeholders are filled after lookup
//   I18N.init("js/i18n/tools.es.js")         — loads the dictionary, translates the page, fires "langchange"
//   I18N.switcher(host)                       — English/Español chips; switching reloads the page in that language
const I18N = (() => {
  let dict = null;
  const missing = new Set();
  const norm = (s) => String(s).replace(/\s+/g, " ").trim();
  const lang = () => (dict ? "es" : "en");
  const locale = () => (dict ? "es-US" : "en-US");

  function lookup(en) {
    const key = norm(en);
    if (!dict || !/[A-Za-z]{2}/.test(key)) return null; // nothing to translate in "18–20" or "$"
    if (Object.prototype.hasOwnProperty.call(dict, key)) return dict[key];
    missing.add(key);
    return null;
  }
  // A translation may hold "singular|plural" forms, chosen by vars.n ("{n} año|{n} años").
  function t(en, vars) {
    let s = lookup(en) ?? en;
    if (s.includes("|") && vars && "n" in vars) s = s.split("|")[Number(vars.n) === 1 ? 0 : 1];
    return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : s;
  }
  function add(entries) {
    dict ||= {};
    for (const [k, v] of Object.entries(entries)) dict[norm(k)] = v;
  }

  // Static page text. Blocks that hold only text and inline formatting (<p>Save <strong>10%</strong></p>) are
  // looked up whole, so translations can reorder words; anything holding form fields or other blocks is walked
  // into and its text pieces looked up one by one.
  //
  // Only the page as written is translated: pages draw their results in English before the dictionary arrives
  // and redraw them on "langchange", so anything a script created or rewrote is left alone. A snapshot of <main>
  // taken when this file runs (before the page's scripts) tells the two apart. [data-tax] spans are year figures
  // filled in by js/data/tax2026.js: they are blank in lookup keys and keep their current values.
  const INLINE = new Set(["STRONG", "EM", "B", "I", "A", "BR", "ABBR", "SPAN", "CODE", "SMALL", "SUP", "SUB", "MARK", "KBD", "TIME", "U", "S"]);
  const ATTRS = ["placeholder", "aria-label", "title", "alt", "data-desc", "label"];
  const SKIP = "script,style,svg,canvas,[data-i18n-skip]";
  const wordy = (s) => /[A-Za-z]{2}/.test(s);
  const original = new WeakMap(); // text node -> its text; element -> its attributes
  function snapshot(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    for (let n = root; n; n = walker.nextNode()) {
      original.set(n, n.nodeType === 3 ? n.nodeValue : Object.fromEntries(ATTRS.map((a) => [a, n.getAttribute(a)])));
    }
  }
  const unchanged = (n) => original.has(n) && (n.nodeType !== 3 || original.get(n) === n.nodeValue);
  // Live pieces inside a text block: script-filled values like "Your age: <strong id="rt-age-l">30</strong>"
  // and [data-tax] year figures. Their contents stay out of lookup keys and the elements themselves are kept.
  const LIVE = "[id],[data-tax]";
  // Every node inside el is as written (contents of live pieces excepted).
  const pristine = (el) => [...el.childNodes].every((n) => unchanged(n) && (n.nodeType !== 1 || n.matches(LIVE) || pristine(n)));
  function blockKey(el) {
    const c = el.cloneNode(true);
    c.querySelectorAll(LIVE).forEach((s) => (s.textContent = ""));
    return c.innerHTML;
  }
  // Swap in the translation, putting the original live elements (same id, or same order) back in place.
  function replaceBlock(el, html) {
    const live = [...el.querySelectorAll(LIVE)];
    const unnamed = live.filter((x) => !x.id);
    el.innerHTML = html;
    let k = 0;
    [...el.querySelectorAll(LIVE)].forEach((slot) => {
      const keep = slot.id ? live.find((x) => x.id === slot.id) : unnamed[k++];
      if (keep) slot.replaceWith(keep);
    });
  }
  function translate(el) {
    if (el.matches(SKIP) || !original.has(el)) return;
    const was = original.get(el);
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (v && wordy(v) && v === was[a]) { const es = lookup(v); if (es !== null) el.setAttribute(a, es); }
    }
    const kids = [...el.children];
    const inlineOnly = kids.length && kids.every((k) => INLINE.has(k.tagName) && !k.querySelector("input,select,textarea,button") && !k.matches(SKIP));
    if (inlineOnly && wordy(el.textContent)) {
      if (!pristine(el)) return; // a script owns this block
      const es = lookup(blockKey(el));
      if (es !== null) replaceBlock(el, es);
      return; // a missing block is reported whole, not piece by piece
    }
    for (const n of [...el.childNodes]) {
      if (n.nodeType === 3) {
        if (!wordy(n.nodeValue) || !unchanged(n)) continue;
        const es = lookup(n.nodeValue);
        if (es !== null) n.nodeValue = n.nodeValue.replace(norm(n.nodeValue), es);
      } else if (n.nodeType === 1) translate(n);
    }
  }
  // Scripts load at the end of <body>, so <main> is complete here and no page script has run yet.
  if (typeof FG === "object" && FG.getLang() === "es" && document.querySelector("main")) snapshot(document.querySelector("main"));

  // <script src="js/i18n.js" data-dict="js/i18n/invest.es.js">: start once every page script has run (and
  // registered its "langchange" redraw), and wire the page's English/Español switch.
  const dictSrc = document.currentScript && document.currentScript.dataset.dict;
  if (dictSrc) {
    document.addEventListener("DOMContentLoaded", () => {
      const sw = document.querySelector(".page-lang");
      if (sw) switcher(sw);
      init(dictSrc);
    });
  }

  function load(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src; s.onload = resolve; s.onerror = () => reject(new Error(`${src} failed to load`));
      document.head.append(s);
    });
  }
  async function init(src) {
    if (FG.getLang() !== "es") return false;
    // A page may use several dictionaries ("js/i18n/play.es.js js/i18n/college.es.js"): the Play page reuses the
    // College page's names of majors and jobs instead of repeating them.
    try { await Promise.all(src.split(/[\s,]+/).filter(Boolean).map(load)); }
    catch { dict = null; return false; } // offline without a dictionary: stay all English, not half Spanish
    const title = lookup(document.title); if (title !== null) document.title = title;
    translate(document.querySelector("main"));
    document.documentElement.lang = "es";
    FG.setChromeLang("es"); // header/footer; fires "langchange" so pages redraw their results in Spanish
    document.querySelectorAll("[data-page-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pageLang === "es")));
    return true;
  }

  function switcher(host) {
    host.addEventListener("click", (e) => {
      const b = e.target.closest("[data-page-lang]");
      if (!b || b.dataset.pageLang === lang()) return;
      FG.setLang(b.dataset.pageLang);
      location.reload();
    });
  }

  return { t, add, init, switcher, lang, locale, translate, missing: () => [...missing] };
})();
