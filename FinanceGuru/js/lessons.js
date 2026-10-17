// Lesson content. Each lesson = a few short "cards" of reading, then a quiz.
// To add a lesson, append an object here — the Learn page and homepage pick it up automatically.
const LESSONS = [
  {
    id: "budgeting",
    icon: "🧾",
    title: "Budgeting Basics",
    summary: "Tell your money where to go instead of wondering where it went.",
    minutes: 4,
    cards: [
      {
        heading: "What a budget really is",
        html: `<p>A budget isn't a punishment. It's a <strong>plan for your money</strong> made <em>before</em> you spend it.</p>
               <p>Without a plan, money tends to leak away on small things. With one, you decide what matters most to you — and fund that first.</p>`,
      },
      {
        heading: "The 50/30/20 rule",
        html: `<p>A simple starting point for your take-home (after-tax) pay:</p>
               <ul>
                 <li><strong>50% Needs</strong> — rent, groceries, utilities, insurance, minimum debt payments.</li>
                 <li><strong>30% Wants</strong> — eating out, streaming, hobbies, travel.</li>
                 <li><strong>20% Savings & extra debt payments</strong> — your future self.</li>
               </ul>
               <p class="small muted">The 50/30/20 guideline was popularized by Elizabeth Warren and Amelia Warren Tyagi in <em>All Your Worth</em> (2005).</p>
               <div class="callout"><strong>Try it:</strong> the <a href="tools.html#budget">Budget Planner</a> splits your income for you — or practice in the <a href="play.html#envelope">Envelope Budget game</a>.</div>`,
      },
      {
        heading: "Pay yourself first",
        html: `<p>The most powerful budgeting habit: <strong>move money to savings the day you get paid</strong>, automatically. Then spend what's left.</p>
               <p>If you wait to save "whatever is left over," there usually isn't anything left over.</p>`,
      },
    ],
    quiz: [
      {
        q: "In the 50/30/20 rule, what does the 20% go toward?",
        choices: ["Wants like dining out", "Savings and extra debt payments", "Rent and groceries", "Taxes"],
        answer: 1,
        why: "The 20% is for your future: savings, investing, and paying debt down faster than the minimum.",
      },
      {
        q: "Which is a 'need' rather than a 'want'?",
        choices: ["A streaming subscription", "A new phone upgrade", "Electricity bill", "Concert tickets"],
        answer: 2,
        why: "Utilities like electricity are essential. The others are nice-to-haves.",
      },
      {
        q: "What does 'pay yourself first' mean?",
        choices: [
          "Buy something fun every payday",
          "Save automatically as soon as you're paid, before spending",
          "Pay your bills before your rent",
          "Ask for a raise",
        ],
        answer: 1,
        why: "Saving first makes it automatic, so it actually happens.",
      },
    ],
  },
  {
    id: "emergency-fund",
    icon: "🛟",
    title: "Your Emergency Fund",
    summary: "The cushion that stops a bad week from becoming a bad year.",
    minutes: 3,
    cards: [
      {
        heading: "Why you need one",
        html: `<p>Cars break. Jobs end. Teeth crack. An <strong>emergency fund</strong> is cash set aside only for surprises like these.</p>
               <p>Without it, emergencies go on a credit card — and high interest turns a $1,000 problem into a $1,300 one.</p>`,
      },
      {
        heading: "How much to save",
        html: `<ul>
                 <li><strong>Starter goal:</strong> $1,000 or one month of expenses.</li>
                 <li><strong>Full goal:</strong> 3–6 months of essential expenses.</li>
                 <li>Lean toward 6+ months if your income is irregular or you support others.</li>
               </ul>
               <div class="callout"><strong>Try it:</strong> the <a href="tools.html#emergency">Emergency Fund calculator</a> finds your target.</div>`,
      },
      {
        heading: "Where to keep it",
        html: `<p>Somewhere <strong>safe and easy to reach</strong> — but not <em>too</em> easy. A high-yield savings account is ideal: it earns interest and is separate from your everyday checking.</p>
               <p>Don't invest your emergency fund in stocks. It needs to be there when the market is down, too.</p>`,
      },
    ],
    quiz: [
      {
        q: "What is a common full emergency fund target?",
        choices: ["One week of expenses", "3–6 months of essential expenses", "10 years of income", "Whatever is in your wallet"],
        answer: 1,
        why: "3–6 months covers most job losses and big surprise bills.",
      },
      {
        q: "Best place for an emergency fund?",
        choices: ["Individual stocks", "Under the mattress", "A high-yield savings account", "Cryptocurrency"],
        answer: 2,
        why: "It's safe, earns some interest, and you can get to it quickly.",
      },
      {
        q: "Why is relying on a credit card for emergencies risky?",
        choices: ["Cards don't work in emergencies", "High interest makes the emergency cost more over time", "It improves your credit too much", "There's no risk"],
        answer: 1,
        why: "Credit card APRs are often 20%+, so carrying a balance adds a lot of cost.",
      },
    ],
  },
  {
    id: "debt",
    icon: "⛓️",
    title: "Crushing Debt",
    summary: "How interest works against you — and two proven ways to fight back.",
    minutes: 5,
    cards: [
      {
        heading: "Interest: the price of borrowing",
        html: `<p>When you borrow, you pay back more than you borrowed. The extra is <strong>interest</strong>, shown as an <strong>APR</strong> (annual percentage rate).</p>
               <p>A $5,000 credit card balance at 24% APR, paying $150/month, takes about <strong>4½ years</strong> to clear and costs over <strong>$3,300 in interest</strong>. Pay only $100/month and the interest eats the whole payment — the balance <em>never</em> goes down.</p>`,
      },
      {
        heading: "Avalanche vs. Snowball",
        html: `<p>Always pay the minimum on everything. Then put every extra dollar toward one debt:</p>
               <ul>
                 <li><strong>Avalanche:</strong> highest interest rate first. Saves the most money.</li>
                 <li><strong>Snowball:</strong> smallest balance first. Quick wins keep you motivated.</li>
               </ul>
               <p>The best method is the one you'll stick with.</p>
               <div class="callout"><strong>Try it:</strong> compare both in the <a href="tools.html#debt">Debt Payoff planner</a>.</div>`,
      },
      {
        heading: "Good debt vs. bad debt",
        html: `<p>Not all debt is equal. A low-rate mortgage or a sensible student loan can build long-term value. High-interest debt for things that lose value — like credit card shopping — is the kind to eliminate fast.</p>`,
      },
    ],
    quiz: [
      {
        q: "The avalanche method pays off which debt first?",
        choices: ["The smallest balance", "The highest interest rate", "The newest debt", "The one you like least"],
        answer: 1,
        why: "Targeting the highest rate minimizes total interest paid.",
      },
      {
        q: "What's the main advantage of the snowball method?",
        choices: ["Lowest total interest", "Quick wins that build motivation", "It improves your APR", "It's required by banks"],
        answer: 1,
        why: "Clearing small balances fast gives a psychological boost.",
      },
      {
        q: "What does APR stand for?",
        choices: ["Annual Percentage Rate", "Average Payment Rule", "Account Payment Ratio", "Annual Principal Return"],
        answer: 0,
        why: "APR is the yearly cost of borrowing, expressed as a percentage.",
      },
    ],
  },
  {
    id: "compound-interest",
    icon: "📈",
    title: "The Magic of Compound Interest",
    summary: "Why starting early matters more than starting big.",
    minutes: 4,
    cards: [
      {
        heading: "Interest on your interest",
        html: `<p>Compound interest means you earn returns on your original money <em>and</em> on the returns it already earned.</p>
               <p>$1,000 growing 8% a year becomes $1,080, then $1,166, then $1,260... The growth itself keeps growing.</p>`,
      },
      {
        heading: "Time is the secret ingredient",
        html: `<p>Meet two savers, both earning 8% a year:</p>
               <ul>
                 <li><strong>Alex</strong> invests $200/month from age 25 to 35, then stops. Total put in: $24,000.</li>
                 <li><strong>Sam</strong> invests $200/month from age 35 to 65. Total put in: $72,000.</li>
               </ul>
               <p>At 65, <strong>Alex has more</strong> — about $400,000 vs Sam's ~$298,000 — despite investing a third as much. Alex's money simply had more time.</p>`,
      },
      {
        heading: "The Rule of 72",
        html: `<p>Quick mental math: divide 72 by your annual return to estimate how many years it takes to <strong>double</strong> your money.</p>
               <p>At 8%, money doubles about every <strong>9 years</strong> (72 ÷ 8). At 6%, every 12 years.</p>
               <div class="callout"><strong>Try it:</strong> watch your money grow in the <a href="tools.html#compound">Compound Growth calculator</a>.</div>`,
      },
    ],
    quiz: [
      {
        q: "Using the Rule of 72, at 9% return money doubles in about...",
        choices: ["4 years", "8 years", "12 years", "20 years"],
        answer: 1,
        why: "72 ÷ 9 = 8 years.",
      },
      {
        q: "What makes compound interest so powerful?",
        choices: ["You earn returns on past returns", "The bank adds a bonus", "It's guaranteed", "It only works with big amounts"],
        answer: 0,
        why: "Growth builds on growth, so it accelerates over time.",
      },
      {
        q: "The biggest factor you control in compounding is usually...",
        choices: ["Luck", "Time — starting early", "Picking one hot stock", "Checking your balance daily"],
        answer: 1,
        why: "The earlier you start, the more doubling periods your money gets.",
      },
    ],
  },
  {
    id: "credit",
    icon: "💳",
    title: "Understanding Credit Scores",
    summary: "The three-digit number that affects your rent, loans, and more.",
    minutes: 4,
    cards: [
      {
        heading: "What a credit score is",
        html: `<p>A credit score (in the US, usually 300–850) tells lenders how reliably you repay borrowed money. Higher scores unlock lower interest rates, easier apartment approvals, and sometimes cheaper insurance.</p>`,
      },
      {
        heading: "What moves your score",
        html: `<ul>
                 <li><strong>Payment history (~35%)</strong> — pay on time, every time.</li>
                 <li><strong>Amounts owed (~30%)</strong> — keep balances under 30% of your limits (under 10% is even better).</li>
                 <li><strong>Length of history (~15%)</strong> — older accounts help.</li>
                 <li><strong>New credit (~10%)</strong> and <strong>credit mix (~10%)</strong>.</li>
               </ul>`,
      },
      {
        heading: "Simple habits that work",
        html: `<p>Set up autopay for at least the minimum. Don't close your oldest card. Check your credit reports for free at least once a year and dispute any errors.</p>`,
      },
    ],
    quiz: [
      {
        q: "Which factor has the biggest impact on most credit scores?",
        choices: ["Your income", "Payment history", "Your age", "Number of bank accounts"],
        answer: 1,
        why: "Paying on time is about 35% of a typical FICO score.",
      },
      {
        q: "A good guideline for credit utilization is staying under...",
        choices: ["30% of your limit", "75% of your limit", "100% of your limit", "There's no guideline"],
        answer: 0,
        why: "Lower utilization signals you aren't over-reliant on credit.",
      },
      {
        q: "Why might closing your oldest credit card hurt your score?",
        choices: ["It shortens your credit history and lowers available credit", "Banks charge a fee", "It doesn't affect anything", "It increases your income"],
        answer: 0,
        why: "Older accounts and higher total limits both help your score.",
      },
    ],
  },
  {
    id: "investing",
    icon: "🌱",
    title: "Investing 101",
    summary: "Stocks, index funds, and why boring is beautiful.",
    minutes: 5,
    cards: [
      {
        heading: "What investing means",
        html: `<p>Investing is buying things you expect to grow in value or pay you income over time — like a small slice of a company (a <strong>stock</strong>) or a loan to a government or company (a <strong>bond</strong>).</p>
               <p>Investing has risk: values go up <em>and</em> down. That's why it's for money you won't need for 5+ years.</p>`,
      },
      {
        heading: "Index funds: own the whole haystack",
        html: `<p>Instead of searching for the one winning stock (the needle), an <strong>index fund</strong> buys a little of hundreds or thousands of companies at once.</p>
               <ul>
                 <li><strong>Diversified</strong> — one company failing barely matters.</li>
                 <li><strong>Low cost</strong> — fees often under 0.1% per year.</li>
                 <li><strong>Hard to beat</strong> — most professional stock pickers underperform the index over long periods.</li>
               </ul>`,
      },
      {
        heading: "Use tax-advantaged accounts",
        html: `<p>Many countries offer retirement accounts with tax perks. In the US, a <strong>401(k)</strong> through work (grab any employer match — it's free money!) and an <strong>IRA</strong> you open yourself are the big ones.</p>
               <div class="callout"><strong>Remember:</strong> this is education, not personal financial advice. Consider talking to a licensed fiduciary advisor for your specific situation.</div>`,
      },
    ],
    quiz: [
      {
        q: "What is an index fund?",
        choices: ["A single risky stock", "A fund that holds a broad slice of the market", "A savings account", "A type of loan"],
        answer: 1,
        why: "Index funds track a whole market index, spreading risk across many companies.",
      },
      {
        q: "Money you'll need in 6 months should generally be...",
        choices: ["Invested in stocks", "Kept in savings", "Put in crypto", "Lent to friends"],
        answer: 1,
        why: "Short-term money shouldn't be exposed to market swings.",
      },
      {
        q: "An employer 401(k) match is best described as...",
        choices: ["A fee", "Free money you should try to capture", "A type of tax", "A loan from your boss"],
        answer: 1,
        why: "A match is extra money added to your retirement just for contributing.",
      },
    ],
  },
  {
    id: "inflation",
    icon: "🎈",
    title: "Inflation: The Invisible Tax",
    summary: "Why a dollar buys less every year — and how to keep up.",
    minutes: 4,
    cards: [
      {
        heading: "Prices creep up",
        html: `<p><strong>Inflation</strong> is the general rise in prices over time. The U.S. tracks it with the <strong>Consumer Price Index (CPI)</strong>, which follows the cost of a big basket of everyday goods and services.</p>
               <p>Overall prices in 2025 were about <strong>3.9 times</strong> what they were in 1980. Something that cost $100 then cost roughly $390 in 2025.</p>
               <div class="callout"><strong>Try it:</strong> the <a href="invest.html#inflation">inflation calculator</a> converts any amount between 1926 and 2025.</div>`,
      },
      {
        heading: "Small numbers, big effect",
        html: `<p>From 1928 to 2025, inflation averaged about <strong>3% a year</strong>. That sounds tiny, but it cuts a dollar's buying power in half roughly every <strong>23 years</strong>.</p>
               <p>Some years are much worse: prices rose <strong>13.3% in 1979</strong> and <strong>6.5% in 2022</strong>. And during the early Great Depression, prices actually <em>fell</em> (deflation).</p>`,
      },
      {
        heading: "How to beat it",
        html: `<p>Money that just sits still loses value. After inflation, 1928–2025:</p>
               <ul>
                 <li><strong>Cash in T-bills:</strong> about <strong>+0.3%</strong> a year — barely kept up.</li>
                 <li><strong>10-year Treasury bonds:</strong> about <strong>+1.5%</strong> a year.</li>
                 <li><strong>Stocks (S&amp;P 500):</strong> about <strong>+6.8%</strong> a year.</li>
               </ul>
               <p>That's why long-term money usually belongs in investments, while cash is for emergencies and short-term goals. Higher income growth (raises, skills) is the other big inflation-fighter.</p>
               <div class="callout"><strong>Play:</strong> guess today's prices in the <a href="play.html#prices">Price Time Machine</a>.</div>`,
      },
    ],
    quiz: [
      {
        q: "What does the Consumer Price Index (CPI) measure?",
        choices: ["Stock market performance", "Changes in the prices of everyday goods and services", "Average salaries", "Interest rates"],
        answer: 1,
        why: "The CPI tracks the cost of a typical basket of goods and services, so it's the main measure of inflation.",
      },
      {
        q: "At about 3% inflation a year, a dollar's buying power halves in roughly…",
        choices: ["3 years", "10 years", "23 years", "100 years"],
        answer: 2,
        why: "Using the Rule of 72: 72 ÷ 3 ≈ 24 years. The exact figure at 3.04% is about 23.",
      },
      {
        q: "After inflation, which grew buying power the most from 1928–2025?",
        choices: ["Cash under the mattress", "Treasury bills", "Stocks", "They all did the same"],
        answer: 2,
        why: "Stocks returned about 6.8% a year after inflation; T-bills about 0.3%; cash under a mattress lost value every year prices rose.",
      },
    ],
  },
  {
    id: "risk-time",
    icon: "⏳",
    title: "Risk, Time & Diversification",
    summary: "Why stocks are scary for a year but surprisingly reliable for 20.",
    minutes: 5,
    cards: [
      {
        heading: "Risk is about time",
        html: `<p>From 1928 to 2025, U.S. stocks (the S&amp;P 500) averaged about <strong>10% a year</strong> — but lost money in <strong>26 of those 98 years</strong>. The worst year, 1931, was <strong>−43.8%</strong>.</p>
               <p>Hold for longer and the picture changes. In that same history, no 20-year period of investing in U.S. stocks ended with a loss.</p>
               <div class="callout"><strong>Try it:</strong> slide the hold time in the <a href="invest.html#portfolio">portfolio builder</a> and watch the chance of loss drop.</div>`,
      },
      {
        heading: "Diversification: don't bet on one horse",
        html: `<p>Owning one company is a gamble — it can go to zero. Owning <strong>hundreds or thousands</strong> through an index fund means no single failure can sink you.</p>
               <p>Mixing in bonds smooths the ride further. A 60% stock / 40% bond mix historically averaged about 8.3% a year, with a worst year near −27% instead of −44%.</p>`,
      },
      {
        heading: "The biggest risk: you",
        html: `<p>Markets have always recovered so far. The losses that become permanent usually happen when people <strong>panic and sell near the bottom</strong>, then miss the rebound.</p>
               <p>Pick a mix you can stick with through a crash, automate your investing, and avoid checking your balance every day.</p>
               <div class="callout"><strong>Feel it:</strong> survive two crashes in the <a href="play.html#market">Market Rollercoaster</a> game.</div>`,
      },
    ],
    quiz: [
      {
        q: "Roughly how often did U.S. stocks have a losing year from 1928–2025?",
        choices: ["Almost never", "About 1 year in 4", "Every other year", "3 years out of 4"],
        answer: 1,
        why: "26 losing years out of 98 — about one in four. Losses are normal; they're the price of higher long-term returns.",
      },
      {
        q: "What usually reduces the chance of losing money in stocks?",
        choices: ["Checking prices daily", "Holding for a longer time", "Buying one hot stock", "Selling after every drop"],
        answer: 1,
        why: "Over longer holding periods, good and bad years tend to average out.",
      },
      {
        q: "Adding bonds to a stock portfolio typically…",
        choices: ["Increases the worst-case drop", "Smooths the ride but lowers long-run growth", "Guarantees profits", "Has no effect"],
        answer: 1,
        why: "Bonds cushion crashes, at the cost of somewhat lower average returns.",
      },
    ],
  },
  {
    id: "retirement-accounts",
    icon: "🏦",
    title: "Retirement Accounts 101",
    summary: "401(k), Roth IRA, HSA — the tax-advantaged containers for your investments.",
    minutes: 5,
    cards: [
      {
        heading: "The account is the container",
        html: `<p>An account like a 401(k) or IRA isn't an investment itself — it's a <strong>container</strong> with tax perks. Inside, you choose investments, like index funds.</p>
               <p>Those perks are a big deal: over decades, avoiding taxes on growth can add up to <strong>tens or hundreds of thousands of dollars</strong>.</p>`,
      },
      {
        heading: "The big three (U.S., 2026 limits)",
        html: `<ul>
                 <li><strong>401(k)</strong> through work: up to <strong>$24,500/yr</strong>. Many employers <em>match</em> part of what you put in — that's free money.</li>
                 <li><strong>IRA</strong> you open yourself: up to <strong>$7,500/yr</strong>.</li>
                 <li><strong>HSA</strong> with a high-deductible health plan: up to <strong>$4,400</strong> (self) or <strong>$8,750</strong> (family).</li>
               </ul>
               <div class="callout"><strong>Compare all accounts:</strong> see the <a href="invest.html#accounts">account guide</a> in the Investing Hub.</div>`,
      },
      {
        heading: "Roth vs. traditional",
        html: `<p><strong>Traditional:</strong> skip taxes now, pay them when you withdraw in retirement.</p>
               <p><strong>Roth:</strong> pay taxes now, then the money grows and comes out <strong>tax-free</strong>.</p>
               <p>Rule of thumb: if you expect a <em>higher</em> tax rate later (common for young people early in their careers), Roth often wins.</p>
               <div class="callout"><strong>Try it:</strong> the <a href="tools.html#roth">Roth vs Traditional calculator</a> uses 2026 tax brackets, and the <a href="tools.html#retire">Retirement Check</a> shows if you're on track.</div>`,
      },
    ],
    quiz: [
      {
        q: "What's the 2026 contribution limit for an IRA (under age 50)?",
        choices: ["$2,000", "$7,500", "$24,500", "No limit"],
        answer: 1,
        why: "$7,500 for 2026, shared across traditional and Roth IRAs.",
      },
      {
        q: "With a Roth account, when do you pay taxes?",
        choices: ["When you withdraw in retirement", "Now, on the money you put in", "Never at all", "Every year on growth"],
        answer: 1,
        why: "You contribute after-tax money; qualified withdrawals later are tax-free.",
      },
      {
        q: "Your employer matches 401(k) contributions. What's usually the smart first move?",
        choices: ["Ignore it", "Contribute at least enough to get the full match", "Only invest in a taxable account", "Wait until you're 40"],
        answer: 1,
        why: "A match is an instant 50–100% return on your money. Grab it first.",
      },
    ],
  },
  {
    id: "college-roi",
    icon: "🎓",
    title: "Is College Worth It?",
    summary: "Think about a degree like an investment: cost, payoff, and alternatives.",
    minutes: 5,
    cards: [
      {
        heading: "On average, yes",
        html: `<p>In 2024, full-time workers with a bachelor's degree earned a median of <strong>$1,543/week (~$80,000/yr)</strong>, vs <strong>$930/week (~$48,000/yr)</strong> with only a high school diploma. Their unemployment rate was lower too: <strong>2.5% vs 4.2%</strong>.</p>
               <p>But averages hide huge differences. <em>What</em> you study and <em>what you pay</em> matter a lot.</p>`,
      },
      {
        heading: "Major matters",
        html: `<p>Among recent grads (ages 22–27), median pay ranges from about <strong>$90,000</strong> (computer engineering) and <strong>$85,000</strong> (chemical and aerospace engineering) down to around <strong>$40,000–46,000</strong> for some arts, education, and social science majors.</p>
               <p>Some majors also have high <strong>underemployment</strong> — grads working jobs that don't need a degree.</p>
               <div class="callout"><strong>Explore:</strong> compare all 73 majors in the <a href="college.html#majors">College hub</a>.</div>`,
      },
      {
        heading: "Cost matters just as much",
        html: `<p>Average 2025–26 tuition &amp; fees: <strong>$4,150</strong> at community college, <strong>$11,950</strong> in-state public, <strong>$31,880</strong> out-of-state, <strong>$45,000</strong> private (before grants).</p>
               <p>Smart moves: file the FAFSA, consider 2 years at community college, stay in-state, and try to borrow <strong>no more than your expected first-year salary</strong>. Many skilled trades and 2-year healthcare careers pay very well too.</p>
               <div class="callout"><strong>Run your numbers:</strong> the <a href="college.html#roi">Degree ROI calculator</a> finds your breakeven age.</div>`,
      },
    ],
    quiz: [
      {
        q: "Roughly what did bachelor's degree holders earn vs high school grads in 2024 (median, full-time)?",
        choices: ["About the same", "~$80K vs ~$48K per year", "~$200K vs ~$30K", "High school grads earned more"],
        answer: 1,
        why: "BLS: $1,543/week vs $930/week — roughly $80,000 vs $48,000 a year.",
      },
      {
        q: "A good rule of thumb for student loans is to borrow…",
        choices: ["As much as you're offered", "No more in total than your expected first-year salary", "Only private loans", "Exactly $100,000"],
        answer: 1,
        why: "Keeping total debt below your starting salary keeps payments manageable.",
      },
      {
        q: "Which can significantly cut the cost of a bachelor's degree?",
        choices: ["Starting at community college, then transferring", "Taking a fifth year", "Skipping the FAFSA", "Choosing out-of-state public schools"],
        answer: 0,
        why: "Community college tuition averages about $4,150/yr vs $11,950 in-state public.",
      },
    ],
  },
  {
    id: "taxes-101",
    icon: "🧾",
    title: "Taxes 101: Brackets & Paychecks",
    summary: "Why a raise never shrinks your paycheck, and what FICA is.",
    minutes: 4,
    cards: [
      {
        heading: "Brackets are buckets",
        html: `<p>The U.S. has seven federal income tax rates in 2026, from <strong>10% to 37%</strong>. But your income isn't all taxed at one rate.</p>
               <p>Picture buckets: the first dollars fill the 10% bucket, the next fill the 12% bucket, and so on. Each bucket's rate applies <strong>only to the dollars inside it</strong>. So moving into a higher bracket only taxes the <em>extra</em> dollars at the higher rate — a raise can never lower your take-home pay.</p>
               <div class="callout"><strong>See it:</strong> slide your income in the <a href="taxes.html#brackets">bracket buckets</a> visual.</div>`,
      },
      {
        heading: "Deductions shrink taxable income",
        html: `<p>Before the brackets apply, you subtract deductions. Most people take the <strong>standard deduction</strong>: <strong>$16,100</strong> for single filers and <strong>$32,200</strong> for married couples filing jointly in 2026.</p>
               <p>Pre-tax 401(k) contributions and health premiums also lower your taxable income — which is why saving for retirement through work costs less than it looks.</p>`,
      },
      {
        heading: "FICA: the other paycheck tax",
        html: `<p>On top of income tax, almost every paycheck pays <strong>FICA</strong>: <strong>6.2%</strong> for Social Security (on wages up to $184,500 in 2026) and <strong>1.45%</strong> for Medicare. Your employer pays a matching amount.</p>
               <p>Your W-4 form tells your employer how much income tax to withhold. A giant refund isn't free money — it's your own money, returned without interest.</p>
               <div class="callout"><strong>Try it:</strong> the <a href="taxes.html#paycheck">paycheck breakdown</a> shows where every dollar goes.</div>`,
      },
    ],
    quiz: [
      {
        q: "You move from the 12% bracket into the 22% bracket. What gets taxed at 22%?",
        choices: ["All of your income", "Only the dollars above the 22% threshold", "Only your bonus", "Nothing changes"],
        answer: 1,
        why: "Brackets are marginal: only the dollars inside the 22% bucket are taxed at 22%.",
      },
      {
        q: "What's the 2026 standard deduction for a single filer?",
        choices: ["$5,000", "$12,400", "$16,100", "$32,200"],
        answer: 2,
        why: "$16,100 for single filers ($32,200 for married filing jointly). $12,400 is where the 10% bracket ends.",
      },
      {
        q: "What does FICA pay for?",
        choices: ["State roads", "Social Security and Medicare", "Your 401(k)", "Federal income tax refunds"],
        answer: 1,
        why: "FICA = 6.2% Social Security + 1.45% Medicare, withheld from wages.",
      },
    ],
  },
  {
    id: "rent-vs-buy",
    icon: "🏡",
    title: "Renting vs Buying a Home",
    summary: "Mortgages, equity, and the hidden costs of owning.",
    minutes: 4,
    cards: [
      {
        heading: "How a mortgage works",
        html: `<p>A mortgage is a loan to buy a home, usually repaid over <strong>15 or 30 years</strong>. In mid-October 2026, the average 30-year fixed rate was about <strong>7.40%</strong> (Freddie Mac).</p>
               <p>Early payments are mostly <strong>interest</strong>; over time, more goes to <strong>principal</strong> — the part that builds your equity. On a 30-year loan at that rate, you can pay more in interest than the house originally cost.</p>
               <div class="callout"><strong>See it:</strong> the <a href="housing.html#mortgage">mortgage calculator</a> shows where every year's payments go.</div>`,
      },
      {
        heading: "More than the mortgage",
        html: `<p>Owners also pay <strong>property tax</strong> (about 0.89% of value per year on average in 2024), <strong>insurance</strong>, <strong>maintenance</strong>, and often <strong>mortgage insurance (PMI)</strong> with less than 20% down. Closing costs typically add about 2%–5% upfront.</p>
               <p>HUD considers households that spend more than <strong>30% of income</strong> on housing "cost-burdened."</p>`,
      },
      {
        heading: "Rent isn't 'throwing money away'",
        html: `<p>Renters skip maintenance, property tax, and big upfront costs — and can invest the down payment. Buyers build equity and lock in their payment.</p>
               <p>Which wins depends mostly on <strong>how long you stay</strong>: it can take several years for a buyer to outrun closing and selling costs.</p>
               <div class="callout"><strong>Compare:</strong> try the <a href="housing.html#rentbuy">rent vs buy calculator</a> with your numbers.</div>`,
      },
    ],
    quiz: [
      {
        q: "Early in a 30-year mortgage, most of each payment goes to…",
        choices: ["Principal", "Interest", "Property tax", "The real estate agent"],
        answer: 1,
        why: "Interest is charged on the remaining balance, which is largest at the start.",
      },
      {
        q: "PMI is usually required on a conventional loan when…",
        choices: ["You pay cash", "Your down payment is under 20%", "Your credit score is over 800", "You buy a condo"],
        answer: 1,
        why: "Mortgage insurance protects the lender when you put down less than 20%.",
      },
      {
        q: "What matters most in whether buying beats renting?",
        choices: ["The color of the house", "How long you'll stay", "Your favorite bank", "Whether it's a weekday"],
        answer: 1,
        why: "Buying has large one-time costs (closing, selling) that take years of equity growth to outrun.",
      },
    ],
  },
  {
    id: "student-loans-2026",
    icon: "📜",
    title: "Student Loans: The 2026 Rules",
    summary: "RAP vs. the Tiered Standard Plan — what changed and how to choose.",
    minutes: 4,
    cards: [
      {
        heading: "Two plans for new loans",
        html: `<p>Starting <strong>July 1, 2026</strong>, new federal student loans come with two repayment choices:</p>
               <ul>
                 <li><strong>Tiered Standard Plan:</strong> fixed payments. The term depends on your balance — 10 years under $25,000, up to 25 years for $100,000+.</li>
                 <li><strong>Repayment Assistance Plan (RAP):</strong> payments based on your income.</li>
               </ul>
               <p>The undergraduate federal loan rate for 2026–27 is <strong>6.52%</strong>, fixed for the life of the loan.</p>`,
      },
      {
        heading: "How RAP works",
        html: `<p>RAP charges 1%–10% of your yearly income (adjusted gross income), divided by 12 — the percentage rises one point for each $10,000 above $10,000, maxing out at 10% above $100,000. It's reduced <strong>$50 per dependent</strong>, and the minimum is <strong>$10/month</strong>.</p>
               <p>Two built-in helps: interest your payment doesn't cover is <strong>waived</strong>, and the government adds up to <strong>$50/month</strong> toward principal if your payment barely dents it. Whatever's left after <strong>30 years</strong> is forgiven (possibly taxable).</p>
               <div class="callout"><strong>Compare:</strong> try both plans with your numbers in the <a href="credit.html#student">Credit &amp; Debt hub</a>.</div>`,
      },
      {
        heading: "Choosing wisely",
        html: `<p><strong>Tiered Standard</strong> usually costs less in total if you can afford the payment. <strong>RAP</strong> protects you when income is low or unsteady — but as your income rises, so does your payment, and paying for decades can add up.</p>
               <p>Either way: you can always pay extra with no penalty. Paying off high-rate loans faster is a guaranteed return equal to the interest rate.</p>`,
      },
    ],
    quiz: [
      {
        q: "Under RAP, what's the minimum monthly payment?",
        choices: ["$0", "$10", "$50", "$100"],
        answer: 1,
        why: "RAP never goes below $10 a month — even with very low income.",
      },
      {
        q: "On the Tiered Standard Plan, what sets how many years you repay?",
        choices: ["Your income", "Your loan balance", "Your college's location", "Your credit score"],
        answer: 1,
        why: "Bigger balances get longer terms: from 10 years (under $25,000) up to 25 years ($100,000+).",
      },
      {
        q: "On RAP, what happens to interest your payment doesn't cover?",
        choices: ["It's added to your balance", "It's waived", "It doubles", "It's sent to collections"],
        answer: 1,
        why: "Unpaid monthly interest is waived under RAP, so the balance doesn't balloon.",
      },
    ],
  },
];
