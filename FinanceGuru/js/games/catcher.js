// Piggy Bank Catcher — a 3D arcade game (Three.js).
// Lesson: small amounts add up; impulse buys drain savings.
window.Games = window.Games || {};
Games.catcher = (() => {
  const stage = document.getElementById("catcher-stage");
  const overlay = document.getElementById("catcher-overlay");
  const $score = document.getElementById("catcher-score");
  const $time = document.getElementById("catcher-time");
  const $lives = document.getElementById("catcher-lives");

  if (!window.THREE) {
    overlay.querySelector(".card").innerHTML = "<h3>3D needs an internet connection</h3><p class='muted small'>This game loads a 3D engine from the web. Connect and reload to play.</p>";
    return { show() {}, hide() {} };
  }

  const DURATION = 45, FIELD = 5, PIG_Y = 0.2;
  let renderer, scene, camera, pig, items = [], running = false, built = false;
  let score = 0, lives = 3, timeLeft = DURATION, spawnT = 0, last = 0, targetX = 0, keys = {};
  let caughtCoins = 0, caughtCash = 0, stars = 0, impulses = 0;

  /* ---------- Scene ---------- */
  function build() {
    built = true;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      overlay.querySelector(".card").innerHTML = "<h3>3D isn't supported here</h3><p class='muted small'>Your browser or device has WebGL turned off. Try another game!</p>";
      return false;
    }
    renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
    stage.prepend(renderer.domElement);
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute("aria-label", "3D game field: a piggy bank catches falling coins, cash, and interest stars while dodging impulse buys. Move with the left and right arrow keys.");
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 4.2, 13);
    camera.lookAt(0, 3.6, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.9));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(3, 10, 8);
    scene.add(sun);

    const ground = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 4), new THREE.MeshStandardMaterial({ color: 0x4f9a55, roughness: 0.9 }));
    ground.position.set(0, -0.9, 0);
    scene.add(ground);

    pig = makePig();
    pig.position.y = PIG_Y;
    scene.add(pig);

    new ResizeObserver(resize).observe(stage);
    resize();
    return true;
  }

  function resize() {
    if (!renderer) return;
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Pull the camera back on narrow screens so the whole field fits.
    camera.position.z = Math.max(13, (FIELD + 1.2) / Math.tan((camera.fov * Math.PI) / 360) / camera.aspect);
    camera.updateProjectionMatrix();
  }

  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, ...extra });

  function makePig() {
    const g = new THREE.Group();
    const pink = mat(0xf7a8c0, { roughness: 0.4 });
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 24), pink);
    body.scale.set(1.25, 1, 1);
    g.add(body);
    const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.25, 24), mat(0xf28aaa));
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 0.05, 0.85);
    g.add(snout);
    [-0.1, 0.1].forEach((x) => {
      const n = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), mat(0x7a3550));
      n.position.set(x, 0.05, 0.98);
      g.add(n);
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), mat(0x222222));
      eye.position.set(x * 3.2, 0.35, 0.68);
      g.add(eye);
    });
    [-0.45, 0.45].forEach((x) => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.35, 16), pink);
      ear.position.set(x, 0.85, 0.2);
      ear.rotation.z = x > 0 ? -0.3 : 0.3;
      g.add(ear);
    });
    [[-0.55, 0.35], [0.55, 0.35], [-0.55, -0.35], [0.55, -0.35]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.4, 12), pink);
      leg.position.set(x, -0.8, z);
      g.add(leg);
    });
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.1), mat(0x7a3550));
    slot.position.set(0, 0.8, 0);
    g.add(slot);
    return g;
  }

  const coinGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 28);
  const coinMat = mat(0xf2c14e, { metalness: 0.35, roughness: 0.3, emissive: 0x3a2a00 });
  const cashGeo = new THREE.BoxGeometry(1.0, 0.5, 0.04);
  const cashMat = mat(0x3fae5a);
  const starGeo = new THREE.OctahedronGeometry(0.42);
  const starMat = mat(0xffd84a, { emissive: 0x806000, emissiveIntensity: 0.6 });
  const bagMat = mat(0xd94848);

  function makeItem(kind) {
    let m;
    if (kind === "coin") { m = new THREE.Mesh(coinGeo, coinMat); m.rotation.x = Math.PI / 2; }
    else if (kind === "cash") m = new THREE.Mesh(cashGeo, cashMat);
    else if (kind === "star") m = new THREE.Mesh(starGeo, starMat);
    else {
      m = new THREE.Group();
      m.add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.75, 0.35), bagMat));
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 8, 20, Math.PI), mat(0x8b2020));
      handle.position.y = 0.37;
      m.add(handle);
    }
    return m;
  }

  /* ---------- Game loop ---------- */
  function start() {
    if (!built && !build()) return;
    items.forEach((it) => scene.remove(it.mesh));
    items = [];
    score = 0; lives = 3; timeLeft = DURATION; spawnT = 0; targetX = 0;
    caughtCoins = caughtCash = stars = impulses = 0;
    pig.position.x = 0;
    overlay.hidden = true;
    running = true;
    last = performance.now();
    hud();
    document.getElementById("catcher-sr").textContent = "Game started. Move with the left and right arrow keys. 45 seconds, 3 lives.";
    requestAnimationFrame(loop);
  }

  function spawn(difficulty) {
    const r = Math.random();
    const badChance = 0.16 + difficulty * 0.14;
    const kind = r < badChance ? "bad" : r < badChance + 0.05 ? "star" : r < badChance + 0.2 ? "cash" : "coin";
    const mesh = makeItem(kind);
    mesh.position.set((Math.random() * 2 - 1) * FIELD, 10, 0);
    scene.add(mesh);
    items.push({ kind, mesh, vy: 3 + difficulty * 3.2 + Math.random() * 1.2, spin: (Math.random() + 0.5) * 3 });
  }

  function popup(text, good, x, y) {
    const v = new THREE.Vector3(x, y, 0).project(camera);
    const el = document.createElement("div");
    el.className = "popup " + (good ? "good" : "bad");
    el.textContent = text;
    el.style.left = ((v.x + 1) / 2) * stage.clientWidth + "px";
    el.style.top = ((1 - v.y) / 2) * stage.clientHeight + "px";
    stage.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  function hud() {
    $score.textContent = "💰 " + FG.money(score);
    $time.textContent = "⏱ " + Math.ceil(timeLeft);
    $lives.textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
  }

  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    timeLeft -= dt;
    const difficulty = 1 - timeLeft / DURATION; // 0 -> 1

    // Move pig toward target (pointer) or by keys
    if (keys.left) targetX -= 9 * dt;
    if (keys.right) targetX += 9 * dt;
    targetX = Math.max(-FIELD, Math.min(FIELD, targetX));
    const dx = targetX - pig.position.x;
    pig.position.x += dx * Math.min(1, dt * 14);
    pig.rotation.z = -dx * 0.08;
    pig.rotation.y = Math.max(-0.5, Math.min(0.5, dx * 0.15));

    spawnT -= dt;
    if (spawnT <= 0) { spawn(difficulty); spawnT = 0.7 - difficulty * 0.38; }

    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i], m = it.mesh;
      m.position.y -= it.vy * dt;
      // Coins are tipped to face the camera, so their local z spin reads as a flip.
      if (it.kind === "coin") m.rotation.z += it.spin * dt;
      else m.rotation.y += it.spin * dt;
      const hit = Math.abs(m.position.x - pig.position.x) < 1.15 && m.position.y < PIG_Y + 1.1 && m.position.y > PIG_Y - 0.6;
      if (hit) {
        if (it.kind === "coin") { score += 10; caughtCoins++; popup("+$10", true, m.position.x, m.position.y); }
        else if (it.kind === "cash") { score += 50; caughtCash++; popup("+$50", true, m.position.x, m.position.y); }
        else if (it.kind === "star") { const b = Math.max(10, Math.round(score * 0.1)); score += b; stars++; popup(`+${FG.money(b)} interest!`, true, m.position.x, m.position.y); }
        else { score = Math.max(0, score - 25); lives--; impulses++; popup("−$25 impulse buy!", false, m.position.x, m.position.y); }
        scene.remove(m); items.splice(i, 1);
      } else if (m.position.y < -2) {
        scene.remove(m); items.splice(i, 1);
      }
    }

    hud();
    renderer.render(scene, camera);
    if (timeLeft <= 0 || lives <= 0) end();
    else requestAnimationFrame(loop);
  }

  function end() {
    running = false;
    const { best, isNew } = FG.recordBest("catcher", score);
    const xp = Math.min(50, Math.floor(score / 25));
    FG.addXp(xp);
    const future = score * Math.pow(1.07, 30);
    overlay.querySelector(".card").innerHTML = `
      <div class="card-icon">${lives <= 0 ? "💸" : "🐷"}</div>
      <h3>${lives <= 0 ? "Too many impulse buys!" : "Time's up!"}</h3>
      <div class="big">${FG.money(score)}</div>
      <p class="small muted">${isNew ? "🏆 New best!" : "Best: " + FG.money(best)} · +${xp} XP</p>
      <p class="small">🪙 ${caughtCoins} coins · 💵 ${caughtCash} bills · ⭐ ${stars} stars · 🛍️ ${impulses} impulse buys</p>
      <div class="callout" style="text-align:left"><strong>Money lesson:</strong> invested at 7% for 30 years, your ${FG.money(score)} would grow to about <strong>${FG.money(future)}</strong>. Small amounts add up — and every impulse buy is future money gone.</div>
      <button class="btn btn-primary" data-start>Play again</button>`;
    overlay.hidden = false;
    // The results card covers the game, so move keyboard focus onto it.
    if (stage.contains(document.activeElement) || document.activeElement === document.body) overlay.querySelector("[data-start]").focus({ preventScroll: true });
    document.getElementById("catcher-sr").textContent = `${lives <= 0 ? "Out of lives" : "Time's up"}. You saved ${FG.money(score)}. ${isNew ? "New best!" : ""}`;
    Games.refreshBest && Games.refreshBest();
  }

  /* ---------- Input ---------- */
  overlay.addEventListener("click", (e) => { if (e.target.closest("[data-start]")) start(); });
  stage.addEventListener("pointermove", (e) => {
    if (!running) return;
    const rect = stage.getBoundingClientRect();
    // Convert screen x to world x on the z=0 plane.
    const v = new THREE.Vector3(((e.clientX - rect.left) / rect.width) * 2 - 1, 0, 0.5).unproject(camera);
    const dir = v.sub(camera.position).normalize();
    targetX = camera.position.x + dir.x * (-camera.position.z / dir.z);
  });
  stage.addEventListener("pointerdown", (e) => stage.dispatchEvent(new PointerEvent("pointermove", e)));
  const keyMap = { ArrowLeft: "left", a: "left", A: "left", ArrowRight: "right", d: "right", D: "right" };
  addEventListener("keydown", (e) => { if (running && keyMap[e.key]) { keys[keyMap[e.key]] = true; e.preventDefault(); } });
  addEventListener("keyup", (e) => { if (keyMap[e.key]) keys[keyMap[e.key]] = false; });

  return {
    show() { if (!built) build(); else resize(); if (renderer && !running) renderer.render(scene, camera); },
    hide() { if (running) { running = false; overlay.hidden = false; } },
  };
})();
