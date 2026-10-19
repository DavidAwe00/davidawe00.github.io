// Spot the Scam — decide whether each text, email, DM, call, or listing is a scam or legit.
// Lesson: scams share the same red flags (urgency, odd payment, code/password requests, too good to be true).
// All companies and people are fictional. Patterns follow FTC consumer alerts (consumer.ftc.gov).
window.Games = window.Games || {};
Games.scam = (() => {
  const root = document.getElementById("scam-root");
  const ROUNDS = 10, SCAMS = 6;
  const CH = { text: "📱 Text message", email: "✉️ Email", dm: "💬 Direct message", call: "📞 Phone call", listing: "🛒 Marketplace" };
  const POOL = [
    // Scams
    { ch: "text", from: "+1 (839) 555-0142", body: "Delivery notice: your package is on hold due to an incomplete address. Pay the $1.99 redelivery fee within 12 hours: parcel-redeliver.info", scam: true,
      why: "Unexpected link, a small fee to \"release\" a package, and a deadline. The real goal is your card number. Track packages in the shipper's own app." },
    { ch: "text", from: "+1 (412) 555-0187", body: "FINAL NOTICE: You have an unpaid toll of $6.85. Pay today to avoid a $50 late fee and suspension of your license: tollpay-services.com", scam: true,
      why: "The FTC has been warning about fake toll texts like this since 2025. Threats plus a link are the giveaway. Check tolls on your toll agency's official site." },
    { ch: "dm", from: "@careers.remote.hiring", body: "Hi! We're hiring remote product reviewers. Earn $300–$800/day just rating apps. No experience needed! Message me on another chat app to start today 💸", scam: true,
      why: "Huge pay for easy work, no interview, and a push to move to a different app. \"Task\" jobs later ask you to deposit money to unlock earnings." },
    { ch: "email", from: "Maple Bank Security <alerts@maple-bank-secure.net>", body: "We detected an unusual sign-in. To keep your account open, reply with the 6-digit code we just texted you within 30 minutes.", scam: true,
      why: "No real bank asks for your one-time code. That code is the key to your account. The look-alike email domain is another clue." },
    { ch: "call", from: "Unknown number", body: "\"This is Officer Grant with the county sheriff. You missed jury duty and there's a warrant for your arrest. To clear it today, pay $900 in gift cards.\"", scam: true,
      why: "Government agencies don't call to demand payment, and never take gift cards. Threat of arrest is pure pressure. Hang up." },
    { ch: "listing", from: "Buyer: Jordan K.", body: "I'll buy your bike for $250! I'm mailing a check for $1,200 by mistake. When it arrives, just send me back the extra $950 on a payment app.", scam: true,
      why: "The classic fake-check scam. The check bounces days later, and you're out the $950 you sent. Never send back an \"overpayment.\"" },
    { ch: "listing", from: "Landlord: R. Mills", body: "Downtown 1-bedroom, $650/month. I'm working overseas so I can't show it. Send the $1,300 deposit by payment app and I'll mail you the keys.", scam: true,
      why: "Below-market rent, no in-person showing, and a deposit before a lease. Rental scammers copy real listings. Never pay before you've seen it." },
    { ch: "dm", from: "Your friend Sam (account looks normal)", body: "hey can u do me a huge favor?? I'm stuck and need a $100 gift card. just send me a pic of the code on the back, I'll pay u back tonight 🙏", scam: true,
      why: "Hacked accounts are a favorite trick. A gift-card request plus urgency is a red flag even from a friend. Call or text Sam another way first." },
    { ch: "dm", from: "@crypto.mentor.mia", body: "My mentor turned $500 into $14,000 in 3 weeks on this crypto platform. Guaranteed returns, zero risk! Want me to set up your account?", scam: true,
      why: "No real investment is guaranteed or risk-free. Investment scams caused the biggest losses in 2025, according to the FTC." },
    { ch: "email", from: "Prize Center <winner@lucky-rewards-now.com>", body: "Congratulations! You've won a $1,000 gift card. Just pay $4.99 shipping to claim your prize. Offer expires at midnight.", scam: true,
      why: "You can't win a contest you never entered, and real prizes never cost money to claim. The deadline is there to rush you." },
    { ch: "call", from: "Student Aid Relief Center", body: "\"Great news, your student loans qualify for instant forgiveness! We just need a one-time $499 enrollment fee and your FSA login.\"", scam: true,
      why: "Applying for federal student loan programs is free at StudentAid.gov. Never pay a fee or share your FSA ID login." },
    // Legit
    { ch: "text", from: "Maple Bank (short code 62345)", ctx: "You just tried to sign in to your bank's app.", body: "Maple Bank: Your code is 482913. Don't share it with anyone. We'll never call or text to ask for this code.", scam: false,
      why: "You asked for it, there's no link, and it warns you not to share it. Type it into the app yourself and never read it to anyone." },
    { ch: "email", from: "Lincoln High School <office@lincolnhs.example.org>", body: "Spring report cards are now posted. Log in to the student portal through the school website as usual to view them.", scam: false,
      why: "No pressure, no payment, and it sends you to the portal you already use instead of a link. That's what legit notices look like." },
    { ch: "email", from: "Riverside Grocery HR", ctx: "You applied and interviewed there last week.", body: "Thanks for interviewing! We'd like to offer you the cashier position at $15.50/hour. Please bring a photo ID to orientation on Monday to complete your W-4 and I-9 with HR.", scam: false,
      why: "You applied, you interviewed, the pay is realistic, and paperwork happens in person. A real job never asks you to pay to start." },
    { ch: "email", from: "GameHub <no-reply@gamehub.example.com>", ctx: "You just clicked \"Forgot password\" on GameHub.", body: "You requested a password reset. This link expires in 1 hour. If you didn't request this, you can ignore this email.", scam: false,
      why: "It matches something you just did. An unexpected reset email is different: don't click it, and change your password in the app if worried." },
    { ch: "text", from: "Oak St. Pharmacy", body: "Your prescription is ready for pickup at Oak St. Pharmacy. Reply STOP to opt out of texts.", scam: false,
      why: "Informational only. No link, no payment, and no personal info requested." },
  ];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  let round, correct, deck, locked;

  function start() {
    round = 0; correct = 0;
    deck = shuffle([...shuffle(POOL.filter((m) => m.scam)).slice(0, SCAMS), ...shuffle(POOL.filter((m) => !m.scam)).slice(0, ROUNDS - SCAMS)]);
    next();
  }

  function next() {
    const m = deck[round];
    locked = false;
    root.innerHTML = `
      <div class="small muted">Message ${round + 1} of ${ROUNDS} · ${correct} correct</div>
      <div class="step-dots">${Array.from({ length: ROUNDS }, (_, i) => `<span class="${i < round ? "on" : ""}"></span>`).join("")}</div>
      <div class="scam-msg">
        <div class="scam-meta"><span>${CH[m.ch]}</span><span>From: <strong>${esc(m.from)}</strong></span></div>
        ${m.ctx ? `<p class="small muted" style="margin:0 0 8px">${esc(m.ctx)}</p>` : ""}
        <p class="scam-body">${esc(m.body)}</p>
      </div>
      <p class="quiz-q" style="text-align:center">Scam or legit?</p>
      <div class="scam-choices">
        <button class="choice" data-pick="1">🚩 Scam <span class="key">S</span></button>
        <button class="choice" data-pick="0">✅ Legit <span class="key">L</span></button>
      </div>
      <div id="scam-feedback" style="max-width:560px;margin:16px auto 0" aria-live="polite"></div>`;
  }

  function pick(saidScam) {
    if (locked) return;
    locked = true;
    const m = deck[round], ok = saidScam === m.scam;
    if (ok) correct++;
    root.querySelectorAll("[data-pick]").forEach((b) => {
      b.disabled = true;
      const isScamBtn = b.dataset.pick === "1";
      if (isScamBtn === m.scam) b.classList.add("correct");
      else if (isScamBtn === saidScam) b.classList.add("wrong");
    });
    document.getElementById("scam-feedback").innerHTML = `<div class="feedback"><strong>${ok ? "✅ Correct!" : "❌ Not quite."} This one is ${m.scam ? "a scam" : "legit"}.</strong> ${m.why}</div>
      <div style="text-align:center;margin-top:12px"><button class="btn btn-primary" data-next>${round + 1 < ROUNDS ? "Next message →" : "See results →"}</button></div>`;
  }

  function end() {
    const { best, isNew } = FG.recordBest("scam", correct);
    const xp = correct * 5;
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    const rank = correct === ROUNDS ? "Scam-proof 🛡️" : correct >= 8 ? "Sharp eye 🦉" : correct >= 6 ? "Getting there 🔍" : "Easy target 🎣 (try again!)";
    root.innerHTML = `<div class="result">
      <div class="card-icon" style="font-size:2.4rem">🎣</div>
      <div class="big">${correct}/${ROUNDS}</div>
      <p><strong>${rank}</strong></p>
      <p class="small muted">${isNew ? "🏆 New best!" : "Best: " + best + "/" + ROUNDS} · +${xp} XP</p>
      <div class="callout" style="text-align:left"><strong>Money lesson:</strong> scams almost always rush you, ask for an unusual payment (gift cards, crypto, payment apps, wires), ask for a code or password, or promise something too good to be true. When in doubt, contact the company yourself using its app or the number on your card. Learn more in the <a href="learn.html#scams">Spotting Scams lesson</a>.</div>
      <button class="btn btn-primary" data-restart>Play again</button></div>`;
  }

  root.addEventListener("click", (e) => {
    const p = e.target.closest("[data-pick]");
    if (p) return pick(p.dataset.pick === "1");
    if (e.target.closest("[data-next]")) { round++; return round < ROUNDS ? next() : end(); }
    if (e.target.closest("[data-restart]")) start();
  });
  document.addEventListener("keydown", (e) => {
    if (root.closest("[hidden]") || e.ctrlKey || e.metaKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    if (!locked && (k === "s" || k === "l")) { e.preventDefault(); pick(k === "s"); }
  });

  return { show() { if (round === undefined) start(); }, hide() {} };
})();
