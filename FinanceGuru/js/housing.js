// Housing hub: mortgage calculator with amortization, and rent vs buy.
(function () {
  const $ = (id) => document.getElementById(id);
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
  const t = I18N.t;

  function inputs() {
    const price = num("m-price"), down = num("m-down") / 100;
    return {
      price, down, loan: price * (1 - down), rate: num("m-rate") / 100, years: +$("m-term").value,
      tax: num("m-tax") / 100, ins: num("m-ins"), pmi: num("m-pmi") / 100, closing: num("m-closing") / 100, income: num("m-income"),
    };
  }
  const payment = (loan, r, n) => (r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n)));

  // Month-by-month schedule. PMI stops when the balance is scheduled to reach 78% of the original value
  // (Homeowners Protection Act automatic termination).
  function schedule(p) {
    const r = p.rate / 12, n = p.years * 12, pi = payment(p.loan, r, n);
    let bal = p.loan;
    const months = [];
    for (let m = 1; m <= n; m++) {
      const interest = bal * r, principal = Math.min(bal, pi - interest);
      const pmi = p.down < 0.2 && bal > 0.78 * p.price ? (p.loan * p.pmi) / 12 : 0;
      bal -= principal;
      months.push({ interest, principal, pmi, bal });
    }
    return { pi, months };
  }

  /* ---------- Mortgage ---------- */
  function mortgage() {
    const p = inputs();
    $("m-down-l").textContent = $("m-down").value;
    const { pi, months } = schedule(p);
    const tax = (p.price * p.tax) / 12, ins = p.ins / 12, pmi = months[0].pmi;
    const total = pi + tax + ins + pmi;
    const totalInterest = months.reduce((sum, m) => sum + m.interest, 0);
    const share = p.income ? (total * 12) / p.income : 0;
    $("m-pay").textContent = FG.money(total);
    $("m-cash").textContent = FG.money(p.price * p.down + p.price * p.closing);
    $("m-int").textContent = FG.money(totalInterest);
    $("m-share").textContent = p.income ? Math.round(share * 100) + "%" : "—";
    $("m-share").style.color = share > 0.3 ? "var(--bad)" : "";

    const parts = [
      ["Principal & interest", pi, "--series-1"], ["Property tax", tax, "--series-2"],
      ["Home insurance", ins, "--series-3"], ["Mortgage insurance (PMI)", pmi, "--series-4"],
    ].filter(([, v]) => v > 0.5);
    $("m-bar").innerHTML = parts.map(([n, v, c]) => `<div style="flex:${v};background:var(${c})" title="${t(n)}"></div>`).join("");
    $("m-bar").setAttribute("aria-label", parts.map(([n, v]) => `${t(n)} ${FG.money(v)}`).join(", "));
    $("m-list").innerHTML = parts.map(([n, v, c]) => `<div class="pc-row"><span><i style="background:var(${c})"></i>${t(n)}</span><span>${FG.money(v)}<small class="muted"> ${t("/mo")}</small></span><span class="muted">${t("{amount}/yr", { amount: FG.money(v * 12) })}</span></div>`).join("");

    // Yearly principal vs interest
    const yrs = [], ints = [], prins = [];
    for (let y = 0; y < p.years; y++) {
      const slice = months.slice(y * 12, y * 12 + 12);
      yrs.push(y + 1);
      ints.push(slice.reduce((sum, m) => sum + m.interest, 0));
      prins.push(slice.reduce((sum, m) => sum + m.principal, 0));
    }
    const cross = prins.findIndex((v, i) => v > ints[i]);
    Charts.line($("m-chart"), {
      x: yrs, xFormat: (y) => t("Yr {n}", { n: y }), label: t("Interest vs principal paid each year"),
      series: [{ name: t("Interest"), color: "--series-2", values: ints }, { name: t("Principal (your equity)"), color: "--series-1", values: prins }],
      yFormat: FG.compact, tipFormat: (v) => FG.money(v), tipTitle: (i) => t("Year {n}", { n: yrs[i] }),
      markers: cross > 0 ? [{ i: cross, label: t("Tipping point: year {n}", { n: cross + 1 }) }] : [],
    });
    const pmiEnd = months.findIndex((m) => m.pmi === 0);
    $("m-insight").innerHTML = t("In year 1, about <strong>{pct}%</strong> of your principal-and-interest payments go to interest. Over {years} years you'd pay <strong>{interest}</strong> in interest on a {loan} loan.",
        { pct: Math.round((ints[0] / (ints[0] + prins[0])) * 100), years: p.years, interest: FG.money(totalInterest), loan: FG.money(p.loan) })
      + (pmi > 0 ? " " + t("PMI ({pmi}/mo) would drop off automatically after about <strong>{years} years</strong>.", { pmi: FG.money(pmi), years: Math.ceil(pmiEnd / 12) }) : "")
      + (share > 0.3 ? " <br>" + t("⚠️ This takes {pct}% of your income — above the 30% level HUD calls \"cost-burdened.\"", { pct: Math.round(share * 100) }) : "");
    rentBuy();
  }
  ["m-price", "m-down", "m-rate", "m-term", "m-income", "m-tax", "m-ins", "m-pmi", "m-closing"].forEach((id) => $(id).addEventListener("input", mortgage));

  /* ---------- Rent vs buy ---------- */
  function rentBuy() {
    const p = inputs(), N = +$("rb-years").value;
    $("rb-years-l").textContent = N;
    const app = num("rb-app") / 100, rentG = num("rb-rentg") / 100, ret = num("rb-ret") / 100, maint = num("rb-maint") / 100, sell = num("rb-sell") / 100;
    const { pi, months } = schedule(p);
    const mr = Math.pow(1 + ret, 1 / 12) - 1;
    let buyerInv = 0, renterInv = p.price * p.down + p.price * p.closing; // renter invests what the buyer spends upfront
    const xs = [0], buyNW = [p.price * (1 - sell) - p.loan], rentNW = [renterInv];
    for (let m = 1; m <= N * 12; m++) {
      const y = Math.floor((m - 1) / 12);
      const value = p.price * Math.pow(1 + app, (m - 1) / 12);
      const mo = months[m - 1] || { pmi: 0 };
      const buyCost = (m <= months.length ? pi : 0) + (value * p.tax) / 12 + (p.ins * Math.pow(1.03, y)) / 12 + (value * maint) / 12 + mo.pmi;
      const rentCost = num("rb-rent") * Math.pow(1 + rentG, y);
      buyerInv *= 1 + mr; renterInv *= 1 + mr;
      if (buyCost > rentCost) renterInv += buyCost - rentCost; else buyerInv += rentCost - buyCost;
      if (m % 12 === 0) {
        const bal = months[m - 1] ? months[m - 1].bal : 0;
        const v = p.price * Math.pow(1 + app, m / 12);
        xs.push(m / 12);
        buyNW.push(v * (1 - sell) - bal + buyerInv);
        rentNW.push(renterInv);
      }
    }
    const b = buyNW[N], r = rentNW[N];
    const be = buyNW.findIndex((v, i) => i > 0 && v >= rentNW[i]);
    $("rb-winner-l").textContent = t(N > 1 ? "Ahead after {n} years" : "Ahead after {n} year", { n: N });
    $("rb-winner").textContent = b >= r ? t("Buying +{amount}", { amount: FG.compact(b - r) }) : t("Renting +{amount}", { amount: FG.compact(r - b) });
    $("rb-buy").textContent = FG.money(b);
    $("rb-renter").textContent = FG.money(r);
    Charts.line($("rb-chart"), {
      x: xs, xFormat: (y) => t("Yr {n}", { n: y }), label: t("Net worth: buyer vs renter"),
      series: [{ name: t("Buyer (home equity after selling costs + investments)"), color: "--series-1", values: buyNW }, { name: t("Renter (investments)"), color: "--series-2", values: rentNW }],
      yFormat: (v) => (v < 0 ? "−" : "") + FG.compact(Math.abs(v)), tipFormat: (v) => (v < 0 ? "−" : "") + FG.money(Math.abs(v)), tipTitle: (i) => t(xs[i] === 1 ? "After {n} year" : "After {n} years", { n: xs[i] }),
      markers: be > 0 ? [{ i: be, label: t("Buying pulls ahead: year {n}", { n: be }) }] : [], minZero: false,
    });
    $("rb-insight").innerHTML = be > 0
      ? t(be > 1 ? "With these assumptions, buying comes out ahead after about <strong>{n} years</strong>. Before that, closing and selling costs outweigh the equity you've built." : "With these assumptions, buying comes out ahead after about <strong>{n} year</strong>. Before that, closing and selling costs outweigh the equity you've built.", { n: be })
      : t("With these assumptions, <strong>renting stays ahead</strong> for the whole {n}-year period — the renter's invested down payment and lower costs beat the buyer's equity. Try a longer stay, a lower rate, or higher rent.", { n: N });
  }
  ["rb-rent", "rb-years", "rb-app", "rb-rentg", "rb-ret", "rb-maint", "rb-sell"].forEach((id) => $(id).addEventListener("input", rentBuy));

  mortgage();
  let resizeTimer;
  addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(mortgage, 150); });
  document.addEventListener("langchange", mortgage);
  document.addEventListener("themechange", mortgage);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", mortgage);
})();
