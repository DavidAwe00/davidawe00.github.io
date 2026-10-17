// Careers that don't require a 4-year degree. Median annual pay, May 2025.
// Source: U.S. Bureau of Labor Statistics, Occupational Outlook Handbook (bls.gov/ooh), accessed Oct 2026.
// path = typical entry route; "Apprenticeship" means you're usually paid while you train.
const CAREERS = [
  { name: "Elevator & escalator installer", pay: 109910, edu: "High school diploma", path: "Apprenticeship (~4 yrs)", emoji: "🛗" },
  { name: "Radiation therapist", pay: 105310, edu: "Associate's degree", path: "2-yr program", emoji: "☢️" },
  { name: "Nuclear medicine technologist", pay: 101370, edu: "Associate's degree", path: "2-yr program", emoji: "🧪" },
  { name: "Dental hygienist", pay: 98100, edu: "Associate's degree", path: "2–3-yr program", emoji: "🦷" },
  { name: "Diagnostic medical sonographer", pay: 96590, edu: "Associate's degree", path: "2-yr program", emoji: "🩻" },
  { name: "Power-line installer & repairer", pay: 95320, edu: "High school diploma", path: "Apprenticeship / on-the-job", emoji: "⚡" },
  { name: "Respiratory therapist", pay: 82280, edu: "Associate's degree", path: "2-yr program", emoji: "🫁" },
  { name: "Radiologic & MRI technologist", pay: 81390, edu: "Associate's degree", path: "2-yr program", emoji: "🧲" },
  { name: "Aircraft & avionics mechanic", pay: 80180, edu: "Postsecondary certificate", path: "FAA-approved school", emoji: "✈️" },
  { name: "Licensed practical nurse (LPN)", pay: 64400, edu: "Postsecondary certificate", path: "~1-yr program", emoji: "🩺" },
  { name: "Wind turbine technician", pay: 64120, edu: "Postsecondary certificate", path: "Technical school", emoji: "🌬️" },
  { name: "Plumber / pipefitter", pay: 63800, edu: "High school diploma", path: "Apprenticeship (4–5 yrs)", emoji: "🔧" },
  { name: "Electrician", pay: 63190, edu: "High school diploma", path: "Apprenticeship (4–5 yrs)", emoji: "💡" },
  { name: "HVAC mechanic & installer", pay: 61010, edu: "Postsecondary certificate", path: "6-mo–2-yr program", emoji: "❄️" },
  { name: "Carpenter", pay: 60580, edu: "High school diploma", path: "Apprenticeship", emoji: "🪚" },
];

// Benchmarks (BLS Current Population Survey, 2024, full-time workers age 25+).
const EDU_EARNINGS = {
  source: "U.S. Bureau of Labor Statistics, Education pays, 2024",
  weekly: { "Less than high school": 738, "High school diploma": 930, "Some college, no degree": 1020, "Associate's degree": 1099, "Bachelor's degree": 1543, "Master's degree": 1840, "Doctoral degree": 2278 },
  unemployment: { "Less than high school": 6.2, "High school diploma": 4.2, "Some college, no degree": 3.8, "Associate's degree": 2.8, "Bachelor's degree": 2.5, "Master's degree": 2.2, "Doctoral degree": 1.2 },
};

// Average published tuition & fees, 2025-26 (College Board, Trends in College Pricing 2025).
const TUITION = {
  cc: { label: "Community college (in-district)", perYear: 4150 },
  instate: { label: "Public 4-year, in-state", perYear: 11950 },
  outstate: { label: "Public 4-year, out-of-state", perYear: 31880 },
  private: { label: "Private nonprofit 4-year", perYear: 45000 },
};
const FED_LOAN_RATE = 0.0652; // Undergraduate Direct Loans first disbursed Jul 1 2026 – Jun 30 2027 (FSA notice GENERAL-26-33)
const HS_WAGE_22_27 = 40000;  // NY Fed: median wage, high-school-only workers aged 22–27, 2025
