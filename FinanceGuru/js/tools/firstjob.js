// First Job Checklist: the steps around starting a job, grouped by when they happen, each linking to
// the lesson or tool that helps. Check-offs persist in this browser.
(function () {
  const { $, esc, store } = ToolKit;
  const root = $("fj-root");
  if (!root) return;
  const KEY = "fg-tool-firstjob";
  const STEPS = [
    { phase: "Before day one", items: [
      { id: "i9", title: "Bring ID for your I-9", text: "Employers must verify you can work in the U.S. Bring original documents, such as a passport, or a driver's license plus a Social Security card. The form must be finished by your third day of work.", link: ["Form I-9 (USCIS)", "https://www.uscis.gov/i-9"] },
      { id: "w4", title: "Fill out your W-4", text: "It tells your employer how much federal tax to take from each check. Only Steps 1 and 5 are required for most first jobs. Your state may have its own form.", link: ["W-4 walkthrough", "taxes.html#w4"] },
      { id: "dd", title: "Set up direct deposit", text: "Have your bank's routing and account numbers ready. Many employers let you split pay, so a slice can go straight to savings.", link: ["Banking Basics lesson", "lessons/banking.html"] },
    ] },
    { phase: "First paycheck", items: [
      { id: "stub", title: "Read your pay stub", text: "Check your hours and rate, then find federal and state tax, Social Security (6.2%), and Medicare (1.45%). Mistakes happen; ask payroll early.", link: ["Pay Stub Reader", "tools.html#stub"] },
      { id: "budget", title: "Give your paycheck a plan", text: "Cover needs first, then decide what goes to savings and fun before you spend it.", link: ["First Paycheck Plan", "plan.html"] },
      { id: "alerts", title: "Turn on low-balance alerts and skip overdraft coverage", text: "Low-balance alerts, plus saying no to overdraft coverage on debit purchases, help you avoid overdraft fees, which averaged $26.77 each in 2025.", link: ["Fee Hunter game", "play.html#fees"] },
    ] },
    { phase: "First month: benefits", items: [
      { id: "health", title: "Choose your health plan", text: "New hires usually get a limited window, often about 30 days, to enroll. Miss it and you may wait until the next open enrollment. Compare total yearly cost, not just the premium.", link: ["Plan Picker game", "play.html#plans"] },
      { id: "match", title: "Get the full 401(k) match", text: "If your employer matches contributions, put in at least enough to get all of it. That's an instant return on your money. Check the vesting schedule too.", link: ["Job Offer Comparison", "tools.html#offer"] },
      { id: "hsa", title: "Decide on an HSA or FSA", text: "If offered, these let you pay for medical costs with pre-tax money. Health FSA money is generally use-it-or-lose-it; HSA money is yours to keep.", link: ["HSA / FSA Savings", "tools.html#hsa"] },
      { id: "benef", title: "Name your beneficiaries", text: "Fill in who receives your 401(k) and any work life insurance. It takes two minutes and avoids a mess later.", link: ["Insurance 101 lesson", "lessons/insurance.html"] },
    ] },
    { phase: "First three months", items: [
      { id: "efund", title: "Start an emergency fund", text: "Aim for $500 first, then build toward three to six months of essential costs in a high-yield savings account.", link: ["Emergency Fund tool", "tools.html#emergency"] },
      { id: "goals", title: "Set one or two savings goals", text: "A car, a move-out fund, a trip: give each a target and date so you know the monthly amount.", link: ["Savings Goals", "tools.html#goals"] },
      { id: "credit", title: "Build credit the safe way", text: "One card, a small charge you'd make anyway, paid in full on autopay. Payment history is the biggest part of your score.", link: ["Account Matchmaker", "tools.html#match"] },
      { id: "renters", title: "Get renters insurance if you rent", text: "Your landlord's insurance doesn't cover your stuff. It averages about $170 a year.", link: ["First Apartment Budget", "tools.html#apartment"] },
    ] },
    { phase: "If you also freelance or gig", items: [
      { id: "gig", title: "Set aside taxes from side income", text: "Nobody withholds tax from gig pay. Move a share of every payment into savings and track your miles.", link: ["Side hustle tax calculator", "taxes.html#gig"] },
    ] },
  ];
  const all = STEPS.flatMap((p) => p.items);
  let done = store.get(KEY, {});

  function render() {
    const count = all.filter((s) => done[s.id]).length;
    root.innerHTML = `
      <div class="fj-top">
        <div><div class="label small muted">Your progress</div><div class="fj-count">${count} of ${all.length} steps</div></div>
        <button type="button" class="link-btn" data-reset>Start over</button>
      </div>
      <div class="progress" style="height:10px;margin:8px 0 20px"><span style="width:${(count / all.length) * 100}%"></span></div>
      ${STEPS.map((p) => `
        <h3 class="fj-phase">${esc(p.phase)} <span class="small muted">${p.items.filter((s) => done[s.id]).length}/${p.items.length}</span></h3>
        <ul class="fj-list">${p.items.map((s) => `
          <li class="fj-item${done[s.id] ? " done" : ""}">
            <input type="checkbox" id="fj-${s.id}" data-id="${s.id}"${done[s.id] ? " checked" : ""}>
            <div><label for="fj-${s.id}"><strong>${esc(s.title)}</strong></label>
              <p class="small muted">${esc(s.text)}</p>
              <a class="small" href="${s.link[1]}"${s.link[1].startsWith("http") ? ' rel="noopener" target="_blank"' : ""}>${esc(s.link[0])} →</a></div>
          </li>`).join("")}</ul>`).join("")}
      ${count === all.length ? `<p class="callout small">🎉 Every step done. Your first job is set up for success. Revisit the benefits steps each year at open enrollment.</p>` : ""}`;
  }

  root.addEventListener("change", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    done[id] = e.target.checked;
    store.set(KEY, done);
    const y = scrollY; render(); scrollTo(0, y);
    const box = $("fj-" + id); if (box) box.focus({ preventScroll: true });
  });
  root.addEventListener("click", (e) => {
    if (!e.target.closest("[data-reset]")) return;
    if (!confirm("Clear all checkmarks?")) return;
    done = {}; store.set(KEY, done); render();
  });
  render();
})();
