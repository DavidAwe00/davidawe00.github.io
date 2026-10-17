// 3D coin-stack visual for the homepage hero. One stack per 5 years:
// blue coins = money you put in, gold coins = compound growth.
// Drag to rotate, hover a stack for details. Falls back silently without WebGL.
const Hero3D = (() => {
  const host = document.getElementById("hero-3d");
  if (!host || !window.THREE) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    return null;
  }
  host.hidden = false;
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  host.prepend(renderer.domElement);

  const MAX_COINS = 36, MAX_STACKS = 10, COIN_H = 0.1, SPACING = 1.15;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x404040, 0.85));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(4, 10, 8);
  scene.add(sun);

  const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, COIN_H * 0.92, 32);
  const blueMat = new THREE.MeshStandardMaterial({ color: 0x3987e5, metalness: 0.2, roughness: 0.4 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf2c14e, metalness: 0.35, roughness: 0.3, emissive: 0x3a2a00 });
  const blue = new THREE.InstancedMesh(coinGeo, blueMat, MAX_COINS * MAX_STACKS);
  const gold = new THREE.InstancedMesh(coinGeo, goldMat, MAX_COINS * MAX_STACKS);
  scene.add(blue, gold);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(9, 64),
    new THREE.MeshBasicMaterial({ color: 0x808080, transparent: true, opacity: 0.08 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const labelLayer = host.querySelector(".scene-labels");
  const tip = host.querySelector(".scene-tip");
  let stacks = [];          // { year, fv, contrib, total, c, x }
  let labels = [];
  let animStart = 0;
  let blueOwner = [], goldOwner = []; // instanceId -> stack index (for hover)
  let hovered = -1;

  // Camera orbit state
  let theta = 0.35, phi = 0.32, dragging = false, lastX = 0, lastY = 0, userMoved = false;

  function update(pmt, years, rate = 0.08) {
    const r = rate / 12;
    const marks = [];
    for (let y = 5; y < years; y += 5) marks.push(y);
    marks.push(years);
    stacks = marks.map((y) => {
      const n = y * 12;
      return { year: y, fv: pmt * ((Math.pow(1 + r, n) - 1) / r), contrib: pmt * n };
    });
    const unit = stacks[stacks.length - 1].fv / MAX_COINS;
    stacks.forEach((s, i) => {
      s.total = Math.max(1, Math.round(s.fv / unit));
      s.c = Math.min(s.total, Math.max(1, Math.round(s.contrib / unit)));
      s.x = (i - (stacks.length - 1) / 2) * SPACING;
    });
    labelLayer.innerHTML = stacks.map((s) => `<span>Yr ${s.year}</span>`).join("") + `<span class="top"></span>`;
    labels = [...labelLayer.children];
    labels[labels.length - 1].textContent = FG.compact(stacks[stacks.length - 1].fv);
    const end = stacks[stacks.length - 1];
    canvas.setAttribute("aria-label", `3D chart of coin stacks, one every 5 years. After ${end.year} years you'd put in ${FG.money(end.contrib)} and compound growth adds ${FG.money(end.fv - end.contrib)}, for ${FG.money(end.fv)} in total. Use the left and right arrow keys to hear each stack.`);
    animStart = performance.now();
    hovered = -1;
    tip.style.opacity = 0;
  }

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), scl = new THREE.Vector3(1, 1, 1);
  const jitter = (a, b) => { const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return s - Math.floor(s) - 0.5; };

  function layoutCoins(now) {
    const p = FG.reducedMotion() ? 1 : Math.min(1, (now - animStart) / 700);
    const ease = 1 - Math.pow(1 - p, 3);
    let bi = 0, gi = 0;
    blueOwner = []; goldOwner = [];
    stacks.forEach((s, si) => {
      const shown = Math.ceil(s.total * ease);
      const lift = si === hovered ? 0.12 : 0;
      for (let k = 0; k < shown; k++) {
        pos.set(s.x + jitter(k, si) * 0.06, k * COIN_H + COIN_H / 2 + lift, jitter(si, k) * 0.06);
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), jitter(k + 3, si) * 2);
        m4.compose(pos, q, scl);
        if (k < s.c) { blue.setMatrixAt(bi, m4); blueOwner[bi++] = si; }
        else { gold.setMatrixAt(gi, m4); goldOwner[gi++] = si; }
      }
    });
    blue.count = bi; gold.count = gi;
    blue.instanceMatrix.needsUpdate = true;
    gold.instanceMatrix.needsUpdate = true;
  }

  function placeCamera(now) {
    if (!userMoved && !FG.reducedMotion()) theta = 0.35 + Math.sin(now / 3500) * 0.25;
    const width = Math.max(4, stacks.length * SPACING);
    const dist = Math.max(6.5, width * 0.95 + 2.5);
    const target = new THREE.Vector3(0, MAX_COINS * COIN_H * 0.42, 0);
    camera.position.set(
      target.x + dist * Math.sin(theta) * Math.cos(phi),
      target.y + dist * Math.sin(phi),
      target.z + dist * Math.cos(theta) * Math.cos(phi)
    );
    camera.lookAt(target);
  }

  const v = new THREE.Vector3();
  function placeLabels() {
    const w = host.clientWidth, h = host.clientHeight;
    stacks.forEach((s, i) => {
      v.set(s.x, -0.28, 0).project(camera);
      labels[i].style.transform = `translate(${(v.x + 1) / 2 * w}px, ${(1 - v.y) / 2 * h}px) translate(-50%, -50%)`;
    });
    const last = stacks[stacks.length - 1];
    v.set(last.x, last.total * COIN_H + 0.35, 0).project(camera);
    labels[labels.length - 1].style.transform = `translate(${(v.x + 1) / 2 * w}px, ${(1 - v.y) / 2 * h}px) translate(-50%, -100%)`;
  }

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host);

  // Interaction: drag to orbit, hover (or arrow keys) for details
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "img");
  const live = document.createElement("div");
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  host.appendChild(live);

  function showTip(i, x, y) {
    const s = stacks[i], rect = canvas.getBoundingClientRect();
    tip.innerHTML = `<strong>Year ${s.year}</strong>
        <div class="row"><span><i style="background:#e2b23c"></i>Growth</span><span>${FG.money(s.fv - s.contrib)}</span></div>
        <div class="row"><span><i style="background:#3987e5"></i>You put in</span><span>${FG.money(s.contrib)}</span></div>
        <div class="row" style="border-top:1px solid var(--border);margin-top:4px;padding-top:4px"><span>Total</span><strong>${FG.money(s.fv)}</strong></div>`;
    tip.style.left = Math.max(0, Math.min(x + 14, rect.width - 190)) + "px";
    tip.style.top = Math.max(0, y - 90) + "px";
    tip.style.opacity = 1;
  }

  // Keyboard: ← → step through the stacks; the tooltip follows and a screen reader hears each one.
  canvas.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    hovered = hovered < 0 ? (e.key === "ArrowRight" ? 0 : stacks.length - 1)
      : Math.max(0, Math.min(stacks.length - 1, hovered + (e.key === "ArrowRight" ? 1 : -1)));
    const s = stacks[hovered];
    v.set(s.x, s.total * COIN_H, 0).project(camera);
    showTip(hovered, ((v.x + 1) / 2) * canvas.clientWidth, ((1 - v.y) / 2) * canvas.clientHeight);
    live.textContent = `Year ${s.year}: you put in ${FG.money(s.contrib)}, growth ${FG.money(s.fv - s.contrib)}, total ${FG.money(s.fv)}.`;
  });
  canvas.addEventListener("blur", () => { hovered = -1; tip.style.opacity = 0; });
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  canvas.addEventListener("pointerdown", (e) => { dragging = true; userMoved = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener("pointerup", () => (dragging = false));
  canvas.addEventListener("pointerleave", () => { hovered = -1; tip.style.opacity = 0; });
  canvas.addEventListener("pointermove", (e) => {
    if (dragging) {
      theta = Math.max(-1.3, Math.min(1.3, theta - (e.clientX - lastX) * 0.008));
      phi = Math.max(0.05, Math.min(1.1, phi + (e.clientY - lastY) * 0.006));
      lastX = e.clientX; lastY = e.clientY;
      return;
    }
    const rect = canvas.getBoundingClientRect();
    mouse.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects([blue, gold])[0];
    const idx = hit ? (hit.object === blue ? blueOwner : goldOwner)[hit.instanceId] : -1;
    hovered = idx ?? -1;
    if (hovered >= 0) showTip(hovered, e.clientX - rect.left, e.clientY - rect.top);
    else tip.style.opacity = 0;
  });

  // Render only while on screen
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(host);
  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible || document.hidden || !stacks.length) return;
    layoutCoins(now);
    placeCamera(now);
    renderer.render(scene, camera);
    placeLabels();
  }
  resize();
  requestAnimationFrame(frame);

  return { update };
})();
