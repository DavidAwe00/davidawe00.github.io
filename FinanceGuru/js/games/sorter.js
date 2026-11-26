// Needs vs Wants — a 30-second sorting game that gets harder as you go.
// Tier 1: obvious needs and wants. Tier 2: the same thing can be either, depending on context.
// Tier 3: "upgrades" — a real need bought at a want price, the most common budget leak.
// Lesson: separating essentials from nice-to-haves (and from overspending on essentials) is the core budgeting skill.
window.Games = window.Games || {};
Games.sorter = (() => {
  // [emoji, name, answer, why, tier, yearly cost of the upgrade]
  const ITEMS = [
    ["🏠", "Rent", "need", "Housing is a core need.", 1],
    ["🛒", "Groceries", "need", "Food is essential (fancy snacks aside!).", 1],
    ["💡", "Electricity bill", "need", "Utilities keep your home livable.", 1],
    ["🚰", "Water bill", "need", "Basic utility.", 1],
    ["🏥", "Health insurance", "need", "Protects you from huge medical bills.", 1],
    ["💊", "Prescription medicine", "need", "Your health comes first.", 1],
    ["🚌", "Bus pass to work", "need", "Getting to work protects your income.", 1],
    ["💳", "Minimum loan payment", "need", "Missing it hurts your credit and adds fees.", 1],
    ["🧒", "Childcare", "need", "Needed so parents can work.", 1],
    ["🚗", "Car insurance (you drive)", "need", "Legally required if you drive.", 1],
    ["📺", "Streaming subscription", "want", "Entertainment is a want.", 1],
    ["👟", "Designer sneakers", "want", "Your shoes are fine. Designer shoes are a want.", 1],
    ["☕", "Daily coffee shop latte", "want", "$6 a day is ~$2,000 a year!", 1],
    ["🎮", "New video game", "want", "Fun, but not essential.", 1],
    ["🎫", "Concert tickets", "want", "Great memories, but a want.", 1],
    ["✈️", "Beach vacation", "want", "Plan and save for it as a want.", 1],
    ["💅", "Salon manicure", "want", "Nice treat, but a want.", 1],
    ["📦", "Monthly mystery box", "want", "Subscriptions add up fast.", 1],
    ["🍿", "Premium cable package", "want", "Entertainment is a want.", 1],

    ["🚗", "Car (no bus goes near your job)", "need", "Without it, you can't get to work.", 2],
    ["🚙", "Second car (you live by the subway)", "want", "Transit already gets you everywhere.", 2],
    ["💻", "Laptop for your online classes", "need", "Required for school.", 2],
    ["🖥️", "Gaming PC (your laptop works fine)", "want", "Replacing working gear is a want.", 2],
    ["🧥", "Winter coat (yours ripped, you live in Minnesota)", "need", "Staying warm is a safety need.", 2],
    ["🧣", "Fifth winter coat", "want", "You already have one that works.", 2],
    ["🍱", "Lunch out every workday", "want", "$12 × 20 days = $240 a month. Packing lunch covers the need.", 2],
    ["🦷", "Yearly dental cleaning", "need", "Prevention avoids $1,000+ bills later.", 2],
    ["🐕", "Your dog's vaccines", "need", "Once you have a pet, its basic care is a need.", 2],
    ["🐶", "Getting a second dog", "want", "Adorable, but optional — and pricey.", 2],
    ["📚", "Required textbook (used copy)", "need", "Needed to pass the class.", 2],
    ["🎁", "$200 birthday gift for a friend", "want", "Kind, but a want. Set a gift budget.", 2],
    ["📶", "Basic internet (you work from home)", "need", "Essential when your job depends on it.", 2],
    ["🥾", "Steel-toe boots your job requires", "need", "Required gear for earning money.", 2],

    ["🏠", "$2,200 apartment when $1,400 ones are nearby", "upgrade", "Housing is a need; the extra $800/month is a want.", 3, 9600],
    ["🚙", "Brand-new $55,000 SUV for a 10-mile commute", "upgrade", "Getting to work is a need; a reliable used car does the job.", 3, 6000],
    ["📱", "$90/month unlimited plan — you use 3 GB", "upgrade", "A phone is a need; a $30 plan covers 3 GB.", 3, 720],
    ["🛒", "Name-brand everything at the grocery store", "upgrade", "Food is a need; store brands often cost about 25% less.", 3, 1500],
    ["💊", "Brand-name allergy pills (the generic is identical)", "upgrade", "Generics have the same active ingredient.", 3, 120],
    ["📶", "1-gig internet for one person", "upgrade", "Internet can be a need; a slower, cheaper plan streams fine.", 3, 360],
    ["🥾", "$250 designer work boots", "upgrade", "Boots are required; $90 pairs meet the same safety rating.", 3, 160],
    ["🏋️", "$150/month boutique gym for basic workouts", "upgrade", "Exercise helps your health; a $25 gym (or the park) covers it.", 3, 1500],
    ["🧺", "Laundry pickup service every week", "upgrade", "Clean clothes are a need; doing it yourself costs a few dollars.", 3, 1800],
  ];
  const t = (s, v) => (typeof I18N === "object" ? I18N.t(s, v) : s);
  // "It's a need." / "It's an upgrade (…)." as whole sentences, so each language can use its own article.
  const IS = { need: "It's a need.", want: "It's a want.", upgrade: "It's an upgrade (a need, but paid at a want price)." };
  const KIND = { need: "a need", want: "a want", upgrade: "an upgrade (a need, but paid at a want price)" };
  const DURATION = 30, RELAXED_CARDS = 20, PENALTY = 2;
  const root = document.getElementById("sorter-root");
  const card = document.getElementById("sorter-card");
  const overlay = document.getElementById("sorter-overlay");
  const fb = document.getElementById("sorter-feedback");
  const $score = document.getElementById("sorter-score");
  const $streak = document.getElementById("sorter-streak");
  const $timer = document.getElementById("sorter-timer");

  let relaxed = false, pools, current, score = 0, streak = 0, right = 0, total = 0, misses = [], byType, caughtUpgrades = 0,
      running = false, endAt = 0, locked = false;

  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const tierPool = (t) => shuffle(ITEMS.filter((it) => it[4] === t));

  // Difficulty ramps up: easy cards first, then context cards, then upgrades join the mix.
  function draw() {
    const r = Math.random();
    const tier = total < 4 ? 1 : total < 9 ? (r < 0.5 ? 1 : 2) : r < 0.25 ? 1 : r < 0.6 ? 2 : 3;
    if (!pools[tier].length) pools[tier] = tierPool(tier);
    return pools[tier].pop();
  }

  function next() {
    current = draw();
    card.className = "sort-card";
    card.style.transform = "";
    card.innerHTML = `<div class="emoji">${current[0]}</div><div class="name">${t(current[1])}</div>${current[4] > 1 ? `<div class="small muted">${current[4] === 3 ? t("⭐⭐ Tricky") : t("⭐ Read carefully")}</div>` : ""}`;
    locked = false;
  }

  function start() {
    relaxed = document.getElementById("sorter-relaxed").checked;
    $timer.parentElement.hidden = relaxed;
    pools = { 1: tierPool(1), 2: tierPool(2), 3: tierPool(3) };
    score = streak = right = total = caughtUpgrades = 0;
    misses = [];
    byType = { need: [0, 0], want: [0, 0], upgrade: [0, 0] };
    fb.textContent = "";
    overlay.hidden = true;
    running = true;
    endAt = performance.now() + DURATION * 1000;
    hud();
    next();
    tick();
  }

  const mult = () => Math.min(5, 1 + Math.floor(streak / 3));
  function hud() {
    $score.textContent = t("{n} pts", { n: score });
    $streak.textContent = "🔥 x" + mult();
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
    const [, name, kind, why, tier, yearly] = current;
    const ok = choice === kind;
    byType[kind][1]++;
    if (ok) {
      right++;
      byType[kind][0]++;
      streak++;
      const pts = 100 * tier * Math.min(5, 1 + Math.floor((streak - 1) / 3));
      score += pts;
      if (kind === "upgrade") { caughtUpgrades += yearly; if (!relaxed) endAt += 1000; }
      fb.innerHTML = `<span class="delta up">✓ ${t(name)} +${pts}</span> — ${t(why)}${kind === "upgrade" ? ` <strong>${t("Choosing the basic version saves about {amount} a year.", { amount: FG.money(yearly) })}</strong>${relaxed ? "" : " +1s"}` : ""}`;
      card.classList.add(choice === "need" ? "fly-left" : choice === "want" ? "fly-right" : "fly-up");
      setTimeout(advance, kind === "upgrade" ? 600 : 220);
    } else {
      streak = 0;
      misses.push(current);
      if (!relaxed) endAt -= PENALTY * 1000;
      fb.innerHTML = `<span class="delta down">✗ ${t(IS[kind])}</span> ${t(why)}${relaxed ? "" : ` <span class="delta down">−${PENALTY}s</span>`}`;
      card.classList.add("shake");
      setTimeout(advance, 900);
    }
    hud();
  }

  // In relaxed mode the game ends after a fixed number of cards instead of a clock.
  function advance() {
    if (!running) return;
    if (relaxed && total >= RELAXED_CARDS) end();
    else next();
  }

  function end() {
    running = false;
    const { best, isNew } = relaxed ? { best: FG.getBest("sorter"), isNew: false } : FG.recordBest("sorter", score);
    const xp = Math.min(50, Math.floor(score / 150));
    FG.addXp(xp);
    const acc = total ? Math.round((right / total) * 100) : 0;
    const row = (k, label) => byType[k][1] ? `<div class="stat"><div class="label">${label}</div><div class="value">${byType[k][0]}/${byType[k][1]}</div></div>` : "";
    const upTip = caughtUpgrades
      ? `<p class="small" style="text-align:left">${t("💡 The upgrades you spotted add up to <strong>{amount} a year</strong>. Paying want prices for needs is where most budgets quietly leak.", { amount: FG.money(caughtUpgrades) })}</p>`
      : byType.upgrade[1]
        ? `<p class="small muted" style="text-align:left">${t("💡 Watch for ⭐⭐ cards: a need bought at a want price is an upgrade. Spotting them is where the real savings are.")}</p>`
        : `<p class="small muted" style="text-align:left">${t("💡 Last longer to unlock ⭐⭐ \"upgrade\" cards: needs bought at want prices.")}</p>`;
    overlay.querySelector(".card").innerHTML = `
      <div class="card-icon">⚡</div>
      <h3>${relaxed ? t("Done!") : t("Time's up!")}</h3>
      <div class="big">${t("{n} pts", { n: score })}</div>
      <p class="small muted">${t("{right}/{total} correct ({acc}%)", { right, total, acc })} · ${relaxed ? t("Untimed games don't count toward best scores") : isNew ? t("🏆 New best!") : t("Best: {best}", { best })} · +${xp} XP</p>
      <div class="stats" style="margin:8px 0;grid-template-columns:repeat(auto-fit,minmax(90px,1fr))">${row("need", t("🔵 Needs"))}${row("want", t("🟠 Wants"))}${row("upgrade", t("🟣 Upgrades"))}</div>
      ${upTip}
      ${misses.length ? `<div class="callout" style="text-align:left"><strong>${t("Review:")}</strong><ul class="small" style="margin:6px 0 0">${
        misses.slice(0, 4).map((m) => `<li>${m[0]} ${t("<strong>{name}</strong> is {kind} — {why}", { name: t(m[1]), kind: t(KIND[m[2]]), why: t(m[3]) })}</li>`).join("")}</ul></div>`
        : `<div class="callout" style="text-align:left">${t("<strong>Flawless!</strong> Knowing needs from wants is the foundation of every budget.")}</div>`}
      <button class="btn btn-primary" data-start>${t("Play again")}</button>`;
    overlay.hidden = false;
    // The results card covers the game, so move keyboard focus onto it.
    if (root.contains(document.activeElement) || document.activeElement === document.body) overlay.querySelector("[data-start]").focus({ preventScroll: true });
    document.getElementById("sorter-sr").textContent = t("Game over. {score} points, {right} of {total} correct.", { score, right, total });
    Games.refreshBest && Games.refreshBest();
  }

  // Input: buttons, keys, swipe (left = need, up = upgrade, right = want)
  root.addEventListener("click", (e) => {
    const s = e.target.closest("[data-sort]");
    if (s) answer(s.dataset.sort);
    if (e.target.closest("[data-start]")) start();
  });
  addEventListener("keydown", (e) => {
    if (!running) return;
    if (e.key === "ArrowLeft" || e.key === "n" || e.key === "N") { answer("need"); e.preventDefault(); }
    if (e.key === "ArrowRight" || e.key === "w" || e.key === "W") { answer("want"); e.preventDefault(); }
    if (e.key === "ArrowUp" || e.key === "u" || e.key === "U") { answer("upgrade"); e.preventDefault(); }
  });
  let sx = null, sy = null;
  card.addEventListener("pointerdown", (e) => { if (running && !locked) { sx = e.clientX; sy = e.clientY; card.setPointerCapture(e.pointerId); card.style.transition = "none"; } });
  card.addEventListener("pointermove", (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = Math.min(0, e.clientY - sy);
    card.style.transform = Math.abs(dy) > Math.abs(dx) ? `translateY(${dy}px)` : `translateX(${dx}px) rotate(${dx / 20}deg)`;
  });
  card.addEventListener("pointerup", (e) => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    sx = sy = null;
    card.style.transition = "";
    if (-dy > 70 && -dy > Math.abs(dx)) answer("upgrade");
    else if (Math.abs(dx) > 70) answer(dx < 0 ? "need" : "want");
    else card.style.transform = "";
  });

  document.addEventListener("langchange", () => { if (!running) hud(); });
  return {
    show() {},
    hide() { if (running) { running = false; overlay.hidden = false; } },
  };
})();
