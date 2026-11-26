// Account page (account.html): sign in, or create an account (18+ or 13-17; under-13s are pointed to class codes,
// which need no account), then sync learning progress, sign out, or delete the account. The sync itself is in
// js/site.js (FG.account), which every page runs while someone is signed in.
(function () {
  const $ = (id) => document.getElementById(id);
  const SECTIONS = ["unavailable", "signed-out", "signed-in"];
  const show = (id) => SECTIONS.forEach((s) => ($(s).hidden = s !== id));
  const notice = (text) => { $("notice").textContent = text; };
  const message = (text) => { $("auth-message").textContent = text; };
  const A = FG.account;
  let features = {};

  const age = () => document.querySelector("[name=age]:checked")?.value || "";
  function ageNote() {
    const note = $("age-note"), a = age();
    note.hidden = !a || a === "adult";
    $("signup").disabled = a === "child";
    $("consent-row").hidden = a === "child";
    if (a === "child") note.textContent = "You need to be 13 or older to make an account. You don't need one: every lesson, game, and tool works without it, and if your teacher gives you a class code, joining with it on My progress saves your scores for them.";
    if (a === "teen") note.textContent = features.studentAccounts === false
      ? "Student accounts aren't available on this site yet. You can still use every lesson without one."
      : "Great! Your account saves your learning progress. Check with a parent or guardian before you sign up. Teacher tools and AI coaching are for adult accounts.";
  }
  document.querySelectorAll("[name=age]").forEach((r) => r.addEventListener("change", ageNote));

  async function signedIn(text) {
    const me = await A.api("/me");
    A.remember(me);
    $("account-email").textContent = me.email;
    $("account-kind").textContent = me.ageGroup === "teen" ? " (student account)" : "";
    $("teacher-link").hidden = me.ageGroup === "teen" || features.classes !== true;
    show("signed-in");
    notice(text || "");
    await sync();
  }
  async function sync() {
    $("sync-status").textContent = "Syncing your progress…";
    const r = await A.sync();
    const lessons = Object.keys(FG.getProgress().done || {}).length;
    $("sync-status").textContent = r.synced
      ? `Your progress is saved to your account (${lessons} lesson${lessons === 1 ? "" : "s"} done, ${FG.getProgress().xp} XP).${r.changed ? " Progress from your other devices was added here." : ""}`
      : r.error || "Couldn't sync right now. Your progress is still saved in this browser.";
  }

  async function authenticate(signup, button) {
    if (!$("auth-form").reportValidity()) return;
    if (signup) {
      if (!age()) { message("Choose your age to create an account."); $("age-group").querySelector("input").focus(); return; }
      if (age() === "child") { ageNote(); return; }
      if (!$("consent").checked) { message("Agree to the privacy terms to create an account."); $("consent").focus(); return; }
    }
    button.disabled = true;
    try {
      const r = await A.api(`/auth/${signup ? "signup" : "login"}`, "POST", { email: $("auth-email").value, password: $("auth-password").value, ...(signup ? { age: age(), consent: true } : {}) }, false);
      $("auth-password").value = "";
      if (!r.authenticated) { message(`${r.message} This page stays open, so you can sign in here once you've confirmed.`); return; }
      message("");
      await signedIn(signup ? "Your account is ready." : "Signed in.");
    } catch (err) { message(err.message); } finally { button.disabled = age() === "child" && button.id === "signup"; }
  }
  $("auth-form").addEventListener("submit", (e) => { e.preventDefault(); authenticate(false, $("signin-submit")); });
  $("signup").addEventListener("click", (e) => { $("auth-password").autocomplete = "new-password"; authenticate(true, e.currentTarget); });

  $("sync-now").addEventListener("click", async (e) => {
    const button = e.currentTarget;
    button.disabled = true;
    try { await sync(); } finally { button.disabled = false; }
  });
  $("logout").addEventListener("click", async (e) => {
    const button = e.currentTarget;
    button.disabled = true;
    try {
      await A.push();
      await A.api("/auth/logout", "POST", {}, false).catch(() => {});
      if ($("forget-device").checked) {
        try { Object.keys(localStorage).filter((k) => A.SYNC_KEY.test(k)).forEach((k) => localStorage.removeItem(k)); } catch { /* storage blocked */ }
      }
      A.remember(null);
      show("signed-out");
      notice($("forget-device").checked ? "Signed out, and your progress was removed from this browser." : "Signed out. Your progress is still saved in this browser and in your account.");
      $("forget-device").checked = false;
    } finally { button.disabled = false; }
  });
  $("delete-account").addEventListener("click", async (e) => {
    if (!confirm("Delete your MoneyExplained account and everything saved to it? This can't be undone.")) return;
    const button = e.currentTarget;
    button.disabled = true;
    try {
      await A.api("/account", "DELETE", { confirm: "delete" });
      A.remember(null);
      show("signed-out");
      notice("Your account was deleted. Progress saved in this browser is still here until you clear it.");
    } catch (err) { notice(err.message); } finally { button.disabled = false; }
  });

  (async () => {
    features = await FG.features();
    if (features.accounts !== true) { show("unavailable"); notice(""); return; }
    try { await signedIn(); }
    catch (err) {
      if (err.status !== 401) { notice(err.message); }
      else notice("");
      A.remember(null);
      show("signed-out");
    }
  })();
})();
