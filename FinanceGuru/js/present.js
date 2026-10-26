// Slides page: presents a lesson deck from js/slides.js. The URL hash holds the lesson and slide
// (#budgeting/3), so a refresh or a shared link reopens the same slide. → / Space go forward (revealing a
// quiz answer first), ← goes back, R reveals, F toggles full screen, Home/End jump.
(function () {
  const $ = (id) => document.getElementById(id);
  let deck = null, lessonIndex = -1, at = 0;

  function parse() {
    const [id, n] = decodeURIComponent(location.hash.slice(1)).split("/");
    return { id, n: Math.max(1, parseInt(n, 10) || 1) - 1 };
  }

  function showPicker() {
    deck = null;
    $("deck").hidden = true; $("picker").hidden = false;
    document.title = "Lesson slides — FinanceGuru";
    $("picker-list").innerHTML = LESSONS.map((l, i) => `
      <li><a class="card slide-pick" href="#${l.id}"><span class="plan-num">${i + 1}</span><span><strong>${l.icon} ${l.title}</strong><span class="small muted">${Slides.build(l, PLANS[l.id], i).length} slides · ${l.summary}</span></span></a></li>`).join("");
  }

  function open(id, n) {
    lessonIndex = LESSONS.findIndex((l) => l.id === id);
    if (lessonIndex < 0) return showPicker();
    const l = LESSONS[lessonIndex];
    deck = Slides.build(l, PLANS[l.id], lessonIndex);
    $("picker").hidden = true; $("deck").hidden = false;
    $("deck-title").textContent = `${l.icon} ${l.title}`;
    document.title = `${l.title} slides — FinanceGuru`;
    go(Math.min(n, deck.length - 1), false);
  }

  function render() {
    const s = deck[at];
    $("slide").className = `slide slide-${s.kind}`;
    $("slide").innerHTML = `
      <div class="slide-eyebrow">${s.eyebrow}</div>
      <h2 class="slide-heading" tabindex="-1">${s.heading}</h2>
      <div class="slide-body">${s.body}</div>`;
    $("slide").querySelectorAll("[data-student-link]").forEach((a) => (a.textContent = a.href));
    $("count").textContent = `${at + 1} / ${deck.length}`;
    $("progress").style.width = `${((at + 1) / deck.length) * 100}%`;
    $("prev").disabled = at === 0;
    $("next").disabled = at === deck.length - 1 && !unrevealed();
    $("reveal").hidden = s.kind !== "quiz";
    $("reveal").disabled = !unrevealed();
    $("status").textContent = `Slide ${at + 1} of ${deck.length}: ${$("slide").querySelector("h2").textContent}`;
  }

  const unrevealed = () => deck[at].kind === "quiz" && !$("slide").classList.contains("revealed");

  function reveal() {
    if (!unrevealed()) return;
    $("slide").classList.add("revealed");
    $("slide").querySelector(".slide-why").hidden = false;
    $("reveal").disabled = true; $("next").disabled = at === deck.length - 1;
    $("status").textContent = `Answer: ${$("slide").querySelector(".slide-why").textContent}`;
  }

  function go(n, focus = true) {
    if (!deck) return;
    at = Math.max(0, Math.min(deck.length - 1, n));
    history.replaceState(null, "", `#${LESSONS[lessonIndex].id}/${at + 1}`);
    render();
    if (focus) $("slide").querySelector("h2").focus({ preventScroll: true });
  }

  const next = () => (unrevealed() ? reveal() : go(at + 1));
  const prev = () => go(at - 1);

  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }
  document.addEventListener("fullscreenchange", () => {
    $("fullscreen").textContent = document.fullscreenElement ? "Exit full screen" : "Full screen";
  });

  $("prev").addEventListener("click", prev);
  $("next").addEventListener("click", next);
  $("reveal").addEventListener("click", reveal);
  $("fullscreen").addEventListener("click", fullscreen);

  document.addEventListener("keydown", (e) => {
    if (!deck || e.altKey || e.ctrlKey || e.metaKey) return;
    // Let buttons, links, and form fields keep Space/Enter; arrows always move between slides.
    const typing = e.target.closest("input, textarea, select, [contenteditable]");
    const control = e.target.closest("button, a, summary");
    const keys = {
      ArrowRight: next, ArrowDown: next, PageDown: next, ArrowLeft: prev, ArrowUp: prev, PageUp: prev,
      Home: () => go(0), End: () => go(deck.length - 1),
      " ": control ? null : next, r: reveal, R: reveal, f: fullscreen, F: fullscreen,
    };
    const fn = keys[e.key];
    if (!fn || typing) return;
    e.preventDefault(); fn();
  });

  // Swipe on touch screens.
  let touchX = null;
  $("slide").addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
  $("slide").addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX; touchX = null;
    if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  });

  function route() {
    const { id, n } = parse();
    if (!id) return showPicker();
    if (deck && LESSONS[lessonIndex].id === id) { if (n !== at) go(n); return; }
    open(id, n);
  }
  addEventListener("hashchange", route);
  route();
})();
