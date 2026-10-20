// Net Worth Tracker: assets − debts, with one saved snapshot per month and a trend chart (Charts.line).
// Everything persists in this browser.
(function () {
  const { $, money, store, listEditor } = ToolKit;
  if (!$("panel-networth")) return;
  const HISTORY_KEY = "fg-tool-networth-history";
  let assets = [], debts = [];
  const sum = (rows) => rows.reduce((t, r) => t + (r.value || 0), 0);
  const fields = (what) => [{ key: "name", label: what, type: "text", width: "1.5fr" }, { key: "value", label: "Amount", type: "number", prefix: "$" }];
  // Defined before the editors below, which call calc() as soon as they render.
  const history = () => store.get(HISTORY_KEY, []);
  const monthLabel = (ym) => new Date(ym + "-01T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });

  listEditor({
    host: $("nw-assets"), addBtn: $("nw-add-asset"), storeKey: "fg-tool-networth-assets", fields: fields("Asset"),
    defaults: [{ name: "Checking", value: 850 }, { name: "Savings", value: 1500 }, { name: "Roth IRA", value: 2000 }, { name: "Car (resale value)", value: 6000 }],
    blank: { name: "", value: 0 }, onChange: (rows) => { assets = rows; calc(); },
  });
  listEditor({
    host: $("nw-debts"), addBtn: $("nw-add-debt"), storeKey: "fg-tool-networth-debts", fields: fields("Debt"),
    defaults: [{ name: "Student loan", value: 12000 }, { name: "Credit card", value: 600 }, { name: "Car loan", value: 4500 }],
    blank: { name: "", value: 0 }, onChange: (rows) => { debts = rows; calc(); },
  });

  function calc() {
    const a = sum(assets), d = sum(debts), net = a - d;
    $("nw-a").textContent = money(a);
    $("nw-d").textContent = money(d);
    $("nw-total").textContent = money(net);
    $("nw-total").style.color = net >= 0 ? "" : "var(--bad)";
    const h = history(), prev = h.filter((s) => s.month !== new Date().toISOString().slice(0, 7)).pop();
    $("nw-change").textContent = prev ? `${net >= prev.net ? "▲" : "▼"} ${money(Math.abs(net - prev.net))} since ${monthLabel(prev.month)}` : "";
  }

  function drawHistory() {
    const h = history();
    $("nw-history").innerHTML = h.length
      ? `<table><thead><tr><th scope="col">Month</th><th scope="col">Assets</th><th scope="col">Debts</th><th scope="col">Net worth</th></tr></thead><tbody>${h.map((s) => `<tr><td>${monthLabel(s.month)}</td><td>${money(s.assets)}</td><td>${money(s.debts)}</td><td>${money(s.net)}</td></tr>`).join("")}</tbody></table>`
      : `<p class="small muted">No snapshots yet.</p>`;
    if (h.length < 2) {
      $("nw-chart").innerHTML = `<p class="small muted">${h.length ? "One snapshot saved. Save another next month to start your trend line." : "Save a snapshot each month to see your trend here."}</p>`;
      return;
    }
    Charts.line($("nw-chart"), {
      x: h.map((s) => s.month), xFormat: monthLabel, yFormat: (v) => FG.compact(v), minZero: false, label: "Net worth by month",
      series: [{ name: "Net worth", color: "--series-1", values: h.map((s) => s.net) }],
    });
  }

  $("nw-snap").addEventListener("click", () => {
    const month = new Date().toISOString().slice(0, 7), a = sum(assets), d = sum(debts);
    const h = history().filter((s) => s.month !== month);
    h.push({ month, assets: a, debts: d, net: a - d });
    h.sort((x, y) => x.month.localeCompare(y.month));
    store.set(HISTORY_KEY, h);
    FG.toast(`Saved your ${monthLabel(month)} snapshot.`);
    drawHistory(); calc();
  });
  document.addEventListener("tabshow", (e) => { if (e.detail === "networth") drawHistory(); });
  addEventListener("resize", () => { if (!$("panel-networth").hidden) drawHistory(); });
  drawHistory();
})();
