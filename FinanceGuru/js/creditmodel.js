// Illustrative credit score model shared by the Credit hub and the Credit Score Quest game.
// Category weights follow myFICO's published importance (35/30/15/10/10). The factor scores are a
// teaching approximation — FICO's real formula is proprietary, so this is NOT anyone's actual score.
const CREDIT_MODEL = (() => {
  const FACTORS = [
    { key: "pay", name: "Payment history", w: 0.35 },
    { key: "util", name: "Amounts owed (utilization)", w: 0.30 },
    { key: "age", name: "Length of credit history", w: 0.15 },
    { key: "new", name: "New credit", w: 0.10 },
    { key: "mix", name: "Credit mix", w: 0.10 },
  ];
  const TIERS = [[300, "Poor"], [580, "Fair"], [670, "Good"], [740, "Very good"], [800, "Exceptional"]];

  // late: weighted count of late payments (recent ones count fully), util: 0–100 (%),
  // age: average account age in years, inq: applications in the last year, mix: types of credit (0–3).
  function factors({ late, util, age, inq, mix }) {
    return {
      pay: Math.max(0, 1 - late * 0.18),
      util: util <= 9 ? 1 : Math.max(0, 1 - (util - 9) / 91),
      age: Math.min(1, Math.max(0.1, age / 15)),
      new: Math.max(0, 1 - inq * 0.15),
      mix: [0.3, 0.7, 0.9, 1][Math.max(0, Math.min(3, mix))],
    };
  }
  function score(inputs) {
    const f = factors(inputs);
    return { score: Math.round(300 + 550 * FACTORS.reduce((t, x) => t + x.w * f[x.key], 0)), f };
  }
  const tier = (s) => [...TIERS].reverse().find(([min]) => s >= min)[1];
  return { FACTORS, TIERS, factors, score, tier };
})();
