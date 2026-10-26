// Standalone personal finance graduation requirements by state, from NGPF's Live U.S. Dashboard
// (https://www.ngpf.org/school-search/, checked October 2026; NGPF counts 30 states as of April 2026).
// NGPF counts only a standalone course (at least one semester); states where personal finance is part of
// another course, such as economics, are "none" here. `since`: first graduating class already covered.
// `adopted`: in effect, but NGPF lists an adoption year rather than a class. `starts`: first graduating class.
// Refresh each April with NGPF's annual report (see ROADMAP.md).
const STATE_PF = {
  source: "https://www.ngpf.org/school-search/",
  checked: "October 2026",
  states: {
    AL: { name: "Alabama", since: 2013 }, AK: { name: "Alaska" }, AZ: { name: "Arizona" }, AR: { name: "Arkansas" },
    CA: { name: "California", starts: 2031 }, CO: { name: "Colorado", starts: 2030 }, CT: { name: "Connecticut", starts: 2027 },
    DE: { name: "Delaware", starts: 2030 }, DC: { name: "District of Columbia" }, FL: { name: "Florida", starts: 2027 },
    GA: { name: "Georgia", starts: 2028 }, HI: { name: "Hawaii" }, ID: { name: "Idaho" }, IL: { name: "Illinois" },
    IN: { name: "Indiana", starts: 2028 }, IA: { name: "Iowa", since: 2023 }, KS: { name: "Kansas", starts: 2027 },
    KY: { name: "Kentucky", starts: 2030 }, LA: { name: "Louisiana", starts: 2028 }, ME: { name: "Maine" },
    MD: { name: "Maryland" }, MA: { name: "Massachusetts" }, MI: { name: "Michigan", starts: 2028 },
    MN: { name: "Minnesota", starts: 2028 }, MS: { name: "Mississippi", since: 2022 }, MO: { name: "Missouri", since: 2010 },
    MT: { name: "Montana" }, NE: { name: "Nebraska", adopted: 2021 }, NV: { name: "Nevada" },
    NH: { name: "New Hampshire", starts: 2027 }, NJ: { name: "New Jersey" }, NM: { name: "New Mexico" }, NY: { name: "New York" },
    NC: { name: "North Carolina", since: 2024 }, ND: { name: "North Dakota" }, OH: { name: "Ohio", since: 2026 },
    OK: { name: "Oklahoma" }, OR: { name: "Oregon", starts: 2027 }, PA: { name: "Pennsylvania", starts: 2030 },
    RI: { name: "Rhode Island", adopted: 2021 }, SC: { name: "South Carolina", starts: 2027 }, SD: { name: "South Dakota" },
    TN: { name: "Tennessee", since: 2013 }, TX: { name: "Texas", starts: 2030 }, UT: { name: "Utah", since: 2008 },
    VT: { name: "Vermont" }, VA: { name: "Virginia", since: 2015 }, WA: { name: "Washington" },
    WV: { name: "West Virginia", starts: 2028 }, WI: { name: "Wisconsin", starts: 2028 }, WY: { name: "Wyoming" },
  },
  // Tile-map position [row, column] for each state, roughly matching U.S. geography.
  grid: {
    AK: [0, 0], ME: [0, 10], VT: [1, 9], NH: [1, 10],
    WA: [2, 0], ID: [2, 1], MT: [2, 2], ND: [2, 3], MN: [2, 4], IL: [2, 5], WI: [2, 6], MI: [2, 7], NY: [2, 8], RI: [2, 9], MA: [2, 10],
    OR: [3, 0], NV: [3, 1], WY: [3, 2], SD: [3, 3], IA: [3, 4], IN: [3, 5], OH: [3, 6], PA: [3, 7], NJ: [3, 8], CT: [3, 9],
    CA: [4, 0], UT: [4, 1], CO: [4, 2], NE: [4, 3], MO: [4, 4], KY: [4, 5], WV: [4, 6], VA: [4, 7], MD: [4, 8], DE: [4, 9],
    AZ: [5, 1], NM: [5, 2], KS: [5, 3], AR: [5, 4], TN: [5, 5], NC: [5, 6], SC: [5, 7], DC: [5, 8],
    OK: [6, 3], LA: [6, 4], MS: [6, 5], AL: [6, 6], GA: [6, 7],
    HI: [7, 0], TX: [7, 3], FL: [7, 8],
  },
};

// "now" (already required for current graduates), "soon" (a future graduating class), or "none".
function statePfStatus(s) { return s.since || s.adopted ? "now" : s.starts ? "soon" : "none"; }
