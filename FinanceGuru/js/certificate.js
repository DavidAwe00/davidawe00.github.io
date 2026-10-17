// Certificate page: drawn on a canvas so the preview, the PNG download, and the printout are identical.
(function () {
  const $ = (id) => document.getElementById(id);
  const CERT_KEY = "fg-cert-v1"; // { name, date } — date is set the first time all lessons are done
  const W = 1650, H = 1275; // 11 x 8.5 in at 150 dpi
  const canvas = $("cert");
  const ctx = canvas.getContext("2d");
  canvas.width = W; canvas.height = H;

  const load = () => { try { return JSON.parse(localStorage.getItem(CERT_KEY)) || {}; } catch { return {}; } };
  const save = (c) => { try { localStorage.setItem(CERT_KEY, JSON.stringify(c)); } catch { /* storage blocked */ } };

  function status() {
    const p = FG.getProgress();
    const left = LESSONS.filter((l) => !p.done[l.id]);
    const done = Object.values(p.done);
    const score = done.reduce((s, x) => s + x.score, 0), total = done.reduce((s, x) => s + x.total, 0);
    return { left, complete: left.length === 0, avg: total ? Math.round((score / total) * 100) : 0 };
  }

  const fmtDate = (iso) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

  // Shrinks the font until the text fits maxWidth.
  function fitText(text, y, size, maxWidth, font) {
    do { ctx.font = font.replace("{s}", size); size -= 2; } while (ctx.measureText(text).width > maxWidth && size > 16);
    ctx.fillText(text, W / 2, y);
  }

  function wrapCentered(words, y, maxWidth, lineH) {
    let line = "";
    const lines = [];
    words.forEach((w) => {
      const test = line ? line + "  ·  " + w : w;
      if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; } else line = test;
    });
    if (line) lines.push(line);
    lines.forEach((l, i) => ctx.fillText(l, W / 2, y + i * lineH));
  }

  function draw(name, dateIso, avg, preview) {
    const INK = "#14140f", BRAND = "#0e7a4e", GOLD = "#b7862b", SOFT = "#55534c";
    ctx.fillStyle = "#fbfaf7"; ctx.fillRect(0, 0, W, H);
    // Frames
    ctx.strokeStyle = BRAND; ctx.lineWidth = 14; ctx.strokeRect(40, 40, W - 80, H - 80);
    ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.strokeRect(72, 72, W - 144, H - 144);
    // Corner diamonds
    ctx.fillStyle = GOLD;
    [[72, 72], [W - 72, 72], [72, H - 72], [W - 72, H - 72]].forEach(([x, y]) => {
      ctx.beginPath(); ctx.moveTo(x, y - 16); ctx.lineTo(x + 16, y); ctx.lineTo(x, y + 16); ctx.lineTo(x - 16, y); ctx.fill();
    });

    ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
    // Logo mark
    ctx.fillStyle = BRAND;
    ctx.beginPath(); ctx.roundRect(W / 2 - 40, 130, 80, 80, 18); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "600 52px Georgia, serif"; ctx.fillText("$", W / 2, 188);
    ctx.fillStyle = BRAND; ctx.font = "700 30px Inter, sans-serif";
    ctx.fillText("F I N A N C E G U R U   F U N D A M E N T A L S", W / 2, 268);

    ctx.fillStyle = INK; ctx.font = "600 88px Fraunces, Georgia, serif";
    ctx.fillText("Certificate of Completion", W / 2, 380);
    ctx.fillStyle = SOFT; ctx.font = "italic 34px Georgia, serif";
    ctx.fillText("This certifies that", W / 2, 462);

    ctx.fillStyle = INK;
    fitText(name || "Your Name", 584, 110, W - 360, "600 {s}px Fraunces, Georgia, serif");
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2 - 480, 620); ctx.lineTo(W / 2 + 480, 620); ctx.stroke();

    ctx.fillStyle = SOFT; ctx.font = "400 34px Inter, sans-serif";
    ctx.fillText(`has completed all ${LESSONS.length} lessons and quizzes of the FinanceGuru Fundamentals course:`, W / 2, 690);
    ctx.fillStyle = INK; ctx.font = "500 26px Inter, sans-serif";
    wrapCentered(LESSONS.map((l) => l.title), 752, W - 340, 42);

    // Footer: date | seal | score
    const fy = 1040;
    ctx.fillStyle = INK; ctx.font = "600 34px Inter, sans-serif";
    ctx.fillText(dateIso ? fmtDate(dateIso) : "—", 420, fy);
    ctx.fillText(avg ? `${avg}%` : "—", W - 420, fy);
    ctx.strokeStyle = SOFT; ctx.lineWidth = 1.5;
    [420, W - 420].forEach((x) => { ctx.beginPath(); ctx.moveTo(x - 180, fy + 22); ctx.lineTo(x + 180, fy + 22); ctx.stroke(); });
    ctx.fillStyle = SOFT; ctx.font = "500 24px Inter, sans-serif";
    ctx.fillText("Date completed", 420, fy + 60);
    ctx.fillText("Quiz average", W - 420, fy + 60);
    // Seal
    ctx.fillStyle = GOLD; ctx.beginPath();
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2, r = i % 2 ? 84 : 96;
      ctx.lineTo(W / 2 + Math.cos(a) * r, fy - 10 + Math.sin(a) * r);
    }
    ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W / 2, fy - 10, 70, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#fff"; ctx.font = "700 22px Inter, sans-serif";
    ctx.fillText(`${LESSONS.length} / ${LESSONS.length}`, W / 2, fy - 22);
    ctx.font = "600 18px Inter, sans-serif"; ctx.fillText("LESSONS", W / 2, fy + 6);

    ctx.fillStyle = "#85837a"; ctx.font = "400 20px Inter, sans-serif";
    ctx.fillText("Self-paced personal finance course · For educational purposes only — not a professional credential.", W / 2, H - 112);

    if (preview) {
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-0.38);
      ctx.fillStyle = "rgba(14, 122, 78, .12)"; ctx.font = "800 230px Inter, sans-serif"; ctx.textBaseline = "middle";
      ctx.fillText("PREVIEW", 0, 0);
      ctx.restore();
    }
  }

  function render() {
    const s = status();
    const cert = load();
    if (s.complete && !cert.date) { cert.date = today(); save(cert); }
    $("locked").hidden = s.complete;
    $("unlocked").hidden = !s.complete;
    if (!s.complete) {
      const done = LESSONS.length - s.left.length;
      $("lock-count").textContent = `${done} of ${LESSONS.length} lessons finished — ${s.left.length} to go.`;
      $("lock-meter").style.width = `${(done / LESSONS.length) * 100}%`;
      $("lock-list").innerHTML = s.left.map((l) => `<li><a href="learn.html#${l.id}">${l.icon} ${l.title}</a></li>`).join("");
    } else if (document.activeElement !== $("cert-name")) {
      $("cert-name").value = cert.name || "";
    }
    draw(s.complete ? cert.name : "", s.complete ? cert.date : "", s.complete ? s.avg : 0, !s.complete);
  }

  $("cert-name").addEventListener("input", (e) => {
    const cert = load();
    cert.name = e.target.value.trim().slice(0, 40);
    save(cert);
    render();
  });

  const fileName = () => `FinanceGuru-Certificate${load().name ? "-" + load().name.replace(/[^a-z0-9]+/gi, "-") : ""}.png`;
  function needName() {
    if (load().name) return false;
    FG.toast("Add your name first ✍️");
    $("cert-name").focus();
    return true;
  }

  $("cert-download").addEventListener("click", () => {
    if (needName()) return;
    const a = document.createElement("a");
    a.download = fileName(); a.href = canvas.toDataURL("image/png"); a.click();
  });

  $("cert-print").addEventListener("click", () => { if (!needName()) window.print(); });

  $("cert-share").addEventListener("click", async () => {
    if (needName()) return;
    const text = `I just finished all ${LESSONS.length} lessons of FinanceGuru Fundamentals! 🎓`;
    try {
      const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
      const file = new File([blob], fileName(), { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return;
      }
      await navigator.clipboard.writeText(text);
      FG.toast("Message copied — download the image to attach it 📋");
    } catch (err) {
      if (err && err.name !== "AbortError") FG.toast("Sharing isn't available here — use Download instead.");
    }
  });

  // Canvas text needs the web fonts loaded before drawing.
  render();
  Promise.all(["600 88px Fraunces", "400 34px Inter", "700 30px Inter"].map((f) => document.fonts.load(f)))
    .catch(() => {}).then(render);
  document.addEventListener("progresschange", render);
})();
