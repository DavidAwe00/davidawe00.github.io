// Line icons for the homepage sections (Explore, Learn, Play, Plan). Same drawing style as the
// "Start where you are" cards: 24px grid, thin rounded strokes, no fill, colored by CSS (currentColor).
// Used by the homepage's lesson-grid renderer and by scripts/build-seo.js, so both stay identical.
const FGIcons = (() => {
  const P = {
    // Sections
    compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    book: '<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5c-3.5-.5-6.5 0-8.5 1.5z"/><path d="M12 6.5v13"/>',
    controller: '<path d="M7 8h10a4 4 0 0 1 4 4v1.5a3 3 0 0 1-5.4 1.8L14.5 14h-5l-1.1 1.3A3 3 0 0 1 3 13.5V12a4 4 0 0 1 4-4z"/><path d="M7.5 10.5v3M6 12h3"/><circle cx="15.5" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="17" cy="13" r="1" fill="currentColor" stroke="none"/>',
    calculator: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 6.5h7v3h-7z"/><circle cx="8.5" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="13" r="1" fill="currentColor" stroke="none"/><circle cx="8.5" cy="16.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="16.5" r="1" fill="currentColor" stroke="none"/>',
    // Topics
    trend: '<path d="M3 17l5-5 4 3 8-8"/><path d="M15 7h5v5"/>',
    cap: '<path d="M2.5 9.5L12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5v4c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4"/><path d="M21.5 9.5v4.5"/>',
    card: '<rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="M2.5 10h19M6 14.5h4"/>',
    receipt: '<path d="M6 3h12v18l-3-1.8-3 1.8-3-1.8L6 21z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
    house: '<path d="M3.5 11L12 4.5l8.5 6.5"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5h4v5"/>',
    // Units and lessons
    banknote: '<rect x="2.5" y="6.5" width="19" height="11" rx="2"/><circle cx="12" cy="12" r="2.5"/><circle cx="6" cy="9.5" r="1" fill="currentColor" stroke="none"/><circle cx="18" cy="14.5" r="1" fill="currentColor" stroke="none"/>',
    shield: '<path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z"/><path d="M9 12l2 2 4-4"/>',
    signpost: '<path d="M12 3v18"/><path d="M5 5.5h11l3 2.5-3 2.5H5z"/><path d="M19 13H8l-3 2.5L8 18h11z"/>',
    pie: '<circle cx="12" cy="12" r="9"/><path d="M12 3v9h9"/>',
    bank: '<path d="M3 9.5L12 4l9 5.5M4.5 10h15M6.5 10v7.5M10 10v7.5M14 10v7.5M17.5 10v7.5M3 20h18"/>',
    laptop: '<rect x="4.5" y="5" width="15" height="10.5" rx="1.5"/><path d="M2.5 19h19"/>',
    lifebuoy: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M5.6 5.6l3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9"/>',
    umbrella: '<path d="M3 12a9 9 0 0 1 18 0z"/><path d="M12 12v6.5a2 2 0 0 1-4 0"/>',
    alert: '<path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z"/><path d="M12 8v4.5"/><circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1" fill="currentColor" stroke="none"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    gauge: '<path d="M3.5 18a8.5 8.5 0 1 1 17 0"/><path d="M12 18l3.5-5M3.5 18h17"/>',
    hourglass: '<path d="M7 3h10M7 21h10"/><path d="M8 3c0 4.5 8 4.5 8 9s-8 4.5-8 9M16 3c0 4.5-8 4.5-8 9s8 4.5 8 9"/>',
    document: '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/>',
    sprout: '<path d="M12 21v-9"/><path d="M12 12c0-4 3-7 7-7 0 4-3 7-7 7zM12 14.5c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z"/>',
    percent: '<circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/><path d="M18.5 5.5l-13 13"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    safe: '<rect x="3.5" y="4" width="17" height="15" rx="2"/><circle cx="12" cy="11.5" r="3.5"/><path d="M12 8v.01M7 19v2M17 19v2"/>',
    backpack: '<path d="M8.5 6V5a3.5 3.5 0 0 1 7 0v1"/><rect x="5" y="6" width="14" height="15" rx="3"/><path d="M9 13h6v4H9z"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14.5 8.5l2 2"/>',
    car: '<path d="M4 15.5V12l1.8-4.2A2 2 0 0 1 7.6 6.5h8.8a2 2 0 0 1 1.8 1.3L20 12v3.5z"/><path d="M4 12h16"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="16.5" cy="17.5" r="1.5"/>',
    // Games and tools
    coins: '<ellipse cx="12" cy="6.5" rx="7.5" ry="2.5"/><path d="M4.5 6.5v5c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-5M4.5 11.5v5c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-5"/>',
    scale: '<path d="M12 4v16M7 20h10M4.5 7.5h15"/><path d="M7 7.5L4 13.5a3 3 0 0 0 6 0zM17 7.5l-3 6a3 3 0 0 0 6 0z"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    waves: '<path d="M3 17l4-6 3 4 4-8 3 5 4-3"/><path d="M3 21h18"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 12.5h18"/>',
    cart: '<path d="M3 4h2l2.3 10.4a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.1L20.5 8H6.2"/><circle cx="10" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>',
    bars: '<path d="M3.5 20h17M7 20v-6M12 20V8M17 20v-9"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/>',
    checklist: '<path d="M9 3.5h6v3H9z"/><path d="M8 5H5.5v16h13V5H16"/><path d="M9 13l2 2 4-4"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
    building: '<path d="M5 21V4h10v17M15 9h4v12M3 21h18"/><circle cx="8.5" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="11.5" cy="8" r="1" fill="currentColor" stroke="none"/><circle cx="8.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="11.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="8.5" cy="16" r="1" fill="currentColor" stroke="none"/><circle cx="11.5" cy="16" r="1" fill="currentColor" stroke="none"/>',
    pulse: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5"/>',
    megaphone: '<path d="M4 10v4h3l8 4.5v-13L7 10z"/><path d="M18 9.5a3.5 3.5 0 0 1 0 5"/><path d="M7 14l1.5 5h2.5l-1-4.2"/>',
  };
  const lesson = {
    budgeting: "pie", banking: "bank", "taxes-101": "receipt", "first-tax-return": "mail", "side-hustle": "laptop",
    "emergency-fund": "lifebuoy", insurance: "umbrella", scams: "alert", betting: "dice",
    debt: "link", credit: "gauge", "bnpl-payday": "hourglass", "student-loans-2026": "document",
    "compound-interest": "trend", investing: "sprout", "investing-hype": "megaphone", inflation: "percent", "risk-time": "clock", "retirement-accounts": "safe",
    "college-roi": "cap", "financial-aid": "backpack", "first-apartment": "key", "money-relationships": "people", "rent-vs-buy": "house", "car-buying": "car",
  };
  const unit = { earn: "banknote", protect: "shield", borrow: "card", grow: "trend", decide: "signpost" };
  const svg = (name, cls = "line-icon") => (P[name] ? `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[name]}</svg>` : "");
  return { svg, lesson, unit, names: Object.keys(P) };
})();
if (typeof module !== "undefined") module.exports = FGIcons;
