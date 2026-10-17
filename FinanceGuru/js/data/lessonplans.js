// Classroom + family guides for each lesson in js/lessons.js (keyed by lesson id).
// `areas` map to the six topic areas of the 2021 National Standards for Personal Financial
// Education (Council for Economic Education & Jump$tart Coalition):
// https://www.councilforeconed.org/new-national-standards-for-personal-financial-education/
const STANDARD_AREAS = ["Earning Income", "Spending", "Saving", "Investing", "Managing Credit", "Managing Risk"];

const PLANS = {
  budgeting: {
    areas: ["Spending", "Saving"],
    objectives: ["Sort expenses into needs, wants, and savings", "Apply the 50/30/20 guideline to a take-home paycheck", "Explain why “pay yourself first” works"],
    warmup: "List three things you spent money on (or wanted to) this week. Is each one a need or a want? Be ready to defend one.",
    activity: {
      title: "Envelope Budget + Budget Planner",
      links: [["Envelope Budget game", "play.html#envelope"], ["Budget Planner", "tools.html#budget"]],
      steps: ["Students play Envelope Budget once and record their star rating.", "In pairs, open the Budget Planner with a $3,000/month take-home pay and adjust the sliders until savings hits 20%.", "Each pair names one “want” they would cut first and one “need” that surprised them."],
    },
    discuss: ["Is a phone a need or a want? Does the answer change by job or age?", "Why does saving first beat saving “whatever is left”?"],
    home: { talk: ["What's one bill our family pays every month that you didn't know about?", "If you got $100 tomorrow, how would you split it between needs, wants, and savings?"], try: "Track every purchase for one week together, then sort the list into needs and wants." },
  },
  "emergency-fund": {
    areas: ["Saving", "Managing Risk"],
    objectives: ["Explain what an emergency fund is for", "Calculate a 3–6 month savings target from monthly expenses", "Choose a safe, accessible place to keep it"],
    warmup: "Your car needs a $600 repair next week. Write down three ways you could pay for it, then rank them from best to worst.",
    activity: {
      title: "Emergency Fund calculator + Payday",
      links: [["Emergency Fund calculator", "tools.html#emergency"], ["Payday life sim", "play.html#life"]],
      steps: ["With $2,200 of monthly expenses and $150 saved per month, students estimate by hand how long a 3-month fund takes.", "Check the answer in the Emergency Fund calculator, then try $250/month.", "Play Payday and note every surprise expense the game throws at you."],
    },
    discuss: ["What counts as a real emergency? Is a concert ticket sale one?", "Why is a credit card a risky emergency fund?"],
    home: { talk: ["Has our family ever had a surprise expense? How did we handle it?", "Where would you keep money you might need tomorrow?"], try: "Pick a starter goal (like $500) and set up an automatic transfer or a jar to reach it." },
  },
  debt: {
    areas: ["Managing Credit"],
    objectives: ["Define APR and explain how interest makes borrowing cost more", "Compare the avalanche and snowball payoff methods", "Tell the difference between debt that can build wealth and debt that drains it"],
    warmup: "You borrow $1,000 and pay back $1,200. What did the extra $200 buy you?",
    activity: {
      title: "Debt Payoff race",
      links: [["Debt Payoff tool", "tools.html#debt"], ["Minimum-payment trap", "credit.html#cards"]],
      steps: ["Enter two debts in the Debt Payoff tool: a $2,000 card at 24% and a $500 store card at 18%.", "Compare total interest and payoff time for avalanche vs snowball.", "In the minimum-payment trap, see how long a balance lasts paying only the minimum."],
    },
    discuss: ["When would you pick snowball even though avalanche saves more?", "Is a student loan “good debt”? What would make it bad?"],
    home: { talk: ["What's something people commonly borrow money for? Was it worth it?", "How would you feel paying 24% interest on a purchase?"], try: "Look at a credit card offer that came in the mail together and find the APR and fees." },
  },
  "compound-interest": {
    areas: ["Saving", "Investing"],
    objectives: ["Explain how interest earns interest", "Use the Rule of 72 to estimate doubling time", "Show why starting early matters more than starting big"],
    warmup: "Would you rather have $1 million today, or a penny that doubles every day for 30 days? Guess first, then check.",
    activity: {
      title: "Start at 16 vs start at 26",
      links: [["Compound Growth calculator", "tools.html#compound"]],
      steps: ["Student A invests $100/month from 16 to 65; Student B from 26 to 65. Use 7% for both.", "Record the final balance and total contributed for each.", "Rule of 72 drill: how long to double at 4%, 6%, 9%, 12%?"],
    },
    discuss: ["What's the cost of waiting ten years, in dollars?", "Compounding also works on debt. Where would that hurt you?"],
    home: { talk: ["If you started saving $20 a week now, what could it become?", "What's something worth waiting for instead of buying now?"], try: "Open the Compound Growth calculator together and plug in a real savings goal." },
  },
  credit: {
    areas: ["Managing Credit"],
    objectives: ["Describe what a credit score measures and who uses it", "Rank the factors that move a score", "List habits that build credit safely"],
    warmup: "Landlords, insurers, and some employers can check your credit. Why do you think they care?",
    activity: {
      title: "Credit Score Quest",
      links: [["Credit Score Quest game", "play.html#credit"], ["Credit score simulator", "credit.html#score"]],
      steps: ["Students play Credit Score Quest and record their final score.", "Share one choice that helped and one that hurt.", "In the simulator, find the change that moves the score the most."],
    },
    discuss: ["Why might closing your oldest card hurt your score?", "Should you co-sign a loan for a friend? What's the risk?"],
    home: { talk: ["How do you check a credit report for free?", "What's one credit mistake you wish someone had warned you about?"], try: "Visit AnnualCreditReport.com together (the official free site) and see what a report includes." },
  },
  investing: {
    areas: ["Investing"],
    objectives: ["Explain the difference between saving and investing", "Describe what an index fund is", "Explain why fees and employer matches matter"],
    warmup: "If you had $1,000 to grow over 40 years, would you pick one company's stock or a little of 500 companies? Why?",
    activity: {
      title: "Market Rollercoaster + fees",
      links: [["Market Rollercoaster game", "play.html#market"], ["Fee calculator", "invest.html#fees"]],
      steps: ["Play Market Rollercoaster: hold or sell through real market history. Record whether you sold during a crash.", "In the fee calculator, compare a 0.05% index fund with a 1% fund over 40 years.", "Write one sentence: what did selling in a crash cost you?"],
    },
    discuss: ["Why is money you need in 6 months a bad fit for stocks?", "Why is a 401(k) match called “free money”?"],
    home: { talk: ["Do you know anyone who invests? What do they invest in?", "Would you rather buy a company's product or own part of the company?"], try: "Look up what an S&P 500 index fund holds and name five companies in it you recognize." },
  },
  inflation: {
    areas: ["Spending", "Investing"],
    objectives: ["Define inflation and the Consumer Price Index", "Estimate how inflation shrinks buying power", "Compare how cash, bonds, and stocks kept up over time"],
    warmup: "Guess what a gallon of gas, a dozen eggs, and a movie ticket cost when your grandparents were your age.",
    activity: {
      title: "Price Time Machine",
      links: [["Price Time Machine game", "play.html#prices"], ["Inflation calculator", "invest.html#inflation"]],
      steps: ["Play Price Time Machine and record your score.", "In the inflation calculator, find what $20 from the year you were born is worth today.", "Toggle “after inflation” on the asset cards and compare cash with stocks."],
    },
    discuss: ["If your pay rises 2% and prices rise 3%, did you get a raise?", "Why is keeping all your savings in cash risky over decades?"],
    home: { talk: ["What's something that cost a lot less when you were a kid?", "How could our family spot prices creeping up?"], try: "Save a grocery receipt and compare the same items in six months." },
  },
  "risk-time": {
    areas: ["Investing", "Managing Risk"],
    objectives: ["Explain how holding time changes investment risk", "Define diversification", "Recognize emotional mistakes like panic selling"],
    warmup: "Is a roller coaster dangerous if you stay buckled in until the end? How is that like the stock market?",
    activity: {
      title: "Time machine + portfolio dial",
      links: [["Investing time machine", "invest.html#time"], ["Portfolio dial", "invest.html#portfolio"]],
      steps: ["In the time machine, start investing in 2000 and again in 2008. Note how far each fell and how many years it took to recover.", "Move the portfolio dial from 100% stocks to 60/40 and note the change in the worst single year.", "Groups pick a mix for a 16-year-old, a 40-year-old, and a 70-year-old."],
    },
    discuss: ["Why might the biggest risk be the investor, not the market?", "What would make you sell during a crash? How could you stop yourself?"],
    home: { talk: ["How do you react when something you own drops in value?", "Why not put all your money in one thing?"], try: "Take the risk quiz on the Invest page together and compare your answers." },
  },
  "retirement-accounts": {
    areas: ["Investing", "Earning Income"],
    objectives: ["Explain that an account is a container for investments", "Compare 401(k), traditional IRA, and Roth IRA", "Decide when Roth vs traditional makes sense"],
    warmup: "Would you rather pay taxes on seeds or on the harvest? Explain your choice.",
    activity: {
      title: "Roth vs Traditional",
      links: [["Roth vs Traditional tool", "tools.html#roth"], ["Account comparison", "invest.html#accounts"]],
      steps: ["Use the Roth vs Traditional tool with a $40,000 salary today and a higher retirement income.", "Repeat with a $120,000 salary. Which account wins each time, and why?", "Fill in a 3-column chart: who can open it, the 2026 limit, and when you're taxed."],
    },
    discuss: ["Why is getting a full employer match usually step one?", "Why is a Roth IRA often a great first account for teens with a job?"],
    home: { talk: ["Does anyone in our family have a 401(k) or IRA? What's it invested in?", "When do you think you'll want to retire, and what will you need?"], try: "If you have a job, look up how a custodial Roth IRA works." },
  },
  "college-roi": {
    areas: ["Earning Income"],
    objectives: ["Compare typical earnings by education level", "Explain why both major and cost drive the return on college", "Explore paths that don't require a four-year degree"],
    warmup: "Name a job you might want. Guess its pay and how much school it takes.",
    activity: {
      title: "ROI calculator + Career Explorer",
      links: [["College ROI calculator", "college.html#roi"], ["Career Explorer", "college.html#explorer"], ["Salary Showdown game", "play.html#salary"]],
      steps: ["Each student checks the job from the warm-up in the Career Explorer. How close was the guess?", "Run the ROI calculator for two majors at the same school cost and find each breakeven age.", "Warm down with a round of Salary Showdown."],
    },
    discuss: ["When does college clearly pay off, and when is it a gamble?", "How can you cut the cost of a degree?"],
    home: { talk: ["What did you study (or not), and how did it shape your work?", "What careers are you curious about?"], try: "Look up one college's net price calculator together and compare it with the sticker price." },
  },
  "taxes-101": {
    areas: ["Earning Income"],
    objectives: ["Explain how tax brackets work (only income above a line pays the higher rate)", "Read a paycheck: gross pay, taxes, FICA, net pay", "Fill in the main parts of a W-4"],
    warmup: "True or false: a raise can push you into a higher bracket and lower your take-home pay. Vote, then we'll find out.",
    activity: {
      title: "Paycheck breakdown",
      links: [["Tax bracket buckets", "taxes.html#brackets"], ["Paycheck calculator", "taxes.html#paycheck"], ["W-4 walkthrough", "taxes.html#w4"]],
      steps: ["In the bracket buckets, watch which dollars get taxed at 22% after a raise.", "A part-time job pays $15/hour for 20 hours a week (about $15,600 a year). Enter it in the paycheck calculator for your state. What's the take-home?", "Walk through the W-4 steps for a first job."],
    },
    discuss: ["Why was the raise myth wrong?", "What do Social Security and Medicare taxes pay for?"],
    home: { talk: ["Did your first paycheck surprise you? What came out of it?", "Why do people get tax refunds?"], try: "Look at a real (or sample) pay stub together and find gross pay, FICA, and net pay." },
  },
  "rent-vs-buy": {
    areas: ["Spending", "Managing Credit"],
    objectives: ["Explain how a mortgage payment splits between principal and interest", "List the costs of owning beyond the mortgage", "Explain why time is the key factor in rent vs buy"],
    warmup: "Renters are “throwing money away.” Agree or disagree? Write one reason.",
    activity: {
      title: "Mortgage + rent vs buy",
      links: [["Mortgage calculator", "housing.html#mortgage"], ["Rent vs Buy", "housing.html#rentbuy"], ["True cost of owning", "housing.html#costs"]],
      steps: ["In the mortgage calculator, find how much of year 1's payments go to interest.", "Change the down payment to 20% and watch PMI disappear.", "In Rent vs Buy, find how many years you'd need to stay for buying to come out ahead."],
    },
    discuss: ["Which hidden costs of owning surprised you?", "When does renting make more sense?"],
    home: { talk: ["What do we pay for housing, and what else comes with it?", "Would you rather rent or own at 25? Why?"], try: "Pick a real home listing together and run it through the mortgage calculator." },
  },
  "student-loans-2026": {
    areas: ["Managing Credit", "Earning Income"],
    objectives: ["Describe the two repayment plans for new federal loans (RAP and Tiered Standard)", "Explain how RAP payments are based on income", "Plan to borrow no more than expected first-year pay"],
    warmup: "If you borrowed $30,000 for college, how long do you think it would take to pay back?",
    activity: {
      title: "RAP vs Tiered Standard",
      links: [["Student loan comparison", "credit.html#student"]],
      steps: ["Enter $30,000 borrowed and a $45,000 starting salary. Compare monthly payments and total paid on both plans.", "Change the salary to $30,000, then $70,000. Which plan wins at each?", "Check: is the total borrowed less than the expected first-year salary?"],
    },
    discuss: ["Why does the plan with the lowest payment sometimes cost the most?", "How can you borrow less in the first place?"],
    home: { talk: ["How are we planning to pay for school after high school?", "What do you think a 'reasonable' amount to borrow is?"], try: "Use the comparison tool with the starting salary of a career you're considering." },
  },
};
