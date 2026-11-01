// Plan awareness for SaaS mode: sends the visitor's plan key with API requests, shows the
// current plan and monthly usage, lists the plans, and explains upgrade or quota responses.
// The key is kept in sessionStorage (this tab only) and never in a URL.

const KEY_NAME = 'northstar-plan-key';
const NO_AUTO_LOGIN = 'northstar-no-auto-login';
const readKey = () => { try { return sessionStorage.getItem(KEY_NAME) || ''; } catch { return ''; } };
const writeKey = value => { try { value ? sessionStorage.setItem(KEY_NAME, value) : sessionStorage.removeItem(KEY_NAME); } catch { /* storage unavailable */ } };

const nativeFetch = window.fetch.bind(window);

// In SaaS mode every tool run counts toward the visitor's monthly quota, so tools do not
// run themselves on page load there; they run when the visitor submits the form.
// /v1/account has content only when the server runs with plans enabled
// (otherwise 204; older servers answered 404).
const saasMode = nativeFetch('/v1/account').then(r => r.status !== 204 && r.status !== 404).catch(() => false);
// Without plans, tools still show an example result, but only once their view is first opened:
// running every tool on page load sent about 68 requests per visit and could trip the rate limit.
export function autoRun(run, anchor) {
  saasMode.then(enabled => {
    if (enabled) return;
    const view = anchor?.closest?.('section.view');
    if (!view || !view.hidden) { run(); return; }
    const observer = new MutationObserver(() => {
      if (view.hidden) return;
      observer.disconnect();
      run();
    });
    observer.observe(view, { attributes: true, attributeFilter: ['hidden'] });
  });
}
let banner, badge, usageLine;

function isApi(input) {
  const url = new URL(typeof input === 'string' ? input : input.url, location.href);
  return url.origin === location.origin && url.pathname.startsWith('/v1/');
}

function showBanner(text, kind = 'warning') {
  if (!banner) return;
  banner.textContent = text;
  banner.className = `plan-banner plan-banner-${kind}`;
  banner.hidden = false;
}

window.fetch = async (input, init = {}) => {
  if (!isApi(input)) return nativeFetch(input, init);
  const key = readKey();
  const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined));
  if (key && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${key}`);
  const response = await nativeFetch(input, { ...init, headers });
  if(response.ok&&response.headers.get('X-Assessment-Type')==='preliminary-unreviewed')showBanner('Preliminary tool result: confirm the rule, dates and your eligibility with the issuing authority. This result has not been independently reviewed.','warning');
  const plan = response.headers.get('X-Plan');
  if (plan && badge) badge.textContent = `Plan: ${plan[0].toUpperCase()}${plan.slice(1)}`;
  const remaining = response.headers.get('X-Quota-Remaining');
  if (remaining !== null && usageLine) usageLine.textContent = `${remaining} of ${response.headers.get('X-Quota-Limit')} left this month for this feature`;
  if ([401, 402, 403, 429].includes(response.status)) {
    const body = await response.clone().json().catch(() => ({}));
    if (body.code === 'plan_upgrade_required') showBanner(`${body.error} Your plan: ${body.plan}. See "Plans" in the sidebar.`, 'upgrade');
    else if (body.code === 'plan_quota_exceeded') showBanner(`${body.error} It resets on ${new Date(body.resetAt).toLocaleDateString()}.${body.upgradeTo ? ` The ${body.upgradeTo} plan has a higher limit.` : ''}`, 'quota');
    else if (body.code === 'invalid_api_key' || body.code === 'account_suspended') showBanner(body.error, 'error');
  }
  return response;
};

async function renderPlans(list) {
  try {
    const catalog = await nativeFetch('/v1/plans').then(r => r.json());
    list.replaceChildren(...catalog.plans.map(p => {
      const item = document.createElement('li');
      item.textContent = `${p.name}: ${p.priceCadMonthly ? `CAD ${p.priceCadMonthly}/month` : 'free'} · ${p.monthlyChatAnswers ?? 'unlimited'} answers · ${p.monthlyToolRuns ?? 'unlimited'} tool runs`;
      return item;
    }));
    const note = document.createElement('li');
    note.className = 'plan-note';
    note.textContent = catalog.notes[0];
    list.append(note);
  } catch { list.textContent = 'Plans are unavailable right now.'; }
}

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children);
  return node;
}

function field(labelText, props) {
  const input = el('input', props);
  return [el('label', {}, labelText, input), input];
}

async function postJson(path, body) {
  const res = await window.fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ---- Usage dashboard (month to date) ----
const fmtDay = iso => new Date(iso + 'T00:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });

function barChart(title, unit, rows, feature, seriesClass) {
  const max = Math.max(1, ...rows.map(r => r[feature]));
  const tip = el('div', { className: 'usage-tip', role: 'tooltip', hidden: true });
  const bars = el('div', { className: 'usage-bars' });
  for (const row of rows) {
    const value = row[feature];
    const label = `${fmtDay(row.day)}: ${value} ${value === 1 ? unit.replace(/s$/, '') : unit}`;
    const bar = el('button', { type: 'button', className: 'usage-bar-hit', ariaLabel: label });
    const fill = el('span', { className: `usage-bar ${seriesClass}` });
    fill.style.height = value ? `${Math.max(2, (value / max) * 100)}%` : '0';
    bar.append(fill);
    const show = () => {
      tip.textContent = label; tip.hidden = false;
      // Keep the tooltip inside the chart: anchor it left or right near the edges.
      const x = bar.offsetLeft + bar.offsetWidth / 2, width = bars.offsetWidth, half = tip.offsetWidth / 2;
      tip.style.left = `${Math.min(Math.max(x, half), width - half)}px`;
    };
    bar.addEventListener('mouseenter', show); bar.addEventListener('focus', show);
    bar.addEventListener('mouseleave', () => { tip.hidden = true; }); bar.addEventListener('blur', () => { tip.hidden = true; });
    bars.append(bar);
  }
  const axis = el('div', { className: 'usage-axis' }, el('span', { textContent: rows.length ? fmtDay(rows[0].day) : '' }), el('span', { textContent: rows.length ? fmtDay(rows.at(-1).day) : '' }));
  const plot = el('div', { className: 'usage-plot' }, el('span', { className: 'usage-max', textContent: String(max) }), bars, tip);
  return el('figure', { className: 'usage-chart' }, el('figcaption', { textContent: title }), plot, axis);
}

function tile(label, value, detail) {
  return el('div', { className: 'usage-tile' }, el('span', { className: 'usage-tile-label', textContent: label }), el('strong', { textContent: value }), el('span', { className: 'usage-tile-detail', textContent: detail }));
}

async function openUsageDashboard() {
  const dialog = el('dialog', { className: 'usage-dialog', ariaLabel: 'Usage this month' });
  const close = el('button', { type: 'button', className: 'usage-close', textContent: 'Close' });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => dialog.remove());
  const body = el('div', { className: 'usage-body' }, el('p', { textContent: 'Loading usage…' }));
  dialog.append(el('div', { className: 'usage-head' }, el('h2', { textContent: 'Usage this month' }), close), body);
  document.body.append(dialog);
  dialog.showModal();

  const res = await window.fetch('/v1/account/usage');
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { body.replaceChildren(el('p', { textContent: data.error || 'Usage is not available.' })); return; }

  const reset = new Date(data.resetAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', timeZone: 'UTC' });
  const left = f => Math.max(0, data.limits[f] - data.totals[f]);
  const tiles = el('div', { className: 'usage-tiles' },
    tile('Chat answers', `${data.totals.chat} of ${data.limits.chat}`, `${left('chat')} left`),
    tile('Tool runs', `${data.totals.tool} of ${data.limits.tool}`, `${left('tool')} left`),
    tile('Plan', data.plan[0].toUpperCase() + data.plan.slice(1), `Resets ${reset}`));

  // Pace warning: at the current daily rate, would a limit be reached before the reset?
  const warnings = ['chat', 'tool'].filter(f => data.projected[f] > data.limits[f] && data.totals[f] > 0).map(f => {
    const perDay = data.totals[f] / data.elapsedDays;
    const day = Math.min(data.daysInMonth, Math.ceil(data.limits[f] / perDay));
    return `⚠ At this pace you will use all your ${f === 'chat' ? 'chat answers' : 'tool runs'} around day ${day} of ${data.daysInMonth}.`;
  });
  const pace = el('p', { className: 'usage-pace', textContent: warnings.join(' ') || `At this pace: about ${data.projected.chat} answers and ${data.projected.tool} tool runs by the end of the month.` });

  const charts = el('div', { className: 'usage-charts' },
    barChart('Chat answers per day', 'answers', data.daily, 'chat', 'series-1'),
    barChart('Tool runs per day', 'tool runs', data.daily, 'tool', 'series-2'));
  const table = el('table', { className: 'usage-table', hidden: true },
    el('thead', {}, el('tr', {}, el('th', { textContent: 'Day' }), el('th', { textContent: 'Chat answers' }), el('th', { textContent: 'Tool runs' }))),
    el('tbody', {}, ...data.daily.map(r => el('tr', {}, el('td', { textContent: fmtDay(r.day) }), el('td', { textContent: String(r.chat) }), el('td', { textContent: String(r.tool) })))));
  const toggle = el('button', { type: 'button', className: 'plan-link', textContent: 'Show as table' });
  toggle.addEventListener('click', () => {
    table.hidden = !table.hidden; charts.hidden = !table.hidden;
    toggle.textContent = table.hidden ? 'Show as table' : 'Show as charts';
  });

  const keyRows = data.byKey.length ? data.byKey.map(k => el('tr', {},
    el('td', { textContent: k.keyId === 'browser' ? k.label : `…${k.keyId.slice(-6)}${k.label ? ' · ' + k.label : ''}${k.revoked ? ' (revoked)' : ''}` }),
    el('td', { textContent: String(k.chat) }), el('td', { textContent: String(k.tool) })))
    : [el('tr', {}, el('td', { colSpan: 3, textContent: 'No usage yet this month.' }))];
  const byKey = el('table', { className: 'usage-table' },
    el('caption', { textContent: 'By API key' }),
    el('thead', {}, el('tr', {}, el('th', { textContent: 'Source' }), el('th', { textContent: 'Chat answers' }), el('th', { textContent: 'Tool runs' }))),
    el('tbody', {}, ...keyRows));

  body.replaceChildren(tiles, pace, toggle, charts, table, byKey, el('p', { className: 'usage-note', textContent: data.note }));
}
export function mountPlanAccess(container) {
  if (!container) return;
  const wrap = el('details', { className: 'plan-access' });
  badge = el('span', { textContent: 'Plan: Free' });
  const summary = el('summary', {}, badge);
  usageLine = el('small', { className: 'plan-usage' });
  const message = el('p', { className: 'plan-message', role: 'status' });
  const signedIn = el('div', { hidden: true });
  const signedOut = el('div');

  // Signed-out: log in or sign up with email and password.
  const [emailLabel, email] = field('Email', { type: 'email', autocomplete: 'email', required: true });
  const [passwordLabel, password] = field('Password (10+ characters)', { type: 'password', autocomplete: 'current-password', required: true, minLength: 10 });
  const [nameLabel, name] = field('Name (optional)', { type: 'text', autocomplete: 'name' });
  nameLabel.hidden = true;
  const submit = el('button', { type: 'submit', textContent: 'Log in' });
  const switchMode = el('button', { type: 'button', className: 'plan-link', textContent: 'New here? Create a free account' });
  let mode = 'login';
  switchMode.addEventListener('click', () => {
    mode = mode === 'login' ? 'signup' : 'login';
    nameLabel.hidden = mode === 'login';
    password.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    submit.textContent = mode === 'login' ? 'Log in' : 'Create account';
    switchMode.textContent = mode === 'login' ? 'New here? Create a free account' : 'Have an account? Log in';
    message.textContent = '';
  });
  const authForm = el('form', { className: 'plan-form' }, emailLabel, passwordLabel, nameLabel, submit, switchMode);
  authForm.addEventListener('submit', async event => {
    event.preventDefault();
    submit.disabled = true;
    const result = await postJson(mode === 'login' ? '/v1/auth/login' : '/v1/auth/signup', { email: email.value, password: password.value, name: name.value });
    submit.disabled = false;
    password.value = '';
    if (result.ok) { message.textContent = mode === 'login' ? 'You are logged in.' : 'Account created. You are on the Free plan. Check your inbox to confirm your email.'; refresh(); }
    else message.textContent = result.status === 404 ? 'Accounts are not enabled on this server.' : result.data.error || 'Something went wrong. Please try again.';
  });

  // Alternative: an API key from the administrator.
  const [keyLabel, keyInput] = field('API key', { type: 'password', autocomplete: 'off', placeholder: 'nsk_…', value: readKey() });
  const useKey = el('button', { type: 'button', textContent: 'Use key' });
  useKey.addEventListener('click', () => { writeKey(keyInput.value.trim()); refresh(); });
  const keyBox = el('details', { className: 'plan-key' }, el('summary', { textContent: 'Use an API key instead' }), keyLabel, useKey);

  // Forgotten password: ask for a reset link by email.
  const [forgotLabel, forgotEmail] = field('Your account email', { type: 'email', autocomplete: 'email', required: true });
  const forgotForm = el('form', { className: 'plan-form' }, forgotLabel, el('button', { type: 'submit', textContent: 'Email me a reset link' }));
  forgotForm.addEventListener('submit', async event => {
    event.preventDefault();
    const result = await postJson('/v1/auth/reset/request', { email: forgotEmail.value });
    message.textContent = result.data.message || result.data.error || 'Could not send a reset link.';
  });
  const forgotBox = el('details', { className: 'plan-key' }, el('summary', { textContent: 'Forgot password?' }), forgotForm);
  signedOut.append(authForm, forgotBox, keyBox);

  // Arriving from a reset link: choose a new password.
  const [resetLabel, resetPassword] = field('New password (10+ characters)', { type: 'password', autocomplete: 'new-password', required: true, minLength: 10 });
  const resetForm = el('form', { className: 'plan-form', hidden: true }, el('strong', { textContent: 'Choose a new password' }), resetLabel, el('button', { type: 'submit', textContent: 'Save new password' }));
  let resetToken = null;
  resetForm.addEventListener('submit', async event => {
    event.preventDefault();
    const result = await postJson('/v1/auth/reset/confirm', { token: resetToken, newPassword: resetPassword.value });
    resetPassword.value = '';
    if (result.ok) { resetForm.hidden = true; resetToken = null; message.textContent = 'Password changed. Log in with your new password.'; refresh(); }
    else message.textContent = result.data.error || 'Could not reset the password.';
  });

  // Signed-in: who you are, change password, log out.
  const who = el('p', { className: 'plan-who' });
  const resendVerify = el('button', { type: 'button', className: 'plan-link', textContent: 'Send a new confirmation link' });
  const verifyNotice = el('p', { className: 'plan-verify', hidden: true }, 'Your email is not confirmed yet. ', resendVerify);
  resendVerify.addEventListener('click', async () => {
    const result = await postJson('/v1/auth/verify/resend', { confirm: true });
    message.textContent = result.data.message || (result.data.status === 'already_verified' ? 'Your email is already confirmed.' : result.data.error || 'Could not send a link.');
  });
  const [currentLabel, current] = field('Current password', { type: 'password', autocomplete: 'current-password' });
  const [nextLabel, next] = field('New password (10+ characters)', { type: 'password', autocomplete: 'new-password', minLength: 10 });
  const changeBtn = el('button', { type: 'submit', textContent: 'Change password' });
  const changeForm = el('form', { className: 'plan-form' }, currentLabel, nextLabel, changeBtn);
  changeForm.addEventListener('submit', async event => {
    event.preventDefault();
    const result = await postJson('/v1/auth/password', { currentPassword: current.value, newPassword: next.value });
    current.value = next.value = '';
    message.textContent = result.ok ? 'Password changed. Other devices were logged out.' : result.data.error || 'Could not change the password.';
  });
  const logout = el('button', { type: 'button', textContent: 'Log out' });
  logout.addEventListener('click', async () => {
    await postJson('/v1/auth/logout', { confirm: true }); writeKey('');
    try { sessionStorage.setItem(NO_AUTO_LOGIN, '1'); } catch { /* storage unavailable */ }
    message.textContent = 'You are logged out.'; refresh();
  });
  const adminLink = el('a', { href: '/manage', className: 'plan-admin-link', textContent: 'Open admin panel', hidden: true });
  // API keys for programs and integrations; managed only from this signed-in session.
  const keyList = el('ul', { className: 'plan-keys' });
  const newKeyBox = el('div', { className: 'plan-new-key', hidden: true });
  const [labelLabel, keyName] = field('Label (for example "laptop" or "website")', { type: 'text', maxLength: 60 });
  const createKey = el('button', { type: 'submit', textContent: 'Create API key' });
  const keyForm = el('form', { className: 'plan-form' }, labelLabel, createKey);
  async function loadKeys() {
    const res = await window.fetch('/v1/account/keys');
    if (!res.ok) { keyList.replaceChildren(); return; }
    const data = await res.json();
    const active = data.keys.filter(k => !k.revokedAt);
    keyList.replaceChildren(...active.map(k => {
      const revoke = el('button', { type: 'button', className: 'plan-link', textContent: 'Revoke' });
      revoke.addEventListener('click', async () => {
        if (!confirm(`Revoke the key "${k.label || k.id}"? Programs using it will stop working.`)) return;
        const result = await postJson('/v1/account/keys/revoke', { id: k.id });
        message.textContent = result.ok ? 'Key revoked.' : result.data.error || 'Could not revoke the key.';
        loadKeys();
      });
      const used = k.lastUsedAt ? `last used ${new Date(k.lastUsedAt).toLocaleDateString()}` : 'not used yet';
      return el('li', {}, `…${k.id.slice(-6)} ${k.label ? '· ' + k.label + ' ' : ''}· created ${new Date(k.createdAt).toLocaleDateString()} · ${used} `, revoke);
    }));
    if (!active.length) keyList.append(el('li', { className: 'plan-note', textContent: 'No API keys yet.' }));
    createKey.disabled = active.length >= data.limit;
    createKey.title = createKey.disabled ? `Your plan allows ${data.limit} key(s). Revoke one to create another.` : '';
  }
  keyForm.addEventListener('submit', async event => {
    event.preventDefault();
    const result = await postJson('/v1/account/keys', { label: keyName.value });
    keyName.value = '';
    if (!result.ok) { message.textContent = result.data.error || 'Could not create a key.'; return; }
    const shown = el('input', { type: 'text', readOnly: true, value: result.data.apiKey, className: 'plan-key-value', ariaLabel: 'New API key' });
    const copy = el('button', { type: 'button', textContent: 'Copy' });
    copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(shown.value); copy.textContent = 'Copied'; } catch { shown.select(); } });
    const done = el('button', { type: 'button', className: 'plan-link', textContent: 'I have saved it' });
    done.addEventListener('click', () => { newKeyBox.replaceChildren(); newKeyBox.hidden = true; });
    newKeyBox.replaceChildren(el('strong', { textContent: result.data.notice }), shown, copy, done);
    newKeyBox.hidden = false;
    loadKeys();
  });
  const keysBox = el('details', { className: 'plan-key' }, el('summary', { textContent: 'API keys' }), keyList, newKeyBox, keyForm);
  keysBox.addEventListener('toggle', () => { if (keysBox.open) loadKeys(); });

  const usageButton = el('button', { type: 'button', textContent: 'Usage dashboard' });
  usageButton.addEventListener('click', openUsageDashboard);
  signedIn.append(who, adminLink, verifyNotice, usageButton, keysBox, el('details', { className: 'plan-key' }, el('summary', { textContent: 'Change password' }), changeForm), logout);

  const list = el('ul', { className: 'plan-list' });
  wrap.append(summary, usageLine, message, resetForm, signedOut, signedIn, el('strong', { textContent: 'Plans' }), list);
  container.append(wrap);
  wrap.addEventListener('toggle', () => { if (wrap.open && !list.children.length) renderPlans(list); });

  async function refresh() {
    const res = await window.fetch('/v1/account');
    if (res.status === 204 || res.status === 404) { wrap.hidden = true; return; } // plans are not enabled on this server
    if (!res.ok) return;
    const data = await res.json();
    badge.textContent = `Plan: ${data.plan[0].toUpperCase()}${data.plan.slice(1)}`;
    const left = f => data.usage.features[f].limit === null ? 'unlimited' : data.usage.features[f].remaining;
    usageLine.textContent = `Answers: ${left('chat')} · Tool runs: ${left('tool')} (this month)`;
    showTestBanner(data.testMode);
    if (!data.account && data.testMode && await autoLogin()) return refresh();
    const isSignedIn = Boolean(data.account);
    adminLink.hidden = !data.account?.isAdmin;
    signedIn.hidden = !isSignedIn;
    signedOut.hidden = isSignedIn;
    if (!isSignedIn) { newKeyBox.replaceChildren(); newKeyBox.hidden = true; keyList.replaceChildren(); keysBox.open = false; }
    who.textContent = isSignedIn ? `Signed in as ${data.account.email || data.account.name}` : '';
    verifyNotice.hidden = !(isSignedIn && data.account.email && data.account.emailVerified === false);
    forgotBox.hidden = !data.emailEnabled;
    if (banner && isSignedIn) banner.hidden = true;
  }

  // Links from account emails: read the token, remove it from the address bar and history, then act.
  const params = new URLSearchParams(location.search);
  const verifyToken = params.get('verify'), linkResetToken = params.get('reset');
  if (verifyToken || linkResetToken) {
    params.delete('verify'); params.delete('reset');
    history.replaceState(null, '', location.pathname + (params.size ? `?${params}` : '') + location.hash);
    wrap.open = true;
  }
  if (linkResetToken) { resetToken = linkResetToken; resetForm.hidden = false; message.textContent = ''; }
  (verifyToken ? postJson('/v1/auth/verify', { token: verifyToken }).then(result => {
    message.textContent = result.ok ? 'Thank you, your email is confirmed.' : result.data.error || 'This confirmation link did not work.';
  }) : Promise.resolve()).then(refresh);

  banner = el('div', { role: 'status', hidden: true });

  // Testing mode: sign in the public demo administrator automatically (unless the visitor
  // logged out in this tab) and keep a visible notice with the credentials.
  async function autoLogin() {
    try { if (sessionStorage.getItem(NO_AUTO_LOGIN)) return false; } catch { /* storage unavailable */ }
    const creds = await nativeFetch('/v1/test-mode').then(r => r.ok ? r.json() : null).catch(() => null);
    if (!creds) return false;
    return (await postJson('/v1/auth/login', { email: creds.email, password: creds.password })).ok;
  }
  let testBanner;
  async function showTestBanner(enabled) {
    if (!enabled || testBanner) return;
    const creds = await nativeFetch('/v1/test-mode').then(r => r.ok ? r.json() : null).catch(() => null);
    if (!creds) return;
    const again = el('button', { type: 'button', className: 'plan-link', textContent: 'Log in as the demo user' });
    again.addEventListener('click', () => { try { sessionStorage.removeItem(NO_AUTO_LOGIN); } catch {} refresh(); });
    testBanner = el('div', { className: 'test-mode-banner', role: 'note' },
      el('strong', { textContent: 'Testing mode. ' }),
      `Demo login: ${creds.email} / ${creds.password} (public; do not enter real data). `,
      el('a', { href: '/manage', textContent: 'Admin panel' }), ' · ', again);
    document.querySelector('main')?.prepend(testBanner);
  }
  document.querySelector('main')?.prepend(banner);
}
