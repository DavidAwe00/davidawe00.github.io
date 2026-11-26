// Car Cost calculator (Tools page): loan payment, interest, all-in monthly cost, loan-length comparison,
// and a check against the 20/4/10 rule of thumb. Sources are listed in the panel's "How this works".
(function () {
  const $ = (id) => document.getElementById(id);
  if (!$("panel-car")) return;
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
  const money = (v) => FG.money(Math.round(v));
  const t = I18N.t;
  const TERMS = [36, 48, 60, 72, 84];

  const payment = (principal, apr, months) => {
    if (principal <= 0) return 0;
    const r = apr / 100 / 12;
    return r ? (principal * r) / (1 - Math.pow(1 + r, -months)) : principal / months;
  };

  function calc() {
    const price = num("car-price"), down = Math.min(num("car-down"), price), apr = num("car-apr"), term = +$("car-term").value;
    const principal = price - down;
    const running = num("car-ins") + num("car-gas") + num("car-maint");
    const pay = payment(principal, apr, term);
    const interest = pay * term - principal;
    const total = pay + running;
    const income = num("car-income") / 12;
    const pct = income ? total / income : 0;

    $("car-pay").textContent = money(pay);
    $("car-total").textContent = money(total);
    $("car-pct").textContent = income ? t("{pct}% of your gross pay", { pct: Math.round(pct * 100) }) : "";
    $("car-int").textContent = money(interest);

    const checks = [
      [down >= price * 0.2, t("20% down: {pct}% ({down} of {price})", { pct: price ? Math.round((down / price) * 100) : 0, down: money(down), price: money(price) })],
      [term <= 48, t("4-year loan or shorter: {years} years", { years: term / 12 })],
      [income > 0 && pct <= 0.1, t("Total car costs under 10% of gross pay: {pct}%", { pct: income ? Math.round(pct * 100) : "—" })],
    ];
    $("car-status").innerHTML = `<p class="small" style="margin:0 0 6px"><strong>${t("20/4/10 rule of thumb")}</strong></p>
      <ul class="car-checks">${checks.map(([ok, text]) => `<li class="${ok ? "ok" : "no"}"><span aria-hidden="true">${ok ? "✅" : "⚠️"}</span> ${text}<span class="sr-only">${ok ? t(" (met)") : t(" (not met)")}</span></li>`).join("")}</ul>`;

    const rows = TERMS.map((m) => {
      const p = payment(principal, apr, m);
      return { m, p, i: p * m - principal };
    });
    $("car-table").innerHTML = `<thead><tr><th scope="col">${t("Length")}</th><th scope="col">${t("Monthly payment")}</th><th scope="col">${t("Total interest")}</th><th scope="col">${t("Total paid for car")}</th></tr></thead><tbody>${
      rows.map((r) => `<tr${r.m === term ? ' class="current"' : ""}><td>${t("{n} mo", { n: r.m })}${r.m === term ? ` <span class="small">${t("(yours)")}</span>` : ""}</td><td>${money(r.p)}</td><td>${money(r.i)}</td><td>${money(down + r.p * r.m)}</td></tr>`).join("")}</tbody>`;

    const short = rows[0], long = rows[rows.length - 1];
    $("car-insight").innerHTML = principal <= 0
      ? t("No loan needed. Paying cash means no interest at all, and you only pay running costs.")
      : t("Stretching from {short} to {long} months lowers the payment by <strong>{lower}</strong> a month but adds <strong>{more}</strong> in interest, and long loans often leave you owing more than the car is worth for years. Running costs (insurance, fuel, upkeep) add <strong>{running}</strong> a month on top of any payment.", { short: short.m, long: long.m, lower: money(short.p - long.p), more: money(long.i - short.i), running: money(running) });
  }

  ["car-price", "car-down", "car-apr", "car-term", "car-ins", "car-gas", "car-maint", "car-income"].forEach((id) => $(id).addEventListener("input", calc));
  document.addEventListener("tabshow", (e) => { if (e.detail === "car") calc(); });
  document.addEventListener("langchange", calc);
  calc();
})();
