// MoneyExplained videos on YouTube. Add one entry per uploaded video; with no entries, video features stay hidden.
//   id:      the 11-character YouTube video id (youtube.com/watch?v=<id> or youtu.be/<id>)
//   lesson:  the lesson id in js/lessons.js it goes with (optional; omit for general videos)
//   title:   shown on the site
//   minutes: length, rounded (use 1 for Shorts)
//   kind:    "lesson" (16:9 explainer) or "short" (vertical YouTube Short)
//   lang:    "en" or "es"
// Before adding a video, check its numbers against the lesson (same facts, same year). See docs/VIDEOS.md.
const VIDEOS = [
  { id: "UzFu69sMFdE", title: "How Money Actually Works (In Simple Terms)", minutes: 6, kind: "lesson", lang: "en" },
  { id: "Yjv5C3D6jRQ", lesson: "debt", title: "Good Debt vs Bad Debt: The Difference That Keeps People Broke", minutes: 4, kind: "lesson", lang: "en" },
  // { id: "AbCdEfGhIjK", lesson: "budgeting", title: "Budgeting in 3 minutes: the 50/30/20 rule", minutes: 3, kind: "lesson", lang: "en" },
];
