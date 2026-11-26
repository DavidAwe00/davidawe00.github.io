// Game hub: picks a game from the cards or the URL hash (#catcher, #sorter, #life, #market).
(function () {
  const names = ["catcher", "sorter", "life", "market", "salary", "prices", "credit", "envelope", "scam", "fees", "plans", "betting"];
  const t = I18N.t;
  const fmt = { catcher: (v) => FG.money(v), sorter: (v) => t("{n} pts", { n: v }), life: (v) => t("{amount} net worth", { amount: FG.money(v) }), market: (v) => FG.money(v),
    salary: (v) => t("{n} correct", { n: v }), prices: (v) => (v > 8 ? t("{n}/800 pts", { n: v }) : t("{n}/8 correct", { n: v })), credit: (v) => t("score {n}", { n: v }),
    envelope: (v) => t("{n} pts", { n: v }), scam: (v) => t("{n}/10 correct", { n: v }), fees: (v) => t("{n} pts", { n: v }), plans: (v) => t("{n}/5 cheaper picks", { n: v }),
    betting: (v) => t("kept {amount}", { amount: FG.money(v) }) };
  let current = null;

  Games.refreshBest = () => {
    document.querySelectorAll("[data-best]").forEach((el) => {
      const b = FG.getBest(el.dataset.best);
      el.textContent = b ? t("🏆 Best: {score}", { score: fmt[el.dataset.best](b) }) : t("Not played yet");
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
  const fillPicker = () => {
    const v = picker.value;
    picker.innerHTML = names.map((n) => {
      const card = document.querySelector(`[data-game="${n}"]`);
      const title = card.querySelector("h3").firstChild.textContent.trim();
      return `<option value="${n}">${card.querySelector(".card-icon").textContent} ${title}</option>`;
    }).join("");
    if (v) picker.value = v;
  };
  fillPicker();
  // The cards are translated after this runs, so rebuild the phone dropdown and best scores in the new language.
  document.addEventListener("langchange", () => { fillPicker(); Games.refreshBest(); });
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
