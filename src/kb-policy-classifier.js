/**
 * Northstar Knowledge Base Policy Severity & Conflict Classifier (Rec 120 & Rec 111)
 * Classifies newly gazetted updates into 4 statutory severity tiers and
 * resolves federal vs provincial legislative authority conflicts.
 */

export const POLICY_SEVERITY_TIERS = {
  CRITICAL_URGENT: {
    tier: 1,
    label: 'CRITICAL_URGENT',
    urgencyHours: 24,
    description: 'Immediate border bans, retroactive quota closures, loss of status triggers, or eviction without notice.'
  },
  POLICY_CHANGE: {
    tier: 2,
    label: 'POLICY_CHANGE',
    urgencyHours: 72,
    description: 'Statutory threshold revisions, wage floors, annual rent guidelines, and points matrix modifications.'
  },
  ADMINISTRATIVE_UPDATE: {
    tier: 3,
    label: 'ADMINISTRATIVE_UPDATE',
    urgencyHours: 168,
    description: 'Government fee indexing, form version updates, and portal URL migrations.'
  },
  ADVISORY: {
    tier: 4,
    label: 'ADVISORY',
    urgencyHours: 336,
    description: 'General informational pamphlets, seasonal reminders, and educational checklists.'
  }
};

/**
 * Classifies the severity of a policy announcement or KB record
 */
export function classifyPolicySeverity(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const { title = '', summary = '', rawText = '', risk = 'low' } = safeParams;
  const combined = `${title} ${summary} ${rawText}`.toLowerCase();

  // Tier 1: Critical Urgent
  if (
    /\b(?:ban|banned|prohibited|revocation|detained|detention|illegal|immediate expulsion|retroactive cancellation|strike|lockout)\b/i.test(combined) ||
    risk === 'high' && /\b(?:border|flagpoling|deportation|refusal|loss of status)\b/i.test(combined)
  ) {
    return {
      severity: POLICY_SEVERITY_TIERS.CRITICAL_URGENT.label,
      tier: 1,
      requiresImmediateBroadcast: true,
      reasoning: 'Contains high-impact restriction, border prohibition, or status forfeiture triggers.'
    };
  }

  // Tier 2: Policy Change
  if (
    /\b(?:threshold|guideline|minimum wage|salary increase|score cut-off|lico|points revision|allocation|cap)\b/i.test(combined) ||
    /\b(?:\$|\£|\€|points|percent|%)\b/i.test(combined)
  ) {
    return {
      severity: POLICY_SEVERITY_TIERS.POLICY_CHANGE.label,
      tier: 2,
      requiresImmediateBroadcast: false,
      reasoning: 'Alters financial benchmarks, statutory scoring, or numerical eligibility criteria.'
    };
  }

  // Tier 3: Administrative Update
  if (/\b(?:fee|form imm|portal|application process|processing time|service standard|url)\b/i.test(combined)) {
    return {
      severity: POLICY_SEVERITY_TIERS.ADMINISTRATIVE_UPDATE.label,
      tier: 3,
      requiresImmediateBroadcast: false,
      reasoning: 'Procedural update regarding government forms, processing times, or fees.'
    };
  }

  return {
    severity: POLICY_SEVERITY_TIERS.ADVISORY.label,
    tier: 4,
    requiresImmediateBroadcast: false,
    reasoning: 'Routine advisory guidance or informational overview.'
  };
}

/**
 * Resolves constitutional and statutory policy conflicts between federal and provincial authorities
 */
export function auditStatutoryHierarchyConflict(params = {}) {
  const safeParams = (params && typeof params === 'object') ? params : {};
  const {
    federalRule,
    provincialRule,
    subjectMatter = 'immigration_and_work'
  } = safeParams;
  const issues = [];
  let prevailingAuthority = 'FEDERAL_PARAMOUNTCY';

  // Immigration doctrine: Under Constitution Act 1867 s. 95, Immigration is shared jurisdiction
  // with federal paramountcy where operational conflict exists.
  if (subjectMatter === 'immigration_and_work') {
    if (federalRule?.allowsWork && provincialRule?.barsEmployment) {
      issues.push({
        conflictType: 'FEDERAL_PARAMOUNTCY_IN_IMMIGRATION',
        constitutionalBasis: 'Constitution Act, 1867, s. 95',
        finding: 'Federal work authorization under IRPR s. 186/200 overrides provincial administrative restrictions on general work rights.',
        prevailingStandard: federalRule
      });
    }
  }

  // Healthcare portability: Canada Health Act s. 11
  if (subjectMatter === 'healthcare') {
    if (provincialRule?.waitingPeriodDays > 90) {
      issues.push({
        conflictType: 'CANADA_HEALTH_ACT_PORTABILITY_BREACH',
        constitutionalBasis: 'Canada Health Act (R.S.C., 1985, c. C-6), s. 11(1)',
        finding: 'Provincial waiting period exceeds the maximum 3-month statutory ceiling mandated by federal Canada Health Act portability standards.',
        remedy: 'Previous province of residence must continue covering the resident during the transitional waiting period.'
      });
    }
  }

  return {
    subjectMatter,
    hasConflict: issues.length > 0,
    conflicts: issues,
    prevailingAuthority,
    constitutionalDoctrine: 'Doctrine of Federal Paramountcy applies where federal and provincial legislation directly conflict.'
  };
}
