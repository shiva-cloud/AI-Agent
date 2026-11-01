import {readFileSync} from 'node:fs';
import {PlanError} from './accounts.js';

// Administration API for the /manage panel (SaaS mode). Callers must be an active account
// with the administrator flag (browser session) or an admin-role ADMIN token. Every write
// is recorded in the audit log by the accounts module.

let toolIds;
/** Every /v1/tools/<id> route the server answers, read once from the server source. */
function knownTools() {
  if (!toolIds) {
    const source = readFileSync(new URL('./server.js', import.meta.url), 'utf8');
    toolIds = [...new Set([...source.matchAll(/'\/v1\/tools\/([a-z0-9-]+)'/g)].map(m => m[1]))].sort();
  }
  return toolIds;
}

const ok = body => ({status: 200, body});

/**
 * @returns {{status:number, body:object}|null} null when the path is not a manage route.
 */
export function handleManage({accounts, method, path, query, input, actor, testMode}) {
  const admin = accounts.admin;
  const user = path.match(/^\/v1\/manage\/users\/([0-9a-f-]{36})(?:\/(reset-password|revoke-keys|end-sessions|delete))?$/);
  const plan = path.match(/^\/v1\/manage\/plans\/([a-z][a-z0-9-]{1,30})\/delete$/);
  const tool = path.match(/^\/v1\/manage\/tools\/([a-z0-9-]{2,80})$/);

  if (method === 'GET') {
    if (path === '/v1/manage/me') return ok({actor, testMode: Boolean(testMode)});
    if (path === '/v1/manage/overview') return ok({...admin.overview(), testMode: Boolean(testMode), knownTools: knownTools().length});
    if (path === '/v1/manage/users') return ok({users: admin.listUsers({q: query.get('q') ?? '', plan: query.get('plan') ?? '', status: query.get('status') ?? ''})});
    if (user && !user[2]) return ok(admin.getUser(user[1]));
    if (path === '/v1/manage/plans') return ok({plans: admin.plans(), tiers: ['essential', 'core', 'plus', 'pro']});
    if (path === '/v1/manage/tools') return ok({tools: admin.tools(knownTools())});
    if (path === '/v1/manage/settings') return ok({settings: accounts.settings(), plans: admin.plans().map(p => ({id: p.id, name: p.name, enabled: p.enabled}))});
    if (path === '/v1/manage/audit') return ok({entries: admin.audit(query.get('limit') ?? 200)});
    return null;
  }
  if (method !== 'POST') return null;
  if (path === '/v1/manage/users') return {status: 201, body: admin.createUser(actor, input)};
  if (user) {
    const id = user[1];
    switch (user[2]) {
      case undefined: return ok(admin.updateUser(actor, id, input));
      case 'reset-password': return ok(admin.resetUserPassword(actor, id));
      case 'revoke-keys': return ok(admin.revokeUserKeys(actor, id));
      case 'end-sessions': return ok(admin.endUserSessions(actor, id));
      case 'delete': return ok(admin.deleteUser(actor, id, input.confirm));
    }
  }
  if (path === '/v1/manage/plans') return ok({plan: admin.savePlan(actor, input)});
  if (plan) return ok(admin.deletePlan(actor, plan[1]));
  if (tool) {
    if (!knownTools().includes(tool[1])) throw new PlanError(404, 'not_found', 'No such tool.');
    return ok(admin.setTool(actor, tool[1], {tier: input.tier === '' ? null : input.tier, disabled: input.disabled}));
  }
  if (path === '/v1/manage/settings') return ok({settings: admin.updateSettings(actor, input)});
  return null;
}
