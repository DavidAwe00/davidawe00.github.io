// Needs vs Wants — a 30-second sorting game.
// Lesson: separating essentials from nice-to-haves is the core budgeting skill.
window.Games = window.Games || {};
Games.sorter = (() => {
  const ITEMS = [
    ["🏠", "Rent", "need", "Housing is a core need."],
    ["🛒", "Groceries", "need", "Food is essential (fancy snacks aside!)."],
    ["💡", "Electricity bill", "need", "Utilities keep your home livable."],
    ["🚰", "Water bill", "need", "Basic utility."],
    ["🏥", "Health insurance", "need", "Protects you from huge medical bills."],
    ["💊", "Prescription medicine", "need", "Your health comes first."],
    ["🚌", "Bus pass to work", "need", "Getting to work protects your income."],
    ["🥾", "Work boots for your job", "need", "Required gear for earning money."],
    ["💳", "Minimum loan payment", "need", "Missing it hurts your credit and adds fees."],
    ["🧒", "Childcare", "need", "Needed so parents can work."],
    ["📶", "Basic internet for school", "need", "Essential when required for work or school."],
    ["🚗", "Car insurance (you drive)", "need", "Legally required if you drive."],
    ["📱", "Basic phone plan", "need", "A basic plan is essential for most jobs today."],
    ["📺", "Streaming subscription", "want", "Entertainment is a want."],
    ["👟", "Designer sneakers", "want", "Shoes are a need. Designer shoes are a want."],
    ["☕", "Daily coffee shop latte", "want", "$6 a day is ~$2,000 a year!"],
    ["🎮", "New video game", "want", "Fun, but not essential."],
    ["🎫", "Concert tickets", "want", "Great memories, but a want."],
    ["✈️", "Beach vacation", "want", "Plan and save for it as a want."],
    ["📲", "Newest phone upgrade", "want", "Your current phone works — the upgrade is a want."],
    ["🍔", "Takeout dinner", "want", "Food is a need; restaurant food is a want."],
    ["🛋️", "New sofa (old one is fine)", "want", "Replacing working items is a want."],
    ["💅", "Salon manicure", "want", "Nice treat, but a want."],
    ["🏋️", "Fancy gym membership", "want", "Exercise can be free — a premium gym is a want."],
    ["📦", "Monthly mystery box", "want", "Subscriptions add up fast."],
    ["🍿", "Premium cable package", "want", "Entertainment is a want."],
  ];
  const DURATION = 30, RELAXED_CARDS = 20;
  const root = document.getElementById("sorter-root");
  const card = document.getElementById("sorter-card");
  const overlay = document.getElementById("sorter-overlay");
  const fb = document.getElementById("sorter-feedback");
  const $score = document.getElementById("sorter-score");
  const $streak = document.getElementById("sorter-streak");
  const $timer = document.getElementById("sorter-timer");

  let relaxed = false, deck = [], current, score = 0, streak = 0, right = 0, total = 0, misses = [], running = false, endAt = 0, locked = false;

  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function next() {
    if (!deck.length) deck = shuffle([...ITEMS]);
    current = deck.pop();
    card.className = "sort-card";
    card.style.transform = "";
    card.innerHTML = `<div class="emoji">${current[0]}</div><div class="name">${current[1]}</div>`;
    locked = false;
  }

  function start() {
    relaxed = document.getElementById("sorter-relaxed").checked;
    $timer.parentElement.hidden = relaxed;
    deck = shuffle([...ITEMS]);
    score = streak = right = total = 0;
    misses = [];
    fb.textContent = "";
    overlay.hidden = true;
    running = true;
    endAt = performance.now() + DURATION * 1000;
    hud();
    next();
    tick();
  }

  function hud() {
    $score.textContent = score + " pts";
    $streak.textContent = "🔥 x" + Math.min(5, 1 + Math.floor(streak / 3));
  }

  function tick() {
    if (!running || relaxed) return;
    const left = Math.max(0, endAt - performance.now());
    $timer.style.width = (left / (DURATION * 1000)) * 100 + "%";
    if (left <= 0) return end();
    requestAnimationFrame(tick);
  }

  function answer(choice) {
    if (!running || locked) return;
    locked = true;
    total++;
    card.style.transform = ""; // drop any swipe offset so the fly/shake animation applies
    const ok = choice === current[2];
    if (ok) {
      right++;
      streak++;
      score += 100 * Math.min(5, 1 + Math.floor((streak - 1) / 3));
      fb.innerHTML = `<span class="delta up">✓ ${current[1]}</span> — ${current[3]}`;
      card.classList.add(choice === "need" ? "fly-left" : "fly-right");
      setTimeout(advance, 220);
    } else {
      streak = 0;
      misses.push(current);
      fb.innerHTML = `<span class="delta down">✗ It's a ${current[2]}.</span> ${current[3]}`;
      card.classList.add("shake");
      setTimeout(advance, 650);
    }
    hud();
  }

  // In relaxed mode the game ends after a fixed number of cards instead of a clock.
  function advance() {
    if (relaxed && total >= RELAXED_CARDS) end();
    else next();
  }

  function end() {
    running = false;
    const { best, isNew } = relaxed ? { best: FG.getBest("sorter"), isNew: false } : FG.recordBest("sorter", score);
    const xp = Math.min(50, Math.floor(score / 100));
    FG.addXp(xp);
    const acc = total ? Math.round((right / total) * 100) : 0;
    overlay.querySelector(".card").innerHTML = `
      <div class="card-icon">⚡</div>
      <h3>${relaxed ? "Done!" : "Time's up!"}</h3>
      <div class="big">${score} pts</div>
      <p class="small muted">${right}/${total} correct (${acc}%) · ${relaxed ? "Untimed games don't count toward best scores" : isNew ? "🏆 New best!" : "Best: " + best} · +${xp} XP</p>
      ${misses.length ? `<div class="callout" style="text-align:left"><strong>Review:</strong><ul class="small" style="margin:6px 0 0">${
        misses.slice(0, 4).map((m) => `<li>${m[0]} <strong>${m[1]}</strong> is a ${m[2]} — ${m[3]}</li>`).join("")}</ul></div>`
        : `<div class="callout" style="text-align:left"><strong>Flawless!</strong> Knowing needs from wants is the foundation of every budget.</div>`}
      <button class="btn btn-primary" data-start>Play again</button>`;
    overlay.hidden = false;
    // The results card covers the game, so move keyboard focus onto it.
    if (root.contains(document.activeElement) || document.activeElement === document.body) overlay.querySelector("[data-start]").focus({ preventScroll: true });
    document.getElementById("sorter-sr").textContent = `Game over. ${score} points, ${right} of ${total} correct.`;
    Games.refreshBest && Games.refreshBest();
  }

  // Input: buttons, keys, swipe
  root.addEventListener("click", (e) => {
    const s = e.target.closest("[data-sort]");
    if (s) answer(s.dataset.sort);
    if (e.target.closest("[data-start]")) start();
  });
  addEventListener("keydown", (e) => {
    if (!running) return;
    if (e.key === "ArrowLeft" || e.key === "n" || e.key === "N") { answer("need"); e.preventDefault(); }
    if (e.key === "ArrowRight" || e.key === "w" || e.key === "W") { answer("want"); e.preventDefault(); }
  });
  let sx = null;
  card.addEventListener("pointerdown", (e) => { if (running && !locked) { sx = e.clientX; card.setPointerCapture(e.pointerId); card.style.transition = "none"; } });
  card.addEventListener("pointermove", (e) => { if (sx !== null) { const d = e.clientX - sx; card.style.transform = `translateX(${d}px) rotate(${d / 20}deg)`; } });
  card.addEventListener("pointerup", (e) => {
    if (sx === null) return;
    const d = e.clientX - sx;
    sx = null;
    card.style.transition = "";
    if (Math.abs(d) > 70) answer(d < 0 ? "need" : "want");
    else card.style.transform = "";
  });

  return {
    show() {},
    hide() { if (running) { running = false; overlay.hidden = false; } },
  };
})();
