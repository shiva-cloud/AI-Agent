// Admin panel: users, plans, tools, settings and the audit log (talks to /v1/manage/*).
// Sign-in uses an administrator's session cookie or an admin token kept in this tab only.

const TOKEN = 'northstar-admin-token';
const $ = selector => document.querySelector(selector);
const readToken = () => { try { return sessionStorage.getItem(TOKEN) || ''; } catch { return ''; } };
const writeToken = value => { try { value ? sessionStorage.setItem(TOKEN, value) : sessionStorage.removeItem(TOKEN); } catch { /* unavailable */ } };

function el(tag, props = {}, ...children) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children.filter(c => c !== null && c !== undefined && c !== false));
  return node;
}
const fmtDate = iso => iso ? new Date(iso).toLocaleString() : '—';
const limitText = value => value === null || value === undefined ? 'unlimited' : String(value);

async function api(path, {method = 'GET', body} = {}) {
  const headers = body ? {'Content-Type': 'application/json'} : {};
  const token = readToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, {method, headers, body: body ? JSON.stringify(body) : undefined});
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || `Request failed (${res.status})`), {status: res.status, code: data.code});
  return data;
}

function say(text, kind = 'ok') {
  const node = $('#m-message');
  node.textContent = text;
  node.className = `m-message ${kind}`;
}
async function run(action, success) {
  try { const result = await action(); if (success) say(typeof success === 'function' ? success(result) : success); return result; }
  catch (error) { say(error.message, 'error'); return null; }
}

// ---------------- Sign-in ----------------
async function testModeCredentials() {
  const res = await fetch('/v1/test-mode');
  return res.ok ? res.json() : null;
}

async function start() {
  const test = await testModeCredentials();
  if (test) {
    const banner = $('#m-test');
    banner.hidden = false;
    banner.replaceChildren(el('strong', {textContent: 'Testing mode. '}), `Demo administrator: ${test.email} / ${test.password} (public). Changes here affect this test server only.`);
  }
  try {
    const me = await api('/v1/manage/me');
    return open(me.actor);
  } catch (error) {
    if (test && error.status === 401) {
      const login = await fetch('/v1/auth/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email: test.email, password: test.password})});
      if (login.ok) return start();
    }
    showLogin(error.status === 403 ? 'This account is not an administrator. Sign in with an administrator account.' : '');
  }
}

function showLogin(message = '') {
  $('#m-login').hidden = false;
  $('#m-app').hidden = true;
  $('#m-login-message').textContent = message;
}

$('#m-login-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData(event.target);
  const res = await fetch('/v1/auth/login', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({email: form.get('email'), password: form.get('password')})});
  const data = await res.json().catch(() => ({}));
  event.target.reset();
  if (!res.ok) { $('#m-login-message').textContent = data.error || 'Sign-in failed.'; return; }
  writeToken('');
  start();
});
$('#m-token-form').addEventListener('submit', event => {
  event.preventDefault();
  writeToken(new FormData(event.target).get('token').trim());
  event.target.reset();
  start();
});

function open(actor) {
  $('#m-login').hidden = true;
  $('#m-app').hidden = false;
  const signOut = el('button', {type: 'button', className: 'm-btn', textContent: 'Sign out'});
  signOut.addEventListener('click', async () => {
    writeToken('');
    await fetch('/v1/auth/logout', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({confirm: true})});
    try { sessionStorage.setItem('northstar-no-auto-login', '1'); } catch { /* unavailable */ }
    location.reload();
  });
  $('#m-who').replaceChildren(`Signed in as ${actor} `, signOut);
  showTab('overview');
}

// ---------------- Tabs ----------------
const loaders = {overview: loadOverview, users: loadUsers, plans: loadPlans, tools: loadTools, settings: loadSettings, audit: loadAudit};
function showTab(name) {
  for (const button of document.querySelectorAll('.m-tabs button')) button.setAttribute('aria-selected', String(button.dataset.tab === name));
  for (const section of document.querySelectorAll('.m-tab')) section.hidden = section.id !== `tab-${name}`;
  say('');
  loaders[name]();
}
for (const button of document.querySelectorAll('.m-tabs button')) button.addEventListener('click', () => showTab(button.dataset.tab));

const table = (headers, rows) => el('div', {className: 'm-table-wrap'}, el('table', {className: 'm-table'},
  el('thead', {}, el('tr', {}, ...headers.map(h => el('th', {textContent: h})))),
  el('tbody', {}, ...(rows.length ? rows : [el('tr', {}, el('td', {colSpan: headers.length, textContent: 'Nothing here yet.'}))]))));
const tile = (label, value) => el('div', {className: 'm-tile'}, el('span', {textContent: label}), el('strong', {textContent: String(value)}));

// ---------------- Overview ----------------
async function loadOverview() {
  const section = $('#tab-overview');
  const data = await run(() => api('/v1/manage/overview'));
  if (!data) return;
  section.replaceChildren(
    el('h2', {textContent: `Overview (${data.period}, UTC)`}),
    el('div', {className: 'm-tiles'},
      tile('Accounts', data.accounts), tile('Active', data.active), tile('Suspended', data.suspended), tile('Administrators', data.admins),
      tile('Email logins', data.withLogin), tile('Active API keys', data.activeKeys),
      tile('Chat answers this month', data.usageThisMonth.chat), tile('Tool runs this month', data.usageThisMonth.tool),
      tile('Tools turned off', `${data.disabledTools} of ${data.knownTools}`)),
    el('h2', {textContent: 'Accounts by plan'}),
    table(['Plan', 'Accounts'], data.byPlan.map(r => el('tr', {}, el('td', {textContent: r.plan}), el('td', {textContent: String(r.accounts)})))),
    el('p', {className: 'm-help', textContent: `Sign-ups: ${data.settings.signupsOpen ? 'open' : 'closed'} · New accounts and anonymous visitors use the "${data.settings.defaultPlan}" plan.${data.testMode ? ' Testing mode is on.' : ''}`}));
}

// ---------------- Users ----------------
let plansCache = [];
async function plans() {
  if (!plansCache.length) plansCache = (await api('/v1/manage/plans')).plans;
  return plansCache;
}
const planSelect = (value, onChange) => {
  const select = el('select', {}, ...plansCache.map(p => el('option', {value: p.id, textContent: `${p.name}${p.enabled ? '' : ' (off)'}`, selected: p.id === value})));
  if (onChange) select.addEventListener('change', () => onChange(select.value));
  return select;
};

async function loadUsers() {
  const section = $('#tab-users');
  await run(plans);
  const search = el('input', {type: 'search', placeholder: 'Search email, name or id'});
  const planFilter = el('select', {}, el('option', {value: '', textContent: 'All plans'}), ...plansCache.map(p => el('option', {value: p.id, textContent: p.name})));
  const statusFilter = el('select', {}, el('option', {value: '', textContent: 'All statuses'}), el('option', {value: 'active', textContent: 'Active'}), el('option', {value: 'suspended', textContent: 'Suspended'}));
  const list = el('div');
  const detail = el('div', {className: 'm-detail'});

  async function refresh() {
    const params = new URLSearchParams({q: search.value, plan: planFilter.value, status: statusFilter.value});
    const data = await run(() => api(`/v1/manage/users?${params}`));
    if (!data) return;
    list.replaceChildren(table(['Account', 'Plan', 'Status', 'Role', 'Email', 'Usage (month)', 'Keys', 'Actions'], data.users.map(userRow)));
  }
  function userRow(u) {
    const status = el('button', {type: 'button', className: 'm-btn', textContent: u.status === 'active' ? 'Suspend' : 'Activate'});
    status.addEventListener('click', () => update(u, {status: u.status === 'active' ? 'suspended' : 'active'}));
    const role = el('button', {type: 'button', className: 'm-btn', textContent: u.isAdmin ? 'Remove admin' : 'Make admin'});
    role.addEventListener('click', () => update(u, {isAdmin: !u.isAdmin}));
    const view = el('button', {type: 'button', className: 'm-btn', textContent: 'Details'});
    view.addEventListener('click', () => showUser(u.id));
    return el('tr', {},
      el('td', {}, el('strong', {textContent: u.name}), el('br'), el('small', {textContent: u.email ?? `id ${u.id.slice(0, 8)}… (API key only)`})),
      el('td', {}, planSelect(u.plan, plan => update(u, {plan}))),
      el('td', {}, el('span', {className: `m-badge ${u.status === 'active' ? 'on' : 'off'}`, textContent: u.status})),
      el('td', {}, u.isAdmin ? el('span', {className: 'm-badge admin', textContent: 'admin'}) : 'customer'),
      el('td', {textContent: u.email ? (u.emailVerified ? 'confirmed' : 'not confirmed') : '—'}),
      el('td', {textContent: `${u.usage.chat} answers · ${u.usage.tool} tools`}),
      el('td', {textContent: String(u.activeKeys)}),
      el('td', {}, el('div', {className: 'm-actions'}, view, status, role)));
  }
  async function update(u, changes) {
    if (await run(() => api(`/v1/manage/users/${u.id}`, {method: 'POST', body: changes}), 'Saved.')) { refresh(); if (detail.dataset.id === u.id) showUser(u.id); }
  }
  async function showUser(id) {
    const u = await run(() => api(`/v1/manage/users/${id}`));
    if (!u) return;
    detail.dataset.id = id;
    const action = (label, path, confirmText, onDone, danger) => {
      const button = el('button', {type: 'button', className: `m-btn${danger ? ' m-danger' : ''}`, textContent: label});
      button.addEventListener('click', async () => {
        if (confirmText && !confirm(confirmText)) return;
        const result = await run(() => api(`/v1/manage/users/${id}/${path}`, {method: 'POST', body: {}}), 'Done.');
        if (result) onDone?.(result);
      });
      return button;
    };
    const secret = el('div');
    const verify = el('button', {type: 'button', className: 'm-btn', textContent: u.emailVerified ? 'Mark email unconfirmed' : 'Mark email confirmed', disabled: !u.email});
    verify.addEventListener('click', () => update(u, {emailVerified: !u.emailVerified}));
    const rename = el('input', {type: 'text', value: u.name, maxLength: 100});
    const saveName = el('button', {type: 'button', className: 'm-btn', textContent: 'Rename'});
    saveName.addEventListener('click', () => update(u, {name: rename.value}));
    const del = el('button', {type: 'button', className: 'm-btn m-danger', textContent: 'Delete account'});
    del.addEventListener('click', async () => {
      const expected = u.email ?? u.id;
      const typed = prompt(`This permanently deletes the account, its keys, sessions and usage.\nType ${u.email ? 'the email address' : 'the account id'} to confirm:\n${expected}`);
      if (typed === null) return;
      if (await run(() => api(`/v1/manage/users/${id}/delete`, {method: 'POST', body: {confirm: typed}}), 'Account deleted.')) { detail.replaceChildren(); refresh(); }
    });
    detail.replaceChildren(el('div', {className: 'm-card'},
      el('h2', {textContent: `${u.name}${u.email ? ` · ${u.email}` : ''}`}),
      el('p', {className: 'm-muted', textContent: `Id ${u.id} · created ${fmtDate(u.createdAt)} · ${u.activeSessions} active session(s)`}),
      el('div', {className: 'm-form-inline'}, el('label', {}, 'Name', rename), saveName),
      el('div', {className: 'm-actions m-detail'},
        action('Reset password', 'reset-password', 'Set a temporary password and sign this account out everywhere?', r => secret.replaceChildren('Temporary password (shown once): ', el('span', {className: 'm-secret', textContent: r.temporaryPassword}))),
        action('Revoke all API keys', 'revoke-keys', 'Revoke every API key of this account?', () => showUser(id)),
        action('Sign out everywhere', 'end-sessions', 'End all browser sessions of this account?', () => showUser(id)),
        verify, del),
      secret,
      el('h2', {className: 'm-detail', textContent: 'API keys'}),
      table(['Id', 'Label', 'Created', 'Last used', 'Status'], u.keys.map(k => el('tr', {}, el('td', {textContent: `…${k.id.slice(-6)}`}), el('td', {textContent: k.label ?? '—'}), el('td', {textContent: fmtDate(k.createdAt)}), el('td', {textContent: fmtDate(k.lastUsedAt)}), el('td', {textContent: k.revokedAt ? 'revoked' : 'active'})))),
      el('h2', {className: 'm-detail', textContent: 'Usage this month'}),
      el('p', {textContent: `Chat answers ${u.usageReport.totals.chat} of ${limitText(u.usageReport.limits.chat)} · Tool runs ${u.usageReport.totals.tool} of ${limitText(u.usageReport.limits.tool)}`})));
    detail.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  // Create a user.
  const create = el('form', {className: 'm-form-inline'},
    el('label', {}, 'Email', el('input', {type: 'email', name: 'email', required: true})),
    el('label', {}, 'Password (10+)', el('input', {type: 'text', name: 'password', required: true, minLength: 10})),
    el('label', {}, 'Name', el('input', {type: 'text', name: 'name'})),
    el('label', {}, 'Plan', Object.assign(planSelect(plansCache[0]?.id), {name: 'plan'})),
    el('label', {}, el('span', {textContent: 'Administrator'}), el('input', {type: 'checkbox', name: 'isAdmin'})),
    el('button', {type: 'submit', textContent: 'Create account'}));
  create.addEventListener('submit', async event => {
    event.preventDefault();
    const form = new FormData(create);
    const created = await run(() => api('/v1/manage/users', {method: 'POST', body: {email: form.get('email'), password: form.get('password'), name: form.get('name'), plan: form.get('plan'), isAdmin: form.get('isAdmin') === 'on'}}), 'Account created.');
    if (created) { create.reset(); refresh(); }
  });

  for (const input of [search, planFilter, statusFilter]) input.addEventListener('input', refresh);
  section.replaceChildren(el('h2', {textContent: 'Users'}), el('div', {className: 'm-toolbar'}, search, planFilter, statusFilter),
    list, detail, el('div', {className: 'm-card m-detail'}, el('h2', {textContent: 'Add a user'}), create,
      el('p', {className: 'm-help', textContent: 'The new user can sign in at once with this email and password. Share the password securely.'})));
  refresh();
}

// ---------------- Plans ----------------
async function loadPlans() {
  const section = $('#tab-plans');
  plansCache = [];
  const data = await run(() => api('/v1/manage/plans'));
  if (!data) return;
  plansCache = data.plans;
  const row = plan => {
    const isNew = !plan;
    plan ??= {id: '', name: '', priceCadMonthly: 0, tiers: ['essential', 'core'], monthly: {chat: null, tool: null}, apiKeys: 1, enabled: true, accounts: 0};
    const id = el('input', {type: 'text', value: plan.id, readOnly: !isNew, placeholder: 'new-plan-id'});
    const name = el('input', {type: 'text', value: plan.name, placeholder: 'Name'});
    const price = el('input', {type: 'number', className: 'm-num', min: 0, step: '0.01', value: plan.priceCadMonthly});
    const chat = el('input', {type: 'number', className: 'm-num', min: 0, placeholder: 'unlimited', value: plan.monthly.chat ?? ''});
    const tool = el('input', {type: 'number', className: 'm-num', min: 0, placeholder: 'unlimited', value: plan.monthly.tool ?? ''});
    const keys = el('input', {type: 'number', className: 'm-num', min: 0, value: plan.apiKeys});
    const tiers = el('div', {className: 'm-tiers'}, ...data.tiers.map(t => el('label', {}, el('input', {type: 'checkbox', value: t, checked: plan.tiers.includes(t), disabled: t === 'essential'}), t)));
    const enabled = el('input', {type: 'checkbox', checked: plan.enabled});
    const save = el('button', {type: 'button', className: 'm-btn', textContent: isNew ? 'Add plan' : 'Save'});
    save.addEventListener('click', async () => {
      const body = {id: id.value.trim(), name: name.value, priceCadMonthly: Number(price.value), tiers: [...tiers.querySelectorAll('input:checked')].map(c => c.value),
        monthly: {chat: chat.value === '' ? null : Number(chat.value), tool: tool.value === '' ? null : Number(tool.value)}, apiKeys: Number(keys.value), enabled: enabled.checked};
      if (await run(() => api('/v1/manage/plans', {method: 'POST', body}), isNew ? 'Plan added.' : 'Plan saved.')) loadPlans();
    });
    const remove = el('button', {type: 'button', className: 'm-btn m-danger', textContent: 'Delete', disabled: isNew});
    remove.addEventListener('click', async () => {
      if (!confirm(`Delete the "${plan.name}" plan?`)) return;
      if (await run(() => api(`/v1/manage/plans/${plan.id}/delete`, {method: 'POST', body: {}}), 'Plan deleted.')) loadPlans();
    });
    return el('tr', {}, el('td', {}, id), el('td', {}, name), el('td', {}, price), el('td', {}, chat), el('td', {}, tool), el('td', {}, keys), el('td', {}, tiers),
      el('td', {}, enabled), el('td', {textContent: isNew ? '—' : String(plan.accounts)}), el('td', {}, el('div', {className: 'm-actions'}, save, remove)));
  };
  section.replaceChildren(el('h2', {textContent: 'Plans'}),
    el('p', {className: 'm-help', textContent: 'Leave a monthly limit empty for unlimited. "Essential" (safety and legal-rights tools) is always included. A plan that is turned off is hidden from the public plan list but keeps its existing accounts. A plan with accounts cannot be deleted.'}),
    table(['Id', 'Name', 'CAD / month', 'Chat answers / month', 'Tool runs / month', 'API keys', 'Tool tiers', 'On', 'Accounts', ''], [...data.plans.map(row), row(null)]));
}

// ---------------- Tools ----------------
async function loadTools() {
  const section = $('#tab-tools');
  const data = await run(() => api('/v1/manage/tools'));
  if (!data) return;
  const search = el('input', {type: 'search', placeholder: 'Filter tools'});
  const onlyChanged = el('input', {type: 'checkbox'});
  const body = el('tbody');
  const render = () => {
    const term = search.value.trim().toLowerCase();
    const rows = data.tools.filter(t => (!term || t.tool.includes(term)) && (!onlyChanged.checked || t.overridden || t.disabled));
    body.replaceChildren(...rows.map(t => {
      const tier = el('select', {}, el('option', {value: '', textContent: 'default'}), ...['essential', 'core', 'plus', 'pro'].map(v => el('option', {value: v, textContent: v, selected: t.overridden && t.tier === v})));
      const on = el('input', {type: 'checkbox', checked: !t.disabled});
      const save = async changes => {
        const updated = await run(() => api(`/v1/manage/tools/${t.tool}`, {method: 'POST', body: changes}), `${t.tool} saved.`);
        if (updated) { Object.assign(t, updated); render(); }
      };
      tier.addEventListener('change', () => save({tier: tier.value}));
      on.addEventListener('change', () => save({disabled: !on.checked}));
      return el('tr', {}, el('td', {}, el('code', {textContent: t.tool})), el('td', {textContent: t.tier}), el('td', {}, tier), el('td', {}, on, t.disabled ? el('span', {className: 'm-badge off', textContent: ' off'}) : null));
    }));
  };
  search.addEventListener('input', render);
  onlyChanged.addEventListener('change', render);
  section.replaceChildren(el('h2', {textContent: `Tools (${data.tools.length})`}),
    el('p', {className: 'm-help', textContent: 'The tier decides which plans can use a tool. A tool that is turned off answers "turned off by the administrator" for everyone.'}),
    el('div', {className: 'm-toolbar'}, search, el('label', {}, onlyChanged, ' Only changed tools')),
    el('div', {className: 'm-table-wrap'}, el('table', {className: 'm-table'}, el('thead', {}, el('tr', {}, ...['Tool', 'Current tier', 'Tier setting', 'On'].map(h => el('th', {textContent: h})))), body)));
  render();
}

// ---------------- Settings ----------------
async function loadSettings() {
  const section = $('#tab-settings');
  const data = await run(() => api('/v1/manage/settings'));
  if (!data) return;
  const signups = el('input', {type: 'checkbox', checked: data.settings.signupsOpen});
  const defaultPlan = el('select', {}, ...data.plans.filter(p => p.enabled).map(p => el('option', {value: p.id, textContent: p.name, selected: p.id === data.settings.defaultPlan})));
  const save = el('button', {type: 'button', textContent: 'Save settings'});
  save.addEventListener('click', () => run(() => api('/v1/manage/settings', {method: 'POST', body: {signupsOpen: signups.checked, defaultPlan: defaultPlan.value}}), 'Settings saved.'));
  section.replaceChildren(el('div', {className: 'm-card'}, el('h2', {textContent: 'Settings'}),
    el('div', {className: 'm-form'},
      el('label', {}, el('span', {}, signups, ' Allow new sign-ups')),
      el('label', {}, 'Plan for new accounts and anonymous visitors', defaultPlan),
      save),
    el('p', {className: 'm-help', textContent: 'Prices are placeholders: no billing provider is connected, so changing a plan here does not charge anyone.'})));
}

// ---------------- Audit ----------------
async function loadAudit() {
  const section = $('#tab-audit');
  const data = await run(() => api('/v1/manage/audit?limit=300'));
  if (!data) return;
  section.replaceChildren(el('h2', {textContent: 'Audit log'}),
    el('p', {className: 'm-help', textContent: 'Every change made in this panel or through the admin API, newest first.'}),
    table(['When', 'Who', 'Action', 'Target', 'Details'], data.entries.map(e => el('tr', {},
      el('td', {textContent: fmtDate(e.at)}), el('td', {textContent: e.actor}), el('td', {textContent: e.action}), el('td', {textContent: e.target ?? '—'}),
      el('td', {}, el('code', {textContent: e.details ? JSON.stringify(e.details) : ''}))))));
}

start();
