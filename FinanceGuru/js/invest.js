// Investing hub: everything is computed from MARKET_HISTORY (1928–2025 annual returns).
(function () {
  const $ = (id) => document.getElementById(id);
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
  const H = MARKET_HISTORY;
  const YEARS = H.map((r) => r[0]);
  const pct = (v, d = 1) => (v >= 0 ? "" : "−") + Math.abs(v * 100).toFixed(d) + "%";
  const COL = { stocks: 1, bonds: 2, cash: 3, corp: 4, re: 5, gold: 6 };

  const ASSETS = [
    { key: "stocks", emoji: "📈", name: "Stocks", sub: "S&P 500, dividends reinvested", text: "Tiny ownership slices of 500 big U.S. companies. Highest long-run growth, biggest drops." },
    { key: "bonds", emoji: "🏛️", name: "Government bonds", sub: "10-year U.S. Treasury", text: "Loans to the U.S. government. Steadier than stocks; often rise when stocks fall." },
    { key: "corp", emoji: "🏢", name: "Corporate bonds", sub: "Baa-rated company bonds", text: "Loans to companies. A bit more return than Treasuries for a bit more risk." },
    { key: "cash", emoji: "💵", name: "Cash", sub: "3-month Treasury bills", text: "Like a savings account. Rarely loses dollars, but barely beats inflation over time." },
    { key: "re", emoji: "🏠", name: "Real estate", sub: "U.S. home prices", text: "Home price changes only (not rent). Most people own it through their home or REIT funds." },
    { key: "gold", emoji: "🥇", name: "Gold", sub: "Spot price", text: "No income, wild swings. Note: the U.S. fixed gold's price until the 1970s." },
  ];

  /* ---------- Stats helpers ---------- */
  const growth = (rs) => rs.reduce((g, r) => g * (1 + r), 1);
  const cagr = (rs) => Math.pow(growth(rs), 1 / rs.length) - 1;
  function summarize(rs) {
    let wi = 0, bi = 0;
    rs.forEach((r, i) => { if (r < rs[wi]) wi = i; if (r > rs[bi]) bi = i; });
    return { cagr: cagr(rs), worst: rs[wi], worstYear: YEARS[wi], best: rs[bi], bestYear: YEARS[bi], losses: rs.filter((r) => r < 0).length, growth: growth(rs) };
  }
  // "Real" mode converts each year's return to buying-power terms: (1 + return) / (1 + inflation) - 1.
  // INFLATION rows line up with MARKET_HISTORY rows (both 1928–2025).
  let real = false;
  const adj = (r, i) => (real ? (1 + r) / (1 + INFLATION[i][1]) - 1 : r);
  const series = (key) => H.map((r, i) => adj(r[COL[key]], i));
  const mixReturns = (s) => H.map((r, i) => adj(s * r[COL.stocks] + (1 - s) * r[COL.bonds], i)); // rebalanced yearly
  function windows(rs, n) {
    const out = [];
    for (let i = 0; i + n <= rs.length; i++) out.push(cagr(rs.slice(i, i + n)));
    return out;
  }

  /* ---------- Asset classes ---------- */
  let activeAsset = "stocks";
  function renderAssets() {
    $("asset-cards").innerHTML = ASSETS.map((a) => {
      const s = summarize(series(a.key));
      return `<button class="card asset-card" data-asset="${a.key}" aria-pressed="${a.key === activeAsset}">
        <div class="card-icon">${a.emoji}</div>
        <h3 style="margin:0">${a.name}</h3>
        <div class="small muted">${a.sub}</div>
        <div class="asset-big">${pct(s.cagr)}<small> / yr</small></div>
        <p class="small muted" style="margin:0 0 8px">${a.text}</p>
        <div class="small">Worst year: <strong>${pct(s.worst)}</strong> (${s.worstYear})</div>
        <div class="small">Down years: <strong>${s.losses} of ${H.length}</strong></div>
        <div class="small">$1,000 in 1928 → <strong>${FG.money(1000 * s.growth)}</strong>${real ? " <span class='muted'>(1928 dollars)</span>" : ""}</div>
      </button>`;
    }).join("");
    drawAssetChart();
  }
  function drawAssetChart() {
    const a = ASSETS.find((x) => x.key === activeAsset);
    const rs = series(a.key);
    $("asset-chart-title").textContent = `${a.emoji} ${a.name}: ${real ? "after-inflation " : ""}return every year, 1928–2025`;
    $("asset-chart-note").textContent = "Blue = gain, orange = loss. Hover a bar for the exact year.";
    Charts.bars($("asset-chart"), {
      x: YEARS, values: rs, name: a.name, yFormat: (v) => Math.round(v * 100) + "%",
      tipTitle: (i) => String(YEARS[i]), highlight: new Set(rs.map((r, i) => (r < 0 ? i : -1))),
      label: `${a.name} annual returns 1928 to 2025`,
    });
  }
  $("asset-cards").addEventListener("click", (e) => {
    const c = e.target.closest("[data-asset]");
    if (!c) return;
    activeAsset = c.dataset.asset;
    document.querySelectorAll("[data-asset]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.asset === activeAsset));
    drawAssetChart();
  });

  $("real-toggle").addEventListener("change", (e) => {
    real = e.target.checked;
    renderAssets();
    portfolio();
  });

  /* ---------- Inflation ---------- */
  const CPI_YEARS = Object.keys(CPI_ANNUAL).map(Number);
  const opts = CPI_YEARS.map((y) => `<option value="${y}">${y}</option>`).join("");
  $("inf-from").innerHTML = opts; $("inf-to").innerHTML = opts;
  $("inf-from").value = 1980; $("inf-to").value = 2025;

  function inflationCalc() {
    const amt = num("inf-amount"), a = +$("inf-from").value, b = +$("inf-to").value;
    const ratio = CPI_ANNUAL[b] / CPI_ANNUAL[a];
    const yrs = Math.abs(b - a), avg = yrs ? Math.pow(ratio, 1 / (b - a)) - 1 : 0;
    $("inf-label").textContent = `${FG.money(amt)} in ${a} has the same buying power as`;
    $("inf-result").textContent = `${FG.money(amt * ratio, amt * ratio < 100 ? 2 : 0)} in ${b}`;
    $("inf-detail").textContent = yrs
      ? `Prices ${ratio >= 1 ? "rose" : "fell"} ${Math.abs(Math.round((ratio - 1) * 100))}% over ${yrs} years (${(avg * 100).toFixed(1)}% a year on average).`
      : "Same year — no change.";
  }
  ["inf-amount", "inf-from", "inf-to"].forEach((id) => $(id).addEventListener("input", inflationCalc));

  let infStart = 1995;
  function inflationChart() {
    const si = YEARS.indexOf(infStart);
    const xs = [infStart - 1, ...YEARS.slice(si)];
    const lines = [
      { name: "Stocks", key: COL.stocks, color: "--series-1" },
      { name: "Bonds", key: COL.bonds, color: "--series-2" },
      { name: "Cash (T-bills)", key: COL.cash, color: "--series-3" },
      { name: "Under the mattress", key: null, color: "--series-4" },
    ].map((l) => {
      let v = 10000;
      const vals = [v];
      for (let i = si; i < H.length; i++) {
        const nominal = l.key === null ? 0 : H[i][l.key];
        v *= (1 + nominal) / (1 + INFLATION[i][1]);
        vals.push(v);
      }
      return { ...l, values: vals };
    });
    $("inf-start-label").textContent = infStart;
    Charts.line($("inf-chart"), {
      x: xs, xFormat: (y) => (y === infStart - 1 ? `Start` : y), label: "Buying power of $10,000 after inflation",
      series: lines, yFormat: FG.compact, tipFormat: (v) => FG.money(v),
      tipTitle: (i) => (i === 0 ? `Start of ${infStart}` : `End of ${xs[i]}`),
    });
    const end = (n) => lines.find((l) => l.name === n).values.at(-1);
    $("inf-insight").innerHTML = `<strong>Since ${infStart}:</strong> cash hidden under a mattress kept only <strong>${FG.money(end("Under the mattress"))}</strong> of buying power. T-bills roughly ${end("Cash (T-bills)") >= 10000 ? "kept pace" : "fell behind"} (${FG.money(end("Cash (T-bills)"))}), while stocks grew to <strong>${FG.money(end("Stocks"))}</strong> in ${infStart} dollars. Safe-feeling money can quietly lose value.`;
  }
  $("inf-presets").addEventListener("click", (e) => {
    const b = e.target.closest("[data-inf-start]");
    if (!b) return;
    infStart = +b.dataset.infStart;
    document.querySelectorAll("[data-inf-start]").forEach((c) => c.setAttribute("aria-pressed", c === b));
    inflationChart();
  });
  function inflationBars() {
    Charts.bars($("inf-bars"), {
      x: INFLATION.map((r) => r[0]), values: INFLATION.map((r) => r[1]), name: "Inflation",
      yFormat: (v) => Math.round(v * 100) + "%", highlight: new Set(INFLATION.map((r, i) => (r[1] > 0.05 ? i : -1))),
      tipTitle: (i) => String(INFLATION[i][0]), label: "U.S. inflation by year, 1928 to 2025", height: 200,
    });
  }

  /* ---------- Portfolio builder ---------- */
  function portfolio() {
    const s = +$("mix").value / 100, n = +$("hold").value;
    $("mix-s").textContent = Math.round(s * 100);
    $("mix-b").textContent = Math.round((1 - s) * 100);
    $("mix-bar-s").style.flex = s; $("mix-bar-b").style.flex = 1 - s;
    $("hold-label").textContent = n;
    const rs = mixReturns(s), st = summarize(rs), w = windows(rs, n);
    const lossShare = w.filter((x) => x < 0).length / w.length;
    $("pf-cagr").textContent = pct(st.cagr);
    $("pf-worst").textContent = `${pct(st.worst)} (${st.worstYear})`;
    $("pf-loss").textContent = `${st.losses} of ${rs.length}`;
    $("pf-hold-label").textContent = `Chance of loss over ${n} yr${n > 1 ? "s" : ""}`;
    $("pf-holdloss").textContent = Math.round(lossShare * 100) + "%";
    $("pf-chart-title").textContent = n === 1 ? "Every single year since 1928" : `Every ${n}-year period since 1928`;
    const sorted = [...w].sort((a, b) => a - b);
    Charts.bars($("pf-chart"), {
      x: YEARS.slice(0, w.length), values: w, name: "Avg. yearly return",
      yFormat: (v) => Math.round(v * 100) + "%", highlight: new Set(w.map((r, i) => (r < 0 ? i : -1))),
      tipTitle: (i) => n === 1 ? String(YEARS[i]) : `${YEARS[i]}–${YEARS[i + n - 1]}`, label: "Rolling period returns",
    });
    const worstI = w.indexOf(sorted[0]);
    $("pf-insight").innerHTML = `<strong>What history says:</strong> across ${w.length} different ${n}-year periods, the worst averaged <strong>${pct(sorted[0])}/yr</strong> (${YEARS[worstI]}–${YEARS[worstI + n - 1]}), the middle outcome was <strong>${pct(sorted[Math.floor(sorted.length / 2)])}/yr</strong>, and the best was <strong>${pct(sorted[sorted.length - 1])}/yr</strong>. ${lossShare === 0 ? "Not one of them lost money. Time is the great risk reducer." : `${Math.round(lossShare * 100)}% lost money — try a longer hold time and watch that number shrink.`}`;
  }
  ["mix", "hold"].forEach((id) => $(id).addEventListener("input", portfolio));

  /* ---------- Time machine ---------- */
  const EVENTS = { 1929: "Stock market crash", 1930: "Great Depression", 1931: "Great Depression", 1937: "Recession", 1941: "U.S. enters WWII", 1966: "Bear market", 1973: "Oil shock", 1974: "Bear market", 1987: "Black Monday (Oct)", 2000: "Dot-com bust", 2001: "9/11 & recession", 2002: "Bear market", 2008: "Global financial crisis", 2020: "COVID crash — recovered by year-end", 2022: "Inflation & rate hikes" };
  $("tm-start").innerHTML = YEARS.map((y) => `<option value="${y}">${y}</option>`).join("");
  $("tm-start").value = 2005;

  function timeMachine() {
    const start = +$("tm-start").value, si = YEARS.indexOf(start);
    const maxYears = H.length - si;
    $("tm-years").max = maxYears;
    if (+$("tm-years").value > maxYears) $("tm-years").value = maxYears;
    const n = +$("tm-years").value, s = +$("tm-mix").value / 100;
    $("tm-years-label").textContent = `${n} (${start}–${start + n - 1})`;
    $("tm-mix-label").textContent = s === 1 ? "100% stocks" : s === 0 ? "100% bonds" : `${Math.round(s * 100)}% stocks / ${Math.round((1 - s) * 100)}% bonds`;
    const init = num("tm-initial"), yearly = num("tm-yearly");
    let bal = 0, put = 0, idx = 1, peak = 1, maxDD = 0, ddYear = null;
    const vals = [], ins = [], xs = [];
    for (let k = 0; k < n; k++) {
      const row = H[si + k], r = s * row[COL.stocks] + (1 - s) * row[COL.bonds];
      const add = (k === 0 ? init : 0) + yearly;
      bal = (bal + add) * (1 + r); put += add;
      idx *= 1 + r; peak = Math.max(peak, idx);
      if (1 - idx / peak > maxDD) { maxDD = 1 - idx / peak; ddYear = row[0]; }
      vals.push(bal); ins.push(put); xs.push(row[0]);
    }
    $("tm-final").textContent = FG.money(bal);
    $("tm-in").textContent = FG.money(put);
    $("tm-dd").textContent = maxDD > 0.001 ? `−${Math.round(maxDD * 100)}% (${ddYear})` : "None";
    Charts.line($("tm-chart"), {
      x: xs, label: "Portfolio value over time",
      series: [{ name: "Your portfolio", color: "--series-1", values: vals }, { name: "Money you put in", color: "--series-2", values: ins, dash: true }],
      yFormat: FG.compact, tipFormat: (v) => FG.money(v), tipTitle: (i) => `End of ${xs[i]}`,
      tipExtra: (i) => (EVENTS[xs[i]] ? `<div class="small muted" style="margin-top:4px">📰 ${EVENTS[xs[i]]}</div>` : ""),
    });
    const gain = bal - put;
    $("tm-story").innerHTML = gain >= 0
      ? `Starting in ${start} and adding ${FG.money(yearly)} a year, your money grew ${FG.money(gain)} beyond what you put in${maxDD > 0.2 ? ` — even after a ${Math.round(maxDD * 100)}% drop along the way. Investors who kept buying through the crash were rewarded.` : "."}`
      : `Starting in ${start}, you'd be down ${FG.money(-gain)} after ${n} year${n > 1 ? "s" : ""}. Short periods can be brutal — try extending the years and watch what happens.`;
  }
  ["tm-start", "tm-years", "tm-initial", "tm-yearly", "tm-mix"].forEach((id) => $(id).addEventListener("input", timeMachine));
  $("tm-presets").addEventListener("click", (e) => {
    const b = e.target.closest("[data-start]");
    if (!b) return;
    $("tm-start").value = b.dataset.start;
    $("tm-years").value = b.dataset.start === "2015" ? 11 : 20;
    timeMachine();
  });

  /* ---------- Fees ---------- */
  function fees() {
    const pmt = num("fee-monthly"), n = +$("fee-years").value, r = (parseFloat($("fee-return").value) || 0) / 100;
    $("fee-years-label").textContent = n;
    const run = (fee) => {
      const m = (r - fee / 100) / 12, out = [0];
      let b = 0;
      for (let y = 1; y <= n; y++) { for (let k = 0; k < 12; k++) b = b * (1 + m) + pmt; out.push(b); }
      return out;
    };
    const a = run(parseFloat($("fee-low").value) || 0), b = run(parseFloat($("fee-high").value) || 0);
    const lost = a[n] - b[n];
    $("fee-lost").textContent = FG.money(lost);
    $("fee-a").textContent = FG.money(a[n]);
    $("fee-b").textContent = FG.money(b[n]);
    Charts.line($("fee-chart"), {
      x: a.map((_, i) => i), xFormat: (v) => `Yr ${v}`, label: "Balance with low vs high fees",
      series: [{ name: `Low-cost (${$("fee-low").value}%)`, color: "--series-1", values: a }, { name: `Higher-cost (${$("fee-high").value}%)`, color: "--series-2", values: b }],
      yFormat: FG.compact, tipFormat: (v) => FG.money(v), tipTitle: (i) => `Year ${i}`,
      tipExtra: (i) => `<div class="row" style="border-top:1px solid var(--border);margin-top:4px;padding-top:4px"><span>Lost to fees</span><strong>${FG.money(a[i] - b[i])}</strong></div>`,
    });
  }
  ["fee-monthly", "fee-years", "fee-return", "fee-low", "fee-high"].forEach((id) => $(id).addEventListener("input", fees));

  /* ---------- Accounts ---------- */
  const ACCOUNTS = [
    { e: "🏢", n: "401(k) / 403(b)", lim: "$24,500/yr (+$8,000 if 50+)", tax: "Pre-tax (traditional) or Roth option", best: "Employer match = free money. Automatic payroll saving.", watch: "Limited fund menu; withdrawals before 59½ usually penalized." },
    { e: "🌱", n: "Roth IRA", lim: "$7,500/yr (+$1,100 if 50+)", tax: "Pay tax now, grows and withdraws tax-free", best: "Young earners in lower tax brackets. Contributions can come out anytime.", watch: "Income limits apply. Earnings locked until 59½ (with exceptions)." },
    { e: "🏦", n: "Traditional IRA", lim: "Shares the $7,500 IRA limit", tax: "May be tax-deductible now, taxed on withdrawal", best: "Higher earners expecting a lower tax rate in retirement.", watch: "Deduction phases out if you have a workplace plan and higher income." },
    { e: "🩺", n: "HSA", lim: "$4,400 self / $8,750 family", tax: "Triple tax advantage: in, growth, and out (for medical)", best: "Anyone with a high-deductible health plan. Can be invested.", watch: "Only available with an HSA-eligible health plan." },
    { e: "📊", n: "Taxable brokerage", lim: "No limit", tax: "Taxed on dividends and gains (long-term gains get lower rates)", best: "Goals before retirement; extra money after maxing other accounts.", watch: "No tax break — use tax-efficient index funds." },
    { e: "🎓", n: "529 plan", lim: "No annual IRS limit (state caps apply)", tax: "Tax-free growth for education", best: "Saving for a child's college or trade school. Some states add a tax deduction.", watch: "Non-education withdrawals owe tax + 10% penalty on earnings." },
  ];
  $("account-cards").innerHTML = ACCOUNTS.map((a) => `
    <div class="card">
      <div class="card-icon">${a.e}</div><h3>${a.n}</h3>
      <div class="kv"><span>2026 limit</span><strong>${a.lim}</strong></div>
      <div class="kv"><span>Taxes</span><span>${a.tax}</span></div>
      <p class="small" style="margin:8px 0 4px">✅ ${a.best}</p>
      <p class="small muted" style="margin:0">⚠️ ${a.watch}</p>
    </div>`).join("");

  /* ---------- Risk quiz ---------- */
  const QUIZ = [
    { q: "When will you need most of this money?", a: [["Within 3 years", 0], ["In 3–7 years", 1], ["In 7–15 years", 3], ["15+ years from now", 4]] },
    { q: "Your investments drop 30% in a few months. You…", a: [["Sell everything — get me out", 0], ["Sell some to feel safer", 1], ["Hold and wait it out", 3], ["Buy more — stocks are on sale", 4]] },
    { q: "What matters most to you?", a: [["Protecting what I have", 0], ["A balance of growth and safety", 2], ["Maximum long-term growth", 4]] },
    { q: "How steady is your income?", a: [["Unpredictable", 0], ["Fairly steady", 2], ["Very stable", 3]] },
    { q: "Do you have an emergency fund?", a: [["Not yet", 0], ["1–2 months of expenses", 2], ["3+ months of expenses", 3]] },
  ];
  let qi = 0, answers = [];
  function renderQuiz() {
    const box = $("risk-quiz");
    if (qi < QUIZ.length) {
      const q = QUIZ[qi];
      box.innerHTML = `<div class="small muted">Question ${qi + 1} of ${QUIZ.length}</div>
        <div class="step-dots">${QUIZ.map((_, i) => `<span class="${i <= qi ? "on" : ""}"></span>`).join("")}</div>
        <p class="quiz-q">${q.q}</p>
        <div class="choices">${q.a.map(([t, v], i) => `<button class="choice" data-qa="${i}">${t}</button>`).join("")}</div>`;
      return;
    }
    const score = answers.reduce((s, v) => s + v, 0); // 0..18
    let stocks = Math.round((20 + (score / 18) * 80) / 10) * 10;
    if (answers[0] === 0) stocks = Math.min(stocks, 30); // short horizon caps risk
    const style = stocks <= 30 ? ["🛡️", "Conservative"] : stocks <= 60 ? ["⚖️", "Moderate"] : stocks <= 80 ? ["🌱", "Growth"] : ["🚀", "Aggressive growth"];
    const st = summarize(mixReturns(stocks / 100));
    box.innerHTML = `<div class="result" style="padding:8px">
      <div class="card-icon" style="font-size:2.4rem">${style[0]}</div>
      <h3>Your style: ${style[1]}</h3>
      <div class="big">${stocks}% stocks / ${100 - stocks}% bonds</div>
      <p class="muted">Historically this mix averaged <strong>${pct(st.cagr)}/yr</strong>, with a worst year of <strong>${pct(st.worst)}</strong> (${st.worstYear}).</p>
      <div class="hero-actions" style="justify-content:center">
        <button class="btn btn-primary" data-load="${stocks}">Load into portfolio builder ↑</button>
        <button class="btn btn-ghost" data-retake>Retake quiz</button>
      </div>
      <p class="small muted" style="margin-top:12px">Sample only. Target-date funds handle this mix automatically and get more conservative as you age.</p>
    </div>`;
  }
  $("risk-quiz").addEventListener("click", (e) => {
    const a = e.target.closest("[data-qa]");
    if (a) { answers.push(QUIZ[qi].a[+a.dataset.qa][1]); qi++; renderQuiz(); return; }
    const l = e.target.closest("[data-load]");
    if (l) { $("mix").value = l.dataset.load; portfolio(); FG.scrollTo($("portfolio")); FG.toast("Mix loaded into the portfolio builder"); return; }
    if (e.target.closest("[data-retake]")) { qi = 0; answers = []; renderQuiz(); }
  });

  /* ---------- Glossary ---------- */
  const TERMS = [
    ["Index fund", "A fund that buys every company in a market index (like the S&P 500) instead of picking winners. Low cost, broad diversification."],
    ["ETF", "Exchange-traded fund. A basket of investments that trades like a single stock. Many index funds are ETFs."],
    ["Expense ratio", "The yearly fee a fund charges, as a % of your money. 0.05% = $5 per $10,000 per year."],
    ["Diversification", "Spreading money across many investments so one failure can't sink you."],
    ["Dividend", "Cash a company pays shareholders out of its profits. Reinvesting dividends supercharges compounding."],
    ["Bull / bear market", "Bull: prices rising. Bear: prices down 20% or more from a peak."],
    ["Dollar-cost averaging", "Investing a fixed amount on a schedule (e.g., every paycheck), so you automatically buy more when prices are low."],
    ["Rebalancing", "Periodically resetting your mix (e.g., back to 60/40) after markets move it."],
    ["Target-date fund", "An all-in-one fund that picks a mix for your retirement year and gets safer over time."],
    ["Capital gain", "Profit from selling something for more than you paid. Held over a year? Usually taxed at a lower rate."],
    ["Compound interest", "Earning returns on your past returns. The engine of long-term wealth."],
    ["Volatility", "How much and how fast prices swing. Not the same as permanent loss — unless you sell at the bottom."],
  ];
  $("glossary-list").innerHTML = TERMS.map(([t, d]) => `<details class="card"><summary><strong>${t}</strong></summary><p class="muted" style="margin:8px 0 0">${d}</p></details>`).join("");

  /* ---------- Init & redraw ---------- */
  function all() { drawAssetChart(); inflationChart(); inflationBars(); portfolio(); timeMachine(); fees(); }
  renderAssets();
  inflationCalc(); inflationChart(); inflationBars();
  portfolio(); timeMachine(); fees(); renderQuiz();
  let t;
  addEventListener("resize", () => { clearTimeout(t); t = setTimeout(all, 150); });
  document.addEventListener("themechange", all);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", all);
})();
