// Savings Goals: monthly deposit needed for each goal by its date, with monthly compounding at the
// chosen APY, compared with 0% to show what interest contributes. Goals persist in this browser.
(function () {
  const { $, num, money, esc, listEditor } = ToolKit;
  if (!$("panel-goals")) return;

  const monthsUntil = (date) => {
    const d = new Date(date + "T00:00:00"), now = new Date();
    if (isNaN(d)) return 0;
    return Math.max(0, (d.getFullYear() - now.getFullYear()) * 12 + d.getMonth() - now.getMonth());
  };
  // Deposit per month so that saved·(1+r)^n + p·((1+r)^n − 1)/r reaches target.
  const perMonth = (target, saved, n, r) => {
    if (n <= 0) return Math.max(0, target - saved);
    const g = Math.pow(1 + r, n), need = target - saved * g;
    if (need <= 0) return 0;
    return r ? need * r / (g - 1) : need / n;
  };
  const inMonths = (n) => {
    const d = new Date(); d.setMonth(d.getMonth() + n);
    return d.toISOString().slice(0, 10);
  };

  const editor = listEditor({
    host: $("sg-list"), addBtn: $("sg-add"), storeKey: "fg-tool-goals",
    fields: [
      { key: "name", label: "Goal", type: "text", width: "1.6fr" },
      { key: "target", label: "Target", type: "number", prefix: "$" },
      { key: "saved", label: "Saved so far", type: "number", prefix: "$" },
      { key: "date", label: "By", type: "date", width: "1.2fr" },
    ],
    defaults: [
      { name: "Emergency fund", target: 3000, saved: 500, date: inMonths(12) },
      { name: "Move-out fund", target: 2500, saved: 0, date: inMonths(18) },
      { name: "New laptop", target: 900, saved: 150, date: inMonths(6) },
    ],
    blank: { name: "", target: 0, saved: 0, date: inMonths(12) },
    onChange: calc,
  });

  function calc(rows = editor ? editor.rows() : []) {
    const r = num("sg-apy") / 100 / 12;
    let total = 0, flat = 0, left = 0;
    const lines = rows.map((g) => {
      const n = monthsUntil(g.date), p = perMonth(g.target, g.saved, n, r), p0 = perMonth(g.target, g.saved, n, 0);
      total += p; flat += p0; left += Math.max(0, g.target - g.saved);
      const pct = g.target ? Math.min(100, (g.saved / g.target) * 100) : 0;
      return `<tr><td>${esc(g.name || "Untitled goal")}<div class="goal-bar"><i style="width:${pct}%"></i></div></td><td>${n ? `${n} mo` : "Due now"}</td><td>${money(p)}</td></tr>`;
    });
    $("sg-total").textContent = money(total);
    $("sg-left").textContent = money(left);
    $("sg-interest").textContent = `${money((flat - total))}/mo`;
    $("sg-table").innerHTML = rows.length ? `<thead><tr><th scope="col">Goal</th><th scope="col">Time left</th><th scope="col">Per month</th></tr></thead><tbody>${lines.join("")}</tbody>` : "";
  }

  $("sg-apy").addEventListener("input", () => calc());
})();
