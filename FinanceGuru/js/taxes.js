// Taxes 101: bracket buckets and paycheck breakdown (2026 figures from js/data/tax2026.js).
(function () {
  const $ = (id) => document.getElementById(id);
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
  const pct = (v, d = 1) => (v * 100).toFixed(d) + "%";
  const F = TAX_2026.fica;

  /* ---------- Brackets as buckets ---------- */
  function brackets() {
    const status = $("tb-status").value, income = +$("tb-income").value;
    $("tb-income-l").textContent = FG.money(income);
    const r = federalTax(status, income);
    $("tb-taxable").textContent = FG.money(r.taxable);
    $("tb-tax").textContent = FG.money(r.tax);
    $("tb-marg").textContent = r.taxable > 0 ? pct(r.marginal, 0) : "0%";
    $("tb-eff").textContent = income ? pct(r.tax / income) : "0%";
    const lastUsed = r.parts.reduce((k, p, i) => (p.inBucket > 0 ? i : k), 0);
    $("tb-buckets").innerHTML = r.parts.slice(0, Math.min(r.parts.length, lastUsed + 2)).map((p) => {
      const size = p.hi === Infinity ? Math.max(p.inBucket, 1) : p.hi - p.lo;
      const fill = Math.min(100, (p.inBucket / size) * 100);
      return `<div class="bucket-row ${p.inBucket ? "" : "empty"}">
        <span class="bucket-rate">${pct(p.rate, 0)}</span>
        <div><div class="bucket-track"><span style="width:${fill}%"></span></div>
          <div class="small muted">${FG.money(p.lo)}${p.hi === Infinity ? "+" : "–" + FG.money(p.hi)} of taxable income</div></div>
        <span class="bucket-val">${p.inBucket ? `${FG.money(p.inBucket)} → <strong>${FG.money(p.tax)}</strong>` : "empty"}</span>
      </div>`;
    }).join("");
    const extraTax = 1000 * r.marginal, takeHome = 1000 - extraTax - 1000 * (F.ssRate + F.medicare);
    $("tb-raise").innerHTML = r.taxable > 0
      ? `<strong>Myth buster:</strong> a $1,000 raise adds about ${FG.money(extraTax)} in federal income tax (your ${pct(r.marginal, 0)} bucket) plus ${FG.money(1000 * (F.ssRate + F.medicare))} in Social Security and Medicare — you still keep about <strong>${FG.money(takeHome)}</strong> before state tax. A raise never lowers your take-home pay.`
      : `<strong>No federal income tax:</strong> income below the standard deduction (${FG.money(TAX_2026.stdDed[status])}) isn't taxed. You'd still pay 7.65% for Social Security and Medicare on wages.`;
  }
  ["tb-status", "tb-income"].forEach((id) => $(id).addEventListener("input", brackets));

  /* ---------- Paycheck ---------- */
  const PARTS = [
    { key: "net", name: "Take-home pay", color: "--series-1" },
    { key: "fed", name: "Federal income tax", color: "--series-2" },
    { key: "ss", name: "Social Security (6.2%)", color: "--series-3" },
    { key: "med", name: "Medicare (1.45%)", color: "--series-4" },
    { key: "state", name: "State income tax", color: "--series-5" },
    { key: "k401", name: "401(k) — your savings", color: "--series-6" },
    { key: "health", name: "Health insurance", color: "--series-7" },
  ];
  function paycheckFor(salary, status, k401Rate, health, stateRate) {
    const k401 = salary * k401Rate;
    const ficaWages = Math.max(0, salary - health);             // cafeteria-plan premiums skip FICA; 401(k) doesn't
    const incomeWages = Math.max(0, salary - health - k401);
    const fed = federalTax(status, incomeWages).tax;
    const ss = F.ssRate * Math.min(ficaWages, F.ssWageBase);
    const med = F.medicare * ficaWages + F.addlMedicare * Math.max(0, ficaWages - F.addlThreshold);
    const state = stateRate * incomeWages;
    const net = salary - fed - ss - med - state - k401 - health;
    return { net, fed, ss, med, state, k401, health };
  }
  function paycheck() {
    const salary = num("pc-salary"), freq = +$("pc-freq").value, status = $("pc-status").value;
    const k = +$("pc-401k").value / 100, health = num("pc-health"), stateRate = num("pc-state") / 100;
    $("pc-401k-l").textContent = $("pc-401k").value;
    const p = paycheckFor(salary, status, k, health, stateRate);
    const per = (v) => v / freq;
    $("pc-gross").textContent = FG.money(per(salary));
    $("pc-net").textContent = FG.money(per(p.net));
    $("pc-keep").textContent = salary ? pct(p.net / salary, 0) : "—";
    const shown = PARTS.filter((x) => p[x.key] > 0.5);
    $("pc-bar").innerHTML = shown.map((x) => `<div style="flex:${p[x.key]};background:var(${x.color})" title="${x.name}"></div>`).join("");
    $("pc-bar").setAttribute("aria-label", shown.map((x) => `${x.name} ${FG.money(per(p[x.key]))}`).join(", "));
    $("pc-list").innerHTML = shown.map((x) => `
      <div class="pc-row"><span><i style="background:var(${x.color})"></i>${x.name}</span>
        <span>${FG.money(per(p[x.key]))}<small class="muted"> /check</small></span>
        <span class="muted">${FG.money(p[x.key])}/yr</span></div>`).join("");
    const no401 = paycheckFor(salary, status, 0, health, stateRate);
    const saved = (no401.fed + no401.state) - (p.fed + p.state);
    $("pc-insight").innerHTML = p.k401 > 0
      ? `<strong>Pre-tax power:</strong> your ${FG.money(p.k401)} 401(k) contribution only shrinks take-home pay by ${FG.money(p.k401 - saved)} a year, because it cuts your income taxes by about ${FG.money(saved)}.`
      : `<strong>Tip:</strong> try a pre-tax 401(k). Every dollar you contribute lowers your federal and state income tax.`;
  }
  ["pc-salary", "pc-freq", "pc-status", "pc-401k", "pc-health", "pc-state"].forEach((id) => $(id).addEventListener("input", paycheck));

  brackets(); paycheck();
})();
