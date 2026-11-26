// College & careers: majors explorer, degree ROI calculator, alternatives, education ladder.
(function () {
  const $ = (id) => document.getElementById(id);
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
  const k = (v) => "$" + Math.round(v / 1000) + "K";
  // Names in js/data/*.js stay English (they are ids and option values); t() translates them where shown.
  const t = I18N.t;
  const has = (name, q) => (name + " " + t(name)).toLowerCase().includes(q);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[c]);
  const BA_YEAR = EDU_EARNINGS.weekly["Bachelor's degree"] * 52;
  const HS_YEAR = EDU_EARNINGS.weekly["High school diploma"] * 52;

  /* ---------- Hero stats ---------- */
  const heroStats = () => {
    const unit = `<small style="font-size:.6em">${t("/yr")}</small>`; // a smaller unit keeps "$80,236/año" inside its card
    $("edu-stats").innerHTML = [
    [t("Bachelor's median pay"), FG.money(BA_YEAR) + unit, t("vs {amount} with a high school diploma", { amount: FG.money(HS_YEAR) }), true],
    [t("Unemployment rate"), "2.5%", t("bachelor's vs 4.2% high school"), false],
    [t("In-state public tuition"), FG.money(TUITION.instate.perYear) + unit, t("2025–26 average, before aid"), false],
    [t("Federal student loan rate"), (FED_LOAN_RATE * 100).toFixed(2) + "%", t("undergrad, 2026–27"), false],
  ].map(([l, v, s, h]) => `<div class="stat ${h ? "hero" : ""}"><div class="label">${l}</div><div class="value">${v}</div><div class="small muted">${s}</div></div>`).join(""); };
  heroStats();

  /* ---------- Majors explorer ---------- */
  const GROUPS = ["All", ...new Set(MAJORS.map((m) => m.group))];
  let group = "All", showAll = false;
  const majorGroups = () => { $("major-groups").innerHTML = GROUPS.map((g) => `<button class="chip" data-group="${g}" aria-pressed="${g === group}">${t(g)}</button>`).join(""); };
  majorGroups();
  const SCALE = 140000;
  const pos = (v) => ((v / SCALE) * 100).toFixed(2) + "%";

  function filtered() {
    const q = $("major-search").value.trim().toLowerCase();
    const sort = $("major-sort").value;
    const key = { mid: (m) => -m.mid, early: (m) => -m.early, growth: (m) => -(m.mid / m.early), unemp: (m) => m.unemp, underemp: (m) => m.underemp }[sort];
    return MAJORS.filter((m) => (group === "All" || m.group === group) && (!q || has(m.name, q))).sort((a, b) => key(a) - key(b));
  }

  function renderMajors() {
    const list = filtered();
    const shown = showAll || list.length <= 15 ? list : list.slice(0, 15);
    $("major-more").hidden = list.length <= 15;
    $("major-more").textContent = showAll ? t("Show top 15") : t("Show all {n}", { n: list.length });
    $("major-chart").innerHTML = shown.length ? shown.map((m) => `
      <div class="db-row" data-name="${m.name}" tabindex="0">
        <span class="db-name">${t(m.name)}</span>
        <div class="db-track">
          <span class="db-ref" style="left:${pos(MAJORS_OVERALL.mid)}"></span>
          <span class="db-line" style="left:${pos(m.early)};width:calc(${pos(m.mid)} - ${pos(m.early)})"></span>
          <span class="db-dot early" style="left:${pos(m.early)}"></span>
          <span class="db-dot mid" style="left:${pos(m.mid)}"></span>
        </div>
        <span class="db-val">${k(m.early)} → <strong>${k(m.mid)}</strong></span>
      </div>`).join("") + `<div class="db-axis"><span></span><div>${[0, 35000, 70000, 105000, 140000].map((v) => `<i style="left:${pos(v)}">${k(v)}</i>`).join("")}</div><span></span></div><div class="tooltip" id="major-tip"></div>`
      : `<p class="muted">${t("No majors match \"{q}\".", { q: esc($("major-search").value) })}</p>`;
    $("major-table").innerHTML = `<table><thead><tr>${["Major", "Early", "Mid", "Unemp.", "Underemp.", "Grad degree"].map((h) => `<th>${t(h)}</th>`).join("")}</tr></thead><tbody>${
      list.map((m) => `<tr><td>${t(m.name)}</td><td>${FG.money(m.early)}</td><td>${FG.money(m.mid)}</td><td>${m.unemp}%</td><td>${m.underemp}%</td><td>${m.grad}%</td></tr>`).join("")}</tbody></table>`;
  }

  function showTip(row) {
    const m = MAJORS.find((x) => x.name === row.dataset.name), tip = $("major-tip");
    if (!m || !tip) return;
    const flag = (v, good, bad) => (v <= good ? "✅" : v >= bad ? "⚠️" : "");
    tip.innerHTML = `<strong>${t(m.name)}</strong>
      <div class="row"><span><i style="background:var(--series-1)"></i>${t("Early career")}</span><span>${FG.money(m.early)}</span></div>
      <div class="row"><span><i style="background:var(--series-2)"></i>${t("Mid-career")}</span><span>${FG.money(m.mid)}</span></div>
      <div class="row"><span>${t("Pay growth")}</span><span>+${Math.round((m.mid / m.early - 1) * 100)}%</span></div>
      <div class="row"><span>${t("Unemployment")}</span><span>${m.unemp}% ${flag(m.unemp, 2.5, 6)}</span></div>
      <div class="row"><span>${t("Underemployed")}</span><span>${m.underemp}% ${flag(m.underemp, 25, 50)}</span></div>
      <div class="row"><span>${t("Go on to grad school")}</span><span>${m.grad}%</span></div>`;
    const host = $("major-chart").getBoundingClientRect(), r = row.getBoundingClientRect();
    tip.style.top = r.bottom - host.top + 4 + "px";
    tip.style.left = Math.max(0, Math.min(host.width - 230, r.width * 0.35)) + "px";
    tip.style.opacity = 1;
  }
  const chart = $("major-chart");
  chart.addEventListener("mouseover", (e) => { const r = e.target.closest(".db-row"); if (r) showTip(r); });
  chart.addEventListener("focusin", (e) => { const r = e.target.closest(".db-row"); if (r) showTip(r); });
  chart.addEventListener("mouseleave", () => { const tip = $("major-tip"); if (tip) tip.style.opacity = 0; });
  chart.addEventListener("click", (e) => {
    const r = e.target.closest(".db-row");
    if (!r) return;
    $("roi-major").value = r.dataset.name;
    roi();
    FG.scrollTo($("roi"));
    FG.toast(t("{name} loaded into the ROI calculator", { name: t(r.dataset.name) }));
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
  function roiSelects() {
    const major = $("roi-major").value || "Business Management", school = $("roi-school").value || "instate";
    $("roi-major").innerHTML = [...MAJORS].sort((a, b) => t(a.name).localeCompare(t(b.name), I18N.locale())).map((m) => `<option value="${m.name}">${t(m.name)}</option>`).join("");
    $("roi-school").innerHTML = Object.entries(TUITION).filter(([key]) => key !== "cc")
      .map(([key, tu]) => `<option value="${key}">${t(tu.label)} (${t("{amount}/yr", { amount: FG.money(tu.perYear) })})</option>`).join("")
      + `<option value="2plus2">${t("Community college 2 yrs + in-state public 2 yrs")}</option>`;
    $("roi-major").value = major; $("roi-school").value = school;
  }
  roiSelects();

  function roi() {
    const m = MAJORS.find((x) => x.name === $("roi-major").value);
    const school = $("roi-school").value;
    const tuitionByYear = school === "2plus2"
      ? [TUITION.cc.perYear, TUITION.cc.perYear, TUITION.instate.perYear, TUITION.instate.perYear]
      : Array(4).fill(TUITION[school].perYear);
    const aid = num("roi-aid"), borrow = +$("roi-borrow").value / 100, rate = (parseFloat($("roi-rate").value) || 0) / 100;
    const hs18 = num("roi-hs18"), part = num("roi-parttime");
    $("roi-borrow-label").textContent = Math.round(borrow * 100);
    $("roi-tuition-hint").textContent = t("Average published tuition & fees, 2025–26 (College Board).");

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
        const f = Math.min(1, (age - 22) / 18);
        earnC = m.early + (m.mid - m.early) * f - (age < 32 ? monthly * 12 : 0);
        earnH = HS_WAGE_22_27 + (HS_YEAR - HS_WAGE_22_27) * f;
      }
      cc += earnC; ch += earnH;
      ages.push(age); col.push(cc); hs.push(ch);
      if (breakeven === null && age >= 22 && cc >= ch) breakeven = age;
    }
    const premium = cc - ch;
    const forgone = (hs18 - part) * 4;
    // Millions in short form ("+$1.2M") so the figure fits its card on phones.
    $("roi-premium").textContent = (premium < 0 ? "−" : "+") + (Math.abs(premium) >= 1e6 ? FG.compact(Math.abs(premium)) : FG.money(Math.abs(premium)));
    $("roi-break").textContent = breakeven ? t("Age {n}", { n: breakeven }) : t("Not by 65");
    $("roi-cost").textContent = FG.money(netTuition + interest);
    $("roi-payment").textContent = monthly ? t("{amount}/mo", { amount: FG.money(monthly) }) : t("No loans 🎉");

    Charts.line($("roi-chart"), {
      x: ages, xFormat: (a) => t("Age {n}", { n: a }), label: t("Cumulative earnings minus costs, degree vs no degree"),
      series: [{ name: t("{major} degree", { major: t(m.name) }), color: "--series-1", values: col }, { name: t("High school diploma"), color: "--series-2", values: hs }],
      yFormat: (v) => (v < 0 ? "−" : "") + FG.compact(Math.abs(v)), tipFormat: (v) => (v < 0 ? "−" : "") + FG.money(Math.abs(v)),
      tipTitle: (j) => t("By age {n} (total so far)", { n: ages[j] }),
      markers: breakeven ? [{ i: breakeven - 18, label: t("Breakeven: {n}", { n: breakeven }) }] : [],
    });

    const ratio = loan / m.early;
    const debtLine = loan === 0 ? t("No student debt — nice.")
      : ratio <= 1 ? t("✅ Your loan balance at graduation ({loan}) is {pct}% of the starting salary — within the \"borrow less than your first-year salary\" rule.", { loan: FG.money(loan), pct: Math.round(ratio * 100) })
      : t("⚠️ Your loan balance at graduation ({loan}) is more than the typical starting salary ({salary}). Consider more aid, a cheaper school, or borrowing less.", { loan: FG.money(loan), salary: FG.money(m.early) });
    $("roi-verdict").innerHTML = `<div class="callout small">
      <strong>${t("The verdict:")}</strong> ${premium > 0
        ? t("For a typical {major} grad, the degree pays back by <strong>age {age}</strong> and adds about <strong>{premium}</strong> in lifetime earnings after costs.", { major: t(m.name), age: breakeven, premium: FG.money(premium) })
        : t("For a typical {major} grad with these costs, the degree doesn't pay off financially by 65. It can still be worth it for other reasons — but borrow carefully.", { major: t(m.name) })}
      ${t("The true cost includes {tuition} in tuition after grants, {interest} in loan interest, and {forgone} in earnings you give up while in school.", { tuition: FG.money(netTuition), interest: FG.money(interest), forgone: FG.money(forgone) })}<br>${debtLine}</div>`;
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
  const ladders = () => {
    hbars("career-bars", CAREERS.map((c) => ({
      label: `${c.emoji} ${t(c.name)}<small>${t(c.edu)} · ${t(c.path)}</small>`, value: c.pay, valueLabel: k(c.pay),
    })), 120000, BA_YEAR);
    hbars("edu-bars", Object.entries(EDU_EARNINGS.weekly).map(([lvl, w]) => ({
      label: `${t(lvl)}<small>${t("{pct}% unemployment", { pct: EDU_EARNINGS.unemployment[lvl] })}</small>`, value: w * 52, valueLabel: k(w * 52),
    })), 120000);
  };
  ladders();

  /* ---------- Career explorer ---------- */
  const eduOf = (k) => EDU_LEVELS.find((e) => e.key === k);
  const exState = { edu: new Set(), group: "All", all: false };
  const EX_GROUPS = ["All", ...new Set(OCCUPATIONS.map((o) => o.group))];
  const explorerChips = () => {
    $("ex-edu").innerHTML = EDU_LEVELS.map((e) => `<button class="chip" data-edu="${e.key}" aria-pressed="${exState.edu.has(e.key)}">${t(e.label)}</button>`).join("");
    $("ex-group").innerHTML = EX_GROUPS.map((g) => `<button class="chip" data-xgroup="${g}" aria-pressed="${g === exState.group}">${t(g)}</button>`).join("");
  };
  explorerChips();

  function explorer() {
    const q = $("ex-search").value.trim().toLowerCase(), sort = $("ex-sort").value, fast = $("ex-fast").checked;
    const yrs = (o) => eduOf(o.edu).years;
    const key = { pay: (o) => -o.pay, growth: (o) => -(o.growth || 0), school: (o) => yrs(o) * 1e7 - o.pay, value: (o) => -o.pay / (yrs(o) + 1) }[sort];
    const list = OCCUPATIONS.filter((o) => (exState.group === "All" || o.group === exState.group)
      && (!exState.edu.size || exState.edu.has(o.edu)) && (!fast || o.growth) && (!q || has(o.name, q)))
      .sort((a, b) => key(a) - key(b));
    const shown = exState.all ? list : list.slice(0, 15);
    $("ex-more").hidden = list.length <= 15;
    $("ex-more").textContent = exState.all ? t("Show top 15") : t("Show all {n}", { n: list.length });
    const pays = list.map((o) => o.pay).sort((a, b) => a - b);
    const med = pays.length ? (pays.length % 2 ? pays[(pays.length - 1) / 2] : (pays[pays.length / 2 - 1] + pays[pays.length / 2]) / 2) : 0;
    const above = list.filter((o) => o.pay > ALL_OCCUPATIONS_MEDIAN).length;
    $("ex-stats").innerHTML = `
      <div class="stat"><div class="label">${t("Matching jobs")}</div><div class="value">${list.length}</div></div>
      <div class="stat hero"><div class="label">${t("Their median pay")}</div><div class="value">${list.length ? FG.money(med) : "—"}</div></div>
      <div class="stat"><div class="label">${t("Pay above the U.S. median")}</div><div class="value">${list.length ? Math.round((above / list.length) * 100) + "%" : "—"}</div></div>`;
    const max = 280000;
    $("ex-list").innerHTML = shown.length ? shown.map((o) => `
      <div class="hb-row">
        <span class="hb-name">${o.emoji} ${t(o.name)}<small>${t(eduOf(o.edu).label)}${yrs(o) ? " · " + t(yrs(o) > 1 ? "~{n} yrs of school" : "~{n} yr of school", { n: yrs(o) }) : ""}${o.growth ? ` · <span class="grow-badge">${t("↑ {pct}% growth", { pct: o.growth })}</span>` : ""}</small></span>
        <div class="hb-track"><span class="db-ref" style="left:${(ALL_OCCUPATIONS_MEDIAN / max) * 100}%"></span><span class="hb-bar" style="width:${(o.pay / max) * 100}%"></span></div>
        <span class="hb-val">${k(o.pay)}</span>
      </div>`).join("") : `<p class="muted">${t("No jobs match these filters.")}</p>`;
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
  const occOptions = () => { const v = $("sp-occ").value; $("sp-occ").innerHTML = STATE_PAY_OCCS.map((o) => `<option value="${o.key}">${o.emoji} ${t(o.name)}</option>`).join(""); if (v) $("sp-occ").value = v; };
  occOptions();
  $("sp-state").innerHTML = STATES.map((s) => `<option>${s}</option>`).join("");
  $("sp-occ").value = "rn"; $("sp-state").value = "Texas";
  let spAll = false;
  function statePay() {
    const occ = $("sp-occ").value, st = $("sp-state").value, nat = STATE_PAY_NATIONAL[occ];
    const o = STATE_PAY_OCCS.find((x) => x.key === occ);
    const ranked = STATES.filter((s) => STATE_PAY[s][occ]).sort((a, b) => STATE_PAY[b][occ] - STATE_PAY[a][occ]);
    const pay = STATE_PAY[st][occ];
    $("sp-label").textContent = t("{job} median pay in {state}", { job: t(o.name), state: st });
    $("sp-pay").textContent = pay ? FG.money(pay) : t("n/a");
    const diff = pay ? pay / nat - 1 : 0;
    $("sp-vs").innerHTML = pay ? t(diff >= 0 ? "{pct}% above the U.S. median ({nat})" : "{pct}% below the U.S. median ({nat})", { pct: Math.abs(Math.round(diff * 100)), nat: FG.money(nat) }) : t("BLS doesn't publish this figure for this state.");
    $("sp-rank").textContent = pay ? t("#{rank} of {total}", { rank: ranked.indexOf(st) + 1, total: ranked.length }) : "—";
    const max = Math.max(...ranked.map((s) => STATE_PAY[s][occ]));
    let shown = ranked;
    if (!spAll) {
      shown = [...ranked.slice(0, 5), ...ranked.slice(-5)];
      if (pay && !shown.includes(st)) shown.splice(5, 0, st);
    }
    $("sp-more").textContent = spAll ? t("Show top & bottom 5") : t("Show all {n} states", { n: ranked.length });
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
  let resizeTimer;
  addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(roi, 150); });
  document.addEventListener("langchange", () => { heroStats(); majorGroups(); renderMajors(); roiSelects(); roi(); ladders(); explorerChips(); explorer(); occOptions(); statePay(); });
  document.addEventListener("themechange", roi);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", roi);
})();
