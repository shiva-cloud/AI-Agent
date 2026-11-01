// SaaS plan catalog and feature classification (plans-2).
// Plans decide which tool tiers an account may use and how many chat answers and tool
// runs it gets each calendar month (UTC). A monthly limit of null means unlimited.
// The defaults below can be changed from the admin panel; changes are stored in the
// accounts database and applied through a plan registry (see createPlanRegistry).
// Prices are placeholders in CAD until a billing provider is chosen.
//
// Tool tiers:
//   essential  safety and legal-rights tools. Never blocked and never metered, on any plan.
//   core       everyday newcomer tools, available on every plan.
//   plus       specialised immigration, tax, tenancy and work tools.
//   pro        practitioner tools (case files, form filling, legal notices, business filings).
// Any tool not listed below is "plus", so new tools are neither free by accident nor
// locked behind the most expensive plan.

export const PLANS_VERSION = 'plans-2';
export const TIERS = ['essential', 'core', 'plus', 'pro'];

// Free is unlimited (owner's decision, 1 November 2026); paid plans keep their limits.
export const DEFAULT_PLANS = Object.freeze([
  {id: 'free', name: 'Free', priceCadMonthly: 0, tiers: ['essential', 'core'], monthly: {chat: null, tool: null}, apiKeys: 1, enabled: true},
  {id: 'plus', name: 'Plus', priceCadMonthly: 9, tiers: ['essential', 'core', 'plus'], monthly: {chat: 500, tool: 500}, apiKeys: 2, enabled: true},
  {id: 'pro', name: 'Pro', priceCadMonthly: 29, tiers: ['essential', 'core', 'plus', 'pro'], monthly: {chat: 3000, tool: 3000}, apiKeys: 3, enabled: true},
  {id: 'team', name: 'Team', priceCadMonthly: 99, tiers: ['essential', 'core', 'plus', 'pro'], monthly: {chat: 20000, tool: 20000}, apiKeys: 10, enabled: true}
]);

const ESSENTIAL = ['eviction-defense', 'rent-increase-defense', 'ontario-illegal-entry-t2', 'tenancy-repairs', 'vulnerable-worker', 'human-rights-defense',
  'workplace-safety', 'workplace-rights', 'esa-wage-theft', 'esa-reprisal-defense', 'ontario-employment-reprisal', 'debt-collection-defense',
  'consumer-protection', 'high-cost-credit', 'poe-rights', 'social-assistance', 'child-welfare-guardianship'];

const CORE = ['compare-cities', 'city-comparison', 'newcomer-budget', 'settlement-journey', 'healthcare-eligibility', 'sin-healthcare',
  'licence-exchange', 'validate-documents', 'cra-benefits', 'childcare-support', 'childcare-subsidy', 'banking-comparator', 'credit-simulator',
  'citizenship-calculator', 'pr-residency', 'pr-card-renewal', 'express-entry-crs', 'calendar-sync', 'customs-declaration', 'pet-import',
  'currency-exchange', 'statutory-pay', 'lease-guard', 'global-visa-matrix', 'auto-insurance', 'oas-gis', 'language-score-clb', 'proof-of-funds',
  'student-compliance', 'healthcare-portability', 'ei-benefits'];

const PRO = ['gcms-analyzer', 'form-autopopulate', 'legal-notices', 'small-claims', 'cra-voluntary-disclosure', 'estate-planning',
  'franchise-disclosure', 'commercial-lease', 'alberta-commercial-distress', 'real-estate-assignment', 'business-structure', 'tfw-compliance',
  'tfw-employer-transition', 'lmia-readiness', 'start-up-visa', 'federal-suv-peer-review', 'federal-c11-entrepreneur-work-permit',
  'self-employed-persons', 'alberta-rural-entrepreneur', 'cra-newcomer-wealth', 'tax-shield', 'cross-border-tax', 'bc-strata-depreciation-crf',
  'ontario-severance-payroll', 'bc-esa-group-termination', 'severance-bardal'];

export const DEFAULT_TOOL_TIERS = Object.freeze(Object.fromEntries([...ESSENTIAL.map(t => [t, 'essential']), ...CORE.map(t => [t, 'core']), ...PRO.map(t => [t, 'pro'])]));

/** Checks one plan definition; returns a normalized copy or throws with a readable message. */
export function validatePlan(plan) {
  if (!plan || typeof plan !== 'object') throw new Error('Plan must be an object');
  const id = String(plan.id ?? '').trim();
  if (!/^[a-z][a-z0-9-]{1,30}$/.test(id)) throw new Error('Plan id must be 2-31 lowercase letters, digits or dashes, starting with a letter');
  const name = String(plan.name ?? '').trim();
  if (!name || name.length > 40) throw new Error('Plan name must contain 1-40 characters');
  const price = Number(plan.priceCadMonthly);
  if (!Number.isFinite(price) || price < 0 || price > 100000) throw new Error('Price must be between 0 and 100000');
  const tiers = Array.isArray(plan.tiers) ? [...new Set(plan.tiers)] : [];
  if (tiers.some(t => !TIERS.includes(t))) throw new Error(`Tiers must be from: ${TIERS.join(', ')}`);
  if (!tiers.includes('essential')) tiers.unshift('essential'); // safety tools are never removed
  const limit = value => {
    if (value === null || value === undefined || value === '' || value === 'unlimited') return null;
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n > 100000000) throw new Error('Monthly limits must be whole numbers from 0, or unlimited');
    return n;
  };
  const apiKeys = Number(plan.apiKeys);
  if (!Number.isInteger(apiKeys) || apiKeys < 0 || apiKeys > 1000) throw new Error('API key limit must be a whole number from 0 to 1000');
  return {id, name, priceCadMonthly: price, tiers: TIERS.filter(t => tiers.includes(t)), monthly: {chat: limit(plan.monthly?.chat), tool: limit(plan.monthly?.tool)}, apiKeys, enabled: plan.enabled !== false};
}

/**
 * The effective catalog: default plans and tool tiers with stored changes applied.
 * @param {{plans?: object[], toolOverrides?: Record<string,{tier?:string,disabled?:boolean}>}} [stored]
 */
export function createPlanRegistry({plans = DEFAULT_PLANS, toolOverrides = {}} = {}) {
  const list = plans.map(validatePlan);
  const byId = new Map(list.map(p => [p.id, p]));
  const tierOf = tool => toolOverrides[tool]?.tier ?? DEFAULT_TOOL_TIERS[tool] ?? 'plus';
  return {
    version: PLANS_VERSION,
    plans: () => list.map(p => structuredClone(p)),
    plan: id => byId.get(id) ?? null,
    has: id => byId.has(id),
    tierOf,
    isToolDisabled: tool => toolOverrides[tool]?.disabled === true,
    toolOverrides: () => structuredClone(toolOverrides),
    /** Which metered feature a request uses, if any. */
    featureOf(method, path) {
      if (method === 'POST' && path === '/v1/answers') return {feature: 'chat', tool: null, tier: 'core'};
      const tool = /^\/v1\/tools\/([a-z0-9-]+)$/.exec(path)?.[1];
      if (tool && (method === 'GET' || method === 'POST')) return {feature: 'tool', tool, tier: tierOf(tool)};
      return null;
    },
    /** The cheapest enabled plan that includes a tier, for upgrade messages. */
    cheapestPlanFor(tier) {
      return [...list].filter(p => p.enabled && p.tiers.includes(tier)).sort((a, b) => a.priceCadMonthly - b.priceCadMonthly)[0]?.id ?? null;
    },
    /** The next enabled plan with a higher price, for quota messages. */
    nextPlan(id) {
      const current = byId.get(id);
      return [...list].filter(p => p.enabled && current && p.priceCadMonthly > current.priceCadMonthly).sort((a, b) => a.priceCadMonthly - b.priceCadMonthly)[0]?.id ?? null;
    },
    publicCatalog() {
      return {
        version: PLANS_VERSION,
        currency: 'CAD',
        period: 'calendar month (UTC)',
        notes: [
          'Safety and legal-rights tools are available on every plan and do not count toward any limit.',
          'A limit of null means unlimited. Prices are placeholders; no billing provider is connected.'
        ],
        plans: list.filter(p => p.enabled).map(p => ({id: p.id, name: p.name, priceCadMonthly: p.priceCadMonthly, tiers: [...p.tiers], monthlyChatAnswers: p.monthly.chat, monthlyToolRuns: p.monthly.tool, apiKeys: p.apiKeys})),
        tierExamples: {essential: ESSENTIAL.slice(0, 6), core: CORE.slice(0, 6), pro: PRO.slice(0, 6)}
      };
    }
  };
}

// Defaults, for callers without an accounts database.
const DEFAULT_REGISTRY = createPlanRegistry();
export const PLAN_CATALOG = Object.freeze(Object.fromEntries(DEFAULT_PLANS.map(p => [p.id, p])));
export const PLAN_ORDER = DEFAULT_PLANS.map(p => p.id);
export const toolTier = tool => DEFAULT_REGISTRY.tierOf(tool);
export const featureOf = (method, path) => DEFAULT_REGISTRY.featureOf(method, path);
export const cheapestPlanFor = tier => DEFAULT_REGISTRY.cheapestPlanFor(tier);
export const publicCatalog = () => DEFAULT_REGISTRY.publicCatalog();
