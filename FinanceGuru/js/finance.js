// Shared deterministic calculations. Used by the browser and the coaching server.
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FinancePlan = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  class InputError extends Error { constructor(message) { super(message); this.status = 400; } }
  const FREQUENCIES = { weekly: { base: 4, annual: 52 }, biweekly: { base: 2, annual: 26 }, semimonthly: { base: 2, annual: 24 }, monthly: { base: 1, annual: 12 } };
  const money = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
  function amount(value, label, max = 1000000) {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max) throw new InputError(`${label} must be a number between 0 and ${max}.`);
    return money(value);
  }
  function validate(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new InputError('Enter your paycheck and monthly costs.');
    if (!Object.hasOwn(FREQUENCIES, raw.frequency)) throw new InputError('Choose a pay frequency.');
    const takeHome = amount(raw.takeHome, 'Take-home pay');
    if (takeHome <= 0) throw new InputError('Take-home pay must be greater than zero.');
    if (!raw.expenses || typeof raw.expenses !== 'object') throw new InputError('Enter your monthly expenses.');
    const expenses = {};
    for (const key of ['housing', 'utilities', 'food', 'transport', 'other', 'wants']) expenses[key] = amount(raw.expenses[key], key);
    if (!Array.isArray(raw.debts) || raw.debts.length > 10) throw new InputError('Enter up to ten debts.');
    const debts = raw.debts.map((d, i) => {
      if (!d || typeof d.name !== 'string' || !d.name.trim() || d.name.length > 60) throw new InputError(`Give debt ${i + 1} a name (up to 60 characters).`);
      return { name: d.name.trim(), balance: amount(d.balance, 'Debt balance'), apr: amount(d.apr, 'APR', 1000), min: amount(d.min, 'Minimum payment') };
    });
    if (!['buffer', 'move', 'debt'].includes(raw.goal)) throw new InputError('Choose a goal.');
    if (raw.goal === 'debt' && !debts.some((d) => d.balance > 0)) throw new InputError('Add a debt with a balance, or choose a savings goal.');
    const months = amount(raw.targetMonths, 'Goal timeline', 120);
    if (months < 1 || !Number.isInteger(raw.targetMonths)) throw new InputError('Goal timeline must be 1–120 whole months.');
    return { takeHome, frequency: raw.frequency, expenses, debts, goal: raw.goal, saved: amount(raw.saved, 'Current goal savings'), target: amount(raw.target, 'Savings target'), targetMonths: months };
  }
  function debtPayoff(debts, extra = 0, strategy = 'avalanche') {
    if (!Array.isArray(debts) || debts.length > 10 || !['avalanche', 'snowball'].includes(strategy)) throw new InputError('Choose a valid debt strategy and up to ten debts.');
    const ds = debts.map((d, i) => ({ name: String(d.name || `Debt ${i + 1}`), balance: amount(d.balance, 'Debt balance'), apr: amount(d.apr, 'APR', 1000), min: amount(d.min, 'Minimum payment'), id: i })).filter((d) => d.balance > 0);
    const payment = money(ds.reduce((s, d) => s + d.min, 0) + amount(extra, 'Extra payment', 10000000));
    let months = 0, interest = 0;
    const paid = new Set(), order = [];
    const sorted = [...ds].sort(strategy === 'snowball' ? (a, b) => a.balance - b.balance : (a, b) => b.apr - a.apr);
    while (ds.some((d) => d.balance > 0) && months < 600) {
      months++;
      for (const d of ds) { const fee = money(d.balance * d.apr / 1200); d.balance = money(d.balance + fee); interest = money(interest + fee); }
      if (interest > 1000000000 || ds.some((d) => d.balance > 1000000000)) return { months: null, interest: null, order, stuck: true };
      let left = payment;
      for (const d of ds) { const p = Math.min(d.min, d.balance, left); d.balance = money(d.balance - p); left = money(left - p); }
      for (const d of sorted) { const p = Math.min(d.balance, left); d.balance = money(d.balance - p); left = money(left - p); }
      for (const d of ds) if (d.balance === 0 && !paid.has(d.id)) { paid.add(d.id); order.push(d.name); }
    }
    const stuck = ds.some((d) => d.balance > 0);
    return { months: stuck ? null : months, interest: stuck ? null : interest, order, stuck };
  }
  function plan(raw) {
    const profile = validate(raw), f = FREQUENCIES[profile.frequency];
    const monthlyIncome = money(profile.takeHome * f.base);
    const averageMonthlyIncome = money(profile.takeHome * f.annual / 12);
    const needs = money(['housing', 'utilities', 'food', 'transport', 'other'].reduce((s, k) => s + profile.expenses[k], 0));
    const debtMinimums = money(profile.debts.filter((d) => d.balance > 0).reduce((s, d) => s + d.min, 0));
    const outgo = money(needs + debtMinimums + profile.expenses.wants);
    const surplus = money(monthlyIncome - outgo);
    const available = Math.max(0, surplus), gap = money(Math.max(0, profile.target - profile.saved));
    const goalMonthly = profile.goal === 'debt' ? available : money(Math.min(available, gap / profile.targetMonths));
    const flex = money(available - goalMonthly);
    // Cents are balanced against the paycheck rather than independently rounded shares.
    const bills = money((needs + debtMinimums) / f.base), wants = money(profile.expenses.wants / f.base), goal = money(goalMonthly / f.base);
    const remaining = money(profile.takeHome - bills - wants - goal);
    const extraDebt = profile.goal === 'debt' ? available : 0;
    const avalanche = debtPayoff(profile.debts, extraDebt), snowball = debtPayoff(profile.debts, extraDebt, 'snowball');
    const actions = [];
    if (surplus < 0) actions.push({ id: 'close-gap', title: 'Close the monthly gap', detail: 'Review flexible spending and essential bills before adding a new savings commitment.', lesson: 'budgeting' });
    else actions.push({ id: 'reserve-bills', title: 'Reserve your bill money', detail: 'Check bill due dates against payday. Keep enough cash available for bills due before the next paycheck.', lesson: 'budgeting' });
    if (profile.goal === 'debt') actions.push({ id: 'debt-terms', title: 'Confirm your debt terms', detail: 'Check minimums, promotional-rate end dates, and penalties before choosing a payoff approach.', lesson: 'debt' });
    else actions.push({ id: 'goal-transfer', title: surplus <= 0 ? 'Revisit your savings timeline' : 'Choose your savings transfer', detail: surplus <= 0 ? 'There is no new savings allocation in this plan yet. Review the target and timeline after covering essential costs.' : 'Confirm the amount fits your bills, then set up the transfer yourself with your bank.', lesson: 'emergency-fund' });
    actions.push({ id: 'check-in', title: 'Come back after one week', detail: 'Record what you spent and saved. Adjust the plan when your circumstances change.', lesson: 'budgeting' });
    return { version: 1, profile, monthlyIncome, averageMonthlyIncome, needs, debtMinimums, outgo, surplus, goalMonthly, flex, goalGap: gap,
      goalMonthsAtCapacity: gap === 0 ? 0 : available > 0 ? Math.ceil(gap / available) : null,
      timelineFeasible: profile.goal === 'debt' ? avalanche.months !== null && avalanche.months <= profile.targetMonths : gap === 0 || available * profile.targetMonths >= gap,
      perPaycheck: { bills, wants, goal, remaining }, avalanche, snowball, actions,
      assumptions: ['Amounts are in US dollars. Income is take-home pay; no additional tax estimate is deducted.',
        `The base month uses ${f.base} paychecks. Extra-paycheck months are not committed to recurring bills.`,
        'Monthly spending includes all recurring costs, irregular-cost reserves, and debt minimums entered. Bill due dates still need to be checked.',
        'Debt estimates assume fixed APRs, monthly interest, unchanged total payments, and no new borrowing or fees.'],
    };
  }
  function checkIn(raw, currentPlan) {
    if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw.weekEnding) || !Number.isFinite(Date.parse(raw.weekEnding)) || new Date(raw.weekEnding).toISOString().slice(0, 10) !== raw.weekEnding) throw new InputError('Choose a valid check-in date.');
    const spending = amount(raw.spending, 'Weekly spending'), saved = amount(raw.saved, 'Weekly goal contribution');
    const plannedSpending = money(currentPlan.outgo * 12 / 52), plannedGoal = money(currentPlan.goalMonthly * 12 / 52);
    if (!Array.isArray(raw.completed) || raw.completed.some((id) => !currentPlan.actions.some((a) => a.id === id))) throw new InputError('Choose actions from your plan.');
    return { weekEnding: raw.weekEnding, spending, saved, completed: [...new Set(raw.completed)], plannedSpending, plannedGoal,
      spendingDifference: money(spending - plannedSpending), goalDifference: money(saved - plannedGoal),
      note: 'Weekly targets are monthly amounts × 12 ÷ 52. Bills may be uneven from week to week; review several weeks before changing your plan.' };
  }
  return { FREQUENCIES, money, validate, plan, debtPayoff, checkIn };
});
