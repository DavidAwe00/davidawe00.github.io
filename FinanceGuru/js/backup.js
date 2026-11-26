// Progress backup (My progress page): download everything MoneyExplained saved in this browser
// (localStorage keys starting with "fg-") as a JSON file, and restore it on another device.
// Until class codes or accounts exist, this is how progress moves between devices.
(function () {
  const exportBtn = document.getElementById("backup-export"), importInput = document.getElementById("backup-import");
  if (!exportBtn || !importInput) return;
  const status = document.getElementById("backup-status");
  document.getElementById("backup-pick").addEventListener("click", () => importInput.click());
  const APP = "moneyexplained", LEGACY_APPS = ["financeguru"], VERSION = 1, MAX_BYTES = 2_000_000, MAX_KEYS = 500;

  function savedKeys() {
    try { return Object.keys(localStorage).filter((k) => k.startsWith("fg-")); } catch { return []; }
  }

  exportBtn.addEventListener("click", () => {
    const data = {};
    try { savedKeys().forEach((k) => (data[k] = localStorage.getItem(k))); } catch {
      status.textContent = "This browser is blocking site storage, so there's nothing to back up.";
      return;
    }
    const file = new Blob([JSON.stringify({ app: APP, version: VERSION, exported: new Date().toISOString(), data }, null, 1)], { type: "application/json" });
    try { localStorage.setItem("fg-last-backup", new Date().toISOString()); } catch { /* storage blocked */ } // lets lessons stop suggesting a backup
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = `moneyexplained-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    status.textContent = `Downloaded a backup of ${Object.keys(data).length} saved item${Object.keys(data).length === 1 ? "" : "s"}. Open this page on your other device and choose "Restore from a file".`;
  });

  importInput.addEventListener("change", async () => {
    const file = importInput.files[0];
    importInput.value = "";
    if (!file) return;
    try {
      if (file.size > MAX_BYTES) throw new Error("That file is too large to be a MoneyExplained backup.");
      let parsed;
      try { parsed = JSON.parse(await file.text()); } catch { throw new Error("That file isn't a MoneyExplained backup."); }
      if (!parsed || (parsed.app !== APP && !LEGACY_APPS.includes(parsed.app)) || typeof parsed.data !== "object" || Array.isArray(parsed.data)) throw new Error("That file isn't a MoneyExplained backup.");
      const entries = Object.entries(parsed.data).filter(([k, v]) => /^fg-[a-z0-9-]{1,80}$/.test(k) && typeof v === "string");
      if (!entries.length || entries.length > MAX_KEYS) throw new Error("That backup doesn't contain any progress.");
      if (!confirm(`Restore ${entries.length} saved items from ${parsed.exported ? new Date(parsed.exported).toLocaleDateString() : "this backup"}? This replaces the progress saved in this browser.`)) return;
      savedKeys().forEach((k) => localStorage.removeItem(k));
      entries.forEach(([k, v]) => localStorage.setItem(k, v));
      status.textContent = "Progress restored. Reloading…";
      setTimeout(() => location.reload(), 600);
    } catch (e) {
      status.textContent = e.message || "Couldn't restore that file.";
    }
  });
})();
