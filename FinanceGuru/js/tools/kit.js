// Shared helpers for the Tools page calculators in js/tools/: inputs, money formatting, safe local
// storage, and a small editable list used by Savings Goals, Subscription Audit, and Net Worth.
const ToolKit = (() => {
  const $ = (id) => document.getElementById(id);
  const num = (id) => Math.max(0, parseFloat($(id).value) || 0);
  const money = (v) => (v < 0 ? "−" : "") + FG.money(Math.abs(Math.round(v)));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // Local storage that never throws (private windows, blocked storage); data stays in this browser.
  const store = {
    get(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } },
  };

  // Editable rows. fields: [{ key, label, type: "text"|"number"|"date"|"select"|"check", options?, prefix?, width? }].
  // Calls onChange(rows) after every edit; rows persist under storeKey.
  function listEditor({ host, addBtn, storeKey, fields, defaults, blank, onChange }) {
    let rows = store.get(storeKey, null) || defaults.map((r) => ({ ...r }));
    const cell = (f, r, i) => {
      const id = `${storeKey}-${f.key}-${i}`, v = r[f.key] ?? "";
      const label = `<label class="sr-only" for="${id}">${esc(f.label)} ${i + 1}</label>`;
      if (f.type === "select") return `${label}<select class="select" id="${id}" data-i="${i}" data-k="${f.key}">${f.options.map(([val, txt]) => `<option value="${val}"${val === v ? " selected" : ""}>${esc(txt)}</option>`).join("")}</select>`;
      if (f.type === "check") return `<label class="row-check"><input type="checkbox" id="${id}" data-i="${i}" data-k="${f.key}"${v ? " checked" : ""}> ${esc(f.label)}</label>`;
      const input = `<input id="${id}" data-i="${i}" data-k="${f.key}" type="${f.type}" value="${esc(v)}"${f.type === "number" ? ' min="0" step="any"' : ""}>`;
      return `${label}${f.prefix ? `<div class="input-wrap"><span>${f.prefix}</span>${input}</div>` : `<div class="input-wrap">${input}</div>`}`;
    };
    const cols = `--cols:${fields.map((f) => f.width || "1fr").join(" ")} 38px`;
    function render() {
      host.innerHTML = rows.length
        ? `<div class="list-head" aria-hidden="true" style="${cols}">${fields.map((f) => `<span>${f.type === "check" ? "" : esc(f.label)}</span>`).join("")}<span></span></div>` +
          rows.map((r, i) => `<div class="list-row" style="${cols}">${fields.map((f) => `<div data-label="${f.type === "check" ? "" : esc(f.label)}">${cell(f, r, i)}</div>`).join("")}<button type="button" class="icon-btn" data-del="${i}" aria-label="Remove row ${i + 1}">✕</button></div>`).join("")
        : `<p class="small muted">Nothing here yet. Add one below.</p>`;
      changed();
    }
    function changed() { store.set(storeKey, rows); onChange(rows); }
    host.addEventListener("input", (e) => {
      const el = e.target, i = el.dataset.i, k = el.dataset.k;
      if (i === undefined) return;
      const f = fields.find((x) => x.key === k);
      rows[i][k] = f.type === "number" ? Math.max(0, parseFloat(el.value) || 0) : f.type === "check" ? el.checked : el.value;
      changed();
    });
    host.addEventListener("click", (e) => {
      const d = e.target.closest("[data-del]");
      if (d) { rows.splice(+d.dataset.del, 1); render(); }
    });
    addBtn.addEventListener("click", () => {
      rows.push({ ...blank });
      render();
      const inputs = host.querySelectorAll(".list-row:last-child input, .list-row:last-child select");
      if (inputs[0]) inputs[0].focus();
    });
    render();
    return { rows: () => rows, reset() { rows = defaults.map((r) => ({ ...r })); render(); } };
  }

  return { $, num, money, esc, store, listEditor };
})();
