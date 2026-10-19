// Calculators: compound growth, budget, debt payoff, emergency fund.
(function () {
  const $ = (id) => document.getElementById(id);
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* ---------- Tabs ---------- */
  const tabs = ["compound", "budget", "debt", "emergency", "retire", "roth", "car"];
  function showTab(name) {
    if (!tabs.includes(name)) name = "compound";
    tabs.forEach((t) => {
      $("panel-" + t).hidden = t !== name;
      document.querySelector(`[data-tab="${t}"]`).setAttribute("aria-selected", t === name);
    });
    $("tool-picker").value = name;
    if (name === "compound") compound(); // chart needs a visible container to measure
    document.dispatchEvent(new CustomEvent("tabshow", { detail: name }));
  }
  document.querySelector(".tool-tabs").addEventListener("click", (e) => {
    const t = e.target.closest("[data-tab]");
    if (t) history.replaceState(null, "", "#" + t.dataset.tab), showTab(t.dataset.tab);
  });
  // Phones get a dropdown instead of the wall of tab buttons.
  $("tool-picker").addEventListener("change", (e) => { history.replaceState(null, "", "#" + e.target.value); showTab(e.target.value); });
  window.addEventListener("hashchange", () => showTab(location.hash.slice(1)));

  /* ---------- Compound growth ---------- */
  function compoundData() {
    const P = num("c-initial"), pmt = num("c-monthly"), r = num("c-rate") / 100 / 12, years = +$("c-years").value;
    let bal = P, contrib = P;
    const rows = [];
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) { bal = bal * (1 + r) + pmt; contrib += pmt; }
      rows.push({ year: y, contrib, growth: bal - contrib, total: bal });
    }
    return rows;
  }

  function niceMax(v) {
    if (v <= 0) return 1;
    const mag = Math.pow(10, Math.floor(Math.log10(v)));
    for (const s of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (s * mag >= v) return s * mag;
    return 10 * mag;
  }

  function compound() {
    $("c-years-label").textContent = $("c-years").value;
    const rows = compoundData();
    const last = rows[rows.length - 1];
    $("c-final").textContent = FG.money(last.total);
    $("c-contrib").textContent = FG.money(last.contrib);
    $("c-growth").textContent = FG.money(last.growth);
    drawChart(rows);
    $("c-table").innerHTML = `<table><thead><tr><th>Year</th><th>Contributions</th><th>Growth</th><th>Balance</th></tr></thead><tbody>${
      rows.map((r) => `<tr><td>${r.year}</td><td>${FG.money(r.contrib)}</td><td>${FG.money(r.growth)}</td><td>${FG.money(r.total)}</td></tr>`).join("")
    }</tbody></table>`;
  }

  function drawChart(rows) {
    const host = $("c-chart");
    const W = host.clientWidth || 600, H = Math.round(Math.min(340, Math.max(220, W * 0.5)));
    const m = { t: 10, r: 8, b: 26, l: 56 };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const max = niceMax(Math.max(...rows.map((r) => r.total)));
    const n = rows.length, slot = iw / n, gap = Math.min(2, slot * 0.25), bw = Math.max(1, slot - gap);
    const y = (v) => m.t + ih - (v / max) * ih;
    const c1 = css("--series-1"), c2 = css("--series-2"), surf = css("--surface");
    const rad = Math.min(4, bw / 2);

    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Stacked bar chart of contributions and growth by year">`;
    for (let i = 0; i <= 4; i++) {
      const v = (max / 4) * i, yy = y(v);
      svg += `<line class="gridline" x1="${m.l}" x2="${W - m.r}" y1="${yy}" y2="${yy}"/>`;
      svg += `<g class="axis"><text x="${m.l - 8}" y="${yy + 4}" text-anchor="end">${FG.compact(v)}</text></g>`;
    }
    const every = Math.ceil(n / Math.max(1, Math.floor(iw / 44)));
    rows.forEach((r, i) => {
      const x = m.l + i * slot + gap / 2;
      const yC = y(r.contrib), yT = y(r.total);
      // contributions (bottom, square-ended at baseline)
      svg += `<rect x="${x}" y="${yC}" width="${bw}" height="${Math.max(0, m.t + ih - yC)}" fill="${c1}"/>`;
      // growth on top with rounded data-end; 2px surface gap between segments
      const gh = yC - yT - 2;
      if (gh > 0.5) {
        const rr = Math.min(rad, gh / 2);
        svg += `<path d="M${x},${yC - 2} V${yT + rr} Q${x},${yT} ${x + rr},${yT} H${x + bw - rr} Q${x + bw},${yT} ${x + bw},${yT + rr} V${yC - 2} Z" fill="${c2}"/>`;
        svg += `<rect x="${x}" y="${yC - 2}" width="${bw}" height="2" fill="${surf}"/>`;
      }
      if ((i + 1) % every === 0 || i === 0) svg += `<g class="axis"><text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle">Yr ${r.year}</text></g>`;
      svg += `<rect class="hit" data-i="${i}" x="${m.l + i * slot}" y="${m.t}" width="${slot}" height="${ih}" fill="transparent"/>`;
    });
    svg += `<line x1="${m.l}" x2="${W - m.r}" y1="${m.t + ih}" y2="${m.t + ih}" stroke="${css("--border")}"/>`;
    svg += `</svg><div class="tooltip" id="c-tip"></div>`;
    host.innerHTML = svg;

    const tip = $("c-tip");
    host.querySelectorAll(".hit").forEach((h) => {
      h.addEventListener("mouseenter", () => {
        const r = rows[+h.dataset.i];
        h.setAttribute("fill", "color-mix(in srgb, currentColor 6%, transparent)");
        tip.innerHTML = `<strong>Year ${r.year}</strong>
          <div class="row"><span><i style="background:${c2}"></i>Growth</span><span>${FG.money(r.growth)}</span></div>
          <div class="row"><span><i style="background:${c1}"></i>Contributions</span><span>${FG.money(r.contrib)}</span></div>
          <div class="row" style="border-top:1px solid var(--border);margin-top:4px;padding-top:4px"><span>Total</span><strong>${FG.money(r.total)}</strong></div>`;
        tip.style.opacity = 1;
        const bx = (+h.getAttribute("x") / W) * host.clientWidth;
        const left = bx + 12 + 180 > host.clientWidth ? bx - 190 : bx + 12;
        tip.style.left = Math.max(0, left) + "px";
        tip.style.top = "10px";
      });
      h.addEventListener("mouseleave", () => { tip.style.opacity = 0; h.setAttribute("fill", "transparent"); });
    });
  }

  ["c-initial", "c-monthly", "c-rate", "c-years"].forEach((id) => $(id).addEventListener("input", compound));
  let resizeT;
  window.addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(() => !$("panel-compound").hidden && compound(), 150); });
  document.addEventListener("themechange", () => !$("panel-compound").hidden && compound());
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => !$("panel-compound").hidden && compound());

  /* ---------- Budget ---------- */
  function budget(changed) {
    let needs = +$("b-needs").value, wants = +$("b-wants").value;
    // Keep needs + wants <= 100 by trimming the other slider.
    if (needs + wants > 100) {
      if (changed === "b-needs") wants = 100 - needs, $("b-wants").value = wants;
      else needs = 100 - wants, $("b-needs").value = needs;
    }
    const save = 100 - needs - wants, inc = num("b-income");
    $("b-needs-label").textContent = needs;
    $("b-wants-label").textContent = wants;
    $("b-save-label").textContent = save;
    $("b-needs-out").textContent = FG.money(inc * needs / 100);
    $("b-wants-out").textContent = FG.money(inc * wants / 100);
    $("b-save-out").textContent = FG.money(inc * save / 100);
    $("b-bar").innerHTML = [[needs, "--series-1"], [wants, "--series-2"], [save, "--series-3"]]
      .filter(([p]) => p > 0).map(([p, c]) => `<div style="flex:${p};background:var(${c})"></div>`).join("");
    $("b-bar").setAttribute("aria-label", `Needs ${needs}%, wants ${wants}%, savings ${save}%`);
    const yearly = inc * save / 100 * 12;
    $("b-insight").innerHTML = save >= 20
      ? `Saving <strong>${FG.money(yearly)}</strong> a year. Invested at 7% for 20 years, that habit could grow to about <strong>${FG.money(fv(inc * save / 100, 0.07, 20))}</strong>.`
      : `You're saving ${save}% — under the 20% guideline. Even moving 5% from wants to savings adds <strong>${FG.money(inc * 0.05 * 12)}</strong> a year.`;
  }
  const fv = (pmt, annual, years) => { const r = annual / 12, n = years * 12; return pmt * ((Math.pow(1 + r, n) - 1) / r); };
  ["b-income", "b-needs", "b-wants"].forEach((id) => $(id).addEventListener("input", () => budget(id)));
  $("b-reset").addEventListener("click", () => { $("b-needs").value = 50; $("b-wants").value = 30; budget(); });

  /* ---------- Debt payoff ---------- */
  let debts = [
    { name: "Credit card", balance: 4500, apr: 24, min: 120 },
    { name: "Car loan", balance: 9000, apr: 7, min: 250 },
    { name: "Store card", balance: 800, apr: 18, min: 35 },
  ];

  function renderDebts() {
    $("d-list").innerHTML = debts.map((d, i) => `
      <div class="debt-row" data-i="${i}">
        <input class="name" data-k="name" value="${d.name.replace(/"/g, "&quot;")}" aria-label="Debt name">
        <input data-k="balance" type="number" min="0" value="${d.balance}" aria-label="Balance">
        <input data-k="apr" type="number" min="0" step="0.1" value="${d.apr}" aria-label="APR">
        <input data-k="min" type="number" min="0" value="${d.min}" aria-label="Minimum payment">
        <button data-remove aria-label="Remove debt">✕</button>
      </div>`).join("");
  }
  $("d-list").addEventListener("input", (e) => {
    const row = e.target.closest(".debt-row"), k = e.target.dataset.k;
    debts[+row.dataset.i][k] = k === "name" ? e.target.value : Math.max(0, parseFloat(e.target.value) || 0);
    debt();
  });
  $("d-list").addEventListener("click", (e) => {
    if (!e.target.closest("[data-remove]")) return;
    debts.splice(+e.target.closest(".debt-row").dataset.i, 1);
    renderDebts(); debt();
  });
  $("d-add").addEventListener("click", () => { debts.push({ name: "New debt", balance: 1000, apr: 15, min: 40 }); renderDebts(); debt(); });
  $("d-extra").addEventListener("input", debt);

  // Month-by-month simulation. Freed-up minimums roll into the next target debt.
  function simulate(order) {
    const ds = debts.filter((d) => d.balance > 0).map((d) => ({ ...d }));
    if (!ds.length) return { months: 0, interest: 0, order: [] };
    const budget = ds.reduce((s, d) => s + d.min, 0) + num("d-extra");
    const sorted = [...ds].sort(order);
    let months = 0, interest = 0;
    const paidOff = [];
    while (ds.some((d) => d.balance > 0.005) && months < 600) {
      months++;
      ds.forEach((d) => { if (d.balance > 0) { const i = d.balance * d.apr / 100 / 12; d.balance += i; interest += i; } });
      let left = budget;
      ds.forEach((d) => { if (d.balance > 0) { const p = Math.min(d.min, d.balance, left); d.balance -= p; left -= p; } });
      for (const t of sorted) {
        if (left <= 0) break;
        if (t.balance > 0) { const p = Math.min(left, t.balance); t.balance -= p; left -= p; }
      }
      ds.forEach((d) => { if (d.balance <= 0.005 && !paidOff.includes(d.name)) paidOff.push(d.name); d.balance = Math.max(0, d.balance); });
    }
    return { months, interest, order: paidOff, stuck: months >= 600 };
  }

  const fmtMonths = (m) => {
    const y = Math.floor(m / 12), mo = m % 12;
    return [y ? `${y} yr` : "", mo ? `${mo} mo` : ""].filter(Boolean).join(" ") || "0 mo";
  };
  const freeDate = (m) => { const d = new Date(); d.setMonth(d.getMonth() + m); return d.toLocaleDateString(undefined, { month: "long", year: "numeric" }); };

  function debt() {
    const av = simulate((a, b) => b.apr - a.apr);
    const sn = simulate((a, b) => a.balance - b.balance);
    const minOnly = (() => { const e = $("d-extra").value; $("d-extra").value = 0; const r = simulate((a, b) => b.apr - a.apr); $("d-extra").value = e; return r; })();
    const card = (title, r, note) => `
      <div class="card">
        <h3>${title}</h3>
        ${r.stuck ? `<p style="color:var(--bad)"><strong>Payments don't cover the interest.</strong> Increase minimums or the extra amount.</p>` : `
        <div class="stats" style="grid-template-columns:1fr 1fr">
          <div class="stat hero"><div class="label">Debt-free in</div><div class="value">${fmtMonths(r.months)}</div></div>
          <div class="stat"><div class="label">Total interest</div><div class="value">${FG.money(r.interest)}</div></div>
        </div>
        <p class="small muted">Debt-free by <strong>${freeDate(r.months)}</strong>. Payoff order: ${r.order.join(" → ")}</p>`}
        <p class="small muted" style="margin:0">${note}</p>
      </div>`;
    const saved = minOnly.stuck ? null : minOnly.interest - av.interest;
    $("d-results").innerHTML =
      card("🏔️ Avalanche (highest APR first)", av, "Mathematically cheapest.") +
      card("⛄ Snowball (smallest balance first)", sn, "Fastest early wins for motivation.") +
      card("🐢 Minimums only", minOnly, saved && saved > 0 ? `Your extra ${FG.money(num("d-extra"))}/mo saves <strong>${FG.money(saved)}</strong> in interest with avalanche.` : "The slow, expensive path.");
  }

  /* ---------- Emergency fund ---------- */
  function emergency() {
    $("e-months-label").textContent = $("e-months").value;
    const target = num("e-expenses") * +$("e-months").value, saved = num("e-saved"), monthly = num("e-monthly");
    const gap = Math.max(0, target - saved), pct = target ? Math.min(100, (saved / target) * 100) : 0;
    $("e-target").textContent = FG.money(target);
    $("e-gap").textContent = FG.money(gap);
    $("e-time").textContent = gap === 0 ? "Done! 🎉" : monthly > 0 ? fmtMonths(Math.ceil(gap / monthly)) : "—";
    $("e-bar").style.width = pct + "%";
    $("e-pct").textContent = `${pct.toFixed(0)}% funded`;
    $("e-insight").innerHTML = gap === 0
      ? "You're fully funded. Next step: invest additional savings for long-term growth."
      : saved < 1000 ? "Tip: hit a <strong>$1,000 starter fund</strong> first, then build toward the full target."
      : "Keep it in a high-yield savings account so it earns interest while it waits.";
  }
  ["e-expenses", "e-months", "e-saved", "e-monthly"].forEach((id) => $(id).addEventListener("input", emergency));

  /* ---------- Init ---------- */
  renderDebts();
  budget();
  debt();
  emergency();
  showTab(location.hash.slice(1));
})();
