// Subscription Audit: yearly total of recurring charges, savings from the ones marked to cut, and what
// that yearly saving would grow to if invested monthly for 10 years at 7%. Persists in this browser.
(function () {
  const { $, money, listEditor } = ToolKit;
  if (!$("panel-subs")) return;
  const YEARS = 10, RATE = 0.07;
  const yearly = (s) => (s.every === "year" ? s.price : s.every === "week" ? s.price * 52 : s.price * 12);

  listEditor({
    host: $("sb-list"), addBtn: $("sb-add"), storeKey: "fg-tool-subs",
    fields: [
      { key: "name", label: "Subscription", type: "text", width: "1.6fr" },
      { key: "price", label: "Price", type: "number", prefix: "$" },
      { key: "every", label: "Billed", type: "select", options: [["month", "Monthly"], ["year", "Yearly"], ["week", "Weekly"]] },
      { key: "cut", label: "Cut", type: "check", width: "0.6fr" },
    ],
    defaults: [
      { name: "Music streaming", price: 11.99, every: "month", cut: false },
      { name: "Video streaming", price: 17.99, every: "month", cut: false },
      { name: "Second video streaming", price: 9.99, every: "month", cut: true },
      { name: "Cloud storage", price: 2.99, every: "month", cut: false },
      { name: "Gym you don't use", price: 34.99, every: "month", cut: true },
      { name: "Game pass", price: 79.99, every: "year", cut: false },
    ],
    blank: { name: "", price: 0, every: "month", cut: false },
    onChange: calc,
  });

  function calc(rows) {
    const total = rows.reduce((t, s) => t + yearly(s), 0);
    const cut = rows.filter((s) => s.cut).reduce((t, s) => t + yearly(s), 0);
    const r = RATE / 12, n = YEARS * 12;
    const grow = (cut / 12) * ((Math.pow(1 + r, n) - 1) / r);
    $("sb-year").textContent = money(total);
    $("sb-month").textContent = `${money(total / 12)} a month`;
    $("sb-cut").textContent = money(cut);
    $("sb-grow").textContent = money(grow);
    const biggest = [...rows].sort((a, b) => yearly(b) - yearly(a))[0];
    $("sb-insight").innerHTML = !rows.length ? "Add your subscriptions to see the total." :
      `${rows.length} subscription${rows.length > 1 ? "s" : ""} cost <strong>${money(total)}</strong> a year. ${cut ? `Cutting the checked ones frees up ${money(cut / 12)} a month; invested, that could grow to about <strong>${money(grow)}</strong> in ${YEARS} years.` : "Check any you could live without to see what cutting them is worth."} ${biggest && yearly(biggest) ? `Your biggest is ${biggest.name || "an unnamed one"} at ${money(yearly(biggest))} a year.` : ""} Tip: many services let you pause instead of cancel, or rotate one at a time.`;
  }
})();
