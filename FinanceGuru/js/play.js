// Game hub: picks a game from the cards or the URL hash (#catcher, #sorter, #life, #market).
(function () {
  const names = ["catcher", "sorter", "life", "market", "salary", "prices", "credit", "envelope", "scam", "fees", "plans", "betting"];
  const fmt = { catcher: (v) => FG.money(v), sorter: (v) => v + " pts", life: (v) => FG.money(v) + " net worth", market: (v) => FG.money(v), salary: (v) => v + " in a row", prices: (v) => v + "/8 correct", credit: (v) => "score " + v, envelope: (v) => v + " pts", scam: (v) => v + "/10 correct", fees: (v) => v + " pts", plans: (v) => v + "/5 cheaper picks", betting: (v) => "kept " + FG.money(v) };
  let current = null;

  Games.refreshBest = () => {
    document.querySelectorAll("[data-best]").forEach((el) => {
      const b = FG.getBest(el.dataset.best);
      el.textContent = b ? "🏆 Best: " + fmt[el.dataset.best](b) : "Not played yet";
    });
  };

  function open(name, scroll) {
    if (!names.includes(name)) name = "catcher";
    if (current && current !== name) Games[current].hide();
    names.forEach((n) => {
      document.getElementById("game-" + n).hidden = n !== name;
      document.querySelector(`[data-game="${n}"]`).setAttribute("aria-current", n === name);
    });
    current = name;
    picker.value = name;
    Games[name].show();
    if (scroll) FG.scrollTo(document.getElementById("game-" + name));
  }

  // Phones get a dropdown (built from the cards) instead of a long wall of game cards.
  const picker = document.getElementById("game-picker");
  picker.innerHTML = names.map((n) => {
    const card = document.querySelector(`[data-game="${n}"]`);
    const title = card.querySelector("h3").firstChild.textContent.trim();
    return `<option value="${n}">${card.querySelector(".card-icon").textContent} ${title}</option>`;
  }).join("");
  picker.addEventListener("change", () => { history.replaceState(null, "", "#" + picker.value); open(picker.value, false); });

  document.querySelector(".game-hub").addEventListener("click", (e) => {
    const c = e.target.closest("[data-game]");
    if (!c) return;
    history.replaceState(null, "", "#" + c.dataset.game);
    open(c.dataset.game, true);
  });
  addEventListener("hashchange", () => open(location.hash.slice(1), true));

  Games.refreshBest();
  open(location.hash.slice(1), !!location.hash);
})();
