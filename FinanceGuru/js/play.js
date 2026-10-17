// Game hub: picks a game from the cards or the URL hash (#catcher, #sorter, #life, #market).
(function () {
  const names = ["catcher", "sorter", "life", "market", "salary", "prices", "credit", "envelope"];
  const fmt = { catcher: (v) => FG.money(v), sorter: (v) => v + " pts", life: (v) => FG.money(v) + " net worth", market: (v) => FG.money(v), salary: (v) => v + " in a row", prices: (v) => v + "/8 correct", credit: (v) => "score " + v, envelope: (v) => v + " pts" };
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
    Games[name].show();
    if (scroll) FG.scrollTo(document.getElementById("game-" + name));
  }

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
