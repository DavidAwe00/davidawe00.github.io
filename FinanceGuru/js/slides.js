// Classroom slides, built from lesson data and the lesson plan: title + objectives, warm-up, one slide
// per reading card, the activity, each quiz question (answer hidden until revealed), discussion, and an
// exit slide. Follows the plan's 45-minute agenda. Pure string building so it can be tested without a browser.
const Slides = (() => {
  const LETTERS = "ABCD";
  const list = (items, tag = "ul") => `<${tag}>${items.map((t) => `<li>${t}</li>`).join("")}</${tag}>`;
  // Source notes ("small muted" paragraphs) become a quieter footnote on the slide.
  const card = (html) => html.replace(/<p class="small muted">/g, '<p class="slide-source">');

  function build(lesson, plan, i) {
    const slides = [];
    const add = (kind, heading, body, extra = {}) => slides.push({ kind, heading, body, ...extra });
    add("title", `${lesson.icon} ${lesson.title}`, `
      <p class="slide-lead">${lesson.summary}</p>
      ${plan ? `<h3>Today you'll be able to</h3>${list(plan.objectives)}` : ""}`, { eyebrow: `Lesson ${i + 1} · FinanceGuru` });
    if (plan) add("prompt", "Warm-up", `<p class="slide-lead">${plan.warmup}</p>`, { eyebrow: "5 min · Think, then share" });
    lesson.cards.forEach((c, n) => add("card", c.heading, card(c.html), { eyebrow: `Lesson · ${n + 1} of ${lesson.cards.length}` }));
    if (plan) {
      const a = plan.activity;
      add("activity", a.title, `${list(a.steps, "ol")}
        <p class="slide-links">${a.links.map(([t, href]) => `<a href="${href}" target="_blank" rel="noopener">${t} ↗</a>`).join("")}</p>`,
      { eyebrow: "20 min · Activity" });
    }
    lesson.quiz.forEach((q, n) => add("quiz", q.q, `
      <ol class="slide-choices">${q.choices.map((c, k) => `<li${k === q.answer ? ' data-correct' : ""}><span class="slide-letter">${LETTERS[k]}</span>${c}</li>`).join("")}</ol>
      <p class="slide-why" hidden><strong>${LETTERS[q.answer]}. ${q.choices[q.answer]}</strong> — ${q.why}</p>`,
    { eyebrow: `Check · Question ${n + 1} of ${lesson.quiz.length}`, answer: q.answer }));
    if (plan) add("prompt", "Discuss", list(plan.discuss), { eyebrow: "7 min · Discussion" });
    add("exit", "Before you go", `
      <p class="slide-lead">Write down <strong>one thing you'll do this week</strong> with what you learned.</p>
      <p>Replay the lesson and quiz any time: <a data-student-link href="learn.html#${lesson.id}">learn.html#${lesson.id}</a></p>`,
    { eyebrow: "3 min · Exit ticket" });
    return slides;
  }

  return { build };
})();
