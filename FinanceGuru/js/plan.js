/* FinanceGuru First Paycheck Plan. No credentials or session tokens in browser storage. */
(() => {
  'use strict';
  // Email confirmation can return auth fragments. Sign-in is explicit; do not keep tokens in URLs.
  if (new URLSearchParams(location.hash.slice(1)).has('access_token')) history.replaceState(null, '', location.pathname + location.search);
  const F = FinancePlan, $ = (id) => document.getElementById(id), KEY = 'fg-paycheck-v1';
  const dollars = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const fields = ['housing', 'utilities', 'food', 'transport', 'other', 'wants'];
  const lessons = { budgeting: 'Budgeting Basics', debt: 'Understanding Debt', 'emergency-fund': 'Emergency Funds' };
  let current = null, checkins = [], scenario = null, step = 0, debtId = 0, account = null, config = {}, checkoutId = null;
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
  const say = (text) => { $('notice').textContent = text; };
  const num = (id) => $(id).value === '' ? NaN : Number($(id).value);
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  function savedData() { if (!current) throw new Error('Build a plan first.'); return { version: 1, profile: current.profile, checkins }; }
  function normalize(data) {
    if (!data || data.version !== 1 || !Array.isArray(data.checkins) || data.checkins.length > 60) throw new Error('This saved plan could not be read.');
    const plan = F.plan(data.profile), dates = new Set();
    const history = data.checkins.map((c) => {
      const baseline = F.plan(c?.planProfile || plan.profile), clean = F.checkIn(c, baseline);
      if (dates.has(clean.weekEnding)) throw new Error('This saved plan has duplicate check-ins.');
      dates.add(clean.weekEnding);
      return { ...clean, planProfile: baseline.profile };
    }).sort((a, b) => a.weekEnding.localeCompare(b.weekEnding));
    return { plan, history };
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(savedData())); $('save-status').textContent = 'Saved on this device. Cloud sync is separate.'; return true; }
    catch { $('save-status').textContent = 'This browser could not save your plan. Download a copy instead.'; return false; }
  }
  async function api(path, method = 'GET', body, refresh = true) {
    let response;
    try {
      response = await fetch(`/api${path}`, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(35000) });
    } catch { throw new Error('Could not connect. Your plan is still available on this device.'); }
    if (response.status === 401 && refresh && !path.startsWith('/auth/')) {
      try { await api('/auth/refresh', 'POST', {}, false); }
      catch (error) { if (error.status === 401) { account = null; updateAccount(); } throw error; }
      return api(path, method, body, false);
    }
    let data;
    try { data = await response.json(); } catch { throw new Error('Account services are not available on this site yet. You can use the free planner.'); }
    if (!response.ok) { const error = new Error(data.error || 'The request could not be completed.'); error.status = response.status; throw error; }
    return data;
  }
  async function busy(button, work) {
    if (button.disabled) return;
    const label = button.textContent; button.disabled = true; button.textContent = 'Working…';
    try { await work(); } catch (e) { say(e.message); }
    finally { button.disabled = false; button.textContent = label; updateAccount(); }
  }
  function showStep(next) {
    step = next;
    document.querySelectorAll('[data-step]').forEach((f, i) => { f.hidden = i !== step; f.disabled = i !== step; });
    document.querySelectorAll('.planner-steps li').forEach((n, i) => { n.classList.toggle('step-complete', i < step); if (i === step) n.setAttribute('aria-current', 'step'); else n.removeAttribute('aria-current'); });
    $('back').hidden = step === 0; $('next').hidden = step === 2; $('build').hidden = step !== 2;
    $('next').textContent = step === 0 ? 'Monthly costs →' : 'Choose a goal →';
    $('form-error').textContent = '';
    document.querySelector(`[data-step="${step}"] input, [data-step="${step}"] select`)?.focus({ preventScroll: true });
  }
  function goalFields() {
    const debt = $('goal').value === 'debt'; $('savings-fields').hidden = debt;
    $('target').disabled = debt; $('saved').disabled = debt;
  }
  function addDebt(d = { name: '', balance: 0, apr: 0, min: 0 }) {
    if ($('debts').children.length >= 10) { say('You can add up to ten debts.'); return; }
    const row = el('div', undefined, 'debt-row'); row.dataset.debt = '';
    const grid = el('div', undefined, 'planner-fields'); const id = ++debtId;
    for (const [key, label, max] of [['name', 'Nickname', 60], ['balance', 'Balance', 1000000], ['apr', 'APR (%)', 1000], ['min', 'Minimum per month', 1000000]]) {
      const wrap = el('div'), input = el('input'); input.id = `debt-${id}-${key}`; input.dataset.field = key; input.required = true; input.value = d[key];
      if (key === 'name') { input.type = 'text'; input.maxLength = max; } else { input.type = 'number'; input.min = '0'; input.max = String(max); input.step = '0.01'; }
      const caption = el('label', label); caption.htmlFor = input.id; wrap.append(caption, input); grid.append(wrap);
    }
    const remove = el('button', 'Remove debt', 'btn btn-ghost small'); remove.type = 'button'; remove.addEventListener('click', () => { row.remove(); $('add-debt').focus(); });
    row.append(grid, remove); $('debts').append(row);
  }
  function populate(p) {
    $('take-home').value = p.takeHome; $('frequency').value = p.frequency;
    fields.forEach((k) => { $(k).value = p.expenses[k]; });
    $('goal').value = p.goal; $('saved').value = p.saved; $('target').value = p.target; $('months').value = p.targetMonths;
    $('debts').replaceChildren(); p.debts.forEach(addDebt); goalFields();
  }
  function profile() {
    const expenses = Object.fromEntries(fields.map((k) => [k, num(k)]));
    const debts = [...$('debts').children].map((row) => Object.fromEntries([...row.querySelectorAll('input')].map((n) => [n.dataset.field, n.dataset.field === 'name' ? n.value : n.value === '' ? NaN : Number(n.value)])));
    return { takeHome: num('take-home'), frequency: $('frequency').value, expenses, debts, goal: $('goal').value, saved: $('goal').value === 'debt' ? 0 : num('saved'), target: $('goal').value === 'debt' ? 0 : num('target'), targetMonths: num('months') };
  }
  function timeline(p) {
    if (p.profile.goal === 'debt') return p.avalanche.months === null ? 'The entered payments do not clear the debt within 50 years.' : `Avalanche estimate: ${p.avalanche.months} months to clear the entered debts.`;
    if (p.goalGap === 0) return 'Your entered savings already cover this target.';
    return p.timelineFeasible ? `Your ${p.profile.targetMonths}-month savings target fits the entered budget.` : `Your target needs more time or more room in the budget.${p.goalMonthsAtCapacity ? ` At your full monthly surplus, it would take about ${p.goalMonthsAtCapacity} months.` : ' There is no monthly surplus available for the goal yet.'}`;
  }
  function render() {
    const p = current; $('onboarding').hidden = true; $('dashboard').hidden = false;
    $('workspace-nav').hidden = false; $('setup-guide').hidden = true;
    const metrics = el('div', undefined, 'plan-metrics');
    for (const [title, value] of [['Base-month income', p.monthlyIncome], ['Monthly costs + minimums', p.outgo], [p.surplus < 0 ? 'Monthly shortfall' : 'Room after costs', Math.abs(p.surplus)]]) {
      const n = el('div', undefined, 'metric-card'); if (metrics.children.length === 2) n.classList.add(p.surplus < 0 ? 'metric-negative' : 'metric-available'); n.append(el('span', title), el('strong', dollars(value))); metrics.append(n);
    }
    const explanation = el('p', timeline(p), p.timelineFeasible && p.surplus >= 0 ? 'planner-success' : 'planner-warning');
    $('summary').replaceChildren(metrics, explanation);
    if (p.surplus < 0) $('summary').append(el('p', `The plan is short ${dollars(-p.surplus)} per base month. Resolve this gap before committing new money to your goal.`, 'planner-warning'));
    if (p.profile.debts.some((d) => d.balance > 0)) {
      const table = el('table', undefined, 'plan-comparison'), caption = el('caption', 'Debt payoff estimates at the entered payment level'); table.append(caption);
      const head = el('tr'); ['Approach', 'Months', 'Total interest'].forEach((s) => { const th = el('th', s); th.scope = 'col'; head.append(th); });
      const thead = el('thead'); thead.append(head); table.append(thead); const tbody = el('tbody');
      for (const [name, result] of [['Highest APR first', p.avalanche], ['Smallest balance first', p.snowball]]) { const row = el('tr'); [name, result.months === null ? 'Beyond 600' : String(result.months), result.interest === null ? 'Not estimated' : dollars(result.interest)].forEach((s) => row.append(el('td', s))); tbody.append(row); }
      table.append(tbody); $('summary').append(table);
    }
    const allocation = el('dl', undefined, 'allocation');
    for (const [name, value] of [['Bills & debt minimums', p.perPaycheck.bills], ['Flexible spending', p.perPaycheck.wants], ['Your goal', p.perPaycheck.goal], [p.perPaycheck.remaining < 0 ? 'Unfunded amount' : 'Unassigned buffer', p.perPaycheck.remaining]]) { const n = el('div', undefined, `allocation-item allocation-${allocation.children.length}`); n.append(el('dt', name), el('dd', dollars(value))); allocation.append(n); }
    $('allocation').replaceChildren(el('h3', `For each ${dollars(p.profile.takeHome)} paycheck`), allocation, el('p', 'Check bill due dates before spending or transferring. An unassigned buffer is not a guarantee that money is safe to spend.', 'small muted'));
    if (p.perPaycheck.remaining >= 0) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 600 18'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('class', 'allocation-bar'); svg.setAttribute('aria-hidden', 'true');
      let start = 0;
      Object.values(p.perPaycheck).forEach((value, i) => { const width = value / p.profile.takeHome * 600, rect = document.createElementNS(svg.namespaceURI, 'rect'); rect.setAttribute('x', start); rect.setAttribute('width', width); rect.setAttribute('height', 18); rect.setAttribute('class', `allocation-segment-${i}`); svg.append(rect); start += width; });
      allocation.before(svg);
    }
    $('goal-progress').replaceChildren();
    if (p.profile.goal !== 'debt' && p.profile.target > 0) {
      const label = el('label', p.profile.goal === 'move' ? 'Your moving-out fund' : 'Your savings buffer'); label.htmlFor = 'savings-meter';
      const progress = el('progress'); progress.id = 'savings-meter'; progress.max = p.profile.target; progress.value = Math.min(p.profile.saved, p.profile.target);
      const heading = el('div', undefined, 'goal-progress-heading'); heading.append(label, el('strong', `${dollars(p.profile.saved)} of ${dollars(p.profile.target)}`));
      $('goal-progress').append(heading, progress, el('p', 'Based on the savings you entered. Update your numbers as your balance changes.', 'small muted'));
    }
    const actions = el('ol', undefined, 'plan-actions'); $('completed-actions').replaceChildren();
    for (const a of p.actions) {
      const li = el('li'); li.append(el('strong', a.title), el('p', a.detail)); const link = el('a', lessons[a.lesson]); link.href = `learn.html#${a.lesson}`; li.append(link); actions.append(li);
      const label = el('label', undefined, 'check-label'), input = el('input'); input.type = 'checkbox'; input.value = a.id; label.append(input, el('span', a.title)); $('completed-actions').append(label);
    }
    $('actions').replaceChildren(el('h3', 'Your next three steps'), actions);
    $('assumptions').replaceChildren(...p.assumptions.map((s) => el('li', s)));
    $('scenario-housing').value = p.profile.expenses.housing; $('scenario-wants').value = p.profile.expenses.wants;
    $('scenario-result').replaceChildren(); $('apply-scenario').hidden = true; scenario = null;
    $('coach-result').replaceChildren(); $('save-status').textContent = 'Changes are not saved until you choose a save option.';
    renderHistory(); updateAccount();
  }
  function renderHistory() {
    $('checkin-history').replaceChildren();
    if (!checkins.length) { const empty = el('div', undefined, 'checkin-empty'); empty.append(el('span', '↗', 'empty-symbol'), el('h3', 'Your progress starts with one check-in.'), el('p', 'Each week is a chance to notice what worked and make a small adjustment.', 'small muted')); $('checkin-history').append(empty); }
    for (const c of [...checkins].reverse()) {
      const entry = el('article', undefined, 'checkin-entry'); entry.append(el('h3', `Week ending ${c.weekEnding}`), el('p', `Spent ${dollars(c.spending)} · Goal contributions ${dollars(c.saved)} · ${c.completed.length} actions completed`), el('p', `Compared with that week's plan: ${dollars(c.spendingDifference)} spending difference and ${dollars(c.goalDifference)} goal contribution difference.`, 'small'), el('p', c.note, 'small muted')); $('checkin-history').append(entry);
    }
    $('progress-summary').textContent = `${checkins.length} check-in${checkins.length === 1 ? '' : 's'} recorded. ${dollars(checkins.reduce((s, c) => s + c.saved, 0))} in self-reported goal contributions. These do not automatically update your savings balance or debt balances.`;
  }
  function updateAccount() {
    $('auth-form').hidden = !config.accounts || Boolean(account); $('cloud-controls').hidden = !account; $('delete-cloud').hidden = !account;
    $('save-cloud').disabled = !current;
    $('account-status').textContent = account ? `Signed in as ${account.email}.` : config.accounts ? 'Sign in to save a cloud copy and try AI coaching.' : 'Account sync is not available here yet. You can save on this device.';
    $('coach-form').hidden = !config.coaching || !account;
    $('coach-availability').textContent = !config.coaching ? 'AI coaching is not available here yet. Your calculated plan and action list are ready to use.' : !account ? 'Sign in to try an AI explanation of your plan.' : 'Your numbers come from the calculator. AI explains them using FinanceGuru lessons. Check the explanation before acting.';
    const paid = account?.program?.active;
    $('checkout').disabled = !config.checkout || Boolean(paid);
    $('checkout').textContent = paid ? 'Your program is active' : !config.checkout ? 'Enrollment isn’t open yet' : account ? 'Start 30 days · $29' : 'Sign in to enroll';
    if (paid) $('program-status').textContent = `Access through ${new Date(account.program.validUntil).toLocaleDateString()}. No automatic renewal.`;
    else if (!new URLSearchParams(location.search).has('checkout')) $('program-status').textContent = '';
  }
  async function refreshAccount() { account = await api('/me'); updateAccount(); }
  $('next').addEventListener('click', () => { if ($('plan-form').reportValidity()) showStep(step + 1); });
  $('back').addEventListener('click', () => showStep(step - 1));
  $('goal').addEventListener('change', goalFields);
  $('add-debt').addEventListener('click', () => addDebt());
  $('example').addEventListener('click', () => {
    populate({ takeHome: 1800, frequency: 'biweekly', expenses: { housing: 1100, utilities: 180, food: 350, transport: 200, other: 150, wants: 250 }, debts: [{ name: 'Car', balance: 4500, apr: 7, min: 180 }, { name: 'Card', balance: 1200, apr: 24, min: 60 }], goal: 'buffer', saved: 200, target: 1500, targetMonths: 6 });
    $('example-note').hidden = false; say('Example figures loaded. Review each step and replace them with your own.'); showStep(0);
  });
  $('plan-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (step < 2) { if ($('plan-form').reportValidity()) showStep(step + 1); return; }
    try { current = F.plan(profile()); render(); $('plan-title').focus(); say('Your calculated plan is ready. Choose where to save it.'); }
    catch (error) { $('form-error').textContent = error.message; }
  });
  $('edit').addEventListener('click', () => { populate(current.profile); $('onboarding').hidden = false; $('dashboard').hidden = true; $('workspace-nav').hidden = true; $('setup-guide').hidden = false; showStep(0); $('onboarding').scrollIntoView({ block: 'start', behavior: 'instant' }); });
  $('save-local').addEventListener('click', () => { if (persist()) say('Your plan and check-ins are saved on this device.'); });
  // Weekly check-in reminder as a calendar file: this weekday, 6 pm local, starting next week and repeating.
  // No plan figures inside. Lines over 75 octets are folded (RFC 5545).
  function reminderIcs(now = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
    const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const link = new URL('plan.html#review', location.href).href;
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FinanceGuru//First Paycheck Plan//EN', 'BEGIN:VEVENT',
      `UID:${stamp}-${Math.random().toString(36).slice(2)}@financeguru`, `DTSTAMP:${stamp}`,
      `DTSTART:${day.getFullYear()}${pad(day.getMonth() + 1)}${pad(day.getDate())}T180000`, 'DURATION:PT10M', 'RRULE:FREQ=WEEKLY',
      'SUMMARY:Weekly money check-in', `DESCRIPTION:Log last week's spending and savings in your FinanceGuru plan: ${link}`, `URL:${link}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Weekly money check-in', 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR']
      .map((line) => line.match(/.{1,74}/g).join('\r\n ')).join('\r\n') + '\r\n';
  }
  $('reminder').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([reminderIcs()], { type: 'text/calendar' }));
    const a = el('a'); a.href = url; a.download = 'financeguru-weekly-check-in.ics'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    say('Open the downloaded file to add the weekly reminder to your calendar app.');
  });
  $('export').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ ...savedData(), calculated: current }, null, 2)], { type: 'application/json' }));
    const a = el('a'); a.href = url; a.download = 'financeguru-plan.json'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    say('Your download contains financial information. Keep it somewhere private.');
  });
  $('scenario-form').addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      scenario = F.plan({ ...current.profile, expenses: { ...current.profile.expenses, housing: num('scenario-housing'), wants: num('scenario-wants') } });
      $('scenario-result').replaceChildren(el('p', `Monthly room after costs: ${dollars(current.surplus)} → ${dollars(scenario.surplus)}. Change: ${dollars(scenario.surplus - current.surplus)}.`), el('p', timeline(scenario)));
      $('apply-scenario').hidden = false;
    } catch (error) { say(error.message); }
  });
  $('apply-scenario').addEventListener('click', () => { if (scenario) { current = scenario; populate(current.profile); render(); $('plan-title').focus(); say('Scenario applied. Save the updated plan when you’re ready.'); } });
  $('checkin-form').addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      if ($('week-ending').value > today()) throw new Error('Choose today or an earlier check-in date.');
      const c = { ...F.checkIn({ weekEnding: $('week-ending').value, spending: num('actual-spending'), saved: num('actual-saved'), completed: [...$('completed-actions').querySelectorAll('input:checked')].map((n) => n.value) }, current), planProfile: current.profile };
      const exists = checkins.some((x) => x.weekEnding === c.weekEnding);
      if (exists && !confirm('Replace your check-in for this date?')) return;
      if (!exists && checkins.length >= 60) throw new Error('This plan has 60 check-ins. Download your history before starting a new plan.');
      checkins = checkins.filter((x) => x.weekEnding !== c.weekEnding).concat(c).sort((a, b) => a.weekEnding.localeCompare(b.weekEnding));
      renderHistory(); $('coach-result').replaceChildren();
      if (persist()) say('Check-in saved on this device. Use “Save to my account” to sync it.'); else say('Check-in is shown here, but this browser could not save it. Download your plan to keep it.');
    } catch (error) { say(error.message); }
  });
  async function authenticate(signup, button) {
    if (!$('auth-form').reportValidity()) return;
    if (signup && !$('adult-consent').checked) { say('Confirm that you are 18 or older and agree to the privacy terms to create an account.'); return; }
    await busy(button, async () => {
      const result = await api(`/auth/${signup ? 'signup' : 'login'}`, 'POST', { email: $('auth-email').value, password: $('auth-password').value, adultConsent: $('adult-consent').checked });
      $('auth-password').value = ''; say(result.message); if (result.authenticated) await refreshAccount();
    });
  }
  $('auth-form').addEventListener('submit', (e) => { e.preventDefault(); authenticate(false, e.submitter || $('auth-form').querySelector('[type=submit]')); });
  $('signup').addEventListener('click', () => authenticate(true, $('signup')));
  $('logout').addEventListener('click', () => busy($('logout'), async () => { await api('/auth/logout', 'POST', {}); account = null; $('coach-result').replaceChildren(); say('Signed out. A plan saved on this device remains here until you clear it.'); }));
  $('save-cloud').addEventListener('click', () => busy($('save-cloud'), async () => { await api('/plan', 'PUT', savedData()); $('save-status').textContent = 'Saved to your account. Your device copy is separate.'; say('Plan and check-ins saved to your account.'); }));
  $('load-cloud').addEventListener('click', () => busy($('load-cloud'), async () => {
    const result = await api('/plan'); if (!result.saved) { say('Your account has no saved plan yet.'); return; }
    const data = normalize(result.saved); if (current && !confirm('Replace the plan shown here with your account’s saved plan?')) return;
    current = data.plan; checkins = data.history; populate(current.profile); render(); $('save-status').textContent = 'Loaded from your account. Save on this device if you want an offline copy.'; say('Account plan loaded.');
  }));
  $('delete-cloud').addEventListener('click', () => { if (confirm('Delete your account’s saved plan and check-ins? This cannot be undone. Your device copy will remain.')) busy($('delete-cloud'), async () => { await api('/plan', 'DELETE', {}); say('Cloud plan deleted. Device copies and payment records are separate.'); }); });
  $('clear-local').addEventListener('click', () => {
    if (!confirm('Clear this device’s saved plan and the plan shown here? Cloud copies remain.')) return;
    try { localStorage.removeItem(KEY); } catch { say('This browser did not allow us to clear storage. Use your browser’s site-data settings.'); return; }
    current = null; checkins = []; $('plan-form').reset(); $('debts').replaceChildren(); $('example-note').hidden = true; goalFields(); $('dashboard').hidden = true; $('onboarding').hidden = false; $('workspace-nav').hidden = true; $('setup-guide').hidden = false; showStep(0); updateAccount(); say('This device’s plan has been cleared.');
  });
  $('coach-form').addEventListener('submit', (e) => {
    e.preventDefault(); busy($('ask-coach'), async () => {
      const snapshot = savedData(), requested = JSON.stringify(snapshot), email = account?.email;
      const result = await api('/coach', 'POST', { ...snapshot, question: $('coach-question').value, consent: $('ai-consent').checked });
      if (!current || account?.email !== email || JSON.stringify(savedData()) !== requested) throw new Error('Your plan or account changed while the explanation was being prepared. Request a new explanation for the current plan.');
      const parts = [el('h3', result.summary), ...result.explanation.map((s) => el('p', s)), el('p', result.nextStep), el('p', result.question), el('p', result.notice, 'small muted')];
      const sources = el('p', 'Read more: ', 'small');
      for (const source of result.sources) if (Object.hasOwn(lessons, source.id)) { const a = el('a', lessons[source.id]); a.href = `learn.html#${source.id}`; sources.append(a, document.createTextNode(' ')); }
      $('coach-result').replaceChildren(...parts, sources); say('AI explanation ready. Review it alongside the calculated figures.');
    });
  });
  $('checkout').addEventListener('click', () => {
    if (!account) { say('Sign in or create an account before enrolling.'); $('auth-email').focus(); return; }
    busy($('checkout'), async () => {
      checkoutId ||= crypto.randomUUID(); const result = await api('/billing/checkout', 'POST', { requestId: checkoutId });
      const url = new URL(result.url); if (url.origin !== 'https://checkout.stripe.com') throw new Error('Checkout returned an unexpected address.');
      location.assign(url.href);
    });
  });
  $('week-ending').value = today(); $('week-ending').max = today(); showStep(0);
  const sectionLinks = [...$('workspace-nav').querySelectorAll('a')];
  function markSection(id) { sectionLinks.forEach((a) => { if (a.hash === `#${id}`) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); }); }
  sectionLinks.forEach((a) => a.addEventListener('click', (event) => {
    event.preventDefault(); const section = document.getElementById(a.hash.slice(1));
    markSection(section.id); section.scrollIntoView({ block: 'start', behavior: FG.reducedMotion() ? 'instant' : 'smooth' });
    const heading = section.querySelector('h2'); heading.tabIndex = -1; heading.focus({ preventScroll: true });
  }));
  let sectionFrame = 0;
  function syncSection() {
    if (sectionFrame) return;
    sectionFrame = requestAnimationFrame(() => {
      sectionFrame = 0;
      if ($('dashboard').hidden) return;
      const threshold = Math.min($('workspace-nav').getBoundingClientRect().bottom + 40, innerHeight * .4);
      const panels = [...document.querySelectorAll('.workspace-panel')];
      const passed = panels.filter((panel) => panel.getBoundingClientRect().top <= threshold);
      markSection((passed.at(-1) || panels[0]).id);
    });
  }
  addEventListener('scroll', syncSection, { passive: true });
  addEventListener('resize', syncSection, { passive: true });
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const data = normalize(JSON.parse(raw)); current = data.plan; checkins = data.history; populate(current.profile); render(); $('save-status').textContent = 'Loaded from this device.'; }
  } catch { say('The saved plan could not be loaded. You can build a new one or clear this device’s saved plan.'); }
  // Hand-offs from Tools: the Pay Stub Reader sends take-home + frequency; Emergency Fund and Savings Goals
  // send a goal (type, target, saved, months). Values are validated, prefilled for review, never auto-saved.
  const handoff = new URLSearchParams(location.search);
  if (handoff.has('takehome') || handoff.has('goal')) {
    history.replaceState(null, '', location.pathname + location.hash);
    const amount = (k) => { const v = Number(handoff.get(k)); return Number.isFinite(v) && v >= 0 && v <= 1000000 ? v : null; };
    const pay = amount('takehome'), freq = handoff.get('frequency');
    const payOk = pay > 0 && ['weekly', 'biweekly', 'semimonthly', 'monthly'].includes(freq);
    const target = amount('target'), saved = amount('saved') ?? 0, months = Number(handoff.get('months'));
    const goalOk = ['buffer', 'move'].includes(handoff.get('goal')) && target > 0 && Number.isInteger(months) && months >= 1 && months <= 120;
    if (payOk || goalOk) {
      if (current) $('edit').click();
      if (payOk) { $('take-home').value = pay.toFixed(2); $('frequency').value = freq; }
      if (goalOk) { $('goal').value = handoff.get('goal'); $('target').value = target.toFixed(2); $('saved').value = Math.min(saved, target).toFixed(2); $('months').value = months; goalFields(); }
      showStep(goalOk && current ? 2 : 0);
      say(payOk ? `Take-home of ${dollars(pay)} filled in from your pay stub. Review it, then continue.`
        : `Goal of ${dollars(target)} in ${months} month${months > 1 ? 's' : ''} filled in. ${current ? 'Review it, then rebuild your plan.' : 'Start with your take-home pay; the goal is ready on step 3.'}`);
    }
  }
  (async () => {
    try { config = await api('/config', 'GET', undefined, false); if (config.accounts) { try { await refreshAccount(); } catch (e) { if (e.status !== 401) say(e.message); } } }
    catch { config = {}; }
    updateAccount();
    const checkout = new URLSearchParams(location.search).get('checkout');
    if (checkout === 'success' && !account?.program?.active) $('program-status').textContent = 'Payment confirmation may take a moment. Sign in and reload to check your access. The return link alone does not activate a program.';
    if (checkout === 'cancelled') $('program-status').textContent = 'Checkout closed. Your free plan is still available.';
  })();
})();
