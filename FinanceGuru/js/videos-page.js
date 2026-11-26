// Videos page: lesson videos grouped by unit (in course order), then Shorts and other videos.
(function () {
  const $ = (id) => document.getElementById(id);
  const channel = typeof SITE_CONFIG === "object" ? SITE_CONFIG.youtubeChannel : "";
  if (channel) { $("video-channel-link").href = channel; $("video-channel").hidden = false; }

  const videos = VideoPlayer.list;
  const order = UNITS.flatMap((u) => u.lessons);
  const grid = (items) => `<div class="video-grid">${items.map((v) => {
    const l = LESSONS.find((x) => x.id === v.lesson);
    return `<div>${VideoPlayer.poster(v)}${l ? `<p class="small"><a href="learn.html#${l.id}">Take the lesson: ${l.title} →</a></p>` : ""}</div>`;
  }).join("")}</div>`;

  const sections = UNITS.map((u) => {
    const items = videos.filter((v) => v.kind !== "short" && u.lessons.includes(v.lesson)).sort((a, b) => order.indexOf(a.lesson) - order.indexOf(b.lesson));
    return items.length ? `<section class="video-section"><h2>${u.icon} ${u.title}</h2>${grid(items)}</section>` : "";
  });
  const shorts = videos.filter((v) => v.kind === "short");
  const other = videos.filter((v) => v.kind !== "short" && !order.includes(v.lesson));
  if (shorts.length) sections.push(`<section class="video-section"><h2>⚡ Shorts</h2>${grid(shorts)}</section>`);
  if (other.length) sections.push(`<section class="video-section"><h2>🎬 More videos</h2>${grid(other)}</section>`);

  $("video-list").innerHTML = sections.join("");
  $("video-empty").hidden = videos.length > 0;
})();
