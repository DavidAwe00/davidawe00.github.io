// Spot the Scam — decide whether each text, email, DM, call, or listing is a scam or legit,
// then (for scams) tap the exact red flags in the message.
// Lesson: scams share the same red flags (urgency, odd payment, code/password requests, too good to be true).
// All companies and people are fictional. Patterns follow FTC consumer alerts (consumer.ftc.gov).
window.Games = window.Games || {};
Games.scam = (() => {
  const root = document.getElementById("scam-root");
  const ROUNDS = 10, SCAMS = 6, PT_VERDICT = 100, PT_FLAG = 25, PT_FALSE = 15;
  const t = (s, v) => (typeof I18N === "object" ? I18N.t(s, v) : s);
  // Messages are translated whole, {{flag|type}} markers included, so a translation can reorder the sentence.
  // Keyboard: S/L always work, plus the first letters of the words on the buttons in the page's language.
  const KEYS = { en: ["s", "l"], es: ["e", "l"] }; // Estafa / Legítimo
  const keys = () => KEYS[typeof I18N === "object" ? I18N.lang() : "en"] || KEYS.en;
  const keyScam = () => keys()[0], keyLegit = () => keys()[1];
  const CH = { text: "📱 Text message", email: "✉️ Email", dm: "💬 Direct message", call: "📞 Phone call", listing: "🛒 Marketplace" };
  const FLAG = {
    rush: "⏰ Rush or deadline", pay: "💳 Odd way to pay", link: "🔗 Unknown link", code: "🔑 Asks for a code or login",
    good: "🎁 Too good to be true", threat: "🚨 Threat", app: "📲 Move to another app", sender: "🎭 Fake or look-alike sender",
    fee: "💸 Pay to get paid", unseen: "🙈 Can't see it in person", stranger: "👋 Stranger starting a chat",
  };
  // In scam bodies, {{text|type}} marks a red flag. fromFlag marks the sender line itself as a flag.
  const POOL = [
    // Scams
    { ch: "text", from: "+1 (839) 555-0142", body: "Delivery notice: your package is on hold due to an incomplete address. {{Pay the $1.99 redelivery fee|fee}} {{within 12 hours|rush}}: {{parcel-redeliver.info|link}}", scam: true,
      why: "Unexpected link, a small fee to \"release\" a package, and a deadline. The real goal is your card number. Track packages in the shipper's own app." },
    { ch: "text", from: "+1 (412) 555-0187", body: "{{FINAL NOTICE|rush}}: You have an unpaid toll of $6.85. Pay today {{to avoid a $50 late fee and suspension of your license|threat}}: {{tollpay-services.com|link}}", scam: true,
      why: "The FTC has been warning about fake toll texts like this since 2025. Threats plus a link are the giveaway. Check tolls on your toll agency's official site." },
    { ch: "dm", from: "@careers.remote.hiring", body: "Hi! We're hiring remote product reviewers. {{Earn $300–$800/day just rating apps|good}}. {{No experience needed!|good}} {{Message me on another chat app|app}} to start today 💸", scam: true,
      why: "Huge pay for easy work, no interview, and a push to move to a different app. \"Task\" jobs later ask you to deposit money to unlock earnings." },
    { ch: "email", from: "Maple Bank Security <alerts@maple-bank-secure.net>", fromFlag: "sender", body: "We detected an unusual sign-in. {{To keep your account open|threat}}, {{reply with the 6-digit code we just texted you|code}} {{within 30 minutes|rush}}.", scam: true,
      why: "No real bank asks for your one-time code. That code is the key to your account. The look-alike email domain is another clue." },
    { ch: "call", from: "Unknown number", body: "\"This is {{Officer Grant with the county sheriff|sender}}. You missed jury duty and {{there's a warrant for your arrest|threat}}. {{To clear it today|rush}}, {{pay $900 in gift cards|pay}}.\"", scam: true,
      why: "Government agencies don't call to demand payment, and never take gift cards. Threat of arrest is pure pressure. Hang up." },
    { ch: "listing", from: "Buyer: Jordan K.", body: "I'll buy your bike for $250! {{I'm mailing a check for $1,200 by mistake|good}}. When it arrives, {{just send me back the extra $950 on a payment app|pay}}.", scam: true,
      why: "The classic fake-check scam. The check bounces days later, and you're out the $950 you sent. Never send back an \"overpayment.\"" },
    { ch: "listing", from: "Landlord: R. Mills", body: "Downtown 1-bedroom, {{$650/month|good}}. {{I'm working overseas so I can't show it|unseen}}. {{Send the $1,300 deposit by payment app|pay}} and I'll mail you the keys.", scam: true,
      why: "Below-market rent, no in-person showing, and a deposit before a lease. Rental scammers copy real listings. Never pay before you've seen it." },
    { ch: "dm", from: "Your friend Sam (account looks normal)", body: "hey can u do me a huge favor?? {{I'm stuck|rush}} and {{need a $100 gift card|pay}}. {{just send me a pic of the code on the back|code}}, I'll pay u back tonight 🙏", scam: true,
      why: "Hacked accounts are a favorite trick. A gift-card request plus urgency is a red flag even from a friend. Call or text Sam another way first." },
    { ch: "dm", from: "@crypto.mentor.mia", body: "{{My mentor turned $500 into $14,000 in 3 weeks|good}} on this crypto platform. {{Guaranteed returns, zero risk!|good}} {{Want me to set up your account?|code}}", scam: true,
      why: "No real investment is guaranteed or risk-free. Investment scams caused the biggest losses in 2025, according to the FTC." },
    { ch: "email", from: "Prize Center <winner@lucky-rewards-now.com>", fromFlag: "sender", body: "Congratulations! {{You've won a $1,000 gift card|good}}. {{Just pay $4.99 shipping to claim your prize|fee}}. {{Offer expires at midnight|rush}}.", scam: true,
      why: "You can't win a contest you never entered, and real prizes never cost money to claim. The deadline is there to rush you." },
    { ch: "call", from: "Student Aid Relief Center", body: "\"Great news, {{your student loans qualify for instant forgiveness|good}}! We just need {{a one-time $499 enrollment fee|fee}} and {{your FSA login|code}}.\"", scam: true,
      why: "Applying for federal student loan programs is free at StudentAid.gov. Never pay a fee or share your FSA ID login." },
    { ch: "text", from: "+1 (628) 555-0119", body: "{{Hi, is this Alex? It's Jenna from the yoga class|stranger}} 😊 Oh sorry, wrong number! You seem nice though. {{Want to keep chatting on another app?|app}}", scam: true,
      why: "A \"wrong number\" that turns into friendly chat is how many romance and crypto investment scams start. Weeks later comes an investing \"tip.\" Don't reply." },
    { ch: "email", from: "Streamly Billing <billing@streamly-accounts.help>", fromFlag: "sender", body: "Your payment didn't go through and {{your membership will be cancelled today|threat}}. {{Update your card at streamly-accounts.help/renew|link}} {{within 24 hours|rush}}.", scam: true,
      why: "Fake \"payment failed\" emails copy real brands. Open the app or type the company's real site yourself to check your account." },
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
    { ch: "text", from: "Maple Bank (short code 62345)", ctx: "You have a Maple Bank debit card.", body: "Maple Bank Fraud Alert: Did you attempt a $482.10 purchase at ElectroMart? Reply YES or NO. We will never ask for your PIN, password, or codes by text.", scam: false,
      why: "Real fraud alerts look like this: a yes/no question, no link, and no request for codes. It feels urgent, but it asks for nothing valuable. If unsure, call the number on your card." },
  ];
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  let round, correct, points, deck, phase, found, falseTaps, flagsFound, flagsTotal;

  // Split a message into tappable segments: each flag is one segment, other text is split into short phrases.
  function segments(body) {
    const out = [];
    body.split(/(\{\{[^}]+\}\})/).forEach((part) => {
      const m = part.match(/^\{\{([^|]+)\|([a-z]+)\}\}$/);
      if (m) return out.push({ text: m[1], flag: m[2] });
      part.split(/(?<=[,.!?:;])\s+/).forEach((p, j) => {
        if (!p.trim()) return;
        // Only the first piece can touch the flag before it ("{{FINAL NOTICE|rush}}: You…"); later pieces were
        // split at a space, so they keep a space before them.
        const glue = j === 0 && !/^\s/.test(p);
        // Punctuation left between two flags stays plain text instead of becoming its own tappable box.
        if (/^[\s.,!?:;"'()]+$/.test(p)) return out.push({ text: p.trim(), flag: null, plain: true, glue });
        out.push({ text: p.trim(), flag: null, glue: glue && out.length > 0 });
      });
    });
    return out;
  }

  function start() {
    round = 0; correct = 0; points = 0; flagsFound = 0; flagsTotal = 0;
    deck = shuffle([...shuffle(POOL.filter((m) => m.scam)).slice(0, SCAMS), ...shuffle(POOL.filter((m) => !m.scam)).slice(0, ROUNDS - SCAMS)]);
    next();
  }

  function next() {
    const m = deck[round];
    phase = "verdict";
    m.segs = segments(t(m.body));
    root.innerHTML = `
      <div class="small muted">${t("Message {n} of {total} · {correct} correct · {points} pts", { n: round + 1, total: ROUNDS, correct, points })}</div>
      <div class="step-dots">${Array.from({ length: ROUNDS }, (_, i) => `<span class="${i < round ? "on" : ""}"></span>`).join("")}</div>
      <div class="scam-msg">
        <div class="scam-meta"><span>${t(CH[m.ch])}</span><span>${t("From:")} <span class="scam-seg" data-seg="from">${esc(t(m.from))}</span></span></div>
        ${m.ctx ? `<p class="small muted" style="margin:0 0 8px">${esc(t(m.ctx))}</p>` : ""}
        <p class="scam-body">${m.segs.map((s, i) => (i && !s.glue ? " " : "") + (s.plain ? esc(s.text) : `<span class="scam-seg" data-seg="${i}">${esc(s.text)}</span>`)).join("")}</p>
      </div>
      <div id="scam-ask">
        <p class="quiz-q" style="text-align:center">${t("Scam or legit?")}</p>
        <div class="scam-choices">
          <button class="choice" data-pick="1">${t("🚩 Scam")} <span class="key">${keyScam().toUpperCase()}</span></button>
          <button class="choice" data-pick="0">${t("✅ Legit")} <span class="key">${keyLegit().toUpperCase()}</span></button>
        </div>
      </div>
      <div id="scam-feedback" style="max-width:560px;margin:16px auto 0" aria-live="polite"></div>`;
  }

  function pick(saidScam) {
    if (phase !== "verdict") return;
    const m = deck[round], ok = saidScam === m.scam;
    if (ok) { correct++; points += PT_VERDICT; }
    root.querySelectorAll("[data-pick]").forEach((b) => {
      b.disabled = true;
      const isScamBtn = b.dataset.pick === "1";
      if (isScamBtn === m.scam) b.classList.add("correct");
      else if (isScamBtn === saidScam) b.classList.add("wrong");
    });
    if (m.scam && ok) return huntView();
    phase = "done";
    reveal(`<strong>${ok ? t("✅ Correct!") : t("❌ Not quite.")} ${m.scam ? t("This one is a scam.") : t("This one is legit.")}</strong> ${t(m.why)}`);
  }

  // Phase 2: tap every red flag. Segments become buttons so keyboard users can Tab through them.
  function huntView() {
    const m = deck[round];
    phase = "hunt";
    found = new Set(); falseTaps = 0;
    const n = m.segs.filter((s) => s.flag).length + (m.fromFlag ? 1 : 0);
    root.querySelectorAll(".scam-seg").forEach((el) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "scam-seg tappable"; b.dataset.seg = el.dataset.seg; b.textContent = el.textContent;
      el.replaceWith(b);
    });
    document.getElementById("scam-ask").innerHTML = `<p class="quiz-q" style="text-align:center;margin-bottom:4px">${t("✅ Scam! Now find the red flags.")}</p>
      <p class="small muted" style="text-align:center;margin:0">${t("Tap each suspicious part. There are <strong>{n}</strong> (the sender can be one). +{hit} each, −{miss} for a false alarm.", { n, hit: PT_FLAG, miss: PT_FALSE })}</p>
      <p class="small" style="text-align:center;margin:8px 0" id="scam-count" aria-live="polite">${t("Found {found} of {n}", { found: 0, n })}</p>
      <div style="text-align:center"><button class="btn btn-primary" data-done>${t("Done hunting")}</button></div>`;
    root.querySelector(".scam-seg.tappable").focus({ preventScroll: true });
  }

  function tap(el) {
    if (phase !== "hunt" || el.disabled) return;
    const m = deck[round], id = el.dataset.seg;
    const flag = id === "from" ? m.fromFlag : m.segs[+id].flag;
    el.disabled = true;
    if (flag) { found.add(id); el.classList.add("flag-hit"); el.title = t(FLAG[flag]); }
    else { falseTaps++; el.classList.add("flag-miss"); }
    const n = m.segs.filter((s) => s.flag).length + (m.fromFlag ? 1 : 0);
    document.getElementById("scam-count").textContent = t("Found {found} of {n}", { found: found.size, n }) + (falseTaps ? " · " + t(falseTaps > 1 ? "{n} false alarms" : "{n} false alarm", { n: falseTaps }) : "");
    if (found.size === n) finishHunt();
  }

  function finishHunt() {
    if (phase !== "hunt") return;
    phase = "done";
    const m = deck[round];
    const n = m.segs.filter((s) => s.flag).length + (m.fromFlag ? 1 : 0);
    const pts = Math.max(0, found.size * PT_FLAG - falseTaps * PT_FALSE);
    points += pts; flagsFound += found.size; flagsTotal += n;
    // Show every flag with its label, including any that were missed.
    root.querySelectorAll(".scam-seg").forEach((el) => {
      const id = el.dataset.seg, flag = id === "from" ? m.fromFlag : m.segs[+id].flag;
      if (el.tagName === "BUTTON") el.disabled = true;
      if (flag && !found.has(id)) el.classList.add("flag-missed");
      if (flag) el.insertAdjacentHTML("afterend", `<span class="flag-tag">${t(FLAG[flag])}</span>`);
    });
    const tags = [...new Set([...m.segs.filter((s) => s.flag).map((s) => s.flag), ...(m.fromFlag ? [m.fromFlag] : [])])];
    document.getElementById("scam-ask").innerHTML = "";
    reveal(`<strong>${t("🚩 You found {found} of {n} red flags (+{pts} pts).", { found: found.size, n, pts })}</strong> ${t(m.why)}<div class="small muted" style="margin-top:6px">${t("Flags here: {flags}", { flags: tags.map((f) => t(FLAG[f])).join(" · ") })}</div>`);
  }

  function reveal(html) {
    document.getElementById("scam-feedback").innerHTML = `<div class="feedback" style="display:block">${html}</div>
      <div style="text-align:center;margin-top:12px"><button class="btn btn-primary" data-next>${round + 1 < ROUNDS ? t("Next message →") : t("See results →")}</button></div>`;
    root.querySelector("[data-next]").focus({ preventScroll: true });
  }

  function end() {
    const { best, isNew } = FG.recordBest("scam", correct);
    const pb = FG.recordBest("scam-points", points);
    const xp = correct * 5 + flagsFound * 2;
    FG.addXp(xp);
    Games.refreshBest && Games.refreshBest();
    const rank = t(correct === ROUNDS && flagsFound === flagsTotal ? "Fraud investigator 🕵️" : correct === ROUNDS ? "Scam-proof 🛡️" : correct >= 8 ? "Sharp eye 🦉" : correct >= 6 ? "Getting there 🔍" : "Easy target 🎣 (try again!)");
    root.innerHTML = `<div class="result">
      <div class="card-icon" style="font-size:2.4rem">🎣</div>
      <div class="big">${correct}/${ROUNDS}</div>
      <p><strong>${rank}</strong></p>
      <p class="small">${t("{points} pts · {found} of {total} red flags found", { points, found: flagsFound, total: flagsTotal })}</p>
      <p class="small muted">${isNew ? t("🏆 New best!") : t("Best: {best}", { best: best + "/" + ROUNDS })} · ${pb.isNew ? t("🏆 New points record") : t("Points record: {n}", { n: pb.best })} · +${xp} XP</p>
      <div class="callout" style="text-align:left">${t("<strong>Money lesson:</strong> scams almost always rush you, ask for an unusual payment (gift cards, crypto, payment apps, wires), ask for a code or password, or promise something too good to be true. When in doubt, contact the company yourself using its app or the number on your card. Learn more in the <a href=\"learn.html#scams\">Spotting Scams lesson</a>.")}</div>
      <button class="btn btn-primary" data-restart>${t("Play again")}</button></div>`;
  }

  root.addEventListener("click", (e) => {
    const p = e.target.closest("[data-pick]");
    if (p) return pick(p.dataset.pick === "1");
    const s = e.target.closest("button.scam-seg");
    if (s) return tap(s);
    if (e.target.closest("[data-done]")) return finishHunt();
    if (e.target.closest("[data-next]")) { round++; return round < ROUNDS ? next() : end(); }
    if (e.target.closest("[data-restart]")) start();
  });
  document.addEventListener("keydown", (e) => {
    if (root.closest("[hidden]") || e.ctrlKey || e.metaKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    const scamKey = k === "s" || k === keyScam(), legitKey = k === "l" || k === keyLegit();
    if (phase === "verdict" && (scamKey || legitKey)) { e.preventDefault(); pick(scamKey); }
  });

  // A message still waiting for a verdict is redrawn in the new language.
  document.addEventListener("langchange", () => { if (round !== undefined && phase === "verdict" && round < ROUNDS) next(); });
  return { show() { if (round === undefined) start(); }, hide() {} };
})();
