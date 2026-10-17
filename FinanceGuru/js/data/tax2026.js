// U.S. federal tax figures for 2026.
// Brackets & standard deduction: IRS, tax year 2026 inflation adjustments (Rev. Proc. 2025-32).
// FICA: Social Security 6.2% up to the 2026 wage base of $184,500 (SSA); Medicare 1.45% on all wages,
// plus 0.9% Additional Medicare Tax withheld on wages over $200,000 (IRS Form 8959 / Topic 751).
const TAX_2026 = {
  stdDed: { single: 16100, mfj: 32200 },
  // [taxable income "over", rate]
  brackets: {
    single: [[0, 0.10], [12400, 0.12], [50400, 0.22], [105700, 0.24], [201775, 0.32], [256225, 0.35], [640600, 0.37]],
    mfj: [[0, 0.10], [24800, 0.12], [100800, 0.22], [211400, 0.24], [403550, 0.32], [512450, 0.35], [768700, 0.37]],
  },
  fica: { ssRate: 0.062, ssWageBase: 184500, medicare: 0.0145, addlMedicare: 0.009, addlThreshold: 200000 },
  rothPhaseout: { single: [153000, 168000], mfj: [242000, 252000] }, // IRS Notice 2025-67
};

// Federal income tax on gross income after the standard deduction. Returns per-bracket detail.
function federalTax(status, income) {
  const taxable = Math.max(0, income - TAX_2026.stdDed[status]);
  const b = TAX_2026.brackets[status];
  let tax = 0, marginal = b[0][1];
  const parts = b.map(([lo, rate], i) => {
    const hi = b[i + 1] ? b[i + 1][0] : Infinity;
    const inBucket = Math.max(0, Math.min(taxable, hi) - lo);
    if (inBucket > 0) marginal = rate;
    tax += inBucket * rate;
    return { lo, hi, rate, inBucket, tax: inBucket * rate };
  });
  return { taxable, tax, marginal, parts };
}
