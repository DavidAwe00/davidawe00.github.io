// College & careers: majors explorer, degree ROI calculator, alternatives, education ladder.
(function () {
  const $ = (id) => document.getElementById(id);
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
  const k = (v) => "$" + Math.round(v / 1000) + "K";
  const BA_YEAR = EDU_EARNINGS.weekly["Bachelor's degree"] * 52;
  const HS_YEAR = EDU_EARNINGS.weekly["High school diploma"] * 52;

  /* ---------- Hero stats ---------- */
  $("edu-stats").innerHTML = [
    ["Bachelor's median pay", FG.money(BA_YEAR) + "/yr", `vs ${FG.money(HS_YEAR)} with a high school diploma`, true],
    ["Unemployment rate", "2.5%", "bachelor's vs 4.2% high school", false],
    ["In-state public tuition", FG.money(TUITION.instate.perYear) + "/yr", "2025–26 average, before aid", false],
    ["Federal student loan rate", (FED_LOAN_RATE * 100).toFixed(2) + "%", "undergrad, 2026–27", false],
  ].map(([l, v, s, h]) => `<div class="stat ${h ? "hero" : ""}"><div class="label">${l}</div><div class="value">${v}</div><div class="small muted">${s}</div></div>`).join("");

  /* ---------- Majors explorer ---------- */
  const GROUPS = ["All", ...new Set(MAJORS.map((m) => m.group))];
  let group = "All", showAll = false;
  $("major-groups").innerHTML = GROUPS.map((g) => `<button class="chip" data-group="${g}" aria-pressed="${g === group}">${g}</button>`).join("");
  const SCALE = 140000;
  const pos = (v) => ((v / SCALE) * 100).toFixed(2) + "%";

  function filtered() {
    const q = $("major-search").value.trim().toLowerCase();
    const sort = $("major-sort").value;
    const key = { mid: (m) => -m.mid, early: (m) => -m.early, growth: (m) => -(m.mid / m.early), unemp: (m) => m.unemp, underemp: (m) => m.underemp }[sort];
    return MAJORS.filter((m) => (group === "All" || m.group === group) && (!q || m.name.toLowerCase().includes(q))).sort((a, b) => key(a) - key(b));
  }

  function renderMajors() {
    const list = filtered();
    const shown = showAll || list.length <= 15 ? list : list.slice(0, 15);
    $("major-more").hidden = list.length <= 15;
    $("major-more").textContent = showAll ? "Show top 15" : `Show all ${list.length}`;
    $("major-chart").innerHTML = shown.length ? shown.map((m) => `
      <div class="db-row" data-name="${m.name}" tabindex="0">
        <span class="db-name">${m.name}</span>
        <div class="db-track">
          <span class="db-ref" style="left:${pos(MAJORS_OVERALL.mid)}"></span>
          <span class="db-line" style="left:${pos(m.early)};width:calc(${pos(m.mid)} - ${pos(m.early)})"></span>
          <span class="db-dot early" style="left:${pos(m.early)}"></span>
          <span class="db-dot mid" style="left:${pos(m.mid)}"></span>
        </div>
        <span class="db-val">${k(m.early)} → <strong>${k(m.mid)}</strong></span>
      </div>`).join("") + `<div class="db-axis"><span></span><div>${[0, 35000, 70000, 105000, 140000].map((v) => `<i style="left:${pos(v)}">${k(v)}</i>`).join("")}</div><span></span></div><div class="tooltip" id="major-tip"></div>`
      : `<p class="muted">No majors match "${$("major-search").value}".</p>`;
    $("major-table").innerHTML = `<table><thead><tr><th>Major</th><th>Early</th><th>Mid</th><th>Unemp.</th><th>Underemp.</th><th>Grad degree</th></tr></thead><tbody>${
      list.map((m) => `<tr><td>${m.name}</td><td>${FG.money(m.early)}</td><td>${FG.money(m.mid)}</td><td>${m.unemp}%</td><td>${m.underemp}%</td><td>${m.grad}%</td></tr>`).join("")}</tbody></table>`;
  }

  function showTip(row) {
    const m = MAJORS.find((x) => x.name === row.dataset.name), tip = $("major-tip");
    if (!m || !tip) return;
    const flag = (v, good, bad) => (v <= good ? "✅" : v >= bad ? "⚠️" : "");
    tip.innerHTML = `<strong>${m.name}</strong>
      <div class="row"><span><i style="background:var(--series-1)"></i>Early career</span><span>${FG.money(m.early)}</span></div>
      <div class="row"><span><i style="background:var(--series-2)"></i>Mid-career</span><span>${FG.money(m.mid)}</span></div>
      <div class="row"><span>Pay growth</span><span>+${Math.round((m.mid / m.early - 1) * 100)}%</span></div>
      <div class="row"><span>Unemployment</span><span>${m.unemp}% ${flag(m.unemp, 2.5, 6)}</span></div>
      <div class="row"><span>Underemployed</span><span>${m.underemp}% ${flag(m.underemp, 25, 50)}</span></div>
      <div class="row"><span>Go on to grad school</span><span>${m.grad}%</span></div>`;
    const host = $("major-chart").getBoundingClientRect(), r = row.getBoundingClientRect();
    tip.style.top = r.bottom - host.top + 4 + "px";
    tip.style.left = Math.max(0, Math.min(host.width - 230, r.width * 0.35)) + "px";
    tip.style.opacity = 1;
  }
  const chart = $("major-chart");
  chart.addEventListener("mouseover", (e) => { const r = e.target.closest(".db-row"); if (r) showTip(r); });
  chart.addEventListener("focusin", (e) => { const r = e.target.closest(".db-row"); if (r) showTip(r); });
  chart.addEventListener("mouseleave", () => { const t = $("major-tip"); if (t) t.style.opacity = 0; });
  chart.addEventListener("click", (e) => {
    const r = e.target.closest(".db-row");
    if (!r) return;
    $("roi-major").value = r.dataset.name;
    roi();
    FG.scrollTo($("roi"));
    FG.toast(`${r.dataset.name} loaded into the ROI calculator`);
  });
  $("major-groups").addEventListener("click", (e) => {
    const b = e.target.closest("[data-group]");
    if (!b) return;
    group = b.dataset.group; showAll = false;
    document.querySelectorAll("[data-group]").forEach((c) => c.setAttribute("aria-pressed", c.dataset.group === group));
    renderMajors();
  });
  $("major-search").addEventListener("input", renderMajors);
  $("major-sort").addEventListener("change", renderMajors);
  $("major-more").addEventListener("click", () => { showAll = !showAll; renderMajors(); });

  /* ---------- ROI calculator ---------- */
  $("roi-major").innerHTML = [...MAJORS].sort((a, b) => a.name.localeCompare(b.name)).map((m) => `<option>${m.name}</option>`).join("");
  $("roi-major").value = "Business Management";
  $("roi-school").innerHTML = Object.entries(TUITION).filter(([key]) => key !== "cc")
    .map(([key, t]) => `<option value="${key}">${t.label} (${FG.money(t.perYear)}/yr)</option>`).join("")
    + `<option value="2plus2">Community college 2 yrs + in-state public 2 yrs</option>`;
  $("roi-school").value = "instate";

  function roi() {
    const m = MAJORS.find((x) => x.name === $("roi-major").value);
    const school = $("roi-school").value;
    const tuitionByYear = school === "2plus2"
      ? [TUITION.cc.perYear, TUITION.cc.perYear, TUITION.instate.perYear, TUITION.instate.perYear]
      : Array(4).fill(TUITION[school].perYear);
    const aid = num("roi-aid"), borrow = +$("roi-borrow").value / 100, rate = (parseFloat($("roi-rate").value) || 0) / 100;
    const hs18 = num("roi-hs18"), part = num("roi-parttime");
    $("roi-borrow-label").textContent = Math.round(borrow * 100);
    $("roi-tuition-hint").textContent = "Average published tuition & fees, 2025–26 (College Board).";

    // School years: net tuition split into cash paid now vs. borrowed (interest accrues until graduation).
    let loan = 0, principal = 0, netTuition = 0;
    const cashOut = tuitionByYear.map((t, y) => {
      const net = Math.max(0, t - aid);
      netTuition += net;
      principal += net * borrow;
      loan += net * borrow * Math.pow(1 + rate, 4 - y);
      return net * (1 - borrow);
    });
    const i = rate / 12;
    const monthly = loan === 0 ? 0 : i === 0 ? loan / 120 : (loan * i) / (1 - Math.pow(1 + i, -120));
    const interest = monthly * 120 - principal;

    const ages = [], col = [], hs = [];
    let cc = 0, ch = 0, breakeven = null;
    for (let age = 18; age <= 65; age++) {
      let earnC, earnH;
      if (age < 22) { earnC = part - cashOut[age - 18]; earnH = hs18; }
      else {
        const t = Math.min(1, (age - 22) / 18);
        earnC = m.early + (m.mid - m.early) * t - (age < 32 ? monthly * 12 : 0);
        earnH = HS_WAGE_22_27 + (HS_YEAR - HS_WAGE_22_27) * t;
      }
      cc += earnC; ch += earnH;
      ages.push(age); col.push(cc); hs.push(ch);
      if (breakeven === null && age >= 22 && cc >= ch) breakeven = age;
    }
    const premium = cc - ch;
    const forgone = (hs18 - part) * 4;
    $("roi-premium").textContent = (premium < 0 ? "−" : "+") + FG.money(Math.abs(premium));
    $("roi-break").textContent = breakeven ? `Age ${breakeven}` : "Not by 65";
    $("roi-cost").textContent = FG.money(netTuition + interest);
    $("roi-payment").textContent = monthly ? FG.money(monthly) + "/mo" : "No loans 🎉";

    Charts.line($("roi-chart"), {
      x: ages, xFormat: (a) => `Age ${a}`, label: "Cumulative earnings minus costs, degree vs no degree",
      series: [{ name: `${m.name} degree`, color: "--series-1", values: col }, { name: "High school diploma", color: "--series-2", values: hs }],
      yFormat: (v) => (v < 0 ? "−" : "") + FG.compact(Math.abs(v)), tipFormat: (v) => (v < 0 ? "−" : "") + FG.money(Math.abs(v)),
      tipTitle: (j) => `By age ${ages[j]} (total so far)`,
      markers: breakeven ? [{ i: breakeven - 18, label: `Breakeven: ${breakeven}` }] : [],
    });

    const ratio = loan / m.early;
    const debtLine = loan === 0 ? "No student debt — nice."
      : ratio <= 1 ? `✅ Your loan balance at graduation (${FG.money(loan)}) is ${Math.round(ratio * 100)}% of the starting salary — within the "borrow less than your first-year salary" rule.`
      : `⚠️ Your loan balance at graduation (${FG.money(loan)}) is more than the typical starting salary (${FG.money(m.early)}). Consider more aid, a cheaper school, or borrowing less.`;
    $("roi-verdict").innerHTML = `<div class="callout small">
      <strong>The verdict:</strong> ${premium > 0
        ? `For a typical ${m.name} grad, the degree pays back by <strong>age ${breakeven}</strong> and adds about <strong>${FG.money(premium)}</strong> in lifetime earnings after costs.`
        : `For a typical ${m.name} grad with these costs, the degree doesn't pay off financially by 65. It can still be worth it for other reasons — but borrow carefully.`}
      The true cost includes ${FG.money(netTuition)} in tuition after grants, ${FG.money(interest)} in loan interest, and ${FG.money(forgone)} in earnings you give up while in school.<br>${debtLine}</div>`;
  }
  ["roi-major", "roi-school", "roi-aid", "roi-borrow", "roi-rate", "roi-hs18", "roi-parttime"].forEach((id) => $(id).addEventListener("input", roi));

  /* ---------- Careers & education ladder ---------- */
  function hbars(host, rows, max, ref) {
    $(host).innerHTML = rows.map((r) => `
      <div class="hb-row">
        <span class="hb-name">${r.label}</span>
        <div class="hb-track">${ref ? `<span class="db-ref" style="left:${(ref / max) * 100}%"></span>` : ""}<span class="hb-bar" style="width:${(r.value / max) * 100}%"></span></div>
        <span class="hb-val">${r.valueLabel}</span>
      </div>`).join("");
  }
  hbars("career-bars", CAREERS.map((c) => ({
    label: `${c.emoji} ${c.name}<small>${c.edu} · ${c.path}</small>`, value: c.pay, valueLabel: k(c.pay),
  })), 120000, BA_YEAR);
  hbars("edu-bars", Object.entries(EDU_EARNINGS.weekly).map(([lvl, w]) => ({
    label: `${lvl}<small>${EDU_EARNINGS.unemployment[lvl]}% unemployment</small>`, value: w * 52, valueLabel: k(w * 52),
  })), 120000);

  /* ---------- Career explorer ---------- */
  const eduOf = (k) => EDU_LEVELS.find((e) => e.key === k);
  const exState = { edu: new Set(), group: "All", all: false };
  const EX_GROUPS = ["All", ...new Set(OCCUPATIONS.map((o) => o.group))];
  $("ex-edu").innerHTML = EDU_LEVELS.map((e) => `<button class="chip" data-edu="${e.key}" aria-pressed="false">${e.label}</button>`).join("");
  $("ex-group").innerHTML = EX_GROUPS.map((g) => `<button class="chip" data-xgroup="${g}" aria-pressed="${g === "All"}">${g}</button>`).join("");

  function explorer() {
    const q = $("ex-search").value.trim().toLowerCase(), sort = $("ex-sort").value, fast = $("ex-fast").checked;
    const yrs = (o) => eduOf(o.edu).years;
    const key = { pay: (o) => -o.pay, growth: (o) => -(o.growth || 0), school: (o) => yrs(o) * 1e7 - o.pay, value: (o) => -o.pay / (yrs(o) + 1) }[sort];
    const list = OCCUPATIONS.filter((o) => (exState.group === "All" || o.group === exState.group)
      && (!exState.edu.size || exState.edu.has(o.edu)) && (!fast || o.growth) && (!q || o.name.toLowerCase().includes(q)))
      .sort((a, b) => key(a) - key(b));
    const shown = exState.all ? list : list.slice(0, 15);
    $("ex-more").hidden = list.length <= 15;
    $("ex-more").textContent = exState.all ? "Show top 15" : `Show all ${list.length}`;
    const pays = list.map((o) => o.pay).sort((a, b) => a - b);
    const med = pays.length ? (pays.length % 2 ? pays[(pays.length - 1) / 2] : (pays[pays.length / 2 - 1] + pays[pays.length / 2]) / 2) : 0;
    const above = list.filter((o) => o.pay > ALL_OCCUPATIONS_MEDIAN).length;
    $("ex-stats").innerHTML = `
      <div class="stat"><div class="label">Matching jobs</div><div class="value">${list.length}</div></div>
      <div class="stat hero"><div class="label">Their median pay</div><div class="value">${list.length ? FG.money(med) : "—"}</div></div>
      <div class="stat"><div class="label">Pay above the U.S. median</div><div class="value">${list.length ? Math.round((above / list.length) * 100) + "%" : "—"}</div></div>`;
    const max = 280000;
    $("ex-list").innerHTML = shown.length ? shown.map((o) => `
      <div class="hb-row">
        <span class="hb-name">${o.emoji} ${o.name}<small>${eduOf(o.edu).label}${yrs(o) ? ` · ~${yrs(o)} yr${yrs(o) > 1 ? "s" : ""} of school` : ""}${o.growth ? ` · <span class="grow-badge">↑ ${o.growth}% growth</span>` : ""}</small></span>
        <div class="hb-track"><span class="db-ref" style="left:${(ALL_OCCUPATIONS_MEDIAN / max) * 100}%"></span><span class="hb-bar" style="width:${(o.pay / max) * 100}%"></span></div>
        <span class="hb-val">${k(o.pay)}</span>
      </div>`).join("") : `<p class="muted">No jobs match these filters.</p>`;
  }
  $("ex-edu").addEventListener("click", (e) => {
    const b = e.target.closest("[data-edu]"); if (!b) return;
    exState.edu.has(b.dataset.edu) ? exState.edu.delete(b.dataset.edu) : exState.edu.add(b.dataset.edu);
    b.setAttribute("aria-pressed", exState.edu.has(b.dataset.edu));
    exState.all = false; explorer();
  });
  $("ex-group").addEventListener("click", (e) => {
    const b = e.target.closest("[data-xgroup]"); if (!b) return;
    exState.group = b.dataset.xgroup; exState.all = false;
    document.querySelectorAll("[data-xgroup]").forEach((c) => c.setAttribute("aria-pressed", c.dataset.xgroup === exState.group));
    explorer();
  });
  ["ex-search", "ex-sort", "ex-fast"].forEach((id) => $(id).addEventListener("input", explorer));
  $("ex-more").addEventListener("click", () => { exState.all = !exState.all; explorer(); });
  explorer();

  /* ---------- Pay by state ---------- */
  const STATES = Object.keys(STATE_PAY);
  $("sp-occ").innerHTML = STATE_PAY_OCCS.map((o) => `<option value="${o.key}">${o.emoji} ${o.name}</option>`).join("");
  $("sp-state").innerHTML = STATES.map((s) => `<option>${s}</option>`).join("");
  $("sp-occ").value = "rn"; $("sp-state").value = "Texas";
  let spAll = false;
  function statePay() {
    const occ = $("sp-occ").value, st = $("sp-state").value, nat = STATE_PAY_NATIONAL[occ];
    const o = STATE_PAY_OCCS.find((x) => x.key === occ);
    const ranked = STATES.filter((s) => STATE_PAY[s][occ]).sort((a, b) => STATE_PAY[b][occ] - STATE_PAY[a][occ]);
    const pay = STATE_PAY[st][occ];
    $("sp-label").textContent = `${o.name} median pay in ${st}`;
    $("sp-pay").textContent = pay ? FG.money(pay) : "n/a";
    const diff = pay ? pay / nat - 1 : 0;
    $("sp-vs").innerHTML = pay ? `${Math.abs(Math.round(diff * 100))}% ${diff >= 0 ? "above" : "below"} the U.S. median (${FG.money(nat)})` : "BLS doesn't publish this figure for this state.";
    $("sp-rank").textContent = pay ? `#${ranked.indexOf(st) + 1} of ${ranked.length}` : "—";
    const max = Math.max(...ranked.map((s) => STATE_PAY[s][occ]));
    let shown = ranked;
    if (!spAll) {
      shown = [...ranked.slice(0, 5), ...ranked.slice(-5)];
      if (pay && !shown.includes(st)) shown.splice(5, 0, st);
    }
    $("sp-more").textContent = spAll ? "Show top & bottom 5" : `Show all ${ranked.length} states`;
    $("sp-bars").innerHTML = shown.map((s, i) => {
      const v = STATE_PAY[s][occ];
      const gap = !spAll && i > 0 && ranked.indexOf(s) - ranked.indexOf(shown[i - 1]) > 1 ? `<div class="state-gap">⋯</div>` : "";
      return `${gap}<div class="hb-row ${s === st ? "is-mine" : ""}">
        <span class="hb-name">#${ranked.indexOf(s) + 1} ${s}</span>
        <div class="hb-track"><span class="db-ref" style="left:${(nat / max) * 100}%"></span><span class="hb-bar" style="width:${(v / max) * 100}%"></span></div>
        <span class="hb-val">${k(v)}</span></div>`;
    }).join("");
  }
  ["sp-occ", "sp-state"].forEach((id) => $(id).addEventListener("input", statePay));
  $("sp-more").addEventListener("click", () => { spAll = !spAll; statePay(); });
  statePay();

  /* ---------- Init ---------- */
  renderMajors();
  roi();
  let t;
  addEventListener("resize", () => { clearTimeout(t); t = setTimeout(roi, 150); });
  document.addEventListener("themechange", roi);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", roi);
})();
