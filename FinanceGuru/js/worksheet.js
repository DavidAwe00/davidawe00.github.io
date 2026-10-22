// Student worksheets, built from lesson data: guided notes (the lesson's bolded key terms become
// numbered blanks with a word bank), apply-it questions from the lesson plan, the quiz without
// answers, and a teacher answer key. Pure string building so it can be tested without a browser.
const Worksheet = (() => {
  const LETTERS = "ABCD";
  const MAX_BLANKS = 8;
  // Curated tweaks where bold text alone makes weak notes: extra plain-text phrases to blank
  // (first occurrence) and bold terms to leave in place.
  const EXTRA = {
    budgeting: ["take-home", "automatically"],
    "emergency-fund": ["$1,000 or one month", "3–6 months", "high-yield savings account", "stocks"],
    "compound-interest": ["Compound interest", "a third as much"],
  };
  const SKIP = { "compound-interest": ["Alex", "Sam"] };
  const text = (html) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  // Labels ("Deductible:"), tool prompts ("Try it:"), long phrases, and formulas make poor blanks.
  const usable = (t) => t && !/:$/.test(t) && !/^(try it|see it|feel it|explore|run the numbers|practice)\b/i.test(t)
    && !/[=÷×]/.test(t) && t.split(" ").length <= 5;

  // Picks up to MAX_BLANKS distinct terms in reading order and returns the cards with those blanked.
  function notes(lesson) {
    const terms = [], seen = new Set((SKIP[lesson.id] || []).map((t) => t.toLowerCase()));
    const extra = [...(EXTRA[lesson.id] || [])];
    // Bold the first plain-text (outside any tag or <strong>) occurrence of each extra phrase.
    const mark = (html) => html.split(/(<strong>.*?<\/strong>|<[^>]+>)/s).map((part) => {
      if (part.startsWith("<")) return part;
      for (let k = 0; k < extra.length; k++) {
        const at = part.indexOf(extra[k]);
        if (at >= 0) { const t = extra.splice(k--, 1)[0]; part = `${part.slice(0, at)}<strong>${t}</strong>${part.slice(at + t.length)}`; }
      }
      return part;
    }).join("");
    const cards = lesson.cards.map((c) => {
      const html = mark(c.html).replace(/<a\b[^>]*>(.*?)<\/a>/gs, "$1").replace(/<strong>(.*?)<\/strong>/gs, (m, inner) => {
        const t = text(inner), key = t.toLowerCase();
        if (terms.length >= MAX_BLANKS || seen.has(key) || !usable(t)) return m;
        seen.add(key); terms.push(t);
        return `<span class="ws-blank">(${terms.length})</span>`;
      });
      return { heading: c.heading, html };
    });
    return { cards, terms };
  }

  function lines(n) { return `<div class="ws-lines">${"<span></span>".repeat(n)}</div>`; }

  function build(lesson, plan, i) {
    const { cards, terms } = notes(lesson);
    const bank = [...terms].sort((a, b) => a.localeCompare(b));
    const head = (label) => `<div class="plan-head"><div><div class="small muted">FinanceGuru · Lesson ${i + 1} · ${label}</div><h3>${lesson.icon} ${lesson.title}</h3></div></div>`;
    return `
      <div class="print-sheet worksheet">
        ${head("Student worksheet")}
        <p>Name: ______________________________ &nbsp; Date: ______________</p>
        <h4>Guided notes</h4>
        <p class="small">Fill each numbered blank with a term from the word bank.</p>
        <div class="ws-bank">${bank.map((t) => `<span>${t}</span>`).join("")}</div>
        ${cards.map((c) => `<div class="ws-card"><strong>${c.heading}</strong>${c.html}</div>`).join("")}
      </div>
      <div class="print-sheet worksheet page-break">
        ${head("Apply it")}
        ${plan ? `<h4>Think it through</h4><ol>${plan.discuss.map((d) => `<li><p>${d}</p>${lines(3)}</li>`).join("")}</ol>` : ""}
        <h4>Check your understanding</h4>
        <ol class="quiz-print">${lesson.quiz.map((q) => `<li><p>${q.q}</p><ol class="quiz-choices">${q.choices.map((c) => `<li>${c}</li>`).join("")}</ol></li>`).join("")}</ol>
        <h4>One thing I'll do this week</h4>${lines(2)}
      </div>
      <div class="print-sheet page-break">
        <div class="plan-head"><div><div class="small muted">Worksheet answer key — teacher copy</div><h3>${lesson.icon} ${lesson.title}</h3></div></div>
        <h4>Guided notes</h4>
        <ol>${terms.map((t) => `<li><strong>${t}</strong></li>`).join("")}</ol>
        <h4>Check your understanding</h4>
        <ol>${lesson.quiz.map((q) => `<li><strong>${LETTERS[q.answer]}. ${q.choices[q.answer]}</strong> — ${q.why}</li>`).join("")}</ol>
      </div>`;
  }

  return { notes, build, usable };
})();
