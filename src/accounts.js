import {DatabaseSync} from 'node:sqlite';
import {createHash, createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual} from 'node:crypto';
import {DEFAULT_PLANS, TIERS, createPlanRegistry, validatePlan} from './plans.js';
import {hashPasswordAsync,verifyPasswordAsync} from './password-work.js';

// Accounts, API keys and monthly usage for SaaS mode (enabled with ACCOUNTS_DB_PATH).
// - API keys look like "nsk_<43 chars>"; only their SHA-256 hash is stored.
// - Requests without a key are metered on the default plan under a keyed hash of the
//   client address that changes every month, so no IP address is stored.
// - Usage is recorded only for successful responses (status < 400).
// - Customers can also sign up with email and password: passwords are scrypt hashes,
//   session tokens are stored as SHA-256 hashes, and repeated failed logins are throttled.
// - Plans, tool tiers and settings can be changed by administrators; every change is
//   written to an audit log. A monthly limit of null means unlimited.

const KEY_PREFIX = 'nsk_';
const SESSION_DAYS = 30;
export const VERIFY_HOURS = 24, RESET_MINUTES = 60;
const EMAIL_TOKENS_PER_HOUR = 3;
const MAX_FAILED_LOGINS = 10, FAILED_LOGIN_WINDOW_MS = 15 * 60 * 1000;
const SCRYPT = {N: 16384, r: 8, p: 1, keylen: 32};
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/;
const TABLES = ['accounts', 'api_keys', 'usage', 'credentials', 'sessions', 'login_attempts', 'email_tokens', 'usage_daily', 'plan_configs', 'tool_settings', 'settings', 'admin_audit', 'usage_reservations'];
const DEFAULT_SETTINGS = {signupsOpen: true, defaultPlan: 'free'};

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT.keylen, {N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p});
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}
function verifyPassword(password, stored) {
  const [scheme, N, r, p, salt, hash] = String(stored).split('$');
  if (scheme !== 'scrypt') return false;
  const expected = Buffer.from(hash, 'base64url');
  const actual = scryptSync(password, Buffer.from(salt, 'base64url'), expected.length, {N: Number(N), r: Number(r), p: Number(p)});
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
// Compared against when an email is unknown, so a login takes about as long either way.
const DUMMY_HASH = hashPassword(randomBytes(16).toString('hex'));
const normalizeEmail = email => typeof email === 'string' ? email.trim().toLowerCase() : '';
function checkPassword(password) {
  if (typeof password !== 'string' || password.length < 10 || password.length > 200) throw new PlanError(400, 'weak_password', 'Use a password of 10 to 200 characters.');
  if (new Set(password).size < 4) throw new PlanError(400, 'weak_password', 'Use a password with more variety (at least 4 different characters).');
}

export class PlanError extends Error {
  constructor(status, code, message, details = {}) { super(message); this.status = status; this.code = code; this.details = details; }
}
const bad = message => new PlanError(400, 'invalid_request', message);

const hashKey = key => createHash('sha256').update(key).digest('hex');
export const periodOf = (now = new Date()) => now.toISOString().slice(0, 7);
const nextPeriodStart = (now = new Date()) => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();

export function openAccounts(path, {clock = () => new Date(), secret} = {}) {
  if (typeof path !== 'string' || !path.trim()) throw new Error('An explicit accounts path is required');
  const anonSecret = secret ?? randomBytes(32);
  const db = new DatabaseSync(path, {timeout: 100});
  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r => r.name);
    if (tables.some(name => !TABLES.includes(name))) throw new Error('Use a separate accounts database');
    db.exec(`PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS accounts(id TEXT PRIMARY KEY, name TEXT NOT NULL, plan TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS api_keys(hash TEXT PRIMARY KEY, account_id TEXT NOT NULL, label TEXT, created_at TEXT NOT NULL, revoked_at TEXT);
      CREATE TABLE IF NOT EXISTS usage_reservations(id TEXT PRIMARY KEY,subject TEXT NOT NULL,period TEXT NOT NULL,feature TEXT NOT NULL,day TEXT NOT NULL,expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS usage(subject TEXT NOT NULL, period TEXT NOT NULL, feature TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(subject, period, feature));
      CREATE TABLE IF NOT EXISTS credentials(account_id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY, account_id TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS login_attempts(email_hash TEXT NOT NULL, at INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS login_attempts_by_email ON login_attempts(email_hash, at);
      CREATE TABLE IF NOT EXISTS usage_daily(subject TEXT NOT NULL, day TEXT NOT NULL, feature TEXT NOT NULL, key_id TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(subject, day, feature, key_id));
      CREATE TABLE IF NOT EXISTS email_tokens(hash TEXT PRIMARY KEY, account_id TEXT NOT NULL, purpose TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL, used_at TEXT);
      CREATE TABLE IF NOT EXISTS plan_configs(id TEXT PRIMARY KEY, position INTEGER NOT NULL, json TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS tool_settings(tool TEXT PRIMARY KEY, tier TEXT, disabled INTEGER NOT NULL DEFAULT 0);
      CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS admin_audit(id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT, details TEXT);`);
    // Columns added after the first releases; existing databases gain them in place.
    if (!db.prepare('PRAGMA table_info(credentials)').all().some(c => c.name === 'email_verified_at')) db.exec('ALTER TABLE credentials ADD COLUMN email_verified_at TEXT');
    if (!db.prepare('PRAGMA table_info(api_keys)').all().some(c => c.name === 'last_used_at')) db.exec('ALTER TABLE api_keys ADD COLUMN last_used_at TEXT');
    if (!db.prepare('PRAGMA table_info(accounts)').all().some(c => c.name === 'is_admin')) db.exec('ALTER TABLE accounts ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0');
    // Seed the plan table once with the defaults, so the catalog is fully editable.
    if (!db.prepare('SELECT count(*) n FROM plan_configs').get().n) {
      DEFAULT_PLANS.forEach((plan, i) => db.prepare('INSERT INTO plan_configs VALUES(?,?,?)').run(plan.id, i, JSON.stringify(plan)));
    }
  } catch (error) { db.close(); throw error; }

  // ---- Plan registry (rebuilt after every administrative change) ----
  let registry;
  function loadRegistry() {
    const plans = db.prepare('SELECT json FROM plan_configs ORDER BY position, id').all().map(r => JSON.parse(r.json));
    const toolOverrides = Object.fromEntries(db.prepare('SELECT tool, tier, disabled FROM tool_settings').all().map(r => [r.tool, {...(r.tier ? {tier: r.tier} : {}), ...(r.disabled ? {disabled: true} : {})}]));
    registry = createPlanRegistry({plans, toolOverrides});
  }
  loadRegistry();
  const settings = () => {
    const stored = Object.fromEntries(db.prepare('SELECT key, value FROM settings').all().map(r => [r.key, JSON.parse(r.value)]));
    return {...DEFAULT_SETTINGS, ...stored};
  };
  /** The plan that applies to an account: its own, or the default plan when that plan was removed. */
  const planFor = planId => registry.plan(planId) ?? registry.plan(settings().defaultPlan) ?? registry.plans()[0];

  const account = id => {
    const row = db.prepare('SELECT id, name, plan, status, is_admin, created_at AS createdAt FROM accounts WHERE id=?').get(id);
    if (!row) return null;
    const {is_admin: isAdmin, ...rest} = row;
    return {...rest, isAdmin: Boolean(isAdmin)};
  };
  const used = (subject, period, feature) => db.prepare('SELECT count FROM usage WHERE subject=? AND period=? AND feature=?').get(subject, period, feature)?.count ?? 0;
  const audit = (actor, action, target = null, details = null) =>
    db.prepare('INSERT INTO admin_audit(at, actor, action, target, details) VALUES(?,?,?,?,?)').run(clock().toISOString(), String(actor).slice(0, 200), action, target, details === null ? null : JSON.stringify(details).slice(0, 2000));
  const activeAdmins = () => db.prepare("SELECT count(*) n FROM accounts WHERE is_admin=1 AND status='active'").get().n;

  function issueKey(accountId, label = null) {
    const acct = account(accountId);
    if (!acct) throw new Error('Unknown account');
    const active = db.prepare('SELECT count(*) n FROM api_keys WHERE account_id=? AND revoked_at IS NULL').get(accountId).n;
    const plan = planFor(acct.plan);
    if (active >= plan.apiKeys) throw new PlanError(409, 'key_limit_reached', `The ${plan.name} plan allows ${plan.apiKeys} active API key(s). Revoke one first, or upgrade.`);
    const key = KEY_PREFIX + randomBytes(32).toString('base64url');
    db.prepare('INSERT INTO api_keys(hash, account_id, label, created_at) VALUES(?,?,?,?)').run(hashKey(key), accountId, label ? String(label).replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, 60) || null : null, clock().toISOString());
    return key;
  }

  function startSession(accountId) {
    const token = randomBytes(32).toString('base64url');
    const now = clock();
    db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(hashKey(token), accountId, now.toISOString(), new Date(now.getTime() + SESSION_DAYS * 86400000).toISOString());
    return token;
  }
  const emailHash = email => hashKey('login|' + email);

  // One-time email tokens; at most EMAIL_TOKENS_PER_HOUR per account and purpose, so the
  // mail endpoints cannot be used to flood someone's inbox.
  function createEmailToken(accountId, purpose) {
    const now = clock();
    const recent = db.prepare('SELECT count(*) n FROM email_tokens WHERE account_id=? AND purpose=? AND created_at > ?').get(accountId, purpose, new Date(now.getTime() - 3600000).toISOString()).n;
    if (recent >= EMAIL_TOKENS_PER_HOUR) return null;
    const token = randomBytes(32).toString('base64url');
    const lifetimeMs = purpose === 'verify' ? VERIFY_HOURS * 3600000 : RESET_MINUTES * 60000;
    db.prepare('INSERT INTO email_tokens VALUES(?,?,?,?,?,NULL)').run(hashKey(token), accountId, purpose, now.toISOString(), new Date(now.getTime() + lifetimeMs).toISOString());
    return token;
  }
  function useEmailToken(token, purpose) {
    if (typeof token !== 'string' || token.length < 20 || token.length > 100) throw new PlanError(400, 'invalid_token', 'This link is not valid. Ask for a new one.');
    const row = db.prepare('SELECT account_id, expires_at, used_at FROM email_tokens WHERE hash=? AND purpose=?').get(hashKey(token), purpose);
    if (!row || row.used_at) throw new PlanError(400, 'invalid_token', 'This link is not valid or was already used. Ask for a new one.');
    if (row.expires_at <= clock().toISOString()) throw new PlanError(400, 'expired_token', 'This link has expired. Ask for a new one.');
    db.prepare('UPDATE email_tokens SET used_at=? WHERE hash=?').run(clock().toISOString(), hashKey(token));
    return row.account_id;
  }

  function insertAccount({name, plan, email, password, passwordHash, isAdmin = false, verified = false}) {
    const id = randomUUID(), now = clock().toISOString();
    db.exec('BEGIN IMMEDIATE');
    try {
      db.prepare('INSERT INTO accounts(id, name, plan, status, created_at, is_admin) VALUES(?,?,?,?,?,?)').run(id, name, plan, 'active', now, isAdmin ? 1 : 0);
      if (email) db.prepare('INSERT INTO credentials(account_id, email, password_hash, created_at, email_verified_at) VALUES(?,?,?,?,?)').run(id, email, passwordHash ?? hashPassword(password), now, verified ? now : null);
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
    return id;
  }

  function usageFor(subject, planId) {
    const now = clock(), period = periodOf(now), plan = planFor(planId);
    return {period, resetAt: nextPeriodStart(now), features: Object.fromEntries(['chat', 'tool'].map(f => {
      const count = used(subject, period, f), limit = plan.monthly[f];
      return [f, {used: count, limit, remaining: limit === null ? null : Math.max(0, limit - count)}];
    }))};
  }

  function usageReport(accountId, planId) {
    const now = clock(), period = periodOf(now), plan = planFor(planId), subject = accountSubject({id: accountId});
    const today = now.toISOString().slice(0, 10);
    const rows = db.prepare('SELECT day, feature, key_id AS keyId, count FROM usage_daily WHERE subject=? AND day >= ? AND day <= ?').all(subject, period + '-01', today);
    const daily = [];
    for (let d = 1; d <= Number(today.slice(8, 10)); d++) daily.push({day: `${period}-${String(d).padStart(2, '0')}`, chat: 0, tool: 0});
    const byDay = new Map(daily.map(row => [row.day, row]));
    const keys = new Map(db.prepare('SELECT substr(hash, 1, 12) AS id, label, revoked_at AS revokedAt FROM api_keys WHERE account_id=?').all(accountId).map(k => [k.id, k]));
    const byKey = new Map();
    for (const row of rows) {
      if (byDay.has(row.day)) byDay.get(row.day)[row.feature] += row.count;
      const entry = byKey.get(row.keyId) ?? {keyId: row.keyId, label: row.keyId === 'browser' ? 'Browser (signed in)' : keys.get(row.keyId)?.label ?? null, revoked: Boolean(keys.get(row.keyId)?.revokedAt), chat: 0, tool: 0};
      entry[row.feature] += row.count;
      byKey.set(row.keyId, entry);
    }
    const totals = {chat: used(subject, period, 'chat'), tool: used(subject, period, 'tool')};
    const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
    const elapsedDays = Number(today.slice(8, 10));
    const projection = f => Math.round(totals[f] / elapsedDays * daysInMonth);
    return {
      period, plan: plan.id, resetAt: nextPeriodStart(now), daysInMonth, elapsedDays,
      limits: {...plan.monthly}, totals,
      projected: {chat: projection('chat'), tool: projection('tool')},
      daily, byKey: [...byKey.values()].sort((a, b) => (b.chat + b.tool) - (a.chat + a.tool) || a.keyId.localeCompare(b.keyId)),
      note: 'Safety and legal-rights tools are not counted. A limit of null means unlimited. Days are UTC.'
    };
  }

  function userRow(id) {
    const acct = account(id);
    if (!acct) return null;
    const cred = db.prepare('SELECT email, email_verified_at FROM credentials WHERE account_id=?').get(id);
    const period = periodOf(clock()), subject = accountSubject({id});
    return {
      ...acct, email: cred?.email ?? null, emailVerified: Boolean(cred?.email_verified_at),
      activeKeys: db.prepare('SELECT count(*) n FROM api_keys WHERE account_id=? AND revoked_at IS NULL').get(id).n,
      activeSessions: db.prepare('SELECT count(*) n FROM sessions WHERE account_id=? AND expires_at > ?').get(id, clock().toISOString()).n,
      usage: {chat: used(subject, period, 'chat'), tool: used(subject, period, 'tool')}
    };
  }
  const requireUser = id => { const row = userRow(id); if (!row) throw new PlanError(404, 'not_found', 'No such account.'); return row; };
  /** Refuses changes that would leave no active administrator account. */
  function guardLastAdmin(target, change) {
    if (!target.isAdmin || target.status !== 'active') return;
    const losesAdmin = change.isAdmin === false || change.status === 'suspended' || change.delete === true;
    if (losesAdmin && activeAdmins() <= 1) throw new PlanError(409, 'last_admin', 'This is the last active administrator. Make someone else an administrator first.');
  }

  const api = {
    close: () => db.close(),
    sessionMaxAgeSeconds: SESSION_DAYS * 86400,
    checkReady: () => db.prepare('SELECT 1').get(),
    registry: () => registry,
    settings,

    /** Creates an account with email and password on the default plan and starts a session. */
    signUp({email, password, name}, passwordHash) {
      const current = settings();
      if (!current.signupsOpen) throw new PlanError(403, 'signups_closed', 'New sign-ups are closed right now.');
      const normalized = normalizeEmail(email);
      if (!EMAIL.test(normalized) || normalized.length > 254) throw new PlanError(400, 'invalid_email', 'Enter a valid email address.');
      checkPassword(password);
      if (db.prepare('SELECT 1 FROM credentials WHERE email=?').get(normalized)) throw new PlanError(409, 'email_taken', 'An account with this email already exists. Log in instead.');
      const displayName = typeof name === 'string' && name.trim() ? name.trim().slice(0, 100) : normalized.split('@')[0];
      const id = insertAccount({name: displayName, plan: planFor(current.defaultPlan).id, email: normalized, password, passwordHash});
      return {account: {...account(id), email: normalized, emailVerified: false}, sessionToken: startSession(id), verifyToken: createEmailToken(id, 'verify')};
    },

    async signUpAsync(input) {
      checkPassword(input.password);
      if(!EMAIL.test(normalizeEmail(input.email))||normalizeEmail(input.email).length>254)throw new PlanError(400,'invalid_email','Enter a valid email address.');
      if(!settings().signupsOpen)throw new PlanError(403,'signups_closed','New sign-ups are closed right now.');
      const prepared=await hashPasswordAsync(input.password);
      return api.signUp(input,prepared);
    },
    async logInAsync({email,password}) {
      const normalized=normalizeEmail(email),key=emailHash(normalized),now=clock().getTime();
      db.exec('BEGIN IMMEDIATE');
      try {
        db.prepare('DELETE FROM login_attempts WHERE at < ?').run(now-FAILED_LOGIN_WINDOW_MS);
        if(db.prepare('SELECT count(*) n FROM login_attempts WHERE email_hash=?').get(key).n>=MAX_FAILED_LOGINS)throw new PlanError(429,'too_many_attempts','Too many failed logins for this email. Try again in 15 minutes.');
        db.prepare('INSERT INTO login_attempts VALUES(?,?)').run(key,now);
        db.exec('COMMIT');
      }catch(error){db.exec('ROLLBACK');throw error;}
      const row=typeof password==='string'&&password.length<=200?db.prepare('SELECT account_id,password_hash FROM credentials WHERE email=?').get(normalized):null;
      const valid=await verifyPasswordAsync(typeof password==='string'?password.slice(0,200):'',row?.password_hash??DUMMY_HASH);
      // Password reset/suspension while the KDF runs must revoke this attempt.
      const current=row&&db.prepare('SELECT password_hash FROM credentials WHERE account_id=?').get(row.account_id);
      if(!valid||!row||current?.password_hash!==row.password_hash)throw new PlanError(401,'invalid_credentials','Email or password is incorrect.');
      const acct=account(row.account_id);
      if(!acct||acct.status!=='active')throw new PlanError(403,'account_suspended','This account is suspended.');
      db.prepare('DELETE FROM login_attempts WHERE email_hash=?').run(key);
      return {account:{...acct,email:normalized},sessionToken:startSession(acct.id)};
    },
    /** Synchronous API is retained for local account-management callers. */
    logIn({email, password}) {
      const normalized = normalizeEmail(email), key = emailHash(normalized), now = clock().getTime();
      db.prepare('DELETE FROM login_attempts WHERE at < ?').run(now - FAILED_LOGIN_WINDOW_MS);
      if (db.prepare('SELECT count(*) n FROM login_attempts WHERE email_hash=?').get(key).n >= MAX_FAILED_LOGINS) {
        throw new PlanError(429, 'too_many_attempts', 'Too many failed logins for this email. Try again in 15 minutes.');
      }
      const row = typeof password === 'string' && password.length <= 200 ? db.prepare('SELECT account_id, password_hash FROM credentials WHERE email=?').get(normalized) : null;
      const ok = verifyPassword(typeof password === 'string' ? password.slice(0, 200) : '', row?.password_hash ?? DUMMY_HASH) && Boolean(row);
      if (!ok) {
        db.prepare('INSERT INTO login_attempts VALUES(?,?)').run(key, now);
        throw new PlanError(401, 'invalid_credentials', 'Email or password is incorrect.');
      }
      const acct = account(row.account_id);
      if (!acct || acct.status !== 'active') throw new PlanError(403, 'account_suspended', 'This account is suspended.');
      db.prepare('DELETE FROM login_attempts WHERE email_hash=?').run(key);
      return {account: {...acct, email: normalized}, sessionToken: startSession(acct.id)};
    },

    /** The account for a session token, or null when missing, expired or suspended. */
    sessionAccount(token) {
      if (typeof token !== 'string' || !token || token.length > 100) return null;
      const row = db.prepare('SELECT account_id, expires_at FROM sessions WHERE hash=?').get(hashKey(token));
      if (!row || row.expires_at <= clock().toISOString()) return null;
      const acct = account(row.account_id);
      if (!acct || acct.status !== 'active') return null;
      const cred = db.prepare('SELECT email, email_verified_at FROM credentials WHERE account_id=?').get(acct.id);
      return {...acct, email: cred?.email ?? null, emailVerified: Boolean(cred?.email_verified_at)};
    },
    verifyEmail(token) {
      const accountId = useEmailToken(token, 'verify');
      db.prepare('UPDATE credentials SET email_verified_at=coalesce(email_verified_at, ?) WHERE account_id=?').run(clock().toISOString(), accountId);
      return account(accountId);
    },
    newVerifyToken(sessionToken) {
      const acct = api.sessionAccount(sessionToken);
      if (!acct) throw new PlanError(401, 'login_required', 'Log in to confirm your email.');
      if (acct.emailVerified) return {account: acct, token: null};
      return {account: acct, token: createEmailToken(acct.id, 'verify')};
    },
    /** A reset token for a known, active email, or null (unknown, suspended or throttled). Callers must answer the same either way. */
    requestPasswordReset(email) {
      const normalized = normalizeEmail(email);
      if (!EMAIL.test(normalized)) return null;
      const row = db.prepare('SELECT account_id FROM credentials WHERE email=?').get(normalized);
      if (!row || account(row.account_id)?.status !== 'active') return null;
      const token = createEmailToken(row.account_id, 'reset');
      return token ? {email: normalized, token} : null;
    },
    /** Sets a new password from a reset link; ends every session and every other reset link. */
    async resetPasswordWithTokenAsync(token, newPassword) {
      checkPassword(newPassword);
      const row = typeof token === 'string' && token.length <= 100 ? db.prepare("SELECT expires_at,used_at FROM email_tokens WHERE hash=? AND purpose='reset'").get(hashKey(token)) : null;
      if (!row || row.used_at) throw new PlanError(400, 'invalid_token', 'This link is invalid or already used.');
      if (row.expires_at <= clock().toISOString()) throw new PlanError(400, 'expired_token', 'This link has expired. Ask for a new one.');
      const passwordHash = await hashPasswordAsync(newPassword);
      return api.resetPasswordWithToken(token, newPassword, passwordHash);
    },
    resetPasswordWithToken(token, newPassword, preparedHash) {
      checkPassword(newPassword);
      const accountId = useEmailToken(token, 'reset');
      const now = clock().toISOString();
      db.prepare('UPDATE credentials SET password_hash=?, email_verified_at=coalesce(email_verified_at, ?) WHERE account_id=?').run(preparedHash || hashPassword(newPassword), now, accountId);
      db.prepare("UPDATE email_tokens SET used_at=? WHERE account_id=? AND purpose='reset' AND used_at IS NULL").run(now, accountId);
      db.prepare('DELETE FROM sessions WHERE account_id=?').run(accountId);
      return account(accountId);
    },
    logOut(token) {
      if (typeof token === 'string' && token) db.prepare('DELETE FROM sessions WHERE hash=?').run(hashKey(token));
    },
    async changePasswordAsync(sessionToken, currentPassword, newPassword) {
      const acct = api.sessionAccount(sessionToken);
      if (!acct) throw new PlanError(401, 'login_required', 'Log in to change your password.');
      checkPassword(newPassword);
      const row = db.prepare('SELECT password_hash FROM credentials WHERE account_id=?').get(acct.id);
      if (!row || typeof currentPassword !== 'string' || !await verifyPasswordAsync(currentPassword.slice(0,200), row.password_hash)) throw new PlanError(401, 'invalid_credentials', 'Your current password is incorrect.');
      const passwordHash = await hashPasswordAsync(newPassword);
      if (!api.sessionAccount(sessionToken) || db.prepare('SELECT password_hash FROM credentials WHERE account_id=?').get(acct.id)?.password_hash !== row.password_hash) throw new PlanError(401, 'invalid_credentials', 'Credentials changed. Please sign in again.');
      db.prepare('UPDATE credentials SET password_hash=? WHERE account_id=?').run(passwordHash, acct.id);
      db.prepare('DELETE FROM sessions WHERE account_id=? AND hash<>?').run(acct.id, hashKey(sessionToken));
      return acct;
    },
    changePassword(sessionToken, currentPassword, newPassword) {
      const acct = api.sessionAccount(sessionToken);
      if (!acct) throw new PlanError(401, 'login_required', 'Log in to change your password.');
      const row = db.prepare('SELECT password_hash FROM credentials WHERE account_id=?').get(acct.id);
      if (!row || typeof currentPassword !== 'string' || !verifyPassword(currentPassword.slice(0, 200), row.password_hash)) throw new PlanError(401, 'invalid_credentials', 'Your current password is incorrect.');
      checkPassword(newPassword);
      db.prepare('UPDATE credentials SET password_hash=? WHERE account_id=?').run(hashPassword(newPassword), acct.id);
      db.prepare('DELETE FROM sessions WHERE account_id=? AND hash<>?').run(acct.id, hashKey(sessionToken));
      return acct;
    },
    /** Sets a new password (administrator reset) and ends every session of that account. */
    resetPassword(email, password) {
      const normalized = normalizeEmail(email);
      checkPassword(password);
      const row = db.prepare('SELECT account_id FROM credentials WHERE email=?').get(normalized);
      if (!row) throw new Error('No account with that email');
      db.prepare('UPDATE credentials SET password_hash=? WHERE account_id=?').run(hashPassword(password), row.account_id);
      db.prepare('DELETE FROM sessions WHERE account_id=?').run(row.account_id);
      db.prepare('DELETE FROM login_attempts WHERE email_hash=?').run(emailHash(normalized));
      return account(row.account_id);
    },

    /**
     * Ensures a known account exists with this email and password (testing mode). The
     * password is reset on every call so published test credentials keep working.
     */
    ensureAccount({email, password, name, plan, isAdmin}) {
      const normalized = normalizeEmail(email);
      checkPassword(password);
      const row = db.prepare('SELECT account_id FROM credentials WHERE email=?').get(normalized);
      if (!row) return account(insertAccount({name, plan: planFor(plan).id, email: normalized, password, isAdmin, verified: true}));
      db.prepare('UPDATE credentials SET password_hash=?, email_verified_at=coalesce(email_verified_at, ?) WHERE account_id=?').run(hashPassword(password), clock().toISOString(), row.account_id);
      db.prepare("UPDATE accounts SET status='active', is_admin=? WHERE id=?").run(isAdmin ? 1 : 0, row.account_id);
      db.prepare('DELETE FROM login_attempts WHERE email_hash=?').run(emailHash(normalized));
      return account(row.account_id);
    },

    createAccount({name, plan = 'free'}) {
      if (typeof name !== 'string' || !name.trim() || name.length > 100) throw new Error('Account name must contain 1-100 characters');
      if (!registry.has(plan)) throw new Error(`Plan must be one of ${registry.plans().map(p => p.id).join(', ')}`);
      const id = insertAccount({name: name.trim(), plan});
      return {account: account(id), apiKey: issueKey(id, 'initial')};
    },
    issueKey,
    setPlan(accountId, plan) {
      if (!registry.has(plan)) throw new Error(`Plan must be one of ${registry.plans().map(p => p.id).join(', ')}`);
      if (!db.prepare('UPDATE accounts SET plan=? WHERE id=?').run(plan, accountId).changes) throw new Error('Unknown account');
      return account(accountId);
    },
    setStatus(accountId, status) {
      if (!['active', 'suspended'].includes(status)) throw new Error('Status must be active or suspended');
      if (!db.prepare('UPDATE accounts SET status=? WHERE id=?').run(status, accountId).changes) throw new Error('Unknown account');
      return account(accountId);
    },
    revokeKeys(accountId) {
      return db.prepare('UPDATE api_keys SET revoked_at=? WHERE account_id=? AND revoked_at IS NULL').run(clock().toISOString(), accountId).changes;
    },
    list() {
      return db.prepare('SELECT a.id, a.name, a.plan, a.status, a.created_at AS createdAt, (SELECT count(*) FROM api_keys k WHERE k.account_id=a.id AND k.revoked_at IS NULL) AS activeKeys FROM accounts a ORDER BY a.created_at').all();
    },

    /** Resolves the Authorization header to an account; throws PlanError for a bad or revoked key. */
    authenticate(header) {
      if (header === undefined) return null;
      const key = typeof header === 'string' && header.startsWith(`Bearer ${KEY_PREFIX}`) ? header.slice(7) : null;
      if (!key || key.length > 100) throw new PlanError(401, 'invalid_api_key', 'This API key is not valid.');
      const keyHash = hashKey(key);
      const row = db.prepare('SELECT account_id, revoked_at, last_used_at FROM api_keys WHERE hash=?').get(keyHash);
      if (!row || row.revoked_at) throw new PlanError(401, 'invalid_api_key', 'This API key is not valid or has been revoked.');
      const acct = account(row.account_id);
      if (!acct || acct.status !== 'active') throw new PlanError(403, 'account_suspended', 'This account is suspended.');
      // Record use at most once an hour per key, so busy keys do not write on every request.
      const now = clock();
      if (!row.last_used_at || Date.parse(row.last_used_at) < now.getTime() - 3600000) db.prepare('UPDATE api_keys SET last_used_at=? WHERE hash=?').run(now.toISOString(), keyHash);
      return {...acct, keyId: keyHash.slice(0, 12)};
    },
    listKeys(accountId) {
      return db.prepare('SELECT substr(hash, 1, 12) AS id, label, created_at AS createdAt, last_used_at AS lastUsedAt, revoked_at AS revokedAt FROM api_keys WHERE account_id=? ORDER BY created_at').all(accountId);
    },
    revokeKey(accountId, keyId) {
      if (typeof keyId !== 'string' || !/^[0-9a-f]{12}$/.test(keyId)) return false;
      return db.prepare('UPDATE api_keys SET revoked_at=? WHERE account_id=? AND substr(hash, 1, 12)=? AND revoked_at IS NULL').run(clock().toISOString(), accountId, keyId).changes > 0;
    },
    keyLimitFor: planId => planFor(planId).apiKeys,

    anonymousSubject(clientAddress) {
      const period = periodOf(clock());
      return 'anon:' + createHmac('sha256', anonSecret).update(`${period}|${clientAddress}`).digest('hex').slice(0, 32);
    },
    /** The plan id anonymous visitors use. */
    anonymousPlan: () => planFor(settings().defaultPlan).id,

    /**
     * Checks plan access and remaining quota before a request runs.
     * @returns {{plan, feature, subject, limit, remaining, resetAt, metered}|null}
     */
    check({method, path, account: acct, subject}) {
      const use = registry.featureOf(method, path);
      if (!use) return null;
      if (use.tool && registry.isToolDisabled(use.tool)) throw new PlanError(503, 'tool_disabled', 'This tool has been turned off by the administrator.', {tool: use.tool});
      const plan = planFor(acct?.plan ?? settings().defaultPlan);
      if (use.tier === 'essential') return {plan: plan.id, feature: use.feature, subject, metered: false, limit: null, remaining: null, resetAt: null};
      if (!plan.tiers.includes(use.tier)) {
        const requiredPlan = registry.cheapestPlanFor(use.tier);
        throw new PlanError(402, 'plan_upgrade_required', `This tool needs the ${registry.plan(requiredPlan)?.name ?? requiredPlan} plan or higher.`, {plan: plan.id, requiredPlan, tool: use.tool});
      }
      const now = clock(), period = periodOf(now), limit = plan.monthly[use.feature];
      const resetAt = nextPeriodStart(now);
      if (limit === null) return {plan: plan.id, feature: use.feature, subject, metered: true, limit: null, remaining: null, resetAt};
      const remaining = Math.max(0, limit - used(subject, period, use.feature));
      if (remaining === 0) {
        throw new PlanError(429, 'plan_quota_exceeded', `You have used all ${limit} ${use.feature === 'chat' ? 'answers' : 'tool runs'} in your ${plan.name} plan this month.`, {plan: plan.id, feature: use.feature, limit, resetAt, upgradeTo: registry.nextPlan(plan.id)});
      }
      return {plan: plan.id, feature: use.feature, subject, metered: true, limit, remaining, resetAt};
    },

    /** Reserve capacity atomically across processes before expensive work begins. */
    reserve(request) {
      db.exec('BEGIN IMMEDIATE');
      try {
        const now=clock();
        for(const row of db.prepare('SELECT * FROM usage_reservations WHERE expires<?').all(now.getTime())) {
          db.prepare('UPDATE usage SET count=max(0,count-1) WHERE subject=? AND period=? AND feature=?').run(row.subject,row.period,row.feature);
          db.prepare('DELETE FROM usage_reservations WHERE id=?').run(row.id);
        }
        const e=api.check(request);
        if(e?.metered) {
          e.reservationId=randomUUID();e.period=periodOf(now);e.day=now.toISOString().slice(0,10);
          db.prepare('INSERT INTO usage_reservations VALUES(?,?,?,?,?,?)').run(e.reservationId,e.subject,e.period,e.feature,e.day,now.getTime()+120000);
          db.prepare('INSERT INTO usage VALUES(?,?,?,1) ON CONFLICT(subject,period,feature) DO UPDATE SET count=count+1').run(e.subject,e.period,e.feature);
        }
        db.exec('COMMIT');return e;
      } catch(error) {db.exec('ROLLBACK');throw error;}
    },
    release(e) {
      if(!e?.reservationId)return;
      db.exec('BEGIN IMMEDIATE');
      try {
        const row=db.prepare('SELECT * FROM usage_reservations WHERE id=?').get(e.reservationId);
        if(row){
          db.prepare('UPDATE usage SET count=max(0,count-1) WHERE subject=? AND period=? AND feature=?').run(row.subject,row.period,row.feature);
          db.prepare('DELETE FROM usage_reservations WHERE id=?').run(e.reservationId);
        }
        db.exec('COMMIT');
      }catch(error){db.exec('ROLLBACK');throw error;}
    },
    /** Commit before responding; duplicate completion cannot charge twice. */
    record(entitlement) {
      if (!entitlement?.metered) return;
      db.exec('BEGIN IMMEDIATE');
      try {
        const now=clock();
        const row=entitlement.reservationId?db.prepare('SELECT * FROM usage_reservations WHERE id=?').get(entitlement.reservationId):null;
        if(entitlement.reservationId&&!row){db.exec('COMMIT');return;}
        const day=row?.day||now.toISOString().slice(0,10);
        if(!row)db.prepare('INSERT INTO usage VALUES(?,?,?,1) ON CONFLICT(subject,period,feature) DO UPDATE SET count=count+1').run(entitlement.subject,periodOf(now),entitlement.feature);
        db.prepare('INSERT INTO usage_daily VALUES(?,?,?,?,1) ON CONFLICT(subject,day,feature,key_id) DO UPDATE SET count=count+1').run(entitlement.subject,day,entitlement.feature,entitlement.keyId??'browser');
        if(row)db.prepare('DELETE FROM usage_reservations WHERE id=?').run(entitlement.reservationId);
        db.exec('COMMIT');
      }catch(error){db.exec('ROLLBACK');throw error;}
    },
    purgeExpired() {
      const now=clock().toISOString();
      return {
        sessions:db.prepare('DELETE FROM sessions WHERE expires_at<?').run(now).changes,
        emailTokens:db.prepare('DELETE FROM email_tokens WHERE expires_at<?').run(now).changes
      };
    },
    usageReport,
    usage: usageFor,

    // ---- Administration (every write is audited with the acting administrator) ----
    admin: {
      overview() {
        const period = periodOf(clock());
        const count = sql => db.prepare(sql).get().n;
        return {
          period,
          accounts: count('SELECT count(*) n FROM accounts'),
          active: count("SELECT count(*) n FROM accounts WHERE status='active'"),
          suspended: count("SELECT count(*) n FROM accounts WHERE status='suspended'"),
          admins: count('SELECT count(*) n FROM accounts WHERE is_admin=1'),
          withLogin: count('SELECT count(*) n FROM credentials'),
          activeKeys: count('SELECT count(*) n FROM api_keys WHERE revoked_at IS NULL'),
          byPlan: db.prepare('SELECT plan, count(*) AS accounts FROM accounts GROUP BY plan ORDER BY plan').all(),
          usageThisMonth: {
            chat: db.prepare("SELECT coalesce(sum(count),0) n FROM usage WHERE period=? AND feature='chat'").get(period).n,
            tool: db.prepare("SELECT coalesce(sum(count),0) n FROM usage WHERE period=? AND feature='tool'").get(period).n
          },
          disabledTools: db.prepare('SELECT count(*) n FROM tool_settings WHERE disabled=1').get().n,
          settings: settings()
        };
      },
      listUsers({q = '', plan = '', status = '', limit = 200} = {}) {
        const term = `%${String(q).trim().toLowerCase()}%`;
        const ids = db.prepare(`SELECT a.id FROM accounts a LEFT JOIN credentials c ON c.account_id=a.id
          WHERE (? = '%%' OR lower(a.name) LIKE ? OR lower(coalesce(c.email,'')) LIKE ? OR a.id LIKE ?)
            AND (? = '' OR a.plan = ?) AND (? = '' OR a.status = ?)
          ORDER BY a.created_at DESC LIMIT ?`).all(term, term, term, term, String(plan), String(plan), String(status), String(status), Math.min(500, Math.max(1, Number(limit) || 200)));
        return ids.map(r => userRow(r.id));
      },
      getUser(id) {
        const user = requireUser(id);
        return {...user, keys: api.listKeys(id), usageReport: usageReport(id, user.plan)};
      },
      createUser(actor, {email, password, name, plan, isAdmin = false, emailVerified = true}) {
        const normalized = normalizeEmail(email);
        if (!EMAIL.test(normalized)) throw new PlanError(400, 'invalid_email', 'Enter a valid email address.');
        checkPassword(password);
        if (db.prepare('SELECT 1 FROM credentials WHERE email=?').get(normalized)) throw new PlanError(409, 'email_taken', 'An account with this email already exists.');
        const planId = plan ?? settings().defaultPlan;
        if (!registry.has(planId)) throw bad('Unknown plan.');
        const id = insertAccount({name: typeof name === 'string' && name.trim() ? name.trim().slice(0, 100) : normalized.split('@')[0], plan: planId, email: normalized, password, isAdmin: Boolean(isAdmin), verified: emailVerified !== false});
        audit(actor, 'user.create', id, {email: normalized, plan: planId, isAdmin: Boolean(isAdmin)});
        return userRow(id);
      },
      updateUser(actor, id, changes = {}) {
        const user = requireUser(id);
        const applied = {};
        if (changes.name !== undefined) {
          const name = String(changes.name).trim();
          if (!name || name.length > 100) throw bad('Name must contain 1-100 characters.');
          db.prepare('UPDATE accounts SET name=? WHERE id=?').run(name, id); applied.name = name;
        }
        if (changes.plan !== undefined) {
          if (!registry.has(changes.plan)) throw bad('Unknown plan.');
          db.prepare('UPDATE accounts SET plan=? WHERE id=?').run(changes.plan, id); applied.plan = changes.plan;
        }
        if (changes.status !== undefined) {
          if (!['active', 'suspended'].includes(changes.status)) throw bad('Status must be active or suspended.');
          guardLastAdmin(user, {status: changes.status});
          db.prepare('UPDATE accounts SET status=? WHERE id=?').run(changes.status, id); applied.status = changes.status;
          if (changes.status === 'suspended') db.prepare('DELETE FROM sessions WHERE account_id=?').run(id);
        }
        if (changes.isAdmin !== undefined) {
          guardLastAdmin(user, {isAdmin: Boolean(changes.isAdmin)});
          db.prepare('UPDATE accounts SET is_admin=? WHERE id=?').run(changes.isAdmin ? 1 : 0, id); applied.isAdmin = Boolean(changes.isAdmin);
        }
        if (changes.emailVerified !== undefined && user.email) {
          db.prepare('UPDATE credentials SET email_verified_at=? WHERE account_id=?').run(changes.emailVerified ? clock().toISOString() : null, id); applied.emailVerified = Boolean(changes.emailVerified);
        }
        if (!Object.keys(applied).length) throw bad('Nothing to change.');
        audit(actor, 'user.update', id, applied);
        return userRow(id);
      },
      resetUserPassword(actor, id) {
        const user = requireUser(id);
        if (!user.email) throw bad('This account has no email login.');
        const temporary = randomBytes(12).toString('base64url');
        api.resetPassword(user.email, temporary);
        audit(actor, 'user.reset_password', id);
        return {temporaryPassword: temporary};
      },
      revokeUserKeys(actor, id) {
        requireUser(id);
        const revoked = api.revokeKeys(id);
        audit(actor, 'user.revoke_keys', id, {revoked});
        return {revoked};
      },
      endUserSessions(actor, id) {
        requireUser(id);
        const ended = db.prepare('DELETE FROM sessions WHERE account_id=?').run(id).changes;
        audit(actor, 'user.end_sessions', id, {ended});
        return {ended};
      },
      deleteUser(actor, id, confirm) {
        const user = requireUser(id);
        if (confirm !== (user.email ?? user.id)) throw bad(`Type ${user.email ? 'the email address' : 'the account id'} to confirm deletion.`);
        guardLastAdmin(user, {delete: true});
        db.exec('BEGIN IMMEDIATE');
        try {
          for (const table of ['credentials', 'sessions', 'api_keys', 'email_tokens']) db.prepare(`DELETE FROM ${table} WHERE account_id=?`).run(id);
          for (const table of ['usage', 'usage_daily']) db.prepare(`DELETE FROM ${table} WHERE subject=?`).run(accountSubject({id}));
          db.prepare('DELETE FROM accounts WHERE id=?').run(id);
          db.exec('COMMIT');
        } catch (error) { db.exec('ROLLBACK'); throw error; }
        audit(actor, 'user.delete', id, {email: user.email});
        return {deleted: true};
      },

      plans: () => registry.plans().map(p => ({...p, accounts: db.prepare('SELECT count(*) n FROM accounts WHERE plan=?').get(p.id).n})),
      savePlan(actor, input) {
        let plan;
        try { plan = validatePlan(input); } catch (error) { throw bad(error.message); }
        const existing = db.prepare('SELECT position FROM plan_configs WHERE id=?').get(plan.id);
        if (!plan.enabled && settings().defaultPlan === plan.id) throw bad('The default plan cannot be turned off. Choose another default plan first.');
        if (!plan.enabled && registry.plans().filter(p => p.enabled && p.id !== plan.id).length === 0) throw bad('At least one plan must stay enabled.');
        const position = existing?.position ?? (db.prepare('SELECT coalesce(max(position), -1) + 1 AS n FROM plan_configs').get().n);
        db.prepare('INSERT INTO plan_configs VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET json=excluded.json').run(plan.id, position, JSON.stringify(plan));
        loadRegistry();
        audit(actor, existing ? 'plan.update' : 'plan.create', plan.id, plan);
        return registry.plan(plan.id);
      },
      deletePlan(actor, id) {
        if (!registry.has(id)) throw new PlanError(404, 'not_found', 'No such plan.');
        const inUse = db.prepare('SELECT count(*) n FROM accounts WHERE plan=?').get(id).n;
        if (inUse) throw new PlanError(409, 'plan_in_use', `${inUse} account(s) use this plan. Move them to another plan first.`);
        if (settings().defaultPlan === id) throw bad('The default plan cannot be deleted. Choose another default plan first.');
        if (registry.plans().length <= 1) throw bad('At least one plan must exist.');
        db.prepare('DELETE FROM plan_configs WHERE id=?').run(id);
        loadRegistry();
        audit(actor, 'plan.delete', id);
        return {deleted: true};
      },

      tools(knownTools = []) {
        const overrides = registry.toolOverrides();
        const ids = [...new Set([...knownTools, ...Object.keys(overrides)])].sort();
        return ids.map(tool => ({tool, tier: registry.tierOf(tool), overridden: Boolean(overrides[tool]?.tier), disabled: registry.isToolDisabled(tool)}));
      },
      setTool(actor, tool, {tier, disabled} = {}) {
        if (typeof tool !== 'string' || !/^[a-z0-9-]{2,80}$/.test(tool)) throw bad('Unknown tool id.');
        if (tier !== undefined && tier !== null && !TIERS.includes(tier)) throw bad(`Tier must be one of ${TIERS.join(', ')}, or empty for the default.`);
        const current = db.prepare('SELECT tier, disabled FROM tool_settings WHERE tool=?').get(tool) ?? {tier: null, disabled: 0};
        const next = {tier: tier === undefined ? current.tier : tier, disabled: disabled === undefined ? current.disabled : (disabled ? 1 : 0)};
        if (!next.tier && !next.disabled) db.prepare('DELETE FROM tool_settings WHERE tool=?').run(tool);
        else db.prepare('INSERT INTO tool_settings VALUES(?,?,?) ON CONFLICT(tool) DO UPDATE SET tier=excluded.tier, disabled=excluded.disabled').run(tool, next.tier, next.disabled);
        loadRegistry();
        audit(actor, 'tool.update', tool, {tier: next.tier, disabled: Boolean(next.disabled)});
        return {tool, tier: registry.tierOf(tool), overridden: Boolean(next.tier), disabled: registry.isToolDisabled(tool)};
      },

      updateSettings(actor, changes = {}) {
        const applied = {};
        if (changes.signupsOpen !== undefined) applied.signupsOpen = Boolean(changes.signupsOpen);
        if (changes.defaultPlan !== undefined) {
          const plan = registry.plan(changes.defaultPlan);
          if (!plan || !plan.enabled) throw bad('The default plan must be an existing, enabled plan.');
          applied.defaultPlan = plan.id;
        }
        if (!Object.keys(applied).length) throw bad('Nothing to change.');
        for (const [key, value] of Object.entries(applied)) db.prepare('INSERT INTO settings VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key, JSON.stringify(value));
        audit(actor, 'settings.update', null, applied);
        return settings();
      },

      audit: (limit = 200) => db.prepare('SELECT id, at, actor, action, target, details FROM admin_audit ORDER BY id DESC LIMIT ?').all(Math.min(1000, Math.max(1, Number(limit) || 200)))
        .map(row => ({...row, details: row.details ? JSON.parse(row.details) : null}))
    }
  };
  return api;
}

/** Account subject used for metering; anonymous subjects come from anonymousSubject(). */
export const accountSubject = acct => `acct:${acct.id}`;
