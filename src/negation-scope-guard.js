// Negation & Scope Guard for Newcomer Statutory Inquiries (Rec 7)
// Accurately recognizes negative clauses ("without a job", "not a permanent resident", "no credit history")
// to prevent false-positive eligibility assertions and ensure appropriate statutory rights are surfaced.

export const NEGATION_PATTERNS = [
  {
    key: 'no_job',
    regex: /\b(?:without\s+(?:a\s+)?job|no\s+job|not\s+employed|unemployed|zero\s+income|no\s+income|without\s+employment|unemployed\s+newcomer)\b/i,
    facet: 'unemployed',
    statutoryBasis: 'Bank Act (SC 1991, c. 46) s. 448.1; FCAC Access to Basic Banking Regulations',
    rightsSummary: 'Federal law strictly prohibits banks from refusing account opening due to lack of employment. Valid ID and standard KYC verification are sufficient.'
  },
  {
    key: 'no_pr',
    regex: /\b(?:not\s+a\s+p(?:ermanent\s+)?r(?:esident)?|without\s+pr|no\s+pr|not\s+a\s+citizen|temporary\s+resident|work\s+permit\s+holder|student\s+visa|visitor\s+status)\b/i,
    facet: 'temporary_resident',
    statutoryBasis: 'IRPA (SC 2001, c. 27) s. 22; IRPR Part 9',
    rightsSummary: 'Temporary residents possess valid temporary legal status under IRPA. Work permit holders and eligible study permit holders retain statutory employment rights under provincial labour standards.'
  },
  {
    key: 'no_credit',
    regex: /\b(?:no\s+credit(?:\s+history)?|without\s+credit|zero\s+credit|newcomer\s+credit|bad\s+credit|unestablished\s+credit)\b/i,
    facet: 'no_credit',
    statutoryBasis: 'Ontario Human Rights Code RSO 1990, c. H.19 s. 2(1); OHRC Policy on Human Rights and Rental Housing',
    rightsSummary: 'Landlords cannot reject rental applicants solely due to lack of Canadian credit history or lack of Canadian rental references. Alternative proof of income or banking confirmation must be evaluated.'
  },
  {
    key: 'no_guarantor',
    regex: /\b(?:(?:no|without|zero|lack\s+of)\s+(?:[a-z\s]+?\s+)?(?:guarantor|co[- ]signer)|cannot\s+provide\s+(?:a\s+)?(?:guarantor|co[- ]signer)|can't\s+get\s+(?:a\s+)?(?:guarantor|co[- ]signer)|no\s+guarantor|no\s+co[- ]signer)\b/i,
    facet: 'no_guarantor',
    statutoryBasis: 'Residential Tenancies Act, 2006 (SO 2006, c. 17) Part II; LTB Interpretation Guideline 1',
    rightsSummary: 'Guarantors and local Canadian co-signers cannot be made an arbitrary mandatory condition for housing if applicant can demonstrate ability to pay rent lawfully.'
  },
  {
    key: 'no_status',
    regex: /\b(?:without\s+status|undocumented|out\s+of\s+status|expired\s+permit|status\s+lost|overstay(?:ed)?)\b/i,
    facet: 'without_status',
    statutoryBasis: 'IRPA s. 182 (Restoration of Status); Municipal Sanctuary Policies',
    rightsSummary: 'Temporary residents within 90 days of permit expiry may apply for restoration under IRPA s. 182. Basic municipal services, community health clinics, and emergency medical care remain accessible.'
  }
];

export function parseNegationScopeGuards(question) {
  if (!question || typeof question !== 'string') {
    return {
      negations: [],
      scopeGuards: {
        hasJob: true,
        hasPR: true,
        hasCredit: true,
        hasGuarantor: true,
        hasStatus: true
      },
      matchedAlerts: []
    };
  }

  const negations = [];
  const scopeGuards = {
    hasJob: true,
    hasPR: true,
    hasCredit: true,
    hasGuarantor: true,
    hasStatus: true
  };
  const matchedAlerts = [];

  for (const item of NEGATION_PATTERNS) {
    if (item.regex.test(question)) {
      negations.push(item.key);
      if (item.key === 'no_job') scopeGuards.hasJob = false;
      if (item.key === 'no_pr') scopeGuards.hasPR = false;
      if (item.key === 'no_credit') scopeGuards.hasCredit = false;
      if (item.key === 'no_guarantor') scopeGuards.hasGuarantor = false;
      if (item.key === 'no_status') scopeGuards.hasStatus = false;
      matchedAlerts.push({
        key: item.key,
        facet: item.facet,
        statutoryBasis: item.statutoryBasis,
        rightsSummary: item.rightsSummary
      });
    }
  }

  return {
    negations,
    scopeGuards,
    matchedAlerts
  };
}

export function filterByNegationScope(records, scopeGuards) {
  if (!records || !Array.isArray(records)) return [];
  if (!scopeGuards) return records;

  return records.filter(r => {
    // If user has no job, exclude records that strictly mandate active local employment proof
    if (scopeGuards.hasJob === false && r.requiresEmployment === true) {
      return false;
    }
    // If user is not PR, exclude records that strictly require permanent resident status
    if (scopeGuards.hasPR === false && r.requiresPR === true) {
      return false;
    }
    return true;
  });
}
