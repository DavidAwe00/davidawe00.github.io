// My progress: join a class with a teacher's code, see the membership, or leave. A shared link
// (badges.html?join=ABC234) fills in the code. Hidden when the class service isn't available.
(function () {
  const $ = (id) => document.getElementById(id);
  const section = $("class-join");
  if (!section) return;
  const fromLink = new URLSearchParams(location.search).get("join");

  function render() {
    const m = ClassSync.load();
    $("class-member").hidden = !m;
    $("class-form").hidden = Boolean(m);
    if (m) {
      $("class-name").textContent = m.className;
      $("class-nick").textContent = m.nickname;
      $("class-synced").textContent = m.syncedAt ? `Last shared ${new Date(m.syncedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.` : "Sharing your progress now…";
    }
    // Assigned lessons in course order, with the ones already finished checked off.
    const ids = m ? UNITS.flatMap((u) => u.lessons).filter((id) => ClassSync.assigned().includes(id)) : [];
    const done = FG.getProgress().done;
    $("class-assigned").hidden = !ids.length;
    $("class-assigned-list").innerHTML = ids.map((id) => {
      const l = LESSONS.find((x) => x.id === id);
      return `<li class="${done[id] ? "done" : ""}"><span aria-hidden="true">${done[id] ? "✅" : "⬜"}</span>
        <a href="learn.html#${id}">${l.icon} ${l.title}</a><span class="sr-only">${done[id] ? " (done)" : " (not done yet)"}</span></li>`;
    }).join("");
  }

  async function show() {
    if (!ClassSync.load() && !(await ClassSync.isAvailable())) return;  // stays hidden
    section.hidden = false;
    if (fromLink && !ClassSync.load()) {
      $("class-code").value = fromLink.toUpperCase().slice(0, 7);
      section.scrollIntoView({ block: "start" });
      $("class-nickname").focus({ preventScroll: true });
    }
    render();
  }

  $("class-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = e.submitter || $("class-form").querySelector("[type=submit]");
    $("class-error").textContent = "";
    const code = $("class-code").value.trim(), nickname = $("class-nickname").value.trim();
    if (!code || !nickname) { $("class-error").textContent = "Enter the class code and a nickname."; return; }
    button.disabled = true;
    try {
      await ClassSync.join(code, nickname);
      FG.toast("You joined the class 🏫");
      if (fromLink) history.replaceState(null, "", location.pathname);
      render();
      $("class-leave").focus();
    } catch (err) {
      $("class-error").textContent = err.message;
    } finally { button.disabled = false; }
  });

  $("class-leave").addEventListener("click", async () => {
    if (!confirm("Leave this class? Your teacher will no longer see your progress. Your progress stays on this device.")) return;
    try { await ClassSync.leave(); render(); $("class-code").focus(); }
    catch (err) { FG.toast(err.message); }
  });

  document.addEventListener("classchange", render);
  show();
})();
