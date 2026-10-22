// Account Matchmaker: six questions -> the account TYPE that fits for checking, savings, and a first
// credit card, with what to look for and red flags. No brands or affiliate links, so nothing here is
// an endorsement. Each result hands off to the Offer Comparer (js/tools/compare.js). Answers persist
// in this browser. Rates/fees come from the Banking Basics lesson (FDIC, Bankrate).
const AccountMatch = (() => {
  const { $, store } = ToolKit;
  const root = $("mm-root");
  const KEY = "fg-tool-match";
  const Q = [
    { id: "need", q: "What are you looking for?", opts: [["all", "All three"], ["checking", "Checking"], ["savings", "Savings"], ["card", "First credit card"]] },
    { id: "age", q: "How old are you?", opts: [["minor", "Under 18"], ["young", "18–20"], ["adult", "21 or older"]] },
    { id: "income", q: "Do you have income of your own?", opts: [["none", "Not yet"], ["part", "Part-time or gig"], ["full", "Full-time"]] },
    { id: "credit", q: "What's your credit history like?", opts: [["none", "None yet"], ["thin", "Under a year"], ["good", "A year or more, on time"], ["rough", "Late payments or collections"]] },
    { id: "payfull", q: "Would you pay a card off in full every month?", opts: [["yes", "Yes, every time"], ["unsure", "Probably not always"]] },
    { id: "bank", q: "Has a bank ever closed your account over unpaid overdrafts?", opts: [["no", "No"], ["yes", "Yes"]] },
  ];
  const DEFAULTS = { need: "all", age: "young", income: "part", credit: "none", payfull: "yes", bank: "no" };

  // Each recommendation: { mode, title, why, also?, look[], flags[] }.
  function checking(a) {
    if (a.age === "minor") return { mode: "checking", title: "Teen checking, opened with a parent", why: "Under 18, you'll usually need a parent or guardian as a joint owner. Many banks and credit unions offer teen accounts with no monthly fee and a debit card.", look: lookChecking, flags: flagsChecking };
    if (a.bank === "yes") return { mode: "checking", title: "Second-chance checking", why: "Banks check reports like ChexSystems, where unpaid overdrafts can stay for up to five years. Second-chance accounts (often at credit unions) let you rebuild. Pay off the old balance if you can, then ask about moving to a regular account after 6–12 months of good use.", also: "Some second-chance accounts have a monthly fee; compare it with the options below.", look: lookChecking, flags: flagsChecking };
    return { mode: "checking", title: a.income === "none" ? "Free checking (student or online)" : "Free checking with a big fee-free ATM network", why: "Your everyday account should cost $0. Many online banks, credit unions, and student accounts have no monthly fee and no minimum balance.", also: "Prefer a branch nearby? A local credit union often has low fees and shares ATMs nationwide.", look: lookChecking, flags: flagsChecking };
  }
  const lookChecking = ["$0 monthly fee, or one you can easily waive (like direct deposit)", "No minimum balance", "Overdraft fees of $0, or the option to have purchases declined instead", "Fee-free ATMs where you actually are", "FDIC (bank) or NCUA (credit union) insured"];
  const flagsChecking = ["A monthly fee you can't avoid", "\"Overdraft protection\" you're pushed to opt in to (the 2025 average overdraft fee was $26.77)", "Prepaid cards sold as bank accounts with load or reload fees"];

  function savings(a) {
    return { mode: "savings", title: a.age === "minor" ? "High-yield savings, opened with a parent" : "High-yield savings account", why: `In September 2026 the average savings account paid 0.37% a year, while top online high-yield accounts paid around 4%. On $1,000 that's about $4 versus $40 a year for doing nothing different.${a.age === "minor" ? " Under 18 you'll usually need a parent or guardian on the account." : ""}`, also: "Keep it at a different bank from your checking if that helps you not spend it, but make sure transfers take only a day or two.", look: ["A high APY that isn't a short promo rate", "$0 monthly fee and no minimum to earn the rate", "FDIC or NCUA insured (up to $250,000)", "Easy transfers to your checking"], flags: ["Teaser rates that drop after a few months", "Rates only on balances above a high minimum", "Fees that wipe out the interest on a small balance"] };
  }

  function card(a) {
    const base = { mode: "card", look: ["$0 annual fee", "Reports to all three credit bureaus (Equifax, Experian, TransUnion)", "A path to upgrade or get a secured deposit back", "The lowest APR you can find if you might carry a balance"], flags: ["Annual, monthly, or \"program\" fees on a starter card", "Store cards with 30%+ APRs pushed at checkout", "Deferred-interest promos: miss the deadline and all the interest comes back"] };
    if (a.age === "minor") return { ...base, title: "Authorized user on a parent's card", why: "Under 18 you can't get your own card, but a parent can add you as an authorized user. If they always pay on time, many scoring models count that history for you. You don't need to use the card at all to benefit." };
    if (a.age === "young" && a.income === "none") return { ...base, title: "Wait, or become an authorized user", why: "Under 21, federal law (the CARD Act) requires your own income or a co-signer to get a card. Until you have income, being an authorized user on a parent's card builds history safely." };
    if (a.payfull === "unsure" && a.credit !== "rough") return { ...base, title: "Hold off, or a low-APR secured card used for one small bill", why: "Card interest averaged over 22% in 2026, so carrying a balance erases any rewards. If you want to build credit anyway, put one small bill on a secured card with autopay set to the full balance.", also: "A credit-builder loan from a credit union builds history without the temptation to overspend." };
    if (a.credit === "rough") return { ...base, title: "Secured credit card", why: "You put down a deposit (commonly a few hundred dollars) that usually becomes your limit. On-time payments rebuild your score, and many issuers review you for an upgrade and refund after 6–12 months.", also: "Pay any collections you can, and check your free reports at AnnualCreditReport.com for errors." };
    if (a.credit === "good") return { ...base, title: "No-annual-fee cash-back card", why: "With a year or more of on-time history, you can likely qualify for a regular card. Flat cash back with no annual fee is the simplest first choice; skip fancy rewards until you know your spending.", flags: [...base.flags, "Annual fees you won't earn back in rewards"] };
    return { ...base, title: "Student card or secured card", why: "With little or no history, a student card (if you're in school) or a secured card is the usual first step. Use it for one small bill, pay the full balance on autopay, and keep your balance well under 30% of the limit.", also: "Being an authorized user on a family member's card can add history at the same time." };
  }

  const answers = { ...DEFAULTS, ...store.get(KEY, {}) };

  function render() {
    const picks = answers.need === "all" ? [checking, savings, card] : [{ checking, savings, card }[answers.need]];
    const recs = picks.map((f) => f(answers));
    const label = { checking: "🏦 Checking", savings: "🐷 Savings", card: "💳 First credit card" };
    root.innerHTML = `
      <div class="card mm-quiz">${Q.map((q) => `
        <fieldset class="mm-q"><legend>${q.q}</legend><div class="chips">${q.opts.map(([v, t]) =>
          `<button type="button" class="chip" data-q="${q.id}" data-v="${v}" aria-pressed="${answers[q.id] === v}">${t}</button>`).join("")}</div></fieldset>`).join("")}
      </div>
      <div class="mm-results" aria-live="polite">${recs.map((r) => `
        <article class="card mm-rec">
          <div class="small muted">${label[r.mode]}</div>
          <h3>${r.title}</h3>
          <p>${r.why}</p>
          ${r.also ? `<p class="small muted">${r.also}</p>` : ""}
          <div class="mm-lists">
            <div><strong class="small">Look for</strong><ul class="small">${r.look.map((x) => `<li>${x}</li>`).join("")}</ul></div>
            <div><strong class="small">Red flags</strong><ul class="small">${r.flags.map((x) => `<li>${x}</li>`).join("")}</ul></div>
          </div>
          <a class="btn btn-ghost" href="#compare" data-compare="${r.mode}">Compare ${r.mode === "card" ? "card" : r.mode} offers you've found →</a>
        </article>`).join("")}
      </div>`;
  }

  if (root) {
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-q]");
      if (b) {
        answers[b.dataset.q] = b.dataset.v;
        store.set(KEY, answers);
        const focusKey = [b.dataset.q, b.dataset.v];
        render();
        root.querySelector(`[data-q="${focusKey[0]}"][data-v="${focusKey[1]}"]`).focus();
        return;
      }
      const c = e.target.closest("[data-compare]");
      if (c) {
        store.set("fg-tool-compare-mode", c.dataset.compare);
        document.dispatchEvent(new CustomEvent("comparemode", { detail: c.dataset.compare }));
      }
    });
    render();
  }
  return { checking, savings, card, DEFAULTS };
})();
