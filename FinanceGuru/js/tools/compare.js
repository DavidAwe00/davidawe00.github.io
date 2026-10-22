// Offer Comparer: enter 2–4 real offers you found (any bank or card) and see the yearly cost or
// earnings for YOUR habits, ranked. Three modes: credit cards, savings, checking. Offers persist in
// this browser; the Account Matchmaker (js/tools/match.js) opens it in the matching mode.
const OfferCompare = (() => {
  const { $, num, money, esc, store, listEditor } = ToolKit;

  // Yearly cost of a card: annual fee + interest on any balance you carry − rewards on spending.
  const cardCost = (o, u) => o.fee + (u.payfull ? 0 : u.carry * (o.apr / 100)) - u.spend * 12 * (o.rewards / 100);

  // Net savings earnings over 12 months: monthly compounding of the APY, a monthly fee charged while
  // the balance is under the waiver amount, and a deposit at the end of each month.
  function savingsNet(o, u) {
    const m = Math.pow(1 + o.apy / 100, 1 / 12) - 1;
    let bal = u.balance, interest = 0, fees = 0;
    for (let i = 0; i < 12; i++) {
      const earned = bal * m;
      interest += earned;
      bal += earned;
      if (o.fee && bal < o.waive) { fees += o.fee; bal -= o.fee; }
      bal += u.deposit;
    }
    return { interest, fees, net: interest - fees };
  }

  // Yearly cost of checking: monthly fee (unless waived by direct deposit you have) + overdrafts + ATM fees.
  const checkingCost = (o, u) => (o.ddwaive && u.dd ? 0 : o.fee * 12) + o.od * u.overdrafts + o.atm * u.atm * 12;

  const MODES = {
    card: {
      label: "💳 Credit cards", storeKey: "fg-tool-compare-card",
      fields: [
        { key: "name", label: "Offer", type: "text", width: "1.5fr" },
        { key: "apr", label: "APR %", type: "number" },
        { key: "fee", label: "Annual fee", type: "number", prefix: "$" },
        { key: "rewards", label: "Rewards %", type: "number" },
      ],
      defaults: [
        { name: "Example: student card", apr: 25.24, fee: 0, rewards: 1 },
        { name: "Example: secured card", apr: 27.99, fee: 0, rewards: 0 },
        { name: "Example: rewards card", apr: 23.99, fee: 95, rewards: 2 },
      ],
      blank: { name: "", apr: 0, fee: 0, rewards: 0 },
    },
    savings: {
      label: "🐷 Savings", storeKey: "fg-tool-compare-savings",
      fields: [
        { key: "name", label: "Offer", type: "text", width: "1.5fr" },
        { key: "apy", label: "APY %", type: "number" },
        { key: "fee", label: "Monthly fee", type: "number", prefix: "$" },
        { key: "waive", label: "Fee waived at", type: "number", prefix: "$" },
      ],
      defaults: [
        { name: "Example: online high-yield", apy: 4, fee: 0, waive: 0 },
        { name: "Example: big-bank savings", apy: 0.01, fee: 5, waive: 300 },
        { name: "Example: credit union", apy: 0.5, fee: 0, waive: 0 },
      ],
      blank: { name: "", apy: 0, fee: 0, waive: 0 },
    },
    checking: {
      label: "🏦 Checking", storeKey: "fg-tool-compare-checking",
      fields: [
        { key: "name", label: "Offer", type: "text", width: "1.5fr" },
        { key: "fee", label: "Monthly fee", type: "number", prefix: "$" },
        { key: "ddwaive", label: "Waived w/ direct deposit", type: "check", width: "1.1fr" },
        { key: "od", label: "Overdraft fee", type: "number", prefix: "$" },
        { key: "atm", label: "Out-of-network ATM", type: "number", prefix: "$" },
      ],
      defaults: [
        { name: "Example: online checking", fee: 0, ddwaive: false, od: 0, atm: 0 },
        { name: "Example: big-bank checking", fee: 12, ddwaive: true, od: 35, atm: 3.5 },
        { name: "Example: credit union", fee: 0, ddwaive: false, od: 25, atm: 2 },
      ],
      blank: { name: "", fee: 0, ddwaive: false, od: 0, atm: 0 },
    },
  };

  const root = $("panel-compare");
  if (!root) return { cardCost, savingsNet, checkingCost };

  let mode = MODES[store.get("fg-tool-compare-mode", "card")] ? store.get("fg-tool-compare-mode", "card") : "card";
  const editors = {};
  for (const [k, m] of Object.entries(MODES)) {
    editors[k] = listEditor({ host: $(`cp-list-${k}`), addBtn: $(`cp-add-${k}`), storeKey: m.storeKey, fields: m.fields, defaults: m.defaults, blank: m.blank, onChange: () => k === mode && editors[k] && calc() });
  }

  function usage() {
    if (mode === "card") return { spend: num("cp-spend"), payfull: $("cp-payfull").value === "yes", carry: num("cp-carry") };
    if (mode === "savings") return { balance: num("cp-balance"), deposit: num("cp-deposit") };
    return { dd: $("cp-dd").value === "yes", overdrafts: num("cp-od"), atm: num("cp-atm") };
  }

  function calc() {
    const u = usage(), rows = editors[mode].rows().filter((o) => o.name || Object.values(o).some((v) => v));
    $("cp-carry-field").hidden = mode !== "card" || u.payfull;
    if (!rows.length) { $("cp-result").innerHTML = `<p class="muted">Add at least one offer to compare.</p>`; $("cp-insight").textContent = ""; return; }
    const name = (o, i) => esc(o.name || `Offer ${i + 1}`);
    let scored, head, cells, verdict;
    if (mode === "card") {
      scored = rows.map((o, i) => ({ o, i, v: cardCost(o, u) })).sort((a, b) => a.v - b.v);
      head = ["Offer", "Yearly cost", "Annual fee", "Interest", "Rewards"];
      cells = ({ o, v }) => [`<strong>${v <= 0 ? `${money(-v)} back` : money(v)}</strong>`, money(o.fee), money(u.payfull ? 0 : u.carry * o.apr / 100), money(-u.spend * 12 * o.rewards / 100)];
      const best = scored[0], worst = scored[scored.length - 1];
      verdict = `<strong>${name(best.o, best.i)}</strong> is the best fit for how you'd use it${scored.length > 1 ? `, about ${money(worst.v - best.v)} a year better than ${name(worst.o, worst.i)}` : ""}.` +
        (u.payfull ? " Because you pay in full, APR doesn't matter to you, so the fee and rewards decide it." : ` Carrying ${money(u.carry)} costs ${money(u.carry * best.o.apr / 100)} a year in interest on this card, which outweighs most rewards. Paying in full is the biggest win.`);
    } else if (mode === "savings") {
      scored = rows.map((o, i) => ({ o, i, r: savingsNet(o, u) })).map((x) => ({ ...x, v: -x.r.net })).sort((a, b) => a.v - b.v);
      head = ["Offer", "Net in 1 year", "Interest", "Fees"];
      cells = ({ r }) => [`<strong>${money(r.net)}</strong>`, money(r.interest), money(-r.fees)];
      const best = scored[0], worst = scored[scored.length - 1];
      verdict = `<strong>${name(best.o, best.i)}</strong> earns you the most: about ${money(best.r.net)} in a year${scored.length > 1 ? `, ${money(best.r.net - worst.r.net)} more than ${name(worst.o, worst.i)}` : ""}. A higher APY only matters if fees don't eat it.`;
    } else {
      scored = rows.map((o, i) => ({ o, i, v: checkingCost(o, u) })).sort((a, b) => a.v - b.v);
      head = ["Offer", "Yearly cost", "Monthly fees", "Overdrafts", "ATM fees"];
      cells = ({ o, v }) => [`<strong>${money(v)}</strong>`, money(o.ddwaive && u.dd ? 0 : o.fee * 12), money(o.od * u.overdrafts), money(o.atm * u.atm * 12)];
      const best = scored[0], worst = scored[scored.length - 1];
      verdict = `<strong>${name(best.o, best.i)}</strong> costs the least for your habits: ${money(best.v)} a year${scored.length > 1 ? `, versus ${money(worst.v)} for ${name(worst.o, worst.i)}` : ""}.` + (u.overdrafts ? " Turning off overdraft coverage for debit and ATM purchases means a declined card instead of a fee." : "");
    }
    $("cp-result").innerHTML = `<div class="table-scroll" style="max-height:none"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${scored.map((s, rank) =>
      `<tr${rank === 0 ? ' class="cp-best"' : ""}><td>${rank === 0 ? "🏆 " : ""}${name(s.o, s.i)}</td>${cells(s).map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    $("cp-insight").innerHTML = verdict;
  }

  function setMode(m) {
    if (!MODES[m]) return;
    mode = m;
    store.set("fg-tool-compare-mode", m);
    root.querySelectorAll("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.mode === m));
    root.querySelectorAll("[data-mode-panel]").forEach((p) => (p.hidden = !p.dataset.modePanel.split(" ").includes(m)));
    calc();
  }

  root.addEventListener("click", (e) => { const b = e.target.closest("[data-mode]"); if (b) setMode(b.dataset.mode); });
  root.addEventListener("input", (e) => { if (e.target.closest(".cp-usage")) calc(); });
  root.addEventListener("change", (e) => { if (e.target.closest(".cp-usage")) calc(); });
  $("cp-reset").addEventListener("click", () => editors[mode].reset());
  document.addEventListener("comparemode", (e) => setMode(e.detail));
  setMode(mode);
  return { cardCost, savingsNet, checkingCost };
})();
