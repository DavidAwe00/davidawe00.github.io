// U.S. federal tax figures for 2026 and 2027.
// Brackets & standard deduction: IRS, tax year 2026 inflation adjustments (Rev. Proc. 2025-32) and
// tax year 2027 inflation adjustments (Rev. Proc. 2026-35, IR-2026-133, Nov. 5, 2026).
// FICA: Social Security 6.2% up to the wage base ($184,500 in 2026, $192,300 in 2027; SSA); Medicare 1.45% on all wages,
// plus 0.9% Additional Medicare Tax withheld on wages over $200,000 (IRS Form 8959 / Topic 751).
const TAX_2026 = {
  year: 2026,
  stdDed: { single: 16100, mfj: 32200 },
  // [taxable income "over", rate]
  brackets: {
    single: [[0, 0.10], [12400, 0.12], [50400, 0.22], [105700, 0.24], [201775, 0.32], [256225, 0.35], [640600, 0.37]],
    mfj: [[0, 0.10], [24800, 0.12], [100800, 0.22], [211400, 0.24], [403550, 0.32], [512450, 0.35], [768700, 0.37]],
  },
  fica: { ssRate: 0.062, ssWageBase: 184500, medicare: 0.0145, addlMedicare: 0.009, addlThreshold: 200000 },
  rothPhaseout: { single: [153000, 168000], mfj: [242000, 252000] }, // IRS Notice 2025-67
};

// 2027 Roth IRA phase-outs come in the IRS retirement-limits notice (not out yet), so 2026's are kept.
const TAX_2027 = {
  year: 2027,
  stdDed: { single: 16600, mfj: 33200 },
  brackets: {
    single: [[0, 0.10], [12800, 0.12], [52025, 0.22], [109125, 0.24], [208325, 0.32], [264550, 0.35], [661375, 0.37]],
    mfj: [[0, 0.10], [25600, 0.12], [104050, 0.22], [218250, 0.24], [416650, 0.32], [529100, 0.35], [793650, 0.37]],
  },
  fica: { ...TAX_2026.fica, ssWageBase: 192300 },
  rothPhaseout: TAX_2026.rothPhaseout,
};

const TAX_YEARS = { 2026: TAX_2026, 2027: TAX_2027 };
// The year paychecks are using today; new years' figures are switched on here once they're added above.
const TAX_YEAR_NOW = Math.min(2027, Math.max(2026, new Date().getFullYear()));

// Federal income tax on gross income after the standard deduction. Returns per-bracket detail.
function federalTax(status, income, year = 2026) {
  const T = TAX_YEARS[year] || TAX_2026;
  const taxable = Math.max(0, income - T.stdDed[status]);
  const b = T.brackets[status];
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
