// Video player for js/data/videos.js. Shows a MoneyExplained poster (no request to YouTube) until someone presses
// play; only then does it load the youtube-nocookie.com player, so pages stay free of third-party trackers.
const VideoPlayer = (() => {
  const list = (typeof VIDEOS === "object" && Array.isArray(VIDEOS) ? VIDEOS : []).filter((v) => v && /^[A-Za-z0-9_-]{11}$/.test(v.id) && v.title);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const lessonOf = (v) => (typeof LESSONS === "object" ? LESSONS.find((l) => l.id === v.lesson) : null);
  const T = {
    en: { play: "Play video", min: (n) => `${n} min`, short: "Short", english: "", yt: "YouTube", close: "Close video" },
    es: { play: "Reproducir video", min: (n) => `${n} min`, short: "Short", english: " · en inglés", yt: "YouTube", close: "Cerrar video" },
  };

  // The lesson's video in the reader's language, or the English one (labeled) when there's no Spanish version.
  function forLesson(id, lang = "en") {
    const mine = list.filter((v) => v.lesson === id && v.kind !== "short");
    return mine.find((v) => (v.lang || "en") === lang) || mine.find((v) => (v.lang || "en") === "en") || null;
  }

  function poster(v, lang = "en") {
    const t = T[lang] || T.en, l = lessonOf(v), short = v.kind === "short";
    const other = lang === "es" && (v.lang || "en") === "en" ? t.english : "";
    return `<div class="video${short ? " video-short" : ""}" data-video-wrap>
      <button type="button" class="video-poster" data-video="${esc(v.id)}" data-title="${esc(v.title)}" aria-label="${esc(`${t.play}: ${v.title}`)}">
        <span class="video-icon" aria-hidden="true">${l ? l.icon : "🎬"}</span>
        <span class="video-title">${esc(v.title)}</span>
        <span class="video-meta"><span class="video-play" aria-hidden="true">▶</span>${short ? t.short : t.min(v.minutes || 1)} · ${t.yt}${other}</span>
      </button>
    </div>`;
  }

  // Theater: a pressed poster grows from its place on the page into a large centered player over a dimmed page,
  // and shrinks back into its card on close (Esc, the close button, or a click outside). Closing removes the
  // player, which stops playback. With reduced motion it just fades.
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EASE = "cubic-bezier(.2, .7, .2, 1)";
  let theater = null, opener = null, closing = false;

  function build() {
    const d = document.createElement("dialog");
    d.className = "video-theater";
    d.innerHTML = `<div class="theater-scrim"></div>
      <div class="theater-stage"><div class="video"></div>
        <div class="theater-bar"><span class="theater-title"></span>
          <button type="button" class="theater-close" aria-label="${(T[(document.documentElement.lang || "en").slice(0, 2)] || T.en).close}">✕</button></div></div>`;
    d.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
    d.addEventListener("click", (e) => { if (e.target === d || e.target.closest(".theater-scrim, .theater-close")) close(); });
    document.body.append(d);
    return d;
  }

  // Transform that makes the stage's video box sit exactly over the poster.
  function fromPoster(stage, poster) {
    const a = poster.getBoundingClientRect(), b = stage.querySelector(".video").getBoundingClientRect();
    const s = a.width / b.width;
    return `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${s})`;
  }

  function open(b) {
    theater = theater || build();
    opener = b;
    const short = !!b.closest(".video-short");
    const stage = theater.querySelector(".theater-stage");
    stage.classList.toggle("is-short", short);
    theater.querySelector(".theater-title").textContent = b.dataset.title;
    const frame = document.createElement("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(b.dataset.video)}?autoplay=1&rel=0`;
    frame.title = b.dataset.title;
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    // The poster's artwork stands in while the player loads, so the growing box isn't empty.
    const ghost = b.cloneNode(true);
    ghost.removeAttribute("data-video"); ghost.tabIndex = -1; ghost.setAttribute("aria-hidden", "true"); ghost.classList.add("theater-ghost");
    theater.querySelector(".video").replaceChildren(ghost, frame);
    frame.addEventListener("load", () => ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: "forwards" }), { once: true });
    document.documentElement.classList.add("theater-open");
    theater.showModal();
    frame.focus();
    b.style.visibility = "hidden";
    const scrim = theater.querySelector(".theater-scrim"), bar = theater.querySelector(".theater-bar");
    if (reduce()) { theater.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 }); b.style.visibility = ""; return; }
    scrim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: "ease-out" });
    stage.querySelector(".video").animate([{ transform: fromPoster(stage, b), borderRadius: "12px" }, { transform: "none" }], { duration: 480, easing: EASE });
    bar.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 0, offset: .5 }, { opacity: 1, transform: "none" }], { duration: 520, easing: EASE });
  }

  async function close() {
    if (!theater || !theater.open || closing) return;
    closing = true;
    const stage = theater.querySelector(".theater-stage"), box = stage.querySelector(".video");
    const r = opener && opener.getBoundingClientRect();
    const onScreen = r && r.bottom > 0 && r.top < innerHeight && r.width > 0;
    const anims = [theater.querySelector(".theater-scrim").animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }),
      theater.querySelector(".theater-bar").animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: "forwards" })];
    if (reduce() || !onScreen) anims.push(box.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }));
    else {
      const ghost = box.querySelector(".theater-ghost");
      if (ghost) ghost.getAnimations().forEach((a) => a.cancel()); // show the artwork again as it shrinks
      box.querySelector("iframe")?.remove();
      anims.push(box.animate([{ transform: "none" }, { transform: fromPoster(stage, opener), borderRadius: "12px" }], { duration: 380, easing: EASE, fill: "forwards" }));
    }
    await Promise.all(anims.map((a) => a.finished.catch(() => {})));
    box.replaceChildren();
    theater.close();
    theater.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    document.documentElement.classList.remove("theater-open");
    if (opener) { opener.style.visibility = ""; opener.focus({ preventScroll: true }); }
    closing = false;
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-video]");
    if (b && !b.closest(".video-theater")) open(b);
  });

  // Homepage: the three newest videos (last in the list), shown only when there are any.
  const home = document.getElementById("home-video-grid");
  if (home && list.length) {
    home.innerHTML = list.slice(-3).reverse().map((v) => `<div>${poster(v)}</div>`).join("");
    document.getElementById("home-videos").hidden = false;
  }

  return { list, forLesson, poster };
})();
